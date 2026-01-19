// 🤖 [IA] - v2.8.2: Tests unitarios para módulo de reportes WhatsApp
// Auditoría "Cimientos de Cristal" - Cobertura de funciones puras

import { describe, it, expect } from 'vitest';
import {
  generateDataHash,
  generateDenominationDetails,
  generateDeliveryChecklistSection,
  generateRemainingChecklistSection,
  generateExpensesSection,
  generateCompleteReport,
  type WhatsAppReportData,
  type ReportCalculationData,
} from '../whatsapp-report';
import type { CashCount, Store, Employee, ElectronicPayments } from '@/types/cash';
import type { DeliveryCalculation, PhaseState } from '@/types/phases';
import type { DailyExpense } from '@/types/expenses';

// ============================================================================
// Fixtures de datos de prueba
// ============================================================================
const mockCashCount: CashCount = {
  penny: 43,
  nickel: 20,
  dime: 33,
  quarter: 8,
  dollarCoin: 1,
  bill1: 5,
  bill5: 3,
  bill10: 2,
  bill20: 5,
  bill50: 1,
  bill100: 2,
};

const mockElectronicPayments: ElectronicPayments = {
  credomatic: 50.00,
  promerica: 75.50,
  bankTransfer: 25.00,
  paypal: 10.00,
};

const mockStore: Store = {
  id: 'store-001',
  name: 'Los Héroes',
  address: 'Av. Los Héroes 123',
  phone: '2222-3333',
  schedule: '9:00 AM - 8:00 PM',
};

const mockCashier: Employee = {
  id: 'emp-001',
  name: 'Juan Pérez',
  role: 'Cajero',
  stores: ['store-001'],
};

const mockWitness: Employee = {
  id: 'emp-002',
  name: 'María García',
  role: 'Testigo',
  stores: ['store-001'],
};

const mockCalculationData: ReportCalculationData = {
  totalCash: 377.20,
  totalElectronic: 160.50,
  salesCash: 327.20,
  totalGeneral: 487.70,
  totalExpenses: 0,
  totalWithExpenses: 487.70,
  difference: 12.70,
  timestamp: '19/01/2025, 02:30 PM',
};

const mockDeliveryCalculation: DeliveryCalculation = {
  amountToDeliver: 327.20,
  amountRemaining: 50.00,
  deliverySteps: [
    { key: 'bill100', label: '$100', value: 100, quantity: 2 },
    { key: 'bill20', label: '$20', value: 20, quantity: 5 },
    { key: 'bill5', label: '$5', value: 5, quantity: 2 },
    { key: 'bill1', label: '$1', value: 1, quantity: 7 },
    { key: 'quarter', label: '25¢', value: 0.25, quantity: 4 },
    { key: 'dime', label: '10¢', value: 0.10, quantity: 12 },
  ],
  verificationSteps: [],
  denominationsToKeep: {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 8,
    dollarCoin: 1,
    bill1: 2,
    bill5: 1,
    bill10: 2,
    bill20: 0,
    bill50: 0,
    bill100: 0,
  },
};

const mockPhaseState: PhaseState = {
  currentPhase: 3,
  shouldSkipPhase2: false,
  phaseData: {},
};

