# DIRM V2: Módulos C y D — CorteInicio + CorteOrquestador

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Crear `CorteInicio.tsx` y `CorteOrquestador.tsx` (greenfield) con sus respectivos tests, completando los Módulos C y D del caso Investigacion_Doble_Fuente_Catalogos_20260217. El foco es garantizar que el catálogo de empleados viene 100% de Supabase y que el campo cajero precargado no filtra la datalist.

**Architecture:** `CorteOrquestador` es el componente conectado (wires hooks Supabase → data). `CorteInicio` es presentacional puro (recibe data por props). TDD estricto: Task 1 y Task 3 son los tests primero (RED), Task 2 y Task 4 son las implementaciones (GREEN). Task 5 integra en Index.tsx (evita código muerto).

**Tech Stack:** React 18 + TypeScript + Vitest + Testing Library. Hooks: `useSucursales`, `useEmpleadosSucursal` (Supabase). Sin `paradise.ts` en ningún path nuevo.

---

## Correcciones V1 → V2

| # | Error V1 | Corrección V2 | Archivo afectado |
|---|----------|---------------|------------------|
| 1 | `useSucursales()` → `{ sucursales, loading, error }` | → `{ sucursales, cargando, error, recargar }` | `useSucursales.ts:6-11` |
| 2 | `useEmpleadosSucursal()` → `{ empleados: Employee[], loading, error }` | → `{ empleados: EmpleadoSucursal[], cargando, error, recargar }` | `useEmpleadosSucursal.ts:10-15` |
| 3 | `useCorteSesion()` expone `estadoConexion, estadoSync, ultimaSync, pendientes` | NO los expone. Retorna: `{ estado, corte_actual, intento_actual, iniciarCorte, guardarProgreso, finalizarCorte, abortarCorte, reiniciarIntento, recuperarSesion, cargando, error }` | `useCorteSesion.ts:640-652`, `auditoria.ts:225-248` |
| 4 | `iniciarCorte(sucursalId, { cajero, testigo })` — firma posicional | `iniciarCorte(params: IniciarCorteParams)` — objeto único | `auditoria.ts:196-205` |
| 5 | `iniciarCorte` retorna `string` (corteId) | Retorna `Promise<Corte>` — usar `corte.id` para ID | `auditoria.ts:233` |
| 6 | Tipo `Employee` en props y fixtures | Tipo correcto: `EmpleadoSucursal` (`{ id: string, nombre: string, cargo?: string }`) | `useEmpleadosSucursal.ts:4-8` |
| 7 | `IniciarCorteParams.cajero` recibe objeto Employee | Recibe `string` (nombre). Orquestador extrae `.nombre` del `EmpleadoSucursal` | `auditoria.ts:200-201` |
| 8 | CorteOrquestador pasa `estadoConexion/estadoSync/ultimaSync/pendientes` desde `useCorteSesion` a CorteStatusBanner | Estos datos NO provienen de `useCorteSesion`. Son estado local (ver patrón en `Index.tsx:69-71`). CorteStatusBanner es OPCIONAL para Module C | `Index.tsx:69-71` |
| 9 | Sin punto de integración definido | Definido: Index.tsx renderiza `<CorteOrquestador>` para CASH_CUT cuando `showCorteInicio === true`. Ver sección "Punto de Integración" | `Index.tsx` |

---

## Hooks Supabase — Contratos Reales (verificados en código)

