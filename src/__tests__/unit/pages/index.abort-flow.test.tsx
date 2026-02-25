import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Index from '@/pages/Index';

const supabaseMocks = vi.hoisted(() => {
  const maybeSingleMock = vi.fn();
  const limitMock = vi.fn(() => ({ maybeSingle: maybeSingleMock }));
  const orderMock = vi.fn(() => ({ limit: limitMock }));
  const inMock = vi.fn(() => ({ order: orderMock }));
  const eqMock = vi.fn(() => ({ in: inMock }));
  const selectMock = vi.fn(() => ({ in: inMock, eq: eqMock }));
  const cortesMock = vi.fn(() => ({ select: selectMock }));

  const empleadosInMock = vi.fn();
  const empleadosSelectMock = vi.fn(() => ({ in: empleadosInMock }));
  const empleadosMock = vi.fn(() => ({ select: empleadosSelectMock }));

  return {
    maybeSingleMock,
    cortesMock,
    empleadosInMock,
    empleadosMock,
  };
});

const corteSesionMocks = vi.hoisted(() => ({
  iniciarCorte: vi.fn().mockResolvedValue({
    id: 'corte-1',
    cajero: 'Jonathan Melara',
    testigo: 'Adonay Torres',
    sucursal_id: 'store-1',
    venta_esperada: 600,
  }),
  guardarProgreso: vi.fn().mockResolvedValue(undefined),
  finalizarCorte: vi.fn().mockResolvedValue(undefined),
  abortarCorte: vi.fn().mockResolvedValue(undefined),
  recuperarSesion: vi.fn().mockResolvedValue(null),
  error: null as string | null,
}));

const toastMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    error: toastMocks.error,
    success: toastMocks.success,
  },
}));

vi.mock('@/lib/supabase', () => ({
  isSupabaseConfigured: true,
  tables: {
    cortes: supabaseMocks.cortesMock,
    empleados: supabaseMocks.empleadosMock,
  },
}));

vi.mock('@/hooks/useCorteSesion', () => ({
  useCorteSesion: () => corteSesionMocks,
}));

vi.mock('@/components/operation-selector/OperationSelector', () => ({
  OperationSelector: ({ onSelectMode }: { onSelectMode: (mode: 'cash_cut' | 'cash_count') => void }) => (
    <div data-testid="operation-selector">
      <button type="button" data-testid="open-cash-cut" onClick={() => onSelectMode('cash_cut')}>
        Abrir Corte
      </button>
    </div>
  ),
}));

vi.mock('@/components/InitialWizardModal', () => ({
  default: ({ isOpen, onComplete }: {
    isOpen: boolean;
    onComplete: (data: {
      selectedStore: string;
      selectedCashier: string;
      selectedWitness: string;
      expectedSales: string;
      dailyExpenses: never[];
    }) => void;
  }) => {
    if (!isOpen) return null;

    return (
      <div data-testid="initial-wizard">
        <button
          type="button"
          data-testid="wizard-complete"
          onClick={() => onComplete({
            selectedStore: 'store-1',
            selectedCashier: 'cashier-1',
            selectedWitness: 'witness-1',
            expectedSales: '600',
            dailyExpenses: [],
          })}
        >
          Completar Wizard
        </button>
      </div>
    );
  },
}));

vi.mock('@/components/morning-count/MorningCountWizard', () => ({
  MorningCountWizard: () => null,
}));

vi.mock('@/components/CashCounter', () => ({
  default: (props: {
    onFlowCancel?: (motivo?: string) => Promise<void> | void;
  }) => (
    <div data-testid="cash-counter">
      <button
        type="button"
        data-testid="cancel-flow"
        onClick={() => void props.onFlowCancel?.('Reinicio solicitado por diferencia en efectivo')}
      >
        Cancelar flujo
      </button>
    </div>
  ),
}));

vi.mock('@/components/deliveries/DeliveryDashboardWrapper', () => ({
  DeliveryDashboardWrapper: () => <div data-testid="delivery-page">Delivery</div>,
}));

vi.mock('@/components/corte/CorteOrquestador', () => ({
  default: () => null,
}));

describe('Index — onFlowCancel aborta en Supabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    supabaseMocks.maybeSingleMock.mockResolvedValue({
      data: null,
      error: null,
    });

    supabaseMocks.empleadosInMock.mockResolvedValue({
      data: [
        { id: 'cashier-1', nombre: 'Jonathan Melara' },
        { id: 'witness-1', nombre: 'Adonay Torres' },
      ],
      error: null,
    });
  });

  it('envía motivo a abortarCorte y regresa al selector cuando aborta correctamente', async () => {
    const user = userEvent.setup();
    render(<Index />);

    await user.click(screen.getByTestId('open-cash-cut'));
    await user.click(await screen.findByTestId('wizard-complete'));
    await screen.findByTestId('cash-counter');

    await user.click(screen.getByTestId('cancel-flow'));

    await waitFor(() => {
      expect(corteSesionMocks.abortarCorte).toHaveBeenCalledWith(
        'Reinicio solicitado por diferencia en efectivo',
      );
    });
    await screen.findByTestId('operation-selector');
  });

  it('si abortarCorte falla, muestra error y mantiene CashCounter visible', async () => {
    corteSesionMocks.abortarCorte.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const user = userEvent.setup();
    render(<Index />);

    await user.click(screen.getByTestId('open-cash-cut'));
    await user.click(await screen.findByTestId('wizard-complete'));
    await screen.findByTestId('cash-counter');

    await user.click(screen.getByTestId('cancel-flow'));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith('No hay conexión con Supabase. Verifique internet y reintente.');
    });
    expect(screen.getByTestId('cash-counter')).toBeInTheDocument();
  });
});
