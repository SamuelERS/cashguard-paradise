import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FloatingOrbs } from '@/components/FloatingOrbs';

describe('FloatingOrbs visual contract', () => {
  it('ancla cada orb decorativo con posición base explícita para evitar colapso en esquina', () => {
    const { container } = render(<FloatingOrbs />);

    const orbs = container.querySelectorAll('div.absolute.rounded-full');
    expect(orbs).toHaveLength(3);

    orbs.forEach((orb) => {
      const hasVerticalAnchor = orb.style.top !== '' || orb.style.bottom !== '';
      const hasHorizontalAnchor = orb.style.left !== '' || orb.style.right !== '';

      expect(hasVerticalAnchor).toBe(true);
      expect(hasHorizontalAnchor).toBe(true);
    });
  });
});
