// 🤖 [IA] - v1.0.0: Hook para gestión de conteo de efectivo y pagos electrónicos
// Fase 2E - Auditoría "Cimientos de Cristal" - Extracción de lógica de CashCounter.tsx
import { useState, useCallback, useMemo } from 'react';
import { CashCount, ElectronicPayments } from '@/types/cash';
import { calculateCashTotal } from '@/utils/calculations';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

/**
 * Estado inicial por defecto para el conteo de efectivo
 */
export const DEFAULT_CASH_COUNT: CashCount = {
  penny: 0,
  nickel: 0,
  dime: 0,
  quarter: 0,
  dollarCoin: 0,
  bill1: 0,
  bill5: 0,
  bill10: 0,
  bill20: 0,
  bill50: 0,
  bill100: 0,
};

/**
 * Estado inicial por defecto para pagos electrónicos
 */
export const DEFAULT_ELECTRONIC_PAYMENTS: ElectronicPayments = {
  credomatic: 0,
  promerica: 0,
  bankTransfer: 0,
  paypal: 0,
};

/**
 * Props de configuración del hook
 */
export interface UseCashCountingProps {
  /** Estado inicial de efectivo (opcional) */
  initialCashCount?: Partial<CashCount>;
  /** Estado inicial de pagos electrónicos (opcional) */
  initialElectronicPayments?: Partial<ElectronicPayments>;
}

/**
 * Resultado del hook useCashCounting
 */
export interface UseCashCountingResult {
  // Estado
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;

  // Totales calculados
  totalCash: number;
  totalElectronic: number;
  totalGeneral: number;

  // Handlers
  handleCashCountChange: (denomination: keyof CashCount, value: string) => void;
  handleElectronicChange: (method: keyof ElectronicPayments, value: string) => void;

  // Acciones
  resetCashCount: () => void;
  resetElectronicPayments: () => void;
  resetAll: () => void;

  // Setters directos (para casos especiales)
  setCashCount: React.Dispatch<React.SetStateAction<CashCount>>;
  setElectronicPayments: React.Dispatch<React.SetStateAction<ElectronicPayments>>;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

/**
 * Hook para gestión centralizada del conteo de efectivo y pagos electrónicos.
 *
 * @description
 * Encapsula toda la lógica de estado y cálculos relacionados con el conteo
 * de denominaciones de efectivo (monedas y billetes) y pagos electrónicos.
 * Optimizado para evitar re-renders innecesarios mediante useMemo y useCallback.
 *
 * @example
 * ```tsx
 * const {
 *   cashCount,
 *   electronicPayments,
 *   totalCash,
 *   totalGeneral,
 *   handleCashCountChange,
 *   resetAll
 * } = useCashCounting();
 *
 * // Actualizar una denominación
 * handleCashCountChange('bill20', '5');
 *
 * // Resetear todo
 * resetAll();
 * ```
 *
 * @param props - Configuración opcional con valores iniciales
 * @returns Objeto con estado, totales calculados y handlers
 */
export function useCashCounting(props: UseCashCountingProps = {}): UseCashCountingResult {
  const { initialCashCount, initialElectronicPayments } = props;

  // ============================================================================
  // ESTADO
  // ============================================================================

  const [cashCount, setCashCount] = useState<CashCount>(() => ({
    ...DEFAULT_CASH_COUNT,
    ...initialCashCount,
  }));

  const [electronicPayments, setElectronicPayments] = useState<ElectronicPayments>(() => ({
    ...DEFAULT_ELECTRONIC_PAYMENTS,
    ...initialElectronicPayments,
  }));

  // ============================================================================
  // CÁLCULOS MEMOIZADOS
  // ============================================================================

  /**
   * Total de efectivo calculado usando la utilidad centralizada
   */
  const totalCash = useMemo(() => {
    return calculateCashTotal(cashCount);
  }, [cashCount]);

  /**
   * Total de pagos electrónicos
   */
  const totalElectronic = useMemo(() => {
    return Object.values(electronicPayments).reduce((sum, value) => sum + value, 0);
  }, [electronicPayments]);

  /**
   * Total general (efectivo + electrónico)
   */
  const totalGeneral = useMemo(() => {
    return totalCash + totalElectronic;
  }, [totalCash, totalElectronic]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Handler para actualizar el conteo de una denominación específica.
   * Parsea el valor string a número, usando 0 si el valor es inválido.
   */
  const handleCashCountChange = useCallback((
    denomination: keyof CashCount,
    value: string
  ) => {
    const numValue = parseInt(value, 10) || 0;
    setCashCount(prev => ({
      ...prev,
      [denomination]: numValue,
    }));
  }, []);

  /**
   * Handler para actualizar un método de pago electrónico.
   * Parsea el valor string a número decimal, usando 0 si el valor es inválido.
   */
  const handleElectronicChange = useCallback((
    method: keyof ElectronicPayments,
    value: string
  ) => {
    const numValue = parseFloat(value) || 0;
    setElectronicPayments(prev => ({
      ...prev,
      [method]: numValue,
    }));
  }, []);

  // ============================================================================
  // ACCIONES DE RESET
  // ============================================================================

  /**
   * Resetea el conteo de efectivo a los valores por defecto
   */
  const resetCashCount = useCallback(() => {
    setCashCount({ ...DEFAULT_CASH_COUNT });
  }, []);

  /**
   * Resetea los pagos electrónicos a los valores por defecto
   */
  const resetElectronicPayments = useCallback(() => {
    setElectronicPayments({ ...DEFAULT_ELECTRONIC_PAYMENTS });
  }, []);

  /**
   * Resetea todo el estado (efectivo y electrónico)
   */
  const resetAll = useCallback(() => {
    setCashCount({ ...DEFAULT_CASH_COUNT });
    setElectronicPayments({ ...DEFAULT_ELECTRONIC_PAYMENTS });
  }, []);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado
    cashCount,
    electronicPayments,

    // Totales
    totalCash,
    totalElectronic,
    totalGeneral,

    // Handlers
    handleCashCountChange,
    handleElectronicChange,

    // Acciones
    resetCashCount,
    resetElectronicPayments,
    resetAll,

    // Setters directos
    setCashCount,
    setElectronicPayments,
  };
}

export default useCashCounting;
