import { useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

interface UseSupervisorRealtimeOptions {
  onChange: () => void;
  corteId?: string;
  enabled?: boolean;
}

/**
 * Suscripción Realtime para refrescar vistas del supervisor en vivo.
 * - Sin corteId: escucha cambios de tabla cortes (lista del día).
 * - Con corteId: escucha cambios de ese corte + snapshots de conteo.
 */
export function useSupervisorRealtime({
  onChange,
  corteId,
  enabled = true,
}: UseSupervisorRealtimeOptions): void {
  useEffect(() => {
    if (!enabled) return;
    if (!isSupabaseConfigured) return;

    const channel = supabase.channel(`supervisor-live:${corteId ?? 'all'}`);

    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'cortes',
        ...(corteId ? { filter: `id=eq.${corteId}` } : {}),
      },
      onChange,
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
        onChange,
      );
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onChange, corteId, enabled]);
}
