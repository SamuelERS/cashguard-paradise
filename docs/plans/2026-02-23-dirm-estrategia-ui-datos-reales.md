# Guía Arquitectónica Modular — Estrategia UI con Datos Reales (Módulos B–E)

> **Para Claude ejecutor:** SUB-SKILL REQUERIDO: Usar `superpowers:executing-plans` para implementar este plan tarea por tarea.

**Objetivo:** Conectar la UI tradicional de CashGuard Paradise con datos reales de Supabase, verificar integridad de IDs end-to-end (sucursal/cajero/testigo → reporte → sync), y establecer los gates técnicos del Go/NoGo antes de cualquier cambio de UI por defecto.

**Arquitectura:** La UI tradicional (`InitialWizardModalView` + `CashCounter`) es el canon operativo. El invariante es que `selectedStore`/`selectedCashier`/`selectedWitness` siempre transportan IDs reales de Supabase desde el wizard hasta el corte. Los nombres se resuelven localmente desde los catálogos. La modernización de UI (Módulo E) solo se autoriza después de que los gates B, C y D estén en PASS con evidencia versionada.

**Tech Stack:** Vitest + React Testing Library, TypeScript strict (zero `any`), Supabase JS v2, `isSupabaseConfigured` flag, `tables.*` abstraction, Docker-only tests (`./Scripts/docker-test-commands.sh`).

---

## Hallazgos de Investigación (DIRM Fase 1)

Estos hallazgos son la base de las decisiones de este plan. Leer antes de ejecutar.

### H1 — IDs en wizard: documentados como IDs, implementados como IDs ✅ VERIFICADO

`useWizardNavigation.ts` documenta `selectedCashier` y `selectedWitness` como "ID del cajero seleccionado" / "ID del testigo seleccionado". `Step3CashierSelection.tsx:35` y `Step4WitnessSelection.tsx:36` usan `value={employee.id}` en `<SelectItem>`. La selección correctamente almacena IDs.

```typescript
// Step3CashierSelection.tsx:35-36 — CORRECTO
<SelectItem key={employee.id} value={employee.id}>
  {employee.name}
</SelectItem>
```

**No se requiere fix en Step3/Step4 para IDs.** Los tests deben verificar esto como contrato.

### H2 — Resolución de nombres en Step5: IDs → nombres via `availableEmployees.find()` ✅ VERIFICADO

`Step5SicarInput.tsx:187-193` resuelve IDs a nombres para el resumen pre-finalización:

```typescript
{availableEmployees.find(e => e.id === wizardData.selectedCashier)?.name}
{availableEmployees.find(e => e.id === wizardData.selectedWitness)?.name}
```

**Risk:** Si `availableEmployees` está vacío (ver H4), `.find()` devuelve `undefined` → nombre no visible en Step5.

### H3 — `CashCounter` recibe IDs, pero el reporte muestra nombres ⚠️ NO VERIFICADO

`Index.tsx` pasa `initialData.selectedCashier` (ID) a `<CashCounter initialCashier={...}>`. Los reportes generados por `CashCalculation.tsx` muestran nombres (ej. "Cajero: Adonay Torres"). El mecanismo exacto de resolución ID→nombre dentro de `CashCounter`/`useCashCounterOrchestrator` NO fue inspeccionado completamente.

**Acción en Módulo B:** Inspeccionar `CashCounter.tsx` y `useCashCounterOrchestrator.ts` (más de 80 líneas). Escribir test que verifique que dado `initialCashier='uuid-123'` y empleados `[{id:'uuid-123', nombre:'Adonay Torres'}]`, el reporte final contiene 'Adonay Torres' y NO 'uuid-123'.

### H4 — `useEmpleadosSucursal` sin mock fallback ⚠️ RIESGO OPERATIVO

`useEmpleadosSucursal.ts` **siempre** consulta Supabase. No tiene fallback mock explícito. Si `isSupabaseConfigured = false` o la query falla, devuelve empleados vacíos → dropdown de cajero vacío → wizard no puede avanzar al paso 3.

**Contraste con `useSucursales`:** Tiene `SUCURSALES_MOCK` para el caso `!isSupabaseConfigured`. **Esta asimetría es el principal riesgo del módulo.**

**Acción en Módulo B:** Test RED que verifique el comportamiento cuando `useEmpleadosSucursal` retorna vacío. Puede que sea necesario agregar mock fallback o al menos un manejo de error explícito.

### H5 — `useCashCounterOrchestrator` tiene resolución legacy de sucursales ✅ VERIFICADO (parcial)

