import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { DeliveryCalculation } from '@/types/phases';
import { Phase2DeliverySection } from '../Phase2DeliverySection';

vi.mock('@/components/ui/GuidedProgressIndicator', () => ({
  GuidedProgressIndicator: () => <div data-testid="guided-progress" />,
}));

vi.mock('@/components/cash-counting/DeliveryFieldView', () => ({
  DeliveryFieldView: ({ onConfirm, targetQuantity }: { onConfirm: (value: string) => void; targetQuantity: number }) => (
    <button
      type="button"
      onClick={() => onConfirm(String(targetQuantity))}
    >
      Confirmar Mock
    </button>
  ),
}));

const DELIVERY_CALCULATION_FIXTURE: DeliveryCalculation = {
  amountToDeliver: 0.2,
  denominationsToDeliver: {
    penny: 0,
    nickel: 0,
    dime: 2,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 0,
    bill10: 0,
    bill20: 0,
    bill50: 0,
    bill100: 0,
  },
  denominationsToKeep: {
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
  deliverySteps: [
    {
      key: 'dime',
      quantity: 2,
      label: 'Diez centavos',
      value: 0.1,
    },
  ],
  verificationSteps: [
    {
      key: 'dime',
      quantity: 2,
      label: 'Diez centavos',
      value: 0.1,
    },
  ],
};

describe('Phase2DeliverySection - live progress', () => {
  it('emite evento live al confirmar denominacion correcta', () => {
    const onStepComplete = vi.fn();
    const onStepLiveUpdate = vi.fn();

    render(
      <Phase2DeliverySection
        deliveryCalculation={DELIVERY_CALCULATION_FIXTURE}
        onStepComplete={onStepComplete}
        onSectionComplete={vi.fn()}
        completedSteps={{}}
        onCancel={vi.fn()}
        onStepLiveUpdate={onStepLiveUpdate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /confirmar mock/i }));

    expect(onStepComplete).toHaveBeenCalledWith('dime');
    expect(onStepLiveUpdate).toHaveBeenCalledWith({
      stepKey: 'dime',
      quantity: 2,
      subtotal: 0.2,
    });
  });
});
