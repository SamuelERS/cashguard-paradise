// 🤖 [IA] - ORDEN #075: Tests unitarios para wizardRules.ts
import { describe, it, expect } from 'vitest';
import { isWitnessValid, isExpectedSalesValid, calculateProgress } from '../wizardRules';
import type { WizardData } from '@/hooks/useWizardNavigation';

const makeWizardData = (overrides: Partial<WizardData> = {}): WizardData => ({
  rulesAccepted: false,
  selectedStore: '',
  selectedCashier: '',
  selectedWitness: '',
  expectedSales: '',
  dailyExpenses: [],
  ...overrides,
});

describe('isWitnessValid', () => {
  it('retorna true si testigo es diferente al cajero y no vacio', () => {
    expect(isWitnessValid('witness-1', 'cashier-1')).toBe(true);
  });

  it('retorna false si testigo esta vacio', () => {
    expect(isWitnessValid('', 'cashier-1')).toBe(false);
  });

  it('retorna false si testigo es igual al cajero', () => {
    expect(isWitnessValid('same-id', 'same-id')).toBe(false);
  });

  it('retorna false si ambos estan vacios', () => {
    expect(isWitnessValid('', '')).toBe(false);
  });
});

describe('isExpectedSalesValid', () => {
  it('retorna true para numero positivo', () => {
    expect(isExpectedSalesValid('100')).toBe(true);
  });

  it('retorna true para decimal positivo', () => {
    expect(isExpectedSalesValid('653.65')).toBe(true);
  });

  it('retorna false para string vacio', () => {
    expect(isExpectedSalesValid('')).toBe(false);
  });

  it('retorna false para cero', () => {
    expect(isExpectedSalesValid('0')).toBe(false);
  });

  it('retorna false para numero negativo', () => {
    expect(isExpectedSalesValid('-50')).toBe(false);
  });

  it('retorna false para NaN', () => {
    expect(isExpectedSalesValid('abc')).toBe(false);
  });

  it('retorna false para string con solo espacios', () => {
    expect(isExpectedSalesValid('   ')).toBe(false);
  });

  it('retorna true para 0.01 (minimo positivo)', () => {
    expect(isExpectedSalesValid('0.01')).toBe(true);
  });
});

describe('calculateProgress', () => {
  it('retorna 17% cuando solo gastos completados (siempre true)', () => {
    const data = makeWizardData();
    expect(calculateProgress(data, false)).toBe(17);
  });

  it('retorna 33% cuando reglas + gastos completados', () => {
    const data = makeWizardData();
    expect(calculateProgress(data, true)).toBe(33);
  });

  it('retorna 100% cuando todo completado', () => {
    const data = makeWizardData({
      selectedStore: 'los-heroes',
      selectedCashier: 'tito-gomez',
      selectedWitness: 'adonay-torres',
      expectedSales: '500',
    });
    expect(calculateProgress(data, true)).toBe(100);
  });

  it('retorna 50% con 3 de 6 tareas', () => {
    const data = makeWizardData({
      selectedStore: 'los-heroes',
    });
    // reglas=false, store=true, cashier=false, witness=false, sales=false, expenses=true
    expect(calculateProgress(data, false)).toBe(33);
  });

  it('no cuenta venta esperada de 0', () => {
    const data = makeWizardData({
      selectedStore: 'los-heroes',
      selectedCashier: 'tito-gomez',
      selectedWitness: 'adonay-torres',
      expectedSales: '0',
    });
    // rules=true, store=true, cashier=true, witness=true, sales=false(0), expenses=true = 5/6
    expect(calculateProgress(data, true)).toBe(83);
  });

  it('cuenta correctamente con datos parciales', () => {
    const data = makeWizardData({
      selectedStore: 'plaza-merliot',
      selectedCashier: 'irvin-abarca',
    });
    // rules=false, store=true, cashier=true, witness=false, sales=false, expenses=true = 3/6
    expect(calculateProgress(data, false)).toBe(50);
  });
});
