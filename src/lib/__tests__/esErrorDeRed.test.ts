// 🤖 [IA] - CASO #3 RESILIENCIA OFFLINE — Iteración 3a: TDD RED
// Clasificador robusto de errores de red (reemplaza check estrecho TypeError('Failed to fetch'))

import { describe, it, expect } from 'vitest';
import {
  esErrorDeRed,
  esErrorInmutabilidadTerminal,
  MENSAJE_CORTE_TERMINAL_INMUTABLE,
} from '../esErrorDeRed';

// ─── Suite 1: TypeError del navegador (fetch nativo falla) ──────────────────

describe('esErrorDeRed — TypeError del navegador', () => {
  it('detecta TypeError "Failed to fetch" (Chrome/Edge)', () => {
    const err = new TypeError('Failed to fetch');
    expect(esErrorDeRed(err)).toBe(true);
  });

  it('detecta TypeError "NetworkError when attempting to fetch resource" (Firefox)', () => {
    const err = new TypeError('NetworkError when attempting to fetch resource');
    expect(esErrorDeRed(err)).toBe(true);
  });

  it('detecta TypeError "Load failed" (Safari)', () => {
    const err = new TypeError('Load failed');
    expect(esErrorDeRed(err)).toBe(true);
  });

  it('detecta TypeError "The Internet connection appears to be offline" (Safari iOS)', () => {
    const err = new TypeError('The Internet connection appears to be offline.');
    expect(esErrorDeRed(err)).toBe(true);
  });

  it('detecta TypeError "cancelled" (Safari abort)', () => {
    const err = new TypeError('cancelled');
    expect(esErrorDeRed(err)).toBe(true);
  });
});

// ─── Suite 2: DOMException (timeout / abort) ────────────────────────────────

describe('esErrorDeRed — DOMException', () => {
  it('detecta DOMException con name AbortError', () => {
    const err = new DOMException('The operation was aborted', 'AbortError');
    expect(esErrorDeRed(err)).toBe(true);
  });

  it('detecta DOMException con name TimeoutError', () => {
    const err = new DOMException('The operation timed out', 'TimeoutError');
    expect(esErrorDeRed(err)).toBe(true);
  });
});

// ─── Suite 3: Error genérico con mensaje de red (Supabase wrapping) ─────────

describe('esErrorDeRed — Error genérico con mensaje de red', () => {
  it('detecta Error con "Failed to fetch" en mensaje (Supabase wrap)', () => {
    // Supabase a veces re-wrappea: throw new Error(pgError.message)
    const err = new Error('Failed to fetch');
    expect(esErrorDeRed(err)).toBe(true);
  });

  it('detecta Error con "network" en mensaje (case-insensitive)', () => {
    const err = new Error('Network request failed');
    expect(esErrorDeRed(err)).toBe(true);
  });

  it('detecta Error con "ECONNREFUSED" en mensaje', () => {
    const err = new Error('connect ECONNREFUSED 127.0.0.1:54322');
    expect(esErrorDeRed(err)).toBe(true);
  });

  it('detecta Error con "ETIMEDOUT" en mensaje', () => {
    const err = new Error('connect ETIMEDOUT 10.0.0.1:443');
    expect(esErrorDeRed(err)).toBe(true);
  });

  it('detecta Error con "ENOTFOUND" en mensaje', () => {
    const err = new Error('getaddrinfo ENOTFOUND api.supabase.co');
    expect(esErrorDeRed(err)).toBe(true);
  });

  it('detecta Error con "socket hang up" en mensaje', () => {
    const err = new Error('socket hang up');
    expect(esErrorDeRed(err)).toBe(true);
  });

  it('detecta Error con "ERR_INTERNET_DISCONNECTED" en mensaje', () => {
    const err = new Error('net::ERR_INTERNET_DISCONNECTED');
    expect(esErrorDeRed(err)).toBe(true);
  });
});

// ─── Suite 4: Negativos — errores que NO son de red ─────────────────────────

describe('esErrorDeRed — negativos (NO son errores de red)', () => {
  it('rechaza Error de validación de datos', () => {
    const err = new Error('El campo "monto" es requerido');
    expect(esErrorDeRed(err)).toBe(false);
  });

  it('rechaza Error de autenticación', () => {
    const err = new Error('JWT expired');
    expect(esErrorDeRed(err)).toBe(false);
  });

  it('rechaza Error de constraint SQL', () => {
    const err = new Error('duplicate key value violates unique constraint');
    expect(esErrorDeRed(err)).toBe(false);
  });

  it('rechaza Error de inmutabilidad terminal (negocio, no conectividad)', () => {
    const err = new Error('Corte terminal inmutable');
    expect(esErrorDeRed(err)).toBe(false);
  });

  it('rechaza Error genérico de Supabase (no-red)', () => {
    const err = new Error('Row not found');
    expect(esErrorDeRed(err)).toBe(false);
  });

  it('rechaza null', () => {
    expect(esErrorDeRed(null)).toBe(false);
  });

  it('rechaza undefined', () => {
    expect(esErrorDeRed(undefined)).toBe(false);
  });

  it('rechaza string plano', () => {
    expect(esErrorDeRed('Failed to fetch')).toBe(false);
  });

  it('rechaza número', () => {
    expect(esErrorDeRed(500)).toBe(false);
  });

  it('rechaza objeto sin estructura Error', () => {
    expect(esErrorDeRed({ code: 'NETWORK_ERROR' })).toBe(false);
  });
});

// ─── Suite 5: Contrato de tipos ─────────────────────────────────────────────

describe('esErrorDeRed — contrato de tipos', () => {
  it('acepta parámetro unknown (type safety)', () => {
    const valor: unknown = new TypeError('Failed to fetch');
    // Debe compilar sin error de tipos y retornar boolean
    const resultado: boolean = esErrorDeRed(valor);
    expect(resultado).toBe(true);
  });

  it('retorna estrictamente boolean, nunca truthy/falsy', () => {
    const resultTrue = esErrorDeRed(new TypeError('Failed to fetch'));
    const resultFalse = esErrorDeRed(new Error('JWT expired'));
    expect(resultTrue).toStrictEqual(true);
    expect(resultFalse).toStrictEqual(false);
  });
});

describe('esErrorInmutabilidadTerminal', () => {
  it('detecta error de corte terminal inmutable', () => {
    expect(esErrorInmutabilidadTerminal(new Error('Corte terminal inmutable'))).toBe(true);
  });

  it('detecta mensaje UX de corte cerrado', () => {
    expect(esErrorInmutabilidadTerminal(new Error(MENSAJE_CORTE_TERMINAL_INMUTABLE))).toBe(true);
  });

  it('retorna false para errores de red reales', () => {
    expect(esErrorInmutabilidadTerminal(new TypeError('Failed to fetch'))).toBe(false);
  });
});
