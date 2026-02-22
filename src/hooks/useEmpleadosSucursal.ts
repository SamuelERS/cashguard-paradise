import { useCallback, useEffect, useState } from 'react';
import { tables } from '@/lib/supabase';

export interface EmpleadoSucursal {
  id: string;
  nombre: string;
  cargo?: string;
}

export interface UseEmpleadosSucursalReturn {
  empleados: EmpleadoSucursal[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

export function useEmpleadosSucursal(
  sucursalId: string | null | undefined,
): UseEmpleadosSucursalReturn {
  const [empleados, setEmpleados] = useState<EmpleadoSucursal[]>([]);
  const [cargando, setCargando] = useState<boolean>(Boolean(sucursalId));
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async (): Promise<void> => {
    if (!sucursalId) {
      setEmpleados([]);
      setError(null);
      setCargando(false);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const { data: asignaciones, error: asignacionesError } = await tables
        .empleadoSucursales()
        .select('empleado_id')
        .eq('sucursal_id', sucursalId);

      if (asignacionesError) {
        setEmpleados([]);
        setError(asignacionesError.message);
        return;
      }

      const empleadosIds = Array.from(
        new Set((asignaciones ?? []).map((item) => item.empleado_id)),
      );

      if (empleadosIds.length === 0) {
        setEmpleados([]);
        return;
      }

      const { data: empleadosRows, error: empleadosError } = await tables
        .empleados()
        .select('id,nombre,activo')
        .in('id', empleadosIds)
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (empleadosError) {
        setEmpleados([]);
        setError(empleadosError.message);
        return;
      }

      setEmpleados(
        (empleadosRows ?? []).map((empleado) => ({
          id: empleado.id,
          nombre: empleado.nombre,
          cargo: typeof (empleado as { cargo?: unknown }).cargo === 'string'
            ? (empleado as { cargo?: string }).cargo
            : undefined,
        })),
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar empleados';
      setEmpleados([]);
      setError(message);
    } finally {
      setCargando(false);
    }
  }, [sucursalId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const recargar = useCallback(async (): Promise<void> => {
    await cargar();
  }, [cargar]);

  return { empleados, cargando, error, recargar };
}
