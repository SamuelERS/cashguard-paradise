# DIRM: Módulos C y D — CorteInicio + CorteOrquestador

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Crear `CorteInicio.tsx` y `CorteOrquestador.tsx` (greenfield) con sus respectivos tests, completando los Módulos C y D del caso Investigacion_Doble_Fuente_Catalogos_20260217. El foco es garantizar que el catálogo de empleados viene 100% de Supabase y que el campo cajero precargado no filtra la datalist.

**Architecture:** `CorteOrquestador` es el componente conectado (wires hooks Supabase → data). `CorteInicio` es presentacional puro (recibe data por props). `CorteStatusBanner` ya existe y `CorteOrquestador` lo monta directamente. TDD estricto: Task 1 y Task 3 son los tests primero (RED), Task 2 y Task 4 son las implementaciones (GREEN).

**Tech Stack:** React 18 + TypeScript + Vitest + Testing Library. Hooks: `useSucursales`, `useEmpleadosSucursal` (Supabase). Sin `paradise.ts` en ningún path nuevo.

---

## Contexto de Investigación (Fase 1 DIRM)

### Estado actual (post Módulos A + B)

| Componente | Estado | Fuente de datos |
|---|---|---|
| `useCashCounterOrchestrator.ts` | ✅ Migrado | Supabase (`useSucursales` + `useEmpleadosSucursal`) |
| `StoreSelectionForm.tsx` | ✅ Migrado | Props dinámicas desde orquestador |
| `CorteStatusBanner.tsx` | ✅ Existe | Presentacional (estadoConexion, estadoSync) |
| `CorteInicio.tsx` | ❌ No existe | **Greenfield — Módulo C** |
| `CorteOrquestador.tsx` | ❌ No existe | **Greenfield — Módulo C** |
| `CorteInicio.test.tsx` | ❌ No existe | **Greenfield — Módulo C** |
| `CorteOrquestador.test.tsx` | ❌ No existe | **Módulo D** |

### Problema específico que resuelve CorteInicio

Cuando un empleado está precargado desde localStorage en el campo "cajero", el input inicia prefillado con ese valor. En la implementación naïve, el filtro del input restringe la datalist a solo ese empleado — **"la datalist muestra solo 1 empleado"**. La solución es disociar: el valor del input controla lo que está seleccionado, pero la datalist siempre muestra el catálogo completo de la sucursal desde Supabase.

La acción "Mostrar todos" es un botón/link adicional que permite al usuario expandir explícitamente la datalist completa (util cuando el input ya tiene un valor y el browser colapsa las sugerencias).

### Hooks Supabase disponibles

- `useSucursales()` → `{ sucursales: Sucursal[], loading, error }`
- `useEmpleadosSucursal(sucursalId: string | null)` → `{ empleados: Employee[], loading, error }`
- `useCorteSesion(sucursalId)` → `{ iniciarCorte, guardarProgreso, finalizarCorte, estadoConexion, estadoSync, ultimaSync, pendientes, ... }`

---

## Guía Arquitectónica (Fase 2 DIRM)

### CorteInicio.tsx — Contrato de interfaz

**Responsabilidad:** Formulario de inicio de corte. Presentacional puro — sin llamadas a Supabase ni localStorage.

**Props que debe recibir:**

| Prop | Tipo | Descripción |
|---|---|---|
| `sucursalId` | `string` | ID de la sucursal activa |
| `empleadosDeSucursal` | `Employee[]` | Lista COMPLETA de empleados (de Supabase) |
| `empleadoPrecargado` | `Employee \| null` | Empleado desde localStorage (puede ser null) |
| `isLoadingEmpleados` | `boolean` | Estado de carga del catálogo |
| `errorEmpleados` | `string \| null` | Error al cargar catálogo |
| `onConfirmar` | `(cajero: Employee, testigo: Employee) => void` | Callback al confirmar selección |

**Comportamiento esperado:**

1. **Input cajero:** Si `empleadoPrecargado` no es null, el input inicia con `empleadoPrecargado.nombre`. De lo contrario, vacío.
2. **Datalist cajero:** Siempre lista TODOS los empleados en `empleadosDeSucursal` — independientemente del valor actual del input.
3. **Acción "Mostrar todos":** Un botón o link visible que, al hacer clic, fuerza la datalist a mostrarse con el catálogo completo. Útil cuando el browser colapsa las sugerencias tras una selección.
4. **Input testigo:** Lista los mismos empleados de `empleadosDeSucursal`, pero excluye al empleado actualmente seleccionado como cajero (para prevenir cajero = testigo).
5. **Validación:** El formulario solo puede confirmar si cajero ≠ testigo y ambos son empleados válidos del catálogo.
6. **Loading/Error:** Cuando `isLoadingEmpleados` es true, los inputs están deshabilitados. Cuando `errorEmpleados` no es null, se muestra mensaje de error.
7. **Submit:** Llama `onConfirmar(cajero, testigo)` con los objetos `Employee` seleccionados.

