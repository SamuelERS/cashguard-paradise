import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

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
      {
        id: 'f1',
        correlativo: 'CORTE-2026-02-24-H-001',
        estado: 'FINALIZADO',
        sucursales: { id: 'suc-001', nombre: 'Los Héroes', codigo: 'H', activa: true },
        cajero: 'Jonathan Melara',
        created_at: '2026-02-24T17:00:00.000Z',
        finalizado_at: '2026-02-24T19:20:00.000Z',
        venta_esperada: 200,
        datos_conteo: null,
      },
    ],
  }),
}));

import { CortesDelDia } from '../CortesDelDia';

describe('CortesDelDia - activity layout', () => {
  it('muestra secciones Activos ahora y Finalizados hoy con sus filas', async () => {
    render(<CortesDelDia />);

    expect(await screen.findByText('Activos ahora')).toBeInTheDocument();
    expect(screen.getByText('Finalizados hoy')).toBeInTheDocument();

    expect(screen.getByText('Plaza Merliot')).toBeInTheDocument();
    expect(screen.getByText('Los Héroes')).toBeInTheDocument();
  });
});
