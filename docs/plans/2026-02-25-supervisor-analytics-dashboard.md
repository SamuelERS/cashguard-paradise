# Supervisor Analytics Dashboard — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a professional "Resumen" tab to the Supervisor Dashboard showing KPI/analytics for a configurable date range, grouped by branch.

**Architecture:** 4 surgical files. Each file is independently validatable. No shared state between tasks; later tasks depend on earlier ones. Zero changes to existing query patterns — reuses the `tables.cortes()` + `useSupervisorQueries.ts` patterns already established.

**Tech Stack:** React 18, TypeScript strict, TanStack React Query v5, Supabase (read-only), React Router v6, Tailwind CSS, `clsx/twMerge` via `cn()`, `formatCurrency` + `calculateCashTotal` from existing utils, `isDailyExpense` type guard from `@/types/expenses`.

---

## Task 1: Add `analytics` query key to `queryKeys.ts`

**Files:**
- Modify: `src/hooks/supervisor/queryKeys.ts`
- Test: `npx tsc --noEmit` (type check only — no dedicated test needed for this trivial change)

**Step 1: Write the failing type-check**

Confirm current state:
```bash
grep -n "analytics" src/hooks/supervisor/queryKeys.ts
# Expected: no output (key does not exist yet)
```

**Step 2: Apply the change**

In `src/hooks/supervisor/queryKeys.ts`, add `analytics` to the `supervisor` object:

```typescript
// BEFORE (lines ~1-12):
export const queryKeys = {
  supervisor: {
    today:   ()           => ['supervisor', 'today']         as const,
    detail:  (id: string) => ['supervisor', 'detail', id]    as const,
    history: (fp = 'all') => ['supervisor', 'history', fp]   as const,
  },
} as const;

// AFTER:
export const queryKeys = {
  supervisor: {
    today:     ()           => ['supervisor', 'today']           as const,
    detail:    (id: string) => ['supervisor', 'detail', id]      as const,
    history:   (fp = 'all') => ['supervisor', 'history', fp]     as const,
    // 🤖 [IA] - v4.1.0: Clave para pantalla analytics/KPI (tab Resumen)
    analytics: (fp = 'all') => ['supervisor', 'analytics', fp]   as const,
  },
} as const;
```

**Step 3: Verify type-check passes**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/hooks/supervisor/queryKeys.ts
git commit -m "feat(supervisor): add analytics query key"
```

---

## Task 2: Create `useSupervisorAnalytics.ts`

**Files:**
- Create: `src/hooks/supervisor/useSupervisorAnalytics.ts`
- Test: `npx tsc --noEmit`

**Step 1: Verify type dependencies exist**

```bash
grep -n "isDailyExpense" src/types/expenses.ts | head -3
grep -n "calculateCashTotal" src/utils/calculations.ts | head -3
grep -n "RESULTADOS_POR_PAGINA" src/hooks/useSupervisorQueries.ts | head -3
```
Expected: all 3 return matches.

**Step 2: Write the failing test (type-check)**

```bash
# Confirm file does not exist yet
ls src/hooks/supervisor/useSupervisorAnalytics.ts 2>/dev/null || echo "NOT FOUND — correct"
```

**Step 3: Create the hook**

```typescript
// src/hooks/supervisor/useSupervisorAnalytics.ts
// 🤖 [IA] - v4.1.0: Hook analytics para tab Resumen — read-only, solo FINALIZADOS
// Patrón: misma arquitectura que useSupervisorQueries.ts

import { useQuery } from '@tanstack/react-query';
import { tables } from '@/lib/supabase';
import { calculateCashTotal } from '@/utils/calculations';
import { isDailyExpense } from '@/types/expenses';
import type { Corte, Sucursal } from '@/types/auditoria';
import type { CashCount } from '@/types/cash';
import { queryKeys } from './queryKeys';

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const TIMEZONE_NEGOCIO = 'America/El_Salvador';

function fechaAISORange(fechaYYYYMMDD: string): { inicio: string; fin: string } {
  return {
    inicio: `${fechaYYYYMMDD}T00:00:00.000-06:00`,
    fin:    `${fechaYYYYMMDD}T23:59:59.999-06:00`,
  };
}

function hoyEnElSalvador(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: TIMEZONE_NEGOCIO });
}

function hace7Dias(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toLocaleDateString('sv-SE', { timeZone: TIMEZONE_NEGOCIO });
}

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface FiltrosAnalytics {
  /** YYYY-MM-DD. Default: hoy − 6 días. */
  fechaDesde?: string;
  /** YYYY-MM-DD. Default: hoy. */
  fechaHasta?: string;
  /** UUID sucursal (opcional). */
  sucursalId?: string;
}

