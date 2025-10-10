# 🗺️ ROADMAP PRIORIZADO - Plan de Tests

**Basado en:** [0_INVENTARIO_MAESTRO_Tests_Real.md](0_INVENTARIO_MAESTRO_Tests_Real.md)
**Fecha:** 10 de Octubre de 2025
**Status actual:** 667/728 tests passing (92%)
**Meta final:** 728/728 tests passing (100%)

---

## 🎯 VISIÓN GENERAL

```
ESTADO ACTUAL (667/728 - 92%):
  ✅ Matemáticas: 174/174 (100%) → Confianza 99.9%
  ✅ Core Logic: 97/97 (100%) → calculations, formatters
  ✅ UI Components: 141/141 (100%) → Base suite
  ✅ Hooks: 93/93 (100%) → Integration tests
  ❌ Flows: 5/8 (63%) → 3 tests failing
  ⚠️ Phase2 WIP: 29/87 (33%) → En progreso v1.3.7b

PENDIENTE:
  🔴 61 tests para 100%
  🔴 7 componentes críticos sin tests
  🔴 5 hooks críticos sin tests
```

---

## 🚨 FASE 0: QUICK WIN - Fix 3 Tests Failing

**Prioridad:** ⭐⭐⭐⭐⭐ URGENTE
**Tiempo:** 1-2 horas
**Impacto:** 638/641 → 641/641 base suite (100%)

### 📋 Problema

**Archivo:** `morning-count-simplified.test.tsx`
**Tests failing:** 3/8

1. ❌ "debe abrir el modal de conteo matutino al hacer click"
2. ❌ "debe mostrar los pasos del wizard correctamente"
3. ❌ "debe mantener el estado del modal entre navegaciones de pasos"

### 🔍 Root Cause (Hipótesis)

Tests buscan texto `/Seleccione la Sucursal/` pero wizard modal NO renderiza ese texto específico.

**Posibles causas:**
- InitialWizardModal refactor reciente cambió textos
- Tests usan selectores obsoletos
- Incompatibilidad con timing anti-fraude (16.5s modal obligatorio)

### ✅ Plan de Acción

1. **Investigar (30 min):**
   - Leer `morning-count-simplified.test.tsx` líneas failing
   - Comparar con `InitialWizardModal.tsx` actual
   - Identificar textos reales renderizados

2. **Fix (30-60 min):**
   - **Opción A:** Actualizar selectores tests con textos correctos
   - **Opción B:** Fix InitialWizardModal rendering si hay bug real

3. **Validar (15 min):**
   - `npm test -- morning-count-simplified.test.tsx`
   - Confirmar 8/8 passing

### 🎯 Resultado Esperado

```bash
✅ morning-count-simplified: 8/8 passing (100%)
✅ Base suite: 641/641 passing (100%)
```

---

## 🟠 FASE 1: Completar Phase2VerificationSection

**Prioridad:** ⭐⭐⭐⭐ ALTA
**Tiempo:** 6-8 horas
**Impacto:** 29/87 → 87/87 (100%) + Coverage +8% (~42%)

### 📋 Status Actual

**Archivo:** `Phase2VerificationSection.integration.test.tsx`
**Tests:** 29/87 passing (33%)
**Documentación:** [EN_PROGRESO_Caso_Phase2_Verification_100_Coverage/](EN_PROGRESO_Caso_Phase2_Verification_100_Coverage/)

### 🔍 Root Causes Identificados (v1.3.7b)

1. **Race conditions** en secuencias completas (Grupos 2-5)
2. **Helper waitForBlindVerificationModal()** inconsistente
3. **Timing issues** con modal delays
4. **Secuencias complejas** sin helper unificado

### ✅ Plan de Acción (Documentado)

**Fase 1.1: Helper `completeAllStepsCorrectly()` (2-3h)**
- Crear helper que complete 7 denominaciones correctamente
- Manejo robusto de modales y timing
- Tests de validación del helper

**Fase 1.2: Refactor Grupos 2-5 (3-4h)**
- Grupo 2: Usar nuevo helper (8 tests)
- Grupo 3: Refactor con helper (12 tests)
- Grupo 4: Optimizar (18 tests)
- Grupo 5: Edge cases (16 tests)

