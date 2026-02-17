// 🤖 [IA] - v1.1.0: Tests CorteInicio — Orden #008 + OT-14 (preselección + localStorage)
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  if (paso >= 4) {
    // Paso 3: escribir testigo + siguiente
    await user.type(screen.getByPlaceholderText(/nombre completo del testigo/i), testigoNombre);
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
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

  it('1.2 - Muestra indicador "Paso 1 de 4"', () => {
    renderCorteInicio();
    expect(screen.getByText('Paso 1 de 4')).toBeInTheDocument();
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

    expect(screen.getByText('Paso 2 de 4')).toBeInTheDocument();
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
    expect(screen.getByText('Paso 2 de 4')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /anterior/i }));

    // Back on paso 1
    expect(screen.getByText('Paso 1 de 4')).toBeInTheDocument();

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

    expect(screen.getByText('Paso 3 de 4')).toBeInTheDocument();
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

  it('4.4 - Boton "Siguiente" deshabilitado cuando testigo === cajero', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await navegarAPaso(user, 3, { cajeroNombre: 'Tito Gomez' });
    await user.type(
      screen.getByPlaceholderText(/nombre completo del testigo/i),
      'TITO GOMEZ'
    );

    const botones = screen.getAllByRole('button', { name: /siguiente/i });
    expect(botones[botones.length - 1]).toBeDisabled();
  });

  it('4.5 - Boton "Siguiente" habilitado con testigo valido y diferente', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await navegarAPaso(user, 3, { cajeroNombre: 'Tito Gomez' });
    await user.type(
      screen.getByPlaceholderText(/nombre completo del testigo/i),
      'Adonay Torres'
    );

    const botones = screen.getAllByRole('button', { name: /siguiente/i });
    expect(botones[botones.length - 1]).toBeEnabled();
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

    await navegarAPaso(user, 4, { cajeroNombre: 'Tito Gomez', testigoNombre: 'Adonay Torres' });
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
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 4: click Iniciar Corte sin venta_esperada
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
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 4: click Iniciar Corte
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

    // Paso 3: write testigo + siguiente
    await user.type(
      screen.getByPlaceholderText(/nombre completo del testigo/i),
      'Adonay Torres'
    );
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 4: go back to paso 3
    await user.click(screen.getByRole('button', { name: /anterior/i }));
    expect(screen.getByPlaceholderText(/nombre completo del testigo/i)).toHaveValue('Adonay Torres');

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

// ---------------------------------------------------------------------------
// Suite 8: Paso 4 — Venta Esperada SICAR
// ---------------------------------------------------------------------------

describe('Suite 8: Paso 4 — Venta Esperada SICAR', () => {
  it('8.1 - Navegar desde paso 3 muestra input de venta esperada', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await navegarAPaso(user, 4);

    expect(screen.getByText('Paso 4 de 4')).toBeInTheDocument();
    expect(screen.getByText('Venta Esperada SICAR')).toBeInTheDocument();
  });

  it('8.2 - Input con placeholder "Ej: 653.65"', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await navegarAPaso(user, 4);
    expect(screen.getByPlaceholderText('Ej: 653.65')).toBeInTheDocument();
  });

  it('8.3 - "Iniciar Corte" envia venta_esperada como number', async () => {
    const user = userEvent.setup();
    const onIniciar = vi.fn();
    renderCorteInicio({ onIniciar });

    await navegarAPaso(user, 4);
    await user.type(screen.getByPlaceholderText('Ej: 653.65'), '653.65');
    await user.click(screen.getByRole('button', { name: /iniciar corte/i }));

    expect(onIniciar).toHaveBeenCalledWith(
      expect.objectContaining({ venta_esperada: 653.65 })
    );
  });

  it('8.4 - "Omitir" envia params sin venta_esperada', async () => {
    const user = userEvent.setup();
    const onIniciar = vi.fn();
    renderCorteInicio({ onIniciar });

    await navegarAPaso(user, 4);
    await user.click(screen.getByRole('button', { name: /omitir/i }));

    expect(onIniciar).toHaveBeenCalledTimes(1);
    const params = onIniciar.mock.calls[0][0];
    expect(params).not.toHaveProperty('venta_esperada');
  });

  it('8.5 - "Iniciar Corte" sin valor en input no envia venta_esperada', async () => {
    const user = userEvent.setup();
    const onIniciar = vi.fn();
    renderCorteInicio({ onIniciar });

    await navegarAPaso(user, 4);
    await user.click(screen.getByRole('button', { name: /iniciar corte/i }));

    expect(onIniciar).toHaveBeenCalledTimes(1);
    const params = onIniciar.mock.calls[0][0];
    expect(params).not.toHaveProperty('venta_esperada');
  });

  it('8.6 - Boton "Anterior" regresa a paso 3 con testigo preservado', async () => {
    const user = userEvent.setup();
    renderCorteInicio();

    await navegarAPaso(user, 4, { testigoNombre: 'Adonay Torres' });

    // Now on paso 4
    expect(screen.getByText('Paso 4 de 4')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /anterior/i }));

    // Back on paso 3
    expect(screen.getByText('Paso 3 de 4')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nombre completo del testigo/i)).toHaveValue('Adonay Torres');
  });
});

