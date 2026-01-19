// 🤖 [IA] - v2.6.0 Phase 2G: Hook para gestión de gastos operacionales
// Fase 2G - Auditoría "Cimientos de Cristal" - Extracción de lógica de DailyExpensesManager.tsx
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import {
  DailyExpense,
  ExpenseCategory,
  isDailyExpense,
  EXPENSE_VALIDATION,
} from '@/types/expenses';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

/**
 * Estado del formulario de gastos
 */
export interface ExpenseFormData {
  concept: string;
  amount: number | undefined;
  category: ExpenseCategory | undefined;
  hasInvoice: boolean;
}

/**
 * Props de configuración del hook
 */
export interface UseExpensesManagerProps {
  /** Lista inicial de gastos */
  initialExpenses?: DailyExpense[];
  /** Callback cuando la lista cambia */
  onExpensesChange?: (expenses: DailyExpense[]) => void;
  /** Límite máximo de gastos permitidos */
  maxExpenses?: number;
}

/**
 * Resultado de validación del formulario
 */
export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Resultado del hook useExpensesManager
 */
export interface UseExpensesManagerResult {
  // Estado
  expenses: DailyExpense[];
  isAdding: boolean;
  editingId: string | null;
  formData: ExpenseFormData;
  amountInput: string;
  errors: Record<string, string>;

  // Cálculos
  totalExpenses: number;
  formattedTotal: string;
  canAddMore: boolean;
  isFormValid: boolean;

  // Handlers del formulario
  setFormConcept: (concept: string) => void;
  setFormAmount: (rawValue: string) => void;
  setFormCategory: (category: ExpenseCategory) => void;
  setFormHasInvoice: (hasInvoice: boolean) => void;
  handleAmountBlur: () => void;

  // Acciones CRUD
  openAddForm: () => void;
  handleAddExpense: () => void;
  handleEditExpense: (expense: DailyExpense) => void;
  handleUpdateExpense: () => void;
  handleDeleteExpense: (id: string, concept: string) => void;
  handleCancel: () => void;

  // Utilidades
  validateForm: () => ValidationResult;
  resetForm: () => void;
  syncExpenses: (externalExpenses: DailyExpense[]) => void;
}

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const INITIAL_FORM_DATA: ExpenseFormData = {
  concept: '',
  amount: undefined,
  category: undefined,
  hasInvoice: false,
};

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para gestión centralizada de gastos operacionales.
 *
 * @description
 * Encapsula toda la lógica de estado, validaciones y operaciones CRUD
 * para el manejo de gastos del día en el corte de caja.
 *
 * @example
 * ```tsx
 * const {
 *   expenses,
 *   formData,
 *   totalExpenses,
 *   handleAddExpense,
 *   handleDeleteExpense,
 *   isFormValid
 * } = useExpensesManager({
 *   initialExpenses: wizardData.expenses,
 *   onExpensesChange: (exp) => updateWizardData({ expenses: exp }),
 *   maxExpenses: 10
 * });
 * ```
 *
 * @param props - Configuración opcional con valores iniciales
 * @returns Objeto con estado, cálculos y handlers
 */
