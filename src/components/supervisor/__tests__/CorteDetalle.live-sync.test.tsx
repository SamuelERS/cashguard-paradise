import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const detailLiveMock = vi.hoisted(() => ({
  realtimeStatus: 'subscribed' as 'subscribed' | 'error',
}));

const CORTE_FIXTURE = {
  id: 'corte-001',
  correlativo: 'CORTE-2026-02-25-M-001',
  sucursal_id: 'suc-002',
  cajero: 'Irvin Abarca',
  testigo: 'Edenilson Lopez',
  estado: 'EN_PROGRESO' as const,
  fase_actual: 2,
  intento_actual: 1,
  venta_esperada: 321,
  datos_conteo: {
    conteo_parcial: { bill20: 10 },
    pagos_electronicos: { credomatic: 0, promerica: 0, bankTransfer: 0, paypal: 0 },
    gastos_dia: { items: [] },
  },
  datos_entrega: null,
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

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ id: 'corte-001' }),
}));

vi.mock('@/hooks/useSupervisorQueries', () => ({
  useSupervisorQueries: () => ({
    cargando: false,
    error: null,
    obtenerCorteDetalle: vi.fn().mockResolvedValue(CORTE_FIXTURE),
  }),
}));

vi.mock('@/hooks/useSupervisorRealtime', () => ({
  useSupervisorRealtime: () => ({
    status: 'disabled',
    lastEventAt: null,
    error: null,
  }),
}));

vi.mock('@/hooks/supervisor/useSupervisorCorteDetalleFeed', () => ({
  useSupervisorCorteDetalleFeed: () => ({
    corte: CORTE_FIXTURE,
    cargando: false,
    actualizando: false,
    error: null,
    noEncontrado: false,
    realtimeStatus: detailLiveMock.realtimeStatus,
    refrescar: vi.fn(),
  }),
}));

import { CorteDetalle } from '../CorteDetalle';

describe('CorteDetalle - live sync UX', () => {
  beforeEach(() => {
    detailLiveMock.realtimeStatus = 'subscribed';
  });

  it('muestra En vivo cuando realtime está suscrito', async () => {
    render(<CorteDetalle />);
    expect(await screen.findByText('En vivo')).toBeInTheDocument();
  });

  it('muestra Reconectando cuando realtime está en error', async () => {
    detailLiveMock.realtimeStatus = 'error';
    render(<CorteDetalle />);
    expect(await screen.findByText('Reconectando')).toBeInTheDocument();
  });
});
