// 🤖 [IA] - v1.3.6S: DEBUG COMPLETO - 6 checkpoints console.log tracking buildVerificationBehavior → denominationsWithIssues array (800+ líneas investigación)
// Previous: v1.3.6Q - FIX ALERTAS COMPLETAS - Sistema reporta 100% errores (1, 2, 3 intentos) | 3 bugs corregidos: #1 else block primer intento, #3 severity dos intentos, #2 sección advertencias
// 🤖 [IA] - v1.3.6M: FIX CRÍTICO - clearAttemptHistory() borraba intentos antes de buildVerificationBehavior (reporte sin datos)
// 🤖 [IA] - v1.3.6h: BUG FIX CRÍTICO - Enter key leak modal verificación (triple defensa anti-fraude)
// 🤖 [IA] - v1.3.6g: BUG FIX #1 - createTimeoutWithCleanup en deps causaba race conditions (9 errores loop)
// 🤖 [IA] - v1.3.6f: BUG FIX CRÍTICO #3 - onSectionComplete en deps causaba loop infinito (3,357 errores)
// 🤖 [IA] - v1.3.6e: BUG FIX CRÍTICO #3 - Loop Infinito onVerificationBehaviorCollected en deps
// 🤖 [IA] - v1.3.6a: BUG FIX CRÍTICO - Agregado useCallback para memoización
// 🤖 [IA] - v1.2.11 - Sistema anti-fraude: indicadores visuales sin montos
// 🤖 [IA] - v1.1.14 - Simplificación visual y eliminación de redundancias
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Building, ChevronRight, Check, Banknote, Target, CheckCircle, Coins, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { NeutralActionButton } from '@/components/ui/neutral-action-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';  // 🤖 [IA] - v1.2.52: WCAG 2.1 SC 3.3.2 compliance
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 1 archivos CSS están ahora importados globalmente vía index.css:
// - phase2-confirm-button.css
// 🤖 [IA] - Eliminado imports de componentes UI para usar estilos inline v1.0.74
import { DeliveryCalculation } from '@/types/phases';
import { formatCurrency, calculateCashTotal } from '@/utils/calculations';
import { useTimingConfig } from '@/hooks/useTimingConfig'; // 🤖 [IA] - Hook de timing unificado v1.0.22
// 🤖 [IA] - v1.3.0: MÓDULO 4 - Integración blind verification system
import { useBlindVerification } from '@/hooks/useBlindVerification';
import { BlindVerificationModal } from '@/components/verification/BlindVerificationModal';
import type { VerificationAttempt, ThirdAttemptResult, VerificationBehavior, VerificationSeverity } from '@/types/verification';
import type { CashCount } from '@/types/cash'; // 🤖 [IA] - v1.3.6: MÓDULO 1 - Para tipado buildVerificationBehavior

interface Phase2VerificationSectionProps {
  deliveryCalculation: DeliveryCalculation;
  onStepComplete: (stepKey: string) => void;
  onStepUncomplete?: (stepKey: string) => void; // 🤖 [IA] - v1.2.24: Para deshacer pasos al retroceder
  onSectionComplete: () => void;
  // 🤖 [IA] - v1.3.6: MÓDULO 1 - Callback para recolectar VerificationBehavior completo
  onVerificationBehaviorCollected?: (behavior: VerificationBehavior) => void;
  completedSteps: Record<string, boolean>;
  // 🤖 [IA] - v1.2.24: Navigation props to match Phase 1 pattern
  onCancel: () => void;
  onPrevious: () => void;
  canGoPrevious: boolean;
}

