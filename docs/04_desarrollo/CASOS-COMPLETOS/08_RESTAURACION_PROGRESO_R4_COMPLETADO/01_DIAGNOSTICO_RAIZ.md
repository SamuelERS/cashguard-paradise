# CASO-SANN-R4: Restaurar Sesion No Restaura Progreso

## Reporte del Usuario

> "Tenemos que cuando recuperamos o le damos restaurar la sesion nos lleva a
> esta pantalla donde salen estos modales enormes no nos restaura en donde
> nos quedamos."

**Screenshot:** StoreSelectionForm ("Configuracion Inicial") aparece con:
- Sucursal: Plaza Merliot (pre-filled)
- Cajero: Edenilson Lopez (pre-filled)
- Testigo: *vacio* ("Seleccione el testigo")
- Venta Esperada: $444 (pre-filled)
- Boton "Iniciar Fase 1": **DESHABILITADO** (testigo vacio)

---

## Cadena de Root Cause

### BUG PRIMARIO: `selectedWitness: ''`

**Archivo:** `src/pages/Index.tsx` linea 196
```
handleResumeSession → setInitialData({
  selectedStore: corte.sucursal_id,    // ✅ Extraido
  selectedCashier: corte.cajero,       // ✅ Extraido
  selectedWitness: '',                 // ❌ BUG — corte.testigo DISPONIBLE pero NO usado
  expectedSales: corte.venta_esperada, // ✅ Extraido
  dailyExpenses: [],                   // ❌ corte.datos_conteo.gastos_dia NO extraido
})
```

### BUG SECUNDARIO: `hasInitialData = false`

**Archivo:** `src/hooks/useCashCounterOrchestrator.ts` linea 132
```
const hasInitialData = Boolean(initialStore && initialCashier && initialWitness);
//                                                                ^^^^^^^^^^^^
// initialWitness = '' → Boolean('') = false → hasInitialData = false
```

### EFECTO EN CASCADA

**Archivo:** `src/components/CashCounter.tsx` linea 117
```
{state.phaseState.currentPhase === 1 &&
 !state.phaseState.phase1Completed &&
 !state.hasInitialData &&            // ← hasInitialData=false → condicion TRUE
  <StoreSelectionForm ... />          // ← RENDERIZA formulario configuracion
}
```

El useEffect de auto-inicio (useCashCounterOrchestrator linea 250) NUNCA se dispara
porque `hasInitialData` es `false`.

---

## Datos Disponibles vs Datos Extraidos

| Campo Corte (Supabase) | Disponible | Extraido en handleResumeSession | Pasado a CashCounter |
|------------------------|:----------:|:-------------------------------:|:--------------------:|
| `sucursal_id`          | ✅         | ✅                              | ✅ `initialStore`     |
| `cajero`               | ✅         | ✅                              | ✅ `initialCashier`   |
| `testigo`              | ✅         | ❌ (siempre `''`)               | ❌                   |
| `venta_esperada`       | ✅         | ✅                              | ✅ `initialExpectedSales` |
| `fase_actual`          | ✅         | ❌                              | ❌                   |
| `datos_conteo.conteo_parcial` | ✅  | ❌                              | ❌ (`initialCashCount` existe como prop pero no se usa) |
| `datos_conteo.pagos_electronicos` | ✅ | ❌                           | ❌ (`initialElectronicPayments` existe como prop pero no se usa) |
| `datos_conteo.gastos_dia` | ✅      | ❌                              | ❌ (`initialDailyExpenses` siempre `[]`) |

### Estructura real de `corte.datos_conteo` (guardada por `guardarProgreso`):

```
{
  conteo_parcial: CashCount,           // penny, nickel, dime, ... bill100
  pagos_electronicos: ElectronicPayments, // credomatic, promerica, bankTransfer, paypal
  gastos_dia: DailyExpense[] | null
}
```

---

## Props de CashCounter que EXISTEN pero NO se usan en resume

| Prop CashCounter        | Tipo                  | Estado Actual  |
|------------------------|-----------------------|----------------|
| `initialCashCount`     | `CashCount`           | No se pasa     |
| `initialElectronicPayments` | `ElectronicPayments` | No se pasa |
| `skipWizard`           | `boolean`             | No se pasa     |
| `onGuardarProgreso`    | `(datos) => void`     | Se pasa (OK)   |

---

## Limitacion Arquitectonica: usePhaseManager

**Archivo:** `src/hooks/usePhaseManager.ts` linea 50-56
```
const INITIAL_PHASE_STATE: PhaseState = {
  currentPhase: 1,            // Siempre inicia en Phase 1
  phase1Completed: false,
  phase2Completed: false,
  totalCashFromPhase1: 0,
  shouldSkipPhase2: false
};
```

**Implicacion:** usePhaseManager NO soporta iniciar en fase arbitraria.
Si `corte.fase_actual = 2`, no hay mecanismo para restaurar Phase 2 directamente.
Esto requiere una extension del hook (ver opciones arquitectonicas).
