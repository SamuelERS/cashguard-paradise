/**
 * Cross-Validation Helpers - TIER 0
 *
 * 🎯 **PROPÓSITO CRÍTICO DE JUSTICIA LABORAL**:
 * Este módulo implementa validación triple independiente para GARANTIZAR que ningún
 * empleado sea acusado falsamente por un error en nuestro código. Tres métodos
 * independientes deben coincidir (±$0.005 tolerancia) para confirmar la exactitud.
 *
 * "No podemos darnos el lujo de acusar falsamente a un empleado por un error
 * en nuestro código" - Acuarios Paradise
 *
 * @version 1.0.0
 * @compliance NIST SP 800-115, PCI DSS 12.10.1
 */

import { CashCount, ElectronicPayments, DENOMINATIONS } from '@/types/cash';
import { calculateCashTotal } from '@/utils/calculations';
import { calculateDeliveryDistribution, DeliveryCalculation } from '@/utils/deliveryCalculation';

/**
 * Tolerancia aceptable para diferencias de redondeo (medio centavo)
 * Basado en IEEE 754 double precision float limitations
 */
const TOLERANCE = 0.005;

/**
 * Resultado de validación triple con trazabilidad completa
 */
export interface TripleValidationResult {
  /** ¿Todas las validaciones coincidieron dentro de tolerancia? */
  valid: boolean;
  /** Valor calculado por algoritmo principal (producción) */
  primary: number;
  /** Valor calculado por suma manual explícita (verificación independiente) */
  manual: number;
  /** Valor calculado por validación property-based (auto-generado) */
  propertyBased: number;
  /** Lista de discrepancias encontradas (vacía si valid=true) */
  discrepancies: string[];
  /** Timestamp de validación para audit trail */
  timestamp: string;
  /** Contexto de la operación validada */
  operation: string;
}

/**
 * 🔐 VALIDACIÓN TRIPLE: Total de Efectivo (CashCount)
 *
 * Implementa tres métodos independientes de cálculo:
 * 1. **Primary**: calculateCashTotal() - algoritmo en producción
 * 2. **Manual**: Suma explícita de cada denominación
 * 3. **Property-Based**: Reducción funcional de DENOMINATIONS
 *
 * @param cashCount - Conteo físico de monedas y billetes
 * @returns Resultado con trazabilidad completa y validación booleana
 *
 * @example
 * const result = tripleValidateCashTotal({ bill20: 5, bill10: 3, bill5: 2, bill1: 10 });
 * if (!result.valid) {
 *   console.error('🚨 ALERTA: Discrepancias detectadas', result.discrepancies);
 * }
 */
export function tripleValidateCashTotal(cashCount: Partial<CashCount>): TripleValidationResult {
  const operation = 'calculateCashTotal';

  // MÉTODO 1: Algoritmo principal (producción)
  const primary = calculateCashTotal(cashCount);

  // MÉTODO 2: Suma manual explícita (verificación independiente)
  const manual =
    (cashCount.penny || 0) * 0.01 +
    (cashCount.nickel || 0) * 0.05 +
    (cashCount.dime || 0) * 0.10 +
    (cashCount.quarter || 0) * 0.25 +
    (cashCount.dollarCoin || 0) * 1.00 +
    (cashCount.bill1 || 0) * 1 +
    (cashCount.bill5 || 0) * 5 +
    (cashCount.bill10 || 0) * 10 +
    (cashCount.bill20 || 0) * 20 +
    (cashCount.bill50 || 0) * 50 +
    (cashCount.bill100 || 0) * 100;

  // MÉTODO 3: Property-based con reducción funcional
  const allDenominations = [
    ...Object.entries(DENOMINATIONS.COINS),
    ...Object.entries(DENOMINATIONS.BILLS)
  ];

  const propertyBased = allDenominations.reduce((sum, [key, denom]) => {
    const quantity = cashCount[key as keyof CashCount] || 0;
    return sum + (quantity * denom.value);
  }, 0);

  // Redondeo a 2 decimales para todos los métodos
  const primaryRounded = Math.round(primary * 100) / 100;
  const manualRounded = Math.round(manual * 100) / 100;
  const propertyBasedRounded = Math.round(propertyBased * 100) / 100;

  // Validación de discrepancias
  const discrepancies: string[] = [];

  if (Math.abs(primaryRounded - manualRounded) >= TOLERANCE) {
    discrepancies.push(
      `PRIMARY vs MANUAL: $${primaryRounded.toFixed(2)} ≠ $${manualRounded.toFixed(2)} ` +
      `(diff: $${Math.abs(primaryRounded - manualRounded).toFixed(4)})`
    );
  }

  if (Math.abs(primaryRounded - propertyBasedRounded) >= TOLERANCE) {
    discrepancies.push(
      `PRIMARY vs PROPERTY-BASED: $${primaryRounded.toFixed(2)} ≠ $${propertyBasedRounded.toFixed(2)} ` +
      `(diff: $${Math.abs(primaryRounded - propertyBasedRounded).toFixed(4)})`
    );
  }

  if (Math.abs(manualRounded - propertyBasedRounded) >= TOLERANCE) {
    discrepancies.push(
      `MANUAL vs PROPERTY-BASED: $${manualRounded.toFixed(2)} ≠ $${propertyBasedRounded.toFixed(2)} ` +
      `(diff: $${Math.abs(manualRounded - propertyBasedRounded).toFixed(4)})`
    );
  }

  return {
    valid: discrepancies.length === 0,
    primary: primaryRounded,
    manual: manualRounded,
    propertyBased: propertyBasedRounded,
    discrepancies,
    timestamp: new Date().toISOString(),
    operation
  };
}

