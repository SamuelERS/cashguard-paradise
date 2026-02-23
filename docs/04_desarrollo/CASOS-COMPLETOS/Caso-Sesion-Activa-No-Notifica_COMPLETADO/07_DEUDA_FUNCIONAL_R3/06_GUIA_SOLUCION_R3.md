# GUIA ARQUITECTONICA R3: Plan de Implementacion Modular

> Caso: CASO-SANN-R3 (Deuda Funcional Post-Implementacion)
> Fase anterior: R2 commit `b5b390f`
> Protocolo: DIRM — TDD RED primero, GREEN despues
> Fecha: 2026-02-18
> Estado: APROBADO POR AUTHORITY — LISTO PARA ORDENES

## Orden de Implementacion (por complejidad ascendente)

```
1. R3-B4 — Eliminar preseleccion sucursal      [MUY BAJA]  ~5 lineas
2. R3-B3 — Icono conexion en panel Step 5       [MUY BAJA]  ~8 lineas
3. R3-B5 — Feedback abortar sesion              [MEDIA]     ~40 lineas
4. R3-B2 — Identificador sesion visible         [MEDIA]     ~50 lineas
5. R3-B1 — Reanudar salta a CashCounter         [ALTA]      ~80 lineas
```

R3-B2 a R3-B5 son independientes. R3-B1 depende de que el flujo base funcione.

---

## MODULO 1: R3-B4 — Eliminar Preseleccion Sucursal

**Decision Authority:** Opcion A — Eliminar preseleccion (consistencia con R2)

**Justificacion:** La preseleccion en Step 2 "filtra" informacion de sesion activa
antes de Step 5, violando principio de privacidad R2.

### Archivos afectados

| Archivo | Lineas | Cambio |
|---------|--------|--------|
| `src/hooks/initial-wizard/useInitialWizardController.ts` | 88-94 | ELIMINAR useEffect completo |

### Cambio exacto

**useInitialWizardController.ts — Eliminar lineas 88-94:**

```typescript
// ELIMINAR ESTE BLOQUE COMPLETO:
// 🤖 [IA] - DACC-CIERRE: Preseleccionar sucursal si hay sesión activa Supabase
useEffect(() => {
  if (isOpen && initialSucursalId && !wizardData.selectedStore) {
    updateWizardData({ selectedStore: initialSucursalId });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOpen, initialSucursalId]);
```

### Tests TDD RED (2 tests)

```
1. "NO preselecciona sucursal cuando hay initialSucursalId"
   - Renderizar wizard con initialSucursalId="abc"
   - Verificar que wizardData.selectedStore es "" (vacio)
   - Verificar que Step 2 muestra lista SIN seleccion previa

2. "Usuario debe seleccionar sucursal manualmente"
   - Renderizar wizard con initialSucursalId="abc"
   - Navegar a Step 2
   - Verificar que ninguna opcion tiene estado seleccionado
```

---

## MODULO 2: R3-B3 — Icono Conexion en Panel Step 5

**Decision Authority:** Opcion B — Icono minimo de nube/check en panel Step 5

**Justificacion:** El hecho de que el panel aparezca YA demuestra conexion exitosa
(si Supabase fallara, el panel no se renderizaria). El icono es confirmacion visual.

### Archivos afectados

| Archivo | Lineas | Cambio |
|---------|--------|--------|
| `src/components/initial-wizard/steps/Step5SicarInput.tsx` | 3, 34-36 | Agregar import Cloud + icono junto a titulo |

### Cambio exacto

**Step5SicarInput.tsx — Linea 3: Agregar Cloud al import:**

```typescript
// ANTES:
import { DollarSign, ArrowRight, CheckCircle } from 'lucide-react';

// DESPUES:
import { DollarSign, ArrowRight, CheckCircle, Cloud } from 'lucide-react';
```

**Step5SicarInput.tsx — Lineas 34-36: Agregar icono junto a titulo:**

