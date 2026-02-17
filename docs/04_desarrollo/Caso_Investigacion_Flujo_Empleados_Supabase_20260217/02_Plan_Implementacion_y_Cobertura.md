# Plan de Implementación y Cobertura

**Fecha:** 2026-02-17  
**Caso:** `Caso_Investigacion_Flujo_Empleados_Supabase_20260217/`

## Objetivo
Eliminar inconsistencias del flujo de empleados y asegurar cobertura alta de tests en fuente de datos, mapeo y UX operacional.

## Principios de ejecución
- TDD estricto: RED -> GREEN -> REFACTOR.
- Un cambio por hipótesis.
- No mezclar ramas/worktrees en validación.
- Evidencia obligatoria de comandos y resultados.

## Plan por fases

### Fase 0: Alineación de entorno (bloqueante)
1. Definir un único worktree oficial para ejecutar `npm run dev`.
2. Confirmar commit SHA visible en pantalla de debug interna o log de arranque.
3. Limpiar service workers y caches antes de validar UI.

### Fase 1: Contratos de datos (Supabase)
1. Crear tests unitarios de `useEmpleadosSucursal`:
   - Carga exitosa por sucursal.
   - Filtrado de `activo=true`.
   - Dedupe de `empleado_id`.
   - Error en `empleado_sucursales`.
   - Error en `empleados`.
   - Sucursal sin asignaciones.
2. Validar tipado de `tables.empleados()` y `tables.empleadoSucursales()`.
3. Agregar test de integración para `CorteOrquestador`:
   - `sucursalId` correcto se propaga al hook.
   - `empleadosDisponibles` llega completo a `CorteInicio`.

### Fase 2: UX y comportamiento de sugerencias
1. Test de `CorteInicio` con prefill localStorage:
   - Input prellenado no debe ocultar conteo total mostrado.
2. Test de interacción de `datalist`:
   - Estado vacío muestra catálogo completo.
   - Texto parcial filtra, pero conserva indicador de total.
3. Definir y aplicar regla UX:
   - Mostrar lista explícita fallback (no solo datalist) si hay confusión operacional.

### Fase 3: Robustez operativa
1. Reemplazar estado fijo de "conectado/sincronizado" por estado real de conectividad.
2. Agregar tests para banner:
   - online/synced
   - online/pending
   - offline
3. Prueba e2e de flujo completo:
   - seleccionar sucursal
   - verificar lista completa de empleados
   - seleccionar cajero/testigo
   - iniciar corte

## Criterios de aceptación
- El total de empleados por sucursal en UI coincide con Supabase para `suc-001` y `suc-002`.
- Ningún escenario muestra lista incompleta por causa no explicada en UI.
- Test suite de módulos tocados pasa al 100%.
- Build y typecheck en verde.

## Entregables
- Tests nuevos en hooks/componentes de corte.
- Ajustes mínimos de UX si el `datalist` sigue induciendo error operacional.
- Evidencia de ejecución: comandos + salida resumida.
