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

  // Vista móvil más compacta
  if (isMobile) {
    return (
      <div style={{
        backgroundColor: 'rgba(36, 36, 36, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        {/* Header compacto para móvil */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{
              background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`
            }}>
              {isCompleted ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <span className="text-white font-bold text-xs">{currentStep}</span>
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                📝 CONTEO GUIADO
              </h3>
              <p className="text-xs text-text-secondary">
                {isCompleted ? '✓ Conteo completado' : `Paso ${currentStep} de ${totalSteps}`}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold" style={{ color: accentColor }}>
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

        {/* Instrucción actual más destacada */}
        <div className="bg-glass-bg rounded-lg p-3 border border-glass-border">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <Check className="w-4 h-4 text-success flex-shrink-0" />
            ) : (
              <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: accentColor }} />
            )}
            <p className="text-text-primary font-medium text-sm">{instructionText}</p>
          </div>
        </div>

        {/* Warning compacto */}
        {!isCompleted && (
          <div className="mt-2 flex items-center gap-1 text-warning text-xs">
            <AlertTriangle className="w-3 h-3" />
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