export interface KpiSucursal {
  sucursalId:       string;
  sucursalNombre:   string;
  totalCortes:      number;
  totalCash:        number;
  totalElectronic:  number;
  totalGeneral:     number;
  totalExpenses:    number;
  totalAdjusted:    number;
  totalEsperado:    number;
  diferencia:       number;
  sobrantes:        number;
  faltantes:        number;
  exactos:          number;
}

export interface KpiGlobal {
  totalCortes:      number;
  totalCash:        number;
  totalElectronic:  number;
  totalGeneral:     number;
  totalExpenses:    number;
  totalAdjusted:    number;
  totalEsperado:    number;
  diferencia:       number;
  sobrantes:        number;
  faltantes:        number;
  exactos:          number;
  porSucursal:      KpiSucursal[];
}

export interface UseSupervisorAnalyticsReturn {
  kpi:       KpiGlobal | null;
  cargando:  boolean;
  error:     string | null;
  recargar:  () => void;
}

// ---------------------------------------------------------------------------
// Tipo interno join
// ---------------------------------------------------------------------------

interface CorteConSucursalRaw extends Corte {
  sucursales: Pick<Sucursal, 'id' | 'nombre' | 'codigo' | 'activa'> | null;
}

// ---------------------------------------------------------------------------
// Helpers JSONB — patrón establecido en CorteDetalle.tsx
// ---------------------------------------------------------------------------

interface PagosElectronicos {
  credomatic:   number;
  promerica:    number;
  bankTransfer: number;
  paypal:       number;
}

function extraerTotalesConteo(datosConteo: Record<string, unknown> | null): {
  totalCash:       number;
  totalElectronic: number;
  totalExpenses:   number;
} {
  let totalCash = 0;
  let totalElectronic = 0;
  let totalExpenses = 0;

  if (!datosConteo || typeof datosConteo !== 'object') {
    return { totalCash, totalElectronic, totalExpenses };
  }

  // conteo_parcial → CashCount
  const conteoParcialRaw = datosConteo['conteo_parcial'];
  if (
    typeof conteoParcialRaw === 'object' &&
    conteoParcialRaw !== null &&
    !Array.isArray(conteoParcialRaw)
  ) {
    totalCash = calculateCashTotal(conteoParcialRaw as Partial<CashCount>);
  }

  // pagos_electronicos
  const pagosRaw = datosConteo['pagos_electronicos'];
  if (typeof pagosRaw === 'object' && pagosRaw !== null && !Array.isArray(pagosRaw)) {
    const p = pagosRaw as Record<string, unknown>;
    const pagos: PagosElectronicos = {
      credomatic:   typeof p['credomatic']   === 'number' ? (p['credomatic']   as number) : 0,
      promerica:    typeof p['promerica']    === 'number' ? (p['promerica']    as number) : 0,
      bankTransfer: typeof p['bankTransfer'] === 'number' ? (p['bankTransfer'] as number) : 0,
      paypal:       typeof p['paypal']       === 'number' ? (p['paypal']       as number) : 0,
    };
    totalElectronic = pagos.credomatic + pagos.promerica + pagos.bankTransfer + pagos.paypal;
  }

  // gastos_dia — array OR { items: [...] }
  const gastosDiaRaw = datosConteo['gastos_dia'];
  if (Array.isArray(gastosDiaRaw)) {
    totalExpenses = gastosDiaRaw
      .filter(isDailyExpense)
      .reduce((acc, g) => acc + g.amount, 0);
  } else if (
    typeof gastosDiaRaw === 'object' &&
    gastosDiaRaw !== null &&
    !Array.isArray(gastosDiaRaw)
  ) {
    const obj = gastosDiaRaw as Record<string, unknown>;
    if (Array.isArray(obj['items'])) {
      totalExpenses = (obj['items'] as unknown[])
        .filter(isDailyExpense)
        .reduce((acc, g) => acc + g.amount, 0);
    }
  }

  return { totalCash, totalElectronic, totalExpenses };
}

// ---------------------------------------------------------------------------
// Función de agregación
// ---------------------------------------------------------------------------

