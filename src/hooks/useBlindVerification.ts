// 🤖 [IA] - v1.3.0: MÓDULO 2 - Hook lógica verificación ciega
// Implementa flujo triple intento + análisis de repetición pattern

/**
 * @file useBlindVerification.ts
 * @description Hook para gestionar sistema de verificación ciega con triple intento anti-fraude
 *
 * @remarks
 * Este hook implementa la lógica completa del Sistema Blind Verification:
 *
 * **Funciones Core:**
 * 1. `analyzeThirdAttempt()` - Analiza pattern de repetición en 3 intentos
 * 2. `validateAttempt()` - Crea objeto VerificationAttempt con timestamp ISO 8601
 * 3. `handleVerificationFlow()` - Switch escenarios basado en historial intentos
 * 4. `getVerificationMessages()` - Genera mensajes UI profesionales por severidad
 *
 * **Escenarios Soportados:**
 * - Escenario 1: Correcto primer intento (90% casos) → continue
 * - Escenario 2a: 2 intentos iguales incorrectos → force_override
 * - Escenario 2b: 2 intentos diferentes → require_third
 * - Escenario 3: Triple intento → analyze pattern [A,A,B], [A,B,A], [A,B,C]
 *
 * @see {@link Plan_Vuelto_Ciego.md} Sección "Escenarios de Verificación" (líneas 152-210)
 * @see {@link verification.ts} Tipos TypeScript utilizados (MÓDULO 1)
 * @see {@link BlindVerificationModal.tsx} UI rendering (MÓDULO 3 - futuro)
 *
 * @version 1.3.0
 * @date 2025-10-05
 * @author Claude Code (IA)
 *
 * @example Uso básico en componente
 * ```tsx
 * const { validateAttempt, handleVerificationFlow } = useBlindVerification({
 *   quarter: 10,
 *   nickel: 20
 * });
 *
 * // Registrar primer intento
 * const attempt = validateAttempt('quarter', 1, 8, 10);
 * const flowResult = handleVerificationFlow('quarter', [attempt]);
 *
 * if (flowResult.nextAction === 'continue') {
 *   // Avanzar a siguiente denominación
 * } else if (flowResult.nextAction === 'require_third') {
 *   // Mostrar modal crítico
 * }
 * ```
 */

import { useState, useCallback } from 'react';
import type {
  VerificationAttempt,
  VerificationBehavior,
  VerificationSeverity,
  ThirdAttemptResult
} from '@/types/verification';
import type { CashCount } from '@/types/cash';

/**
 * Tipo de retorno para handleVerificationFlow
 */
export interface VerificationFlowResult {
  nextAction: 'continue' | 'force_override' | 'require_third' | 'analyze';
  severity: VerificationSeverity;
  messageData: {
    title: string;
    message: string;
    variant: 'info' | 'warning' | 'error';
  };
  thirdAttemptResult?: ThirdAttemptResult;
}

/**
 * Analiza 3 intentos y determina valor aceptado + severidad según pattern de repetición
 *
 * @param attempts - Tuple [intento1, intento2, intento3]
 * @returns ThirdAttemptResult con lógica 2-de-3 coinciden
 *
 * @remarks
 * Lógica implementada:
 * - Pattern [A, A, B]: 2 intentos coinciden → acceptedValue = A, severity: critical_inconsistent
 * - Pattern [A, B, A]: 2 intentos coinciden → acceptedValue = A, severity: critical_inconsistent
 * - Pattern [A, B, B]: 2 intentos coinciden → acceptedValue = B, severity: critical_inconsistent
 * - Pattern [A, B, C]: 3 diferentes → acceptedValue = C (último), severity: critical_severe
 *
 * Política ZERO TOLERANCE: Cualquier discrepancia se reporta (desde $0.01 a $10,000)
 *
 * @example
 * ```typescript
 * // Caso: Intentos [8, 12, 8] → Acepta 8 (coincide con intento 1 y 3)
 * const result = analyzeThirdAttempt([8, 12, 8]);
 * // result = {
 * //   acceptedValue: 8,
 * //   severity: 'critical_inconsistent',
 * //   reason: 'Intentos 1 y 3 coinciden (8). Intento 2 fue erróneo (12).',
 * //   attempts: [8, 12, 8]
 * // }
 * ```
 */
