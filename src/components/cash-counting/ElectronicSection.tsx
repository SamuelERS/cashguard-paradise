import { motion } from "framer-motion";
import { CreditCard, Smartphone, Building, Wallet } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ElectronicPayments } from "@/types/cash";
import { cn } from "@/lib/utils";

interface ElectronicSectionProps {
  electronicPayments: ElectronicPayments;
  onChange: (method: string, value: string) => void;
  readonly?: boolean;
}

const paymentMethods = [
  { key: 'credomatic', name: 'Credomatic', icon: CreditCard, color: 'text-blue-500' },
  { key: 'promerica', name: 'Promerica', icon: CreditCard, color: 'text-purple-500' },
  { key: 'bankTransfer', name: 'Transferencia', icon: Building, color: 'text-green-500' },
  { key: 'paypal', name: 'PayPal', icon: Wallet, color: 'text-blue-600' },
];

export const ElectronicSection = ({ electronicPayments, onChange, readonly = false }: ElectronicSectionProps) => {
  const totalElectronic = Object.values(electronicPayments).reduce((sum, val) => sum + val, 0);

  return (
    <GlassCard hover={!readonly}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="relative"
              animate={{ rotate: readonly ? 0 : [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: readonly ? 0 : Infinity }}
            >
              <CreditCard className="w-8 h-8 text-secondary" />
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full"
                animate={{ scale: readonly ? 1 : [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: readonly ? 0 : Infinity }}
              />
            </motion.div>
            <h3 className="text-xl font-bold text-secondary">Pagos Electrónicos</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-secondary">${totalElectronic.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentMethods.map((method, index) => {
            const IconComponent = method.icon;
            const value = electronicPayments[method.key as keyof ElectronicPayments] || 0;
            
            return (
              <motion.div
                key={method.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <IconComponent className={cn("w-5 h-5", method.color)} />
                  <Label className="text-sm font-medium">{method.name}</Label>
                </div>
                
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={value}
                    onChange={(e) => onChange(method.key, e.target.value)}
                    placeholder="0.00"
                    readOnly={readonly}
                    className={cn(
                      "pl-8 text-center transition-all duration-200",
                      readonly 
                        ? "bg-muted/50 cursor-not-allowed opacity-75" 
                        : "bg-input/50 hover:bg-input/70 focus:bg-input/90 border-secondary/30 focus:border-secondary"
                    )}
                  />
                </div>
                
                {value > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs text-center text-secondary/70"
                  >
                    ${value.toFixed(2)}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        {totalElectronic > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-secondary/10 border border-secondary/30 rounded-lg"
          >
            <p className="text-sm text-secondary/80 text-center">
              💳 {totalElectronic.toFixed(2)} dólares en pagos electrónicos contabilizados
            </p>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
};