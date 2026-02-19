// [IA] - R3-B1 TDD RED: Tests para "reanudar sesión salta wizard directamente a CashCounter"
// Opción A: Saltar wizard completo, ir directo a CashCounter con datos de sesión activa.
// Tests 1-4 DEBEN FALLAR con el código actual. Test 5 PUEDE PASAR (guard).
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Index from '@/pages/Index';

// ── Mocks con vi.hoisted() ────────────────────────────────────────────────────

const supabaseMocks = vi.hoisted(() => {
  const maybeSingleMock = vi.fn();
  const limitMock = vi.fn();
  const orderMock = vi.fn();
  const inMock = vi.fn();
  const selectMock = vi.fn();
  const cortesMock = vi.fn();
  return { maybeSingleMock, limitMock, orderMock, inMock, selectMock, cortesMock };
});

const corteSesionMocks = vi.hoisted(() => ({
  iniciarCorteMock: vi.fn(),
  guardarProgresoMock: vi.fn(),
  abortarCorteMock: vi.fn(),
  recuperarSesionMock: vi.fn(),
}));

const toastMocks = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
}));

// ── vi.mock registrations ─────────────────────────────────────────────────────

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  tables: {
    cortes: supabaseMocks.cortesMock,
  },
}));

vi.mock('@/hooks/useCorteSesion', () => ({
  useCorteSesion: () => ({
    iniciarCorte: corteSesionMocks.iniciarCorteMock,
    guardarProgreso: corteSesionMocks.guardarProgresoMock,
    abortarCorte: corteSesionMocks.abortarCorteMock,
    recuperarSesion: corteSesionMocks.recuperarSesionMock,
    error: null,
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: toastMocks.success,
    error: toastMocks.error,
  },
}));

vi.mock('@/components/operation-selector/OperationSelector', () => ({
  OperationSelector: ({
    onSelectMode,
  }: {
    onSelectMode: (mode: 'cash_cut' | 'cash_count') => void;
  }) => (
    <div data-testid="operation-selector">
      <button
        type="button"
        data-testid="open-cash-cut"
        onClick={() => onSelectMode('cash_cut')}
      >
        Abrir Corte
      </button>
    </div>
  ),
}));

vi.mock('@/components/InitialWizardModal', () => ({
  default: ({
    isOpen,
    initialSucursalId,
    hasActiveSession,
    onResumeSession,
  }: {
    isOpen: boolean;
    initialSucursalId?: string | null;
    hasActiveSession?: boolean;
    onResumeSession?: () => void;
  }) =>
    isOpen ? (
      <div
        data-testid="initial-wizard"
        data-initial-sucursal-id={initialSucursalId || ''}
      >
        InitialWizardModal
        {hasActiveSession && onResumeSession && (
          <button
            type="button"
            data-testid="resume-session-btn"
            onClick={onResumeSession}
          >
            Reanudar sesión
          </button>
        )}
      </div>
    ) : null,
}));

vi.mock('@/components/morning-count/MorningCountWizard', () => ({
  MorningCountWizard: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="morning-wizard">MorningCountWizard</div> : null,
}));

vi.mock('@/components/CashCounter', () => ({
  default: ({
    initialStore,
    initialCashier,
    initialExpectedSales,
  }: {
    initialStore?: string;
    initialCashier?: string;
    initialExpectedSales?: string;
  }) => (
    <div
      data-testid="cash-counter"
      data-initial-store={initialStore || ''}
      data-initial-cashier={initialCashier || ''}
      data-initial-expected-sales={initialExpectedSales || ''}
    >
      CashCounter
    </div>
  ),
}));

vi.mock('@/components/deliveries/DeliveryDashboardWrapper', () => ({
  DeliveryDashboardWrapper: () => (
    <div data-testid="delivery-page">DeliveryDashboardWrapper</div>
  ),
}));

// ── Constante de sesión activa ────────────────────────────────────────────────

const mockCorteActivo = {
  id: 'corte-test-1',
  sucursal_id: 'suc-test-1',
  correlativo: 'CRT-2025-001',
  created_at: '2025-02-18T10:00:00Z',
  cajero: 'Juan Pérez',
  estado: 'INICIADO',
  venta_esperada: 500,
};

// ── beforeEach ────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.resetAllMocks();
  // Restaurar cadena Supabase (resetAllMocks limpia todas las implementaciones vi.fn())
  supabaseMocks.cortesMock.mockReturnValue({ select: supabaseMocks.selectMock });
  supabaseMocks.selectMock.mockReturnValue({ in: supabaseMocks.inMock });
  supabaseMocks.inMock.mockReturnValue({ order: supabaseMocks.orderMock });
  supabaseMocks.orderMock.mockReturnValue({ limit: supabaseMocks.limitMock });
  supabaseMocks.limitMock.mockReturnValue({ maybeSingle: supabaseMocks.maybeSingleMock });
  // Restaurar implementaciones por defecto de corteSesion
  corteSesionMocks.iniciarCorteMock.mockResolvedValue(undefined);
  corteSesionMocks.guardarProgresoMock.mockResolvedValue(undefined);
  corteSesionMocks.abortarCorteMock.mockResolvedValue(undefined);
  corteSesionMocks.recuperarSesionMock.mockResolvedValue(mockCorteActivo);
});

