import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const realtimeMocks = vi.hoisted(() => {
  const channelChain = {
    on: vi.fn(),
    subscribe: vi.fn(),
  };
  channelChain.on.mockReturnValue(channelChain);
  channelChain.subscribe.mockReturnValue(channelChain);

  return {
    channelChain,
    channel: vi.fn(() => channelChain),
    removeChannel: vi.fn().mockResolvedValue('ok'),
  };
});

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  supabase: {
    channel: realtimeMocks.channel,
    removeChannel: realtimeMocks.removeChannel,
  },
}));

import { useSupervisorRealtime } from '../useSupervisorRealtime';

describe('useSupervisorRealtime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    realtimeMocks.channelChain.on.mockReturnValue(realtimeMocks.channelChain);
    realtimeMocks.channelChain.subscribe.mockReturnValue(realtimeMocks.channelChain);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('se suscribe a cambios de cortes del día cuando no hay corteId', () => {
    const onChange = vi.fn();
    renderHook(() => useSupervisorRealtime({ onChange }));

    expect(realtimeMocks.channel).toHaveBeenCalledWith('supervisor-live:all');
    expect(realtimeMocks.channelChain.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: '*',
        schema: 'public',
        table: 'cortes',
      }),
      expect.any(Function),
    );
    expect(realtimeMocks.channelChain.subscribe).toHaveBeenCalled();
  });

  it('aplica filtro por corteId en cortes y snapshots cuando se envía detalle', () => {
    const onChange = vi.fn();
    renderHook(() => useSupervisorRealtime({ corteId: 'corte-123', onChange }));

    expect(realtimeMocks.channel).toHaveBeenCalledWith('supervisor-live:corte-123');
    expect(realtimeMocks.channelChain.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        table: 'cortes',
        filter: 'id=eq.corte-123',
      }),
      expect.any(Function),
    );
    expect(realtimeMocks.channelChain.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        table: 'corte_conteo_snapshots',
        filter: 'corte_id=eq.corte-123',
      }),
      expect.any(Function),
    );
  });

  it('limpia el canal al desmontar', () => {
    const onChange = vi.fn();
    const { unmount } = renderHook(() => useSupervisorRealtime({ onChange }));

    unmount();

    expect(realtimeMocks.removeChannel).toHaveBeenCalledWith(realtimeMocks.channelChain);
  });

  it('expone estado del canal realtime (connecting -> subscribed -> error)', () => {
    let subscribeCallback:
      | ((status: string, err?: { message?: string }) => void)
      | undefined;

    realtimeMocks.channelChain.subscribe.mockImplementation(
      (callback?: (status: string, err?: { message?: string }) => void) => {
        subscribeCallback = callback;
        return realtimeMocks.channelChain;
      },
    );

    const onChange = vi.fn();
    const { result } = renderHook(() => useSupervisorRealtime({ onChange }));

    expect(result.current).toEqual({
      status: 'connecting',
      lastEventAt: null,
      error: null,
    });

    act(() => {
      subscribeCallback?.('SUBSCRIBED');
    });

    expect(result.current).toEqual({
      status: 'subscribed',
      lastEventAt: null,
      error: null,
    });

    act(() => {
      subscribeCallback?.('CHANNEL_ERROR', { message: 'Realtime down' });
    });

    expect(result.current).toEqual({
      status: 'error',
      lastEventAt: null,
      error: 'Realtime down',
    });
  });

  it('coalesce eventos de postgres en ventana de 250ms para evitar ráfagas', () => {
    const onChange = vi.fn();
    renderHook(() => useSupervisorRealtime({ onChange }));

    const postgresHandler = realtimeMocks.channelChain.on.mock.calls[0]?.[2] as
      | (() => void)
      | undefined;
    expect(postgresHandler).toBeTypeOf('function');

    act(() => {
      postgresHandler?.();
      postgresHandler?.();
      postgresHandler?.();
    });

    // Aún no debe disparar inmediatamente (debounce/coalescing)
    expect(onChange).toHaveBeenCalledTimes(0);

    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