```typescript
// src/hooks/useSucursales.ts — líneas 6-11
interface UseSucursalesReturn {
  sucursales: Sucursal[];    // Sucursal = { id, nombre, codigo, activa } — auditoria.ts:64-73
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

// src/hooks/useEmpleadosSucursal.ts — líneas 4-15
interface EmpleadoSucursal {
  id: string;
  nombre: string;
  cargo?: string;
}
interface UseEmpleadosSucursalReturn {
  empleados: EmpleadoSucursal[];
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

// src/hooks/useCorteSesion.ts — líneas 640-652
// auditoria.ts:225-248
interface UseCorteSesionReturn {
  estado: EstadoCorte | null;
  corte_actual: Corte | null;
  intento_actual: CorteIntento | null;
  iniciarCorte: (params: IniciarCorteParams) => Promise<Corte>;
  guardarProgreso: (datos: DatosProgreso) => Promise<void>;
  finalizarCorte: (reporte_hash: string) => Promise<Corte>;
  abortarCorte: (motivo: string) => Promise<void>;
  reiniciarIntento: (motivo: string) => Promise<CorteIntento>;
  recuperarSesion: () => Promise<Corte | null>;
  cargando: boolean;
  error: string | null;
}

// src/types/auditoria.ts — líneas 196-205
interface IniciarCorteParams {
  sucursal_id: string;
  cajero: string;       // ← NOMBRE (string), NO objeto EmpleadoSucursal
  testigo: string;      // ← NOMBRE (string), NO objeto EmpleadoSucursal
  venta_esperada?: number;
}
```

---

## Punto de Integración en Index.tsx

### Flujo actual CASH_CUT (Index.tsx)

```
OperationSelector → handleModeSelection(CASH_CUT)
  → detectActiveCashCutSession()
  → setShowWizard(true)
  → InitialWizardModal (5 pasos: protocolo, sucursal, cajero, testigo, venta esperada)
    → handleWizardComplete(data)
      → iniciarCorte({ sucursal_id, cajero: string, testigo: string, venta_esperada })
      → setShowCashCounter(true) → CashCounter
```

Referencia: `Index.tsx:176-181` — `iniciarCorte` ya se llama con `{ cajero: data.selectedCashier, testigo: data.selectedWitness }` (strings, no objetos).

### Integración propuesta para CorteOrquestador

CorteOrquestador se introduce como pantalla intermedia **después** de que el usuario selecciona sucursal y venta esperada, **reemplazando** los pasos de cajero/testigo del wizard:

```
OperationSelector → handleModeSelection(CASH_CUT)
  → detectActiveCashCutSession()
  → setShowWizard(true)
  → InitialWizardModal (pasos reducidos: protocolo, sucursal, venta esperada)
    → handleWizardPartialComplete(data) → guarda store + venta esperada
    → setShowCorteInicio(true)
  → CorteOrquestador (sucursalId, ventaEsperada)
    → useEmpleadosSucursal(sucursalId) → empleados
    → CorteInicio (empleados, prefill, onConfirmar)
    → onConfirmar(cajero, testigo) → iniciarCorte({...}) → onCorteIniciado(corte)
  → CashCounter
```

**Estado necesario en Index.tsx (1 nuevo):**
```typescript
const [showCorteInicio, setShowCorteInicio] = useState(false);
```

**Render condicional (agregar en Index.tsx antes del bloque `showCashCounter`):**
```typescript
if (showCorteInicio && initialData) {
  return (
    <CorteOrquestador
      sucursalId={initialData.selectedStore}
      ventaEsperada={parseFloat(initialData.expectedSales) || undefined}
      onCorteIniciado={(corte) => {
        // Transicionar a CashCounter con datos del corte
        setShowCorteInicio(false);
        setShowCashCounter(true);
        // ... sync state setup (patrón existente líneas 167-192)
      }}
      onCancelar={() => {
        setShowCorteInicio(false);
        setShowWizard(true); // volver al wizard
      }}
    />
  );
}
```

> **Nota de alcance Module C:** La integración completa en Index.tsx (Task 5) requiere modificar InitialWizardModal para omitir pasos cajero/testigo en modo CASH_CUT. Si eso es excesivo para Module C, una alternativa mínima es: Task 5 agrega un `export` limpio y un TODO con el render condicional exacto, validando que `CorteOrquestador` es importable y renderizable sin errores de tipo. La integración UI completa puede ser un módulo E posterior.

---

## Guía Arquitectónica (Fase 2 DIRM)

### CorteInicio.tsx — Contrato de interfaz (V2 CORREGIDO)

**Responsabilidad:** Formulario de inicio de corte. Presentacional puro — sin llamadas a Supabase ni localStorage.

**Props que debe recibir:**

