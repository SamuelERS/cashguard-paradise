/**
 * 🤖 [IA] - VERSION 3.0: Tests - useDeliverySummary Hook
 *
 * Suite de tests para hook useDeliverySummary que calcula métricas agregadas.
 * Valida cálculos de totales, agrupaciones y promedios.
 *
 * @module hooks/__tests__/useDeliverySummary.test
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Coverage Target: 100% lines, 100% branches
 * Test Cases: 12 tests
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDeliverySummary } from '../useDeliverySummary';
import type { DeliveryEntry } from '../../types/deliveries';

// ═══════════════════════════════════════════════════════════
// HELPER: CREAR DELIVERY DE PRUEBA
// ═══════════════════════════════════════════════════════════

function createTestDelivery(
  overrides: Partial<DeliveryEntry> = {}
): DeliveryEntry {
  return {
    id: crypto.randomUUID(),
    customerName: 'Test Customer',
    amount: 100.0,
    courier: 'C807',
    status: 'pending_cod',
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

// ═══════════════════════════════════════════════════════════
// SUITE 1: CASOS BÁSICOS
// ═══════════════════════════════════════════════════════════

describe('useDeliverySummary - Casos Básicos', () => {
  it('debe retornar summary vacío si array es vacío', () => {
    const { result } = renderHook(() => useDeliverySummary([]));

    expect(result.current.totalPending).toBe(0);
    expect(result.current.countPending).toBe(0);
    expect(result.current.oldestPendingDays).toBe(0);
    expect(result.current.averagePendingDays).toBe(0);
  });

  it('debe calcular correctamente con 1 delivery pending', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 150.5 }),
    ];

    const { result } = renderHook(() => useDeliverySummary(deliveries));

    expect(result.current.totalPending).toBe(150.5);
    expect(result.current.countPending).toBe(1);
  });

  it('debe calcular correctamente con múltiples deliveries pending', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 100.0 }),
      createTestDelivery({ amount: 200.0 }),
      createTestDelivery({ amount: 150.5 }),
    ];

    const { result } = renderHook(() => useDeliverySummary(deliveries));

    expect(result.current.totalPending).toBe(450.5);
    expect(result.current.countPending).toBe(3);
  });

  it('debe ignorar deliveries con status NO pending', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 100.0, status: 'pending_cod' }),
      createTestDelivery({ amount: 200.0, status: 'paid' }),
      createTestDelivery({ amount: 150.0, status: 'cancelled' }),
      createTestDelivery({ amount: 50.0, status: 'rejected' }),
    ];

    const { result } = renderHook(() => useDeliverySummary(deliveries));

    expect(result.current.totalPending).toBe(100.0);
    expect(result.current.countPending).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════
// SUITE 2: AGRUPACIÓN POR COURIER
// ═══════════════════════════════════════════════════════════

describe('useDeliverySummary - Agrupación por Courier', () => {
  it('debe agrupar correctamente por courier', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 100.0, courier: 'C807' }),
      createTestDelivery({ amount: 200.0, courier: 'C807' }),
      createTestDelivery({ amount: 150.0, courier: 'Melos' }),
      createTestDelivery({ amount: 50.0, courier: 'Otro' }),
    ];

    const { result } = renderHook(() => useDeliverySummary(deliveries));

    expect(result.current.byCourier.C807.count).toBe(2);
    expect(result.current.byCourier.C807.total).toBe(300.0);
    expect(result.current.byCourier.Melos.count).toBe(1);
    expect(result.current.byCourier.Melos.total).toBe(150.0);
    expect(result.current.byCourier.Otro.count).toBe(1);
    expect(result.current.byCourier.Otro.total).toBe(50.0);
  });

  it('debe retornar 0 para couriers sin deliveries', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ amount: 100.0, courier: 'C807' }),
    ];

    const { result } = renderHook(() => useDeliverySummary(deliveries));

    expect(result.current.byCourier.Melos.count).toBe(0);
    expect(result.current.byCourier.Melos.total).toBe(0);
    expect(result.current.byCourier.Otro.count).toBe(0);
    expect(result.current.byCourier.Otro.total).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════
// SUITE 3: AGRUPACIÓN POR ALERTA
// ═══════════════════════════════════════════════════════════

describe('useDeliverySummary - Agrupación por Alerta', () => {
  it('debe clasificar correctamente por nivel de alerta', () => {
    const now = Date.now();
    const deliveries: DeliveryEntry[] = [
      // ok: 0-6 días
      createTestDelivery({
        amount: 100.0,
        createdAt: new Date(now - 3 * 86400000).toISOString(),
      }),
      // warning: 7-14 días
      createTestDelivery({
        amount: 100.0,
        createdAt: new Date(now - 10 * 86400000).toISOString(),
      }),
      // urgent: 15-29 días
      createTestDelivery({
        amount: 100.0,
        createdAt: new Date(now - 20 * 86400000).toISOString(),
      }),
      // critical: 30+ días
      createTestDelivery({
        amount: 100.0,
        createdAt: new Date(now - 35 * 86400000).toISOString(),
      }),
    ];

    const { result } = renderHook(() => useDeliverySummary(deliveries));

    expect(result.current.byAlert.ok).toBe(1);
    expect(result.current.byAlert.warning).toBe(1);
    expect(result.current.byAlert.urgent).toBe(1);
    expect(result.current.byAlert.critical).toBe(1);
  });

  it('debe clasificar delivery en día 0 como ok', () => {
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({ createdAt: new Date().toISOString() }),
    ];

    const { result } = renderHook(() => useDeliverySummary(deliveries));

    expect(result.current.byAlert.ok).toBe(1);
    expect(result.current.byAlert.warning).toBe(0);
    expect(result.current.byAlert.urgent).toBe(0);
    expect(result.current.byAlert.critical).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════
// SUITE 4: CÁLCULO DE DÍAS
// ═══════════════════════════════════════════════════════════

describe('useDeliverySummary - Cálculo de Días', () => {
  it('debe calcular correctamente el delivery más antiguo', () => {
    const now = Date.now();
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({
        createdAt: new Date(now - 5 * 86400000).toISOString(),
      }),
      createTestDelivery({
        createdAt: new Date(now - 35 * 86400000).toISOString(),
      }),
      createTestDelivery({
        createdAt: new Date(now - 10 * 86400000).toISOString(),
      }),
    ];

    const { result } = renderHook(() => useDeliverySummary(deliveries));

    expect(result.current.oldestPendingDays).toBe(35);
  });

  it('debe calcular correctamente el promedio de días', () => {
    const now = Date.now();
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({
        createdAt: new Date(now - 10 * 86400000).toISOString(),
      }),
      createTestDelivery({
        createdAt: new Date(now - 20 * 86400000).toISOString(),
      }),
      createTestDelivery({
        createdAt: new Date(now - 30 * 86400000).toISOString(),
      }),
    ];

    const { result } = renderHook(() => useDeliverySummary(deliveries));

    // Promedio: (10 + 20 + 30) / 3 = 20
    expect(result.current.averagePendingDays).toBe(20.0);
  });

  it('debe redondear promedio a 1 decimal', () => {
    const now = Date.now();
    const deliveries: DeliveryEntry[] = [
      createTestDelivery({
        createdAt: new Date(now - 10 * 86400000).toISOString(),
      }),
      createTestDelivery({
        createdAt: new Date(now - 11 * 86400000).toISOString(),
      }),
      createTestDelivery({
        createdAt: new Date(now - 12 * 86400000).toISOString(),
      }),
    ];

    const { result } = renderHook(() => useDeliverySummary(deliveries));

    // Promedio: (10 + 11 + 12) / 3 = 11.0
    expect(result.current.averagePendingDays).toBe(11.0);
  });
});
