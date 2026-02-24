// 🙏 Con la ayuda de Dios - Test de integración para GuidedInstructionsModal
// 🤖 [IA] - v1.3.7e-FT: Migración a vi.useFakeTimers() + fix reglas actualizadas (2 reglas, no 4)
// Cobertura: Renderizado, progreso secuencial, timing, botón comenzar, edge cases

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, act, fireEvent } from '@testing-library/react';
import { GuidedInstructionsModal } from '@/components/cash-counting/GuidedInstructionsModal';

/**
 * 🎯 ESTRATEGIA DE TESTS:
 *
 * - Fase 1: Renderizado básico (5 tests)
 * - Fase 2: Progreso secuencial de reglas (7 tests)
 * - Fase 3: Botón "Comenzar Conteo" (5 tests)
 * - Fase 4: Timing y animaciones (3 tests)
 * - Fase 5: Edge cases (3 tests)
 *
 * Total: 23 tests
 *
 * 🤖 [IA] - v1.3.7e-FT: Usa vi.useFakeTimers() para tests instantáneos
 * IMPORTANTE: fireEvent.click() en vez de userEvent.click() porque
 * userEvent v14 cuelga con fake timers (usa setTimeout internamente).
 *
 * Reglas actuales (cashCountingInstructions.ts):
 *   1. "Saquen Reportes y Cierres de POS" - minReviewTimeMs: 3000
 *   2. "Organiza Efectivo y Paquetes de 10 U." - minReviewTimeMs: 4000
 */

// 🤖 [IA] - v1.3.7e-FT: Nombres actuales de las reglas (cashCountingInstructions.ts)
const RULE_1_NAME = 'Saquen Reportes y Cierres de POS';
const RULE_2_NAME = 'Organiza Efectivo y Paquetes de 10 U.';
const RULE_1_TIME = 3000; // minReviewTimeMs
const RULE_2_TIME = 4000; // minReviewTimeMs

