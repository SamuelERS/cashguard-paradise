# Caso: Investigacion Doble Fuente Catalogos 20260217

| Campo | Valor |
|---|---|
| Fecha inicio | 2026-02-17 |
| Estado | EN_PROGRESO |
| Prioridad | Alta |
| Responsable | Equipo Desarrollo |

## Objetivo
Eliminar inconsistencias de flujo causadas por fuentes duplicadas de sucursales/empleados, priorizando Supabase como fuente unica de verdad.

## Resumen Ejecutivo
Se confirmo inconsistencia estructural: el flujo nuevo de corte usa Supabase (`useEmpleadosSucursal` + `useSucursales`) mientras flujos legacy usan catalogos estaticos en `src/data/paradise.ts`.

Adicionalmente, en el flujo `CorteInicio` el cajero precargado desde localStorage iniciaba el input filtrado y daba la percepcion de "solo 1 empleado" en sugerencias.

## Evidencia Tecnica
- Fuente Supabase en corte:
  - `src/hooks/useEmpleadosSucursal.ts`
  - `src/hooks/useSucursales.ts`
- Fuente estatica legacy:
  - `src/data/paradise.ts`
  - `src/hooks/useCashCounterOrchestrator.ts`
  - `src/components/cash-counter/StoreSelectionForm.tsx`
- UI de corte afectada por prefill:
  - `src/components/corte/CorteInicio.tsx`
  - `src/components/corte/__tests__/CorteInicio.test.tsx`

## Progreso

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| A — Baseline y bloqueo de regresión | Test RED OT-18 + migración `useCashCounterOrchestrator` a hooks Supabase | ✅ Completado |
| B — Migración de flujos legacy | `StoreSelectionForm` con sucursales dinámicas + fallback controlado | ✅ Completado |
| C — Integridad de flujo CorteInicio | Tests de prefill + sugerencias + caso "Mostrar todos" | ⏳ Pendiente |
| D — Verificación de release | Build + tests corte + smoke manual en localhost | ⏳ Pendiente |

**Criterio de cierre:** No existe consumo productivo de catálogos estáticos para empleados/sucursales y todos los flujos usan proveedor unificado con tests en verde.

> Ver pendientes detallados en: `99_PENDIENTES_POR_REALIZAR.md`

## Contexto Técnico Completado

- Fix quirúrgico aplicado para quitar filtro inicial en cajero precargado cuando hay catálogo múltiple.
- Build local y tests del flujo corte en verde tras módulos A y B.
- Módulo A (TDD): test OT-18 en `src/hooks/__tests__/useCashCounterOrchestrator.test.ts` — RED → GREEN.
  - `useCashCounterOrchestrator` migra empleados a hooks Supabase (`useSucursales` + `useEmpleadosSucursal`) y deja de usar `getEmployeesByStore`.
- Módulo B completado:
  - `StoreSelectionForm` recibe sucursales dinámicas (`availableStores`) desde orquestador.
  - Fallback legacy de sucursales queda controlado para entornos no-productivos y solo ante error de Supabase.
