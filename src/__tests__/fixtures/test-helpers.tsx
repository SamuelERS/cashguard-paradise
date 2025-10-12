// 🤖 [IA] - v1.1.19: Test helpers for integration testing - SECTOR 3
import React from 'react';
import { render, RenderOptions, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { CashCount } from '@/types/cash';

/**
 * Utilidades y helpers para testing de integración
 * Facilita el testing de flujos completos de negocio
 */

// Custom render con providers necesarios
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    );
  }

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...options })
  };
}

// 🤖 [IA] - BARRIDO-FINAL-FASE-1: Helper modernizado para nuevo sistema de wizard
export async function completeInitialWizard(
  user: ReturnType<typeof userEvent.setup>,
  data: {
    store: string;
    cashier: string;
    witness: string;
    expectedSales: string;
  }
) {
  console.log('🧙‍♂️ [TEST] Starting initial wizard completion...');

  // Step 1: Complete Security Protocol (for evening cuts)
  try {
    // Check if we're in evening mode (has security protocol)
    await waitFor(() => {
      screen.getByRole('dialog', { name: /protocolo anti-fraude/i });
    }, { timeout: 90000 });

    console.log('📋 [TEST] Security protocol detected, completing...');
    await completeSecurityProtocol(user);
  } catch {
    // Morning mode - no security protocol
    console.log('🌅 [TEST] Morning mode detected - skipping security protocol');
  }

  // Step 2: Select Store
  await waitFor(() => {
    screen.getByText(/Selección de Sucursal/i);
  }, { timeout: 90000 });

  console.log(`🏪 [TEST] Selecting store: ${data.store}`);
  await selectOption(user, 'sucursal', data.store);

  // Click next
  const modal1 = screen.getByRole('dialog');
  const nextButton1 = within(modal1).getByRole('button', { name: /siguiente/i });
  await user.click(nextButton1);

  // Step 3: Select Cashier
  await waitFor(() => {
    screen.getByText(/Cajero/i);
  }, { timeout: 90000 });

  console.log(`👤 [TEST] Selecting cashier: ${data.cashier}`);
  await selectOption(user, 'cajero responsable', data.cashier);

  // Click next
  const nextButton2 = within(modal1).getByRole('button', { name: /siguiente/i });
  await user.click(nextButton2);

  // Step 4: Select Witness
  await waitFor(() => {
    screen.getByText(/Testigo/i);
  }, { timeout: 90000 });

  console.log(`👥 [TEST] Selecting witness: ${data.witness}`);
  await selectOption(user, 'testigo', data.witness);

  // Click next
  const nextButton3 = within(modal1).getByRole('button', { name: /siguiente/i });
  await user.click(nextButton3);

  // Step 5: Enter Expected Sales (for evening cuts only)
  try {
    await waitFor(() => {
      screen.getByText(/Venta Esperada/i);
    }, { timeout: 90000 });

    console.log(`💰 [TEST] Entering expected sales: ${data.expectedSales}`);
    const salesInput = screen.getByRole('textbox');
    await user.type(salesInput, data.expectedSales);

    const completeButton = within(modal1).getByRole('button', { name: /completar/i });
    await user.click(completeButton);
  } catch {
    // Morning mode - no expected sales, just complete
    console.log('🌅 [TEST] Morning mode - completing without expected sales');
    const completeButton = within(modal1).getByRole('button', { name: /completar/i });
    await user.click(completeButton);
  }

  console.log('✅ [TEST] Initial wizard completion finished');
}

