import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SupervisorLiveBadge } from '../SupervisorLiveBadge';

describe('SupervisorLiveBadge', () => {
  it('renderiza En vivo cuando status=subscribed', () => {
    render(<SupervisorLiveBadge status="subscribed" />);
    expect(screen.getByText('En vivo')).toBeInTheDocument();
  });

  it('renderiza Reconectando cuando status=error', () => {
    render(<SupervisorLiveBadge status="error" />);
    expect(screen.getByText('Reconectando')).toBeInTheDocument();
  });

  it('renderiza Conectando cuando status=connecting', () => {
    render(<SupervisorLiveBadge status="connecting" />);
    expect(screen.getByText('Conectando')).toBeInTheDocument();
  });

  it('renderiza Sin realtime cuando status=disabled', () => {
    render(<SupervisorLiveBadge status="disabled" />);
    expect(screen.getByText('Sin realtime')).toBeInTheDocument();
  });
});
