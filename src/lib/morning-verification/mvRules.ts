/**
 * 🤖 [IA] - v1.4.1: mvRules - Reglas de negocio verificación matutina (ORDEN #074)
 * Extraído de MorningVerification.tsx (líneas 61-110)
 *
 * @description
 * Funciones puras de negocio: verificación de caja, hash digital,
 * constantes de thresholds y utilidad floating-point.
 */
import type { CashCount } from '@/types/cash';
import type { VerificationData } from '@/types/morningVerification';
import { calculateCashTotal } from '@/utils/calculations';
import { formatVerificationTimestamp } from './mvFormatters';

// ────────────────────────────────────────────────────────────────
// Constantes de negocio
// ────────────────────────────────────────────────────────────────

/** Monto esperado de cambio ($50 USD) - requisito negocio Paradise */
export const EXPECTED_AMOUNT = 50;

/** Tolerancia para considerar conteo "correcto" (1 centavo) */
export const CORRECT_THRESHOLD = 0.01;

/** Umbral para marcar faltante significativo */
export const SHORTAGE_THRESHOLD = -1.00;

/** Umbral para marcar sobrante significativo */
export const EXCESS_THRESHOLD = 1.00;

// ────────────────────────────────────────────────────────────────
// Utilidad floating-point (Ajuste #2 ORDEN #074)
// ────────────────────────────────────────────────────────────────

/**
 * Redondea a 2 decimales evitando errores IEEE 754
 * @example roundTo2(49.999999999) → 50.00
 */
export function roundTo2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ────────────────────────────────────────────────────────────────
// Verificación de caja (monolito líneas 61-86)
// ────────────────────────────────────────────────────────────────

/**
 * Ejecuta verificación de caja matutina contra monto esperado
 *
 * @param cashCount - Denominaciones contadas
 * @param expectedAmount - Monto esperado (default: $50)
 * @returns Datos de verificación con totales, diferencia y flags
 */
export function performVerification(
  cashCount: CashCount,
  expectedAmount = EXPECTED_AMOUNT
): VerificationData {
  const totalCash = roundTo2(calculateCashTotal(cashCount));
  const difference = roundTo2(totalCash - expectedAmount);
  const isCorrect = Math.abs(difference) < CORRECT_THRESHOLD;

  return {
    totalCash,
    expectedAmount,
    difference,
    isCorrect,
    hasShortage: difference < SHORTAGE_THRESHOLD,
    hasExcess: difference > EXCESS_THRESHOLD,
    timestamp: formatVerificationTimestamp(),
  };
}

// ────────────────────────────────────────────────────────────────
// Firma digital (monolito líneas 92-110)
// ────────────────────────────────────────────────────────────────

/**
 * Genera hash base64 de 16 caracteres como firma digital del reporte.
 * Algoritmo: btoa(JSON.stringify({...})).substring(0, 16)
 *
 * @remarks
 * Mantener algoritmo exacto (btoa + JSON.stringify) para determinismo.
 * Snapshot test con input fijo valida 0 regression (Ajuste #1 ORDEN #074).
 */
export function generateDataHash(
  data: VerificationData,
  storeId: string | undefined,
  cashierInId: string | undefined,
  cashierOutId: string | undefined
): string {
  const dataString = JSON.stringify({
    total: data.totalCash,
    expected: data.expectedAmount,
    diff: data.difference,
    store: storeId,
    cashierIn: cashierInId,
    cashierOut: cashierOutId,
    timestamp: data.timestamp,
  });
  return btoa(dataString).substring(0, 16);
}

// ────────────────────────────────────────────────────────────────
// Regla anti-fraude (recomendado ORDEN #074)
// ────────────────────────────────────────────────────────────────

/**
 * Determina si resultados deben estar bloqueados.
 * Lógica anti-fraude: resultados solo visibles después de enviar reporte.
 */
export function shouldBlockResults(reportSent: boolean): boolean {
  return !reportSent;
}
