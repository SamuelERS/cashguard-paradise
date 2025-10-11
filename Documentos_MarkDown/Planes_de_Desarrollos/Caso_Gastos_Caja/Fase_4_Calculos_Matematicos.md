# 🧮 Fase 4: Cálculos Matemáticos

**Tiempo:** 2-3 horas | **Tests:** 15 tests

---

## 🎯 Objetivo

Ajustar ecuaciones para incluir gastos en cálculo de diferencias vs SICAR.

---

## 📐 Ecuaciones

### ❌ ANTES (Incorrecta)
```typescript
const difference = totalGeneral - expectedSales; // Sin gastos
```

### ✅ DESPUÉS (Correcta)
```typescript
const totalExpenses = calculateTotalExpenses(dailyExpenses);
const totalAdjusted = totalGeneral - totalExpenses;
const difference = totalAdjusted - expectedSales;
```

---

## 🔧 Archivos a Modificar

### 1. `src/utils/calculations.ts` - Helper

```typescript
export function calculateTotalExpenses(expenses: DailyExpense[]): number {
  if (!expenses || expenses.length === 0) return 0;
  
  return expenses.reduce((sum, expense) => {
    const amount = typeof expense.amount === 'number' && !isNaN(expense.amount)
      ? expense.amount
      : 0;
    return sum + (amount > 0 ? amount : 0);
  }, 0);
}
```

### 2. `src/hooks/useCalculations.ts` - Hook

```typescript
export function useCalculations(
  cashCount: CashCount,
  electronicPayments: ElectronicPayments,
  expectedSales: number,
  dailyExpenses: DailyExpense[] = [] // 🆕 NUEVO
) {
  const calculations = useMemo(() => {
    const totalCash = calculateCashTotal(cashCount);
    const totalElectronic = Object.values(electronicPayments).reduce(...);
    const totalGeneral = totalCash + totalElectronic;
    
    const totalExpenses = calculateTotalExpenses(dailyExpenses); // 🆕
    const totalAdjusted = totalGeneral - totalExpenses;          // 🆕
    const difference = totalAdjusted - expectedSales;            // 🔧
    
    return {
      totalCash,
      totalElectronic,
      totalGeneral,
      totalExpenses,   // 🆕
      totalAdjusted,   // 🆕
      difference,
      // ...
    };
  }, [cashCount, electronicPayments, expectedSales, dailyExpenses]);

  return calculations;
}
```

---

## 🧪 Tests

### Unit Tests (5)
- Empty array → 0
- Null/undefined → 0
- Sum multiple expenses
- Single expense
- Ignore invalid amounts

### Integration Tests (5)
- Calculate totalExpenses
- Calculate totalAdjusted
- Calculate difference
- No expenses default
- Recalculate on change

### TIER 0 (5)
- Cross-validate sums
- Verify adjusted calculation
- Verify difference formula
- With vs without expenses
- Zero expenses behavior

---

**Total:** 15 tests | **Archivos:** 2 modificados
