import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { OperationSelector } from '../OperationSelector';

describe('OperationSelector motivational panel', () => {
  it('no duplica el mensaje institucional dentro del selector', () => {
    const onSelectMode = vi.fn();

    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={onSelectMode} />
      </MemoryRouter>,
    );

    expect(screen.queryByRole('note')).not.toBeInTheDocument();
    expect(screen.queryByText(/Compromiso Operativo/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver mensaje del equipo/i })).not.toBeInTheDocument();
  });
});
