/**
 * 🤖 [IA] - v3.5.2: Tests para DeductedDeliveriesSummary — resumen read-only
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeductedDeliveriesSummary } from '../DeductedDeliveriesSummary';
import type { DeliveryEntry } from '@/types/deliveries';

const makeDelivery = (overrides: Partial<DeliveryEntry> = {}): DeliveryEntry => ({
  id: crypto.randomUUID(),
  customerName: 'Test Client',
  amount: 100,
  courier: 'C807',
  status: 'pending_cod',
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('DeductedDeliveriesSummary', () => {
  beforeEach(() => {
    // Clean up between tests
  });

  it('debe mostrar deliveries deducidos con nombre, monto y courier', () => {
    const deliveries = [
      makeDelivery({ customerName: 'Juan Pérez', amount: 76, courier: 'C807', deductedAt: '2026-02-28T10:00:00Z' }),
      makeDelivery({ customerName: 'Ana López', amount: 50, courier: 'Melos', deductedAt: '2026-02-28T10:00:00Z' }),
    ];

    render(<DeductedDeliveriesSummary deliveries={deliveries} />);

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText(/\$76\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
    expect(screen.getByText(/C807/)).toBeInTheDocument();
    expect(screen.getByText(/Melos/)).toBeInTheDocument();
  });

  it('debe mostrar el total deducido', () => {
    const deliveries = [
      makeDelivery({ amount: 76, deductedAt: '2026-02-28T10:00:00Z' }),
      makeDelivery({ amount: 50, deductedAt: '2026-02-28T10:00:00Z' }),
    ];

    render(<DeductedDeliveriesSummary deliveries={deliveries} />);

    expect(screen.getByText(/\$126\.00/)).toBeInTheDocument();
  });

  it('debe mostrar mensaje cuando no hay deliveries deducidos', () => {
    render(<DeductedDeliveriesSummary deliveries={[]} />);

    expect(screen.getByText(/no hay deliveries/i)).toBeInTheDocument();
  });

  it('NO debe mostrar botones de crear, editar o eliminar', () => {
    const deliveries = [
      makeDelivery({ deductedAt: '2026-02-28T10:00:00Z' }),
    ];

    render(<DeductedDeliveriesSummary deliveries={deliveries} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('solo debe mostrar deliveries que tienen deductedAt', () => {
    const deliveries = [
      makeDelivery({ customerName: 'Deducido', amount: 76, deductedAt: '2026-02-28T10:00:00Z' }),
      makeDelivery({ customerName: 'No Deducido', amount: 50 }), // sin deductedAt
    ];

    render(<DeductedDeliveriesSummary deliveries={deliveries} />);

    expect(screen.getByText('Deducido')).toBeInTheDocument();
    expect(screen.queryByText('No Deducido')).not.toBeInTheDocument();
  });
});
