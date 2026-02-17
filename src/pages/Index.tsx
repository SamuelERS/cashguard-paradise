// 🤖 [IA] - v3.3.0 - OT-11: Activar CortePage para CASH_CUT (reemplaza wizard legacy)
// Previous: v3.2.0 - FIX: Pass onGoBack to DeliveryDashboardWrapper (fixes PIN modal stuck)
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CashCounter from "@/components/CashCounter";
import InitialWizardModal from "@/components/InitialWizardModal";
import { OperationSelector } from "@/components/operation-selector/OperationSelector";
import { MorningCountWizard } from "@/components/morning-count/MorningCountWizard";
import { DeliveryDashboardWrapper } from "@/components/deliveries/DeliveryDashboardWrapper";
import { CortePage } from "@/components/corte/CortePage"; // 🤖 [IA] - OT-11: Flujo nuevo Corte
import { useOperationMode } from "@/hooks/useOperationMode";
import { OperationMode } from "@/types/operation-mode";
import { DailyExpense } from '@/types/expenses'; // 🤖 [IA] - v1.4.0: Tipos gastos

const Index = () => {
  // 🤖 [IA] - v1.0.81 - Hook para manejar el modo de operación
  const { currentMode, selectMode, resetMode } = useOperationMode();
  
  // 🤖 [IA] - v1.4.0 - Estado para wizard y datos iniciales (con gastos)
  const [showWizard, setShowWizard] = useState(false);
  const [showMorningWizard, setShowMorningWizard] = useState(false);
  const [showCashCounter, setShowCashCounter] = useState(false);
  const [initialData, setInitialData] = useState<{
    selectedStore: string;
    selectedCashier: string;
    selectedWitness: string;
    expectedSales: string;
    dailyExpenses: DailyExpense[]; // 🤖 [IA] - v1.4.0: Gastos del día
  } | null>(null);

  // 🤖 [IA] - v1.2.23: OPERATION-MODAL-CONTAINMENT - Prevención de selección de texto y scroll en background
  useEffect(() => {
    const isAnyModalOpen = showWizard || showMorningWizard;

    if (isAnyModalOpen) {
      document.body.classList.add('no-text-select');
      // Also prevent scroll
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('no-text-select');
      document.body.style.overflow = '';
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('no-text-select');
      document.body.style.overflow = '';
    };
  }, [showWizard, showMorningWizard]);

  // Prevent a blank screen when CASH_COUNT is selected but no sub-flow is visible.
  useEffect(() => {
    if (
      currentMode === OperationMode.CASH_COUNT &&
      !showMorningWizard &&
      !showCashCounter
    ) {
      setShowMorningWizard(true);
    }
  }, [currentMode, showMorningWizard, showCashCounter]);

  const handleWizardComplete = (data: {
    selectedStore: string;
    selectedCashier: string;
    selectedWitness: string;
    expectedSales: string;
    dailyExpenses?: DailyExpense[]; // 🤖 [IA] - v1.4.0: Gastos del día (opcional para MorningCountWizard)
  }) => {
    // 🤖 [IA] - v1.4.0: Asegurar que dailyExpenses siempre sea array
    setInitialData({
      ...data,
      dailyExpenses: data.dailyExpenses || []
    });
    setShowWizard(false);
    setShowMorningWizard(false);
    setShowCashCounter(true);
  };

  const handleBackFromCounter = () => {
    setShowCashCounter(false);
    setInitialData(null);
    resetMode(); // 🤖 [IA] - v1.0.81 - Resetear modo al volver
  };

  // 🤖 [IA] - v3.3.0 OT-11 - Manejar selección de modo
  const handleModeSelection = (mode: OperationMode) => {
    selectMode(mode);
    if (mode === OperationMode.CASH_COUNT) {
      setShowMorningWizard(true);
    }
    // CASH_CUT y DELIVERY_VIEW se manejan directamente en el render (sin wizard legacy)
  };

  // 🤖 [IA] - v1.0.88 - Mostrar OperationSelector si no hay modo O si hay wizard abierto
  if (!currentMode || showWizard || showMorningWizard) {
    return (
      <>
        <OperationSelector onSelectMode={handleModeSelection} />
        <AnimatePresence initial={false} mode="wait">
          {showWizard && (
            <InitialWizardModal
              isOpen={showWizard}
              onClose={() => {
                setShowWizard(false);
                resetMode(); // 🤖 [IA] - v1.0.88 - Resetear modo para volver a OperationSelector
              }}
              onComplete={handleWizardComplete}
            />
          )}
          {showMorningWizard && (
            <MorningCountWizard
              isOpen={showMorningWizard}
              onClose={() => {
                setShowMorningWizard(false);
                resetMode(); // 🤖 [IA] - v1.0.88 - Resetear modo para volver a OperationSelector
              }}
              onComplete={handleWizardComplete}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // 🤖 [IA] - OT-11: Renderizar CortePage si modo es CASH_CUT
  if (currentMode === OperationMode.CASH_CUT) {
    return <CortePage onSalir={resetMode} />;
  }

  // 🤖 [IA] - v1.0.82 - Renderizar DeliveryDashboardWrapper si modo es DELIVERY_VIEW
  if (currentMode === OperationMode.DELIVERY_VIEW) {
    return <DeliveryDashboardWrapper requirePin={true} onGoBack={resetMode} />;
  }

  if (showCashCounter && initialData) {
    return (
      <CashCounter
        operationMode={currentMode} // 🤖 [IA] - v1.0.81 - Pasar modo de operación
        initialStore={initialData.selectedStore}
        initialCashier={initialData.selectedCashier}
        initialWitness={initialData.selectedWitness}
        initialExpectedSales={initialData.expectedSales}
        initialDailyExpenses={initialData.dailyExpenses} // 🤖 [IA] - v1.4.0: Gastos del día
        onBack={handleBackFromCounter}
        onFlowCancel={handleBackFromCounter} // 🤖 [IA] - SAFE-RETURN: Navegación segura en cancelación
      />
    );
  }

  // Fallback seguro: nunca dejar pantalla negra.
  return <OperationSelector onSelectMode={handleModeSelection} />;
};

export default Index;
