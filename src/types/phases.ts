import { CashCount } from './cash';

export interface PhaseState {
  currentPhase: 1 | 2 | 3;
  phase1Completed: boolean;
  phase2Completed: boolean;
  totalCashFromPhase1: number;
  shouldSkipPhase2: boolean; // true if total ≤ $50
}

export interface Phase2State {
  currentSection: 'delivery' | 'verification';
  deliveryStep: number;
  verificationStep: number;
  deliveryCompleted: boolean;
  verificationCompleted: boolean;
  toDeliver: CashCount;
  toKeep: CashCount;
  deliveryProgress: Record<string, boolean>;
  verificationProgress: Record<string, boolean>;
}

export interface DeliveryCalculation {
  amountToDeliver: number;
  denominationsToDeliver: CashCount;
  denominationsToKeep: CashCount;
  deliverySteps: Array<{
    key: keyof CashCount;
    quantity: number;
    label: string;
    value: number;
  }>;
  verificationSteps: Array<{
    key: keyof CashCount;
    quantity: number;
    label: string;
    value: number;
  }>;
}