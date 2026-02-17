import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LEGACY_CATALOG_IMPORT = "@/data/paradise";

const guardedFiles = [
  'src/components/CashCalculation.tsx',
  'src/hooks/useCashCounterOrchestrator.ts',
  'src/lib/morning-verification/mvSelectors.ts',
  'src/lib/initial-wizard/wizardSelectors.ts',
  'src/components/initial-wizard/steps/Step2StoreSelection.tsx',
  'src/components/initial-wizard/steps/Step5SicarInput.tsx',
  'src/components/morning-count/MorningCountWizard.tsx',
] as const;

describe('catalog source guard', () => {
  it('does not use legacy paradise catalog in wizard/report flow files', () => {
    const offenders = guardedFiles.filter((filePath) => {
      const fullPath = resolve(process.cwd(), filePath);
      const content = readFileSync(fullPath, 'utf8');
      return content.includes(LEGACY_CATALOG_IMPORT);
    });

    expect(offenders).toEqual([]);
  });
});
