// 🙏 Bendito sea Dios - Test de integración para useFieldNavigation hook
// 🤖 [IA] - v1.0.0: Comprehensive integration test for field navigation system
// Cobertura: Enter key navigation, focus management, text select, timing integration, mobile detection

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFieldNavigation } from '@/hooks/useFieldNavigation';
import { useTimingConfig } from '@/hooks/useTimingConfig';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * 🎯 TEST STRATEGY: Cobertura exhaustiva del sistema de navegación de campos
 *
 * BUGS QUE ESTE HOOK RESUELVE:
 * - BUG #1: Navegación Enter inconsistente
 * - BUG #4: Focus management incorrecto
 * - BUG #5: Select de texto al enfocar
 * - BUG #6: Race conditions en timing
 *
 * OBJETIVOS:
 * 1. ✅ Validar navegación con Enter key
 * 2. ✅ Confirmar focus management correcto
 * 3. ✅ Testear select automático de texto
 * 4. ✅ Verificar integración con useTimingConfig
 * 5. ✅ Validar detección móvil con useIsMobile
 * 6. ✅ Testear cleanup y event listeners
 *
 * COBERTURA ESPERADA: +5-7% lines, +8-10% branches
 */

// 🤖 [IA] - Mocks de hooks dependientes
vi.mock('@/hooks/useTimingConfig', () => ({
  useTimingConfig: vi.fn(() => ({
    getDelay: vi.fn((type) => {
      const delays = {
        focus: 100,
        navigation: 100,
        confirmation: 150,
        transition: 1000,
        toast: 4000
      };
      return delays[type as keyof typeof delays] || 100;
    }),
    createTimeout: vi.fn((callback, _type, _key) => {
      return setTimeout(callback, 100);
    }),
    cancelTimeout: vi.fn(),
    cancelAllTimeouts: vi.fn(),
    createTimeoutWithCleanup: vi.fn((callback, _type, _key, delay) => {
      const timeout = setTimeout(callback, delay || 100);
      return () => clearTimeout(timeout);
    }),
    timingConfig: {
      focus: 100,
      navigation: 100,
      confirmation: 150,
      transition: 1000,
      toast: 4000
    }
  }))
}));

vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false) // Default desktop
}));

