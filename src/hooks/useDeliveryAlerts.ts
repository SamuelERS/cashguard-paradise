/**
 * 🤖 [IA] - VERSION 3.0: Hook de Sistema de Alertas por Días Pendientes
 *
 * Hook React que calcula niveles de alerta automáticos basados en días transcurridos
 * desde creación del delivery hasta el día actual. Implementa sistema de 4 niveles
 * (ok/warning/urgent/critical) con umbrales configurables.
 *
 * @module hooks/useDeliveryAlerts
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Arquitectura:
 * - Input: Array de DeliveryEntry
 * - Output: Map<id, AlertLevel> + agregados por nivel
 * - Cálculo: Real-time basado en Date.now()
 * - Performance: O(n) donde n = cantidad deliveries
 *
 * Sistema de Alertas:
 * - ok: 0-6 días (rango normal)
 * - warning: 7-14 días (seguimiento preventivo)
 * - urgent: 15-29 días (acción inmediata)
 * - critical: 30+ días (escalamiento gerencial)
 *
 * Compliance:
 * - REGLAS_DE_LA_CASA.md: Hooks custom, useMemo optimization
 * - Basado en análisis histórico Paradise 2023-2024
 */

import { useMemo } from 'react';
import type { DeliveryEntry, AlertLevel } from '../types/deliveries';
import { ALERT_THRESHOLDS } from '../data/deliveryConfig';

// ═══════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════

/**
 * Resultado del cálculo de alertas para un delivery individual
 */
interface DeliveryAlert {
  /** ID del delivery */
  id: string;
  /** Nivel de alerta calculado */
  level: AlertLevel;
  /** Días completos pendiente (floor) */
  daysOld: number;
  /** Entry completo (referencia) */
  delivery: DeliveryEntry;
}

/**
 * Agregados de alertas por nivel
 */
interface AlertSummary {
  /** Conteo por nivel: { ok: 5, warning: 3, urgent: 2, critical: 1 } */
  counts: Record<AlertLevel, number>;
  /** Total de deliveries analizados */
  total: number;
  /** Delivery más antiguo (máximo días) */
  oldest: DeliveryAlert | null;
  /** Promedio de días pendientes */
  averageDays: number;
}

/**
 * Objeto retornado por useDeliveryAlerts
 */
interface UseDeliveryAlertsReturn {
  /** Map de id → DeliveryAlert para lookup O(1) */
  alertsMap: Map<string, DeliveryAlert>;
  /** Array de todas las alertas (ordenado por daysOld desc) */
  alerts: DeliveryAlert[];
  /** Agregados por nivel */
  summary: AlertSummary;
  /** Helper: Obtener alerta por ID */
  getAlert: (id: string) => DeliveryAlert | undefined;
  /** Helper: Filtrar por nivel */
  filterByLevel: (level: AlertLevel) => DeliveryAlert[];
}

// ═══════════════════════════════════════════════════════════
// HELPER: CALCULAR NIVEL DE ALERTA
// ═══════════════════════════════════════════════════════════

/**
 * Calcula el nivel de alerta basado en días pendientes
 *
 * @param daysOld - Cantidad de días desde creación
 * @returns Nivel de alerta según umbrales configurados
 *
 * @remarks
 * Umbrales (ALERT_THRESHOLDS):
 * - [0, 7): ok
 * - [7, 15): warning
 * - [15, 30): urgent
 * - [30, ∞): critical
 *
 * @example
 * ```typescript
 * getAlertLevel(5);  // 'ok'
 * getAlertLevel(10); // 'warning'
 * getAlertLevel(20); // 'urgent'
 * getAlertLevel(35); // 'critical'
 * ```
 */
function getAlertLevel(daysOld: number): AlertLevel {
  if (daysOld < ALERT_THRESHOLDS.warning) return 'ok';
  if (daysOld < ALERT_THRESHOLDS.urgent) return 'warning';
  if (daysOld < ALERT_THRESHOLDS.critical) return 'urgent';
  return 'critical';
}

/**
 * Calcula días completos desde createdAt hasta ahora
 *
 * @param createdAt - Timestamp ISO 8601
 * @returns Días completos (floor) o 0 si timestamp inválido
 *
 * @remarks
 * - Usa Date.now() para timestamp actual (UTC)
 * - Divide por 86400000 (milisegundos en un día)
 * - Math.floor() redondea hacia abajo (días completos)
 * - Maneja timestamps inválidos retornando 0
 *
 * @example
 * ```typescript
 * const createdAt = '2025-01-01T00:00:00.000Z';
 * // Si hoy es 2025-01-11
 * calculateDaysOld(createdAt); // 10 días
 * ```
 */
