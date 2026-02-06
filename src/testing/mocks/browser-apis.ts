// 🤖 [IA] - OPERACIÓN ISLA RÁPIDA - Browser APIs Mocks Modulares (Tarea C)
// Migrado desde setup.ts (178 líneas) para evitar contaminación global
// Uso: Importar solo en tests que requieran estas APIs específicas
// Ref: docs/qa/tests/031-operacion-isla-rapida.md

import { vi } from 'vitest';

// ══════════════════════════════════════════════════════════════
// 1️⃣ RESIZE OBSERVER (46 líneas originales)
// ══════════════════════════════════════════════════════════════

/**
 * Mock de ResizeObserver para tests de componentes con resize detection
 *
 * Uso en test:
 * ```ts
 * import { setupResizeObserverMock } from '@/testing/mocks/browser-apis';
 *
 * beforeAll(() => {
 *   setupResizeObserverMock();
 * });
 * ```
 */
export function setupResizeObserverMock() {
  const ResizeObserverMock = class ResizeObserver {
    callback: any;
    observations: Map<any, any>;

    constructor(callback: any) {
      this.callback = callback;
      this.observations = new Map();
    }

    observe(target: any, options = {}) {
      if (!target) return;
      this.observations.set(target, options);

      // Simular callback inmediato sin error para máxima compatibilidad
      if (this.callback) {
        try {
          this.callback([{
            target,
            contentRect: { width: 100, height: 100, x: 0, y: 0, top: 0, right: 100, bottom: 100, left: 0 },
            borderBoxSize: [{ inlineSize: 100, blockSize: 100 }],
            contentBoxSize: [{ inlineSize: 100, blockSize: 100 }],
            devicePixelContentBoxSize: [{ inlineSize: 100, blockSize: 100 }]
          }], this);
        } catch (e) {
          // Silenciar errores en callback
        }
      }
    }

    unobserve(target: any) {
      if (target) {
        this.observations.delete(target);
      }
    }

    disconnect() {
      this.observations.clear();
    }
  };

  global.ResizeObserver = ResizeObserverMock as any;
  if (global.window) {
    (global.window as any).ResizeObserver = ResizeObserverMock;
  }
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).ResizeObserver = ResizeObserverMock;
  }
}

// ══════════════════════════════════════════════════════════════
// 2️⃣ MATCH MEDIA (20 líneas originales)
// ══════════════════════════════════════════════════════════════

/**
 * Mock de matchMedia para tests responsive y media queries
 *
 * Uso en test:
 * ```ts
 * import { setupMatchMediaMock } from '@/testing/mocks/browser-apis';
 *
 * beforeAll(() => {
 *   setupMatchMediaMock();
 * });
 * ```
 */
export function setupMatchMediaMock() {
  const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query || '',
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: matchMediaMock,
  });

  (global as any).matchMedia = matchMediaMock;
}

/**
 * Cleanup para matchMedia - llamar en afterEach si necesitas resetear
 */
export function cleanupMatchMediaMock() {
  if (global.matchMedia && vi.isMockFunction(global.matchMedia)) {
    (global.matchMedia as any).mockClear();
  }
}

// ══════════════════════════════════════════════════════════════
// 3️⃣ INTERSECTION OBSERVER (10 líneas originales)
// ══════════════════════════════════════════════════════════════

/**
 * Mock de IntersectionObserver para tests de lazy loading, infinite scroll
 *
 * Uso en test:
 * ```ts
 * import { setupIntersectionObserverMock } from '@/testing/mocks/browser-apis';
 *
 * beforeAll(() => {
 *   setupIntersectionObserverMock();
 * });
 * ```
 */
export function setupIntersectionObserverMock() {
  (global as any).IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
    root: null,
    rootMargin: '',
    thresholds: [],
    takeRecords: () => [],
  }));
}

/**
 * Cleanup para IntersectionObserver
 */
export function cleanupIntersectionObserverMock() {
  if (global.IntersectionObserver && vi.isMockFunction(global.IntersectionObserver)) {
    (global.IntersectionObserver as any).mockClear();
  }
}

// ══════════════════════════════════════════════════════════════
// 4️⃣ ANIMATION APIs (15 líneas originales)
// ══════════════════════════════════════════════════════════════

