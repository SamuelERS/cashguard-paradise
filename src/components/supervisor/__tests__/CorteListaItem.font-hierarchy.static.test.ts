// 🤖 [IA] - Test TDD estático: Jerarquía tipográfica uniforme CorteListaItem
// Valida que los tamaños de fuente sigan escala compacta sin inflación md:/2xl:.
// Patrón readFileSync + regex — sin render, sin jsdom, máxima velocidad.

import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Lectura del código fuente
// ---------------------------------------------------------------------------

const COMPONENT_PATH = resolve(__dirname, '../CorteListaItem.tsx');
const source = readFileSync(COMPONENT_PATH, 'utf-8');

// ---------------------------------------------------------------------------
// Helper: encontrar línea className asociada a contenido JSX (multiline-safe)
// ---------------------------------------------------------------------------

/**
 * En JSX multiline el className está en la línea de apertura del tag
 * y el contenido ({variable}) en la línea siguiente.
 * Este helper busca hacia arriba desde la línea del contenido.
 */
function findClassNameFor(contentMarker: string): string {
  const lines = source.split('\n');
  // Buscar expresión JSX pura (excluir template literals y declaraciones const)
  const idx = lines.findIndex(l =>
    l.includes(contentMarker) && !l.includes('`') && !l.includes('const ')
  );
  if (idx === -1) return '';
  if (lines[idx].includes('className')) return lines[idx];
  for (let i = idx - 1; i >= Math.max(0, idx - 3); i--) {
    if (lines[i].includes('className')) return lines[i];
  }
  return '';
}

// ---------------------------------------------------------------------------
// Suite 1: Hora — tamaño compacto sin inflación responsive
// ---------------------------------------------------------------------------

describe('CorteListaItem — hora (rail temporal)', () => {
  it('usa text-sm como tamaño base para la hora', () => {
    expect(source).toMatch(/tabular-nums">\{hora\}/);
    const horaLine = source.split('\n').find(l => l.includes('{hora}') && l.includes('tabular-nums'));
    expect(horaLine).toBeDefined();
    expect(horaLine).toContain('text-sm');
  });

  it('NO usa md:text-base para evitar inflación en tablet/desktop', () => {
    const horaLine = source.split('\n').find(l => l.includes('{hora}') && l.includes('tabular-nums'));
    expect(horaLine).toBeDefined();
    expect(horaLine).not.toContain('md:text-base');
  });
});

// ---------------------------------------------------------------------------
// Suite 2: Sucursal — prominente pero proporcional
// ---------------------------------------------------------------------------

describe('CorteListaItem — nombre sucursal', () => {
  it('usa text-sm como tamaño base (no text-base)', () => {
    const classLine = findClassNameFor('{nombreSucursal}');
    expect(classLine).toBeTruthy();
    expect(classLine).toContain('text-sm');
  });

  it('escala a md:text-base como máximo (no md:text-lg)', () => {
    const classLine = findClassNameFor('{nombreSucursal}');
    expect(classLine).toBeTruthy();
    expect(classLine).toContain('md:text-base');
    expect(classLine).not.toContain('md:text-lg');
  });
});

// ---------------------------------------------------------------------------
// Suite 3: Cajero — texto secundario más pequeño
// ---------------------------------------------------------------------------

describe('CorteListaItem — nombre cajero', () => {
  it('usa text-xs como tamaño base (secundario)', () => {
    const classLine = findClassNameFor('{corte.cajero}');
    expect(classLine).toBeTruthy();
    expect(classLine).toContain('text-xs');
  });

  it('escala a md:text-sm como máximo', () => {
    const classLine = findClassNameFor('{corte.cajero}');
    expect(classLine).toBeTruthy();
    expect(classLine).toContain('md:text-sm');
    expect(classLine).not.toContain('md:text-base');
  });
});

// ---------------------------------------------------------------------------
// Suite 4: Total contado — prominente pero controlado
// ---------------------------------------------------------------------------

describe('CorteListaItem — total contado (métricas)', () => {
  it('usa text-lg como tamaño base (no text-xl)', () => {
    const classLine = findClassNameFor('formatCurrency(totalContado)');
    expect(classLine).toBeTruthy();
    expect(classLine).toContain('text-lg');
  });

  it('escala a md:text-xl como máximo (no md:text-[1.55rem])', () => {
    const classLine = findClassNameFor('formatCurrency(totalContado)');
    expect(classLine).toBeTruthy();
    expect(classLine).toContain('md:text-xl');
    expect(classLine).not.toContain('md:text-[1.55rem]');
  });
});

// ---------------------------------------------------------------------------
// Suite 5: Diferencia — un escalón menor que total
// ---------------------------------------------------------------------------

describe('CorteListaItem — diferencia (métricas)', () => {
  it('usa text-base como tamaño base (un paso bajo total)', () => {
    const classLine = findClassNameFor('{diferenciaTexto}');
    expect(classLine).toBeTruthy();
    expect(classLine).toContain('text-base');
  });

  it('escala a md:text-lg como máximo (no md:text-xl)', () => {
    const classLine = findClassNameFor('{diferenciaTexto}');
    expect(classLine).toBeTruthy();
    expect(classLine).toContain('md:text-lg');
    expect(classLine).not.toContain('md:text-xl');
  });
});

// ---------------------------------------------------------------------------
// Suite 6: Sin breakpoints 2xl: residuales (limpieza inflación)
// ---------------------------------------------------------------------------

describe('CorteListaItem — sin breakpoints 2xl: en tipografía principal', () => {
  it('NO tiene 2xl:text-sm en hora ni cajero (breakpoint innecesario)', () => {
    const horaLine = source.split('\n').find(l => l.includes('{hora}') && l.includes('tabular-nums'));
    const cajeroClassLine = findClassNameFor('{corte.cajero}');
    expect(horaLine).not.toContain('2xl:text-sm');
    expect(cajeroClassLine).not.toContain('2xl:text-sm');
  });

  it('NO tiene 2xl:text-base en sucursal (breakpoint innecesario)', () => {
    const sucursalClassLine = findClassNameFor('{nombreSucursal}');
    expect(sucursalClassLine).not.toContain('2xl:text-base');
  });

  it('NO tiene 2xl:text-[1.35rem] ni 2xl:text-lg en métricas', () => {
    const totalClassLine = findClassNameFor('formatCurrency(totalContado)');
    const diffClassLine = findClassNameFor('{diferenciaTexto}');
    expect(totalClassLine).not.toContain('2xl:text-[1.35rem]');
    expect(diffClassLine).not.toContain('2xl:text-lg');
  });
});
