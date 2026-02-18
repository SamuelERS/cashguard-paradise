# 04 — Plan de Implementación: Refinamiento de Ubicación del Banner

**Caso:** CASO-SANN-R1 — Refinamiento de Ubicación del Banner
**Fase DIRM:** Planificación Modular (SOLO PLANIFICACIÓN — CERO CÓDIGO)
**Opción seleccionada:** Opción A — Banner visible en Paso 2 en adelante (`currentStep >= 2`)
**Fecha:** 2026-02-18
**Estado:** EN REDACCIÓN

---

## Resumen Ejecutivo

| Ítem                         | Valor                                         |
|------------------------------|-----------------------------------------------|
| Archivos a modificar         | 2 (1 implementación + 1 tests)                |
| Líneas de código a cambiar   | ~3-5 (condición + comentario)                 |
| Líneas de tests a cambiar    | ~10-15 (actualizar mocks de `currentStep`)    |
| Riesgo estimado              | 🟢 BAJO                                       |
| Requiere nuevas dependencias | ❌ No                                         |
| Requiere nuevo wiring        | ❌ No (`ctrl.currentStep` ya disponible)      |
| Requiere aprobación usuario  | ✅ SÍ — antes de cualquier cambio             |

---

## Principio Rector

> **1 Módulo = 1 Tarea = 1 Validación**
> Cada archivo se modifica de forma atómica, se verifica, y solo entonces se procede al siguiente.

---

## Módulos de Implementación

### MÓDULO 1 — Actualizar condición del banner en `InitialWizardModalView.tsx`

**Archivo:** `src/components/initial-wizard/InitialWizardModalView.tsx`
**Ubicación actual del banner:** Líneas 142-166 (aproximado)
**Tipo de cambio:** Condición de renderizado (1 línea)

**Descripción del cambio:**
La condición que controla la visibilidad del banner debe incluir `ctrl.currentStep >= 2` para que el banner solo aparezca a partir del Paso 2 (Selección de Sucursal).

**Condición antes del cambio:**
```
props.hasActiveSession && props.initialSucursalId != null
```

**Condición después del cambio:**
```
props.hasActiveSession && props.initialSucursalId != null && ctrl.currentStep >= 2
```

**Datos disponibles sin wiring adicional:**
- `ctrl.currentStep` ← ya expuesto por `useInitialWizardController.ts`
- `props.hasActiveSession` ← ya recibido desde `Index.tsx`
- `props.initialSucursalId` ← ya recibido desde `Index.tsx`

**Validación del módulo:**
- [ ] `npx tsc --noEmit` → 0 errores
- [ ] El banner NO aparece en Paso 1 (Protocolo)
- [ ] El banner SÍ aparece en Paso 2 (Selección de Sucursal) con nombre correcto
- [ ] El banner SÍ aparece en Pasos 3-6

---

### MÓDULO 2 — Actualizar tests en `ActiveSessionBanner.test.tsx`

**Archivo:** `src/components/initial-wizard/__tests__/ActiveSessionBanner.test.tsx`
**Tests actuales:** 5 tests (creados en CASO-SANN ORDEN #1)
**Tipo de cambio:** Actualizar mocks del controller para incluir `currentStep`

**Descripción del cambio:**
Los mocks del controller que hoy no especifican `currentStep` deben actualizarse para reflejar el paso correcto según lo que cada test valida:

| Test | `currentStep` en mock | Comportamiento esperado     |
|------|-----------------------|-----------------------------|
| "muestra banner cuando hay sesión activa" | `2` | Banner visible |
| "muestra nombre de sucursal en el banner" | `2` | Nombre visible |
| "oculta banner cuando no hay sesión activa" | `2` | Banner oculto (sin hasActiveSession) |
| "oculta banner sin initialSucursalId" | `2` | Banner oculto (sin sucursalId) |
| "banner oculto en Paso 1 (Protocolo)" | `1` | **NUEVO ESCENARIO** — banner oculto |

**Test adicional requerido:**
Se debe agregar 1 test nuevo para validar explícitamente que el banner es invisible en el Paso 1.

**Descripción del test nuevo:**
```
DADO: hasActiveSession=true, initialSucursalId definido, currentStep=1
CUANDO: El componente se renderiza
ENTONCES: El banner NO debe estar presente en el DOM
```

**Validación del módulo:**
- [ ] `npx vitest run src/components/initial-wizard/__tests__/` → todos los tests PASAN
- [ ] El test nuevo ("banner oculto en Paso 1") PASA
- [ ] Los 5 tests existentes siguen PASANDO (zero regresión)
- [ ] Coverage no disminuye

---

## Secuencia de Ejecución

```
MÓDULO 1 → Implementación → Validar tsc → Validar visual
     ↓
MÓDULO 2 → Actualizar tests → Agregar test nuevo → Validar vitest
     ↓
Compilación completa (npm run build)
     ↓
Commit con cambios del refinamiento
```

---

## Reglas de Pausa (Gate Conditions)

Si cualquiera de estas condiciones ocurre, se pausa la implementación y se escala al usuario:

1. `npx tsc --noEmit` reporta errores NO relacionados con el cambio esperado
2. Tests pre-existentes fallan por razón distinta al cambio de `currentStep`
3. `ctrl.currentStep` no está disponible en el scope del banner (requeriría nuevo wiring)
4. El cambio introduce efectos secundarios en la lógica de pre-selección de sucursal

---

## Archivos en Scope (Solo estos 2)

```
MODIFICAR:
src/components/initial-wizard/InitialWizardModalView.tsx   ← Módulo 1
src/components/initial-wizard/__tests__/ActiveSessionBanner.test.tsx  ← Módulo 2

NO TOCAR:
src/pages/Index.tsx                          (wiring ya correcto)
src/types/initialWizard.ts                   (interfaz ya correcta)
src/hooks/useWizardNavigation.ts             (sin cambios)
src/components/initial-wizard/useInitialWizardController.ts  (sin cambios)
```

---

## Estimación

| Módulo   | Descripción                     | Complejidad | Tiempo Estimado |
|----------|---------------------------------|-------------|-----------------|
| Módulo 1 | Condición banner (1 línea)      | 🟢 Trivial  | 5 minutos       |
| Módulo 2 | Actualizar tests (5+1 tests)    | 🟢 Baja     | 15 minutos      |
| Validación | tsc + vitest + build           | —           | 5 minutos       |
| **Total** | —                              | —           | **~25 minutos** |

---

## Dependencia de Aprobación

> ⛔ **BLOQUEADO HASTA APROBACIÓN EXPLÍCITA DEL USUARIO**
>
> Este plan está completo y listo para ejecutarse. Ningún archivo será modificado hasta que el usuario emita la orden de implementación.
>
> Para aprobar: el usuario debe confirmar la **Opción A** y emitir la orden de ejecución.
