/**
 * 🤖 [IA] - v1.4.1: Types para MorningVerification (ORDEN #074)
 * Extraídos del monolito MorningVerification.tsx para desmonolitización
 *
 * @description
 * Tipos compartidos entre mvRules, mvFormatters, mvSelectors,
 * useMorningVerificationController y MorningVerificationView.
 */
import type { CashCount, Store, Employee } from './cash';

// ────────────────────────────────────────────────────────────────
// Props del componente (migradas desde monolito líneas 20-27)
// ────────────────────────────────────────────────────────────────

export interface MorningVerificationProps {
  storeId: string;
  cashierId: string;   // Cajero entrante
  witnessId: string;   // Cajero saliente
  storeName?: string;
  cashierName?: string;
  witnessName?: string;
  cashCount: CashCount;
  onBack: () => void;
  onComplete: () => void;
}

// ────────────────────────────────────────────────────────────────
// Datos de verificación (migrados desde monolito líneas 29-37)
// ────────────────────────────────────────────────────────────────

export interface VerificationData {
  totalCash: number;
  expectedAmount: number;
  difference: number;
  isCorrect: boolean;
  hasShortage: boolean;
  hasExcess: boolean;
  timestamp: string;
}

// ────────────────────────────────────────────────────────────────
// Actores resueltos (store + employees lookup)
// ────────────────────────────────────────────────────────────────

export interface ResolvedActors {
  store: Store | undefined;
  cashierIn: Employee | undefined;
  cashierOut: Employee | undefined;
}

// ────────────────────────────────────────────────────────────────
// Parámetros para generación de reporte WhatsApp
// ────────────────────────────────────────────────────────────────

export interface MorningReportParams {
  verificationData: VerificationData;
  store: Store | undefined;
  cashierIn: Employee | undefined;
  cashierOut: Employee | undefined;
  cashCount: CashCount;
  dataHash: string;
}

// ────────────────────────────────────────────────────────────────
// Contrato tipado del controller hook
// ────────────────────────────────────────────────────────────────

export interface MorningVerificationControllerReturn {
  // State
  verificationData: VerificationData | null;
  reportSent: boolean;
  whatsappOpened: boolean;
  popupBlocked: boolean;
  showWhatsAppInstructions: boolean;

  // Resolved actors
  store: Store | undefined;
  cashierIn: Employee | undefined;
  cashierOut: Employee | undefined;

  // Derived
  isLoading: boolean;
  report: string;

  // Handlers
  handleWhatsAppSend: () => Promise<void>;
  handleConfirmSent: () => void;
  handleCopyToClipboard: () => Promise<void>;
  handleShare: () => Promise<void>;
  handlePrintableReport: () => void;
  handleBack: () => void;
  handleComplete: () => void;

  // Modal control
  setShowWhatsAppInstructions: (show: boolean) => void;
}