// ---------------------------------------------------------------------------
// Suite 9: Preselección de sucursal (OT-14)
// ---------------------------------------------------------------------------

describe('Suite 9: Preselección de sucursal (OT-14)', () => {
  it('9.1 - Con sucursalPreseleccionadaId + omitirPasoSucursal, inicia en paso cajero', () => {
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
    });
    // No debe mostrar UI de selección de sucursal
    expect(screen.queryByText('Seleccionar Sucursal')).not.toBeInTheDocument();
    // Debe mostrar paso cajero
    expect(screen.getByText('Identificar Cajero')).toBeInTheDocument();
  });

  it('9.2 - Progreso muestra "Paso 1 de 3" cuando se omite sucursal', () => {
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
    });
    expect(screen.getByText('Paso 1 de 3')).toBeInTheDocument();
  });

  it('9.3 - Navegar completo en 3 pasos y onIniciar recibe sucursal preseleccionada', async () => {
    const user = userEvent.setup();
    const onIniciar = vi.fn();
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-2',
      omitirPasoSucursal: true,
      onIniciar,
    });

    // Paso 1 (cajero)
    expect(screen.getByText('Identificar Cajero')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/nombre completo del cajero/i), 'Tito Gomez');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 2 (testigo)
    expect(screen.getByText('Paso 2 de 3')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/nombre completo del testigo/i), 'Adonay Torres');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    // Paso 3 (venta esperada)
    expect(screen.getByText('Paso 3 de 3')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /iniciar corte/i }));

    expect(onIniciar).toHaveBeenCalledWith({
      sucursal_id: 'suc-2',
      cajero: 'Tito Gomez',
      testigo: 'Adonay Torres',
    });
  });

  it('9.4 - Sin omitirPasoSucursal (default), comportamiento original 4 pasos', () => {
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
    });
    // Debe mostrar paso de sucursal como siempre
    expect(screen.getByText('Paso 1 de 4')).toBeInTheDocument();
    expect(screen.getByText('Seleccionar Sucursal')).toBeInTheDocument();
  });

  it('9.5 - Botón "Anterior" en paso cajero NO retrocede a sucursal cuando omitida', () => {
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
    });
    // En paso 1 (cajero), no debe haber botón "Anterior"
    expect(screen.queryByRole('button', { name: /anterior/i })).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Suite 10: Persistencia empleados localStorage (OT-14)
// ---------------------------------------------------------------------------

describe('Suite 10: Persistencia empleados localStorage (OT-14)', () => {
  const STORAGE_KEY = 'cashguard:corte:empleados:suc-1';

  // 🤖 [IA] - OT-14: setup.minimal.ts mockea localStorage como no-op (getItem→null, setItem→no-op).
  // Para tests de persistencia real necesitamos un store funcional in-memory.
  const store: Record<string, string> = {};

  beforeEach(() => {
    // Limpiar store in-memory
    Object.keys(store).forEach(key => delete store[key]);

    // Override mocks para que funcionen como localStorage real
    vi.mocked(localStorage.getItem).mockImplementation(
      (key: string) => store[key] ?? null,
    );
    vi.mocked(localStorage.setItem).mockImplementation(
      (key: string, value: string) => { store[key] = value; },
    );
    vi.mocked(localStorage.removeItem).mockImplementation(
      (key: string) => { delete store[key]; },
    );
    vi.mocked(localStorage.clear).mockImplementation(
      () => { Object.keys(store).forEach(k => delete store[k]); },
    );
  });

  it('10.1 - Precarga cajero/testigo desde localStorage al montar con sucursal', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cajero: 'Tito Gomez', testigo: 'Adonay Torres', updatedAt: new Date().toISOString() })
    );
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
    });
    // Paso cajero debe venir precargado
    expect(screen.getByPlaceholderText(/nombre completo del cajero/i)).toHaveValue('Tito Gomez');
  });

  it('10.2 - Al iniciar corte, persiste cajero/testigo en localStorage', async () => {
    const user = userEvent.setup();
    const onIniciar = vi.fn();
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
      onIniciar,
    });

    await user.type(screen.getByPlaceholderText(/nombre completo del cajero/i), 'Irvin Abarca');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.type(screen.getByPlaceholderText(/nombre completo del testigo/i), 'Jonathan Melara');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.click(screen.getByRole('button', { name: /iniciar corte/i }));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored.cajero).toBe('Irvin Abarca');
    expect(stored.testigo).toBe('Jonathan Melara');
    expect(stored.updatedAt).toBeDefined();
  });

  it('10.3 - Sin cache en localStorage, inputs inician vacíos', () => {
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
    });
    expect(screen.getByPlaceholderText(/nombre completo del cajero/i)).toHaveValue('');
  });

  it('10.4 - Cache corrupto no rompe UI (degrada silenciosamente)', () => {
    localStorage.setItem(STORAGE_KEY, 'INVALID_JSON{{{');
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
    });
    // Debe renderizar sin error, inputs vacíos
    expect(screen.getByPlaceholderText(/nombre completo del cajero/i)).toHaveValue('');
  });

  it('10.5 - Al navegar al paso testigo, testigo también precargado', async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cajero: 'Tito Gomez', testigo: 'Adonay Torres', updatedAt: new Date().toISOString() })
    );
    const user = userEvent.setup();
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
    });

    // Avanzar al paso testigo
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    expect(screen.getByPlaceholderText(/nombre completo del testigo/i)).toHaveValue('Adonay Torres');
  });

  it('10.6 - "Omitir" en paso venta también persiste empleados', async () => {
    const user = userEvent.setup();
    const onIniciar = vi.fn();
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
      onIniciar,
    });

    await user.type(screen.getByPlaceholderText(/nombre completo del cajero/i), 'Ana Lopez');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.type(screen.getByPlaceholderText(/nombre completo del testigo/i), 'Pedro Garcia');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    await user.click(screen.getByRole('button', { name: /omitir/i }));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored.cajero).toBe('Ana Lopez');
    expect(stored.testigo).toBe('Pedro Garcia');
  });

  it('10.7 - Si cajero viene precargado y hay varios empleados, limpia el filtro inicial para mostrar catálogo completo', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cajero: 'Jonathan Melara', testigo: 'Adonay Torres', updatedAt: new Date().toISOString() })
    );

    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
      ...( {
        empleadosDisponibles: ['Tito Gomez', 'Adonay Torres', 'Jonathan Melara'],
      } as unknown as Partial<CorteInicioProps> ),
    });

    expect(screen.getByPlaceholderText(/nombre completo del cajero/i)).toHaveValue('');
    expect(screen.getByText('Empleados registrados: 3')).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Suite 11: Empleados registrados por sucursal (OT-16)
