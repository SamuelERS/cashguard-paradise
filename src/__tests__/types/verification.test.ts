// 🤖 [IA] - v1.3.0: MÓDULO 1 - Tests para tipos verification.ts
import { describe, test, expect } from 'vitest';
import type {
  VerificationAttempt,
  VerificationSeverity,
  ThirdAttemptResult,
  VerificationBehavior
} from '@/types/verification';

describe('verification.ts - Type Safety Tests', () => {
  describe('VerificationAttempt interface', () => {
    test('should accept valid attempt object', () => {
      const validAttempt: VerificationAttempt = {
        stepKey: 'quarter',
        attemptNumber: 1,
        inputValue: 10,
        expectedValue: 10,
        isCorrect: true,
        timestamp: '2025-10-03T14:23:15.123Z'
      };

      expect(validAttempt.stepKey).toBe('quarter');
      expect(validAttempt.attemptNumber).toBe(1);
      expect(validAttempt.isCorrect).toBe(true);
    });

    test('should enforce attemptNumber literal type (1 | 2 | 3)', () => {
      const attempt: VerificationAttempt = {
        stepKey: 'nickel',
        attemptNumber: 2, // Only 1, 2, or 3 allowed
        inputValue: 5,
        expectedValue: 5,
        isCorrect: true,
        timestamp: new Date().toISOString()
      };

      expect([1, 2, 3]).toContain(attempt.attemptNumber);
    });
  });

  describe('VerificationSeverity type', () => {
    test('should allow all 5 severity levels', () => {
      const severities: VerificationSeverity[] = [
        'success',
        'warning_retry',
        'warning_override',
        'critical_inconsistent',
        'critical_severe'
      ];

      severities.forEach(severity => {
        const flag: VerificationSeverity = severity;
        expect(flag).toBeDefined();
      });
    });
  });

  describe('ThirdAttemptResult interface', () => {
    test('should handle case: attempts 1+3 match', () => {
      const result: ThirdAttemptResult = {
        acceptedValue: 8,
        severity: 'critical_inconsistent',
        reason: 'Intentos 1 y 3 coinciden (Intento 2 erróneo)',
        attempts: [8, 12, 8]
      };

      expect(result.acceptedValue).toBe(8);
      expect(result.attempts[0]).toBe(result.attempts[2]);
      expect(result.severity).toBe('critical_inconsistent');
    });

    test('should handle case: attempts 2+3 match', () => {
      const result: ThirdAttemptResult = {
        acceptedValue: 12,
        severity: 'critical_inconsistent',
        reason: 'Intentos 2 y 3 coinciden (Intento 1 erróneo)',
        attempts: [8, 12, 12]
      };

      expect(result.acceptedValue).toBe(12);
      expect(result.attempts[1]).toBe(result.attempts[2]);
    });

    test('should handle case: all 3 different (SEVERE)', () => {
      const result: ThirdAttemptResult = {
        acceptedValue: 15,
        severity: 'critical_severe',
        reason: 'Tres intentos totalmente diferentes',
        attempts: [8, 12, 15]
      };

      expect(result.severity).toBe('critical_severe');
      const [a1, a2, a3] = result.attempts;
      expect(a1).not.toBe(a2);
      expect(a2).not.toBe(a3);
      expect(a1).not.toBe(a3);
    });
  });

  describe('VerificationBehavior interface', () => {
    test('should track complete verification metrics', () => {
      const behavior: VerificationBehavior = {
        totalAttempts: 15,
        firstAttemptSuccesses: 13,
        secondAttemptSuccesses: 1,
        thirdAttemptRequired: 1,
        forcedOverrides: 0,
        criticalInconsistencies: 1,
        severeInconsistencies: 0,
        attempts: [],
        severityFlags: [],
        forcedOverridesDenoms: [],
        criticalInconsistenciesDenoms: ['quarter'],
        severeInconsistenciesDenoms: []
      };

      // Success rate = 13/15 = 86.67% (meta: >85%)
      const successRate = (behavior.firstAttemptSuccesses / behavior.totalAttempts) * 100;
      expect(successRate).toBeGreaterThan(85);
    });

    test('should contain arrays of denomination keys', () => {
      const behavior: VerificationBehavior = {
        totalAttempts: 10,
        firstAttemptSuccesses: 8,
        secondAttemptSuccesses: 0,
        thirdAttemptRequired: 2,
        forcedOverrides: 1,
        criticalInconsistencies: 1,
        severeInconsistencies: 0,
        attempts: [],
        severityFlags: [],
        forcedOverridesDenoms: ['nickel'],
        criticalInconsistenciesDenoms: ['quarter'],
        severeInconsistenciesDenoms: []
      };

      expect(behavior.forcedOverridesDenoms).toContain('nickel');
      expect(behavior.criticalInconsistenciesDenoms).toContain('quarter');
    });
  });

  describe('Type extensions compatibility', () => {
    test('VerificationAttempt stepKey should match CashCount keys', () => {
      // Smoke test: verificar que stepKey type es correcto
      const attempt: VerificationAttempt = {
        stepKey: 'fiveDollar', // Must be valid CashCount key
        attemptNumber: 1,
        inputValue: 2,
        expectedValue: 2,
        isCorrect: true,
        timestamp: new Date().toISOString()
      };

      expect(attempt.stepKey).toBe('fiveDollar');
    });
  });
});

/**
 * GRUPO DE TESTS ADICIONALES - Edge Cases
 */
describe('verification.ts - Edge Cases', () => {
  test('timestamp should be valid ISO 8601 format', () => {
    const attempt: VerificationAttempt = {
      stepKey: 'penny',
      attemptNumber: 3,
      inputValue: 100,
      expectedValue: 100,
      isCorrect: true,
      timestamp: new Date().toISOString()
    };

    // Validate ISO 8601 format
    const isValidISO = !isNaN(Date.parse(attempt.timestamp));
    expect(isValidISO).toBe(true);
  });

  test('should handle zero values correctly', () => {
    const attempt: VerificationAttempt = {
      stepKey: 'quarter',
      attemptNumber: 1,
      inputValue: 0,
      expectedValue: 0,
      isCorrect: true,
      timestamp: new Date().toISOString()
    };

    expect(attempt.inputValue).toBe(0);
    expect(attempt.isCorrect).toBe(true);
  });

  test('should handle large quantities (bulk cash)', () => {
    const attempt: VerificationAttempt = {
      stepKey: 'oneDollar',
      attemptNumber: 1,
      inputValue: 500, // 500 one-dollar bills = $500
      expectedValue: 500,
      isCorrect: true,
      timestamp: new Date().toISOString()
    };

    expect(attempt.inputValue).toBe(500);
  });

  test('ThirdAttemptResult should always have exactly 3 attempts', () => {
    const result: ThirdAttemptResult = {
      acceptedValue: 10,
      severity: 'critical_inconsistent',
      reason: 'Test reason',
      attempts: [8, 10, 10]
    };

    expect(result.attempts).toHaveLength(3);
  });
});
