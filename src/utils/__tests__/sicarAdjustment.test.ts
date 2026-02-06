/**
 * 🤖 [IA] - VERSION 3.0: TIER 0 Tests - sicarAdjustment.ts
 *
 * Suite de tests obligatorios para función calculateSicarAdjusted.
 * Valida lógica crítica de negocio que elimina workaround contable COD.
 *
 * @module utils/__tests__/sicarAdjustment.test
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Coverage Target: 100% lines, 100% branches
 * Test Cases: 18 tests (TIER 0 obligatorios)
 *
 * Compliance:
 * - NIST SP 800-115: Tests de cálculos financieros críticos
 * - PCI DSS: Validación de transacciones monetarias
 * - REGLAS_DE_LA_CASA.md: Vitest, describe/it pattern
 */

import { describe, it, expect } from 'vitest';
import {
  calculateSicarAdjusted,
  formatDeliveriesForWhatsApp,
  formatSicarAdjustment,
  type SicarAdjustmentResult,
} from '../sicarAdjustment';
import type { DeliveryEntry } from '../../types/deliveries';

// ═══════════════════════════════════════════════════════════
// HELPER: CREAR DELIVERY DE PRUEBA
// ═══════════════════════════════════════════════════════════

function createTestDelivery(
  overrides: Partial<DeliveryEntry> = {}
): DeliveryEntry {
  return {
    id: crypto.randomUUID(),
    customerName: 'Test Customer',
    amount: 100.0,
    courier: 'C807',
    status: 'pending_cod',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════
// SUITE 1: CÁLCULO BÁSICO - CASOS NORMALES
// ═══════════════════════════════════════════════════════════

describe('calculateSicarAdjusted - Casos Normales', () => {
  it('debe retornar expectedSales sin cambios si deliveries es array vacío', () => {
    const result = calculateSicarAdjusted(2500, []);

    expect(result.originalExpected).toBe(2500);
    expect(result.totalPendingDeliveries).toBe(0);
    expect(result.adjustedExpected).toBe(2500);
    expect(result.pendingDeliveriesCount).toBe(0);
    expect(result.deliveriesBreakdown).toEqual([]);
  });

  it('debe restar 1 delivery pending correctamente', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 100.5 }),
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    expect(result.originalExpected).toBe(2500);
    expect(result.totalPendingDeliveries).toBe(100.5);
    expect(result.adjustedExpected).toBe(2399.5);
    expect(result.pendingDeliveriesCount).toBe(1);
    expect(result.deliveriesBreakdown).toHaveLength(1);
  });

  it('debe restar múltiples deliveries pending correctamente', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 100.0 }),
      createTestDelivery({ amount: 200.0 }),
      createTestDelivery({ amount: 150.5 }),
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    expect(result.originalExpected).toBe(2500);
    expect(result.totalPendingDeliveries).toBe(450.5);
    expect(result.adjustedExpected).toBe(2049.5);
    expect(result.pendingDeliveriesCount).toBe(3);
    expect(result.deliveriesBreakdown).toHaveLength(3);
  });

  it('debe ignorar deliveries con status="paid"', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 100.0, status: 'pending_cod' }),
      createTestDelivery({ amount: 200.0, status: 'paid' }), // Ignorado
      createTestDelivery({ amount: 150.0, status: 'pending_cod' }),
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    expect(result.totalPendingDeliveries).toBe(250.0); // Solo 100 + 150
    expect(result.adjustedExpected).toBe(2250.0);
    expect(result.pendingDeliveriesCount).toBe(2); // Solo 2 pending
  });

  it('debe ignorar deliveries con status="cancelled"', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 100.0, status: 'pending_cod' }),
      createTestDelivery({ amount: 200.0, status: 'cancelled' }), // Ignorado
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    expect(result.totalPendingDeliveries).toBe(100.0);
    expect(result.adjustedExpected).toBe(2400.0);
    expect(result.pendingDeliveriesCount).toBe(1);
  });

  it('debe ignorar deliveries con status="rejected"', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 100.0, status: 'pending_cod' }),
      createTestDelivery({ amount: 200.0, status: 'rejected' }), // Ignorado
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    expect(result.totalPendingDeliveries).toBe(100.0);
    expect(result.adjustedExpected).toBe(2400.0);
    expect(result.pendingDeliveriesCount).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════
// SUITE 2: EDGE CASES - VALORES LÍMITE
// ═══════════════════════════════════════════════════════════

