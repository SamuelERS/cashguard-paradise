import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { OperationSelector } from '../OperationSelector';

describe('OperationSelector motivational panel', () => {
  it('inicia colapsado y permite expandir el mensaje del equipo', async () => {
    const onSelectMode = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={onSelectMode} />
      </MemoryRouter>,
    );

    const toggle = screen.getByRole('button', { name: /ver mensaje del equipo/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText(/Este sistema protege tu trabajo diario/i)).not.toBeInTheDocument();

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Este sistema protege tu trabajo diario/i)).toBeInTheDocument();
    expect(screen.getByText(/Equipo de Acuarios Paradise/i)).toBeInTheDocument();
  });
});
