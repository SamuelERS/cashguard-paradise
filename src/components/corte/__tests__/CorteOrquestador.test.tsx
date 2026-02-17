// 🤖 [IA] - v1.1.0: Tests CorteOrquestador — Orden #009 + #013
// Integración completa: sub-componentes reales (NO mockeados), hook y CashCounter mockeados.

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CorteOrquestador } from '../CorteOrquestador';
import type { Corte, CorteIntento, Sucursal } from '../../../types/auditoria';

// ---------------------------------------------------------------------------
// Mock del hook
// ---------------------------------------------------------------------------

vi.mock('../../../hooks/useCorteSesion', () => ({
  useCorteSesion: vi.fn(),
}));
vi.mock('../../../hooks/useEmpleadosSucursal', () => ({
  useEmpleadosSucursal: vi.fn(),
}));

import { useCorteSesion } from '../../../hooks/useCorteSesion';
import { useEmpleadosSucursal } from '../../../hooks/useEmpleadosSucursal';

const mockUseCorteSesion = vi.mocked(useCorteSesion);
const mockUseEmpleadosSucursal = vi.mocked(useEmpleadosSucursal);

// ---------------------------------------------------------------------------
// Mock de CashCounter (CorteConteoAdapter lo renderiza internamente)
// ---------------------------------------------------------------------------

vi.mock('../../../components/CashCounter', () => ({
  default: vi.fn((props) => (
    <div
      data-testid="mock-cash-counter"
      data-operation-mode={props.operationMode}
      data-initial-store={props.initialStore}
      data-initial-cashier={props.initialCashier}
      data-initial-witness={props.initialWitness}
      data-initial-expected-sales={props.initialExpectedSales ?? ''}
    >
      <button data-testid="mock-back" onClick={props.onBack}>mock-back</button>
      <button data-testid="mock-cancel" onClick={props.onFlowCancel}>mock-cancel</button>
      {props.onGuardarProgreso && (
        <button
          data-testid="mock-guardar-progreso"
          onClick={() => props.onGuardarProgreso({
            fase_actual: 1,
            conteo_parcial: { penny: 5 },
            pagos_electronicos: { credomatic: 0, promerica: 0, bankTransfer: 0, paypal: 0 },
            gastos_dia: [],
          })}
        >mock-guardar</button>
      )}
    </div>
  )),
}));

import CashCounter from '../../../components/CashCounter';
import { OperationMode } from '../../../types/operation-mode';

const MockCashCounter = vi.mocked(CashCounter);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sucursalTest: Sucursal = {
  id: 'suc-001',
  nombre: 'Sucursal Central',
  codigo: 'SC',
  activa: true,
};

const sucursalesTest: Sucursal[] = [sucursalTest];

const corteActivoTest: Corte = {
  id: 'corte-001',
  correlativo: 'CORTE-2026-02-12-S-001',
  sucursal_id: 'suc-001',
  cajero: 'Juan Pérez',
  testigo: 'María López',
  estado: 'EN_PROGRESO',
  fase_actual: 1,
  intento_actual: 1,
  venta_esperada: null,
  datos_conteo: null,
  datos_entrega: null,
  datos_verificacion: null,
  datos_reporte: null,
  reporte_hash: null,
  created_at: '2026-02-12T08:00:00.000Z',
  updated_at: '2026-02-12T08:00:00.000Z',
  finalizado_at: null,
  motivo_aborto: null,
};

const intentoActivoTest: CorteIntento = {
  id: 'intento-001',
  corte_id: 'corte-001',
  attempt_number: 1,
  estado: 'ACTIVO',
  snapshot_datos: null,
  motivo_reinicio: null,
  created_at: '2026-02-12T08:00:00.000Z',
  finalizado_at: null,
};

const corteFinalizadoTest: Corte = {
  ...corteActivoTest,
  estado: 'FINALIZADO',
  fase_actual: 3,
  reporte_hash: 'abc123def456',
  finalizado_at: '2026-02-12T10:00:00.000Z',
};

