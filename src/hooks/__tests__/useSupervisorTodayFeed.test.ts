import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const todayFeedMocks = vi.hoisted(() => ({
  realtimeStatus: 'subscribed' as 'subscribed' | 'error',
  useQueryMock: vi.fn(),
}));

vi.mock('@tanstack/react-query', () => ({
  useQuery: (options: unknown) => {
    todayFeedMocks.useQueryMock(options);
    return {
      data: [],
      isPending: false,
      isFetching: false,
      error: null,
      dataUpdatedAt: 0,
      refetch: vi.fn().mockResolvedValue(undefined),
    };
  },
}));

vi.mock('@/hooks/useSupervisorQueries', () => ({
  useSupervisorQueries: () => ({
    obtenerCortesDelDia: vi.fn().mockResolvedValue([]),
    error: null,
  }),
}));

vi.mock('@/hooks/supervisor/useSupervisorLiveInvalidation', () => ({
  useSupervisorLiveInvalidation: () => ({
    status: todayFeedMocks.realtimeStatus,
    lastEventAt: null,
    error: null,
  }),
}));

import { useSupervisorTodayFeed } from '@/hooks/supervisor/useSupervisorTodayFeed';

describe('useSupervisorTodayFeed', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    todayFeedMocks.realtimeStatus = 'subscribed';
  });

  it('usa polling de fallback cuando realtime entra en error', () => {
    todayFeedMocks.realtimeStatus = 'error';

    renderHook(() => useSupervisorTodayFeed());

    expect(todayFeedMocks.useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        refetchInterval: 10_000,
      }),
    );
  });

  it('desactiva polling cuando realtime está suscrito', () => {
    todayFeedMocks.realtimeStatus = 'subscribed';

    renderHook(() => useSupervisorTodayFeed());

    expect(todayFeedMocks.useQueryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        refetchInterval: false,
      }),
    );
  });
});
