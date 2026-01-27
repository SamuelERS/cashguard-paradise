// 🤖 [IA] - v1.1.0 - Tests unitarios para PinModal + validación SHA-256
// Previous: v1.0.0 - Tests básicos UI
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PinModal } from '../pin-modal';

describe('PinModal', () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('muestra modal cuando isOpen=true', () => {
    render(
      <PinModal
        isOpen={true}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
        isLocked={false}
        attempts={0}
        maxAttempts={3}
      />
    );
    
    expect(screen.getByText('PIN Supervisor Requerido')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ingrese PIN/i)).toBeInTheDocument();
  });

  it('muestra mensaje de bloqueo cuando isLocked=true', () => {
    render(
      <PinModal
        isOpen={true}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
        isLocked={true}
        attempts={3}
        maxAttempts={3}
      />
    );
    
    expect(screen.getByText('Acceso bloqueado')).toBeInTheDocument();
    expect(screen.getByText(/Reintente en 5 minutos/i)).toBeInTheDocument();
  });

  it('llama onCancel al clickear botón Cancelar', () => {
    render(
      <PinModal
        isOpen={true}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
        isLocked={false}
        attempts={0}
        maxAttempts={3}
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('muestra contador de intentos restantes', () => {
    render(
      <PinModal
        isOpen={true}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
        isLocked={false}
        attempts={1}
        maxAttempts={3}
      />
    );
    
    expect(screen.getByText(/Intentos restantes: 2/i)).toBeInTheDocument();
  });

  it('deshabilita botón Validar cuando PIN < 4 dígitos', () => {
    render(
      <PinModal
        isOpen={true}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
        isLocked={false}
        attempts={0}
        maxAttempts={3}
      />
    );
    
    const validateButton = screen.getByRole('button', { name: /Validar/i });
    expect(validateButton).toBeDisabled();
    
    const input = screen.getByPlaceholderText(/Ingrese PIN/i);
    fireEvent.change(input, { target: { value: '123' } });
    
    expect(validateButton).toBeDisabled();
  });

  it('habilita botón Validar cuando PIN >= 4 dígitos', () => {
    render(
      <PinModal
        isOpen={true}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
        isLocked={false}
        attempts={0}
        maxAttempts={3}
      />
    );
    
    const input = screen.getByPlaceholderText(/Ingrese PIN/i);
    fireEvent.change(input, { target: { value: '1234' } });
    
    const validateButton = screen.getByRole('button', { name: /Validar/i });
    expect(validateButton).not.toBeDisabled();
  });

  it('solo permite dígitos numéricos en input', () => {
    render(
      <PinModal
        isOpen={true}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
        isLocked={false}
        attempts={0}
        maxAttempts={3}
      />
    );
    
    const input = screen.getByPlaceholderText(/Ingrese PIN/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'abc123def' } });
    
    // Solo los dígitos deberían quedar
    expect(input.value).toBe('123');
  });

  it('limita PIN a máximo 6 dígitos', () => {
    render(
      <PinModal
        isOpen={true}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
        isLocked={false}
        attempts={0}
        maxAttempts={3}
      />
    );
    
    const input = screen.getByPlaceholderText(/Ingrese PIN/i) as HTMLInputElement;
    expect(input).toHaveAttribute('maxLength', '6');
  });

  it('muestra botón Volver cuando está bloqueado', () => {
    render(
      <PinModal
        isOpen={true}
        onSuccess={mockOnSuccess}
        onError={mockOnError}
        onCancel={mockOnCancel}
        isLocked={true}
        attempts={3}
        maxAttempts={3}
      />
    );

    const backButton = screen.getByRole('button', { name: /Volver/i });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  // 🤖 [IA] - v1.1.0: Tests de validación SHA-256 PIN hash
  describe('Validación SHA-256 PIN', () => {
    // Helper: generate SHA-256 hash matching the Web Crypto API flow
    const sha256 = async (text: string): Promise<string> => {
      const encoder = new TextEncoder();
      const data = encoder.encode(text);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    it('PIN "1234" genera hash SHA-256 correcto', async () => {
      const expectedHash = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';
      const hash = await sha256('1234');
      expect(hash).toBe(expectedHash);
    });

    it('PIN correcto "1234" llama onSuccess', async () => {
      render(
        <PinModal
          isOpen={true}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
          onCancel={mockOnCancel}
          isLocked={false}
          attempts={0}
          maxAttempts={3}
        />
      );

      const input = screen.getByPlaceholderText(/Ingrese PIN/i);
      fireEvent.change(input, { target: { value: '1234' } });

      const form = input.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
    });

    it('PIN incorrecto "9999" llama onError', async () => {
      render(
        <PinModal
          isOpen={true}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
          onCancel={mockOnCancel}
          isLocked={false}
          attempts={0}
          maxAttempts={3}
        />
      );

      const input = screen.getByPlaceholderText(/Ingrese PIN/i);
      fireEvent.change(input, { target: { value: '9999' } });

      const form = input.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });
    });

    it('PIN limpia input después de validación exitosa', async () => {
      render(
        <PinModal
          isOpen={true}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
          onCancel={mockOnCancel}
          isLocked={false}
          attempts={0}
          maxAttempts={3}
        />
      );

      const input = screen.getByPlaceholderText(/Ingrese PIN/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: '1234' } });

      const form = input.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      }, { timeout: 3000 });

      // Input should be cleared after success
      expect(input.value).toBe('');
    });

    it('no permite submit cuando bloqueado', async () => {
      render(
        <PinModal
          isOpen={true}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
          onCancel={mockOnCancel}
          isLocked={true}
          attempts={3}
          maxAttempts={3}
        />
      );

      // Locked state shows different UI - no form/input
      expect(screen.getByText('Acceso bloqueado')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText(/Ingrese PIN/i)).not.toBeInTheDocument();
    });
  });
});
