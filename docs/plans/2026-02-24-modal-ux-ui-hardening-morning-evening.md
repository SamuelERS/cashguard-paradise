# Modal UX/UI Hardening (Matutino + Nocturno) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Estandarizar y endurecer UX/UI de todos los modales de los flujos matutino y nocturno (botones, textos, cierre, accesibilidad, consistencia visual) sin romper anti-fraude ni regresiones funcionales.

**Architecture:** Se aplicará una estrategia contract-first: primero tests de contrato de modal (callbacks, close policy, copy/a11y), luego implementación mínima por capas (primitiva `ConfirmationModal`, call-sites de morning/evening, estilos CSS). Se mantienen políticas de seguridad (no cierre accidental en modales críticos) separando explícitamente modales críticos vs informativos.

**Tech Stack:** React 18 + TypeScript, Radix Dialog/AlertDialog, Vitest + Testing Library, Tailwind/CSS modular.

---

### Task 1: Definir contrato de comportamiento para `ConfirmationModal` (callback + intención)

**Files:**
- Create: `src/components/ui/__tests__/confirmation-modal.contract.test.tsx`
- Modify: `src/__tests__/components/verification/BlindVerificationModal.test.tsx`
- Modify: `src/components/verification/BlindVerificationModal.tsx`

**Step 1: Write the failing test**

Add contract tests for these rules:

```tsx
it('calls onConfirm once and does not double-call onCancel on close', async () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  renderModal({ open: true, onConfirm, onCancel });

  await user.click(screen.getByRole('button', { name: /confirmar/i }));

  expect(onConfirm).toHaveBeenCalledTimes(1);
  expect(onCancel).toHaveBeenCalledTimes(0);
});

it('calls onCancel exactly once when user cancels', async () => {
  const onCancel = vi.fn();
  renderModal({ open: true, onCancel });

  await user.click(screen.getByRole('button', { name: /cancelar/i }));

  expect(onCancel).toHaveBeenCalledTimes(1);
});
```

Update `BlindVerificationModal` tests to assert single callback semantics (currently esperan 2 llamadas).

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/ui/__tests__/confirmation-modal.contract.test.tsx src/__tests__/components/verification/BlindVerificationModal.test.tsx`
Expected: FAIL por doble invocación de `onCancel` al cerrar.

**Step 3: Write minimal implementation**

Implement source-of-truth semantics in `ConfirmationModal`:

```tsx
const handleOpenChange = (isOpen: boolean) => {
  onOpenChange?.(isOpen);
};

const handleCancelClick = () => onCancel();
const handleConfirmClick = () => onConfirm();
```

In `BlindVerificationModal`, map callbacks explícitamente para cada tipo sin depender de side-effect de cierre.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/ui/__tests__/confirmation-modal.contract.test.tsx src/__tests__/components/verification/BlindVerificationModal.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/ui/__tests__/confirmation-modal.contract.test.tsx src/components/verification/BlindVerificationModal.tsx src/__tests__/components/verification/BlindVerificationModal.test.tsx src/components/ui/confirmation-modal.tsx
git commit -m "test(ui): lock confirmation modal callback contract and remove double-cancel semantics"
```

---

### Task 2: Estandarizar severidad visual/textual de modales de confirmación

**Files:**
- Modify: `src/components/ui/confirmation-modal.tsx`
- Modify: `src/components/initial-wizard/InitialWizardModalView.tsx`
- Modify: `src/components/cash-counter/Phase1CountingView.tsx`
- Modify: `src/components/cash-counting/GuidedInstructionsModal.tsx`
- Modify: `src/components/morning-count/MorningCountWizard.tsx`
- Modify: `src/components/phases/Phase2Manager.tsx`
- Modify: `src/components/phases/Phase2VerificationSection.tsx`
- Test: `src/components/initial-wizard/__tests__/InitialWizardModal.test.tsx`
- Test: `src/components/phases/__tests__/Phase2VerificationSection.test.tsx`

**Step 1: Write the failing test**

Add assertions that non-destructive confirmations do not render destructive treatment:

```tsx
expect(screen.getByText('¿Retroceder al paso anterior?')).toBeInTheDocument();
expect(screen.queryByText(/⚠️/)).not.toBeInTheDocument();
```

Keep destructive modals with warning style explicitly.

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/initial-wizard/__tests__/InitialWizardModal.test.tsx src/components/phases/__tests__/Phase2VerificationSection.test.tsx`
Expected: FAIL porque `ConfirmationModal` prependa `⚠️` y botón destructivo en todos los casos.

**Step 3: Write minimal implementation**

Add modal variant prop:

```tsx
type ConfirmationVariant = 'destructive' | 'warning' | 'neutral';

