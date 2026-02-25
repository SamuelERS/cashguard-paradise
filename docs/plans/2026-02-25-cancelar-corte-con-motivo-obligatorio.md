# Cancelar Corte con Motivo Obligatorio Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Corregir el flujo de cancelación/aborto de corte para que siempre funcione, exija motivo obligatorio, persista `ABORTADO` en Supabase y permita iniciar un nuevo corte sin bloqueo de sesión activa.

**Architecture:** Se implementará un modal compartido de aborto con textarea obligatoria y validación local, luego se integrará en Fase 1, Fase 2 y Step 5 del wizard. El flujo de cancelación dejará de ser solo navegación local: abortará el corte activo en Supabase con motivo antes de volver al inicio. Se aplicará TDD estricto (RED → GREEN → REFACTOR) con contratos unitarios e integración de `Index`.

**Tech Stack:** React 18 + TypeScript, Vitest + Testing Library, Sonner toast, Supabase (`useCorteSesion`), Radix AlertDialog.

**Execution Skills:** @test-driven-development, @systematic-debugging, @verification-before-completion, @webapp-testing.

---

### Task 1: Contrato RED del modal de aborto (motivo obligatorio)

**Files:**
- Create: `src/components/ui/__tests__/AbortCorteModal.test.tsx`
- Test: `src/components/ui/__tests__/AbortCorteModal.test.tsx`

**Step 1: Write the failing test**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AbortCorteModal } from '../abort-corte-modal';

