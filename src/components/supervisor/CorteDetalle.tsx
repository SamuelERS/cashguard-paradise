// 🤖 [IA] - Orden #5 DACC Dashboard Supervisor — CorteDetalle (Vista B)
// Detalle completo de un corte de caja: semáforo, meta, resumen financiero,
// desglose de efectivo y pagos electrónicos.
// Solo lectura — sin side effects financieros.

import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSupervisorQueries } from '@/hooks/useSupervisorQueries';
import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';
import { calculateCashTotal, formatCurrency } from '@/utils/calculations';
import type { CashCount } from '@/types/cash';
import { calcularSemaforo } from '@/utils/semaforoLogic';
import { SemaforoIndicador } from './SemaforoIndicador';

// ---------------------------------------------------------------------------
// Tipos internos
// ---------------------------------------------------------------------------

type PagosElectronicos = {
  credomatic: number;
  promerica: number;
  bankTransfer: number;
  paypal: number;
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
  disponible: boolean;
} {
  if (!datosConteo) {
    return {
      cashCount: {},
      totalEfectivo: 0,
      pagosElectronicos: { credomatic: 0, promerica: 0, bankTransfer: 0, paypal: 0 },
      totalElectronico: 0,
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

  return { cashCount, totalEfectivo, pagosElectronicos, totalElectronico, disponible: true };
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
  const { cargando, error, obtenerCorteDetalle } = useSupervisorQueries();

  const [corte, setCorte] = useState<CorteConSucursal | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);

  // ── Carga de datos ────────────────────────────────────────────────────────

  const cargarDetalle = useCallback(async () => {
    if (!id) {
      setNoEncontrado(true);
      return;
    }
    const resultado = await obtenerCorteDetalle(id);
    if (resultado === null) {
      setNoEncontrado(true);
    } else {
      setCorte(resultado);
    }
  }, [id, obtenerCorteDetalle]);

  useEffect(() => {
    void cargarDetalle();
  }, [cargarDetalle]);

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
            onClick={() => void cargarDetalle()}
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
  const totalContado = datos.totalEfectivo + datos.totalElectronico;
  const ventaEsperada = corte.venta_esperada ?? 0;
  const diferencia = totalContado - ventaEsperada;

  // datos_verificacion siempre null (Plan §8) → flags en false
  const { color: colorSemaforo, razon: razonSemaforo } = calcularSemaforo({
    diferencia: datos.disponible ? diferencia : 0,
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

  const denominacionesConDatos = DENOMINACIONES.filter(
    d => (datos.cashCount[d.key] ?? 0) > 0,
  );

  const pagosConValor = (
    Object.keys(datos.pagosElectronicos) as Array<keyof PagosElectronicos>
  ).filter(key => datos.pagosElectronicos[key] > 0);

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
          <h2 className="text-base font-semibold text-white/90">
            Corte #{corte.correlativo}
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            {formatearFechaHora(corte.finalizado_at)}
          </p>
        </div>
      </div>

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
        {datos.disponible ? (
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
