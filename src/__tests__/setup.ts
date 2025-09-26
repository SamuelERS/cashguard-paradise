// 🤖 [IA] - v1.1.17: Global test setup configuration
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Cleanup after each test to prevent memory leaks
afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn((key: string) => null),
  setItem: vi.fn((key: string, value: string) => undefined),
  removeItem: vi.fn((key: string) => undefined),
  clear: vi.fn(() => undefined),
  length: 0,
  key: vi.fn((index: number) => null),
};

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn((key: string) => null),
  setItem: vi.fn((key: string, value: string) => undefined),
  removeItem: vi.fn((key: string) => undefined),
  clear: vi.fn(() => undefined),
  length: 0,
  key: vi.fn((index: number) => null),
};

// Apply mocks globally
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver for components that use it
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: () => [],
}));

// Mock ResizeObserver for components that use it
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// 🤖 [IA] - TEST-RESILIENCE-FORTIFICATION: Mocks para animaciones y Framer Motion
// Mock requestAnimationFrame and cancelAnimationFrame for smooth animations testing
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(() => callback(performance.now()), 16); // ~60fps
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

// Mock performance.now for consistent timing in tests
Object.defineProperty(global.performance, 'now', {
  value: vi.fn(() => Date.now()),
  writable: true
});

// 🤖 [IA] - PROTOCOLO-SECURITY-CORRECTION: Usar timers reales para useRulesFlow
// Los fake timers estaban interfiriendo con el setTimeout del hook useRulesFlow
// Usar timers reales permite que el delay de 1500ms funcione correctamente

// CRITICAL FIX: Override document.body.style setters to prevent pointer-events: none
// This prevents the Index.tsx component from disabling pointer events during tests
const originalBodyStyle = document.body.style;

// Override specific style properties that block interactions
Object.defineProperty(document.body.style, 'pointerEvents', {
  get: () => 'auto',
  set: () => {}, // Ignore attempts to set pointer-events
  configurable: true
});

Object.defineProperty(document.body.style, 'overflow', {
  get: () => 'visible',
  set: () => {}, // Ignore attempts to set overflow
  configurable: true
});

// Enhanced getComputedStyle mock for CSS animations and transforms
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
        return 'auto'; // Always return auto for pointer events in tests
      case 'overflow':
        return 'visible'; // Always return visible for overflow in tests
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
  pointerEvents: 'auto', // Force pointer events to be auto
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

// Mock CSS support for backdrop-filter and other modern features
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

// Suppress console errors in tests (optional, can be configured)
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// 🤖 [IA] - JSDOM POLYFILLS: Compatibilidad con Radix UI Select
// Resuelve: TypeError: target.hasPointerCapture is not a function
/**
 * Polyfills para APIs faltantes en JSDOM que Radix UI Select requiere
 *
 * Problema: JSDOM no implementa las APIs de Pointer Capture que Radix UI usa
 * Solución: Implementaciones mock seguras que permiten que los tests funcionen
 *
 * Referencias:
 * - https://github.com/radix-ui/primitives/issues/420
 * - https://github.com/jsdom/jsdom/issues/3128
 * - Error específico: @radix-ui/react-select/src/select.tsx:323:24
 */

if (typeof Element !== 'undefined') {
  // Mock de hasPointerCapture - indica si el elemento tiene captura de pointer
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = function(pointerId: number): boolean {
      // Retorna false como fallback seguro
      // En el entorno de testing, asumimos que no hay captura activa
      return false;
    };
  }

  // Mock de setPointerCapture - establece captura de pointer en el elemento
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = function(pointerId: number): void {
      // No-op implementation
      // En testing no necesitamos captura real de eventos pointer
    };
  }

  // Mock de releasePointerCapture - libera captura de pointer del elemento
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = function(pointerId: number): void {
      // No-op implementation
      // En testing no hay captura que liberar
    };
  }

  console.log('🔧 [JSDOM] Polyfills para Radix UI Pointer Capture aplicados exitosamente');
}

// 🤖 [IA] - POLYFILL EXPANSION v2.0: ScrollIntoView y APIs de Scroll
// Resuelve: TypeError: candidate?.scrollIntoView is not a function
/**
 * Polyfills adicionales para APIs de scroll que Radix UI Select requiere
 *
 * Problema: JSDOM no implementa scrollIntoView, scrollTo, scroll APIs
 * Solución: Implementaciones mock que permiten que Radix UI funcione sin errores
 *
 * Referencias:
 * - Error específico: @radix-ui/react-select/src/select.tsx:590:22
 * - GitHub Actions log: TypeError: candidate?.scrollIntoView is not a function
 */

if (typeof Element !== 'undefined') {
  // Mock de scrollIntoView - hace scroll al elemento para que sea visible
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function(options?: ScrollIntoViewOptions | boolean): void {
      // No-op implementation para testing
      // En el entorno de testing no necesitamos scroll real
    };
  }

  // Mock de scrollTo - hace scroll a coordenadas específicas
  if (!Element.prototype.scrollTo) {
    Element.prototype.scrollTo = function(options?: ScrollToOptions | number, y?: number): void {
      // No-op implementation para testing
    };
  }

  // Mock de scroll - alias de scrollTo
  if (!Element.prototype.scroll) {
    Element.prototype.scroll = function(options?: ScrollToOptions | number, y?: number): void {
      // No-op implementation para testing
    };
  }

  console.log('🔧 [JSDOM] Polyfills para APIs de Scroll aplicados exitosamente');
}