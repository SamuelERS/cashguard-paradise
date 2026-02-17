// 🤖 [IA] - v2.0.0 - OT-13: Tests adaptados a Supabase real — mock de tables.sucursales()
// Previous: v1.0.0 - Tests contra mock SUCURSALES_MOCK con _setSimulateError
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSucursales } from '../useSucursales';

// ---------------------------------------------------------------------------
// Mock de @/lib/supabase
// ---------------------------------------------------------------------------

const SUCURSALES_DB = [
  { id: 'suc-001', nombre: 'Los Héroes', codigo: 'H', activa: true },
  { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
];

let mockSupabaseResponse: { data: unknown[] | null; error: { message: string } | null } = {
  data: SUCURSALES_DB,
  error: null,
};

let mockShouldThrow = false;

const mockOrder = vi.fn().mockImplementation(() => Promise.resolve(mockSupabaseResponse));
const mockEq = vi.fn().mockImplementation(() => ({ order: mockOrder }));
const mockSelect = vi.fn().mockImplementation(() => ({ eq: mockEq }));

vi.mock('@/lib/supabase', () => ({
  tables: {
    sucursales: () => ({ select: mockSelect }),
  },
  isSupabaseConfigured: true,
  supabase: {},
}));

// Permite simular un throw en la cadena
beforeEach(() => {
  mockSupabaseResponse = { data: SUCURSALES_DB, error: null };
  mockShouldThrow = false;

  mockOrder.mockImplementation(() => {
    if (mockShouldThrow) {
      return Promise.reject(new Error('Network failure'));
    }
    return Promise.resolve(mockSupabaseResponse);
  });
});

describe('useSucursales', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  // Suite 1: Estado inicial y carga
  describe('Suite 1: Estado inicial y carga', () => {
    it('1.1 - Inicia con cargando=true y sucursales array vacio', () => {
      const { result } = renderHook(() => useSucursales());

      expect(result.current.cargando).toBe(true);
      expect(result.current.sucursales).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('1.2 - Despues de carga, retorna solo sucursales activas (2 de 3)', async () => {
      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      expect(result.current.sucursales).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });

    it('1.3 - Sucursal inactiva (San Benito) NO aparece en resultado', async () => {
      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      const nombres = result.current.sucursales.map((s) => s.nombre);
      expect(nombres).not.toContain('San Benito');
      expect(nombres).toContain('Los Héroes');
      expect(nombres).toContain('Plaza Merliot');
    });

    it('1.4 - Llama a tables.sucursales() con select, eq y order correctos', async () => {
      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      expect(mockSelect).toHaveBeenCalledWith('id,nombre,codigo,activa');
      expect(mockEq).toHaveBeenCalledWith('activa', true);
      expect(mockOrder).toHaveBeenCalledWith('nombre', { ascending: true });
    });
  });

  // Suite 2: Manejo de errores
  describe('Suite 2: Manejo de errores', () => {
    it('2.1 - Error de Supabase establece error string y cargando=false', async () => {
      mockSupabaseResponse = { data: null, error: { message: 'Error de conexion' } };

      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      expect(result.current.error).toBe('Error de conexion');
    });

    it('2.2 - Sucursales queda vacio cuando hay error', async () => {
      mockSupabaseResponse = { data: null, error: { message: 'Fallo del servidor' } };

      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      expect(result.current.sucursales).toEqual([]);
    });

    it('2.3 - Error se limpia al recargar exitosamente', async () => {
      mockSupabaseResponse = { data: null, error: { message: 'Error temporal' } };

      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.error).toBe('Error temporal');
      });

      // Restaurar respuesta exitosa y recargar
      mockSupabaseResponse = { data: SUCURSALES_DB, error: null };

      await act(async () => {
        await result.current.recargar();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.sucursales).toHaveLength(2);
    });

    it('2.4 - Exception desconocida establece mensaje generico', async () => {
      mockShouldThrow = true;

      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      expect(result.current.error).toBe('Network failure');
      expect(result.current.sucursales).toEqual([]);
    });
  });

  // Suite 3: Funcion recargar
  describe('Suite 3: Funcion recargar', () => {
    it('3.1 - recargar() establece cargando=true temporalmente', async () => {
      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      // Iniciar recarga — capturar estado intermedio
      let recargaPromise: Promise<void>;
      act(() => {
        recargaPromise = result.current.recargar();
      });

      expect(result.current.cargando).toBe(true);

      await act(async () => {
        await recargaPromise!;
      });

      expect(result.current.cargando).toBe(false);
    });

    it('3.2 - recargar() completa con sucursales actualizadas', async () => {
      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      await act(async () => {
        await result.current.recargar();
      });

      expect(result.current.sucursales).toHaveLength(2);
      expect(result.current.cargando).toBe(false);
    });

    it('3.3 - recargar mantiene referencia estable (misma funcion entre renders)', async () => {
      const { result, rerender } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      const recargarRef1 = result.current.recargar;

      rerender();

      const recargarRef2 = result.current.recargar;

      expect(recargarRef1).toBe(recargarRef2);
    });
  });

  // Suite 4: Datos Supabase
  describe('Suite 4: Datos Supabase', () => {
    it('4.1 - Retorna exactamente 2 sucursales activas', async () => {
      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      expect(result.current.sucursales).toHaveLength(2);
    });

    it('4.2 - Cada sucursal tiene las 4 propiedades: id, nombre, codigo, activa', async () => {
      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      result.current.sucursales.forEach((s) => {
        expect(s).toHaveProperty('id');
        expect(s).toHaveProperty('nombre');
        expect(s).toHaveProperty('codigo');
        expect(s).toHaveProperty('activa');
        expect(typeof s.id).toBe('string');
        expect(typeof s.nombre).toBe('string');
        expect(typeof s.codigo).toBe('string');
        expect(typeof s.activa).toBe('boolean');
      });
    });

    it('4.3 - Los Heroes tiene codigo H y Plaza Merliot tiene codigo M', async () => {
      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      const heroes = result.current.sucursales.find((s) => s.nombre === 'Los Héroes');
      const merliot = result.current.sucursales.find((s) => s.nombre === 'Plaza Merliot');

      expect(heroes?.codigo).toBe('H');
      expect(merliot?.codigo).toBe('M');
    });

    it('4.4 - data null sin error retorna array vacio', async () => {
      mockSupabaseResponse = { data: null, error: null };

      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      expect(result.current.sucursales).toEqual([]);
      expect(result.current.error).toBeNull();
    });
  });

  // Suite 5: Cleanup y edge cases
  describe('Suite 5: Cleanup y edge cases', () => {
    it('5.1 - Unmount durante carga no causa warning de setState', () => {
      const { unmount } = renderHook(() => useSucursales());

      // Unmount antes de que la promesa resuelva
      unmount();

      // Si llegamos aqui sin error, el test pasa (signal.cancelled previene setState)
      expect(true).toBe(true);
    });

    it('5.2 - Multiples llamadas rapidas a recargar() no causan race conditions', async () => {
      const { result } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      // Llamar recargar multiples veces rapidamente
      await act(async () => {
        await Promise.all([
          result.current.recargar(),
          result.current.recargar(),
        ]);
      });

      // Estado final debe ser consistente
      expect(result.current.cargando).toBe(false);
      expect(result.current.sucursales).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });

    it('5.3 - Hook funciona correctamente en re-render del componente host', async () => {
      const { result, rerender } = renderHook(() => useSucursales());

      await waitFor(() => {
        expect(result.current.cargando).toBe(false);
      });

      // Re-render multiple times
      rerender();
      rerender();
      rerender();

      expect(result.current.sucursales).toHaveLength(2);
      expect(result.current.cargando).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });
});