interface ConfirmationModalProps {
  variant?: ConfirmationVariant;
}
```

Render icon/color/button type by `variant` and migrate call sites:
- `destructive`: cancelar/abortar/salir.
- `neutral`: retroceder/continuar.
- `warning`: validaciones operativas no destructivas.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/initial-wizard/__tests__/InitialWizardModal.test.tsx src/components/phases/__tests__/Phase2VerificationSection.test.tsx src/__tests__/components/verification/BlindVerificationModal.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/ui/confirmation-modal.tsx src/components/initial-wizard/InitialWizardModalView.tsx src/components/cash-counter/Phase1CountingView.tsx src/components/cash-counting/GuidedInstructionsModal.tsx src/components/morning-count/MorningCountWizard.tsx src/components/phases/Phase2Manager.tsx src/components/phases/Phase2VerificationSection.tsx src/components/initial-wizard/__tests__/InitialWizardModal.test.tsx src/components/phases/__tests__/Phase2VerificationSection.test.tsx
git commit -m "feat(ui): add confirmation modal severity variants for consistent modal semantics"
```

---

### Task 3: Política de cierre consistente por tipo de modal (crítico vs informativo)

**Files:**
- Create: `src/lib/modalClosePolicy.ts`
- Modify: `src/components/morning-count/MorningCountWizard.tsx`
- Modify: `src/components/initial-wizard/InitialWizardModalView.tsx`
- Modify: `src/components/cash-counting/GuidedInstructionsModal.tsx`
- Modify: `src/components/phases/Phase2Manager.tsx`
- Modify: `src/components/shared/WhatsAppInstructionsModal.tsx`
- Test: `src/__tests__/integration/cash-counting/GuidedInstructionsModal.integration.test.tsx`
- Test: `src/components/initial-wizard/__tests__/InitialWizardModal.test.tsx`
- Create: `src/components/shared/__tests__/WhatsAppInstructionsModal.test.tsx`

**Step 1: Write the failing test**

Codify contract:
- Modales críticos (`initial wizard`, `morning wizard`, `guided instructions`, `phase2 instructions`) no cierran por overlay/Escape accidental.
- Modal informativo (`WhatsAppInstructionsModal`) sí permite cierre normal.

```tsx
fireEvent.keyDown(document.body, { key: 'Escape' });
expect(screen.getByRole('dialog')).toBeInTheDocument(); // crítico
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/initial-wizard/__tests__/InitialWizardModal.test.tsx src/__tests__/integration/cash-counting/GuidedInstructionsModal.integration.test.tsx src/components/shared/__tests__/WhatsAppInstructionsModal.test.tsx`
Expected: FAIL en casos no explícitamente estandarizados.

**Step 3: Write minimal implementation**

Create central policy helper:

```ts
export const modalClosePolicy = {
  critical: { allowOverlayClose: false, allowEscapeClose: false },
  informational: { allowOverlayClose: true, allowEscapeClose: true },
} as const;
```

