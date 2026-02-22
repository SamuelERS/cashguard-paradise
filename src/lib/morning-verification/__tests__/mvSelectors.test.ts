import { describe, it, expect } from 'vitest';
import { resolveVerificationActors } from '../mvSelectors';

describe('mvSelectors - resolveVerificationActors', () => {
  it('resuelve actores con nombres explícitos cuando se proporcionan', () => {
    const result = resolveVerificationActors('suc-1', 'emp-1', 'emp-2', {
      storeName: 'Los Héroes',
      cashierName: 'Adonay Torres',
      witnessName: 'Tito Gomez',
    });

    expect(result.store?.name).toBe('Los Héroes');
    expect(result.cashierIn?.name).toBe('Adonay Torres');
    expect(result.cashierOut?.name).toBe('Tito Gomez');
  });

  it('usa IDs como fallback cuando no hay nombres', () => {
    const result = resolveVerificationActors('suc-raw', 'cash-raw', 'wit-raw');

    expect(result.store?.name).toBe('suc-raw');
    expect(result.cashierIn?.name).toBe('cash-raw');
    expect(result.cashierOut?.name).toBe('wit-raw');
  });
});

