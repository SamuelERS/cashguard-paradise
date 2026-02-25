import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeliveryDashboard } from '../DeliveryDashboard';
import { useDeliveries } from '../../../hooks/useDeliveries';
import { useDeliverySummary } from '../../../hooks/useDeliverySummary';
import type { DeliverySummary } from '../../../types/deliveries';

vi.mock('../../../hooks/useDeliveries', () => ({
  useDeliveries: vi.fn(),
}));

vi.mock('../../../hooks/useDeliverySummary', () => ({
  useDeliverySummary: vi.fn(),
}));

const mockUseDeliveries = vi.mocked(useDeliveries);
const mockUseDeliverySummary = vi.mocked(useDeliverySummary);

const emptySummary: DeliverySummary = {
  totalPending: 0,
  countPending: 0,
  byCourier: {
    C807: { count: 0, total: 0 },
    Melos: { count: 0, total: 0 },
    Otro: { count: 0, total: 0 },
  },
  byAlert: {
    ok: 0,
    warning: 0,
    urgent: 0,
    critical: 0,
  },
  oldestPendingDays: 0,
  averagePendingDays: 0,
};

describe('DeliveryDashboard UX behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDeliveries.mockReturnValue({ pending: [], history: [], error: null });
    mockUseDeliverySummary.mockReturnValue(emptySummary);
  });

  it('estado vacío ofrece CTA para ir a Gestión', async () => {
    const onGoToManagement = vi.fn();
    const user = userEvent.setup();

    render(<DeliveryDashboard onGoToManagement={onGoToManagement} />);

    const cta = screen.getByRole('button', { name: /Ir a Gestión/i });
    expect(cta).toBeInTheDocument();

    await user.click(cta);
    expect(onGoToManagement).toHaveBeenCalledTimes(1);
  });

  it('si hay pendientes, oculta CTA de estado vacío', () => {
    mockUseDeliverySummary.mockReturnValue({
      ...emptySummary,
      totalPending: 125.5,
      countPending: 2,
      byCourier: {
        C807: { count: 2, total: 125.5 },
        Melos: { count: 0, total: 0 },
        Otro: { count: 0, total: 0 },
      },
      byAlert: {
        ok: 0,
        warning: 1,
        urgent: 1,
        critical: 0,
      },
      oldestPendingDays: 19,
      averagePendingDays: 11.5,
    });

    render(<DeliveryDashboard onGoToManagement={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /Ir a Gestión/i })).not.toBeInTheDocument();
  });
});
