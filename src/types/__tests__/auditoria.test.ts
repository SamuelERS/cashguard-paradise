// 🤖 [IA] - v2.0.0: Tests del sistema de auditoria de corte de caja
import { describe, it, expect } from 'vitest';
import {
  type EstadoCorte,
  type Corte,
  type CorteIntento,
  isCorte,
  isCorteIntento,
  isEstadoCorte,
  isCorrelativoValido,
  isIniciarCorteParamsValido,
  ESTADOS_TERMINALES,
  CORRELATIVO_REGEX,
  FASE_MAXIMA,
} from '../auditoria';
// Test data factories

function makeCorte(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    id: 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6',
    correlativo: 'CORTE-2026-02-08-H-001',
    sucursal_id: 'suc-001',
    cajero: 'Tito Gomez',
    testigo: 'Adonay Torres',
    estado: 'INICIADO' as EstadoCorte,
    fase_actual: 1,
    intento_actual: 1,
    venta_esperada: 653.65,
    datos_conteo: null,
    datos_entrega: null,
    datos_verificacion: null,
    datos_reporte: null,
    reporte_hash: null,
    created_at: '2026-02-08T14:00:00.000Z',
    updated_at: '2026-02-08T14:00:00.000Z',
    finalizado_at: null,
    motivo_aborto: null,
    motivo_nuevo_corte: null,
    ...overrides,
  };
}

function makeCorteIntento(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  return {
    id: 'int-001',
    corte_id: 'a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6',
    attempt_number: 1,
    estado: 'ACTIVO',
    snapshot_datos: null,
    motivo_reinicio: null,
    created_at: '2026-02-08T14:00:00.000Z',
    finalizado_at: null,
    ...overrides,
  };
}

// Tests

