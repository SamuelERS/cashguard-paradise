import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, Lock, ArrowRight } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GuidedDenominationItemProps {
  denomination: {
    name: string;
    value: number;
  };
  fieldName: string;
  quantity: number;
  type: "coin" | "bill";
  isActive: boolean;
  isCompleted: boolean;
  isAccessible: boolean;
  onConfirm: (value: string) => void;
  onAttemptAccess?: () => void;
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
  onAttemptAccess
}: GuidedDenominationItemProps) => {
  const [inputValue, setInputValue] = useState(isCompleted ? quantity.toString() : "");
  const inputRef = useRef<HTMLInputElement>(null);
  const total = quantity * denomination.value;

  // Auto-focus when field becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isActive]);

  const handleInputChange = (value: string) => {
    if (isActive) {
      setInputValue(value);
    }
  };

  const handleConfirm = () => {
    if (isActive && inputValue !== "") {
      onConfirm(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isActive && inputValue !== "") {
      e.preventDefault();
      handleConfirm();
      // Auto-focus next field would happen naturally due to state change
    }
  };

  const handleClick = () => {
    if (!isAccessible && onAttemptAccess) {
      onAttemptAccess();
    }
  };

  return (
    <motion.div 
      className={cn(
        "glass-card space-y-3 p-5 transition-all duration-500",
        isActive && "border-2 border-primary/40 shadow-lg shadow-primary/30",
        isCompleted && "border-2 border-success/60 bg-success/5",
        !isAccessible && "opacity-30 cursor-not-allowed"
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
          type="number"
          min="0"
          value={isCompleted ? quantity.toString() : inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isActive ? "Ingrese cantidad..." : "0"}
          disabled={!isActive}
          className={cn(
            "input-field text-center text-lg font-semibold flex-1",
            isActive && "active",
            isCompleted && "completed",
            !isAccessible && "blocked"
          )}
        />
        
        {isActive && (
          <Button
            onClick={handleConfirm}
            disabled={!inputValue}
            size="sm"
            className="btn-primary px-6 py-2 text-lg"
          >
            ✓
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