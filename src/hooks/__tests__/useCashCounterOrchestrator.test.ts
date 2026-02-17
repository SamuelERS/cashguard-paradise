// 🤖 [IA] - Orden #015: Tests useCashCounterOrchestrator — skipWizard prop
// Verifica que skipWizard=true salta el modal de instrucciones en CASH_CUT

import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OperationMode } from '@/types/operation-mode';

// ---------------------------------------------------------------------------
// Mocks: Sub-hooks y dependencias
// ---------------------------------------------------------------------------

const mockStartPhase1 = vi.fn();
const mockResetFlow = vi.fn();

vi.mock('@/hooks/usePhaseManager', () => ({
  usePhaseManager: vi.fn(() => ({
    phaseState: { currentPhase: 1, phase1Completed: false, shouldSkipPhase2: false },
    deliveryCalculation: null,
    startPhase1: mockStartPhase1,
    completePhase1: vi.fn(),
    completePhase2Verification: vi.fn(),
    updateDeliveryCalculation: vi.fn(),
    resetAllPhases: vi.fn(),
  })),
}));

vi.mock('@/hooks/useGuidedCounting', () => ({
  useGuidedCounting: vi.fn(() => ({
    guidedState: { currentStep: 0, totalSteps: 14, completedSteps: new Set(), isCompleted: false, isLocked: false },
    currentField: 'penny',
    instructionText: 'Ingrese la cantidad',
    isFieldActive: vi.fn(() => false),
    isFieldCompleted: vi.fn(() => false),
    isFieldAccessible: vi.fn(() => false),
    confirmCurrentField: vi.fn(() => true),
    resetGuidedCounting: vi.fn(),
    canGoPrevious: vi.fn(() => false),
    goPrevious: vi.fn(),
    FIELD_ORDER: ['penny', 'nickel'],
  })),
}));

vi.mock('@/hooks/useInstructionsFlow', () => ({
  useInstructionsFlow: vi.fn(() => ({
    resetFlow: mockResetFlow,
  })),
}));

vi.mock('@/hooks/useTimingConfig', () => ({
  useTimingConfig: vi.fn(() => ({
    createTimeoutWithCleanup: vi.fn((cb: () => void) => {
      cb();
      return vi.fn();
    }),
  })),
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock('@/hooks/usePwaScrollPrevention', () => ({
  usePwaScrollPrevention: vi.fn(),
}));

vi.mock('@/data/paradise', () => ({
  getEmployeesByStore: vi.fn(() => []),
}));

vi.mock('@/utils/calculations', () => ({
  calculateCashTotal: vi.fn(() => 0),
}));

vi.mock('sonner', () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock('@/config/toast', () => ({
  TOAST_DURATIONS: { SHORT: 2000, NORMAL: 3000, EXTENDED: 5000 },
  TOAST_MESSAGES: {
    SUCCESS_PHASE1: 'Fase 1 completa',
    INFO_SKIP_PHASE2: 'Skip phase 2',
    INFO_PROCEED_PHASE2: 'Proceed phase 2',
    SUCCESS_PHASE2: 'Fase 2 completa',
    INFO_PROCEED_PHASE3: 'Proceed phase 3',
    ERROR_COMPLETE_CURRENT: 'Complete current',
    ERROR_LOCKED_TOTALS: 'Locked',
    INFO_FIRST_FIELD: 'First field',
    SUCCESS_PREVIOUS_FIELD: 'Previous',
    ERROR_CANNOT_GO_BACK: 'Cannot go back',
  },
}));

// Import AFTER mocks
import { useCashCounterOrchestrator } from '../useCashCounterOrchestrator';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function defaultOptions(overrides = {}) {
  return {
    operationMode: OperationMode.CASH_CUT,
    initialStore: 'Sucursal Central',
    initialCashier: 'Juan Pérez',
    initialWitness: 'María López',
    initialExpectedSales: '653.65',
    initialDailyExpenses: [],
    onBack: vi.fn(),
    onFlowCancel: vi.fn(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('useCashCounterOrchestrator — skipWizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('Con skipWizard=true y CASH_CUT, NO muestra instrucciones y arranca Phase 1', () => {
    const { result } = renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({ skipWizard: true })),
    );

    // showInstructionsModal debe ser false (no mostró el modal)
    expect(result.current.showInstructionsModal).toBe(false);
    // startPhase1 debe haberse llamado directamente
    expect(mockStartPhase1).toHaveBeenCalled();
  });

  it('Con skipWizard=false y CASH_CUT, SÍ muestra instrucciones', () => {
    const { result } = renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({ skipWizard: false })),
    );

    // showInstructionsModal debe ser true
    expect(result.current.showInstructionsModal).toBe(true);
    // startPhase1 NO debe haberse llamado (espera confirmación del modal)
    expect(mockStartPhase1).not.toHaveBeenCalled();
  });

  it('Sin skipWizard (default false), comportamiento idéntico al actual', () => {
    const { result } = renderHook(() =>
      useCashCounterOrchestrator(defaultOptions()),
    );

    // Default: muestra instrucciones para CASH_CUT
    expect(result.current.showInstructionsModal).toBe(true);
    expect(mockStartPhase1).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Suite OT-17: Hidratación de estado inicial
// ---------------------------------------------------------------------------

describe('useCashCounterOrchestrator — OT-17 hidratación', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('Acepta initialCashCount sin error', () => {
    const initialCashCount = {
      penny: 50, nickel: 20, dime: 33, quarter: 8, dollarCoin: 1,
      bill1: 5, bill5: 3, bill10: 2, bill20: 1, bill50: 0, bill100: 0,
    };

    const { result } = renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({
        skipWizard: true,
        initialCashCount,
      })),
    );

    // Hook se inicializa correctamente con datos hidratados
    expect(result.current.cashCount).toBeDefined();
    expect(result.current.cashCount.penny).toBe(50);
    expect(result.current.cashCount.nickel).toBe(20);
  });

  it('Acepta initialElectronicPayments sin error', () => {
    const initialElectronicPayments = {
      credomatic: 5.32, promerica: 56.12, bankTransfer: 43.56, paypal: 0,
    };

    const { result } = renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({
        skipWizard: true,
        initialElectronicPayments,
      })),
    );

    expect(result.current.electronicPayments).toBeDefined();
    expect(result.current.electronicPayments.credomatic).toBe(5.32);
  });

  it('Sin initialCashCount usa valores por defecto (ceros)', () => {
    const { result } = renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({ skipWizard: true })),
    );

    expect(result.current.cashCount.penny).toBe(0);
    expect(result.current.cashCount.bill100).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Suite OT-17: onGuardarProgreso callback
// ---------------------------------------------------------------------------

describe('useCashCounterOrchestrator — OT-17 onGuardarProgreso', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('No llama onGuardarProgreso en el primer render (isFirstRender guard)', () => {
    const mockGuardar = vi.fn();

    renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({
        skipWizard: true,
        onGuardarProgreso: mockGuardar,
      })),
    );

    // Avanzar todos los timers posibles
    vi.advanceTimersByTime(1000);

    // No debe haberse llamado en el render inicial
    expect(mockGuardar).not.toHaveBeenCalled();
  });

  it('No llama onGuardarProgreso sin callback (guard undefined)', () => {
    renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({
        skipWizard: true,
        // onGuardarProgreso intencionalmente omitido
      })),
    );

    // Avanzar todos los timers posibles
    vi.advanceTimersByTime(1000);

    // Sin callback, no debe haber errores (guard `if (!onGuardarProgreso) return`)
    // Test implícito: no hay error → guard funciona correctamente
  });
});
