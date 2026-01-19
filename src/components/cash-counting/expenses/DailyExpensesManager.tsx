// 🤖 [IA] - v2.6.0 Phase 2G: Componente UI Sistema Gastos de Caja (Refactorizado)
// Fase 2G - Auditoría "Cimientos de Cristal" - Lógica extraída a useExpensesManager hook
// Componente para registrar gastos operacionales ANTES del conteo
// Integración: Wizard Phase 1 Step 5.5 (OPCIONAL - puede omitirse)

import React from 'react';
import { Plus, Edit2, Trash2, DollarSign, Receipt } from 'lucide-react';
import {
  DailyExpense,
  ExpenseCategory,
  EXPENSE_VALIDATION,
  EXPENSE_CATEGORY_EMOJI,
  EXPENSE_CATEGORY_LABEL,
} from '@/types/expenses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useExpensesManager } from '@/hooks/useExpensesManager';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

/**
 * Props para DailyExpensesManager
 * @interface DailyExpensesManagerProps
 */
interface DailyExpensesManagerProps {
  /** Lista de gastos actual */
  expenses: DailyExpense[];
  /** Callback para actualizar lista de gastos */
  onExpensesChange: (expenses: DailyExpense[]) => void;
  /** Deshabilitar componente durante conteo */
  disabled?: boolean;
  /** Límite máximo de gastos permitidos */
  maxExpenses?: number;
}

// ============================================================================
// COMPONENTE
// ============================================================================

/**
 * Componente para gestionar gastos del día
 * Permite agregar, editar y eliminar gastos operacionales
 *
 * @component
 * @example
 * ```tsx
 * <DailyExpensesManager
 *   expenses={wizardData.expenses || []}
 *   onExpensesChange={(exp) => setWizardData({ ...wizardData, expenses: exp })}
 *   disabled={false}
 *   maxExpenses={10}
 * />
 * ```
 */
