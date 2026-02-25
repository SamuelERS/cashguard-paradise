import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSupervisorQueries } from '@/hooks/useSupervisorQueries';
import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';
import { useSupervisorLiveInvalidation } from './useSupervisorLiveInvalidation';
import { queryKeys } from './queryKeys';

const FALLBACK_POLLING_MS = 10_000;

export interface UseSupervisorTodayFeedReturn {
  cortes: CorteConSucursal[];
  cargando: boolean;
  actualizando: boolean;
  error: string | null;
  ultimaActualizacion: Date | null;
  realtimeStatus: 'idle' | 'connecting' | 'subscribed' | 'error' | 'disabled';
  refrescar: () => Promise<void>;
}

export function useSupervisorTodayFeed(): UseSupervisorTodayFeedReturn {
  const { obtenerCortesDelDia, error: queryErrorState } = useSupervisorQueries();
  const realtime = useSupervisorLiveInvalidation({ scope: 'today' });

  const query = useQuery({
    queryKey: queryKeys.supervisor.today(),
    queryFn: obtenerCortesDelDia,
    staleTime: 5_000,
    refetchOnWindowFocus: true,
    refetchInterval: realtime.status === 'error' ? FALLBACK_POLLING_MS : false,
  });

  const refrescar = useCallback(async () => {
    await query.refetch();
  }, [query]);

  const errorFromReactQuery = query.error instanceof Error ? query.error.message : null;
  const error = queryErrorState ?? errorFromReactQuery;

  return {
    cortes: query.data ?? [],
    cargando: query.isPending && (query.data?.length ?? 0) === 0,
    actualizando: query.isFetching,
    error,
    ultimaActualizacion: query.dataUpdatedAt > 0 ? new Date(query.dataUpdatedAt) : null,
    realtimeStatus: realtime.status,
    refrescar,
  };
}
