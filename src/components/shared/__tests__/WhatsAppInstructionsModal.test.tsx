import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WhatsAppInstructionsModal } from '@/components/shared/WhatsAppInstructionsModal';

describe('WhatsAppInstructionsModal responsive contract', () => {
  it('aplica contenedor con scroll vertical para evitar recorte en móvil', () => {
    render(
      <WhatsAppInstructionsModal
        isOpen={true}
        onOpenChange={vi.fn()}
        onConfirmSent={vi.fn()}
      />
    );

    const content = screen.getByRole('dialog');

    expect(content).toHaveClass('glass-morphism-panel');
    expect(content).toHaveClass('overflow-y-auto');
    expect(content).toHaveClass('overflow-x-hidden');
    expect(content.className).toContain('max-h-');
  });
});
