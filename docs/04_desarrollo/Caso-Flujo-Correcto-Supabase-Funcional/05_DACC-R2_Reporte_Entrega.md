# DACC-R2: Reporte de Entrega (Corrección DACC-CIERRE-SYNC-UX)

**Fecha:** 2026-02-17
**Orden:** DACC-CIERRE-SYNC-UX-R2 (Corrección Inmediata)
**Branch:** `feature/ot11-activar-corte-page-ui`

---

## Hallazgos, Causa Raíz y Corrección

### Gap 1 — Ambigüedad en Source of Truth de Sucursal

| Campo | Detalle |
|-------|---------|
| **Hallazgo** | `Index.tsx` línea 126 usaba `activeCashCutSucursalId \|\| data.selectedStore` sin regla de negocio explícita. Operador `\|\|` podría evaluar strings vacíos como falsy. |
| **Causa raíz** | Faltaba documentación de política y operador era ambiguo (`\|\|` vs `??`). |
| **Corrección** | Definida **Política A**: sesión activa SIEMPRE gobierna sync. Renombrada variable a `sucursalParaSync`. Cambiado `\|\|` → `??` (nullish coalescing). Comentarios exhaustivos agregados. |
| **Archivo** | `src/pages/Index.tsx` líneas 124-153 |

### Gap 2 — Ciclo de Vida Sync Roto

| Campo | Detalle |
|-------|---------|
| **Hallazgo** | `syncEstado` nunca transitaba a `'sincronizando'` antes de `iniciarCorte`, ni a `'error'` ante fallo. Default `'sincronizado'` enmascaraba estado real. |
| **Causa raíz** | `handleWizardComplete` no implementaba transiciones de estado sync. Solo `handleGuardarProgreso` (autosave) las tenía. |
| **Corrección** | Agregado ciclo completo: `sincronizando` → `iniciarCorte()` → `sincronizado` + `ultimaSync` (éxito) \| `error` (fallo). Sesión activa reanudada establece `sincronizado` directamente. |
| **Archivo** | `src/pages/Index.tsx` líneas 132-153 |

### Gap 3 — Tests Sin Cobertura de Errores

| Campo | Detalle |
|-------|---------|
| **Hallazgo** | 5 tests existentes no cubrían: rechazo de `iniciarCorte`, conflicto de sucursal (sesión activa ≠ wizard), ni verificaban `ultimaSync` post-éxito. |
| **Causa raíz** | Tests originales cubrían happy path y skip duplicados, pero no edge cases de error ni Policy A. |
| **Corrección** | 3 tests nuevos + 1 test actualizado. Mock `useCorteSesion` ahora captura `sucursalId` vía `_lastSucursalId`. Total: 8 tests. |
| **Archivo** | `src/__tests__/unit/pages/index.sync-ux.test.tsx` |

### Gap 4 — Documentación Desalineada

| Campo | Detalle |
|-------|---------|
| **Hallazgo** | Docs 02, 03, 04 no reflejaban Política A ni ciclo de vida sync real. Algunos textos implicaban que "usuario puede cambiar sucursal" sin matiz. |
| **Causa raíz** | Documentación escrita antes de implementar correcciones R2. |
| **Corrección** | 3 documentos actualizados con: Política A explícita, ciclo sync correcto, conteo tests actualizado (5→8), criterios aceptación expandidos. |
| **Archivos** | `02_Arquitectura_Correcta.md`, `03_Plan_Implementacion.md`, `04_Verificacion.md` |

---

## Diff por Archivo

### `src/pages/Index.tsx`

| Líneas | Cambio |
|--------|--------|
| 124-127 | Comentario DACC-R2 Gap 1: Política A explícita documentada |
| 129 | `sucursalId` → `sucursalParaSync`, `\|\|` → `??` |
| 130 | `setSyncSucursalId(sucursalParaSync)` |
| 132-134 | Guard `!activeCashCutSucursalId` + `setSyncEstado('sincronizando')` |
| 135-144 | try/catch `iniciarCorte` con `setSyncEstado('sincronizado')` + `setUltimaSync()` (éxito) y `setSyncEstado('error')` (fallo) |
| 149-152 | Sesión activa reanudada → `setSyncEstado('sincronizado')` |