const corteAbortadoTest: Corte = {
  ...corteActivoTest,
  estado: 'ABORTADO',
  motivo_aborto: 'Error en el conteo inicial',
  finalizado_at: '2026-02-12T09:30:00.000Z',
};

// ---------------------------------------------------------------------------
// Helper para configurar mock
// ---------------------------------------------------------------------------

function configurarMock(overrides: Partial<ReturnType<typeof useCorteSesion>> = {}) {
  const defaultMock = {
    estado: null,
    corte_actual: null,
    intento_actual: null,
    iniciarCorte: vi.fn().mockResolvedValue(corteActivoTest),
    guardarProgreso: vi.fn().mockResolvedValue(undefined),
    finalizarCorte: vi.fn().mockResolvedValue(corteFinalizadoTest),
    abortarCorte: vi.fn().mockResolvedValue(undefined),
    reiniciarIntento: vi.fn().mockResolvedValue(intentoActivoTest),
    recuperarSesion: vi.fn().mockResolvedValue(null),
    cargando: false,
    error: null,
    ...overrides,
  };
  mockUseCorteSesion.mockReturnValue(defaultMock);
  mockUseEmpleadosSucursal.mockReturnValue({
    empleados: [
      { id: 'emp-1', nombre: 'Tito Gomez' },
      { id: 'emp-2', nombre: 'Adonay Torres' },
    ],
    cargando: false,
    error: null,
    recargar: vi.fn().mockResolvedValue(undefined),
  });
  return defaultMock;
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks();
});

// ===========================================================================
// SUITE 1: Inicialización y Carga
// ===========================================================================

