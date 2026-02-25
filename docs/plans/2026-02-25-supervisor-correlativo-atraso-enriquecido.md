# Supervisor Correlativo Intelligence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enriquecer la sección "Cortes de hoy" para mostrar correlativo útil (código completo, secuencial y atraso) y que supervisión detecte de inmediato qué corte va rezagado por sucursal.

**Architecture:** Mantener el backend intacto y resolver todo en capa de presentación con utilidades puras y tipadas. La lógica de correlativo (parse + métricas por sucursal) vivirá en un módulo reutilizable que alimenta `CortesDelDia` y `CorteListaItem`. La UI nueva será aditiva y compatible hacia atrás (prop opcional) para no romper `Historial` ni otras vistas que reutilizan `CorteListaItem`.

**Tech Stack:** React 18 + TypeScript + Vitest + Testing Library + Tailwind + Supabase read-model existente.

---

## Skills a usar durante ejecución
- `@test-driven-development`
- `@systematic-debugging`
- `@verification-before-completion`

## Definición funcional (alcance exacto)
1. Mostrar en cada tarjeta de corte:
- Correlativo completo (`CORTE-YYYY-MM-DD-X-NNN[-A#]`).
- Secuencial visible (`Código #NNN`).
- Badge de atraso para cortes activos cuando existe un correlativo mayor de la misma sucursal en el día.

2. Mostrar en encabezado de "Cortes de hoy":
- Conteo de sucursales con actividad.
- Máximo correlativo observado por sucursal (resumen compacto).
- Número de cortes activos atrasados.

3. Regla de atraso:
- `atraso = maxSecuencialSucursal - secuencialCorte`.
- Solo aplica si `estado` es `INICIADO` o `EN_PROGRESO` y `atraso > 0`.

4. Fuera de alcance (YAGNI):
- Cambios SQL/RPC.
- Nuevos endpoints.
- Persistencia extra en BD.

---

### Task 1: Correlativo Parsing Utility

**Files:**
- Create: `src/components/supervisor/correlativoMetrics.ts`
- Test: `src/components/supervisor/__tests__/correlativoMetrics.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { parseCorrelativo } from '../correlativoMetrics';

describe('parseCorrelativo', () => {
  it('extrae fecha, sucursal, secuencial e intento opcional', () => {
    expect(parseCorrelativo('CORTE-2026-02-25-H-002')).toEqual({
      valido: true,
      fecha: '2026-02-25',
      sucursalCodigo: 'H',
      secuencial: 2,
      intento: null,
      correlativo: 'CORTE-2026-02-25-H-002',
    });

    expect(parseCorrelativo('CORTE-2026-02-25-H-002-A3')).toEqual({
      valido: true,
      fecha: '2026-02-25',
      sucursalCodigo: 'H',
      secuencial: 2,
      intento: 3,
      correlativo: 'CORTE-2026-02-25-H-002-A3',
    });
  });

  it('retorna invalido para formatos corruptos', () => {
    expect(parseCorrelativo('INVALIDO')).toEqual({
      valido: false,
      fecha: null,
      sucursalCodigo: null,
      secuencial: null,
      intento: null,
      correlativo: 'INVALIDO',
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/supervisor/__tests__/correlativoMetrics.test.ts`
Expected: FAIL con `Cannot find module '../correlativoMetrics'`.

**Step 3: Write minimal implementation**

```ts
const CORRELATIVO_PARSE_REGEX =
  /^CORTE-(\d{4}-\d{2}-\d{2})-([A-Z])-(\d{3})(?:-A(\d+))?$/;

export interface CorrelativoParseResult {
  valido: boolean;
  fecha: string | null;
  sucursalCodigo: string | null;
  secuencial: number | null;
  intento: number | null;
  correlativo: string;
}

export function parseCorrelativo(correlativo: string): CorrelativoParseResult {
  const match = CORRELATIVO_PARSE_REGEX.exec(correlativo);
  if (!match) {
    return { valido: false, fecha: null, sucursalCodigo: null, secuencial: null, intento: null, correlativo };
  }

  return {
    valido: true,
    fecha: match[1],
    sucursalCodigo: match[2],
    secuencial: Number(match[3]),
    intento: match[4] ? Number(match[4]) : null,
    correlativo,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/supervisor/__tests__/correlativoMetrics.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/correlativoMetrics.ts src/components/supervisor/__tests__/correlativoMetrics.test.ts
git commit -m "test: add correlativo parser contract for supervisor"
```

