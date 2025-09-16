// 🤖 [IA] - v1.2.24: ARMONIZACIÓN COMPLETA - Migración a DeliveryFieldView para consistency con Phase 1
// Reemplaza implementación text-only por componente visual rico con imágenes
// 🤖 [IA] - v1.2.11 - Sistema anti-fraude: indicadores visuales sin montos
// 🤖 [IA] - v1.2.5 - Mejoras de visibilidad y espaciado en Android
// 🤖 [IA] - v1.1.14 - Reorganización de flujo vertical y eliminación de redundancias
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { DeliveryFieldView } from '@/components/cash-counting/DeliveryFieldView';
import { GuidedProgressIndicator } from '@/components/ui/GuidedProgressIndicator';
import { DeliveryCalculation } from '@/types/phases';
import { formatCurrency } from '@/utils/calculations';
import { useTimingConfig } from '@/hooks/useTimingConfig'; // 🤖 [IA] - Hook de timing unificado v1.0.22

interface Phase2DeliverySectionProps {
  deliveryCalculation: DeliveryCalculation;
  onStepComplete: (stepKey: string) => void;
  onSectionComplete: () => void;
  completedSteps: Record<string, boolean>;
  // 🤖 [IA] - v1.2.24: Navigation props to match Phase 1 pattern
  onCancel: () => void;
  onPrevious: () => void;
  canGoPrevious: boolean;
}

export function Phase2DeliverySection({
  deliveryCalculation,
  onStepComplete,
  onSectionComplete,
  completedSteps,
  onCancel,
  onPrevious,
  canGoPrevious
}: Phase2DeliverySectionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Usar timing unificado v1.0.22
  const { deliverySteps, amountToDeliver } = deliveryCalculation;
  const currentStep = deliverySteps[currentStepIndex];
  const allStepsCompleted = deliverySteps.every(step => completedSteps[step.key]);
  const totalSteps = deliverySteps.length;
  const completedCount = Object.keys(completedSteps).length;

  // Auto-advance to next incomplete step
  useEffect(() => {
    const nextIncompleteIndex = deliverySteps.findIndex(step => !completedSteps[step.key]);
    if (nextIncompleteIndex !== -1 && nextIncompleteIndex !== currentStepIndex) {
      setCurrentStepIndex(nextIncompleteIndex);
    }
  }, [completedSteps, deliverySteps, currentStepIndex]);

  // Complete section when all steps are done
  useEffect(() => {
    if (allStepsCompleted && deliverySteps.length > 0) {
      // 🤖 [IA] - Migrado a timing unificado para evitar race conditions v1.0.22
      const cleanup = createTimeoutWithCleanup(() => {
        onSectionComplete();
      }, 'transition', 'delivery_section_complete');
      return cleanup;
    }
  }, [allStepsCompleted, deliverySteps.length, onSectionComplete, createTimeoutWithCleanup]);

  const handleFieldConfirm = (value: string) => {
    if (!currentStep) return;

    const inputNum = parseInt(value) || 0;
    if (inputNum === currentStep.quantity) {
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
              currentFieldValue={0}
              targetQuantity={currentStep.quantity}
              currentFieldType={getCurrentFieldType()}
              isActive={true}
              isCompleted={false}
              onConfirm={handleFieldConfirm}
              onCancel={onCancel}
              onPrevious={onPrevious}
              canGoPrevious={canGoPrevious}
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
              Verificando entrega...
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}