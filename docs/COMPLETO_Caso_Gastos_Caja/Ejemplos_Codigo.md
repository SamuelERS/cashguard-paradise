# 💻 Ejemplos de Código Ejecutables

**Tiempo estimado:** 10-15 min lectura | **Archivos:** Snippets completos
**Prioridad:** 🟢 OPCIONAL (Referencia rápida)
**Versión objetivo:** v1.4.0

---

## 📋 Índice

1. [Tipos TypeScript](#-tipos-typescript)
2. [Componente ExpenseListManager](#-componente-expenselistmanager)
3. [Hook useCalculations Modificado](#-hook-usecalculations-modificado)
4. [Helper calculateTotalExpenses](#-helper-calculatetotalexpenses)
5. [Wizard Integration](#-wizard-integration)
6. [Reporte WhatsApp](#-reporte-whatsapp)
7. [Tests Ejemplos](#-tests-ejemplos)

---

## 📐 Tipos TypeScript

### Interface DailyExpense Completa

```typescript
// src/types/cash.ts

/**
 * Representa un gasto diario registrado durante el corte de caja
 * @since v1.4.0
 */
export interface DailyExpense {
  /** UUID v4 */
  id: string;

  /** Descripción del gasto (3-100 caracteres) */
  concept: string;

  /** Monto en USD (0.01-10000.00) */
  amount: number;

  /** Categoría del gasto */
  category: ExpenseCategory;

  /** ¿Tiene factura física o electrónica? */
  hasInvoice: boolean;

  /** Timestamp ISO 8601 */
  timestamp: string;
}

export type ExpenseCategory =
  | "SUPPLIES"
  | "SERVICES"
  | "MAINTENANCE"
  | "TRANSPORTATION"
  | "OTHER";

export const EXPENSE_CATEGORY_METADATA = {
  SUPPLIES: { emoji: "📦", label: "Insumos" },
  SERVICES: { emoji: "🔧", label: "Servicios" },
  MAINTENANCE: { emoji: "🛠️", label: "Mantenimiento" },
  TRANSPORTATION: { emoji: "🚗", label: "Transporte" },
  OTHER: { emoji: "📋", label: "Otros" }
} as const;

export const EXPENSE_VALIDATION = {
  MIN_CONCEPT_LENGTH: 3,
  MAX_CONCEPT_LENGTH: 100,
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 10000.00,
  MAX_EXPENSES_PER_REPORT: 10
} as const;
```

### Type Guards

```typescript
// src/types/cash.ts

export function isDailyExpense(obj: unknown): obj is DailyExpense {
  if (!obj || typeof obj !== 'object') return false;

  const expense = obj as Partial<DailyExpense>;

  return (
    typeof expense.id === 'string' &&
    typeof expense.concept === 'string' &&
    typeof expense.amount === 'number' &&
    expense.amount > 0 &&
    typeof expense.category === 'string' &&
    ['SUPPLIES', 'SERVICES', 'MAINTENANCE', 'TRANSPORTATION', 'OTHER'].includes(expense.category) &&
    typeof expense.hasInvoice === 'boolean' &&
    typeof expense.timestamp === 'string'
  );
}

export function isExpenseCategory(value: string): value is ExpenseCategory {
  return ['SUPPLIES', 'SERVICES', 'MAINTENANCE', 'TRANSPORTATION', 'OTHER'].includes(value);
}
```

### Interface CashReport Modificada

```typescript
// src/types/cash.ts

export interface CashReport {
  // ... campos existentes ...

  // 🆕 v1.4.0: Sistema de gastos
  dailyExpenses: DailyExpense[];
  totalExpenses: number;
  totalAdjusted: number;

  // difference ahora calculado como: totalAdjusted - expectedSales
  difference: number;
}
```

---

## 🎨 Componente ExpenseListManager

### Componente Principal

```typescript
// src/components/cash-counting/expenses/ExpenseListManager.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import type { DailyExpense } from '@/types/cash';
import { ExpenseForm } from './ExpenseForm';
import { ExpenseItem } from './ExpenseItem';
import { ExpenseDeleteModal } from './ExpenseDeleteModal';

export interface ExpenseListManagerProps {
  expenses: DailyExpense[];
  onExpensesChange: (expenses: DailyExpense[]) => void;
  readonly?: boolean;
  className?: string;
}

export const ExpenseListManager: React.FC<ExpenseListManagerProps> = ({
  expenses,
  onExpensesChange,
  readonly = false,
  className
}) => {
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>('view');
  const [editingExpense, setEditingExpense] = useState<DailyExpense | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<DailyExpense | null>(null);

  // Calcular total con useMemo para performance
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // Handler agregar gasto
  const handleAddExpense = useCallback((newExpense: DailyExpense) => {
    const updatedExpenses = [...expenses, newExpense];
    onExpensesChange(updatedExpenses);
    setMode('view');
    toast.success(`✅ Gasto "${newExpense.concept}" agregado`);
  }, [expenses, onExpensesChange]);

  // Handler editar gasto
  const handleUpdateExpense = useCallback((updatedExpense: DailyExpense) => {
    const updatedExpenses = expenses.map(exp =>
      exp.id === updatedExpense.id ? updatedExpense : exp
    );
    onExpensesChange(updatedExpenses);
    setMode('view');
    setEditingExpense(null);
    toast.success(`✅ Gasto actualizado`);
  }, [expenses, onExpensesChange]);

  // Handler eliminar gasto
  const handleDeleteExpense = useCallback((id: string) => {
    const expense = expenses.find(exp => exp.id === id);
    if (expense) {
      setExpenseToDelete(expense);
      setDeleteModalOpen(true);
    }
  }, [expenses]);

  // Confirmar eliminación
  const handleConfirmDelete = useCallback(() => {
    if (expenseToDelete) {
      const updatedExpenses = expenses.filter(exp => exp.id !== expenseToDelete.id);
      onExpensesChange(updatedExpenses);
      toast.success(`🗑️ Gasto eliminado`);
    }
    setDeleteModalOpen(false);
    setExpenseToDelete(null);
  }, [expenses, expenseToDelete, onExpensesChange]);

  return (
    <div className={className}>
      {/* Header con total */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold">💰 Gastos del Día</h3>
        <span className="text-lg font-bold text-green-400">
          Total: ${totalExpenses.toFixed(2)}
        </span>
      </div>

      {/* Formulario agregar/editar */}
      {(mode === 'add' || mode === 'edit') && !readonly && (
        <ExpenseForm
          onSubmit={mode === 'add' ? handleAddExpense : handleUpdateExpense}
          initialValues={editingExpense || undefined}
          onCancel={() => {
            setMode('view');
            setEditingExpense(null);
          }}
        />
      )}

      {/* Lista de gastos */}
      <div className="space-y-2 mt-4">
        {expenses.length === 0 ? (
          <p className="text-center text-gray-400 py-8">
            No hay gastos registrados
          </p>
        ) : (
          expenses.map(expense => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onEdit={(exp) => {
                setEditingExpense(exp);
                setMode('edit');
              }}
              onDelete={handleDeleteExpense}
              readonly={readonly}
            />
          ))
        )}
      </div>

      {/* Botón agregar */}
      {mode === 'view' && !readonly && (
        <button
          onClick={() => setMode('add')}
          className="mt-4 w-full py-2 bg-blue-500 rounded hover:bg-blue-600"
        >
          ➕ Agregar Otro Gasto
        </button>
      )}

      {/* Modal confirmación eliminar */}
      <ExpenseDeleteModal
        isOpen={deleteModalOpen}
        expense={expenseToDelete}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setExpenseToDelete(null);
        }}
      />
    </div>
  );
};
```

---

## 🔧 Hook useCalculations Modificado

```typescript
// src/hooks/useCalculations.ts

import { useMemo } from 'react';
import { calculateCashTotal, calculateTotalExpenses } from '@/utils/calculations';
import type { CashCount, ElectronicPayments, DailyExpense } from '@/types/cash';

export function useCalculations(
  cashCount: CashCount,
  electronicPayments: ElectronicPayments,
  expectedSales: number,
  dailyExpenses: DailyExpense[] = [] // 🆕 v1.4.0: 4to parámetro opcional
) {
  const calculations = useMemo(() => {
    // Calcular totales
    const totalCash = calculateCashTotal(cashCount);
    const totalElectronic = Object.values(electronicPayments).reduce(
      (sum, val) => sum + val,
      0
    );
    const totalGeneral = totalCash + totalElectronic;

    // 🆕 v1.4.0: Calcular total de gastos
    const totalExpenses = calculateTotalExpenses(dailyExpenses);

    // 🆕 v1.4.0: Calcular total ajustado (después de gastos)
    const totalAdjusted = totalGeneral - totalExpenses;

    // 🔧 v1.4.0: Diferencia ahora usa totalAdjusted
    const difference = totalAdjusted - expectedSales;

    return {
      totalCash,
      totalElectronic,
      totalGeneral,
      totalExpenses,     // 🆕 v1.4.0
      totalAdjusted,     // 🆕 v1.4.0
      difference,
      hasAlert: Math.abs(difference) > 3.00,
      alertType: difference < 0 ? 'shortage' : 'surplus'
    };
  }, [cashCount, electronicPayments, expectedSales, dailyExpenses]); // 🔧 v1.4.0: agregado dailyExpenses a deps

  return calculations;
}
```

---

## 🧮 Helper calculateTotalExpenses

```typescript
// src/utils/calculations.ts

import type { DailyExpense } from '@/types/cash';

/**
 * Calcula el total de gastos diarios
 *
 * @param expenses - Array de gastos del día
 * @returns Total en USD (0.00 si array vacío o undefined)
 *
 * @example
 * ```typescript
 * const expenses = [
 *   { amount: 10.50, ... },
 *   { amount: 20.75, ... }
 * ];
 * calculateTotalExpenses(expenses); // 31.25
 * ```
 *
 * @since v1.4.0
 */
export function calculateTotalExpenses(expenses: DailyExpense[] | undefined): number {
  if (!expenses || expenses.length === 0) {
    return 0;
  }

  return expenses.reduce((sum, expense) => {
    // Validar que amount sea número válido y positivo
    const amount = typeof expense.amount === 'number' && !isNaN(expense.amount)
      ? expense.amount
      : 0;

    // Solo sumar montos positivos (ignorar negativos o cero)
    return sum + (amount > 0 ? amount : 0);
  }, 0);
}
```

---

## 🧙 Wizard Integration

### InitialWizardModal Modificaciones

```typescript
// src/components/InitialWizardModal.tsx

import React, { useState } from 'react';
import type { DailyExpense } from '@/types/cash';
import { ExpenseListManager } from '@/components/cash-counting/expenses/ExpenseListManager';

// 🔧 v1.4.0: Interface actualizada
export interface WizardData {
  store: Store;
  cashier: Employee;
  witness: Employee;
  expectedSales: number;
  dailyExpenses: DailyExpense[]; // 🆕 v1.4.0
}

export const InitialWizardModal: React.FC<Props> = ({ onComplete }) => {
  // 🔧 v1.4.0: Total steps incrementado
  const totalSteps = 6; // ANTES: 5

  // State existente
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [selectedCashier, setSelectedCashier] = useState<Employee | null>(null);
  const [selectedWitness, setSelectedWitness] = useState<Employee | null>(null);
  const [expectedSales, setExpectedSales] = useState<number>(0);

  // 🆕 v1.4.0: Nuevo state para gastos
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>([]);

  const handleContinue = () => {
    // ... validaciones Steps 1-4 ...

    // 🔧 v1.4.0: Step 5 ahora avanza a Step 6
    if (currentStep === 5) {
      if (expectedSales < 0) {
        toast.error("⚠️ Ingrese la venta esperada");
        return;
      }
      setCurrentStep(6); // NO cerrar wizard
      return;
    }

    // 🆕 v1.4.0: Step 6 finaliza wizard
    if (currentStep === 6) {
      // Validación opcional: máximo 10 gastos
      if (dailyExpenses.length > 10) {
        toast.error("⚠️ Máximo 10 gastos por corte");
        return;
      }

      // Guardar en localStorage
      localStorage.setItem('cashier_data', JSON.stringify({
        store: selectedStore,
        cashier: selectedCashier,
        witness: selectedWitness,
        expectedSales: expectedSales,
        dailyExpenses: dailyExpenses // 🆕
      }));

      // Completar wizard
      onComplete({
        store: selectedStore!,
        cashier: selectedCashier!,
        witness: selectedWitness!,
        expectedSales: expectedSales,
        dailyExpenses: dailyExpenses // 🆕
      });
      return;
    }
  };

  return (
    <div>
      {/* Steps 1-5 sin cambios */}

      {/* 🆕 v1.4.0: Step 6 - Gastos */}
      {currentStep === 6 && (
        <div className="space-y-6">
          <h3>💸 Gastos del Día</h3>
          <p className="text-sm text-gray-400">
            Registre los gastos realizados hoy (opcional)
          </p>

          <ExpenseListManager
            expenses={dailyExpenses}
            onExpensesChange={setDailyExpenses}
            className="w-full"
          />

          <p className="text-xs text-gray-500">
            💡 Tip: Si no hubo gastos, puede continuar directamente.
          </p>
        </div>
      )}

      {/* Botones navegación */}
      <button onClick={handleContinue}>
        {currentStep === totalSteps ? "Finalizar" : "Continuar"}
      </button>
    </div>
  );
};
```

---

## 📱 Reporte WhatsApp

### generateExpensesSection Helper

```typescript
// src/components/CashCalculation.tsx

import { EXPENSE_CATEGORY_METADATA } from '@/types/cash';
import type { DailyExpense } from '@/types/cash';

const generateExpensesSection = (
  expenses: DailyExpense[],
  totalExpenses: number
): string => {
  // Si no hay gastos, retornar vacío
  if (!expenses || expenses.length === 0) {
    return '';
  }

  // Generar línea por cada gasto
  const expenseLines = expenses.map(expense => {
    const emoji = EXPENSE_CATEGORY_METADATA[expense.category].emoji;
    const invoiceIcon = expense.hasInvoice ? '✅' : '⚠️';
    const amount = formatCurrency(expense.amount);

    return `${emoji} ${expense.concept} - ${amount} ${invoiceIcon}`;
  }).join('\n');

  // Formatear sección completa
  return `
💸 *GASTOS DEL DÍA*

${expenseLines}

💵 *Total Gastos:* ${formatCurrency(totalExpenses)}
`;
};
```

### Modificación generateCompleteReport

```typescript
// src/components/CashCalculation.tsx

const generateCompleteReport = (): string => {
  // ... código existente ...

  // 🆕 v1.4.0: Generar sección gastos
  const expensesSection = generateExpensesSection(
    calculationData?.dailyExpenses || [],
    calculationData?.totalExpenses || 0
  );

  // 🔧 v1.4.0: executiveSummary con gastos
  const executiveSummary = `
📊 *RESUMEN EJECUTIVO*

💰 Efectivo Contado: *${formatCurrency(totalCash)}*

💳 Pagos Electrónicos: *${formatCurrency(totalElectronic)}*
   ☐ Credomatic: ${formatCurrency(credomatic)}
   ☐ Promerica: ${formatCurrency(promerica)}
   ☐ Transferencia: ${formatCurrency(bankTransfer)}
   ☐ PayPal: ${formatCurrency(paypal)}

${expensesSection !== '' ? expensesSection + '\n' : ''}📦 *Entregado a Gerencia:* ${formatCurrency(amountToDeliver)}
🏢 *Quedó en Caja:* $50.00

💼 *Total Día:* ${formatCurrency(totalGeneral)}
${expensesSection !== '' ? `💵 *Total Ajustado:* ${formatCurrency(totalAdjusted)}\n` : ''}🎯 *SICAR Esperado:* ${formatCurrency(expectedSales)}
📉 *Diferencia:* ${formatCurrency(difference)} (${diffLabel})
`;

  return `${header}\n\n${executiveSummary}\n\n${footer}`;
};
```

---

## 🧪 Tests Ejemplos

### Test Unitario: calculateTotalExpenses

```typescript
// src/__tests__/unit/expense-calculations.test.ts

import { describe, it, expect } from 'vitest';
import { calculateTotalExpenses } from '@/utils/calculations';

describe('calculateTotalExpenses()', () => {
  it('should return 0 for empty array', () => {
    expect(calculateTotalExpenses([])).toBe(0);
  });

  it('should calculate total for multiple expenses', () => {
    const expenses = [
      { id: '1', concept: 'A', amount: 10.50, category: 'SUPPLIES', hasInvoice: true, timestamp: '' },
      { id: '2', concept: 'B', amount: 20.75, category: 'SERVICES', hasInvoice: false, timestamp: '' }
    ];

    expect(calculateTotalExpenses(expenses)).toBe(31.25);
  });

  it('should ignore negative amounts', () => {
    const expenses = [
      { id: '1', concept: 'A', amount: 30.00, category: 'SUPPLIES', hasInvoice: true, timestamp: '' },
      { id: '2', concept: 'B', amount: -10.00, category: 'SUPPLIES', hasInvoice: true, timestamp: '' }
    ];

    expect(calculateTotalExpenses(expenses)).toBe(30.00);
  });
});
```

### Test Integración: useCalculations

```typescript
// src/__tests__/integration/useCalculations.test.ts

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCalculations } from '@/hooks/useCalculations';

describe('useCalculations with expenses', () => {
  it('should calculate difference with expenses correctly', () => {
    const mockCash = { /* ... 1450 total */ };
    const mockElectronic = { credomatic: 50, promerica: 0, bankTransfer: 0, paypal: 0 };
    const expectedSales = 1600.00;
    const expenses = [
      { id: '1', concept: 'Test', amount: 50.00, category: 'SUPPLIES', hasInvoice: true, timestamp: '' }
    ];

    const { result } = renderHook(() =>
      useCalculations(mockCash, mockElectronic, expectedSales, expenses)
    );

    // totalGeneral = 1450 + 50 = 1500
    expect(result.current.totalGeneral).toBe(1500.00);

    // totalExpenses = 50
    expect(result.current.totalExpenses).toBe(50.00);

    // totalAdjusted = 1500 - 50 = 1450
    expect(result.current.totalAdjusted).toBe(1450.00);

    // difference = 1450 - 1600 = -150
    expect(result.current.difference).toBe(-150.00);
  });
});
```

### Test TIER 0: Cross-Validation

```typescript
// src/__tests__/tier0/expense-cross-validation.test.ts

import { describe, it, expect } from 'vitest';
import { calculateCashTotal, calculateTotalExpenses } from '@/utils/calculations';

describe('TIER 0: Expense Cross-Validation', () => {
  it('should match old equation when expenses = 0', () => {
    const totalCash = 1450.00;
    const totalElectronic = 50.00;
    const expectedSales = 1600.00;

    // OLD EQUATION (sin gastos)
    const differenceOld = (totalCash + totalElectronic) - expectedSales;

    // NEW EQUATION (expenses = 0)
    const totalGeneral = totalCash + totalElectronic;
    const totalExpenses = 0;
    const totalAdjusted = totalGeneral - totalExpenses;
    const differenceNew = totalAdjusted - expectedSales;

    // Deben ser idénticos
    expect(differenceOld).toBe(differenceNew);
    expect(differenceNew).toBe(-100.00);
  });

  it('should calculate larger deficit with expenses', () => {
    const totalCash = 1450.00;
    const totalElectronic = 50.00;
    const expectedSales = 1600.00;
    const expenses = [
      { id: '1', concept: 'Test', amount: 100.00, category: 'SUPPLIES', hasInvoice: true, timestamp: '' }
    ];

    // Sin gastos: difference = -100
    const differenceWithout = (totalCash + totalElectronic) - expectedSales;

    // Con gastos: difference = -200
    const totalExpenses = calculateTotalExpenses(expenses);
    const totalAdjusted = (totalCash + totalElectronic) - totalExpenses;
    const differenceWith = totalAdjusted - expectedSales;

    expect(differenceWithout).toBe(-100.00);
    expect(differenceWith).toBe(-200.00);
    expect(differenceWith).toBeLessThan(differenceWithout);
  });
});
```

---

## 🎯 Casos de Uso Completos

### Caso 1: Usuario agrega 3 gastos

```typescript
// Flujo completo desde wizard hasta reporte

// 1. Wizard Step 6
const wizardExpenses: DailyExpense[] = [
  {
    id: crypto.randomUUID(),
    concept: 'Compra productos limpieza',
    amount: 30.00,
    category: 'SUPPLIES',
    hasInvoice: true,
    timestamp: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    concept: 'Reparación bomba',
    amount: 45.00,
    category: 'SERVICES',
    hasInvoice: false,
    timestamp: new Date().toISOString()
  },
  {
    id: crypto.randomUUID(),
    concept: 'Gasolina camioneta',
    amount: 10.50,
    category: 'TRANSPORTATION',
    hasInvoice: true,
    timestamp: new Date().toISOString()
  }
];

// 2. useCalculations procesa
const calculations = useCalculations(
  cashCount,        // $950
  electronicPayments, // $50
  1200,             // SICAR esperado
  wizardExpenses    // $85.50 total gastos
);

// 3. Resultados
console.log(calculations.totalGeneral);    // $1,000.00
console.log(calculations.totalExpenses);   // $85.50
console.log(calculations.totalAdjusted);   // $914.50
console.log(calculations.difference);      // -$285.50 (FALTANTE)

// 4. Reporte WhatsApp incluye sección
/*
💸 *GASTOS DEL DÍA*

📦 Compra productos limpieza - $30.00 ✅
🔧 Reparación bomba - $45.00 ⚠️
🚗 Gasolina camioneta - $10.50 ✅

💵 *Total Gastos:* $85.50
*/
```

### Caso 2: Usuario NO agrega gastos (skip)

```typescript
// Wizard Step 6 - usuario click "Finalizar" sin agregar gastos
const wizardExpenses: DailyExpense[] = []; // Array vacío

// useCalculations
const calculations = useCalculations(
  cashCount,
  electronicPayments,
  1200,
  wizardExpenses // Array vacío
);

// Resultados
console.log(calculations.totalExpenses);  // $0.00
console.log(calculations.totalAdjusted);  // = totalGeneral
console.log(calculations.difference);     // No incluye gastos

// Reporte WhatsApp NO incluye sección (condicional)
```

---

## 📝 Notas de Implementación

### Import Paths Correctos

```typescript
// Types
import type { DailyExpense, ExpenseCategory } from '@/types/cash';
import { EXPENSE_CATEGORY_METADATA, EXPENSE_VALIDATION } from '@/types/cash';

// Components
import { ExpenseListManager } from '@/components/cash-counting/expenses/ExpenseListManager';

// Hooks
import { useCalculations } from '@/hooks/useCalculations';

// Utils
import { calculateTotalExpenses } from '@/utils/calculations';
import { formatCurrency } from '@/utils/formatters';
```

### Constantes Útiles

```typescript
// Generar ID único
const newExpense: DailyExpense = {
  id: crypto.randomUUID(), // Built-in UUID v4
  // ...
};

// Timestamp ISO 8601
timestamp: new Date().toISOString()
// Output: "2025-10-11T17:30:00.000-06:00"

// Formatear currency
formatCurrency(85.50) // "$85.50"
```

---

**✅ Documento completado:** Ejemplos de Código Ejecutables
**Total documentos:** 6/6 (100%) ✅
**Fecha:** 11 Oct 2025
**Versión:** v1.4.0
