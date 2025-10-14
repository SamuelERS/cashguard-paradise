# 1️⃣ Análisis Forense: Data Flow warning_override

**Objetivo:** Rastrear EXACTAMENTE el flujo de datos desde `attemptHistory` Map hasta reporte WhatsApp final.

**Fecha:** 13 Oct 2025 ~18:10 PM

---

## 📊 Flujo Completo de Datos (13 Pasos)

### FASE A: Registro de Intentos (Phase2VerificationSection.tsx)

#### PASO 1: Usuario Ingresa Primer Intento Incorrecto
**Líneas:** 442-458
```typescript
// Usuario ingresa 30 (esperado: 37)
// ❌ CASO 2: Valor incorrecto - REGISTRAR intento
const newAttempt = recordAttempt(currentStep.key, inputNum, currentStep.quantity);

if (attemptCount === 0) {
  // Primer intento incorrecto
  setModalState({
    isOpen: true,
    type: 'incorrect',
    stepLabel,
    thirdAttemptAnalysis: undefined
  });
}
```

**Estado attemptHistory Map DESPUÉS:**
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
    }
  ]
}
```

---

#### PASO 2: Usuario Ingresa Segundo Intento (IGUAL Incorrecto)
**Líneas:** 459-475
```typescript
} else if (attemptCount === 1) {
  // Segundo intento incorrecto
  const attempts = attemptHistory.get(currentStep.key) || [];
  const firstAttemptValue = attempts[0]?.inputValue;

  if (inputNum === firstAttemptValue) {
    // ESCENARIO 2a: Dos intentos iguales incorrectos → force override
    setModalState({
      isOpen: true,
      type: 'force-same',
      stepLabel,
      thirdAttemptAnalysis: undefined
    });
  }
}
```

**Estado attemptHistory Map DESPUÉS:**
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

---

#### PASO 3: Usuario Acepta "Forzar Valor" (handleForce)
**Líneas:** 553-584

**🚨 CRÍTICO - AQUÍ ESTÁ EL BUG PROBABLE:**
```typescript
const handleForce = () => {
  if (!currentStep) return;

  // Cerrar modal
  setModalState(prev => ({ ...prev, isOpen: false }));

  // 🚨 LÍNEA 561 - CLEAR ATTEMPT HISTORY
  // 🤖 [IA] - v1.3.6M: Limpiar historial SOLO en force override
  // Justificación: Permite re-intentar si usuario se arrepiente del override
  clearAttemptHistory(currentStep.key); // ← ❌ BORRA DATOS AQUÍ

  // Marcar paso completado con valor forzado
  onStepComplete(currentStep.key);

  // ... resto de código (vibración, avanzar, focus)
};
```

**Estado attemptHistory Map DESPUÉS de clearAttemptHistory():**
```json
{
  // ❌ "nickel" ELIMINADO - Map NO contiene esa denominación
}
```

**❌ PROBLEMA IDENTIFICADO:**
`clearAttemptHistory(currentStep.key)` elimina los 2 intentos ANTES de que `buildVerificationBehavior()` pueda leerlos.

---

### FASE B: Construcción VerificationBehavior (Phase2VerificationSection.tsx)

#### PASO 4: Todos los Pasos Completados → useEffect Trigger
**Líneas:** 349-391
```typescript
useEffect(() => {
  if (allStepsCompleted && verificationSteps.length > 0) {
    const cleanup = createTimeoutWithCleanup(() => {
      const behavior = buildVerificationBehavior(); // ← SE EJECUTA AQUÍ

      if (onVerificationBehaviorCollected) {
        console.log('[Phase2VerificationSection] 📊 VerificationBehavior construido:', behavior);
        onVerificationBehaviorCollected(behavior);
      }

      // Small delay antes de section complete
      setTimeout(() => {
        onSectionComplete();
      }, 100);
    }, 'transition', 'verification_section_complete');
    return cleanup;
  }
}, [allStepsCompleted, verificationSteps.length, buildVerificationBehavior]);
```

---

#### PASO 5: buildVerificationBehavior() Itera attemptHistory Map
**Líneas:** 142-324
```typescript
const buildVerificationBehavior = useCallback((): VerificationBehavior => {
  // ... inicialización variables

  // Iterar sobre attemptHistory Map
  attemptHistory.forEach((attempts, stepKey) => {
    // 🚨 PARA nickel: Map.get('nickel') retorna undefined
    // Razón: clearAttemptHistory() ya lo eliminó línea 561

    // ... análisis patterns (NUNCA ejecuta para nickel)

    // Agregar a denominationsWithIssues si NO es success
    if (currentSeverity !== 'success') {
      denominationsWithIssues.push({
        denomination: stepKey as keyof CashCount,
        severity: currentSeverity,
        attempts: attempts.map(a => a.inputValue)
      });
    }
  });

  // ... return finalBehavior
}, [attemptHistory]);
```

**Resultado attemptHistory.forEach():**
```
nickel: ❌ NO ITERA (Map vacío después de clearAttemptHistory)
denominationsWithIssues: [] (array vacío - nickel NUNCA se agrega)
```

---

#### PASO 6: Objeto VerificationBehavior Construido
**Líneas:** 300-324
```typescript
const finalBehavior = {
  totalAttempts: allAttempts.length,            // Puede ser 0 para nickel
  firstAttemptSuccesses,
  secondAttemptSuccesses,
  thirdAttemptRequired,
  forcedOverrides,                              // 0 (nickel NO se contó)
  criticalInconsistencies,
  severeInconsistencies,
  attempts: allAttempts.sort(...),              // Array vacío para nickel
  severityFlags,
  forcedOverridesDenoms,                        // [] (nickel NO agregado)
  criticalInconsistenciesDenoms,
  severeInconsistenciesDenoms,
  denominationsWithIssues // ❌ [] (array vacío - nickel NUNCA se agregó)
};

