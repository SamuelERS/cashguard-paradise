# CSS Governance Hardening (CashCounter) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminar deuda CSS global crítica (`!important` excesivo y selectores frágiles) en el módulo de conteo, manteniendo el mismo comportamiento funcional y mejorando consistencia visual profesional.

**Architecture:** Aplicar TDD con contratos estáticos de estilos para forzar una arquitectura CSS más robusta y predecible. Primero se define presupuesto de `!important` y prohibiciones de selectores frágiles, luego se migra a selectores estables y scope explícito por módulo (`cashcounter-shell`) sin tocar lógica de dominio. Cada tarea cierra con verificación local (`vitest`, `lint`, `build`).

**Tech Stack:** React 18 + TypeScript, Vitest, CSS modular por features (`src/styles/features`), Tailwind utilities existentes.

---

### Task 1: Contrato RED de gobernanza CSS (deuda visible y medible)

**Files:**
- Create: `src/__tests__/unit/styles/css-governance-contract.test.ts`
- Test: `src/__tests__/unit/styles/css-governance-contract.test.ts`

**Step 1: Write the failing test**

Crear pruebas estáticas con `readFileSync` para:
- prohibir selectores frágiles en `src/styles/features/cash-counter-desktop-alignment.css`:
  - `[class*="..."]`
  - `> div:first-child` acoplado a estructura incidental.
- prohibir scope global peligroso en `src/styles/features/glass-morphism-coherence.css`:
  - `[class*="glass-"]`
  - selectores descendentes globales con `*` sobre contenedores de módulo.
- fijar presupuesto inicial de `!important` para `cash-counter-desktop-alignment.css` (debe bajar respecto al estado actual).

Snippet base sugerido:
```ts
const importantCount = (css.match(/!important/g) ?? []).length;
expect(importantCount).toBeLessThanOrEqual(40);
expect(css).not.toMatch(/\[class\*=/);
expect(css).not.toMatch(/>\s*div:first-child/);
```

**Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/__tests__/unit/styles/css-governance-contract.test.ts
```
Expected: FAIL por uso actual de selectores frágiles y exceso de `!important`.

**Step 3: Write minimal implementation**

No implementar aún (solo RED para evidenciar deuda).

**Step 4: Run test to verify it fails consistently**

Run:
```bash
npx vitest run src/__tests__/unit/styles/css-governance-contract.test.ts
```
Expected: FAIL estable y reproducible.

**Step 5: Commit**

```bash
git add src/__tests__/unit/styles/css-governance-contract.test.ts
git commit -m "test(styles): add css governance contract for fragile selectors and important budget"
```

### Task 2: Scope estable en componentes (base para reemplazar selectores frágiles)

**Files:**
- Modify: `src/components/CashCounter.tsx`
- Modify: `src/components/cash-counting/GuidedFieldView.tsx`
- Modify: `src/components/ui/GuidedProgressIndicator.tsx`
- Test: `src/__tests__/unit/styles/css-governance-contract.test.ts`

**Step 1: Write the failing test**

Extender contrato para exigir clases/scope estables en markup:
- `cashcounter-shell`
- `cashcounter-field-row`
- `cashcounter-status-banner-slot`

Snippet sugerido:
```ts
expect(tsx).toMatch(/cashcounter-shell/);
expect(tsx).toMatch(/cashcounter-field-row/);
```

**Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/__tests__/unit/styles/css-governance-contract.test.ts
```
Expected: FAIL (clases nuevas aún no existen).

**Step 3: Write minimal implementation**

Agregar clases de scope en componentes, sin alterar flujo:
- contenedor raíz de `CashCounter` con `cashcounter-shell`.
- fila input+botón en `GuidedFieldView` con `cashcounter-field-row`.
- slot de banner de estado con `cashcounter-status-banner-slot`.

**Step 4: Run test to verify it passes**

Run:
```bash
npx vitest run src/__tests__/unit/styles/css-governance-contract.test.ts
```
Expected: PASS en este subcontrato.

**Step 5: Commit**

```bash
git add src/components/CashCounter.tsx src/components/cash-counting/GuidedFieldView.tsx src/components/ui/GuidedProgressIndicator.tsx src/__tests__/unit/styles/css-governance-contract.test.ts
git commit -m "refactor(styles): add stable cashcounter scope classes for robust styling"
```

### Task 3: Refactor quirúrgico de `cash-counter-desktop-alignment.css`

**Files:**
- Modify: `src/styles/features/cash-counter-desktop-alignment.css`
- Modify: `src/__tests__/unit/styles/css-governance-contract.test.ts`
- Test: `src/__tests__/unit/styles/css-governance-contract.test.ts`

**Step 1: Write the failing test**

