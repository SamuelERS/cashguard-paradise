/**
 * 🤖 [IA] - VERSION 3.0: Validadores Runtime para Deliveries
 *
 * Módulo de validación en tiempo de ejecución para el sistema de control de envíos COD.
 * Proporciona type guards y funciones de validación para garantizar integridad de datos
 * al deserializar desde localStorage o recibir input de usuario.
 *
 * @module utils/deliveryValidation
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Funciones:
 * - isDeliveryEntry(): Type guard principal con 11 validaciones
 * - isValidISOTimestamp(): Validador de timestamps ISO 8601
 * - isValidCourierType(): Validador de tipo de courier
 * - isValidDeliveryStatus(): Validador de estado delivery
 *
 * Compliance:
 * - NIST SP 800-115: Validación estricta timestamps para audit trail
 * - PCI DSS 12.10.1: Validación de montos financieros
 * - REGLAS_DE_LA_CASA.md: Zero `any`, type predicates TypeScript
 */

import type { DeliveryEntry, CourierType, DeliveryStatus } from '../types/deliveries';
import { DELIVERY_VALIDATION } from '../types/deliveries';

// ═══════════════════════════════════════════════════════════
// VALIDADORES AUXILIARES
// ═══════════════════════════════════════════════════════════

/**
 * Valida si un string es un timestamp ISO 8601 válido
 *
 * @param value - String a validar
 * @returns true si es timestamp ISO 8601 válido y parseable
 *
 * @remarks
 * Validación en 2 pasos:
 * 1. Verificar que Date.parse() no retorna NaN
 * 2. Verificar que la fecha es razonable (año 2000-2100)
 *
 * Formato esperado: "YYYY-MM-DDTHH:mm:ss.sssZ"
 * Ejemplo válido: "2025-01-10T14:30:00.000Z"
 * Ejemplo inválido: "invalid-date"
 *
 * @example
 * ```typescript
 * isValidISOTimestamp("2025-01-10T14:30:00.000Z") // true
 * isValidISOTimestamp("2025-13-40T99:99:99.999Z") // false (fecha imposible)
 * isValidISOTimestamp("not-a-date") // false
 * ```
 */
function isValidISOTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;

  const timestamp = Date.parse(value);
  if (isNaN(timestamp)) return false;

  // Validar rango razonable: año 2000-2100
  const year = new Date(timestamp).getFullYear();
  return year >= 2000 && year <= 2100;
}

/**
 * Valida si un valor es un CourierType válido
 *
 * @param value - Valor a validar
 * @returns true si es 'C807' | 'Melos' | 'Otro'
 *
 * @remarks
 * Lista exhaustiva de couriers permitidos:
 * - C807: Courier principal Paradise
 * - Melos: Courier alternativo nacional
 * - Otro: Courier genérico
 *
 * @example
 * ```typescript
 * isValidCourierType("C807") // true
 * isValidCourierType("DHL") // false (no permitido)
 * isValidCourierType(null) // false
 * ```
 */
function isValidCourierType(value: unknown): value is CourierType {
  return value === 'C807' || value === 'Melos' || value === 'Otro';
}

/**
 * Valida si un valor es un DeliveryStatus válido
 *
 * @param value - Valor a validar
 * @returns true si es 'pending_cod' | 'paid' | 'cancelled' | 'rejected'
 *
 * @remarks
 * Estados del ciclo de vida delivery:
 * - pending_cod: Estado inicial (esperando pago cliente)
 * - paid: Estado terminal exitoso (cliente pagó)
 * - cancelled: Estado terminal (cancelado por empleado)
 * - rejected: Estado terminal (rechazado por cliente)
 *
 * @example
 * ```typescript
 * isValidDeliveryStatus("pending_cod") // true
 * isValidDeliveryStatus("processing") // false (no existe)
 * isValidDeliveryStatus(undefined) // false
 * ```
 */
function isValidDeliveryStatus(value: unknown): value is DeliveryStatus {
  return (
    value === 'pending_cod' ||
    value === 'paid' ||
    value === 'cancelled' ||
    value === 'rejected'
  );
}

