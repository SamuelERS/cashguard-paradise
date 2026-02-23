# 03 - Guia Arquitectonica de la Solucion UX

## Objetivo
Notificar visualmente al usuario cuando el sistema detecta una sesion activa
de corte de caja en Supabase, dando confianza de que los datos SI se guardaron
y permitiendo reanudar conscientemente.

## Solucion Propuesta: Banner de Sesion Activa en Wizard

### Concepto UX
Cuando `detectActiveCashCutSession()` retorna `hasActive: true`, el wizard
debe mostrar un banner informativo ANTES del primer paso, comunicando:

1. Que se detecto una sesion activa previa
2. En que sucursal estaba la sesion
3. Que la sucursal se pre-selecciono automaticamente
4. Que el usuario puede continuar con esa sesion

### Mockup Visual (ASCII)

```
+--------------------------------------------------+
|  InitialWizardModal                           [X] |
|                                                    |
|  +----------------------------------------------+ |
|  | (i) Se detecto una sesion activa              | |
|  |     Sucursal: Los Heroes                      | |
|  |     La sesion se reanudara automaticamente.   | |
|  +----------------------------------------------+ |
|                                                    |
|  Paso 1 de 5 - Protocolo de Seguridad             |
|  [... contenido normal del paso ...]               |
|                                                    |
|  [Continuar]                                       |
+--------------------------------------------------+
```

### Arquitectura de Cambios (3 Archivos)

#### Cambio 1: Index.tsx - Pasar estado de sesion activa

**Ubicacion:** Funcion `handleModeSelection` (lineas 197-216)

**Estado actual:**
```
setActiveCashCutSucursalId(activeSession.hasActive ? activeSession.sucursalId : null);
setShowWizard(true);
```

**Cambio propuesto:**
- El estado `activeCashCutSucursalId` ya contiene la informacion necesaria
- Cuando es `!== null`, significa que hay sesion activa
- El wizard ya recibe `initialSucursalId={activeCashCutSucursalId}`
- Necesidad: Pasar TAMBIEN un booleano explicito `hasActiveSession`
  para que el wizard sepa que debe mostrar el banner

**Razon del booleano separado:**
- `initialSucursalId` podria tener otros usos futuros (ej: pre-seleccion manual)
- Un booleano explicito hace la intencion clara en el codigo
- Separa la DETECCION (booleano) de los DATOS (sucursalId)

#### Cambio 2: InitialWizardModal.tsx - Recibir y renderizar banner

**Prop nueva:** `hasActiveSession?: boolean`

**Renderizado condicional:**
- Si `hasActiveSession === true` Y `initialSucursalId` tiene valor:
  - Mostrar banner informativo en la parte superior del modal
  - Banner debe ser visible en TODOS los pasos del wizard (persistente)
  - Usar estilo consistente con CorteStatusBanner (glass morphism, colores sistema)

**Estilo sugerido:**
- Fondo: `rgba(10, 132, 255, 0.15)` (azul informativo, consistente con sistema)
- Icono: `Info` de lucide-react
- Borde: `rgba(10, 132, 255, 0.3)`
- Texto principal: "Se detecto una sesion activa"
- Texto secundario: Nombre de la sucursal (obtenido del listado de sucursales)

#### Cambio 3: useInitialWizardController.ts - Exponer estado

**Ubicacion:** Lineas 88-94 (useEffect de pre-seleccion)

**Cambio propuesto:**
- El hook ya recibe `initialSucursalId` y pre-selecciona
- Solo necesita: Recibir `hasActiveSession` como parametro adicional
  y exponerlo en el return para que la vista lo use
- Alternativa simple: La vista puede usar directamente la prop
  sin pasar por el controller (menos acoplamiento)

**Recomendacion:** Usar la prop directamente en InitialWizardModal
sin modificar el controller. El controller maneja LOGICA de wizard,
el banner es puramente PRESENTACIONAL.

### Consideraciones Tecnicas

#### Nombre de Sucursal
- La deteccion retorna `sucursalId` (UUID), no el nombre
- El wizard ya carga sucursales via `useSucursales()` hook
- Se puede resolver el nombre haciendo lookup en el array de sucursales
- Si no se encuentra (edge case), mostrar solo "Sesion activa detectada"

#### Supabase No Configurado
- Si `isSupabaseConfigured === false`, `detectActiveCashCutSession` retorna
  `{ hasActive: false, sucursalId: null }`
- El banner NUNCA se mostrara en entornos sin Supabase (correcto)

#### Error de Red
- Si la query falla, `detectActiveCashCutSession` retorna
  `{ hasActive: false, sucursalId: null }` (graceful degradation)
- El banner NO se muestra en caso de error (conservador, correcto)

#### Persistencia del Banner
- El banner debe ser visible durante TODO el wizard (pasos 1-5)
- Desaparece naturalmente cuando el wizard se cierra
- No requiere estado propio ni dismiss manual

### Lo Que NO Cambia
- La logica de `detectActiveCashCutSession()` - funciona correctamente
- La logica de `handleWizardComplete()` - reanudacion correcta
- La logica de `useCorteSesion` - persistencia Supabase intacta
- El flujo de navegacion del wizard - mismos 5 pasos
- La pre-seleccion de sucursal - sigue funcionando igual
- CorteStatusBanner post-wizard - sigue mostrando estado sync

### Skills Relevantes (Referencia DIRM)
- `vercel-react-best-practices`: Props explícitas vs derivadas, evitar re-renders
- `react-useeffect`: El banner NO necesita useEffect (es derivado de props)
- `systematic-debugging`: Validacion post-implementacion con Playwright
