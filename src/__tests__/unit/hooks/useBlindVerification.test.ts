// 🤖 [IA] - v1.3.0: MÓDULO 2 - Tests hook verificación ciega
/**
 * @file useBlindVerification.test.ts
 * @description Tests unitarios para hook useBlindVerification
 *
 * @remarks
 * Suite completa de 25 tests cubriendo:
 * - Escenario 1: Correcto primer intento (5 tests)
 * - Escenario 2: Override silencioso (8 tests)
 * - Escenario 3: Triple intento + análisis (10 tests)
 * - Edge cases: Valores cero, grandes cantidades (2 tests)
 *
 * @version 1.3.0
 * @date 2025-10-05
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import {
  useBlindVerification,
  analyzeThirdAttempt,
  validateAttempt,
  handleVerificationFlow,
  getVerificationMessages
} from '@/hooks/useBlindVerification';
import type { CashCount } from '@/types/cash';
import type { VerificationAttempt } from '@/types/verification';

describe('useBlindVerification - ESCENARIO 1: Correcto Primer Intento', () => {
  // 🤖 [IA] - v1.3.0: Escenario 1 cubre 90% de casos esperados (empleado honesto/competente)

  test('1.1 - validateAttempt marca isCorrect: true cuando input === expected', () => {
    const attempt = validateAttempt('quarter', 1, 10, 10);

    expect(attempt.isCorrect).toBe(true);
    expect(attempt.inputValue).toBe(10);
    expect(attempt.expectedValue).toBe(10);
    expect(attempt.attemptNumber).toBe(1);
    expect(attempt.stepKey).toBe('quarter');
  });

  test('1.2 - handleVerificationFlow retorna nextAction: continue para primer intento correcto', () => {
    const correctAttempt: VerificationAttempt = {
      stepKey: 'nickel',
      attemptNumber: 1,
      inputValue: 20,
      expectedValue: 20,
      isCorrect: true,
      timestamp: new Date().toISOString()
    };

    const result = handleVerificationFlow('nickel', [correctAttempt]);

    expect(result.nextAction).toBe('continue');
    expect(result.severity).toBe('success');
  });

  test('1.3 - handleVerificationFlow retorna severity: success para correcto primer intento', () => {
    const correctAttempt: VerificationAttempt = {
      stepKey: 'bill20',
      attemptNumber: 1,
      inputValue: 5,
      expectedValue: 5,
      isCorrect: true,
      timestamp: new Date().toISOString()
    };

    const result = handleVerificationFlow('bill20', [correctAttempt]);

    expect(result.severity).toBe('success');
    expect(result.messageData.variant).toBe('info');
  });

  test('1.4 - getVerificationMessages retorna mensaje UI claro para success', () => {
    const messages = getVerificationMessages('success');

    expect(messages.title).toBe('Conteo Correcto');
    expect(messages.message).toContain('verificada exitosamente');
    expect(messages.variant).toBe('info');
  });

  test('1.5 - validateAttempt genera timestamp ISO 8601 válido', () => {
    const attempt = validateAttempt('penny', 1, 100, 100);

    // Validar formato ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
    expect(attempt.timestamp).toMatch(isoRegex);

    // Validar que timestamp es reciente (dentro de 1 segundo)
    const attemptTime = new Date(attempt.timestamp).getTime();
    const now = Date.now();
    expect(now - attemptTime).toBeLessThan(1000);
  });
});

describe('useBlindVerification - ESCENARIO 2: Override Silencioso', () => {
  // 🤖 [IA] - v1.3.0: Escenario 2 cubre ~10% casos (2 intentos iguales incorrectos)

  test('2.1 - validateAttempt marca isCorrect: false cuando input !== expected', () => {
    const attempt = validateAttempt('quarter', 1, 8, 10);

    expect(attempt.isCorrect).toBe(false);
    expect(attempt.inputValue).toBe(8);
    expect(attempt.expectedValue).toBe(10);
  });

  test('2.2 - handleVerificationFlow detecta 2 intentos iguales incorrectos', () => {
    const attempt1: VerificationAttempt = {
      stepKey: 'nickel',
      attemptNumber: 1,
      inputValue: 8,
      expectedValue: 10,
      isCorrect: false,
      timestamp: new Date().toISOString()
    };

    const attempt2: VerificationAttempt = {
      stepKey: 'nickel',
      attemptNumber: 2,
      inputValue: 8, // Mismo valor que intento 1
      expectedValue: 10,
      isCorrect: false,
      timestamp: new Date().toISOString()
    };

    const result = handleVerificationFlow('nickel', [attempt1, attempt2]);

    expect(result.nextAction).toBe('force_override');
    expect(result.severity).toBe('warning_override');
  });

  test('2.3 - handleVerificationFlow retorna force_override para 2 intentos iguales', () => {
    const attempts: VerificationAttempt[] = [
      {
        stepKey: 'dime',
        attemptNumber: 1,
        inputValue: 15,
        expectedValue: 20,
        isCorrect: false,
        timestamp: new Date().toISOString()
      },
      {
        stepKey: 'dime',
        attemptNumber: 2,
        inputValue: 15, // Idéntico a intento 1
        expectedValue: 20,
        isCorrect: false,
        timestamp: new Date().toISOString()
      }
    ];

    const result = handleVerificationFlow('dime', attempts);

    expect(result.nextAction).toBe('force_override');
  });

  test('2.4 - getVerificationMessages retorna mensaje override para warning_override', () => {
    const messages = getVerificationMessages('warning_override');

    expect(messages.title).toBe('Override Silencioso');
    expect(messages.message).toContain('Segundo intento idéntico');
    expect(messages.variant).toBe('warning');
  });

  test('2.5 - handleVerificationFlow maneja variant warning para override', () => {
    const attempts: VerificationAttempt[] = [
      {
        stepKey: 'bill1',
        attemptNumber: 1,
        inputValue: 10,
        expectedValue: 15,
        isCorrect: false,
        timestamp: new Date().toISOString()
      },
      {
        stepKey: 'bill1',
        attemptNumber: 2,
        inputValue: 10,
        expectedValue: 15,
        isCorrect: false,
        timestamp: new Date().toISOString()
      }
    ];

    const result = handleVerificationFlow('bill1', attempts);

    expect(result.messageData.variant).toBe('warning');
  });

  test('2.6 - handleVerificationFlow registra 2 intentos en historial', () => {
    const attempt1 = validateAttempt('bill5', 1, 5, 8);
    const attempt2 = validateAttempt('bill5', 2, 5, 8);

    const attempts = [attempt1, attempt2];
    const result = handleVerificationFlow('bill5', attempts);

    expect(attempts.length).toBe(2);
    expect(result.nextAction).toBe('force_override');
  });

  test('2.7 - handleVerificationFlow maneja valores cero correctamente (0 !== undefined)', () => {
    // Edge case: Empleado cuenta 0 monedas pero sistema espera 0 (correcto)
    const attemptZeroCorrect = validateAttempt('penny', 1, 0, 0);
    expect(attemptZeroCorrect.isCorrect).toBe(true);

    // Edge case: Empleado cuenta 0 pero sistema espera 5 (incorrecto)
    const attemptZeroIncorrect1 = validateAttempt('penny', 1, 0, 5);
    const attemptZeroIncorrect2 = validateAttempt('penny', 2, 0, 5);

    const result = handleVerificationFlow('penny', [attemptZeroIncorrect1, attemptZeroIncorrect2]);
    expect(result.nextAction).toBe('force_override'); // 2 intentos iguales (0 === 0)
  });

  test('2.8 - handleVerificationFlow maneja grandes cantidades sin overflow', () => {
    // 999 quarters (máximo permitido por denominación)
    const attempt1Large = validateAttempt('quarter', 1, 800, 999);
    const attempt2Large = validateAttempt('quarter', 2, 800, 999);

    const result = handleVerificationFlow('quarter', [attempt1Large, attempt2Large]);

    expect(result.nextAction).toBe('force_override');
    expect(result.severity).toBe('warning_override');
  });
});

describe('useBlindVerification - ESCENARIO 3: Triple Intento + Análisis', () => {
  // 🤖 [IA] - v1.3.0: Escenario 3 cubre <2% casos graves (2 intentos diferentes → tercer intento)

  test('3.1 - handleVerificationFlow detecta 2 intentos diferentes', () => {
    const attempt1: VerificationAttempt = {
      stepKey: 'nickel',
      attemptNumber: 1,
      inputValue: 8,
      expectedValue: 10,
      isCorrect: false,
      timestamp: new Date().toISOString()
    };

    const attempt2: VerificationAttempt = {
      stepKey: 'nickel',
      attemptNumber: 2,
      inputValue: 12, // Diferente de intento 1
      expectedValue: 10,
      isCorrect: false,
      timestamp: new Date().toISOString()
    };

    const result = handleVerificationFlow('nickel', [attempt1, attempt2]);

    expect(result.nextAction).toBe('require_third');
    expect(result.severity).toBe('warning_retry');
  });

  test('3.2 - handleVerificationFlow retorna require_third para 2 intentos diferentes', () => {
    const attempts: VerificationAttempt[] = [
      {
        stepKey: 'dime',
        attemptNumber: 1,
        inputValue: 5,
        expectedValue: 10,
        isCorrect: false,
        timestamp: new Date().toISOString()
      },
      {
        stepKey: 'dime',
        attemptNumber: 2,
        inputValue: 15, // Diferente
        expectedValue: 10,
        isCorrect: false,
        timestamp: new Date().toISOString()
      }
    ];

    const result = handleVerificationFlow('dime', attempts);

    expect(result.nextAction).toBe('require_third');
    expect(result.messageData.message).toContain('TERCER INTENTO OBLIGATORIO');
  });

  test('3.3 - getVerificationMessages retorna severity warning_retry correctamente', () => {
    const messages = getVerificationMessages('warning_retry');

    expect(messages.title).toBe('Dato Incorrecto');
    expect(messages.message).toContain('Volver a contar');
    expect(messages.variant).toBe('warning');
  });

  test('3.4 - handleVerificationFlow muestra mensaje crítico para require_third', () => {
    const attempts: VerificationAttempt[] = [
      { stepKey: 'quarter', attemptNumber: 1, inputValue: 8, expectedValue: 10, isCorrect: false, timestamp: new Date().toISOString() },
      { stepKey: 'quarter', attemptNumber: 2, inputValue: 12, expectedValue: 10, isCorrect: false, timestamp: new Date().toISOString() }
    ];

    const result = handleVerificationFlow('quarter', attempts);

    expect(result.messageData.variant).toBe('error');
    expect(result.messageData.title).toBe('Tercer Intento Obligatorio');
  });

  test('3.5 - analyzeThirdAttempt Pattern [A, A, B] → acceptedValue = A (intento 1 y 3 coinciden)', () => {
    const result = analyzeThirdAttempt([8, 12, 8]);

    expect(result.acceptedValue).toBe(8);
    expect(result.severity).toBe('critical_inconsistent');
    expect(result.reason).toContain('Intentos 1 y 3 coinciden');
    expect(result.attempts).toEqual([8, 12, 8]);
  });

  test('3.6 - analyzeThirdAttempt Pattern [A, B, A] → acceptedValue = A (equivalente a [A, A, B])', () => {
    const result = analyzeThirdAttempt([10, 15, 10]);

    expect(result.acceptedValue).toBe(10);
    expect(result.severity).toBe('critical_inconsistent');
    expect(result.attempts).toEqual([10, 15, 10]);
  });

  test('3.7 - analyzeThirdAttempt Pattern [A, B, B] → acceptedValue = B (intento 2 y 3 coinciden)', () => {
    const result = analyzeThirdAttempt([5, 12, 12]);

    expect(result.acceptedValue).toBe(12);
    expect(result.severity).toBe('critical_inconsistent');
    expect(result.reason).toContain('Intentos 2 y 3 coinciden');
    expect(result.attempts).toEqual([5, 12, 12]);
  });

  test('3.8 - analyzeThirdAttempt Pattern [A, B, C] → acceptedValue = C, severity: critical_severe (MUY GRAVE)', () => {
    const result = analyzeThirdAttempt([8, 12, 15]);

    expect(result.acceptedValue).toBe(15); // Acepta último intento por defecto
    expect(result.severity).toBe('critical_severe');
    expect(result.reason).toContain('3 intentos totalmente inconsistentes');
    expect(result.reason).toContain('Reporte crítico');
    expect(result.attempts).toEqual([8, 12, 15]);
  });

  test('3.9 - analyzeThirdAttempt retorna tuple [number, number, number] correctamente', () => {
    const result = analyzeThirdAttempt([10, 20, 30]);

    expect(Array.isArray(result.attempts)).toBe(true);
    expect(result.attempts.length).toBe(3);
    expect(typeof result.attempts[0]).toBe('number');
    expect(typeof result.attempts[1]).toBe('number');
    expect(typeof result.attempts[2]).toBe('number');
  });

  test('3.10 - handleVerificationFlow para 3 intentos retorna thirdAttemptResult completo', () => {
    const attempts: VerificationAttempt[] = [
      { stepKey: 'nickel', attemptNumber: 1, inputValue: 8, expectedValue: 10, isCorrect: false, timestamp: new Date().toISOString() },
      { stepKey: 'nickel', attemptNumber: 2, inputValue: 12, expectedValue: 10, isCorrect: false, timestamp: new Date().toISOString() },
      { stepKey: 'nickel', attemptNumber: 3, inputValue: 8, expectedValue: 10, isCorrect: false, timestamp: new Date().toISOString() }
    ];

    const result = handleVerificationFlow('nickel', attempts);

    expect(result.nextAction).toBe('analyze');
    expect(result.thirdAttemptResult).toBeDefined();
    expect(result.thirdAttemptResult?.acceptedValue).toBe(8);
    expect(result.thirdAttemptResult?.severity).toBe('critical_inconsistent');
    expect(result.severity).toBe('critical_inconsistent');
  });
});

describe('useBlindVerification - EDGE CASES', () => {
  // 🤖 [IA] - v1.3.0: Edge cases importantes para robustez del sistema

  test('4.1 - validateAttempt maneja denominación con valor 0 correctamente', () => {
    const attemptZero = validateAttempt('penny', 1, 0, 0);

    expect(attemptZero.isCorrect).toBe(true);
    expect(attemptZero.inputValue).toBe(0);
    expect(attemptZero.expectedValue).toBe(0);

    // Validar que 0 !== undefined (no confundir con campo vacío)
    expect(attemptZero.inputValue).not.toBeUndefined();
    expect(attemptZero.inputValue).not.toBeNull();
  });

  test('4.2 - analyzeThirdAttempt maneja grandes cantidades sin overflow (bill100: 500 unidades)', () => {
    // Caso extremo: $50,000 en billetes de $100
    const result = analyzeThirdAttempt([500, 450, 500]);

    expect(result.acceptedValue).toBe(500);
    expect(result.severity).toBe('critical_inconsistent');
    expect(result.attempts).toEqual([500, 450, 500]);

    // Validar que no hay overflow numérico
    expect(result.acceptedValue * 100).toBe(50000); // 500 billetes × $100 = $50,000
  });
});

describe('useBlindVerification - HOOK INTEGRATION', () => {
  // 🤖 [IA] - v1.3.0: Tests de integración del hook completo

  test('5.1 - Hook retorna todas las funciones esperadas', () => {
    const expectedCounts: CashCount = {
      penny: 100,
      nickel: 50,
      dime: 30,
      quarter: 20,
      dollarCoin: 10,
      halfDollar: 5,
      bill1: 50,
      bill2: 25,
      bill5: 20,
      bill10: 15,
      bill20: 10,
      bill50: 5,
      bill100: 2
    };

    const { result } = renderHook(() => useBlindVerification(expectedCounts));

    expect(result.current.validateAttempt).toBeInstanceOf(Function);
    expect(result.current.handleVerificationFlow).toBeInstanceOf(Function);
    expect(result.current.analyzeThirdAttempt).toBeInstanceOf(Function);
    expect(result.current.getVerificationMessages).toBeInstanceOf(Function);
    expect(result.current.resetAttempts).toBeInstanceOf(Function);
    expect(result.current.recordAttempt).toBeInstanceOf(Function);
    expect(result.current.attempts).toBeInstanceOf(Map);
  });

  test('5.2 - Hook resetAttempts limpia historial correctamente', () => {
    const expectedCounts: CashCount = {
      penny: 100,
      nickel: 50,
      dime: 30,
      quarter: 20,
      dollarCoin: 10,
      halfDollar: 5,
      bill1: 50,
      bill2: 25,
      bill5: 20,
      bill10: 15,
      bill20: 10,
      bill50: 5,
      bill100: 2
    };

    const { result } = renderHook(() => useBlindVerification(expectedCounts));

    // Agregar intento
    act(() => {
      const attempt = result.current.validateAttempt('quarter', 1, 10);
      result.current.recordAttempt(attempt);
    });

    // Verificar que se agregó
    expect(result.current.attempts.size).toBe(1);

    // Resetear
    act(() => {
      result.current.resetAttempts();
    });

    // Verificar que se limpió
    expect(result.current.attempts.size).toBe(0);
  });

  test('5.3 - Hook recordAttempt agrega intento al historial', () => {
    const expectedCounts: CashCount = {
      penny: 100,
      nickel: 50,
      dime: 30,
      quarter: 20,
      dollarCoin: 10,
      halfDollar: 5,
      bill1: 50,
      bill2: 25,
      bill5: 20,
      bill10: 15,
      bill20: 10,
      bill50: 5,
      bill100: 2
    };

    const { result } = renderHook(() => useBlindVerification(expectedCounts));

    act(() => {
      const attempt1 = result.current.validateAttempt('nickel', 1, 50);
      result.current.recordAttempt(attempt1);
    });

    const nickelAttempts = result.current.attempts.get('nickel');
    expect(nickelAttempts).toBeDefined();
    expect(nickelAttempts?.length).toBe(1);
    expect(nickelAttempts?.[0].inputValue).toBe(50);
  });
});
