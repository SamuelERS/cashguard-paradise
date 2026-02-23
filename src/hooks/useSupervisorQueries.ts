// 🤖 [IA] - Orden #2b DACC Dashboard Supervisor — Hook de queries Supabase
// Read-only: Encapsula los 4 queries del dashboard supervisor.
// Criterios: 0 errores TypeScript, 0 any, patrón tables.xxx() del proyecto.

import { useState, useCallback } from 'react';
import { tables } from '../lib/supabase';
import type { Corte, Sucursal } from '../types/auditoria';

// ---------------------------------------------------------------------------
// 1. Constantes
// ---------------------------------------------------------------------------

/** Resultados máximos por página en vista Historial. */
export const RESULTADOS_POR_PAGINA = 50;

/** Timezone oficial del negocio para filtros de fecha. */
const TIMEZONE_NEGOCIO = 'America/El_Salvador';

// ---------------------------------------------------------------------------
// 2. Tipos públicos
// ---------------------------------------------------------------------------

/**
 * Corte de caja con datos de sucursal embebidos (join Supabase).
 *
 * @remarks `sucursales` puede ser null si la relación FK fue eliminada
 * (caso defensivo; en operación normal siempre existe).
 */
export interface CorteConSucursal extends Corte {
  sucursales: Pick<Sucursal, 'id' | 'nombre' | 'codigo' | 'activa'> | null;
}

/** Parámetros de filtro para la vista de historial. */
export interface FiltrosHistorial {
  /** Fecha inicio en formato YYYY-MM-DD (inclusiva). */
  fechaDesde: string;
  /** Fecha fin en formato YYYY-MM-DD (inclusiva). */
  fechaHasta: string;
  /** UUID de sucursal (opcional). */
  sucursalId?: string;
  /** Nombre exacto del cajero (opcional). */
  cajero?: string;
  /** Número de página 1-based (default: 1). */
  pagina?: number;
}

/** Resultado paginado para la vista de historial. */
export interface ResultadoHistorial {
  datos: CorteConSucursal[];
  /** Total de registros que coinciden con los filtros (sin paginación). */
  total: number;
  /** Página actual devuelta. */
  pagina: number;
}

/** Listas de opciones para poblar dropdowns de filtros. */
export interface ListasFiltros {
  sucursales: Sucursal[];
}

/** Interfaz pública del hook useSupervisorQueries. */
export interface UseSupervisorQueriesReturn {
  /** true mientras cualquier query está en progreso. */
  cargando: boolean;
  /** Mensaje de error del último query fallido (null si sin error). */
  error: string | null;
  /** Obtiene todos los cortes FINALIZADOS del día actual. */
  obtenerCortesDelDia: () => Promise<CorteConSucursal[]>;
  /** Obtiene el detalle completo de un corte por ID. */
  obtenerCorteDetalle: (id: string) => Promise<CorteConSucursal | null>;
  /** Obtiene historial de cortes filtrado y paginado. */
  obtenerHistorial: (filtros: FiltrosHistorial) => Promise<ResultadoHistorial>;
  /** Obtiene listas de sucursales activas para filtros. */
  obtenerListasFiltros: () => Promise<ListasFiltros>;
}

// ---------------------------------------------------------------------------
// 3. Helpers privados
// ---------------------------------------------------------------------------

/**
 * Calcula el rango ISO de inicio/fin del día actual en timezone El Salvador.
 *
 * @remarks Usa `Intl.DateTimeFormat` para obtener la fecha local correcta
 * independientemente del timezone de la máquina que ejecuta la app.
 */
function getRangoDiaElSalvador(): { inicio: string; fin: string } {
  // 'sv-SE' produce YYYY-MM-DD, útil para construir rangos ISO
  const fechaHoy = new Date().toLocaleDateString('sv-SE', { timeZone: TIMEZONE_NEGOCIO });
  return {
    inicio: `${fechaHoy}T00:00:00.000-06:00`,
    fin: `${fechaHoy}T23:59:59.999-06:00`,
  };
}

/**
 * Convierte una fecha YYYY-MM-DD al inicio/fin del día en timezone negocio.
 */
function fechaAISORange(fechaYYYYMMDD: string): { inicio: string; fin: string } {
  return {
    inicio: `${fechaYYYYMMDD}T00:00:00.000-06:00`,
    fin: `${fechaYYYYMMDD}T23:59:59.999-06:00`,
  };
}

/**
 * Convierte el resultado crudo de Supabase (con join sucursales) al tipo
 * CorteConSucursal. Usa `unknown` como paso intermedio para evitar `any`.
 */
function toCorteConSucursal(raw: unknown): CorteConSucursal {
  return raw as CorteConSucursal;
}

// ---------------------------------------------------------------------------
// 4. Hook principal
// ---------------------------------------------------------------------------

