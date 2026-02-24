# Supabase Flow Integrity And Schema Alignment Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminar drift entre app, migraciones y Supabase real para garantizar persistencia completa, trazabilidad anti-fraude y consistencia operativa.

**Architecture:** Se implementa un enfoque de contrato primero: tests RED que fallen por drift real (helpers faltantes, columnas incompatibles, migraciones incompletas), luego cambios mínimos en cliente y migraciones SQL. Finalmente se endurece integridad de negocio en BD (constraints/FK/indexes) sin romper el flujo funcional existente.

**Tech Stack:** React, TypeScript, Vitest, Supabase Postgres, SQL migrations.

---

## Hallazgos de investigación (base para este plan)

1. `src/lib/supabase.ts` no expone `tables.corteConteoSnapshots()`, pero `src/lib/snapshots.ts` sí lo invoca.
2. `supabase/migrations/` no incluye creación de `corte_conteo_snapshots` (solo existen `001` y `002`).
3. En Supabase real, `corte_conteo_snapshots` existe, pero con columnas camelCase (`dollarCoin`, `bill1`, `bankTransfer`) y `id` numérico; el código actual mapea snake_case y asume `id` string.
4. Tipos TS de `empleados` y `empleado_sucursales` no coinciden con esquema real (`rol/cargo/id/activo` no existen en BD).
5. `cortes` persiste `cajero`/`testigo` por nombre, sin FK `cajero_id`/`testigo_id` para trazabilidad fuerte.
6. Faltan guardrails de integridad en BD:
- unicidad de corte activo por sucursal;
- unicidad de intento activo por corte;
- constraint `cajero != testigo`.
7. Queries de supervisor filtran por `finalizado_at`, pero no hay índice dedicado en migraciones para ese patrón.

---

### Task 1: Contrato RED para drift de cliente Supabase

**Files:**
- Modify: `src/lib/__tests__/supabase.test.ts`
- Create: `src/lib/__tests__/supabase.schema-contract.test.ts`
- Test: `src/lib/__tests__/supabase.test.ts`
- Test: `src/lib/__tests__/supabase.schema-contract.test.ts`

**Step 1: Write the failing test**

```ts
it('tables expone corteConteoSnapshots', () => {
  expect(tables).toHaveProperty('corteConteoSnapshots');
});
```

```ts
it('schema contract: empleados y empleado_sucursales reflejan columnas reales', () => {
  type Empleado = Database['public']['Tables']['empleados']['Row'];
  type Rel = Database['public']['Tables']['empleado_sucursales']['Row'];
  const _empleado: keyof Empleado = 'updated_at';
  const _rel: keyof Rel = 'sucursal_id';
  expect(_empleado).toBe('updated_at');
  expect(_rel).toBe('sucursal_id');
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/supabase.test.ts src/lib/__tests__/supabase.schema-contract.test.ts -t "corteConteoSnapshots|schema contract"`
Expected: FAIL por helper inexistente y/o tipos desalineados.

**Step 3: Write minimal implementation**

```ts
// src/lib/supabase.ts
// 1) agregar table helper
corteConteoSnapshots: () => supabase.from('corte_conteo_snapshots'),
// 2) alinear tipos empleados/empleado_sucursales al esquema real
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/supabase.test.ts src/lib/__tests__/supabase.schema-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/supabase.ts src/lib/__tests__/supabase.test.ts src/lib/__tests__/supabase.schema-contract.test.ts
git commit -m "test: add supabase client schema contract and snapshot helper coverage"
```

### Task 2: Contrato RED para mapeo real de snapshots (camelCase vs snake_case)

**Files:**
- Modify: `src/lib/__tests__/snapshots.test.ts`
- Modify: `src/lib/snapshots.ts`
- Modify: `src/types/auditoria.ts`
- Test: `src/lib/__tests__/snapshots.test.ts`

**Step 1: Write the failing test**

```ts
it('mapea a columnas reales de corte_conteo_snapshots', () => {
  const row = _toDbRow(samplePayload);
  expect(row).toHaveProperty('dollarCoin');
  expect(row).toHaveProperty('bill1');
  expect(row).toHaveProperty('bankTransfer');
});
```