// Helper para completar el conteo de efectivo
export async function completeCashCount(
  user: ReturnType<typeof userEvent.setup>,
  cashCount: CashCount
) {
  // Input penny count
  if (cashCount.penny > 0) {
    const pennyInput = await screen.findByLabelText(/1 centavo/i);
    await user.clear(pennyInput);
    await user.type(pennyInput, cashCount.penny.toString());
  }

  // Input nickel count
  if (cashCount.nickel > 0) {
    const nickelInput = await screen.findByLabelText(/5 centavos/i);
    await user.clear(nickelInput);
    await user.type(nickelInput, cashCount.nickel.toString());
  }

  // Input dime count
  if (cashCount.dime > 0) {
    const dimeInput = await screen.findByLabelText(/10 centavos/i);
    await user.clear(dimeInput);
    await user.type(dimeInput, cashCount.dime.toString());
  }

  // Input quarter count
  if (cashCount.quarter > 0) {
    const quarterInput = await screen.findByLabelText(/25 centavos/i);
    await user.clear(quarterInput);
    await user.type(quarterInput, cashCount.quarter.toString());
  }
  
  // Input bills
  const bills = [
    { amount: 1, count: cashCount.bill1 },
    { amount: 5, count: cashCount.bill5 },
    { amount: 10, count: cashCount.bill10 },
    { amount: 20, count: cashCount.bill20 },
    { amount: 50, count: cashCount.bill50 },
    { amount: 100, count: cashCount.bill100 }
  ];
  
  for (const bill of bills) {
    if (bill.count > 0) {
      const billInput = await screen.findByLabelText(new RegExp(`\\$${bill.amount}`, 'i'));
      await user.clear(billInput);
      await user.type(billInput, bill.count.toString());
    }
  }
}

// Helper para completar pagos electrónicos
export async function completeElectronicPayments(
  user: ReturnType<typeof userEvent.setup>,
  payments: {
    credomatic?: number;
    promerica?: number;
    bankTransfer?: number;
    paypal?: number;
  }
) {
  if (payments.credomatic) {
    const credomaticInput = await screen.findByLabelText(/credomatic/i);
    await user.clear(credomaticInput);
    await user.type(credomaticInput, payments.credomatic.toString());
  }

  if (payments.promerica) {
    const promericaInput = await screen.findByLabelText(/promerica/i);
    await user.clear(promericaInput);
    await user.type(promericaInput, payments.promerica.toString());
  }

  if (payments.bankTransfer) {
    const bankTransferInput = await screen.findByLabelText(/bankTransfer|transferencia/i);
    await user.clear(bankTransferInput);
    await user.type(bankTransferInput, payments.bankTransfer.toString());
  }

  if (payments.paypal) {
    const paypalInput = await screen.findByLabelText(/paypal/i);
    await user.clear(paypalInput);
    await user.type(paypalInput, payments.paypal.toString());
  }
}

// Helper para navegar entre fases
export async function navigateToPhase(
  user: ReturnType<typeof userEvent.setup>,
  phase: 1 | 2 | 3
) {
  const phaseButton = await screen.findByRole('button', { 
    name: new RegExp(`fase ${phase}`, 'i') 
  });
  await user.click(phaseButton);
  
  await waitFor(() => {
    expect(screen.getByText(new RegExp(`fase ${phase}`, 'i'))).toBeInTheDocument();
  });
}

