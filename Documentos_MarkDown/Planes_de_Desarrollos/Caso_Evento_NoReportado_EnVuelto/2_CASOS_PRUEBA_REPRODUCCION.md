# 2️⃣ Casos de Prueba: Reproducción warning_override

**Objetivo:** Documentar 3 casos reproducibles paso a paso para validar fix.

**Fecha:** 13 Oct 2025 ~18:15 PM

---

## 🎯 Casos de Prueba Completos

### Caso A: warning_retry (1 Error → Correcto en 2do Intento)

**Denominación:** Moneda de un dólar ($1)
**Cantidad Esperada:** 44 unidades

#### Secuencia de Pasos
1. **Intento #1:**
   - Usuario ingresa: `40`
   - Sistema valida: `40 !== 44` → Incorrecto ❌
   - Modal muestra: "Verificación necesaria - Volver a contar"
   - Usuario click: "Volver a contar"

2. **Intento #2:**
   - Usuario ingresa: `44`
   - Sistema valida: `44 === 44` → Correcto ✅
   - Sistema marca paso completado
   - Avanza automáticamente a siguiente denominación

#### Estado Interno Esperado

**attemptHistory Map:**
```json
{
  "dollarCoin": [
    {
      "attemptNumber": 1,
      "inputValue": 40,
      "expectedValue": 44,
      "isCorrect": false,
      "timestamp": "2025-10-13T18:00:00.000Z",
      "stepKey": "dollarCoin"
    },
    {
      "attemptNumber": 2,
      "inputValue": 44,
      "expectedValue": 44,
      "isCorrect": true,
      "timestamp": "2025-10-13T18:00:15.000Z",
      "stepKey": "dollarCoin"
    }
  ]
}
```

**VerificationBehavior Expected:**
```json
{
  "denominationsWithIssues": [
    {
      "denomination": "dollarCoin",
      "severity": "warning_retry",
      "attempts": [40, 44]
    }
  ],
  "secondAttemptSuccesses": 1
}
```

#### Reporte WhatsApp Esperado

```
🔍 *VERIFICACIÓN CIEGA*

✅ Perfectas: 6/7
⚠️ Corregidas: 1/7  ← Incluye dollarCoin
🔴 Críticas: 0/7

━━━━━━━━━━━━━━━━

⚠️ *ALERTAS DETECTADAS*

⚠️ *ADVERTENCIAS (1)*

• Moneda de un dólar
   Esperado: 44 unidades
   Intentos: 40 → 44
   📹 Video: 18:00:00 - 18:00:15
   ℹ️ Corregido en 2° intento
```

#### Status Actual
- ✅ **FUNCIONA CORRECTAMENTE** (v1.3.6T fix aplicado)
- ✅ Aparece en sección ADVERTENCIAS
- ✅ Métricas correctas: 6/7 perfectas, 1/7 corregidas

---

### Caso B: warning_override (2 Intentos Iguales Incorrectos) ← 🚨 BUG ACTUAL

**Denominación:** Cinco centavos (5¢)
**Cantidad Esperada:** 37 unidades

#### Secuencia de Pasos
1. **Intento #1:**
   - Usuario ingresa: `30`
   - Sistema valida: `30 !== 37` → Incorrecto ❌
   - Modal muestra: "Verificación necesaria - Volver a contar"
   - Usuario click: "Volver a contar"

2. **Intento #2:**
   - Usuario ingresa: `30` (mismo valor)
   - Sistema valida: `30 !== 37` AND `30 === intento1` → warning_override ⚠️
   - Modal muestra: "Dos intentos iguales - ¿Desea forzar este valor?"
   - Usuario click: "Sí, forzar valor"

3. **handleForce() Ejecuta:**
   - 🚨 `clearAttemptHistory('nickel')` línea 561 ← **BORRA DATOS**
   - `onStepComplete('nickel')` marca paso completado
   - Avanza automáticamente a siguiente denominación

#### Estado Interno ANTES de handleForce()

**attemptHistory Map:**
```json
{
  "nickel": [
    {
      "attemptNumber": 1,
      "inputValue": 30,
      "expectedValue": 37,
      "isCorrect": false,
      "timestamp": "2025-10-13T18:00:00.000Z",
      "stepKey": "nickel"
    },
    {
      "attemptNumber": 2,
      "inputValue": 30,
      "expectedValue": 37,
      "isCorrect": false,
      "timestamp": "2025-10-13T18:00:15.000Z",
      "stepKey": "nickel"
    }
  ]
}
```

