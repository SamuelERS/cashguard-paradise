// 🤖 [IA] - OT-17: Tests para servicio append-only de snapshots
// Cubre: _toDbRow, _fromDbRow, insertSnapshot, getLatestSnapshot

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Hoisted mocks — runs before imports
// ---------------------------------------------------------------------------

const { mockInsert, mockSelect, mockEq, mockOrder, mockLimit, mockSingle, mockCorteConteoSnapshots } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockLimit = vi.fn(() => ({ single: mockSingle }));
  const mockOrder = vi.fn(() => ({ limit: mockLimit }));
  const mockEq2 = vi.fn(() => ({ order: mockOrder }));
  const mockEq = vi.fn(() => ({ eq: mockEq2 }));
  const mockSelectChain = vi.fn(() => ({ eq: mockEq }));
  const mockInsertSingle = vi.fn();
  const mockInsertSelect = vi.fn(() => ({ single: mockInsertSingle }));
  const mockInsert = vi.fn(() => ({ select: mockInsertSelect }));

  const mockCorteConteoSnapshots = vi.fn();

  return {
    mockInsert,
    mockInsertSelect,
    mockInsertSingle,
    mockSelect: mockSelectChain,
    mockEq,
    mockEq2,
    mockOrder,
    mockLimit,
    mockSingle,
    mockCorteConteoSnapshots,
  };
});

vi.mock('../supabase', () => ({
  tables: {
    corteConteoSnapshots: mockCorteConteoSnapshots,
  },
  isSupabaseConfigured: true,
}));

// Import AFTER mocks
import { insertSnapshot, getLatestSnapshot, _toDbRow, _fromDbRow } from '../snapshots';
import type { SnapshotPayload } from '../snapshots';
import type { CashCount } from '../../types/cash';
import type { CorteConteoSnapshot } from '../../types/auditoria';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sampleCashCount: CashCount = {
  penny: 43,
  nickel: 20,
  dime: 33,
  quarter: 8,
  dollarCoin: 1,
  bill1: 5,
  bill5: 3,
  bill10: 2,
  bill20: 1,
  bill50: 0,
  bill100: 0,
};

const samplePayload: SnapshotPayload = {
  corte_id: 'corte-001',
  attempt_number: 1,
  fase_actual: 1,
  cashCount: sampleCashCount,
  electronicPayments: {
    credomatic: 5.32,
    promerica: 56.12,
    bankTransfer: 43.56,
    paypal: 0,
  },
  gastos_dia: null,
  source: 'manual',
};

