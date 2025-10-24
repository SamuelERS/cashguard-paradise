# 6. ARQUITECTURA TÉCNICA - OPCIÓN B DETALLADA

**Caso de Negocio:** Lógica de Envíos/Delivery
**Documento:** 6 de 9 - Arquitectura Técnica
**Fecha:** 23 Octubre 2025
**Autor:** Claude (IA) + Samuel Rodríguez (Paradise System Labs)

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Arquitectónico](#resumen-arquitectónico)
2. [TypeScript Interfaces Completas](#typescript-interfaces-completas)
3. [Componentes React](#componentes-react)
4. [Helpers y Utilidades](#helpers-y-utilidades)
5. [localStorage Strategy](#localstorage-strategy)
6. [Data Flow Completo](#data-flow-completo)
7. [Sistema de Alertas](#sistema-de-alertas)
8. [Reporte WhatsApp](#reporte-whatsapp)
9. [Testing Strategy](#testing-strategy)
10. [Performance Considerations](#performance-considerations)

---

## 📊 RESUMEN ARQUITECTÓNICO

### Stack Tecnológico

**Frontend:**
- ✅ React 18+ (TypeScript strict mode)
- ✅ Vite 5+ (build tooling)
- ✅ shadcn/ui (componentes base)
- ✅ Tailwind CSS (styling)
- ✅ Framer Motion (animaciones)
- ✅ Lucide React (iconos)

**State Management:**
- ✅ localStorage (persistencia local)
- ✅ React hooks (useState, useCallback, useMemo)
- ✅ Custom hooks (useDeliveries, useDeliveryAlerts)

**Testing:**
- ✅ Vitest (unit + integration)
- ✅ Testing Library React (componentes)
- ✅ TIER 0 tests (cross-validation matemática)

### Estructura de Carpetas

```
src/
├── components/
│   └── deliveries/                    // NUEVO - Módulo completo
│       ├── DeliveryManager.tsx        // Formulario + lista día
│       ├── DeliveryDashboard.tsx      // Dashboard acumulado
│       ├── DeliveryDetailsModal.tsx   // Modal detalles envío
│       ├── DeliveryAlertBadge.tsx     // Badge días pendiente
│       └── DeliveryEducationModal.tsx // Modal educativo
│
├── hooks/
│   ├── useDeliveries.ts               // NUEVO - CRUD deliveries
│   ├── useDeliveryAlerts.ts           // NUEVO - Sistema alertas
│   └── useDeliverySummary.ts          // NUEVO - Cálculo resumen
│
├── utils/
│   ├── deliveryCalculation.ts         // NUEVO - Helpers cálculo
│   ├── deliveryValidation.ts          // NUEVO - Type guards
│   └── deliveryFormatters.ts          // NUEVO - Format WhatsApp
│
├── types/
│   └── deliveries.ts                  // NUEVO - Interfaces completas
│
└── data/
    └── deliveryConfig.ts              // NUEVO - Constants + config

tests/
└── deliveries/                        // NUEVO - Suite completa
    ├── DeliveryManager.test.tsx       // 20-25 tests
    ├── DeliveryDashboard.test.tsx     // 25-30 tests
    ├── useDeliveries.test.ts          // 15-20 tests
    ├── deliveryCalculation.test.ts    // TIER 0 obligatorio
    └── deliveryIntegration.test.tsx   // E2E flows
```

---

## 🔧 TYPESCRIPT INTERFACES COMPLETAS

### types/deliveries.ts

```typescript
// ═══════════════════════════════════════════════════════════
// TIPOS BASE
// ═══════════════════════════════════════════════════════════

/**
 * Courier/Encomiendista que maneja el envío
 */
export type CourierType = 'C807' | 'Melos' | 'Otro';

/**
 * Estado del envío en su ciclo de vida
 */
export type DeliveryStatus =
  | 'pending_cod'       // Pendiente cobro cliente (estado inicial)
  | 'paid'              // Cobrado y depositado por courier
  | 'cancelled'         // Cancelado (cliente rechazó)
  | 'rejected';         // Rechazado/perdido (no entregado)

/**
 * Nivel de alerta según días pendiente
 */
export type AlertLevel = 'ok' | 'warning' | 'urgent' | 'critical';

// ═══════════════════════════════════════════════════════════
// INTERFACE PRINCIPAL: DeliveryEntry
// ═══════════════════════════════════════════════════════════

/**
 * Representa un envío individual registrado en CashGuard
 *
 * @remarks
 * - Se crea cuando cajero despacha envío
 * - Persiste en localStorage hasta marcar como cobrado/cancelado
 * - ID único permite trackear a través del tiempo
 * - Timestamps ISO 8601 para correlación temporal precisa
 *
 * @example
 * ```typescript
 * const delivery: DeliveryEntry = {
 *   id: "uuid-1234-5678-9abc-def0",
 *   customerName: "Carlos Gómez",
 *   amount: 113.00,
 *   courier: "C807",
 *   guideNumber: "APA-1832-202510230001",
 *   invoiceNumber: "12347",
 *   status: "pending_cod",
 *   createdAt: "2025-10-23T14:32:18-06:00",
 *   notes: "Acuario 50L Santa Ana"
 * };
 * ```
 */
export interface DeliveryEntry {
  /** UUID v4 único del envío */
  id: string;

  /** Nombre completo cliente destinatario (3-100 caracteres) */
  customerName: string;

  /** Monto total envío USD ($0.01 - $10,000.00) */
  amount: number;

  /** Courier que maneja el envío */
  courier: CourierType;

  /** Número guía courier (formato varía por courier) */
  guideNumber?: string;

  /** Número factura SICAR asociada */
  invoiceNumber?: string;

  /** Estado actual del envío */
  status: DeliveryStatus;

  /** Timestamp ISO 8601 cuando se creó el envío */
  createdAt: string;

  /** Timestamp ISO 8601 cuando se marcó como cobrado */
  paidAt?: string;

  /** Timestamp ISO 8601 cuando se canceló */
  cancelledAt?: string;

  /** Motivo cancelación (requerido si status = cancelled/rejected) */
  cancelReason?: string;

  /** Notas adicionales del cajero (opcional, max 500 chars) */
  notes?: string;
}

// ═══════════════════════════════════════════════════════════
// INTERFACE RESUMEN: DeliverySummary
// ═══════════════════════════════════════════════════════════

/**
 * Resumen agregado de envíos para dashboard
 *
 * @remarks
 * - Calculado en tiempo real desde deliveries_pending
 * - Usado para reporte WhatsApp + dashboard UI
 * - Métricas por courier para análisis performance
 *
 * @example
 * ```typescript
 * const summary: DeliverySummary = {
 *   totalPending: 1245.00,
 *   countPending: 12,
 *   byCourier: {
 *     C807: { total: 800, count: 8 },
 *     Melos: { total: 445, count: 4 },
 *     Otro: { total: 0, count: 0 }
 *   },
 *   alerts: {
 *     warning7Days: 2,
 *     urgent15Days: 1,
 *     critical30Days: 0
 *   }
 * };
 * ```
 */
export interface DeliverySummary {
  /** Suma total USD envíos pendientes */
  totalPending: number;

  /** Cantidad envíos pendientes */
  countPending: number;

  /** Agregación por courier */
  byCourier: {
    C807: { total: number; count: number };
    Melos: { total: number; count: number };
    Otro: { total: number; count: number };
  };

  /** Contadores alertas por nivel */
  alerts: {
    warning7Days: number;    // 7-14 días pendiente
    urgent15Days: number;    // 15-29 días pendiente
    critical30Days: number;  // 30+ días pendiente
  };
}

// ═══════════════════════════════════════════════════════════
// INTERFACE DASHBOARD: DeliveryDashboardData
// ═══════════════════════════════════════════════════════════

/**
 * Datos completos para renderizar dashboard
 *
 * @remarks
 * - Incluye lista completa + resumen agregado
 * - Ordenado por días pendiente (críticos primero)
 * - Usado por DeliveryDashboard.tsx
 */
export interface DeliveryDashboardData {
  /** Lista envíos pendientes (ordenado días desc) */
  pending: DeliveryEntry[];

  /** Resumen agregado métricas */
  summary: DeliverySummary;

  /** Timestamp última actualización */
  lastUpdated: string;
}

// ═══════════════════════════════════════════════════════════
// INTERFACE FILTROS: DeliveryFilters
// ═══════════════════════════════════════════════════════════

/**
 * Filtros disponibles para dashboard
 */
export interface DeliveryFilters {
  /** Filtrar por courier específico */
  courier?: CourierType | 'all';

  /** Filtrar por rango fechas */
  dateRange?: {
    from: string;  // ISO 8601
    to: string;    // ISO 8601
  };

  /** Filtrar por nivel alerta */
  alertLevel?: AlertLevel | 'all';

  /** Búsqueda texto (cliente, guía, factura) */
  searchQuery?: string;
}

// ═══════════════════════════════════════════════════════════
// TYPE GUARDS
// ═══════════════════════════════════════════════════════════

/**
 * Valida si objeto es DeliveryEntry válido
 *
 * @remarks
 * - Usa runtime validation completa
 * - Valida tipos + constraints (amount > 0, etc.)
 * - Safe para deserialización localStorage
 *
 * @example
 * ```typescript
 * const data = JSON.parse(localStorage.getItem('deliveries'));
 * if (Array.isArray(data) && data.every(isDeliveryEntry)) {
 *   // Type-safe: data is DeliveryEntry[]
 * }
 * ```
 */
export function isDeliveryEntry(obj: unknown): obj is DeliveryEntry {
  if (typeof obj !== 'object' || obj === null) return false;

  const entry = obj as Partial<DeliveryEntry>;

  // Validar campos requeridos
  if (typeof entry.id !== 'string' || entry.id.length === 0) return false;
  if (typeof entry.customerName !== 'string' ||
      entry.customerName.length < 3 ||
      entry.customerName.length > 100) return false;
  if (typeof entry.amount !== 'number' ||
      entry.amount <= 0 ||
      entry.amount > 10000) return false;
  if (!['C807', 'Melos', 'Otro'].includes(entry.courier as string)) return false;
  if (!['pending_cod', 'paid', 'cancelled', 'rejected'].includes(entry.status as string)) return false;
  if (typeof entry.createdAt !== 'string') return false;

  // Validar timestamp parseable
  const created = new Date(entry.createdAt);
  if (isNaN(created.getTime())) return false;

  // Validar campos opcionales si existen
  if (entry.guideNumber !== undefined && typeof entry.guideNumber !== 'string') return false;
  if (entry.invoiceNumber !== undefined && typeof entry.invoiceNumber !== 'string') return false;
  if (entry.paidAt !== undefined) {
    if (typeof entry.paidAt !== 'string') return false;
    const paid = new Date(entry.paidAt);
    if (isNaN(paid.getTime())) return false;
  }
  if (entry.cancelledAt !== undefined) {
    if (typeof entry.cancelledAt !== 'string') return false;
    const cancelled = new Date(entry.cancelledAt);
    if (isNaN(cancelled.getTime())) return false;
  }
  if (entry.cancelReason !== undefined && typeof entry.cancelReason !== 'string') return false;
  if (entry.notes !== undefined &&
      (typeof entry.notes !== 'string' || entry.notes.length > 500)) return false;

  return true;
}

/**
 * Valida si courier string es CourierType válido
 */
export function isValidCourier(value: string): value is CourierType {
  return ['C807', 'Melos', 'Otro'].includes(value);
}

/**
 * Valida si status string es DeliveryStatus válido
 */
export function isValidStatus(value: string): value is DeliveryStatus {
  return ['pending_cod', 'paid', 'cancelled', 'rejected'].includes(value);
}
```

---

## ⚛️ COMPONENTES REACT

### 1. DeliveryManager.tsx (Formulario + Lista Día)

```typescript
/**
 * Componente principal para registrar envíos del día
 *
 * Funcionalidad:
 * - Formulario registro nuevo envío
 * - Lista envíos registrados hoy
 * - Editar/eliminar antes de corte nocturno
 * - Validación campos obligatorios
 *
 * Props:
 * - onDeliveriesChange: Callback cuando lista cambia
 * - initialDeliveries: Envíos precargados (opcional)
 */

import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { DeliveryEntry, CourierType } from '@/types/deliveries';
import { DELIVERY_VALIDATION } from '@/data/deliveryConfig';
import { formatCurrency } from '@/utils/formatters';

interface DeliveryManagerProps {
  onDeliveriesChange?: (deliveries: DeliveryEntry[]) => void;
  initialDeliveries?: DeliveryEntry[];
}

export const DeliveryManager: React.FC<DeliveryManagerProps> = ({
  onDeliveriesChange,
  initialDeliveries = []
}) => {
  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════

  const [deliveries, setDeliveries] = useState<DeliveryEntry[]>(initialDeliveries);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [courier, setCourier] = useState<CourierType>('C807');
  const [guideNumber, setGuideNumber] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ═══════════════════════════════════════════════════════════
  // VALIDATION
  // ═══════════════════════════════════════════════════════════

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    // Cliente requerido (3-100 chars)
    if (customerName.trim().length < 3) {
      newErrors.customerName = 'Mínimo 3 caracteres';
    } else if (customerName.trim().length > 100) {
      newErrors.customerName = 'Máximo 100 caracteres';
    }

    // Monto requerido ($0.01 - $10,000)
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Monto debe ser mayor a $0.00';
    } else if (amountNum > DELIVERY_VALIDATION.MAX_AMOUNT) {
      newErrors.amount = `Máximo $${DELIVERY_VALIDATION.MAX_AMOUNT.toFixed(2)}`;
    }

    // Notas opcional (max 500 chars)
    if (notes.length > 500) {
      newErrors.notes = 'Máximo 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [customerName, amount, notes]);

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newDelivery: DeliveryEntry = {
      id: editingId || uuidv4(),
      customerName: customerName.trim(),
      amount: parseFloat(amount),
      courier,
      guideNumber: guideNumber.trim() || undefined,
      invoiceNumber: invoiceNumber.trim() || undefined,
      status: 'pending_cod',
      createdAt: new Date().toISOString(),
      notes: notes.trim() || undefined
    };

    let updatedDeliveries: DeliveryEntry[];
    if (editingId) {
      // Editar existente
      updatedDeliveries = deliveries.map(d =>
        d.id === editingId ? newDelivery : d
      );
    } else {
      // Agregar nuevo
      updatedDeliveries = [...deliveries, newDelivery];
    }

    setDeliveries(updatedDeliveries);
    onDeliveriesChange?.(updatedDeliveries);

    // Reset form
    resetForm();
  }, [
    customerName,
    amount,
    courier,
    guideNumber,
    invoiceNumber,
    notes,
    editingId,
    deliveries,
    onDeliveriesChange,
    validateForm
  ]);

  const handleEdit = useCallback((delivery: DeliveryEntry) => {
    setEditingId(delivery.id);
    setCustomerName(delivery.customerName);
    setAmount(delivery.amount.toString());
    setCourier(delivery.courier);
    setGuideNumber(delivery.guideNumber || '');
    setInvoiceNumber(delivery.invoiceNumber || '');
    setNotes(delivery.notes || '');
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((id: string) => {
    const updatedDeliveries = deliveries.filter(d => d.id !== id);
    setDeliveries(updatedDeliveries);
    onDeliveriesChange?.(updatedDeliveries);
  }, [deliveries, onDeliveriesChange]);

  const resetForm = useCallback(() => {
    setCustomerName('');
    setAmount('');
    setCourier('C807');
    setGuideNumber('');
    setInvoiceNumber('');
    setNotes('');
    setErrors({});
    setEditingId(null);
    setIsFormOpen(false);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Envíos del Día</h3>
        <Button
          onClick={() => setIsFormOpen(true)}
          variant="default"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Envío
        </Button>
      </div>

      {/* Formulario (Collapsible) */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            {/* Cliente */}
            <div className="col-span-2">
              <Label htmlFor="customerName">Cliente *</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Nombre completo destinatario"
                className={errors.customerName ? 'border-red-500' : ''}
              />
              {errors.customerName && (
                <p className="text-sm text-red-500 mt-1">{errors.customerName}</p>
              )}
            </div>

            {/* Monto */}
            <div>
              <Label htmlFor="amount">Monto USD *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-red-500 mt-1">{errors.amount}</p>
              )}
            </div>

            {/* Courier */}
            <div>
              <Label htmlFor="courier">Courier *</Label>
              <Select
                value={courier}
                onValueChange={(value) => setCourier(value as CourierType)}
              >
                <option value="C807">C807 Express</option>
                <option value="Melos">Melos</option>
                <option value="Otro">Otro</option>
              </Select>
            </div>

            {/* Guía */}
            <div>
              <Label htmlFor="guideNumber">Guía # (opcional)</Label>
              <Input
                id="guideNumber"
                value={guideNumber}
                onChange={e => setGuideNumber(e.target.value)}
                placeholder="APA-1832-..."
              />
            </div>

            {/* Factura SICAR */}
            <div>
              <Label htmlFor="invoiceNumber">Factura SICAR (opcional)</Label>
              <Input
                id="invoiceNumber"
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                placeholder="#12347"
              />
            </div>

            {/* Notas */}
            <div className="col-span-2">
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Acuario 50L Santa Ana..."
                className={errors.notes ? 'border-red-500' : ''}
              />
              {errors.notes && (
                <p className="text-sm text-red-500 mt-1">{errors.notes}</p>
              )}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="submit" variant="default">
              {editingId ? 'Actualizar' : 'Registrar'}
            </Button>
          </div>
        </form>
      )}

      {/* Lista Envíos Hoy */}
      {deliveries.length > 0 ? (
        <div className="space-y-2">
          {deliveries.map(delivery => (
            <div
              key={delivery.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
            >
              <div className="flex-1">
                <p className="font-medium">{delivery.customerName}</p>
                <p className="text-sm text-muted-foreground">
                  {delivery.courier}
                  {delivery.guideNumber && ` • ${delivery.guideNumber}`}
                  {delivery.invoiceNumber && ` • Fact ${delivery.invoiceNumber}`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{formatCurrency(delivery.amount)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(delivery)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(delivery.id)}
                  className="text-red-500"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}

          {/* Total */}
          <div className="flex justify-between items-center p-3 bg-accent rounded-lg">
            <span className="font-semibold">Total Envíos Hoy:</span>
            <span className="text-lg font-bold">
              {formatCurrency(deliveries.reduce((sum, d) => sum + d.amount, 0))}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No hay envíos registrados hoy</p>
          <p className="text-sm">Click "Registrar Envío" para agregar uno</p>
        </div>
      )}
    </div>
  );
};
```

### 2. DeliveryDashboard.tsx (Dashboard Acumulado)

```typescript
/**
 * Dashboard envíos pendientes acumulados
 *
 * Funcionalidad:
 * - Vista tabla todos envíos pendientes
 * - Resumen ejecutivo (totales, alertas)
 * - Filtros (courier, fecha, búsqueda)
 * - Ordenamiento (fecha, monto, días)
 * - Modal detalles + acciones (marcar cobrado, cancelar)
 *
 * Props:
 * - requirePin: Si true, solicita PIN supervisor antes mostrar
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeliveryAlertBadge } from './DeliveryAlertBadge';
import { DeliveryDetailsModal } from './DeliveryDetailsModal';
import { useDeliveries } from '@/hooks/useDeliveries';
import { useDeliverySummary } from '@/hooks/useDeliverySummary';
import { getDaysPending } from '@/utils/deliveryCalculation';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type { DeliveryEntry, DeliveryFilters, CourierType } from '@/types/deliveries';

interface DeliveryDashboardProps {
  requirePin?: boolean;
}

export const DeliveryDashboard: React.FC<DeliveryDashboardProps> = ({
  requirePin = true
}) => {
  // ═══════════════════════════════════════════════════════════
  // HOOKS
  // ═══════════════════════════════════════════════════════════

  const { pending, markAsPaid, cancelDelivery } = useDeliveries();
  const summary = useDeliverySummary(pending);

  // ═══════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════

  const [filters, setFilters] = useState<DeliveryFilters>({
    courier: 'all',
    searchQuery: ''
  });

  const [sortBy, setSortBy] = useState<'days' | 'amount' | 'date'>('days');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryEntry | null>(null);

  // ═══════════════════════════════════════════════════════════
  // COMPUTED
  // ═══════════════════════════════════════════════════════════

  const filteredDeliveries = useMemo(() => {
    let filtered = [...pending];

    // Filtro courier
    if (filters.courier && filters.courier !== 'all') {
      filtered = filtered.filter(d => d.courier === filters.courier);
    }

    // Filtro búsqueda
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(d =>
        d.customerName.toLowerCase().includes(query) ||
        d.guideNumber?.toLowerCase().includes(query) ||
        d.invoiceNumber?.toLowerCase().includes(query)
      );
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'days':
          comparison = getDaysPending(a.createdAt) - getDaysPending(b.createdAt);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return filtered;
  }, [pending, filters, sortBy, sortOrder]);

  // ═══════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════

  const handleExportCSV = useCallback(() => {
    const csv = [
      ['Fecha', 'Cliente', 'Courier', 'Guía', 'Monto', 'Días', 'Factura'].join(','),
      ...filteredDeliveries.map(d =>
        [
          formatDate(d.createdAt),
          `"${d.customerName}"`,
          d.courier,
          d.guideNumber || '',
          d.amount.toFixed(2),
          getDaysPending(d.createdAt),
          d.invoiceNumber || ''
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `envios-pendientes-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  }, [filteredDeliveries]);

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* Resumen Ejecutivo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Total Pendiente</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.totalPending)}</p>
          <p className="text-sm text-muted-foreground">{summary.countPending} envíos</p>
        </div>

        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">C807 Express</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.byCourier.C807.total)}</p>
          <p className="text-sm text-muted-foreground">{summary.byCourier.C807.count} envíos</p>
        </div>

        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Melos</p>
          <p className="text-2xl font-bold">{formatCurrency(summary.byCourier.Melos.total)}</p>
          <p className="text-sm text-muted-foreground">{summary.byCourier.Melos.count} envíos</p>
        </div>
      </div>

      {/* Alertas */}
      {(summary.alerts.warning7Days > 0 ||
        summary.alerts.urgent15Days > 0 ||
        summary.alerts.critical30Days > 0) && (
        <div className="p-4 border border-yellow-500 rounded-lg bg-yellow-50">
          <p className="font-semibold mb-2">⚠️ Alertas Pendientes:</p>
          <div className="grid grid-cols-3 gap-2 text-sm">
            {summary.alerts.warning7Days > 0 && (
              <p>🟡 7+ días: {summary.alerts.warning7Days} envíos</p>
            )}
            {summary.alerts.urgent15Days > 0 && (
              <p>🔴 15+ días: {summary.alerts.urgent15Days} envíos</p>
            )}
            {summary.alerts.critical30Days > 0 && (
              <p>🚨 30+ días: {summary.alerts.critical30Days} envíos</p>
            )}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar cliente, guía, factura..."
            value={filters.searchQuery || ''}
            onChange={e => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <select
          className="px-3 py-2 border rounded-md"
          value={filters.courier || 'all'}
          onChange={e => setFilters(f => ({ ...f, courier: e.target.value as CourierType | 'all' }))}
        >
          <option value="all">Todos los couriers</option>
          <option value="C807">C807 Express</option>
          <option value="Melos">Melos</option>
          <option value="Otro">Otro</option>
        </select>

        <Button variant="outline" onClick={handleExportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-accent">
            <tr>
              <th className="p-3 text-left">Fecha</th>
              <th className="p-3 text-left">Cliente</th>
              <th className="p-3 text-left">Courier</th>
              <th className="p-3 text-left">Guía</th>
              <th className="p-3 text-right">Monto</th>
              <th className="p-3 text-center">Días</th>
              <th className="p-3 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDeliveries.map(delivery => (
              <tr
                key={delivery.id}
                className="border-t hover:bg-accent cursor-pointer"
                onClick={() => setSelectedDelivery(delivery)}
              >
                <td className="p-3">{formatDate(delivery.createdAt)}</td>
                <td className="p-3">{delivery.customerName}</td>
                <td className="p-3">{delivery.courier}</td>
                <td className="p-3 text-sm text-muted-foreground">
                  {delivery.guideNumber || '-'}
                </td>
                <td className="p-3 text-right font-semibold">
                  {formatCurrency(delivery.amount)}
                </td>
                <td className="p-3 text-center">
                  <DeliveryAlertBadge delivery={delivery} />
                </td>
                <td className="p-3 text-center">
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredDeliveries.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay envíos pendientes</p>
          </div>
        )}
      </div>

      {/* Modal Detalles */}
      {selectedDelivery && (
        <DeliveryDetailsModal
          delivery={selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          onMarkPaid={markAsPaid}
          onCancel={cancelDelivery}
        />
      )}
    </div>
  );
};
```

**Continuaré con los helpers, hooks y el resto de la arquitectura...**

---

## 🔧 HELPERS Y UTILIDADES

### utils/deliveryCalculation.ts

```typescript
/**
 * Helpers cálculo envíos
 */

import type { DeliveryEntry, DeliverySummary } from '@/types/deliveries';

/**
 * Calcula días transcurridos desde envío
 *
 * @param createdAt - Timestamp ISO 8601 cuando se creó
 * @returns Número entero días pendiente
 *
 * @example
 * ```typescript
 * getDaysPending("2025-10-15T14:32:18Z") // Hoy 23 Oct → 8 días
 * ```
 */
export function getDaysPending(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays); // Nunca negativo
}

/**
 * Determina nivel alerta según días pendiente
 */
export function getAlertLevel(days: number): AlertLevel {
  if (days >= 30) return 'critical';
  if (days >= 15) return 'urgent';
  if (days >= 7) return 'warning';
  return 'ok';
}

/**
 * Construye resumen agregado desde lista envíos
 */
export function buildDeliverySummary(
  pending: DeliveryEntry[]
): DeliverySummary {
  const summary: DeliverySummary = {
    totalPending: 0,
    countPending: pending.length,
    byCourier: {
      C807: { total: 0, count: 0 },
      Melos: { total: 0, count: 0 },
      Otro: { total: 0, count: 0 }
    },
    alerts: {
      warning7Days: 0,
      urgent15Days: 0,
      critical30Days: 0
    }
  };

  pending.forEach(delivery => {
    // Total general
    summary.totalPending += delivery.amount;

    // Por courier
    summary.byCourier[delivery.courier].total += delivery.amount;
    summary.byCourier[delivery.courier].count += 1;

    // Alertas
    const days = getDaysPending(delivery.createdAt);
    if (days >= 30) {
      summary.alerts.critical30Days += 1;
    } else if (days >= 15) {
      summary.alerts.urgent15Days += 1;
    } else if (days >= 7) {
      summary.alerts.warning7Days += 1;
    }
  });

  return summary;
}

/**
 * Ajusta SICAR esperado restando envíos pendientes
 */
export function adjustSICAR(
  sicarTotal: number,
  electronicPayments: number,
  deliveries: DeliveryEntry[]
): number {
  const deliveryTotal = deliveries.reduce(
    (sum, d) => sum + d.amount,
    0
  );

  return sicarTotal - electronicPayments - deliveryTotal;
}
```

---

---

## 💾 LOCALSTORAGE STRATEGY

### Claves y Estructura

**Naming Convention:**
```typescript
// data/deliveryConfig.ts

export const STORAGE_KEYS = {
  PENDING: 'cashguard_deliveries_pending',     // Envíos pendientes cobro
  HISTORY: 'cashguard_deliveries_history',     // Histórico (cobrados + cancelados)
  LAST_CLEANUP: 'cashguard_deliveries_cleanup' // Timestamp última limpieza
} as const;

export const DELIVERY_VALIDATION = {
  MIN_CUSTOMER_NAME: 3,
  MAX_CUSTOMER_NAME: 100,
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 10000,
  MAX_NOTES: 500,
  HISTORY_RETENTION_DAYS: 90  // Retener histórico 3 meses
} as const;
```

### Data Structure en localStorage

**Estructura JSON:**
```typescript
// cashguard_deliveries_pending
{
  "version": "1.0",
  "lastUpdated": "2025-10-23T14:32:18-06:00",
  "deliveries": [
    {
      "id": "uuid-1234-5678",
      "customerName": "Carlos Gómez",
      "amount": 113.00,
      "courier": "C807",
      "guideNumber": "APA-1832-202510230001",
      "invoiceNumber": "12347",
      "status": "pending_cod",
      "createdAt": "2025-10-23T14:32:18-06:00",
      "notes": "Acuario 50L Santa Ana"
    }
    // ... más deliveries
  ]
}

// cashguard_deliveries_history
{
  "version": "1.0",
  "entries": [
    {
      "id": "uuid-9999-8888",
      "customerName": "María López",
      "amount": 84.75,
      "courier": "Melos",
      "status": "paid",
      "createdAt": "2025-10-15T09:15:00-06:00",
      "paidAt": "2025-10-20T14:00:00-06:00"
      // ... resto de campos
    }
  ]
}

// cashguard_deliveries_cleanup
{
  "lastCleanupDate": "2025-10-23T00:00:00-06:00"
}
```

### Persistence Patterns

**1. Save on Change (Debounced)**
```typescript
// hooks/useDeliveries.ts (fragmento)

import { debounce } from 'lodash-es';

const saveToStorage = useCallback(
  debounce((deliveries: DeliveryEntry[]) => {
    try {
      const data = {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        deliveries
      };
      localStorage.setItem(
        STORAGE_KEYS.PENDING,
        JSON.stringify(data)
      );
    } catch (error) {
      console.error('[useDeliveries] Error saving to localStorage:', error);
      // Mostrar toast error al usuario
    }
  }, 500), // Debounce 500ms
  []
);

const addDelivery = useCallback((delivery: DeliveryEntry) => {
  const updated = [...pending, delivery];
  setPending(updated);
  saveToStorage(updated); // Guarda después de 500ms sin cambios
}, [pending, saveToStorage]);
```

**2. Load on Mount (with Validation)**
```typescript
const loadFromStorage = useCallback((): DeliveryEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDING);
    if (!raw) return [];

    const data = JSON.parse(raw);

    // Validar version
    if (data.version !== '1.0') {
      console.warn('[useDeliveries] Unsupported version:', data.version);
      return [];
    }

    // Validar cada delivery con type guard
    if (!Array.isArray(data.deliveries)) return [];
    const validated = data.deliveries.filter(isDeliveryEntry);

    // Log si hubo deliveries inválidas filtradas
    if (validated.length !== data.deliveries.length) {
      console.warn(
        `[useDeliveries] Filtered ${data.deliveries.length - validated.length} invalid deliveries`
      );
    }

    return validated;
  } catch (error) {
    console.error('[useDeliveries] Error loading from localStorage:', error);
    return [];
  }
}, []);

useEffect(() => {
  const loaded = loadFromStorage();
  setPending(loaded);
}, []); // Solo al montar
```

### Data Migration Strategy

**Versionado y Migraciones:**
```typescript
// utils/deliveryMigrations.ts

type StorageVersion = '1.0' | '1.1' | '2.0';

interface MigrationFn {
  from: StorageVersion;
  to: StorageVersion;
  migrate: (data: any) => any;
}

const MIGRATIONS: MigrationFn[] = [
  // Ejemplo: Migración hipotética 1.0 → 1.1
  {
    from: '1.0',
    to: '1.1',
    migrate: (data) => {
      // Agregar campo nuevo 'priority' a cada delivery
      return {
        ...data,
        version: '1.1',
        deliveries: data.deliveries.map((d: any) => ({
          ...d,
          priority: 'normal' // Default para datos antiguos
        }))
      };
    }
  }
];

export function migrateStorageData(
  raw: string,
  currentVersion: StorageVersion
): any {
  let data = JSON.parse(raw);
  let version = data.version as StorageVersion;

  // Aplicar migraciones secuencialmente
  while (version !== currentVersion) {
    const migration = MIGRATIONS.find(m => m.from === version);
    if (!migration) {
      throw new Error(`No migration path from ${version} to ${currentVersion}`);
    }
    data = migration.migrate(data);
    version = migration.to;
  }

  return data;
}
```

### Cleanup Old Data Logic

**Limpieza Automática Histórico:**
```typescript
// hooks/useDeliveries.ts (fragmento)

const cleanupHistory = useCallback(async () => {
  try {
    const lastCleanup = localStorage.getItem(STORAGE_KEYS.LAST_CLEANUP);
    const now = new Date();

    // Solo limpiar una vez al día
    if (lastCleanup) {
      const lastCleanupDate = new Date(JSON.parse(lastCleanup).lastCleanupDate);
      const hoursSinceCleanup = (now.getTime() - lastCleanupDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceCleanup < 24) {
        return; // Ya se limpió hoy
      }
    }

    // Cargar histórico
    const historyRaw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!historyRaw) return;

    const history = JSON.parse(historyRaw);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - DELIVERY_VALIDATION.HISTORY_RETENTION_DAYS);

    // Filtrar entries más antiguos que retention period
    const filtered = history.entries.filter((entry: DeliveryEntry) => {
      const entryDate = new Date(entry.paidAt || entry.cancelledAt || entry.createdAt);
      return entryDate > cutoffDate;
    });

    // Guardar histórico limpio
    localStorage.setItem(
      STORAGE_KEYS.HISTORY,
      JSON.stringify({
        version: '1.0',
        entries: filtered
      })
    );

    // Registrar última limpieza
    localStorage.setItem(
      STORAGE_KEYS.LAST_CLEANUP,
      JSON.stringify({ lastCleanupDate: now.toISOString() })
    );

    console.log(`[useDeliveries] Cleanup: Removed ${history.entries.length - filtered.length} old entries`);
  } catch (error) {
    console.error('[useDeliveries] Error during cleanup:', error);
  }
}, []);

// Ejecutar cleanup al montar hook
useEffect(() => {
  cleanupHistory();
}, [cleanupHistory]);
```

---

## 🔗 DATA FLOW COMPLETO

### Diagrama End-to-End

```
┌───────────────────────────────────────────────────────────────┐
│ FASE 1: Registro Envío (Evening Cut - Wizard Paso N)         │
└───────────────────────────────────────────────────────────────┘
         ↓
  Usuario completa formulario:
  - Cliente: Carlos Gómez
  - Monto: $113.00
  - Courier: C807
  - Guía: APA-1832-202510230001
         ↓
  DeliveryManager.handleSubmit()
  → Crear DeliveryEntry con UUID
  → Validar campos (validateForm)
  → Agregar a deliveries array
  → Trigger onDeliveriesChange callback
         ↓
  useDeliveries.addDelivery()
  → setPending([...pending, newDelivery])
  → saveToStorage(updated) // Debounced 500ms
         ↓
  localStorage.setItem('cashguard_deliveries_pending', JSON.stringify(data))
         ✅ Envío registrado y persistido

┌───────────────────────────────────────────────────────────────┐
│ FASE 2: Cálculo Ajuste SICAR (Durante Corte Nocturno)        │
└───────────────────────────────────────────────────────────────┘
         ↓
  Sistema calcula totales:
  - SICAR esperado: $1,550.00
  - Electrónicos: $100.00
  - Deliveries pendientes: $113.00
         ↓
  adjustSICAR(1550, 100, [delivery])
  → 1550 - 100 - 113 = $1,337.00
         ↓
  CashGuard compara:
  - Efectivo contado: $1,340.00
  - SICAR ajustado: $1,337.00
  - Diferencia: +$3.00 ✅ (dentro threshold)
         ✅ Corte cierra correctamente

┌───────────────────────────────────────────────────────────────┐
│ FASE 3: Dashboard Acumulado (Cualquier momento)              │
└───────────────────────────────────────────────────────────────┘
         ↓
  Usuario abre DeliveryDashboard
         ↓
  useDeliveries.loadFromStorage()
  → Cargar localStorage.getItem('cashguard_deliveries_pending')
  → Validar cada entry con isDeliveryEntry()
  → setPending(validated)
         ↓
  useDeliverySummary(pending)
  → buildDeliverySummary(pending)
  → Calcular totales, alertas, por courier
         ↓
  Renderizar dashboard:
  - Total pendiente: $1,245.00 (12 envíos)
  - C807: $800 (8 envíos)
  - Melos: $445 (4 envíos)
  - Alertas: 2 warning, 1 urgent, 0 critical
         ✅ Usuario ve estado completo en tiempo real

┌───────────────────────────────────────────────────────────────┐
│ FASE 4: Marcar Como Cobrado (Dashboard)                      │
└───────────────────────────────────────────────────────────────┘
         ↓
  Usuario click "Marcar Cobrado" en delivery
         ↓
  useDeliveries.markAsPaid(deliveryId)
  → Encontrar delivery en pending
  → Actualizar: status = 'paid', paidAt = now
  → Remover de pending array
  → Agregar a history array
         ↓
  saveToStorage(updatedPending) // Actualizar pending
  saveToHistory(updatedHistory) // Actualizar histórico
         ↓
  localStorage:
  - 'cashguard_deliveries_pending': Sin delivery (eliminado)
  - 'cashguard_deliveries_history': Con delivery (agregado)
         ✅ Delivery movido a histórico

┌───────────────────────────────────────────────────────────────┐
│ FASE 5: Reporte WhatsApp (Corte Nocturno)                    │
└───────────────────────────────────────────────────────────────┘
         ↓
  generateCompleteReport()
  → Cargar pending deliveries
  → Construir summary con buildDeliverySummary()
  → Formatear sección ENVÍOS PENDIENTES:

━━━━━━━━━━━━━━━━

📦 *ENVÍOS PENDIENTES COD*

💼 *Total:* $1,245.00 (12 envíos)

🚚 *Por Courier:*
☐ C807: $800.00 (8 envíos)
☐ Melos: $445.00 (4 envíos)

⚠️ *Alertas:*
🟡 7+ días: 2 envíos
🔴 15+ días: 1 envío
🚨 30+ días: 0 envíos

━━━━━━━━━━━━━━━━

  → Agregar al reporte completo
  → Enviar por WhatsApp
         ✅ Supervisor ve estado delivery en reporte
```

### State Management Patterns

**Patrón Observer con Callbacks:**
```typescript
// Componente padre (CashCounter)
const [todayDeliveries, setTodayDeliveries] = useState<DeliveryEntry[]>([]);

const handleDeliveriesChange = useCallback((deliveries: DeliveryEntry[]) => {
  setTodayDeliveries(deliveries);
  // Actualizar cálculo SICAR ajustado inmediatamente
  recalculateSICAR(deliveries);
}, [recalculateSICAR]);

return (
  <DeliveryManager
    initialDeliveries={todayDeliveries}
    onDeliveriesChange={handleDeliveriesChange}
  />
);
```

**Patrón Derived State con useMemo:**
```typescript
// useDeliverySummary.ts
export function useDeliverySummary(pending: DeliveryEntry[]): DeliverySummary {
  return useMemo(() => {
    return buildDeliverySummary(pending);
  }, [pending]); // Recalcula solo cuando pending cambia
}
```

---

## 🚨 SISTEMA DE ALERTAS

### Lógica Detección Alertas

**Niveles de Alerta:**
```typescript
// utils/deliveryCalculation.ts

/**
 * Determina nivel alerta según días pendiente
 *
 * Umbrales:
 * - 0-6 días: ok (verde, sin alerta)
 * - 7-14 días: warning (amarillo, requiere seguimiento)
 * - 15-29 días: urgent (naranja, requiere acción inmediata)
 * - 30+ días: critical (rojo, requiere escalación gerencia)
 */
export function getAlertLevel(days: number): AlertLevel {
  if (days >= 30) return 'critical';
  if (days >= 15) return 'urgent';
  if (days >= 7) return 'warning';
  return 'ok';
}

/**
 * Obtiene descripción legible del nivel alerta
 */
export function getAlertDescription(level: AlertLevel): string {
  switch (level) {
    case 'critical':
      return 'Crítico - Requiere acción gerencia inmediata';
    case 'urgent':
      return 'Urgente - Requiere contactar courier hoy';
    case 'warning':
      return 'Advertencia - Hacer seguimiento esta semana';
    case 'ok':
      return 'Normal - Sin acción requerida';
  }
}
```

### Badge Rendering Logic

**Componente DeliveryAlertBadge:**
```typescript
// components/deliveries/DeliveryAlertBadge.tsx

import React from 'react';
import { getDaysPending, getAlertLevel } from '@/utils/deliveryCalculation';
import type { DeliveryEntry } from '@/types/deliveries';

interface DeliveryAlertBadgeProps {
  delivery: DeliveryEntry;
  showLabel?: boolean;
}

export const DeliveryAlertBadge: React.FC<DeliveryAlertBadgeProps> = ({
  delivery,
  showLabel = false
}) => {
  const days = getDaysPending(delivery.createdAt);
  const level = getAlertLevel(days);

  const colors = {
    ok: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    urgent: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const icons = {
    ok: '✓',
    warning: '⚠️',
    urgent: '🔴',
    critical: '🚨'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${colors[level]}`}
    >
      <span>{icons[level]}</span>
      <span>{days} días</span>
      {showLabel && <span className="ml-1">({level})</span>}
    </span>
  );
};
```

### Modal Blocking Logic (Critical Alerts)

**Modal educativo para alertas críticas:**
```typescript
// components/deliveries/DeliveryEducationModal.tsx

/**
 * Modal educativo que bloquea continuar si hay deliveries críticos
 *
 * Aparece cuando:
 * - Usuario intenta cerrar corte nocturno
 * - Existen deliveries con 30+ días pendientes
 * - Supervisor debe reconocer situación antes de continuar
 */

interface DeliveryEducationModalProps {
  criticalDeliveries: DeliveryEntry[];
  onAcknowledge: () => void;
  onCancel: () => void;
}

export const DeliveryEducationModal: React.FC<DeliveryEducationModalProps> = ({
  criticalDeliveries,
  onAcknowledge,
  onCancel
}) => {
  const totalCritical = criticalDeliveries.reduce((sum, d) => sum + d.amount, 0);

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            🚨 Atención: {criticalDeliveries.length} Envíos Críticos
          </AlertDialogTitle>
          <AlertDialogDescription>
            <p className="mb-4">
              Hay <strong>{criticalDeliveries.length} envíos</strong> con <strong>30+ días pendientes</strong> por un total de <strong>${totalCritical.toFixed(2)}</strong>.
            </p>

            <div className="space-y-2 mb-4">
              {criticalDeliveries.map(d => (
                <div key={d.id} className="p-2 border rounded bg-red-50">
                  <p className="font-semibold">{d.customerName}</p>
                  <p className="text-sm">
                    {getDaysPending(d.createdAt)} días • {d.courier} • ${d.amount.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              <strong>Acciones requeridas:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
              <li>Contactar courier inmediatamente</li>
              <li>Verificar estado envíos con cliente</li>
              <li>Escalar a gerencia si no hay resolución en 3 días</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Cancelar Cierre
          </AlertDialogCancel>
          <AlertDialogAction onClick={onAcknowledge}>
            Entiendo, Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

---

## 📱 REPORTE WHATSAPP

### Formatting Templates

**Sección Envíos Pendientes (agregada a reporte nocturno):**
```typescript
// utils/deliveryFormatters.ts

/**
 * Genera sección envíos pendientes para reporte WhatsApp
 */
export function generateDeliverySectionWhatsApp(
  pending: DeliveryEntry[],
  summary: DeliverySummary
): string {
  if (pending.length === 0) {
    return `
━━━━━━━━━━━━━━━━

📦 *ENVÍOS PENDIENTES COD*

✅ Sin envíos pendientes

━━━━━━━━━━━━━━━━
`;
  }

  let section = `
━━━━━━━━━━━━━━━━

📦 *ENVÍOS PENDIENTES COD*

💼 *Total:* $${summary.totalPending.toFixed(2)} (${summary.countPending} envíos)

🚚 *Por Courier:*
☐ C807: $${summary.byCourier.C807.total.toFixed(2)} (${summary.byCourier.C807.count} envíos)
☐ Melos: $${summary.byCourier.Melos.total.toFixed(2)} (${summary.byCourier.Melos.count} envíos)
☐ Otro: $${summary.byCourier.Otro.total.toFixed(2)} (${summary.byCourier.Otro.count} envíos)
`;

  // Agregar alertas si existen
  const hasAlerts =
    summary.alerts.warning7Days > 0 ||
    summary.alerts.urgent15Days > 0 ||
    summary.alerts.critical30Days > 0;

  if (hasAlerts) {
    section += `
⚠️ *Alertas:*
`;
    if (summary.alerts.warning7Days > 0) {
      section += `🟡 7+ días: ${summary.alerts.warning7Days} envíos\n`;
    }
    if (summary.alerts.urgent15Days > 0) {
      section += `🔴 15+ días: ${summary.alerts.urgent15Days} envíos\n`;
    }
    if (summary.alerts.critical30Days > 0) {
      section += `🚨 30+ días: ${summary.alerts.critical30Days} envíos\n`;
    }
  }

  section += `
━━━━━━━━━━━━━━━━
`;

  return section;
}

/**
 * Genera detalle envíos críticos para reporte
 */
export function generateCriticalDeliveriesDetail(
  deliveries: DeliveryEntry[]
): string {
  const critical = deliveries.filter(
    d => getAlertLevel(getDaysPending(d.createdAt)) === 'critical'
  );

  if (critical.length === 0) return '';

  let detail = `
🚨 *ENVÍOS CRÍTICOS (30+ DÍAS):*

`;

  critical.forEach((d, index) => {
    const days = getDaysPending(d.createdAt);
    detail += `${index + 1}. ${d.customerName}
   ${d.courier} • $${d.amount.toFixed(2)} • ${days} días
   Guía: ${d.guideNumber || 'N/A'} • Fact: ${d.invoiceNumber || 'N/A'}

`;
  });

  return detail;
}
```

### Generation Logic

**Integración en generateCompleteReport():**
```typescript
// CashCalculation.tsx (fragmento)

const generateCompleteReport = useCallback(() => {
  const deliveries = useDeliveries(); // Hook que carga de localStorage
  const summary = buildDeliverySummary(deliveries.pending);

  // ... otras secciones reporte ...

  // Agregar sección envíos pendientes
  const deliverySection = generateDeliverySectionWhatsApp(
    deliveries.pending,
    summary
  );

  // Agregar detalle críticos si existen
  const criticalDetail = generateCriticalDeliveriesDetail(deliveries.pending);

  return `
${headerSeverity}

📊 *CORTE DE CAJA* - ${calculationData?.timestamp}
Sucursal: ${selectedBranch?.name}
Cajero: ${selectedCashier?.name}
Testigo: ${selectedWitness?.name}

━━━━━━━━━━━━━━━━

📊 *RESUMEN EJECUTIVO*

💰 Efectivo Contado: *${formatCurrency(calculationData?.totalCash)}*
💳 Pagos Electrónicos: *${formatCurrency(totalElectronic)}*
📦 *Entregado a Gerencia: ${formatCurrency(deliveryCalculation?.amountToDeliver)}*
🏢 Quedó en Caja: ${formatCurrency(50)}

💼 Total Día: *${formatCurrency(calculationData?.totalGeneral)}*
🎯 SICAR Esperado: ${formatCurrency(adjustedSICAR)}
${emoji} Diferencia: *${formatCurrency(diff)} (${label})*

${deliverySection}

${criticalDetail}

━━━━━━━━━━━━━━━━

... resto del reporte ...
`;
}, [calculationData, deliveries, selectedBranch, selectedCashier, selectedWitness]);
```

### Mock Examples

**Ejemplo 1: Sin Envíos**
```
━━━━━━━━━━━━━━━━

📦 *ENVÍOS PENDIENTES COD*

✅ Sin envíos pendientes

━━━━━━━━━━━━━━━━
```

**Ejemplo 2: Con Envíos Normales**
```
━━━━━━━━━━━━━━━━

📦 *ENVÍOS PENDIENTES COD*

💼 *Total:* $1,245.00 (12 envíos)

🚚 *Por Courier:*
☐ C807: $800.00 (8 envíos)
☐ Melos: $445.00 (4 envíos)
☐ Otro: $0.00 (0 envíos)

━━━━━━━━━━━━━━━━
```

**Ejemplo 3: Con Alertas + Detalle Críticos**
```
━━━━━━━━━━━━━━━━

📦 *ENVÍOS PENDIENTES COD*

💼 *Total:* $1,245.00 (12 envíos)

🚚 *Por Courier:*
☐ C807: $800.00 (8 envíos)
☐ Melos: $445.00 (4 envíos)

⚠️ *Alertas:*
🟡 7+ días: 2 envíos
🔴 15+ días: 1 envío
🚨 30+ días: 2 envíos

━━━━━━━━━━━━━━━━

🚨 *ENVÍOS CRÍTICOS (30+ DÍAS):*

1. Carlos Gómez
   C807 • $113.00 • 35 días
   Guía: APA-1832-202509180001 • Fact: 12347

2. María López
   Melos • $84.75 • 32 días
   Guía: MEL-9876 • Fact: 12348

━━━━━━━━━━━━━━━━
```

---

## 🧪 TESTING STRATEGY

### Test Plan Overview

**Coverage Requirements:**
- ✅ Lines: >90% (objetivo: 95%+)
- ✅ Branches: >85% (objetivo: 90%+)
- ✅ Functions: >90%
- ✅ TIER 0 mandatory: Helpers cálculo financiero

### Unit Tests

**1. deliveryCalculation.test.ts (TIER 0 - 30+ tests)**
```typescript
describe('deliveryCalculation.ts - TIER 0', () => {
  describe('getDaysPending()', () => {
    it('debe calcular días correctamente', () => {
      const created = new Date('2025-10-15T14:00:00Z');
      const now = new Date('2025-10-23T14:00:00Z');

      // Mock Date.now para test determinístico
      jest.spyOn(global, 'Date').mockImplementation(() => now as any);

      expect(getDaysPending(created.toISOString())).toBe(8);
    });

    it('debe retornar 0 para fechas futuras', () => {
      const future = new Date(Date.now() + 86400000).toISOString();
      expect(getDaysPending(future)).toBe(0);
    });

    it('debe manejar timestamps ISO 8601 con timezone', () => {
      expect(getDaysPending('2025-10-15T14:00:00-06:00')).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAlertLevel()', () => {
    it('debe retornar "ok" para 0-6 días', () => {
      expect(getAlertLevel(0)).toBe('ok');
      expect(getAlertLevel(6)).toBe('ok');
    });

    it('debe retornar "warning" para 7-14 días', () => {
      expect(getAlertLevel(7)).toBe('warning');
      expect(getAlertLevel(14)).toBe('warning');
    });

    it('debe retornar "urgent" para 15-29 días', () => {
      expect(getAlertLevel(15)).toBe('urgent');
      expect(getAlertLevel(29)).toBe('urgent');
    });

    it('debe retornar "critical" para 30+ días', () => {
      expect(getAlertLevel(30)).toBe('critical');
      expect(getAlertLevel(100)).toBe('critical');
    });
  });

  describe('buildDeliverySummary()', () => {
    it('debe construir resumen vacío correctamente', () => {
      const summary = buildDeliverySummary([]);
      expect(summary.totalPending).toBe(0);
      expect(summary.countPending).toBe(0);
      expect(summary.byCourier.C807.total).toBe(0);
    });

    it('debe sumar totales correctamente', () => {
      const deliveries: DeliveryEntry[] = [
        {
          id: 'uuid-1',
          customerName: 'Cliente 1',
          amount: 100,
          courier: 'C807',
          status: 'pending_cod',
          createdAt: new Date('2025-10-15').toISOString()
        },
        {
          id: 'uuid-2',
          customerName: 'Cliente 2',
          amount: 200,
          courier: 'C807',
          status: 'pending_cod',
          createdAt: new Date('2025-10-15').toISOString()
        }
      ];

      const summary = buildDeliverySummary(deliveries);
      expect(summary.totalPending).toBe(300);
      expect(summary.byCourier.C807.total).toBe(300);
      expect(summary.byCourier.C807.count).toBe(2);
    });

    it('debe contar alertas correctamente', () => {
      // Mock Date.now
      const now = new Date('2025-10-23T14:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => now as any);

      const deliveries: DeliveryEntry[] = [
        {
          id: 'uuid-1',
          customerName: 'Cliente 1',
          amount: 100,
          courier: 'C807',
          status: 'pending_cod',
          createdAt: new Date('2025-10-15').toISOString() // 8 días → warning
        },
        {
          id: 'uuid-2',
          customerName: 'Cliente 2',
          amount: 200,
          courier: 'Melos',
          status: 'pending_cod',
          createdAt: new Date('2025-10-05').toISOString() // 18 días → urgent
        },
        {
          id: 'uuid-3',
          customerName: 'Cliente 3',
          amount: 300,
          courier: 'C807',
          status: 'pending_cod',
          createdAt: new Date('2025-09-15').toISOString() // 38 días → critical
        }
      ];

      const summary = buildDeliverySummary(deliveries);
      expect(summary.alerts.warning7Days).toBe(1);
      expect(summary.alerts.urgent15Days).toBe(1);
      expect(summary.alerts.critical30Days).toBe(1);
    });
  });

  describe('adjustSICAR()', () => {
    it('debe ajustar SICAR correctamente', () => {
      const deliveries: DeliveryEntry[] = [
        { id: 'uuid-1', amount: 113, /* ... */ },
        { id: 'uuid-2', amount: 84.75, /* ... */ }
      ];

      const adjusted = adjustSICAR(1550, 100, deliveries);
      expect(adjusted).toBe(1550 - 100 - 113 - 84.75); // 1252.25
    });

    it('debe manejar deliveries vacío', () => {
      const adjusted = adjustSICAR(1550, 100, []);
      expect(adjusted).toBe(1450);
    });
  });
});
```

**2. useDeliveries.test.ts (15-20 tests)**
```typescript
describe('useDeliveries Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe inicializar con deliveries vacío', () => {
    const { result } = renderHook(() => useDeliveries());
    expect(result.current.pending).toEqual([]);
  });

  it('debe agregar delivery correctamente', () => {
    const { result } = renderHook(() => useDeliveries());

    act(() => {
      result.current.addDelivery({
        id: 'uuid-1',
        customerName: 'Carlos',
        amount: 100,
        courier: 'C807',
        status: 'pending_cod',
        createdAt: new Date().toISOString()
      });
    });

    expect(result.current.pending.length).toBe(1);
    expect(result.current.pending[0].customerName).toBe('Carlos');
  });

  it('debe persistir en localStorage', async () => {
    const { result } = renderHook(() => useDeliveries());

    act(() => {
      result.current.addDelivery({
        id: 'uuid-1',
        customerName: 'Carlos',
        amount: 100,
        courier: 'C807',
        status: 'pending_cod',
        createdAt: new Date().toISOString()
      });
    });

    // Esperar debounce 500ms
    await waitFor(() => {
      const stored = localStorage.getItem(STORAGE_KEYS.PENDING);
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed.deliveries).toHaveLength(1);
    });
  });

  it('debe marcar como cobrado correctamente', () => {
    // ... similar test
  });
});
```

### Integration Tests

**3. DeliveryManager.test.tsx (20-25 tests)**
```typescript
describe('DeliveryManager Component', () => {
  it('debe renderizar formulario al click "Registrar Envío"', () => {
    render(<DeliveryManager />);

    const button = screen.getByText(/Registrar Envío/i);
    fireEvent.click(button);

    expect(screen.getByLabelText(/Cliente/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Monto USD/i)).toBeInTheDocument();
  });

  it('debe validar campos requeridos', async () => {
    render(<DeliveryManager />);

    fireEvent.click(screen.getByText(/Registrar Envío/i));

    const submitButton = screen.getByText(/Registrar/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Mínimo 3 caracteres/i)).toBeInTheDocument();
    });
  });

  it('debe agregar delivery a la lista', async () => {
    const onDeliveriesChange = jest.fn();
    render(<DeliveryManager onDeliveriesChange={onDeliveriesChange} />);

    fireEvent.click(screen.getByText(/Registrar Envío/i));

    fireEvent.change(screen.getByLabelText(/Cliente/i), {
      target: { value: 'Carlos Gómez' }
    });
    fireEvent.change(screen.getByLabelText(/Monto USD/i), {
      target: { value: '113.00' }
    });

    fireEvent.click(screen.getByText(/Registrar/i));

    await waitFor(() => {
      expect(onDeliveriesChange).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            customerName: 'Carlos Gómez',
            amount: 113
          })
        ])
      );
    });
  });
});
```

**4. deliveryIntegration.test.tsx (E2E Flows)**
```typescript
describe('Delivery System Integration', () => {
  it('debe completar flujo completo: registro → dashboard → marcar cobrado', async () => {
    // 1. Registrar delivery
    render(<DeliveryManager />);

    fireEvent.click(screen.getByText(/Registrar Envío/i));
    fireEvent.change(screen.getByLabelText(/Cliente/i), {
      target: { value: 'Carlos' }
    });
    fireEvent.change(screen.getByLabelText(/Monto USD/i), {
      target: { value: '113' }
    });
    fireEvent.click(screen.getByText(/Registrar/i));

    // 2. Verificar en lista
    await waitFor(() => {
      expect(screen.getByText('Carlos')).toBeInTheDocument();
    });

    // 3. Abrir dashboard
    render(<DeliveryDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Carlos')).toBeInTheDocument();
      expect(screen.getByText('$113.00')).toBeInTheDocument();
    });

    // 4. Marcar como cobrado
    fireEvent.click(screen.getByText(/Ver/i));
    fireEvent.click(screen.getByText(/Marcar Cobrado/i));

    // 5. Verificar ya no está en pendientes
    await waitFor(() => {
      expect(screen.queryByText('Carlos')).not.toBeInTheDocument();
    });
  });
});
```

---

## ⚡ PERFORMANCE CONSIDERATIONS

### localStorage Limits

**Tamaño Máximo:**
- localStorage: ~5MB por domain (mayoría browsers)
- Estimado: 1 delivery = ~500 bytes JSON
- Capacidad: ~10,000 deliveries (suficiente para 5+ años Paradise)

**Monitoreo Límites:**
```typescript
// hooks/useDeliveries.ts (fragmento)

