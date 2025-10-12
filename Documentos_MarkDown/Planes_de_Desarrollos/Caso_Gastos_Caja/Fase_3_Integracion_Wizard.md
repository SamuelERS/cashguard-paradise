# 🧙 Fase 3: Integración con Wizard

**Tiempo estimado:** 2-3 horas | **Archivos modificados:** 2-3
**Prioridad:** 🟡 IMPORTANTE
**Versión objetivo:** v1.4.0

---

## 📋 Índice

1. [Objetivo](#-objetivo)
2. [Análisis de InitialWizardModal](#-análisis-de-initialwizardmodal)
3. [Modificaciones Necesarias](#-modificaciones-necesarias)
4. [Nuevo Step 6: Gastos Diarios](#-nuevo-step-6-gastos-diarios)
5. [State Management](#-state-management)
6. [Navegación y Validación](#-navegación-y-validación)
7. [LocalStorage Persistence](#-localstorage-persistence)
8. [Checklist de Completitud](#-checklist-de-completitud)

---

## 🎯 Objetivo

Integrar componente `<ExpenseListManager />` como **Step 6** en el wizard inicial de CashGuard Paradise, permitiendo:

- **Capturar gastos** ANTES de comenzar conteo (opcional)
- **Persistir en LocalStorage** junto con otros datos wizard
- **Pasar a useCalculations** para ajuste automático de diferencia
- **Mostrar en reporte final** WhatsApp con formato profesional

**Flujo wizard modificado:**
```
Step 1: Protocolo Anti-Fraude (4 reglas)
Step 2: Selección Sucursal
Step 3: Selección Cajero
Step 4: Selección Testigo (≠ cajero)
Step 5: Venta Esperada SICAR
Step 6: Gastos del Día (NUEVO) ← 🆕
  ↓
Comenzar Conteo (Phase 1)
```

---

## 🔍 Análisis de InitialWizardModal

### Archivo Actual

**Ruta:** `src/components/InitialWizardModal.tsx`

**Líneas clave identificadas:**

```typescript
// Línea 21: Total steps ACTUAL
const totalSteps = 5;

// Línea 23-27: State props
const [currentStep, setCurrentStep] = useState(1);
const [selectedStore, setSelectedStore] = useState<Store | null>(null);
const [selectedCashier, setSelectedCashier] = useState<Employee | null>(null);
const [selectedWitness, setSelectedWitness] = useState<Employee | null>(null);
const [expectedSales, setExpectedSales] = useState<number>(0);
// 🆕 AGREGAR: const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);

// Línea 120-200: Renderizado condicional steps
{currentStep === 1 && <ProtocolStep />}
{currentStep === 2 && <StoreSelectionStep />}
{currentStep === 3 && <CashierSelectionStep />}
{currentStep === 4 && <WitnessSelectionStep />}
{currentStep === 5 && <ExpectedSalesStep />}
// 🆕 AGREGAR: {currentStep === 6 && <ExpensesStep />}

// Línea 250-270: handleContinue validation
const handleContinue = () => {
  if (currentStep === 1) { /* Protocol validation */ }
  if (currentStep === 2) { /* Store validation */ }
  if (currentStep === 3) { /* Cashier validation */ }
  if (currentStep === 4) { /* Witness validation */ }
  if (currentStep === 5) {
    // Store in localStorage and close wizard
    // 🔧 MODIFICAR: NO cerrar aquí, avanzar a Step 6
  }
  // 🆕 AGREGAR: if (currentStep === 6) { /* Cerrar wizard */ }
};
```

### Pattern Existente (Steps 1-5)

Cada step sigue este patrón:

```typescript
// 1. Component prop-controlled
<StoreSelectionStep
  selectedStore={selectedStore}
  onStoreSelect={setSelectedStore}
  stores={PARADISE_STORES}
/>

// 2. Validation en handleContinue
if (currentStep === 2 && !selectedStore) {
  toast.error("⚠️ Seleccione una sucursal");
  return;
}

// 3. LocalStorage persistence (Step 5 final)
localStorage.setItem('cashier_data', JSON.stringify({
  store: selectedStore,
  cashier: selectedCashier,
  witness: selectedWitness,
  expectedSales: expectedSales
}));
```

---

## 🔧 Modificaciones Necesarias

### Cambio 1: Incrementar totalSteps

**Archivo:** `InitialWizardModal.tsx` línea 21

```typescript
// ❌ ANTES v1.3.6Y
const totalSteps = 5;

// ✅ DESPUÉS v1.4.0
const totalSteps = 6; // 🤖 [IA] - v1.4.0: Agregado Step 6 (Gastos del Día)
```

---

### Cambio 2: Agregar State dailyExpenses

**Archivo:** `InitialWizardModal.tsx` después de línea 27

```typescript
// ✅ NUEVO v1.4.0
const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);

// 🤖 [IA] - v1.4.0: State para gastos diarios
// - Array vacío por defecto (gastos son opcionales)
// - Pasado a ExpenseListManager como controlled prop
// - Persistido en localStorage junto con otros datos wizard
```

---

### Cambio 3: Importar DailyExpense Type

**Archivo:** `InitialWizardModal.tsx` línea 4-10 (imports)

```typescript
// ✅ NUEVO v1.4.0
import type { DailyExpense } from '@/types/cash';
```

---

### Cambio 4: Importar ExpenseListManager

**Archivo:** `InitialWizardModal.tsx` línea 4-10 (imports)

```typescript
// ✅ NUEVO v1.4.0
import { ExpenseListManager } from '@/components/cash-counting/expenses/ExpenseListManager';
```

---

### Cambio 5: Modificar Step 5 handleContinue

**Archivo:** `InitialWizardModal.tsx` líneas 250-270 (handleContinue)

```typescript
// ❌ ANTES v1.3.6Y (Step 5 cierra wizard)
if (currentStep === 5) {
  if (expectedSales < 0) {
    toast.error("⚠️ Ingrese la venta esperada");
    return;
  }

  // Store all data and close wizard
  localStorage.setItem('cashier_data', JSON.stringify({
    store: selectedStore,
    cashier: selectedCashier,
    witness: selectedWitness,
    expectedSales: expectedSales
  }));

  onComplete({
    store: selectedStore!,
    cashier: selectedCashier!,
    witness: selectedWitness!,
    expectedSales: expectedSales
  });
  return;
}

// ✅ DESPUÉS v1.4.0 (Step 5 avanza a Step 6)
if (currentStep === 5) {
  if (expectedSales < 0) {
    toast.error("⚠️ Ingrese la venta esperada");
    return;
  }

  // 🤖 [IA] - v1.4.0: NO cerrar wizard, avanzar a Step 6 (Gastos)
  setCurrentStep(6);
  return;
}
```

---

### Cambio 6: Agregar Step 6 handleContinue

**Archivo:** `InitialWizardModal.tsx` después de Step 5 validation

```typescript
// ✅ NUEVO v1.4.0
if (currentStep === 6) {
  // 🤖 [IA] - v1.4.0: Step 6 (Gastos) - opcional, siempre puede continuar

  // Validación opcional: máximo 10 gastos
  if (dailyExpenses.length > EXPENSE_VALIDATION.MAX_EXPENSES_PER_REPORT) {
    toast.error(`⚠️ Máximo ${EXPENSE_VALIDATION.MAX_EXPENSES_PER_REPORT} gastos por corte`);
    return;
  }

  // Store all data including expenses
  localStorage.setItem('cashier_data', JSON.stringify({
    store: selectedStore,
    cashier: selectedCashier,
    witness: selectedWitness,
    expectedSales: expectedSales,
    dailyExpenses: dailyExpenses // 🆕 Agregado
  }));

  // Complete wizard
  onComplete({
    store: selectedStore!,
    cashier: selectedCashier!,
    witness: selectedWitness!,
    expectedSales: expectedSales,
    dailyExpenses: dailyExpenses // 🆕 Agregado
  });
  return;
}
```

---

### Cambio 7: Actualizar Interface WizardData

**Archivo:** `InitialWizardModal.tsx` líneas 10-18 (interface)

```typescript
// ❌ ANTES v1.3.6Y
export interface WizardData {
  store: Store;
  cashier: Employee;
  witness: Employee;
  expectedSales: number;
}

// ✅ DESPUÉS v1.4.0
export interface WizardData {
  store: Store;
  cashier: Employee;
  witness: Employee;
  expectedSales: number;
  dailyExpenses: DailyExpense[]; // 🆕 v1.4.0
}
```

---

## 📦 Nuevo Step 6: Gastos Diarios

### Componente Step 6

**Ubicación:** `InitialWizardModal.tsx` líneas ~200-250 (después de Step 5)

```typescript
{currentStep === 6 && (
  <motion.div
    key="step-6"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3 }}
    className="space-y-6"
  >
    {/* Header */}
    <div className="text-center space-y-2">
      <h3 className="text-[clamp(1.25rem,4vw,1.5rem)] font-semibold text-[#e1e8ed]">
        💸 Gastos del Día
      </h3>
      <p className="text-[clamp(0.875rem,3vw,1rem)] text-[#8899a6]">
        Registre los gastos realizados hoy (opcional)
      </p>
      <p className="text-xs text-[#8899a6]">
        Los gastos se restarán automáticamente del total antes de calcular la diferencia con SICAR
      </p>
    </div>

    {/* ExpenseListManager Component */}
    <div className="mt-6">
      <ExpenseListManager
        expenses={dailyExpenses}
        onExpensesChange={setDailyExpenses}
        className="w-full"
      />
    </div>

    {/* Helper Text */}
    <div className="mt-4 p-4 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)]">
      <p className="text-sm text-[#8899a6]">
        💡 <strong>Tip:</strong> Si no hubo gastos hoy, puede continuar directamente sin agregar ninguno.
      </p>
    </div>
  </motion.div>
)}
```

### UX Consideraciones

1. **Opcional:** Usuario puede dejar lista vacía y continuar
2. **Helper text claro:** Explica cómo afectan los gastos al cálculo
3. **Validación suave:** Solo advertencia si >10 gastos (no bloqueo)
4. **Animación consistente:** Framer Motion igual que Steps 1-5

---

## 🔄 State Management

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│ InitialWizardModal (Parent)                             │
│                                                          │
│ State: dailyExpenses: DailyExpense[] = []               │
│                                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Step 6: ExpenseListManager (Child - Controlled)    │ │
│ │                                                     │ │
│ │ Props:                                              │ │
│ │ - expenses={dailyExpenses}                          │ │
│ │ - onExpensesChange={setDailyExpenses}               │ │
│ │                                                     │ │
│ │ User Actions:                                       │ │
│ │ - Agregar gasto → onExpensesChange([...expenses])  │ │
│ │ - Editar gasto → onExpensesChange(updated)         │ │
│ │ - Eliminar gasto → onExpensesChange(filtered)      │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ handleContinue (Step 6):                                 │
│   ↓                                                      │
│ localStorage.setItem('cashier_data', {                   │
│   ..., dailyExpenses                                     │
│ })                                                       │
│   ↓                                                      │
│ onComplete({ ..., dailyExpenses })                       │
│   ↓                                                      │
└─────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────┐
│ CashCounter (App Level)                                  │
│                                                          │
│ Recibe: wizardData.dailyExpenses                         │
│   ↓                                                      │
│ Pasa a: useCalculations(cash, electronic, sales,        │
│                          dailyExpenses) ← 🆕 4to param  │
│   ↓                                                      │
│ calculations.totalExpenses                               │
│ calculations.totalAdjusted = totalGeneral - totalExpenses│
│ calculations.difference = totalAdjusted - expectedSales  │
│   ↓                                                      │
│ Reporte WhatsApp incluye sección "💸 GASTOS DEL DÍA"   │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Navegación y Validación

### Botones Navegación

**Archivo:** `InitialWizardModal.tsx` líneas ~300-350 (footer buttons)

```typescript
{/* Botón "Anterior" */}
<Button
  variant="outline"
  onClick={handleBack}
  disabled={currentStep === 1}
  className="..."
>
  <ArrowLeft className="h-4 w-4 mr-2" />
  Anterior
</Button>

{/* Botón "Continuar" / "Finalizar" */}
<Button
  onClick={handleContinue}
  disabled={!canContinue}
  className="..."
>
  {currentStep === totalSteps ? "Finalizar" : "Continuar"}
  {/* 🤖 [IA] - v1.4.0: totalSteps ahora es 6 */}
  {currentStep < totalSteps && <ArrowRight className="h-4 w-4 ml-2" />}
</Button>
```

### Validación canContinue

**Archivo:** `InitialWizardModal.tsx` líneas ~280-290

```typescript
const canContinue = useMemo(() => {
  if (currentStep === 1) return protocolAccepted;
  if (currentStep === 2) return selectedStore !== null;
  if (currentStep === 3) return selectedCashier !== null;
  if (currentStep === 4) return selectedWitness !== null && selectedWitness.id !== selectedCashier?.id;
  if (currentStep === 5) return expectedSales >= 0;
  if (currentStep === 6) return true; // 🆕 v1.4.0: Gastos opcionales, siempre puede continuar
  return false;
}, [currentStep, protocolAccepted, selectedStore, selectedCashier, selectedWitness, expectedSales]);
// 🤖 [IA] - v1.4.0: NO agregar dailyExpenses a dependencies (no afecta validación)
```

---

## 💾 LocalStorage Persistence

### Estructura Completa

**Key:** `cashier_data`

```typescript
// ❌ ANTES v1.3.6Y
interface CashierDataLS {
  store: Store;
  cashier: Employee;
  witness: Employee;
  expectedSales: number;
}

// ✅ DESPUÉS v1.4.0
interface CashierDataLS {
  store: Store;
  cashier: Employee;
  witness: Employee;
  expectedSales: number;
  dailyExpenses: DailyExpense[]; // 🆕 Array puede estar vacío []
}
```

### Hidratación al Recargar

**Archivo:** `InitialWizardModal.tsx` useEffect inicial

```typescript
useEffect(() => {
  const savedData = localStorage.getItem('cashier_data');
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      if (data.store) setSelectedStore(data.store);
      if (data.cashier) setSelectedCashier(data.cashier);
      if (data.witness) setSelectedWitness(data.witness);
      if (data.expectedSales) setExpectedSales(data.expectedSales);

      // 🆕 v1.4.0: Hidratar dailyExpenses si existen
      if (data.dailyExpenses && Array.isArray(data.dailyExpenses)) {
        setDailyExpenses(data.dailyExpenses);
      }
    } catch (e) {
      console.error('Error loading wizard data:', e);
    }
  }
}, []);
```

---

## 🔗 Propagación a CashCounter

### Modificación CashCounter.tsx

**Archivo:** `src/components/CashCounter.tsx` (archivo principal app)

**Cambio necesario:**

```typescript
// ❌ ANTES v1.3.6Y
const [wizardData, setWizardData] = useState<WizardData | null>(null);

// Cuando wizard completa:
const handleWizardComplete = (data: WizardData) => {
  setWizardData(data);
  // ...
};

// Pasado a useCalculations:
const calculations = useCalculations(
  cashCount,
  electronicPayments,
  wizardData?.expectedSales || 0
  // ❌ FALTA: dailyExpenses
);

// ✅ DESPUÉS v1.4.0
const calculations = useCalculations(
  cashCount,
  electronicPayments,
  wizardData?.expectedSales || 0,
  wizardData?.dailyExpenses || [] // 🆕 4to parámetro
);
```

---

## ✅ Checklist de Completitud

### InitialWizardModal.tsx Modificaciones

- [ ] **Línea 21:** `totalSteps = 6` (incrementado de 5)
- [ ] **Línea ~27:** State `dailyExpenses` agregado
- [ ] **Línea ~10:** Interface `WizardData` con `dailyExpenses: DailyExpense[]`
- [ ] **Línea ~5:** Import `DailyExpense` type
- [ ] **Línea ~6:** Import `ExpenseListManager` component
- [ ] **Línea ~200:** Step 6 JSX agregado con ExpenseListManager
- [ ] **Línea ~260:** Step 5 handleContinue NO cierra wizard (avanza a 6)
- [ ] **Línea ~270:** Step 6 handleContinue cierra wizard + guarda expenses
- [ ] **Línea ~285:** `canContinue` con Step 6 validation
- [ ] **Línea ~100:** useEffect hidratación con dailyExpenses

### CashCounter.tsx Modificaciones

- [ ] **useCalculations:** Agregado 4to parámetro `dailyExpenses`
- [ ] **wizardData type:** Importar nuevo `WizardData` interface

### Tests Wizard

- [ ] **Test:** Step 6 renderiza correctamente
- [ ] **Test:** dailyExpenses persiste en localStorage
- [ ] **Test:** canContinue = true en Step 6 (siempre)
- [ ] **Test:** Navegación Anterior desde Step 6 funciona
- [ ] **Test:** Finalizar en Step 6 pasa dailyExpenses a onComplete

### Validación Manual

- [ ] **UI:** Step 6 aparece después de Step 5
- [ ] **UI:** Indicador "Paso 6 de 6" visible
- [ ] **UI:** ExpenseListManager funcional dentro de wizard
- [ ] **UI:** Botón "Anterior" regresa a Step 5
- [ ] **UI:** Botón "Finalizar" (no "Continuar") en Step 6
- [ ] **Datos:** dailyExpenses guardado en localStorage
- [ ] **Datos:** useCalculations recibe dailyExpenses correctamente
- [ ] **Reporte:** Gastos aparecen en sección WhatsApp

---

## 📊 Estimación de Tiempo

| Tarea | Tiempo Estimado | Complejidad |
|-------|-----------------|-------------|
| Modificar InitialWizardModal (10 cambios) | 45 min | Baja-Media |
| Agregar Step 6 JSX + styling | 20 min | Baja |
| Modificar CashCounter.tsx | 10 min | Baja |
| Testing navegación wizard | 20 min | Baja |
| Testing localStorage persistence | 15 min | Baja |
| Validación manual flow completo | 20 min | Baja |
| Fix issues encontrados | 20 min | Media |
| **TOTAL** | **2-3 horas** | **Baja-Media** |

---

## 🔗 Referencias

- **InitialWizardModal pattern:** `src/components/InitialWizardModal.tsx` (líneas 1-400)
- **Controlled components:** Steps 2-5 usan mismo pattern (prop + onChange)
- **Framer Motion:** `motion.div` con `initial/animate/exit` (línea ~150)
- **LocalStorage:** `localStorage.setItem('cashier_data', ...)` (línea ~260)
- **WizardData interface:** Usado en `CashCounter.tsx` línea ~50

---

## 📝 Notas Importantes

1. **Step 6 es OPCIONAL:** Usuario puede dejar lista vacía sin problemas
2. **Validación suave:** Solo warning si >10 gastos, NO bloqueo
3. **Backward compatibility:** Si dailyExpenses ausente en localStorage → default []
4. **Animación consistente:** Usar mismo Framer Motion pattern que Steps 1-5
5. **Responsive:** ExpenseListManager ya es responsive, wizard solo debe contenerlo
6. **TypeScript strict:** WizardData interface debe actualizarse ANTES de modificar onComplete

---

**✅ Documento completado:** Fase 3 - Integración Wizard
**Próximo documento:** Fase_5_Reporteria_WhatsApp.md (15 min, 200+ líneas)
**Fecha:** 11 Oct 2025
**Versión:** v1.4.0
