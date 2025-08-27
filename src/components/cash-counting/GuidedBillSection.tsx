import { motion } from "framer-motion";
import { DENOMINATIONS } from "@/types/cash";
import { GuidedDenominationItem } from "@/components/ui/GuidedDenominationItem";
import { GuidedFieldView } from "./GuidedFieldView";
import { CashCount } from "@/types/cash";

interface GuidedBillSectionProps {
  cashCount: CashCount;
  isFieldActive: (fieldName: string) => boolean;
  isFieldCompleted: (fieldName: string) => boolean;
  isFieldAccessible: (fieldName: string) => boolean;
  onFieldConfirm: (value: string) => void;
  onAttemptAccess: () => void;
  isMorningCount?: boolean;
}

export const GuidedBillSection = ({
  cashCount,
  isFieldActive,
  isFieldCompleted,
  isFieldAccessible,
  onFieldConfirm,
  onAttemptAccess,
  isMorningCount = false
}: GuidedBillSectionProps) => {
  const billTotal = Object.entries(DENOMINATIONS.BILLS).reduce((sum, [key, denomination]) => {
    const quantity = cashCount[key as keyof CashCount] as number;
    return sum + (quantity * denomination.value);
  }, 0);

  const completedBills = Object.keys(DENOMINATIONS.BILLS).filter(key => 
    isFieldCompleted(key)
  ).length;

  // Encontrar el campo activo actual para vista guiada
  const activeField = Object.keys(DENOMINATIONS.BILLS).find(key => isFieldActive(key));
  
  // Construir lista de campos completados
  const completedFields = Object.entries(DENOMINATIONS.BILLS)
    .filter(([key]) => isFieldCompleted(key))
    .map(([key, denomination]) => ({
      name: denomination.name,
      quantity: cashCount[key as keyof CashCount] as number,
      total: (cashCount[key as keyof CashCount] as number) * denomination.value
    }));

  // También incluir las monedas completadas si las hay
  const allCompletedFields = [
    ...Object.entries(DENOMINATIONS.COINS)
      .filter(([key]) => isFieldCompleted(key))
      .map(([key, denomination]) => ({
        name: denomination.name,
        quantity: cashCount[key as keyof CashCount] as number,
        total: (cashCount[key as keyof CashCount] as number) * denomination.value
      })),
    ...completedFields
  ];

  // Calcular el paso actual (billetes vienen después de las monedas en el flujo guiado)
  const billSteps = Object.keys(DENOMINATIONS.BILLS).indexOf(activeField || '');
  const coinCount = Object.keys(DENOMINATIONS.COINS).length;
  const currentStep = billSteps >= 0 ? coinCount + billSteps + 1 : 0;

  // 🤖 [IA] - v1.0.95: Unificación desktop/móvil - Mostrar vista guiada para ambas plataformas
  if (activeField) {
    const denomination = DENOMINATIONS.BILLS[activeField as keyof typeof DENOMINATIONS.BILLS];
    return (
      <GuidedFieldView
        key="bill-guided-view" // 🤖 [IA] - v1.1.16: Key fija para mantener el componente en el DOM
        currentFieldName={activeField}
        currentFieldLabel={denomination.name}
        currentFieldValue={cashCount[activeField as keyof CashCount] as number}
        currentFieldType="bill"
        isActive={isFieldActive(activeField)}
        isCompleted={isFieldCompleted(activeField)}
        onConfirm={onFieldConfirm}
        currentStep={currentStep}
        totalSteps={17} // Total de pasos en el conteo guiado
        completedFields={allCompletedFields}
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

      {/* 🤖 [IA] - Form necesario para activar flechas de navegación en iOS Safari */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(DENOMINATIONS.BILLS).map(([key, denomination], index) => (
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
              tabIndex={index + 6} // 🤖 [IA] - Offset +6 (después de 5 monedas)
            />
          ))}
        </div>
      </form>

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