// > [IA] - v1.4.0: Sistema de Gastos de Caja - Tests de types
// Objetivo: Validar DailyExpense interface, isDailyExpense guard y constantes

import { describe, it, expect } from 'vitest';
import {
  type DailyExpense,
  type ExpenseCategory,
  isDailyExpense,
  EXPENSE_VALIDATION,
  EXPENSE_CATEGORY_EMOJI,
  EXPENSE_CATEGORY_LABEL,
} from '../expenses';

describe('expenses.ts - Types y Guards', () => {
  // SUITE 1: isDailyExpense() - Valido (2 tests)
  describe('isDailyExpense() - Casos validos', () => {
    it('1.1 - Valida DailyExpense con estructura completa correcta', () => {
      const validExpense: DailyExpense = {
        id: 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6',
        concept: 'Suministros de limpieza',
        amount: 15.50,
        category: 'supplies',
        hasInvoice: true,
        timestamp: '2025-10-13T19:45:32.123Z',
      };

      expect(isDailyExpense(validExpense)).toBe(true);
    });

    it('1.2 - Valida DailyExpense con valores edge correctos (minimo amount, concept corto)', () => {
      const edgeExpense: DailyExpense = {
        id: crypto.randomUUID(),
        concept: 'Abc',
        amount: 0.01,
        category: 'other',
        hasInvoice: false,
        timestamp: new Date().toISOString(),
      };

      expect(isDailyExpense(edgeExpense)).toBe(true);
    });
  });

  // SUITE 2: isDailyExpense() - Invalido (5 tests)
  describe('isDailyExpense() - Casos invalidos', () => {
    it('2.1 - Rechaza objeto null', () => {
      expect(isDailyExpense(null)).toBe(false);
    });

    it('2.2 - Rechaza objeto undefined', () => {
      expect(isDailyExpense(undefined)).toBe(false);
    });

    it('2.3 - Rechaza objeto con propiedades faltantes (sin category)', () => {
      const incomplete = {
        id: crypto.randomUUID(),
        concept: 'Test',
        amount: 10.00,
        hasInvoice: true,
        timestamp: new Date().toISOString(),
      };

      expect(isDailyExpense(incomplete)).toBe(false);
    });

    it('2.4 - Rechaza objeto con category invalida', () => {
      const invalidCategory = {
        id: crypto.randomUUID(),
        concept: 'Test',
        amount: 10.00,
        category: 'invalid_category',
        hasInvoice: true,
        timestamp: new Date().toISOString(),
      };

      expect(isDailyExpense(invalidCategory)).toBe(false);
    });

    it('2.5 - Rechaza objeto con amount invalido (negativo, cero, NaN)', () => {
      const negativeAmount = {
        id: crypto.randomUUID(),
        concept: 'Test',
        amount: -10.00,
        category: 'supplies',
        hasInvoice: true,
        timestamp: new Date().toISOString(),
      };

      const zeroAmount = {
        id: crypto.randomUUID(),
        concept: 'Test',
        amount: 0,
        category: 'supplies',
        hasInvoice: true,
        timestamp: new Date().toISOString(),
      };

      const nanAmount = {
        id: crypto.randomUUID(),
        concept: 'Test',
        amount: NaN,
        category: 'supplies',
        hasInvoice: true,
        timestamp: new Date().toISOString(),
      };

      expect(isDailyExpense(negativeAmount)).toBe(false);
      expect(isDailyExpense(zeroAmount)).toBe(false);
      expect(isDailyExpense(nanAmount)).toBe(false);
    });

    it('2.6 - Rechaza objeto con timestamp ISO 8601 invalido', () => {
      const invalidTimestamp = {
        id: crypto.randomUUID(),
        concept: 'Test',
        amount: 10.00,
        category: 'supplies',
        hasInvoice: true,
        timestamp: 'invalid-timestamp',
      };

      expect(isDailyExpense(invalidTimestamp)).toBe(false);
    });
  });

  // SUITE 3: EXPENSE_VALIDATION (1 test)
  describe('EXPENSE_VALIDATION constants', () => {
    it('3.1 - Contiene todos los limites esperados con valores correctos', () => {
      expect(EXPENSE_VALIDATION.MIN_CONCEPT_LENGTH).toBe(3);
      expect(EXPENSE_VALIDATION.MAX_CONCEPT_LENGTH).toBe(100);
      expect(EXPENSE_VALIDATION.MIN_AMOUNT).toBe(0.01);
      expect(EXPENSE_VALIDATION.MAX_AMOUNT).toBe(10000);
      expect(EXPENSE_VALIDATION.DECIMAL_PLACES).toBe(2);
    });
  });

  // SUITE 4: EXPENSE_CATEGORY_EMOJI (1 test)
  describe('EXPENSE_CATEGORY_EMOJI mapping', () => {
    it('4.1 - Contiene emojis para todas las 5 categorias', () => {
      const categories: ExpenseCategory[] = [
        'operational',
        'supplies',
        'transport',
        'services',
        'other'
      ];

      categories.forEach(category => {
        expect(EXPENSE_CATEGORY_EMOJI[category]).toBeDefined();
        expect(typeof EXPENSE_CATEGORY_EMOJI[category]).toBe('string');
        expect(EXPENSE_CATEGORY_EMOJI[category].length).toBeGreaterThan(0);
      });
    });
  });

  // SUITE 5: EXPENSE_CATEGORY_LABEL (1 test)
  describe('EXPENSE_CATEGORY_LABEL mapping', () => {
    it('5.1 - Contiene labels en español para todas las 5 categorias', () => {
      const categories: ExpenseCategory[] = [
        'operational',
        'supplies',
        'transport',
        'services',
        'other'
      ];

      categories.forEach(category => {
        expect(EXPENSE_CATEGORY_LABEL[category]).toBeDefined();
        expect(typeof EXPENSE_CATEGORY_LABEL[category]).toBe('string');
        expect(EXPENSE_CATEGORY_LABEL[category].length).toBeGreaterThan(0);
        expect(EXPENSE_CATEGORY_LABEL[category].length).toBeLessThanOrEqual(12);
      });
    });
  });
});
