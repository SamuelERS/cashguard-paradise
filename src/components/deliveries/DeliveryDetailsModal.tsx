/**
 * 🤖 [IA] - VERSION 3.0: Modal de Detalles de Delivery Individual
 *
 * Componente React que muestra información completa de un delivery:
 * - Información del cliente
 * - Monto y courier
 * - Número de guía y factura SICAR
 * - Estado actual y timestamps
 * - Notas adicionales
 * - Badge de alerta (si aplica)
 * - Acciones: Marcar pagado, Cancelar, Rechazar
 *
 * @module components/deliveries/DeliveryDetailsModal
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Arquitectura:
 * - Usa Dialog de shadcn/ui para modal
 * - Muestra DeliveryEntry completo
 * - Acciones integradas con useDeliveries hook
 * - Glass morphism + gradientes Paradise
 *
 * Compliance:
 * - REGLAS_DE_LA_CASA.md: shadcn/ui, Framer Motion, Tailwind
 * - Design System: Consistente con app
 */

import { motion } from 'framer-motion';
import { X, User, DollarSign, Package, FileText, Calendar, Check, Ban, AlertTriangle } from 'lucide-react';
import { DeliveryAlertBadge } from './DeliveryAlertBadge';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import type { DeliveryEntry } from '../../types/deliveries';
import { COURIER_DISPLAY_NAMES, STATUS_DISPLAY_LABELS } from '../../data/deliveryConfig';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════

interface DeliveryDetailsModalProps {
  /** Delivery a mostrar (null = modal cerrado) */
  delivery: DeliveryEntry | null;
  /** Callback para cerrar modal */
  onClose: () => void;
  /** Callback para marcar como pagado */
  onMarkPaid?: (id: string) => void;
  /** Callback para cancelar */
  onCancel?: (id: string, reason: string) => void;
  /** Callback para rechazar */
  onReject?: (id: string, reason: string) => void;
  /** Días pendientes (calculado externamente) */
  daysOld?: number;
  /** Nivel de alerta (calculado externamente) */
  alertLevel?: 'ok' | 'warning' | 'urgent' | 'critical';
}

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════

/**
 * Modal de detalles completos de un delivery
 *
 * @remarks
 * Muestra información completa en formato legible:
 * - Header: Cliente + badge de alerta
 * - Body: Todos los campos del delivery
 * - Footer: Acciones según estado
 *
 * Estados:
 * - pending_cod: Muestra botones Pagado, Cancelar, Rechazar
 * - paid/cancelled/rejected: Solo muestra información (read-only)
 *
 * @example
 * ```typescript
 * const [selectedDelivery, setSelectedDelivery] = useState<DeliveryEntry | null>(null);
 *
 * <DeliveryDetailsModal
 *   delivery={selectedDelivery}
 *   onClose={() => setSelectedDelivery(null)}
 *   onMarkPaid={handleMarkPaid}
 *   onCancel={handleCancel}
 *   onReject={handleReject}
 *   daysOld={10}
 *   alertLevel="warning"
 * />
 * ```
 */
