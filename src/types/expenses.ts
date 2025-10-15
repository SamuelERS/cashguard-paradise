// > [IA] - v1.4.0: Sistema de Gastos de Caja - Types y validaciones
// Previous: N/A (archivo nuevo)
// Objetivo: Definir interfaces, types, guards y constantes para gesti�n de gastos operacionales

/**
 * @fileoverview Sistema de Gastos de Caja - Definiciones TypeScript
 * @module types/expenses
 * @version 1.4.0
 *
 * @description
 * Este m�dulo define los tipos TypeScript para el sistema de registro de gastos operacionales.
 * Los gastos se registran ANTES del conteo de caja (Step 6 del wizard) y afectan el c�lculo final.
 *
 * @compliance REGLAS_DE_LA_CASA.md
 * - Zero `any` types (l�nea 85-90)
 * - 100% test coverage para l�gica financiera
 * - TSDoc completo en todas las interfaces p�blicas
 *
 * @see /Documentos_MarkDown/Planes_de_Desarrollos/Caso_Gastos_Caja/Fase_1_Tipos_TypeScript.md
 */

/**
 * Representa un gasto operacional del día registrado ANTES del conteo de caja.
 *
 * @remarks
 * Los gastos se registran en Step 6 del InitialWizardModal (después de ingresar venta esperada SICAR,
 * antes de iniciar el conteo físico de denominaciones).
 *
 * **Impacto en Cálculos Financieros:**
 * - Ecuación original: `difference = totalGeneral - expectedSales`
 * - Ecuación con gastos: `totalAdjusted = totalGeneral - totalExpenses`
 * - Diferencia final: `difference = totalAdjusted - expectedSales`
 *
 * **Compliance Fiscal:**
 * - Campo `hasInvoice` obligatorio para auditoría
 * - Timestamp ISO 8601 para trazabilidad completa
 * - Monto con máximo 2 decimales (validación USD)
 *
 * **Persistencia:**
 * - Almacenado en localStorage bajo key `cashguard_daily_expenses`
 * - Limpieza automática al completar Phase 3 (reporte final)
 * - Serialización/deserialización con `JSON.stringify()`/`JSON.parse()`
 *
 * @example
 * ```typescript
 * const expense: DailyExpense = {
 *   id: crypto.randomUUID(),
 *   concept: "Suministros de limpieza",
 *   amount: 15.50,
 *   category: "supplies",
 *   hasInvoice: true,
 *   timestamp: new Date().toISOString()
 * };
 * ```
 *
 * @see ExpenseCategory Para lista completa de categorías válidas
 * @see isDailyExpense Para validación runtime de objetos
 * @see EXPENSE_VALIDATION Para límites de validación
 */
export interface DailyExpense {
  /**
   * Identificador único del gasto (UUID v4).
   *
   * @remarks
   * Generado con `crypto.randomUUID()` para garantizar unicidad global.
   * No reutilizable entre sesiones (cada registro nuevo requiere nuevo UUID).
   *
   * @example "a1b2c3d4-e5f6-47a8-b9c0-d1e2f3a4b5c6"
   */
  id: string;

  /**
   * Descripción textual del gasto (3-100 caracteres).
   *
   * @remarks
   * - Debe ser descriptiva y concisa (ej: "Transporte urgente proveedor", "Papel higiénico")
   * - Aparece en reporte WhatsApp final
   * - Validación: longitud mínima 3 caracteres, máxima 100 caracteres
   *
   * @example "Suministros de limpieza"
   * @example "Reparación caja registradora"
   */
  concept: string;

  /**
   * Monto del gasto en USD (0.01 - 10,000.00).
   *
   * @remarks
   * - Debe ser positivo (> 0)
   * - Máximo 2 decimales (validación USD)
   * - Rango permitido: $0.01 - $10,000.00
   * - Afecta directamente el cálculo: `totalAdjusted = totalGeneral - sum(expenses)`
   *
   * @example 15.50  // Válido
   * @example 0.01   // Válido (mínimo)
   * @example 10000  // Válido (máximo)
   * @example 0      // ❌ Inválido (debe ser > 0)
   * @example 15.555 // ❌ Inválido (más de 2 decimales)
   */
  amount: number;

