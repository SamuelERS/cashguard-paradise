/**
 * 🤖 [IA] - VERSION 3.0: Ajuste SICAR para Deliveries COD
 *
 * Módulo que implementa la lógica de ajuste del expectedSales (SICAR) restando
 * deliveries pendientes de cobro (contra entrega). Elimina el workaround contable
 * de registrar envíos como "efectivo" + "gasto" ficticio.
 *
 * @module utils/sicarAdjustment
 * @version 3.0.0
 * @created 2025-01-10
 *
 * Problema que resuelve:
 * - ANTES: Envío $100 → Registrar como "efectivo" (FALSO) + "gasto" $100 (FICTICIO)
 * - AHORA: Envío $100 → Restar de SICAR esperado automáticamente
 *
 * Compliance:
 * - NIST SP 800-115: Cálculos auditables con trazabilidad completa
 * - PCI DSS 12.10.1: Transacciones reales sin ficticias
 * - REGLAS_DE_LA_CASA.md: Zero `any`, funciones puras, JSDoc completo
 */

import type { DeliveryEntry } from '../types/deliveries';

// ═══════════════════════════════════════════════════════════
// INTERFAZ DE RESULTADO
// ═══════════════════════════════════════════════════════════

/**
 * Resultado del ajuste SICAR con deliveries
 *
 * @interface SicarAdjustmentResult
 *
 * @remarks
 * Retorna no solo el valor ajustado sino también desglose completo
 * para transparencia y auditoría. Permite mostrar en UI:
 * - Valor original SICAR
 * - Cuánto se restó (deliveries pendientes)
 * - Valor final ajustado
 * - Cantidad de deliveries aplicados
 *
 * @example
 * ```typescript
 * const result = calculateSicarAdjusted(2500, deliveries);
 * console.log(`SICAR original: $${result.originalExpected}`);
 * console.log(`Deliveries pendientes: -$${result.totalPendingDeliveries}`);
 * console.log(`SICAR ajustado: $${result.adjustedExpected}`);
 * ```
 */
export interface SicarAdjustmentResult {
  /**
   * Valor SICAR original sin ajustar
   *
   * @remarks
   * - Source: Input del usuario en wizard paso 5
   * - Representa: Ventas totales registradas en SICAR
   * - Incluye: Ventas efectivo + ventas electrónicas + envíos COD
   */
  originalExpected: number;

  /**
   * Total USD de deliveries pendientes de cobro
   *
   * @remarks
   * - Cálculo: Suma de `amount` donde status='pending_cod'
   * - Representa: Dinero que AÚN NO ingresó a caja
   * - Este monto se resta del expectedSales
   */
  totalPendingDeliveries: number;

  /**
   * Valor SICAR ajustado (esperado real para comparar con caja)
   *
   * @remarks
   * - Cálculo: originalExpected - totalPendingDeliveries
   * - Representa: Efectivo que REALMENTE debería estar en caja
   * - Uso: Comparar con (efectivo contado + pagos electrónicos)
   */
  adjustedExpected: number;

  /**
   * Cantidad de deliveries pendientes aplicados en el ajuste
   *
   * @remarks
   * - Útil para: Mostrar en UI cuántos envíos están pendientes
   * - Validación: Si count=0 → no hay ajuste (optimización)
   */
  pendingDeliveriesCount: number;

  /**
   * Desglose individual de cada delivery aplicado (para auditoría)
   *
   * @remarks
   * - Formato: Array de objetos {id, customerName, amount, daysOld}
   * - Uso: Mostrar detalle en reporte WhatsApp/UI
   * - Compliance: Audit trail completo NIST SP 800-115
   */
  deliveriesBreakdown: Array<{
    id: string;
    customerName: string;
    amount: number;
    courier: string;
    daysOld: number;
  }>;
}

// ═══════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════