// Función para convertir labels a texto descriptivo
const getDenominationDescription = (fieldName: string, fieldLabel: string): string => {
  const descriptions: Record<string, string> = {
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

  return descriptions[fieldName] || fieldLabel;
};

export function Phase2VerificationSection({
  deliveryCalculation,
  onStepComplete,
  onStepUncomplete,
  onSectionComplete,
  onVerificationBehaviorCollected, // 🤖 [IA] - v1.3.6: MÓDULO 1 - Nueva prop callback
  completedSteps,
  onCancel,
  onPrevious,
  canGoPrevious
}: Phase2VerificationSectionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 🤖 [IA] - v1.3.0: MÓDULO 4 - Estados para blind verification
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'incorrect' | 'force-same' | 'require-third' | 'third-result';
    stepLabel: string;
    thirdAttemptAnalysis?: ThirdAttemptResult;
  }>({
    isOpen: false,
    type: 'incorrect',
    stepLabel: '',
    thirdAttemptAnalysis: undefined
  });
  const [attemptHistory, setAttemptHistory] = useState<Map<string, VerificationAttempt[]>>(new Map());

  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Usar timing unificado v1.0.22
  const { verificationSteps, denominationsToKeep } = deliveryCalculation;

  // 🤖 [IA] - v1.3.0: MÓDULO 4 - Hook de blind verification
  const { validateAttempt, handleVerificationFlow } = useBlindVerification(denominationsToKeep);
  const currentStep = verificationSteps[currentStepIndex];
  const isLastStep = currentStepIndex === verificationSteps.length - 1;
  const allStepsCompleted = verificationSteps.every(step => completedSteps[step.key]);
  const expectedTotal = calculateCashTotal(denominationsToKeep);

  // 🤖 [IA] - v1.3.0: MÓDULO 4 - Helper functions para attemptHistory
  const getAttemptCount = (stepKey: string): number => {
    return attemptHistory.get(stepKey)?.length || 0;
  };

  const recordAttempt = (stepKey: string, inputValue: number, expectedValue: number) => {
    const attemptCount = getAttemptCount(stepKey);
    const attempt = validateAttempt(
      stepKey as keyof typeof denominationsToKeep,
      attemptCount + 1,
      inputValue,
      expectedValue
    );

    setAttemptHistory(prev => {
      const newHistory = new Map(prev);
      const existing = newHistory.get(stepKey) || [];
      newHistory.set(stepKey, [...existing, attempt]);
      return newHistory;
    });

    return attempt;
  };

  const clearAttemptHistory = (stepKey: string) => {
    setAttemptHistory(prev => {
      const newHistory = new Map(prev);
      newHistory.delete(stepKey);
      return newHistory;
    });
  };

  // 🤖 [IA] - v1.3.6a: BUG FIX CRÍTICO - Memoizado con useCallback para evitar loop infinito useEffect
  // Root cause: Función en dependencies array sin useCallback causaba re-disparos infinitos
  // Solución: useCallback con única dependencia attemptHistory (referencia estable)
  // 🤖 [IA] - v1.3.6: MÓDULO 1 - Construir objeto VerificationBehavior desde attemptHistory
  const buildVerificationBehavior = useCallback((): VerificationBehavior => {
    // 🤖 [IA] - v1.3.6S: DEBUG CHECKPOINT #1 - Estado inicial attemptHistory Map
    console.log('[DEBUG v1.3.6S] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[DEBUG v1.3.6S] 📊 buildVerificationBehavior() INICIO');
    console.log('[DEBUG v1.3.6S] 🗺️ attemptHistory Map size:', attemptHistory.size);
    console.log('[DEBUG v1.3.6S] 🗺️ attemptHistory Map keys:', Array.from(attemptHistory.keys()));
    console.log('[DEBUG v1.3.6S] 🗺️ attemptHistory Map completo:', JSON.stringify(
      Array.from(attemptHistory.entries()).map(([key, attempts]) => ({
        denomination: key,
        attempts: attempts.map(a => ({
          attemptNumber: a.attemptNumber,
          inputValue: a.inputValue,
          expectedValue: a.expectedValue,
          isCorrect: a.isCorrect
        }))
      })),
      null,
      2
    ));

    const allAttempts: VerificationAttempt[] = [];
    let firstAttemptSuccesses = 0;
    let secondAttemptSuccesses = 0;
    let thirdAttemptRequired = 0;
    let forcedOverrides = 0;
    let criticalInconsistencies = 0;
    let severeInconsistencies = 0;
    const severityFlags: VerificationSeverity[] = [];
    const forcedOverridesDenoms: Array<keyof CashCount> = [];
    const criticalInconsistenciesDenoms: Array<keyof CashCount> = [];
    const severeInconsistenciesDenoms: Array<keyof CashCount> = [];
    // 🤖 [IA] - v1.3.6P: Array consolidado de denominaciones con issues (para reporte WhatsApp)
    const denominationsWithIssues: Array<{
      denomination: keyof CashCount;
      severity: VerificationSeverity;
      attempts: number[];
    }> = [];

    // Iterar sobre attemptHistory Map
    attemptHistory.forEach((attempts, stepKey) => {
      // 🤖 [IA] - v1.3.6S: DEBUG CHECKPOINT #2 - Análisis de cada denominación
      console.log('[DEBUG v1.3.6S] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('[DEBUG v1.3.6S] 🔍 Analizando denominación:', stepKey);
      console.log('[DEBUG v1.3.6S] 🔍 Número de intentos:', attempts.length);
      console.log('[DEBUG v1.3.6S] 🔍 Intentos detallados:', attempts.map(a => ({
        attemptNumber: a.attemptNumber,
        inputValue: a.inputValue,
        expectedValue: a.expectedValue,
        isCorrect: a.isCorrect
      })));
      allAttempts.push(...attempts);

      // 🤖 [IA] - v1.3.6P: Determinar severity para esta denominación
      let currentSeverity: VerificationSeverity = 'success';

      // Analizar patrón de intentos por denominación
      if (attempts.length === 1) {
        if (attempts[0].isCorrect) {
          firstAttemptSuccesses++;
          currentSeverity = 'success'; // ← v1.3.6P: Explícito
        } else {
          // 🤖 [IA] - v1.3.6Q: FIX BUG #1 - Primer intento incorrecto
          // Root cause: Sin else block, severity quedaba como 'success' (default línea 165)
          // Solución: Setear 'warning_retry' para que aparezca en reporte advertencias
          currentSeverity = 'warning_retry';
          severityFlags.push('warning_retry');
        }
      } else if (attempts.length === 2) {
        // Verificar si segundo intento fue correcto
        if (attempts[1].isCorrect) {
          secondAttemptSuccesses++;
          currentSeverity = 'warning_retry'; // ← v1.3.6P: Capturar severity
          severityFlags.push('warning_retry');
        } else {
          // Dos intentos incorrectos
          if (attempts[0].inputValue === attempts[1].inputValue) {
            // Force override (dos intentos iguales incorrectos)
            forcedOverrides++;
            forcedOverridesDenoms.push(stepKey as keyof CashCount);
            currentSeverity = 'warning_override'; // ← v1.3.6P: Capturar severity
            severityFlags.push('warning_override');
          } else {
            // 🤖 [IA] - v1.3.6Q: FIX BUG #3 - Dos intentos diferentes (patrón [A, B])
            // Root cause: Marcaba como 'critical_inconsistent' pero tercer intento NO garantizado
            // Solución: Marcar como 'warning_retry' (advertencia), solo crítico si hay 3 intentos
            currentSeverity = 'warning_retry';
            severityFlags.push('warning_retry');
            thirdAttemptRequired++; // Mantener contador para tracking métrico
          }
        }
      } else if (attempts.length >= 3) {
        // Tercer intento ejecutado
        thirdAttemptRequired++;

        // Analizar severidad del pattern
        const [attempt1, attempt2, attempt3] = attempts;

        if (
          (attempt1.inputValue === attempt3.inputValue && attempt1.inputValue !== attempt2.inputValue) ||
          (attempt2.inputValue === attempt3.inputValue && attempt2.inputValue !== attempt1.inputValue)
        ) {
          // Pattern [A,B,A] o [A,B,B] - inconsistencia crítica
          criticalInconsistencies++;
          criticalInconsistenciesDenoms.push(stepKey as keyof CashCount);
          currentSeverity = 'critical_inconsistent'; // ← v1.3.6P: Capturar severity
          severityFlags.push('critical_inconsistent');
        } else {
          // Pattern [A,B,C] - severamente inconsistente
          severeInconsistencies++;
          severeInconsistenciesDenoms.push(stepKey as keyof CashCount);
          currentSeverity = 'critical_severe'; // ← v1.3.6P: Capturar severity
          severityFlags.push('critical_severe');
        }
      }

      // 🤖 [IA] - v1.3.6S: DEBUG CHECKPOINT #3 - Determinación severity
      console.log('[DEBUG v1.3.6S] ⚖️ Severity determinada para', stepKey, ':', currentSeverity);
      console.log('[DEBUG v1.3.6S] ⚖️ ¿Es success? (NO debería agregarse):', currentSeverity === 'success');

      // 🤖 [IA] - v1.3.6P: Agregar a denominationsWithIssues si NO es success
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
          attempts: attempts.map(a => a.inputValue) // Array de valores ingresados
        });
      } else {
        // 🤖 [IA] - v1.3.6S: DEBUG CHECKPOINT #4b - NO agregando (success)
        console.log('[DEBUG v1.3.6S] ⏭️ OMITIENDO', stepKey, '- severity es success, NO se agrega a denominationsWithIssues');
      }
    });

    // 🤖 [IA] - v1.3.6S: DEBUG CHECKPOINT #5 - Estado final antes de return
    console.log('[DEBUG v1.3.6S] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[DEBUG v1.3.6S] 📊 buildVerificationBehavior() PRE-RETURN');
    console.log('[DEBUG v1.3.6S] 📊 Total attempts procesados:', allAttempts.length);
    console.log('[DEBUG v1.3.6S] 📊 denominationsWithIssues length:', denominationsWithIssues.length);
    console.log('[DEBUG v1.3.6S] 📊 denominationsWithIssues array completo:', JSON.stringify(denominationsWithIssues, null, 2));
    console.log('[DEBUG v1.3.6S] 📊 firstAttemptSuccesses:', firstAttemptSuccesses);
    console.log('[DEBUG v1.3.6S] 📊 secondAttemptSuccesses:', secondAttemptSuccesses);
    console.log('[DEBUG v1.3.6S] 📊 forcedOverrides:', forcedOverrides);
    console.log('[DEBUG v1.3.6S] 📊 criticalInconsistencies:', criticalInconsistencies);
    console.log('[DEBUG v1.3.6S] 📊 severeInconsistencies:', severeInconsistencies);

    const finalBehavior = {
      totalAttempts: allAttempts.length,
      firstAttemptSuccesses,
      secondAttemptSuccesses,
      thirdAttemptRequired,
      forcedOverrides,
      criticalInconsistencies,
      severeInconsistencies,
      attempts: allAttempts.sort((a, b) => a.timestamp.localeCompare(b.timestamp)), // Ordenar por timestamp
      severityFlags,
      forcedOverridesDenoms,
      criticalInconsistenciesDenoms,
      severeInconsistenciesDenoms,
      denominationsWithIssues // 🤖 [IA] - v1.3.6P: Array consolidado para reporte WhatsApp
    };

    // 🤖 [IA] - v1.3.6S: DEBUG CHECKPOINT #6 - Objeto final VerificationBehavior
    console.log('[DEBUG v1.3.6S] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('[DEBUG v1.3.6S] 🎯 OBJETO FINAL VerificationBehavior:');
    console.log('[DEBUG v1.3.6S] 🎯 VerificationBehavior completo:', JSON.stringify(finalBehavior, null, 2));
    console.log('[DEBUG v1.3.6S] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return finalBehavior;
  }, [attemptHistory]); // ← v1.3.6a: Única dependencia, referencia estable

  // Auto-advance to next incomplete step
  useEffect(() => {
    const nextIncompleteIndex = verificationSteps.findIndex(step => !completedSteps[step.key]);
    if (nextIncompleteIndex !== -1 && nextIncompleteIndex !== currentStepIndex) {
      setCurrentStepIndex(nextIncompleteIndex);
      setInputValue('');
      // 🚨 FIX v1.3.1: Usar createTimeoutWithCleanup para evitar memory leak
      const cleanup = createTimeoutWithCleanup(() => {
        inputRef.current?.focus();
      }, 'focus', 'verification_step_focus', 100);
      return cleanup;
    }
  }, [completedSteps, verificationSteps, currentStepIndex]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // 🤖 [IA] - v1.3.6g: BUG FIX #1 (1/2) - createTimeoutWithCleanup removido de dependencies
  // Root cause: Función helper solo se LLAMA (no se LEE), incluirla en deps causa re-disparos
  // Problema: useTimingConfig puede re-crear función → ref cambia → useEffect se dispara → loop
  // Guard condition (nextIncompleteIndex !== currentStepIndex) previene loops simples
  // Pero createTimeoutWithCleanup inestable causa race conditions con section complete useEffect

  // Complete section when all steps are done
  useEffect(() => {
    if (allStepsCompleted && verificationSteps.length > 0) {
      // 🤖 [IA] - v1.3.6k: FIX CRÍTICO TIMING - Construir behavior DENTRO del timeout
      // Root cause: Callback ejecutaba inmediatamente → state update async → useEffect Phase2Manager ejecutaba ANTES de tener behavior
      // Solución: Construir behavior dentro timeout → garantizar secuencia: behavior ready → callback → small delay → section complete
      const cleanup = createTimeoutWithCleanup(() => {
        const behavior = buildVerificationBehavior();

        if (onVerificationBehaviorCollected) {
          console.log('[Phase2VerificationSection] 📊 VerificationBehavior construido:', behavior);
          console.log('[Phase2VerificationSection] 🔍 Total de attempts en behavior:', behavior.totalAttempts);
          console.log('[Phase2VerificationSection] 🔍 Intentos inconsistentes:', behavior.criticalInconsistencies + behavior.severeInconsistencies);
          onVerificationBehaviorCollected(behavior);
          console.log('[Phase2VerificationSection] ✅ Callback onVerificationBehaviorCollected ejecutado exitosamente');
        } else {
          console.warn('[Phase2VerificationSection] ⚠️ onVerificationBehaviorCollected es undefined - behavior NO se recolectará');
        }

        // ⏱️ Small delay para garantizar state update en Phase2Manager antes de section complete
        setTimeout(() => {
          onSectionComplete();
        }, 100);
      }, 'transition', 'verification_section_complete');
      return cleanup;
    }
  }, [allStepsCompleted, verificationSteps.length, buildVerificationBehavior]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  // 🤖 [IA] - v1.3.6g: BUG FIX #1 (2/2) - createTimeoutWithCleanup removido de dependencies
  // Mismo patrón que auto-advance: helper solo se ejecuta, no necesita estar en deps
  // Eliminación de ambos useEffects resuelve race condition que causaba 9 errores loop
  // 🤖 [IA] - v1.3.6f: BUG FIX CRÍTICO #3 (3/3) - onSectionComplete removido de dependencies
  // Root cause: Callback solo se LLAMA (no se LEE), incluirlo en deps causa re-disparos cuando referencia cambia
  // Problema: handleVerificationSectionComplete se recrea → onSectionComplete nueva ref → useEffect se dispara → loop
  // Solución: Remover de deps - callback solo se ejecuta cuando allStepsCompleted cambia (trigger único correcto)
  // Fix complementario: handleVerificationSectionComplete ahora memoizado (línea 212 Phase2Manager)
  // Patrón validado: Mismo fix aplicado en v1.3.6e para onVerificationBehaviorCollected (línea 249)
  // 🤖 [IA] - v1.3.6e: BUG FIX CRÍTICO #3 - onVerificationBehaviorCollected removido de dependencies array
  // Root cause: Callback memoizado (useCallback []) solo se LLAMA (no se LEE), incluirlo en deps causa re-disparos cuando Phase2Manager re-renderiza
  // Problema: setVerificationBehavior (línea 169 Phase2Manager) → re-render Phase2Manager → Phase2VerificationSection re-renderiza → useEffect se dispara nuevamente → loop infinito (702 errores)
  // Solución: Remover de deps - callback es estable y solo se ejecuta cuando allStepsCompleted cambia (trigger único correcto)
  // 🤖 [IA] - v1.3.6a: buildVerificationBehavior ahora memoizado con useCallback → referencia estable
  // Nota: Mantener en deps por ESLint exhaustive-deps, pero ya NO causa re-disparos (useCallback garantiza estabilidad)

  // 🤖 [IA] - v1.3.0: MÓDULO 4 - handleConfirmStep con lógica triple intento
  const handleConfirmStep = () => {
    if (!currentStep) return;

    const inputNum = parseInt(inputValue) || 0;
    const stepLabel = getDenominationDescription(currentStep.key, currentStep.label);
    const attemptCount = getAttemptCount(currentStep.key);

    // ✅ CASO 1: Valor correcto
    if (inputNum === currentStep.quantity) {
      // 🤖 [IA] - v1.3.5c: UNIFICADO primer y segundo intento correcto
      // Justificación: ZERO fricción para intentos correctos (Plan_Vuelto_Ciego.md línea 159)
      // Comportamiento: Avance inmediato sin modal, igual que primer intento

      // Registrar intento correcto si es segundo+ intento (para reporte)
      if (attemptCount >= 1) {
        recordAttempt(currentStep.key, inputNum, currentStep.quantity);
      }

      clearAttemptHistory(currentStep.key);
      onStepComplete(currentStep.key);

      // Vibración haptica si está disponible
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      // Avanzar a siguiente denominación
      if (!isLastStep) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
      }

      // Mantener focus inmediatamente
      if (inputRef.current) {
        inputRef.current.focus();
      }

      // Limpiar input
      requestAnimationFrame(() => {
        setInputValue('');
      });

      return;
    }

    // ❌ CASO 2: Valor incorrecto - REGISTRAR intento
    const newAttempt = recordAttempt(currentStep.key, inputNum, currentStep.quantity);

    if (attemptCount === 0) {
      // Primer intento incorrecto
      setModalState({
        isOpen: true,
        type: 'incorrect',
        stepLabel,
        thirdAttemptAnalysis: undefined
      });
      // 🤖 [IA] - v1.3.6h: DEFENSA NIVEL 1 - Blur input para prevenir Enter leak
      // Quitar focus del input cuando modal se abre → input NO recibe eventos teclado
      // Previene que usuario presione Enter por error y registre mismo valor sin recontar
      if (inputRef.current) {
        inputRef.current.blur();
      }
    } else if (attemptCount === 1) {
      // Segundo intento incorrecto
      const attempts = attemptHistory.get(currentStep.key) || [];
      const firstAttemptValue = attempts[0]?.inputValue;

      if (inputNum === firstAttemptValue) {
        // ESCENARIO 2a: Dos intentos iguales incorrectos → force override
        setModalState({
          isOpen: true,
          type: 'force-same',
          stepLabel,
          thirdAttemptAnalysis: undefined
        });
        // 🤖 [IA] - v1.3.6h: DEFENSA NIVEL 1 - Blur input para prevenir Enter leak
        if (inputRef.current) {
          inputRef.current.blur();
        }
      } else {
        // ESCENARIO 2b: Dos intentos diferentes → require third
        setModalState({
          isOpen: true,
          type: 'require-third',
          stepLabel,
          thirdAttemptAnalysis: undefined
        });
        // 🤖 [IA] - v1.3.6h: DEFENSA NIVEL 1 - Blur input para prevenir Enter leak
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    } else if (attemptCount >= 2) {
      // ESCENARIO 3: Tercer intento → analyze pattern
      // 🤖 [IA] - v1.3.0: MÓDULO 4 - FIX: Construir array con intentos previos + nuevo intento
      const previousAttempts = attemptHistory.get(currentStep.key) || [];
      const allAttempts = [...previousAttempts, newAttempt];

      // Solo procesar si tenemos exactamente 3 intentos
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
          // 🤖 [IA] - v1.3.6h: DEFENSA NIVEL 1 - Blur input para prevenir Enter leak
          if (inputRef.current) {
            inputRef.current.blur();
          }
        }
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // 🤖 [IA] - v1.3.6h: DEFENSA NIVEL 2 - Guard condition anti-enter leak
    // Previene que Enter ejecute handleConfirmStep cuando modal está abierto
    // Escenario: Usuario presiona Enter por error mientras modal está visible
    // Sin este guard: input ejecutaría handleConfirmStep → registraría mismo valor sin recontar
    if (modalState.isOpen) {
      e.preventDefault();
      e.stopPropagation();
      return; // ← Salir sin ejecutar handleConfirmStep
    }

    if (e.key === 'Enter') {
      // 🤖 [IA] - v1.3.1: FIX CRÍTICO - Permitir Enter con valores incorrectos para blind verification
      // La validación correcta/incorrecta la maneja handleConfirmStep internamente (líneas 153-283)
      // Enter debe comportarse igual que botón "Confirmar" (línea 679) - sin pre-validación
      if (inputValue.trim() !== '') {  // Solo verificar que no esté vacío
        handleConfirmStep();
      }
    }
  };

  // 🤖 [IA] - v1.3.0: MÓDULO 4 - Callbacks para BlindVerificationModal
  const handleRetry = () => {
    // Cerrar modal y limpiar input para reintentar
    setModalState(prev => ({ ...prev, isOpen: false }));
    setInputValue('');

    // Mantener focus en input para próximo intento
    const cleanup = createTimeoutWithCleanup(() => {
      inputRef.current?.focus();
    }, 'focus', 'retry_focus', 100);

    return cleanup;
  };

  const handleForce = () => {
    if (!currentStep) return;

    // Cerrar modal
    setModalState(prev => ({ ...prev, isOpen: false }));

    // 🤖 [IA] - v1.3.6M: Limpiar historial SOLO en force override (usuario forzó mismo valor 2 veces)
    // Justificación: Permite re-intentar si usuario se arrepiente del override antes de completar
    clearAttemptHistory(currentStep.key);

    // Marcar paso completado con valor forzado
    onStepComplete(currentStep.key);

    // Vibración haptic
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]); // Pattern diferente para indicar override
    }

    // Avanzar a siguiente step
    if (!isLastStep) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }

    requestAnimationFrame(() => {
      setInputValue('');
    });
  };

  const handleAcceptThird = () => {
    if (!currentStep) return;

    // Cerrar modal
    setModalState(prev => ({ ...prev, isOpen: false }));

    // 🤖 [IA] - v1.3.6M: FIX CRÍTICO - clearAttemptHistory() removido
    // Root cause: Borraba intentos ANTES de buildVerificationBehavior() → reporte sin datos errores
    // Solución: Preservar attemptHistory para que reporte incluya detalles cronológicos completos ✅

    // Marcar paso completado con valor del tercer intento analizado
    onStepComplete(currentStep.key);

    // Vibración haptic pattern crítico
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]); // Pattern severo para alerta crítica
    }

    // Avanzar a siguiente step
    if (!isLastStep) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }

    requestAnimationFrame(() => {
      setInputValue('');
    });
  };

  // 🤖 [IA] - v1.2.24: Función para mostrar modal de confirmación al retroceder
  const handlePreviousStep = () => {
    if (currentStepIndex > 0) {
      setShowBackConfirmation(true);
    }
  };

  // 🤖 [IA] - v1.2.24: Función para confirmar retroceso
  const handleConfirmedPrevious = () => {
    if (currentStepIndex > 0) {
      // Deshacer el paso actual si está completado
      const currentStepKey = verificationSteps[currentStepIndex].key;
      if (completedSteps[currentStepKey] && onStepUncomplete) {
        onStepUncomplete(currentStepKey);
      }

      // También deshacer el paso anterior para poder reeditarlo
      const prevIndex = currentStepIndex - 1;
      const prevStepKey = verificationSteps[prevIndex].key;
      if (completedSteps[prevStepKey] && onStepUncomplete) {
        onStepUncomplete(prevStepKey);
      }

      // Ahora retroceder al índice anterior
      setCurrentStepIndex(prevIndex);

      // Restaurar el valor del paso anterior si estaba completado
      const prevStep = verificationSteps[prevIndex];
      if (completedSteps[prevStepKey]) {
        // Si el paso estaba completado, restaurar su valor
        setInputValue(prevStep.quantity.toString());
      } else {
        // Si no estaba completado, limpiar
        setInputValue('');
      }

      // Mantener focus en el input
      setTimeout(() => {
        inputRef.current?.focus();
        // Seleccionar el texto para facilitar la edición
        inputRef.current?.select();
      }, 100);
    }
    setShowBackConfirmation(false);
  };

  // 🤖 [IA] - v1.2.24: Calcular si se puede ir al paso anterior
  const canGoPreviousInternal = currentStepIndex > 0;

  if (verificationSteps.length === 0) {
    return (
      <div className="glass-panel-success text-center p-8">
        <Check className="w-16 h-16 mx-auto mb-4 text-success" />
        <h3 className="text-xl font-bold mb-2 text-success">
          Verificación Innecesaria
        </h3>
        <p className="text-muted-foreground">
          No hay efectivo que verificar en caja.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-[clamp(0.5rem,2vw,0.75rem)] max-w-md mx-auto sm:max-w-2xl lg:max-w-3xl overflow-y-auto max-h-screen"
    >
      {/* Header - 🤖 [IA] - v1.2.24: Glass morphism unificado */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="glass-panel-success p-4"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-[clamp(0.5rem,2vw,0.75rem)]">
          <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)]">
            <div className="w-[clamp(2.5rem,10vw,3rem)] h-[clamp(2.5rem,10vw,3rem)] rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, var(--success-paradise) 0%, var(--success-paradise-light) 100%)'
            }}>
              <Building className="w-[clamp(1.25rem,5vw,1.5rem)] h-[clamp(1.25rem,5vw,1.5rem)] text-white" />
            </div>
            <div>
              <h3 className="text-[clamp(0.875rem,3.5vw,1rem)] sm:text-[clamp(1rem,4vw,1.125rem)] font-bold" style={{ color: 'var(--success-paradise)' }}>
                VERIFICACIÓN EN CAJA
              </h3>
              <p className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: 'var(--muted-foreground)' }}>
                Confirmar lo que queda
              </p>
            </div>
          </div>
          {/* 🤖 [IA] - v1.2.41AF: Badge objetivo responsive - visible en móviles */}
          <div className="text-center sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
            <span className="glass-target-badge inline-block px-[clamp(0.5rem,2vw,0.75rem)] py-[clamp(0.25rem,1vw,0.375rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] text-[clamp(0.625rem,2.5vw,0.875rem)] font-bold whitespace-nowrap">
              🎯 Objetivo: Cambio completo
            </span>
          </div>
        </div>
      </motion.div>

      {/* Progress - 🤖 [IA] - v1.2.24: Glass morphism unificado */}
      <div className="glass-progress-container p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)]">
            {/* Badge QUEDA EN CAJA */}
            <div className="glass-badge-success" style={{
              padding: `clamp(0.25rem,1vw,0.375rem) clamp(0.5rem,2vw,0.75rem)`,
              borderRadius: `clamp(10px,4vw,20px)`,
              display: 'flex',
              alignItems: 'center',
              gap: `clamp(0.25rem,1vw,0.375rem)`
            }}>
              <span style={{ fontSize: `clamp(0.7rem,2.8vw,0.75rem)` }}>💼</span>
              <span className="text-[clamp(0.7rem,2.8vw,0.75rem)] font-bold uppercase" style={{ color: 'var(--success-paradise)', letterSpacing: '0.5px' }}>
                Queda en Caja
              </span>
            </div>
            {/* Contador de unidades */}
            {/* 🤖 [IA] - v1.2.41AF: Etiqueta visible en móvil para contexto ("Progreso:" en lugar de "Verificado:") */}
            <div className="flex items-center gap-[clamp(0.375rem,1.5vw,0.5rem)]">
              <span className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: 'var(--muted-paradise)' }}>
                <span className="hidden sm:inline">Verificado:</span>
                <span className="inline sm:hidden">Progreso:</span>
              </span>
              <span className="text-[clamp(0.875rem,3.5vw,1rem)] font-bold" style={{ color: '#ffffff' }}>
                ✅ {Object.keys(completedSteps).filter(key => completedSteps[key]).length}/{verificationSteps.length}
              </span>
            </div>
          </div>
          <div className="flex-1 mx-[clamp(0.5rem,2vw,0.75rem)] rounded-full h-[clamp(0.5rem,2vw,0.625rem)]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div 
              className="h-[clamp(0.5rem,2vw,0.625rem)] rounded-full transition-all duration-500"
              style={{ 
                width: `${(Object.keys(completedSteps).filter(key => completedSteps[key]).length / verificationSteps.length) * 100}%`,
                background: 'linear-gradient(90deg, var(--success-paradise) 0%, var(--success-paradise-light) 100%)',
                boxShadow: '0 0 8px rgba(0, 186, 124, 0.4)'
              }}
            />
          </div>
          {/* 🤖 [IA] - v1.2.11: Sin mostrar montos hasta el final */}
        </div>
      </div>

      {/* Current Step - Con detección dinámica y animaciones v1.0.77 */}
      {currentStep && !completedSteps[currentStep.key] && (() => {
        // 🤖 [IA] - Función getIcon para mostrar imagen de denominación como DeliveryFieldView
        const getIcon = () => {
          const fieldType = ['penny', 'nickel', 'dime', 'quarter', 'dollarCoin'].includes(currentStep.key) ? 'coin' : 'bill';

          if (fieldType === 'coin') {
            let coinImage = '/monedas-recortadas-dolares/moneda-centavo-front-inlay.webp';

            if (currentStep.key === 'nickel') {
              coinImage = '/monedas-recortadas-dolares/moneda-cinco-centavos-dos-caras.webp';
            } else if (currentStep.key === 'dime') {
              coinImage = '/monedas-recortadas-dolares/moneda-diez-centavos.webp';
            } else if (currentStep.key === 'quarter') {
              coinImage = '/monedas-recortadas-dolares/moneda-25-centavos-dos-caras.webp';
            } else if (currentStep.key === 'dollarCoin') {
              coinImage = '/monedas-recortadas-dolares/moneda-un-dollar-nueva.webp';
            }

            return (
              <img
                src={coinImage}
                alt={`Moneda de ${currentStep.label}`}
                className="object-contain"
                style={{
                  width: 'clamp(234.375px, 58.59vw, 390.625px)',
                  aspectRatio: '2.4 / 1'
                }}
              />
            );
          } else {
            let billImage = '/monedas-recortadas-dolares/billete-1.webp';

            // Usar estándar canónico: bill1, bill5, bill10, bill20, bill50, bill100
            if (currentStep.key === 'bill1') {
              billImage = '/monedas-recortadas-dolares/billete-1.webp';
            } else if (currentStep.key === 'bill5') {
              billImage = '/monedas-recortadas-dolares/billete-5.webp';
            } else if (currentStep.key === 'bill10') {
              billImage = '/monedas-recortadas-dolares/billete-10.webp';
            } else if (currentStep.key === 'bill20') {
              billImage = '/monedas-recortadas-dolares/billete-20.webp';
            } else if (currentStep.key === 'bill50') {
              billImage = '/monedas-recortadas-dolares/billete-cincuenta-dolares-sobre-fondo-blanco(1).webp';
            } else if (currentStep.key === 'bill100') {
              billImage = '/monedas-recortadas-dolares/billete-100.webp';
            }

            return (
              <img
                src={billImage}
                alt={`Billete de ${currentStep.label}`}
                className="object-contain w-full h-full"
              />
            );
          }
        };

        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="glass-morphism-panel p-0 relative border-2 border-primary/30"
          >
            {/* 🤖 [IA] - v1.2.41AF: Badge ACTIVO floating para feedback visual consistente con Phase 1 */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 z-10 bg-primary/90 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm border border-primary/50"
              style={{
                background: 'linear-gradient(135deg, rgba(10, 132, 255, 0.9) 0%, rgba(94, 92, 230, 0.9) 100%)'
              }}
            >
              ACTIVO ▶
            </motion.div>

            {/* Content Section */}
            <div className="p-[clamp(12px,3vw,20px)] pb-32">
              {/* Header con imagen de denominación como DeliveryFieldView */}
              <div className="text-center mb-[clamp(16px,4vw,24px)]">
                {/* Imagen de denominación */}
                <div
                  className="flex items-center justify-center mx-auto"
                  style={{
                    width: 'clamp(234.375px, 58.59vw, 390.625px)',
                    aspectRatio: '2.4 / 1',
                    borderRadius: 'clamp(23.44px, 5.86vw, 35.16px)',
                    backgroundColor: 'transparent'
                  }}
                >
                  {getIcon()}
                </div>

                {/* Badge ENTREGAR para Phase 2 */}
                {/* 🤖 [IA] - v1.2.41AF: Fix emoji semántico 📤 → 💼 (maletín representa "lo que permanece en caja") */}
                <div className="glass-status-error inline-block px-4 py-2 rounded-lg mt-4">
                  <p className="text-sm font-semibold" style={{ color: '#22c55e' }}>
                    {'💼\u00A0\u00A0QUEDA EN CAJA '}
                    <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.4em' }}>{currentStep.quantity}</span>
                  </p>
                </div>

                {/* Etiqueta de denominación descriptiva */}
                {/* 🤖 [IA] - v1.2.41AF: Aumentado contraste (70% → 90%) + tamaño (xs → sm móvil) para legibilidad */}
                <div className="mt-2">
                  <span className="text-[clamp(0.75rem,3vw,0.875rem)] text-white/90 font-medium">
                    {getDenominationDescription(currentStep.key, currentStep.label)}
                  </span>
                </div>
              </div>

              {/* Input de confirmación - Estilo coherente con DeliveryFieldView */}
              <div>
              <div className="flex items-center" style={{ gap: 'clamp(8px, 2vw, 16px)' }}>
                <div className="flex-1 relative">
                  {/* 🤖 [IA] - v1.2.52: Accessible label for screen readers (WCAG 2.1 SC 3.3.2) */}
                  <Label
                    htmlFor={`verification-input-${currentStep.key}`}
                    className="sr-only"
                  >
                    {getDenominationDescription(currentStep.key, currentStep.label)}
                  </Label>

                  <Input
                    id={`verification-input-${currentStep.key}`}
                    ref={inputRef}
                    type="text"  // 🤖 [IA] - v3.1.0: Unificado a "text" para teclado decimal consistente
                    inputMode="decimal"  // 🤖 [IA] - v3.1.0: Forzar teclado decimal en todos los casos
                    pattern="[0-9]*[.,]?[0-9]*"  // 🤖 [IA] - v3.1.0: Acepta punto y coma para Android
                    value={inputValue}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      setInputValue(value);
                    }}
                    onKeyDown={handleKeyPress}
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="off"
                    placeholder={`¿Cuántos ${getDenominationDescription(currentStep.key, currentStep.label).toLowerCase()}?`}
                    style={{
                      borderColor: parseInt(inputValue) !== currentStep.quantity && inputValue ? 'var(--danger)' : 'var(--accent-primary)',
                      fontSize: 'clamp(18px, 4vw, 24px)',
                      fontWeight: 'bold',
                      height: 'clamp(48px, 12vw, 56px)',
                      textAlign: 'center',
                      paddingLeft: 'clamp(14px, 3vw, 20px)',
                      paddingRight: 'clamp(14px, 3vw, 20px)',
                      transition: 'all 0.3s ease'
                    }}
                    className="focus:neon-glow-primary"
                    autoFocus
                  />
                  {parseInt(inputValue) !== currentStep.quantity && inputValue && (
                    <div className="absolute -bottom-6 left-0 right-0 text-center">
                      <span className="text-xs text-destructive">
                        Ingresa exactamente {currentStep.quantity} {getDenominationDescription(currentStep.key, currentStep.label).toLowerCase()}
                      </span>
                    </div>
                  )}
                </div>
                <ConstructiveActionButton
                  onClick={handleConfirmStep}
                  disabled={!inputValue}  // 🤖 [IA] - v1.3.0: MÓDULO 4 - Permitir valores incorrectos para blind verification
                  onTouchStart={(e) => e.preventDefault()}
                  aria-label="Confirmar cantidad"
                  className="btn-guided-confirm"
                  style={{
                    height: 'clamp(48px, 12vw, 56px)'
                  }}
                >
                  Confirmar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </ConstructiveActionButton>
              </div>
              {/* Success indicator */}
              {inputValue && parseInt(inputValue) === currentStep.quantity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-2 flex justify-start"
                >
                  <div className="flex items-center gap-1 text-xs text-success">
                    <Check className="w-3 h-3" />
                    <span>Cantidad correcta</span>
                  </div>
                </motion.div>
              )}
              </div>
            </div>

            {/* Navigation footer - matching DeliveryFieldView */}
            {/* 🚨 FIX v1.3.1: onCancel y onPrevious son props requeridas, condición removida */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 border-t border-white/10 p-4 bg-black/20 backdrop-blur-sm">
              <DestructiveActionButton
                onClick={onCancel}
                aria-label="Cancelar verificación y volver"
              >
                Cancelar
              </DestructiveActionButton>

              {/* 🤖 [IA] - v1.2.24: Botón Anterior con lógica local */}
              <NeutralActionButton
                onClick={handlePreviousStep}
                disabled={!canGoPreviousInternal}
                aria-label="Denominación anterior"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="ml-2">Anterior</span>
              </NeutralActionButton>
            </div>
          </motion.div>
        );
      })()}

      {/* Final Validation - 🤖 [IA] - v1.2.24: Glass morphism unificado */}
      {allStepsCompleted && (
        <div className="glass-panel-success text-center p-8">
          <Check className="w-[clamp(3rem,12vw,4rem)] h-[clamp(3rem,12vw,4rem)] mx-auto mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: 'var(--success-paradise)' }} />
          <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-[clamp(0.5rem,2vw,0.75rem)]" style={{ color: 'var(--success-paradise)' }}>
            Verificación Exitosa
          </h3>
          <p className="text-[clamp(0.875rem,3.5vw,1rem)] mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: 'var(--muted-paradise)' }}>
            Has confirmado que quedan exactamente {formatCurrency(expectedTotal)} en caja.
          </p>
          <div className="rounded-[clamp(0.5rem,2vw,0.75rem)] p-[clamp(0.75rem,3vw,1rem)] mb-[clamp(0.75rem,3vw,1rem)] mx-auto max-w-md" style={{
            backgroundColor: 'rgba(0, 186, 124, 0.1)',
            border: '1px solid rgba(0, 186, 124, 0.3)',
          }}>
            <div className="flex items-center justify-center gap-[clamp(0.375rem,1.5vw,0.5rem)]">
              <Target className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" style={{ color: 'var(--success-paradise)' }} />
              <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: 'var(--success-paradise)' }}>
                OBJETIVO CUMPLIDO: {formatCurrency(50.00)} ✓
              </span>
            </div>
          </div>
          <p className="text-[clamp(0.75rem,3vw,0.875rem)] font-medium" style={{ color: '#1d9bf0' }}>
            Procediendo a generar reporte final...
          </p>
        </div>
      )}

      {/* Modal de confirmación para retroceder */}
      <ConfirmationModal
        open={showBackConfirmation}
        onOpenChange={setShowBackConfirmation}
        title="¿Retroceder al paso anterior?"
        description="El progreso del paso actual se perderá."
        warningText="Retrocede si necesitas corregir la cantidad anterior."
        confirmText="Sí, retroceder"
        cancelText="Continuar aquí"
        onConfirm={handleConfirmedPrevious}
        onCancel={() => setShowBackConfirmation(false)}
      />

      {/* 🤖 [IA] - v1.3.0: MÓDULO 4 - BlindVerificationModal para triple intento */}
      <BlindVerificationModal
        isOpen={modalState.isOpen}
        type={modalState.type}
        stepLabel={modalState.stepLabel}
        onRetry={handleRetry}
        onForce={handleForce}
        onAcceptThird={handleAcceptThird}
        thirdAttemptAnalysis={modalState.thirdAttemptAnalysis}
      />
    </motion.div>
  );
}
