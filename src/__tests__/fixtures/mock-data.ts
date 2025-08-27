// 🤖 [IA] - v1.1.19: Mock data for integration testing - SECTOR 3
import { CashCount } from '@/types/cash';

/**
 * Mock de datos reutilizables para testing de integración
 * Basados en casos reales de Acuarios Paradise
 */

// Mock de sucursales
export const mockStores = {
  heroes: {
    id: 'los-heroes',
    name: 'Los Héroes',
    address: 'C.C. Los Heroes, Local #9 San Salvador'
  },
  metrocentro: {
    id: 'metrocentro',
    name: 'Metrocentro',
    address: 'C.C. Metrocentro, Nivel 2 San Salvador'
  }
};

// Mock de empleados
export const mockEmployees = {
  cashier1: {
    id: 'tito-gomez',
    name: 'Tito Gomez',
    store: 'los-heroes'
  },
  cashier2: {
    id: 'carmen-martinez',
    name: 'Carmen Martínez',
    store: 'los-heroes'
  },
  witness1: {
    id: 'maria-lopez',
    name: 'María López',
    store: 'los-heroes'
  },
  witness2: {
    id: 'carlos-rodriguez',
    name: 'Carlos Rodríguez',
    store: 'metrocentro'
  }
};

// Mock de conteos de efectivo
export const mockCashCounts = {
  // Exactamente $50 (caso morning count ideal)
  exactFifty: {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 2,     // $10
    bill10: 0,
    bill20: 2,    // $40
    bill50: 0,
    bill100: 0
  } as CashCount,

  // Menos de $50 (caso de error/faltante)
  lessThanFifty: {
    penny: 100,    // $1.00
    nickel: 100,   // $5.00
    dime: 100,     // $10.00
    quarter: 100,  // $25.00
    dollarCoin: 0,
    bill1: 5,      // $5.00
    bill5: 0,
    bill10: 0,
    bill20: 0,
    bill50: 0,
    bill100: 0
  } as CashCount,

  // Más de $50 (caso evening cut normal)
  moreThanFifty: {
    penny: 23,     // $0.23
    nickel: 15,    // $0.75
    dime: 30,      // $3.00
    quarter: 28,   // $7.00
    dollarCoin: 2, // $2.00
    bill1: 15,     // $15.00
    bill5: 12,     // $60.00
    bill10: 8,     // $80.00
    bill20: 5,     // $100.00
    bill50: 2,     // $100.00
    bill100: 3     // $300.00
  } as CashCount,

  // Caso con shortage > $3
  withShortage: {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 0,
    bill10: 1,     // $10
    bill20: 1,     // $20
    bill50: 0,
    bill100: 0
  } as CashCount,

  // Caso vacío
  empty: {
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
  } as CashCount
};

// Mock de pagos electrónicos
export const mockElectronicPayments = {
  none: {
    wompi: 0,
    chivo: 0,
    transferencia: 0,
    tarjeta: 0,
    total: 0
  },
  normal: {
    wompi: 150.75,
    chivo: 89.50,
    transferencia: 225.00,
    tarjeta: 487.25,
    total: 952.50
  },
  high: {
    wompi: 500.00,
    chivo: 750.00,
    transferencia: 1200.00,
    tarjeta: 2500.00,
    total: 4950.00
  }
};

// Mock de wizard data completo
export const mockWizardData = {
  morningDefault: {
    selectedStore: 'Los Héroes',
    selectedCashier: 'Tito Gomez',
    selectedWitness: 'María López',
    expectedSales: '50.00'
  },
  eveningDefault: {
    selectedStore: 'Metrocentro',
    selectedCashier: 'Carmen Martínez',
    selectedWitness: 'Carlos Rodríguez',
    expectedSales: '1250.75'
  },
  invalidWitness: {
    selectedStore: 'Los Héroes',
    selectedCashier: 'Tito Gomez',
    selectedWitness: 'Tito Gomez', // Same as cashier - invalid
    expectedSales: '500.00'
  }
};

// Mock de reportes esperados
export const mockExpectedReports = {
  morningSuccess: {
    title: 'Conteo Matutino Completado',
    store: 'Los Héroes',
    cashier: 'Tito Gomez',
    witness: 'María López',
    totalCash: 50.00,
    expected: 50.00,
    difference: 0.00,
    status: 'success'
  },
  eveningWithPhase2: {
    title: 'Corte de Caja Completado',
    store: 'Metrocentro',
    cashier: 'Carmen Martínez',
    witness: 'Carlos Rodríguez',
    totalCash: 567.98,
    totalElectronic: 952.50,
    totalGeneral: 1520.48,
    expected: 1250.75,
    difference: 269.73,
    status: 'alert',
    phase2Completed: true
  },
  shortageAlert: {
    title: 'Corte de Caja Completado',
    totalCash: 30.00,
    expected: 50.00,
    difference: -20.00,
    status: 'critical',
    alertMessage: 'FALTANTE CRÍTICO'
  }
};

