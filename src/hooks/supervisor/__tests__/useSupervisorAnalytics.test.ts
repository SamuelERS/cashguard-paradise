/**
 * Tests para los helpers financieros de useSupervisorAnalytics.
 * 🤖 [IA] - v4.1.0: TDD RED→GREEN — escritos ANTES de la implementación.
 * Patrón: src/types/__tests__/expenses.test.ts
 */
import { describe, test, expect } from 'vitest';
import { calculateCashTotal } from '@/utils/calculations';
import {
  extraerTotalesConteo,
  agregarCortes,
  type CorteConSucursalRaw,
} from '../useSupervisorAnalytics';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeGasto(amount: number) {
  return {
    id: 'gasto-' + String(amount),
    concept: 'Test gasto',
    amount,
    // 🤖 [IA] - v4.1.0: Usa 'supplies' (categoría válida v2.5) en lugar de 'operational'
    // isDailyExpense valida category en runtime contra ExpenseCategory union type
    category: 'supplies' as const,
    hasInvoice: false,
    timestamp: new Date().toISOString(),
  };
}

function makeCorte(overrides: Partial<CorteConSucursalRaw> = {}): CorteConSucursalRaw {
  return {
    id: 'corte-test',
    correlativo: 'CORTE-2026-02-25-A-001',
    sucursal_id: 'sucursal-a',
    cajero: 'cajero-test',
    testigo: 'testigo-test',
    estado: 'FINALIZADO',
    fase_actual: 3,
    intento_actual: 1,
    venta_esperada: 0,
    datos_conteo: null,
    datos_entrega: null,
    datos_verificacion: null,
    datos_reporte: null,
    reporte_hash: null,
    created_at: '2026-02-25T10:00:00.000-06:00',
    updated_at: '2026-02-25T10:00:00.000-06:00',
    finalizado_at: '2026-02-25T10:00:00.000-06:00',
    motivo_aborto: null,
    sucursales: { id: 'sucursal-a', nombre: 'Sucursal A', codigo: 'A', activa: true },
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Suite 1: extraerTotalesConteo
// ---------------------------------------------------------------------------

describe('extraerTotalesConteo', () => {
  test('null → todos cero', () => {
    expect(extraerTotalesConteo(null)).toEqual({
      totalCash:       0,
      totalElectronic: 0,
      totalExpenses:   0,
    });
  });

  test('objeto vacío → todos cero', () => {
    expect(extraerTotalesConteo({})).toEqual({
      totalCash:       0,
      totalElectronic: 0,
      totalExpenses:   0,
    });
  });

  test('conteo_parcial válido → delega correctamente a calculateCashTotal', () => {
    const cashCountSample = { bill5: 2, quarter: 4 };
    const result = extraerTotalesConteo({ conteo_parcial: cashCountSample });
    expect(result.totalCash).toBe(calculateCashTotal(cashCountSample));
    expect(result.totalElectronic).toBe(0);
    expect(result.totalExpenses).toBe(0);
  });

  test('pagos_electronicos válidos → suma de las 4 plataformas', () => {
    const result = extraerTotalesConteo({
      pagos_electronicos: {
        credomatic:   10,
        promerica:    5,
        bankTransfer: 3,
        paypal:       2,
      },
    });
    expect(result.totalElectronic).toBe(20);
    expect(result.totalCash).toBe(0);
    expect(result.totalExpenses).toBe(0);
  });

  test('gastos_dia como array → suma correcta', () => {
    const result = extraerTotalesConteo({
      gastos_dia: [makeGasto(25), makeGasto(15.5)],
    });
    expect(result.totalExpenses).toBeCloseTo(40.5, 2);
  });

  test('gastos_dia como { items: [...] } → suma correcta', () => {
    const result = extraerTotalesConteo({
      gastos_dia: { items: [makeGasto(30), makeGasto(10)] },
    });
    expect(result.totalExpenses).toBe(40);
  });
});

// ---------------------------------------------------------------------------
// Suite 2: agregarCortes
// ---------------------------------------------------------------------------

describe('agregarCortes', () => {
  test('array vacío → KpiGlobal con ceros y porSucursal vacío', () => {
    const kpi = agregarCortes([]);
    expect(kpi.totalCortes).toBe(0);
    expect(kpi.sobrantes).toBe(0);
    expect(kpi.faltantes).toBe(0);
    expect(kpi.exactos).toBe(0);
    expect(kpi.porSucursal).toHaveLength(0);
  });

  test('totalAdjusted > venta_esperada → sobrantes += 1', () => {
    const corte = makeCorte({
      venta_esperada: 80,
      datos_conteo: {
        pagos_electronicos: {
          credomatic: 100, promerica: 0, bankTransfer: 0, paypal: 0,
        },
      },
    });
    // totalElectronic=100, totalGeneral=100, totalAdjusted=100, esperado=80
    // diferencia = 100 - 80 = +20 → SOBRANTE
    const kpi = agregarCortes([corte]);
    expect(kpi.sobrantes).toBe(1);
    expect(kpi.faltantes).toBe(0);
    expect(kpi.exactos).toBe(0);
    expect(kpi.totalCortes).toBe(1);
  });

  test('totalAdjusted < venta_esperada → faltantes += 1', () => {
    const corte = makeCorte({
      venta_esperada: 200,
      datos_conteo: {
        pagos_electronicos: {
          credomatic: 100, promerica: 0, bankTransfer: 0, paypal: 0,
        },
      },
    });
    // totalAdjusted=100, esperado=200 → diferencia=-100 → FALTANTE
    const kpi = agregarCortes([corte]);
    expect(kpi.faltantes).toBe(1);
    expect(kpi.sobrantes).toBe(0);
    expect(kpi.exactos).toBe(0);
  });
});
