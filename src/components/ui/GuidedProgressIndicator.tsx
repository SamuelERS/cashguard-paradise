import { motion } from "framer-motion";
import { Check, ArrowRight, AlertTriangle } from "lucide-react";

interface GuidedProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  currentFieldLabel: string;
  instructionText: string;
  isCompleted: boolean;
}

export const GuidedProgressIndicator = ({
  currentStep,
  totalSteps,
  currentFieldLabel,
  instructionText,
  isCompleted
}: GuidedProgressIndicatorProps) => {
  const progressPercentage = ((currentStep - 1) / totalSteps) * 100;

  return (
    <div className="glass-card p-6 mb-6 border-l-4 border-l-accent-primary">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            {isCompleted ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <span className="text-white font-bold text-sm">{currentStep}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">
              📝 CONTEO GUIADO ACTIVO
            </h3>
            <p className="text-sm text-text-secondary">
              Paso {currentStep} de {totalSteps}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-text-secondary mb-1">Progreso</div>
          <div className="text-xl font-bold text-accent-primary">
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-glass-bg rounded-lg p-4 border border-glass-border">
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <Check className="w-5 h-5 text-success flex-shrink-0" />
          ) : (
            <ArrowRight className="w-5 h-5 text-accent-primary flex-shrink-0" />
          )}
          <div>
            <p className="text-text-primary font-medium">{instructionText}</p>
            {!isCompleted && (
              <p className="text-text-muted text-sm mt-1">
                Complete cada campo en orden. No podrá retroceder ni modificar valores confirmados.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Warning */}
      {!isCompleted && (
        <div className="mt-3 flex items-center gap-2 text-warning text-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>Si abandona la página, deberá reiniciar el conteo desde el principio</span>
        </div>
      )}
    </div>
  );
};