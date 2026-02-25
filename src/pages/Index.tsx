// 🤖 [IA] - R3-B1 GREEN: handleResumeSession llama recuperarSesion y salta wizard a CashCounter
// Previous: DACC-CLEANUP - Wizard es la UX única para CASH_CUT
// 🤖 [IA] - ORDEN #27 M4: extrae datos_conteo.conteo_parcial → initialCashCount y pagos_electronicos → initialElectronicPayments
// 🤖 [IA] - ORDEN #28 M6: extrae datos_conteo.gastos_dia.items → dailyExpenses al reanudar
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
import { DailyExpense, isDailyExpense } from '@/types/expenses'; // 🤖 [IA] - v1.4.0 + ORDEN #28 M6
import { isSupabaseConfigured, tables } from '@/lib/supabase';
import { obtenerEstadoCola } from '@/lib/offlineQueue';
import { esErrorDeRed } from '@/lib/esErrorDeRed';
import { useCorteSesion } from '@/hooks/useCorteSesion';
import CorteOrquestador from '@/components/corte/CorteOrquestador'; // 🤖 [IA] - DIRM V2 Task 5: Flujo CorteInicio → Supabase
import type { DatosProgreso } from '@/types/auditoria';
import type { CashCount, ElectronicPayments } from '@/types/cash';

type ActiveSessionInfo = {
  correlativo: string | null;
  createdAt: string | null;
  cajero: string | null;
  estado: string | null;
};

type ActiveSessionCheck = {
  status: 'ok' | 'connectivity_error';
  hasActive: boolean;
  sucursalId: string | null;
  sessionInfo: ActiveSessionInfo | null;
};

function resolveStartCutErrorMessage(error: unknown): string {
  if (esErrorDeRed(error)) {
    return 'No hay conexión con Supabase. Verifique internet y reintente.';
  }

  const rawMessage = error instanceof Error ? error.message : '';
  const normalized = rawMessage.toLowerCase();
  const schemaMissingEmployeeIds =
    (normalized.includes('cajero_id') || normalized.includes('testigo_id')) &&
    (normalized.includes('schema cache') ||
      normalized.includes('column') ||
      normalized.includes('does not exist'));

  if (schemaMissingEmployeeIds) {
    return 'La base de datos está desactualizada (faltan columnas de empleado en cortes). Ejecute migración 009_cortes_employee_ids.sql.';
  }

  return rawMessage
    ? `No se pudo iniciar el corte: ${rawMessage}`
    : 'No se pudo iniciar el corte. Verifique conexión e intente de nuevo.';
}

// 🤖 [IA] - ORDEN #27 M4: type guards defensivos para datos_conteo (null-safe, corrupt-safe)
function isCashCountLike(value: unknown): value is CashCount {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return ['penny','nickel','dime','quarter','dollarCoin','bill1','bill5','bill10','bill20','bill50','bill100']
    .every(k => typeof o[k] === 'number');
}

function isElectronicPaymentsLike(value: unknown): value is ElectronicPayments {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return ['credomatic','promerica','bankTransfer','paypal']
    .every(k => typeof o[k] === 'number');
}

