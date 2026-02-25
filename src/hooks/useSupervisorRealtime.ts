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
 * - Con corteId: escucha cambios de ese corte + snapshots de conteo (canales separados).
 *
 * @remarks
 * Algunos entornos pueden no tener `corte_conteo_snapshots` habilitada en Realtime.
 * Si se comparte el mismo canal con `cortes`, ese error puede silenciar todo el stream.
 * Por eso aislamos snapshots en un canal independiente y mantenemos `cortes` en vivo.
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

    const baseChannelName = `supervisor-live:${corteId ?? 'all'}`;
    const cortesChannel = supabase.channel(`${baseChannelName}:cortes`);

    cortesChannel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cortes',
        ...(corteId ? { filter: `id=eq.${corteId}` } : {}),
      },
      onRealtimeChange,
    );

    const snapshotsChannel = corteId
      ? supabase.channel(`${baseChannelName}:snapshots`)
      : null;

    if (snapshotsChannel && corteId) {
      snapshotsChannel.on(
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

    cortesChannel.subscribe((status, err) => {
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

    if (snapshotsChannel) {
      snapshotsChannel.subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // No degradar el stream principal de cortes por fallos en snapshots.
          // El detalle sigue vivo vía tabla `cortes`.
          console.warn(
            '[supervisor-realtime] Canal snapshots no disponible; se continúa con cortes',
            err?.message ?? 'sin detalle',
          );
        }
      });
    }

    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
      setState((prev) => ({ ...prev, status: 'idle' }));
      void supabase.removeChannel(cortesChannel);
      if (snapshotsChannel) {
        void supabase.removeChannel(snapshotsChannel);
      }
    };
  }, [onRealtimeChange, corteId, enabled, estadoDeshabilitado]);

  return state;
}
