# Phase 1 CashCounter UX Hardening Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Elevar la vista de conteo guiado (Fase 1) a estándar profesional corrigiendo microcopy, accesibilidad, jerarquía visual y altura/layout sin alterar lógica operativa.

**Architecture:** Se aplicará una estrategia TDD quirúrgica: contratos UI específicos para copy/semántica/layout, luego cambios mínimos en `GuidedFieldView`, `GuidedProgressIndicator`, `CorteStatusBanner` y `CashCounter`. Se evita refactor masivo de estilos globales; solo ajustes de alto impacto y bajo riesgo en componentes objetivo.

**Tech Stack:** React 18 + TypeScript, Vitest + Testing Library, Tailwind/CSS utilitario existente.

---

### Task 1: Contratos RED para copy y accesibilidad de progreso/banner

**Files:**
- Create: `src/components/ui/__tests__/GuidedProgressIndicator.test.tsx`
- Modify: `src/components/corte/__tests__/CorteStatusBanner.test.tsx`
- Test: `src/components/ui/__tests__/GuidedProgressIndicator.test.tsx`
- Test: `src/components/corte/__tests__/CorteStatusBanner.test.tsx`

**Step 1: Write the failing test**

`GuidedProgressIndicator.test.tsx` debe cubrir:
- Render de `instructionText` visible para el usuario.
- Fallback con `currentFieldLabel` si no hay instrucción explícita.

`CorteStatusBanner.test.tsx` agregar caso:
- Contenedor con `role="status"` y `aria-live` (`polite` por defecto, `assertive` en error).

**Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/components/ui/__tests__/GuidedProgressIndicator.test.tsx src/components/corte/__tests__/CorteStatusBanner.test.tsx
```
Expected: FAIL por ausencia de bloque de instrucción en progress y semántica ARIA faltante en banner.

**Step 3: Write minimal implementation**

- En `src/components/ui/GuidedProgressIndicator.tsx`:
  - usar `currentFieldLabel` + `instructionText`.
  - renderizar bloque de instrucción visible (`guided-progress-instructions`).
- En `src/components/corte/CorteStatusBanner.tsx`:
  - añadir `role`, `aria-live`, `aria-atomic` al contenedor.

**Step 4: Run test to verify it passes**

Run:
```bash
npx vitest run src/components/ui/__tests__/GuidedProgressIndicator.test.tsx src/components/corte/__tests__/CorteStatusBanner.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/ui/GuidedProgressIndicator.tsx src/components/ui/__tests__/GuidedProgressIndicator.test.tsx src/components/corte/CorteStatusBanner.tsx src/components/corte/__tests__/CorteStatusBanner.test.tsx
git commit -m "test(ux): enforce progress instruction visibility and live status semantics"
```

### Task 2: Contratos RED para layout compacto y microcopy natural en campo guiado

**Files:**
- Create: `src/__tests__/unit/components/guided-field-layout-contract.test.ts`
- Modify: `src/__tests__/integration/cash-counting/GuidedFieldView.integration.test.tsx`
- Test: `src/__tests__/unit/components/guided-field-layout-contract.test.ts`
- Test: `src/__tests__/integration/cash-counting/GuidedFieldView.integration.test.tsx`

**Step 1: Write the failing test**

- Test de contrato estático:
  - no usar `pb-24`.
  - no usar footer absoluto `absolute bottom-0 left-0 right-0`.
- Test de integración:
  - placeholder no debe contener patrón gramatical incorrecto (`¿Cuántos un centavo?`).
  - placeholder debe ser copy neutral profesional (`Ingresa la cantidad`).

**Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/__tests__/unit/components/guided-field-layout-contract.test.ts src/__tests__/integration/cash-counting/GuidedFieldView.integration.test.tsx
```
Expected: FAIL por layout viejo y copy actual.

**Step 3: Write minimal implementation**

- En `src/components/cash-counting/GuidedFieldView.tsx`:
  - reemplazar placeholder por copy neutral profesional.
  - reducir dimensiones de imagen/input para compactar desktop.
  - reemplazar footer absoluto por bloque normal en flujo (`mt-4` + `border-t`).
  - ajustar `padding-bottom` para remover espacio muerto.

**Step 4: Run test to verify it passes**

Run:
```bash
npx vitest run src/__tests__/unit/components/guided-field-layout-contract.test.ts src/__tests__/integration/cash-counting/GuidedFieldView.integration.test.tsx
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/cash-counting/GuidedFieldView.tsx src/__tests__/integration/cash-counting/GuidedFieldView.integration.test.tsx src/__tests__/unit/components/guided-field-layout-contract.test.ts
git commit -m "fix(ux): compact guided field layout and normalize phase1 microcopy"
```

### Task 3: Contrato RED para contenedor táctil/scroll seguro en CashCounter

**Files:**
- Modify: `src/components/__tests__/CashCounter.connectionStatus.static.test.ts`
- Modify: `src/components/CashCounter.tsx`
- Test: `src/components/__tests__/CashCounter.connectionStatus.static.test.ts`

**Step 1: Write the failing test**

Agregar pruebas estáticas:
- prohibir `touchAction: 'none'`.
- exigir `overflow-y-auto` en shell principal.

**Step 2: Run test to verify it fails**

Run:
```bash
npx vitest run src/components/__tests__/CashCounter.connectionStatus.static.test.ts
```
Expected: FAIL por configuración actual.

**Step 3: Write minimal implementation**

- En `src/components/CashCounter.tsx`:
  - cambiar shell a scroll vertical seguro (`overflow-y-auto overflow-x-hidden`).
  - eliminar `touchAction: 'none'` y mantener comportamiento suave móvil.

**Step 4: Run test to verify it passes**

Run:
```bash
npx vitest run src/components/__tests__/CashCounter.connectionStatus.static.test.ts
```
Expected: PASS.

**Step 5: Commit**

```bash
git add src/components/CashCounter.tsx src/components/__tests__/CashCounter.connectionStatus.static.test.ts
git commit -m "fix(ux): harden cashcounter shell scrolling and touch behavior"
```

### Task 4: Verificación final de regresión

**Files:**
- Test-only

**Step 1: Run focused regression suite**

Run:
```bash
npx vitest run src/components/ui/__tests__/GuidedProgressIndicator.test.tsx src/components/corte/__tests__/CorteStatusBanner.test.tsx src/__tests__/unit/components/guided-field-layout-contract.test.ts src/__tests__/integration/cash-counting/GuidedFieldView.integration.test.tsx src/components/__tests__/CashCounter.connectionStatus.static.test.ts
```
Expected: PASS.

**Step 2: Run quality gates**

Run:
```bash
npm run lint
npm run build
```
Expected: PASS.

**Step 3: Restart dev server**

Run:
```bash
lsof -tiTCP:5173 -sTCP:LISTEN | xargs kill -9 2>/dev/null || true
npm run dev
```
Expected: servidor arriba en `http://localhost:5173`.

**Step 4: Commit**

```bash
git add -A
git commit -m "feat(ux): phase1 counting polish with accessibility and compact layout"
```

