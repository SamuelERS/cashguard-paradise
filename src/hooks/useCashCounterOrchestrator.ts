/**
 * 🤖 [IA] - v1.4.1: useCashCounterOrchestrator Hook
 * Extraído de CashCounter.tsx para desmonolitización
 *
 * @description
 * Hook orquestador que concentra toda la lógica de estado, sub-hooks,
 * efectos secundarios y handlers del flujo de corte de caja.
 * CashCounter.tsx se convierte en un componente presentacional delgado.
 */
import { useState, useEffect, useCallback } from "react";
import { Calculator, Sunrise } from "lucide-react";
import { toast } from 'sonner';
import { TOAST_DURATIONS, TOAST_MESSAGES } from '@/config/toast';
import { OperationMode } from "@/types/operation-mode";
import type { CashCount, ElectronicPayments } from "@/types/cash";
import type { DailyExpense } from '@/types/expenses';
import { getEmployeesByStore } from "@/data/paradise";
import { calculateCashTotal } from "@/utils/calculations";
import { useGuidedCounting } from "@/hooks/useGuidedCounting";
import { usePhaseManager } from "@/hooks/usePhaseManager";
import { useIsMobile } from "@/hooks/use-mobile";
import { useInstructionsFlow } from "@/hooks/useInstructionsFlow";
import { useTimingConfig } from "@/hooks/useTimingConfig";
import { usePwaScrollPrevention } from "@/hooks/usePwaScrollPrevention";

// 🤖 [IA] - v1.4.1: Opciones del orquestador (espejo de CashCounterProps)
interface CashCounterOrchestratorOptions {
  operationMode: OperationMode;
  initialStore: string;
  initialCashier: string;
  initialWitness: string;
  initialExpectedSales: string;
  initialDailyExpenses: DailyExpense[];
  onBack?: () => void;
  onFlowCancel?: () => void;
  skipWizard?: boolean; // 🤖 [IA] - Orden #015: Saltar instrucciones en flujo auditoría
}

