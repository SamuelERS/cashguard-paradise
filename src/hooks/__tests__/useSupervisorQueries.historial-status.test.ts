import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function buildCortesQueryMock() {
  const query = {
    select: vi.fn(),
    eq: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    then: vi.fn(),
  };

  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.gte.mockReturnValue(query);
  query.lte.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.range.mockReturnValue(query);
  query.then.mockImplementation((resolve: (value: unknown) => unknown) =>
    Promise.resolve(resolve({ data: [], error: null, count: 0 })),
  );

  return query;
}

describe('useSupervisorQueries.obtenerHistorial - filtro por estado', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('usa created_at cuando el estado es TODOS', async () => {
    const cortesQuery = buildCortesQueryMock();

    vi.doMock('@/lib/supabase', () => ({
      tables: {
        cortes: vi.fn(() => cortesQuery),
      },
    }));

    const { useSupervisorQueries } = await import('../useSupervisorQueries');
    const { result } = renderHook(() => useSupervisorQueries());

    await act(async () => {
      await result.current.obtenerHistorial({
        fechaDesde: '2026-02-17',
        fechaHasta: '2026-02-24',
        estado: 'TODOS',
        pagina: 1,
      });
    });

    expect(cortesQuery.gte).toHaveBeenCalledWith('created_at', '2026-02-17T00:00:00.000-06:00');
    expect(cortesQuery.lte).toHaveBeenCalledWith('created_at', '2026-02-24T23:59:59.999-06:00');
    expect(cortesQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
    expect(cortesQuery.eq).not.toHaveBeenCalledWith('estado', 'FINALIZADO');
  });

  it('mantiene finalizado_at cuando el estado es FINALIZADO', async () => {
    const cortesQuery = buildCortesQueryMock();

    vi.doMock('@/lib/supabase', () => ({
      tables: {
        cortes: vi.fn(() => cortesQuery),
      },
    }));

    const { useSupervisorQueries } = await import('../useSupervisorQueries');
    const { result } = renderHook(() => useSupervisorQueries());

    await act(async () => {
      await result.current.obtenerHistorial({
        fechaDesde: '2026-02-17',
        fechaHasta: '2026-02-24',
        estado: 'FINALIZADO',
        pagina: 1,
      });
    });

    expect(cortesQuery.eq).toHaveBeenCalledWith('estado', 'FINALIZADO');
    expect(cortesQuery.gte).toHaveBeenCalledWith('finalizado_at', '2026-02-17T00:00:00.000-06:00');
    expect(cortesQuery.lte).toHaveBeenCalledWith('finalizado_at', '2026-02-24T23:59:59.999-06:00');
    expect(cortesQuery.order).toHaveBeenCalledWith('finalizado_at', { ascending: false });
  });

  it('usa created_at y filtra estado puntual cuando no es FINALIZADO', async () => {
    const cortesQuery = buildCortesQueryMock();

    vi.doMock('@/lib/supabase', () => ({
      tables: {
        cortes: vi.fn(() => cortesQuery),
      },
    }));

    const { useSupervisorQueries } = await import('../useSupervisorQueries');
    const { result } = renderHook(() => useSupervisorQueries());

    await act(async () => {
      await result.current.obtenerHistorial({
        fechaDesde: '2026-02-17',
        fechaHasta: '2026-02-24',
        estado: 'EN_PROGRESO',
        pagina: 1,
      });
    });

    expect(cortesQuery.eq).toHaveBeenCalledWith('estado', 'EN_PROGRESO');
    expect(cortesQuery.gte).toHaveBeenCalledWith('created_at', '2026-02-17T00:00:00.000-06:00');
    expect(cortesQuery.lte).toHaveBeenCalledWith('created_at', '2026-02-24T23:59:59.999-06:00');
    expect(cortesQuery.order).toHaveBeenCalledWith('created_at', { ascending: false });
  });
});
