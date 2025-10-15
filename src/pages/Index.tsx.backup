// 🤖 [IA] - v1.1.16 - Fix teclado numérico en PWA standalone mode
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CashCounter from "@/components/CashCounter";
import InitialWizardModal from "@/components/InitialWizardModal";
import { OperationSelector } from "@/components/operation-selector/OperationSelector";
import { MorningCountWizard } from "@/components/morning-count/MorningCountWizard";
import { useOperationMode } from "@/hooks/useOperationMode";
import { OperationMode } from "@/types/operation-mode";

const Index = () => {
  // 🤖 [IA] - v1.0.81 - Hook para manejar el modo de operación
  const { currentMode, selectMode, resetMode } = useOperationMode();
  
  // 🤖 [IA] - v1.0.3 - Estado para wizard y datos iniciales
  const [showWizard, setShowWizard] = useState(false);
  const [showMorningWizard, setShowMorningWizard] = useState(false);
  const [showCashCounter, setShowCashCounter] = useState(false);
  const [initialData, setInitialData] = useState<{
    selectedStore: string;
    selectedCashier: string;
    selectedWitness: string;
    expectedSales: string;
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

  const handleWizardComplete = (data: {
    selectedStore: string;
    selectedCashier: string;
    selectedWitness: string;
    expectedSales: string;
  }) => {
    setInitialData(data);
    setShowWizard(false);
    setShowMorningWizard(false);
    setShowCashCounter(true);
  };

  const handleBackFromCounter = () => {
    setShowCashCounter(false);
    setInitialData(null);
    resetMode(); // 🤖 [IA] - v1.0.81 - Resetear modo al volver
  };

  // 🤖 [IA] - v1.0.81 - Manejar selección de modo
  const handleModeSelection = (mode: OperationMode) => {
    selectMode(mode);
    if (mode === OperationMode.CASH_CUT) {
      setShowWizard(true);
    } else {
      setShowMorningWizard(true);
    }
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

  if (showCashCounter && initialData) {
    return (
      <CashCounter
        operationMode={currentMode} // 🤖 [IA] - v1.0.81 - Pasar modo de operación
        initialStore={initialData.selectedStore}
        initialCashier={initialData.selectedCashier}
        initialWitness={initialData.selectedWitness}
        initialExpectedSales={initialData.expectedSales}
        onBack={handleBackFromCounter}
        onFlowCancel={handleBackFromCounter} // 🤖 [IA] - SAFE-RETURN: Navegación segura en cancelación
      />
    );
  }

  // 🤖 [IA] - v1.0.88 - Landing page viejo eliminado, ahora solo retornamos null si llegamos aquí
  // Esto no debería pasar, pero lo dejamos como fallback de seguridad
  return null;
};

export default Index;