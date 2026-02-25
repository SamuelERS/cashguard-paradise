import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

type QueryResult = {
  data: unknown[] | null;
  error: { message: string } | null;
};

function buildFinalizadosQuery(result: QueryResult) {
  const order = vi.fn(() => Promise.resolve(result));
  const lte = vi.fn(() => ({ order }));
  const gte = vi.fn(() => ({ lte }));
  const inMock = vi.fn(() => ({ gte }));
  const select = vi.fn(() => ({ in: inMock }));
  return { select, inMock, gte, lte, order };
}

function buildActivosQuery(result: QueryResult) {
  const order = vi.fn(() => Promise.resolve(result));
  const lte = vi.fn(() => ({ order }));
  const gte = vi.fn(() => ({ lte }));
  const inMock = vi.fn(() => ({ gte }));
  const select = vi.fn(() => ({ in: inMock }));
  return { select, inMock, gte, lte, order };
}

describe('useSupervisorQueries.obtenerCortesDelDia - activity timeline', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('combina activos y finalizados del día y ordena por timestamp operativo', async () => {
    const finalizadosRows = [
      {
        id: 'f1',
        correlativo: 'CORTE-F1',
        estado: 'FINALIZADO',
        created_at: '2026-02-24T20:00:00.000Z',
        finalizado_at: '2026-02-24T22:00:00.000Z',
        sucursales: null,
      },
    ];

    const activosRows = [
      {
        id: 'a1',
        correlativo: 'CORTE-A1',
        estado: 'EN_PROGRESO',
        created_at: '2026-02-24T23:00:00.000Z',
        finalizado_at: null,
        sucursales: null,
      },
    ];

    const finalizadosQuery = buildFinalizadosQuery({ data: finalizadosRows, error: null });
    const activosQuery = buildActivosQuery({ data: activosRows, error: null });

    const cortesMock = vi
      .fn()
      .mockReturnValueOnce({ select: finalizadosQuery.select })
      .mockReturnValueOnce({ select: activosQuery.select });

    vi.doMock('@/lib/supabase', () => ({
      tables: {
        cortes: cortesMock,
      },
    }));

    const { useSupervisorQueries } = await import('../useSupervisorQueries');
    const { result } = renderHook(() => useSupervisorQueries());

    let rows: Awaited<ReturnType<typeof result.current.obtenerCortesDelDia>> = [];

    await act(async () => {
      rows = await result.current.obtenerCortesDelDia();
    });

    expect(cortesMock).toHaveBeenCalledTimes(2);
    expect(finalizadosQuery.inMock).toHaveBeenCalledWith('estado', ['FINALIZADO', 'ABORTADO']);
    expect(activosQuery.inMock).toHaveBeenCalledWith('estado', ['INICIADO', 'EN_PROGRESO']);
    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe('a1');
    expect(rows[1].id).toBe('f1');
  });
});
