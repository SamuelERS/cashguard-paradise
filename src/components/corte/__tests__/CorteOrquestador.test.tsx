// 🤖 [IA] - v1.1.0: Tests TDD RED para CorteOrquestador — 8 escenarios (5 orquestación + 3 prefill key canónica)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { EmpleadoSucursal } from '@/hooks/useEmpleadosSucursal';
import CorteOrquestador from '../CorteOrquestador';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const MOCK_EMPLEADOS: EmpleadoSucursal[] = [
  { id: 'emp-001', nombre: 'Adonay Torres' },
  { id: 'emp-002', nombre: 'Tito Gomez' },
];

const MOCK_CORTE_RESPONSE = {
  id: 'corte-uuid-001',
  correlativo: 'CORTE-2026-02-23-H-001',
  sucursal_id: 'suc-001',
  cajero: 'Adonay Torres',
  testigo: 'Tito Gomez',
  estado: 'INICIADO',
  fase_actual: 1,
  intento_actual: 1,
  venta_esperada: null,
  datos_conteo: null,
  datos_entrega: null,
  datos_verificacion: null,
  datos_reporte: null,
  reporte_hash: null,
  created_at: '2026-02-23T10:00:00Z',
  updated_at: '2026-02-23T10:00:00Z',
  finalizado_at: null,
  motivo_aborto: null,
};

const mockIniciarCorte = vi.fn().mockResolvedValue(MOCK_CORTE_RESPONSE);

// Mock CorteInicio — presentacional
vi.mock('../CorteInicio', () => ({
  default: (props: Record<string, unknown>) => (
    <div
      data-testid="corte-inicio"
      data-cargando={String(props.cargandoEmpleados)}
      data-error={props.errorEmpleados ?? ''}
      data-empleados={JSON.stringify(props.empleadosDeSucursal)}
      data-precargado={JSON.stringify(props.empleadoPrecargado ?? null)}
    >
      <button
        data-testid="confirmar-mock"
        onClick={() => {
          const onConfirmar = props.onConfirmar as (
            cajero: EmpleadoSucursal,
            testigo: EmpleadoSucursal,
          ) => void;
          onConfirmar(
            { id: 'emp-001', nombre: 'Adonay Torres' },
            { id: 'emp-002', nombre: 'Tito Gomez' },
          );
        }}
      >
        Confirmar
      </button>
    </div>
  ),
}));

// Mock useEmpleadosSucursal
vi.mock('@/hooks/useEmpleadosSucursal', () => ({
  useEmpleadosSucursal: vi.fn(() => ({
    empleados: MOCK_EMPLEADOS,
    cargando: false,
    error: null,
    recargar: vi.fn(),
  })),
}));

// Mock useCorteSesion
vi.mock('@/hooks/useCorteSesion', () => ({
  useCorteSesion: vi.fn(() => ({
    estado: null,
    corte_actual: null,
    intento_actual: null,
    iniciarCorte: mockIniciarCorte,
    guardarProgreso: vi.fn(),
    finalizarCorte: vi.fn(),
    abortarCorte: vi.fn(),
    reiniciarIntento: vi.fn(),
    recuperarSesion: vi.fn(),
    cargando: false,
    error: null,
  })),
}));

// ---------------------------------------------------------------------------
// Key canónica — debe coincidir con la constante exportada por CorteOrquestador
// ---------------------------------------------------------------------------

const EXPECTED_CASHIER_KEY = 'cashguard_last_cashier';

// ---------------------------------------------------------------------------
// Default props
// ---------------------------------------------------------------------------

const defaultProps = {
  sucursalId: 'suc-001',
  onCorteIniciado: vi.fn(),
  onCancelar: vi.fn(),
};

// ---------------------------------------------------------------------------
// Suite E — CorteOrquestador
// ---------------------------------------------------------------------------

