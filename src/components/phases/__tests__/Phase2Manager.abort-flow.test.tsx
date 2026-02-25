import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { DeliveryCalculation } from '@/types/phases';
import { Phase2Manager } from '../Phase2Manager';

const deliverySectionPropsRef: { current: Record<string, unknown> | null } = { current: null };

vi.mock('@/components/phases/Phase2DeliverySection', () => ({
  Phase2DeliverySection: (props: Record<string, unknown>) => {
    deliverySectionPropsRef.current = props;
    return <div data-testid="phase2-delivery-mock" />;
  },
}));

vi.mock('@/components/phases/Phase2VerificationSection', () => ({
  Phase2VerificationSection: () => <div data-testid="phase2-verification-mock" />,
}));

vi.mock('@/components/wizards/InstructionRule', () => ({
  InstructionRule: () => <div data-testid="instruction-rule-mock" />,
}));

vi.mock('@/components/wizards/WizardGlassCard', () => ({
  WizardGlassCard: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useTimingConfig', () => ({
  useTimingConfig: () => ({
    createTimeoutWithCleanup: vi.fn(),
  }),
}));

vi.mock('@/hooks/useChecklistFlow', () => ({
  useChecklistFlow: () => ({
    checkedItems: { bolsaPreparada: true, documentos: true, efectivo: true },
    enabledItems: { bolsaPreparada: true, documentos: true, efectivo: true },
    hiddenItems: { bolsaPreparada: false, documentos: false, efectivo: false },
    initializeChecklist: vi.fn(),
    handleCheckChange: vi.fn(),
    isChecklistComplete: () => true,
    getItemClassName: () => '',
    isItemActivating: () => false,
  }),
}));

const DELIVERY_FIXTURE: DeliveryCalculation = {
  amountToDeliver: 327.2,
  denominationsToDeliver: {
    penny: 0,
    nickel: 0,
    dime: 10,
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
    penny: 75,
    nickel: 20,
    dime: 33,
    quarter: 8,
    dollarCoin: 1,
    bill1: 1,
    bill5: 1,
    bill10: 0,
    bill20: 0,
    bill50: 0,
    bill100: 0,
  },
  deliverySteps: [{ key: 'dime', quantity: 2, label: 'Diez centavos', value: 0.1 }],
  verificationSteps: [{ key: 'dime', quantity: 2, label: 'Diez centavos', value: 0.1 }],
};

describe('Phase2Manager abort flow', () => {
  it('cancelar en fase2 solicita motivo y llama onAbortFlow con motivo', async () => {
    const user = userEvent.setup();
    const onAbortFlow = vi.fn().mockResolvedValue(undefined);

    render(
      <Phase2Manager
        deliveryCalculation={DELIVERY_FIXTURE}
        onPhase2Complete={vi.fn()}
        onBack={vi.fn()}
        onAbortFlow={onAbortFlow}
      />,
    );

    const onCancel = deliverySectionPropsRef.current?.onCancel as (() => void) | undefined;
    expect(onCancel).toBeTypeOf('function');

    act(() => {
      onCancel?.();
    });

    await user.type(
      screen.getByLabelText(/motivo/i),
      'Reinicio por diferencia detectada en entrega',
    );
    await user.click(screen.getByRole('button', { name: /confirmar cancelación/i }));

    expect(onAbortFlow).toHaveBeenCalledWith('Reinicio por diferencia detectada en entrega');
  });
});