describe('AbortCorteModal', () => {
  it('deshabilita confirmar hasta ingresar motivo válido', async () => {
    render(<AbortCorteModal open onOpenChange={vi.fn()} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole('button', { name: /confirmar cancelación/i })).toBeDisabled();
  });

  it('envía motivo trimmed al confirmar', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(<AbortCorteModal open onOpenChange={vi.fn()} onConfirm={onConfirm} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/motivo/i), '  corte duplicado en caja  ');
    await user.click(screen.getByRole('button', { name: /confirmar cancelación/i }));

    expect(onConfirm).toHaveBeenCalledWith('corte duplicado en caja');
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/ui/__tests__/AbortCorteModal.test.tsx`  
Expected: FAIL porque `AbortCorteModal` aún no existe.

**Step 3: Write minimal implementation**

```tsx
// src/components/ui/abort-corte-modal.tsx
export function AbortCorteModal({ open, onOpenChange, onConfirm, onCancel }: Props) {
  const [motivo, setMotivo] = useState('');
  const motivoValido = motivo.trim().length >= 10;
  // render AlertDialog + Textarea + botón confirmar disabled={!motivoValido}
}
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/ui/__tests__/AbortCorteModal.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/ui/abort-corte-modal.tsx src/components/ui/__tests__/AbortCorteModal.test.tsx
git commit -m "feat(corte): add abort modal with mandatory reason"
```

### Task 2: RED del orquestador para cancelación real (no solo navegación)

**Files:**
- Modify: `src/hooks/__tests__/useCashCounterOrchestrator.test.ts`
- Modify: `src/hooks/useCashCounterOrchestrator.ts`
- Test: `src/hooks/__tests__/useCashCounterOrchestrator.test.ts`

**Step 1: Write the failing test**

```tsx
it('handleAbortFlow usa onFlowCancel con motivo y NO llama onBack', async () => {
  const onBack = vi.fn();
  const onFlowCancel = vi.fn().mockResolvedValue(undefined);
  const { result } = renderHook(() => useCashCounterOrchestrator(defaultOptions({ onBack, onFlowCancel })));

  await act(async () => {
    await result.current.handleAbortFlow('Cajero solicita reinicio por conteo inconsistente');
  });

  expect(onFlowCancel).toHaveBeenCalledWith('Cajero solicita reinicio por conteo inconsistente');
  expect(onBack).not.toHaveBeenCalled();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/hooks/__tests__/useCashCounterOrchestrator.test.ts`  
Expected: FAIL porque `handleAbortFlow` no existe.

**Step 3: Write minimal implementation**

```ts
const handleAbortFlow = useCallback(async (motivo: string) => {
  setShowExitConfirmation(false);
  resetGuidedCounting();
  resetAllPhases();
  if (onFlowCancel) {
    await onFlowCancel(motivo);
    return;
  }
  onBack?.();
}, [onFlowCancel, onBack, resetGuidedCounting, resetAllPhases]);
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/hooks/__tests__/useCashCounterOrchestrator.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/hooks/useCashCounterOrchestrator.ts src/hooks/__tests__/useCashCounterOrchestrator.test.ts
git commit -m "fix(cashcounter): route abort flow through onFlowCancel with reason"
```

### Task 3: Integrar modal obligatorio en Fase 1

**Files:**
- Create: `src/components/cash-counter/__tests__/Phase1CountingView.abort-flow.test.tsx`
- Modify: `src/components/cash-counter/Phase1CountingView.tsx`
- Modify: `src/components/CashCounter.tsx`
- Test: `src/components/cash-counter/__tests__/Phase1CountingView.abort-flow.test.tsx`

**Step 1: Write the failing test**

```tsx
it('pide motivo y llama onAbortFlow(motivo) al confirmar cancelación', async () => {
  const user = userEvent.setup();
  const onAbortFlow = vi.fn().mockResolvedValue(undefined);
  render(<Phase1CountingView {...baseProps} showExitConfirmation={true} onAbortFlow={onAbortFlow} />);

  await user.type(screen.getByLabelText(/motivo/i), 'Reinicio por error de arqueo inicial');
  await user.click(screen.getByRole('button', { name: /confirmar cancelación/i }));

  expect(onAbortFlow).toHaveBeenCalledWith('Reinicio por error de arqueo inicial');
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/cash-counter/__tests__/Phase1CountingView.abort-flow.test.tsx`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
// Phase1CountingView props
onAbortFlow: (motivo: string) => Promise<void> | void;

// reemplazar ConfirmationModal de salida por AbortCorteModal
<AbortCorteModal
  open={showExitConfirmation}
  onOpenChange={onShowExitConfirmationChange}
  onCancel={() => onShowExitConfirmationChange(false)}
  onConfirm={onAbortFlow}
/>
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/cash-counter/__tests__/Phase1CountingView.abort-flow.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/cash-counter/Phase1CountingView.tsx src/components/CashCounter.tsx src/components/cash-counter/__tests__/Phase1CountingView.abort-flow.test.tsx
git commit -m "feat(cashcounter): enforce mandatory abort reason in phase1 exit"
```

### Task 4: Integrar modal obligatorio en Fase 2 y checklist modal

**Files:**
- Create: `src/components/phases/__tests__/Phase2Manager.abort-flow.test.tsx`
- Modify: `src/components/phases/Phase2Manager.tsx`
- Modify: `src/components/CashCounter.tsx`
- Test: `src/components/phases/__tests__/Phase2Manager.abort-flow.test.tsx`

**Step 1: Write the failing test**

```tsx
it('cancelar en fase2 solicita motivo y llama onAbortFlow con motivo', async () => {
  const user = userEvent.setup();
  const onAbortFlow = vi.fn().mockResolvedValue(undefined);
  render(<Phase2Manager deliveryCalculation={calc} onPhase2Complete={vi.fn()} onBack={vi.fn()} onAbortFlow={onAbortFlow} />);

  await user.click(screen.getByRole('button', { name: /cancelar/i }));
  await user.type(screen.getByLabelText(/motivo/i), 'Reinicio por diferencia detectada en entrega');
  await user.click(screen.getByRole('button', { name: /confirmar cancelación/i }));

  expect(onAbortFlow).toHaveBeenCalledWith('Reinicio por diferencia detectada en entrega');
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/phases/__tests__/Phase2Manager.abort-flow.test.tsx`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
interface Phase2ManagerProps {
  onAbortFlow?: (motivo: string) => Promise<void> | void;
}

<AbortCorteModal
  open={showExitConfirmation}
  onOpenChange={setShowExitConfirmation}
  onCancel={() => setShowExitConfirmation(false)}
  onConfirm={async (motivo) => {
    if (onAbortFlow) return onAbortFlow(motivo);
    onBack();
  }}
/>
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/phases/__tests__/Phase2Manager.abort-flow.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/phases/Phase2Manager.tsx src/components/CashCounter.tsx src/components/phases/__tests__/Phase2Manager.abort-flow.test.tsx
git commit -m "feat(phase2): require abort reason before exiting active cut"
```

### Task 5: Step 5 (sesión activa) también exige motivo obligatorio

**Files:**
- Modify: `src/components/initial-wizard/steps/Step5SicarInput.tsx`
- Modify: `src/components/initial-wizard/steps/__tests__/Step5SicarInput.test.tsx`
- Modify: `src/__tests__/unit/components/Step5SicarInput.abort-feedback.test.tsx`
- Modify: `src/types/initialWizard.ts`
- Test: `src/components/initial-wizard/steps/__tests__/Step5SicarInput.test.tsx`
- Test: `src/__tests__/unit/components/Step5SicarInput.abort-feedback.test.tsx`

**Step 1: Write the failing test**

```tsx
it('no permite abortar sesión activa sin motivo en Step5', async () => {
  const user = userEvent.setup();
  const onAbortSession = vi.fn();
  renderStep5({ hasActiveSession: true, onAbortSession });

  await user.click(screen.getByRole('button', { name: /abortar sesión/i }));
  expect(screen.getByRole('button', { name: /confirmar cancelación/i })).toBeDisabled();
  expect(onAbortSession).not.toHaveBeenCalled();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/initial-wizard/steps/__tests__/Step5SicarInput.test.tsx src/__tests__/unit/components/Step5SicarInput.abort-feedback.test.tsx`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```ts
// types/initialWizard.ts
onAbortSession?: (motivo: string) => Promise<void> | void;
```

```tsx
// Step5SicarInput.tsx
<AbortCorteModal
  open={showAbortConfirm}
  onOpenChange={setShowAbortConfirm}
  onCancel={() => setShowAbortConfirm(false)}
  onConfirm={async (motivo) => {
    await onAbortSession?.(motivo);
    toast.success('Sesión abortada correctamente');
  }}
/>
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/components/initial-wizard/steps/__tests__/Step5SicarInput.test.tsx src/__tests__/unit/components/Step5SicarInput.abort-feedback.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/initial-wizard/steps/Step5SicarInput.tsx src/components/initial-wizard/steps/__tests__/Step5SicarInput.test.tsx src/__tests__/unit/components/Step5SicarInput.abort-feedback.test.tsx src/types/initialWizard.ts
git commit -m "feat(wizard): require abort reason for active session cancellation"
```

### Task 6: Persistir ABORTADO desde CashCounter y desbloquear nuevo corte

**Files:**
- Modify: `src/pages/Index.tsx`
- Create: `src/__tests__/unit/pages/index.abort-flow.test.tsx`
- Modify: `src/__tests__/unit/pages/index.cashcut-routing.test.tsx`
- Test: `src/__tests__/unit/pages/index.abort-flow.test.tsx`

**Step 1: Write the failing test**

```tsx
it('onFlowCancel aborta corte en Supabase con motivo antes de volver al inicio', async () => {
  const abortarCorte = vi.fn().mockResolvedValue(undefined);
  mockUseCorteSesion({ abortarCorte, recuperarSesion: vi.fn().mockResolvedValue({ id: 'c1' }) });

  render(<Index />);
  await user.click(screen.getByTestId('mock-trigger-abort-flow'));

  expect(abortarCorte).toHaveBeenCalledWith('Reinicio por inconsistencia en conteo');
  expect(screen.getByTestId('operation-selector')).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/__tests__/unit/pages/index.abort-flow.test.tsx`  
Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
// Index.tsx
const { abortarCorte, ... } = useCorteSesion(syncSucursalId);

const handleAbortFromCounter = useCallback(async (motivo: string) => {
  if (currentMode === OperationMode.CASH_CUT && isSupabaseConfigured && syncSucursalId) {
    await abortarCorte(motivo);
  }
  handleBackFromCounter();
}, [abortarCorte, currentMode, syncSucursalId, handleBackFromCounter]);

<CashCounter onFlowCancel={handleAbortFromCounter} ... />

const handleAbortSession = useCallback(async (motivo: string) => {
  // mantiene lógica actual pero usa motivo recibido
  await abortarCorteActivo(motivo);
}, [abortarCorteActivo, recuperarSesionActiva]);
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/__tests__/unit/pages/index.abort-flow.test.tsx src/__tests__/unit/pages/index.cashcut-routing.test.tsx`  
Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/Index.tsx src/__tests__/unit/pages/index.abort-flow.test.tsx src/__tests__/unit/pages/index.cashcut-routing.test.tsx
git commit -m "fix(index): abort active cut with mandatory reason before reset"
```

### Task 7: Verificación integral y cierre

**Files:**
- Test-only

**Step 1: Run focused regression suite**

Run:
```bash
npx vitest run \
  src/components/ui/__tests__/AbortCorteModal.test.tsx \
  src/hooks/__tests__/useCashCounterOrchestrator.test.ts \
  src/components/cash-counter/__tests__/Phase1CountingView.abort-flow.test.tsx \
  src/components/phases/__tests__/Phase2Manager.abort-flow.test.tsx \
  src/components/initial-wizard/steps/__tests__/Step5SicarInput.test.tsx \
  src/__tests__/unit/components/Step5SicarInput.abort-feedback.test.tsx \
  src/__tests__/unit/pages/index.abort-flow.test.tsx
```
Expected: PASS.

**Step 2: Run quality gates**

Run:
```bash
npm run lint
npm run build
```
Expected: PASS.

**Step 3: Manual production-like validation (@webapp-testing + @systematic-debugging)**

Run:
```bash
npm run dev
```
Manual checklist:
- En Fase 1 y Fase 2, al presionar `Cancelar`, aparece modal con textarea obligatoria.
- Sin motivo válido, `Confirmar cancelación` permanece deshabilitado.
- Con motivo válido, se aborta en Supabase y vuelve a selector.
- Se puede iniciar un nuevo corte en la misma sucursal sin bloqueo por sesión activa.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat(cash-cut): mandatory abort reason with reliable supabase cancellation flow"
```
