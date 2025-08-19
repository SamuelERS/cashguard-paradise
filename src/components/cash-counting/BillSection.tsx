import { motion } from "framer-motion";
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
    <div className="glass-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="bill-badge"
              animate={{ scale: readonly ? 1 : [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: readonly ? 0 : Infinity }}
            >
              <span>$</span>
            </motion.div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--accent-money)' }}>Billetes</h3>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-70">Total</p>
            <p className="text-lg font-bold total-amount">${billTotal.toFixed(2)}</p>
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
            className="mt-4 p-3 rounded-lg"
            style={{ 
              background: 'rgba(0, 208, 132, 0.1)', 
              border: '1px solid rgba(0, 208, 132, 0.3)' 
            }}
          >
            <p className="text-sm text-center" style={{ color: 'var(--accent-money)' }}>
              💵 {billTotal.toFixed(2)} dólares en billetes contabilizados
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};