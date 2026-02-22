// 🤖 [IA] - v1.0.0: Tests para hook useCorteSesion
// Orden de Trabajo #004 — Director General de Proyecto

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { Corte, CorteIntento } from '../../types/auditoria';
import { CORRELATIVO_REGEX } from '../../types/auditoria';

// ---------------------------------------------------------------------------
// Hoisted mocks — vi.hoisted() runs before all imports
// ---------------------------------------------------------------------------

const { mockChain, resetMockChain } = vi.hoisted(() => {
  const createMockChain = () => {
    const chain: Record<string, ReturnType<typeof vi.fn>> = {};
    chain.select = vi.fn(() => chain);
    chain.insert = vi.fn(() => chain);
    chain.update = vi.fn(() => chain);
    chain.eq = vi.fn(() => chain);
    chain.in = vi.fn(() => chain);
    chain.gte = vi.fn(() => chain);
    chain.lt = vi.fn(() => chain);
    chain.order = vi.fn(() => chain);
    chain.limit = vi.fn(() => chain);
    chain.single = vi.fn(() => Promise.resolve({ data: null, error: null }));
    chain.maybeSingle = vi.fn(() => Promise.resolve({ data: null, error: null }));
    return chain;
  };

  const mockCortes = createMockChain();
  const mockIntentos = createMockChain();
  const mockSucursales = createMockChain();

  const resetAll = () => {
    Object.values(mockCortes).forEach((fn) => fn.mockClear());
    Object.values(mockIntentos).forEach((fn) => fn.mockClear());
    Object.values(mockSucursales).forEach((fn) => fn.mockClear());
    // Restablecer defaults — sin corte activo (auto-recovery retorna null)
    mockCortes.single.mockResolvedValue({ data: null, error: null });
    mockCortes.maybeSingle.mockResolvedValue({ data: null, error: null });
    mockIntentos.single.mockResolvedValue({ data: null, error: null });
    mockIntentos.maybeSingle.mockResolvedValue({ data: null, error: null });
    mockSucursales.single.mockResolvedValue({ data: null, error: null });
  };

  return {
    mockChain: { cortes: mockCortes, intentos: mockIntentos, sucursales: mockSucursales },
    resetMockChain: resetAll,
  };
});

vi.mock('../../lib/supabase', () => ({
  tables: {
    cortes: () => mockChain.cortes,
    corteIntentos: () => mockChain.intentos,
    sucursales: () => mockChain.sucursales,
  },
}));

// 🤖 [IA] - OT-17: Mock append-only snapshot service (fire-and-forget)
const mockInsertSnapshot = vi.fn().mockResolvedValue(null);
vi.mock('../../lib/snapshots', () => ({
  insertSnapshot: (...args: unknown[]) => mockInsertSnapshot(...args),
}));

// NOW import the module under test
import { useCorteSesion, generarCorrelativo } from '../useCorteSesion';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SUCURSAL_ID = 'suc-heroes-001';
const SUCURSAL_CODIGO = 'H';

const CORTE_MOCK: Corte = {
  id: 'corte-uuid-001',
  correlativo: 'CORTE-2026-02-08-H-001',
  sucursal_id: SUCURSAL_ID,
  cajero: 'Juan Perez',
  testigo: 'Maria Lopez',
  estado: 'INICIADO',
  fase_actual: 0,
  intento_actual: 1,
  venta_esperada: null,
  datos_conteo: null,
  datos_entrega: null,
  datos_verificacion: null,
  datos_reporte: null,
  reporte_hash: null,
  created_at: '2026-02-08T08:00:00.000Z',
  updated_at: '2026-02-08T08:00:00.000Z',
  finalizado_at: null,
  motivo_aborto: null,
};

const CORTE_EN_PROGRESO: Corte = {
  ...CORTE_MOCK,
  estado: 'EN_PROGRESO',
  fase_actual: 1,
  datos_conteo: { conteo_parcial: { penny: 10 }, pagos_electronicos: null, gastos_dia: null },
};