Endurecer contrato para este archivo:
- no `[class*="..."]`
- no `.cash-counter-container .flex.gap-2 ...`
- no `> div:first-child`
- reducir `!important` máximo a presupuesto intermedio (ej. `<= 24`).

**Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/__tests__/unit/styles/css-governance-contract.test.ts -t "cash-counter-desktop-alignment"
```
Expected: FAIL por reglas legacy.

**Step 3: Write minimal implementation**

Reemplazar selectores frágiles por selectores explícitos de scope:
- `.cashcounter-shell .cashcounter-field-row`
- `.cashcounter-shell .cashcounter-field-input`
- `.cashcounter-shell .cashcounter-field-confirm`

Eliminar reglas por substring y estructura incidental.
Mantener visual parity (no cambio de lógica, no cambio de flujo).

**Step 4: Run test to verify it passes**

Run:
```bash
npx vitest run src/__tests__/unit/styles/css-governance-contract.test.ts -t "cash-counter-desktop-alignment"
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/styles/features/cash-counter-desktop-alignment.css src/__tests__/unit/styles/css-governance-contract.test.ts
git commit -m "refactor(styles): remove brittle desktop alignment selectors and cut important usage"
```

### Task 4: Refactor quirúrgico de `glass-morphism-coherence.css`

**Files:**
- Modify: `src/styles/features/glass-morphism-coherence.css`
- Modify: `src/__tests__/unit/styles/css-governance-contract.test.ts`
- Test: `src/__tests__/unit/styles/css-governance-contract.test.ts`

**Step 1: Write the failing test**

Agregar contrato:
- prohibir `[class*="glass-"]` global.
- prohibir `*` descendente global en scope del módulo.
- exigir scope por módulo: `.cashcounter-shell ...`.

**Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/__tests__/unit/styles/css-governance-contract.test.ts -t "glass-morphism"
```
Expected: FAIL.

**Step 3: Write minimal implementation**

Acotar reglas glass a elementos explícitos usados por CashCounter:
- `.cashcounter-shell .glass-morphism-panel`
- `.cashcounter-shell .guided-progress-container`
- `.cashcounter-shell .cash-counter-container`

Eliminar comodines globales y reglas de alto riesgo colateral.

**Step 4: Run test to verify it passes**

Run:
```bash
npx vitest run src/__tests__/unit/styles/css-governance-contract.test.ts -t "glass-morphism"
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/styles/features/glass-morphism-coherence.css src/__tests__/unit/styles/css-governance-contract.test.ts
git commit -m "refactor(styles): scope glass coherence rules to cashcounter module"
```

### Task 5: Presupuesto final de `!important` + verificación integral

**Files:**
- Modify: `src/__tests__/unit/styles/css-governance-contract.test.ts`
- Create: `docs/qa/css-governance-cashcounter-checklist.md`
- Test: `src/__tests__/unit/styles/css-governance-contract.test.ts`

**Step 1: Write the failing test**

Definir presupuesto final estricto:
- `cash-counter-desktop-alignment.css` `!important <= 12`
- `glass-morphism-coherence.css` `!important <= 10`

**Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/__tests__/unit/styles/css-governance-contract.test.ts
```
Expected: FAIL hasta completar limpieza final.

**Step 3: Write minimal implementation**

Ajustar reglas restantes para cumplir presupuesto sin regresión visual.
Documentar checklist QA visual en:
`docs/qa/css-governance-cashcounter-checklist.md`
- desktop (1366x768)
- tablet (768x1024)
- móvil (390x844)
- banner sync, progress, input row, footer actions.

**Step 4: Run tests to verify pass**

Run:
```bash
npx vitest run src/__tests__/unit/styles/css-governance-contract.test.ts
npx vitest run src/components/ui/__tests__/GuidedProgressIndicator.test.tsx src/components/corte/__tests__/CorteStatusBanner.test.tsx src/__tests__/integration/cash-counting/GuidedFieldView.integration.test.tsx src/components/__tests__/CashCounter.connectionStatus.static.test.ts
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/__tests__/unit/styles/css-governance-contract.test.ts docs/qa/css-governance-cashcounter-checklist.md src/styles/features/cash-counter-desktop-alignment.css src/styles/features/glass-morphism-coherence.css
git commit -m "chore(styles): enforce css governance budget and remove global fragility"
```

### Task 6: Gate final de entrega

**Files:**
- Verification-only

**Step 1: Run quality gates**

Run:
```bash
npm run lint
npm run build
```
Expected: PASS.

**Step 2: Reiniciar servidor local**

Run:
```bash
lsof -tiTCP:5173 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
npm run dev
```
Expected: servidor arriba en `http://localhost:5173`.

**Step 3: Commit final de integración**

```bash
git add -A
git commit -m "feat(ux): harden cashcounter css architecture with scoped selectors and low entropy styles"
```