describe('Suite 1: Inicialización y Carga', () => {
  it('1.1 - Muestra spinner mientras cargando=true e inicializado=false', () => {
    configurarMock({ cargando: true });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    // Loader2 renders an SVG with animate-spin class
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('1.2 - Muestra texto "Verificando sesión de corte..." en carga', () => {
    configurarMock({ cargando: true });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(screen.getByText('Verificando sesión de corte...')).toBeInTheDocument();
  });

  it('1.3 - Después de que cargando pasa a false, deja de mostrar spinner', () => {
    // Start with cargando=true
    const mock = configurarMock({ cargando: true });
    const { rerender } = render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(screen.getByText('Verificando sesión de corte...')).toBeInTheDocument();

    // Simulate cargando becoming false
    mockUseCorteSesion.mockReturnValue({ ...mock, cargando: false });
    rerender(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(screen.queryByText('Verificando sesión de corte...')).not.toBeInTheDocument();
  });

  it('1.4 - Pasa sucursalId al hook useCorteSesion', () => {
    configurarMock();
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(mockUseCorteSesion).toHaveBeenCalledWith('suc-001');
  });

  it('1.5 - Pasa sucursalId al hook useEmpleadosSucursal', () => {
    configurarMock();
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(mockUseEmpleadosSucursal).toHaveBeenCalledWith('suc-001');
  });
});

// ===========================================================================
// SUITE 2: Vista Inicio — Sin Corte Activo
// ===========================================================================

describe('Suite 2: Vista Inicio — Sin Corte Activo', () => {
  it('2.1 - Muestra CorteInicio cuando no hay corte activo', () => {
    configurarMock({ corte_actual: null });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    // CorteInicio renders "Iniciar Corte de Caja"
    expect(screen.getByText('Iniciar Corte de Caja')).toBeInTheDocument();
  });

  it('2.2 - Muestra titulo "Iniciar Corte de Caja" del CorteInicio', () => {
    configurarMock();
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    const titulo = screen.getByText('Iniciar Corte de Caja');
    expect(titulo.tagName).toBe('H1');
  });

  // 🤖 [IA] - OT-14: Sucursal preseleccionada → wizard arranca en paso cajero
  it('2.3 - Muestra paso cajero como primer paso (sucursal preseleccionada)', () => {
    configurarMock();
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(screen.getByPlaceholderText(/nombre completo del cajero/i)).toBeInTheDocument();
  });

  // 🤖 [IA] - OT-14: Wizard de 3 pasos (cajero → testigo → venta)
  it('2.4 - Al completar wizard de inicio, llama sesion.iniciarCorte con params', async () => {
    const mock = configurarMock();
    const user = userEvent.setup();
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );

    // Paso 1: Ingresar cajero
    const cajeroInput = screen.getByPlaceholderText(/nombre completo del cajero/i);
    await user.type(cajeroInput, 'Tito Gomez');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 2: Ingresar testigo + siguiente
    const testigoInput = screen.getByPlaceholderText(/nombre completo del testigo/i);
    await user.type(testigoInput, 'Adonay Torres');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 3: Confirmar inicio (sin venta_esperada)
    await user.click(screen.getByRole('button', { name: /iniciar corte/i }));

    expect(mock.iniciarCorte).toHaveBeenCalledWith({
      sucursal_id: 'suc-001',
      cajero: 'Tito Gomez',
      testigo: 'Adonay Torres',
    });
  });

  it('2.5 - Error del hook se pasa a CorteInicio', () => {
    configurarMock({ error: 'Ya existe un corte activo' });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(screen.getByText('Ya existe un corte activo')).toBeInTheDocument();
  });
});

// ===========================================================================
// SUITE 3: Vista Reanudación — Corte Activo Detectado
// ===========================================================================

describe('Suite 3: Vista Reanudación — Corte Activo Detectado', () => {
  it('3.1 - Muestra CorteReanudacion cuando hay corte activo no terminal', () => {
    configurarMock({
      corte_actual: corteActivoTest,
      intento_actual: intentoActivoTest,
    });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(screen.getByText('Corte Activo Detectado')).toBeInTheDocument();
  });

  it('3.2 - Muestra "Corte Activo Detectado" del CorteReanudacion', () => {
    configurarMock({
      corte_actual: corteActivoTest,
      intento_actual: intentoActivoTest,
    });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    const titulo = screen.getByText('Corte Activo Detectado');
    expect(titulo.tagName).toBe('H1');
  });

  it('3.3 - Muestra correlativo del corte activo', () => {
    configurarMock({
      corte_actual: corteActivoTest,
      intento_actual: intentoActivoTest,
    });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(screen.getByText('CORTE-2026-02-12-S-001')).toBeInTheDocument();
  });

  it('3.4 - Al click "Reanudar Corte", transiciona a vista progreso con CorteConteoAdapter', async () => {
    configurarMock({
      corte_actual: corteActivoTest,
      intento_actual: intentoActivoTest,
    });
    const user = userEvent.setup();
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );

    // Click reanudar
    await user.click(screen.getByRole('button', { name: /reanudar corte/i }));

    // Should now show CorteConteoAdapter (renders mocked CashCounter)
    expect(screen.getByTestId('mock-cash-counter')).toBeInTheDocument();
  });

  it('3.5 - Al click "Nuevo Intento" con motivo, llama sesion.reiniciarIntento', async () => {
    const mock = configurarMock({
      corte_actual: corteActivoTest,
      intento_actual: intentoActivoTest,
    });
    const user = userEvent.setup();
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );

    // Toggle nuevo intento
    await user.click(screen.getByRole('button', { name: /nuevo intento/i }));

    // Type motivo (>= 10 chars)
    const textarea = screen.getByPlaceholderText(/por que reinicia/i);
    await user.type(textarea, 'Conteo erroneo necesita rehacer');

    // Confirm
    await user.click(screen.getByRole('button', { name: /confirmar nuevo intento/i }));

    expect(mock.reiniciarIntento).toHaveBeenCalledWith('Conteo erroneo necesita rehacer');
  });
});

// ===========================================================================
// SUITE 4: Vista Progreso — Corte Confirmado
// ===========================================================================