`resolveSucursalIdFromSelectedStore(selectedStore, sucursales)` intenta: exact ID match → code match → normalized name match → legacy code map. Esto sugiere que `selectedStore` puede llegar como código legado (`'H'`, `'M'`) o nombre (`'los-heroes'`). Con el wizard actual (que almacena IDs), esto no debería activarse, pero indica historial de datos inconsistentes.

### H6 — `MorningCountWizard` tiene interfaz `onComplete` sin `dailyExpenses` ⚠️ DIVERGENCIA DE CONTRATO

```typescript
// MorningCountWizard.tsx — sin dailyExpenses
onComplete: (data: { selectedStore, selectedCashier, selectedWitness, expectedSales }) => void

// Index.tsx handleWizardComplete — con dailyExpenses
setInitialData({ ..., dailyExpenses: data.dailyExpenses || [] })
```

El `Index.tsx` hace `|| []` como fallback, lo que enmascara la diferencia. No es un bug activo pero es técnicamente incorrecto y debería alinearse.

---

## Contratos de Datos Críticos

Estos son los invariantes que los tests deben verificar:

| Campo | Tipo | Almacenado como | Mostrado como | Persistido en Supabase como |
|-------|------|-----------------|---------------|----------------------------|
| `selectedStore` | `string` | ID (UUID o `suc-001` en mock) | Nombre sucursal | `sucursal_id` (UUID) |
| `selectedCashier` | `string` | ID (UUID de empleado) | Nombre empleado | `cajero` (¿ID o nombre?) |
| `selectedWitness` | `string` | ID (UUID de empleado) | Nombre empleado | `testigo` (¿ID o nombre?) |
| `expectedSales` | `string` | String numérico | `$X,XXX.XX` | `venta_esperada` |

**Preguntas abiertas (responder en Task B3):**
- ¿El campo `cajero` en la tabla `cortes` de Supabase almacena UUID o nombre?
- ¿El campo `testigo` almacena UUID o nombre?
- En `handleResumeSession()` de `Index.tsx`: ¿`corte.cajero` contiene UUID o nombre? (Determina si la sesión reanudada muestra el actor correcto.)

---

## Gate Técnico — Condiciones de Paso

Basado en `03_Matriz_Decision_Go_NoGo.md`:

| Gate | Condición | Aplica a |
|------|-----------|----------|
| **Gate 1** | Catálogos de sucursales y empleados provienen de Supabase real (no hardcode) | Módulo B |
| **Gate 2** | Flujo tradicional completo funciona end-to-end con datos reales | Módulo B |
| **Gate 3** | Paridad funcional UI nueva vs UI tradicional (tests comparativos verdes) | Módulo D |
| **Go/NoGo UI** | Gates 1+2+3 en PASS + evidencia versionada | Módulo E |

---

## Smoke Tests Obligatorios (ejecutar después de cada módulo)

```bash
# S0 — Estabilidad base
npm run test:unit -- --run src/__tests__/unit/pages/index.stability.test.tsx

# S1 — Salud unitaria mínima
npm run test:unit -- --run

# S2 — Humo de interfaz (vía Docker)
./Scripts/docker-test-commands.sh test:e2e:smoke

# S3 — Build
npm run build
```

---

## Módulo B — Canon de datos en UI tradicional

**Criterio de aceptación:** Flujo tradicional completo funciona con datos reales end-to-end. Reportes y pasos muestran actores correctos por sucursal.

**Archivos objetivo:**
- `src/pages/Index.tsx`
- `src/components/initial-wizard/InitialWizardModalView.tsx`
- `src/hooks/initial-wizard/useInitialWizardController.ts`
- `src/components/morning-count/MorningCountWizard.tsx`
- `src/components/CashCounter.tsx`
- `src/hooks/useCashCounterOrchestrator.ts`

---

### Task B1: Contrato — Step3 y Step4 almacenan IDs, no nombres

**Files:**
- Create: `src/components/initial-wizard/steps/__tests__/wizard-id-contract.test.tsx`

**Step 1: Escribir test RED**

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Step3CashierSelection } from '../Step3CashierSelection';
import { Step4WitnessSelection } from '../Step4WitnessSelection';

const mockEmployees = [
  { id: 'emp-uuid-001', name: 'Adonay Torres', role: 'Empleado Activo', stores: ['suc-uuid-001'] },
  { id: 'emp-uuid-002', name: 'Tito Gomez', role: 'Empleado Activo', stores: ['suc-uuid-001'] },
];

