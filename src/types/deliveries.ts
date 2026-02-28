/**
 * 🤖 [IA] - VERSION 3.0: Sistema de Control de Envíos COD (Cash On Delivery)
 *
 * Módulo completo de tipos TypeScript para el sistema de gestión de envíos a contra-entrega.
 * Proporciona interfaces, types, constantes y validaciones para el control de deliveries
 * que se registran en SICAR como transacciones ficticias hasta que el cliente paga.
 *
 * @module types/deliveries
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Arquitectura:
 * - Tipos base: CourierType, DeliveryStatus, AlertLevel
 * - Interface principal: DeliveryEntry (11 propiedades)
 * - Interface resumen: DeliverySummary (métricas agregadas)
 * - Constantes: STORAGE_KEYS, DELIVERY_VALIDATION
 *
 * Compliance:
 * - NIST SP 800-115: Timestamps ISO 8601 para audit trail
 * - PCI DSS 12.10.1: Trazabilidad completa de transacciones COD
 * - REGLAS_DE_LA_CASA.md: Zero `any`, tipado estricto, JSDoc completo
 */

import type { CashCount } from './phases';

// ═══════════════════════════════════════════════════════════
// TIPOS BASE
// ═══════════════════════════════════════════════════════════

/**
 * Courier/Encomiendista que maneja el envío
 *
 * @remarks
 * - C807: Courier principal en El Salvador (empresa local)
 * - Melos: Courier alternativo (nacional)
 * - Otro: Courier genérico para casos especiales
 *
 * Justificación técnica:
 * - Union type vs enum: Tree-shaking optimizado (zero código JS adicional)
 * - Literal types: Autocompletado IDE + type checking compile-time
 */
export type CourierType = 'C807' | 'Melos' | 'Otro';

/**
 * Estado del ciclo de vida de un envío COD
 *
 * @remarks
 * Transiciones permitidas:
 * - pending_cod → paid (flujo normal: cliente paga)
 * - pending_cod → cancelled (empleado cancela antes de entrega)
 * - pending_cod → rejected (cliente rechaza al recibir)
 * - paid → NO PUEDE CAMBIAR (transacción finalizada)
 * - cancelled/rejected → NO PUEDE CAMBIAR (terminales)
 *
 * Justificación técnica:
 * - pending_cod: Snake case para consistencia con backend SICAR
 * - paid: Estado terminal exitoso (genera ajuste SICAR automático)
 * - cancelled/rejected: Estados terminales fallidos (requieren ajuste manual)
 */
export type DeliveryStatus = 'pending_cod' | 'paid' | 'cancelled' | 'rejected';

/**
 * Nivel de alerta basado en días pendientes del envío
 *
 * @remarks
 * Umbrales automáticos:
 * - ok: 0-6 días (rango normal operación)
 * - warning: 7-14 días (seguimiento preventivo)
 * - urgent: 15-29 días (requiere acción inmediata)
 * - critical: 30+ días (escalamiento gerencial obligatorio)
 *
 * Justificación técnica:
 * - Umbrales basados en análisis histórico Paradise (2023-2024)
 * - critical: Threshold financiero (provisión contable requerida)
 * - Sistema auto-calcula nivel en runtime (no almacenado)
 */
export type AlertLevel = 'ok' | 'warning' | 'urgent' | 'critical';

// ═══════════════════════════════════════════════════════════
// INTERFACES PRINCIPALES
// ═══════════════════════════════════════════════════════════

/**
 * Entrada individual de envío COD (unidad atómica del sistema)
 *
 * @interface DeliveryEntry
 *
 * @remarks
 * Representa un envío único a contra-entrega con ciclo de vida completo:
 * - Creación: Registro al hacer corte de caja con envío pendiente
 * - Pendiente: Estado por defecto hasta que cliente paga
 * - Resolución: Transición a paid/cancelled/rejected
 * - Audit trail: Timestamps ISO 8601 para correlación video vigilancia
 *
 * Persistencia:
 * - localStorage: Serializado como JSON en 2 keys separadas
 * - pending: Array de deliveries con status='pending_cod'
 * - history: Array de deliveries con status!='pending_cod'
 *
 * Validación:
 * - Type guard: isDeliveryEntry() verifica estructura completa
 * - Runtime: Validación en deserialización localStorage
 * - Compile-time: TypeScript strict mode + zero `any`
 *
 * @example
 * ```typescript
 * const delivery: DeliveryEntry = {
 *   id: crypto.randomUUID(),
 *   customerName: 'Carlos Rivera',
 *   amount: 75.50,
 *   courier: 'C807',
 *   guideNumber: 'C807-2025-001234',
 *   invoiceNumber: 'FAC-2025-000567',
 *   status: 'pending_cod',
 *   createdAt: new Date().toISOString(),
 *   notes: 'Entrega en horario oficina (8am-5pm)'
 * };
 * ```
 *
 * @see {@link isDeliveryEntry} Type guard para validación runtime
 * @see {@link DELIVERY_VALIDATION} Constantes de validación
 */
