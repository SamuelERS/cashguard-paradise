# R3-B4: Sucursal Preseleccionada Sin Accion del Usuario

> Severidad: MEDIA
> Estado: DECISION TOMADA
> Decision Authority: OPCION A — Eliminar preseleccion (consistencia con R2)
> Detectado por: Usuario (testing manual)
> Quote: "en el paso 2 ya me aparece preseleccionada la sucursal sin que yo haga nada"

## 1. Sintoma Observable

Al navegar al Step 2 (Seleccion de Sucursal), la sucursal "Plaza Merliot" ya aparece
seleccionada sin que el usuario haya interactuado. Esto ocurre cuando hay sesion
activa detectada en Supabase.

## 2. Root Cause

### useInitialWizardController.ts — lineas 89-94:

```typescript
// DACC-CIERRE: Preseleccionar sucursal si hay sesion activa Supabase
useEffect(() => {
  if (isOpen && initialSucursalId && !wizardData.selectedStore) {
    updateWizardData({ selectedStore: initialSucursalId });
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOpen, initialSucursalId]);
```

Este useEffect fue implementado en DACC-CIERRE (version anterior) para
preseleccionar la sucursal de la sesion activa en Supabase.

### Flujo de datos que lo alimenta — `Index.tsx` lineas 221-232:

```typescript
const handleModeSelection = async (mode: OperationMode) => {
  selectMode(mode);
  if (mode === OperationMode.CASH_CUT) {
    const activeSession = await detectActiveCashCutSession();
    setActiveCashCutSucursalId(activeSession.hasActive ? activeSession.sucursalId : null);
    setShowWizard(true);
    // ...
  }
};
```

Y en el render — `Index.tsx` linea 258:
```tsx
<InitialWizardModal
  initialSucursalId={activeCashCutSucursalId}
  // ...
/>
```

`activeCashCutSucursalId` se pasa como `initialSucursalId` al wizard,
y el controller lo usa para preseleccionar.

## 3. Analisis: Es Bug o Feature?

### Argumento "Es una feature legitima":

- Si hay sesion activa en "Plaza Merliot", tiene sentido que el wizard
  preseleccione esa sucursal
- Evita que el usuario seleccione una sucursal DIFERENTE creando conflicto
- Implementado intencionalmente en DACC-CIERRE como politica de sync

### Argumento "Es un bug UX":

- El usuario NO pidio que se preseleccione nada
- No hay indicacion visual de POR QUE esta preseleccionada
- Parece "magico" — el usuario no sabe que hay sesion activa hasta Step 5
- Si el panel de sesion activa esta en Step 5, la preseleccion en Step 2 es una
  "filtracion de informacion" que contradice la decision R2 de ocultar hasta Step 5

### Argumento "Es inconsistente con R2":

En R2 se decidio que la notificacion de sesion activa se muestra SOLO en Step 5
para evitar que otros empleados vean que hay un corte pendiente.
Pero la sucursal preseleccionada en Step 2 es una PISTA indirecta de que hay
sesion activa — rompe parcialmente la privacidad de R2.

## 4. Opciones de Solucion

### Opcion A — Eliminar preseleccion (consistencia con R2):

Remover el useEffect de lineas 89-94. El usuario selecciona sucursal manualmente.
Despues en Step 5, si hay sesion activa, el panel la muestra.

- Pro: Consistente con filosofia R2 (no revelar nada antes de Step 5)
- Contra: Usuario puede seleccionar sucursal DIFERENTE a la de sesion activa,
  creando conflicto de datos

### Opcion B — Mantener preseleccion + agregar indicador visual:

Mantener el useEffect pero agregar texto explicativo en Step 2:
"Sucursal preseleccionada por sesion en progreso"

- Pro: Usuario entiende por que esta preseleccionada
- Contra: Revela sesion activa en Step 2 (viola principio R2)

### Opcion C — Preseleccionar PERO con lock en Step 5:

Mantener preseleccion silenciosa (sin texto). En Step 5, si la sucursal
seleccionada no coincide con la sesion activa, mostrar advertencia.

- Pro: No revela info en Step 2, valida en Step 5
- Contra: Complejidad adicional

### Opcion D — Preseleccionar solo si el panel lo va a mostrar en Step 5:

Preseleccionar es valido PORQUE el usuario vera la explicacion en Step 5.
La preseleccion previene que cambie de sucursal accidentalmente.
Pero agregar `disabled` al selector de sucursal cuando hay sesion activa.

- Pro: Prevencion de conflictos + coherencia
- Contra: Restringe libertad del usuario sin explicacion visible en Step 2

## 5. Recomendacion

**Opcion A** si la prioridad es consistencia con R2 (no revelar nada antes de Step 5).
**Opcion D** si se quiere prevenir conflictos de sucursal.

La decision depende del Authority.

## 6. Archivos Afectados

| Archivo | Cambio (Opcion A) | Cambio (Opcion D) |
|---------|-------------------|-------------------|
| `src/hooks/initial-wizard/useInitialWizardController.ts` | Eliminar useEffect L89-94 | Mantener + pasar lock state |
| `src/components/initial-wizard/steps/Step2StoreSelection.tsx` | Ninguno | Agregar disabled si lock |
| `src/types/initialWizard.ts` | Ninguno | Nueva prop `storeSelectionLocked?` |

## 7. Complejidad Estimada

- **Opcion A:** Muy baja (eliminar 5 lineas)
- **Opcion D:** Baja (5-10 lineas + 1 prop)
- Tests TDD: ~2-3 tests
