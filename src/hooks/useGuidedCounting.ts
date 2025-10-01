/**
 * 🤖 [IA] - Hook para conteo guiado paso a paso - v1.2.19
 * 
 * @description
 * Hook que gestiona el flujo de conteo guiado de efectivo y pagos electrónicos.
 * Implementa navegación secuencial con anti-fraud locking y soporte para
 * modo matutino (solo efectivo) y modo nocturno (efectivo + electrónicos).
 * 
 * @example
 * ```tsx
 * const {
 *   state,
 *   confirmCurrentField,
 *   goPrevious,
 *   canGoPrevious,
 *   resetCounting
 * } = useGuidedCounting('evening');
 * 
 * // Confirmar campo actual
 * const success = confirmCurrentField(
 *   '25',
 *   handleCashChange,
 *   handleElectronicChange,
 *   cashCount,
 *   electronicPayments
 * );
 * ```
 * 
 * @see {@link MORNING_FIELD_ORDER} Orden de campos para conteo matutino
 * @see {@link EVENING_FIELD_ORDER} Orden de campos para conteo nocturno
 */
import { useState, useCallback } from 'react';
import { CashCount, ElectronicPayments, DENOMINATIONS } from '@/types/cash';
import { OperationMode } from '@/types/operation-mode'; // 🤖 [IA] - v1.0.85

/**
 * Estado del conteo guiado
 * 
 * @interface GuidedCountingState
 * @property {number} currentStep - Paso actual (0-indexed)
 * @property {number} totalSteps - Total de pasos en el flujo
 * @property {Set<number>} completedSteps - Set de pasos completados
 * @property {boolean} isCompleted - Si el conteo está completado
 * @property {string[]} fieldOrder - Orden de los campos según modo
 * @property {boolean} isLocked - Lock anti-fraude después de pagos electrónicos
 * @property {number | null} lastElectronicStep - Paso donde inician pagos electrónicos
 */
export interface GuidedCountingState {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
  isCompleted: boolean;
  fieldOrder: string[];
  isLocked: boolean; // 🤖 [IA] - v1.2.19: Anti-fraud lock after electronic payments
  lastElectronicStep: number | null; // 🤖 [IA] - v1.2.19: Track when electronic section starts
}

// 🤖 [IA] - v1.0.85: Separate field orders for morning count vs evening cut
const MORNING_FIELD_ORDER = [
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
  
  // Total (12) - Only cash for morning count
  'totalCash'
];