| Prop | Tipo | Descripción |
|---|---|---|
| `empleadosDeSucursal` | `EmpleadoSucursal[]` | Lista COMPLETA de empleados (de `useEmpleadosSucursal`) |
| `empleadoPrecargado` | `EmpleadoSucursal \| null` | Empleado desde localStorage (puede ser null) |
| `cargandoEmpleados` | `boolean` | `cargando` del hook `useEmpleadosSucursal` |
| `errorEmpleados` | `string \| null` | `error` del hook `useEmpleadosSucursal` |
| `onConfirmar` | `(cajero: EmpleadoSucursal, testigo: EmpleadoSucursal) => void` | Callback al confirmar selección |

**Nota:** Se omite `sucursalId` de las props de CorteInicio (V1 lo incluía). CorteInicio no lo necesita — es responsabilidad del orquestador.

**Comportamiento esperado:**

1. **Input cajero:** Si `empleadoPrecargado` no es null, el input inicia con `empleadoPrecargado.nombre`. De lo contrario, vacío.
2. **Datalist cajero:** Siempre lista TODOS los empleados en `empleadosDeSucursal` — independientemente del valor actual del input.
3. **Acción "Mostrar todos":** Un botón o link visible que, al hacer clic, fuerza la datalist a mostrarse con el catálogo completo. Útil cuando el browser colapsa las sugerencias tras una selección.
4. **Input testigo:** Lista los mismos empleados de `empleadosDeSucursal`, pero excluye al empleado actualmente seleccionado como cajero (para prevenir cajero = testigo).
5. **Validación:** El formulario solo puede confirmar si cajero ≠ testigo y ambos son empleados válidos del catálogo.
6. **Loading/Error:** Cuando `cargandoEmpleados` es true, los inputs están deshabilitados. Cuando `errorEmpleados` no es null, se muestra mensaje de error.
7. **Submit:** Llama `onConfirmar(cajeroSeleccionado, testigoSeleccionado)` con los objetos `EmpleadoSucursal` seleccionados.

### CorteOrquestador.tsx — Contrato de interfaz (V2 CORREGIDO)

**Responsabilidad:** Orquestador conectado. Wires hooks de Supabase → data props para CorteInicio. Llama `iniciarCorte` y notifica al padre.

**Props que debe recibir:**

| Prop | Tipo | Descripción |
|---|---|---|
| `sucursalId` | `string` | ID de la sucursal activa (desde wizard/parent) |
| `ventaEsperada` | `number \| undefined` | Venta esperada SICAR (opcional) |
| `onCorteIniciado` | `(corte: Corte) => void` | Callback cuando el corte arranca — recibe objeto `Corte` completo |
| `onCancelar` | `() => void` | Callback para volver atrás |

**Comportamiento esperado:**

1. Llama `useEmpleadosSucursal(sucursalId)` para obtener `{ empleados, cargando, error }`.
2. Lee localStorage para detectar `empleadoPrecargado` (key existente del proyecto — `lastCashier` o la que use `InitialWizardModal`). Resuelve el `EmpleadoSucursal` completo buscando en `empleados` por nombre.
3. Llama `useCorteSesion(sucursalId)` para obtener `{ iniciarCorte, cargando: cargandoCorte, error: errorCorte }`.
4. Renderiza `<CorteInicio>` pasando `empleadosDeSucursal={empleados}`, `empleadoPrecargado`, `cargandoEmpleados={cargando}`, `errorEmpleados={error}`, `onConfirmar={handleConfirmar}`.
5. En `handleConfirmar(cajero, testigo)`:
   ```typescript
   const corte = await iniciarCorte({
     sucursal_id: sucursalId,
     cajero: cajero.nombre,     // ← extrae .nombre (string)
     testigo: testigo.nombre,   // ← extrae .nombre (string)
     venta_esperada: ventaEsperada,
   });
   onCorteIniciado(corte);       // ← pasa objeto Corte completo
   ```
6. Maneja error de `iniciarCorte` con try/catch + mensaje visible al usuario.

