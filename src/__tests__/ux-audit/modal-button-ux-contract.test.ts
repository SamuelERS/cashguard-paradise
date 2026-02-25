import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Modal + button UX contract (TDD RED)', () => {
  test('botones de acción compartidos usan altura táctil profesional sin h-fluid-3xl', () => {
    const constructive = readFileSync(
      resolve('src/components/shared/ConstructiveActionButton.tsx'),
      'utf-8',
    );
    const destructive = readFileSync(
      resolve('src/components/shared/DestructiveActionButton.tsx'),
      'utf-8',
    );
    const neutral = readFileSync(resolve('src/components/ui/neutral-action-button.tsx'), 'utf-8');

    [constructive, destructive, neutral].forEach(content => {
      expect(content).toMatch(/min-h-\[44px\]/);
      expect(content).not.toMatch(/h-fluid-3xl/);
    });
  });

  test('MorningCountWizard elimina viewportScale legado para layout responsivo canónico', () => {
    const morningWizard = readFileSync(
      resolve('src/components/morning-count/MorningCountWizard.tsx'),
      'utf-8',
    );

    expect(morningWizard).not.toMatch(/viewportScale/);
    expect(morningWizard).not.toMatch(/isMobileDevice/);
    expect(morningWizard).not.toMatch(/style=\{\{\s*maxHeight:/);
    expect(morningWizard).toMatch(/modal-size-standard/);
  });

  test('modales de deliveries usan shell glass canónico y sin h-auto en CTA de footer modal', () => {
    const details = readFileSync(
      resolve('src/components/deliveries/DeliveryDetailsModal.tsx'),
      'utf-8',
    );
    const manager = readFileSync(
      resolve('src/components/deliveries/DeliveryManager.tsx'),
      'utf-8',
    );
    const education = readFileSync(
      resolve('src/components/deliveries/DeliveryEducationModal.tsx'),
      'utf-8',
    );

    expect(details).toMatch(/glass-morphism-panel modal-size-compact/);
    expect(manager).toMatch(/glass-morphism-panel modal-size-compact/);
    expect(education).toMatch(/glass-morphism-panel modal-size-large/);

    const detailsModalFooter = details.match(
      /DialogFooter className="flex flex-col sm:flex-row gap-2"[\s\S]*?<\/DialogFooter>/,
    )?.[0] ?? '';
    const detailsReasonFooter = details.match(
      /AlertDialogFooter className="flex flex-col sm:flex-row gap-2"[\s\S]*?<\/AlertDialogFooter>/,
    )?.[0] ?? '';
    const managerReasonFooter = manager.match(
      /AlertDialogFooter className="flex flex-col sm:flex-row gap-2"[\s\S]*?<\/AlertDialogFooter>/,
    )?.[0] ?? '';

    expect(detailsModalFooter).not.toMatch(/h-auto/);
    expect(detailsReasonFooter).not.toMatch(/h-auto/);
    expect(managerReasonFooter).not.toMatch(/h-auto/);
  });

  test('Pin y Confirmation no fuerzan tamaños manuales de CTA en modales', () => {
    const pin = readFileSync(resolve('src/components/ui/pin-modal.tsx'), 'utf-8');
    const confirmation = readFileSync(resolve('src/components/ui/confirmation-modal.tsx'), 'utf-8');

    expect(pin).not.toContain('className="mt-[clamp(1.5rem,6vw,2rem)] h-[clamp(2.5rem,10vw,3rem)]');
    expect(pin).not.toContain('className="flex-1 h-[clamp(2.5rem,10vw,3rem)] px-[clamp(1rem,4vw,1.5rem)]');
    expect(confirmation).not.toContain(
      'className="h-[clamp(2.5rem,10vw,3rem)] px-[clamp(1rem,4vw,1.5rem)]',
    );
  });
});
