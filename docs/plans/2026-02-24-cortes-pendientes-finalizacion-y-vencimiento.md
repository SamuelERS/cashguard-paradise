# Cortes Pendientes Finalizacion Y Vencimiento Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Garantizar que los cortes activos sean reales, que los cortes finalizados siempre se persistan correctamente en Supabase (`estado`, `finalizado_at`, `reporte_hash`), y que cortes no concluidos al cierre del día reciban tratamiento automático y trazable.

**Architecture:** Se implementará una capa de cierre explícito en frontend (flujo de finalización conectado a `useCorteSesion.finalizarCorte`) y una reconciliación de cortes vencidos en backend (SQL migration con función de auto-aborto diario + constraints de integridad terminal). El dashboard supervisor consumirá este estado ya saneado sin alterar la lógica anti-fraude central del proceso operativo.

**Tech Stack:** React 18 + TypeScript, Vitest + Testing Library, Supabase Postgres migrations, Supabase JS.

---

## Skills requeridas durante ejecución

- `@test-driven-development`
- `@systematic-debugging`
- `@verification-before-completion`

---

### Task 1: Diagnóstico reproducible de “corte pendiente” vs “corte finalizado”

**Files:**
- Create: `src/__tests__/unit/pages/index.corte-finalizacion-supabase.test.tsx`
- Modify: `src/__tests__/unit/pages/index.sync-ux.test.tsx`
- Test: `src/__tests__/unit/pages/index.corte-finalizacion-supabase.test.tsx`

**Step 1: Write the failing test**

```tsx
it('al finalizar desde Phase 3 llama finalizarCorte y persiste terminalidad', async () => {
  // Arrange: mock de useCorteSesion con iniciarCorte/guardarProgreso/finalizarCorte
  // Act: completar flujo CASH_CUT hasta acción "Finalizar"
  // Assert: finalizarCorte llamado 1 vez con hash no vacío
  expect(corteSesionMocks.finalizarCorte).toHaveBeenCalledOnce();
  expect(corteSesionMocks.finalizarCorte).toHaveBeenCalledWith(expect.stringMatching(/\S+/));
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/pages/index.corte-finalizacion-supabase.test.tsx`
Expected: FAIL porque `Index`/`CashCounter` no invocan `finalizarCorte` actualmente.

**Step 3: Write minimal implementation**

```tsx
// src/pages/Index.tsx
const { iniciarCorte, guardarProgreso, finalizarCorte, error: syncError } = useCorteSesion(syncSucursalId);

const handleFinalizarCorte = useCallback(async (reporteHash: string) => {
  await finalizarCorte(reporteHash);
  setSyncEstado('sincronizado');
  setUltimaSync(new Date().toISOString());
}, [finalizarCorte]);

// Pass to CashCounter:
// onFinalizarCorte={currentMode === OperationMode.CASH_CUT ? handleFinalizarCorte : undefined}
```

```tsx
// src/components/CashCounter.tsx + src/hooks/useCashCounterOrchestrator.ts
// Nuevo prop opcional:
// onFinalizarCorte?: (reporteHash: string) => Promise<void>
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/unit/pages/index.corte-finalizacion-supabase.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/Index.tsx src/components/CashCounter.tsx src/hooks/useCashCounterOrchestrator.ts src/__tests__/unit/pages/index.corte-finalizacion-supabase.test.tsx src/__tests__/unit/pages/index.sync-ux.test.tsx
git commit -m "fix(corte): wire phase3 completion to finalizarCorte persistence"
```

---

### Task 2: Generación de hash de reporte y finalización transaccional desde Phase 3

**Files:**
- Create: `src/lib/corte-report-hash.ts`
- Create: `src/lib/__tests__/corte-report-hash.test.ts`
- Modify: `src/components/CashCalculation.tsx`
- Modify: `src/components/cash-counter/Phase3ReportView.tsx`
- Test: `src/lib/__tests__/corte-report-hash.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { generarReporteHash } from '@/lib/corte-report-hash';

it('genera hash determinista SHA-256 hex para payload de cierre', async () => {
  const payload = { correlativo: 'CORTE-2026-02-24-M-001', total: 1052.53, ts: '2026-02-24T22:00:00.000Z' };
  const h1 = await generarReporteHash(payload);
  const h2 = await generarReporteHash(payload);
  expect(h1).toHaveLength(64);
  expect(h1).toBe(h2);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/corte-report-hash.test.ts`
