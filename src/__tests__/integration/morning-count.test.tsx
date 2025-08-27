// 🤖 [IA] - v1.1.19: Integration tests for Morning Count flow - SECTOR 3
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import Index from '@/pages/Index';
import mockData from '../fixtures/mock-data';
import { 
  renderWithProviders, 
  completeInitialWizard,
  completeCashCount,
  verifyFinalReport,
  cleanupMocks,
  waitForAnimation,
  selectOperation
} from '../fixtures/test-helpers';

/**
 * Tests de integración para el flujo completo de Conteo Matutino
 * Verifica que todo el proceso funcione de inicio a fin
 */

describe('🌅 Morning Count Flow Integration Tests', () => {
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Mock console methods to avoid noise in tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    cleanupMocks();
  });

  it('debe completar el flujo de conteo matutino con exactamente $50', async () => {
    // Render the main component
    const { user } = renderWithProviders(<Index />);
    
    // Wait for Operation Selector to appear
    await waitFor(() => {
      expect(screen.getByText(/Conteo de Caja/)).toBeInTheDocument();
      expect(screen.getByText(/Inicio de Turno/)).toBeInTheDocument();
    });
    
    // Click on Morning Count option using helper
    await selectOperation(user, 'morning');
    
    // Should open Morning Count Wizard (already verified by helper)
    
    // Complete the simplified 3-step wizard for morning count
    // Step 1: Select store
    const storeOption = await screen.findByText('Los Héroes');
    await user.click(storeOption);
    
    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);
    
    // Step 2: Select cashier
    await waitFor(() => {
      expect(screen.getByText(/Seleccionar cajero que realiza el conteo/i)).toBeInTheDocument();
    });
    
    const cashierOption = screen.getByText('Tito Gomez');
    await user.click(cashierOption);
    await user.click(nextButton);
    
    // Step 3: Select witness
    await waitFor(() => {
      expect(screen.getByText(/Seleccionar testigo del conteo/i)).toBeInTheDocument();
    });
    
    const witnessOption = screen.getByText('María López');
    await user.click(witnessOption);
    
    const completeButton = screen.getByRole('button', { name: /completar/i });
    await user.click(completeButton);
    
    // Should navigate to cash counting
    await waitFor(() => {
      expect(screen.getByText(/Fase 1/i)).toBeInTheDocument();
    });
    
    // Complete cash count with exactly $50
    await completeCashCount(user, mockData.cashCounts.exactFifty);
    
    // Complete Phase 1
    const completePhase1Button = await screen.findByRole('button', { 
      name: /completar fase 1/i 
    });
    await user.click(completePhase1Button);
    
    // Morning count should skip Phase 2 and go directly to report
    await waitFor(() => {
      expect(screen.getByText(/Conteo Matutino Completado/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verify the report shows correct data
    await verifyFinalReport({
      title: 'Conteo Matutino Completado',
      totalCash: 50.00,
      difference: 0.00,
      hasAlert: false
    });
    
    // Verify store and personnel information
    expect(screen.getByText(/Los Héroes/)).toBeInTheDocument();
    expect(screen.getByText(/Tito Gomez/)).toBeInTheDocument();
    expect(screen.getByText(/María López/)).toBeInTheDocument();
  });

  it('debe mostrar alerta cuando el conteo matutino tiene menos de $50', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Navigate to Morning Count
    await selectOperation(user, 'morning');
    
    // Complete wizard quickly
    const storeOption = await screen.findByText('Los Héroes');
    await user.click(storeOption);
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    const cashierOption = await screen.findByText('Tito Gomez');
    await user.click(cashierOption);
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    const witnessOption = await screen.findByText('María López');
    await user.click(witnessOption);
    await user.click(screen.getByRole('button', { name: /completar/i }));
    
    // Complete cash count with less than $50 (should be $46)
    await waitFor(() => {
      expect(screen.getByText(/Fase 1/i)).toBeInTheDocument();
    });
    
    await completeCashCount(user, mockData.cashCounts.lessThanFifty);
    
    // Complete Phase 1
    const completePhase1Button = await screen.findByRole('button', { 
      name: /completar fase 1/i 
    });
    await user.click(completePhase1Button);
    
    // Should show alert for shortage
    await waitFor(() => {
      expect(screen.getByText(/Conteo Matutino Completado/i)).toBeInTheDocument();
    });
    
    // Verify alert is shown for shortage > $3
    expect(screen.getByText(/ALERTA|FALTANTE/i)).toBeInTheDocument();
    
    // Verify the exact shortage amount
    const totalCash = 1 + 5 + 10 + 25 + 5; // $46 total from lessThanFifty
    expect(screen.getByText(new RegExp(`\\$${totalCash}`, 'i'))).toBeInTheDocument();
  });

  it('debe mostrar sobrante cuando el conteo matutino tiene más de $50', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Navigate to Morning Count
    await selectOperation(user, 'morning');
    
    // Complete wizard
    const storeOption = await screen.findByText('Metrocentro');
    await user.click(storeOption);
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    // Wait for cashier list to load for Metrocentro
    await waitFor(() => {
      expect(screen.getByText(/Carmen Martínez/)).toBeInTheDocument();
    });
    
    const cashierOption = screen.getByText('Carmen Martínez');
    await user.click(cashierOption);
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    const witnessOption = await screen.findByText('Carlos Rodríguez');
    await user.click(witnessOption);
    await user.click(screen.getByRole('button', { name: /completar/i }));
    
    // Complete cash count with more than $50
    await waitFor(() => {
      expect(screen.getByText(/Fase 1/i)).toBeInTheDocument();
    });
    
    await completeCashCount(user, mockData.cashCounts.moreThanFifty);
    
    // Complete Phase 1
    const completePhase1Button = await screen.findByRole('button', { 
      name: /completar fase 1/i 
    });
    await user.click(completePhase1Button);
    
    // Morning count should still skip Phase 2 even with >$50
    await waitFor(() => {
      expect(screen.getByText(/Conteo Matutino Completado/i)).toBeInTheDocument();
    });
    
    // Verify sobrante is shown
    const totalCash = 0.23 + 0.75 + 3 + 7 + 2 + 15 + 60 + 80 + 100 + 100 + 300; // $667.98
    expect(screen.getByText(new RegExp(`\\$${totalCash.toFixed(2)}`, 'i'))).toBeInTheDocument();
    
    // Should show positive difference
    const difference = totalCash - 50;
    expect(screen.getByText(new RegExp(`\\+\\$${difference.toFixed(2)}`, 'i'))).toBeInTheDocument();
  });

  it('debe permitir cambiar entre modo guiado y manual durante el conteo', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Navigate to Morning Count and complete wizard
    await selectOperation(user, 'morning');
    
    const storeOption = await screen.findByText('Los Héroes');
    await user.click(storeOption);
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    const cashierOption = await screen.findByText('Tito Gomez');
    await user.click(cashierOption);
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    const witnessOption = await screen.findByText('María López');
    await user.click(witnessOption);
    await user.click(screen.getByRole('button', { name: /completar/i }));
    
    // Should start in guided mode
    await waitFor(() => {
      expect(screen.getByText(/Modo Guiado/i)).toBeInTheDocument();
    });
    
    // Switch to manual mode
    const manualModeButton = screen.getByRole('button', { name: /modo manual/i });
    await user.click(manualModeButton);
    
    // Verify manual mode is active
    await waitFor(() => {
      expect(screen.getByText(/Modo Manual/i)).toBeInTheDocument();
    });
    
    // All fields should be visible in manual mode
    expect(screen.getByLabelText(/1¢ centavo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/\$100/i)).toBeInTheDocument();
    
    // Complete counting in manual mode
    await completeCashCount(user, mockData.cashCounts.exactFifty);
    
    // Complete Phase 1
    const completePhase1Button = await screen.findByRole('button', { 
      name: /completar fase 1/i 
    });
    await user.click(completePhase1Button);
    
    // Verify report is generated
    await waitFor(() => {
      expect(screen.getByText(/Conteo Matutino Completado/i)).toBeInTheDocument();
    });
  });

  it('debe generar reporte con denominaciones detalladas', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Quick navigation to cash counting
    await selectOperation(user, 'morning');
    
    await user.click(await screen.findByText('Los Héroes'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText('Tito Gomez'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText('María López'));
    await user.click(screen.getByRole('button', { name: /completar/i }));
    
    // Complete with specific denominations
    const customCount = {
      ...mockData.cashCounts.empty,
      bill20: 2,  // $40
      bill5: 2    // $10
    };
    
    await completeCashCount(user, customCount);
    
    const completePhase1Button = await screen.findByRole('button', { 
      name: /completar fase 1/i 
    });
    await user.click(completePhase1Button);
    
    // Wait for report
    await waitFor(() => {
      expect(screen.getByText(/Conteo Matutino Completado/i)).toBeInTheDocument();
    });
    
    // Verify denomination details are shown
    expect(screen.getByText(/\$20 × 2 = \$40\.00/)).toBeInTheDocument();
    expect(screen.getByText(/\$5 × 2 = \$10\.00/)).toBeInTheDocument();
    expect(screen.getByText(/Total.*\$50\.00/)).toBeInTheDocument();
  });

  it('debe mantener los datos del wizard durante todo el flujo', async () => {
    const { user } = renderWithProviders(<Index />);
    
    const testData = {
      store: 'Metrocentro',
      cashier: 'Carmen Martínez',
      witness: 'Carlos Rodríguez'
    };
    
    // Navigate and complete wizard
    await selectOperation(user, 'morning');
    
    await user.click(await screen.findByText(testData.store));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    await waitFor(() => {
      expect(screen.getByText(testData.cashier)).toBeInTheDocument();
    });
    await user.click(screen.getByText(testData.cashier));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    await user.click(await screen.findByText(testData.witness));
    await user.click(screen.getByRole('button', { name: /completar/i }));
    
    // Verify data persists in Phase 1
    await waitFor(() => {
      expect(screen.getByText(new RegExp(testData.store))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(testData.cashier))).toBeInTheDocument();
    });
    
    // Complete counting
    await completeCashCount(user, mockData.cashCounts.exactFifty);
    await user.click(await screen.findByRole('button', { name: /completar fase 1/i }));
    
    // Verify data persists in final report
    await waitFor(() => {
      expect(screen.getByText(/Conteo Matutino Completado/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(new RegExp(testData.store))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(testData.cashier))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(testData.witness))).toBeInTheDocument();
  });

  it('debe permitir volver al selector de operación desde el wizard', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Navigate to Morning Count
    await selectOperation(user, 'morning');
    
    // Wizard should be open
    await waitFor(() => {
      expect(screen.getByText(/Conteo de Caja Matutino/)).toBeInTheDocument();
    });
    
    // Click close/back button
    const closeButton = screen.getByRole('button', { name: /cerrar|volver|×/i });
    await user.click(closeButton);
    
    // Should return to Operation Selector
    await waitFor(() => {
      expect(screen.getByText(/Conteo de Caja/)).toBeInTheDocument();
      expect(screen.getByText(/Corte de Caja/)).toBeInTheDocument();
    });
  });

  it('debe mostrar los colores temáticos correctos para el conteo matutino', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Navigate to Morning Count
    await selectOperation(user, 'morning');
    
    // Complete wizard
    await user.click(await screen.findByText('Los Héroes'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText('Tito Gomez'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText('María López'));
    await user.click(screen.getByRole('button', { name: /completar/i }));
    
    // Wait for Phase 1
    await waitFor(() => {
      expect(screen.getByText(/Fase 1/i)).toBeInTheDocument();
    });
    
    // Check for morning-specific styling (orange/yellow theme)
    const phase1Container = screen.getByText(/Fase 1/i).closest('div');
    expect(phase1Container).toBeTruthy();
    
    // The morning count should have orange/yellow gradient colors
    const styles = window.getComputedStyle(phase1Container!);
    // Note: In real implementation, check for specific gradient values
    // This is a simplified check
    expect(phase1Container!.className).toMatch(/morning|naranja|amarillo|orange|yellow/i);
  });
});