const sampleDbRow: CorteConteoSnapshot = {
  id: 1,
  corte_id: 'corte-001',
  attempt_number: 1,
  fase_actual: 1,
  penny: 43,
  nickel: 20,
  dime: 33,
  quarter: 8,
  dollar_coin: 1,
  bill1: 5,
  bill5: 3,
  bill10: 2,
  bill20: 1,
  bill50: 0,
  bill100: 0,
  credomatic: 5.32,
  promerica: 56.12,
  bank_transfer: 43.56,
  paypal: 0,
  gastos_dia: [],
  source: 'manual',
  captured_at: '2026-02-17T10:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Suite 1: _toDbRow — CamelCase UI → contrato DB actual
// ---------------------------------------------------------------------------

describe('Suite 1: _toDbRow', () => {
  it('1.1 — Mapea CashCount camelCase al contrato real de BD (snake/legacy mix)', () => {
    const row = _toDbRow(samplePayload);

    expect(row.penny).toBe(43);
    expect(row.nickel).toBe(20);
    expect(row.dime).toBe(33);
    expect(row.quarter).toBe(8);
    expect(row.dollar_coin).toBe(1);
    expect(row.bill1).toBe(5);
    expect(row.bill5).toBe(3);
    expect(row.bill10).toBe(2);
    expect(row.bill20).toBe(1);
    expect(row.bill50).toBe(0);
    expect(row.bill100).toBe(0);
  });

  it('1.2 — Mapea ElectronicPayments al contrato real de BD', () => {
    const row = _toDbRow(samplePayload);

    expect(row.credomatic).toBe(5.32);
    expect(row.promerica).toBe(56.12);
    expect(row.bank_transfer).toBe(43.56);
    expect(row.paypal).toBe(0);
  });

  it('1.3 — Preserva campos directos sin transformación', () => {
    const row = _toDbRow(samplePayload);

    expect(row.corte_id).toBe('corte-001');
    expect(row.attempt_number).toBe(1);
    expect(row.fase_actual).toBe(1);
    expect(row.source).toBe('manual');
    expect(row.gastos_dia).toEqual([]);
  });

  it('1.4 — Maneja gastos_dia con datos', () => {
    const payload: SnapshotPayload = {
      ...samplePayload,
      gastos_dia: { items: [{ id: 'g1', amount: 25 }] },
    };
    const row = _toDbRow(payload);
    expect(row.gastos_dia).toEqual({ items: [{ id: 'g1', amount: 25 }] });
  });

  it('1.5 — Maneja todos los valores en cero', () => {
    const zeroCashCount: CashCount = {
      penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
      bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0,
    };
    const row = _toDbRow({
      ...samplePayload,
      cashCount: zeroCashCount,
      electronicPayments: { credomatic: 0, promerica: 0, bankTransfer: 0, paypal: 0 },
    });

    expect(row.penny).toBe(0);
    expect(row.bill100).toBe(0);
    expect(row.credomatic).toBe(0);
    expect(row.bank_transfer).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Suite 2: _fromDbRow — DB contract → UI camelCase
// ---------------------------------------------------------------------------

describe('Suite 2: _fromDbRow', () => {
  it('2.1 — Mapea columnas de BD a CashCount camelCase', () => {
    const result = _fromDbRow(sampleDbRow);

    expect(result.cashCount.penny).toBe(43);
    expect(result.cashCount.nickel).toBe(20);
    expect(result.cashCount.dime).toBe(33);
    expect(result.cashCount.quarter).toBe(8);
    expect(result.cashCount.dollarCoin).toBe(1);
    expect(result.cashCount.bill1).toBe(5);
    expect(result.cashCount.bill5).toBe(3);
    expect(result.cashCount.bill10).toBe(2);
    expect(result.cashCount.bill20).toBe(1);
    expect(result.cashCount.bill50).toBe(0);
    expect(result.cashCount.bill100).toBe(0);
  });

  it('2.2 — Mapea columnas de BD a ElectronicPayments camelCase', () => {
    const result = _fromDbRow(sampleDbRow);

    expect(result.electronicPayments.credomatic).toBe(5.32);
    expect(result.electronicPayments.promerica).toBe(56.12);
    expect(result.electronicPayments.bankTransfer).toBe(43.56);
    expect(result.electronicPayments.paypal).toBe(0);
  });

  it('2.3 — Preserva gastos_dia y fase_actual', () => {
    const result = _fromDbRow(sampleDbRow);

    expect(result.gastos_dia).toEqual([]);
    expect(result.fase_actual).toBe(1);
  });

  it('2.4 — Roundtrip: toDbRow → fromDbRow preserva datos', () => {
    const dbRow = _toDbRow(samplePayload);
    // Simulate DB adding auto-generated fields
    const fullRow: CorteConteoSnapshot = {
      ...dbRow,
      id: 'snap-roundtrip',
      captured_at: '2026-02-17T10:00:00.000Z',
    };
    const result = _fromDbRow(fullRow);

    expect(result.cashCount).toEqual(samplePayload.cashCount);
    expect(result.electronicPayments).toEqual(samplePayload.electronicPayments);
    expect(result.gastos_dia).toEqual([]);
    expect(result.fase_actual).toEqual(samplePayload.fase_actual);
  });
});

// ---------------------------------------------------------------------------
// Suite 3: insertSnapshot
// ---------------------------------------------------------------------------

describe('Suite 3: insertSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock chain for insert path
    const mockInsertSingleLocal = vi.fn();
    const mockInsertSelectLocal = vi.fn(() => ({ single: mockInsertSingleLocal }));
    const mockInsertLocal = vi.fn(() => ({ select: mockInsertSelectLocal }));
    mockCorteConteoSnapshots.mockReturnValue({ insert: mockInsertLocal });
    // Expose for assertions
    mockInsert.mockImplementation(mockInsertLocal);
    // Store references
    (globalThis as Record<string, unknown>).__mockInsertSingle = mockInsertSingleLocal;
    (globalThis as Record<string, unknown>).__mockInsert = mockInsertLocal;
  });

  it('3.1 — Retorna snapshot insertado en caso exitoso', async () => {
    const insertSingle = vi.fn().mockResolvedValue({ data: sampleDbRow, error: null });
    const insertSelect = vi.fn(() => ({ single: insertSingle }));
    const insert = vi.fn(() => ({ select: insertSelect }));
    mockCorteConteoSnapshots.mockReturnValue({ insert });

    const result = await insertSnapshot(samplePayload);

    expect(result).toEqual(sampleDbRow);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        corte_id: 'corte-001',
        penny: 43,
        dollar_coin: 1,
        bank_transfer: 43.56,
        source: 'manual',
      }),
    );
  });

  it('3.2 — Retorna null si Supabase retorna error', async () => {
    const insertSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'duplicate key' },
    });
    const insertSelect = vi.fn(() => ({ single: insertSingle }));
    const insert = vi.fn(() => ({ select: insertSelect }));
    mockCorteConteoSnapshots.mockReturnValue({ insert });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await insertSnapshot(samplePayload);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[snapshots]'),
      expect.stringContaining('duplicate key'),
    );
    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Suite 4: insertSnapshot — Supabase no configurado