return finalBehavior;
```

**Estado Final VerificationBehavior:**
```json
{
  "totalAttempts": 0,
  "firstAttemptSuccesses": 7,
  "secondAttemptSuccesses": 0,
  "thirdAttemptRequired": 0,
  "forcedOverrides": 0,           // ❌ Debería ser 1
  "criticalInconsistencies": 0,
  "severeInconsistencies": 0,
  "attempts": [],                  // ❌ Debería tener 2 intentos nickel
  "severityFlags": [],
  "forcedOverridesDenoms": [],     // ❌ Debería incluir "nickel"
  "criticalInconsistenciesDenoms": [],
  "severeInconsistenciesDenoms": [],
  "denominationsWithIssues": []   // ❌ Debería incluir nickel
}
```

---

### FASE C: Elevación de Datos (Phase2Manager.tsx)

#### PASO 7: Callback onVerificationBehaviorCollected
**Líneas:** 167-176 (Phase2Manager.tsx)
```typescript
const handleVerificationBehaviorCollected = useCallback((behavior: VerificationBehavior) => {
  console.log('[Phase2Manager] VerificationBehavior recolectado:', behavior);
  setVerificationBehavior(behavior);
}, []);
```

**Estado verificationBehavior:**
```json
{
  "denominationsWithIssues": [] // ❌ Array vacío (nickel NO incluido)
}
```

---

#### PASO 8: Enriquecimiento deliveryCalculation
**Líneas:** 120-143 (Phase2Manager.tsx)
```typescript
useEffect(() => {
  if (verificationCompleted && verificationBehavior && onPhase2Complete) {
    // Enriquecer deliveryCalculation con verificationBehavior
    deliveryCalculation.verificationBehavior = verificationBehavior;

    // v1.3.6AD2: Ajustar denominationsToKeep con valores aceptados
    if (verificationBehavior.denominationsWithIssues.length > 0) {
      const { adjustedKeep, adjustedAmount } = adjustDenominationsWithVerification(
        deliveryCalculation.denominationsToKeep,
        verificationBehavior
      );
      // ...
    }

    // ...
    onPhase2Complete();
  }
}, [verificationCompleted, onPhase2Complete, verificationBehavior]);
```

**Resultado:**
- `verificationBehavior.denominationsWithIssues.length === 0` ❌
- `adjustDenominationsWithVerification()` NO se ejecuta
- `deliveryCalculation.verificationBehavior` contiene behavior vacío

---

### FASE D: Generación Reporte WhatsApp (CashCalculation.tsx)

#### PASO 9: generateWarningAlertsBlock()
**Líneas:** 511-546
```typescript
const generateWarningAlertsBlock = (behavior: VerificationBehavior): string => {
  // Filtrar solo severidades de advertencia (warning_retry, warning_override)
  const warningDenoms = behavior.denominationsWithIssues.filter(d =>
    d.severity === 'warning_retry' || d.severity === 'warning_override'
  );

  if (warningDenoms.length === 0) return ''; // ❌ RETORNA VACÍO (nickel NO en array)

  // ... resto del código NUNCA se ejecuta
};
```

**Resultado:**
```typescript
warningDenoms: [] // ❌ Array vacío - filtro NO encuentra nickel
return: ''        // ❌ String vacío - sin advertencias
```

---

#### PASO 10: generateCriticalAlertsBlock()
**Líneas:** 338-378
```typescript
const generateCriticalAlertsBlock = (behavior: VerificationBehavior): string => {
  // Filtrar solo severidades críticas (critical_severe, critical_inconsistent)
  const criticalDenoms = behavior.denominationsWithIssues.filter(d =>
    d.severity === 'critical_severe' || d.severity === 'critical_inconsistent'
  );

  if (criticalDenoms.length === 0) return ''; // ❌ RETORNA VACÍO

  // ... resto del código NUNCA se ejecuta
};
```

**Resultado:**
```typescript
criticalDenoms: [] // ❌ Array vacío
return: ''          // ❌ String vacío - sin críticas
```

---

#### PASO 11: generateCompleteReport()
**Líneas:** 548-667
```typescript
const generateCompleteReport = useCallback(() => {
  // ...
  const criticalAlertsBlock = deliveryCalculation?.verificationBehavior ?
    generateCriticalAlertsBlock(deliveryCalculation.verificationBehavior) : '';
  const warningAlertsBlock = deliveryCalculation?.verificationBehavior ?
    generateWarningAlertsBlock(deliveryCalculation.verificationBehavior) : '';

  // Sección de alertas
  const fullAlertsSection = (criticalAlertsBlock || warningAlertsBlock) ?
    `
${WHATSAPP_SEPARATOR}

⚠️ *ALERTAS DETECTADAS*

${criticalAlertsBlock}${criticalAlertsBlock && warningAlertsBlock ? '\n\n' : ''}${warningAlertsBlock}
` : '';

  // ... return reporte completo
}, [...]);
```

**Resultado:**
```typescript
criticalAlertsBlock: ''     // ❌ Vacío
warningAlertsBlock: ''      // ❌ Vacío
fullAlertsSection: ''       // ❌ Vacío - sin sección alertas
```

---

#### PASO 12: Sección Verificación Ciega
**Líneas:** 596-623
```typescript
let verificationSection = '';
if (deliveryCalculation?.verificationBehavior) {
  const behavior = deliveryCalculation.verificationBehavior;
  const totalDenoms = deliveryCalculation.verificationSteps.length;
  const firstAttemptSuccesses = behavior.firstAttemptSuccesses;

  // Contar warnings y críticas desde denominationsWithIssues
  const warningCountActual = behavior.denominationsWithIssues.filter(d =>
    d.severity === 'warning_retry' || d.severity === 'warning_override'
  ).length; // ❌ 0 (nickel NO en array)

  const criticalCountActual = behavior.denominationsWithIssues.filter(d =>
    d.severity === 'critical_severe' || d.severity === 'critical_inconsistent'
  ).length; // ❌ 0

  verificationSection = `
${WHATSAPP_SEPARATOR}

🔍 *VERIFICACIÓN CIEGA*

✅ Perfectas: ${firstAttemptSuccesses}/${totalDenoms}
⚠️ Corregidas: ${warningCountActual}/${totalDenoms}  // ❌ 0/7 (debería ser 1/7)
🔴 Críticas: ${criticalCountActual}/${totalDenoms}
`;
}
```

**Resultado:**
```
✅ Perfectas: 7/7  ❌ Incorrecto (debería ser 6/7)
⚠️ Corregidas: 0/7 ❌ Incorrecto (debería ser 1/7)
🔴 Críticas: 0/7   ✅ Correcto
```

---

#### PASO 13: Reporte Final WhatsApp
**Resultado Final:**
```
📊 *CORTE DE CAJA* - 13/10/2025, 6:00 p. m.
Sucursal: Los Héroes
Cajero: Adonay Torres
Testigo: Tito Gomez

