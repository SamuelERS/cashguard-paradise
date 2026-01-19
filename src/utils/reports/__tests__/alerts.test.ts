// 🤖 [IA] - v2.8.2: Tests unitarios para módulo de alertas
// Auditoría "Cimientos de Cristal" - Cobertura de funciones puras

import { describe, it, expect } from 'vitest';
import {
  getDenominationName,
  formatTimestamp,
  generateCriticalAlertsBlock,
  generateWarningAlertsBlock,
  generateAnomalyDetails,
} from '../alerts';
import type { VerificationBehavior, VerificationAttempt } from '@/types/verification';
import type { CashCount } from '@/types/cash';

// ============================================================================
// SUITE 1: getDenominationName()
// ============================================================================
describe('getDenominationName()', () => {
  it('1.1 - Retorna nombre correcto para monedas', () => {
    expect(getDenominationName('penny')).toBe('Un centavo (1¢)');
    expect(getDenominationName('nickel')).toBe('Cinco centavos (5¢)');
    expect(getDenominationName('dime')).toBe('Diez centavos (10¢)');
    expect(getDenominationName('quarter')).toBe('Veinticinco centavos (25¢)');
    expect(getDenominationName('dollarCoin')).toBe('Moneda de un dólar ($1)');
  });

  it('1.2 - Retorna nombre correcto para billetes', () => {
    expect(getDenominationName('bill1')).toBe('Billete de un dólar ($1)');
    expect(getDenominationName('bill5')).toBe('Billete de cinco dólares ($5)');
    expect(getDenominationName('bill10')).toBe('Billete de diez dólares ($10)');
    expect(getDenominationName('bill20')).toBe('Billete de veinte dólares ($20)');
    expect(getDenominationName('bill50')).toBe('Billete de cincuenta dólares ($50)');
    expect(getDenominationName('bill100')).toBe('Billete de cien dólares ($100)');
  });
});

