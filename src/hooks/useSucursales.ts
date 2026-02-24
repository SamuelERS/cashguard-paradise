// 🤖 [IA] - v1.0.0: Hook para proveer lista de sucursales — mock actual, arquitectura lista para Supabase
import { useState, useEffect, useCallback } from 'react';
import type { Sucursal } from '@/types/auditoria';
import { isSupabaseConfigured, tables } from '@/lib/supabase';

export interface UseSucursalesReturn {
  sucursales: Sucursal[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

const SUCURSALES_MOCK: Sucursal[] = [
  { id: 'suc-001', nombre: 'Los Héroes', codigo: 'H', activa: true },
  { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
  { id: 'suc-003', nombre: 'San Benito', codigo: 'B', activa: false },
];

// Flag interno para testing — permite simular errores en la carga
let _simulateError: string | null = null;

/**
 * Solo para uso en tests. Configura un error simulado en la proxima carga.
 * Pasar null para limpiar.
 */
export const _setSimulateError = (errorMsg: string | null): void => {
  _simulateError = errorMsg;
};

export const useSucursales = (): UseSucursalesReturn => {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const obtenerSucursales = useCallback(async (): Promise<Sucursal[]> => {
    if (_simulateError) {
      const errorMsg = _simulateError;
      _simulateError = null;
      throw new Error(errorMsg);
    }

    if (!isSupabaseConfigured) {
      return SUCURSALES_MOCK.filter((s) => s.activa);
    }

    const { data, error } = await tables
      .sucursales()
      .select('id,nombre,codigo,activa')
      .eq('activa', true)
      .order('nombre', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).filter((s) => s.activa);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cargarInterno = () => {
      setCargando(true);
      setError(null);

      timeoutId = setTimeout(() => {
        void (async () => {
          if (!isMounted) return;
          try {
            const activas = await obtenerSucursales();
            if (!isMounted) return;
            setSucursales(activas);
            setError(null);
          } catch (err: unknown) {
            if (!isMounted) return;
            const mensaje = err instanceof Error ? err.message : 'Error al cargar sucursales';
            setSucursales([]);
            setError(mensaje);
          } finally {
            if (isMounted) {
              setCargando(false);
            }
          }
        })();
      }, 300);
    };

    cargarInterno();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [obtenerSucursales]);

  const recargar = useCallback(async (): Promise<void> => {
    setCargando(true);
    setError(null);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        void (async () => {
          try {
            const activas = await obtenerSucursales();
            setSucursales(activas);
            setError(null);
          } catch (err: unknown) {
            const mensaje = err instanceof Error ? err.message : 'Error al cargar sucursales';
            setSucursales([]);
            setError(mensaje);
          } finally {
            setCargando(false);
            resolve();
          }
        })();
      }, 300);
    });
  }, [obtenerSucursales]);

  return { sucursales, cargando, error, recargar };
};
