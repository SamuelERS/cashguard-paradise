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

const CORTE_FIXTURE = {
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
      dime: 12,
      quarter: 4,
      bill20: 2,
    },
    pagos_electronicos: {
      credomatic: 23,
      promerica: 31,
      bankTransfer: 23,
      paypal: 12,
    },
    gastos_dia: { items: [] },
  },
  datos_entrega: {
    amount_to_deliver: 573.57,
    amount_remaining: 50,
    denominations_to_deliver: {
      dime: 5,
      quarter: 2,
    },
    live_delivery_progress: {
      dime: 2,
      quarter: 1,
    },
    live_delivery_events: [
      {
        stepKey: 'dime',
        quantity: 2,
        subtotal: 0.2,
        capturedAt: '2026-02-25T01:00:00.000Z',
      },
      {
        stepKey: 'quarter',
        quantity: 1,
        subtotal: 0.25,
        capturedAt: '2026-02-25T01:01:00.000Z',
      },
    ],
    live_delivery_total: 0.45,
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

describe('CorteDetalle - tabla entrega en vivo', () => {
  beforeEach(() => {
    detailFeedMock.corte = CORTE_FIXTURE;
  });

  it('renderiza tabla compacta de entrega en vivo con columnas clave visibles por defecto', async () => {
    render(<CorteDetalle />);

    const liveHeading = await screen.findByText(/progreso de entrega en vivo/i);
    const liveCard = liveHeading.closest('div[aria-live="polite"]');
    expect(liveCard).not.toBeNull();
    const scoped = within(liveCard as HTMLElement);

    expect(scoped.getByRole('columnheader', { name: /denom/i })).toBeInTheDocument();
    expect(scoped.getByRole('columnheader', { name: /base/i })).toBeInTheDocument();
    expect(scoped.getByRole('columnheader', { name: /meta ent/i })).toBeInTheDocument();
    expect(scoped.getByRole('columnheader', { name: /^ent\.$/i })).toBeInTheDocument();
    expect(scoped.getByRole('columnheader', { name: /Δ ent/i })).toBeInTheDocument();
    expect(scoped.getByRole('columnheader', { name: /caja obj/i })).toBeInTheDocument();
    expect(scoped.getByRole('columnheader', { name: /caja real/i })).toBeInTheDocument();
    expect(scoped.getByRole('columnheader', { name: /Δ caja/i })).toBeInTheDocument();
    expect(scoped.getByRole('columnheader', { name: /hora/i })).toBeInTheDocument();
    expect(scoped.queryByRole('button', { name: /ver caja|ocultar caja/i })).not.toBeInTheDocument();
    expect(scoped.getByText(/diez centavos/i)).toBeInTheDocument();
    expect(scoped.getByText(/veinticinco centavos/i)).toBeInTheDocument();
  });

  it('muestra valores compactos de entrega y caja por denominación', async () => {
    render(<CorteDetalle />);

    const liveHeading = await screen.findByText(/progreso de entrega en vivo/i);
    const liveCard = liveHeading.closest('div[aria-live="polite"]');
    expect(liveCard).not.toBeNull();
    const scoped = within(liveCard as HTMLElement);

    const rowDiezCentavos = scoped.getByText(/diez centavos/i).closest('tr');
    expect(rowDiezCentavos).not.toBeNull();
    const rowScoped = within(rowDiezCentavos as HTMLElement);
    expect(rowScoped.getByText('12')).toBeInTheDocument();
    expect(rowScoped.getByText('5')).toBeInTheDocument();
    expect(rowScoped.getByText('2')).toBeInTheDocument();
    expect(rowScoped.getByText('7')).toBeInTheDocument();
    expect(rowScoped.getByText('10')).toBeInTheDocument();
    expect(rowScoped.getByText('+3')).toBeInTheDocument();
  });

  it('ordena filas por ultima hora capturada (mas reciente arriba)', async () => {
    const { container } = render(<CorteDetalle />);

    await screen.findByText(/progreso de entrega en vivo/i);
    const rows = Array.from(container.querySelectorAll('tbody tr'));
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows[0].textContent?.toLowerCase()).toContain('veinticinco centavos');
    expect(rows[1].textContent?.toLowerCase()).toContain('diez centavos');
  });

  it('muestra hora compacta sin fecha en filas de entrega live', async () => {
    render(<CorteDetalle />);

    const liveHeading = await screen.findByText(/progreso de entrega en vivo/i);
    const liveCard = liveHeading.closest('div[aria-live="polite"]');
    expect(liveCard).not.toBeNull();
    const scoped = within(liveCard as HTMLElement);

    expect(scoped.queryByText(/\d{2}\/\d{2}\/\d{4}/i)).not.toBeInTheDocument();
  });
});