**No hace:**
- No duplica lógica de `useCashCounterOrchestrator` (ese hook ya está migrado en Módulo A).
- No importa ni usa `paradise.ts`.
- No renderiza `CorteStatusBanner` (los datos de sync no provienen de `useCorteSesion`; se resuelve en integración Index.tsx con estado local, ver patrón `Index.tsx:69-71`).

---

## Descomposición Modular (Fase 3 DIRM)

### Task 1: Tests de CorteInicio — RED

**Archivos:**
- Crear: `src/components/corte/__tests__/CorteInicio.test.tsx`

**Propósito:** Escribir los tests ANTES de que exista `CorteInicio.tsx`. Deben fallar con "Cannot find module" o equivalente. TDD puro.

**Fixtures (compartidas):**

```typescript
import type { EmpleadoSucursal } from '@/hooks/useEmpleadosSucursal';

const EMPLEADOS_FIXTURE: EmpleadoSucursal[] = [
  { id: 'emp-001', nombre: 'Adonay Torres' },
  { id: 'emp-002', nombre: 'Tito Gomez' },
  { id: 'emp-003', nombre: 'Irvin Abarca', cargo: 'Cajero' },
];

const EMPLEADO_PRECARGADO: EmpleadoSucursal = EMPLEADOS_FIXTURE[0]; // Adonay Torres
```

**Escenarios a cubrir (7 tests):**

**Suite A — Prefill básico:**
- A1: Sin `empleadoPrecargado` (null) → input cajero vacío, datalist contiene los 3 empleados de `empleadosDeSucursal`.
- A2: Con `empleadoPrecargado` → input cajero muestra "Adonay Torres"; la datalist sigue conteniendo TODOS los 3 empleados.

**Suite B — Catálogo múltiple:**
- B1: Con 3 empleados en `empleadosDeSucursal` → la datalist del cajero lista los 3.
- B2: Con empleado precargado Y 3 empleados en catálogo → datalist cajero sigue mostrando los 3 (verifica que prefill NO filtra).

**Suite C — Acción "Mostrar todos":**
- C1: El botón/link "Mostrar todos" existe en el DOM.
- C2: Al hacer clic en "Mostrar todos", la datalist del cajero se abre/expande mostrando el catálogo completo.

**Suite D — Validación y submit:**
- D1: Seleccionar mismo empleado para cajero y testigo → botón confirmar deshabilitado o muestra error "cajero y testigo no pueden ser la misma persona".
- D2: Seleccionar cajero distinto al testigo → `onConfirmar` se llama con los objetos `EmpleadoSucursal` correctos al submit.

**Nota TDD:** Estos 7 tests deben correr y fallar antes de escribir CorteInicio.tsx.

**Step 1: Crear el archivo de test** con los 7 escenarios descritos arriba, usando fixtures `EmpleadoSucursal[]` (NO `Employee[]`) y callbacks `vi.fn()`.

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

**Props interface** (según contrato V2 corregido):
```typescript
import type { EmpleadoSucursal } from '@/hooks/useEmpleadosSucursal';

interface CorteInicioProps {
  empleadosDeSucursal: EmpleadoSucursal[];
  empleadoPrecargado: EmpleadoSucursal | null;
  cargandoEmpleados: boolean;
  errorEmpleados: string | null;
  onConfirmar: (cajero: EmpleadoSucursal, testigo: EmpleadoSucursal) => void;
}
```

**Implementación mínima para pasar los 7 tests:**

1. **Estado interno:** `cajeroBusqueda: string` (texto del input), `testigoBusqueda: string`.

2. **Input cajero:**
   - `value={cajeroBusqueda}`
   - `onChange` actualiza `cajeroBusqueda`
   - `list="cajero-list"` apunta a `<datalist id="cajero-list">`
   - Inicializa `cajeroBusqueda` con `empleadoPrecargado?.nombre ?? ''` en el primer render.

3. **Datalist cajero** (`<datalist id="cajero-list">`):
   - Mapea `empleadosDeSucursal` completo — NO filtra por `cajeroBusqueda`.
   - Cada `<option value={emp.nombre} />`.

4. **Botón "Mostrar todos":**
   - Al click: llama `inputRef.current?.focus()` (o limpiar el valor temporalmente para forzar el browser a abrir la datalist).
   - Siempre visible, no condicional.

