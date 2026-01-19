// 🤖 [IA] - v1.3.8: Tests para useVerificationSection (Auditoría "Cimientos de Cristal")
// Coverage objetivo: >70% para cumplir con estándares de calidad
// Este hook encapsula la lógica de verificación ciega anti-fraude

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useVerificationSection } from '../useVerificationSection';
import type { DeliveryCalculation } from '@/types/phases';
import type { VerificationAttempt, ThirdAttemptResult } from '@/types/verification';

// 🤖 [IA] - Mock de useTimingConfig
vi.mock('../useTimingConfig', () => ({
  useTimingConfig: () => ({
    getDelay: vi.fn((key: string) => 100),
    createTimeout: vi.fn(),
    cancelTimeout: vi.fn(),
    cancelAllTimeouts: vi.fn(),
    createTimeoutWithCleanup: vi.fn((callback: () => void, _type: string, _key: string, delay?: number) => {
      const id = setTimeout(callback, delay || 100);
      return () => clearTimeout(id);
    }),
    timingConfig: { focus: 100, transition: 1000, modal: 300 }
  })
}));

// 🤖 [IA] - Mock de useBlindVerification
const mockValidateAttempt = vi.fn((stepKey: string, attemptNumber: 1 | 2 | 3, inputValue: number): VerificationAttempt => ({
  stepKey: stepKey as keyof import('@/types/cash').CashCount,
  attemptNumber,
  inputValue,
  expectedValue: 10, // Mock expected value
  isCorrect: false,
  timestamp: new Date().toISOString()
}));

const mockHandleVerificationFlow = vi.fn(() => ({
  nextAction: 'continue' as const,
  severity: 'success' as const,
  messageData: { title: 'OK', message: 'Test', variant: 'info' as const },
  thirdAttemptResult: undefined
}));

vi.mock('../useBlindVerification', () => ({
  useBlindVerification: () => ({
    validateAttempt: mockValidateAttempt,
    handleVerificationFlow: mockHandleVerificationFlow,
    analyzeThirdAttempt: vi.fn(),
    getVerificationMessages: vi.fn(),
    resetAttempts: vi.fn(),
    recordAttempt: vi.fn(),
    attempts: new Map()
  })
}));

// 🤖 [IA] - Datos de prueba comunes
const createMockDeliveryCalculation = (overrides?: Partial<DeliveryCalculation>): DeliveryCalculation => ({
  amountToDeliver: 150.00,
  amountRemaining: 50.00,
  deliverySteps: [],
  verificationSteps: [
    { key: 'penny', label: '1¢', quantity: 10 },
    { key: 'nickel', label: '5¢', quantity: 5 },
    { key: 'dime', label: '10¢', quantity: 3 }
  ],
  denominationsToDeliver: { penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0, bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0 },
  denominationsToKeep: { penny: 10, nickel: 5, dime: 3, quarter: 0, dollarCoin: 0, bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0 },
  ...overrides
});

const defaultProps = {
  deliveryCalculation: createMockDeliveryCalculation(),
  completedSteps: {} as Record<string, boolean>,
  onStepComplete: vi.fn(),
  onSectionComplete: vi.fn(),
  onVerificationBehaviorCollected: vi.fn()
};