### CorteOrquestador.tsx — Contrato de interfaz

**Responsabilidad:** Orquestador conectado. Wires hooks de Supabase → data props para CorteInicio. Muestra CorteStatusBanner para estado de sincronización.

**Props que debe recibir:**

| Prop | Tipo | Descripción |
|---|---|---|
| `sucursalId` | `string` | ID de la sucursal (desde contexto/route/parent) |
| `onCorteIniciado` | `(corteId: string) => void` | Callback cuando el corte arranca en Supabase |

**Comportamiento esperado:**

1. Llama `useEmpleadosSucursal(sucursalId)` para obtener el catálogo dinámico.
2. Lee localStorage para detectar `empleadoPrecargado` (usando la misma key que ya existe en el proyecto — ej. el cajero del último turno).
3. Renderiza `<CorteStatusBanner>` con `estadoConexion`, `estadoSync`, `ultimaSync`, `pendientes` desde `useCorteSesion`.
4. Renderiza `<CorteInicio>` pasando `empleadosDeSucursal`, `empleadoPrecargado`, `isLoadingEmpleados`, `errorEmpleados`, `onConfirmar`.
5. En `onConfirmar(cajero, testigo)`: llama `iniciarCorte(sucursalId, { cajero, testigo })` de `useCorteSesion`.
6. Cuando `iniciarCorte` resuelve exitosamente, llama `onCorteIniciado(corteId)`.

**No hace:**
- No duplica lógica de `useCashCounterOrchestrator` (ese hook ya está migrado).
- No importa ni usa `paradise.ts`.

---

## Descomposición Modular (Fase 3 DIRM)

### Task 1: Tests de CorteInicio — RED

**Archivos:**
- Crear: `src/components/corte/__tests__/CorteInicio.test.tsx`

**Propósito:** Escribir los tests ANTES de que exista `CorteInicio.tsx`. Deben fallar con "Cannot find module" o equivalente. TDD puro.

**Escenarios a cubrir (7 tests):**

**Suite A — Prefill básico:**
- A1: Sin empleadoPrecargado → input cajero vacío, datalist contiene todos los empleados de `empleadosDeSucursal`.
- A2: Con empleadoPrecargado → input cajero muestra nombre del empleado precargado; la datalist sigue conteniendo TODOS los empleados (no solo el precargado).

**Suite B — Catálogo múltiple:**
- B1: Con 3+ empleados en `empleadosDeSucursal` → la datalist del cajero lista los 3. (Verifica que no filtra.)
- B2: Con empleado precargado Y 3 empleados en catálogo → datalist cajero sigue mostrando los 3.

**Suite C — Acción "Mostrar todos":**
- C1: El botón/link "Mostrar todos" existe en el DOM.
- C2: Al hacer clic en "Mostrar todos", la datalist del cajero se abre/expande mostrando el catálogo completo.

**Suite D — Validación y submit:**
- D1: Seleccionar mismo empleado para cajero y testigo → botón confirmar deshabilitado o muestra error "cajero y testigo no pueden ser la misma persona".
- D2: Seleccionar cajero distinto al testigo → `onConfirmar` se llama con los objetos Employee correctos al submit.

**Nota TDD:** Estos 7 tests deben correr y fallar antes de escribir CorteInicio.tsx. Confirmar con:
```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx
```
Esperado: todos fallan (módulo no existe o tests failing por ausencia del componente).

**Step 1: Crear el archivo de test** con los 7 escenarios descritos arriba, mockeando las props de manera simple (arrays `Employee[]` hardcodeados como fixtures, callbacks jest/vi.fn()).

**Step 2: Ejecutar para confirmar RED**
```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx
```
Esperado: FAIL — componente no existe.

**Step 3: Commit RED**
```bash
git add src/components/corte/__tests__/CorteInicio.test.tsx
git commit -m "test(corte): RED — CorteInicio 7 scenarios (prefill, datalist múltiple, mostrar todos, validación)"
```

---

### Task 2: Implementación CorteInicio.tsx — GREEN

**Archivos:**
- Crear: `src/components/corte/CorteInicio.tsx`

