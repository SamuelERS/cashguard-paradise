# 📊 Resumen Visual - Sistema de Gastos de Caja

---

## 🎯 Problema → Solución

```
❌ PROBLEMA ACTUAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Efectivo:     $950  │  Gasto: $50
Electrónico:  $  0  │  (NO registrado)
──────────────────  │  
Total:        $950  │  SICAR: $1,000 - $50 = $950
                    │
Diferencia: -$50 ❌ │  (INCORRECTO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


✅ SOLUCIÓN PROPUESTA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Efectivo:     $950  │  Gastos: $50 🆕
Electrónico:  $  0  │  (REGISTRADO)
──────────────────  │  
Total:        $950  │  
Gastos:       -$50  │  SICAR: $1,000
──────────────────  │
Ajustado:     $900  │
                    │
Diferencia: -$100 ✅ │  (CORRECTO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🏗️ Arquitectura en 4 Capas

```
┌─────────────────────────────────────────────────────┐
│  CAPA 1: TIPOS TYPESCRIPT (Fase 1)                  │
├─────────────────────────────────────────────────────┤
│  DailyExpense { id, concept, amount, category }     │
│  ExpenseCategory = "SUPPLIES" | "SERVICES" | ...    │
│  CashReport { dailyExpenses, totalExpenses }        │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  CAPA 2: COMPONENTE UI (Fase 2)                     │
├─────────────────────────────────────────────────────┤
│  DailyExpensesManager.tsx                           │
│  ├─ Input: Concepto                                 │
│  ├─ Input: Monto                                    │
│  ├─ Select: Categoría                               │
│  └─ Lista: Gastos agregados                         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  CAPA 3: WIZARD + CÁLCULOS (Fase 3-4)               │
├─────────────────────────────────────────────────────┤
│  InitialWizardModal (Paso 6: Gastos)                │
│  useCalculations (ecuación corregida)                │
│  calculateTotalExpenses()                            │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│  CAPA 4: REPORTE FINAL (Fase 5)                     │
├─────────────────────────────────────────────────────┤
│  Reporte WhatsApp con sección GASTOS DEL DÍA        │
│  Total Ajustado visible                              │
│  Diferencia correcta vs SICAR                        │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo Temporal Completo

```
┌─────────────────────────────────────────────────────────────────┐
│  WIZARD INICIAL (Steps 1-6) - ANTES DEL CONTEO                 │
├─────────────────────────────────────────────────────────────────┤
│  Step 1: Protocolo Anti-Fraude                                 │
│  Step 2: Selección Sucursal                                    │
│  Step 3: Selección Cajero                                      │
│  Step 4: Selección Testigo                                     │
│  Step 5: Venta Esperada SICAR  ← Ingreso esperado ($1,000)   │
│  Step 6: 💸 Gastos del Día      ← Egresos del día ($80)      │
│          [NUEVO - OPCIONAL]                                     │
│          Ejemplos: $50 papel, $30 taxi                         │
└─────────────────────────────────────────────────────────────────┘
                         ↓
                 ✅ Wizard Completo
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  PHASE 1: CONTEO DE EFECTIVO - DURANTE EL CONTEO               │
├─────────────────────────────────────────────────────────────────┤
│  → Contar billetes y monedas  ($900 efectivo)                  │
│  → 💳 Pagos Electrónicos       ($200 tarjetas)                 │
│     • PayPal                   ← Ingresos recibidos            │
│     • Promerica                ← (NO son gastos)               │
│     • Credomatic                                                │
│     • Transferencias                                            │
└─────────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  CÁLCULO FINAL (con gastos incluidos)                          │
├─────────────────────────────────────────────────────────────────┤
│  Total General = $900 + $200 = $1,100                          │
│  Total Ajustado = $1,100 - $80 (gastos) = $1,020              │
│  Diferencia = $1,020 - $1,000 (SICAR) = +$20 ✅               │
└─────────────────────────────────────────────────────────────────┘

⚠️ CRÍTICO - Diferencia Temporal:
   • Step 6 (Gastos) = ANTES del conteo (wizard setup)
   • Pagos electrónicos = DURANTE el conteo (Phase 1)
   • Gastos = Egresos (-) | Pagos = Ingresos (+)
```

---

## 📝 Plan de 6 Fases

