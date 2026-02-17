// 🤖 [IA] - v1.1.0: Preselección sucursal + localStorage empleados — OT-14
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
  DollarSign,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Interface de Props
// ---------------------------------------------------------------------------

interface CorteInicioProps {
  /** Lista de sucursales disponibles (filtradas a activas por el padre) */
  sucursales: Sucursal[];
  /** Indica si hay una operación async en curso */
  cargando: boolean;
  /** Llamado cuando el usuario completa los pasos y confirma */
  onIniciar: (params: IniciarCorteParams) => void;
  /** Llamado cuando el usuario cancela el proceso */
  onCancelar: () => void;
  /** Mensaje de error del padre (ej: "Ya existe un corte activo") */
  error?: string | null;
  /** ID de la sucursal preseleccionada por el padre (ej: CorteOrquestador) */
  sucursalPreseleccionadaId?: string;
  /** Si true, omite el paso de selección de sucursal (wizard de 3 pasos) */
  omitirPasoSucursal?: boolean;
  /** Lista de empleados activos para la sucursal seleccionada */
  empleadosDisponibles?: string[];
  /** Estado de carga de empleados registrados */
  cargandoEmpleados?: boolean;
  /** Error al cargar empleados registrados */
  errorEmpleados?: string | null;
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const NOMBRE_MIN_LENGTH = 3;
const STORAGE_KEY_PREFIX = 'cashguard:corte:empleados';

// ---------------------------------------------------------------------------
// Helpers localStorage — OT-14
// ---------------------------------------------------------------------------

function leerEmpleadosCache(
  sucursalId: string | null | undefined,
): { cajero: string; testigo: string } {
  if (!sucursalId) return { cajero: '', testigo: '' };
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}:${sucursalId}`);
    if (!raw) return { cajero: '', testigo: '' };
    const data = JSON.parse(raw) as Record<string, unknown>;
    return {
      cajero: typeof data.cajero === 'string' ? data.cajero : '',
      testigo: typeof data.testigo === 'string' ? data.testigo : '',
    };
  } catch {
    return { cajero: '', testigo: '' };
  }
}

function guardarEmpleadosCache(
  sucursalId: string,
  cajero: string,
  testigo: string,
): void {
  try {
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}:${sucursalId}`,
      JSON.stringify({
        cajero,
        testigo,
        updatedAt: new Date().toISOString(),
      }),
    );
  } catch {
    // localStorage puede estar lleno o no disponible
  }
}

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

