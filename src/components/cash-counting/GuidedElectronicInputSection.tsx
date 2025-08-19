import { motion } from "framer-motion";
import { CreditCard, Building, ArrowLeftRight, Wallet, Check, Lock, ArrowRight } from "lucide-react";
import { ElectronicPayments } from "@/types/cash";
import { GuidedDenominationItem } from "@/components/ui/GuidedDenominationItem";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface GuidedElectronicInputSectionProps {
  electronicPayments: ElectronicPayments;
  isFieldActive: (fieldName: string) => boolean;
  isFieldCompleted: (fieldName: string) => boolean;
  isFieldAccessible: (fieldName: string) => boolean;
  onFieldConfirm: (value: string) => void;
  onAttemptAccess: () => void;
}

const paymentMethods = [
  {
    key: 'credomatic',
    name: 'Credomatic',
    icon: CreditCard,
    color: 'text-blue-400',
    borderColor: 'border-blue-400/30'
  },
  {
    key: 'promerica',
    name: 'Promerica',
    icon: Building,
    color: 'text-green-500',
    borderColor: 'border-green-500/30'
  },
  {
    key: 'bankTransfer',
    name: 'Transferencia Bancaria',
    icon: ArrowLeftRight,
    color: 'text-accent-light',
    borderColor: 'border-accent-light/30'
  },
  {
    key: 'paypal',
    name: 'PayPal',
    icon: Wallet,
    color: 'text-indigo-400',
    borderColor: 'border-indigo-400/30'
  }
];

export const GuidedElectronicInputSection = ({
  electronicPayments,
  isFieldActive,
  isFieldCompleted,
  isFieldAccessible,
  onFieldConfirm,
  onAttemptAccess
}: GuidedElectronicInputSectionProps) => {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  
  const totalElectronic = Object.values(electronicPayments).reduce((sum, val) => sum + val, 0);
  const completedPayments = paymentMethods.filter(method => isFieldCompleted(method.key)).length;

  const handleInputChange = (key: string, value: string) => {
    if (isFieldActive(key)) {
      setInputValues(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleConfirm = (key: string) => {
    const value = inputValues[key] || '0';
    onFieldConfirm(value);
    setInputValues(prev => ({
      ...prev,
      [key]: ''
    }));
  };

  const handleKeyPress = (key: string, e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isFieldActive(key)) {
      handleConfirm(key);
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-primary via-accent-primary/80 to-accent-secondary flex items-center justify-center shadow-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-accent-primary">Pagos Electrónicos</h3>
            <p className="text-sm text-text-secondary">
              {completedPayments} de {paymentMethods.length} completados
            </p>
          </div>
        </div>
        
        <motion.div 
          className="text-right"
          key={totalElectronic}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-sm text-text-secondary">Total Electrónico</div>
          <div className="text-2xl font-bold text-accent-primary">
            ${totalElectronic.toFixed(2)}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          const isActive = isFieldActive(method.key);
          const isCompleted = isFieldCompleted(method.key);
          const isAccessible = isFieldAccessible(method.key);
          const currentValue = electronicPayments[method.key as keyof ElectronicPayments];
          const inputValue = inputValues[method.key] || '';

          return (
            <motion.div
              key={method.key}
              className={cn(
                "p-4 rounded-lg border-2 transition-all duration-300",
                isActive && "border-accent-primary bg-glass-bg shadow-lg shadow-accent-glow",
                isCompleted && "border-success bg-success/10",
                !isAccessible && "border-bg-tertiary bg-bg-secondary/50 opacity-60"
              )}
              whileHover={isAccessible ? { scale: 1.02 } : {}}
              onClick={() => !isAccessible && onAttemptAccess()}
            >
              <div className="flex items-center gap-3 mb-3">
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

                <Icon className={cn("w-6 h-6", method.color, !isAccessible && "text-text-muted")} />
                <div className="flex-1">
                  <Label className={cn(
                    "text-sm font-medium",
                    isActive && "text-accent-primary font-bold",
                    isCompleted && "text-success",
                    !isAccessible && "text-text-muted"
                  )}>
                    {method.name}
                  </Label>
                  {isActive && (
                    <div className="text-xs bg-accent-primary text-white px-2 py-1 rounded-full inline-block mt-1">
                      ACTIVO
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={isCompleted ? currentValue.toString() : inputValue}
                    onChange={(e) => handleInputChange(method.key, e.target.value)}
                    onKeyPress={(e) => handleKeyPress(method.key, e)}
                    placeholder={isActive ? "0.00" : "0.00"}
                    disabled={!isActive}
                    className={cn(
                      "pl-8 text-center transition-all duration-200",
                      isActive && "bg-glass-bg border-accent-primary focus:border-accent-primary focus:ring-2 focus:ring-accent-glow",
                      isCompleted && "bg-success/10 border-success cursor-default",
                      !isAccessible && "bg-bg-secondary border-bg-tertiary cursor-not-allowed",
                      method.borderColor
                    )}
                  />
                </div>
                
                {isActive && (
                  <Button
                    onClick={() => handleConfirm(method.key)}
                    disabled={!inputValue}
                    size="sm"
                    className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4"
                  >
                    ✓
                  </Button>
                )}
              </div>

              {isCompleted && currentValue > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-3 text-xs text-center bg-success/20 text-success px-3 py-1 rounded-full"
                >
                  Confirmado: ${currentValue.toFixed(2)}
                </motion.div>
              )}

              {!isAccessible && (
                <div className="mt-3 text-xs text-center text-text-muted bg-bg-tertiary/50 px-3 py-1 rounded-full">
                  Debe completar el campo actual antes de continuar
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {totalElectronic > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center bg-accent-primary/10 text-accent-primary px-4 py-2 rounded-lg"
        >
          💳 Total en pagos electrónicos: ${totalElectronic.toFixed(2)}
        </motion.div>
      )}
    </div>
  );
};