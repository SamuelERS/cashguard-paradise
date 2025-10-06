// 🤖 [IA] - v1.3.0: MÓDULO 3 - Tests BlindVerificationModal
// Suite de tests para componente adaptador de verificación ciega
// Cobertura: 20 tests (rendering + interacción + props + accesibilidad + edge cases)

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BlindVerificationModal } from '@/components/verification/BlindVerificationModal';
import type { ThirdAttemptResult } from '@/types/verification';

/**
 * 🎯 TEST STRATEGY MÓDULO 3:
 *
 * Grupo 1: Rendering Básico (5 tests)
 * - Verificar renderizado correcto de cada tipo de modal
 *
 * Grupo 2: Interacción Botones (6 tests)
 * - Validar callbacks y visibilidad de botones
 *
 * Grupo 3: Props Condicionales (4 tests)
 * - Verificar texto dinámico y props opcionales
 *
 * Grupo 4: Accesibilidad WCAG 2.1 (3 tests)
 * - Validar roles ARIA y labels descriptivos
 *
 * Grupo 5: Edge Cases (2 tests)
 * - Manejo de props undefined/null
 */

// 🤖 [IA] - v1.3.0: Mocks de handlers
const mockOnRetry = vi.fn();
const mockOnForce = vi.fn();
const mockOnAcceptThird = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
});

// 🤖 [IA] - v1.3.0: Helper para crear ThirdAttemptResult
const createThirdAttemptResult = (
  overrides: Partial<ThirdAttemptResult> = {}
): ThirdAttemptResult => ({
  acceptedValue: 8,
  severity: 'critical_inconsistent',
  reason: 'Intentos 1 y 3 coinciden (8). Intento 2 fue erróneo (12).',
  attempts: [8, 12, 8],
  ...overrides
});

describe('🔷 BlindVerificationModal - Grupo 1: Rendering Básico', () => {
  it('1.1 - Renderiza modal con type="incorrect"', () => {
    render(
      <BlindVerificationModal
        type="incorrect"
        isOpen={true}
        stepLabel="Monedas de 25¢"
        onRetry={mockOnRetry}
      />
    );

    // v1.3.5b: Texto final usuario sin emojis
    expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
    expect(screen.getByText(/Repite el conteo para confirmar la cantidad/i)).toBeInTheDocument();
  });

  it('1.2 - Renderiza modal con type="force-same"', () => {
    render(
      <BlindVerificationModal
        type="force-same"
        isOpen={true}
        stepLabel="Monedas de 10¢"
        onRetry={mockOnRetry}
        onForce={mockOnForce}
      />
    );

    expect(screen.getByText(/Segundo Intento Idéntico/i)).toBeInTheDocument();
    expect(screen.getByText(/la misma cantidad/i)).toBeInTheDocument();
    expect(screen.getByText(/Monedas de 10¢/i)).toBeInTheDocument();
  });

  it('1.3 - Renderiza modal con type="require-third"', () => {
    render(
      <BlindVerificationModal
        type="require-third"
        isOpen={true}
        stepLabel="Monedas de 5¢"
        onRetry={mockOnRetry}
      />
    );

    expect(screen.getByText(/ALERTA CRÍTICA/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Tercer Intento Obligatorio/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/montos DIFERENTES/i)).toBeInTheDocument();
    expect(screen.getByText(/Monedas de 5¢/i)).toBeInTheDocument();
  });

  it('1.4 - Renderiza modal con type="third-result" (critical_inconsistent)', () => {
    const analysis = createThirdAttemptResult({
      severity: 'critical_inconsistent'
    });

    render(
      <BlindVerificationModal
        type="third-result"
        isOpen={true}
        stepLabel="Monedas de 1¢"
        onRetry={mockOnRetry}
        onAcceptThird={mockOnAcceptThird}
        thirdAttemptAnalysis={analysis}
      />
    );

    expect(screen.getByText(/FALTA GRAVE/i)).toBeInTheDocument();
    expect(screen.getByText(/Intentos 1 y 3 coinciden/i)).toBeInTheDocument();
  });

  it('1.5 - Renderiza modal con type="third-result" (critical_severe)', () => {
    const analysis = createThirdAttemptResult({
      severity: 'critical_severe',
      reason: '3 intentos totalmente diferentes (8, 12, 15)',
      attempts: [8, 12, 15],
      acceptedValue: 15
    });

    render(
      <BlindVerificationModal
        type="third-result"
        isOpen={true}
        stepLabel="Billetes de $1"
        onRetry={mockOnRetry}
        onAcceptThird={mockOnAcceptThird}
        thirdAttemptAnalysis={analysis}
      />
    );

    expect(screen.getByText(/FALTA MUY GRAVE/i)).toBeInTheDocument();
    expect(screen.getByText(/3 intentos totalmente diferentes/i)).toBeInTheDocument();
  });
});

