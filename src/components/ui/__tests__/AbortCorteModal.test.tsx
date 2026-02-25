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

  it('si onConfirm falla mantiene modal abierto para reintento', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn().mockRejectedValue(new Error('network down'));
    const onOpenChange = vi.fn();

    render(
      <AbortCorteModal
        open
        onOpenChange={onOpenChange}
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(/motivo/i), 'motivo válido para cancelar');
    await user.click(
      screen.getByRole('button', { name: /confirmar cancelación/i }),
    );

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('button', { name: /confirmar cancelación/i })).toBeInTheDocument();
  });
});
