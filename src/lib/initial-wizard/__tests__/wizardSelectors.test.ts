// 🤖 [IA] - ORDEN #075: Tests unitarios para wizardSelectors.ts
import { describe, it, expect } from 'vitest';
import { getAvailableEmployees, getAvailableWitnesses, resolveStepSummary } from '../wizardSelectors';
import type { WizardData } from '@/hooks/useWizardNavigation';
import type { Employee } from '@/types/cash';

const makeWizardData = (overrides: Partial<WizardData> = {}): WizardData => ({
  rulesAccepted: false,
  selectedStore: '',
  selectedCashier: '',
  selectedWitness: '',
  expectedSales: '',
  dailyExpenses: [],
  ...overrides,
});

const STORES = [
  { id: 'los-heroes', name: 'Los Héroes' },
  { id: 'plaza-merliot', name: 'Plaza Merliot' },
];

const EMPLOYEES: Employee[] = [
  { id: 'tito-gomez', name: 'Tito Gomez', role: 'cashier', stores: ['los-heroes'] },
  { id: 'adonay-torres', name: 'Adonay Torres', role: 'cashier', stores: ['los-heroes'] },
  { id: 'irvin-abarca', name: 'Irvin Abarca', role: 'cashier', stores: ['plaza-merliot'] },
];

describe('getAvailableEmployees', () => {
  it('retorna empleados de los-heroes', () => {
    const employees = getAvailableEmployees(EMPLOYEES, 'los-heroes');
    expect(employees.length).toBe(2);
    expect(employees.some(e => e.name === 'Tito Gomez')).toBe(true);
  });

  it('retorna empleados de plaza-merliot', () => {
    const employees = getAvailableEmployees(EMPLOYEES, 'plaza-merliot');
    expect(employees.length).toBe(1);
    expect(employees.some(e => e.name === 'Irvin Abarca')).toBe(true);
  });

  it('retorna array vacio para store invalido', () => {
    expect(getAvailableEmployees(EMPLOYEES, 'inexistente')).toEqual([]);
  });

  it('retorna array vacio para string vacio', () => {
    expect(getAvailableEmployees(EMPLOYEES, '')).toEqual([]);
  });
});

describe('getAvailableWitnesses', () => {
  it('filtra al cajero seleccionado', () => {
    const witnesses = getAvailableWitnesses(EMPLOYEES, 'los-heroes', 'tito-gomez');
    expect(witnesses.every(w => w.id !== 'tito-gomez')).toBe(true);
    expect(witnesses.length).toBe(1);
  });

  it('retorna todos si cajero no esta en la sucursal', () => {
    const all = getAvailableEmployees(EMPLOYEES, 'los-heroes');
    const witnesses = getAvailableWitnesses(EMPLOYEES, 'los-heroes', 'inexistente');
    expect(witnesses.length).toBe(all.length);
  });

  it('retorna array vacio para store invalido', () => {
    expect(getAvailableWitnesses(EMPLOYEES, 'inexistente', 'tito-gomez')).toEqual([]);
  });
});

describe('resolveStepSummary', () => {
  it('resuelve datos completos a nombres', () => {
    const data = makeWizardData({
      selectedStore: 'los-heroes',
      selectedCashier: 'tito-gomez',
      selectedWitness: 'adonay-torres',
    });
    const summary = resolveStepSummary(data, STORES, EMPLOYEES);
    expect(summary.storeName).toBe('Los Héroes');
    expect(summary.cashierName).toBe('Tito Gomez');
    expect(summary.witnessName).toBe('Adonay Torres');
  });

  it('retorna N/A para datos parciales', () => {
    const data = makeWizardData({
      selectedStore: 'los-heroes',
    });
    const summary = resolveStepSummary(data, STORES, EMPLOYEES);
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
    const summary = resolveStepSummary(data, STORES, EMPLOYEES);
    expect(summary.storeName).toBe('N/A');
    expect(summary.cashierName).toBe('N/A');
    expect(summary.witnessName).toBe('N/A');
  });
});