// ============================================================================
// SUITE 1: generateDataHash()
// ============================================================================
describe('generateDataHash()', () => {
  it('1.1 - Genera hash de 12 caracteres', () => {
    const data: WhatsAppReportData = {
      store: mockStore,
      cashier: mockCashier,
      witness: mockWitness,
      cashCount: mockCashCount,
      electronicPayments: mockElectronicPayments,
      expenses: [],
      expectedSales: 500.00,
      calculationData: mockCalculationData,
      deliveryCalculation: mockDeliveryCalculation,
      phaseState: mockPhaseState,
      storeId: 'store-001',
      cashierId: 'emp-001',
      witnessId: 'emp-002',
    };

    const hash = generateDataHash(data);
    expect(hash).toHaveLength(12);
    expect(typeof hash).toBe('string');
  });

  it('1.2 - Genera hash diferente para datos diferentes', () => {
    const data1: WhatsAppReportData = {
      store: mockStore,
      cashier: mockCashier,
      witness: mockWitness,
      cashCount: mockCashCount,
      electronicPayments: mockElectronicPayments,
      expenses: [],
      expectedSales: 500.00,
      calculationData: mockCalculationData,
      storeId: 'store-001',
      cashierId: 'emp-001',
      witnessId: 'emp-002',
    };

    const data2: WhatsAppReportData = {
      ...data1,
      storeId: 'store-XYZ-999', // Diferente - afecta hash significativamente
      cashierId: 'emp-XYZ',
    };

    const hash1 = generateDataHash(data1);
    const hash2 = generateDataHash(data2);
    expect(hash1).not.toBe(hash2);
  });

  it('1.3 - Genera hash consistente para los mismos datos', () => {
    const data: WhatsAppReportData = {
      store: mockStore,
      cashier: mockCashier,
      witness: mockWitness,
      cashCount: mockCashCount,
      electronicPayments: mockElectronicPayments,
      expenses: [],
      expectedSales: 500.00,
      calculationData: mockCalculationData,
      storeId: 'store-001',
      cashierId: 'emp-001',
      witnessId: 'emp-002',
    };

    const hash1 = generateDataHash(data);
    const hash2 = generateDataHash(data);
    expect(hash1).toBe(hash2);
  });
});

// ============================================================================
// SUITE 2: generateDenominationDetails()
// ============================================================================
describe('generateDenominationDetails()', () => {
  it('2.1 - Genera detalle de todas las denominaciones con cantidad > 0', () => {
    const result = generateDenominationDetails(mockCashCount);

    expect(result).toContain('1¢ × 43');
    expect(result).toContain('5¢ × 20');
    expect(result).toContain('10¢ × 33');
    expect(result).toContain('25¢ × 8');
    expect(result).toContain('$1 moneda × 1');
    expect(result).toContain('$1 × 5');
    expect(result).toContain('$5 × 3');
    expect(result).toContain('$10 × 2');
    expect(result).toContain('$20 × 5');
    expect(result).toContain('$50 × 1');
    expect(result).toContain('$100 × 2');
  });

  it('2.2 - Omite denominaciones con cantidad = 0', () => {
    const cashCount: CashCount = {
      penny: 0,
      nickel: 0,
      dime: 10,
      quarter: 0,
      dollarCoin: 0,
      bill1: 5,
      bill5: 0,
      bill10: 0,
      bill20: 0,
      bill50: 0,
      bill100: 0,
    };

    const result = generateDenominationDetails(cashCount);
    expect(result).toContain('10¢ × 10');
    expect(result).toContain('$1 × 5');
    expect(result).not.toContain('1¢');
    expect(result).not.toContain('5¢');
    expect(result).not.toContain('25¢');
  });

  it('2.3 - Retorna cadena vacía si todas las denominaciones son 0', () => {
    const cashCount: CashCount = {
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
      bill100: 0,
    };

    const result = generateDenominationDetails(cashCount);
    expect(result).toBe('');
  });

  it('2.4 - Calcula correctamente los totales de cada línea', () => {
    const cashCount: CashCount = {
      penny: 100,     // $1.00
      nickel: 0,
      dime: 0,
      quarter: 4,     // $1.00
      dollarCoin: 0,
      bill1: 0,
      bill5: 2,       // $10.00
      bill10: 0,
      bill20: 0,
      bill50: 0,
      bill100: 1,     // $100.00
    };

    const result = generateDenominationDetails(cashCount);
    expect(result).toContain('= $1.00'); // pennies
    expect(result).toContain('= $10.00'); // bill5
    expect(result).toContain('= $100.00'); // bill100
  });
});

// ============================================================================
// SUITE 3: generateDeliveryChecklistSection()
// ============================================================================
describe('generateDeliveryChecklistSection()', () => {
  it('3.1 - Retorna cadena vacía si Phase 2 fue omitida', () => {
    const phaseState: PhaseState = {
      currentPhase: 3,
      shouldSkipPhase2: true,
      phaseData: {},
    };

    const result = generateDeliveryChecklistSection(mockDeliveryCalculation, phaseState);
    expect(result).toBe('');
  });

  it('3.2 - Retorna cadena vacía si no hay deliverySteps', () => {
    const deliveryCalc: DeliveryCalculation = {
      ...mockDeliveryCalculation,
      deliverySteps: [],
    };

    const result = generateDeliveryChecklistSection(deliveryCalc, mockPhaseState);
    expect(result).toBe('');
  });

  it('3.3 - Genera sección con billetes y monedas separados', () => {
    const result = generateDeliveryChecklistSection(mockDeliveryCalculation, mockPhaseState);

    expect(result).toContain('📦 *LO QUE RECIBES');
    expect(result).toContain('$327.20');
    expect(result).toContain('Billetes:');
    expect(result).toContain('Monedas:');
    expect(result).toContain('☐ $100 × 2');
    expect(result).toContain('☐ $20 × 5');
    expect(result).toContain('☐ 25¢ × 4');
  });

  it('3.4 - Maneja deliveryCalculation undefined', () => {
    const result = generateDeliveryChecklistSection(undefined, mockPhaseState);
    expect(result).toBe('');
  });
});