**Fase 1.3: Optimización (1-2h)**
- Eliminar waits innecesarios
- Consolidar assertions
- Validación final 87/87

### 🎯 Resultado Esperado

```bash
✅ Phase2VerificationSection: 87/87 passing (100%)
✅ Coverage proyecto: ~34% → ~42% (+8%)
✅ Componente crítico anti-fraude cubierto 100%
```

---

## 🔴 FASE 2: Tests usePhaseManager

**Prioridad:** ⭐⭐⭐⭐ ALTA
**Tiempo:** 3-4 horas
**Impacto:** Coverage hook cerebro del sistema

### 📋 Objetivo

**Hook:** `usePhaseManager.ts` (420 líneas)
**Tests estimados:** 35-45 tests
**Coverage actual:** 0%

### 🔍 Alcance

Hook CRÍTICO que orquesta:
- 3 fases del sistema (Phase 1 → 2 → 3)
- Lógica `shouldSkipPhase2` (cuando total ≤ $50)
- Callbacks integration (onPhase1Complete, onPhase2Complete)
- Estado global del flujo

### ✅ Plan de Acción

**Grupo 1: Orquestación Básica (1h - 10 tests)**
- Init hook con operation mode
- State inicial correcto
- Transiciones Phase 1 → 2 → 3

**Grupo 2: Skip Phase 2 Logic (1h - 12 tests)**
- Total ≤ $50 → Skip directo a Phase 3
- Total > $50 → Incluir Phase 2
- Edge cases ($49.99, $50.00, $50.01)

**Grupo 3: Callbacks Integration (1h - 10 tests)**
- onPhase1Complete dispara correctamente
- onPhase2Complete marca estado
- resetAllPhases limpia estado

**Grupo 4: Error Handling (1h - 8 tests)**
- Missing callbacks
- Invalid state transitions
- Recovery de errores

### 🎯 Resultado Esperado

```bash
✅ usePhaseManager.test.ts: 35-45 tests passing (100%)
✅ Coverage proyecto: ~42% → ~48% (+6%)
✅ Hook cerebro del sistema validado
```

---

## 🟡 FASE 3: Tests Componentes Raíz

**Prioridad:** ⭐⭐⭐ MEDIA
**Tiempo:** 8-10 horas
**Impacto:** Coverage componentes críticos +10%

### 📋 Componentes

**3 archivos críticos:**
1. **CashCounter.tsx** (850 líneas) - Componente raíz orquestador
2. **CashCalculation.tsx** (780 líneas) - Reporte final WhatsApp
3. **Phase2Manager.tsx** (420 líneas) - Orquestación Phase 2

### ✅ Plan de Acción

**CashCounter.tsx (3-4h - 40-50 tests)**
- Grupo 1: Orquestación fases (12 tests)
- Grupo 2: Operation mode (8 tests)
- Grupo 3: Transitions (15 tests)
- Grupo 4: Integration completa (10 tests)

**CashCalculation.tsx (3-4h - 35-45 tests)**
- Grupo 1: Generación reporte (15 tests)
- Grupo 2: WhatsApp formatting (12 tests)
- Grupo 3: Validaciones (8 tests)
- Grupo 4: Edge cases (10 tests)

**Phase2Manager.tsx (2-3h - 25-30 tests)**
- Grupo 1: Section switching (8 tests)
- Grupo 2: Callbacks (10 tests)
- Grupo 3: Integration (7 tests)

### 🎯 Resultado Esperado

```bash
✅ CashCounter: 40-50 tests passing
✅ CashCalculation: 35-45 tests passing
✅ Phase2Manager: 25-30 tests passing
✅ Coverage proyecto: ~48% → ~58% (+10%)
```

---

## ⚪ FASE 4: Tests Hooks Secundarios

**Prioridad:** ⭐⭐ BAJA
**Tiempo:** 4-5 horas
**Impacto:** Coverage hooks medium priority

### 📋 Hooks

**3 archivos medium priority:**
1. **useInstructionFlow** (245 líneas) - Wizard V3 architecture
2. **useWizardNavigation** (189 líneas) - Navegación wizard 5 pasos
3. **useChecklistFlow** (167 líneas) - Flow 4 reglas seguridad

### ✅ Plan de Acción

