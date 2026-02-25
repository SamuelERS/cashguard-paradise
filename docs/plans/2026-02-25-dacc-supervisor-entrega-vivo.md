# DACC Supervisor Entrega En Vivo Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Registrar y mostrar en vivo, de forma auditable, el dinero realmente entregado en Fase 2 para que el panel izquierdo (Supervisor) refleje progreso real mientras el operador confirma denominaciones en el panel derecho.

**Architecture:** Se mantiene `cortes` como fuente de verdad y se extiende `datos_entrega` (JSONB) con `live_delivery_progress`, `live_delivery_events` y `live_delivery_total`. `Phase2DeliverySection` emite eventos por denominación confirmada; `Phase2Manager` agrega ese progreso al `DeliveryCalculation`; el autosave ya existente persiste cada cambio y Realtime invalida queries del Supervisor para render inmediato.

**Tech Stack:** React 18 + TypeScript, TanStack Query v5, Supabase Realtime, Vitest + Testing Library, Playwright E2E.

---

## Skill Order

1. `@systematic-debugging` (confirmar causa raíz antes de proponer fix)
2. `@qa-test-planner` (definir cobertura funcional/manual)
3. `@web-design-guidelines` + `@vercel-react-best-practices` (auditar UX del nuevo bloque)
4. `@webapp-testing` (validación navegador en flujo real)
5. `@verification-before-completion` (no declarar éxito sin evidencia de ejecución)

---

### Task 1: Contrato TDD de eventos live en Fase 2

**Files:**
- Create: `src/components/phases/__tests__/Phase2DeliverySection.live-progress.test.tsx`
- Modify: `src/components/phases/Phase2DeliverySection.tsx`
- Test: `src/components/phases/__tests__/Phase2DeliverySection.live-progress.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Phase2DeliverySection } from '../Phase2DeliverySection';

it('emite evento live al confirmar una denominacion correcta', () => {
  const onStepLiveUpdate = vi.fn();
  const onStepComplete = vi.fn();

  render(
    <Phase2DeliverySection
      deliveryCalculation={{
        amountToDeliver: 10,
        denominationsToDeliver: { dime: 100 } as any,
        denominationsToKeep: {} as any,
        deliverySteps: [{ key: 'dime', quantity: 2, label: 'Diez centavos', value: 0.1 }],
        verificationSteps: [{ key: 'dime', quantity: 2, label: 'Diez centavos', value: 0.1 }],
      }}
      onStepComplete={onStepComplete}
      onSectionComplete={vi.fn()}
      completedSteps={{}}
      onCancel={vi.fn()}
      onStepLiveUpdate={onStepLiveUpdate}
    />,
  );

  fireEvent.change(screen.getByLabelText(/diez centavos/i), { target: { value: '2' } });
  fireEvent.click(screen.getByRole('button', { name: /confirmar cantidad separada/i }));

  expect(onStepLiveUpdate).toHaveBeenCalledWith({
    stepKey: 'dime',
    quantity: 2,
    subtotal: 0.2,
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/phases/__tests__/Phase2DeliverySection.live-progress.test.tsx`
Expected: FAIL porque `onStepLiveUpdate` aún no existe en props.

**Step 3: Write minimal implementation**

```tsx
interface Phase2DeliverySectionProps {
  // ...
  onStepLiveUpdate?: (event: { stepKey: string; quantity: number; subtotal: number }) => void;
}

const handleFieldConfirm = (value: string) => {
  // ...
  if (inputNum === currentStep.quantity) {
    onStepLiveUpdate?.({
      stepKey: currentStep.key,
      quantity: inputNum,
      subtotal: currentStep.value * inputNum,
    });
    onStepComplete(currentStep.key);
  }
};
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/phases/__tests__/Phase2DeliverySection.live-progress.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/phases/__tests__/Phase2DeliverySection.live-progress.test.tsx src/components/phases/Phase2DeliverySection.tsx
git commit -m "test+feat(phase2): emit live delivery event per confirmed denomination"
```

---

