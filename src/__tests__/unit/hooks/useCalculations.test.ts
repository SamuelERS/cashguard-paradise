// 🤖 [IA] - v2.5.0: Tests unitarios para hook useCalculations
/**
 * @file useCalculations.test.ts
 * @description Tests unitarios para hook useCalculations
 *
 * @remarks
 * Suite completa de tests cubriendo:
 * - Escenario 1: Cálculos básicos (5 tests)
 * - Escenario 2: Gastos del día (4 tests)
 * - Escenario 3: Alertas y diferencias (5 tests)
 * - Escenario 4: Edge cases (4 tests)
 *
 * @version 2.5.0
 * @date 2026-02-06
 */

import { renderHook } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useCalculations } from '@/hooks/useCalculations';
import type { CashCount, ElectronicPayments } from '@/types/cash';
import type { DailyExpense } from '@/types/expenses';

// 🤖 [IA] - Fixtures reutilizables
const EMPTY_CASH_COUNT: CashCount = {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 0,
    bill10: 0,
    bill20: 0,
    bill50: 0,
    bill100: 0
};

const EMPTY_ELECTRONIC: ElectronicPayments = {
    credomatic: 0,
    promerica: 0,
    bankTransfer: 0,
    paypal: 0
};

const SAMPLE_CASH_COUNT: CashCount = {
    penny: 100,   // $1.00
    nickel: 40,   // $2.00
    dime: 30,     // $3.00
    quarter: 20,  // $5.00
    dollarCoin: 10, // $10.00
    bill1: 10,    // $10.00
    bill5: 5,     // $25.00
    bill10: 4,    // $40.00
    bill20: 5,    // $100.00
    bill50: 1,    // $50.00
    bill100: 1    // $100.00
    // Total: $346.00
};

const SAMPLE_ELECTRONIC: ElectronicPayments = {
    credomatic: 150.00,
    promerica: 75.50,
    bankTransfer: 50.00,
    paypal: 24.50
    // Total: $300.00
};

const createExpense = (amount: number, category = 'supplies' as const): DailyExpense => ({
    id: crypto.randomUUID(),
    concept: `Test expense ${amount}`,
    amount,
    category,
    hasInvoice: true,
    timestamp: new Date().toISOString()
});

