import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { FiltrosHistorial } from '../FiltrosHistorial';

describe('FiltrosHistorial', () => {
  it('envía estado seleccionado al presionar Buscar', async () => {
    const onBuscar = vi.fn();
    const user = userEvent.setup();

    render(
      <FiltrosHistorial
        filtrosIniciales={{
          fechaDesde: '2026-02-17',
          fechaHasta: '2026-02-24',
          estado: 'TODOS',
          pagina: 1,
        }}
        sucursales={[]}
        cargando={false}
        onBuscar={onBuscar}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Estado'), 'EN_PROGRESO');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onBuscar).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: 'EN_PROGRESO',
      }),
    );
  });

  it('aplica atajo Últimos 7 días y envía el rango esperado', async () => {
    const onBuscar = vi.fn();
    const user = userEvent.setup();

    render(
      <FiltrosHistorial
        filtrosIniciales={{
          fechaDesde: '2026-02-01',
          fechaHasta: '2026-02-10',
          estado: 'TODOS',
          pagina: 1,
        }}
        sucursales={[]}
        cargando={false}
        onBuscar={onBuscar}
      />,
    );

    await user.click(screen.getByRole('button', { name: /últimos 7 días/i }));
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    const payload = onBuscar.mock.calls.at(-1)?.[0];
    expect(payload).toBeDefined();
    expect(payload.fechaDesde).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(payload.fechaHasta).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(payload.fechaDesde).not.toBe('2026-02-01');
    expect(payload.fechaHasta).not.toBe('2026-02-10');
    expect(new Date(payload.fechaDesde).getTime()).toBeLessThanOrEqual(
      new Date(payload.fechaHasta).getTime(),
    );
  });

  it('limpiar restaura filtros iniciales del formulario', async () => {
    const onBuscar = vi.fn();
    const user = userEvent.setup();

    render(
      <FiltrosHistorial
        filtrosIniciales={{
          fechaDesde: '2026-02-17',
          fechaHasta: '2026-02-24',
          estado: 'TODOS',
          pagina: 1,
        }}
        sucursales={[]}
        cargando={false}
        onBuscar={onBuscar}
      />,
    );

    await user.selectOptions(screen.getByLabelText('Estado'), 'ABORTADO');
    await user.type(screen.getByLabelText('Cajero'), 'Irvin Abarca');
    await user.click(screen.getByRole('button', { name: /limpiar/i }));
    await user.click(screen.getByRole('button', { name: 'Buscar' }));

    expect(onBuscar).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: 'TODOS',
        cajero: undefined,
      }),
    );
  });

  it('permite buscar con Enter desde campo de fecha', async () => {
    const onBuscar = vi.fn();
    const user = userEvent.setup();

    render(
      <FiltrosHistorial
        filtrosIniciales={{
          fechaDesde: '2026-02-17',
          fechaHasta: '2026-02-24',
          estado: 'TODOS',
          pagina: 1,
        }}
        sucursales={[]}
        cargando={false}
        onBuscar={onBuscar}
      />,
    );

    const inputDesde = screen.getByLabelText('Desde');
    inputDesde.focus();
    await user.keyboard('{Enter}');

    expect(onBuscar).toHaveBeenCalledTimes(1);
    expect(onBuscar).toHaveBeenCalledWith(
      expect.objectContaining({
        fechaDesde: '2026-02-17',
        fechaHasta: '2026-02-24',
      }),
    );
  });

  it('marca visual y semánticamente el atajo activo (aria-pressed)', async () => {
    const onBuscar = vi.fn();
    const user = userEvent.setup();

    render(
      <FiltrosHistorial
        filtrosIniciales={{
          fechaDesde: '2026-02-10',
          fechaHasta: '2026-02-24',
          estado: 'TODOS',
          pagina: 1,
        }}
        sucursales={[]}
        cargando={false}
        onBuscar={onBuscar}
      />,
    );

    const hoy = screen.getByRole('button', { name: /^hoy$/i });
    const ultimos7 = screen.getByRole('button', { name: /últimos 7 días/i });
    const dias30 = screen.getByRole('button', { name: /30 días/i });

    expect(hoy).toHaveAttribute('aria-pressed', 'false');
    expect(ultimos7).toHaveAttribute('aria-pressed', 'false');
    expect(dias30).toHaveAttribute('aria-pressed', 'false');

    await user.click(ultimos7);
    expect(ultimos7).toHaveAttribute('aria-pressed', 'true');
    expect(hoy).toHaveAttribute('aria-pressed', 'false');
    expect(dias30).toHaveAttribute('aria-pressed', 'false');

    await user.click(dias30);
    expect(dias30).toHaveAttribute('aria-pressed', 'true');
    expect(hoy).toHaveAttribute('aria-pressed', 'false');
    expect(ultimos7).toHaveAttribute('aria-pressed', 'false');
  });
});
