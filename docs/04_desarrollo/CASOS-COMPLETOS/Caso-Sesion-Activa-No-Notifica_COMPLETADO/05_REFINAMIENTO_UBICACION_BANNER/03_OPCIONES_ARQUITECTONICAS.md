# 03 — Opciones Arquitectónicas: Ubicación del Banner de Sesión Activa

**Caso:** CASO-SANN-R1 — Refinamiento de Ubicación del Banner
**Fase DIRM:** Evaluación Modular (SOLO PLANIFICACIÓN — CERO CÓDIGO)
**Fecha:** 2026-02-18
**Estado:** EN REDACCIÓN

---

## Contexto de la Decisión

El banner de sesión activa actualmente aparece en **todos los pasos del wizard** porque su condición de visibilidad no incluye conciencia del paso actual:

```
CONDICIÓN ACTUAL:
props.hasActiveSession && props.initialSucursalId != null

PROBLEMA: No incluye ctrl.currentStep
RESULTADO: Banner visible desde Paso 1 (Protocolo) — contexto incorrecto
```

El objetivo es que el banner aparezca **cuando el usuario ya tiene contexto de la sucursal**, que sucede en Paso 2 (Selección de Sucursal) o posterior.

---

## Opciones Evaluadas

### ✅ OPCIÓN A — Banner en Paso 2 en adelante (`currentStep >= 2`)

**Descripción:**
El banner se muestra a partir del Paso 2 (Selección de Sucursal) y permanece visible en todos los pasos subsecuentes (3, 4, 5, 6).

**Condición resultante:**
```
props.hasActiveSession
&& props.initialSucursalId != null
&& ctrl.currentStep >= 2
```

**Comportamiento por paso:**

| Paso | Título               | Banner Visible | Justificación                                  |
|------|----------------------|---------------|------------------------------------------------|
| 1    | Protocolo Anti-Fraude| ❌ Oculto     | Usuario aún no ha confirmado sucursal          |
| 2    | Selección Sucursal   | ✅ Visible    | Usuario ve la sucursal pre-seleccionada + banner de recuperación |
| 3    | Selección Cajero     | ✅ Visible    | Contexto completo disponible                   |
| 4    | Testigo              | ✅ Visible    | Contexto completo disponible                   |
| 5    | Venta Esperada       | ✅ Visible    | Contexto completo disponible                   |
| 6    | Resumen              | ✅ Visible    | Confirma al usuario qué sesión se reanudará    |

**Ventajas:**
- ✅ Mínimo cambio — una condición numérica adicional
- ✅ `ctrl.currentStep` ya está disponible en `InitialWizardModalView.tsx` (sin nuevo wiring)
- ✅ El banner acompaña al usuario durante toda la selección de datos → recordatorio persistente
- ✅ Coherente con el pre-llenado de `initialSucursalId`: cuando el banner aparece, el dropdown ya muestra la sucursal

**Desventajas:**
- ⚠️ El banner permanece visible 5 pasos (mucho espacio vertical ocupado)
- ⚠️ En pasos 3-6 el usuario ya "aceptó" la recuperación implícitamente — el banner podría ser redundante

**Riesgo de implementación:** 🟢 BAJO
**Impacto en tests:** Actualizar condición en 1-2 tests de `ActiveSessionBanner.test.tsx`

---

### 🔵 OPCIÓN B — Banner SOLO en Paso 2 (`currentStep === 2`)

**Descripción:**
El banner se muestra únicamente en el Paso 2 (Selección de Sucursal), donde tiene máxima relevancia.

**Condición resultante:**
```
props.hasActiveSession
&& props.initialSucursalId != null
&& ctrl.currentStep === 2
```

**Comportamiento por paso:**

| Paso | Título               | Banner Visible | Justificación                                  |
|------|----------------------|---------------|------------------------------------------------|
| 1    | Protocolo Anti-Fraude| ❌ Oculto     | Sin contexto de sucursal                       |
| 2    | Selección Sucursal   | ✅ Visible    | Momento exacto: dropdown pre-llenado + banner  |
| 3    | Selección Cajero     | ❌ Oculto     | Usuario ya eligió sucursal — banner cumplió    |
| 4    | Testigo              | ❌ Oculto     | Información procesada                          |
| 5    | Venta Esperada       | ❌ Oculto     | Información procesada                          |
| 6    | Resumen              | ❌ Oculto     | Podría ser útil aquí, pero se omite            |

**Ventajas:**
- ✅ UX limpia — aparece exactamente donde tiene sentido
- ✅ No satura los pasos posteriores con información ya procesada
- ✅ Principio de mínima fricción