export function useExpensesManager(props: UseExpensesManagerProps = {}): UseExpensesManagerResult {
  const {
    initialExpenses = [],
    onExpensesChange,
    maxExpenses = 10,
  } = props;

  // ============================================================================
  // ESTADO
  // ============================================================================

  /** Lista de gastos */
  const [expenses, setExpenses] = useState<DailyExpense[]>(initialExpenses);

  /** Modo agregar/editar activo */
  const [isAdding, setIsAdding] = useState(false);

  /** ID del gasto en edición (null si agregando nuevo) */
  const [editingId, setEditingId] = useState<string | null>(null);

  /** Datos del formulario */
  const [formData, setFormData] = useState<ExpenseFormData>(INITIAL_FORM_DATA);

  /** Input temporal para permitir "44." mientras usuario escribe */
  const [amountInput, setAmountInput] = useState<string>('');

  /** Errores de validación */
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============================================================================
  // CÁLCULOS MEMOIZADOS
  // ============================================================================

  /**
   * Calcular total de gastos
   */
  const calculateTotal = useCallback((): number => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  const totalExpenses = calculateTotal();
  const formattedTotal = totalExpenses.toFixed(2);
  const canAddMore = expenses.length < maxExpenses;

  // ============================================================================
  // VALIDACIONES
  // ============================================================================

  /**
   * Validar si se puede agregar más gastos
   */
  const canAddExpense = useCallback((): boolean => {
    if (expenses.length >= maxExpenses) {
      toast.error(`⚠️ Máximo ${maxExpenses} gastos permitidos`);
      return false;
    }
    return true;
  }, [expenses.length, maxExpenses]);

  /**
   * Validar formulario
   */
  const validateForm = useCallback((): ValidationResult => {
    const newErrors: Record<string, string> = {};

    // Validar concept
    const concept = formData.concept?.trim() || '';
    if (concept.length < EXPENSE_VALIDATION.MIN_CONCEPT_LENGTH) {
      newErrors.concept = `Mínimo ${EXPENSE_VALIDATION.MIN_CONCEPT_LENGTH} caracteres`;
    } else if (concept.length > EXPENSE_VALIDATION.MAX_CONCEPT_LENGTH) {
      newErrors.concept = `Máximo ${EXPENSE_VALIDATION.MAX_CONCEPT_LENGTH} caracteres`;
    }

    // Validar amount
    if (!formData.amount || formData.amount < EXPENSE_VALIDATION.MIN_AMOUNT) {
      newErrors.amount = `Mínimo $${EXPENSE_VALIDATION.MIN_AMOUNT.toFixed(2)}`;
    } else if (formData.amount > EXPENSE_VALIDATION.MAX_AMOUNT) {
      newErrors.amount = `Máximo $${EXPENSE_VALIDATION.MAX_AMOUNT.toFixed(2)}`;
    } else {
      // Validar máximo 2 decimales
      const decimals = (formData.amount.toString().split('.')[1] || '').length;
      if (decimals > EXPENSE_VALIDATION.DECIMAL_PLACES) {
        newErrors.amount = 'Máximo 2 decimales';
      }
    }

    // Validar category
    if (!formData.category) {
      newErrors.category = 'Seleccione una categoría';
    }

    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors,
    };
  }, [formData]);

  const isFormValid = validateForm().isValid;

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Resetear formulario
   */
  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_DATA);
    setAmountInput('');
    setEditingId(null);
    setIsAdding(false);
    setErrors({});
  }, []);

  /**
   * Sincronizar gastos externos con estado interno
   */
  const syncExpenses = useCallback((externalExpenses: DailyExpense[]) => {
    setExpenses(externalExpenses);
  }, []);

  /**
   * Notificar cambio de gastos al componente padre
   */
  const notifyChange = useCallback((newExpenses: DailyExpense[]) => {
    setExpenses(newExpenses);
    onExpensesChange?.(newExpenses);
  }, [onExpensesChange]);

  // ============================================================================
  // HANDLERS DEL FORMULARIO
  // ============================================================================

  /**
   * Actualizar concepto del formulario
   */
  const setFormConcept = useCallback((concept: string) => {
    setFormData(prev => ({ ...prev, concept }));
  }, []);

  /**
   * Actualizar monto del formulario (con normalización de input)
   */
  const setFormAmount = useCallback((rawValue: string) => {
    // Normalizar comas a puntos para universalidad
    let normalizedValue = rawValue.replace(/[^0-9.,]/g, '');
    normalizedValue = normalizedValue.replace(/,/g, '.');

    // Permitir solo UN punto decimal
    const parts = normalizedValue.split('.');
    if (parts.length > 2) {
      normalizedValue = parts[0] + '.' + parts.slice(1).join('');
    }

    // Actualizar input temporal (permite "44." mientras escribe)
    setAmountInput(normalizedValue);

    // Convertir a número para validación
    if (normalizedValue === '' || normalizedValue === '.') {
      setFormData(prev => ({ ...prev, amount: undefined }));
    } else {
      const numericValue = parseFloat(normalizedValue);
      setFormData(prev => ({
        ...prev,
        amount: isNaN(numericValue) ? undefined : numericValue,
      }));
    }
  }, []);

  /**
   * Formatear monto al perder foco
   */
  const handleAmountBlur = useCallback(() => {
    if (formData.amount !== undefined) {
      setAmountInput(formData.amount.toString());
    }
  }, [formData.amount]);

  /**
   * Actualizar categoría del formulario
   */
  const setFormCategory = useCallback((category: ExpenseCategory) => {
    setFormData(prev => ({ ...prev, category }));
  }, []);

  /**
   * Actualizar estado de factura
   */
  const setFormHasInvoice = useCallback((hasInvoice: boolean) => {
    setFormData(prev => ({ ...prev, hasInvoice }));
  }, []);

  // ============================================================================
  // ACCIONES CRUD
  // ============================================================================

  /**
   * Abrir formulario para agregar nuevo gasto
   */
  const openAddForm = useCallback(() => {
    if (canAddExpense()) {
      setIsAdding(true);
    }
  }, [canAddExpense]);

  /**
   * Handler: Agregar gasto
   */
  const handleAddExpense = useCallback(() => {
    if (!canAddExpense()) return;

    const validation = validateForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('❌ Corrige los errores del formulario');
      return;
    }

    // Crear nuevo gasto
    const newExpense: DailyExpense = {
      id: crypto.randomUUID(),
      concept: formData.concept!.trim(),
      amount: formData.amount!,
      category: formData.category!,
      hasInvoice: formData.hasInvoice || false,
      timestamp: new Date().toISOString(),
    };

    // Validar con type guard
    if (!isDailyExpense(newExpense)) {
      toast.error('❌ Error al crear gasto (validación falló)');
      console.error('[useExpensesManager] isDailyExpense() failed:', newExpense);
      return;
    }

    // Actualizar lista
    const newExpenses = [...expenses, newExpense];
    notifyChange(newExpenses);

    // Feedback + reset
    toast.success(`✅ Gasto registrado: ${newExpense.concept}`);
    resetForm();
  }, [canAddExpense, validateForm, formData, expenses, notifyChange, resetForm]);

  /**
   * Handler: Editar gasto (cargar en formulario)
   */
  const handleEditExpense = useCallback((expense: DailyExpense) => {
    setFormData({
      concept: expense.concept,
      amount: expense.amount,
      category: expense.category,
      hasInvoice: expense.hasInvoice,
    });
    setAmountInput(expense.amount.toString());
    setEditingId(expense.id);
    setIsAdding(true);
    setErrors({});
  }, []);

  /**
   * Handler: Actualizar gasto
   */
  const handleUpdateExpense = useCallback(() => {
    const validation = validateForm();
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('❌ Corrige los errores del formulario');
      return;
    }

    // Mapear y actualizar
    const updatedExpenses = expenses.map((e) =>
      e.id === editingId
        ? {
            ...e,
            concept: formData.concept!.trim(),
            amount: formData.amount!,
            category: formData.category!,
            hasInvoice: formData.hasInvoice || false,
            // Preservar id + timestamp original
          }
        : e
    );

    notifyChange(updatedExpenses);

    // Feedback + reset
    toast.success('✅ Gasto actualizado');
    resetForm();
  }, [validateForm, formData, expenses, editingId, notifyChange, resetForm]);

  /**
   * Handler: Eliminar gasto
   */
  const handleDeleteExpense = useCallback((id: string, concept: string) => {
    const filteredExpenses = expenses.filter((e) => e.id !== id);
    notifyChange(filteredExpenses);
    toast.success(`🗑️ Gasto eliminado: ${concept}`);
  }, [expenses, notifyChange]);

  /**
   * Handler: Cancelar agregar/editar
   */
  const handleCancel = useCallback(() => {
    resetForm();
  }, [resetForm]);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  /**
   * Sincronizar gastos externos con estado interno cuando cambian props
   */
  useEffect(() => {
    setExpenses(initialExpenses);
  }, [initialExpenses]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado
    expenses,
    isAdding,
    editingId,
    formData,
    amountInput,
    errors,

    // Cálculos
    totalExpenses,
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

    // Utilidades
    validateForm,
    resetForm,
    syncExpenses,
  };
}

export default useExpensesManager;
