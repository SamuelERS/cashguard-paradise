// 🤖 [IA] - v1.0.0 - Tests unitarios para PinModal
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
});
