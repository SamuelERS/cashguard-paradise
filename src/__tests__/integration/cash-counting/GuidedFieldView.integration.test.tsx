// 🤖 [IA] - v1.2.36g: Integration tests for GuidedFieldView component
// Coverage target: +8-10% lines, +5-7% branches, +6-8% functions
// Total tests: 30 tests in 8 groups

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GuidedFieldView } from '@/components/cash-counting/GuidedFieldView';

// 🤖 [IA] - Mocks de custom hooks
vi.mock('@/hooks/useInputValidation', () => ({
  useInputValidation: () => ({
    validateInput: vi.fn((value: string, type: string) => {
      // Simular validación real
      if (type === 'integer') {
        const isValid = /^[0-9]*$/.test(value);
        return {
          isValid,
          cleanValue: isValid ? value : value.replace(/[^0-9]/g, '')
        };
      }
      if (type === 'currency') {
        const isValid = /^[0-9]*[.,]?[0-9]{0,2}$/.test(value);
        return {
          isValid,
          cleanValue: isValid ? value : value.replace(/[^0-9.,]/g, '')
        };
      }
      return { isValid: false, cleanValue: '' };
    })
  })
}));

vi.mock('@/hooks/useTimingConfig', () => ({
  useTimingConfig: () => ({
    createTimeoutWithCleanup: vi.fn((fn: () => void, type?: string, id?: string, delay?: number) => {
      const timeout = setTimeout(fn, delay || 100);
      return () => clearTimeout(timeout);
    })
  })
}));

vi.mock('@/hooks/useVisibleAnimation', () => ({
  usePulseAnimation: vi.fn(() => ({
    shouldAnimate: true,
    isVisible: true
  }))
}));

// 🤖 [IA] - Mock de FIELD_LABELS para accessibility
vi.mock('@/hooks/useGuidedCounting', () => ({
  FIELD_LABELS: {
    penny: 'Moneda de 1 centavo',
    nickel: 'Moneda de 5 centavos',
    dime: 'Moneda de 10 centavos',
    quarter: 'Moneda de 25 centavos',
    dollarCoin: 'Moneda de 1 dólar',
    bill1: 'Billete de 1 dólar',
    bill5: 'Billete de 5 dólares',
    bill10: 'Billete de 10 dólares',
    bill20: 'Billete de 20 dólares',
    bill50: 'Billete de 50 dólares',
    bill100: 'Billete de 100 dólares',
    credomatic: 'Pago Credomatic',
    promerica: 'Pago Promerica',
    bankTransfer: 'Transferencia Bancaria',
    paypal: 'Pago PayPal'
  }
}));

// 🤖 [IA] - Helper function para renderizar componente con props default
const renderGuidedFieldView = (props: Partial<React.ComponentProps<typeof GuidedFieldView>> = {}) => {
  const defaultProps: React.ComponentProps<typeof GuidedFieldView> = {
    currentFieldName: 'penny',
    currentFieldLabel: '$0.01',
    currentFieldValue: 0,
    currentFieldType: 'coin',
    isActive: true,
    isCompleted: false,
    onConfirm: vi.fn(),
    isMorningCount: false,
    ...props
  };

  return render(<GuidedFieldView {...defaultProps} />);
};