```tsx
// ANTES:
<h4 className="font-semibold text-amber-400 text-fluid-sm mb-2">
  Sesión en Progreso
</h4>

// DESPUES:
<h4 className="font-semibold text-amber-400 text-fluid-sm mb-2 flex items-center gap-2">
  <Cloud className="w-4 h-4 text-green-400" aria-hidden="true" />
  Sesión en Progreso
</h4>
```

### Tests TDD RED (1 test)

```
1. "Muestra icono de conexion verde junto al titulo del panel"
   - Renderizar Step5SicarInput con hasActiveSession=true, currentStep=5
   - Verificar que existe elemento Cloud (svg) con clase text-green-400
```

---

## MODULO 3: R3-B5 — Feedback Abortar Sesion

**Decision Authority:** Solucion unica — Modal confirmacion + toast + fix estado

**Problema triple:**
1. Sin modal "Esta seguro?" (abortar es IRREVERSIBLE, estado ABORTADO es terminal)
2. Sin toast exito/error (usuario no sabe si funciono)
3. Estado se limpia incluso si Supabase falla (inconsistencia UI/DB)

### Archivos afectados

| Archivo | Lineas | Cambio |
|---------|--------|--------|
| `src/pages/Index.tsx` | 181-189 | Refactorizar handler: estado condicional |
| `src/components/initial-wizard/steps/Step5SicarInput.tsx` | 2, 40-58 | Modal confirmacion + estado loading |
| `src/types/initialWizard.ts` | 75 | Nueva prop `isAbortingSession?: boolean` |

### Cambio 1: Index.tsx — Refactorizar handleAbortSession (L181-189)

```typescript
// ANTES:
const handleAbortSession = useCallback(async () => {
  try {
    await abortarCorteActivo('Sesión abortada por usuario desde wizard');
  } catch (err: unknown) {
    console.warn('[Index] abortarCorte falló (graceful degradation):', err);
  }
  setActiveCashCutSucursalId(null);        // ← Fuera del try
  setHasActiveCashCutSession(false);       // ← Fuera del try
}, [abortarCorteActivo]);

// DESPUES:
const [isAbortingSession, setIsAbortingSession] = useState(false);

const handleAbortSession = useCallback(async () => {
  setIsAbortingSession(true);
  try {
    await abortarCorteActivo('Sesión abortada por usuario desde wizard');
    // EXITO: Limpiar estado solo si Supabase confirmo
    setActiveCashCutSucursalId(null);
    setHasActiveCashCutSession(false);
    toast.success('Sesión abortada correctamente');
  } catch (err: unknown) {
    // ERROR: Mantener panel visible para reintentar
    console.warn('[Index] abortarCorte falló:', err);
    toast.error('No se pudo abortar la sesión. Intente de nuevo.');
  } finally {
    setIsAbortingSession(false);
  }
}, [abortarCorteActivo]);
```

**Imports nuevos en Index.tsx:**
- `import { toast } from 'sonner';`

**Props nuevas al wizard (linea 262):**
- `isAbortingSession={isAbortingSession}`

### Cambio 2: Step5SicarInput.tsx — Modal confirmacion + loading

El boton "Abortar Sesion" ahora abre un modal de confirmacion local.
El componente maneja un estado `showAbortConfirm` internamente.

```tsx
// Agregar estado local:
const [showAbortConfirm, setShowAbortConfirm] = useState(false);

// Boton abortar cambia de onClick directo a abrir modal:
onClick={() => setShowAbortConfirm(true)}

// Agregar modal al final del panel:
{showAbortConfirm && (
  <ConfirmationModal
    isOpen={showAbortConfirm}
    onClose={() => setShowAbortConfirm(false)}
    onConfirm={() => {
      setShowAbortConfirm(false);
      onAbortSession?.();
    }}
    title="Abortar Sesion Activa?"
    description="Se marcara como ABORTADO en el sistema. Esta accion no se puede deshacer."
    warningText="Los datos del corte anterior se perderan permanentemente."
    confirmText="Si, Abortar"
    cancelText="Cancelar"
  />
)}
```

