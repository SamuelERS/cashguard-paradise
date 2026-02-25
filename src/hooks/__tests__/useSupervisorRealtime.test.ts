import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const realtimeMocks = vi.hoisted(() => {
  type MockChannel = {
    on: ReturnType<typeof vi.fn>;
    subscribe: ReturnType<typeof vi.fn>;
    name: string;
  };

  const channels = new Map<string, MockChannel>();
  const ensureChannel = (name: string): MockChannel => {
    const existing = channels.get(name);
    if (existing) return existing;

    const channel: MockChannel = {
      name,
      on: vi.fn(),
      subscribe: vi.fn(),
    };
    channel.on.mockReturnValue(channel);
    channel.subscribe.mockReturnValue(channel);
    channels.set(name, channel);
    return channel;
  };

  return {
    channels,
    ensureChannel,
    resetChannels: () => channels.clear(),
    channel: vi.fn((name: string) => ensureChannel(name)),
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
    realtimeMocks.resetChannels();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('se suscribe a cambios de cortes del día cuando no hay corteId', () => {
    const onChange = vi.fn();
    renderHook(() => useSupervisorRealtime({ onChange }));

    expect(realtimeMocks.channel).toHaveBeenCalledWith('supervisor-live:all:cortes');
    const cortesChannel = realtimeMocks.ensureChannel('supervisor-live:all:cortes');
    expect(cortesChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        event: '*',
        schema: 'public',
        table: 'cortes',
      }),
      expect.any(Function),
    );
    expect(cortesChannel.subscribe).toHaveBeenCalled();
  });

  it('aplica filtro por corteId en cortes y snapshots cuando se envía detalle', () => {
    const onChange = vi.fn();
    renderHook(() => useSupervisorRealtime({ corteId: 'corte-123', onChange }));

    expect(realtimeMocks.channel).toHaveBeenCalledWith('supervisor-live:corte-123:cortes');
    expect(realtimeMocks.channel).toHaveBeenCalledWith('supervisor-live:corte-123:snapshots');

    const cortesChannel = realtimeMocks.ensureChannel('supervisor-live:corte-123:cortes');
    const snapshotsChannel = realtimeMocks.ensureChannel('supervisor-live:corte-123:snapshots');

    expect(cortesChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        table: 'cortes',
        filter: 'id=eq.corte-123',
      }),
      expect.any(Function),
    );

    expect(snapshotsChannel.on).toHaveBeenCalledWith(
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

    const cortesChannel = realtimeMocks.ensureChannel('supervisor-live:all:cortes');
    expect(realtimeMocks.removeChannel).toHaveBeenCalledWith(cortesChannel);
  });

  it('expone estado del canal realtime (connecting -> subscribed -> error)', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useSupervisorRealtime({ onChange }));
    const cortesChannel = realtimeMocks.ensureChannel('supervisor-live:all:cortes');
    const subscribeCallback = cortesChannel.subscribe.mock.calls[0]?.[0] as
      | ((status: string, err?: { message?: string }) => void)
      | undefined;

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

    const cortesChannel = realtimeMocks.ensureChannel('supervisor-live:all:cortes');
    const postgresHandler = cortesChannel.on.mock.calls[0]?.[2] as
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

  it('si snapshots falla en detalle, mantiene canal de cortes en vivo (regresión)', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useSupervisorRealtime({ corteId: 'corte-123', onChange }),
    );

    const cortesChannel = realtimeMocks.ensureChannel('supervisor-live:corte-123:cortes');
    const snapshotsChannel = realtimeMocks.ensureChannel('supervisor-live:corte-123:snapshots');

    const cortesSubscribeCallback = cortesChannel.subscribe.mock.calls[0]?.[0] as
      | ((status: string, err?: { message?: string }) => void)
      | undefined;
    const snapshotsSubscribeCallback = snapshotsChannel.subscribe.mock.calls[0]?.[0] as
      | ((status: string, err?: { message?: string }) => void)
      | undefined;

    act(() => {
      cortesSubscribeCallback?.('SUBSCRIBED');
    });
    expect(result.current.status).toBe('subscribed');

    act(() => {
      snapshotsSubscribeCallback?.('CHANNEL_ERROR', { message: 'snapshot realtime disabled' });
    });

    expect(result.current.status).toBe('subscribed');
    expect(result.current.error).toBeNull();
  });
});
