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
});