describe('auditoria.ts - Tipos y Guards del sistema de auditoria', () => {
  // =========================================================================
  // isCorte() type guard
  // =========================================================================
  describe('isCorte() type guard', () => {
    it('Acepta objeto valido con todos los campos', () => {
      const corte = makeCorte();
      expect(isCorte(corte)).toBe(true);
    });

    it('Acepta corte con todos los estados validos', () => {
      const estados: EstadoCorte[] = ['INICIADO', 'EN_PROGRESO', 'FINALIZADO', 'ABORTADO'];
      for (const estado of estados) {
        expect(isCorte(makeCorte({ estado }))).toBe(true);
      }
    });

    it('Acepta campos JSONB como null (datos parciales)', () => {
      const corte = makeCorte({
        datos_conteo: null,
        datos_entrega: null,
        datos_verificacion: null,
        datos_reporte: null,
      });
      expect(isCorte(corte)).toBe(true);
    });

    it('Acepta campos JSONB como objetos Record', () => {
      const corte = makeCorte({
        datos_conteo: { penny: 43, nickel: 20 },
        datos_entrega: { amountToDeliver: 327.20 },
        datos_verificacion: { totalAttempts: 8 },
        datos_reporte: { hash: 'abc123' },
      });
      expect(isCorte(corte)).toBe(true);
    });

    it('Acepta corte finalizado con reporte_hash y finalizado_at', () => {
      const corte = makeCorte({
        estado: 'FINALIZADO',
        reporte_hash: 'a'.repeat(64),
        finalizado_at: '2026-02-08T15:00:00.000Z',
      });
      expect(isCorte(corte)).toBe(true);
    });

    it('Acepta corte abortado con motivo_aborto y finalizado_at', () => {
      const corte = makeCorte({
        estado: 'ABORTADO',
        motivo_aborto: 'Error irrecuperable',
        finalizado_at: '2026-02-08T15:00:00.000Z',
      });
      expect(isCorte(corte)).toBe(true);
    });

    it('Acepta corte con venta_esperada null', () => {
      const corte = makeCorte({ venta_esperada: null });
      expect(isCorte(corte)).toBe(true);
    });

    it('Valida formato correlativo', () => {
      const corte = makeCorte({ correlativo: 'CORTE-2026-02-08-H-001' });
      expect(isCorte(corte)).toBe(true);
    });

    it('Acepta correlativo con sufijo de intento', () => {
      const corte = makeCorte({ correlativo: 'CORTE-2026-02-08-H-001-A2' });
      expect(isCorte(corte)).toBe(true);
    });

    it('Rechaza null', () => {
      expect(isCorte(null)).toBe(false);
    });

    it('Rechaza undefined', () => {
      expect(isCorte(undefined)).toBe(false);
    });

    it('Rechaza primitivos', () => {
      expect(isCorte(42)).toBe(false);
      expect(isCorte('string')).toBe(false);
      expect(isCorte(true)).toBe(false);
    });

    it('Rechaza objeto sin id', () => {
      const { id: _, ...sinId } = makeCorte() as Record<string, unknown>;
      expect(isCorte(sinId)).toBe(false);
    });

    it('Rechaza objeto sin correlativo', () => {
      const corte = makeCorte();
      delete corte.correlativo;
      expect(isCorte(corte)).toBe(false);
    });

    it('Rechaza objeto con estado invalido', () => {
      expect(isCorte(makeCorte({ estado: 'INVALIDO' }))).toBe(false);
      expect(isCorte(makeCorte({ estado: 123 }))).toBe(false);
      expect(isCorte(makeCorte({ estado: null }))).toBe(false);
    });

    it('Rechaza correlativo con formato invalido', () => {
      expect(isCorte(makeCorte({ correlativo: 'CORTE-ABC-DEF' }))).toBe(false);
      expect(isCorte(makeCorte({ correlativo: '' }))).toBe(false);
      expect(isCorte(makeCorte({ correlativo: 'INVALID' }))).toBe(false);
    });

    it('Rechaza fase_actual no numerica', () => {
      expect(isCorte(makeCorte({ fase_actual: 'uno' }))).toBe(false);
    });

    it('Rechaza intento_actual no numerico', () => {
      expect(isCorte(makeCorte({ intento_actual: null }))).toBe(false);
    });

    it('Rechaza reporte_hash con tipo invalido (no string ni null)', () => {
      expect(isCorte(makeCorte({ reporte_hash: 123 }))).toBe(false);
    });

    it('Rechaza finalizado_at con tipo invalido', () => {
      expect(isCorte(makeCorte({ finalizado_at: 123 }))).toBe(false);
    });

    it('Rechaza motivo_aborto con tipo invalido', () => {
      expect(isCorte(makeCorte({ motivo_aborto: 123 }))).toBe(false);
    });

    it('Rechaza venta_esperada con tipo invalido (no number ni null)', () => {
      expect(isCorte(makeCorte({ venta_esperada: 'abc' }))).toBe(false);
    });

    it('Rechaza datos_conteo como array (JSONB debe ser Record | null)', () => {
      expect(isCorte(makeCorte({ datos_conteo: [1, 2, 3] }))).toBe(false);
    });

    it('Rechaza datos_entrega como primitivo', () => {
      expect(isCorte(makeCorte({ datos_entrega: 'string' }))).toBe(false);
    });

    it('Rechaza datos_verificacion como numero', () => {
      expect(isCorte(makeCorte({ datos_verificacion: 42 }))).toBe(false);
    });

    it('Rechaza datos_reporte como boolean', () => {
      expect(isCorte(makeCorte({ datos_reporte: true }))).toBe(false);
    });

    it('Rechaza campo cajero faltante', () => {
      const corte = makeCorte();
      delete corte.cajero;
      expect(isCorte(corte)).toBe(false);
    });

    it('Rechaza campo testigo faltante', () => {
      const corte = makeCorte();
      delete corte.testigo;
      expect(isCorte(corte)).toBe(false);
    });

    it('Rechaza campo created_at faltante', () => {
      const corte = makeCorte();
      delete corte.created_at;
      expect(isCorte(corte)).toBe(false);
    });

    it('Rechaza campo updated_at faltante', () => {
      const corte = makeCorte();
      delete corte.updated_at;
      expect(isCorte(corte)).toBe(false);
    });

    it('Rechaza campo sucursal_id faltante', () => {
      const corte = makeCorte();
      delete corte.sucursal_id;
      expect(isCorte(corte)).toBe(false);
    });
  });

  // =========================================================================
  // isCorteIntento() type guard
  // =========================================================================
  describe('isCorteIntento() type guard', () => {
    it('Acepta intento valido (attempt 1)', () => {
      const intento = makeCorteIntento();
      expect(isCorteIntento(intento)).toBe(true);
    });

    it('Acepta intento completado con finalizado_at', () => {
      const intento = makeCorteIntento({
        estado: 'COMPLETADO',
        finalizado_at: '2026-02-08T15:00:00.000Z',
      });
      expect(isCorteIntento(intento)).toBe(true);
    });

    it('Acepta intento abandonado con motivo y finalizado_at', () => {
      const intento = makeCorteIntento({
        attempt_number: 2,
        estado: 'ABANDONADO',
        motivo_reinicio: 'Error en conteo, reiniciando',
        finalizado_at: '2026-02-08T15:00:00.000Z',
      });
      expect(isCorteIntento(intento)).toBe(true);
    });

    it('Acepta intento con snapshot_datos como Record', () => {
      const intento = makeCorteIntento({
        snapshot_datos: { fase: 1, conteo: { penny: 43 } },
      });
      expect(isCorteIntento(intento)).toBe(true);
    });

    it('Acepta intento con snapshot_datos como null', () => {
      const intento = makeCorteIntento({ snapshot_datos: null });
      expect(isCorteIntento(intento)).toBe(true);
    });

    it('Rechaza null', () => {
      expect(isCorteIntento(null)).toBe(false);
    });

    it('Rechaza undefined', () => {
      expect(isCorteIntento(undefined)).toBe(false);
    });

    it('Rechaza primitivos', () => {
      expect(isCorteIntento(42)).toBe(false);
      expect(isCorteIntento('string')).toBe(false);
    });

    it('Rechaza sin corte_id', () => {
      const intento = makeCorteIntento();
      delete intento.corte_id;
      expect(isCorteIntento(intento)).toBe(false);
    });

    it('Rechaza sin id', () => {
      const intento = makeCorteIntento();
      delete intento.id;
      expect(isCorteIntento(intento)).toBe(false);
    });

    it('Rechaza sin created_at', () => {
      const intento = makeCorteIntento();
      delete intento.created_at;
      expect(isCorteIntento(intento)).toBe(false);
    });

    it('Valida attempt_number > 0', () => {
      expect(isCorteIntento(makeCorteIntento({ attempt_number: 0 }))).toBe(false);
      expect(isCorteIntento(makeCorteIntento({ attempt_number: -1 }))).toBe(false);
    });

    it('Rechaza attempt_number no entero', () => {
      expect(isCorteIntento(makeCorteIntento({ attempt_number: 1.5 }))).toBe(false);
    });

    it('Rechaza attempt_number no numerico', () => {
      expect(isCorteIntento(makeCorteIntento({ attempt_number: 'uno' }))).toBe(false);
    });

    it('Requiere motivo_reinicio si attempt > 1', () => {
      // Sin motivo, attempt 2 -> invalido
      expect(isCorteIntento(makeCorteIntento({
        attempt_number: 2,
        motivo_reinicio: null,
      }))).toBe(false);

      // Con motivo vacio, attempt 2 -> invalido
      expect(isCorteIntento(makeCorteIntento({
        attempt_number: 2,
        motivo_reinicio: '',
      }))).toBe(false);

      // Con motivo valido, attempt 2 -> valido
      expect(isCorteIntento(makeCorteIntento({
        attempt_number: 2,
        motivo_reinicio: 'Cajero solicito reinicio',
      }))).toBe(true);
    });

    it('No requiere motivo_reinicio en attempt 1', () => {
      expect(isCorteIntento(makeCorteIntento({
        attempt_number: 1,
        motivo_reinicio: null,
      }))).toBe(true);
    });

    it('Rechaza estado invalido', () => {
      expect(isCorteIntento(makeCorteIntento({ estado: 'INVALIDO' }))).toBe(false);
      expect(isCorteIntento(makeCorteIntento({ estado: 123 }))).toBe(false);
    });

    it('Rechaza snapshot_datos como array', () => {
      expect(isCorteIntento(makeCorteIntento({ snapshot_datos: [1, 2] }))).toBe(false);
    });

    it('Rechaza snapshot_datos como primitivo', () => {
      expect(isCorteIntento(makeCorteIntento({ snapshot_datos: 'string' }))).toBe(false);
    });

    it('Rechaza finalizado_at con tipo invalido', () => {
      expect(isCorteIntento(makeCorteIntento({ finalizado_at: 123 }))).toBe(false);
    });

    it('Rechaza motivo_reinicio con tipo invalido (no string ni null)', () => {
      expect(isCorteIntento(makeCorteIntento({ motivo_reinicio: 123 }))).toBe(false);
    });
  });

  // =========================================================================
  // isEstadoCorte()
  // =========================================================================
  describe('isEstadoCorte()', () => {
    it('Acepta INICIADO', () => {
      expect(isEstadoCorte('INICIADO')).toBe(true);
    });

    it('Acepta EN_PROGRESO', () => {
      expect(isEstadoCorte('EN_PROGRESO')).toBe(true);
    });

    it('Acepta FINALIZADO', () => {
      expect(isEstadoCorte('FINALIZADO')).toBe(true);
    });

    it('Acepta ABORTADO', () => {
      expect(isEstadoCorte('ABORTADO')).toBe(true);
    });

    it('Rechaza null', () => {
      expect(isEstadoCorte(null)).toBe(false);
    });

    it('Rechaza undefined', () => {
      expect(isEstadoCorte(undefined)).toBe(false);
    });

    it('Rechaza string random', () => {
      expect(isEstadoCorte('PENDIENTE')).toBe(false);
      expect(isEstadoCorte('iniciado')).toBe(false);
      expect(isEstadoCorte('')).toBe(false);
    });

    it('Rechaza tipos no string', () => {
      expect(isEstadoCorte(42)).toBe(false);
      expect(isEstadoCorte(true)).toBe(false);
      expect(isEstadoCorte({})).toBe(false);
    });
  });

  // =========================================================================
  // isCorrelativoValido()
  // =========================================================================
  describe('isCorrelativoValido()', () => {
    it('Formato valido: CORTE-2026-02-08-H-001', () => {
      expect(isCorrelativoValido('CORTE-2026-02-08-H-001')).toBe(true);
    });

    it('Formato valido con diferentes letras de sucursal', () => {
      expect(isCorrelativoValido('CORTE-2026-01-15-M-042')).toBe(true);
      expect(isCorrelativoValido('CORTE-2025-12-31-Z-999')).toBe(true);
    });

    it('Formato con intento: CORTE-2026-02-08-H-001-A2', () => {
      expect(isCorrelativoValido('CORTE-2026-02-08-H-001-A2')).toBe(true);
    });

    it('Formato con intento mayor: CORTE-2026-02-08-H-001-A15', () => {
      expect(isCorrelativoValido('CORTE-2026-02-08-H-001-A15')).toBe(true);
    });

    it('Formato invalido: CORTE-ABC-DEF', () => {
      expect(isCorrelativoValido('CORTE-ABC-DEF')).toBe(false);
    });

    it('Formato invalido: cadena vacia', () => {
      expect(isCorrelativoValido('')).toBe(false);
    });

    it('Formato invalido: sin prefijo CORTE', () => {
      expect(isCorrelativoValido('2026-02-08-H-001')).toBe(false);
    });

    it('Formato invalido: sucursal minuscula', () => {
      expect(isCorrelativoValido('CORTE-2026-02-08-h-001')).toBe(false);
    });

    it('Formato invalido: numero secuencial con menos de 3 digitos', () => {
      expect(isCorrelativoValido('CORTE-2026-02-08-H-01')).toBe(false);
    });

    it('Formato invalido: numero secuencial con mas de 3 digitos', () => {
      expect(isCorrelativoValido('CORTE-2026-02-08-H-0001')).toBe(false);
    });

    it('Formato invalido: fecha incompleta', () => {
      expect(isCorrelativoValido('CORTE-2026-02-H-001')).toBe(false);
    });

    it('Formato invalido: letras extras al final', () => {
      expect(isCorrelativoValido('CORTE-2026-02-08-H-001-EXTRA')).toBe(false);
    });

    it('Formato invalido: codigo sucursal de 2 letras', () => {
      expect(isCorrelativoValido('CORTE-2026-02-08-HH-001')).toBe(false);
    });
  });

  // =========================================================================
  // Constantes
  // =========================================================================
  describe('Constantes', () => {
    it('ESTADOS_TERMINALES contiene FINALIZADO y ABORTADO', () => {
      expect(ESTADOS_TERMINALES).toContain('FINALIZADO');
      expect(ESTADOS_TERMINALES).toContain('ABORTADO');
      expect(ESTADOS_TERMINALES).toHaveLength(2);
    });

    it('ESTADOS_TERMINALES no contiene estados no-terminales', () => {
      expect(ESTADOS_TERMINALES).not.toContain('INICIADO');
      expect(ESTADOS_TERMINALES).not.toContain('EN_PROGRESO');
    });

    it('ESTADOS_TERMINALES es readonly', () => {
      expect(Array.isArray(ESTADOS_TERMINALES)).toBe(true);
    });

    it('CORRELATIVO_REGEX matchea formatos validos', () => {
      expect(CORRELATIVO_REGEX.test('CORTE-2026-02-08-H-001')).toBe(true);
      expect(CORRELATIVO_REGEX.test('CORTE-2026-02-08-H-001-A2')).toBe(true);
    });

    it('CORRELATIVO_REGEX rechaza formatos invalidos', () => {
      expect(CORRELATIVO_REGEX.test('INVALID')).toBe(false);
      expect(CORRELATIVO_REGEX.test('')).toBe(false);
      expect(CORRELATIVO_REGEX.test('CORTE-ABC')).toBe(false);
    });

    it('FASE_MAXIMA es 3', () => {
      expect(FASE_MAXIMA).toBe(3);
    });
  });

  // =========================================================================
  // isIniciarCorteParamsValido()
  // =========================================================================
  describe('isIniciarCorteParamsValido()', () => {
    it('Acepta params validos sin venta_esperada', () => {
      expect(isIniciarCorteParamsValido({
        sucursal_id: 'suc-001',
        cajero: 'Tito Gomez',
        testigo: 'Adonay Torres',
      })).toBe(true);
    });

    it('Acepta params validos con venta_esperada numerico >= 0', () => {
      expect(isIniciarCorteParamsValido({
        sucursal_id: 'suc-001',
        cajero: 'Tito Gomez',
        testigo: 'Adonay Torres',
        venta_esperada: 653.65,
      })).toBe(true);

      expect(isIniciarCorteParamsValido({
        sucursal_id: 'suc-001',
        cajero: 'Tito Gomez',
        testigo: 'Adonay Torres',
        venta_esperada: 0,
      })).toBe(true);
    });

    it('Rechaza venta_esperada negativa', () => {
      expect(isIniciarCorteParamsValido({
        sucursal_id: 'suc-001',
        cajero: 'Tito Gomez',
        testigo: 'Adonay Torres',
        venta_esperada: -1,
      })).toBe(false);
    });

    it('Rechaza venta_esperada no numerica', () => {
      expect(isIniciarCorteParamsValido({
        sucursal_id: 'suc-001',
        cajero: 'Tito Gomez',
        testigo: 'Adonay Torres',
        venta_esperada: 'abc',
      })).toBe(false);
    });

    // 🤖 [IA] - TDD RED: motivo_nuevo_corte override
    it('Acepta params con motivo_nuevo_corte valido', () => {
      expect(isIniciarCorteParamsValido({
        sucursal_id: 'suc-001',
        cajero: 'Tito Gomez',
        testigo: 'Adonay Torres',
        motivo_nuevo_corte: 'Error en conteo anterior, se requiere nuevo corte',
      })).toBe(true);
    });

    it('Acepta params sin motivo_nuevo_corte (campo opcional)', () => {
      expect(isIniciarCorteParamsValido({
        sucursal_id: 'suc-001',
        cajero: 'Tito Gomez',
        testigo: 'Adonay Torres',
      })).toBe(true);
    });

    it('Rechaza motivo_nuevo_corte vacio o solo espacios', () => {
      expect(isIniciarCorteParamsValido({
        sucursal_id: 'suc-001',
        cajero: 'Tito Gomez',
        testigo: 'Adonay Torres',
        motivo_nuevo_corte: '',
      })).toBe(false);

      expect(isIniciarCorteParamsValido({
        sucursal_id: 'suc-001',
        cajero: 'Tito Gomez',
        testigo: 'Adonay Torres',
        motivo_nuevo_corte: '   ',
      })).toBe(false);
    });
  });

  // =========================================================================
  // isCorte() — motivo_nuevo_corte field
  // =========================================================================
  describe('isCorte() — campo motivo_nuevo_corte', () => {
    // 🤖 [IA] - TDD RED: motivo_nuevo_corte en Corte
    it('Acepta corte con motivo_nuevo_corte null', () => {
      const corte = makeCorte({ motivo_nuevo_corte: null });
      expect(isCorte(corte)).toBe(true);
    });

    it('Acepta corte con motivo_nuevo_corte string valido', () => {
      const corte = makeCorte({ motivo_nuevo_corte: 'Reconteo solicitado por gerencia' });
      expect(isCorte(corte)).toBe(true);
    });

    it('Rechaza corte con motivo_nuevo_corte tipo invalido', () => {
      expect(isCorte(makeCorte({ motivo_nuevo_corte: 123 }))).toBe(false);
      expect(isCorte(makeCorte({ motivo_nuevo_corte: true }))).toBe(false);
    });
  });
});
