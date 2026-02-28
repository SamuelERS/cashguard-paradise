# Fix Delivery Double-Deduction Bug — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Prevent delivery charges from being deducted on multiple consecutive cash cuts by marking deliveries as "already deducted" after the first cut.

**Architecture:** Option C Hybrid — Add `deductedAt` field to `DeliveryEntry`. Filter `calculateSicarAdjusted()` to skip deliveries where `deductedAt` is already set. Mark deliveries as deducted after cut calculation. Replace `<DeliveryManager />` CRUD in cut results with a read-only summary.

**Tech Stack:** React 18, TypeScript strict, Vitest, localStorage persistence

---

## Task 1: Add `deductedAt` Field to DeliveryEntry Type

**Files:**
- Modify: `src/types/deliveries.ts:199` (after `status` field)

**Step 1: Add the field**

In `src/types/deliveries.ts`, add `deductedAt` after the `status` field (line 199). Insert after line 210 (after the `createdAt` JSDoc block ends):

```typescript
  /**
   * Timestamp ISO 8601 de cuando se dedujo del corte de caja
   *
   * @remarks
   * - Se establece automáticamente al finalizar un corte
   * - Previene doble deducción en cortes consecutivos
   * - null/undefined = nunca deducido (se deducirá en próximo corte)
   * - Delivery sigue como 'pending_cod' para gestión manual (paid/cancelled)
   */
  deductedAt?: string;
```

**Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: 0 errors (field is optional, no breaking changes)

**Step 3: Commit**

```bash
git add src/types/deliveries.ts
git commit -m "feat(types): add deductedAt field to DeliveryEntry for single-deduction tracking"
```

---

## Task 2: RED — Write Failing Tests for Deduction Filter

**Files:**
- Modify: `src/utils/__tests__/sicarAdjustment.test.ts` (add new suite at end)

**Step 1: Write the failing tests**

Add this new suite at the end of `sicarAdjustment.test.ts`, before the closing of the file:

```typescript
// ═══════════════════════════════════════════════════════════
// SUITE 7: DEDUCCIÓN ÚNICA — PREVENCIÓN DOBLE DEDUCCIÓN
// ═══════════════════════════════════════════════════════════

describe('calculateSicarAdjusted - Prevención Doble Deducción', () => {
  it('debe ignorar deliveries que ya tienen deductedAt establecido', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 76.00, deductedAt: '2026-02-27T20:00:00.000Z' }), // Ya deducido ayer
      createTestDelivery({ amount: 50.00 }), // Nuevo, sin deducir
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    expect(result.totalPendingDeliveries).toBe(50.00);
    expect(result.adjustedExpected).toBe(2450.00);
    expect(result.pendingDeliveriesCount).toBe(1);
  });

  it('debe deducir normalmente si ningún delivery tiene deductedAt', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 76.00 }), // Sin deductedAt
      createTestDelivery({ amount: 50.00 }), // Sin deductedAt
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    expect(result.totalPendingDeliveries).toBe(126.00);
    expect(result.adjustedExpected).toBe(2374.00);
    expect(result.pendingDeliveriesCount).toBe(2);
  });

  it('debe retornar sin cambios si TODOS los deliveries ya fueron deducidos', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 76.00, deductedAt: '2026-02-27T20:00:00.000Z' }),
      createTestDelivery({ amount: 50.00, deductedAt: '2026-02-27T20:00:00.000Z' }),
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    expect(result.totalPendingDeliveries).toBe(0);
    expect(result.adjustedExpected).toBe(2500);
    expect(result.pendingDeliveriesCount).toBe(0);
    expect(result.deliveriesBreakdown).toEqual([]);
  });

  it('debe excluir deliveries deducidos del breakdown', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ customerName: 'Cliente Ayer', amount: 76.00, deductedAt: '2026-02-27T20:00:00.000Z' }),
      createTestDelivery({ customerName: 'Cliente Hoy', amount: 50.00 }),
    ];

    const result = calculateSicarAdjusted(2500, deliveries);

    expect(result.deliveriesBreakdown).toHaveLength(1);
    expect(result.deliveriesBreakdown[0].customerName).toBe('Cliente Hoy');
  });
});
```

**Step 2: Run tests to verify they FAIL**