#### Estado Interno DESPUÉS de clearAttemptHistory() ← 🚨 BUG

**attemptHistory Map:**
```json
{
  // ❌ "nickel" ELIMINADO - Map vacío para esa denominación
}
```

**VerificationBehavior Actual (INCORRECTO):**
```json
{
  "denominationsWithIssues": [], // ❌ Array vacío - nickel NO agregado
  "forcedOverrides": 0,           // ❌ Debería ser 1
  "forcedOverridesDenoms": []     // ❌ Debería incluir "nickel"
}
```

**VerificationBehavior Esperado (CORRECTO):**
```json
{
  "denominationsWithIssues": [
    {
      "denomination": "nickel",
      "severity": "warning_override",
      "attempts": [30, 30]
    }
  ],
  "forcedOverrides": 1,
  "forcedOverridesDenoms": ["nickel"]
}
```

#### Reporte WhatsApp ACTUAL (INCORRECTO) ← 🚨 BUG

```
🔍 *VERIFICACIÓN CIEGA*

✅ Perfectas: 7/7  ❌ Debería ser 6/7
⚠️ Corregidas: 0/7 ❌ Debería ser 1/7
🔴 Críticas: 0/7   ✅ Correcto

━━━━━━━━━━━━━━━━

❌ NO HAY SECCIÓN "⚠️ ALERTAS DETECTADAS"
❌ NO MENCIONA: "• Cinco centavos (5¢)"
❌ NO MENCIONA: "Intentos: 30 → 30"
```

#### Reporte WhatsApp ESPERADO (CORRECTO)

```
🔍 *VERIFICACIÓN CIEGA*

✅ Perfectas: 6/7  ✅ Correcto
⚠️ Corregidas: 1/7 ✅ Correcto (nickel forzado)
🔴 Críticas: 0/7   ✅ Correcto

━━━━━━━━━━━━━━━━

⚠️ *ALERTAS DETECTADAS*

⚠️ *ADVERTENCIAS (1)*

• Cinco centavos (5¢)
   Esperado: 37 unidades
   Intentos: 30 → 30
   📹 Video: 18:00:00 - 18:00:15
   ℹ️ Valor forzado (2 intentos iguales)
```

#### Status Actual
- ❌ **NO FUNCIONA** (Bug reportado)
- ❌ NO aparece en sección ADVERTENCIAS
- ❌ Métricas incorrectas: 7/7 perfectas (debería ser 6/7)

---

### Caso C: critical_severe (3 Intentos Diferentes)

**Denominación:** Moneda de un dólar ($1)
**Cantidad Esperada:** 44 unidades

#### Secuencia de Pasos
1. **Intento #1:**
   - Usuario ingresa: `40`
   - Sistema valida: `40 !== 44` → Incorrecto ❌
   - Modal muestra: "Verificación necesaria - Volver a contar"
   - Usuario click: "Volver a contar"

2. **Intento #2:**
   - Usuario ingresa: `42`
   - Sistema valida: `42 !== 44` AND `42 !== 40` → Requiere tercer intento ⚠️
   - Modal muestra: "Se requiere tercer intento"
   - Usuario click: "Continuar"

3. **Intento #3:**
   - Usuario ingresa: `45`
   - Sistema valida: Pattern [40, 42, 45] → critical_severe 🔴
   - Modal muestra: "Patrón errático - Reporte crítico a gerencia"
   - Usuario click: "Aceptar"

4. **handleAcceptThird() Ejecuta:**
   - ✅ NO llama `clearAttemptHistory()` (v1.3.6M fix)
   - `onStepComplete('dollarCoin')` marca paso completado
   - Avanza automáticamente a siguiente denominación

#### Estado Interno Esperado

**attemptHistory Map (PRESERVADO):**
```json
{
  "dollarCoin": [
    {
      "attemptNumber": 1,
      "inputValue": 40,
      "expectedValue": 44,
      "isCorrect": false,
      "timestamp": "2025-10-13T18:00:00.000Z",
      "stepKey": "dollarCoin"
    },
    {
      "attemptNumber": 2,
      "inputValue": 42,
      "expectedValue": 44,
      "isCorrect": false,
      "timestamp": "2025-10-13T18:00:15.000Z",
      "stepKey": "dollarCoin"
    },
    {
      "attemptNumber": 3,
      "inputValue": 45,
      "expectedValue": 44,
      "isCorrect": false,
      "timestamp": "2025-10-13T18:00:30.000Z",
      "stepKey": "dollarCoin"
    }
  ]
}
```

