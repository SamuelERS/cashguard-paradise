import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { OperationSelector } from '../OperationSelector';

describe('OperationSelector motivational panel', () => {
  it('renderiza mensaje institucional fijo sin toggle', () => {
    const onSelectMode = vi.fn();

    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={onSelectMode} />
      </MemoryRouter>,
    );

    const panel = screen.getByRole('note');
    expect(within(panel).getByText(/Compromiso Operativo/i)).toBeInTheDocument();
    expect(
      within(panel).getByText(/Este sistema resguarda tu trabajo diario/i),
    ).toBeInTheDocument();
    expect(within(panel).getByText(/Equipo de Acuarios Paradise/i)).toBeInTheDocument();
    expect(within(panel).getByText(/JesucristoEsDios/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver mensaje del equipo/i })).not.toBeInTheDocument();
  });
});