const Index = () => {
  // 🤖 [IA] - v1.0.81 - Hook para manejar el modo de operación
  const { currentMode, selectMode, resetMode } = useOperationMode();
  
  // 🤖 [IA] - v1.4.0 - Estado para wizard y datos iniciales (con gastos)
  const [showWizard, setShowWizard] = useState(false);
  const [showMorningWizard, setShowMorningWizard] = useState(false);
  const [showCashCounter, setShowCashCounter] = useState(false);
  // 🤖 [IA] - DIRM V2 Task 5: CorteOrquestador intermedio entre wizard y CashCounter
  const [showCorteInicio, setShowCorteInicio] = useState(false);
  // 🤖 [IA] - ORDEN #25 M2: skipWizard=true cuando CashCounter se abre desde reanudación de sesión activa
  const [skipWizardOnResume, setSkipWizardOnResume] = useState(false);
  // 🤖 [IA] - ORDEN #27 M4: conteo parcial y pagos electrónicos extraídos de datos_conteo al reanudar
  const [initialCashCount, setInitialCashCount] = useState<CashCount | undefined>(undefined);
  const [initialElectronicPayments, setInitialElectronicPayments] = useState<ElectronicPayments | undefined>(undefined);
  const [cashCutSessionCheckInProgress, setCashCutSessionCheckInProgress] = useState(false);
  const [activeCashCutSucursalId, setActiveCashCutSucursalId] = useState<string | null>(null);
  // [IA] - CASO-SANN: Estado booleano para notificar sesión activa al wizard
  const [hasActiveCashCutSession, setHasActiveCashCutSession] = useState(false);
  // [IA] - R3-B2: Info enriquecida de sesión activa para identificador en Step 5
  const [activeSessionInfo, setActiveSessionInfo] = useState<ActiveSessionInfo | null>(null);
  const [wizardCompletionError, setWizardCompletionError] = useState<string | null>(null);
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
  const [syncEstado, setSyncEstado] = useState<'sincronizado' | 'sincronizando' | 'pendiente' | 'error'>('sincronizado');

  // 🤖 [IA] - DACC-CIERRE-SYNC-UX: Hook de sesión para persistencia corte
  const {
    iniciarCorte,
    guardarProgreso,
    finalizarCorte,
    error: syncError,
  } = useCorteSesion(syncSucursalId);

  // [IA] - CASO-SANN-R2: Segunda instancia para gestionar sesión activa durante wizard
  const {
    abortarCorte: abortarCorteActivo,
    // [IA] - R3-B1 GREEN: recuperarSesion para saltar wizard directamente a CashCounter
    recuperarSesion: recuperarSesionActiva,
  } = useCorteSesion(activeCashCutSucursalId || '', {
    autoRecuperarSesion: false,
    procesarColaEnReconexion: false,
  });

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
    datos_entrega?: Record<string, unknown> | null;
    datos_verificacion?: Record<string, unknown> | null;
    datos_reporte?: Record<string, unknown> | null;
  }) => {
    if (!isSupabaseConfigured || !syncSucursalId) return;

    const estadoColaAntes = obtenerEstadoCola();
    setSyncEstado('sincronizando');
    const datosProgreso: DatosProgreso = {
      fase_actual: datos.fase_actual,
      conteo_parcial: datos.conteo_parcial as Record<string, unknown>,
      pagos_electronicos: datos.pagos_electronicos as Record<string, unknown>,
      gastos_dia: datos.gastos_dia.length > 0
        ? { items: datos.gastos_dia } as unknown as Record<string, unknown>
        : null,
      datos_entrega: datos.datos_entrega ?? null,
      datos_verificacion: datos.datos_verificacion ?? null,
      datos_reporte: datos.datos_reporte ?? null,
    };
    guardarProgreso(datosProgreso)
      .then(() => {
        const estadoColaDespues = obtenerEstadoCola();
        const seEncoloOperacion =
          estadoColaDespues.total > estadoColaAntes.total ||
          estadoColaDespues.pendientes > estadoColaAntes.pendientes;
        if (seEncoloOperacion) {
          setSyncEstado('pendiente');
          return;
        }
        setSyncEstado('sincronizado');
        setUltimaSync(new Date().toISOString());
      })
      .catch((err: unknown) => {
        setSyncEstado('error');
        console.warn('[Index] autosave falló (no-blocking):', err);
      });
  }, [guardarProgreso, syncSucursalId]);

  const handleFinalizarCorte = useCallback(async (
    reporteHash: string,
    datosReporte?: Record<string, unknown>,
  ) => {
    if (!isSupabaseConfigured || !syncSucursalId) return;

    const estadoColaAntes = obtenerEstadoCola();
    setSyncEstado('sincronizando');
    try {
      await finalizarCorte(reporteHash, datosReporte ?? null);
      const estadoColaDespues = obtenerEstadoCola();
      const seEncoloOperacion =
        estadoColaDespues.total > estadoColaAntes.total ||
        estadoColaDespues.pendientes > estadoColaAntes.pendientes;
      if (seEncoloOperacion) {
        setSyncEstado('pendiente');
        return;
      }
      setSyncEstado('sincronizado');
      setUltimaSync(new Date().toISOString());
    } catch (err: unknown) {
      setSyncEstado('error');
      console.warn('[Index] finalizarCorte falló:', err);
      throw err;
    }
  }, [finalizarCorte, syncSucursalId]);

  const handleWizardComplete = async (data: {
    selectedStore: string;
    selectedCashier: string;
    selectedWitness: string;
    expectedSales: string;
    dailyExpenses?: DailyExpense[]; // 🤖 [IA] - v1.4.0: Gastos del día (opcional para MorningCountWizard)
  }) => {
    setWizardCompletionError(null);
    // 🤖 [IA] - v1.4.0: Asegurar que dailyExpenses siempre sea array
    setInitialData({
      ...data,
      dailyExpenses: data.dailyExpenses || []
    });
    const hasActiveSessionForSelectedStore =
      Boolean(activeCashCutSucursalId) && activeCashCutSucursalId === data.selectedStore;

    // CASH_CUT sin sesión activa: persistir inmediatamente usando datos ya capturados en wizard.
    // Evita segunda captura de cajero/testigo y mantiene una única fuente de verdad.
    if (currentMode === OperationMode.CASH_CUT && !hasActiveSessionForSelectedStore) {
      if (isSupabaseConfigured) {
        try {
          const latestActiveSession = await detectActiveCashCutSession(data.selectedStore);
          if (latestActiveSession.status === 'connectivity_error') {
            setWizardCompletionError('Sin conexión a Supabase. No se puede validar sesión activa.');
            toast.error('Sin conexión a Supabase. No se puede validar sesión activa.');
            return;
          }

          const hasLatestActiveForSelectedStore =
            latestActiveSession.hasActive && latestActiveSession.sucursalId === data.selectedStore;

          if (hasLatestActiveForSelectedStore) {
            setHasActiveCashCutSession(true);
            setActiveCashCutSucursalId(latestActiveSession.sucursalId);
            setActiveSessionInfo(latestActiveSession.sessionInfo);
            setWizardCompletionError('Ya existe un corte EN PROGRESO para esta sucursal. Reanude la sesión.');
            toast.error('Ya existe un corte EN PROGRESO para esta sucursal. Reanude la sesión.');
            return;
          }

          const selectedIds = Array.from(
            new Set([data.selectedCashier, data.selectedWitness].filter(Boolean)),
          );

          let cashierName = data.selectedCashier;
          let witnessName = data.selectedWitness;

          if (selectedIds.length > 0) {
            const { data: empleadosRows, error: empleadosError } = await tables
              .empleados()
              .select('id,nombre')
              .in('id', selectedIds);

            if (!empleadosError && empleadosRows) {
              const employeeNameMap = new Map(
                empleadosRows.map((empleado) => [empleado.id, empleado.nombre]),
              );
              cashierName = employeeNameMap.get(data.selectedCashier) ?? data.selectedCashier;
              witnessName = employeeNameMap.get(data.selectedWitness) ?? data.selectedWitness;
            }
          }

          const expectedSalesValue = parseFloat(data.expectedSales);
          const corte = await iniciarCorte({
            sucursal_id: data.selectedStore,
            cajero: cashierName,
            cajero_id: data.selectedCashier,
            testigo: witnessName,
            testigo_id: data.selectedWitness,
            venta_esperada: Number.isFinite(expectedSalesValue) ? expectedSalesValue : undefined,
          });

          setInitialData(prev => prev ? {
            ...prev,
            selectedCashier: corte.cajero,
            selectedWitness: corte.testigo,
            expectedSales: corte.venta_esperada != null ? String(corte.venta_esperada) : prev.expectedSales,
          } : prev);

          setSyncSucursalId(corte.sucursal_id);
          setSyncEstado('sincronizado');
          setUltimaSync(new Date().toISOString());
        } catch (err: unknown) {
          console.warn('[Index] iniciarCorte falló:', err);
          const errorMessage = resolveStartCutErrorMessage(err);
          setWizardCompletionError(errorMessage);
          toast.error(errorMessage);
          return;
        }
      }

      setWizardCompletionError(null);
      setShowWizard(false);
      setShowMorningWizard(false);
      setShowCorteInicio(false);
      setShowCashCounter(true);
      return;
    }

    setWizardCompletionError(null);
    setShowWizard(false);
    setShowMorningWizard(false);
    setShowCorteInicio(false);
    setShowCashCounter(true);

    // 🤖 [IA] - DACC-R2 Gap 1: Política explícita de sucursal para sincronización.
    // POLÍTICA A: Si existe sesión activa PARA la sucursal seleccionada en el wizard,
    // esa sucursal gobierna la sync. Si la sesión activa pertenece a otra sucursal,
    // el flujo continúa como corte nuevo para data.selectedStore.
    if (isSupabaseConfigured && currentMode === OperationMode.CASH_CUT) {
      const sucursalParaSync = hasActiveSessionForSelectedStore
        ? (activeCashCutSucursalId as string)
        : data.selectedStore;
      setSyncSucursalId(sucursalParaSync);

      // Sesión activa reanudada — sync ya existe en Supabase
      setSyncEstado('sincronizado');
    }
  };

  const handleBackFromCounter = () => {
    setShowCashCounter(false);
    setShowCorteInicio(false); // 🤖 [IA] - DIRM V2 Task 5: reset CorteOrquestador
    setSkipWizardOnResume(false); // 🤖 [IA] - ORDEN #25 M2: reset flag al volver de reanudación
    setInitialCashCount(undefined); // 🤖 [IA] - ORDEN #27 M4: limpiar conteo parcial al volver
    setInitialElectronicPayments(undefined); // 🤖 [IA] - ORDEN #27 M4: limpiar pagos al volver
    setActiveCashCutSucursalId(null);
    setHasActiveCashCutSession(false); // [IA] - CASO-SANN: Reset estado sesión activa
    setInitialData(null);
    setWizardCompletionError(null);
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
      // 🤖 [IA] - ORDEN #27+28: extraer datos_conteo ANTES de setInitialData para uso inmediato
      // Acceso defensivo: datos_conteo puede ser null o tener estructura inesperada (tipo Json en Supabase)
      const rawDatosConteo: unknown = (corte as Record<string, unknown>)['datos_conteo'];
      const rawConteo: unknown = typeof rawDatosConteo === 'object' && rawDatosConteo !== null
        ? (rawDatosConteo as Record<string, unknown>)['conteo_parcial']
        : undefined;
      const rawPagos: unknown = typeof rawDatosConteo === 'object' && rawDatosConteo !== null
        ? (rawDatosConteo as Record<string, unknown>)['pagos_electronicos']
        : undefined;
      // 🤖 [IA] - ORDEN #28 M6: gastos_dia se almacena como { items: DailyExpense[] } en Supabase
      const rawGastosDiaWrapper: unknown = typeof rawDatosConteo === 'object' && rawDatosConteo !== null
        ? (rawDatosConteo as Record<string, unknown>)['gastos_dia']
        : undefined;
      const rawGastosDiaItems: unknown = typeof rawGastosDiaWrapper === 'object' && rawGastosDiaWrapper !== null
        ? (rawGastosDiaWrapper as Record<string, unknown>)['items']
        : undefined;
      const extractedDailyExpenses: DailyExpense[] = Array.isArray(rawGastosDiaItems)
        ? rawGastosDiaItems.filter(isDailyExpense)
        : [];
      setInitialData({
        selectedStore: corte.sucursal_id,
        selectedCashier: corte.cajero,
        selectedWitness: corte.testigo || '', // 🤖 [IA] - ORDEN #25 M1: poblar testigo desde sesión activa
        expectedSales: corte.venta_esperada != null ? String(corte.venta_esperada) : '',
        dailyExpenses: extractedDailyExpenses, // 🤖 [IA] - ORDEN #28 M6: gastos del día desde datos_conteo
      });
      setInitialCashCount(isCashCountLike(rawConteo) ? rawConteo : undefined);
      setInitialElectronicPayments(isElectronicPaymentsLike(rawPagos) ? rawPagos : undefined);
      if (isSupabaseConfigured) {
        setSyncSucursalId(corte.sucursal_id);
        setSyncEstado('sincronizado');
      }
      setWizardCompletionError(null);
      setHasActiveCashCutSession(false);
      setShowWizard(false);
      setSkipWizardOnResume(true); // 🤖 [IA] - ORDEN #25 M2: saltar instrucciones guiadas en reanudación
      setShowCashCounter(true);
    } catch (err: unknown) {
      console.warn('[Index] recuperarSesion falló:', err);
      setWizardCompletionError('Error al reanudar sesión');
      toast.error('Error al reanudar sesión');
    }
  }, [recuperarSesionActiva]);

  // [IA] - CASO-SANN-R2: Handler abortar sesión — marca ABORTADO en Supabase y desbloquea
  // [IA] - R3-B5 FIX: Cleanup de estado SOLO en éxito; re-throw en error para que Step5 muestre toast.error
  const handleAbortSession = useCallback(async () => {
    try {
      const corteActivo = await recuperarSesionActiva();
      if (!corteActivo) {
        // Si la sesión ya no existe (otra pestaña/dispositivo), desbloquear el flujo local.
        setActiveSessionInfo(null);
        setActiveCashCutSucursalId(null);
        setHasActiveCashCutSession(false);
        return;
      }

      await abortarCorteActivo('Sesión abortada por usuario desde wizard');
      setActiveSessionInfo(null);
      setActiveCashCutSucursalId(null);
      setHasActiveCashCutSession(false);
      setWizardCompletionError(null);
    } catch (err: unknown) {
      console.warn('[Index] abortarCorte falló:', err);
      throw err;
    }
  }, [abortarCorteActivo, recuperarSesionActiva]);

  // [IA] - R3-B2: Tipo extendido con sessionInfo para propagar identificador al wizard
  const detectActiveCashCutSession = useCallback(async (sucursalId?: string): Promise<ActiveSessionCheck> => {
    if (!isSupabaseConfigured) {
      return { status: 'ok', hasActive: false, sucursalId: null, sessionInfo: null };
    }

    try {
      const { data, error } = sucursalId
        ? await tables
            .cortes()
            .select('id,sucursal_id,correlativo,created_at,cajero,estado')
            .eq('sucursal_id', sucursalId)
            .in('estado', ['INICIADO', 'EN_PROGRESO'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
        : await tables
            .cortes()
            .select('id,sucursal_id,correlativo,created_at,cajero,estado')
            .in('estado', ['INICIADO', 'EN_PROGRESO'])
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

      if (error) {
        console.warn('[Index] Error verificando sesión activa de corte:', error.message);
        return { status: 'connectivity_error', hasActive: false, sucursalId: null, sessionInfo: null };
      }

      return {
        status: 'ok',
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
      return { status: 'connectivity_error', hasActive: false, sucursalId: null, sessionInfo: null };
    }
  }, []);

  const handleCheckActiveSessionForStore = useCallback(async (sucursalId: string) => {
    if (!isSupabaseConfigured || !sucursalId) return;

    const activeSession = await detectActiveCashCutSession(sucursalId);
    if (activeSession.status === 'connectivity_error') return;

    setHasActiveCashCutSession(activeSession.hasActive);
    setActiveCashCutSucursalId(activeSession.hasActive ? activeSession.sucursalId : null);
    setActiveSessionInfo(activeSession.hasActive ? activeSession.sessionInfo : null);
    if (!activeSession.hasActive) {
      setWizardCompletionError(null);
    }
  }, [detectActiveCashCutSession]);

  // 🤖 [IA] - v3.3.2 - Ruta híbrida: wizard legacy + reanudación automática por sesión activa
  const handleModeSelection = async (mode: OperationMode) => {
    selectMode(mode);
    if (mode === OperationMode.CASH_CUT) {
      setWizardCompletionError(null);
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
                setWizardCompletionError(null);
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
              // [IA] - BRANCH-ISOLATION: sucursal dueña de sesión activa detectada
              activeSessionSucursalId={activeCashCutSucursalId}
              onCheckActiveSessionForStore={handleCheckActiveSessionForStore}
              completionError={wizardCompletionError}
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

  // 🤖 [IA] - DIRM V2 Task 5: CorteOrquestador — selección cajero/testigo desde Supabase
  if (currentMode === OperationMode.CASH_CUT && showCorteInicio && initialData) {
    return (
      <CorteOrquestador
        sucursalId={initialData.selectedStore}
        ventaEsperada={parseFloat(initialData.expectedSales) || undefined}
        onCorteIniciado={(corte) => {
          // Actualizar initialData con cajero/testigo reales del corte
          setInitialData(prev => prev ? {
            ...prev,
            selectedCashier: corte.cajero,
            selectedWitness: corte.testigo,
          } : prev);
          setShowCorteInicio(false);
          setShowCashCounter(true);
          if (isSupabaseConfigured) {
            setSyncSucursalId(corte.sucursal_id);
            setSyncEstado('sincronizado');
            setUltimaSync(new Date().toISOString());
          }
        }}
        onCancelar={() => {
          setShowCorteInicio(false);
          setShowWizard(true);
        }}
      />
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
        initialDailyExpenses={initialData.dailyExpenses} // 🤖 [IA] - v1.4.0: Gastos del día
        initialCashCount={initialCashCount} // 🤖 [IA] - ORDEN #27 M4: conteo parcial desde datos_conteo
        initialElectronicPayments={initialElectronicPayments} // 🤖 [IA] - ORDEN #27 M4: pagos desde datos_conteo
        onBack={handleBackFromCounter}
        onFlowCancel={handleBackFromCounter} // 🤖 [IA] - SAFE-RETURN: Navegación segura en cancelación
        // 🤖 [IA] - DACC-CIERRE-SYNC-UX: Props sincronización Supabase
        onGuardarProgreso={currentMode === OperationMode.CASH_CUT ? handleGuardarProgreso : undefined}
        onFinalizarCorte={currentMode === OperationMode.CASH_CUT ? handleFinalizarCorte : undefined}
        syncEstado={currentMode === OperationMode.CASH_CUT && syncSucursalId ? syncEstado : undefined}
        ultimaSync={ultimaSync}
        syncError={syncError}
        skipWizard={skipWizardOnResume} // 🤖 [IA] - ORDEN #25 M2: saltar wizard guiado en reanudación
      />
    );
  }

  // Fallback seguro: nunca dejar pantalla negra.
  return <OperationSelector onSelectMode={handleModeSelection} />;
};

export default Index;
