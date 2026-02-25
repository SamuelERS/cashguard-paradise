// 🤖 [IA] - Orden #5 DACC Dashboard Supervisor — FiltrosHistorial
// Formulario de filtros para el historial de cortes.
// Semi-controlado: estado interno para los campos, emite onBuscar al presionar "Buscar".

import { useState } from 'react';
import type { FiltrosHistorial as FiltrosHistorialType } from '@/hooks/useSupervisorQueries';
import type { Sucursal } from '@/types/auditoria';

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface FiltrosHistorialProps {
  /** Filtros con los que se inicializa el formulario (solo para estado inicial). */
  filtrosIniciales: FiltrosHistorialType;
  /** Lista de sucursales activas para el dropdown. */
  sucursales: Sucursal[];
  /** true mientras se ejecuta una búsqueda (deshabilita el botón). */
  cargando: boolean;
  /** Llamado al presionar "Buscar" con los filtros del formulario. */
  onBuscar: (filtros: FiltrosHistorialType) => void;
}

function hoyElSalvadorISO(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/El_Salvador' });
}

function haceNDiasISO(dias: number): string {
  const base = new Date();
  base.setDate(base.getDate() - dias);
  return base.toLocaleDateString('sv-SE', { timeZone: 'America/El_Salvador' });
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Formulario de filtros para el historial de cortes.
 *
 * Mantiene estado interno para los campos del formulario.
 * Solo emite `onBuscar` al presionar el botón (no en cada keystroke).
 *
 * @example
 * ```tsx
 * <FiltrosHistorial
 *   filtrosIniciales={FILTROS_DEFAULT}
 *   sucursales={sucursales}
 *   cargando={cargando}
 *   onBuscar={setFiltrosActivos}
 * />
 * ```
 */
export function FiltrosHistorial({
  filtrosIniciales,
  sucursales,
  cargando,
  onBuscar,
}: FiltrosHistorialProps) {
  const [fechaDesde, setFechaDesde] = useState(filtrosIniciales.fechaDesde);
  const [fechaHasta, setFechaHasta] = useState(filtrosIniciales.fechaHasta);
  const [sucursalId, setSucursalId] = useState(filtrosIniciales.sucursalId ?? '');
  const [cajero, setCajero] = useState(filtrosIniciales.cajero ?? '');
  const [estado, setEstado] = useState(filtrosIniciales.estado ?? 'TODOS');

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleBuscar() {
    onBuscar({
      fechaDesde,
      fechaHasta,
      sucursalId: sucursalId || undefined,
      cajero: cajero.trim() || undefined,
      estado,
      pagina: 1,
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    handleBuscar();
  }

  function aplicarAtajo(dias: number) {
    const nuevaFechaHasta = hoyElSalvadorISO();
    const nuevaFechaDesde = haceNDiasISO(dias);
    setFechaDesde(nuevaFechaDesde);
    setFechaHasta(nuevaFechaHasta);
  }

  function handleLimpiar() {
    setFechaDesde(filtrosIniciales.fechaDesde);
    setFechaHasta(filtrosIniciales.fechaHasta);
    setSucursalId(filtrosIniciales.sucursalId ?? '');
    setCajero(filtrosIniciales.cajero ?? '');
    setEstado(filtrosIniciales.estado ?? 'TODOS');
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <form
      className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-3 md:p-4"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">Filtros</p>
            <p className="mt-1 text-xs text-white/55">Refina el historial sin perder contexto</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-[0.16em] text-white/35">
              Rango rápido
            </span>
            <button
              type="button"
              onClick={() => aplicarAtajo(0)}
              className="h-7 rounded-md border border-cyan-300/30 bg-cyan-400/[0.12] px-2 text-[11px] font-medium text-cyan-100 transition-colors hover:bg-cyan-400/[0.2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40"
            >
              Hoy
            </button>
            <button
              type="button"
              onClick={() => aplicarAtajo(7)}
              className="h-7 rounded-md border border-white/10 bg-white/[0.04] px-2 text-[11px] text-white/80 transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Últimos 7 días
            </button>
            <button
              type="button"
              onClick={() => aplicarAtajo(30)}
              className="h-7 rounded-md border border-white/10 bg-white/[0.04] px-2 text-[11px] text-white/80 transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              30 días
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-6 xl:grid-cols-12">
          <label className="flex flex-col gap-1 md:col-span-3 xl:col-span-2">
            <span className="text-[11px] text-white/55">Desde</span>
            <input
              type="date"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
              max={fechaHasta}
              className="h-8 rounded-md border border-white/10 bg-white/[0.06] px-2.5 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-cyan-300/25 [color-scheme:dark]"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-3 xl:col-span-2">
            <span className="text-[11px] text-white/55">Hasta</span>
            <input
              type="date"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
              min={fechaDesde}
              className="h-8 rounded-md border border-white/10 bg-white/[0.06] px-2.5 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-cyan-300/25 [color-scheme:dark]"
            />
          </label>
          <label className="flex flex-col gap-1 md:col-span-3 xl:col-span-3">
            <span className="text-[11px] text-white/55">Sucursal</span>
            <select
              value={sucursalId}
              onChange={e => setSucursalId(e.target.value)}
              className="h-8 rounded-md border border-white/10 bg-white/[0.06] px-2.5 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-cyan-300/25 [color-scheme:dark]"
            >
              <option value="">Todas las sucursales</option>
              {sucursales.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 md:col-span-3 xl:col-span-2">
            <span className="text-[11px] text-white/55">Estado</span>
            <select
              value={estado}
              onChange={e => setEstado(e.target.value as FiltrosHistorialType['estado'])}
              className="h-8 rounded-md border border-white/10 bg-white/[0.06] px-2.5 text-sm text-white/85 focus:outline-none focus:ring-2 focus:ring-cyan-300/25 [color-scheme:dark]"
            >
              <option value="TODOS">Todos</option>
              <option value="EN_PROGRESO">En progreso</option>
              <option value="INICIADO">Iniciado</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="ABORTADO">Abortado</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 md:col-span-4 xl:col-span-3">
            <span className="text-[11px] text-white/55">Cajero</span>
            <input
              type="text"
              value={cajero}
              onChange={e => setCajero(e.target.value)}
              placeholder="Nombre exacto del cajero"
              className="h-8 rounded-md border border-white/10 bg-white/[0.06] px-2.5 text-sm text-white/85 placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-cyan-300/25"
            />
          </label>
          <div className="flex items-end gap-2 md:col-span-2 xl:col-span-2">
            <button
              type="button"
              onClick={handleLimpiar}
              disabled={cargando}
              className="h-8 flex-1 rounded-md border border-white/10 bg-white/[0.03] px-2 text-xs font-medium text-white/75 transition-colors hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={cargando}
              className="h-8 flex-1 rounded-md border border-cyan-300/25 bg-gradient-to-r from-cyan-500/25 via-sky-400/20 to-cyan-500/25 px-2 text-xs font-semibold text-cyan-100 transition-colors hover:from-cyan-500/35 hover:via-sky-400/30 hover:to-cyan-500/35 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40"
            >
              {cargando ? 'Buscando…' : 'Buscar'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
