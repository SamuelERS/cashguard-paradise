// 🤖 [IA] - DACC-FIX-3: Suite corregida — cadena mocks completa, datos cargo correctos, sin fallback paradise.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

type AsignacionResult = {
  data: Array<{ empleado_id?: string }> | null;
  error: { message: string } | null;
};

type EmpleadoResult = {
  data: Array<{
    id?: string;
    nombre?: string;
    cargo?: string | null;
    activo?: boolean;
  }> | null;
  error: { message: string } | null;
};

// 🤖 [IA] - DACC-FIX-3: Cadena de mocks corregida para reflejar la consulta real del hook:
//   empleados().select('id,nombre,activo').in('id', ids).eq('activo', true).order('nombre', ...)
function buildSupabaseMocks(
  asignaciones: AsignacionResult | AsignacionResult[],
  empleados: EmpleadoResult | EmpleadoResult[],
) {
  const asignacionesQueue = Array.isArray(asignaciones) ? [...asignaciones] : [asignaciones];
  const empleadosQueue = Array.isArray(empleados) ? [...empleados] : [empleados];

  // Asignaciones: .select('empleado_id').eq('sucursal_id', id) → thenable
  const eqMock = vi.fn(async () => {
    const next = asignacionesQueue.shift();
    return next ?? { data: [], error: null };
  });

  // Empleados: .select(...).in('id', ids).eq('activo', true).order('nombre', ...) → thenable
  const orderMock = vi.fn(async () => {
    const next = empleadosQueue.shift();
    return next ?? { data: [], error: null };
  });
  const empleadosEqMock = vi.fn(() => ({ order: orderMock }));
  const inMock = vi.fn(() => ({ eq: empleadosEqMock }));

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
          { empleado_id: 'emp-1' },
          { empleado_id: 'emp-1' },
          { empleado_id: 'emp-2' },
        ],
        error: null,
      },
      {
        // 🤖 [IA] - DACC-FIX-3: Mock refleja resultado server-side (.eq('activo', true) ya filtró)
        // Campo 'cargo' en vez de 'rol' — el hook extrae cargo, no rol
        data: [
          { id: 'emp-1', nombre: 'Jonathan Melara', cargo: 'Cajero', activo: true },
          { id: 'emp-2', nombre: 'Adonay Torres', cargo: 'Testigo', activo: true },
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

    const { useEmpleadosSucursal } = await import('../useEmpleadosSucursal');
    const { result } = renderHook(() => useEmpleadosSucursal('suc-001'));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
      expect(result.current.empleados).toHaveLength(2);
    });

    expect(eqMock).toHaveBeenCalledWith('sucursal_id', 'suc-001');
    expect(inMock).toHaveBeenCalledWith('id', ['emp-1', 'emp-2']);
    expect(result.current.empleados).toEqual([
      { id: 'emp-2', nombre: 'Adonay Torres', cargo: 'Testigo' },
      { id: 'emp-1', nombre: 'Jonathan Melara', cargo: 'Cajero' },
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
      { data: [{ empleado_id: 'emp-1' }], error: null },
      { data: null, error: { message: 'fallo empleados' } },
    );

    vi.doMock('@/lib/supabase', () => ({
      isSupabaseConfigured: true,
      tables: {
        empleadoSucursales: empleadoSucursalesMock,
        empleados: empleadosMock,
      },
    }));

    const { useEmpleadosSucursal } = await import('../useEmpleadosSucursal');
    const { result } = renderHook(() => useEmpleadosSucursal('suc-001'));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.empleados).toEqual([]);
    expect(result.current.error).toBe('fallo empleados');
  });

  // 🤖 [IA] - DACC-FIX-3: Test anterior probaba fallback local (paradise.ts) que NO existe en el hook.
  // useEmpleadosSucursal es 100% Supabase, sin fallback legacy.
  // Reemplazado: verifica ruta vacía cuando sucursal no tiene asignaciones.
  it('devuelve lista vacía cuando no hay asignaciones para la sucursal', async () => {
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

    const { useEmpleadosSucursal } = await import('../useEmpleadosSucursal');
    const { result } = renderHook(() => useEmpleadosSucursal('suc-001'));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.empleados).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(empleadoSucursalesMock).toHaveBeenCalled();
    expect(empleadosMock).not.toHaveBeenCalled();
  });

  it('permite recargar y refleja nuevos datos', async () => {
    const { empleadoSucursalesMock, empleadosMock } = buildSupabaseMocks(
      [
        { data: [{ empleado_id: 'emp-1' }], error: null },
        { data: [{ empleado_id: 'emp-2' }], error: null },
      ],
      [
        { data: [{ id: 'emp-1', nombre: 'Jonathan Melara', cargo: 'Cajero', activo: true }], error: null },
        { data: [{ id: 'emp-2', nombre: 'Adonay Torres', cargo: 'Testigo', activo: true }], error: null },
      ],
    );

    vi.doMock('@/lib/supabase', () => ({
      isSupabaseConfigured: true,
      tables: {
        empleadoSucursales: empleadoSucursalesMock,
        empleados: empleadosMock,
      },
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

  it('prioriza orden Los Héroes: Tito, Adonai/Adonay, Jonathan', async () => {
    const { empleadoSucursalesMock, empleadosMock } = buildSupabaseMocks(
      {
        data: [
          { empleado_id: 'emp-1' },
          { empleado_id: 'emp-2' },
          { empleado_id: 'emp-3' },
        ],
        error: null,
      },
      {
        data: [
          { id: 'emp-1', nombre: 'Jonathan Melara', cargo: 'Cajero', activo: true },
          { id: 'emp-2', nombre: 'Tito Gomez', cargo: 'Cajero', activo: true },
          { id: 'emp-3', nombre: 'Adonay Torres', cargo: 'Testigo', activo: true },
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

    const { useEmpleadosSucursal } = await import('../useEmpleadosSucursal');
    const { result } = renderHook(() => useEmpleadosSucursal('suc-heroes'));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.empleados.map((e) => e.nombre)).toEqual([
      'Tito Gomez',
      'Adonay Torres',
      'Jonathan Melara',
    ]);
  });

  it('prioriza orden Plaza Merliot: Irving, Edenison, Jonathan', async () => {
    const { empleadoSucursalesMock, empleadosMock } = buildSupabaseMocks(
      {
        data: [
          { empleado_id: 'emp-1' },
          { empleado_id: 'emp-2' },
          { empleado_id: 'emp-3' },
        ],
        error: null,
      },
      {
        data: [
          { id: 'emp-1', nombre: 'Jonathan Melara', cargo: 'Cajero', activo: true },
          { id: 'emp-2', nombre: 'Edenison Lopez', cargo: 'Testigo', activo: true },
          { id: 'emp-3', nombre: 'Irving Abarca', cargo: 'Cajero', activo: true },
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

    const { useEmpleadosSucursal } = await import('../useEmpleadosSucursal');
    const { result } = renderHook(() => useEmpleadosSucursal('suc-merliot'));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.empleados.map((e) => e.nombre)).toEqual([
      'Irving Abarca',
      'Edenison Lopez',
      'Jonathan Melara',
    ]);
  });

  it('prioriza orden Plaza Merliot con variantes reales: Irvin, Edenilson, Jonathan', async () => {
    const { empleadoSucursalesMock, empleadosMock } = buildSupabaseMocks(
      {
        data: [
          { empleado_id: 'emp-1' },
          { empleado_id: 'emp-2' },
          { empleado_id: 'emp-3' },
        ],
        error: null,
      },
      {
        data: [
          { id: 'emp-1', nombre: 'Edenilson López', cargo: 'Testigo', activo: true },
          { id: 'emp-2', nombre: 'Jonathan Melara', cargo: 'Cajero', activo: true },
          { id: 'emp-3', nombre: 'Irvin Abarca', cargo: 'Cajero', activo: true },
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

    const { useEmpleadosSucursal } = await import('../useEmpleadosSucursal');
    const { result } = renderHook(() => useEmpleadosSucursal('suc-merliot'));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.empleados.map((e) => e.nombre)).toEqual([
      'Irvin Abarca',
      'Edenilson López',
      'Jonathan Melara',
    ]);
  });
});
