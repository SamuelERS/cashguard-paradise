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

    const nightBlock = css.match(/\.operation-badge--night\s*\{[\s\S]*?\}/)?.[0] ?? '';
    const supervisorBlock = css.match(/\.operation-badge--supervisor\s*\{[\s\S]*?\}/)?.[0] ?? '';

    expect(nightBlock).not.toMatch(/color:\s*#0a84ff/i);
    expect(supervisorBlock).not.toMatch(/color:\s*#8b5cf6/i);
  });

  test('hide tertiary feature on mobile using dedicated class', () => {
    const css = readFileSync(resolve(CSS_PATH), 'utf-8');
    const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');
    expect(tsx).toMatch(/operation-feature--mobile-optional/);
    expect(tsx).toMatch(/operation-feature operation-feature--mobile-optional/);
    expect(tsx).not.toMatch(/className="flex items-center gap-2 operation-feature--mobile-optional"/);
    expect(css).toMatch(/\.operation-feature\s*\{[\s\S]*display:\s*flex/);
    expect(css).toMatch(/\.operation-feature--mobile-optional\s*\{[\s\S]*display:\s*none/);
    expect(css).toMatch(/@media\s*\(min-width:\s*640px\)[\s\S]*\.operation-feature--mobile-optional[\s\S]*display:\s*flex/);
  });

  test('brand logos use responsive classes with bounded size and small-screen saturation control', () => {
    const css = readFileSync(resolve(CSS_PATH), 'utf-8');
    const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');

    expect(tsx).toMatch(/operation-brand-strip/);
    expect(tsx).toMatch(/operation-brand-logo operation-brand-logo--left/);
    expect(tsx).toMatch(/operation-brand-logo operation-brand-logo--right/);

    expect(css).toMatch(/\.operation-brand-logo\s*\{[\s\S]*height:\s*clamp\(32px,\s*7vw,\s*64px\)/);
    expect(css).toMatch(/\.operation-brand-logo--right\s*\{[\s\S]*max-height:\s*60px/);
    expect(css).toMatch(/@media\s*\(max-width:\s*430px\)[\s\S]*\.operation-brand-logo--right[\s\S]*(scale\(|max-height:\s*44px|opacity:\s*0\.[0-9]+)/);
  });

  test('operation cards use bounded padding and minimum height for professional rhythm', () => {
    const css = readFileSync(resolve(CSS_PATH), 'utf-8');
    const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');

    expect(css).toMatch(/\.operation-card\s*\{[\s\S]*padding:\s*clamp\(18px,\s*4\.5vw,\s*28px\)/);
    expect(css).toMatch(/\.operation-card\s*\{[\s\S]*min-height:\s*clamp\(250px,\s*32vw,\s*340px\)/);
    expect(css).toMatch(/@media\s*\(max-width:\s*640px\)[\s\S]*\.operation-card[\s\S]*min-height:\s*auto/);

    expect(tsx).not.toMatch(/className="operation-card[^"]*"\s*style=\{\{[\s\S]*padding:/);
  });

  test('cards expose variant classes and semantic hover/focus styles', () => {
    const css = readFileSync(resolve(CSS_PATH), 'utf-8');
    const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');

    expect(tsx).toMatch(/operation-card--morning/);
    expect(tsx).toMatch(/operation-card--night/);
    expect(tsx).toMatch(/operation-card--delivery/);
    expect(tsx).toMatch(/operation-card--supervisor/);

    expect(css).toMatch(/\.operation-card:hover\s*\{[\s\S]*translateY\(-2px\)/);
    expect(css).toMatch(/\.operation-card--morning:hover[\s\S]*border-color:/);
    expect(css).toMatch(/\.operation-card--night:hover[\s\S]*border-color:/);
    expect(css).toMatch(/\.operation-card:focus-visible[\s\S]*box-shadow:/);
    expect(css).toMatch(/@media\s*\(hover:\s*none\)[\s\S]*\.operation-card:hover[\s\S]*transform:\s*none/);
  });
});
