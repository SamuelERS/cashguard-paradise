# Supabase Reset + Datos Reales de Cortes Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Limpiar datos operativos viejos de Supabase de forma segura y reproducible, resembrar datos realistas de cortes, y validar si la discrepancia "pendiente vs no detectado" es data stale o bug real de lógica.

**Architecture:** Separar el trabajo en tres capas: diagnóstico SQL (sin mutaciones), limpieza transaccional de tablas operativas, y seed realista de escenarios actuales. Todo protegido por TDD con tests de contrato sobre scripts SQL y validación manual guiada en UI local para alinear Dashboard Supervisor y flujo nocturno.

**Tech Stack:** Vitest (contratos SQL), TypeScript, Supabase SQL Editor/Postgres SQL, Vite React app.

---

**Execution skills required:** `@test-driven-development` → `@systematic-debugging` → `@verification-before-completion`

### Task 1: Contrato TDD para scripts de mantenimiento (RED)

**Files:**
- Create: `src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`
- Create (expected by test): `supabase/maintenance/000_diagnostics_cortes.sql`
- Create (expected by test): `supabase/maintenance/010_reset_operational_data.sql`
- Create (expected by test): `supabase/maintenance/020_seed_cortes_realistas.sql`

**Step 1: Write the failing test**

```ts
import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const maintenanceDir = path.resolve(process.cwd(), 'supabase/maintenance');

function readSql(file: string): string {
  return readFileSync(path.join(maintenanceDir, file), 'utf8');
}

describe('Supabase maintenance scripts contract', () => {
  it('exige scripts base de diagnóstico/reset/seed', () => {
    expect(existsSync(path.join(maintenanceDir, '000_diagnostics_cortes.sql'))).toBe(true);
    expect(existsSync(path.join(maintenanceDir, '010_reset_operational_data.sql'))).toBe(true);
    expect(existsSync(path.join(maintenanceDir, '020_seed_cortes_realistas.sql'))).toBe(true);
  });

  it('reset solo toca tablas operativas de cortes', () => {
    const sql = readSql('010_reset_operational_data.sql');
    expect(sql).toMatch(/truncate\s+table\s+public\.corte_conteo_snapshots\s*,\s*public\.corte_intentos\s*,\s*public\.cortes/i);
    expect(sql).not.toMatch(/truncate\s+table\s+public\.sucursales/i);
    expect(sql).not.toMatch(/truncate\s+table\s+public\.empleados/i);
  });

  it('seed incluye al menos un corte FINALIZADO y uno EN_PROGRESO con intento activo consistente', () => {
    const sql = readSql('020_seed_cortes_realistas.sql');
    expect(sql).toMatch(/insert\s+into\s+public\.cortes/i);
    expect(sql).toMatch(/'FINALIZADO'/i);
    expect(sql).toMatch(/'EN_PROGRESO'/i);
    expect(sql).toMatch(/insert\s+into\s+public\.corte_intentos/i);
    expect(sql).toMatch(/'ACTIVO'/i);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`
Expected: FAIL porque `supabase/maintenance/*.sql` aún no existe.

**Step 3: Write minimal implementation**

Crear placeholders mínimos:

```sql
-- supabase/maintenance/000_diagnostics_cortes.sql
-- TODO: diagnostics
```

```sql
-- supabase/maintenance/010_reset_operational_data.sql
TRUNCATE TABLE public.corte_conteo_snapshots, public.corte_intentos, public.cortes;
```

```sql
-- supabase/maintenance/020_seed_cortes_realistas.sql
-- TODO: seed
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`
Expected: FAIL parcial aún por reglas de seed (esto es aceptable para continuar en Task 2/3 con TDD incremental).

**Step 5: Commit**

```bash
git add src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts supabase/maintenance/000_diagnostics_cortes.sql supabase/maintenance/010_reset_operational_data.sql supabase/maintenance/020_seed_cortes_realistas.sql
git commit -m "test(supabase): define contrato TDD para scripts de mantenimiento"
```

### Task 2: Script de diagnóstico forense de inconsistencias (GREEN)

