# 05 — Plan de Implementación: Opción A — Bloqueo Anti-Fraude en Paso 5

**Caso:** CASO-SANN-R2 — Rediseño de Notificación de Sesión Activa
**Fase DIRM:** Planificación Modular (Opción A Aprobada)
**Fecha:** 2026-02-18
**Estado:** ✅ Listo para ejecución

---

## Resumen Ejecutivo

| Ítem | Valor |
|------|-------|
| **Opción aprobada** | A — Bloqueo en Paso 5 (castigo anti-fraude) |
| **Estrategia anti-fraude** | Empleado que reinicia app pierde tiempo rellenando Pasos 1-4 antes de descubrir bloqueo |
| **Archivos a modificar** | 3 (1 eliminar banner + 1 agregar bloqueo Step5 + 1 types) |
| **Archivos de tests** | 2 (1 reescribir + 1 nuevo) |
| **Líneas netas estimadas** | +40-60 (eliminar 25 banner + agregar 65-85 panel Step5) |
| **Requiere backend nuevo** | ❌ No — `abortarCorte()` y `recuperarSesion()` ya existen |
| **Requiere nuevas dependencias** | ❌ No |
| **Riesgo estimado** | 🟢 BAJO |

---

## Principio Rector

> **1 Módulo = 1 Orden = 1 Validación**
> Cada módulo se ejecuta como una ORDEN al agente programador.
> TDD primero: tests RED antes de implementación GREEN.

---

## Lógica Anti-Fraude (Contexto para el Agente)

```
Empleado honesto:
  → Abre wizard → Pasos 1-5 → NO hay sesión activa → Continúa normal
  → ZERO fricción ✅

Empleado tramposo (reinicia app):
  → Abre wizard → Pasos 1-4 (pierde 5-10 min) → Paso 5 → 🚫 BLOQUEO
  → "Sesión activa detectada" → No puede avanzar
  → Botones: "Reanudar Sesión" / "Abortar Sesión"
  → Si aborta → queda registro en Supabase (motivo_aborto + timestamp)
  → Castigo: tiempo perdido + evidencia registrada ✅
```

---

## Módulos de Implementación

### MÓDULO 1 — Tests TDD para panel de sesión activa en Step 5

**Tipo:** TDD RED Phase (tests que DEBEN fallar)
**Archivo:** `src/components/initial-wizard/__tests__/ActiveSessionStep5.test.tsx`

**Tests a crear:**

| # | Test | Descripción |
|---|------|-------------|
| T1 | Panel NO visible sin sesión activa | `hasActiveSession=false` → panel de sesión NO aparece en Step 5 |
| T2 | Panel visible con sesión activa en Step 5 | `hasActiveSession=true` + `currentStep=5` → panel aparece |
| T3 | Panel muestra texto "Sesión activa detectada" | Texto descriptivo presente |
| T4 | Botón "Reanudar Sesión" presente | Botón existe y es clickeable |
| T5 | Botón "Abortar Sesión" presente | Botón existe y es clickeable |
| T6 | Input SICAR deshabilitado con sesión activa | El campo de venta esperada está `disabled` |
| T7 | Botón "Continuar" deshabilitado con sesión activa | No puede avanzar al Paso 6 |
| T8 | Panel NO visible en Steps 1-4 | `currentStep=2` + `hasActiveSession=true` → panel NO aparece |

**Validación:** `npx vitest run src/components/initial-wizard/__tests__/ActiveSessionStep5.test.tsx` → 8 tests FALLAN (RED)

---

### MÓDULO 2 — Eliminar banner de InitialWizardModalView.tsx

**Tipo:** Implementación (eliminación)
**Archivo:** `src/components/initial-wizard/InitialWizardModalView.tsx`
**Ubicación:** Líneas 142-166

**Cambio:** ELIMINAR completamente el bloque del banner de sesión activa.

**Antes (eliminar):**
```tsx
{/* [IA] - CASO-SANN-R1: Banner solo desde Paso 2 */}
{props.hasActiveSession && props.initialSucursalId != null && ctrl.currentStep >= 2 && (() => {
  // ... 24 líneas del banner azul informativo
})()}
```

**Después:** Nada. El espacio queda limpio. Ningún indicador visual en los Pasos 2-6.

**Razón anti-fraude:** El empleado tramposo NO debe saber que hay sesión activa hasta llegar al Paso 5.

**Validación:**
- [ ] `npx tsc --noEmit` → 0 errores
- [ ] Banner NO aparece en ningún paso del wizard

---

### MÓDULO 3 — Implementar panel de sesión activa en Step5SicarInput.tsx

**Tipo:** Implementación (agregar funcionalidad)
**Archivo:** `src/components/initial-wizard/steps/Step5SicarInput.tsx`

**Cambios requeridos:**

1. **Props nuevas:** Recibir `hasActiveSession`, `onResumeSession`, `onAbortSession`
2. **Panel condicional:** Si `hasActiveSession=true`, mostrar panel de bloqueo con:
   - Mensaje: "Sesión activa detectada"
   - Texto explicativo discreto (NO revelar detalles de la sesión anterior)
   - Botón "Reanudar Sesión" (verde/constructivo)
   - Botón "Abortar Sesión" (rojo/destructivo)
3. **Input deshabilitado:** Si `hasActiveSession=true`, el input SICAR queda `disabled`
4. **Botón Continuar deshabilitado:** No puede avanzar al Paso 6 sin resolver sesión