describe('Wizard ID Contract — Módulo B', () => {
  it('Step3 almacena employee.id, no employee.name', async () => {
    const updateWizardData = vi.fn();
    render(
      <Step3CashierSelection
        wizardData={{ rulesAccepted: true, selectedStore: 'suc-uuid-001', selectedCashier: '', selectedWitness: '', expectedSales: '' }}
        updateWizardData={updateWizardData}
        availableEmployees={mockEmployees}
      />
    );

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.click(screen.getByText('Adonay Torres'));

    // Debe llamarse con el ID, no con el nombre
    expect(updateWizardData).toHaveBeenCalledWith({ selectedCashier: 'emp-uuid-001' });
    expect(updateWizardData).not.toHaveBeenCalledWith({ selectedCashier: 'Adonay Torres' });
  });

  it('Step4 almacena employee.id para testigo, excluyendo al cajero', async () => {
    const updateWizardData = vi.fn();
    render(
      <Step4WitnessSelection
        wizardData={{ rulesAccepted: true, selectedStore: 'suc-uuid-001', selectedCashier: 'emp-uuid-001', selectedWitness: '', expectedSales: '' }}
        updateWizardData={updateWizardData}
        availableEmployees={mockEmployees}
        selectedCashier="emp-uuid-001"
      />
    );

    await userEvent.click(screen.getByRole('combobox'));
    // Adonay Torres (cajero) no debe aparecer en la lista
    expect(screen.queryByText('Adonay Torres')).not.toBeInTheDocument();
    await userEvent.click(screen.getByText('Tito Gomez'));

    expect(updateWizardData).toHaveBeenCalledWith({ selectedWitness: 'emp-uuid-002' });
  });
});
```

**Step 2: Ejecutar test para verificar que falla**

```bash
npm run test:unit -- --run src/components/initial-wizard/steps/__tests__/wizard-id-contract.test.tsx
```

Resultado esperado: PASS (si las implementaciones ya son correctas). Si FAIL, el componente no pasa IDs → requiere fix en ese componente.

**Step 3: Verificar resultado y documentar**

Si PASS → contrato verificado, sin cambios necesarios en Step3/Step4.
Si FAIL → modificar el componente correspondiente para usar `value={employee.id}` correctamente.

**Step 4: Commit**

```bash
git add src/components/initial-wizard/steps/__tests__/wizard-id-contract.test.tsx
git commit -m "test(módulo-b): contrato IDs wizard — Step3 y Step4 almacenan employee.id"
```

---

### Task B2: Contrato — `useInitialWizardController.handleComplete` propaga IDs intactos

**Files:**
- Create: `src/hooks/initial-wizard/__tests__/useInitialWizardController.idContract.test.ts`

**Step 1: Escribir test RED**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useInitialWizardController } from '../useInitialWizardController';

// Mockear hooks de datos para que devuelvan datos controlados
vi.mock('@/hooks/useSucursales', () => ({
  useSucursales: () => ({
    sucursales: [{ id: 'suc-uuid-001', nombre: 'Los Héroes', codigo: 'H', activa: true }],
    cargando: false, error: null, recargar: vi.fn(),
  }),
}));

vi.mock('@/hooks/useEmpleadosSucursal', () => ({
  useEmpleadosSucursal: () => ({
    empleados: [
      { id: 'emp-uuid-001', nombre: 'Adonay Torres', activo: true },
      { id: 'emp-uuid-002', nombre: 'Tito Gomez', activo: true },
    ],
    cargando: false, error: null, recargar: vi.fn(),
  }),
}));

describe('useInitialWizardController — propagación de IDs (Módulo B)', () => {
  it('onComplete recibe IDs, no nombres de display', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useInitialWizardController({ isOpen: true, onClose: vi.fn(), onComplete })
    );

    act(() => {
      result.current.updateWizardData({
        selectedStore: 'suc-uuid-001',
        selectedCashier: 'emp-uuid-001',
        selectedWitness: 'emp-uuid-002',
        expectedSales: '500.00',
      });
    });

    act(() => { result.current.handleComplete(); });

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        selectedStore: 'suc-uuid-001',
        selectedCashier: 'emp-uuid-001',  // ID, no 'Adonay Torres'
        selectedWitness: 'emp-uuid-002',  // ID, no 'Tito Gomez'
      })
    );
  });
});
```

**Step 2: Ejecutar**

```bash
npm run test:unit -- --run src/hooks/initial-wizard/__tests__/useInitialWizardController.idContract.test.ts
```

**Step 3: Implementar fix si FAIL**

Si el test falla porque `handleComplete` transforma los IDs a nombres antes de llamar `onComplete`, corregir en `useInitialWizardController.ts:132-144` para pasar `wizardData.selectedCashier` directamente sin transformar.

