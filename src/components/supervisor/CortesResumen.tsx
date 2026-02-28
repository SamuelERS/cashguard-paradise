// src/components/supervisor/CortesResumen.tsx
// 🤖 [IA] - v4.1.0: Pantalla KPI/Analytics — tab "Resumen" del Dashboard Supervisor

import { useState } from 'react';
import { useSupervisorAnalytics } from '@/hooks/supervisor/useSupervisorAnalytics';
import type { KpiGlobal, KpiSucursal } from '@/hooks/supervisor/useSupervisorAnalytics';
import { formatCurrency } from '@/utils/calculations';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hoyLocal(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'America/El_Salvador' });
}

function hace6DiasLocal(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toLocaleDateString('sv-SE', { timeZone: 'America/El_Salvador' });
}

function diasDelPeriodo(fechaDesde: string, fechaHasta: string): number | null {
  const desde = new Date(`${fechaDesde}T00:00:00`);
  const hasta = new Date(`${fechaHasta}T00:00:00`);

  if (Number.isNaN(desde.getTime()) || Number.isNaN(hasta.getTime()) || desde > hasta) {
    return null;
  }

  return Math.floor((hasta.getTime() - desde.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

// ---------------------------------------------------------------------------
// Sub-componente: tarjeta KPI simple
// ---------------------------------------------------------------------------

interface KpiCardProps {
  label:     string;
  value:     string;
  sub?:      string;
  variant?:  'neutral' | 'green' | 'red' | 'yellow';
}

function KpiCard({ label, value, sub, variant = 'neutral' }: KpiCardProps) {
  const colorValue = {
    neutral: 'text-white/95',
    green:   'text-emerald-400',
    red:     'text-red-400',
    yellow:  'text-yellow-400',
  }[variant];

  return (
    <div className="rounded-xl border border-white/10 bg-gradient-to-b from-white/10 to-white/[0.03] px-4 py-3 space-y-1">
      <p className="text-[11px] font-semibold text-white/45 uppercase tracking-[0.16em]">{label}</p>
      <p className={cn('text-xl font-bold tabular-nums leading-none', colorValue)}>{value}</p>
      {sub && <p className="text-[11px] text-white/55 leading-tight">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-componente: fila por sucursal
// ---------------------------------------------------------------------------

function FilaSucursal({ s, totalCortesGlobal }: { s: KpiSucursal; totalCortesGlobal: number }) {
  const pct = totalCortesGlobal > 0 ? Math.round((s.totalCortes / totalCortesGlobal) * 100) : 0;
  const estado = s.diferencia === 0 ? 'Exacto' : s.diferencia > 0 ? 'Sobrante' : 'Faltante';
  const estadoClass =
    s.diferencia === 0
      ? 'bg-white/10 text-white/75 border-white/20'
      : s.diferencia > 0
        ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50'
        : 'bg-red-900/40 text-red-300 border-red-700/50';
  const diferenciaVariant = s.diferencia > 0 ? 'text-emerald-300' : s.diferencia < 0 ? 'text-red-300' : 'text-white/70';

  return (
    <article className="rounded-xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-3.5 space-y-2.5">
      {/* Header sucursal */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xl leading-none font-semibold text-white/90">{s.sucursalNombre}</span>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <span className="text-[11px] text-white/50">{s.totalCortes} corte{s.totalCortes !== 1 ? 's' : ''} ({pct}%)</span>
          <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', estadoClass)}>
            {estado}
          </span>
        </div>
      </div>

      {/* Métricas compactas */}
      <dl
        data-testid="sucursal-metrics"
        className="rounded-lg border border-white/10 bg-black/20 divide-y divide-white/10"
      >
        <div data-testid="sucursal-metric-row" className="flex items-center justify-between px-3 py-2">
          <dt className="text-[12px] text-white/50">Ajustado</dt>
          <dd className="text-[17px] font-semibold text-white/95 tabular-nums">{formatCurrency(s.totalAdjusted)}</dd>
        </div>
        <div data-testid="sucursal-metric-row" className="flex items-center justify-between px-3 py-2">
          <dt className="text-[12px] text-white/50">Esperado</dt>
          <dd className="text-[16px] text-white/90 tabular-nums">{formatCurrency(s.totalEsperado)}</dd>
        </div>
        <div data-testid="sucursal-metric-row" className="flex items-center justify-between px-3 py-2">
          <dt className="text-[12px] text-white/50">Diferencia</dt>
          <dd className={cn('text-[16px] font-semibold tabular-nums', diferenciaVariant)}>
            {s.diferencia >= 0 ? '+' : ''}{formatCurrency(s.diferencia)}
          </dd>
        </div>
        <div data-testid="sucursal-metric-row" className="flex items-center justify-between px-3 py-2">
          <dt className="text-[12px] text-white/50">Gastos</dt>
          <dd className="text-[15px] text-yellow-300 tabular-nums">{formatCurrency(s.totalExpenses)}</dd>
        </div>
      </dl>

      {/* Semáforo mini */}
      <div className="flex flex-wrap gap-1.5">
        {s.sobrantes > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-900/50 text-emerald-400">
            +{s.sobrantes} sobrante{s.sobrantes !== 1 ? 's' : ''}
          </span>
        )}
        {s.faltantes > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-900/50 text-red-400">
            {s.faltantes} faltante{s.faltantes !== 1 ? 's' : ''}
          </span>
        )}
        {s.exactos > 0 && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/40">
            {s.exactos} exacto{s.exactos !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </article>
  );
}

// ---------------------------------------------------------------------------
// Sub-componente: resumen global
// ---------------------------------------------------------------------------

function ResumenGlobal({ kpi }: { kpi: KpiGlobal }) {
  const diferenciaGlobal = kpi.diferencia;
  const diferenciaVariant: KpiCardProps['variant'] =
    diferenciaGlobal > 0 ? 'green' : diferenciaGlobal < 0 ? 'red' : 'neutral';

  return (
    <section className="space-y-3.5">
      <h2 className="text-xs font-semibold text-white/45 uppercase tracking-[0.15em]">
        Resumen global
      </h2>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <KpiCard
          label="Total ajustado"
          value={formatCurrency(kpi.totalAdjusted)}
          sub={`${kpi.totalCortes} corte${kpi.totalCortes !== 1 ? 's' : ''}`}
        />
        <KpiCard
          label="Diferencia"
          value={(diferenciaGlobal >= 0 ? '+' : '') + formatCurrency(diferenciaGlobal)}
          sub={`Esperado: ${formatCurrency(kpi.totalEsperado)}`}
          variant={diferenciaVariant}
        />
        <KpiCard
          label="Gastos totales"
          value={formatCurrency(kpi.totalExpenses)}
          variant="yellow"
        />
        <KpiCard
          label="Efectivo / Elec."
          value={formatCurrency(kpi.totalCash)}
          sub={`Elec: ${formatCurrency(kpi.totalElectronic)}`}
        />
      </div>

      {/* Semáforo global */}
      <div className="flex gap-2">
        <div className="flex-1 rounded-lg bg-emerald-900/30 border border-emerald-800/40 p-3 text-center">
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">{kpi.sobrantes}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Sobrantes</p>
        </div>
        <div className="flex-1 rounded-lg bg-red-900/30 border border-red-800/40 p-3 text-center">
          <p className="text-2xl font-bold text-red-400 tabular-nums">{kpi.faltantes}</p>
          <p className="text-[11px] text-red-600 mt-0.5">Faltantes</p>
        </div>
        <div className="flex-1 rounded-lg bg-white/5 border border-white/10 p-3 text-center">
          <p className="text-2xl font-bold text-white/50 tabular-nums">{kpi.exactos}</p>
          <p className="text-[11px] text-white/30 mt-0.5">Exactos</p>
        </div>
      </div>
    </section>
  );
}

function AlertasOperativas({ kpi }: { kpi: KpiGlobal }) {
  const desviaciones = kpi.faltantes + kpi.sobrantes;
  const sucursalCritica = kpi.porSucursal.reduce<KpiSucursal | null>((actual, sucursal) => {
    if (!actual) return sucursal;
    return Math.abs(sucursal.diferencia) > Math.abs(actual.diferencia) ? sucursal : actual;
  }, null);

  const nivelClase =
    kpi.faltantes > 0
      ? 'border-red-700/50 bg-red-900/25 text-red-200'
      : desviaciones === 0
        ? 'border-emerald-700/50 bg-emerald-900/25 text-emerald-200'
        : 'border-amber-700/50 bg-amber-900/25 text-amber-200';

  const mensajePrincipal =
    kpi.faltantes > 0
      ? `Hay ${kpi.faltantes} faltante${kpi.faltantes === 1 ? '' : 's'} por revisar hoy.`
      : desviaciones === 0
        ? 'Todos los cierres del periodo quedaron exactos.'
        : `Sin faltantes, pero existen ${kpi.sobrantes} sobrante${kpi.sobrantes === 1 ? '' : 's'}.`;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold text-white/45 uppercase tracking-[0.15em]">
        Alertas operativas
      </h2>

      <div className={cn('rounded-xl border px-4 py-3', nivelClase)}>
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/60">Prioridad del turno</p>
        <p className="mt-1 text-sm font-semibold">{mensajePrincipal}</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] text-white/45 uppercase tracking-[0.16em]">Faltantes detectados</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-red-300">{kpi.faltantes}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] text-white/45 uppercase tracking-[0.16em]">Diferencia neta</p>
          <p className={cn('mt-1 text-lg font-bold tabular-nums', kpi.diferencia < 0 ? 'text-red-300' : kpi.diferencia > 0 ? 'text-amber-300' : 'text-emerald-300')}>
            {kpi.diferencia >= 0 ? '+' : ''}{formatCurrency(kpi.diferencia)}
          </p>
        </div>
      </div>

      {sucursalCritica && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
          <p className="text-[11px] text-white/45 uppercase tracking-[0.16em]">Sucursal con mayor desvío</p>
          <p className="mt-1 text-sm text-white/85">
            {sucursalCritica.sucursalNombre}:
            {' '}
            <span className={cn('font-semibold tabular-nums', sucursalCritica.diferencia < 0 ? 'text-red-300' : sucursalCritica.diferencia > 0 ? 'text-amber-300' : 'text-emerald-300')}>
              {sucursalCritica.diferencia >= 0 ? '+' : ''}{formatCurrency(sucursalCritica.diferencia)}
            </span>
          </p>
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Componente principal — named export (patrón supervisor existente)
// ---------------------------------------------------------------------------

// 🤖 [IA] - v4.1.0: Named export (patrón CortesDelDia, CorteDetalle, CorteHistorial)
export function CortesResumen() {
  const [fechaDesde, setFechaDesde] = useState(hace6DiasLocal);
  const [fechaHasta, setFechaHasta] = useState(hoyLocal);

  const { kpi, cargando, error, recargar } = useSupervisorAnalytics({
    fechaDesde,
    fechaHasta,
  });
  const hoy = hoyLocal();
  const periodoDias = diasDelPeriodo(fechaDesde, fechaHasta);
  const rangoHoy = fechaDesde === hoy && fechaHasta === hoy;
  const rangoSemanal = fechaDesde === hace6DiasLocal() && fechaHasta === hoy;

  const aplicarRangoHoy = () => {
    const fecha = hoyLocal();
    setFechaDesde(fecha);
    setFechaHasta(fecha);
  };

  const aplicarRangoSemanal = () => {
    setFechaDesde(hace6DiasLocal());
    setFechaHasta(hoyLocal());
  };

  // ── Filtros de fecha ──────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-900/20 via-slate-950 to-slate-900/50 p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-white/90">Vista operativa del periodo</h2>
            <p className="text-xs text-white/60">
              {periodoDias
                ? `${periodoDias} día${periodoDias === 1 ? '' : 's'} seleccionados para análisis`
                : 'Selecciona un rango de fechas válido para analizar'}
            </p>
          </div>
          <button
            type="button"
            onClick={recargar}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white/80 hover:text-white hover:border-white/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            aria-label="Recargar datos"
          >
            Actualizar
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={aplicarRangoHoy}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
              rangoHoy
                ? 'border-emerald-500/60 bg-emerald-900/40 text-emerald-200'
                : 'border-white/15 bg-white/5 text-white/65 hover:text-white/90 hover:border-white/30',
            )}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={aplicarRangoSemanal}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
              rangoSemanal
                ? 'border-cyan-500/60 bg-cyan-900/40 text-cyan-200'
                : 'border-white/15 bg-white/5 text-white/65 hover:text-white/90 hover:border-white/30',
            )}
          >
            Últimos 7 días
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 items-end">
          <div className="space-y-1">
            <label className="text-[11px] text-white/45 uppercase tracking-[0.16em]">Desde</label>
            <input
              type="date"
              value={fechaDesde}
              max={fechaHasta}
              onChange={e => setFechaDesde(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-white/90 focus:outline-none focus:border-cyan-400/60"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-white/45 uppercase tracking-[0.16em]">Hasta</label>
            <input
              type="date"
              value={fechaHasta}
              min={fechaDesde}
              onChange={e => setFechaHasta(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-slate-900/60 px-3 py-2 text-sm text-white/90 focus:outline-none focus:border-cyan-400/60"
            />
          </div>
        </div>
      </section>

      {/* Estado: cargando */}
      {cargando && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] py-12 text-center text-sm text-white/40 animate-pulse">
          Cargando datos…
        </div>
      )}

      {/* Estado: error */}
      {!cargando && error && (
        <div className="rounded-lg border border-red-800/40 bg-red-900/20 px-4 py-3 text-sm text-red-400">
          Error: {error}
          <button
            type="button"
            onClick={recargar}
            className="ml-3 underline text-red-400/70 hover:text-red-400"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Estado: sin datos */}
      {!cargando && !error && kpi && kpi.totalCortes === 0 && (
        <div className="rounded-xl border border-white/10 bg-white/[0.03] py-12 text-center text-sm text-white/40">
          Sin cortes finalizados en el período seleccionado.
        </div>
      )}

      {/* Estado: datos OK */}
      {!cargando && !error && kpi && kpi.totalCortes > 0 && (
        <>
          <AlertasOperativas kpi={kpi} />
          <ResumenGlobal kpi={kpi} />

          <section className="space-y-2.5">
            <h2 className="text-xs font-semibold text-white/45 uppercase tracking-[0.15em]">
              Por sucursal
            </h2>
            <div data-testid="sucursal-grid" className="grid grid-cols-1 gap-2.5">
              {kpi.porSucursal.map(s => (
                <FilaSucursal
                  key={s.sucursalId}
                  s={s}
                  totalCortesGlobal={kpi.totalCortes}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
