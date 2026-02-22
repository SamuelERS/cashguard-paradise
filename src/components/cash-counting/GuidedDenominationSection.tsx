import { motion } from "framer-motion";
import { GuidedDenominationItem } from "@/components/ui/GuidedDenominationItem";
import { GuidedFieldView } from "./GuidedFieldView";
import { CashCount } from "@/types/cash";
import { 
  useGuidedDenomination, 
  DenominationConfig, 
  DenominationType 
} from "@/hooks/cash-counting/useGuidedDenomination";

/**
 * Props for GuidedDenominationSection component
 */
export interface GuidedDenominationSectionProps {
  cashCount: CashCount;
  isFieldActive: (fieldName: string) => boolean;
  isFieldCompleted: (fieldName: string) => boolean;
  isFieldAccessible: (fieldName: string) => boolean;
  onFieldConfirm: (value: string) => void;
  onAttemptAccess: () => void;
  isMorningCount?: boolean;
  config: DenominationConfig;
  includeCoinsInCompleted?: boolean;
  // 🤖 [IA] - v1.2.23: Navigation functions for modal integration
  onCancel?: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
}

/**
 * Base component for guided denomination counting (coins or bills)
 * 
 * This component consolidates the common logic and rendering between
 * GuidedCoinSection and GuidedBillSection, reducing code duplication
 * and improving maintainability.
 * 
 * Features:
 * - Dual view mode: Guided view for active field, grid view for overview
 * - Real-time total calculation with animations
 * - Progress tracking (completed vs total)
 * - Customizable styling via config prop
 * - Mobile-optimized with form wrapper for iOS Safari arrows
 * 
 * @param cashCount - Current cash count state
 * @param isFieldActive - Function to check if a field is active
 * @param isFieldCompleted - Function to check if a field is completed
 * @param isFieldAccessible - Function to check if a field is accessible
 * @param onFieldConfirm - Callback when field value is confirmed
 * @param onAttemptAccess - Callback when inaccessible field is accessed
 * @param isMorningCount - Whether this is a morning count (affects display)
 * @param config - Display configuration (colors, icons, labels)
 * @param includeCoinsInCompleted - Whether to include coins in completed list (for bills)
 * @param onCancel - Optional cancel callback
 * @param onPrevious - Optional previous navigation callback
 * @param canGoPrevious - Whether previous navigation is available
 * 
 * @example
 * ```tsx
 * <GuidedDenominationSection
 *   cashCount={cashCount}
 *   isFieldActive={isFieldActive}
 *   isFieldCompleted={isFieldCompleted}
 *   isFieldAccessible={isFieldAccessible}
 *   onFieldConfirm={handleFieldConfirm}
 *   onAttemptAccess={handleAttemptAccess}
 *   config={DENOMINATION_CONFIGS.coins}
 * />
 * ```
 */
export const GuidedDenominationSection = ({
  cashCount,
  isFieldActive,
  isFieldCompleted,
  isFieldAccessible,
  onFieldConfirm,
  onAttemptAccess,
  isMorningCount = false,
  config,
  includeCoinsInCompleted = false,
  // 🤖 [IA] - v1.2.23: Navigation functions for modal integration
  onCancel,
  onPrevious,
  canGoPrevious = false,
}: GuidedDenominationSectionProps) => {
  // Use custom hook for all business logic
  const {
    total,
    completedCount,
    totalCount,
    activeField,
    completedFields,
    currentStep,
    denominationEntries,
  } = useGuidedDenomination({
    cashCount,
    type: config.type,
    isFieldCompleted,
    isFieldActive,
    includeCoinsInCompleted,
  });

  // Determine view key based on denomination type
  const viewKey = `${config.type}-guided-view`;

  // 🤖 [IA] - v1.0.95: Unificación desktop/móvil - Mostrar vista guiada para ambas plataformas
  if (activeField) {
    // Get denomination from the entries
    const denomination = denominationEntries.find(([key]) => key === activeField)?.[1];
    
    if (!denomination) return null;

    return (
      <GuidedFieldView
        key={viewKey} // 🤖 [IA] - v1.1.16: Key fija para mantener el componente en el DOM
        currentFieldName={activeField}
        currentFieldLabel={denomination.name}
        currentFieldValue={cashCount[activeField as keyof CashCount] as number}
        currentFieldType={config.type === 'coins' ? 'coin' : 'bill'}
        isActive={isFieldActive(activeField)}
        isCompleted={isFieldCompleted(activeField)}
        onConfirm={onFieldConfirm}
        isMorningCount={isMorningCount}
        // 🤖 [IA] - v1.2.23: Navigation functions moved inside modal
        onCancel={onCancel}
        onPrevious={onPrevious}
        canGoPrevious={canGoPrevious}
      />
    );
  }

  // Vista desktop (grid tradicional)
  return (
    <div style={{
      backgroundColor: 'var(--glass-bg-primary)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
    }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className={`w-12 h-12 ${config.type === 'coins' ? 'rounded-full' : 'rounded'} bg-gradient-to-br flex items-center justify-center shadow-lg`}
            style={{
              backgroundImage: `linear-gradient(135deg, ${config.gradientFrom} 0%, ${config.gradientTo} 100%)`
            }}
          >
            <span className="text-white font-bold text-lg">{config.icon}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{
              background: `linear-gradient(135deg, ${config.gradientFrom} 0%, ${config.gradientTo} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>{config.label}</h3>
            <p className="text-sm text-text-secondary">
              {completedCount} de {totalCount} {config.type === 'coins' ? 'completadas' : 'completados'}
            </p>
          </div>
        </div>
        
        <motion.div 
          className="text-right"
          key={total}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-sm text-text-secondary">
            Total en {config.label}
          </div>
          <div className={`text-2xl font-bold ${config.colorClass}`}>
            ${total.toFixed(2)}
          </div>
        </motion.div>
      </div>

      {/* 🤖 [IA] - Form necesario para activar flechas de navegación en iOS Safari */}
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {denominationEntries.map(([key, denomination], index) => (
            <GuidedDenominationItem
              key={key}
              denomination={denomination}
              fieldName={key}
              quantity={cashCount[key as keyof CashCount] as number}
              type={config.type === 'coins' ? 'coin' : 'bill'}
              isActive={isFieldActive(key)}
              isCompleted={isFieldCompleted(key)}
              isAccessible={isFieldAccessible(key)}
              onConfirm={onFieldConfirm}
              onAttemptAccess={onAttemptAccess}
              tabIndex={(config.tabIndexOffset || 0) + index} // 🤖 [IA] - Índice secuencial para navegación con flechas
            />
          ))}
        </div>
      </form>

      {total > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 text-center ${config.colorClass} px-4 py-2 rounded-lg`}
          style={{
            backgroundColor: config.type === 'coins' 
              ? 'rgba(244, 165, 42, 0.1)' 
              : 'rgba(0, 186, 124, 0.1)'
          }}
        >
          {config.type === 'coins' ? '💰' : '💵'} Total en {config.label.toLowerCase()}: ${total.toFixed(2)}
        </motion.div>
      )}
    </div>
  );
};