  /**
   * Categoría del gasto para clasificación y reportería.
   *
   * @remarks
   * Usado para:
   * - Agrupación en reporte WhatsApp
   * - Análisis de gastos por categoría
   * - Emojis visuales en UI (ver EXPENSE_CATEGORY_EMOJI)
   *
   * @see ExpenseCategory Para lista completa de valores válidos
   */
  category: ExpenseCategory;

  /**
   * Indica si el gasto tiene factura física (compliance fiscal).
   *
   * @remarks
   * - `true`: Gasto tiene factura respaldatoria
   * - `false`: Gasto sin factura (puede requerir justificación)
   * - Reportado en sección de gastos con emoji visual (📄/❌)
   * - Crítico para auditorías contables
   */
  hasInvoice: boolean;

  /**
   * Timestamp de registro en formato ISO 8601 (zona UTC).
   *
   * @remarks
   * - Generado con `new Date().toISOString()`
   * - Formato: "YYYY-MM-DDTHH:mm:ss.sssZ"
   * - Usado para:
   *   - Ordenamiento cronológico en reporte
   *   - Correlación con video vigilancia (CCTV)
   *   - Trazabilidad completa de auditoría
   *
   * @example "2025-10-13T19:45:32.123Z"
   */
  timestamp: string;
}

/**
 * Categorías de gastos operacionales para clasificación y reportería.
 *
 * @remarks
 * Se usa union type (en lugar de enum) por las siguientes razones técnicas:
 * - **Tree-shaking:** Union types no generan código JavaScript adicional
 * - **Type safety:** TypeScript valida en compile-time, no runtime
 * - **Immutability:** Valores literales no pueden ser modificados
 * - **Pattern moderno:** Recomendado por TypeScript team (2020+)
 *
 * **Uso en UI:**
 * - Cada categoría tiene emoji asociado (ver EXPENSE_CATEGORY_EMOJI)
 * - Labels en español (ver EXPENSE_CATEGORY_LABEL)
 * - Colores visuales por severidad (operational = azul, supplies = verde, etc.)
 *
 * **Reporte WhatsApp:**
 * ```
 * 💰 GASTOS DEL DÍA ($45.50):
 *
 * ⚙️ Operacional: $20.00
 *    • Reparación urgente caja registradora ($20.00) 📄
 *
 * 🧹 Suministros: $15.50
 *    • Papel higiénico y jabón ($15.50) ❌
 *
 * 📋 Otros: $10.00
 *    • Varios menores ($10.00) 📄
 * ```
 *
 * @example
 * ```typescript
 * const category: ExpenseCategory = 'operational'; // ✅ Válido
 * const invalid: ExpenseCategory = 'invalid';      // ❌ Error TypeScript
 * ```
 */
// 🤖 [IA] - v2.5: Categorías personalizadas Paradise Acuarios
export type ExpenseCategory =
  | 'employees'        // 💰 Empleados (pagos, adelantos, semanales)
  | 'supplies'         // 📦 Insumos Operativos (bolsas, materiales despacho)
  | 'maintenance'      // 🔧 Mantenimiento (ferretería, reparaciones)
  | 'shipping'         // 🚚 Envíos (encomendistas, delivery)
  | 'small_purchases'  // 🛒 Compras Menores (proveedores pequeños)
  | 'other';           // 📋 Otros (imprevistos varios)