### Task 2: Subir progreso live a `Phase2Manager` y `deliveryCalculation`

**Files:**
- Create: `src/components/phases/__tests__/Phase2Manager.live-progress.test.tsx`
- Modify: `src/components/phases/Phase2Manager.tsx`
- Modify: `src/types/phases.ts`
- Test: `src/components/phases/__tests__/Phase2Manager.live-progress.test.tsx`

**Step 1: Write the failing test**

```tsx
it('actualiza deliveryCalculation con progreso live en cada confirmacion', () => {
  const onDeliveryCalculationUpdate = vi.fn();
  render(
    <Phase2Manager
      deliveryCalculation={mockDeliveryCalculation}
      onPhase2Complete={vi.fn()}
      onBack={vi.fn()}
      onDeliveryCalculationUpdate={onDeliveryCalculationUpdate}
    />,
  );

  act(() => {
    mockPhase2DeliverySectionProps.onStepLiveUpdate?.({
      stepKey: 'dime',
      quantity: 2,
      subtotal: 0.2,
    });
  });

  expect(onDeliveryCalculationUpdate).toHaveBeenCalledWith(
    expect.objectContaining({
      liveDeliveryProgress: { dime: 2 },
      liveDeliveryTotal: 0.2,
    }),
  );
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/phases/__tests__/Phase2Manager.live-progress.test.tsx`
Expected: FAIL porque `liveDeliveryProgress/liveDeliveryTotal` no existen.

**Step 3: Write minimal implementation**

```ts
export interface DeliveryCalculation {
  // ...
  liveDeliveryProgress?: Partial<CashCount>;
  liveDeliveryEvents?: Array<{
    stepKey: keyof CashCount;
    quantity: number;
    subtotal: number;
    capturedAt: string;
  }>;
  liveDeliveryTotal?: number;
}
```

```tsx
const handleDeliveryLiveUpdate = useCallback((event: { stepKey: string; quantity: number; subtotal: number }) => {
  if (!onDeliveryCalculationUpdate) return;

  const currentProgress = deliveryCalculation.liveDeliveryProgress ?? {};
  const currentEvents = deliveryCalculation.liveDeliveryEvents ?? [];
  const nextProgress = { ...currentProgress, [event.stepKey]: event.quantity };
  const nextEvents = [...currentEvents, { ...event, capturedAt: new Date().toISOString() }];
  const nextTotal = nextEvents.reduce((acc, e) => acc + e.subtotal, 0);

  onDeliveryCalculationUpdate({
    liveDeliveryProgress: nextProgress,
    liveDeliveryEvents: nextEvents,
    liveDeliveryTotal: nextTotal,
  });
}, [deliveryCalculation.liveDeliveryEvents, deliveryCalculation.liveDeliveryProgress, onDeliveryCalculationUpdate]);
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/phases/__tests__/Phase2Manager.live-progress.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/types/phases.ts src/components/phases/Phase2Manager.tsx src/components/phases/__tests__/Phase2Manager.live-progress.test.tsx
git commit -m "feat(phase2): propagate live delivery progress into delivery calculation"
```

---

### Task 3: Persistencia live en autosave (`datos_entrega`)

**Files:**
- Create: `src/hooks/__tests__/useCashCounterOrchestrator.live-delivery.test.ts`
- Modify: `src/hooks/useCashCounterOrchestrator.ts`
- Test: `src/hooks/__tests__/useCashCounterOrchestrator.live-delivery.test.ts`

**Step 1: Write the failing test**

```ts
it('incluye live_delivery_progress/events/total en datos_entrega durante autosave', async () => {
  const onGuardarProgreso = vi.fn();
  renderHook(() => useCashCounterOrchestrator({ ...options, onGuardarProgreso }));

  act(() => {
    mockUpdateDeliveryCalculation({
      liveDeliveryProgress: { dime: 2 },
      liveDeliveryEvents: [{ stepKey: 'dime', quantity: 2, subtotal: 0.2, capturedAt: '2026-02-25T01:00:00Z' }],
      liveDeliveryTotal: 0.2,
    });
  });

  await waitFor(() => {
    expect(onGuardarProgreso).toHaveBeenCalledWith(
      expect.objectContaining({
        datos_entrega: expect.objectContaining({
          live_delivery_progress: { dime: 2 },
          live_delivery_total: 0.2,
        }),
      }),
    );
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useCashCounterOrchestrator.live-delivery.test.ts`
Expected: FAIL porque el payload actual no incluye llaves `live_delivery_*`.

