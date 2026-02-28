/**
 * 🤖 [IA] - v3.5.2: Tests para markAsDeducted — prevención doble deducción
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeliveries } from '../useDeliveries';

describe('useDeliveries - markAsDeducted', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe establecer deductedAt en el delivery sin cambiar su status', () => {
    const { result } = renderHook(() => useDeliveries());

    // Crear un delivery pending
    let deliveryId: string;
    act(() => {
      const delivery = result.current.createDelivery({
        customerName: 'Test Client',
        amount: 76.00,
        courier: 'C807',
      });
      deliveryId = delivery.id;
    });

    expect(result.current.pending).toHaveLength(1);
    expect(result.current.pending[0].deductedAt).toBeUndefined();

    // Marcar como deducido
    act(() => {
      result.current.markAsDeducted(deliveryId);
    });

    // Debe seguir en pending (status no cambia)
    expect(result.current.pending).toHaveLength(1);
    expect(result.current.pending[0].status).toBe('pending_cod');
    // Pero con deductedAt establecido
    expect(result.current.pending[0].deductedAt).toBeDefined();
    expect(typeof result.current.pending[0].deductedAt).toBe('string');
  });

  it('debe marcar múltiples deliveries como deducidos', () => {
    const { result } = renderHook(() => useDeliveries());

    let id1: string;
    let id2: string;
    act(() => {
      const d1 = result.current.createDelivery({
        customerName: 'Client A',
        amount: 50.00,
        courier: 'C807',
      });
      const d2 = result.current.createDelivery({
        customerName: 'Client B',
        amount: 76.00,
        courier: 'Melos',
      });
      id1 = d1.id;
      id2 = d2.id;
    });

    act(() => {
      result.current.markAsDeducted(id1);
      result.current.markAsDeducted(id2);
    });

    expect(result.current.pending[0].deductedAt).toBeDefined();
    expect(result.current.pending[1].deductedAt).toBeDefined();
    // Both still pending
    expect(result.current.pending.every(d => d.status === 'pending_cod')).toBe(true);
  });

  it('debe lanzar error si delivery no existe', () => {
    const { result } = renderHook(() => useDeliveries());

    expect(() => {
      act(() => {
        result.current.markAsDeducted('non-existent-id');
      });
    }).toThrow('not found in pending');
  });
});