// ============================================================================
// SUITE 4: generateRemainingChecklistSection()
// ============================================================================
describe('generateRemainingChecklistSection()', () => {
  it('4.1 - Genera sección con denominaciones restantes', () => {
    const result = generateRemainingChecklistSection(
      mockCashCount,
      mockDeliveryCalculation,
      mockPhaseState,
      377.20
    );

    expect(result).toContain('🏢 *LO QUE QUEDÓ EN CAJA');
    expect(result).toContain('$50.00');
  });

  it('4.2 - Usa cashCount completo si Phase 2 fue omitida', () => {
    const phaseState: PhaseState = {
      currentPhase: 3,
      shouldSkipPhase2: true,
      phaseData: {},
    };

    const result = generateRemainingChecklistSection(
      mockCashCount,
      undefined,
      phaseState,
      377.20
    );

    expect(result).toContain('$377.20'); // Total del cashCount
  });

  it('4.3 - Usa denominationsToKeep cuando existe', () => {
    const result = generateRemainingChecklistSection(
      mockCashCount,
      mockDeliveryCalculation,
      mockPhaseState,
      377.20
    );

    // Debe usar denominationsToKeep, no el cashCount original
    expect(result).toContain('$50.00');
  });
});

// ============================================================================
// SUITE 5: generateExpensesSection()
// ============================================================================
describe('generateExpensesSection()', () => {
  it('5.1 - Retorna cadena vacía si no hay gastos', () => {
    expect(generateExpensesSection([])).toBe('');
  });

  it('5.2 - Retorna cadena vacía si expenses es undefined-like', () => {
    expect(generateExpensesSection(undefined as unknown as DailyExpense[])).toBe('');
  });

  it('5.3 - Genera sección con un gasto', () => {
    const expenses: DailyExpense[] = [{
      id: 'exp-001',
      concept: 'Reparación bomba de agua',
      amount: 25.00,
      category: 'maintenance', // 🔧 - categoría válida
      hasInvoice: true,
      timestamp: '2025-01-19T14:30:00Z',
    }];

    const result = generateExpensesSection(expenses);
    expect(result).toContain('💸 *GASTOS DEL DÍA*');
    expect(result).toContain('Reparación bomba de agua');
    expect(result).toContain('$25.00');
    expect(result).toContain('✓ Con factura');
    expect(result).toContain('*Total Gastos:* $25.00');
  });

  it('5.4 - Genera sección con múltiples gastos', () => {
    const expenses: DailyExpense[] = [
      {
        id: 'exp-001',
        concept: 'Reparación bomba de agua',
        amount: 25.00,
        category: 'maintenance', // 🔧 - categoría válida
        hasInvoice: true,
        timestamp: '2025-01-19T14:30:00Z',
      },
      {
        id: 'exp-002',
        concept: 'Productos de limpieza',
        amount: 15.50,
        category: 'supplies', // 📦 - categoría válida
        hasInvoice: false,
        timestamp: '2025-01-19T15:00:00Z',
      },
    ];

    const result = generateExpensesSection(expenses);
    expect(result).toContain('1. 🔧 Reparación bomba de agua'); // maintenance = 🔧
    expect(result).toContain('2. 📦 Productos de limpieza'); // supplies = 📦
    expect(result).toContain('✗ Sin factura');
    expect(result).toContain('*Total Gastos:* $40.50');
  });

  it('5.5 - Incluye mensaje de resta del total', () => {
    const expenses: DailyExpense[] = [{
      id: 'exp-001',
      concept: 'Test',
      amount: 10.00,
      category: 'other',
      hasInvoice: true,
      timestamp: '2025-01-19T14:30:00Z',
    }];

    const result = generateExpensesSection(expenses);
    expect(result).toContain('⚠️ Este monto se restó del total general');
  });
});