describe('calculateSicarAdjusted - Edge Cases', () => {
  it('debe manejar expectedSales = 0', () => {
    const deliveries: DeliveryEntry[] = [];

    const result = calculateSicarAdjusted(0, deliveries);

    expect(result.originalExpected).toBe(0);
    expect(result.adjustedExpected).toBe(0);
  });

  it('debe manejar delivery amount = 0.01 (mínimo)', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 0.01 }),
    ];

    const result = calculateSicarAdjusted(100, deliveries);

    expect(result.totalPendingDeliveries).toBe(0.01);
    expect(result.adjustedExpected).toBe(99.99);
  });

  it('debe manejar delivery amount = 10000 (máximo)', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 10000.0 }),
    ];

    const result = calculateSicarAdjusted(15000, deliveries);

    expect(result.totalPendingDeliveries).toBe(10000.0);
    expect(result.adjustedExpected).toBe(5000.0);
  });

  it('debe redondear a 2 decimales (float precision)', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 33.333 }), // Input impreciso
    ];

    const result = calculateSicarAdjusted(100, deliveries);

    // Verificar que result tiene solo 2 decimales
    expect(result.totalPendingDeliveries).toBeCloseTo(33.33, 2);
    expect(result.adjustedExpected).toBeCloseTo(66.67, 2);
  });

  it('debe manejar array con todos deliveries NO pending', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 100.0, status: 'paid' }),
      createTestDelivery({ amount: 200.0, status: 'cancelled' }),
      createTestDelivery({ amount: 150.0, status: 'rejected' }),
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    // Debe comportarse como array vacío (no hay pending)
    expect(result.totalPendingDeliveries).toBe(0);
    expect(result.adjustedExpected).toBe(2500);
    expect(result.pendingDeliveriesCount).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════
// SUITE 3: VALIDACIONES - ERRORES ESPERADOS
// ═══════════════════════════════════════════════════════════

describe('calculateSicarAdjusted - Validaciones', () => {
  it('debe lanzar error si expectedSales es negativo', () => {
    expect(() => {
      calculateSicarAdjusted(-100, []);
    }).toThrow('expectedSales no puede ser negativo');
  });

  it('debe lanzar error si deliveries exceden expectedSales', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 1500.0 }),
      createTestDelivery({ amount: 1500.0 }),
    ];

    expect(() => {
      calculateSicarAdjusted(2000, deliveries); // 3000 deliveries > 2000 expected
    }).toThrow('SICAR ajustado no puede ser negativo');
  });

  it('debe lanzar error con mensaje descriptivo si deliveries > expected', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 2500.0 }),
    ];

    expect(() => {
      calculateSicarAdjusted(2000, deliveries);
    }).toThrow(/deliveries pendientes.*exceden ventas totales/i);
  });
});

// ═══════════════════════════════════════════════════════════
// SUITE 4: DESGLOSE Y AUDITORÍA
// ═══════════════════════════════════════════════════════════

