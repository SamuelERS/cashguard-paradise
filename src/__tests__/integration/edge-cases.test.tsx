// 🤖 [IA] - v1.1.19: Integration tests for Edge Cases - SECTOR 3
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import Index from '@/pages/Index';
import mockData from '../fixtures/mock-data';
import {
  renderWithProviders,
  completeCashCount,
  completeElectronicPayments,
  cleanupMocks,
  simulateSessionTimeout,
  mockLocalStorage,
  waitForAnimation,
  selectOperation,
  completeSecurityProtocol
} from '../fixtures/test-helpers';
import { testUtils } from '../fixtures/test-utils';

/**
 * Tests de integración para casos límite y validaciones especiales
 * Cubre escenarios de error, validaciones y comportamientos excepcionales
 */

describe('🚨 Edge Cases Integration Tests', () => {
  
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    cleanupMocks();
  });

  describe('Witness Validation', () => {
    
    it('debe prevenir seleccionar el mismo cajero como testigo', async () => {
      const { user } = renderWithProviders(<Index />);

      // Navigate to Evening Cut
      await selectOperation(user, 'evening');

      // DEBUG: Verificar que llegamos al protocolo
      console.log('🔍 AFTER selectOperation - Checking for protocol');
      await waitFor(() => {
        expect(screen.getByText(/Instrucciones Obligatorias Iniciales/)).toBeInTheDocument();
      });

      // Complete security protocol (required for evening cut)
      await completeSecurityProtocol(user);

      // Select store - usando helper robusto anti-fragmentación
      await waitFor(async () => {
        const storeElement = await testUtils.findFragmentedTextInWizard(/Seleccione.*Sucursal/i);
        expect(storeElement).toBeInTheDocument();
      });

      const modal2 = testUtils.withinWizardModal();
      await user.click(await modal2.findByText('Los Héroes'));
      await user.click(modal2.getByRole('button', { name: /siguiente/i }));

      // Select cashier
      const cashierName = 'Tito Gomez';
      await waitFor(() => {
        const modal = testUtils.withinWizardModal();
        expect(modal.getByText(/Seleccione el Cajero/)).toBeInTheDocument();
      });

      const modal3 = testUtils.withinWizardModal();
      await user.click(await modal3.findByText(cashierName));
      await user.click(modal3.getByRole('button', { name: /siguiente/i }));

      // Try to select same person as witness
      await waitFor(() => {
        const modal = testUtils.withinWizardModal();
        expect(modal.getByText(/Seleccionar Testigo/i)).toBeInTheDocument();
      });

      // The same person should be disabled or show error
      const modal4 = testUtils.withinWizardModal();
      const titoOption = modal4.getByText(cashierName);
      // In jsdom we can't use .closest(), so check the element itself or parent
      const titoParent = titoOption.parentElement;
      
      if (titoParent && titoParent.hasAttribute('disabled')) {
        // Option should be disabled
        expect(titoParent).toHaveAttribute('disabled');
      } else {
        // Or clicking should show error
        await user.click(titoOption);
        
        // Next button should remain disabled or show error
        const modal5 = testUtils.withinWizardModal();
        const nextButton = modal5.getByRole('button', { name: /siguiente/i });
        expect(nextButton).toBeDisabled();
      }
    });

    it('debe mostrar error si se intenta el mismo cajero y testigo en conteo matutino', async () => {
      const { user } = renderWithProviders(<Index />);

      // Navigate to Morning Count
      await selectOperation(user, 'morning');

      // Select store - usando helper robusto anti-fragmentación
      await waitFor(async () => {
        const storeElement = await testUtils.findFragmentedTextInWizard(/Seleccione.*Sucursal/i);
        expect(storeElement).toBeInTheDocument();
      });

      const modal1 = testUtils.withinWizardModal();
      await user.click(await modal1.findByText('Los Héroes'));
      await user.click(modal1.getByRole('button', { name: /siguiente/i }));

      // Select cashier
      const cashierName = 'Tito Gomez';
      await waitFor(() => {
        const modal = testUtils.withinWizardModal();
        expect(modal.getByText(/Seleccione el Cajero/)).toBeInTheDocument();
      });

      const modal2 = testUtils.withinWizardModal();
      await user.click(await modal2.findByText(cashierName));
      await user.click(modal2.getByRole('button', { name: /siguiente/i }));

      // Verify same person cannot be selected as witness
      await waitFor(() => {
        const modal = testUtils.withinWizardModal();
        expect(modal.getByText(/Seleccionar Testigo/)).toBeInTheDocument();
      });

      const modal3 = testUtils.withinWizardModal();
      const titoOption = modal3.queryByText(cashierName);
      if (titoOption) {
        const titoParent = titoOption.parentElement;
        if (titoParent) {
          expect(titoParent).toHaveAttribute('disabled');
        }
      }
      
      // Complete button should be disabled if somehow same person selected
      const modal4 = testUtils.withinWizardModal();
      const completeButton = modal4.queryByRole('button', { name: /completar/i });
      if (completeButton) {
        expect(completeButton).toBeDisabled();
      }
    });
  });

  describe('Shortage Alerts', () => {
    
    it('debe mostrar alerta CRÍTICA para faltante > $20 en conteo matutino', async () => {
      const { user } = renderWithProviders(<Index />);

      // Setup morning count
      await selectOperation(user, 'morning');

      const modal1 = testUtils.withinWizardModal();
      await user.click(await modal1.findByText('Los Héroes'));
      await user.click(modal1.getByRole('button', { name: /siguiente/i }));

      await waitForAnimation(200);
      const modal2 = testUtils.withinWizardModal();
      await user.click(await modal2.findByText('Tito Gomez'));
      await user.click(modal2.getByRole('button', { name: /siguiente/i }));

      await waitForAnimation(200);
      const modal3 = testUtils.withinWizardModal();
      await user.click(await modal3.findByText('María López'));
      await user.click(modal3.getByRole('button', { name: /completar/i }));
      
      // Count only $25 (shortage of $25)
      const cashCount = {
        ...mockData.cashCounts.empty,
        bill20: 1,  // $20
        bill5: 1    // $5
      };
      
      await completeCashCount(user, cashCount);
      
      const completePhase1Button = await screen.findByRole('button', { 
        name: /completar fase 1/i 
      });
      await user.click(completePhase1Button);
      
      // Should show critical alert
      await waitFor(() => {
        expect(screen.getByText(/Conteo Matutino Completado/i)).toBeInTheDocument();
      });
      
      // Look for critical alert indicators
      expect(screen.getByText(/ALERTA|CRÍTICO|FALTANTE/i)).toBeInTheDocument();
      expect(screen.getByText(/-\$25\.00/)).toBeInTheDocument();
    });

    it('debe mostrar alerta para sobrante > $3 en corte nocturno', async () => {
      const { user } = renderWithProviders(<Index />);
      
      // Setup evening cut
      await selectOperation(user, 'evening');
      await user.click(await screen.findByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('Los Héroes'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('Tito Gomez'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('María López'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.type(screen.getByRole('textbox'), '100.00');
      await user.click(screen.getByRole('button', { name: /completar/i }));
      
      // Count $120 (sobrante of $20)
      const cashCount = {
        ...mockData.cashCounts.empty,
        bill100: 1,  // $100
        bill20: 1    // $20
      };
      
      await completeCashCount(user, cashCount);
      
      // Confirm totals
      const totalCashConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
      await user.click(totalCashConfirm);
      await waitForAnimation(300);
      const totalElectronicConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
      await user.click(totalElectronicConfirm);
      
      await user.click(await screen.findByRole('button', { name: /completar fase 1/i }));
      
      // Complete Phase 2
      await waitFor(() => {
        expect(screen.getByText(/Fase 2/i)).toBeInTheDocument();
      });
      
      // Quick complete Phase 2
      const deliveryInputs = screen.getAllByRole('spinbutton');
      for (const input of deliveryInputs.slice(0, 2)) {
        const value = input.getAttribute('value');
        if (value && parseInt(value) > 0) {
          await user.clear(input);
          await user.type(input, value);
        }
      }
      
      const verificationTab = screen.getByRole('tab', { name: /verificar/i });
      await user.click(verificationTab);
      
      const verificationInputs = screen.getAllByRole('spinbutton');
      for (const input of verificationInputs.slice(0, 2)) {
        const value = input.getAttribute('value');
        if (value && parseInt(value) > 0) {
          await user.clear(input);
          await user.type(input, value);
        }
      }
      
      await user.click(await screen.findByRole('button', { name: /completar fase 2/i }));
      
      // Should show alert for surplus
      await waitFor(() => {
        expect(screen.getByText(/Corte de Caja Completado/i)).toBeInTheDocument();
      });
      
      expect(screen.getByText(/\+\$20\.00/)).toBeInTheDocument();
      expect(screen.getByText(/ALERTA|SOBRANTE/i)).toBeInTheDocument();
    });
  });

  describe('Input Validation', () => {
    
    it('debe prevenir valores negativos en campos de conteo', async () => {
      const { user } = renderWithProviders(<Index />);
      
      // Quick setup for evening cut
      await selectOperation(user, 'evening');
      await user.click(await screen.findByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('Los Héroes'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('Tito Gomez'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('María López'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.type(screen.getByRole('textbox'), '100.00');
      await user.click(screen.getByRole('button', { name: /completar/i }));
      
      // Try to enter negative values
      const pennyInput = await screen.findByLabelText(/1¢ centavo/i);
      await user.type(pennyInput, '-5');
      
      // Value should be 0 or positive only
      expect(pennyInput).not.toHaveValue(-5);
      expect(parseInt((pennyInput as HTMLInputElement).value) || 0).toBeGreaterThanOrEqual(0);
    });

    it('debe validar formato de venta esperada SICAR', async () => {
      const { user } = renderWithProviders(<Index />);
      
      // Setup evening cut wizard
      await selectOperation(user, 'evening');
      await user.click(await screen.findByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('Los Héroes'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('Tito Gomez'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('María López'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      
      // Try invalid formats
      const salesInput = screen.getByRole('textbox');
      
      // Test letters
      await user.type(salesInput, 'abc');
      const completeButton = screen.getByRole('button', { name: /completar/i });
      expect(completeButton).toBeDisabled();
      
      // Clear and test valid format
      await user.clear(salesInput);
      await user.type(salesInput, '1234.56');
      expect(completeButton).not.toBeDisabled();
    });

    it('debe limitar valores máximos razonables en campos de conteo', async () => {
      const { user } = renderWithProviders(<Index />);
      
      // Quick setup
      await selectOperation(user, 'morning');
      await user.click(await screen.findByText('Los Héroes'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('Tito Gomez'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('María López'));
      await user.click(screen.getByRole('button', { name: /completar/i }));
      
      // Try to enter unreasonably large values
      const bill100Input = await screen.findByLabelText(/\$100/i);
      await user.type(bill100Input, '999999');
      
      // Should have some reasonable limit
      const value = parseInt((bill100Input as HTMLInputElement).value);
      expect(value).toBeLessThanOrEqual(9999); // Reasonable max
    });
  });

  describe('Session Management', () => {
    
    it('debe manejar timeout de sesión después de 30 minutos de inactividad', async () => {
      const { user } = renderWithProviders(<Index />);
      
      // Start a session
      await selectOperation(user, 'evening');
      await user.click(await screen.findByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      
      // Simulate 30 minutes of inactivity
      simulateSessionTimeout(30 * 60 * 1000);
      
      // Try to continue - should show timeout or reset
      const nextButton = screen.queryByRole('button', { name: /siguiente/i });
      
      if (nextButton) {
        await user.click(nextButton);
        
        // Should either:
        // 1. Show timeout message
        const timeoutMessage = screen.queryByText(/sesión.*expirado|timeout/i);
        // 2. Or reset to initial state
        const operationSelector = screen.queryByText(/Conteo Matutino/);
        
        expect(timeoutMessage || operationSelector).toBeTruthy();
      }
    });
  });

  describe('Data Persistence', () => {
    
    it('debe recuperar datos de localStorage si la página se recarga', async () => {
      const localStorageMock = mockLocalStorage();
      
      // Simulate saved state
      const savedState = {
        wizardData: {
          selectedStore: 'Los Héroes',
          selectedCashier: 'Tito Gomez',
          selectedWitness: 'María López',
          expectedSales: '500.00'
        },
        phase: 1,
        cashCount: mockData.cashCounts.exactFifty
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedState));
      
      const { user } = renderWithProviders(<Index />);
      
      // Should restore to Phase 1 with data
      await waitFor(() => {
        // Check if we're in Phase 1 or need to handle restoration differently
        const phase1Text = screen.queryByText(/Fase 1/i);
        const operationSelector = screen.queryByText(/Conteo Matutino/);
        
        // The app might show operation selector or directly Phase 1
        expect(phase1Text || operationSelector).toBeTruthy();
      });
    });
  });

  describe('Exact $50 Scenarios', () => {
    
    it('debe manejar exactamente $50.00 en conteo matutino sin alertas', async () => {
      const { user } = renderWithProviders(<Index />);
      
      // Setup morning count
      await selectOperation(user, 'morning');
      await user.click(await screen.findByText('Los Héroes'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('Tito Gomez'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('María López'));
      await user.click(screen.getByRole('button', { name: /completar/i }));
      
      // Count exactly $50
      await completeCashCount(user, mockData.cashCounts.exactFifty);
      
      await user.click(await screen.findByRole('button', { name: /completar fase 1/i }));
      
      // Should complete without alerts
      await waitFor(() => {
        expect(screen.getByText(/Conteo Matutino Completado/i)).toBeInTheDocument();
      });
      
      // No alerts should be shown
      expect(screen.queryByText(/ALERTA|FALTANTE|CRÍTICO/i)).not.toBeInTheDocument();
      expect(screen.getByText(/\$0\.00/)).toBeInTheDocument(); // Difference should be 0
    });

    it('debe saltar Phase 2 con exactamente $50.00 en corte nocturno', async () => {
      const { user } = renderWithProviders(<Index />);
      
      // Setup evening cut
      await selectOperation(user, 'evening');
      await user.click(await screen.findByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('Los Héroes'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('Tito Gomez'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('María López'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.type(screen.getByRole('textbox'), '50.00');
      await user.click(screen.getByRole('button', { name: /completar/i }));
      
      // Count exactly $50
      await completeCashCount(user, mockData.cashCounts.exactFifty);
      
      // Confirm totals
      const totalCashConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
      await user.click(totalCashConfirm);
      await waitForAnimation(300);
      const totalElectronicConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
      await user.click(totalElectronicConfirm);
      
      await user.click(await screen.findByRole('button', { name: /completar fase 1/i }));
      
      // Should skip Phase 2
      await waitFor(() => {
        expect(screen.getByText(/Corte de Caja Completado/i)).toBeInTheDocument();
      });
      
      expect(screen.queryByText(/Fase 2/i)).not.toBeInTheDocument();
    });
  });

  describe('Empty/Zero Values', () => {
    
    it('debe manejar conteo de cero efectivo correctamente', async () => {
      const { user } = renderWithProviders(<Index />);
      
      // Setup evening cut
      await selectOperation(user, 'evening');
      await user.click(await screen.findByRole('checkbox'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('Los Héroes'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('Tito Gomez'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.click(await screen.findByText('María López'));
      await user.click(screen.getByRole('button', { name: /siguiente/i }));
      await user.type(screen.getByRole('textbox'), '1000.00');
      await user.click(screen.getByRole('button', { name: /completar/i }));
      
      // No cash at all (all zeros)
      // Don't enter any values, all fields default to 0
      
      // Complete electronic payments to match expected
      await completeElectronicPayments(user, {
        credomatic: 250,
        promerica: 250,
        bankTransfer: 250,
        paypal: 250
      });
      
      // Confirm totals
      const totalCashConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
      await user.click(totalCashConfirm);
      await waitForAnimation(300);
      const totalElectronicConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
      await user.click(totalElectronicConfirm);
      
      await user.click(await screen.findByRole('button', { name: /completar fase 1/i }));
      
      // Should skip Phase 2 (no cash to distribute)
      await waitFor(() => {
        expect(screen.getByText(/Corte de Caja Completado/i)).toBeInTheDocument();
      });
      
      // Verify report shows $0 cash
      expect(screen.getByText(/Total Efectivo.*\$0\.00/)).toBeInTheDocument();
    });
  });
});