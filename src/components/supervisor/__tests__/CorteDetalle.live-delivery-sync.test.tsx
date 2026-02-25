import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const detailFeedMock = vi.hoisted(() => ({
  state: {
    corte: null as Record<string, unknown> | null,
    cargando: false,
    actualizando: false,
    error: null as string | null,
    noEncontrado: false,
    realtimeStatus: 'subscribed' as const,
  },
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: 'corte-001' }),
}));

vi.mock('@/hooks/supervisor/useSupervisorCorteDetalleFeed', () => ({
  useSupervisorCorteDetalleFeed: () => ({
    ...detailFeedMock.state,
    refrescar: vi.fn(),
  }),
}));

import { CorteDetalle } from '../CorteDetalle';

const BASE_CORTE = {
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
    conteo_parcial: { dime: 12, quarter: 4, bill20: 2 },
    pagos_electronicos: { credomatic: 0, promerica: 0, bankTransfer: 0, paypal: 0 },
    gastos_dia: { items: [] },
  },
  datos_entrega: {
    amount_to_deliver: 573.57,
    amount_remaining: 50,
    denominations_to_deliver: { dime: 5 },
  },
  datos_verificacion: null,
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

describe('CorteDetalle - sync de entrega live', () => {
  it('renderiza nuevos datos live al refrescar feed del detalle', async () => {
    detailFeedMock.state.corte = BASE_CORTE;

    const { rerender } = render(<CorteDetalle />);

    expect(screen.getByText(/entrega en vivo/i)).toBeInTheDocument();
    expect(screen.getByText('$0.00')).toBeInTheDocument();

    detailFeedMock.state.corte = {
      ...BASE_CORTE,
      datos_entrega: {
        ...BASE_CORTE.datos_entrega,
        live_delivery_progress: { dime: 2 },
        live_delivery_events: [
          {
            stepKey: 'dime',
            quantity: 2,
            subtotal: 0.2,
            capturedAt: '2026-02-25T01:00:00.000Z',
          },
        ],
        live_delivery_total: 0.2,
      },
    };

    rerender(<CorteDetalle />);

    expect(await screen.findByText(/entrega en vivo/i)).toBeInTheDocument();
    expect(screen.getByText(/diez centavos/i)).toBeInTheDocument();
    expect(screen.getByText('$0.20')).toBeInTheDocument();
  });
});