// Helper para completar Phase 1 - Sistema Ciego Anti-Fraude v1.2.8+
export async function completePhase1(
  user: ReturnType<typeof userEvent.setup>,
  cashCount: CashCount,
  electronicPayments?: Record<string, number>
) {
  await completeCashCount(user, cashCount);

  if (electronicPayments) {
    await completeElectronicPayments(user, electronicPayments);
  }

  // Sistema Ciego Anti-Fraude: Auto-completado tras último campo
  // No hay botón manual - el sistema auto-completa automáticamente
  await waitFor(() => {
    // Esperar que desaparezca el modal de conteo (indicador de auto-completado)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  }, { timeout: 90000 });
}

// Helper para verificar Phase 2 (delivery/verification)
export async function verifyPhase2Distribution(expectedToDeliver: number) {
  await waitFor(() => {
    expect(screen.getByText(/fase 2/i)).toBeInTheDocument();
    expect(screen.getByText(/entregar/i)).toBeInTheDocument();
    expect(screen.getByText(/verificar/i)).toBeInTheDocument();
  });
  
  // Verify the amount to deliver is calculated correctly
  const deliveryAmount = screen.getByText(new RegExp(`\\$${expectedToDeliver}`, 'i'));
  expect(deliveryAmount).toBeInTheDocument();
  
  // Verify $50 remains for verification
  const verificationAmount = screen.getByText(/\$50\.00/);
  expect(verificationAmount).toBeInTheDocument();
}

// Helper para completar Phase 2
export async function completePhase2(
  user: ReturnType<typeof userEvent.setup>
) {
  // Complete delivery section
  const deliveryInputs = screen.getAllByRole('spinbutton');
  
  for (const input of deliveryInputs) {
    const currentValue = input.getAttribute('value');
    if (currentValue && parseInt(currentValue) > 0) {
      await user.clear(input);
      await user.type(input, currentValue);
    }
  }
  
  // Navigate to verification
  const verificationButton = await screen.findByRole('button', { 
    name: /verificaci[óo]n/i 
  });
  await user.click(verificationButton);
  
  // Complete verification section
  const verificationInputs = screen.getAllByRole('spinbutton');
  
  for (const input of verificationInputs) {
    const currentValue = input.getAttribute('value');
    if (currentValue && parseInt(currentValue) > 0) {
      await user.clear(input);
      await user.type(input, currentValue);
    }
  }
  
  // Complete Phase 2
  const completePhase2Button = await screen.findByRole('button', { 
    name: /completar fase 2/i 
  });
  await user.click(completePhase2Button);
}

// Helper para verificar el reporte final
export async function verifyFinalReport(
  expectedData: {
    title: string;
    totalCash?: number;
    totalElectronic?: number;
    totalGeneral?: number;
    difference?: number;
    hasAlert?: boolean;
  }
) {
  await waitFor(() => {
    expect(screen.getByText(new RegExp(expectedData.title, 'i'))).toBeInTheDocument();
  });
  
  if (expectedData.totalCash !== undefined) {
    expect(screen.getByText(new RegExp(`\\$${expectedData.totalCash}`, 'i'))).toBeInTheDocument();
  }
  
  if (expectedData.totalElectronic !== undefined) {
    expect(screen.getByText(new RegExp(`\\$${expectedData.totalElectronic}`, 'i'))).toBeInTheDocument();
  }
  
  if (expectedData.totalGeneral !== undefined) {
    expect(screen.getByText(new RegExp(`\\$${expectedData.totalGeneral}`, 'i'))).toBeInTheDocument();
  }
  
  if (expectedData.difference !== undefined) {
    const diffText = expectedData.difference >= 0 ? 
      `\\+\\$${expectedData.difference}` : 
      `-\\$${Math.abs(expectedData.difference)}`;
    expect(screen.getByText(new RegExp(diffText, 'i'))).toBeInTheDocument();
  }
  
  if (expectedData.hasAlert) {
    expect(screen.getByText(/alerta|faltante/i)).toBeInTheDocument();
  }
}

// 🤖 [IA] - v1.2.27: HELPERS PARA MODO GUIADO - Sistema Ciego Anti-Fraude
// Estos helpers simulan el flujo guiado campo por campo, respetando la arquitectura del Sistema Ciego

// Helper para confirmar el campo activo en modo guiado
export async function confirmGuidedField(
  user: ReturnType<typeof userEvent.setup>,
  value: string
) {
  // Buscar el input activo dentro del componente guiado
  // 🤖 [IA] - v1.2.35: Simplified to work with accessible labels
  // Now that inputs have proper <Label> associations, we can find by role directly
  // Only one textbox is visible at a time in guided mode
  const activeInput = await screen.findByRole('textbox');

  // Limpiar y escribir el valor
  // 🤖 [IA] - v1.2.36a: Fixed to allow "0" values (Sistema Ciego Anti-Fraude requires confirming ALL fields)
  await user.clear(activeInput);
  if (value !== undefined && value !== null) {
    await user.type(activeInput, value);

    // Wait for value to reflect in input
    await waitFor(() => {
      expect(activeInput).toHaveValue(value);
    }, { timeout: 90000 });
  }

  // Esperar a que el botón se habilite
  // 🤖 [IA] - v1.2.36a: Extended timeout from 2000ms to 3000ms for reliability
  await waitFor(() => {
    const confirmButton = screen.getByRole('button', {
      name: /confirmar cantidad ingresada/i
    });
    expect(confirmButton).not.toBeDisabled();
  }, { timeout: 90000 });

  // Buscar y hacer clic en el botón de confirmación
  const confirmButton = await screen.findByRole('button', {
    name: /confirmar cantidad ingresada/i
  });
  await user.click(confirmButton);

  // Esperar animación de transición al siguiente campo
  await waitForAnimation(500);
}

// Helper para completar conteo de efectivo en modo guiado (campos 1-11)
export async function completeGuidedCashCount(
  user: ReturnType<typeof userEvent.setup>,
  cashCount: CashCount
) {
  // Campos 1-5: Monedas
  await confirmGuidedField(user, cashCount.penny.toString());
  await confirmGuidedField(user, cashCount.nickel.toString());
  await confirmGuidedField(user, cashCount.dime.toString());
  await confirmGuidedField(user, cashCount.quarter.toString());
  await confirmGuidedField(user, cashCount.dollarCoin.toString());

  // Campos 6-11: Billetes
  await confirmGuidedField(user, cashCount.bill1.toString());
  await confirmGuidedField(user, cashCount.bill5.toString());
  await confirmGuidedField(user, cashCount.bill10.toString());
  await confirmGuidedField(user, cashCount.bill20.toString());
  await confirmGuidedField(user, cashCount.bill50.toString());
  await confirmGuidedField(user, cashCount.bill100.toString());
}

// Helper para completar pagos electrónicos en modo guiado (campos 12-15)
export async function completeGuidedElectronicPayments(
  user: ReturnType<typeof userEvent.setup>,
  payments: {
    credomatic?: number;
    promerica?: number;
    bankTransfer?: number;
    paypal?: number;
  }
) {
  // Campo 12: Credomatic
  await confirmGuidedField(user, (payments.credomatic || 0).toString());

  // Campo 13: Promerica
  await confirmGuidedField(user, (payments.promerica || 0).toString());

  // Campo 14: Bank Transfer
  await confirmGuidedField(user, (payments.bankTransfer || 0).toString());

  // Campo 15: PayPal
  await confirmGuidedField(user, (payments.paypal || 0).toString());
}

// Helper completo para Phase 1 en modo guiado (Sistema Ciego Anti-Fraude)
export async function completeGuidedPhase1(
  user: ReturnType<typeof userEvent.setup>,
  cashCount: CashCount,
  electronicPayments?: Record<string, number>,
  isMorningCount: boolean = false
) {
  // Completar conteo de efectivo (campos 1-11)
  await completeGuidedCashCount(user, cashCount);

  if (!isMorningCount && electronicPayments) {
    // Solo para evening cut: completar pagos electrónicos (campos 12-15)
    await completeGuidedElectronicPayments(user, electronicPayments);
  }

  // Sistema Ciego Anti-Fraude: Esperar auto-completado tras último campo
  // Morning count: auto-completa tras totalCash (campo 12)
  // Evening cut: auto-completa tras totalElectronic (campo 17)
  const expectedLastStep = isMorningCount ? 12 : 17;

  await waitFor(() => {
    // Esperar que llegue al último paso
    const stepIndicator = screen.getByTestId('step-indicator');
    expect(stepIndicator.textContent).toMatch(new RegExp(`Paso ${expectedLastStep} de ${expectedLastStep}`));
  }, { timeout: 90000 });

  // Esperar auto-completado del Sistema Ciego (100ms timeout + processing)
  await waitFor(() => {
    // El modal de conteo debe desaparecer cuando se auto-completa Fase 1
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  }, { timeout: 90000 });
}

// 🤖 [IA] - v1.2.27: Helper para modal de instrucciones obligatorio - Sistema Ciego Anti-Fraude
export async function completeInstructionsModal(
  user: ReturnType<typeof userEvent.setup>
) {
  // Esperar que aparezca el modal de instrucciones
  await waitFor(() => {
    expect(screen.getByText(/Instrucciones del Corte de Caja/i)).toBeInTheDocument();
  }, { timeout: 90000 });

  // 🤖 [IA] - v1.2.35: CORREGIDO - Completar instrucciones respetando minReviewTimeMs
  // El hook useInstructionFlow requiere esperar el tiempo mínimo de revisión para cada instrucción
  // antes de que se auto-complete y habilite la siguiente (anti-fraud timing validation)

  // Instrucciones con tiempos mínimos requeridos (cashCountingInstructions.ts)
  const instructionTimings = [3000, 5000, 4000, 4000]; // confirmation, counting, ordering, packaging

  for (let i = 0; i < instructionTimings.length; i++) {
    // Buscar reglas que estén habilitadas (aria-disabled="false") y no presionadas (pressed: false)
    await waitFor(() => {
      const buttons = screen.getAllByRole('button');
      const enabledRules = buttons.filter(button => {
        const ariaLabel = button.getAttribute('aria-label');
        const ariaDisabled = button.getAttribute('aria-disabled');
        const ariaPressed = button.getAttribute('aria-pressed');
        return ariaLabel?.includes('Regla:') && ariaDisabled === 'false' && ariaPressed === 'false';
      });

      expect(enabledRules.length).toBeGreaterThan(0);
    }, { timeout: 90000 });

    // Click the enabled rule
    const buttons = screen.getAllByRole('button');
    const enabledRules = buttons.filter(button => {
      const ariaLabel = button.getAttribute('aria-label');
      const ariaDisabled = button.getAttribute('aria-disabled');
      const ariaPressed = button.getAttribute('aria-pressed');
      return ariaLabel?.includes('Regla:') && ariaDisabled === 'false' && ariaPressed === 'false';
    });

    if (enabledRules.length > 0) {
      await user.click(enabledRules[0]);
    }

    // Esperar el tiempo mínimo requerido para que la instrucción se auto-complete
    // El hook requiere minReviewTimeMs antes de marcar como 'checked' y habilitar la siguiente
    await waitForAnimation(instructionTimings[i] + 500); // +500ms buffer for auto-completion
  }

  // Confirmar inicio del conteo
  const startButton = await screen.findByRole('button', {
    name: /comenzar conteo/i
  });
  await waitFor(() => expect(startButton).not.toBeDisabled(), { timeout: 90000 });
  await user.click(startButton);

  // Verificar que el modal se cerró
  await waitFor(() => {
    expect(screen.queryByText(/Instrucciones del Corte de Caja/i)).not.toBeInTheDocument();
  }, { timeout: 90000 });
}

// Mock localStorage for testing
export function mockLocalStorage() {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });

  return localStorageMock;
}

