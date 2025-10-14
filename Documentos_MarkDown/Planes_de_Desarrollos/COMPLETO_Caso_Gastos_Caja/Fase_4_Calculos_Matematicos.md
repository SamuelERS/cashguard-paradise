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

## ✅ REGLAS_DE_LA_CASA.md Compliance

Esta fase cumple las siguientes reglas constitucionales de Paradise System Labs:

### Checklist Pre-Ejecución:

- [ ] **🔒 Preservación del código existente:**
  - `CashCalculation.tsx` ya existe - modificar solo ecuaciones específicas (4 ubicaciones)
  - NO tocar lógica de conteo, delivery, ni verificación ciega

- [ ] **⚡ Principio de no regresión:**
  - Todos los cálculos existentes deben seguir funcionando correctamente
  - Tests TIER 0-4 (174 tests) deben seguir pasando sin cambios

- [ ] **💻 TypeScript estricto (cero `any`):**
  - Helper `calculateTotalExpenses()` completamente tipado
  - Parámetro `DailyExpense[]` con interface correcta
  - Validar con `npx tsc --noEmit` → 0 errors obligatorio

- [ ] **🧪 100% coverage para lógica financiera (CRÍTICO):**
  - **15 tests requeridos** (Unit + Integration + TIER 0)
  - **TIER 0 Cross-Validation obligatorio** para ecuaciones financieras
  - **⚠️ REGLA CONSTITUCIONAL:** REGLAS_DE_LA_CASA.md línea 85-90 establece:
    *"🧪 Tests: 100% coverage para funciones financieras críticas (calculations.ts, deliveryCalculation.ts)."*
  - Gastos afectan ecuación final → TIER 0 valida corrección matemática

- [ ] **🗺️ Task list completada:**
  - 4 modificaciones de ecuaciones verificadas una por una
  - Checklist líneas 88-102 completada antes de marcar fase terminada

- [ ] **📝 Documentación obligatoria:**
  - Comentarios `// 🤖 [IA] - v1.4.0: [Razón]` en cada cambio de ecuación
  - Before/After comments explicando cambio matemático

- [ ] **🎯 Versionado consistente:**
  - Header comment actualizado en `CashCalculation.tsx`
  - CLAUDE.md actualizado con entrada de esta fase

**Referencia:** `/Users/samuelers/Paradise System Labs/cashguard-paradise/REGLAS_DE_LA_CASA.md` (líneas 60-76, **85-90** CRÍTICA)

**⚠️ CRÍTICO:** Esta fase modifica lógica financiera - TIER 0 Cross-Validation NO es opcional, es OBLIGATORIO constitucional.

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
