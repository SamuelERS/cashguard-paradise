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