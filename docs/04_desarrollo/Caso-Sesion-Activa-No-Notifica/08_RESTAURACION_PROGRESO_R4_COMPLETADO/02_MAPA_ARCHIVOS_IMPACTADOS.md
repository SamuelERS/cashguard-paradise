# CASO-SANN-R4: Mapa de Archivos Impactados

## Archivos por Modulo

### SCOPE A: Fix Blocker (usuario puede contar)

| # | Archivo | Lineas | Cambio Requerido |
|---|---------|--------|------------------|
| 1 | `src/pages/Index.tsx` | 193-199 | Extraer `corte.testigo` en handleResumeSession |
| 2 | `src/pages/Index.tsx` | 38-44 | Extender tipo `initialData` con campos opcionales |
| 3 | `src/pages/Index.tsx` | 340-357 | Pasar nuevas props a CashCounter |

### SCOPE B: Restaurar Progreso Parcial (conteo hidratado)

| # | Archivo | Lineas | Cambio Requerido |
|---|---------|--------|------------------|
| 4 | `src/pages/Index.tsx` | 193-199 | Extraer `datos_conteo` parcial con type guards |
| 5 | `src/pages/Index.tsx` | 340-357 | Pasar `initialCashCount`, `initialElectronicPayments`, `skipWizard` |

### SCOPE C: Restauracion Completa de Fase (avanzado)

| # | Archivo | Lineas | Cambio Requerido |
|---|---------|--------|------------------|
| 6 | `src/hooks/usePhaseManager.ts` | 50-56, 77 | Aceptar `initialPhaseState` opcional |
| 7 | `src/hooks/useCashCounterOrchestrator.ts` | 144 | Propagar `initialPhase` a usePhaseManager |
| 8 | `src/components/CashCounter.tsx` | 16-39 | Nueva prop `initialPhase` |

---

## Flujo de Datos Actual (ROTO)

```
Supabase (Corte)
  │
  ├─ sucursal_id ──────→ Index.initialData.selectedStore ──→ CashCounter.initialStore ──→ hasInitialData ✅
  ├─ cajero ────────────→ Index.initialData.selectedCashier → CashCounter.initialCashier → hasInitialData ✅
  ├─ testigo ──────────→ ❌ IGNORADO (siempre '')       ──→ CashCounter.initialWitness → hasInitialData = FALSE ❌
  ├─ venta_esperada ───→ Index.initialData.expectedSales ──→ CashCounter.initialExpectedSales ✅
  ├─ fase_actual ──────→ ❌ IGNORADO
  ├─ datos_conteo ─────→ ❌ IGNORADO
  │   ├─ conteo_parcial ────→ (CashCounter ACEPTA initialCashCount pero NO se pasa)
  │   ├─ pagos_electronicos → (CashCounter ACEPTA initialElectronicPayments pero NO se pasa)
  │   └─ gastos_dia ────────→ (siempre [] en lugar de datos reales)
  └─ datos_entrega ────→ ❌ IGNORADO
```

## Flujo de Datos Propuesto (CORREGIDO)

```
Supabase (Corte)
  │
  ├─ sucursal_id ──────→ Index.initialData.selectedStore ──→ CashCounter.initialStore ✅
  ├─ cajero ────────────→ Index.initialData.selectedCashier → CashCounter.initialCashier ✅
  ├─ testigo ──────────→ Index.initialData.selectedWitness → CashCounter.initialWitness ✅  ← FIX M1
  ├─ venta_esperada ───→ Index.initialData.expectedSales ──→ CashCounter.initialExpectedSales ✅
  ├─ datos_conteo ─────→ PARSE + TYPE GUARD                                                ← FIX M2
  │   ├─ conteo_parcial ────→ initialData.cashCount ───→ CashCounter.initialCashCount ✅
  │   ├─ pagos_electronicos → initialData.electronic ──→ CashCounter.initialElectronicPayments ✅
  │   └─ gastos_dia ────────→ initialData.dailyExpenses → CashCounter.initialDailyExpenses ✅
  └─ skipWizard: true ─→ initialData.skipWizard ───────→ CashCounter.skipWizard ✅          ← FIX M1
```

---

## Archivos de Test

| Archivo Test | Modulo | Estado |
|-------------|--------|--------|
| `src/__tests__/unit/pages/index.resume-session.test.tsx` | M1-M2 | Existente (5 tests R3), debe EXTENDERSE |
| `src/__tests__/unit/pages/index.cashcut-routing.test.tsx` | Regresion | Existente, debe PASAR sin cambios |
| `src/__tests__/unit/pages/index.stability.test.tsx` | Regresion | Existente, debe PASAR sin cambios |
