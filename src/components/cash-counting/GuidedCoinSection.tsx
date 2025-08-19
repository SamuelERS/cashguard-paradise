import { motion } from "framer-motion";
import { DENOMINATIONS } from "@/types/cash";
import { GuidedDenominationItem } from "@/components/ui/GuidedDenominationItem";
import { CashCount } from "@/types/cash";

interface GuidedCoinSectionProps {
  cashCount: CashCount;
  isFieldActive: (fieldName: string) => boolean;
  isFieldCompleted: (fieldName: string) => boolean;
  isFieldAccessible: (fieldName: string) => boolean;
  onFieldConfirm: (value: string) => void;
  onAttemptAccess: () => void;
}

export const GuidedCoinSection = ({
  cashCount,
  isFieldActive,
  isFieldCompleted,
  isFieldAccessible,
  onFieldConfirm,
  onAttemptAccess
}: GuidedCoinSectionProps) => {
  const coinTotal = Object.entries(DENOMINATIONS.COINS).reduce((sum, [key, denomination]) => {
    const quantity = cashCount[key as keyof CashCount] as number;
    return sum + (quantity * denomination.value);
  }, 0);

  const completedCoins = Object.keys(DENOMINATIONS.COINS).filter(key => 
    isFieldCompleted(key)
  ).length;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-warning via-warning/80 to-warning/60 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">¢</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-warning">Monedas</h3>
            <p className="text-sm text-text-secondary">
              {completedCoins} de {Object.keys(DENOMINATIONS.COINS).length} completadas
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(DENOMINATIONS.COINS).map(([key, denomination]) => (
          <GuidedDenominationItem
            key={key}
            denomination={denomination}
            fieldName={key}
            quantity={cashCount[key as keyof CashCount] as number}
            type="coin"
            isActive={isFieldActive(key)}
            isCompleted={isFieldCompleted(key)}
            isAccessible={isFieldAccessible(key)}
            onConfirm={onFieldConfirm}
            onAttemptAccess={onAttemptAccess}
          />
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