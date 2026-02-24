// [IA] - R3-B3 TDD RED: Verificar que Step5SicarInput muestra ícono Cloud verde en panel sesión activa
// Módulo M2 del plan R3 — el ícono Cloud text-green-400 DEBE ser agregado al panel.
// Este test DEBE FALLAR con el código actual (eso es correcto en fase RED).
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step5SicarInput } from '@/components/initial-wizard/steps/Step5SicarInput';

// ── Props mínimas válidas ─────────────────────────────────────────────────────

const ACTIVE_STORE_ID = 'los-heroes';

const baseProps = {
  wizardData: {
    rulesAccepted: false,
    selectedStore: ACTIVE_STORE_ID,
    selectedCashier: '',
    selectedWitness: '',
    expectedSales: '',
    dailyExpenses: [],
  },
  updateWizardData: vi.fn(),
  validateInput: vi.fn().mockReturnValue({ isValid: true, cleanValue: '' }),
  getPattern: vi.fn().mockReturnValue(''),
  getInputMode: vi.fn().mockReturnValue('decimal' as const),
  handleNext: vi.fn(),
  canGoNext: false,
  currentStep: 5,
  totalSteps: 6,
  availableStores: [],
  availableEmployees: [],
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('R3-B3: Step5SicarInput — ícono de conexión en panel sesión activa', () => {
  it('muestra ícono de conexión verde junto al título del panel de sesión activa', () => {
    render(
      <Step5SicarInput
        {...baseProps}
        hasActiveSession={true}
        activeSessionSucursalId={ACTIVE_STORE_ID}
        onResumeSession={vi.fn()}
        onAbortSession={vi.fn()}
      />
    );

    // El panel debe existir (ya existe actualmente)
    expect(screen.getByText('Sesión en Progreso')).toBeInTheDocument();

    // FALLA actualmente: no hay ningún SVG con clase text-green-400 en el panel
    // El ícono Cloud de lucide-react DEBE agregarse junto al título h4
    const greenIcon = document.querySelector('svg.text-green-400');
    expect(greenIcon).toBeInTheDocument();
  });
});
