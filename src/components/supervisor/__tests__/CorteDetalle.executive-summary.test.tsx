import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const detailFeedMock = vi.hoisted(() => ({
  corte: null as Record<string, unknown> | null,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: 'corte-001' }),
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

const BASE_FIXTURE = {
  id: 'corte-001',
  correlativo: 'CORTE-2026-02-25-M-001',
  sucursal_id: 'suc-002',
  cajero: 'Irvin Abarca',
  testigo: 'Edenilson Lopez',
  estado: 'EN_PROGRESO' as const,
  fase_actual: 2,
  intento_actual: 1,
  venta_esperada: 712.4,
  datos_conteo: {
    conteo_parcial: {
      penny: 40,
      nickel: 10,
      dime: 20,
      quarter: 30,
      dollarCoin: 0,
      bill1: 12,
      bill5: 6,
      bill10: 4,
      bill20: 7,
      bill50: 1,
      bill100: 1,
    },
    pagos_electronicos: {
      credomatic: 15,
      promerica: 26.2,
      bankTransfer: 0,
      paypal: 0,
    },
    gastos_dia: { items: [] },
  },
  datos_entrega: {
    amount_to_deliver: 351.65,
    amount_remaining: 50,
  },
  datos_verificacion: null,
  datos_reporte: null,
  reporte_hash: null,
  created_at: '2026-02-24T19:38:17.000Z',
  updated_at: '2026-02-24T19:41:22.000Z',
  finalizado_at: null,
  motivo_aborto: null,
  sucursales: {
    id: 'suc-002',
    nombre: 'Plaza Merliot',
    codigo: 'M',
    activa: true,
  },
};

describe('CorteDetalle - contrato de resumen operativo', () => {
  beforeEach(() => {
    detailFeedMock.corte = null;
  });

  it('muestra panel operativo con estado, total y diferencia', async () => {
    detailFeedMock.corte = BASE_FIXTURE;
    render(<CorteDetalle />);

    const panel = await screen.findByLabelText(/panel operativo del corte/i);
    const scoped = within(panel);
    expect(scoped.getByText(/^estado$/i)).toBeInTheDocument();
    expect(scoped.getByText('EN_PROGRESO')).toBeInTheDocument();
    expect(scoped.getByText(/total contado/i)).toBeInTheDocument();
    expect(scoped.getByText(/diferencia vs sicar/i)).toBeInTheDocument();
  });

  it('consolida entrega y resumen financiero en una sola card operativa', async () => {
    detailFeedMock.corte = BASE_FIXTURE;
    render(<CorteDetalle />);

    const heading = await screen.findByText(/cierre y entrega/i);
    const card = heading.closest('div');
    expect(card).not.toBeNull();

    const scoped = within(card as HTMLElement);
    expect(scoped.getByText(/monto a entregar/i)).toBeInTheDocument();
    expect(scoped.getByText(/vuelto fijo en caja/i)).toBeInTheDocument();
    expect(scoped.getByText(/efectivo contado/i)).toBeInTheDocument();
    expect(scoped.getByText(/electrónico registrado/i)).toBeInTheDocument();
    expect(scoped.getByText(/venta esperada \(sicar\)/i)).toBeInTheDocument();
    expect(scoped.queryByText(/total contado/i)).not.toBeInTheDocument();
    expect(scoped.queryByText(/^diferencia$/i)).not.toBeInTheDocument();
    expect(scoped.queryByRole('button', { name: /detalle financiero/i })).not.toBeInTheDocument();

    expect(screen.queryByText(/^entrega a gerencia$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^resumen financiero$/i)).not.toBeInTheDocument();
  });

  it('evita duplicar kpis globales del panel operativo en cierre y entrega', async () => {
    detailFeedMock.corte = BASE_FIXTURE;
    render(<CorteDetalle />);

    const panel = await screen.findByLabelText(/panel operativo del corte/i);
    const panelScoped = within(panel);
    expect(panelScoped.getByText(/total contado/i)).toBeInTheDocument();
    expect(panelScoped.getByText(/diferencia vs sicar/i)).toBeInTheDocument();

    const heading = await screen.findByText(/cierre y entrega/i);
    const card = heading.closest('div');
    expect(card).not.toBeNull();
    const scoped = within(card as HTMLElement);

    expect(scoped.queryByText(/total contado/i)).not.toBeInTheDocument();
    expect(scoped.queryByText(/^diferencia$/i)).not.toBeInTheDocument();
  });

  it('en estado ABORTADO muestra incidencia de cierre con motivo visible', async () => {
    detailFeedMock.corte = {
      ...BASE_FIXTURE,
      estado: 'ABORTADO',
      finalizado_at: '2026-02-24T20:10:00.000Z',
      motivo_aborto: 'Sesión abortada por usuario desde wizard',
    };

    render(<CorteDetalle />);

    await screen.findByText(/incidencia de cierre/i);
    expect(screen.getByText(/motivo de aborto/i)).toBeInTheDocument();
    expect(
      screen.getByText(/sesión abortada por usuario desde wizard/i),
    ).toBeInTheDocument();
  });

  it('prioriza snapshot matemático de datos_reporte en KPIs del panel', async () => {
    detailFeedMock.corte = {
      ...BASE_FIXTURE,
      estado: 'FINALIZADO',
      finalizado_at: '2026-02-24T20:10:00.000Z',
      datos_reporte: {
        total_with_expenses: 987.65,
        expected_sales_adjusted: 942.0,
        difference: 45.65,
      },
    };

    render(<CorteDetalle />);

    const panel = await screen.findByLabelText(/panel operativo del corte/i);
    const scopedPanel = within(panel);
    expect(scopedPanel.getByText('$987.65')).toBeInTheDocument();
    expect(scopedPanel.getByText('+$45.65')).toBeInTheDocument();

    const financialHeading = await screen.findByText(/cierre y entrega/i);
    const financialCard = financialHeading.closest('div');
    expect(financialCard).not.toBeNull();
    const scopedCard = within(financialCard as HTMLElement);
    expect(scopedCard.getByText('$942.00')).toBeInTheDocument();
    expect(scopedCard.queryByText('$987.65')).not.toBeInTheDocument();
    expect(scopedCard.queryByText('+$45.65')).not.toBeInTheDocument();
  });
});
