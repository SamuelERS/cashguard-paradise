// 🤖 [IA] - v1.0.0: Hook para proveer lista de sucursales — mock actual, arquitectura lista para Supabase
import { useState, useEffect, useCallback } from 'react';
import type { Sucursal } from '@/types/auditoria';

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

  const cargar = useCallback(async (): Promise<void> => {
    setCargando(true);
    setError(null);

    return new Promise<void>((resolve) => {
      const timeoutId = setTimeout(() => {
        if (_simulateError) {
          const errorMsg = _simulateError;
          _simulateError = null;
          setSucursales([]);
          setError(errorMsg);
          setCargando(false);
          resolve();
          return;
        }

        const activas = SUCURSALES_MOCK.filter((s) => s.activa);
        setSucursales(activas);
        setCargando(false);
        resolve();
      }, 300);

      // Cleanup reference para unmount — se maneja en el efecto
      return () => clearTimeout(timeoutId);
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const cargarInterno = () => {
      setCargando(true);
      setError(null);

      timeoutId = setTimeout(() => {
        if (!isMounted) return;

        if (_simulateError) {
          const errorMsg = _simulateError;
          _simulateError = null;
          setSucursales([]);
          setError(errorMsg);
          setCargando(false);
          return;
        }

        const activas = SUCURSALES_MOCK.filter((s) => s.activa);
        setSucursales(activas);
        setCargando(false);
      }, 300);
    };

    cargarInterno();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const recargar = useCallback(async (): Promise<void> => {
    setCargando(true);
    setError(null);

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        if (_simulateError) {
          const errorMsg = _simulateError;
          _simulateError = null;
          setSucursales([]);
          setError(errorMsg);
          setCargando(false);
          resolve();
          return;
        }

        const activas = SUCURSALES_MOCK.filter((s) => s.activa);
        setSucursales(activas);
        setCargando(false);
        resolve();
      }, 300);
    });
  }, []);

  return { sucursales, cargando, error, recargar };
};
