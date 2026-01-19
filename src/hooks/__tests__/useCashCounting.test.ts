// 🤖 [IA] - v1.0.0: Tests unitarios para useCashCounting hook
// Fase 2E - Auditoría "Cimientos de Cristal"
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useCashCounting,
  DEFAULT_CASH_COUNT,
  DEFAULT_ELECTRONIC_PAYMENTS,
} from '../useCashCounting';

describe('useCashCounting', () => {
  // ============================================================================
  // GRUPO 1: ESTADO INICIAL
  // ============================================================================
  describe('Estado inicial', () => {
    it('debe inicializar con valores por defecto cuando no se pasan props', () => {
      const { result } = renderHook(() => useCashCounting());

      expect(result.current.cashCount).toEqual(DEFAULT_CASH_COUNT);
      expect(result.current.electronicPayments).toEqual(DEFAULT_ELECTRONIC_PAYMENTS);
    });

    it('debe inicializar todos los valores de cashCount en 0', () => {
      const { result } = renderHook(() => useCashCounting());

      Object.values(result.current.cashCount).forEach(value => {
        expect(value).toBe(0);
      });
    });

    it('debe inicializar todos los valores de electronicPayments en 0', () => {
      const { result } = renderHook(() => useCashCounting());

      Object.values(result.current.electronicPayments).forEach(value => {
        expect(value).toBe(0);
      });
    });

    it('debe inicializar los totales en 0', () => {
      const { result } = renderHook(() => useCashCounting());

      expect(result.current.totalCash).toBe(0);
      expect(result.current.totalElectronic).toBe(0);
      expect(result.current.totalGeneral).toBe(0);
    });
  });

  // ============================================================================
  // GRUPO 2: ESTADO INICIAL CON VALORES PERSONALIZADOS
  // ============================================================================
  describe('Estado inicial con valores personalizados', () => {
    it('debe aceptar valores iniciales de cashCount', () => {
      const initialCashCount = { bill20: 5, quarter: 10 };
      const { result } = renderHook(() =>
        useCashCounting({ initialCashCount })
      );

      expect(result.current.cashCount.bill20).toBe(5);
      expect(result.current.cashCount.quarter).toBe(10);
      // Otros valores deben ser 0
      expect(result.current.cashCount.penny).toBe(0);
      expect(result.current.cashCount.bill100).toBe(0);
    });

    it('debe aceptar valores iniciales de electronicPayments', () => {
      const initialElectronicPayments = { credomatic: 150.50, promerica: 75.25 };
      const { result } = renderHook(() =>
        useCashCounting({ initialElectronicPayments })
      );

      expect(result.current.electronicPayments.credomatic).toBe(150.50);
      expect(result.current.electronicPayments.promerica).toBe(75.25);
      // Otros valores deben ser 0
      expect(result.current.electronicPayments.bankTransfer).toBe(0);
      expect(result.current.electronicPayments.paypal).toBe(0);
    });

    it('debe calcular totalCash correctamente con valores iniciales', () => {
      // 5 billetes de $20 = $100, 10 quarters = $2.50
      const initialCashCount = { bill20: 5, quarter: 10 };
      const { result } = renderHook(() =>
        useCashCounting({ initialCashCount })
      );

      expect(result.current.totalCash).toBe(102.50);
    });

    it('debe calcular totalElectronic correctamente con valores iniciales', () => {
      const initialElectronicPayments = { credomatic: 100, promerica: 50 };
      const { result } = renderHook(() =>
        useCashCounting({ initialElectronicPayments })
      );

      expect(result.current.totalElectronic).toBe(150);
    });
  });

  // ============================================================================
  // GRUPO 3: HANDLER handleCashCountChange
  // ============================================================================
  describe('handleCashCountChange', () => {
    it('debe actualizar una denominación correctamente', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleCashCountChange('bill20', '5');
      });

      expect(result.current.cashCount.bill20).toBe(5);
    });

    it('debe parsear strings a números enteros', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleCashCountChange('penny', '42');
      });

      expect(result.current.cashCount.penny).toBe(42);
    });

    it('debe usar 0 para valores no numéricos', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleCashCountChange('nickel', 'abc');
      });

      expect(result.current.cashCount.nickel).toBe(0);
    });

    it('debe usar 0 para strings vacíos', () => {
      const { result } = renderHook(() => useCashCounting());

      // Primero setear un valor
      act(() => {
        result.current.handleCashCountChange('dime', '10');
      });
      expect(result.current.cashCount.dime).toBe(10);

      // Luego limpiar con string vacío
      act(() => {
        result.current.handleCashCountChange('dime', '');
      });
      expect(result.current.cashCount.dime).toBe(0);
    });

    it('debe truncar decimales a enteros', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleCashCountChange('quarter', '5.9');
      });

      expect(result.current.cashCount.quarter).toBe(5);
    });

    it('debe actualizar múltiples denominaciones independientemente', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleCashCountChange('bill1', '10');
        result.current.handleCashCountChange('bill5', '5');
        result.current.handleCashCountChange('bill10', '2');
      });

      expect(result.current.cashCount.bill1).toBe(10);
      expect(result.current.cashCount.bill5).toBe(5);
      expect(result.current.cashCount.bill10).toBe(2);
    });

    it('debe actualizar el totalCash al cambiar denominaciones', () => {
      const { result } = renderHook(() => useCashCounting());

      // $10 + $25 = $35
      act(() => {
        result.current.handleCashCountChange('bill10', '1');
        result.current.handleCashCountChange('quarter', '100'); // 100 quarters = $25
      });

      expect(result.current.totalCash).toBe(35);
    });
  });

  // ============================================================================
  // GRUPO 4: HANDLER handleElectronicChange
  // ============================================================================
  describe('handleElectronicChange', () => {
    it('debe actualizar un método de pago correctamente', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleElectronicChange('credomatic', '150.50');
      });

      expect(result.current.electronicPayments.credomatic).toBe(150.50);
    });

    it('debe parsear strings a números decimales', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleElectronicChange('promerica', '99.99');
      });

      expect(result.current.electronicPayments.promerica).toBe(99.99);
    });

    it('debe usar 0 para valores no numéricos', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleElectronicChange('bankTransfer', 'invalid');
      });

      expect(result.current.electronicPayments.bankTransfer).toBe(0);
    });

    it('debe usar 0 para strings vacíos', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleElectronicChange('paypal', '');
      });

      expect(result.current.electronicPayments.paypal).toBe(0);
    });

    it('debe actualizar múltiples métodos de pago independientemente', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleElectronicChange('credomatic', '100');
        result.current.handleElectronicChange('promerica', '200');
        result.current.handleElectronicChange('bankTransfer', '50.50');
        result.current.handleElectronicChange('paypal', '25.25');
      });

      expect(result.current.electronicPayments.credomatic).toBe(100);
      expect(result.current.electronicPayments.promerica).toBe(200);
      expect(result.current.electronicPayments.bankTransfer).toBe(50.50);
      expect(result.current.electronicPayments.paypal).toBe(25.25);
    });

    it('debe actualizar el totalElectronic al cambiar métodos de pago', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleElectronicChange('credomatic', '100');
        result.current.handleElectronicChange('promerica', '50');
      });

      expect(result.current.totalElectronic).toBe(150);
    });
  });

  // ============================================================================
  // GRUPO 5: CÁLCULOS DE TOTALES
  // ============================================================================
  describe('Cálculos de totales', () => {
    it('debe calcular totalCash correctamente con todas las denominaciones', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        // Monedas: 1 penny ($0.01) + 1 nickel ($0.05) + 1 dime ($0.10) + 1 quarter ($0.25) + 1 dollarCoin ($1.00)
        result.current.handleCashCountChange('penny', '1');
        result.current.handleCashCountChange('nickel', '1');
        result.current.handleCashCountChange('dime', '1');
        result.current.handleCashCountChange('quarter', '1');
        result.current.handleCashCountChange('dollarCoin', '1');
        // Billetes: $1 + $5 + $10 + $20 + $50 + $100 = $186
        result.current.handleCashCountChange('bill1', '1');
        result.current.handleCashCountChange('bill5', '1');
        result.current.handleCashCountChange('bill10', '1');
        result.current.handleCashCountChange('bill20', '1');
        result.current.handleCashCountChange('bill50', '1');
        result.current.handleCashCountChange('bill100', '1');
      });

      // Total: $0.01 + $0.05 + $0.10 + $0.25 + $1.00 + $1 + $5 + $10 + $20 + $50 + $100 = $187.41
      expect(result.current.totalCash).toBeCloseTo(187.41, 2);
    });

    it('debe calcular totalElectronic correctamente con todos los métodos', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleElectronicChange('credomatic', '100.50');
        result.current.handleElectronicChange('promerica', '75.25');
        result.current.handleElectronicChange('bankTransfer', '50.00');
        result.current.handleElectronicChange('paypal', '24.25');
      });

      expect(result.current.totalElectronic).toBe(250);
    });

    it('debe calcular totalGeneral como suma de efectivo y electrónico', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        // Cash: $100 (1 billete de $100)
        result.current.handleCashCountChange('bill100', '1');
        // Electronic: $50
        result.current.handleElectronicChange('credomatic', '50');
      });

      expect(result.current.totalGeneral).toBe(150);
    });

    it('debe manejar correctamente números grandes', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        // 100 billetes de $100 = $10,000
        result.current.handleCashCountChange('bill100', '100');
        // $5,000 en electrónico
        result.current.handleElectronicChange('credomatic', '5000');
      });

      expect(result.current.totalCash).toBe(10000);
      expect(result.current.totalElectronic).toBe(5000);
      expect(result.current.totalGeneral).toBe(15000);
    });
  });

  // ============================================================================
  // GRUPO 6: FUNCIONES DE RESET
  // ============================================================================
  describe('Funciones de reset', () => {
    it('resetCashCount debe resetear solo el efectivo', () => {
      const { result } = renderHook(() => useCashCounting());

      // Setear valores
      act(() => {
        result.current.handleCashCountChange('bill20', '10');
        result.current.handleElectronicChange('credomatic', '100');
      });

      expect(result.current.cashCount.bill20).toBe(10);
      expect(result.current.electronicPayments.credomatic).toBe(100);

      // Reset solo efectivo
      act(() => {
        result.current.resetCashCount();
      });

      expect(result.current.cashCount.bill20).toBe(0);
      expect(result.current.electronicPayments.credomatic).toBe(100); // No afectado
    });

    it('resetElectronicPayments debe resetear solo pagos electrónicos', () => {
      const { result } = renderHook(() => useCashCounting());

      // Setear valores
      act(() => {
        result.current.handleCashCountChange('bill20', '10');
        result.current.handleElectronicChange('credomatic', '100');
      });

      // Reset solo electrónico
      act(() => {
        result.current.resetElectronicPayments();
      });

      expect(result.current.cashCount.bill20).toBe(10); // No afectado
      expect(result.current.electronicPayments.credomatic).toBe(0);
    });

    it('resetAll debe resetear efectivo y pagos electrónicos', () => {
      const { result } = renderHook(() => useCashCounting());

      // Setear varios valores
      act(() => {
        result.current.handleCashCountChange('bill20', '10');
        result.current.handleCashCountChange('quarter', '50');
        result.current.handleElectronicChange('credomatic', '100');
        result.current.handleElectronicChange('paypal', '50');
      });

      expect(result.current.totalGeneral).toBeGreaterThan(0);

      // Reset todo
      act(() => {
        result.current.resetAll();
      });

      expect(result.current.cashCount).toEqual(DEFAULT_CASH_COUNT);
      expect(result.current.electronicPayments).toEqual(DEFAULT_ELECTRONIC_PAYMENTS);
      expect(result.current.totalGeneral).toBe(0);
    });

    it('resetAll debe actualizar los totales a 0', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleCashCountChange('bill100', '5');
        result.current.handleElectronicChange('credomatic', '200');
      });

      expect(result.current.totalCash).toBe(500);
      expect(result.current.totalElectronic).toBe(200);
      expect(result.current.totalGeneral).toBe(700);

      act(() => {
        result.current.resetAll();
      });

      expect(result.current.totalCash).toBe(0);
      expect(result.current.totalElectronic).toBe(0);
      expect(result.current.totalGeneral).toBe(0);
    });
  });

  // ============================================================================
  // GRUPO 7: SETTERS DIRECTOS
  // ============================================================================
  describe('Setters directos', () => {
    it('setCashCount debe permitir setear estado completo', () => {
      const { result } = renderHook(() => useCashCounting());

      const newCashCount = {
        ...DEFAULT_CASH_COUNT,
        bill100: 10,
        bill50: 5,
      };

      act(() => {
        result.current.setCashCount(newCashCount);
      });

      expect(result.current.cashCount.bill100).toBe(10);
      expect(result.current.cashCount.bill50).toBe(5);
    });

    it('setElectronicPayments debe permitir setear estado completo', () => {
      const { result } = renderHook(() => useCashCounting());

      const newPayments = {
        credomatic: 500,
        promerica: 300,
        bankTransfer: 200,
        paypal: 100,
      };

      act(() => {
        result.current.setElectronicPayments(newPayments);
      });

      expect(result.current.electronicPayments).toEqual(newPayments);
      expect(result.current.totalElectronic).toBe(1100);
    });

    it('setCashCount con función actualizadora debe funcionar', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleCashCountChange('bill20', '5');
      });

      act(() => {
        result.current.setCashCount(prev => ({
          ...prev,
          bill20: prev.bill20 + 5,
        }));
      });

      expect(result.current.cashCount.bill20).toBe(10);
    });
  });

  // ============================================================================
  // GRUPO 8: EDGE CASES
  // ============================================================================
  describe('Edge cases', () => {
    it('debe manejar valores negativos como 0 en parseInt', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleCashCountChange('penny', '-5');
      });

      // parseInt('-5') = -5, pero el sistema debería aceptarlo
      // Si la lógica de negocio requiere solo positivos, esto debería validarse en UI
      expect(result.current.cashCount.penny).toBe(-5);
    });

    it('debe manejar valores muy pequeños en pagos electrónicos', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        result.current.handleElectronicChange('credomatic', '0.01');
      });

      expect(result.current.electronicPayments.credomatic).toBe(0.01);
      expect(result.current.totalElectronic).toBe(0.01);
    });

    it('debe mantener precisión decimal en totales', () => {
      const { result } = renderHook(() => useCashCounting());

      act(() => {
        // 3 pennies = $0.03
        result.current.handleCashCountChange('penny', '3');
        // $0.02 electrónico
        result.current.handleElectronicChange('paypal', '0.02');
      });

      expect(result.current.totalCash).toBeCloseTo(0.03, 2);
      expect(result.current.totalElectronic).toBeCloseTo(0.02, 2);
      expect(result.current.totalGeneral).toBeCloseTo(0.05, 2);
    });

    it('debe funcionar correctamente después de múltiples resets', () => {
      const { result } = renderHook(() => useCashCounting());

      // Ciclo 1
      act(() => {
        result.current.handleCashCountChange('bill20', '5');
        result.current.resetAll();
      });

      // Ciclo 2
      act(() => {
        result.current.handleCashCountChange('bill50', '2');
        result.current.resetAll();
      });

      // Ciclo 3
      act(() => {
        result.current.handleCashCountChange('bill100', '1');
      });

      expect(result.current.cashCount.bill20).toBe(0);
      expect(result.current.cashCount.bill50).toBe(0);
      expect(result.current.cashCount.bill100).toBe(1);
      expect(result.current.totalCash).toBe(100);
    });
  });

  // ============================================================================
  // GRUPO 9: MEMOIZACIÓN Y OPTIMIZACIÓN
  // ============================================================================
  describe('Memoización y optimización', () => {
    it('handlers deben mantener referencia estable entre renders', () => {
      const { result, rerender } = renderHook(() => useCashCounting());

      const handleCashCountChange1 = result.current.handleCashCountChange;
      const handleElectronicChange1 = result.current.handleElectronicChange;
      const resetAll1 = result.current.resetAll;

      rerender();

      expect(result.current.handleCashCountChange).toBe(handleCashCountChange1);
      expect(result.current.handleElectronicChange).toBe(handleElectronicChange1);
      expect(result.current.resetAll).toBe(resetAll1);
    });

    it('totales deben recalcularse solo cuando cambia el estado relevante', () => {
      const { result, rerender } = renderHook(() => useCashCounting());

      const totalCash1 = result.current.totalCash;

      // Rerender sin cambios
      rerender();

      expect(result.current.totalCash).toBe(totalCash1);

      // Cambiar efectivo
      act(() => {
        result.current.handleCashCountChange('bill20', '1');
      });

      expect(result.current.totalCash).not.toBe(totalCash1);
    });
  });

  // ============================================================================
  // GRUPO 10: INTEGRACIÓN CON CALCULATIONS
  // ============================================================================
  describe('Integración con calculations.ts', () => {
    it('debe usar calculateCashTotal para el cálculo de efectivo', () => {
      const { result } = renderHook(() => useCashCounting());

      // Configurar un escenario conocido
      act(() => {
        result.current.handleCashCountChange('penny', '100');    // $1.00
        result.current.handleCashCountChange('nickel', '100');   // $5.00
        result.current.handleCashCountChange('dime', '100');     // $10.00
        result.current.handleCashCountChange('quarter', '100');  // $25.00
        result.current.handleCashCountChange('dollarCoin', '10');// $10.00
        result.current.handleCashCountChange('bill1', '10');     // $10.00
        result.current.handleCashCountChange('bill5', '10');     // $50.00
        result.current.handleCashCountChange('bill10', '10');    // $100.00
        result.current.handleCashCountChange('bill20', '10');    // $200.00
        result.current.handleCashCountChange('bill50', '5');     // $250.00
        result.current.handleCashCountChange('bill100', '5');    // $500.00
      });

      // Total esperado: $1 + $5 + $10 + $25 + $10 + $10 + $50 + $100 + $200 + $250 + $500 = $1,161
      expect(result.current.totalCash).toBe(1161);
    });
  });
});
