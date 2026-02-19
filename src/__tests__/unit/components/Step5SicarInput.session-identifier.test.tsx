// [IA] - R3-B2 TDD RED: Verificar identificador de sesión visible en panel Step 5
// Módulo M4 del plan R3 — prop activeSessionInfo no existe aún en Step5Props.
// Tests 1-3 DEBEN FALLAR (prop no existe → nada se renderiza).
// Test 4 PUEDE PASAR (guard test — ausencia de datos no rompe el panel base).
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Step5SicarInput } from '@/components/initial-wizard/steps/Step5SicarInput';

// ── Props mínimas válidas ─────────────────────────────────────────────────────

const baseProps = {
  wizardData: {
    rulesAccepted: false,
    selectedStore: '',
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

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('R3-B2: Step5SicarInput — identificador sesión visible', () => {

  // ── Test 1 ─────────────────────────────────────────────────────────────────

  it('muestra correlativo en panel cuando disponible', () => {
    render(
      <Step5SicarInput
        {...baseProps}
        hasActiveSession={true}
        onResumeSession={vi.fn()}
        onAbortSession={vi.fn()}
        activeSessionInfo={{
          correlativo: 'CORTE-2026-02-18-M-001',
          createdAt: null,
          cajero: null,
          estado: null,
        }}
      />
    );

    // FALLA actualmente: prop ignorada — Step5Props no la declara.
    // En GREEN, el correlativo debe renderizarse dentro del panel de sesión activa.
    expect(screen.getByText('CORTE-2026-02-18-M-001')).toBeInTheDocument();
  });

  // ── Test 2 ─────────────────────────────────────────────────────────────────

  it('muestra fecha de inicio formateada', () => {
    render(
      <Step5SicarInput
        {...baseProps}
        hasActiveSession={true}
        onResumeSession={vi.fn()}
        onAbortSession={vi.fn()}
        activeSessionInfo={{
          correlativo: null,
          createdAt: '2026-02-18T14:30:00Z',
          cajero: null,
          estado: null,
        }}
      />
    );

    // FALLA actualmente: prop ignorada — componente no renderiza fecha.
    // En GREEN, debe aparecer etiqueta "Iniciado:" con la fecha formateada.
    expect(screen.getByText(/Iniciado:/i)).toBeInTheDocument();
  });

  // ── Test 3 ─────────────────────────────────────────────────────────────────

  it('muestra cajero anterior', () => {
    render(
      <Step5SicarInput
        {...baseProps}
        hasActiveSession={true}
        onResumeSession={vi.fn()}
        onAbortSession={vi.fn()}
        activeSessionInfo={{
          correlativo: null,
          createdAt: null,
          cajero: 'Juan Pérez',
          estado: null,
        }}
      />
    );

    // FALLA actualmente: prop ignorada — componente no renderiza nombre del cajero.
    // En GREEN, debe aparecer "Cajero: Juan Pérez" dentro del panel.
    expect(screen.getByText(/Cajero: Juan Pérez/i)).toBeInTheDocument();
  });

  // ── Test 4 (guard — puede PASAR en RED) ────────────────────────────────────

  it('no muestra info de sesión cuando activeSessionInfo es null', () => {
    render(
      <Step5SicarInput
        {...baseProps}
        hasActiveSession={true}
        onResumeSession={vi.fn()}
        onAbortSession={vi.fn()}
        // Sin activeSessionInfo — el panel base debe seguir visible sin detalles
      />
    );

    // Panel base DEBE seguir visible (no regresión)
    expect(screen.getByText('Sesión en Progreso')).toBeInTheDocument();

    // Detalles de sesión NO deben aparecer cuando no hay info disponible
    expect(screen.queryByText(/Iniciado:/i)).toBeNull();
    // Nota: /Cajero:/i sola matchea el label del Resumen de Información existente en el componente.
    // Usamos /Cajero: \S+/i para exigir un nombre específico — lo que solo aparecería en la session info.
    expect(screen.queryByText(/Cajero: \S+/i)).toBeNull();
  });
});
