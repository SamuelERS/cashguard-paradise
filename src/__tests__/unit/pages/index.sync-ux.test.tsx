// 🤖 [IA] - DACC-CIERRE-SYNC-UX: Tests persistencia Supabase + sync visual
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Index from '@/pages/Index';

// --- Hoisted mocks ---

const supabaseMocks = vi.hoisted(() => {
  const maybeSingleMock = vi.fn();
  const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const orderMock = vi.fn(() => ({ limit: limitMock }));
  const inMock = vi.fn(() => ({ order: orderMock }));
  const selectMock = vi.fn(() => ({ in: inMock }));
  const cortesMock = vi.fn(() => ({ select: selectMock }));

  return {
    maybeSingleMock,
    cortesMock,
  };
});

const corteSesionMocks = vi.hoisted(() => ({
  iniciarCorte: vi.fn<[], Promise<void>>().mockResolvedValue(undefined),
  guardarProgreso: vi.fn<[], Promise<void>>().mockResolvedValue(undefined),
  error: null as string | null,
  // 🤖 [IA] - DACC-R2 Gap 3: Capturar sucursalId pasado a useCorteSesion
  _lastSucursalId: '' as string,
}));

// --- Module mocks ---

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  tables: {
    cortes: supabaseMocks.cortesMock,
  },
}));

vi.mock('@/hooks/useCorteSesion', () => ({
  // 🤖 [IA] - DACC-R2 Gap 3: Capturar sucursalId para verificar política de sucursal
  useCorteSesion: (sucursalId: string) => {
    corteSesionMocks._lastSucursalId = sucursalId;
    return corteSesionMocks;
  },
}));

vi.mock('@/components/operation-selector/OperationSelector', () => ({
  OperationSelector: ({ onSelectMode }: { onSelectMode: (mode: 'cash_cut' | 'cash_count') => void }) => (
    <div data-testid="operation-selector">
      <button type="button" data-testid="open-cash-cut" onClick={() => onSelectMode('cash_cut')}>
        Abrir Corte
      </button>
      <button type="button" data-testid="open-cash-count" onClick={() => onSelectMode('cash_count')}>
        Abrir Conteo
      </button>
    </div>
  ),
}));

vi.mock('@/components/InitialWizardModal', () => ({
  default: ({ isOpen, onComplete, initialSucursalId }: {
    isOpen: boolean;
    onComplete: (data: {
      selectedStore: string;
      selectedCashier: string;
      selectedWitness: string;
      expectedSales: string;
      dailyExpenses: never[];
    }) => void;
    initialSucursalId?: string | null;
  }) =>
    isOpen ? (
      <div data-testid="initial-wizard" data-initial-sucursal-id={initialSucursalId || ''}>
        <button
          type="button"
          data-testid="wizard-complete"
          onClick={() => onComplete({
            selectedStore: 'store-1',
            selectedCashier: 'cashier-1',
            selectedWitness: 'witness-1',
            expectedSales: '1500',
            dailyExpenses: [],
          })}
        >
          Complete
        </button>
      </div>
    ) : null,
}));

vi.mock('@/components/morning-count/MorningCountWizard', () => ({
  MorningCountWizard: ({ isOpen, onComplete }: {
    isOpen: boolean;
    onComplete: (data: {
      selectedStore: string;
      selectedCashier: string;
      selectedWitness: string;
      expectedSales: string;
    }) => void;
  }) =>
    isOpen ? (
      <div data-testid="morning-wizard">
        <button
          type="button"
          data-testid="morning-wizard-complete"
          onClick={() => onComplete({
            selectedStore: 'store-2',
            selectedCashier: 'cashier-2',
            selectedWitness: 'witness-2',
            expectedSales: '800',
          })}
        >
          Complete Morning
        </button>
      </div>
    ) : null,
}));

// 🤖 [IA] - DACC-CIERRE-SYNC-UX: CashCounter mock captures sync props via data attributes
vi.mock('@/components/CashCounter', () => ({
  default: (props: {
    onGuardarProgreso?: (...args: unknown[]) => void;
    syncEstado?: string;
    ultimaSync?: string | null;
    syncError?: string | null;
  }) => (
    <div
      data-testid="cash-counter"
      data-has-guardar-progreso={props.onGuardarProgreso ? 'true' : 'false'}
      data-sync-estado={props.syncEstado || ''}
      data-ultima-sync={props.ultimaSync || ''}
      data-sync-error={props.syncError || ''}
    >
      CashCounter
    </div>
  ),
}));

vi.mock('@/components/deliveries/DeliveryDashboardWrapper', () => ({
  DeliveryDashboardWrapper: () => <div data-testid="delivery-page">DeliveryDashboardWrapper</div>,
}));

// --- Helper: select CASH_CUT and complete wizard ---

async function completeCashCutWizard(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByTestId('open-cash-cut'));
  await screen.findByTestId('initial-wizard');
  await user.click(screen.getByTestId('wizard-complete'));
  return screen.findByTestId('cash-counter');
}

// --- Tests ---

