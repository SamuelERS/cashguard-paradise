// 🤖 [IA] - ORDEN #075: Domain selectors - data lookups for wizard
import type { Employee } from '@/types/cash';
import type { WizardData } from '@/hooks/useWizardNavigation';

/**
 * Obtiene empleados disponibles para una sucursal
 */
export function getAvailableEmployees(employees: Employee[], storeId: string): Employee[] {
  if (!storeId) return [];
  return employees.filter((employee) => employee.stores.includes(storeId));
}

/**
 * Obtiene testigos disponibles (excluye al cajero seleccionado)
 */
export function getAvailableWitnesses(
  employees: Employee[],
  storeId: string,
  cashierId: string
): Employee[] {
  return getAvailableEmployees(employees, storeId).filter((employee) => employee.id !== cashierId);
}

/**
 * Resuelve IDs del wizard a nombres para display (panel resumen Step 5)
 */
export function resolveStepSummary(
  wizardData: WizardData,
  stores: Array<{ id: string; name: string }>,
  employees: Employee[]
): {
  storeName: string;
  cashierName: string;
  witnessName: string;
} {
  const store = stores.find((item) => item.id === wizardData.selectedStore);
  const cashier = employees.find((item) => item.id === wizardData.selectedCashier);
  const witness = employees.find((item) => item.id === wizardData.selectedWitness);

  return {
    storeName: store?.name ?? 'N/A',
    cashierName: cashier?.name ?? 'N/A',
    witnessName: witness?.name ?? 'N/A',
  };
}
