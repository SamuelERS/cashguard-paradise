// 🤖 [IA] - v2.5.0: Tests unitarios para hook usePhaseManager
/**
 * @file usePhaseManager.test.ts
 * @description Tests unitarios para hook usePhaseManager
 *
 * @remarks
 * Suite completa de tests cubriendo:
 * - Escenario 1: Estado inicial (4 tests)
 * - Escenario 2: Flujo completo corte de caja (5 tests)
 * - Escenario 3: Fase 2 - entrega efectivo (4 tests)
 * - Escenario 4: Conteo matutino (3 tests)
 * - Escenario 5: Reset y utilidades (4 tests)
 *
 * @version 2.5.0
 * @date 2026-02-06
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { usePhaseManager } from '@/hooks/usePhaseManager';
import { OperationMode } from '@/types/operation-mode';
import type { CashCount } from '@/types/cash';

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

// CashCount que suma exactamente $50
const FIFTY_DOLLAR_CASH: CashCount = {
    ...EMPTY_CASH_COUNT,
    bill50: 1 // $50 exactos
};

// CashCount que suma $346 (> $50)
const LARGE_CASH_COUNT: CashCount = {
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

describe('usePhaseManager - ESCENARIO 1: Estado Inicial', () => {
    // 🤖 [IA] - v2.5.0: Verificar estado inicial correcto

    test('1.1 - inicia en fase 1', () => {
        const { result } = renderHook(() => usePhaseManager());

        expect(result.current.phaseState.currentPhase).toBe(1);
    });

    test('1.2 - phase1Completed es FALSE inicialmente', () => {
        const { result } = renderHook(() => usePhaseManager());

        expect(result.current.phaseState.phase1Completed).toBe(false);
        expect(result.current.phaseState.phase2Completed).toBe(false);
    });

    test('1.3 - shouldSkipPhase2 es FALSE inicialmente', () => {
        const { result } = renderHook(() => usePhaseManager());

        expect(result.current.phaseState.shouldSkipPhase2).toBe(false);
    });

    test('1.4 - deliveryCalculation es NULL inicialmente', () => {
        const { result } = renderHook(() => usePhaseManager());

        expect(result.current.deliveryCalculation).toBeNull();
    });
});

describe('usePhaseManager - ESCENARIO 2: Flujo Corte de Caja Completo', () => {
    // 🤖 [IA] - v2.5.0: EVENING_CUT con > $50

    test('2.1 - completePhase1 calcula totalCash correctamente', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_CUT)
        );

        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT);
        });

        expect(result.current.phaseState.totalCashFromPhase1).toBe(346);
    });

    test('2.2 - shouldSkipPhase2 es FALSE cuando total > $50 en CASH_CUT', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_CUT)
        );

        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT);
        });

        expect(result.current.phaseState.shouldSkipPhase2).toBe(false);
        expect(result.current.phaseState.currentPhase).toBe(2);
    });

    test('2.3 - shouldSkipPhase2 es TRUE cuando total <= $50', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_CUT)
        );

        act(() => {
            result.current.completePhase1(FIFTY_DOLLAR_CASH);
        });

        expect(result.current.phaseState.shouldSkipPhase2).toBe(true);
        expect(result.current.phaseState.currentPhase).toBe(3);
    });

    test('2.4 - calcula deliveryCalculation para distribución de efectivo', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_CUT)
        );

        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT);
        });

        expect(result.current.deliveryCalculation).not.toBeNull();
        expect(result.current.deliveryCalculation?.amountToDeliver).toBeGreaterThan(0);
        expect(result.current.deliveryCalculation?.denominationsToDeliver).toBeDefined();
        expect(result.current.deliveryCalculation?.denominationsToKeep).toBeDefined();
    });

    test('2.5 - phase2State.toDeliver y toKeep se actualizan correctamente', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_CUT)
        );

        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT);
        });

        // Verificar que toDeliver y toKeep tienen estructura CashCount
        expect(result.current.phase2State.toDeliver).toBeDefined();
        expect(result.current.phase2State.toKeep).toBeDefined();
        expect(result.current.phase2State.toDeliver).toHaveProperty('penny');
        expect(result.current.phase2State.toKeep).toHaveProperty('bill100');
    });
});

describe('usePhaseManager - ESCENARIO 3: Fase 2 - Entrega de Efectivo', () => {
    // 🤖 [IA] - v2.5.0: Flujo de Fase 2

    test('3.1 - startPhase1 marca phase1Completed TRUE', () => {
        const { result } = renderHook(() => usePhaseManager());

        act(() => {
            result.current.startPhase1();
        });

        expect(result.current.phaseState.phase1Completed).toBe(true);
    });

    test('3.2 - completePhase2Delivery marca deliveryCompleted TRUE', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_CUT)
        );

        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT);
            result.current.completePhase2Delivery();
        });

        expect(result.current.phase2State.deliveryCompleted).toBe(true);
    });

    test('3.3 - completePhase2Verification avanza a fase 3', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_CUT)
        );

        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT);
            result.current.completePhase2Delivery();
            result.current.completePhase2Verification();
        });

        expect(result.current.phaseState.phase2Completed).toBe(true);
        expect(result.current.phaseState.currentPhase).toBe(3);
    });

    test('3.4 - advancePhase2Section cambia de delivery a verification', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_CUT)
        );

        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT);
            result.current.completePhase2Delivery();
            result.current.advancePhase2Section();
        });

        expect(result.current.phase2State.currentSection).toBe('verification');
    });
});

describe('usePhaseManager - ESCENARIO 4: Conteo Matutino (CASH_COUNT)', () => {
    // 🤖 [IA] - v2.5.0: CASH_COUNT siempre salta Fase 2

    test('4.1 - CASH_COUNT mode SIEMPRE salta fase 2 (incluso con > $50)', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_COUNT)
        );

        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT); // $346
        });

        expect(result.current.phaseState.shouldSkipPhase2).toBe(true);
        expect(result.current.phaseState.currentPhase).toBe(3);
    });

    test('4.2 - CASH_COUNT NO calcula deliveryCalculation', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_COUNT)
        );

        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT);
        });

        expect(result.current.deliveryCalculation).toBeNull();
    });

    test('4.3 - canAdvanceToPhase3 es TRUE después de phase1 en CASH_COUNT', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_COUNT)
        );

        expect(result.current.canAdvanceToPhase3()).toBe(false);

        act(() => {
            result.current.completePhase1(FIFTY_DOLLAR_CASH);
        });

        expect(result.current.canAdvanceToPhase3()).toBe(true);
    });
});

describe('usePhaseManager - ESCENARIO 5: Reset y Utilidades', () => {
    // 🤖 [IA] - v2.5.0: Funciones auxiliares

    test('5.1 - resetAllPhases reinicia TODO el estado', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_CUT)
        );

        // Avanzar el flujo
        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT);
            result.current.completePhase2Delivery();
        });

        expect(result.current.phaseState.currentPhase).toBe(2);
        expect(result.current.deliveryCalculation).not.toBeNull();

        // Reset
        act(() => {
            result.current.resetAllPhases();
        });

        expect(result.current.phaseState.currentPhase).toBe(1);
        expect(result.current.phaseState.phase1Completed).toBe(false);
        expect(result.current.phaseState.phase2Completed).toBe(false);
        expect(result.current.deliveryCalculation).toBeNull();
    });

    test('5.2 - updateDeliveryProgress registra pasos completados', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_CUT)
        );

        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT);
            result.current.updateDeliveryProgress('bill100', true);
            result.current.updateDeliveryProgress('bill50', true);
        });

        expect(result.current.phase2State.deliveryProgress['bill100']).toBe(true);
        expect(result.current.phase2State.deliveryProgress['bill50']).toBe(true);
    });

    test('5.3 - updateVerificationProgress registra pasos verificados', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_CUT)
        );

        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT);
            result.current.updateVerificationProgress('quarter', true);
        });

        expect(result.current.phase2State.verificationProgress['quarter']).toBe(true);
    });

    test('5.4 - canAdvanceToPhase3 requiere phase2 completado en CASH_CUT', () => {
        const { result } = renderHook(() =>
            usePhaseManager(OperationMode.CASH_CUT)
        );

        act(() => {
            result.current.completePhase1(LARGE_CASH_COUNT);
        });

        // Phase 2 no completado aún
        expect(result.current.canAdvanceToPhase3()).toBe(false);

        act(() => {
            result.current.completePhase2Delivery();
            result.current.completePhase2Verification();
        });

        // Ahora sí puede avanzar
        expect(result.current.canAdvanceToPhase3()).toBe(true);
    });
});
