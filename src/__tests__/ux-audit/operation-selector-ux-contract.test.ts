import { readFileSync } from 'fs';
import { resolve } from 'path';

const CSS_PATH = 'src/components/operation-selector/operation-selector.css';
const TSX_PATH = 'src/components/operation-selector/OperationSelector.tsx';

describe('OperationSelector UX contract (TDD RED)', () => {
  test('define focus-visible ring for operation cards', () => {
    const css = readFileSync(resolve(CSS_PATH), 'utf-8');
    expect(css).toMatch(/\.operation-card:focus-visible\s*\{/);
    expect(css).toMatch(/outline:\s*2px\s+solid/);
  });

  test('define high-contrast badge variants for night/supervisor', () => {
    const css = readFileSync(resolve(CSS_PATH), 'utf-8');
    expect(css).toMatch(/\.operation-badge--night\s*\{/);
    expect(css).toMatch(/\.operation-badge--supervisor\s*\{/);
    expect(css).not.toMatch(/\.operation-badge--night[\s\S]*color:\s*#0a84ff/i);
    expect(css).not.toMatch(/\.operation-badge--supervisor[\s\S]*color:\s*#8b5cf6/i);
  });

  test('hide tertiary feature on mobile using dedicated class', () => {
    const css = readFileSync(resolve(CSS_PATH), 'utf-8');
    const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');
    expect(tsx).toMatch(/operation-feature--mobile-optional/);
    expect(css).toMatch(/\.operation-feature--mobile-optional\s*\{[\s\S]*display:\s*none/);
    expect(css).toMatch(/@media\s*\(min-width:\s*640px\)[\s\S]*\.operation-feature--mobile-optional[\s\S]*display:\s*flex/);
  });
});
