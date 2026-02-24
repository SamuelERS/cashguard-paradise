// 🤖 [IA] - v1.0.0: CorteInicio — Formulario presentacional de inicio de corte (TDD GREEN)
import { useEffect, useRef, useState } from 'react';
import type { EmpleadoSucursal } from '@/hooks/useEmpleadosSucursal';

interface CorteInicioProps {
  empleadosDeSucursal: EmpleadoSucursal[];
  empleadoPrecargado: EmpleadoSucursal | null;
  cargandoEmpleados: boolean;
  errorEmpleados: string | null;
  onConfirmar: (cajero: EmpleadoSucursal, testigo: EmpleadoSucursal) => void;
}

export default function CorteInicio({
  empleadosDeSucursal,
  empleadoPrecargado,
  cargandoEmpleados,
  errorEmpleados,
  onConfirmar,
}: CorteInicioProps) {
  const [cajeroBusqueda, setCajeroBusqueda] = useState(
    empleadoPrecargado?.nombre ?? '',
  );
  const [testigoBusqueda, setTestigoBusqueda] = useState('');
  const cajeroInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!empleadoPrecargado?.nombre) return;
    setCajeroBusqueda((prev) =>
      prev.trim().length === 0 ? empleadoPrecargado.nombre : prev,
    );
  }, [empleadoPrecargado?.id, empleadoPrecargado?.nombre]);

  const cajerosCoincidentes = empleadosDeSucursal.filter(
    (e) => e.nombre === cajeroBusqueda,
  );
  const testigosCoincidentes = empleadosDeSucursal.filter(
    (e) => e.nombre === testigoBusqueda,
  );
  const cajeroSeleccionado =
    cajerosCoincidentes.length === 1 ? cajerosCoincidentes[0] : null;
  const testigoSeleccionado =
    testigosCoincidentes.length === 1 ? testigosCoincidentes[0] : null;
  const seleccionAmbigua =
    (cajeroBusqueda.trim().length > 0 && cajerosCoincidentes.length > 1) ||
    (testigoBusqueda.trim().length > 0 && testigosCoincidentes.length > 1);

  const mismoEmpleado =
    cajeroSeleccionado != null &&
    testigoSeleccionado != null &&
    cajeroSeleccionado.id === testigoSeleccionado.id;

  const puedeConfirmar =
    cajeroSeleccionado != null &&
    testigoSeleccionado != null &&
    !mismoEmpleado &&
    !seleccionAmbigua;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (puedeConfirmar) {
      onConfirmar(cajeroSeleccionado, testigoSeleccionado);
    }
  };

  const handleMostrarTodos = () => {
    cajeroInputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit}>
      {errorEmpleados && <p role="alert">{errorEmpleados}</p>}
      {seleccionAmbigua && (
        <p role="alert">Nombre ambiguo: seleccione un empleado único.</p>
      )}

      <div>
        <label htmlFor="cajero-input">Cajero</label>
        <input
          id="cajero-input"
          list="cajero-list"
          ref={cajeroInputRef}
          value={cajeroBusqueda}
          onChange={(e) => setCajeroBusqueda(e.target.value)}
          disabled={cargandoEmpleados}
        />
        <datalist id="cajero-list">
          {empleadosDeSucursal.map((emp) => (
            <option key={emp.id} value={emp.nombre} />
          ))}
        </datalist>
        <button type="button" onClick={handleMostrarTodos}>
          Mostrar todos
        </button>
      </div>

      <div>
        <label htmlFor="testigo-input">Testigo</label>
        <input
          id="testigo-input"
          list="testigo-list"
          value={testigoBusqueda}
          onChange={(e) => setTestigoBusqueda(e.target.value)}
          disabled={cargandoEmpleados}
        />
        <datalist id="testigo-list">
          {empleadosDeSucursal
            .filter((e) => e.id !== cajeroSeleccionado?.id)
            .map((emp) => (
              <option key={emp.id} value={emp.nombre} />
            ))}
        </datalist>
      </div>

      <button type="submit" disabled={!puedeConfirmar}>
        Confirmar
      </button>
    </form>
  );
}
