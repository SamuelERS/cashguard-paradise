import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

function readCss(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8');
}

describe('CSS governance contract', () => {
  it('cash-counter-desktop-alignment: remove brittle selectors and enforce intermediate !important budget', () => {
    const css = readCss('src/styles/features/cash-counter-desktop-alignment.css');
    const importantCount = (css.match(/!important/g) ?? []).length;

    expect(importantCount).toBeLessThanOrEqual(24);
    expect(css).not.toMatch(/\[class\*=/);
    expect(css).not.toMatch(/>\s*div:first-child/);
    expect(css).not.toMatch(/\.cash-counter-container\s+\.flex\.gap-2/);
  });

  it('glass-morphism-coherence: forbid risky global glass selectors', () => {
    const css = readCss('src/styles/features/glass-morphism-coherence.css');

    expect(css).not.toMatch(/\[class\*="glass-/);
    expect(css).not.toMatch(/(?:guided-progress-container|phase1-navigation|cash-counter-container)\s+\*/);
  });

  it('cashcounter components expose stable styling scope classes', () => {
    const cashCounterTsx = readCss('src/components/CashCounter.tsx');
    const guidedFieldViewTsx = readCss('src/components/cash-counting/GuidedFieldView.tsx');
    const guidedProgressTsx = readCss('src/components/ui/GuidedProgressIndicator.tsx');

    expect(cashCounterTsx).toMatch(/cashcounter-shell/);
    expect(guidedFieldViewTsx).toMatch(/cashcounter-field-row/);
    expect(guidedProgressTsx).toMatch(/cashcounter-status-banner-slot/);
  });
});
