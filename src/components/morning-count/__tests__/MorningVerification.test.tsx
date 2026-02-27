// 🤖 [IA] - v1.4.1: Tests adaptados ORDEN #074 - Desmonolitización MorningVerification
// Previous: v1.3.7 (20 tests, monolito 742 líneas)
// Now: 17 tests adaptados (Group 4 eliminado — auto-timeout NO existe en v2.8.1+)
//
// Cambios v1.4.1:
// - Agregado mock @/data/paradise (controller requiere actores resueltos)
// - Agregado mock mobile user agent (handleWhatsAppSend usa isMobilePlatform())
// - Agregado mock navigator.clipboard (copyReportToClipboard en controller)
// - Eliminado Group 4 (3 tests auto-timeout) con evidencia documentada
// - Removido setTimeoutSpy (ya no necesario sin Group 4)
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MorningVerification } from '@/components/morning-count/MorningVerification';
import type { CashCount } from '@/types/cash';

// ────────────────────────────────────────────────────────────────
// Mocks
// ────────────────────────────────────────────────────────────────

vi.mock('@/utils/clipboard', () => ({
  copyToClipboard: vi.fn(() => Promise.resolve({ success: true }))
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}));

// 🤖 [IA] - v3.6.0: Mock para utilidad de impresión térmica 80mm
vi.mock('@/utils/generate-thermal-print', () => ({
  generateThermalHTML: vi.fn(() => '<html>Thermal Mock</html>'),
  sanitizeForThermal: vi.fn((text: string) => text),
}));

// 🤖 [IA] - v1.4.1: Mock @/data/paradise — controller llama resolveVerificationActors()
// Sin este mock, store/cashierIn/cashierOut son undefined → handleWhatsAppSend retorna early
vi.mock('@/data/paradise', () => ({
  getStoreById: (id: string) => {
    if (id === 'store1') return { id: 'store1', name: 'Los Heroes', address: '', phone: '', schedule: '' };
    return undefined;
  },
  getEmployeeById: (id: string) => {
    if (id === 'cashier1') return { id: 'cashier1', name: 'Cajero Test', role: 'cashier', stores: ['store1'] };
    if (id === 'witness1') return { id: 'witness1', name: 'Testigo Test', role: 'cashier', stores: ['store1'] };
    return undefined;
  },
}));

