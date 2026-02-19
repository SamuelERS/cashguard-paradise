// 🤖 [IA] - OT12-A: Tests TDD para denomination-images.tsx
// Suite 1 y 2 deben PASAR (código TypeScript correcto)
// Suite 3 debe FALLAR (6 archivos con nombres incorrectos — confirma el bug)

import React from 'react';
import { render } from '@testing-library/react';
import { existsSync } from 'fs';
import { resolve } from 'path';
import { DENOMINATION_IMAGE_MAP, getDenominationImageElement } from '@/utils/denomination-images';
import type { CashCount } from '@/types/cash';

const ALL_KEYS: (keyof CashCount)[] = [
  'penny', 'nickel', 'dime', 'quarter', 'dollarCoin',
  'bill1', 'bill5', 'bill10', 'bill20', 'bill50', 'bill100'
];

// ── Suite 1: Integridad del mapa ────────────────────────────
describe('DENOMINATION_IMAGE_MAP — integridad', () => {
  it('tiene exactamente 11 entradas — una por cada key de CashCount', () => {
    expect(Object.keys(DENOMINATION_IMAGE_MAP)).toHaveLength(11);
    for (const key of ALL_KEYS) {
      expect(DENOMINATION_IMAGE_MAP[key]).toBeDefined();
    }
  });

  it('todas las rutas apuntan a /monedas-recortadas-dolares/ y terminan en .webp', () => {
    for (const [, path] of Object.entries(DENOMINATION_IMAGE_MAP)) {
      expect(path).toMatch(/^\/monedas-recortadas-dolares\/.+\.webp$/);
    }
  });
});

// ── Suite 2: getDenominationImageElement ────────────────────
describe('getDenominationImageElement — función generadora', () => {
  it('retorna un <img> válido con loading=lazy y decoding=async para cada denominación', () => {
    for (const key of ALL_KEYS) {
      const element = getDenominationImageElement(key, `Test ${key}`);
      expect(element).not.toBeNull();
      const { container } = render(<>{element}</>);
      const img = container.querySelector('img');
      expect(img).not.toBeNull();
      expect(img!.getAttribute('alt')).toBe(`Test ${key}`);
      expect(img!.getAttribute('loading')).toBe('lazy');
      expect(img!.getAttribute('decoding')).toBe('async');
    }
  });

  it('usa className responsive por defecto', () => {
    const element = getDenominationImageElement('penny', 'Un centavo');
    const { container } = render(<>{element}</>);
    const img = container.querySelector('img');
    expect(img!.className).toContain('clamp');
  });

  it('className default incluye object-contain para respetar aspect ratio', () => {
    const element = getDenominationImageElement('dime', 'Diez centavos');
    const { container } = render(<>{element}</>);
    const img = container.querySelector('img');
    expect(img!.className).toContain('object-contain');
  });

  it('acepta className custom cuando se provee', () => {
    const element = getDenominationImageElement('bill1', 'Un dólar', 'w-8 h-8');
    const { container } = render(<>{element}</>);
    const img = container.querySelector('img');
    expect(img!.className).toBe('w-8 h-8');
  });
});

// ── Suite 3: Existencia física de archivos ──────────────────
// ESTA SUITE DEBE FALLAR ANTES DEL FIX (confirma el bug)
describe('DENOMINATION_IMAGE_MAP — existencia física en /public/', () => {
  it('cada archivo del mapa existe físicamente en /public/', () => {
    const publicDir = resolve(__dirname, '../../../public');

    for (const [key, imagePath] of Object.entries(DENOMINATION_IMAGE_MAP)) {
      const fullPath = resolve(publicDir, imagePath.slice(1));
      expect(
        existsSync(fullPath),
        `Falta archivo para "${key}": ${fullPath}`
      ).toBe(true);
    }
  });
});
