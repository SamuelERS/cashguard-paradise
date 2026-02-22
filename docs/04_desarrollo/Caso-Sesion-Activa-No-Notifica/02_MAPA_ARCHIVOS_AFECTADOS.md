# 02 - Mapa de Archivos Afectados

## Archivos que Requieren Modificacion

### Archivo 1: `src/pages/Index.tsx`
- **Rol:** Orquestador central del flujo CASH_CUT
- **Lineas clave:**
  - 167-194: `detectActiveCashCutSession()` - deteccion Supabase
  - 197-216: `handleModeSelection()` - donde se abre el wizard
  - 205: `setActiveCashCutSucursalId()` - guarda resultado deteccion
  - 206: `setShowWizard(true)` - abre wizard sin notificacion
  - 232: `initialSucursalId={activeCashCutSucursalId}` - prop al wizard
- **Cambio necesario:** Pasar estado booleano `hasActiveSession` al wizard
  ademas del `sucursalId`, para que el wizard pueda mostrar notificacion.

### Archivo 2: `src/components/InitialWizardModal.tsx`
- **Rol:** Componente modal del wizard de corte de caja
- **Lineas clave:** Recibe prop `initialSucursalId` (linea ~232 de Index.tsx)
- **Cambio necesario:** Recibir nueva prop indicando sesion activa detectada
  y renderizar banner/notificacion en el wizard.

### Archivo 3: `src/hooks/initial-wizard/useInitialWizardController.ts`
- **Rol:** Logica del wizard (estado, navegacion, validacion)
- **Lineas clave:**
  - 88-94: Pre-seleccion silenciosa de sucursal por `initialSucursalId`
- **Cambio necesario:** Exponer estado `hasActiveSession` para que la vista
  pueda renderizar el banner condicionalmente.

## Archivos de Referencia (NO Requieren Cambio)

### `src/hooks/useCorteSesion.ts`
- **Rol:** Hook de ciclo de vida completo de sesion Supabase
- **Estado:** FUNCIONA CORRECTAMENTE - no requiere cambios
- **Funciones relevantes:** `iniciarCorte`, `guardarProgreso`, `recuperarSesion`

### `src/lib/supabase.ts`
- **Rol:** Cliente Supabase singleton + helpers tipados
- **Estado:** FUNCIONA CORRECTAMENTE - no requiere cambios
- **Relevante:** `isSupabaseConfigured`, `tables.cortes()`

### `src/components/corte/CorteStatusBanner.tsx`
- **Rol:** Banner de estado de sincronizacion
- **Estado:** FUNCIONA CORRECTAMENTE despues del wizard
- **Nota:** Solo se renderiza dentro de CashCounter (post-wizard).
  Se podria reutilizar como referencia de estilo para el nuevo banner.

## Diagrama de Dependencias

```
Index.tsx
  |-- detectActiveCashCutSession() --> supabase.ts (tables.cortes)
  |-- handleModeSelection()
  |     |-- setActiveCashCutSucursalId(sucursalId)
  |     |-- setShowWizard(true)
  |
  |-- <InitialWizardModal
  |       initialSucursalId={activeCashCutSucursalId}  <-- EXISTE
  |       hasActiveSession={???}                        <-- FALTA
  |   />
  |
  |-- InitialWizardModal
        |-- useInitialWizardController(initialSucursalId)
        |     |-- Pre-selecciona sucursal silenciosamente
        |
        |-- [FALTA: Banner "Sesion activa detectada"]
```

## Resumen de Impacto
- **Archivos a modificar:** 3 (Index.tsx, InitialWizardModal.tsx, useInitialWizardController.ts)
- **Archivos nuevos:** 0 (reutilizar componentes existentes)
- **Lineas estimadas:** 30-50 lineas de cambio total
- **Riesgo de regresion:** BAJO (cambios son aditivos, no modifican logica existente)
