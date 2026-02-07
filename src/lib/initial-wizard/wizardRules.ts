// 🤖 [IA] - ORDEN #075: Domain pure functions - validation & calculation
import type { WizardData } from '@/hooks/useWizardNavigation';

/**
 * Valida que el testigo sea válido (no vacío y diferente al cajero)
 */
export function isWitnessValid(witnessId: string, cashierId: string): boolean {
  return witnessId !== '' && witnessId !== cashierId;
}

/**
 * Valida que la venta esperada sea un número positivo
 */
export function isExpectedSalesValid(value: string): boolean {
  if (value === '') return false;
  const parsed = parseFloat(value);
  return !isNaN(parsed) && parsed > 0;
}

/**
 * Calcula el porcentaje de progreso del wizard (0-100)
 * Basado en 6 tareas: rules, store, cashier, witness, sales, expenses(siempre true)
 */
export function calculateProgress(wizardData: WizardData, isFlowCompleted: boolean): number {
  const totalTasks = 6;
  const completedTasks = [
    isFlowCompleted,
    wizardData.selectedStore !== '',
    wizardData.selectedCashier !== '',
    wizardData.selectedWitness !== '',
    wizardData.expectedSales !== '' && parseFloat(wizardData.expectedSales) > 0,
    true, // Paso 6 siempre completable (gastos opcionales)
  ].filter(Boolean).length;

  return Math.round((completedTasks / totalTasks) * 100);
}
