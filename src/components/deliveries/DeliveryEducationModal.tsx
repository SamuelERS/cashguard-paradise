/**
 * 🤖 [IA] - VERSION 3.0: Modal Educativo de Deliveries COD
 *
 * Componente React que explica el flujo de deliveries contra entrega (COD):
 * - Qué son los deliveries COD
 * - Por qué se registran en el sistema
 * - Cómo afectan el cálculo SICAR
 * - Niveles de alerta y acciones requeridas
 * - Auto-open para alertas críticas (>30 días)
 *
 * @module components/deliveries/DeliveryEducationModal
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Arquitectura:
 * - Usa Dialog de shadcn/ui
 * - Diseño educativo con iconos y ejemplos
 * - Auto-open configurable para alertas críticas
 * - Glass morphism + gradientes Paradise
 *
 * Compliance:
 * - REGLAS_DE_LA_CASA.md: shadcn/ui, Framer Motion, Tailwind
 * - UX: Educación clara y concisa
 */

import { motion } from 'framer-motion';
import { X, Package, DollarSign, TrendingDown, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { ALERT_THRESHOLDS, ALERT_DISPLAY_CONFIG } from '../../data/deliveryConfig';

// ═══════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════

interface DeliveryEducationModalProps {
  /** Modal abierto/cerrado */
  open: boolean;
  /** Callback para cerrar modal */
  onClose: () => void;
  /** Mostrar sección de alertas críticas (opcional) */
  showCriticalAlert?: boolean;
  /** Cantidad de deliveries críticos (opcional) */
  criticalCount?: number;
}

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════

/**
 * Modal educativo sobre deliveries COD
 *
 * @remarks
 * Explica en lenguaje claro:
 * - Concepto de delivery contra entrega
 * - Flujo operacional (venta → entrega → cobro)
 * - Impacto en SICAR (ajuste automático)
 * - Sistema de alertas por días pendientes
 * - Acciones requeridas según nivel
 *
 * Auto-open:
 * - Se puede configurar para abrir automáticamente
 * - Útil cuando hay deliveries críticos (>30 días)
 * - Educa al usuario sobre urgencia
 *
 * @example
 * ```typescript
 * const [showEducation, setShowEducation] = useState(false);
 * const summary = useDeliverySummary(deliveries);
 *
 * // Auto-open si hay críticos
 * useEffect(() => {
 *   if (summary.byAlert.critical > 0) {
 *     setShowEducation(true);
 *   }
 * }, [summary.byAlert.critical]);
 *
 * <DeliveryEducationModal
 *   open={showEducation}
 *   onClose={() => setShowEducation(false)}
 *   showCriticalAlert={true}
 *   criticalCount={summary.byAlert.critical}
 * />
 * ```
 */
export function DeliveryEducationModal({
  open,
  onClose,
  showCriticalAlert = false,
  criticalCount = 0,
}: DeliveryEducationModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="glass-morphism-panel modal-size-large overflow-y-auto">
        {/* HEADER */}
        <DialogHeader>
          <DialogTitle className="text-[clamp(1.25rem,3.5vw,1.5rem)] text-[#e1e8ed] flex items-center gap-2">
            <Package className="w-[clamp(1.25rem,3.5vw,1.5rem)] h-[clamp(1.25rem,3.5vw,1.5rem)] text-[#0a84ff]" />
            Deliveries Contra Entrega (COD)
          </DialogTitle>
          <DialogDescription className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#8899a6]">
            Sistema de control de envíos a contra-entrega
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 py-4"
        >
          {/* ALERTA CRÍTICA (CONDICIONAL) */}
          {showCriticalAlert && criticalCount > 0 && (
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-lg bg-gradient-to-r from-[#ff453a]/20 to-[#ff375f]/20 border-2 border-[#ff453a]"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-[#ff453a] flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-[clamp(1rem,3vw,1.125rem)] font-bold text-[#ff453a] mb-2">
                    🔴 Alerta Crítica: {criticalCount} {criticalCount === 1 ? 'Delivery' : 'Deliveries'} &gt;30 Días
                  </h3>
                  <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#e1e8ed]">
                    Hay deliveries pendientes de cobro por más de 30 días. Esto requiere <strong>acción inmediata</strong> de gerencia.
                  </p>
                  <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6] mt-2">
                    💡 Revisa el dashboard de deliveries y contacta a los clientes HOY.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECCIÓN 1: ¿QUÉ SON? */}
          <div className="space-y-3">
            <h3 className="text-[clamp(1rem,3vw,1.125rem)] font-semibold text-[#e1e8ed] flex items-center gap-2">
              <Package className="w-5 h-5 text-[#0a84ff]" />
              ¿Qué son los Deliveries COD?
            </h3>
            <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.05)]">
              <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#e1e8ed] leading-relaxed">
                <strong>COD</strong> significa <em>"Cash On Delivery"</em> (Contra Entrega). Son ventas donde:
              </p>
              <ul className="mt-3 space-y-2 text-[clamp(0.875rem,2.5vw,1rem)] text-[#8899a6]">
                <li className="flex items-start gap-2">
                  <span className="text-[#0a84ff] mt-1">1.</span>
                  <span>Cliente compra pero <strong>NO paga inmediatamente</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0a84ff] mt-1">2.</span>
                  <span>Courier (C807, Melos) entrega el paquete</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0a84ff] mt-1">3.</span>
                  <span>Cliente paga al courier al recibir</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#0a84ff] mt-1">4.</span>
                  <span>Courier deposita a Paradise (2-5 días después)</span>
                </li>
              </ul>
            </div>
          </div>

          {/* SECCIÓN 2: ¿POR QUÉ SE REGISTRAN? */}
          <div className="space-y-3">
            <h3 className="text-[clamp(1rem,3vw,1.125rem)] font-semibold text-[#e1e8ed] flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-[#5e5ce6]" />
              ¿Por qué se registran en el sistema?
            </h3>
            <div className="p-4 rounded-lg bg-[rgba(255,255,255,0.05)]">
              <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#e1e8ed] leading-relaxed mb-3">
                <strong>Problema anterior:</strong> Se registraban como "efectivo" (falso) + "gasto" (ficticio), distorsionando reportes SICAR.
              </p>
              <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#34c759] leading-relaxed">
                <strong>✅ Solución actual:</strong> El sistema resta automáticamente los deliveries pendientes del SICAR esperado, eliminando transacciones ficticias.
              </p>
            </div>
          </div>

          {/* SECCIÓN 3: IMPACTO EN SICAR */}
          <div className="space-y-3">
            <h3 className="text-[clamp(1rem,3vw,1.125rem)] font-semibold text-[#e1e8ed] flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#ff9500]" />
              Impacto en Cálculo SICAR
            </h3>
            <div className="p-4 rounded-lg bg-gradient-to-r from-[#0a84ff]/10 to-[#5e5ce6]/10 border border-[rgba(10,132,255,0.3)]">
              <div className="space-y-2 text-[clamp(0.875rem,2.5vw,1rem)]">
                <div className="flex items-center justify-between">
                  <span className="text-[#8899a6]">SICAR Ventas Totales:</span>
                  <span className="text-[#e1e8ed] font-mono">$2,500.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#ff9500]">- Deliveries Pendientes:</span>
                  <span className="text-[#ff9500] font-mono">-$500.00</span>
                </div>
                <div className="border-t border-[rgba(255,255,255,0.1)] pt-2 flex items-center justify-between">
                  <span className="text-[#0a84ff] font-semibold">= SICAR Ajustado:</span>
                  <span className="text-[#0a84ff] font-bold font-mono">$2,000.00</span>
                </div>
              </div>
              <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6] mt-3">
                💡 El sistema compara el efectivo contado con el SICAR ajustado (no con el original).
              </p>
            </div>
          </div>

          {/* SECCIÓN 4: NIVELES DE ALERTA */}
          <div className="space-y-3">
            <h3 className="text-[clamp(1rem,3vw,1.125rem)] font-semibold text-[#e1e8ed] flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#34c759]" />
              Sistema de Alertas por Días Pendientes
            </h3>
            <div className="space-y-2">
              {/* OK */}
              <div className="p-3 rounded-lg bg-[rgba(52,199,89,0.1)] border border-[rgba(52,199,89,0.2)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{ALERT_DISPLAY_CONFIG.ok.emoji}</span>
                  <span className="text-[clamp(0.875rem,2.5vw,1rem)] font-semibold text-[#34c759]">
                    {ALERT_DISPLAY_CONFIG.ok.label}
                  </span>
                  <span className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">
                    (0-{ALERT_THRESHOLDS.warning - 1} días)
                  </span>
                </div>
                <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">
                  {ALERT_DISPLAY_CONFIG.ok.action}
                </p>
              </div>

              {/* WARNING */}
              <div className="p-3 rounded-lg bg-[rgba(255,149,0,0.1)] border border-[rgba(255,149,0,0.2)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{ALERT_DISPLAY_CONFIG.warning.emoji}</span>
                  <span className="text-[clamp(0.875rem,2.5vw,1rem)] font-semibold text-[#ff9500]">
                    {ALERT_DISPLAY_CONFIG.warning.label}
                  </span>
                  <span className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">
                    ({ALERT_THRESHOLDS.warning}-{ALERT_THRESHOLDS.urgent - 1} días)
                  </span>
                </div>
                <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">
                  {ALERT_DISPLAY_CONFIG.warning.action}
                </p>
              </div>

              {/* URGENT */}
              <div className="p-3 rounded-lg bg-[rgba(255,69,58,0.1)] border border-[rgba(255,69,58,0.2)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{ALERT_DISPLAY_CONFIG.urgent.emoji}</span>
                  <span className="text-[clamp(0.875rem,2.5vw,1rem)] font-semibold text-[#ff453a]">
                    {ALERT_DISPLAY_CONFIG.urgent.label}
                  </span>
                  <span className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">
                    ({ALERT_THRESHOLDS.urgent}-{ALERT_THRESHOLDS.critical - 1} días)
                  </span>
                </div>
                <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">
                  {ALERT_DISPLAY_CONFIG.urgent.action}
                </p>
              </div>

              {/* CRITICAL */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-[#ff453a]/20 to-[#ff375f]/20 border-2 border-[#ff453a]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{ALERT_DISPLAY_CONFIG.critical.emoji}</span>
                  <span className="text-[clamp(0.875rem,2.5vw,1rem)] font-bold text-[#ff453a]">
                    {ALERT_DISPLAY_CONFIG.critical.label}
                  </span>
                  <span className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">
                    ({ALERT_THRESHOLDS.critical}+ días)
                  </span>
                </div>
                <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#e1e8ed] font-medium">
                  {ALERT_DISPLAY_CONFIG.critical.action}
                </p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: ACCIONES DISPONIBLES */}
          <div className="space-y-3">
            <h3 className="text-[clamp(1rem,3vw,1.125rem)] font-semibold text-[#e1e8ed] flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#34c759]" />
              Acciones Disponibles
            </h3>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#34c759] font-semibold mb-1">
                  ✅ Marcar como Pagado
                </p>
                <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">
                  Cuando el courier deposita el dinero a Paradise
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#8899a6] font-semibold mb-1">
                  ❌ Cancelar
                </p>
                <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">
                  Si el envío se cancela antes de entregarse al cliente
                </p>
              </div>
              <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#ff453a] font-semibold mb-1">
                  🚫 Rechazar
                </p>
                <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">
                  Si el cliente rechaza el paquete al recibirlo
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FOOTER */}
        <DialogFooter>
          <ConstructiveActionButton
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Entendido
          </ConstructiveActionButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
