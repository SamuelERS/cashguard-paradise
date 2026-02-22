// 🤖 [IA] - OT-17: Servicio append-only de snapshots de conteo
// Insert-only — la tabla tiene trigger que bloquea UPDATE/DELETE en Supabase.

import { tables, isSupabaseConfigured } from './supabase';
import type { CashCount, ElectronicPayments } from '../types/cash';
import type { CorteConteoSnapshot } from '../types/auditoria';

// ---------------------------------------------------------------------------
// 1. Tipos internos
// ---------------------------------------------------------------------------

/** Payload para insertar un snapshot (sin campos auto-generados). */
export interface SnapshotPayload {
  corte_id: string;
  attempt_number: number;
  fase_actual: number;
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  gastos_dia: Record<string, unknown> | null;
  source: CorteConteoSnapshot['source'];
}

// ---------------------------------------------------------------------------
// 2. Helpers de mapeo
// ---------------------------------------------------------------------------

/**
 * Mapea CashCount keys (camelCase) + ElectronicPayments a columnas DB (snake_case).
 * Separado para testeo independiente.
 */
function toDbRow(payload: SnapshotPayload) {
  const { cashCount, electronicPayments, ...rest } = payload;
  return {
    corte_id: rest.corte_id,
    attempt_number: rest.attempt_number,
    fase_actual: rest.fase_actual,
    // Denominaciones — CashCount camelCase → DB snake_case
    penny: cashCount.penny,
    nickel: cashCount.nickel,
    dime: cashCount.dime,
    quarter: cashCount.quarter,
    dollar_coin: cashCount.dollarCoin,
    bill_1: cashCount.bill1,
    bill_5: cashCount.bill5,
    bill_10: cashCount.bill10,
    bill_20: cashCount.bill20,
    bill_50: cashCount.bill50,
    bill_100: cashCount.bill100,
    // Pagos electrónicos
    credomatic: electronicPayments.credomatic,
    promerica: electronicPayments.promerica,
    bank_transfer: electronicPayments.bankTransfer,
    paypal: electronicPayments.paypal,
    // Resto
    gastos_dia: rest.gastos_dia,
    source: rest.source,
  };
}

/**
 * Mapea una fila DB (snake_case) de vuelta a CashCount + ElectronicPayments.
 */
function fromDbRow(row: CorteConteoSnapshot): {
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  gastos_dia: Record<string, unknown> | null;
  fase_actual: number;
} {
  return {
    cashCount: {
      penny: row.penny,
      nickel: row.nickel,
      dime: row.dime,
      quarter: row.quarter,
      dollarCoin: row.dollar_coin,
      bill1: row.bill_1,
      bill5: row.bill_5,
      bill10: row.bill_10,
      bill20: row.bill_20,
      bill50: row.bill_50,
      bill100: row.bill_100,
    },
    electronicPayments: {
      credomatic: row.credomatic,
      promerica: row.promerica,
      bankTransfer: row.bank_transfer,
      paypal: row.paypal,
    },
    gastos_dia: row.gastos_dia,
    fase_actual: row.fase_actual,
  };
}

// ---------------------------------------------------------------------------
// 3. Operaciones CRUD (append-only)
// ---------------------------------------------------------------------------

/**
 * Inserta un snapshot de progreso en la tabla append-only.
 *
 * @remarks
 * - Falla silenciosamente si Supabase no está configurado (log + return null).
 * - El caller (guardarProgreso) NO debe lanzar si el snapshot falla;
 *   el snapshot es audit trail, no dato crítico del flujo.
 */
export async function insertSnapshot(
  payload: SnapshotPayload,
): Promise<CorteConteoSnapshot | null> {
  if (!isSupabaseConfigured) {
    console.warn('[snapshots] Supabase no configurado — snapshot omitido.');
    return null;
  }

  const row = toDbRow(payload);
  const { data, error } = await tables
    .corteConteoSnapshots()
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('[snapshots] Error insertando snapshot:', error.message);
    return null;
  }

  return data;
}

/**
 * Recupera el snapshot más reciente para un corte + intento.
 * Útil para hidratar el estado si el usuario recarga la página.
 */
export async function getLatestSnapshot(
  corteId: string,
  attemptNumber: number,
): Promise<{
  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  gastos_dia: Record<string, unknown> | null;
  fase_actual: number;
} | null> {
  if (!isSupabaseConfigured) {
    return null;
  }

  const { data, error } = await tables
    .corteConteoSnapshots()
    .select('*')
    .eq('corte_id', corteId)
    .eq('attempt_number', attemptNumber)
    .order('captured_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return fromDbRow(data);
}

// ---------------------------------------------------------------------------
// 4. Exports para testing
// ---------------------------------------------------------------------------

export { toDbRow as _toDbRow, fromDbRow as _fromDbRow };