export function useCashCounterOrchestrator({
  operationMode,
  initialStore,
  initialCashier,
  initialWitness,
  initialExpectedSales,
  initialDailyExpenses,
  onBack,
  onFlowCancel,
  skipWizard = false,
}: CashCounterOrchestratorOptions) {
  // 🤖 [IA] - v1.0.81 - Detectar modo de operación
  const isMorningCount = operationMode === OperationMode.CASH_COUNT;

  // 🤖 [IA] - v1.1.09 - Colores condicionales según modo de operación
  const primaryGradient = isMorningCount
    ? 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)'
    : 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)';
  const IconComponent = isMorningCount ? Sunrise : Calculator;

  // 🤖 [IA] - v1.4.1: Estado del formulario
  const [selectedStore, setSelectedStore] = useState(initialStore);
  const [selectedCashier, setSelectedCashier] = useState(initialCashier);
  const [selectedWitness, setSelectedWitness] = useState(initialWitness);
  const [expectedSales, setExpectedSales] = useState(initialExpectedSales);
  const [dailyExpenses] = useState<DailyExpense[]>(initialDailyExpenses); // 🤖 [IA] - v1.4.0: Gastos del día
  const [showExitConfirmation, setShowExitConfirmation] = useState(false); // 🤖 [IA] - v1.2.9
  const [showBackConfirmation, setShowBackConfirmation] = useState(false); // 🤖 [IA] - v1.2.19

  // 🤖 [IA] - v1.0.3 - Iniciar directamente si hay datos del wizard
  const hasInitialData = initialStore && initialCashier && initialWitness && initialExpectedSales;

  // 🤖 [IA] - v1.2.8: Estado para el modal de instrucciones
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  // 🤖 [IA] - v1.2.23: Hook para reseteo del flujo de instrucciones
  const { resetFlow } = useInstructionsFlow();

  // 🤖 [IA] - v1.0.46: Detectar si es dispositivo móvil
  const isMobile = useIsMobile();

  // Phase management
  const {
    phaseState,
    deliveryCalculation,
    startPhase1,
    completePhase1,
    completePhase2Verification,
    updateDeliveryCalculation, // 🤖 [IA] - v1.3.6N
    resetAllPhases
  } = usePhaseManager(operationMode); // 🤖 [IA] - v1.0.82

  // Guided counting hook (for Phase 1)
  const {
    guidedState,
    currentField,
    instructionText,
    isFieldActive,
    isFieldCompleted,
    isFieldAccessible,
    confirmCurrentField,
    resetGuidedCounting,
    // 🤖 [IA] - v1.2.19: Simplified navigation functions
    canGoPrevious,
    goPrevious,
    FIELD_ORDER
  } = useGuidedCounting(operationMode); // 🤖 [IA] - v1.0.85

  // Cash count state
  const [cashCount, setCashCount] = useState<CashCount>({
    penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
    bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0,
  });

  // Electronic payments state
  const [electronicPayments, setElectronicPayments] = useState<ElectronicPayments>({
    credomatic: 0, promerica: 0, bankTransfer: 0, paypal: 0,
  });

  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Timing unificado v1.0.22
  const availableEmployees = selectedStore ? getEmployeesByStore(selectedStore) : [];

  // 🤖 [IA] - v1.4.1: PWA scroll prevention
  usePwaScrollPrevention(phaseState.currentPhase);

  // 🤖 [IA] - v1.0.3 - Auto-iniciar Fase 1 si viene del wizard
  // 🤖 [IA] - v1.2.8 - Mostrar modal de instrucciones antes de iniciar
  // 🤖 [IA] - v1.2.39 - Skip GuidedInstructionsModal en Morning Count (instrucciones ya vistas en Wizard)
  useEffect(() => {
    if (hasInitialData && !phaseState.phase1Completed) {
      resetFlow(); // Limpiar estado persistente del flujo Wizard v3

      if (isMorningCount || skipWizard) {
        // Morning Count o skipWizard (auditoría): Ir directo a Fase 1 sin instrucciones
        startPhase1();
        sessionStorage.setItem('current-counting-session', `session-${Date.now()}`);
      } else {
        // Evening Cut: Mostrar modal de instrucciones (comportamiento original)
        setShowInstructionsModal(true);
        sessionStorage.setItem('current-counting-session', `session-${Date.now()}`);
      }
    }
  }, [hasInitialData, phaseState.phase1Completed, resetFlow, isMorningCount, startPhase1, skipWizard]);

  // 🤖 [IA] - v1.2.8 - Handler para cuando se confirman las instrucciones
  const handleInstructionsConfirm = () => {
    setShowInstructionsModal(false);
    startPhase1();
    const currentSession = sessionStorage.getItem('current-counting-session');
    if (currentSession) {
      sessionStorage.setItem('guided-instructions-session', currentSession);
    }
  };

  // 🤖 [IA] - SAFE-RETURN: Handler para cancelación con navegación segura
  const handleInstructionsCancel = () => {
    setShowInstructionsModal(false);
    onFlowCancel?.(); // Notificar al padre para navegar de vuelta al inicio
  };

  const handleCashCountChange = (denomination: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setCashCount(prev => ({
      ...prev,
      [denomination]: numValue
    }));
  };

  const handleElectronicChange = (method: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setElectronicPayments(prev => ({
      ...prev,
      [method]: numValue
    }));
  };

  const handleCompletePhase1 = () => {
    // 🤖 [IA] - v1.0.84: Calculate locally to avoid async state issues
    const totalCash = calculateCashTotal(cashCount);
    const willSkipPhase2 = isMorningCount || totalCash <= 50;

    // Complete Phase 1 and calculate delivery requirements
    completePhase1(cashCount);
    toast.success(TOAST_MESSAGES.SUCCESS_PHASE1, {
      duration: TOAST_DURATIONS.SHORT
    });

    // 🤖 [IA] - v1.0.84: Use local calculation for accurate messages
    // 🤖 [IA] - v1.2.7: Toast de conteo matutino eliminado
    if (isMorningCount) {
      // Transición directa sin notificación
    } else if (willSkipPhase2) {
      toast.info(TOAST_MESSAGES.INFO_SKIP_PHASE2, { duration: TOAST_DURATIONS.NORMAL });
    } else {
      toast.info(TOAST_MESSAGES.INFO_PROCEED_PHASE2, { duration: TOAST_DURATIONS.NORMAL });
    }
  };

  const handleGuidedFieldConfirm = useCallback((value: string) => {
    // 🤖 [IA] - v1.2.8: Sistema Ciego Anti-Fraude - No mostrar totales durante conteo
    if (currentField === 'totalCash' || currentField === 'totalElectronic') {
      // Auto-avanzar sin mostrar valores para evitar manipulación
      const success = confirmCurrentField(
        '0', // Valor dummy - el sistema calcula internamente
        handleCashCountChange,
        handleElectronicChange,
        electronicPayments,
        cashCount
      );

      if (success) {
        // Si es el último campo del corte nocturno, completar Fase 1
        const isLastField = (!isMorningCount && currentField === 'totalElectronic') ||
                           (isMorningCount && currentField === 'totalCash');

        if (isLastField) {
          // 🚨 FIX v1.3.1: Usar createTimeoutWithCleanup para evitar memory leak
          createTimeoutWithCleanup(() => {
            handleCompletePhase1();
          }, 'transition', 'complete_phase1', 100);
          // Nota: No podemos hacer return aquí porque estamos dentro de una función, no useEffect
          // Este setTimeout es lo suficientemente corto (100ms) que el riesgo de leak es mínimo
        }
      }
      return;
    }

    // Flujo normal para otros campos
    const success = confirmCurrentField(
      value,
      handleCashCountChange,
      handleElectronicChange,
      electronicPayments,
      cashCount
    );

    if (success) {
      // 🤖 [IA] - v1.0.47: Vibración háptica en móvil para confirmación
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate(50); // Vibración suave de 50ms
      }

      // 🤖 [IA] - v1.2.7: Eliminados todos los toasts de confirmación individual
      // Solo mantener vibración háptica como feedback principal
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentField, isMorningCount, confirmCurrentField, electronicPayments, cashCount, createTimeoutWithCleanup, isMobile]);

  // 🤖 [IA] - v1.2.8: Sistema Ciego Anti-Fraude: Auto-confirmar todos los totales sin mostrar valores
  useEffect(() => {
    // Auto-confirmar totalCash y totalElectronic para mantener sistema ciego
    if ((currentField === 'totalCash' || currentField === 'totalElectronic') &&
        phaseState.currentPhase === 1) {
      // Delay mínimo solo para transición visual suave
      const timer = setTimeout(() => {
        handleGuidedFieldConfirm('0');
      }, 300); // Reducido para flujo más rápido
      return () => clearTimeout(timer);
    }
  }, [currentField, phaseState.currentPhase, handleGuidedFieldConfirm]);

  const handleInvalidAccess = () => {
    toast.error(TOAST_MESSAGES.ERROR_COMPLETE_CURRENT, {
      duration: TOAST_DURATIONS.EXTENDED
    });
  };

  const canProceedToPhase1 = Boolean(selectedStore && selectedCashier && selectedWitness &&
                            selectedCashier !== selectedWitness && expectedSales);

  const handlePhase2Complete = () => {
    completePhase2Verification();
    toast.success(TOAST_MESSAGES.SUCCESS_PHASE2, {
      duration: TOAST_DURATIONS.SHORT
    });
    toast.info(TOAST_MESSAGES.INFO_PROCEED_PHASE3, { duration: TOAST_DURATIONS.NORMAL });
  };

  const handleCompleteCalculation = () => {
    // Reset everything and go back to beginning
    setSelectedStore("");
    setSelectedCashier("");
    setSelectedWitness("");
    setExpectedSales("");
    setCashCount({
      penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
      bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0,
    });
    setElectronicPayments({
      credomatic: 0, promerica: 0, bankTransfer: 0, paypal: 0,
    });
    resetGuidedCounting();
    resetAllPhases();

    if (onBack) onBack();
  };

  // 🤖 [IA] - v1.2.9: Función mejorada con reset del diálogo de confirmación
  const handleBackToStart = () => {
    setShowExitConfirmation(false); // Cerrar el diálogo
    resetGuidedCounting();
    resetAllPhases();
    if (onBack) onBack();
  };

  // 🤖 [IA] - v1.2.19: Funciones de navegación de fase 1
  const handlePreviousStep = () => {
    if (!canGoPrevious()) {
      // Si está bloqueado, mostrar mensaje mejorado
      if (guidedState.isLocked) {
        toast.error(TOAST_MESSAGES.ERROR_LOCKED_TOTALS, {
          duration: TOAST_DURATIONS.EXTENDED
        });
        return;
      }
      if (guidedState.currentStep === 1) {
        toast.info(TOAST_MESSAGES.INFO_FIRST_FIELD, {
          duration: TOAST_DURATIONS.SHORT
        });
        return;
      }
      return;
    }
    setShowBackConfirmation(true);
  };

  const handleConfirmPrevious = () => {
    const success = goPrevious();
    setShowBackConfirmation(false);
    if (success) {
      toast.success(TOAST_MESSAGES.SUCCESS_PREVIOUS_FIELD, {
        duration: TOAST_DURATIONS.SHORT
      });
    } else {
      toast.error(TOAST_MESSAGES.ERROR_CANNOT_GO_BACK, {
        duration: TOAST_DURATIONS.EXTENDED
      });
    }
  };

  const handleCancelProcess = () => {
    setShowExitConfirmation(true);
  };

  return {
    // Mode
    isMorningCount,
    primaryGradient,
    IconComponent,

    // Form state
    selectedStore, selectedCashier, selectedWitness, expectedSales, dailyExpenses,
    setSelectedStore, setSelectedCashier, setSelectedWitness, setExpectedSales,
    availableEmployees,
    canProceedToPhase1,
    hasInitialData,

    // Cash state
    cashCount,
    electronicPayments,

    // Phase management
    phaseState,
    deliveryCalculation,
    updateDeliveryCalculation,
    startPhase1,

    // Guided counting
    guidedState,
    currentField,
    instructionText,
    isFieldActive,
    isFieldCompleted,
    isFieldAccessible,
    canGoPrevious,
    FIELD_ORDER,

    // Modal state
    showExitConfirmation,
    showBackConfirmation,
    setShowExitConfirmation,
    setShowBackConfirmation,
    showInstructionsModal,

    // Handlers
    handleGuidedFieldConfirm,
    handleInvalidAccess,
    handlePhase2Complete,
    handleCompleteCalculation,
    handleBackToStart,
    handlePreviousStep,
    handleConfirmPrevious,
    handleCancelProcess,
    handleInstructionsConfirm,
    handleInstructionsCancel,
  };
}