// ── Helper: renderiza Index con sesión activa detectada ───────────────────────

async function renderWithActiveSession() {
  supabaseMocks.maybeSingleMock.mockResolvedValueOnce({
    data: mockCorteActivo,
    error: null,
  });

  const user = userEvent.setup();
  render(<Index />);

  await user.click(screen.getByTestId('open-cash-cut'));

  // Esperar a que el wizard aparezca (la consulta Supabase es async)
  await screen.findByTestId('initial-wizard');

  return { user };
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('R3-B1: Index — reanudar sesión salta wizard directamente a CashCounter', () => {
  // ── Test 1 ─────────────────────────────────────────────────────────────────

  it('llama a recuperarSesion al presionar Reanudar', async () => {
    const { user } = await renderWithActiveSession();

    await user.click(screen.getByTestId('resume-session-btn'));

    // FALLA: handleResumeSession actual solo llama setHasActiveCashCutSession(false),
    // sin invocar recuperarSesion.
    // En GREEN, deberá llamar a recuperarSesion() para obtener datos de la sesión.
    expect(corteSesionMocks.recuperarSesionMock).toHaveBeenCalledOnce();
  });

  // ── Test 2 ─────────────────────────────────────────────────────────────────

  it('el wizard desaparece y CashCounter aparece al reanudar', async () => {
    const { user } = await renderWithActiveSession();

    await user.click(screen.getByTestId('resume-session-btn'));

    // FALLA: el wizard permanece visible y CashCounter nunca aparece (flujo actual).
    // En GREEN, reanudar saltará el wizard y mostrará CashCounter directamente.
    await screen.findByTestId('cash-counter');
    expect(screen.queryByTestId('initial-wizard')).not.toBeInTheDocument();
  });

  // ── Test 3 ─────────────────────────────────────────────────────────────────

  it('CashCounter recibe sucursal, cajero y ventas esperadas de la sesión activa', async () => {
    const { user } = await renderWithActiveSession();

    await user.click(screen.getByTestId('resume-session-btn'));

    // FALLA: CashCounter nunca aparece, por lo que no existen los data attributes.
    // En GREEN, CashCounter recibirá sucursal_id, cajero y venta_esperada de la sesión.
    const counter = await screen.findByTestId('cash-counter');
    expect(counter.getAttribute('data-initial-store')).toBe('suc-test-1');
    expect(counter.getAttribute('data-initial-cashier')).toBe('Juan Pérez');
    expect(counter.getAttribute('data-initial-expected-sales')).toBe('500');
  });

  // ── Test 4 ─────────────────────────────────────────────────────────────────

  it('muestra toast.error y mantiene el wizard si recuperarSesion falla', async () => {
    corteSesionMocks.recuperarSesionMock.mockRejectedValueOnce(
      new Error('Supabase error'),
    );

    const { user } = await renderWithActiveSession();

    await user.click(screen.getByTestId('resume-session-btn'));

    // FALLA: recuperarSesion nunca se llama, no hay fallo, toast.error no se dispara.
    // En GREEN: fallo de recuperarSesion → toast.error + wizard permanece visible.
    await waitFor(() => expect(toastMocks.error).toHaveBeenCalled());
    expect(screen.getByTestId('initial-wizard')).toBeInTheDocument();
  });

  // ── Test 5 (guard) ─────────────────────────────────────────────────────────

  it('iniciarCorte NO es llamado al reanudar (sesión ya existe en Supabase)', async () => {
    const { user } = await renderWithActiveSession();

    await user.click(screen.getByTestId('resume-session-btn'));

    // GUARD: al reanudar una sesión existente, no debe crearse una nueva.
    // PUEDE PASAR en RED (el flujo actual tampoco llama iniciarCorte al reanudar).
    expect(corteSesionMocks.iniciarCorteMock).not.toHaveBeenCalled();
  });
});