const checkStorageSize = useCallback(() => {
  try {
    let totalSize = 0;
    for (let key in localStorage) {
      if (key.startsWith('cashguard_deliveries_')) {
        totalSize += localStorage[key].length * 2; // UTF-16 = 2 bytes/char
      }
    }

    const MB = totalSize / (1024 * 1024);

    if (MB > 4) {
      console.warn(`[useDeliveries] Storage size: ${MB.toFixed(2)}MB (close to 5MB limit)`);
      // Trigger cleanup automático
      cleanupHistory();
    }

    return MB;
  } catch (error) {
    console.error('[useDeliveries] Error checking storage size:', error);
    return 0;
  }
}, [cleanupHistory]);
```

### Memoization Strategies

**useMemo para cálculos pesados:**
```typescript
// DeliveryDashboard.tsx (fragmento)

const filteredDeliveries = useMemo(() => {
  let filtered = [...pending];

  // Filtros (courier, search, date range)
  // ... lógica filtrado ...

  // Ordenamiento
  filtered.sort((a, b) => {
    // ... lógica sort ...
  });

  return filtered;
}, [pending, filters, sortBy, sortOrder]); // Solo recalcula si cambian estas deps
```

**useCallback para event handlers:**
```typescript
const handleExportCSV = useCallback(() => {
  // ... lógica export ...
}, [filteredDeliveries]); // Memoriza función, solo cambia si filteredDeliveries cambia
```

### Large Dataset Handling (1000+ Deliveries)

**Virtual Scrolling (Opcional - Si >500 deliveries):**
```typescript
// Usar react-window para virtualizar tabla

