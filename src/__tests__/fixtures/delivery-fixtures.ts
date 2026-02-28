// 🤖 [IA] - v1.0.0 - Mock data para testing de deliveries
import type { DeliveryEntry } from '@/types/deliveries';

export const mockDeliveryPending: DeliveryEntry = {
  id: 'test-delivery-1',
  customerName: 'Carlos Gómez',
  amount: 113.00,
  courier: 'C807',
  guideNumber: 'APA-1832-TEST',
  status: 'pending_cod',
  createdAt: '2025-10-21T10:30:00-06:00',
  notes: 'Entrega pendiente de pago'
};

export const mockDeliveryPaid: DeliveryEntry = {
  id: 'test-delivery-2',
  customerName: 'Ana Martínez',
  amount: 250.00,
  courier: 'Melos',
  guideNumber: 'MEL-9921-TEST',
  status: 'paid',
  createdAt: '2025-10-20T14:15:00-06:00',
  paidAt: '2025-10-22T09:30:00-06:00',
  notes: 'Pagado en efectivo'
};

export const mockDeliveryCancelled: DeliveryEntry = {
  id: 'test-delivery-3',
  customerName: 'Roberto Mendoza',
  amount: 75.50,
  courier: 'C807',
  guideNumber: 'APA-5544-TEST',
  status: 'cancelled',
  createdAt: '2025-10-19T11:00:00-06:00',
  cancelledAt: '2025-10-20T16:45:00-06:00',
  notes: 'Cliente rechazó producto'
};

export const mockDeliveriesList: DeliveryEntry[] = [
  mockDeliveryPending,
  mockDeliveryPaid,
  mockDeliveryCancelled,
  {
    ...mockDeliveryPending,
    id: 'test-delivery-4',
    customerName: 'María López',
    amount: 180.00,
    courier: 'C807',
    guideNumber: 'APA-7788-TEST',
    createdAt: '2025-10-18T13:20:00-06:00'
  },
  {
    ...mockDeliveryPending,
    id: 'test-delivery-5',
    customerName: 'José Ramírez',
    amount: 95.75,
    courier: 'Melos',
    guideNumber: 'MEL-3344-TEST',
    createdAt: '2025-10-17T10:10:00-06:00'
  }
];

// Mock para deliveries con diferentes antigüedades (para testing alertas)
export const mockDeliveriesWithAlerts: DeliveryEntry[] = [
  {
    ...mockDeliveryPending,
    id: 'delivery-recent',
    customerName: 'Cliente Reciente',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 días
  },
  {
    ...mockDeliveryPending,
    id: 'delivery-warning',
    customerName: 'Cliente Advertencia',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 días
  },
  {
    ...mockDeliveryPending,
    id: 'delivery-urgent',
    customerName: 'Cliente Urgente',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20 días
  },
  {
    ...mockDeliveryPending,
    id: 'delivery-critical',
    customerName: 'Cliente Crítico',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString() // 35 días
  }
];
