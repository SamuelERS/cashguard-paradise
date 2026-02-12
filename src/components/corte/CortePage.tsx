// 🤖 [IA] - v1.0.0: Pagina contenedora del flujo de corte de caja — seleccion de sucursal + montaje de CorteOrquestador
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Building2, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useSucursales } from '../../hooks/useSucursales';
import { CorteOrquestador } from './CorteOrquestador';
import { NeutralActionButton } from '@/components/ui/neutral-action-button';
import type { Sucursal } from '@/types/auditoria';

export interface CortePageProps {
  onSalir?: () => void;
}

export const CortePage: React.FC<CortePageProps> = ({ onSalir }) => {
  const { sucursales, cargando, error, recargar } = useSucursales();
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState<string | null>(null);

  const nombreSucursalSeleccionada = useMemo(
    () => sucursales.find((s: Sucursal) => s.id === sucursalSeleccionada)?.nombre ?? '',
    [sucursales, sucursalSeleccionada]
  );

  // Preserve the name for potential future breadcrumb use
  void nombreSucursalSeleccionada;

  // Auto-seleccion cuando solo hay 1 sucursal activa
  useEffect(() => {
    if (!cargando && !error && sucursales.length === 1 && sucursalSeleccionada === null) {
      setSucursalSeleccionada(sucursales[0].id);
    }
  }, [cargando, error, sucursales, sucursalSeleccionada]);

  const handleSeleccionar = useCallback((id: string) => {
    setSucursalSeleccionada(id);
  }, []);

  const handleVolverAlPicker = useCallback(() => {
    setSucursalSeleccionada(null);
  }, []);

  // A) CARGANDO
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center p-[clamp(1rem,4vw,2rem)]">
        <div
          data-testid="carga-sucursales"
          className="rounded-2xl p-[clamp(2rem,6vw,3rem)] text-center"
          style={{
            background: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <Loader2
            className="mx-auto animate-spin text-blue-400"
            style={{ width: 'clamp(2rem, 8vw, 3rem)', height: 'clamp(2rem, 8vw, 3rem)' }}
          />
          <p
            className="mt-4 text-[clamp(0.875rem,2.5vw,1.125rem)]"
            style={{ color: '#8899a6' }}
          >
            Cargando sucursales...
          </p>
        </div>
      </div>
    );
  }

  // B) ERROR
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-[clamp(1rem,4vw,2rem)]">
        <div
          data-testid="error-sucursales"
          className="rounded-2xl p-[clamp(2rem,6vw,3rem)] text-center max-w-md w-full"
          style={{
            background: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <AlertCircle
            className="mx-auto text-red-400"
            style={{ width: 'clamp(2rem, 8vw, 3rem)', height: 'clamp(2rem, 8vw, 3rem)' }}
          />
          <p
            className="mt-4 text-[clamp(0.875rem,2.5vw,1.125rem)]"
            style={{ color: '#e1e8ed' }}
          >
            {error}
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <NeutralActionButton onClick={() => recargar()}>
              Reintentar
            </NeutralActionButton>
            <NeutralActionButton onClick={() => onSalir?.()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </NeutralActionButton>
          </div>
        </div>
      </div>
    );
  }

  // E) SIN SUCURSALES
  if (sucursales.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-[clamp(1rem,4vw,2rem)]">
        <div
          className="rounded-2xl p-[clamp(2rem,6vw,3rem)] text-center max-w-md w-full"
          style={{
            background: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          <Building2
            className="mx-auto text-gray-400"
            style={{ width: 'clamp(2rem, 8vw, 3rem)', height: 'clamp(2rem, 8vw, 3rem)' }}
          />
          <p
            className="mt-4 text-[clamp(0.875rem,2.5vw,1.125rem)]"
            style={{ color: '#8899a6' }}
          >
            No hay sucursales activas disponibles
          </p>
          <div className="mt-6">
            <NeutralActionButton onClick={() => onSalir?.()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </NeutralActionButton>
          </div>
        </div>
      </div>
    );
  }

  // D) ORQUESTADOR — Sucursal ya seleccionada
  if (sucursalSeleccionada !== null) {
    return (
      <div data-testid="orquestador-montado">
        <CorteOrquestador
          sucursales={sucursales}
          sucursalId={sucursalSeleccionada}
          onSalir={handleVolverAlPicker}
        />
      </div>
    );
  }

  // C) SELECCION_SUCURSAL — Picker de sucursales
  return (
    <div className="min-h-screen p-[clamp(1rem,4vw,2rem)]">
      <div
        data-testid="picker-sucursales"
        className="max-w-2xl mx-auto"
      >
        <div className="text-center mb-[clamp(1.5rem,4vw,2.5rem)]">
          <h1
            className="text-[clamp(1.25rem,4vw,1.75rem)] font-bold"
            style={{ color: '#e1e8ed' }}
          >
            Seleccionar Sucursal
          </h1>
          <p
            className="mt-2 text-[clamp(0.8rem,2vw,1rem)]"
            style={{ color: '#8899a6' }}
          >
            Elija la sucursal para iniciar el corte de caja
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-[clamp(0.75rem,3vw,1.25rem)]">
          {sucursales.map((sucursal: Sucursal) => (
            <button
              key={sucursal.id}
              type="button"
              data-testid={`sucursal-card-${sucursal.id}`}
              onClick={() => handleSeleccionar(sucursal.id)}
              className="rounded-2xl p-[clamp(1.25rem,4vw,2rem)] text-left transition-all duration-200 cursor-pointer"
              style={{
                background: 'rgba(36, 36, 36, 0.4)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.35)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <div className="flex items-center gap-[clamp(0.75rem,2vw,1rem)]">
                <Building2
                  className="text-blue-400 shrink-0"
                  style={{ width: 'clamp(1.5rem, 5vw, 2rem)', height: 'clamp(1.5rem, 5vw, 2rem)' }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-[clamp(0.95rem,2.5vw,1.125rem)] truncate"
                    style={{ color: '#e1e8ed' }}
                  >
                    {sucursal.nombre}
                  </p>
                </div>
                <span
                  className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold shrink-0"
                  style={{
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#93c5fd',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                  }}
                >
                  {sucursal.codigo}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-[clamp(1.5rem,4vw,2.5rem)] text-center">
          <NeutralActionButton onClick={() => onSalir?.()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </NeutralActionButton>
        </div>
      </div>
    </div>
  );
};