/**
 * Hook de solo lectura para el Dashboard Supervisor.
 *
 * Encapsula los 4 queries Supabase necesarios: cortes del día, detalle,
 * historial paginado y listas de filtros.
 *
 * @example
 * ```tsx
 * const { cargando, error, obtenerCortesDelDia } = useSupervisorQueries();
 * const cortes = await obtenerCortesDelDia();
 * ```
 */
export function useSupervisorQueries(): UseSupervisorQueriesReturn {
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ── Helpers internos ───────────────────────────────────────────────────────

  function iniciarQuery() {
    setCargando(true);
    setError(null);
  }

  function finalizarQuery(err?: Error) {
    setCargando(false);
    if (err) {
      setError(err.message);
    }
  }

  // ── Query 1: Cortes del día ────────────────────────────────────────────────

  /**
   * Obtiene todos los cortes FINALIZADOS del día actual (timezone El Salvador),
   * ordenados por finalizado_at DESC con datos de sucursal embebidos.
   */
  const obtenerCortesDelDia = useCallback(async (): Promise<CorteConSucursal[]> => {
    iniciarQuery();
    try {
      const { inicio, fin } = getRangoDiaElSalvador();

      const { data, error: supabaseError } = await tables
        .cortes()
        .select('*, sucursales(id, nombre, codigo, activa)')
        .eq('estado', 'FINALIZADO')
        .gte('created_at', inicio)
        .lte('created_at', fin)
        .order('finalizado_at', { ascending: false });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      finalizarQuery();
      return (data ?? []).map(toCorteConSucursal);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Error inesperado al obtener cortes del día');
      finalizarQuery(e);
      return [];
    }
  }, []);

  // ── Query 2: Detalle de corte ──────────────────────────────────────────────

  /**
   * Obtiene todos los campos de un corte por ID (incluye JSONB completos
   * y datos de sucursal). Retorna null si no existe.
   */
  const obtenerCorteDetalle = useCallback(async (id: string): Promise<CorteConSucursal | null> => {
    iniciarQuery();
    try {
      const { data, error: supabaseError } = await tables
        .cortes()
        .select('*, sucursales(id, nombre, codigo, activa)')
        .eq('id', id)
        .maybeSingle();

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      finalizarQuery();
      return data ? toCorteConSucursal(data) : null;
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Error inesperado al obtener detalle de corte');
      finalizarQuery(e);
      return null;
    }
  }, []);

  // ── Query 3: Historial filtrado ────────────────────────────────────────────

  /**
   * Obtiene historial de cortes FINALIZADOS con filtros opcionales y paginación.
   * Máximo 50 resultados por página.
   */
  const obtenerHistorial = useCallback(async (filtros: FiltrosHistorial): Promise<ResultadoHistorial> => {
    iniciarQuery();
    const paginaActual = filtros.pagina ?? 1;
    const desde = (paginaActual - 1) * RESULTADOS_POR_PAGINA;
    const hasta = desde + RESULTADOS_POR_PAGINA - 1;

    try {
      const rangoDesde = fechaAISORange(filtros.fechaDesde);
      const rangoHasta = fechaAISORange(filtros.fechaHasta);

      let query = tables
        .cortes()
        .select('*, sucursales(id, nombre, codigo, activa)', { count: 'exact' })
        .eq('estado', 'FINALIZADO')
        .gte('created_at', rangoDesde.inicio)
        .lte('created_at', rangoHasta.fin)
        .order('finalizado_at', { ascending: false })
        .range(desde, hasta);

      if (filtros.sucursalId) {
        query = query.eq('sucursal_id', filtros.sucursalId);
      }

      if (filtros.cajero) {
        query = query.eq('cajero', filtros.cajero);
      }

      const { data, error: supabaseError, count } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      finalizarQuery();
      return {
        datos: (data ?? []).map(toCorteConSucursal),
        total: count ?? 0,
        pagina: paginaActual,
      };
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Error inesperado al obtener historial');
      finalizarQuery(e);
      return { datos: [], total: 0, pagina: paginaActual };
    }
  }, []);

  // ── Query 4: Listas para filtros ──────────────────────────────────────────

  /**
   * Obtiene sucursales activas para poblar el dropdown de filtros del historial.
   */
  const obtenerListasFiltros = useCallback(async (): Promise<ListasFiltros> => {
    iniciarQuery();
    try {
      const { data, error: supabaseError } = await tables
        .sucursales()
        .select('*')
        .eq('activa', true)
        .order('nombre', { ascending: true });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      finalizarQuery();
      return {
        sucursales: data ?? [],
      };
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Error inesperado al obtener listas de filtros');
      finalizarQuery(e);
      return { sucursales: [] };
    }
  }, []);

  // ── Return ─────────────────────────────────────────────────────────────────

  return {
    cargando,
    error,
    obtenerCortesDelDia,
    obtenerCorteDetalle,
    obtenerHistorial,
    obtenerListasFiltros,
  };
}
