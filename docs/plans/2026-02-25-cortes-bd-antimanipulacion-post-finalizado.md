# Corte Terminal Anti-Manipulación (Supabase) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Blindar la base de datos para que ningún corte `FINALIZADO` o `ABORTADO` pueda ser alterado en montos/estado por clientes, incluso si alguien intenta manipular requests.

**Architecture:** Se aplica hardening en dos capas: (1) **trigger de inmutabilidad terminal** para bloquear updates/delete en filas terminales y validar transiciones de estado; (2) **RLS granular** para eliminar la policy abierta `anon_rw_*` y permitir solo operaciones legítimas del flujo operativo. El trabajo se guía por TDD: primero pruebas RED de contrato SQL, luego migraciones mínimas, y finalmente smoke tests SQL de ataque.

**Tech Stack:** Supabase Postgres, SQL migrations, RLS, PL/pgSQL triggers, Vitest (contract tests de migraciones).

---

## Contexto operativo y skills a usar durante ejecución

- Contexto recomendado: worktree dedicado.
- Skills: `@systematic-debugging`, `@test-driven-development`, `@verification-before-completion`, `@commit-work`.
- Regla: no tocar lógica de UI en esta fase; solo blindaje de BD + mapeo de errores de BD.

---

### Task 1: Contrato RED de hardening terminal en migraciones

**Files:**
- Create: `src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`
- Test: `src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

function readAllMigrations(): string {
  const dir = join(process.cwd(), 'supabase/migrations');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => readFileSync(join(dir, f), 'utf8'))
    .join('\n\n');
}

describe('cortes terminal hardening contract', () => {
  it('define trigger de inmutabilidad para cortes terminales', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/prevent_terminal_corte_mutation/i);
    expect(sql).toMatch(/trg_cortes_prevent_terminal_mutation/i);
  });

  it('elimina policy anon_rw_cortes abierta y define policies granulares', () => {
    const sql = readAllMigrations();
    expect(sql).toMatch(/drop policy if exists anon_rw_cortes/i);
    expect(sql).toMatch(/create policy .*cortes_select/i);
    expect(sql).toMatch(/create policy .*cortes_insert/i);
    expect(sql).toMatch(/create policy .*cortes_update_non_terminal/i);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`
Expected: FAIL por trigger/policies aún no existentes.

**Step 3: Write minimal implementation**