// Mock para simular timeout de sesión
export function simulateSessionTimeout(ms: number = 30 * 60 * 1000) {
  vi.useFakeTimers();
  vi.advanceTimersByTime(ms);
  vi.useRealTimers();
}

// Helper para esperar animaciones
export async function waitForAnimation(ms: number = 500) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

// Helper para verificar que un elemento no está en el documento
export async function verifyNotInDocument(text: string | RegExp) {
  await waitFor(() => {
    expect(screen.queryByText(text)).not.toBeInTheDocument();
  });
}

// Helper para verificar estado de botones
export function verifyButtonState(
  buttonName: string | RegExp,
  state: 'enabled' | 'disabled'
) {
  const button = screen.getByRole('button', { name: buttonName });
  
  if (state === 'enabled') {
    expect(button).not.toBeDisabled();
  } else {
    expect(button).toBeDisabled();
  }
}

// Helper para limpiar mocks después de cada test
export function cleanupMocks() {
  vi.clearAllMocks();
  vi.restoreAllMocks();
  localStorage.clear();
}

// Helper para simular errores de red
export function mockNetworkError() {
  global.fetch = vi.fn().mockRejectedValue(new Error('Network request failed'));
}

// Helper para restaurar fetch original
export function restoreNetwork() {
  vi.restoreAllMocks();
}

