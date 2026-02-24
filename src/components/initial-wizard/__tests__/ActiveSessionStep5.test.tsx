// [IA] - CASO-SANN-R2: TDD RED phase — tests para panel de sesión activa en Step5SicarInput
// Todos estos tests DEBEN fallar hasta que se implementen el panel y las props futuras
// T1 y T8 pueden pasar trivialmente en RED (testing ausencia — elemento aún no existe)
// T2-T7 DEBEN fallar (testing presencia de elementos no implementados aún)
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Step5SicarInput } from '../steps/Step5SicarInput';
import type { Step5Props } from '@/types/initialWizard';

// [IA] - CASO-SANN-R2: Tipo extendido para props futuras — aún no en Step5Props ni en Step5SicarInput
// Estas props se agregarán en la fase GREEN de CASO-SANN-R2
type Step5PropsWithSession = Step5Props & {
  hasActiveSession?: boolean;
  onResumeSession?: () => void;
  onAbortSession?: () => void;
};

// ── Props mínimas base para Step5SicarInput ──
const baseProps: Step5PropsWithSession = {
  wizardData: {
    selectedStore: 'los-heroes',
    selectedCashier: 'cajero-1',
    selectedWitness: 'testigo-1',
    expectedSales: '',
    dailyExpenses: [],
  },
  updateWizardData: vi.fn(),
  validateInput: vi.fn(() => ({ isValid: true, cleanValue: '' })),
  getPattern: vi.fn(() => ''),
  getInputMode: vi.fn(() => 'numeric' as const),
  handleNext: vi.fn(),
  canGoNext: false,
  currentStep: 5,
  totalSteps: 6,
  availableStores: [
    { id: 'los-heroes', name: 'Los Héroes' },
    { id: 'plaza-merliot', name: 'Plaza Merliot' },
  ],
  availableEmployees: [],
  activeSessionSucursalId: 'los-heroes',
};

// ── Helper de renderizado ──
// Cast necesario: las props futuras (hasActiveSession, onResumeSession, onAbortSession)
// aún no existen en Step5Props — se agregarán en la fase GREEN
const renderStep5 = (overrides: Partial<Step5PropsWithSession> = {}) => {
  const props = { ...baseProps, ...overrides };
  render(<Step5SicarInput {...(props as unknown as Step5Props)} />);
};

// ── Tests: Panel de Sesión Activa en Step5SicarInput ──

describe('CASO-SANN-R2: Active Session Panel in Step5SicarInput', () => {
  // [IA] - CASO-SANN-R2 T1: Panel NO visible sin sesión activa
  it('T1: panel NOT visible when hasActiveSession is false', () => {
    renderStep5({ hasActiveSession: false });
    expect(screen.queryByText('Sesión en Progreso')).not.toBeInTheDocument();
  });

  // [IA] - CASO-SANN-R2 T2: Panel SÍ visible con sesión activa en Step 5
  it('T2: panel visible when hasActiveSession is true on Step 5', () => {
    renderStep5({ hasActiveSession: true, currentStep: 5 });
    expect(screen.getByText('Sesión en Progreso')).toBeInTheDocument();
  });

  // [IA] - CASO-SANN-R2 T3: Texto descriptivo sobre corte no completado
  it('T3: panel shows descriptive text about incomplete cash-cut session', () => {
    renderStep5({ hasActiveSession: true });
    expect(screen.getByText(/corte de caja que no se completó/i)).toBeInTheDocument();
  });

  // [IA] - CASO-SANN-R2 T4: Botón "Reanudar Sesión" dispara onResumeSession
  it('T4: "Reanudar Sesión" button calls onResumeSession when clicked', () => {
    const onResumeSession = vi.fn();
    renderStep5({ hasActiveSession: true, onResumeSession });
    fireEvent.click(screen.getByRole('button', { name: /reanudar sesión/i }));
    expect(onResumeSession).toHaveBeenCalledTimes(1);
  });

  // [IA] - CASO-SANN-R2 T5: Botón "Abortar Sesión" dispara onAbortSession (via ConfirmationModal)
  it('T5: "Abortar Sesión" button calls onAbortSession when clicked', async () => {
    const onAbortSession = vi.fn().mockResolvedValue(undefined);
    renderStep5({ hasActiveSession: true, onAbortSession });
    // Step 1: Click abre ConfirmationModal
    fireEvent.click(screen.getByRole('button', { name: /abortar sesión/i }));
    // Step 2: Confirmar en el modal
    const confirmButton = await screen.findByRole('button', { name: /sí, cancelar/i });
    fireEvent.click(confirmButton);
    // Step 3: onAbortSession se llama async dentro del onConfirm
    await waitFor(() => {
      expect(onAbortSession).toHaveBeenCalledTimes(1);
    });
  });

  // [IA] - CASO-SANN-R2 T6: Input SICAR deshabilitado cuando hay sesión activa
  it('T6: SICAR input is disabled when hasActiveSession is true', () => {
    renderStep5({ hasActiveSession: true });
    expect(
      screen.getByLabelText(/ingrese el monto de la venta esperada/i)
    ).toBeDisabled();
  });

  // [IA] - CASO-SANN-R2 T7: Botón "Continuar" deshabilitado aunque canGoNext=true
  it('T7: "Continuar" button is disabled when hasActiveSession is true even if canGoNext is true', () => {
    renderStep5({ hasActiveSession: true, canGoNext: true });
    expect(
      screen.getByRole('button', { name: /continuar al siguiente paso/i })
    ).toBeDisabled();
  });

  // [IA] - CASO-SANN-R2 T8: Panel NO visible en steps anteriores al 5
  // Razón: El panel solo aplica cuando el usuario ya está en el paso de decisión (Step 5)
  it('T8: panel NOT visible on Step 2 even with hasActiveSession true', () => {
    renderStep5({ hasActiveSession: true, currentStep: 2 });
    expect(screen.queryByText('Sesión en Progreso')).not.toBeInTheDocument();
  });

  it('T9: panel NOT visible when active session belongs to a different store', () => {
    renderStep5({
      hasActiveSession: true,
      currentStep: 5,
      activeSessionSucursalId: 'plaza-merliot',
      wizardData: { ...baseProps.wizardData, selectedStore: 'los-heroes' },
    });
    expect(screen.queryByText('Sesión en Progreso')).not.toBeInTheDocument();
  });
});
