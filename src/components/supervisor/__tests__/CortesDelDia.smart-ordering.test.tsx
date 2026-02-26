import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/hooks/supervisor/useSupervisorTodayFeed', () => ({
  useSupervisorTodayFeed: () => ({
    cortes: [
      {
        id: 'a-old',
        correlativo: 'CORTE-2026-02-25-M-003',
        estado: 'EN_PROGRESO',
        sucursales: { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
        cajero: 'Irvin Abarca',
        created_at: '2026-02-25T20:00:00.000Z',
        updated_at: '2026-02-25T20:01:00.000Z',
        finalizado_at: null,
        venta_esperada: 200,
        datos_conteo: null,
      },
      {
        id: 'f-new',
        correlativo: 'CORTE-2026-02-25-M-010',
        estado: 'FINALIZADO',
        sucursales: { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
        cajero: 'Irvin Abarca',
        created_at: '2026-02-25T20:02:00.000Z',
        updated_at: '2026-02-25T20:10:00.000Z',
        finalizado_at: '2026-02-25T20:12:00.000Z',
        venta_esperada: 200,
        datos_conteo: null,
      },
      {
        id: 'a-new',
        correlativo: 'CORTE-2026-02-25-M-009',
        estado: 'INICIADO',
        sucursales: { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
        cajero: 'Jonathan Melara',
        created_at: '2026-02-25T20:03:00.000Z',
        updated_at: '2026-02-25T20:09:00.000Z',
        finalizado_at: null,
        venta_esperada: 210,
        datos_conteo: null,
      },
      {
        id: 'f-old',
        correlativo: 'CORTE-2026-02-25-H-002',
        estado: 'ABORTADO',
        sucursales: { id: 'suc-001', nombre: 'Los Héroes', codigo: 'H', activa: true },
        cajero: 'Edenilson Lopez',
        created_at: '2026-02-25T19:40:00.000Z',
        updated_at: '2026-02-25T20:00:00.000Z',
        finalizado_at: '2026-02-25T20:04:00.000Z',
        venta_esperada: 190,
        datos_conteo: null,
      },
    ],
    cargando: false,
    actualizando: false,
    error: null,
    ultimaActualizacion: new Date('2026-02-25T20:15:00.000Z'),
    realtimeStatus: 'subscribed',
    refrescar: vi.fn(),
  }),
}));

import { CortesDelDia } from '../CortesDelDia';

describe('CortesDelDia - smart ordering', () => {
  it('muestra resumen en vivo y ordena por actividad más reciente', async () => {
    render(<CortesDelDia />);

    expect(await screen.findByText('Resumen en vivo')).toBeInTheDocument();
    expect(screen.getByText(/Total cortes:\s*4/i)).toBeInTheDocument();

    const activosList = screen.getByRole('list', { name: 'Lista de cortes activos' });
    const activosBotones = within(activosList).getAllByRole('button', { name: /Ver detalle del corte/i });
    expect(activosBotones[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('CORTE-2026-02-25-M-009'),
    );

    const finalizadosList = screen.getByRole('list', { name: 'Lista de cortes finalizados hoy' });
    const finalizadosBotones = within(finalizadosList).getAllByRole('button', { name: /Ver detalle del corte/i });
    expect(finalizadosBotones[0]).toHaveAttribute(
      'aria-label',
      expect.stringContaining('CORTE-2026-02-25-M-010'),
    );
  });
});
