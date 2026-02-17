# Matriz Captura vs Persistencia

**Fecha:** 2026-02-17  
**Objetivo:** verificar cobertura de persistencia de todos los datos operativos ingresados por el empleado.

## Leyenda
- `CAPTURADO`: existe en UI/estado local.
- `PERSISTIDO`: llega a Supabase en flujo actual.
- `BRECHA`: riesgo de perdida o inconsistencia.

## Matriz
| Bloque | Campos clave | Capturado | Persistido | Ubicacion tecnica | Brecha |
|---|---|---|---|---|---|
| Identidad corte | sucursal_id, cajero, testigo | Sí | Parcial (flujo no enroutado) | `src/hooks/useCorteSesion.ts:141-147` | El flujo principal (`Index`) no pasa por este hook |
| SICAR | venta_esperada | Sí | Parcial | `src/components/initial-wizard/steps/Step5SicarInput.tsx:45-50`, `src/hooks/useCorteSesion.ts:151` | Solo se guarda si se usa `iniciarCorte` del flujo `corte/*` |
| Conteo monedas/billetes | penny..bill100 | Sí | No confiable en flujo activo | `src/types/cash.ts:19-34`, `src/hooks/useCorteSesion.ts:221-226` | `guardarProgreso` no está cableado desde `CashCounter` en ruta `/` |
| Pagos electronicos | credomatic,promerica,bankTransfer,paypal | Sí | No confiable en flujo activo | `src/types/cash.ts:36-41`, `src/hooks/useCorteSesion.ts:221-226` | Mismo problema de wiring |
| Gastos del dia | id,concept,amount,category,hasInvoice,timestamp | Sí | No confiable en flujo activo | `src/types/expenses.ts:60-140`, `src/hooks/useCorteSesion.ts:221-226` | Se capturan en wizard, no hay persistencia integral garantizada |
| Entrega fase 2 | amountToDeliver, denominationsToDeliver, denominationsToKeep, amountRemaining | Sí | No | `src/types/phases.ts:26-49` | `datos_entrega` nunca se actualiza desde UI |
| Verificacion ciega | attempts, severity flags, denominaciones con issues | Sí | No | `src/types/verification.ts:76-198` | `datos_verificacion` nunca se actualiza desde UI |
| Reporte final | totals, difference, expenses summary, delivery checks, pending deliveries snapshot | Sí | No (solo hash) | `src/utils/generate-evening-report.ts:24-65`, `src/hooks/useCorteSesion.ts:278-285` | Solo persiste `reporte_hash`, no `datos_reporte` |
| Snapshot intentos | snapshot_datos | Parcial | Sí (pero limitado) | `src/hooks/useCorteSesion.ts:360-369,412-419` | Snapshot se nutre de `datos_conteo`; si este no se guardó, snapshot llega incompleto |
| Catalogo sucursales | id,nombre,codigo,activa | Sí | Sí (lectura) | `src/hooks/useSucursales.ts:46-50` | Sin brecha relevante |
| Catalogo empleados | empleado_sucursales + empleados | Sí | Sí (lectura) | `src/hooks/useEmpleadosSucursal.ts:69-113` | Esquema real no trae `activo` en pivote; hook ya tolera ausencia |

## Conclusiones de cobertura
1. El riesgo mayor no es el esquema de Supabase, sino el acoplamiento incompleto del flujo UI activo con la capa de persistencia.
2. El sistema hoy guarda metadatos de corte e intentos, pero no garantiza almacenamiento completo de detalle operacional capturado.
3. Para cumplir trazabilidad obligatoria, se requiere persistencia incremental por fase y cierre con `datos_reporte` completo.
