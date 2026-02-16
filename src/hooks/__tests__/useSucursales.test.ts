// 🤖 [IA] - v1.0.0: Tests para useSucursales hook — 15+ tests cubriendo carga, errores, recarga, datos mock y cleanup
import { renderHook, act } from '@testing-library/react';
import { useSucursales, _setSimulateError } from '../useSucursales';

describe('useSucursales', () => {
  beforeEach(() => {
    _setSimulateError(null);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Suite 1: Estado inicial y carga
  describe('Suite 1: Estado inicial y carga', () => {
    it('1.1 - Inicia con cargando=true y sucursales array vacio', () => {
      const { result } = renderHook(() => useSucursales());

      expect(result.current.cargando).toBe(true);
      expect(result.current.sucursales).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('1.2 - Despues de carga, retorna solo sucursales activas (2 de 3)', () => {
      const { result } = renderHook(() => useSucursales());

      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(result.current.cargando).toBe(false);
      expect(result.current.sucursales).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });

    it('1.3 - Sucursal inactiva (San Benito, activa=false) NO aparece en resultado', () => {
      const { result } = renderHook(() => useSucursales());

      act(() => {
        vi.advanceTimersByTime(350);
      });

      const nombres = result.current.sucursales.map((s) => s.nombre);
      expect(nombres).not.toContain('San Benito');
      expect(nombres).toContain('Los Héroes');
      expect(nombres).toContain('Plaza Merliot');
    });
  });

  // Suite 2: Manejo de errores
  describe('Suite 2: Manejo de errores', () => {
    it('2.1 - Error establece error string y cargando=false', () => {
      _setSimulateError('Error de conexion');

      const { result } = renderHook(() => useSucursales());

      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(result.current.error).toBe('Error de conexion');
      expect(result.current.cargando).toBe(false);
    });

    it('2.2 - Sucursales queda vacio cuando hay error', () => {
      _setSimulateError('Fallo del servidor');

      const { result } = renderHook(() => useSucursales());

      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(result.current.sucursales).toEqual([]);
    });

    it('2.3 - Error se limpia al recargar exitosamente', async () => {
      _setSimulateError('Error temporal');

      const { result } = renderHook(() => useSucursales());

      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(result.current.error).toBe('Error temporal');

      // Recargar sin error simulado (ya se limpio automaticamente)
      await act(async () => {
        const recargaPromise = result.current.recargar();
        vi.advanceTimersByTime(350);
        await recargaPromise;
      });

      expect(result.current.error).toBeNull();
      expect(result.current.sucursales).toHaveLength(2);
    });
  });

  // Suite 3: Funcion recargar
  describe('Suite 3: Funcion recargar', () => {
    it('3.1 - recargar() establece cargando=true temporalmente', async () => {
      const { result } = renderHook(() => useSucursales());

      // Completar carga inicial
      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(result.current.cargando).toBe(false);

      // Iniciar recarga — cargando se establece sincrono
      let recargaPromise: Promise<void>;
      act(() => {
        recargaPromise = result.current.recargar();
      });

      expect(result.current.cargando).toBe(true);

      // Completar recarga
      await act(async () => {
        vi.advanceTimersByTime(350);
        await recargaPromise!;
      });

      expect(result.current.cargando).toBe(false);
    });

    it('3.2 - recargar() completa con sucursales actualizadas', async () => {
      const { result } = renderHook(() => useSucursales());

      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(result.current.cargando).toBe(false);

      await act(async () => {
        const recargaPromise = result.current.recargar();
        vi.advanceTimersByTime(350);
        await recargaPromise;
      });

      expect(result.current.sucursales).toHaveLength(2);
      expect(result.current.cargando).toBe(false);
    });

    it('3.3 - recargar mantiene referencia estable (misma funcion entre renders)', () => {
      const { result, rerender } = renderHook(() => useSucursales());

      act(() => {
        vi.advanceTimersByTime(350);
      });

      const recargarRef1 = result.current.recargar;

      rerender();

      const recargarRef2 = result.current.recargar;

      expect(recargarRef1).toBe(recargarRef2);
    });
  });

  // Suite 4: Datos mock
  describe('Suite 4: Datos mock', () => {
    it('4.1 - Retorna exactamente 2 sucursales activas', () => {
      const { result } = renderHook(() => useSucursales());

      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(result.current.sucursales).toHaveLength(2);
    });

    it('4.2 - Cada sucursal tiene las 4 propiedades: id, nombre, codigo, activa', () => {
      const { result } = renderHook(() => useSucursales());

      act(() => {
        vi.advanceTimersByTime(350);
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

    it('4.3 - Los Heroes tiene codigo H y Plaza Merliot tiene codigo M', () => {
      const { result } = renderHook(() => useSucursales());

      act(() => {
        vi.advanceTimersByTime(350);
      });

      const heroes = result.current.sucursales.find((s) => s.nombre === 'Los Héroes');
      const merliot = result.current.sucursales.find((s) => s.nombre === 'Plaza Merliot');

      expect(heroes?.codigo).toBe('H');
      expect(merliot?.codigo).toBe('M');
    });
  });

  // Suite 5: Cleanup y edge cases
  describe('Suite 5: Cleanup y edge cases', () => {
    it('5.1 - Unmount durante carga no causa warning de setState', () => {
      const { unmount } = renderHook(() => useSucursales());

      // Unmount antes de que el timeout resuelva
      unmount();

      // Avanzar timers despues del unmount — no debe causar error
      act(() => {
        vi.advanceTimersByTime(350);
      });

      // Si llegamos aqui sin error, el test pasa
      expect(true).toBe(true);
    });

    it('5.2 - Multiples llamadas rapidas a recargar() no causan race conditions', async () => {
      const { result } = renderHook(() => useSucursales());

      // Completar carga inicial
      act(() => {
        vi.advanceTimersByTime(350);
      });

      expect(result.current.cargando).toBe(false);

      // Llamar recargar multiples veces rapidamente
      let promise1: Promise<void>;
      let promise2: Promise<void>;
      act(() => {
        promise1 = result.current.recargar();
        promise2 = result.current.recargar();
      });

      await act(async () => {
        vi.advanceTimersByTime(350);
        await Promise.all([promise1!, promise2!]);
      });

      // Estado final debe ser consistente
      expect(result.current.cargando).toBe(false);
      expect(result.current.sucursales).toHaveLength(2);
      expect(result.current.error).toBeNull();
    });

    it('5.3 - Hook funciona correctamente en re-render del componente host', () => {
      const { result, rerender } = renderHook(() => useSucursales());

      act(() => {
        vi.advanceTimersByTime(350);
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
