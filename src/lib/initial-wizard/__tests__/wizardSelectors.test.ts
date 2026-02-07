// 🤖 [IA] - ORDEN #075: Tests unitarios para wizardSelectors.ts
import { describe, it, expect } from 'vitest';
import { getAvailableEmployees, getAvailableWitnesses, resolveStepSummary } from '../wizardSelectors';
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

describe('getAvailableEmployees', () => {
  it('retorna empleados de los-heroes', () => {
    const employees = getAvailableEmployees('los-heroes');
    expect(employees.length).toBeGreaterThanOrEqual(2);
    expect(employees.some(e => e.name === 'Tito Gomez')).toBe(true);
  });

  it('retorna empleados de plaza-merliot', () => {
    const employees = getAvailableEmployees('plaza-merliot');
    expect(employees.length).toBeGreaterThanOrEqual(2);
    expect(employees.some(e => e.name === 'Irvin Abarca')).toBe(true);
  });

  it('retorna array vacio para store invalido', () => {
    expect(getAvailableEmployees('inexistente')).toEqual([]);
  });

  it('retorna array vacio para string vacio', () => {
    expect(getAvailableEmployees('')).toEqual([]);
  });
});

describe('getAvailableWitnesses', () => {
  it('filtra al cajero seleccionado', () => {
    const witnesses = getAvailableWitnesses('los-heroes', 'tito-gomez');
    expect(witnesses.every(w => w.id !== 'tito-gomez')).toBe(true);
    expect(witnesses.length).toBeGreaterThanOrEqual(1);
  });

  it('retorna todos si cajero no esta en la sucursal', () => {
    const all = getAvailableEmployees('los-heroes');
    const witnesses = getAvailableWitnesses('los-heroes', 'inexistente');
    expect(witnesses.length).toBe(all.length);
  });

  it('retorna array vacio para store invalido', () => {
    expect(getAvailableWitnesses('inexistente', 'tito-gomez')).toEqual([]);
  });
});

describe('resolveStepSummary', () => {
  it('resuelve datos completos a nombres', () => {
    const data = makeWizardData({
      selectedStore: 'los-heroes',
      selectedCashier: 'tito-gomez',
      selectedWitness: 'adonay-torres',
    });
    const summary = resolveStepSummary(data);
    expect(summary.storeName).toBe('Los Héroes');
    expect(summary.cashierName).toBe('Tito Gomez');
    expect(summary.witnessName).toBe('Adonay Torres');
  });

  it('retorna N/A para datos parciales', () => {
    const data = makeWizardData({
      selectedStore: 'los-heroes',
    });
    const summary = resolveStepSummary(data);
    expect(summary.storeName).toBe('Los Héroes');
    expect(summary.cashierName).toBe('N/A');
    expect(summary.witnessName).toBe('N/A');
  });

  it('retorna N/A para IDs invalidos', () => {
    const data = makeWizardData({
      selectedStore: 'invalido',
      selectedCashier: 'invalido',
      selectedWitness: 'invalido',
    });
    const summary = resolveStepSummary(data);
    expect(summary.storeName).toBe('N/A');
    expect(summary.cashierName).toBe('N/A');
    expect(summary.witnessName).toBe('N/A');
  });
});
