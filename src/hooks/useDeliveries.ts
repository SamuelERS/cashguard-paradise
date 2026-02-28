/**
 * 🤖 [IA] - VERSION 3.0: Hook de Gestión de Deliveries (CRUD + localStorage)
 *
 * Hook React personalizado que maneja operaciones CRUD completas sobre deliveries COD:
 * - Create: Agregar nuevo delivery pending
 * - Read: Obtener pending/history con filtros
 * - Update: Modificar delivery existente (transiciones de estado)
 * - Delete: Soft delete (mover a cancelled/rejected)
 * - Persistence: Auto-sync con localStorage (debounced)
 * - Auto-cleanup: History entries >90 días
 *
 * @module hooks/useDeliveries
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Arquitectura:
 * - State: pending[] + history[] separados (performance)
 * - Persistence: 2 localStorage keys (PENDING + HISTORY)
 * - Debouncing: 500ms para writes (previene I/O saturation)
 * - Auto-cleanup: useEffect con intervalo 24h
 *
 * Compliance:
 * - NIST SP 800-115: Timestamps ISO 8601 audit trail
 * - PCI DSS 12.10.1: Trazabilidad financiera completa
 * - REGLAS_DE_LA_CASA.md: Hooks custom, zero `any`, memoization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DeliveryEntry, DeliveryStatus } from '../types/deliveries';
import { STORAGE_KEYS, DELIVERY_VALIDATION } from '../types/deliveries';
import { DELIVERY_CONFIG } from '../data/deliveryConfig';
import { isDeliveryEntry, filterValidDeliveries } from '../utils/deliveryValidation';

// ═══════════════════════════════════════════════════════════
// INTERFACES DEL HOOK
// ═══════════════════════════════════════════════════════════

/**
 * Parámetros de entrada para crear/actualizar un delivery
 *
 * @remarks
 * Omite campos auto-generados (id, createdAt) y opcionales de estado (paidAt, cancelledAt)
 * Permite partial updates en modificaciones (status transitions)
 */
interface CreateDeliveryInput {
  /** Nombre completo cliente (3-100 caracteres) */
  customerName: string;
  /** Monto total USD (0.01-10000.00) */
  amount: number;
  /** Courier que maneja envío */
  courier: DeliveryEntry['courier'];
  /** Número de guía courier (opcional) */
  guideNumber?: string;
  /** Número de factura SICAR (opcional) */
  invoiceNumber?: string;
  /** Notas adicionales (0-500 caracteres, opcional) */
  notes?: string;
}

/**
 * Parámetros para actualizar delivery existente (partial updates)
 */
interface UpdateDeliveryInput extends Partial<CreateDeliveryInput> {
  /** Nuevo estado (pending_cod → paid/cancelled/rejected) */
  status?: DeliveryStatus;
  /** Razón de cancelación (solo si status=cancelled|rejected) */
  cancelReason?: string;
}

/**
 * Objeto retornado por el hook useDeliveries
 */
interface UseDeliveriesReturn {
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  /** Array de deliveries pendientes (status='pending_cod') */
  pending: DeliveryEntry[];
  /** Array de deliveries finalizados (status!='pending_cod') */
  history: DeliveryEntry[];
  /** Loading state durante operaciones async */
  isLoading: boolean;
  /** Error state si operación falla */
  error: Error | null;

  // ─────────────────────────────────────────
  // CRUD OPERATIONS
  // ─────────────────────────────────────────
  /** Crear nuevo delivery pending */
  createDelivery: (input: CreateDeliveryInput) => DeliveryEntry;
  /** Actualizar delivery existente (partial update) */
  updateDelivery: (id: string, updates: UpdateDeliveryInput) => void;
  /** Marcar delivery como pagado (pending_cod → paid) */
  markAsPaid: (id: string) => void;
  /** Cancelar delivery (pending_cod → cancelled) */
  cancelDelivery: (id: string, reason: string) => void;
  /** Rechazar delivery (pending_cod → rejected) */
  rejectDelivery: (id: string, reason: string) => void;
  /** Marcar delivery como ya deducido del corte (establece deductedAt, NO cambia status) */
  markAsDeducted: (id: string) => void;

