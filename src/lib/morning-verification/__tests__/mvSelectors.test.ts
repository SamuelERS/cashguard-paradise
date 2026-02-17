import { describe, expect, it } from 'vitest';
import { resolveVerificationActors } from '../mvSelectors';

describe('resolveVerificationActors', () => {
  it('creates actors using ids when names are not provided', () => {
    const result = resolveVerificationActors('suc-001', 'emp-1', 'emp-2');

    expect(result.store).toEqual({
      id: 'suc-001',
      name: 'suc-001',
      address: '',
      phone: '',
      schedule: '',
    });
    expect(result.cashierIn?.name).toBe('emp-1');
    expect(result.cashierOut?.name).toBe('emp-2');
  });

  it('uses provided names for report-friendly output', () => {
    const result = resolveVerificationActors('suc-001', 'emp-1', 'emp-2', {
      storeName: 'Los Heroes',
      cashierName: 'Jonathan Melara',
      witnessName: 'Adonay Torres',
    });

    expect(result.store?.name).toBe('Los Heroes');
    expect(result.cashierIn?.name).toBe('Jonathan Melara');
    expect(result.cashierOut?.name).toBe('Adonay Torres');
  });

  it('returns undefined actors when ids are empty', () => {
    const result = resolveVerificationActors('', '', '');

    expect(result.store).toBeUndefined();
    expect(result.cashierIn).toBeUndefined();
    expect(result.cashierOut).toBeUndefined();
  });
});
