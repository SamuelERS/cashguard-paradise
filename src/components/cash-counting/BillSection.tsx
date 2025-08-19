import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { DenominationItem } from "@/components/ui/DenominationItem";
import { DENOMINATIONS, CashCount } from "@/types/cash";

interface BillSectionProps {
  cashCount: CashCount;
  onChange: (denomination: string, value: string) => void;
  readonly?: boolean;
}

export const BillSection = ({ cashCount, onChange, readonly = false }: BillSectionProps) => {
  const billTotal = Object.entries(DENOMINATIONS.BILLS).reduce((sum, [key, denom]) => {
    const quantity = cashCount[key as keyof CashCount] || 0;
    return sum + (quantity * denom.value);
  }, 0);

  return (
    <GlassCard hover={!readonly}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-8 rounded bg-gradient-to-br from-green-400 via-green-500 to-green-600 shadow-lg shadow-green-500/20 flex items-center justify-center relative overflow-hidden"
              animate={{ scale: readonly ? 1 : [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: readonly ? 0 : Infinity }}
            >
              {/* Security pattern */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-300/30 to-transparent transform skew-x-12" />
              <span className="relative text-green-900 font-bold text-sm">$</span>
            </motion.div>
            <h3 className="text-xl font-bold text-success">Billetes</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-success">${billTotal.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(DENOMINATIONS.BILLS).map(([key, denom]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: Object.keys(DENOMINATIONS.BILLS).indexOf(key) * 0.1 }}
            >
              <DenominationItem
                denomination={denom}
                quantity={cashCount[key as keyof CashCount] || 0}
                onChange={(value) => onChange(key, value)}
                type="bill"
                readonly={readonly}
              />
            </motion.div>
          ))}
        </div>
        
        {billTotal > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg"
          >
            <p className="text-sm text-success/80 text-center">
              💵 {billTotal.toFixed(2)} dólares en billetes contabilizados
            </p>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
};