/**
 * 🤖 [IA] - v1.4.1: mvSelectors - Lookups de datos verificación (ORDEN #074)
 * Extraído de MorningVerification.tsx (líneas 57-59)
 *
 * @description
 * Resuelve actores de verificación sin depender de catálogos estáticos legacy.
 */
import type { ResolvedActors } from '@/types/morningVerification';

/**
 * Resuelve IDs de actores a objetos Store/Employee.
 *
 * @param storeId - ID de sucursal
 * @param cashierId - ID de cajero entrante
 * @param witnessId - ID de cajero saliente (testigo)
 * @returns Objetos resueltos usando nombres explícitos o IDs como fallback
 */
export function resolveVerificationActors(
  storeId: string,
  cashierId: string,
  witnessId: string,
  names?: {
    storeName?: string;
    cashierName?: string;
    witnessName?: string;
  },
): ResolvedActors {
  return {
    store: {
      id: storeId,
      name: names?.storeName?.trim() || storeId,
      address: '',
      phone: '',
      schedule: '',
    },
    cashierIn: {
      id: cashierId,
      name: names?.cashierName?.trim() || cashierId,
      role: 'Empleado Activo',
      stores: [storeId],
    },
    cashierOut: {
      id: witnessId,
      name: names?.witnessName?.trim() || witnessId,
      role: 'Empleado Activo',
      stores: [storeId],
    },
  };
}
