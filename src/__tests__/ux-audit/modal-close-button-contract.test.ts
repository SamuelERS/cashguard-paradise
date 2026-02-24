import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Modal close button microinteraction contract', () => {
  const files = [
    'src/components/initial-wizard/InitialWizardModalView.tsx',
    'src/components/morning-count/MorningCountWizard.tsx',
    'src/components/cash-counting/GuidedInstructionsModal.tsx',
    'src/components/phases/Phase2Manager.tsx',
  ] as const;

  it('modales críticos usan clase modal-close-button en botón X', () => {
    files.forEach((file) => {
      const content = fs.readFileSync(path.resolve(process.cwd(), file), 'utf-8');
      expect(content).toContain('modal-close-button');
    });
  });

  it('index.css importa estilos de modal-close-button', () => {
    const css = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf-8');
    expect(css).toContain('@import "./styles/features/modal-close-button.css";');
  });
});

