import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/GlassCard";
import { DenominationItem } from "@/components/ui/DenominationItem";
import { DENOMINATIONS, CashCount } from "@/types/cash";

interface CoinSectionProps {
  cashCount: CashCount;
  onChange: (denomination: string, value: string) => void;
  readonly?: boolean;
}

export const CoinSection = ({ cashCount, onChange, readonly = false }: CoinSectionProps) => {
  const coinTotal = Object.entries(DENOMINATIONS.COINS).reduce((sum, [key, denom]) => {
    const quantity = cashCount[key as keyof CashCount] || 0;
    return sum + (quantity * denom.value);
  }, 0);

  return (
    <div className="glass-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="coin-badge"
              animate={{ rotate: readonly ? 0 : [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: readonly ? 0 : Infinity }}
            >
              <span>¢</span>
            </motion.div>
            <h3 className="text-xl font-bold" style={{ color: 'var(--accent-gold)' }}>Monedas</h3>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-70">Total</p>
            <p className="text-lg font-bold total-amount">${coinTotal.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(DENOMINATIONS.COINS).map(([key, denom]) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Object.keys(DENOMINATIONS.COINS).indexOf(key) * 0.1 }}
            >
              <DenominationItem
                denomination={denom}
                quantity={cashCount[key as keyof CashCount] || 0}
                onChange={(value) => onChange(key, value)}
                type="coin"
                readonly={readonly}
              />
            </motion.div>
          ))}
        </div>
        
        {coinTotal > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 p-3 rounded-lg"
            style={{ 
              background: 'rgba(255, 215, 0, 0.1)', 
              border: '1px solid rgba(255, 215, 0, 0.3)' 
            }}
          >
            <p className="text-sm text-center" style={{ color: 'var(--accent-gold)' }}>
              💰 {coinTotal.toFixed(2)} dólares en monedas contabilizados
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};