/**
 * Type guard para validar si un objeto desconocido es un DailyExpense válido en runtime.
 *
 * @remarks
 * Esta función es CRÍTICA para:
 * - **Deserialización localStorage:** Validar datos antes de `JSON.parse()`
 * - **API boundaries:** Validar datos provenientes de fuentes externas
 * - **Type narrowing:** Permitir a TypeScript inferir tipo correcto
 * - **Error prevention:** Detectar datos corruptos antes de usarlos
 *
 * **Validaciones Implementadas:**
 * 1. ✅ Estructura básica (6 propiedades con tipos correctos)
 * 2. ✅ Categoría dentro de valores válidos (5 literales)
 * 3. ✅ Monto positivo y no NaN
 * 4. ✅ Timestamp válido ISO 8601 (parseable con `new Date()`)
 *
 * **Pattern:**
 * ```typescript
 * function myFunc(obj: unknown): void {
 *   if (isDailyExpense(obj)) {
 *     // TypeScript sabe que obj es DailyExpense aquí
 *     console.log(obj.concept); // ✅ Válido
 *   }
 * }
 * ```
 *
 * **Ejemplo localStorage:**
 * ```typescript
 * const stored = localStorage.getItem('cashguard_daily_expenses');
 * if (stored) {
 *   const parsed = JSON.parse(stored);
 *   if (Array.isArray(parsed) && parsed.every(isDailyExpense)) {
 *     // ✅ Todos los elementos son DailyExpense válidos
 *     const expenses: DailyExpense[] = parsed;
 *   }
 * }
 * ```
 *
 * @param obj - Objeto desconocido a validar
 * @returns `true` si el objeto es un DailyExpense válido, `false` en caso contrario
 *
 * @see DailyExpense Para estructura completa del interface
 * @see EXPENSE_VALIDATION Para constantes de validación usadas
 */
export function isDailyExpense(obj: unknown): obj is DailyExpense {
  // Validación nivel 1: Verificar que es un objeto no-null
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  // Type assertion segura después de validar que es objeto
  const expense = obj as Record<string, unknown>;

  // Validación nivel 2: Verificar presencia y tipo de TODAS las propiedades requeridas
  if (typeof expense.id !== 'string') return false;
  if (typeof expense.concept !== 'string') return false;
  if (typeof expense.amount !== 'number') return false;
  if (typeof expense.category !== 'string') return false;
  if (typeof expense.hasInvoice !== 'boolean') return false;
  if (typeof expense.timestamp !== 'string') return false;

  // Validación nivel 3: Verificar que category es uno de los valores válidos
  // 🤖 [IA] - v2.5: Categorías actualizadas Paradise Acuarios
  const validCategories: ExpenseCategory[] = [
    'employees',
    'supplies',
    'maintenance',
    'shipping',
    'small_purchases',
    'other'
  ];
  if (!validCategories.includes(expense.category as ExpenseCategory)) {
    return false;
  }

  // Validación nivel 4: Verificar que amount es positivo y no NaN
  if (expense.amount <= 0 || isNaN(expense.amount)) {
    return false;
  }

  // Validación nivel 5: Verificar que timestamp es ISO 8601 válido
  const date = new Date(expense.timestamp);
  if (isNaN(date.getTime())) {
    return false;
  }

  // ✅ Todas las validaciones pasaron - objeto es DailyExpense válido
  return true;
}

/**
 * Constantes de validación para campos de DailyExpense.
 *
 * @remarks
 * Usado en:
 * - Formularios UI (validación client-side)
 * - Type guard `isDailyExpense()` (validación runtime)
 * - Tests (casos edge y boundary testing)
 *
 * **Justificación de Límites:**
 * - `MIN_CONCEPT_LENGTH = 3`: Evita inputs vacíos o demasiado vagos ("Xyz")
 * - `MAX_CONCEPT_LENGTH = 100`: Balance entre descriptividad y brevedad reporte
 * - `MIN_AMOUNT = 0.01`: Monto mínimo representable en USD (1 centavo)
 * - `MAX_AMOUNT = 10000`: Límite razonable gastos operacionales diarios (escalable)
 * - `DECIMAL_PLACES = 2`: Estándar USD (centavos)
 *
 * @example
 * ```typescript
 * // En formulario:
 * if (concept.length < EXPENSE_VALIDATION.MIN_CONCEPT_LENGTH) {
 *   setError('Descripción muy corta (mínimo 3 caracteres)');
 * }
 *
 * // En type guard (futuro enhancement):
 * if (expense.concept.length < EXPENSE_VALIDATION.MIN_CONCEPT_LENGTH) {
 *   return false;
 * }
 * ```
 */
