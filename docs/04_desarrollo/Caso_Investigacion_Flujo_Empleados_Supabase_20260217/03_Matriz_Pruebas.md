# Matriz de Pruebas: Flujo Empleados por Sucursal

**Fecha:** 2026-02-17  
**Caso:** `Caso_Investigacion_Flujo_Empleados_Supabase_20260217/`

## 1. Unit Tests

### 1.1 Hook `useEmpleadosSucursal`
- Caso A: `sucursalId` nulo -> `empleados=[]`, `cargando=false`, `error=null`.
- Caso B: asignaciones válidas + empleados activos -> lista completa ordenada.
- Caso C: empleados duplicados en asignaciones -> resultado sin duplicados.
- Caso D: error en tabla `empleado_sucursales` -> `error` set y lista vacía.
- Caso E: error en tabla `empleados` -> `error` set y lista vacía.
- Caso F: empleados inactivos -> no aparecen en lista final.

### 1.2 Componente `CorteInicio`
- Caso A: wizard de 3 pasos cuando `omitirPasoSucursal=true`.
- Caso B: muestra `Empleados registrados: N` correcto.
- Caso C: `datalist` cajero contiene todos los empleados disponibles.
- Caso D: testigo excluye cajero seleccionado.
- Caso E: prefill desde localStorage no rompe validaciones.

### 1.3 Componente `CorteOrquestador`
- Caso A: pasa `sucursalId` al hook de empleados.
- Caso B: mapea `empleadosSucursal[].nombre` a `empleadosDisponibles`.
- Caso C: en error de empleados, UI muestra aviso y mantiene flujo funcional.

## 2. Integration Tests

### 2.1 Flujo datos Supabase -> UI
- Mock `empleado_sucursales` + `empleados` por sucursal.
- Verificar que el usuario ve el total correcto y puede avanzar.

### 2.2 Flujo con caché local
- Pre-cargar `localStorage` con cajero/testigo.
- Verificar que la lista sigue siendo completa y no se interpreta como 1 empleado total.

## 3. E2E / Manual Guiado
- Ingresar al flujo con sucursal `suc-001`.
- Abrir sugerencias de cajero con input vacío.
- Verificar disponibilidad de 3 empleados.
- Seleccionar cajero, abrir testigo y validar exclusión.
- Repetir en `suc-002`.

## 4. Comandos de Validación
```bash
# Unit + integration de corte
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx
npx vitest run src/components/corte/__tests__/CorteOrquestador.test.tsx
npx vitest run src/hooks/__tests__/useEmpleadosSucursal.test.ts

# Build
npm run build
```

## 5. Evidencia mínima por corrida
- Fecha/hora.
- Commit SHA validado.
- Comandos ejecutados.
- Resumen de tests (passed/failed/skipped).
- Resultado de build.
