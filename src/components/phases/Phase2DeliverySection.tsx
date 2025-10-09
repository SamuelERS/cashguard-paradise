// 🤖 [IA] - v1.2.49: Lógica navegación simplificada - handlePreviousStep/handleConfirmedPrevious/canGoPreviousInternal eliminados (innecesarios en fase de ejecución física)
// Previous: v1.2.48 - Fix timeout doble - eliminado delay innecesario para transición inmediata
// Previous: v1.2.24 - ARMONIZACIÓN COMPLETA - Migración a DeliveryFieldView para consistency con Phase 1
// 🤖 [IA] - v1.2.44: Mensaje transición automática mejorado para claridad UX
// 🤖 [IA] - v1.2.11 - Sistema anti-fraude: indicadores visuales sin montos
// 🤖 [IA] - v1.2.5 - Mejoras de visibilidad y espaciado en Android
// 🤖 [IA] - v1.1.14 - Reorganización de flujo vertical y eliminación de redundancias
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { DeliveryFieldView } from '@/components/cash-counting/DeliveryFieldView';
import { GuidedProgressIndicator } from '@/components/ui/GuidedProgressIndicator';
// 🤖 [IA] - v1.2.49: ConfirmationModal import removido (modal de retroceso eliminado)
import { DeliveryCalculation } from '@/types/phases';
import { formatCurrency } from '@/utils/calculations';

interface Phase2DeliverySectionProps {
  deliveryCalculation: DeliveryCalculation;
  onStepComplete: (stepKey: string) => void;
  onStepUncomplete?: (stepKey: string) => void; // 🤖 [IA] - v1.2.24: Para deshacer pasos al retroceder
  onSectionComplete: () => void;
  completedSteps: Record<string, boolean>;
  // 🤖 [IA] - v1.2.49: onPrevious y canGoPrevious eliminados (innecesarios en fase de ejecución física)
  onCancel: () => void;
}

export function Phase2DeliverySection({
  deliveryCalculation,
  onStepComplete,
  onStepUncomplete,
  onSectionComplete,
  completedSteps,
  onCancel
}: Phase2DeliverySectionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // 🤖 [IA] - v1.2.49: showBackConfirmation state removido (modal de retroceso eliminado)
  const [stepValues, setStepValues] = useState<Record<string, number>>({}); // 🤖 [IA] - v1.2.24: Track valores ingresados

  const { deliverySteps, amountToDeliver } = deliveryCalculation;
  const currentStep = deliverySteps[currentStepIndex];
  const allStepsCompleted = deliverySteps.every(step => completedSteps[step.key]);
  const totalSteps = deliverySteps.length;
  const completedCount = Object.keys(completedSteps).length;

  // 🤖 [IA] - v1.2.49: handlePreviousStep, handleConfirmedPrevious y canGoPreviousInternal eliminados
  // Razón: Botón Anterior innecesario en fase de ejecución física (acción irreversible)

  // Auto-advance to next incomplete step
  useEffect(() => {
    const nextIncompleteIndex = deliverySteps.findIndex(step => !completedSteps[step.key]);
    if (nextIncompleteIndex !== -1 && nextIncompleteIndex !== currentStepIndex) {
      setCurrentStepIndex(nextIncompleteIndex);
    }
  }, [completedSteps, deliverySteps, currentStepIndex]);

  // Complete section when all steps are done
  // 🤖 [IA] - v1.2.48: Timeout eliminado - llamada inmediata para evitar doble delay (2s → 1s)
  // Razón: Phase2Manager ya tiene timeout de 1000ms para transición visual suave
  // Esperar 1000ms aquí + 1000ms allá = 2s total (antipatrón UX)
  useEffect(() => {
    if (allStepsCompleted && deliverySteps.length > 0) {
      onSectionComplete(); // ← Inmediato, sin timeout innecesario
    }
  }, [allStepsCompleted, deliverySteps.length, onSectionComplete]);

  const handleFieldConfirm = (value: string) => {
    if (!currentStep) return;

    const inputNum = parseInt(value) || 0;
    if (inputNum === currentStep.quantity) {
      // 🤖 [IA] - v1.2.24: Guardar el valor ingresado antes de completar
      setStepValues(prev => ({
        ...prev,
        [currentStep.key]: inputNum
      }));

      onStepComplete(currentStep.key);

      // 🤖 [IA] - v1.2.11: Feedback táctil al confirmar
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }

      // Find next incomplete step
      const nextIncompleteIndex = deliverySteps.findIndex((step, index) =>
        index > currentStepIndex && !completedSteps[step.key]
      );

      if (nextIncompleteIndex !== -1) {
        setCurrentStepIndex(nextIncompleteIndex);
      }
    }
  };

  // Get denomination type for current step
  const getCurrentFieldType = (): 'coin' | 'bill' => {
    if (!currentStep) return 'coin';
    const coinTypes = ['penny', 'nickel', 'dime', 'quarter', 'dollarCoin'];
    return coinTypes.includes(currentStep.key) ? 'coin' : 'bill';
  };

  if (deliverySteps.length === 0) {
    return (
      <div className="glass-panel-success text-center p-8">
        <Check className="w-12 h-12 mx-auto mb-4 text-success" />
        <h3 className="text-xl font-bold mb-2 text-success">
          Sin entrega necesaria
        </h3>
        <p className="text-muted-foreground">
          El total es ≤ $50
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-fluid-md lg:max-w-3xl lg:mx-auto"
    >
      {/* Progress indicator - Separated container for visual hierarchy */}
      <div>
        <GuidedProgressIndicator
          currentStep={completedCount + 1}
          totalSteps={totalSteps}
          currentFieldLabel={currentStep?.label || ''}
          instructionText={allStepsCompleted
            ? '✅ Todas las denominaciones separadas para gerencia'
            : `🏢 Separando ${currentStep?.label || ''} para gerencia`
          }
          isCompleted={allStepsCompleted}
          isMorningCount={false}
          phaseTitle="ENTREGA A GERENCIA"
          completedText="Entrega completada"
        />
      </div>

      {/* Current Step - Separated container for visual hierarchy */}
      <div>
        <AnimatePresence mode="wait">
          {currentStep && !completedSteps[currentStep.key] && (
            <DeliveryFieldView
              key={currentStep.key}
              currentFieldName={currentStep.key}
              currentFieldLabel={currentStep.label}
              currentFieldValue={stepValues[currentStep.key] || 0}  // 🤖 [IA] - v1.2.24: Usar valor guardado si existe
              targetQuantity={currentStep.quantity}
              currentFieldType={getCurrentFieldType()}
              isActive={true}
              isCompleted={false}
              onConfirm={handleFieldConfirm}
              onCancel={onCancel}
              // 🤖 [IA] - v1.2.49: onPrevious y canGoPrevious removidos (props eliminadas)
            />
          )}
        </AnimatePresence>
      </div>

      {/* Section Complete - Separated container */}
      {allStepsCompleted && (
        <div>
          <div className="glass-panel-success text-center p-8">
            <Check className="w-12 h-12 mx-auto mb-4 text-success" />
            <h3 className="text-xl font-bold mb-2 text-success">
              🏢 Separación Completa
            </h3>
            <p className="text-muted-foreground mb-2">
              Total separado: {formatCurrency(amountToDeliver)}
            </p>
            <p className="text-sm font-medium text-primary">
              Procediendo a verificación automática...
            </p>
          </div>
        </div>
      )}

      {/* 🤖 [IA] - v1.2.49: ConfirmationModal eliminado (modal de retroceso innecesario en fase de ejecución física) */}
    </motion.div>
  );
}