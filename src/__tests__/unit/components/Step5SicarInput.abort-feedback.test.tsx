// [IA] - R3-B5 TDD RED: Verificar feedback al abortar sesión activa en Step 5
// Módulo M3 del plan R3 — falta modal confirmación + toast + estado consistente en error.
// Estos 5 tests DEBEN FALLAR con el código actual (eso es correcto en fase RED).
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useState } from 'react';
import { toast } from 'sonner';
import { Step5SicarInput } from '@/components/initial-wizard/steps/Step5SicarInput';

// ── Mock sonner (necesario para tests 4-5) ────────────────────────────────────

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// ── Props mínimas válidas ─────────────────────────────────────────────────────

const ACTIVE_STORE_ID = 'los-heroes';

const baseProps = {
  wizardData: {
    rulesAccepted: false,
    selectedStore: ACTIVE_STORE_ID,
    selectedCashier: '',
    selectedWitness: '',
    expectedSales: '',
    dailyExpenses: [],
  },
  updateWizardData: vi.fn(),
  validateInput: vi.fn().mockReturnValue({ isValid: true, cleanValue: '' }),
  getPattern: vi.fn().mockReturnValue(''),
  getInputMode: vi.fn().mockReturnValue('decimal' as const),
  handleNext: vi.fn(),
  canGoNext: false,
  currentStep: 5,
  totalSteps: 6,
  availableStores: [],
  availableEmployees: [],
};

// ── Helper ────────────────────────────────────────────────────────────────────

function renderWithActiveSession(
  onAbortSession = vi.fn(),
  onResumeSession = vi.fn(),
) {
  return render(
    <Step5SicarInput
      {...baseProps}
      hasActiveSession={true}
      // [IA] - BRANCH-ISOLATION: sesión activa pertenece a la misma sucursal seleccionada
      activeSessionSucursalId={ACTIVE_STORE_ID}
      onResumeSession={onResumeSession}
      onAbortSession={onAbortSession}
    />
  );
}

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('R3-B5: Step5SicarInput — feedback al abortar sesión', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Test 1 ─────────────────────────────────────────────────────────────────

  it('muestra modal de confirmación al presionar Abortar', async () => {
    const user = userEvent.setup();
    renderWithActiveSession();

    await user.click(screen.getByRole('button', { name: /abortar/i }));

    // FALLA: onAbortSession se ejecuta directamente sin mostrar modal de confirmación.
    // En GREEN, deberá aparecer texto del modal de confirmación.
    const modalText =
      screen.queryByText(/esta acción no se puede deshacer/i) ??
      screen.queryByText(/abortar sesión activa/i);
    expect(modalText).toBeInTheDocument();
  });

  // ── Test 2 ─────────────────────────────────────────────────────────────────

  it('cancelar en modal cierra sin abortar', async () => {
    const user = userEvent.setup();
    const onAbortSession = vi.fn();
    renderWithActiveSession(onAbortSession);

    await user.click(screen.getByRole('button', { name: /abortar/i }));

    // El botón de cancelar en el modal usa el copy estándar "Continuar aquí"
    const cancelBtn = screen.getByRole('button', { name: /continuar aquí/i });
    await user.click(cancelBtn);

    expect(onAbortSession).not.toHaveBeenCalled();
  });

  // ── Test 3 ─────────────────────────────────────────────────────────────────

  it('confirmar en modal ejecuta onAbortSession exactamente una vez', async () => {
    const user = userEvent.setup();
    const onAbortSession = vi.fn().mockResolvedValue(undefined);
    renderWithActiveSession(onAbortSession);

    await user.click(screen.getByRole('button', { name: /abortar/i }));

    const confirmBtn = screen.getByRole('button', { name: /confirmar cancelación/i });
    await user.type(screen.getByLabelText(/motivo/i), 'Reinicio por inconsistencia en sesión activa');
    await user.click(confirmBtn);

    expect(onAbortSession).toHaveBeenCalledTimes(1);
    expect(onAbortSession).toHaveBeenCalledWith('Reinicio por inconsistencia en sesión activa');
  });

  // ── Test 4 ─────────────────────────────────────────────────────────────────

  it('muestra toast de éxito cuando el abort es exitoso', async () => {
    const user = userEvent.setup();
    const onAbortSession = vi.fn().mockResolvedValue(undefined);
    renderWithActiveSession(onAbortSession);

    await user.click(screen.getByRole('button', { name: /abortar/i }));

    const confirmBtn = screen.getByRole('button', { name: /confirmar cancelación/i });
    await user.type(screen.getByLabelText(/motivo/i), 'Reinicio por inconsistencia en sesión activa');
    await user.click(confirmBtn);

    expect(toast.success).toHaveBeenCalled();
  });

  // ── Test 5 ─────────────────────────────────────────────────────────────────

  it('el panel persiste cuando abort falla (estado no se limpia en error)', async () => {
    const user = userEvent.setup();
    const onAbortSession = vi.fn().mockRejectedValue(new Error('Supabase error'));

    // Wrapper con estado local que replica el comportamiento de Index.tsx:
    // en GREEN, el estado solo se limpia DENTRO del bloque de éxito.
    function StatefulWrapper() {
      const [hasActive, setHasActive] = useState(true);
      const handleAbort = async (_motivo: string) => {
        try {
          await onAbortSession();
          setHasActive(false); // solo en éxito
        } catch {
          // error: panel debe permanecer visible
        }
      };
      return (
        <Step5SicarInput
          {...baseProps}
          hasActiveSession={hasActive}
          // [IA] - BRANCH-ISOLATION: misma sucursal para que el panel sea visible
          activeSessionSucursalId={ACTIVE_STORE_ID}
          onResumeSession={vi.fn()}
          onAbortSession={handleAbort}
        />
      );
    }

    render(<StatefulWrapper />);
    expect(screen.getByText('Sesión en Progreso')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /abortar/i }));

    const confirmBtn = screen.getByRole('button', { name: /confirmar cancelación/i });
    await user.type(screen.getByLabelText(/motivo/i), 'Reinicio por inconsistencia en sesión activa');
    await user.click(confirmBtn);

    expect(screen.getByText('Sesión en Progreso')).toBeInTheDocument();
  });
});
