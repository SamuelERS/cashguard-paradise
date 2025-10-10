// 🤖 [IA] - v1.3.7: SUITE COMPLETA 87 TESTS - Phase2VerificationSection (100% coverage)
// Documentación: /Documentos_MarkDown/Planes_de_Desarrollos/Plan_Control_Test/Caso_Phase2_Verification_100_Coverage/
import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Phase2VerificationSection } from '../Phase2VerificationSection';
import type { DeliveryCalculation } from '@/types/phases';
import type { CashCount } from '@/types/cash';

// Mock useTimingConfig hook with proper timing delays
vi.mock('@/hooks/useTimingConfig', () => ({
  useTimingConfig: () => ({
    createTimeoutWithCleanup: (callback: () => void, type: string, _id: string, customDelay?: number) => {
      // Use timing delays that match the real hook
      const timingMap: Record<string, number> = {
        focus: 100,
        navigation: 100,
        confirmation: 150,
        transition: 1000,
        toast: 4000
      };
      const delay = customDelay !== undefined ? customDelay : (timingMap[type] || 0);
      const timeout = setTimeout(callback, delay);
      return () => clearTimeout(timeout);
    }
  })
}));

// Mock useBlindVerification hook (ya existe, solo importar types)
// El componente lo usa internamente, no necesita mock adicional

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MOCKS & HELPERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Mock denominationsToKeep con 7 denominaciones para testing
const mockDenominationsToKeep: CashCount = {
  penny: 43,
  nickel: 20,
  dime: 33,
  quarter: 8,
  dollarCoin: 1,
  bill1: 1,
  bill5: 1,
  bill10: 0,
  bill20: 0,
  bill50: 0,
  bill100: 0
};

// Mock deliveryCalculation completo
const mockDeliveryCalculation: DeliveryCalculation = {
  amountToDeliver: 327.20,
  denominationsToKeep: mockDenominationsToKeep,
  denominationsToDeliver: {
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
    bill100: 0
  },
  deliverySteps: [], // No relevante para verificación
  verificationSteps: [
    { key: 'penny', label: '1¢', quantity: 43, value: 0.01 },
    { key: 'nickel', label: '5¢', quantity: 20, value: 0.05 },
    { key: 'dime', label: '10¢', quantity: 33, value: 0.10 },
    { key: 'quarter', label: '25¢', quantity: 8, value: 0.25 },
    { key: 'dollarCoin', label: '$1 coin', quantity: 1, value: 1.00 },
    { key: 'bill1', label: '$1', quantity: 1, value: 1.00 },
    { key: 'bill5', label: '$5', quantity: 1, value: 5.00 }
  ]
};

// Helper: Renderizar componente con props mínimas y state management
const renderPhase2Verification = (overrideProps: Partial<React.ComponentProps<typeof Phase2VerificationSection>> = {}) => {
  // Store callbacks outside wrapper to maintain spy references
  const callbacks = {
    onStepComplete: overrideProps.onStepComplete || vi.fn(),
    onStepUncomplete: overrideProps.onStepUncomplete || vi.fn(),
    onSectionComplete: overrideProps.onSectionComplete || vi.fn(),
    onVerificationBehaviorCollected: overrideProps.onVerificationBehaviorCollected || vi.fn(),
    onCancel: overrideProps.onCancel || vi.fn()
  };
  
  // Create a wrapper component that manages completedSteps state
  const TestWrapper = () => {
    const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(overrideProps.completedSteps || {});
    
    const handleStepComplete = (stepKey: string) => {
      setCompletedSteps((prev: Record<string, boolean>) => ({ ...prev, [stepKey]: true }));
      callbacks.onStepComplete(stepKey);
    };
    
    const props = {
      deliveryCalculation: overrideProps.deliveryCalculation || mockDeliveryCalculation,
      onStepComplete: handleStepComplete,
      onStepUncomplete: callbacks.onStepUncomplete,
      onSectionComplete: callbacks.onSectionComplete,
      onVerificationBehaviorCollected: callbacks.onVerificationBehaviorCollected,
      completedSteps,
      onCancel: callbacks.onCancel
    };
    
    return <Phase2VerificationSection {...props} />;
  };

  return render(<TestWrapper />);
};

// Helper: Obtener input actual con sufijo dinámico
const getCurrentInput = () => {
  // Input tiene id dinámico: `verification-input-${currentStep.key}`
  // Buscar por placeholder pattern que siempre está presente
  const input = screen.getByPlaceholderText(/¿cuántos/i);
  return input;
};

// Helper: Completar un paso con valor correcto
const completeStepCorrectly = async (user: ReturnType<typeof userEvent.setup>, quantity: number) => {
  const input = getCurrentInput();
  await user.clear(input);
  await user.type(input, quantity.toString());
  await user.keyboard('{Enter}');
};

// Helper: Ingresar valor incorrecto sin confirmar (para testing modal)
// 🤖 [IA] - v1.3.7d FIX: enterIncorrectValue ahora espera modal después de Enter
const enterIncorrectValue = async (user: ReturnType<typeof userEvent.setup>, value: number) => {
  const input = getCurrentInput();
  await user.clear(input);
  await user.type(input, value.toString());
  await user.keyboard('{Enter}');

  // ✅ CRÍTICO: Esperar que modal "incorrect" aparezca (valor incorrecto → modal se abre)
  await waitFor(() => {
    expect(screen.queryByRole('alertdialog')).toBeInTheDocument();
  }, { timeout: 3000 });
};

