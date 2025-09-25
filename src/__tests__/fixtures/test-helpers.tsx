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

// Helper para completar el wizard inicial
export async function completeInitialWizard(
  user: ReturnType<typeof userEvent.setup>,
  data: {
    store: string;
    cashier: string;
    witness: string;
    expectedSales: string;
  }
) {
  // Step 1: Accept protocol
  const protocolCheckbox = await screen.findByRole('checkbox');
  await user.click(protocolCheckbox);
  
  const nextButton = screen.getByRole('button', { name: /siguiente/i });
  await user.click(nextButton);
  
  // Step 2: Select store
  await waitFor(() => {
    expect(screen.getByText(/seleccionar sucursal/i)).toBeInTheDocument();
  });
  
  const storeOption = screen.getByText(data.store);
  await user.click(storeOption);
  await user.click(nextButton);
  
  // Step 3: Select cashier
  await waitFor(() => {
    expect(screen.getByText(/seleccionar cajero/i)).toBeInTheDocument();
  });
  
  const cashierOption = screen.getByText(data.cashier);
  await user.click(cashierOption);
  await user.click(nextButton);
  
  // Step 4: Select witness
  await waitFor(() => {
    expect(screen.getByText(/seleccionar testigo/i)).toBeInTheDocument();
  });
  
  const witnessOption = screen.getByText(data.witness);
  await user.click(witnessOption);
  await user.click(nextButton);
  
  // Step 5: Enter expected sales
  await waitFor(() => {
    expect(screen.getByText(/venta esperada/i)).toBeInTheDocument();
  });
  
  const salesInput = screen.getByRole('textbox');
  await user.type(salesInput, data.expectedSales);
  
  const completeButton = screen.getByRole('button', { name: /completar/i });
  await user.click(completeButton);
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

// Helper para seleccionar operación (morning count o evening cut)
export async function selectOperation(
  user: ReturnType<typeof userEvent.setup>,
  operation: 'morning' | 'evening'
) {
  // The actual button text is "Conteo de Caja" for morning and "Corte de Caja" for evening
  const buttonText = operation === 'morning' ? 'Conteo de Caja' : 'Corte de Caja';

  // Wait for the operation selector to be ready
  await waitFor(() => {
    expect(screen.getByText(/Seleccione Operación/)).toBeInTheDocument();
  });

  // Wait a bit for animations
  await new Promise(resolve => setTimeout(resolve, 500));

  // Find the text element and then click on its parent card
  const textElement = await screen.findByText(buttonText);
  // Find the clickable card (parent with cursor-pointer class)
  const card = textElement.closest('div[class*="cursor-pointer"]');

  if (card) {
    await user.click(card);
  } else {
    // Fallback: try clicking the text itself
    await user.click(textElement);
  }

  // Wait for the modal to appear
  await waitFor(() => {
    if (operation === 'morning') {
      expect(screen.getByText(/Conteo de Caja Matutino/)).toBeInTheDocument();
    } else {
      expect(screen.getByText(/Instrucciones Obligatorias Iniciales/)).toBeInTheDocument();
    }
  }, { timeout: 5000 });
}

// 🤖 [IA] - TEST-FIX-40-FINAL: Helper definitivo basado en evidencia forense completa
export async function completeSecurityProtocol(
  user: ReturnType<typeof userEvent.setup>
) {
  // Esperar a que aparezca el diálogo del protocolo
  const dialog = await screen.findByRole('dialog');

  // Completar las 4 reglas del protocolo según evidencia forense
  // Las reglas tienen aria-label="Regla:..." y aria-pressed="false"
  for (let i = 0; i < 4; i++) {
    // Buscar y hacer click en la primera regla no completada
    const buttons = within(dialog).getAllByRole('button');
    const uncompletedRule = buttons.find(btn => {
      const ariaLabel = btn.getAttribute('aria-label') || '';
      const ariaPressed = btn.getAttribute('aria-pressed');
      return ariaLabel.includes('Regla:') && ariaPressed === 'false';
    });

    if (uncompletedRule) {
      await user.click(uncompletedRule);
      // Esperar el tiempo de procesamiento del protocolo
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Esperar a que el botón Continuar se habilite y hacer click
  const continueButton = await waitFor(() => {
    const btn = within(dialog).getByRole('button', { name: /continuar/i });
    expect(btn).not.toBeDisabled();
    return btn;
  }, { timeout: 10000 });

  await user.click(continueButton);
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
  completeSecurityProtocol
};