// 🤖 [IA] - v2.0.0 - OT-13: Hook real Supabase — elimina mock, consume tabla sucursales
// Previous: v1.0.0 - Mock con SUCURSALES_MOCK y setTimeout(300)
import { useState, useEffect, useCallback } from 'react';
import type { Sucursal } from '@/types/auditoria';
import { tables } from '@/lib/supabase';

export interface UseSucursalesReturn {
  sucursales: Sucursal[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

export const useSucursales = (): UseSucursalesReturn => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (signal?: { cancelled: boolean }): Promise<void> => {
    setCargando(true);
    setError(null);

    try {
      const { data, error: supaError } = await tables.sucursales()
        .select('id,nombre,codigo,activa')
        .eq('activa', true)
        .order('nombre', { ascending: true });

      if (signal?.cancelled) return;

      if (supaError) {
        setSucursales([]);
        setError(supaError.message);
        return;
      }

      setSucursales((data as Sucursal[]) ?? []);
    } catch (err: unknown) {
      if (signal?.cancelled) return;
      setSucursales([]);
      setError(err instanceof Error ? err.message : 'Error al cargar sucursales');
    } finally {
      if (!signal?.cancelled) {
        setCargando(false);
      }
    }
  }, []);

  useEffect(() => {
    const signal = { cancelled: false };
    cargar(signal);
    return () => { signal.cancelled = true; };
  }, [cargar]);

  const recargar = useCallback(async (): Promise<void> => {
    await cargar();
  }, [cargar]);

  return { sucursales, cargando, error, recargar };
};