### `src/__tests__/unit/pages/index.sync-ux.test.tsx`

| Líneas | Cambio |
|--------|--------|
| 28 | `_lastSucursalId: '' as string` agregado a `corteSesionMocks` |
| 42-45 | Mock `useCorteSesion` captura `sucursalId` argumento |
| 211 | Test existente: assertion `data-ultima-sync` no vacío |
| 246-257 | **Test nuevo:** `iniciarCorte` rejection → `syncEstado = 'error'` |
| 259-276 | **Test nuevo:** Policy A — sesión activa fuerza su sucursal |
| 278-291 | **Test nuevo:** éxito → `sincronizado` + `ultimaSync` válido |

### `docs/.../02_Arquitectura_Correcta.md`

| Sección | Cambio |
|---------|--------|
| Detección Sesión Activa | "post-DACC-CIERRE" → "post-DACC-R2" + Política A completa |
| Persistencia al Completar | Código ejemplo actualizado con ciclo sync correcto |
| Sincronización Progreso | Título actualizado con marcador DACC-CIERRE-SYNC-UX |

### `docs/.../03_Plan_Implementacion.md`

| Sección | Cambio |
|---------|--------|
| Fase 3 tests | 5 tests → 8 tests (3 DACC-R2 descritos) |
| Fase 3 criterios | +3 criterios: ciclo sync, Policy A, ultimaSync |
| Fase 4 criterios | Política A explícita reemplaza texto ambiguo |

### `docs/.../04_Verificacion.md`

| Sección | Cambio |
|---------|--------|
| B.3 | +3 items DACC-R2: error graceful, ciclo sync, ultimaSync |
| B.3B | Tests 5→8, descripciones actualizadas |
| B.4 | Política A explícita con `sucursalParaSync` |

---

## Resultados de Gates

```
npx tsc --noEmit       → 0 errores
npx vitest run         → 11/11 tests passing (3 test files)
npm run build          → SUCCESS (2.13s, 1,420.85 kB)
npx eslint (4 files)   → 0 errores, 0 warnings
```

**Desglose tests:**
- `index.sync-ux.test.tsx` — 8/8 passing (5 DACC-CIERRE-SYNC-UX + 3 DACC-R2)
- `index.cashcut-routing.test.tsx` — 2/2 passing
- `index.stability.test.tsx` — 1/1 passing

---

## Riesgos Residuales

| # | Riesgo | Severidad | Mitigación |
|---|--------|-----------|------------|
| 1 | `handleGuardarProgreso` catch no setea `syncError` (solo `setSyncEstado('error')`) | Baja | Banner muestra estado error correctamente vía `syncEstado`. `syncError` viene del hook `useCorteSesion` para errores diferentes. |
| 2 | `syncEstado` default `'sincronizado'` antes de cualquier sync real | Baja | Banner solo renderiza cuando `syncSucursalId` tiene valor (guard en línea 269 Index.tsx). Sin sucursal → sin banner → sin confusión. |
| 3 | Fases 1-2 (Step2→useSucursales, Step3/4→useEmpleadosSucursal) pendientes | Media | Documentado en `03_Plan_Implementacion.md`. No bloquea funcionalidad actual (wizard usa datos locales). |

---

## Veredicto

### APROBADO

Todos los gaps identificados en la orden DACC-R2 han sido corregidos:
- **Gap 1:** Política A definida y codificada con operador `??`
- **Gap 2:** Ciclo de vida sync completo (sincronizando → sincronizado | error)
- **Gap 3:** 3 tests nuevos + 1 actualizado cubriendo error, conflicto sucursal, y éxito real
- **Gap 4:** 3 documentos alineados con comportamiento real

Gates de verificación: 4/4 passing.
