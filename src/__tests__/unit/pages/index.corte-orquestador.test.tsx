// 🤖 [IA] - v1.1.0: Integration test — CorteOrquestador branch in Index.tsx (DIRM V2 Task 5)
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Index from '@/pages/Index';

// ---------------------------------------------------------------------------
// Supabase mock (no active session → triggers CorteOrquestador path)
// ---------------------------------------------------------------------------

const supabaseMocks = vi.hoisted(() => {
  const maybeSingleMock = vi.fn();
  const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const orderMock = vi.fn(() => ({ limit: limitMock }));
  const inMock = vi.fn(() => ({ order: orderMock }));
  const selectMock = vi.fn(() => ({ in: inMock }));
  const cortesMock = vi.fn(() => ({ select: selectMock }));

  return { maybeSingleMock, cortesMock };
});

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  tables: { cortes: supabaseMocks.cortesMock },
}));

// ---------------------------------------------------------------------------
// Presentational mocks
// ---------------------------------------------------------------------------

vi.mock('@/components/operation-selector/OperationSelector', () => ({
  OperationSelector: ({ onSelectMode }: { onSelectMode: (mode: 'cash_cut' | 'cash_count') => void }) => (
    <div data-testid="operation-selector">
      <button type="button" data-testid="open-cash-cut" onClick={() => onSelectMode('cash_cut')}>
        Abrir Corte
      </button>
    </div>
  ),
}));

// Wizard mock — calls onComplete immediately with test data when rendered
const mockOnComplete = vi.fn();

vi.mock('@/components/InitialWizardModal', () => ({
  default: ({ isOpen, onComplete }: { isOpen: boolean; onComplete: (data: Record<string, unknown>) => void }) => {
    if (!isOpen) return null;
    // Expose onComplete for manual triggering from tests
    mockOnComplete.mockImplementation(onComplete);
    return (
      <div data-testid="initial-wizard">
        <button
          type="button"
          data-testid="wizard-complete"
          onClick={() =>
            onComplete({
              selectedStore: 'suc-001',
              selectedCashier: 'WizardCajero',
              selectedWitness: 'WizardTestigo',
              expectedSales: '500.00',
              dailyExpenses: [],
            })
          }
        >
          Complete Wizard
        </button>
      </div>
    );
  },
}));

vi.mock('@/components/morning-count/MorningCountWizard', () => ({
  MorningCountWizard: () => null,
}));

// CorteOrquestador mock — renders with data-testid and forwarded props
vi.mock('@/components/corte/CorteOrquestador', () => ({
  default: (props: Record<string, unknown>) => (
    <div
      data-testid="corte-orquestador"
      data-sucursal-id={String(props.sucursalId)}
      data-venta-esperada={String(props.ventaEsperada ?? '')}
    >
      <button
        type="button"
        data-testid="corte-confirmar"
        onClick={() => {
          const onCorteIniciado = props.onCorteIniciado as (corte: {
            id: string;
            cajero: string;
            testigo: string;
            sucursal_id: string;
          }) => void;
          onCorteIniciado({
            id: 'corte-uuid-test',
            cajero: 'CorteCajero',
            testigo: 'CorteTestigo',
            sucursal_id: 'suc-001',
          });
        }}
      >
        Confirmar Corte
      </button>
      <button
        type="button"
        data-testid="corte-cancelar"
        onClick={() => {
          const onCancelar = props.onCancelar as () => void;
          onCancelar();
        }}
      >
        Cancelar
      </button>
    </div>
  ),
}));

vi.mock('@/components/CashCounter', () => ({
  default: (props: Record<string, unknown>) => (
    <div
      data-testid="cash-counter"
      data-cashier={String(props.initialCashier)}
      data-witness={String(props.initialWitness)}
    >
      CashCounter
    </div>
  ),
}));

vi.mock('@/components/deliveries/DeliveryDashboardWrapper', () => ({
  DeliveryDashboardWrapper: () => <div data-testid="delivery-page">DeliveryDashboardWrapper</div>,
}));