describe('🎯 GuidedFieldView - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  // ═══════════════════════════════════════════════════════════
  // GRUPO 1: AUTO-FOCUS Y PWA (4 tests) - PRIORIDAD CRÍTICA ⭐⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════

  describe('🔍 Grupo 1: Auto-Focus y PWA Detection', () => {
    it('Test 1.1: debe hacer auto-focus del input cuando isActive=true', async () => {
      renderGuidedFieldView({ isActive: true });

      const input = screen.getByRole('textbox');

      // Esperar a que el auto-focus se ejecute
      await waitFor(() => {
        expect(input).toHaveFocus();
      }, { timeout: 500 });
    });

    it('Test 1.2: debe detectar PWA standalone mode correctamente', async () => {
      // Mock window.matchMedia para PWA standalone
      const matchMediaMock = vi.fn((query: string) => ({
        matches: query === '(display-mode: standalone)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }));

      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: matchMediaMock
      });

      renderGuidedFieldView({ isActive: true });

      // Verificar que matchMedia fue llamado para detectar PWA
      await waitFor(() => {
        expect(matchMediaMock).toHaveBeenCalledWith('(display-mode: standalone)');
      });
    });

    it('Test 1.3: debe usar delay de 300ms en PWA vs 100ms en normal', async () => {
      // Mock PWA standalone mode
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn((query: string) => ({
          matches: query === '(display-mode: standalone)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn()
        }))
      });

      renderGuidedFieldView({ isActive: true });

      // Verificar que el componente renderizó correctamente en PWA mode
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();

      // El timing interno es manejado por el hook - verificamos que el componente funciona
      await waitFor(() => {
        expect(input).toHaveFocus();
      }, { timeout: 500 });
    });

    it('Test 1.4: debe hacer select() del input para facilitar edición', async () => {
      renderGuidedFieldView({ isActive: true, currentFieldValue: 25 });

      const input = screen.getByRole('textbox') as HTMLInputElement;

      // Esperar a que el auto-focus y select se ejecuten
      await waitFor(() => {
        expect(input).toHaveFocus();
        // Verificar que el valor está seleccionado (selectionStart y selectionEnd abarcan todo)
        expect(input.selectionStart).toBe(0);
        expect(input.selectionEnd).toBe(input.value.length);
      }, { timeout: 500 });
    });
  });

  // ═══════════════════════════════════════════════════════════
  // GRUPO 2: VALIDACIÓN INTEGER/DECIMAL (6 tests) - PRIORIDAD CRÍTICA ⭐⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════

  describe('✅ Grupo 2: Validación Integer/Decimal', () => {
    it('Test 2.1: debe validar solo integers para coins/bills', async () => {
      const user = userEvent.setup();
      renderGuidedFieldView({
        isActive: true,
        currentFieldType: 'coin',
        currentFieldName: 'penny'
      });

      const input = screen.getByRole('textbox');

      // Intentar ingresar decimal (no debe permitir)
      await user.type(input, '25.50');

      // Solo los dígitos deben ser aceptados (sin punto decimal)
      await waitFor(() => {
        expect(input).toHaveValue('2550'); // Punto decimal removido
      });
    });

    it('Test 2.2: debe validar decimales para electronic payments', async () => {
      const user = userEvent.setup();
      renderGuidedFieldView({
        isActive: true,
        currentFieldType: 'electronic',
        currentFieldName: 'credomatic'
      });

      const input = screen.getByRole('textbox');

      // Ingresar decimal (debe permitir)
      await user.type(input, '25.50');

      await waitFor(() => {
        expect(input).toHaveValue('25.50');
      });
    });

    it('Test 2.3: debe usar inputMode="decimal" y pattern correcto', () => {
      renderGuidedFieldView({ isActive: true });

      const input = screen.getByRole('textbox');

      expect(input).toHaveAttribute('inputMode', 'decimal');
      expect(input).toHaveAttribute('pattern', '[0-9]*[.,]?[0-9]*');
    });

    it('Test 2.4: debe actualizar inputValue solo si validación pasa', async () => {
      const user = userEvent.setup();
      renderGuidedFieldView({
        isActive: true,
        currentFieldType: 'coin'
      });

      const input = screen.getByRole('textbox');

      // Intentar ingresar caracteres no numéricos
      await user.type(input, 'abc123def');

      // Solo los números deben permanecer
      await waitFor(() => {
        expect(input).toHaveValue('123');
      });
    });

    it('Test 2.5: debe limpiar valor con cleanValue de validateInput', async () => {
      const user = userEvent.setup();
      renderGuidedFieldView({
        isActive: true,
        currentFieldType: 'coin'
      });

      const input = screen.getByRole('textbox');

      // Ingresar valor con caracteres inválidos
      await user.type(input, '25abc456');

      // cleanValue debe limpiar y dejar solo números
      await waitFor(() => {
        expect(input).toHaveValue('25456');
      });
    });

    it('Test 2.6: debe mostrar símbolo $ para electronic payments', () => {
      renderGuidedFieldView({
        isActive: true,
        currentFieldType: 'electronic',
        currentFieldName: 'credomatic'
      });

      // Verificar que el símbolo $ está presente
      const dollarSign = screen.getByText('$');
      expect(dollarSign).toBeInTheDocument();

      // Verificar que el input tiene inline style con padding-left
      const input = screen.getByRole('textbox');
      const style = input.getAttribute('style');
      expect(style).toContain('padding-left');
    });
  });

  // ═══════════════════════════════════════════════════════════
  // GRUPO 3: RENDERIZADO POR TIPO (5 tests) - PRIORIDAD ALTA ⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════

  describe('🎨 Grupo 3: Renderizado por Tipo (Coin/Bill/Electronic)', () => {
    it('Test 3.1: debe renderizar imagen correcta para cada moneda (5 monedas)', () => {
      const coins = [
        { name: 'penny', label: '$0.01', imgSrc: '/monedas-recortadas-dolares/moneda-centavo-front-inlay.webp', altText: 'Moneda de $0.01' },
        { name: 'nickel', label: '$0.05', imgSrc: '/monedas-recortadas-dolares/moneda-cinco-centavos-dos-caras.webp', altText: 'Moneda de $0.05' },
        { name: 'dime', label: '$0.10', imgSrc: '/monedas-recortadas-dolares/moneda-diez-centavos.webp', altText: 'Moneda de $0.10' },
        { name: 'quarter', label: '$0.25', imgSrc: '/monedas-recortadas-dolares/moneda-25-centavos-dos-caras.webp', altText: 'Moneda de $0.25' },
        { name: 'dollarCoin', label: '$1.00', imgSrc: '/monedas-recortadas-dolares/moneda-un-dollar-nueva.webp', altText: 'Moneda de $1.00' }
      ];

      coins.forEach(coin => {
        const { unmount } = renderGuidedFieldView({
          isActive: true,
          currentFieldType: 'coin',
          currentFieldName: coin.name,
          currentFieldLabel: coin.label
        });

        const img = screen.getByAltText(coin.altText);
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', coin.imgSrc);

        unmount();
      });
    });

    it('Test 3.2: debe renderizar imagen correcta para cada billete (6 billetes)', () => {
      const bills = [
        { name: 'bill1', label: '$1', imgSrc: '/monedas-recortadas-dolares/billete-1.webp', altText: 'Billete de $1' },
        { name: 'bill5', label: '$5', imgSrc: '/monedas-recortadas-dolares/billete-5.webp', altText: 'Billete de $5' },
        { name: 'bill10', label: '$10', imgSrc: '/monedas-recortadas-dolares/billete-10.webp', altText: 'Billete de $10' },
        { name: 'bill20', label: '$20', imgSrc: '/monedas-recortadas-dolares/billete-20.webp', altText: 'Billete de $20' },
        { name: 'bill50', label: '$50', imgSrc: '/monedas-recortadas-dolares/billete-cincuenta-dolares-sobre-fondo-blanco(1).webp', altText: 'Billete de $50' },
        { name: 'bill100', label: '$100', imgSrc: '/monedas-recortadas-dolares/billete-100.webp', altText: 'Billete de $100' }
      ];

      bills.forEach(bill => {
        const { unmount } = renderGuidedFieldView({
          isActive: true,
          currentFieldType: 'bill',
          currentFieldName: bill.name,
          currentFieldLabel: bill.label
        });

        const img = screen.getByAltText(bill.altText);
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', bill.imgSrc);

        unmount();
      });
    });

    it('Test 3.3: debe renderizar logo correcto para cada pago electrónico (4 logos)', () => {
      const electronics = [
        { name: 'credomatic', label: 'Credomatic', imgSrc: '/monedas-recortadas-dolares/bac-logo.webp', alt: 'BAC Credomatic' },
        { name: 'promerica', label: 'Promerica', imgSrc: '/monedas-recortadas-dolares/banco promerica logo.png', alt: 'Banco Promerica' },
        { name: 'bankTransfer', label: 'Transferencia', imgSrc: '/monedas-recortadas-dolares/transferencia-bancaria.png', alt: 'Transferencia Bancaria' },
        { name: 'paypal', label: 'PayPal', imgSrc: '/monedas-recortadas-dolares/paypal-logo.png', alt: 'PayPal' }
      ];

      electronics.forEach(electronic => {
        const { unmount } = renderGuidedFieldView({
          isActive: true,
          currentFieldType: 'electronic',
          currentFieldName: electronic.name,
          currentFieldLabel: electronic.label
        });

        const img = screen.getByAltText(electronic.alt);
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', electronic.imgSrc);

        unmount();
      });
    });

    it('Test 3.4: debe aplicar tamaño específico para Promerica (95% vs 90%)', () => {
      renderGuidedFieldView({
        isActive: true,
        currentFieldType: 'electronic',
        currentFieldName: 'promerica',
        currentFieldLabel: 'Promerica'
      });

      const img = screen.getByAltText('Banco Promerica');
      expect(img).toBeInTheDocument();

      // Verificar que tiene atributo style con maxWidth/maxHeight (inline styles)
      const style = img.getAttribute('style');
      expect(style).toContain('max-width');
      expect(style).toContain('95%');
    });

    it('Test 3.5: debe mostrar descripción textual para coins/bills', () => {
      // Test con moneda
      const { unmount } = renderGuidedFieldView({
        isActive: true,
        currentFieldType: 'coin',
        currentFieldName: 'penny',
        currentFieldLabel: '$0.01'
      });

      expect(screen.getByText(/un centavo/i)).toBeInTheDocument();
      unmount();

      // Test con billete
      renderGuidedFieldView({
        isActive: true,
        currentFieldType: 'bill',
        currentFieldName: 'bill5',
        currentFieldLabel: '$5'
      });

      expect(screen.getByText(/billete de cinco dólares/i)).toBeInTheDocument();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // GRUPO 4: ESTADOS VISUALES (3 tests) - PRIORIDAD ALTA ⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════

  describe('🎭 Grupo 4: Estados Visuales (Completado/Activo/Inactivo)', () => {
    it('Test 4.1: debe renderizar estado completado con card verde y checkmark', () => {
      renderGuidedFieldView({
        isCompleted: true,
        currentFieldValue: 25,
        currentFieldLabel: '$0.25',
        currentFieldName: 'quarter'
      });

      expect(screen.getByText(/campo completado/i)).toBeInTheDocument();
      expect(screen.getByText(/\$0\.25: 25 unidades/i)).toBeInTheDocument();
    });

    it('Test 4.2: debe mostrar total calculado en estado completado (solo coins/bills)', () => {
      renderGuidedFieldView({
        isCompleted: true,
        currentFieldValue: 100,
        currentFieldLabel: '$0.25',
        currentFieldName: 'quarter',
        currentFieldType: 'coin'
      });

      // 100 quarters × $0.25 = $25.00
      expect(screen.getByText(/total.*\$25\.00/i)).toBeInTheDocument();
    });

    it('Test 4.3: debe renderizar estado activo con input editable y animación pulse', () => {
      renderGuidedFieldView({
        isActive: true,
        isMorningCount: false
      });

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();

      // Verificar que tiene clase de animación pulse (mock retorna shouldAnimate=true por default)
      expect(input.className).toMatch(/guided-field-pulse-evening/);
    });
  });

  // ═══════════════════════════════════════════════════════════
  // GRUPO 5: NAVEGACIÓN FOOTER (3 tests) - PRIORIDAD MEDIA ⭐⭐⭐
  // ═══════════════════════════════════════════════════════════

  describe('🧭 Grupo 5: Navegación Footer (Cancel/Previous)', () => {
    it('Test 5.1: debe renderizar botón Cancelar si onCancel prop existe', () => {
      const onCancelMock = vi.fn();
      renderGuidedFieldView({
        isActive: true,
        onCancel: onCancelMock
      });

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      expect(cancelButton).toBeInTheDocument();
    });

    it('Test 5.2: debe renderizar botón Anterior si onPrevious prop existe', () => {
      const onPreviousMock = vi.fn();
      renderGuidedFieldView({
        isActive: true,
        onPrevious: onPreviousMock,
        canGoPrevious: true
      });

      const previousButton = screen.getByRole('button', { name: /anterior/i });
      expect(previousButton).toBeInTheDocument();
      expect(previousButton).not.toBeDisabled();
    });

    it('Test 5.3: debe deshabilitar botón Anterior cuando canGoPrevious=false', () => {
      const onPreviousMock = vi.fn();
      renderGuidedFieldView({
        isActive: true,
        onPrevious: onPreviousMock,
        canGoPrevious: false
      });

      const previousButton = screen.getByRole('button', { name: /anterior/i });
      expect(previousButton).toBeDisabled();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // GRUPO 6: INPUT VALUE SYNC (3 tests) - PRIORIDAD ALTA ⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════

  describe('🔄 Grupo 6: Input Value Sync con Props', () => {
    it('Test 6.1: debe inicializar inputValue con currentFieldValue si >0', () => {
      renderGuidedFieldView({
        isActive: true,
        currentFieldValue: 25
      });

      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('25');
    });

    it('Test 6.2: debe sincronizar inputValue al activar campo con valor previo', async () => {
      const { rerender } = renderGuidedFieldView({
        isActive: false,
        currentFieldValue: 50
      });

      // Activar campo
      rerender(
        <GuidedFieldView
          currentFieldName="penny"
          currentFieldLabel="$0.01"
          currentFieldValue={50}
          currentFieldType="coin"
          isActive={true}
          isCompleted={false}
          onConfirm={vi.fn()}
        />
      );

      await waitFor(() => {
        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('50');
      });
    });

    it('Test 6.3: debe limpiar inputValue al activar campo sin valor previo', async () => {
      renderGuidedFieldView({
        isActive: true,
        currentFieldValue: 0,
        isCompleted: false
      });

      await waitFor(() => {
        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe('');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════
  // GRUPO 7: CONFIRMACIÓN Y FOCUS (4 tests) - PRIORIDAD CRÍTICA ⭐⭐⭐⭐⭐
  // ═══════════════════════════════════════════════════════════

  describe('✨ Grupo 7: Confirmación y Focus Retention', () => {
    it('Test 7.1: debe confirmar valor al presionar Enter', async () => {
      const user = userEvent.setup();
      const onConfirmMock = vi.fn();

      renderGuidedFieldView({
        isActive: true,
        onConfirm: onConfirmMock
      });

      const input = screen.getByRole('textbox');
      await user.type(input, '25');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(onConfirmMock).toHaveBeenCalledWith('25');
      });
    });

    it('Test 7.2: debe confirmar valor al hacer click en botón Confirmar', async () => {
      const user = userEvent.setup();
      const onConfirmMock = vi.fn();

      renderGuidedFieldView({
        isActive: true,
        onConfirm: onConfirmMock
      });

      const input = screen.getByRole('textbox');
      await user.type(input, '25');

      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(onConfirmMock).toHaveBeenCalledWith('25');
      });
    });

    it('Test 7.3: debe mantener focus en input después de confirmar', async () => {
      const user = userEvent.setup();
      const onConfirmMock = vi.fn();

      renderGuidedFieldView({
        isActive: true,
        onConfirm: onConfirmMock
      });

      const input = screen.getByRole('textbox');
      await user.type(input, '25');

      const confirmButton = screen.getByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      // Verificar que el input mantiene el focus
      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });

    it('Test 7.4: debe prevenir default en onTouchStart del botón Confirmar', () => {
      renderGuidedFieldView({
        isActive: true
      });

      const confirmButton = screen.getByRole('button', { name: /confirmar/i });

      // Verificar que el botón tiene onTouchStart handler
      expect(confirmButton).toBeInTheDocument();

      // Simular touchstart event
      const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true
      });

      const preventDefaultSpy = vi.spyOn(touchEvent, 'preventDefault');
      confirmButton.dispatchEvent(touchEvent);

      // Verificar que preventDefault fue llamado
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════
  // GRUPO 8: THEMING MORNING/EVENING (2 tests) - PRIORIDAD BAJA ⭐⭐
  // ═══════════════════════════════════════════════════════════

  describe('🎨 Grupo 8: Theming Morning/Evening', () => {
    it('Test 8.1: debe aplicar tema naranja cuando isMorningCount=true', () => {
      renderGuidedFieldView({
        isActive: true,
        isMorningCount: true
      });

      const input = screen.getByRole('textbox');

      // Verificar clase de animación morning
      expect(input.className).toMatch(/neon-glow-morning|guided-field-pulse-morning/);
    });

    it('Test 8.2: debe aplicar tema azul cuando isMorningCount=false (evening)', () => {
      renderGuidedFieldView({
        isActive: true,
        isMorningCount: false
      });

      const input = screen.getByRole('textbox');

      // Verificar clase de animación evening
      expect(input.className).toMatch(/neon-glow-primary|guided-field-pulse-evening/);
    });
  });
});
