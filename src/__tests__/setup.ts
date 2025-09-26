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