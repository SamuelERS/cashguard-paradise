// 🤖 [IA] - v1.1.17: Test data fixtures for unit and integration tests
import { CashCount } from '@/types/cash';

// Test cash counts for different scenarios
export const testCashCounts = {
  // Perfect $50 for morning count
  perfect50: {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 0,
    bill10: 1,
    bill20: 2,
    bill50: 0,
    bill100: 0,
  } as CashCount,
  
  // Over $50 - typical evening count
  over50: {
    penny: 4,
    nickel: 2,
    dime: 3,
    quarter: 8,
    dollarCoin: 5,
    bill1: 7,
    bill5: 3,
    bill10: 2,
    bill20: 3,
    bill50: 1,
    bill100: 1,
  } as CashCount,
  
  // Under $50 - shortage scenario
  under50: {
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 5,
    bill5: 2,
    bill10: 1,
    bill20: 1,
    bill50: 0,
    bill100: 0,
  } as CashCount,
  
  // Empty register
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
    bill100: 0,
  } as CashCount,
  
  // Complex mix for testing algorithms
  complex: {
    penny: 47,
    nickel: 13,
    dime: 21,
    quarter: 17,
    dollarCoin: 3,
    bill1: 23,
    bill5: 7,
    bill10: 4,
    bill20: 2,
    bill50: 0,
    bill100: 0,
  } as CashCount,
};

// Test stores and employees
export const testStores = {
  stores: [
    { id: 'heroes', name: 'Los Héroes', address: 'C.C. Los Heroes, Local #9' },
    { id: 'metro', name: 'Metrocentro', address: 'C.C. Metrocentro, Local #5' },
  ],
  
  employees: {
    heroes: [
      { id: 'emp1', name: 'Carlos Rivera', role: 'Cajero' },
      { id: 'emp2', name: 'María García', role: 'Supervisor' },
      { id: 'emp3', name: 'Carlos López', role: 'Cajero' },
    ],
    metro: [
      { id: 'emp4', name: 'Ana Martínez', role: 'Cajero' },
      { id: 'emp5', name: 'Pedro Rodríguez', role: 'Supervisor' },
      { id: 'emp6', name: 'Sofía Hernández', role: 'Cajero' },
    ],
  },
};

// Test wizard data
export const testWizardData = {
  valid: {
    protocolAccepted: true,
    selectedStore: 'Los Héroes',
    selectedCashier: 'Carlos Rivera',
    selectedWitness: 'María García',
    expectedAmount: 500.00,
  },
  
  invalidSamePerson: {
    protocolAccepted: true,
    selectedStore: 'Los Héroes',
    selectedCashier: 'Carlos Rivera',
    selectedWitness: 'Carlos Rivera', // Same as cashier - should fail
    expectedAmount: 500.00,
  },
  
  invalidNoProtocol: {
    protocolAccepted: false, // Protocol not accepted
    selectedStore: 'Los Héroes',
    selectedCashier: 'Carlos Rivera',
    selectedWitness: 'María García',
    expectedAmount: 500.00,
  },
};

// Electronic payment test data
export const testElectronicPayments = {
  none: {
    creditCard: 0,
    debitCard: 0,
    bankTransfer: 0,
    other: 0,
  },
  
  typical: {
    creditCard: 245.50,
    debitCard: 189.75,
    bankTransfer: 50.00,
    other: 15.25,
  },
  
  creditOnly: {
    creditCard: 500.00,
    debitCard: 0,
    bankTransfer: 0,
    other: 0,
  },
};

// Expected calculation results for validation
export const expectedResults = {
  perfect50: {
    total: 50.00,
    shouldSkipPhase2: true,
    hasShortage: false,
    shortageAmount: 0,
  },
  
  over50: {
    total: 249.44,
    shouldSkipPhase2: false,
    hasShortage: false,
    deliveryAmount: 199.44,
    keepAmount: 50.00,
  },
  
  under50: {
    total: 45.00,
    shouldSkipPhase2: true,
    hasShortage: true,
    shortageAmount: 5.00,
  },
};