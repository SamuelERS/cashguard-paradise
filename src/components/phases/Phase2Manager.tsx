// 🤖 [IA] - v1.3.6AD2: FIX BUG CRÍTICO DIFERENCIA VUELTO - Helper ajusta denominationsToKeep post-verificación con valores ACEPTADOS
// Previous: v1.3.6N - FIX DEFINITIVO STATE MUTATION - Callback actualiza usePhaseManager state correctamente
// 🤖 [IA] - v1.3.6f: BUG FIX CRÍTICO #3 - handleVerificationSectionComplete sin useCallback + verificationBehavior en deps
// 🤖 [IA] - v1.2.41AD: Doctrina D.5 Compliance - Migración a arquitectura basada en datos separada
// 🤖 [IA] - v1.2.50: Fix definitivo setTimeout nativo - eliminado createTimeoutWithCleanup de dependencies
// 🤖 [IA] - v1.2.49: Fix crítico referencia inestable - memoización handleDeliverySectionComplete
// 🤖 [IA] - v1.1.14 - Simplificación de tabs y eliminación de redundancias en Fase 2
// 🤖 [IA] - v1.2.41Z: Migración header modal a patrón canónico (icono + subtítulo + botón X)
// 🤖 [IA] - v1.2.41AA: Footer único botón + subtítulos 2 líneas + iconos semánticos
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Package, ScrollText, Grid3x3, AlertCircle, DollarSign, X, Pencil, Banknote, CheckCircle2, FileText } from 'lucide-react';
import { InstructionRule, type RuleState } from '@/components/wizards/InstructionRule';
import type { InstructionIconName } from '@/hooks/instructions/useInstructionFlow';
import { phase2PreparationInstructions } from '@/data/instructions/phase2PreparationInstructions'; // 🤖 [IA] - v1.2.41AD: Configuración de datos separada

// 🤖 [IA] - FASE 5: Mapa estático de íconos → habilita tree-shaking de lucide-react
const ICON_MAP: Partial<Record<InstructionIconName, React.ComponentType<React.SVGProps<SVGSVGElement>>>> = {
  Package,
  FileText,
  Banknote,
};
import { WizardGlassCard } from '@/components/wizards/WizardGlassCard';
// 🤖 [IA] - v1.2.10: Agregado modal controlado para confirmación de salida
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AbortCorteModal } from "@/components/ui/abort-corte-modal";
// 🤖 [IA] - v1.3.0: Reemplazado botones nativos con componentes Button para estandarización
import { Button } from "@/components/ui/button";
// 🤖 [IA] - v1.2.19: Agregados botones de acción para modal de confirmación ROJO/VERDE
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
// 🤖 [IA] - v2.0.0: Agregado NeutralActionButton para botón "Volver al inicio"
import { NeutralActionButton } from "@/components/ui/neutral-action-button";
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 2 archivos CSS están ahora importados globalmente vía index.css:
// - phase2-buttons.css
// - phase2-modal.css
import { Phase2DeliverySection } from './Phase2DeliverySection';
import { Phase2VerificationSection } from './Phase2VerificationSection';
import { DeliveryCalculation } from '@/types/phases';
import { formatCurrency, calculateCashTotal } from '@/utils/calculations'; // 🤖 [IA] - v1.3.6AD2: Agregado calculateCashTotal para helper adjustDenominationsWithVerification
import { useTimingConfig } from '@/hooks/useTimingConfig'; // 🤖 [IA] - Hook de timing unificado v1.0.22
import { useChecklistFlow } from '@/hooks/useChecklistFlow'; // 🤖 [IA] - v1.2.26: Hook especializado para checklist
// 🤖 [IA] - v1.3.6: MÓDULO 2 - Import VerificationBehavior type para state
import type { VerificationBehavior } from '@/types/verification';
import type { CashCount } from '@/types/cash';

interface Phase2ManagerProps {
  deliveryCalculation: DeliveryCalculation;
  onPhase2Complete: () => void;
  onBack: () => void;
  onAbortFlow?: (motivo: string) => Promise<void> | void;
  onDeliveryCalculationUpdate?: (updates: Partial<DeliveryCalculation>) => void; // 🤖 [IA] - v1.3.6N: Callback para actualizar deliveryCalculation.verificationBehavior en usePhaseManager
}