**Step 4: Commit**

```bash
git add src/hooks/initial-wizard/__tests__/useInitialWizardController.idContract.test.ts
git commit -m "test(módulo-b): verificar que handleComplete propaga IDs intactos a onComplete"
```

---

### Task B3: Inspección — CashCounter y resolución de nombres en reporte

**Files:**
- Read: `src/components/CashCounter.tsx` (leer completo)
- Read: `src/hooks/useCashCounterOrchestrator.ts` (leer completo, >80 líneas)
- Read: `src/lib/supabase.ts` (leer sección `iniciarCorte`/`cortes`)

**Objetivo:** Responder estas preguntas antes de escribir tests:

1. ¿`CashCounter` usa `initialCashier` (ID) directamente como string de display, o lo resuelve a nombre?
2. ¿`useCashCounterOrchestrator` tiene función equivalente a `resolveSucursalIdFromSelectedStore` para empleados?
3. En `iniciarCorte({cajero: ???, testigo: ???})`, ¿se pasa el ID o el nombre a Supabase?
4. En `handleResumeSession()` de `Index.tsx`, ¿`corte.cajero` y `corte.testigo` contienen IDs o nombres?

**Step 1: Leer CashCounter.tsx**

```bash
# Buscar todas las referencias a initialCashier, initialWitness, initialStore en CashCounter
grep -n "initialCashier\|initialWitness\|initialStore\|cajero\|testigo" src/components/CashCounter.tsx | head -50
```

**Step 2: Leer useCashCounterOrchestrator.ts completo**

```bash
wc -l src/hooks/useCashCounterOrchestrator.ts
# Luego leer con offset si >100 líneas
```

**Step 3: Documentar hallazgos**

Crear `docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/07_Hallazgos_Modulo_B_CashCounter.md` con:
- ¿ID o nombre se muestra en el reporte?
- ¿Hay bug activo o el sistema ya resuelve correctamente?
- Recomendación de fix si aplica

**Step 4: Commit**

```bash
git add docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/07_Hallazgos_Modulo_B_CashCounter.md
git commit -m "docs(módulo-b): hallazgos inspección CashCounter — resolución IDs en reporte"
```

---

### Task B4: Test RED — reporte muestra nombres resueltos, no IDs

> **Prerequisito:** Task B3 completada. Este test se escribe basado en los hallazgos de B3.

**Files:**
- Create: `src/hooks/__tests__/useCashCounterOrchestrator.idResolution.test.ts`

**Step 1: Escribir test RED**

```typescript
// Verificar que dado selectedCashier='emp-uuid-001', el reporte final contiene
// el nombre 'Adonay Torres' y NO el UUID 'emp-uuid-001'
it('reporte final muestra nombre cajero, no ID', () => {
  // Setup: mock useSucursales + useEmpleadosSucursal con datos controlados
  // Render: CashCounter con initialCashier='emp-uuid-001'
  // Assert: el texto de resumen/reporte contiene 'Adonay Torres'
  // Assert: el texto NO contiene 'emp-uuid-001'
});
```

Estructura exacta del test depende de hallazgos de Task B3.

**Step 2: Ejecutar → RED**
```bash
npm run test:unit -- --run src/hooks/__tests__/useCashCounterOrchestrator.idResolution.test.ts
```

**Step 3: Implementar fix**

Si `CashCounter` usa `initialCashier` como display directo:
- Agregar resolución ID→nombre usando `useEmpleadosSucursal(initialStore)` dentro de `CashCounter` o `useCashCounterOrchestrator`
- Usar patrón: `empleados.find(e => e.id === initialCashier)?.nombre ?? initialCashier`

**Step 4: Ejecutar → GREEN**
```bash
npm run test:unit -- --run src/hooks/__tests__/useCashCounterOrchestrator.idResolution.test.ts
```

**Step 5: Smoke tests Módulo B**
```bash
npm run test:unit -- --run src/__tests__/unit/pages/index.stability.test.tsx
npm run test:unit -- --run
npm run build
```

**Step 6: Commit**
```bash
git add src/hooks/__tests__/useCashCounterOrchestrator.idResolution.test.ts
# Si hubo fix en CashCounter o useCashCounterOrchestrator:
git add src/components/CashCounter.tsx src/hooks/useCashCounterOrchestrator.ts
git commit -m "fix(módulo-b): resolución ID→nombre en reporte final del cajero/testigo"
```

---

### Task B5: Test RED — `useEmpleadosSucursal` comportamiento con ID inexistente