/**
 * Calcula el SICAR ajustado restando deliveries pendientes
 *
 * @param expectedSales - Valor SICAR original (ventas totales del día)
 * @param deliveries - Array completo de deliveries (pending + history)
 * @returns Resultado con valores ajustados y desglose completo
 *
 * @remarks
 * **Lógica de Negocio:**
 * 1. Filtra solo deliveries con status='pending_cod' (activos)
 * 2. Suma los amounts de esos deliveries
 * 3. Resta ese total del expectedSales original
 * 4. Retorna resultado con desglose para auditoría
 *
 * **Caso de Uso Real:**
 * ```
 * Día: Lunes 21 Oct 2025
 * SICAR Ventas Totales: $2,500
 * - Venta efectivo: $1,200
 * - Venta electrónica: $800
 * - Envío C807 Juan Pérez: $500 (PENDIENTE cobro)
 *
 * ANTES (workaround):
 * - Registrar $500 como "efectivo" (FALSO)
 * - Crear "gasto" $500 (FICTICIO)
 * - Resultado: Reportes distorsionados
 *
 * AHORA (con ajuste):
 * - SICAR ajustado: $2,500 - $500 = $2,000
 * - Comparar $2,000 vs caja contada
 * - Resultado: Reportes precisos
 * ```
 *
 * **Validaciones:**
 * - expectedSales debe ser ≥ 0
 * - deliveries puede ser array vacío (retorna expected sin cambios)
 * - Si todos los deliveries son NO pending → ajuste = 0
 *
 * **Performance:**
 * - O(n) donde n = cantidad total deliveries
 * - Optimización: Early return si deliveries vacío
 * - Típicamente n < 50 → negligible
 *
 * @throws {Error} Si expectedSales < 0 (valor inválido)
 * @throws {Error} Si expectedSales < totalPendingDeliveries (imposible)
 *
 * @example
 * ```typescript
 * const deliveries: DeliveryEntry[] = [
 *   { id: '1', amount: 100, status: 'pending_cod', ... },
 *   { id: '2', amount: 200, status: 'pending_cod', ... },
 *   { id: '3', amount: 150, status: 'paid', ... }, // Ignorado (no pending)
 * ];
 *
 * const result = calculateSicarAdjusted(2500, deliveries);
 * // result.originalExpected: 2500
 * // result.totalPendingDeliveries: 300 (100 + 200)
 * // result.adjustedExpected: 2200 (2500 - 300)
 * // result.pendingDeliveriesCount: 2
 * ```
 *
 * @see {@link SicarAdjustmentResult} Interface de retorno
 * @see {@link DeliveryEntry} Interface de delivery
 */
export function calculateSicarAdjusted(
  expectedSales: number,
  deliveries: DeliveryEntry[]
): SicarAdjustmentResult {
  // ─────────────────────────────────────────
  // VALIDACIÓN DE ENTRADA
  // ─────────────────────────────────────────
  if (expectedSales < 0) {
    throw new Error(
      `[calculateSicarAdjusted] expectedSales no puede ser negativo: ${expectedSales}`
    );
  }

  // ─────────────────────────────────────────
  // OPTIMIZACIÓN: EARLY RETURN SI NO HAY DELIVERIES
  // ─────────────────────────────────────────
  if (!deliveries || deliveries.length === 0) {
    return {
      originalExpected: expectedSales,
      totalPendingDeliveries: 0,
      adjustedExpected: expectedSales,
      pendingDeliveriesCount: 0,
      deliveriesBreakdown: [],
    };
  }

  // ─────────────────────────────────────────
  // FILTRAR SOLO DELIVERIES PENDIENTES
  // ─────────────────────────────────────────
  // 🤖 [IA] - v3.5.2: Filtrar pending_cod SIN deductedAt (prevención doble deducción)
  const pendingDeliveries = deliveries.filter(
    (d) => d.status === 'pending_cod' && !d.deductedAt
  );

  // Si no hay pendientes, retornar sin cambios
  if (pendingDeliveries.length === 0) {
    return {
      originalExpected: expectedSales,
      totalPendingDeliveries: 0,
      adjustedExpected: expectedSales,
      pendingDeliveriesCount: 0,
      deliveriesBreakdown: [],
    };
  }

  // ─────────────────────────────────────────
  // CALCULAR TOTAL PENDIENTE Y DESGLOSE
  // ─────────────────────────────────────────
  const now = Date.now();
  let totalPendingDeliveries = 0;
  const deliveriesBreakdown = pendingDeliveries.map((d) => {
    // Calcular días pendientes
    const createdTimestamp = Date.parse(d.createdAt);
    const daysOld = Math.floor((now - createdTimestamp) / 86400000);

    // Acumular total
    totalPendingDeliveries += d.amount;

    return {
      id: d.id,
      customerName: d.customerName,
      amount: d.amount,
      courier: d.courier,
      daysOld,
    };
  });

  // ─────────────────────────────────────────
  // CALCULAR SICAR AJUSTADO
  // ─────────────────────────────────────────
  const adjustedExpected = expectedSales - totalPendingDeliveries;

  // ─────────────────────────────────────────
  // VALIDACIÓN POST-CÁLCULO
  // ─────────────────────────────────────────
  if (adjustedExpected < 0) {
    throw new Error(
      `[calculateSicarAdjusted] SICAR ajustado no puede ser negativo. ` +
        `Expected: $${expectedSales}, Deliveries: $${totalPendingDeliveries}. ` +
        `Esto indica que deliveries pendientes ($${totalPendingDeliveries}) exceden ventas totales ($${expectedSales}). ` +
        `Verificar datos de entrada.`
    );
  }

  // ─────────────────────────────────────────
  // RETORNAR RESULTADO COMPLETO
  // ─────────────────────────────────────────
  return {
    originalExpected: expectedSales,
    totalPendingDeliveries: Number(totalPendingDeliveries.toFixed(2)), // Redondear a 2 decimales
    adjustedExpected: Number(adjustedExpected.toFixed(2)), // Redondear a 2 decimales
    pendingDeliveriesCount: pendingDeliveries.length,
    deliveriesBreakdown,
  };
}

