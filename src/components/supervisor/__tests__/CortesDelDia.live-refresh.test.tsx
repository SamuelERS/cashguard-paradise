import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const liveFeedMock = vi.hoisted(() => ({
  realtimeStatus: 'subscribed' as 'subscribed' | 'error',
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/hooks/useSupervisorQueries', () => ({
  useSupervisorQueries: () => ({
    cargando: false,
    error: null,
    obtenerCortesDelDia: async () => [
      {
        id: 'a1',
        correlativo: 'CORTE-2026-02-24-M-001',
        estado: 'EN_PROGRESO',
        sucursales: { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
        cajero: 'Irvin Abarca',
        created_at: '2026-02-24T21:43:13.000Z',
        finalizado_at: null,
        venta_esperada: 232,
        datos_conteo: null,
      },
    ],
  }),
}));

vi.mock('@/hooks/useSupervisorRealtime', () => ({
  useSupervisorRealtime: () => ({
    status: 'disabled',
    lastEventAt: null,
    error: null,
  }),
}));

vi.mock('@/hooks/supervisor/useSupervisorTodayFeed', () => ({
  useSupervisorTodayFeed: () => ({
    cortes: [
      {
        id: 'a1',
        correlativo: 'CORTE-2026-02-24-M-001',
        estado: 'EN_PROGRESO',
        sucursales: { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
        cajero: 'Irvin Abarca',
        created_at: '2026-02-24T21:43:13.000Z',
        finalizado_at: null,
        venta_esperada: 232,
        datos_conteo: null,
      },
    ],
    cargando: false,
    actualizando: false,
    error: null,
    ultimaActualizacion: new Date('2026-02-24T21:45:00.000Z'),
    realtimeStatus: liveFeedMock.realtimeStatus,
  }),
}));

import { CortesDelDia } from '../CortesDelDia';

describe('CortesDelDia - live refresh UX', () => {
  beforeEach(() => {
    liveFeedMock.realtimeStatus = 'subscribed';
  });

  it('muestra indicador En vivo cuando realtime está suscrito', async () => {
    render(<CortesDelDia />);
    expect(await screen.findByText('En vivo')).toBeInTheDocument();
  });

  it('muestra indicador Reconectando cuando realtime está en error', async () => {
    liveFeedMock.realtimeStatus = 'error';

    render(<CortesDelDia />);

    expect(await screen.findByText('Reconectando')).toBeInTheDocument();
  });
});