Run: `npx vitest run src/utils/__tests__/sicarAdjustment.test.ts`
Expected: FAIL — tests expect filtering by `deductedAt` but `calculateSicarAdjusted` does not filter by it yet. First test should fail with `expected 50 but received 126`.

**Step 3: Commit RED tests**

```bash
git add src/utils/__tests__/sicarAdjustment.test.ts
git commit -m "test(sicar): RED — failing tests for single-deduction filter (deductedAt)"
```

---

## Task 3: GREEN — Implement Deduction Filter in calculateSicarAdjusted

**Files:**
- Modify: `src/utils/sicarAdjustment.ts:203-205`

**Step 1: Add deductedAt filter**

Change lines 203-205 from:

```typescript
  const pendingDeliveries = deliveries.filter(
    (d) => d.status === 'pending_cod'
  );
```

To:

```typescript
  // 🤖 [IA] - v3.5.2: Filtrar pending_cod SIN deductedAt (prevención doble deducción)
  const pendingDeliveries = deliveries.filter(
    (d) => d.status === 'pending_cod' && !d.deductedAt
  );
```

**Step 2: Run tests to verify they PASS**

Run: `npx vitest run src/utils/__tests__/sicarAdjustment.test.ts`
Expected: ALL 22 tests PASS (18 existing + 4 new)

**Step 3: Run full test suite to check no regressions**

Run: `npx vitest run`
Expected: No regressions

**Step 4: Commit GREEN**

```bash
git add src/utils/sicarAdjustment.ts
git commit -m "fix(sicar): GREEN — filter out already-deducted deliveries (deductedAt)"
```

---

## Task 4: RED — Write Failing Test for markAsDeducted Hook Operation

**Files:**
- Create: `src/hooks/__tests__/useDeliveries.markAsDeducted.test.ts`

**Step 1: Write the failing test**

```typescript
/**
 * 🤖 [IA] - v3.5.2: Tests para markAsDeducted — prevención doble deducción
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeliveries } from '../useDeliveries';

describe('useDeliveries - markAsDeducted', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe establecer deductedAt en el delivery sin cambiar su status', () => {
    const { result } = renderHook(() => useDeliveries());

    // Crear un delivery pending
    let delivery: ReturnType<typeof result.current.createDelivery>;
    act(() => {
      delivery = result.current.createDelivery({
        customerName: 'Test Client',
        amount: 76.00,
        courier: 'C807',
      });
    });

    expect(result.current.pending).toHaveLength(1);
    expect(result.current.pending[0].deductedAt).toBeUndefined();

    // Marcar como deducido
    act(() => {
      result.current.markAsDeducted(delivery.id);
    });

    // Debe seguir en pending (status no cambia)
    expect(result.current.pending).toHaveLength(1);
    expect(result.current.pending[0].status).toBe('pending_cod');
    // Pero con deductedAt establecido
    expect(result.current.pending[0].deductedAt).toBeDefined();
    expect(typeof result.current.pending[0].deductedAt).toBe('string');
  });

  it('debe marcar múltiples deliveries como deducidos', () => {
    const { result } = renderHook(() => useDeliveries());

    let d1: ReturnType<typeof result.current.createDelivery>;
    let d2: ReturnType<typeof result.current.createDelivery>;
    act(() => {
      d1 = result.current.createDelivery({
        customerName: 'Client A',
        amount: 50.00,
        courier: 'C807',
      });
      d2 = result.current.createDelivery({
        customerName: 'Client B',
        amount: 76.00,
        courier: 'Melos',
      });
    });

    act(() => {
      result.current.markAsDeducted(d1.id);
      result.current.markAsDeducted(d2.id);
    });

    expect(result.current.pending[0].deductedAt).toBeDefined();
    expect(result.current.pending[1].deductedAt).toBeDefined();
    // Both still pending
    expect(result.current.pending.every(d => d.status === 'pending_cod')).toBe(true);
  });

  it('debe lanzar error si delivery no existe', () => {
    const { result } = renderHook(() => useDeliveries());

    expect(() => {
      act(() => {
        result.current.markAsDeducted('non-existent-id');
      });
    }).toThrow('not found in pending');
  });
});
```

**Step 2: Run test to verify it FAILS**

Run: `npx vitest run src/hooks/__tests__/useDeliveries.markAsDeducted.test.ts`
Expected: FAIL — `result.current.markAsDeducted is not a function`

**Step 3: Commit RED**

