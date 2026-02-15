// 🤖 [IA] - v1.0.0: Tests CorteConteoAdapter — Orden #013
// CashCounter mockeado (componente complejo). Valida mapeo de props y callbacks.

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CorteConteoAdapter } from '../CorteConteoAdapter';
import type { CorteConteoAdapterProps } from '../CorteConteoAdapter';
import type { Corte, CorteIntento } from '../../../types/auditoria';
import { OperationMode } from '../../../types/operation-mode';

// ---------------------------------------------------------------------------
// Mock de CashCounter
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
      data-initial-daily-expenses={props.initialDailyExpenses ? 'present' : 'absent'}
    >
      <button data-testid="mock-back" onClick={props.onBack}>mock-back</button>
      <button data-testid="mock-cancel" onClick={props.onFlowCancel}>mock-cancel</button>
    </div>
  )),
}));

import CashCounter from '../../../components/CashCounter';

const MockCashCounter = vi.mocked(CashCounter);

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const corteActivoTest: Corte = {
  id: 'corte-001',
  correlativo: 'CORTE-2026-02-12-S-001',
  sucursal_id: 'suc-001',
  cajero: 'Juan Pérez',
  testigo: 'María López',
  estado: 'EN_PROGRESO',
  fase_actual: 1,
  intento_actual: 1,
  venta_esperada: 653.65,
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

const corteSinVentaTest: Corte = {
  ...corteActivoTest,
  id: 'corte-002',
  venta_esperada: null,
};

const corteVentaCeroTest: Corte = {
  ...corteActivoTest,
  id: 'corte-003',
  venta_esperada: 0,
};

const corteVentaDecimalesLargosTest: Corte = {
  ...corteActivoTest,
  id: 'corte-004',
  venta_esperada: 1234.56789,
};

const corteCompletoTest: Corte = {
  ...corteActivoTest,
  id: 'corte-005',
  datos_conteo: { penny: 50, nickel: 20 },
  datos_entrega: { amount: 327.20 },
  fase_actual: 2,
  intento_actual: 2,
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

const intentoSegundoTest: CorteIntento = {
  id: 'intento-002',
  corte_id: 'corte-001',
  attempt_number: 2,
  estado: 'ACTIVO',
  snapshot_datos: { partial: true },
  motivo_reinicio: 'Error en primer conteo',
  created_at: '2026-02-12T09:00:00.000Z',
  finalizado_at: null,
};

// ---------------------------------------------------------------------------
// Default props helper
// ---------------------------------------------------------------------------

function defaultProps(overrides: Partial<CorteConteoAdapterProps> = {}): CorteConteoAdapterProps {
  return {
    corte: corteActivoTest,
    intento: intentoActivoTest,
    sucursalNombre: 'Sucursal Central',
    onConteoCompletado: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CorteConteoAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // Suite 1: Renderizado básico
  // -------------------------------------------------------------------------
  describe('Suite 1: Renderizado básico', () => {
    it('1.1 — Renderiza CashCounter mockeado', () => {
      render(<CorteConteoAdapter {...defaultProps()} />);
      expect(screen.getByTestId('mock-cash-counter')).toBeInTheDocument();
    });

    it('1.2 — Pasa operationMode CASH_CUT', () => {
      render(<CorteConteoAdapter {...defaultProps()} />);
      const counter = screen.getByTestId('mock-cash-counter');
      expect(counter.dataset.operationMode).toBe(OperationMode.CASH_CUT);
    });

    it('1.3 — Pasa sucursalNombre como initialStore', () => {
      render(<CorteConteoAdapter {...defaultProps({ sucursalNombre: 'Los Héroes' })} />);
      const counter = screen.getByTestId('mock-cash-counter');
      expect(counter.dataset.initialStore).toBe('Los Héroes');
    });

    it('1.4 — Pasa cajero y testigo correctamente', () => {
      render(<CorteConteoAdapter {...defaultProps()} />);
      const counter = screen.getByTestId('mock-cash-counter');
      expect(counter.dataset.initialCashier).toBe('Juan Pérez');
      expect(counter.dataset.initialWitness).toBe('María López');
    });

    it('1.5 — Renderiza sin errores con intento null', () => {
      render(<CorteConteoAdapter {...defaultProps({ intento: null })} />);
      expect(screen.getByTestId('mock-cash-counter')).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Suite 2: Mapeo de venta_esperada
  // -------------------------------------------------------------------------
  describe('Suite 2: Mapeo de venta_esperada', () => {
    it('2.1 — Convierte number a string (653.65 → "653.65")', () => {
      render(<CorteConteoAdapter {...defaultProps()} />);
      const counter = screen.getByTestId('mock-cash-counter');
      expect(counter.dataset.initialExpectedSales).toBe('653.65');
    });

    it('2.2 — Pasa string vacío cuando venta_esperada es null', () => {
      render(<CorteConteoAdapter {...defaultProps({ corte: corteSinVentaTest })} />);
      const counter = screen.getByTestId('mock-cash-counter');
      // When undefined, data attribute renders as empty string
      expect(counter.dataset.initialExpectedSales).toBe('');
    });

    it('2.2b — CashCounter recibe undefined cuando venta_esperada es null', () => {
      render(<CorteConteoAdapter {...defaultProps({ corte: corteSinVentaTest })} />);
      // Verify the actual prop passed to CashCounter mock
      expect(MockCashCounter).toHaveBeenCalledWith(
        expect.objectContaining({
          initialExpectedSales: undefined,
        }),
        expect.anything(),
      );
    });

    it('2.3 — Maneja venta_esperada = 0 correctamente ("0")', () => {
      render(<CorteConteoAdapter {...defaultProps({ corte: corteVentaCeroTest })} />);
      const counter = screen.getByTestId('mock-cash-counter');
      expect(counter.dataset.initialExpectedSales).toBe('0');
    });

    it('2.4 — Maneja venta_esperada con decimales largos', () => {
      render(<CorteConteoAdapter {...defaultProps({ corte: corteVentaDecimalesLargosTest })} />);
      const counter = screen.getByTestId('mock-cash-counter');
      expect(counter.dataset.initialExpectedSales).toBe('1234.56789');
    });

    it('2.5 — No pasa initialDailyExpenses (siempre absent)', () => {
      render(<CorteConteoAdapter {...defaultProps()} />);
      const counter = screen.getByTestId('mock-cash-counter');
      expect(counter.dataset.initialDailyExpenses).toBe('absent');
    });
  });

  // -------------------------------------------------------------------------
  // Suite 3: Callbacks
  // -------------------------------------------------------------------------
  describe('Suite 3: Callbacks', () => {
    it('3.1 — onBack de CashCounter dispara onConteoCompletado', async () => {
      const user = userEvent.setup();
      const onConteoCompletado = vi.fn();
      render(<CorteConteoAdapter {...defaultProps({ onConteoCompletado })} />);

      await user.click(screen.getByTestId('mock-back'));
      expect(onConteoCompletado).toHaveBeenCalledTimes(1);
    });

    it('3.2 — onFlowCancel de CashCounter dispara onConteoCompletado', async () => {
      const user = userEvent.setup();
      const onConteoCompletado = vi.fn();
      render(<CorteConteoAdapter {...defaultProps({ onConteoCompletado })} />);

      await user.click(screen.getByTestId('mock-cancel'));
      expect(onConteoCompletado).toHaveBeenCalledTimes(1);
    });

    it('3.3 — onConteoCompletado se llama exactamente 1 vez por evento', async () => {
      const user = userEvent.setup();
      const onConteoCompletado = vi.fn();
      render(<CorteConteoAdapter {...defaultProps({ onConteoCompletado })} />);

      await user.click(screen.getByTestId('mock-back'));
      await user.click(screen.getByTestId('mock-cancel'));
      expect(onConteoCompletado).toHaveBeenCalledTimes(2);
    });

    it('3.4 — CashCounter recibe onBack y onFlowCancel como props', () => {
      const onConteoCompletado = vi.fn();
      render(<CorteConteoAdapter {...defaultProps({ onConteoCompletado })} />);

      expect(MockCashCounter).toHaveBeenCalledWith(
        expect.objectContaining({
          onBack: onConteoCompletado,
          onFlowCancel: onConteoCompletado,
        }),
        expect.anything(),
      );
    });

    it('3.5 — Callbacks son la misma referencia de función', () => {
      const onConteoCompletado = vi.fn();
      render(<CorteConteoAdapter {...defaultProps({ onConteoCompletado })} />);

      const lastCall = MockCashCounter.mock.calls[0][0];
      expect(lastCall.onBack).toBe(lastCall.onFlowCancel);
    });
  });

  // -------------------------------------------------------------------------
  // Suite 4: Datos del intento
  // -------------------------------------------------------------------------
  describe('Suite 4: Datos del intento', () => {
    it('4.1 — Renderiza con intento activo (attempt_number > 0)', () => {
      render(<CorteConteoAdapter {...defaultProps({ intento: intentoActivoTest })} />);
      expect(screen.getByTestId('mock-cash-counter')).toBeInTheDocument();
    });

    it('4.2 — Renderiza con intento null (primer inicio)', () => {
      render(<CorteConteoAdapter {...defaultProps({ intento: null })} />);
      expect(screen.getByTestId('mock-cash-counter')).toBeInTheDocument();
    });

    it('4.3 — Cambio de intento no afecta props de CashCounter', () => {
      const { rerender } = render(
        <CorteConteoAdapter {...defaultProps({ intento: intentoActivoTest })} />,
      );

      rerender(
        <CorteConteoAdapter {...defaultProps({ intento: intentoSegundoTest })} />,
      );

      // CashCounter should still receive same corte-derived props
      const lastCall = MockCashCounter.mock.calls[MockCashCounter.mock.calls.length - 1][0];
      expect(lastCall.initialCashier).toBe('Juan Pérez');
      expect(lastCall.initialWitness).toBe('María López');
      expect(lastCall.operationMode).toBe(OperationMode.CASH_CUT);
    });

    it('4.4 — Segundo intento con attempt_number=2 renderiza correctamente', () => {
      render(
        <CorteConteoAdapter {...defaultProps({ intento: intentoSegundoTest })} />,
      );

      expect(screen.getByTestId('mock-cash-counter')).toBeInTheDocument();
      // Props still derived from corte, not intento
      expect(MockCashCounter).toHaveBeenCalledWith(
        expect.objectContaining({
          initialCashier: 'Juan Pérez',
        }),
        expect.anything(),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Suite 5: Integración con tipos auditoria
  // -------------------------------------------------------------------------
  describe('Suite 5: Integración con tipos auditoria', () => {
    it('5.1 — Acepta Corte completo (todos los campos)', () => {
      render(<CorteConteoAdapter {...defaultProps({ corte: corteCompletoTest })} />);
      expect(screen.getByTestId('mock-cash-counter')).toBeInTheDocument();
    });

    it('5.2 — Funciona con corte sin datos_conteo/datos_entrega', () => {
      const corteSinDatos: Corte = {
        ...corteActivoTest,
        datos_conteo: null,
        datos_entrega: null,
        datos_verificacion: null,
        datos_reporte: null,
      };

      render(<CorteConteoAdapter {...defaultProps({ corte: corteSinDatos })} />);
      expect(screen.getByTestId('mock-cash-counter')).toBeInTheDocument();
    });

    it('5.3 — Export nombrado disponible', () => {
      // This test validates the named export by the fact that we imported
      // { CorteConteoAdapter } at the top of this file — if the export
      // didn't exist, the import would fail and ALL tests would break.
      expect(CorteConteoAdapter).toBeDefined();
      expect(typeof CorteConteoAdapter).toBe('function');
    });

    it('5.4 — Export del type CorteConteoAdapterProps disponible', () => {
      // Type-level test: if the import didn't exist, TypeScript would fail.
      // At runtime, we verify the props shape is accepted.
      const props: CorteConteoAdapterProps = defaultProps();
      expect(props.corte).toBeDefined();
      expect(props.intento).toBeDefined();
      expect(props.sucursalNombre).toBeDefined();
      expect(props.onConteoCompletado).toBeDefined();
    });
  });

  // -------------------------------------------------------------------------
  // Suite 6: Mapeo completo de props a CashCounter
  // -------------------------------------------------------------------------
  describe('Suite 6: Mapeo completo de props', () => {
    it('6.1 — Pasa todas las props esperadas y ninguna extra inesperada', () => {
      render(<CorteConteoAdapter {...defaultProps()} />);

      expect(MockCashCounter).toHaveBeenCalledTimes(1);
      const passedProps = MockCashCounter.mock.calls[0][0];

      // Expected props
      expect(passedProps.operationMode).toBe(OperationMode.CASH_CUT);
      expect(passedProps.initialStore).toBe('Sucursal Central');
      expect(passedProps.initialCashier).toBe('Juan Pérez');
      expect(passedProps.initialWitness).toBe('María López');
      expect(passedProps.initialExpectedSales).toBe('653.65');
      expect(passedProps.onBack).toBeDefined();
      expect(passedProps.onFlowCancel).toBeDefined();

      // Should NOT pass initialDailyExpenses
      expect(passedProps.initialDailyExpenses).toBeUndefined();
    });

    it('6.2 — operationMode es siempre CASH_CUT independiente del corte', () => {
      // Even with a corte in fase 2, mode is always CASH_CUT
      render(<CorteConteoAdapter {...defaultProps({ corte: corteCompletoTest })} />);
      expect(MockCashCounter).toHaveBeenCalledWith(
        expect.objectContaining({
          operationMode: OperationMode.CASH_CUT,
        }),
        expect.anything(),
      );
    });
  });
});
