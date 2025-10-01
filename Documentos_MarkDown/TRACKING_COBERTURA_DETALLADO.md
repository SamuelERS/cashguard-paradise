# 📈 Tracking Detallado de Cobertura por Archivo

> **Documento de Seguimiento de Coverage**  
> **Versión**: 1.0.0  
> **Última Actualización**: 2025-10-01

---

## 🎯 Objetivo General

Alcanzar **60% de cobertura** para finales de 2025 mediante un plan estructurado y medible.

---

## 📊 Dashboard de Cobertura

### **Resumen Ejecutivo**

```
┌─────────────────────────────────────────────────────┐
│ COBERTURA ACTUAL - Q1 2025                          │
├─────────────────────────────────────────────────────┤
│ Functions:   ████████░░ 30.0%  (▲ +7.41%)          │
│ Lines:       ███████░░░ 28.0%  (▲ +8.70%)          │
│ Statements:  ███████░░░ 28.0%  (▲ +8.70%)          │
│ Branches:    █████████░ 55.0%  (= 0.00%)           │
├─────────────────────────────────────────────────────┤
│ Tests Totales:        37                            │
│ Tests Pasando:        37 (100%)                     │
│ Tests Fallando:       0                             │
│ Archivos Testeados:   9 / 30                        │
│ Cobertura Efectiva:   30%                           │
└─────────────────────────────────────────────────────┘
```

---

## 📁 Cobertura por Categoría

### **1. Utilities** (src/utils/)

| Archivo | Líneas | Tests | Cobertura | Prioridad | Estado |
|---------|--------|-------|-----------|-----------|--------|
| `calculations.ts` | 195 | 10 | **100%** ✅ | Alta | COMPLETO |
| `formatters.ts` | 85 | 3 | **100%** ✅ | Alta | COMPLETO |
| `deliveryCalculation.ts` | 120 | 5 | **100%** ✅ | Alta | COMPLETO |
| `clipboard.ts` | 106 | 15 | **70%** ⚠️ | Media | PARCIAL |
| `propValidation.ts` | 180 | 0 | **0%** 🔴 | Alta | PENDIENTE |
| `errorLogger.ts` | 120 | 0 | **0%** 🔴 | Crítica | PENDIENTE |

**Cobertura Utilities**: 58% (4/6 archivos con tests)

---

### **2. Hooks** (src/hooks/)

#### **Hooks con Tests** ✅

| Archivo | Líneas | Tests | Cobertura | Estado |
|---------|--------|-------|-----------|--------|
| `useCalculations.ts` | 75 | 17 | **90%** ✅ | COMPLETO |
| `useLocalStorage.ts` | 117 | 5 | **60%** ⚠️ | PARCIAL |
| `useInputValidation.ts` | 95 | 1 | **20%** 🟡 | INICIAL |

#### **Hooks Sin Tests** 🔴

| Archivo | Líneas | Complejidad | Prioridad | Tests Estimados | Esfuerzo |
|---------|--------|-------------|-----------|-----------------|----------|
| `usePhaseManager.ts` | 200 | Muy Alta | 🔴 Crítica | 12-15 | 2-3 días |
| `useGuidedCounting.ts` | 250 | Muy Alta | 🔴 Crítica | 15-20 | 3-4 días |
| `useFieldNavigation.ts` | 150 | Alta | 🔴 Crítica | 10-12 | 2 días |
| `useWizardNavigation.ts` | 120 | Media | 🟡 Alta | 8-10 | 1-2 días |
| `useOperationMode.ts` | 100 | Media | 🟡 Alta | 6-8 | 1 día |
| `useTimingConfig.ts` | 90 | Media | 🟡 Alta | 6-8 | 1 día |
| `useTheme.ts` | 80 | Baja | 🟢 Media | 5-7 | 0.5 día |
| `usePageVisibility.ts` | 60 | Baja | 🟢 Media | 4-5 | 0.5 día |
| `useChecklistFlow.ts` | 100 | Media | 🟢 Media | 6-8 | 1 día |
| `useInstructionsFlow.ts` | 90 | Media | 🟢 Media | 5-7 | 1 día |
| `useRulesFlow.ts` | 110 | Media | 🟢 Media | 7-9 | 1 día |
| `use-toast.ts` | 50 | Baja | 🟢 Baja | 3-4 | 0.5 día |
| `useVisibleAnimation.ts` | 70 | Baja | 🟢 Baja | 4-5 | 0.5 día |

**Cobertura Hooks**: 23% (3/16 archivos con tests)

---

### **3. Componentes** (src/components/)

| Categoría | Archivos | Tests | Cobertura | Estado |
|-----------|----------|-------|-----------|--------|
| Formularios | 8 | 0 | **0%** 🔴 | PENDIENTE |
| Modales | 12 | 2 | **~15%** 🟡 | DEBUG ONLY |
| Navegación | 5 | 1 | **~10%** 🟡 | PARCIAL |
| Layout | 4 | 0 | **0%** 🔴 | PENDIENTE |
| UI Components | 15+ | 1 | **~5%** 🟡 | MINIMAL |

