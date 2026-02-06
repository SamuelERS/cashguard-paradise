/**
 * 🤖 [IA] - VERSION 3.0: Dashboard de Deliveries Acumulados
 *
 * Componente React que muestra métricas agregadas de deliveries pendientes:
 * - Total USD pendiente (card principal)
 * - Cantidad de deliveries por estado
 * - Distribución por courier (C807, Melos, Otro)
 * - Distribución por nivel de alerta (ok, warning, urgent, critical)
 * - Delivery más antiguo (días)
 * - Promedio de días pendientes
 *
 * @module components/deliveries/DeliveryDashboard
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Arquitectura:
 * - Usa useDeliveries hook para obtener pending + history
 * - Usa useDeliverySummary hook para calcular métricas
 * - Diseño: Cards con glass morphism + gradientes Paradise
 * - Responsive: clamp() para escalado proporcional
 *
 * Compliance:
 * - REGLAS_DE_LA_CASA.md: shadcn/ui, Framer Motion, Tailwind
 * - Design System: Glass morphism consistente con app
 */

import { motion } from 'framer-motion';
import { DollarSign, Package, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useDeliveries } from '../../hooks/useDeliveries';
import { useDeliverySummary } from '../../hooks/useDeliverySummary';
import { COURIER_DISPLAY_NAMES, ALERT_DISPLAY_CONFIG } from '../../data/deliveryConfig';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════

/**
 * Dashboard de métricas agregadas de deliveries
 *
 * @remarks
 * Muestra 6 cards principales:
 * 1. Total USD Pendiente (destacado)
 * 2. Cantidad de Deliveries
 * 3. Delivery Más Antiguo
 * 4. Promedio Días Pendientes
 * 5. Distribución por Courier
 * 6. Distribución por Alerta
 *
 * Diseño:
 * - Glass morphism: rgba backgrounds + backdrop-blur
 * - Gradientes: Paradise brand colors
 * - Responsive: clamp() para mobile/desktop
 * - Animaciones: Framer Motion fade-in
 *
 * @example
 * ```typescript
 * // Uso en página de reportes o admin
 * <DeliveryDashboard />
 * ```
 */
