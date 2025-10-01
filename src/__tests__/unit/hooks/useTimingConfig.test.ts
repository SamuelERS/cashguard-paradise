/**
 * Tests para useTimingConfig
 * Hook crítico para prevención de race conditions
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTimingConfig } from '@/hooks/useTimingConfig';

describe('useTimingConfig', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('getDelay', () => {
    it('debe retornar delays correctos para cada tipo', () => {
      const { result } = renderHook(() => useTimingConfig());

      expect(result.current.getDelay('focus')).toBe(100);
      expect(result.current.getDelay('navigation')).toBe(100);
      expect(result.current.getDelay('confirmation')).toBe(150);
      expect(result.current.getDelay('transition')).toBe(1000);
      expect(result.current.getDelay('toast')).toBe(4000);
    });
  });

  describe('createTimeout', () => {
    it('debe crear un timeout con el delay correcto', () => {
      const { result } = renderHook(() => useTimingConfig());
      const callback = vi.fn();

      act(() => {
        result.current.createTimeout(callback, 'focus');
      });

      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('debe cancelar timeout anterior con misma key', () => {
      const { result } = renderHook(() => useTimingConfig());
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      act(() => {
        result.current.createTimeout(callback1, 'focus', 'test-key');
        result.current.createTimeout(callback2, 'focus', 'test-key');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancelTimeout', () => {
    it('debe cancelar un timeout por key', () => {
      const { result } = renderHook(() => useTimingConfig());
      const callback = vi.fn();

      act(() => {
        result.current.createTimeout(callback, 'focus', 'cancel-test');
        result.current.cancelTimeout('cancel-test');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('cancelAllTimeouts', () => {
    it('debe cancelar todos los timeouts activos', () => {
      const { result } = renderHook(() => useTimingConfig());
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      act(() => {
        result.current.createTimeout(callback1, 'focus', 'key1');
        result.current.createTimeout(callback2, 'navigation', 'key2');
        result.current.createTimeout(callback3, 'confirmation', 'key3');
        result.current.cancelAllTimeouts();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).not.toHaveBeenCalled();
      expect(callback3).not.toHaveBeenCalled();
    });
  });

  describe('createTimeoutWithCleanup', () => {
    it('debe retornar función de cleanup', () => {
      const { result } = renderHook(() => useTimingConfig());
      const callback = vi.fn();

      let cleanup: () => void;
      act(() => {
        cleanup = result.current.createTimeoutWithCleanup(callback, 'focus');
      });

      expect(typeof cleanup!).toBe('function');
    });

    it('debe ejecutar callback después del delay', () => {
      const { result } = renderHook(() => useTimingConfig());
      const callback = vi.fn();

      act(() => {
        result.current.createTimeoutWithCleanup(callback, 'focus');
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('debe permitir delay personalizado', () => {
      const { result } = renderHook(() => useTimingConfig());
      const callback = vi.fn();

      act(() => {
        result.current.createTimeoutWithCleanup(callback, 'focus', undefined, 500);
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(callback).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('cleanup debe cancelar el timeout', () => {
      const { result } = renderHook(() => useTimingConfig());
      const callback = vi.fn();

      let cleanup: () => void;
      act(() => {
        cleanup = result.current.createTimeoutWithCleanup(callback, 'focus', 'cleanup-test');
        cleanup();
      });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('timingConfig', () => {
    it('debe exponer la configuración de timing', () => {
      const { result } = renderHook(() => useTimingConfig());

      expect(result.current.timingConfig).toEqual({
        focus: 100,
        navigation: 100,
        confirmation: 150,
        transition: 1000,
        toast: 4000,
      });
    });
  });
});
