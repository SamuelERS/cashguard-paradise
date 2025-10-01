// 🙏 Bendito sea Dios - Test de integración para useGuidedCounting hook
// 🤖 [IA] - v1.0.0: Comprehensive integration test for guided counting logic
// Cobertura: Navegación secuencial, anti-fraud lock, morning/evening modes, field states

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGuidedCounting } from '@/hooks/useGuidedCounting';
import { OperationMode } from '@/types/operation-mode';
import { CashCount, ElectronicPayments } from '@/types/cash';

/**
 * 🎯 TEST STRATEGY: Cobertura exhaustiva del cerebro del conteo guiado
 * 
 * OBJETIVOS:
 * 1. ✅ Validar flujo secuencial de navegación
 * 2. ✅ Confirmar diferencias entre modo morning vs evening
 * 3. ✅ Testear anti-fraud locking system
 * 4. ✅ Verificar estados: activo, completado, accesible
 * 5. ✅ Validar navegación backward (goPrevious)
 * 6. ✅ Confirmar field order correcto
 * 7. ✅ Testear confirmación de campos
 * 8. ✅ Validar reset de conteo
 * 9. ✅ Verificar completion detection
 * 10. ✅ Testear edge cases y boundary conditions
 * 
 * COBERTURA ESPERADA: +20% adicional - Hook crítico del sistema
 */

