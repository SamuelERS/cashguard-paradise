# Plan Arquitectonico Modular (TDD Primero)

**Fecha:** 2026-02-17  
**Caso:** `Caso_Estrategia_UI_Datos_Reales_20260217/`

## Objetivo
Alinear la UI tradicional con datos reales de Supabase como fuente canonica y preparar modernizacion segura sin romper operacion.

## Estado de ejecucion
- Modulo A: ✅ Completado (ver `04_Evidencia_Modulo_A_Validacion_Local.md`)
- Modulo B-E: 🟡 Pendientes segun plan modular

## Principios no negociables
1. Tests primero: RED -> GREEN -> REFACTOR.
2. Un solo objetivo por modulo.
3. No mezclar cambio visual grande con migracion de datos en el mismo commit.
4. Cada modulo cierra con evidencia (tests + build + validacion local).

---

## Modulo A - Entorno y fuente real (bloqueante)
### Objetivo
Garantizar que local ejecuta contra Supabase real y no fallback mock por error de entorno.

### Archivos objetivo
- `src/lib/supabase.ts`
- `.env` (local, no versionado)
- `src/hooks/useSucursales.ts`
- `src/hooks/useEmpleadosSucursal.ts`

### Tareas
1. Test RED de guardia para detectar cuando app entra a fallback sin credenciales.
2. Configurar `.env` local con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` reales.
3. Levantar app y verificar que `isSupabaseConfigured` sea verdadero en runtime.
4. Validar que sucursales y empleados provengan de tablas reales.

### Criterio de aceptacion
- La UI muestra catalogo real de sucursales/empleados.
- No se consume `SUCURSALES_MOCK` en sesion validada.

---

## Modulo B - Canon de datos en UI tradicional
### Objetivo
Consolidar la UI tradicional como flujo oficial con contratos estables de IDs/nombres y sin desviaciones legacy inesperadas.

### Archivos objetivo
- `src/pages/Index.tsx`
- `src/components/initial-wizard/InitialWizardModalView.tsx`
- `src/hooks/initial-wizard/useInitialWizardController.ts`
- `src/components/morning-count/MorningCountWizard.tsx`
- `src/components/CashCounter.tsx`
- `src/hooks/useCashCounterOrchestrator.ts`

### Tareas
1. Tests RED de integracion sobre seleccion de sucursal/cajero/testigo en wizard tradicional.
2. Verificar que IDs seleccionados se propagan intactos hasta reporte final.
3. Verificar que nombres mostrados se resuelven desde datos reales, no hardcode.
4. Cerrar cualquier fallback ambiguo que enmascare errores de mapeo.

### Criterio de aceptacion
- Flujo tradicional completo funciona con datos reales end-to-end.
- Reportes y pasos muestran actores correctos por sucursal.

---

## Modulo C - Observabilidad y diagnostico operativo
### Objetivo
Evitar diagnosticos a ciegas cuando haya desajuste de catalogos.

### Archivos objetivo
- `src/components/corte/CorteStatusBanner.tsx`
- `src/components/corte/CorteOrquestador.tsx`
- `src/lib/supabase.ts`

### Tareas
1. Test RED para estado visual de conectividad/sincronizacion real.
2. Reemplazar estado fijo de banner por estado real de conexion.
3. Agregar indicador tecnico minimo (modo real/fallback) visible en entorno dev.

### Criterio de aceptacion
- Operacion puede distinguir rapidamente si corre contra Supabase real o fallback.

---

## Modulo D - Preparacion de modernizacion (sin switch de UI)
### Objetivo
Preparar la UI nueva para paridad funcional antes de activarla.

### Archivos objetivo
- `src/components/corte/CortePage.tsx`
- `src/components/corte/CorteInicio.tsx`
- `src/components/corte/CorteOrquestador.tsx`
- `src/types/auditoria.ts`

### Tareas
1. Definir matriz de paridad (pasos obligatorios, validaciones, contratos).
2. Escribir tests RED comparando comportamiento tradicional vs nueva en escenarios criticos.
3. Ajustar contrato de entrada para que no pierda trazabilidad de IDs.

### Criterio de aceptacion
- Existe equivalencia funcional demostrable por tests.
- UI nueva lista para feature flag, aun sin reemplazar produccion local.

---

## Modulo E - Activacion gradual (Go/NoGo)
### Objetivo
Activar modernizacion solo cuando paridad y estabilidad esten probadas.

### Archivos objetivo
- `src/pages/Index.tsx`
- `src/App.tsx`
- modulo de feature flags (si aplica)

### Tareas
1. Introducir feature flag de enrutamiento UI tradicional/nueva.
2. Smoke tests manuales y e2e de ambos caminos.
3. Decidir Go/NoGo con matriz del caso.

### Criterio de aceptacion
- Cambio reversible sin downtime.
- Veredicto formal PASS antes de switch por defecto.

---

## Smoke tests minimos por modulo
1. `npx vitest run [suites del modulo]`
2. `npm run -s build`
3. `npm run dev -- --host 127.0.0.1 --port 5173`
4. Validacion manual guiada de flujo completo en UI tradicional.

## Definicion de terminado (fase actual)
- UI tradicional corre con datos reales de Supabase y evidencia de pruebas.
- Existe plan cerrado de modernizacion con gates tecnicos.
- No hay decisiones de UI tomadas por intuicion; todo queda trazado en matriz Go/NoGo.
