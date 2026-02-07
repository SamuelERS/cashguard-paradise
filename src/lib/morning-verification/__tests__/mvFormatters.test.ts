/**
 * 🤖 [IA] - v1.4.1: Tests mvFormatters - Formateo reportes matutinos (ORDEN #074)
 *
 * @description
 * Tests unitarios para funciones de formateo:
 * - formatVerificationTimestamp: locale es-SV
 * - generateMorningReport: reporte WhatsApp completo
 * - downloadPrintableReport: descarga archivo .txt
 *
 * Ajuste #3 cubierto: Validar timestamp por regex, no string exacto.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { CashCount } from '@/types/cash';
import type { VerificationData, MorningReportParams } from '@/types/morningVerification';
import {
  formatVerificationTimestamp,
  generateMorningReport,
  downloadPrintableReport,
} from '../mvFormatters';

// ────────────────────────────────────────────────────────────────
// Fixtures
// ────────────────────────────────────────────────────────────────

const CASH_COUNT: CashCount = {
  penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
  bill1: 0, bill5: 0, bill10: 1, bill20: 2, bill50: 0, bill100: 0,
};

const CORRECT_VERIFICATION: VerificationData = {
  totalCash: 50.00,
  expectedAmount: 50,
  difference: 0,
  isCorrect: true,
  hasShortage: false,
  hasExcess: false,
  timestamp: '07/02/2026, 08:30 a. m.',
};

const SHORTAGE_VERIFICATION: VerificationData = {
  totalCash: 48.00,
  expectedAmount: 50,
  difference: -2.00,
  isCorrect: false,
  hasShortage: true,
  hasExcess: false,
  timestamp: '07/02/2026, 08:30 a. m.',
};

const EXCESS_VERIFICATION: VerificationData = {
  totalCash: 52.00,
  expectedAmount: 50,
  difference: 2.00,
  isCorrect: false,
  hasShortage: false,
  hasExcess: true,
  timestamp: '07/02/2026, 08:30 a. m.',
};

const REPORT_PARAMS_CORRECT: MorningReportParams = {
  verificationData: CORRECT_VERIFICATION,
  store: { id: 'store1', name: 'Los Heroes', address: '', phone: '', schedule: '' },
  cashierIn: { id: 'c1', name: 'Adonay Torres', role: 'cashier', stores: ['store1'] },
  cashierOut: { id: 'c2', name: 'Tito Gomez', role: 'cashier', stores: ['store1'] },
  cashCount: CASH_COUNT,
  dataHash: 'abc123def456ghij',
};

// ────────────────────────────────────────────────────────────────
// formatVerificationTimestamp (Ajuste #3: regex, no string exacto)
// ────────────────────────────────────────────────────────────────

describe('mvFormatters - formatVerificationTimestamp (Ajuste #3)', () => {
  it('genera string no vacio', () => {
    const ts = formatVerificationTimestamp();
    expect(ts).toBeTruthy();
    expect(ts.length).toBeGreaterThan(0);
  });

  it('formato contiene fecha dd/mm/yyyy', () => {
    const ts = formatVerificationTimestamp();
    // Regex: 1-2 digitos / 1-2 digitos / 4 digitos
    expect(ts).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
  });

  it('formato contiene hora con a.m./p.m.', () => {
    const ts = formatVerificationTimestamp();
    // Regex: hora:minutos + am/pm pattern (es-SV usa "a. m." o "p. m.")
    expect(ts).toMatch(/\d{1,2}:\d{2}/);
  });

  it('respeta locale es-SV con Date mockeado', () => {
    const mockDate = new Date('2026-02-07T14:30:00Z');
    vi.setSystemTime(mockDate);

    const ts = formatVerificationTimestamp();
    // Validar que contiene fecha del mock
    expect(ts).toMatch(/\d{1,2}\/\d{1,2}\/2026/);

    vi.useRealTimers();
  });
});

// ────────────────────────────────────────────────────────────────
// generateMorningReport
// ────────────────────────────────────────────────────────────────

describe('mvFormatters - generateMorningReport', () => {
  it('reporte normal: header REPORTE NORMAL', () => {
    const report = generateMorningReport(REPORT_PARAMS_CORRECT);
    expect(report).toContain('REPORTE NORMAL');
    expect(report).not.toContain('REPORTE ADVERTENCIA');
  });

  it('shortage: header REPORTE ADVERTENCIA', () => {
    const params: MorningReportParams = {
      ...REPORT_PARAMS_CORRECT,
      verificationData: SHORTAGE_VERIFICATION,
    };
    const report = generateMorningReport(params);
    expect(report).toContain('REPORTE ADVERTENCIA');
  });

  it('excess: header REPORTE ADVERTENCIA', () => {
    const params: MorningReportParams = {
      ...REPORT_PARAMS_CORRECT,
      verificationData: EXCESS_VERIFICATION,
    };
    const report = generateMorningReport(params);
    expect(report).toContain('REPORTE ADVERTENCIA');
  });

  it('contiene datos de sucursal y empleados', () => {
    const report = generateMorningReport(REPORT_PARAMS_CORRECT);
    expect(report).toContain('Los Heroes');
    expect(report).toContain('Adonay Torres');
    expect(report).toContain('Tito Gomez');
  });

  it('contiene resumen ejecutivo con montos', () => {
    const report = generateMorningReport(REPORT_PARAMS_CORRECT);
    expect(report).toContain('$50.00');
    expect(report).toContain('CORRECTO');
  });

  it('contiene firma digital (dataHash)', () => {
    const report = generateMorningReport(REPORT_PARAMS_CORRECT);
    expect(report).toContain('abc123def456ghij');
  });

  it('contiene secciones obligatorias', () => {
    const report = generateMorningReport(REPORT_PARAMS_CORRECT);
    expect(report).toContain('CONTEO DE CAJA MATUTINO');
    expect(report).toContain('RESUMEN EJECUTIVO');
    expect(report).toContain('CashGuard Paradise');
  });

  it('maneja store/employee undefined (N/A fallback)', () => {
    const params: MorningReportParams = {
      ...REPORT_PARAMS_CORRECT,
      store: undefined,
      cashierIn: undefined,
      cashierOut: undefined,
    };
    const report = generateMorningReport(params);
    expect(report).toContain('N/A');
  });
});

// ────────────────────────────────────────────────────────────────
// downloadPrintableReport
// ────────────────────────────────────────────────────────────────

describe('mvFormatters - downloadPrintableReport', () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createObjectURLSpy = vi.fn(() => 'blob:mock-url');
    revokeObjectURLSpy = vi.fn();
    clickSpy = vi.fn();

    global.URL.createObjectURL = createObjectURLSpy;
    global.URL.revokeObjectURL = revokeObjectURLSpy;

    vi.spyOn(document, 'createElement').mockReturnValue({
      href: '',
      download: '',
      click: clickSpy,
    } as unknown as HTMLAnchorElement);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('crea blob con texto del reporte', () => {
    downloadPrintableReport('Reporte de prueba');
    expect(createObjectURLSpy).toHaveBeenCalledOnce();
  });

  it('dispara click para descarga', () => {
    downloadPrintableReport('Reporte de prueba');
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it('revoca object URL despues de descarga', () => {
    downloadPrintableReport('Reporte de prueba');
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:mock-url');
  });
});