describe('🧮 useGuidedCounting Hook - Integration Tests (CORE)', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('🎬 Inicialización del Hook', () => {
    
    it('debe inicializar con estado correcto para modo evening (default)', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      expect(result.current.guidedState).toEqual({
        currentStep: 1,
        totalSteps: 17, // 5 monedas + 6 billetes + 4 electrónicos + 2 totales
        completedSteps: new Set(),
        isCompleted: false,
        fieldOrder: expect.arrayContaining(['penny', 'credomatic', 'totalCash', 'totalElectronic']),
        isLocked: false,
        lastElectronicStep: null
      });
      
      expect(result.current.currentField).toBe('penny');
      expect(result.current.currentFieldLabel).toBe('1 centavo');
    });

    it('debe inicializar con estado correcto para modo morning (CASH_COUNT)', () => {
      const { result } = renderHook(() => useGuidedCounting(OperationMode.CASH_COUNT));
      
      expect(result.current.guidedState.totalSteps).toBe(12); // 5 monedas + 6 billetes + 1 total
      expect(result.current.guidedState.fieldOrder).not.toContain('credomatic');
      expect(result.current.guidedState.fieldOrder).not.toContain('totalElectronic');
      expect(result.current.guidedState.fieldOrder).toContain('totalCash');
    });

    it('debe inicializar con campo penny activo', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      expect(result.current.isFieldActive('penny')).toBe(true);
      expect(result.current.isFieldActive('nickel')).toBe(false);
      expect(result.current.isFieldActive('bill1')).toBe(false);
    });

    it('debe generar texto de progreso correcto', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      expect(result.current.progressText).toBe('Paso 1 de 17');
    });

    it('debe generar texto de instrucción correcto para monedas', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      expect(result.current.instructionText).toBe('👉 Ingrese la cantidad de: 1 centavo');
    });
  });

  describe('🔢 Orden de Campos (Field Order)', () => {
    
    it('debe seguir el orden correcto para modo evening', () => {
      const { result } = renderHook(() => useGuidedCounting(OperationMode.CASH_CUT));
      
      const expectedOrder = [
        // Monedas
        'penny', 'nickel', 'dime', 'quarter', 'dollarCoin',
        // Billetes
        'bill1', 'bill5', 'bill10', 'bill20', 'bill50', 'bill100',
        // Electrónicos
        'credomatic', 'promerica', 'bankTransfer', 'paypal',
        // Totales
        'totalCash', 'totalElectronic'
      ];
      
      expect(result.current.guidedState.fieldOrder).toEqual(expectedOrder);
    });

    it('debe seguir el orden correcto para modo morning (sin electrónicos)', () => {
      const { result } = renderHook(() => useGuidedCounting(OperationMode.CASH_COUNT));
      
      const expectedOrder = [
        // Monedas
        'penny', 'nickel', 'dime', 'quarter', 'dollarCoin',
        // Billetes
        'bill1', 'bill5', 'bill10', 'bill20', 'bill50', 'bill100',
        // Total (solo cash)
        'totalCash'
      ];
      
      expect(result.current.guidedState.fieldOrder).toEqual(expectedOrder);
    });

    it('debe tener labels correctos para todos los campos', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      expect(result.current.FIELD_LABELS).toMatchObject({
        penny: '1 centavo',
        nickel: '5 centavos',
        dime: '10 centavos',
        quarter: '25 centavos',
        dollarCoin: '$1 moneda',
        bill1: '$1',
        bill5: '$5',
        bill10: '$10',
        bill20: '$20',
        bill50: '$50',
        bill100: '$100',
        credomatic: 'Credomatic',
        promerica: 'Promerica',
        bankTransfer: 'Transferencia Bancaria',
        paypal: 'PayPal',
        totalCash: 'Efectivo Total',
        totalElectronic: 'Electrónico Total'
      });
    });
  });

  describe('✅ Confirmación de Campos', () => {
    
    it('debe avanzar al confirmar campo con callback de cash', () => {
      const { result } = renderHook(() => useGuidedCounting());
      const mockOnCashChange = vi.fn();
      
      expect(result.current.currentField).toBe('penny');
      
      act(() => {
        result.current.confirmCurrentField('25', mockOnCashChange);
      });
      
      expect(mockOnCashChange).toHaveBeenCalledWith('penny', '25');
      expect(result.current.currentField).toBe('nickel');
      expect(result.current.guidedState.completedSteps.has(1)).toBe(true);
    });

    it('debe avanzar al confirmar campo electrónico con callback apropiado', () => {
      const { result } = renderHook(() => useGuidedCounting());
      const mockOnCashChange = vi.fn();
      const mockOnElectronicChange = vi.fn();
      
      // Avanzar hasta credomatic (campo 12)
      act(() => {
        for (let i = 0; i < 11; i++) {
          result.current.confirmCurrentField('0', mockOnCashChange);
        }
      });
      
      expect(result.current.currentField).toBe('credomatic');
      expect(result.current.isCurrentFieldElectronic()).toBe(true);
      
      act(() => {
        result.current.confirmCurrentField('150.50', undefined, mockOnElectronicChange);
      });
      
      expect(mockOnElectronicChange).toHaveBeenCalledWith('credomatic', '150.50');
      expect(result.current.currentField).toBe('promerica');
    });

    it('debe confirmar totalCash sin callback', () => {
      const { result } = renderHook(() => useGuidedCounting(OperationMode.CASH_COUNT));
      const mockOnCashChange = vi.fn();
      
      // Avanzar hasta totalCash (campo 12)
      act(() => {
        for (let i = 0; i < 11; i++) {
          result.current.confirmCurrentField('0', mockOnCashChange);
        }
      });
      
      expect(result.current.currentField).toBe('totalCash');
      
      act(() => {
        result.current.confirmCurrentField('', mockOnCashChange);
      });
      
      expect(result.current.guidedState.isCompleted).toBe(true);
    });

    it('debe marcar campo como completado después de confirmar', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      expect(result.current.isFieldCompleted('penny')).toBe(false);
      
      act(() => {
        result.current.confirmCurrentField('10');
      });
      
      expect(result.current.isFieldCompleted('penny')).toBe(true);
    });
  });

  describe('🔄 Navegación y Estados', () => {
    
    it('debe identificar correctamente campos activos', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      expect(result.current.isFieldActive('penny')).toBe(true);
      expect(result.current.isFieldActive('nickel')).toBe(false);
      
      act(() => {
        result.current.confirmCurrentField('5');
      });
      
      expect(result.current.isFieldActive('penny')).toBe(false);
      expect(result.current.isFieldActive('nickel')).toBe(true);
    });

    it('debe identificar correctamente campos completados', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      act(() => {
        result.current.confirmCurrentField('10');
        result.current.confirmCurrentField('5');
      });
      
      expect(result.current.isFieldCompleted('penny')).toBe(true);
      expect(result.current.isFieldCompleted('nickel')).toBe(true);
      expect(result.current.isFieldCompleted('dime')).toBe(false);
    });

    it('debe identificar correctamente campos accesibles', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      expect(result.current.isFieldAccessible('penny')).toBe(true); // activo
      expect(result.current.isFieldAccessible('nickel')).toBe(false); // no accesible
      
      act(() => {
        result.current.confirmCurrentField('10');
      });
      
      expect(result.current.isFieldAccessible('penny')).toBe(true); // completado
      expect(result.current.isFieldAccessible('nickel')).toBe(true); // activo
      expect(result.current.isFieldAccessible('dime')).toBe(false); // no accesible
    });

    it('debe detectar correctamente campos electrónicos', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      expect(result.current.isCurrentFieldElectronic()).toBe(false);
      
      // Avanzar hasta credomatic
      act(() => {
        for (let i = 0; i < 11; i++) {
          result.current.confirmCurrentField('0');
        }
      });
      
      expect(result.current.isCurrentFieldElectronic()).toBe(true);
    });

    it('debe generar instrucción especial para pagos electrónicos', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      // Avanzar hasta credomatic
      act(() => {
        for (let i = 0; i < 11; i++) {
          result.current.confirmCurrentField('0');
        }
      });
      
      expect(result.current.instructionText).toBe('💳 Ingrese el MONTO en dólares de: Credomatic');
    });
  });

  describe('⬅️ Navegación Backward (goPrevious)', () => {
    
    it('debe permitir retroceder cuando no está en el primer paso', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      act(() => {
        result.current.confirmCurrentField('10');
        result.current.confirmCurrentField('5');
      });
      
      expect(result.current.currentField).toBe('dime');
      expect(result.current.canGoPrevious()).toBe(true);
      
      act(() => {
        result.current.goPrevious();
      });
      
      expect(result.current.currentField).toBe('nickel');
      expect(result.current.isFieldCompleted('nickel')).toBe(false); // Debe volver editable
    });

    it('NO debe permitir retroceder desde el primer paso', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      expect(result.current.canGoPrevious()).toBe(false);
      
      act(() => {
        const success = result.current.goPrevious();
        expect(success).toBe(false);
      });
      
      expect(result.current.currentField).toBe('penny');
    });

    it('debe remover campo de completados al retroceder', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      act(() => {
        result.current.confirmCurrentField('10');
      });
      
      expect(result.current.isFieldCompleted('penny')).toBe(true);
      
      act(() => {
        result.current.goPrevious();
      });
      
      expect(result.current.isFieldCompleted('penny')).toBe(false);
      expect(result.current.currentField).toBe('penny');
    });

    it('NO debe permitir retroceder cuando está completado (isLocked)', () => {
      const { result } = renderHook(() => useGuidedCounting(OperationMode.CASH_COUNT));
      
      // Completar todo
      act(() => {
        for (let i = 0; i < 12; i++) {
          result.current.confirmCurrentField('0');
        }
      });
      
      expect(result.current.guidedState.isCompleted).toBe(true);
      expect(result.current.guidedState.isLocked).toBe(true);
      expect(result.current.canGoPrevious()).toBe(false);
      
      // Intentar retroceder no debe funcionar
      act(() => {
        const success = result.current.goPrevious();
        expect(success).toBe(false);
      });
      
      // Estado debe mantenerse igual
      expect(result.current.guidedState.isCompleted).toBe(true);
    });
  });

  describe('🔒 Anti-Fraud Locking System (CRÍTICO)', () => {
    
    it('debe bloquear navegación backward antes de totalCash (en bill100)', () => {
      const { result } = renderHook(() => useGuidedCounting(OperationMode.CASH_COUNT));
      
      // Avanzar hasta bill100 (campo 11)
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.confirmCurrentField('0');
        }
      });
      
      expect(result.current.currentField).toBe('bill100');
      expect(result.current.guidedState.isLocked).toBe(false);
      expect(result.current.canGoPrevious()).toBe(true);
      
      // Confirmar bill100 -> debe bloquear porque el siguiente es totalCash
      act(() => {
        result.current.confirmCurrentField('0');
      });
      
      expect(result.current.currentField).toBe('totalCash');
      expect(result.current.guidedState.isLocked).toBe(true);
      expect(result.current.canGoPrevious()).toBe(false);
    });

    it('debe bloquear navegación backward al llegar a totales en modo evening', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      // Avanzar hasta totalCash (después de paypal)
      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.confirmCurrentField('0');
        }
      });
      
      expect(result.current.currentField).toBe('totalCash');
      expect(result.current.guidedState.isLocked).toBe(true);
      expect(result.current.canGoPrevious()).toBe(false);
    });

    it('debe guardar lastElectronicStep al bloquear', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      // Avanzar hasta totalCash
      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.confirmCurrentField('0');
        }
      });
      
      expect(result.current.guidedState.lastElectronicStep).toBe(15);
    });
  });

  describe('✨ Flujo Completo (End-to-End)', () => {
    
    it('debe completar flujo completo morning mode', () => {
      const { result } = renderHook(() => useGuidedCounting(OperationMode.CASH_COUNT));
      const mockOnCashChange = vi.fn();
      
      expect(result.current.guidedState.totalSteps).toBe(12);
      
      // Completar 11 campos de efectivo
      act(() => {
        for (let i = 0; i < 11; i++) {
          result.current.confirmCurrentField('5', mockOnCashChange);
        }
      });
      
      expect(result.current.currentField).toBe('totalCash');
      expect(mockOnCashChange).toHaveBeenCalledTimes(11);
      
      // Confirmar total
      act(() => {
        result.current.confirmCurrentField('', mockOnCashChange);
      });
      
      expect(result.current.guidedState.isCompleted).toBe(true);
      expect(result.current.instructionText).toBe('✓ Conteo completado correctamente');
    });

    it('debe completar flujo completo evening mode', () => {
      const { result } = renderHook(() => useGuidedCounting(OperationMode.CASH_CUT));
      const mockOnCashChange = vi.fn();
      const mockOnElectronicChange = vi.fn();
      
      expect(result.current.guidedState.totalSteps).toBe(17);
      
      // Completar 11 campos de efectivo
      act(() => {
        for (let i = 0; i < 11; i++) {
          result.current.confirmCurrentField('0', mockOnCashChange);
        }
      });
      
      expect(result.current.currentField).toBe('credomatic');
      
      // Completar 4 campos electrónicos
      act(() => {
        for (let i = 0; i < 4; i++) {
          result.current.confirmCurrentField('100.00', undefined, mockOnElectronicChange);
        }
      });
      
      expect(result.current.currentField).toBe('totalCash');
      expect(mockOnElectronicChange).toHaveBeenCalledTimes(4);
      
      // Confirmar totales
      act(() => {
        result.current.confirmCurrentField('');
        result.current.confirmCurrentField('');
      });
      
      expect(result.current.guidedState.isCompleted).toBe(true);
    });

    it('debe actualizar progress text a medida que avanza', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      expect(result.current.progressText).toBe('Paso 1 de 17');
      
      act(() => {
        result.current.confirmCurrentField('10');
      });
      
      expect(result.current.progressText).toBe('Paso 2 de 17');
      
      act(() => {
        result.current.confirmCurrentField('5');
      });
      
      expect(result.current.progressText).toBe('Paso 3 de 17');
    });
  });

  describe('🔄 Reset y Limpieza', () => {
    
    it('debe resetear todo el estado al llamar resetGuidedCounting', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      // Avanzar varios pasos
      act(() => {
        result.current.confirmCurrentField('10');
        result.current.confirmCurrentField('5');
        result.current.confirmCurrentField('3');
      });
      
      expect(result.current.currentField).toBe('quarter');
      expect(result.current.guidedState.completedSteps.size).toBe(3);
      
      // Reset
      act(() => {
        result.current.resetGuidedCounting();
      });
      
      expect(result.current.currentField).toBe('penny');
      expect(result.current.guidedState.currentStep).toBe(1);
      expect(result.current.guidedState.completedSteps.size).toBe(0);
      expect(result.current.guidedState.isCompleted).toBe(false);
      expect(result.current.guidedState.isLocked).toBe(false);
      expect(result.current.guidedState.lastElectronicStep).toBe(null);
    });
  });

  describe('🎯 Edge Cases y Boundary Conditions', () => {
    
    it('debe manejar confirmación con valor vacío', () => {
      const { result } = renderHook(() => useGuidedCounting());
      const mockOnCashChange = vi.fn();
      
      act(() => {
        result.current.confirmCurrentField('', mockOnCashChange);
      });
      
      expect(mockOnCashChange).toHaveBeenCalledWith('penny', '');
      expect(result.current.currentField).toBe('nickel');
    });

    it('debe manejar confirmación con valor "0"', () => {
      const { result } = renderHook(() => useGuidedCounting());
      const mockOnCashChange = vi.fn();
      
      act(() => {
        result.current.confirmCurrentField('0', mockOnCashChange);
      });
      
      expect(mockOnCashChange).toHaveBeenCalledWith('penny', '0');
    });

    it('debe manejar múltiples retrocesos consecutivos', () => {
      const { result } = renderHook(() => useGuidedCounting());
      
      // Avanzar 5 pasos (hasta bill1)
      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.confirmCurrentField('0');
        }
      });
      
      expect(result.current.currentField).toBe('bill1');
      
      // Retroceder 3 veces (bill1 -> dollarCoin -> quarter -> dime)
      act(() => {
        result.current.goPrevious();
      });
      expect(result.current.currentField).toBe('dollarCoin');
      
      act(() => {
        result.current.goPrevious();
      });
      expect(result.current.currentField).toBe('quarter');
      
      act(() => {
        result.current.goPrevious();
      });
      expect(result.current.currentField).toBe('dime');
    });

    it('debe mantener currentStep en totalSteps cuando completa', () => {
      const { result } = renderHook(() => useGuidedCounting(OperationMode.CASH_COUNT));
      
      expect(result.current.guidedState.totalSteps).toBe(12);
      
      // Completar todo incluyendo totalCash
      act(() => {
        for (let i = 0; i < 12; i++) {
          result.current.confirmCurrentField('0');
        }
      });
      
      expect(result.current.guidedState.isCompleted).toBe(true);
      // currentStep se mantiene en totalSteps cuando se completa (línea 324 del hook)
      expect(result.current.guidedState.currentStep).toBe(12);
      expect(result.current.guidedState.isLocked).toBe(true);
    });
  });
});
