// 🤖 [IA] - OPERACIÓN ISLA RÁPIDA - Storage Mocks Modulares (Tarea C)
// Migrado desde setup.ts (30 líneas) para mejor control de estado entre tests
// Uso: Importar solo en tests que requieran localStorage/sessionStorage
// Ref: docs/qa/tests/031-operacion-isla-rapida.md

import { vi } from 'vitest';

// ══════════════════════════════════════════════════════════════
// STORAGE MOCKS (30 líneas originales)
// ══════════════════════════════════════════════════════════════

/**
 * Mock de localStorage con vi.fn() para mejor control en tests
 *
 * Uso en test:
 * ```ts
 * import { setupLocalStorageMock, cleanupLocalStorageMock } from '@/testing/mocks/storage';
 *
 * beforeEach(() => {
 *   setupLocalStorageMock();
 * });
 *
 * afterEach(() => {
 *   cleanupLocalStorageMock();
 * });
 * ```
 */
export function setupLocalStorageMock() {
  const localStorageMock = {
    getItem: vi.fn((key: string) => null),
    setItem: vi.fn((key: string, value: string) => undefined),
    removeItem: vi.fn((key: string) => undefined),
    clear: vi.fn(() => undefined),
    length: 0,
    key: vi.fn((index: number) => null),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
}

/**
 * Cleanup de localStorage mock - resetea todos los vi.fn()
 */
export function cleanupLocalStorageMock() {
  if (window.localStorage) {
    const storage = window.localStorage as any;
    if (storage.getItem && vi.isMockFunction(storage.getItem)) {
      storage.getItem.mockClear();
      storage.setItem.mockClear();
      storage.removeItem.mockClear();
      storage.clear.mockClear();
      storage.key.mockClear();
    }
  }
}

/**
 * Mock de sessionStorage con vi.fn() para mejor control en tests
 *
 * Uso en test:
 * ```ts
 * import { setupSessionStorageMock, cleanupSessionStorageMock } from '@/testing/mocks/storage';
 *
 * beforeEach(() => {
 *   setupSessionStorageMock();
 * });
 *
 * afterEach(() => {
 *   cleanupSessionStorageMock();
 * });
 * ```
 */
export function setupSessionStorageMock() {
  const sessionStorageMock = {
    getItem: vi.fn((key: string) => null),
    setItem: vi.fn((key: string, value: string) => undefined),
    removeItem: vi.fn((key: string) => undefined),
    clear: vi.fn(() => undefined),
    length: 0,
    key: vi.fn((index: number) => null),
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
    writable: true,
  });

  return sessionStorageMock;
}

/**
 * Cleanup de sessionStorage mock - resetea todos los vi.fn()
 */
export function cleanupSessionStorageMock() {
  if (window.sessionStorage) {
    const storage = window.sessionStorage as any;
    if (storage.getItem && vi.isMockFunction(storage.getItem)) {
      storage.getItem.mockClear();
      storage.setItem.mockClear();
      storage.removeItem.mockClear();
      storage.clear.mockClear();
      storage.key.mockClear();
    }
  }
}

/**
 * Setup BOTH storage mocks at once
 * Útil para tests que usan localStorage Y sessionStorage
 */
export function setupAllStorageMocks() {
  const localStorage = setupLocalStorageMock();
  const sessionStorage = setupSessionStorageMock();
  return { localStorage, sessionStorage };
}

/**
 * Cleanup BOTH storage mocks
 * Llamar en afterEach para tests que usan setupAllStorageMocks()
 */
export function cleanupAllStorageMocks() {
  cleanupLocalStorageMock();
  cleanupSessionStorageMock();
}
