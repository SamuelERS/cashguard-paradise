# Operation Selector UX/UI Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mejorar la UX/UI de la pantalla principal (`OperationSelector`) de forma quirúrgica, garantizando accesibilidad visual (contraste/foco), densidad móvil más eficiente y consistencia profesional, con TDD obligatorio en cada cambio.

**Architecture:** Se aplicará una mejora incremental sin reescribir la pantalla: 1) contratos RED de UX/UI, 2) implementación mínima con clases CSS dedicadas para evitar deuda de estilos inline, 3) ajuste de densidad móvil solo en elementos secundarios. Se preserva el flujo funcional actual (modos, navegación, `data-testid`) y se limita el alcance al home.

**Tech Stack:** React 18 + TypeScript, Vitest + Testing Library, CSS plano por componente (`operation-selector.css`), Tailwind utilitario existente.

---

### Task 1: Contratos TDD RED para foco, contraste y densidad móvil

**Files:**
- Create: `src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`
- Modify: `src/__tests__/integration/delivery-view-navigation.test.tsx`
- Test: `src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`

**Step 1: Write the failing test**

```ts
// src/__tests__/ux-audit/operation-selector-ux-contract.test.ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

const CSS_PATH = 'src/components/operation-selector/operation-selector.css';
const TSX_PATH = 'src/components/operation-selector/OperationSelector.tsx';

describe('OperationSelector UX contract (TDD RED)', () => {
  test('define focus-visible ring for operation cards', () => {
    const css = readFileSync(resolve(CSS_PATH), 'utf-8');
    expect(css).toMatch(/\.operation-card:focus-visible\s*\{/);
    expect(css).toMatch(/outline:\s*2px\s+solid/);
  });

  test('define high-contrast badge variants for night/supervisor', () => {
    const css = readFileSync(resolve(CSS_PATH), 'utf-8');
    expect(css).toMatch(/\.operation-badge--night\s*\{/);
    expect(css).toMatch(/\.operation-badge--supervisor\s*\{/);
    // Guard: evitar volver al color de texto antiguo de bajo contraste
    expect(css).not.toMatch(/\.operation-badge--night[\s\S]*color:\s*#0a84ff/i);
    expect(css).not.toMatch(/\.operation-badge--supervisor[\s\S]*color:\s*#8b5cf6/i);
  });

  test('hide tertiary feature on mobile using dedicated class', () => {
    const css = readFileSync(resolve(CSS_PATH), 'utf-8');
    const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');
    expect(tsx).toMatch(/operation-feature--mobile-optional/);
    expect(css).toMatch(/\.operation-feature--mobile-optional\s*\{[\s\S]*display:\s*none/);
    expect(css).toMatch(/@media\s*\(min-width:\s*640px\)[\s\S]*\.operation-feature--mobile-optional[\s\S]*display:\s*flex/);
  });
});
```

```ts
// src/__tests__/integration/delivery-view-navigation.test.tsx (agregar caso)
it('logos decorativos no se anuncian a lectores de pantalla', () => {
  const handleSelectMode = vi.fn();

  render(
    <MemoryRouter>
      <OperationSelector onSelectMode={handleSelectMode} />
    </MemoryRouter>
  );

  expect(screen.queryByRole('img', { name: /Acuarios Paradise/i })).not.toBeInTheDocument();
  expect(screen.queryByRole('img', { name: /Productos Paradise/i })).not.toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/__tests__/integration/delivery-view-navigation.test.tsx
```

Expected: FAIL (archivo CSS no existe, clases no existen, logos aún tienen `alt` con texto).

**Step 3: Write minimal implementation**

No implementar aquí (solo fase RED).

**Step 4: Run test to verify it still fails for the right reason**

Run:
```bash
npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts
```

Expected: FAIL únicamente por contratos UX no implementados (no por syntax/type errors).

**Step 5: Commit**

```bash
git add src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/__tests__/integration/delivery-view-navigation.test.tsx
git commit -m "test(ux): add RED contracts for operation selector focus contrast and mobile density"
```

---

### Task 2: Implementación mínima GREEN para foco visible y contraste de badges

**Files:**
- Create: `src/components/operation-selector/operation-selector.css`
- Modify: `src/components/operation-selector/OperationSelector.tsx`
- Test: `src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`

**Step 1: Write/adjust failing test (if needed)**

