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

  function handleKeyDownCajero(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleBuscar();
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.04]">
      {/* Rango de fechas */}
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/50">Desde</span>
          <input
            type="date"
            value={fechaDesde}
            onChange={e => setFechaDesde(e.target.value)}
            max={fechaHasta}
            className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20 [color-scheme:dark]"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs text-white/50">Hasta</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={e => setFechaHasta(e.target.value)}
            min={fechaDesde}
            className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20 [color-scheme:dark]"
          />
        </label>
      </div>

      {/* Sucursal */}
      <label className="flex flex-col gap-1">
        <span className="text-xs text-white/50">Sucursal</span>
        <select
          value={sucursalId}
          onChange={e => setSucursalId(e.target.value)}
          className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20 [color-scheme:dark]"
        >
          <option value="">Todas las sucursales</option>
          {sucursales.map(s => (
            <option key={s.id} value={s.id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </label>

      {/* Estado */}
      <label className="flex flex-col gap-1">
        <span className="text-xs text-white/50">Estado</span>
        <select
          value={estado}
          onChange={e => setEstado(e.target.value as FiltrosHistorialType['estado'])}
          className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 focus:outline-none focus:ring-2 focus:ring-white/20 [color-scheme:dark]"
        >
          <option value="TODOS">Todos</option>
          <option value="EN_PROGRESO">En progreso</option>
          <option value="INICIADO">Iniciado</option>
          <option value="FINALIZADO">Finalizado</option>
          <option value="ABORTADO">Abortado</option>
        </select>
      </label>

      {/* Cajero */}
      <label className="flex flex-col gap-1">
        <span className="text-xs text-white/50">Cajero</span>
        <input
          type="text"
          value={cajero}
          onChange={e => setCajero(e.target.value)}
          onKeyDown={handleKeyDownCajero}
          placeholder="Nombre exacto del cajero"
          className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-white/20"
        />
      </label>

      {/* Botón buscar */}
      <button
        type="button"
        onClick={handleBuscar}
        disabled={cargando}
        className="mt-1 w-full py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      >
        {cargando ? 'Buscando…' : 'Buscar'}
      </button>
    </div>
  );
}
