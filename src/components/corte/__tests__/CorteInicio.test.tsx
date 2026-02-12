// 🤖 [IA] - v1.0.0: Tests CorteInicio — Orden #008
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CorteInicio } from '../CorteInicio';
import type { CorteInicioProps } from '../CorteInicio';
import type { Sucursal } from '../../../types/auditoria';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const SUCURSALES_FIXTURE: Sucursal[] = [
  { id: 'suc-1', nombre: 'Los Heroes', codigo: 'H', activa: true },
  { id: 'suc-2', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
];

// ---------------------------------------------------------------------------
// Helper de renderizado
// ---------------------------------------------------------------------------

function renderCorteInicio(overrides?: Partial<CorteInicioProps>) {
  const defaultProps: CorteInicioProps = {
    sucursales: SUCURSALES_FIXTURE,
    cargando: false,
    onIniciar: vi.fn(),
    onCancelar: vi.fn(),
  };
  return render(<CorteInicio {...defaultProps} {...overrides} />);
}

// ---------------------------------------------------------------------------
// Helper para navegar al paso N
// ---------------------------------------------------------------------------

async function navegarAPaso(
  user: ReturnType<typeof userEvent.setup>,
  paso: number,
  opciones?: { sucursalNombre?: string; cajeroNombre?: string; testigoNombre?: string }
) {
  const sucursalNombre = opciones?.sucursalNombre ?? 'Los Heroes';
  const cajeroNombre = opciones?.cajeroNombre ?? 'Tito Gomez';
  const testigoNombre = opciones?.testigoNombre ?? 'Adonay Torres';

  if (paso >= 2) {
    // Paso 1: seleccionar sucursal + siguiente
    await user.click(screen.getByText(sucursalNombre));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
  }

  if (paso >= 3) {
    // Paso 2: escribir cajero + siguiente
    await user.type(screen.getByPlaceholderText(/nombre completo del cajero/i), cajeroNombre);
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
  }

  if (paso >= 3 && testigoNombre) {
    // No escribimos testigo automaticamente, solo si explicitamente pedido
    // El caller puede escribir el testigo despues
  }
}

// ---------------------------------------------------------------------------
// Suite 1: Renderizado inicial
// ---------------------------------------------------------------------------

describe('Suite 1: Renderizado inicial', () => {
  it('1.1 - Renderiza paso 1 por defecto con titulo "Seleccionar Sucursal"', () => {
    renderCorteInicio();
    expect(screen.getByText('Iniciar Corte de Caja')).toBeInTheDocument();
    expect(screen.getByText('Seleccionar Sucursal')).toBeInTheDocument();
  });

  it('1.2 - Muestra indicador "Paso 1 de 3"', () => {
    renderCorteInicio();
    expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument();
  });

  it('1.3 - Muestra boton "Cancelar"', () => {
    renderCorteInicio();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Suite 2: Paso 1 — Seleccion de Sucursal
// ---------------------------------------------------------------------------

describe('Suite 2: Paso 1 — Seleccion de Sucursal', () => {
  it('2.1 - Renderiza lista de sucursales con nombre y codigo', () => {
    renderCorteInicio();
    expect(screen.getByText('Los Heroes')).toBeInTheDocument();
    expect(screen.getByText('H')).toBeInTheDocument();
    expect(screen.getByText('Plaza Merliot')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
  });

  it('2.2 - Seleccionar sucursal resalta la card (visual feedback)', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    const heroesButton = screen.getByText('Los Heroes').closest('button')!;
    expect(heroesButton.className).toContain('border-slate-700');

    await user.click(heroesButton);
    expect(heroesButton.className).toContain('border-blue-500');
  });

  it('2.3 - Boton "Siguiente" deshabilitado sin seleccion', () => {
    // Use 2 sucursales so auto-select doesnt trigger
    renderCorteInicio({
      sucursales: [
        { id: 'suc-1', nombre: 'Los Heroes', codigo: 'H', activa: true },
        { id: 'suc-2', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
      ],
    });

    // Since there are 2 sucursales, nothing is auto-selected initially
    // Wait — actually the component only auto-selects when there's exactly 1.
    // With 2, no auto-selection. Let's verify the button is enabled/disabled
    // The button should be disabled because no selection with 2 options
    const siguiente = screen.getByRole('button', { name: /siguiente/i });

    // With 2 sucursales, no auto-selection, button disabled
    expect(siguiente).toBeDisabled();
  });

  it('2.4 - Boton "Siguiente" habilitado con seleccion', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await user.click(screen.getByText('Los Heroes'));
    const siguiente = screen.getByRole('button', { name: /siguiente/i });
    expect(siguiente).toBeEnabled();
  });

  it('2.5 - Mensaje "No hay sucursales disponibles" con array vacio', () => {
    renderCorteInicio({ sucursales: [] });
    expect(screen.getByText('No hay sucursales disponibles')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Suite 3: Paso 2 — Cajero
// ---------------------------------------------------------------------------

describe('Suite 3: Paso 2 — Cajero', () => {
  it('3.1 - Navegar desde paso 1 muestra input de cajero', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await user.click(screen.getByText('Los Heroes'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument();
    expect(screen.getByText('Identificar Cajero')).toBeInTheDocument();
  });

  it('3.2 - Input con placeholder "Nombre completo del cajero"', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await navegarAPaso(user, 2);
    expect(screen.getByPlaceholderText('Nombre completo del cajero')).toBeInTheDocument();
  });

  it('3.3 - Boton "Siguiente" deshabilitado con nombre corto (<3 chars)', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await navegarAPaso(user, 2);
    await user.type(screen.getByPlaceholderText(/nombre completo del cajero/i), 'AB');

    const siguiente = screen.getByRole('button', { name: /siguiente/i });
    expect(siguiente).toBeDisabled();
  });

  it('3.4 - Boton "Anterior" regresa a paso 1 con sucursal preservada', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await user.click(screen.getByText('Los Heroes'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Now on paso 2
    expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /anterior/i }));

    // Back on paso 1
    expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument();

    // Sucursal still selected (border-blue-500)
    const heroesButton = screen.getByText('Los Heroes').closest('button')!;
    expect(heroesButton.className).toContain('border-blue-500');
  });
});

// ---------------------------------------------------------------------------
// Suite 4: Paso 3 — Testigo
// ---------------------------------------------------------------------------

describe('Suite 4: Paso 3 — Testigo', () => {
  it('4.1 - Navegar desde paso 2 muestra input de testigo', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await navegarAPaso(user, 3);

    expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument();
    expect(screen.getByText('Identificar Testigo')).toBeInTheDocument();
  });

  it('4.2 - Input con placeholder "Nombre completo del testigo"', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await navegarAPaso(user, 3);
    expect(screen.getByPlaceholderText('Nombre completo del testigo')).toBeInTheDocument();
  });

  it('4.3 - Muestra error cuando testigo === cajero (case insensitive)', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await navegarAPaso(user, 3, { cajeroNombre: 'Tito Gomez' });
    await user.type(
      screen.getByPlaceholderText(/nombre completo del testigo/i),
      'tito gomez'
    );

    expect(
      screen.getByText('El testigo debe ser una persona diferente al cajero')
    ).toBeInTheDocument();
  });

  it('4.4 - Boton "Iniciar Corte" deshabilitado cuando testigo === cajero', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await navegarAPaso(user, 3, { cajeroNombre: 'Tito Gomez' });
    await user.type(
      screen.getByPlaceholderText(/nombre completo del testigo/i),
      'TITO GOMEZ'
    );

    expect(screen.getByRole('button', { name: /iniciar corte/i })).toBeDisabled();
  });

  it('4.5 - Boton "Iniciar Corte" habilitado con testigo valido y diferente', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await navegarAPaso(user, 3, { cajeroNombre: 'Tito Gomez' });
    await user.type(
      screen.getByPlaceholderText(/nombre completo del testigo/i),
      'Adonay Torres'
    );

    expect(screen.getByRole('button', { name: /iniciar corte/i })).toBeEnabled();
  });
});

// ---------------------------------------------------------------------------
// Suite 5: Callback onIniciar
// ---------------------------------------------------------------------------

describe('Suite 5: Callback onIniciar', () => {
  it('5.1 - Llama onIniciar con params correctos al confirmar', async () => {
    const user = userEvent.setup();
    const onIniciar = vi.fn();
    renderCorteInicio({ onIniciar });

    await navegarAPaso(user, 3, { cajeroNombre: 'Tito Gomez' });
    await user.type(
      screen.getByPlaceholderText(/nombre completo del testigo/i),
      'Adonay Torres'
    );
    await user.click(screen.getByRole('button', { name: /iniciar corte/i }));

    expect(onIniciar).toHaveBeenCalledTimes(1);
  });

  it('5.2 - Params tienen valores trimmed', async () => {
    const user = userEvent.setup();
    const onIniciar = vi.fn();
    renderCorteInicio({ onIniciar });

    // Paso 1: select sucursal
    await user.click(screen.getByText('Los Heroes'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 2: cajero con espacios
    await user.type(
      screen.getByPlaceholderText(/nombre completo del cajero/i),
      '  Tito Gomez  '
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 3: testigo con espacios
    await user.type(
      screen.getByPlaceholderText(/nombre completo del testigo/i),
      '  Adonay Torres  '
    );
    await user.click(screen.getByRole('button', { name: /iniciar corte/i }));

    expect(onIniciar).toHaveBeenCalledWith({
      sucursal_id: 'suc-1',
      cajero: 'Tito Gomez',
      testigo: 'Adonay Torres',
    });
  });

  it('5.3 - sucursal_id corresponde a la sucursal seleccionada', async () => {
    const user = userEvent.setup();
    const onIniciar = vi.fn();
    renderCorteInicio({ onIniciar });

    // Select Plaza Merliot (suc-2)
    await user.click(screen.getByText('Plaza Merliot'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.type(
      screen.getByPlaceholderText(/nombre completo del cajero/i),
      'Irvin Abarca'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.type(
      screen.getByPlaceholderText(/nombre completo del testigo/i),
      'Jonathan Melara'
    );
    await user.click(screen.getByRole('button', { name: /iniciar corte/i }));

    expect(onIniciar).toHaveBeenCalledWith(
      expect.objectContaining({ sucursal_id: 'suc-2' })
    );
  });
});

// ---------------------------------------------------------------------------
// Suite 6: Estado de carga y errores
// ---------------------------------------------------------------------------

describe('Suite 6: Estado de carga y errores', () => {
  it('6.1 - Todos los controles deshabilitados cuando cargando=true', () => {
    renderCorteInicio({ cargando: true });

    // All buttons in step 1 should be disabled
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('6.2 - Muestra indicador de carga con texto "Iniciando corte..."', () => {
    renderCorteInicio({ cargando: true });
    expect(screen.getByText('Iniciando corte...')).toBeInTheDocument();
  });

  it('6.3 - Muestra mensaje de error del padre cuando error tiene valor', () => {
    renderCorteInicio({ error: 'Ya existe un corte activo' });
    expect(screen.getByText('Ya existe un corte activo')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Suite 7: Navegacion y edge cases
// ---------------------------------------------------------------------------

describe('Suite 7: Navegacion y edge cases', () => {
  it('7.1 - Boton "Cancelar" llama onCancelar', async () => {
    const user = userEvent.setup();
    const onCancelar = vi.fn();
    renderCorteInicio({ onCancelar });

    await user.click(screen.getByRole('button', { name: /cancelar/i }));
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it('7.2 - Auto-seleccion con 1 sola sucursal', () => {
    const singleSucursal: Sucursal[] = [
      { id: 'suc-unica', nombre: 'Unica Sucursal', codigo: 'U', activa: true },
    ];
    renderCorteInicio({ sucursales: singleSucursal });

    // Card should show as selected (blue border)
    const card = screen.getByText('Unica Sucursal').closest('button')!;
    expect(card.className).toContain('border-blue-500');

    // Siguiente should be enabled
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeEnabled();
  });

  it('7.3 - Navegar atras y adelante preserva todos los valores ingresados', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    // Paso 1: select sucursal
    await user.click(screen.getByText('Los Heroes'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 2: write cajero
    await user.type(
      screen.getByPlaceholderText(/nombre completo del cajero/i),
      'Tito Gomez'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 3: write testigo
    await user.type(
      screen.getByPlaceholderText(/nombre completo del testigo/i),
      'Adonay Torres'
    );

    // Go back to paso 2
    await user.click(screen.getByRole('button', { name: /anterior/i }));
    expect(screen.getByPlaceholderText(/nombre completo del cajero/i)).toHaveValue('Tito Gomez');

    // Go back to paso 1
    await user.click(screen.getByRole('button', { name: /anterior/i }));
    const heroesCard = screen.getByText('Los Heroes').closest('button')!;
    expect(heroesCard.className).toContain('border-blue-500');

    // Go forward to paso 2
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByPlaceholderText(/nombre completo del cajero/i)).toHaveValue('Tito Gomez');

    // Go forward to paso 3
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByPlaceholderText(/nombre completo del testigo/i)).toHaveValue('Adonay Torres');
  });

  it('7.4 - Sucursal cards deshabilitadas cuando cargando=true', () => {
    renderCorteInicio({ cargando: true });

    const heroesCard = screen.getByText('Los Heroes').closest('button')!;
    expect(heroesCard).toBeDisabled();
  });
});
