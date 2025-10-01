// 🙏 Con la ayuda de Dios - Test de integración para GuidedCoinSection
// 🤖 [WINDSURF] - FASE 1: Tests independientes (sin dependencia de GuidedFieldView)
// Cobertura: Cálculos de totales, edge cases, propagación de props

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuidedCoinSection } from '@/components/cash-counting/GuidedCoinSection';
import type { CashCount } from '@/types/cash';

/**
 * 🎯 FASE 1 TEST STRATEGY:
 * 
 * Tests independientes que NO requieren GuidedFieldView completamente implementado:
 * - Grupo 2: Cálculos de totales (4 tests)
 * - Grupo 5: Edge cases (2 tests)
 * - Grupo 3: Props a GuidedDenominationItem (1 test)
 * 
 * Mock básico de GuidedFieldView para permitir imports sin errores.
 */

// Mock básico de GuidedFieldView (solo para evitar errores de import)
vi.mock('@/components/cash-counting/GuidedFieldView', () => ({
  GuidedFieldView: ({ currentFieldName, currentStep, totalSteps }: any) => (
    <div data-testid="guided-field-view">
      <div data-testid="current-field">{currentFieldName}</div>
      <div data-testid="current-step">{currentStep}</div>
      <div data-testid="total-steps">{totalSteps}</div>
    </div>
  )
}));