  // ─────────────────────────────────────────
  // QUERIES
  // ─────────────────────────────────────────
  /** Obtener delivery por ID (busca en pending + history) */
  getDeliveryById: (id: string) => DeliveryEntry | undefined;
  /** Filtrar pending por criterios */
  filterPending: (predicate: (d: DeliveryEntry) => boolean) => DeliveryEntry[];
  /** Filtrar history por criterios */
  filterHistory: (predicate: (d: DeliveryEntry) => boolean) => DeliveryEntry[];

  // ─────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────
  /** Limpiar manualmente history >90 días */
  cleanupHistory: () => void;
  /** Refrescar datos desde localStorage (force reload) */
  refresh: () => void;
}

// ═══════════════════════════════════════════════════════════
// HELPERS DE PERSISTENCIA
// ═══════════════════════════════════════════════════════════

/**
 * Lee deliveries desde localStorage con validación
 *
 * @param key - Clave localStorage (PENDING | HISTORY)
 * @returns Array de DeliveryEntry válidos (nunca null/undefined)
 */
function loadFromStorage(key: string): DeliveryEntry[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return filterValidDeliveries(parsed);
  } catch (error) {
    console.error(`[useDeliveries] Error loading from ${key}:`, error);
    return [];
  }
}

/**
 * Guarda deliveries en localStorage con serialización JSON
 *
 * @param key - Clave localStorage (PENDING | HISTORY)
 * @param deliveries - Array de DeliveryEntry a guardar
 */
function saveToStorage(key: string, deliveries: DeliveryEntry[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(deliveries));
  } catch (error) {
    console.error(`[useDeliveries] Error saving to ${key}:`, error);
  }
}

// ═══════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════

/**
 * Hook de gestión completa de deliveries COD con localStorage persistence
 *
 * @returns Objeto con state, CRUD operations, queries y utilities
 *
 * @remarks
 * Características principales:
 * - **Separación pending/history**: Arrays separados para performance queries
 * - **Auto-sync localStorage**: Debounced writes (500ms) previenen I/O saturation
 * - **Auto-cleanup**: History >90 días eliminado automáticamente
 * - **Type safety**: Validación runtime con type guards en deserialización
 * - **Error handling**: Try-catch en todas las operaciones I/O
 * - **Memoization**: useCallback para CRUD operations (evita re-renders)
 *
 * Performance:
 * - Pending queries: O(n) donde n = cantidad pending (típicamente <50)
 * - History queries: O(m) donde m = cantidad history post-cleanup (típicamente <500)
 * - Create: O(1) (append al inicio pending array)
 * - Update: O(n) find + O(1) update
 * - State transitions: O(n) remove pending + O(1) append history
 *
 * Persistencia:
 * - pending → localStorage key 'cashguard_deliveries_pending'
 * - history → localStorage key 'cashguard_deliveries_history'
 * - Debouncing: 500ms desde último cambio antes de write
 * - Cleanup: Cada 24h elimina history >90 días
 *
 * @example
 * ```typescript
 * function DeliveryManager() {
 *   const {
 *     pending,
 *     createDelivery,
 *     markAsPaid,
 *     cancelDelivery
 *   } = useDeliveries();
 *
 *   const handleCreate = () => {
 *     const newDelivery = createDelivery({
 *       customerName: 'Juan Pérez',
 *       amount: 75.50,
 *       courier: 'C807',
 *       guideNumber: 'C807-2025-001234',
 *       notes: 'Entrega horario oficina'
 *     });
 *     console.log('Created:', newDelivery.id);
 *   };
 *
 *   const handlePaid = (id: string) => {
 *     markAsPaid(id);
 *     toast.success('Delivery marcado como pagado');
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCreate}>Agregar Delivery</button>
 *       {pending.map(d => (
 *         <div key={d.id}>
 *           <span>{d.customerName}: ${d.amount}</span>
 *           <button onClick={() => handlePaid(d.id)}>Marcar Pagado</button>
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link DeliveryEntry} Interface completa de delivery
 * @see {@link CreateDeliveryInput} Parámetros de creación
 * @see {@link UpdateDeliveryInput} Parámetros de actualización
 */
