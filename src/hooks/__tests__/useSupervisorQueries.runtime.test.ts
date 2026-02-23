// 🤖 [IA] - Orden #5b DACC Dashboard Supervisor — Test runtime concurrencia
// Valida que el patrón contador (pendientes) mantiene cargando=true
// mientras cualquier query sigue en progreso (2+ queries paralelos).
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
  // Promesas controladas — resolvemos manualmente desde el test
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

    // Mock del módulo Supabase con promesas controladas
    vi.doMock('@/lib/supabase', () => ({
      tables: {
        cortes: cortesMock,
        sucursales: sucursalesMock,
      },
    }));

    const { useSupervisorQueries } = await import('../useSupervisorQueries');

    const { result } = renderHook(() => useSupervisorQueries());

    // Estado inicial: sin queries en progreso
    expect(result.current.cargando).toBe(false);
    expect(result.current.error).toBeNull();

    // ── Lanzar 2 queries en paralelo (simula CorteHistorial.useEffect) ──
    let cortesResult: unknown;
    let filtrosResult: unknown;

    act(() => {
      cortesResult = result.current.obtenerCortesDelDia();
      filtrosResult = result.current.obtenerListasFiltros();
    });

    // Ambos queries lanzados → cargando DEBE ser true
    await waitFor(() => {
      expect(result.current.cargando).toBe(true);
    });

    // ── Resolver SOLO el primer query (sucursales) ──────────────────────
    await act(async () => {
      resolveSucursales({ data: [{ id: '1', nombre: 'Test', codigo: 'T1', activa: true }], error: null });
    });

    // Esperar a que el hook procese la resolución de sucursales
    await act(async () => {
      await filtrosResult;
    });

    // Primer query resolvió pero segundo sigue pendiente →
    // cargando DEBE seguir true (patrón contador: pendientes = 1 > 0)
    expect(result.current.cargando).toBe(true);

    // ── Resolver el segundo query (cortes) ──────────────────────────────
    await act(async () => {
      resolveCortes({ data: [], error: null });
    });

    // Esperar a que el hook procese la resolución de cortes
    await act(async () => {
      await cortesResult;
    });

    // AMBOS queries resolvieron → cargando DEBE ser false
    // (pendientes = 0, NO > 0)
    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    // Sin errores
    expect(result.current.error).toBeNull();
  });
});
