/**
 * Fast-Check Arbitraries - Property-Based Testing Generators
 *
 * 🎯 **PROPÓSITO**: Generadores automáticos de escenarios de prueba para
 * validar cientos/miles de combinaciones de denominaciones y montos.
 *
 * Estos arbitraries generan datos válidos que respetan las restricciones
 * del dominio financiero (ej: no negativos, precisión decimal, rangos realistas).
 *
 * @version 1.0.0
 */

import * as fc from 'fast-check';
import { CashCount, ElectronicPayments } from '@/types/cash';

/**
 * Genera cantidad aleatoria de una denominación específica
 * Rango: 0-100 unidades (realista para operación diaria)
 */
export const denominationQuantity = () => fc.integer({ min: 0, max: 100 });

/**
 * Genera cantidad aleatoria de una denominación con límite específico
 */
export const denominationQuantityWithMax = (max: number) =>
  fc.integer({ min: 0, max });

/**
 * Genera CashCount completo con todas las denominaciones
 * Todas las cantidades son >= 0 y <= 100
 */
export const cashCount = (): fc.Arbitrary<CashCount> =>
  fc.record({
    // Monedas
    penny: denominationQuantity(),
    nickel: denominationQuantity(),
    dime: denominationQuantity(),
    quarter: denominationQuantity(),
    dollarCoin: denominationQuantity(),
    // Billetes
    bill1: denominationQuantity(),
    bill5: denominationQuantity(),
    bill10: denominationQuantity(),
    bill20: denominationQuantity(),
    bill50: denominationQuantity(),
    bill100: denominationQuantity()
  }) as fc.Arbitrary<CashCount>;

/**
 * Genera CashCount parcial (algunas denominaciones pueden faltar)
 * Útil para casos edge donde no todas las denominaciones están presentes
 */
export const partialCashCount = (): fc.Arbitrary<Partial<CashCount>> =>
  fc.record(
    {
      penny: fc.option(denominationQuantity(), { nil: undefined }),
      nickel: fc.option(denominationQuantity(), { nil: undefined }),
      dime: fc.option(denominationQuantity(), { nil: undefined }),
      quarter: fc.option(denominationQuantity(), { nil: undefined }),
      dollarCoin: fc.option(denominationQuantity(), { nil: undefined }),
      bill1: fc.option(denominationQuantity(), { nil: undefined }),
      bill5: fc.option(denominationQuantity(), { nil: undefined }),
      bill10: fc.option(denominationQuantity(), { nil: undefined }),
      bill20: fc.option(denominationQuantity(), { nil: undefined }),
      bill50: fc.option(denominationQuantity(), { nil: undefined }),
      bill100: fc.option(denominationQuantity(), { nil: undefined })
    },
    { requiredKeys: [] }
  ) as fc.Arbitrary<Partial<CashCount>>;

/**
 * Genera CashCount con total mínimo garantizado
 * Útil para tests de Phase 2 que requieren > $50
 */
export const cashCountWithMinTotal = (minTotal: number): fc.Arbitrary<CashCount> =>
  cashCount().filter((count) => {
    const total =
      count.penny * 0.01 +
      count.nickel * 0.05 +
      count.dime * 0.10 +
      count.quarter * 0.25 +
      count.dollarCoin * 1.00 +
      count.bill1 * 1 +
      count.bill5 * 5 +
      count.bill10 * 10 +
      count.bill20 * 20 +
      count.bill50 * 50 +
      count.bill100 * 100;
    return total >= minTotal;
  });

/**
 * Genera CashCount con total en rango específico
 */
export const cashCountInRange = (
  min: number,
  max: number
): fc.Arbitrary<CashCount> =>
  cashCount().filter((count) => {
    const total =
      count.penny * 0.01 +
      count.nickel * 0.05 +
      count.dime * 0.10 +
      count.quarter * 0.25 +
      count.dollarCoin * 1.00 +
      count.bill1 * 1 +
      count.bill5 * 5 +
      count.bill10 * 10 +
      count.bill20 * 20 +
      count.bill50 * 50 +
      count.bill100 * 100;
    return total >= min && total <= max;
  });

/**
 * Genera monto de pago electrónico realista
 * Rango: $0.00 - $10,000.00 con precisión de 2 decimales
 */
export const electronicAmount = () =>
  fc
    .integer({ min: 0, max: 1000000 }) // 0 a 10,000.00 en centavos
    .map((cents) => cents / 100); // Convertir a dólares

/**
 * Genera ElectronicPayments completo
 */
export const electronicPayments = (): fc.Arbitrary<ElectronicPayments> =>
  fc.record({
    credomatic: electronicAmount(),
    promerica: electronicAmount(),
    bankTransfer: electronicAmount(),
    paypal: electronicAmount()
  }) as fc.Arbitrary<ElectronicPayments>;

/**
 * Genera ElectronicPayments parcial
 */