function CorteInicio({
  sucursales,
  cargando,
  onIniciar,
  onCancelar,
  error,
  sucursalPreseleccionadaId,
  omitirPasoSucursal = false,
  empleadosDisponibles = [],
  cargandoEmpleados = false,
  errorEmpleados = null,
}: CorteInicioProps) {
  // 🤖 [IA] - OT-14: Wizard dinámico — 3 pasos si sucursal preseleccionada, 4 si no
  const omitir = omitirPasoSucursal && !!sucursalPreseleccionadaId;
  const totalPasos = omitir ? 3 : 4;
  const pasoCajero = omitir ? 1 : 2;
  const pasoTestigo = omitir ? 2 : 3;
  const pasoVenta = omitir ? 3 : 4;

  const [paso, setPaso] = useState(1);
  const [sucursalId, setSucursalId] = useState<string | null>(() => {
    if (sucursalPreseleccionadaId) return sucursalPreseleccionadaId;
    return sucursales.length === 1 ? sucursales[0].id : null;
  });

  // 🤖 [IA] - OT-14: Precargar empleados desde localStorage
  const sucIdParaCache =
    sucursalPreseleccionadaId ??
    (sucursales.length === 1 ? sucursales[0].id : null);
  const [cajero, setCajero] = useState(
    () => leerEmpleadosCache(sucIdParaCache).cajero,
  );
  const [testigo, setTestigo] = useState(
    () => leerEmpleadosCache(sucIdParaCache).testigo,
  );
  const [ventaEsperada, setVentaEsperada] = useState<string>('');

  // Validaciones derivadas
  const cajeroValido = cajero.trim().length >= NOMBRE_MIN_LENGTH;
  const testigoValido = testigo.trim().length >= NOMBRE_MIN_LENGTH;
  const testigoIgualCajero =
    testigo.trim().length > 0 &&
    testigo.trim().toLowerCase() === cajero.trim().toLowerCase();
  const empleadosTestigo = empleadosDisponibles.filter(
    (nombre) => nombre.trim().toLowerCase() !== cajero.trim().toLowerCase(),
  );

  const handleSiguiente = () => {
    if (paso < totalPasos) setPaso(paso + 1);
  };

  const handleAnterior = () => {
    if (paso > 1) setPaso(paso - 1);
  };

  const handleIniciar = () => {
    if (!sucursalId) return;
    // 🤖 [IA] - OT-14: Persistir empleados en localStorage
    guardarEmpleadosCache(sucursalId, cajero.trim(), testigo.trim());
    const params: IniciarCorteParams = {
      sucursal_id: sucursalId,
      cajero: cajero.trim(),
      testigo: testigo.trim(),
    };
    const parsed = parseFloat(ventaEsperada);
    if (ventaEsperada.trim() !== '' && !isNaN(parsed) && parsed >= 0) {
      params.venta_esperada = parsed;
    }
    onIniciar(params);
  };

  // Progreso visual
  const porcentajePaso = (paso / totalPasos) * 100;

  // Etiqueta del paso actual
  const etiquetaPaso = (() => {
    if (!omitir && paso === 1) return 'Seleccionar Sucursal';
    if (paso === pasoCajero) return 'Identificar Cajero';
    if (paso === pasoTestigo) return 'Identificar Testigo';
    if (paso === pasoVenta) return 'Venta Esperada SICAR';
    return '';
  })();

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
              <span>Paso {paso} de {totalPasos}</span>
              <span>{etiquetaPaso}</span>
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
        {/* Paso Sucursal (solo si NO se omite) */}
        {/* ----------------------------------------------------------------- */}
        {!omitir && paso === 1 && (
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
        {/* Paso Cajero */}
        {/* ----------------------------------------------------------------- */}
        {paso === pasoCajero && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#8899a6] text-sm">
              <User className="w-4 h-4" />
              <span>Ingrese el nombre del cajero que realiza el corte</span>
            </div>

            <input
              type="text"
              list="empleados-cajero-list"
              placeholder="Nombre completo del cajero"
              value={cajero}
              onChange={(e) => setCajero(e.target.value)}
              disabled={cargando}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-sm text-[#e1e8ed] placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <datalist id="empleados-cajero-list">
              {empleadosDisponibles.map((nombre) => (
                <option key={`cajero-${nombre}`} value={nombre} />
              ))}
            </datalist>

            {cargandoEmpleados && (
              <p className="text-xs text-slate-500">Cargando empleados registrados...</p>
            )}

            {!cargandoEmpleados && errorEmpleados && (
              <p className="text-xs text-red-400">
                No se pudo cargar empleados registrados: {errorEmpleados}
              </p>
            )}

            {!cargandoEmpleados && !errorEmpleados && empleadosDisponibles.length > 0 && (
              <p className="text-xs text-slate-400">
                Empleados registrados: {empleadosDisponibles.length}
              </p>
            )}

            {cajero.trim().length > 0 && !cajeroValido && (
              <p className="text-xs text-slate-500">
                Minimo {NOMBRE_MIN_LENGTH} caracteres ({cajero.trim().length}/{NOMBRE_MIN_LENGTH})
              </p>
            )}

            {/* Botones */}
            <div className="flex gap-3">
              {paso > 1 && (
                <NeutralActionButton
                  onClick={handleAnterior}
                  disabled={cargando}
                  className="flex-1 gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </NeutralActionButton>
              )}
              <NeutralActionButton
                onClick={handleSiguiente}
                disabled={!cajeroValido || cargando}
                className={`${paso > 1 ? 'flex-1' : 'w-full'} gap-2`}
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </NeutralActionButton>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Paso Testigo */}
        {/* ----------------------------------------------------------------- */}
        {paso === pasoTestigo && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#8899a6] text-sm">
              <Eye className="w-4 h-4" />
              <span>Ingrese el nombre del testigo que supervisa el corte</span>
            </div>

            <input
              type="text"
              list="empleados-testigo-list"
              placeholder="Nombre completo del testigo"
              value={testigo}
              onChange={(e) => setTestigo(e.target.value)}
              disabled={cargando}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-sm text-[#e1e8ed] placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />
            <datalist id="empleados-testigo-list">
              {empleadosTestigo.map((nombre) => (
                <option key={`testigo-${nombre}`} value={nombre} />
              ))}
            </datalist>

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
              <NeutralActionButton
                onClick={handleSiguiente}
                disabled={!testigoValido || testigoIgualCajero || cargando}
                className="flex-1 gap-2"
              >
                Siguiente
                <ArrowRight className="w-4 h-4" />
              </NeutralActionButton>
            </div>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Paso Venta Esperada SICAR */}
        {/* ----------------------------------------------------------------- */}
        {paso === pasoVenta && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#8899a6] text-sm">
              <DollarSign className="w-4 h-4" />
              <span>Ingrese la venta esperada segun SICAR (opcional)</span>
            </div>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej: 653.65"
              value={ventaEsperada}
              onChange={(e) => setVentaEsperada(e.target.value)}
              disabled={cargando}
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg p-3 text-sm text-[#e1e8ed] placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            />

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
                disabled={cargando}
                className="flex-1 gap-2"
              >
                <Play className="w-4 h-4" />
                Iniciar Corte
              </ConstructiveActionButton>
            </div>

            <NeutralActionButton
              onClick={() => {
                // 🤖 [IA] - OT-14: Persistir empleados + iniciar sin venta esperada
                if (!sucursalId) return;
                guardarEmpleadosCache(sucursalId, cajero.trim(), testigo.trim());
                const params: IniciarCorteParams = {
                  sucursal_id: sucursalId,
                  cajero: cajero.trim(),
                  testigo: testigo.trim(),
                };
                onIniciar(params);
              }}
              disabled={cargando}
              className="w-full"
            >
              Omitir
            </NeutralActionButton>
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