---

### Task 2: Métricas de atraso por sucursal

**Files:**
- Modify: `src/components/supervisor/correlativoMetrics.ts`
- Test: `src/components/supervisor/__tests__/correlativoMetrics.test.ts`

**Step 1: Write the failing test**

```ts
import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';
import { buildCorrelativoDashboardMetrics } from '../correlativoMetrics';

it('calcula maximo secuencial por sucursal y atraso de cortes activos', () => {
  const cortes = [
    { id: '1', correlativo: 'CORTE-2026-02-25-M-001', estado: 'EN_PROGRESO' },
    { id: '2', correlativo: 'CORTE-2026-02-25-M-004', estado: 'FINALIZADO' },
    { id: '3', correlativo: 'CORTE-2026-02-25-H-002', estado: 'INICIADO' },
  ] as unknown as CorteConSucursal[];

  const metrics = buildCorrelativoDashboardMetrics(cortes);

  expect(metrics.maxSecuencialPorSucursal.get('M')).toBe(4);
  expect(metrics.atrasoPorCorteId.get('1')).toBe(3);
  expect(metrics.atrasoPorCorteId.get('2')).toBe(0);
  expect(metrics.activosAtrasados).toBe(1);
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/supervisor/__tests__/correlativoMetrics.test.ts`
Expected: FAIL con `buildCorrelativoDashboardMetrics is not a function`.

**Step 3: Write minimal implementation**

```ts
import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';

const ESTADOS_ACTIVOS = new Set(['INICIADO', 'EN_PROGRESO']);

export interface CorrelativoDashboardMetrics {
  maxSecuencialPorSucursal: Map<string, number>;
  atrasoPorCorteId: Map<string, number>;
  activosAtrasados: number;
}

export function buildCorrelativoDashboardMetrics(
  cortes: CorteConSucursal[],
): CorrelativoDashboardMetrics {
  const maxSecuencialPorSucursal = new Map<string, number>();

  for (const corte of cortes) {
    const parsed = parseCorrelativo(corte.correlativo);
    if (!parsed.valido || parsed.sucursalCodigo === null || parsed.secuencial === null) continue;
    const actual = maxSecuencialPorSucursal.get(parsed.sucursalCodigo) ?? 0;
    if (parsed.secuencial > actual) maxSecuencialPorSucursal.set(parsed.sucursalCodigo, parsed.secuencial);
  }

  const atrasoPorCorteId = new Map<string, number>();
  let activosAtrasados = 0;

  for (const corte of cortes) {
    const parsed = parseCorrelativo(corte.correlativo);
    if (!parsed.valido || parsed.sucursalCodigo === null || parsed.secuencial === null) {
      atrasoPorCorteId.set(corte.id, 0);
      continue;
    }

    const max = maxSecuencialPorSucursal.get(parsed.sucursalCodigo) ?? parsed.secuencial;
    const atraso = ESTADOS_ACTIVOS.has(corte.estado) ? Math.max(0, max - parsed.secuencial) : 0;
    atrasoPorCorteId.set(corte.id, atraso);
    if (atraso > 0) activosAtrasados += 1;
  }

  return { maxSecuencialPorSucursal, atrasoPorCorteId, activosAtrasados };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/supervisor/__tests__/correlativoMetrics.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/correlativoMetrics.ts src/components/supervisor/__tests__/correlativoMetrics.test.ts
git commit -m "test: add supervisor correlativo lag metrics"
```

---

### Task 3: Contrato UI de tarjeta con correlativo enriquecido

**Files:**
- Create: `src/components/supervisor/__tests__/CorteListaItem.correlativo-context.test.tsx`
- Modify: `src/components/supervisor/CorteListaItem.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CorteListaItem } from '../CorteListaItem';

it('muestra correlativo, codigo numerico y badge de atraso cuando aplica', () => {
  render(
    <CorteListaItem
      corte={makeCorte({ estado: 'EN_PROGRESO', correlativo: 'CORTE-2026-02-25-M-002' })}
      onClick={vi.fn()}
      contextoCorrelativo={{ atraso: 3 }}
    />,
  );

  expect(screen.getByText('CORTE-2026-02-25-M-002')).toBeInTheDocument();
  expect(screen.getByText('Código #002')).toBeInTheDocument();
  expect(screen.getByText('Atraso 3')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/supervisor/__tests__/CorteListaItem.correlativo-context.test.tsx`
