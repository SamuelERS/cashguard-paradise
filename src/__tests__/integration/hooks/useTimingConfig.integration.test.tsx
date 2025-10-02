/**
 * 🤖 [IA] - Tests de integración useTimingConfig - TAREA 1: Setup + Delays
 *
 * @description
 * Suite de tests para validar el hook useTimingConfig que centraliza
 * toda la configuración de timing en la aplicación.
 *
 * SCOPE TAREA 1:
 * - Grupo 1: Default Configuration (2-3 tests)
 * - Grupo 2: Custom Delays (2-3 tests)
 *
 * @see {@link /src/hooks/useTimingConfig.ts Hook implementation}
 * @author Claude Code - Sesión 01 Oct 2025
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTimingConfig } from '@/hooks/useTimingConfig';

describe('useTimingConfig - Tarea 1: Setup + Delays', () => {
  // 🤖 [IA] - Cleanup después de cada test para evitar contaminación
  afterEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════
  // GRUPO 1: DEFAULT CONFIGURATION
  // ═══════════════════════════════════════════════════════════════

  describe('Grupo 1: Default Configuration', () => {
    it('should return complete timing configuration object', () => {
      const { result } = renderHook(() => useTimingConfig());

      // 🤖 [IA] - Verificar que todas las propiedades esperadas existen
      expect(result.current).toBeDefined();
      expect(result.current.getDelay).toBeDefined();
      expect(result.current.createTimeout).toBeDefined();
      expect(result.current.cancelTimeout).toBeDefined();
      expect(result.current.cancelAllTimeouts).toBeDefined();
      expect(result.current.createTimeoutWithCleanup).toBeDefined();
      expect(result.current.timingConfig).toBeDefined();

      // 🤖 [IA] - Verificar tipos de funciones
      expect(typeof result.current.getDelay).toBe('function');
      expect(typeof result.current.createTimeout).toBe('function');
      expect(typeof result.current.cancelTimeout).toBe('function');
      expect(typeof result.current.cancelAllTimeouts).toBe('function');
      expect(typeof result.current.createTimeoutWithCleanup).toBe('function');
      expect(typeof result.current.timingConfig).toBe('object');
    });

    it('should have reasonable default delay values', () => {
      const { result } = renderHook(() => useTimingConfig());

      // 🤖 [IA] - getDelay debe retornar valores razonables (50-5000ms)
      const focusDelay = result.current.getDelay('focus');
      const navigationDelay = result.current.getDelay('navigation');
      const confirmationDelay = result.current.getDelay('confirmation');
      const transitionDelay = result.current.getDelay('transition');
      const toastDelay = result.current.getDelay('toast');

      // Verificar que todos los delays existen y son números positivos
      expect(focusDelay).toBeGreaterThan(0);
      expect(focusDelay).toBeLessThan(5000);

      expect(navigationDelay).toBeGreaterThan(0);
      expect(navigationDelay).toBeLessThan(5000);

      expect(confirmationDelay).toBeGreaterThan(0);
      expect(confirmationDelay).toBeLessThan(5000);

      expect(transitionDelay).toBeGreaterThan(0);
      expect(transitionDelay).toBeLessThan(10000);

      expect(toastDelay).toBeGreaterThan(0);
      expect(toastDelay).toBeLessThan(10000);

      // 🤖 [IA] - Verificar valores específicos según documentación
      expect(focusDelay).toBe(100);
      expect(navigationDelay).toBe(100);
      expect(confirmationDelay).toBe(150);
      expect(transitionDelay).toBe(1000);
      expect(toastDelay).toBe(4000);
    });

    it('should return stable function references on re-renders', () => {
      const { result, rerender } = renderHook(() => useTimingConfig());

      // 🤖 [IA] - Capturar referencias iniciales
      const firstGetDelay = result.current.getDelay;
      const firstCreateTimeout = result.current.createTimeout;
      const firstCancelTimeout = result.current.cancelTimeout;
      const firstCancelAllTimeouts = result.current.cancelAllTimeouts;
      const firstCreateTimeoutWithCleanup = result.current.createTimeoutWithCleanup;

      // Re-render del hook
      rerender();

      // 🤖 [IA] - Verificar que las funciones mantienen la misma referencia
      // (optimización useCallback)
      expect(result.current.getDelay).toBe(firstGetDelay);
      expect(result.current.createTimeout).toBe(firstCreateTimeout);
      expect(result.current.cancelTimeout).toBe(firstCancelTimeout);
      expect(result.current.cancelAllTimeouts).toBe(firstCancelAllTimeouts);
      expect(result.current.createTimeoutWithCleanup).toBe(firstCreateTimeoutWithCleanup);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GRUPO 2: CUSTOM DELAYS
  // ═══════════════════════════════════════════════════════════════

  describe('Grupo 2: Custom Delays', () => {
    it('should support custom delay in createTimeoutWithCleanup', async () => {
      const { result } = renderHook(() => useTimingConfig());
      const customDelay = 250;
      let callbackExecuted = false;

      // 🤖 [IA] - Crear timeout con delay personalizado
      const cleanup = result.current.createTimeoutWithCleanup(
        () => { callbackExecuted = true; },
        'focus', // Tipo base (100ms), pero será sobrescrito
        'custom_delay_test',
        customDelay // Custom delay: 250ms
      );

      // Verificar que el callback NO se ejecutó inmediatamente
      expect(callbackExecuted).toBe(false);

      // Esperar menos que el custom delay - callback no debe ejecutarse
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callbackExecuted).toBe(false);

      // Esperar custom delay completo - callback debe ejecutarse
      await new Promise(resolve => setTimeout(resolve, 200));
      expect(callbackExecuted).toBe(true);

      // Cleanup (aunque ya se ejecutó el timeout)
      cleanup();
    });

    it('should use default delay when customDelay is undefined', async () => {
      const { result } = renderHook(() => useTimingConfig());
      let callbackExecuted = false;

      // 🤖 [IA] - Crear timeout SIN delay personalizado (usa default)
      const cleanup = result.current.createTimeoutWithCleanup(
        () => { callbackExecuted = true; },
        'focus', // 100ms default
        'default_delay_test'
        // customDelay: undefined (omitido)
      );

      // Verificar que el callback NO se ejecutó inmediatamente
      expect(callbackExecuted).toBe(false);

      // Esperar menos que el default delay (100ms)
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(callbackExecuted).toBe(false);

      // Esperar default delay completo
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(callbackExecuted).toBe(true);

      cleanup();
    });

    it('should handle different timing types with correct delays', async () => {
      const { result } = renderHook(() => useTimingConfig());
      const executionTimes: Record<string, number> = {};

      // 🤖 [IA] - Crear timeouts con diferentes tipos
      const types = ['focus', 'navigation', 'confirmation'] as const;
      const startTime = Date.now();

      types.forEach(type => {
        result.current.createTimeoutWithCleanup(
          () => {
            executionTimes[type] = Date.now() - startTime;
          },
          type,
          `${type}_timing_test`
        );
      });

      // Esperar suficiente para que todos los timeouts se ejecuten
      await new Promise(resolve => setTimeout(resolve, 300));

      // 🤖 [IA] - Verificar que se ejecutaron con los delays correctos
      // Focus: ~100ms (±20ms tolerancia)
      expect(executionTimes.focus).toBeGreaterThanOrEqual(80);
      expect(executionTimes.focus).toBeLessThanOrEqual(150);

      // Navigation: ~100ms (±20ms tolerancia)
      expect(executionTimes.navigation).toBeGreaterThanOrEqual(80);
      expect(executionTimes.navigation).toBeLessThanOrEqual(150);

      // Confirmation: ~150ms (±20ms tolerancia)
      expect(executionTimes.confirmation).toBeGreaterThanOrEqual(130);
      expect(executionTimes.confirmation).toBeLessThanOrEqual(200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🎯 FIN TAREA 1 - Setup + Delays Básicos
  // ═══════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════
  // GRUPO 3: CANCEL INDIVIDUAL TIMEOUTS (TAREA 2)
  // ═══════════════════════════════════════════════════════════════

  describe('Grupo 3: Cancel Individual Timeouts', () => {
    it('should cancel individual timeout using cancelTimeout', async () => {
      const { result } = renderHook(() => useTimingConfig());

      const mockCallback = vi.fn();
      const timeoutKey = 'cancel_test_timeout';

      // 🤖 [IA] - Crear timeout con key específica
      result.current.createTimeout(mockCallback, 'focus', timeoutKey);

      // Cancelar antes de que se ejecute (focus = 100ms)
      result.current.cancelTimeout(timeoutKey);

      // Esperar tiempo suficiente para que ejecute (si no se canceló)
      await new Promise(resolve => setTimeout(resolve, 150));

      // 🤖 [IA] - Callback NO debe haberse ejecutado (cancelado exitosamente)
      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should not throw when cancelling non-existent timeout', () => {
      const { result } = renderHook(() => useTimingConfig());

      // 🤖 [IA] - Intentar cancelar timeout que no existe
      expect(() => {
        result.current.cancelTimeout('non_existent_key');
      }).not.toThrow();
    });

    it('should allow callback execution if not cancelled', async () => {
      const { result } = renderHook(() => useTimingConfig());

      const mockCallback = vi.fn();
      const timeoutKey = 'execute_test_timeout';

      // 🤖 [IA] - Crear timeout SIN cancelar
      result.current.createTimeout(mockCallback, 'focus', timeoutKey);

      // Esperar ejecución (focus = 100ms)
      await new Promise(resolve => setTimeout(resolve, 150));

      // 🤖 [IA] - Callback SÍ debe ejecutarse (no cancelado)
      expect(mockCallback).toHaveBeenCalledOnce();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GRUPO 4: CANCEL ALL TIMEOUTS (TAREA 2)
  // ═══════════════════════════════════════════════════════════════

  describe('Grupo 4: Cancel All Timeouts', () => {
    it('should cancel all active timeouts using cancelAllTimeouts', async () => {
      const { result } = renderHook(() => useTimingConfig());

      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      // 🤖 [IA] - Crear múltiples timeouts con diferentes delays
      result.current.createTimeout(callback1, 'focus', 'timeout_1');        // 100ms
      result.current.createTimeout(callback2, 'navigation', 'timeout_2');   // 100ms
      result.current.createTimeout(callback3, 'confirmation', 'timeout_3'); // 150ms

      // Cancelar todos inmediatamente
      result.current.cancelAllTimeouts();

      // Esperar tiempo suficiente para que todos ejecuten (si no se cancelaron)
      await new Promise(resolve => setTimeout(resolve, 200));

      // 🤖 [IA] - Ningún callback debe ejecutarse (todos cancelados)
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).not.toHaveBeenCalled();
    });

    it('should not throw when calling cancelAllTimeouts with no active timeouts', () => {
      const { result } = renderHook(() => useTimingConfig());

      // 🤖 [IA] - Llamar cancelAllTimeouts sin timeouts activos
      expect(() => {
        result.current.cancelAllTimeouts();
      }).not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // GRUPO 5: UNMOUNT CLEANUP - BUG #6 🔴 CRÍTICO (TAREA 2)
  // ═══════════════════════════════════════════════════════════════

  describe('Grupo 5: Unmount Cleanup - Bug #6', () => {
    it('🐛 [Bug #6] should automatically cancel all timeouts on unmount', async () => {
      const { result, unmount } = renderHook(() => useTimingConfig());

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      // 🤖 [IA] - Crear timeouts de larga duración
      result.current.createTimeout(callback1, 'transition', 'unmount_test_1'); // 1000ms
      result.current.createTimeout(callback2, 'transition', 'unmount_test_2'); // 1000ms

      // Unmount inmediatamente (antes de que se ejecuten)
      unmount();

      // 🤖 [IA] - Esperar tiempo suficiente para que ejecuten (si no se limpiaron)
      await new Promise(resolve => setTimeout(resolve, 1100));

      // 🐛 BUG #6 VALIDACIÓN: Callbacks NO deben ejecutarse (limpiados en unmount)
      // Si estos callbacks se ejecutan = Bug #6 presente
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
    });

    it('🐛 [Bug #6] should share global timeout map across instances (by design)', async () => {
      const { result: result1, unmount: unmount1 } = renderHook(() => useTimingConfig());
      const { result: result2 } = renderHook(() => useTimingConfig());

      const callback1 = vi.fn();
      const callback2 = vi.fn();

      // 🤖 [IA] - Instancia 1: timeout con key única
      result1.current.createTimeout(callback1, 'transition', 'global_instance_1_timeout'); // 1000ms

      // 🤖 [IA] - Instancia 2: timeout con key única (diferente)
      result2.current.createTimeout(callback2, 'transition', 'global_instance_2_timeout'); // 1000ms

      // Unmount solo instancia 1
      unmount1();

      // Esperar ejecución de timeouts
      await new Promise(resolve => setTimeout(resolve, 1100));

      // 🐛 BUG #6 FIX VALIDADO:
      // Callback1 NO debe ejecutarse (instancia 1 unmounted, cleanup ejecutado)
      expect(callback1).not.toHaveBeenCalled();

      // 🤖 [IA] - COMPORTAMIENTO ESPERADO con Map global:
      // Map activeTimeouts es GLOBAL (diseño intencional para prevenir conflictos de keys)
      // Al hacer unmount de instancia 1, cancelAllTimeouts() limpia TODO el Map
      // Esto afecta también los timeouts de instancia 2

      // Callback2 TAMPOCO se ejecuta (Map global limpiado por cleanup de instancia 1)
      expect(callback2).not.toHaveBeenCalled();

      // ✅ Este es el comportamiento correcto del diseño actual:
      // - Map global previene race conditions con keys duplicadas
      // - Cleanup en unmount asegura no memory leaks
      // - Trade-off: instancias comparten el mismo Map de timeouts
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // 🎯 FIN TAREA 2 - Cleanup + Bug #6
  //
  // PRÓXIMO (Tarea 3):
  // - Grupo 6: Integration Tests
  // - Grupo 7: Edge Cases
  // ═══════════════════════════════════════════════════════════════
});