**Step 3: Write minimal implementation**

```ts
const datosEntrega = deliveryCalculation
  ? {
      amount_to_deliver: deliveryCalculation.amountToDeliver,
      amount_remaining: deliveryCalculation.amountRemaining ?? 50,
      denominations_to_deliver: deliveryCalculation.denominationsToDeliver,
      denominations_to_keep: deliveryCalculation.denominationsToKeep,
      live_delivery_progress: deliveryCalculation.liveDeliveryProgress ?? {},
      live_delivery_events: deliveryCalculation.liveDeliveryEvents ?? [],
      live_delivery_total: deliveryCalculation.liveDeliveryTotal ?? 0,
    }
  : null;
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useCashCounterOrchestrator.live-delivery.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/useCashCounterOrchestrator.ts src/hooks/__tests__/useCashCounterOrchestrator.live-delivery.test.ts
git commit -m "feat(autosave): persist live phase2 delivery payload in datos_entrega"
```

---

### Task 4: Blindaje de `guardarProgreso` para payload live

**Files:**
- Modify: `src/hooks/__tests__/useCorteSesion.test.ts`
- Modify: `src/hooks/useCorteSesion.ts`
- Test: `src/hooks/__tests__/useCorteSesion.test.ts`

**Step 1: Write the failing test**

```ts
it('preserva live_delivery_* al combinar datos_entrega en guardarProgreso', async () => {
  await result.current.guardarProgreso({
    fase_actual: 2,
    conteo_parcial: { dime: 1 } as any,
    pagos_electronicos: null,
    gastos_dia: null,
    datos_entrega: {
      amount_to_deliver: 200,
      amount_remaining: 50,
      live_delivery_progress: { dime: 2 },
      live_delivery_events: [{ stepKey: 'dime', quantity: 2, subtotal: 0.2, capturedAt: '2026-02-25T01:00:00Z' }],
      live_delivery_total: 0.2,
    },
  } as any);

  expect(updateCall.datos_entrega.live_delivery_progress).toEqual({ dime: 2 });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useCorteSesion.test.ts -t "live_delivery"`
Expected: FAIL si merge o fallback elimina el payload.

**Step 3: Write minimal implementation**

```ts
const datosEntrega = Object.prototype.hasOwnProperty.call(datos, 'datos_entrega')
  ? (datos.datos_entrega ?? null)
  : corteActual.datos_entrega;
```

