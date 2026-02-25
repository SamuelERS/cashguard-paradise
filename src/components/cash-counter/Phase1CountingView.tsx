/**
 * 🤖 [IA] - v1.4.1: Phase1CountingView Component
 * Extraído de CashCounter.tsx para desmonolitización
 *
 * @description
 * Vista de conteo guiado (Phase 1). Renderiza secciones de monedas, billetes
 * y pagos electrónicos según el campo activo, con modales de confirmación
 * para salida y retroceso.
 */
import { motion } from "framer-motion";
import { GuidedProgressIndicator } from "@/components/ui/GuidedProgressIndicator";
import { GuidedCoinSection } from "@/components/cash-counting/GuidedCoinSection";
import { GuidedBillSection } from "@/components/cash-counting/GuidedBillSection";
import { GuidedElectronicInputSection } from "@/components/cash-counting/GuidedElectronicInputSection";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { AbortCorteModal } from "@/components/ui/abort-corte-modal";
import type { CashCount, ElectronicPayments } from "@/types/cash";
import type { GuidedCountingState } from "@/hooks/useGuidedCounting";

interface Phase1CountingViewProps {
  // Estado del conteo
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  guidedState: GuidedCountingState;
  currentField: string;
  instructionText: string;
  FIELD_ORDER: string[];

  // Configuración visual
  isMorningCount: boolean;
  primaryGradient: string;
  IconComponent: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

  // Predicados de campo
  isFieldActive: (field: string) => boolean;
  isFieldCompleted: (field: string) => boolean;
  isFieldAccessible: (field: string) => boolean;
  canGoPrevious: boolean;

  // Modales de confirmación
  showExitConfirmation: boolean;
  showBackConfirmation: boolean;
  onShowExitConfirmationChange: (v: boolean) => void;
  onShowBackConfirmationChange: (v: boolean) => void;

  // Handlers
  onFieldConfirm: (value: string) => void;
  onAttemptAccess: () => void;
  onCancelProcess: () => void;
  onAbortFlow: (motivo: string) => Promise<void> | void;
  onPreviousStep: () => void;
  onConfirmPrevious: () => void;
  onBackToStart: () => void;
}

