// 🤖 [IA] - Orden #5 DACC Dashboard Supervisor — CorteDetalle (Vista B)
// Detalle completo de un corte de caja: semáforo, meta, resumen financiero,
// desglose de efectivo y pagos electrónicos.
// Solo lectura — sin side effects financieros.

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

const COIN_KEYS: ReadonlyArray<keyof CashCount> = [
  'penny',
  'nickel',
  'dime',
  'quarter',
  'dollarCoin',
];

const BILL_KEYS: ReadonlyArray<keyof CashCount> = [
  'bill1',
  'bill5',
  'bill10',
  'bill20',
  'bill50',
  'bill100',
];

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

function parseIsoTimestamp(isoString: string | null): number {
  if (!isoString) return 0;
  const parsed = Date.parse(isoString);
  return Number.isFinite(parsed) ? parsed : 0;
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

type EntregaLiveEvent = {
  stepKey: keyof CashCount;
  quantity: number;
  subtotal: number;
  capturedAt: string | null;
};

type EntregaLiveRow = {
  stepKey: keyof CashCount;
  label: string;
  expected: number;
  delivered: number;
  missing: number;
  lastCapturedAt: string | null;
};

const LIVE_DENOMINATION_LABELS: Record<keyof CashCount, string> = {
  penny: 'Un centavo',
  nickel: 'Cinco centavos',
  dime: 'Diez centavos',
  quarter: 'Veinticinco centavos',
  dollarCoin: 'Moneda de un dólar',
  bill1: 'Billete de un dólar',
  bill5: 'Billete de cinco dólares',
  bill10: 'Billete de diez dólares',
  bill20: 'Billete de veinte dólares',
  bill50: 'Billete de cincuenta dólares',
  bill100: 'Billete de cien dólares',
};

function toPartialCashCount(value: unknown): Partial<Record<keyof CashCount, number>> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return {};
  }

  const record = value as Record<string, unknown>;
  const result: Partial<Record<keyof CashCount, number>> = {};

  for (const denomination of DENOMINACIONES) {
    const raw = record[denomination.key];
    if (typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) {
      result[denomination.key] = raw;
    }
  }

  return result;
}

function toEntregaLiveEvents(value: unknown): EntregaLiveEvent[] {
  if (!Array.isArray(value)) return [];

  const events: EntregaLiveEvent[] = [];
  for (const item of value) {
    if (typeof item !== 'object' || item === null || Array.isArray(item)) continue;
    const record = item as Record<string, unknown>;
    const stepKey = record.stepKey;
    const quantity = record.quantity;
    const subtotal = record.subtotal;
    if (typeof stepKey !== 'string') continue;
    if (!DENOMINACIONES.some((denomination) => denomination.key === stepKey)) continue;
    if (typeof quantity !== 'number' || !Number.isFinite(quantity)) continue;
    if (typeof subtotal !== 'number' || !Number.isFinite(subtotal)) continue;

    events.push({
      stepKey: stepKey as keyof CashCount,
      quantity,
      subtotal,
      capturedAt: typeof record.capturedAt === 'string' ? record.capturedAt : null,
    });
  }

  return events;
}

function extraerEntregaLiveRows(
  datosEntrega: Record<string, unknown> | null,
): { rows: EntregaLiveRow[]; liveTotal: number } {
  if (!datosEntrega) return { rows: [], liveTotal: 0 };

  const expected = toPartialCashCount(datosEntrega.denominations_to_deliver);
  const delivered = toPartialCashCount(datosEntrega.live_delivery_progress);
  const events = toEntregaLiveEvents(datosEntrega.live_delivery_events);
  const liveTotalRaw = datosEntrega.live_delivery_total;
  const liveTotal =
    typeof liveTotalRaw === 'number' && Number.isFinite(liveTotalRaw)
      ? liveTotalRaw
      : events.reduce((acc, item) => acc + item.subtotal, 0);

  const rows = DENOMINACIONES
    .filter((denomination) => (expected[denomination.key] ?? 0) > 0)
    .map((denomination) => {
      const expectedValue = expected[denomination.key] ?? 0;
      const deliveredValue = delivered[denomination.key] ?? 0;
      const lastEvent = [...events].reverse().find((event) => event.stepKey === denomination.key);
      return {
        stepKey: denomination.key,
        label: LIVE_DENOMINATION_LABELS[denomination.key],
        expected: expectedValue,
        delivered: deliveredValue,
        missing: Math.max(expectedValue - deliveredValue, 0),
        lastCapturedAt: lastEvent?.capturedAt ?? null,
      };
    })
    .sort((a, b) => {
      const timeDiff = parseIsoTimestamp(b.lastCapturedAt) - parseIsoTimestamp(a.lastCapturedAt);
      if (timeDiff !== 0) return timeDiff;
      return a.label.localeCompare(b.label, 'es');
    });

  return { rows, liveTotal };
}

