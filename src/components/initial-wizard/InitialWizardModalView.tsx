// 🤖 [IA] - ORDEN #075: View orchestrator — presentación + routing entre 6 steps
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, X, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { NeutralActionButton } from '@/components/ui/neutral-action-button';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { useInitialWizardController } from '@/hooks/initial-wizard/useInitialWizardController';
import { Step1ProtocolRules } from './steps/Step1ProtocolRules';
import { Step2StoreSelection } from './steps/Step2StoreSelection';
import { Step3CashierSelection } from './steps/Step3CashierSelection';
import { Step4WitnessSelection } from './steps/Step4WitnessSelection';
import { Step5SicarInput } from './steps/Step5SicarInput';
import { Step6Expenses } from './steps/Step6Expenses';
import type { InitialWizardModalProps } from '@/types/initialWizard';

const InitialWizardModalView = (props: InitialWizardModalProps) => {
  const ctrl = useInitialWizardController(props);

  const navState = ctrl.getNavigationState(ctrl.isFlowCompleted());

  // ── Step routing ──
  const renderStepContent = () => {
    switch (ctrl.currentStep) {
      case 1:
        return (
          <Step1ProtocolRules
            wizardData={ctrl.wizardData}
            updateWizardData={ctrl.updateWizardData}
            rulesFlowState={ctrl.rulesFlowState}
            getRuleState={ctrl.getRuleState}
            canInteractWithRule={ctrl.canInteractWithRule}
            handleRuleAcknowledge={ctrl.handleRuleAcknowledge}
          />
        );
      case 2:
        return (
          <Step2StoreSelection
            wizardData={ctrl.wizardData}
            updateWizardData={ctrl.updateWizardData}
            availableStores={ctrl.availableStores}
          />
        );
      case 3:
        return (
          <Step3CashierSelection
            wizardData={ctrl.wizardData}
            updateWizardData={ctrl.updateWizardData}
            availableEmployees={ctrl.availableEmployees}
          />
        );
      case 4:
        return (
          <Step4WitnessSelection
            wizardData={ctrl.wizardData}
            updateWizardData={ctrl.updateWizardData}
            selectedCashier={ctrl.wizardData.selectedCashier}
            availableEmployees={ctrl.availableEmployees}
          />
        );
      case 5:
        return (
          <Step5SicarInput
            wizardData={ctrl.wizardData}
            updateWizardData={ctrl.updateWizardData}
            validateInput={ctrl.validateInput}
            getPattern={ctrl.getPattern}
            getInputMode={ctrl.getInputMode}
            handleNext={ctrl.handleNext}
            canGoNext={navState.canGoNext}
            currentStep={ctrl.currentStep}
            totalSteps={ctrl.totalSteps}
            availableStores={ctrl.availableStores}
            availableEmployees={ctrl.availableEmployees}
            // [IA] - CASO-SANN-R2: Props sesión activa para panel anti-fraude Step 5
            hasActiveSession={props.hasActiveSession}
            onResumeSession={props.onResumeSession}
            onAbortSession={props.onAbortSession}
          />
        );
      case 6:
        return (
          <Step6Expenses
            wizardData={ctrl.wizardData}
            updateWizardData={ctrl.updateWizardData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={props.isOpen} onOpenChange={(open) => {
      if (!open) {
        return;
      }
    }}>
      <DialogContent
        className="glass-morphism-panel wizard-dialog-content max-h-[clamp(85vh,90vh,90vh)] overflow-y-auto overflow-x-hidden p-0 [&>button]:hidden"
      >
        <DialogTitle className="sr-only">
          Corte Nocturno - Paso {ctrl.currentStep} de {ctrl.totalSteps}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Complete los pasos para configurar el corte de caja nocturno. Paso 1: Protocolo de Seguridad, Pasos 2-5: Información del corte.
        </DialogDescription>

        <div className="p-fluid-lg space-y-fluid-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-fluid-md">
            <div className="flex items-center gap-fluid-md">
              <Moon
                className="flex-shrink-0 w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)]"
                style={{ color: '#5e5ce6' }}
                aria-label="Icono de corte nocturno"
              />
              <div className="flex flex-col">
                <h2 className="font-bold text-[clamp(1.25rem,5vw,1.5rem)] text-[#e1e8ed] leading-tight">
                  Corte Nocturno
                </h2>
                <p className="text-[clamp(0.625rem,2.5vw,0.75rem)] text-[#8899a6] mt-[clamp(0.125rem,0.5vw,0.25rem)]">
                  Control de cierre diario
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={ctrl.handleCancelRequest}
              className="rounded-full"
              aria-label="Cerrar modal"
            >
              <X className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" />
            </Button>
          </div>

          {/* Step indicator */}
          <div className="mb-fluid-md">
            <span className="text-[clamp(0.75rem,3.5vw,0.875rem)] text-[#8899a6]">
              Paso {ctrl.currentStep} de {ctrl.totalSteps}
            </span>
          </div>

          {/* Step Content with transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={ctrl.currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Footer navigation */}
          <div className="flex items-center justify-center mt-fluid-2xl pt-fluid-xl border-t border-slate-600 gap-fluid-lg wizard-dialog-footer">
            <NeutralActionButton
              onClick={ctrl.handlePrevious}
              disabled={ctrl.currentStep === 1}
              data-testid="wizard-button-previous"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </NeutralActionButton>

            {ctrl.currentStep < ctrl.totalSteps && (
              <ConstructiveActionButton
                onClick={ctrl.handleNext}
                disabled={ctrl.currentStep === 1 ? !ctrl.isFlowCompleted() : !navState.canGoNext}
                data-testid="wizard-button-next"
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </ConstructiveActionButton>
            )}

            {ctrl.currentStep === ctrl.totalSteps && (
              <ConstructiveActionButton
                onClick={ctrl.handleComplete}
                disabled={!navState.isCompleted}
                data-testid="wizard-button-complete"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Finalizar
              </ConstructiveActionButton>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Back confirmation modal */}
      <ConfirmationModal
        open={ctrl.showBackConfirmation}
        onOpenChange={ctrl.setShowBackConfirmation}
        title="¿Retroceder al paso anterior?"
        description="Los datos ingresados se mantendrán."
        warningText="Retrocede si quieres corregir información."
        confirmText="Sí, retroceder"
        cancelText="Continuar aquí"
        onConfirm={() => {
          ctrl.goPrevious();
          ctrl.setShowBackConfirmation(false);
        }}
        onCancel={() => ctrl.setShowBackConfirmation(false)}
      />

      {/* Cancel confirmation modal */}
      <ConfirmationModal
        open={ctrl.showCancelConfirmation}
        onOpenChange={ctrl.setShowCancelConfirmation}
        title="Cancelar Configuración"
        description="Se perderá todo el progreso del protocolo de seguridad"
        warningText="Esta acción no se puede deshacer"
        confirmText="Sí, Cancelar"
        cancelText="Continuar"
        onConfirm={ctrl.handleConfirmedClose}
        onCancel={ctrl.handleCancelClose}
      />
    </Dialog>
  );
};

export default InitialWizardModalView;