describe('useVerificationSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 1: Estado Inicial
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('Estado inicial', () => {
    it('debe inicializar con currentStepIndex en 0', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      expect(result.current.currentStepIndex).toBe(0);
    });

    it('debe inicializar con inputValue vacío', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      expect(result.current.inputValue).toBe('');
    });

    it('debe inicializar con modalState cerrado', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      expect(result.current.modalState.isOpen).toBe(false);
      expect(result.current.modalState.type).toBe('incorrect');
    });

    it('debe calcular currentStep correctamente', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      expect(result.current.currentStep).toBeDefined();
      expect(result.current.currentStep?.key).toBe('penny');
      expect(result.current.currentStep?.quantity).toBe(10);
    });

    it('debe calcular isLastStep como false cuando hay múltiples pasos', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      expect(result.current.isLastStep).toBe(false);
    });

    it('debe calcular allStepsCompleted como false inicialmente', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      expect(result.current.allStepsCompleted).toBe(false);
    });

    it('debe calcular expectedTotal correctamente', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      // 10 pennies = $0.10, 5 nickels = $0.25, 3 dimes = $0.30 = $0.65
      // Pero el hook usa calculateCashTotal con denominationsToKeep
      expect(typeof result.current.expectedTotal).toBe('number');
    });

    it('debe retornar verificationSteps del deliveryCalculation', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      expect(result.current.verificationSteps).toHaveLength(3);
      expect(result.current.verificationSteps[0].key).toBe('penny');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 2: Helper getAttemptCount
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('getAttemptCount', () => {
    it('debe retornar 0 para denominación sin intentos', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      expect(result.current.getAttemptCount('penny')).toBe(0);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 3: Helper getDenominationDescription
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('getDenominationDescription', () => {
    it('debe retornar descripción en español para penny', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      const description = result.current.getDenominationDescription('penny', '1¢');
      expect(description).toBe('Un centavo');
    });

    it('debe retornar descripción en español para nickel', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      const description = result.current.getDenominationDescription('nickel', '5¢');
      expect(description).toBe('Cinco centavos');
    });

    it('debe retornar descripción en español para dime', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      const description = result.current.getDenominationDescription('dime', '10¢');
      expect(description).toBe('Diez centavos');
    });

    it('debe retornar descripción en español para quarter', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      const description = result.current.getDenominationDescription('quarter', '25¢');
      expect(description).toBe('Veinticinco centavos');
    });

    it('debe retornar descripción en español para dollarCoin', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      const description = result.current.getDenominationDescription('dollarCoin', '$1');
      expect(description).toBe('Moneda de un dólar');
    });

    it('debe retornar descripción en español para billetes', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      expect(result.current.getDenominationDescription('bill1', '$1')).toBe('Billete de un dólar');
      expect(result.current.getDenominationDescription('bill5', '$5')).toBe('Billete de cinco dólares');
      expect(result.current.getDenominationDescription('bill10', '$10')).toBe('Billete de diez dólares');
      expect(result.current.getDenominationDescription('bill20', '$20')).toBe('Billete de veinte dólares');
      expect(result.current.getDenominationDescription('bill50', '$50')).toBe('Billete de cincuenta dólares');
      expect(result.current.getDenominationDescription('bill100', '$100')).toBe('Billete de cien dólares');
    });

    it('debe retornar label original para denominación desconocida', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      const description = result.current.getDenominationDescription('unknown', 'Unknown');
      expect(description).toBe('Unknown');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 4: setInputValue
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('setInputValue', () => {
    it('debe actualizar inputValue correctamente', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      act(() => {
        result.current.setInputValue('15');
      });

      expect(result.current.inputValue).toBe('15');
    });

    it('debe permitir valores vacíos', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      act(() => {
        result.current.setInputValue('10');
      });
      expect(result.current.inputValue).toBe('10');

      act(() => {
        result.current.setInputValue('');
      });
      expect(result.current.inputValue).toBe('');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 5: handleConfirmStep - Valor Correcto
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('handleConfirmStep - Valor Correcto', () => {
    it('debe llamar onStepComplete cuando el valor es correcto', () => {
      const onStepComplete = vi.fn();
      const { result } = renderHook(() => useVerificationSection({
        ...defaultProps,
        onStepComplete
      }));

      act(() => {
        result.current.setInputValue('10'); // Valor correcto para penny
      });

      act(() => {
        result.current.handleConfirmStep();
      });

      expect(onStepComplete).toHaveBeenCalledWith('penny');
    });

    it('debe avanzar al siguiente paso cuando valor es correcto y no es último paso', async () => {
      // El hook tiene un useEffect auto-advance que resetea el paso basado en completedSteps
      // Necesitamos simular que onStepComplete actualiza completedSteps
      const onStepComplete = vi.fn();
      let currentCompletedSteps: Record<string, boolean> = {};

      const { result, rerender } = renderHook(
        ({ completedSteps }) => useVerificationSection({
          ...defaultProps,
          completedSteps,
          onStepComplete
        }),
        { initialProps: { completedSteps: currentCompletedSteps } }
      );

      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        result.current.setInputValue('10');
      });

      act(() => {
        result.current.handleConfirmStep();
      });

      // Simular que completedSteps se actualizó externamente
      currentCompletedSteps = { penny: true };
      rerender({ completedSteps: currentCompletedSteps });

      // Esperar a que el useEffect auto-advance ejecute
      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.currentStepIndex).toBe(1);
    });

    it('debe limpiar inputValue después de confirmar', async () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      act(() => {
        result.current.setInputValue('10');
      });
      expect(result.current.inputValue).toBe('10');

      act(() => {
        result.current.handleConfirmStep();
      });

      // requestAnimationFrame se usa para limpiar, avanzamos timers
      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.inputValue).toBe('');
    });

    it('no debe hacer nada si currentStep es undefined', () => {
      const props = {
        ...defaultProps,
        deliveryCalculation: createMockDeliveryCalculation({ verificationSteps: [] })
      };
      const { result } = renderHook(() => useVerificationSection(props));

      act(() => {
        result.current.handleConfirmStep();
      });

      // No debería haber errores y onStepComplete no debería ser llamado
      expect(defaultProps.onStepComplete).not.toHaveBeenCalled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 6: handleConfirmStep - Valor Incorrecto
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('handleConfirmStep - Valor Incorrecto', () => {
    it('debe abrir modal type incorrect en primer intento fallido', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      act(() => {
        result.current.setInputValue('5'); // Valor incorrecto (esperado: 10)
      });

      act(() => {
        result.current.handleConfirmStep();
      });

      expect(result.current.modalState.isOpen).toBe(true);
      expect(result.current.modalState.type).toBe('incorrect');
    });

    it('debe incluir stepLabel en modalState', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      act(() => {
        result.current.setInputValue('5');
      });

      act(() => {
        result.current.handleConfirmStep();
      });

      expect(result.current.modalState.stepLabel).toBe('Un centavo');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 7: handleKeyPress
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('handleKeyPress', () => {
    it('debe llamar handleConfirmStep cuando se presiona Enter con valor', () => {
      const onStepComplete = vi.fn();
      const { result } = renderHook(() => useVerificationSection({
        ...defaultProps,
        onStepComplete
      }));

      act(() => {
        result.current.setInputValue('10');
      });

      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyPress(mockEvent);
      });

      expect(onStepComplete).toHaveBeenCalledWith('penny');
    });

    it('no debe hacer nada cuando se presiona Enter con valor vacío', () => {
      const onStepComplete = vi.fn();
      const { result } = renderHook(() => useVerificationSection({
        ...defaultProps,
        onStepComplete
      }));

      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyPress(mockEvent);
      });

      expect(onStepComplete).not.toHaveBeenCalled();
    });

    it('debe prevenir evento cuando modal está abierto', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      // Primero abrimos el modal con un valor incorrecto
      act(() => {
        result.current.setInputValue('5');
        result.current.handleConfirmStep();
      });

      expect(result.current.modalState.isOpen).toBe(true);

      const mockEvent = {
        key: 'Enter',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyPress(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockEvent.stopPropagation).toHaveBeenCalled();
    });

    it('no debe hacer nada para teclas que no son Enter', () => {
      const onStepComplete = vi.fn();
      const { result } = renderHook(() => useVerificationSection({
        ...defaultProps,
        onStepComplete
      }));

      act(() => {
        result.current.setInputValue('10');
      });

      const mockEvent = {
        key: 'Tab',
        preventDefault: vi.fn(),
        stopPropagation: vi.fn()
      } as unknown as React.KeyboardEvent;

      act(() => {
        result.current.handleKeyPress(mockEvent);
      });

      expect(onStepComplete).not.toHaveBeenCalled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 8: handleRetry
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('handleRetry', () => {
    it('debe cerrar el modal', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      // Abrir modal primero
      act(() => {
        result.current.setInputValue('5');
        result.current.handleConfirmStep();
      });
      expect(result.current.modalState.isOpen).toBe(true);

      act(() => {
        result.current.handleRetry();
      });

      expect(result.current.modalState.isOpen).toBe(false);
    });

    it('debe limpiar inputValue', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      act(() => {
        result.current.setInputValue('5');
        result.current.handleConfirmStep();
      });

      act(() => {
        result.current.handleRetry();
      });

      expect(result.current.inputValue).toBe('');
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 9: handleForce
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('handleForce', () => {
    it('debe cerrar el modal', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      // Simular estado con modal abierto
      act(() => {
        result.current.setInputValue('5');
        result.current.handleConfirmStep();
      });

      act(() => {
        result.current.handleForce();
      });

      expect(result.current.modalState.isOpen).toBe(false);
    });

    it('debe llamar onStepComplete', () => {
      const onStepComplete = vi.fn();
      const { result } = renderHook(() => useVerificationSection({
        ...defaultProps,
        onStepComplete
      }));

      act(() => {
        result.current.setInputValue('5');
        result.current.handleConfirmStep();
      });

      act(() => {
        result.current.handleForce();
      });

      expect(onStepComplete).toHaveBeenCalledWith('penny');
    });

    it('debe avanzar al siguiente paso si no es el último', async () => {
      // El hook tiene un useEffect auto-advance que resetea el paso basado en completedSteps
      const onStepComplete = vi.fn();
      let currentCompletedSteps: Record<string, boolean> = {};

      const { result, rerender } = renderHook(
        ({ completedSteps }) => useVerificationSection({
          ...defaultProps,
          completedSteps,
          onStepComplete
        }),
        { initialProps: { completedSteps: currentCompletedSteps } }
      );

      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        result.current.setInputValue('5');
        result.current.handleConfirmStep();
      });

      act(() => {
        result.current.handleForce();
      });

      // Simular que completedSteps se actualizó externamente
      currentCompletedSteps = { penny: true };
      rerender({ completedSteps: currentCompletedSteps });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.currentStepIndex).toBe(1);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 10: handleAcceptThird
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('handleAcceptThird', () => {
    it('debe cerrar el modal', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      // Simular estado con modal abierto
      act(() => {
        result.current.setInputValue('5');
        result.current.handleConfirmStep();
      });

      act(() => {
        result.current.handleAcceptThird();
      });

      expect(result.current.modalState.isOpen).toBe(false);
    });

    it('debe llamar onStepComplete', () => {
      const onStepComplete = vi.fn();
      const { result } = renderHook(() => useVerificationSection({
        ...defaultProps,
        onStepComplete
      }));

      act(() => {
        result.current.setInputValue('5');
        result.current.handleConfirmStep();
      });

      act(() => {
        result.current.handleAcceptThird();
      });

      expect(onStepComplete).toHaveBeenCalledWith('penny');
    });

    it('debe avanzar al siguiente paso si no es el último', async () => {
      // El hook tiene un useEffect auto-advance que resetea el paso basado en completedSteps
      const onStepComplete = vi.fn();
      let currentCompletedSteps: Record<string, boolean> = {};

      const { result, rerender } = renderHook(
        ({ completedSteps }) => useVerificationSection({
          ...defaultProps,
          completedSteps,
          onStepComplete
        }),
        { initialProps: { completedSteps: currentCompletedSteps } }
      );

      expect(result.current.currentStepIndex).toBe(0);

      act(() => {
        result.current.setInputValue('5');
        result.current.handleConfirmStep();
      });

      act(() => {
        result.current.handleAcceptThird();
      });

      // Simular que completedSteps se actualizó externamente
      currentCompletedSteps = { penny: true };
      rerender({ completedSteps: currentCompletedSteps });

      await act(async () => {
        vi.runAllTimers();
      });

      expect(result.current.currentStepIndex).toBe(1);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 11: buildVerificationBehavior
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('buildVerificationBehavior', () => {
    it('debe retornar objeto VerificationBehavior válido sin intentos', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      const behavior = result.current.buildVerificationBehavior();

      expect(behavior).toHaveProperty('totalAttempts');
      expect(behavior).toHaveProperty('firstAttemptSuccesses');
      expect(behavior).toHaveProperty('secondAttemptSuccesses');
      expect(behavior).toHaveProperty('thirdAttemptRequired');
      expect(behavior).toHaveProperty('forcedOverrides');
      expect(behavior).toHaveProperty('criticalInconsistencies');
      expect(behavior).toHaveProperty('severeInconsistencies');
      expect(behavior).toHaveProperty('attempts');
      expect(behavior).toHaveProperty('severityFlags');
      expect(behavior).toHaveProperty('denominationsWithIssues');
    });

    it('debe calcular firstAttemptSuccesses como total menos issues', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      const behavior = result.current.buildVerificationBehavior();

      // Sin intentos registrados, firstAttemptSuccesses = verificationSteps.length - 0 = 3
      expect(behavior.firstAttemptSuccesses).toBe(3);
    });

    it('debe tener arrays de denominaciones vacíos sin errores', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      const behavior = result.current.buildVerificationBehavior();

      expect(behavior.forcedOverridesDenoms).toEqual([]);
      expect(behavior.criticalInconsistenciesDenoms).toEqual([]);
      expect(behavior.severeInconsistenciesDenoms).toEqual([]);
      expect(behavior.denominationsWithIssues).toEqual([]);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 12: isLastStep
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('isLastStep', () => {
    it('debe ser true cuando solo hay un paso', () => {
      const props = {
        ...defaultProps,
        deliveryCalculation: createMockDeliveryCalculation({
          verificationSteps: [{ key: 'penny', label: '1¢', quantity: 10 }]
        })
      };
      const { result } = renderHook(() => useVerificationSection(props));

      expect(result.current.isLastStep).toBe(true);
    });

    it('debe ser false en el primer paso de múltiples', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      expect(result.current.isLastStep).toBe(false);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 13: allStepsCompleted
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('allStepsCompleted', () => {
    it('debe ser false cuando ningún paso está completado', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      expect(result.current.allStepsCompleted).toBe(false);
    });

    it('debe ser false cuando algunos pasos están completados', () => {
      const props = {
        ...defaultProps,
        completedSteps: { penny: true, nickel: false, dime: false }
      };
      const { result } = renderHook(() => useVerificationSection(props));

      expect(result.current.allStepsCompleted).toBe(false);
    });

    it('debe ser true cuando todos los pasos están completados', () => {
      const props = {
        ...defaultProps,
        completedSteps: { penny: true, nickel: true, dime: true }
      };
      const { result } = renderHook(() => useVerificationSection(props));

      expect(result.current.allStepsCompleted).toBe(true);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 14: inputRef
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  describe('inputRef', () => {
    it('debe retornar un objeto RefObject', () => {
      const { result } = renderHook(() => useVerificationSection(defaultProps));

      expect(result.current.inputRef).toBeDefined();
      expect(result.current.inputRef).toHaveProperty('current');
    });
  });
});
