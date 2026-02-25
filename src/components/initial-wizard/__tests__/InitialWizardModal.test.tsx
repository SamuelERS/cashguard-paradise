// 🤖 [IA] - ORDEN #075: Integration tests — InitialWizardModalView + thin re-export
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { InitialWizardControllerReturn } from '@/types/initialWizard';

// ── Mock controller hook ──
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
  availableStores: [],
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

// ── Mock child step components to isolate View ──
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
const defaultProps = {
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

describe('InitialWizardModalView — Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMockCtrl();
  });

  // ── 1. Rendering ──
  describe('Rendering', () => {
    it('renders dialog when isOpen=true', () => {
      render(<InitialWizardModalView {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does NOT render dialog content when isOpen=false', () => {
      render(<InitialWizardModalView {...defaultProps} isOpen={false} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('shows header with "Corte Nocturno" title', () => {
      render(<InitialWizardModalView {...defaultProps} />);
      expect(screen.getByText('Corte Nocturno')).toBeInTheDocument();
    });

    it('shows step indicator "Paso 1 de 6"', () => {
      render(<InitialWizardModalView {...defaultProps} />);
      expect(screen.getByText('Paso 1 de 6')).toBeInTheDocument();
    });

    it('shows step indicator for current step', () => {
      resetMockCtrl({ currentStep: 3, totalSteps: 6 });
      render(<InitialWizardModalView {...defaultProps} />);
      expect(screen.getByText('Paso 3 de 6')).toBeInTheDocument();
    });
  });

  // ── 2. Step routing ──
  describe('Step routing', () => {
    it('renders Step1 when currentStep=1', () => {
      resetMockCtrl({ currentStep: 1 });
      render(<InitialWizardModalView {...defaultProps} />);
      expect(screen.getByTestId('step-1')).toBeInTheDocument();
    });

    it('renders Step2 when currentStep=2', () => {
      resetMockCtrl({ currentStep: 2 });
      render(<InitialWizardModalView {...defaultProps} />);
      expect(screen.getByTestId('step-2')).toBeInTheDocument();
    });

    it('renders Step3 when currentStep=3', () => {
      resetMockCtrl({ currentStep: 3 });
      render(<InitialWizardModalView {...defaultProps} />);
      expect(screen.getByTestId('step-3')).toBeInTheDocument();
    });

    it('renders Step4 when currentStep=4', () => {
      resetMockCtrl({ currentStep: 4 });
      render(<InitialWizardModalView {...defaultProps} />);
      expect(screen.getByTestId('step-4')).toBeInTheDocument();
    });

    it('renders Step5 when currentStep=5', () => {
      resetMockCtrl({ currentStep: 5 });
      render(<InitialWizardModalView {...defaultProps} />);
      expect(screen.getByTestId('step-5')).toBeInTheDocument();
    });

    it('renders Step6 when currentStep=6', () => {
      resetMockCtrl({ currentStep: 6 });
      render(<InitialWizardModalView {...defaultProps} />);
      expect(screen.getByTestId('step-6')).toBeInTheDocument();
    });
  });

  // ── 3. Footer navigation buttons ──
  describe('Footer navigation', () => {
    it('"Anterior" button is disabled on step 1', () => {
      resetMockCtrl({ currentStep: 1 });
      render(<InitialWizardModalView {...defaultProps} />);
      const btn = screen.getByTestId('wizard-button-previous');
      expect(btn).toBeDisabled();
    });

    it('"Anterior" calls handlePrevious when clicked', () => {
      resetMockCtrl({ currentStep: 3 });
      render(<InitialWizardModalView {...defaultProps} />);
      const btn = screen.getByTestId('wizard-button-previous');
      fireEvent.click(btn);
      expect(mockCtrl.handlePrevious).toHaveBeenCalledTimes(1);
    });

    it('"Continuar" button is shown on non-last step', () => {
      resetMockCtrl({ currentStep: 2 });
      render(<InitialWizardModalView {...defaultProps} />);
      expect(screen.getByTestId('wizard-button-next')).toBeInTheDocument();
    });

    it('"Continuar" is disabled when rules not completed on step 1', () => {
      resetMockCtrl({ currentStep: 1, isFlowCompleted: vi.fn(() => false) });
      render(<InitialWizardModalView {...defaultProps} />);
      const btn = screen.getByTestId('wizard-button-next');
      expect(btn).toBeDisabled();
    });

    it('"Continuar" is enabled when rules completed on step 1', () => {
      resetMockCtrl({ currentStep: 1, isFlowCompleted: vi.fn(() => true) });
      render(<InitialWizardModalView {...defaultProps} />);
      const btn = screen.getByTestId('wizard-button-next');
      expect(btn).not.toBeDisabled();
    });

    it('"Continuar" calls handleNext when clicked', () => {
      resetMockCtrl({
        currentStep: 2,
        getNavigationState: vi.fn(() => ({
          currentStep: 2, totalSteps: 6, data: mockCtrl.wizardData,
          canGoNext: true, canGoPrevious: true, isCompleted: false,
        })),
      });
      render(<InitialWizardModalView {...defaultProps} />);
      const btn = screen.getByTestId('wizard-button-next');
      fireEvent.click(btn);
      expect(mockCtrl.handleNext).toHaveBeenCalledTimes(1);
    });

    it('"Finalizar" button shown on last step instead of "Continuar"', () => {
      resetMockCtrl({ currentStep: 6, totalSteps: 6 });
      render(<InitialWizardModalView {...defaultProps} />);
      expect(screen.getByTestId('wizard-button-complete')).toBeInTheDocument();
      expect(screen.queryByTestId('wizard-button-next')).not.toBeInTheDocument();
    });

    it('"Finalizar" is disabled when wizard not completed', () => {
      resetMockCtrl({
        currentStep: 6,
        totalSteps: 6,
        getNavigationState: vi.fn(() => ({
          currentStep: 6, totalSteps: 6, data: mockCtrl.wizardData,
          canGoNext: false, canGoPrevious: true, isCompleted: false,
        })),
      });
      render(<InitialWizardModalView {...defaultProps} />);
      const btn = screen.getByTestId('wizard-button-complete');
      expect(btn).toBeDisabled();
    });

    it('"Finalizar" calls handleComplete when enabled and clicked', () => {
      resetMockCtrl({
        currentStep: 6,
        totalSteps: 6,
        getNavigationState: vi.fn(() => ({
          currentStep: 6, totalSteps: 6, data: mockCtrl.wizardData,
          canGoNext: false, canGoPrevious: true, isCompleted: true,
        })),
      });
      render(<InitialWizardModalView {...defaultProps} />);
      const btn = screen.getByTestId('wizard-button-complete');
      fireEvent.click(btn);
      expect(mockCtrl.handleComplete).toHaveBeenCalledTimes(1);
    });
  });

  // ── 4. X close button ──
  describe('Close button', () => {
    it('X button calls handleCancelRequest', () => {
      render(<InitialWizardModalView {...defaultProps} />);
      const closeBtn = screen.getByLabelText('Cerrar modal');
      expect(closeBtn.className).toContain('modal-close-button');
      fireEvent.click(closeBtn);
      expect(mockCtrl.handleCancelRequest).toHaveBeenCalledTimes(1);
    });
  });

  describe('Confirmation copy consistency', () => {
    it('cancel confirmation usa copy consistente', () => {
      resetMockCtrl({ showCancelConfirmation: true });
      render(<InitialWizardModalView {...defaultProps} />);

      expect(screen.getByText('Sí, cancelar')).toBeInTheDocument();
      expect(screen.getByText('Continuar aquí')).toBeInTheDocument();
    });
  });

  // ── 5. Re-export backward compatibility ──
  describe('Step 5 active-session check', () => {
    it('dispara chequeo de sesión activa al entrar a Step 5 con sucursal seleccionada', () => {
      const onCheckActiveSessionForStore = vi.fn();
      resetMockCtrl({
        currentStep: 5,
        wizardData: {
          ...mockCtrl.wizardData,
          selectedStore: 'suc-001',
        },
      });

      render(
        <InitialWizardModalView
          {...defaultProps}
          onCheckActiveSessionForStore={onCheckActiveSessionForStore}
        />
      );

      expect(onCheckActiveSessionForStore).toHaveBeenCalledTimes(1);
      expect(onCheckActiveSessionForStore).toHaveBeenCalledWith('suc-001');
    });
  });

  // ── 6. Re-export backward compatibility ──
  describe('Backward compatibility re-export', () => {
    it('InitialWizardModal.tsx re-exports default from View', async () => {
      const reExport = await import('@/components/InitialWizardModal');
      expect(reExport.default).toBeDefined();
      expect(typeof reExport.default).toBe('function');
    });
  });
});