Expected: FAIL (módulo aún no existe).

**Step 3: Write minimal implementation**

```ts
// src/lib/corte-report-hash.ts
export async function generarReporteHash(payload: unknown): Promise<string> {
  const json = JSON.stringify(payload);
  const data = new TextEncoder().encode(json);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
```

```tsx
// src/components/CashCalculation.tsx
// Al confirmar "Finalizar":
// 1) Construir payload estable del reporte
// 2) generarReporteHash(payload)
// 3) await onFinalizeReport?.(hash)
// 4) solo entonces ejecutar onComplete()
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/corte-report-hash.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/corte-report-hash.ts src/lib/__tests__/corte-report-hash.test.ts src/components/CashCalculation.tsx src/components/cash-counter/Phase3ReportView.tsx
git commit -m "feat(corte): compute deterministic report hash before closing cut"
```

---

### Task 3: Reconciliación de cortes vencidos (no finalizados al cierre del día)

**Files:**
- Create: `supabase/migrations/005_cortes_terminal_guards_and_daily_reconciliation.sql`
- Modify: `src/__tests__/unit/supabase/migrations-contract.test.ts`
- Create: `src/hooks/__tests__/useSupervisorQueries.daily-reconciliation.test.ts`
- Modify: `src/hooks/useSupervisorQueries.ts`
- Test: `src/__tests__/unit/supabase/migrations-contract.test.ts`

**Step 1: Write the failing test**

```ts
it('incluye función SQL para auto-abortar cortes activos de días anteriores', () => {
  const sql = readAllMigrations();
  expect(sql).toMatch(/create\s+or\s+replace\s+function\s+public\.reconciliar_cortes_vencidos/i);
  expect(sql).toMatch(/estado\s*=\s*'ABORTADO'/i);
  expect(sql).toMatch(/finalizado_at\s*=\s*now\(\)/i);
});

it('invoca RPC de reconciliación antes de consultar cortes del día', async () => {
  // mock tables.rpc('reconciliar_cortes_vencidos', ...)
  // expect rpc called once before queries de cortes
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/supabase/migrations-contract.test.ts src/hooks/__tests__/useSupervisorQueries.daily-reconciliation.test.ts`
Expected: FAIL porque la migración y la llamada RPC aún no existen.

**Step 3: Write minimal implementation**

```sql
-- supabase/migrations/005_cortes_terminal_guards_and_daily_reconciliation.sql
BEGIN;

ALTER TABLE public.cortes
  ADD CONSTRAINT chk_cortes_terminal_timestamp
  CHECK (
    (estado IN ('FINALIZADO','ABORTADO') AND finalizado_at IS NOT NULL)
    OR
    (estado IN ('INICIADO','EN_PROGRESO') AND finalizado_at IS NULL)
  );

CREATE OR REPLACE FUNCTION public.reconciliar_cortes_vencidos(p_fecha_corte date DEFAULT (now() AT TIME ZONE 'America/El_Salvador')::date)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE v_count integer;
BEGIN
  UPDATE public.cortes
  SET estado = 'ABORTADO',
      motivo_aborto = COALESCE(motivo_aborto, 'Auto-aborto por cierre diario sin finalización'),
      finalizado_at = COALESCE(finalizado_at, now()),
      updated_at = now()
  WHERE estado IN ('INICIADO','EN_PROGRESO')
    AND (created_at AT TIME ZONE 'America/El_Salvador')::date < p_fecha_corte;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

COMMIT;
NOTIFY pgrst, 'reload schema';
```

