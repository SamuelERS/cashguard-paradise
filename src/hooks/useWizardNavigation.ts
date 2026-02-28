/**
 * 🤖 [IA] - Hook para navegación del wizard inicial - v1.4.0
 * 
 * @description
 * Hook que gestiona la navegación y validación del wizard de configuración inicial
 * del corte de caja. Maneja 6 pasos: protocolo, sucursal, cajero, testigo, venta esperada y gastos.
 * Incluye validación automática y prevención de avance con datos inválidos.
 * 
 * @example
 * ```tsx
 * const {
 *   state,
 *   goNext,
 *   goPrevious,
 *   updateData,
 *   resetWizard
 * } = useWizardNavigation();
 * 
 * // Actualizar datos del paso actual
 * updateData({ selectedStore: 'store-1' });
 * 
 * // Avanzar al siguiente paso (con validación)
 * if (goNext()) {
 *   console.log('Avanzado a paso', state.currentStep);
 * }
 * ```
 * 
 * @returns Objeto con estado del wizard y funciones de navegación
 * 
 * @property {WizardNavigationState} state - Estado completo del wizard
 * @property {function} goNext - Avanza al siguiente paso si la validación pasa
 * @property {function} goPrevious - Retrocede al paso anterior
 * @property {function} updateData - Actualiza los datos del wizard
 * @property {function} resetWizard - Reinicia el wizard al estado inicial
 * @property {function} getNavigationState - Obtiene el estado de navegación actual
 */
import { useState, useCallback } from 'react';
import { DailyExpense } from '@/types/expenses'; // 🤖 [IA] - v1.4.0: Soporte gastos del día

/**
 * Datos recopilados durante el wizard
 * 
 * @interface WizardData
 * @property {boolean} rulesAccepted - Si se aceptaron las reglas del protocolo
 * @property {string} selectedStore - ID de la sucursal seleccionada
 * @property {string} selectedCashier - ID del cajero seleccionado
 * @property {string} selectedWitness - ID del testigo seleccionado
 * @property {string} expectedSales - Venta esperada según SICAR
 * @property {DailyExpense[]} dailyExpenses - Gastos operacionales del día (opcional)
 */
export interface WizardData {
  // Paso 1: Protocolo
  rulesAccepted: boolean;
  
  // Paso 2: Sucursal
  selectedStore: string;
  
  // Paso 3: Cajero
  selectedCashier: string;
  
  // Paso 4: Testigo
  selectedWitness: string;
  
  // Paso 5: Venta Esperada
  expectedSales: string;

  // Override opcional: motivo cuando se necesita abrir nuevo corte con uno finalizado hoy
  motivo_nuevo_corte?: string;
  
  // 🤖 [IA] - v1.4.0: Paso 6 - Gastos del Día (opcional)
  dailyExpenses?: DailyExpense[];
}

export interface WizardNavigationState {
  currentStep: number;
  totalSteps: number;
  data: WizardData;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isCompleted: boolean;
}

const INITIAL_WIZARD_DATA: WizardData = {
  rulesAccepted: false,
  selectedStore: '',
  selectedCashier: '',
  selectedWitness: '',
  expectedSales: '',
  motivo_nuevo_corte: '',
  dailyExpenses: [] // 🤖 [IA] - v1.4.0: Array vacío por defecto
};

