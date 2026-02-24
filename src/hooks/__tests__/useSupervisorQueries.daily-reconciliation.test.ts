import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type QueryResult = {
  data: unknown[] | null;
  error: { message: string } | null;
  count?: number | null;
};

function buildFinalizadosQuery(result: QueryResult) {
  const order = vi.fn(() => Promise.resolve(result));
  const lte = vi.fn(() => ({ order }));
  const gte = vi.fn(() => ({ lte }));
  const eq = vi.fn(() => ({ gte }));
  const select = vi.fn(() => ({ eq }));
  return { select };
}

function buildActivosQuery(result: QueryResult) {
  const order = vi.fn(() => Promise.resolve(result));
  const lte = vi.fn(() => ({ order }));
  const gte = vi.fn(() => ({ lte }));
  const inMock = vi.fn(() => ({ gte }));
  const select = vi.fn(() => ({ in: inMock }));
  return { select };
}

function buildHistorialQuery(result: QueryResult) {
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
  query.then.mockImplementation((resolve: (value: QueryResult) => unknown) =>
    Promise.resolve(resolve(result)),
  );

  return query;
}

describe('useSupervisorQueries - reconciliación diaria', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('ejecuta RPC de reconciliación antes de consultar cortes del día', async () => {
    const finalizadosQuery = buildFinalizadosQuery({ data: [], error: null });
    const activosQuery = buildActivosQuery({ data: [], error: null });
    const cortesMock = vi
      .fn()
      .mockReturnValueOnce({ select: finalizadosQuery.select })
      .mockReturnValueOnce({ select: activosQuery.select });

    const rpcMock = vi.fn().mockResolvedValue({ data: 0, error: null });

    vi.doMock('@/lib/supabase', () => ({
      tables: {
        rpc: rpcMock,
        cortes: cortesMock,
      },
    }));

    const { useSupervisorQueries } = await import('../useSupervisorQueries');
    const { result } = renderHook(() => useSupervisorQueries());

    await act(async () => {
      await result.current.obtenerCortesDelDia();
    });

    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('reconciliar_cortes_vencidos', {
      p_fecha_corte: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
    });
    expect(rpcMock.mock.invocationCallOrder[0]).toBeLessThan(cortesMock.mock.invocationCallOrder[0]);
  });

  it('ejecuta RPC de reconciliación antes de consultar historial', async () => {
    const historialQuery = buildHistorialQuery({ data: [], error: null, count: 0 });
    const cortesMock = vi.fn(() => historialQuery);
    const rpcMock = vi.fn().mockResolvedValue({ data: 0, error: null });

    vi.doMock('@/lib/supabase', () => ({
      tables: {
        rpc: rpcMock,
        cortes: cortesMock,
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

    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith('reconciliar_cortes_vencidos', {
      p_fecha_corte: '2026-02-24',
    });
    expect(rpcMock.mock.invocationCallOrder[0]).toBeLessThan(cortesMock.mock.invocationCallOrder[0]);
  });
});