const EVENING_FIELD_ORDER = [
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

// 🤖 [IA] - v1.0.85: Keep original for backward compatibility
const FIELD_ORDER = EVENING_FIELD_ORDER;

// 🤖 [IA] - v1.2.35: Exported for accessibility labels in GuidedFieldView
export const FIELD_LABELS: Record<string, string> = {
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

/**
 * Hook useGuidedCounting - Gestión de conteo guiado
 * 
 * @param {OperationMode} [operationMode] - Modo de operación (CASH_COUNT para matutino, EVENING_CUT para nocturno)
 * @returns Objeto con estado y funciones de navegación
 * 
 * @property {GuidedCountingState} state - Estado actual del conteo
 * @property {function} getCurrentField - Obtiene el campo actual
 * @property {function} getCurrentFieldLabel - Obtiene la etiqueta del campo actual
 * @property {function} isFieldActive - Verifica si un campo está activo
 * @property {function} isFieldCompleted - Verifica si un campo está completado
 * @property {function} isFieldAccessible - Verifica si un campo es accesible
 * @property {function} confirmCurrentField - Confirma el valor del campo actual
 * @property {function} canGoPrevious - Verifica si puede retroceder
 * @property {function} goPrevious - Retrocede al campo anterior
 * @property {function} resetCounting - Reinicia el conteo
 */
export function useGuidedCounting(operationMode?: OperationMode) { // 🤖 [IA] - v1.0.85
  // 🤖 [IA] - v1.0.85: Use appropriate field order based on operation mode
  const fieldOrder = operationMode === OperationMode.CASH_COUNT 
    ? MORNING_FIELD_ORDER 
    : EVENING_FIELD_ORDER;
  
  const [guidedState, setGuidedState] = useState<GuidedCountingState>({
    currentStep: 1,
    totalSteps: fieldOrder.length,
    completedSteps: new Set(),
    isCompleted: false,
    fieldOrder: fieldOrder,
    isLocked: false, // 🤖 [IA] - v1.2.19: Initially unlocked
    lastElectronicStep: null // 🤖 [IA] - v1.2.19: No electronic steps completed yet
  });

  const [pendingValue, setPendingValue] = useState<string>('');

  /**
   * Obtiene el nombre del campo actual en el flujo
   * 
   * @returns {string} Nombre del campo (ej: 'penny', 'bill1', 'credomatic')
   * 
   * @example
   * const fieldName = getCurrentField(); // 'penny'
   */
  const getCurrentField = useCallback(() => {
    return fieldOrder[guidedState.currentStep - 1];
  }, [guidedState.currentStep, fieldOrder]);

  /**
   * Obtiene la etiqueta legible del campo actual
   * 
   * @returns {string} Etiqueta en español (ej: '1 centavo', '$5', 'Credomatic')
   * 
   * @example
   * const label = getCurrentFieldLabel(); // '1 centavo'
   */
  const getCurrentFieldLabel = useCallback(() => {
    const field = getCurrentField();
    return FIELD_LABELS[field as keyof typeof FIELD_LABELS];
  }, [getCurrentField]);

  /**
   * Verifica si un campo es el campo activo actual
   * 
   * @param {string} fieldName - Nombre del campo a verificar
   * @returns {boolean} true si el campo está activo
   * 
   * @example
   * const isActive = isFieldActive('penny'); // true si penny es el campo actual
   */
  const isFieldActive = useCallback((fieldName: string) => {
    return getCurrentField() === fieldName;
  }, [getCurrentField]);

  /**
   * Verifica si un campo ya ha sido completado
   * 
   * @param {string} fieldName - Nombre del campo a verificar
   * @returns {boolean} true si el campo fue completado
   * 
   * @example
   * const completed = isFieldCompleted('penny'); // true si ya se completó
   */
  const isFieldCompleted = useCallback((fieldName: string) => {
    const fieldIndex = FIELD_ORDER.indexOf(fieldName);
    return guidedState.completedSteps.has(fieldIndex + 1);
  }, [guidedState.completedSteps]);

  /**
   * Verifica si un campo es accesible (activo o completado)
   * 
   * @param {string} fieldName - Nombre del campo a verificar
   * @returns {boolean} true si el campo es accesible
   * 
   * @example
   * const accessible = isFieldAccessible('penny');
   */
  const isFieldAccessible = useCallback((fieldName: string) => {
    return isFieldActive(fieldName) || isFieldCompleted(fieldName);
  }, [isFieldActive, isFieldCompleted]);

  // 🤖 [IA] - v1.2.19: canGoNext ELIMINADA - Solo se necesita canGoPrevious

  const canGoPrevious = useCallback(() => {
    // Can go previous if:
    // 1. Not at the first step
    // 2. Not locked (after electronic payments)
    // 3. Not completed
    return guidedState.currentStep > 1 && !guidedState.isLocked && !guidedState.isCompleted;
  }, [guidedState.currentStep, guidedState.isLocked, guidedState.isCompleted]);

  const goPrevious = useCallback(() => {
    if (!canGoPrevious()) {
      return false;
    }

    setGuidedState(prev => {
      const previousStep = prev.currentStep - 1;
      const newCompletedSteps = new Set(prev.completedSteps);
      
      // 🤖 [IA] - v1.2.19: MEJORADO - Eliminar el campo anterior de completados para permitir edición
      // Al retroceder al campo anterior, debe volverse editable
      newCompletedSteps.delete(previousStep);
      
      return {
        ...prev,
        currentStep: previousStep,
        completedSteps: newCompletedSteps, // Campo anterior removido de completados = editable
        isCompleted: false // Reset completion status when going back
      };
    });

    return true;
  }, [canGoPrevious]);

  // 🤖 [IA] - v1.2.19: Función goNext ELIMINADA - Causa problemas de estado sin callbacks

  // 🤖 [IA] - v1.2.19: Check if current field is electronic payment
  const isCurrentFieldElectronic = useCallback(() => {
    const currentField = getCurrentField();
    return ['credomatic', 'promerica', 'bankTransfer', 'paypal'].includes(currentField);
  }, [getCurrentField]);

  const confirmCurrentField = useCallback((
    value: string,
    onCashCountChange?: (denomination: string, value: string) => void,
    onElectronicChange?: (method: string, value: string) => void,
    electronicPayments?: ElectronicPayments,
    cashCount?: CashCount
  ) => {
    const currentField = getCurrentField();
    
    // 🤖 [IA] - v1.1.08: Fix para confirmar totales correctamente
    if (currentField === 'totalCash' || currentField === 'totalElectronic') {
      // Los totales se muestran en TotalsSummarySection y requieren confirmación
      // El valor ya está calculado, solo avanzamos cuando el usuario confirma
      setGuidedState(prev => {
        const newCompletedSteps = new Set(prev.completedSteps);
        newCompletedSteps.add(prev.currentStep);
        
        const isLastStep = prev.currentStep === prev.totalSteps;
        const nextStep = prev.currentStep + 1;
        
        return {
          ...prev,
          // Si es el último paso, avanzar más allá del total para que getCurrentField devuelva null
          currentStep: isLastStep ? prev.totalSteps + 1 : nextStep,
          completedSteps: newCompletedSteps,
          isCompleted: isLastStep
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
      
      // 🤖 [IA] - v1.2.19: MEJORADO - Bloquear al llegar a totales, no después de PayPal
      const nextField = fieldOrder[nextStep - 1];
      const shouldLock = nextField === 'totalCash' || nextField === 'totalElectronic' || isCompleted;
      
      return {
        ...prev,
        currentStep: isCompleted ? prev.currentStep : nextStep,
        completedSteps: newCompletedSteps,
        isCompleted,
        // Bloquear navegación al entrar en fase de totales (sistema ciego)
        isLocked: shouldLock ? true : prev.isLocked,
        lastElectronicStep: shouldLock && !prev.isLocked ? prev.currentStep : prev.lastElectronicStep
      };
    });

    setPendingValue('');
    return true;
  }, [getCurrentField, fieldOrder]);

  const resetGuidedCounting = useCallback(() => {
    setGuidedState({
      currentStep: 1,
      totalSteps: fieldOrder.length,
      completedSteps: new Set(),
      isCompleted: false,
      fieldOrder: fieldOrder,
      isLocked: false, // 🤖 [IA] - v1.2.19: Reset lock state
      lastElectronicStep: null // 🤖 [IA] - v1.2.19: Reset electronic tracking
    });
    setPendingValue('');
  }, [fieldOrder]);

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
    // 🤖 [IA] - v1.2.19: Simplified navigation functions
    canGoPrevious,
    goPrevious,
    isCurrentFieldElectronic,
    FIELD_ORDER,
    FIELD_LABELS
  };
}