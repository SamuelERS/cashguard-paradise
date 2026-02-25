// src/hooks/supervisor/useSupervisorAnalytics.ts
// 🤖 [IA] - v4.1.0: Hook analytics para tab Resumen — read-only, solo FINALIZADOS
// Patrón: misma arquitectura que useSupervisorQueries.ts

import { useQuery } from '@tanstack/react-query';
import { tables } from '@/lib/supabase';
import { calculateCashTotal } from '@/utils/calculations';
import { isDailyExpense } from '@/types/expenses';
import type { Corte, Sucursal } from '@/types/auditoria';
import type { CashCount } from '@/types/cash';
import { queryKeys } from './queryKeys';

// ---------------------------------------------------------------------------
// Constantes y utilidades de fecha
// ---------------------------------------------------------------------------

const TIMEZONE_NEGOCIO = 'America/El_Salvador';

export function fechaAISORange(fechaYYYYMMDD: string): { inicio: string; fin: string } {
  return {
    inicio: `${fechaYYYYMMDD}T00:00:00.000-06:00`,
    fin:    `${fechaYYYYMMDD}T23:59:59.999-06:00`,
  };
}

export function hoyEnElSalvador(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: TIMEZONE_NEGOCIO });
}

export function hace7Dias(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toLocaleDateString('sv-SE', { timeZone: TIMEZONE_NEGOCIO });
}

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface FiltrosAnalytics {
  /** YYYY-MM-DD. Default: hoy − 6 días. */
  fechaDesde?: string;
  /** YYYY-MM-DD. Default: hoy. */
  fechaHasta?: string;
  /** UUID sucursal (opcional). */
  sucursalId?: string;
}

export interface KpiSucursal {
  sucursalId:       string;
  sucursalNombre:   string;
  totalCortes:      number;
  totalCash:        number;
  totalElectronic:  number;
  totalGeneral:     number;
  totalExpenses:    number;
  totalAdjusted:    number;
  totalEsperado:    number;
  diferencia:       number;
  sobrantes:        number;
  faltantes:        number;
  exactos:          number;
}

export interface KpiGlobal {
  totalCortes:      number;
  totalCash:        number;
  totalElectronic:  number;
  totalGeneral:     number;
  totalExpenses:    number;
  totalAdjusted:    number;
  totalEsperado:    number;
  diferencia:       number;
  sobrantes:        number;
  faltantes:        number;
  exactos:          number;
  porSucursal:      KpiSucursal[];
}

export interface UseSupervisorAnalyticsReturn {
  kpi:       KpiGlobal | null;
  cargando:  boolean;
  error:     string | null;
  recargar:  () => void;
}

// ---------------------------------------------------------------------------
// Tipo join — exportado para testing
// ---------------------------------------------------------------------------

export interface CorteConSucursalRaw extends Corte {
  sucursales: Pick<Sucursal, 'id' | 'nombre' | 'codigo' | 'activa'> | null;
}

// ---------------------------------------------------------------------------
// Helpers JSONB — exportados para unit testing
// Patrón: extraído de CorteDetalle.tsx (confirmado en docs/02_arquitectura/)
// ---------------------------------------------------------------------------

interface PagosElectronicos {
  credomatic:   number;
  promerica:    number;
  bankTransfer: number;
  paypal:       number;
}

export function extraerTotalesConteo(
  datosConteo: Record<string, unknown> | null,
): {
  totalCash:       number;
  totalElectronic: number;
  totalExpenses:   number;
} {
  let totalCash = 0;
  let totalElectronic = 0;
  let totalExpenses = 0;

  if (!datosConteo || typeof datosConteo !== 'object') {
    return { totalCash, totalElectronic, totalExpenses };
  }

  // conteo_parcial → CashCount
  const conteoParcialRaw = datosConteo['conteo_parcial'];
  if (
    typeof conteoParcialRaw === 'object' &&
    conteoParcialRaw !== null &&
    !Array.isArray(conteoParcialRaw)
  ) {
    totalCash = calculateCashTotal(conteoParcialRaw as Partial<CashCount>);
  }

  // pagos_electronicos — field-by-field typeof guards
  const pagosRaw = datosConteo['pagos_electronicos'];
  if (typeof pagosRaw === 'object' && pagosRaw !== null && !Array.isArray(pagosRaw)) {
    const p = pagosRaw as Record<string, unknown>;
    const pagos: PagosElectronicos = {
      credomatic:   typeof p['credomatic']   === 'number' ? (p['credomatic']   as number) : 0,
      promerica:    typeof p['promerica']    === 'number' ? (p['promerica']    as number) : 0,
      bankTransfer: typeof p['bankTransfer'] === 'number' ? (p['bankTransfer'] as number) : 0,
      paypal:       typeof p['paypal']       === 'number' ? (p['paypal']       as number) : 0,
    };
    totalElectronic =
      pagos.credomatic + pagos.promerica + pagos.bankTransfer + pagos.paypal;
  }

  // gastos_dia — array OR { items: [...] }
  const gastosDiaRaw = datosConteo['gastos_dia'];
  if (Array.isArray(gastosDiaRaw)) {
    totalExpenses = gastosDiaRaw
      .filter(isDailyExpense)
      .reduce((acc, g) => acc + g.amount, 0);
  } else if (
    typeof gastosDiaRaw === 'object' &&
    gastosDiaRaw !== null &&
    !Array.isArray(gastosDiaRaw)
  ) {
    const obj = gastosDiaRaw as Record<string, unknown>;
    if (Array.isArray(obj['items'])) {
      totalExpenses = (obj['items'] as unknown[])
        .filter(isDailyExpense)
        .reduce((acc, g) => acc + g.amount, 0);
    }
  }

  return { totalCash, totalElectronic, totalExpenses };
}