Expected: FAIL porque `contextoCorrelativo` no existe y no se renderizan textos.

**Step 3: Write minimal implementation**

```tsx
export interface CorteListaItemProps {
  corte: CorteConSucursal;
  onClick: (id: string) => void;
  contextoCorrelativo?: {
    atraso: number;
  };
}

const parsedCorrelativo = parseCorrelativo(corte.correlativo);
const secuencialTexto =
  parsedCorrelativo.valido && parsedCorrelativo.secuencial !== null
    ? `Código #${String(parsedCorrelativo.secuencial).padStart(3, '0')}`
    : 'Código no disponible';

// Dentro del bloque de metadatos bajo el cajero:
<p className="text-[11px] text-white/45 truncate">{corte.correlativo}</p>
<div className="mt-1 flex items-center gap-2">
  <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/15 text-white/60">{secuencialTexto}</span>
  {contextoCorrelativo && contextoCorrelativo.atraso > 0 && (
    <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-500/35 bg-amber-500/10 text-amber-300">
      Atraso {contextoCorrelativo.atraso}
    </span>
  )}
</div>
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/supervisor/__tests__/CorteListaItem.correlativo-context.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/CorteListaItem.tsx src/components/supervisor/__tests__/CorteListaItem.correlativo-context.test.tsx
git commit -m "feat: enrich supervisor row with correlativo and lag badge"
```

---

### Task 4: Contrato UI de resumen de correlativos en "Cortes de hoy"

**Files:**
- Create: `src/components/supervisor/__tests__/CortesDelDia.correlativo-resumen.test.tsx`
- Modify: `src/components/supervisor/CortesDelDia.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/supervisor/useSupervisorTodayFeed', () => ({
  useSupervisorTodayFeed: () => ({
    cortes: [
      { id: '1', correlativo: 'CORTE-2026-02-25-M-002', estado: 'EN_PROGRESO', sucursales: { codigo: 'M', nombre: 'Plaza Merliot', id: 's1', activa: true } },
      { id: '2', correlativo: 'CORTE-2026-02-25-M-005', estado: 'FINALIZADO', sucursales: { codigo: 'M', nombre: 'Plaza Merliot', id: 's1', activa: true } },
      { id: '3', correlativo: 'CORTE-2026-02-25-H-003', estado: 'INICIADO', sucursales: { codigo: 'H', nombre: 'Los Héroes', id: 's2', activa: true } },
    ],
    cargando: false,
    actualizando: false,
    error: null,
    ultimaActualizacion: new Date('2026-02-25T20:00:00.000Z'),
    realtimeStatus: 'subscribed',
    refrescar: vi.fn(),
  }),
}));

import { CortesDelDia } from '../CortesDelDia';

