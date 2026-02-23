# 01 — Diagnóstico Raíz: Banner Mal Ubicado

## Metodología

Aplicando `.agents/skills/systematic-debugging` — Fase 1: Observación → Fase 2: Hipótesis → Fase 3: Validación.

---

## Fase 1: Observación

### Síntoma Reportado
El banner "Se detectó una sesión activa — Sucursal: Plaza Merliot" aparece
en el **Paso 1 de 6** (Protocolo Anti-Fraude), antes de que el usuario
interactúe con la selección de sucursal.

### Evidencia Visual
Screenshot muestra:
- Wizard abierto en Paso 1 de 6
- Banner azul visible con texto: "Se detectó una sesión activa"
- Subtexto: "Sucursal: Plaza Merliot"
- Subtexto: "La sesión se reanudará automáticamente."
- Debajo del banner: contenido del Paso 1 "Cajero y Testigo Presentes"

### Flujo Actual del Problema
```
1. Usuario click "Corte Nocturno"
2. Index.tsx ejecuta detectActiveCashCutSession()
3. Supabase retorna: { hasActive: true, sucursalId: "plaza-merliot" }
4. setHasActiveCashCutSession(true)
5. setActiveCashCutSucursalId("plaza-merliot")
6. setShowWizard(true) → Wizard abre en Paso 1
7. Banner APARECE inmediatamente (condición: hasActiveSession && initialSucursalId != null)
8. Usuario ve "Plaza Merliot" sin haber elegido ni confirmado sucursal
```

---

## Fase 2: Hipótesis

### Causa Raíz Identificada

**El banner NO es consciente del paso actual del wizard.**

Archivo: `InitialWizardModalView.tsx` líneas 142-166
Condición actual:
```
props.hasActiveSession && props.initialSucursalId != null
```

Esta condición evalúa SOLO datos (¿hay sesión? ¿hay sucursal ID?) pero
**ignora completamente en qué paso se encuentra el usuario**.

El banner se renderiza **antes** del `AnimatePresence` que contiene el
contenido de cada paso, por lo tanto es **global a todos los pasos**.

### Expectativa Correcta

El banner debería aparecer **cuando el usuario llega al Paso 2** (Selección
de Sucursal), porque:

1. **Contexto:** El Paso 2 es donde el usuario elige sucursal — ahí tiene
   sentido informar que "ya hay una sesión activa para ESTA sucursal"
2. **Accionabilidad:** En Paso 2, el usuario puede decidir: aceptar la
   sucursal pre-seleccionada o cambiarla
3. **Otra sucursal:** Si un empleado de OTRA sucursal abre el wizard,
   NO debería ver "Plaza Merliot" en el Paso 1 de Protocolo — no tiene
   contexto para entender qué significa

---

## Fase 3: Validación

### Datos Técnicos Confirmados

| Aspecto | Valor |
|---------|-------|
| Archivo del banner | `InitialWizardModalView.tsx` líneas 142-166 |
| Condición actual | `props.hasActiveSession && props.initialSucursalId != null` |
| Step awareness | **NINGUNA** — no usa `ctrl.currentStep` |
| Paso de sucursal | Paso 2 (`Step2StoreSelection.tsx`) |
| Pre-selección | `useInitialWizardController.ts` líneas 88-94 via `useEffect` |
| ¿Paso 2 se salta? | **NO** — solo pre-llena el dropdown |
| Propiedad disponible | `ctrl.currentStep` (number, 1-6) desde `useWizardNavigation` |

### Diagrama del Problema

```
ACTUAL (incorrecto):
┌──────────────────────────────────────┐
│ Paso 1: Protocolo Anti-Fraude        │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ℹ Se detectó una sesión activa   │ │  ← BANNER AQUÍ (fuera de contexto)
│ │   Sucursal: Plaza Merliot        │ │
│ └──────────────────────────────────┘ │
│                                      │
│ 🔒 Cajero y Testigo Presentes       │
│    Ambas personas deben estar...     │
└──────────────────────────────────────┘

ESPERADO (correcto):
┌──────────────────────────────────────┐
│ Paso 1: Protocolo Anti-Fraude        │
│                                      │
│ 🔒 Cajero y Testigo Presentes       │  ← SIN banner (no hay contexto)
│    Ambas personas deben estar...     │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│ Paso 2: Selección de Sucursal        │
│                                      │
│ ┌──────────────────────────────────┐ │
│ │ ℹ Se detectó una sesión activa   │ │  ← BANNER AQUÍ (en contexto)
│ │   Sucursal: Plaza Merliot        │ │
│ │   La sesión se reanudará.        │ │
│ └──────────────────────────────────┘ │
│                                      │
│ [Plaza Merliot ✓ Seleccionada]       │  ← Pre-selección visible
└──────────────────────────────────────┘
```

---

## Conclusión

**Causa raíz:** Banner no tiene condición de paso (`ctrl.currentStep`).
**Severidad:** UX confusa, no es bug funcional.
**Riesgo del fix:** BAJO — cambio de 1 condición en la vista.
**Complejidad:** La propiedad `ctrl.currentStep` ya está disponible en el
componente — no requiere nuevo wiring ni cambios en hooks/controllers.
