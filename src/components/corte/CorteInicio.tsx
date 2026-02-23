// 🤖 [IA] - v1.0.0: CorteInicio — Formulario presentacional de inicio de corte (TDD GREEN)
import { useState, useRef } from 'react';
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

  const cajeroSeleccionado = empleadosDeSucursal.find(
    (e) => e.nombre === cajeroBusqueda,
  );
  const testigoSeleccionado = empleadosDeSucursal.find(
    (e) => e.nombre === testigoBusqueda,
  );

  const mismoEmpleado =
    cajeroSeleccionado != null &&
    testigoSeleccionado != null &&
    cajeroSeleccionado.id === testigoSeleccionado.id;

  const puedeConfirmar =
    cajeroSeleccionado != null &&
    testigoSeleccionado != null &&
    !mismoEmpleado;

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
