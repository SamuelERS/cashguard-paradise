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
    expect(tsx).toMatch(/operation-brand-shell/);
    expect(tsx).toMatch(/operation-brand-left/);
    expect(tsx).toMatch(/operation-brand-right/);
    expect(tsx).toMatch(/operation-brand-logo operation-brand-logo--left/);
    expect(tsx).toMatch(/operation-brand-logo operation-brand-logo--right/);

    expect(css).toMatch(/\.operation-brand-strip\s*\{[\s\S]*position:\s*relative/);
    expect(css).toMatch(/\.operation-brand-shell\s*\{[\s\S]*display:\s*flex/);
    expect(css).toMatch(/\.operation-brand-shell\s*\{[\s\S]*justify-content:\s*space-between/);
    expect(css).toMatch(/\.operation-brand-shell\s*\{[\s\S]*max-width:\s*1400px/);
    expect(css).toMatch(/\.operation-brand-shell\s*\{[\s\S]*padding:\s*clamp\(8px,\s*1\.2vw,\s*12px\)\s*clamp\(14px,\s*2\.8vw,\s*32px\)\s*0/);
    expect(css).toMatch(/\.operation-brand-right\s*\{[\s\S]*margin-left:\s*auto/);
    expect(css).toMatch(/\.operation-brand-right\s*\{[\s\S]*justify-content:\s*flex-end/);
    expect(css).toMatch(/\.operation-brand-shell\s*\{[\s\S]*min-height:\s*clamp\(48px,\s*6vw,\s*64px\)/);
    expect(css).toMatch(/\.operation-brand-logo--left\s*\{[\s\S]*max-height:\s*58px/);
    expect(css).toMatch(/\.operation-brand-logo--right\s*\{[\s\S]*max-height:\s*52px/);
    expect(css).toMatch(/@media\s*\(min-width:\s*1280px\)[\s\S]*\.operation-brand-logo--right[\s\S]*max-height:\s*50px/);
    expect(css).toMatch(/@media\s*\(min-width:\s*1536px\)[\s\S]*\.operation-brand-logo--left[\s\S]*max-height:\s*50px/);
    expect(css).toMatch(/@media\s*\(max-width:\s*430px\)[\s\S]*\.operation-brand-logo--right[\s\S]*(scale\(|max-height:\s*40px|opacity:\s*0\.[0-9]+)/);
  });

  test('operation cards use denser spacing and lower visual height for professional rhythm', () => {
    const css = readFileSync(resolve(CSS_PATH), 'utf-8');
    const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');

    expect(css).toMatch(/\.operation-card\s*\{[\s\S]*padding:\s*clamp\(14px,\s*2\.8vw,\s*18px\)/);
    expect(css).toMatch(/\.operation-card\s*\{[\s\S]*min-height:\s*clamp\(196px,\s*21vw,\s*252px\)/);
    expect(css).toMatch(/@media\s*\(max-width:\s*1024px\)[\s\S]*\.operation-card[\s\S]*min-height:\s*auto/);

    expect(tsx).not.toMatch(/className="operation-card[^"]*"\s*style=\{\{[\s\S]*padding:/);
    expect(tsx).not.toMatch(/mb-8/g);
    expect(tsx).toMatch(/mb-4/g);
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

  test('mensaje institucional se delega al footer global y no vive en selector', () => {
    const css = readFileSync(resolve(CSS_PATH), 'utf-8');
    const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');

    expect(tsx).not.toMatch(/Ver mensaje del equipo/);
    expect(tsx).not.toMatch(/Ocultar mensaje del equipo/);
    expect(tsx).not.toMatch(/showTeamMessage/);
    expect(tsx).not.toMatch(/role="note"/);
    expect(tsx).not.toMatch(/Compromiso Operativo/);
    expect(tsx).not.toMatch(/JesucristoEsDios/);

    expect(css).not.toMatch(/\.operation-team-panel/);
    expect(css).not.toMatch(/\.operation-team-heading/);
  });

  test('texto guía evita redundancias y elimina leyenda inferior duplicada', () => {
    const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');

    expect(tsx).toMatch(/Elige el proceso según el momento del día/);
    expect(tsx).not.toMatch(/Seleccione el Proceso según momento del día/);
    expect(tsx).not.toMatch(/Seleccione la operación correcta según el horario actual/);
  });

  test('distribución vertical evita saturación: sin min-h-screen anidado y con ritmo compacto', () => {
    const tsx = readFileSync(resolve(TSX_PATH), 'utf-8');

    expect(tsx).toMatch(/className="h-full relative overflow-hidden"/);
    expect(tsx).not.toMatch(/className="min-h-screen relative overflow-hidden"/);
    expect(tsx).toMatch(/className="relative z-10 container mx-auto px-4 py-2 md:py-3"/);
    expect(tsx).toMatch(/className="mb-5 pt-2 text-center md:pt-3"/);
  });
});