export function Phase2Manager({
  deliveryCalculation,
  onPhase2Complete,
  onBack,
  onAbortFlow,
  onDeliveryCalculationUpdate // 🤖 [IA] - v1.3.6N: Callback para actualizar state en usePhaseManager
}: Phase2ManagerProps) {
  const [currentSection, setCurrentSection] = useState<'delivery' | 'verification'>('delivery');
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState<Record<string, boolean>>({});
  const [verificationProgress, setVerificationProgress] = useState<Record<string, boolean>>({});
  // 🤖 [IA] - v1.3.6: MÓDULO 2 - State para almacenar VerificationBehavior completo
  const [verificationBehavior, setVerificationBehavior] = useState<VerificationBehavior | undefined>(undefined);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false); // 🤖 [IA] - v1.2.10: Estado para modal de confirmación
  const [showInstructionsModal, setShowInstructionsModal] = useState(true); // 🤖 [IA] - v1.2.10: Modal de instrucciones
  const [showInstructionsCancelConfirmation, setShowInstructionsCancelConfirmation] = useState(false); // 🤖 [IA] - Estado para confirmar cancelación del modal de instrucciones
  // 🤖 [IA] - v1.2.26: Hook especializado para checklist progresivo con revelación
  const {
    checkedItems,
    enabledItems,
    hiddenItems,
    initializeChecklist,
    handleCheckChange,
    isChecklistComplete,
    getItemClassName,
    isItemActivating
  } = useChecklistFlow();

  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Usar timing unificado v1.0.22

  // 🤖 [IA] - v1.2.26: Verificar si todos los items están marcados
  const allItemsChecked = isChecklistComplete();

  // 🤖 [IA] - Handler para solicitud de cancelación del modal de instrucciones
  const handleInstructionsCancelRequest = () => {
    setShowInstructionsCancelConfirmation(true);
  };

  const handleAbortFromPhase2 = useCallback(async (motivo: string) => {
    setShowExitConfirmation(false);
    setShowInstructionsCancelConfirmation(false);
    setShowInstructionsModal(false);

    if (onAbortFlow) {
      await onAbortFlow(motivo);
      return;
    }

    onBack();
  }, [onAbortFlow, onBack]);

  // 🤖 [IA] - v1.2.26: Inicialización del checklist con revelación progresiva
  useEffect(() => {
    if (showInstructionsModal) {
      initializeChecklist();
    }
  }, [showInstructionsModal, initializeChecklist]);

  // Auto-advance to verification when delivery is complete
  // 🤖 [IA] - v1.2.50: Reemplazado createTimeoutWithCleanup con setTimeout nativo
  // RAZÓN CRÍTICA: createTimeoutWithCleanup en dependencies causaba re-disparos infinitos
  // porque la función puede cambiar de referencia (depende de getDelay, cancelTimeout)
  // setTimeout nativo con delay fijo (1000ms) garantiza estabilidad total
  useEffect(() => {
    console.log('[Phase2Manager] 🔄 Transition useEffect:', {
      deliveryCompleted,
      currentSection,
      willTransition: deliveryCompleted && currentSection === 'delivery'
    });

    if (deliveryCompleted && currentSection === 'delivery') {
      console.log('[Phase2Manager] ✅ Triggering transition to verification in 1000ms');

      const timeoutId = setTimeout(() => {
        console.log('[Phase2Manager] 🚀 EXECUTING transition: delivery → verification');
        setCurrentSection('verification');
      }, 1000); // ← setTimeout nativo, delay fijo garantizado

      return () => clearTimeout(timeoutId);
    }
  }, [deliveryCompleted, currentSection]); // ← SIN createTimeoutWithCleanup - solo deps reales

  // Complete phase 2 when verification is done
  // 🤖 [IA] - v1.3.6N: FIX CRÍTICO STATE MUTATION - Reemplazar mutación con state update
  // Root cause v1.3.6M: deliveryCalculation.verificationBehavior = X (mutación) NO actualiza state en usePhaseManager
  // Problema: CashCalculation recibe prop stale (sin verificationBehavior) → reporte sin detalles errores
  // Solución: onDeliveryCalculationUpdate({ verificationBehavior }) actualiza state correctamente
  // 🤖 [IA] - v1.2.50: Reemplazado createTimeoutWithCleanup con setTimeout nativo
  useEffect(() => {
    // 🤖 [IA] - v1.3.6O: FIX DEFINITIVO TIMING ISSUE - Chequear AMBAS condiciones
    // Root cause: useEffect ejecutaba con verificationCompleted=true PERO verificationBehavior=undefined
    // Problema: State update de setVerificationBehavior es asíncrono, timeout ejecutaba antes de tener dato
    // Solución: Esperar AMBAS condiciones (verificationCompleted Y verificationBehavior) antes de setTimeout
    if (verificationCompleted && verificationBehavior) {
      console.log('[Phase2Manager] 🔄 useEffect disparado - verificationCompleted:', verificationCompleted);
      console.log('[Phase2Manager] 🔍 verificationBehavior en useEffect:', verificationBehavior);

      const timeoutId = setTimeout(() => {
        // 🤖 [IA] - v1.3.6AD2: FIX BUG DIFERENCIA VUELTO - Ajustar denominationsToKeep con valores ACEPTADOS
        if (verificationBehavior) {
          console.log('[Phase2Manager] 🎯 verificationBehavior EXISTE - procediendo a ajustar denominationsToKeep');
          console.log('[Phase2Manager] 📊 Objeto completo verificationBehavior:', JSON.stringify(verificationBehavior, null, 2));

          // ✅ PASO 1: Ajustar denominationsToKeep con valores ACEPTADOS post-verificación
          const { adjustedKeep, adjustedAmount } = adjustDenominationsWithVerification(
            deliveryCalculation.denominationsToKeep,
            verificationBehavior
          );

          console.log('[Phase2Manager] 🔄 denominationsToKeep AJUSTADO:');
          console.log('[Phase2Manager]   - Original:', deliveryCalculation.denominationsToKeep);
          console.log('[Phase2Manager]   - Ajustado:', adjustedKeep);
          console.log('[Phase2Manager]   - Monto original: $50.00');
          console.log('[Phase2Manager]   - Monto ajustado:', adjustedAmount);

          if (onDeliveryCalculationUpdate) {
            // ✅ PASO 2: Pasar TODOS los valores actualizados al callback
            onDeliveryCalculationUpdate({
              verificationBehavior,       // ← Datos de errores
              denominationsToKeep: adjustedKeep,  // ← Cantidades AJUSTADAS
              amountRemaining: adjustedAmount     // ← Total REAL recalculado
            });
            console.log('[Phase2Manager] ✅ onDeliveryCalculationUpdate EJECUTADO - 3 valores actualizados');
            console.log('[Phase2Manager]   - verificationBehavior ✅');
            console.log('[Phase2Manager]   - denominationsToKeep ✅ (ajustado con valores aceptados)');
            console.log('[Phase2Manager]   - amountRemaining ✅ (total recalculado: ' + adjustedAmount + ')');
          } else {
            console.warn('[Phase2Manager] ⚠️ onDeliveryCalculationUpdate no disponible - usando fallback mutation');
            deliveryCalculation.verificationBehavior = verificationBehavior; // Fallback (legacy)
            deliveryCalculation.denominationsToKeep = adjustedKeep; // ← Ajustar también en fallback
          }
        } else {
          console.error('[Phase2Manager] 🔴 PROBLEMA CRÍTICO: verificationBehavior es undefined - timing issue detectado');
          console.error('[Phase2Manager] 🔴 Reporte NO incluirá detalles verificación ciega.');
        }
        onPhase2Complete();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verificationCompleted, verificationBehavior, onPhase2Complete, onDeliveryCalculationUpdate]);
  // 🤖 [IA] - v1.3.6k: REVERTIDO comentario v1.3.6f - verificationBehavior DEBE estar en deps
  // Justificación: Si behavior llega tarde (async state update), useEffect debe re-ejecutar para agregarlo
  // Justificación: Valor se captura en closure del setTimeout, NO necesita ser dependencia explícita
  // Comportamiento: useEffect solo se dispara cuando verificationCompleted cambia (trigger único correcto)
  // 🤖 [IA] - v1.3.6b: BUG FIX CRÍTICO #2 - deliveryCalculation removido de dependencies array
  // Root cause: deliveryCalculation solo se MUTA (línea 148), NO se LEE en useEffect
  // Problema: Mutación cambia referencia → useEffect se re-dispara infinitamente → loop #2
  // Solución: Remover de deps - mutación es side effect válido para enriquecer objeto
  // eslint-disable: deliveryCalculation intencionalmente omitido - solo se muta como fallback, no se lee

  // 🤖 [IA] - v1.3.6AD2: HELPER FUNCIÓN - Ajusta denominationsToKeep con valores ACEPTADOS post-verificación
  // Root cause fix: deliveryCalculation.denominationsToKeep usa cantidades ESPERADAS (línea 29 deliveryCalculation.ts)
  // Problema: Verificación acepta valores diferentes (ej: 70 en lugar de 75) pero reporte usa esperados
  // Solución: Recalcular denominationsToKeep usando verificationBehavior.denominationsWithIssues[].attempts
  // Input: denominationsToKeep original + verificationBehavior con denominaciones que tuvieron errores
  // Output: { adjustedKeep: CashCount ajustado, adjustedAmount: número total recalculado }
  const adjustDenominationsWithVerification = useCallback((
    denominationsToKeep: Record<string, number>,
    verificationBehavior: VerificationBehavior
  ): { adjustedKeep: Record<string, number>; adjustedAmount: number } => {
    console.log('[Phase2Manager] 🔧 adjustDenominationsWithVerification() INICIO');
    console.log('[Phase2Manager] 📊 Input denominationsToKeep:', denominationsToKeep);
    console.log('[Phase2Manager] 📊 Input verificationBehavior.denominationsWithIssues:', verificationBehavior.denominationsWithIssues);

    // Clonar objeto para no mutar el original
    const adjusted = { ...denominationsToKeep };

    // Iterar solo denominaciones con errores (las demás quedan con valores esperados originales)
    verificationBehavior.denominationsWithIssues.forEach(issue => {
      console.log(`[Phase2Manager] 🔍 Procesando denominación con issue: ${issue.denomination}`);
      console.log(`[Phase2Manager] 📊 Severity: ${issue.severity}, Attempts: [${issue.attempts.join(', ')}]`);

      if (issue.attempts.length > 0) {
        // Usar ÚLTIMO valor del array attempts (valor aceptado final)
        // Puede ser: override (2 iguales), promedio (3 diferentes), o correcto en segundo intento
        const acceptedValue = issue.attempts[issue.attempts.length - 1];
        console.log(`[Phase2Manager] ✅ Valor aceptado para ${issue.denomination}: ${acceptedValue} (era: ${adjusted[issue.denomination]})`);
        adjusted[issue.denomination] = acceptedValue;
      } else {
        console.warn(`[Phase2Manager] ⚠️ Denominación ${issue.denomination} sin attempts - preservando valor esperado`);
      }
    });

    // Recalcular total REAL con cantidades ajustadas
    const adjustedAmount = calculateCashTotal(adjusted);
    console.log('[Phase2Manager] 💰 Total recalculado:', adjustedAmount);
    console.log('[Phase2Manager] 📊 Output adjustedKeep:', adjusted);
    console.log('[Phase2Manager] 🔧 adjustDenominationsWithVerification() FIN');

    return { adjustedKeep: adjusted, adjustedAmount };
  }, []);

  const handleDeliveryStepComplete = (stepKey: string) => {
    setDeliveryProgress(prev => ({
      ...prev,
      [stepKey]: true
    }));

    // Check if all delivery steps are complete
    const allDeliveryComplete = deliveryCalculation.deliverySteps.every(
      step => deliveryProgress[step.key] || step.key === stepKey
    );

    if (allDeliveryComplete) {
      setDeliveryCompleted(true);
    }
  };

  const handleDeliveryLiveUpdate = useCallback((event: { stepKey: string; quantity: number; subtotal: number }) => {
    if (!onDeliveryCalculationUpdate) return;

    const stepKey = event.stepKey as keyof CashCount;
    const currentProgress = deliveryCalculation.liveDeliveryProgress ?? {};
    const currentEvents = deliveryCalculation.liveDeliveryEvents ?? [];
    const nextProgress = {
      ...currentProgress,
      [stepKey]: event.quantity,
    };
    const nextEvents = [
      ...currentEvents,
      {
        stepKey,
        quantity: event.quantity,
        subtotal: event.subtotal,
        capturedAt: new Date().toISOString(),
      },
    ];
    const nextTotal = nextEvents.reduce((acc, item) => acc + item.subtotal, 0);

    onDeliveryCalculationUpdate({
      liveDeliveryProgress: nextProgress,
      liveDeliveryEvents: nextEvents,
      liveDeliveryTotal: nextTotal,
    });
  }, [
    deliveryCalculation.liveDeliveryEvents,
    deliveryCalculation.liveDeliveryProgress,
    onDeliveryCalculationUpdate,
  ]);

  // 🤖 [IA] - v1.2.24: Función para deshacer pasos de entrega
  const handleDeliveryStepUncomplete = (stepKey: string) => {
    setDeliveryProgress(prev => ({
      ...prev,
      [stepKey]: false
    }));
  };

  // 🤖 [IA] - v1.3.6: MÓDULO 2 - Handler para recolectar VerificationBehavior completo
  const handleVerificationBehaviorCollected = useCallback((behavior: VerificationBehavior) => {
    console.log('[Phase2Manager] 📊 VerificationBehavior recolectado:', behavior);
    console.log('[Phase2Manager] 🔍 Total attempts recibidos:', behavior.totalAttempts);
    console.log('[Phase2Manager] 🔍 Inconsistencias críticas:', behavior.criticalInconsistencies);
    console.log('[Phase2Manager] 🔍 Inconsistencias severas:', behavior.severeInconsistencies);
    setVerificationBehavior(behavior);
    console.log('[Phase2Manager] ✅ setVerificationBehavior ejecutado - state local actualizado');
  }, []);

  // 🤖 [IA] - v1.2.49: handleDeliverySectionComplete memoizado con useCallback
  // RAZÓN CRÍTICA: Sin useCallback, función se recrea en cada render
  // Esto causa que useEffect en Phase2DeliverySection (línea 97) se dispare infinitamente
  // porque onSectionComplete cambia de referencia constantemente
  // useCallback con [] garantiza referencia estable - useEffect se dispara solo cuando allStepsCompleted cambia
  const handleDeliverySectionComplete = useCallback(() => {
    console.log('[Phase2Manager] 📦 onSectionComplete called - marking deliveryCompleted = true');
    setDeliveryCompleted(true);
  }, []); // ← Dependencias vacías: función NUNCA cambia referencia

  const handleVerificationStepComplete = (stepKey: string) => {
    setVerificationProgress(prev => ({
      ...prev,
      [stepKey]: true
    }));

    // Check if all verification steps are complete
    const allVerificationComplete = deliveryCalculation.verificationSteps.every(
      step => verificationProgress[step.key] || step.key === stepKey
    );

    if (allVerificationComplete) {
      setVerificationCompleted(true);
    }
  };

  // 🤖 [IA] - v1.2.24: Función para deshacer pasos de verificación
  const handleVerificationStepUncomplete = (stepKey: string) => {
    setVerificationProgress(prev => ({
      ...prev,
      [stepKey]: false
    }));
  };

  // 🤖 [IA] - v1.3.6f: BUG FIX CRÍTICO #3 (1/3) - Memoización handleVerificationSectionComplete
  // Root cause: Función sin useCallback se recrea cada render → prop onSectionComplete cambia referencia
  // Problema: Phase2VerificationSection re-renderiza → useEffect línea 232 se re-dispara (onSectionComplete en deps)
  // → onVerificationBehaviorCollected ejecuta → setVerificationBehavior → Phase2Manager re-renderiza → LOOP (3,357 errores)
  // Patrón idéntico: handleDeliverySectionComplete línea 177 usa useCallback por misma razón
  const handleVerificationSectionComplete = useCallback(() => {
    setVerificationCompleted(true);
  }, []); // ← Dependencias vacías: referencia NUNCA cambia

  // Skip phase 2 entirely if no amount to deliver
  useEffect(() => {
    if (deliveryCalculation.amountToDeliver <= 0) {
      onPhase2Complete();
    }
  }, [deliveryCalculation.amountToDeliver, onPhase2Complete]);

  if (deliveryCalculation.amountToDeliver <= 0) {
    return null;
  }

  return (
    <>
      {/* 🤖 [IA] - v1.2.30: Estructura simplificada sin contenedores redundantes */}
      <div className="cash-counter-container space-y-fluid-md max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl">
        {/* Header integrado con sistema de diseño coherente */}
        <div className="cash-counter-header">
          <div className="cash-counter-title">
            <DollarSign className="cash-counter-icon evening-gradient" />
            <h2>Fase 2: División de Efectivo</h2>
          </div>
        </div>

        {/* Área de contenido con sistema coherente */}
        <div className="cash-counter-content">
          {/* Section Content */}
          <AnimatePresence mode="wait">
            {currentSection === 'delivery' && (
              <motion.div
                key="delivery"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Phase2DeliverySection
                  deliveryCalculation={deliveryCalculation}
                  onStepComplete={handleDeliveryStepComplete}
                  onStepUncomplete={handleDeliveryStepUncomplete}
                  onSectionComplete={handleDeliverySectionComplete} // 🤖 [IA] - v1.2.47: RESTAURADO - crítico para transición
                  onStepLiveUpdate={handleDeliveryLiveUpdate}
                  completedSteps={deliveryProgress}
                  onCancel={() => setShowExitConfirmation(true)}
                />
              </motion.div>
            )}

            {currentSection === 'verification' && (
              <motion.div
                key="verification"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <Phase2VerificationSection
                  deliveryCalculation={deliveryCalculation}
                  onStepComplete={handleVerificationStepComplete}
                  onStepUncomplete={handleVerificationStepUncomplete}
                  onSectionComplete={handleVerificationSectionComplete}
                  // 🤖 [IA] - v1.3.6: MÓDULO 2 - Pasar callback para recolectar VerificationBehavior
                  onVerificationBehaviorCollected={handleVerificationBehaviorCollected}
                  completedSteps={verificationProgress}
                  onCancel={() => setShowExitConfirmation(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🤖 [IA] - v1.2.44: Botón manual eliminado - transición automática implementada en Phase2DeliverySection */}
          {/* La transición de delivery → verification ocurre automáticamente tras completar separación (línea 91-97 Phase2DeliverySection) */}
        </div>
      </div>

      <AbortCorteModal
        open={showExitConfirmation}
        onOpenChange={setShowExitConfirmation}
        title="¿Cancelar corte actual?"
        description="Si continúas, el corte se marcará como ABORTADO y deberás iniciar uno nuevo."
        warningText="Debes registrar el motivo de la cancelación."
        confirmText="Confirmar cancelación"
        cancelText="Continuar aquí"
        onConfirm={handleAbortFromPhase2}
        onCancel={() => setShowExitConfirmation(false)}
      />

      {/* 🤖 [IA] - v1.2.30: Modal de instrucciones con Glass Morphism v1.2.23 - FASE 1 Doctrina Canónica */}
      <Dialog
        open={showInstructionsModal}
        onOpenChange={(open) => {
          if (!open) {
            return;
          }

          setShowInstructionsModal(open);
        }}
      >
      {/* 🤖 [IA] - v1.2.41AC: Corregido wizard-dialog-shell → glass-morphism-panel para coherencia transparencias */}
      <DialogContent className="glass-morphism-panel wizard-dialog-content modal-size-standard max-h-[clamp(85vh,90vh,90vh)] overflow-y-auto overflow-x-hidden p-0 [&>button]:hidden">
        {/* 🤖 [IA] - v1.2.41Z: DialogTitle/Description solo para accesibilidad */}
        <DialogTitle className="sr-only">
          Preparar Dinero a Entregar
        </DialogTitle>
        <DialogDescription className="sr-only">
          Complete el proceso de preparación de dinero para entregar
        </DialogDescription>

        <div className="p-fluid-lg space-y-fluid-lg">
          {/* 🤖 [IA] - v1.2.41Z: Header migrado a patrón canónico - icono Package + título + subtítulo + botón X */}
          <div className="flex items-center justify-between mb-fluid-md">
            <div className="flex items-center gap-fluid-md">
              <Package
                className="flex-shrink-0 w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)]"
                style={{ color: '#0a84ff' }}
                aria-label="Icono de preparación de entrega"
              />
              <div className="flex flex-col">
                <h2 className="font-bold text-[clamp(1.25rem,5vw,1.5rem)] text-[#e1e8ed] leading-tight">
                  Preparar Dinero a Entregar
                </h2>
                <p className="modal-subtitle mt-[clamp(0.125rem,0.5vw,0.25rem)]">
                  Preparación de entrega de efectivo
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleInstructionsCancelRequest}
              className="rounded-full modal-close-button"
              aria-label="Cerrar modal"
            >
              <X className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" />
            </Button>
          </div>

          {/* Contenido principal envuelto en card compartida */}
          <WizardGlassCard className="space-y-fluid-lg">
            {/* Checklist de preparación */}
            <div className="flex flex-col gap-fluid-lg">
            {/* 🤖 [IA] - v1.2.41AD: DOCTRINA D.5 COMPLIANCE - Mapeo dinámico desde phase2PreparationInstructions.ts */}
            <div className="flex flex-col gap-[clamp(0.75rem,3vw,1rem)]">
              {phase2PreparationInstructions.map((instruction) => {
                const itemKey = instruction.id as keyof typeof checkedItems;
                const InstructionIcon = ICON_MAP[instruction.icon] ?? FileText;
                return (
                  <InstructionRule
                    key={instruction.id}
                    rule={{
                      id: instruction.id,
                      title: instruction.title,
                      subtitle: instruction.description,
                      Icon: InstructionIcon,
                      colors: {
                        border: checkedItems[itemKey] ? 'border-green-400' : 'border-blue-400',
                        text: checkedItems[itemKey] ? 'text-green-400' : 'text-blue-400'
                      }
                    }}
                    state={{
                      isChecked: checkedItems[itemKey],
                      isBeingReviewed: false,
                      isEnabled: enabledItems[itemKey],
                      isHidden: !enabledItems[itemKey]
                    }}
                    isCurrent={enabledItems[itemKey] && !checkedItems[itemKey]}
                    onAcknowledge={() => handleCheckChange(itemKey)}
                  />
                );
              })}
            </div>
            </div>
          </WizardGlassCard>

          {/* 🤖 [IA] - v1.2.41AA: Footer con único botón centrado (X button maneja cierre) */}
          <div className="flex items-center justify-center mt-fluid-2xl pt-fluid-xl border-t border-slate-600">
            <ConstructiveActionButton
              onClick={() => setShowInstructionsModal(false)}
              disabled={!allItemsChecked}
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </ConstructiveActionButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <AbortCorteModal
      open={showInstructionsCancelConfirmation}
      onOpenChange={setShowInstructionsCancelConfirmation}
      title="¿Cancelar proceso de preparación?"
      description="Si continúas, se abortará el corte en progreso y deberás iniciar uno nuevo."
      warningText="Debes indicar el motivo de cancelación del proceso."
      confirmText="Confirmar cancelación"
      cancelText="Continuar aquí"
      onConfirm={handleAbortFromPhase2}
      onCancel={() => setShowInstructionsCancelConfirmation(false)}
    />
    </>
  );
}
