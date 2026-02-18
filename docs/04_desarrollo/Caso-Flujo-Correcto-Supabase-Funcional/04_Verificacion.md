# Verificación: Checklist QA del Caso

**Fecha:** 2026-02-17
**Caso:** `04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/`

---

## Sección A: Correcciones DACC (Ya Aplicadas)

### A.1 — Bifurcación CortePage Eliminada

- [x] `Index.tsx` no importa `CortePage`
- [x] `handleModeSelection(CASH_CUT)` siempre abre wizard
- [x] `routeCashCutToCortePage` nunca se establece en `true`
- [x] Con sesión activa → wizard se abre (no CortePage)
- [x] Sin sesión activa → wizard se abre normalmente
- [x] Test de regresión `index.cashcut-routing.test.tsx` verifica ambos escenarios

### A.2 — Import Legacy Removido

- [x] `useCashCounterOrchestrator.ts` no importa de `paradise.ts`
- [x] Guard test `catalogSourceGuard.test.ts` no detecta import legacy
- [x] `availableStores` siempre viene de Supabase (`sucursales.map(...)`)
- [x] Sin operador ternario de fallback

### A.3 — Suite useEmpleadosSucursal Funcional

- [x] Mock chain completa: `.select().in().eq().order()` → thenable
- [x] Sin mock de `paradise.ts` (hook es 100% Supabase)
- [x] Campo `cargo` usado (no `rol`)
- [x] Test de duplicados en asignaciones funciona
- [x] Test de error en asignaciones funciona
- [x] Test de error en empleados funciona
- [x] Test de recarga funciona

### A.4 — Contrato Controller Test

- [x] `availableStores` assertion usa `{ id, name, address, phone, schedule }`
- [x] No usa campo `code` inexistente

### A.5 — Build y TypeScript

- [x] `npx tsc --noEmit` = 0 errores
- [x] `npm run build` = exitoso

---

## Sección B: Integración Futura (Fases 1-5)

### B.1 — Step2 con useSucursales (Fase 1) — ✅ IMPLEMENTADO

- [x] Step2 muestra sucursales de Supabase (no hardcodeadas) *(useInitialWizardController.ts:47 — `useSucursales()`)*
- [x] Spinner visible durante carga *(hook expone `cargando` state)*
- [x] Mensaje de error si Supabase falla *(hook expone `error` state)*
- [x] Sin import de `STORES` de paradise.ts en Step2 *(controller usa useSucursales, no STORES[])*
- [x] Sucursal seleccionada se propaga correctamente al Step3 *(wizardData.selectedStore reactivo)*

### B.2 — Step3/Step4 con useEmpleadosSucursal (Fase 2) — ✅ IMPLEMENTADO

- [x] Empleados se cargan dinámicamente al seleccionar sucursal *(useInitialWizardController.ts:48 — `useEmpleadosSucursal(selectedStore)`)*
- [x] Cambiar sucursal → recarga empleados automáticamente *(hook reactivo al parámetro sucursalId)*
- [x] Solo empleados activos aparecen *(hook filtra `.eq('activo', true)`)*
- [x] Testigo excluye cajero seleccionado (anti-fraude) *(validación existente en wizard)*
- [x] Sin import de `EMPLOYEES` de paradise.ts en Step3/Step4 *(controller usa useEmpleadosSucursal, no EMPLOYEES[])*
- [x] Carga y error manejados con UI *(hook expone `cargando` y `error` states)*

### B.3 — Persistencia Supabase (Fase 3) — ✅ IMPLEMENTADO (DACC-CIERRE-SYNC-UX + DACC-R2)

- [x] Completar wizard → llama `iniciarCorte()` con datos del wizard *(Index.tsx handleWizardComplete)*
- [x] Datos: `sucursal_id`, `cajero`, `testigo`, `venta_esperada` *(mapeados desde wizard)*
- [x] Skip duplicados: no llama `iniciarCorte` si hay sesión activa *(guard `!activeCashCutSucursalId`)*
- [x] Error de Supabase no bloquea el flujo (degradación graceful) *(try/catch con `setSyncEstado('error')`)* — DACC-R2
- [x] CashCounter recibe datos como antes *(props sin cambio funcional)*
- [x] Ciclo de vida sync: `sincronizando` → `sincronizado` (éxito) | `error` (fallo) — DACC-R2
- [x] `ultimaSync` se establece con timestamp ISO solo tras `iniciarCorte` exitoso — DACC-R2

### B.3B — Sincronización Progreso + UX Visual (Subfase 3B) — ✅ IMPLEMENTADO (DACC-CIERRE-SYNC-UX)

- [x] `onGuardarProgreso` callback conecta CashCounter → `guardarProgreso()` Supabase
- [x] Solo CASH_CUT recibe callback (CASH_COUNT no sincroniza)
- [x] `CorteStatusBanner` visible en CashCounter con estado de sync
- [x] Props `syncEstado`, `ultimaSync`, `syncError` propagadas
- [x] 8 tests unitarios cubren: iniciarCorte, skip duplicados, sync props, CASH_COUNT sin sync, regression wizard, error rejection, Policy A sucursal, successful sync timestamp — DACC-R2
- [x] Tests existentes no rotos (mocks useCorteSesion agregados a routing + stability)

### B.4 — Reanudación de Sesión (Fase 4) — PARCIALMENTE IMPLEMENTADO (DACC-CIERRE + DACC-R2)

