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
    neutral: 'text-white/90',
    green:   'text-emerald-400',
    red:     'text-red-400',
    yellow:  'text-yellow-400',
  }[variant];

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 space-y-1">
      <p className="text-[11px] font-medium text-white/40 uppercase tracking-wider">{label}</p>
      <p className={cn('text-xl font-bold tabular-nums', colorValue)}>{value}</p>
      {sub && <p className="text-[11px] text-white/30">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-componente: fila por sucursal
// ---------------------------------------------------------------------------

function FilaSucursal({ s, totalCortesGlobal }: { s: KpiSucursal; totalCortesGlobal: number }) {
  const diferenciaVariant = s.diferencia > 0 ? 'text-emerald-400' : s.diferencia < 0 ? 'text-red-400' : 'text-white/60';
  const pct = totalCortesGlobal > 0 ? Math.round((s.totalCortes / totalCortesGlobal) * 100) : 0;

  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 space-y-2">
      {/* Header sucursal */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-white/80">{s.sucursalNombre}</span>
        <span className="text-[11px] text-white/40">{s.totalCortes} corte{s.totalCortes !== 1 ? 's' : ''} ({pct}%)</span>
      </div>

      {/* Métricas en grilla */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[12px]">
        <span className="text-white/40">Ajustado</span>
        <span className="text-white/80 text-right tabular-nums">{formatCurrency(s.totalAdjusted)}</span>

        <span className="text-white/40">Esperado</span>
        <span className="text-white/80 text-right tabular-nums">{formatCurrency(s.totalEsperado)}</span>

        <span className="text-white/40">Diferencia</span>
        <span className={cn('text-right font-semibold tabular-nums', diferenciaVariant)}>
          {s.diferencia >= 0 ? '+' : ''}{formatCurrency(s.diferencia)}
        </span>

        <span className="text-white/40">Gastos</span>
        <span className="text-yellow-400/80 text-right tabular-nums">{formatCurrency(s.totalExpenses)}</span>
      </div>

      {/* Semáforo mini */}
      <div className="flex gap-2 pt-1">
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
    </div>
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
    <section className="space-y-3">
      <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
        Resumen global
      </h2>

      <div className="grid grid-cols-2 gap-2">
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

  // ── Filtros de fecha ──────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <section className="flex gap-2 items-end">
        <div className="flex-1 space-y-1">
          <label className="text-[11px] text-white/40 uppercase tracking-wider">Desde</label>
          <input
            type="date"
            value={fechaDesde}
            max={fechaHasta}
            onChange={e => setFechaDesde(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/30"
          />
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-[11px] text-white/40 uppercase tracking-wider">Hasta</label>
          <input
            type="date"
            value={fechaHasta}
            min={fechaDesde}
            onChange={e => setFechaHasta(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 focus:outline-none focus:border-white/30"
          />
        </div>
        <button
          type="button"
          onClick={recargar}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/60 hover:text-white/80 hover:border-white/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          aria-label="Recargar datos"
        >
          ↻
        </button>
      </section>

      {/* Estado: cargando */}
      {cargando && (
        <div className="py-12 text-center text-sm text-white/30 animate-pulse">
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
        <div className="py-12 text-center text-sm text-white/30">
          Sin cortes finalizados en el período seleccionado.
        </div>
      )}

      {/* Estado: datos OK */}
      {!cargando && !error && kpi && kpi.totalCortes > 0 && (
        <>
          <ResumenGlobal kpi={kpi} />

          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">
              Por sucursal
            </h2>
            {kpi.porSucursal.map(s => (
              <FilaSucursal
                key={s.sucursalId}
                s={s}
                totalCortesGlobal={kpi.totalCortes}
              />
            ))}
          </section>
        </>
      )}
    </div>
  );
}
