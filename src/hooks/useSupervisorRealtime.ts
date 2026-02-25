import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface UseSupervisorRealtimeOptions {
  onChange: () => void;
  corteId?: string;
  enabled?: boolean;
}

export type SupervisorRealtimeStatus =
  | 'idle'
  | 'connecting'
  | 'subscribed'
  | 'error'
  | 'disabled';

export interface SupervisorRealtimeState {
  status: SupervisorRealtimeStatus;
  lastEventAt: number | null;
  error: string | null;
}

const COALESCE_WINDOW_MS = 250;

/**
 * Suscripción Realtime para refrescar vistas del supervisor en vivo.
 * - Sin corteId: escucha cambios de tabla cortes (lista del día).
 * - Con corteId: escucha cambios de ese corte + snapshots de conteo.
 */
export function useSupervisorRealtime({
  onChange,
  corteId,
  enabled = true,
}: UseSupervisorRealtimeOptions): SupervisorRealtimeState {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [state, setState] = useState<SupervisorRealtimeState>(() =>
    !enabled || !isSupabaseConfigured
      ? { status: 'disabled', lastEventAt: null, error: null }
      : { status: 'connecting', lastEventAt: null, error: null },
  );

  const estadoDeshabilitado = useMemo<SupervisorRealtimeState>(
    () => ({ status: 'disabled', lastEventAt: null, error: null }),
    [],
  );

  const onRealtimeChange = useCallback(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onChange();
      setState((prev) => ({
        ...prev,
        lastEventAt: Date.now(),
        error: null,
      }));
      timeoutRef.current = null;
    }, COALESCE_WINDOW_MS);
  }, [onChange]);

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured) {
      setState(estadoDeshabilitado);
      return;
    }

    setState({ status: 'connecting', lastEventAt: null, error: null });

    const channel = supabase.channel(`supervisor-live:${corteId ?? 'all'}`);

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cortes',
        ...(corteId ? { filter: `id=eq.${corteId}` } : {}),
      },
      onRealtimeChange,
    );

    if (corteId) {
      channel.on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'corte_conteo_snapshots',
          filter: `corte_id=eq.${corteId}`,
        },
        onRealtimeChange,
      );
    }

    channel.subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        setState((prev) => ({
          ...prev,
          status: 'subscribed',
          error: null,
        }));
        return;
      }

      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        setState((prev) => ({
          ...prev,
          status: 'error',
          error: err?.message ?? 'Canal realtime no disponible',
        }));
      }
    });

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      setState((prev) => ({ ...prev, status: 'idle' }));
      void supabase.removeChannel(channel);
    };
  }, [onRealtimeChange, corteId, enabled, estadoDeshabilitado]);

  return state;
}
