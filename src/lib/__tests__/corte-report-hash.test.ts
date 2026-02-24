import { describe, expect, it } from 'vitest';

import { generarReporteHash } from '@/lib/corte-report-hash';

describe('generarReporteHash', () => {
  it('genera hash SHA-256 hex determinista (64 chars)', async () => {
    const payload = {
      correlativo: 'CORTE-2026-02-24-M-001',
      total_general: 1052.53,
      timestamp: '2026-02-24T22:00:00.000Z',
      cajero: 'Irvin Abarca',
      testigo: 'Edenilson Lopez',
    };

    const h1 = await generarReporteHash(payload);
    const h2 = await generarReporteHash(payload);

    expect(h1).toMatch(/^[a-f0-9]{64}$/);
    expect(h1).toHaveLength(64);
    expect(h1).toBe(h2);
  });

  it('cambia hash cuando cambia el contenido del payload', async () => {
    const base = {
      correlativo: 'CORTE-2026-02-24-M-001',
      total_general: 1052.53,
      timestamp: '2026-02-24T22:00:00.000Z',
    };

    const h1 = await generarReporteHash(base);
    const h2 = await generarReporteHash({ ...base, total_general: 1052.54 });

    expect(h1).not.toBe(h2);
  });
});