describe('calculateSicarAdjusted - Desglose', () => {
  it('debe incluir desglose completo de cada delivery', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({
        id: 'delivery-1',
        customerName: 'Juan Pérez',
        amount: 100.0,
        courier: 'C807',
      }),
      createTestDelivery({
        id: 'delivery-2',
        customerName: 'Ana Martínez',
        amount: 200.0,
        courier: 'Melos',
      }),
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    expect(result.deliveriesBreakdown).toHaveLength(2);

    // Verificar primer delivery
    expect(result.deliveriesBreakdown[0]).toMatchObject({
      id: 'delivery-1',
      customerName: 'Juan Pérez',
      amount: 100.0,
      courier: 'C807',
    });
    expect(result.deliveriesBreakdown[0].daysOld).toBeGreaterThanOrEqual(0);

    // Verificar segundo delivery
    expect(result.deliveriesBreakdown[1]).toMatchObject({
      id: 'delivery-2',
      customerName: 'Ana Martínez',
      amount: 200.0,
      courier: 'Melos',
    });
    expect(result.deliveriesBreakdown[1].daysOld).toBeGreaterThanOrEqual(0);
  });

  it('debe calcular daysOld correctamente para delivery antiguo', () => {
    // Crear delivery de hace 5 días
    const fiveDaysAgo = new Date(Date.now() - 5 * 86400000);
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({
        createdAt: fiveDaysAgo.toISOString(),
        amount: 100.0,
      }),
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    expect(result.deliveriesBreakdown[0].daysOld).toBe(5);
  });

  it('debe calcular daysOld = 0 para delivery de hoy', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({
        createdAt: new Date().toISOString(),
        amount: 100.0,
      }),
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    expect(result.deliveriesBreakdown[0].daysOld).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════
// SUITE 5: FORMATEO WHATSAPP
// ═══════════════════════════════════════════════════════════

describe('formatDeliveriesForWhatsApp', () => {
  it('debe retornar string vacío si no hay deliveries pendientes', () => {
    const result: SicarAdjustmentResult = {
      originalExpected: 2500,
      totalPendingDeliveries: 0,
      adjustedExpected: 2500,
      pendingDeliveriesCount: 0,
      deliveriesBreakdown: [],
    };

    const formatted = formatDeliveriesForWhatsApp(result);

    expect(formatted).toBe('');
  });

  it('debe formatear correctamente 1 delivery para WhatsApp', () => {
    const result: SicarAdjustmentResult = {
      originalExpected: 2500,
      totalPendingDeliveries: 100.0,
      adjustedExpected: 2400.0,
      pendingDeliveriesCount: 1,
      deliveriesBreakdown: [
        {
          id: '1',
          customerName: 'Juan Pérez',
          amount: 100.0,
          courier: 'C807',
          daysOld: 5,
        },
      ],
    };

    const formatted = formatDeliveriesForWhatsApp(result);

    expect(formatted).toContain('📦 DELIVERIES PENDIENTES (1)');
    expect(formatted).toContain('1. Juan Pérez - $100.00');
    expect(formatted).toContain('C807 | 5 días pendiente');
    expect(formatted).toContain('TOTAL PENDIENTE: $100.00');
    expect(formatted).toContain('━━━━━━━━━━━━'); // Separador
  });

  it('debe incluir emoji ⚠️ para deliveries ≥7 días', () => {
    const result: SicarAdjustmentResult = {
      originalExpected: 2500,
      totalPendingDeliveries: 100.0,
      adjustedExpected: 2400.0,
      pendingDeliveriesCount: 1,
      deliveriesBreakdown: [
        {
          id: '1',
          customerName: 'Test',
          amount: 100.0,
          courier: 'C807',
          daysOld: 10,
        },
      ],
    };

    const formatted = formatDeliveriesForWhatsApp(result);

    expect(formatted).toContain('⚠️');
  });

  it('debe incluir emoji 🚨 para deliveries ≥15 días', () => {
    const result: SicarAdjustmentResult = {
      originalExpected: 2500,
      totalPendingDeliveries: 100.0,
      adjustedExpected: 2400.0,
      pendingDeliveriesCount: 1,
      deliveriesBreakdown: [
        {
          id: '1',
          customerName: 'Test',
          amount: 100.0,
          courier: 'C807',
          daysOld: 20,
        },
      ],
    };

    const formatted = formatDeliveriesForWhatsApp(result);

    expect(formatted).toContain('🚨');
  });

  it('debe incluir emoji 🔴 para deliveries ≥30 días', () => {
    const result: SicarAdjustmentResult = {
      originalExpected: 2500,
      totalPendingDeliveries: 100.0,
      adjustedExpected: 2400.0,
      pendingDeliveriesCount: 1,
      deliveriesBreakdown: [
        {
          id: '1',
          customerName: 'Test',
          amount: 100.0,
          courier: 'C807',
          daysOld: 35,
        },
      ],
    };

    const formatted = formatDeliveriesForWhatsApp(result);

    expect(formatted).toContain('🔴');
  });

  it('debe usar "día" singular para daysOld=1', () => {
    const result: SicarAdjustmentResult = {
      originalExpected: 2500,
      totalPendingDeliveries: 100.0,
      adjustedExpected: 2400.0,
      pendingDeliveriesCount: 1,
      deliveriesBreakdown: [
        {
          id: '1',
          customerName: 'Test',
          amount: 100.0,
          courier: 'C807',
          daysOld: 1,
        },
      ],
    };

    const formatted = formatDeliveriesForWhatsApp(result);

    expect(formatted).toContain('1 día pendiente');
    expect(formatted).not.toContain('1 días'); // No debe ser plural
  });
});

// ═══════════════════════════════════════════════════════════
// SUITE 6: FORMATEO AJUSTE SICAR
// ═══════════════════════════════════════════════════════════

describe('formatSicarAdjustment', () => {
  it('debe mostrar solo expectedSales si no hay deliveries', () => {
    const result: SicarAdjustmentResult = {
      originalExpected: 2500,
      totalPendingDeliveries: 0,
      adjustedExpected: 2500,
      pendingDeliveriesCount: 0,
      deliveriesBreakdown: [],
    };

    const formatted = formatSicarAdjustment(result);

    expect(formatted).toBe('SICAR Esperado: $2500.00');
  });

  it('debe mostrar desglose completo si hay deliveries pendientes', () => {
    const result: SicarAdjustmentResult = {
      originalExpected: 2500,
      totalPendingDeliveries: 350.0,
      adjustedExpected: 2150.0,
      pendingDeliveriesCount: 3,
      deliveriesBreakdown: [],
    };

    const formatted = formatSicarAdjustment(result);

    expect(formatted).toContain('SICAR Ventas Totales: $2500.00');
    expect(formatted).toContain('- Deliveries Pendientes: -$350.00');
    expect(formatted).toContain('= SICAR Ajustado: $2150.00');
  });
});