```bash
git add src/hooks/__tests__/useDeliveries.markAsDeducted.test.ts
git commit -m "test(hook): RED — failing tests for markAsDeducted operation"
```

---

## Task 5: GREEN — Implement markAsDeducted in useDeliveries Hook

**Files:**
- Modify: `src/hooks/useDeliveries.ts`

**Step 1: Add markAsDeducted to return interface**

In `UseDeliveriesReturn` interface (around line 98), add after `rejectDelivery`:

```typescript
  /** Marcar delivery como deducido del corte (establece deductedAt, NO cambia status) */
  markAsDeducted: (id: string) => void;
```

**Step 2: Implement the function**

Add after the `rejectDelivery` function (around line 475), following the same pattern as `markAsPaid`:

```typescript
  /**
   * Marca delivery como deducido del corte de caja
   * NO cambia status — delivery sigue en pending para gestión manual
   * Solo establece deductedAt para prevenir doble deducción
   *
   * 🤖 [IA] - v3.5.2: Prevención doble deducción
   */
  const markAsDeducted = useCallback((id: string): void => {
    const delivery = pending.find((d) => d.id === id);
    if (!delivery) {
      throw new Error(`Delivery with id ${id} not found in pending`);
    }

    setPending((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, deductedAt: new Date().toISOString() }
          : d
      )
    );
  }, [pending]);
```

**Step 3: Add markAsDeducted to the return object**

Find the return statement of `useDeliveries` and add `markAsDeducted` to the returned object:

```typescript
    markAsDeducted,
```

**Step 4: Run tests to verify they PASS**

Run: `npx vitest run src/hooks/__tests__/useDeliveries.markAsDeducted.test.ts`
Expected: ALL 3 tests PASS

**Step 5: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 6: Commit GREEN**

```bash
git add src/hooks/useDeliveries.ts
git commit -m "fix(hook): GREEN — implement markAsDeducted for single-deduction tracking"
```

---

## Task 6: Integrate markAsDeducted into CashCalculation Flow

**Files:**
- Modify: `src/components/CashCalculation.tsx:83,139`

**Step 1: Destructure markAsDeducted from hook**

Change line 83 from:

```typescript
  const { pending: pendingDeliveries } = useDeliveries();
```

To:

```typescript
  // 🤖 [IA] - v3.5.2: markAsDeducted para prevenir doble deducción
  const { pending: pendingDeliveries, markAsDeducted } = useDeliveries();
```

**Step 2: Mark deliveries as deducted after calculation**

After line 136 (`setCalculationData(data);`) and before the closing of `performCalculation`, add:

```typescript
    // 🤖 [IA] - v3.5.2: Marcar deliveries como deducidos para prevenir doble deducción
    pendingDeliveries
      .filter((d) => !d.deductedAt)
      .forEach((d) => markAsDeducted(d.id));
```

**Step 3: Add markAsDeducted to useCallback deps**

Update the deps array on line 139 from:

```typescript
  }, [cashCount, electronicPayments, expectedSales, expenses, pendingDeliveries]);
```

To:

```typescript
  }, [cashCount, electronicPayments, expectedSales, expenses, pendingDeliveries, markAsDeducted]);
```

**Step 4: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 5: Commit**

```bash
git add src/components/CashCalculation.tsx
git commit -m "fix(calc): mark deliveries as deducted after cut calculation"
```

---

## Task 7: RED — Write Failing Test for Read-Only Delivery Summary

**Files:**
- Create: `src/components/cash-calculation/__tests__/DeductedDeliveriesSummary.test.tsx`

**Step 1: Write the failing test**

