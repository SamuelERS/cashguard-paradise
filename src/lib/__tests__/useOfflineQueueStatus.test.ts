// 🤖 [IA] - CASO #3 RESILIENCIA OFFLINE — Iteración 3b: TDD RED
// Hook reactivo para estado de cola offline con polling

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOfflineQueueStatus } from '../useOfflineQueueStatus';
import type { EstadoCola } from '../offlineQueue';

// ─── Mock de offlineQueue ───────────────────────────────────────────────────

const mockObtenerEstadoCola = vi.fn<[], EstadoCola>();

vi.mock('../offlineQueue', () => ({
  obtenerEstadoCola: () => mockObtenerEstadoCola(),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

const ESTADO_VACIO: EstadoCola = {
  total: 0,
  pendientes: 0,
  procesando: 0,
  fallidas: 0,
  estaVacia: true,
};

const ESTADO_CON_PENDIENTES: EstadoCola = {
  total: 3,
  pendientes: 2,
  procesando: 1,
  fallidas: 0,
  estaVacia: false,
};

const ESTADO_CON_FALLIDAS: EstadoCola = {
  total: 5,
  pendientes: 0,
  procesando: 0,
  fallidas: 5,
  estaVacia: false,
};

// ─── Suite 1: Estado inicial ────────────────────────────────────────────────

describe('useOfflineQueueStatus — estado inicial', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockObtenerEstadoCola.mockReturnValue(ESTADO_VACIO);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('1.1 - Retorna estado de cola al montar', () => {
    const { result } = renderHook(() => useOfflineQueueStatus());
    expect(result.current).toEqual(ESTADO_VACIO);
  });

  it('1.2 - Lee obtenerEstadoCola al menos una vez al montar', () => {
    renderHook(() => useOfflineQueueStatus());
    expect(mockObtenerEstadoCola).toHaveBeenCalled();
  });
});

// ─── Suite 2: Reactividad por polling ───────────────────────────────────────

describe('useOfflineQueueStatus — reactividad por polling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockObtenerEstadoCola.mockReturnValue(ESTADO_VACIO);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('2.1 - Actualiza estado cuando cola cambia en siguiente tick de polling', () => {
    const { result } = renderHook(() => useOfflineQueueStatus());

    // Inicialmente vacía
    expect(result.current.pendientes).toBe(0);

    // Simular cambio en cola (otra parte del código encoló algo)
    mockObtenerEstadoCola.mockReturnValue(ESTADO_CON_PENDIENTES);

    // Avanzar el intervalo de polling
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.pendientes).toBe(2);
    expect(result.current.total).toBe(3);
  });

  it('2.2 - Polling periódico detecta cola vaciándose', () => {
    mockObtenerEstadoCola.mockReturnValue(ESTADO_CON_PENDIENTES);
    const { result } = renderHook(() => useOfflineQueueStatus());

    expect(result.current.pendientes).toBe(2);

    // Cola se vacía (procesarCola tuvo éxito)
    mockObtenerEstadoCola.mockReturnValue(ESTADO_VACIO);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.pendientes).toBe(0);
    expect(result.current.estaVacia).toBe(true);
  });

  it('2.3 - No re-renderiza si estado no cambió (referencia estable)', () => {
    const { result } = renderHook(() => useOfflineQueueStatus());
    const primeraReferencia = result.current;

    // Mismo estado exacto
    mockObtenerEstadoCola.mockReturnValue({ ...ESTADO_VACIO });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Si valores idénticos, debería mantener referencia estable
    expect(result.current.pendientes).toBe(primeraReferencia.pendientes);
    expect(result.current.total).toBe(primeraReferencia.total);
  });
});

// ─── Suite 3: Cleanup ───────────────────────────────────────────────────────

describe('useOfflineQueueStatus — cleanup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockObtenerEstadoCola.mockReturnValue(ESTADO_VACIO);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('3.1 - Limpia intervalo al desmontar (no memory leak)', () => {
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const { unmount } = renderHook(() => useOfflineQueueStatus());

    unmount();

    expect(clearIntervalSpy).toHaveBeenCalled();
    clearIntervalSpy.mockRestore();
  });
});

// ─── Suite 4: Integración con CashCounter (static test) ─────────────────────

describe('useOfflineQueueStatus — contrato estático', () => {
  it('4.1 - Retorna la misma estructura que EstadoCola', () => {
    vi.useFakeTimers();
    mockObtenerEstadoCola.mockReturnValue(ESTADO_CON_FALLIDAS);

    const { result } = renderHook(() => useOfflineQueueStatus());

    // Verificar que todas las propiedades de EstadoCola están presentes
    expect(result.current).toHaveProperty('total');
    expect(result.current).toHaveProperty('pendientes');
    expect(result.current).toHaveProperty('procesando');
    expect(result.current).toHaveProperty('fallidas');
    expect(result.current).toHaveProperty('estaVacia');

    // Verificar tipos
    expect(typeof result.current.total).toBe('number');
    expect(typeof result.current.pendientes).toBe('number');
    expect(typeof result.current.estaVacia).toBe('boolean');

    vi.useRealTimers();
  });
});