const INTENTO_MOCK: CorteIntento = {
  id: 'intento-uuid-001',
  corte_id: 'corte-uuid-001',
  attempt_number: 1,
  estado: 'ACTIVO',
  snapshot_datos: null,
  motivo_reinicio: null,
  created_at: '2026-02-08T08:00:00.000Z',
  finalizado_at: null,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Configura mocks para que iniciarCorte funcione exitosamente.
 * Configura: sucursal, cortes hoy vacios, insert corte, insert intento.
 */
function setupIniciarCorteExitoso(
  corteResult: Corte = CORTE_MOCK,
  intentoResult: CorteIntento = INTENTO_MOCK,
) {
  // Sucursal lookup
  mockChain.sucursales.single.mockResolvedValueOnce({
    data: { codigo: SUCURSAL_CODIGO },
    error: null,
  });
  // Cortes hoy (select sin single — retorna array)
  // La cadena para cortes hoy termina en .lt() que retorna el chain
  // Necesitamos que la promesa del chain (sin .single()) resuelva con data: []
  // Pero el chain actual termina en .lt() y luego se lee .data
  // En realidad, el código no llama .single() para la consulta de cortesHoy,
  // llama select().eq().gte().lt() — esto retorna una promesa directamente
  mockChain.cortes.lt.mockResolvedValueOnce({ data: [], error: null });
  // Insert corte -> .single()
  mockChain.cortes.single.mockResolvedValueOnce({ data: corteResult, error: null });
  // Insert intento -> .single()
  mockChain.intentos.single.mockResolvedValueOnce({ data: intentoResult, error: null });
}

/**
 * Renderiza el hook con un corte ya iniciado en el estado.
 * Usa iniciarCorte internamente para poblar el estado.
 */
async function renderWithCorte(
  corte: Corte = CORTE_MOCK,
  intento: CorteIntento = INTENTO_MOCK,
) {
  const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

  // Esperar auto-recovery (retorna null por defecto)
  await waitFor(() => {
    expect(result.current.cargando).toBe(false);
  });

  // Configurar mocks para iniciarCorte
  setupIniciarCorteExitoso(corte, intento);

  await act(async () => {
    await result.current.iniciarCorte({
      sucursal_id: SUCURSAL_ID,
      cajero: corte.cajero,
      testigo: corte.testigo,
    });
  });

  return result;
}

// ---------------------------------------------------------------------------
// Suite 1: generarCorrelativo
// ---------------------------------------------------------------------------

describe('Suite 1: generarCorrelativo', () => {
  it('1.1 - Genera formato CORTE-YYYY-MM-DD-X-NNN', () => {
    const result = generarCorrelativo('H', new Date(2026, 1, 8), 1);
    expect(result).toBe('CORTE-2026-02-08-H-001');
  });

  it('1.2 - Pasa validacion CORRELATIVO_REGEX', () => {
    const result = generarCorrelativo('M', new Date(2026, 5, 15), 42);
    expect(CORRELATIVO_REGEX.test(result)).toBe(true);
  });

  it('1.3 - Zero-padding correcto para secuencial', () => {
    const fecha = new Date(2026, 0, 1);
    expect(generarCorrelativo('H', fecha, 1)).toContain('-001');
    expect(generarCorrelativo('H', fecha, 12)).toContain('-012');
    expect(generarCorrelativo('H', fecha, 123)).toContain('-123');
  });

  it('1.4 - Diferentes codigos de sucursal', () => {
    const fecha = new Date(2026, 0, 1);
    expect(generarCorrelativo('H', fecha, 1)).toContain('-H-');
    expect(generarCorrelativo('M', fecha, 1)).toContain('-M-');
  });
});

// ---------------------------------------------------------------------------
// Suite 2: Estado inicial
// ---------------------------------------------------------------------------

describe('Suite 2: Estado inicial', () => {
  beforeEach(() => {
    resetMockChain();
  });

  it('2.1 - Estado es null cuando no hay corte activo', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.estado).toBeNull();
    expect(result.current.corte_actual).toBeNull();
    expect(result.current.intento_actual).toBeNull();
  });

  it('2.2 - error es null en estado inicial', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    expect(result.current.error).toBeNull();
  });

  it('2.3 - cargando es false despues de montar sin corte activo', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });
  });

  it('2.4 - Recupera corte activo existente al montar', async () => {
    // Mock auto-recovery: corte activo encontrado
    mockChain.cortes.maybeSingle.mockResolvedValueOnce({
      data: CORTE_EN_PROGRESO,
      error: null,
    });
    mockChain.intentos.maybeSingle.mockResolvedValueOnce({
      data: INTENTO_MOCK,
      error: null,
    });

    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.corte_actual).not.toBeNull();
    });

    expect(result.current.corte_actual).toEqual(CORTE_EN_PROGRESO);
    expect(result.current.intento_actual).toEqual(INTENTO_MOCK);
    expect(result.current.estado).toBe('EN_PROGRESO');
  });
});

