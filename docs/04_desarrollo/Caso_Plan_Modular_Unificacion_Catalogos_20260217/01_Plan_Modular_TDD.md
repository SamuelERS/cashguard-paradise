# Plan Modular TDD: Unificación de Catálogos

**Fecha:** 2026-02-17  
**Caso:** `Caso_Plan_Modular_Unificacion_Catalogos_20260217/`

## Objetivo
Unificar la fuente de sucursales y empleados en todos los flujos relevantes, aplicando ejecución estricta **RED -> GREEN -> REFACTOR**.

## Principios no negociables
1. Primero test, luego implementación.
2. Cambios pequeños por módulo (sin monolitos).
3. No mezclar correcciones de UI con cambios de datos en el mismo bloque.
4. Cada fase cierra con evidencia (tests + build).

## Alcance de este plan
- `MorningCountWizard`
- `initial-wizard` (selectores y pasos de sucursal/cajero/testigo)
- Gobernanza de cierre de casos completados

## Fase 0: Preparación y control
### Objetivo
Dejar listo el campo de batalla y asegurar que todos trabajen con la misma estructura documental.

### Tareas
1. Confirmar carpeta destino de cierres: `docs/04_desarrollo/CASOS-COMPLETOS/`.
2. Confirmar caso activo con `00_README.md` actualizado.
3. Confirmar comandos base de validación para este ciclo.

### Criterio de aceptación
- Estructura documental creada y visible en `git status`.

## Fase 1: Contrato de datos para Morning Wizard (TDD)
### Objetivo
Validar por pruebas que el wizard matutino no dependa de catálogo local hardcodeado.

### Tareas
1. Escribir tests RED para `MorningCountWizard` con fuente remota simulada.
2. Cubrir escenarios:
   - sucursales remotas disponibles
   - empleados remotos por sucursal
   - fallback controlado cuando no hay remoto
3. Ejecutar tests y documentar fallos esperados (RED).
4. Implementar mínimo código para pasar (GREEN).
5. Ajustar legibilidad sin cambiar comportamiento (REFACTOR).

### Criterio de aceptación
- Suite de wizard matutino en verde.
- Sin romper flujos existentes.

## Fase 2: Contrato de datos para Initial Wizard (TDD)
### Objetivo
Eliminar dependencia estática en `initial-wizard` para sucursales y empleados.

### Tareas
1. Escribir tests RED para `wizardSelectors` y pasos UI relevantes.
2. Validar mapeo:
   - storeId remoto
   - resolución de nombres
   - exclusión de testigo = cajero
3. Implementar capa mínima para consumir catálogo unificado.
4. Mantener compatibilidad con IDs legacy durante transición.

### Criterio de aceptación
- Tests de `initial-wizard` en verde.
- Compatibilidad mantenida para datos históricos.

## Fase 3: Endurecimiento de regresión
### Objetivo
Asegurar que la unificación no rompe navegación ni reportes.

### Tareas
1. Ejecutar suites focalizadas de hooks/componentes tocados.
2. Ejecutar `npm run build`.
3. Levantar `npm run dev` y validar flujo principal en local.

### Criterio de aceptación
- Tests y build sin errores.
- Flujo local operativo.

## Fase 4: Cierre documental
### Objetivo
Dejar trazabilidad lista para auditoría y futuras sesiones.

### Tareas
1. Actualizar `00_README.md` del caso con estado final.
2. Registrar evidencia en documento de cierre.
3. Si el caso se completa, aplicar protocolo de traslado a `CASOS-COMPLETOS`.

### Criterio de aceptación
- Documentación cerrada y verificable.

## Smoke tests mínimos por fase
1. `npx vitest run [suites del módulo]`
2. `npm run -s build`
3. `npm run -s dev -- --host 127.0.0.1 --port 5173 --strictPort`

## Definición de terminado
- Cobertura de pruebas nueva para cada módulo migrado.
- No quedan lecturas hardcodeadas en módulos dentro del alcance.
- Evidencia documental completa del ciclo.
