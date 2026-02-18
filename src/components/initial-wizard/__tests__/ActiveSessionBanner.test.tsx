// [IA] - CASO-SANN: TDD RED phase — tests para banner de sesión activa en wizard
// Todos estos tests DEBEN fallar hasta que se implemente el banner (Orden #2)
// [IA] - CASO-SANN-R1: Actualizado — banner solo visible desde Paso 2 (currentStep >= 2)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { InitialWizardControllerReturn } from '@/types/initialWizard';

// ── Mock controller hook (mismo patrón que InitialWizardModal.test.tsx) ──
const mockCtrl: InitialWizardControllerReturn = {
  currentStep: 1,
  totalSteps: 6,
  wizardData: {
    selectedStore: '',
    selectedCashier: '',
    selectedWitness: '',
    expectedSales: '',
    dailyExpenses: [],
  },
  canGoNext: false,
  canGoPrevious: false,
  isCompleted: false,
  updateWizardData: vi.fn(),
  availableStores: [
    { id: 'los-heroes', name: 'Los Héroes', address: '', phone: '', schedule: '' },
    { id: 'plaza-merliot', name: 'Plaza Merliot', address: '', phone: '', schedule: '' },
  ],
  availableEmployees: [],
  rulesFlowState: { currentRuleIndex: 0 },
  isFlowCompleted: vi.fn(() => false),
  getRuleState: vi.fn(() => ({ acknowledged: false, isActive: false })),
  canInteractWithRule: vi.fn(() => false),
  showBackConfirmation: false,
  setShowBackConfirmation: vi.fn(),
  showCancelConfirmation: false,
  setShowCancelConfirmation: vi.fn(),
  handleRuleAcknowledge: vi.fn(),
  handleNext: vi.fn(),
  handlePrevious: vi.fn(),
  handleComplete: vi.fn(),
  handleCancelRequest: vi.fn(),
  handleConfirmedClose: vi.fn(),
  handleCancelClose: vi.fn(),
  getNavigationState: vi.fn(() => ({
    currentStep: 1,
    totalSteps: 6,
    data: {
      selectedStore: '',
      selectedCashier: '',
      selectedWitness: '',
      expectedSales: '',
      dailyExpenses: [],
    },
    canGoNext: false,
    canGoPrevious: false,
    isCompleted: false,
  })),
  progressValue: 0,
  validateInput: vi.fn(() => ({ isValid: true, cleanValue: '' })),
  getPattern: vi.fn(() => ''),
  getInputMode: vi.fn(() => 'numeric' as const),
  goPrevious: vi.fn(() => true),
};

vi.mock('@/hooks/initial-wizard/useInitialWizardController', () => ({
  useInitialWizardController: () => mockCtrl,
}));

// ── Mock child step components (isolate View) ──
vi.mock('../steps/Step1ProtocolRules', () => ({
  Step1ProtocolRules: () => <div data-testid="step-1">Step1ProtocolRules</div>,
}));
vi.mock('../steps/Step2StoreSelection', () => ({
  Step2StoreSelection: () => <div data-testid="step-2">Step2StoreSelection</div>,
}));
vi.mock('../steps/Step3CashierSelection', () => ({
  Step3CashierSelection: () => <div data-testid="step-3">Step3CashierSelection</div>,
}));
vi.mock('../steps/Step4WitnessSelection', () => ({
  Step4WitnessSelection: () => <div data-testid="step-4">Step4WitnessSelection</div>,
}));
vi.mock('../steps/Step5SicarInput', () => ({
  Step5SicarInput: () => <div data-testid="step-5">Step5SicarInput</div>,
}));
vi.mock('../steps/Step6Expenses', () => ({
  Step6Expenses: () => <div data-testid="step-6">Step6Expenses</div>,
}));

import InitialWizardModalView from '../InitialWizardModalView';

// ── Helpers ──
const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  onComplete: vi.fn(),
};