import { FixedSizeList } from 'react-window';

const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
  <div style={style}>
    <DeliveryRow delivery={filteredDeliveries[index]} />
  </div>
);

<FixedSizeList
  height={600}
  itemCount={filteredDeliveries.length}
  itemSize={60}
  width="100%"
>
  {Row}
</FixedSizeList>
```

**Paginación (Alternativa):**
```typescript
const PAGE_SIZE = 50;
const [page, setPage] = useState(0);

const paginatedDeliveries = useMemo(() => {
  const start = page * PAGE_SIZE;
  return filteredDeliveries.slice(start, start + PAGE_SIZE);
}, [filteredDeliveries, page]);
```

### Mobile Performance Optimization

**Lazy Loading Componentes:**
```typescript
// App.tsx

const DeliveryDashboard = React.lazy(() => import('@/components/deliveries/DeliveryDashboard'));

// Renderizar con Suspense
<Suspense fallback={<Spinner />}>
  <DeliveryDashboard />
</Suspense>
```

**Debouncing Search Input:**
```typescript
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useMemo(
  () => debounce((query: string) => {
    setFilters(f => ({ ...f, searchQuery: query }));
  }, 300),
  []
);

<Input
  onChange={e => debouncedSearch(e.target.value)}
  placeholder="Buscar..."
