// 🤖 [IA] - ORDEN #011: Tests para cola de operaciones offline
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  agregarOperacion,
  obtenerCola,
  obtenerEstadoCola,
  procesarCola,
  eliminarOperacion,
  limpiarCola,
  escucharConectividad,
  STORAGE_KEY,
  MAX_REINTENTOS,
  BACKOFF_MS,
  type EjecutorOperacion,
  type OperacionOffline,
} from '../offlineQueue';

// ─── localStorage funcional (el setup global lo mockea con vi.fn no-op) ──────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    key: vi.fn((_index: number) => null),
    get length() { return Object.keys(store).length; },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });

// ─── Helpers de test ─────────────────────────────────────────────────────────

const crearOperacion = (
  overrides: Partial<{
    tipo: OperacionOffline['tipo'];
    payload: Record<string, unknown>;
    corteId: string;
  }> = {}
) =>
  agregarOperacion({
    tipo: overrides.tipo ?? 'GUARDAR_PROGRESO',
    payload: overrides.payload ?? { paso: 3, datos: { monedas: 10 } },
    corteId: overrides.corteId ?? 'corte-abc-123',
  });

const ejecutorExitoso: EjecutorOperacion = async () => { /* noop */ };
const ejecutorFallido: EjecutorOperacion = async () => {
  throw new Error('Error de red simulado');
};

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// ─── Suite 1: Almacenamiento básico ──────────────────────────────────────────

