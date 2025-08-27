// 🤖 [IA] - v1.0.70: Glass Effect Premium aplicado a modo manual
import { motion } from "framer-motion";
import { CreditCard, Building, ArrowLeftRight, Wallet } from "lucide-react";
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
  { key: 'credomatic', name: 'Credomatic', icon: CreditCard, color: 'text-blue-400' },
  { key: 'promerica', name: 'Promerica', icon: Building, color: 'text-green-500' },
  { key: 'bankTransfer', name: 'Transferencia Bancaria', icon: ArrowLeftRight, color: 'text-accent-light' },
  { key: 'paypal', name: 'PayPal', icon: Wallet, color: 'text-indigo-400' },
];

export const ElectronicSection = ({ electronicPayments, onChange, readonly = false }: ElectronicSectionProps) => {
  const totalElectronic = Object.values(electronicPayments).reduce((sum, val) => sum + val, 0);
  
  const completedPayments = paymentMethods.filter(method => {
    const value = electronicPayments[method.key as keyof ElectronicPayments] || 0;
    return value > 0;
  }).length;

  return (
    <div style={{
      backgroundColor: 'rgba(36, 36, 36, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-primary via-accent-primary/80 to-accent-secondary flex items-center justify-center shadow-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{
              background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Pagos Electrónicos</h3>
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