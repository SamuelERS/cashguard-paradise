import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockObtenerCorteDetalle = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: 'corte-001' }),
}));

vi.mock('@/hooks/useSupervisorQueries', () => ({
  useSupervisorQueries: () => ({
    cargando: false,
    error: null,
    obtenerCorteDetalle: mockObtenerCorteDetalle,
  }),
}));

import { CorteDetalle } from '../CorteDetalle';

const CORTE_DETALLE_FIXTURE = {
  id: 'corte-001',
  correlativo: 'CORTE-2026-02-25-H-001',
  sucursal_id: 'suc-001',
  cajero: 'Adonay Torres',
  testigo: 'Jonathan Melara',
  estado: 'EN_PROGRESO' as const,
  fase_actual: 2,
  intento_actual: 1,
  venta_esperada: 654,
  datos_conteo: {
    conteo_parcial: {
      penny: 77,
      nickel: 66,
      dime: 55,
      quarter: 44,
      dollarCoin: 33,
      bill1: 22,
      bill5: 11,
      bill10: 4,
      bill20: 4,
      bill50: 3,
      bill100: 2,
    },
    pagos_electronicos: {
      credomatic: 23,
      promerica: 31,
      bankTransfer: 23,
      paypal: 12,
    },
    gastos_dia: {
      items: [
        {
          id: 'gasto-001',
          amount: 12.5,
          concept: 'Taxi cierre',
          category: 'employees',
          hasInvoice: false,
          timestamp: '2026-02-25T00:12:00.000Z',
        },
      ],
    },
  },
  datos_entrega: {
    amount_to_deliver: 573.57,
    amount_remaining: 50,
  },
  datos_verificacion: {
    behavior: {
      totalAttempts: 2,
    },
  },
  datos_reporte: null,
  reporte_hash: null,
  created_at: '2026-02-25T00:00:00.000Z',
  updated_at: '2026-02-25T00:36:37.244Z',
  finalizado_at: null,
  motivo_aborto: null,
  sucursales: {
    id: 'suc-001',
    nombre: 'Los Héroes',
    codigo: 'H',
    activa: true,
  },
};

describe('CorteDetalle - legibilidad de dinero del corte', () => {
  beforeEach(() => {
    mockObtenerCorteDetalle.mockReset();
    mockObtenerCorteDetalle.mockResolvedValue(CORTE_DETALLE_FIXTURE);
  });

  it('muestra bloques legibles de entrega y gastos cuando vienen en Supabase', async () => {
    render(<CorteDetalle />);

    await screen.findByText(/resumen financiero/i);
    expect(screen.getByText(/entrega a gerencia/i)).toBeInTheDocument();
    expect(screen.getByText(/monto a entregar/i)).toBeInTheDocument();
    expect(screen.getByText(/gastos del día/i)).toBeInTheDocument();
    expect(screen.getByText(/taxi cierre/i)).toBeInTheDocument();
  });
});
