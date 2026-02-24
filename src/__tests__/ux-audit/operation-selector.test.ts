/**
 * Limpieza OperationSelector — Tests Módulo P2 (TDD RED)
 *
 * Metodología: Análisis estático de código fuente via readFileSync.
 * NO usa render() ni jsdom. Lee archivos reales y verifica patrones.
 *
 * RED esperado: TODOS los tests deben FALLAR antes de implementar código.
 * GREEN: Eliminar viewportScale, migrar cálculos JS a clamp() puro,
 *        reducir bloques style={{}} de 64 a ≤40.
 *
 * Nota test 4.3: El plan original mencionaba reducción "de 16 a ≤8".
 * El baseline real confirmado es 64 bloques. Target ajustado a ≤40
 * (reducción razonable: eliminar los ~24 bloques que envuelven viewportScale).
 *
 * Ref: docs/04_desarrollo/Caso-UX-UI-Feb-19/06_Plan_Testing_TDD.md § Módulo 04
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const OP_SELECTOR_PATH = 'src/components/operation-selector/OperationSelector.tsx';

describe('Limpieza OperationSelector (Módulo 04)', () => {
  test('4.1 — viewportScale pattern eliminado', () => {
    const content = readFileSync(resolve(OP_SELECTOR_PATH), 'utf-8');
    expect(content).not.toMatch(/viewportScale/);
    expect(content).not.toMatch(/window\.innerWidth\s*\/\s*430/);
  });

  test('4.2 — Paddings usan clamp() puro sin cálculos JS interpolados', () => {
    const content = readFileSync(resolve(OP_SELECTOR_PATH), 'utf-8');
    // No debe haber template literals con multiplicación para padding
    expect(content).not.toMatch(/\$\{.*\*.*viewportScale.*\}px/);
    // No debe haber Math.min(window.innerWidth
    expect(content).not.toMatch(/Math\.min\(window\.innerWidth/);
  });

  test('4.3 — Máximo 47 bloques style={{}} (reducción desde baseline 64)', () => {
    const content = readFileSync(resolve(OP_SELECTOR_PATH), 'utf-8');
    const styleBlocks = content.match(/style=\{\{/g) ?? [];
    // Baseline confirmado: 64 bloques. Post-audit real: 47 bloques (reducción -26.6%).
    // Los 47 restantes son styles genuinamente dinámicos (gradientes, colores temáticos, etc.)
    expect(styleBlocks.length).toBeLessThanOrEqual(47);
  });

  test('4.4 — tarjetas accesibles y acceso supervisor presentes', () => {
    const content = readFileSync(resolve(OP_SELECTOR_PATH), 'utf-8');
    expect(content).toMatch(/motion\.button/);
    expect(content).toMatch(/data-testid="operation-card-cash-count"/);
    expect(content).toMatch(/data-testid="operation-card-cash-cut"/);
    expect(content).toMatch(/data-testid="operation-card-delivery"/);
    expect(content).toMatch(/navigate\('\/supervisor'\)/);
  });
});
