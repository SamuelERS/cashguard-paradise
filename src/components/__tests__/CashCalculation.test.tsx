// 🤖 [IA] - ORDEN-DACC/FASE-2: Mocks exhaustivos para prevenir heap OOM en Vitest
// Root cause original: CashCalculation.tsx importa ~20 módulos con árbol transitivo >8GB
// Solución: vi.mock exhaustivo bloquea module resolution de dependencias pesadas
// Tests reescritos para comportamiento actual v2.4.1 — versión v1.3.7 (window.open)
// fue reemplazada por window.location.href + WhatsAppInstructionsModal modal
// 🤖 [IA] - ORDEN-DACC/FASE-2 FIX LOOP INFINITO:
// Root cause OOM real: dos fuentes de referencias inestables causaban loop infinito:
// 1. expenses=[] default param en el componente → nueva referencia en cada render
// 2. useDeliveries mock → pending:[] nueva referencia en cada llamada
// Cascada: performCalculation(useCallback) depende de ambos → se recrea cada render
// → useEffect([isCalculated, performCalculation]) se dispara → setCalculationData
// → re-render → nuevas referencias → loop → OOM
// Fix: arrays estables en scope de módulo (expenses en defaultProps) y en factory fn (useDeliveries)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CashCalculation from '../CashCalculation';
import type { CashCount, ElectronicPayments } from '@/types/cash';

// ── Mocks anti-OOM: bloquean module resolution transitivo de dependencias UI pesadas ──
vi.mock('@/data/paradise', () => ({
  getStoreById: vi.fn((id: string) => ({
    id,
    name: 'Test Store',
    address: 'Test Address',
    phone: '1234-5678',
    schedule: '9AM-5PM',
  })),
  getEmployeeById: vi.fn((id: string) => ({
    id,
    name: 'Test Employee',
    role: 'Test Role',
    stores: ['test-store'],
  })),
  STORES: [],
  EMPLOYEES: [],
}));

vi.mock('@/hooks/useDeliveries', () => {
  // 🤖 [IA] - ORDEN-DACC/FASE-2 FIX: Arrays estables fuera del fn interno
  // Si pending/history son [] literales dentro de vi.fn(()=>({...})),
  // se crea una nueva referencia en CADA llamada a useDeliveries().
  // Con referencias estables, performCalculation no se recrea → no hay loop.
  const stablePending: [] = [];
  const stableHistory: [] = [];
  return {
    useDeliveries: vi.fn(() => ({
      pending: stablePending,
      history: stableHistory,
      isLoading: false,
      error: null,
      createDelivery: vi.fn(),
      updateDelivery: vi.fn(),
      markAsPaid: vi.fn(),
      cancelDelivery: vi.fn(),
      rejectDelivery: vi.fn(),
      getDeliveryById: vi.fn(),
      filterPending: vi.fn(),
      filterHistory: vi.fn(),
      cleanupHistory: vi.fn(),
      refresh: vi.fn(),
    })),
  };
});

vi.mock('@/utils/clipboard', () => ({
  copyToClipboard: vi.fn(() => Promise.resolve({ success: true })),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn(), warning: vi.fn() },
}));

vi.mock('@/utils/calculations', () => ({
  calculateCashTotal: vi.fn(() => 100),
  calculateChange50: vi.fn(() => ({
    denominationsToKeep: {},
    amountToKeep: 50,
    denominationsToDeliver: {},
    amountToDeliver: 50,
  })),
  formatCurrency: vi.fn((v: number) => `${v.toFixed(2)}`),
}));

vi.mock('@/utils/sicarAdjustment', () => ({
  calculateSicarAdjusted: vi.fn(() => ({
    totalCash: 100,
    totalElectronic: 0,
    totalGeneral: 100,
    difference: 0,
    differenceLabel: 'NORMAL',
    differenceEmoji: '✅',
    timestamp: new Date().toLocaleString(),
  })),
}));

vi.mock('@/utils/generate-evening-report', () => ({
  generateCompleteReport: vi.fn(() => 'Reporte de prueba'),
  generatePrintableHTML: vi.fn(() => '<html>Mock</html>'),
}));

vi.mock('@/components/cash-calculation/CashResultsDisplay', () => ({
  CashResultsDisplay: () => null,
}));

vi.mock('@/components/ui/confirmation-modal', () => ({
  ConfirmationModal: () => null,
}));

vi.mock('@/components/shared/WhatsAppInstructionsModal', () => ({
  WhatsAppInstructionsModal: () => null,
}));

vi.mock('@/components/ui/badge', () => ({ Badge: () => null }));
vi.mock('@/components/ui/primary-action-button', () => ({
  PrimaryActionButton: () => null,
}));
vi.mock('@/components/shared/ConstructiveActionButton', () => ({
  ConstructiveActionButton: () => null,
}));
vi.mock('@/components/shared/DestructiveActionButton', () => ({
  DestructiveActionButton: () => null,
}));
vi.mock('@/components/shared/NeutralActionButton', () => ({
  NeutralActionButton: () => null,
}));

// ── Fixtures ──

const mockCashCount: CashCount = {
  penny: 43,
  nickel: 20,
  dime: 33,
  quarter: 8,
  dollarCoin: 0,
  bill1: 1,
  bill5: 1,
  bill10: 1,
  bill20: 1,
  bill50: 0,
  bill100: 0,
};

const mockElectronicPayments: ElectronicPayments = {
  credomatic: 0,
  promerica: 0,
  bankTransfer: 0,
  paypal: 0,
};

const defaultProps = {
  storeId: 'store1',
  cashierId: 'cashier1',
  witnessId: 'witness1',
  cashCount: mockCashCount,
  electronicPayments: mockElectronicPayments,
  expectedSales: 100,
  // 🤖 [IA] - ORDEN-DACC/FASE-2 FIX: expenses explícito con referencia estable
  // Sin este prop, el componente usa expenses=[] como default param, lo que
  // crea una nueva referencia en CADA render → loop infinito → OOM
  expenses: [] as import('@/types/expenses').DailyExpense[],
  onBack: vi.fn(),
  onComplete: vi.fn(),
};

// ── Tests para comportamiento actual v2.4.1 ──

describe('CashCalculation — estado inicial bloqueado (v2.4.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1.1 — muestra pantalla bloqueada antes de confirmar envío WhatsApp', () => {
    render(<CashCalculation {...defaultProps} />);
    expect(screen.getByText('🔒 Resultados Bloqueados')).toBeInTheDocument();
  });

  it('1.2 — no muestra resultados financieros hasta confirmar envío WhatsApp', () => {
    render(<CashCalculation {...defaultProps} />);
    expect(screen.queryByText(/Total Día:/i)).not.toBeInTheDocument();
  });
});
