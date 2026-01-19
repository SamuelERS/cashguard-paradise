// 🤖 [IA] - v1.0.0: Tests exhaustivos para useWizardNavigation hook
// Fase 2F - Auditoría "Cimientos de Cristal" - Cobertura >70% para lógica de navegación wizard
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useWizardNavigation, WizardData } from '../useWizardNavigation';

describe('useWizardNavigation', () => {
  // ============================================================================
  // GRUPO 1: ESTADO INICIAL
  // ============================================================================
  describe('Estado Inicial', () => {
    it('debe inicializar en paso 1 con datos vacíos', () => {
      const { result } = renderHook(() => useWizardNavigation());

      expect(result.current.currentStep).toBe(1);
      expect(result.current.totalSteps).toBe(6);
      expect(result.current.wizardData).toEqual({
        rulesAccepted: false,
        selectedStore: '',
        selectedCashier: '',
        selectedWitness: '',
        expectedSales: '',
        dailyExpenses: [],
      });
    });

    it('debe indicar que no puede avanzar sin completar paso 1', () => {
      const { result } = renderHook(() => useWizardNavigation());

      expect(result.current.canGoNext).toBe(false);
      expect(result.current.canGoPrevious).toBe(false);
      expect(result.current.isCompleted).toBe(false);
    });

    it('debe retornar título correcto para paso 1', () => {
      const { result } = renderHook(() => useWizardNavigation());

      expect(result.current.getStepTitle()).toBe('Instrucciones Obligatorias Iniciales');
    });
  });

  // ============================================================================
  // GRUPO 2: VALIDACIÓN POR PASO
  // ============================================================================
  describe('Validación por Paso', () => {
    it('paso 1: debe validar cuando rulesAccepted es true', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Sin aceptar reglas
      expect(result.current.validateStep(1)).toBe(false);

      // Con reglas externas completadas
      expect(result.current.validateStep(1, true)).toBe(true);
    });

    it('paso 2: debe validar cuando selectedStore no está vacío', () => {
      const { result } = renderHook(() => useWizardNavigation());

      expect(result.current.validateStep(2)).toBe(false);

      act(() => {
        result.current.updateWizardData({ selectedStore: 'store-1' });
      });

      expect(result.current.validateStep(2)).toBe(true);
    });

    it('paso 3: debe validar cuando selectedCashier no está vacío', () => {
      const { result } = renderHook(() => useWizardNavigation());

      expect(result.current.validateStep(3)).toBe(false);

      act(() => {
        result.current.updateWizardData({ selectedCashier: 'cashier-1' });
      });

      expect(result.current.validateStep(3)).toBe(true);
    });

    it('paso 4: debe validar testigo diferente al cajero', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Sin testigo
      expect(result.current.validateStep(4)).toBe(false);

      // Con mismo ID que cajero
      act(() => {
        result.current.updateWizardData({
          selectedCashier: 'person-1',
          selectedWitness: 'person-1',
        });
      });
      expect(result.current.validateStep(4)).toBe(false);

      // Con testigo diferente al cajero
      act(() => {
        result.current.updateWizardData({ selectedWitness: 'person-2' });
      });
      expect(result.current.validateStep(4)).toBe(true);
    });

    it('paso 5: debe validar venta esperada como número positivo', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Sin valor
      expect(result.current.validateStep(5)).toBe(false);

      // Con texto no numérico
      act(() => {
        result.current.updateWizardData({ expectedSales: 'abc' });
      });
      expect(result.current.validateStep(5)).toBe(false);

      // Con valor cero
      act(() => {
        result.current.updateWizardData({ expectedSales: '0' });
      });
      expect(result.current.validateStep(5)).toBe(false);

      // Con valor negativo
      act(() => {
        result.current.updateWizardData({ expectedSales: '-100' });
      });
      expect(result.current.validateStep(5)).toBe(false);

      // Con valor positivo válido
      act(() => {
        result.current.updateWizardData({ expectedSales: '500.50' });
      });
      expect(result.current.validateStep(5)).toBe(true);
    });

    it('paso 6: debe ser siempre válido (gastos opcionales)', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Siempre válido sin importar datos
      expect(result.current.validateStep(6)).toBe(true);
    });

    it('debe retornar false para pasos fuera de rango', () => {
      const { result } = renderHook(() => useWizardNavigation());

      expect(result.current.validateStep(0)).toBe(false);
      expect(result.current.validateStep(7)).toBe(false);
      expect(result.current.validateStep(-1)).toBe(false);
    });
  });

  // ============================================================================
  // GRUPO 3: NAVEGACIÓN GOTONEXT
  // ============================================================================
  describe('Navegación goNext', () => {
    it('debe avanzar al paso 2 cuando paso 1 es válido con reglas externas', () => {
      const { result } = renderHook(() => useWizardNavigation());

      let advanced = false;
      act(() => {
        advanced = result.current.goNext(true); // rulesCompleted = true
      });

      expect(advanced).toBe(true);
      expect(result.current.currentStep).toBe(2);
    });

    it('no debe avanzar cuando paso actual no es válido', () => {
      const { result } = renderHook(() => useWizardNavigation());

      let advanced = false;
      act(() => {
        advanced = result.current.goNext(); // Sin reglas completadas
      });

      expect(advanced).toBe(false);
      expect(result.current.currentStep).toBe(1);
    });

    it('no debe avanzar más allá del paso 6', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Configurar todos los datos válidos
      act(() => {
        result.current.updateWizardData({
          rulesAccepted: true,
          selectedStore: 'store-1',
          selectedCashier: 'cashier-1',
          selectedWitness: 'witness-1',
          expectedSales: '500',
        });
      });

      // Navegar hasta paso 6
      for (let i = 1; i < 6; i++) {
        act(() => {
          result.current.goNext(true);
        });
      }

      expect(result.current.currentStep).toBe(6);

      // Intentar avanzar más allá
      let advanced = false;
      act(() => {
        advanced = result.current.goNext(true);
      });

      expect(advanced).toBe(false);
      expect(result.current.currentStep).toBe(6);
    });

    it('debe actualizar canGoNext después de actualizar datos', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Avanzar al paso 2
      act(() => {
        result.current.goNext(true);
      });

      // Sin store seleccionado
      expect(result.current.canGoNext).toBe(false);

      // Con store seleccionado
      act(() => {
        result.current.updateWizardData({ selectedStore: 'store-1' });
      });

      expect(result.current.canGoNext).toBe(true);
    });
  });

  // ============================================================================
  // GRUPO 4: NAVEGACIÓN GOPREVIOUS
  // ============================================================================
  describe('Navegación goPrevious', () => {
    it('no debe retroceder desde paso 1', () => {
      const { result } = renderHook(() => useWizardNavigation());

      let wentBack = false;
      act(() => {
        wentBack = result.current.goPrevious();
      });

      expect(wentBack).toBe(false);
      expect(result.current.currentStep).toBe(1);
    });

    it('debe retroceder desde paso 2 a paso 1', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Avanzar a paso 2
      act(() => {
        result.current.goNext(true);
      });
      expect(result.current.currentStep).toBe(2);

      // Retroceder
      let wentBack = false;
      act(() => {
        wentBack = result.current.goPrevious();
      });

      expect(wentBack).toBe(true);
      expect(result.current.currentStep).toBe(1);
    });

    it('canGoPrevious debe ser true desde paso 2 en adelante', () => {
      const { result } = renderHook(() => useWizardNavigation());

      expect(result.current.canGoPrevious).toBe(false);

      act(() => {
        result.current.goNext(true);
      });

      expect(result.current.canGoPrevious).toBe(true);
    });
  });

  // ============================================================================
  // GRUPO 5: NAVEGACIÓN GOTOSTEP
  // ============================================================================
  describe('Navegación goToStep', () => {
    it('no debe ir a paso menor que 1', () => {
      const { result } = renderHook(() => useWizardNavigation());

      let success = false;
      act(() => {
        success = result.current.goToStep(0);
      });

      expect(success).toBe(false);
      expect(result.current.currentStep).toBe(1);
    });

    it('no debe ir a paso mayor que totalSteps', () => {
      const { result } = renderHook(() => useWizardNavigation());

      let success = false;
      act(() => {
        success = result.current.goToStep(7);
      });

      expect(success).toBe(false);
      expect(result.current.currentStep).toBe(1);
    });

    it('debe permitir ir a un paso anterior sin validación', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Configurar datos y avanzar
      act(() => {
        result.current.updateWizardData({
          selectedStore: 'store-1',
          selectedCashier: 'cashier-1',
          selectedWitness: 'witness-1',
          expectedSales: '500',
        });
      });

      // Avanzar varios pasos - cada navegación en su propio act()
      act(() => {
        result.current.goNext(true); // 1 -> 2
      });
      act(() => {
        result.current.goNext(); // 2 -> 3
      });
      act(() => {
        result.current.goNext(); // 3 -> 4
      });
      expect(result.current.currentStep).toBe(4);

      // Ir a paso anterior
      let success = false;
      act(() => {
        success = result.current.goToStep(2);
      });

      expect(success).toBe(true);
      expect(result.current.currentStep).toBe(2);
    });

    it('no debe saltar adelante si pasos intermedios no están validados', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Intentar saltar directamente al paso 4 sin datos
      let success = false;
      act(() => {
        success = result.current.goToStep(4);
      });

      expect(success).toBe(false);
      expect(result.current.currentStep).toBe(1);
    });
  });

  // ============================================================================
  // GRUPO 6: ACTUALIZACIÓN DE DATOS
  // ============================================================================
  describe('Actualización de Datos', () => {
    it('debe actualizar datos parcialmente', () => {
      const { result } = renderHook(() => useWizardNavigation());

      act(() => {
        result.current.updateWizardData({ selectedStore: 'store-1' });
      });

      expect(result.current.wizardData.selectedStore).toBe('store-1');
      expect(result.current.wizardData.selectedCashier).toBe(''); // Sin cambios
    });

    it('debe actualizar múltiples campos a la vez', () => {
      const { result } = renderHook(() => useWizardNavigation());

      act(() => {
        result.current.updateWizardData({
          selectedStore: 'store-1',
          selectedCashier: 'cashier-1',
          expectedSales: '1000',
        });
      });

      expect(result.current.wizardData.selectedStore).toBe('store-1');
      expect(result.current.wizardData.selectedCashier).toBe('cashier-1');
      expect(result.current.wizardData.expectedSales).toBe('1000');
    });

    it('debe permitir actualizar gastos del día', () => {
      const { result } = renderHook(() => useWizardNavigation());

      const expenses = [
        {
          id: 'exp-1',
          concept: 'Limpieza',
          amount: 25,
          category: 'supplies' as const,
          hasInvoice: true,
          timestamp: new Date().toISOString(),
        },
      ];

      act(() => {
        result.current.updateWizardData({ dailyExpenses: expenses });
      });

      expect(result.current.wizardData.dailyExpenses).toHaveLength(1);
      expect(result.current.wizardData.dailyExpenses?.[0].concept).toBe('Limpieza');
    });
  });

  // ============================================================================
  // GRUPO 7: RESET DEL WIZARD
  // ============================================================================
  describe('Reset del Wizard', () => {
    it('debe resetear al estado inicial completo', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Configurar datos
      act(() => {
        result.current.updateWizardData({
          selectedStore: 'store-1',
          selectedCashier: 'cashier-1',
          selectedWitness: 'witness-1',
          expectedSales: '500',
        });
      });

      // Avanzar - cada navegación en su propio act()
      act(() => {
        result.current.goNext(true); // 1 -> 2
      });
      act(() => {
        result.current.goNext(); // 2 -> 3
      });

      expect(result.current.currentStep).toBe(3);
      expect(result.current.wizardData.selectedStore).toBe('store-1');

      // Resetear
      act(() => {
        result.current.resetWizard();
      });

      expect(result.current.currentStep).toBe(1);
      expect(result.current.wizardData).toEqual({
        rulesAccepted: false,
        selectedStore: '',
        selectedCashier: '',
        selectedWitness: '',
        expectedSales: '',
        dailyExpenses: [],
      });
    });
  });

  // ============================================================================
  // GRUPO 8: COMPLETAR WIZARD
  // ============================================================================
  describe('Completar Wizard', () => {
    it('no debe completar si faltan datos obligatorios', () => {
      const { result } = renderHook(() => useWizardNavigation());

      let completed = false;
      act(() => {
        completed = result.current.completeWizard();
      });

      expect(completed).toBe(false);
    });

    it('debe completar cuando todos los pasos son válidos', () => {
      const { result } = renderHook(() => useWizardNavigation());

      act(() => {
        result.current.updateWizardData({
          rulesAccepted: true,
          selectedStore: 'store-1',
          selectedCashier: 'cashier-1',
          selectedWitness: 'witness-1',
          expectedSales: '500',
        });
      });

      let completed = false;
      act(() => {
        completed = result.current.completeWizard();
      });

      expect(completed).toBe(true);
    });

    it('no debe completar si testigo es igual a cajero', () => {
      const { result } = renderHook(() => useWizardNavigation());

      act(() => {
        result.current.updateWizardData({
          rulesAccepted: true,
          selectedStore: 'store-1',
          selectedCashier: 'person-1',
          selectedWitness: 'person-1', // Mismo que cajero
          expectedSales: '500',
        });
      });

      let completed = false;
      act(() => {
        completed = result.current.completeWizard();
      });

      expect(completed).toBe(false);
    });
  });

  // ============================================================================
  // GRUPO 9: TÍTULOS Y DESCRIPCIONES
  // ============================================================================
  describe('Títulos y Descripciones', () => {
    it('debe retornar títulos correctos para cada paso', () => {
      const { result } = renderHook(() => useWizardNavigation());

      const expectedTitles = [
        'Instrucciones Obligatorias Iniciales',
        'Selección de Sucursal',
        'Selección de Cajero',
        'Selección de Testigo',
        'Venta Esperada Segun SICAR',
        'Gastos del Día',
      ];

      expectedTitles.forEach((title, index) => {
        expect(result.current.getCurrentStepTitle(index + 1)).toBe(title);
      });
    });

    it('debe retornar cadena vacía para paso fuera de rango', () => {
      const { result } = renderHook(() => useWizardNavigation());

      expect(result.current.getCurrentStepTitle(0)).toBe('');
      expect(result.current.getCurrentStepTitle(7)).toBe('');
    });

    it('debe actualizar título al cambiar de paso', () => {
      const { result } = renderHook(() => useWizardNavigation());

      expect(result.current.getStepTitle()).toBe('Instrucciones Obligatorias Iniciales');

      act(() => {
        result.current.goNext(true);
      });

      expect(result.current.getStepTitle()).toBe('Selección de Sucursal');
    });
  });

  // ============================================================================
  // GRUPO 10: ESTADO DE NAVEGACIÓN
  // ============================================================================
  describe('Estado de Navegación', () => {
    it('getNavigationState debe reflejar validación con reglas externas', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Sin reglas completadas
      let navState = result.current.getNavigationState(false);
      expect(navState.canGoNext).toBe(false);

      // Con reglas completadas
      navState = result.current.getNavigationState(true);
      expect(navState.canGoNext).toBe(true);
    });

    it('isCompleted debe ser true solo en paso 6 con datos válidos', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Configurar datos válidos
      act(() => {
        result.current.updateWizardData({
          rulesAccepted: true,
          selectedStore: 'store-1',
          selectedCashier: 'cashier-1',
          selectedWitness: 'witness-1',
          expectedSales: '500',
        });
      });

      // Navegar hasta paso 6
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.goNext(true);
        });
      }

      expect(result.current.currentStep).toBe(6);

      const navState = result.current.getNavigationState(true);
      expect(navState.isCompleted).toBe(true);
    });
  });

  // ============================================================================
  // GRUPO 11: CASOS EDGE
  // ============================================================================
  describe('Casos Edge', () => {
    it('debe manejar expectedSales con decimales', () => {
      const { result } = renderHook(() => useWizardNavigation());

      act(() => {
        result.current.updateWizardData({ expectedSales: '123.45' });
      });

      expect(result.current.validateStep(5)).toBe(true);
    });

    it('debe manejar expectedSales con espacios', () => {
      const { result } = renderHook(() => useWizardNavigation());

      act(() => {
        result.current.updateWizardData({ expectedSales: ' 500 ' });
      });

      // parseFloat maneja espacios automáticamente
      expect(result.current.validateStep(5)).toBe(true);
    });

    it('debe manejar expectedSales con valor muy grande', () => {
      const { result } = renderHook(() => useWizardNavigation());

      act(() => {
        result.current.updateWizardData({ expectedSales: '9999999.99' });
      });

      expect(result.current.validateStep(5)).toBe(true);
    });

    it('debe manejar gastos vacíos como array vacío', () => {
      const { result } = renderHook(() => useWizardNavigation());

      expect(result.current.wizardData.dailyExpenses).toEqual([]);
      expect(result.current.validateStep(6)).toBe(true);
    });

    it('debe preservar datos al navegar hacia atrás y adelante', () => {
      const { result } = renderHook(() => useWizardNavigation());

      // Configurar datos en paso 2
      act(() => {
        result.current.goNext(true);
        result.current.updateWizardData({ selectedStore: 'store-1' });
      });

      // Avanzar y retroceder
      act(() => {
        result.current.goNext();
        result.current.goPrevious();
      });

      // Datos deben persistir
      expect(result.current.wizardData.selectedStore).toBe('store-1');
    });
  });
});
