// 🤖 [IA] - Orden #3 DACC Dashboard Supervisor — CortesDelDia (Vista A)
// Lista de cortes FINALIZADOS del día actual con auto-refresco cada 60 segundos.
// Estados: cargando inicial, error sin datos, lista vacía, lista con datos.

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupervisorQueries } from '@/hooks/useSupervisorQueries';
import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';
import { CorteListaItem } from './CorteListaItem';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

/** Intervalo de auto-refresco de la lista (60 segundos). */
const INTERVALO_REFRESCO_MS = 60_000;

// ---------------------------------------------------------------------------
// Helper privado
// ---------------------------------------------------------------------------

function formatearHoraActualizacion(fecha: Date): string {
  try {
    return new Intl.DateTimeFormat('es', {
      timeZone: 'America/El_Salvador',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).format(fecha);
  } catch {
    return '';
  }
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Vista A del Dashboard Supervisor: lista de cortes del día actual.
 *
 * Se auto-refresca cada 60 segundos. Muestra spinner en carga inicial,
 * pantalla de error con botón reintentar, y pantalla vacía si no hay cortes.
 *
 * @example
 * ```tsx
 * // Dentro de la ruta /supervisor/cortes
 * <CortesDelDia />
 * ```
 */
export function CortesDelDia() {
  const navigate = useNavigate();
  const { cargando, error, obtenerCortesDelDia } = useSupervisorQueries();

  const [cortes, setCortes] = useState<CorteConSucursal[]>([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState<Date | null>(null);

  // ── Carga de datos ────────────────────────────────────────────────────────

  /**
   * Carga los cortes del día y actualiza estado.
   * Memoizado con [obtenerCortesDelDia] — estable porque useSupervisorQueries
   * devuelve callbacks con useCallback([], []).
   */
  const cargarCortes = useCallback(async () => {
    const resultado = await obtenerCortesDelDia();
    setCortes(resultado);
    setUltimaActualizacion(new Date());
  }, [obtenerCortesDelDia]);

  /**
   * Carga inicial + auto-refresco cada 60 s.
   * Un único useEffect con [cargarCortes] evita loops de dependencias.
   */
  useEffect(() => {
    void cargarCortes();
    const intervalId = setInterval(() => void cargarCortes(), INTERVALO_REFRESCO_MS);
    return () => clearInterval(intervalId);
  }, [cargarCortes]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const irADetalle = useCallback(
    (id: string) => navigate(`/supervisor/corte/${id}`),
    [navigate],
  );

  const manejarReintentar = useCallback(() => void cargarCortes(), [cargarCortes]);

  // ── Estados de render ────────────────────────────────────────────────────

  // Cargando inicial (sin datos previos)
  if (cargando && cortes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div
          className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/70 animate-spin"
          role="status"
          aria-label="Cargando cortes del día"
        />
        <p className="text-sm text-white/50">Cargando cortes del día…</p>
      </div>
    );
  }

  // Error sin datos disponibles
  if (error !== null && cortes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 px-6 text-center">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
          <span className="text-red-400 text-xl" aria-hidden="true">!</span>
        </div>
        <div>
          <p className="text-sm font-medium text-white/80">No se pudieron cargar los cortes</p>
          <p className="text-xs text-white/40 mt-1">{error}</p>
        </div>
        <button
          type="button"
          onClick={manejarReintentar}
          className="mt-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/15 text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          Reintentar
        </button>
      </div>
    );
  }

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Encabezado con timestamp de última actualización */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-base font-semibold text-white/90">Cortes de hoy</h2>
        <div className="flex items-center gap-2">
          {cargando && (
            <div
              className="h-3 w-3 rounded-full border border-white/20 border-t-white/60 animate-spin"
              role="status"
              aria-label="Actualizando"
            />
          )}
          {ultimaActualizacion && (
            <span className="text-xs text-white/40">
              Actualizado {formatearHoraActualizacion(ultimaActualizacion)}
            </span>
          )}
        </div>
      </div>

      {/* Error parcial (hay datos pero también hay error) */}
      {error !== null && cortes.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
          <span className="text-yellow-400 text-xs">⚠</span>
          <p className="text-xs text-yellow-300/80">
            No se pudo actualizar la lista. Mostrando datos previos.
          </p>
          <button
            type="button"
            onClick={manejarReintentar}
            className="ml-auto text-xs text-yellow-300/60 hover:text-yellow-300/90 underline underline-offset-2 focus-visible:outline-none"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de cortes o estado vacío */}
      {cortes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="h-12 w-12 rounded-full bg-white/[0.04] flex items-center justify-center">
            <span className="text-white/30 text-xl" aria-hidden="true">○</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white/60">Sin cortes finalizados</p>
            <p className="text-xs text-white/30 mt-1">
              Los cortes del día aparecerán aquí al finalizarse.
            </p>
          </div>
        </div>
      ) : (
        <ul className="flex flex-col gap-2" role="list" aria-label="Lista de cortes del día">
          {cortes.map((corte) => (
            <li key={corte.id}>
              <CorteListaItem corte={corte} onClick={irADetalle} />
            </li>
          ))}
        </ul>
      )}

      {/* Pie: conteo total */}
      {cortes.length > 0 && (
        <p className="text-xs text-white/30 text-center pt-1">
          {cortes.length} {cortes.length === 1 ? 'corte' : 'cortes'} finalizados hoy
        </p>
      )}
    </div>
  );
}