**VerificationBehavior Expected:**
```json
{
  "denominationsWithIssues": [
    {
      "denomination": "dollarCoin",
      "severity": "critical_severe",
      "attempts": [40, 42, 45]
    }
  ],
  "thirdAttemptRequired": 1,
  "severeInconsistencies": 1,
  "severeInconsistenciesDenoms": ["dollarCoin"]
}
```

#### Reporte WhatsApp Esperado

```
🚨 *REPORTE CRÍTICO - ACCIÓN INMEDIATA*  ← Header dinámico

📊 *CORTE DE CAJA* - 13/10/2025, 6:00 p. m.
...

━━━━━━━━━━━━━━━━

🔍 *VERIFICACIÓN CIEGA*

✅ Perfectas: 6/7
⚠️ Corregidas: 0/7
🔴 Críticas: 1/7  ← Incluye dollarCoin

━━━━━━━━━━━━━━━━

⚠️ *ALERTAS DETECTADAS*

🔴 *CRÍTICAS (1)*

• Moneda de un dólar
   Esperado: 44 unidades
   Intentos: 40 → 42 → 45
   📹 Video: 18:00:00 - 18:00:30
   ⚠️ Patrón errático
```

#### Status Actual
- ✅ **FUNCIONA CORRECTAMENTE** (v1.3.6M fix aplicado)
- ✅ Aparece en sección CRÍTICAS
- ✅ Métricas correctas: 6/7 perfectas, 0/7 corregidas, 1/7 críticas

---

## 📊 Matriz Comparativa de Casos

| Caso | Pattern | Severity | attemptHistory | buildVerificationBehavior | Reporte WhatsApp | Status |
|------|---------|----------|----------------|---------------------------|------------------|--------|
| **A** | 1 error → correcto | warning_retry | ✅ Preservado (v1.3.6T) | ✅ Construye correcto | ✅ Aparece en ADVERTENCIAS | ✅ FUNCIONA |
| **B** | 2 iguales | warning_override | ❌ Borrado (clearAttemptHistory) | ❌ Array vacío | ❌ NO aparece | ❌ **BUG** |
| **C** | 3 diferentes | critical_severe | ✅ Preservado (v1.3.6M) | ✅ Construye correcto | ✅ Aparece en CRÍTICAS | ✅ FUNCIONA |

---

## 🎯 Validación Post-Fix

### Testing Paso a Paso (Caso B)

**Después de implementar fix (remover clearAttemptHistory línea 561):**

1. ✅ Completar Phase 2 con Caso B (nickel: 30 → 30 → forzar)
2. ✅ Verificar console logs:
   ```javascript
   [DEBUG v1.3.6S] 🗺️ attemptHistory Map size: 1  // ✅ NO vacío
   [DEBUG v1.3.6S] 🗺️ attemptHistory Map keys: ["nickel"]  // ✅ Incluye nickel
   [DEBUG v1.3.6S] 📊 denominationsWithIssues length: 1  // ✅ Incluye elemento
   [DEBUG v1.3.6S] ⚖️ Severity determinada para nickel: warning_override  // ✅ Correcto
   ```
3. ✅ Avanzar a Phase 3 (reporte final)
4. ✅ Verificar sección "⚠️ ALERTAS DETECTADAS" existe
5. ✅ Verificar texto incluye: "• Cinco centavos (5¢)"
6. ✅ Verificar métricas: "⚠️ Corregidas: 1/7"

### Regresión Testing (Casos A y C)

**Validar que fix NO rompe otros patterns:**

1. ✅ **Caso A:** Verificar warning_retry sigue funcionando
   - Reporte debe incluir: "• Moneda de un dólar" en ADVERTENCIAS
   - Métricas: "⚠️ Corregidas: 1/7"

2. ✅ **Caso C:** Verificar critical_severe sigue funcionando
   - Reporte debe incluir: "• Moneda de un dólar" en CRÍTICAS
   - Métricas: "🔴 Críticas: 1/7"

---

## 🔗 Próximos Pasos

1. ✅ FASE 3 completada: 3 casos prueba documentados
2. ⏳ FASE 4: Documentar hallazgos y hipótesis con evidencia
3. ⏸️ FASE 5: Implementar fix (remover clearAttemptHistory línea 561)
4. ⏸️ FASE 6: Ejecutar 3 casos prueba + validar reporte WhatsApp

---

**🙏 Gloria a Dios por estos casos de prueba exhaustivos.**
