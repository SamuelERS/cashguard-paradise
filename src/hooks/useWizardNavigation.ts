// 🤖 [IA] - v1.0.38 - Hook para navegación del wizard inicial - Eliminación de firma redundante
import { useState, useCallback } from 'react';

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
  expectedSales: ''
};

export function useWizardNavigation() {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardData, setWizardData] = useState<WizardData>(INITIAL_WIZARD_DATA);
  const totalSteps = 5;

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

      case 5: // Venta Esperada
        const salesValue = parseFloat(data.expectedSales);
        return !isNaN(salesValue) && salesValue > 0;

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
        return 'Protocolo de Seguridad de Caja';
      case 2:
        return 'Selección de Sucursal';
      case 3:
        return 'Selección de Cajero';
      case 4:
        return 'Selección de Testigo';
      case 5:
        return 'Venta Esperada Segun SICAR';
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