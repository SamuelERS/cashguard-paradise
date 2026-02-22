// 🤖 [IA] - v1.3.2.4: FASE 4 - Extracción VerificationInputField component (-70 líneas neto)
// Previous: v1.3.2.3 - FASE 3 MÓDULO 3 - Extracción Header + Progress → Componentes separados (-87 líneas neto)
// Previous: v1.3.7AI - FIX CRÍTICO warning_override NO reportado - clearAttemptHistory() removido handleForce() (patrón v1.3.6M/v1.3.6T)
// Previous: v1.3.7AH - OCULTACIÓN MENSAJE "CANTIDAD CORRECTA" - Conditional success message (5 elementos ocultos)
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
import { Building, ChevronRight, Check, Banknote, Target, CheckCircle, Coins } from 'lucide-react';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { NeutralActionButton } from '@/components/ui/neutral-action-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';  // 🤖 [IA] - v1.2.52: WCAG 2.1 SC 3.3.2 compliance
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
// 🤖 [IA] - Desmonolitado desde Phase2VerificationSection.tsx
import { getDenominationDescription, SHOW_REMAINING_AMOUNTS } from '@/utils/verification-helpers';
import { useVerificationBehavior } from '@/hooks/useVerificationBehavior';
// 🤖 [IA] - FASE 5 PASO 2: Utilidad centralizada para imágenes denominaciones (elimina DRY violation)
import { getDenominationImageElement } from '@/utils/denomination-images';
// 🤖 [IA] - v1.3.2.3: FASE 3 MÓDULO 3 - Componentes Header + Progress extraídos
import { VerificationHeader } from '@/components/verification/VerificationHeader';
import { VerificationProgress } from '@/components/verification/VerificationProgress';
// 🤖 [IA] - v1.3.2.4: FASE 4 - Input Field component extraído
import { VerificationInputField } from '@/components/verification/VerificationInputField';
// 🤖 [IA] - FASE 5 PASO 4: Completion Message component extraído
import { VerificationCompletionMessage } from '@/components/verification/VerificationCompletionMessage';
// 🤖 [IA] - FASE 5 PASO 6: Footer component extraído
import { VerificationFooter } from '@/components/verification/VerificationFooter';

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
}