it('muestra resumen de correlativo por sucursal y activos atrasados', () => {
  render(<CortesDelDia />);
  expect(screen.getByText('Sucursales activas: 2')).toBeInTheDocument();
  expect(screen.getByText('Activos atrasados: 1')).toBeInTheDocument();
  expect(screen.getByText('M: #005')).toBeInTheDocument();
  expect(screen.getByText('H: #003')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/supervisor/__tests__/CortesDelDia.correlativo-resumen.test.tsx`
Expected: FAIL porque el resumen aún no existe.

**Step 3: Write minimal implementation**

```tsx
import { buildCorrelativoDashboardMetrics } from './correlativoMetrics';

const correlativoMetrics = buildCorrelativoDashboardMetrics(cortes);
const sucursalesConActividad = correlativoMetrics.maxSecuencialPorSucursal.size;
const resumenSucursal = Array.from(correlativoMetrics.maxSecuencialPorSucursal.entries())
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([codigo, max]) => `${codigo}: #${String(max).padStart(3, '0')}`);

// Debajo del header principal y antes de secciones activos/finalizados
<div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/70">
    <span>Sucursales activas: {sucursalesConActividad}</span>
    <span>Activos atrasados: {correlativoMetrics.activosAtrasados}</span>
  </div>
  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-white/55">
    {resumenSucursal.map((entry) => (
      <span key={entry} className="px-2 py-0.5 rounded-full border border-white/10">{entry}</span>
    ))}
  </div>
</div>
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/supervisor/__tests__/CortesDelDia.correlativo-resumen.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/CortesDelDia.tsx src/components/supervisor/__tests__/CortesDelDia.correlativo-resumen.test.tsx
git commit -m "feat: add correlativo summary strip to supervisor today view"
```

---

### Task 5: Conectar atraso por corte en lista de hoy sin romper historial

**Files:**
- Modify: `src/components/supervisor/CortesDelDia.tsx`
- Modify: `src/components/supervisor/CorteListaItem.tsx`
- Test: `src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`
- Test: `src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx`

**Step 1: Write the failing test**

```tsx
it('inyecta contexto de atraso solo en vista de hoy', async () => {
  render(<CortesDelDia />);
  expect(await screen.findByText('Atraso 3')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx`
Expected: FAIL por falta de wiring del contexto.

**Step 3: Write minimal implementation**

```tsx
// En mapeo de activos/finalizados de CortesDelDia
<CorteListaItem
  corte={corte}
  onClick={irADetalle}
  contextoCorrelativo={{ atraso: correlativoMetrics.atrasoPorCorteId.get(corte.id) ?? 0 }}
/>

// En CorteHistorial no se pasa contexto => prop opcional conserva compatibilidad.
```

**Step 4: Run test to verify it passes**

Run: `npm test -- src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/CortesDelDia.tsx src/components/supervisor/CorteListaItem.tsx src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx
git commit -m "feat: wire per-cut correlativo lag context in today supervisor list"
```

---

### Task 6: Verificación final de no-regresión

**Files:**
- Test: `src/components/supervisor/__tests__/CortesDelDia.live-refresh.test.tsx`
- Test: `src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx`
- Test: `src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx`
- Test: `src/hooks/__tests__/useSupervisorTodayFeed.test.ts`

**Step 1: Add/adjust failing regression expectation (si aplica)**

```tsx
expect(screen.getByText('En vivo')).toBeInTheDocument();
expect(screen.getByText('Activos ahora')).toBeInTheDocument();
expect(screen.getByText('Finalizados hoy')).toBeInTheDocument();
```

**Step 2: Run focused supervisor suite**

Run:
`npm test -- src/components/supervisor/__tests__/CortesDelDia.live-refresh.test.tsx src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx src/components/supervisor/__tests__/CorteListaItem.status-label.test.tsx src/hooks/__tests__/useSupervisorTodayFeed.test.ts`

Expected: PASS total.

**Step 3: Run full unit suite (guardrail)**

Run: `npm run test:unit`
Expected: PASS sin regresiones.

**Step 4: Run build de seguridad**

Run: `npm run build`
Expected: `✓ built in ...` sin errores TypeScript.

**Step 5: Commit**

```bash
git add -A
git commit -m "test: verify supervisor correlativo enrichment without regressions"
```

---

## Criterios de aceptación
- En cada fila se ve el correlativo completo y su `Código #NNN`.
- Un corte activo atrasado muestra badge `Atraso N` con N correcto.
- El encabezado "Cortes de hoy" muestra resumen de correlativo por sucursal y `Activos atrasados`.
- `CorteHistorial` sigue funcionando sin pasar props nuevas.
- Suite supervisor y unitaria en verde.

## QA manual (rápido, 5 minutos)
1. Ir a `/supervisor/cortes` con al menos 2 sucursales y cortes de distintos correlativos.
2. Confirmar que cada tarjeta muestra `CORTE-...` y `Código #...`.
3. Verificar que un activo antiguo frente a uno más nuevo de su sucursal muestre `Atraso N`.
4. Verificar que finalizados no muestran badge de atraso.
5. Abrir detalle desde tarjeta y validar navegación intacta.

## Notas de implementación segura
- No cambiar esquema de Supabase para esta mejora.
- Mantener `contextoCorrelativo` opcional para no romper llamadas existentes.
- Evitar cálculos de atraso con correlativos inválidos; fallback a 0.