describe('DACC-CIERRE-SYNC-UX: Persistence & Sync UX', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    corteSesionMocks.error = null;
    // Default: no active session
    supabaseMocks.maybeSingleMock.mockResolvedValue({
      data: null,
      error: null,
    });
  });

  // 🤖 [IA] - DACC-CIERRE-SYNC-UX: iniciarCorte called on new CASH_CUT session
  it('calls iniciarCorte with wizard data on CASH_CUT completion', async () => {
    const user = userEvent.setup();
    render(<Index />);

    await completeCashCutWizard(user);

    expect(corteSesionMocks.iniciarCorte).toHaveBeenCalledOnce();
    expect(corteSesionMocks.iniciarCorte).toHaveBeenCalledWith({
      sucursal_id: 'store-1',
      cajero: 'cashier-1',
      testigo: 'witness-1',
      venta_esperada: 1500,
    });
  });

  // 🤖 [IA] - DACC-CIERRE-SYNC-UX: Skip iniciarCorte when resuming active session
  it('does NOT call iniciarCorte when an active session exists', async () => {
    supabaseMocks.maybeSingleMock.mockResolvedValueOnce({
      data: { id: 'corte-activo-1', sucursal_id: 'suc-active' },
      error: null,
    });

    const user = userEvent.setup();
    render(<Index />);

    await completeCashCutWizard(user);

    expect(corteSesionMocks.iniciarCorte).not.toHaveBeenCalled();
  });

  // 🤖 [IA] - DACC-R2 Gap 2+3: Sync props correct after successful iniciarCorte
  it('passes sync props to CashCounter for CASH_CUT', async () => {
    const user = userEvent.setup();
    render(<Index />);

    const counter = await completeCashCutWizard(user);

    expect(counter.getAttribute('data-has-guardar-progreso')).toBe('true');
    expect(counter.getAttribute('data-sync-estado')).toBe('sincronizado');
    // 🤖 [IA] - DACC-R2: ultimaSync debe tener valor tras iniciarCorte exitoso
    expect(counter.getAttribute('data-ultima-sync')).not.toBe('');
  });

  // 🤖 [IA] - DACC-CIERRE-SYNC-UX: No sync props for CASH_COUNT mode
  it('does NOT pass onGuardarProgreso for CASH_COUNT', async () => {
    const user = userEvent.setup();
    render(<Index />);

    await user.click(screen.getByTestId('open-cash-count'));
    await screen.findByTestId('morning-wizard');
    await user.click(screen.getByTestId('morning-wizard-complete'));
    const counter = await screen.findByTestId('cash-counter');

    expect(counter.getAttribute('data-has-guardar-progreso')).toBe('false');
    expect(counter.getAttribute('data-sync-estado')).toBe('');
  });

  // 🤖 [IA] - DACC-CLEANUP: Regression — wizard is ALWAYS the UX for CASH_CUT
  it('regression: CASH_CUT always opens wizard with active session', async () => {
    supabaseMocks.maybeSingleMock.mockResolvedValueOnce({
      data: { id: 'corte-activo-1', sucursal_id: 'suc-1' },
      error: null,
    });

    const user = userEvent.setup();
    render(<Index />);

    await user.click(screen.getByTestId('open-cash-cut'));
    const wizard = await screen.findByTestId('initial-wizard');

    expect(wizard).toBeInTheDocument();
  });

  // 🤖 [IA] - DACC-R2 Gap 2+3: iniciarCorte rejection → syncEstado = 'error'
  it('sets syncEstado to error when iniciarCorte rejects', async () => {
    corteSesionMocks.iniciarCorte.mockRejectedValueOnce(new Error('Supabase network error'));

    const user = userEvent.setup();
    render(<Index />);

    const counter = await completeCashCutWizard(user);

    expect(corteSesionMocks.iniciarCorte).toHaveBeenCalledOnce();
    expect(counter.getAttribute('data-sync-estado')).toBe('error');
    expect(counter.getAttribute('data-ultima-sync')).toBe('');
  });

  // 🤖 [IA] - DACC-R2 Gap 1+3: Política A — sesión activa fuerza su sucursal para sync
  it('uses active session sucursal for sync, not wizard selection (Policy A)', async () => {
    supabaseMocks.maybeSingleMock.mockResolvedValueOnce({
      data: { id: 'corte-activo-1', sucursal_id: 'suc-active-db' },
      error: null,
    });

    const user = userEvent.setup();
    render(<Index />);

    await completeCashCutWizard(user);

    // Wizard sends selectedStore='store-1' but active session has sucursal_id='suc-active-db'
    // Policy A: active session wins → sync uses 'suc-active-db'
    expect(corteSesionMocks._lastSucursalId).toBe('suc-active-db');
    // iniciarCorte NOT called because active session exists
    expect(corteSesionMocks.iniciarCorte).not.toHaveBeenCalled();
  });

  // 🤖 [IA] - DACC-R2 Gap 2+3: Successful iniciarCorte → sincronizado with ultimaSync timestamp
  it('sets sincronizado and ultimaSync after successful iniciarCorte', async () => {
    const user = userEvent.setup();
    render(<Index />);

    const counter = await completeCashCutWizard(user);

    expect(corteSesionMocks.iniciarCorte).toHaveBeenCalledOnce();
    expect(counter.getAttribute('data-sync-estado')).toBe('sincronizado');
    // ultimaSync must be a valid ISO timestamp string (not empty)
    const ultimaSync = counter.getAttribute('data-ultima-sync') ?? '';
    expect(ultimaSync).not.toBe('');
    expect(new Date(ultimaSync).getTime()).not.toBeNaN();
  });
});