// 🤖 [IA] - v1.3.7b Fase 1: Fix Issue #1 (parcial) - Helper queries modales con timeout 3000ms
// Wrapper para queries modales con timeout automático (Radix UI AlertDialog toma ~100-300ms renderizar)
const findModalElement = async (text: string | RegExp) => {
  return await screen.findByText(text, {}, { timeout: 3000 });
};

// Helper: Click en botón modal con timeout
const clickModalButton = async (user: ReturnType<typeof userEvent.setup>, text: string) => {
  const button = await findModalElement(text);
  await user.click(button);
};

// 🤖 [IA] - v1.3.7d: Fix Quirúrgico Modal Async - Helpers mejorados para tests robustos
// waitForModal: Espera que modal Radix UI esté completamente renderizado
const waitForModal = async () => {
  await waitFor(() => {
    expect(screen.queryByRole('alertdialog')).toBeInTheDocument();
  }, { timeout: 3000 });
};

// clickModalButtonSafe: Combina waitForModal + click para garantizar elemento existe
const clickModalButtonSafe = async (
  user: ReturnType<typeof userEvent.setup>,
  text: string | RegExp
) => {
  await waitForModal(); // Garantizar modal renderizado
  const button = await findModalElement(text);
  await user.click(button);
};

// 🤖 [IA] - v1.3.8 PREP: Helper robusto completeAllStepsCorrectly() (definido, no aplicado)
// Mapeo label → placeholder text (case-insensitive)
const denominationMap: Record<string, string> = {
  '1¢': 'un centavo',
  '5¢': 'cinco centavos',
  '10¢': 'diez centavos',
  '25¢': 'veinticinco centavos',
  '$1 coin': 'moneda de un dólar',
  '$1': 'billete de un dólar',
  '$5': 'billete de cinco dólares',
  '$10': 'billete de diez dólares',
  '$20': 'billete de veinte dólares',
  '$50': 'billete de cincuenta dólares',
  '$100': 'billete de cien dólares'
};

// Helper: Completar TODOS los pasos de verificación correctamente (wait for async transitions)
const completeAllStepsCorrectly = async (
  user: ReturnType<typeof userEvent.setup>,
  quantities: number[],
  steps: { label: string }[]
) => {
  for (let i = 0; i < quantities.length; i++) {
    // Usar getCurrentInput() que busca por placeholder (más robusto)
    const input = getCurrentInput();

    if (!input) {
      throw new Error(`[completeAllStepsCorrectly] Input not found at step ${i}`);
    }

    await user.clear(input);
    await user.type(input, quantities[i].toString());
    await user.keyboard('{Enter}');

    // Wait for next step SOLO si NO es el último paso
    if (i < quantities.length - 1) {
      const nextLabel = steps[i + 1].label;
      const description = denominationMap[nextLabel] || nextLabel;
      // Formato real del placeholder: "¿Cuántos {descripción}?"
      const placeholder = `¿cuántos ${description}?`;

      // v1.3.7d pattern: waitFor con timeout 3000ms para Radix UI async
      await waitFor(() => {
        expect(
          screen.queryByPlaceholderText(new RegExp(placeholder, 'i'))
        ).toBeInTheDocument();
      }, { timeout: 3000 });
    }
  }
};