```ts
const datosEntregaFallback = Object.prototype.hasOwnProperty.call(datos, 'datos_entrega')
  ? (datos.datos_entrega ?? null)
  : corteActual.datos_entrega;
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useCorteSesion.test.ts -t "live_delivery|datos_entrega"`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/useCorteSesion.ts src/hooks/__tests__/useCorteSesion.test.ts
git commit -m "fix(corte): keep explicit live delivery payload in progress merge/fallback"
```

---

### Task 5: UX/UI supervisor (tabla live izquierda)

**Files:**
- Create: `src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx`
- Modify: `src/components/supervisor/CorteDetalle.tsx`
- Test: `src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx`

**Step 1: Write the failing test**

```tsx
it('renderiza tabla Entrega en vivo con esperado/entregado/faltante/hora', async () => {
  render(<CorteDetalle />);

  await screen.findByText(/entrega en vivo/i);
  expect(screen.getByRole('columnheader', { name: /denominación/i })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: /esperado/i })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: /entregado/i })).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: /faltante/i })).toBeInTheDocument();
  expect(screen.getByText(/diez centavos/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx`
Expected: FAIL porque la tabla aún no existe.

**Step 3: Write minimal implementation**

```tsx
const liveProgressRaw = (corte.datos_entrega?.live_delivery_progress ?? {}) as Record<string, number>;
const expectedRaw = (corte.datos_entrega?.denominations_to_deliver ?? {}) as Record<string, number>;
const liveEventsRaw = (corte.datos_entrega?.live_delivery_events ?? []) as Array<{
  stepKey: string;
  quantity: number;
  subtotal: number;
  capturedAt: string;
}>;

const liveRows = Object.keys(expectedRaw)
  .filter((key) => (expectedRaw[key] ?? 0) > 0)
  .map((key) => {
    const expected = expectedRaw[key] ?? 0;
    const delivered = liveProgressRaw[key] ?? 0;
    const faltante = Math.max(expected - delivered, 0);
    const lastEvent = [...liveEventsRaw].reverse().find((event) => event.stepKey === key);
    return { key, expected, delivered, faltante, lastEventAt: lastEvent?.capturedAt ?? null };
  });
```

```tsx
{liveRows.length > 0 && (
  <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04]">
    <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Entrega en vivo</p>
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-white/50">
            <th className="text-left py-1">Denominación</th>
            <th className="text-right py-1">Esperado</th>
            <th className="text-right py-1">Entregado</th>
            <th className="text-right py-1">Faltante</th>
            <th className="text-right py-1">Hora</th>
          </tr>
        </thead>
        <tbody>
          {liveRows.map((row) => (
            <tr key={row.key} className="border-t border-white/10">
              <td className="py-1.5 text-white/80">{row.key}</td>
              <td className="py-1.5 text-right tabular-nums text-white/70">{row.expected}</td>
              <td className="py-1.5 text-right tabular-nums text-white/90">{row.delivered}</td>
              <td className="py-1.5 text-right tabular-nums text-amber-300">{row.faltante}</td>
              <td className="py-1.5 text-right text-white/50">{formatearFechaHora(row.lastEventAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
)}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/CorteDetalle.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx
git commit -m "feat(supervisor): add live delivery table with expected vs delivered tracking"
```

---

### Task 6: Contrato de sincronización realtime para datos_entrega live

**Files:**
- Create: `src/components/supervisor/__tests__/CorteDetalle.live-delivery-sync.test.tsx`
- Modify: `src/components/supervisor/CorteDetalle.tsx`
- Modify: `src/hooks/__tests__/useSupervisorLiveInvalidation.test.ts`
- Test: `src/components/supervisor/__tests__/CorteDetalle.live-delivery-sync.test.tsx`

**Step 1: Write the failing test**

```tsx
it('refresca tabla live cuando llega update de cortes por realtime', async () => {
  // mock feed inicial sin entrega
  // simular invalidación + nuevo corte con live_delivery_progress
  // esperar que aparezca fila de denominación
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/supervisor/__tests__/CorteDetalle.live-delivery-sync.test.tsx src/hooks/__tests__/useSupervisorLiveInvalidation.test.ts`
Expected: FAIL en contrato de refresco.

**Step 3: Write minimal implementation**

```ts
// useSupervisorLiveInvalidation ya invalida detail(corteId) en evento de cortes.
// Asegurar que CorteDetalle derive la tabla directamente de corte.datos_entrega
// sin memo stale ni estado local duplicado.
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/supervisor/__tests__/CorteDetalle.live-delivery-sync.test.tsx src/hooks/__tests__/useSupervisorLiveInvalidation.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/supervisor/__tests__/CorteDetalle.live-delivery-sync.test.tsx src/hooks/__tests__/useSupervisorLiveInvalidation.test.ts src/components/supervisor/CorteDetalle.tsx
git commit -m "test(supervisor): lock realtime refresh contract for live delivery payload"
```

---

### Task 7: QA funcional + e2e y evidencia de no regresión

**Files:**
- Create: `e2e/tests/supervisor-live-entrega.spec.ts`
- Create: `docs/qa/supervisor-live-entrega-checklist.md`
- Test: `e2e/tests/supervisor-live-entrega.spec.ts`

**Step 1: Write the failing e2e test**

```ts
import { test, expect } from '@playwright/test';

test('entrega fase2 se refleja en vivo en supervisor detalle', async ({ browser }) => {
  const operador = await browser.newContext();
  const supervisor = await browser.newContext();

  const p1 = await operador.newPage();
  const p2 = await supervisor.newPage();

  await p1.goto('/');
  await p2.goto('/supervisor/corte/corte-001');

  // ejecutar una confirmación de denominación en fase2
  // validar fila live en supervisor sin refresh manual
  await expect(p2.getByText(/entrega en vivo/i)).toBeVisible();
  await expect(p2.getByText(/diez centavos/i)).toBeVisible({ timeout: 15000 });
});
```

**Step 2: Run test to verify it fails**

Run: `npx playwright test -c e2e/playwright.config.ts e2e/tests/supervisor-live-entrega.spec.ts --project=chromium`
Expected: FAIL con estado actual (sin sincronización granular).

**Step 3: Write minimal implementation**

```md
# docs/qa/supervisor-live-entrega-checklist.md
- [ ] Operador confirma una denominación en Fase 2.
- [ ] Supervisor visualiza fila live nueva <= 3s.
- [ ] Campos visibles: denominación, esperado, entregado, faltante, hora.
- [ ] Realtime cae -> badge Reconectando + fallback polling conserva tabla.
- [ ] Sin refresh manual del navegador.
```

**Step 4: Run full verification to verify it passes**

Run:
- `npx vitest run src/components/phases/__tests__/Phase2DeliverySection.live-progress.test.tsx src/components/phases/__tests__/Phase2Manager.live-progress.test.tsx src/hooks/__tests__/useCashCounterOrchestrator.live-delivery.test.ts src/hooks/__tests__/useCorteSesion.test.ts src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-sync.test.tsx`
- `npx playwright test -c e2e/playwright.config.ts e2e/tests/supervisor-live-entrega.spec.ts --project=chromium`

Expected: PASS.

**Step 5: Commit**

```bash
git add e2e/tests/supervisor-live-entrega.spec.ts docs/qa/supervisor-live-entrega-checklist.md
git commit -m "test(e2e+qa): verify live phase2 delivery reflection in supervisor"
```

---

## Diseño UX recomendado (izquierda vs derecha)

- Derecha (operador): mantener flujo guiado por denominación como está.
- Izquierda (supervisor): agregar card `Entrega en vivo` arriba de `Desglose efectivo`.
- KPIs compactos en card live:
  - `Entregado acumulado`
  - `Faltante por entregar`
  - `Progreso (%)`
- Tabla live (5 columnas): `Denominación`, `Esperado`, `Entregado`, `Faltante`, `Último evento`.
- Código de color:
  - `Faltante > 0`: ámbar
  - `Faltante = 0`: verde
  - `sin evento`: gris tenue
- Accesibilidad:
  - contenedor de cambios con `aria-live="polite"`
  - foco visible en celdas accionables
  - `tabular-nums` en cantidades.

---

## Riesgos y controles

- Riesgo: exceso de escrituras por autosave en cada paso.
  - Control: debounce existente (600ms) + coalescing realtime (250ms).
- Riesgo: estado stale por derivación duplicada.
  - Control: render derivado directo de `corte.datos_entrega`.
- Riesgo: regresión en flujo fase2 actual.
  - Control: mantener tests existentes + nuevos RED/GREEN por tarea.

---

## Checklist de cierre

- [ ] Todos los tests nuevos empezaron en RED y terminaron en GREEN.
- [ ] `datos_entrega.live_delivery_*` persiste correctamente offline/online.
- [ ] `CorteDetalle` muestra tabla live sin refresh manual.
- [ ] Realtime `subscribed/error` conserva UX estable.
- [ ] Validación manual en desktop + mobile.
- [ ] Commits atómicos por tarea.