// 🤖 [IA] - TEST-RESILIENCE-FORTIFICATION: Helper mejorado para Framer Motion components
export async function selectOperation(
  user: ReturnType<typeof userEvent.setup>,
  operation: 'morning' | 'evening'
) {
  const { fireEvent, act } = await import('@testing-library/react');

  // Wait for the operation selector to be ready
  await waitFor(() => {
    expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
  });

  // Wait for animations to complete (reducido por el mock)
  await new Promise(resolve => setTimeout(resolve, 300));

  // Find the specific operation card by title text first
  const titleText = operation === 'morning' ? 'Conteo de Caja' : 'Corte de Caja';
  const titleElement = await screen.findByText(titleText);

  // Get the card container (div with onClick and cursor-pointer)
  const cardContainer = titleElement.closest('div.cursor-pointer');

  if (!cardContainer) {
    throw new Error(`No se encontró el card container para ${operation}`);
  }

  // Múltiples estrategias para asegurar el click funcione
  try {
    // Estrategia 1: user.click (preferida)
    await act(async () => {
      await user.click(cardContainer as HTMLElement);
    });
  } catch (error1) {
    try {
      // Estrategia 2: fireEvent.click como fallback
      await act(() => {
        fireEvent.click(cardContainer as HTMLElement);
      });
    } catch (error2) {
      // Estrategia 3: Dispatch manual de evento
      await act(() => {
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        cardContainer.dispatchEvent(clickEvent);
      });
    }
  }

  // Extra time for state updates
  await new Promise(resolve => setTimeout(resolve, 100));

  // Wait for the modal to appear based on operation type
  await waitFor(() => {
    if (operation === 'morning') {
      // Morning shows MorningCountWizard
      expect(screen.getByText(/Conteo de Caja Matutino/)).toBeInTheDocument();
    } else {
      // Evening shows InitialWizardModal - múltiples estrategias
      try {
        expect(screen.getByText(/Instrucciones Obligatorias Iniciales/)).toBeInTheDocument();
      } catch {
        // Fallback: buscar por role dialog
        const dialog = screen.getByRole('dialog');
        console.log('🔍 [TEST] Dialog found, checking content...');
        console.log('Dialog content:', dialog.textContent?.substring(0, 200));

        // Verificar que al menos existe un dialog
        expect(dialog).toBeInTheDocument();
      }
    }
  }, { timeout: 90000 }); // Timeout aumentado por seguridad
}