Agregar solo el archivo de test (sin migración todavía).

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`
Expected: Sigue FAIL (RED confirmado).

**Step 5: Commit**

```bash
git add src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts
git commit -m "test(db): add red contract for terminal anti-tampering hardening"
```

---

### Task 2: Trigger de inmutabilidad terminal para `cortes`

**Files:**
- Create: `supabase/migrations/006_cortes_terminal_immutability.sql`
- Modify: `src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`
- Test: `src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`

**Step 1: Write the failing test**

```ts
it('bloquea UPDATE y DELETE en cortes FINALIZADO/ABORTADO', () => {
  const sql = readAllMigrations();
  expect(sql).toMatch(/raise exception 'Corte terminal inmutable'/i);
  expect(sql).toMatch(/before update on public\.cortes/i);
  expect(sql).toMatch(/before delete on public\.cortes/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts -t "inmutable|UPDATE y DELETE"`
Expected: FAIL.

**Step 3: Write minimal implementation**

```sql
-- supabase/migrations/006_cortes_terminal_immutability.sql
BEGIN;

CREATE OR REPLACE FUNCTION public.prevent_terminal_corte_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.estado IN ('FINALIZADO', 'ABORTADO') THEN
    RAISE EXCEPTION 'Corte terminal inmutable';
  END IF;

  IF TG_OP = 'DELETE' AND OLD.estado IN ('FINALIZADO', 'ABORTADO') THEN
    RAISE EXCEPTION 'Corte terminal inmutable';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_cortes_prevent_terminal_mutation ON public.cortes;
CREATE TRIGGER trg_cortes_prevent_terminal_mutation
BEFORE UPDATE OR DELETE ON public.cortes
FOR EACH ROW
EXECUTE FUNCTION public.prevent_terminal_corte_mutation();

COMMIT;
NOTIFY pgrst, 'reload schema';
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`
Expected: PASS en assertions del trigger.

**Step 5: Commit**

```bash
git add supabase/migrations/006_cortes_terminal_immutability.sql src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts
git commit -m "feat(db): add terminal immutability trigger for cortes"
```

---

### Task 3: RLS granular para `cortes` (cerrar policy abierta)

**Files:**
- Create: `supabase/migrations/007_cortes_rls_hardening.sql`
- Modify: `src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`
- Test: `src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`

**Step 1: Write the failing test**

```ts
it('policy update solo permite filas no terminales', () => {
  const sql = readAllMigrations();
  expect(sql).toMatch(/create policy .*cortes_update_non_terminal/i);
  expect(sql).toMatch(/using \(estado in \('INICIADO','EN_PROGRESO'\)\)/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts -t "update_non_terminal"`
Expected: FAIL.

**Step 3: Write minimal implementation**

```sql
-- supabase/migrations/007_cortes_rls_hardening.sql
BEGIN;

ALTER TABLE public.cortes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_rw_cortes ON public.cortes;
DROP POLICY IF EXISTS cortes_select ON public.cortes;
DROP POLICY IF EXISTS cortes_insert ON public.cortes;
DROP POLICY IF EXISTS cortes_update_non_terminal ON public.cortes;

CREATE POLICY cortes_select ON public.cortes
FOR SELECT TO anon
USING (true);

CREATE POLICY cortes_insert ON public.cortes
FOR INSERT TO anon
WITH CHECK (estado IN ('INICIADO','EN_PROGRESO'));

CREATE POLICY cortes_update_non_terminal ON public.cortes
FOR UPDATE TO anon
USING (estado IN ('INICIADO','EN_PROGRESO'))
WITH CHECK (estado IN ('INICIADO','EN_PROGRESO','FINALIZADO','ABORTADO'));

COMMIT;
NOTIFY pgrst, 'reload schema';
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add supabase/migrations/007_cortes_rls_hardening.sql src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts
git commit -m "feat(db): replace open cortes policy with granular non-terminal RLS"
```

---

### Task 4: Inmutabilidad para `corte_intentos` completados/abandonados

**Files:**
- Create: `supabase/migrations/008_corte_intentos_terminal_immutability.sql`
- Modify: `src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`
- Test: `src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`

**Step 1: Write the failing test**

```ts
it('define trigger de inmutabilidad para corte_intentos terminales', () => {
  const sql = readAllMigrations();
  expect(sql).toMatch(/prevent_terminal_intento_mutation/i);
  expect(sql).toMatch(/trg_intentos_prevent_terminal_mutation/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts -t "intentos terminales"`
Expected: FAIL.

**Step 3: Write minimal implementation**

```sql
-- supabase/migrations/008_corte_intentos_terminal_immutability.sql
BEGIN;

CREATE OR REPLACE FUNCTION public.prevent_terminal_intento_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.estado IN ('COMPLETADO', 'ABANDONADO') THEN
    RAISE EXCEPTION 'Intento terminal inmutable';
  END IF;

  IF TG_OP = 'DELETE' AND OLD.estado IN ('COMPLETADO', 'ABANDONADO') THEN
    RAISE EXCEPTION 'Intento terminal inmutable';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_intentos_prevent_terminal_mutation ON public.corte_intentos;
CREATE TRIGGER trg_intentos_prevent_terminal_mutation
BEFORE UPDATE OR DELETE ON public.corte_intentos
FOR EACH ROW
EXECUTE FUNCTION public.prevent_terminal_intento_mutation();

COMMIT;
NOTIFY pgrst, 'reload schema';
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add supabase/migrations/008_corte_intentos_terminal_immutability.sql src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts
git commit -m "feat(db): enforce terminal immutability for corte_intentos"
```

---

### Task 5: Smoke script SQL anti-manipulación (ataques controlados)

**Files:**
- Create: `supabase/maintenance/030_smoke_terminal_antitamper.sql`
- Test: `supabase/maintenance/030_smoke_terminal_antitamper.sql`

**Step 1: Write the failing test**

Crear script que intente:

```sql
-- 1) Update en FINALIZADO (debe fallar)
-- 2) Delete en FINALIZADO (debe fallar)
-- 3) Update en EN_PROGRESO -> FINALIZADO (debe pasar con datos válidos)
```

**Step 2: Run test to verify it fails**

Run (SQL Editor Supabase): `supabase/maintenance/030_smoke_terminal_antitamper.sql`
Expected: Antes de migraciones, algunos ataques pasan => FAIL del smoke.

**Step 3: Write minimal implementation**

```sql
-- DO $$ bloques con begin/exception para marcar PASS/FAIL por caso
RAISE NOTICE 'PASS: terminal update bloqueado';
RAISE NOTICE 'PASS: terminal delete bloqueado';
```

**Step 4: Run test to verify it passes**

Run (SQL Editor Supabase): `supabase/maintenance/030_smoke_terminal_antitamper.sql`
Expected: solo PASS notices, sin huecos abiertos.

**Step 5: Commit**

```bash
git add supabase/maintenance/030_smoke_terminal_antitamper.sql
git commit -m "test(db): add anti-tampering smoke script for terminal cuts"
```

---

### Task 6: Manejo UX de error de trigger/RLS en app (mensaje claro)

**Files:**
- Modify: `src/lib/esErrorDeRed.ts`
- Modify: `src/hooks/useCorteSesion.ts`
- Modify: `src/hooks/__tests__/useCorteSesion.test.ts`
- Test: `src/hooks/__tests__/useCorteSesion.test.ts`

**Step 1: Write the failing test**

```ts
it('si BD rechaza por inmutabilidad terminal, retorna error explícito no-red', async () => {
  mockChain.cortes.single.mockResolvedValueOnce({
    data: null,
    error: { message: 'Corte terminal inmutable' },
  });

  await expect(result.current.finalizarCorte('hash')).rejects.toThrow(/inmutable/i);
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useCorteSesion.test.ts -t "inmutabilidad terminal"`
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
// useCorteSesion.ts
// Mantener rechazo como error de negocio (no clasificarlo como error de red)
if (updateError?.message?.includes('inmutable')) {
  throw new Error('Este corte ya está cerrado y no puede modificarse.');
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useCorteSesion.test.ts -t "inmutabilidad terminal"`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/useCorteSesion.ts src/hooks/__tests__/useCorteSesion.test.ts src/lib/esErrorDeRed.ts
git commit -m "fix: surface clear terminal-immutability errors from database"
```

---

### Task 7: Verificación final integral

**Files:**
- Modify: `docs/04_desarrollo/` (solo si hay guía existente de seguridad Supabase)

**Step 1: Write the failing test**

No aplica código nuevo; checklist RED de verificación:
- contrato SQL
- suite de `useCorteSesion`
- smoke SQL anti-tamper

**Step 2: Run test to verify it fails**

Run:
- `npx vitest run src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts`
- `npx vitest run src/hooks/__tests__/useCorteSesion.test.ts`

Expected: Debe reflejar cualquier hueco pendiente.

**Step 3: Write minimal implementation**

Completar ajustes mínimos que falten (sin refactor extra, sin scope creep).

**Step 4: Run test to verify it passes**

Run:
- `npx vitest run src/__tests__/unit/supabase/cortes-terminal-hardening-contract.test.ts src/hooks/__tests__/useCorteSesion.test.ts`
- `npm run build`

Expected: PASS + build OK.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore(db): finalize anti-tampering hardening for terminal cash cuts"
```

---

## Rollout / rollback seguro

1. Aplicar migraciones en staging primero.
2. Ejecutar `supabase/maintenance/030_smoke_terminal_antitamper.sql` en staging.
3. Validar flujo real: `INICIADO -> EN_PROGRESO -> FINALIZADO`.
4. Si rompe operación legítima: rollback de migraciones `008`, `007`, `006` en orden inverso.
5. Repetir smoke tras rollback para confirmar restauración.

---

## Criterios de aceptación

- No existe policy abierta `anon_rw_cortes`.
- Un corte en `FINALIZADO`/`ABORTADO` no permite update/delete por cliente.
- Intentos `COMPLETADO`/`ABANDONADO` no permiten update/delete por cliente.
- La app muestra mensaje claro cuando BD bloquea mutación terminal.
- Tests y build en verde.