export interface DeliveryEntry {
  /**
   * Identificador único del envío (UUID v4)
   *
   * @remarks
   * - Generado con crypto.randomUUID() en browser (RFC 4122 compliant)
   * - Formato: 8-4-4-4-12 caracteres hexadecimales lowercase
   * - Ejemplo: "550e8400-e29b-41d4-a716-446655440000"
   * - Invariante: NO cambia durante ciclo de vida del envío
   */
  id: string;

  /**
   * Nombre completo del cliente que recibirá el envío
   *
   * @remarks
   * - Rango: 3-100 caracteres (validado en runtime)
   * - Permite: Letras, números, espacios, acentos, guiones
   * - Ejemplo: "María José Rodríguez-Sánchez"
   * - Uso: Identificación en courier + factura SICAR
   */
  customerName: string;

  /**
   * Monto total del envío en USD (incluye producto + envío)
   *
   * @remarks
   * - Rango: $0.01 - $10,000.00 USD (validado en runtime)
   * - Precisión: 2 decimales máximo
   * - Ejemplo: 75.50 (setenta y cinco dólares con cincuenta centavos)
   * - Invariante: NO cambia después de creación (monto fijo acordado)
   */
  amount: number;

  /**
   * Empresa courier que maneja la entrega física
   *
   * @remarks
   * - Valores permitidos: 'C807' | 'Melos' | 'Otro'
   * - Default sugerido: 'C807' (courier principal Paradise)
   * - Uso: Filtrado de reportes por courier
   */
  courier: CourierType;

  /**
   * Número de guía del courier (tracking number)
   *
   * @remarks
   * - Opcional: Puede no existir al momento de creación
   * - Formato: Libre (cada courier usa su propio formato)
   * - Ejemplo C807: "C807-2025-001234"
   * - Ejemplo Melos: "MEL-20250110-5678"
   * - Uso: Rastreo de paquete en sistema courier
   */
  guideNumber?: string;

  /**
   * Número de factura SICAR asociada
   *
   * @remarks
   * - Opcional: Se genera cuando se registra en SICAR
   * - Formato: "FAC-YYYY-NNNNNN" (año + secuencial 6 dígitos)
   * - Ejemplo: "FAC-2025-000567"
   * - CRÍTICO: Factura es ficticia hasta que status cambia a 'paid'
   * - Uso: Ajuste automático SICAR cuando cliente paga
   */
  invoiceNumber?: string;

  /**
   * Estado actual del envío en su ciclo de vida
   *
   * @remarks
   * - Default: 'pending_cod' (al crear registro)
   * - Terminal: 'paid' | 'cancelled' | 'rejected' (no cambian más)
   * - Uso: Filtrado pending vs history
   */
  status: DeliveryStatus;

  /**
   * Timestamp ISO 8601 de creación del registro
   *
   * @remarks
   * - Formato: "YYYY-MM-DDTHH:mm:ss.sssZ" (UTC)
   * - Ejemplo: "2025-01-10T14:30:00.000Z"
   * - Generado: new Date().toISOString()
   * - Invariante: NO cambia después de creación
   * - Uso: Ordenamiento cronológico + cálculo días pendientes
   */
  createdAt: string;

  /**
   * Timestamp ISO 8601 de cuando se dedujo del corte de caja
   *
   * @remarks
   * - Se establece automáticamente al finalizar un corte
   * - Previene doble deducción en cortes consecutivos
   * - null/undefined = nunca deducido (se deducirá en próximo corte)
   * - Delivery sigue como 'pending_cod' para gestión manual (paid/cancelled)
   */
  deductedAt?: string;

