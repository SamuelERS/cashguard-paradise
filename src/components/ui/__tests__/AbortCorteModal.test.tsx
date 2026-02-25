import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AbortCorteModal } from '../abort-corte-modal';

describe('AbortCorteModal', () => {
  it('deshabilita confirmar hasta ingresar motivo válido', () => {
    render(
      <AbortCorteModal
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: /confirmar cancelación/i }),
    ).toBeDisabled();
  });

  it('envía motivo trimmed al confirmar', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockResolvedValue(undefined);

    render(
      <AbortCorteModal
        open
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    await user.type(
      screen.getByLabelText(/motivo/i),
      '  corte duplicado en caja  ',
    );
    await user.click(
      screen.getByRole('button', { name: /confirmar cancelación/i }),
    );

    expect(onConfirm).toHaveBeenCalledWith('corte duplicado en caja');
  });
});