5. **Input testigo:**
   - Similar al cajero pero filtra `empleadosDeSucursal.filter(e => e.id !== cajeroSeleccionado?.id)` para la datalist.

6. **Resolución de EmpleadoSucursal desde string:**
   - `cajeroSeleccionado = empleadosDeSucursal.find(e => e.nombre === cajeroBusqueda)`.
   - `testigoSeleccionado = empleadosDeSucursal.find(e => e.nombre === testigoBusqueda)`.

7. **Validación submit:**
   - `const mismoEmpleado = cajeroSeleccionado?.id === testigoSeleccionado?.id && cajeroSeleccionado != null`.
   - Botón confirmar: `disabled={mismoEmpleado || !cajeroSeleccionado || !testigoSeleccionado}`.
   - `onSubmit`: llama `onConfirmar(cajeroSeleccionado, testigoSeleccionado)`.

8. **Loading/Error states:**
   - Si `cargandoEmpleados`: inputs deshabilitados.
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
```typescript
// Mock CorteInicio — presentacional
vi.mock('../CorteInicio', () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="corte-inicio"
         data-cargando={String(props.cargandoEmpleados)}
         data-error={props.errorEmpleados ?? ''}
    >
      <button
        data-testid="confirmar-mock"
        onClick={() => {
          const onConfirmar = props.onConfirmar as
            (cajero: EmpleadoSucursal, testigo: EmpleadoSucursal) => void;
          onConfirmar(
            { id: 'emp-001', nombre: 'Adonay Torres' },
            { id: 'emp-002', nombre: 'Tito Gomez' },
          );
        }}
      >Confirmar</button>
    </div>
  ),
}));

// Mock useEmpleadosSucursal
vi.mock('@/hooks/useEmpleadosSucursal', () => ({
  useEmpleadosSucursal: vi.fn(() => ({
    empleados: [
      { id: 'emp-001', nombre: 'Adonay Torres' },
      { id: 'emp-002', nombre: 'Tito Gomez' },
    ],
    cargando: false,
    error: null,
    recargar: vi.fn(),
  })),
}));

// Mock useCorteSesion — solo las propiedades que SÍ retorna
vi.mock('@/hooks/useCorteSesion', () => ({
  useCorteSesion: vi.fn(() => ({
    estado: null,
    corte_actual: null,
    intento_actual: null,
    iniciarCorte: vi.fn().mockResolvedValue({
      id: 'corte-uuid-001',
      correlativo: 'CORTE-2026-02-23-H-001',
      sucursal_id: 'suc-001',
      cajero: 'Adonay Torres',
      testigo: 'Tito Gomez',
      estado: 'INICIADO',
      fase_actual: 1,
      intento_actual: 1,
      venta_esperada: null,
      datos_conteo: null,
      datos_entrega: null,
      datos_verificacion: null,
      datos_reporte: null,
      reporte_hash: null,
      created_at: '2026-02-23T10:00:00Z',
      updated_at: '2026-02-23T10:00:00Z',
      finalizado_at: null,
      motivo_aborto: null,
    }),
    guardarProgreso: vi.fn(),
    finalizarCorte: vi.fn(),
    abortarCorte: vi.fn(),
    reiniciarIntento: vi.fn(),
    recuperarSesion: vi.fn(),
    cargando: false,
    error: null,
  })),
}));
```

**Escenarios a cubrir (5 tests):**

- E1: Renderiza `CorteInicio` mock (data-testid="corte-inicio" presente en DOM).
- E2: Pasa `empleadosDeSucursal` del hook mock como prop a `CorteInicio`.
- E3: Cuando `CorteInicio` llama `onConfirmar(cajero, testigo)`, `CorteOrquestador` llama `iniciarCorte` con la firma correcta:
  ```typescript
  expect(mockIniciarCorte).toHaveBeenCalledWith({
    sucursal_id: 'suc-001',
    cajero: 'Adonay Torres',         // ← .nombre extraído
    testigo: 'Tito Gomez',           // ← .nombre extraído
    venta_esperada: undefined,
  });
  ```
