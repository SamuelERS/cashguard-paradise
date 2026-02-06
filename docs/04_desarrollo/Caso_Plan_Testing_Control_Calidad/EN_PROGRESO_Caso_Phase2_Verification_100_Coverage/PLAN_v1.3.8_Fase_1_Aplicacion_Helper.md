# 🧠 v1.3.8 Fase 1 - Plan de Aplicación del Helper `completeAllStepsCorrectly()`

**Fecha:** 10 Oct 2025 ~19:50 PM
**Archivo:** `Phase2VerificationSection.test.tsx`
**Objetivo:** Aplicar helper a 29 tests identificados (reemplazar secuencias de 7 pasos consecutivos)
**Impacto esperado:** 71 failing → 40-50 failing (-30% errores async)

---

## 📊 Resumen Ejecutivo

**Helper definido (v1.3.8 PREP):** ✅ Completado
**Validación standalone:** ✅ 2 tests passing
**Secuencias identificadas:** 10 bloques de 7 pasos (penny → bill5)
**Tests afectados:** 10 tests (Grupo 2: Primer Intento Correcto + Grupo 6: buildVerificationBehavior + Grupo 7: Navegación + Grupo 8: Regression)

---

## 🎯 Secuencias Identificadas para Reemplazo

### Secuencia #1: Test 2.2 (líneas 336-342)
**Test:** `2.2 - Primer intento correcto NO registra en attemptHistory`
**Líneas:** 336-342
**Contexto:** Completar todos los pasos correctos → verificar attemptHistory vacío

**❌ ANTES (7 líneas):**
```typescript
await completeStepCorrectly(user, 43); // penny
await completeStepCorrectly(user, 20); // nickel
await completeStepCorrectly(user, 33); // dime
await completeStepCorrectly(user, 8);  // quarter
await completeStepCorrectly(user, 1);  // dollarCoin
await completeStepCorrectly(user, 1);  // bill1
await completeStepCorrectly(user, 1);  // bill5
```

**✅ DESPUÉS (1 línea):**
```typescript
await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);
```

**Beneficio:** -6 líneas, async timing robusto

---

### Secuencia #2: Test 2.8 (líneas 419-425)
**Test:** `2.8 - Todos los pasos con primer intento correcto llama onSectionComplete`
**Líneas:** 419-425
**Contexto:** Verificar callback onSectionComplete después de 7 pasos

**❌ ANTES:**
```typescript
await completeStepCorrectly(user, 43); // penny
await completeStepCorrectly(user, 20); // nickel
await completeStepCorrectly(user, 33); // dime
await completeStepCorrectly(user, 8);  // quarter
await completeStepCorrectly(user, 1);  // dollarCoin
await completeStepCorrectly(user, 1);  // bill1
await completeStepCorrectly(user, 1);  // bill5
```

**✅ DESPUÉS:**
```typescript
await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);
```

---

### Secuencia #3: Test 2.11 (líneas 457-463)
**Test:** `2.11 - Primer intento correcto NO genera severity flags`
**Líneas:** 457-463
**Contexto:** Verificar severityFlags vacío

**❌ ANTES:**
```typescript
await completeStepCorrectly(user, 43); // penny
await completeStepCorrectly(user, 20); // nickel
await completeStepCorrectly(user, 33); // dime
await completeStepCorrectly(user, 8);  // quarter
await completeStepCorrectly(user, 1);  // dollarCoin
await completeStepCorrectly(user, 1);  // bill1
await completeStepCorrectly(user, 1);  // bill5
```

**✅ DESPUÉS:**
```typescript
await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);
```

---

### Secuencia #4: Test 2.12 (líneas 477-483)
**Test:** `2.12 - Primer intento correcto: firstAttemptSuccesses = total denominaciones`
**Líneas:** 477-483
**Contexto:** Verificar contador firstAttemptSuccesses = 7

**❌ ANTES:**
```typescript
await completeStepCorrectly(user, 43); // penny
await completeStepCorrectly(user, 20); // nickel
await completeStepCorrectly(user, 33); // dime
await completeStepCorrectly(user, 8);  // quarter
await completeStepCorrectly(user, 1);  // dollarCoin
await completeStepCorrectly(user, 1);  // bill1
await completeStepCorrectly(user, 1);  // bill5
```

**✅ DESPUÉS:**
```typescript
await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);
```

---

### Secuencia #5: Test 6.1 (líneas 1405-1411)
**Test:** `6.1 - buildVerificationBehavior devuelve objeto con todas las claves`
**Líneas:** 1405-1411
**Contexto:** Validar estructura VerificationBehavior completa

**❌ ANTES:**
```typescript
await completeStepCorrectly(user, 43); // penny
await completeStepCorrectly(user, 20); // nickel
await completeStepCorrectly(user, 33); // dime
await completeStepCorrectly(user, 8);  // quarter
await completeStepCorrectly(user, 1);  // dollarCoin
await completeStepCorrectly(user, 1);  // bill1
await completeStepCorrectly(user, 1);  // bill5
```

**✅ DESPUÉS:**
```typescript
await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);
```

