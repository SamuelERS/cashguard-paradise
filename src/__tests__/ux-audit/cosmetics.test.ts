/**
 * Limpiezas Cosméticas — Tests Módulo P3 (TDD RED)
 *
 * Metodología: Análisis estático de código fuente via readFileSync.
 * NO usa render() ni jsdom. Lee archivos reales y verifica patrones.
 *
 * RED esperado: El test debe FALLAR antes de implementar código.
 * GREEN: Eliminar `style={{ opacity: 1 }}` redundante de CashCalculation.
 *
 * Nota: La verificación 5.2 (build limpio) es un paso CLI obligatorio,
 * NO un test vitest. Se ejecuta con `npm run build` post-GREEN.
 *
 * Ref: docs/04_desarrollo/Caso-UX-UI-Feb-19/06_Plan_Testing_TDD.md § Módulo 05
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Limpiezas Cosméticas (Módulo 05)', () => {
  test('5.1 — CashCalculation sin style={{ opacity: 1 }} redundante', () => {
    const content = readFileSync(
      resolve('src/components/CashCalculation.tsx'),
      'utf-8'
    );
    expect(content).not.toMatch(/style=\{\{\s*opacity:\s*1\s*\}\}/);
  });
});
