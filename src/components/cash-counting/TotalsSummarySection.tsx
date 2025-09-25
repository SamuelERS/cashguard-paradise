// 🤖 [IA] - v1.2.5: Valor siempre visible y mejor UX en Android
// 🤖 [IA] - v1.0.95: Diseño mejorado con proporciones optimizadas y coherencia visual
// 🤖 [IA] - v1.0.70: Glass Effect Premium aplicado a TotalsSummarySection
// 🤖 [IA] - v1.0.28: Componente de resumen de totales con confirmación manual
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, CreditCard, Calculator, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTimingConfig } from "@/hooks/useTimingConfig";
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 2 archivos CSS están ahora importados globalmente vía index.css:
// - gradient-dynamic-button.css
// - totals-confirm-button.css

interface TotalsSummarySectionProps {
  totalCash: number;
  totalElectronic: number;
  currentField: 'totalCash' | 'totalElectronic' | null;
  onConfirmTotal: () => void;
  isFieldCompleted: (field: string) => boolean;
  isMorningCount?: boolean;
}

export const TotalsSummarySection = ({
  totalCash,
  totalElectronic,
  currentField,
  onConfirmTotal,
  isFieldCompleted,
  isMorningCount = false
}: TotalsSummarySectionProps) => {
  // 🤖 [IA] - v1.1.09: Colores dinámicos según modo de operación
  const primaryColor = isMorningCount ? '#f4a52a' : '#0a84ff';
  const secondaryColor = isMorningCount ? '#ffb84d' : '#5e5ce6';
  const borderColor = isMorningCount ? 'rgba(244, 165, 42, 0.3)' : 'rgba(10, 132, 255, 0.3)';
  const borderColorStrong = isMorningCount ? 'rgba(244, 165, 42, 0.5)' : 'rgba(10, 132, 255, 0.5)';
  const borderColorMedium = isMorningCount ? 'rgba(244, 165, 42, 0.4)' : 'rgba(10, 132, 255, 0.4)';
  const borderColorLight = isMorningCount ? 'rgba(244, 165, 42, 0.2)' : 'rgba(10, 132, 255, 0.2)';
  const backgroundLight = isMorningCount ? 'rgba(244, 165, 42, 0.05)' : 'rgba(10, 132, 255, 0.05)';
  const gradientBg = isMorningCount 
    ? 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)'
    : 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)';
  const gradientBgLight = isMorningCount
    ? 'linear-gradient(135deg, rgba(244, 165, 42, 0.15), rgba(255, 184, 77, 0.15))'
    : 'linear-gradient(135deg, rgba(10, 132, 255, 0.15), rgba(94, 92, 230, 0.15))';
  const gradientBgLighter = isMorningCount
    ? 'linear-gradient(135deg, rgba(244, 165, 42, 0.08), rgba(255, 184, 77, 0.08))'
    : 'linear-gradient(135deg, rgba(10, 132, 255, 0.08), rgba(94, 92, 230, 0.08))';
  const shadowColor = isMorningCount ? 'rgba(244, 165, 42, 0.3)' : 'rgba(10, 132, 255, 0.2)';
  const radialGradient = isMorningCount
    ? 'radial-gradient(circle, rgba(244, 165, 42, 0.1) 0%, transparent 70%)'
    : 'radial-gradient(circle, rgba(10, 132, 255, 0.1) 0%, transparent 70%)';
  const [showCelebration, setShowCelebration] = useState(false);
  const cashInputRef = useRef<HTMLInputElement>(null);
  const electronicInputRef = useRef<HTMLInputElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const { createTimeoutWithCleanup } = useTimingConfig();

  const totalGeneral = totalCash + totalElectronic;
  const isCashActive = currentField === 'totalCash';
  const isElectronicActive = currentField === 'totalElectronic';
  const isCashCompleted = isFieldCompleted('totalCash');
  const isElectronicCompleted = isFieldCompleted('totalElectronic');

  // 🤖 [IA] - Mantener focus en el input correspondiente
  useEffect(() => {
    if (isCashActive && cashInputRef.current) {
      cashInputRef.current.focus();
    } else if (isElectronicActive && electronicInputRef.current) {
      electronicInputRef.current.focus();
    }
  }, [isCashActive, isElectronicActive]);

  // 🤖 [IA] - Manejar confirmación con celebración
  const handleConfirm = useCallback(() => {
    onConfirmTotal();
    
    // 🤖 [IA] - Mostrar celebración si se completan ambos totales
    if ((isCashActive && isElectronicCompleted) || (isElectronicActive && isCashCompleted)) {
      setShowCelebration(true);
      createTimeoutWithCleanup(() => {
        setShowCelebration(false);
      }, 'confirmation', 'totals_celebration');
    }
  }, [isCashActive, isElectronicActive, isCashCompleted, isElectronicCompleted, onConfirmTotal, createTimeoutWithCleanup]);

  // 🤖 [IA] - TouchEnd handler para persistencia del teclado móvil
  useEffect(() => {
    if ((isCashActive || isElectronicActive) && confirmButtonRef.current) {
      const button = confirmButtonRef.current;
      
      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleConfirm();
      };

      button.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        button.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isCashActive, isElectronicActive, handleConfirm]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  // 🤖 [IA] - v1.0.95: Componente interno con estados mutuamente excluyentes
  const TotalField = ({
    icon: Icon,
    iconColor,
    label,
    value,
    isActive,
    isCompleted,
    inputRef,
    "data-testid": dataTestId
  }: {
    icon: typeof DollarSign;
    iconColor: string;
    label: string;
    value: number;
    isActive: boolean;
    isCompleted: boolean;
    inputRef: React.RefObject<HTMLInputElement>;
    "data-testid"?: string;
  }) => {
    // Estados mutuamente excluyentes: completado tiene prioridad
    const effectiveIsActive = isCompleted ? false : isActive;
    const fieldState = isCompleted ? 'completed' : effectiveIsActive ? 'active' : 'pending';
    
    return (
    <div data-testid={dataTestId} style={{
      // 🤖 [IA] - v1.2.5: Backgrounds más sólidos para mejor visibilidad en Android
      backgroundColor: fieldState === 'completed' ? 'rgba(0, 186, 124, 0.12)' : 
                       fieldState === 'active' ? 'rgba(10, 132, 255, 0.15)' : 
                       'rgba(36, 36, 36, 0.5)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: fieldState === 'completed' ? '2px solid rgba(0, 186, 124, 0.6)' :
              fieldState === 'active' ? `2px solid ${borderColorStrong}` :
              '1px solid rgba(255, 255, 255, 0.2)',
      borderRadius: '14px',
      padding: '16px',
      transition: 'all 0.3s ease',
      transform: fieldState === 'active' ? 'scale(1.02)' : 'scale(1)',
      boxShadow: fieldState === 'active' ? `0 0 20px ${shadowColor}` : 'none'
    }}>
      <div className="flex items-center gap-3">
        {/* Icono con estado */}
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
          style={{
            // 🤖 [IA] - v1.2.5: Iconos más visibles con backgrounds más sólidos
            backgroundColor: fieldState === 'completed' ? '#00ba7c' : 
                           fieldState === 'active' ? (iconColor === 'primary' ? 'rgba(10, 132, 255, 0.25)' : 'rgba(94, 92, 230, 0.25)') : 
                           'rgba(31, 41, 55, 0.6)',
            boxShadow: fieldState === 'completed' ? '0 10px 25px rgba(0, 186, 124, 0.4)' :
                      fieldState === 'active' ? `0 8px 20px ${shadowColor}` : 'none'
          }}
        >
          {fieldState === 'completed' ? (
            <Check className="w-5 h-5 text-white" />
          ) : (
            <Icon className="w-5 h-5" style={{ 
              color: fieldState === 'active' ? (iconColor === 'primary' ? primaryColor : secondaryColor) : '#9ca3af'
            }} />
          )}
        </div>
        
        {/* Campo principal */}
        <div className="flex-1">
          <label className="text-xs font-medium text-text-secondary block mb-1">
            {label}
          </label>
          
          {/* Mostrar valor diferente según estado claro */}
          {fieldState === 'completed' ? (
            // Estado completado: Texto grande sin input
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl font-bold text-success"
            >
              ${value.toFixed(2)}
            </motion.div>
          ) : (
            // Estado activo o pendiente: Valor visible + botón
            <div className="space-y-2">
              {/* 🤖 [IA] - v1.2.5: Valor siempre visible para Android */}
              <div className={cn(
                "text-2xl font-bold transition-all",
                fieldState === 'active' ? "text-white" : "text-gray-400"
              )}>
                ${value.toFixed(2)}
              </div>
              
              {/* Input oculto para mantener la referencia y funcionalidad */}
              <Input
                ref={inputRef}
                type="text"
                value={`$${value.toFixed(2)}`}
                readOnly
                onKeyPress={fieldState === 'active' ? handleKeyPress : undefined}
                className="sr-only"
                tabIndex={-1}
              />
              
              {fieldState === 'active' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="w-full"
                >
                  <Button
                    ref={confirmButtonRef}
                    onClick={handleConfirm}
                    variant="totals-confirm"
                    data-context={isMorningCount ? "morning" : "evening"}
                    size="lg"
                    onMouseDown={(e) => e.preventDefault()}
                    onTouchStart={(e) => e.preventDefault()}
                  >
                    <Check className="w-5 h-5" />
                    <span>Confirmar</span>
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
    );
  };

  return (
    // 🤖 [IA] - v1.0.96: Wrapper responsive para desktop sin afectar móviles
    <div className="lg:max-w-2xl lg:mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: 'rgba(36, 36, 36, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          padding: '18px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
        className="space-y-4 relative"
      >
      {/* 🤖 [IA] - Header compacto con animación */}
      <div className="text-center space-y-1">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="inline-block"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 flex items-center justify-center shadow-lg mx-auto mb-2">
            <Calculator className="w-7 h-7 text-white" />
          </div>
        </motion.div>
        <h3 className="text-xl font-bold" style={{
          background: gradientBg,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>Resumen de Totales</h3>
        <p className="text-xs text-text-secondary">
          Confirme los totales calculados automáticamente
        </p>
      </div>

      {/* 🤖 [IA] - v1.0.95: Campos con estados mutuamente excluyentes */}
      <div className="space-y-2">
        <TotalField
          data-testid="total-cash-section"
          icon={DollarSign}
          iconColor="primary"
          label="Total Efectivo"
          value={totalCash}
          isActive={isCashActive}
          isCompleted={isCashCompleted}
          inputRef={cashInputRef}
        />

        <TotalField
          data-testid="total-electronic-section"
          icon={CreditCard}
          iconColor="accent-primary"
          label="Total Electrónico"
          value={totalElectronic}
          isActive={isElectronicActive}
          isCompleted={isElectronicCompleted}
          inputRef={electronicInputRef}
        />
      </div>

      {/* 🤖 [IA] - v1.0.95: Total General siempre visible y prominente */}
      <motion.div
        key={totalGeneral}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        style={{
          background: (isCashCompleted && isElectronicCompleted) 
            ? gradientBgLight
            : gradientBgLighter,
          border: (isCashCompleted && isElectronicCompleted)
            ? `2px solid ${borderColorMedium}`
            : `2px solid ${borderColorLight}`,
          borderRadius: '14px',
          padding: '20px',
          marginTop: '8px',
          position: 'relative',
          overflow: 'hidden',
          transform: 'scale(1.02)'
        }}
      >
          {/* Efecto de brillo cuando ambos están completados */}
          {isCashCompleted && isElectronicCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(105deg, transparent 40%, rgba(255, 255, 255, 0.1) 50%, transparent 60%)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 3s infinite'
              }}
            />
          )}
          
          <div className="text-center relative z-10">
            <p className="text-xs text-text-secondary mb-2 font-medium uppercase tracking-wider">
              Total General
            </p>
            <motion.p 
              className="text-4xl sm:text-5xl font-bold"
              style={{
                background: (isCashCompleted && isElectronicCompleted)
                  ? gradientBg
                  : 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1'
              }}
              animate={isCashCompleted && isElectronicCompleted ? {
                scale: [1, 1.05, 1],
                transition: { duration: 0.5 }
              } : {}}
            >
              ${totalGeneral.toFixed(2)}
            </motion.p>
          </div>
      </motion.div>

      {/* 🤖 [IA] - Celebración al completar */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            style={{
              background: radialGradient
            }}
          >
            <div className="text-center">
              <Sparkles className="w-16 h-16 text-warning mx-auto mb-4 animate-bounce" />
              <p className="text-2xl font-bold text-primary">¡Totales Confirmados!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </motion.div>
    </div>
  );
};