# 05 — Criterios de Aceptación: Refinamiento de Ubicación del Banner

**Caso:** CASO-SANN-R1 — Refinamiento de Ubicación del Banner
**Fase DIRM:** Validación (Post-Implementación)
**Opción a implementar:** Opción A — `ctrl.currentStep >= 2`
**Fecha:** 2026-02-18
**Estado:** EN REDACCIÓN

---

## Resumen de Criterios

| ID    | Tipo         | Descripción                                              | Cómo Verificar            |
|-------|--------------|----------------------------------------------------------|---------------------------|
| CA-01 | Automatizado | Banner oculto en Paso 1 (test nuevo)                     | `vitest`                  |
| CA-02 | Automatizado | Banner visible en Paso 2 con sesión activa               | `vitest`                  |
| CA-03 | Automatizado | Banner visible en Pasos 3-6 con sesión activa            | `vitest` (mock step 3+)   |
| CA-04 | Automatizado | Zero regresión en los 5 tests originales                 | `vitest`                  |
| CA-05 | Automatizado | TypeScript sin errores                                   | `npx tsc --noEmit`        |
| CA-06 | Automatizado | Build limpio                                             | `npm run build`           |
| CV-01 | Visual       | Paso 1: sin banner — usuario ve solo el protocolo        | Navegador / screenshot    |
| CV-02 | Visual       | Paso 2: banner azul presente con nombre de sucursal      | Navegador / screenshot    |
| CV-03 | Visual       | Paso 2: dropdown muestra sucursal pre-seleccionada       | Navegador / screenshot    |
| CV-04 | Visual       | Pasos 3-6: banner persiste como recordatorio             | Navegador / screenshot    |
| CV-05 | Visual       | Sin sesión activa: banner nunca aparece en ningún paso   | Navegador / screenshot    |

---

## Criterios Automatizados (Detalle)

### CA-01 — Banner oculto en Paso 1

**Fixture:**
```
hasActiveSession = true
initialSucursalId = 'suc-001' (ID válido)
ctrl.currentStep = 1
```

**Resultado esperado:**
- El elemento del banner NO existe en el DOM
- `queryByText('Se detectó una sesión activa')` → `null`

**Estado inicial:** ⏳ Pendiente (test nuevo a crear en Módulo 2)

---

### CA-02 — Banner visible en Paso 2

**Fixture:**
```
hasActiveSession = true
initialSucursalId = 'suc-001'
ctrl.currentStep = 2
ctrl.availableStores = [{ id: 'suc-001', name: 'Plaza Merliot' }]
```

**Resultado esperado:**
- `queryByText('Se detectó una sesión activa')` → elemento presente
- `queryByText('Sucursal: Plaza Merliot')` → elemento presente
- `queryByText('La sesión se reanudará automáticamente.')` → elemento presente

**Estado inicial:** ⏳ Pendiente (tests existentes se actualizarán en Módulo 2)

---

### CA-03 — Banner visible en Pasos 3-6

**Fixture:**
```
hasActiveSession = true
initialSucursalId = 'suc-001'
ctrl.currentStep = 3  (y también probar con 4, 5, 6)
```

**Resultado esperado:**
- Banner presente en todos los pasos >= 2

**Estado inicial:** ⏳ Pendiente (test paramétrico o 1 test representativo)

---

### CA-04 — Zero regresión tests originales

**Tests en scope:**
- `index.cashcut-routing.test.tsx` — debe seguir 3/3
- `index.stability.test.tsx` — debe seguir 5/5
- `index.sync-ux.test.tsx` — debe seguir 8/8
- `ActiveSessionBanner.test.tsx` — 5 existentes + 1 nuevo = 6 en total

**Resultado esperado:** Todos los tests pasan. Ningún test pre-existente falla por el cambio.

---

### CA-05 — TypeScript sin errores

**Comando:** `npx tsc --noEmit`
**Resultado esperado:** `0 errors`

---

### CA-06 — Build limpio

**Comando:** `npm run build`
**Resultado esperado:** Build exitoso en < 5 segundos. Sin warnings adicionales.

---

## Criterios Visuales (Detalle)

### CV-01 — Paso 1 limpio

**Escenario:** Sesión activa en BD para Plaza Merliot. Usuario abre el wizard de Corte Nocturno.

**Pantalla esperada:**
```
┌─────────────────────────────────────┐
│  Paso 1 de 6 ░░░░░░░░░░░░░░░░░░    │
│                                     │
│  🛡️ Protocolo Anti-Fraude           │
│  [Reglas del protocolo...]          │
│                                     │
│         [NO hay banner azul]        │
│                                     │
│              [Continuar →]          │
└─────────────────────────────────────┘
```

**Verificación:** Captura de pantalla en Paso 1. El banner azul NO debe existir.

---

### CV-02 — Paso 2 con banner y sucursal

**Escenario:** Usuario avanza al Paso 2.

**Pantalla esperada:**
```
┌─────────────────────────────────────┐
│  Paso 2 de 6 ████░░░░░░░░░░░░░░    │
│                                     │
│ ┌─ ℹ️ Se detectó una sesión activa ─┐│
│ │  Sucursal: Plaza Merliot          ││
│ │  La sesión se reanudará...        ││
│ └───────────────────────────────────┘│
│                                     │
│  Seleccione la Sucursal             │
│  [Plaza Merliot ▾]  ← pre-llenado  │
│                                     │
│         [← Anterior]  [Continuar →] │
└─────────────────────────────────────┘
```

**Verificación:** Captura de pantalla en Paso 2. El banner azul DEBE estar presente encima del dropdown, el dropdown DEBE mostrar la sucursal pre-seleccionada.

---

### CV-03 — Coherencia banner + dropdown

**Verificación:** El nombre de la sucursal en el banner y el valor del dropdown deben coincidir exactamente.

---

### CV-04 — Banner persiste en pasos 3-6

**Verificación:** Avanzar manualmente hasta el Paso 6. El banner debe permanecer visible en todos.

---

### CV-05 — Sin sesión activa: pantalla limpia

**Escenario:** No hay sesión activa en BD. Usuario abre el wizard.

**Pantalla esperada:** Ningún banner en ningún paso.

---

## Definición de "Hecho" (Done)

El refinamiento se considera **completo** cuando:

1. ✅ Todos los criterios CA-01 a CA-06 están en verde (automatizados)
2. ✅ Los criterios CV-01 y CV-02 tienen captura de pantalla validada por el usuario
3. ✅ El commit de refinamiento incluye el mensaje convencional apropiado
4. ✅ CLAUDE.md refleja la nueva versión (si aplica bump de versión)

---

## Criterios Fuera de Scope

Los siguientes criterios pertenecen a CASO-SANN original y NO son parte de este refinamiento:

| ID    | Descripción                                              | Dónde está cubierto         |
|-------|----------------------------------------------------------|-----------------------------|
| CA-05-ORIG | Sesión activa persiste después de navegar al wizard | CASO-SANN original (cubierto) |
| CU-01 | El banner aparece en tiempo real en Playwright        | CASO-SANN E2E (pendiente)   |
| CU-02 | Flujo completo de recuperación de sesión              | CASO-SANN E2E (pendiente)   |
| CU-03 | Comportamiento sin conexión a Supabase                | CASO-SANN E2E (pendiente)   |
