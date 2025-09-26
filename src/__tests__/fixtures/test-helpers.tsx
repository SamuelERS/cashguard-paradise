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
    }, { timeout: 2000 });

    console.log('📋 [TEST] Security protocol detected, completing...');
    await completeSecurityProtocol(user);
  } catch {
    // Morning mode - no security protocol
    console.log('🌅 [TEST] Morning mode detected - skipping security protocol');
  }

  // Step 2: Select Store
  await waitFor(() => {
    screen.getByText(/Selección de Sucursal/i);
  }, { timeout: 5000 });

  console.log(`🏪 [TEST] Selecting store: ${data.store}`);
  await selectOption(user, 'sucursal', data.store);

  // Click next
  const modal1 = screen.getByRole('dialog');
  const nextButton1 = within(modal1).getByRole('button', { name: /siguiente/i });
  await user.click(nextButton1);

  // Step 3: Select Cashier
  await waitFor(() => {
    screen.getByText(/Cajero/i);
  }, { timeout: 3000 });

  console.log(`👤 [TEST] Selecting cashier: ${data.cashier}`);
  await selectOption(user, 'cajero responsable', data.cashier);

  // Click next
  const nextButton2 = within(modal1).getByRole('button', { name: /siguiente/i });
  await user.click(nextButton2);

  // Step 4: Select Witness
  await waitFor(() => {
    screen.getByText(/Testigo/i);
  }, { timeout: 3000 });

  console.log(`👥 [TEST] Selecting witness: ${data.witness}`);
  await selectOption(user, 'testigo', data.witness);

  // Click next
  const nextButton3 = within(modal1).getByRole('button', { name: /siguiente/i });
  await user.click(nextButton3);

  // Step 5: Enter Expected Sales (for evening cuts only)
  try {
    await waitFor(() => {
      screen.getByText(/Venta Esperada/i);
    }, { timeout: 2000 });

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
    const pennyInput = await screen.findByLabelText(/1¢ centavo/i);
    await user.clear(pennyInput);
    await user.type(pennyInput, cashCount.penny.toString());
  }
  
  // Input nickel count
  if (cashCount.nickel > 0) {
    const nickelInput = await screen.findByLabelText(/5¢/i);
    await user.clear(nickelInput);
    await user.type(nickelInput, cashCount.nickel.toString());
  }
  
  // Input dime count
  if (cashCount.dime > 0) {
    const dimeInput = await screen.findByLabelText(/10¢/i);
    await user.clear(dimeInput);
    await user.type(dimeInput, cashCount.dime.toString());
  }
  
  // Input quarter count
  if (cashCount.quarter > 0) {
    const quarterInput = await screen.findByLabelText(/25¢/i);
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
  }, { timeout: 3000 });
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
  const activeInput = await screen.findByRole('textbox', {
    name: /cantidad|amount|ingrese/i
  });

  // Limpiar y escribir el valor
  await user.clear(activeInput);
  if (value && value !== '0') {
    await user.type(activeInput, value);
  }

  // Esperar a que el botón se habilite
  await waitFor(() => {
    const confirmButton = screen.getByRole('button', {
      name: /confirmar cantidad ingresada/i
    });
    expect(confirmButton).not.toBeDisabled();
  }, { timeout: 2000 });

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
  }, { timeout: 5000 });

  // Esperar auto-completado del Sistema Ciego (100ms timeout + processing)
  await waitFor(() => {
    // El modal de conteo debe desaparecer cuando se auto-completa Fase 1
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  }, { timeout: 3000 });
}

