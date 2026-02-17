// 🤖 [IA] - v1.0.0: Adaptador corte → CashCounter — Orden #013
// Mapea datos del sistema de auditoría (Corte, CorteIntento) a las props
// de CashCounter existente. Wrapper delgado sin lógica duplicada.

import { useMemo } from 'react';
import type { Corte, CorteIntento } from '../../types/auditoria';
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
 * - Mantiene wizard de instrucciones activo (NO skipWizard) para protocolo obligatorio
 */
function CorteConteoAdapter({
  corte,
  intento: _intento,
  sucursalNombre,
  onConteoCompletado,
}: CorteConteoAdapterProps) {
  // 🤖 [IA] - v1.0.0: Mapeo venta_esperada — null → undefined, number → string
  const ventaEsperadaStr = useMemo((): string | undefined => {
    if (corte.venta_esperada === null) return undefined;
    return corte.venta_esperada.toString();
  }, [corte.venta_esperada]);

  return (
    <CashCounter
      operationMode={OperationMode.CASH_CUT}
      initialStore={sucursalNombre}
      initialCashier={corte.cajero}
      initialWitness={corte.testigo}
      initialExpectedSales={ventaEsperadaStr}
      onBack={onConteoCompletado}
      onFlowCancel={onConteoCompletado}
    />
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { CorteConteoAdapter };
export type { CorteConteoAdapterProps };
