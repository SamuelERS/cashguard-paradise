import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Modal CSS hygiene', () => {
  it('glass-alert-dialog-content no debe contener reglas de protocol dentro del mismo bloque', () => {
    const cssPath = path.resolve(process.cwd(), 'src/index.css');
    const css = fs.readFileSync(cssPath, 'utf-8');

    const match = css.match(/\.glass-alert-dialog-content\s*\{([\s\S]*?)\n\}/);
    expect(match).toBeTruthy();

    const block = match?.[1] ?? '';
    expect(block).toContain('padding: 24px;');
    expect(block).not.toContain('.wizard-step-container');
    expect(block).not.toContain('.protocol-rule-hidden::after');
  });

  it('scrollbar oscuro de modales no debe aplicarse por selectores globales overflow-*', () => {
    const cssPath = path.resolve(process.cwd(), 'src/styles/features/modal-dark-scrollbar.css');
    const css = fs.readFileSync(cssPath, 'utf-8');

    expect(css).not.toContain('[class*="overflow-y-auto"]');
    expect(css).not.toContain('[class*="overflow-auto"]');
  });
});

