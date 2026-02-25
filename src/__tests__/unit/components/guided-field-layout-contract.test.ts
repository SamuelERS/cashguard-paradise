import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

const SOURCE_PATH = resolve(process.cwd(), 'src/components/cash-counting/GuidedFieldView.tsx');
const source = readFileSync(SOURCE_PATH, 'utf-8');

describe('GuidedFieldView layout contract', () => {
  it('el layout no usa padding bottom inflado legacy (pb-24)', () => {
    expect(source).not.toMatch(/pb-24/);
  });

  it('el footer de navegación no está absoluto (debe fluir con el contenido)', () => {
    expect(source).not.toMatch(/absolute\s+bottom-0\s+left-0\s+right-0/);
  });
});
