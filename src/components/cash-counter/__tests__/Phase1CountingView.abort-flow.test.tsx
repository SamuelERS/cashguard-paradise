import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Phase1CountingView } from '../Phase1CountingView';

const baseProps = {
  cashCount: {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 0,
    bill10: 0,
    bill20: 0,
    bill50: 0,
    bill100: 0,
  },
  electronicPayments: {
    credomatic: 0,
    promerica: 0,
    bankTransfer: 0,
    paypal: 0,
  },
  guidedState: {
    currentStep: 1,
    totalSteps: 15,
    completedSteps: new Set<string>(),
    isCompleted: false,
    isLocked: false,
  },
  currentField: 'penny',
  instructionText: 'Ingresa la cantidad',
  FIELD_ORDER: ['penny'],
  isMorningCount: false,
  primaryGradient: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
  IconComponent: () => null,
  isFieldActive: () => false,
  isFieldCompleted: () => false,
  isFieldAccessible: () => false,
  canGoPrevious: false,
  showExitConfirmation: true,
  showBackConfirmation: false,
  onShowExitConfirmationChange: vi.fn(),
  onShowBackConfirmationChange: vi.fn(),
  onFieldConfirm: vi.fn(),
  onAttemptAccess: vi.fn(),
  onCancelProcess: vi.fn(),
  onPreviousStep: vi.fn(),
  onConfirmPrevious: vi.fn(),
  onBackToStart: vi.fn(),
};

describe('Phase1CountingView abort flow', () => {
  it('pide motivo y llama onAbortFlow(motivo) al confirmar cancelación', async () => {
    const user = userEvent.setup();
    const onAbortFlow = vi.fn().mockResolvedValue(undefined);

    render(
      <Phase1CountingView
        {...baseProps}
        onAbortFlow={onAbortFlow}
      />,
    );

    await user.type(
      screen.getByLabelText(/motivo/i),
      'Reinicio por error de arqueo inicial',
    );
    await user.click(
      screen.getByRole('button', { name: /confirmar cancelación/i }),
    );

    expect(onAbortFlow).toHaveBeenCalledWith('Reinicio por error de arqueo inicial');
  });
});
