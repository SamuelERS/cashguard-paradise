// 🤖 [IA] - v1.0.0: Componente resumen de corte — Orden #007
import type { Corte } from '../../types/auditoria';
import { ConstructiveActionButton } from '../shared/ConstructiveActionButton';
import { NeutralActionButton } from '../ui/neutral-action-button';
import {
  CheckCircle,
  XCircle,
  User,
  Eye,
  Layers,
  Hash,
  Clock,
  Timer,
  Building2,
  ShieldCheck,
  Fingerprint,
  AlertTriangle,
  Share2,
  X,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Interface de Props
// ---------------------------------------------------------------------------

interface CorteResumenProps {
  /** Corte en estado terminal (FINALIZADO o ABORTADO) */
  corte: Corte;
  /** Nombre de la sucursal (resuelto por el padre desde sucursal_id) */
  nombreSucursal: string;
  /** Callback para cerrar/salir del resumen */
  onCerrar: () => void;
  /** Callback opcional para compartir el recibo */
  onCompartir?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers internos (no exportados)
// ---------------------------------------------------------------------------

/** Convierte timestamp ISO 8601 a formato legible es-SV */
function formatearFecha(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleString('es-SV', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

/** Calcula duracion legible entre dos timestamps ISO 8601 */
function calcularDuracion(inicio: string, fin: string): string {
  try {
    const msInicio = new Date(inicio).getTime();
    const msFin = new Date(fin).getTime();

    if (isNaN(msInicio) || isNaN(msFin)) return 'Duración desconocida';

    const diffMs = msFin - msInicio;
    if (diffMs < 0) return 'Duración desconocida';

    const totalMinutes = Math.floor(diffMs / 60_000);

    if (totalMinutes < 1) return 'Menos de un minuto';

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
    }

    const hoursText = hours === 1 ? '1 hora' : `${hours} horas`;

    if (minutes === 0) return hoursText;

    const minutesText = minutes === 1 ? '1 minuto' : `${minutes} minutos`;
    return `${hoursText} y ${minutesText}`;
  } catch {
    return 'Duración desconocida';
  }
}

/** Convierte numero de fase a texto descriptivo */
function mapearFase(fase: number): string {
  switch (fase) {
    case 1: return 'Fase 1: Conteo de Efectivo';
    case 2: return 'Fase 2: Entrega a Gerencia';
    case 3: return 'Fase 3: Reporte Final';
    default: return 'Fase desconocida';
  }
}

/** Trunca hash largo a formato legible */
function truncarHash(hash: string): string {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

function CorteResumen({
  corte,
  nombreSucursal,
  onCerrar,
  onCompartir,
}: CorteResumenProps) {
  const esFinalizado = corte.estado === 'FINALIZADO';

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/15 p-6 space-y-6"
        style={{
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* SECCION 1: Header con icono + titulo */}
        <div className="flex items-center gap-3">
          {esFinalizado ? (
            <CheckCircle className="w-6 h-6 text-green-400 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-400 shrink-0" />
          )}
          <h1 className="text-xl font-bold text-[#e1e8ed]">
            {esFinalizado ? 'Corte Finalizado' : 'Corte Abortado'}
          </h1>
        </div>

        {/* SECCION 2: Correlativo + Badge Estado */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-mono text-sm bg-slate-800 text-[#e1e8ed] px-3 py-1 rounded-full">
            {corte.correlativo}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full border ${
              esFinalizado
                ? 'bg-green-900/60 text-green-300 border-green-700'
                : 'bg-red-900/60 text-red-300 border-red-700'
            }`}
          >
            {esFinalizado ? 'Finalizado' : 'Abortado'}
          </span>
        </div>

        {/* SECCION 3: Card de Metadata */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-3">
          <div className="space-y-2 text-sm text-[#8899a6]">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 shrink-0" />
              <span>{nombreSucursal}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 shrink-0" />
              <span>Cajero: {corte.cajero}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 shrink-0" />
              <span>Testigo: {corte.testigo}</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 shrink-0" />
              <span>{mapearFase(corte.fase_actual)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 shrink-0" />
              <span>Intento #{corte.intento_actual}</span>
            </div>
          </div>
        </div>

        {/* SECCION 4: Timeline */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-3">
          <div className="space-y-2 text-sm text-[#8899a6]">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>Inicio: {formatearFecha(corte.created_at)}</span>
            </div>
            {corte.finalizado_at && (
              <>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>Fin: {formatearFecha(corte.finalizado_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 shrink-0" />
                  <span>Duración: {calcularDuracion(corte.created_at, corte.finalizado_at)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* SECCION 5: Bloque especifico por estado */}
        {esFinalizado ? (
          <div className="rounded-xl border border-green-900/50 bg-green-950/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-green-300">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Reporte verificado</span>
            </div>
            {corte.reporte_hash && (
              <div className="flex items-center gap-2 text-xs text-[#8899a6]">
                <Fingerprint className="w-4 h-4 shrink-0" />
                <span className="font-mono select-all">{truncarHash(corte.reporte_hash)}</span>
              </div>
            )}
            <p className="text-xs text-[#8899a6]">Fase completada: 3 de 3</p>
          </div>
        ) : (
          <div className="rounded-xl border border-red-900/50 bg-red-950/40 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-red-300">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Corte abortado</span>
            </div>
            {corte.motivo_aborto && (
              <p className="text-sm text-red-300">Motivo: {corte.motivo_aborto}</p>
            )}
            <p className="text-xs text-[#8899a6]">Abortado en: {mapearFase(corte.fase_actual)}</p>
          </div>
        )}

        {/* SECCION 6: Botones de accion */}
        <div className="flex flex-col gap-3">
          {onCompartir && (
            <ConstructiveActionButton
              onClick={onCompartir}
              className="w-full gap-2"
            >
              <Share2 className="w-4 h-4" />
              Compartir Recibo
            </ConstructiveActionButton>
          )}
          <NeutralActionButton
            onClick={onCerrar}
            className="w-full gap-2"
          >
            <X className="w-4 h-4" />
            Cerrar
          </NeutralActionButton>
        </div>
      </div>
    </div>
  );
}

export { CorteResumen };
export type { CorteResumenProps };
