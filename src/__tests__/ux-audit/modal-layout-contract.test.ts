import { readFileSync } from 'fs';
import { resolve } from 'path';

const DIALOG_PATH = 'src/components/ui/dialog.tsx';
const ALERT_DIALOG_PATH = 'src/components/ui/alert-dialog.tsx';
const INDEX_CSS_PATH = 'src/index.css';
const MODAL_TOKENS_PATH = 'src/styles/features/modal-layout-tokens.css';

describe('Modal layout contract (TDD RED)', () => {
  test('usa overlay uniforme menos opaco para mejor legibilidad', () => {
    const dialog = readFileSync(resolve(DIALOG_PATH), 'utf-8');
    const alertDialog = readFileSync(resolve(ALERT_DIALOG_PATH), 'utf-8');

    expect(dialog).toMatch(/bg-black\/70/);
    expect(alertDialog).toMatch(/bg-black\/70/);
  });

  test('define tokens compartidos para tamaños de modal y subtítulo', () => {
    const indexCss = readFileSync(resolve(INDEX_CSS_PATH), 'utf-8');
    const modalTokens = readFileSync(resolve(MODAL_TOKENS_PATH), 'utf-8');

    expect(indexCss).toMatch(/modal-layout-tokens\.css/);
    expect(modalTokens).toMatch(/\.modal-size-standard\s*\{/);
    expect(modalTokens).toMatch(/\.modal-size-compact\s*\{/);
    expect(modalTokens).toMatch(/\.modal-size-large\s*\{/);
    expect(modalTokens).toMatch(/\.modal-subtitle\s*\{/);
    expect(modalTokens).toMatch(/font-size:\s*clamp\(0\.75rem,\s*2\.8vw,\s*0\.875rem\)/);
  });

  test('modales operativos usan clases de tamaño compartidas', () => {
    const initialWizard = readFileSync(resolve('src/components/initial-wizard/InitialWizardModalView.tsx'), 'utf-8');
    const guided = readFileSync(resolve('src/components/cash-counting/GuidedInstructionsModal.tsx'), 'utf-8');
    const morning = readFileSync(resolve('src/components/morning-count/MorningCountWizard.tsx'), 'utf-8');
    const phase2 = readFileSync(resolve('src/components/phases/Phase2Manager.tsx'), 'utf-8');
    const confirmation = readFileSync(resolve('src/components/ui/confirmation-modal.tsx'), 'utf-8');
    const pin = readFileSync(resolve('src/components/ui/pin-modal.tsx'), 'utf-8');
    const whatsapp = readFileSync(resolve('src/components/shared/WhatsAppInstructionsModal.tsx'), 'utf-8');
    const deliveryDetails = readFileSync(resolve('src/components/deliveries/DeliveryDetailsModal.tsx'), 'utf-8');
    const deliveryManager = readFileSync(resolve('src/components/deliveries/DeliveryManager.tsx'), 'utf-8');
    const deliveryEducation = readFileSync(resolve('src/components/deliveries/DeliveryEducationModal.tsx'), 'utf-8');

    expect(initialWizard).toMatch(/modal-size-standard/);
    expect(guided).toMatch(/modal-size-standard/);
    expect(morning).toMatch(/modal-size-standard/);
    expect(phase2).toMatch(/modal-size-standard/);

    expect(confirmation).toMatch(/modal-size-compact/);
    expect(pin).toMatch(/modal-size-compact/);
    expect(whatsapp).toMatch(/modal-size-compact/);
    expect(deliveryDetails).toMatch(/modal-size-compact/);
    expect(deliveryManager).toMatch(/modal-size-compact/);

    expect(deliveryEducation).toMatch(/modal-size-large/);
  });

  test('headers de modales clave usan clase modal-subtitle', () => {
    const initialWizard = readFileSync(resolve('src/components/initial-wizard/InitialWizardModalView.tsx'), 'utf-8');
    const guided = readFileSync(resolve('src/components/cash-counting/GuidedInstructionsModal.tsx'), 'utf-8');
    const morning = readFileSync(resolve('src/components/morning-count/MorningCountWizard.tsx'), 'utf-8');
    const whatsapp = readFileSync(resolve('src/components/shared/WhatsAppInstructionsModal.tsx'), 'utf-8');

    expect(initialWizard).toMatch(/className="[^"]*modal-subtitle[^"]*"/);
    expect(guided).toMatch(/className="[^"]*modal-subtitle[^"]*"/);
    expect(morning).toMatch(/className="[^"]*modal-subtitle[^"]*"/);
    expect(whatsapp).toMatch(/className="[^"]*modal-subtitle[^"]*"/);
  });
});
