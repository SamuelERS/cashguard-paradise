# Evidencia de Implementación

**Fecha:** 2026-02-17  
**Caso:** `Caso_Investigacion_Flujo_Empleados_Supabase_20260217/`

## Cambios aplicados
- Se creó `src/hooks/useEmpleadosSucursal.ts`:
  - Fuente principal: `empleado_sucursales` + `empleados` en Supabase.
  - Filtrado de activos.
  - Dedupe de `empleado_id`.
  - `recargar()` y fallback a catálogo local cuando Supabase no está configurado.
- Se extendió `src/lib/supabase.ts`:
  - Nuevas tablas tipadas: `empleados`, `empleado_sucursales`.
  - Nuevos helpers: `tables.empleados()`, `tables.empleadoSucursales()`.
- Se actualizó `src/hooks/useCashCounterOrchestrator.ts`:
  - Catálogo de sucursales prioriza `useSucursales`.
  - Empleados por sucursal priorizan `useEmpleadosSucursal`.
  - Mantiene fallback local para compatibilidad.
- Se actualizó `src/components/cash-counter/StoreSelectionForm.tsx`:
  - Ya no importa `STORES` directamente.
  - Recibe `stores` desde props.
  - Muestra estado de carga/error de empleados.
- Se actualizó `src/components/CashCounter.tsx` para pasar nuevas props del orquestador.

## Cobertura agregada
- `src/hooks/__tests__/useEmpleadosSucursal.test.ts` (nuevo):
  - Estado con sucursal nula.
  - Carga exitosa con dedupe.
  - Error en asignaciones.
  - Error en empleados.
  - Fallback local.
  - Recarga con datos nuevos.
- `src/hooks/__tests__/useCashCounterOrchestrator.test.ts`:
  - Catálogo remoto de sucursales.
  - Priorización de empleados remotos.
  - Fallback legacy.
- `src/lib/__tests__/supabase.test.ts`:
  - Validación de nuevos helpers y tipos de tablas.

## Validación ejecutada
```bash
npx vitest run src/hooks/__tests__/useEmpleadosSucursal.test.ts src/hooks/__tests__/useCashCounterOrchestrator.test.ts src/lib/__tests__/supabase.test.ts
npm run -s build
```

## Resultado de validación
- Tests: **33 passed / 0 failed**
- Build: **OK** (Vite build + PWA assets generados)

## Diagnóstico final
La inconsistencia principal estaba en la fuente de datos del flujo de configuración inicial:
- Antes: `STORES`/`EMPLOYEES` hardcodeados para ese flujo.
- Ahora: prioridad a Supabase en sucursales y empleados por sucursal, con fallback controlado.

Esto reduce el riesgo de catálogos incompletos cuando la base de datos ya contiene cambios recientes.