**Cobertura Componentes**: ~8% (Muy baja, prioridad Q3-Q4)

---

## 🎯 Plan de Acción Detallado

### **Sprint 1 - Q2 2025 (Abril 2025)**
**Objetivo**: +5% cobertura → 35% total

#### **Semana 1-2: Hooks Críticos Parte 1**
```typescript
// 🔴 CRÍTICO - Implementar:
□ usePhaseManager.test.ts
  ├─ Setup y configuración (2 tests)
  ├─ Transiciones de fase (4 tests)
  ├─ Validación de estado (3 tests)
  ├─ Manejo de errores (3 tests)
  └─ Casos edge (2 tests)
  Subtotal: 14 tests | Esfuerzo: 2-3 días

□ useFieldNavigation.test.ts
  ├─ Navegación básica (3 tests)
  ├─ Auto-advance (3 tests)
  ├─ Validación de campos (2 tests)
  ├─ Focus management (3 tests)
  └─ Edge cases mobile (2 tests)
  Subtotal: 13 tests | Esfuerzo: 2 días
```

**Impacto Sprint 1**: ~27 tests | +3-4% cobertura

#### **Semana 3-4: Utilities Críticos**
```typescript
// 🔴 CRÍTICO - Implementar:
□ errorLogger.test.ts
  ├─ Logging básico (2 tests)
  ├─ Niveles de severidad (3 tests)
  ├─ Formateo de errores (2 tests)
  ├─ Storage de logs (2 tests)
  └─ Casos edge (2 tests)
  Subtotal: 11 tests | Esfuerzo: 1.5 días

□ propValidation.test.ts
  ├─ Validación de props (4 tests)
  ├─ Type checking (3 tests)
  ├─ Error messages (2 tests)
  └─ Edge cases (2 tests)
  Subtotal: 11 tests | Esfuerzo: 1.5 días
```

**Impacto Sprint 1 Total**: ~49 tests | +5% cobertura | **35% total** ✅

---

### **Sprint 2 - Q2 2025 (Mayo 2025)**
**Objetivo**: Mantener 35% y consolidar

#### **Semana 1-2: Hooks de UI**
```typescript
// 🟡 ALTA PRIORIDAD - Implementar:
□ useTheme.test.ts (5-7 tests)
□ usePageVisibility.test.ts (4-5 tests)
□ useOperationMode.test.ts (6-8 tests)
```

**Impacto Sprint 2**: ~20 tests | Mantiene 35%

---

### **Sprint 3 - Q3 2025 (Julio 2025)**
**Objetivo**: +10% cobertura → 45% total

#### **Hooks Complejos**
```typescript
// 🔴 CRÍTICO - Implementar:
□ useGuidedCounting.test.ts (15-20 tests)
□ useTimingConfig.test.ts (completar, 10+ tests)
□ useWizardNavigation.test.ts (8-10 tests)
```

**Impacto Sprint 3**: ~40 tests | +7-8% cobertura

---

### **Sprint 4 - Q3 2025 (Agosto-Septiembre)**
**Objetivo**: +5% cobertura → 50% total

#### **Tests de Integración**
```typescript
// 🟡 ALTA PRIORIDAD - Implementar:
□ morning-count-flow.test.tsx (flujo completo)
□ night-count-flow.test.tsx (flujo completo)
□ wizard-navigation.test.tsx (navegación)
□ phase-transitions.test.tsx (transiciones)
```

**Impacto Sprint 4**: Tests de integración | +5% cobertura | **50% total** ✅

---

## 📐 Métricas de Calidad por Tipo de Test

### **Tests Unitarios**

| Categoría | Cantidad | Calidad | Tiempo Ejecución |
|-----------|----------|---------|------------------|
| **Utilities** | 33 | ⭐⭐⭐⭐⭐ | <50ms |
| **Hooks** | 23 | ⭐⭐⭐⭐ | <100ms |
| **Components** | 4 | ⭐⭐⭐ | <200ms |

### **Tests de Integración**

| Test | Componentes | Calidad | Tiempo |
|------|-------------|---------|--------|
| Morning Count | 8 | ⭐⭐⭐ | <500ms |
| (Otros pendientes) | - | - | - |

### **Tests E2E** (Pendiente Q4)

| Test | Status | Prioridad |
|------|--------|-----------|
| Flujo Matutino Completo | 🔴 Pendiente | Alta |
| Flujo Nocturno Completo | 🔴 Pendiente | Alta |
| Wizard Setup | 🔴 Pendiente | Media |

---

## 🔍 Análisis de Gaps

### **Funcionalidades Sin Coverage**

```
❌ CRÍTICO - Sin tests:
├─ Gestión de fases (Phase Manager)
├─ Conteo guiado (Guided Counting)
├─ Navegación de campos (Field Navigation)
├─ Logging de errores (Error Logger)
└─ Validación de props (Prop Validation)

⚠️ PARCIAL - Coverage insuficiente:
├─ LocalStorage management (60%)
├─ Input validation (20%)
├─ Clipboard utilities (70%)
└─ Timing configuration (0%)

✅ COMPLETO - Coverage 100%:
├─ Calculations
├─ Formatters
└─ Delivery Calculations
```

