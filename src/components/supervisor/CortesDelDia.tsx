// 🤖 [IA] - Orden #3 DACC Dashboard Supervisor — CortesDelDia (Vista A)
// Lista de actividad del día con invalidación realtime + fallback de polling.
// Estados: cargando inicial, error sin datos, lista vacía, lista con datos.

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSupervisorTodayFeed } from '@/hooks/supervisor/useSupervisorTodayFeed';
import { CorteListaItem } from './CorteListaItem';
import { SupervisorLiveBadge } from './SupervisorLiveBadge';
import { buildCorrelativoDashboardMetrics } from './correlativoMetrics';
import { buildSupervisorTodayViewModel } from './supervisorTodayOrdering';

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
  const {
    cortes,
    cargando,
    actualizando,
    error,
    ultimaActualizacion,
    realtimeStatus,
    refrescar,
  } = useSupervisorTodayFeed();
  const todayView = buildSupervisorTodayViewModel(cortes);
  const activos = todayView.activos;
  const finalizados = todayView.finalizados;
  const correlativoMetrics = buildCorrelativoDashboardMetrics(cortes);
  const sucursalesConActividad = correlativoMetrics.maxSecuencialPorSucursal.size;
  const resumenCorrelativoPorSucursal = Array.from(
    correlativoMetrics.maxSecuencialPorSucursal.entries(),
  )
    .sort(([codigoA], [codigoB]) => codigoA.localeCompare(codigoB))
    .map(([codigo, maxSecuencial]) => `${codigo}: #${String(maxSecuencial).padStart(3, '0')}`);
  const hayActividad = todayView.resumen.total > 0;
  const ultimaActividadTexto = todayView.resumen.ultimaActividad
    ? `${todayView.resumen.ultimaActividad.correlativo} · ${todayView.resumen.ultimaActividad.estado.replace(/_/g, ' ')}`
    : 'Sin actividad reciente';

  // ── Handlers ──────────────────────────────────────────────────────────────

  const irADetalle = useCallback(
    (id: string) => navigate(`/supervisor/corte/${id}`),
    [navigate],
  );

  const manejarReintentar = useCallback(() => void refrescar(), [refrescar]);

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
          <SupervisorLiveBadge
            status={realtimeStatus}
            actualizando={actualizando}
            spinnerAriaLabel="Actualizando"
          />
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

      {hayActividad && (
        <div className="sticky top-20 z-10 rounded-lg border border-white/10 bg-[#0b0b0b]/95 backdrop-blur px-3 py-2">
          <h3 className="text-xs font-semibold text-white/80">Resumen en vivo</h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/70">
            <span>Total cortes: {todayView.resumen.total}</span>
            <span>Activos: {todayView.resumen.activos}</span>
            <span>Finalizados: {todayView.resumen.finalizados}</span>
            <span>Activos atrasados: {correlativoMetrics.activosAtrasados}</span>
          </div>
          <p className="mt-1 text-[11px] text-white/55 truncate">
            Última actividad: {ultimaActividadTexto}
          </p>
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-white/55">
            <span className="px-2 py-0.5 rounded-full border border-white/10">
              Sucursales activas: {sucursalesConActividad}
            </span>
            {resumenCorrelativoPorSucursal.map((entry) => (
              <span key={entry} className="px-2 py-0.5 rounded-full border border-white/10">
                {entry}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actividad del día o estado vacío */}
      {!hayActividad ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
          <div className="h-12 w-12 rounded-full bg-white/[0.04] flex items-center justify-center">
            <span className="text-white/30 text-xl" aria-hidden="true">○</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white/60">Sin actividad de cortes hoy</p>
            <p className="text-xs text-white/30 mt-1">
              Los cortes activos y finalizados del día aparecerán aquí.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {activos.length > 0 && (
            <section className="flex flex-col gap-2" aria-label="Activos ahora">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-emerald-300/90">Activos ahora</h3>
                <span className="text-xs text-white/40">
                  {activos.length} {activos.length === 1 ? 'corte' : 'cortes'}
                </span>
              </div>
                <ul className="flex flex-col gap-2" role="list" aria-label="Lista de cortes activos">
                  {activos.map(corte => (
                    <li key={corte.id}>
                      <CorteListaItem
                        corte={corte}
                        onClick={irADetalle}
                        contextoCorrelativo={{
                          atraso: correlativoMetrics.atrasoPorCorteId.get(corte.id) ?? 0,
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}

          {finalizados.length > 0 && (
            <section className="flex flex-col gap-2" aria-label="Finalizados hoy">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-sky-300/90">Finalizados hoy</h3>
                <span className="text-xs text-white/40">
                  {finalizados.length} {finalizados.length === 1 ? 'corte' : 'cortes'}
                </span>
              </div>
                <ul className="flex flex-col gap-2" role="list" aria-label="Lista de cortes finalizados hoy">
                  {finalizados.map(corte => (
                    <li key={corte.id}>
                      <CorteListaItem
                        corte={corte}
                        onClick={irADetalle}
                        contextoCorrelativo={{
                          atraso: correlativoMetrics.atrasoPorCorteId.get(corte.id) ?? 0,
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
        </div>
      )}

      {/* Pie: conteo total */}
      {hayActividad && (
        <p className="text-xs text-white/30 text-center pt-1">
          {activos.length} activos · {finalizados.length} finalizados hoy
        </p>
      )}
    </div>
  );
}