describe('CorteOrquestador — Suite E: Orquestación', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('E1: renderiza CorteInicio mock (data-testid presente)', () => {
    render(<CorteOrquestador {...defaultProps} />);
    expect(screen.getByTestId('corte-inicio')).toBeInTheDocument();
  });

  it('E2: pasa empleadosDeSucursal del hook mock como prop a CorteInicio', () => {
    render(<CorteOrquestador {...defaultProps} />);
    const el = screen.getByTestId('corte-inicio');
    const empleadosRaw = el.getAttribute('data-empleados');
    const empleados = JSON.parse(empleadosRaw ?? '[]') as EmpleadoSucursal[];
    expect(empleados).toHaveLength(2);
    expect(empleados[0].nombre).toBe('Adonay Torres');
    expect(empleados[1].nombre).toBe('Tito Gomez');
  });

  it('E3: onConfirmar llama iniciarCorte con firma correcta (nombres string)', async () => {
    const user = userEvent.setup();
    render(<CorteOrquestador {...defaultProps} />);

    await user.click(screen.getByTestId('confirmar-mock'));

    await waitFor(() => {
      expect(mockIniciarCorte).toHaveBeenCalledWith({
        sucursal_id: 'suc-001',
        cajero: 'Adonay Torres',
        testigo: 'Tito Gomez',
        venta_esperada: undefined,
      });
    });
  });

  it('E4: iniciarCorte resuelve → onCorteIniciado recibe objeto Corte completo', async () => {
    const onCorteIniciado = vi.fn();
    const user = userEvent.setup();
    render(
      <CorteOrquestador {...defaultProps} onCorteIniciado={onCorteIniciado} />,
    );

    await user.click(screen.getByTestId('confirmar-mock'));

    await waitFor(() => {
      expect(onCorteIniciado).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'corte-uuid-001',
          correlativo: 'CORTE-2026-02-23-H-001',
        }),
      );
    });
  });

  it('E5: iniciarCorte rechaza → NO llama onCorteIniciado y muestra error', async () => {
    mockIniciarCorte.mockRejectedValueOnce(new Error('Sesión duplicada'));
    const onCorteIniciado = vi.fn();
    const user = userEvent.setup();
    render(
      <CorteOrquestador {...defaultProps} onCorteIniciado={onCorteIniciado} />,
    );

    await user.click(screen.getByTestId('confirmar-mock'));

    await waitFor(() => {
      expect(onCorteIniciado).not.toHaveBeenCalled();
    });

    // Verify error message is visible
    expect(screen.getByText(/sesión duplicada/i)).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Suite F — Prefill key canónica
// ---------------------------------------------------------------------------

describe('CorteOrquestador — Suite F: Prefill key canónica', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('F1: localStorage con key canónica matchea empleado → empleadoPrecargado llega al presentacional', () => {
    localStorage.setItem(EXPECTED_CASHIER_KEY, 'Adonay Torres');
    render(<CorteOrquestador {...defaultProps} />);

    const el = screen.getByTestId('corte-inicio');
    const precargado = JSON.parse(
      el.getAttribute('data-precargado') ?? 'null',
    ) as EmpleadoSucursal | null;

    expect(precargado).not.toBeNull();
    expect(precargado!.nombre).toBe('Adonay Torres');
    expect(precargado!.id).toBe('emp-001');
  });

  it('F2: localStorage vacío → empleadoPrecargado es null', () => {
    render(<CorteOrquestador {...defaultProps} />);

    const el = screen.getByTestId('corte-inicio');
    const precargado = JSON.parse(
      el.getAttribute('data-precargado') ?? 'null',
    ) as EmpleadoSucursal | null;

    expect(precargado).toBeNull();
  });

  it('F3: iniciarCorte exitoso → persiste cajero en localStorage con key canónica', async () => {
    const user = userEvent.setup();
    render(<CorteOrquestador {...defaultProps} />);

    // Pre-condición: key no existe
    expect(localStorage.getItem(EXPECTED_CASHIER_KEY)).toBeNull();

    await user.click(screen.getByTestId('confirmar-mock'));

    await waitFor(() => {
      expect(localStorage.getItem(EXPECTED_CASHIER_KEY)).toBe('Adonay Torres');
    });
  });
});
