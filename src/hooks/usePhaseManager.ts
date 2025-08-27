import { useState, useCallback } from 'react';
import { PhaseState, Phase2State } from '@/types/phases';
import { CashCount } from '@/types/cash';
import { calculateCashValue, calculateDeliveryDistribution } from '@/utils/deliveryCalculation';
import { OperationMode } from '@/types/operation-mode'; // 🤖 [IA] - v1.0.82

const INITIAL_PHASE_STATE: PhaseState = {
  currentPhase: 1,
  phase1Completed: false,
  phase2Completed: false,
  totalCashFromPhase1: 0,
  shouldSkipPhase2: false
};

const INITIAL_PHASE2_STATE: Phase2State = {
  currentSection: 'delivery',
  deliveryStep: 0,
  verificationStep: 0,
  deliveryCompleted: false,
  verificationCompleted: false,
  toDeliver: {
    penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
    bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0
  },
  toKeep: {
    penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
    bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0
  },
  deliveryProgress: {},
  verificationProgress: {}
};

export function usePhaseManager(operationMode?: OperationMode) { // 🤖 [IA] - v1.0.82
  const [phaseState, setPhaseState] = useState<PhaseState>(INITIAL_PHASE_STATE);
  const [phase2State, setPhase2State] = useState<Phase2State>(INITIAL_PHASE2_STATE);
  const [deliveryCalculation, setDeliveryCalculation] = useState<any>(null);

  const startPhase1 = useCallback(() => {
    setPhaseState(prev => ({
      ...prev,
      phase1Completed: true // This allows showing the counting UI
    }));
  }, []);

  const completePhase1 = useCallback((cashCount: CashCount) => {
    const totalCash = calculateCashValue(cashCount);
    // 🤖 [IA] - v1.0.82: Morning count always skips Phase 2
    const shouldSkip = (operationMode === OperationMode.CASH_COUNT) || (totalCash <= 50);
    
    // 🤖 [IA] - v1.0.83: Only calculate distribution if NOT skipping Phase 2
    let calculation = null;
    if (!shouldSkip) {
      calculation = calculateDeliveryDistribution(totalCash, cashCount);
      setDeliveryCalculation(calculation);
    }
    
    setPhaseState(prev => ({
      ...prev,
      phase1Completed: true,
      totalCashFromPhase1: totalCash,
      shouldSkipPhase2: shouldSkip,
      currentPhase: shouldSkip ? 3 : 2
    }));

    if (!shouldSkip && calculation) {
      setPhase2State(prev => ({
        ...prev,
        toDeliver: calculation.denominationsToDeliver,
        toKeep: calculation.denominationsToKeep
      }));
    }
  }, [operationMode]); // 🤖 [IA] - v1.0.82: Added operationMode dependency

  const advancePhase2Section = useCallback(() => {
    setPhase2State(prev => {
      if (prev.currentSection === 'delivery' && prev.deliveryCompleted) {
        return {
          ...prev,
          currentSection: 'verification'
        };
      }
      return prev;
    });
  }, []);

  const completePhase2Delivery = useCallback(() => {
    setPhase2State(prev => ({
      ...prev,
      deliveryCompleted: true
    }));
  }, []);

  const completePhase2Verification = useCallback(() => {
    setPhase2State(prev => ({
      ...prev,
      verificationCompleted: true
    }));
    
    setPhaseState(prev => ({
      ...prev,
      phase2Completed: true,
      currentPhase: 3
    }));
  }, []);

  const resetAllPhases = useCallback(() => {
    setPhaseState(INITIAL_PHASE_STATE);
    setPhase2State(INITIAL_PHASE2_STATE);
    setDeliveryCalculation(null);
  }, []);

  const updateDeliveryProgress = useCallback((stepKey: string, completed: boolean) => {
    setPhase2State(prev => ({
      ...prev,
      deliveryProgress: {
        ...prev.deliveryProgress,
        [stepKey]: completed
      }
    }));
  }, []);

  const updateVerificationProgress = useCallback((stepKey: string, completed: boolean) => {
    setPhase2State(prev => ({
      ...prev,
      verificationProgress: {
        ...prev.verificationProgress,
        [stepKey]: completed
      }
    }));
  }, []);

  const canAdvanceToPhase3 = useCallback(() => {
    if (phaseState.shouldSkipPhase2) {
      return phaseState.phase1Completed;
    }
    return phaseState.phase1Completed && phaseState.phase2Completed;
  }, [phaseState]);

  return {
    phaseState,
    phase2State,
    deliveryCalculation,
    startPhase1,
    completePhase1,
    advancePhase2Section,
    completePhase2Delivery,
    completePhase2Verification,
    resetAllPhases,
    updateDeliveryProgress,
    updateVerificationProgress,
    canAdvanceToPhase3
  };
}