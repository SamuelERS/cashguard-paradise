import { renderHook } from '@testing-library/react';
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
    vi.clearAllMocks();
    realtimeMocks.channelChain.on.mockReturnValue(realtimeMocks.channelChain);
    realtimeMocks.channelChain.subscribe.mockReturnValue(realtimeMocks.channelChain);
  });

  afterEach(() => {
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
      onChange,
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
      onChange,
    );
    expect(realtimeMocks.channelChain.on).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({
        table: 'corte_conteo_snapshots',
        filter: 'corte_id=eq.corte-123',
      }),
      onChange,
    );
  });

  it('limpia el canal al desmontar', () => {
    const onChange = vi.fn();
    const { unmount } = renderHook(() => useSupervisorRealtime({ onChange }));

    unmount();

    expect(realtimeMocks.removeChannel).toHaveBeenCalledWith(realtimeMocks.channelChain);
  });
});