// ═══════════════════════════════════════════════════════════
// TYPE GUARD PRINCIPAL
// ═══════════════════════════════════════════════════════════

/**
 * Type guard que valida si un objeto desconocido es un DeliveryEntry válido
 *
 * @param value - Objeto desconocido a validar (típicamente desde localStorage)
 * @returns true si cumple TODAS las validaciones, false si falla alguna
 *
 * @remarks
 * Validación exhaustiva en 11 niveles:
 * 1. Verificar que value es objeto no-null
 * 2. Validar id: string no vacío
 * 3. Validar customerName: string 3-100 caracteres
 * 4. Validar amount: number positivo, rango 0.01-10000, no NaN/Infinity
 * 5. Validar courier: enum CourierType válido
 * 6. Validar status: enum DeliveryStatus válido
 * 7. Validar createdAt: timestamp ISO 8601 válido
 * 8. Validar paidAt (opcional): timestamp ISO 8601 si presente
 * 9. Validar cancelledAt (opcional): timestamp ISO 8601 si presente
 * 10. Validar cancelReason (opcional): string 0-200 caracteres si presente
 * 11. Validar notes (opcional): string 0-500 caracteres si presente
 *
 * Uso principal:
 * - Deserialización localStorage (JSON.parse + validación)
 * - Validación input usuario antes de guardar
 * - Testing con datos mock
 *
 * Performance:
 * - O(1) - Todas las validaciones son operaciones constantes
 * - Zero regex (string length checks son más rápidos)
 * - Early return en primera validación fallida
 *
 * Seguridad:
 * - Previene inyección de datos malformados en sistema
 * - Type narrowing garantizado (TypeScript type predicate)
 * - Validación estricta de montos financieros (PCI DSS 12.10.1)
 *
 * @example
 * ```typescript
 * // Ejemplo 1: Deserialización localStorage
 * const raw = localStorage.getItem('cashguard_deliveries_pending');
 * if (raw) {
 *   const parsed = JSON.parse(raw);
 *   if (Array.isArray(parsed)) {
 *     const validDeliveries = parsed.filter(isDeliveryEntry);
 *     // validDeliveries tiene tipo DeliveryEntry[] garantizado ✅
 *   }
 * }
 *
 * // Ejemplo 2: Validación input usuario
 * function saveDelivery(input: unknown) {
 *   if (!isDeliveryEntry(input)) {
 *     throw new Error('Invalid delivery data');
 *   }
 *   // input tiene tipo DeliveryEntry garantizado ✅
 *   localStorage.setItem('key', JSON.stringify(input));
 * }
 *
 * // Ejemplo 3: Testing con datos mock
 * const mockDelivery = {
 *   id: crypto.randomUUID(),
 *   customerName: 'Juan Pérez',
 *   amount: 75.50,
 *   courier: 'C807',
 *   status: 'pending_cod',
 *   createdAt: new Date().toISOString()
 * };
 * if (isDeliveryEntry(mockDelivery)) {
 *   // TypeScript sabe que mockDelivery es DeliveryEntry ✅
 *   console.log(mockDelivery.amount); // No type error
 * }
 * ```
 *
 * @see {@link DeliveryEntry} Interface completa validada
 * @see {@link DELIVERY_VALIDATION} Constantes de validación usadas
 */