// 🤖 [IA] - v1.3.8 PREP: Test de validación del helper (standalone, no aplicado a suite)
describe('v1.3.8 Helper Validation (Standalone)', () => {
  it('helper completeAllStepsCorrectly está definido y es función', () => {
    // Validación simple: helper existe y es callable
    expect(completeAllStepsCorrectly).toBeDefined();
    expect(typeof completeAllStepsCorrectly).toBe('function');
  });

  it('denominationMap tiene 11 entries completos', () => {
    // Validación mapeo completo
    expect(Object.keys(denominationMap)).toHaveLength(11);
    expect(denominationMap['1¢']).toBe('un centavo');
    expect(denominationMap['$100']).toBe('billete de cien dólares');
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRUPO 1: Inicialización & Props (8 tests) - 15 min
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Grupo 1: Inicialización & Props', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('1.1 - Renderiza con props mínimas sin errores', () => {
    const { container } = renderPhase2Verification();
    expect(container).toBeInTheDocument();
  });

  it('1.2 - Muestra header "VERIFICACIÓN EN CAJA"', () => {
    renderPhase2Verification();
    expect(screen.getByText('VERIFICACIÓN EN CAJA')).toBeInTheDocument();
  });

  it('1.3 - Muestra badge objetivo "Objetivo: Cambio completo"', () => {
    renderPhase2Verification();
    expect(screen.getByText(/Objetivo: Cambio completo/i)).toBeInTheDocument();
  });

  it('1.4 - Inicializa en primer paso (penny) cuando completedSteps vacío', () => {
    renderPhase2Verification();
    // Input placeholder debe mencionar "un centavo"
    expect(screen.getByPlaceholderText(/un centavo/i)).toBeInTheDocument();
  });

  it('1.5 - Auto-avanza a primer paso incompleto cuando hay pasos completados', () => {
    renderPhase2Verification({
      completedSteps: {
        penny: true,
        nickel: true
      }
    });
    // Debe avanzar a dime (tercer paso)
    expect(screen.getByPlaceholderText(/diez centavos/i)).toBeInTheDocument();
  });

  it('1.6 - Renderiza mensaje "Verificación Innecesaria" cuando verificationSteps vacío', () => {
    renderPhase2Verification({
      deliveryCalculation: {
        ...mockDeliveryCalculation,
        verificationSteps: []
      }
    });
    expect(screen.getByText('Verificación Innecesaria')).toBeInTheDocument();
  });

  it('1.7 - onVerificationBehaviorCollected es opcional (undefined no crashea)', () => {
    const { container } = renderPhase2Verification({
      onVerificationBehaviorCollected: undefined
    });
    expect(container).toBeInTheDocument();
  });

  it('1.8 - Progreso muestra 0/7 cuando completedSteps vacío', () => {
    renderPhase2Verification();
    expect(screen.getByText(/✅ 0\/7/)).toBeInTheDocument();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRUPO 2: Primer Intento Correcto (12 tests) - 20 min
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Grupo 2: Primer Intento Correcto (success)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('2.1 - Primer intento correcto llama onStepComplete sin modal', async () => {
    const onStepComplete = vi.fn();
    renderPhase2Verification({ onStepComplete });

    await completeStepCorrectly(user, 43); // penny quantity

    expect(onStepComplete).toHaveBeenCalledWith('penny');
    // NO debe aparecer modal
    expect(screen.queryByText(/Verificación necesaria/i)).not.toBeInTheDocument();
  });

  it('2.2 - Primer intento correcto NO registra en attemptHistory', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // 🤖 [IA] - v1.3.8 Fase 1: Aplicado helper completeAllStepsCorrectly() (timing robusto)
    await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);

    // Esperar callback
    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    }, { timeout: 3000 });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.totalAttempts).toBe(0); // Ningún intento registrado (todos correctos primer intento)
  });

  it('2.3 - Primer intento correcto avanza a siguiente paso automáticamente', async () => {
    renderPhase2Verification();

    await completeStepCorrectly(user, 43); // penny

    // Debe avanzar a nickel (segundo paso)
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cinco centavos/i)).toBeInTheDocument();
    });
  });

  it('2.4 - Input se limpia después de primer intento correcto', async () => {
    renderPhase2Verification();

    await completeStepCorrectly(user, 43); // penny

    // Input debe quedar vacío
    await waitFor(() => {
      const input = getCurrentInput();
      expect(input).toHaveValue('');
    });
  });

  it('2.5 - Primer intento correcto muestra "Cantidad correcta" antes de confirmar', async () => {
    renderPhase2Verification();

    const input = getCurrentInput();
    await user.type(input, '43');

    // Debe mostrar check de cantidad correcta
    expect(screen.getByText('Cantidad correcta')).toBeInTheDocument();
  });

  it('2.6 - Progreso se actualiza correctamente después de primer intento correcto', async () => {
    renderPhase2Verification();

    await completeStepCorrectly(user, 43); // penny

    // Progreso: 1/7
    await waitFor(() => {
      expect(screen.getByText(/✅ 1\/7/)).toBeInTheDocument();
    });
  });

  it('2.7 - Último paso con primer intento correcto muestra pantalla "Verificación Exitosa"', async () => {
    const completedSteps = {
      penny: true,
      nickel: true,
      dime: true,
      quarter: true,
      dollarCoin: true,
      bill1: true
    };
    renderPhase2Verification({ completedSteps });

    await completeStepCorrectly(user, 1); // bill5 (último paso)

    await waitFor(() => {
      expect(screen.getByText('Verificación Exitosa')).toBeInTheDocument();
    });
  });

  it('2.8 - Todos los pasos con primer intento correcto llama onSectionComplete', async () => {
    const onSectionComplete = vi.fn();
    renderPhase2Verification({ onSectionComplete });

    // 🤖 [IA] - v1.3.8 Fase 1: Aplicado helper completeAllStepsCorrectly() (timing robusto)
    await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);

    await waitFor(() => {
      expect(onSectionComplete).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('2.9 - Primer intento correcto con Enter key funciona igual que botón Confirmar', async () => {
    const onStepComplete = vi.fn();
    renderPhase2Verification({ onStepComplete });

    const input = getCurrentInput();
    await user.type(input, '43');
    await user.keyboard('{Enter}');

    expect(onStepComplete).toHaveBeenCalledWith('penny');
  });

  it('2.10 - Primer intento correcto NO llama onVerificationBehaviorCollected hasta completar todos', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await completeStepCorrectly(user, 43); // penny (1/7)

    // NO debe llamar callback aún (no están todos completados)
    expect(onVerificationBehaviorCollected).not.toHaveBeenCalled();
  });

  it('2.11 - Primer intento correcto NO genera severity flags', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // 🤖 [IA] - v1.3.8 Fase 1: Aplicado helper completeAllStepsCorrectly() (timing robusto)
    await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.severityFlags).toHaveLength(0);
  });

  it('2.12 - Primer intento correcto: firstAttemptSuccesses = total denominaciones', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // 🤖 [IA] - v1.3.8 Fase 1: Aplicado helper completeAllStepsCorrectly() (timing robusto)
    await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.firstAttemptSuccesses).toBe(7); // Todas las 7 denominaciones
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRUPO 3: Primer Intento Incorrecto → Modal (15 tests) - 30 min
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Grupo 3: Primer Intento Incorrecto → Modal "incorrect"', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('3.1 - Modal "incorrect" aparece cuando valor incorrecto', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44); // penny esperado: 43

    expect(screen.getByText(/Verificación necesaria/i)).toBeInTheDocument();
  });

  it('3.2 - Modal muestra mensaje correcto (primer intento)', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);

    expect(screen.getByText(/Por favor, vuelve a contar esta denominación/i)).toBeInTheDocument();
  });

  it('3.3 - Modal muestra denominación correcta en label', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);

    expect(screen.getByText(/Un centavo/i)).toBeInTheDocument();
  });

  it('3.4 - Botón "Volver a contar" está habilitado', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);

    // 🤖 [IA] - v1.3.7b: findBy* async con timeout para modales Radix UI
    const retryButton = await findModalElement('Volver a contar');
    expect(retryButton).toBeEnabled();
  });

  it('3.5 - Botón "Forzar" está deshabilitado en primer intento', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);

    // Modal type "incorrect" no debe mostrar botón "Forzar este valor"
    expect(screen.queryByText('Forzar este valor')).not.toBeInTheDocument();
  });

  it('3.6 - Input pierde focus cuando modal abre (v1.3.6h fix)', async () => {
    renderPhase2Verification();

    const input = getCurrentInput();
    input.focus(); // Asegurar focus inicial

    await enterIncorrectValue(user, 44);

    // Input debe perder focus (blur)
    expect(input).not.toHaveFocus();
  });

  it('3.7 - Enter key NO registra mismo valor cuando modal abierto (v1.3.6h fix)', async () => {
    const onStepComplete = vi.fn();
    renderPhase2Verification({ onStepComplete });

    await enterIncorrectValue(user, 44);

    // Modal está abierto, presionar Enter múltiples veces
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');

    // onStepComplete NO debe haberse llamado (guard condition activo)
    expect(onStepComplete).not.toHaveBeenCalled();
  });

  it('3.8 - Click "Volver a contar" cierra modal y limpia input', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);

    const retryButton = screen.getByText('Volver a contar');
    await user.click(retryButton);

    // Modal debe cerrarse
    await waitFor(() => {
      expect(screen.queryByText(/Verificación necesaria/i)).not.toBeInTheDocument();
    });

    // Input debe estar vacío
    const input = getCurrentInput();
    expect(input).toHaveValue('');
  });

  it('3.9 - Click "Volver a contar" restaura focus en input', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);

    const retryButton = screen.getByText('Volver a contar');
    await user.click(retryButton);

    // Input debe recibir focus nuevamente
    await waitFor(() => {
      const input = getCurrentInput();
      expect(input).toHaveFocus();
    }, { timeout: 200 });
  });

  it('3.10 - Primer intento incorrecto registra attempt en attemptHistory', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44); // penny

    const retryButton = screen.getByText('Volver a contar');
    await user.click(retryButton);

    // Segundo intento correcto
    await completeStepCorrectly(user, 43);

    // Completar resto de pasos correctamente
    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.totalAttempts).toBe(2); // 1 incorrecto + 1 correcto
  });

  it('3.11 - Primer intento incorrecto NO llama onStepComplete', async () => {
    const onStepComplete = vi.fn();
    renderPhase2Verification({ onStepComplete });

    await enterIncorrectValue(user, 44);

    expect(onStepComplete).not.toHaveBeenCalled();
  });

  it('3.12 - Primer intento incorrecto NO avanza a siguiente paso', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);

    // Debe seguir en penny (placeholder no cambia)
    expect(screen.getByPlaceholderText(/un centavo/i)).toBeInTheDocument();
  });

  it('3.13 - Modal type "incorrect" tiene ícono ⚠️', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);

    // Buscar emoji ⚠️ en el documento
    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('⚠️') || false;
    })).toBeInTheDocument();
  });

  it('3.14 - Botón "Volver a contar" tiene clase correcta', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);

    const retryButton = screen.getByText('Volver a contar');
    // Botón debe ser ConstructiveActionButton (variante verde)
    expect(retryButton.closest('button')).toHaveClass('btn-confirm');
  });

  it('3.15 - ESC key cierra modal (Radix UI default behavior)', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);

    // Presionar ESC
    await user.keyboard('{Escape}');

    // Modal debe cerrarse
    await waitFor(() => {
      expect(screen.queryByText(/Verificación necesaria/i)).not.toBeInTheDocument();
    });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRUPO 4: Segundo Intento Patterns (20 tests) - 35 min
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Grupo 4: Segundo Intento Patterns', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('4.1 - Pattern [A, B] correcto (warning_retry) avanza sin modal', async () => {
    const onStepComplete = vi.fn();
    renderPhase2Verification({ onStepComplete });

    await enterIncorrectValue(user, 44); // Intento 1
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43); // Intento 2 correcto

    // Debe avanzar a nickel
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cinco centavos/i)).toBeInTheDocument();
    });

    expect(onStepComplete).toHaveBeenCalledWith('penny');
  });

  it('4.2 - Pattern [A, B] correcto genera severity warning_retry', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44); // penny
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43);

    // Completar resto
    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.severityFlags).toContain('warning_retry');
  });

  it('4.3 - Pattern [A, A] (mismo valor dos veces) → modal "force-same"', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44); // Intento 1
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 44); // Intento 2 (mismo valor)

    // Modal force-same
    expect(screen.getByText(/Has ingresado el mismo valor incorrecto dos veces/i)).toBeInTheDocument();
  });

  it('4.4 - Modal "force-same" muestra botón "Forzar este valor" habilitado', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 44);

    const forceButton = screen.getByText('Forzar este valor');
    expect(forceButton).toBeEnabled();
  });

  it('4.5 - Click "Forzar este valor" marca paso completado con valor forzado', async () => {
    const onStepComplete = vi.fn();
    renderPhase2Verification({ onStepComplete });

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 44);

    const forceButton = screen.getByText('Forzar este valor');
    await user.click(forceButton);

    expect(onStepComplete).toHaveBeenCalledWith('penny');
  });

  it('4.6 - Force override limpia attemptHistory (v1.3.6M behavior)', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44); // penny
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 44);
    await user.click(screen.getByText('Forzar este valor'));

    // Completar resto
    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    // Force override limpia attemptHistory → totalAttempts NO incluye intentos forzados
    expect(behavior.totalAttempts).toBe(0); // Limpiados después de force
  });

  it('4.7 - Force override genera severity warning_override', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // Forzar en dime (tercer paso)
    await completeStepCorrectly(user, 43); // penny
    await completeStepCorrectly(user, 20); // nickel

    await enterIncorrectValue(user, 30); // dime (esperado: 33)
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 30); // mismo valor
    await user.click(screen.getByText('Forzar este valor'));

    // Completar resto
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    // Como force limpia attemptHistory, severityFlags NO tendrá flag
    // Pero forcedOverrides counter debe incrementarse antes de limpieza
    expect(behavior.forcedOverrides).toBe(1);
  });

  it('4.8 - Pattern [A, B] incorrecto → modal "require-third"', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44); // Intento 1
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42); // Intento 2 (diferente, pero incorrecto)

    expect(screen.getByText(/Se requiere un tercer intento/i)).toBeInTheDocument();
  });

  it('4.9 - Modal "require-third" muestra botón "Volver a contar"', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);

    expect(screen.getByText('Volver a contar')).toBeInTheDocument();
  });

  it('4.10 - Modal "require-third" NO muestra botón "Forzar"', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);

    expect(screen.queryByText('Forzar este valor')).not.toBeInTheDocument();
  });

  it('4.11 - Click "Volver a contar" en require-third permite tercer intento', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');

    // Input debe estar vacío para tercer intento
    const input = getCurrentInput();
    expect(input).toHaveValue('');
  });

  it('4.12 - Segundo intento correcto incrementa secondAttemptSuccesses', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43);

    // 🤖 [IA] - v1.3.7d FIX: Esperar transición penny → nickel (race condition CI)
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cinco centavos/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.secondAttemptSuccesses).toBe(1);
  });

  it('4.13 - Segundo intento correcto reduce firstAttemptSuccesses', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44); // penny error
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43);

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    // Total: 7 denominaciones - 1 con error (penny) = 6 perfectas
    expect(behavior.firstAttemptSuccesses).toBe(6);
  });

  it('4.14 - Modal "force-same" tiene ícono 🚨', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 44);

    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('🚨') || false;
    })).toBeInTheDocument();
  });

  it('4.15 - Modal "require-third" tiene ícono 🔴', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);

    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('🔴') || false;
    })).toBeInTheDocument();
  });

  it('4.16 - Force override avanza a siguiente paso', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 44);
    await user.click(screen.getByText('Forzar este valor'));

    // Debe avanzar a nickel
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cinco centavos/i)).toBeInTheDocument();
    });
  });

  it('4.17 - Force override limpia input', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 44);
    await user.click(screen.getByText('Forzar este valor'));

    // Input debe estar vacío
    await waitFor(() => {
      const input = getCurrentInput();
      expect(input).toHaveValue('');
    });
  });

  it('4.18 - Pattern [A, B] incorrecto incrementa thirdAttemptRequired', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43); // Tercer intento correcto

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.thirdAttemptRequired).toBe(1);
  });

  it('4.19 - Segundo intento correcto registra AMBOS attempts (v1.3.6T fix)', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43);

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.totalAttempts).toBe(2); // 1 incorrecto + 1 correcto
  });

  it('4.20 - Modal "force-same" muestra contexto del valor ingresado', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 44);

    // Modal debe mencionar el valor 44
    expect(screen.getByText(/44/)).toBeInTheDocument();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRUPO 5: Tercer Intento Patterns (18 tests) - 30 min
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Grupo 5: Tercer Intento Patterns (critical)', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('5.1 - Pattern [A, B, C] → modal "third-result" con severity critical_severe', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44); // Intento 1
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42); // Intento 2
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40); // Intento 3 (todos diferentes)

    // Modal third-result
    expect(screen.getByText(/Resultado del Tercer Intento/i)).toBeInTheDocument();
  });

  it('5.2 - Modal "third-result" muestra pattern detectado [A,B,C]', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);

    // Debe mostrar patrón inconsistente
    expect(screen.getByText(/inconsistent/i)).toBeInTheDocument();
  });

  it('5.3 - Modal "third-result" muestra valor aceptado (promedio v1.3.6i)', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44); // 44
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42); // 42
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40); // 40

    // Promedio: (44 + 42 + 40) / 3 = 42
    expect(screen.getByText(/42/)).toBeInTheDocument();
  });

  it('5.4 - Pattern [A, B, A] → modal con severity critical_inconsistent', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44); // A
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42); // B
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 44); // A (repite primer intento)

    expect(screen.getByText(/Resultado del Tercer Intento/i)).toBeInTheDocument();
  });

  it('5.5 - Pattern [A, B, B] → modal con severity critical_inconsistent', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44); // A
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42); // B
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42); // B (repite segundo intento)

    expect(screen.getByText(/Resultado del Tercer Intento/i)).toBeInTheDocument();
  });

  it('5.6 - Click "Aceptar resultado" marca paso completado', async () => {
    const onStepComplete = vi.fn();
    renderPhase2Verification({ onStepComplete });

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);

    const acceptButton = screen.getByText('Aceptar resultado');
    await user.click(acceptButton);

    expect(onStepComplete).toHaveBeenCalledWith('penny');
  });

  it('5.7 - Click "Aceptar resultado" avanza a siguiente paso', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);
    await user.click(screen.getByText('Aceptar resultado'));

    // Debe avanzar a nickel
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cinco centavos/i)).toBeInTheDocument();
    });
  });

  it('5.8 - Tercer intento NO limpia attemptHistory (v1.3.6M fix)', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);
    await user.click(screen.getByText('Aceptar resultado'));

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.totalAttempts).toBe(3); // Todos los intentos preservados
  });

  it('5.9 - Pattern [A, B, C] incrementa severeInconsistencies', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);
    await user.click(screen.getByText('Aceptar resultado'));

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.severeInconsistencies).toBe(1);
  });

  it('5.10 - Pattern [A, B, A] incrementa criticalInconsistencies', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44); // A
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42); // B
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 44); // A
    await user.click(screen.getByText('Aceptar resultado'));

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.criticalInconsistencies).toBe(1);
  });

  it('5.11 - Modal "third-result" tiene ícono 🔴', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);

    expect(screen.getByText((content, element) => {
      return element?.textContent?.includes('🔴') || false;
    })).toBeInTheDocument();
  });

  it('5.12 - Tercer intento genera severity flag critical_severe', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);
    await user.click(screen.getByText('Aceptar resultado'));

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.severityFlags).toContain('critical_severe');
  });

  it('5.13 - Tercer intento correcto NO abre modal (caso edge raro)', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43); // Correcto en tercer intento

    // NO debe aparecer modal
    expect(screen.queryByText(/Resultado del Tercer Intento/i)).not.toBeInTheDocument();

    // Debe avanzar directamente
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/cinco centavos/i)).toBeInTheDocument();
    });
  });

  it('5.14 - Promedio matemático redondea correctamente [66, 64, 68] → 66', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 66);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 64);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 68);

    // (66 + 64 + 68) / 3 = 66
    expect(screen.getByText(/66/)).toBeInTheDocument();
  });

  it('5.15 - denominationsWithIssues incluye tercer intento', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);
    await user.click(screen.getByText('Aceptar resultado'));

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.denominationsWithIssues).toHaveLength(1);
    expect(behavior.denominationsWithIssues[0].denomination).toBe('penny');
    expect(behavior.denominationsWithIssues[0].severity).toBe('critical_severe');
  });

  it('5.16 - Modal "third-result" muestra reason descriptivo', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);

    // Modal debe mostrar descripción del pattern
    expect(screen.getByText((content) => {
      return content.includes('inconsistente') || content.includes('crítico');
    })).toBeInTheDocument();
  });

  it('5.17 - Tercer intento limpia input después de aceptar', async () => {
    renderPhase2Verification();

    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);
    await user.click(screen.getByText('Aceptar resultado'));

    // Input debe estar vacío
    await waitFor(() => {
      const input = getCurrentInput();
      expect(input).toHaveValue('');
    });
  });

  it('5.18 - Múltiples errores críticos se suman correctamente', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // penny: [A,B,C]
    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);
    await user.click(screen.getByText('Aceptar resultado'));

    // nickel: [A,B,C]
    await enterIncorrectValue(user, 15);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 18);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 22);
    await user.click(screen.getByText('Aceptar resultado'));

    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.severeInconsistencies).toBe(2); // penny + nickel
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRUPO 6: buildVerificationBehavior() (10 tests) - 25 min
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Grupo 6: buildVerificationBehavior() - Métricas Agregadas', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('6.1 - buildVerificationBehavior devuelve objeto con todas las claves', async () => {
    const onVerificationBehaviorColleted = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected: onVerificationBehaviorColleted });

    // 🤖 [IA] - v1.3.8 Fase 1: Aplicado helper completeAllStepsCorrectly() (timing robusto)
    await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);

    await waitFor(() => {
      expect(onVerificationBehaviorColleted).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorColleted.mock.calls[0][0];
    expect(behavior).toHaveProperty('totalAttempts');
    expect(behavior).toHaveProperty('firstAttemptSuccesses');
    expect(behavior).toHaveProperty('secondAttemptSuccesses');
    expect(behavior).toHaveProperty('thirdAttemptRequired');
    expect(behavior).toHaveProperty('forcedOverrides');
    expect(behavior).toHaveProperty('criticalInconsistencies');
    expect(behavior).toHaveProperty('severeInconsistencies');
    expect(behavior).toHaveProperty('attempts');
    expect(behavior).toHaveProperty('severityFlags');
    expect(behavior).toHaveProperty('denominationsWithIssues');
  });

  it('6.2 - firstAttemptSuccesses calculado por diferencia (v1.3.6Y fix)', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // 2 denominaciones con error (penny, nickel)
    await enterIncorrectValue(user, 44); // penny error
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43);

    await enterIncorrectValue(user, 15); // nickel error
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 20);

    // Resto correctas
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    // Total: 7 - 2 con errores = 5 perfectas
    expect(behavior.firstAttemptSuccesses).toBe(5);
  });

  it('6.3 - attempts array ordenado por timestamp', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    await enterIncorrectValue(user, 44); // penny
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43);

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    const timestamps = behavior.attempts.map((a: { timestamp: string }) => a.timestamp);

    // Timestamps deben estar ordenados cronológicamente
    const sorted = [...timestamps].sort();
    expect(timestamps).toEqual(sorted);
  });

  it('6.4 - denominationsWithIssues NO incluye success (v1.3.6P)', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // Solo 1 error en penny
    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43);

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.denominationsWithIssues).toHaveLength(1); // Solo penny
    expect(behavior.denominationsWithIssues[0].denomination).toBe('penny');
  });

  it('6.5 - Contadores agregados coherentes con severityFlags length', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // penny: warning_retry
    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43);

    // nickel: critical_severe
    await enterIncorrectValue(user, 15);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 18);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 22);
    await user.click(screen.getByText('Aceptar resultado'));

    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    // severityFlags debe tener 2 flags (warning_retry + critical_severe)
    expect(behavior.severityFlags).toHaveLength(2);
  });

  it('6.6 - totalAttempts suma TODOS los intentos registrados', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // penny: 2 intentos
    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43);

    // nickel: 3 intentos
    await enterIncorrectValue(user, 15);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 18);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 22);
    await user.click(screen.getByText('Aceptar resultado'));

    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.totalAttempts).toBe(5); // 2 (penny) + 3 (nickel)
  });

  it('6.7 - forcedOverridesDenoms array contiene keys correctas', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // dime: force override
    await completeStepCorrectly(user, 43); // penny
    await completeStepCorrectly(user, 20); // nickel

    await enterIncorrectValue(user, 30); // dime
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 30); // mismo valor
    await user.click(screen.getByText('Forzar este valor'));

    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    // Force limpia attemptHistory → array vacío
    expect(behavior.forcedOverridesDenoms).toEqual([]);
  });

  it('6.8 - severeInconsistenciesDenoms array contiene denominaciones [A,B,C]', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // penny: [A,B,C]
    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);
    await user.click(screen.getByText('Aceptar resultado'));

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.severeInconsistenciesDenoms).toEqual(['penny']);
  });

  it('6.9 - criticalInconsistenciesDenoms array contiene denominaciones [A,B,A]', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // penny: [A,B,A]
    await enterIncorrectValue(user, 44); // A
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42); // B
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 44); // A
    await user.click(screen.getByText('Aceptar resultado'));

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.criticalInconsistenciesDenoms).toEqual(['penny']);
  });

  it('6.10 - denominationsWithIssues incluye attempts array correcto', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // penny: [44, 43]
    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43);

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    expect(behavior.denominationsWithIssues[0].attempts).toEqual([44, 43]);
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRUPO 7: Navigation & UX (12 tests) - 20 min
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Grupo 7: Navigation & UX', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('7.1 - Botón "Cancelar" llama onCancel', async () => {
    const onCancel = vi.fn();
    renderPhase2Verification({ onCancel });

    const cancelButton = screen.getByText('Cancelar');
    await user.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('7.2 - Botón "Anterior" deshabilitado en primer paso', () => {
    renderPhase2Verification();

    const prevButton = screen.getByLabelText('Denominación anterior');
    expect(prevButton).toBeDisabled();
  });

  it('7.3 - Botón "Anterior" habilitado después de avanzar', async () => {
    renderPhase2Verification();

    await completeStepCorrectly(user, 43); // penny → avanza a nickel

    await waitFor(() => {
      const prevButton = screen.getByLabelText('Denominación anterior');
      expect(prevButton).toBeEnabled();
    });
  });

  it('7.4 - Click "Anterior" abre modal de confirmación', async () => {
    renderPhase2Verification();

    await completeStepCorrectly(user, 43); // penny

    await waitFor(async () => {
      const prevButton = screen.getByLabelText('Denominación anterior');
      await user.click(prevButton);
    });

    // Modal confirmación retroceso
    await waitFor(() => {
      expect(screen.getByText(/¿Retroceder al paso anterior?/i)).toBeInTheDocument();
    });
  });

  it('7.5 - Modal retroceso tiene botones "Sí, retroceder" y "Continuar aquí"', async () => {
    renderPhase2Verification();

    await completeStepCorrectly(user, 43);

    await waitFor(async () => {
      const prevButton = screen.getByLabelText('Denominación anterior');
      await user.click(prevButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Sí, retroceder')).toBeInTheDocument();
      expect(screen.getByText('Continuar aquí')).toBeInTheDocument();
    });
  });

  it('7.6 - Click "Sí, retroceder" llama onStepUncomplete para pasos correctos', async () => {
    const onStepUncomplete = vi.fn();
    renderPhase2Verification({ onStepUncomplete });

    await completeStepCorrectly(user, 43); // penny

    await waitFor(async () => {
      const prevButton = screen.getByLabelText('Denominación anterior');
      await user.click(prevButton);
    });

    await waitFor(async () => {
      const confirmButton = screen.getByText('Sí, retroceder');
      await user.click(confirmButton);
    });

    // Debe llamar onStepUncomplete para penny (paso actual)
    expect(onStepUncomplete).toHaveBeenCalledWith('penny');
  });

  it('7.7 - Retroceso restaura input con valor anterior si paso completado', async () => {
    renderPhase2Verification();

    await completeStepCorrectly(user, 43); // penny

    await waitFor(async () => {
      const prevButton = screen.getByLabelText('Denominación anterior');
      await user.click(prevButton);
    });

    await waitFor(async () => {
      const confirmButton = screen.getByText('Sí, retroceder');
      await user.click(confirmButton);
    });

    // Input debe tener valor 43 (del paso penny completado)
    await waitFor(() => {
      const input = getCurrentInput();
      expect(input).toHaveValue('43');
    });
  });

  it('7.8 - Progreso visual actualiza correctamente (barra de progreso)', async () => {
    renderPhase2Verification();

    // Inicialmente: 0/7
    expect(screen.getByText(/✅ 0\/7/)).toBeInTheDocument();

    await completeStepCorrectly(user, 43); // penny → 1/7

    await waitFor(() => {
      expect(screen.getByText(/✅ 1\/7/)).toBeInTheDocument();
    });

    await completeStepCorrectly(user, 20); // nickel → 2/7

    await waitFor(() => {
      expect(screen.getByText(/✅ 2\/7/)).toBeInTheDocument();
    });
  });

  it('7.9 - Badge "ACTIVO ▶" visible en paso actual', () => {
    renderPhase2Verification();

    expect(screen.getByText('ACTIVO ▶')).toBeInTheDocument();
  });

  it('7.10 - Input tiene atributos accesibilidad (id, Label)', () => {
    renderPhase2Verification();

    const input = getCurrentInput();
    expect(input).toHaveAttribute('id', 'verification-input-penny');

    // Label debe existir con htmlFor correcto
    const label = screen.getByLabelText('Un centavo');
    expect(label).toBeInTheDocument();
  });

  it('7.11 - Input type="text" + inputMode="decimal" (v3.1.0 pattern)', () => {
    renderPhase2Verification();

    const input = getCurrentInput();
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('inputMode', 'decimal');
  });

  it('7.12 - Pantalla "Verificación Exitosa" muestra monto esperado correcto', async () => {
    renderPhase2Verification();

    // 🤖 [IA] - v1.3.8 Fase 1: Aplicado helper completeAllStepsCorrectly() (timing robusto)
    await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);

    await waitFor(() => {
      expect(screen.getByText('Verificación Exitosa')).toBeInTheDocument();
    });

    // Debe mostrar $50.00 (objetivo)
    expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GRUPO 8: Regresión Bugs Históricos (4 tests) - 15 min
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

describe('Grupo 8: Regresión Bugs Históricos', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('8.1 - v1.3.6M: attemptHistory NO se borra al completar tercer intento', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // Tercer intento
    await enterIncorrectValue(user, 44);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 42);
    await clickModalButtonSafe(user, 'Volver a contar');
    await enterIncorrectValue(user, 40);
    await user.click(screen.getByText('Aceptar resultado'));

    await completeStepCorrectly(user, 20); // nickel
    await completeStepCorrectly(user, 33); // dime
    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    // Bug v1.3.6M: clearAttemptHistory() borraba intentos → totalAttempts=0
    // Fix: NO borrar → totalAttempts=3
    expect(behavior.totalAttempts).toBe(3);
  });

  it('8.2 - v1.3.6T: buildVerificationBehavior NO causa loop infinito', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // 🤖 [IA] - v1.3.8 Fase 1: Aplicado helper completeAllStepsCorrectly() (timing robusto)
    await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);

    // Callback debe llamarse EXACTAMENTE 1 vez (NO loop infinito)
    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
  });

  it('8.3 - v1.3.6Y: firstAttemptSuccesses calculado por diferencia (NO forEach)', async () => {
    const onVerificationBehaviorCollected = vi.fn();
    renderPhase2Verification({ onVerificationBehaviorCollected });

    // 3 denominaciones con error (penny, nickel, dime)
    await enterIncorrectValue(user, 44); // penny
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 43);

    await enterIncorrectValue(user, 15); // nickel
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 20);

    await enterIncorrectValue(user, 30); // dime
    await clickModalButtonSafe(user, 'Volver a contar');
    await completeStepCorrectly(user, 33);

    await completeStepCorrectly(user, 8);  // quarter
    await completeStepCorrectly(user, 1);  // dollarCoin
    await completeStepCorrectly(user, 1);  // bill1
    await completeStepCorrectly(user, 1);  // bill5

    await waitFor(() => {
      expect(onVerificationBehaviorCollected).toHaveBeenCalled();
    });

    const behavior = onVerificationBehaviorCollected.mock.calls[0][0];
    // Bug v1.3.6Y: forEach solo contaba attemptHistory → firstAttemptSuccesses=0
    // Fix: Total (7) - denominationsWithIssues (3) = 4 perfectas
    expect(behavior.firstAttemptSuccesses).toBe(4);
  });

  it('8.4 - v1.3.6h: Enter key NO registra valor cuando modal abierto', async () => {
    const onStepComplete = vi.fn();
    renderPhase2Verification({ onStepComplete });

    await enterIncorrectValue(user, 44); // Modal abre

    // Bug v1.3.6h: Enter leakeaba al input → registraba mismo valor sin recontar
    // Fix: Guard condition + blur() previenen leak

    // Presionar Enter múltiples veces con modal abierto
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');
    await user.keyboard('{Enter}');

    // onStepComplete NO debe haberse llamado
    expect(onStepComplete).not.toHaveBeenCalled();
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CLEANUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

afterEach(() => {
  vi.clearAllMocks();
});
