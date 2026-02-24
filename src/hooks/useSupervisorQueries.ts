// 🤖 [IA] - Orden #2b DACC Dashboard Supervisor — Hook de queries Supabase
// Read-only: Encapsula los 4 queries del dashboard supervisor.
// Criterios: 0 errores TypeScript, 0 any, patrón tables.xxx() del proyecto.
// FIX: filtros usan finalizado_at (no created_at) + estado concurrente con contador.

import { useState, useCallback } from 'react';
import { tables } from '../lib/supabase';
import type { Corte, EstadoCorte, Sucursal } from '../types/auditoria';

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
  /** Estado a consultar en historial (`TODOS` incluye cortes no finalizados). */
  estado?: 'TODOS' | EstadoCorte;
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

async function reconciliarCortesVencidos(fechaCorte: string): Promise<void> {
  const tablesConRpc = tables as unknown as {
    rpc?: (
      fn: 'reconciliar_cortes_vencidos',
      args: { p_fecha_corte: string },
    ) => Promise<{ error: { message: string } | null }>;
  };

  if (!tablesConRpc.rpc) return;

  const { error: rpcError } = await tablesConRpc.rpc('reconciliar_cortes_vencidos', {
    p_fecha_corte: fechaCorte,
  });

  if (rpcError) {
    throw new Error(rpcError.message);
  }
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
  const [pendientes, setPendientes] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const cargando = pendientes > 0;

  // ── Helpers internos ───────────────────────────────────────────────────────

  function iniciarQuery() {
    setPendientes(prev => {
      // Solo limpiar error al iniciar batch fresco (0 queries en vuelo).
      // Si ya hay queries pendientes, preservar error existente.
      if (prev === 0) setError(null);
      return prev + 1;
    });
  }

  function finalizarQuery(err?: Error) {
    setPendientes(prev => prev - 1);
    if (err) {
      setError(err.message);
    }
  }

  // ── Query 1: Cortes del día ────────────────────────────────────────────────

  /**
   * Obtiene actividad de cortes del día actual (timezone El Salvador):
   * - Finalizados por finalizado_at
   * - Activos (INICIADO / EN_PROGRESO) por created_at
   * Devuelve una única lista ordenada por timestamp operativo DESC.
   */
  const obtenerCortesDelDia = useCallback(async (): Promise<CorteConSucursal[]> => {
    iniciarQuery();
    try {
      const { inicio, fin } = getRangoDiaElSalvador();
      await reconciliarCortesVencidos(inicio.slice(0, 10));

      const [finalizadosRes, activosRes] = await Promise.all([
        tables
          .cortes()
          .select('*, sucursales(id, nombre, codigo, activa)')
          .eq('estado', 'FINALIZADO')
          .gte('finalizado_at', inicio)
          .lte('finalizado_at', fin)
          .order('finalizado_at', { ascending: false }),
        tables
          .cortes()
          .select('*, sucursales(id, nombre, codigo, activa)')
          .in('estado', ['INICIADO', 'EN_PROGRESO'])
          .gte('created_at', inicio)
          .lte('created_at', fin)
          .order('created_at', { ascending: false }),
      ]);

      if (finalizadosRes.error) {
        throw new Error(finalizadosRes.error.message);
      }

      if (activosRes.error) {
        throw new Error(activosRes.error.message);
      }

      const merged = [...(activosRes.data ?? []), ...(finalizadosRes.data ?? [])]
        .map(toCorteConSucursal)
        .sort((a, b) => {
          const timeA = Date.parse(a.finalizado_at ?? a.created_at);
          const timeB = Date.parse(b.finalizado_at ?? b.created_at);
          const safeA = Number.isFinite(timeA) ? timeA : 0;
          const safeB = Number.isFinite(timeB) ? timeB : 0;
          return safeB - safeA;
        });

      finalizarQuery();
      return merged;
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
      await reconciliarCortesVencidos(filtros.fechaHasta);

      const estadoFiltro = filtros.estado ?? 'TODOS';

      let query = tables
        .cortes()
        .select('*, sucursales(id, nombre, codigo, activa)', { count: 'exact' })
        .range(desde, hasta);

      if (estadoFiltro === 'FINALIZADO') {
        query = query
          .eq('estado', 'FINALIZADO')
          .gte('finalizado_at', rangoDesde.inicio)
          .lte('finalizado_at', rangoHasta.fin)
          .order('finalizado_at', { ascending: false });
      } else {
        query = query
          .gte('created_at', rangoDesde.inicio)
          .lte('created_at', rangoHasta.fin)
          .order('created_at', { ascending: false });

        if (estadoFiltro !== 'TODOS') {
          query = query.eq('estado', estadoFiltro);
        }
      }

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