describe('Suite 4: Vista Progreso — CorteConteoAdapter', () => {
  async function renderConProgreso() {
    const mock = configurarMock({
      corte_actual: corteActivoTest,
      intento_actual: intentoActivoTest,
    });
    const user = userEvent.setup();
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    // Navigate to progreso view
    await user.click(screen.getByRole('button', { name: /reanudar corte/i }));
    return { user, mock };
  }

  it('4.1 - Renderiza CashCounter (mock) después de reanudar', async () => {
    await renderConProgreso();
    expect(screen.getByTestId('mock-cash-counter')).toBeInTheDocument();
  });

  it('4.2 - CashCounter recibe sucursalNombre como initialStore', async () => {
    await renderConProgreso();
    const counter = screen.getByTestId('mock-cash-counter');
    expect(counter.dataset.initialStore).toBe('Sucursal Central');
  });

  it('4.3 - CashCounter recibe cajero y testigo del corte', async () => {
    await renderConProgreso();
    const counter = screen.getByTestId('mock-cash-counter');
    expect(counter.dataset.initialCashier).toBe('Juan Pérez');
    expect(counter.dataset.initialWitness).toBe('María López');
  });

  it('4.4 - CashCounter recibe operationMode CASH_CUT', async () => {
    await renderConProgreso();
    const counter = screen.getByTestId('mock-cash-counter');
    expect(counter.dataset.operationMode).toBe(OperationMode.CASH_CUT);
  });

  it('4.5 - onBack de CashCounter dispara finalizarCorte', async () => {
    const { user, mock } = await renderConProgreso();
    await user.click(screen.getByTestId('mock-back'));
    expect(mock.finalizarCorte).toHaveBeenCalledTimes(1);
    const hashArg = mock.finalizarCorte.mock.calls[0][0] as string;
    expect(hashArg).toMatch(/^[a-f0-9]{64}$/);
  });
});

// ===========================================================================
// SUITE 5: Flujo de Aborto desde Progreso
// ===========================================================================

describe('Suite 5: Flujo de Aborto desde Reanudación', () => {
  function renderEnReanudacion() {
    const mock = configurarMock({
      corte_actual: corteActivoTest,
      intento_actual: intentoActivoTest,
    });
    const user = userEvent.setup();
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    // Stay in reanudacion view (do NOT click "Reanudar Corte")
    return { user, mock };
  }

  it('5.1 - Toggle del panel abortar muestra textarea', async () => {
    const { user } = renderEnReanudacion();
    await user.click(screen.getByRole('button', { name: /abortar corte/i }));
    expect(screen.getByPlaceholderText(/por que aborta/i)).toBeInTheDocument();
  });

  it('5.2 - Botón confirmar deshabilitado con motivo < 10 chars', async () => {
    const { user } = renderEnReanudacion();
    await user.click(screen.getByRole('button', { name: /abortar corte/i }));

    const textarea = screen.getByPlaceholderText(/por que aborta/i);
    await user.type(textarea, 'Corto');

    const confirmar = screen.getByRole('button', { name: /confirmar aborto/i });
    expect(confirmar).toBeDisabled();
  });

  it('5.3 - Botón confirmar habilitado con motivo >= 10 chars', async () => {
    const { user } = renderEnReanudacion();
    await user.click(screen.getByRole('button', { name: /abortar corte/i }));

    const textarea = screen.getByPlaceholderText(/por que aborta/i);
    await user.type(textarea, 'Motivo largo suficiente');

    const confirmar = screen.getByRole('button', { name: /confirmar aborto/i });
    expect(confirmar).not.toBeDisabled();
  });

  it('5.4 - Al confirmar aborto, preserva corte y muestra resumen ABORTADO', async () => {
    const { user, mock } = renderEnReanudacion();

    await user.click(screen.getByRole('button', { name: /abortar corte/i }));

    const textarea = screen.getByPlaceholderText(/por que aborta/i);
    await user.type(textarea, 'Error detectado en el conteo');

    await user.click(screen.getByRole('button', { name: /confirmar aborto/i }));

    await waitFor(() => {
      expect(mock.abortarCorte).toHaveBeenCalledWith('Error detectado en el conteo');
    });

    // Should show resumen after abort
    await waitFor(() => {
      expect(screen.getByText('Corte Abortado')).toBeInTheDocument();
    });
  });

  it('5.5 - Resumen de aborto muestra "Corte Abortado" y el motivo', async () => {
    const { user, mock } = renderEnReanudacion();

    await user.click(screen.getByRole('button', { name: /abortar corte/i }));

    const textarea = screen.getByPlaceholderText(/por que aborta/i);
    await user.type(textarea, 'Error detectado en el conteo');

    await user.click(screen.getByRole('button', { name: /confirmar aborto/i }));

    await waitFor(() => {
      expect(mock.abortarCorte).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText('Corte Abortado')).toBeInTheDocument();
      expect(screen.getByText(/Error detectado en el conteo/)).toBeInTheDocument();
    });
  });
});

