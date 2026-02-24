// 🤖 [IA] - v1.1.0: CorteOrquestador — Prefill canónico + persistencia cajero (TDD GREEN)
import { useState, useCallback } from 'react';
import type { Corte } from '@/types/auditoria';
import type { EmpleadoSucursal } from '@/hooks/useEmpleadosSucursal';
import { useEmpleadosSucursal } from '@/hooks/useEmpleadosSucursal';
import { useCorteSesion } from '@/hooks/useCorteSesion';
import { NeutralActionButton } from '@/components/ui/neutral-action-button';
import CorteInicio from './CorteInicio';

export const LAST_CASHIER_KEY = 'cashguard_last_cashier';

interface CorteOrquestadorProps {
  sucursalId: string;
  ventaEsperada?: number;
  onCorteIniciado: (corte: Corte) => void;
  onCancelar: () => void;
}

export default function CorteOrquestador({
  sucursalId,
  ventaEsperada,
  onCorteIniciado,
  onCancelar,
}: CorteOrquestadorProps) {
  const { empleados, cargando, error } = useEmpleadosSucursal(sucursalId);
  const { iniciarCorte } = useCorteSesion(sucursalId);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  // Prefill: buscar último cajero en localStorage
  const nombreGuardado =
    typeof window !== 'undefined'
      ? localStorage.getItem(LAST_CASHIER_KEY)
      : null;
  const empleadoPrecargado =
    nombreGuardado != null
      ? (empleados.find((e) => e.nombre === nombreGuardado) ?? null)
      : null;

  const handleConfirmar = useCallback(
    async (cajero: EmpleadoSucursal, testigo: EmpleadoSucursal) => {
      setErrorLocal(null);
      try {
        const corte = await iniciarCorte({
          sucursal_id: sucursalId,
          cajero: cajero.nombre,
          testigo: testigo.nombre,
          venta_esperada: ventaEsperada,
        });
        localStorage.setItem(LAST_CASHIER_KEY, cajero.nombre);
        onCorteIniciado(corte);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Error al iniciar corte';
        setErrorLocal(msg);
      }
    },
    [iniciarCorte, sucursalId, ventaEsperada, onCorteIniciado],
  );

  return (
    <div
      data-testid="corte-orquestador-shell"
      className="glass-morphism-panel space-y-fluid-lg max-w-[min(92vw,640px)] mx-auto"
    >
      {errorLocal && (
        <p role="alert" className="wizard-error-feedback text-fluid-xs text-red-300">
          {errorLocal}
        </p>
      )}
      <CorteInicio
        empleadosDeSucursal={empleados}
        empleadoPrecargado={empleadoPrecargado}
        cargandoEmpleados={cargando}
        errorEmpleados={error}
        onConfirmar={handleConfirmar}
      />
      <NeutralActionButton
        type="button"
        onClick={onCancelar}
        aria-label="Cancelar y volver al wizard"
        className="w-full sm:w-auto"
      >
        Cancelar
      </NeutralActionButton>
    </div>
  );
}
