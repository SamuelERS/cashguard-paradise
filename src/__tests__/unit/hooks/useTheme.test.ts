// 🤖 [IA] - v2.5.1: Tests unitarios para useTheme hook
/**
 * @file useTheme.test.ts
 * @description Tests unitarios para hook useTheme
 *
 * @version 2.5.1
 * @date 2026-02-06
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useTheme } from '@/hooks/useTheme';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] || null),
        setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
        removeItem: vi.fn((key: string) => { delete store[key]; }),
        clear: () => { store = {}; }
    };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock document.documentElement for classList manipulation
const documentMock = {
    classList: {
        remove: vi.fn(),
        add: vi.fn()
    }
};
Object.defineProperty(window.document, 'documentElement', { value: documentMock });

beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
});

describe('useTheme - ESCENARIO 1: Estado Inicial', () => {
    test('1.1 - tema por defecto es dark', () => {
        const { result } = renderHook(() => useTheme());
        expect(result.current.theme).toBe('dark');
    });

    test('1.2 - isLocalStorageAvailable indica disponibilidad', () => {
        const { result } = renderHook(() => useTheme());
        expect(result.current.isLocalStorageAvailable).toBe(true);
    });

    test('1.3 - localStorageError es null inicialmente', () => {
        const { result } = renderHook(() => useTheme());
        expect(result.current.localStorageError).toBeNull();
    });
});

describe('useTheme - ESCENARIO 2: Cambio de Tema', () => {
    test('2.1 - setTheme cambia a light', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('light');
        });

        expect(result.current.theme).toBe('light');
    });

    test('2.2 - setTheme cambia a dark', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('light');
            result.current.setTheme('dark');
        });

        expect(result.current.theme).toBe('dark');
    });

    test('2.3 - toggleTheme alterna de dark a light', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.toggleTheme();
        });

        expect(result.current.theme).toBe('light');
    });

    test('2.4 - toggleTheme alterna de light a dark', () => {
        const { result } = renderHook(() => useTheme());

        act(() => {
            result.current.setTheme('light');
        });

        act(() => {
            result.current.toggleTheme();
        });

        expect(result.current.theme).toBe('dark');
    });
});

describe('useTheme - ESCENARIO 3: Efectos en DOM', () => {
    test('3.1 - aplica clase al document element', () => {
        renderHook(() => useTheme());

        // Debería llamar add con el tema
        expect(documentMock.classList.add).toHaveBeenCalledWith('dark');
    });

    test('3.2 - remove se llama para limpiar clases anteriores', () => {
        renderHook(() => useTheme());

        expect(documentMock.classList.remove).toHaveBeenCalledWith('light', 'dark');
    });
});
