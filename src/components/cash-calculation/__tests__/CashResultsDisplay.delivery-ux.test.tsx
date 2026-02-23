/**
 * 🤖 [IA] - ORDEN D-01: Test UX copy — ajuste SICAR automático por deliveries
 *
 * Valida que CashResultsDisplay (Phase 3) comunica EXPLÍCITAMENTE que
 * los deliveries COD registrados ajustan el SICAR automáticamente.
 *
 * @module cash-calculation/__tests__/CashResultsDisplay.delivery-ux.test
 * @version 1.0.0
 * @created 2026-02-23
 *
 * Metodología: TDD RED→GREEN
 *   RED  — test creado SIN tocar implementación (este commit)
 *   GREEN — implementación mínima en CashResultsDisplay.tsx
 *
 * Suite: ESTÁTICA — solo texto/DOM, sin lógica financiera real.
 * Mocks: DeliveryManager y DenominationsList para prevenir OOM
 *        (mismo patrón de aislamiento que CashCalculation.test.tsx skip note).
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CashResultsDisplay } from '../CashResultsDisplay';
import type { CalculationData } from '@/utils/generate-evening-report';
import type { CashCount, ElectronicPayments } from '@/types/cash';

// ─── Mocks: dependencias pesadas (prevención OOM) ───────────────────────────

vi.mock('@/components/deliveries/DeliveryManager', () => ({
  DeliveryManager: () => null,
}));

vi.mock('@/components/cash-calculation/DenominationsList', () => ({
  DenominationsList: () => null,
}));

vi.mock('@/utils/calculations', () => ({
  formatCurrency: (v: number) => `$${v.toFixed(2)}`,
  calculateChange50: () => ({ possible: false, change: null }),
}));

// ─── Fixtures ────────────────────────────────────────────────────────────────

const MOCK_CALCULATION_DATA: CalculationData = {
  totalCash: 150,
  salesCash: 100,
  totalElectronic: 0,
  totalGeneral: 100,
  totalExpenses: 0,
  totalWithExpenses: 100,
  totalAdjusted: undefined,
  difference: 0,
  changeResult: { change: {}, total: 50, possible: true },
  hasAlert: false,
  timestamp: '2026-02-23',
};

const MOCK_CASH_COUNT: CashCount = {
  penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
  bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0,
};

const MOCK_ELECTRONIC: ElectronicPayments = {
  credomatic: 0, promerica: 0, bankTransfer: 0, paypal: 0,
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CashResultsDisplay — Comunicación UX de ajuste SICAR por deliveries', () => {
  /**
   * D-01.1: Existencia del nodo semántico explícito.
   *
   * Contexto: El cajero ve Phase 3 con la sección "Deliveries Pendientes (COD)".
   * Problema detectado: la descripción actual dice "deben restarse del efectivo esperado"
   * pero NO menciona "SICAR" ni "automáticamente" — genera confusión operativa.
   *
   * Contrato: debe existir un elemento con data-testid="delivery-sicar-note"
   * cuyo texto contenga "SICAR" (mayúsculas o minúsculas) y "automáticamente".
   */
  it('D-01.1: existe nota explícita que menciona SICAR y ajuste automático', () => {
    render(
      <CashResultsDisplay
        calculationData={MOCK_CALCULATION_DATA}
        cashCount={MOCK_CASH_COUNT}
        electronicPayments={MOCK_ELECTRONIC}
        expectedSales={100}
        storeName="Sucursal Test"
        cashierName="Cajero Test"
        witnessName="Testigo Test"
      />
    );

    // Debe existir el nodo semántico (RED si no existe)
    const note = screen.getByTestId('delivery-sicar-note');
    expect(note).toBeInTheDocument();

    // Debe mencionar SICAR explícitamente
    expect(note.textContent).toMatch(/SICAR/i);

    // Debe dejar claro que el ajuste es automático
    expect(note.textContent).toMatch(/automáticamente/i);
  });

  /**
   * D-01.2: El copy no rompe el resto del layout de la sección.
   *
   * Verifica que la sección "Deliveries Pendientes (COD)" sigue renderizando
   * su heading correctamente después de agregar la nota.
   */
  it('D-01.2: la sección de deliveries mantiene su heading existente', () => {
    render(
      <CashResultsDisplay
        calculationData={MOCK_CALCULATION_DATA}
        cashCount={MOCK_CASH_COUNT}
        electronicPayments={MOCK_ELECTRONIC}
        expectedSales={100}
        storeName="Sucursal Test"
        cashierName="Cajero Test"
        witnessName="Testigo Test"
      />
    );

    // El heading de deliveries debe seguir presente
    expect(screen.getByText(/Deliveries Pendientes/i)).toBeInTheDocument();
  });
});
