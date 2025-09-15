// 🤖 [IA] - v1.2.23: Componente InstructionRule - Arquitectura Guiada Basada en Datos para Instrucciones + Performance Optimized
import { motion } from 'framer-motion';
import { CheckCircle, Eye } from 'lucide-react';
import { memo, useMemo, useCallback } from 'react';
import { InstructionRule as InstructionRuleType, InstructionRuleState } from '@/config/flows/cashCutInstructionsFlow';
import { cn } from '@/lib/utils';

interface InstructionRuleProps {
  rule: InstructionRuleType;
  state: InstructionRuleState;
  isCurrent: boolean;
  onAcknowledge: () => void;
}

// 🤖 [IA] - v1.2.23: Componente individual para cada instrucción del corte de caja
// Encapsula toda la lógica visual y de interacción de una instrucción
// Performance optimized: React.memo + useMemo para evitar re-renders innecesarios
const InstructionRuleComponent = ({ rule, state, isCurrent, onAcknowledge }: InstructionRuleProps) => {
  const { Icon, colors, title, subtitle } = rule;

  // 🤖 [IA] - Determinar el estado visual de la instrucción (memoizado para performance)
  // Incluye nuevo estado 'hidden' para revelación progresiva elegante
  const visualState = useMemo(() => {
    if (state.isChecked) return 'checked';
    if (state.isBeingReviewed) return 'reviewing';
    if (state.isEnabled) return 'enabled';
    if (state.isHidden) return 'hidden';
    return 'disabled';
  }, [state.isChecked, state.isBeingReviewed, state.isEnabled, state.isHidden]);

  // 🤖 [IA] - Configuración de estilos basada en estado usando clases estáticas (memoizado para performance)
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
        // Determinar color basado en la configuración de la instrucción
        const colorVariant = colors.border.includes('orange') ? 'orange' :
                           colors.border.includes('red') ? 'red' :
                           colors.border.includes('blue') ? 'blue' : 'green';
        return {
          container: `instruction-rule-enabled-${colorVariant}`,
          icon: colors.text
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
  }, [visualState, colors.border, colors.text]);

  // 🤖 [IA] - Manejar click en la instrucción (memoizado para performance)
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
      onClick={handleClick}
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
          ? { // ESTADO ACTIVO - ANIMACIÓN DE PULSO
              opacity: 1,
              scale: [1, 1.02, 1],
              transition: {
                scale: { duration: 2, repeat: Infinity, repeatType: "reverse" as const },
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
      role="button"
      tabIndex={state.isEnabled && !state.isChecked ? 0 : -1}
      aria-label={`Instrucción: ${title} - ${subtitle}${state.isChecked ? ' - Revisada' : state.isEnabled ? ' - Presionar para revisar' : ' - No disponible'}`}
      aria-pressed={state.isChecked}
      aria-disabled={!state.isEnabled}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && state.isEnabled && !state.isChecked) {
          e.preventDefault();
          onAcknowledge();
        }
      }}
    >
      {/* 🤖 [IA] - Contenedor del icono con estado dinámico */}
      <div className="flex-shrink-0 relative">
        <motion.div
          animate={state.isBeingReviewed ? { rotate: [0, 360] } : {}}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          <Icon className={cn("w-5 h-5", styles.icon)} />
        </motion.div>
        
        {/* 🤖 [IA] - Indicador visual de estado */}
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
        
        {state.isBeingReviewed && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Eye className="w-4 h-4 text-blue-400 bg-background rounded-full" />
          </motion.div>
        )}
      </div>

      {/* 🤖 [IA] - Contenido textual de la instrucción */}
      <div className="flex-1 min-w-0">
        <motion.div 
          className="font-semibold text-primary-foreground text-[clamp(0.875rem,3.5vw,1rem)] leading-tight"
          animate={state.isBeingReviewed ? { opacity: [1, 0.7, 1] } : {}}
          transition={{ duration: 1, repeat: state.isBeingReviewed ? Infinity : 0 }}
        >
          {title}
        </motion.div>
        <div className="text-muted-foreground text-[clamp(0.625rem,2.5vw,0.75rem)] mt-[clamp(0.25rem,1vw,0.375rem)] leading-relaxed">
          {subtitle}
        </div>
      </div>

      {/* 🤖 [IA] - Indicador de interactividad usando variables CSS del sistema */}
      {state.isEnabled && !state.isChecked && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-[clamp(0.375rem,1.5vw,0.5rem)] pointer-events-none",
            "border-2",
            colors.border.includes('red') ? 'border-red-400/30 bg-red-400/5' :
            colors.border.includes('blue') ? 'border-blue-400/30 bg-blue-400/5' :
            colors.border.includes('green') ? 'border-green-400/30 bg-green-400/5' :
            'border-orange-400/30 bg-orange-400/5'
          )}
          style={{ willChange: 'transform, opacity' }}
          animate={{
            scale: [1, 1.01, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      )}

      {/* 🤖 [IA] - Tooltip/hint para instrucción activa */}
      {isCurrent && state.isEnabled && !state.isChecked && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-lg"
        >
          Toca para revisar
        </motion.div>
      )}

      {/* 🤖 [IA] - v1.2.23: Overlay para instrucciones ocultas */}
      {visualState === 'hidden' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[clamp(0.375rem,1.5vw,0.5rem)] backdrop-blur-sm"
        >
          <span className="text-xs text-white/80 font-medium px-3 py-1 bg-black/40 rounded-full">
            🔒 Completa la instrucción anterior
          </span>
        </motion.div>
      )}
    </motion.div>
  );
};

// 🤖 [IA] - Exportar componente memoizado para prevenir re-renders innecesarios
export const InstructionRule = memo(InstructionRuleComponent, (prevProps, nextProps) => {
  return (
    prevProps.rule.id === nextProps.rule.id &&
    prevProps.state.isChecked === nextProps.state.isChecked &&
    prevProps.state.isBeingReviewed === nextProps.state.isBeingReviewed &&
    prevProps.state.isEnabled === nextProps.state.isEnabled &&
    prevProps.isCurrent === nextProps.isCurrent
  );
});