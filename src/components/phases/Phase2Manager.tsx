// 🤖 [IA] - v1.1.14 - Simplificación de tabs y eliminación de redundancias en Fase 2
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Package, ScrollText, Grid3x3, AlertCircle, DollarSign } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox'; // 🤖 [IA] - v1.2.10: Checkbox para checklist

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
            <div className="flex items-center gap-2 justify-center">
              <Button
                variant="phase2-tab"
                data-active={currentSection === 'delivery' ? "true" : "false"}
                data-state="delivery"
                data-completed={deliveryCompleted ? "true" : "false"}
                onClick={() => currentSection !== 'delivery' && !verificationCompleted && setCurrentSection('delivery')}
                aria-pressed={currentSection === 'delivery'}
                aria-label="Sección de entrega"
                >
                  {deliveryCompleted && (
                    <span>✓</span>
                  )}
                  Entrega
                </Button>
                <Button
                  variant="phase2-tab"
                  data-active={currentSection === 'verification' ? "true" : "false"}
                  data-state="verification"
                  data-completed={verificationCompleted ? "true" : "false"}
                  data-disabled={!deliveryCompleted ? "true" : "false"}
                  onClick={() => deliveryCompleted && currentSection !== 'verification' && setCurrentSection('verification')}
                  disabled={!deliveryCompleted}
                  aria-pressed={currentSection === 'verification'}
                  aria-label="Sección de verificación"
                >
                  {verificationCompleted && (
                    <span>✓</span>
                  )}
                  Verificar
                </Button>
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
              El sistema dirá cuántas monedas y billetes tomar para entregar, solo debes colocar lo que diga en la bolsa.
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

            {/* 🤖 [IA] - FASE 2: AnimatePresence para Progressive Revelation canónica */}
            <AnimatePresence mode="wait">
              <motion.div
                className="space-y-fluid-lg"
                role="group"
                role="group"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Item 1: Bolsa - FASE 2: Motion component con animación canónica */}
                <motion.label
                  className={`checklist-item ${enabledItems.bolsa ? 'enabled' : 'disabled'} ${checkedItems.bolsa ? 'checked' : ''}`}
                  initial={{ opacity: 0.5, filter: 'blur(8px)', scale: 0.95 }}
                  animate={{
                    opacity: enabledItems.bolsa ? 1 : 0.5,
                    filter: enabledItems.bolsa ? 'blur(0px)' : 'blur(8px)',
                    scale: enabledItems.bolsa ? 1 : 0.95
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.23, 1, 0.32, 1],
                    delay: 0
                  }}
                  whileHover={enabledItems.bolsa ? { scale: 1.02 } : {}}
                  whileTap={enabledItems.bolsa ? { scale: 0.98 } : {}}
                >
                <Checkbox
                  checked={checkedItems.bolsa}
                  onCheckedChange={() => enabledItems.bolsa && handleCheckChange('bolsa')}
                  disabled={!enabledItems.bolsa}
                  aria-label="Tengo la bolsa lista para entregar"
                  className={`transition-colors duration-200 ${checkedItems.bolsa ? 'border-green-400 data-[state=checked]:bg-green-400' : ''}`}
                />
                <Package className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] text-blue-400" />
                <span className="checklist-item-text">
                  Tengo la bolsa lista para entregar
                  {!enabledItems.bolsa && (
                    <span className="checklist-loader">
                      <div className="checklist-loader-spinner" />
                      activando...
                    </span>
                  )}
                </span>
                </motion.label>

                {/* Item 2: Tirro - FASE 2: Motion component con staggered delay */}
                <motion.label
                  className={`checklist-item ${enabledItems.tirro ? 'enabled' : 'disabled'} ${checkedItems.tirro ? 'checked' : ''}`}
                  initial={{ opacity: 0.5, filter: 'blur(8px)', scale: 0.95 }}
                  animate={{
                    opacity: enabledItems.tirro ? 1 : 0.5,
                    filter: enabledItems.tirro ? 'blur(0px)' : 'blur(8px)',
                    scale: enabledItems.tirro ? 1 : 0.95
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.23, 1, 0.32, 1],
                    delay: 0.1
                  }}
                  whileHover={enabledItems.tirro ? { scale: 1.02 } : {}}
                  whileTap={enabledItems.tirro ? { scale: 0.98 } : {}}
                >
                <Checkbox
                  checked={checkedItems.tirro}
                  onCheckedChange={() => enabledItems.tirro && handleCheckChange('tirro')}
                  disabled={!enabledItems.tirro}
                  aria-label="Tengo cinta y plumon para rotular"
                  className={`transition-colors duration-200 ${checkedItems.tirro ? 'border-green-400 data-[state=checked]:bg-green-400' : ''}`}
                />
                <ScrollText className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] text-blue-400" />
                <span className="checklist-item-text">
                  Tengo cinta y plumon para rotular
                  {!enabledItems.tirro && (
                    <span className={checkedItems.bolsa ? "checklist-loader" : "checklist-item-hint"}>
                      {checkedItems.bolsa && <div className="checklist-loader-spinner" />}
                      {checkedItems.bolsa ? 'activando...' : '(marque el anterior)'}
                    </span>
                  )}
                </span>
                </motion.label>

                {/* Item 3: Espacio - FASE 2: Motion component con staggered delay */}
                <motion.label
                  className={`checklist-item ${enabledItems.espacio ? 'enabled' : 'disabled'} ${checkedItems.espacio ? 'checked' : ''}`}
                  initial={{ opacity: 0.5, filter: 'blur(8px)', scale: 0.95 }}
                  animate={{
                    opacity: enabledItems.espacio ? 1 : 0.5,
                    filter: enabledItems.espacio ? 'blur(0px)' : 'blur(8px)',
                    scale: enabledItems.espacio ? 1 : 0.95
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.23, 1, 0.32, 1],
                    delay: 0.2
                  }}
                  whileHover={enabledItems.espacio ? { scale: 1.02 } : {}}
                  whileTap={enabledItems.espacio ? { scale: 0.98 } : {}}
                >
                <Checkbox
                  checked={checkedItems.espacio}
                  onCheckedChange={() => enabledItems.espacio && handleCheckChange('espacio')}
                  disabled={!enabledItems.espacio}
                  aria-label="Tomare cantidad que sistema diga"
                  className={`transition-colors duration-200 ${checkedItems.espacio ? 'border-green-400 data-[state=checked]:bg-green-400' : ''}`}
                />
                <Grid3x3 className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] text-blue-400" />
                <span className="checklist-item-text">
                  Tomare cantidad que sistema diga
                  {!enabledItems.espacio && (
                    <span className={checkedItems.tirro ? "checklist-loader" : "checklist-item-hint"}>
                      {checkedItems.tirro && <div className="checklist-loader-spinner" />}
                      {checkedItems.tirro ? 'activando...' : '(marque el anterior)'}
                    </span>
                  )}
                </span>
                </motion.label>

                {/* Item 4: Entendido - FASE 2: Motion component con staggered delay final */}
                <motion.label
                  className={`checklist-item ${enabledItems.entendido ? 'enabled' : 'disabled'} ${checkedItems.entendido ? 'checked' : ''}`}
                  initial={{ opacity: 0.5, filter: 'blur(8px)', scale: 0.95 }}
                  animate={{
                    opacity: enabledItems.entendido ? 1 : 0.5,
                    filter: enabledItems.entendido ? 'blur(0px)' : 'blur(8px)',
                    scale: enabledItems.entendido ? 1 : 0.95
                  }}
                  transition={{
                    duration: 0.6,
                    ease: [0.23, 1, 0.32, 1],
                    delay: 0.3
                  }}
                  whileHover={enabledItems.entendido ? { scale: 1.02 } : {}}
                  whileTap={enabledItems.entendido ? { scale: 0.98 } : {}}
                >
                <Checkbox
                  checked={checkedItems.entendido}
                  onCheckedChange={() => enabledItems.entendido && handleCheckChange('entendido')}
                  disabled={!enabledItems.entendido}
                  aria-label="Estamos listos para continuar"
                  className={`transition-colors duration-200 ${checkedItems.entendido ? 'border-green-400 data-[state=checked]:bg-green-400' : ''}`}
                />
                <AlertCircle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] text-blue-400" />
                <span className="checklist-item-text">
                  Estamos listos para continuar
                  {!enabledItems.entendido && (
                    <span className={checkedItems.espacio ? "checklist-loader" : "checklist-item-hint"}>
                      {checkedItems.espacio && <div className="checklist-loader-spinner" />}
                      {checkedItems.espacio ? 'activando...' : '(marque el anterior)'}
                    </span>
                  )}
                </span>
                </motion.label>
              </motion.div>
            </AnimatePresence>
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