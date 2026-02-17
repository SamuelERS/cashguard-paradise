import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Index from '@/pages/Index';

vi.mock('@/components/operation-selector/OperationSelector', () => ({
  OperationSelector: ({ onSelectMode }: { onSelectMode: (mode: 'cash_cut' | 'cash_count') => void }) => (
    <div data-testid="operation-selector">
      <button type="button" data-testid="open-cash-cut" onClick={() => onSelectMode('cash_cut')}>
        Abrir Corte
      </button>
      <button type="button" data-testid="open-cash-count" onClick={() => onSelectMode('cash_count')}>
        Abrir Conteo
      </button>
    </div>
  ),
}));

vi.mock('@/components/InitialWizardModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="initial-wizard">InitialWizardModal</div> : null,
}));

vi.mock('@/components/morning-count/MorningCountWizard', () => ({
  MorningCountWizard: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="morning-wizard">MorningCountWizard</div> : null,
}));

vi.mock('@/components/corte/CortePage', () => ({
  CortePage: () => <div data-testid="corte-page">CortePage</div>,
}));

vi.mock('@/components/CashCounter', () => ({
  default: () => <div data-testid="cash-counter">CashCounter</div>,
}));

vi.mock('@/components/deliveries/DeliveryDashboardWrapper', () => ({
  DeliveryDashboardWrapper: () => <div data-testid="delivery-page">DeliveryDashboardWrapper</div>,
}));

describe('Index CASH_CUT routing', () => {
  it('opens InitialWizardModal when selecting CASH_CUT', async () => {
    const user = userEvent.setup();
    render(<Index />);

    await user.click(screen.getByTestId('open-cash-cut'));

    expect(screen.getByTestId('initial-wizard')).toBeInTheDocument();
    expect(screen.queryByTestId('corte-page')).not.toBeInTheDocument();
  });
});
