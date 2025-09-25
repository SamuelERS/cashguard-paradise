// 🤖 [IA] - v1.0.70: Glass Effect Premium aplicado a DenominationItem
import { useState, useRef, useEffect, useCallback } from "react"; // 🤖 [IA] - Agregar hooks para mejoras móviles v1.0.24
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useFieldNavigation } from "@/hooks/useFieldNavigation";
import { useInputValidation } from "@/hooks/useInputValidation"; // 🤖 [IA] - Hook de validación unificada
import { useTimingConfig } from "@/hooks/useTimingConfig"; // 🤖 [IA] - Timing unificado v1.0.24

interface DenominationItemProps {
  denomination: {
    name: string;
    value: number;
  };
  quantity: number;
  onChange: (value: string) => void;
  type: "coin" | "bill";
  readonly?: boolean;
}

export const DenominationItem = ({ 
  denomination, 
  quantity, 
  onChange, 
  type, 
  readonly = false 
}: DenominationItemProps) => {
  const [localValue, setLocalValue] = useState(quantity.toString()); // 🤖 [IA] - Estado local para mejor control v1.0.24
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(localValue); // 🤖 [IA] - Ref para evitar stale closures v1.0.24
  const total = quantity * denomination.value;

  // 🤖 [IA] - Actualizar ref cuando cambia el valor v1.0.24
  valueRef.current = localValue;

  // 🤖 [IA] - Sincronizar con prop quantity cuando cambia externamente v1.0.24
  useEffect(() => {
    setLocalValue(quantity.toString());
  }, [quantity]);

  // 🤖 [IA] - Usar hook de navegación unificado en lugar de lógica manual
  const { handleEnterNavigation } = useFieldNavigation([denomination.name]);
  const { validateInput, getPattern, getInputMode } = useInputValidation(); // 🤖 [IA] - Hook de validación
  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Timing unificado v1.0.24

  // 🤖 [IA] - Memoizar handleInputChange para evitar re-renders v1.0.24
  const handleInputChange = useCallback((value: string) => {
    if (!readonly) {
      const validation = validateInput(value, 'integer');
      if (validation.isValid) {
        setLocalValue(validation.cleanValue);
        onChange(validation.cleanValue);
      }
    }
  }, [readonly, validateInput, onChange]);

  // 🤖 [IA] - Manejar focus para mejor persistencia del teclado móvil v1.0.24
  const handleFocus = useCallback(() => {
    if (inputRef.current && !readonly) {
      inputRef.current.select();
    }
  }, [readonly]);

  // 🤖 [IA] - Manejar blur para confirmar valor v1.0.24
  const handleBlur = useCallback(() => {
    if (!readonly && valueRef.current !== quantity.toString()) {
      onChange(valueRef.current);
    }
  }, [readonly, quantity, onChange]);

  return (
    <motion.div 
      style={{
        backgroundColor: quantity > 0 ? 'rgba(0, 186, 124, 0.05)' : 'rgba(36, 36, 36, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: quantity > 0 ? '2px solid rgba(0, 186, 124, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        transition: 'all 0.5s'
      }}
      className="space-y-3"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-3">
        {/* Enhanced Visual representation with Value Label */}
        <div className={cn(
          "flex-shrink-0 flex flex-col items-center justify-center",
          type === "coin"
            ? "coin-badge"
            : "bill-badge"
        )}>
          {type === "coin" ? (
            <span className="text-sm font-bold">¢</span>
          ) : (
            <span className="text-sm font-bold">$</span>
          )}
          <span className="text-xs font-medium mt-0.5 opacity-90">
            {denomination.name}
          </span>
        </div>
        
        <Label className={cn(
          "text-sm font-semibold flex-1 transition-all duration-300",
          quantity > 0 && "text-success"
        )}>{denomination.name}</Label>
      </div>
      
      <Input
        ref={inputRef}
        type="text" // 🤖 [IA] - Cambiado de number a text para mejor UX móvil
        inputMode={getInputMode('integer')} // 🤖 [IA] - Teclado numérico optimizado para móvil
        pattern={getPattern('integer')} // 🤖 [IA] - Patrón para validación y teclado iOS
        min="0"
        value={localValue}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus} // 🤖 [IA] - Seleccionar texto al enfocar v1.0.24
        onBlur={handleBlur} // 🤖 [IA] - Confirmar valor al desenfocar v1.0.24
        /* 🤖 [IA] - Usar hook de navegación unificado en lugar de lógica manual */
        onKeyDown={handleEnterNavigation(denomination.name, () => {
          if (inputRef.current) {
            inputRef.current.blur(); // Confirmar al presionar Enter
          }
        })}
        onMouseDown={(e) => {
          if (!readonly) {
            e.stopPropagation(); // 🤖 [IA] - Prevenir cierre de teclado móvil v1.0.24
          }
        }}
        onTouchStart={(e) => {
          if (!readonly) {
            e.stopPropagation(); // 🤖 [IA] - Prevenir cierre de teclado en touch v1.0.24
          }
        }}
        placeholder="0"
        readOnly={readonly}
        data-field={denomination.name}
        className={cn(
          "text-center transition-all duration-200",
          readonly 
            ? "bg-muted/50 cursor-not-allowed opacity-75" 
            : "bg-input/50 hover:bg-input/70 focus:bg-input/90",
          type === "coin" 
            ? "border-warning/30 focus:border-warning" 
            : "border-success/30 focus:border-success"
        )}
      />
      
      {parseInt(localValue) > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="floating-badge success text-center"
        >
          Total: ${(parseInt(localValue) * denomination.value).toFixed(2)}
        </motion.div>
      )}
    </motion.div>
  );
};