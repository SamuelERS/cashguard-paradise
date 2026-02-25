import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const detailFeedMocks = vi.hoisted(() => ({
  realtimeStatus: 'subscribed' as 'subscribed' | 'error',
  useQueryMock: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: unknown) => {
    detailFeedMocks.useQueryMock(options);
    return {
      data: null,
      isPending: false,
      isFetching: false,
      isFetched: true,
      error: null,
      refetch: vi.fn().mockResolvedValue(undefined),
    };
  },
}));

vi.mock('@/hooks/useSupervisorQueries', () => ({
  useSupervisorQueries: () => ({
    obtenerCorteDetalle: vi.fn().mockResolvedValue(null),
    error: null,
  }),
}));

vi.mock('@/hooks/supervisor/useSupervisorLiveInvalidation', () => ({
  useSupervisorLiveInvalidation: () => ({
    status: detailFeedMocks.realtimeStatus,
    lastEventAt: null,
    error: null,
  }),
}));

import { useSupervisorCorteDetalleFeed } from '@/hooks/supervisor/useSupervisorCorteDetalleFeed';

describe('useSupervisorCorteDetalleFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    detailFeedMocks.realtimeStatus = 'subscribed';
  });

  it('activa fallback polling de 8s cuando realtime está en error', () => {
    detailFeedMocks.realtimeStatus = 'error';

    renderHook(() => useSupervisorCorteDetalleFeed('corte-123'));

    expect(detailFeedMocks.useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        refetchInterval: 8_000,
      }),
    );
  });

  it('desactiva polling cuando realtime está suscrito', () => {
    renderHook(() => useSupervisorCorteDetalleFeed('corte-123'));

    expect(detailFeedMocks.useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        refetchInterval: false,
      }),
    );
  });
});