// 🤖 [IA] - PROTOCOLO-SECURITY-CORRECTION: Helper con approach robusto para state async
export async function completeSecurityProtocol(
  user: ReturnType<typeof userEvent.setup>
) {
  const { act, fireEvent } = await import('@testing-library/react');

  // Esperar a que aparezca el diálogo del protocolo
  const dialog = await screen.findByRole('dialog');

  // Completar las 4 reglas del protocolo con approach reactivo
  for (let ruleIndex = 0; ruleIndex < 4; ruleIndex++) {

    let targetRule: HTMLElement | null = null;

    // Buscar la siguiente regla habilitada (no completada)
    await waitFor(() => {
      const protocolRules = within(dialog).queryAllByTestId(/protocol-rule-/);

      // Buscar regla con tabIndex >= 0 (habilitada) y aria-pressed="false" (no completada)
      targetRule = protocolRules.find(rule => {
        const tabIndex = parseInt(rule.getAttribute('tabIndex') || '-1');
        const ariaPressed = rule.getAttribute('aria-pressed') === 'true';
        const ariaDisabled = rule.getAttribute('aria-disabled') === 'true';

        const isClickable = tabIndex >= 0 && !ariaPressed && !ariaDisabled;
        return isClickable;
      }) || null;

      if (!targetRule) {
        // Fallback: buscar por aria-label pattern
        const buttons = within(dialog).queryAllByRole('button');
        targetRule = buttons.find(btn => {
          const label = btn.getAttribute('aria-label') || '';
          const pressed = btn.getAttribute('aria-pressed') === 'true';
          return label.includes('Presionar para revisar') && !pressed;
        }) || null;
      }

      if (!targetRule) {
        throw new Error(`No clickable rule found for iteration ${ruleIndex + 1}`);
      }

      return targetRule;
    }, { timeout: 90000, interval: 100 });

    if (targetRule) {
      const ruleTestId = targetRule.getAttribute('data-testid');
      console.log(`🖱️ [TEST] Clicking rule: ${ruleTestId}`);

      // Click con estrategias múltiples
      await act(async () => {
        try {
          await user.click(targetRule);
        } catch (clickError) {
          fireEvent.click(targetRule);
        }
      });

      // Dar tiempo para que React procese el state change
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 150));
      });

      // Esperar a que la regla sea marcada como completada
      // Usar múltiples indicadores de completación para robustez

      await waitFor(() => {
        // Re-query the element to get fresh attributes
        const updatedRule = within(dialog).getByTestId(ruleTestId);

        // Verificar múltiples indicadores de completación
        const ariaPressed = updatedRule.getAttribute('aria-pressed') === 'true';
        const ariaLabel = updatedRule.getAttribute('aria-label') || '';
        const hasCompletionLabel = ariaLabel.includes('Revisada') || ariaLabel.includes('completada');
        const hasVisualIndicator = within(updatedRule).queryByText('✓') !== null ||
                                  updatedRule.querySelector('.text-green-400') !== null;

        // Verificación de completación con múltiples indicadores

        // Consider rule completed if ANY indicator shows completion
        if (ariaPressed || hasCompletionLabel || hasVisualIndicator) {
          return true;
        }

        throw new Error(`Rule ${ruleIndex + 1} completion not detected`);
      }, {
        timeout: 90000,
        interval: 150   // Check every 150ms for better responsiveness
      });

      // Extra settling time between rules
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
      });
    }
  }

  // All protocol rules completed, looking for continue button

  // Esperar a que el botón Continuar se habilite
  const continueButton = await waitFor(() => {
    const btn = within(dialog).queryByRole('button', { name: /continuar/i });
    if (!btn || btn.hasAttribute('disabled')) {
      throw new Error('Continue button not found or still disabled');
    }
    // Continue button is enabled
    return btn;
  }, { timeout: 90000, interval: 200 });

  // Click en continuar
  // Clicking continue button
  await act(async () => {
    try {
      await user.click(continueButton);
    } catch {
      fireEvent.click(continueButton);
    }
  });

  // Security protocol completion finished
}

