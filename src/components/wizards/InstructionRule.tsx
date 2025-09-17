// 🤖 [CTO] v3.1.2 - Migración de InstructionRule a estándar Wizard V3.
// Componente controlado, sin estado interno, con variantes visuales CVA.
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { cn } from '@/lib/utils';

// ✅ NUEVO: Definición de estados visuales canónicos con CVA
const ruleVariants = cva(
  'flex items-start gap-4 rounded-lg border p-4 relative transition-all duration-300 ease-in-out',
  {
    variants: {
      state: {
        hidden: 'border-slate-700/50 bg-slate-800/20 scale-95 opacity-50 cursor-not-allowed',
        enabled: 'border-blue-500/50 bg-blue-900/20 cursor-pointer hover:bg-blue-900/40',
        reviewing: 'border-yellow-500/80 bg-yellow-900/30 scale-105 shadow-lg shadow-yellow-500/10 ring-2 ring-yellow-400',
        checked: 'border-green-500/60 bg-green-900/30 opacity-70 cursor-default',
      },
    },
    defaultVariants: {
      state: 'hidden',
    },
  }
);

// ✅ NUEVO: Tipos de estado explícitos
export type InstructionState = 'hidden' | 'enabled' | 'reviewing' | 'checked';

// ✅ NUEVO: Props de componente controlado
export interface InstructionRuleProps extends VariantProps<typeof ruleVariants> {
  icon: keyof typeof Icons;
  title: string;
  description: string;
  onClick: () => void;
  isDisabled: boolean;
}

export const InstructionRule: React.FC<InstructionRuleProps> = ({ state, icon, title, description, onClick, isDisabled }) => {
  const IconComponent = Icons[icon];

  return (
    <motion.div
      layout
      className={cn(ruleVariants({ state }))}
      onClick={!isDisabled ? onClick : undefined}
      aria-disabled={isDisabled}
    >
      <div className="flex-shrink-0 pt-1">
        <IconComponent className="h-5 w-5 text-slate-300" />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      </div>
      {state === 'hidden' && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm">
          <span className="text-xs font-medium text-white/80 rounded-full bg-black/40 px-3 py-1">
            🔒 Pendiente
          </span>
        </div>
      )}
    </motion.div>
  );
};