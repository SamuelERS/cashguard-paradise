/**
 * 🤖 [IA] - VERSION 3.0: Gestor Completo de Deliveries (Formulario + Lista)
 *
 * Componente React que integra formulario de registro + lista de deliveries pendientes
 * en una interfaz unificada. Maneja creación, visualización y acciones sobre deliveries COD.
 *
 * @module components/deliveries/DeliveryManager
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Arquitectura:
 * - Formulario: Create delivery con validación inline
 * - Lista: Pending deliveries con badges de alerta
 * - Acciones: Marcar pagado, cancelar, rechazar
 * - State: Integrado con useDeliveries hook
 *
 * Compliance:
 * - REGLAS_DE_LA_CASA.md: shadcn/ui, Framer Motion, Tailwind
 * - Design System: Glass morphism + gradientes Paradise
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, DollarSign, Package, User, FileText, X, Check, Ban } from 'lucide-react';
import { useDeliveries } from '../../hooks/useDeliveries';
import { useDeliveryAlerts } from '../../hooks/useDeliveryAlerts';
import { DeliveryAlertBadge } from './DeliveryAlertBadge';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../ui/card';
import type { CourierType } from '../../types/deliveries';
import { COURIER_DISPLAY_NAMES } from '../../data/deliveryConfig';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '../ui/alert-dialog';
import { toast } from 'sonner';

// ═══════════════════════════════════════════════════════════
// FORM STATE INTERFACE
// ═══════════════════════════════════════════════════════════

interface DeliveryFormState {
  customerName: string;
  amount: string; // String para input, se convierte a number
  courier: CourierType;
  guideNumber: string;
  invoiceNumber: string;
  notes: string;
}

// ═══════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════

const INITIAL_FORM_STATE: DeliveryFormState = {
  customerName: '',
  amount: '',
  courier: 'C807',
  guideNumber: '',
  invoiceNumber: '',
  notes: '',
};

// ═══════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════

/**
 * Gestor completo de deliveries con formulario y lista integrados
 *
 * @remarks
 * Componente que integra:
 * - Formulario de creación con validación inline
 * - Lista de deliveries pendientes ordenados por antigüedad
 * - Badges de alerta automáticos (ok/warning/urgent/critical)
 * - Acciones rápidas: Marcar pagado, Cancelar, Rechazar
 * - Animaciones Framer Motion para feedback UX
 *
 * Estado:
 * - Local: Formulario (form state + validación)
 * - Global: Deliveries (via useDeliveries hook + localStorage)
 *
 * Performance:
 * - Lista virtualizada NO necesaria (<100 items típicamente)
 * - Debouncing automático en useDeliveries (500ms)
 * - Memoization en useDeliveryAlerts (recalcula solo cuando cambia pending)
 *
 * @example
 * ```typescript
 * // Uso en Phase3Results
 * <DeliveryManager />
 * // Renderiza formulario + lista completa sin props
 * ```
 */
