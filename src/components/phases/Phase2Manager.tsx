// 🤖 [IA] - v1.1.14 - Simplificación de tabs y eliminación de redundancias en Fase 2
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Package, ScrollText, Grid3x3, AlertCircle, DollarSign } from 'lucide-react';
import { InstructionRule, type RuleState } from '@/components/wizards/InstructionRule';
// 🤖 [IA] - v1.2.10: Agregado AlertDialog para confirmación de salida
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  useEffect(() => {
    if (deliveryCompleted && currentSection === 'delivery') {
      // 🤖 [IA] - Migrado a timing unificado para evitar race conditions v1.0.22
      const cleanup = createTimeoutWithCleanup(() => {
        setCurrentSection('verification');
      }, 'transition', 'phase2_to_verification');
      return cleanup;
    }
  }, [deliveryCompleted, currentSection, createTimeoutWithCleanup]);

  // Complete phase 2 when verification is done
  useEffect(() => {
    if (verificationCompleted) {
      // 🤖 [IA] - Migrado a timing unificado para evitar race conditions v1.0.22
      const cleanup = createTimeoutWithCleanup(() => {
        onPhase2Complete();
      }, 'transition', 'phase2_complete');
      return cleanup;
    }
  }, [verificationCompleted, onPhase2Complete, createTimeoutWithCleanup]);

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

  const handleDeliverySectionComplete = () => {
    setDeliveryCompleted(true);
  };

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
          {/* Section Navigation - 🤖 [IA] - v1.2.30: Espaciado optimizado */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism-panel p-4"
          >
            {/* Botones de navegación */}
            <div className="flex items-center gap-3 justify-center">
              <div
                className="btn-phase2-tab"
                data-active={currentSection === 'delivery' ? "true" : "false"}
                data-state="delivery"
                data-completed={deliveryCompleted ? "true" : "false"}
                aria-label="Sección actual: Entrega"
                role="status"
              >
                {deliveryCompleted && (
                  <span>✓</span>
                )}
                Entrega
              </div>
              <div
                className="btn-phase2-tab"
                data-active={currentSection === 'verification' ? "true" : "false"}
                data-state="verification"
                data-completed={verificationCompleted ? "true" : "false"}
                aria-label="Sección actual: Verificar"
                role="status"
              >
                {verificationCompleted && (
                  <span>✓</span>
                )}
                Verificar
              </div>
            </div>
          </motion.div>

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
                  onSectionComplete={handleDeliverySectionComplete}
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

          {/* Manual section switch - only show when delivery is complete */}
          {deliveryCompleted && currentSection === 'delivery' && !verificationCompleted && (
            <div className="flex justify-center">
              <Button
                variant="phase2-verify"
                onClick={() => setCurrentSection('verification')}
                aria-label="Verificar efectivo y continuar"
                className="px-6"
              >
                <span>Verificar</span>
                <span className="hidden sm:inline ml-1">Efectivo</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
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
      <AlertDialog open={showInstructionsModal} onOpenChange={setShowInstructionsModal}>
      <AlertDialogContent className="glass-morphism-panel w-[clamp(90vw,95vw,95vw)] max-w-[clamp(300px,90vw,540px)] max-h-[clamp(85vh,90vh,90vh)] overflow-y-auto overflow-x-hidden p-0">
        <div className="p-fluid-lg space-y-fluid-lg">
          <AlertDialogHeader className="text-center space-y-fluid-md">
            <AlertDialogTitle className="text-primary mb-fluid-md text-[clamp(1.125rem,4.5vw,1.5rem)]">
              Preparar Dinero a Entregar
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Complete el proceso de preparación de dinero para entregar
            </AlertDialogDescription>
          </AlertDialogHeader>
          {/* Contenido principal envuelto en glass-morphism-panel como InitialWizardModal */}
          <div className="glass-morphism-panel space-y-fluid-lg">
            {/* Card IMPORTANTE */}
            <div className="glass-morphism-panel border border-orange-400/40 border-l-4 border-l-orange-400 text-center shadow-lg shadow-orange-400/10">
            <div className="flex items-center justify-center gap-fluid-md mb-fluid-md">
              <AlertCircle className="w-fluid-lg h-fluid-lg text-orange-400" />
              <h3 className="font-semibold text-orange-400 text-[clamp(0.875rem,3.5vw,1rem)]">IMPORTANTE</h3>
            </div>
            <p className="text-primary-foreground font-semibold text-[clamp(0.875rem,3.5vw,1rem)]">
              El sistema dirá cuántas MODEDAS y BILLETES tomar para la entrega.
            </p>
            </div>

            {/* Checklist de preparación */}
            <div className="flex flex-col gap-fluid-lg">
            <p className="text-muted-foreground text-[clamp(0.8rem,3.2vw,0.95rem)] text-center">
              Antes de continuar, confirme lo siguiente:
            </p>

            {/* 🤖 [IA] - v1.2.30: Mensaje de activación secuencial usando clases canónicas */}
            <div className="glass-morphism-panel text-center transition-all duration-300">
              <p className={`font-medium text-[clamp(0.8rem,3.2vw,0.95rem)] ${enabledItems.bolsa ? 'text-green-400' : 'text-blue-400'}`}>
                {!enabledItems.bolsa ? '⏱️ Preparando checklist...' : '📋 Verifiquen estemos Listos'}
              </p>
            </div>

            {/* 🤖 [IA] - v1.2.31: Progressive Revelation con InstructionRule canónico */}
            <div className="flex flex-col gap-[clamp(0.75rem,3vw,1rem)]">
              {/* Item 1: Bolsa */}
              <InstructionRule
                rule={{
                  id: 'bolsa',
                  title: 'Tengo la bolsa lista para la entrega',
                  subtitle: enabledItems.bolsa ? '' : '⏱️ Preparando...',
                  Icon: Package,
                  colors: {
                    border: checkedItems.bolsa ? 'border-green-400' : 'border-blue-400',
                    text: checkedItems.bolsa ? 'text-green-400' : 'text-blue-400'
                  }
                }}
                state={{
                  isChecked: checkedItems.bolsa,
                  isBeingReviewed: false,
                  isEnabled: enabledItems.bolsa,
                  isHidden: !enabledItems.bolsa
                }}
                isCurrent={enabledItems.bolsa && !checkedItems.bolsa}
                onAcknowledge={() => handleCheckChange('bolsa')}
              />

              {/* Item 2: Tirro */}
              <InstructionRule
                rule={{
                  id: 'tirro',
                  title: 'Tengo cinta y plumon para rotular',
                  subtitle: !enabledItems.tirro ? (checkedItems.bolsa ? '⏱️ Activando...' : '(marque el anterior)') : '',
                  Icon: ScrollText,
                  colors: {
                    border: checkedItems.tirro ? 'border-green-400' : 'border-blue-400',
                    text: checkedItems.tirro ? 'text-green-400' : 'text-blue-400'
                  }
                }}
                state={{
                  isChecked: checkedItems.tirro,
                  isBeingReviewed: false,
                  isEnabled: enabledItems.tirro,
                  isHidden: !checkedItems.bolsa
                }}
                isCurrent={enabledItems.tirro && !checkedItems.tirro}
                onAcknowledge={() => handleCheckChange('tirro')}
              />

              {/* Item 3: Espacio */}
              <InstructionRule
                rule={{
                  id: 'espacio',
                  title: 'Tomare cantidad que sistema diga',
                  subtitle: !enabledItems.espacio ? (checkedItems.tirro ? '⏱️ Activando...' : '(marque el anterior)') : '',
                  Icon: Grid3x3,
                  colors: {
                    border: checkedItems.espacio ? 'border-green-400' : 'border-blue-400',
                    text: checkedItems.espacio ? 'text-green-400' : 'text-blue-400'
                  }
                }}
                state={{
                  isChecked: checkedItems.espacio,
                  isBeingReviewed: false,
                  isEnabled: enabledItems.espacio,
                  isHidden: !checkedItems.tirro
                }}
                isCurrent={enabledItems.espacio && !checkedItems.espacio}
                onAcknowledge={() => handleCheckChange('espacio')}
              />

              {/* Item 4: Entendido */}
              <InstructionRule
                rule={{
                  id: 'entendido',
                  title: 'Estamos listos para continuar',
                  subtitle: !enabledItems.entendido ? (checkedItems.espacio ? '⏱️ Activando...' : '(marque el anterior)') : '',
                  Icon: AlertCircle,
                  colors: {
                    border: checkedItems.entendido ? 'border-green-400' : 'border-blue-400',
                    text: checkedItems.entendido ? 'text-green-400' : 'text-blue-400'
                  }
                }}
                state={{
                  isChecked: checkedItems.entendido,
                  isBeingReviewed: false,
                  isEnabled: enabledItems.entendido,
                  isHidden: !checkedItems.espacio
                }}
                isCurrent={enabledItems.entendido && !checkedItems.entendido}
                onAcknowledge={() => handleCheckChange('entendido')}
              />
            </div>
            </div>
          </div>

          {/* Footer - migrado a div normal como InitialWizardModal */}
          <div className="flex items-center justify-center mt-fluid-2xl pt-fluid-xl border-t border-slate-600 gap-fluid-lg">
            <DestructiveActionButton
              onClick={handleInstructionsCancelRequest}
            >
              Cancelar
            </DestructiveActionButton>
            <ConstructiveActionButton
              onClick={() => setShowInstructionsModal(false)}
              disabled={!allItemsChecked}
            >
              ✓ Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </ConstructiveActionButton>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>

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