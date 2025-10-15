# 🎨 Fase 2: Componente UI de Gastos

**Tiempo estimado:** 3-4 horas | **Tests:** 8-12 tests integración
**Prioridad:** 🔴 CRÍTICA
**Versión objetivo:** v1.4.0

---

## 📋 Índice

1. [Objetivo](#-objetivo)
2. [Diseño del Componente](#-diseño-del-componente)
3. [Especificación de Props](#-especificación-de-props)
4. [State Management](#-state-management)
5. [Mockup Visual](#-mockup-visual)
6. [Interacciones del Usuario](#-interacciones-del-usuario)
7. [Validaciones Frontend](#-validaciones-frontend)
8. [Tests de Integración](#-tests-de-integración)
9. [Checklist de Completitud](#-checklist-de-completitud)

---

## 🎯 Objetivo

Crear componente React `<ExpenseListManager />` que permite:

- **Agregar gastos** con validación en tiempo real
- **Listar gastos** con categorización visual
- **Editar gastos** existentes (solo si reporte NO bloqueado)
- **Eliminar gastos** con confirmación modal
- **Calcular total** automáticamente
- **Persistir en LocalStorage** hasta completar reporte

**Integración:** Se agregará como **Step 6** en `InitialWizardModal.tsx` (después de Step 5: Venta esperada SICAR)

---

## 🏗️ Diseño del Componente

### Ubicación del Archivo

**Ruta:** `src/components/cash-counting/expenses/ExpenseListManager.tsx` (NUEVO)

**Justificación ubicación:**
- Sigue pattern existente `src/components/cash-counting/` (cohesión)
- Subcarpeta `expenses/` separa responsabilidad (modularidad)
- Alternativa descartada: `src/components/expenses/` (menos cohesión con flujo cash-counting)

### Arquitectura del Componente

```
ExpenseListManager/
├── ExpenseListManager.tsx      (Componente principal)
├── ExpenseForm.tsx              (Formulario agregar/editar)
├── ExpenseItem.tsx              (Item individual en lista)
└── ExpenseDeleteModal.tsx       (Modal confirmación eliminar)
```

**Patrón:** Presentational Components (controlados por props, sin lógica compleja)

---

## ✅ REGLAS_DE_LA_CASA.md Compliance

Esta fase cumple las siguientes reglas constitucionales de Paradise System Labs:

### Checklist Pre-Ejecución:

- [ ] **🔒 Preservación del código existente:**
  - No modificar componentes existentes sin justificación explícita
  - Solo crear archivos nuevos en `/src/components/cash-counting/expenses/`

- [ ] **⚡ Principio de no regresión:**
  - Todos los tests existentes (637/641) deben seguir pasando
  - Nuevos componentes NO rompen funcionalidad actual

- [ ] **💻 TypeScript estricto (cero `any`):**
  - Todas las props interfaces completamente tipadas
  - Validar con `npx tsc --noEmit` → 0 errors obligatorio

- [ ] **🧪 Tests exhaustivos:**
  - 8-12 tests para este componente UI (según estimado)
  - Coverage mínimo: Props validation, user interactions, edge cases

- [ ] **🗺️ Task list completada:**
  - Checklist líneas 819-855 verificada antes de ejecutar
  - Cada subtarea marcada con criterio de aceptación claro

- [ ] **📝 Documentación obligatoria:**
  - TSDoc completo en todas las interfaces públicas
  - Comentarios `// 🤖 [IA] - v1.4.0: [Razón]` en código nuevo

- [ ] **🎯 Versionado consistente:**
  - Header comments con v1.4.0 en todos los archivos nuevos
  - Actualizar CLAUDE.md con entrada de esta fase

**Referencia:** `/Users/samuelers/Paradise System Labs/cashguard-paradise/REGLAS_DE_LA_CASA.md` (líneas 60-76, 85-90)

**⚠️ CRÍTICO:** Ejecutar `npm run lint` y `npx tsc --noEmit` ANTES de considerar esta fase completada.

---

## 📐 Especificación de Props

### Interface `ExpenseListManagerProps`

```typescript
/**
 * Props del componente ExpenseListManager
 *
 * @remarks
 * Componente controlado - state manejado externamente por wizard.
 * Sigue pattern existente de Phase1GuidedCounting (dumb component).
 *
 * @see {@link DailyExpense}
 *
 * @since v1.4.0
 */
export interface ExpenseListManagerProps {
  /**
   * Array de gastos actuales
   *
   * @remarks
   * Controlado por wizard via `useState<DailyExpense[]>`
   */
  expenses: DailyExpense[];

  /**
   * Callback cuando cambia el array de gastos
   *
   * @param expenses - Nuevo array de gastos (inmutable)
   *
   * @example
   * ```typescript
   * const handleExpensesChange = (newExpenses: DailyExpense[]) => {
   *   setExpenses(newExpenses);
   *   localStorage.setItem('temp_expenses', JSON.stringify(newExpenses));
   * };
   * ```
   */
  onExpensesChange: (expenses: DailyExpense[]) => void;

  /**
   * Indica si el componente está en modo solo lectura
   *
   * @remarks
   * - true: Reporte bloqueado (Phase 3), solo visualización
   * - false: Wizard activo (Phase 0), edición habilitada
   *
   * @default false
   */
  readonly?: boolean;

  /**
   * Clase CSS adicional para el contenedor
   *
   * @example "mt-4 px-6"
   */
  className?: string;
}
```

### Props de Subcomponentes

**ExpenseForm.tsx:**
```typescript
interface ExpenseFormProps {
  onSubmit: (expense: DailyExpense) => void;
  initialValues?: Partial<DailyExpense>; // Para modo edición
  onCancel?: () => void;
}
```

**ExpenseItem.tsx:**
```typescript
interface ExpenseItemProps {
  expense: DailyExpense;
  onEdit: (expense: DailyExpense) => void;
  onDelete: (id: string) => void;
  readonly: boolean;
}
```

**ExpenseDeleteModal.tsx:**
```typescript
interface ExpenseDeleteModalProps {
  isOpen: boolean;
  expense: DailyExpense | null;
  onConfirm: () => void;
  onCancel: () => void;
}
```

---

## 🔄 State Management

### State Local del Componente

```typescript
const ExpenseListManager: React.FC<ExpenseListManagerProps> = ({
  expenses,
  onExpensesChange,
  readonly = false,
  className
}) => {
  // 🔹 Mode: 'add' | 'edit' | 'view'
  const [mode, setMode] = useState<'add' | 'edit' | 'view'>('view');

  // 🔹 Gasto siendo editado (null si mode='add' o mode='view')
  const [editingExpense, setEditingExpense] = useState<DailyExpense | null>(null);

  // 🔹 Modal confirmación eliminar
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<DailyExpense | null>(null);

  // 🔹 Total calculado (useMemo para performance)
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  // ... handlers
};
```

### Handlers Principales

```typescript
/**
 * Agregar nuevo gasto
 */
const handleAddExpense = useCallback((newExpense: DailyExpense) => {
  const updatedExpenses = [...expenses, newExpense];
  onExpensesChange(updatedExpenses);
  setMode('view');
  toast.success(`✅ Gasto "${newExpense.concept}" agregado`);
}, [expenses, onExpensesChange]);

/**
 * Editar gasto existente
 */
const handleUpdateExpense = useCallback((updatedExpense: DailyExpense) => {
  const updatedExpenses = expenses.map(exp =>
    exp.id === updatedExpense.id ? updatedExpense : exp
  );
  onExpensesChange(updatedExpenses);
  setMode('view');
  setEditingExpense(null);
  toast.success(`✅ Gasto actualizado`);
}, [expenses, onExpensesChange]);

/**
 * Eliminar gasto con confirmación
 */
const handleDeleteExpense = useCallback((id: string) => {
  const expense = expenses.find(exp => exp.id === id);
  if (expense) {
    setExpenseToDelete(expense);
    setDeleteModalOpen(true);
  }
}, [expenses]);

/**
 * Confirmar eliminación
 */
const handleConfirmDelete = useCallback(() => {
  if (expenseToDelete) {
    const updatedExpenses = expenses.filter(exp => exp.id !== expenseToDelete.id);
    onExpensesChange(updatedExpenses);
    toast.success(`🗑️ Gasto eliminado`);
  }
  setDeleteModalOpen(false);
  setExpenseToDelete(null);
}, [expenses, expenseToDelete, onExpensesChange]);
```

---

## 🎨 Mockup Visual

### Layout Completo

```
┌─────────────────────────────────────────────────────────┐
│ 💰 Gastos del Día                          Total: $85.50│
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────────────────────────────────────┐│
│ │ 🆕 Agregar Gasto                                     ││
│ │                                                      ││
│ │ Concepto:                                            ││
│ │ ┌────────────────────────────────────────────────┐  ││
│ │ │ Compra productos limpieza               [100/100]│││
│ │ └────────────────────────────────────────────────┘  ││
│ │                                                      ││
│ │ Categoría:                 Monto:       ¿Factura?   ││
│ │ ┌─────────────────┐  ┌──────────────┐  ┌────────┐  ││
│ │ │📦 Insumos    ▼ │  │$ 30.00       │  │☑ Sí    │  ││
│ │ └─────────────────┘  └──────────────┘  └────────┘  ││
│ │                                                      ││
│ │ [✅ Agregar Gasto]  [❌ Cancelar]                   ││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ ┌──────────────────────────────────────────────────────┐│
│ │ 📦 Compra productos limpieza              $30.00    ││
│ │ 📦 Insumos • Con factura • 10:45 AM                 ││
│ │                              [✏️ Editar] [🗑️ Eliminar]││
│ ├──────────────────────────────────────────────────────┤│
│ │ 🔧 Reparación bomba acuario               $45.00    ││
│ │ 🔧 Servicios • Sin factura • 11:20 AM               ││
│ │                              [✏️ Editar] [🗑️ Eliminar]││
│ ├──────────────────────────────────────────────────────┤│
│ │ 🚗 Gasolina camioneta                     $10.50    ││
│ │ 🚗 Transporte • Con factura • 02:15 PM              ││
│ │                              [✏️ Editar] [🗑️ Eliminar]││
│ └──────────────────────────────────────────────────────┘│
│                                                          │
│ [➕ Agregar Otro Gasto]              [✅ Continuar]     │
└─────────────────────────────────────────────────────────┘
```

### Paleta de Colores (Glass Morphism)

```typescript
const EXPENSE_STYLES = {
  container: {
    background: 'rgba(36, 36, 36, 0.4)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: 'clamp(1rem, 3vw, 1.5rem)'
  },
  header: {
    color: '#e1e8ed', // Títulos
    fontSize: 'clamp(1.25rem, 4vw, 1.5rem)'
  },
  subtext: {
    color: '#8899a6' // Metadatos (hora, categoría)
  },
  total: {
    color: '#50fa7b', // Verde accent (mismo que success messages)
    fontWeight: 'bold'
  },
  categoryColors: {
    SUPPLIES: '#0a84ff',      // Azul iOS
    SERVICES: '#5e5ce6',      // Púrpura iOS
    MAINTENANCE: '#ff9f0a',   // Naranja iOS
    TRANSPORTATION: '#30d158', // Verde iOS
    OTHER: '#8899a6'          // Gris neutro
  }
};
```

### Responsive Breakpoints

```typescript
// Mobile-first design
const BREAKPOINTS = {
  // < 640px: 1 columna (concepto + monto stacked)
  mobile: '(max-width: 640px)',

  // 640px - 1024px: 2 columnas (concepto | monto)
  tablet: '(min-width: 640px) and (max-width: 1024px)',

  // > 1024px: 3 columnas (concepto | categoría | monto)
  desktop: '(min-width: 1024px)'
};
```

---

## 🖱️ Interacciones del Usuario

### Flujo 1: Agregar Gasto

1. Usuario click **"➕ Agregar Otro Gasto"**
2. Formulario se expande con animación `framer-motion`
3. Usuario completa 4 campos:
   - **Concepto:** Input text con contador caracteres (3-100)
   - **Categoría:** Select dropdown con 5 opciones + emojis
   - **Monto:** Input numeric (0.01-10000.00) con prefix "$"
   - **Factura:** Checkbox "¿Tiene factura?"
4. Validación en tiempo real (onChange)
5. Usuario click **"✅ Agregar Gasto"**
6. Validación final (onSubmit)
7. Si válido:
   - Expense agregado a array
   - Toast success: "✅ Gasto agregado"
   - Formulario resetea
   - Scroll a nuevo item en lista
8. Si inválido:
   - Input con error muestra mensaje específico
   - Focus en primer campo inválido

### Flujo 2: Editar Gasto

1. Usuario click **"✏️ Editar"** en ExpenseItem
2. Formulario reemplaza item con valores pre-cargados
3. Usuario modifica campos
4. Usuario click **"💾 Guardar Cambios"**
5. Validación final
6. Si válido:
   - Array actualizado con nuevo objeto (inmutabilidad)
   - Toast success: "✅ Gasto actualizado"
   - Vuelve a vista normal
7. Si inválido:
   - Mensajes de error en campos

### Flujo 3: Eliminar Gasto

1. Usuario click **"🗑️ Eliminar"** en ExpenseItem
2. Modal confirmación se abre:
   ```
   ⚠️ ¿Eliminar gasto?

   📦 Compra productos limpieza
   Monto: $30.00

   Esta acción no se puede deshacer.

   [❌ Cancelar]  [🗑️ Eliminar]
   ```
3. Usuario click **"🗑️ Eliminar"**
4. Expense removido de array
5. Toast success: "🗑️ Gasto eliminado"
6. Modal cierra con animación

---

## ✅ Validaciones Frontend

### Reglas de Validación

```typescript
/**
 * Schema de validación usando Zod (opcional) o custom validation
 */
const expenseValidationRules = {
  concept: {
    required: true,
    minLength: EXPENSE_VALIDATION.MIN_CONCEPT_LENGTH, // 3
    maxLength: EXPENSE_VALIDATION.MAX_CONCEPT_LENGTH, // 100
    pattern: /^[a-zA-Z0-9\s\-.,áéíóúÁÉÍÓÚñÑ]+$/, // Alfanumérico + español
    errorMessages: {
      required: "El concepto es obligatorio",
      minLength: "Mínimo 3 caracteres",
      maxLength: "Máximo 100 caracteres",
      pattern: "Solo letras, números y espacios"
    }
  },
  amount: {
    required: true,
    min: EXPENSE_VALIDATION.MIN_AMOUNT,     // 0.01
    max: EXPENSE_VALIDATION.MAX_AMOUNT,     // 10000.00
    step: 0.01, // 2 decimales USD
    errorMessages: {
      required: "El monto es obligatorio",
      min: "Mínimo $0.01",
      max: "Máximo $10,000.00",
      invalid: "Formato inválido (ej: 30.00)"
    }
  },
  category: {
    required: true,
    enum: ['SUPPLIES', 'SERVICES', 'MAINTENANCE', 'TRANSPORTATION', 'OTHER'],
    errorMessages: {
      required: "Seleccione una categoría"
    }
  },
  hasInvoice: {
    type: 'boolean',
    default: false
  }
};
```

### Validación en Tiempo Real (onChange)

```typescript
const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSubmit, initialValues }) => {
  const [concept, setConcept] = useState(initialValues?.concept || '');
  const [amount, setAmount] = useState(initialValues?.amount || 0);
  const [category, setCategory] = useState<ExpenseCategory>(initialValues?.category || 'SUPPLIES');
  const [hasInvoice, setHasInvoice] = useState(initialValues?.hasInvoice || false);

  // 🔹 Validation errors (solo mostrar después de touch)
  const [touched, setTouched] = useState({
    concept: false,
    amount: false,
    category: false
  });

  // 🔹 Validation state
  const errors = useMemo(() => {
    const errors: Record<string, string> = {};

    // Concept validation
    if (touched.concept) {
      if (!concept.trim()) {
        errors.concept = "El concepto es obligatorio";
      } else if (concept.length < 3) {
        errors.concept = "Mínimo 3 caracteres";
      } else if (concept.length > 100) {
        errors.concept = "Máximo 100 caracteres";
      }
    }

    // Amount validation
    if (touched.amount) {
      if (amount <= 0) {
        errors.amount = "El monto debe ser mayor a $0.00";
      } else if (amount > 10000) {
        errors.amount = "Máximo $10,000.00";
      }
    }

    return errors;
  }, [concept, amount, touched]);

  const isFormValid = Object.keys(errors).length === 0 && concept.trim() && amount > 0;

  // ... render
};
```

---

## 🧪 Tests de Integración

### Archivo de Tests

**Ruta:** `src/__tests__/integration/ExpenseListManager.test.tsx` (NUEVO)

### Test Cases (8-12 tests)

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseListManager } from '@/components/cash-counting/expenses/ExpenseListManager';
import type { DailyExpense } from '@/types/cash';

describe('ExpenseListManager', () => {
  const mockOnExpensesChange = vi.fn();

  const mockExpenses: DailyExpense[] = [
    {
      id: '1',
      concept: 'Compra productos limpieza',
      amount: 30.00,
      category: 'SUPPLIES',
      hasInvoice: true,
      timestamp: '2025-10-11T10:45:00.000-06:00'
    },
    {
      id: '2',
      concept: 'Reparación bomba',
      amount: 45.00,
      category: 'SERVICES',
      hasInvoice: false,
      timestamp: '2025-10-11T11:20:00.000-06:00'
    }
  ];

  describe('Renderizado Inicial', () => {
    it('should render expense list with total', () => {
      render(
        <ExpenseListManager
          expenses={mockExpenses}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Verificar total calculado correctamente
      expect(screen.getByText(/Total:\s*\$75\.00/)).toBeInTheDocument();

      // Verificar items en lista
      expect(screen.getByText('Compra productos limpieza')).toBeInTheDocument();
      expect(screen.getByText('Reparación bomba')).toBeInTheDocument();
    });

    it('should render empty state when no expenses', () => {
      render(
        <ExpenseListManager
          expenses={[]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      expect(screen.getByText(/No hay gastos registrados/i)).toBeInTheDocument();
      expect(screen.getByText(/Total:\s*\$0\.00/)).toBeInTheDocument();
    });
  });

  describe('Agregar Gasto', () => {
    it('should show form when clicking "Agregar Gasto"', async () => {
      const user = userEvent.setup();
      render(
        <ExpenseListManager
          expenses={[]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      const addButton = screen.getByRole('button', { name: /agregar gasto/i });
      await user.click(addButton);

      // Verificar formulario visible
      expect(screen.getByLabelText(/concepto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/monto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/categoría/i)).toBeInTheDocument();
    });

    it('should add new expense with valid data', async () => {
      const user = userEvent.setup();
      render(
        <ExpenseListManager
          expenses={[]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Abrir formulario
      await user.click(screen.getByRole('button', { name: /agregar gasto/i }));

      // Llenar campos
      await user.type(screen.getByLabelText(/concepto/i), 'Test expense');
      await user.type(screen.getByLabelText(/monto/i), '25.50');
      await user.selectOptions(screen.getByLabelText(/categoría/i), 'SUPPLIES');

      // Submit
      await user.click(screen.getByRole('button', { name: /agregar/i }));

      // Verificar callback llamado con expense correcto
      await waitFor(() => {
        expect(mockOnExpensesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              concept: 'Test expense',
              amount: 25.50,
              category: 'SUPPLIES'
            })
          ])
        );
      });
    });

    it('should show validation error for empty concept', async () => {
      const user = userEvent.setup();
      render(
        <ExpenseListManager
          expenses={[]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /agregar gasto/i }));

      // Llenar solo monto (concepto vacío)
      await user.type(screen.getByLabelText(/monto/i), '25.00');
      await user.click(screen.getByRole('button', { name: /agregar/i }));

      // Verificar error
      expect(await screen.findByText(/concepto es obligatorio/i)).toBeInTheDocument();
      expect(mockOnExpensesChange).not.toHaveBeenCalled();
    });

    it('should show validation error for amount = 0', async () => {
      const user = userEvent.setup();
      render(
        <ExpenseListManager
          expenses={[]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      await user.click(screen.getByRole('button', { name: /agregar gasto/i }));

      await user.type(screen.getByLabelText(/concepto/i), 'Test');
      await user.clear(screen.getByLabelText(/monto/i));
      await user.type(screen.getByLabelText(/monto/i), '0');
      await user.click(screen.getByRole('button', { name: /agregar/i }));

      expect(await screen.findByText(/monto debe ser mayor a \$0\.00/i)).toBeInTheDocument();
    });
  });

  describe('Editar Gasto', () => {
    it('should load expense data when clicking edit', async () => {
      const user = userEvent.setup();
      render(
        <ExpenseListManager
          expenses={mockExpenses}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Click edit en primer expense
      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      await user.click(editButtons[0]);

      // Verificar datos pre-cargados
      expect(screen.getByDisplayValue('Compra productos limpieza')).toBeInTheDocument();
      expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    });

    it('should update expense when saving changes', async () => {
      const user = userEvent.setup();
      render(
        <ExpenseListManager
          expenses={mockExpenses}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Edit primer expense
      const editButtons = screen.getAllByRole('button', { name: /editar/i });
      await user.click(editButtons[0]);

      // Modificar concepto
      const conceptInput = screen.getByDisplayValue('Compra productos limpieza');
      await user.clear(conceptInput);
      await user.type(conceptInput, 'Concepto actualizado');

      // Guardar
      await user.click(screen.getByRole('button', { name: /guardar/i }));

      // Verificar callback con expense actualizado
      await waitFor(() => {
        expect(mockOnExpensesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: '1',
              concept: 'Concepto actualizado',
              amount: 30.00
            })
          ])
        );
      });
    });
  });

  describe('Eliminar Gasto', () => {
    it('should show confirmation modal when clicking delete', async () => {
      const user = userEvent.setup();
      render(
        <ExpenseListManager
          expenses={mockExpenses}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
      await user.click(deleteButtons[0]);

      // Verificar modal
      expect(screen.getByText(/¿eliminar gasto\?/i)).toBeInTheDocument();
      expect(screen.getByText('Compra productos limpieza')).toBeInTheDocument();
    });

    it('should delete expense when confirming modal', async () => {
      const user = userEvent.setup();
      render(
        <ExpenseListManager
          expenses={mockExpenses}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Delete primer expense
      const deleteButtons = screen.getAllByRole('button', { name: /eliminar/i });
      await user.click(deleteButtons[0]);

      // Confirmar en modal
      const confirmButton = screen.getByRole('button', { name: /eliminar/i });
      await user.click(confirmButton);

      // Verificar callback con array sin el expense eliminado
      await waitFor(() => {
        expect(mockOnExpensesChange).toHaveBeenCalledWith([mockExpenses[1]]);
      });
    });
  });

  describe('Modo Readonly', () => {
    it('should hide edit/delete buttons in readonly mode', () => {
      render(
        <ExpenseListManager
          expenses={mockExpenses}
          onExpensesChange={mockOnExpensesChange}
          readonly={true}
        />
      );

      // Verificar botones NO visibles
      expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /eliminar/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /agregar/i })).not.toBeInTheDocument();
    });
  });

  describe('Total Calculation', () => {
    it('should calculate total correctly with multiple expenses', () => {
      const expenses: DailyExpense[] = [
        { ...mockExpenses[0], amount: 10.50 },
        { ...mockExpenses[1], amount: 20.75 },
        { ...mockExpenses[0], id: '3', amount: 5.25 }
      ];

      render(
        <ExpenseListManager
          expenses={expenses}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // 10.50 + 20.75 + 5.25 = 36.50
      expect(screen.getByText(/Total:\s*\$36\.50/)).toBeInTheDocument();
    });
  });
});
```

---

## ✅ Checklist de Completitud

### Archivos del Componente

- [ ] **Componente principal creado:** `src/components/cash-counting/expenses/ExpenseListManager.tsx`
- [ ] **Subcomponente formulario:** `ExpenseForm.tsx`
- [ ] **Subcomponente item:** `ExpenseItem.tsx`
- [ ] **Subcomponente modal:** `ExpenseDeleteModal.tsx`

### Props & Interfaces

- [ ] **Interface `ExpenseListManagerProps` definida** con TSDoc
- [ ] **Props validadas:** expenses, onExpensesChange, readonly, className
- [ ] **Props subcomponentes definidas**

### State & Logic

- [ ] **State local implementado:** mode, editingExpense, deleteModal
- [ ] **Handlers memoizados:** useCallback para add/update/delete
- [ ] **Total calculado:** useMemo para performance
- [ ] **Validación en tiempo real** (onChange)
- [ ] **Validación submit** (onSubmit)

### UI & Styling

- [ ] **Glass morphism aplicado** (background blur + borders)
- [ ] **Responsive design:** Mobile (1 col), Tablet (2 col), Desktop (3 col)
- [ ] **Emojis categorías:** 5 categorías con emoji único
- [ ] **Animaciones:** Framer Motion en formulario + lista
- [ ] **Toast notifications:** Success/error con sonner

### Tests de Integración

- [ ] **Test file creado:** `src/__tests__/integration/ExpenseListManager.test.tsx`
- [ ] **8-12 tests implementados:**
  - [ ] Test: Renderizado inicial con total
  - [ ] Test: Empty state (0 gastos)
  - [ ] Test: Mostrar formulario al click agregar
  - [ ] Test: Agregar gasto válido
  - [ ] Test: Validación concepto vacío
  - [ ] Test: Validación amount = 0
  - [ ] Test: Cargar datos en edición
  - [ ] Test: Actualizar gasto
  - [ ] Test: Modal confirmación eliminar
  - [ ] Test: Eliminar gasto confirmado
  - [ ] Test: Modo readonly (botones ocultos)
  - [ ] Test: Cálculo total correcto
- [ ] **Todos los tests passing** (8-12/8-12)

### Validación Final

- [ ] **TypeScript:** `npx tsc --noEmit` → 0 errors
- [ ] **Tests:** `npm run test` → 8-12/8-12 passing
- [ ] **ESLint:** 0 errors, 0 warnings
- [ ] **Accesibilidad:** aria-labels en inputs, keyboard navigation
- [ ] **Performance:** useMemo/useCallback aplicados correctamente

---

## 📊 Estimación de Tiempo

| Tarea | Tiempo Estimado | Complejidad |
|-------|-----------------|-------------|
| ExpenseListManager.tsx | 45 min | Media |
| ExpenseForm.tsx | 40 min | Media-Alta |
| ExpenseItem.tsx | 20 min | Baja |
| ExpenseDeleteModal.tsx | 15 min | Baja |
| Validaciones + handlers | 30 min | Media |
| Styling (glass morphism) | 20 min | Baja |
| Responsive design | 15 min | Baja |
| Implementar 8-12 tests | 50-60 min | Media-Alta |
| **TOTAL** | **3-4 horas** | **Media** |

---

## 🔗 Referencias

- **shadcn/ui Components:**
  - `<Card />` - Contenedor principal
  - `<Input />` - Concepto + Monto
  - `<Select />` - Categoría dropdown
  - `<Checkbox />` - Factura
  - `<Button />` - Acciones (agregar/editar/eliminar)
  - `<AlertDialog />` - Modal confirmación eliminar

- **Componentes similares existentes:**
  - `src/components/cash-counting/GuidedFieldView.tsx` - Pattern responsive
  - `src/components/ui/ConstructiveActionButton.tsx` - Botones acciones
  - `src/components/confirmation-modal.tsx` - Modal pattern

- **Framer Motion:**
  - `motion.div` con `initial/animate/exit` para formulario
  - `AnimatePresence` para lista de items

---

## 📝 Notas Importantes

1. **Ubicación:** `src/components/cash-counting/expenses/` (cohesión con flujo existente)
2. **Presentational Pattern:** Componente controlado, state manejado por wizard
3. **LocalStorage:** Persistencia manejada externamente por wizard (como Phase1)
4. **Immutability:** Todos los updates crean nuevos arrays (NO mutations)
5. **Accessibility:** Labels en español, aria-labels completos, keyboard navigation
6. **Performance:** useMemo para total, useCallback para handlers

---

**✅ Documento completado:** Fase 2 - Componente UI
**Próximo documento:** Fase_6_Testing_Validacion.md (25 min, 300+ líneas)
**Fecha:** 11 Oct 2025
**Versión:** v1.4.0