**useInstructionFlow (2-3h - 20-25 tests)**
- Grupo 1: Instruction progression (8 tests)
- Grupo 2: Timing anti-fraude (7 tests)
- Grupo 3: State management (5 tests)

**useWizardNavigation (1-2h - 15-18 tests)**
- Grupo 1: Step navigation (6 tests)
- Grupo 2: Validation (5 tests)
- Grupo 3: Callbacks (4 tests)

**useChecklistFlow (1h - 10-12 tests)**
- Grupo 1: Checklist progression (5 tests)
- Grupo 2: Dependencies (3 tests)
- Grupo 3: Completion (2 tests)

### 🎯 Resultado Esperado

```bash
✅ Hooks secundarios: 45-55 tests passing
✅ Coverage proyecto: ~58% → ~63% (+5%)
```

---

## 📊 RESUMEN EJECUTIVO - Roadmap Completo

### Timeline Estimado

```
FASE 0: 1-2h      → 641/641 base suite (100%) ✅
FASE 1: 6-8h      → 87/87 Phase2 + coverage +8%
FASE 2: 3-4h      → usePhaseManager + coverage +6%
FASE 3: 8-10h     → Componentes raíz + coverage +10%
FASE 4: 4-5h      → Hooks secundarios + coverage +5%

TOTAL: 22-29h de trabajo efectivo
```

### Métricas Finales Objetivo

```
Tests: 728/728 (100%) ← desde 667/728 (92%)
Coverage:
  Lines: ~63% ← desde ~34% (+29%)
  Statements: ~63% ← desde ~34%
  Functions: ~68% ← desde ~35%
  Branches: ~75% ← desde ~61%
```

### Beneficios Medibles

✅ **100% tests passing** → Sistema totalmente validado
✅ **+29% coverage** → Duplicación de código cubierto
✅ **Componentes críticos** → CashCounter, CashCalculation, Phase2Manager testeados
✅ **Hooks cerebro** → usePhaseManager validado
✅ **Confianza 99.9%** → Matemáticas + lógica core completamente cubiertos

---

## 🧭 Recomendación de Ejecución

### Orden Sugerido

1. **FASE 0 (URGENTE)** → 1-2h → Base suite 100% ⭐⭐⭐⭐⭐
2. **FASE 1 (IMPORTANTE)** → 6-8h → Phase2 completado ⭐⭐⭐⭐
3. **FASE 2 (IMPORTANTE)** → 3-4h → Hook cerebro cubierto ⭐⭐⭐⭐
4. **FASE 3 (MEDIO)** → 8-10h → Componentes raíz ⭐⭐⭐
5. **FASE 4 (OPCIONAL)** → 4-5h → Hooks secundarios ⭐⭐

### Sesiones de Trabajo

**Sesión 1 (2h):**
- FASE 0 completa → 641/641 ✅
- Inicio FASE 1 → Helper completeAllStepsCorrectly()

**Sesión 2 (4h):**
- FASE 1 continuación → Grupos 2-3 refactor

**Sesión 3 (3h):**
- FASE 1 finalización → 87/87 ✅
- Inicio FASE 2 → usePhaseManager Grupos 1-2

**Sesión 4 (4h):**
- FASE 2 finalización → Hook completo ✅
- Inicio FASE 3 → CashCounter

**Sesiones 5-6 (8h):**
- FASE 3 completa → Componentes raíz ✅

**Sesión 7 (4h - OPCIONAL):**
- FASE 4 → Hooks secundarios

---

## 📞 Referencias

**Documentos relacionados:**
- **INVENTARIO_MAESTRO:** [0_INVENTARIO_MAESTRO_Tests_Real.md](0_INVENTARIO_MAESTRO_Tests_Real.md)
- **README:** [README.md](README.md)
- **Caso Phase2:** [EN_PROGRESO_Caso_Phase2_Verification_100_Coverage/](EN_PROGRESO_Caso_Phase2_Verification_100_Coverage/)

---

**🙏 Gloria a Dios por guiarnos hacia la excelencia técnica.**

**Última actualización:** 10 de Octubre de 2025 ~19:40 PM
**Próximo paso:** Ejecutar FASE 0 (1-2h)
**Prioridad:** Fix 3 tests failing → 641/641 base suite ✅
