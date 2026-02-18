# Diagnóstico: Los Dos Mundos del Corte de Caja

**Fecha:** 2026-02-17
**Caso:** `04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/`

---

## 🔍 Síntoma Reportado

Al activar el modo "Corte de Caja" en la app, existen **dos flujos completamente diferentes** dependiendo del estado de la sesión, y el nuevo flujo (Supabase) no respeta los modales ni la UX/UI definida.

---

## 🗺️ Mapa del Estado Actual

### MUNDO A — El Wizard (Correcto en UX, malo en datos)

**Trigger:** `handleModeSelection(CASH_CUT)` → sin sesión activa → `setShowWizard(true)`

**Componentes involucrados:**
```
Index.tsx
  └── InitialWizardModal.tsx
        └── InitialWizardModalView.tsx (6 pasos)
              ├── Step1ProtocolRules.tsx    → 4 reglas de protocolo
              ├── Step2StoreSelection.tsx   → usa paradise.ts (HARDCODED)
              ├── Step3CashierSelection.tsx → usa paradise.ts (HARDCODED)
              ├── Step4WitnessSelection.tsx → usa paradise.ts (HARDCODED)
              ├── Step5SicarInput.tsx       → input venta esperada
              └── Step6Expenses.tsx         → gastos del día (opcional)
```

**Flujo de datos:**
```
paradise.ts → STORES[] → Step2
paradise.ts → EMPLOYEES[] → Step3, Step4
Wizard completa → handleWizardComplete() → CashCounter (Phase 1)
```

**✅ Lo que funciona bien:**
- UX/UI validada y aprobada — modales, animaciones, flujo secuencial
- 6 pasos bien definidos con lógica de validación
- Transición limpia al conteo (CashCounter → phases)
- Anti-fraude: testigo ≠ cajero validado

**❌ Lo que falla:**
- `STORES[]` y `EMPLOYEES[]` son arrays hardcodeados en `paradise.ts`
- Agregar una nueva sucursal o empleado requiere modificar código fuente
- Sin persistencia de sesión — si se cierra la app, se pierde el progreso
- Sin conexión a Supabase — los datos reales no se usan

---

### MUNDO B — ActivarCorte (Correcto en datos, malo en UX)

**Trigger:** `handleModeSelection(CASH_CUT)` → con sesión activa EN Supabase → `setRouteCashCutToCortePage(true)`

**Componentes involucrados:**
```
Index.tsx
  └── CortePage.tsx (selector de sucursal)
        └── CorteOrquestador.tsx (máquina de estados)
              ├── CorteInicio.tsx       → iniciar nuevo corte
              ├── CorteReanudacion.tsx  → reanudar corte existente
              ├── CorteConteoAdapter.tsx → conteo
              └── CorteResumen.tsx      → resumen final
```

**Flujo de datos:**
```
Supabase → useSucursales()    → CortePage
Supabase → useEmpleadosSucursal() → CorteOrquestador
Supabase → useCorteSesion()   → CorteOrquestador
```

**✅ Lo que funciona bien:**
- Supabase completamente conectado y operativo
- `useSucursales` — trae sucursales activas de la DB
- `useEmpleadosSucursal` — filtra empleados por sucursal desde Supabase
- `useCorteSesion` — crea, actualiza y reanuda cortes en Supabase
- Detección de sesión activa (evita duplicados)
- Graceful fallback si no hay Supabase configurado

**❌ Lo que falla:**
- `CortePage` y `CorteOrquestador` son UX/UI completamente diferentes
- **No usa los modales existentes** — tiene sus propias pantallas
- **No respeta el flujo de 6 pasos** del wizard validado
- Duplica lógica que ya existe en `InitialWizardModal`
- El usuario ve una interfaz inconsistente con el resto de la app
- Los modales de confirmación, animaciones y diseño son diferentes

---

## 🔴 Causa Raíz

La integración de Supabase se implementó como un **reemplazo paralelo** en lugar de una **mejora incremental** del sistema existente.

```
CORRECTO habría sido:
  InitialWizardModal ← useSucursales() (en vez de paradise.ts)
  InitialWizardModal ← useEmpleadosSucursal() (en vez de paradise.ts)
  handleWizardComplete() → useCorteSesion().crearCorte()

LO QUE SE HIZO:
  CortePage ← useSucursales()          [UX diferente]
  CorteOrquestador ← useEmpleadosSucursal() [UX diferente]
  CorteOrquestador ← useCorteSesion()   [UX diferente]
```

Los hooks de Supabase son correctos. La capa de UI que los consume es incorrecta.

---

## 📊 Tabla Comparativa

| Criterio | Mundo A (Wizard) | Mundo B (ActivarCorte) |
|----------|-----------------|----------------------|
| UX/UI aprobada | ✅ Sí | ❌ No |
| Modales correctos | ✅ Sí | ❌ No |
| Datos dinámicos (Supabase) | ❌ No | ✅ Sí |
| Persistencia de sesión | ❌ No | ✅ Sí |
| Reanudación de corte | ❌ No | ✅ Sí |
| Anti-fraude (testigo≠cajero) | ✅ Sí | ⚠️ Parcial |
| Flujo de 6 pasos | ✅ Sí | ❌ No (diferente) |
| Gastos del día (Step 6) | ✅ Sí | ❌ No |

---

## ✅ Decisión Tomada

> **Conservar el Mundo A (wizard) como única UX. Alimentarlo con datos del Mundo B (Supabase).**

**Justificación:**
- El wizard fue validado y aprobado por el usuario
- Los modales y animaciones son consistentes con el resto de la app
- Refactorizar solo las fuentes de datos es menos riesgo que refactorizar la UI completa
- Los hooks de Supabase ya están listos — solo se mueven de lugar

---

## 📦 Inventario de lo que se Conserva y lo que se Adapta

### ✅ SE CONSERVA SIN CAMBIOS
- `InitialWizardModal.tsx` — estructura de 6 pasos
- `InitialWizardModalView.tsx` — renderizado del wizard
- `Step1ProtocolRules.tsx` — sin fuente de datos, no cambia
- `Step5SicarInput.tsx` — sin fuente de datos, no cambia
- `Step6Expenses.tsx` — sin fuente de datos, no cambia
- `CashCounter.tsx` + phases — el conteo NO cambia
- `useSucursales.ts` — hook listo, solo se mueve de lugar
- `useEmpleadosSucursal.ts` — hook listo, solo se mueve de lugar
- `useCorteSesion.ts` — hook listo, solo se conecta al wizard

### ⚠️ SE MODIFICA
- `Step2StoreSelection.tsx` → reemplazar `STORES` de paradise.ts por `useSucursales()`
- `Step3CashierSelection.tsx` → reemplazar `EMPLOYEES` de paradise.ts por `useEmpleadosSucursal(storeId)`
- `Step4WitnessSelection.tsx` → misma fuente que Step3, filtrada
- `Index.tsx` → detección de sesión activa → reanudar wizard en paso correcto (no CortePage)
- `handleWizardComplete()` → guardar corte en Supabase vía `useCorteSesion()`

### ❌ SE DESACTIVA / INTEGRA
- `CortePage.tsx` → su detección de sesión migra a `Index.tsx`
- `CorteOrquestador.tsx` → sus fases de reanudación se mapean al wizard existente
- `CorteInicio.tsx`, `CorteReanudacion.tsx` → lógica migra al wizard

---

## Siguiente Paso

→ Ver `02_Arquitectura_Correcta.md` — Guía modular con contratos de integración
