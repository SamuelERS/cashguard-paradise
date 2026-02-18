// 🤖 [IA] - DACC-FIX-1: Eliminar bifurcación CortePage — wizard es UX única para CASH_CUT
// Previous: v3.3.1 - Restaurar wizard legacy para CASH_CUT conservando guard de estabilidad
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import CashCounter from "@/components/CashCounter";
import InitialWizardModal from "@/components/InitialWizardModal";
import { OperationSelector } from "@/components/operation-selector/OperationSelector";
import { MorningCountWizard } from "@/components/morning-count/MorningCountWizard";
import { DeliveryDashboardWrapper } from "@/components/deliveries/DeliveryDashboardWrapper";
import { useOperationMode } from "@/hooks/useOperationMode";
import { OperationMode } from "@/types/operation-mode";
import { DailyExpense } from '@/types/expenses'; // 🤖 [IA] - v1.4.0: Tipos gastos
import { isSupabaseConfigured, tables } from '@/lib/supabase';

const Index = () => {
  // 🤖 [IA] - v1.0.81 - Hook para manejar el modo de operación
  const { currentMode, selectMode, resetMode } = useOperationMode();
  
  // 🤖 [IA] - v1.4.0 - Estado para wizard y datos iniciales (con gastos)
  const [showWizard, setShowWizard] = useState(false);
  const [showMorningWizard, setShowMorningWizard] = useState(false);
  const [showCashCounter, setShowCashCounter] = useState(false);
  const [cashCutSessionCheckInProgress, setCashCutSessionCheckInProgress] = useState(false);
  const [activeCashCutSucursalId, setActiveCashCutSucursalId] = useState<string | null>(null);
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
    setActiveCashCutSucursalId(null);
    setInitialData(null);
    resetMode(); // 🤖 [IA] - v1.0.81 - Resetear modo al volver
  };

  const detectActiveCashCutSession = async (): Promise<{ hasActive: boolean; sucursalId: string | null }> => {
    if (!isSupabaseConfigured) {
      return { hasActive: false, sucursalId: null };
    }

    try {
      const { data, error } = await tables
        .cortes()
        .select('id,sucursal_id')
        .in('estado', ['INICIADO', 'EN_PROGRESO'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[Index] Error verificando sesión activa de corte:', error.message);
        return { hasActive: false, sucursalId: null };
      }

      return {
        hasActive: Boolean(data),
        sucursalId: data?.sucursal_id ?? null,
      };
    } catch (error) {
      console.warn('[Index] Fallo de red verificando sesión activa de corte:', error);
      return { hasActive: false, sucursalId: null };
    }
  };

  // 🤖 [IA] - v3.3.2 - Ruta híbrida: wizard legacy + reanudación automática por sesión activa
  const handleModeSelection = async (mode: OperationMode) => {
    selectMode(mode);
    if (mode === OperationMode.CASH_CUT) {
      setCashCutSessionCheckInProgress(true);
      const activeSession = await detectActiveCashCutSession();

      // 🤖 [IA] - DACC-FIX-1: Wizard es la UX única para CASH_CUT.
      // Si hay sesión activa, guardamos sucursalId para que el wizard la use,
      // pero SIEMPRE abrimos el wizard (nunca CortePage).
      setActiveCashCutSucursalId(activeSession.hasActive ? activeSession.sucursalId : null);
      setShowWizard(true);

      setCashCutSessionCheckInProgress(false);
    } else if (mode === OperationMode.CASH_COUNT) {
      setActiveCashCutSucursalId(null);
      setShowMorningWizard(true);
    } else {
      setActiveCashCutSucursalId(null);
    }
    // DELIVERY_VIEW no requiere wizard, se maneja directamente en el render
  };

  // 🤖 [IA] - v1.0.88 - Mostrar OperationSelector si no hay modo O si hay wizard abierto
  if (!currentMode || showWizard || showMorningWizard || cashCutSessionCheckInProgress) {
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
              initialSucursalId={activeCashCutSucursalId}
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
