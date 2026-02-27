// 🤖 [IA] - v1.0.1 — Contrato estático AppFooter (DACC CORRECIÓN #1/#3)
// Test estático — sin render ni jsdom. Inspecciona código fuente con readFileSync + regex.
// Patrón: DACC v3.5.0 P2 — "tests estáticos como contrato de calidad"
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

const src = readFileSync(
  resolve(__dirname, '../AppFooter.tsx'),
  'utf8'
);

describe('AppFooter — contrato UX/UI P2 (anti-patrón viewportScale)', () => {
  it('no declara ni usa viewportScale', () => {
    expect(src).not.toMatch(/viewportScale/);
  });

  it('no usa Math.min(window.innerWidth para cálculo dinámico)', () => {
    expect(src).not.toMatch(/Math\.min\(window\.innerWidth/);
  });

  it('no usa template literals con padding calculado dinámicamente en px', () => {
    // Prohibido: `${X * viewportScale}px` — debe usarse clamp() puro
    expect(src).not.toMatch(/\$\{[^}]*viewportScale[^}]*\}px/);
  });

  it('usa export named (no default export)', () => {
    expect(src).toMatch(/export function AppFooter/);
    expect(src).not.toMatch(/export default/);
  });
});
