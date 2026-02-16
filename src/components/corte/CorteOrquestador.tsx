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
  // Hook de sesión — desestructurado para que ESLint rastree deps individuales
  // 🤖 [IA] - Fix OT-02: Evita warning "missing dependency: sesion" en useCallback
  // -----------------------------------------------------------------------
  const {
    corte_actual,
    intento_actual,
    cargando: sesionCargando,
    error: sesionError,
    iniciarCorte,
    finalizarCorte,
    abortarCorte,
    reiniciarIntento,
  } = useCorteSesion(sucursalId);

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
    if (!inicializado && sesionCargando) return 'cargando_inicial';

    // 2. Resumen de aborto (copia local)
    if (corteParaResumen !== null) return 'resumen';

    // 3. Corte en estado terminal (FINALIZADO / ABORTADO)
    if (
      corte_actual !== null &&
      ESTADOS_TERMINALES.includes(corte_actual.estado)
    ) {
      return 'resumen';
    }

    // 4. Corte activo no confirmado → reanudación
    if (corte_actual !== null && !sesionConfirmada) return 'reanudacion';

    // 5. Corte activo confirmado → progreso
    if (corte_actual !== null && sesionConfirmada) return 'progreso';

    // 6. Sin corte activo → inicio
    return 'inicio';
  })();

  // -----------------------------------------------------------------------
  // useEffect de inicialización
  // -----------------------------------------------------------------------

  useEffect(() => {
    // Marcar como inicializado cuando el hook deja de cargar
    // por primera vez (recuperarSesion completó)
    if (!sesionCargando && !inicializado) {
      setInicializado(true);
    }
  }, [sesionCargando, inicializado]);

  // -----------------------------------------------------------------------
  // Handlers (todos con useCallback)
  // -----------------------------------------------------------------------

  const handleIniciarCorte = useCallback(async (params: IniciarCorteParams) => {
    try {
      await iniciarCorte(params);
      setSesionConfirmada(true);
    } catch {
      // Error ya está en sesionError
    }
  }, [iniciarCorte]);

  const handleCancelarInicio = useCallback(() => {
    if (onSalir) onSalir();
  }, [onSalir]);

  const handleReanudar = useCallback(() => {
    setSesionConfirmada(true);
  }, []);

  const handleNuevoIntento = useCallback(async (motivo: string) => {
    try {
      await reiniciarIntento(motivo);
      setSesionConfirmada(true);
    } catch {
      // Error ya está en sesionError
    }
  }, [reiniciarIntento]);

  // CRÍTICO: Preservar corte ANTES de abortar porque
  // abortarCorte() del hook pone corte_actual en null
  const handleAbortarCorte = useCallback(async (motivo: string) => {
    if (!corte_actual) return;
    const cortePreAbort = { ...corte_actual };
    try {
      await abortarCorte(motivo);
      // Marcar como abortado en la copia local
      setCorteParaResumen({
        ...cortePreAbort,
        estado: 'ABORTADO' as const,
        motivo_aborto: motivo,
        finalizado_at: new Date().toISOString(),
      });
    } catch {
      // Error ya está en sesionError
    }
  }, [corte_actual, abortarCorte]);

  // 🤖 [IA] - v1.1.1: Handler conteo completado — Orden #013 + Fix OT-02
  const handleConteoCompletado = useCallback(async () => {
    if (!corte_actual) return;
    try {
      // Generar SHA-256 del snapshot de datos del corte para integridad del reporte
      const payload = JSON.stringify({
        corte_id: corte_actual.id,
        correlativo: corte_actual.correlativo,
        datos_conteo: corte_actual.datos_conteo,
        datos_entrega: corte_actual.datos_entrega,
        datos_verificacion: corte_actual.datos_verificacion,
        finalizado_at: new Date().toISOString(),
      });
      const encoded = new TextEncoder().encode(payload);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      await finalizarCorte(hashHex);
    } catch {
      // Error ya está en sesionError
    }
  }, [corte_actual, finalizarCorte]);

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
            cargando={sesionCargando}
            onIniciar={handleIniciarCorte}
            onCancelar={handleCancelarInicio}
            error={sesionError}
          />
        )}

        {vistaActual === 'reanudacion' && corte_actual && (
          <CorteReanudacion
            corte={corte_actual}
            intento={intento_actual}
            cargando={sesionCargando}
            onReanudar={handleReanudar}
            onNuevoIntento={handleNuevoIntento}
            onAbortarCorte={handleAbortarCorte}
          />
        )}

        {vistaActual === 'progreso' && corte_actual && (
          <CorteConteoAdapter
            corte={corte_actual}
            intento={intento_actual}
            sucursalNombre={resolverNombreSucursal(corte_actual)}
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

        {vistaActual === 'resumen' && !corteParaResumen && corte_actual && (
          <CorteResumen
            corte={corte_actual}
            nombreSucursal={resolverNombreSucursal(corte_actual)}
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
