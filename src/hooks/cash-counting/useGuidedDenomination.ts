import { useMemo } from 'react';
import { DENOMINATIONS } from '@/types/cash';
import { CashCount } from '@/types/cash';

/**
 * Type for denomination category (coins or bills)
 */
export type DenominationType = 'coins' | 'bills';

/**
 * Configuration for denomination display
 */
export interface DenominationConfig {
  type: DenominationType;
  icon: string;
  label: string;
  colorClass: string;
  gradientFrom: string;
  gradientTo: string;
  tabIndexOffset?: number;
}

/**
 * Completed field information
 */
export interface CompletedFieldInfo {
  name: string;
  quantity: number;
  total: number;
}

/**
 * Return type for useGuidedDenomination hook
 */
export interface UseGuidedDenominationResult {
  total: number;
  completedCount: number;
  totalCount: number;
  activeField: string | undefined;
  completedFields: CompletedFieldInfo[];
  currentStep: number;
  denominationEntries: [string, { name: string; value: number; image: string }][];
}

/**
 * Custom hook for managing guided denomination counting logic
 * 
 * Centralizes all business logic for both coins and bills sections,
 * reducing code duplication and improving maintainability.
 * 
 * @param cashCount - Current cash count state
 * @param type - Type of denomination ('coins' or 'bills')
 * @param isFieldCompleted - Function to check if a field is completed
 * @param isFieldActive - Function to check if a field is active
 * @param includeCoinsInCompleted - Whether to include completed coins (for bills section)
 * 
 * @returns Calculated values and state for denomination section
 * 
 * @example
 * ```tsx
 * const coinData = useGuidedDenomination({
 *   cashCount,
 *   type: 'coins',
 *   isFieldCompleted,
 *   isFieldActive,
 * });
 * ```
 */
export const useGuidedDenomination = ({
  cashCount,
  type,
  isFieldCompleted,
  isFieldActive,
  includeCoinsInCompleted = false,
}: {
  cashCount: CashCount;
  type: DenominationType;
  isFieldCompleted: (fieldName: string) => boolean;
  isFieldActive: (fieldName: string) => boolean;
  includeCoinsInCompleted?: boolean;
}): UseGuidedDenominationResult => {
  // Get the appropriate denominations based on type
  const denominations = type === 'coins' ? DENOMINATIONS.COINS : DENOMINATIONS.BILLS;

  // Calculate total value
  const total = useMemo(() => {
    return Object.entries(denominations).reduce((sum, [key, denomination]) => {
      const quantity = cashCount[key as keyof CashCount] as number;
      return sum + (quantity * denomination.value);
    }, 0);
  }, [denominations, cashCount]);

  // Count completed fields
  const completedCount = useMemo(() => {
    return Object.keys(denominations).filter(key => isFieldCompleted(key)).length;
  }, [denominations, isFieldCompleted]);

  // Total number of fields
  const totalCount = Object.keys(denominations).length;

  // Find active field
  const activeField = useMemo(() => {
    return Object.keys(denominations).find(key => isFieldActive(key));
  }, [denominations, isFieldActive]);

  // Build completed fields list
  const completedFields = useMemo(() => {
    const currentCompleted = Object.entries(denominations)
      .filter(([key]) => isFieldCompleted(key))
      .map(([key, denomination]) => ({
        name: denomination.name,
        quantity: cashCount[key as keyof CashCount] as number,
        total: (cashCount[key as keyof CashCount] as number) * denomination.value,
      }));

    // For bills section, include completed coins
    if (includeCoinsInCompleted) {
      const coinsCompleted = Object.entries(DENOMINATIONS.COINS)
        .filter(([key]) => isFieldCompleted(key))
        .map(([key, denomination]) => ({
          name: denomination.name,
          quantity: cashCount[key as keyof CashCount] as number,
          total: (cashCount[key as keyof CashCount] as number) * denomination.value,
        }));

      return [...coinsCompleted, ...currentCompleted];
    }

    return currentCompleted;
  }, [denominations, isFieldCompleted, cashCount, includeCoinsInCompleted]);

  // Calculate current step in guided flow
  const currentStep = useMemo(() => {
    const index = Object.keys(denominations).indexOf(activeField || '');
    
    if (index < 0) return 0;

    // For bills, offset by number of coins
    if (type === 'bills') {
      const coinCount = Object.keys(DENOMINATIONS.COINS).length;
      return coinCount + index + 1;
    }

    return index + 1;
  }, [denominations, activeField, type]);

  // Get denomination entries for mapping
  const denominationEntries = Object.entries(denominations);

  return {
    total,
    completedCount,
    totalCount,
    activeField,
    completedFields,
    currentStep,
    denominationEntries,
  };
};

/**
 * Predefined configurations for different denomination types
 */
export const DENOMINATION_CONFIGS: Record<DenominationType, DenominationConfig> = {
  coins: {
    type: 'coins',
    icon: '¢',
    label: 'Monedas',
    colorClass: 'text-warning',
    gradientFrom: '#f4a52a',
    gradientTo: '#ffb84d',
    tabIndexOffset: 1,
  },
  bills: {
    type: 'bills',
    icon: '$',
    label: 'Billetes',
    colorClass: 'text-success',
    gradientFrom: '#00ba7c',
    gradientTo: '#06d6a0',
    tabIndexOffset: 6, // After 5 coins
  },
};
