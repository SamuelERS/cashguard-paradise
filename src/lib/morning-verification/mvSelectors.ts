/**
 * 🤖 [IA] - v1.4.1: mvSelectors - Lookups de datos verificación (ORDEN #074)
 * Extraído de MorningVerification.tsx (líneas 57-59)
 *
 * @description
 * Resuelve IDs de store/employee a objetos completos.
 * Aislable con vi.mock('@/data/paradise') en tests (Ajuste #4 ORDEN #074).
 */
import type { ResolvedActors } from '@/types/morningVerification';
import { getStoreById, getEmployeeById } from '@/data/paradise';

/**
 * Resuelve IDs de actores a objetos Store/Employee.
 *
 * @param storeId - ID de sucursal
 * @param cashierId - ID de cajero entrante
 * @param witnessId - ID de cajero saliente (testigo)
 * @returns Objetos resueltos o undefined si ID no encontrado
 */
export function resolveVerificationActors(
  storeId: string,
  cashierId: string,
  witnessId: string
): ResolvedActors {
  return {
    store: getStoreById(storeId),
    cashierIn: getEmployeeById(cashierId),
    cashierOut: getEmployeeById(witnessId),
  };
}
