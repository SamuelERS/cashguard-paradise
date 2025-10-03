// 🤖 [IA] - v1.2.26: FASE 3 - Estados Visuales Avanzados migrados de ProtocolRule
// Componente controlado con lógica de estados avanzada + performance optimizada
// 🔧 [FIX] - v1.2.45: Animaciones infinitas limitadas a 3 ciclos (12s total) para prevenir overhead móvil
import React, { useMemo, useCallback, memo } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { CheckCircle, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

// ✅ NUEVO: Definición de estados visuales canónicos con CVA
const ruleVariants = cva(
  'flex items-start gap-[clamp(0.75rem,3vw,1rem)] p-[clamp(0.625rem,2.5vw,0.875rem)] rounded-[clamp(0.375rem,1.5vw,0.5rem)] border relative transition-all duration-300 ease-in-out',
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

// 🤖 [IA] - v1.2.26: FASE 6 - Tipos de estado explícitos + interfaces TypeScript complementarias
export type InstructionState = 'hidden' | 'enabled' | 'reviewing' | 'checked' | 'disabled';

// 🤖 [IA] - v1.2.26: FASE 6 - Interfaces TypeScript complementarias (sin breaking changes)
export interface RuleState {
  isChecked: boolean;
  isBeingReviewed: boolean;
  isEnabled: boolean;
  isHidden: boolean;
}

export interface RuleColors {
  border: string;
  text: string;
}

// 🤖 [IA] - v1.2.26: FASE 6 - Props completas del componente según plan exacto
export interface InstructionRuleProps {
  rule: {
    id: string;
    title: string;
    subtitle: string;
    Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    colors: RuleColors;
  };
  state: RuleState;
  isCurrent: boolean;
  onAcknowledge: () => void;
}

// 🤖 [IA] - v1.2.26: FASE 6 + FASE 7 - Componente según plan exacto
const InstructionRuleComponent: React.FC<InstructionRuleProps> = ({
  rule,
  state,
  isCurrent,
  onAcknowledge
}: InstructionRuleProps) => {
  const IconComponent = rule.Icon;

  // 🤖 [IA] - v1.2.26: FASE 6 - Lógica de estado según plan exacto
  const visualState = useMemo(() => {
    if (state.isChecked) return 'checked';
    if (state.isBeingReviewed) return 'reviewing';
    if (state.isEnabled) return 'enabled';
    if (state.isHidden) return 'hidden';
    return 'disabled';
  }, [state.isChecked, state.isBeingReviewed, state.isEnabled, state.isHidden]);

  // 🤖 [IA] - v1.2.26: FASE 6 - Configuración de estilos según plan exacto
  const styles = useMemo(() => {
    switch (visualState) {
      case 'checked':
        return {
          container: 'instruction-rule-checked',
          icon: 'text-green-400'
        };
      case 'reviewing':
        return {
          container: 'instruction-rule-reviewing',
          icon: 'text-blue-400'
        };
      case 'enabled': {
        // Usar colores dinámicos del rule.colors
        const colorVariant = rule.colors.border.includes('orange') ? 'orange' :
                           rule.colors.border.includes('red') ? 'red' :
                           rule.colors.border.includes('blue') ? 'blue' : 'green';
        return {
          container: `instruction-rule-enabled-${colorVariant}`,
          icon: rule.colors.text
        };
      }
      case 'hidden':
        return {
          container: 'instruction-rule-hidden',
          icon: 'text-muted-foreground'
        };
      default:
        return {
          container: 'instruction-rule-disabled',
          icon: 'text-muted-foreground'
        };
    }
  }, [visualState, rule.colors]);

  // 🤖 [IA] - v1.2.26: FASE 7 - useCallback para handlers según plan exacto
  const handleClick = useCallback(() => {
    if (state.isEnabled && !state.isChecked) {
      onAcknowledge();
    }
  }, [state.isEnabled, state.isChecked, onAcknowledge]);

  return (
    <motion.div
      className={cn(
        "flex items-start gap-[clamp(0.75rem,3vw,1rem)] p-[clamp(0.625rem,2.5vw,0.875rem)] rounded-[clamp(0.375rem,1.5vw,0.5rem)] border relative",
        styles.container,
        // Agregar clase para revelación cuando no esté oculto
        visualState !== 'hidden' && "instruction-rule-revealed"
      )}
      animate={
        visualState === 'hidden'
          ? { // ESTADO OCULTO - TRANSICIÓN SUAVE
              opacity: 0.5,
              scale: 0.95,
              transition: {
                opacity: { duration: 0.6, ease: "easeOut" },
                scale: { duration: 0.6, ease: "easeOut" }
              }
            }
          : visualState === 'enabled' && isCurrent
          ? { // ESTADO ACTIVO - ANIMACIÓN DE PULSO (v1.2.45: limitada a 3 ciclos)
              opacity: 1,
              scale: [1, 1.02, 1],
              transition: {
                scale: { duration: 2, repeat: 3, repeatType: "reverse" as const }, // 🔧 [FIX] v1.2.45: 3 ciclos = 12s total
                opacity: { duration: 0.6, ease: "easeOut" }
              }
            }
          : { // ESTADO POR DEFECTO (COMPLETADO, REVISANDO, ETC.)
              opacity: 1,
              scale: 1,
              transition: {
                opacity: { duration: 0.6, ease: "easeOut" },
                scale: { duration: 0.6, ease: "easeOut" }
              }
            }
      }
      onClick={handleClick}
      role="button"
      tabIndex={state.isEnabled && !state.isChecked ? 0 : -1}
      aria-label={`Regla: ${rule.title} - ${rule.subtitle}${state.isChecked ? ' - Revisada' : state.isBeingReviewed ? ' - En revisión' : state.isEnabled ? ' - Presionar para revisar' : ' - No disponible'}`}
      aria-pressed={state.isChecked}
      aria-disabled={state.isHidden}
    >
      {/* 🤖 [IA] - v1.2.26: FASE 4 - Contenedor del icono con animaciones */}
      <div className="flex-shrink-0 relative">
        <motion.div
          animate={visualState === 'reviewing' ? { rotate: [0, 360] } : {}}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <IconComponent className={cn("w-5 h-5", styles.icon)} />
        </motion.div>

        {/* 🤖 [IA] - v1.2.26: FASE 5 - Indicadores de estado animados según plan exacto */}
        {state.isChecked && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="absolute -top-1 -right-1"
          >
            <CheckCircle className="w-4 h-4 text-green-400 bg-background rounded-full" />
          </motion.div>
        )}

        {visualState === 'reviewing' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Eye className="w-4 h-4 text-blue-400 bg-background rounded-full" />
          </motion.div>
        )}

      </div>

      {/* 🤖 [IA] - v1.2.26: FASE 6 - Contenido textual de la regla según plan exacto */}
      <div className="flex-1 min-w-0">
        <motion.div
          className="font-semibold text-primary-foreground text-[clamp(0.875rem,3.5vw,1rem)] leading-tight"
          animate={state.isBeingReviewed ? { opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 1, repeat: state.isBeingReviewed ? 3 : 0 }} // 🔧 [FIX] v1.2.45: 3 ciclos = 6s total
        >
          {rule.title}
        </motion.div>
        <div className="text-muted-foreground text-[clamp(0.625rem,2.5vw,0.75rem)] mt-[clamp(0.25rem,1vw,0.375rem)] leading-relaxed">
          {rule.subtitle}
        </div>
      </div>

      {/* 🤖 [IA] - v1.2.26: FASE 4 - Overlay animado para elemento activo (según ProtocolRule) */}
      {state.isEnabled && !state.isChecked && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-[clamp(0.375rem,1.5vw,0.5rem)] pointer-events-none",
            "border-2",
            rule.colors.border.includes('red') ? 'border-red-400/30 bg-red-400/5' :
            rule.colors.border.includes('blue') ? 'border-blue-400/30 bg-blue-400/5' :
            rule.colors.border.includes('green') ? 'border-green-400/30 bg-green-400/5' :
            'border-orange-400/30 bg-orange-400/5'
          )}
          style={{ willChange: 'transform, opacity' }}
          animate={{
            scale: [1, 1.01, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: 3, // 🔧 [FIX] v1.2.45: 3 ciclos = 12s total (antes Infinity)
            repeatType: "reverse"
          }}
        />
      )}
      {visualState === 'hidden' && (
        <div className="absolute inset-0 flex items-center justify-center rounded-[clamp(0.375rem,1.5vw,0.5rem)] bg-black/60 backdrop-blur-sm">
          <span className="text-xs font-medium text-white/80 rounded-full bg-black/40 px-3 py-1">
            🔒 Pendiente
          </span>
        </div>
      )}
    </motion.div>
  );
};

// 🤖 [IA] - v1.2.26: FASE 7 - React.memo con comparación personalizada según plan exacto
export const InstructionRule = memo(InstructionRuleComponent, (prevProps, nextProps) => {
  return (
    prevProps.rule.id === nextProps.rule.id &&
    prevProps.state.isChecked === nextProps.state.isChecked &&
    prevProps.state.isBeingReviewed === nextProps.state.isBeingReviewed &&
    prevProps.state.isEnabled === nextProps.state.isEnabled &&
    prevProps.isCurrent === nextProps.isCurrent
  );
});