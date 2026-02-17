// 🤖 [IA] - ORDEN #075: Controller hook - orquesta estado + handlers del wizard
import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { TOAST_DURATIONS, TOAST_MESSAGES } from '@/config/toast';
import { useWizardNavigation } from '@/hooks/useWizardNavigation';
import { useRulesFlow } from '@/hooks/useRulesFlow';
import { useTimingConfig } from '@/hooks/useTimingConfig';
import { useInputValidation } from '@/hooks/useInputValidation';
import { useSucursales } from '@/hooks/useSucursales';
import { useEmpleadosSucursal } from '@/hooks/useEmpleadosSucursal';
import { calculateProgress } from '@/lib/initial-wizard/wizardRules';
import type { InitialWizardModalProps, InitialWizardControllerReturn } from '@/types/initialWizard';

const normalizeText = (value: string): string => (
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
);

export function useInitialWizardController(
  props: InitialWizardModalProps
): InitialWizardControllerReturn {
  const { isOpen, onClose, onComplete } = props;

  // ── Hooks existentes (consumidos, NO reemplazados) ──
  const {
    currentStep,
    totalSteps,
    wizardData,
    canGoNext,
    canGoPrevious,
    isCompleted,
    goNext,
    goPrevious,
    updateWizardData,
    resetWizard,
    getStepTitle,
    getNavigationState,
  } = useWizardNavigation();

  const {
    state: rulesFlowState,
    initializeFlow,
    acknowledgeRule,
    isFlowCompleted,
    getRuleState,
    canInteractWithRule,
    resetFlow,
  } = useRulesFlow();

  const { createTimeoutWithCleanup } = useTimingConfig();
  const { validateInput, getPattern, getInputMode } = useInputValidation();
  const { sucursales } = useSucursales();

  // ── State local ──
  const [hasVibratedForError, setHasVibratedForError] = useState(false);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // ── Effects ──

  // Inicializar flujo de reglas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      initializeFlow();
    }
  }, [isOpen, initializeFlow]);

  // Cleanup timeouts en paso 1
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    if (currentStep === 1) {
      cleanup = createTimeoutWithCleanup(() => {}, 'toast', 'wizard_pulse_animation');
    }
    return () => {
      cleanup?.();
    };
  }, [currentStep, createTimeoutWithCleanup]);

  // Haptic feedback
  useEffect(() => {
    const rulesCompleted = isFlowCompleted();
    const shouldVibrate = !rulesCompleted && currentStep === 1 && !hasVibratedForError && 'vibrate' in navigator;

    if (shouldVibrate) {
      navigator.vibrate(50);
      setHasVibratedForError(true);
    } else if (rulesCompleted && hasVibratedForError) {
      setHasVibratedForError(false);
    }
  }, [isFlowCompleted, currentStep, hasVibratedForError]);

  // ── Computed ──
  const availableStores = useMemo(() => (
    sucursales.map((sucursal) => ({
      id: sucursal.id,
      name: sucursal.nombre,
      code: sucursal.codigo,
    }))
  ), [sucursales]);

  const selectedSucursalId = useMemo(() => {
    if (!wizardData.selectedStore) return null;

    const byId = availableStores.find((store) => store.id === wizardData.selectedStore);
    if (byId) return byId.id;

    const normalizedSelected = normalizeText(wizardData.selectedStore);

    const byName = availableStores.find((store) => normalizeText(store.name) === normalizedSelected);
    if (byName) return byName.id;

    const byCode = availableStores.find((store) => normalizeText(store.code ?? '') === normalizedSelected);
    return byCode?.id ?? null;
  }, [wizardData.selectedStore, availableStores]);

  const { empleados: empleadosSucursal } = useEmpleadosSucursal(selectedSucursalId);

  const availableEmployees = useMemo(() => (
    empleadosSucursal.map((empleado) => ({
      id: empleado.id,
      name: empleado.nombre,
      role: empleado.cargo,
      stores: selectedSucursalId ? [selectedSucursalId] : [],
    }))
  ), [empleadosSucursal, selectedSucursalId]);

  const progressValue = calculateProgress(wizardData, isFlowCompleted());

  // ── Handlers ──
  const handleRuleAcknowledge = useCallback((ruleId: string, index: number) => {
    acknowledgeRule(ruleId, index);
  }, [acknowledgeRule]);

  const handleNext = useCallback(() => {
    if (currentStep === 1 && !isFlowCompleted()) {
      toast.error(TOAST_MESSAGES.ERROR_REVIEW_RULES, {
        duration: TOAST_DURATIONS.EXTENDED,
      });
      return;
    }

    const success = goNext(isFlowCompleted());
    if (!success) {
      toast.error(TOAST_MESSAGES.ERROR_COMPLETE_FIELDS, {
        duration: TOAST_DURATIONS.EXTENDED,
      });
    }
  }, [currentStep, isFlowCompleted, goNext]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setShowBackConfirmation(true);
    }
  }, [currentStep]);

  const handleComplete = useCallback(() => {
    const wizardState = getNavigationState(isFlowCompleted());
    if (wizardState.isCompleted) {
      onComplete({
        selectedStore: wizardData.selectedStore,
        selectedCashier: wizardData.selectedCashier,
        selectedWitness: wizardData.selectedWitness,
        expectedSales: wizardData.expectedSales,
        dailyExpenses: wizardData.dailyExpenses || [],
      });
      resetWizard();
    }
  }, [getNavigationState, isFlowCompleted, onComplete, wizardData, resetWizard]);

  const handleCancelRequest = useCallback(() => {
    setShowCancelConfirmation(true);
  }, []);

  const handleConfirmedClose = useCallback(() => {
    resetWizard();
    resetFlow();
    setShowCancelConfirmation(false);
    onClose();
  }, [resetWizard, resetFlow, onClose]);

  const handleCancelClose = useCallback(() => {
    setShowCancelConfirmation(false);
  }, []);

  return {
    currentStep,
    totalSteps,
    wizardData,
    canGoNext,
    canGoPrevious,
    isCompleted,
    updateWizardData,
    availableStores,
    availableEmployees,
    rulesFlowState,
    isFlowCompleted,
    getRuleState,
    canInteractWithRule,
    showBackConfirmation,
    setShowBackConfirmation,
    showCancelConfirmation,
    setShowCancelConfirmation,
    handleRuleAcknowledge,
    handleNext,
    handlePrevious,
    handleComplete,
    handleCancelRequest,
    handleConfirmedClose,
    handleCancelClose,
    getNavigationState,
    progressValue,
    // Passthrough for Step 5
    validateInput,
    getPattern,
    getInputMode,
    // For back confirmation modal
    goPrevious,
  };
}