export function useWizardNavigation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(INITIAL_WIZARD_DATA);
  const totalSteps = 6; // 🤖 [IA] - v1.4.0: Agregado Paso 6 (Gastos del Día)

  // Validaciones por paso - ahora acepta estado externo para las reglas
  const validateStep = useCallback((step: number, data: WizardData, rulesCompleted?: boolean): boolean => {
    switch (step) {
      case 1: // Protocolo - usar estado externo si está disponible
        return rulesCompleted !== undefined ? rulesCompleted : data.rulesAccepted;

      case 2: // Sucursal
        return data.selectedStore !== '';

      case 3: // Cajero
        return data.selectedCashier !== '';

      case 4: // Testigo
        return data.selectedWitness !== '' &&
               data.selectedWitness !== data.selectedCashier;

      case 5: { // Venta Esperada
        const salesValue = parseFloat(data.expectedSales);
        return !isNaN(salesValue) && salesValue > 0;
      }

      case 6: // 🤖 [IA] - v1.4.0: Gastos del Día (OPCIONAL)
        return true; // Siempre válido - gastos son opcionales

      default:
        return false;
    }
  }, []);

  // Navegar al siguiente paso - acepta estado externo de reglas
  const goNext = useCallback((rulesCompleted?: boolean) => {
    if (currentStep < totalSteps && validateStep(currentStep, wizardData, rulesCompleted)) {
      setCurrentStep(prev => prev + 1);
      return true;
    }
    return false;
  }, [currentStep, totalSteps, wizardData, validateStep]);

  // Navegar al paso anterior
  const goPrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      return true;
    }
    return false;
  }, [currentStep]);

  // Ir a un paso específico (solo si los pasos anteriores son válidos)
  const goToStep = useCallback((step: number) => {
    if (step < 1 || step > totalSteps) return false;
    
    // Validar todos los pasos anteriores al objetivo
    if (step > currentStep) {
      for (let i = currentStep; i < step; i++) {
        if (!validateStep(i, wizardData)) {
          return false;
        }
      }
    }
    
    setCurrentStep(step);
    return true;
  }, [currentStep, totalSteps, wizardData, validateStep]);

  // Actualizar datos del wizard
  const updateWizardData = useCallback((updates: Partial<WizardData>) => {
    setWizardData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Resetear el wizard
  const resetWizard = useCallback(() => {
    setCurrentStep(1);
    setWizardData(INITIAL_WIZARD_DATA);
  }, []);

  // Completar el wizard
  const completeWizard = useCallback(() => {
    // Validar todos los pasos
    for (let i = 1; i <= totalSteps; i++) {
      if (!validateStep(i, wizardData)) {
        return false;
      }
    }
    return true;
  }, [totalSteps, wizardData, validateStep]);

  // Obtener el título del paso actual
  const getStepTitle = useCallback((step: number): string => {
    switch (step) {
      case 1:
        return 'Instrucciones Obligatorias Iniciales';
      case 2:
        return 'Selección de Sucursal';
      case 3:
        return 'Selección de Cajero';
      case 4:
        return 'Selección de Testigo';
      case 5:
        return 'Venta Esperada Segun SICAR';
      case 6: // 🤖 [IA] - v1.4.0
        return 'Gastos del Día';
      default:
        return '';
    }
  }, []);

  // Obtener descripción del paso actual
  const getStepDescription = useCallback((step: number): string => {
    switch (step) {
      case 1:
        return 'Acepta las reglas que protegen tu trabajo y el efectivo';
      case 2:
        return ''; // Sin descripción para evitar redundancia
      case 3:
        return ''; // Sin descripción para evitar redundancia
      case 4:
        return ''; // Sin descripción para evitar redundancia
      case 5:
        return ''; // Sin descripción para evitar redundancia
      default:
        return '';
    }
  }, []);

  // Función para obtener estado de navegación con reglas externas
  const getNavigationState = useCallback((rulesCompleted?: boolean) => ({
    canGoNext: validateStep(currentStep, wizardData, rulesCompleted) && currentStep < totalSteps,
    canGoPrevious: currentStep > 1,
    isCompleted: currentStep === totalSteps && validateStep(totalSteps, wizardData, rulesCompleted)
  }), [currentStep, totalSteps, wizardData, validateStep]);

  // Estado por defecto (usando datos internos)
  const defaultState = getNavigationState();

  return {
    // Estado
    currentStep,
    totalSteps,
    wizardData,
    canGoNext: defaultState.canGoNext,
    canGoPrevious: defaultState.canGoPrevious,
    isCompleted: defaultState.isCompleted,

    // Navegación
    goNext,
    goPrevious,
    goToStep,

    // Datos
    updateWizardData,
    resetWizard,
    completeWizard,

    // Utilidades
    validateStep: (step?: number, rulesCompleted?: boolean) => validateStep(step || currentStep, wizardData, rulesCompleted),
    getNavigationState,
    getStepTitle: () => getStepTitle(currentStep),
    getStepDescription: () => getStepDescription(currentStep),
    getCurrentStepTitle: getStepTitle,
    getCurrentStepDescription: getStepDescription
  };
}
