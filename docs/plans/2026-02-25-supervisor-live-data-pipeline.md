# Supervisor Live Data Pipeline Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Hacer que el Dashboard Supervisor refleje en vivo los cambios de cortes (lista, detalle, estado y montos) con latencia baja, fallback confiable y visibilidad de estado de conexión.

**Architecture:** Migrar a un pipeline `Supabase Realtime -> invalidación TanStack Query -> refetch selectivo` en lugar de recargas manuales/polling fijo. El canal realtime expondrá estado (`connecting/subscribed/error`) y coalescerá eventos para evitar tormentas de renders. Cuando realtime falle, se activará polling dinámico de respaldo hasta reconectar.

**Tech Stack:** React 18 + TypeScript, TanStack Query v5, Supabase Realtime (`postgres_changes`), Vitest + Testing Library, migraciones SQL en Supabase.

---

## Investigación resumida (estado actual)
- Ya existe `useSupervisorRealtime`, pero solo dispara `onChange` y no expone estado de canal ni fallback.
- `CortesDelDia` mezcla realtime + `setInterval(60s)`; `CorteDetalle` usa realtime sin estado visible ni polling de respaldo.
- `useSupervisorQueries` usa estado local propio (`cargando/error`) y fetch manual, sin cache compartido de TanStack Query.
- Hay `QueryClientProvider` global en `src/App.tsx`, pero Supervisor aún no aprovecha invalidación por query key.

## Decisión técnica
- **Elegida:** pipeline híbrido moderno (Realtime-first con fallback polling + TanStack Query).
- **No elegida por ahora:** streaming custom por WebSocket propio o backend intermedio (sobre-ingeniería para el alcance actual).

### Task 1: Endurecer hook realtime (estado de canal + coalescing)

**Files:**
- Modify: `src/hooks/useSupervisorRealtime.ts`
- Test: `src/hooks/__tests__/useSupervisorRealtime.test.ts`

**Step 1: Write the failing test**

```ts
it('expone estado subscribed y error según callback de subscribe', () => {
  // subscribe callback recibe SUBSCRIBED y CHANNEL_ERROR
  // assert del estado retornado por el hook
});

it('coalesce de eventos evita múltiples onChange en ráfaga', () => {
  // dispara 5 eventos seguidos
  // espera 1 invalidación/onChange en ventana debounce
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useSupervisorRealtime.test.ts`
Expected: FAIL por API actual sin estado/coalescing.

**Step 3: Write minimal implementation**

```ts
export type SupervisorRealtimeStatus =
  | 'idle'
  | 'connecting'
  | 'subscribed'
  | 'error'
  | 'disabled';

export interface SupervisorRealtimeState {
  status: SupervisorRealtimeStatus;
  lastEventAt: number | null;
  error: string | null;
}

export function useSupervisorRealtime(...): SupervisorRealtimeState {
  // subscribe((status, err) => setState(...))
  // debounce/coalesce onChange (default 250ms)
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useSupervisorRealtime.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/useSupervisorRealtime.ts src/hooks/__tests__/useSupervisorRealtime.test.ts
git commit -m "feat(supervisor): expose realtime channel status and event coalescing"
```

### Task 2: Blindar publicación realtime en BD (evitar silencios)

**Files:**
- Create: `supabase/migrations/010_supervisor_realtime_publication.sql`
- Test: `src/__tests__/unit/supabase/migrations-contract.test.ts`

**Step 1: Write the failing test**

```ts
it('incluye migración que agrega cortes e intentos a supabase_realtime', () => {
  expect(source).toContain('alter publication supabase_realtime add table public.cortes');
  expect(source).toContain('alter publication supabase_realtime add table public.corte_intentos');
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/supabase/migrations-contract.test.ts`
Expected: FAIL porque `010_...` no existe.

**Step 3: Write minimal implementation**

```sql
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'cortes'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.cortes';
    END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'corte_intentos'
    ) THEN
      EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.corte_intentos';
    END IF;
  END IF;
END $$;
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/unit/supabase/migrations-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add supabase/migrations/010_supervisor_realtime_publication.sql src/__tests__/unit/supabase/migrations-contract.test.ts
git commit -m "feat(supabase): ensure supervisor tables are in realtime publication"
```

### Task 3: Crear query keys y capa de invalidación viva

**Files:**
- Create: `src/hooks/supervisor/queryKeys.ts`
- Create: `src/hooks/supervisor/useSupervisorLiveInvalidation.ts`
- Test: `src/hooks/__tests__/useSupervisorLiveInvalidation.test.ts`

**Step 1: Write the failing test**

```ts
it('invalida today + detail al evento de corte específico', () => {
  // mock QueryClient + evento realtime con corteId
  // expect invalidateQueries(queryKeys.supervisor.today())
  // expect invalidateQueries(queryKeys.supervisor.detail(corteId))
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useSupervisorLiveInvalidation.test.ts`
Expected: FAIL (archivos inexistentes).

**Step 3: Write minimal implementation**

```ts
export const queryKeys = {
  supervisor: {
    today: () => ['supervisor', 'today'] as const,
    detail: (id: string) => ['supervisor', 'detail', id] as const,
    history: (f: string) => ['supervisor', 'history', f] as const,
  },
};

// hook: conecta useSupervisorRealtime + queryClient.invalidateQueries
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useSupervisorLiveInvalidation.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/supervisor/queryKeys.ts src/hooks/supervisor/useSupervisorLiveInvalidation.ts src/hooks/__tests__/useSupervisorLiveInvalidation.test.ts
git commit -m "feat(supervisor): add live query invalidation pipeline"
```

