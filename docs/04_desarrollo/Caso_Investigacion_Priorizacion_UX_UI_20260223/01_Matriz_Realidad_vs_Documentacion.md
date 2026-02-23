# 01 — Matriz Realidad vs Documentación

**Fecha investigación:** 2026-02-23
**Investigador:** Claude Sonnet 4.6 (modo agente DACC)
**Rama activa:** feature/ot11-activar-corte-page-ui

---

## Tabla comparativa por caso

| Caso | Estado-doc | Estado-código | Brecha | Evidencia (archivo:línea/commit) |
|------|-----------|--------------|--------|----------------------------------|
| **A. Caso_PWA_Produccion_20260219** | 🔴 Pendiente — Plan aprobado, implementación no iniciada | 🔴 Sin implementar — Cero archivos de notificación en `src/` | **Brecha total**: doc describe el plan pero el código no tiene hook `useServiceWorkerUpdate`, no tiene `UpdateAvailableBanner.tsx`, y `vite.config.ts` usa `registerType: 'autoUpdate'` sin escuchar `controllerchange` | `vite.config.ts` (devOptions sin registerType:prompt) · No existe `src/components/shared/UpdateAvailableBanner.tsx` · No existe `src/hooks/useServiceWorkerUpdate*` · `02_Plan_Update_Notification.md` estado: "Plan aprobado, pendiente implementacion" |
| **B. Caso_Estrategia_UI_Datos_Reales_20260217** | 🟡 En progreso — Módulo A completado, Fases S2/S3/S4 pendientes | 🟡 Parcial — Supabase conectado y validado (sucursales/empleados), flujo guiado con gaps pendientes de diagnóstico | **Brecha moderada**: doc afirma "Módulo A PASS" (evidencia real en 04_Evidencia), pero Tareas B/D del `06_ORDEN_TECNICA` (flujo guiado + persistencia completa) están sin ejecutar. La Orden técnica explícitamente dice "local-only, sin merge a main" | `06_ORDEN_TECNICA_Traslado_Agente_Nuevo.md` Tareas B y D sin cumplir · `04_Evidencia_Modulo_A_Validacion_Local.md` evidencia PASS real · `src/hooks/useSucursales.ts` y `useEmpleadosSucursal.ts` existen · Commit `6c0f5bd` referenced but not visible in current git log (anterior a ramas visibles) |
| **C. Caso-Sesion-Activa-No-Notifica** | 🔴 Aparenta pendiente — INDEX dice R4 "FASE 2 — Esperando aprobacion" | ✅ COMPLETADO en código — Commits `dfcca5b` (docs cierre R4) + `3d49b17` (v3.4.0) + `e05077d` (feat resume) + `a6eff8f` (R3 fixes) muestran implementación completa | **Brecha documental crítica**: El INDEX en `docs/04_desarrollo/Caso-Sesion-Activa-No-Notifica/00_INDEX.md` NO fue actualizado para reflejar R4 como COMPLETADO. Dice "Esperando aprobacion" cuando ya fue archivado en CASOS-COMPLETOS con commit `dfcca5b`. La implementación real existe en `src/pages/Index.tsx` (handleResumeSession, testigo, skipWizard) y `src/components/initial-wizard/steps/Step5SicarInput.tsx` | `docs/04_desarrollo/Caso-Sesion-Activa-No-Notifica/00_INDEX.md:37` — dice "FASE 2 — Esperando aprobacion" · `docs/04_desarrollo/CASOS-COMPLETOS/08_RESTAURACION_PROGRESO_R4_COMPLETADO/` — existe · commit `dfcca5b`: "close case — mark R4 COMPLETADO" · `src/pages/Index.tsx:240` — `selectedWitness: corte.testigo` · `src/pages/Index.tsx:44` — `skipWizardOnResume` state · `src/pages/Index.tsx:254` — `setSkipWizardOnResume(true)` |
| **D. Caso_Logica_Envios_Delivery** | 🟡 Documentación completa — "Decisión stakeholder pendiente" desde Oct 2025 | 🟡 Parcialmente implementado — El módulo DeliveryDashboard (C807/Melos) existe en `src/components/deliveries/` y está integrado en routing. El DeliveryManager gestiona COD entries. Pero la integración con el corte de caja (ajuste automático SICAR) no está validada | **Brecha de decisión**: Docs dicen "pendiente decisión Opción A/B/C/D" desde Oct 2025 (4 meses sin decisión). El código SÍ tiene DeliveryManager funcional, DeliveryDashboard, DeliveryAlertBadge, useDeliveries, useDeliveryAlerts, DeliveryDashboardWrapper con PIN. La documentación del caso no refleja que ya existe una implementación base operativa | `README.md` última update Oct 2025 · `src/components/deliveries/DeliveryManager.tsx` — existe (v3.0.0) · `src/components/deliveries/DeliveryDashboardWrapper.tsx` — existe · `src/pages/Index.tsx:384` — DeliveryDashboardWrapper renderizado · `docs/04_desarrollo/Caso_Logica_Envios_Delivery/README.md:7` — "DOCUMENTACIÓN COMPLETA + FASE 9 INTEGRADA" |

---

## Resumen de brechas

| Tipo de brecha | Casos afectados |
|---------------|----------------|
| **Código sin implementar** (doc dice pendiente, código confirma) | A |
| **Implementación parcial** (doc dice en progreso, código avanzado) | B, D |
| **Doc desactualizada** (código completado pero doc dice pendiente) | C |
| **Decisión estancada** (doc completa, 4 meses sin decisión) | D |

---

## Hallazgo crítico: Caso C

El `00_INDEX.md` del caso SANN en `docs/04_desarrollo/Caso-Sesion-Activa-No-Notifica/` **no fue actualizado** luego del cierre del caso. El estado correcto debería ser "COMPLETADO — Archivado en CASOS-COMPLETOS". Esta deuda documental puede causar confusión a agentes futuros que lean ese directorio.

**Corrección necesaria (no urgente):** Actualizar la línea 37 de `00_INDEX.md` de `FASE 2 — Esperando aprobacion` a `COMPLETADO (commit dfcca5b, archivado en CASOS-COMPLETOS)`.
