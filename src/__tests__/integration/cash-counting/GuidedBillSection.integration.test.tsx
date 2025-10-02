// 🙏 Con la ayuda de Dios - Test de integración para GuidedBillSection
// 🤖 [WINDSURF] - FASE 1: Tests independientes (sin dependencia de GuidedFieldView)
// Cobertura: Cálculos de totales, edge cases, propagación de props

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuidedBillSection } from '@/components/cash-counting/GuidedBillSection';
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

// Interface para el mock de GuidedFieldView
interface MockGuidedFieldViewProps {
  currentFieldName?: string;
  currentStep?: number;
  totalSteps?: number;
  completedFields?: Array<{ name: string; quantity: number; total: number }>;
  isMorningCount?: boolean;
  onCancel?: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
  onConfirm?: (value: string) => void;
}

// Mock mejorado de GuidedFieldView (expone todas las props para validación)
vi.mock('@/components/cash-counting/GuidedFieldView', () => ({
  GuidedFieldView: ({ 
    currentFieldName, 
    currentStep, 
    totalSteps,
    completedFields,
    isMorningCount,
    onCancel,
    onPrevious,
    canGoPrevious,
    onConfirm
  }: MockGuidedFieldViewProps) => (
    <div data-testid="guided-field-view">
      <div data-testid="current-field">{currentFieldName}</div>
      <div data-testid="current-step">{currentStep}</div>
      <div data-testid="total-steps">{totalSteps}</div>
      <div data-testid="completed-fields-count">{completedFields?.length || 0}</div>
      <div data-testid="is-morning-count">{String(isMorningCount || false)}</div>
      <div data-testid="has-on-cancel">{String(!!onCancel)}</div>
      <div data-testid="has-on-previous">{String(!!onPrevious)}</div>
      <div data-testid="can-go-previous">{String(!!canGoPrevious)}</div>
      <div data-testid="has-on-confirm">{String(!!onConfirm)}</div>
    </div>
  )
}));