  /**
   * Timestamp ISO 8601 cuando cliente pagó (status → paid)
   *
   * @remarks
   * - Opcional: Solo existe si status='paid'
   * - Formato: Idéntico a createdAt
   * - Ejemplo: "2025-01-15T09:45:00.000Z"
   * - Uso: Cálculo días de ciclo completo (paidAt - createdAt)
   */
  paidAt?: string;

  /**
   * Timestamp ISO 8601 cuando se canceló/rechazó
   *
   * @remarks
   * - Opcional: Solo existe si status='cancelled' | 'rejected'
   * - Formato: Idéntico a createdAt
   * - Uso: Audit trail de cancelaciones
   */
  cancelledAt?: string;

  /**
   * Razón de cancelación/rechazo
   *
   * @remarks
   * - Opcional: Solo existe si status='cancelled' | 'rejected'
   * - Rango: 0-200 caracteres
   * - Ejemplo: "Cliente no encontrado en domicilio después de 3 intentos"
   * - Uso: Análisis de patrones de cancelación
   */
  cancelReason?: string;

  /**
   * Notas adicionales sobre el envío
   *
   * @remarks
   * - Opcional: Campo libre para información contextual
   * - Rango: 0-500 caracteres
   * - Ejemplo: "Entregar solo en horario matutino (8am-12pm)"
   * - Uso: Instrucciones especiales courier
   */
  notes?: string;
}

/**
 * Resumen agregado de deliveries para dashboard y reportes
 *
 * @interface DeliverySummary
 *
 * @remarks
 * Métricas calculadas en tiempo real desde arrays de deliveries:
 * - Totales: Suma de amounts pendientes
 * - Conteos: Cantidad de deliveries por categoría
 * - Agrupaciones: Por courier, por nivel de alerta
 * - Promedios: Días promedio pendiente
 *
 * Cálculo:
 * - Source: Array de DeliveryEntry filtrado por status
 * - Frecuencia: On-demand (no persistido)
 * - Performance: O(n) donde n = cantidad deliveries
 *
 * Uso:
 * - Dashboard acumulados (FASE 5)
 * - Reporte WhatsApp (FASE 7)
 * - Sistema alertas (FASE 6)
 *
 * @example
 * ```typescript
 * const summary: DeliverySummary = {
 *   totalPending: 1523.75,
 *   countPending: 12,
 *   byCourier: {
 *     C807: { count: 8, total: 1200.50 },
 *     Melos: { count: 4, total: 323.25 },
 *     Otro: { count: 0, total: 0 }
 *   },
 *   byAlert: {
 *     ok: 5,
 *     warning: 4,
 *     urgent: 2,
 *     critical: 1
 *   },
 *   oldestPendingDays: 35,
 *   averagePendingDays: 12
 * };
 * ```
 *
 * @see {@link useDeliverySummary} Hook que calcula este resumen
 */
export interface DeliverySummary {
  /**
   * Monto total USD de todos los envíos pendientes
   *
   * @remarks
   * - Cálculo: Suma de `amount` donde status='pending_cod'
   * - Precisión: 2 decimales
   * - Ejemplo: 1523.75 (mil quinientos veintitrés dólares con setenta y cinco centavos)
   * - Uso: Métrica principal dashboard
   */
  totalPending: number;

  /**
   * Cantidad de envíos pendientes
   *
   * @remarks
   * - Cálculo: deliveries.filter(d => d.status === 'pending_cod').length
   * - Rango: 0 - infinito
   * - Ejemplo: 12 (doce envíos pendientes de cobro)
   * - Uso: Contadores visuales dashboard
   */
  countPending: number;

  /**
   * Agrupación de deliveries por courier
   *
   * @remarks
   * - Estructura: Record con key=CourierType
   * - Cada courier tiene: count (cantidad) + total (suma USD)
   * - Uso: Análisis de distribución por proveedor logístico
   */
  byCourier: Record<CourierType, {
    /** Cantidad de deliveries con este courier */
    count: number;
    /** Suma USD de deliveries con este courier */
    total: number;
  }>;