describe('MorningVerification - v1.3.7 WhatsApp Confirmation Flow', () => {
  const mockCashCount: CashCount = {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 10, // $50 total para cambio
    bill10: 0,
    bill20: 0,
    bill50: 0,
    bill100: 0
  };

  const defaultProps = {
    storeId: 'store1',
    cashierId: 'cashier1', // Cajero ENTRANTE
    witnessId: 'witness1', // Cajero SALIENTE
    cashCount: mockCashCount,
    onBack: vi.fn(),
    onComplete: vi.fn()
  };

  let windowOpenSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.open por defecto como exitoso
    windowOpenSpy = vi.spyOn(window, 'open').mockReturnValue({
      closed: false,
      close: vi.fn()
    } as Window);
    // 🤖 [IA] - v1.4.1: Mock mobile user agent — controller usa isMobilePlatform()
    // Sin este mock, jsdom reporta desktop UA → handleWhatsAppSend NO llama window.open (muestra modal instrucciones)
    Object.defineProperty(navigator, 'userAgent', {
      value: 'iPhone',
      writable: true,
      configurable: true,
    });
    // 🤖 [IA] - v1.4.1: Mock navigator.clipboard — copyReportToClipboard() en controller
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
  });

  describe('Grupo 1: Estado inicial bloqueado', () => {
    it('1.1 - Debe mostrar mensaje "Resultados Bloqueados" inicialmente', async () => {
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('🔒 Resultados Bloqueados')).toBeInTheDocument();
        expect(screen.getByText(/Los resultados de la verificación matutina se revelarán/i)).toBeInTheDocument();
      });
    });

    it('1.2 - NO debe mostrar resultados cuando reportSent === false', async () => {
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        // Resultados NO deben estar visibles
        expect(screen.queryByText(/Total Contado:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Diferencia:/i)).not.toBeInTheDocument();
      });
    });

    it('1.3 - Botón WhatsApp debe estar habilitado inicialmente', async () => {
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
        expect(whatsappButton).toBeEnabled();
      });
    });

    it('1.4 - Botón Copiar debe estar deshabilitado inicialmente', async () => {
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copiar/i });
        expect(copyButton).toBeDisabled();
      });
    });

    it('1.5 - Botón Finalizar debe estar deshabilitado inicialmente', async () => {
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        const finishButton = screen.getByRole('button', { name: /finalizar/i });
        expect(finishButton).toBeDisabled();
      });
    });
  });

  describe('Grupo 2: Flujo WhatsApp exitoso', () => {
    it('2.1 - Click botón WhatsApp debe llamar window.open con URL correcta', async () => {
      const user = userEvent.setup();
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
      });

      const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        expect(windowOpenSpy).toHaveBeenCalledTimes(1);
        expect(windowOpenSpy).toHaveBeenCalledWith(
          expect.stringContaining('https://wa.me/?text='),
          '_blank'
        );
      });
    });

    it('2.2 - Después de abrir WhatsApp, debe mostrar botón de confirmación', async () => {
      const user = userEvent.setup();
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
      });

      const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        expect(screen.getByText(/¿Ya envió el reporte por WhatsApp\?/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sí, ya envié el reporte/i })).toBeInTheDocument();
      });
    });

    it('2.3 - Click confirmación debe desbloquear resultados', async () => {
      const user = userEvent.setup();
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
      });

      // Abrir WhatsApp
      const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
      await user.click(whatsappButton);

      // Confirmar envío
      const confirmButton = await screen.findByRole('button', { name: /sí, ya envié el reporte/i });
      await user.click(confirmButton);

      // Resultados ahora visibles (getAllByText porque hay 2 elementos con "Total Contado")
      await waitFor(() => {
        expect(screen.getAllByText(/Total Contado:/i).length).toBeGreaterThan(0);
        expect(screen.queryByText('🔒 Resultados Bloqueados')).not.toBeInTheDocument();
      });
    });

    it('2.4 - Después de confirmar, botones Copiar y Finalizar deben habilitarse', async () => {
      const user = userEvent.setup();
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
      });

      // Abrir WhatsApp
      const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
      await user.click(whatsappButton);

      // Confirmar envío
      const confirmButton = await screen.findByRole('button', { name: /sí, ya envié el reporte/i });
      await user.click(confirmButton);

      // Botones habilitados
      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copiar/i });
        const finishButton = screen.getByRole('button', { name: /finalizar/i });
        expect(copyButton).toBeEnabled();
        expect(finishButton).toBeEnabled();
      });
    });

    it('2.5 - Botón WhatsApp debe cambiar texto a "Reporte Enviado" después de confirmar', async () => {
      const user = userEvent.setup();
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
      });

      const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
      await user.click(whatsappButton);

      const confirmButton = await screen.findByRole('button', { name: /sí, ya envié el reporte/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /reporte enviado/i })).toBeInTheDocument();
      });
    });
  });

  describe('Grupo 3: Pop-up bloqueado', () => {
    it('3.1 - Si window.open retorna null, debe detectar bloqueo de pop-up', async () => {
      windowOpenSpy.mockReturnValue(null);
      const user = userEvent.setup();
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
      });

      const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        expect(screen.getByText(/🚫 Pop-ups Bloqueados/i)).toBeInTheDocument();
      });
    });

    it('3.2 - Si window.open.closed === true, debe detectar bloqueo', async () => {
      windowOpenSpy.mockReturnValue({ closed: true, close: vi.fn() } as Window);
      const user = userEvent.setup();
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
      });

      const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        expect(screen.getByText(/🚫 Pop-ups Bloqueados/i)).toBeInTheDocument();
      });
    });

    it('3.3 - Cuando pop-up bloqueado, botón Copiar debe habilitarse como fallback', async () => {
      windowOpenSpy.mockReturnValue(null);
      const user = userEvent.setup();
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
      });

      const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copiar/i });
        expect(copyButton).toBeEnabled();
      });
    });

    it('3.4 - Banner pop-up bloqueado debe sugerir usar botón Copiar', async () => {
      windowOpenSpy.mockReturnValue(null);
      const user = userEvent.setup();
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
      });

      const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        expect(screen.getByText(/Su navegador bloqueó la apertura de WhatsApp/i)).toBeInTheDocument();
        expect(screen.getByText(/Use el botón "Copiar"/i)).toBeInTheDocument();
      });
    });
  });

  // 🤖 [IA] - v1.4.1: Group 4 ELIMINADO (3 tests auto-timeout)
  // Evidencia: Auto-timeout de 10s NO existe en v2.8.1+ (fue removido intencionalmente)
  // Verificación:
  //   - grep 'setTimeout' useMorningVerificationController.ts → 0 matches
  //   - grep 'setTimeout' MorningVerificationView.tsx → 0 matches
  //   - grep '10000' useMorningVerificationController.ts → 0 matches
  // Controller usa confirmación manual explícita (handleConfirmSent) sin auto-timeout
  // Tests eliminados: 4.1 (setTimeout 10s), 4.2 (auto-confirm), 4.3 (cancel before timeout)

  // ============================================================
  // GRUPO 6: Botón Imprimir — impresión térmica 80mm (v3.6.0)
  // ============================================================
  // 🤖 [IA] - v3.6.0: TDD RED — Tests escritos ANTES de implementar botón Imprimir
  // Estos tests DEBEN FALLAR hasta que se agregue el botón en MorningVerificationView.tsx
  describe('Grupo 6: Botón Imprimir (v3.6.0)', () => {
    it('6.1 — muestra botón Imprimir con aria-label correcto', async () => {
      render(<MorningVerification {...defaultProps} />);
      await waitFor(() => {
        const printButton = screen.getByRole('button', { name: /imprimir reporte/i });
        expect(printButton).toBeInTheDocument();
      });
    });

    it('6.2 — botón Imprimir está deshabilitado cuando reportSent es false', async () => {
      render(<MorningVerification {...defaultProps} />);
      await waitFor(() => {
        const printButton = screen.getByRole('button', { name: /imprimir reporte/i });
        expect(printButton).toBeDisabled();
      });
    });

    it('6.3 — botón Imprimir contiene texto visible "Imprimir"', async () => {
      render(<MorningVerification {...defaultProps} />);
      await waitFor(() => {
        const printButton = screen.getByRole('button', { name: /imprimir reporte/i });
        expect(printButton).toHaveTextContent(/imprimir/i);
      });
    });
  });

  describe('Grupo 5: Banners adaptativos', () => {
    it('5.1 - Debe mostrar banner advertencia inicial cuando NO enviado', async () => {
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/⚠️ DEBE ENVIAR REPORTE PARA CONTINUAR/i)).toBeInTheDocument();
        expect(screen.getByText(/Los resultados se revelarán después de enviar el reporte/i)).toBeInTheDocument();
      });
    });

    it('5.2 - Banner advertencia debe ocultarse después de abrir WhatsApp', async () => {
      const user = userEvent.setup();
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
      });

      const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        expect(screen.queryByText(/⚠️ DEBE ENVIAR REPORTE PARA CONTINUAR/i)).not.toBeInTheDocument();
      });
    });

    it('5.3 - Banner pop-up bloqueado solo aparece si window.open falla', async () => {
      windowOpenSpy.mockReturnValue(null);
      const user = userEvent.setup();
      render(<MorningVerification {...defaultProps} />);

      await waitFor(() => {
        // Inicialmente NO debe aparecer
        expect(screen.queryByText(/🚫 Pop-ups Bloqueados/i)).not.toBeInTheDocument();
      });

      const whatsappButton = screen.getByRole('button', { name: /whatsapp/i });
      await user.click(whatsappButton);

      // AHORA debe aparecer
      await waitFor(() => {
        expect(screen.getByText(/🚫 Pop-ups Bloqueados/i)).toBeInTheDocument();
      });
    });
  });
});
