// 🤖 [IA] - v1.0.0: Componente orquestador de corte de caja — Orden #009
// Integra CorteInicio, CorteReanudacion, CorteResumen, CorteStatusBanner
// y PanelProgreso en un flujo unificado gobernado por useCorteSesion.

import React, { useState, useEffect, useCallback } from 'react';
import type { Corte, Sucursal, IniciarCorteParams, CorteIntento } from '../../types/auditoria';
import { ESTADOS_TERMINALES } from '../../types/auditoria';
import { useCorteSesion } from '../../hooks/useCorteSesion';
import { CorteInicio } from './CorteInicio';
import { CorteReanudacion } from './CorteReanudacion';
import { CorteResumen } from './CorteResumen';
import { CorteStatusBanner } from './CorteStatusBanner';
import { Loader2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface CorteOrquestadorProps {
  /** Lista de sucursales activas disponibles */
  sucursales: Sucursal[];
  /** ID de la sucursal donde se opera (seleccionada por el padre) */
  sucursalId: string;
  /** Callback opcional para salir del flujo de corte */
  onSalir?: () => void;
}

type VistaOrquestador =
  | 'cargando_inicial'
  | 'inicio'
  | 'reanudacion'
  | 'progreso'
  | 'resumen';

// ---------------------------------------------------------------------------
// Componente interno: Pantalla de carga inicial
// ---------------------------------------------------------------------------

function PantallaCargaInicial() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <p className="text-sm text-[#8899a6]">
          Verificando sesión de corte...
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente interno: Panel de progreso (placeholder)
// ---------------------------------------------------------------------------

interface PanelProgresoProps {
  corte: Corte;
  intento: CorteIntento | null;
  cargando: boolean;
  onAbortarCorte: (motivo: string) => void;
}

function PanelProgreso({ corte, intento, cargando, onAbortarCorte }: PanelProgresoProps) {
  const [mostrarAbortar, setMostrarAbortar] = useState(false);
  const [motivoAbortar, setMotivoAbortar] = useState('');

  const MOTIVO_MIN_LENGTH = 10;
  const motivoValido = motivoAbortar.trim().length >= MOTIVO_MIN_LENGTH;

  const handleConfirmarAborto = () => {
    onAbortarCorte(motivoAbortar.trim());
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'transparent' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-white/15 p-6 space-y-6"
        style={{
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <h1 className="text-xl font-bold text-[#e1e8ed]">
          Corte en Progreso
        </h1>

        {/* Correlativo + Badge */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="font-mono text-sm bg-slate-800 text-[#e1e8ed] px-3 py-1 rounded-full">
            {corte.correlativo}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full border bg-blue-900/60 text-blue-300 border-blue-700">
            Fase {corte.fase_actual} de 3
          </span>
        </div>

        {/* Info del corte */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-2 text-sm text-[#8899a6]">
          <p>Cajero: {corte.cajero}</p>
          <p>Testigo: {corte.testigo}</p>
          {intento && (
            <p>Intento #{intento.attempt_number}</p>
          )}
        </div>

        {/* Placeholder para fases de conteo */}
        <div className="rounded-xl border border-dashed border-slate-600 bg-slate-800/30 p-8 text-center">
          <p className="text-sm text-[#8899a6]">
            Aquí se integrarán las fases de conteo
          </p>
          <p className="text-xs text-slate-600 mt-2">
            Fase 1: Conteo · Fase 2: Entrega · Fase 3: Reporte
          </p>
        </div>

        {/* Botón Abortar (toggle) */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setMostrarAbortar(prev => !prev)}
            disabled={cargando}
            className="w-full px-4 py-2 text-sm rounded-lg border
                      border-red-900/50 text-red-400
                      hover:bg-red-950/30 hover:border-red-700
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors"
          >
            Abortar Corte
          </button>

          {mostrarAbortar && (
            <div className="space-y-3 pl-2 border-l-2 border-red-900">
              <label className="block text-sm text-[#e1e8ed]">
                Motivo del aborto:
              </label>
              <textarea
                className="w-full bg-slate-800/60 border border-slate-700
                          rounded-lg p-3 text-sm text-[#e1e8ed]
                          placeholder-slate-500 resize-none
                          focus:ring-2 focus:ring-blue-500
                          focus:border-blue-500"
                rows={3}
                placeholder="Describa por qué aborta este corte..."
                value={motivoAbortar}
                onChange={(e) => setMotivoAbortar(e.target.value)}
                readOnly={cargando}
              />
              <p className="text-xs text-slate-500">
                Mínimo {MOTIVO_MIN_LENGTH} caracteres
                ({motivoAbortar.trim().length}/{MOTIVO_MIN_LENGTH})
              </p>
              <button
                type="button"
                onClick={handleConfirmarAborto}
                disabled={!motivoValido || cargando}
                className="w-full px-4 py-2 text-sm rounded-lg
                          bg-red-900/60 text-red-300 border border-red-700
                          hover:bg-red-800/60
                          disabled:opacity-50 disabled:cursor-not-allowed
                          transition-colors"
              >
                Confirmar Aborto
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente principal: CorteOrquestador
// ---------------------------------------------------------------------------

function CorteOrquestador({ sucursales, sucursalId, onSalir }: CorteOrquestadorProps) {
  // -----------------------------------------------------------------------
  // Hook de sesión
  // -----------------------------------------------------------------------
  const sesion = useCorteSesion(sucursalId);

  // -----------------------------------------------------------------------
  // Estado local
  // -----------------------------------------------------------------------

  // Distingue "cargando" de "no hay corte"
  const [inicializado, setInicializado] = useState(false);

  // Indica que el usuario confirmó reanudar un corte existente
  const [sesionConfirmada, setSesionConfirmada] = useState(false);

  // Preserva datos del corte para mostrar resumen después de abortar.
  // CRÍTICO: abortarCorte() del hook pone corte_actual en null,
  // por eso necesitamos guardar el corte ANTES de llamar abort.
  const [corteParaResumen, setCorteParaResumen] = useState<Corte | null>(null);

  // -----------------------------------------------------------------------
  // Determinación de vista actual (prioridad estricta)
  // -----------------------------------------------------------------------

  const vistaActual: VistaOrquestador = (() => {
    // 1. Carga inicial
    if (!inicializado && sesion.cargando) return 'cargando_inicial';

    // 2. Resumen de aborto (copia local)
    if (corteParaResumen !== null) return 'resumen';

    // 3. Corte en estado terminal (FINALIZADO / ABORTADO)
    if (
      sesion.corte_actual !== null &&
      ESTADOS_TERMINALES.includes(sesion.corte_actual.estado)
    ) {
      return 'resumen';
    }

    // 4. Corte activo no confirmado → reanudación
    if (sesion.corte_actual !== null && !sesionConfirmada) return 'reanudacion';

    // 5. Corte activo confirmado → progreso
    if (sesion.corte_actual !== null && sesionConfirmada) return 'progreso';

    // 6. Sin corte activo → inicio
    return 'inicio';
  })();

  // -----------------------------------------------------------------------
  // useEffect de inicialización
  // -----------------------------------------------------------------------

  useEffect(() => {
    // Marcar como inicializado cuando el hook deja de cargar
    // por primera vez (recuperarSesion completó)
    if (!sesion.cargando && !inicializado) {
      setInicializado(true);
    }
  }, [sesion.cargando, inicializado]);

  // -----------------------------------------------------------------------
  // Handlers (todos con useCallback)
  // -----------------------------------------------------------------------

  const handleIniciarCorte = useCallback(async (params: IniciarCorteParams) => {
    try {
      await sesion.iniciarCorte(params);
      setSesionConfirmada(true);
    } catch {
      // Error ya está en sesion.error
    }
  }, [sesion.iniciarCorte]);

  const handleCancelarInicio = useCallback(() => {
    if (onSalir) onSalir();
  }, [onSalir]);

  const handleReanudar = useCallback(() => {
    setSesionConfirmada(true);
  }, []);

  const handleNuevoIntento = useCallback(async (motivo: string) => {
    try {
      await sesion.reiniciarIntento(motivo);
      setSesionConfirmada(true);
    } catch {
      // Error ya está en sesion.error
    }
  }, [sesion.reiniciarIntento]);

  // CRÍTICO: Preservar corte ANTES de abortar porque
  // sesion.abortarCorte() pone corte_actual en null
  const handleAbortarCorte = useCallback(async (motivo: string) => {
    if (!sesion.corte_actual) return;
    const cortePreAbort = { ...sesion.corte_actual };
    try {
      await sesion.abortarCorte(motivo);
      // Marcar como abortado en la copia local
      setCorteParaResumen({
        ...cortePreAbort,
        estado: 'ABORTADO' as const,
        motivo_aborto: motivo,
        finalizado_at: new Date().toISOString(),
      });
    } catch {
      // Error ya está en sesion.error
    }
  }, [sesion.corte_actual, sesion.abortarCorte]);

  const handleCerrarResumen = useCallback(() => {
    setCorteParaResumen(null);
    setSesionConfirmada(false);
  }, []);

  // -----------------------------------------------------------------------
  // Helper: resolver nombre de sucursal
  // -----------------------------------------------------------------------

  const resolverNombreSucursal = (corte: Corte): string => {
    const sucursal = sucursales.find(s => s.id === corte.sucursal_id);
    return sucursal?.nombre ?? 'Sucursal desconocida';
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}
    >
      {/* Banner de estado — SIEMPRE visible excepto en carga inicial */}
      {vistaActual !== 'cargando_inicial' && (
        <div className="px-4 pt-4">
          <CorteStatusBanner
            estadoConexion="online"
            estadoSync="sincronizado"
            ultimaSync={null}
            pendientes={0}
          />
        </div>
      )}

      {/* Contenido principal según vista */}
      <div className="flex-1">
        {vistaActual === 'cargando_inicial' && (
          <PantallaCargaInicial />
        )}

        {vistaActual === 'inicio' && (
          <CorteInicio
            sucursales={sucursales}
            cargando={sesion.cargando}
            onIniciar={handleIniciarCorte}
            onCancelar={handleCancelarInicio}
            error={sesion.error}
          />
        )}

        {vistaActual === 'reanudacion' && sesion.corte_actual && (
          <CorteReanudacion
            corte={sesion.corte_actual}
            intento={sesion.intento_actual}
            cargando={sesion.cargando}
            onReanudar={handleReanudar}
            onNuevoIntento={handleNuevoIntento}
            onAbortarCorte={handleAbortarCorte}
          />
        )}

        {vistaActual === 'progreso' && sesion.corte_actual && (
          <PanelProgreso
            corte={sesion.corte_actual}
            intento={sesion.intento_actual}
            cargando={sesion.cargando}
            onAbortarCorte={handleAbortarCorte}
          />
        )}

        {vistaActual === 'resumen' && corteParaResumen && (
          <CorteResumen
            corte={corteParaResumen}
            nombreSucursal={resolverNombreSucursal(corteParaResumen)}
            onCerrar={handleCerrarResumen}
          />
        )}

        {vistaActual === 'resumen' && !corteParaResumen && sesion.corte_actual && (
          <CorteResumen
            corte={sesion.corte_actual}
            nombreSucursal={resolverNombreSucursal(sesion.corte_actual)}
            onCerrar={handleCerrarResumen}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { CorteOrquestador };
export type { CorteOrquestadorProps };
