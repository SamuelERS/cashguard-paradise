# 🔷 Fase 1: Tipos TypeScript

**Tiempo estimado:** 2-3 horas | **Tests:** 5-8 tests unitarios
**Prioridad:** 🔴 CRÍTICA
**Versión objetivo:** v1.4.0

---

## 📋 Índice

1. [Objetivo](#-objetivo)
2. [Interfaces a Crear](#-interfaces-a-crear)
3. [Modificaciones a Interfaces Existentes](#-modificaciones-a-interfaces-existentes)
4. [Tipos Auxiliares](#-tipos-auxiliares)
5. [Constantes de Validación](#-constantes-de-validación)
6. [Tests Unitarios](#-tests-unitarios)
7. [Checklist de Completitud](#-checklist-de-completitud)

---

## 🎯 Objetivo

Crear las definiciones de tipos TypeScript necesarias para el sistema de gastos diarios, asegurando:

- **Tipado estricto 100%** (cero `any` según REGLAS_DE_LA_CASA.md)
- **TSDoc completo** para todas las interfaces públicas
- **Validación en tiempo de compilación** de categorías y montos
- **Compatibilidad total** con sistema existente v1.3.6Y
- **Extensibilidad** para futuros campos de gastos

---

## 📐 Interfaces a Crear

### 1. Interface `DailyExpense`

**Ubicación:** `src/types/cash.ts` (después de línea 103, antes de `AlertThresholds`)

```typescript
/**
 * Representa un gasto diario registrado durante el corte de caja
 *
 * @remarks
 * Sistema de gastos v1.4.0 permite registrar gastos operativos que reducen
 * el efectivo disponible vs venta esperada SICAR. Estos gastos se restan
 * del total general ANTES de calcular diferencia vs SICAR.
 *
 * @example
 * ```typescript
 * const expense: DailyExpense = {
 *   id: crypto.randomUUID(),
 *   concept: "Compra productos limpieza",
 *   amount: 30.00,
 *   category: "SUPPLIES",
 *   hasInvoice: true,
 *   timestamp: new Date().toISOString()
 * };
 * ```
 *
 * @see {@link ExpenseCategory} para categorías disponibles
 * @see {@link CashReport.dailyExpenses} para uso en reporte final
 *
 * @since v1.4.0
 */
export interface DailyExpense {
  /**
   * Identificador único del gasto (UUID v4)
   *
   * @example "550e8400-e29b-41d4-a716-446655440000"
   */
  id: string;

  /**
   * Descripción breve del gasto (máximo 100 caracteres)
   *
   * @minLength 3
   * @maxLength 100
   * @example "Compra productos limpieza"
   */
  concept: string;

  /**
   * Monto del gasto en USD (debe ser positivo)
   *
   * @minimum 0.01
   * @maximum 10000.00
   * @example 30.00
   */
  amount: number;

  /**
   * Categoría del gasto para clasificación en reportes
   *
   * @see {@link ExpenseCategory}
   * @example "SUPPLIES"
   */
  category: ExpenseCategory;

  /**
   * Indica si el gasto tiene factura física o electrónica
   *
   * @remarks
   * Usado para auditorías - gastos sin factura requieren justificación
   * adicional en reporte de gerencia.
   *
   * @default false
   */
  hasInvoice: boolean;

  /**
   * Timestamp ISO 8601 cuando se registró el gasto
   *
   * @format ISO 8601 (YYYY-MM-DDTHH:mm:ss.sssZ)
   * @example "2025-10-11T14:30:00.000-06:00"
   */
  timestamp: string;
}
```

---

### 2. Type `ExpenseCategory`

**Ubicación:** `src/types/cash.ts` (inmediatamente antes de `DailyExpense`)

```typescript
/**
 * Categorías válidas para clasificar gastos diarios
 *
 * @remarks
 * Sistema usa 5 categorías estándar para reportes gerenciales.
 * Cada categoría tiene emoji asociado para UI y reportes WhatsApp.
 *
 * @see {@link EXPENSE_CATEGORY_METADATA} para metadata completa
 *
 * @since v1.4.0
 */
export type ExpenseCategory =
  | "SUPPLIES"        // 📦 Insumos y materiales
  | "SERVICES"        // 🔧 Servicios contratados
  | "MAINTENANCE"     // 🛠️ Mantenimiento equipos
  | "TRANSPORTATION"  // 🚗 Transporte y logística
  | "OTHER";          // 📋 Otros gastos

/**
 * Metadata de categorías de gastos con emojis y nombres en español
 *
 * @remarks
 * Usado en UI (select dropdown) y reportes WhatsApp para mostrar
 * categorías con formato consistente.
 *
 * @example
 * ```typescript
 * const categoryLabel = EXPENSE_CATEGORY_METADATA["SUPPLIES"].label;
 * // Returns: "📦 Insumos"
 * ```
 *
 * @since v1.4.0
 */
export const EXPENSE_CATEGORY_METADATA = {
  SUPPLIES: {
    emoji: "📦",
    label: "Insumos",
    description: "Productos, materiales, inventario"
  },
  SERVICES: {
    emoji: "🔧",
    label: "Servicios",
    description: "Servicios contratados (limpieza, reparaciones)"
  },
  MAINTENANCE: {
    emoji: "🛠️",
    label: "Mantenimiento",
    description: "Mantenimiento de equipos y sistemas"
  },
  TRANSPORTATION: {
    emoji: "🚗",
    label: "Transporte",
    description: "Transporte, logística, combustible"
  },
  OTHER: {
    emoji: "📋",
    label: "Otros",
    description: "Gastos que no encajan en otras categorías"
  }
} as const;
```

---

## 🔧 Modificaciones a Interfaces Existentes

### 3. Modificación `CashReport` Interface

**Ubicación:** `src/types/cash.ts` línea 43-103

**Cambios a aplicar:**

```typescript
export interface CashReport {
  id: string;
  timestamp: string;
  store: Store;
  cashier: Employee;
  witness: Employee;

  cashCount: CashCount;
  electronicPayments: ElectronicPayments;
  expectedSales: number;

  // Calculated values
  totalCash: number;
  totalElectronic: number;
  totalGeneral: number;

  // 🆕 v1.4.0: Sistema de gastos
  /**
   * Array de gastos diarios registrados durante el corte
   *
   * @remarks
   * Si no hay gastos, array estará vacío (nunca undefined).
   * Total de gastos se calcula con `calculateTotalExpenses()`.
   *
   * @see {@link DailyExpense}
   * @see {@link calculateTotalExpenses}
   *
   * @default []
   * @since v1.4.0
   */
  dailyExpenses: DailyExpense[];

  /**
   * Suma total de todos los gastos del día
   *
   * @remarks
   * Calculado automáticamente por `calculateTotalExpenses(dailyExpenses)`.
   * Si no hay gastos, valor es 0.00.
   *
   * @minimum 0.00
   * @default 0.00
   * @since v1.4.0
   */
  totalExpenses: number;

  /**
   * Total del día DESPUÉS de restar gastos
   *
   * @remarks
   * Fórmula: `totalGeneral - totalExpenses`
   * Este es el monto que se compara con SICAR para calcular diferencia.
   *
   * @example
   * ```typescript
   * // Efectivo: $950, Electrónico: $0, Gastos: $50
   * totalGeneral = $950 + $0 = $950
   * totalAdjusted = $950 - $50 = $900 ✅ Correcto
   * difference = $900 - $1000 = -$100 (faltante real)
   * ```
   *
   * @since v1.4.0
   */
  totalAdjusted: number;

  difference: number; // Ahora calculado como: totalAdjusted - expectedSales

  // ... resto de campos sin cambios
  changeForTomorrow: CashCount;
  changeTotal: number;
  isLocked: boolean;
  hasAlert: boolean;
  alertReason?: string;
  cashierSignature: string;
  witnessSignature: string;
  verificationBehavior?: { ... };
  hasVerificationWarnings: boolean;
  hasVerificationCritical: boolean;
  hasVerificationSevere: boolean;
  hasAnyDiscrepancy: boolean;
  discrepancyAmount: number;
}
```

---

## 🎨 Tipos Auxiliares

### 4. Type Guards para Validación Runtime

**Ubicación:** `src/types/cash.ts` (al final del archivo)

```typescript
/**
 * Type guard para validar si un objeto es un DailyExpense válido
 *
 * @param obj - Objeto a validar
 * @returns true si obj es DailyExpense válido
 *
 * @example
 * ```typescript
 * if (isDailyExpense(expense)) {
 *   console.log(expense.amount); // TypeScript sabe que amount existe
 * }
 * ```
 *
 * @since v1.4.0
 */
export function isDailyExpense(obj: unknown): obj is DailyExpense {
  if (!obj || typeof obj !== 'object') return false;

  const expense = obj as Partial<DailyExpense>;

  return (
    typeof expense.id === 'string' &&
    typeof expense.concept === 'string' &&
    typeof expense.amount === 'number' &&
    expense.amount > 0 &&
    typeof expense.category === 'string' &&
    ['SUPPLIES', 'SERVICES', 'MAINTENANCE', 'TRANSPORTATION', 'OTHER'].includes(expense.category) &&
    typeof expense.hasInvoice === 'boolean' &&
    typeof expense.timestamp === 'string'
  );
}

/**
 * Type guard para validar si una string es ExpenseCategory válida
 *
 * @param value - String a validar
 * @returns true si value es ExpenseCategory válida
 *
 * @example
 * ```typescript
 * const userInput = "SUPPLIES";
 * if (isExpenseCategory(userInput)) {
 *   const expense: DailyExpense = { category: userInput, ... };
 * }
 * ```
 *
 * @since v1.4.0
 */
export function isExpenseCategory(value: string): value is ExpenseCategory {
  return ['SUPPLIES', 'SERVICES', 'MAINTENANCE', 'TRANSPORTATION', 'OTHER'].includes(value);
}
```

---

## 📏 Constantes de Validación

### 5. Validation Constants

**Ubicación:** `src/types/cash.ts` (después de `DENOMINATIONS`)

```typescript
/**
 * Constantes de validación para gastos diarios
 *
 * @remarks
 * Usadas en componentes UI para validación frontend
 * y en tests para generar casos de prueba.
 *
 * @since v1.4.0
 */
export const EXPENSE_VALIDATION = {
  /**
   * Longitud mínima del concepto del gasto
   */
  MIN_CONCEPT_LENGTH: 3,

  /**
   * Longitud máxima del concepto del gasto
   */
  MAX_CONCEPT_LENGTH: 100,

  /**
   * Monto mínimo de un gasto (1 centavo)
   */
  MIN_AMOUNT: 0.01,

  /**
   * Monto máximo de un gasto ($10,000)
   *
   * @remarks
   * Gastos mayores requieren aprobación gerencial fuera del sistema.
   * Este límite previene errores de captura (ej: $100000 en lugar de $100.00).
   */
  MAX_AMOUNT: 10000.00,

  /**
   * Número máximo de gastos por corte de caja
   *
   * @remarks
   * Límite razonable para prevenir abuso. Cortes con >10 gastos
   * probablemente indican problema operacional que requiere atención.
   */
  MAX_EXPENSES_PER_REPORT: 10
} as const;
```

---

## 🧪 Tests Unitarios

### 6. Test Cases Requeridos

**Archivo:** `src/__tests__/unit/daily-expenses.test.ts` (NUEVO)

**Tests a implementar (5-8 tests):**

```typescript
import { describe, it, expect } from 'vitest';
import type { DailyExpense, ExpenseCategory } from '@/types/cash';
import {
  isDailyExpense,
  isExpenseCategory,
  EXPENSE_CATEGORY_METADATA,
  EXPENSE_VALIDATION
} from '@/types/cash';

describe('DailyExpense Types', () => {
  describe('isDailyExpense type guard', () => {
    it('should return true for valid DailyExpense object', () => {
      const validExpense: DailyExpense = {
        id: crypto.randomUUID(),
        concept: "Compra productos limpieza",
        amount: 30.00,
        category: "SUPPLIES",
        hasInvoice: true,
        timestamp: new Date().toISOString()
      };

      expect(isDailyExpense(validExpense)).toBe(true);
    });

    it('should return false for object missing required fields', () => {
      const invalidExpense = {
        id: crypto.randomUUID(),
        concept: "Test",
        // Missing amount, category, hasInvoice, timestamp
      };

      expect(isDailyExpense(invalidExpense)).toBe(false);
    });

    it('should return false for negative amount', () => {
      const negativeExpense = {
        id: crypto.randomUUID(),
        concept: "Test",
        amount: -10.00, // ❌ Invalid
        category: "SUPPLIES",
        hasInvoice: false,
        timestamp: new Date().toISOString()
      };

      expect(isDailyExpense(negativeExpense)).toBe(false);
    });

    it('should return false for invalid category', () => {
      const invalidCategory = {
        id: crypto.randomUUID(),
        concept: "Test",
        amount: 30.00,
        category: "INVALID_CATEGORY", // ❌ Not in ExpenseCategory
        hasInvoice: false,
        timestamp: new Date().toISOString()
      };

      expect(isDailyExpense(invalidCategory)).toBe(false);
    });
  });

  describe('isExpenseCategory type guard', () => {
    it('should return true for valid ExpenseCategory values', () => {
      const validCategories: ExpenseCategory[] = [
        "SUPPLIES",
        "SERVICES",
        "MAINTENANCE",
        "TRANSPORTATION",
        "OTHER"
      ];

      validCategories.forEach(category => {
        expect(isExpenseCategory(category)).toBe(true);
      });
    });

    it('should return false for invalid category string', () => {
      expect(isExpenseCategory("INVALID")).toBe(false);
      expect(isExpenseCategory("supplies")).toBe(false); // Lowercase
      expect(isExpenseCategory("")).toBe(false);
    });
  });

  describe('EXPENSE_CATEGORY_METADATA', () => {
    it('should have metadata for all 5 categories', () => {
      const categories: ExpenseCategory[] = [
        "SUPPLIES",
        "SERVICES",
        "MAINTENANCE",
        "TRANSPORTATION",
        "OTHER"
      ];

      categories.forEach(category => {
        expect(EXPENSE_CATEGORY_METADATA[category]).toBeDefined();
        expect(EXPENSE_CATEGORY_METADATA[category].emoji).toBeTruthy();
        expect(EXPENSE_CATEGORY_METADATA[category].label).toBeTruthy();
        expect(EXPENSE_CATEGORY_METADATA[category].description).toBeTruthy();
      });
    });

    it('should have unique emojis for each category', () => {
      const emojis = Object.values(EXPENSE_CATEGORY_METADATA).map(m => m.emoji);
      const uniqueEmojis = new Set(emojis);
      expect(uniqueEmojis.size).toBe(5);
    });
  });

  describe('EXPENSE_VALIDATION constants', () => {
    it('should have sensible validation limits', () => {
      expect(EXPENSE_VALIDATION.MIN_CONCEPT_LENGTH).toBe(3);
      expect(EXPENSE_VALIDATION.MAX_CONCEPT_LENGTH).toBe(100);
      expect(EXPENSE_VALIDATION.MIN_AMOUNT).toBe(0.01);
      expect(EXPENSE_VALIDATION.MAX_AMOUNT).toBe(10000.00);
      expect(EXPENSE_VALIDATION.MAX_EXPENSES_PER_REPORT).toBe(10);
    });

    it('should enforce MIN_AMOUNT > 0', () => {
      expect(EXPENSE_VALIDATION.MIN_AMOUNT).toBeGreaterThan(0);
    });
  });
});
```

---

## ✅ Checklist de Completitud

### Fase 1: Definiciones de Tipos

- [ ] **Interface `DailyExpense` creada** con TSDoc completo
- [ ] **Type `ExpenseCategory` creado** con 5 categorías
- [ ] **Const `EXPENSE_CATEGORY_METADATA` creado** con emojis y labels
- [ ] **Interface `CashReport` modificada** con 3 campos nuevos:
  - [ ] `dailyExpenses: DailyExpense[]`
  - [ ] `totalExpenses: number`
  - [ ] `totalAdjusted: number`
- [ ] **Type guard `isDailyExpense()` implementado**
- [ ] **Type guard `isExpenseCategory()` implementado**
- [ ] **Constantes `EXPENSE_VALIDATION` creadas** con 5 límites

### Tests Unitarios

- [ ] **Test file creado:** `src/__tests__/unit/daily-expenses.test.ts`
- [ ] **5-8 tests implementados:**
  - [ ] Test: isDailyExpense válido
  - [ ] Test: isDailyExpense inválido (campos faltantes)
  - [ ] Test: isDailyExpense inválido (amount negativo)
  - [ ] Test: isDailyExpense inválido (category inválida)
  - [ ] Test: isExpenseCategory válidas (5 categorías)
  - [ ] Test: isExpenseCategory inválidas
  - [ ] Test: EXPENSE_CATEGORY_METADATA completo (5 categorías)
  - [ ] Test: EXPENSE_VALIDATION límites razonables
- [ ] **Todos los tests passing** (5-8/5-8)

### Validación Final

- [ ] **TypeScript:** `npx tsc --noEmit` → 0 errors
- [ ] **Tests:** `npm run test:unit` → 5-8/5-8 passing
- [ ] **ESLint:** 0 errors, 0 warnings
- [ ] **REGLAS_DE_LA_CASA.md compliance:**
  - [ ] Cero `any` types
  - [ ] TSDoc completo en interfaces públicas
  - [ ] Comentarios `// 🤖 [IA] - v1.4.0` en cambios

---

## 📊 Estimación de Tiempo

| Tarea | Tiempo Estimado | Complejidad |
|-------|-----------------|-------------|
| Crear `DailyExpense` interface | 20 min | Media |
| Crear `ExpenseCategory` + metadata | 15 min | Baja |
| Modificar `CashReport` interface | 10 min | Baja |
| Crear type guards | 15 min | Media |
| Crear constantes validación | 10 min | Baja |
| Implementar 5-8 tests | 30-40 min | Media |
| Validación TypeScript + ESLint | 10 min | Baja |
| **TOTAL** | **2-3 horas** | **Media** |

---

## 🔗 Referencias

- **REGLAS_DE_LA_CASA.md:** Tipado estricto obligatorio (línea 85-90)
- **README.md:** Sección "Problema vs Solución" (líneas 45-80)
- **Fase_4_Calculos_Matematicos.md:** Ecuación correcta con gastos (líneas 20-25)
- **RESUMEN_VISUAL.md:** Diagrama arquitectura 4 capas (líneas 38-71)

---

## 📝 Notas Importantes

1. **Ubicación:** Todos los tipos van en `src/types/cash.ts` (NO crear archivo separado)
2. **Orden:** Agregar después de línea 103 (después de `CashReport`), antes de `AlertThresholds`
3. **Compatibilidad:** Cero breaking changes - solo agregados, no modificaciones destructivas
4. **Exports:** Todos los tipos/interfaces deben ser `export` para uso en otros archivos
5. **TSDoc:** Obligatorio para interfaces públicas (DailyExpense, ExpenseCategory)

---

**✅ Documento completado:** Fase 1 - Tipos TypeScript
**Próximo documento:** Fase_2_Componente_UI.md (20 min, 300+ líneas)
**Fecha:** 11 Oct 2025
**Versión:** v1.4.0
