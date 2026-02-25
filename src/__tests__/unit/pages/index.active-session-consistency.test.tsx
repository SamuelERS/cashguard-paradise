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
    inMock,
    eqMock,
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
  default: ({ isOpen, onComplete, completionError }: {
    isOpen: boolean;
    onComplete: (data: {
      selectedStore: string;
      selectedCashier: string;
      selectedWitness: string;
      expectedSales: string;
      dailyExpenses: never[];
    }) => void;
    completionError?: string | null;
  }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="initial-wizard">
        {completionError && (
          <p data-testid="wizard-completion-error">{completionError}</p>
        )}
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
  default: () => <div data-testid="cash-counter">CashCounter</div>,
}));

vi.mock('@/components/deliveries/DeliveryDashboardWrapper', () => ({
  DeliveryDashboardWrapper: () => <div data-testid="delivery-page">Delivery</div>,
}));

vi.mock('@/components/corte/CorteOrquestador', () => ({
  default: () => null,
}));

describe('Index — consistencia entre sesión activa y flujo de inicio nocturno', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    supabaseMocks.eqMock.mockImplementation(() => ({
      in: (...args: unknown[]) => supabaseMocks.inMock(...args),
    }));
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

  it('cuando aparece sesión EN_PROGRESO en validación final, no debe llamar iniciarCorte', async () => {
    supabaseMocks.maybeSingleMock
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({
        data: {
          id: 'corte-activo-1',
          sucursal_id: 'store-1',
          correlativo: 'COR-1',
          created_at: '2026-02-24T15:00:00.000Z',
          cajero: 'Jonathan Melara',
          estado: 'EN_PROGRESO',
        },
        error: null,
      });

    const user = userEvent.setup();
    render(<Index />);

    await user.click(screen.getByTestId('open-cash-cut'));
    await user.click(await screen.findByTestId('wizard-complete'));

    await waitFor(() => {
      expect(corteSesionMocks.iniciarCorte).not.toHaveBeenCalled();
    });
    expect(screen.getByTestId('wizard-completion-error')).toHaveTextContent(
      'Ya existe un corte EN PROGRESO para esta sucursal. Reanude la sesión.',
    );
  });

  it('si hay activo en sucursal seleccionada pero otro más reciente en otra sucursal, debe bloquear iniciarCorte', async () => {
    const activeStore2 = {
      data: {
        id: 'corte-activo-suc-2',
        sucursal_id: 'store-2',
        correlativo: 'COR-2',
        created_at: '2026-02-24T15:01:00.000Z',
        cajero: 'Irvin Abarca',
        estado: 'EN_PROGRESO',
      },
      error: null,
    };

    const activeStore1 = {
      data: {
        id: 'corte-activo-suc-1',
        sucursal_id: 'store-1',
        correlativo: 'COR-1',
        created_at: '2026-02-24T14:59:00.000Z',
        cajero: 'Adonay Torres',
        estado: 'EN_PROGRESO',
      },
      error: null,
    };

    supabaseMocks.maybeSingleMock.mockResolvedValue(activeStore2);
    supabaseMocks.eqMock.mockImplementation((field: string, value: string) => {
      if (field === 'sucursal_id' && value === 'store-1') {
        return {
          in: () => ({
            order: () => ({
              limit: () => ({
                maybeSingle: () => Promise.resolve(activeStore1),
              }),
            }),
          }),
        };
      }
      return {
        in: (...args: unknown[]) => supabaseMocks.inMock(...args),
      };
    });

    const user = userEvent.setup();
    render(<Index />);

    await user.click(screen.getByTestId('open-cash-cut'));
    await user.click(await screen.findByTestId('wizard-complete'));

    await waitFor(() => {
      expect(corteSesionMocks.iniciarCorte).not.toHaveBeenCalled();
    });
  });

  it('si falla verificación de sesión activa por red, bloquea continuación y muestra error de conexión', async () => {
    supabaseMocks.maybeSingleMock
      .mockResolvedValueOnce({ data: null, error: null })
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));

    const user = userEvent.setup();
    render(<Index />);

    await user.click(screen.getByTestId('open-cash-cut'));
    await user.click(await screen.findByTestId('wizard-complete'));

    await waitFor(() => {
      expect(toastMocks.error).toHaveBeenCalledWith('Sin conexión a Supabase. No se puede validar sesión activa.');
    });
    expect(corteSesionMocks.iniciarCorte).not.toHaveBeenCalled();
  });
});