export function analyzeThirdAttempt(attempts: [number, number, number]): ThirdAttemptResult {
  const [attempt1, attempt2, attempt3] = attempts;

  // 🤖 [IA] - v1.3.0: Pattern matching - 2 de 3 intentos coinciden
  if (attempt1 === attempt2 && attempt1 !== attempt3) {
    // Pattern [A, A, B] - Intentos 1 y 2 coinciden
    return {
      acceptedValue: attempt1,
      severity: 'critical_inconsistent',
      reason: `Intentos 1 y 2 coinciden (${attempt1}). Intento 3 fue erróneo (${attempt3}).`,
      attempts: [attempt1, attempt2, attempt3]
    };
  } else if (attempt1 === attempt3 && attempt1 !== attempt2) {
    // Pattern [A, B, A] - Intentos 1 y 3 coinciden
    return {
      acceptedValue: attempt1,
      severity: 'critical_inconsistent',
      reason: `Intentos 1 y 3 coinciden (${attempt1}). Intento 2 fue erróneo (${attempt2}).`,
      attempts: [attempt1, attempt2, attempt3]
    };
  } else if (attempt2 === attempt3 && attempt2 !== attempt1) {
    // Pattern [A, B, B] - Intentos 2 y 3 coinciden
    return {
      acceptedValue: attempt2,
      severity: 'critical_inconsistent',
      reason: `Intentos 2 y 3 coinciden (${attempt2}). Intento 1 fue erróneo (${attempt1}).`,
      attempts: [attempt1, attempt2, attempt3]
    };
  } else {
    // 🤖 [IA] - v1.3.6i: Pattern [A, B, C] - Acepta PROMEDIO MATEMÁTICO (anti-manipulación)
    // ANTES v1.3.0: Aceptaba attempt3 (último) → vulnerable a fraude por orden temporal
    // AHORA v1.3.6i: Promedio redondeado → estadísticamente justo + anti-manipulación
    // Beneficios: Estándar industria auditorías + minimiza error + empleado NO puede forzar resultado
    const averageValue = Math.round((attempt1 + attempt2 + attempt3) / 3);

    return {
      acceptedValue: averageValue,
      severity: 'critical_severe',
      reason: `3 intentos totalmente inconsistentes (${attempt1}, ${attempt2}, ${attempt3}). Valor aceptado: promedio matemático (${averageValue}). Reporte crítico a gerencia obligatorio.`,
      attempts: [attempt1, attempt2, attempt3]
    };
  }
}

/**
 * Crea objeto VerificationAttempt con validación y timestamp ISO 8601
 *
 * @param stepKey - Denominación verificada (ej: 'quarter', 'nickel', 'bill20')
 * @param attemptNumber - Número de intento (literal type 1 | 2 | 3)
 * @param inputValue - Valor ingresado por empleado (conteo ciego)
 * @param expectedValue - Valor esperado del sistema (oculto durante conteo)
 * @returns VerificationAttempt completo con timestamp ISO 8601 para correlación video
 *
 * @remarks
 * - Timestamp usa `new Date().toISOString()` para precisión milisegundos
 * - Campo `isCorrect` compara `inputValue === expectedValue` (strict equality)
 * - Formato ISO 8601: "2025-10-05T14:23:15.123Z" (UTC timezone)
 *
 * @example
 * ```typescript
 * const attempt = validateAttempt('quarter', 1, 10, 10);
 * // {
 * //   stepKey: 'quarter',
 * //   attemptNumber: 1,
 * //   inputValue: 10,
 * //   expectedValue: 10,
 * //   isCorrect: true,
 * //   timestamp: '2025-10-05T14:23:15.123Z'
 * // }
 * ```
 */
export function validateAttempt(
  stepKey: keyof CashCount,
  attemptNumber: 1 | 2 | 3,
  inputValue: number,
  expectedValue: number
): VerificationAttempt {
  // 🤖 [IA] - v1.3.0: Strict equality para validación (no >=, <=)
  const isCorrect = inputValue === expectedValue;

  // 🤖 [IA] - v1.3.0: Timestamp ISO 8601 con precisión milisegundos
  const timestamp = new Date().toISOString();

  return {
    stepKey,
    attemptNumber,
    inputValue,
    expectedValue,
    isCorrect,
    timestamp
  };
}