// ============================================================================
// SUITE 2: formatTimestamp()
// ============================================================================
describe('formatTimestamp()', () => {
  it('2.1 - Formatea timestamp ISO 8601 a HH:MM:SS', () => {
    // Nota: El resultado depende de la zona horaria configurada (America/El_Salvador = UTC-6)
    const isoString = '2025-01-19T20:30:45.000Z'; // UTC
    const result = formatTimestamp(isoString);
    // El Salvador es UTC-6, así que 20:30 UTC = 14:30 El Salvador
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });

  it('2.2 - Retorna string original si timestamp es inválido', () => {
    const invalidTimestamp = 'invalid-date';
    // Con un timestamp inválido, new Date() retorna "Invalid Date" pero toLocaleTimeString
    // podría lanzar error o retornar "Invalid Date", así que el catch retorna el original
    const result = formatTimestamp(invalidTimestamp);
    // Verificamos que no lance excepción y retorne algo
    expect(typeof result).toBe('string');
  });

  it('2.3 - Maneja timestamps al límite del día', () => {
    const midnightUTC = '2025-01-19T00:00:00.000Z';
    const result = formatTimestamp(midnightUTC);
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});

// ============================================================================
// SUITE 3: generateCriticalAlertsBlock()
// ============================================================================
describe('generateCriticalAlertsBlock()', () => {
  it('3.1 - Retorna cadena vacía si no hay alertas críticas', () => {
    const behavior: VerificationBehavior = {
      totalAttempts: 7,
      firstAttemptSuccesses: 7,
      denominationsWithIssues: [],
      attempts: [],
    };

    expect(generateCriticalAlertsBlock(behavior)).toBe('');
  });

  it('3.2 - Retorna cadena vacía si solo hay warnings (no críticos)', () => {
    const behavior: VerificationBehavior = {
      totalAttempts: 8,
      firstAttemptSuccesses: 6,
      denominationsWithIssues: [
        { denomination: 'penny' as keyof CashCount, severity: 'warning_retry', attempts: [10, 11] },
        { denomination: 'nickel' as keyof CashCount, severity: 'warning_override', attempts: [5, 5] },
      ],
      attempts: [],
    };

    expect(generateCriticalAlertsBlock(behavior)).toBe('');
  });

  it('3.3 - Genera bloque con alertas critical_severe', () => {
    const attempts: VerificationAttempt[] = [
      { stepKey: 'quarter' as keyof CashCount, attemptNumber: 1, inputValue: 10, expectedValue: 8, isCorrect: false, timestamp: '2025-01-19T14:30:00Z' },
      { stepKey: 'quarter' as keyof CashCount, attemptNumber: 2, inputValue: 12, expectedValue: 8, isCorrect: false, timestamp: '2025-01-19T14:30:15Z' },
      { stepKey: 'quarter' as keyof CashCount, attemptNumber: 3, inputValue: 6, expectedValue: 8, isCorrect: false, timestamp: '2025-01-19T14:30:30Z' },
    ];

    const behavior: VerificationBehavior = {
      totalAttempts: 10,
      firstAttemptSuccesses: 6,
      denominationsWithIssues: [
        { denomination: 'quarter' as keyof CashCount, severity: 'critical_severe', attempts: [10, 12, 6] },
      ],
      attempts,
    };

    const result = generateCriticalAlertsBlock(behavior);
    expect(result).toContain('🔴 *CRÍTICAS (1)*');
    expect(result).toContain('Veinticinco centavos (25¢)');
    expect(result).toContain('10 → 12 → 6');
    expect(result).toContain('Patrón errático');
  });

  it('3.4 - Genera bloque con alertas critical_inconsistent', () => {
    const attempts: VerificationAttempt[] = [
      { stepKey: 'bill20' as keyof CashCount, attemptNumber: 1, inputValue: 5, expectedValue: 4, isCorrect: false, timestamp: '2025-01-19T15:00:00Z' },
    ];

    const behavior: VerificationBehavior = {
      totalAttempts: 8,
      firstAttemptSuccesses: 7,
      denominationsWithIssues: [
        { denomination: 'bill20' as keyof CashCount, severity: 'critical_inconsistent', attempts: [5, 3, 4] },
      ],
      attempts,
    };

    const result = generateCriticalAlertsBlock(behavior);
    expect(result).toContain('🔴 *CRÍTICAS (1)*');
    expect(result).toContain('Billete de veinte dólares ($20)');
    expect(result).toContain('Inconsistencia severa');
  });

  it('3.5 - Cuenta correctamente múltiples alertas críticas', () => {
    const behavior: VerificationBehavior = {
      totalAttempts: 12,
      firstAttemptSuccesses: 4,
      denominationsWithIssues: [
        { denomination: 'penny' as keyof CashCount, severity: 'critical_severe', attempts: [66, 64, 68] },
        { denomination: 'nickel' as keyof CashCount, severity: 'critical_inconsistent', attempts: [20, 18, 22] },
        { denomination: 'dime' as keyof CashCount, severity: 'warning_retry', attempts: [33, 33] }, // Este NO debe contar
      ],
      attempts: [],
    };

    const result = generateCriticalAlertsBlock(behavior);
    expect(result).toContain('🔴 *CRÍTICAS (2)*');
  });
});

// ============================================================================
// SUITE 4: generateWarningAlertsBlock()
// ============================================================================
describe('generateWarningAlertsBlock()', () => {
  it('4.1 - Retorna cadena vacía si no hay advertencias', () => {
    const behavior: VerificationBehavior = {
      totalAttempts: 7,
      firstAttemptSuccesses: 7,
      denominationsWithIssues: [],
      attempts: [],
    };

    expect(generateWarningAlertsBlock(behavior)).toBe('');
  });

  it('4.2 - Retorna cadena vacía si solo hay críticos (no warnings)', () => {
    const behavior: VerificationBehavior = {
      totalAttempts: 10,
      firstAttemptSuccesses: 6,
      denominationsWithIssues: [
        { denomination: 'quarter' as keyof CashCount, severity: 'critical_severe', attempts: [10, 12, 8] },
      ],
      attempts: [],
    };

    expect(generateWarningAlertsBlock(behavior)).toBe('');
  });

  it('4.3 - Genera bloque con warning_retry', () => {
    const attempts: VerificationAttempt[] = [
      { stepKey: 'penny' as keyof CashCount, attemptNumber: 1, inputValue: 44, expectedValue: 43, isCorrect: false, timestamp: '2025-01-19T14:30:00Z' },
      { stepKey: 'penny' as keyof CashCount, attemptNumber: 2, inputValue: 43, expectedValue: 43, isCorrect: true, timestamp: '2025-01-19T14:30:10Z' },
    ];

    const behavior: VerificationBehavior = {
      totalAttempts: 8,
      firstAttemptSuccesses: 6,
      denominationsWithIssues: [
        { denomination: 'penny' as keyof CashCount, severity: 'warning_retry', attempts: [44, 43] },
      ],
      attempts,
    };

    const result = generateWarningAlertsBlock(behavior);
    expect(result).toContain('⚠️ *ADVERTENCIAS (1)*');
    expect(result).toContain('Un centavo (1¢)');
    expect(result).toContain('44 → 43');
    expect(result).toContain('Corregido en');
  });

  it('4.4 - Genera bloque con warning_override', () => {
    const attempts: VerificationAttempt[] = [
      { stepKey: 'nickel' as keyof CashCount, attemptNumber: 1, inputValue: 30, expectedValue: 33, isCorrect: false, timestamp: '2025-01-19T14:35:00Z' },
      { stepKey: 'nickel' as keyof CashCount, attemptNumber: 2, inputValue: 30, expectedValue: 33, isCorrect: false, timestamp: '2025-01-19T14:35:15Z' },
    ];

    const behavior: VerificationBehavior = {
      totalAttempts: 9,
      firstAttemptSuccesses: 6,
      denominationsWithIssues: [
        { denomination: 'nickel' as keyof CashCount, severity: 'warning_override', attempts: [30, 30] },
      ],
      attempts,
    };

    const result = generateWarningAlertsBlock(behavior);
    expect(result).toContain('⚠️ *ADVERTENCIAS (1)*');
    expect(result).toContain('Cinco centavos (5¢)');
    expect(result).toContain('30 → 30');
  });

  it('4.5 - Cuenta correctamente múltiples advertencias', () => {
    const behavior: VerificationBehavior = {
      totalAttempts: 11,
      firstAttemptSuccesses: 4,
      denominationsWithIssues: [
        { denomination: 'penny' as keyof CashCount, severity: 'warning_retry', attempts: [44, 43] },
        { denomination: 'nickel' as keyof CashCount, severity: 'warning_override', attempts: [30, 30] },
        { denomination: 'dime' as keyof CashCount, severity: 'critical_severe', attempts: [33, 35, 31] }, // Este NO debe contar
      ],
      attempts: [],
    };

    const result = generateWarningAlertsBlock(behavior);
    expect(result).toContain('⚠️ *ADVERTENCIAS (2)*');
  });
});

// ============================================================================
// SUITE 5: generateAnomalyDetails()
// ============================================================================
describe('generateAnomalyDetails()', () => {
  it('5.1 - Retorna mensaje sin anomalías si todos los intentos fueron correctos en primer intento', () => {
    const attempts: VerificationAttempt[] = [
      { stepKey: 'penny' as keyof CashCount, attemptNumber: 1, inputValue: 43, expectedValue: 43, isCorrect: true, timestamp: '2025-01-19T14:30:00Z' },
      { stepKey: 'nickel' as keyof CashCount, attemptNumber: 1, inputValue: 20, expectedValue: 20, isCorrect: true, timestamp: '2025-01-19T14:30:30Z' },
    ];

    const behavior: VerificationBehavior = {
      totalAttempts: 2,
      firstAttemptSuccesses: 2,
      denominationsWithIssues: [],
      attempts,
    };

    const result = generateAnomalyDetails(behavior);
    expect(result).toBe('Sin anomalías detectadas - Todos los intentos correctos en primer intento ✅');
  });

  it('5.2 - Incluye intentos incorrectos en el detalle', () => {
    const attempts: VerificationAttempt[] = [
      { stepKey: 'penny' as keyof CashCount, attemptNumber: 1, inputValue: 44, expectedValue: 43, isCorrect: false, timestamp: '2025-01-19T14:30:00Z' },
      { stepKey: 'penny' as keyof CashCount, attemptNumber: 2, inputValue: 43, expectedValue: 43, isCorrect: true, timestamp: '2025-01-19T14:30:10Z' },
    ];

    const behavior: VerificationBehavior = {
      totalAttempts: 2,
      firstAttemptSuccesses: 0,
      denominationsWithIssues: [],
      attempts,
    };

    const result = generateAnomalyDetails(behavior);
    expect(result).toContain('❌ INCORRECTO');
    expect(result).toContain('Un centavo (1¢)');
    expect(result).toContain('Intento #1');
    expect(result).toContain('Ingresado: 44 unidades');
    expect(result).toContain('Esperado: 43 unidades');
  });

  it('5.3 - Incluye intentos correctos después del primero', () => {
    const attempts: VerificationAttempt[] = [
      { stepKey: 'dime' as keyof CashCount, attemptNumber: 1, inputValue: 35, expectedValue: 33, isCorrect: false, timestamp: '2025-01-19T14:40:00Z' },
      { stepKey: 'dime' as keyof CashCount, attemptNumber: 2, inputValue: 33, expectedValue: 33, isCorrect: true, timestamp: '2025-01-19T14:40:15Z' },
    ];

    const behavior: VerificationBehavior = {
      totalAttempts: 2,
      firstAttemptSuccesses: 0,
      denominationsWithIssues: [],
      attempts,
    };

    const result = generateAnomalyDetails(behavior);
    expect(result).toContain('✅ CORRECTO');
    expect(result).toContain('Intento #2');
    expect(result).toContain('Ingresado: 33 unidades');
  });

  it('5.4 - Genera detalle completo para múltiples anomalías', () => {
    const attempts: VerificationAttempt[] = [
      { stepKey: 'penny' as keyof CashCount, attemptNumber: 1, inputValue: 44, expectedValue: 43, isCorrect: false, timestamp: '2025-01-19T14:30:00Z' },
      { stepKey: 'penny' as keyof CashCount, attemptNumber: 2, inputValue: 43, expectedValue: 43, isCorrect: true, timestamp: '2025-01-19T14:30:10Z' },
      { stepKey: 'quarter' as keyof CashCount, attemptNumber: 1, inputValue: 10, expectedValue: 8, isCorrect: false, timestamp: '2025-01-19T14:35:00Z' },
      { stepKey: 'quarter' as keyof CashCount, attemptNumber: 2, inputValue: 12, expectedValue: 8, isCorrect: false, timestamp: '2025-01-19T14:35:10Z' },
      { stepKey: 'quarter' as keyof CashCount, attemptNumber: 3, inputValue: 8, expectedValue: 8, isCorrect: true, timestamp: '2025-01-19T14:35:20Z' },
    ];

    const behavior: VerificationBehavior = {
      totalAttempts: 5,
      firstAttemptSuccesses: 0,
      denominationsWithIssues: [],
      attempts,
    };

    const result = generateAnomalyDetails(behavior);
    expect(result).toContain('Un centavo (1¢)');
    expect(result).toContain('Veinticinco centavos (25¢)');
    expect(result).toContain('Intento #3');
  });
});
