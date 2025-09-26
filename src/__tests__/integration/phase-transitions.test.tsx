// 🤖 [IA] - v1.1.19: Integration tests for Phase Transitions - SECTOR 3
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import Index from '@/pages/Index';
import mockData from '../fixtures/mock-data';
import {
  renderWithProviders,
  completeCashCount,
  completeElectronicPayments,
  completeGuidedPhase1,
  completeGuidedCashCount,
  completeGuidedElectronicPayments,
  completeInstructionsModal,
  cleanupMocks,
  waitForAnimation,
  verifyButtonState,
  selectOperation,
  completeSecurityProtocol,
  selectOption
} from '../fixtures/test-helpers';
import { testUtils } from '../fixtures/test-utils';

/**
 * Tests de integración para las transiciones entre fases
 * Verifica las condiciones y reglas de negocio para el flujo entre fases
 */

describe('🔄 Phase Transitions Integration Tests', () => {
  
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    cleanupMocks();
  });

  describe('Phase 1 → Phase 2 Transitions', () => {
    
    it('debe proceder a Phase 2 cuando el total de efectivo es > $50', async () => {
      const { user } = renderWithProviders(<Index />);

      // Quick setup for evening cut
      await selectOperation(user, 'evening');

      // Complete security protocol
      await completeSecurityProtocol(user);

      // Navigate through wizard steps - Step 2: Select Store
      await waitForAnimation(300);
      const modal1 = testUtils.withinWizardModal();

      // Use selectOption helper to handle Select component correctly
      await selectOption(user, 'Selección de sucursal', 'Los Héroes');
      await user.click(modal1.getByRole('button', { name: /siguiente/i }));

      // Step 3: Select Cashier
      await waitForAnimation(300);
      const modal2 = testUtils.withinWizardModal();
      await selectOption(user, 'cajero responsable', 'Tito Gomez');
      await user.click(modal2.getByRole('button', { name: /siguiente/i }));

      // Step 4: Select Witness
      await waitForAnimation(300);
      const modal3 = testUtils.withinWizardModal();
      await selectOption(user, 'testigo', 'Adonay Torres');
      await user.click(modal3.getByRole('button', { name: /siguiente/i }));

      await waitForAnimation(300);
      const modal4 = testUtils.withinWizardModal();
      await user.type(modal4.getByRole('textbox'), '500.00');
      await user.click(modal4.getByRole('button', { name: /completar/i }));

      // Complete the mandatory instructions modal
      await completeInstructionsModal(user);

      // Create cash count > $50
      const cashCount = {
        ...mockData.cashCounts.empty,
        bill20: 3,  // $60
        bill10: 2   // $20
      }; // Total: $80

      // Complete electronic payments for evening count
      const electronicPayments = {
        credomatic: 50.00,
        promerica: 30.00,
        bankTransfer: 25.00,
        paypal: 15.00
      };

      // Use guided mode helpers for Sistema Ciego Anti-Fraude
      await completeGuidedPhase1(user, cashCount, electronicPayments, false);

      // Esperar transición automática a Fase 2
      await waitFor(() => {
        expect(screen.getByText(/Fase 2/i)).toBeInTheDocument();
        expect(screen.getByText(/División del Efectivo/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verify we're in Phase 2, not Phase 3
      expect(screen.queryByText(/Corte de Caja Completado/i)).not.toBeInTheDocument();
    });

    it('debe saltar directamente a Phase 3 cuando el total de efectivo es ≤ $50', async () => {
      const { user } = renderWithProviders(<Index />);

      // Quick setup for evening cut
      await selectOperation(user, 'evening');

      // Complete security protocol
      await completeSecurityProtocol(user);

      // Navigate through wizard steps - Step 2: Select Store
      await waitForAnimation(300);
      const modal1 = testUtils.withinWizardModal();
      await selectOption(user, 'Selección de sucursal', 'Los Héroes');
      await user.click(modal1.getByRole('button', { name: /siguiente/i }));

      // Step 3: Select Cashier
      await waitForAnimation(300);
      const modal2 = testUtils.withinWizardModal();
      await selectOption(user, 'cajero responsable', 'Tito Gomez');
      await user.click(modal2.getByRole('button', { name: /siguiente/i }));

      // Step 4: Select Witness
      await waitForAnimation(300);
      const modal3 = testUtils.withinWizardModal();
      await selectOption(user, 'testigo', 'Adonay Torres');
      await user.click(modal3.getByRole('button', { name: /siguiente/i }));

      await waitForAnimation(300);
      const modal4 = testUtils.withinWizardModal();
      await user.type(modal4.getByRole('textbox'), '100.00');
      await user.click(modal4.getByRole('button', { name: /completar/i }));

      // Complete the mandatory instructions modal
      await completeInstructionsModal(user);

      // Create cash count = $50
      const cashCount = {
        ...mockData.cashCounts.empty,
        bill20: 2,  // $40
        bill10: 1   // $10
      }; // Total: $50

      // Complete electronic payments for evening count
      const electronicPayments = {
        credomatic: 0.00,
        promerica: 0.00,
        bankTransfer: 0.00,
        paypal: 0.00
      };

      // Use guided mode helpers for Sistema Ciego Anti-Fraude
      await completeGuidedPhase1(user, cashCount, electronicPayments, false);

      // Should skip Phase 2 and go to Phase 3 (≤$50)
      await waitFor(() => {
        expect(screen.getByText(/Corte de Caja Completado/i)).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Verify Phase 2 was skipped
      expect(screen.queryByText(/Fase 2/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/División del Efectivo/i)).not.toBeInTheDocument();
    });

    it('debe siempre saltar Phase 2 en conteo matutino sin importar el monto', async () => {
      const { user } = renderWithProviders(<Index />);
      
      // Setup for morning count
      await selectOperation(user, 'morning');

      // Navigate through wizard steps for morning count - Step 1: Select Store
      await waitForAnimation(300);
      const modal1 = testUtils.withinWizardModal();
      await selectOption(user, 'sucursal', 'Los Héroes');
      await user.click(modal1.getByRole('button', { name: /siguiente/i }));

      // Step 2: Select Cashier
      await waitForAnimation(300);
      const modal2 = testUtils.withinWizardModal();
      await selectOption(user, 'cajero responsable', 'Tito Gomez');
      await user.click(modal2.getByRole('button', { name: /siguiente/i }));

      // Step 3: Select Witness
      await waitForAnimation(300);
      const modal3 = testUtils.withinWizardModal();
      await selectOption(user, 'testigo', 'Adonay Torres');
      await user.click(modal3.getByRole('button', { name: /completar/i }));

      // Complete the mandatory instructions modal
      await completeInstructionsModal(user);

      // Create cash count > $50 (normally would trigger Phase 2)
      const cashCount = {
        ...mockData.cashCounts.empty,
        bill100: 2  // $200
      };

      // Use guided mode helpers for Sistema Ciego Anti-Fraude (morning count)
      await completeGuidedPhase1(user, cashCount, undefined, true);

      // Should skip Phase 2 despite having > $50 (morning count always skips Phase 2)
      await waitFor(() => {
        expect(screen.getByText(/Conteo Matutino Completado/i)).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Verify Phase 2 was skipped
      expect(screen.queryByText(/Fase 2/i)).not.toBeInTheDocument();
    });
  });

  describe('Phase Button States & Navigation', () => {
    
    // 🤖 [IA] - v1.2.27: Test obsoleto - Sistema Ciego Anti-Fraude elimina botón manual "Completar Fase 1"
    // El sistema ahora auto-completa Fase 1 automáticamente tras confirmar último campo
    // Este test verificaba el estado del botón manual que ya no existe

    it('debe cambiar entre modo guiado y manual sin perder datos', async () => {
      const { user } = renderWithProviders(<Index />);

      // Setup evening cut
      await selectOperation(user, 'evening');
      await completeSecurityProtocol(user);
      await selectOption(user, 'sucursal', 'Los Héroes');
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await selectOption(user, 'cajero responsable', 'Tito Gomez');
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await selectOption(user, 'testigo', 'Adonay Torres');
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.type(screen.getByRole('textbox'), '200.00');
      await user.click(screen.getByRole('button', { name: /completar/i }));
      
      // Start in guided mode
      await waitFor(() => {
        expect(screen.getByText(/Modo Guiado/i)).toBeInTheDocument();
      });
      
      // Enter some data in guided mode
      const pennyInput = await screen.findByLabelText(/1¢ centavo/i);
      await user.type(pennyInput, '25');
      
      // Switch to manual mode
      const manualModeButton = screen.getByRole('button', { name: /modo manual/i });
      await user.click(manualModeButton);
      
      // Verify data persists
      await waitFor(() => {
        expect(screen.getByText(/Modo Manual/i)).toBeInTheDocument();
      });
      
      const pennyInputManual = screen.getByLabelText(/1¢ centavo/i);
      expect(pennyInputManual).toHaveValue(25);
      
      // Add more data in manual mode
      const bill20Input = screen.getByLabelText(/\$20/i);
      await user.type(bill20Input, '5');
      
      // Switch back to guided mode
      const guidedModeButton = screen.getByRole('button', { name: /modo guiado/i });
      await user.click(guidedModeButton);
      
      // Verify all data persists
      await waitFor(() => {
        expect(screen.getByText(/Modo Guiado/i)).toBeInTheDocument();
      });
      
      // Check that the total includes both entries
      expect(screen.getByText(/25x 1¢ centavo/i)).toBeInTheDocument();
      expect(screen.getByText(/5x \$20/i)).toBeInTheDocument();
    });
  });

  describe('Phase 2 → Phase 3 Transitions', () => {
    
    it('debe requerir completar ambas secciones de Phase 2 antes de avanzar', async () => {
      const { user } = renderWithProviders(<Index />);

      // Setup with cash > $50
      await selectOperation(user, 'evening');
      await completeSecurityProtocol(user);
      await selectOption(user, 'sucursal', 'Los Héroes');
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await selectOption(user, 'cajero responsable', 'Tito Gomez');
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await selectOption(user, 'testigo', 'Adonay Torres');
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.type(screen.getByRole('textbox'), '100.00');
      await user.click(screen.getByRole('button', { name: /completar/i }));
      
      // Create cash count > $50
      const cashCount = {
        ...mockData.cashCounts.empty,
        bill100: 1,  // $100
        bill20: 3    // $60
      }; // Total: $160
      
      await completeCashCount(user, cashCount);

      // Complete Phase 1 robustly
      const totalCashSection = screen.getByTestId('total-cash-section');
      const totalCashConfirm = within(totalCashSection).getByRole('button', { name: /✓|confirmar/i });
      await user.click(totalCashConfirm);

      await waitForAnimation(300);
      const totalElectronicSection = screen.getByTestId('total-electronic-section');
      const totalElectronicConfirm = within(totalElectronicSection).getByRole('button', { name: /✓|confirmar/i });
      await user.click(totalElectronicConfirm);
      await user.click(await screen.findByRole('button', { name: /completar fase 1/i }));

      // Should be in Phase 2
      await waitFor(() => {
        expect(screen.getByText(/Fase 2/i)).toBeInTheDocument();
      });
      
      // Try to complete without entering delivery values
      const verificationTab = screen.getByRole('tab', { name: /verificar/i });
      await user.click(verificationTab);
      
      // Complete Phase 2 button should exist but be disabled initially
      const completePhase2Button = screen.queryByRole('button', { 
        name: /completar fase 2/i 
      });
      
      if (completePhase2Button) {
        expect(completePhase2Button).toBeDisabled();
      }
    });

    it('debe validar que la suma de entrega + verificación = total efectivo', async () => {
      const { user } = renderWithProviders(<Index />);

      // Setup with exact $150 cash
      await selectOperation(user, 'evening');
      await completeSecurityProtocol(user);
      await selectOption(user, 'sucursal', 'Los Héroes');
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await selectOption(user, 'cajero responsable', 'Tito Gomez');
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await selectOption(user, 'testigo', 'Adonay Torres');
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.type(screen.getByRole('textbox'), '150.00');
      await user.click(screen.getByRole('button', { name: /completar/i }));
      
      const cashCount = {
        ...mockData.cashCounts.empty,
        bill50: 3  // $150
      };
      
      await completeCashCount(user, cashCount);

      // Complete Phase 1 robustly
      const totalCashSection = screen.getByTestId('total-cash-section');
      const totalCashConfirm = within(totalCashSection).getByRole('button', { name: /✓|confirmar/i });
      await user.click(totalCashConfirm);

      await waitForAnimation(300);
      const totalElectronicSection = screen.getByTestId('total-electronic-section');
      const totalElectronicConfirm = within(totalElectronicSection).getByRole('button', { name: /✓|confirmar/i });
      await user.click(totalElectronicConfirm);
      await user.click(await screen.findByRole('button', { name: /completar fase 1/i }));

      // In Phase 2
      await waitFor(() => {
        expect(screen.getByText(/Fase 2/i)).toBeInTheDocument();
      });
      
      // Should show $100 to deliver (150 - 50)
      expect(screen.getByText(/\$100\.00/)).toBeInTheDocument();
      
      // Verification section should show $50 to keep
      const verificationTab = screen.getByRole('tab', { name: /verificar/i });
      await user.click(verificationTab);
      
      expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
    });
  });

  describe('State Persistence Across Phases', () => {
    
    it('debe mantener los datos del wizard a través de todas las fases', async () => {
      const { user } = renderWithProviders(<Index />);

      const wizardData = {
        store: 'Los Héroes',
        cashier: 'Tito Gomez',
        witness: 'Adonay Torres',
        expectedSales: '2000.00'
      };

      // Setup
      await selectOperation(user, 'evening');
      await completeSecurityProtocol(user);
      await user.click(await screen.findByText(wizardData.store));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      
      await waitFor(() => {
        expect(screen.getByText(wizardData.cashier)).toBeInTheDocument();
      });
      await user.click(screen.getByText(wizardData.cashier));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText(wizardData.witness));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.type(screen.getByRole('textbox'), wizardData.expectedSales);
      await user.click(screen.getByRole('button', { name: /completar/i }));
      
      // Phase 1: Verify data
      await waitFor(() => {
        expect(screen.getByText(new RegExp(wizardData.store))).toBeInTheDocument();
        expect(screen.getByText(new RegExp(wizardData.cashier))).toBeInTheDocument();
      });
      
      // Complete Phase 1 with > $50
      await completeCashCount(user, mockData.cashCounts.moreThanFifty);
      await completeElectronicPayments(user, mockData.electronicPayments.high);

      const totalCashSection = screen.getByTestId('total-cash-section');
      const totalCashConfirm = within(totalCashSection).getByRole('button', { name: /✓|confirmar/i });
      await user.click(totalCashConfirm);

      await waitForAnimation(300);
      const totalElectronicSection = screen.getByTestId('total-electronic-section');
      const totalElectronicConfirm = within(totalElectronicSection).getByRole('button', { name: /✓|confirmar/i });
      await user.click(totalElectronicConfirm);
      await user.click(await screen.findByRole('button', { name: /completar fase 1/i }));
      
      // Phase 2: Data should persist
      await waitFor(() => {
        expect(screen.getByText(/Fase 2/i)).toBeInTheDocument();
      });
      
      // Complete Phase 2 quickly
      const deliveryInputs = screen.getAllByRole('spinbutton');
      for (const input of deliveryInputs.slice(0, 3)) {
        const value = input.getAttribute('value');
        if (value && parseInt(value) > 0) {
          await user.clear(input);
          await user.type(input, value);
        }
      }
      
      const verificationTab = screen.getByRole('tab', { name: /verificar/i });
      await user.click(verificationTab);
      
      const verificationInputs = screen.getAllByRole('spinbutton');
      for (const input of verificationInputs.slice(0, 3)) {
        const value = input.getAttribute('value');
        if (value && parseInt(value) > 0) {
          await user.clear(input);
          await user.type(input, value);
        }
      }
      
      const completePhase2Button = await screen.findByRole('button', { 
        name: /completar fase 2/i 
      });
      await user.click(completePhase2Button);
      
      // Phase 3: All data should still be present
      await waitFor(() => {
        expect(screen.getByText(/Corte de Caja Completado/i)).toBeInTheDocument();
      });
      
      expect(screen.getByText(new RegExp(wizardData.store))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(wizardData.cashier))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(wizardData.witness))).toBeInTheDocument();
    });

    it('debe preservar los cálculos correctamente entre fases', async () => {
      const { user } = renderWithProviders(<Index />);

      // Setup
      await selectOperation(user, 'evening');
      await completeSecurityProtocol(user);
      await selectOption(user, 'sucursal', 'Los Héroes');
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await selectOption(user, 'cajero responsable', 'Tito Gomez');
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await selectOption(user, 'testigo', 'Adonay Torres');
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.type(screen.getByRole('textbox'), '500.00');
      await user.click(screen.getByRole('button', { name: /completar/i }));
      
      // Specific amounts for testing
      const cashTotal = 275.50;
      const electronicTotal = 224.50;
      const expectedTotal = 500.00;
      
      // Cash to get $275.50
      const cashCount = {
        ...mockData.cashCounts.empty,
        bill100: 2,   // $200
        bill50: 1,    // $50
        bill20: 1,    // $20
        bill5: 1,     // $5
        quarter: 2    // $0.50
      };
      
      await completeCashCount(user, cashCount);
      
      // Electronic to get $224.50
      await completeElectronicPayments(user, {
        credomatic: 100.00,
        promerica: 50.00,
        bankTransfer: 74.50,
        paypal: 0
      });
      
      // Verify totals in Phase 1
      expect(screen.getByText(/\$275\.50/)).toBeInTheDocument();
      expect(screen.getByText(/\$224\.50/)).toBeInTheDocument();

      // Complete Phase 1 robustly
      const totalCashSection = screen.getByTestId('total-cash-section');
      const totalCashConfirm = within(totalCashSection).getByRole('button', { name: /✓|confirmar/i });
      await user.click(totalCashConfirm);

      await waitForAnimation(300);
      const totalElectronicSection = screen.getByTestId('total-electronic-section');
      const totalElectronicConfirm = within(totalElectronicSection).getByRole('button', { name: /✓|confirmar/i });
      await user.click(totalElectronicConfirm);
      await user.click(await screen.findByRole('button', { name: /completar fase 1/i }));
      
      // Phase 2: Verify calculation preservation
      await waitFor(() => {
        expect(screen.getByText(/Fase 2/i)).toBeInTheDocument();
      });
      
      // Should show $225.50 to deliver (275.50 - 50)
      expect(screen.getByText(/\$225\.50/)).toBeInTheDocument();
    });
  });
});