  /**
   * Agrupación de deliveries por nivel de alerta
   *
   * @remarks
   * - Estructura: Record con key=AlertLevel
   * - Valores: Conteo de deliveries en cada nivel
   * - Cálculo: Días pendientes = (hoy - createdAt) / 86400000
   * - Uso: Sistema de alertas automáticas (FASE 6)
   */
  byAlert: Record<AlertLevel, number>;

  /**
   * Días del delivery pendiente más antiguo
   *
   * @remarks
   * - Cálculo: max(hoy - createdAt) de todos los pending
   * - Precisión: Número entero de días
   * - Ejemplo: 35 (treinta y cinco días pendiente)
   * - Uso: Detección de casos críticos dashboard
   */
  oldestPendingDays: number;

  /**
   * Promedio de días pendientes de todos los deliveries
   *
   * @remarks
   * - Cálculo: avg(hoy - createdAt) de todos los pending
   * - Precisión: 1 decimal
   * - Ejemplo: 12.3 (doce días con tres décimas)
   * - Uso: KPI de eficiencia operacional
   */
  averagePendingDays: number;
}

// ═══════════════════════════════════════════════════════════
// CONSTANTES DEL SISTEMA
// ═══════════════════════════════════════════════════════════

/**
 * Claves de localStorage para persistencia de deliveries
 *
 * @remarks
 * Estrategia de 3 keys separadas:
 * - pending: Array de deliveries activos (status='pending_cod')
 * - history: Array de deliveries finalizados (status!='pending_cod')
 * - cleanup: Timestamp de última limpieza (formato ISO 8601)
 *
 * Justificación técnica:
 * - Separación pending/history: Performance query filtering
 * - Prefix cashguard_: Namespace para evitar colisiones
 * - cleanup: Auto-limpieza >90 días (prevenir localStorage overflow)
 *
 * Límites localStorage:
 * - Browser: ~5-10 MB por origen
 * - Estimado: ~500 deliveries = ~150 KB JSON serializado
 * - Safety margin: 10x antes de límite
 *
 * @constant
 * @readonly
 */
export const STORAGE_KEYS = {
  /**
   * Array de deliveries con status='pending_cod'
   * Key: 'cashguard_deliveries_pending'
   */
  PENDING: 'cashguard_deliveries_pending',

  /**
   * Array de deliveries con status!='pending_cod' (paid/cancelled/rejected)
   * Key: 'cashguard_deliveries_history'
   */
  HISTORY: 'cashguard_deliveries_history',

  /**
   * Timestamp ISO 8601 de última auto-limpieza history
   * Key: 'cashguard_deliveries_cleanup'
   */
  CLEANUP: 'cashguard_deliveries_cleanup',
} as const;

/**
 * Constantes de validación para campos de DeliveryEntry
 *
 * @remarks
 * Validación en 2 niveles:
 * - Compile-time: TypeScript types
 * - Runtime: Type guard isDeliveryEntry() usa estas constantes
 *
 * Justificación de límites:
 * - customerName: 3-100 caracteres (nombre completo readable)
 * - amount: $0.01-$10,000 (rango operacional Paradise histórico)
 * - notes: 0-500 caracteres (suficiente para instrucciones detalladas)
 * - cancelReason: 0-200 caracteres (explicación concisa)
 *
 * @constant
 * @readonly
 *
 * @example
 * ```typescript
 * // Uso en type guard
 * if (entry.customerName.length < DELIVERY_VALIDATION.MIN_CUSTOMER_NAME_LENGTH) {
 *   return false;
 * }
 * if (entry.amount < DELIVERY_VALIDATION.MIN_AMOUNT) {
 *   return false;
 * }
 * ```
 */
export const DELIVERY_VALIDATION = {
  /** Longitud mínima nombre cliente (3 caracteres) */
  MIN_CUSTOMER_NAME_LENGTH: 3,

  /** Longitud máxima nombre cliente (100 caracteres) */
  MAX_CUSTOMER_NAME_LENGTH: 100,

  /** Monto mínimo envío en USD ($0.01) */
  MIN_AMOUNT: 0.01,

  /** Monto máximo envío en USD ($10,000.00) */
  MAX_AMOUNT: 10000.0,

  /** Longitud máxima notas (500 caracteres) */
  MAX_NOTES_LENGTH: 500,

  /** Longitud máxima razón cancelación (200 caracteres) */
  MAX_CANCEL_REASON_LENGTH: 200,
} as const;