```ts
it('fromDbRow consume columnas reales camelCase', () => {
  const row = { ...sampleDbRow, dollarCoin: 2, bill1: 7, bankTransfer: 11 };
  const mapped = _fromDbRow(row as unknown as CorteConteoSnapshot);
  expect(mapped.cashCount.dollarCoin).toBe(2);
  expect(mapped.electronicPayments.bankTransfer).toBe(11);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/__tests__/snapshots.test.ts -t "columnas reales|camelCase"`
Expected: FAIL por mapping snake_case actual.

**Step 3: Write minimal implementation**

```ts
// src/lib/snapshots.ts
// Ajustar toDbRow/fromDbRow a columnas reales actuales del table contract
// (dollarCoin, bill1..bill100, bankTransfer)
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/__tests__/snapshots.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/snapshots.ts src/lib/__tests__/snapshots.test.ts src/types/auditoria.ts
git commit -m "fix: align snapshot row mapping with current supabase table contract"
```

### Task 3: Contrato RED de migraciones mínimas requeridas

**Files:**
- Create: `src/__tests__/unit/supabase/migrations-contract.test.ts`
- Test: `src/__tests__/unit/supabase/migrations-contract.test.ts`
- Modify: `supabase/migrations/003_corte_conteo_snapshots_schema.sql`

**Step 1: Write the failing test**

```ts
it('migrations incluyen corte_conteo_snapshots', () => {
  const sql = readAllMigrations();
  expect(sql).toMatch(/create table if not exists public\\.corte_conteo_snapshots/i);
});
```

```ts
it('migrations incluyen indice por finalizado_at para supervisor', () => {
  const sql = readAllMigrations();
  expect(sql).toMatch(/idx_cortes_estado_finalizado/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/supabase/migrations-contract.test.ts`
Expected: FAIL porque aún no existe la migración 003 ni índice de supervisor.

**Step 3: Write minimal implementation**

```sql
-- supabase/migrations/003_corte_conteo_snapshots_schema.sql
-- Crear/normalizar table corte_conteo_snapshots + RLS + índices base.
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/unit/supabase/migrations-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add supabase/migrations/003_corte_conteo_snapshots_schema.sql src/__tests__/unit/supabase/migrations-contract.test.ts
git commit -m "feat(db): add snapshot schema migration and migration contract test"
```

### Task 4: Integridad anti-fraude de corte activo e intentos activos (BD)

**Files:**
- Modify: `supabase/migrations/004_cortes_integrity_guards.sql`
- Modify: `src/__tests__/unit/supabase/migrations-contract.test.ts`
- Test: `src/__tests__/unit/supabase/migrations-contract.test.ts`

**Step 1: Write the failing test**

```ts
it('define unique parcial para un corte activo por sucursal', () => {
  const sql = readAllMigrations();
  expect(sql).toMatch(/unique.*sucursal_id.*where.*estado.*in.*iniciado.*en_progreso/i);
});
```

```ts
it('define unique parcial para un intento ACTIVO por corte', () => {
  const sql = readAllMigrations();
  expect(sql).toMatch(/unique.*corte_id.*where.*estado.*activo/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/supabase/migrations-contract.test.ts -t "unique parcial|ACTIVO"`
Expected: FAIL.

**Step 3: Write minimal implementation**

```sql
-- supabase/migrations/004_cortes_integrity_guards.sql
create unique index if not exists uq_cortes_activo_por_sucursal
  on public.cortes (sucursal_id)
  where estado in ('INICIADO','EN_PROGRESO');

create unique index if not exists uq_intento_activo_por_corte
  on public.corte_intentos (corte_id)
  where estado = 'ACTIVO';

alter table public.cortes
  add constraint chk_cajero_testigo_distintos
  check (cajero <> testigo);
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/unit/supabase/migrations-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add supabase/migrations/004_cortes_integrity_guards.sql src/__tests__/unit/supabase/migrations-contract.test.ts
git commit -m "feat(db): enforce active-session and active-attempt integrity guards"
```

### Task 5: Identidad fuerte de empleados en cortes (FK + backfill)

**Files:**
- Modify: `supabase/migrations/005_cortes_employee_identity.sql`
- Modify: `src/hooks/useCorteSesion.ts`
- Modify: `src/pages/Index.tsx`
- Modify: `src/hooks/__tests__/useCorteSesion.test.ts`
- Modify: `src/__tests__/unit/pages/index.sync-ux.test.tsx`

**Step 1: Write the failing test**

```ts
it('iniciarCorte persiste cajero_id y testigo_id cuando se proveen IDs', async () => {
  // assert payload insert incluye campos de identidad
});
```

