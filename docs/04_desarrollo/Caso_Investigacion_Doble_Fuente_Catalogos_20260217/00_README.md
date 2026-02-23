# Caso: Investigacion Doble Fuente Catalogos 20260217

| Campo | Valor |
|---|---|
| Fecha inicio | 2026-02-17 |
| Estado | COMPLETADO |
| Prioridad | Alta |
| Responsable | Equipo Desarrollo |

## Objetivo
Eliminar inconsistencias de flujo causadas por fuentes duplicadas de sucursales/empleados, priorizando Supabase como fuente unica de verdad.

## Resumen Ejecutivo
Se confirmo inconsistencia estructural: el flujo nuevo de corte usa Supabase (`useEmpleadosSucursal` + `useSucursales`) mientras flujos legacy usan catalogos estaticos en `src/data/paradise.ts`.

Adicionalmente, en el flujo `CorteInicio` el cajero precargado desde localStorage iniciaba el input filtrado y daba la percepcion de "solo 1 empleado" en sugerencias.

## Evidencia Tecnica
- Fuente Supabase (migrados ✅):
  - `src/hooks/useEmpleadosSucursal.ts`
  - `src/hooks/useSucursales.ts`
  - `src/hooks/useCashCounterOrchestrator.ts` — migrado en Módulo A
  - `src/components/cash-counter/StoreSelectionForm.tsx` — migrado en Módulo B
- Fuente estatica residual (solo en paradise.ts; no en flujos productivos post-Módulos A+B):
  - `src/data/paradise.ts`
- UI de corte creada (Módulo C — greenfield, completado):
  - `src/components/corte/CorteInicio.tsx` — ✅ Presentacional puro (TDD GREEN)
  - `src/components/corte/__tests__/CorteInicio.test.tsx` — ✅ 8 tests (4 suites)
  - `src/components/corte/CorteOrquestador.tsx` — ✅ Orquestador hooks Supabase (TDD GREEN)
  - `src/components/corte/__tests__/CorteOrquestador.test.tsx` — ✅ 5 tests (Suite E)
  - `src/pages/Index.tsx` — ✅ Integración render branch CorteOrquestador

## Progreso

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| A — Baseline y bloqueo de regresión | Test RED OT-18 + migración `useCashCounterOrchestrator` a hooks Supabase | ✅ Completado |
| B — Migración de flujos legacy | `StoreSelectionForm` con sucursales dinámicas + fallback controlado | ✅ Completado |
| C — Integridad de flujo CorteInicio | Tests de prefill + sugerencias + caso "Mostrar todos" + CorteOrquestador + integración Index.tsx | ✅ Completado |
| D — Verificación de release | Build + tests corte + tsc + guardian grep | ✅ Completado |

**Criterio de cierre:** No existe consumo productivo de catálogos estáticos para empleados/sucursales y todos los flujos usan proveedor unificado con tests en verde.

> Ver pendientes detallados en: [`99_PENDIENTES_POR_REALIZAR.md`](99_PENDIENTES_POR_REALIZAR.md)
>
> **Plan de implementación (Módulos C+D) — V2 corregido:** [`docs/plans/2026-02-23-dirm-doble-fuente-catalogos-modulos-cd-v2.md`](../../../plans/2026-02-23-dirm-doble-fuente-catalogos-modulos-cd-v2.md)
>
> **Plan V1 (superseded — solo referencia histórica):** [`docs/plans/2026-02-23-dirm-doble-fuente-catalogos-modulos-cd.md`](../../../plans/2026-02-23-dirm-doble-fuente-catalogos-modulos-cd.md)

## Módulo C+D — Evidencia de Cierre (2026-02-23)

| Verificación | Resultado |
|---|---|
| Tests corte (vitest) | 13/13 passing (8 CorteInicio + 5 CorteOrquestador) |
| TypeScript (tsc --noEmit) | 0 errors |
| Build (npm run build) | OK — 2.22s |
| Guardian grep (`@/data/paradise` en código productivo) | 0 hits (solo en tests) |

### Commits Módulo C+D
- `fd233f0` — test(corte): RED — CorteInicio 7 scenarios
- `86b8a90` — feat(corte): CorteInicio — datalist completo, prefill disociado, acción mostrar-todos
- `10fba7f` — test(corte): RED — CorteOrquestador 5 scenarios
- `5612bcb` — feat(corte): CorteOrquestador — wires useEmpleadosSucursal + useCorteSesion (TDD GREEN)
- `e46b311` — feat(corte): integración CorteOrquestador en Index.tsx — render branch CASH_CUT

## Contexto Técnico Completado

- Fix quirúrgico aplicado para quitar filtro inicial en cajero precargado cuando hay catálogo múltiple.
- Build local y tests del flujo corte en verde tras módulos A y B.
- Módulo A (TDD): test OT-18 en `src/hooks/__tests__/useCashCounterOrchestrator.test.ts` — RED → GREEN.
  - `useCashCounterOrchestrator` migra empleados a hooks Supabase (`useSucursales` + `useEmpleadosSucursal`) y deja de usar `getEmployeesByStore`.
- Módulo B completado:
  - `StoreSelectionForm` recibe sucursales dinámicas (`availableStores`) desde orquestador.
  - Fallback legacy de sucursales queda controlado para entornos no-productivos y solo ante error de Supabase.
