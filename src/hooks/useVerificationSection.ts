// 🤖 [IA] - v1.3.8: Hook para gestionar estado y lógica de Phase2VerificationSection
// Extrae 400+ líneas del componente para mejor testabilidad y separación de concerns

/**
 * @file useVerificationSection.ts
 * @description Hook que encapsula toda la lógica de negocio de Phase2VerificationSection
 *
 * @remarks
 * Este hook extrae la lógica del componente visual para:
 * 1. Mejorar testabilidad (hooks son más fáciles de testear que componentes)
 * 2. Reducir complejidad del componente (de 1000+ líneas a ~400)
 * 3. Reutilizar lógica si se necesita en otros contextos
 *
 * **Estado gestionado:**
 * - `currentStepIndex`: Índice del paso actual
 * - `inputValue`: Valor del input
 * - `modalState`: Estado del modal de verificación
 * - `attemptHistory`: Historial de intentos por denominación
 *
 * **Funciones expuestas:**
 * - `handleConfirmStep`: Confirmar paso actual
 * - `handleRetry`: Reintentar paso
 * - `handleForce`: Forzar valor
 * - `handleAcceptThird`: Aceptar resultado tercer intento
 * - `buildVerificationBehavior`: Construir objeto VerificationBehavior
 *
 * @see useBlindVerification.ts - Hook base para validación de intentos
 * @see Phase2VerificationSection.tsx - Componente que consume este hook
 *
 * @version 1.3.8
 * @date 2025-01-19
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { VerificationAttempt, VerificationBehavior, VerificationSeverity, ThirdAttemptResult } from '@/types/verification';
import type { CashCount } from '@/types/cash';
import type { DeliveryCalculation } from '@/types/phases';
import { useBlindVerification } from '@/hooks/useBlindVerification';
import { useTimingConfig } from '@/hooks/useTimingConfig';
import { calculateCashTotal } from '@/utils/calculations';

// 🤖 [IA] - v1.3.8: Tipos para estado del modal
export interface VerificationModalState {
  isOpen: boolean;
  type: 'incorrect' | 'force-same' | 'require-third' | 'third-result';
  stepLabel: string;
  thirdAttemptAnalysis?: ThirdAttemptResult;
}

// 🤖 [IA] - v1.3.8: Props del hook
export interface UseVerificationSectionProps {
  deliveryCalculation: DeliveryCalculation;
  onStepComplete: (stepKey: string) => void;
  onSectionComplete: () => void;
  onVerificationBehaviorCollected?: (behavior: VerificationBehavior) => void;
  completedSteps: Record<string, boolean>;
}

// 🤖 [IA] - v1.3.8: Resultado del hook
export interface UseVerificationSectionResult {
  // Estado
  currentStepIndex: number;
  inputValue: string;
  modalState: VerificationModalState;
  inputRef: React.RefObject<HTMLInputElement>;

  // Computed
  currentStep: DeliveryCalculation['verificationSteps'][0] | undefined;
  isLastStep: boolean;
  allStepsCompleted: boolean;
  verificationSteps: DeliveryCalculation['verificationSteps'];
  expectedTotal: number;

  // Acciones
  setInputValue: (value: string) => void;
  handleConfirmStep: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleRetry: () => void;
  handleForce: () => void;
  handleAcceptThird: () => void;
  buildVerificationBehavior: () => VerificationBehavior;

  // Helpers
  getAttemptCount: (stepKey: string) => number;
  getDenominationDescription: (fieldName: string, fieldLabel: string) => string;
}

// 🤖 [IA] - v1.3.8: Mapeo de denominaciones a descripciones en español
const DENOMINATION_DESCRIPTIONS: Record<string, string> = {
  'penny': 'Un centavo',
  'nickel': 'Cinco centavos',
  'dime': 'Diez centavos',
  'quarter': 'Veinticinco centavos',
  'dollarCoin': 'Moneda de un dólar',
  'bill1': 'Billete de un dólar',
  'bill5': 'Billete de cinco dólares',
  'bill10': 'Billete de diez dólares',
  'bill20': 'Billete de veinte dólares',
  'bill50': 'Billete de cincuenta dólares',
  'bill100': 'Billete de cien dólares'
};

/**
 * Hook principal para gestionar Phase2VerificationSection
 *
 * @param props - Configuración del hook
 * @returns Estado y funciones para el componente
 */
