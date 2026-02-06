// 🤖 [IA] - v2.5.1: Tests unitarios para propValidation utilities
/**
 * @file propValidation.test.ts
 * @description Tests unitarios para funciones de validación de props
 *
 * @remarks
 * Suite completa cubriendo:
 * - Escenario 1: requireProp (4 tests)
 * - Escenario 2: requireNonEmptyString (4 tests)
 * - Escenario 3: requireNonEmptyArray (4 tests)
 * - Escenario 4: requirePositiveNumber (4 tests)
 * - Escenario 5: requireOneOf (4 tests)
 * - Escenario 6: Helper functions (4 tests)
 *
 * @version 2.5.1
 * @date 2026-02-06
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
    requireProp,
    requireNonEmptyString,
    requireNonEmptyArray,
    requirePositiveNumber,
    requireOneOf,
    withOptionalProp,
    getOrDefault,
    validatePropsOnMount
} from '@/utils/propValidation';

// Mock console.error y console.warn para tests silenciosos
beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => { });
    vi.spyOn(console, 'warn').mockImplementation(() => { });
});

describe('propValidation - ESCENARIO 1: requireProp', () => {
    // 🤖 [IA] - v2.5.1: Validación de props requeridas

    test('1.1 - retorna valor cuando es válido', () => {
        const result = requireProp('test', 'propName', 'TestComponent');
        expect(result).toBe('test');
    });

    test('1.2 - acepta números incluyendo 0', () => {
        expect(requireProp(0, 'count', 'Counter')).toBe(0);
        expect(requireProp(42, 'count', 'Counter')).toBe(42);
    });

    test('1.3 - lanza error para null', () => {
        expect(() => requireProp(null, 'data', 'DataComponent'))
            .toThrow("DataComponent: Required prop 'data' is missing.");
    });

    test('1.4 - lanza error para undefined', () => {
        expect(() => requireProp(undefined, 'items', 'ItemList'))
            .toThrow("ItemList: Required prop 'items' is missing.");
    });
});

describe('propValidation - ESCENARIO 2: requireNonEmptyString', () => {
    // 🤖 [IA] - v2.5.1: Validación de strings no vacíos

    test('2.1 - retorna string válido', () => {
        const result = requireNonEmptyString('hello', 'message', 'Alert');
        expect(result).toBe('hello');
    });

    test('2.2 - lanza error para string vacío', () => {
        expect(() => requireNonEmptyString('', 'title', 'Header'))
            .toThrow("Header: Prop 'title' cannot be empty.");
    });

    test('2.3 - lanza error para string solo espacios', () => {
        expect(() => requireNonEmptyString('   ', 'name', 'Form'))
            .toThrow("Form: Prop 'name' cannot be empty.");
    });

    test('2.4 - lanza error para null string', () => {
        expect(() => requireNonEmptyString(null, 'label', 'Button'))
            .toThrow("Button: Required prop 'label' is missing.");
    });
});

describe('propValidation - ESCENARIO 3: requireNonEmptyArray', () => {
    // 🤖 [IA] - v2.5.1: Validación de arrays no vacíos

    test('3.1 - retorna array válido', () => {
        const items = [1, 2, 3];
        const result = requireNonEmptyArray(items, 'items', 'List');
        expect(result).toEqual([1, 2, 3]);
    });

    test('3.2 - lanza error para array vacío', () => {
        expect(() => requireNonEmptyArray([], 'options', 'Select'))
            .toThrow("Select: Prop 'options' cannot be empty.");
    });

    test('3.3 - lanza error para null array', () => {
        expect(() => requireNonEmptyArray(null, 'data', 'Table'))
            .toThrow("Table: Required prop 'data' is missing.");
    });

    test('3.4 - acepta array con un elemento', () => {
        expect(requireNonEmptyArray(['solo'], 'cols', 'Grid')).toEqual(['solo']);
    });
});

describe('propValidation - ESCENARIO 4: requirePositiveNumber', () => {
    // 🤖 [IA] - v2.5.1: Validación de números positivos

    test('4.1 - retorna número positivo', () => {
        expect(requirePositiveNumber(100, 'amount', 'Payment')).toBe(100);
    });

    test('4.2 - lanza error para 0', () => {
        expect(() => requirePositiveNumber(0, 'quantity', 'Cart'))
            .toThrow("Cart: Prop 'quantity' must be positive.");
    });

    test('4.3 - lanza error para negativo', () => {
        expect(() => requirePositiveNumber(-5, 'price', 'Product'))
            .toThrow("Product: Prop 'price' must be positive.");
    });

    test('4.4 - acepta decimales positivos', () => {
        expect(requirePositiveNumber(0.01, 'rate', 'Calc')).toBe(0.01);
    });
});

describe('propValidation - ESCENARIO 5: requireOneOf', () => {
    // 🤖 [IA] - v2.5.1: Validación de valores enum

    const VALID_SIZES = ['small', 'medium', 'large'] as const;

    test('5.1 - acepta valor válido del enum', () => {
        expect(requireOneOf('medium', VALID_SIZES, 'size', 'Button')).toBe('medium');
    });

    test('5.2 - lanza error para valor inválido', () => {
        expect(() => requireOneOf('huge', VALID_SIZES, 'size', 'Button'))
            .toThrow("Button: Prop 'size' must be one of: [small, medium, large].");
    });

    test('5.3 - lanza error para null', () => {
        expect(() => requireOneOf(null, VALID_SIZES, 'variant', 'Card'))
            .toThrow("Card: Required prop 'variant' is missing.");
    });

    test('5.4 - funciona con números', () => {
        const VALID_COUNTS = [1, 2, 3] as const;
        expect(requireOneOf(2, VALID_COUNTS, 'count', 'Stepper')).toBe(2);
    });
});

describe('propValidation - ESCENARIO 6: Helper Functions', () => {
    // 🤖 [IA] - v2.5.1: Funciones auxiliares

    test('6.1 - withOptionalProp ejecuta callback para valor válido', () => {
        const result = withOptionalProp('hello', v => v.toUpperCase());
        expect(result).toBe('HELLO');
    });

    test('6.2 - withOptionalProp retorna undefined para null', () => {
        const result = withOptionalProp(null, v => v);
        expect(result).toBeUndefined();
    });

    test('6.3 - getOrDefault retorna valor si existe', () => {
        expect(getOrDefault('value', 'fallback')).toBe('value');
    });

    test('6.4 - getOrDefault retorna fallback para null/undefined', () => {
        expect(getOrDefault(null, 'fallback')).toBe('fallback');
        expect(getOrDefault(undefined, 'default')).toBe('default');
    });

    test('6.5 - validatePropsOnMount no lanza para props válidas', () => {
        expect(() => validatePropsOnMount({ name: 'Test' }, 'Component')).not.toThrow();
    });
});