// ===========================================================================
// SUITE 6: Vista Resumen — Estado Terminal
// ===========================================================================

describe('Suite 6: Vista Resumen — Estado Terminal', () => {
  it('6.1 - Muestra CorteResumen cuando corte está FINALIZADO', () => {
    configurarMock({
      corte_actual: corteFinalizadoTest,
    });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(screen.getByText('Corte Finalizado')).toBeInTheDocument();
  });

  it('6.2 - Muestra "Corte Finalizado" para estado FINALIZADO', () => {
    configurarMock({
      corte_actual: corteFinalizadoTest,
    });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    const titulo = screen.getByText('Corte Finalizado');
    expect(titulo).toBeInTheDocument();
  });

  it('6.3 - Muestra CorteResumen cuando corte está ABORTADO', () => {
    configurarMock({
      corte_actual: corteAbortadoTest,
    });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(screen.getByText('Corte Abortado')).toBeInTheDocument();
  });

  it('6.4 - Al cerrar resumen, vuelve a vista inicio', async () => {
    configurarMock({
      corte_actual: corteFinalizadoTest,
    });
    const user = userEvent.setup();
    const { rerender } = render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );

    // Verify resumen is shown
    expect(screen.getByText('Corte Finalizado')).toBeInTheDocument();

    // Click Cerrar — this resets corteParaResumen and sesionConfirmada
    await user.click(screen.getByRole('button', { name: /cerrar/i }));

    // Simulate the hook now returning null (e.g. after session cleanup)
    configurarMock({ corte_actual: null });
    rerender(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );

    expect(screen.getByText('Iniciar Corte de Caja')).toBeInTheDocument();
  });
});

// ===========================================================================
// SUITE 7: CorteStatusBanner
// ===========================================================================

describe('Suite 7: CorteStatusBanner', () => {
  it('7.1 - Banner de estado visible en vista inicio', () => {
    configurarMock();
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    // CorteStatusBanner renders "Conectado — Datos sincronizados" when online+sincronizado
    expect(screen.getByText(/Conectado/)).toBeInTheDocument();
  });

  it('7.2 - Banner de estado visible en vista progreso', async () => {
    configurarMock({
      corte_actual: corteActivoTest,
      intento_actual: intentoActivoTest,
    });
    const user = userEvent.setup();
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    await user.click(screen.getByRole('button', { name: /reanudar corte/i }));
    expect(screen.getByText(/Conectado/)).toBeInTheDocument();
  });

  it('7.3 - Banner de estado NO visible en carga inicial', () => {
    configurarMock({ cargando: true });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(screen.queryByText(/Conectado/)).not.toBeInTheDocument();
  });
});

// ===========================================================================
// SUITE 8: Resolución de Nombre de Sucursal
// ===========================================================================

describe('Suite 8: Resolución de Nombre de Sucursal', () => {
  it('8.1 - Resuelve nombre correcto cuando sucursal existe', () => {
    configurarMock({
      corte_actual: corteFinalizadoTest,
    });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    // CorteResumen renders the nombre de sucursal
    expect(screen.getByText('Sucursal Central')).toBeInTheDocument();
  });

  it('8.2 - Muestra "Sucursal desconocida" cuando ID no coincide', () => {
    const corteConSucursalDesconocida: Corte = {
      ...corteFinalizadoTest,
      sucursal_id: 'suc-999',
    };
    configurarMock({
      corte_actual: corteConSucursalDesconocida,
    });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(screen.getByText('Sucursal desconocida')).toBeInTheDocument();
  });

  it('8.3 - Nombre correcto se pasa a CorteResumen', () => {
    configurarMock({
      corte_actual: corteAbortadoTest,
    });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    // CorteResumen renders the sucursal name
    expect(screen.getByText('Sucursal Central')).toBeInTheDocument();
    // Also verify the aborted state
    expect(screen.getByText('Corte Abortado')).toBeInTheDocument();
  });
});

