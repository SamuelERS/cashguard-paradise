// [IA] - v3.4.x ORDEN #24 TDD RED M1+M2: testigo → initialWitness y skipWizard=true al reanudar
// [IA] - v3.4.x ORDEN #26 TDD RED M4: datos_conteo → initialCashCount + initialElectronicPayments al reanudar
// [IA] - v3.4.x ORDEN #28 TDD RED M6: datos_conteo.gastos_dia.items → initialDailyExpenses al reanudar
// R3-B1: Tests 1-5 GREEN | R4-M1+M2: Tests 6-8 GREEN | R5-M4: Tests 9-12 GREEN | R6-M6: Test 13 DEBE FALLAR (RED). Test 14 guard.
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Index from '@/pages/Index';
// 🤖 [IA] - ORDEN #26 M4: tipos para tipar props del mock CashCounter (zero-any policy)
import type { CashCount, ElectronicPayments } from '@/types/cash';
import type { DailyExpense } from '@/types/expenses';

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
    initialWitness,          // 🤖 [IA] - ORDEN #24 M1: capturar para Test 6
    skipWizard,              // 🤖 [IA] - ORDEN #24 M2: capturar para Test 7
    initialCashCount,        // 🤖 [IA] - ORDEN #26 M4: capturar conteo parcial para Test 9
    initialElectronicPayments, // 🤖 [IA] - ORDEN #26 M4: capturar pagos electrónicos para Test 10
    initialDailyExpenses,    // 🤖 [IA] - ORDEN #26 M4: capturar gastos del día (M5 futuro)
  }: {
    initialStore?: string;
    initialCashier?: string;
    initialExpectedSales?: string;
    initialWitness?: string;
    skipWizard?: boolean;
    initialCashCount?: CashCount;
    initialElectronicPayments?: ElectronicPayments;
    initialDailyExpenses?: DailyExpense[];
  }) => (
    <div
      data-testid="cash-counter"
      data-initial-store={initialStore || ''}
      data-initial-cashier={initialCashier || ''}
      data-initial-expected-sales={initialExpectedSales || ''}
      data-initial-witness={initialWitness || ''}
      data-skip-wizard={skipWizard ? 'true' : 'false'}
      data-initial-cash-count={JSON.stringify(initialCashCount ?? {})}
      data-initial-electronic-payments={JSON.stringify(initialElectronicPayments ?? {})}
      data-initial-daily-expenses={JSON.stringify(initialDailyExpenses ?? [])}
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

// 🤖 [IA] - ORDEN #26 M4: datos de conteo parcial guardado en Supabase (campo datos_conteo)
const mockDatosConteo = {
  conteo_parcial: {
    penny: 10, nickel: 5, dime: 3, quarter: 8, dollarCoin: 0,
    bill1: 2, bill5: 1, bill10: 0, bill20: 0, bill50: 0, bill100: 0,
  },
  pagos_electronicos: { credomatic: 15.50, promerica: 0, bankTransfer: 25.00, paypal: 0 },
  gastos_dia: null,
};

const mockCorteActivo = {
  id: 'corte-test-1',
  sucursal_id: 'suc-test-1',
  correlativo: 'CRT-2025-001',
  created_at: '2025-02-18T10:00:00Z',
  cajero: 'Juan Pérez',
  testigo: 'María García', // 🤖 [IA] - ORDEN #24 M1: campo requerido para Test 6
  estado: 'INICIADO',
  venta_esperada: 500,
  datos_conteo: mockDatosConteo, // 🤖 [IA] - ORDEN #26 M4: progreso guardado en Supabase
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

// ── ORDEN #24: R4-M1+M2 — testigo y skipWizard al reanudar ────────────────────

describe('R4-M1+M2: testigo y skipWizard al reanudar sesión', () => {
  // ── Test 6 (RED — M1) ──────────────────────────────────────────────────────

  it('CashCounter recibe initialWitness del testigo de la sesión activa', async () => {
    const { user } = await renderWithActiveSession();

    await user.click(screen.getByTestId('resume-session-btn'));

    // RED: handleResumeSession actual pone selectedWitness: '' (cadena vacía),
    // pero debe pasar corte.testigo ('María García') para que hasInitialData sea
    // true en useCashCounterOrchestrator y la fase de conteo arranque directamente.
    const counter = await screen.findByTestId('cash-counter');
    expect(counter.getAttribute('data-initial-witness')).toBe('María García');
  });

  // ── Test 7 (RED — M2) ──────────────────────────────────────────────────────

  it('CashCounter recibe skipWizard=true al reanudar sesión activa', async () => {
    const { user } = await renderWithActiveSession();

    await user.click(screen.getByTestId('resume-session-btn'));

    // RED: Index.tsx no pasa skipWizard al CashCounter en el flujo de reanudación.
    // En GREEN deberá pasar skipWizard={true} para omitir instrucciones guiadas
    // cuando los datos vienen de una sesión Supabase preexistente.
    const counter = await screen.findByTestId('cash-counter');
    expect(counter.getAttribute('data-skip-wizard')).toBe('true');
  });

  // ── Test 8 (guard — degradación elegante con testigo vacío) ────────────────

  it('CashCounter renderiza sin crash cuando testigo es cadena vacía en Supabase', async () => {
    // Supabase devuelve un corte con testigo vacío (dato incompleto en BD)
    corteSesionMocks.recuperarSesionMock.mockResolvedValueOnce({
      ...mockCorteActivo,
      testigo: '',
    });

    const { user } = await renderWithActiveSession();

    await user.click(screen.getByTestId('resume-session-btn'));

    // GUARD: incluso con testigo vacío, CashCounter debe renderizarse sin crash.
    // data-initial-witness debe ser '' (no undefined, no null).
    const counter = await screen.findByTestId('cash-counter');
    expect(counter).toBeInTheDocument();
    expect(counter.getAttribute('data-initial-witness')).toBe('');
  });
});

// ── ORDEN #26: R5-M4 — datos_conteo al reanudar ───────────────────────────────

describe('R5-M4: datos_conteo — conteo parcial y pagos electrónicos al reanudar', () => {
  // ── Test 9 (RED — M4 conteo parcial) ───────────────────────────────────────

  it('CashCounter recibe initialCashCount del conteo_parcial guardado en Supabase', async () => {
    const { user } = await renderWithActiveSession();

    await user.click(screen.getByTestId('resume-session-btn'));

    // RED: handleResumeSession no extrae datos_conteo.conteo_parcial actualmente.
    // En GREEN deberá parsear datos_conteo y pasar initialCashCount al CashCounter
    // para que el usuario retome el conteo desde donde lo dejó.
    const counter = await screen.findByTestId('cash-counter');
    const parsed = JSON.parse(
      counter.getAttribute('data-initial-cash-count') ?? '{}',
    ) as CashCount;
    expect(parsed.penny).toBe(mockDatosConteo.conteo_parcial.penny);    // 10
    expect(parsed.bill1).toBe(mockDatosConteo.conteo_parcial.bill1);    // 2
  });

  // ── Test 10 (RED — M4 pagos electrónicos) ──────────────────────────────────

  it('CashCounter recibe initialElectronicPayments de los pagos guardados en Supabase', async () => {
    const { user } = await renderWithActiveSession();

    await user.click(screen.getByTestId('resume-session-btn'));

    // RED: handleResumeSession no extrae datos_conteo.pagos_electronicos actualmente.
    // En GREEN deberá parsear datos_conteo y pasar initialElectronicPayments al CashCounter.
    const counter = await screen.findByTestId('cash-counter');
    const parsed = JSON.parse(
      counter.getAttribute('data-initial-electronic-payments') ?? '{}',
    ) as ElectronicPayments;
    expect(parsed.credomatic).toBe(
      mockDatosConteo.pagos_electronicos.credomatic,   // 15.50
    );
    expect(parsed.bankTransfer).toBe(
      mockDatosConteo.pagos_electronicos.bankTransfer, // 25.00
    );
  });

  // ── Test 11 (guard — datos_conteo null) ────────────────────────────────────

  it('CashCounter no crashea cuando datos_conteo es null en la sesión activa', async () => {
    corteSesionMocks.recuperarSesionMock.mockResolvedValueOnce({
      ...mockCorteActivo,
      datos_conteo: null,
    });

    const { user } = await renderWithActiveSession();

    await user.click(screen.getByTestId('resume-session-btn'));

    // GUARD: datos_conteo=null → CashCounter debe renderizarse sin crash.
    // El mock expone '{}' en data-initial-cash-count cuando initialCashCount es undefined.
    const counter = await screen.findByTestId('cash-counter');
    expect(counter).toBeInTheDocument();
    expect(counter.getAttribute('data-initial-cash-count')).not.toBeNull();
  });

  // ── Test 12 (guard — datos_conteo estructura inesperada) ───────────────────

  it('CashCounter no crashea cuando datos_conteo tiene estructura inesperada', async () => {
    corteSesionMocks.recuperarSesionMock.mockResolvedValueOnce({
      ...mockCorteActivo,
      datos_conteo: { basura: 123 },
    });

    const { user } = await renderWithActiveSession();

    await user.click(screen.getByTestId('resume-session-btn'));

    // GUARD: datos corruptos → type guards defensivos (ORDEN #27) devolverán undefined →
    // CashCounter recibe defaults vacíos sin crash.
    const counter = await screen.findByTestId('cash-counter');
    expect(counter).toBeInTheDocument();
  });
});

// 🤖 [IA] - ORDEN #28 TDD RED M6: gastos_dia extraction
// Index.tsx hoy tiene `dailyExpenses: []` hardcoded → Test 13 DEBE FALLAR (RED).
// Test 14 es guard (puede GREEN antes de la implementación).
describe('R6-M6: gastos_dia — gastos del día al reanudar', () => {
  it('Test 13 — CashCounter recibe initialDailyExpenses de datos_conteo.gastos_dia.items', async () => {
    const mockGasto: DailyExpense = {
      id: 'gasto-1',
      concept: 'Reparación bomba de agua',
      amount: 25.00,
      category: 'maintenance', // 🤖 [IA] - ORDEN #28: 'operational' ya no es una categoría válida (v2.5 → 'maintenance')
      hasInvoice: true,
      timestamp: '2025-02-18T10:30:00Z',
    };
    // Nota: useCorteSesion auto-llama recuperarSesion en su useEffect cuando sucursal_id es truthy
    // (línea ~560 de useCorteSesion.ts). Por eso usamos mockResolvedValue (no Once) para que
    // AMBAS llamadas (auto-call + manual handleResumeSession) reciban el valor correcto.
    corteSesionMocks.recuperarSesionMock.mockResolvedValue({
      ...mockCorteActivo,
      datos_conteo: {
        ...mockDatosConteo,
        gastos_dia: { items: [mockGasto] },
      },
    });

    const { user } = await renderWithActiveSession();
    await user.click(screen.getByTestId('resume-session-btn'));

    const counter = await screen.findByTestId('cash-counter');
    const parsed = JSON.parse(
      counter.getAttribute('data-initial-daily-expenses') ?? '[]',
    ) as DailyExpense[];

    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe('gasto-1');
    expect(parsed[0].amount).toBe(25.00);
  });

  it('Test 14 — CashCounter recibe array vacío cuando datos_conteo.gastos_dia es null (guard)', async () => {
    // mockCorteActivo.datos_conteo.gastos_dia ya es null → comportamiento actual (hardcoded []) coincide
    const { user } = await renderWithActiveSession();
    await user.click(screen.getByTestId('resume-session-btn'));

    const counter = await screen.findByTestId('cash-counter');
    const parsed = JSON.parse(
      counter.getAttribute('data-initial-daily-expenses') ?? '[]',
    ) as DailyExpense[];

    expect(parsed).toHaveLength(0);
  });
});
