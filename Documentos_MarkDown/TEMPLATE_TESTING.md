# 🧪 Templates y Ejemplos de Testing

> **Guía Práctica de Implementación de Tests**  
> **Versión**: 1.0.0  
> **Última Actualización**: 2025-10-01

---

## 📋 Tabla de Contenido

1. [Templates Básicos](#-templates-básicos)
2. [Ejemplos Reales del Proyecto](#-ejemplos-reales-del-proyecto)
3. [Patrones Comunes](#-patrones-comunes)
4. [Anti-Patrones a Evitar](#-anti-patrones-a-evitar)
5. [Debugging de Tests](#-debugging-de-tests)

---

## 🎯 Templates Básicos

### **Template 1: Test de Hook Simple**

```typescript
/**
 * Tests para [NOMBRE_HOOK]
 * Descripción: [QUÉ HACE EL HOOK]
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useYourHook } from '@/hooks/useYourHook';

describe('useYourHook', () => {
  beforeEach(() => {
    // Limpiar DOM antes de cada test
    document.body.innerHTML = '<div id="root"></div>';
    // Limpiar mocks
    vi.clearAllMocks();
  });

  describe('Funcionalidad básica', () => {
    it('debe inicializar con valores por defecto', () => {
      const { result } = renderHook(() => useYourHook());
      
      expect(result.current.value).toBe(expectedDefault);
      expect(result.current.isLoading).toBe(false);
    });

    it('debe actualizar el estado correctamente', () => {
      const { result } = renderHook(() => useYourHook());
      
      act(() => {
        result.current.setValue('newValue');
      });
      
      expect(result.current.value).toBe('newValue');
    });
  });

  describe('Manejo de errores', () => {
    it('debe manejar errores gracefully', () => {
      const { result } = renderHook(() => useYourHook());
      
      act(() => {
        result.current.triggerError();
      });
      
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('Casos edge', () => {
    it('debe manejar valores null/undefined', () => {
      const { result } = renderHook(() => useYourHook());
      
      act(() => {
        result.current.setValue(null);
      });
      
      expect(result.current.value).toBeNull();
    });
  });
});
```

---

### **Template 2: Test de Utility Pura**

```typescript
/**
 * Tests para [NOMBRE_UTILITY]
 * Descripción: [QUÉ HACE LA UTILITY]
 */
import { describe, it, expect } from 'vitest';
import { yourUtilityFunction } from '@/utils/yourUtility';

describe('yourUtilityFunction', () => {
  describe('Casos normales', () => {
    it('debe procesar input válido correctamente', () => {
      const input = { value: 100 };
      const result = yourUtilityFunction(input);
      
      expect(result).toEqual(expectedOutput);
    });

    it('debe manejar múltiples casos de uso', () => {
      const testCases = [
        { input: 1, expected: 'one' },
        { input: 2, expected: 'two' },
        { input: 3, expected: 'three' },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(yourUtilityFunction(input)).toBe(expected);
      });
    });
  });

  describe('Validación de input', () => {
    it('debe rechazar input inválido', () => {
      expect(() => yourUtilityFunction(null)).toThrow();
      expect(() => yourUtilityFunction(undefined)).toThrow();
    });
  });

  describe('Casos edge', () => {
    it('debe manejar valores límite', () => {
      expect(yourUtilityFunction(0)).toBe(expectedForZero);
      expect(yourUtilityFunction(Number.MAX_SAFE_INTEGER)).toBeDefined();
    });
  });
});
```

---

### **Template 3: Test de Hook con Dependencias**

```typescript
/**
 * Tests para [HOOK_CON_DEPS]
 * Descripción: Hook que depende de otros hooks/contexts
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useComplexHook } from '@/hooks/useComplexHook';
import { SomeContext } from '@/context/SomeContext';

// Mock de dependencias
vi.mock('@/hooks/useDependency', () => ({
  useDependency: vi.fn(() => ({
    data: 'mocked data',
    isLoading: false
  }))
}));

describe('useComplexHook', () => {
  // Wrapper con contexto si es necesario
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SomeContext.Provider value={mockContextValue}>
      {children}
    </SomeContext.Provider>
  );

  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.clearAllMocks();
  });

  describe('Con contexto', () => {
    it('debe obtener valores del contexto', () => {
      const { result } = renderHook(() => useComplexHook(), { wrapper });
      
      expect(result.current.contextValue).toBe(mockContextValue);
    });
  });

  describe('Con mocks', () => {
    it('debe usar dependencias mockeadas', () => {
      const { result } = renderHook(() => useComplexHook());
      
      expect(result.current.data).toBe('mocked data');
    });
  });
});
```

---

### **Template 4: Test de Componente React**

```typescript
/**
 * Tests para [COMPONENT_NAME]
 * Descripción: [QUÉ HACE EL COMPONENTE]
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  const defaultProps = {
    title: 'Test Title',
    onAction: vi.fn(),
  };

  describe('Renderizado', () => {
    it('debe renderizar correctamente', () => {
      render(<YourComponent {...defaultProps} />);
      
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('debe renderizar con props opcionales', () => {
      render(<YourComponent {...defaultProps} subtitle="Subtitle" />);
      
      expect(screen.getByText('Subtitle')).toBeInTheDocument();
    });
  });

  describe('Interacciones', () => {
    it('debe manejar click events', async () => {
      const onAction = vi.fn();
      render(<YourComponent {...defaultProps} onAction={onAction} />);
      
      const button = screen.getByRole('button', { name: /action/i });
      fireEvent.click(button);
      
      await waitFor(() => {
        expect(onAction).toHaveBeenCalledTimes(1);
      });
    });

    it('debe actualizar UI después de interacción', async () => {
      render(<YourComponent {...defaultProps} />);
      
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'new value' } });
      
      await waitFor(() => {
        expect(input).toHaveValue('new value');
      });
    });
  });

  describe('Estados', () => {
    it('debe mostrar estado de carga', () => {
      render(<YourComponent {...defaultProps} isLoading />);
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('debe mostrar estado de error', () => {
      render(<YourComponent {...defaultProps} error="Error message" />);
      
      expect(screen.getByText(/error message/i)).toBeInTheDocument();
    });
  });
});
```

---

## 📚 Ejemplos Reales del Proyecto

### **Ejemplo 1: useCalculations (Hook Complejo)**

```typescript
// src/__tests__/unit/hooks/useCalculations.test.ts
import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useCalculations } from '@/hooks/useCalculations';
import { CashCount, ElectronicPayments } from '@/types/cash';

describe('useCalculations', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  // Mock data reutilizable
  const mockCashCount: CashCount = {
    bill100: 5,      // $500
    bill50: 4,       // $200
    bill20: 10,      // $200
    bill10: 5,       // $50
    bill5: 10,       // $50
    bill1: 20,       // $20
    dollarCoin: 10,  // $10
    quarter: 8,      // $2.00
    dime: 10,        // $1.00
    nickel: 5,       // $0.25
    penny: 0,        // $0.00
  };

  const mockElectronicPayments: ElectronicPayments = {
    credomatic: 100,
    promerica: 50,
    bankTransfer: 25,
    paypal: 0,
  };

  describe('Cálculos básicos', () => {
    it('debe calcular correctamente el total de efectivo', () => {
      const emptyElectronic: ElectronicPayments = {
        credomatic: 0,
        promerica: 0,
        bankTransfer: 0,
        paypal: 0,
      };
      
      const { result } = renderHook(() =>
        useCalculations(mockCashCount, emptyElectronic, 0)
      );

      // Total: 500+200+200+50+50+20+10+2+1+0.25 = $1033.25
      expect(result.current.totalCash).toBe(1033.25);
    });

    it('debe calcular correctamente el total general', () => {
      const { result } = renderHook(() =>
        useCalculations(mockCashCount, mockElectronicPayments, 0)
      );

      // Total: 1033.25 + 175 = $1208.25
      expect(result.current.totalGeneral).toBeCloseTo(1208.25);
    });

    it('debe calcular la diferencia correctamente', () => {
      const expectedSales = 1200;
      const { result } = renderHook(() =>
        useCalculations(mockCashCount, mockElectronicPayments, expectedSales)
      );

      // Diferencia: 1208.25 - 1200 = $8.25 (sobrante)
      expect(result.current.difference).toBeCloseTo(8.25);
    });
  });

  describe('Alertas y flags', () => {
    it('debe marcar hasAlert cuando hay faltante mayor a $3', () => {
      const expectedSales = 1220; // Faltante de -$11.75
      const { result } = renderHook(() =>
        useCalculations(mockCashCount, mockElectronicPayments, expectedSales)
      );

      expect(result.current.hasAlert).toBe(true);
      expect(result.current.isShortage).toBe(true);
    });

    it('NO debe marcar hasAlert cuando el faltante es menor a $3', () => {
      const expectedSales = 1210; // Faltante de -$1.75
      const { result } = renderHook(() =>
        useCalculations(mockCashCount, mockElectronicPayments, expectedSales)
      );

      expect(result.current.hasAlert).toBe(false);
      expect(result.current.isShortage).toBe(true);
    });
  });
});
```

**Lecciones Aprendidas**:
- ✅ BeforeEach para limpiar DOM (evita errores de JSDOM)
- ✅ Mock data reutilizable (DRY principle)
- ✅ Comentarios con cálculos esperados (documentación)
- ✅ toBeCloseTo para decimales (evita errores de precisión)

---

### **Ejemplo 2: clipboard.ts (Utility con Fallbacks)**

```typescript
// src/__tests__/unit/utils/clipboard.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { copyToClipboard, isClipboardAvailable } from '@/utils/clipboard';

describe('clipboard utilities', () => {
  beforeEach(() => {
    // Resetear navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
      configurable: true
    });
    
    // Resetear isSecureContext
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      writable: true,
      configurable: true
    });
  });

  describe('copyToClipboard', () => {
    describe('Clipboard API moderna', () => {
      it('debe copiar usando Clipboard API cuando está disponible', async () => {
        const writeTextMock = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'clipboard', {
          value: { writeText: writeTextMock },
          writable: true,
          configurable: true
        });

        const result = await copyToClipboard('test text');

        expect(result.success).toBe(true);
        expect(result.method).toBe('clipboard-api');
        expect(writeTextMock).toHaveBeenCalledWith('test text');
      });

      it('debe intentar fallback cuando Clipboard API falla', async () => {
        const writeTextMock = vi.fn().mockRejectedValue(new Error('Permission denied'));
        Object.defineProperty(navigator, 'clipboard', {
          value: { writeText: writeTextMock },
          writable: true,
          configurable: true
        });

        // Mock execCommand para que funcione
        document.execCommand = vi.fn().mockReturnValue(true);

        const result = await copyToClipboard('test');

        expect(result.success).toBe(true);
        expect(result.method).toBe('exec-command');
      });
    });

    describe('Fallback execCommand', () => {
      beforeEach(() => {
        // Deshabilitar Clipboard API
        Object.defineProperty(navigator, 'clipboard', {
          value: undefined,
          writable: true,
          configurable: true
        });
      });

      it('debe copiar usando execCommand', async () => {
        document.execCommand = vi.fn().mockReturnValue(true);

        const result = await copyToClipboard('test');

        expect(result.success).toBe(true);
        expect(result.method).toBe('exec-command');
        expect(document.execCommand).toHaveBeenCalledWith('copy');
      });

      it('debe crear y limpiar textarea temporal', async () => {
        document.execCommand = vi.fn().mockReturnValue(true);
        
        const initialChildren = document.body.children.length;
        await copyToClipboard('test');
        const finalChildren = document.body.children.length;

        // El textarea debe ser creado y removido
        expect(finalChildren).toBe(initialChildren);
      });
    });

    describe('Manejo de errores', () => {
      it('debe retornar error descriptivo cuando todo falla', async () => {
        // Sin Clipboard API
        Object.defineProperty(navigator, 'clipboard', {
          value: undefined
        });
        
        // execCommand falla
        document.execCommand = vi.fn().mockReturnValue(false);

        const result = await copyToClipboard('test');

        expect(result.success).toBe(false);
        expect(result.method).toBe('none');
        expect(result.error).toBeDefined();
      });
    });
  });

  describe('isClipboardAvailable', () => {
    it('debe retornar true cuando Clipboard API está disponible', () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn() },
        writable: true,
        configurable: true
      });

      expect(isClipboardAvailable()).toBe(true);
    });

    it('debe retornar false cuando no es contexto seguro', () => {
      Object.defineProperty(window, 'isSecureContext', {
        value: false,
        writable: true
      });

      expect(isClipboardAvailable()).toBe(false);
    });
  });
});
```

**Lecciones Aprendidas**:
- ✅ BeforeEach para resetear globals (evita contaminación entre tests)
- ✅ Mocking de navigator y window APIs
- ✅ Testing de fallback chains
- ✅ Cleanup verification (crear/eliminar elementos temporales)

---

## 🎨 Patrones Comunes

### **Patrón 1: Test Data Builders**

```typescript
// builders/cashCountBuilder.ts
export class CashCountBuilder {
  private cashCount: Partial<CashCount> = {};

  withBills(amount: number): this {
    this.cashCount.bill100 = amount / 100;
    return this;
  }

  withCoins(amount: number): this {
    this.cashCount.quarter = amount / 0.25;
    return this;
  }

  build(): CashCount {
    return {
      bill100: 0,
      bill50: 0,
      bill20: 0,
      bill10: 0,
      bill5: 0,
      bill1: 0,
      dollarCoin: 0,
      quarter: 0,
      dime: 0,
      nickel: 0,
      penny: 0,
      ...this.cashCount,
    };
  }
}

// En test:
const cashCount = new CashCountBuilder()
  .withBills(500)
  .withCoins(10)
  .build();
```

---

### **Patrón 2: Custom Matchers**

```typescript
// test-utils/matchers.ts
export const customMatchers = {
  toBeWithinRange(received: number, min: number, max: number) {
    const pass = received >= min && received <= max;
    return {
      pass,
      message: () => `Expected ${received} to be within ${min}-${max}`,
    };
  },
};

// setup.ts
expect.extend(customMatchers);

// En test:
expect(result).toBeWithinRange(95, 105);
```

---

### **Patrón 3: Test Fixtures**

```typescript
// fixtures/cashCountFixtures.ts
export const fixtures = {
  emptyCashCount: (): CashCount => ({
    bill100: 0,
    bill50: 0,
    bill20: 0,
    bill10: 0,
    bill5: 0,
    bill1: 0,
    dollarCoin: 0,
    quarter: 0,
    dime: 0,
    nickel: 0,
    penny: 0,
  }),

  standardDayCount: (): CashCount => ({
    bill100: 10,
    bill50: 20,
    bill20: 50,
    bill10: 30,
    bill5: 40,
    bill1: 100,
    dollarCoin: 20,
    quarter: 40,
    dime: 50,
    nickel: 30,
    penny: 50,
  }),
};

// En test:
const count = fixtures.standardDayCount();
```

---

## ❌ Anti-Patrones a Evitar

### **Anti-Patrón 1: Tests Demasiado Específicos**

```typescript
// ❌ MAL - Test frágil
it('debe tener exactamente esta estructura HTML', () => {
  const { container } = render(<Component />);
  expect(container.innerHTML).toBe('<div><span>Text</span></div>');
});

// ✅ BIEN - Test resiliente
it('debe mostrar el texto esperado', () => {
  render(<Component />);
  expect(screen.getByText('Text')).toBeInTheDocument();
});
```

---

### **Anti-Patrón 2: Tests Interdependientes**

```typescript
// ❌ MAL - Tests que dependen del orden
let globalState = {};

it('test 1', () => {
  globalState.value = 'set by test 1';
});

it('test 2', () => {
  expect(globalState.value).toBe('set by test 1'); // Depende de test 1
});

// ✅ BIEN - Tests independientes
it('test 1', () => {
  const localState = { value: 'test 1' };
  expect(localState.value).toBe('test 1');
});

it('test 2', () => {
  const localState = { value: 'test 2' };
  expect(localState.value).toBe('test 2');
});
```

---

### **Anti-Patrón 3: Assertions Vagas**

```typescript
// ❌ MAL - Assertion no descriptiva
it('should work', () => {
  const result = calculate(100);
  expect(result).toBeTruthy();
});

// ✅ BIEN - Assertion específica
it('debe calcular el total con impuestos correctamente', () => {
  const result = calculateTotalWithTax(100, 0.1);
  expect(result).toBe(110);
});
```

---

### **Anti-Patrón 4: Testing Implementation Details**

```typescript
// ❌ MAL - Testear detalles de implementación
it('debe llamar useEffect', () => {
  const useEffectSpy = vi.spyOn(React, 'useEffect');
  render(<Component />);
  expect(useEffectSpy).toHaveBeenCalled();
});

// ✅ BIEN - Testear comportamiento observable
it('debe cargar datos al montar', async () => {
  render(<Component />);
  await waitFor(() => {
    expect(screen.getByText('Loaded Data')).toBeInTheDocument();
  });
});
```

---

## 🐛 Debugging de Tests

### **Técnica 1: Debug Console Output**

```typescript
it('debe debuggear valores', () => {
  const { result } = renderHook(() => useYourHook());
  
  // Output a consola
  console.log('Result:', result.current);
  
  // Pretty print objetos
  console.dir(result.current, { depth: null });
  
  // Debug DOM
  screen.debug();
});
```

---

### **Técnica 2: test.only y test.skip**

```typescript
// Ejecutar solo este test
it.only('debe debuggear este test específico', () => {
  // ...
});

// Saltar este test temporalmente
it.skip('test problemático', () => {
  // ...
});
```

---

### **Técnica 3: Breakpoints en VS Code**

```json
// .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Vitest",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["test", "--", "--run"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

### **Técnica 4: Logs Temporales**

```typescript
it('debe debuggear flujo', () => {
  const { result } = renderHook(() => useYourHook());
  
  console.log('1. Estado inicial:', result.current);
  
  act(() => {
    console.log('2. Antes de acción');
    result.current.doSomething();
    console.log('3. Después de acción');
  });
  
  console.log('4. Estado final:', result.current);
});
```

---

## 📝 Checklist Pre-Commit

```
□ Todos los tests pasan localmente
□ Coverage no disminuye
□ Tests tienen nombres descriptivos en español
□ BeforeEach limpia estado global
□ No hay console.logs olvidados
□ No hay it.only o it.skip
□ Mocks están bien documentados
□ Assertions son específicas y claras
□ Tests son independientes entre sí
□ Edge cases están cubiertos
```

---

## 🚀 Próximos Pasos

1. **Copiar template apropiado** para tu caso de uso
2. **Adaptar al archivo** que necesitas testear
3. **Escribir tests incrementalmente** (happy path → errors → edge cases)
4. **Ejecutar tests frecuentemente** (watch mode)
5. **Refactorizar cuando pase** (mejorar claridad)
6. **Documentar lecciones aprendidas** en este archivo

---

**Última Actualización**: 2025-10-01  
**Mantenedor**: Samuel ERS