export function DeliveryDashboard() {
  // ─────────────────────────────────────────
  // HOOKS
  // ─────────────────────────────────────────
  const { pending, history } = useDeliveries();
  const allDeliveries = [...pending, ...history];
  const summary = useDeliverySummary(allDeliveries);

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────
  return (
    <div className="space-y-[clamp(1rem,3vw,1.5rem)]">
      {/* ══════════════════════════════════════ */}
      {/* HEADER */}
      {/* ══════════════════════════════════════ */}
      <div>
        <h2 className="text-[clamp(1.25rem,4vw,1.5rem)] font-bold text-[#e1e8ed]">
          📊 Dashboard Deliveries
        </h2>
        <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#8899a6] mt-1">
          Métricas acumuladas de envíos contra entrega
        </p>
      </div>

      {/* ══════════════════════════════════════ */}
      {/* GRID DE CARDS PRINCIPALES */}
      {/* ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[clamp(0.75rem,2vw,1rem)]">
        {/* CARD 1: TOTAL USD PENDIENTE (DESTACADO) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0 }}
        >
          <Card className="bg-gradient-to-br from-[#0a84ff]/20 to-[#5e5ce6]/20 backdrop-blur-md border-[rgba(255,255,255,0.15)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-[clamp(0.875rem,2.5vw,1rem)] font-medium text-[#e1e8ed] flex items-center gap-2">
                <DollarSign className="w-[clamp(1rem,3vw,1.25rem)] h-[clamp(1rem,3vw,1.25rem)] text-[#0a84ff]" />
                Total Pendiente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[clamp(1.75rem,5vw,2.5rem)] font-bold text-[#0a84ff]">
                ${summary.totalPending.toFixed(2)}
              </div>
              <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6] mt-1">
                {summary.countPending} {summary.countPending === 1 ? 'envío' : 'envíos'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 2: CANTIDAD DE DELIVERIES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-[rgba(36,36,36,0.4)] backdrop-blur-md border-[rgba(255,255,255,0.15)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-[clamp(0.875rem,2.5vw,1rem)] font-medium text-[#e1e8ed] flex items-center gap-2">
                <Package className="w-[clamp(1rem,3vw,1.25rem)] h-[clamp(1rem,3vw,1.25rem)] text-[#5e5ce6]" />
                Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[clamp(1.75rem,5vw,2.5rem)] font-bold text-[#e1e8ed]">
                {summary.countPending}
              </div>
              <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6] mt-1">
                Pendientes de cobro
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 3: DELIVERY MÁS ANTIGUO */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-[rgba(36,36,36,0.4)] backdrop-blur-md border-[rgba(255,255,255,0.15)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-[clamp(0.875rem,2.5vw,1rem)] font-medium text-[#e1e8ed] flex items-center gap-2">
                <Clock className="w-[clamp(1rem,3vw,1.25rem)] h-[clamp(1rem,3vw,1.25rem)] text-[#ff9500]" />
                Más Antiguo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[clamp(1.75rem,5vw,2.5rem)] font-bold text-[#e1e8ed]">
                {summary.oldestPendingDays}
              </div>
              <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6] mt-1">
                {summary.oldestPendingDays === 1 ? 'día' : 'días'} pendiente
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CARD 4: PROMEDIO DÍAS PENDIENTES */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-[rgba(36,36,36,0.4)] backdrop-blur-md border-[rgba(255,255,255,0.15)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-[clamp(0.875rem,2.5vw,1rem)] font-medium text-[#e1e8ed] flex items-center gap-2">
                <TrendingUp className="w-[clamp(1rem,3vw,1.25rem)] h-[clamp(1rem,3vw,1.25rem)] text-[#34c759]" />
                Promedio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[clamp(1.75rem,5vw,2.5rem)] font-bold text-[#e1e8ed]">
                {summary.averagePendingDays.toFixed(1)}
              </div>
              <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6] mt-1">
                días promedio
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════ */}
      {/* GRID DE DISTRIBUCIONES */}
      {/* ══════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[clamp(0.75rem,2vw,1rem)]">
        {/* DISTRIBUCIÓN POR COURIER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="bg-[rgba(36,36,36,0.4)] backdrop-blur-md border-[rgba(255,255,255,0.15)]">
            <CardHeader>
              <CardTitle className="text-[clamp(1rem,3vw,1.125rem)] font-semibold text-[#e1e8ed]">
                📦 Por Courier
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(summary.byCourier).map(([courier, data]) => (
                <div
                  key={courier}
                  className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.05)]"
                >
                  <div>
                    <p className="text-[clamp(0.875rem,2.5vw,1rem)] font-medium text-[#e1e8ed]">
                      {COURIER_DISPLAY_NAMES[courier as keyof typeof COURIER_DISPLAY_NAMES]}
                    </p>
                    <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">
                      {data.count} {data.count === 1 ? 'envío' : 'envíos'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[clamp(1rem,3vw,1.125rem)] font-bold text-[#0a84ff]">
                      ${data.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* DISTRIBUCIÓN POR ALERTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="bg-[rgba(36,36,36,0.4)] backdrop-blur-md border-[rgba(255,255,255,0.15)]">
            <CardHeader>
              <CardTitle className="text-[clamp(1rem,3vw,1.125rem)] font-semibold text-[#e1e8ed] flex items-center gap-2">
                <AlertTriangle className="w-[clamp(1rem,3vw,1.25rem)] h-[clamp(1rem,3vw,1.25rem)]" />
                Por Nivel de Alerta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(summary.byAlert).map(([level, count]) => {
                const config = ALERT_DISPLAY_CONFIG[level as keyof typeof ALERT_DISPLAY_CONFIG];
                return (
                  <div
                    key={level}
                    className="flex items-center justify-between p-3 rounded-lg bg-[rgba(255,255,255,0.05)]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[clamp(1rem,3vw,1.25rem)]">{config.emoji}</span>
                      <div>
                        <p className="text-[clamp(0.875rem,2.5vw,1rem)] font-medium text-[#e1e8ed]">
                          {config.label}
                        </p>
                        <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">
                          {config.action}
                        </p>
                      </div>
                    </div>
                    <div className="text-[clamp(1.25rem,3.5vw,1.5rem)] font-bold text-[#e1e8ed]">
                      {count}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════ */}
      {/* MENSAJE SI NO HAY DELIVERIES */}
      {/* ══════════════════════════════════════ */}
      {summary.countPending === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="bg-[rgba(36,36,36,0.4)] backdrop-blur-md border-[rgba(255,255,255,0.15)]">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-[#8899a6] mb-4 opacity-50" />
              <p className="text-[#8899a6] text-center text-[clamp(0.875rem,2.5vw,1rem)]">
                No hay deliveries pendientes
                <br />
                <span className="text-[clamp(0.75rem,2vw,0.875rem)]">
                  Todos los envíos han sido cobrados o cancelados
                </span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
