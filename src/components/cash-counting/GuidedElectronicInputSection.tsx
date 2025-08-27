// 🤖 [IA] - v1.0.26: Refactorizado para usar GuidedElectronicPaymentItem modular
import { motion } from "framer-motion";
import { CreditCard, Building, ArrowLeftRight, Wallet } from "lucide-react";
import { ElectronicPayments, CashCount } from "@/types/cash"; // 🤖 [IA] - v1.0.48: Agregado CashCount
import { GuidedElectronicPaymentItem } from "@/components/ui/GuidedElectronicPaymentItem"; // 🤖 [IA] - v1.0.26: Nuevo componente modular
import { GuidedFieldView } from "./GuidedFieldView";
import { DENOMINATIONS } from "@/types/cash";

interface GuidedElectronicInputSectionProps {
  electronicPayments: ElectronicPayments;
  cashCount?: CashCount; // 🤖 [IA] - v1.0.48: Agregado para calcular totales completos
  isFieldActive: (fieldName: string) => boolean;
  isFieldCompleted: (fieldName: string) => boolean;
  isFieldAccessible: (fieldName: string) => boolean;
  onFieldConfirm: (value: string) => void;
  onAttemptAccess: () => void;
}

// 🤖 [IA] - v1.0.26: Definición de métodos de pago mantenida sin cambios
const paymentMethods = [
  {
    key: 'credomatic',
    name: 'Credomatic',
    icon: CreditCard,
    color: 'text-blue-400',
    borderColor: 'border-blue-400/30'
  },
  {
    key: 'promerica',
    name: 'Promerica',
    icon: Building,
    color: 'text-green-500',
    borderColor: 'border-green-500/30'
  },
  {
    key: 'bankTransfer',
    name: 'Transferencia Bancaria',
    icon: ArrowLeftRight,
    color: 'text-accent-light',
    borderColor: 'border-accent-light/30'
  },
  {
    key: 'paypal',
    name: 'PayPal',
    icon: Wallet,
    color: 'text-indigo-400',
    borderColor: 'border-indigo-400/30'
  }
];

// 🤖 [IA] - v1.0.26: Componente refactorizado para usar GuidedElectronicPaymentItem
export const GuidedElectronicInputSection = ({
  electronicPayments,
  cashCount = {} as CashCount, // 🤖 [IA] - v1.0.48: Valor por defecto
  isFieldActive,
  isFieldCompleted,
  isFieldAccessible,
  onFieldConfirm,
  onAttemptAccess
}: GuidedElectronicInputSectionProps) => {
  const totalElectronic = Object.values(electronicPayments).reduce((sum, val) => sum + val, 0);
  const completedPayments = paymentMethods.filter(method => isFieldCompleted(method.key)).length;

  // Encontrar el campo activo actual para vista guiada
  const activeField = paymentMethods.find(method => isFieldActive(method.key));
  
  // 🤖 [IA] - v1.0.48: Construir lista COMPLETA de campos completados (monedas + billetes + electrónicos)
  const completedFieldsList = [
    // Monedas completadas
    ...Object.entries(DENOMINATIONS.COINS)
      .filter(([key]) => isFieldCompleted(key))
      .map(([key, denomination]) => ({
        name: denomination.name,
        quantity: cashCount[key as keyof CashCount] as number || 0,
        total: ((cashCount[key as keyof CashCount] as number) || 0) * denomination.value
      })),
    // Billetes completados
    ...Object.entries(DENOMINATIONS.BILLS)
      .filter(([key]) => isFieldCompleted(key))
      .map(([key, denomination]) => ({
        name: denomination.name,
        quantity: cashCount[key as keyof CashCount] as number || 0,
        total: ((cashCount[key as keyof CashCount] as number) || 0) * denomination.value
      })),
    // Pagos electrónicos completados
    ...paymentMethods
      .filter(method => isFieldCompleted(method.key))
      .map(method => ({
        name: method.name,
        quantity: 1, // Los pagos electrónicos no tienen cantidad, solo monto
        total: electronicPayments[method.key as keyof ElectronicPayments]
      }))
  ];

  // Calcular el paso actual
  const electronicStepIndex = paymentMethods.findIndex(m => m.key === activeField?.key);
  const coinCount = Object.keys(DENOMINATIONS.COINS).length;
  const billCount = Object.keys(DENOMINATIONS.BILLS).length;
  const currentStep = electronicStepIndex >= 0 ? coinCount + billCount + electronicStepIndex + 1 : 0;

  // 🤖 [IA] - v1.0.95: Unificación desktop/móvil - Mostrar vista guiada para ambas plataformas
  if (activeField) {
    return (
      <GuidedFieldView
        key="electronic-guided-view" // 🤖 [IA] - v1.1.16: Key fija para mantener el componente en el DOM
        currentFieldName={activeField.key}
        currentFieldLabel={activeField.name}
        currentFieldValue={electronicPayments[activeField.key as keyof ElectronicPayments]}
        currentFieldType="electronic"
        isActive={isFieldActive(activeField.key)}
        isCompleted={isFieldCompleted(activeField.key)}
        onConfirm={onFieldConfirm}
        currentStep={currentStep}
        totalSteps={17} // Total de pasos en el conteo guiado
        completedFields={completedFieldsList}
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
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-primary via-accent-primary/80 to-accent-secondary flex items-center justify-center shadow-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{
              background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>Pagos Electrónicos</h3>
            <p className="text-sm text-text-secondary">
              {completedPayments} de {paymentMethods.length} completados
            </p>
          </div>
        </div>
        
        <motion.div 
          className="text-right"
          key={totalElectronic}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-sm text-text-secondary">Total Electrónico</div>
          <div className="text-2xl font-bold text-accent-primary">
            ${totalElectronic.toFixed(2)}
          </div>
        </motion.div>
      </div>

      {/* 🤖 [IA] - v1.0.26: Form simplificado, toda la lógica está en GuidedElectronicPaymentItem */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paymentMethods.map((method, index) => (
            <GuidedElectronicPaymentItem
              key={method.key}
              paymentMethod={method}
              value={electronicPayments[method.key as keyof ElectronicPayments]}
              isActive={isFieldActive(method.key)}
              isCompleted={isFieldCompleted(method.key)}
              isAccessible={isFieldAccessible(method.key)}
              onConfirm={onFieldConfirm}
              onAttemptAccess={onAttemptAccess}
              tabIndex={index + 12} // 🤖 [IA] - Offset +12 (después de 5 monedas + 6 billetes)
              nextFieldName={index < paymentMethods.length - 1 ? paymentMethods[index + 1].key : undefined}
            />
          ))}
        </div>
      </form>

      {totalElectronic > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center bg-accent-primary/10 text-accent-primary px-4 py-2 rounded-lg"
        >
          💳 Total en pagos electrónicos: ${totalElectronic.toFixed(2)}
        </motion.div>
      )}
    </div>
  );
};