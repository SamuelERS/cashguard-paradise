import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useSupervisorRealtime,
  type SupervisorRealtimeState,
} from '@/hooks/useSupervisorRealtime';
import { queryKeys } from './queryKeys';

export type SupervisorInvalidationScope = 'all' | 'today' | 'detail' | 'history';

interface UseSupervisorLiveInvalidationOptions {
  corteId?: string;
  enabled?: boolean;
  scope?: SupervisorInvalidationScope;
  historyFingerprint?: string;
}

export function useSupervisorLiveInvalidation({
  corteId,
  enabled = true,
  scope = 'all',
  historyFingerprint = 'all',
}: UseSupervisorLiveInvalidationOptions): SupervisorRealtimeState {
  const queryClient = useQueryClient();

  const invalidate = useCallback(() => {
    const shouldInvalidateToday = scope === 'all' || scope === 'today';
    const shouldInvalidateDetail = (scope === 'all' || scope === 'detail') && Boolean(corteId);
    const shouldInvalidateHistory = scope === 'all' || scope === 'history';

    if (shouldInvalidateToday) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.supervisor.today(),
      });
    }

    if (shouldInvalidateDetail && corteId) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.supervisor.detail(corteId),
      });
    }

    if (shouldInvalidateHistory) {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.supervisor.history(historyFingerprint),
      });
    }
  }, [scope, corteId, historyFingerprint, queryClient]);

  return useSupervisorRealtime({
    onChange: invalidate,
    corteId,
    enabled,
  });
}
