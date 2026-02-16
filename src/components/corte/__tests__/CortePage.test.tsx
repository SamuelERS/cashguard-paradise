// 🤖 [IA] - v1.0.0: Tests para CortePage — 22+ tests cubriendo carga, error, seleccion, auto-seleccion, orquestador y navegacion
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type Mock } from 'vitest';
import { CortePage } from '../CortePage';
import { useSucursales, type UseSucursalesReturn } from '../../../hooks/useSucursales';
import type { Sucursal } from '@/types/auditoria';

// Mock useSucursales
vi.mock('../../../hooks/useSucursales');

// Mock CorteOrquestador
vi.mock('../CorteOrquestador', () => ({
  CorteOrquestador: (props: Record<string, unknown>) => (
    <div
      data-testid="mock-orquestador"
      data-sucursal-id={props.sucursalId}
      data-sucursales-count={(props.sucursales as unknown[])?.length}
    >
      <button onClick={props.onSalir as () => void}>Salir Mock</button>
    </div>
  ),
}));

const SUCURSALES_TEST: Sucursal[] = [
  { id: 'suc-001', nombre: 'Los Héroes', codigo: 'H', activa: true },
  { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
];

const configurarMockSucursales = (
  overrides?: Partial<UseSucursalesReturn>
) => {
  const defaults: UseSucursalesReturn = {
    sucursales: SUCURSALES_TEST,
    cargando: false,
    error: null,
    recargar: vi.fn(),
  };
  (useSucursales as Mock).mockReturnValue({
    ...defaults,
    ...overrides,
  });
};

describe('CortePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Suite 1: Estado de carga
  describe('Suite 1: Estado de carga', () => {
    it('1.1 - Muestra spinner cuando cargando=true', () => {
      configurarMockSucursales({ cargando: true, sucursales: [] });

      render(<CortePage />);

      expect(screen.getByTestId('carga-sucursales')).toBeInTheDocument();
    });

    it('1.2 - Muestra texto "Cargando sucursales..."', () => {
      configurarMockSucursales({ cargando: true, sucursales: [] });

      render(<CortePage />);

      expect(screen.getByText('Cargando sucursales...')).toBeInTheDocument();
    });

    it('1.3 - No muestra cards de sucursal durante carga', () => {
      configurarMockSucursales({ cargando: true, sucursales: [] });

      render(<CortePage />);

      expect(screen.queryByTestId('picker-sucursales')).not.toBeInTheDocument();
      expect(screen.queryByTestId('sucursal-card-suc-001')).not.toBeInTheDocument();
    });
  });

  // Suite 2: Estado de error
  describe('Suite 2: Estado de error', () => {
    it('2.1 - Muestra mensaje de error proporcionado por useSucursales', () => {
      configurarMockSucursales({
        error: 'Error de conexion al servidor',
        sucursales: [],
      });

      render(<CortePage />);

      expect(screen.getByTestId('error-sucursales')).toBeInTheDocument();
      expect(screen.getByText('Error de conexion al servidor')).toBeInTheDocument();
    });

    it('2.2 - Boton "Reintentar" llama recargar() del hook', async () => {
      const recargarMock = vi.fn();
      configurarMockSucursales({
        error: 'Fallo',
        sucursales: [],
        recargar: recargarMock,
      });

      const user = userEvent.setup();
      render(<CortePage />);

      const reintentar = screen.getByText('Reintentar');
      await user.click(reintentar);

      expect(recargarMock).toHaveBeenCalledTimes(1);
    });

    it('2.3 - Boton "Volver" llama onSalir del padre', async () => {
      const onSalir = vi.fn();
      configurarMockSucursales({
        error: 'Fallo',
        sucursales: [],
      });

      const user = userEvent.setup();
      render(<CortePage onSalir={onSalir} />);

      const volver = screen.getByText('Volver');
      await user.click(volver);

      expect(onSalir).toHaveBeenCalledTimes(1);
    });
  });

  // Suite 3: Seleccion de sucursal
  describe('Suite 3: Seleccion de sucursal', () => {
    it('3.1 - Muestra una card por cada sucursal activa', () => {
      configurarMockSucursales();

      render(<CortePage />);

      expect(screen.getByTestId('sucursal-card-suc-001')).toBeInTheDocument();
      expect(screen.getByTestId('sucursal-card-suc-002')).toBeInTheDocument();
    });

    it('3.2 - Cada card muestra nombre de la sucursal', () => {
      configurarMockSucursales();

      render(<CortePage />);

      expect(screen.getByText('Los Héroes')).toBeInTheDocument();
      expect(screen.getByText('Plaza Merliot')).toBeInTheDocument();
    });

    it('3.3 - Cada card muestra codigo en badge', () => {
      configurarMockSucursales();

      render(<CortePage />);

      expect(screen.getByText('H')).toBeInTheDocument();
      expect(screen.getByText('M')).toBeInTheDocument();
    });

    it('3.4 - Click en card selecciona esa sucursal', async () => {
      configurarMockSucursales();

      const user = userEvent.setup();
      render(<CortePage />);

      const card = screen.getByTestId('sucursal-card-suc-001');
      await user.click(card);

      // Despues de click, orquestador debe montarse
      expect(screen.getByTestId('mock-orquestador')).toBeInTheDocument();
    });

    it('3.5 - Titulo "Seleccionar Sucursal" visible', () => {
      configurarMockSucursales();

      render(<CortePage />);

      expect(screen.getByText('Seleccionar Sucursal')).toBeInTheDocument();
    });
  });

  // Suite 4: Auto-seleccion con 1 sucursal
  describe('Suite 4: Auto-seleccion con 1 sucursal', () => {
    it('4.1 - Con 1 sola sucursal, monta orquestador directamente (sin picker)', async () => {
      const unaSucursal: Sucursal[] = [
        { id: 'suc-001', nombre: 'Los Héroes', codigo: 'H', activa: true },
      ];
      configurarMockSucursales({ sucursales: unaSucursal });

      render(<CortePage />);

      await waitFor(() => {
        expect(screen.getByTestId('mock-orquestador')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('picker-sucursales')).not.toBeInTheDocument();
    });

    it('4.2 - Con 2+ sucursales, muestra picker (NO auto-selecciona)', () => {
      configurarMockSucursales();

      render(<CortePage />);

      expect(screen.getByTestId('picker-sucursales')).toBeInTheDocument();
      expect(screen.queryByTestId('mock-orquestador')).not.toBeInTheDocument();
    });
  });

  // Suite 5: Montaje de CorteOrquestador
  describe('Suite 5: Montaje de CorteOrquestador', () => {
    it('5.1 - Monta CorteOrquestador despues de seleccionar sucursal', async () => {
      configurarMockSucursales();

      const user = userEvent.setup();
      render(<CortePage />);

      await user.click(screen.getByTestId('sucursal-card-suc-002'));

      expect(screen.getByTestId('mock-orquestador')).toBeInTheDocument();
    });

    it('5.2 - Pasa sucursalId correcta al orquestador', async () => {
      configurarMockSucursales();

      const user = userEvent.setup();
      render(<CortePage />);

      await user.click(screen.getByTestId('sucursal-card-suc-002'));

      const orquestador = screen.getByTestId('mock-orquestador');
      expect(orquestador).toHaveAttribute('data-sucursal-id', 'suc-002');
    });

    it('5.3 - Pasa array de sucursales completo al orquestador', async () => {
      configurarMockSucursales();

      const user = userEvent.setup();
      render(<CortePage />);

      await user.click(screen.getByTestId('sucursal-card-suc-001'));

      const orquestador = screen.getByTestId('mock-orquestador');
      expect(orquestador).toHaveAttribute('data-sucursales-count', '2');
    });

    it('5.4 - onSalir del orquestador vuelve al picker de sucursales', async () => {
      configurarMockSucursales();

      const user = userEvent.setup();
      render(<CortePage />);

      // Seleccionar sucursal
      await user.click(screen.getByTestId('sucursal-card-suc-001'));
      expect(screen.getByTestId('mock-orquestador')).toBeInTheDocument();

      // Hacer clic en "Salir Mock" del orquestador
      await user.click(screen.getByText('Salir Mock'));

      // Debe volver al picker
      expect(screen.getByTestId('picker-sucursales')).toBeInTheDocument();
      expect(screen.queryByTestId('mock-orquestador')).not.toBeInTheDocument();
    });
  });

  // Suite 6: Navegacion ida y vuelta
  describe('Suite 6: Navegacion ida y vuelta', () => {
    it('6.1 - Seleccionar → ver orquestador → salir → ver picker de nuevo', async () => {
      configurarMockSucursales();

      const user = userEvent.setup();
      render(<CortePage />);

      // Estado inicial: picker
      expect(screen.getByTestId('picker-sucursales')).toBeInTheDocument();

      // Seleccionar sucursal
      await user.click(screen.getByTestId('sucursal-card-suc-001'));
      expect(screen.getByTestId('mock-orquestador')).toBeInTheDocument();
      expect(screen.queryByTestId('picker-sucursales')).not.toBeInTheDocument();

      // Salir del orquestador
      await user.click(screen.getByText('Salir Mock'));
      expect(screen.getByTestId('picker-sucursales')).toBeInTheDocument();
      expect(screen.queryByTestId('mock-orquestador')).not.toBeInTheDocument();
    });

    it('6.2 - Puede seleccionar sucursal diferente despues de volver', async () => {
      configurarMockSucursales();

      const user = userEvent.setup();
      render(<CortePage />);

      // Seleccionar primera sucursal
      await user.click(screen.getByTestId('sucursal-card-suc-001'));
      expect(screen.getByTestId('mock-orquestador')).toHaveAttribute(
        'data-sucursal-id',
        'suc-001'
      );

      // Volver
      await user.click(screen.getByText('Salir Mock'));

      // Seleccionar segunda sucursal
      await user.click(screen.getByTestId('sucursal-card-suc-002'));
      expect(screen.getByTestId('mock-orquestador')).toHaveAttribute(
        'data-sucursal-id',
        'suc-002'
      );
    });

    it('6.3 - Boton "Volver" en picker llama onSalir del padre', async () => {
      const onSalir = vi.fn();
      configurarMockSucursales();

      const user = userEvent.setup();
      render(<CortePage onSalir={onSalir} />);

      const volver = screen.getByText('Volver');
      await user.click(volver);

      expect(onSalir).toHaveBeenCalledTimes(1);
    });
  });

  // Suite 7: Edge cases
  describe('Suite 7: Edge cases', () => {
    it('7.1 - onSalir es opcional — no crashea si es undefined', async () => {
      configurarMockSucursales({ error: 'Fallo', sucursales: [] });

      const user = userEvent.setup();
      render(<CortePage />);

      // Click en Volver sin onSalir — no debe crashear
      const volver = screen.getByText('Volver');
      await user.click(volver);

      // Si llegamos aqui, no crasheo
      expect(screen.getByTestId('error-sucursales')).toBeInTheDocument();
    });

    it('7.2 - Lista vacia de sucursales muestra mensaje "No hay sucursales activas"', () => {
      configurarMockSucursales({ sucursales: [] });

      render(<CortePage />);

      expect(
        screen.getByText('No hay sucursales activas disponibles')
      ).toBeInTheDocument();
    });
  });
});