// 🤖 [IA] - v1.2.27: Helper para modal de instrucciones obligatorio - Sistema Ciego Anti-Fraude
export async function completeInstructionsModal(
  user: ReturnType<typeof userEvent.setup>
) {
  // Esperar que aparezca el modal de instrucciones
  await waitFor(() => {
    expect(screen.getByText(/Instrucciones del Corte de Caja/i)).toBeInTheDocument();
  }, { timeout: 3000 });

  // Marcar todas las reglas como leídas (buscar por role="button" con aria-pressed)
  const instructionRules = screen.getAllByRole('button', { pressed: false });
  for (const rule of instructionRules) {
    const ariaLabel = rule.getAttribute('aria-label');
    // Solo hacer clic en reglas que son de instrucciones (no otros botones)
    if (ariaLabel && ariaLabel.includes('Regla:')) {
      await user.click(rule);
      await waitForAnimation(1500); // Tiempo mínimo de lectura
    }
  }

  // Confirmar inicio del conteo
  const startButton = await screen.findByRole('button', {
    name: /comenzar conteo/i
  });
  await waitFor(() => expect(startButton).not.toBeDisabled());
  await user.click(startButton);

  // Verificar que el modal se cerró
  await waitFor(() => {
    expect(screen.queryByText(/Instrucciones del Corte de Caja/i)).not.toBeInTheDocument();
  }, { timeout: 2000 });
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
      // Evening shows InitialWizardModal
      expect(screen.getByText(/Instrucciones Obligatorias Iniciales/)).toBeInTheDocument();
    }
  }, { timeout: 10000 }); // Timeout aumentado por seguridad
}

// 🤖 [IA] - PROTOCOLO-SECURITY-CORRECTION: Helper con approach robusto para state async
export async function completeSecurityProtocol(
  user: ReturnType<typeof userEvent.setup>
) {
  console.log('🔒 [TEST] Starting security protocol completion...');
  const { act, fireEvent } = await import('@testing-library/react');

  // Esperar a que aparezca el diálogo del protocolo
  const dialog = await screen.findByRole('dialog');
  console.log('✅ [TEST] Dialog found');

  // Completar las 4 reglas del protocolo con approach reactivo
  for (let ruleIndex = 0; ruleIndex < 4; ruleIndex++) {
    console.log(`🔒 [TEST] Processing rule ${ruleIndex + 1}/4...`);

    let targetRule: HTMLElement | null = null;

    // Buscar la siguiente regla habilitada (no completada)
    await waitFor(() => {
      const protocolRules = within(dialog).queryAllByTestId(/protocol-rule-/);
      console.log(`📋 [TEST] Found ${protocolRules.length} protocol rules total`);

      // Buscar regla con tabIndex >= 0 (habilitada) y aria-pressed="false" (no completada)
      targetRule = protocolRules.find(rule => {
        const tabIndex = parseInt(rule.getAttribute('tabIndex') || '-1');
        const ariaPressed = rule.getAttribute('aria-pressed') === 'true';
        const ariaDisabled = rule.getAttribute('aria-disabled') === 'true';

        const isClickable = tabIndex >= 0 && !ariaPressed && !ariaDisabled;
        console.log(`🔍 [TEST] Rule ${rule.getAttribute('data-testid')}: tabIndex=${tabIndex}, pressed=${ariaPressed}, disabled=${ariaDisabled}, clickable=${isClickable}`);

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
        console.log(`❌ [TEST] No clickable rule found for iteration ${ruleIndex + 1}`);
        throw new Error(`No clickable rule found for iteration ${ruleIndex + 1}`);
      }

      console.log(`✅ [TEST] Target rule found: ${targetRule.getAttribute('data-testid')}`);
      return targetRule;
    }, { timeout: 8000, interval: 200 });

    if (targetRule) {
      const ruleTestId = targetRule.getAttribute('data-testid');
      console.log(`🖱️ [TEST] Clicking rule: ${ruleTestId}`);

      // Click con estrategias múltiples
      await act(async () => {
        try {
          await user.click(targetRule);
          console.log(`✅ [TEST] user.click successful on ${ruleTestId}`);
        } catch (clickError) {
          console.log(`⚠️ [TEST] user.click failed, trying fireEvent...`);
          fireEvent.click(targetRule);
          console.log(`✅ [TEST] fireEvent.click completed on ${ruleTestId}`);
        }
      });

      // Dar tiempo para que React procese el state change
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
      });

      // Esperar a que la regla sea marcada como completada
      // Usar múltiples indicadores de completación para robustez
      console.log(`⏱️ [TEST] Waiting for rule ${ruleIndex + 1} completion indicators...`);

      await waitFor(() => {
        // Re-query the element to get fresh attributes
        const updatedRule = within(dialog).getByTestId(ruleTestId);

        // Verificar múltiples indicadores de completación
        const ariaPressed = updatedRule.getAttribute('aria-pressed') === 'true';
        const ariaLabel = updatedRule.getAttribute('aria-label') || '';
        const hasCompletionLabel = ariaLabel.includes('Revisada') || ariaLabel.includes('completada');
        const hasVisualIndicator = within(updatedRule).queryByText('✓') !== null ||
                                  updatedRule.querySelector('.text-green-400') !== null;

        console.log(`📊 [TEST] Rule ${ruleIndex + 1} completion check:`);
        console.log(`  - aria-pressed: ${ariaPressed}`);
        console.log(`  - completion label: ${hasCompletionLabel}`);
        console.log(`  - visual indicator: ${hasVisualIndicator}`);
        console.log(`  - full aria-label: ${ariaLabel}`);

        // Consider rule completed if ANY indicator shows completion
        if (ariaPressed || hasCompletionLabel || hasVisualIndicator) {
          console.log(`✅ [TEST] Rule ${ruleIndex + 1} marked as completed`);
          return true;
        }

        console.log(`❌ [TEST] Rule ${ruleIndex + 1} not yet completed`);
        throw new Error(`Rule ${ruleIndex + 1} completion not detected`);
      }, {
        timeout: 8000,
        interval: 250   // Check every 250ms for better stability
      });

      // Extra settling time between rules
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
      });
    }
  }

  console.log('✅ [TEST] All protocol rules completed, looking for continue button...');

  // Esperar a que el botón Continuar se habilite
  const continueButton = await waitFor(() => {
    const btn = within(dialog).queryByRole('button', { name: /continuar/i });
    if (!btn || btn.hasAttribute('disabled')) {
      throw new Error('Continue button not found or still disabled');
    }
    console.log('✅ [TEST] Continue button is enabled');
    return btn;
  }, { timeout: 10000, interval: 300 });

  // Click en continuar
  console.log('🖱️ [TEST] Clicking continue button...');
  await act(async () => {
    try {
      await user.click(continueButton);
    } catch {
      fireEvent.click(continueButton);
    }
  });

  console.log('✅ [TEST] Security protocol completion finished');
}

