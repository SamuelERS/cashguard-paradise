/**
 * 🤖 [IA] - VERSION 3.0: Badge Visual de Alerta por Días Pendientes
 *
 * Componente React que muestra badge visual indicando nivel de alerta de un delivery
 * basado en días transcurridos. Incluye emoji, label y días pendientes.
 *
 * @module components/deliveries/DeliveryAlertBadge
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Características:
 * - 4 niveles visuales (ok/warning/urgent/critical)
 * - Colores configurables desde deliveryConfig
 * - Responsive con clamp() para mobile
 * - Tooltip opcional con acción recomendada
 *
 * Compliance:
 * - REGLAS_DE_LA_CASA.md: shadcn/ui components, Tailwind classes
 * - Design System: Glass morphism + gradient backgrounds
 */

import type { AlertLevel } from '../../types/deliveries';
import { ALERT_DISPLAY_CONFIG } from '../../data/deliveryConfig';
import { Badge } from '../ui/badge';

// ═══════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════

/**
 * Props del componente DeliveryAlertBadge
 */
interface DeliveryAlertBadgeProps {
  /** Nivel de alerta calculado por useDeliveryAlerts */
  level: AlertLevel;
  /** Cantidad de días pendientes */
  daysOld: number;
  /** Mostrar tooltip con acción recomendada (opcional, default: false) */
  showTooltip?: boolean;
  /** Clase CSS adicional (opcional) */
  className?: string;
}

// ═══════════════════════════════════════════════════════════
// COMPONENTE
// ═══════════════════════════════════════════════════════════

/**
 * Badge visual que muestra nivel de alerta de un delivery
 *
 * @param props - Props del componente
 * @returns JSX badge con emoji, label y días
 *
 * @remarks
 * Características visuales:
 * - **ok**: Verde (✅ Al Día)
 * - **warning**: Amarillo (⚠️ Advertencia)
 * - **urgent**: Naranja (🚨 Urgente)
 * - **critical**: Rojo (🔴 Crítico)
 *
 * Responsive:
 * - Font size: clamp(0.75rem, 2vw, 0.875rem)
 * - Padding: Ajustable según viewport
 * - Mobile-first design
 *
 * Tooltip:
 * - Muestra acción recomendada al hover
 * - Solo si showTooltip=true
 * - Ejemplo: "Contactar cliente HOY"
 *
 * @example
 * ```typescript
 * // Uso básico
 * <DeliveryAlertBadge level="warning" daysOld={10} />
 * // Output: "⚠️ Advertencia (10 días)"
 *
 * // Con tooltip
 * <DeliveryAlertBadge
 *   level="critical"
 *   daysOld={35}
 *   showTooltip={true}
 * />
 * // Output: "🔴 Crítico (35 días)"
 * // Tooltip: "Escalar a gerencia INMEDIATO"
 * ```
 *
 * @see {@link AlertLevel} Tipos de nivel de alerta
 * @see {@link ALERT_DISPLAY_CONFIG} Configuración visual
 */
export function DeliveryAlertBadge({
  level,
  daysOld,
  showTooltip = false,
  className = '',
}: DeliveryAlertBadgeProps) {
  // Obtener configuración visual del nivel
  const config = ALERT_DISPLAY_CONFIG[level];

  // Construir texto del badge
  const badgeText = `${config.emoji} ${config.label} (${daysOld} ${daysOld === 1 ? 'día' : 'días'})`;

  return (
    <div className={`group inline-block relative ${className}`} title={showTooltip ? config.action : undefined}>
      <Badge
        variant="outline"
        className={`
          ${config.color}
          font-medium
          text-[clamp(0.75rem,2vw,0.875rem)]
          px-[clamp(0.5rem,2vw,0.75rem)]
          py-[clamp(0.25rem,1vw,0.375rem)]
          whitespace-nowrap
          transition-all
          duration-200
          hover:scale-105
          cursor-default
        `}
      >
        {badgeText}
      </Badge>

      {/* Tooltip adicional si showTooltip=true */}
      {showTooltip && (
        <div className="hidden group-hover:block absolute z-10 mt-2 p-2 bg-[rgba(36,36,36,0.95)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-md text-xs text-[#e1e8ed] whitespace-nowrap shadow-lg">
          <span className="font-medium">Acción: </span>
          {config.action}
        </div>
      )}
    </div>
  );
}

/**
 * Variante compacta del badge (solo emoji + días)
 *
 * @param props - Props del componente (mismo interface)
 * @returns JSX badge compacto
 *
 * @remarks
 * Versión minimalista para uso en tablas o listas densas:
 * - Solo muestra emoji + días
 * - Sin label de texto
 * - 30% más pequeño que versión completa
 *
 * @example
 * ```typescript
 * <DeliveryAlertBadgeCompact level="urgent" daysOld={20} />
 * // Output: "🚨 20d"
 * ```
 */
export function DeliveryAlertBadgeCompact({
  level,
  daysOld,
  showTooltip = false,
  className = '',
}: DeliveryAlertBadgeProps) {
  const config = ALERT_DISPLAY_CONFIG[level];
  const badgeText = `${config.emoji} ${daysOld}d`;

  return (
    <div className={`inline-block ${className}`} title={showTooltip ? `${config.label}: ${config.action}` : undefined}>
      <Badge
        variant="outline"
        className={`
          ${config.color}
          font-medium
          text-[clamp(0.7rem,1.8vw,0.8rem)]
          px-[clamp(0.4rem,1.5vw,0.6rem)]
          py-[clamp(0.2rem,0.8vw,0.3rem)]
          whitespace-nowrap
          transition-all
          duration-200
          hover:scale-105
          cursor-default
        `}
      >
        {badgeText}
      </Badge>
    </div>
  );
}
