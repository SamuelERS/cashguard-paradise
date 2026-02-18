import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import Index from '@/pages/Index';
import { OperationMode } from '@/types/operation-mode';

vi.mock('@/hooks/useOperationMode', () => ({
  useOperationMode: () => ({
    currentMode: OperationMode.CASH_COUNT,
    selectMode: vi.fn(),
    resetMode: vi.fn(),
    getModeInfo: vi.fn(),
    isCashCount: true,
    isCashCut: false,
    hasSelectedMode: true,
  }),
}));

vi.mock('@/components/operation-selector/OperationSelector', () => ({
  OperationSelector: () => <div data-testid="operation-selector">OperationSelector</div>,
}));

vi.mock('@/components/morning-count/MorningCountWizard', () => ({
  MorningCountWizard: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="morning-wizard">MorningCountWizard</div> : null,
}));

vi.mock('@/components/CashCounter', () => ({
  default: () => <div data-testid="cash-counter">CashCounter</div>,
}));

vi.mock('@/components/InitialWizardModal', () => ({
  default: () => <div data-testid="initial-wizard">InitialWizardModal</div>,
}));

vi.mock('@/hooks/useCorteSesion', () => ({
  useCorteSesion: () => ({
    iniciarCorte: vi.fn().mockResolvedValue(undefined),
    guardarProgreso: vi.fn().mockResolvedValue(undefined),
    error: null,
  }),
}));

vi.mock('@/components/deliveries/DeliveryDashboardWrapper', () => ({
  DeliveryDashboardWrapper: () => <div data-testid="delivery-page">DeliveryDashboardWrapper</div>,
}));

describe('Index stability', () => {
  it('auto-recovers CASH_COUNT state to avoid blank screen', async () => {
    const { container } = render(<Index />);

    await waitFor(() => {
      expect(screen.getByTestId('morning-wizard')).toBeInTheDocument();
    });

    expect(container.innerHTML.trim()).not.toBe('');
  });
});