// ---------------------------------------------------------------------------

describe('Suite 4: insertSnapshot sin Supabase', () => {
  it('4.1 — Retorna null y logea warning', async () => {
    // Invalidar cache de módulos para que doMock surta efecto
    vi.resetModules();

    // Re-mock with isSupabaseConfigured = false
    vi.doMock('../supabase', () => ({
      tables: { corteConteoSnapshots: vi.fn() },
      isSupabaseConfigured: false,
    }));

    // Re-import to pick up new mock
    const { insertSnapshot: insertNoConfig } = await import('../snapshots');

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await insertNoConfig(samplePayload);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('Supabase no configurado'),
    );
    consoleSpy.mockRestore();

    // Restore original mock
    vi.doMock('../supabase', () => ({
      tables: { corteConteoSnapshots: mockCorteConteoSnapshots },
      isSupabaseConfigured: true,
    }));
  });
});

// ---------------------------------------------------------------------------
// Suite 5: getLatestSnapshot
// ---------------------------------------------------------------------------

describe('Suite 5: getLatestSnapshot', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('5.1 — Retorna datos mapeados del snapshot más reciente', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleDbRow, error: null });
    const limit = vi.fn(() => ({ single }));
    const order = vi.fn(() => ({ limit }));
    const eq2 = vi.fn(() => ({ order }));
    const eq1 = vi.fn(() => ({ eq: eq2 }));
    const select = vi.fn(() => ({ eq: eq1 }));
    mockCorteConteoSnapshots.mockReturnValue({ select });

    const result = await getLatestSnapshot('corte-001', 1);

    expect(result).not.toBeNull();
    expect(result!.cashCount.penny).toBe(43);
    expect(result!.electronicPayments.bankTransfer).toBe(43.56);
    expect(result!.fase_actual).toBe(1);

    expect(select).toHaveBeenCalledWith('*');
    expect(eq1).toHaveBeenCalledWith('corte_id', 'corte-001');
    expect(eq2).toHaveBeenCalledWith('attempt_number', 1);
    expect(order).toHaveBeenCalledWith('captured_at', { ascending: false });
    expect(limit).toHaveBeenCalledWith(1);
  });

  it('5.2 — Retorna null si no hay snapshot', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } });
    const limit = vi.fn(() => ({ single }));
    const order = vi.fn(() => ({ limit }));
    const eq2 = vi.fn(() => ({ order }));
    const eq1 = vi.fn(() => ({ eq: eq2 }));
    const select = vi.fn(() => ({ eq: eq1 }));
    mockCorteConteoSnapshots.mockReturnValue({ select });

    const result = await getLatestSnapshot('corte-999', 1);
    expect(result).toBeNull();
  });

  it('5.3 — Pasa attempt_number correcto al query', async () => {
    const single = vi.fn().mockResolvedValue({ data: sampleDbRow, error: null });
    const limit = vi.fn(() => ({ single }));
    const order = vi.fn(() => ({ limit }));
    const eq2 = vi.fn(() => ({ order }));
    const eq1 = vi.fn(() => ({ eq: eq2 }));
    const select = vi.fn(() => ({ eq: eq1 }));
    mockCorteConteoSnapshots.mockReturnValue({ select });

    await getLatestSnapshot('corte-001', 3);

    expect(eq2).toHaveBeenCalledWith('attempt_number', 3);
  });
});
