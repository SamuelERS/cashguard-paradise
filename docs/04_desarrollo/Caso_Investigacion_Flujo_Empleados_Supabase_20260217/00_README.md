# Caso: Investigación Flujo Empleados Supabase

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-17 |
| **Fecha actualización** | 2026-02-17 |
| **Estado** | 🟢 Implementado y validado |
| **Prioridad** | Alta |
| **Responsable** | Codex (GPT-5) |

## Resumen
Se investiga por qué en la UI de inicio de corte aparecen empleados incompletos (solo 1 visible) aunque Supabase tenga datos correctos.  
La investigación confirmó una discrepancia entre worktrees/branches y un comportamiento de UX del `datalist` que puede aparentar catálogo incompleto.

## Contexto
El flujo de corte tiene evidencia de dos variantes activas:
- Worktree A (captura del usuario): wizard de 3 pasos con sugerencias de empleados.
- Worktree B (sesión actual): wizard de 4 pasos con input libre y sin hook de empleados.

La validación debía confirmar:
1. Si Supabase está bien mapeado.
2. Si el problema es de datos o de lógica UI.
3. Qué plan de cobertura ejecutar antes de tocar implementación.

## Documentos
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `01_Diagnostico_Forense.md` | Hallazgos, evidencia y causa raíz | ✅ |
| `02_Plan_Implementacion_y_Cobertura.md` | Plan técnico en tareas secuenciales con TDD | ✅ |
| `03_Matriz_Pruebas.md` | Casos de prueba unit/integration/e2e y comandos | ✅ |

## Resultado
Completado:
- Se implementó `useEmpleadosSucursal` para consumir `empleado_sucursales` + `empleados` desde Supabase.
- `useCashCounterOrchestrator` ahora prioriza catálogo remoto (sucursales y empleados) con fallback seguro local.
- `StoreSelectionForm` consume catálogo inyectado por el orquestador, eliminando dependencia directa de `STORES` hardcodeado en ese flujo.
- Se ejecutaron pruebas focalizadas + build en verde (33 tests pass, build OK).

## Referencias
- `src/hooks/useEmpleadosSucursal.ts`
- `src/hooks/useCashCounterOrchestrator.ts`
- `src/components/cash-counter/StoreSelectionForm.tsx`
- `src/components/CashCounter.tsx`
- `src/lib/supabase.ts`
- `docs/04_desarrollo/Caso_Investigacion_Flujo_Empleados_Supabase_20260217/04_Evidencia_Implementacion.md`