vi.mock('@/hooks/useCorteSesion', () => ({
  useCorteSesion: () => ({
    iniciarCorte: vi.fn().mockResolvedValue(undefined),
    guardarProgreso: vi.fn().mockResolvedValue(undefined),
    error: null,
  }),
}));

// ---------------------------------------------------------------------------
// Suite G — Index.tsx CorteOrquestador integration
// ---------------------------------------------------------------------------

describe('Index — Suite G: CorteOrquestador integration', () => {
  it('G1: CASH_CUT wizard complete (no active session) → CorteOrquestador renders with correct props', async () => {
    supabaseMocks.maybeSingleMock.mockResolvedValue({ data: null, error: null });
    const user = userEvent.setup();
    render(<Index />);

    // Step 1: Select CASH_CUT
    await user.click(screen.getByTestId('open-cash-cut'));

    // Step 2: Wizard appears
    const wizard = await screen.findByTestId('initial-wizard');
    expect(wizard).toBeInTheDocument();

    // Step 3: Complete wizard → CorteOrquestador should appear
    await user.click(screen.getByTestId('wizard-complete'));

    const corte = await screen.findByTestId('corte-orquestador');
    expect(corte).toBeInTheDocument();
    expect(corte.getAttribute('data-sucursal-id')).toBe('suc-001');
    expect(corte.getAttribute('data-venta-esperada')).toBe('500');

    // Wizard and CashCounter should NOT be visible
    expect(screen.queryByTestId('initial-wizard')).not.toBeInTheDocument();
    expect(screen.queryByTestId('cash-counter')).not.toBeInTheDocument();
  });

  it('G2: CorteOrquestador onCorteIniciado → CashCounter renders with corte cajero/testigo', async () => {
    supabaseMocks.maybeSingleMock.mockResolvedValue({ data: null, error: null });
    const user = userEvent.setup();
    render(<Index />);

    // Navigate to CorteOrquestador
    await user.click(screen.getByTestId('open-cash-cut'));
    await user.click(await screen.findByTestId('wizard-complete'));
    await screen.findByTestId('corte-orquestador');

    // Confirm corte → CashCounter should render
    await user.click(screen.getByTestId('corte-confirmar'));

    const counter = await screen.findByTestId('cash-counter');
    expect(counter).toBeInTheDocument();

    // CashCounter receives cajero/testigo from corte, NOT from wizard
    expect(counter.getAttribute('data-cashier')).toBe('CorteCajero');
    expect(counter.getAttribute('data-witness')).toBe('CorteTestigo');

    // CorteOrquestador should be gone
    expect(screen.queryByTestId('corte-orquestador')).not.toBeInTheDocument();
  });

  it('G3: CorteOrquestador onCancelar → returns to wizard', async () => {
    supabaseMocks.maybeSingleMock.mockResolvedValue({ data: null, error: null });
    const user = userEvent.setup();
    render(<Index />);

    // Navigate to CorteOrquestador
    await user.click(screen.getByTestId('open-cash-cut'));
    await user.click(await screen.findByTestId('wizard-complete'));
    await screen.findByTestId('corte-orquestador');

    // Cancel → should return to wizard
    await user.click(screen.getByTestId('corte-cancelar'));

    await waitFor(() => {
      expect(screen.queryByTestId('corte-orquestador')).not.toBeInTheDocument();
    });
    expect(await screen.findByTestId('initial-wizard')).toBeInTheDocument();
  });

  it('G4: DELIVERY_VIEW mode is unaffected (regression guard)', async () => {
    supabaseMocks.maybeSingleMock.mockResolvedValue({ data: null, error: null });
    render(<Index />);

    // DELIVERY_VIEW should NOT show CorteOrquestador — verify mode isolation
    expect(screen.queryByTestId('corte-orquestador')).not.toBeInTheDocument();
    expect(screen.queryByTestId('delivery-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('operation-selector')).toBeInTheDocument();
  });
});