// ---------------------------------------------------------------------------
// Función de agregación — exportada para unit testing
// ---------------------------------------------------------------------------

export function agregarCortes(cortes: CorteConSucursalRaw[]): KpiGlobal {
  const mapasSucursal = new Map<string, KpiSucursal>();

  for (const corte of cortes) {
    const sucursalId     = corte.sucursal_id ?? 'desconocida';
    const sucursalNombre = corte.sucursales?.nombre ?? 'Sin sucursal';

    const { totalCash, totalElectronic, totalExpenses } =
      extraerTotalesConteo(corte.datos_conteo);

    const totalGeneral  = totalCash + totalElectronic;
    const totalAdjusted = totalGeneral - totalExpenses;
    const totalEsperado = corte.venta_esperada ?? 0;
    const diferencia    = totalAdjusted - totalEsperado;

    const entrada = mapasSucursal.get(sucursalId) ?? {
      sucursalId,
      sucursalNombre,
      totalCortes:     0,
      totalCash:       0,
      totalElectronic: 0,
      totalGeneral:    0,
      totalExpenses:   0,
      totalAdjusted:   0,
      totalEsperado:   0,
      diferencia:      0,
      sobrantes:       0,
      faltantes:       0,
      exactos:         0,
    };

    entrada.totalCortes     += 1;
    entrada.totalCash       += totalCash;
    entrada.totalElectronic += totalElectronic;
    entrada.totalGeneral    += totalGeneral;
    entrada.totalExpenses   += totalExpenses;
    entrada.totalAdjusted   += totalAdjusted;
    entrada.totalEsperado   += totalEsperado;
    entrada.diferencia      += diferencia;
    if (diferencia > 0)      entrada.sobrantes += 1;
    else if (diferencia < 0) entrada.faltantes += 1;
    else                     entrada.exactos   += 1;

    mapasSucursal.set(sucursalId, entrada);
  }

  const porSucursal = [...mapasSucursal.values()].sort(
    (a, b) => a.sucursalNombre.localeCompare(b.sucursalNombre),
  );

  const global = porSucursal.reduce<KpiGlobal>(
    (acc, s) => ({
      totalCortes:     acc.totalCortes     + s.totalCortes,
      totalCash:       acc.totalCash       + s.totalCash,
      totalElectronic: acc.totalElectronic + s.totalElectronic,
      totalGeneral:    acc.totalGeneral    + s.totalGeneral,
      totalExpenses:   acc.totalExpenses   + s.totalExpenses,
      totalAdjusted:   acc.totalAdjusted   + s.totalAdjusted,
      totalEsperado:   acc.totalEsperado   + s.totalEsperado,
      diferencia:      acc.diferencia      + s.diferencia,
      sobrantes:       acc.sobrantes       + s.sobrantes,
      faltantes:       acc.faltantes       + s.faltantes,
      exactos:         acc.exactos         + s.exactos,
      porSucursal,
    }),
    {
      totalCortes: 0, totalCash: 0, totalElectronic: 0,
      totalGeneral: 0, totalExpenses: 0, totalAdjusted: 0,
      totalEsperado: 0, diferencia: 0,
      sobrantes: 0, faltantes: 0, exactos: 0,
      porSucursal,
    },
  );

  return global;
}

// ---------------------------------------------------------------------------
// Hook principal
// ---------------------------------------------------------------------------

export function useSupervisorAnalytics(
  filtros: FiltrosAnalytics = {},
): UseSupervisorAnalyticsReturn {
  const {
    fechaDesde = hace7Dias(),
    fechaHasta = hoyEnElSalvador(),
    sucursalId,
  } = filtros;

  const fingerprint = `${fechaDesde}_${fechaHasta}_${sucursalId ?? 'all'}`;

  const {
    data,
    isLoading: cargando,
    error:     queryError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.supervisor.analytics(fingerprint),
    queryFn: async (): Promise<KpiGlobal> => {
      const rangoDesde = fechaAISORange(fechaDesde);
      const rangoHasta = fechaAISORange(fechaHasta);

      let query = tables
        .cortes()
        .select('*, sucursales(id, nombre, codigo, activa)')
        .eq('estado', 'FINALIZADO')
        .gte('finalizado_at', rangoDesde.inicio)
        .lte('finalizado_at', rangoHasta.fin)
        .order('finalizado_at', { ascending: false });

      if (sucursalId) {
        query = query.eq('sucursal_id', sucursalId);
      }

      const { data: rows, error: supabaseError } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      const cortes = (rows ?? []) as CorteConSucursalRaw[];
      return agregarCortes(cortes);
    },
    staleTime: 5  * 60 * 1000,  // 5 min — analytics no necesita RT
    gcTime:    10 * 60 * 1000,  // 10 min
    retry:     2,
  });

  return {
    kpi:      data ?? null,
    cargando,
    error:    queryError ? (queryError as Error).message : null,
    recargar: () => { void refetch(); },
  };
}