/**
 * Switch escenarios basado en historial de intentos por denominación
 *
 * @param stepKey - Denominación actual
 * @param attempts - Array de VerificationAttempt para esta denominación (1-3 intentos)
 * @returns VerificationFlowResult con nextAction + messageData + optional thirdAttemptResult
 *
 * @remarks
 * **Escenarios implementados:**
 *
 * 1. **Primer intento correcto (1 attempt, isCorrect: true)**
 *    - nextAction: 'continue'
 *    - severity: 'success'
 *    - message: "Conteo correcto"
 *    - variant: 'info'
 *
 * 2a. **2 intentos iguales incorrectos (2 attempts, ambos === mismos valores)**
 *    - nextAction: 'force_override'
 *    - severity: 'warning_override'
 *    - message: "Segundo intento idéntico. Forzar cantidad y continuar"
 *    - variant: 'warning'
 *
 * 2b. **2 intentos diferentes (2 attempts, valores distintos)**
 *    - nextAction: 'require_third'
 *    - severity: 'warning_retry'
 *    - message: "Los 2 intentos son montos diferentes..."
 *    - variant: 'error'
 *
 * 3. **Triple intento (3 attempts)**
 *    - nextAction: 'analyze'
 *    - severity: 'critical_inconsistent' | 'critical_severe'
 *    - thirdAttemptResult: Resultado de analyzeThirdAttempt()
 *    - variant: 'error'
 *
 * @example
 * ```typescript
 * // Escenario 1: Correcto primer intento
 * const result = handleVerificationFlow('quarter', [
 *   { stepKey: 'quarter', attemptNumber: 1, inputValue: 10, expectedValue: 10, isCorrect: true, timestamp: '...' }
 * ]);
 * // result.nextAction === 'continue'
 *
 * // Escenario 2b: 2 intentos diferentes
 * const result2 = handleVerificationFlow('quarter', [
 *   { stepKey: 'quarter', attemptNumber: 1, inputValue: 8, expectedValue: 10, isCorrect: false, timestamp: '...' },
 *   { stepKey: 'quarter', attemptNumber: 2, inputValue: 12, expectedValue: 10, isCorrect: false, timestamp: '...' }
 * ]);
 * // result2.nextAction === 'require_third'
 * ```
 */
export function handleVerificationFlow(
  stepKey: keyof CashCount,
  attempts: VerificationAttempt[]
): VerificationFlowResult {
  const attemptCount = attempts.length;

  // 🤖 [IA] - v1.3.0: ESCENARIO 1 - Correcto primer intento (90% casos esperados)
  if (attemptCount === 1 && attempts[0].isCorrect) {
    return {
      nextAction: 'continue',
      severity: 'success',
      messageData: {
        title: 'Conteo Correcto',
        message: `${stepKey} verificado exitosamente. Avanzando a siguiente denominación.`,
        variant: 'info'
      }
    };
  }

  // 🤖 [IA] - v1.3.0: ESCENARIO 2 - Segundo intento
  if (attemptCount === 2) {
    const attempt1Value = attempts[0].inputValue;
    const attempt2Value = attempts[1].inputValue;

    // ESCENARIO 2a: 2 intentos iguales incorrectos → Override silencioso
    if (attempt1Value === attempt2Value && !attempts[1].isCorrect) {
      return {
        nextAction: 'force_override',
        severity: 'warning_override',
        messageData: {
          title: 'Override Silencioso',
          message: 'Segundo intento idéntico. Forzar cantidad y continuar',
          variant: 'warning'
        }
      };
    }

    // ESCENARIO 2b: 2 intentos diferentes → Requiere TERCER intento obligatorio
    if (attempt1Value !== attempt2Value) {
      return {
        nextAction: 'require_third',
        severity: 'warning_retry',
        messageData: {
          title: 'Tercer Intento Obligatorio',
          message: `Los 2 intentos son montos diferentes (${attempt1Value} vs ${attempt2Value}). Tu trabajo será reportado a gerencia. No lo estás haciendo bien. TERCER INTENTO OBLIGATORIO`,
          variant: 'error'
        }
      };
    }
  }

  // 🤖 [IA] - v1.3.0: ESCENARIO 3 - Triple intento → Análisis pattern
  if (attemptCount === 3) {
    const attemptsTuple: [number, number, number] = [
      attempts[0].inputValue,
      attempts[1].inputValue,
      attempts[2].inputValue
    ];

    const analysis = analyzeThirdAttempt(attemptsTuple);

    return {
      nextAction: 'analyze',
      severity: analysis.severity,
      messageData: {
        title: analysis.severity === 'critical_severe' ? 'Falta Muy Grave' : 'Falta Grave',
        message: analysis.reason,
        variant: 'error'
      },
      thirdAttemptResult: analysis
    };
  }

  // 🤖 [IA] - v1.3.0: Fallback (no debería ocurrir con flujo normal)
  // Caso edge: Primer intento incorrecto sin segundo intento
  return {
    nextAction: 'require_third',
    severity: 'warning_retry',
    messageData: {
      title: 'Dato Incorrecto',
      message: 'Volver a contar cuidadosamente',
      variant: 'warning'
    }
  };
}

