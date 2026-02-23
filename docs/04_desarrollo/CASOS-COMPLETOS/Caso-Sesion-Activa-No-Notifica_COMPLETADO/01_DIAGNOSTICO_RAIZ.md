# 01 - Diagnostico Raiz

## Resumen Ejecutivo
El sistema de sincronizacion Supabase **funciona correctamente a nivel tecnico**.
Los datos del corte de caja SE persisten en la tabla `cortes` con estados
`INICIADO` o `EN_PROGRESO`. El problema es **exclusivamente de UX**: cuando el
usuario reinicia la app y selecciona CASH_CUT nuevamente, el wizard se abre
sin ninguna indicacion visual de que existe una sesion activa previa.

## Data Flow Actual (Completo)

### Paso 1: Usuario selecciona "Corte de Caja"
```
Index.tsx:handleModeSelection(CASH_CUT)
  |
  v
setCashCutSessionCheckInProgress(true)  -- Spinner/loading
  |
  v
detectActiveCashCutSession()  -- Query a Supabase
```

### Paso 2: Deteccion en Supabase
```
tables.cortes()
  .select('id,sucursal_id')
  .in('estado', ['INICIADO', 'EN_PROGRESO'])
  .order('created_at', { ascending: false })
  .limit(1)
  .maybeSingle()
```
**RESULTADO:** Retorna `{ hasActive: true, sucursalId: 'xxx' }` si hay sesion activa.

### Paso 3: Apertura del Wizard (EL GAP)
```
setActiveCashCutSucursalId(activeSession.sucursalId)  -- Guarda ID internamente
setShowWizard(true)                                    -- Abre wizard
setCashCutSessionCheckInProgress(false)                -- Quita loading
```
**PROBLEMA:** Entre paso 2 y paso 3, NO hay ninguna notificacion al usuario.
El wizard se abre exactamente igual que si fuera una sesion nueva.

### Paso 4: Pre-seleccion Silenciosa en Wizard
```
useInitialWizardController.ts (lineas 88-94):
useEffect(() => {
  if (isOpen && initialSucursalId && !wizardData.selectedStore) {
    updateWizardData({ selectedStore: initialSucursalId });
  }
}, [isOpen, initialSucursalId]);
```
**PROBLEMA:** La sucursal se pre-selecciona silenciosamente. El usuario
no sabe POR QUE esa sucursal ya esta seleccionada.

### Paso 5: Despues del Wizard
```
handleWizardComplete() ejecuta:
  - Si activeCashCutSucursalId existe:
      - setSyncEstado('sincronizado')  -- Reanuda sesion existente
  - Si NO existe:
      - iniciarCorte()                 -- Crea sesion nueva
```
**ESTO SI FUNCIONA:** La sesion se reanuda correctamente. Pero el
usuario nunca supo que se estaba reanudando.

## Diagrama del GAP

```
FLUJO ACTUAL (sin notificacion):

[Seleccionar CASH_CUT] --> [Detectar sesion] --> [Abrir wizard normal]
                                                        |
                                                  (usuario no sabe
                                                   que hay sesion)
                                                        |
                                                  [Completar wizard]
                                                        |
                                                  [Reanudar sesion]
                                                  (funciona bien pero
                                                   usuario no confia)

FLUJO ESPERADO (con notificacion):

[Seleccionar CASH_CUT] --> [Detectar sesion] --> [NOTIFICAR USUARIO]
                                                        |
                                                  "Se detecto una sesion
                                                   activa en [Sucursal X]"
                                                        |
                                                  [Reanudar] o [Nueva]
                                                        |
                                                  [Usuario confia en
                                                   el sistema]
```

## Respuesta a la Pregunta del Usuario
> "realmente guardo la sesion o no?"

**SI, la sesion se guarda.** La prueba tecnica es:
1. `iniciarCorte()` en `useCorteSesion.ts` ejecuta INSERT en tabla `cortes`
2. `guardarProgreso()` actualiza el registro con datos parciales
3. `detectActiveCashCutSession()` consulta registros con estado `INICIADO`/`EN_PROGRESO`
4. Si encuentra registro, retorna `{ hasActive: true, sucursalId }`

El problema es que este resultado POSITIVO de deteccion no se comunica al usuario.

## Severidad
- **Funcional:** BAJA (el sistema funciona correctamente internamente)
- **UX/Confianza:** ALTA (el usuario duda de si el sistema guarda datos)
- **Anti-fraude:** MEDIA (sin notificacion, un usuario podria crear sesiones duplicadas sin saberlo)
