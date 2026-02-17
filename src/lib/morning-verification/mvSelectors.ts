/**
 * 🤖 [IA] - v1.4.1: mvSelectors - Lookups de datos verificación (ORDEN #074)
 * Extraído de MorningVerification.tsx (líneas 57-59)
 *
 * @description
 * Resuelve IDs de store/employee a objetos para reporte.
 */
import type { ResolvedActors } from '@/types/morningVerification';

type ResolveActorsOptions = {
  storeName?: string;
  cashierName?: string;
  witnessName?: string;
};

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
  witnessId: string,
  options: ResolveActorsOptions = {}
): ResolvedActors {
  const store = storeId
    ? {
        id: storeId,
        name: options.storeName ?? storeId,
        address: '',
        phone: '',
        schedule: '',
      }
    : undefined;

  const cashierIn = cashierId
    ? {
        id: cashierId,
        name: options.cashierName ?? cashierId,
        role: 'Cajero',
        stores: storeId ? [storeId] : [],
      }
    : undefined;

  const cashierOut = witnessId
    ? {
        id: witnessId,
        name: options.witnessName ?? witnessId,
        role: 'Testigo',
        stores: storeId ? [storeId] : [],
      }
    : undefined;

  return {
    store,
    cashierIn,
    cashierOut,
  };
}