**Contexto:** Si `useEmpleadosSucursal` recibe un ID que no existe en Supabase (ej. ID mock con Supabase real), devuelve vacío silenciosamente. El wizard quedaría sin empleados → cajero vacío → sin error explícito.

**Files:**
- Modify: `src/hooks/__tests__/useEmpleadosSucursal.test.ts` (si existe) O
- Create: `src/hooks/__tests__/useEmpleadosSucursal.noMatch.test.ts`

**Step 1: Escribir test RED**

```typescript
it('devuelve array vacío y NO lanza error cuando sucursalId no existe en BD', async () => {
  // Mock supabase para retornar data: [], error: null (ID no encontrado = resultado vacío)
  const { result } = renderHook(() => useEmpleadosSucursal('id-que-no-existe'));
  await waitFor(() => expect(result.current.cargando).toBe(false));

  expect(result.current.empleados).toEqual([]);
  expect(result.current.error).toBeNull(); // No es error, es simplemente vacío
});

it('error explícito si sucursalId es string vacío', () => {
  const { result } = renderHook(() => useEmpleadosSucursal(''));
  // Debe retornar vacío inmediatamente sin query
  expect(result.current.empleados).toEqual([]);
  expect(result.current.cargando).toBe(false);
});
```

**Step 2: Ejecutar → RED (o GREEN si ya está cubierto)**
```bash
npm run test:unit -- --run src/hooks/__tests__/useEmpleadosSucursal.noMatch.test.ts
```

**Step 3: Fix si necesario**

Si el hook lanza error cuando recibe ID sin match, modificar `src/hooks/useEmpleadosSucursal.ts` para tratar "query vacío" como estado válido (no como error).

**Step 4: Commit**
```bash
git add src/hooks/__tests__/useEmpleadosSucursal.noMatch.test.ts
git commit -m "test(módulo-b): useEmpleadosSucursal — array vacío con ID no encontrado no es error"
```

---

### Task B6: Test RED — MorningCountWizard ID propagation

**Files:**
- Read: `src/components/morning-count/MorningCountWizard.tsx` (leer completo — primera lectura fue solo 80 líneas)
- Create: `src/components/morning-count/__tests__/MorningCountWizard.idContract.test.tsx`

**Step 1: Leer MorningCountWizard.tsx completo**
```bash
wc -l src/components/morning-count/MorningCountWizard.tsx
```

**Step 2: Verificar si MorningCountWizard usa IDs o nombres para `selectedCashier`**

Buscar los `<SelectItem>` del wizard matutino:
```bash
grep -n "SelectItem\|selectedCashier\|selectedWitness\|employee\.\|empleado\." src/components/morning-count/MorningCountWizard.tsx
```

**Step 3: Escribir test según hallazgo**

```typescript
// Si MorningCountWizard también usa value={employee.id}:
it('MorningCountWizard: onComplete recibe selectedCashier como ID', async () => {
  const onComplete = vi.fn();
  // render + seleccionar cajero por nombre → verificar que onComplete recibe ID
  expect(onComplete).toHaveBeenCalledWith(
    expect.objectContaining({ selectedCashier: 'emp-uuid-001' })
  );
});
```

**Step 4: Fix si MorningCountWizard usa nombres en lugar de IDs**

Si se detecta que `MorningCountWizard` almacena `selectedCashier` como nombre (divergencia con `InitialWizardModal`), modificarlo para alinearlo.

**Step 5: Alinear contrato `onComplete` con `dailyExpenses`**

Dado el hallazgo H6 (MorningCountWizard no incluye `dailyExpenses` en `onComplete`):
- Si el comportamiento deseado es que el conteo matutino también soporte gastos, agregar el campo al tipo.
- Si no, documentar explícitamente que es intencional.

**Step 6: Smoke tests Módulo B completo**
```bash
npm run test:unit -- --run
npm run build
# Confirmar que todos los tests base siguen en verde
```

**Step 7: Commit**
```bash
git add src/components/morning-count/__tests__/MorningCountWizard.idContract.test.tsx
git commit -m "test(módulo-b): MorningCountWizard — verificar propagación de IDs en onComplete"
```

---

## Módulo C — Observabilidad y diagnóstico operativo

**Criterio de aceptación:** La operación puede distinguir rápidamente si corre contra Supabase real o fallback. Banner de conectividad muestra estado real de conexión.

**Archivos objetivo:**
- `src/components/corte/CorteStatusBanner.tsx`
- `src/components/corte/CorteOrquestador.tsx`
- `src/lib/supabase.ts`

---

### Task C1: Inspección — estado actual del CorteStatusBanner