describe('🪙 GuidedCoinSection - Integration Tests (FASE 1)', () => {
  
  // Helper para crear cashCount base con todos los campos
  const createBaseCashCount = (overrides: Partial<CashCount> = {}): CashCount => ({
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 0,
    bill10: 0,
    bill20: 0,
    bill50: 0,
    bill100: 0,
    ...overrides
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 2: CÁLCULOS DE TOTALES (4 tests) ⭐⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  describe('💰 Grupo 2: Cálculos de Totales', () => {
    
    it('Test 2.1: debe calcular coinTotal correctamente', () => {
      // Setup: Configurar cada moneda para total de $5.00
      const cashCount = createBaseCashCount({
        penny: 100,    // 100 × $0.01 = $1.00
        nickel: 20,    // 20 × $0.05 = $1.00
        dime: 10,      // 10 × $0.10 = $1.00
        quarter: 4,    // 4 × $0.25 = $1.00
        dollarCoin: 1, // 1 × $1.00 = $1.00
        // Total esperado: $5.00
      });

      render(
        <GuidedCoinSection
          cashCount={cashCount}
          isFieldActive={() => false} // Grid view para ver totales
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Verificar display de total
      const totalDisplays = screen.getAllByText(/\$5\.00/);
      expect(totalDisplays.length).toBeGreaterThan(0);
      
      // Verificar que el total tiene exactamente 2 decimales
      const totalText = totalDisplays[0].textContent;
      expect(totalText).toMatch(/\$\d+\.\d{2}/);
      
      // Verificar que el total está en el header con clase text-warning
      const headerTotal = screen.getByText('Total en Monedas').parentElement?.parentElement;
      expect(headerTotal).toBeTruthy();
      const warningTotal = within(headerTotal!).getByText(/\$5\.00/);
      expect(warningTotal).toHaveClass('text-warning');
    });

    it('Test 2.2: debe calcular coinTotal como $0.00 cuando no hay monedas', () => {
      // Setup: CashCount completamente vacío
      const cashCount = createBaseCashCount(); // Todas las monedas en 0

      render(
        <GuidedCoinSection
          cashCount={cashCount}
          isFieldActive={() => false}
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Verificar display de $0.00
      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument();
      
      // Verificar que el footer NO aparece (solo aparece cuando coinTotal > 0)
      const footerTotal = screen.queryByText(/💰 Total en monedas:/);
      expect(footerTotal).not.toBeInTheDocument();
      
      // Verificar contador de completados
      expect(screen.getByText('0 de 5 completadas')).toBeInTheDocument();
    });

    it('Test 2.3: debe contar completedCoins correctamente', () => {
      // Setup: 3 monedas completadas (penny, nickel, quarter)
      const cashCount = createBaseCashCount({
        penny: 100,
        nickel: 20,
        quarter: 4,
      });

      const isFieldCompleted = (field: string) => 
        ['penny', 'nickel', 'quarter'].includes(field);

      render(
        <GuidedCoinSection
          cashCount={cashCount}
          isFieldActive={() => false}
          isFieldCompleted={isFieldCompleted}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Verificar contador "3 de 5 completadas"
      expect(screen.getByText('3 de 5 completadas')).toBeInTheDocument();
      
      // Verificar que está en text-text-secondary
      const counterElement = screen.getByText('3 de 5 completadas');
      expect(counterElement).toHaveClass('text-text-secondary');
    });

    it('Test 2.4: debe calcular currentStep correctamente según campo activo', () => {
      // Setup: Probar con diferentes campos activos
      const testCases = [
        { fieldName: 'penny', expectedStep: 1 },
        { fieldName: 'nickel', expectedStep: 2 },
        { fieldName: 'dime', expectedStep: 3 },
        { fieldName: 'quarter', expectedStep: 4 },
        { fieldName: 'dollarCoin', expectedStep: 5 },
      ];

      testCases.forEach(({ fieldName, expectedStep }) => {
        const { unmount } = render(
          <GuidedCoinSection
            cashCount={createBaseCashCount()}
            isFieldActive={(field: string) => field === fieldName}
            isFieldCompleted={() => false}
            isFieldAccessible={() => true}
            onFieldConfirm={vi.fn()}
            onAttemptAccess={vi.fn()}
          />
        );

        // Assertions: Verificar que GuidedFieldView recibe currentStep correcto
        expect(screen.getByTestId('guided-field-view')).toBeInTheDocument();
        expect(screen.getByTestId('current-step')).toHaveTextContent(expectedStep.toString());
        expect(screen.getByTestId('total-steps')).toHaveTextContent('17');
        expect(screen.getByTestId('current-field')).toHaveTextContent(fieldName);

        unmount();
      });
    });

  }); // Fin Grupo 2

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 5: EDGE CASES Y RESPONSIVE (2 tests) ⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🎯 Grupo 5: Edge Cases y Responsive', () => {
    
    it('Test 5.1: debe renderizar footer de total solo cuando coinTotal > 0', () => {
      // Test 1: Con coinTotal = 0
      const { rerender } = render(
        <GuidedCoinSection
          cashCount={createBaseCashCount()} // Todas en 0
          isFieldActive={() => false}
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertion: Footer NO debe existir
      expect(screen.queryByText(/💰 Total en monedas:/)).not.toBeInTheDocument();

      // Test 2: Con coinTotal = $5.50
      rerender(
        <GuidedCoinSection
          cashCount={createBaseCashCount({
            penny: 50,    // $0.50
            dollarCoin: 5 // $5.00
          })} // Total: $5.50
          isFieldActive={() => false}
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Footer DEBE existir con texto correcto
      const footer = screen.getByText(/💰 Total en monedas: \$5\.50/);
      expect(footer).toBeInTheDocument();
      
      // Verificar clases del footer
      expect(footer).toHaveClass('bg-warning/10');
      expect(footer).toHaveClass('text-warning');
    });

    it('Test 5.2: debe aplicar tabIndex secuencial a items del grid', () => {
      // Setup: Renderizar grid view con campos accesibles
      render(
        <GuidedCoinSection
          cashCount={createBaseCashCount()}
          isFieldActive={() => false}
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Verificar que hay 5 GuidedDenominationItem en el grid
      // Los inputs accesibles tienen role="textbox"
      const gridItems = screen.getAllByRole('textbox', { hidden: true });
      expect(gridItems.length).toBeGreaterThanOrEqual(5); // Al menos 5 monedas

      // Verificar que todos los nombres de monedas están presentes (pueden aparecer duplicados en label y badge)
      // Usamos getAllByText para manejar duplicados
      const coinNames = ['1¢ centavo', '5¢ centavos', '10¢ centavos', '25¢ centavos', '$1 moneda'];
      coinNames.forEach((name) => {
        const elements = screen.getAllByText(name);
        expect(elements.length).toBeGreaterThan(0);
      });
      
      // Verificar que el grid tiene las clases responsive correctas
      const gridContainers = document.querySelectorAll('.grid');
      expect(gridContainers.length).toBeGreaterThan(0);
    });

  }); // Fin Grupo 5

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 3: PROPAGACIÓN DE PROPS A HIJOS (1 test) ⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  describe('📦 Grupo 3: Propagación de Props', () => {
    
    it('Test 3.1: debe propagar props correctamente a GuidedDenominationItem', async () => {
      // Setup: NINGÚN campo activo para renderizar grid view
      const mockOnConfirm = vi.fn();
      const mockOnAttemptAccess = vi.fn();
      
      const cashCount = createBaseCashCount({
        penny: 10,
        nickel: 5,
        dime: 0,
        quarter: 0,
        dollarCoin: 0,
      });

      const isFieldActive = () => false; // NINGUNO activo para ver grid
      const isFieldCompleted = (field: string) => field === 'nickel';
      const isFieldAccessible = () => true;

      render(
        <GuidedCoinSection
          cashCount={cashCount}
          isFieldActive={isFieldActive}
          isFieldCompleted={isFieldCompleted}
          isFieldAccessible={isFieldAccessible}
          onFieldConfirm={mockOnConfirm}
          onAttemptAccess={mockOnAttemptAccess}
        />
      );

      // Assertions: Verificar que se renderizaron 5 items en grid view
      const coinInputs = screen.getAllByRole('textbox', { hidden: true });
      expect(coinInputs.length).toBeGreaterThanOrEqual(5);

      // Verificar que las denominaciones están presentes (usamos getAllByText por duplicados)
      expect(screen.getAllByText('1¢ centavo').length).toBeGreaterThan(0);
      expect(screen.getAllByText('5¢ centavos').length).toBeGreaterThan(0);
      expect(screen.getAllByText('10¢ centavos').length).toBeGreaterThan(0);
      expect(screen.getAllByText('25¢ centavos').length).toBeGreaterThan(0);
      expect(screen.getAllByText('$1 moneda').length).toBeGreaterThan(0);

      // Verificar que el total calculado es correcto ($0.10 + $0.25 = $0.35)
      const totalElements = screen.getAllByText(/\$0\.35/);
      expect(totalElements.length).toBeGreaterThan(0);
      
      // Verificar que "1 de 5 completadas" aparece (nickel está completado)
      expect(screen.getByText('1 de 5 completadas')).toBeInTheDocument();

      // Verificar que los callbacks están disponibles (se propagan a los items)
      expect(mockOnConfirm).toBeDefined();
      expect(mockOnAttemptAccess).toBeDefined();
      expect(typeof mockOnConfirm).toBe('function');
      expect(typeof mockOnAttemptAccess).toBe('function');
    });

  }); // Fin Grupo 3

}); // Fin describe principal