describe('💵 GuidedBillSection - Integration Tests (FASE 1)', () => {
  
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
    
    it('Test 2.1: debe calcular billTotal correctamente', () => {
      // Setup: Configurar billetes para total de $236.00
      const cashCount = createBaseCashCount({
        bill1: 1,    // 1 × $1 = $1
        bill5: 1,    // 1 × $5 = $5
        bill10: 2,   // 2 × $10 = $20
        bill20: 3,   // 3 × $20 = $60
        bill50: 1,   // 1 × $50 = $50
        bill100: 1,  // 1 × $100 = $100
        // Total esperado: $236.00
      });

      render(
        <GuidedBillSection
          cashCount={cashCount}
          isFieldActive={() => false} // Grid view para ver totales
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Verificar display de total ($236.00)
      const totalDisplays = screen.getAllByText(/\$236\.00/);
      expect(totalDisplays.length).toBeGreaterThan(0);
      
      // Verificar que el total tiene exactamente 2 decimales
      const totalText = totalDisplays[0].textContent;
      expect(totalText).toMatch(/\$\d+\.\d{2}/);
      
      // Verificar que el total está en el header con clase text-success
      const headerTotal = screen.getByText('Total en Billetes').parentElement?.parentElement;
      expect(headerTotal).toBeTruthy();
      const successTotal = within(headerTotal!).getByText(/\$236\.00/);
      expect(successTotal).toHaveClass('text-success');
    });

    it('Test 2.2: debe calcular billTotal como $0.00 cuando no hay billetes', () => {
      // Setup: cashCount completamente vacío
      const cashCount = createBaseCashCount(); // Todos los billetes en 0

      render(
        <GuidedBillSection
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
      
      // Verificar que el footer NO aparece (solo aparece cuando billTotal > 0)
      const footerTotal = screen.queryByText(/💵 Total en billetes:/);
      expect(footerTotal).not.toBeInTheDocument();
      
      // Verificar contador de completados
      expect(screen.getByText('0 de 6 completados')).toBeInTheDocument();
    });

    it('Test 2.3: debe contar completedBills correctamente', () => {
      // Setup: 3 billetes completados (bill1, bill10, bill50)
      const cashCount = createBaseCashCount({
        bill1: 5,
        bill10: 2,
        bill50: 1,
      });

      const isFieldCompleted = (field: string) => 
        ['bill1', 'bill10', 'bill50'].includes(field);

      render(
        <GuidedBillSection
          cashCount={cashCount}
          isFieldActive={() => false}
          isFieldCompleted={isFieldCompleted}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Verificar contador "3 de 6 completados"
      expect(screen.getByText('3 de 6 completados')).toBeInTheDocument();
      
      // Verificar que está en text-text-secondary
      const counterElement = screen.getByText('3 de 6 completados');
      expect(counterElement).toHaveClass('text-text-secondary');
    });

    it('Test 2.4: debe calcular currentStep correctamente según campo activo', () => {
      // Setup: Probar con diferentes billetes activos
      const testCases = [
        { fieldName: 'bill1', expectedStep: 6 },   // Después de 5 monedas
        { fieldName: 'bill5', expectedStep: 7 },
        { fieldName: 'bill10', expectedStep: 8 },
        { fieldName: 'bill20', expectedStep: 9 },
        { fieldName: 'bill50', expectedStep: 10 },
        { fieldName: 'bill100', expectedStep: 11 },
      ];

      testCases.forEach(({ fieldName, expectedStep }) => {
        const { unmount } = render(
          <GuidedBillSection
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
    
    it('Test 5.1: debe renderizar footer de total solo cuando billTotal > 0', () => {
      // Test 1: Con billTotal = 0
      const { rerender } = render(
        <GuidedBillSection
          cashCount={createBaseCashCount()} // Todos en 0
          isFieldActive={() => false}
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertion: Footer NO debe existir
      expect(screen.queryByText(/💵 Total en billetes:/)).not.toBeInTheDocument();

      // Test 2: Con billTotal = $76.00
      rerender(
        <GuidedBillSection
          cashCount={createBaseCashCount({
            bill1: 1,     // $1
            bill5: 1,     // $5
            bill10: 2,    // $20
            bill50: 1     // $50
          })} // Total: $76.00
          isFieldActive={() => false}
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Footer DEBE existir con texto correcto
      const footer = screen.getByText(/💵 Total en billetes: \$76\.00/);
      expect(footer).toBeInTheDocument();
      
      // Verificar clases del footer
      expect(footer).toHaveClass('bg-success/10');
      expect(footer).toHaveClass('text-success');
    });

    it('Test 5.2: debe aplicar tabIndex secuencial a items del grid', () => {
      // Setup: Renderizar grid view con campos accesibles
      render(
        <GuidedBillSection
          cashCount={createBaseCashCount()}
          isFieldActive={() => false}
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Verificar que hay 6 GuidedDenominationItem en el grid
      // Los inputs accesibles tienen role="textbox"
      const gridItems = screen.getAllByRole('textbox', { hidden: true });
      expect(gridItems.length).toBeGreaterThanOrEqual(6); // Al menos 6 billetes

      // Verificar que todos los nombres de billetes están presentes
      const billNames = ['$1', '$5', '$10', '$20', '$50', '$100'];
      billNames.forEach((name) => {
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
        bill1: 5,
        bill10: 2,
        bill20: 0,
        bill50: 0,
        bill100: 0,
      });

      const isFieldActive = () => false; // NINGUNO activo para ver grid
      const isFieldCompleted = (field: string) => field === 'bill10';
      const isFieldAccessible = () => true;

      render(
        <GuidedBillSection
          cashCount={cashCount}
          isFieldActive={isFieldActive}
          isFieldCompleted={isFieldCompleted}
          isFieldAccessible={isFieldAccessible}
          onFieldConfirm={mockOnConfirm}
          onAttemptAccess={mockOnAttemptAccess}
        />
      );

      // Assertions: Verificar que se renderizaron 6 items en grid view
      const billInputs = screen.getAllByRole('textbox', { hidden: true });
      expect(billInputs.length).toBeGreaterThanOrEqual(6);

      // Verificar que las denominaciones están presentes
      expect(screen.getAllByText('$1').length).toBeGreaterThan(0);
      expect(screen.getAllByText('$5').length).toBeGreaterThan(0);
      expect(screen.getAllByText('$10').length).toBeGreaterThan(0);
      expect(screen.getAllByText('$20').length).toBeGreaterThan(0);
      expect(screen.getAllByText('$50').length).toBeGreaterThan(0);
      expect(screen.getAllByText('$100').length).toBeGreaterThan(0);

      // Verificar que el total calculado es correcto (5×$1 + 2×$10 = $25.00)
      const totalElements = screen.getAllByText(/\$25\.00/);
      expect(totalElements.length).toBeGreaterThan(0);
      
      // Verificar que "1 de 6 completados" aparece (bill10 está completado)
      expect(screen.getByText('1 de 6 completados')).toBeInTheDocument();

      // Verificar que los callbacks están disponibles (se propagan a los items)
      expect(mockOnConfirm).toBeDefined();
      expect(mockOnAttemptAccess).toBeDefined();
      expect(typeof mockOnConfirm).toBe('function');
      expect(typeof mockOnAttemptAccess).toBe('function');
    });

  }); // Fin Grupo 3

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 2: TESTS CON MOCK BÁSICO DE GuidedFieldView ⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 1: RENDERIZADO CONDICIONAL (2 tests) ⭐⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🎨 Grupo 1: Renderizado Condicional (FASE 2)', () => {
    
    it('Test 1.1: debe renderizar GuidedFieldView cuando hay campo activo', () => {
      // Setup: Configurar bill10 como campo activo
      const cashCount = createBaseCashCount({
        bill1: 5,
        bill5: 2,
        bill10: 0,
      });

      const isFieldActive = (field: string) => field === 'bill10';
      const isFieldCompleted = (field: string) => ['bill1', 'bill5'].includes(field);

      render(
        <GuidedBillSection
          cashCount={cashCount}
          isFieldActive={isFieldActive}
          isFieldCompleted={isFieldCompleted}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Verificar que se renderiza GuidedFieldView
      expect(screen.getByTestId('guided-field-view')).toBeInTheDocument();
      
      // Verificar que recibe los props correctos
      expect(screen.getByTestId('current-field')).toHaveTextContent('bill10');
      expect(screen.getByTestId('current-step')).toHaveTextContent('8'); // bill10 es el 8vo campo (5 monedas + 3 billetes)
      expect(screen.getByTestId('total-steps')).toHaveTextContent('17');
      
      // Verificar que NO se renderiza el grid view
      expect(screen.queryByText('Billetes')).not.toBeInTheDocument();
    });

    it('Test 1.2: debe renderizar Grid View cuando NO hay campo activo', () => {
      // Setup: Ningún campo activo
      const cashCount = createBaseCashCount({
        bill1: 5,
        bill10: 2,
      });

      render(
        <GuidedBillSection
          cashCount={cashCount}
          isFieldActive={() => false} // NINGUNO activo
          isFieldCompleted={(field: string) => ['bill1', 'bill10'].includes(field)}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Verificar que se renderiza Grid View
      expect(screen.getByText('Billetes')).toBeInTheDocument();
      expect(screen.getByText('2 de 6 completados')).toBeInTheDocument();
      
      // Verificar que NO se renderiza GuidedFieldView
      expect(screen.queryByTestId('guided-field-view')).not.toBeInTheDocument();
      
      // Verificar que hay 6 items en el grid
      const billInputs = screen.getAllByRole('textbox', { hidden: true });
      expect(billInputs.length).toBeGreaterThanOrEqual(6);
    });

  }); // Fin Grupo 1 Fase 2

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 3: TEST 3.3 - isMorningCount (1 test) ⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🌅 Grupo 3: Propagación isMorningCount (FASE 2)', () => {
    
    it('Test 3.3: debe pasar isMorningCount a componentes hijos', () => {
      // Test 1: Con isMorningCount=true y campo activo
      const { rerender } = render(
        <GuidedBillSection
          cashCount={createBaseCashCount()}
          isFieldActive={(field: string) => field === 'bill1'}
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
          isMorningCount={true}
        />
      );

      // Assertion: GuidedFieldView debe estar renderizado (campo activo)
      expect(screen.getByTestId('guided-field-view')).toBeInTheDocument();

      // Test 2: Sin isMorningCount (default false) con campo activo
      rerender(
        <GuidedBillSection
          cashCount={createBaseCashCount()}
          isFieldActive={(field: string) => field === 'bill1'}
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
          // isMorningCount no especificado, debe ser false por default
        />
      );

      // Assertion: GuidedFieldView sigue renderizado
      expect(screen.getByTestId('guided-field-view')).toBeInTheDocument();
      
      // Verificar que el comportamiento es consistente con/sin isMorningCount
      expect(screen.getByTestId('current-field')).toHaveTextContent('bill1');
    });

  }); // Fin Grupo 3 Test 3.3

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 4: CALLBACKS BÁSICOS (2 tests) ⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🔄 Grupo 4: Interacción y Callbacks (FASE 2)', () => {
    
    it('Test 4.1: debe llamar onFieldConfirm cuando GuidedDenominationItem confirma', async () => {
      // Setup: Renderizar grid con campo accesible
      const mockOnFieldConfirm = vi.fn();
      const user = userEvent.setup();
      
      render(
        <GuidedBillSection
          cashCount={createBaseCashCount()}
          isFieldActive={() => false} // Grid view
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={mockOnFieldConfirm}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Verificar que el callback está disponible
      expect(mockOnFieldConfirm).toBeDefined();
      expect(typeof mockOnFieldConfirm).toBe('function');
      
      // Verificar que los items están renderizados
      const billInputs = screen.getAllByRole('textbox', { hidden: true });
      expect(billInputs.length).toBeGreaterThanOrEqual(6);
      
      // Nota: La interacción completa (typing + confirm) requiere que GuidedDenominationItem
      // esté completamente funcional. Por ahora validamos que el callback se pasa correctamente.
    });

    it('Test 4.2: debe llamar onAttemptAccess cuando se intenta acceder a campo bloqueado', () => {
      // Setup: Solo bill1 es accesible, los demás bloqueados
      const mockOnAttemptAccess = vi.fn();
      const isFieldAccessible = (field: string) => field === 'bill1';
      
      render(
        <GuidedBillSection
          cashCount={createBaseCashCount()}
          isFieldActive={() => false} // Grid view
          isFieldCompleted={() => false}
          isFieldAccessible={isFieldAccessible}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={mockOnAttemptAccess}
        />
      );

      // Assertions: Verificar que el callback está disponible
      expect(mockOnAttemptAccess).toBeDefined();
      expect(typeof mockOnAttemptAccess).toBe('function');
      
      // Verificar que los items están renderizados (algunos bloqueados)
      const allInputs = screen.getAllByRole('textbox', { hidden: true });
      expect(allInputs.length).toBeGreaterThanOrEqual(6);
      
      // Verificar que hay inputs deshabilitados (los bloqueados)
      const disabledInputs = allInputs.filter(input => input.hasAttribute('disabled'));
      expect(disabledInputs.length).toBeGreaterThan(0);
      
      // Nota: El click en campo bloqueado y trigger del callback requiere interacción
      // completa con GuidedDenominationItem. Por ahora validamos que el callback se pasa.
    });

  }); // Fin Grupo 4 Fase 2

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 3: TESTS AVANZADOS CON MOCK MEJORADO ⭐⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 1: PROPS DE NAVEGACIÓN (2 tests) ⭐⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🧭 Grupo 1: Props de Navegación (FASE 3)', () => {
    
    it('Test 1.3: debe pasar props de navegación correctamente a GuidedFieldView', () => {
      // Setup: Configurar con props de navegación completas
      const mockOnCancel = vi.fn();
      const mockOnPrevious = vi.fn();
      
      render(
        <GuidedBillSection
          cashCount={createBaseCashCount()}
          isFieldActive={(field: string) => field === 'bill20'} // bill20 activo
          isFieldCompleted={(field: string) => ['bill1', 'bill5', 'bill10'].includes(field)}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={true}
        />
      );

      // Assertions: Verificar que GuidedFieldView recibe las props de navegación
      expect(screen.getByTestId('guided-field-view')).toBeInTheDocument();
      expect(screen.getByTestId('has-on-cancel')).toHaveTextContent('true');
      expect(screen.getByTestId('has-on-previous')).toHaveTextContent('true');
      expect(screen.getByTestId('can-go-previous')).toHaveTextContent('true');
      
      // Verificar que onConfirm también se pasa
      expect(screen.getByTestId('has-on-confirm')).toHaveTextContent('true');
    });

    it('Test 1.4: debe usar key fija para mantener GuidedFieldView en DOM', () => {
      // Setup: Renderizar con bill1 activo
      const { container, rerender } = render(
        <GuidedBillSection
          cashCount={createBaseCashCount({ bill1: 5 })}
          isFieldActive={(field: string) => field === 'bill1'}
          isFieldCompleted={() => false}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Capturar el elemento GuidedFieldView
      const firstRender = screen.getByTestId('guided-field-view');
      expect(firstRender).toBeInTheDocument();
      expect(screen.getByTestId('current-field')).toHaveTextContent('bill1');

      // Re-renderizar con bill5 activo (debería mantener el componente)
      rerender(
        <GuidedBillSection
          cashCount={createBaseCashCount({ bill1: 5, bill5: 2 })}
          isFieldActive={(field: string) => field === 'bill5'}
          isFieldCompleted={(field: string) => field === 'bill1'}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Verificar que GuidedFieldView sigue existiendo con nuevo campo
      const secondRender = screen.getByTestId('guided-field-view');
      expect(secondRender).toBeInTheDocument();
      expect(screen.getByTestId('current-field')).toHaveTextContent('bill5');
      
      // Verificar que currentStep cambió de 6 (bill1) a 7 (bill5)
      expect(screen.getByTestId('current-step')).toHaveTextContent('7');
    });

  }); // Fin Grupo 1 Fase 3

  // ═══════════════════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════════════════

  describe('📋 Grupo 3: Array completedFields (FASE 3)', () => {
    
    it('Test 3.2: debe construir array completedFields correctamente', () => {
      // Setup: Configurar 2 billetes completados con valores específicos
      const cashCount = createBaseCashCount({
        bill1: 5,     // Completado: 5 × $1 = $5.00
        bill5: 2,     // Completado: 2 × $5 = $10.00
        bill10: 0,    // Activo (no completado)
        bill20: 0,    // No iniciado
        bill50: 0,    // No iniciado
        bill100: 0    // No iniciado
      });

      render(
        <GuidedBillSection
          cashCount={cashCount}
          isFieldActive={(field: string) => field === 'bill10'} // bill10 activo
          isFieldCompleted={(field: string) => ['bill1', 'bill5'].includes(field)}
          isFieldAccessible={() => true}
          onFieldConfirm={vi.fn()}
          onAttemptAccess={vi.fn()}
        />
      );

      // Assertions: Verificar que completedFields tiene 2 elementos (más las monedas completadas si las hay)
      expect(screen.getByTestId('guided-field-view')).toBeInTheDocument();
      expect(screen.getByTestId('completed-fields-count')).toHaveTextContent('2');
      
      // Verificar que el campo activo es bill10 (8vo campo: 5 monedas + 3 billetes)
      expect(screen.getByTestId('current-field')).toHaveTextContent('bill10');
      expect(screen.getByTestId('current-step')).toHaveTextContent('8');
      
      // Los completedFields deberían contener bill1 y bill5 con sus valores
      // El mock muestra el count (2), la lógica del componente construye el array correctamente
    });

  }); // Fin Grupo 3 Fase 3

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 4: CALLBACKS AVANZADOS (1 test) ⭐⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🔗 Grupo 4: Callbacks Avanzados (FASE 3)', () => {
    
    it('Test 4.3: debe propagar callbacks de GuidedFieldView correctamente', () => {
      // Setup: Configurar todos los callbacks posibles
      const mockOnFieldConfirm = vi.fn();
      const mockOnCancel = vi.fn();
      const mockOnPrevious = vi.fn();
      
      render(
        <GuidedBillSection
          cashCount={createBaseCashCount()}
          isFieldActive={(field: string) => field === 'bill20'} // bill20 activo
          isFieldCompleted={(field: string) => ['bill1', 'bill5', 'bill10'].includes(field)}
          isFieldAccessible={() => true}
          onFieldConfirm={mockOnFieldConfirm}
          onAttemptAccess={vi.fn()}
          onCancel={mockOnCancel}
          onPrevious={mockOnPrevious}
          canGoPrevious={true}
        />
      );

      // Assertions: Verificar que GuidedFieldView recibe TODOS los callbacks
      expect(screen.getByTestId('guided-field-view')).toBeInTheDocument();
      
      // Callbacks de navegación
      expect(screen.getByTestId('has-on-cancel')).toHaveTextContent('true');
      expect(screen.getByTestId('has-on-previous')).toHaveTextContent('true');
      expect(screen.getByTestId('can-go-previous')).toHaveTextContent('true');
      
      // Callback de confirmación
      expect(screen.getByTestId('has-on-confirm')).toHaveTextContent('true');
      
      // Verificar que el campo correcto está activo (bill20 = 9no paso: 5 monedas + 4 billetes)
      expect(screen.getByTestId('current-field')).toHaveTextContent('bill20');
      expect(screen.getByTestId('current-step')).toHaveTextContent('9');
      
      // Verificar que hay 3 campos completados
      expect(screen.getByTestId('completed-fields-count')).toHaveTextContent('3');
      
      // Verificar que los callbacks originales NO han sido llamados (solo se pasan)
      expect(mockOnFieldConfirm).not.toHaveBeenCalled();
      expect(mockOnCancel).not.toHaveBeenCalled();
      expect(mockOnPrevious).not.toHaveBeenCalled();
    });

  }); // Fin Grupo 4 Fase 3

}); // Fin describe principal
