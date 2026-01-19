// 🤖 [IA] - v2.8.3: Tests para useWhatsAppIntegration (Auditoría "Cimientos de Cristal")
// Coverage objetivo: >70% para cumplir con estándares de calidad

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWhatsAppIntegration } from '../useWhatsAppIntegration';

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

describe('useWhatsAppIntegration', () => {
  const mockGenerateReport = vi.fn(() => 'Reporte de prueba');
  const mockOnReportSent = vi.fn();
  const mockOnError = vi.fn();

  // Mock navigator.clipboard
  const mockWriteText = vi.fn().mockResolvedValue(undefined);
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator.clipboard
    Object.defineProperty(global, 'navigator', {
      value: {
        clipboard: {
          writeText: mockWriteText
        },
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/100.0.0.0'
      },
      writable: true
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
  });

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true
    });
  });

  describe('Estado inicial', () => {
    it('debe inicializar con todos los estados en false', () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      expect(result.current.state.reportSent).toBe(false);
      expect(result.current.state.whatsappOpened).toBe(false);
      expect(result.current.state.popupBlocked).toBe(false);
      expect(result.current.state.showWhatsAppInstructions).toBe(false);
    });

    it('debe detectar correctamente plataforma desktop', () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      expect(result.current.isMobile).toBe(false);
    });

    it('debe detectar correctamente plataforma móvil iPhone', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: { writeText: mockWriteText },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
        },
        writable: true
      });

      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      expect(result.current.isMobile).toBe(true);
    });

    it('debe detectar correctamente plataforma móvil Android', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: { writeText: mockWriteText },
          userAgent: 'Mozilla/5.0 (Linux; Android 12) AppleWebKit/537.36'
        },
        writable: true
      });

      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      expect(result.current.isMobile).toBe(true);
    });

    it('debe detectar correctamente Mac para atajos de teclado', () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: { writeText: mockWriteText },
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        },
        writable: true
      });

      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      expect(result.current.isMac).toBe(true);
    });
  });

  describe('handleWhatsAppSend - Desktop', () => {
    it('debe copiar reporte al portapapeles en desktop', async () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(mockWriteText).toHaveBeenCalledWith('Reporte de prueba');
    });

    it('debe abrir modal de instrucciones en desktop', async () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(result.current.state.whatsappOpened).toBe(true);
      expect(result.current.state.showWhatsAppInstructions).toBe(true);
    });

    it('debe llamar generateReportFn al enviar', async () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(mockGenerateReport).toHaveBeenCalled();
    });
  });

  describe('handleWhatsAppSend - Móvil', () => {
    beforeEach(() => {
      Object.defineProperty(global, 'navigator', {
        value: {
          clipboard: { writeText: mockWriteText },
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
        },
        writable: true
      });
    });

    it('debe abrir WhatsApp nativo en móvil', async () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(window.location.href).toContain('whatsapp://send?text=');
    });

    it('debe copiar reporte antes de abrir WhatsApp en móvil', async () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(mockWriteText).toHaveBeenCalledWith('Reporte de prueba');
    });

    it('debe marcar whatsappOpened en móvil', async () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(result.current.state.whatsappOpened).toBe(true);
    });
  });

  describe('handleWhatsAppSend - Manejo de errores', () => {
    it('debe manejar error en generación de reporte', async () => {
      const errorGenerateReport = vi.fn(() => {
        throw new Error('Error de prueba');
      });

      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: errorGenerateReport,
          onError: mockOnError
        })
      );

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('debe usar fallback cuando clipboard API falla', async () => {
      mockWriteText.mockRejectedValueOnce(new Error('Clipboard not available'));

      // Mock del fallback con execCommand
      const mockExecCommand = vi.fn().mockReturnValue(true);
      document.execCommand = mockExecCommand;

      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      // Debería intentar el fallback
      expect(mockExecCommand).toHaveBeenCalledWith('copy');
    });
  });

  describe('handleConfirmSent', () => {
    it('debe marcar reportSent como true', () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport,
          onReportSent: mockOnReportSent
        })
      );

      act(() => {
        result.current.handleConfirmSent();
      });

      expect(result.current.state.reportSent).toBe(true);
    });

    it('debe cerrar whatsappOpened', async () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      // Primero abrir WhatsApp
      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(result.current.state.whatsappOpened).toBe(true);

      // Luego confirmar envío
      act(() => {
        result.current.handleConfirmSent();
      });

      expect(result.current.state.whatsappOpened).toBe(false);
    });

    it('debe cerrar modal de instrucciones', async () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      // Primero abrir WhatsApp (abre modal en desktop)
      await act(async () => {
        await result.current.handleWhatsAppSend();
      });

      expect(result.current.state.showWhatsAppInstructions).toBe(true);

      // Luego confirmar envío
      act(() => {
        result.current.handleConfirmSent();
      });

      expect(result.current.state.showWhatsAppInstructions).toBe(false);
    });

    it('debe llamar callback onReportSent', () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport,
          onReportSent: mockOnReportSent
        })
      );

      act(() => {
        result.current.handleConfirmSent();
      });

      expect(mockOnReportSent).toHaveBeenCalled();
    });
  });

  describe('handleCopyToClipboard', () => {
    it('debe copiar reporte exitosamente', async () => {
      const { copyToClipboard } = await import('@/utils/clipboard');

      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      await act(async () => {
        await result.current.handleCopyToClipboard();
      });

      expect(copyToClipboard).toHaveBeenCalledWith('Reporte de prueba');
    });

    it('debe llamar generateReportFn al copiar', async () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      await act(async () => {
        await result.current.handleCopyToClipboard();
      });

      expect(mockGenerateReport).toHaveBeenCalled();
    });
  });

  describe('Control del modal', () => {
    it('debe abrir modal con openInstructions', () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      act(() => {
        result.current.openInstructions();
      });

      expect(result.current.state.showWhatsAppInstructions).toBe(true);
    });

    it('debe cerrar modal con closeInstructions', () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      // Primero abrir
      act(() => {
        result.current.openInstructions();
      });

      expect(result.current.state.showWhatsAppInstructions).toBe(true);

      // Luego cerrar
      act(() => {
        result.current.closeInstructions();
      });

      expect(result.current.state.showWhatsAppInstructions).toBe(false);
    });
  });

  describe('reset', () => {
    it('debe resetear todos los estados', async () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
        })
      );

      // Modificar todos los estados
      await act(async () => {
        await result.current.handleWhatsAppSend();
      });
      act(() => {
        result.current.handleConfirmSent();
      });

      // Verificar que estados cambiaron
      expect(result.current.state.reportSent).toBe(true);

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verificar reset completo
      expect(result.current.state.reportSent).toBe(false);
      expect(result.current.state.whatsappOpened).toBe(false);
      expect(result.current.state.popupBlocked).toBe(false);
      expect(result.current.state.showWhatsAppInstructions).toBe(false);
    });
  });

  describe('Callbacks opcionales', () => {
    it('debe funcionar sin onReportSent', () => {
      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: mockGenerateReport
          // Sin onReportSent
        })
      );

      // No debe lanzar error
      expect(() => {
        act(() => {
          result.current.handleConfirmSent();
        });
      }).not.toThrow();
    });

    it('debe funcionar sin onError', async () => {
      const errorGenerateReport = vi.fn(() => {
        throw new Error('Error de prueba');
      });

      const { result } = renderHook(() =>
        useWhatsAppIntegration({
          generateReportFn: errorGenerateReport
          // Sin onError
        })
      );

      // No debe lanzar error
      await expect(
        act(async () => {
          await result.current.handleWhatsAppSend();
        })
      ).resolves.not.toThrow();
    });
  });
});
