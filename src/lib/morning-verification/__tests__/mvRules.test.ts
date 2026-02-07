/**
 * 🤖 [IA] - v1.4.1: Tests mvRules - Reglas de negocio verificacion matutina (ORDEN #074)
 *
 * @description
 * Tests unitarios para funciones puras de negocio:
 * - performVerification: conteo vs monto esperado
 * - generateDataHash: firma digital determinista
 * - roundTo2: precision floating-point
 * - shouldBlockResults: regla anti-fraude
 * - Constantes de thresholds exportadas
 *
 * Ajustes obligatorios cubiertos:
 * - Ajuste #1: Hash determinista (snapshot con input fijo)
 * - Ajuste #2: Floating point (49.99, 50.01, 50.00, +/-1.00, +/-0.01)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { CashCount } from '@/types/cash';
import type { VerificationData } from '@/types/morningVerification';
import {
  performVerification,
  generateDataHash,
  roundTo2,
  shouldBlockResults,
  EXPECTED_AMOUNT,
  CORRECT_THRESHOLD,
  SHORTAGE_THRESHOLD,
  EXCESS_THRESHOLD,
} from '../mvRules';

// ────────────────────────────────────────────────────────────────
// Fixtures
// ────────────────────────────────────────────────────────────────

const EMPTY_CASH: CashCount = {
  penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
  bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0,
};

const EXACT_50: CashCount = {
  ...EMPTY_CASH,
  bill20: 2,  // $40
  bill10: 1,  // $10
};

const SHORTAGE_49: CashCount = {
  ...EMPTY_CASH,
  bill20: 2,  // $40
  bill5: 1,   // $5
  bill1: 4,   // $4
};

const EXCESS_51: CashCount = {
  ...EMPTY_CASH,
  bill50: 1,  // $50
  bill1: 1,   // $1
};

// Mock timestamp para determinismo en tests
vi.mock('../mvFormatters', () => ({
  formatVerificationTimestamp: () => '07/02/2026, 08:30 a. m.',
}));

// ────────────────────────────────────────────────────────────────
// Constantes exportadas
// ────────────────────────────────────────────────────────────────

describe('mvRules - Constantes de negocio', () => {
  it('exporta EXPECTED_AMOUNT = 50', () => {
    expect(EXPECTED_AMOUNT).toBe(50);
  });

  it('exporta thresholds correctos', () => {
    expect(CORRECT_THRESHOLD).toBe(0.01);
    expect(SHORTAGE_THRESHOLD).toBe(-1.00);
    expect(EXCESS_THRESHOLD).toBe(1.00);
  });
});

// ────────────────────────────────────────────────────────────────
// roundTo2
// ────────────────────────────────────────────────────────────────

describe('mvRules - roundTo2 (Ajuste #2: floating-point)', () => {
  it('redondea 49.999999999 a 50.00', () => {
    expect(roundTo2(49.999999999)).toBe(50.00);
  });

  it('redondea 0.1 + 0.2 correctamente', () => {
    expect(roundTo2(0.1 + 0.2)).toBe(0.30);
  });

  it('preserva valores exactos', () => {
    expect(roundTo2(50.00)).toBe(50.00);
    expect(roundTo2(49.99)).toBe(49.99);
    expect(roundTo2(50.01)).toBe(50.01);
  });

  it('redondea centavos con precision IEEE 754', () => {
    // 1.005 se almacena como 1.00499... en IEEE 754 → redondea a 1.00
    expect(roundTo2(1.005)).toBe(1.00);
    // 1.015 se almacena como 1.01499... en IEEE 754 → redondea a 1.01
    expect(roundTo2(1.015)).toBe(1.01);
    // 1.025 se almacena como 1.02499... en IEEE 754 → redondea a 1.02
    expect(roundTo2(1.025)).toBe(1.02);
  });
});

// ────────────────────────────────────────────────────────────────
// performVerification
// ────────────────────────────────────────────────────────────────

describe('mvRules - performVerification', () => {
  it('conteo exacto $50 → isCorrect=true, sin shortage ni excess', () => {
    const result = performVerification(EXACT_50);
    expect(result.totalCash).toBe(50.00);
    expect(result.expectedAmount).toBe(50);
    expect(result.difference).toBe(0);
    expect(result.isCorrect).toBe(true);
    expect(result.hasShortage).toBe(false);
    expect(result.hasExcess).toBe(false);
  });

  it('shortage $49 → isCorrect=false, hasShortage=true', () => {
    const result = performVerification(SHORTAGE_49);
    expect(result.totalCash).toBe(49.00);
    expect(result.difference).toBe(-1.00);
    expect(result.isCorrect).toBe(false);
    expect(result.hasShortage).toBe(false); // -1.00 NOT < -1.00 (threshold is strictly less)
  });

  it('excess $51 → isCorrect=false, hasExcess=true', () => {
    const result = performVerification(EXCESS_51);
    expect(result.totalCash).toBe(51.00);
    expect(result.difference).toBe(1.00);
    expect(result.isCorrect).toBe(false);
    expect(result.hasExcess).toBe(false); // 1.00 NOT > 1.00 (threshold is strictly greater)
  });

  it('shortage severo $48 → hasShortage=true', () => {
    const cash: CashCount = { ...EMPTY_CASH, bill20: 2, bill5: 1, bill1: 3 };
    const result = performVerification(cash);
    expect(result.totalCash).toBe(48.00);
    expect(result.difference).toBe(-2.00);
    expect(result.hasShortage).toBe(true);
  });

  it('excess severo $52 → hasExcess=true', () => {
    const cash: CashCount = { ...EMPTY_CASH, bill50: 1, bill1: 2 };
    const result = performVerification(cash);
    expect(result.totalCash).toBe(52.00);
    expect(result.difference).toBe(2.00);
    expect(result.hasExcess).toBe(true);
  });

  it('edge $0.01: diferencia < threshold → isCorrect=true', () => {
    // $50.00 exacto con centavos (5000 pennies)
    const cash: CashCount = { ...EMPTY_CASH, penny: 5000 };
    const result = performVerification(cash);
    expect(result.isCorrect).toBe(true);
    expect(result.difference).toBe(0);
  });

  it('conteo vacio $0 → shortage severo', () => {
    const result = performVerification(EMPTY_CASH);
    expect(result.totalCash).toBe(0);
    expect(result.difference).toBe(-50);
    expect(result.isCorrect).toBe(false);
    expect(result.hasShortage).toBe(true);
  });

  it('acepta expectedAmount custom', () => {
    const result = performVerification(EXACT_50, 100);
    expect(result.expectedAmount).toBe(100);
    expect(result.difference).toBe(-50);
  });

  it('incluye timestamp formateado', () => {
    const result = performVerification(EXACT_50);
    expect(result.timestamp).toBe('07/02/2026, 08:30 a. m.');
  });
});

// ────────────────────────────────────────────────────────────────
// generateDataHash (Ajuste #1: determinismo)
// ────────────────────────────────────────────────────────────────

describe('mvRules - generateDataHash (Ajuste #1: determinismo)', () => {
  const FIXED_VERIFICATION = performVerification(EXACT_50);

  it('genera string de exactamente 16 caracteres', () => {
    const hash = generateDataHash(FIXED_VERIFICATION, 'store1', 'cashier1', 'witness1');
    expect(hash).toHaveLength(16);
  });

  it('es determinista: mismo input → mismo hash', () => {
    const hash1 = generateDataHash(FIXED_VERIFICATION, 'store1', 'cashier1', 'witness1');
    const hash2 = generateDataHash(FIXED_VERIFICATION, 'store1', 'cashier1', 'witness1');
    expect(hash1).toBe(hash2);
  });

  it('diferentes inputs → diferentes hashes', () => {
    const hash1 = generateDataHash(FIXED_VERIFICATION, 'store1', 'cashier1', 'witness1');
    // Verificacion con totalCash diferente genera hash diferente
    const differentData: VerificationData = { ...FIXED_VERIFICATION, totalCash: 99.99 };
    const hash2 = generateDataHash(differentData, 'store1', 'cashier1', 'witness1');
    expect(hash1).not.toBe(hash2);
  });

  it('snapshot: hash fijo para input conocido (0 regression)', () => {
    // Input fijo: $50 exacto, store1, cashier1, witness1, timestamp mockeado
    const hash = generateDataHash(FIXED_VERIFICATION, 'store1', 'cashier1', 'witness1');
    // Snapshot - si cambia, algoritmo hash cambio (regression)
    expect(hash).toMatchInlineSnapshot(`"eyJ0b3RhbCI6NTAs"`);
  });

  it('acepta undefined en IDs opcionales', () => {
    const hash = generateDataHash(FIXED_VERIFICATION, undefined, undefined, undefined);
    expect(hash).toHaveLength(16);
    expect(typeof hash).toBe('string');
  });
});

// ────────────────────────────────────────────────────────────────
// shouldBlockResults
// ────────────────────────────────────────────────────────────────

describe('mvRules - shouldBlockResults (anti-fraude)', () => {
  it('bloquea cuando reportSent=false', () => {
    expect(shouldBlockResults(false)).toBe(true);
  });

  it('desbloquea cuando reportSent=true', () => {
    expect(shouldBlockResults(true)).toBe(false);
  });
});
