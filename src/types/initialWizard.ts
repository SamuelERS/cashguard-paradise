// 🤖 [IA] - ORDEN #075: Types para desmonolitización InitialWizardModal
import type { DailyExpense } from '@/types/expenses';
import type { WizardData } from '@/hooks/useWizardNavigation';

// ────────────────────────────────────────────────────────────────
// Props del componente principal
// ────────────────────────────────────────────────────────────────

export interface InitialWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    selectedStore: string;
    selectedCashier: string;
    selectedWitness: string;
    expectedSales: string;
    dailyExpenses: DailyExpense[];
  }) => void;
  /** 🤖 [IA] - DACC-CIERRE: ID de sucursal para preselección desde sesión activa Supabase */
  initialSucursalId?: string | null;
  /** [IA] - CASO-SANN: Indica si se detectó sesión activa en Supabase para mostrar banner informativo */
  hasActiveSession?: boolean;
  /** [IA] - CASO-SANN-R2: Callback cuando usuario elige reanudar sesión activa */
  onResumeSession?: () => void;
  /** [IA] - CASO-SANN-R2: Callback cuando usuario elige abortar sesión activa */
  onAbortSession?: (motivo: string) => void | Promise<void>;
  /** [IA] - R3-B2: Info enriquecida de sesión activa para mostrar identificador en Step 5 */
  activeSessionInfo?: {
    correlativo: string | null;
    createdAt: string | null;
    cajero: string | null;
    estado: string | null;
  } | null;
  /** [IA] - BRANCH-ISOLATION: Sucursal dueña de la sesión activa detectada */
  activeSessionSucursalId?: string | null;
  /** [IA] - REGRESION-RCA: Revalida sesión activa al entrar a SICAR para la sucursal elegida */
  onCheckActiveSessionForStore?: (sucursalId: string) => void | Promise<void>;
  /** Feedback visible dentro del modal cuando la finalización se bloquea */
  completionError?: string | null;
}

// ────────────────────────────────────────────────────────────────
// Props base para step components
// ────────────────────────────────────────────────────────────────

export interface WizardStepProps {
  wizardData: WizardData;
  updateWizardData: (updates: Partial<WizardData>) => void;
}

// ────────────────────────────────────────────────────────────────
// Props específicas por step
// ────────────────────────────────────────────────────────────────

export interface Step1Props extends WizardStepProps {
  rulesFlowState: { currentRuleIndex: number };
  getRuleState: (ruleId: string) => { acknowledged: boolean; isActive: boolean };
  canInteractWithRule: (index: number) => boolean;
  handleRuleAcknowledge: (ruleId: string, index: number) => void;
}

export interface Step2Props extends WizardStepProps {
  availableStores: Array<{ id: string; name: string }>;
}

export interface Step3Props extends WizardStepProps {
  availableEmployees: Array<{ id: string; name: string; role: string; stores: string[] }>;
}

export interface Step4Props extends WizardStepProps {
  selectedCashier: string;
  availableEmployees: Array<{ id: string; name: string; role: string; stores: string[] }>;
}

export interface Step5Props extends WizardStepProps {
  validateInput: (value: string, type: string) => { isValid: boolean; cleanValue: string };
  getPattern: (type: string) => string;
  getInputMode: (type: string) => 'numeric' | 'decimal' | 'text';
  handleNext: () => void;
  canGoNext: boolean;
  currentStep: number;
  totalSteps: number;
  availableStores: Array<{ id: string; name: string }>;
  availableEmployees: Array<{ id: string; name: string; role: string; stores: string[] }>;
  // [IA] - CASO-SANN-R2: Props para panel de sesión activa (bloqueo anti-fraude en Step 5)
  hasActiveSession?: boolean;
  onResumeSession?: () => void;
  onAbortSession?: (motivo: string) => void | Promise<void>;
  /** [IA] - R3-B2: Info enriquecida de sesión activa para mostrar identificador en Step 5 */
  activeSessionInfo?: {
    correlativo: string | null;
    createdAt: string | null;
    cajero: string | null;
    estado: string | null;
  } | null;
  /** [IA] - BRANCH-ISOLATION: Sucursal dueña de la sesión activa detectada */
  activeSessionSucursalId?: string | null;
}

// ────────────────────────────────────────────────────────────────
// Return type del controller hook
// ────────────────────────────────────────────────────────────────

export interface InitialWizardControllerReturn {
  // State from useWizardNavigation
  currentStep: number;
  totalSteps: number;
  wizardData: WizardData;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isCompleted: boolean;
  updateWizardData: (updates: Partial<WizardData>) => void;
  availableStores: Array<{ id: string; name: string; address: string; phone: string; schedule: string }>;
  availableEmployees: Array<{ id: string; name: string; role: string; stores: string[] }>;

  // Rules flow
  rulesFlowState: { currentRuleIndex: number };
  isFlowCompleted: () => boolean;
  getRuleState: (ruleId: string) => { acknowledged: boolean; isActive: boolean };
  canInteractWithRule: (index: number) => boolean;

  // Confirmations
  showBackConfirmation: boolean;
  setShowBackConfirmation: (show: boolean) => void;
  showCancelConfirmation: boolean;
  setShowCancelConfirmation: (show: boolean) => void;

  // Handlers
  handleRuleAcknowledge: (ruleId: string, index: number) => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleComplete: () => void;
  handleCancelRequest: () => void;
  handleConfirmedClose: () => void;
  handleCancelClose: () => void;

  // Navigation
  getNavigationState: (rulesCompleted?: boolean) => {
    currentStep: number;
    totalSteps: number;
    data: WizardData;
    canGoNext: boolean;
    canGoPrevious: boolean;
    isCompleted: boolean;
  };

  // Progress
  progressValue: number;

  // Passthrough for Step 5 (from useInputValidation)
  validateInput: (value: string, type: string) => { isValid: boolean; cleanValue: string };
  getPattern: (type: string) => string;
  getInputMode: (type: string) => 'numeric' | 'decimal' | 'text';

  // For back confirmation modal
  goPrevious: () => boolean;
}