function agregarCortes(cortes: CorteConSucursalRaw[]): KpiGlobal {
  const mapasSucursal = new Map<string, KpiSucursal>();

  for (const corte of cortes) {
    const sucursalId     = corte.sucursal_id ?? 'desconocida';
    const sucursalNombre = corte.sucursales?.nombre ?? 'Sin sucursal';

    const { totalCash, totalElectronic, totalExpenses } =
      extraerTotalesConteo(corte.datos_conteo);

    const totalGeneral  = totalCash + totalElectronic;
    const totalAdjusted = totalGeneral - totalExpenses;
    const totalEsperado = corte.venta_esperada ?? 0;
    const diferencia    = totalAdjusted - totalEsperado;

    const entrada = mapasSucursal.get(sucursalId) ?? {
      sucursalId,
      sucursalNombre,
      totalCortes:     0,
      totalCash:       0,
      totalElectronic: 0,
      totalGeneral:    0,
      totalExpenses:   0,
      totalAdjusted:   0,
      totalEsperado:   0,
      diferencia:      0,
      sobrantes:       0,
      faltantes:       0,
      exactos:         0,
    };

    entrada.totalCortes     += 1;
    entrada.totalCash       += totalCash;
    entrada.totalElectronic += totalElectronic;
    entrada.totalGeneral    += totalGeneral;
    entrada.totalExpenses   += totalExpenses;
    entrada.totalAdjusted   += totalAdjusted;
    entrada.totalEsperado   += totalEsperado;
    entrada.diferencia      += diferencia;
    if (diferencia > 0)       entrada.sobrantes += 1;
    else if (diferencia < 0)  entrada.faltantes += 1;
    else                      entrada.exactos   += 1;

    mapasSucursal.set(sucursalId, entrada);
  }

  const porSucursal = [...mapasSucursal.values()].sort(
    (a, b) => a.sucursalNombre.localeCompare(b.sucursalNombre),
  );

  // Totales globales (suma de sucursales)
  const global = porSucursal.reduce<KpiGlobal>(
    (acc, s) => ({
      totalCortes:     acc.totalCortes     + s.totalCortes,
      totalCash:       acc.totalCash       + s.totalCash,
      totalElectronic: acc.totalElectronic + s.totalElectronic,
      totalGeneral:    acc.totalGeneral    + s.totalGeneral,
      totalExpenses:   acc.totalExpenses   + s.totalExpenses,
      totalAdjusted:   acc.totalAdjusted   + s.totalAdjusted,
      totalEsperado:   acc.totalEsperado   + s.totalEsperado,
      diferencia:      acc.diferencia      + s.diferencia,
      sobrantes:       acc.sobrantes       + s.sobrantes,
      faltantes:       acc.faltantes       + s.faltantes,
      exactos:         acc.exactos         + s.exactos,
      porSucursal,
    }),
    {
      totalCortes: 0, totalCash: 0, totalElectronic: 0,
      totalGeneral: 0, totalExpenses: 0, totalAdjusted: 0,
      totalEsperado: 0, diferencia: 0,
      sobrantes: 0, faltantes: 0, exactos: 0,
      porSucursal,
    },
  );

  return global;
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------

export function useSupervisorAnalytics(
  filtros: FiltrosAnalytics = {},
): UseSupervisorAnalyticsReturn {
  const {
    fechaDesde = hace7Dias(),
    fechaHasta = hoyEnElSalvador(),
    sucursalId,
  } = filtros;

  const fingerprint = `${fechaDesde}_${fechaHasta}_${sucursalId ?? 'all'}`;

  const {
    data,
    isLoading: cargando,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.supervisor.analytics(fingerprint),
    queryFn: async (): Promise<KpiGlobal> => {
      const rangoDesde = fechaAISORange(fechaDesde);
      const rangoHasta = fechaAISORange(fechaHasta);

      let query = tables
        .cortes()
        .select('*, sucursales(id, nombre, codigo, activa)')
        .eq('estado', 'FINALIZADO')
        .gte('finalizado_at', rangoDesde.inicio)
        .lte('finalizado_at', rangoHasta.fin)
        .order('finalizado_at', { ascending: false });

      if (sucursalId) {
        query = query.eq('sucursal_id', sucursalId);
      }

      const { data: rows, error: supabaseError } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const cortes = (rows ?? []) as CorteConSucursalRaw[];
      return agregarCortes(cortes);
    },
    staleTime:    5 * 60 * 1000,  // 5 min — analytics no necesita RT
    gcTime:       10 * 60 * 1000, // 10 min
    retry:        2,
  });

  return {
    kpi:      data ?? null,
    cargando,
    error:    queryError ? (queryError as Error).message : null,
    recargar: () => { void refetch(); },
  };
}
```

**Step 4: Run type-check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

**Step 5: Commit**

```bash
git add src/hooks/supervisor/useSupervisorAnalytics.ts
git commit -m "feat(supervisor): add useSupervisorAnalytics hook"
```

---

## Task 3: Create `CortesResumen.tsx`

**Files:**
- Create: `src/components/supervisor/CortesResumen.tsx`
- Test: `npx tsc --noEmit`

**Step 1: Confirm formatCurrency import path**

```bash
grep -rn "formatCurrency" src/components/supervisor/CorteDetalle.tsx | head -3
```
Expected: `import { formatCurrency } from '@/utils/calculations';`

**Step 2: Create the component**

```typescript
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
// Componente principal
// ---------------------------------------------------------------------------

