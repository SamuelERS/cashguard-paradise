/**
 * 🤖 [IA] - v1.4.1: Tests mvSelectors - Lookups datos verificacion (ORDEN #074)
 *
 * @description
 * Tests unitarios para resolveVerificationActors.
 *
 * Ajuste #4 cubierto: Aislable con vi.mock('@/data/paradise').
 */
import { describe, it, expect, vi } from 'vitest';
import { resolveVerificationActors } from '../mvSelectors';

// Ajuste #4: Mock aislado de @/data/paradise
vi.mock('@/data/paradise', () => ({
  getStoreById: (id: string) => {
    if (id === 'store1') return { id: 'store1', name: 'Los Heroes', address: '', phone: '', schedule: '' };
    if (id === 'store2') return { id: 'store2', name: 'Plaza Merliot', address: '', phone: '', schedule: '' };
    return undefined;
  },
  getEmployeeById: (id: string) => {
    if (id === 'emp1') return { id: 'emp1', name: 'Adonay Torres', role: 'cashier', stores: ['store1'] };
    if (id === 'emp2') return { id: 'emp2', name: 'Tito Gomez', role: 'cashier', stores: ['store1'] };
    return undefined;
  },
}));

// ────────────────────────────────────────────────────────────────
// resolveVerificationActors
// ────────────────────────────────────────────────────────────────

describe('mvSelectors - resolveVerificationActors (Ajuste #4)', () => {
  it('resuelve store valido', () => {
    const result = resolveVerificationActors('store1', 'emp1', 'emp2');
    expect(result.store).toBeDefined();
    expect(result.store?.name).toBe('Los Heroes');
  });

  it('resuelve employees validos', () => {
    const result = resolveVerificationActors('store1', 'emp1', 'emp2');
    expect(result.cashierIn?.name).toBe('Adonay Torres');
    expect(result.cashierOut?.name).toBe('Tito Gomez');
  });

  it('retorna undefined para store ID invalido', () => {
    const result = resolveVerificationActors('invalid', 'emp1', 'emp2');
    expect(result.store).toBeUndefined();
  });

  it('retorna undefined para employee IDs invalidos', () => {
    const result = resolveVerificationActors('store1', 'invalid1', 'invalid2');
    expect(result.cashierIn).toBeUndefined();
    expect(result.cashierOut).toBeUndefined();
  });

  it('maneja mix de IDs validos e invalidos', () => {
    const result = resolveVerificationActors('store2', 'emp1', 'invalid');
    expect(result.store?.name).toBe('Plaza Merliot');
    expect(result.cashierIn?.name).toBe('Adonay Torres');
    expect(result.cashierOut).toBeUndefined();
  });
});
