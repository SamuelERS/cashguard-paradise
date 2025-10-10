// 🤖 [IA] - v1.3.7: Tests confirmación explícita WhatsApp ANTES de revelar resultados
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CashCalculation from '../CashCalculation';
import type { CashCount, ElectronicPayments } from '@/types/cash';

// 🤖 [IA] - v1.3.7a: Mock paradise data (stores & employees)
vi.mock('@/data/paradise', () => ({
  getStoreById: vi.fn((id: string) => ({
    id,
    name: 'Test Store',
    address: 'Test Address',
    phone: '1234-5678',
    schedule: '9AM-5PM'
  })),
  getEmployeeById: vi.fn((id: string) => ({
    id,
    name: 'Test Employee',
    role: 'Test Role',
    stores: ['test-store']
  })),
  STORES: [],
  EMPLOYEES: []
}));

// Mock dependencies
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

describe('CashCalculation - v1.3.7 WhatsApp Confirmation Flow', () => {
  const mockCashCount: CashCount = {
    penny: 43,
    nickel: 20,
    dime: 33,
    quarter: 8,
    dollarCoin: 0,
    bill1: 1,
    bill5: 1,
    bill10: 1,
    bill20: 1,
    bill50: 0,
    bill100: 0
  };

  const mockElectronicPayments: ElectronicPayments = {
    credomatic: 0,
    promerica: 0,
    bankTransfer: 0,
    paypal: 0
  };

  const defaultProps = {
    storeId: 'store1',
    cashierId: 'cashier1',
    witnessId: 'witness1',
    cashCount: mockCashCount,
    electronicPayments: mockElectronicPayments,
    expectedSales: 100,
    onBack: vi.fn(),
    onComplete: vi.fn()
  };

  // 🤖 [IA] - v1.3.7a: Spies para tests - Tipos inferidos automáticamente por vitest
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let windowOpenSpy: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let setTimeoutSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.open por defecto como exitoso
    windowOpenSpy = vi.spyOn(window, 'open').mockReturnValue({
      closed: false,
      close: vi.fn()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    // Mock setTimeout para control manual
    setTimeoutSpy = vi.spyOn(global, 'setTimeout');
  });

  afterEach(() => {
    windowOpenSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  });

  describe('Grupo 1: Estado inicial bloqueado', () => {
    it('1.1 - Debe mostrar mensaje "Resultados Bloqueados" inicialmente', () => {
      render(<CashCalculation {...defaultProps} />);

      expect(screen.getByText('🔒 Resultados Bloqueados')).toBeInTheDocument();
      expect(screen.getByText(/Los resultados del corte se revelarán después de enviar el reporte por WhatsApp/i)).toBeInTheDocument();
    });

    it('1.2 - NO debe mostrar resultados cuando reportSent === false', () => {
      render(<CashCalculation {...defaultProps} />);

      // Resultados NO deben estar visibles
      expect(screen.queryByText(/Total Día:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Diferencia:/i)).not.toBeInTheDocument();
    });

    it('1.3 - Botón WhatsApp debe estar habilitado inicialmente', () => {
      render(<CashCalculation {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      expect(whatsappButton).toBeEnabled();
    });

    it('1.4 - Botón Copiar debe estar deshabilitado inicialmente', () => {
      render(<CashCalculation {...defaultProps} />);

      const copyButton = screen.getByRole('button', { name: /copiar reporte/i });
      expect(copyButton).toBeDisabled();
    });

    it('1.5 - Botón Finalizar debe estar deshabilitado inicialmente', () => {
      render(<CashCalculation {...defaultProps} />);

      const finishButton = screen.getByRole('button', { name: /finalizar proceso/i });
      expect(finishButton).toBeDisabled();
    });
  });

  describe('Grupo 2: Flujo WhatsApp exitoso', () => {
    it('2.1 - Click botón WhatsApp debe llamar window.open con URL correcta', async () => {
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      expect(windowOpenSpy).toHaveBeenCalledTimes(1);
      expect(windowOpenSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://api.whatsapp.com/send?text='),
        '_blank'
      );
    });

    it('2.2 - Después de abrir WhatsApp, debe mostrar botón de confirmación', async () => {
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        expect(screen.getByText(/¿Ya envió el reporte por WhatsApp\?/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /sí, ya envié el reporte/i })).toBeInTheDocument();
      });
    });

    it('2.3 - Click confirmación debe desbloquear resultados', async () => {
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      // Abrir WhatsApp
      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      // Confirmar envío
      const confirmButton = await screen.findByRole('button', { name: /confirmar envío de reporte/i });
      await user.click(confirmButton);

      // Resultados ahora visibles
      await waitFor(() => {
        expect(screen.getByText(/Total Día:/i)).toBeInTheDocument();
        expect(screen.queryByText('🔒 Resultados Bloqueados')).not.toBeInTheDocument();
      });
    });

    it('2.4 - Después de confirmar, botones Copiar y Finalizar deben habilitarse', async () => {
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      // Abrir WhatsApp
      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      // Confirmar envío
      const confirmButton = await screen.findByRole('button', { name: /confirmar envío de reporte/i });
      await user.click(confirmButton);

      // Botones habilitados
      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copiar reporte/i });
        const finishButton = screen.getByRole('button', { name: /finalizar proceso/i });
        expect(copyButton).toBeEnabled();
        expect(finishButton).toBeEnabled();
      });
    });

    it('2.5 - Botón WhatsApp debe cambiar texto a "Reporte Enviado" después de confirmar', async () => {
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      const confirmButton = await screen.findByRole('button', { name: /confirmar envío de reporte/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Reporte Enviado/i)).toBeInTheDocument();
      });
    });
  });

  describe('Grupo 3: Pop-up bloqueado', () => {
    it('3.1 - Si window.open retorna null, debe detectar bloqueo de pop-up', async () => {
      windowOpenSpy.mockReturnValue(null);
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        expect(screen.getByText(/🚫 Pop-ups Bloqueados/i)).toBeInTheDocument();
      });
    });

    it('3.2 - Si window.open.closed === true, debe detectar bloqueo', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      windowOpenSpy.mockReturnValue({ closed: true, close: vi.fn() } as any);
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        expect(screen.getByText(/🚫 Pop-ups Bloqueados/i)).toBeInTheDocument();
      });
    });

    it('3.3 - Cuando pop-up bloqueado, botón Copiar debe habilitarse como fallback', async () => {
      windowOpenSpy.mockReturnValue(null);
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        const copyButton = screen.getByRole('button', { name: /copiar reporte/i });
        expect(copyButton).toBeEnabled();
      });
    });

    it('3.4 - Banner pop-up bloqueado debe sugerir usar botón Copiar', async () => {
      windowOpenSpy.mockReturnValue(null);
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        expect(screen.getByText(/Su navegador bloqueó la apertura de WhatsApp/i)).toBeInTheDocument();
        expect(screen.getByText(/Use el botón "Copiar"/i)).toBeInTheDocument();
      });
    });
  });

  describe('Grupo 4: Auto-confirmación timeout', () => {
    it('4.1 - Debe crear timeout de 10 segundos después de abrir WhatsApp', async () => {
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 10000);
      });
    });

    it('4.2 - Después de 10s sin confirmar, debe auto-confirmar reportSent', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      // Avanzar tiempo 10 segundos
      vi.advanceTimersByTime(10000);

      await waitFor(() => {
        expect(screen.queryByText('🔒 Resultados Bloqueados')).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('4.3 - Si usuario confirma antes de 10s, timeout NO debe ejecutarse', async () => {
      vi.useFakeTimers();
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      // Confirmar manualmente ANTES de timeout
      const confirmButton = await screen.findByRole('button', { name: /confirmar envío de reporte/i });
      await user.click(confirmButton);

      // Avanzar tiempo (no debería cambiar nada)
      vi.advanceTimersByTime(10000);

      // Botón sigue mostrando "Reporte Enviado" (no se duplica confirmación)
      expect(screen.getByText(/Reporte Enviado/i)).toBeInTheDocument();

      vi.useRealTimers();
    });
  });

  describe('Grupo 5: Banners adaptativos', () => {
    it('5.1 - Debe mostrar banner advertencia inicial cuando NO enviado', () => {
      render(<CashCalculation {...defaultProps} />);

      expect(screen.getByText(/⚠️ DEBE ENVIAR REPORTE PARA CONTINUAR/i)).toBeInTheDocument();
      expect(screen.getByText(/Los resultados se revelarán después de enviar el reporte/i)).toBeInTheDocument();
    });

    it('5.2 - Banner advertencia debe ocultarse después de abrir WhatsApp', async () => {
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      await waitFor(() => {
        expect(screen.queryByText(/⚠️ DEBE ENVIAR REPORTE PARA CONTINUAR/i)).not.toBeInTheDocument();
      });
    });

    it('5.3 - Banner pop-up bloqueado solo aparece si window.open falla', async () => {
      windowOpenSpy.mockReturnValue(null);
      const user = userEvent.setup();
      render(<CashCalculation {...defaultProps} />);

      // Inicialmente NO debe aparecer
      expect(screen.queryByText(/🚫 Pop-ups Bloqueados/i)).not.toBeInTheDocument();

      const whatsappButton = screen.getByRole('button', { name: /enviar reporte por whatsapp/i });
      await user.click(whatsappButton);

      // AHORA debe aparecer
      await waitFor(() => {
        expect(screen.getByText(/🚫 Pop-ups Bloqueados/i)).toBeInTheDocument();
      });
    });
  });
});
