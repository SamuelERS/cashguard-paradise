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
 * 
 * @example
 * ```tsx
 * const calculations = useCalculations(
 *   cashCount,
 *   electronicPayments,
 *   parseFloat(expectedSales)
 * );
 * 
 * console.log(calculations.totalCash); // Total efectivo
 * console.log(calculations.difference); // Diferencia vs esperado
 * console.log(calculations.hasAlert); // Si hay faltante > $3
 * ```
 * 
 * @returns Objeto con todos los cálculos memoizados
 * 
 * @property {number} totalCash - Total de efectivo
 * @property {number} totalElectronic - Total de pagos electrónicos
 * @property {number} totalGeneral - Total general (efectivo + electrónico)
 * @property {number} difference - Diferencia vs venta esperada
 * @property {object} changeResult - Resultado del cálculo de cambio para $50
 * @property {boolean} hasAlert - Si hay faltante significativo (< -$3)
 * @property {boolean} isShortage - Si hay faltante
 * @property {boolean} isSurplus - Si hay sobrante
 * @property {string} timestamp - Timestamp del cálculo
 */
import { useMemo } from 'react';
import { CashCount, ElectronicPayments } from '@/types/cash';
import { calculateCashTotal, calculateChange50 } from '@/utils/calculations';

export function useCalculations(
  cashCount: CashCount,
  electronicPayments: ElectronicPayments,
  expectedSales: number
) {
  const calculations = useMemo(() => {
    const totalCash = calculateCashTotal(cashCount);
    const totalElectronic = Object.values(electronicPayments).reduce((sum, val) => sum + val, 0);
    const totalGeneral = totalCash + totalElectronic;
    const difference = totalGeneral - expectedSales;
    const changeResult = calculateChange50(cashCount);
    
    return {
      totalCash,
      totalElectronic,
      totalGeneral,
      difference,
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
  }, [cashCount, electronicPayments, expectedSales]);

  return calculations;
}