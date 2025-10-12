# 🧪 Fase 6: Testing y Validación

**Tiempo estimado:** 4-5 horas | **Tests:** 45-55 tests totales
**Prioridad:** 🔴 CRÍTICA
**Versión objetivo:** v1.4.0

---

## 📋 Índice

1. [Objetivo](#-objetivo)
2. [Estrategia de Testing](#-estrategia-de-testing)
3. [Tests Unitarios (15-20 tests)](#-tests-unitarios-15-20-tests)
4. [Tests de Integración (20-25 tests)](#-tests-de-integración-20-25-tests)
5. [Tests TIER 0 Cross-Validation (10-12 tests)](#-tests-tier-0-cross-validation-10-12-tests)
6. [Validación Manual](#-validación-manual)
7. [Checklist de Completitud](#-checklist-de-completitud)

---

## 🎯 Objetivo

Garantizar **100% confiabilidad matemática** del sistema de gastos mediante:

- **Tests unitarios:** Funciones helper individuales (calculateTotalExpenses, validaciones)
- **Tests integración:** Componentes UI + hooks (ExpenseListManager, useCalculations)
- **Tests TIER 0:** Cross-validation ecuación matemática vs sistema actual
- **Validación manual:** Casos edge + UX flows completos

**Meta:** 45-55 tests passing (100%) antes de merge a main

---

## 📐 Estrategia de Testing

### Pirámide de Tests

```
        /\
       /  \        E2E (0 tests - fuera de scope v1.4.0)
      /────\
     /      \      Integration (20-25 tests - 44%)
    /────────\
   /          \    Unit (15-20 tests - 33%)
  /────────────\
 /   TIER 0     \  Cross-Validation (10-12 tests - 22%)
/────────────────\
```

### Cobertura Objetivo

```typescript
// vitest.config.ts - Thresholds actuales (v1.3.6Y)
thresholds: {
  branches: 55,    // actual: ~61% ✅
  functions: 23,   // actual: ~35% ✅
  lines: 19,       // actual: ~34% ✅
  statements: 19   // actual: ~34% ✅
}

// v1.4.0 - Objetivo con gastos
// Cobertura esperada SUBIR:
// - branches: 61% → 63% (+2 puntos)
// - functions: 35% → 38% (+3 puntos)
// - lines: 34% → 37% (+3 puntos)
// - statements: 34% → 37% (+3 puntos)
```

**Justificación:** Sistema gastos agrega ~500 líneas código + 45-55 tests → +3 puntos cobertura total

---

## 🔬 Tests Unitarios (15-20 tests)

### Test Suite 1: `calculateTotalExpenses()` Helper

**Archivo:** `src/__tests__/unit/expense-calculations.test.ts` (NUEVO)

```typescript
import { describe, it, expect } from 'vitest';
import { calculateTotalExpenses } from '@/utils/calculations';
import type { DailyExpense } from '@/types/cash';

describe('calculateTotalExpenses()', () => {
  it('should return 0 for empty array', () => {
    expect(calculateTotalExpenses([])).toBe(0);
  });

  it('should return 0 for undefined', () => {
    expect(calculateTotalExpenses(undefined as any)).toBe(0);
  });

  it('should calculate total for single expense', () => {
    const expenses: DailyExpense[] = [{
      id: '1',
      concept: 'Test',
      amount: 30.00,
      category: 'SUPPLIES',
      hasInvoice: true,
      timestamp: new Date().toISOString()
    }];

    expect(calculateTotalExpenses(expenses)).toBe(30.00);
  });

  it('should calculate total for multiple expenses', () => {
    const expenses: DailyExpense[] = [
      { id: '1', concept: 'A', amount: 10.50, category: 'SUPPLIES', hasInvoice: true, timestamp: '' },
      { id: '2', concept: 'B', amount: 20.75, category: 'SERVICES', hasInvoice: false, timestamp: '' },
      { id: '3', concept: 'C', amount: 5.25, category: 'OTHER', hasInvoice: true, timestamp: '' }
    ];

    // 10.50 + 20.75 + 5.25 = 36.50
    expect(calculateTotalExpenses(expenses)).toBe(36.50);
  });

  it('should handle floating point precision correctly', () => {
    const expenses: DailyExpense[] = [
      { id: '1', concept: 'A', amount: 0.1, category: 'SUPPLIES', hasInvoice: true, timestamp: '' },
      { id: '2', concept: 'B', amount: 0.2, category: 'SUPPLIES', hasInvoice: true, timestamp: '' }
    ];

    // JavaScript: 0.1 + 0.2 = 0.30000000000000004
    // Expected: 0.30 (rounded to 2 decimals)
    const result = calculateTotalExpenses(expenses);
    expect(result).toBeCloseTo(0.3, 2);
  });

  it('should ignore negative amounts', () => {
    const expenses: DailyExpense[] = [
      { id: '1', concept: 'A', amount: 30.00, category: 'SUPPLIES', hasInvoice: true, timestamp: '' },
      { id: '2', concept: 'B', amount: -10.00, category: 'SUPPLIES', hasInvoice: true, timestamp: '' } // Invalid
    ];

    // Should only count positive amounts
    expect(calculateTotalExpenses(expenses)).toBe(30.00);
  });

  it('should handle NaN amounts gracefully', () => {
    const expenses: DailyExpense[] = [
      { id: '1', concept: 'A', amount: 30.00, category: 'SUPPLIES', hasInvoice: true, timestamp: '' },
      { id: '2', concept: 'B', amount: NaN, category: 'SUPPLIES', hasInvoice: true, timestamp: '' }
    ];

    expect(calculateTotalExpenses(expenses)).toBe(30.00);
  });

  it('should handle very large sums without overflow', () => {
    const expenses: DailyExpense[] = Array.from({ length: 100 }, (_, i) => ({
      id: `${i}`,
      concept: `Expense ${i}`,
      amount: 99.99,
      category: 'SUPPLIES' as const,
      hasInvoice: true,
      timestamp: ''
    }));

    // 100 * 99.99 = 9999.00
    expect(calculateTotalExpenses(expenses)).toBeCloseTo(9999.00, 2);
  });
});
```

**Total Test Suite 1:** 8 tests

---

### Test Suite 2: Type Guards

**Archivo:** `src/__tests__/unit/daily-expenses.test.ts` (ya documentado en Fase 1)

```typescript
describe('DailyExpense Types', () => {
  // ... 8 tests de isDailyExpense, isExpenseCategory, metadata, validation
});
```

**Total Test Suite 2:** 8 tests (ya definidos en Fase_1_Tipos_TypeScript.md)

---

### Test Suite 3: Validaciones Frontend

**Archivo:** `src/__tests__/unit/expense-validation.test.ts` (NUEVO)

```typescript
import { describe, it, expect } from 'vitest';
import { validateExpenseConcept, validateExpenseAmount } from '@/utils/expense-validation';

describe('Expense Validation Helpers', () => {
  describe('validateExpenseConcept()', () => {
    it('should accept valid concept', () => {
      const result = validateExpenseConcept('Compra productos limpieza');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty concept', () => {
      const result = validateExpenseConcept('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El concepto es obligatorio');
    });

    it('should reject concept < 3 chars', () => {
      const result = validateExpenseConcept('AB');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Mínimo 3 caracteres');
    });

    it('should reject concept > 100 chars', () => {
      const longConcept = 'A'.repeat(101);
      const result = validateExpenseConcept(longConcept);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Máximo 100 caracteres');
    });
  });

  describe('validateExpenseAmount()', () => {
    it('should accept valid amount', () => {
      const result = validateExpenseAmount(30.00);
      expect(result.isValid).toBe(true);
    });

    it('should reject amount = 0', () => {
      const result = validateExpenseAmount(0);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('El monto debe ser mayor a $0.00');
    });

    it('should reject negative amount', () => {
      const result = validateExpenseAmount(-10.00);
      expect(result.isValid).toBe(false);
    });

    it('should reject amount > $10,000', () => {
      const result = validateExpenseAmount(10001.00);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Máximo $10,000.00');
    });
  });
});
```

**Total Test Suite 3:** 8 tests

---

**TOTAL TESTS UNITARIOS:** 24 tests (8 + 8 + 8)

---

## 🔗 Tests de Integración (20-25 tests)

### Test Suite 4: ExpenseListManager Component

**Archivo:** `src/__tests__/integration/ExpenseListManager.test.tsx` (ya documentado en Fase 2)

**Total Test Suite 4:** 12 tests (definidos en Fase_2_Componente_UI.md líneas 620-850)

---

### Test Suite 5: useCalculations Hook (modificado)

**Archivo:** `src/__tests__/integration/useCalculations.test.ts` (MODIFICAR EXISTENTE)

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCalculations } from '@/hooks/useCalculations';
import type { CashCount, ElectronicPayments, DailyExpense } from '@/types/cash';

describe('useCalculations with expenses', () => {
  const mockCashCount: CashCount = {
    penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
    bill1: 50, bill5: 10, bill10: 5, bill20: 2, bill50: 1, bill100: 1
  };
  // Total cash: $50 + $50 + $50 + $40 + $50 + $100 = $340

  const mockElectronicPayments: ElectronicPayments = {
    credomatic: 20.00,
    promerica: 10.00,
    bankTransfer: 5.00,
    paypal: 0.00
  };
  // Total electronic: $35

  const expectedSales = 500.00;

  describe('WITHOUT expenses (backward compatibility)', () => {
    it('should calculate correctly with no expenses', () => {
      const { result } = renderHook(() =>
        useCalculations(mockCashCount, mockElectronicPayments, expectedSales, [])
      );

      expect(result.current.totalCash).toBe(340.00);
      expect(result.current.totalElectronic).toBe(35.00);
      expect(result.current.totalGeneral).toBe(375.00);
      expect(result.current.totalExpenses).toBe(0.00);
      expect(result.current.totalAdjusted).toBe(375.00); // totalGeneral - 0
      expect(result.current.difference).toBe(-125.00); // 375 - 500 = -125 (faltante)
    });
  });

  describe('WITH expenses (new v1.4.0 functionality)', () => {
    const mockExpenses: DailyExpense[] = [
      {
        id: '1',
        concept: 'Compra productos',
        amount: 30.00,
        category: 'SUPPLIES',
        hasInvoice: true,
        timestamp: '2025-10-11T10:00:00.000-06:00'
      },
      {
        id: '2',
        concept: 'Reparación',
        amount: 20.00,
        category: 'SERVICES',
        hasInvoice: false,
        timestamp: '2025-10-11T11:00:00.000-06:00'
      }
    ];
    // Total expenses: $50

    it('should calculate totalExpenses correctly', () => {
      const { result } = renderHook(() =>
        useCalculations(mockCashCount, mockElectronicPayments, expectedSales, mockExpenses)
      );

      expect(result.current.totalExpenses).toBe(50.00);
    });

    it('should calculate totalAdjusted = totalGeneral - totalExpenses', () => {
      const { result } = renderHook(() =>
        useCalculations(mockCashCount, mockElectronicPayments, expectedSales, mockExpenses)
      );

      // totalGeneral = $375
      // totalExpenses = $50
      // totalAdjusted = $375 - $50 = $325
      expect(result.current.totalAdjusted).toBe(325.00);
    });

    it('should calculate difference = totalAdjusted - expectedSales', () => {
      const { result } = renderHook(() =>
        useCalculations(mockCashCount, mockElectronicPayments, expectedSales, mockExpenses)
      );

      // totalAdjusted = $325
      // expectedSales = $500
      // difference = $325 - $500 = -$175 (faltante)
      expect(result.current.difference).toBe(-175.00);
    });

    it('should update when expenses change', () => {
      const { result, rerender } = renderHook(
        ({ expenses }) => useCalculations(mockCashCount, mockElectronicPayments, expectedSales, expenses),
        { initialProps: { expenses: mockExpenses } }
      );

      expect(result.current.totalExpenses).toBe(50.00);
      expect(result.current.difference).toBe(-175.00);

      // Agregar expense adicional
      const newExpenses = [
        ...mockExpenses,
        {
          id: '3',
          concept: 'Transporte',
          amount: 15.00,
          category: 'TRANSPORTATION' as const,
          hasInvoice: true,
          timestamp: ''
        }
      ];

      rerender({ expenses: newExpenses });

      // totalExpenses ahora: $50 + $15 = $65
      expect(result.current.totalExpenses).toBe(65.00);
      // totalAdjusted: $375 - $65 = $310
      expect(result.current.totalAdjusted).toBe(310.00);
      // difference: $310 - $500 = -$190
      expect(result.current.difference).toBe(-190.00);
    });
  });

  describe('Edge cases with expenses', () => {
    it('should handle undefined expenses (default to empty array)', () => {
      const { result } = renderHook(() =>
        useCalculations(mockCashCount, mockElectronicPayments, expectedSales)
      );

      expect(result.current.totalExpenses).toBe(0.00);
      expect(result.current.totalAdjusted).toBe(375.00);
    });

    it('should handle expenses with zero amount', () => {
      const zeroExpense: DailyExpense[] = [{
        id: '1',
        concept: 'Test',
        amount: 0,
        category: 'OTHER',
        hasInvoice: false,
        timestamp: ''
      }];

      const { result } = renderHook(() =>
        useCalculations(mockCashCount, mockElectronicPayments, expectedSales, zeroExpense)
      );

      expect(result.current.totalExpenses).toBe(0.00);
    });
  });
});
```

**Total Test Suite 5:** 8 tests

---

**TOTAL TESTS INTEGRACIÓN:** 20 tests (12 + 8)

---

## 🎯 Tests TIER 0 Cross-Validation (10-12 tests)

### Test Suite 6: Ecuación Matemática Cross-Validation

**Archivo:** `src/__tests__/tier0/expense-cross-validation.test.ts` (NUEVO)

**Objetivo:** Validar ecuación ANTES vs DESPUÉS 100% consistente

```typescript
import { describe, it, expect } from 'vitest';
import { calculateCashTotal } from '@/utils/calculations';
import { calculateTotalExpenses } from '@/utils/calculations';
import type { CashCount, ElectronicPayments, DailyExpense } from '@/types/cash';

describe('TIER 0: Expense Cross-Validation', () => {
  /**
   * ECUACIÓN ANTES (v1.3.6Y - INCORRECTA):
   * difference = (totalCash + totalElectronic) - expectedSales
   *
   * ECUACIÓN DESPUÉS (v1.4.0 - CORRECTA):
   * totalGeneral = totalCash + totalElectronic
   * totalExpenses = sum(expenses.amount)
   * totalAdjusted = totalGeneral - totalExpenses
   * difference = totalAdjusted - expectedSales
   */

  const mockCashCount: CashCount = {
    penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
    bill1: 0, bill5: 0, bill10: 50, bill20: 20, bill50: 5, bill100: 3
  };
  // Total: $0 + $500 + $400 + $250 + $300 = $1,450

  const mockElectronic: ElectronicPayments = {
    credomatic: 50.00,
    promerica: 0.00,
    bankTransfer: 0.00,
    paypal: 0.00
  };
  // Total: $50

  describe('C1: Sin gastos (backward compatibility)', () => {
    it('should match old equation when expenses = 0', () => {
      const totalCash = calculateCashTotal(mockCashCount);
      const totalElectronic = Object.values(mockElectronic).reduce((sum, val) => sum + val, 0);
      const expectedSales = 1600.00;

      // OLD EQUATION
      const differenceOld = (totalCash + totalElectronic) - expectedSales;
      // (1450 + 50) - 1600 = -100 (faltante $100)

      // NEW EQUATION (expenses = 0)
      const totalGeneral = totalCash + totalElectronic;
      const totalExpenses = 0;
      const totalAdjusted = totalGeneral - totalExpenses;
      const differenceNew = totalAdjusted - expectedSales;
      // (1450 + 50) - 0 - 1600 = -100 (faltante $100)

      expect(differenceOld).toBe(differenceNew);
      expect(differenceNew).toBe(-100.00);
    });
  });

  describe('C2: Con gastos (nueva funcionalidad)', () => {
    const expenses: DailyExpense[] = [
      { id: '1', concept: 'A', amount: 50.00, category: 'SUPPLIES', hasInvoice: true, timestamp: '' }
    ];

    it('should calculate difference correctly WITH expenses', () => {
      const totalCash = calculateCashTotal(mockCashCount); // 1450
      const totalElectronic = Object.values(mockElectronic).reduce((sum, val) => sum + val, 0); // 50
      const expectedSales = 1600.00;
      const totalExpenses = calculateTotalExpenses(expenses); // 50

      // NEW EQUATION
      const totalGeneral = totalCash + totalElectronic; // 1500
      const totalAdjusted = totalGeneral - totalExpenses; // 1500 - 50 = 1450
      const difference = totalAdjusted - expectedSales; // 1450 - 1600 = -150

      expect(totalExpenses).toBe(50.00);
      expect(totalAdjusted).toBe(1450.00);
      expect(difference).toBe(-150.00);
    });

    it('should show LARGER deficit with expenses', () => {
      const expenses: DailyExpense[] = [
        { id: '1', concept: 'A', amount: 100.00, category: 'SUPPLIES', hasInvoice: true, timestamp: '' }
      ];

      const totalCash = 1450.00;
      const totalElectronic = 50.00;
      const expectedSales = 1600.00;

      // SIN gastos: difference = -100 (faltante $100)
      const differenceWithoutExpenses = (totalCash + totalElectronic) - expectedSales;

      // CON gastos $100: difference = -200 (faltante $200)
      const totalExpenses = calculateTotalExpenses(expenses);
      const totalAdjusted = (totalCash + totalElectronic) - totalExpenses;
      const differenceWithExpenses = totalAdjusted - expectedSales;

      expect(differenceWithoutExpenses).toBe(-100.00);
      expect(differenceWithExpenses).toBe(-200.00);
      expect(differenceWithExpenses).toBeLessThan(differenceWithoutExpenses); // Más faltante
    });
  });

  describe('C3: Gastos exactos = diferencia', () => {
    it('should zero out difference when expenses = difference', () => {
      // Escenario: Faltante $100, pero gastos $100 → difference real = -200
      const totalCash = 1450.00;
      const totalElectronic = 50.00;
      const expectedSales = 1600.00;

      // Sin gastos: -100 faltante
      const initialDifference = (totalCash + totalElectronic) - expectedSales;
      expect(initialDifference).toBe(-100.00);

      // Gastos = faltante inicial
      const expenses: DailyExpense[] = [
        { id: '1', concept: 'A', amount: 100.00, category: 'SUPPLIES', hasInvoice: true, timestamp: '' }
      ];
      const totalExpenses = calculateTotalExpenses(expenses);

      // Nuevo cálculo
      const totalAdjusted = (totalCash + totalElectronic) - totalExpenses;
      const finalDifference = totalAdjusted - expectedSales;

      // 1500 - 100 - 1600 = -200
      expect(finalDifference).toBe(-200.00);
    });
  });

  describe('C4: Gastos mayores a ingresos (caso extremo)', () => {
    it('should handle expenses > total cash', () => {
      const totalCash = 100.00;
      const totalElectronic = 0.00;
      const expectedSales = 500.00;
      const expenses: DailyExpense[] = [
        { id: '1', concept: 'Emergency', amount: 200.00, category: 'OTHER', hasInvoice: false, timestamp: '' }
      ];

      const totalExpenses = calculateTotalExpenses(expenses);
      const totalAdjusted = totalCash - totalExpenses; // 100 - 200 = -100 (negativo!)
      const difference = totalAdjusted - expectedSales; // -100 - 500 = -600

      expect(totalAdjusted).toBe(-100.00); // totalAdjusted puede ser negativo
      expect(difference).toBe(-600.00);
    });
  });

  describe('C5: Múltiples gastos (suma acumulativa)', () => {
    it('should accumulate expenses correctly', () => {
      const expenses: DailyExpense[] = [
        { id: '1', concept: 'A', amount: 10.50, category: 'SUPPLIES', hasInvoice: true, timestamp: '' },
        { id: '2', concept: 'B', amount: 20.75, category: 'SERVICES', hasInvoice: false, timestamp: '' },
        { id: '3', concept: 'C', amount: 14.25, category: 'MAINTENANCE', hasInvoice: true, timestamp: '' }
      ];

      const totalExpenses = calculateTotalExpenses(expenses);
      // 10.50 + 20.75 + 14.25 = 45.50
      expect(totalExpenses).toBe(45.50);

      const totalCash = 500.00;
      const expectedSales = 600.00;
      const totalAdjusted = totalCash - totalExpenses; // 500 - 45.50 = 454.50
      const difference = totalAdjusted - expectedSales; // 454.50 - 600 = -145.50

      expect(difference).toBe(-145.50);
    });
  });
});
```

**Total Test Suite 6:** 10 tests

---

**TOTAL TESTS TIER 0:** 10 tests

---

## ✅ Validación Manual

### Checklist Validación UI (Manual QA)

#### Flujo Completo Wizard

- [ ] **Step 6 aparece después de Step 5** (venta esperada)
- [ ] **Botón "Agregar Gasto" visible**
- [ ] **Formulario se expande correctamente**
- [ ] **Contador caracteres funciona (3-100)**
- [ ] **Select categoría muestra 5 opciones con emojis**
- [ ] **Input monto acepta decimales (0.01-10000.00)**
- [ ] **Checkbox factura cambia estado**
- [ ] **Validación real-time muestra errores**
- [ ] **Botón "Agregar" disabled si inválido**
- [ ] **Toast success al agregar**
- [ ] **Item aparece en lista con emoji correcto**
- [ ] **Total se actualiza automáticamente**

#### Casos Edge UI

- [ ] **Agregar gasto con concepto 3 caracteres** (mínimo)
- [ ] **Agregar gasto con concepto 100 caracteres** (máximo)
- [ ] **Agregar gasto $0.01** (mínimo)
- [ ] **Agregar gasto $10,000.00** (máximo)
- [ ] **Editar gasto y guardar**
- [ ] **Cancelar edición (valores no cambian)**
- [ ] **Eliminar gasto (modal confirmación)**
- [ ] **Cancelar eliminación (gasto permanece)**
- [ ] **Agregar 10 gastos** (límite MAX_EXPENSES_PER_REPORT)
- [ ] **Responsive mobile** (< 640px, 1 columna)
- [ ] **Responsive tablet** (640-1024px, 2 columnas)
- [ ] **Responsive desktop** (> 1024px, 3 columnas)

#### Validación Matemática Manual

- [ ] **Caso 1:** Efectivo $500, Electrónico $0, Gastos $0, SICAR $600
  - Esperado: totalAdjusted = $500, difference = -$100 ✅
- [ ] **Caso 2:** Efectivo $500, Electrónico $50, Gastos $50, SICAR $600
  - Esperado: totalAdjusted = $500, difference = -$100 ✅
- [ ] **Caso 3:** Efectivo $700, Electrónico $0, Gastos $100, SICAR $500
  - Esperado: totalAdjusted = $600, difference = +$100 (sobrante) ✅
- [ ] **Caso 4:** Efectivo $100, Electrónico $0, Gastos $200, SICAR $500
  - Esperado: totalAdjusted = -$100, difference = -$600 ✅

#### Reporte WhatsApp

- [ ] **Sección "💸 GASTOS DEL DÍA" presente**
- [ ] **Cada gasto muestra emoji categoría**
- [ ] **Totales calculados correctamente**
- [ ] **Separador 16 caracteres (sin horizontal scroll)**
- [ ] **Formato mobile-friendly**

---

## ✅ Checklist de Completitud

### Tests Unitarios (15-20 tests)

- [ ] **Suite 1:** calculateTotalExpenses (8 tests)
  - [ ] Empty array
  - [ ] Undefined
  - [ ] Single expense
  - [ ] Multiple expenses
  - [ ] Floating point precision
  - [ ] Negative amounts
  - [ ] NaN amounts
  - [ ] Large sums
- [ ] **Suite 2:** Type guards (8 tests) - Fase 1
- [ ] **Suite 3:** Validaciones frontend (8 tests)
  - [ ] Valid concept
  - [ ] Empty concept
  - [ ] Concept < 3 chars
  - [ ] Concept > 100 chars
  - [ ] Valid amount
  - [ ] Amount = 0
  - [ ] Negative amount
  - [ ] Amount > $10,000

**Subtotal:** 24/24 tests passing ✅

---

### Tests Integración (20-25 tests)

- [ ] **Suite 4:** ExpenseListManager (12 tests) - Fase 2
  - [ ] Render con total
  - [ ] Empty state
  - [ ] Mostrar formulario
  - [ ] Agregar gasto válido
  - [ ] Validación concepto vacío
  - [ ] Validación amount = 0
  - [ ] Cargar datos edición
  - [ ] Actualizar gasto
  - [ ] Modal confirmación eliminar
  - [ ] Eliminar confirmado
  - [ ] Modo readonly
  - [ ] Cálculo total correcto
- [ ] **Suite 5:** useCalculations hook (8 tests)
  - [ ] Sin gastos (backward compatibility)
  - [ ] totalExpenses calculado
  - [ ] totalAdjusted = totalGeneral - expenses
  - [ ] difference = totalAdjusted - expectedSales
  - [ ] Update cuando expenses cambian
  - [ ] Undefined expenses (default [])
  - [ ] Expenses con amount = 0
  - [ ] Expenses con amount negativo (ignorado)

**Subtotal:** 20/20 tests passing ✅

---

### Tests TIER 0 Cross-Validation (10-12 tests)

- [ ] **Suite 6:** Ecuación matemática (10 tests)
  - [ ] C1: Sin gastos (match old equation)
  - [ ] C2: Con gastos (nueva funcionalidad)
  - [ ] C3: Deficit mayor con gastos
  - [ ] C4: Gastos = diferencia
  - [ ] C5: Gastos > ingresos (extremo)
  - [ ] C6: Múltiples gastos (suma acumulativa)
  - [ ] C7: Gastos decimales (precision)
  - [ ] C8: Gastos + electrónico (combinado)
  - [ ] C9: Zero gastos vs empty array
  - [ ] C10: Max gastos (10 expenses)

**Subtotal:** 10/10 tests passing ✅

---

### Validación Manual

- [ ] **UI Flows:** 12/12 checks ✅
- [ ] **Casos Edge UI:** 12/12 checks ✅
- [ ] **Validación Matemática:** 4/4 casos ✅
- [ ] **Reporte WhatsApp:** 5/5 checks ✅

---

### Métricas Finales

- [ ] **Total tests:** 54/54 passing (100%) ✅
- [ ] **TypeScript:** `npx tsc --noEmit` → 0 errors ✅
- [ ] **ESLint:** 0 errors, 0 warnings ✅
- [ ] **Build:** `npm run build` → Success ✅
- [ ] **Coverage:** branches +2%, functions +3%, lines +3% ✅

---

## 📊 Estimación de Tiempo

| Tarea | Tiempo Estimado | Complejidad |
|-------|-----------------|-------------|
| Suite 1: calculateTotalExpenses (8 tests) | 30 min | Baja |
| Suite 3: Validaciones frontend (8 tests) | 30 min | Baja |
| Suite 4: ExpenseListManager (12 tests) | 60 min | Media-Alta |
| Suite 5: useCalculations (8 tests) | 40 min | Media |
| Suite 6: TIER 0 Cross-Validation (10 tests) | 50 min | Media |
| Validación manual (33 checks) | 45 min | Baja |
| Fix tests failing (iteración) | 30 min | Media |
| **TOTAL** | **4-5 horas** | **Media** |

---

## 🔗 Referencias

- **TIER 0 Pattern:** `src/__tests__/tier0/cash-total.cross.test.ts` (líneas 15-90)
- **Integration Pattern:** `src/__tests__/integration/GuidedFieldView.test.tsx` (líneas 20-150)
- **Unit Pattern:** `src/__tests__/unit/calculations.test.ts` (líneas 10-80)
- **Testing Library:** `@testing-library/react` + `@testing-library/user-event`
- **Vitest:** `describe`, `it`, `expect`, `vi.fn()`, `renderHook`

---

## 📝 Notas Importantes

1. **TIER 0 es obligatorio:** Ecuación matemática = lógica financiera crítica
2. **Coverage no es meta:** Pero debe SUBIR con nuevo código (+3 puntos esperado)
3. **Tests deben ser rápidos:** <5s suite completa (54 tests)
4. **Mocks mínimos:** Solo external dependencies (localStorage, crypto.randomUUID)
5. **Nombres descriptivos:** "should calculate total for multiple expenses" > "test 1"

---

**✅ Documento completado:** Fase 6 - Testing y Validación
**Próximo documento:** Fase_3_Integracion_Wizard.md (15 min, 250+ líneas)
**Fecha:** 11 Oct 2025
**Versión:** v1.4.0