describe('🔷 BlindVerificationModal - Grupo 2: Interacción Botones', () => {
  it('2.1 - Botón "Volver a contar" llama onRetry (type=incorrect) [v1.3.5]', async () => {
    const user = userEvent.setup();
    render(
      <BlindVerificationModal
        type="incorrect"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
      />
    );

    const retryButton = screen.getByRole('button', { name: /Volver a contar/i });
    await user.click(retryButton);

    // ConfirmationModal llama onRetry desde handleConfirm + desde onCancel al cerrar
    expect(mockOnRetry).toHaveBeenCalled();
    expect(mockOnRetry).toHaveBeenCalledTimes(2);
  });

  it('2.2 - Botón "Forzar y Continuar" llama onForce (type=force-same)', async () => {
    const user = userEvent.setup();
    render(
      <BlindVerificationModal
        type="force-same"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
        onForce={mockOnForce}
      />
    );

    const forceButton = screen.getByRole('button', { name: /Forzar y Continuar/i });
    await user.click(forceButton);

    expect(mockOnForce).toHaveBeenCalledTimes(1);
  });

  it('2.3 - Botón "Hacer Tercer Intento" llama onRetry (type=require-third)', async () => {
    const user = userEvent.setup();
    render(
      <BlindVerificationModal
        type="require-third"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
      />
    );

    const thirdAttemptButton = screen.getByRole('button', { name: /Hacer Tercer Intento/i });
    await user.click(thirdAttemptButton);

    // ConfirmationModal llama onRetry desde handleConfirm + desde onCancel al cerrar
    expect(mockOnRetry).toHaveBeenCalled();
    expect(mockOnRetry).toHaveBeenCalledTimes(2);
  });

  it('2.4 - Botón "Aceptar y Continuar" llama onAcceptThird (type=third-result)', async () => {
    const user = userEvent.setup();
    const analysis = createThirdAttemptResult();

    render(
      <BlindVerificationModal
        type="third-result"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
        onAcceptThird={mockOnAcceptThird}
        thirdAttemptAnalysis={analysis}
      />
    );

    const acceptButton = screen.getByRole('button', { name: /Aceptar y Continuar/i });
    await user.click(acceptButton);

    expect(mockOnAcceptThird).toHaveBeenCalledTimes(1);
  });

  it('2.5 - showCancel=false en incorrect y force-same (UX simplificada v1.3.3 - FIX DEFINITIVO)', () => {
    const { rerender } = render(
      <BlindVerificationModal
        type="incorrect"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
      />
    );

    // 🤖 [IA] - v1.3.3: ConfirmationModal ahora soporta showCancel prop - botón Cancel NO renderizado
    // Verificamos que botón Cancel NO existe cuando showCancel=false
    expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument();

    // v1.3.5: Botón principal "Volver a contar" debe estar visible
    expect(screen.getByRole('button', { name: /Volver a contar/i })).toBeInTheDocument();

    // Re-render con type="force-same"
    rerender(
      <BlindVerificationModal
        type="force-same"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
        onForce={mockOnForce}
      />
    );

    // 🤖 [IA] - v1.3.3: Mismo comportamiento para force-same (showCancel=false)
    expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument();

    // Botón principal "Forzar y Continuar" debe estar visible
    expect(screen.getByRole('button', { name: /Forzar y Continuar/i })).toBeInTheDocument();
  });

  it('2.6 - showCancel=false en require-third y third-result (UX simplificada v1.3.3 - FIX DEFINITIVO)', () => {
    const { rerender } = render(
      <BlindVerificationModal
        type="require-third"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
      />
    );

    // 🤖 [IA] - v1.3.3: ConfirmationModal ahora soporta showCancel prop - botón Cancel NO renderizado
    // Modales NO cancelables: require-third y third-result solo muestran botón acción primaria
    expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Hacer Tercer Intento/i })).toBeInTheDocument();

    // Re-render con type="third-result"
    const analysis = createThirdAttemptResult();
    rerender(
      <BlindVerificationModal
        type="third-result"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
        onAcceptThird={mockOnAcceptThird}
        thirdAttemptAnalysis={analysis}
      />
    );

    // 🤖 [IA] - v1.3.3: Mismo comportamiento para third-result - botón Cancel NO renderizado
    expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aceptar y Continuar/i })).toBeInTheDocument();
  });
});

