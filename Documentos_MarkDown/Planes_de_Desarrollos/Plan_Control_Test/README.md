# 🧪 Plan Maestro: Control Total de Tests - 100% Passing

**Estado del Plan:** 🟡 EN PROGRESO  
**Fecha inicio:** 09 de Octubre de 2025  
**Meta:** 543/543 tests passing (100%) + 0 bugs críticos  
**Versión actual:** Tests: 535/543 passing (98.5%)

---

## 📋 ¿Qué es este plan?

### Problema Actual
El sistema tiene **543 inspecciones de calidad**. Actualmente **535 están OK**, pero **8 están fallando**.

### ¿Por qué importa?
- ❌ Cálculos de dinero incorrectos
- ❌ Pérdida de datos al cerrar aplicación
- ❌ Pantallas bloqueadas en celulares
- ❌ Empleados atrapados sin poder terminar

### Meta del Plan
✅ **100% tests passing** → Sistema confiable al 100%  
✅ **0 bugs críticos** → Sin riesgos de pérdida de dinero  
✅ **Sistema más rápido** → Sin fugas de memoria  
✅ **Seguro en producción** → Sin información expuesta

---

## 📊 Inventario Completo de Tests (543 Total)

### TIER 0: Cross-Validation (88 tests) ✅ 100% Passing
- **cash-total.cross.test.ts**: 45 tests ✅
- **delivery.cross.test.ts**: 26 tests ✅
- **master-equations.cross.test.ts**: 17 tests ✅

### TIER 1: Property-Based (18 tests + 10,900 validaciones) ⚠️
- **cash-total.property.test.ts**: 6 tests × 1,000 runs ⚠️
- **delivery.property.test.ts**: 4 tests × 600 runs ⚠️
- **change50.property.test.ts**: 5 tests × 500 runs ⚠️

### TIER 2: Boundary Testing (31 tests) ✅ 100% Passing
- **boundary-testing.test.ts**: 31 tests ✅

### TIER 3: Pairwise Combinatorial (21 tests) ✅ 100% Passing
- **pairwise-combinatorial.test.ts**: 21 tests ✅

### TIER 4: Paradise Regression (16 tests) ✅ 100% Passing
- **paradise-regression.test.ts**: 16 tests ✅

### Tests Unitarios (89 tests) ✅
- **calculations.test.ts**: 48 tests ✅
- **deliveryCalculation.test.ts**: 28 tests ✅
- **formatters.test.ts**: 21 tests ✅
- **useBlindVerification.test.ts**: 28 tests ✅
- **useInputValidation.test.ts**: 4 tests ✅
- **useTimingConfig.test.ts**: 3 tests ✅