// Mock de delays para animaciones
export const mockAnimationDelays = {
  fast: 0,
  normal: 300,
  slow: 1000
};

// Mock de timeouts
export const mockTimeouts = {
  userInteraction: 100,
  phaseTransition: 500,
  reportGeneration: 1000,
  sessionTimeout: 30 * 60 * 1000 // 30 minutes
};

// Mock de errores comunes
export const mockErrors = {
  networkError: new Error('Network request failed'),
  validationError: new Error('Validation failed: Witness cannot be the same as cashier'),
  calculationError: new Error('Calculation error: Invalid denomination count'),
  timeoutError: new Error('Session timeout: No activity for 30 minutes')
};

// Mock de test IDs para queries
export const testIds = {
  // Wizard steps
  protocolCheckbox: 'protocol-checkbox',
  storeSelect: 'store-select',
  cashierSelect: 'cashier-select',
  witnessSelect: 'witness-select',
  expectedSalesInput: 'expected-sales-input',
  
  // Navigation buttons
  nextButton: 'next-button',
  backButton: 'back-button',
  completeButton: 'complete-button',
  
  // Phase indicators
  phase1Indicator: 'phase-1-indicator',
  phase2Indicator: 'phase-2-indicator',
  phase3Indicator: 'phase-3-indicator',
  
  // Cash counting inputs
  pennyInput: 'penny-input',
  nickelInput: 'nickel-input',
  dimeInput: 'dime-input',
  quarterInput: 'quarter-input',
  bill1Input: 'bill1-input',
  bill5Input: 'bill5-input',
  bill10Input: 'bill10-input',
  bill20Input: 'bill20-input',
  bill50Input: 'bill50-input',
  bill100Input: 'bill100-input',
  
  // Electronic payment inputs
  wompiInput: 'wompi-input',
  chivoInput: 'chivo-input',
  transferenciaInput: 'transferencia-input',
  tarjetaInput: 'tarjeta-input',
  
  // Totals
  totalCashDisplay: 'total-cash-display',
  totalElectronicDisplay: 'total-electronic-display',
  totalGeneralDisplay: 'total-general-display',
  
  // Reports
  finalReport: 'final-report',
  copyButton: 'copy-button',
  shareButton: 'share-button'
};

// Helper para generar cash count aleatorio
export function generateRandomCashCount(): CashCount {
  return {
    penny: Math.floor(Math.random() * 100),
    nickel: Math.floor(Math.random() * 50),
    dime: Math.floor(Math.random() * 50),
    quarter: Math.floor(Math.random() * 40),
    dollarCoin: Math.floor(Math.random() * 10),
    bill1: Math.floor(Math.random() * 20),
    bill5: Math.floor(Math.random() * 15),
    bill10: Math.floor(Math.random() * 10),
    bill20: Math.floor(Math.random() * 8),
    bill50: Math.floor(Math.random() * 4),
    bill100: Math.floor(Math.random() * 3)
  };
}

// Helper para generar cash count con total específico
export function generateCashCountWithTotal(targetTotal: number): CashCount {
  const cashCount: CashCount = mockCashCounts.empty;
  
  // Distribute the target amount across denominations
  let remaining = targetTotal;
  
  if (remaining >= 100) {
    cashCount.bill100 = Math.floor(remaining / 100);
    remaining = remaining % 100;
  }
  
  if (remaining >= 50) {
    cashCount.bill50 = 1;
    remaining = remaining - 50;
  }
  
  if (remaining >= 20) {
    cashCount.bill20 = Math.floor(remaining / 20);
    remaining = remaining % 20;
  }
  
  if (remaining >= 10) {
    cashCount.bill10 = Math.floor(remaining / 10);
    remaining = remaining % 10;
  }
  
  if (remaining >= 5) {
    cashCount.bill5 = Math.floor(remaining / 5);
    remaining = remaining % 5;
  }
  
  if (remaining >= 1) {
    cashCount.bill1 = Math.floor(remaining);
    remaining = remaining % 1;
  }
  
  // Handle cents
  if (remaining > 0) {
    const cents = Math.round(remaining * 100);
    cashCount.quarter = Math.floor(cents / 25);
    const remainingCents = cents % 25;
    
    cashCount.dime = Math.floor(remainingCents / 10);
    const finalCents = remainingCents % 10;
    
    cashCount.nickel = Math.floor(finalCents / 5);
    cashCount.penny = finalCents % 5;
  }
  
  return cashCount;
}

export default {
  stores: mockStores,
  employees: mockEmployees,
  cashCounts: mockCashCounts,
  electronicPayments: mockElectronicPayments,
  wizardData: mockWizardData,
  expectedReports: mockExpectedReports,
  animationDelays: mockAnimationDelays,
  timeouts: mockTimeouts,
  errors: mockErrors,
  testIds,
  generateRandomCashCount,
  generateCashCountWithTotal
};