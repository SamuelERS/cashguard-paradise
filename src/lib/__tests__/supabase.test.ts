// 🤖 [IA] - v2.0.0: Tests para cliente Supabase tipado
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks — vi.hoisted() runs before all imports (including vi.mock)
// ---------------------------------------------------------------------------

const { mockFrom, mockSelect, mockLimit, mockCreateClient } = vi.hoisted(() => {
  const mockLimit = vi.fn();
  const mockSelect = vi.fn(() => ({ limit: mockLimit }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));
  const mockCreateClient = vi.fn(() => ({ from: mockFrom }));

  // Set env vars inside hoisted block so they exist before module-level code runs
  // @ts-expect-error — assigning to import.meta.env for test setup
  import.meta.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
  // @ts-expect-error — assigning to import.meta.env for test setup
  import.meta.env.VITE_SUPABASE_ANON_KEY = 'test-anon-key-1234';

  return { mockFrom, mockSelect, mockLimit, mockCreateClient };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

// NOW import the module under test
import { supabase, tables, checkSupabaseConnection } from '../supabase';
import type { Database, ConnectionStatus } from '../supabase';

// ---------------------------------------------------------------------------
// Suite 1 — Exportaciones
// ---------------------------------------------------------------------------

describe('Suite 1 — Exportaciones', () => {
  it('exporta supabase client como objeto no-null', () => {
    expect(supabase).toBeDefined();
    expect(supabase).not.toBeNull();
  });

  it('exporta tables con las propiedades esperadas', () => {
    expect(tables).toHaveProperty('sucursales');
    expect(tables).toHaveProperty('cortes');
    expect(tables).toHaveProperty('corteIntentos');
    expect(tables).toHaveProperty('empleados');
    expect(tables).toHaveProperty('empleadoSucursales');
    expect(tables).toHaveProperty('corteConteoSnapshots');
  });

  it('cada propiedad de tables es una función', () => {
    expect(typeof tables.sucursales).toBe('function');
    expect(typeof tables.cortes).toBe('function');
    expect(typeof tables.corteIntentos).toBe('function');
    expect(typeof tables.empleados).toBe('function');
    expect(typeof tables.empleadoSucursales).toBe('function');
    expect(typeof tables.corteConteoSnapshots).toBe('function');
  });

  it('exporta checkSupabaseConnection como función', () => {
    expect(typeof checkSupabaseConnection).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// Suite 2 — Tipo Database y createClient
// ---------------------------------------------------------------------------

describe('Suite 2 — Tipo Database y createClient', () => {
  it('createClient produjo un client con método from()', () => {
    // Verifies createClient was called successfully (client exists and works)
    expect(supabase).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });

  it('tables.cortes() invoca supabase.from("cortes")', () => {
    tables.cortes();
    expect(mockFrom).toHaveBeenCalledWith('cortes');
  });

  it('tables.sucursales() invoca supabase.from("sucursales")', () => {
    mockFrom.mockClear();
    tables.sucursales();
    expect(mockFrom).toHaveBeenCalledWith('sucursales');
  });

  it('tables.corteIntentos() invoca supabase.from("corte_intentos")', () => {
    mockFrom.mockClear();
    tables.corteIntentos();
    expect(mockFrom).toHaveBeenCalledWith('corte_intentos');
  });

  it('tables.empleados() invoca supabase.from("empleados")', () => {
    mockFrom.mockClear();
    tables.empleados();
    expect(mockFrom).toHaveBeenCalledWith('empleados');
  });

  it('tables.empleadoSucursales() invoca supabase.from("empleado_sucursales")', () => {
    mockFrom.mockClear();
    tables.empleadoSucursales();
    expect(mockFrom).toHaveBeenCalledWith('empleado_sucursales');
  });

  it('tables.corteConteoSnapshots() invoca supabase.from("corte_conteo_snapshots")', () => {
    mockFrom.mockClear();
    tables.corteConteoSnapshots();
    expect(mockFrom).toHaveBeenCalledWith('corte_conteo_snapshots');
  });

  // Compile-time type check: ensures Database type is usable
  it('Database type es compatible con el esquema esperado', () => {
    type CorteRow = Database['public']['Tables']['cortes']['Row'];
    type SucursalRow = Database['public']['Tables']['sucursales']['Row'];
    type IntentoRow = Database['public']['Tables']['corte_intentos']['Row'];
    type EmpleadoRow = Database['public']['Tables']['empleados']['Row'];
    type EmpleadoSucursalRow = Database['public']['Tables']['empleado_sucursales']['Row'];

    const _corteCheck: CorteRow['estado'] = 'INICIADO';
    const _sucCheck: SucursalRow['activa'] = true;
    const _intCheck: IntentoRow['attempt_number'] = 1;
    const _empCheck: EmpleadoRow['activo'] = true;
    const _empSucCheck: EmpleadoSucursalRow['sucursal_id'] = 'suc-001';

    expect(_corteCheck).toBe('INICIADO');
    expect(_sucCheck).toBe(true);
    expect(_intCheck).toBe(1);
    expect(_empCheck).toBe(true);
    expect(_empSucCheck).toBe('suc-001');
  });
});

// ---------------------------------------------------------------------------
// Suite 3 — checkSupabaseConnection
// ---------------------------------------------------------------------------

describe('Suite 3 — checkSupabaseConnection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock chain: from().select().limit()
    mockLimit.mockResolvedValue({ error: null });
    mockSelect.mockReturnValue({ limit: mockLimit });
    mockFrom.mockReturnValue({ select: mockSelect });
  });

  it('retorna connected:true con latencyMs cuando exitoso', async () => {
    mockLimit.mockResolvedValue({ error: null });

    const result = await checkSupabaseConnection();

    expect(result.connected).toBe(true);
    expect(result.latencyMs).toBeTypeOf('number');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(result.error).toBeNull();
  });

  it('retorna connected:false con error.message cuando Supabase retorna error', async () => {
    mockLimit.mockResolvedValue({
      error: { message: 'relation "sucursales" does not exist' },
    });

    const result = await checkSupabaseConnection();

    expect(result.connected).toBe(false);
    expect(result.latencyMs).toBeNull();
    expect(result.error).toBe('relation "sucursales" does not exist');
  });

  it('retorna connected:false cuando ocurre excepción de red', async () => {
    mockLimit.mockRejectedValue(new Error('Network request failed'));

    const result = await checkSupabaseConnection();

    expect(result.connected).toBe(false);
    expect(result.latencyMs).toBeNull();
    expect(result.error).toBe('Network request failed');
  });

  it('maneja excepción no-Error correctamente', async () => {
    mockLimit.mockRejectedValue('string error');

    const result = await checkSupabaseConnection();

    expect(result.connected).toBe(false);
    expect(result.latencyMs).toBeNull();
    expect(result.error).toBe('Unknown error');
  });

  it('latencyMs es null cuando la conexión falla', async () => {
    mockLimit.mockResolvedValue({ error: { message: 'timeout' } });

    const result: ConnectionStatus = await checkSupabaseConnection();

    expect(result.latencyMs).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Suite 4 — Variables de entorno (validación de flujo)
// ---------------------------------------------------------------------------

describe('Suite 4 — Variables de entorno', () => {
  it('VITE_SUPABASE_URL está definida en import.meta.env', () => {
    expect(import.meta.env.VITE_SUPABASE_URL).toBe('https://test.supabase.co');
  });

  it('VITE_SUPABASE_ANON_KEY está definida en import.meta.env', () => {
    expect(import.meta.env.VITE_SUPABASE_ANON_KEY).toBe('test-anon-key-1234');
  });

  it('supabase client se creó sin lanzar error (env vars válidas)', () => {
    // If env vars were missing, module load would have thrown
    expect(supabase).toBeDefined();
  });
});