// ---------------------------------------------------------------------------
// Suite 3: iniciarCorte
// ---------------------------------------------------------------------------

describe('Suite 3: iniciarCorte', () => {
  beforeEach(() => {
    resetMockChain();
  });

  it('3.1 - Crea corte con estado INICIADO y correlativo valido', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    setupIniciarCorteExitoso();

    let corteCreado: Corte | undefined;
    await act(async () => {
      corteCreado = await result.current.iniciarCorte({
        sucursal_id: SUCURSAL_ID,
        cajero: 'Juan Perez',
        testigo: 'Maria Lopez',
      });
    });

    expect(corteCreado).toBeDefined();
    expect(result.current.corte_actual?.estado).toBe('INICIADO');
    expect(CORRELATIVO_REGEX.test(result.current.corte_actual!.correlativo)).toBe(true);
  });

  it('3.2 - Crea primer CorteIntento con attempt_number=1', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    setupIniciarCorteExitoso();

    await act(async () => {
      await result.current.iniciarCorte({
        sucursal_id: SUCURSAL_ID,
        cajero: 'Juan Perez',
        testigo: 'Maria Lopez',
      });
    });

    expect(result.current.intento_actual?.attempt_number).toBe(1);
    expect(result.current.intento_actual?.estado).toBe('ACTIVO');
  });

  it('3.3 - Rechaza si cajero === testigo', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.iniciarCorte({
          sucursal_id: SUCURSAL_ID,
          cajero: 'Juan Perez',
          testigo: 'Juan Perez',
        });
      }),
    ).rejects.toThrow('Cajero y testigo deben ser diferentes');
  });

  it('3.4 - Maneja error de Supabase correctamente', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    // Sucursal OK
    mockChain.sucursales.single.mockResolvedValueOnce({
      data: { codigo: SUCURSAL_CODIGO },
      error: null,
    });
    // Cortes hoy OK
    mockChain.cortes.lt.mockResolvedValueOnce({ data: [], error: null });
    // Insert corte falla
    mockChain.cortes.single.mockResolvedValueOnce({
      data: null,
      error: { message: 'DB error' },
    });

    // 🤖 [IA] - v1.0.0: Capturar error DENTRO de act() para que React flush state updates
    let thrownError: Error | null = null;
    await act(async () => {
      try {
        await result.current.iniciarCorte({
          sucursal_id: SUCURSAL_ID,
          cajero: 'Juan Perez',
          testigo: 'Maria Lopez',
        });
      } catch (e) {
        thrownError = e as Error;
      }
    });

    expect(thrownError).not.toBeNull();
    expect(thrownError!.message).toBe('DB error');
    expect(result.current.error).toBe('DB error');
  });

  it('3.5 - Propaga venta_esperada numerica al insert', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    const corteConVenta: Corte = { ...CORTE_MOCK, venta_esperada: 653.65 };
    setupIniciarCorteExitoso(corteConVenta);

    await act(async () => {
      await result.current.iniciarCorte({
        sucursal_id: SUCURSAL_ID,
        cajero: 'Juan Perez',
        testigo: 'Maria Lopez',
        venta_esperada: 653.65,
      });
    });

    // Verificar que insert recibio venta_esperada
    const insertCall = mockChain.cortes.insert.mock.calls[
      mockChain.cortes.insert.mock.calls.length - 1
    ][0];
    expect(insertCall.venta_esperada).toBe(653.65);
    expect(result.current.corte_actual?.venta_esperada).toBe(653.65);
  });

  it('3.6 - Envia venta_esperada null cuando no se proporciona', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    setupIniciarCorteExitoso();

    await act(async () => {
      await result.current.iniciarCorte({
        sucursal_id: SUCURSAL_ID,
        cajero: 'Juan Perez',
        testigo: 'Maria Lopez',
      });
    });

    // Verificar que insert recibio venta_esperada: null
    const insertCall = mockChain.cortes.insert.mock.calls[
      mockChain.cortes.insert.mock.calls.length - 1
    ][0];
    expect(insertCall.venta_esperada).toBeNull();
    expect(result.current.corte_actual?.venta_esperada).toBeNull();
  });

  it('3.7 - Rechaza si ya existe corte FINALIZADO hoy', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    // Sucursal OK
    mockChain.sucursales.single.mockResolvedValueOnce({
      data: { codigo: SUCURSAL_CODIGO },
      error: null,
    });
    // Cortes hoy retorna uno FINALIZADO
    mockChain.cortes.lt.mockResolvedValueOnce({
      data: [{ id: 'corte-existente', estado: 'FINALIZADO' }],
      error: null,
    });

    await expect(
      act(async () => {
        await result.current.iniciarCorte({
          sucursal_id: SUCURSAL_ID,
          cajero: 'Juan Perez',
          testigo: 'Maria Lopez',
        });
      }),
    ).rejects.toThrow('Ya existe un corte finalizado para hoy');
  });
});