export function Phase1CountingView({
  cashCount,
  electronicPayments,
  guidedState,
  currentField,
  instructionText,
  FIELD_ORDER,
  isMorningCount,
  primaryGradient,
  IconComponent,
  isFieldActive,
  isFieldCompleted,
  isFieldAccessible,
  canGoPrevious,
  showExitConfirmation,
  showBackConfirmation,
  onShowExitConfirmationChange,
  onShowBackConfirmationChange,
  onFieldConfirm,
  onAttemptAccess,
  onCancelProcess,
  onAbortFlow,
  onPreviousStep,
  onConfirmPrevious,
  onBackToStart,
}: Phase1CountingViewProps) {
  // 🤖 [IA] - v1.2.11 - Detección de viewport y escala proporcional
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-fluid-xs max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl"
    >
      {/* 🤖 [IA] - v1.2.14 - Container principal con sistema de diseño coherente */}
      <div className="cash-counter-container space-y-fluid-md">
        {/* 🤖 [IA] - v1.2.14 - Header con sistema de diseño coherente */}
        <div className="cash-counter-header">
          <div className="cash-counter-title">
            <IconComponent className="cash-counter-icon" style={{
              background: primaryGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }} />
            <h2>Fase 1: Conteo Inicial</h2>
          </div>
        </div>

        {/* 🤖 [IA] - v1.2.14 - Área de contenido con sistema coherente */}
        <div className="cash-counter-content" style={{
          minHeight: isMobileDevice ? '0' : 'clamp(150px, 30vh, 200px)',
          maxHeight: isMobileDevice ? 'none' : 'calc(90vh - 120px)',
          overflowY: isMobileDevice ? 'visible' : 'auto'
        }}>
          {/* Guided Progress Indicator - 🤖 [IA] - v1.2.14: Sistema coherente */}
          <div>
            <GuidedProgressIndicator
              currentStep={guidedState.currentStep}
              totalSteps={guidedState.totalSteps}
              currentFieldLabel={currentField}
              instructionText={instructionText}
              isCompleted={guidedState.isCompleted}
              isMorningCount={isMorningCount}
            />
          </div>

          {/* 🤖 [IA] - v1.0.95: Vista guiada unificada - Solo mostrar sección activa en todas las plataformas */}
          <div className="space-y-fluid-md">
          {/* Coins Section - Solo si hay algún campo de moneda activo */}
          {FIELD_ORDER.slice(0, 5).some(field => isFieldActive(field)) && (
            <GuidedCoinSection
              cashCount={cashCount}
              isFieldActive={isFieldActive}
              isFieldCompleted={isFieldCompleted}
              isFieldAccessible={isFieldAccessible}
              onFieldConfirm={onFieldConfirm}
              onAttemptAccess={onAttemptAccess}
              isMorningCount={isMorningCount}
              onCancel={onCancelProcess}
              onPrevious={onPreviousStep}
              canGoPrevious={canGoPrevious}
            />
          )}

          {/* Bills Section - Solo si hay algún campo de billete activo */}
          {FIELD_ORDER.slice(5, 11).some(field => isFieldActive(field)) && (
            <GuidedBillSection
              cashCount={cashCount}
              isFieldActive={isFieldActive}
              isFieldCompleted={isFieldCompleted}
              isFieldAccessible={isFieldAccessible}
              onFieldConfirm={onFieldConfirm}
              onAttemptAccess={onAttemptAccess}
              isMorningCount={isMorningCount}
              onCancel={onCancelProcess}
              onPrevious={onPreviousStep}
              canGoPrevious={canGoPrevious}
            />
          )}

          {/* Electronic Input Section - Solo si hay algún campo electrónico activo y NO es conteo matutino */}
          {!isMorningCount && FIELD_ORDER.slice(11, 15).some(field => isFieldActive(field)) && (
            <GuidedElectronicInputSection
              electronicPayments={electronicPayments}
              cashCount={cashCount}
              isFieldActive={isFieldActive}
              isFieldCompleted={isFieldCompleted}
              isFieldAccessible={isFieldAccessible}
              onFieldConfirm={onFieldConfirm}
              onAttemptAccess={onAttemptAccess}
              onCancel={onCancelProcess}
              onPrevious={onPreviousStep}
              canGoPrevious={canGoPrevious}
            />
          )}

          {/* 🤖 [IA] - v1.2.8: TotalsSummarySection ELIMINADO - Sistema Ciego Anti-Fraude */}
          </div>
        </div>

        {/* 🤖 [IA] - v2.0.0: Modal de confirmación abstracto para salida */}
        <AbortCorteModal
          open={showExitConfirmation}
          onOpenChange={onShowExitConfirmationChange}
          title="¿Cancelar corte actual?"
          description="Si continúas, el corte se marcará como ABORTADO y deberás iniciar uno nuevo."
          warningText="Debes registrar el motivo de la cancelación."
          confirmText="Confirmar cancelación"
          cancelText="Continuar aquí"
          onConfirm={onAbortFlow}
          onCancel={() => onShowExitConfirmationChange(false)}
        />

        {/* 🤖 [IA] - v2.0.0: Modal de confirmación abstracto para retroceso */}
        <ConfirmationModal
          open={showBackConfirmation}
          onOpenChange={onShowBackConfirmationChange}
          title="¿Retroceder al campo anterior?"
          description="Todos los valores ingresados se mantendrán guardados."
          warningText="Podrás revisar y editar campos anteriores sin perder datos."
          confirmText="Sí, retroceder"
          cancelText="Continuar aquí"
          onConfirm={onConfirmPrevious}
          onCancel={() => onShowBackConfirmationChange(false)}
        />

      </div>
    </motion.div>
  );
}
