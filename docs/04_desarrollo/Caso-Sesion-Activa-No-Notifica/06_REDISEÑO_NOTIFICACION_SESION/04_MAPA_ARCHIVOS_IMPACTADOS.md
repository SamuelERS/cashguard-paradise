# 04 — Mapa de Archivos Impactados por Opción

**Caso:** CASO-SANN-R2 — Rediseño de Notificación de Sesión Activa
**Fase DIRM:** Investigación Arquitectónica (CERO CÓDIGO)
**Fecha:** 2026-02-18
**Estado:** ✅ Completado

---

## Resumen

Este documento mapea EXACTAMENTE qué archivos se modificarían, crearían o eliminarían según la opción arquitectónica seleccionada. Permite evaluar el impacto antes de aprobar cualquier código.

---

## Opción A — Mover Notificación al Paso 5

### Archivos a MODIFICAR

| # | Archivo | Cambio | Líneas Aprox. |
|---|---------|--------|---------------|
| 1 | `src/components/initial-wizard/InitialWizardModalView.tsx` | **ELIMINAR** banner (líneas 142-166) | -25 líneas |
| 2 | `src/components/initial-wizard/steps/Step5SicarInput.tsx` | **AGREGAR** panel de sesión activa con botones abort/resume | +40-60 líneas |
| 3 | `src/types/initialWizard.ts` | **AGREGAR** props para abort/resume callbacks a Step5 | +5 líneas |

### Archivos a CREAR

Ninguno.

### Archivos de TESTS a Modificar

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/components/initial-wizard/__tests__/ActiveSessionBanner.test.tsx` | Reescribir: banner ya no existe → tests para panel Step 5 |

### Total Archivos: 4 (3 modificados + 1 test reescrito)

---

## Opción B — Modal con Botones en el Wizard

### Archivos a MODIFICAR

| # | Archivo | Cambio | Líneas Aprox. |
|---|---------|--------|---------------|
| 1 | `src/components/initial-wizard/InitialWizardModalView.tsx` | **ELIMINAR** banner (líneas 142-166), **AGREGAR** trigger modal en Step 2 | -25 +15 líneas |
| 2 | `src/types/initialWizard.ts` | **AGREGAR** props para callbacks abort/resume al modal | +5 líneas |

### Archivos a CREAR

| # | Archivo | Descripción | Líneas Aprox. |
|---|---------|-------------|---------------|
| 1 | `src/components/initial-wizard/ActiveSessionModal.tsx` | Modal con botones "Reanudar" / "Abortar" | 60-80 líneas |

### Archivos de TESTS a Modificar/Crear

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/components/initial-wizard/__tests__/ActiveSessionBanner.test.tsx` | Reescribir o reemplazar con tests del modal |
| 2 | `src/components/initial-wizard/__tests__/ActiveSessionModal.test.tsx` | **NUEVO** — Tests del modal abort/resume |

### Total Archivos: 5 (2 modificados + 1 creado + 2 tests)

---

## Opción C — Modal Pre-Wizard (Híbrida) ⭐

### Archivos a MODIFICAR

| # | Archivo | Cambio | Líneas Aprox. |
|---|---------|--------|---------------|
| 1 | `src/pages/Index.tsx` | **AGREGAR** flujo condicional pre-wizard: si hay sesión activa → mostrar modal ANTES de abrir wizard. Pasar callbacks abort/resume. | +20-30 líneas |
| 2 | `src/components/initial-wizard/InitialWizardModalView.tsx` | **ELIMINAR** banner completo (líneas 142-166). Sin reemplazo: wizard queda limpio. | -25 líneas |
| 3 | `src/types/initialWizard.ts` | **POSIBLE** ajuste mínimo de props si se cambia flujo de apertura wizard | +0-5 líneas |

### Archivos a CREAR

| # | Archivo | Descripción | Líneas Aprox. |
|---|---------|-------------|---------------|
| 1 | `src/components/initial-wizard/ActiveSessionDecisionModal.tsx` | Modal de decisión con 2 botones: "Reanudar Sesión" / "Abortar y Empezar Nuevo". Incluye modal de confirmación para abortar. | 80-120 líneas |