/**
 * Genera mensajes UI profesionales según nivel de severidad
 *
 * @param severity - VerificationSeverity level (5 opciones)
 * @returns Objeto con title, message, variant para UI components
 *
 * @remarks
 * **Mensajes por severidad:**
 * - `success`: Modal breve (2s auto-close) - "Conteo correcto"
 * - `warning_retry`: Modal neutro - "Dato incorrecto, volver a contar"
 * - `warning_override`: Modal simple - "Segundo intento idéntico..."
 * - `critical_inconsistent`: Modal crítico - "Los 2 intentos son montos diferentes..."
 * - `critical_severe`: Modal MUY GRAVE - "3 intentos diferentes - Reporte crítico"
 *
 * Variantes UI:
 * - 'info': Color azul/verde (success)
 * - 'warning': Color naranja/amarillo (override, retry)
 * - 'error': Color rojo (critical)
 *
 * @example
 * ```typescript
 * const msg = getVerificationMessages('critical_severe');
 * // {
 * //   title: 'Falta Muy Grave',
 * //   message: '3 intentos totalmente diferentes. Reporte crítico a gerencia obligatorio.',
 * //   variant: 'error'
 * // }
 * ```
 */
export function getVerificationMessages(severity: VerificationSeverity): {
  title: string;
  message: string;
  variant: 'info' | 'warning' | 'error';
} {
  // 🤖 [IA] - v1.3.0: Switch mensajes UI según severidad
  switch (severity) {
    case 'success':
      return {
        title: 'Conteo Correcto',
        message: 'Denominación verificada exitosamente. Avanzando automáticamente.',
        variant: 'info'
      };

    case 'warning_retry':
      return {
        title: 'Dato Incorrecto',
        message: 'Volver a contar cuidadosamente. Segundo intento disponible.',
        variant: 'warning'
      };

    case 'warning_override':
      return {
        title: 'Override Silencioso',
        message: 'Segundo intento idéntico al primero. Sistema forzará cantidad y continuará.',
        variant: 'warning'
      };

    case 'critical_inconsistent':
      return {
        title: 'Falta Grave',
        message: '2 de 3 intentos coinciden. Discrepancia registrada para reporte gerencial.',
        variant: 'error'
      };

    case 'critical_severe':
      return {
        title: 'Falta Muy Grave',
        message: '3 intentos totalmente diferentes. Reporte crítico a gerencia obligatorio.',
        variant: 'error'
      };

    default:
      // 🤖 [IA] - v1.3.0: TypeScript exhaustiveness check (nunca debería llegar aquí)
      return {
        title: 'Estado Desconocido',
        message: 'Contactar supervisor',
        variant: 'error'
      };
  }
}

