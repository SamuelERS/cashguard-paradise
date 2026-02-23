// 🤖 [IA] - Orden #5 DACC Dashboard Supervisor — CorteHistorial (Vista C)
// Historial paginado de cortes con filtros (fecha, sucursal, cajero).
// Estado reactivo: cambio de filtros → recarga automática.

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupervisorQueries } from '@/hooks/useSupervisorQueries';
import type {
  FiltrosHistorial as FiltrosHistorialType,
  ResultadoHistorial,
} from '@/hooks/useSupervisorQueries';
import { RESULTADOS_POR_PAGINA } from '@/hooks/useSupervisorQueries';
import type { Sucursal } from '@/types/auditoria';
import { FiltrosHistorial } from './FiltrosHistorial';
import { CorteListaItem } from './CorteListaItem';

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Retorna la fecha de hoy en formato YYYY-MM-DD en zona El Salvador.
 */
function hoyElSalvador(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/El_Salvador' });
}

/**
 * Retorna la fecha de hace `n` días en formato YYYY-MM-DD en zona El Salvador.
 */
function haceNDias(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toLocaleDateString('sv-SE', { timeZone: 'America/El_Salvador' });
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Vista C del Dashboard Supervisor: historial paginado de cortes.
 *
 * Compone `FiltrosHistorial` (formulario semi-controlado) y una lista de
 * `CorteListaItem`. Recarga automáticamente cuando `filtrosActivos` cambia.
 *
 * @example
 * ```tsx
 * // Dentro de la ruta /supervisor/historial
 * <CorteHistorial />
 * ```
 */
export function CorteHistorial() {
  const navigate = useNavigate();
  const { cargando, error, obtenerHistorial, obtenerListasFiltros } =
    useSupervisorQueries();

  // ── Estado ────────────────────────────────────────────────────────────────

  const [filtrosActivos, setFiltrosActivos] = useState<FiltrosHistorialType>(
    () => ({
      fechaDesde: haceNDias(7),
      fechaHasta: hoyElSalvador(),
      pagina: 1,
    }),
  );
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [resultado, setResultado] = useState<ResultadoHistorial | null>(null);

  // Referencia estable de los filtros iniciales para FiltrosHistorial.
  // useMemo con [] garantiza que el objeto no se re-crea entre renders.
  const filtrosDefault = useMemo<FiltrosHistorialType>(
    () => ({
      fechaDesde: haceNDias(7),
      fechaHasta: hoyElSalvador(),
      pagina: 1,
    }),
    [],
  );

  // ── Carga de sucursales (una vez al montar) ────────────────────────────

  useEffect(() => {
    void obtenerListasFiltros().then(listas => {
      setSucursales(listas.sucursales);
    });
  }, [obtenerListasFiltros]);

  // ── Carga del historial (reactiva a filtros) ───────────────────────────

  /**
   * Carga el historial con los filtros activos y actualiza estado.
   * Memoizado con [filtrosActivos, obtenerHistorial] para que useEffect
   * se dispare exactamente cuando los filtros cambian.
   */
  const cargarHistorial = useCallback(async () => {
    const r = await obtenerHistorial(filtrosActivos);
    setResultado(r);
  }, [filtrosActivos, obtenerHistorial]);

  useEffect(() => {
    void cargarHistorial();
  }, [cargarHistorial]);

  // ── Handlers ────────────────────────────────────────────────────────────

  /** Recibe nuevos filtros del formulario y resetea a página 1. */
  const handleBuscar = useCallback((filtros: FiltrosHistorialType) => {
    setFiltrosActivos(filtros);
  }, []);

  const handlePaginaAnterior = useCallback(() => {
    setFiltrosActivos(prev => ({ ...prev, pagina: (prev.pagina ?? 1) - 1 }));
  }, []);

  const handlePaginaSiguiente = useCallback(() => {
    setFiltrosActivos(prev => ({ ...prev, pagina: (prev.pagina ?? 1) + 1 }));
  }, []);

  const irADetalle = useCallback(
    (id: string) => navigate(`/supervisor/corte/${id}`),
    [navigate],
  );

  // ── Paginación ────────────────────────────────────────────────────────

  const totalPaginas = resultado
    ? Math.max(1, Math.ceil(resultado.total / RESULTADOS_POR_PAGINA))
    : 1;
  const paginaActual = filtrosActivos.pagina ?? 1;

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros */}
      <FiltrosHistorial
        filtrosIniciales={filtrosDefault}
        sucursales={sucursales}
        cargando={cargando}
        onBuscar={handleBuscar}
      />

      {/* Spinner de carga inicial (sin resultado previo) */}
      {cargando && resultado === null && (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div
            className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/70 animate-spin"
            role="status"
            aria-label="Cargando historial"
          />
          <p className="text-sm text-white/50">Cargando historial…</p>
        </div>
      )}

      {/* Error sin datos previos */}
      {error !== null && resultado === null && !cargando && (
        <div className="flex flex-col items-center justify-center py-12 gap-4 px-6 text-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-red-400 text-xl" aria-hidden="true">!</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">
              No se pudo cargar el historial
            </p>
            <p className="text-xs text-white/40 mt-1">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void cargarHistorial()}
            className="mt-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/15 text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Resultados */}
      {resultado !== null && (
        <>
          {/* Banner de error parcial (hay datos pero hubo error al actualizar) */}
          {error !== null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <span className="text-yellow-400 text-xs" aria-hidden="true">⚠</span>
              <p className="text-xs text-yellow-300/80">
                No se pudo actualizar. Mostrando datos previos.
              </p>
              <button
                type="button"
                onClick={() => void cargarHistorial()}
                className="ml-auto text-xs text-yellow-300/60 hover:text-yellow-300/90 underline underline-offset-2 focus-visible:outline-none"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Encabezado de resultados con spinner de refresco */}
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-white/40">
              {resultado.total === 0
                ? 'Sin resultados'
                : `${resultado.total} ${resultado.total === 1 ? 'corte' : 'cortes'}`}
            </p>
            {cargando && (
              <div
                className="h-3 w-3 rounded-full border border-white/20 border-t-white/60 animate-spin"
                role="status"
                aria-label="Actualizando"
              />
            )}
          </div>

          {/* Lista de cortes o estado vacío */}
          {resultado.datos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="h-12 w-12 rounded-full bg-white/[0.04] flex items-center justify-center">
                <span className="text-white/30 text-xl" aria-hidden="true">○</span>
              </div>
              <div>
                <p className="text-sm font-medium text-white/60">Sin cortes en este período</p>
                <p className="text-xs text-white/30 mt-1">
                  Ajusta los filtros para ampliar la búsqueda.
                </p>
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-2" role="list" aria-label="Lista de cortes">
              {resultado.datos.map(corte => (
                <li key={corte.id}>
                  <CorteListaItem corte={corte} onClick={irADetalle} />
                </li>
              ))}
            </ul>
          )}

          {/* Paginación */}
          {totalPaginas > 1 && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={handlePaginaAnterior}
                disabled={paginaActual <= 1 || cargando}
                className="px-3 py-1.5 rounded-lg text-sm text-white/60 bg-white/[0.06] hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                ← Anterior
              </button>
              <span className="text-xs text-white/40 tabular-nums">
                {paginaActual} / {totalPaginas}
              </span>
              <button
                type="button"
                onClick={handlePaginaSiguiente}
                disabled={paginaActual >= totalPaginas || cargando}
                className="px-3 py-1.5 rounded-lg text-sm text-white/60 bg-white/[0.06] hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