- E4: Cuando `iniciarCorte` resuelve, `onCorteIniciado` del prop es llamado con el objeto `Corte` completo (no solo string):
  ```typescript
  expect(mockOnCorteIniciado).toHaveBeenCalledWith(
    expect.objectContaining({ id: 'corte-uuid-001', correlativo: 'CORTE-2026-02-23-H-001' })
  );
  ```
- E5: Cuando `iniciarCorte` rechaza con error, NO llama `onCorteIniciado` y muestra mensaje de error.

**Step 1: Crear el archivo de test** con los 5 escenarios.

**Step 2: Ejecutar para confirmar RED**
```bash
npx vitest run src/components/corte/__tests__/CorteOrquestador.test.tsx
```
Esperado: FAIL.

**Step 3: Commit RED**
```bash
git add src/components/corte/__tests__/CorteOrquestador.test.tsx
git commit -m "test(corte): RED — CorteOrquestador 5 scenarios (empleados, iniciarCorte params, Corte return, error)"
```

---

### Task 4: Implementación CorteOrquestador.tsx — GREEN

**Archivos:**
- Crear: `src/components/corte/CorteOrquestador.tsx`

**Props interface:**
```typescript
import type { Corte } from '@/types/auditoria';

interface CorteOrquestadorProps {
  sucursalId: string;
  ventaEsperada?: number;
  onCorteIniciado: (corte: Corte) => void;
  onCancelar: () => void;
}
```

**Implementación mínima:**

1. **Hooks a usar (contratos reales V2):**
   ```typescript
   const { empleados, cargando, error } = useEmpleadosSucursal(sucursalId);
   const { iniciarCorte, cargando: cargandoCorte, error: errorCorte } = useCorteSesion(sucursalId);
   ```

2. **Leer localStorage para prefill:**
   - Buscar la key de empleado precargado (verificar qué key usa el proyecto — puede ser el cajero del último turno almacenado por `InitialWizardModal` o `CashCounter`).
   - Resolver el `EmpleadoSucursal` completo: `empleados.find(e => e.nombre === nombreGuardado)`.
   - Si no se encuentra en el catálogo actual, pasar `null`.

3. **Handler `handleConfirmar`:**
   ```typescript
   const handleConfirmar = useCallback(async (
     cajero: EmpleadoSucursal,
     testigo: EmpleadoSucursal,
   ): Promise<void> => {
     try {
       const corte = await iniciarCorte({
         sucursal_id: sucursalId,
         cajero: cajero.nombre,       // ← extrae .nombre
         testigo: testigo.nombre,     // ← extrae .nombre
         venta_esperada: ventaEsperada,
       });
       onCorteIniciado(corte);        // ← pasa Corte completo
     } catch (err: unknown) {
       const msg = err instanceof Error ? err.message : 'Error al iniciar corte';
       setErrorLocal(msg);            // ← estado local para mostrar error
     }
   }, [iniciarCorte, sucursalId, ventaEsperada, onCorteIniciado]);
   ```

4. **Render:**
   ```tsx
   <CorteInicio
     empleadosDeSucursal={empleados}
     empleadoPrecargado={empleadoPrecargado}
     cargandoEmpleados={cargando}
     errorEmpleados={error}
     onConfirmar={handleConfirmar}
   />
   ```

