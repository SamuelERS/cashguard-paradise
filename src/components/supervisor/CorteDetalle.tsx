// 🤖 [IA] - Orden #5 DACC Dashboard Supervisor — CorteDetalle (Vista B)
// Detalle completo de un corte de caja: semáforo, meta, resumen financiero,
// desglose de efectivo y pagos electrónicos.
// Solo lectura — sin side effects financieros.

import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupervisorCorteDetalleFeed } from '@/hooks/supervisor/useSupervisorCorteDetalleFeed';
import { calculateCashTotal, formatCurrency } from '@/utils/calculations';
import type { CashCount } from '@/types/cash';
import { calcularSemaforo } from '@/utils/semaforoLogic';
import { SemaforoIndicador } from './SemaforoIndicador';
import { SupervisorLiveBadge } from './SupervisorLiveBadge';

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

type PagosElectronicos = {
  credomatic: number;
  promerica: number;
  bankTransfer: number;
  paypal: number;
};

type GastoDia = {
  id: string;
  concept: string;
  amount: number;
  category: string;
  timestamp: string | null;
  hasInvoice: boolean;
};

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const DENOMINACIONES: ReadonlyArray<{
  key: keyof CashCount;
  label: string;
  valorUnitario: number;
}> = [
  { key: 'penny', label: '1¢', valorUnitario: 0.01 },
  { key: 'nickel', label: '5¢', valorUnitario: 0.05 },
  { key: 'dime', label: '10¢', valorUnitario: 0.1 },
  { key: 'quarter', label: '25¢', valorUnitario: 0.25 },
  { key: 'dollarCoin', label: '$1 moneda', valorUnitario: 1 },
  { key: 'bill1', label: '$1', valorUnitario: 1 },
  { key: 'bill5', label: '$5', valorUnitario: 5 },
  { key: 'bill10', label: '$10', valorUnitario: 10 },
  { key: 'bill20', label: '$20', valorUnitario: 20 },
  { key: 'bill50', label: '$50', valorUnitario: 50 },
  { key: 'bill100', label: '$100', valorUnitario: 100 },
];

const LABEL_PAGO: Record<keyof PagosElectronicos, string> = {
  credomatic: 'Credomatic',
  promerica: 'Promerica',
  bankTransfer: 'Transferencia bancaria',
  paypal: 'PayPal',
};

// ---------------------------------------------------------------------------
// Helpers privados
// ---------------------------------------------------------------------------

/**
 * Formatea una fecha ISO como día/hora en formato 12h (zona El Salvador).
 * Retorna '—' si el string es nulo o inválido.
 */
