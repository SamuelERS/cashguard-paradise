import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import Index from '@/pages/Index';

const supabaseMocks = vi.hoisted(() => {
  const maybeSingleMock = vi.fn();
  const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const orderMock = vi.fn(() => ({ limit: limitMock }));
  const inMock = vi.fn(() => ({ order: orderMock }));
  const selectMock = vi.fn(() => ({ in: inMock }));
  const cortesMock = vi.fn(() => ({ select: selectMock }));

  return {
    maybeSingleMock,
    cortesMock,
  };
});

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  tables: {
    cortes: supabaseMocks.cortesMock,
  },
}));

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
  default: ({ isOpen, initialSucursalId }: { isOpen: boolean; initialSucursalId?: string | null }) =>
    isOpen ? <div data-testid="initial-wizard" data-initial-sucursal-id={initialSucursalId || ''}>InitialWizardModal</div> : null,
}));

vi.mock('@/components/morning-count/MorningCountWizard', () => ({
  MorningCountWizard: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="morning-wizard">MorningCountWizard</div> : null,
}));

vi.mock('@/hooks/useCorteSesion', () => ({
  useCorteSesion: () => ({
    iniciarCorte: vi.fn().mockResolvedValue(undefined),
    guardarProgreso: vi.fn().mockResolvedValue(undefined),
    error: null,
  }),
}));

vi.mock('@/components/CashCounter', () => ({
  default: () => <div data-testid="cash-counter">CashCounter</div>,
}));

vi.mock('@/components/deliveries/DeliveryDashboardWrapper', () => ({
  DeliveryDashboardWrapper: () => <div data-testid="delivery-page">DeliveryDashboardWrapper</div>,
}));

describe('Index CASH_CUT routing', () => {
  // 🤖 [IA] - DACC-FIX-1: Wizard es UX única para CASH_CUT, incluso con sesión activa
  it('opens InitialWizardModal even when an active CASH_CUT session exists', async () => {
    supabaseMocks.maybeSingleMock.mockResolvedValueOnce({
      data: { id: 'corte-activo-1', sucursal_id: 'suc-1' },
      error: null,
    });

    const user = userEvent.setup();
    render(<Index />);

    await user.click(screen.getByTestId('open-cash-cut'));

    const wizard = await screen.findByTestId('initial-wizard');
    expect(wizard).toBeInTheDocument();
    // 🤖 [IA] - DACC-CIERRE: Wizard recibe sucursalId de sesión activa para preselección
    expect(wizard.getAttribute('data-initial-sucursal-id')).toBe('suc-1');
    expect(screen.queryByTestId('corte-page')).not.toBeInTheDocument();
  });

  it('opens InitialWizardModal when selecting CASH_CUT', async () => {
    supabaseMocks.maybeSingleMock.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const user = userEvent.setup();
    render(<Index />);

    await user.click(screen.getByTestId('open-cash-cut'));

    const wizard = await screen.findByTestId('initial-wizard');
    expect(wizard).toBeInTheDocument();
    // 🤖 [IA] - DACC-CIERRE: Sin sesión activa, initialSucursalId es vacío
    expect(wizard.getAttribute('data-initial-sucursal-id')).toBe('');
    expect(screen.queryByTestId('corte-page')).not.toBeInTheDocument();
  });
});