**Files:**
- Modify: `supabase/maintenance/000_diagnostics_cortes.sql`
- Modify: `src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`

**Step 1: Write the failing test**

Agregar casos RED al test:

```ts
it('diagnostics reporta ghost states y divergencias corte/intento', () => {
  const sql = readSql('000_diagnostics_cortes.sql');
  expect(sql).toMatch(/estado\s+in\s*\(\s*'INICIADO'\s*,\s*'EN_PROGRESO'\s*\)/i);
  expect(sql).toMatch(/finalizado_at\s+is\s+not\s+null/i);
  expect(sql).toMatch(/left\s+join\s+public\.corte_intentos/i);
  expect(sql).toMatch(/where\s+i\.id\s+is\s+null/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`
Expected: FAIL porque el script diagnóstico aún es placeholder.

**Step 3: Write minimal implementation**

`supabase/maintenance/000_diagnostics_cortes.sql`:

```sql
-- Diagnóstico NO destructivo para detectar stale data e inconsistencias.

-- A) Activos inválidos: estado activo con finalizado_at no nulo.
select id, correlativo, sucursal_id, estado, created_at, finalizado_at
from public.cortes
where estado in ('INICIADO', 'EN_PROGRESO')
  and finalizado_at is not null
order by updated_at desc;

-- B) Activos sin intento ACTIVO asociado.
select c.id, c.correlativo, c.sucursal_id, c.estado, c.intento_actual
from public.cortes c
left join public.corte_intentos i
  on i.corte_id = c.id
 and i.estado = 'ACTIVO'
where c.estado in ('INICIADO', 'EN_PROGRESO')
  and i.id is null
order by c.updated_at desc;

-- C) Conteo de activos por sucursal (debe ser <= 1 por guardrail).
select sucursal_id, count(*) as activos
from public.cortes
where estado in ('INICIADO', 'EN_PROGRESO')
group by sucursal_id
having count(*) > 1;
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`
Expected: PASS para los asserts de diagnóstico.

**Step 5: Commit**

```bash
git add supabase/maintenance/000_diagnostics_cortes.sql src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts
git commit -m "feat(supabase): agrega diagnóstico forense para cortes activos inconsistentes"
```

### Task 3: Script de reset seguro de datos operativos (GREEN)

**Files:**
- Modify: `supabase/maintenance/010_reset_operational_data.sql`
- Modify: `src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`

**Step 1: Write the failing test**

Agregar RED para exigir transacción + safe guards:

```ts
it('reset usa transacción y preserva catálogos', () => {
  const sql = readSql('010_reset_operational_data.sql');
  expect(sql).toMatch(/begin;[\s\S]*commit;/i);
  expect(sql).toMatch(/truncate\s+table\s+public\.corte_conteo_snapshots\s*,\s*public\.corte_intentos\s*,\s*public\.cortes/i);
  expect(sql).toMatch(/restart\s+identity/i);
  expect(sql).toMatch(/notify\s+pgrst\s*,\s*'reload schema'/i);
  expect(sql).not.toMatch(/public\.sucursales/i);
  expect(sql).not.toMatch(/public\.empleados/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`
Expected: FAIL por ausencia de `BEGIN/COMMIT/RESTART IDENTITY`.

**Step 3: Write minimal implementation**

`supabase/maintenance/010_reset_operational_data.sql`:

```sql
BEGIN;

TRUNCATE TABLE
  public.corte_conteo_snapshots,
  public.corte_intentos,
  public.cortes
RESTART IDENTITY;

COMMIT;

NOTIFY pgrst, 'reload schema';
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`
Expected: PASS en reglas de reset.

**Step 5: Commit**

```bash
git add supabase/maintenance/010_reset_operational_data.sql src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts
git commit -m "feat(supabase): añade reset transaccional de tablas operativas de cortes"
```

### Task 4: Seed realista y consistente para validar reglas maduras (GREEN)

**Files:**
- Modify: `supabase/maintenance/020_seed_cortes_realistas.sql`
- Modify: `src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`

**Step 1: Write the failing test**

Agregar asserts RED:

```ts
it('seed llena datos financieros legibles y snapshots de auditoría', () => {
  const sql = readSql('020_seed_cortes_realistas.sql');
  expect(sql).toMatch(/datos_conteo/i);
  expect(sql).toMatch(/datos_entrega/i);
  expect(sql).toMatch(/gastos_dia/i);
  expect(sql).toMatch(/insert\s+into\s+public\.corte_conteo_snapshots/i);
  expect(sql).toMatch(/'manual'|'autosave'/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`
Expected: FAIL porque seed aún no está implementado.

**Step 3: Write minimal implementation**

`supabase/maintenance/020_seed_cortes_realistas.sql` (estructura mínima sugerida):

```sql
BEGIN;

with corte_finalizado as (
  insert into public.cortes (
    correlativo, sucursal_id, cajero, testigo, estado, fase_actual, intento_actual,
    venta_esperada, datos_conteo, datos_entrega, datos_verificacion, datos_reporte,
    reporte_hash, created_at, updated_at, finalizado_at
  ) values (
    'CORTE-2026-02-25-H-001', 'suc-001', 'Adonay Torres', 'Jonathan Melara', 'FINALIZADO', 3, 1,
    654.00,
    '{"conteo_parcial":{"bill100":2,"bill50":3},"pagos_electronicos":{"credomatic":23},"gastos_dia":{"items":[{"id":"g1","amount":12.5,"concept":"Taxi cierre"}]}}'::jsonb,
    '{"amount_to_deliver":573.57,"amount_remaining":50}'::jsonb,
    '{"override_count":0,"triple_mismatch_count":0}'::jsonb,
    '{"generated_by":"seed"}'::jsonb,
    'seed-finalizado-hoy', now() - interval '30 minutes', now() - interval '15 minutes', now() - interval '15 minutes'
  )
  returning id
),
intento_finalizado as (
  insert into public.corte_intentos (corte_id, attempt_number, estado, snapshot_datos, finalizado_at)
  select id, 1, 'COMPLETADO', '{}'::jsonb, now() - interval '15 minutes'
  from corte_finalizado
),
corte_activo as (
  insert into public.cortes (
    correlativo, sucursal_id, cajero, testigo, estado, fase_actual, intento_actual,
    venta_esperada, datos_conteo, datos_entrega, datos_verificacion, created_at, updated_at
  ) values (
    'CORTE-2026-02-25-M-001', 'suc-002', 'Irvin Abarca', 'Edenilson Lopez', 'EN_PROGRESO', 2, 1,
    712.40,
    '{"conteo_parcial":{"bill20":10,"bill10":5},"pagos_electronicos":{"promerica":41.2},"gastos_dia":{"items":[]}}'::jsonb,
    '{"amount_to_deliver":291.2,"amount_remaining":50}'::jsonb,
    '{"override_count":1,"triple_mismatch_count":0}'::jsonb,
    now() - interval '20 minutes', now() - interval '2 minutes'
  )
  returning id
)
insert into public.corte_intentos (corte_id, attempt_number, estado, snapshot_datos)
select id, 1, 'ACTIVO', '{}'::jsonb
from corte_activo;

insert into public.corte_conteo_snapshots (
  corte_id, attempt_number, fase_actual,
  bill100, bill50, bill20, bill10, credomatic, promerica,
  gastos_dia, source
)
select c.id, 1, c.fase_actual, 2, 3, 0, 0, 23, 0, '[{"id":"g1","amount":12.5,"concept":"Taxi cierre"}]'::jsonb, 'manual'
from public.cortes c
where c.correlativo = 'CORTE-2026-02-25-H-001';

COMMIT;

NOTIFY pgrst, 'reload schema';
```

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`
Expected: PASS en contrato de seed.

**Step 5: Commit**

```bash
git add supabase/maintenance/020_seed_cortes_realistas.sql src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts
git commit -m "feat(supabase): agrega seed realista de cortes para validación funcional"
```

### Task 5: Runbook operativo + validación cruzada UI (TDD documental)

**Files:**
- Create: `docs/qa/supabase-reset-y-validacion-cortes.md`
- Modify: `docs/qa/nocturnal-active-session-regression.md`

**Step 1: Write the failing test**

Crear test de presencia de runbook:

```ts
it('existe runbook QA para reset + seed + verificación de discrepancias', () => {
  const runbookPath = path.resolve(process.cwd(), 'docs/qa/supabase-reset-y-validacion-cortes.md');
  expect(existsSync(runbookPath)).toBe(true);
  const md = readFileSync(runbookPath, 'utf8');
  expect(md).toMatch(/000_diagnostics_cortes\.sql/i);
  expect(md).toMatch(/010_reset_operational_data\.sql/i);
  expect(md).toMatch(/020_seed_cortes_realistas\.sql/i);
  expect(md).toMatch(/Dashboard Supervisor/i);
  expect(md).toMatch(/Corte Nocturno/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:unit -- src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`
Expected: FAIL porque el runbook aún no existe.

**Step 3: Write minimal implementation**

`docs/qa/supabase-reset-y-validacion-cortes.md` debe incluir:
- Pre-check: ejecutar `000_diagnostics_cortes.sql` y guardar evidencia.
- Reset: ejecutar `010_reset_operational_data.sql`.
- Seed: ejecutar `020_seed_cortes_realistas.sql`.
- Validación UI local:
  1. `Dashboard Supervisor > Hoy` muestra 1 `EN_PROGRESO` + 1 `FINALIZADO`.
  2. `Corte Nocturno` en sucursal con activo debe advertir sesión activa.
  3. `Corte Nocturno` en sucursal sin activo debe permitir flujo normal.
- Criterios para distinguir causa:
  - Si todo cuadra tras reset+seed: problema era stale data.
  - Si no cuadra: bug real en lógica de detección/consulta.

**Step 4: Run test to verify it passes**

Run: `npm run test:unit -- src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add docs/qa/supabase-reset-y-validacion-cortes.md docs/qa/nocturnal-active-session-regression.md src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts
git commit -m "docs(qa): agrega runbook de reset supabase y validación cruzada supervisor/nocturno"
```

### Task 6: Verificación final obligatoria + build/restart

**Files:**
- No code changes (verification task)

**Step 1: Write the failing test**

No aplica (task de verificación final, no implementación).

**Step 2: Run test to verify it fails**

No aplica.

**Step 3: Write minimal implementation**

No aplica.

**Step 4: Run test to verify it passes**

Ejecutar verificación completa:

```bash
npm run test:unit -- src/__tests__/unit/supabase/maintenance-scripts-contract.test.ts
npm run test:unit -- src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts src/__tests__/unit/pages/index.sync-ux.test.tsx
npm run build
```

Esperado:
- Tests nuevos de mantenimiento: PASS
- Regresión supervisor/index: PASS
- Build: PASS

Luego reiniciar app local:

```bash
pkill -f 'vite' || true
npm run dev -- --host 0.0.0.0 --port 5173
```

**Step 5: Commit**

```bash
git status
# Debe quedar limpio si no hubo cambios adicionales
```

---

## Supabase SQL execution order (manual, en entorno que corresponda)

1. `supabase/maintenance/000_diagnostics_cortes.sql`
2. `supabase/maintenance/010_reset_operational_data.sql`
3. `supabase/maintenance/020_seed_cortes_realistas.sql`
4. (Opcional) `select public.reconciliar_cortes_vencidos((now() at time zone 'America/El_Salvador')::date);`

## Safety rules

- Nunca truncar `public.sucursales`, `public.empleados`, `public.empleado_sucursales`.
- Ejecutar reset/seed primero en entorno de prueba/staging antes de producción.
- Guardar evidencia del diagnóstico pre-reset para comparar causa raíz.

## Expected decision after execution

- **Caso A (data stale):** después de reset+seed, supervisor y nocturno quedan alineados.
- **Caso B (bug real):** persiste discrepancia; abrir inmediatamente plan específico de bugfix en `detectActiveCashCutSession`/`recuperarSesion` con reproducción sobre dataset limpio.
