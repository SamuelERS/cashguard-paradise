// 🤖 [IA] - R3-B1 GREEN: handleResumeSession llama recuperarSesion y salta wizard a CashCounter
// Previous: DACC-CLEANUP - Wizard es la UX única para CASH_CUT
import { useState, useEffect, useCallback } from "react";
import { toast } from 'sonner';
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
import { useCorteSesion } from '@/hooks/useCorteSesion';
import type { DatosProgreso } from '@/types/auditoria';
import type { CashCount, ElectronicPayments } from '@/types/cash';

const Index = () => {
  // 🤖 [IA] - v1.0.81 - Hook para manejar el modo de operación
  const { currentMode, selectMode, resetMode } = useOperationMode();
  
  // 🤖 [IA] - v1.4.0 - Estado para wizard y datos iniciales (con gastos)
  const [showWizard, setShowWizard] = useState(false);
  const [showMorningWizard, setShowMorningWizard] = useState(false);
  const [showCashCounter, setShowCashCounter] = useState(false);
  const [cashCutSessionCheckInProgress, setCashCutSessionCheckInProgress] = useState(false);
  const [activeCashCutSucursalId, setActiveCashCutSucursalId] = useState<string | null>(null);
  // [IA] - CASO-SANN: Estado booleano para notificar sesión activa al wizard
  const [hasActiveCashCutSession, setHasActiveCashCutSession] = useState(false);
  // [IA] - R3-B2: Info enriquecida de sesión activa para identificador en Step 5
  const [activeSessionInfo, setActiveSessionInfo] = useState<{
    correlativo: string | null;
    createdAt: string | null;
    cajero: string | null;
    estado: string | null;
  } | null>(null);
  const [initialData, setInitialData] = useState<{
    selectedStore: string;
    selectedCashier: string;
    selectedWitness: string;
    expectedSales: string;
    dailyExpenses: DailyExpense[]; // 🤖 [IA] - v1.4.0: Gastos del día
  } | null>(null);

  // 🤖 [IA] - DACC-CIERRE-SYNC-UX: Estado de sincronización Supabase
  const [syncSucursalId, setSyncSucursalId] = useState('');
  const [ultimaSync, setUltimaSync] = useState<string | null>(null);
  const [syncEstado, setSyncEstado] = useState<'sincronizado' | 'sincronizando' | 'error'>('sincronizado');

  // 🤖 [IA] - DACC-CIERRE-SYNC-UX: Hook de sesión para persistencia corte
  const {
    iniciarCorte,
    guardarProgreso,
    error: syncError,
  } = useCorteSesion(syncSucursalId);

  // [IA] - CASO-SANN-R2: Segunda instancia para gestionar sesión activa durante wizard
  const {
    abortarCorte: abortarCorteActivo,
    // [IA] - R3-B1 GREEN: recuperarSesion para saltar wizard directamente a CashCounter
    recuperarSesion: recuperarSesionActiva,
  } = useCorteSesion(activeCashCutSucursalId || '');

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

  // 🤖 [IA] - DACC-CIERRE-SYNC-UX: Wrapper autosave → Supabase
  const handleGuardarProgreso = useCallback((datos: {
    fase_actual: number;
    conteo_parcial: CashCount;
    pagos_electronicos: ElectronicPayments;
    gastos_dia: DailyExpense[];
  }) => {
    if (!isSupabaseConfigured || !syncSucursalId) return;

    setSyncEstado('sincronizando');
    const datosProgreso: DatosProgreso = {
      fase_actual: datos.fase_actual,
      conteo_parcial: datos.conteo_parcial as Record<string, unknown>,
      pagos_electronicos: datos.pagos_electronicos as Record<string, unknown>,
      gastos_dia: datos.gastos_dia.length > 0
        ? { items: datos.gastos_dia } as unknown as Record<string, unknown>
        : null,
    };
    guardarProgreso(datosProgreso)
      .then(() => {
        setSyncEstado('sincronizado');
        setUltimaSync(new Date().toISOString());
      })
      .catch((err: unknown) => {
        setSyncEstado('error');
        console.warn('[Index] autosave falló (no-blocking):', err);
      });
  }, [guardarProgreso, syncSucursalId]);

  const handleWizardComplete = async (data: {
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

    // 🤖 [IA] - DACC-R2 Gap 1: Política explícita de sucursal para sincronización.
    // POLÍTICA A: Si hay sesión activa en Supabase, su sucursal_id SIEMPRE gobierna la sync,
    // independientemente de lo que el usuario seleccione en el wizard.
    // Si NO hay sesión activa, se usa la sucursal elegida en el wizard (data.selectedStore).
    if (isSupabaseConfigured && currentMode === OperationMode.CASH_CUT) {
      const sucursalParaSync = activeCashCutSucursalId ?? data.selectedStore;
      setSyncSucursalId(sucursalParaSync);

      if (!activeCashCutSucursalId) {
        // 🤖 [IA] - DACC-R2 Gap 2: Ciclo de vida sync correcto (sincronizando → sincronizado | error)
        setSyncEstado('sincronizando');
        const ventaEsperada = parseFloat(data.expectedSales);
        try {
          await iniciarCorte({
            sucursal_id: sucursalParaSync,
            cajero: data.selectedCashier,
            testigo: data.selectedWitness,
            venta_esperada: !isNaN(ventaEsperada) ? ventaEsperada : undefined,
          });
          setSyncEstado('sincronizado');
          setUltimaSync(new Date().toISOString());
        } catch (err: unknown) {
          setSyncEstado('error');
          console.warn('[Index] iniciarCorte falló (graceful degradation):', err);
        }
      } else {
        // Sesión activa reanudada — sync ya existe en Supabase
        setSyncEstado('sincronizado');
      }
    }
  };

  const handleBackFromCounter = () => {
    setShowCashCounter(false);
    setActiveCashCutSucursalId(null);
    setHasActiveCashCutSession(false); // [IA] - CASO-SANN: Reset estado sesión activa
    setInitialData(null);
    // 🤖 [IA] - DACC-CIERRE-SYNC-UX: Reset sync state
    setSyncSucursalId('');
    setUltimaSync(null);
    setSyncEstado('sincronizado');
    resetMode(); // 🤖 [IA] - v1.0.81 - Resetear modo al volver
  };

  // [IA] - R3-B1 GREEN: Handler reanudar sesión — llama recuperarSesion y salta wizard a CashCounter
  const handleResumeSession = useCallback(async () => {
    try {
      const corte = await recuperarSesionActiva();
      if (!corte) {
        toast.error('No se encontró la sesión activa');
        return;
      }
      setInitialData({
        selectedStore: corte.sucursal_id,
        selectedCashier: corte.cajero,
        selectedWitness: '',
        expectedSales: corte.venta_esperada != null ? String(corte.venta_esperada) : '',
        dailyExpenses: [],
      });
      if (isSupabaseConfigured) {
        setSyncSucursalId(corte.sucursal_id);
        setSyncEstado('sincronizado');
      }
      setHasActiveCashCutSession(false);
      setShowWizard(false);
      setShowCashCounter(true);
    } catch (err: unknown) {
      console.warn('[Index] recuperarSesion falló:', err);
      toast.error('Error al reanudar sesión');
    }
  }, [recuperarSesionActiva]);

  // [IA] - CASO-SANN-R2: Handler abortar sesión — marca ABORTADO en Supabase y desbloquea
  // [IA] - R3-B5 FIX: Cleanup de estado SOLO en éxito; re-throw en error para que Step5 muestre toast.error
  const handleAbortSession = useCallback(async () => {
    try {
      await abortarCorteActivo('Sesión abortada por usuario desde wizard');
      setActiveCashCutSucursalId(null);
      setHasActiveCashCutSession(false);
    } catch (err: unknown) {
      console.warn('[Index] abortarCorte falló:', err);
      throw err;
    }
  }, [abortarCorteActivo]);

  // [IA] - R3-B2: Tipo extendido con sessionInfo para propagar identificador al wizard
  const detectActiveCashCutSession = async (): Promise<{
    hasActive: boolean;
    sucursalId: string | null;
    sessionInfo: {
      correlativo: string | null;
      createdAt: string | null;
      cajero: string | null;
      estado: string | null;
    } | null;
  }> => {
    if (!isSupabaseConfigured) {
      return { hasActive: false, sucursalId: null, sessionInfo: null };
    }

    try {
      const { data, error } = await tables
        .cortes()
        .select('id,sucursal_id,correlativo,created_at,cajero,estado')
        .in('estado', ['INICIADO', 'EN_PROGRESO'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[Index] Error verificando sesión activa de corte:', error.message);
        return { hasActive: false, sucursalId: null, sessionInfo: null };
      }

      return {
        hasActive: Boolean(data),
        sucursalId: data?.sucursal_id ?? null,
        sessionInfo: data ? {
          correlativo: data.correlativo ?? null,
          createdAt: data.created_at ?? null,
          cajero: data.cajero ?? null,
          estado: data.estado ?? null,
        } : null,
      };
    } catch (error) {
      console.warn('[Index] Fallo de red verificando sesión activa de corte:', error);
      return { hasActive: false, sucursalId: null, sessionInfo: null };
    }
  };

  // 🤖 [IA] - v3.3.2 - Ruta híbrida: wizard legacy + reanudación automática por sesión activa
  const handleModeSelection = async (mode: OperationMode) => {
    selectMode(mode);
    if (mode === OperationMode.CASH_CUT) {
      setCashCutSessionCheckInProgress(true);
      const activeSession = await detectActiveCashCutSession();

      // 🤖 [IA] - DACC-CLEANUP: Wizard es la UX única para CASH_CUT.
      // Si hay sesión activa, guardamos sucursalId para que el wizard la use.
      // [IA] - CASO-SANN: Notificar al wizard si hay sesión activa para mostrar banner informativo
      setHasActiveCashCutSession(activeSession.hasActive);
      setActiveCashCutSucursalId(activeSession.hasActive ? activeSession.sucursalId : null);
      // [IA] - R3-B2: Propagar info enriquecida para identificador en Step 5
      setActiveSessionInfo(activeSession.hasActive ? activeSession.sessionInfo : null);
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
              hasActiveSession={hasActiveCashCutSession}
              // [IA] - CASO-SANN-R2: Callbacks para panel sesión activa Step 5
              onResumeSession={handleResumeSession}
              onAbortSession={handleAbortSession}
              // [IA] - R3-B2: Info enriquecida para identificador en Step 5
              activeSessionInfo={activeSessionInfo}
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
        // 🤖 [IA] - DACC-CIERRE-SYNC-UX: Props sincronización Supabase
        onGuardarProgreso={currentMode === OperationMode.CASH_CUT ? handleGuardarProgreso : undefined}
        syncEstado={currentMode === OperationMode.CASH_CUT && syncSucursalId ? syncEstado : undefined}
        ultimaSync={ultimaSync}
        syncError={syncError}
      />
    );
  }

  // Fallback seguro: nunca dejar pantalla negra.
  return <OperationSelector onSelectMode={handleModeSelection} />;
};

export default Index;
