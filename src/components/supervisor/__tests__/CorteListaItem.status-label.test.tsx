import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { CorteListaItem } from '../CorteListaItem';
import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';

function makeCorte(overrides: Partial<CorteConSucursal>): CorteConSucursal {
  return {
    id: 'corte-1',
    correlativo: 'CORTE-2026-02-24-M-001',
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
    created_at: '2026-02-24T21:43:13.000Z',
    updated_at: '2026-02-24T21:43:13.000Z',
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

describe('CorteListaItem - status labels', () => {
  it('muestra badge EN PROGRESO y etiqueta temporal Creado', () => {
    render(<CorteListaItem corte={makeCorte({ estado: 'EN_PROGRESO' })} onClick={vi.fn()} />);

    expect(screen.getByText('EN PROGRESO')).toBeInTheDocument();
    expect(screen.getByText(/Creado/i)).toBeInTheDocument();
  });

  it('muestra badge FINALIZADO y etiqueta temporal Finalizado', () => {
    render(
      <CorteListaItem
        corte={makeCorte({
          estado: 'FINALIZADO',
          finalizado_at: '2026-02-24T22:10:00.000Z',
        })}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText('FINALIZADO')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.startsWith('Finalizado ')),
    ).toBeInTheDocument();
  });

  it('usa diferencia y total de datos_reporte en cortes finalizados cuando están disponibles', () => {
    render(
      <CorteListaItem
        corte={makeCorte({
          estado: 'FINALIZADO',
          finalizado_at: '2026-02-24T22:10:00.000Z',
          venta_esperada: 900,
          datos_conteo: {
            conteo_parcial: { bill100: 1, bill20: 1 },
            pagos_electronicos: { credomatic: 0, promerica: 0, bankTransfer: 0, paypal: 0 },
          },
          datos_reporte: {
            total_with_expenses: 850.55,
            difference: 75.15,
          },
        })}
        onClick={vi.fn()}
      />,
    );

    expect(screen.getByText('$850.55')).toBeInTheDocument();
    expect(screen.getByText('+$75.15')).toBeInTheDocument();
  });
});