function resetMockCtrl(overrides: Partial<InitialWizardControllerReturn> = {}) {
  Object.assign(mockCtrl, {
    currentStep: 1,
    totalSteps: 6,
    canGoNext: false,
    canGoPrevious: false,
    isCompleted: false,
    showBackConfirmation: false,
    showCancelConfirmation: false,
    availableStores: [
      { id: 'los-heroes', name: 'Los Héroes', address: '', phone: '', schedule: '' },
      { id: 'plaza-merliot', name: 'Plaza Merliot', address: '', phone: '', schedule: '' },
    ],
    isFlowCompleted: vi.fn(() => false),
    getNavigationState: vi.fn(() => ({
      currentStep: 1,
      totalSteps: 6,
      data: mockCtrl.wizardData,
      canGoNext: false,
      canGoPrevious: false,
      isCompleted: false,
    })),
    ...overrides,
  });
}

// ── Tests: Banner de Sesión Activa ──

describe('CASO-SANN: Active Session Banner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockCtrl();
  });

  // [IA] - CASO-SANN CA-02: Banner NO se renderiza sin sesión activa
  it('does NOT render active session banner when hasActiveSession is false', () => {
    render(
      <InitialWizardModalView
        {...baseProps}
        hasActiveSession={false}
        initialSucursalId="los-heroes"
      />
    );

    expect(screen.queryByText(/sesión activa/i)).not.toBeInTheDocument();
  });

  // [IA] - CASO-SANN CA-01: Banner SÍ se renderiza con sesión activa + sucursalId válido (Paso 2)
  it('renders active session banner when hasActiveSession is true and initialSucursalId is valid', () => {
    // [IA] - CASO-SANN-R1: Paso 2 — contexto de sucursal disponible
    resetMockCtrl({ currentStep: 2 });
    render(
      <InitialWizardModalView
        {...baseProps}
        hasActiveSession={true}
        initialSucursalId="los-heroes"
      />
    );

    expect(screen.getByText(/sesión activa/i)).toBeInTheDocument();
  });

  // [IA] - CASO-SANN CU-01: Banner muestra texto descriptivo claro (Paso 2)
  it('banner displays "Se detectó una sesión activa" text', () => {
    // [IA] - CASO-SANN-R1: Paso 2 — banner visible con contexto completo
    resetMockCtrl({ currentStep: 2 });
    render(
      <InitialWizardModalView
        {...baseProps}
        hasActiveSession={true}
        initialSucursalId="los-heroes"
      />
    );

    expect(screen.getByText(/Se detectó una sesión activa/i)).toBeInTheDocument();
  });

  // [IA] - CASO-SANN CA-01: Banner muestra nombre de sucursal resuelto (Paso 2)
  it('banner displays the resolved sucursal name', () => {
    // [IA] - CASO-SANN-R1: Paso 2 — nombre de sucursal disponible en banner
    resetMockCtrl({ currentStep: 2 });
    render(
      <InitialWizardModalView
        {...baseProps}
        hasActiveSession={true}
        initialSucursalId="los-heroes"
      />
    );

    expect(screen.getByText(/Los Héroes/)).toBeInTheDocument();
  });

  // [IA] - CASO-SANN CA-02 + CT-04: Banner NO se renderiza si initialSucursalId es null
  it('does NOT render active session banner when hasActiveSession is true but initialSucursalId is null', () => {
    render(
      <InitialWizardModalView
        {...baseProps}
        hasActiveSession={true}
        initialSucursalId={null}
      />
    );

    expect(screen.queryByText(/sesión activa/i)).not.toBeInTheDocument();
  });

  // [IA] - CASO-SANN-R1 CA-01: Banner NO se renderiza en Paso 1 aunque haya sesión activa
  // Razón: Paso 1 es Protocolo Anti-Fraude — usuario aún no ha elegido sucursal
  it('does NOT render active session banner on Step 1 (Protocolo) even with active session', () => {
    // currentStep queda en 1 (default de resetMockCtrl — ver beforeEach)
    render(
      <InitialWizardModalView
        {...baseProps}
        hasActiveSession={true}
        initialSucursalId="los-heroes"
      />
    );

    expect(screen.queryByText(/sesión activa/i)).not.toBeInTheDocument();
  });
});
