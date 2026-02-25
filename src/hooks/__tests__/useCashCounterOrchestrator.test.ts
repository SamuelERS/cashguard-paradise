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

vi.mock('@/hooks/useSucursales', () => ({
  useSucursales: vi.fn(() => ({
    sucursales: [],
    cargando: false,
    error: null,
    recargar: vi.fn(),
  })),
}));

vi.mock('@/hooks/useEmpleadosSucursal', () => ({
  useEmpleadosSucursal: vi.fn(() => ({
    empleados: [],
    cargando: false,
    error: null,
    recargar: vi.fn(),
  })),
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
import { useSucursales } from '@/hooks/useSucursales';
import { useEmpleadosSucursal } from '@/hooks/useEmpleadosSucursal';

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
  const mockUseSucursales = vi.mocked(useSucursales);
  const mockUseEmpleadosSucursal = vi.mocked(useEmpleadosSucursal);

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockUseSucursales.mockReturnValue({
      sucursales: [],
      cargando: false,
      error: null,
      recargar: vi.fn(),
    });
    mockUseEmpleadosSucursal.mockReturnValue({
      empleados: [],
      cargando: false,
      error: null,
      recargar: vi.fn(),
    });
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

  it('Con skipWizard=true y expectedSales vacía, arranca Phase 1 (no vuelve al formulario legacy)', () => {
    const { result } = renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({
        skipWizard: true,
        initialExpectedSales: '',
      })),
    );

    expect(result.current.showInstructionsModal).toBe(false);
    expect(mockStartPhase1).toHaveBeenCalled();
  });

  it('Con skipWizard=false y expectedSales vacía, mantiene flujo guiado (modal visible)', () => {
    const { result } = renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({
        skipWizard: false,
        initialExpectedSales: '',
      })),
    );

    expect(result.current.showInstructionsModal).toBe(true);
    expect(mockStartPhase1).not.toHaveBeenCalled();
  });

  it('usa sucursales remotas como catálogo de tiendas cuando existen', () => {
    mockUseSucursales.mockReturnValue({
      sucursales: [
        { id: 'suc-001', nombre: 'Los Héroes', codigo: 'H', activa: true },
      ],
      cargando: false,
      error: null,
      recargar: vi.fn(),
    });

    const { result } = renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({
        initialStore: '',
        initialCashier: '',
        initialWitness: '',
      })),
    );

    expect(result.current.availableStores).toEqual([
      { id: 'suc-001', name: 'Los Héroes', code: 'H' },
    ]);
  });

  it('prioriza empleados de Supabase cuando hay sucursal remota seleccionada', () => {
    mockUseSucursales.mockReturnValue({
      sucursales: [
        { id: 'suc-001', nombre: 'Los Héroes', codigo: 'H', activa: true },
      ],
      cargando: false,
      error: null,
      recargar: vi.fn(),
    });
    mockUseEmpleadosSucursal.mockReturnValue({
      empleados: [
        { id: 'uuid-1', nombre: 'Jonathan Melara', cargo: 'Cajero' },
        { id: 'uuid-2', nombre: 'Adonay Torres', cargo: 'Testigo' },
      ],
      cargando: false,
      error: null,
      recargar: vi.fn(),
    });

    const { result } = renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({
        initialStore: 'suc-001',
        initialCashier: '',
        initialWitness: '',
      })),
    );

    expect(mockUseEmpleadosSucursal).toHaveBeenCalledWith('suc-001');
    expect(result.current.availableEmployees).toEqual([
      { id: 'uuid-1', name: 'Jonathan Melara', role: 'Cajero', stores: ['suc-001'] },
      { id: 'uuid-2', name: 'Adonay Torres', role: 'Testigo', stores: ['suc-001'] },
    ]);
  });

  it('resuelve sucursal por nombre completo para cargar empleados registrados', () => {
    mockUseSucursales.mockReturnValue({
      sucursales: [
        { id: 'suc-003', nombre: 'San Benito', codigo: 'B', activa: true },
      ],
      cargando: false,
      error: null,
      recargar: vi.fn(),
    });

    renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({
        initialStore: 'San Benito',
        initialCashier: '',
        initialWitness: '',
      })),
    );

    expect(mockUseEmpleadosSucursal).toHaveBeenCalledWith('suc-003');
  });

  it('retorna empleados vacios cuando no hay datos de la sucursal', () => {
    mockUseSucursales.mockReturnValue({
      sucursales: [],
      cargando: false,
      error: null,
      recargar: vi.fn(),
    });
    mockUseEmpleadosSucursal.mockReturnValue({
      empleados: [],
      cargando: false,
      error: null,
      recargar: vi.fn(),
    });

    const { result } = renderHook(() =>
      useCashCounterOrchestrator(defaultOptions({
        initialStore: 'los-heroes',
        initialCashier: '',
        initialWitness: '',
      })),
    );

    expect(mockUseEmpleadosSucursal).toHaveBeenCalledWith(null);
    expect(result.current.availableEmployees).toEqual([]);
  });

  it('handleAbortFlow usa onFlowCancel con motivo y no dispara onBack', async () => {
    const onBack = vi.fn();
    const onFlowCancel = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useCashCounterOrchestrator(
        defaultOptions({
          onBack,
          onFlowCancel,
        }),
      ),
    );

    await act(async () => {
      await result.current.handleAbortFlow('Cajero solicita reinicio por conteo inconsistente');
    });

    expect(onFlowCancel).toHaveBeenCalledWith('Cajero solicita reinicio por conteo inconsistente');
    expect(onBack).not.toHaveBeenCalled();
  });
});