export function DeliveryDetailsModal({
  delivery,
  onClose,
  onMarkPaid,
  onCancel,
  onReject,
  daysOld,
  alertLevel,
}: DeliveryDetailsModalProps) {
  // ─────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────

  const handleMarkPaid = () => {
    if (!delivery) return;
    onMarkPaid?.(delivery.id);
    onClose();
  };

  const handleCancel = () => {
    if (!delivery) return;
    const reason = prompt(`Razón de cancelación para ${delivery.customerName}:`);
    if (!reason) return;
    onCancel?.(delivery.id, reason);
    onClose();
  };

  const handleReject = () => {
    if (!delivery) return;
    const reason = prompt(`Razón de rechazo para ${delivery.customerName}:`);
    if (!reason) return;
    onReject?.(delivery.id, reason);
    onClose();
  };

  // ─────────────────────────────────────────
  // FORMATEO DE FECHAS
  // ─────────────────────────────────────────

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString('es-SV', {
        timeZone: 'America/El_Salvador',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  // ─────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────

  return (
    <Dialog open={!!delivery} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] sm:max-w-md bg-[rgba(36,36,36,0.95)] backdrop-blur-xl border-[rgba(255,255,255,0.15)]">
        {delivery && (
          <>
            {/* HEADER */}
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-[clamp(1.125rem,3vw,1.25rem)] text-[#e1e8ed] flex items-center gap-2">
                    <User className="w-[clamp(1.125rem,3vw,1.25rem)] h-[clamp(1.125rem,3vw,1.25rem)]" />
                    {delivery.customerName}
                  </DialogTitle>
                  <DialogDescription className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#8899a6] mt-1">
                    {STATUS_DISPLAY_LABELS[delivery.status]}
                  </DialogDescription>
                </div>
                {alertLevel && daysOld !== undefined && delivery.status === 'pending_cod' && (
                  <DeliveryAlertBadge level={alertLevel} daysOld={daysOld} />
                )}
              </div>
            </DialogHeader>

            {/* BODY */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 py-4"
            >
              {/* MONTO */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                <DollarSign className="w-5 h-5 text-[#0a84ff]" />
                <div className="flex-1">
                  <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">Monto</p>
                  <p className="text-[clamp(1.125rem,3vw,1.25rem)] font-bold text-[#0a84ff]">
                    ${delivery.amount.toFixed(2)} USD
                  </p>
                </div>
              </div>

              {/* COURIER */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                <Package className="w-5 h-5 text-[#5e5ce6]" />
                <div className="flex-1">
                  <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">Courier</p>
                  <p className="text-[clamp(0.875rem,2.5vw,1rem)] font-medium text-[#e1e8ed]">
                    {COURIER_DISPLAY_NAMES[delivery.courier]}
                  </p>
                </div>
              </div>

              {/* NÚMERO DE GUÍA */}
              {delivery.guideNumber && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                  <FileText className="w-5 h-5 text-[#ff9500]" />
                  <div className="flex-1">
                    <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">Número de Guía</p>
                    <p className="text-[clamp(0.875rem,2.5vw,1rem)] font-mono text-[#e1e8ed]">
                      {delivery.guideNumber}
                    </p>
                  </div>
                </div>
              )}

              {/* FACTURA SICAR */}
              {delivery.invoiceNumber && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                  <FileText className="w-5 h-5 text-[#34c759]" />
                  <div className="flex-1">
                    <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">Factura SICAR</p>
                    <p className="text-[clamp(0.875rem,2.5vw,1rem)] font-mono text-[#e1e8ed]">
                      {delivery.invoiceNumber}
                    </p>
                  </div>
                </div>
              )}

              {/* FECHA CREACIÓN */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                <Calendar className="w-5 h-5 text-[#8899a6]" />
                <div className="flex-1">
                  <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6]">Creado</p>
                  <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#e1e8ed]">
                    {formatDate(delivery.createdAt)}
                  </p>
                  {daysOld !== undefined && delivery.status === 'pending_cod' && (
                    <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6] mt-1">
                      Hace {daysOld} {daysOld === 1 ? 'día' : 'días'}
                    </p>
                  )}
                </div>
              </div>

              {/* FECHA PAGADO */}
              {delivery.paidAt && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(52,199,89,0.1)] border border-[rgba(52,199,89,0.2)]">
                  <Check className="w-5 h-5 text-[#34c759]" />
                  <div className="flex-1">
                    <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#34c759]">Pagado</p>
                    <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#e1e8ed]">
                      {formatDate(delivery.paidAt)}
                    </p>
                  </div>
                </div>
              )}

              {/* FECHA CANCELADO/RECHAZADO */}
              {delivery.cancelledAt && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[rgba(255,69,58,0.1)] border border-[rgba(255,69,58,0.2)]">
                  <Ban className="w-5 h-5 text-[#ff453a]" />
                  <div className="flex-1">
                    <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#ff453a]">
                      {delivery.status === 'cancelled' ? 'Cancelado' : 'Rechazado'}
                    </p>
                    <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#e1e8ed]">
                      {formatDate(delivery.cancelledAt)}
                    </p>
                    {delivery.cancelReason && (
                      <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6] mt-2">
                        Razón: {delivery.cancelReason}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* NOTAS */}
              {delivery.notes && (
                <div className="p-3 rounded-lg bg-[rgba(255,255,255,0.05)]">
                  <p className="text-[clamp(0.75rem,2vw,0.875rem)] text-[#8899a6] mb-2">Notas</p>
                  <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[#e1e8ed] whitespace-pre-wrap">
                    {delivery.notes}
                  </p>
                </div>
              )}
            </motion.div>

            {/* FOOTER - ACCIONES */}
            {delivery.status === 'pending_cod' && (
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleMarkPaid}
                  className="flex-1 bg-gradient-to-r from-[#34c759] to-[#30d158] hover:opacity-90"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Marcar Pagado
                </Button>
                <Button
                  onClick={handleCancel}
                  variant="secondary"
                  className="border-[rgba(255,255,255,0.15)] hover:bg-[rgba(255,255,255,0.05)]"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
                <Button
                  onClick={handleReject}
                  variant="destructive"
                  className="hover:opacity-90"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Rechazar
                </Button>
              </DialogFooter>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
