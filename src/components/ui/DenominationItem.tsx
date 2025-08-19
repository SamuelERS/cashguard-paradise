import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
  const total = quantity * denomination.value;

  return (
    <motion.div 
      className="space-y-2"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center gap-2">
        {/* Visual representation */}
        <div className={cn(
          "flex-shrink-0 shadow-lg",
          type === "coin" 
            ? "w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-yellow-500/30" 
            : "w-10 h-6 rounded bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-green-500/20"
        )}>
          {type === "coin" ? (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-inner flex items-center justify-center">
              <span className="text-xs font-bold text-yellow-900">¢</span>
            </div>
          ) : (
            <div className="w-full h-full rounded bg-gradient-to-br from-green-300 to-green-500 shadow-inner flex items-center justify-center">
              <span className="text-xs font-bold text-green-900">$</span>
            </div>
          )}
        </div>
        
        <Label className="text-sm font-medium flex-1">{denomination.name}</Label>
      </div>
      
      <Input
        type="number"
        min="0"
        value={quantity}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0"
        readOnly={readonly}
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
      
      {quantity > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-xs text-center text-muted-foreground"
        >
          Total: ${total.toFixed(2)}
        </motion.div>
      )}
    </motion.div>
  );
};