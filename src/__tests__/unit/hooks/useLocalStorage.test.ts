// 🤖 [IA] - v2.5.1: Tests unitarios para useLocalStorage hook
/**
 * @file useLocalStorage.test.ts
 * @description Tests unitarios para hook useLocalStorage
 *
 * @remarks
 * Suite cubriendo:
 * - Escenario 1: Inicialización (4 tests)
 * - Escenario 2: Persistencia (4 tests)
 * - Escenario 3: Error handling (3 tests)
 *
 * @version 2.5.1
 * @date 2026-02-06
 */

import { renderHook, act } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useLocalStorage } from '@/hooks/useLocalStorage';

// 🤖 [IA] - Mock localStorage
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

beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
});

describe('useLocalStorage - ESCENARIO 1: Inicialización', () => {
    // 🤖 [IA] - v2.5.1: Estado inicial del hook

    test('1.1 - retorna valor inicial cuando localStorage está vacío', () => {
        const { result } = renderHook(() => useLocalStorage('testKey', 'default'));
        const [value] = result.current;
        expect(value).toBe('default');
    });

    test('1.2 - lee valor existente de localStorage', () => {
        localStorageMock.setItem('existingKey', JSON.stringify('stored'));

        const { result } = renderHook(() => useLocalStorage('existingKey', 'default'));
        const [value] = result.current;

        expect(value).toBe('stored');
    });

    test('1.3 - retorna metadata de disponibilidad', () => {
        const { result } = renderHook(() => useLocalStorage('key', 'value'));
        const [, , metadata] = result.current;

        expect(metadata).toHaveProperty('isAvailable');
        expect(metadata).toHaveProperty('error');
    });

    test('1.4 - isAvailable es true cuando localStorage funciona', () => {
        const { result } = renderHook(() => useLocalStorage('key', 'value'));
        const [, , { isAvailable }] = result.current;

        expect(isAvailable).toBe(true);
    });
});

describe('useLocalStorage - ESCENARIO 2: Persistencia', () => {
    // 🤖 [IA] - v2.5.1: Guardado y lectura de valores

    test('2.1 - setValue actualiza el estado', () => {
        const { result } = renderHook(() => useLocalStorage('key', 'initial'));

        act(() => {
            const [, setValue] = result.current;
            setValue('updated');
        });

        const [value] = result.current;
        expect(value).toBe('updated');
    });

    test('2.2 - setValue persiste a localStorage', () => {
        const { result } = renderHook(() => useLocalStorage('persistKey', 'initial'));

        act(() => {
            const [, setValue] = result.current;
            setValue('persisted');
        });

        expect(localStorageMock.setItem).toHaveBeenCalledWith(
            'persistKey',
            JSON.stringify('persisted')
        );
    });

    test('2.3 - acepta función como argumento (como useState)', () => {
        const { result } = renderHook(() => useLocalStorage('counter', 10));

        act(() => {
            const [, setValue] = result.current;
            setValue(prev => prev + 5);
        });

        const [value] = result.current;
        expect(value).toBe(15);
    });

    test('2.4 - funciona con objetos complejos', () => {
        const { result } = renderHook(() =>
            useLocalStorage('user', { name: 'John', age: 30 })
        );

        act(() => {
            const [, setValue] = result.current;
            setValue({ name: 'Jane', age: 25 });
        });

        const [value] = result.current;
        expect(value).toEqual({ name: 'Jane', age: 25 });
    });
});

describe('useLocalStorage - ESCENARIO 3: Error Handling', () => {
    // 🤖 [IA] - v2.5.1: Manejo de errores

    test('3.1 - error inicial es null', () => {
        const { result } = renderHook(() => useLocalStorage('key', 'value'));
        const [, , { error }] = result.current;

        expect(error).toBeNull();
    });

    test('3.2 - maneja JSON inválido en localStorage', () => {
        // Simular JSON inválido
        localStorageMock.getItem.mockReturnValueOnce('not-valid-json');

        const { result } = renderHook(() => useLocalStorage('badKey', 'fallback'));
        const [value] = result.current;

        // Debería usar el fallback
        expect(value).toBe('fallback');
    });

    test('3.3 - actualiza estado incluso si localStorage falla', () => {
        const { result } = renderHook(() => useLocalStorage('key', 'initial'));

        // Simular fallo en setItem
        localStorageMock.setItem.mockImplementationOnce(() => {
            throw new Error('Storage quota exceeded');
        });

        act(() => {
            const [, setValue] = result.current;
            setValue('newValue');
        });

        // El estado interno debería actualizarse
        const [value] = result.current;
        expect(value).toBe('newValue');
    });
});
