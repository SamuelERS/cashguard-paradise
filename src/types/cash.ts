// 🤖 [IA] - v1.3.0: MÓDULO 1 - Import tipos verificación ciega
import type { VerificationAttempt, VerificationBehavior } from './verification';

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  schedule: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  stores: string[];
}

export interface CashCount {
  // Coins (centavos)
  penny: number;      // 1¢
  nickel: number;     // 5¢
  dime: number;       // 10¢
  quarter: number;    // 25¢
  dollarCoin: number; // $1 coin

  // Bills
  bill1: number;      // $1
  bill5: number;      // $5
  bill10: number;     // $10
  bill20: number;     // $20
  bill50: number;     // $50
  bill100: number;    // $100
}

export interface ElectronicPayments {
  credomatic: number;
  promerica: number;
  bankTransfer: number;
  paypal: number;
}

export interface CashReport {
  id: string;
  timestamp: string;
  store: Store;
  cashier: Employee;
  witness: Employee;
  
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  expectedSales: number;
  
  // Calculated values
  totalCash: number;
  totalElectronic: number;
  totalGeneral: number;
  difference: number;
  
  // Change calculation
  changeForTomorrow: CashCount;
  changeTotal: number;
  
  // Status
  isLocked: boolean;
  hasAlert: boolean;
  alertReason?: string;
  
  // Signatures
  cashierSignature: string;
  witnessSignature: string;

  // 🤖 [IA] - v1.3.0: MÓDULO 1 - Verificación Blind Count con Triple Intento (NUEVO)
  /**
   * Comportamiento de verificación consolidado
   *
   * @remarks
   * Incluye métricas agregadas + historial completo de intentos.
   * Generado por useBlindVerification hook en Phase 2 Verification.
   */
  verificationBehavior?: {
    totalAttempts: number;
    firstAttemptSuccessRate: number;        // Porcentaje (ej: 87.5)
    secondAttemptRecoveries: number;
    forcedOverrides: string[];              // ["nickel", "dime"]
    criticalInconsistencies: string[];      // ["quarter"]
    severeInconsistencies: string[];        // ["penny"]
    attemptsLog: VerificationAttempt[];     // Historial completo
  };

  /**
   * Flags de alerta para renderizado condicional en UI
   */
  hasVerificationWarnings: boolean;         // true si secondAttemptRecoveries > 0
  hasVerificationCritical: boolean;         // true si criticalInconsistencies > 0
  hasVerificationSevere: boolean;           // true si severeInconsistencies > 0

  /**
   * Política ZERO TOLERANCIA: Cualquier discrepancia se reporta ($0.01+)
   */
  hasAnyDiscrepancy: boolean;               // true si difference !== 0
  discrepancyAmount: number;                // Monto exacto (puede ser $0.01)
}

export interface AlertThresholds {
  // 🤖 [IA] - v1.3.0: MÓDULO 1 - Política ZERO TOLERANCIA (MODIFICADO de 3.00 → 0.01)
  /**
   * Umbral para faltante significativo
   *
   * @remarks
   * Cambiado de estándar industria ($3-5) a política ZERO TOLERANCIA.
   * Cualquier discrepancia ($0.01 a $10,000) se documenta y reporta.
   *
   * @see Plan_Vuelto_Ciego.md - Sección "Variance Tolerance Industry Standards"
   * @default 0.01 (UN CENTAVO)
   */
  significantShortage: number;
  patternDetection: number;    // Default: 3 consecutive shortages
}

export const DENOMINATIONS = {
  COINS: {
    penny: { value: 0.01, name: "1¢ centavo" },
    nickel: { value: 0.05, name: "5¢ centavos" },
    dime: { value: 0.10, name: "10¢ centavos" },
    quarter: { value: 0.25, name: "25¢ centavos" },
    dollarCoin: { value: 1.00, name: "$1 moneda" }
  },
  BILLS: {
    bill1: { value: 1, name: "$1" },
    bill5: { value: 5, name: "$5" },
    bill10: { value: 10, name: "$10" },
    bill20: { value: 20, name: "$20" },
    bill50: { value: 50, name: "$50" },
    bill100: { value: 100, name: "$100" }
  }
} as const;