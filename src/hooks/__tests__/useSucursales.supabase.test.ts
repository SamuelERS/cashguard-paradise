import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('useSucursales — fuente Supabase', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('cuando Supabase está configurado, usa catálogo remoto (no mock local)', async () => {
    const supabaseRows = [
      { id: 'db-001', nombre: 'Escalón', codigo: 'E', activa: true },
      { id: 'db-002', nombre: 'Apopa', codigo: 'A', activa: true },
    ];

    const eqMock = vi.fn().mockResolvedValue({ data: supabaseRows, error: null });
    const selectMock = vi.fn(() => ({ eq: eqMock }));
    const sucursalesMock = vi.fn(() => ({ select: selectMock }));

    vi.doMock('@/lib/supabase', () => ({
      isSupabaseConfigured: true,
      tables: {
        sucursales: sucursalesMock,
      },
    }));

    const { useSucursales } = await import('../useSucursales');
    const { result } = renderHook(() => useSucursales());

    await act(async () => {
      vi.advanceTimersByTime(400);
      await Promise.resolve();
    });

    expect(sucursalesMock).toHaveBeenCalledTimes(1);
    expect(selectMock).toHaveBeenCalledWith('id,nombre,codigo,activa');
    expect(eqMock).toHaveBeenCalledWith('activa', true);
    expect(result.current.sucursales).toEqual(supabaseRows);
  });
});