// ---------------------------------------------------------------------------
// Suite 4: guardarProgreso
// ---------------------------------------------------------------------------

describe('Suite 4: guardarProgreso', () => {
  beforeEach(() => {
    resetMockChain();
  });

  it('4.1 - Actualiza fase_actual y datos_conteo', async () => {
    const result = await renderWithCorte();

    // Mock para guardarProgreso
    const corteActualizado = { ...CORTE_MOCK, fase_actual: 1, estado: 'EN_PROGRESO' as const };
    mockChain.cortes.single.mockResolvedValueOnce({
      data: corteActualizado,
      error: null,
    });

    await act(async () => {
      await result.current.guardarProgreso({
        fase_actual: 1,
        conteo_parcial: { penny: 10 },
        pagos_electronicos: null,
        gastos_dia: null,
      });
    });

    // Verificar que update fue llamado con los datos correctos
    expect(mockChain.cortes.update).toHaveBeenCalled();
    const updateCall = mockChain.cortes.update.mock.calls[
      mockChain.cortes.update.mock.calls.length - 1
    ][0];
    expect(updateCall.fase_actual).toBe(1);
    expect(updateCall.datos_conteo).toEqual({
      conteo_parcial: { penny: 10 },
      pagos_electronicos: null,
      gastos_dia: null,
    });
  });

  it('4.2 - Transiciona INICIADO -> EN_PROGRESO', async () => {
    const result = await renderWithCorte();

    const corteActualizado = { ...CORTE_MOCK, estado: 'EN_PROGRESO' as const };
    mockChain.cortes.single.mockResolvedValueOnce({
      data: corteActualizado,
      error: null,
    });

    await act(async () => {
      await result.current.guardarProgreso({
        fase_actual: 1,
        conteo_parcial: null,
        pagos_electronicos: null,
        gastos_dia: null,
      });
    });

    const updateCall = mockChain.cortes.update.mock.calls[
      mockChain.cortes.update.mock.calls.length - 1
    ][0];
    expect(updateCall.estado).toBe('EN_PROGRESO');
  });

  it('4.3 - Mantiene EN_PROGRESO si ya esta en progreso', async () => {
    const result = await renderWithCorte(CORTE_EN_PROGRESO, INTENTO_MOCK);

    const corteActualizado = { ...CORTE_EN_PROGRESO, fase_actual: 2 };
    mockChain.cortes.single.mockResolvedValueOnce({
      data: corteActualizado,
      error: null,
    });

    await act(async () => {
      await result.current.guardarProgreso({
        fase_actual: 2,
        conteo_parcial: null,
        pagos_electronicos: null,
        gastos_dia: null,
      });
    });

    const updateCall = mockChain.cortes.update.mock.calls[
      mockChain.cortes.update.mock.calls.length - 1
    ][0];
    expect(updateCall.estado).toBe('EN_PROGRESO');
  });

  it('4.4 - Rechaza si no hay corte activo', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.guardarProgreso({
          fase_actual: 1,
          conteo_parcial: null,
          pagos_electronicos: null,
          gastos_dia: null,
        });
      }),
    ).rejects.toThrow('No hay corte activo para guardar progreso');
  });

  // 🤖 [IA] - OT-17: Snapshot fire-and-forget después de guardarProgreso exitoso
  it('4.5 - Llama insertSnapshot fire-and-forget tras guardar exitoso', async () => {
    mockInsertSnapshot.mockClear();

    const result = await renderWithCorte();

    // Mock para que guardarProgreso resuelva exitosamente
    const corteActualizado = { ...CORTE_MOCK, fase_actual: 2, estado: 'EN_PROGRESO' as const };
    mockChain.cortes.single.mockResolvedValueOnce({
      data: corteActualizado,
      error: null,
    });

    await act(async () => {
      await result.current.guardarProgreso({
        fase_actual: 2,
        conteo_parcial: { penny: 10 },
        pagos_electronicos: { credomatic: 5 },
        gastos_dia: null,
      });
    });

    expect(mockInsertSnapshot).toHaveBeenCalledTimes(1);
    expect(mockInsertSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        corte_id: expect.any(String),
        attempt_number: expect.any(Number),
        fase_actual: 2,
        source: 'manual',
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// Suite 5: finalizarCorte
// ---------------------------------------------------------------------------

describe('Suite 5: finalizarCorte', () => {
  beforeEach(() => {
    resetMockChain();
  });

  it('5.1 - Transiciona a FINALIZADO con reporte_hash', async () => {
    const result = await renderWithCorte(CORTE_EN_PROGRESO, INTENTO_MOCK);

    const corteFinalizado: Corte = {
      ...CORTE_EN_PROGRESO,
      estado: 'FINALIZADO',
      reporte_hash: 'abc123hash',
      finalizado_at: '2026-02-08T17:00:00.000Z',
    };
    mockChain.cortes.single.mockResolvedValueOnce({
      data: corteFinalizado,
      error: null,
    });
    // Intento update (sin .single())
    mockChain.intentos.eq.mockResolvedValueOnce({ error: null });

    await act(async () => {
      await result.current.finalizarCorte('abc123hash');
    });

    expect(result.current.corte_actual?.estado).toBe('FINALIZADO');
    expect(result.current.corte_actual?.reporte_hash).toBe('abc123hash');
    expect(result.current.corte_actual?.finalizado_at).not.toBeNull();
  });

  it('5.2 - Marca CorteIntento como COMPLETADO', async () => {
    const result = await renderWithCorte(CORTE_EN_PROGRESO, INTENTO_MOCK);

    const corteFinalizado: Corte = {
      ...CORTE_EN_PROGRESO,
      estado: 'FINALIZADO',
      reporte_hash: 'hash123',
      finalizado_at: '2026-02-08T17:00:00.000Z',
    };
    mockChain.cortes.single.mockResolvedValueOnce({
      data: corteFinalizado,
      error: null,
    });
    mockChain.intentos.eq.mockResolvedValueOnce({ error: null });

    await act(async () => {
      await result.current.finalizarCorte('hash123');
    });

    // Verificar que intentos.update fue llamado con estado COMPLETADO
    expect(mockChain.intentos.update).toHaveBeenCalled();
    const intentoUpdateCall = mockChain.intentos.update.mock.calls[
      mockChain.intentos.update.mock.calls.length - 1
    ][0];
    expect(intentoUpdateCall.estado).toBe('COMPLETADO');
  });

  it('5.3 - Rechaza si corte no esta EN_PROGRESO', async () => {
    // Corte en estado INICIADO (no EN_PROGRESO)
    const result = await renderWithCorte(CORTE_MOCK, INTENTO_MOCK);

    await expect(
      act(async () => {
        await result.current.finalizarCorte('hash123');
      }),
    ).rejects.toThrow('Solo se puede finalizar un corte EN_PROGRESO');
  });
});

// ---------------------------------------------------------------------------
// Suite 6: abortarCorte
// ---------------------------------------------------------------------------

describe('Suite 6: abortarCorte', () => {
  beforeEach(() => {
    resetMockChain();
  });

  it('6.1 - Transiciona a ABORTADO con motivo', async () => {
    const result = await renderWithCorte(CORTE_EN_PROGRESO, INTENTO_MOCK);

    // Corte update (sin .select().single() en abortarCorte)
    mockChain.cortes.eq.mockResolvedValueOnce({ error: null });
    // Intento update
    mockChain.intentos.eq.mockResolvedValueOnce({ error: null });

    await act(async () => {
      await result.current.abortarCorte('Error de conteo');
    });

    // Verificar que cortes.update fue llamado con estado ABORTADO
    expect(mockChain.cortes.update).toHaveBeenCalled();
    const updateCall = mockChain.cortes.update.mock.calls[
      mockChain.cortes.update.mock.calls.length - 1
    ][0];
    expect(updateCall.estado).toBe('ABORTADO');
    expect(updateCall.motivo_aborto).toBe('Error de conteo');
  });

  it('6.2 - Marca CorteIntento como ABANDONADO', async () => {
    const result = await renderWithCorte(CORTE_EN_PROGRESO, INTENTO_MOCK);

    mockChain.cortes.eq.mockResolvedValueOnce({ error: null });
    mockChain.intentos.eq.mockResolvedValueOnce({ error: null });

    await act(async () => {
      await result.current.abortarCorte('Error critico');
    });

    expect(mockChain.intentos.update).toHaveBeenCalled();
    const intentoUpdateCall = mockChain.intentos.update.mock.calls[
      mockChain.intentos.update.mock.calls.length - 1
    ][0];
    expect(intentoUpdateCall.estado).toBe('ABANDONADO');
  });

  it('6.3 - Limpia estado local', async () => {
    const result = await renderWithCorte(CORTE_EN_PROGRESO, INTENTO_MOCK);

    mockChain.cortes.eq.mockResolvedValueOnce({ error: null });
    mockChain.intentos.eq.mockResolvedValueOnce({ error: null });

    await act(async () => {
      await result.current.abortarCorte('Cancelado por usuario');
    });

    expect(result.current.corte_actual).toBeNull();
    expect(result.current.intento_actual).toBeNull();
    expect(result.current.estado).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Suite 7: reiniciarIntento
// ---------------------------------------------------------------------------

describe('Suite 7: reiniciarIntento', () => {
  beforeEach(() => {
    resetMockChain();
  });

  it('7.1 - Marca intento actual como ABANDONADO', async () => {
    const result = await renderWithCorte(CORTE_EN_PROGRESO, INTENTO_MOCK);

    // Intento update (marcar ABANDONADO)
    mockChain.intentos.eq.mockResolvedValueOnce({ error: null });
    // Insert nuevo intento
    const nuevoIntento: CorteIntento = {
      ...INTENTO_MOCK,
      id: 'intento-uuid-002',
      attempt_number: 2,
      motivo_reinicio: 'Conteo incorrecto',
    };
    mockChain.intentos.single.mockResolvedValueOnce({ data: nuevoIntento, error: null });
    // Update corte
    const corteActualizado = { ...CORTE_EN_PROGRESO, intento_actual: 2, fase_actual: 0 };
    mockChain.cortes.single.mockResolvedValueOnce({ data: corteActualizado, error: null });

    await act(async () => {
      await result.current.reiniciarIntento('Conteo incorrecto');
    });

    expect(mockChain.intentos.update).toHaveBeenCalled();
    const intentoUpdateCall = mockChain.intentos.update.mock.calls[
      mockChain.intentos.update.mock.calls.length - 1
    ][0];
    expect(intentoUpdateCall.estado).toBe('ABANDONADO');
  });

  it('7.2 - Crea nuevo intento con attempt_number incrementado', async () => {
    const result = await renderWithCorte(CORTE_EN_PROGRESO, INTENTO_MOCK);

    mockChain.intentos.eq.mockResolvedValueOnce({ error: null });
    const nuevoIntento: CorteIntento = {
      ...INTENTO_MOCK,
      id: 'intento-uuid-002',
      attempt_number: 2,
      estado: 'ACTIVO',
      motivo_reinicio: 'Error detectado',
    };
    mockChain.intentos.single.mockResolvedValueOnce({ data: nuevoIntento, error: null });
    const corteActualizado = { ...CORTE_EN_PROGRESO, intento_actual: 2, fase_actual: 0 };
    mockChain.cortes.single.mockResolvedValueOnce({ data: corteActualizado, error: null });

    let resultado: CorteIntento | undefined;
    await act(async () => {
      resultado = await result.current.reiniciarIntento('Error detectado');
    });

    expect(resultado?.attempt_number).toBe(2);
    expect(resultado?.estado).toBe('ACTIVO');
    expect(result.current.intento_actual?.attempt_number).toBe(2);
  });

  it('7.3 - Requiere motivo no vacio', async () => {
    const result = await renderWithCorte(CORTE_EN_PROGRESO, INTENTO_MOCK);

    await expect(
      act(async () => {
        await result.current.reiniciarIntento('');
      }),
    ).rejects.toThrow('Motivo de reinicio es obligatorio');
  });

  it('7.4 - Limpia datos parciales del corte', async () => {
    const result = await renderWithCorte(CORTE_EN_PROGRESO, INTENTO_MOCK);

    mockChain.intentos.eq.mockResolvedValueOnce({ error: null });
    const nuevoIntento: CorteIntento = {
      ...INTENTO_MOCK,
      id: 'intento-uuid-002',
      attempt_number: 2,
      motivo_reinicio: 'Reinicio necesario',
    };
    mockChain.intentos.single.mockResolvedValueOnce({ data: nuevoIntento, error: null });
    const corteActualizado: Corte = {
      ...CORTE_EN_PROGRESO,
      intento_actual: 2,
      fase_actual: 0,
      datos_conteo: null,
      datos_entrega: null,
      datos_verificacion: null,
      datos_reporte: null,
    };
    mockChain.cortes.single.mockResolvedValueOnce({ data: corteActualizado, error: null });

    await act(async () => {
      await result.current.reiniciarIntento('Reinicio necesario');
    });

    // Verificar que cortes.update limpia datos parciales
    expect(mockChain.cortes.update).toHaveBeenCalled();
    const corteUpdateCall = mockChain.cortes.update.mock.calls[
      mockChain.cortes.update.mock.calls.length - 1
    ][0];
    expect(corteUpdateCall.fase_actual).toBe(0);
    expect(corteUpdateCall.datos_conteo).toBeNull();
    expect(corteUpdateCall.datos_entrega).toBeNull();
    expect(corteUpdateCall.datos_verificacion).toBeNull();
    expect(corteUpdateCall.datos_reporte).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Suite 8: recuperarSesion
// ---------------------------------------------------------------------------

describe('Suite 8: recuperarSesion', () => {
  beforeEach(() => {
    resetMockChain();
  });

  it('8.1 - Retorna corte activo con intento', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    // Mock para recuperarSesion manual
    mockChain.cortes.maybeSingle.mockResolvedValueOnce({
      data: CORTE_EN_PROGRESO,
      error: null,
    });
    mockChain.intentos.maybeSingle.mockResolvedValueOnce({
      data: INTENTO_MOCK,
      error: null,
    });

    let recuperado: Corte | null | undefined;
    await act(async () => {
      recuperado = await result.current.recuperarSesion();
    });

    expect(recuperado).toEqual(CORTE_EN_PROGRESO);
    expect(result.current.corte_actual).toEqual(CORTE_EN_PROGRESO);
    expect(result.current.intento_actual).toEqual(INTENTO_MOCK);
  });

  it('8.2 - Retorna null si no hay corte activo', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    // Ya esta configurado por default a retornar null
    let recuperado: Corte | null | undefined;
    await act(async () => {
      recuperado = await result.current.recuperarSesion();
    });

    expect(recuperado).toBeNull();
  });

  it('8.3 - Filtra por sucursal_id correctamente', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    // Limpiar llamadas del auto-recovery
    mockChain.cortes.eq.mockClear();

    await act(async () => {
      await result.current.recuperarSesion();
    });

    // Verificar que eq fue llamado con sucursal_id
    expect(mockChain.cortes.eq).toHaveBeenCalledWith('sucursal_id', SUCURSAL_ID);
  });
});

// ---------------------------------------------------------------------------
// Suite 9: Manejo de errores
// ---------------------------------------------------------------------------

describe('Suite 9: Manejo de errores', () => {
  beforeEach(() => {
    resetMockChain();
  });

  it('9.1 - Error de red capturado y reportado en estado', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    // Sucursal falla con error de red
    mockChain.sucursales.single.mockRejectedValueOnce(new Error('Network error'));

    // 🤖 [IA] - v1.0.0: Capturar error DENTRO de act() para que React flush state updates
    let thrownError: Error | null = null;
    await act(async () => {
      try {
        await result.current.iniciarCorte({
          sucursal_id: SUCURSAL_ID,
          cajero: 'Juan Perez',
          testigo: 'Maria Lopez',
        });
      } catch (e) {
        thrownError = e as Error;
      }
    });

    expect(thrownError).not.toBeNull();
    expect(thrownError!.message).toBe('Network error');
    expect(result.current.error).toBe('Network error');
  });

  it('9.2 - cargando se resetea despues de error', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    mockChain.sucursales.single.mockRejectedValueOnce(new Error('Timeout'));

    try {
      await act(async () => {
        await result.current.iniciarCorte({
          sucursal_id: SUCURSAL_ID,
          cajero: 'Juan',
          testigo: 'Maria',
        });
      });
    } catch {
      // Error esperado
    }

    expect(result.current.cargando).toBe(false);
  });

  it('9.3 - Error se limpia al iniciar nueva operacion', async () => {
    const { result } = renderHook(() => useCorteSesion(SUCURSAL_ID));

    await waitFor(() => {
      expect(result.current.cargando).toBe(false);
    });

    // Primera operacion falla
    mockChain.sucursales.single.mockRejectedValueOnce(new Error('Error previo'));

    // 🤖 [IA] - v1.0.0: Capturar error DENTRO de act() para que React flush state updates
    await act(async () => {
      try {
        await result.current.iniciarCorte({
          sucursal_id: SUCURSAL_ID,
          cajero: 'Juan',
          testigo: 'Maria',
        });
      } catch {
        // Error esperado — capturado dentro de act para flush de estado
      }
    });

    expect(result.current.error).toBe('Error previo');

    // Segunda operacion exitosa — configurar mocks completos
    setupIniciarCorteExitoso();

    await act(async () => {
      await result.current.iniciarCorte({
        sucursal_id: SUCURSAL_ID,
        cajero: 'Juan Perez',
        testigo: 'Maria Lopez',
      });
    });

    expect(result.current.error).toBeNull();
  });
});
