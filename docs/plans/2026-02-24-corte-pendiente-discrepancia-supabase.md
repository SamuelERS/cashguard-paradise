# Supervisor vs Corte Nocturno State Discrepancy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminar la discrepancia donde Supervisor muestra un corte `EN_PROGRESO` pero el flujo nocturno intenta iniciar uno nuevo, y mostrar errores de conexión reales (no genéricos) cuando falla Supabase.

**Architecture:** Convertir la detección de sesión activa en un flujo de estado explícito (ok/error de conectividad), revalidar sesión activa justo antes de `iniciarCorte`, y bloquear el avance cuando la conectividad no permite confiar en el estado. Mantener una sola fuente de verdad: tabla `cortes` (`INICIADO`/`EN_PROGRESO` activa, `FINALIZADO`/`ABORTADO` terminal).

**Tech Stack:** React 18, TypeScript, Vitest + Testing Library, Supabase JS.

---

## Context and Constraints
- Apply `@systematic-debugging` first: no fix without reproducible failing tests.
- Apply `@test-driven-development`: RED -> GREEN -> REFACTOR per task.
- Final verification with `@verification-before-completion`.
- Keep commits small and frequent via `@commit-work`.
- Work in a dedicated worktree.

### Expected Root-Cause Hypothesis (to confirm with RED tests)
- `Index.tsx` can degrade to `hasActive=false` when active-session detection fails by network/timeout, allowing wizard step 5 to continue and call `iniciarCorte`.
- `iniciarCorte` then fails (generic toast), while Supervisor still correctly reads `EN_PROGRESO` from DB.

---

### Task 1: Reproduce the Mismatch in Unit Tests (RED)

**Files:**
- Create: `src/__tests__/unit/pages/index.active-session-consistency.test.tsx`
- Modify: `src/__tests__/unit/pages/index.sync-ux.test.tsx`
- Test: `src/__tests__/unit/pages/index.active-session-consistency.test.tsx`

**Step 1: Write failing test for "active in Supervisor, not recognized in wizard"**

```tsx
it('when Supabase has EN_PROGRESO for selected store, wizard must not call iniciarCorte', async () => {
  // mock detectActiveCashCutSession -> returns active session for same sucursal
  // complete step 5
  // expect iniciarCorte NOT called
  // expect resume/active-session UI state is present
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- src/__tests__/unit/pages/index.active-session-consistency.test.tsx -t "must not call iniciarCorte"`
Expected: FAIL with `iniciarCorte` called once.

**Step 3: Write failing test for connectivity error path**

```tsx
it('if active-session detection has network error, blocks continuation and shows connection error', async () => {
  // mock tables.cortes().maybeSingle() -> throw TypeError('Failed to fetch')
  // open nocturnal wizard
  // complete step 5 action
  // expect connection-specific toast
  // expect iniciarCorte NOT called
});
```

**Step 4: Run both RED tests**

Run: `npm test -- src/__tests__/unit/pages/index.active-session-consistency.test.tsx`
Expected: both FAIL for current behavior.

**Step 5: Commit RED tests**

```bash
git add src/__tests__/unit/pages/index.active-session-consistency.test.tsx src/__tests__/unit/pages/index.sync-ux.test.tsx
git commit -m "test(index): reproduce active-session mismatch and connectivity false-negative"
```

---

### Task 2: Enforce Active-Session Truth Before iniciarCorte (GREEN)

**Files:**
- Modify: `src/pages/Index.tsx`
- Test: `src/__tests__/unit/pages/index.active-session-consistency.test.tsx`

**Step 1: Add explicit tri-state result for active-session detection**

```ts
type ActiveSessionCheck = {
  status: 'ok' | 'connectivity_error';
  hasActive: boolean;
  sucursalId: string | null;
  sessionInfo: { correlativo: string | null; createdAt: string | null; cajero: string | null; estado: string | null } | null;
};
```

**Step 2: Return `status: 'connectivity_error'` on catch/error**

```ts
if (error) {
  return { status: 'connectivity_error', hasActive: false, sucursalId: null, sessionInfo: null };
}
```

**Step 3: Revalidate active session immediately before `iniciarCorte`**

```ts
const latest = await detectActiveCashCutSession();
if (latest.status === 'connectivity_error') {
  toast.error('Sin conexión a Supabase. No se puede validar sesión activa.');
  return;
}
if (latest.hasActive && latest.sucursalId === data.selectedStore) {
  setHasActiveCashCutSession(true);
  setActiveCashCutSucursalId(latest.sucursalId);
  setActiveSessionInfo(latest.sessionInfo);
  toast.error('Ya existe un corte EN PROGRESO para esta sucursal. Reanude la sesión.');
  return;
}
```

**Step 4: Run GREEN tests**

Run: `npm test -- src/__tests__/unit/pages/index.active-session-consistency.test.tsx`
Expected: PASS.

**Step 5: Commit implementation**

```bash
git add src/pages/Index.tsx
git commit -m "fix(index): block iniciarCorte on uncertain/active session state"
```

