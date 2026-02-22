# Evidencia Modulo A - Entorno Supabase Real

**Fecha:** 2026-02-17  
**Caso:** `Caso_Estrategia_UI_Datos_Reales_20260217/`  
**Modulo:** A (Entorno y fuente real)

## Objetivo validado
Confirmar que el flujo local usa Supabase real (no mock legacy) para sucursales y empleados, con pruebas automatizadas y validacion operativa en navegador.

## Evidencia 1 - Tests (test-first + regresion)
Comando ejecutado:

```bash
npx vitest run \
  src/hooks/__tests__/useSucursales.supabase.test.ts \
  src/hooks/__tests__/useEmpleadosSucursal.test.ts \
  src/lib/__tests__/supabase.test.ts \
  src/lib/__tests__/devServiceWorkerCleanup.test.ts \
  src/components/corte/__tests__/CorteConteoAdapter.test.tsx
```

Resultado:
- `Test Files: 5 passed`
- `Tests: 57 passed`
- `0 failed`

## Evidencia 2 - Build limpio
Comando ejecutado:

```bash
npm run -s build
```

Resultado:
- Build completado correctamente (`exit 0`)
- PWA generada (`dist/sw.js`, `dist/workbox-*.js`)

## Evidencia 3 - Datos directos desde Supabase
Consulta verificada contra tablas reales (`sucursales`, `empleado_sucursales`, `empleados`):

```text
sucursales_activas 2
sucursal:H nombre:Los Héroes asignaciones_activas:3 empleados_activos:3
sucursal:M nombre:Plaza Merliot asignaciones_activas:3 empleados_activos:3
```

## Evidencia 4 - Flujo local en navegador (Playwright)
Validacion automatizada del wizard de corte nocturno en `http://127.0.0.1:5173/`:

- Sucursales visibles en UI (paso 2):
  - `Los Héroes`
  - `Plaza Merliot`
- Empleados visibles en UI (paso 3):
  - `Tito Gomez`
  - `Adonay Torres`
  - `Jonathan Melara`

Requests detectados en runtime (fuente real):

```text
https://gjoeiqhxvbvdrgkjtohv.supabase.co/rest/v1/sucursales?...
https://gjoeiqhxvbvdrgkjtohv.supabase.co/rest/v1/empleado_sucursales?...
https://gjoeiqhxvbvdrgkjtohv.supabase.co/rest/v1/empleados?...
```

Captura local de evidencia:
- `docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/assets/modulo-a-validacion-local-step3.png`

## Diagnostico confirmado
1. La causa principal de catalogos incompletos era ejecucion local sin credenciales/entorno real en algunos ciclos previos (caida a fallback).
2. Con entorno real activo, el mapeo actual devuelve catalogo completo por sucursal.
3. El contrato de lectura de `empleado_sucursales` fue robustecido para columnas `activo/activa`, evitando falsos negativos por diferencias de esquema.

## Estado de Modulo A
**CERRADO (PASS)** para entorno local validado con evidencia.
