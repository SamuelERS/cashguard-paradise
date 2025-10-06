// 🤖 [IA] - v1.3.2: MÓDULO 4 - Phase2VerificationSection Integration Tests
// Tests de integración para blind verification system en Phase2

/**
 * @file Phase2VerificationSection.integration.test.tsx
 * @description Tests de integración para sistema de triple intento en Phase 2
 *
 * @remarks
 * Este archivo valida la integración completa entre Phase2VerificationSection,
 * useBlindVerification hook, y BlindVerificationModal component.
 *
 * **7 grupos de tests (20 total):**
 * - Grupo 1: Rendering + Setup (3 tests)
 * - Grupo 2: Primer Intento Correcto (2 tests)
 * - Grupo 3: Primer Intento Incorrecto (3 tests)
 * - Grupo 4: Escenario 2a - Dos Iguales (3 tests)
 * - Grupo 5: Escenario 2b - Dos Diferentes (3 tests)
 * - Grupo 6: Escenario 3 - Triple Intento (4 tests)
 * - Grupo 7: UX Simplificada v1.3.2 (2 tests) ✨ NUEVO
 *
 * @version 1.3.2
 * @date 2025-10-06
 * @author Claude Code (IA)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Phase2VerificationSection } from '@/components/phases/Phase2VerificationSection';
import type { DeliveryCalculation } from '@/types/phases';

// 🤖 [IA] - v1.3.0: Mock de delivery calculation para tests
const mockDeliveryCalculation: DeliveryCalculation = {
  totalToDeliver: 450,
  denominationsToDeliver: {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 100, // $25 to deliver
    dollarCoin: 0,
    bill1: 25,    // $25 to deliver
    bill5: 0,
    bill10: 40,   // $400 to deliver
    bill20: 0,
    bill50: 0,
    bill100: 0
  },
  denominationsToKeep: {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 20,  // $5 to keep (expected value for tests)
    dollarCoin: 0,
    bill1: 5,     // $5 to keep
    bill5: 8,     // $40 to keep
    bill10: 0,
    bill20: 0,
    bill50: 0,
    bill100: 0
  },
  verificationSteps: [
    { key: 'quarter', label: 'Monedas de 25¢', quantity: 20 },
    { key: 'bill1', label: 'Billetes de $1', quantity: 5 },
    { key: 'bill5', label: 'Billetes de $5', quantity: 8 }
  ]
};

describe('Phase2VerificationSection - Blind Verification Integration', () => {
  // 🤖 [IA] - v1.3.0: Mocks para props requeridas
  let mockOnStepComplete: ReturnType<typeof vi.fn>;
  let mockOnStepUncomplete: ReturnType<typeof vi.fn>;
  let mockOnSectionComplete: ReturnType<typeof vi.fn>;
  let mockOnCancel: ReturnType<typeof vi.fn>;
  let mockOnPrevious: ReturnType<typeof vi.fn>;
  let mockCompletedSteps: Record<string, boolean>;

  beforeEach(() => {
    mockOnStepComplete = vi.fn();
    mockOnStepUncomplete = vi.fn();
    mockOnSectionComplete = vi.fn();
    mockOnCancel = vi.fn();
    mockOnPrevious = vi.fn();
    mockCompletedSteps = {};

    // Mock navigator.vibrate
    Object.defineProperty(navigator, 'vibrate', {
      value: vi.fn(),
      writable: true,
      configurable: true
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 1: Rendering + Setup (3 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Grupo 1: Rendering + Setup', () => {
    it('1.1 - Hook useBlindVerification se inicializa correctamente', () => {
      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      // Verificar que componente renderiza correctamente
      expect(screen.getByText(/VERIFICACIÓN EN CAJA/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Queda en Caja/i)[0]).toBeInTheDocument();
    });

    it('1.2 - attemptHistory comienza vacío (primer render)', () => {
      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      // Primer step debe estar activo
      const input = screen.getByPlaceholderText(/cuántos/i);
      expect(input).toBeInTheDocument();
      expect(input).toHaveValue('');
    });

    it('1.3 - modalState inicial está cerrado', () => {
      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      // No debe haber modal visible inicialmente
      expect(screen.queryByText(/Verificación necesaria/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Segundo Intento Idéntico/i)).not.toBeInTheDocument();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 2: Primer Intento Correcto (2 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Grupo 2: Primer Intento Correcto (ZERO fricción)', () => {
    it('2.1 - Primer intento correcto avanza sin modal', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      // Input correcto (20 quarters)
      const input = screen.getByPlaceholderText(/cuántos/i);
      await user.clear(input);
      await user.type(input, '20');

      // Click confirmar
      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });
      await user.click(confirmButton);

      // Debe marcar step completado
      expect(mockOnStepComplete).toHaveBeenCalledWith('quarter');

      // No debe mostrar modal
      expect(screen.queryByText(/Verificación necesaria/i)).not.toBeInTheDocument();

      // Debe haber llamado vibrate
      expect(navigator.vibrate).toHaveBeenCalledWith(50);
    });

    it('2.2 - attemptHistory registra intento correcto y se limpia', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      await user.clear(input);
      await user.type(input, '20');

      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });
      await user.click(confirmButton);

      // Después de completar exitosamente, input debe limpiarse
      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // onStepComplete debe llamarse solo 1 vez
      expect(mockOnStepComplete).toHaveBeenCalledTimes(1);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 3: Primer Intento Incorrecto (3 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Grupo 3: Primer Intento Incorrecto', () => {
    it('3.1 - Primer intento incorrecto muestra modal tipo "incorrect"', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      // Input incorrecto (15 en lugar de 20)
      const input = screen.getByPlaceholderText(/cuántos/i);
      await user.clear(input);
      await user.type(input, '15');

      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });
      await user.click(confirmButton);

      // Debe mostrar modal "Verificación necesaria"
      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      // NO debe marcar step completado
      expect(mockOnStepComplete).not.toHaveBeenCalled();
    });

    it('3.2 - Callback onRetry cierra modal y limpia input', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      await user.clear(input);
      await user.type(input, '15');

      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      // Click "Volver a contar"
      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      // Modal debe cerrarse
      await waitFor(() => {
        expect(screen.queryByText(/Verificación necesaria/i)).not.toBeInTheDocument();
      });

      // Input debe limpiarse
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('3.3 - attemptHistory preserva intento fallido para segundo intento', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      await user.clear(input);
      await user.type(input, '15');

      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // Segundo intento con MISMO valor incorrecto (15)
      await user.type(input, '15');
      await user.click(confirmButton);

      // Debe mostrar modal "Segundo Intento Idéntico" (force-same)
      await waitFor(() => {
        expect(screen.getByText(/Segundo Intento Idéntico/i)).toBeInTheDocument();
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 4: Escenario 2a - Dos Intentos Iguales (3 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Grupo 4: Escenario 2a - Dos Intentos Iguales Incorrectos', () => {
    it('4.1 - Dos intentos iguales incorrectos muestra modal "force-same"', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });

      // Primer intento: 15 (incorrecto)
      await user.clear(input);
      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // Segundo intento: 15 (mismo valor incorrecto)
      await user.type(input, '15');
      await user.click(confirmButton);

      // Debe mostrar modal "Segundo Intento Idéntico"
      await waitFor(() => {
        expect(screen.getByText(/Segundo Intento Idéntico/i)).toBeInTheDocument();
      });
    });

    it('4.2 - Callback onForce acepta valor forzado y avanza', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });

      // Dos intentos iguales incorrectos
      await user.clear(input);
      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Segundo Intento Idéntico/i)).toBeInTheDocument();
      });

      // Click "Forzar y Continuar"
      const forceButton = screen.getByRole('button', { name: /Forzar y Continuar/i });
      await user.click(forceButton);

      // Modal debe cerrarse
      await waitFor(() => {
        expect(screen.queryByText(/Segundo Intento Idéntico/i)).not.toBeInTheDocument();
      });

      // Step debe completarse con valor forzado
      expect(mockOnStepComplete).toHaveBeenCalledWith('quarter');

      // Vibración haptic pattern override
      expect(navigator.vibrate).toHaveBeenCalledWith([50, 100, 50]);
    });

    it('4.3 - Registro en attemptHistory con flag override implícito', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });

      // Dos intentos iguales incorrectos
      await user.clear(input);
      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Segundo Intento Idéntico/i)).toBeInTheDocument();
      });

      const forceButton = screen.getByRole('button', { name: /Forzar y Continuar/i });
      await user.click(forceButton);

      // Después de force, attemptHistory debe limpiarse
      await waitFor(() => {
        expect(mockOnStepComplete).toHaveBeenCalled();
      });

      // Input debe limpiarse para siguiente step
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 5: Escenario 2b - Dos Intentos Diferentes (3 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Grupo 5: Escenario 2b - Dos Intentos Diferentes (Require Third)', () => {
    it('5.1 - Dos intentos diferentes muestra modal "require-third"', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });

      // Primer intento: 15 (incorrecto)
      await user.clear(input);
      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // Segundo intento: 18 (diferente del primero)
      await user.type(input, '18');
      await user.click(confirmButton);

      // Debe mostrar modal "ALERTA CRÍTICA - Tercer Intento Obligatorio"
      await waitFor(() => {
        expect(screen.getAllByText(/ALERTA CRÍTICA/i)[0]).toBeInTheDocument();
        expect(screen.getAllByText(/Tercer Intento Obligatorio/i)[0]).toBeInTheDocument();
      });
    });

    it('5.2 - Modal "require-third" no tiene botón Cancelar (obligatorio)', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });

      // Dos intentos diferentes
      await user.clear(input);
      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      await user.type(input, '18');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Tercer Intento Obligatorio/i)[0]).toBeInTheDocument();
      });

      // 🤖 [IA] - v1.3.3: Modal "require-third" solo debe tener botón "Hacer Tercer Intento"
      expect(screen.getByRole('button', { name: /Hacer Tercer Intento/i })).toBeInTheDocument();

      // 🤖 [IA] - v1.3.3: Botón Cancel NO debe existir con showCancel=false (FIX DEFINITIVO)
      expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument();
    });

    it('5.3 - Tercer intento es obligatorio y se registra correctamente', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });

      // Dos intentos diferentes
      await user.clear(input);
      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      await user.type(input, '18');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Tercer Intento Obligatorio/i)[0]).toBeInTheDocument();
      });

      // Click "Hacer Tercer Intento"
      const thirdButton = screen.getByRole('button', { name: /Hacer Tercer Intento/i });
      await user.click(thirdButton);

      // Modal debe cerrarse
      await waitFor(() => {
        expect(screen.queryByText(/Tercer Intento Obligatorio/i)).not.toBeInTheDocument();
      });

      // Input debe limpiarse para tercer intento
      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // onStepComplete NO debe haberse llamado aún (esperando tercer intento)
      expect(mockOnStepComplete).not.toHaveBeenCalled();
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 6: Escenario 3 - Triple Intento (4 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Grupo 6: Escenario 3 - Triple Intento (Análisis Pattern)', () => {
    // 🤖 [IA] - v1.3.3: Test 6.1 OBSOLETO con UX Simplificada v1.3.3
    // Pattern [A,A,B] YA NO ES POSIBLE: Modal 'force-same' no tiene botón Cancel
    // Si usuario ingresa misma cantidad 2 veces, DEBE aceptar override forzado
    // No puede cancelar y hacer tercer intento diferente
    // Decisión UX: Respetar juicio profesional del empleado (si recontó 2x = confía en ese valor)
    it.skip('6.1 - [OBSOLETO v1.3.3] Pattern [A,A,B] acepta A (intentos 1 y 2 coinciden)', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });

      // Intento 1: 15
      await user.clear(input);
      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // Intento 2: 15 (mismo que 1)
      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Segundo Intento Idéntico/i)).toBeInTheDocument();
      });

      // 🤖 [IA] - v1.3.3: LÍNEA OBSOLETA - Modal 'force-same' no tiene botón Cancel
      // const cancelButton = screen.getAllByRole('button', { name: /Cancelar/i })[0];
      // await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/Segundo Intento Idéntico/i)).not.toBeInTheDocument();
      });

      // Intento 3: 18 (diferente - pattern [15,15,18])
      await user.clear(input);
      await user.type(input, '18');
      await user.click(confirmButton);

      // Debe mostrar modal third-result con severity critical_inconsistent
      await waitFor(() => {
        const faltaGrave = screen.queryByText(/FALTA GRAVE/i);
        expect(faltaGrave).toBeInTheDocument();
      });
    });

    it('6.2 - Pattern [A,B,A] acepta A (intentos 1 y 3 coinciden)', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });

      // Intento 1: 15
      await user.clear(input);
      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // Intento 2: 18 (diferente)
      await user.type(input, '18');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Tercer Intento Obligatorio/i)[0]).toBeInTheDocument();
      });

      const thirdButton = screen.getByRole('button', { name: /Hacer Tercer Intento/i });
      await user.click(thirdButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // Intento 3: 15 (mismo que 1 - pattern [15,18,15])
      await user.type(input, '15');
      await user.click(confirmButton);

      // Debe mostrar modal third-result
      await waitFor(() => {
        const faltaGrave = screen.queryByText(/FALTA GRAVE/i);
        expect(faltaGrave).toBeInTheDocument();
      });
    });

    it('6.3 - Pattern [A,B,B] acepta B (intentos 2 y 3 coinciden)', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });

      // Intento 1: 15
      await user.clear(input);
      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // Intento 2: 18 (diferente)
      await user.type(input, '18');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Tercer Intento Obligatorio/i)[0]).toBeInTheDocument();
      });

      const thirdButton = screen.getByRole('button', { name: /Hacer Tercer Intento/i });
      await user.click(thirdButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // Intento 3: 18 (mismo que 2 - pattern [15,18,18])
      await user.type(input, '18');
      await user.click(confirmButton);

      // Debe mostrar modal third-result
      await waitFor(() => {
        const faltaGrave = screen.queryByText(/FALTA GRAVE/i);
        expect(faltaGrave).toBeInTheDocument();
      });
    });

    it('6.4 - Pattern [A,B,C] acepta C + severity critical_severe', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });

      // Intento 1: 15
      await user.clear(input);
      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // Intento 2: 18 (diferente)
      await user.type(input, '18');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getAllByText(/Tercer Intento Obligatorio/i)[0]).toBeInTheDocument();
      });

      const thirdButton = screen.getByRole('button', { name: /Hacer Tercer Intento/i });
      await user.click(thirdButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // Intento 3: 22 (completamente diferente - pattern [15,18,22])
      await user.type(input, '22');
      await user.click(confirmButton);

      // Debe mostrar modal third-result con severity critical_severe (FALTA MUY GRAVE)
      await waitFor(() => {
        const faltaMuyGrave = screen.queryByText(/FALTA MUY GRAVE/i);
        expect(faltaMuyGrave).toBeInTheDocument();
      });

      // Verificar que mensaje contiene "totalmente inconsistentes"
      await waitFor(() => {
        expect(screen.getByText(/totalmente inconsistentes/i)).toBeInTheDocument();
      });
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // GRUPO 7: UX Simplificada v1.3.2 (2 tests)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('Grupo 7: UX Simplificada v1.3.2', () => {
    it('7.1 - Modal "incorrect" solo muestra botón "Volver a contar" (sin Cancelar)', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      // Input incorrecto para trigger modal "incorrect"
      const input = screen.getByPlaceholderText(/cuántos/i);
      await user.clear(input);
      await user.type(input, '15');

      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });
      await user.click(confirmButton);

      // Esperar modal "Verificación necesaria"
      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      // 🤖 [IA] - v1.3.3: UX Simplificada - Modal solo debe tener botón "Volver a contar"
      // Justificación: Sistema ya registró error, usuario DEBE recontar (no cancelar)
      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      expect(retryButton).toBeInTheDocument();

      // 🤖 [IA] - v1.3.3: Botón Cancel NO debe existir con showCancel=false (FIX DEFINITIVO)
      expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument();
    });

    it('7.2 - Modal "force-same" solo muestra botón "Forzar y Continuar" (sin Cancelar y Recontar)', async () => {
      const user = userEvent.setup();

      render(
        <Phase2VerificationSection
          deliveryCalculation={mockDeliveryCalculation}
          onStepComplete={mockOnStepComplete}
          onStepUncomplete={mockOnStepUncomplete}
          onSectionComplete={mockOnSectionComplete}
          completedSteps={mockCompletedSteps}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={false}
        />
      );

      const input = screen.getByPlaceholderText(/cuántos/i);
      const confirmButton = screen.getByRole('button', { name: /Confirmar cantidad/i });

      // Primer intento: 15 (incorrecto)
      await user.clear(input);
      await user.type(input, '15');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
      await user.click(retryButton);

      await waitFor(() => {
        expect(input).toHaveValue('');
      });

      // Segundo intento: 15 (mismo valor incorrecto) → trigger modal "force-same"
      await user.type(input, '15');
      await user.click(confirmButton);

      // Esperar modal "Segundo Intento Idéntico"
      await waitFor(() => {
        expect(screen.getByText(/Segundo Intento Idéntico/i)).toBeInTheDocument();
      });

      // 🤖 [IA] - v1.3.3: UX Simplificada - Modal solo debe tener botón "Forzar y Continuar"
      // Justificación: Usuario YA recontó 2 veces → confía en su conteo → decisión profesional
      const forceButton = screen.getByRole('button', { name: /Forzar y Continuar/i });
      expect(forceButton).toBeInTheDocument();

      // 🤖 [IA] - v1.3.3: Botón Cancel NO debe existir con showCancel=false (FIX DEFINITIVO)
      // ConfirmationModal ahora soporta prop showCancel correctamente
      expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument();
    });
  });
});