Apply policy uniformly in each modal (sin handlers inline inconsistentes).

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/initial-wizard/__tests__/InitialWizardModal.test.tsx src/__tests__/integration/cash-counting/GuidedInstructionsModal.integration.test.tsx src/components/shared/__tests__/WhatsAppInstructionsModal.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/lib/modalClosePolicy.ts src/components/morning-count/MorningCountWizard.tsx src/components/initial-wizard/InitialWizardModalView.tsx src/components/cash-counting/GuidedInstructionsModal.tsx src/components/phases/Phase2Manager.tsx src/components/shared/WhatsAppInstructionsModal.tsx src/components/shared/__tests__/WhatsAppInstructionsModal.test.tsx src/__tests__/integration/cash-counting/GuidedInstructionsModal.integration.test.tsx src/components/initial-wizard/__tests__/InitialWizardModal.test.tsx
git commit -m "refactor(ui): unify modal close policy for critical and informational flows"
```

---

### Task 4: Accesibilidad y copy consistency en botones/textos de modales

**Files:**
- Modify: `src/components/morning-count/MorningCountWizard.tsx`
- Modify: `src/components/ui/dialog.tsx`
- Create: `src/lib/modalCopy.ts`
- Modify: `src/components/initial-wizard/InitialWizardModalView.tsx`
- Modify: `src/components/cash-counting/GuidedInstructionsModal.tsx`
- Modify: `src/components/phases/Phase2Manager.tsx`
- Test: `src/__tests__/integration/morning-count-simplified.test.tsx`
- Create: `src/components/morning-count/__tests__/MorningCountWizard.modal-a11y.test.tsx`

**Step 1: Write the failing test**

Add tests for:
- Morning close button discoverable with accessible name.
- Dialog default sr-only close text en español.
- Labels/casing normalizados (`Sí, cancelar` y acciones consistentes por contexto).

```tsx
expect(screen.getByRole('button', { name: /cerrar modal/i })).toBeInTheDocument();
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/morning-count/__tests__/MorningCountWizard.modal-a11y.test.tsx src/__tests__/integration/morning-count-simplified.test.tsx`
Expected: FAIL por `aria-label` ausente en `MorningCountWizard` y copy inconsistente.

**Step 3: Write minimal implementation**

- Add `aria-label="Cerrar modal"` in morning close button.
- Change dialog primitive sr-only from `Close` to `Cerrar`.
- Centralize common labels in `modalCopy.ts` and consume in morning/evening modals.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/morning-count/__tests__/MorningCountWizard.modal-a11y.test.tsx src/__tests__/integration/morning-count-simplified.test.tsx src/components/initial-wizard/__tests__/InitialWizardModal.test.tsx`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/morning-count/MorningCountWizard.tsx src/components/ui/dialog.tsx src/lib/modalCopy.ts src/components/initial-wizard/InitialWizardModalView.tsx src/components/cash-counting/GuidedInstructionsModal.tsx src/components/phases/Phase2Manager.tsx src/components/morning-count/__tests__/MorningCountWizard.modal-a11y.test.tsx src/__tests__/integration/morning-count-simplified.test.tsx
git commit -m "feat(a11y): normalize modal labels and close affordances across morning/evening flows"
```

---

### Task 5: Higiene CSS de modales (bloque roto + alcance de scrollbar)

**Files:**
- Modify: `src/index.css`
- Modify: `src/styles/features/modal-dark-scrollbar.css`
- Create: `src/__tests__/ux-audit/modal-css-hygiene.test.ts`

**Step 1: Write the failing test**

Add static CSS hygiene tests:
- Detect unbalanced braces around `.glass-alert-dialog-content` region.
- Assert scrollbar rules scoped to modal wrappers (`.wizard-modal-content`, `.cash-counter-content`) instead of global `class*="overflow"` selectors.

```ts
expect(cssText).not.toMatch(/\[class\*="overflow-auto"\]/);
expect(hasBalancedBraces(cssText)).toBe(true);
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/__tests__/ux-audit/modal-css-hygiene.test.ts`
Expected: FAIL por bloque mezclado en `index.css` y selectores globales.

**Step 3: Write minimal implementation**

- Repair brace structure and isolate protocol-rule block from glass-alert block.
- Narrow scrollbar selectors to modal-specific classes only.

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/__tests__/ux-audit/modal-css-hygiene.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/index.css src/styles/features/modal-dark-scrollbar.css src/__tests__/ux-audit/modal-css-hygiene.test.ts
git commit -m "fix(css): scope modal scrollbars and repair malformed modal style block"
```

---

### Task 6: Verificación integral (test suite + build + revisión visual desktop/móvil)

**Files:**
- Modify (if needed from findings): `src/components/**` and `src/styles/**`
- Document: `docs/plans/2026-02-24-modal-ux-ui-hardening-morning-evening.md` (checklist outcomes)

**Step 1: Write the failing test (if visual regression found)**

If new issue appears in walkthrough, add a targeted failing test in the closest suite before fixing.

**Step 2: Run verification suite**

Run:
- `npm run test -- src/components/ui/__tests__/confirmation-modal.contract.test.tsx src/components/initial-wizard/__tests__/InitialWizardModal.test.tsx src/__tests__/integration/cash-counting/GuidedInstructionsModal.integration.test.tsx src/__tests__/components/verification/BlindVerificationModal.test.tsx src/__tests__/integration/morning-count-simplified.test.tsx src/components/morning-count/__tests__/MorningCountWizard.modal-a11y.test.tsx src/components/shared/__tests__/WhatsAppInstructionsModal.test.tsx src/__tests__/ux-audit/modal-css-hygiene.test.ts`
- `npm run build`

Expected: PASS completo.

**Step 3: Restart + smoke visual (requerido por workflow operativo)**

Run:
- `npm run dev`

Validate manualmente:
- Desktop (1366x768): jerarquía de títulos, tamaños de botones, badges y spacing consistente.
- Mobile (390x844 y 360x800): modales legibles, sin saturación, CTA visible sin choque de elementos.
- Flujos críticos: matutino y nocturno no cierran accidentalmente por overlay/Escape.

**Step 4: Final commit**

```bash
git add -A
git commit -m "chore(ui): complete modal ux/ui hardening verification for morning and evening flows"
```

**Step 5: Evidence note**

Record in this plan file (append section “Execution Evidence”):
- tests ejecutados,
- build status,
- fecha/hora de restart,
- checklist visual observado.