export default function CortesResumen() {
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
```

**Step 3: Run type-check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

**Step 4: Commit**

```bash
git add src/components/supervisor/CortesResumen.tsx
git commit -m "feat(supervisor): add CortesResumen analytics page"
```

---

## Task 4: Wire up tab + route in `SupervisorDashboard.tsx` and `App.tsx`

**Files:**
- Modify: `src/pages/SupervisorDashboard.tsx`
- Modify: `src/App.tsx`
- Test: `npx tsc --noEmit` + manual smoke in browser

**Step 1: Read current TABS and routes**

```bash
grep -n "TABS\|Historial\|resumen" src/pages/SupervisorDashboard.tsx
grep -n "historial\|resumen\|CortesResumen" src/App.tsx
```

**Step 2: Add "Resumen" tab to `SupervisorDashboard.tsx`**

Locate the TABS constant and add the third entry:

```typescript
// BEFORE:
const TABS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Hoy',       href: '/supervisor/cortes'   },
  { label: 'Historial', href: '/supervisor/historial' },
];

// AFTER:
const TABS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Hoy',       href: '/supervisor/cortes'   },
  { label: 'Historial', href: '/supervisor/historial' },
  // 🤖 [IA] - v4.1.0: Tab analytics/KPI
  { label: 'Resumen',   href: '/supervisor/resumen'  },
];
```

Also update the version badge in the `<h1>`:
```typescript
// BEFORE:
<span className="ml-2 text-[10px] font-normal text-white/30">v4.0.1</span>

// AFTER:
<span className="ml-2 text-[10px] font-normal text-white/30">v4.1.0</span>
```

**Step 3: Add route to `App.tsx`**

Locate the supervisor route block and add the new child:

```typescript
// BEFORE (child routes of /supervisor):
<Route path="cortes"    element={<CortesDelDia />} />
<Route path="corte/:id" element={<CorteDetalle />} />
<Route path="historial" element={<CorteHistorial />} />

// AFTER:
<Route path="cortes"    element={<CortesDelDia />} />
<Route path="corte/:id" element={<CorteDetalle />} />
<Route path="historial" element={<CorteHistorial />} />
{/* 🤖 [IA] - v4.1.0: Ruta analytics/KPI */}
<Route path="resumen"   element={<CortesResumen />} />
```

Add import at top of `App.tsx` (near the other supervisor imports):
```typescript
import CortesResumen from '@/components/supervisor/CortesResumen';
```

**Step 4: Run type-check**

```bash
npx tsc --noEmit
```
Expected: 0 errors

**Step 5: Build verification**

```bash
npm run build 2>&1 | tail -10
```
Expected: `✓ built in` with no errors.

**Step 6: Smoke test**

Run: `npm run dev`
- Navigate to `/supervisor` → enter PIN
- Click tab "Resumen" → should load `/supervisor/resumen`
- Verify date pickers render + spinner shows + data loads (or "Sin cortes" if DB empty)
- Verify tabs "Hoy" and "Historial" still work (regression check)

**Step 7: Commit**

```bash
git add src/pages/SupervisorDashboard.tsx src/App.tsx
git commit -m "feat(supervisor): add Resumen tab and route (v4.1.0)"
```

---

## Final: Push branch

```bash
git push -u origin claude/supervisor-dashboard-architecture-CG4mS
```

---

## Verification checklist

- [ ] `npx tsc --noEmit` → 0 errors after each task
- [ ] `npm run build` → successful after Task 4
- [ ] Tab "Resumen" visible and navigable
- [ ] Date range filter works (change dates → data updates)
- [ ] ↻ button triggers refetch
- [ ] KPI cards display correct currency format
- [ ] By-branch section shows correctly
- [ ] Tabs "Hoy" and "Historial" not broken (regression)
- [ ] No `any` types introduced
- [ ] All JSONB parsing uses defensive `typeof` guards
