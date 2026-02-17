import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

type AsignacionResult = {
  data: Array<{ empleado_id?: string; activo?: boolean; activa?: boolean }> | null;
  error: { message: string } | null;
};

type EmpleadoResult = {
  data: Array<{
    id?: string;
    nombre?: string;
    rol?: string | null;
    cargo?: string | null;
    activo?: boolean;
    activa?: boolean;
  }> | null;
  error: { message: string } | null;
};

function buildSupabaseMocks(
  asignaciones: AsignacionResult | AsignacionResult[],
  empleados: EmpleadoResult | EmpleadoResult[],
) {
  const asignacionesQueue = Array.isArray(asignaciones) ? [...asignaciones] : [asignaciones];
  const empleadosQueue = Array.isArray(empleados) ? [...empleados] : [empleados];

  const eqMock = vi.fn(async () => {
    const next = asignacionesQueue.shift();
    return next ?? { data: [], error: null };
  });

  const inMock = vi.fn(async () => {
    const next = empleadosQueue.shift();
    return next ?? { data: [], error: null };
  });

  const empleadoSucursalesMock = vi.fn(() => ({
    select: vi.fn(() => ({ eq: eqMock })),
  }));

  const empleadosMock = vi.fn(() => ({
    select: vi.fn(() => ({ in: inMock })),
  }));

  return { eqMock, inMock, empleadoSucursalesMock, empleadosMock };
}

