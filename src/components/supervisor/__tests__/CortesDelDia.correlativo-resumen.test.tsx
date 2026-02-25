import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('@/hooks/supervisor/useSupervisorTodayFeed', () => ({
  useSupervisorTodayFeed: () => ({
    cortes: [
      {
        id: '1',
        correlativo: 'CORTE-2026-02-25-M-002',
        sucursal_id: 'suc-002',
        cajero: 'Irvin Abarca',
        testigo: 'Edenilson Lopez',
        estado: 'EN_PROGRESO',
        fase_actual: 1,
        intento_actual: 1,
        venta_esperada: 232,
        datos_conteo: null,
        datos_entrega: null,
        datos_verificacion: null,
        datos_reporte: null,
        reporte_hash: null,
        created_at: '2026-02-25T20:00:00.000Z',
        updated_at: '2026-02-25T20:00:00.000Z',
        finalizado_at: null,
        motivo_aborto: null,
        sucursales: { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
      },
      {
        id: '2',
        correlativo: 'CORTE-2026-02-25-M-005',
        sucursal_id: 'suc-002',
        cajero: 'Irvin Abarca',
        testigo: 'Edenilson Lopez',
        estado: 'FINALIZADO',
        fase_actual: 3,
        intento_actual: 1,
        venta_esperada: 300,
        datos_conteo: null,
        datos_entrega: null,
        datos_verificacion: null,
        datos_reporte: null,
        reporte_hash: null,
        created_at: '2026-02-25T20:00:00.000Z',
        updated_at: '2026-02-25T20:00:00.000Z',
        finalizado_at: '2026-02-25T20:30:00.000Z',
        motivo_aborto: null,
        sucursales: { id: 'suc-002', nombre: 'Plaza Merliot', codigo: 'M', activa: true },
      },
      {
        id: '3',
        correlativo: 'CORTE-2026-02-25-H-003',
        sucursal_id: 'suc-001',
        cajero: 'Jonathan Melara',
        testigo: 'Edenilson Lopez',
        estado: 'INICIADO',
        fase_actual: 0,
        intento_actual: 1,
        venta_esperada: 200,
        datos_conteo: null,
        datos_entrega: null,
        datos_verificacion: null,
        datos_reporte: null,
        reporte_hash: null,
        created_at: '2026-02-25T20:10:00.000Z',
        updated_at: '2026-02-25T20:10:00.000Z',
        finalizado_at: null,
        motivo_aborto: null,
        sucursales: { id: 'suc-001', nombre: 'Los Héroes', codigo: 'H', activa: true },
      },
    ],
    cargando: false,
    actualizando: false,
    error: null,
    ultimaActualizacion: new Date('2026-02-25T20:40:00.000Z'),
    realtimeStatus: 'subscribed',
    refrescar: vi.fn(),
  }),
}));

import { CortesDelDia } from '../CortesDelDia';

describe('CortesDelDia - correlativo resumen', () => {
  it('muestra resumen de correlativo por sucursal y activos atrasados', () => {
    render(<CortesDelDia />);

    expect(screen.getByText('Sucursales activas: 2')).toBeInTheDocument();
    expect(screen.getByText('Activos atrasados: 1')).toBeInTheDocument();
    expect(screen.getByText('M: #005')).toBeInTheDocument();
    expect(screen.getByText('H: #003')).toBeInTheDocument();
  });
});
