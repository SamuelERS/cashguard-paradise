/**
 * 🤖 [IA] - VERSION 3.0: Hook de Resumen Agregado de Deliveries
 *
 * Hook React que calcula métricas agregadas de deliveries pendientes para dashboard:
 * - Total USD pendiente
 * - Cantidad de deliveries por estado
 * - Agrupación por courier (C807, Melos, Otro)
 * - Agrupación por nivel de alerta (ok, warning, urgent, critical)
 * - Delivery más antiguo (días pendientes)
 * - Promedio de días pendientes
 *
 * @module hooks/useDeliverySummary
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Arquitectura:
 * - Input: Array de DeliveryEntry (pending + history)
 * - Output: DeliverySummary con métricas calculadas
 * - Performance: Memoizado con useMemo (recalcula solo si deliveries cambian)
 *
 * Compliance:
 * - REGLAS_DE_LA_CASA.md: Hooks custom, zero `any`, memoization
 * - Performance: O(n) donde n = cantidad deliveries (típicamente <100)
 */

import { useMemo } from 'react';
import type { DeliveryEntry, DeliverySummary, CourierType, AlertLevel } from '../types/deliveries';
import { ALERT_THRESHOLDS } from '../data/deliveryConfig';

// ═══════════════════════════════════════════════════════════
// HELPER: CALCULAR NIVEL DE ALERTA POR DÍAS PENDIENTES
// ═══════════════════════════════════════════════════════════

/**
 * Calcula el nivel de alerta basado en días pendientes
 *
 * @param daysOld - Días transcurridos desde creación
 * @returns AlertLevel correspondiente
 *
 * @remarks
 * Umbrales:
 * - ok: 0-6 días
 * - warning: 7-14 días
 * - urgent: 15-29 días
 * - critical: 30+ días
 */
function getAlertLevel(daysOld: number): AlertLevel {
  if (daysOld < ALERT_THRESHOLDS.warning) return 'ok';
  if (daysOld < ALERT_THRESHOLDS.urgent) return 'warning';
  if (daysOld < ALERT_THRESHOLDS.critical) return 'urgent';
  return 'critical';
}

// ═══════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════

/**
 * Hook que calcula resumen agregado de deliveries
 *
 * @param deliveries - Array completo de deliveries (pending + history)
 * @returns DeliverySummary con métricas calculadas
 *
 * @remarks
 * **Métricas Calculadas:**
 * - `totalPending`: Suma USD de deliveries con status='pending_cod'
 * - `countPending`: Cantidad de deliveries pendientes
 * - `byCourier`: Agrupación por courier (C807, Melos, Otro)
 * - `byAlert`: Agrupación por nivel de alerta (ok, warning, urgent, critical)
 * - `oldestPendingDays`: Días del delivery más antiguo
 * - `averagePendingDays`: Promedio de días pendientes
 *
 * **Performance:**
 * - Memoizado con `useMemo` (recalcula solo si `deliveries` cambia)
 * - Complejidad: O(n) donde n = cantidad deliveries
 * - Típicamente n < 100 → negligible (<5ms)
 *
 * **Casos Edge:**
 * - Array vacío: Retorna summary con valores en 0
 * - Solo history (no pending): totalPending=0, countPending=0
 * - Todos pending: Calcula métricas completas
 *
 * @example
 * ```typescript
 * function DeliveryDashboard() {
 *   const { pending, history } = useDeliveries();
 *   const allDeliveries = [...pending, ...history];
 *   const summary = useDeliverySummary(allDeliveries);
 *
 *   return (
 *     <div>
 *       <h2>Total Pendiente: ${summary.totalPending.toFixed(2)}</h2>
 *       <p>Deliveries: {summary.countPending}</p>
 *       <p>Más antiguo: {summary.oldestPendingDays} días</p>
 *       <p>Promedio: {summary.averagePendingDays.toFixed(1)} días</p>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link DeliverySummary} Interface de retorno
 * @see {@link DeliveryEntry} Interface de delivery
 */
export function useDeliverySummary(deliveries: DeliveryEntry[]): DeliverySummary {
  return useMemo(() => {
    // ─────────────────────────────────────────
    // FILTRAR SOLO DELIVERIES PENDIENTES
    // ─────────────────────────────────────────
    const pendingDeliveries = deliveries.filter((d) => d.status === 'pending_cod');

    // ─────────────────────────────────────────
    // CASO EDGE: NO HAY DELIVERIES PENDIENTES
    // ─────────────────────────────────────────
    if (pendingDeliveries.length === 0) {
      return {
        totalPending: 0,
        countPending: 0,
        byCourier: {
          C807: { count: 0, total: 0 },
          Melos: { count: 0, total: 0 },
          Otro: { count: 0, total: 0 },
        },
        byAlert: {
          ok: 0,
          warning: 0,
          urgent: 0,
          critical: 0,
        },
        oldestPendingDays: 0,
        averagePendingDays: 0,
      };
    }

    // ─────────────────────────────────────────
    // INICIALIZAR ACUMULADORES
    // ─────────────────────────────────────────
    let totalPending = 0;
    const byCourier: Record<CourierType, { count: number; total: number }> = {
      C807: { count: 0, total: 0 },
      Melos: { count: 0, total: 0 },
      Otro: { count: 0, total: 0 },
    };
    const byAlert: Record<AlertLevel, number> = {
      ok: 0,
      warning: 0,
      urgent: 0,
      critical: 0,
    };
    let oldestPendingDays = 0;
    let totalDays = 0;

    // ─────────────────────────────────────────
    // ITERAR Y CALCULAR MÉTRICAS
    // ─────────────────────────────────────────
    const now = Date.now();

    pendingDeliveries.forEach((delivery) => {
      // Acumular total USD
      totalPending += delivery.amount;

      // Agrupar por courier
      byCourier[delivery.courier].count += 1;
      byCourier[delivery.courier].total += delivery.amount;

      // Calcular días pendientes
      const createdTimestamp = Date.parse(delivery.createdAt);
      const daysOld = Math.floor((now - createdTimestamp) / 86400000);

      // Actualizar delivery más antiguo
      if (daysOld > oldestPendingDays) {
        oldestPendingDays = daysOld;
      }

      // Acumular días para promedio
      totalDays += daysOld;

      // Agrupar por nivel de alerta
      const alertLevel = getAlertLevel(daysOld);
      byAlert[alertLevel] += 1;
    });

    // ─────────────────────────────────────────
    // CALCULAR PROMEDIO DE DÍAS
    // ─────────────────────────────────────────
    const averagePendingDays =
      pendingDeliveries.length > 0 ? totalDays / pendingDeliveries.length : 0;

    // ─────────────────────────────────────────
    // RETORNAR SUMMARY COMPLETO
    // ─────────────────────────────────────────
    return {
      totalPending: Number(totalPending.toFixed(2)), // Redondear a 2 decimales
      countPending: pendingDeliveries.length,
      byCourier,
      byAlert,
      oldestPendingDays,
      averagePendingDays: Number(averagePendingDays.toFixed(1)), // Redondear a 1 decimal
    };
  }, [deliveries]); // Recalcular solo si deliveries cambia
}
