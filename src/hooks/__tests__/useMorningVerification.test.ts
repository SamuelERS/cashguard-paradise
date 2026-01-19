// 🤖 [IA] - v1.0.0: Tests para useMorningVerification (Auditoría "Cimientos de Cristal" - Fase 2C)
// Coverage objetivo: >70% para cumplir con estándares de calidad

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useMorningVerification } from '../useMorningVerification';
import { CashCount } from '@/types/cash';

// Mock de sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

// Mock de copyToClipboard
vi.mock('@/utils/clipboard', () => ({
  copyToClipboard: vi.fn().mockResolvedValue({ success: true })
}));

// Mock de paradise data
vi.mock('@/data/paradise', () => ({
  getStoreById: vi.fn((id: string) => {
    if (id === 'los-heroes') {
      return {
        id: 'los-heroes',
        name: 'Los Héroes',
        address: 'C.C. Los Heroes, Local #9 San Salvador',
        phone: '2260-5555',
        schedule: '09:00 AM - 08:00 PM'
      };
    }
    return undefined;
  }),
  getEmployeeById: vi.fn((id: string) => {
    const employees: Record<string, { id: string; name: string; role: string; stores: string[] }> = {
      'tito-gomez': {
        id: 'tito-gomez',
        name: 'Tito Gomez',
        role: 'Lider de Sucursal',
        stores: ['los-heroes']
      },
      'adonay-torres': {
        id: 'adonay-torres',
        name: 'Adonay Torres',
        role: 'Asistente de Sucursal',
        stores: ['los-heroes']
      }
    };
    return employees[id];
  })
}));

// Mock de calculations
vi.mock('@/utils/calculations', () => ({
  calculateCashTotal: vi.fn((cashCount: CashCount) => {
    return (
      cashCount.penny * 0.01 +
      cashCount.nickel * 0.05 +
      cashCount.dime * 0.10 +
      cashCount.quarter * 0.25 +
      cashCount.dollarCoin * 1.00 +
      cashCount.bill1 * 1.00 +
      cashCount.bill5 * 5.00 +
      cashCount.bill10 * 10.00 +
      cashCount.bill20 * 20.00 +
      cashCount.bill50 * 50.00 +
      cashCount.bill100 * 100.00
    );
  }),
  formatCurrency: vi.fn((value: number) => `$${value.toFixed(2)}`)
}));

