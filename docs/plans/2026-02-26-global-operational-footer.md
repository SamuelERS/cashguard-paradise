# Global Operational Footer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Convertir el bloque “Compromiso Operativo” en un footer reutilizable de aplicación (sin duplicados), visible de forma consistente en las vistas principales.

**Architecture:** Se centraliza el contenido institucional en un único componente `AppFooter` y se monta en los shells de navegación (`Index` y `SupervisorDashboard`). `OperationSelector` deja de renderizar ese bloque para evitar repetición y ruido visual. El flujo operativo crítico (modales/wizard/cash counter) no cambia de lógica; solo cambia composición visual del layout.

**Tech Stack:** React 18 + TypeScript + Vite + Vitest + Testing Library + Tailwind/CSS existente.

---

### Task 1: Contrato RED del Footer Global

**Files:**
- Create: `src/components/__tests__/AppFooter.contract.test.tsx`
- Modify: `src/components/operation-selector/__tests__/OperationSelector.motivational-panel.test.tsx`
- Modify: `src/__tests__/unit/pages/supervisor-dashboard-buttons.test.tsx`
- Modify: `src/__tests__/integration/morning-count-simplified.test.tsx`

**Step 1: Write the failing test**

```tsx
// src/components/__tests__/AppFooter.contract.test.tsx
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppFooter } from '@/components/AppFooter';

describe('AppFooter contract', () => {
  it('renderiza bloque institucional accesible y sin toggle', () => {
    render(<AppFooter />);

    const footer = screen.getByRole('contentinfo', { name: /compromiso operativo/i });
    expect(within(footer).getByText(/Compromiso Operativo/i)).toBeInTheDocument();
    expect(within(footer).getByText(/Este sistema resguarda tu trabajo diario/i)).toBeInTheDocument();
    expect(within(footer).getByText(/Equipo de Acuarios Paradise/i)).toBeInTheDocument();
    expect(within(footer).getByText(/JesucristoEsDios/i)).toBeInTheDocument();
    expect(within(footer).queryByRole('button', { name: /ver mensaje/i })).not.toBeInTheDocument();
  });
});
```

```tsx
// src/components/operation-selector/__tests__/OperationSelector.motivational-panel.test.tsx
it('no duplica el mensaje institucional dentro del selector', () => {
  // ...render OperationSelector
  expect(screen.queryByRole('note')).not.toBeInTheDocument();
  expect(screen.queryByText(/Compromiso Operativo/i)).not.toBeInTheDocument();
});
```

```tsx
// src/__tests__/unit/pages/supervisor-dashboard-buttons.test.tsx
it('renderiza footer institucional cuando el dashboard está autenticado', async () => {
  await renderAutenticado();
  expect(screen.getByRole('contentinfo', { name: /compromiso operativo/i })).toBeInTheDocument();
});
```

```tsx
// src/__tests__/integration/morning-count-simplified.test.tsx
it('debe mostrar mensaje institucional en footer global', async () => {
  renderWithProviders(<Index />);
  await waitFor(() => expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument());

  const footer = screen.getByRole('contentinfo', { name: /compromiso operativo/i });
  expect(within(footer).getByText(/Compromiso Operativo/i)).toBeInTheDocument();
  expect(within(footer).getByText(/JesucristoEsDios/i)).toBeInTheDocument();
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test -- src/components/__tests__/AppFooter.contract.test.tsx src/components/operation-selector/__tests__/OperationSelector.motivational-panel.test.tsx src/__tests__/unit/pages/supervisor-dashboard-buttons.test.tsx src/__tests__/integration/morning-count-simplified.test.tsx
```

Expected: FAIL (roles/markup aún no implementados y `OperationSelector` sigue renderizando panel).

**Step 3: Write minimal implementation**

No implementation yet in this task (RED only).

**Step 4: Run test to verify it fails**

Run el mismo comando anterior y confirmar FAIL estable/reproducible.

**Step 5: Commit**

