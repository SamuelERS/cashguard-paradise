import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 1 archivos CSS están ahora importados globalmente vía index.css:
// - guided-progress-glass.css

interface GuidedProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  currentFieldLabel: string;
  instructionText: string;
  isCompleted: boolean;
  isMorningCount?: boolean;
  phaseTitle?: string;
  completedText?: string;
}

export const GuidedProgressIndicator: React.FC<GuidedProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  currentFieldLabel,
  instructionText,
  isCompleted,
  isMorningCount = false,
  phaseTitle = "CONTEO DE CAJA",
  completedText = "Conteo completado"
}) => {
  // 🤖 [IA] - v1.2.14 - Cálculo de progreso unificado
  const progressPercentage = Math.min((currentStep / totalSteps) * 100, 100);
  const modeClass = isMorningCount ? 'morning-mode' : 'evening-mode';
  const effectiveInstruction = instructionText?.trim()
    ? instructionText
    : `Campo actual: ${currentFieldLabel}`;

  // Vista unificada con sistema de diseño coherente
  return (
    <div className={`guided-progress-container ${modeClass}`}>
      <div className="guided-progress-header">
        <div className="guided-progress-info">
          <div className={`guided-progress-badge ${modeClass}`}>
            {isCompleted ? (
              <Check className="w-5 h-5 text-white" />
            ) : (
              <span>{currentStep}</span>
            )}
          </div>
          <div>
            <h3 className="guided-progress-title">
              {phaseTitle}
            </h3>
            <p className="guided-progress-subtitle">
              {isCompleted ? (
                `✓ ${completedText}`
              ) : (
                <span data-testid="step-indicator">
                  Paso {currentStep} de {totalSteps}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="guided-progress-stats">
          <div className="guided-progress-stats-label">Progreso</div>
          <div className={`guided-progress-percentage ${modeClass}`}>
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="guided-progress-bar-container">
        <motion.div
          className={`guided-progress-bar ${modeClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {!isCompleted && (
        <div className="guided-progress-instructions cashcounter-status-banner-slot">
          <div className="guided-progress-instruction-content">
            <ArrowRight className={`guided-progress-instruction-icon ${modeClass}`} />
            <p className="guided-progress-instruction-text" data-testid="guided-instruction-text">
              {effectiveInstruction}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
