// 🤖 [IA] - v1.3.0: MÓDULO 1 - Sistema Blind Verification con Triple Intento Anti-Fraude
/**
 * @file verification.ts
 * @description Tipos TypeScript para sistema de verificación ciega (blind count)
 *              con lógica triple intento y detección de manipulación.
 *
 * @remarks
 * Este archivo define la arquitectura completa de tipos para el sistema anti-fraude:
 *
 * **1. VerificationAttempt:** Registro individual de cada intento por denominación
 *    - Tracking de valores ingresados vs esperados
 *    - Timestamp ISO 8601 para correlación con video vigilancia
 *    - Campo `attemptNumber` con literal type (1 | 2 | 3) para seguridad de tipos
 *
 * **2. VerificationSeverity:** Clasificación de comportamiento empleado
 *    - `success`: Primer intento correcto (90% casos esperados)
 *    - `warning_*`: Segundo intento correcto o override silencioso (10% casos)
 *    - `critical_*`: Triple intento con inconsistencias (<2% casos graves)
 *
 * **3. ThirdAttemptResult:** Análisis lógica de repetición pattern
 *    - Detecta patrón: [A, A, B], [A, B, A], [B, A, A] → 2 de 3 coinciden
 *    - Severidad automática: inconsistent (2 match) vs severe (3 diferentes)
 *    - Razón técnica para reportes gerenciales
 *
 * **4. VerificationBehavior:** Agregación métricas completas
 *    - Totaliza éxitos primer/segundo/tercer intento
 *    - Arrays de denominaciones problemáticas por categoría
 *    - Historial completo para auditoría post-cierre
 *
 * @see {@link Plan_Vuelto_Ciego.md} Sección "Propuesta Técnica Detallada"
 * @see {@link useBlindVerification.ts} Lógica de implementación (MÓDULO 2)
 * @see {@link BlindVerificationModal.tsx} UI rendering (MÓDULO 3)
 *
 * @version 1.3.0
 * @date 2025-10-04
 * @author Claude Code (IA)
 *
 * @example Importar tipos en hooks/components
 * ```typescript
 * import type {
 *   VerificationAttempt,
 *   VerificationBehavior,
 *   ThirdAttemptResult
 * } from '@/types/verification';
 *
 * // Ejemplo: Crear intento fallido (será reintentado)
 * const attempt: VerificationAttempt = {
 *   stepKey: 'quarter',      // Denominación verificada
 *   attemptNumber: 1,         // Primer intento
 *   inputValue: 8,            // Empleado ingresó 8 quarters
 *   expectedValue: 10,        // Sistema esperaba 10 quarters (OCULTO)
 *   isCorrect: false,         // 8 !== 10 → REINTENTO REQUERIDO
 *   timestamp: '2025-10-04T14:23:15.123Z'  // ISO 8601 para video correlación
 * };
 * ```
 */

// 🤖 [IA] - Import tipo CashCount para tipar denominaciones (penny → hundred)
import type { CashCount } from './cash';

/**
 * Registro individual de cada intento de verificación
 *
 * @example
 * ```typescript
 * const attempt: VerificationAttempt = {
 *   stepKey: 'quarter',
 *   attemptNumber: 1,
 *   inputValue: 8,
 *   expectedValue: 10,
 *   isCorrect: false,
 *   timestamp: '2025-10-03T14:23:15.123Z'
 * };
 * ```
 */
export interface VerificationAttempt {
  /** Denominación verificada (ej: 'quarter', 'fiveDollar') */
  stepKey: keyof CashCount;

  /** Número de intento: 1, 2, o 3 */
  attemptNumber: 1 | 2 | 3;

  /** Valor ingresado por el empleado */
  inputValue: number;

  /** Valor esperado por el sistema (oculto al empleado) */
  expectedValue: number;

  /** Indica si el valor ingresado coincide con el esperado */
  isCorrect: boolean;