```typescript
/**
 * 🤖 [IA] - v3.5.2: Tests para DeductedDeliveriesSummary — read-only summary
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeductedDeliveriesSummary } from '../DeductedDeliveriesSummary';
import type { DeliveryEntry } from '@/types/deliveries';

function createTestDelivery(overrides: Partial<DeliveryEntry> = {}): DeliveryEntry {
  return {
    id: crypto.randomUUID(),
    customerName: 'Test Customer',
    amount: 100.0,
    courier: 'C807',
    status: 'pending_cod',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('DeductedDeliveriesSummary', () => {
  it('debe mostrar mensaje cuando no hay deliveries pendientes', () => {
    render(<DeductedDeliveriesSummary deliveries={[]} />);
    expect(screen.getByText(/sin deliveries pendientes/i)).toBeInTheDocument();
  });

  it('debe mostrar lista de deliveries con nombre y monto', () => {
    const deliveries = [
      createTestDelivery({ customerName: 'Juan Pérez', amount: 76.00 }),
      createTestDelivery({ customerName: 'María López', amount: 50.00 }),
    ];

    render(<DeductedDeliveriesSummary deliveries={deliveries} />);

    expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
    expect(screen.getByText(/\$76\.00/)).toBeInTheDocument();
    expect(screen.getByText(/María López/)).toBeInTheDocument();
    expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
  });

  it('debe mostrar el total de deliveries deducidos', () => {
    const deliveries = [
      createTestDelivery({ amount: 76.00 }),
      createTestDelivery({ amount: 50.00 }),
    ];

    render(<DeductedDeliveriesSummary deliveries={deliveries} />);

    expect(screen.getByText(/\$126\.00/)).toBeInTheDocument();
  });

  it('NO debe renderizar botones de crear, editar o eliminar', () => {
    const deliveries = [
      createTestDelivery({ amount: 76.00 }),
    ];

    render(<DeductedDeliveriesSummary deliveries={deliveries} />);

    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByText(/agregar/i)).toBeNull();
    expect(screen.queryByText(/cancelar/i)).toBeNull();
    expect(screen.queryByText(/pagado/i)).toBeNull();
  });

  it('debe mostrar el courier de cada delivery', () => {
    const deliveries = [
      createTestDelivery({ customerName: 'Juan', courier: 'C807' }),
      createTestDelivery({ customerName: 'María', courier: 'Melos' }),
    ];

    render(<DeductedDeliveriesSummary deliveries={deliveries} />);

    expect(screen.getByText(/C807/)).toBeInTheDocument();
    expect(screen.getByText(/Melos/)).toBeInTheDocument();
  });
});
```

**Step 2: Run test to verify it FAILS**

Run: `npx vitest run src/components/cash-calculation/__tests__/DeductedDeliveriesSummary.test.tsx`
Expected: FAIL — module not found

**Step 3: Commit RED**

```bash
git add src/components/cash-calculation/__tests__/DeductedDeliveriesSummary.test.tsx
git commit -m "test(ui): RED — failing tests for read-only DeductedDeliveriesSummary"
```

---

## Task 8: GREEN — Implement DeductedDeliveriesSummary Component

**Files:**
- Create: `src/components/cash-calculation/DeductedDeliveriesSummary.tsx`

**Step 1: Create the component**

```tsx
// 🤖 [IA] - v3.5.2: Componente read-only para mostrar deliveries deducidos en resultados del corte
// Reemplaza DeliveryManager CRUD — sin botones de crear/editar/eliminar

import { formatCurrency } from '@/utils/calculations';
import type { DeliveryEntry } from '@/types/deliveries';

interface DeductedDeliveriesSummaryProps {
  deliveries: DeliveryEntry[];
}

export function DeductedDeliveriesSummary({ deliveries }: DeductedDeliveriesSummaryProps) {
  if (deliveries.length === 0) {
    return (
      <p className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: '#8899a6' }}>
        Sin deliveries pendientes
      </p>
    );
  }

  const total = deliveries.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-2">
      {deliveries.map((d) => (
        <div
          key={d.id}
          className="flex justify-between items-center p-2 rounded"
          style={{ background: 'rgba(255,255,255,0.05)' }}
        >
          <div>
            <span className="text-[clamp(0.75rem,3vw,0.875rem)] font-medium" style={{ color: '#e1e8ed' }}>
              {d.customerName}
            </span>
            <span className="text-[clamp(0.65rem,2.5vw,0.75rem)] ml-2" style={{ color: '#8899a6' }}>
              {d.courier}
            </span>
          </div>
          <span className="text-[clamp(0.75rem,3vw,0.875rem)] font-medium" style={{ color: '#f4a52a' }}>
            {formatCurrency(d.amount)}
          </span>
        </div>
      ))}
      <div className="flex justify-between items-center pt-2 mt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <span className="text-[clamp(0.75rem,3vw,0.875rem)] font-bold" style={{ color: '#e1e8ed' }}>
          Total deducido
        </span>
        <span className="text-[clamp(0.85rem,3.5vw,1rem)] font-bold" style={{ color: '#f4a52a' }}>
          {formatCurrency(total)}
        </span>
      </div>
    </div>
  );
}
```

