// 🤖 [IA] - v1.4.1: Desmonolitización COMPLETA - Componente presentacional delgado
// Toda la lógica extraída a useCashCounterOrchestrator hook
// Previous: v1.4.0 - Integración Sistema Gastos de Caja
import type { DailyExpense } from '@/types/expenses';
import { GuidedInstructionsModal } from "@/components/cash-counting/GuidedInstructionsModal";
import { Phase2Manager } from "@/components/phases/Phase2Manager";
import { StoreSelectionForm } from "@/components/cash-counter/StoreSelectionForm";
import { Phase3ReportView } from "@/components/cash-counter/Phase3ReportView";
import { Phase1CountingView } from "@/components/cash-counter/Phase1CountingView";
import { OperationMode } from "@/types/operation-mode";
import { useCashCounterOrchestrator } from "@/hooks/useCashCounterOrchestrator";

// 🤖 [IA] - v1.4.0 - Props con modo de operación y gastos
interface CashCounterProps {
  operationMode?: OperationMode;
  initialStore?: string;
  initialCashier?: string;
  initialWitness?: string;
  initialExpectedSales?: string;
  initialDailyExpenses?: DailyExpense[];
  onBack?: () => void;
  onFlowCancel?: () => void;
}

// 🤖 [IA] - v1.4.1: Componente presentacional delgado - toda lógica en useCashCounterOrchestrator
const CashCounter = ({
  operationMode = OperationMode.CASH_CUT,
  initialStore = "",
  initialCashier = "",
  initialWitness = "",
  initialExpectedSales = "",
  initialDailyExpenses = [],
  onBack,
  onFlowCancel
}: CashCounterProps) => {
  const state = useCashCounterOrchestrator({
    operationMode,
    initialStore,
    initialCashier,
    initialWitness,
    initialExpectedSales,
    initialDailyExpenses,
    onBack,
    onFlowCancel,
  });

  // 🤖 [IA] - v1.4.1: Phase 3 early return
  if (state.phaseState.currentPhase === 3) {
    return (
      <Phase3ReportView
        isMorningCount={state.isMorningCount}
        selectedStore={state.selectedStore}
        selectedCashier={state.selectedCashier}
        selectedWitness={state.selectedWitness}
        expectedSales={state.expectedSales}
        cashCount={state.cashCount}
        electronicPayments={state.electronicPayments}
        dailyExpenses={state.dailyExpenses}
        deliveryCalculation={state.deliveryCalculation}
        phaseState={state.phaseState}
        onComplete={state.handleCompleteCalculation}
        onBack={state.handleBackToStart}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 overflow-hidden flex items-center justify-center"
           style={{ touchAction: 'none', overscrollBehavior: 'none', WebkitOverflowScrolling: 'touch' }}>

        <div className="relative z-10 container mx-auto px-4 py-2 max-w-4xl">
          {/* 🤖 [IA] - v1.0.3 - Saltar selección si viene del wizard */}
          {state.phaseState.currentPhase === 1 && !state.phaseState.phase1Completed && !state.hasInitialData && (
            <StoreSelectionForm
              selectedStore={state.selectedStore}
              selectedCashier={state.selectedCashier}
              selectedWitness={state.selectedWitness}
              expectedSales={state.expectedSales}
              availableEmployees={state.availableEmployees}
              canProceedToPhase1={state.canProceedToPhase1}
              operationMode={operationMode}
              onStoreChange={state.setSelectedStore}
              onCashierChange={state.setSelectedCashier}
              onWitnessChange={state.setSelectedWitness}
              onExpectedSalesChange={state.setExpectedSales}
              onBack={onBack}
              onStartPhase1={state.startPhase1}
            />
          )}

          {/* 🤖 [IA] - v1.4.1: Phase 1 counting view */}
          {state.phaseState.currentPhase === 1 && state.phaseState.phase1Completed && (
            <Phase1CountingView
              cashCount={state.cashCount}
              electronicPayments={state.electronicPayments}
              guidedState={state.guidedState}
              currentField={state.currentField}
              instructionText={state.instructionText}
              FIELD_ORDER={state.FIELD_ORDER}
              isMorningCount={state.isMorningCount}
              primaryGradient={state.primaryGradient}
              IconComponent={state.IconComponent}
              isFieldActive={state.isFieldActive}
              isFieldCompleted={state.isFieldCompleted}
              isFieldAccessible={state.isFieldAccessible}
              canGoPrevious={state.canGoPrevious()}
              showExitConfirmation={state.showExitConfirmation}
              showBackConfirmation={state.showBackConfirmation}
              onShowExitConfirmationChange={state.setShowExitConfirmation}
              onShowBackConfirmationChange={state.setShowBackConfirmation}
              onFieldConfirm={state.handleGuidedFieldConfirm}
              onAttemptAccess={state.handleInvalidAccess}
              onCancelProcess={state.handleCancelProcess}
              onPreviousStep={state.handlePreviousStep}
              onConfirmPrevious={state.handleConfirmPrevious}
              onBackToStart={state.handleBackToStart}
            />
          )}

          {/* 🤖 [IA] - v1.4.1: Phase 2 manager */}
          {state.phaseState.currentPhase === 2 && state.deliveryCalculation && (
            <Phase2Manager
              deliveryCalculation={state.deliveryCalculation}
              onPhase2Complete={state.handlePhase2Complete}
              onBack={state.handleBackToStart}
              onDeliveryCalculationUpdate={state.updateDeliveryCalculation}
            />
          )}
        </div>
      </div>

      {/* 🤖 [IA] - v1.2.12 - Modal fuera del contenedor principal para evitar conflictos aria-hidden */}
      <GuidedInstructionsModal
        isOpen={state.showInstructionsModal}
        onConfirm={state.handleInstructionsConfirm}
        onCancel={state.handleInstructionsCancel}
      />
    </>
  );
};

export default CashCounter;
