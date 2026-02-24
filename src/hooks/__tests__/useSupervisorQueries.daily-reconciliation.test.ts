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

  it('si el RPC no existe en Supabase, no bloquea cortes del día', async () => {
    const finalizadosQuery = buildFinalizadosQuery({
      data: [
        {
          id: 'fin-1',
          estado: 'FINALIZADO',
          created_at: '2026-02-24T09:00:00.000-06:00',
          finalizado_at: '2026-02-24T10:00:00.000-06:00',
        },
      ],
      error: null,
    });
    const activosQuery = buildActivosQuery({
      data: [
        {
          id: 'act-1',
          estado: 'EN_PROGRESO',
          created_at: '2026-02-24T11:00:00.000-06:00',
          finalizado_at: null,
        },
      ],
      error: null,
    });
    const cortesMock = vi
      .fn()
      .mockReturnValueOnce({ select: finalizadosQuery.select })
      .mockReturnValueOnce({ select: activosQuery.select });
    const rpcMock = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: 'PGRST202',
        message: 'Could not find the function public.reconciliar_cortes_vencidos(p_fecha_corte) in the schema cache',
      },
    });

    vi.doMock('@/lib/supabase', () => ({
      tables: {
        rpc: rpcMock,
        cortes: cortesMock,
      },
    }));

    const { useSupervisorQueries } = await import('../useSupervisorQueries');
    const { result } = renderHook(() => useSupervisorQueries());

    let filas: unknown[] = [];
    await act(async () => {
      filas = await result.current.obtenerCortesDelDia();
    });

    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(filas).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('si el RPC no existe en Supabase, no bloquea historial', async () => {
    const historialQuery = buildHistorialQuery({
      data: [
        {
          id: 'hist-1',
          estado: 'EN_PROGRESO',
          created_at: '2026-02-24T11:00:00.000-06:00',
        },
      ],
      error: null,
      count: 1,
    });
    const cortesMock = vi.fn(() => historialQuery);
    const rpcMock = vi.fn().mockResolvedValue({
      data: null,
      error: {
        code: 'PGRST202',
        message: 'Could not find the function public.reconciliar_cortes_vencidos(p_fecha_corte) in the schema cache',
      },
    });

    vi.doMock('@/lib/supabase', () => ({
      tables: {
        rpc: rpcMock,
        cortes: cortesMock,
      },
    }));

    const { useSupervisorQueries } = await import('../useSupervisorQueries');
    const { result } = renderHook(() => useSupervisorQueries());

    let payload: { datos: unknown[]; total: number; pagina: number } = {
      datos: [],
      total: 0,
      pagina: 1,
    };
    await act(async () => {
      payload = await result.current.obtenerHistorial({
        fechaDesde: '2026-02-17',
        fechaHasta: '2026-02-24',
        estado: 'TODOS',
        pagina: 1,
      });
    });

    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(payload.total).toBe(1);
    expect(payload.datos).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });
});