describe('🔷 BlindVerificationModal - Grupo 3: Props Condicionales', () => {
  // v1.3.5b: Test 3.1 removido - nueva description NO incluye stepLabel (mensaje genérico)

  it('3.2 - warningText se muestra (type=force-same)', () => {
    render(
      <BlindVerificationModal
        type="force-same"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
        onForce={mockOnForce}
      />
    );

    expect(screen.getByText(/Esta acción quedará registrada en el reporte/i)).toBeInTheDocument();
  });

  it('3.3 - thirdAttemptAnalysis.reason se muestra (type=third-result)', () => {
    const customReason = 'Razón de análisis custom para test';
    const analysis = createThirdAttemptResult({
      reason: customReason
    });

    render(
      <BlindVerificationModal
        type="third-result"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
        onAcceptThird={mockOnAcceptThird}
        thirdAttemptAnalysis={analysis}
      />
    );

    expect(screen.getByText(new RegExp(customReason, 'i'))).toBeInTheDocument();
  });

  it('3.4 - Valor aceptado se muestra en warningText (type=third-result)', () => {
    const analysis = createThirdAttemptResult({
      acceptedValue: 42
    });

    render(
      <BlindVerificationModal
        type="third-result"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
        onAcceptThird={mockOnAcceptThird}
        thirdAttemptAnalysis={analysis}
      />
    );

    expect(screen.getByText(/Valor aceptado: 42 unidades/i)).toBeInTheDocument();
  });
});

describe('🔷 BlindVerificationModal - Grupo 4: Accesibilidad WCAG 2.1', () => {
  it('4.1 - Modal tiene role="dialog" (aria-role implícito de AlertDialog)', () => {
    render(
      <BlindVerificationModal
        type="incorrect"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
      />
    );

    // AlertDialog de Radix UI establece role="dialog" implícitamente
    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
  });

  it('4.2 - Títulos descriptivos presentes para screen readers', () => {
    const { rerender } = render(
      <BlindVerificationModal
        type="incorrect"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
      />
    );

    // v1.3.5: Verificar título para type="incorrect"
    expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();

    // Re-render con type="require-third"
    rerender(
      <BlindVerificationModal
        type="require-third"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
      />
    );

    // Verificar título para type="require-third"
    expect(screen.getByText(/ALERTA CRÍTICA/i)).toBeInTheDocument();
  });

  it('4.3 - Botones tienen labels claros y descriptivos (UX simplificada v1.3.3 - FIX DEFINITIVO)', () => {
    const { rerender } = render(
      <BlindVerificationModal
        type="incorrect"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
      />
    );

    // 🤖 [IA] - v1.3.5: Botón principal "Volver a contar" para type="incorrect"
    expect(screen.getByRole('button', { name: /Volver a contar/i })).toBeInTheDocument();

    // 🤖 [IA] - v1.3.3: Botón Cancel NO debe existir con showCancel=false
    expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument();

    // Re-render con type="force-same"
    rerender(
      <BlindVerificationModal
        type="force-same"
        isOpen={true}
        stepLabel="Test"
        onRetry={mockOnRetry}
        onForce={mockOnForce}
      />
    );

    // 🤖 [IA] - v1.3.3: Botón principal "Forzar y Continuar" para type="force-same"
    expect(screen.getByRole('button', { name: /Forzar y Continuar/i })).toBeInTheDocument();

    // 🤖 [IA] - v1.3.3: Botón Cancel NO debe existir con showCancel=false
    expect(screen.queryByRole('button', { name: /Cancelar/i })).not.toBeInTheDocument();
  });
});

describe('🔷 BlindVerificationModal - Grupo 5: Edge Cases', () => {
  it('5.1 - thirdAttemptAnalysis undefined NO causa crash (type=third-result)', () => {
    expect(() => {
      render(
        <BlindVerificationModal
          type="third-result"
          isOpen={true}
          stepLabel="Test"
          onRetry={mockOnRetry}
          onAcceptThird={mockOnAcceptThird}
          // thirdAttemptAnalysis INTENCIONALMENTE undefined
        />
      );
    }).not.toThrow();

    // Debe mostrar texto fallback
    expect(screen.getByText(/Error en análisis de intentos/i)).toBeInTheDocument();
    expect(screen.getByText(/Valor aceptado: 0 unidades/i)).toBeInTheDocument();
  });

  it('5.2 - Callbacks opcionales undefined NO causa crash', async () => {
    const user = userEvent.setup();

    expect(() => {
      render(
        <BlindVerificationModal
          type="force-same"
          isOpen={true}
          stepLabel="Test"
          onRetry={mockOnRetry}
          // onForce INTENCIONALMENTE undefined
        />
      );
    }).not.toThrow();

    // Click en botón "Forzar y Continuar" NO debe causar crash
    const forceButton = screen.getByRole('button', { name: /Forzar y Continuar/i });
    await expect(user.click(forceButton)).resolves.not.toThrow();

    // onRetry es llamado desde onCancel al cerrar (ConfirmationModal.handleOpenChange)
    // Verificamos que fue llamado correctamente como fallback
    expect(mockOnRetry).toHaveBeenCalled();
  });
});