export const partialElectronicPayments = (): fc.Arbitrary<Partial<ElectronicPayments>> =>
  fc.record(
    {
      credomatic: fc.option(electronicAmount(), { nil: undefined }),
      promerica: fc.option(electronicAmount(), { nil: undefined }),
      bankTransfer: fc.option(electronicAmount(), { nil: undefined }),
      paypal: fc.option(electronicAmount(), { nil: undefined })
    },
    { requiredKeys: [] }
  ) as fc.Arbitrary<Partial<ElectronicPayments>>;

/**
 * Genera venta esperada realista para validación
 * Rango: $0.00 - $50,000.00
 */
export const expectedSales = () =>
  fc
    .integer({ min: 0, max: 5000000 }) // 0 a 50,000.00 en centavos
    .map((cents) => cents / 100);

/**
 * Genera diferencia realista (positiva o negativa)
 * Rango: -$500.00 a +$500.00
 */
export const difference = () =>
  fc
    .integer({ min: -50000, max: 50000 }) // -500.00 a +500.00 en centavos
    .map((cents) => cents / 100);

/**
 * CASOS ESPECIALES: Generadores para escenarios edge
 */

/**
 * Genera CashCount con solo monedas (sin billetes)
 */
export const onlyCoins = (): fc.Arbitrary<CashCount> =>
  fc.record({
    penny: denominationQuantity(),
    nickel: denominationQuantity(),
    dime: denominationQuantity(),
    quarter: denominationQuantity(),
    dollarCoin: denominationQuantity(),
    bill1: fc.constant(0),
    bill5: fc.constant(0),
    bill10: fc.constant(0),
    bill20: fc.constant(0),
    bill50: fc.constant(0),
    bill100: fc.constant(0)
  }) as fc.Arbitrary<CashCount>;

/**
 * Genera CashCount con solo billetes (sin monedas)
 */
export const onlyBills = (): fc.Arbitrary<CashCount> =>
  fc.record({
    penny: fc.constant(0),
    nickel: fc.constant(0),
    dime: fc.constant(0),
    quarter: fc.constant(0),
    dollarCoin: fc.constant(0),
    bill1: denominationQuantity(),
    bill5: denominationQuantity(),
    bill10: denominationQuantity(),
    bill20: denominationQuantity(),
    bill50: denominationQuantity(),
    bill100: denominationQuantity()
  }) as fc.Arbitrary<CashCount>;

/**
 * Genera CashCount con una sola denominación activa
 */
export const singleDenomination = (): fc.Arbitrary<CashCount> =>
  fc
    .constantFrom(
      'penny',
      'nickel',
      'dime',
      'quarter',
      'dollarCoin',
      'bill1',
      'bill5',
      'bill10',
      'bill20',
      'bill50',
      'bill100'
    )
    .chain((denomination) =>
      denominationQuantity().map((quantity) => ({
        penny: 0,
        nickel: 0,
        dime: 0,
        quarter: 0,
        dollarCoin: 0,
        bill1: 0,
        bill5: 0,
        bill10: 0,
        bill20: 0,
        bill50: 0,
        bill100: 0,
        [denomination]: quantity
      }))
    ) as fc.Arbitrary<CashCount>;

/**
 * Genera CashCount vacío (todas denominaciones en 0)
 */
export const emptyCashCount = (): fc.Arbitrary<CashCount> =>
  fc.constant({
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 0,
    bill10: 0,
    bill20: 0,
    bill50: 0,
    bill100: 0
  }) as fc.Arbitrary<CashCount>;

/**
 * REGRESIÓN: Escenario Paradise específico
 * "10 de cada denominación" = $1,881.40
 */
export const tenOfEachDenomination = (): fc.Arbitrary<CashCount> =>
  fc.constant({
    penny: 10,
    nickel: 10,
    dime: 10,
    quarter: 10,
    dollarCoin: 10,
    bill1: 10,
    bill5: 10,
    bill10: 10,
    bill20: 10,
    bill50: 10,
    bill100: 10
  }) as fc.Arbitrary<CashCount>;

/**
 * Genera escenario de cambio exacto $50.00 posible
 * Garantiza que hay suficientes denominaciones pequeñas
 */
export const cashCountForExactChange50 = (): fc.Arbitrary<CashCount> =>
  fc.record({
    // Garantizar suficientes monedas para cambio
    penny: fc.integer({ min: 50, max: 100 }),
    nickel: fc.integer({ min: 20, max: 100 }),
    dime: fc.integer({ min: 20, max: 100 }),
    quarter: fc.integer({ min: 10, max: 100 }),
    dollarCoin: fc.integer({ min: 10, max: 100 }),
    // Billetes pequeños también útiles
    bill1: fc.integer({ min: 20, max: 100 }),
    bill5: fc.integer({ min: 10, max: 100 }),
    bill10: fc.integer({ min: 5, max: 100 }),
    bill20: fc.integer({ min: 5, max: 100 }),
    bill50: fc.integer({ min: 1, max: 20 }),
    bill100: fc.integer({ min: 0, max: 20 })
  }) as fc.Arbitrary<CashCount>;