// ---------------------------------------------------------------------------

describe('Suite 11: Empleados registrados por sucursal (OT-16)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('11.1 - Muestra empleados registrados en datalist de cajero', () => {
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
      // cast temporal para fase RED TDD: prop agregada en OT-16
      ...( {
        empleadosDisponibles: ['Tito Gomez', 'Adonay Torres', 'Jonathan Melara'],
      } as unknown as Partial<CorteInicioProps> ),
    });

    expect(screen.getByText('Empleados registrados: 3')).toBeInTheDocument();
    expect(document.querySelector('option[value="Tito Gomez"]')).toBeInTheDocument();
    expect(document.querySelector('option[value="Adonay Torres"]')).toBeInTheDocument();
  });

  it('11.2 - Testigo excluye al cajero seleccionado en sugerencias', async () => {
    const user = userEvent.setup();
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
      ...( {
        empleadosDisponibles: ['Tito Gomez', 'Adonay Torres', 'Jonathan Melara'],
      } as unknown as Partial<CorteInicioProps> ),
    });

    await user.type(screen.getByPlaceholderText(/nombre completo del cajero/i), 'Tito Gomez');
    await user.click(screen.getByRole('button', { name: /siguiente/i }));

    const opcionesTestigo = document.querySelector('#empleados-testigo-list');
    expect(opcionesTestigo?.querySelector('option[value="Tito Gomez"]')).toBeNull();
    expect(opcionesTestigo?.querySelector('option[value="Adonay Torres"]')).toBeInTheDocument();
  });

  it('11.3 - Con valor en cajero y múltiples empleados, muestra acción para ver catálogo completo', async () => {
    const user = userEvent.setup();
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
      ...( {
        empleadosDisponibles: ['Tito Gomez', 'Adonay Torres', 'Jonathan Melara'],
      } as unknown as Partial<CorteInicioProps> ),
    });

    await user.type(screen.getByPlaceholderText(/nombre completo del cajero/i), 'Jonathan Melara');

    expect(
      screen.getByRole('button', { name: /mostrar todos los empleados/i }),
    ).toBeInTheDocument();
  });

  it('11.4 - Acción "mostrar todos" limpia cajero para quitar filtro de sugerencias', async () => {
    const user = userEvent.setup();
    renderCorteInicio({
      sucursalPreseleccionadaId: 'suc-1',
      omitirPasoSucursal: true,
      ...( {
        empleadosDisponibles: ['Tito Gomez', 'Adonay Torres', 'Jonathan Melara'],
      } as unknown as Partial<CorteInicioProps> ),
    });

    const inputCajero = screen.getByPlaceholderText(/nombre completo del cajero/i);
    await user.type(inputCajero, 'Jonathan Melara');
    await user.click(screen.getByRole('button', { name: /mostrar todos los empleados/i }));

    expect(inputCajero).toHaveValue('');
    expect(screen.getByText('Empleados registrados: 3')).toBeInTheDocument();
  });
});
