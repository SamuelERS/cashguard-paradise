// 🤖 [IA] - CASO #3 RESILIENCIA OFFLINE (Iteración 2) — Test estático CashCounter
// TDD RED: Verifica que CashCounter usa useConnectionStatus en vez de hardcode.
// Patrón readFileSync + regex — sin render, sin jsdom, máxima velocidad.

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Lectura del código fuente
// ---------------------------------------------------------------------------

const COMPONENT_PATH = resolve(__dirname, '../CashCounter.tsx');
const source = readFileSync(COMPONENT_PATH, 'utf-8');

// ---------------------------------------------------------------------------
// Suite: CashCounter — conexión real (no hardcoded)
// ---------------------------------------------------------------------------

describe('CashCounter — estadoConexion real (no hardcoded)', () => {
  it('NO contiene estadoConexion="online" hardcodeado', () => {
    // CashCounter.tsx línea 108 tenía: estadoConexion="online"
    // Después del fix, debe usar el valor del hook, no un string literal.
    expect(source).not.toMatch(/estadoConexion\s*=\s*["']online["']/);
  });

  it('importa useConnectionStatus desde hooks', () => {
    // El componente debe importar el hook para obtener el estado real.
    expect(source).toMatch(/import\s+.*useConnectionStatus.*from/);
  });

  it('NO contiene pendientes={0} hardcodeado en CorteStatusBanner', () => {
    // pendientes debe venir de la cola offline real, no ser 0 fijo.
    expect(source).not.toMatch(/pendientes\s*=\s*\{0\}/);
  });
});