/**
 * Hook principal para gestión de verificación ciega con triple intento
 *
 * @param expectedCounts - Valores esperados por denominación (CashCount completo)
 * @returns Objeto con funciones y estado para flujo de verificación
 *
 * @remarks
 * **Estado interno:**
 * - `attempts`: Map<keyof CashCount, VerificationAttempt[]> - Historial por denominación
 *
 * **Funciones retornadas (todas memoizadas con useCallback):**
 * - `validateAttempt`: Crear objeto VerificationAttempt
 * - `handleVerificationFlow`: Determinar nextAction según historial
 * - `analyzeThirdAttempt`: Análisis pattern triple intento
 * - `getVerificationMessages`: Mensajes UI por severidad
 * - `resetAttempts`: Limpiar historial (útil para retry completo)
 *
 * @example
 * ```tsx
 * function Phase2VerificationSection() {
 *   const expectedCounts = { quarter: 10, nickel: 20, bill20: 5 };
 *
 *   const {
 *     validateAttempt,
 *     handleVerificationFlow,
 *     resetAttempts
 *   } = useBlindVerification(expectedCounts);
 *
 *   const handleAttemptSubmit = (stepKey: keyof CashCount, inputValue: number) => {
 *     const currentAttempts = attempts.get(stepKey) || [];
 *     const attemptNumber = (currentAttempts.length + 1) as 1 | 2 | 3;
 *     const expectedValue = expectedCounts[stepKey];
 *
 *     const attempt = validateAttempt(stepKey, attemptNumber, inputValue, expectedValue);
 *     const flowResult = handleVerificationFlow(stepKey, [...currentAttempts, attempt]);
 *
 *     if (flowResult.nextAction === 'continue') {
 *       // Avanzar a siguiente denominación
 *     } else if (flowResult.nextAction === 'require_third') {
 *       // Mostrar modal crítico
 *     }
 *   };
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useBlindVerification(expectedCounts: CashCount) {
  // 🤖 [IA] - v1.3.0: Estado tracking intentos por denominación (Map para O(1) lookup)
  const [attempts, setAttempts] = useState<Map<keyof CashCount, VerificationAttempt[]>>(
    new Map()
  );

  // 🤖 [IA] - v1.3.0: Función memoizada para validar intento
  const validateAttemptCallback = useCallback(
    (
      stepKey: keyof CashCount,
      attemptNumber: 1 | 2 | 3,
      inputValue: number
    ): VerificationAttempt => {
      const expectedValue = expectedCounts[stepKey];
      return validateAttempt(stepKey, attemptNumber, inputValue, expectedValue);
    },
    [expectedCounts]
  );

  // 🤖 [IA] - v1.3.0: Función memoizada para manejar flujo verificación
  const handleVerificationFlowCallback = useCallback(
    (stepKey: keyof CashCount, attemptsArray: VerificationAttempt[]): VerificationFlowResult => {
      return handleVerificationFlow(stepKey, attemptsArray);
    },
    []
  );

  // 🤖 [IA] - v1.3.0: Función memoizada para análisis triple intento
  const analyzeThirdAttemptCallback = useCallback(
    (attemptsTuple: [number, number, number]): ThirdAttemptResult => {
      return analyzeThirdAttempt(attemptsTuple);
    },
    []
  );

  // 🤖 [IA] - v1.3.0: Función memoizada para mensajes UI
  const getVerificationMessagesCallback = useCallback(
    (severity: VerificationSeverity) => {
      return getVerificationMessages(severity);
    },
    []
  );

  // 🤖 [IA] - v1.3.0: Función para resetear intentos (útil para retry completo)
  const resetAttempts = useCallback(() => {
    setAttempts(new Map());
  }, []);

  // 🤖 [IA] - v1.3.0: Función para agregar intento a historial
  const recordAttempt = useCallback((attempt: VerificationAttempt) => {
    setAttempts((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(attempt.stepKey) || [];
      newMap.set(attempt.stepKey, [...existing, attempt]);
      return newMap;
    });
  }, []);

  return {
    validateAttempt: validateAttemptCallback,
    handleVerificationFlow: handleVerificationFlowCallback,
    analyzeThirdAttempt: analyzeThirdAttemptCallback,
    getVerificationMessages: getVerificationMessagesCallback,
    resetAttempts,
    recordAttempt,
    attempts
  };
}
