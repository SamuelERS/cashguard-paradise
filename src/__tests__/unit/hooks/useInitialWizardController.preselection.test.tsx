// [IA] - R3-B4 TDD RED: Verificar que useInitialWizardController NO preselecciona sucursal
// Módulo M1 del plan R3 — el useEffect en L88-94 DEBE ser eliminado.
// Estos 2 tests DEBEN FALLAR con el código actual (eso es correcto en fase RED).
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useInitialWizardController } from '@/hooks/initial-wizard/useInitialWizardController';

// ── Mocks de dependencias externas ────────────────────────────────────────────

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/config/toast', () => ({
  TOAST_DURATIONS: { EXTENDED: 5000 },
  TOAST_MESSAGES: {
    ERROR_REVIEW_RULES: 'Revisa las reglas',
    ERROR_COMPLETE_FIELDS: 'Completa los campos',
  },
}));

vi.mock('@/hooks/useSucursales', () => ({
  useSucursales: () => ({ sucursales: [] }),
}));

vi.mock('@/hooks/useEmpleadosSucursal', () => ({
  useEmpleadosSucursal: () => ({ empleados: [] }),
}));

vi.mock('@/lib/initial-wizard/wizardRules', () => ({
  calculateProgress: vi.fn().mockReturnValue(0),
}));

// ── Props mínimas válidas ─────────────────────────────────────────────────────

const baseProps = {
  isOpen: true,
  onClose: vi.fn(),
  onComplete: vi.fn(),
};

// ── Suite ─────────────────────────────────────────────────────────────────────

describe('R3-B4: useInitialWizardController — preselección de sucursal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('NO preselecciona sucursal cuando hay initialSucursalId', () => {
    // Renderizar con initialSucursalId presente
    const { result } = renderHook(() =>
      useInitialWizardController({
        ...baseProps,
        initialSucursalId: 'test-sucursal-123',
      })
    );

    // DEBE estar vacío: el usuario no ha elegido aún
    // FALLA actualmente porque L88-94 en el hook lo sobreescribe con 'test-sucursal-123'
    expect(result.current.wizardData.selectedStore).toBe('');
  });

  it('usuario debe seleccionar sucursal manualmente en Step 2', () => {
    // Mismo escenario: isOpen=true + initialSucursalId set
    const { result } = renderHook(() =>
      useInitialWizardController({
        ...baseProps,
        initialSucursalId: 'test-sucursal-123',
      })
    );

    // El wizard arranca en Step 1 con selectedStore vacío
    // Un usuario en Step 2 aún no ha elegido sucursal → debe seguir vacío
    // FALLA actualmente porque el useEffect preselecciona la sucursal automáticamente
    expect(result.current.wizardData.selectedStore).toBe('');
    expect(result.current.currentStep).toBe(1); // arranca en Step 1, sin avanzar solo
  });
});