---

## 📊 Histórico de Coverage

### **Timeline**

```
Diciembre 2024:  22.59% functions │ Baseline inicial
Enero 2025:      30.00% functions │ ▲ +7.41% (Q1 completado)
Abril 2025:      35.00% functions │ ▲ +5.00% (Q2 target)
Julio 2025:      42.00% functions │ ▲ +7.00% (Q3 mid)
Septiembre 2025: 50.00% functions │ ▲ +8.00% (Q3 target)
Diciembre 2025:  60.00% functions │ ▲ +10.00% (Q4 target)
```

### **Gráfico de Progreso**

```
60% │                                          ●
    │                                      ┌───┘
55% │                                  ┌───┘
    │                              ┌───┘
50% │                          ●───┘
    │                      ┌───┘
45% │                  ┌───┘
    │              ┌───┘
40% │          ┌───┘
    │      ┌───┘
35% │  ●───┘
    │  │
30% │●─┘
    │
25% │
    └────┬────┬────┬────┬────┬────┬────┬────
       Q4'24 Q1'25 Q2'25 Q3'25 Q4'25
```

---

## 🎯 KPIs y Objetivos

### **Métricas Principales**

| KPI | Actual | Q2 Target | Q3 Target | Q4 Target |
|-----|--------|-----------|-----------|-----------|
| **Function Coverage** | 30% | 35% | 50% | 60% |
| **Line Coverage** | 28% | 33% | 48% | 58% |
| **Branch Coverage** | 55% | 55% | 60% | 65% |
| **Tests Totales** | 37 | 100+ | 200+ | 300+ |
| **Tests/Hook Ratio** | 1.4 | 6.0 | 12.0 | 18.0 |

### **Métricas Secundarias**

| Métrica | Actual | Target Q4 |
|---------|--------|-----------|
| Test Pass Rate | 100% | 100% |
| Flaky Tests | 0 | 0 |
| Tiempo Ejecución Total | <500ms | <2s |
| Coverage Drift | 0% | <5% |

---

## 🚨 Alertas y Riesgos

### **Riesgos Identificados**

```
🔴 CRÍTICO:
├─ [R1] Hooks complejos sin tests pueden generar bugs en producción
├─ [R2] errorLogger sin tests = debugging difícil en prod
└─ [R3] Falta de tests de integración = regresiones no detectadas

🟡 MEDIO:
├─ [R4] Tests flaky por problemas de JSDOM environment
├─ [R5] Tiempo de ejecución puede aumentar con más tests
└─ [R6] Complejidad de algunos hooks dificulta testing

🟢 BAJO:
├─ [R7] Coverage puede bajar con nuevas features
└─ [R8] Mantenimiento de tests puede ser costoso
```

### **Mitigaciones**

```
✅ [R1] PLAN: Priorizar tests de hooks críticos en Q2
✅ [R2] PLAN: errorLogger.test.ts en Sprint 1
✅ [R3] PLAN: Tests integración en Q3
⚠️ [R4] MONITOREAR: Usar beforeEach para limpiar DOM
⚠️ [R5] MONITOREAR: Paralelizar tests si excede 2s
⚠️ [R6] REFACTOR: Simplificar hooks complejos antes de testear
```

---

## 📋 Checklist de Implementación

### **Por Cada Nuevo Test**

```typescript
□ Nombre descriptivo del test suite
□ BeforeEach para cleanup de DOM
□ Tests agrupados por funcionalidad
□ Happy path cubierto
□ Error handling cubierto
□ Edge cases cubiertos
□ Mocks correctamente implementados
□ Assertions específicas y claras
□ Documentación inline si es complejo
□ Test pasa individualmente
□ Test pasa en suite completa
□ Coverage del archivo > 70%
```

### **Por Cada PR con Tests**

```
□ Todos los tests pasan
□ Coverage no disminuye
□ Nuevos archivos tienen > 60% coverage
□ Tests tienen nombres descriptivos
□ No hay tests comentados/skippeados
□ Mocks están bien documentados
□ README actualizado si aplica
□ ARQUITECTURA_TESTING_COBERTURA.md actualizado
```

---

## 🔄 Proceso de Mejora Continua

### **Revisión Mensual**

```
□ Revisar cobertura actual vs target
□ Identificar archivos críticos sin tests
□ Priorizar tests para próximo sprint
□ Actualizar roadmap si es necesario
□ Documentar lecciones aprendidas
□ Ajustar estimaciones de esfuerzo
```

### **Revisión Trimestral**

```
□ Análisis de deuda técnica en testing
□ Revisión de KPIs y métricas
□ Ajuste de thresholds en vitest.config
□ Actualización de documentación
□ Retrospectiva del equipo
□ Planning del próximo quarter
```

---

## 📞 Contacto

**Mantenedor**: Samuel ERS  
**Última Actualización**: 2025-10-01  
**Próxima Revisión**: 2025-04-01

---

**Estado**: 🟢 **EN TRACK**  
**Q1 2025**: ✅ **COMPLETADO - 30% Coverage**  
**Próximo Hito**: 🎯 **Q2 2025 - 35% Coverage**

