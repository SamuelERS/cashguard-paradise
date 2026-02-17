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

## Estado Actual
- Fix quirurgico aplicado para quitar filtro inicial en cajero precargado cuando hay catalogo multiple.
- Build local y tests del flujo corte en verde.
- Plan modular TDD preparado para unificar catalogos y cerrar deuda de doble fuente.