// ============================================================================
// SUITE 6: generateCompleteReport()
// ============================================================================
describe('generateCompleteReport()', () => {
  const baseReportData: WhatsAppReportData = {
    store: mockStore,
    cashier: mockCashier,
    witness: mockWitness,
    cashCount: mockCashCount,
    electronicPayments: mockElectronicPayments,
    expenses: [],
    expectedSales: 475.00,
    calculationData: mockCalculationData,
    deliveryCalculation: mockDeliveryCalculation,
    phaseState: mockPhaseState,
    storeId: 'store-001',
    cashierId: 'emp-001',
    witnessId: 'emp-002',
  };

  it('6.1 - Genera reporte con header NORMAL cuando no hay alertas', () => {
    const result = generateCompleteReport(baseReportData);
    expect(result).toContain('✅ *REPORTE NORMAL*');
  });

  it('6.2 - Incluye información de sucursal, cajero y testigo', () => {
    const result = generateCompleteReport(baseReportData);
    expect(result).toContain('Sucursal: Los Héroes');
    expect(result).toContain('Cajero: Juan Pérez');
    expect(result).toContain('Testigo: María García');
  });

  it('6.3 - Incluye resumen ejecutivo con totales', () => {
    const result = generateCompleteReport(baseReportData);
    expect(result).toContain('EFECTIVO FÍSICO');
    expect(result).toContain('$377.20');
    expect(result).toContain('ELECTRÓNICO');
    expect(result).toContain('$160.50');
  });

  it('6.4 - Incluye desglose de pagos electrónicos', () => {
    const result = generateCompleteReport(baseReportData);
    expect(result).toContain('Credomatic: $50.00');
    expect(result).toContain('Promerica: $75.50');
    expect(result).toContain('Transferencia: $25.00');
    expect(result).toContain('PayPal: $10.00');
  });

  it('6.5 - Incluye división de efectivo', () => {
    const result = generateCompleteReport(baseReportData);
    expect(result).toContain('DIVISIÓN EFECTIVO');
    expect(result).toContain('Entregado:');
    expect(result).toContain('$327.20');
    expect(result).toContain('Quedó (fondo):');
  });

  it('6.6 - Incluye comparación con SICAR', () => {
    const result = generateCompleteReport(baseReportData);
    expect(result).toContain('SICAR');
    expect(result).toContain('Esperado:');
    expect(result).toContain('$475.00');
    expect(result).toContain('Diferencia:');
  });

  it('6.7 - Incluye conteo completo de denominaciones', () => {
    const result = generateCompleteReport(baseReportData);
    expect(result).toContain('CONTEO COMPLETO');
    expect(result).toContain('1¢ × 43');
  });

  it('6.8 - Incluye footer con versión y estándares', () => {
    const result = generateCompleteReport(baseReportData);
    expect(result).toContain('CashGuard Paradise v2.8.2');
    expect(result).toContain('NIST SP 800-115');
    expect(result).toContain('PCI DSS 12.10.1');
    expect(result).toContain('Firma Digital:');
  });

  it('6.9 - Maneja store, cashier o witness null', () => {
    const dataWithNulls: WhatsAppReportData = {
      ...baseReportData,
      store: null,
      cashier: null,
      witness: null,
    };

    const result = generateCompleteReport(dataWithNulls);
    expect(result).toContain('Sucursal: ');
    expect(result).toContain('Cajero: ');
    expect(result).toContain('Testigo: ');
    // No debe lanzar error
  });

  it('6.10 - Muestra SOBRANTE para diferencia positiva', () => {
    const result = generateCompleteReport(baseReportData);
    expect(result).toContain('SOBRANTE');
    expect(result).toContain('📈');
  });

  it('6.11 - Muestra FALTANTE para diferencia negativa', () => {
    const dataWithShortage: WhatsAppReportData = {
      ...baseReportData,
      calculationData: {
        ...mockCalculationData,
        difference: -25.50,
      },
    };

    const result = generateCompleteReport(dataWithShortage);
    expect(result).toContain('FALTANTE');
    expect(result).toContain('📉');
  });
});