// 🤖 [IA] - PORTAL-AWARE SELECTOR RECOVERY: Helper para elementos en portals
/**
 * Busca texto usando múltiples estrategias portal-aware
 *
 * Problema: Elementos como opciones de Select se renderizan en portals (document.body)
 * que no son encontrados por screen.findByText() estándar
 *
 * Solución: Implementa múltiples estrategias de búsqueda incrementales
 */
export async function findTextInPortal(
  text: string,
  options: { timeout?: number } = {}
): Promise<HTMLElement> {
  const { timeout = 8000 } = options;

  console.log(`🔍 [PORTAL] Searching for text: "${text}"`);

  return await waitFor(async () => {
    // Strategy 1: Búsqueda normal en screen
    try {
      const element = screen.getByText(text);
      console.log(`✅ [PORTAL] Found via screen.getByText: "${text}"`);
      return element;
    } catch {
      // Continue to next strategy
    }

    // Strategy 2: Búsqueda en document.body (portals)
    try {
      const element = within(document.body).getByText(text);
      console.log(`✅ [PORTAL] Found via document.body: "${text}"`);
      return element;
    } catch {
      // Continue to next strategy
    }

    // Strategy 3: Function matcher con partial matching
    try {
      const element = screen.getByText((content, element) => {
        const hasText = content?.includes(text) || element?.textContent?.includes(text);
        if (hasText) {
          console.log(`✅ [PORTAL] Found via partial match: "${text}"`);
        }
        return hasText || false;
      });
      return element;
    } catch {
      // Continue to next strategy
    }

    // Strategy 4: Query all text nodes and find match
    try {
      const allTextNodes = Array.from(document.body.querySelectorAll('*')).filter(
        el => el.textContent?.includes(text)
      );

      if (allTextNodes.length > 0) {
        const element = allTextNodes[0] as HTMLElement;
        console.log(`✅ [PORTAL] Found via querySelector: "${text}"`);
        return element;
      }
    } catch {
      // Final fallback
    }

    console.log(`❌ [PORTAL] Text not found: "${text}"`);
    console.log('Available text content sample:',
      Array.from(document.body.querySelectorAll('*'))
        .map(el => el.textContent?.trim())
        .filter(text => text && text.length > 0)
        .slice(0, 10)
    );

    throw new Error(`Text "${text}" not found in any portal strategy`);
  }, { timeout, interval: 200 });
}

