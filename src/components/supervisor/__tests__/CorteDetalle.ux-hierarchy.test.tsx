import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const detailFeedMock = vi.hoisted(() => ({
  corte: null as Record<string, unknown> | null,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: 'corte-ux-001' }),
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
  id: 'corte-ux-001',
  correlativo: 'CORTE-2026-02-25-M-009',
  sucursal_id: 'suc-002',
  cajero: 'Irvin Abarca',
  testigo: 'Edenilson Lopez',
  estado: 'EN_PROGRESO' as const,
  fase_actual: 2,
  intento_actual: 1,
  venta_esperada: 500,
  datos_conteo: {
    conteo_parcial: {
      penny: 20,
      nickel: 10,
      dime: 8,
      quarter: 4,
      dollarCoin: 3,
      bill1: 5,
      bill5: 4,
      bill10: 3,
      bill20: 2,
      bill50: 1,
      bill100: 1,
    },
    pagos_electronicos: {
      credomatic: 120,
      promerica: 30,
      bankTransfer: 0,
      paypal: 0,
    },
    gastos_dia: { items: [] },
  },
  datos_entrega: {
    amount_to_deliver: 327.2,
    amount_remaining: 50,
    denominations_to_deliver: {
      dime: 5,
      quarter: 3,
      bill20: 2,
    },
    live_delivery_progress: {
      dime: 2,
      quarter: 1,
      bill20: 1,
    },
    live_delivery_events: [
      { stepKey: 'dime', quantity: 2, subtotal: 0.2, capturedAt: '2026-02-25T01:00:00.000Z' },
      { stepKey: 'quarter', quantity: 1, subtotal: 0.25, capturedAt: '2026-02-25T01:01:00.000Z' },
      { stepKey: 'bill20', quantity: 1, subtotal: 20, capturedAt: '2026-02-25T01:02:00.000Z' },
    ],
    live_delivery_total: 20.45,
  },
  datos_verificacion: null,
  datos_reporte: null,
  reporte_hash: null,
  created_at: '2026-02-25T00:00:00.000Z',
  updated_at: '2026-02-25T00:36:37.244Z',
  finalizado_at: null,
  motivo_aborto: null,
  sucursales: {
    id: 'suc-002',
    nombre: 'Plaza Merliot',
    codigo: 'M',
    activa: true,
  },
};

describe('CorteDetalle - UX hierarchy', () => {
  beforeEach(() => {
    detailFeedMock.corte = CORTE_FIXTURE;
  });

  it('muestra panel operativo compacto con datos de supervision', async () => {
    render(<CorteDetalle />);

    await screen.findByText(/panel operativo del corte/i);
    expect(screen.getByText(/prioridad supervisión/i)).toBeInTheDocument();
  });

  it('muestra progreso de entrega en vivo y subtotales de efectivo', async () => {
    render(<CorteDetalle />);

    await screen.findByText(/progreso de entrega en vivo/i);
    expect(screen.getByText(/subtotal monedas/i)).toBeInTheDocument();
    expect(screen.getByText(/subtotal billetes/i)).toBeInTheDocument();
  });

  it('mantiene orden panel operativo -> cierre y entrega -> entrega live', async () => {
    render(<CorteDetalle />);

    const panelHeading = await screen.findByText(/panel operativo del corte/i);
    const cierreEntregaHeading = await screen.findByText(/cierre y entrega/i);
    const progresoHeading = await screen.findByText(/progreso de entrega en vivo/i);

    const panelVsCierre = panelHeading.compareDocumentPosition(cierreEntregaHeading);
    expect(panelVsCierre & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    const cierreVsProgreso = cierreEntregaHeading.compareDocumentPosition(progresoHeading);
    expect(cierreVsProgreso & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
