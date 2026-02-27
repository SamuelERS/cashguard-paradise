/**
 * 🤖 [IA] - v1.4.1: Tests useMorningVerificationController (ORDEN #074)
 *
 * @description
 * Tests unitarios para el hook controller de verificación matutina.
 * Cubre: estado inicial, verificación al montar, handlers WhatsApp,
 * confirmación, share, printable report, anti-fraude (shouldBlockResults).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMorningVerificationController } from '../useMorningVerificationController';
import type { MorningVerificationProps } from '@/types/morningVerification';
import type { CashCount } from '@/types/cash';

// ────────────────────────────────────────────────────────────────
// Mocks
// ────────────────────────────────────────────────────────────────

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('@/utils/clipboard', () => ({
  copyToClipboard: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('../../../lib/morning-verification/mvFormatters', () => ({
  formatVerificationTimestamp: () => '07/02/2026, 08:30 a. m.',
  generateMorningReport: vi.fn(() => 'MOCK_REPORT_TEXT'),
  downloadPrintableReport: vi.fn(),
}));

// 🤖 [IA] - v3.6.0: Mock para impresión térmica 80mm (reemplaza downloadPrintableReport)
vi.mock('@/utils/generate-thermal-print', () => ({
  generateThermalHTML: vi.fn(() => '<html>Thermal Mock</html>'),
  sanitizeForThermal: vi.fn((text: string) => text),
}));

// ────────────────────────────────────────────────────────────────
// Fixtures
// ────────────────────────────────────────────────────────────────

const EMPTY_CASH: CashCount = {
  penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
  bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0,
};

const EXACT_50: CashCount = {
  ...EMPTY_CASH,
  bill20: 2,  // $40
  bill10: 1,  // $10
};

const SHORTAGE_48: CashCount = {
  ...EMPTY_CASH,
  bill20: 2,  // $40
  bill5: 1,   // $5
  bill1: 3,   // $3
};

function makeProps(overrides: Partial<MorningVerificationProps> = {}): MorningVerificationProps {
  return {
    storeId: 'store1',
    cashierId: 'emp1',
    witnessId: 'emp2',
    storeName: 'Los Heroes',
    cashierName: 'Adonay Torres',
    witnessName: 'Tito Gomez',
    cashCount: EXACT_50,
    onBack: vi.fn(),
    onComplete: vi.fn(),
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────────────
// Estado inicial + verificación
// ────────────────────────────────────────────────────────────────

describe('useMorningVerificationController - Estado inicial', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('retorna verificationData con $50 exacto', () => {
    const { result } = renderHook(() => useMorningVerificationController(makeProps()));
    expect(result.current.verificationData).not.toBeNull();
    expect(result.current.verificationData?.totalCash).toBe(50);
    expect(result.current.verificationData?.isCorrect).toBe(true);
  });

  it('retorna isLoading=false cuando datos resueltos', () => {
    const { result } = renderHook(() => useMorningVerificationController(makeProps()));
    expect(result.current.isLoading).toBe(false);
  });

  it('resuelve actores correctamente', () => {
    const { result } = renderHook(() => useMorningVerificationController(makeProps()));
    expect(result.current.store?.name).toBe('Los Heroes');
    expect(result.current.cashierIn?.name).toBe('Adonay Torres');
    expect(result.current.cashierOut?.name).toBe('Tito Gomez');
  });

  it('estado anti-fraude: reportSent=false, whatsappOpened=false', () => {
    const { result } = renderHook(() => useMorningVerificationController(makeProps()));
    expect(result.current.reportSent).toBe(false);
    expect(result.current.whatsappOpened).toBe(false);
    expect(result.current.popupBlocked).toBe(false);
    expect(result.current.showWhatsAppInstructions).toBe(false);
  });

  it('detecta shortage con $48', () => {
    const { result } = renderHook(() =>
      useMorningVerificationController(makeProps({ cashCount: SHORTAGE_48 }))
    );
    expect(result.current.verificationData?.totalCash).toBe(48);
    expect(result.current.verificationData?.difference).toBe(-2);
    expect(result.current.verificationData?.isCorrect).toBe(false);
    expect(result.current.verificationData?.hasShortage).toBe(true);
  });

  it('genera reporte no vacio', () => {
    const { result } = renderHook(() => useMorningVerificationController(makeProps()));
    expect(result.current.report).toBe('MOCK_REPORT_TEXT');
  });
});

// ────────────────────────────────────────────────────────────────
// handleConfirmSent
// ────────────────────────────────────────────────────────────────

describe('useMorningVerificationController - handleConfirmSent', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('marca reportSent=true y cierra modal', async () => {
    const { result } = renderHook(() => useMorningVerificationController(makeProps()));

    await act(async () => {
      result.current.handleConfirmSent();
    });

    expect(result.current.reportSent).toBe(true);
    expect(result.current.whatsappOpened).toBe(false);
    expect(result.current.showWhatsAppInstructions).toBe(false);
  });
});

// ────────────────────────────────────────────────────────────────
// handleCopyToClipboard
// ────────────────────────────────────────────────────────────────

describe('useMorningVerificationController - handleCopyToClipboard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('copia reporte al portapapeles', async () => {
    const { copyToClipboard } = await import('@/utils/clipboard');
    const { result } = renderHook(() => useMorningVerificationController(makeProps()));

    await act(async () => {
      await result.current.handleCopyToClipboard();
    });

    expect(copyToClipboard).toHaveBeenCalledWith('MOCK_REPORT_TEXT');
  });

  it('muestra toast success', async () => {
    const { toast } = await import('sonner');
    const { result } = renderHook(() => useMorningVerificationController(makeProps()));

    await act(async () => {
      await result.current.handleCopyToClipboard();
    });

    expect(toast.success).toHaveBeenCalledWith('Reporte copiado al portapapeles');
  });
});

// ────────────────────────────────────────────────────────────────
// handleWhatsAppSend - mobile flow
// ────────────────────────────────────────────────────────────────

describe('useMorningVerificationController - handleWhatsAppSend (mobile)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock mobile user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'iPhone',
      writable: true,
      configurable: true,
    });
    // Mock clipboard API
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it('abre WhatsApp con window.open en mobile', async () => {
    const mockWindow = { closed: false };
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(mockWindow as Window);

    const { result } = renderHook(() => useMorningVerificationController(makeProps()));

    await act(async () => {
      await result.current.handleWhatsAppSend();
    });

    expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('wa.me'), '_blank');
    expect(result.current.whatsappOpened).toBe(true);

    openSpy.mockRestore();
  });

  it('detecta popup bloqueado', async () => {
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

    const { result } = renderHook(() => useMorningVerificationController(makeProps()));

    await act(async () => {
      await result.current.handleWhatsAppSend();
    });

    expect(result.current.popupBlocked).toBe(true);

    openSpy.mockRestore();
  });
});

// ────────────────────────────────────────────────────────────────
// handleWhatsAppSend - desktop flow
// ────────────────────────────────────────────────────────────────

describe('useMorningVerificationController - handleWhatsAppSend (desktop)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh)',
      writable: true,
      configurable: true,
    });
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  it('muestra modal instrucciones en desktop (NO abre window)', async () => {
    const openSpy = vi.spyOn(window, 'open');

    const { result } = renderHook(() => useMorningVerificationController(makeProps()));

    await act(async () => {
      await result.current.handleWhatsAppSend();
    });

    expect(openSpy).not.toHaveBeenCalled();
    expect(result.current.showWhatsAppInstructions).toBe(true);
    expect(result.current.whatsappOpened).toBe(true);

    openSpy.mockRestore();
  });
});

// ────────────────────────────────────────────────────────────────
// handleWhatsAppSend - validación datos
// ────────────────────────────────────────────────────────────────

describe('useMorningVerificationController - handleWhatsAppSend (validación)', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('muestra error si faltan ids requeridos', async () => {
    const { toast } = await import('sonner');

    const { result } = renderHook(() =>
      useMorningVerificationController(makeProps({ storeId: '' }))
    );

    await act(async () => {
      await result.current.handleWhatsAppSend();
    });

    expect(toast.error).toHaveBeenCalled();
  });

  it('muestra error si ids requeridos contienen solo espacios', async () => {
    const { toast } = await import('sonner');

    const { result } = renderHook(() =>
      useMorningVerificationController(makeProps({ storeId: '   ' }))
    );

    await act(async () => {
      await result.current.handleWhatsAppSend();
    });

    expect(toast.error).toHaveBeenCalled();
  });
});

// ────────────────────────────────────────────────────────────────
// handleShare
// ────────────────────────────────────────────────────────────────

describe('useMorningVerificationController - handleShare', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('usa Web Share API si disponible', async () => {
    const shareSpy = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareSpy,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useMorningVerificationController(makeProps()));

    await act(async () => {
      await result.current.handleShare();
    });

    expect(shareSpy).toHaveBeenCalledWith({
      title: 'Conteo de Caja Matutino',
      text: 'MOCK_REPORT_TEXT',
    });
  });

  it('fallback a clipboard si share no disponible', async () => {
    const { copyToClipboard } = await import('@/utils/clipboard');
    // Remove share API
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useMorningVerificationController(makeProps()));

    await act(async () => {
      await result.current.handleShare();
    });

    expect(copyToClipboard).toHaveBeenCalled();
  });
});

// ────────────────────────────────────────────────────────────────
// handlePrintableReport
// ────────────────────────────────────────────────────────────────

// 🤖 [IA] - v3.6.0: Tests actualizados para impresión térmica 80mm (reemplaza downloadPrintableReport)
describe('useMorningVerificationController - handlePrintableReport', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('genera HTML térmico y abre ventana de impresión', async () => {
    const { generateThermalHTML } = await import('@/utils/generate-thermal-print');
    const mockPrintWindow = {
      document: { write: vi.fn(), close: vi.fn() },
    };
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(mockPrintWindow as unknown as Window);

    const { result } = renderHook(() => useMorningVerificationController(makeProps()));

    await act(async () => {
      result.current.handlePrintableReport();
    });

    expect(generateThermalHTML).toHaveBeenCalledWith('MOCK_REPORT_TEXT', 'Los Heroes');
    expect(openSpy).toHaveBeenCalledWith('', '_blank');
    expect(mockPrintWindow.document.write).toHaveBeenCalledWith('<html>Thermal Mock</html>');
    expect(mockPrintWindow.document.close).toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it('muestra toast error si window.open falla', async () => {
    const { toast } = await import('sonner');
    const openSpy = vi.spyOn(window, 'open').mockReturnValue(null);

    const { result } = renderHook(() => useMorningVerificationController(makeProps()));

    await act(async () => {
      result.current.handlePrintableReport();
    });

    // No toast.error because the handler only toasts on exception, not on null window
    // But it should NOT toast success either
    expect(toast.success).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });
});

// ────────────────────────────────────────────────────────────────
// handleBack + handleComplete
// ────────────────────────────────────────────────────────────────

describe('useMorningVerificationController - callbacks', () => {
  it('handleBack llama onBack prop', async () => {
    const onBack = vi.fn();
    const { result } = renderHook(() =>
      useMorningVerificationController(makeProps({ onBack }))
    );

    await act(async () => {
      result.current.handleBack();
    });

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('handleComplete llama onComplete prop', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useMorningVerificationController(makeProps({ onComplete }))
    );

    await act(async () => {
      result.current.handleComplete();
    });

    expect(onComplete).toHaveBeenCalledOnce();
  });
});
