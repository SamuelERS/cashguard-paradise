// 🤖 [IA] - CASO #3 RESILIENCIA OFFLINE (Iteración 2) — Tests useConnectionStatus
// TDD RED: Hook no existe aún → todos los tests fallan al importar.
// 3 tests: offline event, online→reconectando→online, debounce 2s callback.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useConnectionStatus } from '../useConnectionStatus';

// ---------------------------------------------------------------------------
// Helpers — Simular eventos window online/offline
// ---------------------------------------------------------------------------

function fireOfflineEvent(): void {
  window.dispatchEvent(new Event('offline'));
}

function fireOnlineEvent(): void {
  window.dispatchEvent(new Event('online'));
}

// ---------------------------------------------------------------------------
// Suite 1: useConnectionStatus — estado de conexión reactivo
// ---------------------------------------------------------------------------

describe('useConnectionStatus — estado de conexión reactivo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Default: navigator.onLine = true
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('1.1 - evento offline cambia estadoConexion a "offline"', () => {
    const { result } = renderHook(() => useConnectionStatus());

    // Estado inicial: online
    expect(result.current.estadoConexion).toBe('online');

    // Simular pérdida de conexión
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
      fireOfflineEvent();
    });

    // Debe reflejar offline
    expect(result.current.estadoConexion).toBe('offline');
  });

  it('1.2 - evento online transiciona: reconectando → online (con debounce)', () => {
    const { result } = renderHook(() => useConnectionStatus());

    // Primero: ir a offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
      fireOfflineEvent();
    });
    expect(result.current.estadoConexion).toBe('offline');

    // Reconectar
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
      fireOnlineEvent();
    });

    // Inmediatamente después del evento online: debe estar en 'reconectando'
    expect(result.current.estadoConexion).toBe('reconectando');

    // Después del debounce (2s): debe transicionar a 'online'
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.estadoConexion).toBe('online');
  });

  it('1.3 - evento online dispara callback onReconexion con debounce 2s', () => {
    const onReconexion = vi.fn();
    const { result } = renderHook(() => useConnectionStatus({ onReconexion }));

    // Ir a offline
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true, configurable: true });
      fireOfflineEvent();
    });

    // Reconectar
    act(() => {
      Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
      fireOnlineEvent();
    });

    // Callback NO debe haberse ejecutado aún (debounce 2s pendiente)
    expect(onReconexion).not.toHaveBeenCalled();

    // Avanzar 2s — debounce completo
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Ahora sí: callback ejecutado exactamente 1 vez
    expect(onReconexion).toHaveBeenCalledTimes(1);

    // Estado final: online
    expect(result.current.estadoConexion).toBe('online');
  });
});