export function useVerificationSection({
  deliveryCalculation,
  onStepComplete,
  onSectionComplete,
  onVerificationBehaviorCollected,
  completedSteps
}: UseVerificationSectionProps): UseVerificationSectionResult {
  // 🤖 [IA] - v1.3.8: Estado local del componente
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [modalState, setModalState] = useState<VerificationModalState>({
    isOpen: false,
    type: 'incorrect',
    stepLabel: '',
    thirdAttemptAnalysis: undefined
  });
  const [attemptHistory, setAttemptHistory] = useState<Map<string, VerificationAttempt[]>>(new Map());
  const inputRef = useRef<HTMLInputElement>(null);

  // 🤖 [IA] - v1.3.8: Hooks externos
  const { createTimeoutWithCleanup } = useTimingConfig();
  const { verificationSteps, denominationsToKeep } = deliveryCalculation;
  const { validateAttempt, handleVerificationFlow } = useBlindVerification(denominationsToKeep);

  // 🤖 [IA] - v1.3.8: Computed values
  const currentStep = verificationSteps[currentStepIndex];
  const isLastStep = currentStepIndex === verificationSteps.length - 1;
  const allStepsCompleted = verificationSteps.every(step => completedSteps[step.key]);
  const expectedTotal = calculateCashTotal(denominationsToKeep);

  // 🤖 [IA] - v1.3.8: Helper para obtener descripción de denominación
  const getDenominationDescription = useCallback((fieldName: string, fieldLabel: string): string => {
    return DENOMINATION_DESCRIPTIONS[fieldName] || fieldLabel;
  }, []);

  // 🤖 [IA] - v1.3.8: Helper para contar intentos
  const getAttemptCount = useCallback((stepKey: string): number => {
    return attemptHistory.get(stepKey)?.length || 0;
  }, [attemptHistory]);

  // 🤖 [IA] - v1.3.8: Registrar intento en historial
  const recordAttempt = useCallback((stepKey: string, inputVal: number, expectedValue: number): VerificationAttempt => {
    const attemptCount = attemptHistory.get(stepKey)?.length || 0;
    const attempt = validateAttempt(
      stepKey as keyof typeof denominationsToKeep,
      (attemptCount + 1) as 1 | 2 | 3,
      inputVal
    );

    setAttemptHistory(prev => {
      const newHistory = new Map(prev);
      const existing = newHistory.get(stepKey) || [];
      newHistory.set(stepKey, [...existing, attempt]);
      return newHistory;
    });

    return attempt;
  }, [attemptHistory, validateAttempt, denominationsToKeep]);

  // 🤖 [IA] - v1.3.8: Construir objeto VerificationBehavior
  // Incluye debug logs de v1.3.6S para diagnóstico de issues
  const buildVerificationBehavior = useCallback((): VerificationBehavior => {
    // 🤖 [IA] - v1.3.6S: DEBUG CHECKPOINT #1 - Estado inicial attemptHistory Map
    console.log('[DEBUG v1.3.6S] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[DEBUG v1.3.6S] 📊 buildVerificationBehavior() INICIO');
    console.log('[DEBUG v1.3.6S] 🗺️ attemptHistory Map size:', attemptHistory.size);
    console.log('[DEBUG v1.3.6S] 🗺️ attemptHistory Map keys:', Array.from(attemptHistory.keys()));

    const allAttempts: VerificationAttempt[] = [];
    let secondAttemptSuccesses = 0;
    let thirdAttemptRequired = 0;
    let forcedOverrides = 0;
    let criticalInconsistencies = 0;
    let severeInconsistencies = 0;
    const severityFlags: VerificationSeverity[] = [];
    const forcedOverridesDenoms: Array<keyof CashCount> = [];
    const criticalInconsistenciesDenoms: Array<keyof CashCount> = [];
    const severeInconsistenciesDenoms: Array<keyof CashCount> = [];
    const denominationsWithIssues: Array<{
      denomination: keyof CashCount;
      severity: VerificationSeverity;
      attempts: number[];
    }> = [];

    attemptHistory.forEach((attempts, stepKey) => {
      // 🤖 [IA] - v1.3.6S: DEBUG CHECKPOINT #2 - Análisis de cada denominación
      console.log('[DEBUG v1.3.6S] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[DEBUG v1.3.6S] 🔍 Analizando denominación:', stepKey);
      console.log('[DEBUG v1.3.6S] 🔍 Número de intentos:', attempts.length);

      allAttempts.push(...attempts);
      let currentSeverity: VerificationSeverity = 'success';

      if (attempts.length === 1) {
        if (attempts[0].isCorrect) {
          currentSeverity = 'success';
        } else {
          // 🤖 [IA] - v1.3.6Q: FIX BUG #1 - Primer intento incorrecto
          currentSeverity = 'warning_retry';
          severityFlags.push('warning_retry');
        }
      } else if (attempts.length === 2) {
        if (attempts[1].isCorrect) {
          secondAttemptSuccesses++;
          currentSeverity = 'warning_retry';
          severityFlags.push('warning_retry');
        } else {
          if (attempts[0].inputValue === attempts[1].inputValue) {
            forcedOverrides++;
            forcedOverridesDenoms.push(stepKey as keyof CashCount);
            currentSeverity = 'warning_override';
            severityFlags.push('warning_override');
          } else {
            // 🤖 [IA] - v1.3.6Q: FIX BUG #3 - Dos intentos diferentes
            currentSeverity = 'warning_retry';
            severityFlags.push('warning_retry');
            thirdAttemptRequired++;
          }
        }
      } else if (attempts.length >= 3) {
        thirdAttemptRequired++;
        const [attempt1, attempt2, attempt3] = attempts;

        if (
          (attempt1.inputValue === attempt3.inputValue && attempt1.inputValue !== attempt2.inputValue) ||
          (attempt2.inputValue === attempt3.inputValue && attempt2.inputValue !== attempt1.inputValue)
        ) {
          criticalInconsistencies++;
          criticalInconsistenciesDenoms.push(stepKey as keyof CashCount);
          currentSeverity = 'critical_inconsistent';
          severityFlags.push('critical_inconsistent');
        } else {
          severeInconsistencies++;
          severeInconsistenciesDenoms.push(stepKey as keyof CashCount);
          currentSeverity = 'critical_severe';
          severityFlags.push('critical_severe');
        }
      }

      // 🤖 [IA] - v1.3.6S: DEBUG CHECKPOINT #3 - Determinación severity
      console.log('[DEBUG v1.3.6S] ⚖️ Severity determinada para', stepKey, ':', currentSeverity);

      if (currentSeverity !== 'success') {
        // 🤖 [IA] - v1.3.6S: DEBUG CHECKPOINT #4 - Agregando a denominationsWithIssues
        console.log('[DEBUG v1.3.6S] ➕ AGREGANDO a denominationsWithIssues:', {
          denomination: stepKey,
          severity: currentSeverity,
          attempts: attempts.map(a => a.inputValue)
        });

        denominationsWithIssues.push({
          denomination: stepKey as keyof CashCount,
          severity: currentSeverity,
          attempts: attempts.map(a => a.inputValue)
        });
      }
    });

    // 🤖 [IA] - v1.3.6Y: FIX CÁLCULO PERFECTAS - Calcular por diferencia
    const totalDenominations = verificationSteps.length;
    const firstAttemptSuccesses = totalDenominations - denominationsWithIssues.length;

    // 🤖 [IA] - v1.3.6S: DEBUG CHECKPOINT #5 - Estado final
    console.log('[DEBUG v1.3.6S] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[DEBUG v1.3.6S] 📊 buildVerificationBehavior() PRE-RETURN');
    console.log('[DEBUG v1.3.6S] 📊 denominationsWithIssues length:', denominationsWithIssues.length);
    console.log('[DEBUG v1.3.6Y] 📊 firstAttemptSuccesses (calculado):', firstAttemptSuccesses);

    const finalBehavior = {
      totalAttempts: allAttempts.length,
      firstAttemptSuccesses,
      secondAttemptSuccesses,
      thirdAttemptRequired,
      forcedOverrides,
      criticalInconsistencies,
      severeInconsistencies,
      attempts: allAttempts.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
      severityFlags,
      forcedOverridesDenoms,
      criticalInconsistenciesDenoms,
      severeInconsistenciesDenoms,
      denominationsWithIssues
    };

    // 🤖 [IA] - v1.3.6S: DEBUG CHECKPOINT #6 - Objeto final
    console.log('[DEBUG v1.3.6S] 🎯 OBJETO FINAL VerificationBehavior construido');
    console.log('[DEBUG v1.3.6S] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return finalBehavior;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptHistory]); // verificationSteps.length omitido - es constante derivada de props

  // 🤖 [IA] - v1.3.8: Handler para confirmar paso
  const handleConfirmStep = useCallback(() => {
    if (!currentStep) return;

    const inputNum = parseInt(inputValue) || 0;
    const stepLabel = getDenominationDescription(currentStep.key, currentStep.label);
    const attemptCount = getAttemptCount(currentStep.key);

    // ✅ CASO 1: Valor correcto
    if (inputNum === currentStep.quantity) {
      if (attemptCount >= 1) {
        recordAttempt(currentStep.key, inputNum, currentStep.quantity);
      }

      onStepComplete(currentStep.key);

      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      if (!isLastStep) {
        setCurrentStepIndex(prev => prev + 1);
      }

      inputRef.current?.focus();
      requestAnimationFrame(() => setInputValue(''));
      return;
    }

    // ❌ CASO 2: Valor incorrecto
    const newAttempt = recordAttempt(currentStep.key, inputNum, currentStep.quantity);

    if (attemptCount === 0) {
      setModalState({
        isOpen: true,
        type: 'incorrect',
        stepLabel,
        thirdAttemptAnalysis: undefined
      });
      inputRef.current?.blur();
    } else if (attemptCount === 1) {
      const attempts = attemptHistory.get(currentStep.key) || [];
      const firstAttemptValue = attempts[0]?.inputValue;

      if (inputNum === firstAttemptValue) {
        setModalState({
          isOpen: true,
          type: 'force-same',
          stepLabel,
          thirdAttemptAnalysis: undefined
        });
      } else {
        setModalState({
          isOpen: true,
          type: 'require-third',
          stepLabel,
          thirdAttemptAnalysis: undefined
        });
      }
      inputRef.current?.blur();
    } else if (attemptCount >= 2) {
      const previousAttempts = attemptHistory.get(currentStep.key) || [];
      const allAttempts = [...previousAttempts, newAttempt];

      if (allAttempts.length === 3) {
        const flowResult = handleVerificationFlow(
          currentStep.key as keyof typeof denominationsToKeep,
          allAttempts
        );

        if (flowResult.thirdAttemptResult) {
          setModalState({
            isOpen: true,
            type: 'third-result',
            stepLabel,
            thirdAttemptAnalysis: flowResult.thirdAttemptResult
          });
          inputRef.current?.blur();
        }
      }
    }
  }, [
    currentStep,
    inputValue,
    getDenominationDescription,
    getAttemptCount,
    recordAttempt,
    onStepComplete,
    isLastStep,
    attemptHistory,
    handleVerificationFlow,
    denominationsToKeep
  ]);

  // 🤖 [IA] - v1.3.8: Handler para teclas
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (modalState.isOpen) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (e.key === 'Enter' && inputValue.trim() !== '') {
      handleConfirmStep();
    }
  }, [modalState.isOpen, inputValue, handleConfirmStep]);

  // 🤖 [IA] - v1.3.8: Handler para reintentar
  const handleRetry = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
    setInputValue('');

    createTimeoutWithCleanup(() => {
      inputRef.current?.focus();
    }, 'focus', 'retry_focus', 100);
  }, [createTimeoutWithCleanup]);

  // 🤖 [IA] - v1.3.8: Handler para forzar valor
  const handleForce = useCallback(() => {
    if (!currentStep) return;

    setModalState(prev => ({ ...prev, isOpen: false }));
    onStepComplete(currentStep.key);

    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }

    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    }

    inputRef.current?.focus();
    requestAnimationFrame(() => setInputValue(''));
  }, [currentStep, onStepComplete, isLastStep]);

  // 🤖 [IA] - v1.3.8: Handler para aceptar tercer intento
  const handleAcceptThird = useCallback(() => {
    if (!currentStep) return;

    setModalState(prev => ({ ...prev, isOpen: false }));
    onStepComplete(currentStep.key);

    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }

    if (!isLastStep) {
      setCurrentStepIndex(prev => prev + 1);
    }

    inputRef.current?.focus();
    requestAnimationFrame(() => setInputValue(''));
  }, [currentStep, onStepComplete, isLastStep]);

  // 🤖 [IA] - v1.3.8: Effect para auto-avance al siguiente paso incompleto
  useEffect(() => {
    const nextIncompleteIndex = verificationSteps.findIndex(step => !completedSteps[step.key]);
    if (nextIncompleteIndex !== -1 && nextIncompleteIndex !== currentStepIndex) {
      setCurrentStepIndex(nextIncompleteIndex);
      setInputValue('');
      const cleanup = createTimeoutWithCleanup(() => {
        inputRef.current?.focus();
      }, 'focus', 'verification_step_focus', 100);
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSteps, verificationSteps, currentStepIndex]);
  // 🤖 [IA] - v1.3.6g: BUG FIX #1 - createTimeoutWithCleanup removido de dependencies
  // Root cause: Función helper solo se LLAMA (no se LEE), incluirla en deps causa re-disparos

  // 🤖 [IA] - v1.3.8: Effect para completar sección cuando todos los pasos están hechos
  useEffect(() => {
    if (allStepsCompleted && verificationSteps.length > 0) {
      const cleanup = createTimeoutWithCleanup(() => {
        const behavior = buildVerificationBehavior();

        if (onVerificationBehaviorCollected) {
          console.log('[Phase2VerificationSection] 📊 VerificationBehavior construido:', behavior);
          onVerificationBehaviorCollected(behavior);
        }

        setTimeout(() => {
          onSectionComplete();
        }, 100);
      }, 'transition', 'verification_section_complete');
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allStepsCompleted, verificationSteps.length, buildVerificationBehavior]);
  // 🤖 [IA] - v1.3.6g: createTimeoutWithCleanup removido de dependencies (causa race conditions)
  // 🤖 [IA] - v1.3.6f: onSectionComplete removido de dependencies (causa loop infinito)
  // 🤖 [IA] - v1.3.6e: onVerificationBehaviorCollected removido (callback solo se LLAMA)

  return {
    // Estado
    currentStepIndex,
    inputValue,
    modalState,
    inputRef,

    // Computed
    currentStep,
    isLastStep,
    allStepsCompleted,
    verificationSteps,
    expectedTotal,

    // Acciones
    setInputValue,
    handleConfirmStep,
    handleKeyPress,
    handleRetry,
    handleForce,
    handleAcceptThird,
    buildVerificationBehavior,

    // Helpers
    getAttemptCount,
    getDenominationDescription
  };
}
