# 🔧 Cambios Técnicos Detallados - Sistema Gastos v1.4.0

**Fecha:** 14 Octubre 2025  
**Versión:** v1.4.0

---

## 📁 Archivo: CashCalculation.tsx

### Cambio 1: Imports (línea 27-28)
```typescript
// AGREGADO
import { DailyExpense, EXPENSE_CATEGORY_EMOJI, EXPENSE_CATEGORY_LABEL } from '@/types/expenses';
```

### Cambio 2: Interface CalculationData (líneas 37-38)
```typescript
interface CalculationData {
  totalCash: number;
  totalElectronic: number;
  totalGeneral: number;
  totalExpenses: number;      // ← NUEVO
  totalAdjusted: number;       // ← NUEVO
  difference: number;
  // ...
}
```

### Cambio 3: Props Interface (línea 64)
```typescript
interface CashCalculationProps {
  // ... props existentes
  expenses?: DailyExpense[];   // ← NUEVO
  // ...
}
```

### Cambio 4: Component Destructuring (línea 81)
```typescript
const CashCalculation = ({
  // ... props existentes
  expenses = [],               // ← NUEVO (default array vacío)
  // ...
}: CashCalculationProps) => {
```

### Cambio 5: Cálculos (líneas 113-120)
```typescript
const performCalculation = useCallback(() => {
  const totalCash = calculateCashTotal(cashCount);
  const totalElectronic = Object.values(electronicPayments).reduce((sum, val) => sum + val, 0);
  const totalGeneral = totalCash + totalElectronic;
  
  // ← NUEVO: Calcular total gastos
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // ← NUEVO: Total ajustado = totalGeneral - gastos
  const totalAdjusted = totalGeneral - totalExpenses;
  
  // ← MODIFICADO: Diferencia usa totalAdjusted (NO totalGeneral)
  const difference = totalAdjusted - expectedSales;
  
  // ...
}, [cashCount, electronicPayments, expectedSales, expenses]); // ← expenses agregado
```

### Cambio 6: Data Object (líneas 128-129)
```typescript
const data = {
  totalCash,
  totalElectronic,
  totalGeneral,
  totalExpenses,    // ← NUEVO
  totalAdjusted,    // ← NUEVO
  difference,
  // ...
};
```

### Cambio 7: Función generateExpensesSection() (líneas 565-592)
```typescript
// ← NUEVA FUNCIÓN COMPLETA
const generateExpensesSection = useCallback(() => {
  if (!expenses || expenses.length === 0) {
    return ''; // No mostrar sección si no hay gastos
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const expensesList = expenses.map((expense, index) => {
    const categoryEmoji = EXPENSE_CATEGORY_EMOJI[expense.category];
    const categoryLabel = EXPENSE_CATEGORY_LABEL[expense.category];
    const invoiceStatus = expense.hasInvoice ? '✓ Con factura' : '✗ Sin factura';
    
    return `${index + 1}. ${categoryEmoji} ${expense.concept}
   💵 ${formatCurrency(expense.amount)} | ${invoiceStatus}
   📂 ${categoryLabel}`;
  }).join('\n\n');

  return `
${WHATSAPP_SEPARATOR}

💸 *GASTOS DEL DÍA*

${expensesList}

💰 *Total Gastos:* ${formatCurrency(totalExpenses)}
⚠️ Este monto se restó del total general
`;
}, [expenses]);
```

### Cambio 8: RESUMEN EJECUTIVO (líneas 691-695)
```typescript
// ANTES
💼 *Total Día:* ${formatCurrency(calculationData?.totalGeneral || 0)}
🎯 *SICAR Esperado:* ${formatCurrency(expectedSales)}
${...} *Diferencia:* ${formatCurrency(calculationData?.difference || 0)}

// DESPUÉS
💼 *Total General:* ${formatCurrency(calculationData?.totalGeneral || 0)}
${(calculationData?.totalExpenses || 0) > 0 ? `💸 *Gastos del Día:* -${formatCurrency(calculationData?.totalExpenses || 0)}
📊 *Total Ajustado:* ${formatCurrency(calculationData?.totalAdjusted || 0)}
` : ''}🎯 *SICAR Esperado:* ${formatCurrency(expectedSales)}
${...} *Diferencia:* ${formatCurrency(calculationData?.difference || 0)} (${...})
```

### Cambio 9: Insertar Sección Gastos (línea 696)
```typescript
// ANTES
${deliveryChecklistSection}${remainingChecklistSection}${fullAlertsSection}${verificationSection}

// DESPUÉS
${deliveryChecklistSection}${remainingChecklistSection}${generateExpensesSection()}${fullAlertsSection}${verificationSection}
```

