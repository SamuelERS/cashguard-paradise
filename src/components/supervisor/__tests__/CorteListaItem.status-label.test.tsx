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
  it('usa densidad compacta para evitar tarjetas gigantes', () => {
    render(<CorteListaItem corte={makeCorte({ estado: 'EN_PROGRESO' })} onClick={vi.fn()} />);

    const card = screen.getByRole('button', { name: /Ver detalle del corte/i });
    const metrics = screen.getByTestId('corte-item-metrics');
    const context = screen.getByTestId('corte-item-context');
    const layout = screen.getByTestId('corte-item-layout');

    expect(card.className).toContain('py-2.5');
    expect(metrics.className).toContain('min-w-[110px]');
    expect(context.className).toContain('space-y-1');
    expect((layout as HTMLElement).style.gridTemplateColumns).toBe('56px 1fr auto');
  });

  it('aplica variante ultra-compact para pantallas 2xl sin afectar mobile', () => {
    render(<CorteListaItem corte={makeCorte({ estado: 'EN_PROGRESO' })} onClick={vi.fn()} />);

    const card = screen.getByRole('button', { name: /Ver detalle del corte/i });
    const metrics = screen.getByTestId('corte-item-metrics');
    const layout = screen.getByTestId('corte-item-layout');

    expect(card.className).toContain('2xl:py-2');
    expect(layout.className).toContain('2xl:gap-x-2');
    expect(metrics.className).toContain('2xl:min-w-[96px]');
  });

  it('muestra layout jerárquico legible (tiempo, contexto y métricas)', () => {
    render(<CorteListaItem corte={makeCorte({ estado: 'EN_PROGRESO' })} onClick={vi.fn()} />);

    expect(screen.getByTestId('corte-item-time-rail')).toBeInTheDocument();
    expect(screen.getByTestId('corte-item-context')).toBeInTheDocument();
    expect(screen.getByTestId('corte-item-metrics')).toBeInTheDocument();
  });

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