- [x] Sesión activa detectada → sucursal pre-seleccionada en wizard *(DACC-CIERRE: useEffect en controller)*
- [x] **POLÍTICA A (DACC-R2):** Sucursal de sesión activa gobierna sync (`sucursalParaSync = activeCashCutSucursalId ?? data.selectedStore`). Wizard preselecciona para datos locales, pero sync se vincula a sesión activa.
- [x] Sin sesión → wizard funciona sin pre-selección *(guard: `initialSucursalId && !wizardData.selectedStore`)*
- [x] `activeCashCutSucursalId` se pasa como prop al wizard *(Index.tsx → `initialSucursalId={activeCashCutSucursalId}`)*
- [ ] UX completa de reanudación (mostrar banner "sesión activa encontrada", etc.) — futuro

### B.5 — Limpieza Código Muerto (Fase 5) — ✅ COMPLETADO (DACC-CLEANUP)

- [x] `CortePage.tsx` **ELIMINADO** *(DACC-CLEANUP: 243 líneas, + test eliminado)*
- [x] `CorteOrquestador.tsx` **ELIMINADO** *(DACC-CLEANUP: 336 líneas, + test eliminado, + 4 huérfanos eliminados)*
- [x] Estado `routeCashCutToCortePage` removido de Index.tsx *(DACC-CIERRE: estado + 4 setters eliminados)*
- [x] Sin unused imports en build *(verificado: `npx eslint` = 0 errores)*
- [x] Tests actualizados *(DACC-CLEANUP: mocks CortePage removidos de 3 test files, regression test renombrado)*
- [x] Grep gate: `grep -r "CortePage\|CorteOrquestador" src/` = **ZERO resultados** *(DACC-CLEANUP)*

---

## Sección C: Pruebas Manuales (Aplicar después de cada fase)

### C.1 — Flujo Completo CASH_CUT

1. Abrir app → OperationSelector visible
2. Click "Corte de Caja"
3. Wizard abre → Step 1 (Protocolo) visible
4. Completar 6 pasos con datos reales
5. CashCounter inicia → Phase 1 conteo
6. Phase 2 delivery + verificación ciega
7. Phase 3 reporte final → WhatsApp funciona
8. Finalizar → retorna a OperationSelector

### C.2 — Flujo Con Sesión Activa

1. Crear corte parcial en Supabase (estado INICIADO)
2. Abrir app → Click "Corte de Caja"
3. Wizard abre (NO CortePage)
4. Sucursal de sesión activa pre-seleccionada
5. Completar wizard → continúa flujo normal

### C.3 — Error de Conexión

1. Desconectar red / usar Supabase sin configurar
2. Click "Corte de Caja"
3. Wizard abre normalmente
4. Sucursales muestran estado de error (o vacío)
5. App no se bloquea ni muestra pantalla blanca

---

---

## Sección D: Evidencia de Verificación DACC-CIERRE (2026-02-17)

```
npx tsc --noEmit       → 0 errores
npx vitest run         → 24/24 tests passing (2 test files)
npm run build          → SUCCESS (2.19s, 1,409.89 kB)
npx eslint (4 files)   → 0 errores, 0 warnings
```

**Archivos modificados:**
| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `src/types/initialWizard.ts` | +`initialSucursalId?: string \| null` | L19-20 |
| `src/pages/Index.tsx` | -`routeCashCutToCortePage` + 4 setters, +`initialSucursalId` prop | L23,84,130,135,139,154 |
| `src/hooks/initial-wizard/useInitialWizardController.ts` | +destructure prop, +useEffect preselección | L17,88-94 |
| `index.cashcut-routing.test.tsx` | +assertions `data-initial-sucursal-id` | L41-42,78,96 |
| `useInitialWizardController.test.ts` | +3 tests preselección sucursal | L450-485 |

---

## Sección E: Evidencia de Verificación DACC-CIERRE-SYNC-UX (2026-02-17)

```
npx tsc --noEmit       → 0 errores
npx vitest run (index) → 8/8 tests passing (3 test files)
npm run build          → SUCCESS (2.28s, 1,420.75 kB)
npx eslint (2 files)   → 0 errores, 0 warnings
```

**Archivos modificados:**
| Archivo | Cambio | Tipo |
|---------|--------|------|
| `src/pages/Index.tsx` | +sync state, +useCorteSesion, +handleGuardarProgreso, +iniciarCorte en wizard complete, +sync props a CashCounter, +reset en handleBack | Modificado |
| `src/components/CashCounter.tsx` | +CorteStatusBanner import, +sync props interface, +banner render condicional | Modificado |
| `src/__tests__/unit/pages/index.sync-ux.test.tsx` | 5 tests DACC-CIERRE-SYNC-UX | Nuevo |
| `src/__tests__/unit/pages/index.cashcut-routing.test.tsx` | +mock useCorteSesion | Modificado |
| `src/__tests__/unit/pages/index.stability.test.tsx` | +mock useCorteSesion | Modificado |

**Tests nuevos (index.sync-ux.test.tsx):**
1. `calls iniciarCorte with wizard data on CASH_CUT completion`
2. `does NOT call iniciarCorte when an active session exists`
3. `passes sync props to CashCounter for CASH_CUT`
4. `does NOT pass onGuardarProgreso for CASH_COUNT`
5. `regression: CASH_CUT always opens wizard with active session`

---

## Resultado Final Esperado

| Criterio | Antes (Dos Mundos) | Después (Unificado) |
|----------|--------------------|---------------------|
| UX/UI consistente | No (2 interfaces) | Si (wizard unico) |
| Datos de Supabase | Solo en CortePage | En wizard completo |
| Persistencia sesion | Solo en CorteOrquestador | En handleWizardComplete |
| Reanudacion corte | Solo CortePage | Wizard con pre-seleccion |
| Anti-fraude (testigo != cajero) | Solo en wizard | Preservado |
| paradise.ts necesario | Si (fallback) | No (100% Supabase) |