**Mockup del panel:**
```
┌── ⚠️ Sesión en Progreso ──────────────────┐
│                                            │
│  Existe un corte de caja que no se         │
│  completó. Debe resolver esta sesión       │
│  antes de continuar.                       │
│                                            │
│  [🔄 Reanudar Sesión]  [🗑️ Abortar]       │
│                                            │
└────────────────────────────────────────────┘
```

**Validación:**
- [ ] `npx tsc --noEmit` → 0 errores
- [ ] Tests MÓDULO 1 pasan (GREEN)
- [ ] Panel visible SOLO en Step 5 con sesión activa

---

### MÓDULO 4 — Wiring: Conectar callbacks abort/resume en InitialWizardModalView

**Tipo:** Implementación (conexión de flujo)
**Archivo:** `src/components/initial-wizard/InitialWizardModalView.tsx`

**Cambios:**
1. Recibir props `onResumeSession` y `onAbortSession` del padre
2. Pasar estas props a `Step5SicarInput` en el `case 5:` del switch
3. Pasar `hasActiveSession` a `Step5SicarInput`

**Archivo adicional:** `src/types/initialWizard.ts`
- Agregar `onResumeSession?: () => void` y `onAbortSession?: () => void` a `InitialWizardModalProps`

**Validación:**
- [ ] `npx tsc --noEmit` → 0 errores
- [ ] Flujo completo funcional (sesión activa → panel Step 5 → botones funcionan)

---

### MÓDULO 5 — Wiring: Conectar desde Index.tsx

**Tipo:** Implementación (conexión final)
**Archivo:** `src/pages/Index.tsx`

**Cambios:**
1. Importar/usar funciones `abortarCorte` y `recuperarSesion` de `useCorteSesion`
2. Crear callbacks `handleResumeSession` y `handleAbortSession`
3. Pasar como props al wizard: `onResumeSession={handleResumeSession}` y `onAbortSession={handleAbortSession}`

**Validación:**
- [ ] `npx tsc --noEmit` → 0 errores
- [ ] `npm run build` → Build exitoso
- [ ] Flujo completo end-to-end funcional

---

### MÓDULO 6 — Actualizar/eliminar tests del banner antiguo

**Tipo:** Cleanup tests
**Archivo:** `src/components/initial-wizard/__tests__/ActiveSessionBanner.test.tsx`

**Cambio:** Eliminar o marcar como deprecated los 6 tests del banner que ya no existe. Los tests nuevos están en `ActiveSessionStep5.test.tsx` (MÓDULO 1).

**Validación:**
- [ ] Zero tests failing por banner eliminado
- [ ] Suite completa pasa sin regresión

---

## Secuencia de Ejecución (Órdenes al Agente)

```
ORDEN #7:  MÓDULO 1 — Tests TDD RED (ActiveSessionStep5.test.tsx)
    ↓ Validar: 8 tests fallan (RED)

ORDEN #8:  MÓDULO 2 + 3 — Eliminar banner + Implementar panel Step 5
    ↓ Validar: tsc + tests GREEN + visual

ORDEN #9:  MÓDULO 4 + 5 — Wiring completo (View + Index)
    ↓ Validar: tsc + build + flujo end-to-end

ORDEN #10: MÓDULO 6 — Cleanup tests antiguos
    ↓ Validar: suite completa sin regresión

ORDEN #11: Commit final
```

---

## Reglas de Pausa (Gate Conditions)

Si cualquiera de estas condiciones ocurre, se PAUSA y se escala al usuario:

1. `npx tsc --noEmit` reporta errores NO relacionados con el cambio
2. Tests pre-existentes fallan por razón ajena a los cambios
3. Las funciones `abortarCorte()` o `recuperarSesion()` no están accesibles desde `Index.tsx`
4. El wiring de props requiere modificar hooks no contemplados
5. El agente propone cambios fuera del scope de archivos listados

---

## Archivos en Scope (SOLO estos)

```
MODIFICAR:
src/components/initial-wizard/InitialWizardModalView.tsx    ← Mód. 2 + 4
src/components/initial-wizard/steps/Step5SicarInput.tsx     ← Mód. 3
src/types/initialWizard.ts                                  ← Mód. 4
src/pages/Index.tsx                                         ← Mód. 5

CREAR:
src/components/initial-wizard/__tests__/ActiveSessionStep5.test.tsx  ← Mód. 1

ELIMINAR/DEPRECAR:
src/components/initial-wizard/__tests__/ActiveSessionBanner.test.tsx ← Mód. 6

NO TOCAR:
src/hooks/useCorteSesion.ts              (funciones ya correctas)
src/hooks/initial-wizard/useInitialWizardController.ts  (sin cambios)
src/components/initial-wizard/steps/Step1ProtocolRules.tsx
src/components/initial-wizard/steps/Step2StoreSelection.tsx
src/components/initial-wizard/steps/Step3CashierSelection.tsx
src/components/initial-wizard/steps/Step4WitnessSelection.tsx
src/components/initial-wizard/steps/Step6Expenses.tsx
```

---

## Dependencia de Aprobación

> ✅ **Opción A APROBADA por el usuario (2026-02-18)**
> Justificación: Estrategia anti-fraude — tiempo perdido como castigo disuasorio.
> Plan listo para emitir ORDEN #7 al agente programador.
