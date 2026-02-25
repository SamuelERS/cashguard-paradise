import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSupervisorQueries } from '@/hooks/useSupervisorQueries';
import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';
import { useSupervisorLiveInvalidation } from './useSupervisorLiveInvalidation';
import { queryKeys } from './queryKeys';

const FALLBACK_POLLING_MS = 8_000;

export interface UseSupervisorCorteDetalleFeedReturn {
  corte: CorteConSucursal | null;
  cargando: boolean;
  actualizando: boolean;
  error: string | null;
  noEncontrado: boolean;
  realtimeStatus: 'idle' | 'connecting' | 'subscribed' | 'error' | 'disabled';
  refrescar: () => Promise<void>;
}

export function useSupervisorCorteDetalleFeed(
  corteId?: string,
): UseSupervisorCorteDetalleFeedReturn {
  const { obtenerCorteDetalle, error: queryErrorState } = useSupervisorQueries();
  const realtime = useSupervisorLiveInvalidation({ corteId, scope: 'detail', enabled: Boolean(corteId) });

  const query = useQuery({
    queryKey: corteId ? queryKeys.supervisor.detail(corteId) : ['supervisor', 'detail', 'missing-id'],
    queryFn: async () => {
      if (!corteId) return null;
      return await obtenerCorteDetalle(corteId);
    },
    enabled: Boolean(corteId),
    staleTime: 5_000,
    refetchOnWindowFocus: true,
    refetchInterval: realtime.status === 'error' ? FALLBACK_POLLING_MS : false,
  });

  const refrescar = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const errorFromReactQuery = query.error instanceof Error ? query.error.message : null;
  const error = queryErrorState ?? errorFromReactQuery;
  const corte = query.data ?? null;
  const noEncontrado = Boolean(corteId) && query.isFetched && corte === null && error === null;

  return {
    corte,
    cargando: query.isPending,
    actualizando: query.isFetching,
    error,
    noEncontrado,
    realtimeStatus: realtime.status,
    refrescar,
  };
}