**No renderiza** `CorteStatusBanner` — datos de sync no están disponibles desde `useCorteSesion`. El estado de sincronización se maneja en Index.tsx con `useState` local (patrón existente en `Index.tsx:69-71`).

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
git commit -m "feat(corte): CorteOrquestador — wires useEmpleadosSucursal + useCorteSesion (contratos V2)"
```

---

### Task 5: Integración en Index.tsx (evitar código muerto)

**Archivos:**
- Modificar: `src/pages/Index.tsx`

**Objetivo:** Conectar `CorteOrquestador` al flujo real de CASH_CUT para que los componentes NO sean código muerto.

**Alcance mínimo viable (Module C):**

1. **Importar CorteOrquestador:**
   ```typescript
   import CorteOrquestador from '@/components/corte/CorteOrquestador';
   ```

2. **Agregar estado:**
   ```typescript
   const [showCorteInicio, setShowCorteInicio] = useState(false);
   ```

3. **Agregar render branch** (antes del bloque `showCashCounter`):
   ```typescript
   if (currentMode === OperationMode.CASH_CUT && showCorteInicio && initialData) {
     return (
       <CorteOrquestador
         sucursalId={initialData.selectedStore}
         ventaEsperada={parseFloat(initialData.expectedSales) || undefined}
         onCorteIniciado={(corte) => {
           setShowCorteInicio(false);
           setShowCashCounter(true);
           if (isSupabaseConfigured) {
             setSyncSucursalId(corte.sucursal_id);
             setSyncEstado('sincronizado');
             setUltimaSync(new Date().toISOString());
           }
         }}
         onCancelar={() => {
           setShowCorteInicio(false);
           setShowWizard(true);
         }}
       />
     );
   }
   ```

4. **Trigger:** Modificar `handleWizardComplete` para pasar por CorteOrquestador en vez de llamar `iniciarCorte` directamente:
   ```typescript
   // En handleWizardComplete, DESPUÉS de setInitialData:
   if (currentMode === OperationMode.CASH_CUT && !activeCashCutSucursalId) {
     // Nuevo flujo: pasar por CorteOrquestador para selección cajero/testigo
     setShowWizard(false);
     setShowCorteInicio(true);
     return; // ← NO llama iniciarCorte aquí, CorteOrquestador lo hará
   }
   // ... flujo existente para reanudación de sesión activa
   ```

> **Nota:** Si la integración completa (modificar handleWizardComplete + wizard steps) es excesiva para Module C, el mínimo aceptable es: importar CorteOrquestador + agregar el render branch + TypeScript compila sin errores. El trigger puede activarse con un feature flag o quedarse como TODO documentado. Lo importante es que el import existe y el componente es renderizable.

**Step 1: Agregar import + estado + render branch en Index.tsx**

**Step 2: TypeScript check**
```bash
npx tsc --noEmit
```

**Step 3: Commit**
```bash
git add src/pages/Index.tsx
git commit -m "feat(corte): integración CorteOrquestador en Index.tsx — render branch CASH_CUT"
```

---

### Task 6: Módulo D — Verificación de Release

**Step 1: Suite completa de tests de corte en verde**
```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx src/components/corte/__tests__/CorteOrquestador.test.tsx
```
Esperado: 12/12 passing (7 + 5).

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
- [ ] Flujo legacy (CashCounter con `useCashCounterOrchestrator`) también muestra sucursales/empleados desde Supabase.

**Step 4: Commit de cierre de módulo D**
```bash
git add -p
git commit -m "chore(corte): módulo D verificado — build limpio, suite verde, catálogo unificado Supabase"
```

---

## Criterio de Cierre del Caso

Una vez completados los 6 tasks arriba:

1. Confirmar que `paradise.ts` no es importado en ningún archivo de flujo productivo de empleados/sucursales:
   ```bash
   grep -r "paradise" src --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v ".test."
   ```
   Esperado: solo imports en tests (como fixtures) o imports que no son para catálogos de empleados/sucursales.

2. Actualizar `docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/00_README.md`:
   - Módulos C y D: `⏳ Pendiente` → `✅ Completado`
   - Estado general: `EN_PROGRESO` → `COMPLETADO`
   - Fecha actualización: 2026-02-23

3. Mover carpeta a `docs/04_desarrollo/CASOS-COMPLETOS/`

---

## Resultado esperado

- `CorteInicio.tsx`: presentacional, datalist disociado del prefill ✅
- `CorteOrquestador.tsx`: conectado a Supabase, sin `paradise.ts`, contratos V2 correctos ✅
- `CorteInicio.test.tsx`: 7 tests verdes ✅
- `CorteOrquestador.test.tsx`: 5 tests verdes ✅
- Integración en Index.tsx: render branch funcional (no código muerto) ✅
- Build limpio ✅
- Sin consumo productivo de catálogos estáticos ✅