function calculateDaysOld(createdAt: string): number {
  const timestamp = Date.parse(createdAt);
  if (isNaN(timestamp)) return 0;

  const millisecondsDiff = Date.now() - timestamp;
  const days = millisecondsDiff / 86400000; // ms en un día

  return Math.floor(days);
}

// ═══════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════

/**
 * Hook que calcula alertas automáticas para array de deliveries
 *
 * @param deliveries - Array de DeliveryEntry a analizar
 * @returns Objeto con alertsMap, alerts, summary y helpers
 *
 * @remarks
 * Características:
 * - **Memoization**: useMemo recalcula solo cuando deliveries cambia
 * - **Performance**: O(n) single-pass con agregación simultánea
 * - **Ordenamiento**: Alerts ordenados por daysOld desc (más urgentes primero)
 * - **Type-safe**: Todos los niveles de AlertLevel garantizados en counts
 *
 * Cálculo:
 * 1. Iterar cada delivery en array
 * 2. Calcular daysOld = (now - createdAt) / 86400000
 * 3. Determinar AlertLevel según umbrales
 * 4. Agregar a Map + array + counts
 * 5. Ordenar array por daysOld desc
 * 6. Calcular agregados (oldest, averageDays)
 *
 * Performance:
 * - Time: O(n log n) por ordenamiento (n típicamente <100)
 * - Space: O(n) para Map + array
 * - Memoization evita recálculo en re-renders sin cambios
 *
 * @example
 * ```typescript
 * function DeliveryDashboard() {
 *   const { pending } = useDeliveries();
 *   const { summary, filterByLevel, getAlert } = useDeliveryAlerts(pending);
 *
 *   return (
 *     <div>
 *       <h2>Alertas Pendientes</h2>
 *       <p>OK: {summary.counts.ok}</p>
 *       <p>Advertencias: {summary.counts.warning}</p>
 *       <p>Urgentes: {summary.counts.urgent}</p>
 *       <p>Críticos: {summary.counts.critical}</p>
 *
 *       <h3>Deliveries Críticos</h3>
 *       {filterByLevel('critical').map(alert => (
 *         <div key={alert.id}>
 *           {alert.delivery.customerName}: {alert.daysOld} días
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link DeliveryAlert} Estructura de alerta individual
 * @see {@link AlertSummary} Estructura de agregados
 */
export function useDeliveryAlerts(deliveries: DeliveryEntry[]): UseDeliveryAlertsReturn {
  // ═══════════════════════════════════════════════════════════
  // CÁLCULO MEMOIZED
  // ═══════════════════════════════════════════════════════════

  const { alertsMap, alerts, summary } = useMemo(() => {
    // Inicializar estructuras
    const map = new Map<string, DeliveryAlert>();
    const alertsArray: DeliveryAlert[] = [];
    const counts: Record<AlertLevel, number> = {
      ok: 0,
      warning: 0,
      urgent: 0,
      critical: 0,
    };

    let totalDays = 0;
    let oldestAlert: DeliveryAlert | null = null;

    // Single-pass: calcular alertas + agregados
    for (const delivery of deliveries) {
      const daysOld = calculateDaysOld(delivery.createdAt);
      const level = getAlertLevel(daysOld);

      const alert: DeliveryAlert = {
        id: delivery.id,
        level,
        daysOld,
        delivery,
      };

      // Agregar a Map y array
      map.set(delivery.id, alert);
      alertsArray.push(alert);

      // Agregar a contadores
      counts[level]++;
      totalDays += daysOld;

      // Actualizar oldest
      if (!oldestAlert || daysOld > oldestAlert.daysOld) {
        oldestAlert = alert;
      }
    }

    // Ordenar array por daysOld descendente (más urgentes primero)
    alertsArray.sort((a, b) => b.daysOld - a.daysOld);

    // Calcular promedio
    const averageDays = deliveries.length > 0 ? totalDays / deliveries.length : 0;

    return {
      alertsMap: map,
      alerts: alertsArray,
      summary: {
        counts,
        total: deliveries.length,
        oldest: oldestAlert,
        averageDays: Number(averageDays.toFixed(1)), // 1 decimal
      },
    };
  }, [deliveries]);

  // ═══════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════

  const getAlert = (id: string): DeliveryAlert | undefined => {
    return alertsMap.get(id);
  };

  const filterByLevel = (level: AlertLevel): DeliveryAlert[] => {
    return alerts.filter((alert) => alert.level === level);
  };

  // ═══════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════

  return {
    alertsMap,
    alerts,
    summary,
    getAlert,
    filterByLevel,
  };
}
