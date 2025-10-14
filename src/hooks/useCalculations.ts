// 🤖 [IA] - v1.4.0 FASE 2: Hook actualizado con soporte gastos del día
/**
 * Hook para cálculos del corte de caja
 *
 * @description
 * Hook que realiza todos los cálculos necesarios para el corte de caja usando useMemo
 * para optimización. Calcula totales, diferencias, cambio y genera alertas automáticamente.
 *
 * @param {CashCount} cashCount - Conteo de efectivo (monedas y billetes)
 * @param {ElectronicPayments} electronicPayments - Pagos electrónicos
 * @param {number} expectedSales - Venta esperada según SICAR
 * @param {DailyExpense[]} expenses - Gastos del día (opcional, default: [])
 *
 * @example
 * ```tsx
 * const calculations = useCalculations(
 *   cashCount,
 *   electronicPayments,
 *   parseFloat(expectedSales),
 *   expenses
 * );
 *
 * console.log(calculations.totalCash); // Total efectivo
 * console.log(calculations.totalExpenses); // Total gastos
 * console.log(calculations.totalAdjusted); // Total ajustado (totalGeneral - gastos)
 * console.log(calculations.difference); // Diferencia vs esperado
 * console.log(calculations.hasAlert); // Si hay faltante > $3
 * ```
 *
 * @returns Objeto con todos los cálculos memoizados
 *
 * @property {number} totalCash - Total de efectivo
 * @property {number} totalElectronic - Total de pagos electrónicos
 * @property {number} totalGeneral - Total general (efectivo + electrónico)
 * @property {number} totalExpenses - Total de gastos del día
 * @property {number} totalAdjusted - Total ajustado (totalGeneral - totalExpenses)
 * @property {number} difference - Diferencia vs venta esperada (usando totalAdjusted)
 * @property {object} changeResult - Resultado del cálculo de cambio para $50
 * @property {boolean} hasAlert - Si hay faltante significativo (< -$3)
 * @property {boolean} isShortage - Si hay faltante
 * @property {boolean} isSurplus - Si hay sobrante
 * @property {string} timestamp - Timestamp del cálculo
 */
import { useMemo } from 'react';
import { CashCount, ElectronicPayments } from '@/types/cash';
import { DailyExpense } from '@/types/expenses';
import { calculateCashTotal, calculateChange50 } from '@/utils/calculations';

export function useCalculations(
  cashCount: CashCount,
  electronicPayments: ElectronicPayments,
  expectedSales: number,
  expenses: DailyExpense[] = []
) {
  const calculations = useMemo(() => {
    const totalCash = calculateCashTotal(cashCount);
    const totalElectronic = Object.values(electronicPayments).reduce((sum, val) => sum + val, 0);
    const totalGeneral = totalCash + totalElectronic;

    // 🤖 [IA] - v1.4.0 FASE 2: Calcular total gastos
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

    // 🤖 [IA] - v1.4.0 FASE 2: Total ajustado = totalGeneral - gastos
    // Ecuación financiera: totalAdjusted = (efectivo + electrónico) - gastos
    const totalAdjusted = totalGeneral - totalExpenses;

    // 🤖 [IA] - v1.4.0 FASE 2: Diferencia usa totalAdjusted (NO totalGeneral)
    const difference = totalAdjusted - expectedSales;
    const changeResult = calculateChange50(cashCount);

    return {
      totalCash,
      totalElectronic,
      totalGeneral,
      totalExpenses, // ← NUEVO
      totalAdjusted, // ← NUEVO
      difference, // ← Ahora usa totalAdjusted
      changeResult,
      hasAlert: difference < -3.00,
      isShortage: difference < 0,
      isSurplus: difference > 0,
      timestamp: new Date().toLocaleString('es-SV', {
        timeZone: 'America/El_Salvador',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
  }, [cashCount, electronicPayments, expectedSales, expenses]); // ← expenses agregado a deps

  return calculations;
}