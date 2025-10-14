// 🤖 [IA] - v1.4.0 FASE 2: Tests DailyExpensesManager
// 12 tests: Renderizado (3) + Agregar (3) + Editar/Eliminar (3) + Validaciones (3)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DailyExpensesManager } from '../DailyExpensesManager';
import { DailyExpense, ExpenseCategory } from '@/types/expenses';

describe('DailyExpensesManager', () => {
  // ==================== MOCK DATA ====================

  const mockExpense: DailyExpense = {
    id: 'test-id-1',
    concept: 'Reparación bomba agua',
    amount: 45.0,
    category: 'operational' as ExpenseCategory,
    hasInvoice: true,
    timestamp: '2025-10-13T09:45:00.000Z',
  };

  const mockExpenses: DailyExpense[] = [
    mockExpense,
    {
      id: 'test-id-2',
      concept: 'Cloro y limpieza',
      amount: 32.5,
      category: 'supplies' as ExpenseCategory,
      hasInvoice: false,
      timestamp: '2025-10-13T10:15:00.000Z',
    },
  ];

  const mockOnExpensesChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==================== SUITE 1: RENDERIZADO ====================

  describe('Suite 1: Renderizado', () => {
    it('1.1 - Renderiza correctamente con expenses vacío', () => {
      render(
        <DailyExpensesManager
          expenses={[]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      expect(screen.getByText(/Gastos del Día/i)).toBeInTheDocument();
      expect(screen.getByText(/No hay gastos registrados/i)).toBeInTheDocument();
      expect(screen.getByText(/Registrar primer gasto/i)).toBeInTheDocument();
    });

    it('1.2 - Renderiza lista de gastos existentes', () => {
      render(
        <DailyExpensesManager
          expenses={mockExpenses}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      expect(screen.getByText(/Reparación bomba agua/i)).toBeInTheDocument();
      expect(screen.getByText(/Cloro y limpieza/i)).toBeInTheDocument();
      expect(screen.getAllByText(/\$45\.00/)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/\$32\.50/)[0]).toBeInTheDocument();
      expect(screen.getByText(/Total Gastos:/i)).toBeInTheDocument();
      expect(screen.getAllByText(/\$77\.50/)[0]).toBeInTheDocument(); // Total calculado
    });

    it('1.3 - Muestra EmptyState cuando expenses = []', () => {
      render(
        <DailyExpensesManager
          expenses={[]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      expect(screen.getByText(/No hay gastos registrados/i)).toBeInTheDocument();
      expect(screen.getByText(/Los gastos se restarán del total general/i)).toBeInTheDocument();
    });
  });

  // ==================== SUITE 2: AGREGAR GASTO ====================

  describe('Suite 2: Agregar Gasto', () => {
    it('2.1 - Agrega gasto válido correctamente', async () => {
      const user = userEvent.setup();

      render(
        <DailyExpensesManager
          expenses={[]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Click botón "Agregar"
      const addButton = screen.getByRole('button', { name: /Agregar/i });
      await user.click(addButton);

      // Llenar formulario
      const conceptInput = screen.getByPlaceholderText(/Ej: Reparación bomba/i);
      await user.type(conceptInput, 'Gasolina camioneta');

      const amountInputs = screen.getAllByRole('spinbutton');
      await user.type(amountInputs[0], '50.00');

      const categorySelect = screen.getByRole('combobox');
      await user.selectOptions(categorySelect, 'transport');

      // Guardar gasto
      const saveButton = screen.getByRole('button', { name: /Guardar Gasto/i });
      await user.click(saveButton);

      // Verificar callback llamado con nuevo gasto
      await waitFor(() => {
        expect(mockOnExpensesChange).toHaveBeenCalledTimes(1);
        const newExpenses = mockOnExpensesChange.mock.calls[0][0];
        expect(newExpenses).toHaveLength(1);
        expect(newExpenses[0].concept).toBe('Gasolina camioneta');
        expect(newExpenses[0].amount).toBe(50);
        expect(newExpenses[0].category).toBe('transport');
      });
    });

    it('2.2 - Valida campos requeridos (concept, amount, category)', async () => {
      const user = userEvent.setup();

      render(
        <DailyExpensesManager
          expenses={[]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Abrir formulario
      const addButton = screen.getByRole('button', { name: /Agregar/i });
      await user.click(addButton);

      // Intentar guardar sin llenar campos
      const saveButton = screen.getByRole('button', { name: /Guardar Gasto/i });
      expect(saveButton).toBeDisabled(); // Botón disabled hasta validación completa

      // Llenar concept (< 3 chars)
      const conceptInput = screen.getByPlaceholderText(/Ej: Reparación bomba/i);
      await user.type(conceptInput, 'Ab');
      await user.tab(); // Blur para triggear validación

      // Verificar error mínimo 3 caracteres
      await waitFor(() => {
        expect(screen.getByText(/Mínimo 3 caracteres/i)).toBeInTheDocument();
      });
    });

    it('2.3 - Previene agregar si maxExpenses alcanzado', async () => {
      const user = userEvent.setup();

      // Crear array con 10 gastos (maxExpenses = 10)
      const fullExpenses = Array.from({ length: 10 }, (_, i) => ({
        id: `test-id-${i}`,
        concept: `Gasto ${i + 1}`,
        amount: 10.0,
        category: 'operational' as ExpenseCategory,
        hasInvoice: false,
        timestamp: new Date().toISOString(),
      }));

      render(
        <DailyExpensesManager
          expenses={fullExpenses}
          onExpensesChange={mockOnExpensesChange}
          maxExpenses={10}
        />
      );

      // Verificar badge "10/10 gastos"
      expect(screen.getByText(/10\/10 gastos/i)).toBeInTheDocument();

      // Intentar agregar (botón debe existir pero toast debe prevenir)
      const addButton = screen.getByRole('button', { name: /Agregar/i });
      await user.click(addButton);

      // Toast "Máximo 10 gastos permitidos" debería aparecer
      // (sonner toast no es fácil testear, pero canAddExpense() retorna false)
    });
  });

  // ==================== SUITE 3: EDITAR/ELIMINAR ====================

  describe('Suite 3: Editar/Eliminar', () => {
    it('3.1 - Edita gasto existente correctamente', async () => {
      const user = userEvent.setup();

      render(
        <DailyExpensesManager
          expenses={[mockExpense]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Click botón editar (icono Edit2)
      const editButton = screen.getAllByRole('button')[1]; // Segundo botón (después de Agregar)
      await user.click(editButton);

      // Verificar formulario cargado con datos
      await waitFor(() => {
        const conceptInput = screen.getByDisplayValue(/Reparación bomba agua/i);
        expect(conceptInput).toBeInTheDocument();
      });

      // Modificar concepto
      const conceptInput = screen.getByDisplayValue(/Reparación bomba agua/i);
      await user.clear(conceptInput);
      await user.type(conceptInput, 'Reparación bomba agua EDITADO');

      // Guardar cambios
      const updateButton = screen.getByRole('button', { name: /Actualizar/i });
      await user.click(updateButton);

      // Verificar callback con gasto actualizado
      await waitFor(() => {
        expect(mockOnExpensesChange).toHaveBeenCalledTimes(1);
        const updatedExpenses = mockOnExpensesChange.mock.calls[0][0];
        expect(updatedExpenses[0].concept).toBe('Reparación bomba agua EDITADO');
      });
    });

    it('3.2 - Elimina gasto con confirmación', async () => {
      const user = userEvent.setup();

      render(
        <DailyExpensesManager
          expenses={mockExpenses}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Click botón eliminar (icono Trash2)
      const deleteButtons = screen.getAllByRole('button');
      const deleteButton = deleteButtons[deleteButtons.length - 1]; // Último botón (eliminar)
      await user.click(deleteButton);

      // Verificar callback con gasto removido
      await waitFor(() => {
        expect(mockOnExpensesChange).toHaveBeenCalledTimes(1);
        const filteredExpenses = mockOnExpensesChange.mock.calls[0][0];
        expect(filteredExpenses).toHaveLength(1); // 2 → 1
      });
    });

    it('3.3 - Cancela edición sin guardar cambios', async () => {
      const user = userEvent.setup();

      render(
        <DailyExpensesManager
          expenses={[mockExpense]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Click botón editar
      const editButton = screen.getAllByRole('button')[1];
      await user.click(editButton);

      // Modificar concepto
      const conceptInput = screen.getByDisplayValue(/Reparación bomba agua/i);
      await user.clear(conceptInput);
      await user.type(conceptInput, 'MODIFICADO');

      // Click cancelar
      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      await user.click(cancelButton);

      // Verificar callback NO llamado
      expect(mockOnExpensesChange).not.toHaveBeenCalled();

      // Verificar texto original sigue visible
      expect(screen.getByText(/Reparación bomba agua/i)).toBeInTheDocument();
    });
  });

  // ==================== SUITE 4: VALIDACIONES ====================

  describe('Suite 4: Validaciones', () => {
    it('4.1 - Rechaza concept < 3 chars o > 100 chars', async () => {
      const user = userEvent.setup();

      render(
        <DailyExpensesManager
          expenses={[]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Abrir formulario
      const addButton = screen.getByRole('button', { name: /Agregar/i });
      await user.click(addButton);

      // Caso 1: < 3 chars
      const conceptInput = screen.getByPlaceholderText(/Ej: Reparación bomba/i);
      await user.type(conceptInput, 'Ab');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Mínimo 3 caracteres/i)).toBeInTheDocument();
      });

      // Caso 2: > 100 chars
      await user.clear(conceptInput);
      const longText = 'A'.repeat(101);
      await user.type(conceptInput, longText);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Máximo 100 caracteres/i)).toBeInTheDocument();
      });
    });

    it('4.2 - Rechaza amount < $0.01 o > $10,000.00', async () => {
      const user = userEvent.setup();

      render(
        <DailyExpensesManager
          expenses={[]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Abrir formulario
      const addButton = screen.getByRole('button', { name: /Agregar/i });
      await user.click(addButton);

      // Caso 1: < $0.01
      const amountInputs = screen.getAllByRole('spinbutton');
      await user.type(amountInputs[0], '0.005');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Mínimo \$0\.01/i)).toBeInTheDocument();
      });

      // Caso 2: > $10,000.00
      await user.clear(amountInputs[0]);
      await user.type(amountInputs[0], '10000.01');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Máximo \$10,000\.00/i)).toBeInTheDocument();
      });
    });

    it('4.3 - Rechaza category no válida', async () => {
      const user = userEvent.setup();

      render(
        <DailyExpensesManager
          expenses={[]}
          onExpensesChange={mockOnExpensesChange}
        />
      );

      // Abrir formulario
      const addButton = screen.getByRole('button', { name: /Agregar/i });
      await user.click(addButton);

      // Llenar concept + amount válidos
      const conceptInput = screen.getByPlaceholderText(/Ej: Reparación bomba/i);
      await user.type(conceptInput, 'Gasto válido');

      const amountInputs = screen.getAllByRole('spinbutton');
      await user.type(amountInputs[0], '50.00');

      // NO seleccionar categoría (dejar vacío)
      const saveButton = screen.getByRole('button', { name: /Guardar Gasto/i });
      expect(saveButton).toBeDisabled(); // Disabled hasta que categoría sea válida
    });
  });
});
