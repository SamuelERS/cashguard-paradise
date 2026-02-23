# R3-B5: "Abortar Sesion" Sin Confirmacion Ni Feedback

> Severidad: ALTA
> Estado: LISTO PARA TDD
> Decision Authority: Solucion unica — Modal confirmacion + toast exito/error + fix estado condicional
> Detectado por: Usuario (testing manual)
> Quote: "cuando le das al boton de abortar simplemente no pasa absolutamente nada"

## 1. Sintoma Observable

El usuario presiona "Abortar Sesion" en el panel de Step 5. El panel desaparece
sin ninguna retroalimentacion visual. No hay:
- Modal de confirmacion ("Esta seguro?")
- Toast de exito/error
- Indicador de que la sesion fue marcada como ABORTADO en Supabase
- El usuario puede continuar el wizard como si nada hubiera pasado

## 2. Root Cause

### Handler actual — `Index.tsx` lineas 181-189:

```typescript
const handleAbortSession = useCallback(async () => {
  try {
    await abortarCorteActivo('Sesion abortada por usuario desde wizard');
  } catch (err: unknown) {
    console.warn('[Index] abortarCorte fallo (graceful degradation):', err);
  }
  setActiveCashCutSucursalId(null);
  setHasActiveCashCutSession(false);
}, [abortarCorteActivo]);
```

### Problemas identificados:

1. **Sin confirmacion:** No hay modal "Esta seguro?" antes de abortar.
   Abortar es IRREVERSIBLE (marca como ABORTADO en Supabase).

2. **Sin feedback de exito:** Despues de `await abortarCorteActivo()`, no hay
   toast ni mensaje visual. El panel simplemente desaparece.

3. **Sin feedback de error:** El catch solo hace `console.warn`. Si Supabase
   falla, el usuario no sabe que el abort no funciono. El panel se oculta
   de todas formas (lineas 187-188 se ejecutan fuera del try).

4. **Estado inconsistente en error:** Si `abortarCorteActivo` falla:
   - Supabase: sesion sigue ACTIVA (INICIADO/EN_PROGRESO)
   - UI: `activeCashCutSucursalId = null`, `hasActiveCashCutSession = false`
   - Resultado: UI dice "no hay sesion" pero Supabase dice "si hay"
   - Siguiente corte: `detectActiveCashCutSession` vuelve a encontrarla

### Funcion abortarCorte interna — `useCorteSesion.ts` lineas 344-403:

```typescript
const abortarCorte = useCallback(async (motivo?: string): Promise<void> => {
  // 1. Valida que hay corte activo
  // 2. Update corte: estado = 'ABORTADO', motivo_cierre = motivo
  // 3. Update intento: estado = 'ABANDONADO'
  // 4. Reset estado local (corteActual, intentoActual, etc.)
}, [sucursal_id, corte_actual, intento_actual]);
```

La funcion hace su trabajo correctamente en Supabase. El problema esta en
la CAPA DE PRESENTACION (Index.tsx), no en la capa de datos.

## 3. Analisis de Riesgos

### Riesgo 1 — Abort accidental:

Sin confirmacion, un tap accidental aborta la sesion permanentemente.
No hay forma de "des-abortar" (el estado ABORTADO es terminal en Supabase).

### Riesgo 2 — Falsa sensacion de exito:

El panel desaparece sin importar si Supabase respondio correctamente.
El usuario cree que aborto, pero la sesion puede seguir activa.

### Riesgo 3 — Inconsistencia UI/DB:

Si falla el abort pero la UI se limpia, la proxima vez que entre al wizard
vera el panel de sesion activa de nuevo. Experiencia confusa.

## 4. Propuesta de Solucion

### Cambio 1 — Agregar modal de confirmacion:

El proyecto ya tiene `ConfirmationModal` (usado en InitialWizardModalView.tsx
lineas 196-222 para confirmacion de retroceso y cancelacion).

Propuesta: Usar ConfirmationModal con:
- Titulo: "Abortar Sesion Activa?"
- Descripcion: "Se marcara como ABORTADO en el sistema. Esta accion no se puede deshacer."
- warningText: "Los datos del corte anterior se perderan permanentemente."
- confirmText: "Si, Abortar"
- cancelText: "Cancelar"

### Cambio 2 — Agregar feedback visual:

```typescript
// Pseudo-codigo del handler mejorado:
const handleAbortSession = useCallback(async () => {
  try {
    await abortarCorteActivo('Sesion abortada por usuario desde wizard');
    // EXITO:
    toast.success('Sesion abortada correctamente');
    setActiveCashCutSucursalId(null);
    setHasActiveCashCutSession(false);
  } catch (err: unknown) {
    // ERROR:
    toast.error('No se pudo abortar la sesion. Intente de nuevo.');
    // NO limpiar estado — mantener panel visible para reintentar
  }
}, [abortarCorteActivo]);
```

### Cambio 3 — Solo limpiar estado en exito:

Mover `setActiveCashCutSucursalId(null)` y `setHasActiveCashCutSession(false)`
DENTRO del try, despues del await exitoso. Si falla, el estado queda intacto.

## 5. Archivos Afectados

| Archivo | Cambio |
|---------|--------|
| `src/pages/Index.tsx` | Mejorar handler: estado condicional + estado para modal |
| `src/components/initial-wizard/steps/Step5SicarInput.tsx` | Agregar ConfirmationModal + toast imports |
| `src/types/initialWizard.ts` | Posible: nueva prop para estado loading del abort |

### Alternativa de ubicacion del modal:

El modal de confirmacion puede estar en:
- **Step5SicarInput.tsx** (local al panel — RECOMENDADO, aislado)
- **InitialWizardModalView.tsx** (junto a otros modales del wizard)
- **Index.tsx** (centralizado pero lejano del UI)

## 6. Complejidad Estimada

- **Media**
- ConfirmationModal ya existe como componente
- toast (sonner) ya esta configurado en el proyecto
- Cambios en 2-3 archivos
- Tests TDD: ~5-6 tests (modal aparece, confirmar aborta, cancelar cierra,
  toast exito, toast error, estado no se limpia en error)
