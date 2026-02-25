import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
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
      {
        id: 'f1',
        correlativo: 'CORTE-2026-02-24-M-004',
        estado: 'FINALIZADO',
        sucursales: { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
        cajero: 'Irvin Abarca',
        created_at: '2026-02-24T17:00:00.000Z',
        finalizado_at: '2026-02-24T19:20:00.000Z',
        venta_esperada: 200,
        datos_conteo: null,
      },
    ],
    cargando: false,
    actualizando: false,
    error: null,
    ultimaActualizacion: new Date('2026-02-24T22:00:00.000Z'),
    realtimeStatus: 'subscribed',
    refrescar: vi.fn(),
  }),
}));

import { CortesDelDia } from '../CortesDelDia';

describe('CortesDelDia - activity layout', () => {
  it('muestra secciones Activos ahora y Finalizados hoy con sus filas', async () => {
    render(<CortesDelDia />);

    expect(await screen.findByText('Activos ahora')).toBeInTheDocument();
    expect(screen.getByText('Finalizados hoy')).toBeInTheDocument();

    expect(screen.getAllByText('Plaza Merliot').length).toBeGreaterThan(0);
    expect(screen.getByText('Atraso 3')).toBeInTheDocument();
  });
});