```ts
// src/hooks/useSupervisorQueries.ts (obtenerCortesDelDia / obtenerHistorial)
await tables.rpc('reconciliar_cortes_vencidos', {
  p_fecha_corte: getRangoDiaElSalvador().inicio.slice(0, 10),
});
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/unit/supabase/migrations-contract.test.ts src/hooks/__tests__/useSupervisorQueries.daily-reconciliation.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add supabase/migrations/005_cortes_terminal_guards_and_daily_reconciliation.sql src/__tests__/unit/supabase/migrations-contract.test.ts src/hooks/useSupervisorQueries.ts src/hooks/__tests__/useSupervisorQueries.daily-reconciliation.test.ts
git commit -m "feat(supabase): reconcile stale active cuts and enforce terminal timestamps"
```

---

### Task 4: Contratos de UI supervisor para pendientes reales y trazabilidad

**Files:**
- Create: `src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx`
- Modify: `src/components/supervisor/CortesDelDia.tsx`
- Modify: `src/components/supervisor/CorteListaItem.tsx`
- Test: `src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx`

**Step 1: Write the failing test**

```tsx
it('no muestra como activos cortes reconciliados a ABORTADO', async () => {
  // Mock obtenerCortesDelDia con registros ABORTADO + EN_PROGRESO
  // Assert: EN_PROGRESO en "Activos ahora"
  // Assert: ABORTADO aparece fuera de activos (sección "Finalizados hoy" o etiqueta terminal)
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx`
Expected: FAIL si layout actual no refleja separación terminal/activo correctamente para ABORTADO reconciliado.

**Step 3: Write minimal implementation**

```tsx
// src/components/supervisor/CortesDelDia.tsx
const activos = cortes.filter(c => c.estado === 'INICIADO' || c.estado === 'EN_PROGRESO');
const terminales = cortes.filter(c => c.estado === 'FINALIZADO' || c.estado === 'ABORTADO');

// Render: "Activos ahora" + "Cerrados hoy" (incluye FINALIZADO y ABORTADO)
```

```tsx
// src/components/supervisor/CorteListaItem.tsx
// Badge ABORTADO visible + etiqueta temporal "Finalizado"
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/CortesDelDia.tsx src/components/supervisor/CorteListaItem.tsx src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx
git commit -m "feat(supervisor): reflect reconciled stale cuts with terminal status clarity"
```

---

### Task 5: Verificación end-to-end de consistencia Supabase + dashboard

**Files:**
- Create: `docs/qa/2026-02-24-validacion-cortes-pendientes-vs-finalizados.md`
- Modify: `src/__tests__/unit/pages/index.sync-ux.test.tsx`
- Test: `src/__tests__/unit/pages/index.sync-ux.test.tsx`

**Step 1: Write the failing test**

```tsx
it('al finalizar corte nocturno deja syncEstado=sincronizado y no reaparece como activo', async () => {
  // Simular cerrar corte
  // Verificar: estado visual sincronizado
  // Verificar: siguiente carga no lo detecta en .in('INICIADO','EN_PROGRESO')
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/pages/index.sync-ux.test.tsx -t "no reaparece como activo"`
Expected: FAIL antes de integrar cierre + reconciliación.

**Step 3: Write minimal implementation**

```tsx
// Ajustes mínimos en Index.tsx mocks/flujo para refrescar estado
// tras finalizar y evitar stale UI en siguiente detección.
```

```md
# docs/qa/2026-02-24-validacion-cortes-pendientes-vs-finalizados.md
- Query 1: cortes activos por sucursal
- Query 2: terminales del día con finalizado_at no null
- Query 3: reconciliados automáticos (motivo_aborto auto)
- Checklist visual dashboard Hoy/Historial
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/unit/pages/index.sync-ux.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/__tests__/unit/pages/index.sync-ux.test.tsx docs/qa/2026-02-24-validacion-cortes-pendientes-vs-finalizados.md
git commit -m "test(sync): ensure finalized cuts do not reappear as active"
```

---

## Verificación final obligatoria

Run:

```bash
npx vitest run src/hooks/__tests__/useCorteSesion.test.ts src/__tests__/unit/pages/index.corte-finalizacion-supabase.test.tsx src/__tests__/unit/pages/index.sync-ux.test.tsx src/hooks/__tests__/useSupervisorQueries.daily-reconciliation.test.ts src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx src/__tests__/unit/supabase/migrations-contract.test.ts
npm run build
```

Expected:
- `vitest`: todo PASS (0 fails)
- `build`: exit code 0

