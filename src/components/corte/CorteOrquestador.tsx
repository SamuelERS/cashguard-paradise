// 🤖 [IA] - v1.1.0: Integración CorteConteoAdapter — Orden #013
// Integra CorteInicio, CorteReanudacion, CorteResumen, CorteStatusBanner
// y CorteConteoAdapter en un flujo unificado gobernado por useCorteSesion.

import React, { useState, useEffect, useCallback } from 'react';
import type { Corte, Sucursal, IniciarCorteParams } from '../../types/auditoria';
import { ESTADOS_TERMINALES } from '../../types/auditoria';
import { useCorteSesion } from '../../hooks/useCorteSesion';
import { CorteInicio } from './CorteInicio';
import { CorteReanudacion } from './CorteReanudacion';
import { CorteResumen } from './CorteResumen';
import { CorteStatusBanner } from './CorteStatusBanner';
import { CorteConteoAdapter } from './CorteConteoAdapter';
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

  // 🤖 [IA] - v1.1.0: Handler conteo completado — Orden #013
  const handleConteoCompletado = useCallback(async () => {
    if (!sesion.corte_actual) return;
    try {
      await sesion.finalizarCorte('placeholder-hash');
    } catch {
      // Error ya está en sesion.error
    }
  }, [sesion.corte_actual, sesion.finalizarCorte]);

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
          <CorteConteoAdapter
            corte={sesion.corte_actual}
            intento={sesion.intento_actual}
            sucursalNombre={resolverNombreSucursal(sesion.corte_actual)}
            onConteoCompletado={handleConteoCompletado}
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
