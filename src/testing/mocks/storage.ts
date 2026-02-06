// 🤖 [IA] - OPERACIÓN ISLA RÁPIDA - Storage Mocks Modulares (Tarea C)
// Migrado desde setup.ts (30 líneas) para mejor control de estado entre tests
// Uso: Importar solo en tests que requieran localStorage/sessionStorage
// Ref: docs/qa/tests/031-operacion-isla-rapida.md

import { vi } from 'vitest';

// ══════════════════════════════════════════════════════════════
// STORAGE MOCKS (30 líneas originales)
// ══════════════════════════════════════════════════════════════

interface StorageMock {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
  length: number;
  key: ReturnType<typeof vi.fn>;
}

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
export function setupLocalStorageMock(): StorageMock {
  const localStorageMock: StorageMock = {
    getItem: vi.fn((_key: string) => null),
    setItem: vi.fn((_key: string, _value: string) => undefined),
    removeItem: vi.fn((_key: string) => undefined),
    clear: vi.fn(() => undefined),
    length: 0,
    key: vi.fn((_index: number) => null),
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
    const storage = window.localStorage as unknown as StorageMock;
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
export function setupSessionStorageMock(): StorageMock {
  const sessionStorageMock: StorageMock = {
    getItem: vi.fn((_key: string) => null),
    setItem: vi.fn((_key: string, _value: string) => undefined),
    removeItem: vi.fn((_key: string) => undefined),
    clear: vi.fn(() => undefined),
    length: 0,
    key: vi.fn((_index: number) => null),
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
    const storage = window.sessionStorage as unknown as StorageMock;
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