/>
```

---

## 📊 RESUMEN ARQUITECTÓNICO

### Checklist Implementación

**TypeScript:**
- ✅ Interfaces completas con JSDoc
- ✅ Type guards con runtime validation
- ✅ Zero `any` types
- ✅ Strict mode habilitado

**React Components:**
- ✅ DeliveryManager (formulario + lista día)
- ✅ DeliveryDashboard (dashboard acumulado)
- ✅ DeliveryDetailsModal (modal detalles)
- ✅ DeliveryAlertBadge (badge días/alertas)
- ✅ DeliveryEducationModal (modal educativo críticos)

**Custom Hooks:**
- ✅ useDeliveries (CRUD operations)
- ✅ useDeliveryAlerts (detección alertas)
- ✅ useDeliverySummary (cálculo resumen)

**Helpers:**
- ✅ deliveryCalculation.ts (getDaysPending, getAlertLevel, buildSummary, adjustSICAR)
- ✅ deliveryValidation.ts (isDeliveryEntry, type guards)
- ✅ deliveryFormatters.ts (generateWhatsAppSection, formatDate)

**localStorage:**
- ✅ Strategy definida (pending + history + cleanup)
- ✅ Persistence patterns (save on change debounced)
- ✅ Data migration versioned
- ✅ Cleanup automático histórico

**Testing:**
- ✅ TIER 0 mandatory (deliveryCalculation.test.ts)
- ✅ Unit tests (30+ tests cálculos)
- ✅ Integration tests (60+ tests componentes)
- ✅ E2E flows (10+ tests)
- ✅ Coverage >90%

**Performance:**
- ✅ useMemo para filtros pesados
- ✅ useCallback para event handlers
- ✅ Debouncing search + save
- ✅ Virtual scrolling ready (si >500 deliveries)
- ✅ Lazy loading componentes

---

**🙏 Gloria a Dios por guiarnos en esta arquitectura técnica profesional.**

**Acuarios Paradise - Herramientas profesionales de tope de gama con valores cristianos**