  /** Timestamp ISO 8601 del intento (para correlacionar con video vigilancia) */
  timestamp: string;
}

/**
 * Nivel de severidad de comportamiento de verificación
 *
 * @remarks
 * - `success`: Primer intento correcto (90% casos esperados) - CERO fricción
 * - `warning_retry`: Segundo intento correcto (recuperación) - warning leve
 * - `warning_override`: Dos intentos iguales incorrectos (forzado silencioso)
 * - `critical_inconsistent`: Triple intento, 2 de 3 coinciden (FALTA GRAVE)
 * - `critical_severe`: Tres intentos totalmente diferentes (FALTA MUY GRAVE)
 */
export type VerificationSeverity =
  | 'success'               // Primer intento correcto
  | 'warning_retry'         // Segundo intento correcto
  | 'warning_override'      // Dos intentos iguales incorrectos (forzado)
  | 'critical_inconsistent' // Tres intentos, 2 coinciden (GRAVE)
  | 'critical_severe';      // Tres intentos totalmente diferentes (MUY GRAVE)

/**
 * Resultado del análisis de tercer intento
 *
 * @remarks
 * Utilizado cuando 2 primeros intentos son diferentes e incorrectos.
 * Sistema requiere tercer intento obligatorio y analiza lógica de repetición.
 *
 * @example
 * ```typescript
 * // Caso: Intentos 1+3 coinciden
 * const result: ThirdAttemptResult = {
 *   acceptedValue: 8,
 *   severity: 'critical_inconsistent',
 *   reason: 'Intentos 1 y 3 coinciden (Intento 2 erróneo)',
 *   attempts: [8, 12, 8]
 * };
 * ```
 */
export interface ThirdAttemptResult {
  /** Valor que el sistema acepta como correcto (puede ser intento 1, 2, o 3) */
  acceptedValue: number;

  /** Severidad del comportamiento detectado */
  severity: 'critical_inconsistent' | 'critical_severe';

  /** Razón técnica de la decisión (para reportes gerenciales) */
  reason: string;

  /** Array con los 3 valores ingresados [intento1, intento2, intento3] */
  attempts: [number, number, number];
}

/**
 * Agregación completa de comportamiento de verificación
 *
 * @remarks
 * Almacena métricas totales + historial completo de intentos.
 * Utilizado para análisis post-cierre y reportes gerenciales.
 *
 * @see Phase3Results.tsx - Sección "🚨 Alertas de Verificación"
 */
export interface VerificationBehavior {
  /** Total de denominaciones verificadas (ej: 15 denominaciones) */
  totalAttempts: number;

  /** Cantidad de denominaciones correctas en primer intento (meta: >85%) */
  firstAttemptSuccesses: number;

  /** Cantidad de denominaciones correctas en segundo intento (recuperaciones) */
  secondAttemptSuccesses: number;

  /** Cantidad de denominaciones que requirieron tercer intento obligatorio */
  thirdAttemptRequired: number;

  /** Cantidad de overrides forzados (Escenario 2: 2 intentos iguales incorrectos) */
  forcedOverrides: number;

  /** Cantidad de faltas GRAVES (Escenario 3: triple intento, 2 coinciden) */
  criticalInconsistencies: number;

  /** Cantidad de faltas MUY GRAVES (Escenario 3c: 3 intentos totalmente diferentes) */
  severeInconsistencies: number;

  /** Historial completo de TODOS los intentos (para auditoría) */
  attempts: VerificationAttempt[];

  /** Array de severidades por denominación (para análisis rápido) */
  severityFlags: VerificationSeverity[];

  /** Arrays de denominaciones por categoría (para reportes) */
  forcedOverridesDenoms: Array<keyof CashCount>;      // ["nickel", "dime"]
  criticalInconsistenciesDenoms: Array<keyof CashCount>; // ["quarter"]
  severeInconsistenciesDenoms: Array<keyof CashCount>;   // ["penny"]
}
