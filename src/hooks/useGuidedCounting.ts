import { useState, useCallback } from 'react';
import { CashCount, ElectronicPayments, DENOMINATIONS } from '@/types/cash';

export interface GuidedCountingState {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  isCompleted: boolean;
  fieldOrder: string[];
}

const FIELD_ORDER = [
  // Coins (1-5)
  'penny',      // 1¢
  'nickel',     // 5¢
  'dime',       // 10¢
  'quarter',    // 25¢
  'dollarCoin', // $1 coin
  
  // Bills (6-11)
  'bill1',      // $1
  'bill5',      // $5
  'bill10',     // $10
  'bill20',     // $20
  'bill50',     // $50
  'bill100',    // $100
  
  // Electronic payments (12-15)
  'credomatic',
  'promerica', 
  'bankTransfer',
  'paypal',
  
  // Totals (16-17)
  'totalCash',
  'totalElectronic'
];

const FIELD_LABELS = {
  penny: '1 centavo',
  nickel: '5 centavos',
  dime: '10 centavos',
  quarter: '25 centavos',
  dollarCoin: '$1 moneda',
  bill1: '$1',
  bill5: '$5',
  bill10: '$10',
  bill20: '$20',
  bill50: '$50',
  bill100: '$100',
  credomatic: 'Credomatic',
  promerica: 'Promerica',
  bankTransfer: 'Transferencia Bancaria',
  paypal: 'PayPal',
  totalCash: 'Efectivo Total',
  totalElectronic: 'Electrónico Total'
};

export function useGuidedCounting() {
  const [guidedState, setGuidedState] = useState<GuidedCountingState>({
    currentStep: 1,
    totalSteps: FIELD_ORDER.length,
    completedSteps: new Set(),
    isCompleted: false,
    fieldOrder: FIELD_ORDER
  });

  const [pendingValue, setPendingValue] = useState<string>('');

  const getCurrentField = useCallback(() => {
    return FIELD_ORDER[guidedState.currentStep - 1];
  }, [guidedState.currentStep]);

  const getCurrentFieldLabel = useCallback(() => {
    const field = getCurrentField();
    return FIELD_LABELS[field as keyof typeof FIELD_LABELS];
  }, [getCurrentField]);

  const isFieldActive = useCallback((fieldName: string) => {
    return getCurrentField() === fieldName;
  }, [getCurrentField]);

  const isFieldCompleted = useCallback((fieldName: string) => {
    const fieldIndex = FIELD_ORDER.indexOf(fieldName);
    return guidedState.completedSteps.has(fieldIndex + 1);
  }, [guidedState.completedSteps]);

  const isFieldAccessible = useCallback((fieldName: string) => {
    return isFieldActive(fieldName) || isFieldCompleted(fieldName);
  }, [isFieldActive, isFieldCompleted]);

  const confirmCurrentField = useCallback((
    value: string,
    onCashCountChange?: (denomination: string, value: string) => void,
    onElectronicChange?: (method: string, value: string) => void,
    electronicPayments?: ElectronicPayments,
    cashCount?: CashCount
  ) => {
    const currentField = getCurrentField();
    
    // Handle electronic totals calculation - these are auto-calculated
    if (currentField === 'totalCash' && cashCount) {
      // Auto-calculate and confirm total cash
      const totalCash = Object.entries(DENOMINATIONS.COINS).reduce((sum, [key, denomination]) => {
        const quantity = cashCount[key as keyof CashCount] as number;
        return sum + (quantity * denomination.value);
      }, 0) + Object.entries(DENOMINATIONS.BILLS).reduce((sum, [key, denomination]) => {
        const quantity = cashCount[key as keyof CashCount] as number;
        return sum + (quantity * denomination.value);
      }, 0);
      
      // Auto-advance for calculated field
      setGuidedState(prev => {
        const newCompletedSteps = new Set(prev.completedSteps);
        newCompletedSteps.add(prev.currentStep);
        
        const nextStep = prev.currentStep + 1;
        const isCompleted = nextStep > prev.totalSteps;
        
        return {
          ...prev,
          currentStep: isCompleted ? prev.currentStep : nextStep,
          completedSteps: newCompletedSteps,
          isCompleted
        };
      });
      return true;
    } else if (currentField === 'totalElectronic' && electronicPayments) {
      // Auto-calculate and confirm total electronic
      const totalElectronic = Object.values(electronicPayments).reduce((sum, val) => sum + val, 0);
      
      // Auto-advance for calculated field
      setGuidedState(prev => {
        const newCompletedSteps = new Set(prev.completedSteps);
        newCompletedSteps.add(prev.currentStep);
        
        const nextStep = prev.currentStep + 1;
        const isCompleted = nextStep > prev.totalSteps;
        
        return {
          ...prev,
          currentStep: isCompleted ? prev.currentStep : nextStep,
          completedSteps: newCompletedSteps,
          isCompleted
        };
      });
      return true;
    } else {
      // Handle regular denomination fields
      if (onCashCountChange && FIELD_ORDER.slice(0, 11).includes(currentField)) {
        onCashCountChange(currentField, value);
      } else if (onElectronicChange && ['credomatic', 'promerica', 'bankTransfer', 'paypal'].includes(currentField)) {
        onElectronicChange(currentField, value);
      }
    }

    // Mark step as completed and advance for regular fields
    setGuidedState(prev => {
      const newCompletedSteps = new Set(prev.completedSteps);
      newCompletedSteps.add(prev.currentStep);
      
      const nextStep = prev.currentStep + 1;
      const isCompleted = nextStep > prev.totalSteps;
      
      return {
        ...prev,
        currentStep: isCompleted ? prev.currentStep : nextStep,
        completedSteps: newCompletedSteps,
        isCompleted
      };
    });

    setPendingValue('');
    return true;
  }, [getCurrentField]);

  const resetGuidedCounting = useCallback(() => {
    setGuidedState({
      currentStep: 1,
      totalSteps: FIELD_ORDER.length,
      completedSteps: new Set(),
      isCompleted: false,
      fieldOrder: FIELD_ORDER
    });
    setPendingValue('');
  }, []);

  const getProgressText = useCallback(() => {
    return `Paso ${guidedState.currentStep} de ${guidedState.totalSteps}`;
  }, [guidedState]);

  const getInstructionText = useCallback(() => {
    if (guidedState.isCompleted) {
      return '✓ Conteo completado correctamente';
    }
    
    const currentField = getCurrentField();
    // Special message for electronic payments section
    if (['credomatic', 'promerica', 'bankTransfer', 'paypal'].includes(currentField)) {
      return `💳 Ingrese el MONTO en dólares de: ${getCurrentFieldLabel()}`;
    }
    
    return `👉 Ingrese la cantidad de: ${getCurrentFieldLabel()}`;
  }, [guidedState.isCompleted, getCurrentFieldLabel, getCurrentField]);

  return {
    guidedState,
    currentField: getCurrentField(),
    currentFieldLabel: getCurrentFieldLabel(),
    progressText: getProgressText(),
    instructionText: getInstructionText(),
    pendingValue,
    setPendingValue,
    isFieldActive,
    isFieldCompleted,
    isFieldAccessible,
    confirmCurrentField,
    resetGuidedCounting,
    FIELD_ORDER,
    FIELD_LABELS
  };
}