### Cambio 10: Dependencies generateCompleteReport (líneas 713-716)
```typescript
// ANTES
}, [calculationData, electronicPayments, deliveryCalculation, store, cashier, witness, phaseState, expectedSales,
    validatePhaseCompletion, generateDenominationDetails, generateDataHash, generateCriticalAlertsBlock,
    generateWarningAlertsBlock, generateDeliveryChecklistSection, generateRemainingChecklistSection]);

// DESPUÉS
}, [calculationData, electronicPayments, deliveryCalculation, store, cashier, witness, phaseState, expectedSales,
    validatePhaseCompletion, generateDenominationDetails, generateDataHash, generateCriticalAlertsBlock,
    generateWarningAlertsBlock, generateDeliveryChecklistSection, generateRemainingChecklistSection, generateExpensesSection]);
// expenses NO incluido porque generateExpensesSection ya lo captura
```

### Cambio 11: UI Visual - Totales (líneas 1000-1015)
```typescript
// AGREGADO después de "Electrónico:"
{(calculationData?.totalExpenses || 0) > 0 && (
  <div className="flex justify-between">
    <span className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>Gastos:</span>
    <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#ff453a' }}>
      -{formatCurrency(calculationData?.totalExpenses || 0)}
    </span>
  </div>
)}

// MODIFICADO: "Total General" → "Total Ajustado" si hay gastos
<span style={{ color: '#8899a6' }}>Total {(calculationData?.totalExpenses || 0) > 0 ? 'Ajustado' : 'General'}:</span>
<span style={{ color: '#0a84ff' }}>
  {formatCurrency((calculationData?.totalExpenses || 0) > 0 ? (calculationData?.totalAdjusted || 0) : (calculationData?.totalGeneral || 0))}
</span>
```

---

## 📁 Archivo: DailyExpensesManager.tsx

### Fix 1: Botón Header (línea 289)
```typescript
// ANTES
{!isAdding && !disabled && (
  <Button>Agregar</Button>
)}

// DESPUÉS
{!isAdding && !disabled && expenses.length > 0 && (
  <Button>Agregar</Button>
)}
```

### Fix 2: Constante DECIMAL_PLACES (línea 132)
```typescript
// ANTES
if (decimals > EXPENSE_VALIDATION.MAX_DECIMAL_PLACES) {

// DESPUÉS
if (decimals > EXPENSE_VALIDATION.DECIMAL_PLACES) {
```

### Fix 3: Button Variant (línea 398)
```typescript
// ANTES
<Button variant="outline">Cancelar</Button>

// DESPUÉS
<Button variant="ghost">Cancelar</Button>
```

---

## 📁 Archivos Fase 3 (Sesión Previa)

### useWizardNavigation.ts
- Línea 38: Import `DailyExpense`
- Línea 68: Campo `dailyExpenses?: DailyExpense[]`
- Línea 87: `dailyExpenses: []` default
- Línea 92: `totalSteps = 6`
- Línea 116: Validación Paso 6 `return true`
- Línea 197: Título Paso 6

### InitialWizardModal.tsx
- Líneas 1-13: Imports DailyExpense + DailyExpensesManager
- Líneas 41-50: Props `dailyExpenses: DailyExpense[]`
- Líneas 197-206: `totalTasks = 6`
- Líneas 164-174: `onComplete` con `dailyExpenses`
- Líneas 442-453: Botón "Continuar" Paso 5
- Líneas 503-534: Case 6 renderiza DailyExpensesManager
- Líneas 631-639: Botón "Finalizar" Paso 6

### Index.tsx
- Línea 10: Import `DailyExpense`
- Líneas 20-26: State `dailyExpenses: DailyExpense[]`
- Líneas 48-54: Handler con `dailyExpenses` opcional
- Línea 120: Prop `initialDailyExpenses`

### CashCounter.tsx
- Línea 4: Import `DailyExpense`
- Líneas 64-70: Props `initialDailyExpenses`
- Líneas 76-85: Destructuring con default `[]`
- Línea 102: Estado `dailyExpenses`

---

## 🔄 Propagación de Datos

```
Wizard (Paso 6)
  ↓ dailyExpenses: DailyExpense[]
Index.tsx (handleWizardComplete)
  ↓ initialDailyExpenses
CashCounter.tsx (estado interno)
  ↓ expenses prop
CashCalculation.tsx
  ↓ useCalculations hook
  ↓ generateExpensesSection()
Reporte WhatsApp
```

---

## 📊 Ecuación Financiera

```typescript
// Paso 1: Calcular gastos
totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

// Paso 2: Ajustar total
totalAdjusted = totalGeneral - totalExpenses

// Paso 3: Calcular diferencia
difference = totalAdjusted - expectedSales  // ← Usa ajustado, NO general
```

---

**Total cambios:** 13 en CashCalculation.tsx + 3 fixes en DailyExpensesManager.tsx  
**Líneas agregadas:** ~150  
**Líneas modificadas:** ~30
