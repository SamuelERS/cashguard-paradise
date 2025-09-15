import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
// 🤖 [IA] - v1.2.20: Import Glass Morphism styles for perfect Glass effect
import '../../styles/features/guided-progress-glass.css';

interface GuidedProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  currentFieldLabel: string;
  instructionText: string;
  isCompleted: boolean;
  isMorningCount?: boolean;
}

export const GuidedProgressIndicator: React.FC<GuidedProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  instructionText,
  isCompleted,
  isMorningCount = false
}) => {
  // 🤖 [IA] - v1.2.14 - Cálculo de progreso unificado
  const progressPercentage = Math.min((currentStep / totalSteps) * 100, 100);
  const modeClass = isMorningCount ? 'morning-mode' : 'evening-mode';

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
              📝 CONTEO GUIADO
            </h3>
            <p className="guided-progress-subtitle">
              {isCompleted ? '✓ Conteo completado' : `Paso ${currentStep} de ${totalSteps}`}
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

    </div>
  );
};