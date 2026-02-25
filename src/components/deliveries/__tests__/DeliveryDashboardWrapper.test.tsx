// 🤖 [IA] - v1.1.0 - Tests: onGoBack callback prop replaces useNavigate/useOperationMode mocks
// Previous: v1.0.1 - Tests integración DeliveryDashboardWrapper: PIN modal + navegación + lockout persistence
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DeliveryDashboardWrapper } from '../DeliveryDashboardWrapper';

// Mock DeliveryDashboard (heavy component, not needed for wrapper tests)
vi.mock('../DeliveryDashboard', () => ({
  DeliveryDashboard: () => <div data-testid="delivery-dashboard">Dashboard Content</div>,
}));

vi.mock('../DeliveryManager', () => ({
  DeliveryManager: () => <div data-testid="delivery-management">Management Content</div>,
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const LOCKOUT_KEY = 'delivery_pin_lockout';
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const VALID_HASH = 'a819d9c7e7e38df73f5609df41a7fd29fe48dc01410cbc52d51bab2d4973d429';

const mockOnGoBack = vi.fn();

const hexToBuffer = (hex: string): ArrayBuffer => {
  const bytes = hex.match(/.{1,2}/g)?.map((byte) => Number.parseInt(byte, 16)) ?? [];
  return new Uint8Array(bytes).buffer;
};

const renderWrapper = (props?: { requirePin?: boolean; onGoBack?: () => void }) => {
  return render(
    <MemoryRouter>
      <DeliveryDashboardWrapper onGoBack={mockOnGoBack} {...props} />
    </MemoryRouter>
  );
};

describe('DeliveryDashboardWrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 🤖 [IA] - v1.0.1: Working localStorage mock backed by in-memory store
    // setup.ts defines localStorage methods as vi.fn() that don't actually store data.
    // We override with implementations that read/write to a real store object.
    const store: Record<string, string> = {};
    Object.assign(localStorage, {
      getItem: vi.fn((key: string): string | null => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => { store[key] = String(value); }),
      removeItem: vi.fn((key: string) => { delete store[key]; }),
      clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Restore real timers in case a test used vi.useFakeTimers()
    vi.useRealTimers();
  });

  // 🤖 [IA] - v1.0.1: NO fake timers globally.
  // crypto.subtle.digest() is Promise-based. vi.useFakeTimers() replaces setTimeout
  // which breaks waitFor() internal polling → tests that submit PINs timeout at 60s.
  // Only the auto-unlock test uses vi.useFakeTimers() (it doesn't need crypto).

  describe('PIN Modal Integration', () => {
    it('muestra PIN modal al cargar con requirePin=true', () => {
      renderWrapper();

      expect(screen.getByText('PIN Supervisor Requerido')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ingrese PIN/i)).toBeInTheDocument();
    });

    it('muestra dashboard directamente con requirePin=false', () => {
      renderWrapper({ requirePin: false });

      expect(screen.getByTestId('delivery-dashboard')).toBeInTheDocument();
      expect(screen.queryByText('PIN Supervisor Requerido')).not.toBeInTheDocument();
    });

    it('muestra dashboard después de PIN correcto', async () => {
      vi.spyOn(crypto.subtle, 'digest').mockResolvedValue(hexToBuffer(VALID_HASH));
      renderWrapper();

      const input = screen.getByPlaceholderText(/Ingrese PIN/i);
      fireEvent.change(input, { target: { value: 'TEST_AUTH_OK' } });

      const form = input.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dashboard')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('incrementa intentos fallidos en PIN incorrecto', async () => {
      renderWrapper();

      const input = screen.getByPlaceholderText(/Ingrese PIN/i);
      fireEvent.change(input, { target: { value: '9999' } });

      const form = input.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(screen.getByText(/Intentos restantes: 2/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Navegación Cancel/Back', () => {
    it('botón Cancelar llama onGoBack callback', () => {
      renderWrapper();

      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      fireEvent.click(cancelButton);

      expect(mockOnGoBack).toHaveBeenCalledTimes(1);
    });

    it('botón Volver a Operaciones navega a / después de PIN válido', async () => {
      vi.spyOn(crypto.subtle, 'digest').mockResolvedValue(hexToBuffer(VALID_HASH));
      renderWrapper();

      // First, authenticate
      const input = screen.getByPlaceholderText(/Ingrese PIN/i);
      fireEvent.change(input, { target: { value: 'TEST_AUTH_OK' } });
      const form = input.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dashboard')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Now click "Volver a Operaciones"
      const backButton = screen.getByRole('button', { name: /Volver a Operaciones/i });
      fireEvent.click(backButton);

      expect(mockOnGoBack).toHaveBeenCalledTimes(1);
    });

    it('limpia lockout localStorage al navegar atrás', () => {
      // Set up an active lockout
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify({
        timestamp: Date.now(),
        attempts: 3,
      }));

      renderWrapper();

      // Should show locked state with "Volver" button
      const backButton = screen.getByRole('button', { name: /Volver/i });
      fireEvent.click(backButton);

      // localStorage should be cleared
      expect(localStorage.getItem(LOCKOUT_KEY)).toBeNull();
    });

    it('permite navegar tabs con teclado (ArrowRight/ArrowLeft)', () => {
      renderWrapper({ requirePin: false });

      const tablist = screen.getByRole('tablist');
      const dashboardTab = screen.getByRole('tab', { name: /Dashboard/i });
      const managementTab = screen.getByRole('tab', { name: /Gestión/i });

      expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.queryByTestId('delivery-management')).not.toBeInTheDocument();

      dashboardTab.focus();
      fireEvent.keyDown(tablist, { key: 'ArrowRight' });

      expect(managementTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('delivery-management')).toBeInTheDocument();

      fireEvent.keyDown(tablist, { key: 'ArrowLeft' });

      expect(dashboardTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('delivery-dashboard')).toBeInTheDocument();
    });
  });

  describe('Lockout Persistence (localStorage)', () => {
    it('bloquea después de 3 intentos fallidos', async () => {
      renderWrapper();

      for (let i = 0; i < 3; i++) {
        const input = screen.getByPlaceholderText(/Ingrese PIN/i);
        fireEvent.change(input, { target: { value: '0000' } });
        const form = input.closest('form');
        if (form) {
          fireEvent.submit(form);
        }

        if (i < 2) {
          // Wait for error to process before next attempt
          await waitFor(() => {
            expect(screen.getByText(new RegExp(`Intentos restantes: ${2 - i}`, 'i'))).toBeInTheDocument();
          }, { timeout: 3000 });
        }
      }

      await waitFor(() => {
        expect(screen.getByText('Acceso bloqueado')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('persiste lockout en localStorage al bloquear', async () => {
      renderWrapper();

      for (let i = 0; i < 3; i++) {
        const input = screen.getByPlaceholderText(/Ingrese PIN/i);
        fireEvent.change(input, { target: { value: '0000' } });
        const form = input.closest('form');
        if (form) {
          fireEvent.submit(form);
        }

        if (i < 2) {
          await waitFor(() => {
            expect(screen.getByText(new RegExp(`Intentos restantes: ${2 - i}`, 'i'))).toBeInTheDocument();
          }, { timeout: 3000 });
        }
      }

      await waitFor(() => {
        expect(screen.getByText('Acceso bloqueado')).toBeInTheDocument();
      }, { timeout: 3000 });

      // Verify localStorage has lockout data
      const lockoutData = localStorage.getItem(LOCKOUT_KEY);
      expect(lockoutData).not.toBeNull();

      const parsed = JSON.parse(lockoutData!);
      expect(parsed).toHaveProperty('timestamp');
      expect(parsed).toHaveProperty('attempts', 3);
    });

    it('restaura lockout desde localStorage al montar', () => {
      // Simulate an active lockout stored from a previous session
      const lockoutData = {
        timestamp: Date.now(),
        attempts: 3,
      };
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify(lockoutData));

      renderWrapper();

      expect(screen.getByText('Acceso bloqueado')).toBeInTheDocument();
      expect(screen.getByText(/Reintente en 5 minutos/i)).toBeInTheDocument();
    });

    it('no restaura lockout expirado desde localStorage', () => {
      // Simulate an expired lockout (>5 minutes ago)
      const lockoutData = {
        timestamp: Date.now() - LOCKOUT_DURATION - 1000,
        attempts: 3,
      };
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify(lockoutData));

      renderWrapper();

      // Should show normal PIN input, not locked state
      expect(screen.queryByText('Acceso bloqueado')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ingrese PIN/i)).toBeInTheDocument();

      // Expired lockout should be cleaned from localStorage
      expect(localStorage.getItem(LOCKOUT_KEY)).toBeNull();
    });

    it('desbloquea automáticamente después de 5 minutos', () => {
      // 🤖 [IA] - v1.0.1: Fake timers ONLY for this test (no crypto.subtle needed here)
      vi.useFakeTimers();

      // Set up active lockout
      const lockoutData = {
        timestamp: Date.now(),
        attempts: 3,
      };
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify(lockoutData));

      renderWrapper();
      expect(screen.getByText('Acceso bloqueado')).toBeInTheDocument();

      // Advance time by 5 minutes
      act(() => {
        vi.advanceTimersByTime(LOCKOUT_DURATION);
      });

      // Should now show PIN input again
      expect(screen.queryByText('Acceso bloqueado')).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ingrese PIN/i)).toBeInTheDocument();

      // localStorage should be cleaned
      expect(localStorage.getItem(LOCKOUT_KEY)).toBeNull();
    });

    it('limpia lockout de localStorage al validar PIN exitosamente', async () => {
      vi.spyOn(crypto.subtle, 'digest').mockResolvedValue(hexToBuffer(VALID_HASH));
      renderWrapper();

      const input = screen.getByPlaceholderText(/Ingrese PIN/i);
      fireEvent.change(input, { target: { value: 'TEST_AUTH_OK' } });
      const form = input.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(screen.getByTestId('delivery-dashboard')).toBeInTheDocument();
      }, { timeout: 3000 });

      expect(localStorage.getItem(LOCKOUT_KEY)).toBeNull();
    });

    it('maneja datos corruptos en localStorage sin crash', () => {
      localStorage.setItem(LOCKOUT_KEY, 'invalid-json-{{{');

      // Should not throw - renders normally
      expect(() => renderWrapper()).not.toThrow();
      expect(screen.getByPlaceholderText(/Ingrese PIN/i)).toBeInTheDocument();

      // Corrupted data should be cleaned
      expect(localStorage.getItem(LOCKOUT_KEY)).toBeNull();
    });
  });
});