### Cambio 3: initialWizard.ts — Nueva prop

```typescript
// En Step5Props (linea 75), agregar:
isAbortingSession?: boolean;
```

```typescript
// En InitialWizardModalProps (linea 26), agregar:
isAbortingSession?: boolean;
```

### Tests TDD RED (5 tests)

```
1. "Muestra modal de confirmacion al presionar Abortar"
   - Click "Abortar Sesion" → Modal aparece con texto "Esta seguro?"
   - Boton "Cancelar" visible, boton "Si, Abortar" visible

2. "Cancelar en modal cierra sin abortar"
   - Click "Abortar" → Modal aparece
   - Click "Cancelar" → Modal cierra
   - Panel sigue visible, onAbortSession NO se llamo

3. "Confirmar en modal ejecuta onAbortSession"
   - Click "Abortar" → Modal aparece
   - Click "Si, Abortar" → onAbortSession() se ejecuta

4. "Toast exito aparece cuando abort es exitoso"
   - handleAbortSession ejecuta sin error
   - toast.success('Sesión abortada correctamente') se llama

5. "Toast error aparece y panel persiste cuando abort falla"
   - abortarCorteActivo lanza error
   - toast.error() se llama
   - hasActiveCashCutSession sigue true (panel NO desaparece)
```

---

## MODULO 4: R3-B2 — Identificador de Sesion Visible

**Decision Authority:** Solucion unica — Expandir select + propagar datos

### Archivos afectados

| Archivo | Lineas | Cambio |
|---------|--------|--------|
| `src/pages/Index.tsx` | 199, 210-213, 231, 258 | Expandir select, retornar mas datos, propagar |
| `src/types/initialWizard.ts` | 22-26, 73-75 | Nuevo tipo ActiveSessionInfo, nueva prop |
| `src/components/initial-wizard/InitialWizardModalView.tsx` | 77 | Pasar prop enriquecida |
| `src/components/initial-wizard/steps/Step5SicarInput.tsx` | 37-38 | Renderizar identificador |

### Cambio 1: Index.tsx — Expandir select y retorno

```typescript
// ANTES (linea 199):
.select('id,sucursal_id')

// DESPUES:
.select('id,sucursal_id,correlativo,created_at,cajero,estado')
```

```typescript
// ANTES retorno (lineas 210-213):
return {
  hasActive: Boolean(data),
  sucursalId: data?.sucursal_id ?? null,
};

// DESPUES:
return {
  hasActive: Boolean(data),
  sucursalId: data?.sucursal_id ?? null,
  correlativo: data?.correlativo ?? null,
  createdAt: data?.created_at ?? null,
  cajero: data?.cajero ?? null,
  estado: data?.estado ?? null,
};
```

**Nuevo estado en Index.tsx:**

```typescript
const [activeSessionInfo, setActiveSessionInfo] = useState<{
  correlativo: string | null;
  createdAt: string | null;
  cajero: string | null;
  estado: string | null;
} | null>(null);
```

**Guardar info en handleModeSelection (linea 231):**

```typescript
setActiveSessionInfo(activeSession.hasActive ? {
  correlativo: activeSession.correlativo,
  createdAt: activeSession.createdAt,
  cajero: activeSession.cajero,
  estado: activeSession.estado,
} : null);
```

**Pasar al wizard (linea 258+):**

```tsx
activeSessionInfo={activeSessionInfo}
```

### Cambio 2: Types — Nueva prop

```typescript
// En InitialWizardModalProps agregar:
activeSessionInfo?: {
  correlativo: string | null;
  createdAt: string | null;
  cajero: string | null;
  estado: string | null;
} | null;

// En Step5Props agregar:
activeSessionInfo?: {
  correlativo: string | null;
  createdAt: string | null;
  cajero: string | null;
  estado: string | null;
} | null;
```

