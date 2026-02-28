import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OperationMode } from '@/types/operation-mode';
import type { DeliveryCalculation } from '@/types/phases';

const phaseManagerMock = vi.hoisted(() => ({
  phaseState: {
    currentPhase: 2 as const,
    phase1Completed: true,
    phase2Completed: false,
    totalCashFromPhase1: 200,
    shouldSkipPhase2: false,
  },
  deliveryCalculation: {
    amountToDeliver: 150,
    amountRemaining: 50,
    denominationsToDeliver: {
      penny: 0,
      nickel: 0,
      dime: 2,
      quarter: 0,
      dollarCoin: 0,
      bill1: 0,
      bill5: 0,
      bill10: 0,
      bill20: 0,
      bill50: 0,
      bill100: 0,
    },
    denominationsToKeep: {
      penny: 10,
      nickel: 10,
      dime: 10,
      quarter: 10,
      dollarCoin: 0,
      bill1: 0,
      bill5: 0,
      bill10: 0,
      bill20: 0,
      bill50: 1,
      bill100: 0,
    },
    deliverySteps: [{ key: 'dime', quantity: 2, label: 'Diez centavos', value: 0.1 }],
    verificationSteps: [{ key: 'dime', quantity: 2, label: 'Diez centavos', value: 0.1 }],
  } as DeliveryCalculation | null,
}));

vi.mock('@/hooks/usePhaseManager', () => ({
  usePhaseManager: vi.fn(() => ({
    phaseState: phaseManagerMock.phaseState,
    deliveryCalculation: phaseManagerMock.deliveryCalculation,
    startPhase1: vi.fn(),
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

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock('@/hooks/useInstructionsFlow', () => ({
  useInstructionsFlow: vi.fn(() => ({
    resetFlow: vi.fn(),
  })),
}));

vi.mock('@/hooks/useTimingConfig', () => ({
  useTimingConfig: vi.fn(() => ({
    createTimeoutWithCleanup: vi.fn(),
  })),
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

import { useCashCounterOrchestrator } from '../useCashCounterOrchestrator';

describe('useCashCounterOrchestrator - live delivery autosave payload', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    phaseManagerMock.deliveryCalculation = {
      ...(phaseManagerMock.deliveryCalculation as DeliveryCalculation),
      liveDeliveryProgress: undefined,
      liveDeliveryEvents: undefined,
      liveDeliveryTotal: undefined,
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('incluye live_delivery_progress/events/total en datos_entrega durante autosave', () => {
    const onGuardarProgreso = vi.fn();

    const { rerender } = renderHook(() =>
      useCashCounterOrchestrator({
        operationMode: OperationMode.CASH_CUT,
        initialStore: 'Sucursal Central',
        initialCashier: 'Carlos Rivera',
        initialWitness: 'María López',
        initialExpectedSales: '653.65',
        initialDailyExpenses: [],
        onGuardarProgreso,
      }),
    );

    act(() => {
      phaseManagerMock.deliveryCalculation = {
        ...(phaseManagerMock.deliveryCalculation as DeliveryCalculation),
        liveDeliveryProgress: { dime: 2 },
        liveDeliveryEvents: [
          {
            stepKey: 'dime',
            quantity: 2,
            subtotal: 0.2,
            capturedAt: '2026-02-25T01:00:00.000Z',
          },
        ],
        liveDeliveryTotal: 0.2,
      };
    });

    rerender();

    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(onGuardarProgreso).toHaveBeenCalled();
    const lastPayload = onGuardarProgreso.mock.calls[onGuardarProgreso.mock.calls.length - 1]?.[0];
    expect(lastPayload.datos_entrega).toEqual(
      expect.objectContaining({
        live_delivery_progress: { dime: 2 },
        live_delivery_events: [
          expect.objectContaining({
            stepKey: 'dime',
            quantity: 2,
            subtotal: 0.2,
          }),
        ],
        live_delivery_total: 0.2,
      }),
    );
  });
});
