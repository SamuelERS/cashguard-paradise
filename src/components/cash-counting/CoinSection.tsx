// 🤖 [IA] - v1.0.70: Glass Effect Premium aplicado a modo manual
import { motion } from "framer-motion";
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

  const completedCoins = Object.entries(DENOMINATIONS.COINS).filter(([key]) => {
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
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warning via-warning/80 to-warning/60 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">¢</span>
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{
              background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Monedas</h3>
            <p className="text-sm text-text-secondary">
              {completedCoins} de {Object.keys(DENOMINATIONS.COINS).length} ingresadas
            </p>
          </div>
        </div>
        
        <motion.div 
          className="text-right"
          key={coinTotal}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-sm text-text-secondary">Total en Monedas</div>
          <div className="text-2xl font-bold text-warning">
            ${coinTotal.toFixed(2)}
          </div>
        </motion.div>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center bg-warning/10 text-warning px-4 py-2 rounded-lg"
          >
            💰 Total en monedas: ${coinTotal.toFixed(2)}
          </motion.div>
        )}
    </div>
  );
};