### Task 4: Migrar CortesDelDia a TanStack Query (realtime-first + fallback)

**Files:**
- Create: `src/hooks/supervisor/useSupervisorTodayFeed.ts`
- Modify: `src/components/supervisor/CortesDelDia.tsx`
- Test: `src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`
- Create Test: `src/components/supervisor/__tests__/CortesDelDia.live-refresh.test.tsx`

**Step 1: Write the failing test**

```ts
it('muestra estado En vivo cuando realtime está subscribed', () => {});
it('activa refetchInterval corto cuando realtime está error', () => {});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/supervisor/__tests__/CortesDelDia.live-refresh.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
const query = useQuery({
  queryKey: queryKeys.supervisor.today(),
  queryFn: obtenerCortesDelDia,
  staleTime: 5_000,
  refetchInterval: realtime.status === 'error' ? 10_000 : false,
});

useSupervisorLiveInvalidation({ scope: 'today' });
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx src/components/supervisor/__tests__/CortesDelDia.live-refresh.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/supervisor/useSupervisorTodayFeed.ts src/components/supervisor/CortesDelDia.tsx src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx src/components/supervisor/__tests__/CortesDelDia.live-refresh.test.tsx
git commit -m "feat(supervisor): migrate daily list to live query pipeline"
```

### Task 5: Migrar CorteDetalle a feed vivo con resiliencia

**Files:**
- Create: `src/hooks/supervisor/useSupervisorCorteDetalleFeed.ts`
- Modify: `src/components/supervisor/CorteDetalle.tsx`
- Test: `src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx`
- Create Test: `src/components/supervisor/__tests__/CorteDetalle.live-sync.test.tsx`

**Step 1: Write the failing test**

```ts
it('refresca resumen financiero al invalidar query detail', () => {});
it('muestra badge reconectando cuando realtime no está subscribed', () => {});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/supervisor/__tests__/CorteDetalle.live-sync.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
const query = useQuery({
  queryKey: queryKeys.supervisor.detail(id),
  queryFn: () => obtenerCorteDetalle(id),
  enabled: Boolean(id),
  refetchInterval: realtime.status === 'error' ? 8_000 : false,
});
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-sync.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/supervisor/useSupervisorCorteDetalleFeed.ts src/components/supervisor/CorteDetalle.tsx src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-sync.test.tsx
git commit -m "feat(supervisor): add realtime detail feed with fallback polling"
```

### Task 6: UX de estado de conexión en supervisor (profesional y útil)

**Files:**
- Create: `src/components/supervisor/SupervisorLiveBadge.tsx`
- Create Test: `src/components/supervisor/__tests__/SupervisorLiveBadge.test.tsx`
- Modify: `src/components/supervisor/CortesDelDia.tsx`
- Modify: `src/components/supervisor/CorteDetalle.tsx`

**Step 1: Write the failing test**

```ts
it('renderiza Connected/Reconnecting/Error con copy claro', () => {});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/supervisor/__tests__/SupervisorLiveBadge.test.tsx`
Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
<SupervisorLiveBadge
  status={realtime.status}
  lastEventAt={realtime.lastEventAt}
/>
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/supervisor/__tests__/SupervisorLiveBadge.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/SupervisorLiveBadge.tsx src/components/supervisor/__tests__/SupervisorLiveBadge.test.tsx src/components/supervisor/CortesDelDia.tsx src/components/supervisor/CorteDetalle.tsx
git commit -m "feat(supervisor-ui): add live connection badge and status feedback"
```

### Task 7: Validación completa, documentación y checklist de release

**Files:**
- Create: `docs/qa/supervisor-live-refresh-runbook.md`
- Modify: `src/hooks/__tests__/useSupervisorQueries.runtime.test.ts`

**Step 1: Write the failing test**

```ts
it('no pierde estado de error cuando fallback polling + realtime coexisten', () => {});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useSupervisorQueries.runtime.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**

```md
# Runbook QA
1) Iniciar corte en caja
2) Abrir /supervisor/cortes y /supervisor/corte/:id en otra pestaña
3) Cambiar conteo y verificar actualización < 2s
4) Simular caída de red y verificar fallback polling
5) Restaurar red y verificar reconexión automática
```

**Step 4: Run full verification**

Run:
- `npm run test:unit`
- `npm run build`

Expected: PASS en ambos.

**Step 5: Commit**

```bash
git add src/hooks/__tests__/useSupervisorQueries.runtime.test.ts docs/qa/supervisor-live-refresh-runbook.md
git commit -m "test(supervisor): harden live refresh runtime and add QA runbook"
```

## Guardrails técnicos (durante ejecución)
- DRY/YAGNI: no crear backend intermedio mientras Supabase Realtime cubra el caso.
- TDD estricto por tarea (RED -> GREEN -> REFACTOR mínimo).
- Commits pequeños por tarea, no “mega commit”.
- Si realtime cae, nunca bloquear lectura: mantener último dato + polling.
- No romper flujo actual de caja/corte (`useCorteSesion`) ni migraciones ya aplicadas `006-009`.

## Comandos de verificación final (evidencia)
- `npx vitest run src/hooks/__tests__/useSupervisorRealtime.test.ts src/hooks/__tests__/useSupervisorQueries.runtime.test.ts src/components/supervisor/__tests__/CortesDelDia.live-refresh.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-sync.test.tsx`
- `npm run test:unit`
- `npm run build`

## Skills a aplicar durante ejecución
- @test-driven-development
- @systematic-debugging
- @verification-before-completion
- @vercel-react-best-practices