export function DeliveryManager() {
  // ─────────────────────────────────────────
  // HOOKS
  // ─────────────────────────────────────────
  const {
    pending,
    createDelivery,
    markAsPaid,
    cancelDelivery,
    rejectDelivery,
    isLoading,
  } = useDeliveries();

  const { getAlert } = useDeliveryAlerts(pending);

  // ─────────────────────────────────────────
  // FORM STATE
  // ─────────────────────────────────────────
  const [formData, setFormData] = useState<DeliveryFormState>(INITIAL_FORM_STATE);
  const [showForm, setShowForm] = useState(false);

  // 🤖 [IA] - v3.1.0: Estado modal razón (reemplaza prompt() para PWA compatibility)
  const [reasonModal, setReasonModal] = useState<{
    type: 'cancel' | 'reject';
    deliveryId: string;
    customerName: string;
  } | null>(null);
  const [reasonText, setReasonText] = useState('');

  // ─────────────────────────────────────────
  // HANDLERS - FORMULARIO
  // ─────────────────────────────────────────

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourierChange = (value: string) => {
    setFormData((prev) => ({ ...prev, courier: value as CourierType }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validación básica
      if (!formData.customerName.trim()) {
        toast.error('El nombre del cliente es obligatorio');
        return;
      }

      const amountNum = parseFloat(formData.amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        toast.error('El monto debe ser un número mayor a 0');
        return;
      }

      // Crear delivery
      const newDelivery = createDelivery({
        customerName: formData.customerName.trim(),
        amount: amountNum,
        courier: formData.courier,
        guideNumber: formData.guideNumber.trim() || undefined,
        invoiceNumber: formData.invoiceNumber.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      });

      // Feedback + reset
      toast.success(`Delivery creado: ${newDelivery.customerName}`);
      setFormData(INITIAL_FORM_STATE);
      setShowForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear delivery');
    }
  };

  const handleCancel = () => {
    setFormData(INITIAL_FORM_STATE);
    setShowForm(false);
  };

  // ─────────────────────────────────────────
  // HANDLERS - ACCIONES DELIVERIES
  // ─────────────────────────────────────────

  const handleMarkPaid = (id: string, customerName: string) => {
    try {
      markAsPaid(id);
      toast.success(`${customerName} marcado como pagado ✅`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al marcar como pagado');
    }
  };

  // 🤖 [IA] - v3.1.0: Reemplazado prompt() con modal (Bug #3 - PWA iOS compatibility)
  const handleCancelDelivery = (id: string, customerName: string) => {
    setReasonModal({ type: 'cancel', deliveryId: id, customerName });
    setReasonText('');
  };

  const handleRejectDelivery = (id: string, customerName: string) => {
    setReasonModal({ type: 'reject', deliveryId: id, customerName });
    setReasonText('');
  };

  const handleReasonConfirm = () => {
    if (!reasonModal || !reasonText.trim()) return;
    try {
      if (reasonModal.type === 'cancel') {
        cancelDelivery(reasonModal.deliveryId, reasonText.trim());
        toast.info(`${reasonModal.customerName} cancelado`);
      } else {
        rejectDelivery(reasonModal.deliveryId, reasonText.trim());
        toast.warning(`${reasonModal.customerName} rechazado`);
      }
    } catch (error) {
      const action = reasonModal.type === 'cancel' ? 'cancelar' : 'rechazar';
      toast.error(error instanceof Error ? error.message : `Error al ${action}`);
    }
    setReasonModal(null);
    setReasonText('');
  };

  // ─────────────────────────────────────────
  // RENDER - LOADING STATE
  // ─────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
      </div>
    );
  }

  // ─────────────────────────────────────────
  // RENDER - COMPONENTE PRINCIPAL
  // ─────────────────────────────────────────

  return (
    <div className="space-y-[clamp(1rem,3vw,1.5rem)]">
      {/* ══════════════════════════════════════ */}
      {/* HEADER + BOTÓN AGREGAR */}
      {/* ══════════════════════════════════════ */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[clamp(1.125rem,3vw,1.25rem)] font-semibold text-[#e1e8ed]">
            Deliveries Pendientes
          </h3>
          <p className="text-[clamp(0.875rem,2vw,1rem)] text-[#8899a6]">
            {pending.length} {pending.length === 1 ? 'envío' : 'envíos'} pendiente
            {pending.length !== 1 ? 's' : ''} de cobro
          </p>
        </div>

        {showForm ? (
          <DestructiveActionButton
            onClick={() => setShowForm(false)}
            className="h-auto py-2 px-4"
          >
            <X className="mr-2 h-4 w-4" />
            Cancelar
          </DestructiveActionButton>
        ) : (
          <ConstructiveActionButton
            onClick={() => setShowForm(true)}
            className="h-auto py-2 px-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Delivery
          </ConstructiveActionButton>
        )}
      </div>

      {/* ══════════════════════════════════════ */}
      {/* FORMULARIO (CONDICIONAL) */}
      {/* ══════════════════════════════════════ */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-[rgba(36,36,36,0.4)] backdrop-blur-md border-[rgba(255,255,255,0.15)]">
              <CardHeader>
                <CardTitle className="text-[#e1e8ed]">Nuevo Delivery COD</CardTitle>
                <CardDescription className="text-[#8899a6]">
                  Registra un nuevo envío a contra-entrega
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  {/* Cliente */}
                  <div className="space-y-2">
                    <Label htmlFor="customerName" className="text-[#e1e8ed]">
                      <User className="inline h-4 w-4 mr-1" />
                      Cliente *
                    </Label>
                    <Input
                      id="customerName"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      placeholder="Nombre completo del cliente"
                      required
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#e1e8ed]"
                    />
                  </div>

                  {/* Monto + Courier (Grid 2 columnas) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-[#e1e8ed]">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        Monto *
                      </Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        required
                        className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#e1e8ed]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="courier" className="text-[#e1e8ed]">
                        <Package className="inline h-4 w-4 mr-1" />
                        Courier *
                      </Label>
                      <Select value={formData.courier} onValueChange={handleCourierChange}>
                        <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#e1e8ed]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(COURIER_DISPLAY_NAMES).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Guía + Factura (Grid 2 columnas) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="guideNumber" className="text-[#e1e8ed]">
                        Número de Guía
                      </Label>
                      <Input
                        id="guideNumber"
                        name="guideNumber"
                        value={formData.guideNumber}
                        onChange={handleInputChange}
                        placeholder="Ej: C807-2025-001234"
                        className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#e1e8ed]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber" className="text-[#e1e8ed]">
                        <FileText className="inline h-4 w-4 mr-1" />
                        Factura SICAR
                      </Label>
                      <Input
                        id="invoiceNumber"
                        name="invoiceNumber"
                        value={formData.invoiceNumber}
                        onChange={handleInputChange}
                        placeholder="Ej: FAC-2025-000567"
                        className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#e1e8ed]"
                      />
                    </div>
                  </div>

                  {/* Notas */}
                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-[#e1e8ed]">
                      Notas Adicionales
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Instrucciones especiales, horarios de entrega, etc."
                      rows={3}
                      maxLength={500}
                      className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#e1e8ed] resize-none"
                    />
                    <p className="text-xs text-[#8899a6]">
                      {formData.notes.length}/500 caracteres
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-3">
                  <DestructiveActionButton
                    type="button"
                    onClick={handleCancel}
                    className="h-auto py-2 px-4"
                  >
                    Cancelar
                  </DestructiveActionButton>
                  <ConstructiveActionButton
                    type="submit"
                    className="h-auto py-2 px-4"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Delivery
                  </ConstructiveActionButton>
                </CardFooter>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════ */}
      {/* LISTA DE DELIVERIES PENDIENTES */}
      {/* ══════════════════════════════════════ */}
      {pending.length === 0 ? (
        <Card className="bg-[rgba(36,36,36,0.4)] backdrop-blur-md border-[rgba(255,255,255,0.15)]">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-[#8899a6] mb-4 opacity-50" />
            <p className="text-[#8899a6] text-center">
              No hay deliveries pendientes
              <br />
              <span className="text-sm">
                Haz clic en "Agregar Delivery" para registrar un envío
              </span>
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {pending.map((delivery) => {
              const alert = getAlert(delivery.id);

              return (
                <motion.div
                  key={delivery.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-[rgba(36,36,36,0.4)] backdrop-blur-md border-[rgba(255,255,255,0.15)] hover:border-[rgba(255,255,255,0.25)] transition-all">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-[#e1e8ed] text-[clamp(1rem,2.5vw,1.125rem)]">
                            {delivery.customerName}
                          </CardTitle>
                          <CardDescription className="text-[#8899a6] mt-1">
                            {delivery.courier} • {delivery.guideNumber || 'Sin guía'}
                          </CardDescription>
                        </div>

                        {alert && (
                          <DeliveryAlertBadge
                            level={alert.level}
                            daysOld={alert.daysOld}
                            showTooltip={true}
                          />
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className="pb-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-[#0a84ff]">
                          ${delivery.amount.toFixed(2)}
                        </span>
                        <span className="text-sm text-[#8899a6]">USD</span>
                      </div>

                      {delivery.notes && (
                        <p className="text-sm text-[#8899a6] mt-2 line-clamp-2">
                          {delivery.notes}
                        </p>
                      )}
                    </CardContent>

                    <CardFooter className="flex gap-2 pt-3 border-t border-[rgba(255,255,255,0.1)]">
                      <ConstructiveActionButton
                        onClick={() => handleMarkPaid(delivery.id, delivery.customerName)}
                        className="flex-1 h-auto py-1.5 px-3 text-sm"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Pagado
                      </ConstructiveActionButton>

                      <DestructiveActionButton
                        onClick={() => handleCancelDelivery(delivery.id, delivery.customerName)}
                        className="h-auto py-1.5 px-3 text-sm"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </DestructiveActionButton>

                      <DestructiveActionButton
                        onClick={() => handleRejectDelivery(delivery.id, delivery.customerName)}
                        className="h-auto py-1.5 px-3 text-sm"
                      >
                        <Ban className="mr-2 h-4 w-4" />
                        Rechazar
                      </DestructiveActionButton>
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ══════════════════════════════════════ */}
      {/* MODAL RAZÓN CANCELACIÓN/RECHAZO */}
      {/* 🤖 [IA] - v3.1.0: Reemplaza prompt() para PWA iOS compatibility */}
      {/* ══════════════════════════════════════ */}
      <AlertDialog open={!!reasonModal} onOpenChange={(open) => !open && setReasonModal(null)}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-md bg-[rgba(36,36,36,0.95)] backdrop-blur-xl border-[rgba(255,255,255,0.15)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#e1e8ed]">
              {reasonModal?.type === 'cancel' ? 'Cancelar Delivery' : 'Rechazar Delivery'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#8899a6]">
              Ingresa la razón de {reasonModal?.type === 'cancel' ? 'cancelación' : 'rechazo'} para{' '}
              <span className="font-medium text-[#e1e8ed]">{reasonModal?.customerName}</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <Textarea
            value={reasonText}
            onChange={(e) => setReasonText(e.target.value)}
            placeholder={`Razón de ${reasonModal?.type === 'cancel' ? 'cancelación' : 'rechazo'}...`}
            rows={3}
            maxLength={500}
            className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#e1e8ed] resize-none"
            autoFocus
          />

          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <DestructiveActionButton
              onClick={() => setReasonModal(null)}
              className="h-auto py-2 px-4"
            >
              Volver
            </DestructiveActionButton>
            <ConstructiveActionButton
              onClick={handleReasonConfirm}
              disabled={!reasonText.trim()}
              className="h-auto py-2 px-4"
            >
              Confirmar
            </ConstructiveActionButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
