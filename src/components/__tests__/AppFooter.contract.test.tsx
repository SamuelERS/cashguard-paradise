import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppFooter } from '@/components/AppFooter';

describe('AppFooter contract', () => {
  it('renderiza bloque institucional accesible y sin toggle', () => {
    render(<AppFooter />);

    const footer = screen.getByRole('contentinfo', { name: /compromiso operativo/i });
    expect(within(footer).getByText(/Compromiso Operativo/i)).toBeInTheDocument();
    expect(
      within(footer).getByText(/Este sistema resguarda tu trabajo diario/i),
    ).toBeInTheDocument();
    expect(within(footer).getByText(/Equipo de Acuarios Paradise/i)).toBeInTheDocument();
    expect(within(footer).getByText('🕊️ JesucristoEsDios ♥️')).toBeInTheDocument();
    expect(within(footer).queryByRole('button', { name: /ver mensaje/i })).not.toBeInTheDocument();
  });

  it('organiza el contenido en tres franjas simétricas: arriba, medio y abajo', () => {
    render(<AppFooter />);

    const footer = screen.getByRole('contentinfo', { name: /compromiso operativo/i });
    expect(within(footer).getByTestId('footer-top')).toBeInTheDocument();
    expect(within(footer).getByTestId('footer-middle')).toBeInTheDocument();
    expect(within(footer).getByTestId('footer-bottom')).toBeInTheDocument();
  });

  it('mantiene firma y distribución ordenada en desktop y responsive', () => {
    render(<AppFooter />);

    const footer = screen.getByRole('contentinfo', { name: /compromiso operativo/i });
    const bottom = within(footer).getByTestId('footer-bottom');

    expect(bottom.className).toContain('sm:flex-row');
    expect(bottom.className).toContain('sm:justify-between');
    expect(within(bottom).getByText('🕊️ JesucristoEsDios ♥️')).toBeInTheDocument();
  });
});