**Props interface** (según contrato en Guía Arquitectónica arriba):
- `sucursalId: string`
- `empleadosDeSucursal: Employee[]`
- `empleadoPrecargado: Employee | null`
- `isLoadingEmpleados: boolean`
- `errorEmpleados: string | null`
- `onConfirmar: (cajero: Employee, testigo: Employee) => void`

**Implementación mínima para pasar los 7 tests:**

1. **Estado interno:** `cajeroBusqueda: string` (texto del input), `testigoBusqueda: string`, `mostrarTodos: boolean`.

2. **Input cajero:**
   - `value={cajeroBusqueda}`
   - `onChange` actualiza `cajeroBusqueda`
   - `list="cajero-list"` apunta a `<datalist id="cajero-list">`
   - Inicializa `cajeroBusqueda` con `empleadoPrecargado?.nombre ?? ''` en el primer render.

3. **Datalist cajero** (`<datalist id="cajero-list">`):
   - Mapea `empleadosDeSucursal` completo — NO filtra por `cajeroBusqueda`.
   - Cada `<option value={emp.nombre} />`.

4. **Botón "Mostrar todos":**
   - Al click: llama `inputRef.current?.focus()` + `setMostrarTodos(true)` (o limpiar el valor temporalmente para forzar el browser a abrir la datalist).
   - Siempre visible, no condicional.

5. **Input testigo:**
   - Similar al cajero pero filtra `empleadosDeSucursal.filter(e => e.id !== cajeroSeleccionado?.id)` para la datalist.

6. **Resolución de Employee desde string:**
   - `cajeroSeleccionado = empleadosDeSucursal.find(e => e.nombre === cajeroBusqueda)`.
   - `testigoSeleccionado = empleadosDeSucursal.find(e => e.nombre === testigoBusqueda)`.

7. **Validación submit:**
   - `const mismoEmpleado = cajeroSeleccionado?.id === testigoSeleccionado?.id && cajeroSeleccionado != null`.
   - Botón confirmar: `disabled={mismoEmpleado || !cajeroSeleccionado || !testigoSeleccionado}`.
   - `onSubmit`: llama `onConfirmar(cajeroSeleccionado, testigoSeleccionado)`.

8. **Loading/Error states:**
   - Si `isLoadingEmpleados`: inputs deshabilitados.
   - Si `errorEmpleados`: render mensaje de error visible.

**Step 1: Implementar CorteInicio.tsx** con el contrato arriba.

**Step 2: Ejecutar tests para confirmar GREEN**
```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx
```
Esperado: 7/7 passing.

**Step 3: TypeScript check**
```bash
npx tsc --noEmit
```
Esperado: 0 errors.

**Step 4: Commit GREEN**
```bash
git add src/components/corte/CorteInicio.tsx
git commit -m "feat(corte): CorteInicio — datalist completo, prefill disociado, acción mostrar-todos"
```

---

### Task 3: Tests de CorteOrquestador — RED

**Archivos:**
- Crear: `src/components/corte/__tests__/CorteOrquestador.test.tsx`

**Propósito:** Tests ANTES de que exista `CorteOrquestador.tsx`. Deben fallar.

**Mocks necesarios:**
- `vi.mock('../../corte/CorteInicio')` — mock simple que renderiza `<div data-testid="corte-inicio" />`
- `vi.mock('../../corte/CorteStatusBanner')` — mock simple
- `vi.mock('../../../hooks/useEmpleadosSucursal')` — devuelve empleados fixtures
- `vi.mock('../../../hooks/useCorteSesion')` — devuelve `iniciarCorte` mock + estado sync

**Escenarios a cubrir (5 tests):**

- E1: Renderiza `CorteStatusBanner` con props de estado de conexión/sync.
- E2: Renderiza `CorteInicio` con `empleadosDeSucursal` del hook mock.
- E3: Pasa `empleadoPrecargado` a `CorteInicio` cuando localStorage tiene un valor guardado.
- E4: Cuando `CorteInicio` llama `onConfirmar`, `CorteOrquestador` llama `iniciarCorte` del hook `useCorteSesion`.
- E5: Cuando `iniciarCorte` resuelve, `onCorteIniciado` del prop es llamado con el `corteId`.

**Step 1: Crear el archivo de test** con los 5 escenarios.

**Step 2: Ejecutar para confirmar RED**
```bash
npx vitest run src/components/corte/__tests__/CorteOrquestador.test.tsx
```
Esperado: FAIL.

**Step 3: Commit RED**
```bash
git add src/components/corte/__tests__/CorteOrquestador.test.tsx
git commit -m "test(corte): RED — CorteOrquestador 5 scenarios (banner, empleados, prefill, iniciarCorte)"
```