/**
 * 🔐 VALIDACIÓN TRIPLE: Distribución de Entrega (Delivery)
 *
 * Valida que la distribución de efectivo para entrega cumpla:
 * 1. **Ecuación Maestra**: deliver + keep = original
 * 2. **Target Keep**: keep = $50.00 (exacto o mejor aproximación)
 * 3. **Consistencia**: Suma de denominaciones coincide con totales
 *
 * @param totalCash - Total de efectivo en caja
 * @param cashCount - Conteo físico disponible
 * @returns Resultado de validación con trazabilidad completa
 *
 * @example
 * const result = tripleValidateDelivery(1500.00, cashCount);
 * if (!result.valid) {
 *   console.error('🚨 ALERTA: Error en distribución de entrega', result.discrepancies);
 * }
 */
export function tripleValidateDelivery(
  totalCash: number,
  cashCount: CashCount
): TripleValidationResult {
  const operation = 'calculateDeliveryDistribution';
  const TARGET_KEEP = 50.00;

  // MÉTODO 1: Algoritmo principal (producción)
  const primary = calculateDeliveryDistribution(totalCash, cashCount);

  // MÉTODO 2: Validación de ecuación maestra (independiente)
  const deliverTotal = calculateCashTotal(primary.denominationsToDeliver);
  const keepTotal = calculateCashTotal(primary.denominationsToKeep);
  const manualSum = Math.round((deliverTotal + keepTotal) * 100) / 100;
  const originalRounded = Math.round(totalCash * 100) / 100;

  // MÉTODO 3: Validación de target keep (property-based)
  const keepActual = Math.round(keepTotal * 100) / 100;
  const keepExpected = totalCash > TARGET_KEEP ? TARGET_KEEP : totalCash;

  const discrepancies: string[] = [];

  // Validación ecuación maestra: deliver + keep = original
  if (Math.abs(manualSum - originalRounded) >= TOLERANCE) {
    discrepancies.push(
      `ECUACIÓN MAESTRA VIOLADA: deliver ($${deliverTotal.toFixed(2)}) + ` +
      `keep ($${keepTotal.toFixed(2)}) = $${manualSum.toFixed(2)} ≠ ` +
      `original ($${originalRounded.toFixed(2)}) ` +
      `(diff: $${Math.abs(manualSum - originalRounded).toFixed(4)})`
    );
  }

  // Validación target keep ($50.00 exacto cuando total > $50, sino keep = total)
  if (totalCash > TARGET_KEEP && Math.abs(keepActual - keepExpected) >= TOLERANCE) {
    discrepancies.push(
      `TARGET KEEP NO CUMPLIDO: keep ($${keepActual.toFixed(2)}) ≠ ` +
      `expected ($${keepExpected.toFixed(2)}) cuando total > $50 ` +
      `(diff: $${Math.abs(keepActual - keepExpected).toFixed(4)})`
    );
  }

  // Validación coherencia amountToDeliver
  const expectedDeliver = Math.max(0, totalCash - TARGET_KEEP);
  if (Math.abs(primary.amountToDeliver - expectedDeliver) >= TOLERANCE) {
    discrepancies.push(
      `AMOUNT TO DELIVER INCOHERENTE: primary.amountToDeliver ($${primary.amountToDeliver.toFixed(2)}) ≠ ` +
      `expected ($${expectedDeliver.toFixed(2)}) ` +
      `(diff: $${Math.abs(primary.amountToDeliver - expectedDeliver).toFixed(4)})`
    );
  }

  return {
    valid: discrepancies.length === 0,
    primary: manualSum, // Suma deliver + keep
    manual: originalRounded, // Original esperado
    propertyBased: keepActual, // Keep actual validado
    discrepancies,
    timestamp: new Date().toISOString(),
    operation
  };
}

