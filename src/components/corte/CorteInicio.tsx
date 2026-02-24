// 🤖 [IA] - v1.0.0: CorteInicio — Formulario presentacional de inicio de corte (TDD GREEN)
import { useEffect, useRef, useState } from 'react';
import type { EmpleadoSucursal } from '@/hooks/useEmpleadosSucursal';
import { Input } from '@/components/ui/input';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { NeutralActionButton } from '@/components/ui/neutral-action-button';

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
    <form
      onSubmit={handleSubmit}
      data-testid="corte-inicio-form"
      className="glass-morphism-panel space-y-fluid-lg"
    >
      <div className="glass-morphism-panel header-section">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary-foreground text-fluid-xl">Configurar Equipo del Corte</h3>
          <p className="text-muted-foreground text-fluid-xs mt-fluid-xs">
            Selecciona cajero y testigo para iniciar el corte.
          </p>
        </div>
      </div>

      {errorEmpleados && <p role="alert">{errorEmpleados}</p>}
      {seleccionAmbigua && (
        <p role="alert">Nombre ambiguo: seleccione un empleado único.</p>
      )}

      <div className="glass-morphism-panel space-y-fluid-sm">
        <div className="flex items-center justify-between gap-fluid-sm">
          <label htmlFor="cajero-input" className="text-fluid-sm font-medium text-primary-foreground">Cajero</label>
          <NeutralActionButton type="button" onClick={handleMostrarTodos} className="h-8 min-h-8 px-3 text-xs">
            Mostrar todos
          </NeutralActionButton>
        </div>
        <Input
          id="cajero-input"
          list="cajero-list"
          ref={cajeroInputRef}
          value={cajeroBusqueda}
          onChange={(e) => setCajeroBusqueda(e.target.value)}
          disabled={cargandoEmpleados}
          className="bg-background/30 border-white/20 text-primary-foreground"
        />
        <datalist id="cajero-list">
          {empleadosDeSucursal.map((emp) => (
            <option key={emp.id} value={emp.nombre} />
          ))}
        </datalist>
      </div>

      <div className="glass-morphism-panel space-y-fluid-sm">
        <label htmlFor="testigo-input" className="text-fluid-sm font-medium text-primary-foreground">Testigo</label>
        <Input
          id="testigo-input"
          list="testigo-list"
          value={testigoBusqueda}
          onChange={(e) => setTestigoBusqueda(e.target.value)}
          disabled={cargandoEmpleados}
          className="bg-background/30 border-white/20 text-primary-foreground"
        />
        <datalist id="testigo-list">
          {empleadosDeSucursal
            .filter((e) => e.id !== cajeroSeleccionado?.id)
            .map((emp) => (
              <option key={emp.id} value={emp.nombre} />
            ))}
        </datalist>
      </div>

      <ConstructiveActionButton type="submit" disabled={!puedeConfirmar} className="w-full sm:w-auto">
        Confirmar
      </ConstructiveActionButton>
    </form>
  );
}