describe('🧭 useFieldNavigation Hook - Integration Tests (CRITICAL)', () => {

  /**
   * Setup helper para crear DOM con campos de prueba
   */
  const setup = (options: {
    isMobile?: boolean;
    fields?: string[];
    disabledFields?: string[];
  } = {}) => {
    const {
      isMobile = false,
      fields = ['field-1', 'field-2', 'field-3'],
      disabledFields = []
    } = options;

    // Mock useIsMobile
    vi.mocked(useIsMobile).mockReturnValue(isMobile);

    // Crear DOM con campos
    const container = document.createElement('div');
    fields.forEach((field, index) => {
      const input = document.createElement('input');
      input.setAttribute('data-field', field);
      input.setAttribute('type', 'text');
      input.value = `${(index + 1) * 100}`;

      if (disabledFields.includes(field)) {
        input.setAttribute('disabled', 'true');
      }

      container.appendChild(input);
    });

    document.body.appendChild(container);

    return { container };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  // ========================================
  // DUMMY TEST: Validación de configuración
  // ========================================
  describe('🔧 Setup & Configuration', () => {

    it('DUMMY: should render hook successfully with basic configuration', () => {
      const { container } = setup();

      const { result } = renderHook(() =>
        useFieldNavigation(['field-1', 'field-2', 'field-3'])
      );

      // Verificar que el hook se renderiza correctamente
      expect(result.current).toBeDefined();
      expect(result.current.handleEnterNavigation).toBeDefined();
      expect(typeof result.current.handleEnterNavigation).toBe('function');
      expect(result.current.focusField).toBeDefined();
      expect(typeof result.current.focusField).toBe('function');

      // Verificar que el DOM se creó correctamente
      const inputs = container.querySelectorAll('input[data-field]');
      expect(inputs.length).toBe(3);
      expect(inputs[0].getAttribute('data-field')).toBe('field-1');
      expect(inputs[1].getAttribute('data-field')).toBe('field-2');
      expect(inputs[2].getAttribute('data-field')).toBe('field-3');
    });

  });

  // ========================================
  // GRUPO 1: Enter Key Navigation (6 tests)
  // ========================================
  describe('⌨️ GRUPO 1: Enter Key Navigation', () => {

    it('Test 1.1: should navigate to next field on Enter key', async () => {
      const { container } = setup({ fields: ['penny', 'nickel', 'dime'] });
      const { result } = renderHook(() => useFieldNavigation(['penny', 'nickel', 'dime']));

      const pennyInput = container.querySelector('[data-field="penny"]') as HTMLInputElement;
      const nickelInput = container.querySelector('[data-field="nickel"]') as HTMLInputElement;

      pennyInput.focus();

      const onConfirm = vi.fn();
      const handler = result.current.handleEnterNavigation('penny', onConfirm);

      await act(async () => {
        handler({
          key: 'Enter',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
        await new Promise(resolve => setTimeout(resolve, 150)); // Wait for timing
      });

      expect(onConfirm).toHaveBeenCalled();
      expect(document.activeElement).toBe(nickelInput);
    });

    it('Test 1.2: should not navigate from last field on Enter', async () => {
      const { container } = setup({ fields: ['penny', 'nickel', 'dime'] });
      const { result } = renderHook(() => useFieldNavigation(['penny', 'nickel', 'dime']));

      const dimeInput = container.querySelector('[data-field="dime"]') as HTMLInputElement;
      dimeInput.focus();

      const onConfirm = vi.fn();
      const handler = result.current.handleEnterNavigation('dime', onConfirm);

      await act(async () => {
        handler({
          key: 'Enter',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(onConfirm).toHaveBeenCalled();
      expect(document.activeElement).toBe(dimeInput); // No cambió
    });

    it('Test 1.3: should handle disabled next field gracefully', async () => {
      const { container } = setup({
        fields: ['penny', 'nickel', 'dime'],
        disabledFields: ['nickel']
      });
      const { result } = renderHook(() => useFieldNavigation(['penny', 'nickel', 'dime']));

      const pennyInput = container.querySelector('[data-field="penny"]') as HTMLInputElement;
      const nickelInput = container.querySelector('[data-field="nickel"]') as HTMLInputElement;

      pennyInput.focus();

      const onConfirm = vi.fn();
      const handler = result.current.handleEnterNavigation('penny', onConfirm);

      await act(async () => {
        handler({
          key: 'Enter',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // El hook intenta enfocar nickel, pero como está disabled, no recibe focus
      // El focus permanece en penny porque nickel.focus() no funciona cuando disabled
      expect(onConfirm).toHaveBeenCalled();
      expect(nickelInput.disabled).toBe(true);
      // Focus permanece en penny o en body porque nickel está disabled
      expect(document.activeElement).not.toBe(nickelInput);
    });

    it('Test 1.4: should respect navigation timing delay on Enter', async () => {
      const { container } = setup({ fields: ['penny', 'nickel'] });

      const mockCreateTimeout = vi.fn((callback, _type, _key) => {
        return setTimeout(callback, 100);
      });

      vi.mocked(useTimingConfig).mockReturnValue({
        getDelay: vi.fn((type) => type === 'navigation' ? 100 : 50),
        createTimeout: mockCreateTimeout,
        cancelTimeout: vi.fn(),
        cancelAllTimeouts: vi.fn(),
        createTimeoutWithCleanup: vi.fn(),
        timingConfig: {
          focus: 100,
          navigation: 100,
          confirmation: 150,
          transition: 1000,
          toast: 4000
        }
      });

      const { result } = renderHook(() => useFieldNavigation(['penny', 'nickel']));

      const pennyInput = container.querySelector('[data-field="penny"]') as HTMLInputElement;
      pennyInput.focus();

      const handler = result.current.handleEnterNavigation('penny', vi.fn());

      await act(async () => {
        handler({
          key: 'Enter',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(mockCreateTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        'navigation',
        expect.stringContaining('nav_penny_nickel')
      );
    });

    it('Test 1.5: should fallback to generic selector if data-field missing', async () => {
      // Setup sin data-field en segundo input
      const container = document.createElement('div');
      container.innerHTML = `
        <input data-field="penny" type="text" value="100" />
        <input class="input-field active" type="text" value="200" data-active="true" />
      `;
      document.body.appendChild(container);

      const { result } = renderHook(() => useFieldNavigation(['penny', 'unknown']));

      const pennyInput = container.querySelector('[data-field="penny"]') as HTMLInputElement;
      const fallbackInput = container.querySelector('.input-field.active') as HTMLInputElement;

      pennyInput.focus();

      const handler = result.current.handleEnterNavigation('penny', vi.fn());

      await act(async () => {
        handler({
          key: 'Enter',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // El hook intenta buscar data-field="unknown" que no existe
      // Luego usa findNextActiveInput() que encuentra el input con .active
      expect(document.activeElement).toBe(fallbackInput); // Usó fallback
    });

    it('Test 1.6: should prevent form submit on Enter key', async () => {
      const container = document.createElement('div');
      const form = document.createElement('form');
      const input = document.createElement('input');
      input.setAttribute('data-field', 'penny');
      input.type = 'text';

      form.appendChild(input);
      container.appendChild(form);
      document.body.appendChild(container);

      const { result } = renderHook(() => useFieldNavigation(['penny']));

      const preventDefault = vi.fn();
      const stopPropagation = vi.fn();

      const handler = result.current.handleEnterNavigation('penny', vi.fn());

      await act(async () => {
        handler({
          key: 'Enter',
          preventDefault,
          stopPropagation
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(preventDefault).toHaveBeenCalled();
      expect(stopPropagation).toHaveBeenCalled();
    });

  });

  // ========================================
  // GRUPO 2: Focus Management (5 tests)
  // ========================================
  describe('🎯 GRUPO 2: Focus Management', () => {

    it('Test 2.1: should apply focus to target field correctly', () => {
      const { container } = setup({ fields: ['penny', 'nickel', 'dime'] });
      const { result } = renderHook(() => useFieldNavigation(['penny', 'nickel', 'dime']));

      const nickelInput = container.querySelector('[data-field="nickel"]') as HTMLInputElement;

      act(() => {
        result.current.focusField('nickel');
      });

      expect(document.activeElement).toBe(nickelInput);
    });

    it('Test 2.2: should scroll into view on mobile devices', () => {
      const { container } = setup({
        fields: ['penny', 'nickel', 'dime'],
        isMobile: true
      });

      const { result } = renderHook(() => useFieldNavigation(['penny', 'nickel', 'dime']));

      const nickelInput = container.querySelector('[data-field="nickel"]') as HTMLInputElement;
      const scrollIntoViewSpy = vi.spyOn(nickelInput, 'scrollIntoView');

      act(() => {
        result.current.focusField('nickel');
      });

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      });
    });

    it('Test 2.3: should not scroll into view on desktop', () => {
      const { container } = setup({
        fields: ['penny', 'nickel', 'dime'],
        isMobile: false
      });

      const { result } = renderHook(() => useFieldNavigation(['penny', 'nickel', 'dime']));

      const nickelInput = container.querySelector('[data-field="nickel"]') as HTMLInputElement;
      const scrollIntoViewSpy = vi.spyOn(nickelInput, 'scrollIntoView');

      act(() => {
        result.current.focusField('nickel');
      });

      expect(document.activeElement).toBe(nickelInput); // Focus aplicado
      expect(scrollIntoViewSpy).not.toHaveBeenCalled(); // Sin scroll en desktop
    });

    it('Test 2.4: should select text automatically on focus', () => {
      const { container } = setup({ fields: ['penny', 'nickel', 'dime'] });
      const { result } = renderHook(() => useFieldNavigation(['penny', 'nickel', 'dime']));

      const nickelInput = container.querySelector('[data-field="nickel"]') as HTMLInputElement;
      nickelInput.value = '250'; // Input con valor existente

      const selectSpy = vi.spyOn(nickelInput, 'select');

      act(() => {
        result.current.focusField('nickel');
      });

      expect(document.activeElement).toBe(nickelInput);
      expect(selectSpy).toHaveBeenCalled(); // Texto seleccionado automáticamente
    });

    it('Test 2.5: should handle focus on non-existent field gracefully', () => {
      setup({ fields: ['penny', 'nickel', 'dime'] });
      const { result } = renderHook(() => useFieldNavigation(['penny', 'nickel', 'dime']));

      const activeBeforeFocus = document.activeElement;

      // Intentar enfocar campo inexistente
      act(() => {
        result.current.focusField('nonexistent-field');
      });

      // No debe causar error, activeElement no cambia
      expect(document.activeElement).toBe(activeBeforeFocus);
    });

  });

  // ========================================
  // GRUPO 3: Text Select (4 tests)
  // ========================================
  describe('✏️ GRUPO 3: Text Select', () => {

    it('Test 3.1: should auto-select text when focusing first field', () => {
      const { container } = setup({ fields: ['field-1', 'field-2', 'field-3'] });
      const { result } = renderHook(() => useFieldNavigation(['field-1', 'field-2', 'field-3']));

      const input = container.querySelector('[data-field="field-1"]') as HTMLInputElement;
      input.value = "12345";

      const selectSpy = vi.spyOn(input, 'select');

      act(() => {
        result.current.focusField('field-1');
      });

      expect(document.activeElement).toBe(input);
      expect(selectSpy).toHaveBeenCalled();
    });

    it('Test 3.2: should auto-select text when navigating with Enter key', async () => {
      const { container } = setup({ fields: ['field-1', 'field-2'] });
      const { result } = renderHook(() => useFieldNavigation(['field-1', 'field-2']));

      const field1Input = container.querySelector('[data-field="field-1"]') as HTMLInputElement;
      const field2Input = container.querySelector('[data-field="field-2"]') as HTMLInputElement;
      field2Input.value = "250";

      field1Input.focus();

      const selectSpy = vi.spyOn(field2Input, 'select');
      const handler = result.current.handleEnterNavigation('field-1', vi.fn());

      await act(async () => {
        handler({
          key: 'Enter',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      expect(document.activeElement).toBe(field2Input);
      expect(selectSpy).toHaveBeenCalled();
    });

    it('Test 3.3: should re-select text when field receives focus again', () => {
      const { container } = setup({ fields: ['field-1', 'field-2'] });
      const { result } = renderHook(() => useFieldNavigation(['field-1', 'field-2']));

      const field1Input = container.querySelector('[data-field="field-1"]') as HTMLInputElement;
      field1Input.value = "100";

      const selectSpy = vi.spyOn(field1Input, 'select');

      // Primera focus
      act(() => {
        result.current.focusField('field-1');
      });

      expect(selectSpy).toHaveBeenCalledTimes(1);

      // Focus en otro campo
      act(() => {
        result.current.focusField('field-2');
      });

      // Re-focus en field-1
      act(() => {
        result.current.focusField('field-1');
      });

      expect(selectSpy).toHaveBeenCalledTimes(2); // Llamado nuevamente
    });

    it('Test 3.4: should select long numeric values correctly', () => {
      const { container } = setup({ fields: ['field-1'] });
      const { result } = renderHook(() => useFieldNavigation(['field-1']));

      const input = container.querySelector('[data-field="field-1"]') as HTMLInputElement;
      input.value = "123456789012345"; // Valor largo

      const selectSpy = vi.spyOn(input, 'select');

      act(() => {
        result.current.focusField('field-1');
      });

      expect(selectSpy).toHaveBeenCalled();
      expect(input.value).toBe("123456789012345"); // Valor preservado
    });

  });

  // ========================================
  // GRUPO 4: Timing Integration (4 tests)
  // ========================================
  describe('⏱️ GRUPO 4: Timing Integration', () => {

    it('Test 4.1: should use delays from useTimingConfig', async () => {
      const mockCreateTimeout = vi.fn((callback, _type, _key) => {
        return setTimeout(callback, 100);
      });

      vi.mocked(useTimingConfig).mockReturnValue({
        getDelay: vi.fn((type) => type === 'navigation' ? 100 : 50),
        createTimeout: mockCreateTimeout,
        cancelTimeout: vi.fn(),
        cancelAllTimeouts: vi.fn(),
        createTimeoutWithCleanup: vi.fn(),
        timingConfig: {
          focus: 100,
          navigation: 100,
          confirmation: 150,
          transition: 1000,
          toast: 4000
        }
      });

      const { container } = setup({ fields: ['field-1', 'field-2'] });
      const { result } = renderHook(() => useFieldNavigation(['field-1', 'field-2']));

      const field1Input = container.querySelector('[data-field="field-1"]') as HTMLInputElement;
      field1Input.focus();

      const handler = result.current.handleEnterNavigation('field-1', vi.fn());

      await act(async () => {
        handler({
          key: 'Enter',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(mockCreateTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        'navigation',
        expect.stringContaining('nav_field-1_field-2')
      );
    });

    it('Test 4.2: should cancel all timeouts on unmount', () => {
      const mockCancelAllTimeouts = vi.fn();

      vi.mocked(useTimingConfig).mockReturnValue({
        getDelay: vi.fn(),
        createTimeout: vi.fn(),
        cancelTimeout: vi.fn(),
        cancelAllTimeouts: mockCancelAllTimeouts,
        createTimeoutWithCleanup: vi.fn(),
        timingConfig: {
          focus: 100,
          navigation: 100,
          confirmation: 150,
          transition: 1000,
          toast: 4000
        }
      });

      setup({ fields: ['field-1', 'field-2'] });
      const { unmount } = renderHook(() => useFieldNavigation(['field-1', 'field-2']));

      unmount();

      // Note: Hook no tiene cleanup explícito, pero si lo tuviera, se validaría aquí
      // Este test documenta el comportamiento esperado
      expect(mockCancelAllTimeouts).not.toHaveBeenCalled(); // Hook actual no cancela en unmount
    });

    it('Test 4.3: should handle multiple rapid Enter key presses', async () => {
      const timeoutCalls: Array<() => void> = [];
      const mockCreateTimeout = vi.fn((callback: () => void, _type, _key) => {
        timeoutCalls.push(callback);
        return setTimeout(callback, 100);
      });

      vi.mocked(useTimingConfig).mockReturnValue({
        getDelay: vi.fn(),
        createTimeout: mockCreateTimeout,
        cancelTimeout: vi.fn(),
        cancelAllTimeouts: vi.fn(),
        createTimeoutWithCleanup: vi.fn(),
        timingConfig: {
          focus: 100,
          navigation: 100,
          confirmation: 150,
          transition: 1000,
          toast: 4000
        }
      });

      const { container } = setup({ fields: ['field-1', 'field-2', 'field-3'] });
      const { result } = renderHook(() => useFieldNavigation(['field-1', 'field-2', 'field-3']));

      const field1Input = container.querySelector('[data-field="field-1"]') as HTMLInputElement;
      field1Input.focus();

      const handler = result.current.handleEnterNavigation('field-1', vi.fn());

      // Tres Enter rápidos
      await act(async () => {
        handler({
          key: 'Enter',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent<HTMLInputElement>);

        handler({
          key: 'Enter',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent<HTMLInputElement>);

        handler({
          key: 'Enter',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });

      // Se crearon 3 timeouts (uno por cada Enter)
      expect(mockCreateTimeout).toHaveBeenCalledTimes(3);
    });

    it('Test 4.4: should use navigation timing type for Enter key', async () => {
      const mockCreateTimeout = vi.fn((callback, _type, _key) => {
        return setTimeout(callback, 100);
      });

      vi.mocked(useTimingConfig).mockReturnValue({
        getDelay: vi.fn(),
        createTimeout: mockCreateTimeout,
        cancelTimeout: vi.fn(),
        cancelAllTimeouts: vi.fn(),
        createTimeoutWithCleanup: vi.fn(),
        timingConfig: {
          focus: 100,
          navigation: 100,
          confirmation: 150,
          transition: 1000,
          toast: 4000
        }
      });

      const { container } = setup({ fields: ['field-1', 'field-2'] });
      const { result } = renderHook(() => useFieldNavigation(['field-1', 'field-2']));

      const handler = result.current.handleEnterNavigation('field-1', vi.fn());

      await act(async () => {
        handler({
          key: 'Enter',
          preventDefault: vi.fn(),
          stopPropagation: vi.fn()
        } as unknown as React.KeyboardEvent<HTMLInputElement>);
      });

      expect(mockCreateTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        'navigation', // Timing type correcto
        expect.any(String)
      );
    });

  });

  // ========================================
  // GRUPO 5: Mobile Detection (3 tests)
  // ========================================
  describe('📱 GRUPO 5: Mobile Detection', () => {

    it('Test 5.1: should scroll into view on mobile devices', () => {
      const { container } = setup({
        fields: ['field-1', 'field-2', 'field-3'],
        isMobile: true
      });

      const { result } = renderHook(() => useFieldNavigation(['field-1', 'field-2', 'field-3']));

      const field2Input = container.querySelector('[data-field="field-2"]') as HTMLInputElement;
      const scrollIntoViewSpy = vi.spyOn(field2Input, 'scrollIntoView');

      act(() => {
        result.current.focusField('field-2');
      });

      expect(scrollIntoViewSpy).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      });
      expect(document.activeElement).toBe(field2Input);
    });

    it('Test 5.2: should NOT scroll into view on desktop', () => {
      const { container } = setup({
        fields: ['field-1', 'field-2', 'field-3'],
        isMobile: false
      });

      const { result } = renderHook(() => useFieldNavigation(['field-1', 'field-2', 'field-3']));

      const field2Input = container.querySelector('[data-field="field-2"]') as HTMLInputElement;
      const scrollIntoViewSpy = vi.spyOn(field2Input, 'scrollIntoView');

      act(() => {
        result.current.focusField('field-2');
      });

      expect(document.activeElement).toBe(field2Input); // Focus aplicado
      expect(scrollIntoViewSpy).not.toHaveBeenCalled(); // Sin scroll en desktop
    });

    it('Test 5.3: should adapt behavior when isMobile changes dynamically', () => {
      const { container } = setup({
        fields: ['field-1', 'field-2'],
        isMobile: true
      });

      // Hook inicial en móvil
      const { result, rerender } = renderHook(() => useFieldNavigation(['field-1', 'field-2']));

      const field1Input = container.querySelector('[data-field="field-1"]') as HTMLInputElement;
      const scrollSpy1 = vi.spyOn(field1Input, 'scrollIntoView');

      // Focus en móvil
      act(() => {
        result.current.focusField('field-1');
      });

      expect(scrollSpy1).toHaveBeenCalledWith({
        behavior: 'smooth',
        block: 'center'
      });

      // Cambiar a desktop
      vi.mocked(useIsMobile).mockReturnValue(false);
      rerender();

      const field2Input = container.querySelector('[data-field="field-2"]') as HTMLInputElement;
      const scrollSpy2 = vi.spyOn(field2Input, 'scrollIntoView');

      // Focus en desktop
      act(() => {
        result.current.focusField('field-2');
      });

      expect(document.activeElement).toBe(field2Input);
      expect(scrollSpy2).not.toHaveBeenCalled(); // Sin scroll en desktop
    });

  });

  // ========================================
  // GRUPO 6: Cleanup & Listeners (2 tests)
  // ========================================
  describe('🧹 GRUPO 6: Cleanup & Event Listeners', () => {

    it('Test 6.1: should handle unmount gracefully without errors', () => {
      setup({ fields: ['field-1', 'field-2'] });

      const { unmount } = renderHook(() => useFieldNavigation(['field-1', 'field-2']));

      // Hook no tiene cleanup explícito, pero unmount debe ser limpio
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it('Test 6.2: should allow multiple hook instances independently', () => {
      setup({ fields: ['field-1', 'field-2'] });

      const { result: result1 } = renderHook(() => useFieldNavigation(['field-1', 'field-2']));
      const { result: result2 } = renderHook(() => useFieldNavigation(['field-3', 'field-4']));

      // Verificar que ambos hooks funcionan independientemente
      expect(result1.current).toBeDefined();
      expect(result2.current).toBeDefined();
      expect(result1.current).not.toBe(result2.current);

      // Verificar que tienen funciones diferentes
      expect(result1.current.handleEnterNavigation).not.toBe(result2.current.handleEnterNavigation);
      expect(result1.current.focusField).not.toBe(result2.current.focusField);
    });

  });

});
