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
// 🤖 [IA] - v3.6.0: TDD RED — Tests para botón Imprimir (impresión térmica 80mm)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';
import CashCalculation from '../CashCalculation';
import type { CashCount, ElectronicPayments } from '@/types/cash';
import { useDeliveries } from '@/hooks/useDeliveries';
import { calculateSicarAdjusted } from '@/utils/sicarAdjustment';

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
      markAsDeducted: vi.fn(),
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

// 🤖 [IA] - v3.6.0: Mock para nueva utilidad de impresión térmica 80mm
vi.mock('@/utils/generate-thermal-print', () => ({
  generateThermalHTML: vi.fn(() => '<html>Thermal Mock</html>'),
  sanitizeForThermal: vi.fn((text: string) => text),
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

// 🤖 [IA] - v3.6.0: Button mocks renderan children + forwarded props (disabled, aria-label)
// Seguro contra OOM: vi.mock intercepta module resolution (previene árbol transitivo),
// renderizar children NO cambia esto — solo permite testear presencia/props de botones.
// Tests 1.1 y 1.2 existentes NO se afectan (buscan h3/text, no botones).
vi.mock('@/components/ui/primary-action-button', () => ({
  PrimaryActionButton: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock('@/components/shared/ConstructiveActionButton', () => ({
  ConstructiveActionButton: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock('@/components/shared/DestructiveActionButton', () => ({
  DestructiveActionButton: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));
// 🤖 [IA] - v3.6.0: Mock NeutralActionButton en path correcto (ui/, no shared/)
vi.mock('@/components/ui/neutral-action-button', () => ({
  NeutralActionButton: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));
// 🤖 [IA] - v3.6.0: Mock legacy path (shared/) para compatibilidad
vi.mock('@/components/shared/NeutralActionButton', () => ({
  NeutralActionButton: ({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { children?: ReactNode }) => (
    <button {...props}>{children}</button>
  ),
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

// ============================================================
// ESCENARIO 2: Botón Imprimir — impresión térmica 80mm (v3.6.0)
// ============================================================
// 🤖 [IA] - v3.6.0: TDD RED — Tests escritos ANTES de implementar botón Imprimir
// Estos tests DEBEN FALLAR hasta que se agregue el botón en CashCalculation.tsx
describe('CashCalculation — botón Imprimir (v3.6.0)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('2.1 — muestra botón Imprimir con aria-label correcto', () => {
    render(<CashCalculation {...defaultProps} />);
    // El botón debe existir en el grid de acciones
    const printButton = screen.getByRole('button', { name: /imprimir reporte/i });
    expect(printButton).toBeInTheDocument();
  });

  it('2.2 — botón Imprimir está deshabilitado cuando reportSent es false', () => {
    render(<CashCalculation {...defaultProps} />);
    // Por defecto reportSent=false → botón debe estar disabled (anti-fraude)
    const printButton = screen.getByRole('button', { name: /imprimir reporte/i });
    expect(printButton).toBeDisabled();
  });

  it('2.3 — botón Imprimir contiene texto visible "Imprimir"', () => {
    render(<CashCalculation {...defaultProps} />);
    const printButton = screen.getByRole('button', { name: /imprimir reporte/i });
    expect(printButton).toHaveTextContent(/imprimir/i);
  });
});

// ============================================================
// ESCENARIO 3: Fix doble ejecución — markAsDeducted separado (v3.5.3)
// ============================================================
// 🤖 [IA] - v3.5.3: Tests para bug crítico de integración reportado por director
// Bug: markAsDeducted dentro de performCalculation causaba loop infinito
// que sobreescribía el resultado correcto con uno sin deducción
describe('CashCalculation — prevención doble ejecución (v3.5.3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('3.1 — markAsDeducted se llama exactamente una vez por delivery sin deductedAt', async () => {
    const mockMarkAsDeducted = vi.fn();
    const stablePendingWithDeliveries = [
      {
        id: 'delivery-1',
        customerName: 'Cliente COD',
        amount: 76.00,
        courier: 'C807' as const,
        status: 'pending_cod' as const,
        createdAt: '2026-02-28T10:00:00.000Z',
      },
    ];

    vi.mocked(useDeliveries).mockReturnValue({
      pending: stablePendingWithDeliveries,
      history: [],
      isLoading: false,
      error: null,
      createDelivery: vi.fn(),
      updateDelivery: vi.fn(),
      markAsPaid: vi.fn(),
      markAsDeducted: mockMarkAsDeducted,
      cancelDelivery: vi.fn(),
      rejectDelivery: vi.fn(),
      getDeliveryById: vi.fn(),
      filterPending: vi.fn(() => []),
      filterHistory: vi.fn(() => []),
      cleanupHistory: vi.fn(),
      refresh: vi.fn(),
    });

    render(<CashCalculation {...defaultProps} />);

    await waitFor(() => {
      expect(mockMarkAsDeducted).toHaveBeenCalledTimes(1);
    });
    expect(mockMarkAsDeducted).toHaveBeenCalledWith('delivery-1');
  });

  it('3.2 — no llama markAsDeducted para deliveries ya deducidos', async () => {
    const mockMarkAsDeducted = vi.fn();
    const stablePendingAlreadyDeducted = [
      {
        id: 'delivery-already',
        customerName: 'Cliente Ayer',
        amount: 76.00,
        courier: 'C807' as const,
        status: 'pending_cod' as const,
        createdAt: '2026-02-27T10:00:00.000Z',
        deductedAt: '2026-02-27T20:00:00.000Z',
      },
    ];

    vi.mocked(useDeliveries).mockReturnValue({
      pending: stablePendingAlreadyDeducted,
      history: [],
      isLoading: false,
      error: null,
      createDelivery: vi.fn(),
      updateDelivery: vi.fn(),
      markAsPaid: vi.fn(),
      markAsDeducted: mockMarkAsDeducted,
      cancelDelivery: vi.fn(),
      rejectDelivery: vi.fn(),
      getDeliveryById: vi.fn(),
      filterPending: vi.fn(() => []),
      filterHistory: vi.fn(() => []),
      cleanupHistory: vi.fn(),
      refresh: vi.fn(),
    });

    render(<CashCalculation {...defaultProps} />);

    // Wait for effects to settle, then verify no calls
    await waitFor(() => {
      expect(screen.getByText('🔒 Resultados Bloqueados')).toBeInTheDocument();
    });
    expect(mockMarkAsDeducted).not.toHaveBeenCalled();
  });

  it('3.3 — calculateSicarAdjusted recibe deliveries originales sin mutación', async () => {
    const stablePending = [
      {
        id: 'delivery-fresh',
        customerName: 'Cliente Hoy',
        amount: 76.00,
        courier: 'C807' as const,
        status: 'pending_cod' as const,
        createdAt: '2026-02-28T10:00:00.000Z',
      },
    ];

    vi.mocked(useDeliveries).mockReturnValue({
      pending: stablePending,
      history: [],
      isLoading: false,
      error: null,
      createDelivery: vi.fn(),
      updateDelivery: vi.fn(),
      markAsPaid: vi.fn(),
      markAsDeducted: vi.fn(),
      cancelDelivery: vi.fn(),
      rejectDelivery: vi.fn(),
      getDeliveryById: vi.fn(),
      filterPending: vi.fn(() => []),
      filterHistory: vi.fn(() => []),
      cleanupHistory: vi.fn(),
      refresh: vi.fn(),
    });

    render(<CashCalculation {...defaultProps} />);

    await waitFor(() => {
      expect(vi.mocked(calculateSicarAdjusted)).toHaveBeenCalled();
    });

    // Verify calculateSicarAdjusted received the original deliveries (without deductedAt)
    const callArgs = vi.mocked(calculateSicarAdjusted).mock.calls[0];
    expect(callArgs[0]).toBe(100); // expectedSales from defaultProps
    expect(callArgs[1]).toBe(stablePending); // exact same reference, not mutated
    expect(callArgs[1][0]).not.toHaveProperty('deductedAt');
  });
});
