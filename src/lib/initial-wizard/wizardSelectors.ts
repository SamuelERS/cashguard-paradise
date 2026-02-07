// 🤖 [IA] - ORDEN #075: Domain selectors - data lookups for wizard
import type { Employee } from '@/types/cash';
import { getEmployeesByStore, getStoreById, getEmployeeById } from '@/data/paradise';
import type { WizardData } from '@/hooks/useWizardNavigation';

/**
 * Obtiene empleados disponibles para una sucursal
 */
export function getAvailableEmployees(storeId: string): Employee[] {
  if (!storeId) return [];
  return getEmployeesByStore(storeId);
}

/**
 * Obtiene testigos disponibles (excluye al cajero seleccionado)
 */
export function getAvailableWitnesses(storeId: string, cashierId: string): Employee[] {
  return getAvailableEmployees(storeId).filter(emp => emp.id !== cashierId);
}

/**
 * Resuelve IDs del wizard a nombres para display (panel resumen Step 5)
 */
export function resolveStepSummary(wizardData: WizardData): {
  storeName: string;
  cashierName: string;
  witnessName: string;
} {
  const store = getStoreById(wizardData.selectedStore);
  const cashier = getEmployeeById(wizardData.selectedCashier);
  const witness = getEmployeeById(wizardData.selectedWitness);

  return {
    storeName: store?.name ?? 'N/A',
    cashierName: cashier?.name ?? 'N/A',
    witnessName: witness?.name ?? 'N/A',
  };
}