describe('useCalculations - ESCENARIO 1: Cálculos Básicos', () => {
    // 🤖 [IA] - v2.5.0: Tests de cálculos fundamentales

    test('1.1 - calcula totalCash correctamente con denominaciones mixtas', () => {
        const { result } = renderHook(() =>
            useCalculations(SAMPLE_CASH_COUNT, EMPTY_ELECTRONIC, 0)
        );

        // $1 + $2 + $3 + $5 + $10 + $10 + $25 + $40 + $100 + $50 + $100 = $346
        expect(result.current.totalCash).toBe(346);
    });

    test('1.2 - calcula totalElectronic correctamente sumando todos los métodos', () => {
        const { result } = renderHook(() =>
            useCalculations(EMPTY_CASH_COUNT, SAMPLE_ELECTRONIC, 0)
        );

        // $150 + $75.50 + $50 + $24.50 = $300
        expect(result.current.totalElectronic).toBe(300);
    });

    test('1.3 - calcula totalGeneral correctamente (efectivo + electrónico)', () => {
        const { result } = renderHook(() =>
            useCalculations(SAMPLE_CASH_COUNT, SAMPLE_ELECTRONIC, 0)
        );

        // $346 + $300 = $646
        expect(result.current.totalGeneral).toBe(646);
    });

    test('1.4 - retorna changeResult con estructura esperada', () => {
        const { result } = renderHook(() =>
            useCalculations(SAMPLE_CASH_COUNT, EMPTY_ELECTRONIC, 0)
        );

        expect(result.current.changeResult).toBeDefined();
        expect(result.current.changeResult).toHaveProperty('possible');
        expect(result.current.changeResult).toHaveProperty('total');
        expect(result.current.changeResult).toHaveProperty('change');
    });

    test('1.5 - genera timestamp en formato localizado El Salvador', () => {
        const { result } = renderHook(() =>
            useCalculations(EMPTY_CASH_COUNT, EMPTY_ELECTRONIC, 0)
        );

        expect(result.current.timestamp).toBeDefined();
        expect(typeof result.current.timestamp).toBe('string');
        // Formato esperado: "DD/MM/YYYY, HH:MM AM/PM"
        expect(result.current.timestamp).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
});

describe('useCalculations - ESCENARIO 2: Gastos del Día', () => {
    // 🤖 [IA] - v2.5.0: Fase 2 de cálculos con gastos operacionales

    test('2.1 - calcula totalExpenses correctamente con múltiples gastos', () => {
        const expenses: DailyExpense[] = [
            createExpense(25.00),
            createExpense(15.50),
            createExpense(10.00)
        ];

        const { result } = renderHook(() =>
            useCalculations(EMPTY_CASH_COUNT, EMPTY_ELECTRONIC, 0, expenses)
        );

        // $25 + $15.50 + $10 = $50.50
        expect(result.current.totalExpenses).toBe(50.50);
    });

    test('2.2 - calcula totalAdjusted correctamente (totalGeneral - gastos)', () => {
        const expenses: DailyExpense[] = [createExpense(100.00)];

        const { result } = renderHook(() =>
            useCalculations(SAMPLE_CASH_COUNT, SAMPLE_ELECTRONIC, 0, expenses)
        );

        // totalGeneral: $646 - gastos: $100 = $546
        expect(result.current.totalAdjusted).toBe(546);
    });

    test('2.3 - difference usa totalAdjusted y NO totalGeneral', () => {
        const expenses: DailyExpense[] = [createExpense(46.00)];
        const expectedSales = 500;

        const { result } = renderHook(() =>
            useCalculations(SAMPLE_CASH_COUNT, SAMPLE_ELECTRONIC, expectedSales, expenses)
        );

        // totalGeneral: $646 - gastos: $46 = $600 (totalAdjusted)
        // difference: $600 - $500 = $100
        expect(result.current.totalAdjusted).toBe(600);
        expect(result.current.difference).toBe(100);
    });

    test('2.4 - maneja array vacío de gastos como default', () => {
        const { result } = renderHook(() =>
            useCalculations(SAMPLE_CASH_COUNT, SAMPLE_ELECTRONIC, 500)
        );

        expect(result.current.totalExpenses).toBe(0);
        expect(result.current.totalAdjusted).toBe(646);
    });
});

describe('useCalculations - ESCENARIO 3: Alertas y Diferencias', () => {
    // 🤖 [IA] - v2.5.0: Sistema de alertas anti-fraude

    test('3.1 - hasAlert es TRUE cuando diferencia < -$3.00', () => {
        const expectedSales = 700; // Mayor que totalAdjusted ($646)

        const { result } = renderHook(() =>
            useCalculations(SAMPLE_CASH_COUNT, SAMPLE_ELECTRONIC, expectedSales)
        );

        // difference: $646 - $700 = -$54 (faltante significativo)
        expect(result.current.difference).toBe(-54);
        expect(result.current.hasAlert).toBe(true);
    });

    test('3.2 - hasAlert es FALSE cuando diferencia >= -$3.00', () => {
        const expectedSales = 644; // Solo -$2 de diferencia

        const { result } = renderHook(() =>
            useCalculations(SAMPLE_CASH_COUNT, SAMPLE_ELECTRONIC, expectedSales)
        );

        // difference: $646 - $644 = $2 (sobrante)
        expect(result.current.difference).toBe(2);
        expect(result.current.hasAlert).toBe(false);
    });

    test('3.3 - isShortage es TRUE cuando diferencia < 0', () => {
        const expectedSales = 650;

        const { result } = renderHook(() =>
            useCalculations(SAMPLE_CASH_COUNT, SAMPLE_ELECTRONIC, expectedSales)
        );

        // difference: $646 - $650 = -$4
        expect(result.current.difference).toBe(-4);
        expect(result.current.isShortage).toBe(true);
        expect(result.current.isSurplus).toBe(false);
    });

    test('3.4 - isSurplus es TRUE cuando diferencia > 0', () => {
        const expectedSales = 600;

        const { result } = renderHook(() =>
            useCalculations(SAMPLE_CASH_COUNT, SAMPLE_ELECTRONIC, expectedSales)
        );

        // difference: $646 - $600 = $46
        expect(result.current.difference).toBe(46);
        expect(result.current.isSurplus).toBe(true);
        expect(result.current.isShortage).toBe(false);
    });

    test('3.5 - diferencia exacta cero: ni shortage ni surplus', () => {
        const expectedSales = 646;

        const { result } = renderHook(() =>
            useCalculations(SAMPLE_CASH_COUNT, SAMPLE_ELECTRONIC, expectedSales)
        );

        expect(result.current.difference).toBe(0);
        expect(result.current.isShortage).toBe(false);
        expect(result.current.isSurplus).toBe(false);
        expect(result.current.hasAlert).toBe(false);
    });
});

describe('useCalculations - ESCENARIO 4: Edge Cases', () => {
    // 🤖 [IA] - v2.5.0: Casos límite y robustez

    test('4.1 - maneja todos los valores en cero correctamente', () => {
        const { result } = renderHook(() =>
            useCalculations(EMPTY_CASH_COUNT, EMPTY_ELECTRONIC, 0)
        );

        expect(result.current.totalCash).toBe(0);
        expect(result.current.totalElectronic).toBe(0);
        expect(result.current.totalGeneral).toBe(0);
        expect(result.current.totalExpenses).toBe(0);
        expect(result.current.totalAdjusted).toBe(0);
        expect(result.current.difference).toBe(0);
    });

    test('4.2 - maneja decimales con precisión financiera (2 decimales)', () => {
        const electronicWithDecimals: ElectronicPayments = {
            credomatic: 100.99,
            promerica: 50.01,
            bankTransfer: 25.555, // 3 decimales - debe manejarse
            paypal: 0
        };

        const { result } = renderHook(() =>
            useCalculations(EMPTY_CASH_COUNT, electronicWithDecimals, 0)
        );

        // Verificar que suma correctamente
        expect(result.current.totalElectronic).toBeCloseTo(176.555, 2);
    });

    test('4.3 - maneja venta esperada mayor que total (faltante)', () => {
        const expectedSales = 1000;

        const { result } = renderHook(() =>
            useCalculations(SAMPLE_CASH_COUNT, SAMPLE_ELECTRONIC, expectedSales)
        );

        // difference: $646 - $1000 = -$354
        expect(result.current.difference).toBe(-354);
        expect(result.current.hasAlert).toBe(true);
        expect(result.current.isShortage).toBe(true);
    });

    test('4.4 - recalcula cuando cambian las dependencias (memoization)', () => {
        const { result, rerender } = renderHook(
            ({ cash, electronic, expected }) =>
                useCalculations(cash, electronic, expected),
            {
                initialProps: {
                    cash: EMPTY_CASH_COUNT,
                    electronic: EMPTY_ELECTRONIC,
                    expected: 0
                }
            }
        );

        expect(result.current.totalCash).toBe(0);

        // Cambiar props
        rerender({
            cash: SAMPLE_CASH_COUNT,
            electronic: SAMPLE_ELECTRONIC,
            expected: 500
        });

        expect(result.current.totalCash).toBe(346);
        expect(result.current.totalGeneral).toBe(646);
        expect(result.current.difference).toBe(146);
    });
});
