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

function normalizeEmployeeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function canonicalEmployeeName(value: string): string {
  const normalized = normalizeEmployeeName(value);
  if (normalized === 'adonai torres' || normalized === 'adonay torres') {
    return 'adonai torres';
  }
  if (normalized === 'irvin abarca' || normalized === 'irving abarca') {
    return 'irvin abarca';
  }
  if (normalized === 'edenilson lopez' || normalized === 'edenison lopez') {
    return 'edenilson lopez';
  }
  return normalized;
}

function resolvePriorityOrder(empleados: EmpleadoSucursal[]): string[] {
  const normalizedNames = new Set(empleados.map((empleado) => canonicalEmployeeName(empleado.nombre)));

  const isMerliotProfile =
    normalizedNames.has('irvin abarca') || normalizedNames.has('edenilson lopez');
  if (isMerliotProfile) {
    return ['irvin abarca', 'edenilson lopez', 'jonathan melara'];
  }

  const isHeroesProfile =
    normalizedNames.has('tito gomez') || normalizedNames.has('adonai torres');
  if (isHeroesProfile) {
    return ['tito gomez', 'adonai torres', 'jonathan melara'];
  }

  return [];
}

function sortEmployeesByPriority(empleados: EmpleadoSucursal[]): EmpleadoSucursal[] {
  const priorityOrder = resolvePriorityOrder(empleados);
  const priorityMap = new Map(priorityOrder.map((name, index) => [name, index]));

  return [...empleados].sort((left, right) => {
    const leftRank = priorityMap.get(canonicalEmployeeName(left.nombre)) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = priorityMap.get(canonicalEmployeeName(right.nombre)) ?? Number.MAX_SAFE_INTEGER;

    if (leftRank !== rightRank) return leftRank - rightRank;

    return left.nombre.localeCompare(right.nombre, 'es', { sensitivity: 'base' });
  });
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

      const normalizedEmployees = (empleadosRows ?? []).map((empleado) => ({
          id: empleado.id,
          nombre: empleado.nombre,
          cargo: typeof (empleado as { cargo?: unknown }).cargo === 'string'
            ? (empleado as { cargo?: string }).cargo
            : undefined,
        }));

      setEmpleados(sortEmployeesByPriority(normalizedEmployees));
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
