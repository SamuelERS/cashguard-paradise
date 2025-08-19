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
    <GlassCard hover={!readonly}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg shadow-yellow-500/30 flex items-center justify-center"
              animate={{ rotate: readonly ? 0 : [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: readonly ? 0 : Infinity }}
            >
              <span className="text-yellow-900 font-bold">¢</span>
            </motion.div>
            <h3 className="text-xl font-bold text-warning">Monedas</h3>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-warning">${coinTotal.toFixed(2)}</p>
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
            className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg"
          >
            <p className="text-sm text-warning/80 text-center">
              💰 {coinTotal.toFixed(2)} dólares en monedas contabilizados
            </p>
          </motion.div>
        )}
      </div>
    </GlassCard>
  );
};