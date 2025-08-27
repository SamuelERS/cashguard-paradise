// 🤖 [IA] - v1.0.70: Glass Effect Premium aplicado a modo manual
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

  const completedBills = Object.entries(DENOMINATIONS.BILLS).filter(([key]) => {
    const quantity = cashCount[key as keyof CashCount] || 0;
    return quantity > 0;
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
          <div className="w-12 h-12 rounded bg-gradient-to-br from-success via-success/80 to-success/60 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">$</span>
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{
              background: 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Billetes</h3>
            <p className="text-sm text-text-secondary">
              {completedBills} de {Object.keys(DENOMINATIONS.BILLS).length} ingresados
            </p>
          </div>
        </div>
        
        <motion.div 
          className="text-right"
          key={billTotal}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-sm text-text-secondary">Total en Billetes</div>
          <div className="text-2xl font-bold text-success">
            ${billTotal.toFixed(2)}
          </div>
        </motion.div>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center bg-success/10 text-success px-4 py-2 rounded-lg"
          >
            💵 Total en billetes: ${billTotal.toFixed(2)}
          </motion.div>
        )}
    </div>
  );
};