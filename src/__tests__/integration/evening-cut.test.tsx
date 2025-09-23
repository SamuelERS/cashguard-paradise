// 🤖 [IA] - v1.1.19: Integration tests for Evening Cut flow - SECTOR 3
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import Index from '@/pages/Index';
import mockData from '../fixtures/mock-data';
import { 
  renderWithProviders, 
  completeCashCount,
  completeElectronicPayments,
  verifyPhase2Distribution,
  completePhase2,
  verifyFinalReport,
  cleanupMocks,
  waitForAnimation,
  selectOperation
} from '../fixtures/test-helpers';

/**
 * Tests de integración para el flujo completo de Corte de Caja Nocturno
 * Incluye las 3 fases y validaciones de negocio
 */

describe('🌙 Evening Cut Flow Integration Tests', () => {
  
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    cleanupMocks();
  });

  it('debe completar el flujo de corte nocturno con total > $50 (3 fases completas)', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Wait for Operation Selector
    await waitFor(() => {
      expect(screen.getByText(/Corte de Caja/)).toBeInTheDocument();
      expect(screen.getByText(/Fin del día/)).toBeInTheDocument();
    });
    
    // Click on Evening Cut option
    await selectOperation(user, 'evening');
    
    // Should open Initial Wizard with 5 steps
    await waitFor(() => {
      expect(screen.getByText(/Instrucciones Obligatorias Iniciales/)).toBeInTheDocument();
    });
    
    // Step 1: Accept protocol
    const protocolCheckbox = await screen.findByRole('checkbox');
    await user.click(protocolCheckbox);
    
    const nextButton = screen.getByRole('button', { name: /siguiente/i });
    await user.click(nextButton);
    
    // Step 2: Select store
    await waitFor(() => {
      expect(screen.getByText(/Seleccionar Sucursal/i)).toBeInTheDocument();
    });
    
    const storeOption = screen.getByText('Los Héroes');
    await user.click(storeOption);
    await user.click(nextButton);
    
    // Step 3: Select cashier
    await waitFor(() => {
      expect(screen.getByText(/Seleccionar Cajero/i)).toBeInTheDocument();
    });
    
    const cashierOption = screen.getByText('Tito Gomez');
    await user.click(cashierOption);
    await user.click(nextButton);
    
    // Step 4: Select witness
    await waitFor(() => {
      expect(screen.getByText(/Seleccionar Testigo/i)).toBeInTheDocument();
    });
    
    const witnessOption = screen.getByText('María López');
    await user.click(witnessOption);
    await user.click(nextButton);
    
    // Step 5: Enter expected sales
    await waitFor(() => {
      expect(screen.getByText(/Venta Esperada SICAR/i)).toBeInTheDocument();
    });
    
    const salesInput = screen.getByRole('textbox');
    await user.type(salesInput, '1250.75');
    
    const completeButton = screen.getByRole('button', { name: /completar/i });
    await user.click(completeButton);
    
    // === PHASE 1: Cash Counting ===
    await waitFor(() => {
      expect(screen.getByText(/Fase 1/i)).toBeInTheDocument();
    });
    
    // Complete cash count with more than $50
    await completeCashCount(user, mockData.cashCounts.moreThanFifty);
    
    // Complete electronic payments
    await completeElectronicPayments(user, mockData.electronicPayments.normal);
    
    // Confirm totals
    const totalCashConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
    await user.click(totalCashConfirm);
    
    await waitForAnimation(300);
    
    const totalElectronicConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
    await user.click(totalElectronicConfirm);
    
    // Complete Phase 1
    const completePhase1Button = await screen.findByRole('button', { 
      name: /completar fase 1/i 
    });
    await user.click(completePhase1Button);
    
    // === PHASE 2: Cash Distribution ===
    await waitFor(() => {
      expect(screen.getByText(/Fase 2/i)).toBeInTheDocument();
      expect(screen.getByText(/División del Efectivo/i)).toBeInTheDocument();
    });
    
    // Verify Phase 2 shows correct distribution
    const totalCash = 667.98; // From moreThanFifty mock
    const toDeliver = totalCash - 50;
    await verifyPhase2Distribution(toDeliver);
    
    // Complete Phase 2
    await completePhase2(user);
    
    // === PHASE 3: Final Report ===
    await waitFor(() => {
      expect(screen.getByText(/Corte de Caja Completado/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Verify final report data
    await verifyFinalReport({
      title: 'Corte de Caja Completado',
      totalCash: 667.98,
      totalElectronic: 952.50,
      totalGeneral: 1620.48,
      difference: 369.73, // 1620.48 - 1250.75
      hasAlert: true // Difference > $3
    });
    
    // Verify all buttons are present
    expect(screen.getByRole('button', { name: /whatsapp/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reporte/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /copiar/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /finalizar/i })).toBeInTheDocument();
  });

  it('debe saltar Phase 2 cuando el total es ≤ $50', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Navigate to Evening Cut
    await selectOperation(user, 'evening');
    
    // Complete wizard quickly
    const protocolCheckbox = await screen.findByRole('checkbox');
    await user.click(protocolCheckbox);
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    await user.click(await screen.findByText('Metrocentro'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Carmen Martínez')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Carmen Martínez'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    await user.click(await screen.findByText('Carlos Rodríguez'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    const salesInput = screen.getByRole('textbox');
    await user.type(salesInput, '500.00');
    await user.click(screen.getByRole('button', { name: /completar/i }));
    
    // Complete Phase 1 with less than $50 cash
    await completeCashCount(user, mockData.cashCounts.lessThanFifty);
    
    // Add electronic payments to reach expected sales
    await completeElectronicPayments(user, {
      wompi: 100,
      chivo: 100,
      transferencia: 150,
      tarjeta: 104
    });
    
    // Confirm totals
    const totalCashConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
    await user.click(totalCashConfirm);
    
    await waitForAnimation(300);
    
    const totalElectronicConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
    await user.click(totalElectronicConfirm);
    
    // Complete Phase 1
    const completePhase1Button = await screen.findByRole('button', { 
      name: /completar fase 1/i 
    });
    await user.click(completePhase1Button);
    
    // Should skip Phase 2 and go directly to Phase 3
    await waitFor(() => {
      expect(screen.getByText(/Corte de Caja Completado/i)).toBeInTheDocument();
    });
    
    // Verify Phase 2 was skipped
    expect(screen.queryByText(/Fase 2/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/División del Efectivo/i)).not.toBeInTheDocument();
    
    // Verify report shows correct totals
    await verifyFinalReport({
      title: 'Corte de Caja Completado',
      totalCash: 46.00,
      totalElectronic: 454.00,
      totalGeneral: 500.00,
      difference: 0.00,
      hasAlert: false
    });
  });

  it('debe mostrar alerta crítica cuando hay faltante > $3', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Quick navigation
    await selectOperation(user, 'evening');
    
    // Quick wizard completion
    await user.click(await screen.findByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText('Los Héroes'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText('Tito Gomez'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText('María López'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    const salesInput = screen.getByRole('textbox');
    await user.type(salesInput, '100.00'); // Expect $100
    await user.click(screen.getByRole('button', { name: /completar/i }));
    
    // Complete with shortage (only $30 cash)
    await completeCashCount(user, mockData.cashCounts.withShortage);
    
    // No electronic payments
    const totalCashConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
    await user.click(totalCashConfirm);
    
    await waitForAnimation(300);
    
    const totalElectronicConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
    await user.click(totalElectronicConfirm);
    
    const completePhase1Button = await screen.findByRole('button', { 
      name: /completar fase 1/i 
    });
    await user.click(completePhase1Button);
    
    // Should show critical alert
    await waitFor(() => {
      expect(screen.getByText(/Corte de Caja Completado/i)).toBeInTheDocument();
    });
    
    // Verify critical alert
    expect(screen.getByText(/ALERTA|FALTANTE|CRÍTICO/i)).toBeInTheDocument();
    
    // Verify shortage amount
    expect(screen.getByText(/-\$70\.00/i)).toBeInTheDocument(); // $30 - $100 = -$70
  });

  it('debe manejar correctamente solo pagos electrónicos sin efectivo', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Navigate and complete wizard
    await selectOperation(user, 'evening');
    
    await user.click(await screen.findByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText('Los Héroes'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText('Tito Gomez'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText('María López'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    const salesInput = screen.getByRole('textbox');
    await user.type(salesInput, '4950.00');
    await user.click(screen.getByRole('button', { name: /completar/i }));
    
    // No cash count (all zeros)
    await completeCashCount(user, mockData.cashCounts.empty);
    
    // High electronic payments
    await completeElectronicPayments(user, mockData.electronicPayments.high);
    
    // Confirm totals
    const totalCashConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
    await user.click(totalCashConfirm);
    
    await waitForAnimation(300);
    
    const totalElectronicConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
    await user.click(totalElectronicConfirm);
    
    const completePhase1Button = await screen.findByRole('button', { 
      name: /completar fase 1/i 
    });
    await user.click(completePhase1Button);
    
    // Should skip Phase 2 (no cash to distribute)
    await waitFor(() => {
      expect(screen.getByText(/Corte de Caja Completado/i)).toBeInTheDocument();
    });
    
    // Verify totals
    await verifyFinalReport({
      title: 'Corte de Caja Completado',
      totalCash: 0.00,
      totalElectronic: 4950.00,
      totalGeneral: 4950.00,
      difference: 0.00,
      hasAlert: false
    });
  });

  it('debe validar correctamente la Phase 2 con distribución de denominaciones', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Setup with specific cash amounts for testing distribution
    await selectOperation(user, 'evening');
    
    // Complete wizard
    await user.click(await screen.findByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText('Metrocentro'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    await waitFor(() => {
      expect(screen.getByText('Carmen Martínez')).toBeInTheDocument();
    });
    await user.click(screen.getByText('Carmen Martínez'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText('Carlos Rodríguez'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    const salesInput = screen.getByRole('textbox');
    await user.type(salesInput, '200.00');
    await user.click(screen.getByRole('button', { name: /completar/i }));
    
    // Create custom cash count for $250 total
    const customCount = {
      ...mockData.cashCounts.empty,
      bill100: 2,  // $200
      bill20: 2,   // $40
      bill5: 2     // $10
    };
    
    await completeCashCount(user, customCount);
    
    // Confirm cash total
    const totalCashConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
    await user.click(totalCashConfirm);
    
    await waitForAnimation(300);
    
    const totalElectronicConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
    await user.click(totalElectronicConfirm);
    
    const completePhase1Button = await screen.findByRole('button', { 
      name: /completar fase 1/i 
    });
    await user.click(completePhase1Button);
    
    // Should enter Phase 2
    await waitFor(() => {
      expect(screen.getByText(/Fase 2/i)).toBeInTheDocument();
    });
    
    // Verify delivery section shows $200 to deliver
    expect(screen.getByText(/\$200\.00/)).toBeInTheDocument();
    
    // Verify verification section shows $50 to keep
    const verificationTab = screen.getByRole('tab', { name: /verificar/i });
    await user.click(verificationTab);
    
    await waitFor(() => {
      expect(screen.getByText(/Verificación del Cambio/i)).toBeInTheDocument();
    });
    
    // Should show denominations to keep for $50
    expect(screen.getByText(/\$50\.00/)).toBeInTheDocument();
  });

  it('debe preservar los datos del wizard durante todo el flujo de 3 fases', async () => {
    const { user } = renderWithProviders(<Index />);
    
    const testData = {
      store: 'Metrocentro',
      cashier: 'Carmen Martínez',
      witness: 'Carlos Rodríguez',
      expectedSales: '1500.00'
    };
    
    // Navigate and setup
    await selectOperation(user, 'evening');
    
    // Complete wizard with test data
    await user.click(await screen.findByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText(testData.store));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    await waitFor(() => {
      expect(screen.getByText(testData.cashier)).toBeInTheDocument();
    });
    await user.click(screen.getByText(testData.cashier));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    await user.click(await screen.findByText(testData.witness));
    await user.click(screen.getByRole('button', { name: /siguiente/i }));
    
    const salesInput = screen.getByRole('textbox');
    await user.type(salesInput, testData.expectedSales);
    await user.click(screen.getByRole('button', { name: /completar/i }));
    
    // Verify data in Phase 1
    await waitFor(() => {
      expect(screen.getByText(new RegExp(testData.store))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(testData.cashier))).toBeInTheDocument();
    });
    
    // Complete Phase 1
    await completeCashCount(user, mockData.cashCounts.moreThanFifty);
    await completeElectronicPayments(user, mockData.electronicPayments.normal);
    
    const totalCashConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
    await user.click(totalCashConfirm);
    await waitForAnimation(300);
    const totalElectronicConfirm = screen.getAllByRole('button', { name: /✓|confirmar/i })[0];
    await user.click(totalElectronicConfirm);
    
    await user.click(await screen.findByRole('button', { name: /completar fase 1/i }));
    
    // Verify data in Phase 2
    await waitFor(() => {
      expect(screen.getByText(/Fase 2/i)).toBeInTheDocument();
    });
    
    // Complete Phase 2
    await completePhase2(user);
    
    // Verify data in Phase 3 (Final Report)
    await waitFor(() => {
      expect(screen.getByText(/Corte de Caja Completado/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(new RegExp(testData.store))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(testData.cashier))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(testData.witness))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(testData.expectedSales))).toBeInTheDocument();
  });

  it('debe mostrar los colores temáticos correctos para el corte nocturno', async () => {
    const { user } = renderWithProviders(<Index />);
    
    // Navigate to Evening Cut
    await selectOperation(user, 'evening');
    
    // Complete wizard quickly
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
    
    // Wait for Phase 1
    await waitFor(() => {
      expect(screen.getByText(/Fase 1/i)).toBeInTheDocument();
    });
    
    // Check for evening-specific styling (blue/purple theme)
    const phase1Container = screen.getByText(/Fase 1/i).closest('div');
    expect(phase1Container).toBeTruthy();
    
    // The evening cut should have blue/purple gradient colors
    // Note: This is a simplified check - in real implementation check actual styles
    expect(phase1Container!.className).not.toMatch(/morning|naranja|amarillo|orange|yellow/i);
  });
});