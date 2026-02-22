# Mapeo Integral Fuentes de Datos -> Supabase

**Fecha:** 2026-02-17  
**Caso:** `Caso_Mapeo_Integral_Persistencia_Supabase_Corte_20260217/`

## 1) Flujo enroutado hoy (produccion local actual)
1. `src/App.tsx:64-67` enruta solo `"/"` a `Index`.
2. `src/pages/Index.tsx:76-132` abre `InitialWizardModal` y luego `CashCounter`.
3. En ese flujo no se usa `useCorteSesion` (hook que escribe a Supabase).

**Conclusion:** el flujo principal captura datos operativos, pero no los persiste de forma integral en Supabase.

## 2) Flujo que SI persiste en Supabase (actualmente no enroutado en `/`)
1. `src/components/corte/CorteOrquestador.tsx:62-71` usa `useCorteSesion`.
2. `src/hooks/useCorteSesion.ts` realiza inserts/updates en:
   - `cortes`
   - `corte_intentos`

### 2.1 Escrituras confirmadas por codigo
- **Inicio de corte**  
  `src/hooks/useCorteSesion.ts:141-177`  
  Inserta en `cortes`: `sucursal_id, cajero, testigo, estado, correlativo, fase_actual, intento_actual, venta_esperada, ...`  
  Inserta en `corte_intentos`: `corte_id, attempt_number, estado, snapshot_datos, motivo_reinicio, finalizado_at`.

- **Guardado de progreso**  
  `src/hooks/useCorteSesion.ts:221-235`  
  Actualiza `cortes.datos_conteo` con objeto:
  - `conteo_parcial`
  - `pagos_electronicos`
  - `gastos_dia`

- **Finalizacion**  
  `src/hooks/useCorteSesion.ts:278-285`  
  Actualiza `cortes` con `estado=FINALIZADO`, `reporte_hash`, `finalizado_at`, `updated_at`.

- **Aborto / reinicio**  
  `src/hooks/useCorteSesion.ts:346-369`, `412-419`, `447-457`  
  Guarda snapshots en `corte_intentos.snapshot_datos` (solo desde `corteActual.datos_conteo`) y limpia datos del corte en reinicio.

### 2.2 Brecha funcional en el puente con CashCounter
- `src/components/corte/CorteConteoAdapter.tsx:52-60` pasa `onBack/onFlowCancel -> onConteoCompletado`.
- `src/components/corte/CorteOrquestador.tsx:178-197` finaliza con hash.
- No existe puente que llame `guardarProgreso` con cada avance de conteo/fase.

**Impacto:** se puede finalizar corte sin persistir todo el detalle capturado en UI.

## 3) Datos que captura la UI (modelo funcional)
### 3.1 Datos de configuracion inicial
- Sucursal/cajero/testigo/SICAR:
  - `src/pages/Index.tsx:22-28`
  - `src/components/initial-wizard/steps/Step5SicarInput.tsx:45-50`

### 3.2 Conteo fase 1
- Denominaciones:
  - `src/types/cash.ts:19-34`
- Electronicos:
  - `src/types/cash.ts:36-41`
- Estado de captura:
  - `src/hooks/useCashCounterOrchestrator.ts:120-128,232-245`

### 3.3 Gastos
- Estructura completa `DailyExpense`:
  - `src/types/expenses.ts:60-140`
- Captura en wizard:
  - `src/components/initial-wizard/steps/Step6Expenses.tsx:21-26`

### 3.4 Entrega y verificacion ciega
- `DeliveryCalculation` y `verificationBehavior`:
  - `src/types/phases.ts:26-49`
  - `src/types/verification.ts:76-198`
- Construccion en runtime:
  - `src/hooks/usePhaseManager.ts:88-115,149-177`

### 3.5 Reporte final
- Datos completos de reporte:
  - `src/utils/generate-evening-report.ts:24-65`
  - Incluye cash/electronico/gastos/deliveries/verificacion/checklists.

## 4) Estado real de tablas Supabase (inspeccion 2026-02-17)
Consulta operativa ejecutada contra entorno real:

```text
table=sucursales count=3 sample_keys=activa,codigo,created_at,id,nombre,updated_at
table=empleados count=5 sample_keys=activo,created_at,id,nombre,updated_at
table=empleado_sucursales count=6 sample_keys=created_at,empleado_id,sucursal_id
table=cortes count=4 sample_keys=cajero,correlativo,created_at,datos_conteo,datos_entrega,datos_reporte,datos_verificacion,estado,fase_actual,finalizado_at,id,intento_actual,motivo_aborto,reporte_hash,sucursal_id,testigo,updated_at,venta_esperada
table=corte_intentos count=7 sample_keys=attempt_number,corte_id,created_at,estado,finalizado_at,id,motivo_reinicio,snapshot_datos
```

Observacion clave:
- En entorno real, `empleado_sucursales` no expone `activo`/`activa`.
- El hook es tolerante a eso (`src/hooks/useEmpleadosSucursal.ts:33-37,78`).

## 5) Diagnostico ejecutivo
1. La plataforma SI tiene estructura para persistir detalles (`datos_conteo`, `datos_entrega`, `datos_verificacion`, `datos_reporte`).
2. El flujo UI activo en `/` no usa la capa de persistencia `useCorteSesion`.
3. Aun en el flujo que usa `useCorteSesion`, no hay wiring completo para guardar todo lo que el empleado captura (fase a fase).
4. Riesgo actual: perdida de trazabilidad de monedas, electronicos, gastos, verificacion y reporte final.