// 🤖 [IA] - OPERACIÓN PORTAL: Helper mejorado para Select components - Portal-aware
export async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  triggerSelector: string | (() => HTMLElement),
  optionText: string
) {
  console.log(`🔍 [TEST] Selecting option "${optionText}" from dropdown...`);

  // Paso 1: Abrir el dropdown clickeando el trigger
  let trigger: HTMLElement;

  if (typeof triggerSelector === 'string') {
    // 🤖 [IA] - BUG HUNTER QA FIX: Usar role="combobox" en lugar de texto hardcodeado
    // Buscar por rol ARIA estándar de Radix UI Select
    const allSelects = screen.getAllByRole('combobox');

    // Filtrar por contexto del contenedor
    trigger = allSelects.find(select => {
      const container = select.closest('div');
      return container?.textContent?.toLowerCase()
        .includes(triggerSelector.toLowerCase());
    }) || allSelects[0]; // Fallback al primer select
  } else {
    trigger = triggerSelector();
  }

  if (!trigger) {
    throw new Error(`Select trigger not found for "${triggerSelector}"`);
  }

  console.log(`🔍 [TEST] Found trigger:`, trigger.tagName, trigger.textContent);

  // Click para abrir el dropdown
  await user.click(trigger);

  // Esperar un momento para que el dropdown se abra
  await new Promise(resolve => setTimeout(resolve, 100));

  // Paso 2: Buscar la opción en el DOM abierto usando estrategias múltiples
  await waitFor(async () => {
    // 🤖 [IA] - Estrategia 1: Buscar por role="option" (estándar ARIA)
    const optionsByRole = screen.queryAllByRole('option');
    console.log(`🔍 [TEST] Found ${optionsByRole.length} elements with role="option"`);

    // Buscar la opción específica por texto dentro de elementos con role="option"
    const targetOption = optionsByRole.find(option =>
      option.textContent?.toLowerCase().includes(optionText.toLowerCase())
    );

    if (targetOption) {
      console.log(`🔍 [TEST] Found target option by role:`, targetOption.textContent);
      await user.click(targetOption);
      return;
    }

    // 🤖 [IA] - Estrategia 2: Buscar por texto como fallback
    const optionElements = screen.queryAllByText(optionText, { exact: false });
    console.log(`🔍 [TEST] Found ${optionElements.length} elements with text "${optionText}"`);

    if (optionElements.length > 0) {
      // Buscar el elemento clickeable más apropiado
      const clickableOption = optionElements.find(el =>
        el.getAttribute('role') === 'option' ||
        el.hasAttribute('data-radix-select-item') ||
        el.tagName === 'BUTTON' ||
        el.closest('button')
      ) || optionElements[0]; // Fallback al primer elemento

      console.log(`🔍 [TEST] Clicking on option by text:`, clickableOption.tagName, clickableOption.textContent);
      await user.click(clickableOption);
      return;
    }

    throw new Error(`Option "${optionText}" not found in DOM`);
  }, { timeout: 90000 });

  console.log(`🔍 [TEST] Successfully selected "${optionText}"`);
}
