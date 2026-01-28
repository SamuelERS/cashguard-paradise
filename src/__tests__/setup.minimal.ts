// 🤖 [IA] - OPERACIÓN ISLA RÁPIDA - Setup Mínimo (Tarea B)
// Reducido de 321 líneas a ≤108 líneas (polyfills esenciales únicamente)
// Ref: docs/qa/tests/031-operacion-isla-rapida.md

import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// ══════════════════════════════════════════════════════════════
// 1️⃣ TESTING LIBRARY SETUP (Universal - ~20 líneas)
// ══════════════════════════════════════════════════════════════

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// ══════════════════════════════════════════════════════════════
// GUARDRAILS ANTI-FLAKE (Tarea E)
// ══════════════════════════════════════════════════════════════
// Cleanup automático después de cada test para evitar:
// - Memory leaks (React components no unmounted)
// - Mock contamination (vi.fn() con estado previo)
// - DOM pollution (elementos HTML persistentes)

afterEach(() => {
  // 1. Cleanup React components y DOM
  cleanup();

  // 2. Restore todos los mocks de Vitest
  vi.restoreAllMocks();

  // 3. Clear todos los mocks (si no se restauraron)
  vi.clearAllMocks();

  // Nota: Storage mocks ahora manejados por módulos específicos
  // Importar y llamar cleanupAllStorageMocks() si es necesario en test individual
});

// ══════════════════════════════════════════════════════════════
// 2️⃣ JSDOM POLYFILLS - Radix UI Pointer Capture (43 líneas)
// ══════════════════════════════════════════════════════════════
// JUSTIFICACIÓN: Radix UI requiere estas APIs que JSDOM no implementa
// NO son mocks, son polyfills verdaderos de APIs faltantes
// Referencias:
// - https://github.com/radix-ui/primitives/issues/420
// - https://github.com/jsdom/jsdom/issues/3128

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
}

// ══════════════════════════════════════════════════════════════
// 3️⃣ JSDOM POLYFILLS - Scroll APIs (37 líneas)
// ══════════════════════════════════════════════════════════════
// JUSTIFICACIÓN: Radix UI Select requiere scrollIntoView
// JSDOM no implementa estas APIs de scroll
// Referencias:
// - Error específico: @radix-ui/react-select/src/select.tsx:590:22
// - TypeError: candidate?.scrollIntoView is not a function

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
}

// ══════════════════════════════════════════════════════════════
// RESUMEN SETUP MÍNIMO
// ══════════════════════════════════════════════════════════════
// Total líneas: ~94 (≤108 objetivo cumplido)
//
// REMOVIDO (ahora en módulos):
// - ResizeObserver (46 líneas) → mocks/browser-apis.ts
// - matchMedia (20 líneas) → mocks/browser-apis.ts
// - IntersectionObserver (10 líneas) → mocks/browser-apis.ts
// - Animation APIs (15 líneas) → mocks/browser-apis.ts
// - getComputedStyle (42 líneas) → mocks/browser-apis.ts
// - CSS.supports (15 líneas) → mocks/browser-apis.ts
// - Storage mocks (30 líneas) → mocks/storage.ts
// - Console suppression (13 líneas) → ELIMINADO (anti-pattern)
// - Body style override (15 líneas) → ELIMINADO (revisión pendiente)
//
// MANTENIDO (esencial):
// ✅ Testing Library cleanup (14 líneas)
// ✅ Radix UI Pointer Capture polyfills (43 líneas)
// ✅ Radix UI Scroll APIs polyfills (37 líneas)
