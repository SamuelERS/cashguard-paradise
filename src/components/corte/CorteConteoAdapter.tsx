// 🤖 [IA] - v1.1.0: OT-17 — Hidratación desde datos_conteo + wiring onGuardarProgreso
// Previous: v1.0.0: Adaptador corte → CashCounter — Orden #013
// Mapea datos del sistema de auditoría (Corte, CorteIntento) a las props
// de CashCounter existente. Wrapper delgado sin lógica duplicada.

import { useMemo } from 'react';
import type { Corte, CorteIntento } from '../../types/auditoria';
import type { CashCount, ElectronicPayments } from '../../types/cash';
import type { DailyExpense } from '../../types/expenses';
import { OperationMode } from '../../types/operation-mode';
import CashCounter from '../CashCounter';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface CorteConteoAdapterProps {
  /** Corte activo en estado EN_PROGRESO */
  corte: Corte;
  /** Intento actual del corte (puede ser null) */
  intento: CorteIntento | null;
  /** Nombre de la sucursal (ya resuelto por el orquestador) */
  sucursalNombre: string;
  /** Callback cuando el conteo se completa exitosamente */
  onConteoCompletado: () => void;
  // 🤖 [IA] - OT-17: Callback de autosave de progreso
  onGuardarProgreso?: (datos: {
    fase_actual: number;
    conteo_parcial: CashCount;
    pagos_electronicos: ElectronicPayments;
    gastos_dia: DailyExpense[];
  }) => void;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Adaptador que conecta el sistema de auditoría de cortes con CashCounter.
 *
 * @remarks
 * - Siempre usa OperationMode.CASH_CUT (cortes son fin de turno)
 * - Convierte venta_esperada (number | null) a string | undefined
 * - No pasa initialDailyExpenses (gastos se manejan dentro de CashCounter)
 * - onBack y onFlowCancel ambos disparan onConteoCompletado
 */
function CorteConteoAdapter({
  corte,
  intento: _intento,
  sucursalNombre,
  onConteoCompletado,
  onGuardarProgreso,
}: CorteConteoAdapterProps) {
  // 🤖 [IA] - v1.0.0: Mapeo venta_esperada — null → undefined, number → string
  const ventaEsperadaStr = useMemo((): string | undefined => {
    if (corte.venta_esperada === null) return undefined;
    return corte.venta_esperada.toString();
  }, [corte.venta_esperada]);

  // 🤖 [IA] - OT-17: Hidratación — extraer conteo_parcial y pagos_electronicos de datos_conteo
  const { initialCashCount, initialElectronicPayments } = useMemo(() => {
    const dc = corte.datos_conteo;
    if (!dc || typeof dc !== 'object') {
      return { initialCashCount: undefined, initialElectronicPayments: undefined };
    }

    const conteo = dc.conteo_parcial as CashCount | undefined;
    const pagos = dc.pagos_electronicos as ElectronicPayments | undefined;

    return {
      initialCashCount: conteo ?? undefined,
      initialElectronicPayments: pagos ?? undefined,
    };
  }, [corte.datos_conteo]);

  return (
    <CashCounter
      operationMode={OperationMode.CASH_CUT}
      initialStore={sucursalNombre}
      initialCashier={corte.cajero}
      initialWitness={corte.testigo}
      initialExpectedSales={ventaEsperadaStr}
      onBack={onConteoCompletado}
      onFlowCancel={onConteoCompletado}
      skipWizard
      initialCashCount={initialCashCount}
      initialElectronicPayments={initialElectronicPayments}
      onGuardarProgreso={onGuardarProgreso}
    />
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { CorteConteoAdapter };
export type { CorteConteoAdapterProps };
