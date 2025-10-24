/**
 * 🤖 [IA] - VERSION 3.0: Configuración del Sistema de Deliveries
 *
 * Módulo de configuración centralizada para el sistema de control de envíos COD.
 * Exporta constantes, reglas de validación, labels de UI y configuraciones del sistema.
 *
 * @module data/deliveryConfig
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Exports:
 * - DELIVERY_CONFIG: Configuración general del sistema
 * - COURIER_DISPLAY_NAMES: Nombres legibles para UI
 * - STATUS_DISPLAY_LABELS: Labels de estado para UI
 * - ALERT_THRESHOLDS: Umbrales de alertas por días
 * - ALERT_DISPLAY_CONFIG: Configuración visual de alertas
 *
 * Compliance:
 * - REGLAS_DE_LA_CASA.md: Configuración en /data, constantes exportables
 * - Doctrina D.5: Separación datos/lógica/presentación
 */

import type { CourierType, DeliveryStatus, AlertLevel } from '../types/deliveries';

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN GENERAL DEL SISTEMA
// ═══════════════════════════════════════════════════════════

/**
 * Configuración principal del sistema de deliveries
 *
 * @remarks
 * Centraliza todos los parámetros configurables del sistema:
 * - Límites de validación (heredados de DELIVERY_VALIDATION)
 * - Tiempos de auto-limpieza
 * - Configuración de persistencia
 * - Parámetros de UI (debouncing, pagination)
 *
 * Justificación técnica:
 * - Single source of truth para configuración
 * - Facilita testing (mock de configuración)
 * - Permite feature flags futuras
 *
 * @constant
 * @readonly
 */
export const DELIVERY_CONFIG = {
  /**
   * Días de retención en history antes de auto-limpieza
   *
   * @remarks
   * - Valor: 90 días (3 meses)
   * - Razón: Balance entre auditoría y performance localStorage
   * - Limpieza: Ejecuta automáticamente en useDeliveries hook
   * - Compliance: NIST SP 800-115 (90 días audit trail mínimo)
   */
  HISTORY_RETENTION_DAYS: 90,

  /**
   * Intervalo de debouncing para guardar en localStorage (ms)
   *
   * @remarks
   * - Valor: 500ms (medio segundo)
   * - Razón: Balance entre UX responsive y performance I/O
   * - Previene: Writes excesivos durante edición rápida
   */
  SAVE_DEBOUNCE_MS: 500,

  /**
   * Intervalo de debouncing para búsqueda/filtrado (ms)
   *
   * @remarks
   * - Valor: 300ms
   * - Razón: UX responsive sin saturar renders
   * - Aplica: Búsqueda por nombre, filtros dashboard
   */
  SEARCH_DEBOUNCE_MS: 300,

  /**
   * Cantidad de deliveries por página en dashboard
   *
   * @remarks
   * - Valor: 20 items
   * - Razón: Balance entre scroll y performance render
   * - Mobile: Ajustable a 10 items en viewports pequeños
   */
  ITEMS_PER_PAGE: 20,
} as const;

// ═══════════════════════════════════════════════════════════
// LABELS DE UI PARA COURIERS
// ═══════════════════════════════════════════════════════════

/**
 * Nombres legibles para mostrar en UI por cada courier
 *
 * @remarks
 * Mapeo CourierType → Nombre completo para UI:
 * - C807: Nombre comercial completo
 * - Melos: Nombre comercial completo
 * - Otro: Label genérico
 *
 * Uso:
 * - Selects/dropdowns
 * - Filtros de dashboard
 * - Reportes WhatsApp
 *
 * @example
 * ```typescript
 * const courierName = COURIER_DISPLAY_NAMES['C807']; // "Courier C807"
 * <option value="C807">{courierName}</option>
 * ```
 *
 * @constant
 * @readonly
 */
export const COURIER_DISPLAY_NAMES: Record<CourierType, string> = {
  C807: 'Courier C807',
  Melos: 'Courier Melos',
  Otro: 'Otro Courier',
} as const;

// ═══════════════════════════════════════════════════════════
// LABELS DE UI PARA ESTADOS
// ═══════════════════════════════════════════════════════════

