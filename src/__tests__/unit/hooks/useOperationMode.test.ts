// 🤖 [IA] - v2.5.1: Tests unitarios para useOperationMode hook
/**
 * @file useOperationMode.test.ts
 * @description Tests unitarios para hook useOperationMode
 *
 * @version 2.5.1
 * @date 2026-02-06
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect } from 'vitest';
import { useOperationMode } from '@/hooks/useOperationMode';
import { OperationMode } from '@/types/operation-mode';

describe('useOperationMode - ESCENARIO 1: Estado Inicial', () => {
    test('1.1 - currentMode es null inicialmente', () => {
        const { result } = renderHook(() => useOperationMode());
        expect(result.current.currentMode).toBeNull();
    });

    test('1.2 - hasSelectedMode es false inicialmente', () => {
        const { result } = renderHook(() => useOperationMode());
        expect(result.current.hasSelectedMode).toBe(false);
    });

    test('1.3 - getModeInfo retorna null sin modo seleccionado', () => {
        const { result } = renderHook(() => useOperationMode());
        expect(result.current.getModeInfo()).toBeNull();
    });

    test('1.4 - isCashCount e isCashCut son false inicialmente', () => {
        const { result } = renderHook(() => useOperationMode());
        expect(result.current.isCashCount).toBe(false);
        expect(result.current.isCashCut).toBe(false);
    });
});

describe('useOperationMode - ESCENARIO 2: Selección de Modo', () => {
    test('2.1 - selectMode establece CASH_COUNT', () => {
        const { result } = renderHook(() => useOperationMode());

        act(() => {
            result.current.selectMode(OperationMode.CASH_COUNT);
        });

        expect(result.current.currentMode).toBe(OperationMode.CASH_COUNT);
        expect(result.current.isCashCount).toBe(true);
        expect(result.current.isCashCut).toBe(false);
    });

    test('2.2 - selectMode establece CASH_CUT', () => {
        const { result } = renderHook(() => useOperationMode());

        act(() => {
            result.current.selectMode(OperationMode.CASH_CUT);
        });

        expect(result.current.currentMode).toBe(OperationMode.CASH_CUT);
        expect(result.current.isCashCount).toBe(false);
        expect(result.current.isCashCut).toBe(true);
    });

    test('2.3 - hasSelectedMode es true después de seleccionar', () => {
        const { result } = renderHook(() => useOperationMode());

        act(() => {
            result.current.selectMode(OperationMode.CASH_COUNT);
        });

        expect(result.current.hasSelectedMode).toBe(true);
    });

    test('2.4 - getModeInfo retorna info correcta para CASH_COUNT', () => {
        const { result } = renderHook(() => useOperationMode());

        act(() => {
            result.current.selectMode(OperationMode.CASH_COUNT);
        });

        const info = result.current.getModeInfo();
        expect(info).not.toBeNull();
        expect(info?.mode).toBe(OperationMode.CASH_COUNT);
        expect(info?.title).toBe('Conteo de Caja');
        expect(info?.requiresExpectedSales).toBe(false);
        expect(info?.requiresPhase2).toBe(false);
    });

    test('2.5 - getModeInfo retorna info correcta para CASH_CUT', () => {
        const { result } = renderHook(() => useOperationMode());

        act(() => {
            result.current.selectMode(OperationMode.CASH_CUT);
        });

        const info = result.current.getModeInfo();
        expect(info?.mode).toBe(OperationMode.CASH_CUT);
        expect(info?.title).toBe('Corte de Caja');
        expect(info?.requiresExpectedSales).toBe(true);
        expect(info?.requiresPhase2).toBe(true);
    });
});

describe('useOperationMode - ESCENARIO 3: Reset', () => {
    test('3.1 - resetMode vuelve a null', () => {
        const { result } = renderHook(() => useOperationMode());

        act(() => {
            result.current.selectMode(OperationMode.CASH_CUT);
        });
        expect(result.current.currentMode).toBe(OperationMode.CASH_CUT);

        act(() => {
            result.current.resetMode();
        });

        expect(result.current.currentMode).toBeNull();
        expect(result.current.hasSelectedMode).toBe(false);
    });

    test('3.2 - getModeInfo es null después de reset', () => {
        const { result } = renderHook(() => useOperationMode());

        act(() => {
            result.current.selectMode(OperationMode.CASH_COUNT);
            result.current.resetMode();
        });

        expect(result.current.getModeInfo()).toBeNull();
    });
});