describe('Suite 1: Almacenamiento básico', () => {
  it('1.1 - agregarOperacion retorna id string válido (no vacío)', () => {
    const id = crearOperacion();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('1.2 - obtenerCola retorna array con la operación agregada', () => {
    const id = crearOperacion();
    const cola = obtenerCola();
    expect(cola).toHaveLength(1);
    expect(cola[0].id).toBe(id);
  });

  it('1.3 - Múltiples operaciones se agregan en orden FIFO', () => {
    const id1 = crearOperacion({ tipo: 'GUARDAR_PROGRESO' });
    const id2 = crearOperacion({ tipo: 'FINALIZAR_CORTE' });
    const id3 = crearOperacion({ tipo: 'REGISTRAR_INTENTO' });

    const cola = obtenerCola();
    expect(cola).toHaveLength(3);
    expect(cola[0].id).toBe(id1);
    expect(cola[1].id).toBe(id2);
    expect(cola[2].id).toBe(id3);
  });

  it('1.4 - limpiarCola deja la cola vacía', () => {
    crearOperacion();
    crearOperacion();
    expect(obtenerCola()).toHaveLength(2);

    limpiarCola();
    expect(obtenerCola()).toHaveLength(0);
  });

  it('1.5 - eliminarOperacion retorna true y remueve la operación', () => {
    const id = crearOperacion();
    expect(obtenerCola()).toHaveLength(1);

    const resultado = eliminarOperacion(id);
    expect(resultado).toBe(true);
    expect(obtenerCola()).toHaveLength(0);
  });
});

// ─── Suite 2: Estructura de OperacionOffline ─────────────────────────────────

describe('Suite 2: Estructura de OperacionOffline', () => {
  it('2.1 - Operación creada tiene todos los campos requeridos', () => {
    crearOperacion({ tipo: 'REGISTRAR_INTENTO', corteId: 'corte-xyz' });
    const op = obtenerCola()[0];

    expect(op).toHaveProperty('id');
    expect(op).toHaveProperty('tipo', 'REGISTRAR_INTENTO');
    expect(op).toHaveProperty('payload');
    expect(op).toHaveProperty('corteId', 'corte-xyz');
    expect(op).toHaveProperty('timestamp');
    expect(op).toHaveProperty('reintentos', 0);
    expect(op).toHaveProperty('ultimoReintento', null);
    expect(op).toHaveProperty('estado', 'pendiente');
    expect(op).toHaveProperty('error', null);
  });

  it('2.2 - timestamp es ISO 8601 válido (parseable por Date)', () => {
    crearOperacion();
    const op = obtenerCola()[0];
    const parsed = new Date(op.timestamp);
    expect(parsed.getTime()).not.toBeNaN();
    // Verificar formato ISO 8601 (contiene T y Z o +/-)
    expect(op.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('2.3 - estado inicial es pendiente con reintentos=0', () => {
    crearOperacion();
    const op = obtenerCola()[0];
    expect(op.estado).toBe('pendiente');
    expect(op.reintentos).toBe(0);
    expect(op.error).toBeNull();
    expect(op.ultimoReintento).toBeNull();
  });

  it('2.4 - payload se persiste correctamente', () => {
    const payload = { paso: 5, denominacion: 'penny', cantidad: 43 };
    crearOperacion({ payload });
    const op = obtenerCola()[0];
    expect(op.payload).toEqual(payload);
  });
});

// ─── Suite 3: procesarCola exitoso ───────────────────────────────────────────

describe('Suite 3: procesarCola exitoso', () => {
  it('3.1 - Ejecutor exitoso elimina operación de la cola', async () => {
    crearOperacion();
    expect(obtenerCola()).toHaveLength(1);

    await procesarCola(ejecutorExitoso);
    expect(obtenerCola()).toHaveLength(0);
  });

  it('3.2 - Procesa en orden FIFO (primera agregada = primera procesada)', async () => {
    const orden: string[] = [];
    const ejecutorOrdenado: EjecutorOperacion = async (op) => {
      orden.push(op.tipo);
    };

    crearOperacion({ tipo: 'GUARDAR_PROGRESO' });
    crearOperacion({ tipo: 'FINALIZAR_CORTE' });
    crearOperacion({ tipo: 'REGISTRAR_INTENTO' });

    await procesarCola(ejecutorOrdenado);
    expect(orden).toEqual([
      'GUARDAR_PROGRESO',
      'FINALIZAR_CORTE',
      'REGISTRAR_INTENTO',
    ]);
  });

  it('3.3 - ResultadoProcesamiento tiene exitosas=N, fallidas=0', async () => {
    crearOperacion();
    crearOperacion();
    crearOperacion();

    const resultado = await procesarCola(ejecutorExitoso);
    expect(resultado.exitosas).toBe(3);
    expect(resultado.fallidas).toBe(0);
    expect(resultado.errores).toHaveLength(0);
  });

  it('3.4 - Cola queda vacía después de procesar todas exitosamente', async () => {
    crearOperacion();
    crearOperacion();

    await procesarCola(ejecutorExitoso);
    const estado = obtenerEstadoCola();
    expect(estado.estaVacia).toBe(true);
    expect(estado.total).toBe(0);
  });
});

// ─── Suite 4: procesarCola con errores y reintentos ──────────────────────────

describe('Suite 4: procesarCola con errores y reintentos', () => {
  it('4.1 - Error incrementa reintentos y guarda mensaje de error', async () => {
    crearOperacion();

    await procesarCola(ejecutorFallido);
    const op = obtenerCola()[0];
    expect(op.reintentos).toBe(1);
    expect(op.error).toBe('Error de red simulado');
    expect(op.ultimoReintento).not.toBeNull();
  });

  it('4.2 - Operación con reintentos < MAX_REINTENTOS queda como pendiente', async () => {
    crearOperacion();

    // Primer fallo: reintentos pasa de 0 a 1
    await procesarCola(ejecutorFallido);
    const op = obtenerCola()[0];
    expect(op.reintentos).toBe(1);
    expect(op.estado).toBe('pendiente');
    expect(op.reintentos).toBeLessThan(MAX_REINTENTOS);
  });

  it('4.3 - Operación con reintentos >= MAX_REINTENTOS queda como fallida', async () => {
    crearOperacion();

    // Fallar MAX_REINTENTOS veces
    for (let i = 0; i < MAX_REINTENTOS; i++) {
      await procesarCola(ejecutorFallido);
    }

    const op = obtenerCola()[0];
    expect(op.reintentos).toBeGreaterThanOrEqual(MAX_REINTENTOS);
    expect(op.estado).toBe('fallida');
  });

  it('4.4 - Operaciones fallida NO se reprocesan en siguiente llamada', async () => {
    crearOperacion();

    // Agotar reintentos
    for (let i = 0; i < MAX_REINTENTOS; i++) {
      await procesarCola(ejecutorFallido);
    }
    expect(obtenerCola()[0].estado).toBe('fallida');

    // Procesar de nuevo - no debe tocar la fallida
    const ejecutorSpy = vi.fn(ejecutorExitoso);
    await procesarCola(ejecutorSpy);
    expect(ejecutorSpy).not.toHaveBeenCalled();
    // La operación fallida sigue en la cola
    expect(obtenerCola()).toHaveLength(1);
  });

  it('4.5 - Resultado incluye errores con id y mensaje', async () => {
    crearOperacion();

    const resultado = await procesarCola(ejecutorFallido);
    expect(resultado.errores).toHaveLength(1);
    expect(resultado.errores[0].error).toBe('Error de red simulado');
    expect(typeof resultado.errores[0].id).toBe('string');
  });
});

// ─── Suite 5: obtenerEstadoCola ──────────────────────────────────────────────

describe('Suite 5: obtenerEstadoCola', () => {
  it('5.1 - Cola vacía retorna estaVacia=true, total=0', () => {
    const estado = obtenerEstadoCola();
    expect(estado.estaVacia).toBe(true);
    expect(estado.total).toBe(0);
    expect(estado.pendientes).toBe(0);
    expect(estado.procesando).toBe(0);
    expect(estado.fallidas).toBe(0);
  });

  it('5.2 - Contadores reflejan estados correctos después de operaciones', () => {
    crearOperacion();
    crearOperacion();
    crearOperacion();

    const estado = obtenerEstadoCola();
    expect(estado.total).toBe(3);
    expect(estado.pendientes).toBe(3);
    expect(estado.estaVacia).toBe(false);
  });

  it('5.3 - fallidas se cuentan separadamente de pendientes', async () => {
    crearOperacion();
    crearOperacion();

    // Agotar reintentos de ambas con ejecutor fallido
    for (let i = 0; i < MAX_REINTENTOS; i++) {
      await procesarCola(ejecutorFallido);
    }

    const estado = obtenerEstadoCola();
    expect(estado.fallidas).toBe(2);
    expect(estado.pendientes).toBe(0);
    expect(estado.total).toBe(2);
  });

  it('5.4 - Estado refleja mezcla de pendientes y fallidas', async () => {
    crearOperacion({ corteId: 'a' });
    crearOperacion({ corteId: 'b' });

    let callCount = 0;
    const ejecutorMixto: EjecutorOperacion = async () => {
      callCount++;
      if (callCount === 1) throw new Error('Fallo selectivo');
    };

    await procesarCola(ejecutorMixto);

    const estado = obtenerEstadoCola();
    expect(estado.total).toBe(1);
    expect(estado.pendientes).toBe(1);
  });
});

// ─── Suite 6: Persistencia y edge cases ──────────────────────────────────────

describe('Suite 6: Persistencia y edge cases', () => {
  it('6.1 - Datos persisten entre llamadas (simular recarga)', () => {
    const id = crearOperacion({ tipo: 'ABORTAR_CORTE', corteId: 'corte-99' });

    // Simular "recarga": leer directamente desde localStorage
    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!) as OperacionOffline[];
    expect(parsed).toHaveLength(1);
    expect(parsed[0].id).toBe(id);
    expect(parsed[0].tipo).toBe('ABORTAR_CORTE');
    expect(parsed[0].corteId).toBe('corte-99');
  });

  it('6.2 - localStorage corrupto retorna array vacío (no crashea)', () => {
    localStorage.setItem(STORAGE_KEY, '{corrupto: no-es-array}');
    expect(() => obtenerCola()).not.toThrow();
    expect(obtenerCola()).toEqual([]);
  });

  it('6.3 - localStorage con valor no-JSON retorna array vacío', () => {
    localStorage.setItem(STORAGE_KEY, 'esto no es JSON válido!!!');
    expect(() => obtenerCola()).not.toThrow();
    expect(obtenerCola()).toEqual([]);
  });

  it('6.4 - eliminarOperacion retorna false para id inexistente', () => {
    crearOperacion();
    const resultado = eliminarOperacion('id-que-no-existe');
    expect(resultado).toBe(false);
    expect(obtenerCola()).toHaveLength(1);
  });

  it('6.5 - escucharConectividad ejecuta callback y cleanup funciona', () => {
    const callback = vi.fn();
    const cleanup = escucharConectividad(callback);
    expect(typeof cleanup).toBe('function');

    window.dispatchEvent(new Event('online'));
    window.dispatchEvent(new Event('online'));
    expect(callback).toHaveBeenCalledTimes(2);

    // Después de cleanup, no debe llamar más
    cleanup();
    window.dispatchEvent(new Event('online'));
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('6.6 - Cola vacía al inicio retorna array vacío', () => {
    expect(obtenerCola()).toEqual([]);
  });

  it('6.7 - procesarCola con cola vacía retorna resultado vacío', async () => {
    const resultado = await procesarCola(ejecutorExitoso);
    expect(resultado.exitosas).toBe(0);
    expect(resultado.fallidas).toBe(0);
    expect(resultado.pendientes).toBe(0);
    expect(resultado.errores).toEqual([]);
  });
});

// ─── Suite 7: Constantes y exports ───────────────────────────────────────────

describe('Suite 7: Constantes y exports', () => {
  it('7.1 - STORAGE_KEY tiene valor esperado', () => {
    expect(STORAGE_KEY).toBe('cashguard_offline_queue');
  });

  it('7.2 - MAX_REINTENTOS es 5', () => {
    expect(MAX_REINTENTOS).toBe(5);
  });

  it('7.3 - BACKOFF_MS tiene 5 valores con backoff exponencial', () => {
    expect(BACKOFF_MS).toEqual([2000, 4000, 8000, 16000, 30000]);
  });
});
