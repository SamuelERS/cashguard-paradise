// 🤖 [IA] - v1.0.0: Componente de reanudacion de corte — Orden #005
import React, { useState } from 'react';
import type { Corte, CorteIntento, EstadoCorte } from '../../types/auditoria';
import { ConstructiveActionButton } from '../shared/ConstructiveActionButton';
import { DestructiveActionButton } from '../shared/DestructiveActionButton';
import { NeutralActionButton } from '../ui/neutral-action-button';
import {
  RefreshCw,
  XCircle,
  AlertTriangle,
  User,
  Eye,
  Clock,
  Layers,
  Hash,
  Loader2,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Interface de Props
// ---------------------------------------------------------------------------

interface CorteReanudacionProps {
  /** Corte activo encontrado en el servidor */
  corte: Corte;
  /** Intento activo actual (puede ser null si no se encontró) */
  intento: CorteIntento | null;
  /** Indica si hay una operación async en curso */
  cargando: boolean;
  /** Llamado cuando el usuario elige reanudar el corte existente */
  onReanudar: () => void;
  /** Llamado cuando el usuario crea nuevo intento (motivo obligatorio) */
  onNuevoIntento: (motivo: string) => void;
  /** Llamado cuando el usuario aborta el corte completo (motivo obligatorio) */
  onAbortarCorte: (motivo: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers internos (no exportados)
// ---------------------------------------------------------------------------

/** Convierte numero de fase a texto descriptivo */
function mapearFase(fase: number): string {
  switch (fase) {
    case 0: return 'Sin iniciar';
    case 1: return 'Fase 1: Conteo de Efectivo';
    case 2: return 'Fase 2: Entrega a Gerencia';
    case 3: return 'Fase 3: Reporte Final';
    default: return 'Fase desconocida';
  }
}

/** Formatea timestamp ISO 8601 a formato legible es-SV */
function formatearFecha(isoString: string): string {
  try {
    const date = new Date(isoString);
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

/** Retorna label y clases CSS para el badge de estado */
function mapearEstadoBadge(estado: EstadoCorte): { label: string; color: string } {
  switch (estado) {
    case 'INICIADO':
      return { label: 'Iniciado', color: 'bg-blue-900/60 text-blue-300 border-blue-700' };
    case 'EN_PROGRESO':
      return { label: 'En Progreso', color: 'bg-amber-900/60 text-amber-300 border-amber-700' };
    default:
      return { label: estado, color: 'bg-slate-800 text-slate-400 border-slate-600' };
  }
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const MOTIVO_MIN_LENGTH = 10;

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

function CorteReanudacion({
  corte,
  intento,
  cargando,
  onReanudar,
  onNuevoIntento,
  onAbortarCorte,
}: CorteReanudacionProps) {
  // Estado interno: secciones expandibles (mutual exclusion)
  const [mostrarNuevoIntento, setMostrarNuevoIntento] = useState(false);
  const [motivoNuevoIntento, setMotivoNuevoIntento] = useState('');
  const [mostrarAbortar, setMostrarAbortar] = useState(false);
  const [motivoAbortar, setMotivoAbortar] = useState('');

  const estadoBadge = mapearEstadoBadge(corte.estado);

  // Toggle handlers con mutual exclusion
  const toggleNuevoIntento = () => {
    setMostrarNuevoIntento((prev) => !prev);
    setMostrarAbortar(false);
  };

  const toggleAbortar = () => {
    setMostrarAbortar((prev) => !prev);
    setMostrarNuevoIntento(false);
  };

  const handleConfirmarNuevoIntento = () => {
    onNuevoIntento(motivoNuevoIntento.trim());
  };

  const handleConfirmarAborto = () => {
    onAbortarCorte(motivoAbortar.trim());
  };

  const motivoNuevoIntentoValido = motivoNuevoIntento.trim().length >= MOTIVO_MIN_LENGTH;
  const motivoAbortarValido = motivoAbortar.trim().length >= MOTIVO_MIN_LENGTH;

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
        {/* Titulo principal */}
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          <h1 className="text-xl font-bold text-[#e1e8ed]">Corte Activo Detectado</h1>
        </div>

        {/* Card de informacion del corte */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-3">
          {/* Correlativo + badge estado */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-mono text-sm bg-slate-800 text-[#e1e8ed] px-3 py-1 rounded-full">
              {corte.correlativo}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${estadoBadge.color}`}>
              {estadoBadge.label}
            </span>
          </div>

          {/* Detalles del corte */}
          <div className="space-y-2 text-sm text-[#8899a6]">
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
              <span>Intento #{intento?.attempt_number ?? corte.intento_actual}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              <span>{formatearFecha(corte.created_at)}</span>
            </div>
          </div>
        </div>

        {/* Texto explicativo */}
        <p className="text-sm text-[#8899a6]">
          Se encontró un corte de caja pendiente. Seleccione una acción:
        </p>

        {/* Indicador de carga */}
        {cargando && (
          <div className="flex items-center justify-center gap-2 text-sm text-[#8899a6]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Procesando...</span>
          </div>
        )}

        {/* Accion: Reanudar Corte */}
        <ConstructiveActionButton
          onClick={onReanudar}
          disabled={cargando}
          className="w-full gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reanudar Corte
        </ConstructiveActionButton>

        {/* Accion: Nuevo Intento (toggle) */}
        <div className="space-y-3">
          <NeutralActionButton
            onClick={toggleNuevoIntento}
            disabled={cargando}
            className="w-full gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Nuevo Intento
          </NeutralActionButton>

          {mostrarNuevoIntento && (
            <div className="space-y-3 pl-2 border-l-2 border-slate-700">
              <label className="block text-sm text-[#e1e8ed]">Motivo del reinicio:</label>
              <textarea
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-sm text-[#e1e8ed] placeholder-slate-500 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describa por que reinicia el conteo..."
                value={motivoNuevoIntento}
                onChange={(e) => setMotivoNuevoIntento(e.target.value)}
                readOnly={cargando}
              />
              <p className="text-xs text-slate-500">
                Minimo {MOTIVO_MIN_LENGTH} caracteres ({motivoNuevoIntento.trim().length}/{MOTIVO_MIN_LENGTH})
              </p>
              <ConstructiveActionButton
                onClick={handleConfirmarNuevoIntento}
                disabled={!motivoNuevoIntentoValido || cargando}
                className="w-full gap-2"
              >
                Confirmar Nuevo Intento
              </ConstructiveActionButton>
            </div>
          )}
        </div>

        {/* Accion: Abortar Corte (toggle) */}
        <div className="space-y-3">
          <DestructiveActionButton
            onClick={toggleAbortar}
            disabled={cargando}
            className="w-full gap-2"
          >
            <XCircle className="w-4 h-4" />
            Abortar Corte
          </DestructiveActionButton>

          {mostrarAbortar && (
            <div className="space-y-3 pl-2 border-l-2 border-red-900">
              <label className="block text-sm text-[#e1e8ed]">Motivo del aborto:</label>
              <textarea
                className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-sm text-[#e1e8ed] placeholder-slate-500 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Describa por que aborta este corte..."
                value={motivoAbortar}
                onChange={(e) => setMotivoAbortar(e.target.value)}
                readOnly={cargando}
              />
              <p className="text-xs text-slate-500">
                Minimo {MOTIVO_MIN_LENGTH} caracteres ({motivoAbortar.trim().length}/{MOTIVO_MIN_LENGTH})
              </p>
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Esta acción es IRREVERSIBLE. El corte quedará registrado como ABORTADO permanentemente.
                </span>
              </div>
              <DestructiveActionButton
                onClick={handleConfirmarAborto}
                disabled={!motivoAbortarValido || cargando}
                className="w-full gap-2"
              >
                Confirmar Aborto
              </DestructiveActionButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { CorteReanudacion };
export type { CorteReanudacionProps };
