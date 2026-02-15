// 🤖 [IA] - v1.0.0: Componente wizard inicio de corte — Orden #008
import React, { useState } from 'react';
import type { Sucursal, IniciarCorteParams } from '../../types/auditoria';
import { ConstructiveActionButton } from '../shared/ConstructiveActionButton';
import { DestructiveActionButton } from '../shared/DestructiveActionButton';
import { NeutralActionButton } from '../ui/neutral-action-button';
import {
  Building2,
  User,
  Eye,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Play,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Interface de Props
// ---------------------------------------------------------------------------

interface CorteInicioProps {
  /** Lista de sucursales disponibles (filtradas a activas por el padre) */
  sucursales: Sucursal[];
  /** Indica si hay una operación async en curso */
  cargando: boolean;
  /** Llamado cuando el usuario completa los 3 pasos y confirma */
  onIniciar: (params: IniciarCorteParams) => void;
  /** Llamado cuando el usuario cancela el proceso */
  onCancelar: () => void;
  /** Mensaje de error del padre (ej: "Ya existe un corte activo") */
  error?: string | null;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const NOMBRE_MIN_LENGTH = 3;

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

function CorteInicio({
  sucursales,
  cargando,
  onIniciar,
  onCancelar,
  error,
}: CorteInicioProps) {
  const [paso, setPaso] = useState(1);
  const [sucursalId, setSucursalId] = useState<string | null>(() => {
    // Auto-seleccionar si hay exactamente 1 sucursal
    return sucursales.length === 1 ? sucursales[0].id : null;
  });
  const [cajero, setCajero] = useState('');
  const [testigo, setTestigo] = useState('');

  // Validaciones derivadas
  const cajeroValido = cajero.trim().length >= NOMBRE_MIN_LENGTH;
  const testigoValido = testigo.trim().length >= NOMBRE_MIN_LENGTH;
  const testigoIgualCajero =
    testigo.trim().length > 0 &&
    testigo.trim().toLowerCase() === cajero.trim().toLowerCase();

  const handleSiguiente = () => {
    if (paso < 3) setPaso(paso + 1);
  };

  const handleAnterior = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  const handleIniciar = () => {
    if (!sucursalId) return;
    onIniciar({
      sucursal_id: sucursalId,
      cajero: cajero.trim(),
      testigo: testigo.trim(),
    });
  };

  // Progreso visual
  const porcentajePaso = (paso / 3) * 100;

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
        {/* Error del padre */}
        {error && (
          <div className="flex items-start gap-2 text-sm text-red-300 bg-red-900/60 border border-red-700 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Header con titulo e indicador de paso */}
        <div className="space-y-3">
          <h1 className="text-xl font-bold text-[#e1e8ed]">Iniciar Corte de Caja</h1>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm text-[#8899a6]">
              <span>Paso {paso} de 3</span>
              <span>
                {paso === 1 && 'Seleccionar Sucursal'}
                {paso === 2 && 'Identificar Cajero'}
                {paso === 3 && 'Identificar Testigo'}
              </span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${porcentajePaso}%` }}
              />
            </div>
          </div>
        </div>

        {/* Indicador de carga */}
        {cargando && (
          <div className="flex items-center justify-center gap-2 text-sm text-[#8899a6]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Iniciando corte...</span>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Paso 1: Seleccion de Sucursal */}
        {/* ----------------------------------------------------------------- */}
        {paso === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#8899a6] text-sm">
              <Building2 className="w-4 h-4" />
              <span>Seleccione la sucursal donde se realizará el corte</span>
            </div>

            {sucursales.length === 0 ? (
              <div className="text-center py-8 text-[#8899a6] text-sm">
                No hay sucursales disponibles
              </div>
            ) : (
              <div className="space-y-2">
                {sucursales.map((suc) => (
                  <button
                    key={suc.id}
                    type="button"
                    disabled={cargando}
                    onClick={() => setSucursalId(suc.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-colors duration-200 ${
                      sucursalId === suc.id
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'
                    } ${cargando ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[#e1e8ed] font-medium">{suc.nombre}</span>
                      <span className="text-xs font-mono bg-slate-800 text-[#8899a6] px-2 py-0.5 rounded-full border border-slate-700">
                        {suc.codigo}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Boton Siguiente */}
            <NeutralActionButton
              onClick={handleSiguiente}
              disabled={!sucursalId || cargando}
              className="w-full gap-2"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </NeutralActionButton>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Paso 2: Identificacion del Cajero */}
        {/* ----------------------------------------------------------------- */}
        {paso === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#8899a6] text-sm">
              <User className="w-4 h-4" />
              <span>Ingrese el nombre del cajero que realiza el corte</span>
            </div>

            <input
              type="text"
              placeholder="Nombre completo del cajero"
              value={cajero}
              onChange={(e) => setCajero(e.target.value)}
              disabled={cargando}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-sm text-[#e1e8ed] placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />

            {cajero.trim().length > 0 && !cajeroValido && (
              <p className="text-xs text-slate-500">
                Minimo {NOMBRE_MIN_LENGTH} caracteres ({cajero.trim().length}/{NOMBRE_MIN_LENGTH})
              </p>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <NeutralActionButton
                onClick={handleAnterior}
                disabled={cargando}
                className="flex-1 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </NeutralActionButton>
              <NeutralActionButton
                onClick={handleSiguiente}
                disabled={!cajeroValido || cargando}
                className="flex-1 gap-2"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </NeutralActionButton>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Paso 3: Identificacion del Testigo */}
        {/* ----------------------------------------------------------------- */}
        {paso === 3 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#8899a6] text-sm">
              <Eye className="w-4 h-4" />
              <span>Ingrese el nombre del testigo que supervisa el corte</span>
            </div>

            <input
              type="text"
              placeholder="Nombre completo del testigo"
              value={testigo}
              onChange={(e) => setTestigo(e.target.value)}
              disabled={cargando}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-sm text-[#e1e8ed] placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />

            {/* Error: testigo === cajero */}
            {testigoIgualCajero && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-950/40 border border-red-900/50 rounded-lg p-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>El testigo debe ser una persona diferente al cajero</span>
              </div>
            )}

            {testigo.trim().length > 0 && !testigoValido && !testigoIgualCajero && (
              <p className="text-xs text-slate-500">
                Minimo {NOMBRE_MIN_LENGTH} caracteres ({testigo.trim().length}/{NOMBRE_MIN_LENGTH})
              </p>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              <NeutralActionButton
                onClick={handleAnterior}
                disabled={cargando}
                className="flex-1 gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </NeutralActionButton>
              <ConstructiveActionButton
                onClick={handleIniciar}
                disabled={!testigoValido || testigoIgualCajero || cargando}
                className="flex-1 gap-2"
              >
                <Play className="w-4 h-4" />
                Iniciar Corte
              </ConstructiveActionButton>
            </div>
          </div>
        )}

        {/* Boton Cancelar (siempre visible) */}
        <DestructiveActionButton
          onClick={onCancelar}
          disabled={cargando}
          className="w-full gap-2 !bg-transparent !border-slate-700 !text-slate-400 hover:!bg-red-950/30 hover:!border-red-900 hover:!text-red-400"
        >
          Cancelar
        </DestructiveActionButton>
      </div>
    </div>
  );
}

export { CorteInicio };
export type { CorteInicioProps };