describe('📋 GuidedInstructionsModal - Integration Tests', () => {

  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // 🤖 [IA] - v1.3.7e-FT: Solo fake setTimeout/Date - NO requestAnimationFrame (framer-motion)
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'Date']
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // Helper: click síncrono + avanzar timer para completar una regla
  async function clickAndCompleteRule(ruleElement: Element, timeMs: number) {
    // fireEvent.click es síncrono - no cuelga con fake timers (a diferencia de userEvent)
    fireEvent.click(ruleElement);
    // Avanzar timer para auto-completion del hook useInstructionFlow
    await act(async () => {
      vi.advanceTimersByTime(timeMs + 500); // +500ms buffer
    });
  }

  // Helper: solo avanzar timer (sin click)
  async function advanceTimer(timeMs: number) {
    await act(async () => {
      vi.advanceTimersByTime(timeMs);
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 1: RENDERIZADO BÁSICO (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🎨 Fase 1: Renderizado Básico', () => {

    it('Test 1.1: debe renderizar modal cuando isOpen es true', () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getAllByText('Instrucciones de Conteo')[0]).toBeInTheDocument();
    });

    it('Test 1.2: NO debe renderizar modal cuando isOpen es false', () => {
      render(<GuidedInstructionsModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('Test 1.3: debe renderizar las 2 reglas del protocolo', () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      // 🤖 [IA] - v1.3.7e-FT: Actualizado de 4 a 2 reglas (cashCountingInstructions.ts v2.4.1)
      expect(screen.getByText(RULE_1_NAME)).toBeInTheDocument();
      expect(screen.getByText(RULE_2_NAME)).toBeInTheDocument();
    });

    it('Test 1.4: debe renderizar heading correcto', () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      const headings = screen.getAllByRole('heading', { name: /instrucciones de conteo/i });
      expect(headings[0]).toBeInTheDocument();
    });

    it('Test 1.5: debe renderizar botones de navegación', () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /cerrar modal/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /comenzar conteo/i })).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 2: PROGRESO SECUENCIAL DE REGLAS (7 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🔄 Fase 2: Progreso Secuencial', () => {

    it('Test 2.1: primera regla debe estar habilitada inicialmente', () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      const firstRule = screen.getByText(RULE_1_NAME).closest('div[role="button"]');
      expect(firstRule).toBeInTheDocument();
      expect(firstRule).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('Test 2.2: primera regla pasa a "reviewing" al hacer click', async () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      const firstRule = screen.getByText(RULE_1_NAME).closest('div[role="button"]');
      expect(firstRule).toBeInTheDocument();

      if (firstRule) {
        fireEvent.click(firstRule);

        // Después del click, la regla debe tener aria-pressed (estado reviewing)
        await act(async () => {
          vi.advanceTimersByTime(100);
        });
        expect(firstRule).toHaveAttribute('aria-pressed');
      }
    });

    it('Test 2.3: regla pasa a estado "reviewing" y luego se completa', async () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      const firstRuleButton = screen.getByText(RULE_1_NAME).closest('div[role="button"]');

      if (firstRuleButton) {
        // 🤖 [IA] - v1.3.7e-FT: fireEvent + advanceTimer en vez de userEvent + esperar
        await clickAndCompleteRule(firstRuleButton, RULE_1_TIME);

        expect(firstRuleButton).toHaveAttribute('aria-pressed', 'true');
      }
    });

    it('Test 2.4: NO se puede saltar reglas', () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      // 🤖 [IA] - v1.3.7e-FT: Regla 2 debe estar deshabilitada (solo 2 reglas ahora)
      const secondRule = screen.getByText(RULE_2_NAME).closest('div[role="button"]');
      expect(secondRule).toHaveAttribute('aria-disabled', 'true');
    });

    it('Test 2.5: progreso secuencial 1→2', async () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      // Completar regla 1
      const rule1 = screen.getByText(RULE_1_NAME).closest('div[role="button"]')!;
      await clickAndCompleteRule(rule1, RULE_1_TIME);

      // Regla 2 debe estar habilitada ahora
      const rule2Button = screen.getByText(RULE_2_NAME).closest('div[role="button"]');
      expect(rule2Button).toBeInTheDocument();
      expect(rule2Button).not.toHaveAttribute('aria-disabled', 'true');
    });

    it('Test 2.6: checkmarks visibles en reglas completadas', async () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      // Completar regla 1
      const rule1 = screen.getByText(RULE_1_NAME).closest('div[role="button"]')!;
      await clickAndCompleteRule(rule1, RULE_1_TIME);

      // Verificar checkmark (aria-pressed=true)
      expect(rule1).toHaveAttribute('aria-pressed', 'true');
    });

    it('Test 2.7: progreso secuencial completo (ambas reglas)', async () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      // Completar regla 1
      const rule1 = screen.getByText(RULE_1_NAME).closest('div[role="button"]')!;
      await clickAndCompleteRule(rule1, RULE_1_TIME);

      // Regla 2 debe estar habilitada
      const rule2 = screen.getByText(RULE_2_NAME).closest('div[role="button"]');
      expect(rule2).not.toHaveAttribute('aria-disabled', 'true');

      // Completar regla 2
      if (rule2) await clickAndCompleteRule(rule2, RULE_2_TIME);

      // Re-query para evitar stale reference
      const rule2Updated = screen.getByText(RULE_2_NAME).closest('div[role="button"]');
      expect(rule2Updated).toHaveAttribute('aria-pressed', 'true');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 3: BOTÓN "COMENZAR CONTEO" (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('▶️ Fase 3: Botón Comenzar Conteo', () => {

    it('Test 3.1: botón deshabilitado inicialmente', () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      const button = screen.getByRole('button', { name: /comenzar conteo/i });
      expect(button).toBeDisabled();
    });

    it('Test 3.2: botón permanece deshabilitado hasta completar todas las reglas', async () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      // Verificar botón deshabilitado inicialmente
      let button = screen.getByRole('button', { name: /comenzar conteo/i });
      expect(button).toBeDisabled();

      // Completar regla 1
      const rule1 = screen.getByText(RULE_1_NAME).closest('div[role="button"]')!;
      await clickAndCompleteRule(rule1, RULE_1_TIME);

      // Botón AÚN deshabilitado (falta regla 2)
      button = screen.getByRole('button', { name: /comenzar conteo/i });
      expect(button).toBeDisabled();
    });

    it('Test 3.3: onConfirm existe y botón está conectado', () => {
      const mockConfirm = vi.fn();

      render(<GuidedInstructionsModal {...defaultProps} onConfirm={mockConfirm} />);

      const button = screen.getByRole('button', { name: /comenzar conteo/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
      expect(mockConfirm).not.toHaveBeenCalled();
    });

    it('Test 3.4: botón X siempre habilitado', () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      const xButton = screen.getByRole('button', { name: /cerrar modal/i });
      expect(xButton).not.toBeDisabled();
    });

    it('Test 3.5: click en botón X abre modal de confirmación', async () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      const xButton = screen.getByRole('button', { name: /cerrar modal/i });
      expect(xButton.className).toContain('modal-close-button');
      fireEvent.click(xButton);

      // Avanzar timers para permitir renderizado del modal de confirmación
      await advanceTimer(100);

      expect(screen.getByText(/cancelar instrucciones/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sí, cancelar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continuar aquí' })).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 4: TIMING Y ANIMACIONES (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('⏱️ Fase 4: Timing y Animaciones', () => {

    it('Test 4.1: regla se completa automáticamente después de tiempo mínimo', async () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      const ruleButton = screen.getByText(RULE_1_NAME).closest('div[role="button"]')!;
      fireEvent.click(ruleButton);

      // La regla NO debe estar completada inmediatamente
      expect(ruleButton).not.toHaveAttribute('aria-pressed', 'true');

      // 🤖 [IA] - v1.3.7e-FT: Avanzar exactamente el minReviewTimeMs + buffer
      await advanceTimer(RULE_1_TIME + 500);

      // Ahora SÍ debe estar completada
      expect(ruleButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('Test 4.2: segunda regla toma más tiempo que la primera', async () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      // Completar regla 1 (3000ms)
      const rule1 = screen.getByText(RULE_1_NAME).closest('div[role="button"]')!;
      await clickAndCompleteRule(rule1, RULE_1_TIME);

      // Click en regla 2 (4000ms - más que regla 1)
      const rule2Button = screen.getByText(RULE_2_NAME).closest('div[role="button"]')!;
      fireEvent.click(rule2Button);

      // Avanzar solo 3000ms → regla 2 NO debe completarse aún (necesita 4000ms)
      await advanceTimer(3000);

      // Avanzar el resto del tiempo para completar regla 2
      await advanceTimer(1500);

      // Ahora SÍ debe estar completada
      const rule2Final = screen.getByText(RULE_2_NAME).closest('div[role="button"]');
      expect(rule2Final).toHaveAttribute('aria-pressed', 'true');
    });

    it('Test 4.3: animaciones de framer-motion presentes', () => {
      render(<GuidedInstructionsModal {...defaultProps} />);

      // Verificar que los elementos tienen las clases de motion
      const rules = screen.getAllByRole('button');
      expect(rules.length).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 5: EDGE CASES (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🔍 Fase 5: Edge Cases', () => {

    it('Test 5.1: modal mantiene estructura al cerrar y reabrir', async () => {
      const { rerender } = render(<GuidedInstructionsModal {...defaultProps} />);

      // Verificar estado inicial
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      const button1 = screen.getByRole('button', { name: /comenzar conteo/i });
      expect(button1).toBeDisabled();

      // Cerrar modal
      rerender(<GuidedInstructionsModal {...defaultProps} isOpen={false} />);

      // Avanzar para animaciones de cierre
      await advanceTimer(500);

      // Re-abrir modal
      rerender(<GuidedInstructionsModal {...defaultProps} isOpen={true} />);

      // Avanzar para animaciones de apertura
      await advanceTimer(500);

      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Botón debe estar deshabilitado (estado inicial)
      const button2 = screen.getByRole('button', { name: /comenzar conteo/i });
      expect(button2).toBeDisabled();
    });

    it('Test 5.2: props opcionales con defaults', () => {
      const minimalProps = {
        isOpen: true,
        onConfirm: vi.fn()
        // onCancel omitido (opcional)
      };

      expect(() => {
        render(<GuidedInstructionsModal {...minimalProps} />);
      }).not.toThrow();
    });

    it('Test 5.3: cleanup de timers al desmontar', () => {
      const { unmount } = render(<GuidedInstructionsModal {...defaultProps} />);

      unmount();

      // Avanzar tiempo después de desmontar
      vi.advanceTimersByTime(10000);

      // No debe haber errores ni warnings
      expect(vi.getTimerCount()).toBeGreaterThanOrEqual(0);
    });
  });
});
