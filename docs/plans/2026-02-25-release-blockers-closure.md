# Release Blockers Closure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cerrar los 4 bloqueos de salida (test de integración roto, gate de CI, migración realtime en producción y push/estado remoto) para habilitar un GO controlado a producción.

**Architecture:** Primero corregimos la regresión de tests para alinear contrato UX actual (mensaje institucional fijo, sin toggle). Luego ejecutamos verificación de gates local+CI y confirmamos publicación realtime en Supabase productivo con evidencia trazable. Finalmente cerramos el estado remoto (push + CI verde + evidencia de migración aplicada).

**Tech Stack:** React 18 + TypeScript, Vitest + Testing Library, GitHub Actions, Supabase Postgres (SQL Editor/CLI), npm scripts de calidad.

**Execution discipline:** @systematic-debugging, @test-driven-development, @verification-before-completion, @commit-work

---

### Task 1: Corregir la falla de integración del mensaje del equipo

**Files:**
- Modify: `src/__tests__/integration/morning-count-simplified.test.tsx`
- Modify: `src/components/operation-selector/__tests__/OperationSelector.motivational-panel.test.tsx`

**Step 1: Write the failing test**

Reemplazar el caso que busca toggle por un caso que valide panel fijo:

```tsx
import { screen, waitFor, within } from '@testing-library/react';

it('debe mostrar mensaje institucional fijo del equipo', async () => {
  renderWithProviders(<Index />);

  await waitFor(() => {
    expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
  });

  const panel = screen.getByRole('note');
  expect(within(panel).getByText(/Compromiso Operativo/i)).toBeInTheDocument();
  expect(within(panel).getByText(/Este sistema resguarda tu trabajo diario/i)).toBeInTheDocument();
  expect(within(panel).getByText(/Equipo de Acuarios Paradise/i)).toBeInTheDocument();
  expect(within(panel).getByText(/JesucristoEsDios/i)).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /ver mensaje del equipo/i })).not.toBeInTheDocument();
});
```

Actualizar también el test unitario `OperationSelector.motivational-panel.test.tsx` para que no espere expansión/colapso.

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/integration/morning-count-simplified.test.tsx src/components/operation-selector/__tests__/OperationSelector.motivational-panel.test.tsx`

Expected: FAIL inicial (antes de ajustar ambos tests) por búsqueda de botón `ver mensaje del equipo`.

**Step 3: Write minimal implementation**

Solo cambiar tests para reflejar contrato UX vigente (sin tocar lógica de `OperationSelector.tsx`).

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/integration/morning-count-simplified.test.tsx src/components/operation-selector/__tests__/OperationSelector.motivational-panel.test.tsx`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/__tests__/integration/morning-count-simplified.test.tsx src/components/operation-selector/__tests__/OperationSelector.motivational-panel.test.tsx
git commit -m "test(operation-selector): align team-message tests with fixed institutional panel"
```

### Task 2: Blindar gate local que replica CI

**Files:**
- Create: `docs/release/2026-02-25-release-gate-evidence.md`

**Step 1: Write the failing test**

Ejecutar primero el gate completo local para capturar baseline actual:

Run:
- `npm run lint`
- `npm run test:unit`
- `npm run test:integration`
- `npm run build`
- `npm run test:e2e:smoke`

Expected: Si Task 1 no está aplicado, `test:integration` falla; tras Task 1, todo debe pasar.

**Step 2: Run test to verify it fails**

Documentar el primer estado (si hubo falla) en evidencia con fecha/hora/commit.

**Step 3: Write minimal implementation**

Crear `docs/release/2026-02-25-release-gate-evidence.md` con plantilla:

```md
# Release Gate Evidence (2026-02-25)

- Branch: `codex/integration-release-feature`
- Commit evaluado: `<sha>`
- Fecha/hora local: `<timestamp>`

## Resultados
- lint: PASS/FAIL
- test:unit: PASS/FAIL
- test:integration: PASS/FAIL
- build: PASS/FAIL
- test:e2e:smoke: PASS/FAIL