// 🤖 [IA] - BARRIDO-FINAL-FASE-1: Helper para Select components de Radix UI
export async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  triggerSelector: string | (() => HTMLElement),
  optionText: string
) {
  console.log(`🔍 [TEST] Selecting option "${optionText}" from dropdown...`);
  const { act, fireEvent } = await import('@testing-library/react');

  // Encontrar el trigger - puede ser por aria-label, data-testid, o selector personalizado
  let trigger: HTMLElement;

  if (typeof triggerSelector === 'function') {
    trigger = triggerSelector();
  } else {
    // Múltiples estrategias para encontrar el trigger
    // 1. Buscar combobox por aria-label
    trigger = screen.queryByRole('combobox', { name: new RegExp(triggerSelector, 'i') });

    // 2. Buscar combobox sin nombre pero dentro del contexto adecuado
    if (!trigger) {
      const modal = screen.getByRole('dialog');
      const comboboxes = within(modal).queryAllByRole('combobox');

      if (comboboxes.length === 1) {
        // Solo hay un combobox, es probablemente el correcto
        trigger = comboboxes[0];
      } else if (comboboxes.length > 1) {
        // Múltiples comboboxes, buscar por contexto (texto cercano)
        trigger = comboboxes.find(cb => {
          const parent = cb.closest('div');
          return parent && parent.textContent?.toLowerCase().includes(triggerSelector.toLowerCase());
        }) || comboboxes[0];
      }
    }

    // 3. Fallback a button con nombre
    if (!trigger) {
      trigger = screen.queryByRole('button', { name: new RegExp(triggerSelector, 'i') });
    }

    // 4. Fallback a data-testid
    if (!trigger) {
      trigger = screen.queryByTestId(triggerSelector);
    }
  }

  if (!trigger) {
    throw new Error(`No se encontró el trigger con selector: ${triggerSelector}`);
  }

  console.log(`✅ [TEST] Trigger found, opening dropdown...`);

  // Hacer click en el trigger para abrir el dropdown
  await act(async () => {
    try {
      await user.click(trigger);
    } catch (error) {
      console.log('⚠️ [TEST] user.click failed, trying fireEvent...');
      fireEvent.click(trigger);
    }
  });

  // Esperar a que aparezca el contenido del dropdown y hacer click en la opción
  console.log(`🔍 [TEST] Looking for option: ${optionText}`);

  await waitFor(async () => {
    // Radix UI renderiza el contenido en un portal, buscar en todo el documento
    // 1. Buscar por role option directamente
    let option = screen.queryByRole('option', { name: optionText });

    if (!option) {
      // 2. Buscar por texto directo (más confiable para Radix UI)
      option = screen.queryByText(optionText, { exact: false });

      // Verificar que está en un contexto de dropdown/select
      if (option && !option.closest('[role="option"]') && !option.closest('[role="listbox"]')) {
        // Buscar si hay un elemento padre que sea una opción
        const optionParent = option.closest('div[data-radix-select-item]') ||
                           option.closest('div[role="option"]') ||
                           option.closest('[data-value]');
        if (optionParent) {
          option = optionParent as HTMLElement;
        }
      }
    }

    if (!option) {
      // 3. Estrategia específica para Radix UI - buscar por data attributes
      const allOptions = document.querySelectorAll('[data-radix-select-item], [role="option"]');
      option = Array.from(allOptions).find(el =>
        el.textContent?.trim() === optionText
      ) as HTMLElement;
    }

    if (!option) {
      // 4. Estrategia final - buscar cualquier texto que coincida exactamente
      const allTexts = screen.queryAllByText(optionText, { exact: false });
      option = allTexts.find(el => {
        // Verificar que no esté en el trigger (que también podría contener el texto)
        const triggerParent = el.closest('button[role="combobox"]');
        return !triggerParent;
      });
    }

    if (!option) {
      // Debug: mostrar todas las opciones disponibles
      const availableOptions = document.querySelectorAll('[role="option"], [data-radix-select-item]');
      console.log(`❌ [TEST] Available options: ${Array.from(availableOptions).map(el => el.textContent?.trim()).join(', ')}`);
      throw new Error(`Option "${optionText}" not found`);
    }

    console.log(`✅ [TEST] Option found: ${optionText}`);

    // Click en la opción
    await act(async () => {
      try {
        await user.click(option);
        console.log(`✅ [TEST] Successfully selected: ${optionText}`);
      } catch (error) {
        console.log('⚠️ [TEST] user.click on option failed, trying fireEvent...');
        fireEvent.click(option);
        console.log(`✅ [TEST] Successfully selected via fireEvent: ${optionText}`);
      }
    });

    return true;
  }, { timeout: 8000, interval: 200 });
}

// Export all helpers
export default {
  renderWithProviders,
  completeInitialWizard,
  completeCashCount,
  completeElectronicPayments,
  navigateToPhase,
  completePhase1,
  verifyPhase2Distribution,
  completePhase2,
  verifyFinalReport,
  mockLocalStorage,
  simulateSessionTimeout,
  waitForAnimation,
  verifyNotInDocument,
  verifyButtonState,
  cleanupMocks,
  mockNetworkError,
  restoreNetwork,
  selectOperation,
  completeSecurityProtocol,
  selectOption
};