### Cambio 3: Step5SicarInput.tsx — Renderizar info

Debajo del texto "Hay un corte de caja que no se completo...", agregar:

```tsx
{activeSessionInfo && (
  <div className="text-fluid-xs text-muted-foreground mt-1 space-y-0.5">
    {activeSessionInfo.correlativo && (
      <p className="font-mono text-amber-300/80">{activeSessionInfo.correlativo}</p>
    )}
    {activeSessionInfo.createdAt && (
      <p>Iniciado: {new Date(activeSessionInfo.createdAt).toLocaleString('es-SV')}</p>
    )}
    {activeSessionInfo.cajero && (
      <p>Cajero: {activeSessionInfo.cajero}</p>
    )}
  </div>
)}
```

### Tests TDD RED (4 tests)

```
1. "Muestra correlativo en panel cuando disponible"
   - Renderizar con activeSessionInfo.correlativo = "CORTE-2026-02-18-M-001"
   - Verificar texto "CORTE-2026-02-18-M-001" visible

2. "Muestra fecha de inicio formateada"
   - Renderizar con activeSessionInfo.createdAt = "2026-02-18T14:30:00Z"
   - Verificar texto "Iniciado:" visible

3. "Muestra cajero anterior"
   - Renderizar con activeSessionInfo.cajero = "Juan"
   - Verificar texto "Cajero: Juan" visible

4. "No muestra info cuando activeSessionInfo es null"
   - Renderizar sin activeSessionInfo
   - Verificar que no existen elementos de identificacion
```

---

## MODULO 5: R3-B1 — Reanudar Salta a CashCounter

**Decision Authority:** Opcion A — Saltar wizard completo, ir directo a CashCounter

**Complejidad:** ALTA — Requiere:
1. Llamar `recuperarSesion()` (ya existe en useCorteSesion)
2. Cerrar wizard
3. Abrir CashCounter con datos recuperados
4. NO llamar `iniciarCorte()` (sesion ya existe)

### Archivos afectados

| Archivo | Lineas | Cambio |
|---------|--------|--------|
| `src/pages/Index.tsx` | 50-53, 176-178 | Desestructurar recuperarSesion, refactorizar handler |
| `src/hooks/useCorteSesion.ts` | — | Ninguno (infraestructura ya lista) |

### Cambio 1: Index.tsx — Desestructurar recuperarSesion

```typescript
// ANTES (lineas 50-53):
const {
  abortarCorte: abortarCorteActivo,
} = useCorteSesion(activeCashCutSucursalId || '');

// DESPUES:
const {
  abortarCorte: abortarCorteActivo,
  recuperarSesion,
} = useCorteSesion(activeCashCutSucursalId || '');
```

### Cambio 2: Index.tsx — Refactorizar handleResumeSession

```typescript
// ANTES (lineas 176-178):
const handleResumeSession = useCallback(() => {
  setHasActiveCashCutSession(false);
}, []);

// DESPUES:
const handleResumeSession = useCallback(async () => {
  try {
    const corte = await recuperarSesion();
    if (!corte) {
      toast.error('No se pudo recuperar la sesión');
      return;
    }

    // Datos para CashCounter (minimo viable)
    setInitialData({
      selectedStore: corte.sucursal_id,
      selectedCashier: corte.cajero || '',
      selectedWitness: corte.testigo || '',
      expectedSales: corte.venta_esperada?.toString() || '0',
      dailyExpenses: [],
    });

    // Cerrar wizard y abrir CashCounter directamente
    setShowWizard(false);
    setShowCashCounter(true);

    // Configurar sync sobre sesion existente (no crear nueva)
    setSyncSucursalId(activeCashCutSucursalId || corte.sucursal_id);
    setSyncEstado('sincronizado');
    setUltimaSync(new Date().toISOString());
    setHasActiveCashCutSession(false);

    toast.success('Sesión reanudada');
  } catch (err: unknown) {
    console.warn('[Index] recuperarSesion falló:', err);
    toast.error('Error al recuperar la sesión');
  }
}, [recuperarSesion, activeCashCutSucursalId]);
```

