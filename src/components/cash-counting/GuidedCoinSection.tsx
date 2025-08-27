import { motion } from "framer-motion";
import { DENOMINATIONS } from "@/types/cash";
import { GuidedDenominationItem } from "@/components/ui/GuidedDenominationItem";
import { GuidedFieldView } from "./GuidedFieldView";
import { CashCount } from "@/types/cash";

interface GuidedCoinSectionProps {
  cashCount: CashCount;
  isFieldActive: (fieldName: string) => boolean;
  isFieldCompleted: (fieldName: string) => boolean;
  isFieldAccessible: (fieldName: string) => boolean;
  onFieldConfirm: (value: string) => void;
  onAttemptAccess: () => void;
  isMorningCount?: boolean;
}

export const GuidedCoinSection = ({
  cashCount,
  isFieldActive,
  isFieldCompleted,
  isFieldAccessible,
  onFieldConfirm,
  onAttemptAccess,
  isMorningCount = false
}: GuidedCoinSectionProps) => {
  const coinTotal = Object.entries(DENOMINATIONS.COINS).reduce((sum, [key, denomination]) => {
    const quantity = cashCount[key as keyof CashCount] as number;
    return sum + (quantity * denomination.value);
  }, 0);

  const completedCoins = Object.keys(DENOMINATIONS.COINS).filter(key => 
    isFieldCompleted(key)
  ).length;

  // Encontrar el campo activo actual para vista guiada
  const activeField = Object.keys(DENOMINATIONS.COINS).find(key => isFieldActive(key));
  
  // Construir lista de campos completados
  const completedFields = Object.entries(DENOMINATIONS.COINS)
    .filter(([key]) => isFieldCompleted(key))
    .map(([key, denomination]) => ({
      name: denomination.name,
      quantity: cashCount[key as keyof CashCount] as number,
      total: (cashCount[key as keyof CashCount] as number) * denomination.value
    }));

  // Calcular el paso actual en el flujo guiado
  const coinSteps = Object.keys(DENOMINATIONS.COINS).indexOf(activeField || '');
  const currentStep = coinSteps >= 0 ? coinSteps + 1 : 0;

  // 🤖 [IA] - v1.0.95: Unificación desktop/móvil - Mostrar vista guiada para ambas plataformas
  if (activeField) {
    const denomination = DENOMINATIONS.COINS[activeField as keyof typeof DENOMINATIONS.COINS];
    return (
      <GuidedFieldView
        key="coin-guided-view" // 🤖 [IA] - v1.1.16: Key fija para mantener el componente en el DOM
        currentFieldName={activeField}
        currentFieldLabel={denomination.name}
        currentFieldValue={cashCount[activeField as keyof CashCount] as number}
        currentFieldType="coin"
        isActive={isFieldActive(activeField)}
        isCompleted={isFieldCompleted(activeField)}
        onConfirm={onFieldConfirm}
        currentStep={currentStep}
        totalSteps={17} // Total de pasos en el conteo guiado
        completedFields={completedFields}
        isMorningCount={isMorningCount}
      />
    );
  }

  // Vista desktop (grid tradicional)
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

      {/* 🤖 [IA] - Form necesario para activar flechas de navegación en iOS Safari */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(DENOMINATIONS.COINS).map(([key, denomination], index) => (
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
              tabIndex={index + 1} // 🤖 [IA] - Índice secuencial para navegación con flechas
            />
          ))}
        </div>
      </form>

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