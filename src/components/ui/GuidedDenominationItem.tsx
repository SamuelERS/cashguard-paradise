import { useState, useRef, useEffect, useCallback } from "react"; // 🤖 [IA] - Agregar useCallback para memoización v1.0.23
import { motion } from "framer-motion";
import { Check, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
// 🤖 [IA] - Usar tipo inline en lugar de importar Denomination inexistente
import { useFieldNavigation } from "@/hooks/useFieldNavigation";
import { useInputValidation } from "@/hooks/useInputValidation"; // 🤖 [IA] - Hook de validación unificada
import { useTimingConfig } from "@/hooks/useTimingConfig"; // 🤖 [IA] - BUG #6 Fix: Timing unificado
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 1 archivos CSS están ahora importados globalmente vía index.css:
// - guided-numeric-confirm-button.css

interface GuidedDenominationItemProps {
  denomination: {
    name: string;
    value: number;
  }; // 🤖 [IA] - Tipo inline para evitar importación inexistente
  fieldName: string;
  quantity: number;
  type: "coin" | "bill";
  isActive: boolean;
  isCompleted: boolean;
  isAccessible: boolean;
  onConfirm: (value: string) => void;
  onAttemptAccess?: () => void;
  tabIndex?: number; // 🤖 [IA] - Índice para navegación con flechas del teclado
}

export const GuidedDenominationItem = ({
  denomination,
  fieldName,
  quantity,
  type,
  isActive,
  isCompleted,
  isAccessible,
  onConfirm,
  onAttemptAccess,
  tabIndex
}: GuidedDenominationItemProps) => {
  const [inputValue, setInputValue] = useState(isCompleted ? quantity.toString() : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputValueRef = useRef(inputValue); // 🤖 [IA] - Fix stale closure con useRef v1.0.23
  const navigationTimeoutRef = useRef<(() => void) | undefined>(); // 🤖 [IA] - Ref para cancelar cleanup function v1.2.20
  const total = quantity * denomination.value;
  
  // 🤖 [IA] - v1.1.16: Detectar si la app está en modo PWA standalone
  const [isStandalone, setIsStandalone] = useState(false);
  
  useEffect(() => {
    // Detectar PWA standalone mode
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };
    checkStandalone();
  }, []);
  
  // 🤖 [IA] - Actualizar ref cuando cambia inputValue v1.0.23
  inputValueRef.current = inputValue;

  // 🤖 [IA] - Usar hook de navegación unificado en lugar de lógica manual
  const { handleEnterNavigation } = useFieldNavigation([fieldName]);

  const { validateInput, getPattern, getInputMode } = useInputValidation(); // 🤖 [IA] - Hook de validación
  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - BUG #6 Fix: Evitar race conditions

  const handleInputChange = (value: string) => {
    if (isActive) {
      // 🤖 [IA] - Usar validación unificada para números enteros (denominaciones)
      const validation = validateInput(value, 'integer');
      if (validation.isValid) {
        setInputValue(validation.cleanValue);
      }
    }
  };

  // 🤖 [IA] - handleConfirm definido antes de uso en useEffect v1.0.23-fix
  // 🤖 [IA] - Memoizar handleConfirm para evitar re-renders v1.0.23
  const handleConfirm = useCallback(() => {
    if (isActive && inputValue !== "") {
      onConfirm(inputValue);
      setInputValue("");
      
      // 🤖 [IA] - Cancelar cleanup anterior si existe v1.2.20
      if (navigationTimeoutRef.current) {
        navigationTimeoutRef.current();
      }
      
      // 🤖 [IA] - v1.0.44: Fix navegación completa incluyendo bill100 → credomatic
      navigationTimeoutRef.current = createTimeoutWithCleanup(() => {
        // Orden completo de campos para navegación fluida
        const fieldOrder = [
          'penny', 'nickel', 'dime', 'quarter', 'dollarCoin',  // Monedas
          'bill1', 'bill5', 'bill10', 'bill20', 'bill50', 'bill100',  // Billetes
          'credomatic', 'promerica', 'bankTransfer', 'paypal'  // Pagos electrónicos
        ];
        
        const currentIndex = fieldOrder.indexOf(fieldName);
        const nextFieldName = currentIndex >= 0 && currentIndex < fieldOrder.length - 1 
          ? fieldOrder[currentIndex + 1] 
          : null;
        
        if (nextFieldName) {
          const nextInput = document.querySelector(`[data-field="${nextFieldName}"]`) as HTMLInputElement;
          if (nextInput) {
            nextInput.focus();
            nextInput.select();
            return;
          }
        }
        
        // Fallback al selector genérico si no encuentra el campo específico
        const nextActiveInput = document.querySelector('.input-field.active') as HTMLInputElement;
        if (nextActiveInput) {
          nextActiveInput.focus();
          nextActiveInput.select();
        }
      }, 'confirmation', `confirm_${fieldName}`);
    }
  }, [isActive, inputValue, onConfirm, fieldName, createTimeoutWithCleanup]);

  // Auto-focus when field becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      // 🤖 [IA] - v1.1.16: Delay mayor para PWA standalone
      const focusDelay = isStandalone ? 300 : 100;
      
      const cleanup = createTimeoutWithCleanup(() => {
        inputRef.current?.focus();
        // En PWA, hacer click programático puede ayudar
        if (isStandalone) {
          inputRef.current?.click();
        }
        inputRef.current?.select();
      }, 'focus', `focus_${fieldName}`, focusDelay);
      
      return cleanup;
    }
  }, [isActive, fieldName, createTimeoutWithCleanup, isStandalone]);

  // 🤖 [IA] - Cleanup de la navegación cuando se desmonta el componente v1.2.20
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        navigationTimeoutRef.current();
      }
    };
  }, []);

  // 🤖 [IA] - Configurar touchend event para prevenir cierre de teclado móvil
  useEffect(() => {
    if (isActive && buttonRef.current) {
      const button = buttonRef.current;
      
      // 🤖 [IA] - Usar ref para evitar stale closure v1.0.23-fix
      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        // 🤖 [IA] - Simplificado: handleConfirm ya maneja todo v1.0.23-fix
        handleConfirm();
      };

      button.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        button.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isActive, handleConfirm]); // 🤖 [IA] - Dependencias actualizadas v1.0.23

  // 🤖 [IA] - Auto-confirmar al perder foco para navegación con flechas iOS
  const handleBlur = useCallback(() => {
    if (isActive && inputValue !== "") {
      handleConfirm();
    }
  }, [isActive, inputValue, handleConfirm]); // 🤖 [IA] - Memoizado para consistencia v1.0.23

  /* 🤖 [IA] - Usar hook de navegación unificado en lugar de lógica manual */
  const handleKeyPress = handleEnterNavigation(fieldName, () => {
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
      className={cn(
        "guided-denomination-item",
        isActive && "active",
        isCompleted && "completed",
        !isAccessible && "blocked"
      )}
      whileHover={isAccessible ? { scale: 1.01, y: -1 } : {}}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      onClick={handleClick}
    >
      <div className="flex items-center gap-4">
        {/* Enhanced Status Icon with Glow */}
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

        {/* Enhanced Visual representation */}
        <div className={cn(
          "flex-shrink-0 transition-all duration-300",
          type === "coin" 
            ? "coin-badge" 
            : "bill-badge",
          !isAccessible && "grayscale opacity-50 blur-sm"
        )}>
          {type === "coin" ? (
            <span className="text-sm font-bold">¢</span>
          ) : (
            <span className="text-sm font-bold">$</span>
          )}
        </div>
        
        <Label className={cn(
          "text-base font-semibold flex-1 transition-all duration-300",
          isActive && "text-primary glow",
          isCompleted && "text-success",
          !isAccessible && "text-muted-foreground"
        )}>
          {denomination.name}
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
        <Input
          ref={inputRef}
          type="tel" // 🤖 [IA] - v1.1.15: Cambiado de "text" a "tel" para mejor activación del teclado numérico
          inputMode={getInputMode('integer')} // 🤖 [IA] - Teclado numérico optimizado para móvil
          pattern={getPattern('integer')} // 🤖 [IA] - Patrón para validación y teclado iOS
          min="0"
          value={isCompleted ? quantity.toString() : inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyPress}
          onBlur={handleBlur} // 🤖 [IA] - Auto-confirmar al navegar con flechas
          // 🤖 [IA] - v1.1.16: Handlers adicionales para PWA standalone
          onClick={(e) => {
            if (isStandalone && isActive) {
              e.currentTarget.focus();
              e.currentTarget.select();
            }
          }}
          onTouchStart={(e) => {
            if (isStandalone && isActive) {
              // Prevenir comportamiento por defecto y forzar focus
              e.stopPropagation();
              setTimeout(() => {
                e.currentTarget.focus();
              }, 50);
            }
          }}
          autoCapitalize="off"  // Prevenir capitalización en iOS
          autoCorrect="off"     // Desactivar autocorrección
          autoComplete="off"    // Desactivar autocompletado
          placeholder={isActive ? "Ingrese cantidad..." : "0"}
          disabled={!isActive}
          tabIndex={isActive ? tabIndex : -1} // 🤖 [IA] - Orden de navegación con flechas
          data-field={fieldName} /* 🤖 [IA] - Usar fieldName para navegación precisa v1.0.23 */
          className={cn(
            "input-field text-center text-lg font-semibold flex-1 h-12 md:h-10",
            // 🤖 [IA] - Altura consistente con el botón para mejor alineación
            isActive && "active",
            isCompleted && "completed",
            !isAccessible && "blocked"
          )}
        />
        
        {isActive && (
          <Button
            ref={buttonRef}
            onClick={handleConfirm}
            disabled={!inputValue}
            size="sm"
            variant="guided-numeric-confirm"
            data-context="denomination"
            // 🤖 [IA] - v1.1.15: Removidos preventDefaults que bloqueaban el teclado móvil
            // 🤖 [IA] - Botón más grande en móviles (48px) para mejor accesibilidad
          >
            ⏎
          </Button>
        )}
      </div>
      
      {isCompleted && quantity > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="floating-badge success text-center"
        >
          Total: ${total.toFixed(2)}
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