// 🤖 [IA] - v2.6.0 Phase 2G: Tests unitarios para useExpensesManager hook
// Fase 2G - Auditoría "Cimientos de Cristal"
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExpensesManager } from '../useExpensesManager';
import type { DailyExpense, ExpenseCategory } from '@/types/expenses';
import { EXPENSE_VALIDATION } from '@/types/expenses';

// ============================================================================
// MOCKS
// ============================================================================

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock crypto.randomUUID
const mockUUID = 'test-uuid-12345678';
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => mockUUID),
});

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const createMockExpense = (overrides: Partial<DailyExpense> = {}): DailyExpense => ({
  id: 'expense-1',
  concept: 'Gastos de oficina',
  amount: 25.50,
  category: 'supplies',
  hasInvoice: true,
  timestamp: '2025-01-15T10:30:00.000Z',
  ...overrides,
});

const createMockExpenses = (count: number): DailyExpense[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `expense-${i + 1}`,
    concept: `Gasto ${i + 1}`,
    amount: (i + 1) * 10,
    category: 'operational' as ExpenseCategory,
    hasInvoice: i % 2 === 0,
    timestamp: new Date().toISOString(),
  }));
};

describe('useExpensesManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // GRUPO 1: ESTADO INICIAL
  // ============================================================================
  describe('Estado inicial', () => {
    it('debe inicializar con lista vacía de gastos cuando no se pasan props', () => {
      const { result } = renderHook(() => useExpensesManager());

      expect(result.current.expenses).toEqual([]);
      expect(result.current.totalExpenses).toBe(0);
    });

    it('debe inicializar con gastos proporcionados en initialExpenses', () => {
      const initialExpenses = [createMockExpense()];
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses })
      );

      expect(result.current.expenses).toHaveLength(1);
      expect(result.current.expenses[0].concept).toBe('Gastos de oficina');
    });

    it('debe inicializar isAdding en false', () => {
      const { result } = renderHook(() => useExpensesManager());

      expect(result.current.isAdding).toBe(false);
    });

    it('debe inicializar editingId en null', () => {
      const { result } = renderHook(() => useExpensesManager());

      expect(result.current.editingId).toBeNull();
    });

    it('debe inicializar formData con valores vacíos', () => {
      const { result } = renderHook(() => useExpensesManager());

      expect(result.current.formData).toEqual({
        concept: '',
        amount: undefined,
        category: undefined,
        hasInvoice: false,
      });
    });

    it('debe inicializar amountInput como string vacío', () => {
      const { result } = renderHook(() => useExpensesManager());

      expect(result.current.amountInput).toBe('');
    });

    it('debe inicializar errors como objeto vacío', () => {
      const { result } = renderHook(() => useExpensesManager());

      expect(result.current.errors).toEqual({});
    });

    it('debe usar maxExpenses por defecto de 10', () => {
      const expenses = createMockExpenses(10);
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses: expenses })
      );

      expect(result.current.canAddMore).toBe(false);
    });

    it('debe permitir configurar maxExpenses personalizado', () => {
      const expenses = createMockExpenses(5);
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses: expenses, maxExpenses: 5 })
      );

      expect(result.current.canAddMore).toBe(false);
    });
  });

  // ============================================================================
  // GRUPO 2: CÁLCULOS
  // ============================================================================
  describe('Cálculos', () => {
    it('debe calcular totalExpenses correctamente', () => {
      const initialExpenses = [
        createMockExpense({ id: '1', amount: 10.50 }),
        createMockExpense({ id: '2', amount: 25.00 }),
        createMockExpense({ id: '3', amount: 14.50 }),
      ];
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses })
      );

      expect(result.current.totalExpenses).toBe(50.00);
    });

    it('debe formatear totalExpenses a 2 decimales', () => {
      const initialExpenses = [
        createMockExpense({ id: '1', amount: 10.333 }),
        createMockExpense({ id: '2', amount: 20.666 }),
      ];
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses })
      );

      expect(result.current.formattedTotal).toBe('31.00');
    });

    it('debe retornar canAddMore true cuando hay espacio', () => {
      const expenses = createMockExpenses(5);
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses: expenses, maxExpenses: 10 })
      );

      expect(result.current.canAddMore).toBe(true);
    });

    it('debe retornar canAddMore false cuando se alcanza el límite', () => {
      const expenses = createMockExpenses(10);
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses: expenses, maxExpenses: 10 })
      );

      expect(result.current.canAddMore).toBe(false);
    });

    it('debe retornar isFormValid false con formulario vacío', () => {
      const { result } = renderHook(() => useExpensesManager());

      expect(result.current.isFormValid).toBe(false);
    });

    it('debe retornar isFormValid true con formulario completo válido', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('Gasto válido');
        result.current.setFormAmount('50.00');
        result.current.setFormCategory('operational');
      });

      expect(result.current.isFormValid).toBe(true);
    });
  });

  // ============================================================================
  // GRUPO 3: HANDLERS DEL FORMULARIO
  // ============================================================================
  describe('Handlers del formulario', () => {
    it('debe actualizar concepto con setFormConcept', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('Nuevo concepto');
      });

      expect(result.current.formData.concept).toBe('Nuevo concepto');
    });

    it('debe actualizar amount con setFormAmount (valor numérico)', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormAmount('125.50');
      });

      expect(result.current.formData.amount).toBe(125.50);
      expect(result.current.amountInput).toBe('125.50');
    });

    it('debe normalizar comas a puntos en setFormAmount', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormAmount('125,50');
      });

      expect(result.current.formData.amount).toBe(125.50);
      expect(result.current.amountInput).toBe('125.50');
    });

    it('debe permitir solo un punto decimal', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormAmount('125.50.25');
      });

      expect(result.current.amountInput).toBe('125.5025');
    });

    it('debe manejar string vacío en setFormAmount', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormAmount('100');
        result.current.setFormAmount('');
      });

      expect(result.current.formData.amount).toBeUndefined();
      expect(result.current.amountInput).toBe('');
    });

    it('debe manejar solo punto en setFormAmount', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormAmount('.');
      });

      expect(result.current.formData.amount).toBeUndefined();
      expect(result.current.amountInput).toBe('.');
    });

    it('debe actualizar categoría con setFormCategory', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormCategory('transport');
      });

      expect(result.current.formData.category).toBe('transport');
    });

    it('debe actualizar hasInvoice con setFormHasInvoice', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormHasInvoice(true);
      });

      expect(result.current.formData.hasInvoice).toBe(true);
    });

    it('debe formatear amount en handleAmountBlur', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormAmount('44.');
      });

      expect(result.current.amountInput).toBe('44.');

      act(() => {
        result.current.handleAmountBlur();
      });

      expect(result.current.amountInput).toBe('44');
    });
  });

  // ============================================================================
  // GRUPO 4: VALIDACIÓN DEL FORMULARIO
  // ============================================================================
  describe('Validación del formulario', () => {
    it('debe retornar error si concepto es muy corto', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('AB');
        result.current.setFormAmount('50');
        result.current.setFormCategory('operational');
      });

      const validation = result.current.validateForm();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.concept).toContain(`Mínimo ${EXPENSE_VALIDATION.MIN_CONCEPT_LENGTH}`);
    });

    it('debe retornar error si concepto es muy largo', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('A'.repeat(EXPENSE_VALIDATION.MAX_CONCEPT_LENGTH + 1));
        result.current.setFormAmount('50');
        result.current.setFormCategory('operational');
      });

      const validation = result.current.validateForm();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.concept).toContain(`Máximo ${EXPENSE_VALIDATION.MAX_CONCEPT_LENGTH}`);
    });

    it('debe retornar error si amount es menor al mínimo', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('Concepto válido');
        result.current.setFormAmount('0.001');
        result.current.setFormCategory('operational');
      });

      const validation = result.current.validateForm();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.amount).toContain('Mínimo');
    });

    it('debe retornar error si amount supera el máximo', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('Concepto válido');
        result.current.setFormAmount('15000');
        result.current.setFormCategory('operational');
      });

      const validation = result.current.validateForm();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.amount).toContain('Máximo');
    });

    it('debe retornar error si amount tiene más de 2 decimales', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('Concepto válido');
        result.current.setFormAmount('50.123');
        result.current.setFormCategory('operational');
      });

      const validation = result.current.validateForm();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.amount).toContain('Máximo 2 decimales');
    });

    it('debe retornar error si category no está seleccionada', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('Concepto válido');
        result.current.setFormAmount('50');
      });

      const validation = result.current.validateForm();

      expect(validation.isValid).toBe(false);
      expect(validation.errors.category).toBe('Seleccione una categoría');
    });

    it('debe retornar isValid true con formulario válido', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('Gasto válido');
        result.current.setFormAmount('50.00');
        result.current.setFormCategory('supplies');
      });

      const validation = result.current.validateForm();

      expect(validation.isValid).toBe(true);
      expect(validation.errors).toEqual({});
    });
  });

  // ============================================================================
  // GRUPO 5: ACCIONES CRUD - AGREGAR
  // ============================================================================
  describe('Agregar gasto', () => {
    it('debe abrir formulario con openAddForm', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.openAddForm();
      });

      expect(result.current.isAdding).toBe(true);
    });

    it('debe agregar gasto correctamente con handleAddExpense', () => {
      const onExpensesChange = vi.fn();
      const { result } = renderHook(() =>
        useExpensesManager({ onExpensesChange })
      );

      act(() => {
        result.current.openAddForm();
        result.current.setFormConcept('Compra de suministros');
        result.current.setFormAmount('75.50');
        result.current.setFormCategory('supplies');
        result.current.setFormHasInvoice(true);
      });

      act(() => {
        result.current.handleAddExpense();
      });

      expect(result.current.expenses).toHaveLength(1);
      expect(result.current.expenses[0].concept).toBe('Compra de suministros');
      expect(result.current.expenses[0].amount).toBe(75.50);
      expect(result.current.expenses[0].category).toBe('supplies');
      expect(result.current.expenses[0].hasInvoice).toBe(true);
      expect(onExpensesChange).toHaveBeenCalledWith(result.current.expenses);
    });

    it('debe resetear formulario después de agregar', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.openAddForm();
        result.current.setFormConcept('Test');
        result.current.setFormAmount('50');
        result.current.setFormCategory('operational');
      });

      act(() => {
        result.current.handleAddExpense();
      });

      expect(result.current.isAdding).toBe(false);
      expect(result.current.formData.concept).toBe('');
      expect(result.current.formData.amount).toBeUndefined();
    });

    it('debe generar UUID único para cada gasto', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('Test');
        result.current.setFormAmount('50');
        result.current.setFormCategory('operational');
        result.current.handleAddExpense();
      });

      expect(result.current.expenses[0].id).toBe(mockUUID);
    });

    it('no debe agregar si validación falla', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('AB'); // Muy corto
        result.current.setFormAmount('50');
        result.current.setFormCategory('operational');
        result.current.handleAddExpense();
      });

      expect(result.current.expenses).toHaveLength(0);
      expect(result.current.errors).toHaveProperty('concept');
    });

    it('no debe agregar si se alcanzó el límite máximo', () => {
      const expenses = createMockExpenses(10);
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses: expenses, maxExpenses: 10 })
      );

      act(() => {
        result.current.setFormConcept('Nuevo gasto');
        result.current.setFormAmount('50');
        result.current.setFormCategory('operational');
        result.current.handleAddExpense();
      });

      expect(result.current.expenses).toHaveLength(10);
    });
  });

  // ============================================================================
  // GRUPO 6: ACCIONES CRUD - EDITAR
  // ============================================================================
  describe('Editar gasto', () => {
    it('debe cargar gasto en formulario con handleEditExpense', () => {
      const existingExpense = createMockExpense();
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses: [existingExpense] })
      );

      act(() => {
        result.current.handleEditExpense(existingExpense);
      });

      expect(result.current.isAdding).toBe(true);
      expect(result.current.editingId).toBe(existingExpense.id);
      expect(result.current.formData.concept).toBe(existingExpense.concept);
      expect(result.current.formData.amount).toBe(existingExpense.amount);
      expect(result.current.formData.category).toBe(existingExpense.category);
      expect(result.current.formData.hasInvoice).toBe(existingExpense.hasInvoice);
      expect(result.current.amountInput).toBe(existingExpense.amount.toString());
    });

    it('debe limpiar errores al editar', () => {
      const existingExpense = createMockExpense();
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses: [existingExpense] })
      );

      // Primero generamos un error
      act(() => {
        result.current.setFormConcept('AB');
        result.current.handleAddExpense();
      });

      expect(Object.keys(result.current.errors).length).toBeGreaterThan(0);

      act(() => {
        result.current.handleEditExpense(existingExpense);
      });

      expect(result.current.errors).toEqual({});
    });

    it('debe actualizar gasto existente con handleUpdateExpense', () => {
      const existingExpense = createMockExpense();
      const onExpensesChange = vi.fn();
      const { result } = renderHook(() =>
        useExpensesManager({
          initialExpenses: [existingExpense],
          onExpensesChange,
        })
      );

      act(() => {
        result.current.handleEditExpense(existingExpense);
      });

      act(() => {
        result.current.setFormConcept('Concepto actualizado');
        result.current.setFormAmount('100.00');
      });

      act(() => {
        result.current.handleUpdateExpense();
      });

      expect(result.current.expenses[0].concept).toBe('Concepto actualizado');
      expect(result.current.expenses[0].amount).toBe(100.00);
      expect(result.current.expenses[0].id).toBe(existingExpense.id); // ID preservado
      expect(onExpensesChange).toHaveBeenCalled();
    });

    it('debe preservar timestamp original al actualizar', () => {
      const existingExpense = createMockExpense({
        timestamp: '2025-01-01T00:00:00.000Z',
      });
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses: [existingExpense] })
      );

      act(() => {
        result.current.handleEditExpense(existingExpense);
        result.current.setFormConcept('Actualizado');
        result.current.handleUpdateExpense();
      });

      expect(result.current.expenses[0].timestamp).toBe('2025-01-01T00:00:00.000Z');
    });

    it('no debe actualizar si validación falla', () => {
      const existingExpense = createMockExpense();
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses: [existingExpense] })
      );

      act(() => {
        result.current.handleEditExpense(existingExpense);
        result.current.setFormConcept('AB'); // Muy corto
        result.current.handleUpdateExpense();
      });

      expect(result.current.expenses[0].concept).toBe(existingExpense.concept);
      expect(result.current.errors).toHaveProperty('concept');
    });
  });

  // ============================================================================
  // GRUPO 7: ACCIONES CRUD - ELIMINAR
  // ============================================================================
  describe('Eliminar gasto', () => {
    it('debe eliminar gasto con handleDeleteExpense', () => {
      const expenses = createMockExpenses(3);
      const onExpensesChange = vi.fn();
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses: expenses, onExpensesChange })
      );

      act(() => {
        result.current.handleDeleteExpense('expense-2', 'Gasto 2');
      });

      expect(result.current.expenses).toHaveLength(2);
      expect(result.current.expenses.find(e => e.id === 'expense-2')).toBeUndefined();
      expect(onExpensesChange).toHaveBeenCalled();
    });

    it('debe actualizar totalExpenses después de eliminar', () => {
      const expenses = [
        createMockExpense({ id: '1', amount: 100 }),
        createMockExpense({ id: '2', amount: 50 }),
      ];
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses: expenses })
      );

      expect(result.current.totalExpenses).toBe(150);

      act(() => {
        result.current.handleDeleteExpense('1', 'Test');
      });

      expect(result.current.totalExpenses).toBe(50);
    });

    it('debe actualizar canAddMore después de eliminar', () => {
      const expenses = createMockExpenses(10);
      const { result } = renderHook(() =>
        useExpensesManager({ initialExpenses: expenses, maxExpenses: 10 })
      );

      expect(result.current.canAddMore).toBe(false);

      act(() => {
        result.current.handleDeleteExpense('expense-1', 'Test');
      });

      expect(result.current.canAddMore).toBe(true);
    });
  });

  // ============================================================================
  // GRUPO 8: UTILIDADES
  // ============================================================================
  describe('Utilidades', () => {
    it('debe resetear formulario con resetForm', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.openAddForm();
        result.current.setFormConcept('Test');
        result.current.setFormAmount('100');
        result.current.setFormCategory('operational');
      });

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.isAdding).toBe(false);
      expect(result.current.editingId).toBeNull();
      expect(result.current.formData.concept).toBe('');
      expect(result.current.formData.amount).toBeUndefined();
      expect(result.current.formData.category).toBeUndefined();
      expect(result.current.amountInput).toBe('');
      expect(result.current.errors).toEqual({});
    });

    it('debe cancelar con handleCancel (alias de resetForm)', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.openAddForm();
        result.current.setFormConcept('Test');
      });

      act(() => {
        result.current.handleCancel();
      });

      expect(result.current.isAdding).toBe(false);
      expect(result.current.formData.concept).toBe('');
    });

    it('debe sincronizar gastos externos con syncExpenses', () => {
      const { result } = renderHook(() => useExpensesManager());

      const externalExpenses = createMockExpenses(3);

      act(() => {
        result.current.syncExpenses(externalExpenses);
      });

      expect(result.current.expenses).toHaveLength(3);
      expect(result.current.expenses).toEqual(externalExpenses);
    });
  });

  // ============================================================================
  // GRUPO 9: CALLBACKS
  // ============================================================================
  describe('Callbacks', () => {
    it('debe llamar onExpensesChange al agregar gasto', () => {
      const onExpensesChange = vi.fn();
      const { result } = renderHook(() =>
        useExpensesManager({ onExpensesChange })
      );

      act(() => {
        result.current.setFormConcept('Test gasto');
        result.current.setFormAmount('50');
        result.current.setFormCategory('operational');
        result.current.handleAddExpense();
      });

      expect(onExpensesChange).toHaveBeenCalledTimes(1);
      expect(onExpensesChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ concept: 'Test gasto' }),
        ])
      );
    });

    it('debe llamar onExpensesChange al actualizar gasto', () => {
      const expense = createMockExpense();
      const onExpensesChange = vi.fn();
      const { result } = renderHook(() =>
        useExpensesManager({
          initialExpenses: [expense],
          onExpensesChange,
        })
      );

      act(() => {
        result.current.handleEditExpense(expense);
        result.current.setFormConcept('Actualizado');
        result.current.handleUpdateExpense();
      });

      expect(onExpensesChange).toHaveBeenCalled();
    });

    it('debe llamar onExpensesChange al eliminar gasto', () => {
      const expense = createMockExpense();
      const onExpensesChange = vi.fn();
      const { result } = renderHook(() =>
        useExpensesManager({
          initialExpenses: [expense],
          onExpensesChange,
        })
      );

      act(() => {
        result.current.handleDeleteExpense(expense.id, expense.concept);
      });

      expect(onExpensesChange).toHaveBeenCalledWith([]);
    });

    it('no debe fallar si onExpensesChange no está definido', () => {
      const { result } = renderHook(() => useExpensesManager());

      expect(() => {
        act(() => {
          result.current.setFormConcept('Test');
          result.current.setFormAmount('50');
          result.current.setFormCategory('operational');
          result.current.handleAddExpense();
        });
      }).not.toThrow();
    });
  });

  // ============================================================================
  // GRUPO 10: SINCRONIZACIÓN CON PROPS
  // ============================================================================
  describe('Sincronización con props', () => {
    it('debe actualizar expenses cuando initialExpenses cambia', () => {
      const initialExpenses = [createMockExpense({ id: '1', concept: 'Original' })];
      const { result, rerender } = renderHook(
        (props) => useExpensesManager(props),
        { initialProps: { initialExpenses } }
      );

      expect(result.current.expenses[0].concept).toBe('Original');

      const newExpenses = [createMockExpense({ id: '2', concept: 'Nuevo' })];
      rerender({ initialExpenses: newExpenses });

      expect(result.current.expenses[0].concept).toBe('Nuevo');
    });
  });

  // ============================================================================
  // GRUPO 11: EDGE CASES
  // ============================================================================
  describe('Edge cases', () => {
    it('debe manejar caracteres especiales en concepto', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('Compra de "materiales" & suministros');
        result.current.setFormAmount('50');
        result.current.setFormCategory('supplies');
        result.current.handleAddExpense();
      });

      expect(result.current.expenses[0].concept).toBe('Compra de "materiales" & suministros');
    });

    it('debe manejar valores con espacios al inicio y final', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormConcept('  Gasto con espacios  ');
        result.current.setFormAmount('50');
        result.current.setFormCategory('supplies');
        result.current.handleAddExpense();
      });

      expect(result.current.expenses[0].concept).toBe('Gasto con espacios');
    });

    it('debe filtrar caracteres no numéricos en amount', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormAmount('$100.50USD');
      });

      expect(result.current.amountInput).toBe('100.50');
      expect(result.current.formData.amount).toBe(100.50);
    });

    it('debe manejar NaN en amount', () => {
      const { result } = renderHook(() => useExpensesManager());

      act(() => {
        result.current.setFormAmount('abc');
      });

      expect(result.current.formData.amount).toBeUndefined();
    });
  });
});