function formatearFechaHora(isoString: string | null): string {
  if (!isoString) return '—';
  try {
    return new Intl.DateTimeFormat('es', {
      timeZone: 'America/El_Salvador',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date(isoString));
  } catch {
    return '—';
  }
}

/**
 * Extrae totales desde el JSONB datos_conteo de forma defensiva.
 *
 * @remarks
 * - Todos los accesos a campos JSONB usan guards typeof (sin casts directos).
 * - datos_verificacion y datos_entrega siempre son null en flujo actual (Plan §8).
 * - Si datos_conteo es null o malformado, retorna disponible=false.
 */
function extraerDatosConteo(datosConteo: Record<string, unknown> | null): {
  cashCount: Partial<CashCount>;
  totalEfectivo: number;
  pagosElectronicos: PagosElectronicos;
  totalElectronico: number;
  gastosDia: GastoDia[];
  disponible: boolean;
} {
  if (!datosConteo) {
    return {
      cashCount: {},
      totalEfectivo: 0,
      pagosElectronicos: { credomatic: 0, promerica: 0, bankTransfer: 0, paypal: 0 },
      totalElectronico: 0,
      gastosDia: [],
      disponible: false,
    };
  }

  // ── Efectivo ──────────────────────────────────────────────────────────────
  let cashCount: Partial<CashCount> = {};
  const conteoParcialRaw = datosConteo.conteo_parcial;
  if (
    typeof conteoParcialRaw === 'object' &&
    conteoParcialRaw !== null &&
    !Array.isArray(conteoParcialRaw)
  ) {
    cashCount = conteoParcialRaw as Partial<CashCount>;
  }
  const totalEfectivoRaw = calculateCashTotal(cashCount);
  const totalEfectivo = Number.isFinite(totalEfectivoRaw) ? totalEfectivoRaw : 0;

  // ── Electrónicos ──────────────────────────────────────────────────────────
  const pagosElectronicos: PagosElectronicos = {
    credomatic: 0,
    promerica: 0,
    bankTransfer: 0,
    paypal: 0,
  };
  const pagosRaw = datosConteo.pagos_electronicos;
  if (
    typeof pagosRaw === 'object' &&
    pagosRaw !== null &&
    !Array.isArray(pagosRaw)
  ) {
    const p = pagosRaw as Record<string, unknown>;
    pagosElectronicos.credomatic = typeof p.credomatic === 'number' ? p.credomatic : 0;
    pagosElectronicos.promerica = typeof p.promerica === 'number' ? p.promerica : 0;
    pagosElectronicos.bankTransfer = typeof p.bankTransfer === 'number' ? p.bankTransfer : 0;
    pagosElectronicos.paypal = typeof p.paypal === 'number' ? p.paypal : 0;
  }
  const totalElectronico =
    pagosElectronicos.credomatic +
    pagosElectronicos.promerica +
    pagosElectronicos.bankTransfer +
    pagosElectronicos.paypal;

  // ── Gastos del día ────────────────────────────────────────────────────────
  const gastosDia: GastoDia[] = [];
  const gastosRaw = datosConteo.gastos_dia;
  const gastosItemsRaw = (
    Array.isArray(gastosRaw)
      ? gastosRaw
      : (typeof gastosRaw === 'object' &&
          gastosRaw !== null &&
          !Array.isArray(gastosRaw) &&
          Array.isArray((gastosRaw as Record<string, unknown>).items))
        ? (gastosRaw as Record<string, unknown>).items
        : []
  ) as unknown[];

  for (const item of gastosItemsRaw) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) continue;
    const record = item as Record<string, unknown>;
    const amount = typeof record.amount === 'number' ? record.amount : 0;
    if (!Number.isFinite(amount) || amount <= 0) continue;

    gastosDia.push({
      id: typeof record.id === 'string' ? record.id : `gasto-${gastosDia.length + 1}`,
      concept: typeof record.concept === 'string' ? record.concept : 'Gasto sin concepto',
      amount,
      category: typeof record.category === 'string' ? record.category : 'Sin categoría',
      timestamp: typeof record.timestamp === 'string' ? record.timestamp : null,
      hasInvoice: record.hasInvoice === true,
    });
  }

  return {
    cashCount,
    totalEfectivo,
    pagosElectronicos,
    totalElectronico,
    gastosDia,
    disponible: true,
  };
}