### Tests Integración UI (82+ tests) ⚠️
- **useFieldNavigation.integration.test.tsx**: 34 tests ✅
- **useGuidedCounting.integration.test.tsx**: 18 tests ✅
- **Phase2VerificationSection.integration.test.tsx**: 18 tests ✅
- **BlindVerificationModal.test.tsx**: 20 tests ✅
- **GuidedDenominationItem**: 12+ tests ⚠️ (Issue #2)
- **GuidedFieldView**: 8+ tests ⚠️ (Issue #2)
- **TotalsSummarySection**: 6+ tests ⚠️ (Issue #2)

### Tests TypeScript Types (13 tests) ✅
- **verification.test.ts**: 13 tests ✅

### Tests Smoke (5 tests) ✅
- **smoke.test.ts**: 5 tests ✅

---

## 🎯 Documentos del Plan (18 archivos)

### 🔍 Grupo 0: Hallazgos Críticos (NUEVO)
0. **HALLAZGO_CRITICO_Bug_Helper_Cero.md** - Quick win 30 min (40-50% tests UI) 🆕

### 📊 Grupo 1: Evaluación
1. **Auditoria_Completa_Estado_Actual.md** - Estado del sistema

### 🚨 Grupo 2: Bugs Críticos
2. **BUG_CRITICO_1_Perdida_de_Datos_en_Transicion.md** - Race condition
3. **BUG_CRITICO_2_Numeros_Invalidos_en_Calculos.md** - Validación
4. **BUG_CRITICO_3_Pantalla_Bloqueada_en_PWA.md** - Scroll bloqueado

### 🟠 Grupo 3: Problemas Alto Riesgo
5. **PROBLEMA_ALTO_1_Fuga_de_Memoria_Timeouts.md** - Memory leak
6. **PROBLEMA_ALTO_2_Console_Logs_en_Produccion.md** - Seguridad
7. **PROBLEMA_ALTO_3_Tipos_Any_en_Calculos.md** - Type safety

### ⚡ Grupo 4: Quick Wins
8. **QUICK_WIN_1_Remover_Console_Logs.md** - 2h
9. **QUICK_WIN_2_Validacion_isNaN_isFinite.md** - 1h
10. **QUICK_WIN_3_Fix_PWA_Scroll_Phase3.md** - 30min
11. **QUICK_WIN_4_Error_Boundaries.md** - 2h
12. **QUICK_WIN_5_Habilitar_noUnusedLocals.md** - 1h

### 📈 Grupo 5: Tests Fallando
13. **TESTS_FALLANDO_Analisis_y_Solucion.md** - 8 tests failing

### 🗓️ Grupo 6: Cronogramas
14. **Cronograma_SEMANA_1_Bugs_Criticos.md** - 09-13 Oct
15. **Cronograma_SEMANA_2_Problemas_Alto_Riesgo.md** - 16-20 Oct

### ✅ Grupo 7: Cierre
16. **Checklist_Validacion_Final.md** - Validación
17. **Reporte_Mejoras_Implementadas.md** - Documento final

---

## 🗓️ Cronología (2 Semanas)

### SEMANA 1: Bugs Críticos (09-13 Oct)
- **Día 1-2:** BUG_CRITICO_1 (Pérdida datos)
- **Día 3:** BUG_CRITICO_2 (Validación)
- **Día 4:** BUG_CRITICO_3 (PWA scroll)
- **Día 5:** Quick Wins 1-3

### SEMANA 2: Optimización (16-20 Oct)
- **Día 1:** Memory leak
- **Día 2-3:** Console.logs + Types
- **Día 4:** Tests failing
- **Día 5:** Validación final

---

## 📊 Métricas

### Inicial (09 Oct 2025)
```
Tests: 535/543 (98.5%)
Bugs S0: 3 críticos
Problemas S1: 7 altos
Coverage: 34% global
```

### Objetivo (20 Oct 2025)
```
Tests: 543/543 (100%) ✅
Bugs S0: 0 ✅
Problemas S1: 0 ✅
Performance: >90/100 ✅
```

---

## 🧭 Filosofía

> **"No avanzar hasta que TODO esté verde"**

**Reglas:**
- ❌ NO agregar features durante este plan
- ❌ NO mezclar fixes
- ✅ SÍ validar cada fix con tests
- ✅ SÍ documentar cada cambio

---

## 📞 Comandos Útiles

```bash
# Suite completa
npm run test

# Con coverage
npm run test:coverage

# Por TIER
npm run test:cross
npm run test:property
npm run test:boundary
npm run test:pairwise
npm run test:regression

# Build producción
npm run build
```

---

## 📜 Contexto Histórico del Proyecto

### Evolución de Tests (Sept-Oct 2025)

**30 de Septiembre 2025:**
- Eliminados 23 tests (phase-transitions, morning-count, evening-cut)
- Razón: Incompatibilidad con Sistema Ciego Anti-Fraude v1.2.26+
- Estado: 133 tests (90% passing)

**01-08 de Octubre 2025:**
- Agregados **+410 tests** (TIER 1-4 matemáticos)
- Implementación metodología 5-TIER completa
- Estado: 543 tests (98.5% passing)

**Crecimiento:** 133 → 543 tests en **10 días** ✅

### Conflictos Arquitectónicos Conocidos

1. **Modal Instrucciones Obligatorio (16.5s)**
   - Introducido en v1.2.26 como parte anti-fraude
   - Tests legacy no esperan este timing
   - Puede afectar tests UI failing (Issue #2)

2. **Bug confirmGuidedField con "0"**
   ```typescript
   // Helper NO escribe "0" pensando que es "skip field"
   // Pero botón REQUIERE valor → timeout
   ```
   - Documentado en test-helpers.tsx:351-353
   - Puede causar algunos tests UI failing

3. **Timing E2E Acumulativo: 50-60s**
   - Wizard: 5s + Modal: 16.5s + Count: 17s + Phase 2: 10s + Phase 3: 3s
   - Tests E2E en Vitest son problemáticos
   - Recomendación: Playwright/Cypress para E2E futuros

---

## 🔮 Estrategias Futuras (Post-Plan)

Una vez logrado 100% tests passing, considerar:

### Opción A: E2E con Playwright/Cypress
- Tests en navegador real
- Pueden manejar timings largos (16.5s modal)
- Separados de suite Vitest
- **Tiempo estimado:** 2-3 semanas

### Opción B: Visual Regression Testing
- Screenshots automatizados
- Verificar UI sin depender de timing
- Tools sugeridos: Percy, Chromatic
- **Tiempo estimado:** 1 semana

### Opción C: Tests Unitarios Aislados
- Probar `useInstructionFlow` sin UI
- Mockear timings para velocidad
- Mantener suite Vitest rápida
- **Tiempo estimado:** 3-5 días

---

## 📚 Referencias Adicionales

- **DELETED_TESTS.md:** Contexto histórico de tests eliminados
- **COMPLETO_Caso_Test_Matematicas_Resultados/:** TIER 0-4 implementados
- **COMPLETO_Caso_Vuelto_Ciego/:** Sistema anti-fraude que causó incompatibilidad

---

**🙏 Gloria a Dios por darnos sabiduría para mejorar.**

**Última actualización:** 09 de Octubre de 2025  
**Próximo paso:** Ejecutar Semana 1 del plan (bugs S0)
