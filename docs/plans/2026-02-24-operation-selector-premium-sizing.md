# Operation Selector Premium Sizing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reducir el tamaño percibido de logos y tarjetas en la pantalla principal para una apariencia más coherente, profesional y estética en móvil, laptop y desktop.

**Architecture:** Mantener la estructura funcional de `OperationSelector` y su navegación, pero mover reglas visuales repetidas a `operation-selector.css` con clases semánticas y variantes por tarjeta. Aplicar TDD con pruebas de contrato estático (archivo fuente) para garantizar límites de tamaño, microinteracciones y reducción de inline styles. Ejecutar en ciclos pequeños RED -> GREEN -> VERIFY con commits frecuentes.

**Tech Stack:** React + TypeScript, Framer Motion, Tailwind utility classes, CSS plano (`operation-selector.css`), Vitest + Testing Library, Vite.

---

### Task 1: Contrato TDD para tamaños de logos y control en pantallas pequeñas

**Skills:** `@test-driven-development` `@frontend-design`

**Files:**
- Modify: `src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`
- Test target: `src/components/operation-selector/OperationSelector.tsx:35-63`
- Test target: `src/components/operation-selector/operation-selector.css:1-120`

**Step 1: Write the failing test**

```ts
import { readFileSync } from 'fs';
import { resolve } from 'path';

const CSS_PATH = 'src/components/operation-selector/operation-selector.css';
const TSX_PATH = 'src/components/operation-selector/OperationSelector.tsx';

test('brand logos use responsive classes with bounded size and small-screen saturation control', () => {
  const css = readFileSync(resolve(CSS_PATH), 'utf-8');
  const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');

  expect(tsx).toMatch(/operation-brand-strip/);
  expect(tsx).toMatch(/operation-brand-logo operation-brand-logo--left/);
  expect(tsx).toMatch(/operation-brand-logo operation-brand-logo--right/);

  expect(css).toMatch(/\.operation-brand-logo\s*\{[\s\S]*height:\s*clamp\(32px,\s*7vw,\s*64px\)/);
  expect(css).toMatch(/\.operation-brand-logo--right\s*\{[\s\S]*max-height:\s*60px/);
  expect(css).toMatch(/@media\s*\(max-width:\s*430px\)[\s\S]*\.operation-brand-logo--right[\s\S]*(scale\(|max-height:\s*44px|opacity:\s*0\.[0-9]+)/);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`
Expected: FAIL indicando clases de logos o reglas CSS faltantes.

**Step 3: Write minimal implementation**

```css
.operation-brand-strip {
  position: absolute;
  inset: 0 0 auto 0;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
  z-index: 20;
  padding: clamp(12px, 2.5vw, 28px);
}

.operation-brand-logo {
  width: auto;
  height: clamp(32px, 7vw, 64px);
}

.operation-brand-logo--left {
  opacity: 0.9;
}

.operation-brand-logo--right {
  opacity: 0.82;
  max-height: 60px;
  border-radius: 8px;
}

@media (max-width: 430px) {
  .operation-brand-logo--right {
    max-height: 44px;
    opacity: 0.72;
    transform: scale(0.94);
    transform-origin: top right;
  }
}
```

```tsx
<div className="operation-brand-strip">
  <motion.img className="operation-brand-logo operation-brand-logo--left" ... />
  <motion.img className="operation-brand-logo operation-brand-logo--right" ... />
</div>
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/components/operation-selector/OperationSelector.tsx src/components/operation-selector/operation-selector.css
git commit -m "test+style: constrain header logos with responsive saturation rules"
```

### Task 2: Contrato TDD para tamaño de tarjetas y ritmo vertical consistente

**Skills:** `@test-driven-development` `@frontend-design`

**Files:**
- Modify: `src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`
- Modify: `src/components/operation-selector/operation-selector.css`
- Modify: `src/components/operation-selector/OperationSelector.tsx:110-516`

**Step 1: Write the failing test**

```ts
test('operation cards use bounded padding and minimum height for professional rhythm', () => {
  const css = readFileSync(resolve(CSS_PATH), 'utf-8');
  const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');

  expect(css).toMatch(/\.operation-card\s*\{[\s\S]*padding:\s*clamp\(18px,\s*4\.5vw,\s*28px\)/);
  expect(css).toMatch(/\.operation-card\s*\{[\s\S]*min-height:\s*clamp\(250px,\s*32vw,\s*340px\)/);
  expect(css).toMatch(/@media\s*\(max-width:\s*640px\)[\s\S]*\.operation-card[\s\S]*min-height:\s*auto/);

  expect(tsx).not.toMatch(/className="operation-card[^\"]*"\s*style=\{\{[\s\S]*padding:/);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`
Expected: FAIL por no existir límites nuevos y/o seguir usando `style={{ padding: ... }}` en cards.

**Step 3: Write minimal implementation**

```css
.operation-card {
  appearance: none;
  background: var(--glass-bg-primary);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: clamp(18px, 4.5vw, 28px);
  min-height: clamp(250px, 32vw, 340px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .operation-card {
    min-height: auto;
  }
}
```

```tsx
<motion.button className="operation-card operation-card--morning ...">
```