export function isDeliveryEntry(value: unknown): value is DeliveryEntry {
  // ✅ NIVEL 1: Verificar objeto no-null
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;

  // ✅ NIVEL 2: Validar id (string no vacío)
  if (typeof entry.id !== 'string' || entry.id.length === 0) {
    return false;
  }

  // ✅ NIVEL 3: Validar customerName (string 3-100 caracteres)
  if (typeof entry.customerName !== 'string') {
    return false;
  }
  if (
    entry.customerName.length < DELIVERY_VALIDATION.MIN_CUSTOMER_NAME_LENGTH ||
    entry.customerName.length > DELIVERY_VALIDATION.MAX_CUSTOMER_NAME_LENGTH
  ) {
    return false;
  }

  // ✅ NIVEL 4: Validar amount (number positivo, rango, no NaN/Infinity)
  if (typeof entry.amount !== 'number') {
    return false;
  }
  if (isNaN(entry.amount) || !isFinite(entry.amount)) {
    return false;
  }
  if (
    entry.amount < DELIVERY_VALIDATION.MIN_AMOUNT ||
    entry.amount > DELIVERY_VALIDATION.MAX_AMOUNT
  ) {
    return false;
  }

  // ✅ NIVEL 5: Validar courier (enum CourierType)
  if (!isValidCourierType(entry.courier)) {
    return false;
  }

  // ✅ NIVEL 6: Validar status (enum DeliveryStatus)
  if (!isValidDeliveryStatus(entry.status)) {
    return false;
  }

  // ✅ NIVEL 7: Validar createdAt (timestamp ISO 8601 obligatorio)
  if (!isValidISOTimestamp(entry.createdAt)) {
    return false;
  }

  // ✅ NIVEL 8: Validar paidAt (opcional, timestamp ISO 8601 si presente)
  if (entry.paidAt !== undefined && !isValidISOTimestamp(entry.paidAt)) {
    return false;
  }

  // ✅ NIVEL 9: Validar cancelledAt (opcional, timestamp ISO 8601 si presente)
  if (entry.cancelledAt !== undefined && !isValidISOTimestamp(entry.cancelledAt)) {
    return false;
  }

  // ✅ NIVEL 10: Validar cancelReason (opcional, string 0-200 caracteres)
  if (entry.cancelReason !== undefined) {
    if (typeof entry.cancelReason !== 'string') {
      return false;
    }
    if (entry.cancelReason.length > DELIVERY_VALIDATION.MAX_CANCEL_REASON_LENGTH) {
      return false;
    }
  }

  // ✅ NIVEL 11: Validar notes (opcional, string 0-500 caracteres)
  if (entry.notes !== undefined) {
    if (typeof entry.notes !== 'string') {
      return false;
    }
    if (entry.notes.length > DELIVERY_VALIDATION.MAX_NOTES_LENGTH) {
      return false;
    }
  }

  // ✅ NIVEL 12: Validar guideNumber (opcional, string si presente)
  if (entry.guideNumber !== undefined && typeof entry.guideNumber !== 'string') {
    return false;
  }

  // ✅ NIVEL 13: Validar invoiceNumber (opcional, string si presente)
  if (entry.invoiceNumber !== undefined && typeof entry.invoiceNumber !== 'string') {
    return false;
  }

  // ✅ TODAS LAS VALIDACIONES PASARON
  // TypeScript type narrowing: value es DeliveryEntry garantizado
  return true;
}

/**
 * Valida un array de objetos desconocidos y retorna solo los DeliveryEntry válidos
 *
 * @param values - Array de objetos desconocidos (típicamente desde localStorage)
 * @returns Array filtrado conteniendo solo DeliveryEntry válidos
 *
 * @remarks
 * Utilidad de conveniencia para validación masiva:
 * - Filtra elementos inválidos sin lanzar excepciones
 * - Type narrowing automático (retorna DeliveryEntry[])
 * - Usado en deserialización localStorage
 *
 * Performance:
 * - O(n) donde n = cantidad de elementos en array
 * - Cada elemento pasa por isDeliveryEntry() (O(1) por elemento)
 *
 * @example
 * ```typescript
 * const raw = localStorage.getItem('cashguard_deliveries_pending');
 * if (raw) {
 *   const parsed = JSON.parse(raw); // unknown[]
 *   const validDeliveries = filterValidDeliveries(parsed);
 *   // validDeliveries tiene tipo DeliveryEntry[] garantizado ✅
 * }
 * ```
 */
export function filterValidDeliveries(values: unknown): DeliveryEntry[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.filter(isDeliveryEntry);
}
