// 🤖 [IA] - v1.0.70: Glass Effect Premium aplicado con inline styles
// 🤖 [IA] - v1.0.27: Corrección de inconsistencias visuales detectadas
// Unifica colores, badges, símbolos y mensajes para paridad total con GuidedDenominationItem
import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, ArrowRight, Lock, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useFieldNavigation } from "@/hooks/useFieldNavigation";
import { useInputValidation } from "@/hooks/useInputValidation";
import { useTimingConfig } from "@/hooks/useTimingConfig";
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 1 archivos CSS están ahora importados globalmente vía index.css:
// - guided-numeric-confirm-button.css

interface GuidedElectronicPaymentItemProps {
  paymentMethod: {
    key: string;
    name: string;
    icon: LucideIcon;
    color: string;
    borderColor: string;
  };
  value: number;
  isActive: boolean;
  isCompleted: boolean;
  isAccessible: boolean;
  onConfirm: (value: string) => void;
  onAttemptAccess?: () => void;
  tabIndex?: number;
  nextFieldName?: string; // 🤖 [IA] - Para navegación automática al siguiente campo
}

export const GuidedElectronicPaymentItem = ({
  paymentMethod,
  value,
  isActive,
  isCompleted,
  isAccessible,
  onConfirm,
  onAttemptAccess,
  tabIndex,
  nextFieldName
}: GuidedElectronicPaymentItemProps) => {
  const [inputValue, setInputValue] = useState(isCompleted ? value.toString() : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputValueRef = useRef(inputValue);
  const navigationTimeoutRef = useRef<(() => void) | undefined>(); // 🤖 [IA] - Ref para cancelar cleanup function v1.2.20
  
  const Icon = paymentMethod.icon;
  
  // 🤖 [IA] - Actualizar ref cuando cambia inputValue
  inputValueRef.current = inputValue;

  const { handleEnterNavigation } = useFieldNavigation([paymentMethod.key]);
  const { validateInput, getPattern, getInputMode } = useInputValidation();
  const { createTimeoutWithCleanup } = useTimingConfig();

  const handleInputChange = (value: string) => {
    if (isActive) {
      // 🤖 [IA] - Validación para decimales (pagos electrónicos)
      const validation = validateInput(value, 'decimal');
      if (validation.isValid) {
        setInputValue(validation.cleanValue);
      }
    }
  };

  // 🤖 [IA] - Memoizar handleConfirm con navegación automática
  const handleConfirm = useCallback(() => {
    // 🤖 [IA] - Distinguir entre vacío y "0" real
    const confirmValue = inputValue !== "" ? inputValue : "0";
    
    onConfirm(confirmValue);
    setInputValue("");
    
    // 🤖 [IA] - Cancelar cleanup anterior si existe v1.2.20
    if (navigationTimeoutRef.current) {
      navigationTimeoutRef.current();
    }
    
    // 🤖 [IA] - Navegación automática al siguiente campo si está definido
    if (nextFieldName) {
      navigationTimeoutRef.current = createTimeoutWithCleanup(() => {
        const nextInput = document.querySelector(`[data-field="${nextFieldName}"]`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }, 'confirmation', `confirm_${paymentMethod.key}_to_${nextFieldName}`);
    }
  }, [inputValue, onConfirm, paymentMethod.key, nextFieldName, createTimeoutWithCleanup]);

  // 🤖 [IA] - Auto-focus cuando el campo se activa
  useEffect(() => {
    if (isActive && inputRef.current) {
      const cleanup = createTimeoutWithCleanup(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 'focus', `focus_${paymentMethod.key}`);
      
      return cleanup;
    }
  }, [isActive, paymentMethod.key, createTimeoutWithCleanup]);

  // 🤖 [IA] - Cleanup de la navegación cuando se desmonta el componente v1.2.20
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        navigationTimeoutRef.current();
      }
    };
  }, []);

  // 🤖 [IA] - TouchEnd handler para persistencia del teclado móvil
  useEffect(() => {
    if (isActive && buttonRef.current) {
      const button = buttonRef.current;
      
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
  }, [isActive, handleConfirm]);

  // 🤖 [IA] - Auto-confirmar al perder foco
  const handleBlur = useCallback(() => {
    if (isActive && inputValue !== "") {
      handleConfirm();
    }
  }, [isActive, inputValue, handleConfirm]);

  const handleKeyPress = handleEnterNavigation(paymentMethod.key, () => {
    if (isActive && inputValue !== "") {
      handleConfirm();
    }
  });

  const handleClick = () => {
    if (!isAccessible && onAttemptAccess) {
      onAttemptAccess();
    }
  };

  return (
    <motion.div 
      style={{
        backgroundColor: isCompleted ? 'rgba(0, 186, 124, 0.05)' : 'rgba(36, 36, 36, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isActive ? '2px solid rgba(10, 132, 255, 0.4)' : 
               isCompleted ? '2px solid rgba(0, 186, 124, 0.6)' : 
               '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        padding: '20px',
        boxShadow: isActive ? '0 8px 24px rgba(10, 132, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' :
                   '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        opacity: !isAccessible ? '0.3' : '1',
        cursor: !isAccessible ? 'not-allowed' : 'pointer',
        transition: 'all 0.5s'
      }}
      className="space-y-3"
      whileHover={isAccessible ? { scale: 1.01, y: -1 } : {}}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        {/* Status Icon con Glow mejorado */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300",
          isCompleted && "bg-success text-white shadow-lg shadow-success/40",
          isActive && "bg-primary text-white shadow-lg shadow-primary/40 animate-pulse",
          !isAccessible && "bg-muted/30 text-muted-foreground"
        )}>
          {isCompleted ? (
            <Check className="w-5 h-5" />
          ) : isActive ? (
            <ArrowRight className="w-5 h-5" />
          ) : (
            <Lock className="w-5 h-5" />
          )}
        </div>

        {/* Icono del método de pago */}
        <Icon className={cn(
          "w-6 h-6 flex-shrink-0 transition-all duration-300",
          paymentMethod.color,
          !isAccessible && "grayscale opacity-50"
        )} />
        
        <Label className={cn(
          "text-base font-semibold flex-1 transition-all duration-300",
          isActive && "text-primary glow",
          isCompleted && "text-success",
          !isAccessible && "text-muted-foreground"
        )}>
          {paymentMethod.name}
        </Label>

        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="floating-badge"
          >
            ACTIVO
          </motion.div>
        )}
      </div>
      
      <div className="flex gap-3">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">$</span>
          <Input
            ref={inputRef}
            type="text"
            inputMode={getInputMode('decimal')}
            pattern={getPattern('decimal')}
            step="0.01"
            min="0"
            value={isCompleted ? value.toFixed(2) : inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyPress}
            onBlur={handleBlur}
            placeholder={isActive ? "0.00" : "0.00"}
            disabled={!isActive}
            tabIndex={isActive ? tabIndex : -1}
            data-field={paymentMethod.key}
            className={cn(
              "input-field pl-8 text-center text-lg font-semibold flex-1 h-12 md:h-10",
              isActive && "active",
              isCompleted && "completed",
              !isAccessible && "blocked",
              paymentMethod.borderColor
            )}
          />
        </div>
        
        {isActive && (
          <Button
            ref={buttonRef}
            onClick={handleConfirm}
            disabled={!inputValue && inputValue !== "0"}
            size="sm"
            variant="guided-numeric-confirm"
            data-context="electronic"
            onMouseDown={(e) => e.preventDefault()}
            onTouchStart={(e) => e.preventDefault()}
          >
            ⏎
          </Button>
        )}
      </div>
      
      {isCompleted && value > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="floating-badge success text-center"
        >
          Total: ${value.toFixed(2)}
        </motion.div>
      )}

      {!isAccessible && (
        <div className="floating-badge warning text-center text-xs">
          Debe completar el campo actual antes de continuar
        </div>
      )}
    </motion.div>
  );
};