## Observaciones
- <riesgos restantes>
```

**Step 4: Run test to verify it passes**

Re-ejecutar gate completo y actualizar evidencia con PASS final.

Expected: Todos PASS.

**Step 5: Commit**

```bash
git add docs/release/2026-02-25-release-gate-evidence.md
git commit -m "docs(release): add local gate evidence for production readiness"
```

### Task 3: Confirmar migración 010 aplicada en Supabase producción

**Files:**
- Create: `docs/release/2026-02-25-supabase-realtime-verification.md`

**Step 1: Write the failing test**

Ejecutar query de verificación en Supabase SQL Editor antes de aplicar `010` (si aún no aplicada):

```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename IN ('cortes', 'corte_intentos')
ORDER BY tablename;
```

Expected: resultado incompleto o vacío si no está aplicada.

**Step 2: Run test to verify it fails**

Si falta alguna tabla, aplicar `supabase/migrations/010_supervisor_realtime_publication.sql` en el entorno productivo.

**Step 3: Write minimal implementation**

Guardar evidencia en `docs/release/2026-02-25-supabase-realtime-verification.md`:

````md
# Supabase Realtime Verification (2026-02-25)

## Query de verificación
```sql
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
  AND tablename IN ('cortes', 'corte_intentos')
ORDER BY tablename;
```

## Resultado esperado
| schemaname | tablename |
|---|---|
| public | corte_intentos |
| public | cortes |

## Estado
- Migration `010_supervisor_realtime_publication.sql`: APPLIED
- Validación: PASS
````

**Step 4: Run test to verify it passes**

Re-ejecutar la query y confirmar 2 filas (`cortes`, `corte_intentos`).

Expected: PASS.

**Step 5: Commit**

```bash
git add docs/release/2026-02-25-supabase-realtime-verification.md
git commit -m "docs(supabase): record production verification for realtime publication"
```

### Task 4: Cerrar estado remoto (push + CI gate verde)

**Files:**
- Modify: `docs/release/2026-02-25-release-gate-evidence.md`

**Step 1: Write the failing test**

Verificar estado remoto actual:

Run:
- `git status -sb`
- `git branch -vv`

Expected: branch sin upstream o commits sin publicar.

**Step 2: Run test to verify it fails**

Intentar revisar CI sin push (no habrá corrida nueva para estos cambios).

**Step 3: Write minimal implementation**

Publicar branch y disparar pipeline:

```bash
git push -u origin codex/integration-release-feature
```

Monitorear workflow `Complete Test Suite` en GitHub hasta estado verde.

**Step 4: Run test to verify it passes**

Criterio PASS:
- `test-unit-integration`: PASS
- `test-quality`: PASS
- `test-e2e`: PASS

Actualizar `docs/release/2026-02-25-release-gate-evidence.md` con links de corrida y conclusión `GO`.

**Step 5: Commit**

```bash
git add docs/release/2026-02-25-release-gate-evidence.md
git commit -m "docs(release): append CI results and go-live decision"
```

### Task 5: Verificación final de salida controlada

**Files:**
- Modify: `docs/release/2026-02-25-release-gate-evidence.md`

**Step 1: Write the failing test**

Checklist final (debe cumplir TODO):
- [ ] integración corregida
- [ ] gate local completo PASS
- [ ] migración 010 validada en prod
- [ ] branch push + CI PASS

**Step 2: Run test to verify it fails**

Si hay cualquier casilla abierta, estado = `NO-GO`.

**Step 3: Write minimal implementation**

Cerrar casillas y registrar decisión:

```md
## Go/No-Go
- Decision: GO
- Fecha: 2026-02-25
- Responsable: <nombre>
- Riesgos abiertos: <si/no>
```

**Step 4: Run test to verify it passes**

Expected: Checklist 100% completo + `Decision: GO`.

**Step 5: Commit**

```bash
git add docs/release/2026-02-25-release-gate-evidence.md
git commit -m "docs(release): finalize go/no-go checklist"
```
