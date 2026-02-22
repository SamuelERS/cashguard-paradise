/**
 * Estandarización de Botones + Dead Imports — Tests Módulo P1 (TDD RED)
 *
 * Metodología: Análisis estático de código fuente via readFileSync.
 * NO usa render() ni jsdom. Lee archivos reales y verifica patrones.
 *
 * Tests 3.1–3.3: RED esperado — FALLAN antes de implementar código.
 * Tests 3.4–3.5: Regresión — PASAN actualmente (guardianes de no-regresión).
 *
 * Ref: docs/04_desarrollo/Caso-UX-UI-Feb-19/06_Plan_Testing_TDD.md § Módulo 03
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

const STEP5_PATH = 'src/components/initial-wizard/steps/Step5SicarInput.tsx';
const PHASE2_VERIFICATION_PATH = 'src/components/phases/Phase2VerificationSection.tsx';

describe('Estandarización Botones (Módulo 03)', () => {
  test('3.1 — Cero <button> raw en Step5SicarInput', () => {
    const content = readFileSync(resolve(STEP5_PATH), 'utf-8');
    // No debe haber elementos <button> directos (solo componentes estandarizados)
    expect(content).not.toMatch(/<button[\s>]/);
    expect(content).not.toMatch(/<\/button>/);
  });

  test('3.2 — Step5SicarInput importa ConstructiveActionButton y DestructiveActionButton', () => {
    const content = readFileSync(resolve(STEP5_PATH), 'utf-8');
    expect(content).toMatch(/import.*ConstructiveActionButton/);
    expect(content).toMatch(/import.*DestructiveActionButton/);
  });

  test('3.3 — Phase2VerificationSection sin import de Button genérico', () => {
    const content = readFileSync(resolve(PHASE2_VERIFICATION_PATH), 'utf-8');
    // No debe importar Button genérico de ui/button
    expect(content).not.toMatch(
      /import\s*\{[^}]*Button[^}]*\}\s*from\s*['"]@\/components\/ui\/button['"]/
    );
  });

  /**
   * Test de REGRESIÓN (guardián) — pasa actualmente.
   * Asegura que la migración de <button> a componentes estandarizados
   * NO pierde los aria-labels de accesibilidad.
   */
  test('3.4 — Step5SicarInput preserva aria-labels de sesión activa', () => {
    const content = readFileSync(resolve(STEP5_PATH), 'utf-8');
    expect(content).toMatch(/aria-label.*[Rr]eanudar/);
    expect(content).toMatch(/aria-label.*[Aa]bortar/);
  });

  /**
   * Test de REGRESIÓN (guardián) — pasa actualmente.
   * Asegura que la migración de <button> a componentes estandarizados
   * NO pierde la funcionalidad onClick de los handlers.
   */
  test('3.5 — Step5SicarInput preserva handlers onResumeSession y onAbortSession', () => {
    const content = readFileSync(resolve(STEP5_PATH), 'utf-8');
    // Los handlers originales deben seguir conectados a los botones migrados
    expect(content).toMatch(/onResumeSession/);
    expect(content).toMatch(/onAbortSession/);
    // Deben estar en atributos onClick (no solo como props del componente)
    expect(content).toMatch(/onClick=\{.*onResumeSession/s);
    expect(content).toMatch(/onClick=\{.*onAbortSession/s);
  });
});
