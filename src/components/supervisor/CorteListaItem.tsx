// 🤖 [IA] - Orden #3 DACC Dashboard Supervisor — CorteListaItem
// Fila clickeable de un corte de caja en la lista del día.
// Extrae totales de datos_conteo (JSONB) de forma defensiva y calcula semáforo.

import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';
import { calculateCashTotal, formatCurrency } from '@/utils/calculations';
import type { CashCount } from '@/types/cash';
import { calcularSemaforo } from '@/utils/semaforoLogic';
import { SemaforoIndicador } from './SemaforoIndicador';

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface CorteListaItemProps {
  corte: CorteConSucursal;
  onClick: (id: string) => void;
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
export function CorteListaItem({ corte, onClick }: CorteListaItemProps) {
  const { totalEfectivo, totalElectronico, disponible } = extraerTotalesConteo(
    corte.datos_conteo,
  );
  const totalContado = totalEfectivo + totalElectronico;
  const ventaEsperada = corte.venta_esperada ?? 0;
  const diferencia = totalContado - ventaEsperada;

  // datos_verificacion siempre null en el flujo actual → ambas flags en false (Plan §8).
  const { color: colorSemaforo, razon: razonSemaforo } = calcularSemaforo({
    diferencia,
    tieneCriticasVerificacion: false,
    tieneAdvertenciasVerificacion: false,
  });

  const estadoVisible = corte.estado.replace(/_/g, ' ');
  const esCorteCerrado = corte.estado === 'FINALIZADO' || corte.estado === 'ABORTADO';
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
      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.06] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
      aria-label={`Ver detalle del corte ${corte.correlativo} — ${estadoVisible} — ${nombreSucursal}, ${etiquetaTemporal} ${hora}`}
    >
      {/* Semáforo */}
      <SemaforoIndicador color={colorSemaforo} razon={razonSemaforo} size="md" />

      {/* Hora */}
      <span className="text-sm text-white/60 w-14 flex-shrink-0 tabular-nums">{hora}</span>

      {/* Sucursal + cajero */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <p className="text-sm font-medium text-white/90 truncate leading-tight">
            {nombreSucursal}
          </p>
          <span
            className={`flex-shrink-0 px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide uppercase ${estadoBadgeClasses(corte.estado)}`}
          >
            {estadoVisible}
          </span>
        </div>
        <p className="text-xs text-white/50 truncate leading-tight mt-0.5">{corte.cajero}</p>
        <p className="text-[11px] text-white/35 leading-tight mt-1">
          {etiquetaTemporal} {hora}
        </p>
      </div>

      {/* Totales */}
      <div className="text-right flex-shrink-0">
        {disponible ? (
          <>
            <p className="text-sm font-medium text-white/90 tabular-nums leading-tight">
              {formatCurrency(totalContado)}
            </p>
            <p className={`text-xs tabular-nums leading-tight mt-0.5 ${diferenciaClaseColor}`}>
              {diferenciaTexto}
            </p>
          </>
        ) : (
          <p className="text-xs text-white/40 italic">Sin datos</p>
        )}
      </div>
    </button>
  );
}