(remover objeto inline `style={{ ... }}` repetido en cada card)

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/components/operation-selector/OperationSelector.tsx src/components/operation-selector/operation-selector.css
git commit -m "refactor: normalize operation card sizing across breakpoints"
```

### Task 3: TDD para microinteracciones por variante (hover/focus coherente y premium)

**Skills:** `@test-driven-development` `@frontend-design`

**Files:**
- Modify: `src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`
- Modify: `src/components/operation-selector/OperationSelector.tsx:113-515`
- Modify: `src/components/operation-selector/operation-selector.css`

**Step 1: Write the failing test**

```ts
test('cards expose variant classes and semantic hover/focus styles', () => {
  const css = readFileSync(resolve(CSS_PATH), 'utf-8');
  const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');

  expect(tsx).toMatch(/operation-card--morning/);
  expect(tsx).toMatch(/operation-card--night/);
  expect(tsx).toMatch(/operation-card--delivery/);
  expect(tsx).toMatch(/operation-card--supervisor/);

  expect(css).toMatch(/\.operation-card:hover\s*\{[\s\S]*translateY\(-2px\)/);
  expect(css).toMatch(/\.operation-card--morning:hover[\s\S]*border-color:/);
  expect(css).toMatch(/\.operation-card--night:hover[\s\S]*border-color:/);
  expect(css).toMatch(/\.operation-card:focus-visible[\s\S]*box-shadow:/);
  expect(css).toMatch(/@media\s*\(hover:\s*none\)[\s\S]*\.operation-card:hover[\s\S]*transform:\s*none/);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`
Expected: FAIL por falta de variantes y hover/focus detallado.

**Step 3: Write minimal implementation**

```css
.operation-card {
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.operation-card:hover {
  transform: translateY(-2px);
}

.operation-card--morning:hover { border-color: rgba(244, 165, 42, 0.5); }
.operation-card--night:hover { border-color: rgba(10, 132, 255, 0.5); }
.operation-card--delivery:hover { border-color: rgba(16, 185, 129, 0.5); }
.operation-card--supervisor:hover { border-color: rgba(139, 92, 246, 0.5); }

.operation-card:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 3px;
  box-shadow: 0 0 0 4px rgba(10, 132, 255, 0.2);
}

@media (hover: none) {
  .operation-card:hover {
    transform: none;
  }
}
```

```tsx
className="operation-card operation-card--morning cursor-pointer group text-left w-full"
```

(repetir patrón para `--night`, `--delivery`, `--supervisor`)

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/components/operation-selector/OperationSelector.tsx src/components/operation-selector/operation-selector.css
git commit -m "style: add premium card microinteractions by operation variant"
```

### Task 4: Reducir inline styles repetidos (mantenibilidad y coherencia visual)

**Skills:** `@test-driven-development` `@frontend-design`

**Files:**
- Modify: `src/__tests__/ux-audit/operation-selector.test.ts`
- Modify: `src/components/operation-selector/OperationSelector.tsx:65-614`
- Modify: `src/components/operation-selector/operation-selector.css`

**Step 1: Write the failing test**

```ts
test('4.3 — Máximo 32 bloques style={{}} tras extracción a CSS semántico', () => {
  const content = readFileSync(resolve(OP_SELECTOR_PATH), 'utf-8');
  const styleBlocks = content.match(/style=\{\{/g) ?? [];
  expect(styleBlocks.length).toBeLessThanOrEqual(32);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test -- src/__tests__/ux-audit/operation-selector.test.ts`
Expected: FAIL porque el archivo aún excede el nuevo límite.

**Step 3: Write minimal implementation**

```css
.operation-title { font-size: clamp(1.25rem, 5vw, 1.5rem); color: #e1e8ed; }
.operation-description { font-size: clamp(0.75rem, 3vw, 0.875rem); color: #8899a6; }
.operation-action { font-size: clamp(0.75rem, 3vw, 0.875rem); font-weight: 500; }
.operation-action--morning { color: #f4a52a; }
.operation-action--night { color: #0a84ff; }
.operation-action--delivery { color: #10b981; }
.operation-action--supervisor { color: #8b5cf6; }
```

```tsx
<h3 className="font-bold mb-3 operation-title">...</h3>
<p className="mb-6 operation-description">...</p>
<span className="operation-action operation-action--morning">Comenzar</span>
```

**Step 4: Run test to verify it passes**

Run: `npm run test -- src/__tests__/ux-audit/operation-selector.test.ts`
Expected: PASS con reducción real de bloques inline.

**Step 5: Commit**

```bash
git add src/__tests__/ux-audit/operation-selector.test.ts src/components/operation-selector/OperationSelector.tsx src/components/operation-selector/operation-selector.css
git commit -m "refactor: extract repeated inline typography and action styles"
```

### Task 5: Verificación integral (tests, build, preview y checklist visual)

**Skills:** `@verification-before-completion` `@webapp-testing`

**Files:**
- No source changes required unless a check fails.
- Optional evidence artifacts: `/tmp/cashguard-premium-desktop.png`, `/tmp/cashguard-premium-mobile.png`

**Step 1: Run focused regression suite**

```bash
npm run test -- src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/__tests__/ux-audit/operation-selector.test.ts src/__tests__/integration/delivery-view-navigation.test.tsx src/__tests__/ux-audit/glass-morphism.test.ts
```

Expected: PASS total.

**Step 2: Run lint + build**

```bash
npm run lint && npm run build
```

Expected: PASS sin errores.

**Step 3: Restart preview for manual validation**

```bash
npm run preview -- --host 127.0.0.1 --port 4173
```

Expected: servidor activo; validar visual en 390px, 768px, 1366px.

**Step 4: Visual acceptance checklist**

- Logos visibles pero no dominantes en 390px (sin saturar cabecera).
- Tarjetas con altura/padding balanceados en móvil y desktop.
- Hover/focus perceptible y consistente por variante.
- Jerarquía visual clara (título -> descripción -> features -> CTA).

**Step 5: Commit (if no additional fixes needed)**

```bash
git add src/components/operation-selector/OperationSelector.tsx src/components/operation-selector/operation-selector.css src/__tests__/ux-audit/operation-selector-ux-contract.test.ts src/__tests__/ux-audit/operation-selector.test.ts
git commit -m "feat: premium responsive sizing polish for operation selector"
```
