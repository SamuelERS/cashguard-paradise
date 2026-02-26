import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const detailFeedMock = vi.hoisted(() => ({
  corte: null as Record<string, unknown> | null,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: 'corte-live-ux-001' }),
}));

vi.mock('@/hooks/supervisor/useSupervisorCorteDetalleFeed', () => ({
  useSupervisorCorteDetalleFeed: () => ({
    corte: detailFeedMock.corte,
    cargando: false,
    actualizando: false,
    error: null,
    noEncontrado: false,
    realtimeStatus: 'subscribed',
    refrescar: vi.fn(),
  }),
}));

import { CorteDetalle } from '../CorteDetalle';

const CORTE_FIXTURE = {
  id: 'corte-live-ux-001',
  correlativo: 'CORTE-2026-02-25-H-011',
  sucursal_id: 'suc-001',
  cajero: 'Tito Gomez',
  testigo: 'Adonay Torres',
  estado: 'EN_PROGRESO' as const,
  fase_actual: 3,
  intento_actual: 1,
  venta_esperada: 300,
  datos_conteo: {
    conteo_parcial: {
      dime: 10,
      quarter: 8,
      bill20: 4,
    },
    pagos_electronicos: {
      credomatic: 40,
      promerica: 20,
      bankTransfer: 0,
      paypal: 0,
    },
    gastos_dia: {
      items: [
        {
          id: 'g-001',
          concept: 'Taxi',
          amount: 8,
          category: 'employees',
          timestamp: '2026-02-25T01:10:00.000Z',
          hasInvoice: false,
        },
      ],
    },
  },
  datos_entrega: {
    amount_to_deliver: 100,
    amount_remaining: 50,
    denominations_to_deliver: {
      dime: 2,
      quarter: 3,
      bill20: 1,
    },
    live_delivery_progress: {
      dime: 2,
      quarter: 1,
      bill20: 2,
    },
    live_delivery_events: [
      { stepKey: 'dime', quantity: 2, subtotal: 0.2, capturedAt: '2026-02-25T01:00:00.000Z' },
      { stepKey: 'quarter', quantity: 1, subtotal: 0.25, capturedAt: '2026-02-25T01:01:00.000Z' },
      { stepKey: 'bill20', quantity: 2, subtotal: 40, capturedAt: '2026-02-25T01:02:00.000Z' },
    ],
    live_delivery_total: 40.45,
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

describe('CorteDetalle - UX compacta entrega live', () => {
  beforeEach(() => {
    detailFeedMock.corte = CORTE_FIXTURE;
  });

  it('muestra solo hora local en la columna Hora (sin fecha)', async () => {
    render(<CorteDetalle />);

    const liveHeading = await screen.findByText(/progreso de entrega en vivo/i);
    const card = liveHeading.closest('div[aria-live="polite"]');
    expect(card).not.toBeNull();
    const scoped = within(card as HTMLElement);

    expect(scoped.getByText(/hora/i)).toBeInTheDocument();
    expect(scoped.queryByText(/\d{2}\/\d{2}\/\d{4}/i)).not.toBeInTheDocument();
  });

  it('muestra estado visual por fila: OK (amarillo), FALTA/SOBRA (rojo)', async () => {
    render(<CorteDetalle />);

    const liveHeading = await screen.findByText(/progreso de entrega en vivo/i);
    const card = liveHeading.closest('div[aria-live="polite"]');
    expect(card).not.toBeNull();
    const scoped = within(card as HTMLElement);

    expect(scoped.getByText(/^OK$/i)).toHaveClass('text-amber-300');

    const faltanteEstado = scoped
      .getAllByText(/^FALTA$/i)
      .find((element) => element.className.includes('text-red-400'));
    expect(faltanteEstado).toBeDefined();

    expect(scoped.getByText(/^SOBRA$/i)).toHaveClass('text-red-400');
  });

  it('ubica Progreso de entrega en vivo inmediatamente despues del panel operativo', async () => {
    render(<CorteDetalle />);

    const panelHeading = await screen.findByText(/panel operativo del corte/i);
    const liveHeading = await screen.findByText(/progreso de entrega en vivo/i);
    const gastosHeading = screen.getByText(/gastos del día/i);

    const panelVsLive = panelHeading.compareDocumentPosition(liveHeading);
    expect(panelVsLive & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const liveVsGastos = liveHeading.compareDocumentPosition(gastosHeading);
    expect(liveVsGastos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
