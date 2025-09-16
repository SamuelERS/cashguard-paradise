// 🤖 [IA] - v1.1.14 - Simplificación de tabs y eliminación de redundancias en Fase 2
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Package, ScrollText, Grid3x3, AlertCircle, DollarSign } from 'lucide-react';
// 🤖 [IA] - v1.2.10: Agregado AlertDialog para confirmación de salida
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// 🤖 [IA] - v1.2.19: Importado ConfirmationModal estandarizado para modal de confirmación
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// 🤖 [IA] - v1.3.0: Reemplazado botones nativos con componentes Button para estandarización
import { Button } from "@/components/ui/button";
// 🤖 [IA] - v1.2.19: Agregado PrimaryActionButton para botón principal "Todo listo, continuar"
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
// 🤖 [IA] - v1.2.19: Agregados botones de acción para modal de confirmación ROJO/VERDE
import { DestructiveActionButton } from "@/components/ui/destructive-action-button";
import { ConstructiveActionButton } from "@/components/ui/constructive-action-button";
// 🤖 [IA] - v2.0.0: Agregado NeutralActionButton para botón "Volver al inicio"
import { NeutralActionButton } from "@/components/ui/neutral-action-button";
// 🤖 [IA] - v1.3.0: Importado CSS modular para botones de Phase2
import "@/styles/features/phase2-buttons.css";
// 🤖 [IA] - v1.2.30: Importado CSS modular para modal de Phase2
import "@/styles/features/phase2-modal.css";
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
            <DollarSign className="cash-counter-icon" />
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

    {/* 🤖 [IA] - v1.2.30: Modal de instrucciones con Glass Morphism v1.2.23 */}
    <AlertDialog open={showInstructionsModal} onOpenChange={setShowInstructionsModal}>
      <AlertDialogContent className="glass-modal-instructions">
        <AlertDialogHeader className="glass-modal-header">
          <AlertDialogTitle className="glass-modal-title" id="instructions-title">
            <AlertCircle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" aria-hidden="true" />
            💵 Preparar Dinero a Entregar
          </AlertDialogTitle>
        </AlertDialogHeader>

        <div className="glass-modal-content">
          {/* Mensaje principal destacado */}
          <div className="glass-modal-alert">
            <p className="glass-modal-alert-title">
              ⚠️ IMPORTANTE
            </p>
            <p className="glass-modal-alert-text">
              El sistema dirá cuántas monedas y billetes tomar para entregar, solo debes colocar lo que diga en la bolsa.
            </p>
          </div>

          {/* Checklist de preparación */}
          <div className="glass-modal-checklist">
            <p className="glass-modal-checklist-intro">
              Antes de continuar, confirme lo siguiente:
            </p>

            {/* 🤖 [IA] - v1.2.30: Mensaje de activación secuencial usando clases CSS */}
            <div className={`checklist-status-indicator ${enabledItems.bolsa ? 'ready' : ''}`}>
              <p className={`checklist-status-text ${enabledItems.bolsa ? 'ready' : ''}`}>
                {!enabledItems.bolsa ? '⏱️ Preparando checklist...' : '📋 Verifiquen estemos Listos'}
              </p>
            </div>

            <div className="glass-modal-checklist-items" role="group" aria-labelledby="instructions-title">
              {/* Item 1: Bolsa */}
              <label
                className={`checklist-item ${enabledItems.bolsa ? 'enabled' : 'disabled'} ${checkedItems.bolsa ? 'checked' : ''}`}
              >
                <Checkbox
                  checked={checkedItems.bolsa}
                  onCheckedChange={() => enabledItems.bolsa && handleCheckChange('bolsa')}
                  disabled={!enabledItems.bolsa}
                  aria-label="Tengo la bolsa lista para entregar"
                  style={{
                    borderColor: checkedItems.bolsa ? '#00ba7c' : 'rgba(255, 255, 255, 0.3)',
                    cursor: enabledItems.bolsa ? 'pointer' : 'not-allowed'
                  }}
                />
                <Package className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" style={{ color: '#0a84ff' }} />
                <span className="checklist-item-text">
                  Tengo la bolsa lista para entregar
                  {!enabledItems.bolsa && (
                    <span className="checklist-loader">
                      <div className="checklist-loader-spinner" />
                      activando...
                    </span>
                  )}
                </span>
              </label>

              {/* Item 2: Tirro */}
              <label
                className={`checklist-item ${enabledItems.tirro ? 'enabled' : 'disabled'} ${checkedItems.tirro ? 'checked' : ''}`}
              >
                <Checkbox
                  checked={checkedItems.tirro}
                  onCheckedChange={() => enabledItems.tirro && handleCheckChange('tirro')}
                  disabled={!enabledItems.tirro}
                  aria-label="Tengo cinta y plumon para rotular"
                  style={{
                    borderColor: checkedItems.tirro ? '#00ba7c' : 'rgba(255, 255, 255, 0.3)',
                    cursor: enabledItems.tirro ? 'pointer' : 'not-allowed'
                  }}
                />
                <ScrollText className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" style={{ color: '#0a84ff' }} />
                <span className="checklist-item-text">
                  Tengo cinta y plumon para rotular
                  {!enabledItems.tirro && (
                    <span className={checkedItems.bolsa ? "checklist-loader" : "checklist-item-hint"}>
                      {checkedItems.bolsa && <div className="checklist-loader-spinner" />}
                      {checkedItems.bolsa ? 'activando...' : '(marque el anterior)'}
                    </span>
                  )}
                </span>
              </label>

              {/* Item 3: Espacio */}
              <label
                className={`checklist-item ${enabledItems.espacio ? 'enabled' : 'disabled'} ${checkedItems.espacio ? 'checked' : ''}`}
              >
                <Checkbox
                  checked={checkedItems.espacio}
                  onCheckedChange={() => enabledItems.espacio && handleCheckChange('espacio')}
                  disabled={!enabledItems.espacio}
                  aria-label="Tomare cantidad que sistema diga"
                  style={{
                    borderColor: checkedItems.espacio ? '#00ba7c' : 'rgba(255, 255, 255, 0.3)',
                    cursor: enabledItems.espacio ? 'pointer' : 'not-allowed'
                  }}
                />
                <Grid3x3 className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" style={{ color: '#0a84ff' }} />
                <span className="checklist-item-text">
                  Tomare cantidad que sistema diga
                  {!enabledItems.espacio && (
                    <span className={checkedItems.tirro ? "checklist-loader" : "checklist-item-hint"}>
                      {checkedItems.tirro && <div className="checklist-loader-spinner" />}
                      {checkedItems.tirro ? 'activando...' : '(marque el anterior)'}
                    </span>
                  )}
                </span>
              </label>

              {/* Item 4: Entendido */}
              <label
                className={`checklist-item ${enabledItems.entendido ? 'enabled' : 'disabled'} ${checkedItems.entendido ? 'checked' : ''}`}
              >
                <Checkbox
                  checked={checkedItems.entendido}
                  onCheckedChange={() => enabledItems.entendido && handleCheckChange('entendido')}
                  disabled={!enabledItems.entendido}
                  aria-label="Estamos listos para continuar"
                  style={{
                    borderColor: checkedItems.entendido ? '#00ba7c' : 'rgba(255, 255, 255, 0.3)',
                    cursor: enabledItems.entendido ? 'pointer' : 'not-allowed'
                  }}
                />
                <AlertCircle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" style={{ color: '#0a84ff' }} />
                <span className="checklist-item-text">
                  Estamos listos para continuar
                  {!enabledItems.entendido && (
                    <span className={checkedItems.espacio ? "checklist-loader" : "checklist-item-hint"}>
                      {checkedItems.espacio && <div className="checklist-loader-spinner" />}
                      {checkedItems.espacio ? 'activando...' : '(marque el anterior)'}
                    </span>
                  )}
                </span>
              </label>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="glass-modal-footer">
          <AlertDialogAction asChild>
            <PrimaryActionButton 
              onClick={() => setShowInstructionsModal(false)} 
              disabled={!allItemsChecked}
              className="btn-phase2-instruction"
            >
              {allItemsChecked ? '✓ Continuar' : '☑️ Marque todos los ítems para continuar'}
            </PrimaryActionButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}