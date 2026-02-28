// 🤖 [IA] - v4.1.0: TDD RED — tests para CortesResumen (tab Resumen/KPI)
// Estos tests se escriben ANTES de que el componente exista (REGLA DE ORO TDD).

import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Fixture KPI global con datos representativos
const KPI_FIXTURE = {
  totalCortes: 5,
  totalCash: 1200,
  totalElectronic: 300,
  totalGeneral: 1500,
  totalExpenses: 100,
  totalAdjusted: 1400,
  totalEsperado: 1350,
  diferencia: 50,
  sobrantes: 3,
  faltantes: 1,
  exactos: 1,
  porSucursal: [
    {
      sucursalId: 'suc-a',
      sucursalNombre: 'Los Héroes',
      totalCortes: 3,
      totalCash: 700,
      totalElectronic: 200,
      totalGeneral: 900,
      totalExpenses: 60,
      totalAdjusted: 840,
      totalEsperado: 800,
      diferencia: 40,
      sobrantes: 2,
      faltantes: 0,
      exactos: 1,
    },
    {
      sucursalId: 'suc-b',
      sucursalNombre: 'Plaza Merliot',
      totalCortes: 2,
      totalCash: 500,
      totalElectronic: 100,
      totalGeneral: 600,
      totalExpenses: 40,
      totalAdjusted: 560,
      totalEsperado: 550,
      diferencia: 10,
      sobrantes: 1,
      faltantes: 1,
      exactos: 0,
    },
  ],
};

// Variable mutable para controlar el mock desde cada test
let mockReturn: {
  kpi: typeof KPI_FIXTURE | null;
  cargando: boolean;
  error: string | null;
  recargar: () => void;
} = {
  kpi: KPI_FIXTURE,
  cargando: false,
  error: null,
  recargar: vi.fn(),
};

vi.mock('@/hooks/supervisor/useSupervisorAnalytics', () => ({
  useSupervisorAnalytics: () => mockReturn,
}));

// Import DESPUÉS de los mocks (patrón validado en CortesDelDia tests)
import { CortesResumen } from '../CortesResumen';

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CortesResumen — analytics layout', () => {
  // T1: Estado cargando → spinner visible
  it('muestra indicador de carga cuando cargando=true', () => {
    mockReturn = { kpi: null, cargando: true, error: null, recargar: vi.fn() };
    render(<CortesResumen />);
    expect(screen.getByText(/cargando datos/i)).toBeInTheDocument();
  });

  // T2: Estado error → mensaje error visible
  it('muestra mensaje de error cuando hay error', () => {
    mockReturn = { kpi: null, cargando: false, error: 'Fallo de red', recargar: vi.fn() };
    render(<CortesResumen />);
    expect(screen.getByText(/fallo de red/i)).toBeInTheDocument();
    expect(screen.getByText(/reintentar/i)).toBeInTheDocument();
  });

  // T3: Estado sin cortes → mensaje vacío
  it('muestra mensaje de sin datos cuando totalCortes=0', () => {
    mockReturn = {
      kpi: { ...KPI_FIXTURE, totalCortes: 0, porSucursal: [] },
      cargando: false,
      error: null,
      recargar: vi.fn(),
    };
    render(<CortesResumen />);
    expect(screen.getByText(/sin cortes finalizados/i)).toBeInTheDocument();
  });

  // T4: Estado datos OK → resumen global renderiza
  it('renderiza resumen global con KPI cards', () => {
    mockReturn = { kpi: KPI_FIXTURE, cargando: false, error: null, recargar: vi.fn() };
    render(<CortesResumen />);

    // Verificar sección "Resumen global"
    expect(screen.getByText(/resumen global/i)).toBeInTheDocument();
    // Verificar que aparecen los 3 contadores del semáforo
    expect(screen.getByText('Sobrantes')).toBeInTheDocument();
    expect(screen.getByText('Faltantes')).toBeInTheDocument();
    expect(screen.getByText('Exactos')).toBeInTheDocument();
  });

  // T5: Estado datos OK → sucursales renderizan sin tabla horizontal
  it('renderiza sucursales en formato legible sin duplicados ni tabla ancha', () => {
    mockReturn = { kpi: KPI_FIXTURE, cargando: false, error: null, recargar: vi.fn() };
    render(<CortesResumen />);

    expect(screen.getByText(/por sucursal/i)).toBeInTheDocument();
    expect(screen.getAllByText('Los Héroes')).toHaveLength(1);
    expect(screen.getAllByText('Plaza Merliot')).toHaveLength(1);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('usa layout de una columna y filas compactas para evitar huecos visuales', () => {
    mockReturn = { kpi: KPI_FIXTURE, cargando: false, error: null, recargar: vi.fn() };
    render(<CortesResumen />);

    const grid = screen.getByTestId('sucursal-grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(screen.getAllByTestId('sucursal-metrics')).toHaveLength(2);
    expect(screen.getAllByTestId('sucursal-metric-row')).toHaveLength(8);
  });

  // T6: Filtros de fecha renderizan
  it('renderiza filtros de fecha Desde y Hasta', () => {
    mockReturn = { kpi: KPI_FIXTURE, cargando: false, error: null, recargar: vi.fn() };
    render(<CortesResumen />);

    expect(screen.getByText(/desde/i)).toBeInTheDocument();
    expect(screen.getByText(/hasta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/recargar datos/i)).toBeInTheDocument();
  });

  it('muestra bloque de alertas operativas para lectura rápida', () => {
    mockReturn = { kpi: KPI_FIXTURE, cargando: false, error: null, recargar: vi.fn() };
    render(<CortesResumen />);

    expect(screen.getByText(/alertas operativas/i)).toBeInTheDocument();
  });

  it('renderiza acciones rápidas de periodo para filtrar', () => {
    mockReturn = { kpi: KPI_FIXTURE, cargando: false, error: null, recargar: vi.fn() };
    render(<CortesResumen />);

    expect(screen.getByRole('button', { name: /hoy/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /últimos 7 días/i })).toBeInTheDocument();
  });
});