function extraerDatosEntrega(
  datosEntrega: Record<string, unknown> | null,
): { amountToDeliver: number | null; amountRemaining: number | null } {
  if (!datosEntrega) {
    return { amountToDeliver: null, amountRemaining: null };
  }

  const amountToDeliverRaw =
    typeof datosEntrega.amount_to_deliver === 'number'
      ? datosEntrega.amount_to_deliver
      : typeof datosEntrega.amountToDeliver === 'number'
        ? datosEntrega.amountToDeliver
        : null;

  const amountRemainingRaw =
    typeof datosEntrega.amount_remaining === 'number'
      ? datosEntrega.amount_remaining
      : typeof datosEntrega.amountRemaining === 'number'
        ? datosEntrega.amountRemaining
        : null;

  return {
    amountToDeliver: Number.isFinite(amountToDeliverRaw ?? NaN) ? amountToDeliverRaw : null,
    amountRemaining: Number.isFinite(amountRemainingRaw ?? NaN) ? amountRemainingRaw : null,
  };
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

function extraerResumenReporte(datosReporte: Record<string, unknown> | null): {
  totalContado: number | null;
  ventaEsperada: number | null;
  diferencia: number | null;
  disponible: boolean;
} {
  if (!datosReporte) {
    return {
      totalContado: null,
      ventaEsperada: null,
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

  const ventaEsperada = firstFiniteNumber(
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
    ventaEsperada,
    diferencia,
    disponible:
      totalContado !== null ||
      ventaEsperada !== null ||
      diferencia !== null,
  };
}

// ---------------------------------------------------------------------------
// Sub-componente privado
// ---------------------------------------------------------------------------

function MetaFila({
  label,
  valor,
  mono = false,
  destacado = false,
  colorClase,
}: {
  label: string;
  valor: string;
  mono?: boolean;
  destacado?: boolean;
  /** Clases de color personalizadas (anula el color por defecto). */
  colorClase?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <span className="text-xs text-white/50">{label}</span>
      <span
        className={[
          'text-sm text-right',
          mono ? 'tabular-nums' : '',
          colorClase ?? (destacado ? 'font-semibold text-white/90' : 'text-white/80'),
        ].join(' ')}
      >
        {valor}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Vista B del Dashboard Supervisor: detalle completo de un corte de caja.
 *
 * Muestra semáforo, metadatos de identificación, resumen financiero,
 * pagos electrónicos desglosados y tabla de denominaciones.
 *
 * @example
 * ```tsx
 * // Dentro de la ruta /supervisor/corte/:id
 * <CorteDetalle />
 * ```
 */
export function CorteDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    corte,
    actualizando,
    error,
    noEncontrado,
    realtimeStatus,
    refrescar,
  } = useSupervisorCorteDetalleFeed(id);

  // ── Estados de render ────────────────────────────────────────────────────

  // Cargando inicial o error sin datos
  if (!corte && !noEncontrado) {
    if (error !== null) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 px-6 text-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <span className="text-red-400 text-xl" aria-hidden="true">!</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">No se pudo cargar el corte</p>
            <p className="text-xs text-white/40 mt-1">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => void refrescar()}
            className="mt-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/15 text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div
          className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/70 animate-spin"
          role="status"
          aria-label="Cargando detalle del corte"
        />
        <p className="text-sm text-white/50">Cargando detalle…</p>
      </div>
    );
  }

  // No encontrado
  if (noEncontrado) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-6">
        <div className="h-12 w-12 rounded-full bg-white/[0.04] flex items-center justify-center">
          <span className="text-white/30 text-xl" aria-hidden="true">?</span>
        </div>
        <div>
          <p className="text-sm font-medium text-white/60">Corte no encontrado</p>
          <p className="text-xs text-white/30 mt-1">
            El corte solicitado no existe o fue eliminado.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/15 text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        >
          Volver
        </button>
      </div>
    );
  }

  // TypeScript guard: garantiza que corte es no-null a partir de aquí
  if (!corte) return null;

  // ── Cálculos ────────────────────────────────────────────────────────────

  const datos = extraerDatosConteo(corte.datos_conteo);
  const resumenReporte = extraerResumenReporte(corte.datos_reporte);
  const totalContadoBase = datos.totalEfectivo + datos.totalElectronico;
  const ventaEsperadaBase = corte.venta_esperada ?? 0;
  const totalContado = resumenReporte.totalContado ?? totalContadoBase;
  const ventaEsperada = resumenReporte.ventaEsperada ?? ventaEsperadaBase;
  const diferenciaCalculada = totalContado - ventaEsperada;
  const diferencia = resumenReporte.diferencia ?? diferenciaCalculada;
  const resumenDisponible = datos.disponible || resumenReporte.disponible;

  // datos_verificacion siempre null (Plan §8) → flags en false
  const { color: colorSemaforo, razon: razonSemaforo } = calcularSemaforo({
    diferencia: resumenDisponible ? diferencia : 0,
    tieneCriticasVerificacion: false,
    tieneAdvertenciasVerificacion: false,
  });

  const diferenciaPositiva = diferencia >= 0;
  const diferenciaTexto = diferenciaPositiva
    ? `+${formatCurrency(diferencia)}`
    : formatCurrency(diferencia);
  const diferenciaColorClase = diferenciaPositiva
    ? 'font-semibold text-green-400'
    : 'font-semibold text-red-400';
  const porcentajeDiferencia = ventaEsperada > 0
    ? (diferencia / ventaEsperada) * 100
    : null;
  const porcentajeDiferenciaTexto = porcentajeDiferencia === null
    ? '—'
    : `${diferenciaPositiva ? '+' : ''}${porcentajeDiferencia.toFixed(1)}%`;
  const estadoColorClase = corte.estado === 'FINALIZADO'
    ? 'font-semibold text-green-400'
    : corte.estado === 'ABORTADO'
      ? 'font-semibold text-red-400'
      : 'font-semibold text-amber-300';

  const denominacionesConDatos = DENOMINACIONES.filter(
    d => (datos.cashCount[d.key] ?? 0) > 0,
  );

  const pagosConValor = (
    Object.keys(datos.pagosElectronicos) as Array<keyof PagosElectronicos>
  ).filter(key => datos.pagosElectronicos[key] > 0);
  const gastosConValor = datos.gastosDia;
  const entrega = extraerDatosEntrega(corte.datos_entrega);
  const mostrarEntrega = entrega.amountToDeliver !== null || entrega.amountRemaining !== null;

  // ── Render principal ──────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Botón volver */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="self-start flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 rounded px-1 py-0.5"
      >
        ← Volver
      </button>

      {/* Header: semáforo + correlativo + fecha */}
      <div className="flex items-center gap-3 px-1">
        <SemaforoIndicador color={colorSemaforo} razon={razonSemaforo} size="lg" />
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white/90">
              Corte #{corte.correlativo}
            </h2>
            <SupervisorLiveBadge
              status={realtimeStatus}
              actualizando={actualizando}
              spinnerAriaLabel="Actualizando detalle"
            />
          </div>
          <p className="text-xs text-white/40 mt-0.5">
            {formatearFechaHora(corte.finalizado_at)}
          </p>
        </div>
      </div>

      {/* Card: resumen ejecutivo (lectura rápida para supervisor) */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04]">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
          Resumen ejecutivo
        </p>
        <div className="divide-y divide-white/[0.06]">
          <MetaFila
            label="Estado actual"
            valor={corte.estado}
            colorClase={estadoColorClase}
          />
          <MetaFila
            label="Total contado"
            valor={formatCurrency(totalContado)}
            mono
            destacado
          />
          <MetaFila
            label="Diferencia vs SICAR"
            valor={diferenciaTexto}
            mono
            colorClase={diferenciaColorClase}
          />
          <MetaFila
            label="Diferencia porcentual"
            valor={porcentajeDiferenciaTexto}
            mono
          />
        </div>
      </div>

      {/* Card: incidencia de cierre en estado ABORTADO */}
      {corte.estado === 'ABORTADO' && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/[0.04]">
          <p className="text-xs font-medium text-red-300 uppercase tracking-wider mb-2">
            Incidencia de cierre
          </p>
          <div className="divide-y divide-white/[0.06]">
            <MetaFila
              label="Motivo de aborto"
              valor={corte.motivo_aborto?.trim() ? corte.motivo_aborto : 'Sin motivo registrado'}
            />
            <MetaFila
              label="Hora de cierre"
              valor={formatearFechaHora(corte.finalizado_at)}
            />
          </div>
        </div>
      )}

      {/* Card: identificación */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04]">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
          Identificación
        </p>
        <div className="divide-y divide-white/[0.06]">
          <MetaFila label="Sucursal" valor={corte.sucursales?.nombre ?? '—'} />
          <MetaFila label="Cajero" valor={corte.cajero} />
          {corte.testigo && <MetaFila label="Testigo" valor={corte.testigo} />}
          <MetaFila label="Estado" valor={corte.estado} />
        </div>
      </div>

      {/* Card: resumen financiero */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04]">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
          Resumen financiero
        </p>
        {resumenDisponible ? (
          <div className="divide-y divide-white/[0.06]">
            <MetaFila
              label="Efectivo contado"
              valor={formatCurrency(datos.totalEfectivo)}
              mono
              destacado
            />
            {datos.totalElectronico > 0 && (
              <MetaFila
                label="Pagos electrónicos"
                valor={formatCurrency(datos.totalElectronico)}
                mono
              />
            )}
            <MetaFila
              label="Total contado"
              valor={formatCurrency(totalContado)}
              mono
              destacado
            />
            {/* Divisor visual antes de comparación con SICAR */}
            <div className="pt-0.5" />
            <MetaFila
              label="Venta esperada (SICAR)"
              valor={formatCurrency(ventaEsperada)}
              mono
            />
            <MetaFila
              label="Diferencia"
              valor={diferenciaTexto}
              mono
              colorClase={diferenciaColorClase}
            />
          </div>
        ) : (
          <p className="text-xs text-white/40 italic py-1">Sin datos de conteo disponibles</p>
        )}
      </div>

      {/* Card: pagos electrónicos desglosados (solo si hay) */}
      {datos.disponible && pagosConValor.length > 0 && (
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04]">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
            Pagos electrónicos
          </p>
          <div className="divide-y divide-white/[0.06]">
            {pagosConValor.map(key => (
              <MetaFila
                key={key}
                label={LABEL_PAGO[key]}
                valor={formatCurrency(datos.pagosElectronicos[key])}
                mono
              />
            ))}
          </div>
        </div>
      )}

      {/* Card: entrega a gerencia (fase 2) */}
      {mostrarEntrega && (
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04]">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
            Entrega a gerencia
          </p>
          <div className="divide-y divide-white/[0.06]">
            {entrega.amountToDeliver !== null && (
              <MetaFila
                label="Monto a entregar"
                valor={formatCurrency(entrega.amountToDeliver)}
                mono
                destacado
              />
            )}
            {entrega.amountRemaining !== null && (
              <MetaFila
                label="Monto restante en caja"
                valor={formatCurrency(entrega.amountRemaining)}
                mono
              />
            )}
          </div>
        </div>
      )}

      {/* Card: gastos del día */}
      {gastosConValor.length > 0 && (
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04]">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
            Gastos del día
          </p>
          <div className="divide-y divide-white/[0.06]">
            {gastosConValor.map((gasto) => (
              <div key={gasto.id} className="flex items-center justify-between gap-2 py-1.5">
                <div className="min-w-0">
                  <p className="text-xs text-white/80 truncate">{gasto.concept}</p>
                  <p className="text-[11px] text-white/45 truncate">{gasto.category}</p>
                </div>
                <span className="text-sm tabular-nums text-white/80">
                  {formatCurrency(gasto.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card: desglose de efectivo por denominación */}
      {datos.disponible && denominacionesConDatos.length > 0 && (
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04]">
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
            Desglose efectivo
          </p>
          <div className="divide-y divide-white/[0.06]">
            {denominacionesConDatos.map(d => {
              const qty = datos.cashCount[d.key] ?? 0;
              const subtotal = qty * d.valorUnitario;
              return (
                <div key={d.key} className="flex items-center justify-between gap-2 py-1.5">
                  <span className="text-xs text-white/50">
                    {d.label} × {qty}
                  </span>
                  <span className="text-sm tabular-nums text-white/80">
                    {formatCurrency(subtotal)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
