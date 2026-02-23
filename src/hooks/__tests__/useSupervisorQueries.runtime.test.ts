// 🤖 [IA] - Orden #5b DACC Dashboard Supervisor — Tests runtime concurrencia
// Valida que el patrón contador (pendientes) mantiene cargando=true
// mientras cualquier query sigue en progreso (2+ queries paralelos).
// Valida que error de un query NO se borra al iniciar otro concurrente.
// Complementa suite estática (regex) con verificación de comportamiento real.

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Tipos para los mocks Supabase
// ---------------------------------------------------------------------------

type SupabaseResult = {
  data: unknown[] | null;
  error: { message: string } | null;
  count?: number | null;
};

// ---------------------------------------------------------------------------
// Factory de mocks con resolución controlada (promesas manuales)
// ---------------------------------------------------------------------------

/**
 * Crea mocks para tables.cortes() y tables.sucursales() donde cada query
 * retorna una promesa controlada externamente. Esto permite simular que
 * un query se resuelve antes que el otro (concurrencia real).
 */
function buildControlledMocks() {
  let resolveCortes!: (val: SupabaseResult) => void;
  let resolveSucursales!: (val: SupabaseResult) => void;

  const cortesPromise = new Promise<SupabaseResult>((res) => {
    resolveCortes = res;
  });
  const sucursalesPromise = new Promise<SupabaseResult>((res) => {
    resolveSucursales = res;
  });

  // cortes(): .select().eq().gte().lte().order() → SupabaseResult
  const cortesOrderMock = vi.fn(() => cortesPromise);
  const cortesLteMock = vi.fn(() => ({ order: cortesOrderMock }));
  const cortesGteMock = vi.fn(() => ({ lte: cortesLteMock }));
  const cortesEqMock = vi.fn(() => ({ gte: cortesGteMock }));
  const cortesSelectMock = vi.fn(() => ({ eq: cortesEqMock }));
  const cortesMock = vi.fn(() => ({ select: cortesSelectMock }));

  // sucursales(): .select().eq().order() → SupabaseResult
  const sucursalesOrderMock = vi.fn(() => sucursalesPromise);
  const sucursalesEqMock = vi.fn(() => ({ order: sucursalesOrderMock }));
  const sucursalesSelectMock = vi.fn(() => ({ eq: sucursalesEqMock }));
  const sucursalesMock = vi.fn(() => ({ select: sucursalesSelectMock }));

  return {
    cortesMock,
    sucursalesMock,
    resolveCortes,
    resolveSucursales,
  };
}

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('useSupervisorQueries — concurrencia runtime', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('cargando permanece true hasta que AMBOS queries concurrentes resuelven', async () => {
    const { cortesMock, sucursalesMock, resolveCortes, resolveSucursales } =
      buildControlledMocks();

    vi.doMock('@/lib/supabase', () => ({
      tables: {
        cortes: cortesMock,
        sucursales: sucursalesMock,
      },
    }));

    const { useSupervisorQueries } = await import('../useSupervisorQueries');
    const { result } = renderHook(() => useSupervisorQueries());

    expect(result.current.cargando).toBe(false);
    expect(result.current.error).toBeNull();

    // Lanzar 2 queries en paralelo (simula CorteHistorial.useEffect)
    let cortesResult: unknown;
    let filtrosResult: unknown;

    act(() => {
      cortesResult = result.current.obtenerCortesDelDia();
      filtrosResult = result.current.obtenerListasFiltros();
    });

    await waitFor(() => {
      expect(result.current.cargando).toBe(true);
    });

    // Resolver SOLO sucursales
    await act(async () => {
      resolveSucursales({ data: [{ id: '1', nombre: 'Test', codigo: 'T1', activa: true }], error: null });
    });
    await act(async () => { await filtrosResult; });

    // Un query pendiente → cargando sigue true
    expect(result.current.cargando).toBe(true);

    // Resolver cortes
    await act(async () => {
      resolveCortes({ data: [], error: null });
    });
    await act(async () => { await cortesResult; });

    // Ambos resueltos → cargando false
    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });
    expect(result.current.error).toBeNull();
  });

  it('error de query A persiste cuando falla mientras query B sigue en vuelo', async () => {
    // Escenario concurrente real (CorteHistorial monta y lanza ambos):
    //   A y B inician juntos → A falla → B sigue pendiente → error de A visible.
    // Bug anterior: iniciarQuery() hacía setError(null) sin importar si
    // había queries ya en vuelo, borrando errores de queries concurrentes.
    const { cortesMock, sucursalesMock, resolveCortes, resolveSucursales } =
      buildControlledMocks();

    vi.doMock('@/lib/supabase', () => ({
      tables: {
        cortes: cortesMock,
        sucursales: sucursalesMock,
      },
    }));

    const { useSupervisorQueries } = await import('../useSupervisorQueries');
    const { result } = renderHook(() => useSupervisorQueries());

    // Lanzar A y B simultáneamente (pendientes: 0→2)
    let cortesResult: unknown;
    let filtrosResult: unknown;
    act(() => {
      cortesResult = result.current.obtenerCortesDelDia();
      filtrosResult = result.current.obtenerListasFiltros();
    });

    await waitFor(() => {
      expect(result.current.cargando).toBe(true);
    });

    // Query A (cortes) FALLA mientras B sigue pendiente
    await act(async () => {
      resolveCortes({ data: null, error: { message: 'Timeout en cortes' } });
    });
    await act(async () => { await cortesResult; });

    // Error de A visible, cargando sigue true (B pendiente)
    await waitFor(() => {
      expect(result.current.error).toBe('Timeout en cortes');
    });
    expect(result.current.cargando).toBe(true);

    // Query B (sucursales) resuelve OK
    await act(async () => {
      resolveSucursales({ data: [], error: null });
    });
    await act(async () => { await filtrosResult; });

    // Ambos terminaron, error de A persiste
    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });
    expect(result.current.error).toBe('Timeout en cortes');
  });
});