```ts
it('rechaza en BD si cajero_id === testigo_id', async () => {
  // contract test de constraint
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useCorteSesion.test.ts src/__tests__/unit/pages/index.sync-ux.test.tsx -t "cajero_id|testigo_id"`
Expected: FAIL.

**Step 3: Write minimal implementation**

```sql
-- supabase/migrations/005_cortes_employee_identity.sql
alter table public.cortes add column if not exists cajero_id text null references public.empleados(id);
alter table public.cortes add column if not exists testigo_id text null references public.empleados(id);
create index if not exists idx_cortes_cajero_id on public.cortes(cajero_id);
create index if not exists idx_cortes_testigo_id on public.cortes(testigo_id);
```

```ts
// src/hooks/useCorteSesion.ts + src/pages/Index.tsx
// incluir IDs en insert/update manteniendo nombres para compatibilidad de UI/reportes.
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useCorteSesion.test.ts src/__tests__/unit/pages/index.sync-ux.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add supabase/migrations/005_cortes_employee_identity.sql src/hooks/useCorteSesion.ts src/pages/Index.tsx src/hooks/__tests__/useCorteSesion.test.ts src/__tests__/unit/pages/index.sync-ux.test.tsx
git commit -m "feat(db): persist employee identity ids on cortes for anti-fraud traceability"
```

### Task 6: Verificación final y hardening

**Files:**
- Modify: `docs/04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/04_Verificacion.md`
- Modify: `docs/04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/05_DACC-R2_Reporte_Entrega.md`

**Step 1: Write the failing test**
- No aplica (tarea de verificación y documentación técnica).

**Step 2: Run test to verify it fails**
- No aplica.

**Step 3: Write minimal implementation**
- Documentar drift resuelto, migraciones nuevas y evidencias de comandos.

**Step 4: Run test to verify it passes**

Run:
- `npx vitest run src/lib/__tests__/supabase.test.ts src/lib/__tests__/snapshots.test.ts src/hooks/__tests__/useCorteSesion.test.ts src/__tests__/unit/pages/index.sync-ux.test.tsx src/__tests__/unit/supabase/migrations-contract.test.ts`
- `npm run build`

Expected: PASS en tests y build.

**Step 5: Commit**

```bash
git add docs/04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/04_Verificacion.md docs/04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/05_DACC-R2_Reporte_Entrega.md
git commit -m "docs: record supabase schema alignment and verification evidence"
```

---

## Petición lista para agente Supabase (SQL + datos)

Objetivo de la petición: dejar Supabase en estado “production-grade anti-fraude” alineado con el flujo actual.

1. Crear/normalizar `public.corte_conteo_snapshots` y versionar en migración:
- Si no existe: crear tabla.
- Si existe: mantener datos y normalizar contrato de columnas al acordado por app (definir explícitamente camelCase o snake_case; no mezclar).
- Asegurar índice `(corte_id, attempt_number, captured_at desc)`.
- Agregar política RLS explícita equivalente al resto de tablas operativas.

2. Agregar guardrails de integridad operativa:
- `uq_cortes_activo_por_sucursal` (partial unique: `estado in ('INICIADO','EN_PROGRESO')`).
- `uq_intento_activo_por_corte` (partial unique: `estado='ACTIVO'`).
- `chk_cajero_testigo_distintos` (`cajero <> testigo`).

3. Agregar identidad fuerte de empleados en `cortes`:
- Nuevas columnas `cajero_id`, `testigo_id` con FK a `empleados(id)`.
- Índices por `cajero_id`, `testigo_id`.
- Backfill inicial por match exacto de nombre (`cajero -> empleados.nombre`, `testigo -> empleados.nombre`).
- Reporte de colisiones/no-match en tabla auxiliar `cortes_backfill_conflicts` (para resolver manualmente).

4. Índices para consultas supervisor:
- `idx_cortes_estado_finalizado` sobre `(estado, finalizado_at desc)`.
- `idx_cortes_historial_sucursal_cajero` sobre `(sucursal_id, cajero, finalizado_at desc)`.

5. Entregables del agente Supabase:
- Script SQL idempotente por migración.
- Resultado de dry-run (conteos antes/después, filas afectadas por backfill).
- Plan de rollback por cada migración.

---

## Skills a usar al ejecutar

- `@test-driven-development`
- `@systematic-debugging`
- `@verification-before-completion`

