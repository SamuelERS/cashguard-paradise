import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

describe('Dialog a11y i18n', () => {
  it('usa etiqueta accesible en español para el botón de cierre por defecto', () => {
    render(
      <Dialog open onOpenChange={() => {}}>
        <DialogContent>
          <DialogTitle>Título</DialogTitle>
          <DialogDescription>Descripción</DialogDescription>
          <div>Contenido</div>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Cerrar')).toBeInTheDocument();
    expect(screen.queryByText('Close')).not.toBeInTheDocument();
  });
});

