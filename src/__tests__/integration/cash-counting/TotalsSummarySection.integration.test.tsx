// 🧪 INTEGRATION TESTS - TotalsSummarySection.tsx
// 🤖 [IA] - Tests de integración para componente crítico de confirmación de totales
// ⏱️ Duración estimada: 35-40 min
// 📊 Tests esperados: 17 tests (100% passing)

import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TotalsSummarySection } from '@/components/cash-counting/TotalsSummarySection';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: React.ComponentProps<'p'>) => <p {...props}>{children}</p>
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

// Mock useTimingConfig
vi.mock('@/hooks/useTimingConfig', () => ({
  useTimingConfig: () => ({
    createTimeoutWithCleanup: (callback: () => void) => {
      const id = setTimeout(callback, 2000);
      return () => clearTimeout(id);
    }
  })
}));

describe('💰 TotalsSummarySection - Integration Tests', () => {
  
  // Helper para crear props base
  const createBaseProps = (overrides = {}) => ({
    totalCash: 1500.50,
    totalElectronic: 2345.75,
    currentField: null as 'totalCash' | 'totalElectronic' | null,
    onConfirmTotal: vi.fn(),
    isFieldCompleted: vi.fn(() => false),
    isMorningCount: false,
    ...overrides
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 1: RENDERIZADO Y DISPLAY (5 tests) ⭐⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🎨 Grupo 1: Renderizado y Display de Totales', () => {
    
    it('Test 1.1: debe renderizar todos los totales correctamente', () => {
      // Setup
      const props = createBaseProps({
        totalCash: 1500.50,
        totalElectronic: 2345.75
      });

      render(<TotalsSummarySection {...props} />);

      // Assertions: Verificar totales individuales
      expect(screen.getByText('$1500.50')).toBeInTheDocument();
      expect(screen.getByText('$2345.75')).toBeInTheDocument();
      
      // Verificar total general calculado (1500.50 + 2345.75 = 3846.25)
      expect(screen.getByText('$3846.25')).toBeInTheDocument();
      
      // Verificar labels
      expect(screen.getByText('Total Efectivo')).toBeInTheDocument();
      expect(screen.getByText('Total Electrónico')).toBeInTheDocument();
      expect(screen.getByText('Total General')).toBeInTheDocument();
    });

    it('Test 1.2: debe manejar totales en cero correctamente', () => {
      // Setup: Todos los totales en 0
      const props = createBaseProps({
        totalCash: 0,
        totalElectronic: 0
      });

      render(<TotalsSummarySection {...props} />);

      // Assertions: Verificar que muestra $0.00
      const zeroDisplays = screen.getAllByText('$0.00');
      expect(zeroDisplays.length).toBeGreaterThanOrEqual(3); // Cash, Electronic, y General
      
      // Verificar que no crashea y muestra estructura correcta
      expect(screen.getByText('Total Efectivo')).toBeInTheDocument();
      expect(screen.getByText('Total Electrónico')).toBeInTheDocument();
      expect(screen.getByText('Total General')).toBeInTheDocument();
    });

    it('Test 1.3: debe formatear números grandes correctamente', () => {
      // Setup: Totales muy grandes
      const props = createBaseProps({
        totalCash: 123456.78,
        totalElectronic: 987654.32
      });

      render(<TotalsSummarySection {...props} />);

      // Assertions: Verificar formato con 2 decimales
      expect(screen.getByText('$123456.78')).toBeInTheDocument();
      expect(screen.getByText('$987654.32')).toBeInTheDocument();
      
      // Total general: 123456.78 + 987654.32 = 1111111.10
      expect(screen.getByText('$1111111.10')).toBeInTheDocument();
    });

    it('Test 1.4: debe mostrar título correcto', () => {
      // Setup
      const props = createBaseProps();

      render(<TotalsSummarySection {...props} />);

      // Assertions: Verificar heading y descripción
      expect(screen.getByText('Resumen de Totales')).toBeInTheDocument();
      expect(screen.getByText('Confirme los totales calculados automáticamente')).toBeInTheDocument();
    });

    it('Test 1.5: debe renderizar iconos correctamente', () => {
      // Setup
      const props = createBaseProps();

      const { container } = render(<TotalsSummarySection {...props} />);

      // Assertions: Verificar que hay iconos (lucide icons)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
      
      // Verificar estructura básica del componente
      expect(screen.getByText('Total Efectivo')).toBeInTheDocument();
      expect(screen.getByText('Total Electrónico')).toBeInTheDocument();
    });

  }); // Fin Grupo 1

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 2: SISTEMA DE CONFIRMACIÓN (5 tests) ⭐⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🔒 Grupo 2: Sistema de Confirmación de Totales', () => {
    
    it('Test 2.1: NO debe mostrar botón Confirmar cuando no hay campo activo', () => {
      // Setup: Sin campo activo
      const props = createBaseProps({
        currentField: null
      });

      render(<TotalsSummarySection {...props} />);

      // Assertions: No debe haber botón Confirmar visible
      const confirmButtons = screen.queryAllByRole('button', { name: /confirmar/i });
      expect(confirmButtons.length).toBe(0);
    });

    it('Test 2.2: debe mostrar botón Confirmar cuando totalCash está activo', () => {
      // Setup: totalCash activo
      const props = createBaseProps({
        currentField: 'totalCash'
      });

      render(<TotalsSummarySection {...props} />);

      // Assertions: Debe haber UN botón Confirmar visible
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).not.toBeDisabled();
    });

    it('Test 2.3: debe mostrar botón Confirmar cuando totalElectronic está activo', () => {
      // Setup: totalElectronic activo
      const props = createBaseProps({
        currentField: 'totalElectronic'
      });

      render(<TotalsSummarySection {...props} />);

      // Assertions: Debe haber UN botón Confirmar visible
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      expect(confirmButton).toBeInTheDocument();
      expect(confirmButton).not.toBeDisabled();
    });

    it('Test 2.4: debe llamar onConfirmTotal al hacer click en Confirmar', async () => {
      // Setup: Campo activo con callback mock
      const mockOnConfirm = vi.fn();
      const props = createBaseProps({
        currentField: 'totalCash',
        onConfirmTotal: mockOnConfirm
      });

      render(<TotalsSummarySection {...props} />);

      // Action: Click en Confirmar
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      fireEvent.click(confirmButton);

      // Assertions: Callback debe ser llamado
      // 🤖 [IA] - CI Hotfix: Timeout aumentado para GitHub Actions runners (2-3x más lentos)
      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      }, { timeout: 10000 }); // 10s para CI compatibility
    });

    it('Test 2.5: NO debe mostrar botón en campo completado', () => {
      // Setup: Campo completado (no activo)
      const mockIsFieldCompleted = vi.fn((field: string) => field === 'totalCash');
      const props = createBaseProps({
        currentField: null,
        isFieldCompleted: mockIsFieldCompleted
      });

      render(<TotalsSummarySection {...props} />);

      // Assertions: No debe haber botón visible (campo ya completado)
      const confirmButtons = screen.queryAllByRole('button', { name: /confirmar/i });
      expect(confirmButtons.length).toBe(0);
    });

  }); // Fin Grupo 2

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 3: ESTADOS VISUALES (4 tests) ⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🎭 Grupo 3: Estados Visuales y Estilos', () => {
    
    it('Test 3.1: debe aplicar estilos para modo matutino (isMorningCount=true)', () => {
      // Setup: Modo matutino
      const props = createBaseProps({
        isMorningCount: true,
        currentField: 'totalCash'
      });

      const { container } = render(<TotalsSummarySection {...props} />);

      // Assertions: Verificar que se renderiza correctamente
      expect(screen.getByText('Total Efectivo')).toBeInTheDocument();
      
      // Botón Confirmar debe tener data-context="morning"
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      expect(confirmButton).toHaveAttribute('data-context', 'morning');
    });

    it('Test 3.2: debe aplicar estilos para modo vespertino (isMorningCount=false)', () => {
      // Setup: Modo vespertino
      const props = createBaseProps({
        isMorningCount: false,
        currentField: 'totalCash'
      });

      const { container } = render(<TotalsSummarySection {...props} />);

      // Assertions: Verificar que se renderiza correctamente
      expect(screen.getByText('Total Efectivo')).toBeInTheDocument();
      
      // Botón Confirmar debe tener data-context="evening"
      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      expect(confirmButton).toHaveAttribute('data-context', 'evening');
    });

    it('Test 3.3: debe mostrar icono de check en campo completado', () => {
      // Setup: Campo totalCash completado
      const mockIsFieldCompleted = vi.fn((field: string) => field === 'totalCash');
      const props = createBaseProps({
        currentField: null,
        isFieldCompleted: mockIsFieldCompleted
      });

      const { container } = render(<TotalsSummarySection {...props} />);

      // Assertions: Verificar que hay un icono Check renderizado (lucide-react)
      const checkIcons = container.querySelectorAll('svg.lucide-check');
      expect(checkIcons.length).toBeGreaterThan(0);
    });

    it('Test 3.4: debe usar testids correctos en secciones', () => {
      // Setup
      const props = createBaseProps();

      render(<TotalsSummarySection {...props} />);

      // Assertions: Verificar testids específicos
      expect(screen.getByTestId('total-cash-section')).toBeInTheDocument();
      expect(screen.getByTestId('total-electronic-section')).toBeInTheDocument();
    });

  }); // Fin Grupo 3

  // ═══════════════════════════════════════════════════════════════════════════
  // FASE 4: EDGE CASES (3 tests) ⭐⭐⭐
  // ═══════════════════════════════════════════════════════════════════════════

  describe('🔧 Grupo 4: Edge Cases y Validación', () => {
    
    it('Test 4.1: debe manejar totales negativos correctamente', () => {
      // Setup: Total negativo (caso excepcional)
      const props = createBaseProps({
        totalCash: -100.50,
        totalElectronic: 200
      });

      render(<TotalsSummarySection {...props} />);

      // Assertions: Debe renderizar sin crashear
      expect(screen.getByText('$-100.50')).toBeInTheDocument();
      expect(screen.getByText('$200.00')).toBeInTheDocument();
      
      // Total general: -100.50 + 200 = 99.50
      expect(screen.getByText('$99.50')).toBeInTheDocument();
    });

    it('Test 4.2: debe formatear totales muy grandes correctamente', () => {
      // Setup: Totales extremadamente grandes
      const props = createBaseProps({
        totalCash: 9999999.99,
        totalElectronic: 8888888.88
      });

      render(<TotalsSummarySection {...props} />);

      // Assertions: Verificar formato correcto
      expect(screen.getByText('$9999999.99')).toBeInTheDocument();
      expect(screen.getByText('$8888888.88')).toBeInTheDocument();
      
      // Total general: 9999999.99 + 8888888.88 = 18888888.87
      expect(screen.getByText('$18888888.87')).toBeInTheDocument();
    });

    it('Test 4.3: debe funcionar con props opcionales omitidos', () => {
      // Setup: Props mínimos requeridos (isMorningCount es opcional)
      const minimalProps = {
        totalCash: 100,
        totalElectronic: 200,
        currentField: null as 'totalCash' | 'totalElectronic' | null,
        onConfirmTotal: vi.fn(),
        isFieldCompleted: vi.fn(() => false)
        // isMorningCount omitido (debe usar default: false)
      };

      // Action & Assertion: No debe crashear
      expect(() => {
        render(<TotalsSummarySection {...minimalProps} />);
      }).not.toThrow();

      // Verificar que renderiza correctamente
      expect(screen.getByText('$100.00')).toBeInTheDocument();
      expect(screen.getByText('$200.00')).toBeInTheDocument();
      expect(screen.getByText('$300.00')).toBeInTheDocument();
    });

  }); // Fin Grupo 4

}); // Fin suite