// ═══════════════════════════════════════════════════════════
// HELPER: FORMATEAR DESGLOSE PARA REPORTE WHATSAPP
// ═══════════════════════════════════════════════════════════

/**
 * Formatea desglose de deliveries para incluir en reporte WhatsApp
 *
 * @param result - Resultado de calculateSicarAdjusted
 * @param separator - Separador visual (default: '━━━━━━━━━━━━')
 * @returns String formateado para WhatsApp con emojis y estructura clara
 *
 * @remarks
 * Genera bloque de texto optimizado para WhatsApp:
 * - Usa emojis para identificación visual rápida
 * - Formato compacto para mobile (12 chars separador)
 * - Incluye días pendientes para cada delivery
 * - Total destacado al final
 *
 * @example
 * ```typescript
 * const result = calculateSicarAdjusted(2500, deliveries);
 * const whatsappBlock = formatDeliveriesForWhatsApp(result);
 * console.log(whatsappBlock);
 * // Output:
 * // ━━━━━━━━━━━━
 * // 📦 DELIVERIES PENDIENTES (3)
 * //
 * // 1. Juan Pérez - $100.00
 * //    C807 | 5 días pendiente
 * //
 * // 2. Ana Martínez - $200.00
 * //    Melos | 12 días pendiente ⚠️
 * //
 * // 3. Carlos López - $50.00
 * //    C807 | 2 días pendiente
 * //
 * // TOTAL PENDIENTE: $350.00
 * // ━━━━━━━━━━━━
 * ```
 */
export function formatDeliveriesForWhatsApp(
  result: SicarAdjustmentResult,
  separator: string = '━━━━━━━━━━━━'
): string {
  // Si no hay deliveries pendientes, retornar vacío
  if (result.pendingDeliveriesCount === 0) {
    return '';
  }

  const lines: string[] = [];

  // Header
  lines.push(separator);
  lines.push(`📦 DELIVERIES PENDIENTES (${result.pendingDeliveriesCount})`);
  lines.push('');

  // Lista de deliveries
  result.deliveriesBreakdown.forEach((delivery, index) => {
    // Número y cliente con monto
    lines.push(
      `${index + 1}. ${delivery.customerName} - $${delivery.amount.toFixed(2)}`
    );

    // Courier y días con alerta si >7 días
    const alertEmoji = delivery.daysOld >= 30 ? '🔴' : delivery.daysOld >= 15 ? '🚨' : delivery.daysOld >= 7 ? '⚠️' : '';
    const daysText = delivery.daysOld === 1 ? '1 día pendiente' : `${delivery.daysOld} días pendiente`;
    lines.push(`   ${delivery.courier} | ${daysText} ${alertEmoji}`.trim());
    lines.push('');
  });

  // Total
  lines.push(
    `TOTAL PENDIENTE: $${result.totalPendingDeliveries.toFixed(2)}`
  );
  lines.push(separator);

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════
// HELPER: FORMATEAR AJUSTE SICAR PARA REPORTE
// ═══════════════════════════════════════════════════════════

/**
 * Formatea el ajuste SICAR para mostrar en reporte WhatsApp
 *
 * @param result - Resultado de calculateSicarAdjusted
 * @returns String formateado mostrando original, ajuste y resultado
 *
 * @remarks
 * Genera líneas explicativas del ajuste SICAR:
 * - Muestra valor original claro
 * - Indica cuánto se restó (deliveries)
 * - Destaca valor ajustado final
 * - Solo se genera si hay deliveries pendientes
 *
 * @example
 * ```typescript
 * const result = calculateSicarAdjusted(2500, deliveries);
 * const adjustmentText = formatSicarAdjustment(result);
 * console.log(adjustmentText);
 * // Output:
 * // SICAR Ventas Totales: $2,500.00
 * // - Deliveries Pendientes: -$350.00
 * // = SICAR Ajustado: $2,150.00
 * ```
 */
export function formatSicarAdjustment(
  result: SicarAdjustmentResult
): string {
  // Si no hay ajuste, solo mostrar valor original
  if (result.pendingDeliveriesCount === 0) {
    return `SICAR Esperado: $${result.originalExpected.toFixed(2)}`;
  }

  const lines: string[] = [];
  lines.push(`SICAR Ventas Totales: $${result.originalExpected.toFixed(2)}`);
  lines.push(`- Deliveries Pendientes: -$${result.totalPendingDeliveries.toFixed(2)}`);
  lines.push(`= SICAR Ajustado: $${result.adjustedExpected.toFixed(2)}`);

  return lines.join('\n');
}
