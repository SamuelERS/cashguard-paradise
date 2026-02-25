import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CorteListaItem } from '../CorteListaItem';
import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';

function makeCorte(overrides: Partial<CorteConSucursal>): CorteConSucursal {
  return {
    id: 'corte-1',
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
    sucursales: {
      id: 'suc-002',
      nombre: 'Plaza Merliot',
      codigo: 'M',
      activa: true,
    },
    ...overrides,
  };
}

describe('CorteListaItem - correlativo context', () => {
  it('muestra correlativo, codigo numerico y badge de atraso cuando aplica', () => {
    render(
      <CorteListaItem
        corte={makeCorte({ estado: 'EN_PROGRESO', correlativo: 'CORTE-2026-02-25-M-002' })}
        onClick={vi.fn()}
        contextoCorrelativo={{ atraso: 3 }}
      />,
    );

    expect(screen.getByText('CORTE-2026-02-25-M-002')).toBeInTheDocument();
    expect(screen.getByText('Código #002')).toBeInTheDocument();
    expect(screen.getByText('Atraso 3')).toBeInTheDocument();
  });
});
