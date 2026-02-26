import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const detailFeedMock = vi.hoisted(() => ({
  corte: null as Record<string, unknown> | null,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: 'corte-compact-001' }),
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
  id: 'corte-compact-001',
  correlativo: 'CORTE-2026-02-25-H-002',
  sucursal_id: 'suc-001',
  cajero: 'Tito Gomez',
  testigo: 'Adonay Torres',
  estado: 'EN_PROGRESO' as const,
  fase_actual: 3,
  intento_actual: 1,
  venta_esperada: 395.27,
  datos_conteo: {
    conteo_parcial: {
      penny: 10,
      nickel: 3,
      dime: 1,
      quarter: 2,
      dollarCoin: 4,
      bill1: 20,
      bill5: 8,
      bill10: 7,
      bill20: 5,
      bill50: 2,
      bill100: 1,
    },
    pagos_electronicos: {
      credomatic: 120,
      promerica: 40,
      bankTransfer: 18,
      paypal: 0,
    },
    gastos_dia: { items: [] },
  },
  datos_entrega: {
    amount_to_deliver: 136.32,
    amount_remaining: 50,
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

describe('CorteDetalle - panel operativo compacto', () => {
  beforeEach(() => {
    detailFeedMock.corte = CORTE_FIXTURE;
  });

  it('muestra panel superior compacto con snapshot, kpis y contexto', async () => {
    render(<CorteDetalle />);

    const heading = await screen.findByText(/panel operativo del corte/i);
    const panel = heading.closest('section') ?? heading.closest('div');
    expect(panel).not.toBeNull();

    const scoped = within(panel as HTMLElement);
    expect(scoped.getByText(/estado/i)).toBeInTheDocument();
    expect(scoped.getByText('EN_PROGRESO')).toBeInTheDocument();
    expect(scoped.getByText(/prioridad supervisión/i)).toBeInTheDocument();
    expect(scoped.getByText('Fase')).toBeInTheDocument();

    expect(scoped.getByText(/total contado/i)).toBeInTheDocument();
    expect(scoped.getByText(/diferencia vs sicar/i)).toBeInTheDocument();
    expect(scoped.getByText(/diferencia porcentual/i)).toBeInTheDocument();

    expect(scoped.getByText(/sucursal/i)).toBeInTheDocument();
    expect(scoped.getByText(/cajero/i)).toBeInTheDocument();
    expect(scoped.getByText(/testigo/i)).toBeInTheDocument();
  });

  it('deja de renderizar headings legacy separados y mantiene header del corte', async () => {
    render(<CorteDetalle />);

    await screen.findByText(/panel operativo del corte/i);

    expect(screen.queryByText(/radar operativo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/resumen ejecutivo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/identificación/i)).not.toBeInTheDocument();

    expect(screen.getByText(/corte #corte-2026-02-25-h-002/i)).toBeInTheDocument();
    expect(screen.getByText(/en vivo/i)).toBeInTheDocument();
  });
});