// ===========================================================================
// SUITE 9: Preselección sucursal en CorteInicio (OT-14)
// ===========================================================================

describe('Suite 9: Preselección sucursal en CorteInicio (OT-14)', () => {
  it('9.1 - CorteInicio inicia en paso cajero, sin picker de sucursal', () => {
    configurarMock({ corte_actual: null });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    // NO debe mostrar paso de selección de sucursal
    expect(screen.queryByText('Seleccionar Sucursal')).not.toBeInTheDocument();
    // Debe mostrar paso cajero directamente
    expect(screen.getByText('Identificar Cajero')).toBeInTheDocument();
  });

  it('9.2 - Progreso muestra "Paso 1 de 3" (no 4)', () => {
    configurarMock({ corte_actual: null });
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );
    expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument();
  });

  it('9.3 - Al completar wizard, iniciarCorte recibe sucursalId del orquestador', async () => {
    const mock = configurarMock({ corte_actual: null });
    const user = userEvent.setup();
    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );

    // Paso 1 (cajero)
    await user.type(screen.getByPlaceholderText(/nombre completo del cajero/i), 'Tito Gomez');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 2 (testigo)
    await user.type(screen.getByPlaceholderText(/nombre completo del testigo/i), 'Adonay Torres');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 3 (venta esperada) → iniciar
    await user.click(screen.getByRole('button', { name: /iniciar corte/i }));

    expect(mock.iniciarCorte).toHaveBeenCalledWith(
      expect.objectContaining({ sucursal_id: 'suc-001' })
    );
  });
});

// ---------------------------------------------------------------------------
// Suite 10: OT-17 — handleGuardarProgreso wiring
// ---------------------------------------------------------------------------

describe('Suite 10: OT-17 — handleGuardarProgreso', () => {
  it('10.1 — Pasa onGuardarProgreso a CorteConteoAdapter y llama guardarProgreso', async () => {
    const mock = configurarMock({
      corte_actual: {
        id: 'corte-progreso',
        correlativo: 'CORTE-2026-02-17-H-001',
        sucursal_id: 'suc-001',
        cajero: 'Tester',
        testigo: 'Testigo',
        estado: 'EN_PROGRESO' as const,
        fase_actual: 1,
        intento_actual: 1,
        venta_esperada: 100,
        datos_conteo: null,
        datos_entrega: null,
        datos_verificacion: null,
        datos_reporte: null,
        reporte_hash: null,
        created_at: '2026-02-17T10:00:00.000Z',
        updated_at: '2026-02-17T10:00:00.000Z',
        finalizado_at: null,
        motivo_aborto: null,
      },
      cargando: false,
    });

    const user = userEvent.setup();

    render(
      <CorteOrquestador
        sucursales={sucursalesTest}
        sucursalId="suc-001"
      />
    );

    // El orquestador detecta corte activo no confirmado → vista reanudación
    const reanudarBtn = await screen.findByText(/reanudar/i);
    await user.click(reanudarBtn);

    // Ahora en vista progreso → CashCounter renderizado con mock-guardar-progreso
    const guardarBtn = await screen.findByTestId('mock-guardar-progreso');
    await user.click(guardarBtn);

    expect(mock.guardarProgreso).toHaveBeenCalledTimes(1);
    expect(mock.guardarProgreso).toHaveBeenCalledWith(
      expect.objectContaining({
        fase_actual: 1,
        conteo_parcial: expect.any(Object),
      }),
    );
  });
});