```bash
git add src/components/__tests__/AppFooter.contract.test.tsx src/components/operation-selector/__tests__/OperationSelector.motivational-panel.test.tsx src/__tests__/unit/pages/supervisor-dashboard-buttons.test.tsx src/__tests__/integration/morning-count-simplified.test.tsx
git commit -m "test(footer): definir contrato global y remover expectativa local en selector"
```

---

### Task 2: Implementar Componente Footer Reutilizable (GREEN)

**Files:**
- Modify: `src/components/AppFooter.tsx`

**Step 1: Write the failing test**

Usar el test de Task 1 como driver (debe seguir en rojo).

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test -- src/components/__tests__/AppFooter.contract.test.tsx
```

Expected: FAIL.

**Step 3: Write minimal implementation**

```tsx
// src/components/AppFooter.tsx
interface AppFooterProps {
  className?: string;
}

export function AppFooter({ className = '' }: AppFooterProps) {
  return (
    <footer
      role="contentinfo"
      aria-label="Compromiso Operativo"
      className={`w-full ${className}`}
    >
      <div className="rounded-xl border border-white/10 border-t-[#0a84ff]/60 bg-white/[0.03] px-6 py-5">
        <p className="text-lg font-semibold text-[#cfe4ff]">Compromiso Operativo</p>
        <p className="mt-2 text-sm text-[#a5b4c2]">
          Este sistema resguarda tu trabajo diario con trazabilidad, orden y transparencia en cada corte.
        </p>
        <p className="mt-1 text-sm text-[#8fa0b0]">
          Gracias por operar con precisión y cuidar los recursos de Paradise en cada turno.
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 gap-3 flex-wrap">
          <span className="text-xs text-[#657786]">Equipo de Acuarios Paradise</span>
          <span className="text-xs font-semibold text-[#5fa8ff]">🕊️ JesucristoEsDios ❤️</span>
        </div>
      </div>
    </footer>
  );
}
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test -- src/components/__tests__/AppFooter.contract.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/AppFooter.tsx src/components/__tests__/AppFooter.contract.test.tsx
git commit -m "feat(footer): implementar AppFooter institucional reutilizable"
```

---

### Task 3: Integrar Footer en Shells y Eliminar Duplicado del Selector

**Files:**
- Modify: `src/pages/Index.tsx`
- Modify: `src/pages/SupervisorDashboard.tsx`
- Modify: `src/components/operation-selector/OperationSelector.tsx`
- Modify: `src/components/operation-selector/operation-selector.css`
- Modify: `src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`

**Step 1: Write the failing test**

Ajustar contrato UX para reflejar nueva arquitectura (sin panel institucional dentro del selector):

```ts
// src/__tests__/ux-audit/operation-selector-ux-contract.test.ts
test('mensaje institucional ya no vive en OperationSelector (usa footer global)', () => {
  const css = readFileSync(resolve(CSS_PATH), 'utf-8');
  const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');

  expect(tsx).not.toMatch(/Compromiso Operativo/);
  expect(tsx).not.toMatch(/operation-team-panel/);
  expect(css).not.toMatch(/\.operation-team-panel/);
});
```

**Step 2: Run test to verify it fails**

Run:
```bash
npm run test -- src/components/operation-selector/__tests__/OperationSelector.motivational-panel.test.tsx src/__tests__/ux-audit/operation-selector-ux-contract.test.ts
```

Expected: FAIL (selector aún contiene panel y estilos).

**Step 3: Write minimal implementation**

```tsx
// src/pages/Index.tsx (rama donde se muestra OperationSelector)
import { AppFooter } from '@/components/AppFooter';

return (
  <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
    <div className="flex-1">
      <OperationSelector onSelectMode={handleModeSelection} />
      <AnimatePresence initial={false} mode="wait">...</AnimatePresence>
    </div>
    <div className="mx-auto w-full max-w-6xl px-4 pb-6">
      <AppFooter />
    </div>
  </div>
);
```

```tsx
// src/pages/SupervisorDashboard.tsx
import { AppFooter } from '@/components/AppFooter';