---

### Secuencia #6: Test 7.12 (líneas 1840-1846)
**Test:** `7.12 - Pantalla "Verificación Exitosa" muestra monto esperado correcto`
**Líneas:** 1840-1846
**Contexto:** Verificar pantalla final con monto total

**❌ ANTES:**
```typescript
await completeStepCorrectly(user, 43); // penny
await completeStepCorrectly(user, 20); // nickel
await completeStepCorrectly(user, 33); // dime
await completeStepCorrectly(user, 8);  // quarter
await completeStepCorrectly(user, 1);  // dollarCoin
await completeStepCorrectly(user, 1);  // bill1
await completeStepCorrectly(user, 1);  // bill5
```

**✅ DESPUÉS:**
```typescript
await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);
```

---

### Secuencia #7: Test 8.2 (líneas 1901-1907)
**Test:** `8.2 - v1.3.6T: buildVerificationBehavior NO causa loop infinito`
**Líneas:** 1901-1907
**Contexto:** Regression test v1.3.6T

**❌ ANTES:**
```typescript
await completeStepCorrectly(user, 43); // penny
await completeStepCorrectly(user, 20); // nickel
await completeStepCorrectly(user, 33); // dime
await completeStepCorrectly(user, 8);  // quarter
await completeStepCorrectly(user, 1);  // dollarCoin
await completeStepCorrectly(user, 1);  // bill1
await completeStepCorrectly(user, 1);  // bill5
```

**✅ DESPUÉS:**
```typescript
await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);
```

---

## 📊 Secuencias Parciales Identificadas

### Secuencia Parcial #8: Test 4.7 + 6.7 (líneas 808-809)
**Contexto:** Completan penny + nickel ANTES de forzar dime
**❌ NO REEMPLAZAR:** Solo 2 pasos (incompleto), parte de test complex pattern

**Líneas 808-809:**
```typescript
await completeStepCorrectly(user, 43); // penny
await completeStepCorrectly(user, 20); // nickel
// Luego force en dime → NO es secuencia completa
```

**Líneas 1579-1580 (test 6.7):**
```typescript
await completeStepCorrectly(user, 43); // penny
await completeStepCorrectly(user, 20); // nickel
// Luego force en dime → MISMO patrón
```

---

### Secuencia Parcial #9: Tests 7.3-7.8 (líneas 1711, 1722, 1755, 1774, 1799)
**Contexto:** Completar solo penny para probar navegación "Anterior"
**❌ NO REEMPLAZAR:** Solo 1 paso (test de navegación, no de completitud)

**Ejemplo línea 1711:**
```typescript
await completeStepCorrectly(user, 43); // penny → avanza a nickel
// Luego prueba botón "Anterior" → NO es secuencia completa
```

---

## 🎯 Resultado Final - Plan de Reemplazo

### Tests a Modificar (7 tests):

1. **Test 2.2** (línea 336) - Grupo 2: Primer Intento Correcto
2. **Test 2.8** (línea 419) - Grupo 2: Primer Intento Correcto
3. **Test 2.11** (línea 457) - Grupo 2: Primer Intento Correcto
4. **Test 2.12** (línea 477) - Grupo 2: Primer Intento Correcto
5. **Test 6.1** (línea 1405) - Grupo 6: buildVerificationBehavior
6. **Test 7.12** (línea 1840) - Grupo 7: Navegación (pantalla final)
7. **Test 8.2** (línea 1901) - Grupo 8: Regression v1.3.6T

**Total líneas eliminadas:** 42 líneas (7 bloques × 7 líneas - 7 líneas helper)
**Total líneas agregadas:** 7 líneas (1 por test)
**Reducción neta:** -35 líneas
**Beneficio async:** Timing robusto con `waitFor()` 3000ms en CADA transición

---

## ✅ Criterios de Éxito

**Después del reemplazo:**
- ✅ Tests modificados: 7 tests
- ✅ Líneas reducidas: -35 líneas
- ✅ Tests passing: Esperado sin cambios (49 + 2 helper = 51 passing)
- ✅ Tests failing: Esperado reducción 71 → ~60-65 (helper NO resuelve todos los async issues aún)

**⚠️ NOTA IMPORTANTE:**
El helper solo reemplaza secuencias COMPLETAS de 7 pasos. Tests con patrones complejos (force override, tercer intento, navegación) mantienen `completeStepCorrectly()` individual.

---

## 📝 Próximo Paso

Ejecutar reemplazos en los 7 tests identificados con comentarios claros:

```typescript
// 🤖 [IA] - v1.3.8 Fase 1: Aplicado helper completeAllStepsCorrectly() (timing robusto)
await completeAllStepsCorrectly(user, [43, 20, 33, 8, 1, 1, 1], mockDeliveryCalculation.verificationSteps);
```

**Comando validación:**
```bash
npm test -- Phase2VerificationSection
```

**Resultado esperado:**
```
✅ 51 passing (49 anteriores + 2 helper validation)
⚠️ 60-65 failing (reducción desde 71 por timing robusto)
Total: 121 tests
```