**Nota:** `handleWizardComplete` (linea 135-160) ya tiene la politica DACC-R2:
cuando `activeCashCutSucursalId` existe, NO llama `iniciarCorte()` y usa la
sucursal de la sesion activa. El flujo de `handleResumeSession` SALTA el wizard
directamente, por lo que esa politica se replica en el handler de reanudar.

### Tests TDD RED (5 tests)

```
1. "Reanudar llama recuperarSesion()"
   - Click "Reanudar Sesion"
   - Verificar que recuperarSesion() fue llamado

2. "Wizard se cierra y CashCounter se muestra tras reanudar exitoso"
   - recuperarSesion retorna corte valido
   - Verificar showWizard = false
   - Verificar showCashCounter = true

3. "Datos del corte se pre-cargan en initialData"
   - recuperarSesion retorna { sucursal_id: "X", cajero: "Juan", venta_esperada: 500 }
   - Verificar initialData.selectedStore = "X"
   - Verificar initialData.selectedCashier = "Juan"
   - Verificar initialData.expectedSales = "500"

4. "Toast error si recuperarSesion falla"
   - recuperarSesion lanza error
   - toast.error() se llama
   - Wizard sigue abierto (showWizard = true)

5. "No llama iniciarCorte (sesion ya existe en Supabase)"
   - Reanudar sesion exitoso
   - Verificar que iniciarCorte NUNCA fue llamado
   - syncEstado = 'sincronizado' (no 'sincronizando')
```

---

## Resumen Total

| Modulo | Bug | Tests | Archivos | Lineas estimadas |
|--------|-----|-------|----------|-----------------|
| M1 | R3-B4 Preseleccion | 2 | 1 | -6 (eliminar) |
| M2 | R3-B3 Icono conexion | 1 | 1 | +3 |
| M3 | R3-B5 Feedback abortar | 5 | 3 | +40 |
| M4 | R3-B2 Identificador | 4 | 4 | +50 |
| M5 | R3-B1 Reanudar wizard | 5 | 1 | +35 |
| **TOTAL** | **5 bugs** | **17 tests** | **6 archivos unicos** | **~120 lineas netas** |

## Dependencias de Ejecucion

```
M1 (B4) ──> independiente, ejecutar primero (mas simple)
M2 (B3) ──> independiente
M3 (B5) ──> independiente (requiere toast import que M5 tambien usa)
M4 (B2) ──> independiente (requiere cambio en types que otros modulos usan)
M5 (B1) ──> depende de que useCorteSesion funcione; ejecutar al final
```

**Orden de ordenes recomendado:**

```
ORDEN #13: TDD RED  M1 (R3-B4) → 2 tests
ORDEN #14: GREEN    M1 (R3-B4) → eliminar useEffect
ORDEN #15: TDD RED  M2 (R3-B3) → 1 test
ORDEN #16: GREEN    M2 (R3-B3) → agregar icono
ORDEN #17: TDD RED  M3 (R3-B5) → 5 tests
ORDEN #18: GREEN    M3 (R3-B5) → modal + toast + fix state
ORDEN #19: TDD RED  M4 (R3-B2) → 4 tests
ORDEN #20: GREEN    M4 (R3-B2) → expand select + render
ORDEN #21: TDD RED  M5 (R3-B1) → 5 tests
ORDEN #22: GREEN    M5 (R3-B1) → recuperarSesion + skip wizard
ORDEN #23: COMMIT   Deuda funcional R3 resuelta
```
