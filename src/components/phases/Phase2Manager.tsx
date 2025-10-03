// 🤖 [IA] - v1.2.41AD: Doctrina D.5 Compliance - Migración a arquitectura basada en datos separada
// 🤖 [IA] - v1.2.50: Fix definitivo setTimeout nativo - eliminado createTimeoutWithCleanup de dependencies
// 🤖 [IA] - v1.2.49: Fix crítico referencia inestable - memoización handleDeliverySectionComplete
// 🤖 [IA] - v1.1.14 - Simplificación de tabs y eliminación de redundancias en Fase 2
// 🤖 [IA] - v1.2.41Z: Migración header modal a patrón canónico (icono + subtítulo + botón X)
// 🤖 [IA] - v1.2.41AA: Footer único botón + subtítulos 2 líneas + iconos semánticos
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Package, ScrollText, Grid3x3, AlertCircle, DollarSign, X, Pencil, Banknote, CheckCircle2 } from 'lucide-react';
import * as Icons from 'lucide-react'; // 🤖 [IA] - v1.2.41AD: Dynamic icon loading para Doctrina D.5
import { InstructionRule, type RuleState } from '@/components/wizards/InstructionRule';
import { phase2PreparationInstructions } from '@/data/instructions/phase2PreparationInstructions'; // 🤖 [IA] - v1.2.41AD: Configuración de datos separada
import { WizardGlassCard } from '@/components/wizards/WizardGlassCard';
// 🤖 [IA] - v1.2.10: Agregado modal controlado para confirmación de salida
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// 🤖 [IA] - v1.2.19: Importado ConfirmationModal estandarizado para modal de confirmación
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
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
import { formatCurrency } from '@/utils/calculations';
import { useTimingConfig } from '@/hooks/useTimingConfig'; // 🤖 [IA] - Hook de timing unificado v1.0.22
import { useChecklistFlow } from '@/hooks/useChecklistFlow'; // 🤖 [IA] - v1.2.26: Hook especializado para checklist

interface Phase2ManagerProps {
  deliveryCalculation: DeliveryCalculation;
  onPhase2Complete: () => void;
  onBack: () => void;
}

export function Phase2Manager({
  deliveryCalculation,
  onPhase2Complete,
  onBack
}: Phase2ManagerProps) {
  const [currentSection, setCurrentSection] = useState<'delivery' | 'verification'>('delivery');
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState<Record<string, boolean>>({});
  const [verificationProgress, setVerificationProgress] = useState<Record<string, boolean>>({});
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
  // 🤖 [IA] - v1.2.50: Reemplazado createTimeoutWithCleanup con setTimeout nativo (mismo fix)
  useEffect(() => {
    if (verificationCompleted) {
      const timeoutId = setTimeout(() => {
        onPhase2Complete();
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [verificationCompleted, onPhase2Complete]); // ← SIN createTimeoutWithCleanup

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

  // 🤖 [IA] - v1.2.24: Función para deshacer pasos de entrega
  const handleDeliveryStepUncomplete = (stepKey: string) => {
    setDeliveryProgress(prev => ({
      ...prev,
      [stepKey]: false
    }));
  };

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

  const handleVerificationSectionComplete = () => {
    setVerificationCompleted(true);
  };

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
                  completedSteps={deliveryProgress}
                  onCancel={() => setShowExitConfirmation(true)}
                  onPrevious={() => {}}
                  canGoPrevious={false}
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
                  completedSteps={verificationProgress}
                  onCancel={() => setShowExitConfirmation(true)}
                  onPrevious={() => {}}
                  canGoPrevious={false}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 🤖 [IA] - v1.2.44: Botón manual eliminado - transición automática implementada en Phase2DeliverySection */}
          {/* La transición de delivery → verification ocurre automáticamente tras completar separación (línea 91-97 Phase2DeliverySection) */}
        </div>
      </div>

      {/* 🤖 [IA] - v1.2.19: Modal de confirmación migrado a ConfirmationModal estandarizado */}
      <ConfirmationModal
        open={showExitConfirmation}
        onOpenChange={setShowExitConfirmation}
        title="¿Confirmar salida?"
        description="Se perderá todo el progreso del conteo actual."
        warningText="Esta acción no se puede deshacer."
        confirmText="Sí, volver al inicio"
        cancelText="Continuar aquí"
        onConfirm={onBack}
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
      <DialogContent className="glass-morphism-panel wizard-dialog-content max-h-[clamp(85vh,90vh,90vh)] overflow-y-auto overflow-x-hidden p-0 [&>button]:hidden">
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
                <p className="text-[clamp(0.625rem,2.5vw,0.75rem)] text-[#8899a6] mt-[clamp(0.125rem,0.5vw,0.25rem)]">
                  Preparación de entrega de efectivo
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleInstructionsCancelRequest}
              className="rounded-full"
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
                return (
                  <InstructionRule
                    key={instruction.id}
                    rule={{
                      id: instruction.id,
                      title: instruction.title,
                      subtitle: instruction.description,
                      Icon: Icons[instruction.icon as keyof typeof Icons] as React.ComponentType<React.SVGProps<SVGSVGElement>>,
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

    {/* 🤖 [IA] - Modal de confirmación para cancelar instrucciones */}
    <ConfirmationModal
      open={showInstructionsCancelConfirmation}
      onOpenChange={setShowInstructionsCancelConfirmation}
      title="¿Cancelar proceso de preparación?"
      description="Se perderá el progreso del checklist actual."
      warningText="Deberá reiniciar el proceso desde el principio."
      confirmText="Sí, cancelar"
      cancelText="Continuar aquí"
      onConfirm={() => {
        setShowInstructionsCancelConfirmation(false);
        setShowInstructionsModal(false);
        onBack();
      }}
      onCancel={() => setShowInstructionsCancelConfirmation(false)}
    />
    </>
  );
}
