// 🤖 [IA] - Componente ProtocolRule - Arquitectura Guiada Basada en Datos v1.0 + Performance Optimized
import { motion } from 'framer-motion';
import { CheckCircle, Eye } from 'lucide-react';
import { memo, useMemo, useCallback } from 'react';
import { ProtocolRule as ProtocolRuleType, RuleState } from '@/config/flows/initialWizardFlow';
import { cn } from '@/lib/utils';

interface ProtocolRuleProps {
  rule: ProtocolRuleType;
  state: RuleState;
  isCurrent: boolean;
  onAcknowledge: () => void;
}

// 🤖 [IA] - Componente individual para cada regla del protocolo
// Encapsula toda la lógica visual y de interacción de una regla
// Performance optimized: React.memo + useMemo para evitar re-renders innecesarios
const ProtocolRuleComponent = ({ rule, state, isCurrent, onAcknowledge }: ProtocolRuleProps) => {
  const { Icon, colors, title, subtitle } = rule;

  // 🤖 [IA] - Determinar el estado visual de la regla (memoizado para performance)
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
          container: 'protocol-rule-checked',
          icon: 'text-green-400'
        };
      case 'reviewing':
        return {
          container: 'protocol-rule-reviewing',
          icon: 'text-blue-400'
        };
      case 'enabled': {
        // 🤖 [IA] - v1.2.41: SIMPLIFICACIÓN - Siempre azul para reglas enabled
        // ANTES: Lógica condicional decidía entre 4 variantes (red/orange/blue/green)
        // AHORA: Todas las variantes CSS son idénticas (azules), siempre usar blue
        // BENEFICIO: Elimina confusión, sin flash de color incorrecto, código más simple
        return {
          container: 'protocol-rule-enabled-blue',
          icon: colors.text
        };
      }
      case 'hidden':
        return {
          container: 'protocol-rule-hidden',
          icon: 'text-muted-foreground'
        };
      default:
        return {
          container: 'protocol-rule-disabled',
          icon: 'text-muted-foreground'
        };
    }
  }, [visualState, colors.text]);

  // 🤖 [IA] - Manejar click en la regla (memoizado para performance)
  const handleClick = useCallback(() => {
    if (state.isEnabled && !state.isChecked) {
      onAcknowledge();
    }
  }, [state.isEnabled, state.isChecked, onAcknowledge]);

  return (
    <motion.div
      className={cn(
        "flex items-start gap-[clamp(0.75rem,3vw,1rem)] p-[clamp(0.625rem,2.5vw,0.875rem)] rounded-[clamp(0.375rem,1.5vw,0.5rem)] border relative",
        // 🤖 [IA] - v1.2.41c: Color de borde explícito según estado
        // Sobrescribe color por defecto de .border (hsl(var(--border))) con colores semánticos
        visualState === 'checked' ? 'border-green-400' :
        visualState === 'enabled' ? 'border-blue-400' :
        visualState === 'reviewing' ? 'border-blue-400' :
        'border-muted',  // disabled/hidden
        styles.container,
        // Agregar clase para revelación cuando no esté oculto
        visualState !== 'hidden' && "protocol-rule-revealed"
      )}
      onClick={handleClick}
      data-testid={`protocol-rule-${rule.id}`}
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
      aria-label={`Regla: ${title} - ${subtitle}${state.isChecked ? ' - Revisada' : state.isEnabled ? ' - Presionar para revisar' : ' - No disponible'}`}
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
      {/* 🎯 [COHERENCE] - v1.2.41AE: Rotación eliminada para coherencia con todos los modales */}
      <div className="flex-shrink-0 relative">
        <div>
          <Icon className={cn("w-5 h-5", styles.icon)} />
        </div>
        
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

      {/* 🤖 [IA] - Contenido textual de la regla */}
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

      {/* 🤖 [IA] - v1.2.41: Indicador de interactividad AZUL para reglas enabled
       * CORRECCIÓN: Unificado a azul (border-blue-400/30 bg-blue-400/5)
       * ANTES: Variantes red/orange/green según configuración regla
       * AHORA: Siempre azul para reglas pendientes (consistencia UX)
       * CUMPLIMIENTO: Azul = pendiente, Verde = completado (checked) */}
      {state.isEnabled && !state.isChecked && (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-[clamp(0.375rem,1.5vw,0.5rem)] pointer-events-none",
            "border-2",
            "border-blue-400/30 bg-blue-400/5"
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
    </motion.div>
  );
};

// 🤖 [IA] - Exportar componente memoizado para prevenir re-renders innecesarios
export const ProtocolRule = memo(ProtocolRuleComponent, (prevProps, nextProps) => {
  return (
    prevProps.rule.id === nextProps.rule.id &&
    prevProps.state.isChecked === nextProps.state.isChecked &&
    prevProps.state.isBeingReviewed === nextProps.state.isBeingReviewed &&
    prevProps.state.isEnabled === nextProps.state.isEnabled &&
    prevProps.isCurrent === nextProps.isCurrent
  );
});