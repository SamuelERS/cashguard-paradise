// 🤖 [IA] - v1.3.6AD2: Agregado campo amountRemaining (monto REAL post-verificación ajustado)
// Previous: v1.3.0 - MÓDULO 1 - Import tipos verificación ciega
import { CashCount } from './cash';
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
  // 🤖 [IA] - v1.3.6AD2: Campo para monto REAL post-verificación (ajustado con valores ACEPTADOS)
  // Justificación: denominationsToKeep puede cambiar si verificación acepta valores diferentes (override, promedio)
  // Ejemplo: 75 esperado → 70 aceptado = $50.00 original → $49.95 ajustado
  // Uso: CashCalculation reporte sección "LO QUE QUEDÓ EN CAJA" debe usar este valor si existe
  amountRemaining?: number;
  /** Progreso live de entrega por denominación confirmada en fase 2. */
  liveDeliveryProgress?: Partial<CashCount>;
  /** Historial de eventos de entrega confirmados (append-only en sesión). */
  liveDeliveryEvents?: Array<{
    stepKey: keyof CashCount;
    quantity: number;
    subtotal: number;
    capturedAt: string;
  }>;
  /** Total acumulado entregado en vivo (suma de subtotales confirmados). */
  liveDeliveryTotal?: number;
}
