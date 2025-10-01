// 🙏 Con la ayuda de Dios - Test de integración completo para GuidedDenominationItem
// 🤖 [IA] - v1.0.0: Comprehensive integration test for guided denomination item
// Cobertura: Auto-navegación, validación, PWA mode, timing, mobile keyboard

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuidedDenominationItem } from '@/components/ui/GuidedDenominationItem';
import { cleanupMocks, waitForAnimation } from '../../fixtures/test-helpers';

/**
 * 🎯 TEST STRATEGY: Cobertura exhaustiva del componente crítico de conteo
 * 
 * OBJETIVOS:
 * 1. ✅ Verificar auto-navegación entre campos (MEMORY[2ff4250e])
 * 2. ✅ Validar comportamiento de teclado móvil
 * 3. ✅ Confirmar validación de input (solo enteros)
 * 4. ✅ Testear PWA standalone mode
 * 5. ✅ Validar timing sin race conditions (BUG #6)
 * 6. ✅ Verificar navegación bill100 → credomatic
 * 7. ✅ Confirmar focus automático en campo activo
 * 8. ✅ Validar estados bloqueado/activo/completado
 * 
 * COBERTURA ESPERADA: ~40%+ del módulo cash-counting
 */

describe('🎯 GuidedDenominationItem - Integration Tests (CORE)', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Mock mejorado de matchMedia para use-mobile hook
    const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query || '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
    
    // Mock window.innerWidth for use-mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });
  
  afterEach(() => {
    cleanupMocks();
  });

  describe('🔒 Estado y Accesibilidad', () => {
    
    it('debe renderizar en estado bloqueado correctamente', () => {
      const mockOnConfirm = vi.fn();
      const mockOnAttemptAccess = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '1 centavo', value: 0.01 }}
          fieldName="penny"
          quantity={0}
          type="coin"
          isActive={false}
          isCompleted={false}
          isAccessible={false}
          onConfirm={mockOnConfirm}
          onAttemptAccess={mockOnAttemptAccess}
        />
      );
      
      const lockIcon = document.querySelector('.lucide-lock');
      expect(lockIcon).toBeInTheDocument();
      expect(screen.getByText(/Debe completar el campo actual antes de continuar/i)).toBeInTheDocument();
      
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('debe renderizar en estado activo con focus automático', async () => {
      const mockOnConfirm = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '5 centavos', value: 0.05 }}
          fieldName="nickel"
          quantity={0}
          type="coin"
          isActive={true}
          isCompleted={false}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      const arrowIcon = document.querySelector('.lucide-arrow-right');
      expect(arrowIcon).toBeInTheDocument();
      expect(screen.getByText('ACTIVO')).toBeInTheDocument();
      
      await waitFor(() => {
        const input = screen.getByRole('textbox');
        expect(input).toHaveFocus();
      }, { timeout: 200 });
    });

    it('debe renderizar en estado completado mostrando total', () => {
      const mockOnConfirm = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '25 centavos', value: 0.25 }}
          fieldName="quarter"
          quantity={10}
          type="coin"
          isActive={false}
          isCompleted={true}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      const checkIcon = document.querySelector('.lucide-check');
      expect(checkIcon).toBeInTheDocument();
      expect(screen.getByText(/Total: \$2\.50/i)).toBeInTheDocument();
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('10');
    });
  });

  describe('✍️ Validación de Input', () => {
    
    it('debe aceptar solo números enteros positivos', async () => {
      const user = userEvent.setup();
      const mockOnConfirm = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '$1', value: 1 }}
          fieldName="bill1"
          quantity={0}
          type="bill"
          isActive={true}
          isCompleted={false}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await user.type(input, '25');
      expect(input).toHaveValue('25');
      
      await user.clear(input);
      await user.type(input, 'abc!@#$%');
      expect(input).toHaveValue('');
      
      await user.clear(input);
      await user.type(input, '12.34');
      expect(input).toHaveValue('1234');
      
      await user.clear(input);
      await user.type(input, '-5');
      expect(input).toHaveValue('5');
    });

    it('debe usar inputMode="numeric" para teclado móvil optimizado', () => {
      const mockOnConfirm = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '$5', value: 5 }}
          fieldName="bill5"
          quantity={0}
          type="bill"
          isActive={true}
          isCompleted={false}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      expect(input).toHaveAttribute('inputmode', 'numeric');
      expect(input).toHaveAttribute('pattern', '[0-9]*');
      expect(input).toHaveAttribute('type', 'tel');
      expect(input).toHaveAttribute('autocapitalize', 'off');
      expect(input).toHaveAttribute('autocorrect', 'off');
      expect(input).toHaveAttribute('autocomplete', 'off');
    });

    it('debe tener data-field attribute para navegación', () => {
      const mockOnConfirm = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '$10', value: 10 }}
          fieldName="bill10"
          quantity={0}
          type="bill"
          isActive={true}
          isCompleted={false}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('data-field', 'bill10');
    });
  });

  describe('✅ Confirmación de Valores', () => {
    
    it('debe habilitar botón de confirmación solo con valor válido', async () => {
      const user = userEvent.setup();
      const mockOnConfirm = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '$20', value: 20 }}
          fieldName="bill20"
          quantity={0}
          type="bill"
          isActive={true}
          isCompleted={false}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      // El botón siempre aparece cuando el campo está activo, pero deshabilitado sin valor
      const confirmButton = screen.getByRole('button');
      expect(confirmButton).toBeDisabled();
      
      await user.type(input, '15');
      
      await waitFor(() => {
        expect(confirmButton).not.toBeDisabled();
      });
    });

    it('debe confirmar valor al hacer click en botón checkmark', async () => {
      const user = userEvent.setup();
      const mockOnConfirm = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '$50', value: 50 }}
          fieldName="bill50"
          quantity={0}
          type="bill"
          isActive={true}
          isCompleted={false}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      const input = screen.getByRole('textbox');
      await user.type(input, '8');
      
      const confirmButton = await screen.findByRole('button');
      await user.click(confirmButton);
      
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith('8');
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      });
      
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('debe confirmar valor al presionar Enter', async () => {
      const user = userEvent.setup();
      const mockOnConfirm = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '$100', value: 100 }}
          fieldName="bill100"
          quantity={0}
          type="bill"
          isActive={true}
          isCompleted={false}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      const input = screen.getByRole('textbox');
      await user.type(input, '3');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith('3');
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('🔄 Auto-navegación (CRÍTICO - MEMORY[2ff4250e])', () => {
    
    it('debe buscar el siguiente campo por orden definido en fieldOrder', async () => {
      const user = userEvent.setup();
      const mockOnConfirm = vi.fn();
      
      const mockQuerySelector = vi.spyOn(document, 'querySelector');
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '$100', value: 100 }}
          fieldName="bill100"
          quantity={0}
          type="bill"
          isActive={true}
          isCompleted={false}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      const input = screen.getByRole('textbox');
      await user.type(input, '2');
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith('2');
      });
      
      await waitForAnimation(200);
      
      expect(mockQuerySelector).toHaveBeenCalledWith('[data-field="credomatic"]');
      mockQuerySelector.mockRestore();
    });
  });

  describe('📱 PWA Standalone Mode', () => {
    
    it('debe detectar modo PWA standalone correctamente', async () => {
      const mockMatchMedia = vi.fn().mockImplementation((query) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));
      
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: mockMatchMedia,
      });
      
      const mockOnConfirm = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: 'Test', value: 1 }}
          fieldName="test"
          quantity={0}
          type="coin"
          isActive={true}
          isCompleted={false}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      await waitFor(() => {
        expect(mockMatchMedia).toHaveBeenCalledWith('(display-mode: standalone)');
      });
    });
  });

  describe('🎨 Visual y UI States', () => {
    
    it('debe mostrar el badge correcto para monedas', () => {
      const mockOnConfirm = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '1 centavo', value: 0.01 }}
          fieldName="penny"
          quantity={0}
          type="coin"
          isActive={true}
          isCompleted={false}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.getByText('¢')).toBeInTheDocument();
    });

    it('debe mostrar el badge correcto para billetes', () => {
      const mockOnConfirm = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '$100', value: 100 }}
          fieldName="bill100"
          quantity={0}
          type="bill"
          isActive={true}
          isCompleted={false}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.getByText('$')).toBeInTheDocument();
    });

    it('debe calcular y mostrar el total correctamente', () => {
      const mockOnConfirm = vi.fn();
      
      render(
        <GuidedDenominationItem
          denomination={{ name: '$20', value: 20 }}
          fieldName="bill20"
          quantity={15}
          type="bill"
          isActive={false}
          isCompleted={true}
          isAccessible={true}
          onConfirm={mockOnConfirm}
        />
      );
      
      expect(screen.getByText(/Total: \$300\.00/i)).toBeInTheDocument();
    });
  });
});