describe('useEmpleadosSucursal', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('retorna estado vacío cuando sucursalId es null', async () => {
    const { empleadoSucursalesMock, empleadosMock } = buildSupabaseMocks(
      { data: [], error: null },
      { data: [], error: null },
    );

    vi.doMock('@/lib/supabase', () => ({
      isSupabaseConfigured: true,
      tables: {
        empleadoSucursales: empleadoSucursalesMock,
        empleados: empleadosMock,
      },
    }));
    vi.doMock('@/data/paradise', () => ({
      getEmployeesByStore: vi.fn(() => []),
    }));

    const { useEmpleadosSucursal } = await import('../useEmpleadosSucursal');
    const { result } = renderHook(() => useEmpleadosSucursal(null));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.empleados).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(empleadoSucursalesMock).not.toHaveBeenCalled();
    expect(empleadosMock).not.toHaveBeenCalled();
  });

  it('carga empleados activos por sucursal y elimina duplicados de asignación', async () => {
    const { eqMock, inMock, empleadoSucursalesMock, empleadosMock } = buildSupabaseMocks(
      {
        data: [
          { empleado_id: 'emp-1', activo: true },
          { empleado_id: 'emp-1', activo: true },
          { empleado_id: 'emp-2', activo: true },
          { empleado_id: 'emp-3', activo: false },
        ],
        error: null,
      },
      {
        data: [
          { id: 'emp-1', nombre: 'Jonathan Melara', rol: 'Cajero', activo: true },
          { id: 'emp-2', nombre: 'Adonay Torres', cargo: 'Testigo', activo: true },
          { id: 'emp-3', nombre: 'Inactivo', rol: 'Cajero', activo: false },
        ],
        error: null,
      },
    );

    vi.doMock('@/lib/supabase', () => ({
      isSupabaseConfigured: true,
      tables: {
        empleadoSucursales: empleadoSucursalesMock,
        empleados: empleadosMock,
      },
    }));
    vi.doMock('@/data/paradise', () => ({
      getEmployeesByStore: vi.fn(() => []),
    }));

    const { useEmpleadosSucursal } = await import('../useEmpleadosSucursal');
    const { result } = renderHook(() => useEmpleadosSucursal('suc-001'));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
      expect(result.current.empleados).toHaveLength(2);
    });

    expect(eqMock).toHaveBeenCalledWith('sucursal_id', 'suc-001');
    expect(inMock).toHaveBeenCalledWith('id', ['emp-1', 'emp-2']);
    expect(result.current.empleados).toEqual([
      { id: 'emp-1', nombre: 'Jonathan Melara', cargo: 'Cajero' },
      { id: 'emp-2', nombre: 'Adonay Torres', cargo: 'Testigo' },
    ]);
    expect(result.current.error).toBeNull();
  });

  it('expone error cuando falla consulta de asignaciones', async () => {
    const { empleadoSucursalesMock, empleadosMock } = buildSupabaseMocks(
      { data: null, error: { message: 'fallo empleado_sucursales' } },
      { data: [], error: null },
    );

    vi.doMock('@/lib/supabase', () => ({
      isSupabaseConfigured: true,
      tables: {
        empleadoSucursales: empleadoSucursalesMock,
        empleados: empleadosMock,
      },
    }));
    vi.doMock('@/data/paradise', () => ({
      getEmployeesByStore: vi.fn(() => []),
    }));

    const { useEmpleadosSucursal } = await import('../useEmpleadosSucursal');
    const { result } = renderHook(() => useEmpleadosSucursal('suc-001'));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.empleados).toEqual([]);
    expect(result.current.error).toBe('fallo empleado_sucursales');
  });

  it('expone error cuando falla consulta de empleados', async () => {
    const { empleadoSucursalesMock, empleadosMock } = buildSupabaseMocks(
      { data: [{ empleado_id: 'emp-1', activo: true }], error: null },
      { data: null, error: { message: 'fallo empleados' } },
    );

    vi.doMock('@/lib/supabase', () => ({
      isSupabaseConfigured: true,
      tables: {
        empleadoSucursales: empleadoSucursalesMock,
        empleados: empleadosMock,
      },
    }));
    vi.doMock('@/data/paradise', () => ({
      getEmployeesByStore: vi.fn(() => []),
    }));

    const { useEmpleadosSucursal } = await import('../useEmpleadosSucursal');
    const { result } = renderHook(() => useEmpleadosSucursal('suc-001'));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.empleados).toEqual([]);
    expect(result.current.error).toBe('fallo empleados');
  });

  it('usa fallback local cuando Supabase no está configurado', async () => {
    const legacyEmployees = [
      { id: 'jonathan', name: 'Jonathan Melara', role: 'Asistente Itinerante', stores: ['los-heroes'] },
      { id: 'tito', name: 'Tito Gomez', role: 'Lider de Sucursal', stores: ['los-heroes'] },
    ];
    const getEmployeesByStore = vi.fn(() => legacyEmployees);

    vi.doMock('@/lib/supabase', () => ({
      isSupabaseConfigured: false,
      tables: {
        empleadoSucursales: vi.fn(),
        empleados: vi.fn(),
      },
    }));
    vi.doMock('@/data/paradise', () => ({
      getEmployeesByStore,
    }));

    const { useEmpleadosSucursal } = await import('../useEmpleadosSucursal');
    const { result } = renderHook(() => useEmpleadosSucursal('los-heroes'));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
      expect(result.current.empleados).toHaveLength(2);
    });

    expect(getEmployeesByStore).toHaveBeenCalledWith('los-heroes');
    expect(result.current.error).toBeNull();
    expect(result.current.empleados[0].nombre).toBe('Jonathan Melara');
  });

  it('permite recargar y refleja nuevos datos', async () => {
    const { empleadoSucursalesMock, empleadosMock } = buildSupabaseMocks(
      [
        { data: [{ empleado_id: 'emp-1', activo: true }], error: null },
        { data: [{ empleado_id: 'emp-2', activo: true }], error: null },
      ],
      [
        { data: [{ id: 'emp-1', nombre: 'Jonathan Melara', rol: 'Cajero', activo: true }], error: null },
        { data: [{ id: 'emp-2', nombre: 'Adonay Torres', rol: 'Testigo', activo: true }], error: null },
      ],
    );

    vi.doMock('@/lib/supabase', () => ({
      isSupabaseConfigured: true,
      tables: {
        empleadoSucursales: empleadoSucursalesMock,
        empleados: empleadosMock,
      },
    }));
    vi.doMock('@/data/paradise', () => ({
      getEmployeesByStore: vi.fn(() => []),
    }));

    const { useEmpleadosSucursal } = await import('../useEmpleadosSucursal');
    const { result } = renderHook(() => useEmpleadosSucursal('suc-001'));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
      expect(result.current.empleados[0]?.nombre).toBe('Jonathan Melara');
    });

    await act(async () => {
      await result.current.recargar();
    });

    expect(result.current.empleados).toEqual([
      { id: 'emp-2', nombre: 'Adonay Torres', cargo: 'Testigo' },
    ]);
  });
});