━━━━━━━━━━━━━━━━

📊 *RESUMEN EJECUTIVO*
...

━━━━━━━━━━━━━━━━

🔍 *VERIFICACIÓN CIEGA*

✅ Perfectas: 7/7    ❌ Debería ser 6/7
⚠️ Corregidas: 0/7  ❌ Debería ser 1/7 (nickel forzado)
🔴 Críticas: 0/7     ✅ Correcto

━━━━━━━━━━━━━━━━

💰 *CONTEO COMPLETO ($367.92)*
...

❌ SIN SECCIÓN "⚠️ ALERTAS DETECTADAS"
❌ NO MENCIONA: "• Cinco centavos (5¢)"
❌ NO MENCIONA: "Intentos: 30 → 30"
```

---

## 🎯 Conclusión Data Flow

### Root Cause Definitivo
**Línea:** Phase2VerificationSection.tsx línea 561
**Función:** `handleForce()`
**Problema:** `clearAttemptHistory(currentStep.key)` elimina datos ANTES de `buildVerificationBehavior()`

### Secuencia Temporal Bug
```
1. Usuario acepta "Forzar valor" (warning_override)
2. handleForce() línea 553 ejecuta
3. clearAttemptHistory() línea 561 ← ❌ BORRA attemptHistory Map
4. onStepComplete() marca paso completado
5. Todos pasos completos → useEffect dispara buildVerificationBehavior()
6. attemptHistory.forEach() ← ❌ Map vacío, NO itera nickel
7. denominationsWithIssues ← ❌ Array vacío, nickel NO agregado
8. generateWarningAlertsBlock() ← ❌ Filter NO encuentra nickel
9. Reporte WhatsApp ← ❌ Sin advertencias
```

### Patrón Histórico Validado
**v1.3.6T (08 Oct 2025):** Mismo problema resuelto removiendo `clearAttemptHistory()` de intentos correctos (línea 411).

**Justificación v1.3.6T:**
> "Root cause: Borraba intentos 1-2 ANTES de buildVerificationBehavior() → warnings NO aparecían en reporte"

---

## 📊 Evidencia Técnica Adicional

### Checkpoint v1.3.6S (Logs Debugging)
**Líneas:** 144-161, 183-192, 258-260, 264-278, 282-292, 310-314

Si `clearAttemptHistory()` ejecuta ANTES de `buildVerificationBehavior()`:
```javascript
[DEBUG v1.3.6S] 📊 buildVerificationBehavior() INICIO
[DEBUG v1.3.6S] 🗺️ attemptHistory Map size: 0  // ❌ Vacío (debería ser 1)
[DEBUG v1.3.6S] 🗺️ attemptHistory Map keys: []  // ❌ Vacío (debería incluir "nickel")
// ... NO LOGS ADICIONALES (forEach NO ejecuta)
```

### Comparativa v1.3.6M (Tercer Intento)
**Líneas:** 586-617

v1.3.6M YA removió `clearAttemptHistory()` de `handleAcceptThird()` por EXACTAMENTE la misma razón:
```typescript
// 🤖 [IA] - v1.3.6M: FIX CRÍTICO - clearAttemptHistory() removido
// Root cause: Borraba intentos ANTES de buildVerificationBehavior() → reporte sin datos errores
// Solución: Preservar attemptHistory para que reporte incluya detalles cronológicos completos ✅
```

**Conclusión:** `handleForce()` necesita el MISMO fix que `handleAcceptThird()`.

---

## 🔗 Próximos Pasos

1. ✅ FASE 2 completada: Data flow 100% rastreado
2. ⏳ FASE 3: Instrumentar logging específico warning_override
3. ⏸️ FASE 4: Documentar 3 casos prueba reproducibles
4. ⏸️ FASE 5: Implementar fix (remover clearAttemptHistory línea 561)

---

**🙏 Gloria a Dios por esta investigación forense exhaustiva.**