/**
 * Mock de requestAnimationFrame y cancelAnimationFrame para tests de animaciones
 *
 * Uso en test:
 * ```ts
 * import { setupAnimationApisMock } from '@/testing/mocks/browser-apis';
 *
 * beforeAll(() => {
 *   setupAnimationApisMock();
 * });
 * ```
 */
export function setupAnimationApisMock() {
  (global as any).requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
    return setTimeout(() => callback(performance.now()), 16) as any; // ~60fps
  });

  (global as any).cancelAnimationFrame = vi.fn((id: number) => {
    clearTimeout(id);
  });

  Object.defineProperty(global.performance, 'now', {
    value: vi.fn(() => Date.now()),
    writable: true
  });
}

/**
 * Cleanup para Animation APIs
 */
export function cleanupAnimationApisMock() {
  if (global.requestAnimationFrame && vi.isMockFunction(global.requestAnimationFrame)) {
    (global.requestAnimationFrame as any).mockClear();
  }
  if (global.cancelAnimationFrame && vi.isMockFunction(global.cancelAnimationFrame)) {
    (global.cancelAnimationFrame as any).mockClear();
  }
}

// ══════════════════════════════════════════════════════════════
// 5️⃣ GET COMPUTED STYLE (42 líneas originales)
// ══════════════════════════════════════════════════════════════

/**
 * Mock de getComputedStyle para tests de CSS animations, transforms
 *
 * Uso en test:
 * ```ts
 * import { setupGetComputedStyleMock } from '@/testing/mocks/browser-apis';
 *
 * beforeAll(() => {
 *   setupGetComputedStyleMock();
 * });
 * ```
 */
export function setupGetComputedStyleMock() {
  const mockGetComputedStyle = vi.fn((element: Element) => ({
    getPropertyValue: vi.fn((property: string) => {
      switch (property) {
        case 'transform':
          return 'none';
        case 'opacity':
          return '1';
        case 'transition':
          return 'none';
        case 'animation':
          return 'none';
        case 'backdrop-filter':
          return 'none';
        case 'filter':
          return 'none';
        case 'pointer-events':
          return 'auto';
        case 'overflow':
          return 'visible';
        default:
          return '';
      }
    }),
    transform: 'none',
    opacity: '1',
    transition: 'none',
    animation: 'none',
    backdropFilter: 'none',
    filter: 'none',
    pointerEvents: 'auto',
    overflow: 'visible',
    display: 'block',
    position: 'static',
    width: '100px',
    height: '100px'
  }));

  Object.defineProperty(window, 'getComputedStyle', {
    value: mockGetComputedStyle,
    writable: true
  });
}

// ══════════════════════════════════════════════════════════════
// 6️⃣ CSS.supports (15 líneas originales)
// ══════════════════════════════════════════════════════════════

/**
 * Mock de CSS.supports para tests de feature detection CSS
 *
 * Uso en test:
 * ```ts
 * import { setupCssSupportsMock } from '@/testing/mocks/browser-apis';
 *
 * beforeAll(() => {
 *   setupCssSupportsMock();
 * });
 * ```
 */
export function setupCssSupportsMock() {
  Object.defineProperty(CSS, 'supports', {
    value: vi.fn((property: string, value?: string) => {
      const supportedProperties = [
        'backdrop-filter',
        'filter',
        'transform',
        'transition',
        'animation',
        'opacity'
      ];
      return supportedProperties.some(prop => property.includes(prop));
    }),
    writable: true
  });
}

// ══════════════════════════════════════════════════════════════
// 🔧 HELPER UTILITIES
// ══════════════════════════════════════════════════════════════

/**
 * Setup ALL browser APIs mocks at once
 * Útil para tests que requieren múltiples APIs
 */
export function setupAllBrowserApisMocks() {
  setupResizeObserverMock();
  setupMatchMediaMock();
  setupIntersectionObserverMock();
  setupAnimationApisMock();
  setupGetComputedStyleMock();
  setupCssSupportsMock();
}

/**
 * Cleanup ALL browser APIs mocks
 * Llamar en afterEach para tests que usan setupAllBrowserApisMocks()
 */
export function cleanupAllBrowserApisMocks() {
  cleanupMatchMediaMock();
  cleanupIntersectionObserverMock();
  cleanupAnimationApisMock();
}