export function Phase2VerificationSection({
  deliveryCalculation,
  onStepComplete,
  onStepUncomplete,
  onSectionComplete,
  onVerificationBehaviorCollected, // 🤖 [IA] - v1.3.6: MÓDULO 1 - Nueva prop callback
  completedSteps,
  onCancel
}: Phase2VerificationSectionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
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
      (attemptCount + 1) as 1 | 2 | 3,
      inputValue
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

  // 🤖 [IA] - Desmonolitado desde Phase2VerificationSection.tsx
  // Hook que construye VerificationBehavior desde attemptHistory Map
  const behavior = useVerificationBehavior(attemptHistory, verificationSteps);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSteps, verificationSteps, currentStepIndex]);
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
        // 🤖 [IA] - Desmonolitado: behavior ahora viene del hook useVerificationBehavior
        if (onVerificationBehaviorCollected) {
          onVerificationBehaviorCollected(behavior);
        }

        // ⏱️ Small delay para garantizar state update en Phase2Manager antes de section complete
        setTimeout(() => {
          onSectionComplete();
        }, 100);
      }, 'transition', 'verification_section_complete');
      return cleanup;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allStepsCompleted, verificationSteps.length, behavior]);
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

      // 🤖 [IA] - v1.3.6T: FIX CRÍTICO - clearAttemptHistory() removido (patrón v1.3.6M)
      // Root cause: Borraba intentos 1-2 ANTES de buildVerificationBehavior() → warnings NO aparecían en reporte
      // Solución: Preservar attemptHistory para que reporte incluya warnings completos ✅
      // Justificación idéntica a v1.3.6M: buildVerificationBehavior() NECESITA datos, Map se limpia al unmount

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

    // 🤖 [IA] - v1.3.7AI: FIX CRÍTICO warning_override - clearAttemptHistory() removido (patrón v1.3.6M/v1.3.6T)
    // Root cause: Borraba attemptHistory Map ANTES de buildVerificationBehavior() → warnings NO aparecían en reporte WhatsApp
    // Problema: handleForce() ejecuta línea 561 → attemptHistory.delete('nickel') → onStepComplete() → allStepsCompleted=true
    //          → useEffect dispara buildVerificationBehavior() 7s después → forEach no itera key borrada → denominationsWithIssues=[]
    // Solución: Preservar attemptHistory completo para que buildVerificationBehavior() construya reporte con TODOS los intentos ✅
    // Justificación v1.3.6M OBSOLETA: "Permite re-intentar si se arrepiente" - Modal force-same NO tiene botón cancelar desde v1.3.2
    //                                  (BlindVerificationModal.tsx línea 100: showCancel: false)
    // Justificación ACTUAL: Map se limpia automáticamente al unmount componente (React lifecycle) - no hay memory leaks
    // Patrón validado: v1.3.6T (línea 411 handleConfirmStep) + v1.3.6M (handleAcceptThird) - ambos funcionan correctamente

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
      {/* 🤖 [IA] - v1.3.2.3: Header component extraído */}
      <VerificationHeader />

      {/* 🤖 [IA] - v1.3.2.3: Progress component extraído */}
      <VerificationProgress
        completedSteps={completedSteps}
        verificationSteps={verificationSteps}
      />

      {/* Current Step - Con detección dinámica y animaciones v1.0.77 */}
      {currentStep && !completedSteps[currentStep.key] && (() => {
        // 🤖 [IA] - FASE 5 PASO 2: getIcon() removido (63 líneas) → Usando getDenominationImageElement() utility
        // Root cause: Función duplicada en 3 archivos (~200 líneas total)
        // Solución: Single source of truth en /src/utils/denomination-images.ts

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
                  {/* 🤖 [IA] - FASE 5 PASO 2: Usando getDenominationImageElement() utility */}
                  {getDenominationImageElement(currentStep.key as keyof CashCount, currentStep.label)}
                </div>

                {/* 🔒 Badge condicional QUEDA EN CAJA (conteo ciego producción) */}
                {SHOW_REMAINING_AMOUNTS && (
                  <div className="glass-status-error inline-block px-4 py-2 rounded-lg mt-4">
                    <p className="text-sm font-semibold" style={{ color: '#22c55e' }}>
                      {'💼\u00A0\u00A0QUEDA EN CAJA '}
                      <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.4em' }}>{currentStep.quantity}</span>
                    </p>
                  </div>
                )}

                {/* 🔒 Badge alternativo (modo producción - sin cantidad específica) */}
                {!SHOW_REMAINING_AMOUNTS && (
                  <div className="glass-status-error inline-block px-4 py-2 rounded-lg mt-4">
                    <p className="text-sm font-semibold" style={{ color: '#22c55e' }}>
                      {'💼\u00A0\u00A0VERIFICANDO CAJA'}
                    </p>
                  </div>
                )}

                {/* Etiqueta de denominación descriptiva */}
                {/* 🤖 [IA] - v1.2.41AF: Aumentado contraste (70% → 90%) + tamaño (xs → sm móvil) para legibilidad */}
                <div className="mt-2">
                  <span className="text-[clamp(0.75rem,3vw,0.875rem)] text-white/90 font-medium">
                    {getDenominationDescription(currentStep.key, currentStep.label)}
                  </span>
                </div>
              </div>

              {/* 🤖 [IA] - v1.3.2.4: Input Field component extraído */}
              {/* Calcular valores correctos/incorrectos para props del componente */}
              {(() => {
                const isValueCorrect = inputValue && parseInt(inputValue) === currentStep.quantity;
                const isValueIncorrect = parseInt(inputValue) !== currentStep.quantity && inputValue;

                return (
                  <VerificationInputField
                    inputValue={inputValue}
                    onInputChange={(value) => setInputValue(value.replace(/[^0-9]/g, ''))}
                    currentStep={currentStep}
                    inputRef={inputRef}
                    onKeyDown={handleKeyPress}
                    onConfirm={handleConfirmStep}
                    isValueCorrect={!!isValueCorrect}
                    isValueIncorrect={!!isValueIncorrect}
                    modalIsOpen={modalState.isOpen}
                    showRemainingAmounts={SHOW_REMAINING_AMOUNTS}
                    confirmDisabled={!inputValue}
                  />
                );
              })()}
            </div>

            {/* 🤖 [IA] - FASE 5 PASO 6: Footer component extraído */}
            <VerificationFooter onCancel={onCancel} />
          </motion.div>
        );
      })()}

      {/* 🤖 [IA] - FASE 5 PASO 4: Completion Message component extraído */}
      {allStepsCompleted && (
        <VerificationCompletionMessage totalDenominations={verificationSteps.length} />
      )}

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
