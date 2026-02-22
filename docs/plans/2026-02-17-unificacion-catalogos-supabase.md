# Unificacion de Catalogos Supabase Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unificar sucursales y empleados en una sola fuente (Supabase) para eliminar inconsistencias entre flujos de corte y flujos legacy.

**Architecture:** Se introduce un proveedor central de catalogos y se migra el consumo de componentes legacy para depender del proveedor, no de `src/data/paradise.ts`. El cambio se implementa con TDD estricto (RED-GREEN-REFACTOR) y validacion incremental por modulo para minimizar riesgo operativo.

**Tech Stack:** React, TypeScript, Vite, Vitest, Supabase.

---

### Task 1: Baseline de doble fuente

**Files:**
- Test: `src/hooks/__tests__/useCashCounterOrchestrator.test.ts`
- Test: `src/hooks/__tests__/useEmpleadosSucursal.test.ts`

**Step 1: Write the failing test**
- Agregar test que evidencie que `useCashCounterOrchestrator` depende de `src/data/paradise.ts` en lugar de Supabase.

**Step 2: Run test to verify it fails**
Run: `npx vitest run src/hooks/__tests__/useCashCounterOrchestrator.test.ts -t "fuente unica"`
Expected: FAIL indicando consumo de catalogo estatico.

**Step 3: Write minimal implementation**
- No aplica en esta tarea (solo baseline).

**Step 4: Run test to verify it passes**
- No aplica en esta tarea.

**Step 5: Commit**
```bash
git add src/hooks/__tests__/useCashCounterOrchestrator.test.ts
git commit -m "test: capture dual-source catalog regression"
```

### Task 2: Proveedor unificado de catalogos

**Files:**
- Create: `src/hooks/useCatalogosSucursal.ts`
- Modify: `src/hooks/useEmpleadosSucursal.ts`
- Modify: `src/hooks/useSucursales.ts`
- Test: `src/hooks/__tests__/useCatalogosSucursal.test.ts`

**Step 1: Write the failing test**
- Testear que el proveedor retorna sucursales activas + empleados activos por sucursal desde Supabase.

**Step 2: Run test to verify it fails**
Run: `npx vitest run src/hooks/__tests__/useCatalogosSucursal.test.ts`
Expected: FAIL por hook no implementado.

**Step 3: Write minimal implementation**
- Implementar `useCatalogosSucursal` con carga paralela y manejo consistente de `cargando/error`.

**Step 4: Run test to verify it passes**
Run: `npx vitest run src/hooks/__tests__/useCatalogosSucursal.test.ts`
Expected: PASS.

**Step 5: Commit**
```bash
git add src/hooks/useCatalogosSucursal.ts src/hooks/useEmpleadosSucursal.ts src/hooks/useSucursales.ts src/hooks/__tests__/useCatalogosSucursal.test.ts
git commit -m "feat: add unified supabase catalog provider"
```

### Task 3: Migracion de flujo legacy de personal

**Files:**
- Modify: `src/hooks/useCashCounterOrchestrator.ts`
- Modify: `src/components/cash-counter/StoreSelectionForm.tsx`
- Test: `src/hooks/__tests__/useCashCounterOrchestrator.test.ts`

**Step 1: Write the failing test**
- Testear que `availableEmployees` viene de proveedor unificado, no de `getEmployeesByStore`.

**Step 2: Run test to verify it fails**
Run: `npx vitest run src/hooks/__tests__/useCashCounterOrchestrator.test.ts -t "supabase"`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Sustituir import de `getEmployeesByStore` por consumo del proveedor unificado.

**Step 4: Run test to verify it passes**
Run: `npx vitest run src/hooks/__tests__/useCashCounterOrchestrator.test.ts`
Expected: PASS.

**Step 5: Commit**
```bash
git add src/hooks/useCashCounterOrchestrator.ts src/components/cash-counter/StoreSelectionForm.tsx src/hooks/__tests__/useCashCounterOrchestrator.test.ts
git commit -m "refactor: migrate legacy employee source to unified provider"
```

### Task 4: Guardrail de UX en CorteInicio

**Files:**
- Modify: `src/components/corte/CorteInicio.tsx`
- Modify: `src/components/corte/__tests__/CorteInicio.test.tsx`

**Step 1: Write the failing test**
- `10.7`: prefill + catalogo multiple debe iniciar sin filtro.

**Step 2: Run test to verify it fails**
Run: `npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx -t "10.7"`
Expected: FAIL.

**Step 3: Write minimal implementation**
- Limpiar valor precargado una vez si coincide con catalogo multiple.

**Step 4: Run test to verify it passes**
Run: `npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx -t "10.7|11.3|11.4"`
Expected: PASS.

**Step 5: Commit**
```bash
git add src/components/corte/CorteInicio.tsx src/components/corte/__tests__/CorteInicio.test.tsx
git commit -m "fix: avoid initial employee datalist filtering from cached cashier"
```

### Task 5: Verificacion integral

**Files:**
- Modify: `docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/00_README.md`
- Modify: `docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/01_Diagnostico_Tecnico.md`
- Modify: `docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/02_Plan_Modular_TDD.md`

**Step 1: Write the failing test**
- No aplica (tarea de verificacion/documentacion).

**Step 2: Run test to verify it fails**
- No aplica.

**Step 3: Write minimal implementation**
- Actualizar estado final, evidencia y decisiones.

**Step 4: Run test to verify it passes**
Run:
- `npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx src/components/corte/__tests__/CorteOrquestador.test.tsx`
- `npm run build`
Expected: PASS.

**Step 5: Commit**
```bash
git add docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217
# agregar tambien archivos de codigo/test validados
git commit -m "docs: close dual-source investigation and execution evidence"
```