export const DailyExpensesManager: React.FC<DailyExpensesManagerProps> = ({
  expenses: externalExpenses,
  onExpensesChange,
  disabled = false,
  maxExpenses = 10,
}) => {
  // 🤖 [IA] - v2.6.0: Lógica extraída a useExpensesManager hook
  const {
    // Estado
    expenses,
    isAdding,
    editingId,
    formData,
    amountInput,
    errors,
    // Cálculos
    formattedTotal,
    canAddMore,
    isFormValid,
    // Handlers del formulario
    setFormConcept,
    setFormAmount,
    setFormCategory,
    setFormHasInvoice,
    handleAmountBlur,
    // Acciones CRUD
    openAddForm,
    handleAddExpense,
    handleEditExpense,
    handleUpdateExpense,
    handleDeleteExpense,
    handleCancel,
  } = useExpensesManager({
    initialExpenses: externalExpenses,
    onExpensesChange,
    maxExpenses,
  });

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full space-y-4">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-[#0a84ff]" />
          <h3 className="text-lg font-semibold text-[#e1e8ed]">
            Gastos del Día
            {expenses.length > 0 && (
              <span className="ml-2 text-[#8899a6]">(${formattedTotal})</span>
            )}
          </h3>
        </div>

        {!isAdding && !disabled && expenses.length > 0 && canAddMore && (
          <Button
            onClick={openAddForm}
            size="sm"
            className="bg-[#0a84ff] hover:bg-[#0070dd] text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        )}
      </div>

      {/* FORMULARIO AGREGAR/EDITAR */}
      {isAdding && (
        <Card className="p-4 space-y-4 bg-[rgba(36,36,36,0.6)] backdrop-blur-xl border-[rgba(255,255,255,0.15)]">
          <h4 className="text-base font-semibold text-[#e1e8ed]">
            {editingId ? '✏️ Editar Gasto' : '➕ Agregar Gasto'}
          </h4>

          {/* Concepto */}
          <div className="space-y-1">
            <label className="text-sm text-[#8899a6]">
              Concepto <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.concept || ''}
              onChange={(e) => setFormConcept(e.target.value)}
              placeholder="Ej: Reparación bomba de agua"
              maxLength={EXPENSE_VALIDATION.MAX_CONCEPT_LENGTH}
              disabled={disabled}
              autoFocus
              className="bg-[rgba(20,20,20,0.8)] border-[rgba(255,255,255,0.15)] text-[#e1e8ed]"
            />
            {errors.concept && (
              <p className="text-xs text-red-500">{errors.concept}</p>
            )}
            <p className="text-xs text-[#657786]">
              {EXPENSE_VALIDATION.MIN_CONCEPT_LENGTH}-{EXPENSE_VALIDATION.MAX_CONCEPT_LENGTH} caracteres
            </p>
          </div>

          {/* Monto */}
          <div className="space-y-1">
            <label className="text-sm text-[#8899a6]">
              Monto (USD) <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => setFormAmount(e.target.value)}
              onBlur={handleAmountBlur}
              placeholder="0.00"
              disabled={disabled}
              className="bg-[rgba(20,20,20,0.8)] border-[rgba(255,255,255,0.15)] text-[#e1e8ed]"
            />
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount}</p>
            )}
            <p className="text-xs text-[#657786]">
              ${EXPENSE_VALIDATION.MIN_AMOUNT.toFixed(2)} - ${EXPENSE_VALIDATION.MAX_AMOUNT.toFixed(2)}
            </p>
          </div>

          {/* Categoría */}
          <div className="space-y-1">
            <label className="text-sm text-[#8899a6]">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category || ''}
              onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
              disabled={disabled}
              className="w-full px-3 py-2 rounded-md bg-[rgba(20,20,20,0.8)] border border-[rgba(255,255,255,0.15)] text-[#e1e8ed] focus:outline-none focus:ring-2 focus:ring-[#0a84ff]"
            >
              <option value="">Seleccione categoría...</option>
              {(Object.keys(EXPENSE_CATEGORY_LABEL) as ExpenseCategory[]).map((cat) => (
                <option key={cat} value={cat}>
                  {EXPENSE_CATEGORY_EMOJI[cat]} {EXPENSE_CATEGORY_LABEL[cat]}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-500">{errors.category}</p>
            )}
          </div>

          {/* Checkbox Factura */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={formData.hasInvoice || false}
              onCheckedChange={(checked) => setFormHasInvoice(checked as boolean)}
              disabled={disabled}
            />
            <label className="text-sm text-[#8899a6] cursor-pointer select-none">
              <Receipt className="inline h-4 w-4 mr-1" />
              ¿Tiene factura?
            </label>
          </div>

          {/* Botones */}
          <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)] w-full">
            <Button
              onClick={handleCancel}
              variant="ghost"
              disabled={disabled}
              className="flex-1 min-w-0 border-[rgba(255,255,255,0.15)] text-[#8899a6] hover:bg-[rgba(255,255,255,0.05)]"
              style={{
                height: 'clamp(2.5rem, 10vw, 3rem)',
                fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
                padding: 'clamp(0.5rem, 2vw, 1rem)'
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={editingId ? handleUpdateExpense : handleAddExpense}
              disabled={disabled || !isFormValid}
              className="flex-1 min-w-0 bg-[#0a84ff] hover:bg-[#0070dd] text-white disabled:opacity-50"
              style={{
                height: 'clamp(2.5rem, 10vw, 3rem)',
                fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
                padding: 'clamp(0.5rem, 2vw, 1rem)'
              }}
            >
              {editingId ? 'Actualizar' : 'Guardar Gasto'}
            </Button>
          </div>
        </Card>
      )}

      {/* LISTA VACÍA */}
      {expenses.length === 0 && !isAdding && (
        <Card className="p-8 text-center bg-[rgba(36,36,36,0.6)] backdrop-blur-xl border-[rgba(255,255,255,0.15)]">
          <DollarSign className="h-16 w-16 mx-auto mb-4 text-[#657786]" />
          <h4 className="text-base font-semibold text-[#e1e8ed] mb-2">
            No hay gastos registrados
          </h4>
          <p className="text-sm text-[#657786] mb-4">
            Los gastos se restarán del total general
          </p>
          {!disabled && canAddMore && (
            <Button
              onClick={openAddForm}
              className="bg-[#0a84ff] hover:bg-[#0070dd] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar primer gasto
            </Button>
          )}
        </Card>
      )}

      {/* LISTA DE GASTOS */}
      {expenses.length > 0 && (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {expenses.map((expense) => (
            <Card
              key={expense.id}
              className="p-4 bg-[rgba(36,36,36,0.6)] backdrop-blur-xl border-[rgba(255,255,255,0.15)] hover:bg-[rgba(36,36,36,0.8)] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  {/* Categoría Badge */}
                  <Badge
                    variant="secondary"
                    className="bg-[rgba(10,132,255,0.2)] text-[#0a84ff] border-[rgba(10,132,255,0.3)]"
                  >
                    {EXPENSE_CATEGORY_EMOJI[expense.category]} {EXPENSE_CATEGORY_LABEL[expense.category]}
                  </Badge>

                  {/* Concepto */}
                  <h5 className="text-base font-semibold text-[#e1e8ed] line-clamp-2">
                    {expense.concept}
                  </h5>

                  {/* Monto + Factura */}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-[#0a84ff]">
                      ${expense.amount.toFixed(2)}
                    </span>
                    <span className="text-[#657786]">|</span>
                    <span className={expense.hasInvoice ? 'text-green-500' : 'text-[#657786]'}>
                      {expense.hasInvoice ? '✓' : '✗'} Factura
                    </span>
                  </div>

                  {/* Timestamp */}
                  <p className="text-xs text-[#657786]">
                    🕐 {new Date(expense.timestamp).toLocaleString('es-SV', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>

                {/* Botones Acción */}
                {!disabled && (
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleEditExpense(expense)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-[rgba(255,255,255,0.05)]"
                    >
                      <Edit2 className="h-4 w-4 text-[#8899a6]" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteExpense(expense.id, expense.concept)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 hover:bg-[rgba(239,68,68,0.1)]"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* FOOTER SUMMARY */}
      {expenses.length > 0 && (
        <Card className="p-4 bg-[rgba(36,36,36,0.8)] backdrop-blur-xl border-[rgba(255,255,255,0.15)]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[#e1e8ed]">
                📊 Total Gastos: <span className="text-[#0a84ff]">${formattedTotal}</span>
              </h4>
              <p className="text-xs text-[#657786]">
                Este monto se restará del total general
              </p>
            </div>
            <Badge
              variant="secondary"
              className="bg-[rgba(10,132,255,0.2)] text-[#0a84ff] border-[rgba(10,132,255,0.3)]"
            >
              {expenses.length}/{maxExpenses} gastos
            </Badge>
          </div>
        </Card>
      )}
    </div>
  );
};
