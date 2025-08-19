import { useState } from "react";
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
  const total = quantity * denomination.value;

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
        "space-y-3 p-4 rounded-lg border-2 transition-all duration-300",
        isActive && "border-accent-primary bg-glass-bg shadow-lg shadow-accent-glow",
        isCompleted && "border-success bg-success/10",
        !isAccessible && "border-bg-tertiary bg-bg-secondary/50 opacity-60"
      )}
      whileHover={isAccessible ? { scale: 1.02 } : {}}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
    >
      <div className="flex items-center gap-3">
        {/* Status Icon */}
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isCompleted && "bg-success text-white",
          isActive && "bg-accent-primary text-white animate-pulse",
          !isAccessible && "bg-bg-tertiary text-text-muted"
        )}>
          {isCompleted ? (
            <Check className="w-4 h-4" />
          ) : isActive ? (
            <ArrowRight className="w-4 h-4" />
          ) : (
            <Lock className="w-4 h-4" />
          )}
        </div>

        {/* Visual representation */}
        <div className={cn(
          "flex-shrink-0 shadow-lg",
          type === "coin" 
            ? "w-8 h-8 rounded-full bg-gradient-to-br from-warning/80 via-warning to-warning/60" 
            : "w-10 h-6 rounded bg-gradient-to-br from-success/80 via-success to-success/60",
          !isAccessible && "grayscale opacity-50"
        )}>
          {type === "coin" ? (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-warning/60 to-warning shadow-inner flex items-center justify-center">
              <span className="text-xs font-bold text-white">¢</span>
            </div>
          ) : (
            <div className="w-full h-full rounded bg-gradient-to-br from-success/60 to-success shadow-inner flex items-center justify-center">
              <span className="text-xs font-bold text-white">$</span>
            </div>
          )}
        </div>
        
        <Label className={cn(
          "text-sm font-medium flex-1",
          isActive && "text-accent-primary font-bold",
          isCompleted && "text-success",
          !isAccessible && "text-text-muted"
        )}>
          {denomination.name}
        </Label>

        {isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs bg-accent-primary text-white px-2 py-1 rounded-full"
          >
            ACTIVO
          </motion.div>
        )}
      </div>
      
      <div className="flex gap-2">
        <Input
          type="number"
          min="0"
          value={isCompleted ? quantity.toString() : inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isActive ? "Ingrese cantidad..." : "0"}
          disabled={!isActive}
          className={cn(
            "text-center transition-all duration-200 flex-1",
            isActive && "bg-glass-bg border-accent-primary focus:border-accent-primary focus:ring-2 focus:ring-accent-glow",
            isCompleted && "bg-success/10 border-success cursor-default",
            !isAccessible && "bg-bg-secondary border-bg-tertiary cursor-not-allowed",
            type === "coin" 
              ? "border-warning/30" 
              : "border-success/30"
          )}
        />
        
        {isActive && (
          <Button
            onClick={handleConfirm}
            disabled={!inputValue}
            size="sm"
            className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4"
          >
            ✓
          </Button>
        )}
      </div>
      
      {isCompleted && quantity > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs text-center bg-success/20 text-success px-3 py-1 rounded-full"
        >
          Total: ${total.toFixed(2)}
        </motion.div>
      )}

      {!isAccessible && (
        <div className="text-xs text-center text-text-muted bg-bg-tertiary/50 px-3 py-1 rounded-full">
          Debe completar el campo actual antes de continuar
        </div>
      )}
    </motion.div>
  );
};