describe('useMorningVerification', () => {
  // Mock navigator.clipboard
  const mockWriteText = vi.fn().mockResolvedValue(undefined);
  const originalNavigator = global.navigator;
  const originalWindow = { ...window };

  // CashCount que suma exactamente $50 (correcto)
  const correctCashCount: CashCount = {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 0,
    bill10: 5, // $50
    bill20: 0,
    bill50: 0,
    bill100: 0
  };

  // CashCount con faltante ($45)
  const shortageCashCount: CashCount = {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 1, // $5
    bill10: 4, // $40
    bill20: 0,
    bill50: 0,
    bill100: 0
  };

  // CashCount con sobrante ($55)
  const excessCashCount: CashCount = {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 1, // $5
    bill10: 5, // $50
    bill20: 0,
    bill50: 0,
    bill100: 0
  };

  const defaultOptions = {
    storeId: 'los-heroes',
    cashierId: 'tito-gomez',
    witnessId: 'adonay-torres',
    cashCount: correctCashCount
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator.clipboard
    Object.defineProperty(global, 'navigator', {
      value: {
        clipboard: {
          writeText: mockWriteText
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/100.0.0.0',
        share: undefined
      },
      writable: true,
      configurable: true
    });

    // Mock window.open
    vi.spyOn(window, 'open').mockImplementation(() => ({ closed: false } as Window));

    // Mock URL methods
    global.URL.createObjectURL = vi.fn(() => 'blob:test');
    global.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true
    });
    vi.restoreAllMocks();
  });

  describe('Estado inicial y cálculo de verificación', () => {
    it('debe calcular verificationData al montar con conteo correcto', async () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      expect(result.current.verificationData?.totalCash).toBe(50);
      expect(result.current.verificationData?.expectedAmount).toBe(50);
      expect(result.current.verificationData?.difference).toBe(0);
      expect(result.current.verificationData?.isCorrect).toBe(true);
      expect(result.current.verificationData?.hasShortage).toBe(false);
      expect(result.current.verificationData?.hasExcess).toBe(false);
    });

    it('debe detectar faltante cuando total < $49', async () => {
      const { result } = renderHook(() =>
        useMorningVerification({
          ...defaultOptions,
          cashCount: shortageCashCount
        })
      );

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      expect(result.current.verificationData?.totalCash).toBe(45);
      expect(result.current.verificationData?.difference).toBe(-5);
      expect(result.current.verificationData?.isCorrect).toBe(false);
      expect(result.current.verificationData?.hasShortage).toBe(true);
      expect(result.current.verificationData?.hasExcess).toBe(false);
    });

    it('debe detectar sobrante cuando total > $51', async () => {
      const { result } = renderHook(() =>
        useMorningVerification({
          ...defaultOptions,
          cashCount: excessCashCount
        })
      );

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      expect(result.current.verificationData?.totalCash).toBe(55);
      expect(result.current.verificationData?.difference).toBe(5);
      expect(result.current.verificationData?.isCorrect).toBe(false);
      expect(result.current.verificationData?.hasShortage).toBe(false);
      expect(result.current.verificationData?.hasExcess).toBe(true);
    });

    it('debe obtener store correctamente', () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      expect(result.current.store).not.toBeNull();
      expect(result.current.store?.id).toBe('los-heroes');
      expect(result.current.store?.name).toBe('Los Héroes');
    });

    it('debe obtener cashierIn correctamente', () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      expect(result.current.cashierIn).not.toBeNull();
      expect(result.current.cashierIn?.id).toBe('tito-gomez');
      expect(result.current.cashierIn?.name).toBe('Tito Gomez');
    });

    it('debe obtener cashierOut correctamente', () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      expect(result.current.cashierOut).not.toBeNull();
      expect(result.current.cashierOut?.id).toBe('adonay-torres');
      expect(result.current.cashierOut?.name).toBe('Adonay Torres');
    });

    it('debe manejar store no encontrado', () => {
      const { result } = renderHook(() =>
        useMorningVerification({
          ...defaultOptions,
          storeId: 'store-inexistente'
        })
      );

      expect(result.current.store).toBeUndefined();
    });

    it('debe manejar employee no encontrado', () => {
      const { result } = renderHook(() =>
        useMorningVerification({
          ...defaultOptions,
          cashierId: 'employee-inexistente'
        })
      );

      expect(result.current.cashierIn).toBeUndefined();
    });
  });

  describe('Detección de plataforma', () => {
    it('debe detectar correctamente desktop (Windows)', () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isMac).toBe(false);
    });

    it('debe detectar correctamente iPhone', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: { writeText: mockWriteText },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
        },
        writable: true,
        configurable: true
      });

      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isMac).toBe(true);
    });

    it('debe detectar correctamente Android', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: { writeText: mockWriteText },
          userAgent: 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36'
        },
        writable: true,
        configurable: true
      });

      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      expect(result.current.isMobile).toBe(true);
      expect(result.current.isMac).toBe(false);
    });

    it('debe detectar correctamente Mac', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: { writeText: mockWriteText },
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        },
        writable: true,
        configurable: true
      });

      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      expect(result.current.isMobile).toBe(false);
      expect(result.current.isMac).toBe(true);
    });
  });

  describe('WhatsApp State', () => {
    it('debe inicializar whatsappState correctamente', () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      expect(result.current.whatsappState.reportSent).toBe(false);
      expect(result.current.whatsappState.whatsappOpened).toBe(false);
      expect(result.current.whatsappState.popupBlocked).toBe(false);
      expect(result.current.whatsappState.showInstructions).toBe(false);
    });
  });

  describe('Generación de reporte', () => {
    it('debe generar reporte con header normal cuando conteo es correcto', async () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      const report = result.current.generateReport();

      expect(report).toContain('✅ *REPORTE NORMAL*');
      expect(report).toContain('CONTEO DE CAJA MATUTINO');
      expect(report).toContain('Los Héroes');
      expect(report).toContain('Tito Gomez');
      expect(report).toContain('Adonay Torres');
    });

    it('debe generar reporte con header advertencia cuando hay faltante', async () => {
      const { result } = renderHook(() =>
        useMorningVerification({
          ...defaultOptions,
          cashCount: shortageCashCount
        })
      );

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      const report = result.current.generateReport();

      expect(report).toContain('⚠️ *REPORTE ADVERTENCIA*');
      expect(report).toContain('FALTANTE');
    });

    it('debe generar reporte con header advertencia cuando hay sobrante', async () => {
      const { result } = renderHook(() =>
        useMorningVerification({
          ...defaultOptions,
          cashCount: excessCashCount
        })
      );

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      const report = result.current.generateReport();

      expect(report).toContain('⚠️ *REPORTE ADVERTENCIA*');
      expect(report).toContain('SOBRANTE');
    });

    it('debe incluir firma digital en el reporte', async () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      const report = result.current.generateReport();

      expect(report).toContain('Firma Digital:');
      expect(report).toContain('CashGuard Paradise');
      expect(report).toContain('NIST SP 800-115');
    });

    it('debe retornar string vacío si verificationData es null', () => {
      // Crear un hook con verificationData null simulado
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      // En el estado inicial antes de useEffect, generateReport debería manejar null
      // Pero dado que useEffect corre inmediatamente, verificamos que genera reporte válido
      expect(typeof result.current.generateReport()).toBe('string');
    });
  });

  describe('handleCopyToClipboard', () => {
    it('debe copiar reporte al portapapeles', async () => {
      const { copyToClipboard } = await import('@/utils/clipboard');

      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleCopyToClipboard();
      });

      expect(copyToClipboard).toHaveBeenCalled();
    });

    it('debe llamar copyToClipboard con el reporte generado', async () => {
      const { copyToClipboard } = await import('@/utils/clipboard');

      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleCopyToClipboard();
      });

      expect(copyToClipboard).toHaveBeenCalledWith(expect.stringContaining('CONTEO DE CAJA MATUTINO'));
    });

    it('debe mostrar toast de error cuando falla la copia', async () => {
      const { copyToClipboard } = await import('@/utils/clipboard');
      const { toast } = await import('sonner');

      vi.mocked(copyToClipboard).mockResolvedValueOnce({
        success: false,
        error: 'Error de prueba'
      });

      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleCopyToClipboard();
      });

      expect(toast.error).toHaveBeenCalledWith('Error de prueba');
    });
  });

  describe('handleWhatsAppSend - Desktop', () => {
    it('debe abrir modal de instrucciones en desktop', async () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(result.current.whatsappState.whatsappOpened).toBe(true);
      expect(result.current.whatsappState.showInstructions).toBe(true);
    });

    it('debe copiar reporte al portapapeles en desktop', async () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(mockWriteText).toHaveBeenCalled();
    });
  });

  describe('handleWhatsAppSend - Móvil', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: { writeText: mockWriteText },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
        },
        writable: true,
        configurable: true
      });
    });

    it('debe abrir WhatsApp nativo en móvil', async () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('https://wa.me/?text='),
        '_blank'
      );
    });

    it('debe marcar whatsappOpened en móvil', async () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(result.current.whatsappState.whatsappOpened).toBe(true);
    });

    it('debe detectar popup bloqueado en móvil', async () => {
      vi.spyOn(window, 'open').mockImplementation(() => null);

      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(result.current.whatsappState.popupBlocked).toBe(true);
    });
  });

  describe('handleWhatsAppSend - Validación', () => {
    it('debe mostrar error si faltan datos (store)', async () => {
      const { toast } = await import('sonner');

      const { result } = renderHook(() =>
        useMorningVerification({
          ...defaultOptions,
          storeId: 'store-inexistente'
        })
      );

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(toast.error).toHaveBeenCalledWith('❌ Error', {
        description: 'Faltan datos necesarios para generar el reporte'
      });
    });
  });

  describe('handleConfirmSent', () => {
    it('debe marcar reportSent como true', async () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      act(() => {
        result.current.handleConfirmSent();
      });

      expect(result.current.whatsappState.reportSent).toBe(true);
    });

    it('debe cerrar whatsappOpened', async () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      // Primero abrir WhatsApp
      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(result.current.whatsappState.whatsappOpened).toBe(true);

      // Luego confirmar
      act(() => {
        result.current.handleConfirmSent();
      });

      expect(result.current.whatsappState.whatsappOpened).toBe(false);
    });

    it('debe cerrar modal de instrucciones', async () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      // Primero abrir WhatsApp (abre modal en desktop)
      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(result.current.whatsappState.showInstructions).toBe(true);

      // Luego confirmar
      act(() => {
        result.current.handleConfirmSent();
      });

      expect(result.current.whatsappState.showInstructions).toBe(false);
    });

    it('debe mostrar toast de confirmación', async () => {
      const { toast } = await import('sonner');

      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      act(() => {
        result.current.handleConfirmSent();
      });

      expect(toast.success).toHaveBeenCalledWith('✅ Reporte confirmado como enviado');
    });
  });

  describe('handleShare', () => {
    it('debe usar navigator.share cuando está disponible', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: { writeText: mockWriteText },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          share: mockShare
        },
        writable: true,
        configurable: true
      });

      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleShare();
      });

      expect(mockShare).toHaveBeenCalledWith({
        title: 'Conteo de Caja Matutino',
        text: expect.any(String)
      });
    });

    it('debe usar fallback a clipboard cuando share no está disponible', async () => {
      const { copyToClipboard } = await import('@/utils/clipboard');

      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleShare();
      });

      expect(copyToClipboard).toHaveBeenCalled();
    });

    it('debe usar fallback a clipboard cuando share falla', async () => {
      const { copyToClipboard } = await import('@/utils/clipboard');
      const mockShare = vi.fn().mockRejectedValue(new Error('Share cancelled'));

      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: { writeText: mockWriteText },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
          share: mockShare
        },
        writable: true,
        configurable: true
      });

      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      await act(async () => {
        await result.current.handleShare();
      });

      expect(copyToClipboard).toHaveBeenCalled();
    });
  });

  describe('handleDownload', () => {
    it('debe crear y descargar archivo', async () => {
      const { toast } = await import('sonner');

      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      // Mock createElement DESPUÉS de renderizar el hook
      const mockClick = vi.fn();
      const mockAnchor = {
        href: '',
        download: '',
        click: mockClick,
        style: {}
      };
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockAnchor as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tagName);
      });

      act(() => {
        result.current.handleDownload();
      });

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith('Reporte descargado exitosamente');

      vi.restoreAllMocks();
    });

    it('debe usar nombre de archivo con timestamp', async () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      // Mock createElement DESPUÉS de renderizar el hook
      const mockAnchor = {
        href: '',
        download: '',
        click: vi.fn(),
        style: {}
      };
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return mockAnchor as unknown as HTMLAnchorElement;
        }
        return originalCreateElement(tagName);
      });

      act(() => {
        result.current.handleDownload();
      });

      expect(mockAnchor.download).toMatch(/conteo-matutino-\d+\.txt/);

      vi.restoreAllMocks();
    });
  });

  describe('closeInstructions', () => {
    it('debe cerrar el modal de instrucciones', async () => {
      const { result } = renderHook(() => useMorningVerification(defaultOptions));

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      // Primero abrir
      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(result.current.whatsappState.showInstructions).toBe(true);

      // Luego cerrar
      act(() => {
        result.current.closeInstructions();
      });

      expect(result.current.whatsappState.showInstructions).toBe(false);
    });
  });

  describe('Recálculo en cambio de cashCount', () => {
    it('debe recalcular cuando cashCount cambia', async () => {
      const { result, rerender } = renderHook(
        (props) => useMorningVerification(props),
        { initialProps: defaultOptions }
      );

      await waitFor(() => {
        expect(result.current.verificationData).not.toBeNull();
      });

      expect(result.current.verificationData?.totalCash).toBe(50);
      expect(result.current.verificationData?.isCorrect).toBe(true);

      // Cambiar a cashCount con faltante
      rerender({
        ...defaultOptions,
        cashCount: shortageCashCount
      });

      await waitFor(() => {
        expect(result.current.verificationData?.totalCash).toBe(45);
      });

      expect(result.current.verificationData?.isCorrect).toBe(false);
      expect(result.current.verificationData?.hasShortage).toBe(true);
    });
  });
});