return (
  <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
    <header>...</header>
    <main className="mx-auto max-w-2xl px-4 py-6 flex-1">
      <Outlet />
    </main>
    <div className="mx-auto w-full max-w-2xl px-4 pb-6">
      <AppFooter />
    </div>
  </div>
);
```

```tsx
// src/components/operation-selector/OperationSelector.tsx
// Eliminar bloque <motion.div role="note" ...>...</motion.div>
```

```css
/* src/components/operation-selector/operation-selector.css */
/* Eliminar reglas .operation-team-* ya no usadas */
```

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test -- src/components/operation-selector/__tests__/OperationSelector.motivational-panel.test.tsx src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/__tests__/unit/pages/supervisor-dashboard-buttons.test.tsx src/__tests__/integration/morning-count-simplified.test.tsx
```

Expected: PASS.

**Step 5: Commit**

```bash
git add src/pages/Index.tsx src/pages/SupervisorDashboard.tsx src/components/operation-selector/OperationSelector.tsx src/components/operation-selector/operation-selector.css src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/components/operation-selector/__tests__/OperationSelector.motivational-panel.test.tsx src/__tests__/unit/pages/supervisor-dashboard-buttons.test.tsx src/__tests__/integration/morning-count-simplified.test.tsx
git commit -m "refactor(layout): mover mensaje institucional a footer global reutilizable"
```

---

### Task 4: Verificación Final + Higiene

**Files:**
- Modify (if needed): `src/components/operation-selector/operation-selector.css` (solo limpieza final)
- Optional docs: `docs/plans/2026-02-26-global-operational-footer.md` (estado de ejecución)

**Step 1: Write the failing test**

No aplica (task de verificación).

**Step 2: Run test to verify it fails**

No aplica.

**Step 3: Write minimal implementation**

No aplica.

**Step 4: Run test to verify it passes**

Run:
```bash
npm run test -- src/components/__tests__/AppFooter.contract.test.tsx src/components/operation-selector/__tests__/OperationSelector.motivational-panel.test.tsx src/__tests__/unit/pages/supervisor-dashboard-buttons.test.tsx src/__tests__/integration/morning-count-simplified.test.tsx src/__tests__/ux-audit/operation-selector-ux-contract.test.ts
npm run test -- src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-sync.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-table.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-ux-compact.test.tsx src/components/supervisor/__tests__/CorteDetalle.compact-operational-header.test.tsx src/components/supervisor/__tests__/CorteDetalle.live-delivery-sync.test.tsx src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx
npm run build
```

Expected:
- Todos los tests en verde.
- Build de producción exitoso.

**Step 5: Commit**

```bash
git add -A
git commit -m "chore(qa): verificar footer global sin regresiones"
```

---

### Task 5: Publicación y Sincronización (si se ejecuta en main)

**Files:**
- No code files (solo git state)

**Step 1: Write the failing test**

No aplica.

**Step 2: Run test to verify it fails**

No aplica.

**Step 3: Write minimal implementation**

No aplica.

**Step 4: Run test to verify it passes**

```bash
git rev-parse --short HEAD
git rev-parse --short origin/main
```

Expected: hashes iguales después del push.

**Step 5: Commit**

```bash
git push origin main
git status --short
```

Expected: sin cambios pendientes relevantes (salvo archivos locales no versionados explícitamente ignorados).

---

## Notes de diseño (decisiones)

- DRY: un solo contenido institucional en `AppFooter`.
- YAGNI: sin toggle, sin variantes visuales runtime, sin estado adicional.
- Accesibilidad: `role="contentinfo"` + `aria-label="Compromiso Operativo"`.
- Riesgo controlado: no tocar lógica de conteo/corte/sincronización, solo composición de UI.
- Skills a usar durante ejecución: `@test-driven-development`, `@frontend-design`, `@verification-before-completion`.

