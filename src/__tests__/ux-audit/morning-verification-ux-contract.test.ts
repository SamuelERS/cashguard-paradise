import { readFileSync } from 'fs';
import { resolve } from 'path';

const VIEW_PATH = 'src/components/morning-count/MorningVerificationView.tsx';

describe('MorningVerificationView UX contract (TDD RED)', () => {
  test('reduce deuda visual: sin glassCard inline y máximo 4 bloques style={{}}', () => {
    const content = readFileSync(resolve(VIEW_PATH), 'utf-8');
    const styleBlocks = content.match(/style=\{\{/g) ?? [];

    expect(content).not.toMatch(/const\s+glassCard\s*:/);
    expect(styleBlocks.length).toBeLessThanOrEqual(4);
  });

  test('usa shell visual canónico en cards principales', () => {
    const content = readFileSync(resolve(VIEW_PATH), 'utf-8');
    const glassCards = content.match(/glass-morphism-panel/g) ?? [];

    expect(glassCards.length).toBeGreaterThanOrEqual(4);
    expect(content).toMatch(/Resultados Bloqueados/);
    expect(content).toMatch(/Detalle de Denominaciones/);
  });

  test('usa botones compartidos y reduce uso excesivo de clamp() en layout', () => {
    const content = readFileSync(resolve(VIEW_PATH), 'utf-8');
    const clampUsages = content.match(/clamp\(/g) ?? [];

    expect(content).toMatch(/ConstructiveActionButton/);
    expect(content).toMatch(/NeutralActionButton/);
    expect(clampUsages.length).toBeLessThanOrEqual(10);
  });
});
