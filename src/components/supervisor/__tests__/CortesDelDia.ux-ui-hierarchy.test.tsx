import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/hooks/supervisor/useSupervisorTodayFeed', () => ({
  useSupervisorTodayFeed: () => ({
    cortes: [
      {
        id: 'a-new',
        correlativo: 'CORTE-2026-02-25-H-002',
        estado: 'EN_PROGRESO',
        sucursales: { id: 'suc-001', nombre: 'Los Héroes', codigo: 'H', activa: true },
        cajero: 'Tito Gomez',
        created_at: '2026-02-25T18:01:00.000Z',
        updated_at: '2026-02-25T22:20:00.000Z',
        finalizado_at: null,
        venta_esperada: 395.27,
        datos_conteo: null,
      },
      {
        id: 'f-1',
        correlativo: 'CORTE-2026-02-25-M-003',
        estado: 'FINALIZADO',
        sucursales: { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
        cajero: 'Irvin Abarca',
        created_at: '2026-02-25T17:58:00.000Z',
        updated_at: '2026-02-25T21:50:00.000Z',
        finalizado_at: '2026-02-25T22:07:00.000Z',
        venta_esperada: 232,
        datos_conteo: null,
      },
    ],
    cargando: false,
    actualizando: false,
    error: null,
    ultimaActualizacion: new Date('2026-02-25T22:26:22.000Z'),
    realtimeStatus: 'subscribed',
    refrescar: vi.fn(),
  }),
}));

import { CortesDelDia } from '../CortesDelDia';

describe('CortesDelDia - UX/UI hierarchy', () => {
  it('ordena resumen y jerarquía visual con métricas legibles', async () => {
    render(<CortesDelDia />);

    const resumen = await screen.findByTestId('cortes-resumen-card');
    expect(resumen.className).not.toContain('sticky');
    const metrics = within(resumen).getByTestId('cortes-resumen-metrics');

    expect(metrics.className).toContain('grid');
    expect(within(metrics).getByTestId('metric-total-cortes')).toHaveTextContent(/Total cortes:/i);
    expect(within(metrics).getByTestId('metric-activos')).toHaveTextContent(/Activos:/i);
    expect(within(metrics).getByTestId('metric-finalizados')).toHaveTextContent(/Finalizados:/i);
    expect(within(metrics).getByTestId('metric-atrasados')).toHaveTextContent(/Activos atrasados:/i);

    const ultimaActividad = within(resumen).getByTestId('cortes-ultima-actividad');
    expect(within(ultimaActividad).getByText(/Última actividad/i)).toBeInTheDocument();
    expect(within(ultimaActividad).getByTestId('cortes-ultima-estado')).toBeInTheDocument();

    expect((await screen.findByTestId('cortes-activos-heading')).className).toContain('text-base');
    expect(screen.getByTestId('cortes-finalizados-heading').className).toContain('text-base');
  });
});