**Step 2: Run tests to verify they PASS**

Run: `npx vitest run src/components/cash-calculation/__tests__/DeductedDeliveriesSummary.test.tsx`
Expected: ALL 5 tests PASS

**Step 3: Commit GREEN**

```bash
git add src/components/cash-calculation/DeductedDeliveriesSummary.tsx
git commit -m "feat(ui): GREEN — read-only DeductedDeliveriesSummary component"
```

---

## Task 9: Replace DeliveryManager with DeductedDeliveriesSummary in CashResultsDisplay

**Files:**
- Modify: `src/components/cash-calculation/CashResultsDisplay.tsx:10,12-22,177-194`

**Step 1: Replace import**

Change line 10 from:

```typescript
import { DeliveryManager } from '@/components/deliveries/DeliveryManager';
```

To:

```typescript
import { DeductedDeliveriesSummary } from '@/components/cash-calculation/DeductedDeliveriesSummary';
import { useDeliveries } from '@/hooks/useDeliveries';
```

**Step 2: Add pendingDeliveries to the component**

Inside the component function (after the destructuring of props), add:

```typescript
  const { pending: pendingDeliveries } = useDeliveries();
```

**Step 3: Replace the Deliveries COD section**

Replace lines 177-194 (the entire `{/* Deliveries COD Section */}` block) with:

```tsx
      {/* Deliveries COD Section — Read-Only Summary */}
      <div className="glass-morphism-panel">
        <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#e1e8ed' }}>
          📦 Deliveries Deducidos (COD)
        </h3>
        <p className="text-[clamp(0.75rem,3vw,0.875rem)] mb-2" style={{ color: '#8899a6' }}>
          Deliveries pendientes restados del SICAR en este corte
        </p>
        <p
          data-testid="delivery-sicar-note"
          className="text-[clamp(0.7rem,2.8vw,0.8rem)] mb-[clamp(1rem,4vw,1.5rem)] px-2 py-1 rounded"
          style={{ color: '#00ba7c', background: 'rgba(0,186,124,0.08)' }}
        >
          Para gestionar deliveries, usa el módulo de Deliveries desde la pantalla principal.
        </p>
        <DeductedDeliveriesSummary deliveries={pendingDeliveries} />
      </div>
```

**Step 4: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 5: Run existing CashResultsDisplay tests**

Run: `npx vitest run --reporter=verbose 2>&1 | grep -i "delivery-ux\|CashResults"`
Expected: Existing tests still pass (or flag specific adjustments needed for changed text)

**Step 6: Commit**

```bash
git add src/components/cash-calculation/CashResultsDisplay.tsx
git commit -m "fix(ui): replace DeliveryManager CRUD with read-only DeductedDeliveriesSummary"
```

---

## Task 10: Final Validation + Push

**Step 1: TypeScript full check**

Run: `npx tsc --noEmit`
Expected: 0 errors

**Step 2: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass, no regressions

**Step 3: Build check**

Run: `npm run build`
Expected: Build successful

**Step 4: Push to branch**

```bash
git push -u origin claude/investigate-delivery-charges-D8oxF
```

---

## Summary of Changes

| File | Change | Lines |
|------|--------|-------|
| `src/types/deliveries.ts` | Add `deductedAt?: string` field | +8 |
| `src/utils/sicarAdjustment.ts` | Add `&& !d.deductedAt` filter | +1 |
| `src/utils/__tests__/sicarAdjustment.test.ts` | 4 new tests for deduction filter | +55 |
| `src/hooks/useDeliveries.ts` | Add `markAsDeducted()` operation | +18 |
| `src/hooks/__tests__/useDeliveries.markAsDeducted.test.ts` | 3 new tests for hook operation | +75 |
| `src/components/CashCalculation.tsx` | Call `markAsDeducted` after calc | +5 |
| `src/components/cash-calculation/DeductedDeliveriesSummary.tsx` | New read-only component | +52 |
| `src/components/cash-calculation/__tests__/DeductedDeliveriesSummary.test.tsx` | 5 new tests for read-only | +75 |
| `src/components/cash-calculation/CashResultsDisplay.tsx` | Replace DeliveryManager with summary | ~20 |

**Total: ~309 lines added/modified across 9 files, 12 new tests**