function sumarSubtotalPorDenominaciones(
  cashCount: Partial<CashCount>,
  keys: ReadonlyArray<keyof CashCount>,
): number {
  return keys.reduce((acumulado, key) => {
    const denominacion = DENOMINACIONES.find((item) => item.key === key);
    if (!denominacion) return acumulado;
    const cantidad = cashCount[key] ?? 0;
    return acumulado + (cantidad * denominacion.valorUnitario);
  }, 0);
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
  const entregaLive = extraerEntregaLiveRows(corte.datos_entrega);
  const entregadoAcumulado = entregaLive.liveTotal;
  const faltanteEntrega = Math.max((entrega.amountToDeliver ?? 0) - entregadoAcumulado, 0);
  const mostrarEntrega = entrega.amountToDeliver !== null || entrega.amountRemaining !== null;
  const objetivoEntrega = entrega.amountToDeliver ?? 0;
  const progresoEntrega = objetivoEntrega > 0
    ? Math.min((entregadoAcumulado / objetivoEntrega) * 100, 100)
    : 0;
  const subtotalMonedas = sumarSubtotalPorDenominaciones(datos.cashCount, COIN_KEYS);
  const subtotalBilletes = sumarSubtotalPorDenominaciones(datos.cashCount, BILL_KEYS);
  const prioridadSupervision = corte.estado === 'ABORTADO'
    ? 'Crítica'
    : Math.abs(diferencia) > 25
      ? 'Alta'
      : Math.abs(diferencia) > 10
        ? 'Media'
        : 'Controlada';
  const prioridadColorClase = prioridadSupervision === 'Crítica'
    ? 'text-red-300'
    : prioridadSupervision === 'Alta'
      ? 'text-amber-300'
      : prioridadSupervision === 'Media'
        ? 'text-yellow-200'
        : 'text-emerald-300';
  const cardClassName = 'p-4 rounded-xl border border-white/10 bg-white/[0.04]';
  const actividadBaseMs = parseIsoTimestamp(corte.updated_at ?? corte.created_at);
  const actividadEntregaLiveMs = entregaLive.rows.reduce(
    (maximo, row) => Math.max(maximo, parseIsoTimestamp(row.lastCapturedAt)),
    0,
  );
  const actividadGastosMs = gastosConValor.reduce(
    (maximo, gasto) => Math.max(maximo, parseIsoTimestamp(gasto.timestamp)),
    0,
  );
  type OperationalCard = {
    key: string;
    activityMs: number;
    fallbackOrder: number;
    node: JSX.Element;
  };
  const operationalCards: OperationalCard[] = [];

  if (entregaLive.rows.length > 0) {
    operationalCards.push({
      key: 'entrega-live',
      activityMs: actividadEntregaLiveMs || actividadBaseMs,
      fallbackOrder: 10,
      node: (
        <div key="entrega-live" className={`${cardClassName} border-cyan-500/20`} aria-live="polite">
          <p className="text-xs font-medium text-cyan-200/80 uppercase tracking-wider mb-2">
            Progreso de entrega en vivo
          </p>
          <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden mb-3">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300"
              style={{ width: `${progresoEntrega === 0 ? 0 : Math.max(progresoEntrega, 4)}%` }}
            />
          </div>
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06] mb-2">
            <span className="text-xs text-white/50">Entregado acumulado</span>
            <span className="text-sm tabular-nums text-white/90">
              {formatCurrency(entregadoAcumulado)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06] mb-2">
            <span className="text-xs text-white/50">Faltante por entregar</span>
            <span className="text-sm tabular-nums text-amber-300">
              {formatCurrency(faltanteEntrega)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-white/[0.06] mb-2">
            <span className="text-xs text-white/50">Cumplimiento</span>
            <span className="text-sm tabular-nums text-cyan-200">
              {progresoEntrega.toFixed(1)}%
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-white/50">
                  <th className="text-left py-1">Denominación</th>
                  <th className="text-right py-1">Esperado</th>
                  <th className="text-right py-1">Entregado</th>
                  <th className="text-right py-1">Faltante</th>
                  <th className="text-right py-1">Hora</th>
                </tr>
              </thead>
              <tbody>
                {entregaLive.rows.map((row) => (
                  <tr key={row.stepKey} className="border-t border-white/[0.06]">
                    <td className="py-1.5 text-white/80">{row.label}</td>
                    <td className="py-1.5 text-right tabular-nums text-white/70">{row.expected}</td>
                    <td className="py-1.5 text-right tabular-nums text-white/90">{row.delivered}</td>
                    <td className="py-1.5 text-right tabular-nums text-amber-300">{row.missing}</td>
                    <td className="py-1.5 text-right text-white/50">{formatearFechaHora(row.lastCapturedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    });
  }

  if (mostrarEntrega) {
    operationalCards.push({
      key: 'entrega-gerencia',
      activityMs: Math.max(actividadEntregaLiveMs, actividadBaseMs),
      fallbackOrder: 20,
      node: (
        <div key="entrega-gerencia" className={cardClassName}>
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
      ),
    });
  }

  if (gastosConValor.length > 0) {
    operationalCards.push({
      key: 'gastos-dia',
      activityMs: actividadGastosMs || actividadBaseMs,
      fallbackOrder: 30,
      node: (
        <div key="gastos-dia" className={cardClassName}>
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
      ),
    });
  }

  operationalCards.push({
    key: 'resumen-financiero',
    activityMs: actividadBaseMs,
    fallbackOrder: 40,
    node: (
      <div key="resumen-financiero" className={cardClassName}>
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
    ),
  });

  if (datos.disponible && pagosConValor.length > 0) {
    operationalCards.push({
      key: 'pagos-electronicos',
      activityMs: actividadBaseMs,
      fallbackOrder: 50,
      node: (
        <div key="pagos-electronicos" className={cardClassName}>
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
      ),
    });
  }

  if (datos.disponible && denominacionesConDatos.length > 0) {
    operationalCards.push({
      key: 'desglose-efectivo',
      activityMs: actividadBaseMs,
      fallbackOrder: 60,
      node: (
        <div key="desglose-efectivo" className={cardClassName}>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider mb-2">
            Desglose efectivo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
            <div className="rounded-lg border border-white/[0.08] bg-black/20 p-2.5">
              <p className="text-[11px] uppercase tracking-wider text-white/45">
                Subtotal monedas
              </p>
              <p className="mt-1 text-sm tabular-nums text-white/90">
                {formatCurrency(subtotalMonedas)}
              </p>
            </div>
            <div className="rounded-lg border border-white/[0.08] bg-black/20 p-2.5">
              <p className="text-[11px] uppercase tracking-wider text-white/45">
                Subtotal billetes
              </p>
              <p className="mt-1 text-sm tabular-nums text-white/90">
                {formatCurrency(subtotalBilletes)}
              </p>
            </div>
          </div>
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
      ),
    });
  }

  const operationalCardsOrdenadas = [...operationalCards].sort((a, b) => {
    const activityDiff = b.activityMs - a.activityMs;
    if (activityDiff !== 0) return activityDiff;
    return a.fallbackOrder - b.fallbackOrder;
  });

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

      {/* Card: panel operativo compacto */}
      <section
        aria-label="panel operativo del corte"
        className={`${cardClassName} border-cyan-500/20 bg-gradient-to-r from-cyan-500/[0.08] to-blue-500/[0.03]`}
      >
        <p className="text-xs font-medium text-cyan-200/80 uppercase tracking-wider mb-3">
          Panel operativo del corte
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wider text-white/45 mb-1.5">Snapshot</p>
            <div className="divide-y divide-white/[0.06]">
              <MetaFila
                label="Estado"
                valor={corte.estado}
                colorClase={estadoColorClase}
              />
              <MetaFila
                label="Prioridad supervisión"
                valor={prioridadSupervision}
                colorClase={`font-semibold ${prioridadColorClase}`}
              />
              <MetaFila
                label="Fase"
                valor={`Fase ${corte.fase_actual}`}
                colorClase="font-semibold text-white/90"
              />
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wider text-white/45 mb-1.5">KPIs</p>
            <div className="divide-y divide-white/[0.06]">
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

          <div className="rounded-lg border border-white/[0.08] bg-black/25 px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wider text-white/45 mb-1.5">Contexto</p>
            <div className="divide-y divide-white/[0.06]">
              <MetaFila label="Sucursal" valor={corte.sucursales?.nombre ?? '—'} />
              <MetaFila label="Cajero" valor={corte.cajero} />
              {corte.testigo && <MetaFila label="Testigo" valor={corte.testigo} />}
            </div>
          </div>
        </div>
      </section>

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

      {operationalCardsOrdenadas.map((card) => card.node)}
    </div>
  );
}
