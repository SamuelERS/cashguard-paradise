// 🤖 [IA] - Orden #3 DACC Dashboard Supervisor — CorteListaItem
// Fila clickeable de un corte de caja en la lista del día.
// Extrae totales de datos_conteo (JSONB) de forma defensiva y calcula semáforo.

import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';
import { calculateCashTotal, formatCurrency } from '@/utils/calculations';
import type { CashCount } from '@/types/cash';
import { calcularSemaforo } from '@/utils/semaforoLogic';
import { SemaforoIndicador } from './SemaforoIndicador';
import { parseCorrelativo } from './correlativoMetrics';

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface CorteListaItemProps {
  corte: CorteConSucursal;
  onClick: (id: string) => void;
  contextoCorrelativo?: {
    atraso: number;
  };
}

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Formatea una hora operativa en formato 12h (zona El Salvador).
 * Retorna '—' si el campo es null o inválido.
 */
function formatearHora(timestamp: string | null): string {
  if (!timestamp) return '—';
  try {
    return new Intl.DateTimeFormat('es', {
      timeZone: 'America/El_Salvador',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(timestamp));
  } catch {
    return '—';
  }
}

function estadoBadgeClasses(estado: CorteConSucursal['estado']): string {
  switch (estado) {
    case 'FINALIZADO':
      return 'border-sky-500/30 bg-sky-500/12 text-sky-300';
    case 'EN_PROGRESO':
      return 'border-emerald-500/30 bg-emerald-500/12 text-emerald-300';
    case 'INICIADO':
      return 'border-amber-500/30 bg-amber-500/12 text-amber-300';
    case 'ABORTADO':
      return 'border-rose-500/30 bg-rose-500/12 text-rose-300';
    default:
      return 'border-white/20 bg-white/10 text-white/70';
  }
}

/**
 * Extrae los totales de efectivo y pagos electrónicos desde el JSONB datos_conteo.
 *
 * @remarks
 * - Todos los accesos a campos JSONB son defensivos (typeof guards).
 * - datos_verificacion y datos_reporte siempre son null en el flujo actual (Plan §8).
 * - Si datos_conteo es null o está mal formado, retorna disponible=false.
 */
function extraerTotalesConteo(datosConteo: Record<string, unknown> | null): {
  totalEfectivo: number;
  totalElectronico: number;
  disponible: boolean;
} {
  if (!datosConteo) {
    return { totalEfectivo: 0, totalElectronico: 0, disponible: false };
  }

  // ── Efectivo ──────────────────────────────────────────────────────────────
  let totalEfectivo = 0;
  const conteoParcialRaw = datosConteo.conteo_parcial;
  if (
    typeof conteoParcialRaw === 'object' &&
    conteoParcialRaw !== null &&
    !Array.isArray(conteoParcialRaw)
  ) {
    const resultado = calculateCashTotal(conteoParcialRaw as Partial<CashCount>);
    totalEfectivo = Number.isFinite(resultado) ? resultado : 0;
  }

  // ── Electrónicos ──────────────────────────────────────────────────────────
  let totalElectronico = 0;
  const pagosRaw = datosConteo.pagos_electronicos;
  if (
    typeof pagosRaw === 'object' &&
    pagosRaw !== null &&
    !Array.isArray(pagosRaw)
  ) {
    const pagos = pagosRaw as Record<string, unknown>;
    totalElectronico =
      (typeof pagos.credomatic === 'number' ? pagos.credomatic : 0) +
      (typeof pagos.promerica === 'number' ? pagos.promerica : 0) +
      (typeof pagos.bankTransfer === 'number' ? pagos.bankTransfer : 0) +
      (typeof pagos.paypal === 'number' ? pagos.paypal : 0);
  }

  return { totalEfectivo, totalElectronico, disponible: true };
}

function toFiniteNumber(value: unknown): number | null {
  if (typeof value !== 'number') return null;
  return Number.isFinite(value) ? value : null;
}

function firstFiniteNumber(...values: unknown[]): number | null {
  for (const value of values) {
    const parsed = toFiniteNumber(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function extraerTotalesReporte(datosReporte: Record<string, unknown> | null): {
  totalContado: number | null;
  expectedSalesAdjusted: number | null;
  diferencia: number | null;
  disponible: boolean;
} {
  if (!datosReporte) {
    return {
      totalContado: null,
      expectedSalesAdjusted: null,
      diferencia: null,
      disponible: false,
    };
  }

  const totalContado = firstFiniteNumber(
    datosReporte.total_with_expenses,
    datosReporte.total_contado,
    datosReporte.total_general,
    datosReporte.totalWithExpenses,
    datosReporte.totalContado,
    datosReporte.totalGeneral,
  );

  const expectedSalesAdjusted = firstFiniteNumber(
    datosReporte.expected_sales_adjusted,
    datosReporte.expected_sales,
    datosReporte.expectedSalesAdjusted,
    datosReporte.expectedSales,
  );

  const diferencia = firstFiniteNumber(
    datosReporte.difference,
    datosReporte.diferencia,
  );

  return {
    totalContado,
    expectedSalesAdjusted,
    diferencia,
    disponible:
      totalContado !== null ||
      expectedSalesAdjusted !== null ||
      diferencia !== null,
  };
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Fila de un corte de caja en la lista del día (Vista A).
 *
 * Muestra: semáforo · hora · sucursal/cajero · total contado · diferencia.
 *
 * @example
 * ```tsx
 * <CorteListaItem corte={corte} onClick={(id) => navigate(`/supervisor/corte/${id}`)} />
 * ```
 */
export function CorteListaItem({
  corte,
  onClick,
  contextoCorrelativo,
}: CorteListaItemProps) {
  const { totalEfectivo, totalElectronico, disponible: conteoDisponible } = extraerTotalesConteo(
    corte.datos_conteo,
  );
  const {
    totalContado: totalContadoReporte,
    expectedSalesAdjusted,
    diferencia: diferenciaReporte,
    disponible: reporteDisponible,
  } = extraerTotalesReporte(corte.datos_reporte);
  const totalContadoBase = totalEfectivo + totalElectronico;
  const ventaEsperadaBase = corte.venta_esperada ?? 0;
  const totalContado = totalContadoReporte ?? totalContadoBase;
  const ventaEsperada = expectedSalesAdjusted ?? ventaEsperadaBase;
  const diferenciaCalculada = totalContado - ventaEsperada;
  const diferencia = diferenciaReporte ?? diferenciaCalculada;
  const disponible = conteoDisponible || reporteDisponible;

  // datos_verificacion siempre null en el flujo actual → ambas flags en false (Plan §8).
  const { color: colorSemaforo, razon: razonSemaforo } = calcularSemaforo({
    diferencia,
    tieneCriticasVerificacion: false,
    tieneAdvertenciasVerificacion: false,
  });

  const estadoVisible = corte.estado.replace(/_/g, ' ');
  const esCorteCerrado = corte.estado === 'FINALIZADO' || corte.estado === 'ABORTADO';
  const correlativoParseado = parseCorrelativo(corte.correlativo);
  const secuencialTexto =
    correlativoParseado.valido && correlativoParseado.secuencial !== null
      ? `Código #${String(correlativoParseado.secuencial).padStart(3, '0')}`
      : 'Código no disponible';
  const timestampOperativo = esCorteCerrado ? (corte.finalizado_at ?? corte.created_at) : corte.created_at;
  const hora = formatearHora(timestampOperativo);
  const etiquetaTemporal = esCorteCerrado ? 'Finalizado' : 'Creado';
  const nombreSucursal = corte.sucursales?.nombre ?? 'Sucursal no disponible';

  const diferenciaEsPositiva = diferencia >= 0;
  const diferenciaTexto = diferenciaEsPositiva
    ? `+${formatCurrency(diferencia)}`
    : formatCurrency(diferencia);
  const diferenciaClaseColor = diferenciaEsPositiva ? 'text-green-400' : 'text-red-400';

  return (
    <button
      type="button"
      onClick={() => onClick(corte.id)}
      className="w-full text-left rounded-2xl border border-white/12 bg-white/[0.04] px-3 py-2.5 md:px-3.5 md:py-2.5 hover:bg-white/[0.07] active:bg-white/[0.06] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      aria-label={`Ver detalle del corte ${corte.correlativo} — ${estadoVisible} — ${nombreSucursal}, ${etiquetaTemporal} ${hora}`}
    >
      <div
        data-testid="corte-item-layout"
        className="grid items-start gap-x-2.5 gap-y-1"
        style={{ gridTemplateColumns: '56px 1fr auto' }}
      >
        {/* Rail temporal */}
        <div
          data-testid="corte-item-time-rail"
          className="flex flex-col items-center justify-start gap-1"
        >
          <SemaforoIndicador color={colorSemaforo} razon={razonSemaforo} size="md" />
          <div className="text-center leading-tight">
            <p className="text-[9px] uppercase tracking-[0.1em] text-white/35">Hora</p>
            <p className="text-sm md:text-base font-medium text-white/65 tabular-nums">{hora}</p>
          </div>
        </div>

        {/* Contexto principal */}
        <div data-testid="corte-item-context" className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base md:text-lg font-semibold text-white/90 truncate leading-tight">
              {nombreSucursal}
            </p>
            <span
              className={`flex-shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide uppercase ${estadoBadgeClasses(corte.estado)}`}
            >
              {estadoVisible}
            </span>
          </div>
          <p className="text-sm md:text-base text-white/60 truncate leading-tight">
            {corte.cajero}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 md:gap-1">
            <span className="inline-flex items-center rounded-md border border-white/15 bg-white/[0.02] px-2 py-0.5 text-[11px] font-medium font-mono text-white/60">
              {corte.correlativo}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/65">
              {secuencialTexto}
            </span>
            {contextoCorrelativo && contextoCorrelativo.atraso > 0 && (
              <span className="inline-flex items-center rounded-full border border-amber-500/35 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                Atraso {contextoCorrelativo.atraso}
              </span>
            )}
          </div>

          <p className="text-[10px] text-white/40 leading-tight">
            {etiquetaTemporal} {hora}
          </p>
        </div>

        {/* Metricas */}
        <div data-testid="corte-item-metrics" className="text-right flex-shrink-0 min-w-[110px] md:min-w-[102px]">
          {disponible ? (
            <>
              <p className="text-[9px] uppercase tracking-[0.1em] text-white/35">Total</p>
              <p className="text-xl md:text-[1.55rem] font-semibold text-white/90 tabular-nums leading-none mt-0.5">
                {formatCurrency(totalContado)}
              </p>
              <p className="text-[9px] uppercase tracking-[0.1em] text-white/35 mt-1">Diferencia</p>
              <p className={`text-lg md:text-xl font-semibold tabular-nums leading-none mt-0.5 ${diferenciaClaseColor}`}>
                {diferenciaTexto}
              </p>
            </>
          ) : (
            <p className="text-xs text-white/40 italic">Sin datos</p>
          )}
        </div>
      </div>
    </button>
  );
}