**Files:**
- Read: `src/components/corte/CorteStatusBanner.tsx`
- Read: `src/lib/supabase.ts` (sección `isSupabaseConfigured` y connection check)

**Step 1: Leer CorteStatusBanner.tsx**
```bash
cat src/components/corte/CorteStatusBanner.tsx
```

**Step 2: Documentar estado actual**

Crear `docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/08_Hallazgos_Modulo_C_Banner.md`:
- ¿El banner muestra estado hardcodeado o estado real de Supabase?
- ¿Existe ya un mecanismo de health check?
- ¿`isSupabaseConfigured` está expuesto o es solo interno?

**Step 3: Commit**
```bash
git add docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/08_Hallazgos_Modulo_C_Banner.md
git commit -m "docs(módulo-c): inspección CorteStatusBanner — estado conectividad actual"
```

---

### Task C2: Test RED — banner refleja estado real de conectividad

**Files:**
- Create: `src/components/corte/__tests__/CorteStatusBanner.connectivity.test.tsx`

**Step 1: Escribir tests RED**

```typescript
describe('CorteStatusBanner — conectividad real (Módulo C)', () => {
  it('muestra "MODO REAL" cuando isSupabaseConfigured=true', () => {
    // Mock isSupabaseConfigured = true
    render(<CorteStatusBanner />);
    // Algún indicador visible de "real" (texto, color, ícono)
    expect(screen.getByTestId('connection-mode')).toHaveTextContent(/real|supabase/i);
  });

  it('muestra "MODO FALLBACK" cuando isSupabaseConfigured=false', () => {
    // Mock isSupabaseConfigured = false
    render(<CorteStatusBanner />);
    expect(screen.getByTestId('connection-mode')).toHaveTextContent(/fallback|mock|sin conexión/i);
  });

  it('el indicador solo es visible en entorno dev (no en producción)', () => {
    // process.env.NODE_ENV = 'production'
    render(<CorteStatusBanner />);
    expect(screen.queryByTestId('connection-mode')).not.toBeInTheDocument();
  });
});
```

**Step 2: Ejecutar → RED (el indicador no existe aún)**
```bash
npm run test:unit -- --run src/components/corte/__tests__/CorteStatusBanner.connectivity.test.tsx
```

**Step 3: Implementar**

Modificar `CorteStatusBanner.tsx`:
```typescript
// Agregar indicador técnico visible solo en dev
const connectionMode = isSupabaseConfigured ? 'REAL' : 'FALLBACK';
{process.env.NODE_ENV !== 'production' && (
  <span data-testid="connection-mode" className="...">
    {connectionMode}
  </span>
)}
```

**Step 4: Ejecutar → GREEN**
```bash
npm run test:unit -- --run src/components/corte/__tests__/CorteStatusBanner.connectivity.test.tsx
```

**Step 5: Smoke tests Módulo C**
```bash
npm run test:unit -- --run
npm run build
```

**Step 6: Commit**
```bash
git add src/components/corte/__tests__/CorteStatusBanner.connectivity.test.tsx
git add src/components/corte/CorteStatusBanner.tsx
git commit -m "feat(módulo-c): indicador técnico conexión real/fallback en CorteStatusBanner"
```

---

## Módulo D — Preparación de modernización (sin switch de UI)

**Criterio de aceptación:** Equivalencia funcional demostrable por tests. UI nueva lista para feature flag, sin reemplazar producción local.

**Archivos objetivo:**
- `src/components/corte/CortePage.tsx`
- `src/components/corte/CorteInicio.tsx`
- `src/components/corte/CorteOrquestador.tsx`
- `src/types/auditoria.ts`

---

### Task D1: Inspección — estado actual de CortePage y CorteInicio

**Files:**
- Read: `src/components/corte/CortePage.tsx`
- Read: `src/components/corte/CorteInicio.tsx`
- Read: `src/components/corte/CorteOrquestador.tsx`
- Read: `src/types/auditoria.ts`

**Step 1: Leer todos los archivos**
```bash
wc -l src/components/corte/CortePage.tsx src/components/corte/CorteInicio.tsx src/components/corte/CorteOrquestador.tsx src/types/auditoria.ts
```

**Step 2: Mapear la matriz de paridad**

Crear `docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/09_Matriz_Paridad_UI_Tradicional_Nueva.md`:

| Paso / Función | UI Tradicional | UI Nueva (Corte*) | Estado | ¿Necesita fix? |
|----------------|----------------|-------------------|--------|----------------|
| Selección sucursal | ✅ Wizard Step2 | ? | | |
| Selección cajero | ✅ Wizard Step3 | ? | | |
| Selección testigo | ✅ Wizard Step4 | ? | | |
| Conteo efectivo | ✅ CashCounter | ? | | |
| Reporte WhatsApp | ✅ CashCalculation | ? | | |
| Sync Supabase | ✅ iniciarCorte | ? | | |

**Step 3: Commit**
```bash
git add docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/09_Matriz_Paridad_UI_Tradicional_Nueva.md
git commit -m "docs(módulo-d): matriz de paridad UI tradicional vs nueva"
```

---

### Task D2: Test RED — paridad funcional en escenarios críticos

**Files:**
- Create: `src/components/corte/__tests__/CorteOrquestador.paridad.test.tsx`

**Step 1: Escribir tests RED comparativos**

```typescript
describe('Paridad UI Tradicional vs Nueva — Módulo D', () => {
  it('CorteOrquestador recibe sucursal_id como UUID real (no nombre ni código)', () => {
    // Renderizar CorteOrquestador con initialData que tiene IDs reales
    // Verificar que el corte se inicia con sucursal_id = UUID, no 'Los Héroes' ni 'H'
  });

  it('CorteOrquestador preserva trazabilidad: cajero ID llega al corte Supabase', () => {
    // Mock iniciarCorte
    // Verificar que cajero_id llega correctamente
  });

  it('UI nueva no rompe contrato de initialData de Index.tsx', () => {
    // Si CortePage/CorteInicio usan initialData con mismos campos
    // Verificar que no accede a campos inexistentes ni ignora campos requeridos
  });
});
```

**Step 2: Ejecutar → RED (o parcialmente RED)**
```bash
npm run test:unit -- --run src/components/corte/__tests__/CorteOrquestador.paridad.test.tsx
```

**Step 3: Fix cualquier divergencia de contrato**

Si `CorteOrquestador` acepta `sucursal_id` como nombre en lugar de UUID:
- Agregar resolución equivalente a `resolveSucursalIdFromSelectedStore` de `useCashCounterOrchestrator`
- Usar `useSucursales()` para resolución y pasar UUID correcto

**Step 4: Ajustar tipos en `auditoria.ts` si necesario**

Verificar que los tipos de `auditoria.ts` exigen IDs (UUIDs) en lugar de strings genéricos para los campos de actor:
```typescript
// En auditoria.ts — asegurarse que estos campos son IDs
sucursal_id: string; // UUID de Supabase, NO nombre
cajero_id?: string;  // UUID, NO nombre
testigo_id?: string; // UUID, NO nombre
```

**Step 5: Smoke tests Módulo D**
```bash
npm run test:unit -- --run
npm run build
```

**Step 6: Commit**
```bash
git add src/components/corte/__tests__/CorteOrquestador.paridad.test.tsx
git commit -m "test(módulo-d): paridad UI nueva — contratos de ID y trazabilidad verificados"
```

---

## Módulo E — Activación gradual (Go/NoGo)

> **PREREQUISITO ESTRICTO:** Módulos B, C y D deben estar en PASS completo. No ejecutar Módulo E si algún gate está en FAIL.

**Criterio de aceptación:** Cambio reversible sin downtime. Veredicto formal PASS antes de switch por defecto.

**Archivos objetivo:**
- `src/pages/Index.tsx`
- `src/App.tsx`
- Feature flag module (nuevo si no existe)

---

### Task E1: Feature flag — enrutamiento UI tradicional/nueva

**Files:**
- Create: `src/config/featureFlags.ts`
- Modify: `src/pages/Index.tsx`

**Step 1: Crear módulo de feature flags**

```typescript
// src/config/featureFlags.ts
// 🤖 [IA] - Módulo E: Feature flags para activación gradual de UI nueva
export const FEATURE_FLAGS = {
  /**
   * Cuando true: usa UI nueva (CortePage/CorteInicio) para el flujo de corte.
   * Cuando false (default): usa UI tradicional (CashCounter) como canon operativo.
   *
   * NO cambiar a true en producción hasta veredicto formal Go/NoGo.
   */
  USE_NEW_CORTE_UI: (import.meta.env.VITE_USE_NEW_CORTE_UI === 'true') ?? false,
} as const;
```

**Step 2: Test RED — feature flag controla qué UI se renderiza**

