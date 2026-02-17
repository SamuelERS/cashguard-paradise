# Diagnóstico Forense: Empleados Incompletos en Inicio de Corte

**Fecha:** 2026-02-17  
**Caso:** `Caso_Investigacion_Flujo_Empleados_Supabase_20260217/`

## Síntoma reportado
- En la UI del inicio de corte se muestra solo 1 empleado en la sugerencia del cajero/testigo.
- El usuario confirma que en Supabase hay más empleados por sucursal.

## Investigación ejecutada

### 1. Verificación de código en este worktree (sesión actual)
- `src/components/corte/CorteInicio.tsx` actual: wizard de **4 pasos** con input libre, sin hook de empleados.
- `src/components/corte/CorteOrquestador.tsx` actual: no importa `useEmpleadosSucursal`.
- `src/lib/supabase.ts` actual: no define tablas `empleados` ni `empleado_sucursales`.

Conclusión: la captura del usuario (wizard 3 pasos + "Empleados registrados") **no coincide** con este árbol de código.

### 2. Verificación de worktree paralelo donde sí coincide la captura
Worktree detectado:
- `/Users/samuelers/Paradise System Labs/cashguard-paradise`
- branch: `feature/ot11-activar-corte-page-ui`
- commit: `decac6f`

En ese árbol:
- Existe `src/hooks/useEmpleadosSucursal.ts`.
- `CorteOrquestador` pasa `empleadosDisponibles` a `CorteInicio`.
- `CorteInicio` usa `<datalist>` y muestra `Empleados registrados: N`.

Conclusión: el síntoma se reproduce en una variante de código distinta al worktree actual.

### 3. Validación directa de Supabase (worktree con `.env` activo)
Consulta ejecutada (diagnóstico de lectura):
- sucursales activas
- asignaciones `empleado_sucursales` por sucursal
- empleados activos por sucursal

Resultado real:
- Los Héroes (`suc-001`): 3 asignados, 3 activos.
- Plaza Merliot (`suc-002`): 3 asignados, 3 activos.

Conclusión: el mapping de datos en Supabase **sí está correcto** para estas sucursales.

## Causas raíz (ordenadas)

### Causa raíz 1: Divergencia de ramas/worktrees
Se está comparando comportamiento de dos implementaciones diferentes:
- Worktree A: flujo OT-14/OT-17 (3 pasos + empleados sugeridos).
- Worktree B (esta sesión): flujo base (4 pasos + texto libre).

Impacto:
- Diagnósticos cruzados parecen inconsistentes.
- Se corrige un árbol, pero se valida visualmente en otro.

### Causa raíz 2: UX del `datalist` + prefill por localStorage
En el flujo OT-14:
- `CorteInicio` prellena cajero/testigo desde cache local.
- Si el input ya contiene `"Jonathan Melara"`, el `datalist` filtra por valor actual y visualmente puede mostrar solo ese empleado.

Impacto:
- Percepción de "solo hay 1 empleado", aunque backend tenga 3.
- El conteo visible depende del texto preexistente en el input.

### Causa raíz 3: Señal de sincronización no confiable en UI
`CorteStatusBanner` se renderiza con estado fijo (`online/sincronizado`) en orquestador, lo cual puede sugerir una sincronización real que no se valida en tiempo real.

Impacto:
- Falsa sensación de salud de datos.
- Dificulta detectar desalineación entre fuente real y UI.

## Hipótesis validada
El problema principal no es pérdida de datos en Supabase.  
El problema operativo es mezcla de ramas + comportamiento de sugerencia filtrada en `datalist` con valor precargado.

## Riesgos si no se corrige
- Operación percibe catálogo incompleto y pierde confianza en el flujo.
- Se pueden elegir empleados por memoria/caché en lugar de revisar la lista completa.
- Se incrementa riesgo de errores de auditoría por inconsistencias de entorno.

## Siguiente paso
Ejecutar plan en `02_Plan_Implementacion_y_Cobertura.md` y matriz de `03_Matriz_Pruebas.md`.
