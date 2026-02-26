# Supervisor Hoy (Orden Inteligente + Resumen Fijo) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Ordenar la vista "Hoy" del Dashboard Supervisor de forma determinística y legible (última actividad arriba) y agregar un resumen superior fijo para monitoreo en vivo.

**Architecture:** Se mantiene la arquitectura actual (React + hooks existentes + feed realtime). No se cambia backend ni contratos Supabase; la mejora vive en capa UI con una utilidad pura de orden/resumen reutilizable. El orden se define por "actividad operativa" (terminal: `finalizado_at`; activo: `updated_at` y fallback a `created_at`) y se aplica antes de renderizar las listas.

**Tech Stack:** React 18 + TypeScript + Vitest + Testing Library + Tailwind (clases existentes del módulo supervisor).

---

## Contexto y criterios de aceptación

- Problema reportado: en `/supervisor/cortes`, las tarjetas se perciben "desordenadas" durante operación en vivo.
- Requisito 1: resumen superior visible/fijo mientras se hace scroll.
- Requisito 2: tarjetas en orden secuencial lógico y estable (última actividad arriba).
- Requisito 3: implementación quirúrgica sin tocar estructura de datos ni lógica de negocio backend.

Criterios de aceptación:
1. El bloque resumen permanece visible al desplazarse en la lista.
2. En cada refresh/realtime, la lista se ordena de forma determinística y no “salta” erráticamente.
3. Dentro de "Activos ahora", el corte con `updated_at` más reciente queda arriba.
4. Dentro de "Finalizados hoy", el corte con `finalizado_at` más reciente queda arriba.
5. Tests nuevos y existentes del módulo supervisor quedan verdes.

Skills a usar durante ejecución: `@systematic-debugging`, `@test-driven-development`, `@verification-before-completion`.

---

### Task 1: Definir orden y resumen en utilidades puras (TDD)

**Files:**
- Create: `src/components/supervisor/supervisorTodayOrdering.ts`
- Test: `src/components/supervisor/__tests__/supervisorTodayOrdering.test.ts`

**Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { buildSupervisorTodayViewModel } from '../supervisorTodayOrdering';

