// 🤖 [IA] - v1.0.0: CorteOrquestador — Wires hooks Supabase → CorteInicio (TDD GREEN)
import { useState, useCallback } from 'react';
import type { Corte } from '@/types/auditoria';
import type { EmpleadoSucursal } from '@/hooks/useEmpleadosSucursal';
import { useEmpleadosSucursal } from '@/hooks/useEmpleadosSucursal';
import { useCorteSesion } from '@/hooks/useCorteSesion';
import CorteInicio from './CorteInicio';

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
      ? localStorage.getItem('lastCashier')
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
    <div>
      {errorLocal && <p role="alert">{errorLocal}</p>}
      <CorteInicio
        empleadosDeSucursal={empleados}
        empleadoPrecargado={empleadoPrecargado}
        cargandoEmpleados={cargando}
        errorEmpleados={error}
        onConfirmar={handleConfirmar}
      />
      <button type="button" onClick={onCancelar}>
        Cancelar
      </button>
    </div>
  );
}