export const EXPENSE_VALIDATION = {
  /** Longitud mínima del concepto (3 caracteres) */
  MIN_CONCEPT_LENGTH: 3,

  /** Longitud máxima del concepto (100 caracteres) */
  MAX_CONCEPT_LENGTH: 100,

  /** Monto mínimo permitido en USD ($0.01 = 1 centavo) */
  MIN_AMOUNT: 0.01,

  /** Monto máximo permitido en USD ($10,000.00) */
  MAX_AMOUNT: 10000,

  /** Número de decimales permitidos para montos USD (2 = centavos) */
  DECIMAL_PLACES: 2,
} as const;

/**
 * Mapping de categorías de gastos a emojis visuales para UI y reportes.
 *
 * @remarks
 * Los emojis se usan en:
 * - **UI de gestión de gastos:** Select de categorías con emojis visuales
 * - **Reporte WhatsApp:** Agrupación visual de gastos por categoría
 * - **Alertas visuales:** Identificación rápida de tipo de gasto
 *
 * **Selección de Emojis (v2.5 - Paradise Acuarios):**
 * - 💰 `employees`: Pagos y adelantos a empleados
 * - 📦 `supplies`: Insumos operativos (bolsas, materiales)
 * - 🔧 `maintenance`: Mantenimiento y ferretería
 * - 🚚 `shipping`: Envíos y encomendistas
 * - 🛒 `small_purchases`: Compras menores a proveedores
 * - 📋 `other`: Clipboard genérico para misceláneos
 *
 * @example
 * ```typescript
 * const emoji = EXPENSE_CATEGORY_EMOJI['supplies']; // "📦"
 *
 * // En componente React:
 * <Select>
 *   {Object.entries(EXPENSE_CATEGORY_EMOJI).map(([category, emoji]) => (
 *     <option key={category} value={category}>
 *       {emoji} {EXPENSE_CATEGORY_LABEL[category as ExpenseCategory]}
 *     </option>
 *   ))}
 * </Select>
 * ```
 */
// 🤖 [IA] - v2.5: Emojis actualizados Paradise Acuarios
export const EXPENSE_CATEGORY_EMOJI: Record<ExpenseCategory, string> = {
  employees: '💰',
  supplies: '📦',
  maintenance: '🔧',
  shipping: '🚚',
  small_purchases: '🛒',
  other: '📋',
} as const;

/**
 * Mapping de categorías de gastos a labels en español para UI.
 *
 * @remarks
 * Labels diseñados para:
 * - **Claridad:** Nombres descriptivos que usuarios finales entienden inmediatamente
 * - **Brevedad:** Máximo 18 caracteres para caber en UI móvil
 * - **Especificidad:** Adaptados a operaciones Paradise Acuarios
 *
 * **Uso en Componentes:**
 * ```tsx
 * <Select>
 *   {Object.entries(EXPENSE_CATEGORY_LABEL).map(([category, label]) => (
 *     <SelectItem key={category} value={category}>
 *       {EXPENSE_CATEGORY_EMOJI[category as ExpenseCategory]} {label}
 *     </SelectItem>
 *   ))}
 * </Select>
 * ```
 *
 * **Resultado Visual (v2.5):**
 * ```
 * 💰 Empleados
 * 📦 Insumos Operativos
 * 🔧 Mantenimiento
 * 🚚 Envíos
 * 🛒 Compras Menores
 * 📋 Otros
 * ```
 *
 * @example
 * ```typescript
 * const label = EXPENSE_CATEGORY_LABEL['supplies']; // "Insumos Operativos"
 * ```
 */
// 🤖 [IA] - v2.5: Labels actualizados Paradise Acuarios
export const EXPENSE_CATEGORY_LABEL: Record<ExpenseCategory, string> = {
  employees: 'Empleados',
  supplies: 'Insumos Operativos',
  maintenance: 'Mantenimiento',
  shipping: 'Envíos',
  small_purchases: 'Compras Menores',
  other: 'Otros',
} as const;

