/**
 * Glass Morphism Unificado — Tests Módulo P0 (TDD RED)
 *
 * Metodología: Análisis estático de código fuente via readFileSync.
 * NO usa render() ni jsdom. Lee archivos reales y verifica patrones.
 *
 * RED esperado: TODOS los tests deben FALLAR antes de implementar código.
 * GREEN: Migrar inline styles a clase CSS .glass-morphism-panel unificada.
 *
 * Ref: docs/04_desarrollo/Caso-UX-UI-Feb-19/06_Plan_Testing_TDD.md § Módulo 02
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const MIGRATED_FILES = [
  'src/components/operation-selector/OperationSelector.tsx',
  'src/components/cash-calculation/CashResultsDisplay.tsx',
  'src/components/CashCalculation.tsx',
  'src/components/cash-counting/GuidedDenominationSection.tsx',
];

describe('Glass Morphism Unificado (Módulo 02)', () => {
  test('2.1 — Cero inline rgba(36, 36, 36, 0.4) en archivos migrados', () => {
    const INLINE_GLASS_PATTERN = /rgba\(36,\s*36,\s*36,\s*0\.4\)/;

    MIGRATED_FILES.forEach((filePath) => {
      const content = readFileSync(resolve(filePath), 'utf-8');
      expect(content).not.toMatch(INLINE_GLASS_PATTERN);
    });
  });

  test('2.2 — Constante glassCard eliminada de CashResultsDisplay', () => {
    const content = readFileSync(
      resolve('src/components/cash-calculation/CashResultsDisplay.tsx'),
      'utf-8'
    );
    expect(content).not.toMatch(/const\s+glassCard\s*=/);
  });

  test('2.3 — .glass-morphism-panel usa --glass-bg-primary (no hardcoded)', () => {
    const content = readFileSync(resolve('src/index.css'), 'utf-8');

    // Extraer bloque de .glass-morphism-panel
    const panelMatch = content.match(
      /\.glass-morphism-panel\s*\{[^}]+\}/s
    );
    expect(panelMatch).not.toBeNull();

    const panelBlock = panelMatch![0];
    // Debe usar la variable CSS, no un rgba hardcoded
    expect(panelBlock).toMatch(/var\(--glass-bg-primary/);
    // No debe contener rgba hardcoded para background
    expect(panelBlock).not.toMatch(/background-color:\s*rgba\(28,\s*28,\s*32/);
  });

  test('2.4 — .glass-morphism-panel sin !important en background/backdrop', () => {
    const content = readFileSync(resolve('src/index.css'), 'utf-8');

    const panelMatch = content.match(
      /\.glass-morphism-panel\s*\{[^}]+\}/s
    );
    expect(panelMatch).not.toBeNull();

    const panelBlock = panelMatch![0];
    // background-color no debe usar !important
    expect(panelBlock).not.toMatch(/background-color:[^;]*!important/);
    // backdrop-filter no debe usar !important
    expect(panelBlock).not.toMatch(/backdrop-filter:[^;]*!important/);
  });
});
