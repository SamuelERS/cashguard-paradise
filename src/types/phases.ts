import { CashCount } from './cash';
// 🤖 [IA] - v1.3.0: MÓDULO 1 - Import tipos verificación ciega
import type { VerificationBehavior } from './verification';

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
  // 🤖 [IA] - v1.3.0: MÓDULO 1 - Campo para tracking blind verification (triple intento)
  verificationBehavior?: VerificationBehavior;
}