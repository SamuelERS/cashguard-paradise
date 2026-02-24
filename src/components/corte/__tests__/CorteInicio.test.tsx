// 🤖 [IA] - v1.0.0: Tests TDD RED para CorteInicio — 7 escenarios (prefill, datalist, mostrar todos, validación)
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CorteInicio from '../CorteInicio';
import type { EmpleadoSucursal } from '@/hooks/useEmpleadosSucursal';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const EMPLEADOS_FIXTURE: EmpleadoSucursal[] = [
  { id: 'emp-001', nombre: 'Adonay Torres' },
  { id: 'emp-002', nombre: 'Tito Gomez' },
  { id: 'emp-003', nombre: 'Irvin Abarca', cargo: 'Cajero' },
];

const EMPLEADO_PRECARGADO: EmpleadoSucursal = EMPLEADOS_FIXTURE[0]; // Adonay Torres

const defaultProps = {
  empleadosDeSucursal: EMPLEADOS_FIXTURE,
  empleadoPrecargado: null as EmpleadoSucursal | null,
  cargandoEmpleados: false,
  errorEmpleados: null as string | null,
  onConfirmar: vi.fn(),
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Retorna todas las <option> dentro de un <datalist> con el id dado */
const getDatalistOptions = (datalistId: string): string[] => {
  const datalist = document.getElementById(datalistId);
  if (!datalist) return [];
  const options = datalist.querySelectorAll('option');
  return Array.from(options).map((o) => o.getAttribute('value') ?? '');
};

// ---------------------------------------------------------------------------
// Suite A — Prefill básico
// ---------------------------------------------------------------------------

describe('CorteInicio — Suite A: Prefill básico', () => {
  it('A1: sin empleadoPrecargado (null) → input cajero vacío, datalist contiene 3 empleados', () => {
    render(<CorteInicio {...defaultProps} empleadoPrecargado={null} />);

    const inputCajero = screen.getByLabelText(/cajero/i) as HTMLInputElement;
    expect(inputCajero.value).toBe('');

    const opciones = getDatalistOptions('cajero-list');
    expect(opciones).toHaveLength(3);
    expect(opciones).toContain('Adonay Torres');
    expect(opciones).toContain('Tito Gomez');
    expect(opciones).toContain('Irvin Abarca');
  });

  it('A2: con empleadoPrecargado → input cajero muestra nombre; datalist sigue con 3 empleados', () => {
    render(
      <CorteInicio
        {...defaultProps}
        empleadoPrecargado={EMPLEADO_PRECARGADO}
      />,
    );

    const inputCajero = screen.getByLabelText(/cajero/i) as HTMLInputElement;
    expect(inputCajero.value).toBe('Adonay Torres');

    const opciones = getDatalistOptions('cajero-list');
    expect(opciones).toHaveLength(3);
    expect(opciones).toContain('Adonay Torres');
    expect(opciones).toContain('Tito Gomez');
    expect(opciones).toContain('Irvin Abarca');
  });

  it('A3: prefill tardío (prop async) hidrata input cajero cuando estaba vacío', () => {
    const { rerender } = render(
      <CorteInicio {...defaultProps} empleadoPrecargado={null} />,
    );
    const inputCajero = screen.getByLabelText(/cajero/i) as HTMLInputElement;
    expect(inputCajero.value).toBe('');

    rerender(
      <CorteInicio
        {...defaultProps}
        empleadoPrecargado={EMPLEADO_PRECARGADO}
      />,
    );

    expect((screen.getByLabelText(/cajero/i) as HTMLInputElement).value).toBe(
      'Adonay Torres',
    );
  });
});

// ---------------------------------------------------------------------------
// Suite B — Catálogo múltiple
// ---------------------------------------------------------------------------

describe('CorteInicio — Suite B: Catálogo múltiple', () => {
  it('B1: con 3 empleados → datalist cajero lista los 3', () => {
    render(<CorteInicio {...defaultProps} />);

    const opciones = getDatalistOptions('cajero-list');
    expect(opciones).toHaveLength(3);
    expect(opciones).toEqual(
      expect.arrayContaining(['Adonay Torres', 'Tito Gomez', 'Irvin Abarca']),
    );
  });

  it('B2: con precargado Y 3 empleados → datalist cajero muestra los 3 (prefill NO filtra)', () => {
    render(
      <CorteInicio
        {...defaultProps}
        empleadoPrecargado={EMPLEADO_PRECARGADO}
      />,
    );

    const opciones = getDatalistOptions('cajero-list');
    expect(opciones).toHaveLength(3);
    expect(opciones).toEqual(
      expect.arrayContaining(['Adonay Torres', 'Tito Gomez', 'Irvin Abarca']),
    );
  });
});

// ---------------------------------------------------------------------------
// Suite C — Acción "Mostrar todos"
// ---------------------------------------------------------------------------

describe('CorteInicio — Suite C: Acción Mostrar todos', () => {
  it('C1: el botón/link "Mostrar todos" existe en el DOM', () => {
    render(<CorteInicio {...defaultProps} />);

    const boton = screen.getByRole('button', { name: /mostrar todos/i });
    expect(boton).toBeInTheDocument();
  });

  it('C2: al hacer clic en "Mostrar todos", el input cajero recibe focus', async () => {
    const user = userEvent.setup();
    render(<CorteInicio {...defaultProps} />);

    const boton = screen.getByRole('button', { name: /mostrar todos/i });
    await user.click(boton);

    const inputCajero = screen.getByLabelText(/cajero/i);
    expect(inputCajero).toHaveFocus();
  });
});

// ---------------------------------------------------------------------------
// Suite D — Validación y submit
// ---------------------------------------------------------------------------

describe('CorteInicio — Suite D: Validación y submit', () => {
  it('D1: mismo empleado para cajero y testigo → botón confirmar deshabilitado', async () => {
    const user = userEvent.setup();
    render(<CorteInicio {...defaultProps} />);

    const inputCajero = screen.getByLabelText(/cajero/i);
    const inputTestigo = screen.getByLabelText(/testigo/i);

    await user.clear(inputCajero);
    await user.type(inputCajero, 'Adonay Torres');

    await user.clear(inputTestigo);
    await user.type(inputTestigo, 'Adonay Torres');

    const btnConfirmar = screen.getByRole('button', { name: /confirmar/i });
    expect(btnConfirmar).toBeDisabled();
  });

  it('D2: cajero distinto al testigo → onConfirmar se llama con EmpleadoSucursal correctos', async () => {
    const onConfirmar = vi.fn();
    const user = userEvent.setup();
    render(<CorteInicio {...defaultProps} onConfirmar={onConfirmar} />);

    const inputCajero = screen.getByLabelText(/cajero/i);
    const inputTestigo = screen.getByLabelText(/testigo/i);

    await user.clear(inputCajero);
    await user.type(inputCajero, 'Adonay Torres');

    await user.clear(inputTestigo);
    await user.type(inputTestigo, 'Tito Gomez');

    const btnConfirmar = screen.getByRole('button', { name: /confirmar/i });
    await user.click(btnConfirmar);

    expect(onConfirmar).toHaveBeenCalledOnce();
    expect(onConfirmar).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'emp-001', nombre: 'Adonay Torres' }),
      expect.objectContaining({ id: 'emp-002', nombre: 'Tito Gomez' }),
    );
  });

  it('D3: nombres ambiguos (duplicados) bloquean confirmación y muestran alerta', async () => {
    const user = userEvent.setup();
    const empleadosConDuplicado: EmpleadoSucursal[] = [
      { id: 'emp-001', nombre: 'Adonay Torres' },
      { id: 'emp-999', nombre: 'Adonay Torres' },
      { id: 'emp-002', nombre: 'Tito Gomez' },
    ];

    render(
      <CorteInicio
        {...defaultProps}
        empleadosDeSucursal={empleadosConDuplicado}
      />,
    );

    const inputCajero = screen.getByLabelText(/cajero/i);
    const inputTestigo = screen.getByLabelText(/testigo/i);
    const btnConfirmar = screen.getByRole('button', { name: /confirmar/i });

    await user.clear(inputCajero);
    await user.type(inputCajero, 'Adonay Torres');
    await user.clear(inputTestigo);
    await user.type(inputTestigo, 'Tito Gomez');

    expect(btnConfirmar).toBeDisabled();
    expect(screen.getByText(/nombre ambiguo/i)).toBeInTheDocument();
  });
});
