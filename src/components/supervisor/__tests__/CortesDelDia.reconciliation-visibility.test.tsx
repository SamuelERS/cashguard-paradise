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
        id: 'x1',
        correlativo: 'CORTE-2026-02-24-H-009',
        estado: 'ABORTADO',
        sucursales: { id: 'suc-001', nombre: 'Los Héroes', codigo: 'H', activa: true },
        cajero: 'Jonathan Melara',
        created_at: '2026-02-24T20:00:00.000Z',
        finalizado_at: '2026-02-24T20:30:00.000Z',
        venta_esperada: 200,
        datos_conteo: null,
      },
    ],
  }),
}));

import { CortesDelDia } from '../CortesDelDia';

describe('CortesDelDia - reconciliación de cortes vencidos', () => {
  it('ubica ABORTADO en bloque terminal y no lo cuenta como activo', async () => {
    render(<CortesDelDia />);

    expect(await screen.findByText('Activos ahora')).toBeInTheDocument();
    expect(screen.getByText('Finalizados hoy')).toBeInTheDocument();
    expect(screen.getByText('ABORTADO')).toBeInTheDocument();
    expect(screen.getByText('1 activos · 1 finalizados hoy')).toBeInTheDocument();
  });
});