```typescript
// src/config/__tests__/featureFlags.test.ts
it('USE_NEW_CORTE_UI es false por defecto', () => {
  expect(FEATURE_FLAGS.USE_NEW_CORTE_UI).toBe(false);
});

it('Index.tsx usa CashCounter cuando flag es false', () => {
  // Render Index con VITE_USE_NEW_CORTE_UI=false
  // Verificar que CashCounter está presente, CortePage no
});

it('Index.tsx usa CortePage cuando flag es true', () => {
  // Render Index con VITE_USE_NEW_CORTE_UI=true
  // Verificar que CortePage está presente, CashCounter no
});
```

**Step 3: Ejecutar → RED**
```bash
npm run test:unit -- --run src/config/__tests__/featureFlags.test.ts
```

**Step 4: Implementar feature flag en Index.tsx**

```typescript
// Index.tsx — agregar import
import { FEATURE_FLAGS } from '@/config/featureFlags';

// En el render condicional:
{FEATURE_FLAGS.USE_NEW_CORTE_UI ? (
  <CortePage initialData={initialData} onComplete={handleOperationComplete} />
) : (
  <CashCounter {...cashCounterProps} />
)}
```

**Step 5: Ejecutar → GREEN**
```bash
npm run test:unit -- --run src/config/__tests__/featureFlags.test.ts
```

**Step 6: Smoke tests completos (todos los módulos)**
```bash
npm run test:unit -- --run src/__tests__/unit/pages/index.stability.test.tsx
npm run test:unit -- --run
npm run build
```

**Step 7: Veredicto formal Go/NoGo**

Completar `03_Matriz_Decision_Go_NoGo.md` con:
- Gate 1 PASS/FAIL + evidencia (commit hash)
- Gate 2 PASS/FAIL + evidencia
- Gate 3 PASS/FAIL + evidencia
- Veredicto final: GO / NO-GO

**Step 8: Commit**
```bash
git add src/config/featureFlags.ts src/config/__tests__/featureFlags.test.ts src/pages/Index.tsx
git add docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/03_Matriz_Decision_Go_NoGo.md
git commit -m "feat(módulo-e): feature flag VITE_USE_NEW_CORTE_UI — enrutamiento UI tradicional/nueva"
```

---

## Cierre del Caso

Cuando todos los módulos B–E estén completados y los smoke tests S0–S3 en verde:

**Step 1: Actualizar `00_README.md`**

Cambiar:
```markdown
| **Estado** | 🟡 En progreso (Modulo A completado) |
```
por:
```markdown
| **Estado** | ✅ COMPLETADO |
| **Fecha actualizacion** | YYYY-MM-DD |
```

Actualizar tabla de progreso:
```markdown
| A | ✅ Completado |
| B | ✅ Completado |
| C | ✅ Completado |
| D | ✅ Completado |
| E | ✅ Completado (Go/NoGo: [veredicto]) |
```

**Step 2: Mover carpeta a CASOS-COMPLETOS**
```bash
mv "docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217" \
   "docs/04_desarrollo/CASOS-COMPLETOS/Caso_Estrategia_UI_Datos_Reales_20260217_COMPLETADO"
```

**Step 3: Commit de cierre**
```bash
git add docs/
git commit -m "docs(caso-completado): Caso_Estrategia_UI_Datos_Reales — cierre con evidencia Módulos B–E"
```

---

## Resumen de Tasks por Módulo

| Task | Módulo | Archivo principal | Tipo | Riesgo |
|------|--------|-------------------|------|--------|
| B1 | B | Step3CashierSelection | Test contrato | Bajo |
| B2 | B | useInitialWizardController | Test contrato | Bajo |
| B3 | B | CashCounter (inspección) | Lectura | N/A |
| B4 | B | useCashCounterOrchestrator | Test RED+fix | **Medio** |
| B5 | B | useEmpleadosSucursal | Test RED+fix | Bajo |
| B6 | B | MorningCountWizard | Test RED+fix | **Medio** |
| C1 | C | CorteStatusBanner (inspección) | Lectura | N/A |
| C2 | C | CorteStatusBanner | Test RED+fix | Bajo |
| D1 | D | CortePage/CorteInicio (inspección) | Lectura | N/A |
| D2 | D | CorteOrquestador | Test RED+fix | **Medio** |
| E1 | E | featureFlags + Index.tsx | Test RED+fix | Bajo |

**Total estimado de trabajo de implementación:** 8-12 horas (excluyendo inspecciones que son paralelas).

**Orden recomendado:** B1 → B2 → B3 (lectura) → B4 → B5 → B6 → Smoke B → C1 (lectura) → C2 → Smoke C → D1 (lectura) → D2 → Smoke D → E1 → Smoke E → Cierre

---

*Plan creado por DIRM — Fase 1 completada. Solicitar aprobación explícita del usuario antes de iniciar cualquier fase de implementación.*