**Desventajas:**
- ⚠️ El usuario podría no leer el banner en el breve momento del Paso 2
- ⚠️ Si el usuario regresa al Paso 2 (hipotético), el banner reaparecería — comportamiento confuso
- ⚠️ En el Paso 6 (Resumen) podría ser útil recordar que se reanudará sesión existente

**Riesgo de implementación:** 🟢 BAJO
**Impacto en tests:** Actualizar condición en 2-3 tests de `ActiveSessionBanner.test.tsx`

---

### 🟡 OPCIÓN C — Mensaje Contextual por Paso (mensaje distinto en Paso 1 vs Paso 2+)

**Descripción:**
El banner aparece en todos los pasos, pero su mensaje cambia según el contexto:

- **Paso 1:** Mensaje genérico sin nombre de sucursal — "Se detectó una sesión activa en este dispositivo."
- **Paso 2+:** Mensaje completo — "Se detectó una sesión activa — Sucursal: [Nombre]"

**Condición resultante:**
```
props.hasActiveSession  (siempre visible si hay sesión)

Mensaje Paso 1:
  "Se detectó una sesión activa en este dispositivo."

Mensaje Paso 2+:
  "Sucursal: [nombre]" + "La sesión se reanudará automáticamente."
```

**Ventajas:**
- ✅ Usuario siempre sabe desde el principio que hay sesión activa
- ✅ Transición natural del mensaje al llegar a Paso 2

**Desventajas:**
- ❌ Complejidad adicional: lógica condicional dentro del JSX del banner
- ❌ Cambio mayor en tests — cobertura de 2 variantes de mensaje
- ❌ Viola el principio de simplicidad: añade una rama de renderizado
- ❌ En el Paso 1 el mensaje sin sucursal puede generar confusión ("¿qué sesión?")

**Riesgo de implementación:** 🟠 MEDIO
**Impacto en tests:** Actualizar + agregar 3-4 tests

---

## Matriz Comparativa

| Criterio                              | Opción A (≥2) | Opción B (=2) | Opción C (msg contextual) |
|---------------------------------------|:---:|:---:|:---:|
| Mínimo cambio de código               | 🟢 | 🟢 | 🟡 |
| UX coherente (banner con contexto)    | 🟢 | 🟢 | 🟡 |
| Tests a actualizar                    | 🟢 | 🟢 | 🔴 |
| Persistencia informativa              | 🟢 | 🟡 | 🟢 |
| Simplicidad arquitectónica            | 🟢 | 🟢 | 🔴 |
| Alineación con intención del usuario  | 🟢 | 🟢 | 🟡 |
| Riesgo de regresión                   | 🟢 | 🟢 | 🟡 |

---

## Recomendación

**OPCIÓN A — Banner en Paso 2 en adelante (`currentStep >= 2`)** es la opción recomendada.

**Justificación:**
1. El mensaje "La sesión se reanudará automáticamente" es relevante durante todos los pasos donde el usuario toma decisiones (Paso 2: sucursal, Paso 3: cajero, Paso 4: testigo, Paso 5: venta) — sirve como recordatorio constante de que no está iniciando desde cero.
2. Un solo cambio de condición — sin nueva lógica de mensajes, sin nuevas props, sin wiring adicional.
3. Los tests existentes son fácilmente adaptables: sólo cambia la condición de visibilidad.
4. `ctrl.currentStep` ya está en scope — no hay que tocar `Index.tsx`, `InitialWizardModalProps` ni ningún otro archivo de wiring.

**Cambio de código previsto (referencia, sin implementar):**
```
ANTES:  props.hasActiveSession && props.initialSucursalId != null
DESPUÉS: props.hasActiveSession && props.initialSucursalId != null && ctrl.currentStep >= 2
```

Archivo único afectado: `InitialWizardModalView.tsx` + tests correspondientes.

---

## Archivos Impactados (Inventario)

| Archivo | Tipo de Cambio | Riesgo |
|---------|---------------|--------|
| `src/components/initial-wizard/InitialWizardModalView.tsx` | Condición banner (1 línea) | 🟢 Bajo |
| `src/components/initial-wizard/__tests__/ActiveSessionBanner.test.tsx` | Actualizar mocks de currentStep | 🟢 Bajo |
| Ningún otro archivo | — | — |

> ⚠️ RESTRICCIÓN DIRM: Este documento es exclusivamente de planificación. La implementación requiere aprobación explícita del usuario.
