import { motion } from "framer-motion";
import { Check, ArrowRight, AlertTriangle } from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface GuidedProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  currentFieldLabel: string;
  instructionText: string;
  isCompleted: boolean;
  isMorningCount?: boolean; // 🤖 [IA] - v1.1.09: Prop para determinar colores
}

export const GuidedProgressIndicator = ({
  currentStep,
  totalSteps,
  currentFieldLabel,
  instructionText,
  isCompleted,
  isMorningCount = false
}: GuidedProgressIndicatorProps) => {
  const isMobile = useIsMobile();
  const progressPercentage = ((currentStep - 1) / totalSteps) * 100;
  
  // 🤖 [IA] - v1.1.09: Colores dinámicos según modo de operación
  const borderColor = isMorningCount ? 'rgba(244, 165, 42, 0.8)' : 'rgba(10, 132, 255, 0.8)';
  const gradientStart = isMorningCount ? '#f4a52a' : '#0a84ff';
  const gradientEnd = isMorningCount ? '#ffb84d' : '#5e5ce6';
  const accentColor = isMorningCount ? '#f4a52a' : '#0a84ff';

  // Vista móvil más compacta y responsive
  if (isMobile) {
    return (
      <div style={{
        backgroundColor: 'rgba(36, 36, 36, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '16px',
        padding: `clamp(12px, 3vw, 16px)`,
        marginBottom: `clamp(12px, 3vw, 16px)`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header compacto para móvil - responsive */}
        <div className="flex items-center justify-between" style={{ marginBottom: `clamp(10px, 2.5vw, 12px)` }}>
          <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
            <div className="rounded-full flex items-center justify-center" style={{
              width: `clamp(28px, 7vw, 32px)`,
              height: `clamp(28px, 7vw, 32px)`,
              background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`
            }}>
              {isCompleted ? (
                <Check style={{ width: `clamp(14px, 3.5vw, 16px)`, height: `clamp(14px, 3.5vw, 16px)` }} className="text-white" />
              ) : (
                <span className="text-white font-bold" style={{ fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)` }}>{currentStep}</span>
              )}
            </div>
            <div>
              <h3 className="font-bold text-text-primary" style={{ fontSize: `clamp(0.875rem, 3.5vw, 1rem)` }}>
                📝 CONTEO GUIADO
              </h3>
              <p className="text-text-secondary" style={{ fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)` }}>
                {isCompleted ? '✓ Conteo completado' : `Paso ${currentStep} de ${totalSteps === 17 ? 15 : totalSteps}`}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-bold" style={{ fontSize: `clamp(1.25rem, 5vw, 1.5rem)`, color: accentColor }}>
              {Math.round(progressPercentage)}%
            </div>
          </div>
        </div>

        {/* Progress Bar más prominente en móvil */}
        <div className="mb-3">
          <div className="w-full bg-bg-tertiary rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full"
              style={{ background: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})` }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Instrucción actual más destacada - responsive */}
        <div className="bg-glass-bg rounded-lg border border-glass-border" style={{ padding: `clamp(10px, 2.5vw, 12px)` }}>
          <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
            {isCompleted ? (
              <Check className="text-success flex-shrink-0" style={{
                width: `clamp(14px, 3.5vw, 16px)`,
                height: `clamp(14px, 3.5vw, 16px)`
              }} />
            ) : (
              <ArrowRight className="flex-shrink-0" style={{ 
                width: `clamp(14px, 3.5vw, 16px)`,
                height: `clamp(14px, 3.5vw, 16px)`,
                color: accentColor 
              }} />
            )}
            <p className="text-text-primary font-medium" style={{ fontSize: `clamp(0.75rem, 3vw, 0.875rem)` }}>{instructionText}</p>
          </div>
        </div>

        {/* Warning compacto - responsive */}
        {!isCompleted && (
          <div className="flex items-center text-warning" style={{ 
            marginTop: `clamp(6px, 1.5vw, 8px)`,
            gap: `clamp(4px, 1vw, 6px)`,
            fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)`
          }}>
            <AlertTriangle style={{
              width: `clamp(12px, 3vw, 14px)`,
              height: `clamp(12px, 3vw, 14px)`
            }} />
            <span>No podrá retroceder</span>
          </div>
        )}
      </div>
    );
  }

  // Vista desktop original
  return (
    <div style={{
      backgroundColor: 'rgba(36, 36, 36, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderLeft: `4px solid ${borderColor}`,
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{
            background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`
          }}>
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
              {isCompleted ? '✓ Conteo completado' : `Paso ${currentStep} de ${totalSteps}`}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-text-secondary mb-1">Progreso</div>
          <div className="text-xl font-bold" style={{ color: accentColor }}>
            {Math.round(progressPercentage)}%
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full"
            style={{ background: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})` }}
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
            <ArrowRight className="w-5 h-5 flex-shrink-0" style={{ color: accentColor }} />
          )}
          <div>
            <p className="text-text-primary font-medium">{instructionText}</p>
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