export function useDeliveries(): UseDeliveriesReturn {
  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  const [pending, setPending] = useState<DeliveryEntry[]>([]);
  const [history, setHistory] = useState<DeliveryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // ─────────────────────────────────────────
  // REFS PARA DEBOUNCING
  // ─────────────────────────────────────────
  const pendingSaveTimeout = useRef<NodeJS.Timeout | null>(null);
  const historySaveTimeout = useRef<NodeJS.Timeout | null>(null);

  // ─────────────────────────────────────────
  // INITIAL LOAD (useEffect mount)
  // ─────────────────────────────────────────
  useEffect(() => {
    try {
      setIsLoading(true);
      const loadedPending = loadFromStorage(STORAGE_KEYS.PENDING);
      const loadedHistory = loadFromStorage(STORAGE_KEYS.HISTORY);

      setPending(loadedPending);
      setHistory(loadedHistory);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load deliveries'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─────────────────────────────────────────
  // AUTO-SAVE PENDING (debounced 500ms)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return; // Skip initial load

    // Clear previous timeout
    if (pendingSaveTimeout.current) {
      clearTimeout(pendingSaveTimeout.current);
    }

    // Schedule debounced save
    pendingSaveTimeout.current = setTimeout(() => {
      saveToStorage(STORAGE_KEYS.PENDING, pending);
    }, DELIVERY_CONFIG.SAVE_DEBOUNCE_MS);

    // Cleanup on unmount
    return () => {
      if (pendingSaveTimeout.current) {
        clearTimeout(pendingSaveTimeout.current);
      }
    };
  }, [pending, isLoading]);

  // ─────────────────────────────────────────
  // AUTO-SAVE HISTORY (debounced 500ms)
  // ─────────────────────────────────────────
  useEffect(() => {
    if (isLoading) return; // Skip initial load

    // Clear previous timeout
    if (historySaveTimeout.current) {
      clearTimeout(historySaveTimeout.current);
    }

    // Schedule debounced save
    historySaveTimeout.current = setTimeout(() => {
      saveToStorage(STORAGE_KEYS.HISTORY, history);
    }, DELIVERY_CONFIG.SAVE_DEBOUNCE_MS);

    // Cleanup on unmount
    return () => {
      if (historySaveTimeout.current) {
        clearTimeout(historySaveTimeout.current);
      }
    };
  }, [history, isLoading]);

  // ─────────────────────────────────────────
  // AUTO-CLEANUP HISTORY >90 días (cada 24h)
  // ─────────────────────────────────────────
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const cutoffDate = Date.now() - DELIVERY_CONFIG.HISTORY_RETENTION_DAYS * 86400000;

      setHistory((prevHistory) =>
        prevHistory.filter((d) => {
          const createdTimestamp = Date.parse(d.createdAt);
          return createdTimestamp > cutoffDate;
        })
      );
    }, 86400000); // 24 horas en ms

    return () => clearInterval(cleanupInterval);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // CRUD OPERATIONS
  // ═══════════════════════════════════════════════════════════

  /**
   * Crea nuevo delivery pending con valores por defecto
   */
  const createDelivery = useCallback((input: CreateDeliveryInput): DeliveryEntry => {
    // Validaciones de entrada
    if (
      input.customerName.length < DELIVERY_VALIDATION.MIN_CUSTOMER_NAME_LENGTH ||
      input.customerName.length > DELIVERY_VALIDATION.MAX_CUSTOMER_NAME_LENGTH
    ) {
      throw new Error(
        `customerName debe tener entre ${DELIVERY_VALIDATION.MIN_CUSTOMER_NAME_LENGTH}-${DELIVERY_VALIDATION.MAX_CUSTOMER_NAME_LENGTH} caracteres`
      );
    }

    if (input.amount < DELIVERY_VALIDATION.MIN_AMOUNT || input.amount > DELIVERY_VALIDATION.MAX_AMOUNT) {
      throw new Error(`amount debe estar entre $${DELIVERY_VALIDATION.MIN_AMOUNT}-$${DELIVERY_VALIDATION.MAX_AMOUNT}`);
    }

    if (input.notes && input.notes.length > DELIVERY_VALIDATION.MAX_NOTES_LENGTH) {
      throw new Error(`notes no puede exceder ${DELIVERY_VALIDATION.MAX_NOTES_LENGTH} caracteres`);
    }

    // Crear nuevo delivery
    const newDelivery: DeliveryEntry = {
      id: crypto.randomUUID(),
      customerName: input.customerName.trim(),
      amount: Number(input.amount.toFixed(2)), // Redondear a 2 decimales
      courier: input.courier,
      guideNumber: input.guideNumber?.trim(),
      invoiceNumber: input.invoiceNumber?.trim(),
      status: 'pending_cod',
      createdAt: new Date().toISOString(),
      notes: input.notes?.trim(),
    };

    // Validar con type guard (extra safety)
    if (!isDeliveryEntry(newDelivery)) {
      throw new Error('Created delivery failed validation');
    }

    // Agregar al inicio del array (más recientes primero)
    setPending((prev) => [newDelivery, ...prev]);

    return newDelivery;
  }, []);

  /**
   * Actualiza delivery existente (partial updates permitidos)
   */
  const updateDelivery = useCallback((id: string, updates: UpdateDeliveryInput): void => {
    // Buscar en pending
    const pendingIndex = pending.findIndex((d) => d.id === id);
    if (pendingIndex !== -1) {
      setPending((prev) => {
        const updated = [...prev];
        updated[pendingIndex] = { ...updated[pendingIndex], ...updates };
        return updated;
      });
      return;
    }

    // Buscar en history
    const historyIndex = history.findIndex((d) => d.id === id);
    if (historyIndex !== -1) {
      setHistory((prev) => {
        const updated = [...prev];
        updated[historyIndex] = { ...updated[historyIndex], ...updates };
        return updated;
      });
      return;
    }

    throw new Error(`Delivery with id ${id} not found`);
  }, [pending, history]);

  /**
   * Marca delivery como pagado (pending_cod → paid)
   * Mueve de pending[] a history[]
   */
  const markAsPaid = useCallback((id: string): void => {
    const delivery = pending.find((d) => d.id === id);
    if (!delivery) {
      throw new Error(`Delivery with id ${id} not found in pending`);
    }

    // Actualizar delivery
    const updatedDelivery: DeliveryEntry = {
      ...delivery,
      status: 'paid',
      paidAt: new Date().toISOString(),
    };

    // Remover de pending
    setPending((prev) => prev.filter((d) => d.id !== id));

    // Agregar a history
    setHistory((prev) => [updatedDelivery, ...prev]);
  }, [pending]);

  /**
   * Marca delivery como deducido del corte de caja (establece deductedAt)
   * NO cambia status — delivery sigue como pending_cod para gestión manual
   *
   * @remarks
   * - 🤖 [IA] - v3.5.2: Prevención doble deducción
   * - Solo establece deductedAt timestamp, sin mover entre arrays
   * - calculateSicarAdjusted filtra por !deductedAt para evitar doble resta
   */
  const markAsDeducted = useCallback((id: string): void => {
    const delivery = pending.find((d) => d.id === id);
    if (!delivery) {
      throw new Error(`Delivery with id ${id} not found in pending`);
    }

    setPending((prev) =>
      prev.map((d) =>
        d.id === id ? { ...d, deductedAt: new Date().toISOString() } : d
      )
    );
  }, [pending]);

  /**
   * Cancela delivery (pending_cod → cancelled)
   * Mueve de pending[] a history[]
   */
  const cancelDelivery = useCallback((id: string, reason: string): void => {
    if (reason.length > DELIVERY_VALIDATION.MAX_CANCEL_REASON_LENGTH) {
      throw new Error(`cancelReason no puede exceder ${DELIVERY_VALIDATION.MAX_CANCEL_REASON_LENGTH} caracteres`);
    }

    const delivery = pending.find((d) => d.id === id);
    if (!delivery) {
      throw new Error(`Delivery with id ${id} not found in pending`);
    }

    // Actualizar delivery
    const updatedDelivery: DeliveryEntry = {
      ...delivery,
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      cancelReason: reason.trim(),
    };

    // Remover de pending
    setPending((prev) => prev.filter((d) => d.id !== id));

    // Agregar a history
    setHistory((prev) => [updatedDelivery, ...prev]);
  }, [pending]);

  /**
   * Rechaza delivery (pending_cod → rejected)
   * Mueve de pending[] a history[]
   */
  const rejectDelivery = useCallback((id: string, reason: string): void => {
    if (reason.length > DELIVERY_VALIDATION.MAX_CANCEL_REASON_LENGTH) {
      throw new Error(`cancelReason no puede exceder ${DELIVERY_VALIDATION.MAX_CANCEL_REASON_LENGTH} caracteres`);
    }

    const delivery = pending.find((d) => d.id === id);
    if (!delivery) {
      throw new Error(`Delivery with id ${id} not found in pending`);
    }

    // Actualizar delivery
    const updatedDelivery: DeliveryEntry = {
      ...delivery,
      status: 'rejected',
      cancelledAt: new Date().toISOString(),
      cancelReason: reason.trim(),
    };

    // Remover de pending
    setPending((prev) => prev.filter((d) => d.id !== id));

    // Agregar a history
    setHistory((prev) => [updatedDelivery, ...prev]);
  }, [pending]);

  // ═══════════════════════════════════════════════════════════
  // QUERIES
  // ═══════════════════════════════════════════════════════════

  const getDeliveryById = useCallback(
    (id: string): DeliveryEntry | undefined => {
      return pending.find((d) => d.id === id) || history.find((d) => d.id === id);
    },
    [pending, history]
  );

  const filterPending = useCallback(
    (predicate: (d: DeliveryEntry) => boolean): DeliveryEntry[] => {
      return pending.filter(predicate);
    },
    [pending]
  );

  const filterHistory = useCallback(
    (predicate: (d: DeliveryEntry) => boolean): DeliveryEntry[] => {
      return history.filter(predicate);
    },
    [history]
  );

  // ═══════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════

  const cleanupHistory = useCallback((): void => {
    const cutoffDate = Date.now() - DELIVERY_CONFIG.HISTORY_RETENTION_DAYS * 86400000;

    setHistory((prevHistory) =>
      prevHistory.filter((d) => {
        const createdTimestamp = Date.parse(d.createdAt);
        return createdTimestamp > cutoffDate;
      })
    );
  }, []);

  const refresh = useCallback((): void => {
    const loadedPending = loadFromStorage(STORAGE_KEYS.PENDING);
    const loadedHistory = loadFromStorage(STORAGE_KEYS.HISTORY);

    setPending(loadedPending);
    setHistory(loadedHistory);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════

  return {
    // State
    pending,
    history,
    isLoading,
    error,

    // CRUD
    createDelivery,
    updateDelivery,
    markAsPaid,
    markAsDeducted,
    cancelDelivery,
    rejectDelivery,

    // Queries
    getDeliveryById,
    filterPending,
    filterHistory,

    // Utilities
    cleanupHistory,
    refresh,
  };
}