/**
 * Labels legibles para mostrar en UI por cada estado de delivery
 *
 * @remarks
 * Mapeo DeliveryStatus → Label español para UI:
 * - pending_cod: "Pendiente de Cobro" (estado activo)
 * - paid: "Pagado" (estado terminal exitoso)
 * - cancelled: "Cancelado" (estado terminal por empleado)
 * - rejected: "Rechazado" (estado terminal por cliente)
 *
 * Uso:
 * - Badges de estado
 * - Filtros de dashboard
 * - Detalles de delivery en modal
 *
 * @example
 * ```typescript
 * const statusLabel = STATUS_DISPLAY_LABELS['pending_cod']; // "Pendiente de Cobro"
 * <Badge>{statusLabel}</Badge>
 * ```
 *
 * @constant
 * @readonly
 */
export const STATUS_DISPLAY_LABELS: Record<DeliveryStatus, string> = {
  pending_cod: 'Pendiente de Cobro',
  paid: 'Pagado',
  cancelled: 'Cancelado',
  rejected: 'Rechazado',
} as const;

// ═══════════════════════════════════════════════════════════
// UMBRALES DE ALERTAS
// ═══════════════════════════════════════════════════════════

/**
 * Umbrales de días pendientes para cada nivel de alerta
 *
 * @remarks
 * Sistema de alertas automáticas basado en días transcurridos desde creación:
 * - ok: 0-6 días (rango normal operación Paradise)
 * - warning: 7-14 días (seguimiento preventivo requerido)
 * - urgent: 15-29 días (acción inmediata requerida)
 * - critical: 30+ días (escalamiento gerencial + provisión contable)
 *
 * Justificación histórica:
 * - Basado en análisis datos Paradise 2023-2024
 * - 30 días: Threshold contable (provisión obligatoria)
 * - 14 días: Punto óptimo intervención preventiva
 *
 * Cálculo:
 * - días = (Date.now() - Date.parse(createdAt)) / 86400000
 * - Redondeo: Math.floor() (días completos)
 *
 * @constant
 * @readonly
 *
 * @example
 * ```typescript
 * function getAlertLevel(daysOld: number): AlertLevel {
 *   if (daysOld < ALERT_THRESHOLDS.warning) return 'ok';
 *   if (daysOld < ALERT_THRESHOLDS.urgent) return 'warning';
 *   if (daysOld < ALERT_THRESHOLDS.critical) return 'urgent';
 *   return 'critical';
 * }
 * ```
 */
export const ALERT_THRESHOLDS = {
  /** Umbral para nivel warning (7 días) */
  warning: 7,

  /** Umbral para nivel urgent (15 días) */
  urgent: 15,

  /** Umbral para nivel critical (30 días) */
  critical: 30,
} as const;

// ═══════════════════════════════════════════════════════════
// CONFIGURACIÓN VISUAL DE ALERTAS
// ═══════════════════════════════════════════════════════════

/**
 * Configuración de colores, emojis y acciones para cada nivel de alerta
 *
 * @remarks
 * Define la representación visual de cada AlertLevel:
 * - color: Clase Tailwind CSS para badges/backgrounds
 * - emoji: Emoji Unicode para identificación rápida
 * - label: Texto descriptivo español
 * - action: Texto de acción recomendada
 *
 * Uso:
 * - DeliveryAlertBadge component
 * - Dashboard summary cards
 * - Modales de detalle
 * - Sistema de notificaciones (FASE 6)
 *
 * Design System:
 * - ok: Verde (success) - Sin acción requerida
 * - warning: Amarillo (warning) - Monitoreo activo
 * - urgent: Naranja (destructive-muted) - Acción requerida
 * - critical: Rojo (destructive) - Escalamiento inmediato
 *
 * @constant
 * @readonly
 *
 * @example
 * ```typescript
 * const config = ALERT_DISPLAY_CONFIG['urgent'];
 * <Badge className={config.color}>
 *   {config.emoji} {config.label}
 * </Badge>
 * ```
 */
export const ALERT_DISPLAY_CONFIG: Record<
  AlertLevel,
  {
    color: string;
    emoji: string;
    label: string;
    action: string;
  }
> = {
  ok: {
    color: 'bg-success/10 text-success border-success/20',
    emoji: '✅',
    label: 'Al Día',
    action: 'Sin acción requerida',
  },
  warning: {
    color: 'bg-warning/10 text-warning border-warning/20',
    emoji: '⚠️',
    label: 'Advertencia',
    action: 'Monitorear activamente',
  },
  urgent: {
    color: 'bg-destructive-muted/10 text-destructive-muted border-destructive-muted/20',
    emoji: '🚨',
    label: 'Urgente',
    action: 'Contactar cliente HOY',
  },
  critical: {
    color: 'bg-destructive/10 text-destructive border-destructive/20',
    emoji: '🔴',
    label: 'Crítico',
    action: 'Escalar a gerencia INMEDIATO',
  },
} as const;
