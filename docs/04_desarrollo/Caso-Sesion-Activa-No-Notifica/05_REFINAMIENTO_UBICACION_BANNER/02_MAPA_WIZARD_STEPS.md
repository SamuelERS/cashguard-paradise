# 02 — Mapa Arquitectónico: Wizard 6 Pasos

## Arquitectura de Pasos

```
┌─────────────────────────────────────────────────────────┐
│                    InitialWizardModal                     │
│                                                          │
│  Controller: useInitialWizardController()                │
│  Navigation: useWizardNavigation()                       │
│  Steps:      useRulesFlow() (solo Paso 1)               │
│                                                          │
│  ┌────────────────────────────────────────────────────┐  │
│  │ Header: Moon icon + "Corte Nocturno" + X button    │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ Step Indicator: "Paso {n} de 6"                    │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ >>> BANNER ACTUAL (líneas 142-166) <<<             │  │  ← AQUÍ está hoy
│  ├────────────────────────────────────────────────────┤  │
│  │ AnimatePresence (Step Content)                     │  │
│  │   motion.div key={currentStep}                     │  │
│  │     ├─ Step 1: Step1ProtocolRules                  │  │
│  │     ├─ Step 2: Step2StoreSelection                 │  │
│  │     ├─ Step 3: Step3CashierSelection               │  │
│  │     ├─ Step 4: Step4WitnessSelection               │  │
│  │     ├─ Step 5: Step5SicarInput                     │  │
│  │     └─ Step 6: Step6Expenses                       │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ Footer: ← Anterior | Continuar →                  │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Detalle por Paso

| Paso | Componente | Propósito | Datos que maneja | Validación |
|------|-----------|-----------|------------------|------------|
| 1 | `Step1ProtocolRules` | Protocolo Anti-Fraude | 4 reglas secuenciales | Todas las reglas completadas |
| **2** | **`Step2StoreSelection`** | **Selección Sucursal** | **`selectedStore`** | **Store seleccionado (non-empty)** |
| 3 | `Step3CashierSelection` | Selección Cajero | `selectedCashier` | Cajero seleccionado |
| 4 | `Step4WitnessSelection` | Selección Testigo | `selectedWitness` | Testigo ≠ cajero |
| 5 | `Step5SicarInput` | Venta Esperada SICAR | `expectedSales` | Valor > 0 |
| 6 | `Step6Expenses` | Gastos del Día | `dailyExpenses[]` | Siempre válido (opcional) |

## Pre-selección de Sucursal (initialSucursalId)

**Archivo:** `useInitialWizardController.ts` líneas 88-94

```
Flujo de pre-selección:
1. Index.tsx pasa initialSucursalId="plaza-merliot" al wizard
2. useInitialWizardController recibe prop
3. useEffect detecta: isOpen + initialSucursalId + !wizardData.selectedStore
4. Ejecuta: updateWizardData({ selectedStore: "plaza-merliot" })
5. Cuando usuario llega a Paso 2, dropdown ya tiene valor pre-seleccionado
6. Checkmark verde "✓ Seleccionada" aparece inmediatamente
7. Usuario PUEDE cambiar sucursal si desea (dropdown editable)
```

**Punto clave:** El Paso 2 NO se salta. Solo se pre-llena.

## Propiedad ctrl.currentStep

**Disponibilidad:** `ctrl.currentStep` (number 1-6) está disponible en
`InitialWizardModalView.tsx` vía el controller:

```
const ctrl = useInitialWizardController(props);
// ctrl.currentStep → number (1-6)
// ctrl.totalSteps → 6
// ctrl.availableStores → Store[] (para resolver nombre sucursal)
```

**No se requiere nuevo wiring** — la propiedad ya está expuesta y consumible.

## Archivos del Wizard (Referencia)

```
src/
├── components/initial-wizard/
│   ├── InitialWizardModal.tsx          ← Re-export (thin wrapper)
│   ├── InitialWizardModalView.tsx      ← VISTA (banner está aquí)
│   ├── useInitialWizardController.ts   ← Controller (pre-selección)
│   ├── steps/
│   │   ├── Step1ProtocolRules.tsx
│   │   ├── Step2StoreSelection.tsx     ← Paso de sucursal
│   │   ├── Step3CashierSelection.tsx
│   │   ├── Step4WitnessSelection.tsx
│   │   ├── Step5SicarInput.tsx
│   │   └── Step6Expenses.tsx
│   └── __tests__/
│       ├── InitialWizardModal.test.tsx  (22 tests)
│       └── ActiveSessionBanner.test.tsx (5 tests) ← CASO-SANN
├── hooks/
│   └── useWizardNavigation.ts          ← Navegación pasos (currentStep)
└── pages/
    └── Index.tsx                       ← Wiring (hasActiveSession prop)
```
