# Matriz de Decision Go/NoGo

**Fecha:** 2026-02-17  
**Caso:** `Caso_Estrategia_UI_Datos_Reales_20260217/`

## 1. Gate de datos reales (obligatorio)

| Criterio | Estado esperado | Evidencia |
|---------|------------------|-----------|
| Credenciales Supabase cargadas en runtime | PASS | Log/inspeccion de `isSupabaseConfigured=true` |
| Sucursales renderizadas = sucursales activas reales | PASS | Captura + consulta DB |
| Empleados renderizados por sucursal = asignaciones reales | PASS | Captura + consulta DB |
| Sin fallback mock en sesion validada | PASS | Instrumentacion o bandera dev |

Veredicto Gate 1:
- PASS: avanzar.
- FAIL: bloquea cualquier modernizacion de UI.

## 2. Gate de flujo tradicional

| Criterio | Estado esperado | Evidencia |
|---------|------------------|-----------|
| Protocolo obligatorio visible y navegable | PASS | Prueba manual + test |
| Seleccion cajero/testigo por IDs validos | PASS | Test integracion |
| Reporte final muestra actores correctos | PASS | Test + validacion visual |
| Build sin errores | PASS | `npm run -s build` |

Veredicto Gate 2:
- PASS: UI tradicional estable con datos reales.
- FAIL: no iniciar migracion visual.

## 3. Gate de paridad para UI nueva

| Criterio | Estado esperado | Evidencia |
|---------|------------------|-----------|
| Paridad de pasos obligatorios vs tradicional | PASS | Matriz de paridad |
| Paridad de validaciones criticas | PASS | Tests comparativos |
| Contrato de datos compatible (IDs/nombres) | PASS | Tests de contrato |
| Rollback inmediato disponible | PASS | Feature flag documentado |

Veredicto Gate 3:
- PASS: habilitable por feature flag.
- FAIL: mantener UI tradicional como default.

## 4. Decision recomendada hoy
Estado actual recomendado: **NO-GO para reemplazo total de UI**.  
Accion: **GO para estabilizar datos reales en UI tradicional**.

## 5. Checklist operativo rapido
- [ ] Gate 1 completo
- [ ] Gate 2 completo
- [ ] Gate 3 completo
- [ ] Aprobacion de negocio para switch
- [ ] Plan de rollback probado

## 6. Criterio final de salida
Solo se autoriza cambiar UI default cuando los 3 gates esten en PASS y exista evidencia versionada en este caso.