describe('buildSupervisorTodayViewModel', () => {
  it('ordena activos por updated_at desc y terminales por finalizado_at desc', () => {
    const vm = buildSupervisorTodayViewModel([
      { id: 'a1', estado: 'EN_PROGRESO', correlativo: 'CORTE-2026-02-25-M-001', created_at: '2026-02-25T12:00:00.000Z', updated_at: '2026-02-25T12:01:00.000Z', finalizado_at: null },
      { id: 'a2', estado: 'INICIADO', correlativo: 'CORTE-2026-02-25-M-002', created_at: '2026-02-25T11:50:00.000Z', updated_at: '2026-02-25T12:05:00.000Z', finalizado_at: null },
      { id: 'f1', estado: 'FINALIZADO', correlativo: 'CORTE-2026-02-25-M-003', created_at: '2026-02-25T10:00:00.000Z', updated_at: '2026-02-25T10:30:00.000Z', finalizado_at: '2026-02-25T12:10:00.000Z' },
      { id: 'f2', estado: 'ABORTADO', correlativo: 'CORTE-2026-02-25-H-001', created_at: '2026-02-25T09:00:00.000Z', updated_at: '2026-02-25T09:20:00.000Z', finalizado_at: '2026-02-25T12:08:00.000Z' },
    ] as any);

    expect(vm.activos.map(c => c.id)).toEqual(['a2', 'a1']);
    expect(vm.finalizados.map(c => c.id)).toEqual(['f1', 'f2']);
    expect(vm.resumen.total).toBe(4);
    expect(vm.resumen.activos).toBe(2);
    expect(vm.resumen.finalizados).toBe(2);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/supervisor/__tests__/supervisorTodayOrdering.test.ts`
Expected: FAIL con “Cannot find module '../supervisorTodayOrdering'” o función no definida.

**Step 3: Write minimal implementation**

```ts
export function buildSupervisorTodayViewModel(cortes: CorteConSucursal[]) {
  const activos = cortes.filter(isActivo).sort(compareByActiveActivityDesc);
  const finalizados = cortes.filter(isTerminal).sort(compareByTerminalActivityDesc);

  return {
    activos,
    finalizados,
    resumen: {
      total: cortes.length,
      activos: activos.length,
      finalizados: finalizados.length,
      ultimaActividad: pickMostRecent([...activos, ...finalizados]),
    },
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/supervisor/__tests__/supervisorTodayOrdering.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/supervisorTodayOrdering.ts src/components/supervisor/__tests__/supervisorTodayOrdering.test.ts
git commit -m "test(supervisor): define deterministic ordering contract for today feed"
```

---

### Task 2: Integrar resumen fijo y orden inteligente en `CortesDelDia` (TDD)

**Files:**
- Modify: `src/components/supervisor/CortesDelDia.tsx`
- Create: `src/components/supervisor/__tests__/CortesDelDia.smart-ordering.test.tsx`

**Step 1: Write the failing test**

```tsx
it('muestra resumen fijo y mantiene arriba el corte activo más reciente', async () => {
  render(<CortesDelDia />);

  expect(await screen.findByText('Resumen en vivo')).toBeInTheDocument();
  expect(screen.getByText(/Total cortes:/i)).toBeInTheDocument();

  const cards = screen.getAllByRole('button', { name: /Ver detalle del corte/i });
  expect(cards[0]).toHaveAttribute('aria-label', expect.stringContaining('CORTE-2026-02-25-M-009'));
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/supervisor/__tests__/CortesDelDia.smart-ordering.test.tsx`
Expected: FAIL (no existe “Resumen en vivo” y/o orden actual distinto).

**Step 3: Write minimal implementation**

Aplicar en `CortesDelDia.tsx`:

```tsx
const vm = buildSupervisorTodayViewModel(cortes);
const activos = vm.activos;
const finalizados = vm.finalizados;

<div className="sticky top-16 z-10 rounded-lg border border-white/10 bg-[#0b0b0b]/95 backdrop-blur px-3 py-2">
  <h3 className="text-xs font-semibold text-white/80">Resumen en vivo</h3>
  <div className="mt-1 flex flex-wrap gap-3 text-xs text-white/70">
    <span>Total cortes: {vm.resumen.total}</span>
    <span>Activos: {vm.resumen.activos}</span>
    <span>Finalizados: {vm.resumen.finalizados}</span>
  </div>
</div>
```

Notas de implementación:
- Mantener secciones `Activos ahora` / `Finalizados hoy` (no cambiar IA de navegación).
- No tocar `useSupervisorQueries` ni API; solo ordenar/renderizar en UI.
- Mantener layout 1x1 (`ul` en columna).

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/supervisor/__tests__/CortesDelDia.smart-ordering.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/CortesDelDia.tsx src/components/supervisor/__tests__/CortesDelDia.smart-ordering.test.tsx
git commit -m "feat(supervisor): add sticky live summary and deterministic today ordering"
```

---

### Task 3: Blindaje de regresión del módulo supervisor (TDD + verificación)

**Files:**
- Modify (si aplica por snapshots/textos):
  - `src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx`
  - `src/components/supervisor/__tests__/CortesDelDia.correlativo-resumen.test.tsx`
  - `src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx`

**Step 1: Write/adjust failing expectations for la nueva jerarquía visual**

```tsx
expect(screen.getByText('Resumen en vivo')).toBeInTheDocument();
expect(screen.getByText('Activos ahora')).toBeInTheDocument();
expect(screen.getByText('Finalizados hoy')).toBeInTheDocument();
```

**Step 2: Run targeted supervisor tests**

Run:
`npm run test -- src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx src/components/supervisor/__tests__/CortesDelDia.correlativo-resumen.test.tsx src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx src/components/supervisor/__tests__/CortesDelDia.smart-ordering.test.tsx src/components/supervisor/__tests__/correlativoMetrics.test.ts`

Expected: PASS en todos.

**Step 3: Run broader safety net**

Run:
- `npm run test:unit`
- `npm run build`

Expected: PASS completo, sin errores de TypeScript/build.

**Step 4: Commit verification/test updates**

```bash
git add src/components/supervisor/__tests__/CortesDelDia.activity-layout.test.tsx src/components/supervisor/__tests__/CortesDelDia.correlativo-resumen.test.tsx src/components/supervisor/__tests__/CortesDelDia.reconciliation-visibility.test.tsx
git commit -m "test(supervisor): lock today-view ordering and sticky summary behavior"
```

**Step 5: Final integration commit (si hubo ajustes menores restantes)**

```bash
git add -A
git commit -m "chore(supervisor): finalize today dashboard visual-order polish"
```

---

### Task 4: Release hygiene (opcional para cierre de versión)

**Files:**
- Modify (solo si se decide publicar patch):
  - `package.json`
  - `src/pages/SupervisorDashboard.tsx`
  - `src/components/operation-selector/OperationSelector.tsx`

**Step 1: Definir si esta mejora amerita `4.0.3`**

Si se aprueba release patch, actualizar badge y versión.

**Step 2: Test rápido post-bump**

Run:
- `npm run test -- src/components/supervisor/__tests__/CortesDelDia.smart-ordering.test.tsx`
- `npm run build`

Expected: PASS.

**Step 3: Commit de release metadata**

```bash
git add package.json src/pages/SupervisorDashboard.tsx src/components/operation-selector/OperationSelector.tsx
git commit -m "chore(release): bump version for supervisor today ordering improvements"
```

**Step 4: Merge/push**

```bash
git checkout main
git pull --ff-only
git merge --ff-only <feature-branch>
git push origin main
```

**Step 5: Smoke manual**

- Abrir `/supervisor/cortes`.
- Confirmar resumen fijo al hacer scroll.
- Confirmar que el corte actualizado más reciente se mantiene arriba.
- Confirmar que no hay parpadeos o inversión de orden en realtime.

---

## Riesgos y mitigaciones

- Riesgo: usar `updated_at` puede cambiar orden con alta frecuencia.
  - Mitigación: tie-break determinístico secundario por `correlativo` secuencial y luego `id`.
- Riesgo: sticky summary tape contenido debajo del header sticky principal.
  - Mitigación: usar `top-16` y validar manualmente en móvil/desktop.
- Riesgo: regresión de textos en tests existentes.
  - Mitigación: ajustes mínimos de expectations y suite focalizada supervisor.

## Definition of Done

- Utilidad pura de orden/resumen con tests unitarios verdes.
- `CortesDelDia` consume esa utilidad y muestra resumen fijo superior.
- Orden visual de tarjetas estable y coherente con actividad reciente.
- Suite supervisor + unit + build verdes.
- Commits pequeños y descriptivos.