---

### Task 3: Make Connection Error Actionable in Nocturnal Wizard (GREEN)

**Files:**
- Modify: `src/pages/Index.tsx`
- Modify: `src/__tests__/unit/pages/index.corte-finalizacion-supabase.test.tsx`
- Test: `src/__tests__/unit/pages/index.corte-finalizacion-supabase.test.tsx`

**Step 1: Add network-aware error classification in `handleWizardComplete`**

```ts
import { esErrorDeRed } from '@/lib/esErrorDeRed';

catch (err) {
  if (esErrorDeRed(err)) {
    toast.error('No hay conexión con Supabase. Verifique internet y reintente.');
    return;
  }
  toast.error('No se pudo iniciar el corte. Verifique conexión e intente de nuevo.');
  return;
}
```

**Step 2: Write/update test for specific message on network error**

```tsx
it('shows network-specific toast when iniciarCorte fails by connectivity', async () => {
  // mock iniciarCorte reject TypeError('Failed to fetch')
  // expect toast.error('No hay conexión con Supabase...')
});
```

**Step 3: Run targeted tests**

Run: `npm test -- src/__tests__/unit/pages/index.corte-finalizacion-supabase.test.tsx`
Expected: PASS for connectivity case and existing finalization case.

**Step 4: Run regression batch for Index page flows**

Run: `npm test -- src/__tests__/unit/pages/index.sync-ux.test.tsx src/__tests__/unit/pages/index.resume-session.test.tsx src/__tests__/unit/pages/index.corte-finalizacion-supabase.test.tsx src/__tests__/unit/pages/index.active-session-consistency.test.tsx`
Expected: all PASS.

**Step 5: Commit**

```bash
git add src/pages/Index.tsx src/__tests__/unit/pages/index.corte-finalizacion-supabase.test.tsx src/__tests__/unit/pages/index.active-session-consistency.test.tsx
git commit -m "fix(index): surface Supabase connectivity errors and prevent false new-cut start"
```

---

### Task 4: Verify Supervisor and Nocturnal Use Same Truth (Regression)

**Files:**
- Modify: `src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts` (only if needed)
- Modify: `src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx` (only if needed)
- Test: `src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts`

**Step 1: Add/confirm regression for active + terminal grouping**

```tsx
expect(activosQuery.inMock).toHaveBeenCalledWith('estado', ['INICIADO', 'EN_PROGRESO']);
expect(finalizadosQuery.inMock).toHaveBeenCalledWith('estado', ['FINALIZADO', 'ABORTADO']);
```

**Step 2: Run supervisor query tests**

Run: `npm test -- src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts src/hooks/__tests__/useSupervisorQueries.daily-reconciliation.test.ts`
Expected: PASS.

**Step 3: Run core nocturnal session tests**

Run: `npm test -- src/hooks/__tests__/useCorteSesion.test.ts`
Expected: PASS.

**Step 4: Build**

Run: `npm run build`
Expected: `✓ built`.

**Step 5: Commit regression guardrails**

```bash
git add src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx
git commit -m "test(supervisor): lock state-source parity with nocturnal flow"
```

---

### Task 5: Manual Validation Checklist (Local Browser)

**Files:**
- Modify: `docs/qa/nocturnal-active-session-regression.md`

**Step 1: Write concise QA script**

```md
1. Create nocturnal cut and leave it EN_PROGRESO.
2. Open Supervisor -> verify EN_PROGRESO item exists.
3. Return to OperationSelector -> open Corte Nocturno.
4. Step 5 must force Resume path (no iniciar nuevo corte).
5. Simulate offline (DevTools) and retry -> show Supabase connectivity message.
```

**Step 2: Run dev server**

Run: `npm run dev -- --host 0.0.0.0 --port 5173`
Expected: Vite running on `http://localhost:5173/`.

**Step 3: Execute checklist manually**

Run: Browser manual flow.
Expected: no discrepancy between Supervisor state and wizard behavior.

**Step 4: Capture result notes**

```md
- Pass/Fail per step
- Screenshot paths
- Any residual edge case
```

**Step 5: Commit QA notes**

```bash
git add docs/qa/nocturnal-active-session-regression.md
git commit -m "docs(qa): add nocturnal active-session discrepancy validation checklist"
```

---

## Final Verification Gate
Run:

```bash
npm test -- src/__tests__/unit/pages/index.active-session-consistency.test.tsx src/__tests__/unit/pages/index.sync-ux.test.tsx src/__tests__/unit/pages/index.resume-session.test.tsx src/__tests__/unit/pages/index.corte-finalizacion-supabase.test.tsx
npm test -- src/hooks/__tests__/useCorteSesion.test.ts src/hooks/__tests__/useSupervisorQueries.today-activity.test.ts src/hooks/__tests__/useSupervisorQueries.daily-reconciliation.test.ts
npm run build
```

Expected:
- 0 failing tests in all listed suites.
- Build success.
- Manual QA checklist passed.

