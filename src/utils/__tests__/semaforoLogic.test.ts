// 🤖 [IA] - Orden #1 DACC Dashboard Supervisor — TDD RED
// Suite: calcularSemaforo — función pura sin dependencias externas
// Reglas de negocio del Plan Arquitectónico §4:
//   Verde:    |dif| < $3.00 Y sin críticas
//   Amarillo: $3.00 ≤ |dif| ≤ $10.00 O tiene advertencias
//   Rojo:     |dif| > $10.00 O tiene críticas (SIEMPRE predomina)

import { describe, it, expect } from 'vitest';
import { calcularSemaforo } from '../semaforoLogic';
import type { ParametrosSemaforo } from '../semaforoLogic';

// ---------------------------------------------------------------------------
// Helpers para reducir verbosidad
// ---------------------------------------------------------------------------

function params(
  diferencia: number,
  tieneCriticasVerificacion = false,
  tieneAdvertenciasVerificacion = false,
): ParametrosSemaforo {
  return { diferencia, tieneCriticasVerificacion, tieneAdvertenciasVerificacion };
}

// ---------------------------------------------------------------------------
// VERDE: |dif| < $3.00  Y  sin críticas
// ---------------------------------------------------------------------------

describe('calcularSemaforo — VERDE', () => {
  it('retorna verde cuando diferencia es $0.00 y sin anomalías', () => {
    expect(calcularSemaforo(params(0)).color).toBe('verde');
  });

  it('retorna verde cuando diferencia positiva es $1.50 y sin anomalías', () => {
    expect(calcularSemaforo(params(1.50)).color).toBe('verde');
  });

  it('retorna verde cuando diferencia negativa es -$2.99 y sin anomalías', () => {
    expect(calcularSemaforo(params(-2.99)).color).toBe('verde');
  });

  it('retorna verde en límite $2.9999 (justo bajo $3.00) sin anomalías', () => {
    expect(calcularSemaforo(params(2.9999)).color).toBe('verde');
  });
});

// ---------------------------------------------------------------------------
// AMARILLO: $3.00 ≤ |dif| ≤ $10.00  O  tiene advertencias
// ---------------------------------------------------------------------------

describe('calcularSemaforo — AMARILLO por diferencia', () => {
  it('retorna amarillo cuando diferencia es exactamente $3.00', () => {
    expect(calcularSemaforo(params(3.00)).color).toBe('amarillo');
  });

  it('retorna amarillo cuando diferencia negativa es exactamente -$3.00', () => {
    expect(calcularSemaforo(params(-3.00)).color).toBe('amarillo');
  });

  it('retorna amarillo cuando diferencia es $5.00 (medio del rango)', () => {
    expect(calcularSemaforo(params(5.00)).color).toBe('amarillo');
  });

  it('retorna amarillo cuando diferencia es exactamente $10.00 (límite superior)', () => {
    expect(calcularSemaforo(params(10.00)).color).toBe('amarillo');
  });

  it('retorna amarillo cuando diferencia negativa es exactamente -$10.00', () => {
    expect(calcularSemaforo(params(-10.00)).color).toBe('amarillo');
  });
});

describe('calcularSemaforo — AMARILLO por advertencias', () => {
  it('retorna amarillo cuando diferencia es $0.00 pero hay advertencias', () => {
    expect(calcularSemaforo(params(0, false, true)).color).toBe('amarillo');
  });

  it('retorna amarillo cuando diferencia es $1.50 y hay advertencias', () => {
    expect(calcularSemaforo(params(1.50, false, true)).color).toBe('amarillo');
  });

  it('retorna amarillo cuando diferencia es $2.99 (verde por dif) pero hay advertencias', () => {
    expect(calcularSemaforo(params(2.99, false, true)).color).toBe('amarillo');
  });
});

// ---------------------------------------------------------------------------
// ROJO: |dif| > $10.00  O  tiene críticas (SIEMPRE predomina sobre todo)
// ---------------------------------------------------------------------------

describe('calcularSemaforo — ROJO por diferencia', () => {
  it('retorna rojo cuando diferencia es $10.01 (supera $10)', () => {
    expect(calcularSemaforo(params(10.01)).color).toBe('rojo');
  });

  it('retorna rojo cuando diferencia negativa es -$10.01', () => {
    expect(calcularSemaforo(params(-10.01)).color).toBe('rojo');
  });

  it('retorna rojo cuando diferencia es $50.00 (caso extremo)', () => {
    expect(calcularSemaforo(params(50.00)).color).toBe('rojo');
  });
});

describe('calcularSemaforo — ROJO por críticas (prioridad absoluta)', () => {
  it('retorna rojo cuando hay críticas con diferencia $0.00', () => {
    expect(calcularSemaforo(params(0, true, false)).color).toBe('rojo');
  });

  it('retorna rojo cuando hay críticas con diferencia pequeña $1.50 (verde por dif)', () => {
    expect(calcularSemaforo(params(1.50, true, false)).color).toBe('rojo');
  });

  it('retorna rojo cuando hay críticas con diferencia amarilla $5.00', () => {
    expect(calcularSemaforo(params(5.00, true, false)).color).toBe('rojo');
  });

  it('retorna rojo cuando hay críticas y advertencias simultáneas (críticas dominan)', () => {
    expect(calcularSemaforo(params(2.00, true, true)).color).toBe('rojo');
  });
});

describe('calcularSemaforo — ROJO prioridad sobre AMARILLO', () => {
  it('retorna rojo cuando dif > $10 aunque no haya advertencias ni críticas', () => {
    expect(calcularSemaforo(params(10.01, false, false)).color).toBe('rojo');
  });

  it('retorna rojo cuando dif > $10 con advertencias (rojo gana)', () => {
    expect(calcularSemaforo(params(15.00, false, true)).color).toBe('rojo');
  });

  it('retorna rojo cuando dif > $10 con críticas (rojo dominante)', () => {
    expect(calcularSemaforo(params(20.00, true, true)).color).toBe('rojo');
  });
});

// ---------------------------------------------------------------------------
// Estructura del resultado — razon siempre presente y no vacía
// ---------------------------------------------------------------------------

describe('calcularSemaforo — estructura ResultadoSemaforo', () => {
  it('resultado incluye campo razon no vacío para color verde', () => {
    const resultado = calcularSemaforo(params(0));
    expect(resultado.razon).toBeTruthy();
    expect(typeof resultado.razon).toBe('string');
  });

  it('resultado incluye campo razon no vacío para color amarillo', () => {
    const resultado = calcularSemaforo(params(5.00));
    expect(resultado.razon).toBeTruthy();
  });

  it('resultado incluye campo razon no vacío para color rojo', () => {
    const resultado = calcularSemaforo(params(0, true));
    expect(resultado.razon).toBeTruthy();
  });

  it('resultado indica diferencia como razón cuando es el factor decisivo', () => {
    const resultado = calcularSemaforo(params(15.00));
    expect(resultado.razon).toMatch(/diferencia|dif/i);
  });

  it('resultado indica críticas como razón cuando es el factor decisivo', () => {
    const resultado = calcularSemaforo(params(1.00, true));
    expect(resultado.razon).toMatch(/crít/i);
  });
});