Si algún assert RED fue ambiguo, corregir el test antes de codificar implementación (sin relajar objetivo).

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts
```

Expected: FAIL por ausencia de reglas/classes de UX.

**Step 3: Write minimal implementation**

```css
/* src/components/operation-selector/operation-selector.css */
.operation-card {
  appearance: none;
  background: var(--glass-bg-primary);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: clamp(20px, 7.4vw, 32px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.operation-card:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 3px;
}

.operation-badge {
  padding: clamp(2px, 0.9vw, 4px) clamp(7px, 2.8vw, 12px);
  font-size: clamp(0.75rem, 2.8vw, 0.8125rem);
  border-radius: 9999px;
  border-width: 1px;
  border-style: solid;
  font-weight: 600;
}

.operation-badge--morning { background: rgba(244, 165, 42, 0.2); border-color: rgba(244, 165, 42, 0.45); color: #ffd48a; }
.operation-badge--night { background: rgba(10, 132, 255, 0.22); border-color: rgba(10, 132, 255, 0.50); color: #bfe1ff; }
.operation-badge--delivery { background: rgba(16, 185, 129, 0.22); border-color: rgba(16, 185, 129, 0.50); color: #a6ffe0; }
.operation-badge--supervisor { background: rgba(139, 92, 246, 0.24); border-color: rgba(139, 92, 246, 0.55); color: #e0d2ff; }
```

```tsx
// src/components/operation-selector/OperationSelector.tsx (cambios mínimos)
import './operation-selector.css';

// En cada tarjeta
className="operation-card cursor-pointer group text-left w-full"

// En cada badge
className="operation-badge operation-badge--morning"
className="operation-badge operation-badge--night"
className="operation-badge operation-badge--delivery"
className="operation-badge operation-badge--supervisor"

// Logos decorativos (no semánticos)
alt=""
aria-hidden="true"
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/__tests__/integration/delivery-view-navigation.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/operation-selector/operation-selector.css src/components/operation-selector/OperationSelector.tsx src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/__tests__/integration/delivery-view-navigation.test.tsx
git commit -m "feat(ux): improve operation selector focus ring and badge contrast"
```

---

### Task 3: Densidad móvil quirúrgica (ocultar contenido terciario en cards)

**Files:**
- Modify: `src/components/operation-selector/OperationSelector.tsx`
- Modify: `src/components/operation-selector/operation-selector.css`
- Test: `src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`

**Step 1: Write the failing test**

Agregar asserts RED que verifiquen:

```ts
// en operation-selector-ux-contract.test.ts
expect(tsx).toMatch(/operation-feature--mobile-optional/);
expect(css).toMatch(/@media\s*\(min-width:\s*640px\)/);
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts
```

Expected: FAIL (clase de densidad móvil aún ausente en JSX o CSS).

**Step 3: Write minimal implementation**

```css
/* src/components/operation-selector/operation-selector.css */
.operation-feature-text {
  font-size: clamp(0.75rem, 3vw, 0.875rem);
  color: #8899a6;
}

.operation-feature--mobile-optional {
  display: none;
}

@media (min-width: 640px) {
  .operation-feature--mobile-optional {
    display: flex;
  }
}
```

```tsx
// src/components/operation-selector/OperationSelector.tsx
// Reemplazar className="ops-feature-text" por className="operation-feature-text"
// Marcar 3er bullet de cada tarjeta:
<div className="flex items-center gap-2 operation-feature--mobile-optional">
  ...
</div>
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/operation-selector/OperationSelector.tsx src/components/operation-selector/operation-selector.css src/__tests__/ux-audit/operation-selector-ux-contract.test.ts
git commit -m "feat(ux): reduce mobile card density for operation selector"
```

---

### Task 4: Regresión funcional + auditoría final UX/UI

**Files:**
- Test: `src/__tests__/integration/delivery-view-navigation.test.tsx`
- Test: `src/__tests__/ux-audit/operation-selector.test.ts`
- Test: `src/__tests__/ux-audit/glass-morphism.test.ts`
- (Optional docs note) Modify: `docs/04_desarrollo/Caso-UX-UI-Feb-19_COMPLETADO/Caso-Ux-UI-Feb-19.md`

**Step 1: Write failing regression test (only if gap found)**

Si durante ejecución surge un bug (ej. click no dispara `onSelectMode`), primero agregar test RED en `delivery-view-navigation.test.tsx`.

**Step 2: Run tests to verify current state**

Run:
```bash
npm run test -- src/__tests__/integration/delivery-view-navigation.test.tsx src/__tests__/ux-audit/operation-selector.test.ts src/__tests__/ux-audit/glass-morphism.test.ts
```

Expected: todo PASS.

**Step 3: Minimal implementation for any regression (if needed)**

Aplicar solo fix mínimo requerido por test RED (YAGNI).

**Step 4: Run final verification batch**

Run:
```bash
npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/__tests__/integration/delivery-view-navigation.test.tsx src/__tests__/ux-audit/operation-selector.test.ts src/__tests__/ux-audit/glass-morphism.test.ts
npm run lint
```

Expected: PASS en pruebas y sin errores de lint.

**Step 5: Commit**

```bash
git add src/components/operation-selector/OperationSelector.tsx src/components/operation-selector/operation-selector.css src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/__tests__/integration/delivery-view-navigation.test.tsx
# agregar docs si hubo actualización
git commit -m "chore(ux): finalize operation selector UX/UI hardening with TDD coverage"
```

---

## Notas de ejecución (importantes)

- Mantener `data-testid` existentes: `operation-card-cash-count`, `operation-card-cash-cut`, `operation-card-delivery`.
- No cambiar comportamiento de negocio (`onSelectMode`, `navigate('/supervisor')`).
- No hacer refactor grande de arquitectura de cards en esta fase (quirúrgico).
- No introducir dependencias nuevas.
- Si un test legacy contradice el nuevo contrato UX, primero documentar contradicción en el commit message y ajustar el test legacy con criterio de accesibilidad.

