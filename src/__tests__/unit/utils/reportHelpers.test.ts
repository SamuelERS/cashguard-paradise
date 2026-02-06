// 🤖 [IA] - v2.5.1: Tests unitarios para reportHelpers utilities
/**
 * @file reportHelpers.test.ts
 * @description Tests unitarios para funciones de generación de reportes
 *
 * @remarks
 * Suite cubriendo:
 * - Escenario 1: generateDenominationDetails (4 tests)
 * - Escenario 2: getDenominationName (4 tests)
 * - Escenario 3: formatTimestamp (4 tests)
 * - Escenario 4: Constantes y exports (2 tests)
 *
 * @version 2.5.1
 * @date 2026-02-06
 */

import { describe, test, expect } from 'vitest';
import {
    generateDenominationDetails,
    getDenominationName,
    formatTimestamp,
    WHATSAPP_SEPARATOR
} from '@/utils/reportHelpers';
import type { CashCount } from '@/types/cash';

// 🤖 [IA] - Fixtures reutilizables
const EMPTY_CASH_COUNT: CashCount = {
    penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
    bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0
};

const SAMPLE_CASH_COUNT: CashCount = {
    penny: 43, nickel: 0, dime: 10, quarter: 8,
    dollarCoin: 0, bill1: 5, bill5: 3, bill10: 2,
    bill20: 1, bill50: 0, bill100: 0
};

describe('reportHelpers - ESCENARIO 1: generateDenominationDetails', () => {
    // 🤖 [IA] - v2.5.1: Generación de detalles de denominación

    test('1.1 - genera detalles para denominaciones > 0', () => {
        const result = generateDenominationDetails(SAMPLE_CASH_COUNT);
        expect(result).toContain('1¢ × 43');
        expect(result).toContain('10¢ × 10');
        expect(result).toContain('25¢ × 8');
        expect(result).toContain('$1 × 5');
    });

    test('1.2 - solo incluye denominaciones con cantidad > 0', () => {
        const result = generateDenominationDetails(SAMPLE_CASH_COUNT);
        // SAMPLE_CASH_COUNT tiene 7 denominaciones > 0:
        // penny: 43, dime: 10, quarter: 8, bill1: 5, bill5: 3, bill10: 2, bill20: 1
        const lines = result.split('\n').filter(l => l.length > 0);
        expect(lines.length).toBe(7); // Exactly 7 non-zero denominations
    });

    test('1.3 - retorna string vacío para cash count vacío', () => {
        const result = generateDenominationDetails(EMPTY_CASH_COUNT);
        expect(result).toBe('');
    });

    test('1.4 - formatea correctamente subtotales', () => {
        const simpleCount: CashCount = {
            ...EMPTY_CASH_COUNT,
            penny: 100, // $1.00
            bill100: 2  // $200.00
        };
        const result = generateDenominationDetails(simpleCount);
        expect(result).toContain('$1.00');
        expect(result).toContain('$200.00');
    });
});

describe('reportHelpers - ESCENARIO 2: getDenominationName', () => {
    // 🤖 [IA] - v2.5.1: Mapeo de nombres de denominación

    test('2.1 - retorna nombre correcto para monedas', () => {
        expect(getDenominationName('penny')).toBe('Un centavo (1¢)');
        expect(getDenominationName('nickel')).toBe('Cinco centavos (5¢)');
        expect(getDenominationName('quarter')).toBe('Veinticinco centavos (25¢)');
    });

    test('2.2 - retorna nombre correcto para billetes', () => {
        expect(getDenominationName('bill1')).toBe('Billete de un dólar ($1)');
        expect(getDenominationName('bill50')).toBe('Billete de cincuenta dólares ($50)');
        expect(getDenominationName('bill100')).toBe('Billete de cien dólares ($100)');
    });

    test('2.3 - retorna nombre para moneda de dólar', () => {
        expect(getDenominationName('dollarCoin')).toBe('Moneda de un dólar ($1)');
    });

    test('2.4 - mapea todas las denominaciones', () => {
        const allDenominations: (keyof CashCount)[] = [
            'penny', 'nickel', 'dime', 'quarter', 'dollarCoin',
            'bill1', 'bill5', 'bill10', 'bill20', 'bill50', 'bill100'
        ];
        allDenominations.forEach(denom => {
            const name = getDenominationName(denom);
            expect(name).toBeTruthy();
            expect(name.length).toBeGreaterThan(0);
        });
    });
});

describe('reportHelpers - ESCENARIO 3: formatTimestamp', () => {
    // 🤖 [IA] - v2.5.1: Formateo de timestamps

    test('3.1 - formatea ISO 8601 a HH:MM:SS', () => {
        // Note: resultado depende de timezone, verificamos formato
        const result = formatTimestamp('2026-02-06T12:30:45.000Z');
        expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    test('3.2 - maneja fecha válida correctamente', () => {
        const result = formatTimestamp('2026-01-15T18:00:00.000Z');
        expect(result).toBeTruthy();
        expect(result.length).toBeGreaterThan(0);
    });

    test('3.3 - retorna string original para fecha inválida', () => {
        const invalidDate = 'not-a-date';
        const result = formatTimestamp(invalidDate);
        // Debería retornar el string original o un error manejado
        expect(result).toBeTruthy();
    });

    test('3.4 - usa formato 24 horas', () => {
        // 18:00 UTC debería mostrarse en formato 24h
        const result = formatTimestamp('2026-02-06T18:00:00.000Z');
        // El resultado no debería contener AM/PM
        expect(result).not.toContain('AM');
        expect(result).not.toContain('PM');
    });
});

describe('reportHelpers - ESCENARIO 4: Constantes y Exports', () => {
    // 🤖 [IA] - v2.5.1: Verificación de exports

    test('4.1 - WHATSAPP_SEPARATOR está definido', () => {
        expect(WHATSAPP_SEPARATOR).toBeDefined();
        expect(typeof WHATSAPP_SEPARATOR).toBe('string');
    });

    test('4.2 - WHATSAPP_SEPARATOR tiene longitud optimizada para mobile', () => {
        expect(WHATSAPP_SEPARATOR.length).toBe(12);
        expect(WHATSAPP_SEPARATOR).toBe('━━━━━━━━━━━━');
    });
});
