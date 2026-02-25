import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const invalidationMocks = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  realtimeOptions: null as null | {
    onChange: () => void;
    corteId?: string;
    enabled?: boolean;
  },
}));

vi.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: invalidationMocks.invalidateQueries,
  }),
}));

vi.mock('@/hooks/useSupervisorRealtime', () => ({
  useSupervisorRealtime: (options: {
    onChange: () => void;
    corteId?: string;
    enabled?: boolean;
  }) => {
    invalidationMocks.realtimeOptions = options;
    return {
      status: 'subscribed',
      lastEventAt: null,
      error: null,
    };
  },
}));

import { queryKeys } from '@/hooks/supervisor/queryKeys';
import { useSupervisorLiveInvalidation } from '@/hooks/supervisor/useSupervisorLiveInvalidation';

describe('useSupervisorLiveInvalidation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidationMocks.realtimeOptions = null;
  });

  it('invalida today y detail cuando llega evento realtime para un corte', () => {
    renderHook(() => useSupervisorLiveInvalidation({ corteId: 'corte-1', scope: 'all' }));

    expect(invalidationMocks.realtimeOptions).not.toBeNull();

    act(() => {
      invalidationMocks.realtimeOptions?.onChange();
    });

    expect(invalidationMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.supervisor.today(),
    });
    expect(invalidationMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.supervisor.detail('corte-1'),
    });
  });

  it('scope detail solo invalida detalle', () => {
    renderHook(() => useSupervisorLiveInvalidation({ corteId: 'corte-1', scope: 'detail' }));

    act(() => {
      invalidationMocks.realtimeOptions?.onChange();
    });

    expect(invalidationMocks.invalidateQueries).toHaveBeenCalledWith({
      queryKey: queryKeys.supervisor.detail('corte-1'),
    });
    expect(invalidationMocks.invalidateQueries).not.toHaveBeenCalledWith({
      queryKey: queryKeys.supervisor.today(),
    });
  });
});