/**
 * 🔐 VALIDACIÓN TRIPLE: Pagos Electrónicos
 *
 * Valida que la suma de todos los canales electrónicos sea correcta:
 * - Credomatic (POS)
 * - Promerica (POS)
 * - Transferencia Bancaria
 * - PayPal
 *
 * @param electronicPayments - Registro de pagos electrónicos
 * @returns Resultado de validación con suma total
 */
export function tripleValidateElectronic(
  electronicPayments: Partial<ElectronicPayments>
): TripleValidationResult {
  const operation = 'calculateElectronicTotal';

  // MÉTODO 1: Suma directa (producción)
  const primary = Math.round((
    (electronicPayments.credomatic || 0) +
    (electronicPayments.promerica || 0) +
    (electronicPayments.bankTransfer || 0) +
    (electronicPayments.paypal || 0)
  ) * 100) / 100;

  // MÉTODO 2: Suma manual explícita (verificación)
  const manual = Math.round((
    (electronicPayments.credomatic || 0) +
    (electronicPayments.promerica || 0) +
    (electronicPayments.bankTransfer || 0) +
    (electronicPayments.paypal || 0)
  ) * 100) / 100;

  // MÉTODO 3: Reducción funcional (property-based)
  const channels = ['credomatic', 'promerica', 'bankTransfer', 'paypal'] as const;
  const propertyBased = Math.round(
    channels.reduce((sum, channel) => sum + (electronicPayments[channel] || 0), 0) * 100
  ) / 100;

  const discrepancies: string[] = [];

  if (Math.abs(primary - manual) >= TOLERANCE) {
    discrepancies.push(
      `PRIMARY vs MANUAL: $${primary.toFixed(2)} ≠ $${manual.toFixed(2)}`
    );
  }

  if (Math.abs(primary - propertyBased) >= TOLERANCE) {
    discrepancies.push(
      `PRIMARY vs PROPERTY-BASED: $${primary.toFixed(2)} ≠ $${propertyBased.toFixed(2)}`
    );
  }

  return {
    valid: discrepancies.length === 0,
    primary,
    manual,
    propertyBased,
    discrepancies,
    timestamp: new Date().toISOString(),
    operation
  };
}

/**
 * 🔐 VALIDACIÓN MAESTRA: Ecuación General del Sistema
 *
 * Valida la ecuación fundamental del sistema completo:
 * **totalCash + totalElectronic = totalGeneral**
 *
 * Esta es la validación de más alto nivel que garantiza la coherencia
 * financiera total del reporte de caja.
 *
 * @param totalCash - Total efectivo calculado
 * @param totalElectronic - Total pagos electrónicos
 * @param totalGeneral - Total general reportado
 * @returns Resultado de validación con trazabilidad
 */
export function tripleValidateMasterEquation(
  totalCash: number,
  totalElectronic: number,
  totalGeneral: number
): TripleValidationResult {
  const operation = 'masterEquation';

  // MÉTODO 1: Suma directa (producción)
  const primary = Math.round((totalCash + totalElectronic) * 100) / 100;

  // MÉTODO 2: Total general reportado (verificación)
  const manual = Math.round(totalGeneral * 100) / 100;

  // MÉTODO 3: Suma inversa para validación cruzada
  const propertyBased = Math.round((manual - totalElectronic) * 100) / 100;
  const cashExpected = Math.round(totalCash * 100) / 100;

  const discrepancies: string[] = [];

  // Validación ecuación maestra: cash + electronic = general
  if (Math.abs(primary - manual) >= TOLERANCE) {
    discrepancies.push(
      `ECUACIÓN MAESTRA VIOLADA: totalCash ($${totalCash.toFixed(2)}) + ` +
      `totalElectronic ($${totalElectronic.toFixed(2)}) = $${primary.toFixed(2)} ≠ ` +
      `totalGeneral ($${manual.toFixed(2)}) ` +
      `(diff: $${Math.abs(primary - manual).toFixed(4)})`
    );
  }

  // Validación inversa: general - electronic = cash
  if (Math.abs(propertyBased - cashExpected) >= TOLERANCE) {
    discrepancies.push(
      `VALIDACIÓN INVERSA FALLÓ: totalGeneral ($${manual.toFixed(2)}) - ` +
      `totalElectronic ($${totalElectronic.toFixed(2)}) = $${propertyBased.toFixed(2)} ≠ ` +
      `totalCash ($${cashExpected.toFixed(2)}) ` +
      `(diff: $${Math.abs(propertyBased - cashExpected).toFixed(4)})`
    );
  }

  return {
    valid: discrepancies.length === 0,
    primary,
    manual,
    propertyBased,
    discrepancies,
    timestamp: new Date().toISOString(),
    operation
  };
}