### Archivos de TESTS a Modificar/Crear

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `src/components/initial-wizard/__tests__/ActiveSessionBanner.test.tsx` | **ELIMINAR** o marcar como deprecated (banner ya no existe) |
| 2 | `src/components/initial-wizard/__tests__/ActiveSessionDecisionModal.test.tsx` | **NUEVO** — Tests TDD para el modal de decisión |
| 3 | `src/__tests__/unit/pages/index.cashcut-routing.test.tsx` | **MODIFICAR** — Agregar test para flujo pre-wizard con sesión activa |

### Archivos SIN CAMBIOS (Confirmados)

| # | Archivo | Razón |
|---|---------|-------|
| 1 | `src/hooks/useCorteSesion.ts` | Funciones abort/resume/restart YA existen |
| 2 | `src/types/auditoria.ts` | Tipos EstadoCorte/EstadoIntento ya definidos |
| 3 | `src/components/initial-wizard/steps/Step1ProtocolRules.tsx` | Sin cambios |
| 4 | `src/components/initial-wizard/steps/Step2StoreSelection.tsx` | Sin cambios |
| 5 | `src/components/initial-wizard/steps/Step3CashierSelection.tsx` | Sin cambios |
| 6 | `src/components/initial-wizard/steps/Step4WitnessSelection.tsx` | Sin cambios |
| 7 | `src/components/initial-wizard/steps/Step5SicarInput.tsx` | Sin cambios (Opción C no toca Step 5) |
| 8 | `src/components/initial-wizard/steps/Step6Expenses.tsx` | Sin cambios |
| 9 | `src/hooks/initial-wizard/useInitialWizardController.ts` | Sin cambios |

### Total Archivos Opción C: 6 (2-3 modificados + 1 creado + 2-3 tests)

---

## Comparativa de Impacto

| Métrica | Opción A | Opción B | Opción C |
|---------|:---:|:---:|:---:|
| **Archivos modificados** | 3 | 2 | 2-3 |
| **Archivos creados** | 0 | 1 | 1 |
| **Tests nuevos/reescritos** | 1 | 2 | 2-3 |
| **Total archivos tocados** | 4 | 5 | 6 |
| **Líneas netas estimadas** | +20-40 | +55-75 | +75-120 |
| **Backend impactado** | ❌ No | ❌ No | ❌ No |
| **Nuevas dependencias** | ❌ No | ❌ No | ❌ No |
| **Riesgo regresión** | 🟢 Bajo | 🟢 Bajo | 🟢 Bajo |

---

## Diagrama de Dependencias (Opción C)

```
Index.tsx  ─────────────────────────────────────┐
    │                                           │
    ├─ detectActiveCashCutSession()  (existente) │
    │                                           │
    ├─ useCorteSesion() hook  (existente)       │
    │     ├─ abortarCorte()                     │
    │     └─ recuperarSesion()                  │
    │                                           │
    ├─ [NUEVO] ActiveSessionDecisionModal ──────┤
    │     ├─ onResume → recuperarSesion()       │
    │     └─ onAbort → abortarCorte()           │
    │                                           │
    └─ InitialWizardModalView  (SIN banner) ────┘
          ├─ Step1ProtocolRules (sin cambios)
          ├─ Step2StoreSelection (sin cambios)
          ├─ Step3CashierSelection (sin cambios)
          ├─ Step4WitnessSelection (sin cambios)
          ├─ Step5SicarInput (sin cambios)
          └─ Step6Expenses (sin cambios)
```

---

## Nota Importante

> Este mapa es una **estimación arquitectónica**. Las líneas exactas se determinarán en el Plan de Implementación (documento 05) una vez que el usuario apruebe la opción.

---

## Referencias

- `03_OPCIONES_ARQUITECTONICAS.md` — Definición detallada de cada opción
- `02_INVENTARIO_INFRAESTRUCTURA.md` — Funciones backend disponibles
- Código fuente: archivos listados arriba