---

### Task 4: Implementación CorteOrquestador.tsx — GREEN

**Archivos:**
- Crear: `src/components/corte/CorteOrquestador.tsx`

**Props interface:**
- `sucursalId: string`
- `onCorteIniciado: (corteId: string) => void`

**Implementación mínima:**

1. **Hooks a usar:**
   - `const { empleados, loading, error } = useEmpleadosSucursal(sucursalId)`
   - `const { iniciarCorte, estadoConexion, estadoSync, ultimaSync, pendientes } = useCorteSesion(sucursalId)`

2. **Leer localStorage para prefill:**
   - Buscar la key de empleado precargado (verificar qué key usa el proyecto actualmente — puede ser `lastCashier` o similar).
   - Resolver el `Employee` completo buscando en `empleados` por id/nombre.

3. **Handler `handleConfirmar`:**
   - `async (cajero: Employee, testigo: Employee) => void`
   - Llama `const corteId = await iniciarCorte(sucursalId, { cajero, testigo })`
   - Llama `onCorteIniciado(corteId)`

4. **Render:**
   ```
   <CorteStatusBanner
     estadoConexion={estadoConexion}
     estadoSync={estadoSync}
     ultimaSync={ultimaSync}
     pendientes={pendientes}
   />
   <CorteInicio
     sucursalId={sucursalId}
     empleadosDeSucursal={empleados}
     empleadoPrecargado={empleadoPrecargado}
     isLoadingEmpleados={loading}
     errorEmpleados={error}
     onConfirmar={handleConfirmar}
   />
   ```

**Step 1: Implementar CorteOrquestador.tsx.**

**Step 2: Ejecutar tests para confirmar GREEN**
```bash
npx vitest run src/components/corte/__tests__/CorteOrquestador.test.tsx
```
Esperado: 5/5 passing.

**Step 3: TypeScript check**
```bash
npx tsc --noEmit
```

**Step 4: Commit GREEN**
```bash
git add src/components/corte/CorteOrquestador.tsx
git commit -m "feat(corte): CorteOrquestador — wires useSucursales + useEmpleadosSucursal + useCorteSesion"
```

---

### Task 5: Módulo D — Verificación de Release

**Step 1: Suite completa de tests de corte en verde**
```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx src/components/corte/__tests__/CorteOrquestador.test.tsx
```
Esperado: todos passing.

**Step 2: Build limpio**
```bash
npm run build
```
Esperado: 0 errores TypeScript, 0 errores Vite.

**Step 3: Smoke manual en localhost:5173**

Verificar en navegador:
- [ ] Catálogo completo visible en campo cajero y campo testigo (no solo 1 sugerencia).
- [ ] Con empleado precargado: datalist sigue mostrando todos los empleados de la sucursal.
- [ ] Acción "Mostrar todos" funciona: expande datalist visualmente.
- [ ] Sin divergencia entre sucursales/empleados respecto a Supabase.
- [ ] Flujo legacy (CashCounter con `useCashCounterOrchestrator`) también muestra sucursales/empleados desde Supabase (no desde `paradise.ts`).

**Step 4: Commit de cierre de módulo D**
```bash
git add -p
git commit -m "chore(corte): módulo D verificado — build limpio, suite verde, catálogo unificado Supabase"
```

---

## Criterio de Cierre del Caso

Una vez completados los 5 tasks arriba:

1. Confirmar que `paradise.ts` no es importado en ningún archivo de flujo productivo de empleados/sucursales:
   ```bash
   grep -r "paradise" src --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".test."
   ```
   Esperado: solo imports en tests (como fixtures) o imports que no son para catálogos de empleados/sucursales.

2. Actualizar `docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/00_README.md`:
   - Módulos C y D: `⏳ Pendiente` → `✅ Completado`
   - Estado general: `EN_PROGRESO` → `COMPLETADO`
   - Fecha actualización: 2026-02-23

3. Mover carpeta a `docs/04_desarrollo/CASOS-COMPLETOS/Caso_Investigacion_Doble_Fuente_Catalogos_20260217_COMPLETADO/`

---

## Resultado esperado

- `CorteInicio.tsx`: presentacional, datalist disociado del prefill ✅
- `CorteOrquestador.tsx`: conectado a Supabase, sin `paradise.ts` ✅
- `CorteInicio.test.tsx`: 7 tests verdes ✅
- `CorteOrquestador.test.tsx`: 5 tests verdes ✅
- Build limpio ✅
- Sin consumo productivo de catálogos estáticos ✅
