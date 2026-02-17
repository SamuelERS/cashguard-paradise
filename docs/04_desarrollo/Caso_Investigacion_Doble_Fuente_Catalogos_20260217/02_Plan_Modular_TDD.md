# 02 Plan Modular TDD

## Modulo A - Baseline y bloqueo de regresion

1. [x] Escribir test RED OT-18 para flujo legacy (`useCashCounterOrchestrator`) validando fuente unificada de empleados.
2. [x] Ejecutar test y validar fallo esperado.
3. [x] Migrar consumo a hooks Supabase (`useSucursales` + `useEmpleadosSucursal`).
4. [x] Re-ejecutar test y validar GREEN.

## Modulo B - Migracion de flujos legacy

1. [x] Escribir test RED para `useCashCounterOrchestrator` verificando empleados desde proveedor unificado.
2. [x] Reemplazar `getEmployeesByStore` por hook/proveedor central.
3. [ ] Validar `StoreSelectionForm` con datos dinamicos y fallback controlado solo en test/dev si aplica.
4. [x] Ejecutar suite del modulo.

## Modulo C - Integridad de flujo CorteInicio

1. Mantener tests de prefill + sugerencias completas.
2. Cubrir caso: empleado precargado + catalogo multiple.
3. Cubrir caso: accion manual "Mostrar todos".
4. Ejecutar suite completa de corte.

## Modulo D - Verificacion de release

1. `npm run build`
2. `npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx src/components/corte/__tests__/CorteOrquestador.test.tsx`
3. Smoke manual en `localhost:5173`:
   - Catalogo completo visible en cajero/testigo.
   - Sin divergencia entre sucursales/empleados respecto a Supabase.

## Criterio de cierre
No existe consumo productivo de catalogos estaticos para empleados/sucursales y todos los flujos usan proveedor unificado con tests en verde.
