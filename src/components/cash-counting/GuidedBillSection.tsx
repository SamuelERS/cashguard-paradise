import { motion } from "framer-motion";
import { DENOMINATIONS } from "@/types/cash";
import { GuidedDenominationItem } from "@/components/ui/GuidedDenominationItem";
import { CashCount } from "@/types/cash";

interface GuidedBillSectionProps {
  cashCount: CashCount;
  isFieldActive: (fieldName: string) => boolean;
  isFieldCompleted: (fieldName: string) => boolean;
  isFieldAccessible: (fieldName: string) => boolean;
  onFieldConfirm: (value: string) => void;
  onAttemptAccess: () => void;
}

export const GuidedBillSection = ({
  cashCount,
  isFieldActive,
  isFieldCompleted,
  isFieldAccessible,
  onFieldConfirm,
  onAttemptAccess
}: GuidedBillSectionProps) => {
  const billTotal = Object.entries(DENOMINATIONS.BILLS).reduce((sum, [key, denomination]) => {
    const quantity = cashCount[key as keyof CashCount] as number;
    return sum + (quantity * denomination.value);
  }, 0);

  const completedBills = Object.keys(DENOMINATIONS.BILLS).filter(key => 
    isFieldCompleted(key)
  ).length;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded bg-gradient-to-br from-success via-success/80 to-success/60 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">$</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-success">Billetes</h3>
            <p className="text-sm text-text-secondary">
              {completedBills} de {Object.keys(DENOMINATIONS.BILLS).length} completados
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(DENOMINATIONS.BILLS).map(([key, denomination]) => (
          <GuidedDenominationItem
            key={key}
            denomination={denomination}
            fieldName={key}
            quantity={cashCount[key as keyof CashCount] as number}
            type="bill"
            isActive={isFieldActive(key)}
            isCompleted={isFieldCompleted(key)}
            isAccessible={isFieldAccessible(key)}
            onConfirm={onFieldConfirm}
            onAttemptAccess={onAttemptAccess}
          />
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