| Fase | Tarea | Tiempo | Tests |
|------|-------|--------|-------|
| **1** | Tipos TypeScript | 2-3h | 5-8 |
| **2** | Componente UI | 4-5h | 8-12 |
| **3** | Integración Wizard | 3-4h | 5-8 |
| **4** | Cálculos Matemáticos | 2-3h | 15 |
| **5** | Reportería WhatsApp | 2-3h | 6-8 |
| **6** | Testing Completo | 3-4h | - |
| **TOTAL** | **6 fases** | **16-22h** | **45-55** |

---

## 🎨 UI del Componente

```
┌──────────────────────────────────────────────────────┐
│ 💸 Gastos del Día                                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│ ┌────────────────────────────────────────────────┐   │
│ │ Concepto:  [___________________________]      │   │
│ │ Monto:     $ [_____]                          │   │
│ │ Categoría: [Insumos ▼]                        │   │
│ │ [ ] ¿Tiene factura?                           │   │
│ │                          [+ Agregar Gasto]    │   │
│ └────────────────────────────────────────────────┘   │
│                                                      │
│ GASTOS REGISTRADOS:                                  │
│ ┌────────────────────────────────────────────────┐   │
│ │ • Compra productos    $30.00   [✏️] [🗑️]      │   │
│ │ • Servicio limpieza   $20.00   [✏️] [🗑️]      │   │
│ └────────────────────────────────────────────────┘   │
│                                                      │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 💸 TOTAL GASTOS: $50.00                              │
└──────────────────────────────────────────────────────┘
```

---

## 📱 Reporte WhatsApp Final

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMEN EJECUTIVO

💰 Efectivo: $950.00
💳 Electrónico: $0.00
💼 Total Día: $950.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💸 GASTOS DEL DÍA

1. 📦 Compra productos
   └─ $30.00 ✅ Con factura

2. 🔧 Servicio limpieza
   └─ $20.00 ⚠️ Sin factura

Total Gastos: $50.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 Total Ajustado: $900.00
🎯 SICAR: $1,000.00
📉 Diferencia: -$100.00 (FALTANTE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📁 Archivos Nuevos vs Modificados

### 🆕 NUEVOS (6 archivos)

```
src/components/expenses/
  ├─ DailyExpensesManager.tsx
  ├─ ExpenseRow.tsx
  └─ ExpenseCategorySelect.tsx

__tests__/unit/types/
  └─ daily-expenses.test.ts

__tests__/integration/expenses/
  └─ DailyExpensesManager.test.tsx

__tests__/cross-validation/
  └─ expenses.cross.test.ts
```

### 🔧 MODIFICADOS (4 archivos)

```
src/types/cash.ts                  (+30 líneas)
src/utils/calculations.ts          (+15 líneas)
src/hooks/useCalculations.ts       (+10 líneas)
src/components/InitialWizardModal.tsx (+80 líneas)
```

---

## ✅ Checklist de Implementación

### Fase 1: Tipos
- [ ] Crear `DailyExpense` interface
- [ ] Crear `ExpenseCategory` type
- [ ] Modificar `CashReport`
- [ ] 5-8 tests passing

### Fase 2: UI
- [ ] `DailyExpensesManager.tsx`
- [ ] `ExpenseRow.tsx`
- [ ] `ExpenseCategorySelect.tsx`
- [ ] 8-12 tests passing

### Fase 3: Wizard
- [ ] Agregar Paso 6
- [ ] Actualizar navegación
- [ ] 5-8 tests passing

### Fase 4: Cálculos
- [ ] `calculateTotalExpenses()`
- [ ] Modificar `useCalculations`
- [ ] 15 tests passing

### Fase 5: Reporte
- [ ] Sección gastos WhatsApp
- [ ] 6-8 tests passing

### Fase 6: Testing
- [ ] 45-55 tests (100%)
- [ ] TypeScript 0 errors
- [ ] ESLint clean
- [ ] Build exitoso

---

## 🎓 Para Iniciar

1. **Leer:** `README.md` (arquitectura completa)
2. **Revisar:** `00-INDICE.md` (guía de lectura)
3. **Empezar:** `Fase_1_Tipos_TypeScript.md`
4. **Preguntas:** `Preguntas_Frecuentes.md`

---

**Listo para desarrollo** ✅  
**Aprobación gerencial requerida antes de iniciar**
