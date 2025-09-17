// > [CTO] v3.1.2 - Creación del componente InstructionProgress para el estándar Wizard V3.
// Cumple con la Doctrina de Responsividad Fluida (D.3) usando variables CSS.
import { motion } from 'framer-motion';
import React from 'react';

interface InstructionProgressProps {
  currentStep: number;
  totalSteps: number;
  phase: string;
  isComplete: boolean;
}

export const InstructionProgress: React.FC<InstructionProgressProps> = ({
  currentStep,
  totalSteps,
  phase,
  isComplete
}) => {
  const percentage = isComplete ? 100 : Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="my-[var(--instruction-fluid-xl)] px-[var(--instruction-fluid-lg)]">
      {/* Progress Bar Container */}
      <div className="w-full overflow-hidden rounded-full bg-slate-700/50 h-2">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        />
      </div>

      {/* Progress Text */}
      <div className="flex justify-center mt-[var(--instruction-fluid-sm)]">
        <p className="text-xs">
          <span className="font-medium text-blue-300">{phase}</span>
          <span className="text-slate-400"> - {percentage}% completado</span>
        </p>
      </div>
    </div>
  );
};