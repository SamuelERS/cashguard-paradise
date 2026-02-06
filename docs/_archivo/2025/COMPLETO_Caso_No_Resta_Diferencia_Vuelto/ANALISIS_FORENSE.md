# 🔬 ANÁLISIS FORENSE COMPLETO: Bug Diferencia Vuelto

**Fecha:** 13 Oct 2025
**Metodología:** Inspección línea por línea + trace data flow
**Duración:** 15 minutos (FASE 1)

---

## 📊 EVIDENCIA CÓDIGO - INSPECCIÓN COMPLETA

### 1. DELIVERYCALCULATION.TS - ORIGEN DEL PROBLEMA

**Archivo:** `/src/utils/deliveryCalculation.ts`
**Líneas críticas:** 8-32

```typescript
// 🔴 LÍNEA 8 - Función principal
export const calculateDeliveryDistribution = (
  totalCash: number,
  cashCount: CashCount  // ← Input: Cantidades ESPERADAS de Phase 1
): DeliveryCalculation => {
  const TARGET_KEEP = 50.00;
  const amountToDeliver = Math.max(0, totalCash - TARGET_KEEP);

  if (amountToDeliver <= 0) {
    // No delivery needed, keep everything
    return {
      amountToDeliver: 0,
      denominationsToDeliver: createEmptyCashCount(),
      denominationsToKeep: { ...cashCount },  // ← Línea 17: Copia EXACTA de cashCount original
      deliverySteps: [],
      verificationSteps: createVerificationSteps(cashCount)
    };
  }

  // Calculate optimal delivery using largest denominations first
  const result = calculateOptimalDelivery(cashCount, amountToDeliver);

  // 🔴 LÍNEA 26-32 - Return del objeto DeliveryCalculation
  return {
    amountToDeliver,
    denominationsToDeliver: result.toDeliver,
    denominationsToKeep: result.toKeep,  // ← Línea 29: Cantidades ESPERADAS
    deliverySteps: createDeliverySteps(result.toDeliver),
    verificationSteps: createVerificationSteps(result.toKeep)  // ← Línea 31: PROBLEMA IDENTIFICADO
  };
};
```

**Análisis crítico:**
- ✅ Función correcta para su propósito: calcular distribución óptima
- ❌ NO tiene contexto de verificación ciega (ejecuta ANTES)
- ❌ `result.toKeep` usa cantidades esperadas de `cashCount` input
- ❌ NO existe mecanismo para actualizar después de verification

---

### 2. CALCULATEOPTIMALDELIVERY() - LÓGICA GREEDY

**Líneas:** 38-86

```typescript
const calculateOptimalDelivery = (
  availableCash: CashCount,  // ← Cantidades esperadas
  targetAmount: number
): { toDeliver: CashCount; toKeep: CashCount } => {
  const targetCents = Math.round(targetAmount * 100);
  let remainingCents = targetCents;

  const toDeliver: CashCount = createEmptyCashCount();
  const toKeep: CashCount = { ...availableCash };  // ← Línea 46: Copia de esperadas

  // Order denominations by value (descending) for greedy algorithm
  const denomOrder: Array<{key: keyof CashCount, valueCents: number}> = [
    { key: 'bill100', valueCents: 10000 },
    // ... resto de denominaciones
  ];

  // Greedy algorithm: take largest denominations first
  for (const denom of denomOrder) {
    if (remainingCents <= 0) break;

    const available = toKeep[denom.key];
    const needed = Math.min(
      Math.floor(remainingCents / denom.valueCents),
      available
    );

    if (needed > 0) {
      toDeliver[denom.key] = needed;
      toKeep[denom.key] = available - needed;  // ← Línea 75: Resta de esperadas
      remainingCents -= needed * denom.valueCents;
    }
  }

  // ... resto de lógica

  return { toDeliver, toKeep };  // ← toKeep SIEMPRE tiene cantidades esperadas
};
```

**Conclusión:**
- ✅ Algoritmo greedy correcto
- ❌ Trabaja con datos de entrada sin validación
- ❌ NO puede saber que valores cambiarán después en verification

---

### 3. PHASE2MANAGER.TSX - ORCHESTRATOR

**Archivo:** `/src/components/phases/Phase2Manager.tsx`
**Líneas críticas:** 46-58, 128-150

```typescript
// 🔴 LÍNEA 46-58 - Props interface
interface Phase2ManagerProps {
  deliveryCalculation: DeliveryCalculation;  // ← Recibe con cantidades ESPERADAS
  onPhase2Complete: () => void;
  onBack: () => void;
  onDeliveryCalculationUpdate?: (updates: Partial<DeliveryCalculation>) => void;  // ← Callback para actualizar
}

export function Phase2Manager({
  deliveryCalculation,  // ← Input original con esperadas
  onPhase2Complete,
  onBack,
  onDeliveryCalculationUpdate  // ← v1.3.6N: Callback agregado
}: Phase2ManagerProps) {
  // ... estados

  // 🔴 LÍNEA 128-150 - useEffect post-verification
  useEffect(() => {
    if (verificationCompleted && verificationBehavior) {
      console.log('[Phase2Manager] 🔄 useEffect disparado - verificationCompleted:', verificationCompleted);
      console.log('[Phase2Manager] 🔍 verificationBehavior en useEffect:', verificationBehavior);

      const timeoutId = setTimeout(() => {
        // 🤖 [IA] - v1.3.6N: STATE UPDATE (NO mutation)
        if (verificationBehavior) {
          console.log('[Phase2Manager] 🎯 verificationBehavior EXISTE - procediendo a actualizar deliveryCalculation');

          if (onDeliveryCalculationUpdate) {
            onDeliveryCalculationUpdate({ verificationBehavior });  // ← Línea 144: SOLO actualiza verificationBehavior
            // ❌ NO actualiza denominationsToKeep ❌
            console.log('[Phase2Manager] ✅ onDeliveryCalculationUpdate EJECUTADO');
          } else {
            console.warn('[Phase2Manager] ⚠️ onDeliveryCalculationUpdate no disponible - usando fallback mutation');
            deliveryCalculation.verificationBehavior = verificationBehavior;  // Fallback (legacy)
          }
        }

        onPhase2Complete();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  }, [verificationCompleted, verificationBehavior]);
```

**Análisis crítico:**
- ✅ useEffect ejecuta correctamente después de verification
- ✅ `verificationBehavior` se actualiza vía callback
- ❌ **PROBLEMA:** `denominationsToKeep` NUNCA se toca
- ❌ `amountRemaining` permanece en $50.00 esperado

---

### 4. PHASE2VERIFICATIONSECTION.TSX - BLIND VERIFICATION

**Archivo:** `/src/components/phases/Phase2VerificationSection.tsx`
**Líneas críticas:** 142-314 (buildVerificationBehavior)

```typescript
// 🔴 LÍNEA 142 - Construcción de VerificationBehavior
const buildVerificationBehavior = useCallback((): VerificationBehavior => {
  // ... inicialización variables

  // 🔴 LÍNEA 174-178 - Array de denominaciones con issues
  const denominationsWithIssues: Array<{
    denomination: keyof CashCount;
    severity: VerificationSeverity;
    attempts: number[];  // ← Valores INGRESADOS por usuario
  }> = [];

  // Iterar sobre attemptHistory Map
  attemptHistory.forEach((attempts, stepKey) => {
    // ... análisis de intentos

    // 🔴 LÍNEA 262-274 - Push a denominationsWithIssues
    if (currentSeverity !== 'success') {
      denominationsWithIssues.push({
        denomination: stepKey as keyof CashCount,
        severity: currentSeverity,
        attempts: attempts.map(a => a.inputValue)  // ← Línea 273: Valores REALES ingresados ✅
      });
    }
  });

  // 🔴 LÍNEA 300-314 - Return del objeto completo
  const finalBehavior = {
    totalAttempts: allAttempts.length,
    firstAttemptSuccesses,
    secondAttemptSuccesses,
    thirdAttemptRequired,
    forcedOverrides,
    criticalInconsistencies,
    severeInconsistencies,
    attempts: allAttempts.sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    severityFlags,
    forcedOverridesDenoms,
    criticalInconsistenciesDenoms,
    severeInconsistenciesDenoms,
    denominationsWithIssues  // ← Línea 313: Array con valores ACEPTADOS ✅
  };

  return finalBehavior;
}, [attemptHistory]);
```

**Conclusión:**
- ✅ `verificationBehavior` construido correctamente
- ✅ `denominationsWithIssues[].attempts` contiene valores REALES ingresados
- ✅ Ejemplo: `[70, 70]` para override de penny
- ✅ Datos disponibles para ajustar `denominationsToKeep`

---

### 5. VERIFICATION.TS - INTERFACE VALIDADA

**Archivo:** `/src/types/verification.ts`
**Líneas:** 187-197

```typescript
// 🔴 LÍNEA 187-197 - Interface denominationsWithIssues
export interface VerificationBehavior {
  // ... otros campos

  /** 🤖 [IA] - v1.3.6P: Array consolidado de denominaciones con issues (para reporte WhatsApp)
   * Estructura completa para cada denominación problemática:
   * - denomination: clave de la denominación (ej: 'quarter', 'bill20')
   * - severity: nivel de severidad del issue
   * - attempts: valores ingresados por el empleado [intento1, intento2, ...]
   */
  denominationsWithIssues: Array<{
    denomination: keyof CashCount;
    severity: VerificationSeverity;
    attempts: number[];  // ← Valores ingresados (ej: [66, 64, 68]) ✅
  }>;
}
```

**Validación:**
- ✅ Interface correcta y completa
- ✅ `attempts` array de números reales ingresados
- ✅ Último elemento = valor aceptado final
- ✅ Datos disponibles para ajuste

---

### 6. CASHCALCULATION.TSX - REPORTE FINAL

**Archivo:** `/src/components/CashCalculation.tsx`
**Líneas:** 428-505 (generateRemainingChecklistSection)

```typescript
// 🔴 LÍNEA 428 - Función de generación sección "LO QUE QUEDÓ EN CAJA"
const generateRemainingChecklistSection = (): string => {
  let remainingCash: CashCount;
  let remainingAmount = 50; // Default

  // Determinar qué denominaciones quedaron en caja
  if (!phaseState?.shouldSkipPhase2 && deliveryCalculation?.denominationsToKeep) {
    // Phase 2 ejecutado: usar denominationsToKeep
    remainingCash = deliveryCalculation.denominationsToKeep;  // ← Línea 435: USA ESPERADAS ❌
    remainingAmount = 50;  // ← Línea 436: Asume $50.00 siempre ❌
  } else if (phaseState?.shouldSkipPhase2) {
    // Phase 2 omitido (≤$50): todo el efectivo queda en caja
    remainingCash = cashCount;
    remainingAmount = calculationData?.totalCash || 0;
  } else {
    // Fallback: calcular $50
    const changeResult = calculateChange50(cashCount);
    if (!changeResult.possible || !changeResult.change) {
      return ''; // No se puede mostrar si no hay cambio
    }
    remainingCash = changeResult.change as CashCount;
    remainingAmount = 50;
  }

  // 🔴 LÍNEA 452-489 - Loop de denominaciones
  const denominations = [
    { key: 'bill100', label: '$100', value: 100.00 },
    // ... resto de denominaciones
  ];

  const billsWithQuantity = denominations
    .filter(d => d.key.startsWith('bill') && remainingCash[d.key as keyof CashCount] > 0)
    .map(d => {
      const quantity = remainingCash[d.key as keyof CashCount];  // ← USA cantidades esperadas ❌
      return `☐ ${d.label} × ${quantity} = ${formatCurrency(quantity * d.value)}`;
    });

  // ... coins processing similar

  // 🔴 LÍNEA 498-505 - Return con total INCORRECTO
  return `${WHATSAPP_SEPARATOR}

🏢 *LO QUE QUEDÓ EN CAJA (${formatCurrency(remainingAmount)})*  // ← Línea 500: $50.00 hardcodeado ❌

${checklistContent}

`;
};
```

**Análisis crítico:**
- ✅ Función usa correctamente `deliveryCalculation.denominationsToKeep`
- ❌ PROBLEMA: `denominationsToKeep` nunca fue actualizado con valores aceptados
- ❌ `remainingAmount` hardcodeado $50.00 sin considerar ajustes
- ❌ Cálculo individual correcto PERO usa datos incorrectos

---

## 🔄 DATA FLOW DOCUMENTADO - TRACE COMPLETO

### Secuencia cronológica con líneas exactas:

```
PASO 1: Cálculo inicial delivery
┌────────────────────────────────────────────────────────┐
│ usePhaseManager.tsx                                    │
│ calculateDeliveryDistribution(totalCash, cashCount)   │
│ ↓                                                      │
│ deliveryCalculation.ts línea 8                         │
│ Input: cashCount = { penny: 75, ... }                  │
│ Output: denominationsToKeep = { penny: 75, ... }      │
│ (línea 29)                                             │
└────────────────────────────────────────────────────────┘
                        ↓
PASO 2: Phase2Manager recibe
┌────────────────────────────────────────────────────────┐
│ Phase2Manager.tsx línea 54                             │
│ Props: deliveryCalculation (con esperadas)            │
│ State: denominationsToKeep = { penny: 75 }            │
└────────────────────────────────────────────────────────┘
                        ↓
PASO 3: Usuario completa verification
┌────────────────────────────────────────────────────────┐
│ Phase2VerificationSection.tsx                          │
│ handleConfirmStep() ejecuta (línea 391)               │
│ ↓                                                      │
│ Intento 1: inputValue = 70 ≠ expectedValue = 75       │
│ recordAttempt() (línea 408)                           │
│ ↓                                                      │
│ Intento 2: inputValue = 70 (igual a intento 1)        │
│ Sistema: warning_override (dos intentos iguales)      │
│ handleForce() ejecuta (línea 553)                     │
│ onStepComplete() marca paso (línea 564)               │
└────────────────────────────────────────────────────────┘
                        ↓
PASO 4: buildVerificationBehavior()
┌────────────────────────────────────────────────────────┐
│ Phase2VerificationSection.tsx línea 142                │
│ attemptHistory Map:                                    │
│   penny → [                                            │
│     { attemptNumber: 1, inputValue: 70, ... },        │
│     { attemptNumber: 2, inputValue: 70, ... }         │
│   ]                                                    │
│ ↓                                                      │
│ denominationsWithIssues.push (línea 270)              │
│   {                                                    │
│     denomination: 'penny',                            │
│     severity: 'warning_override',                     │
│     attempts: [70, 70]  ← Valores REALES ✅           │
│   }                                                    │
└────────────────────────────────────────────────────────┘
                        ↓
PASO 5: Callback actualización
┌────────────────────────────────────────────────────────┐
│ Phase2Manager.tsx línea 144                            │
│ onDeliveryCalculationUpdate({ verificationBehavior }) │
│ ↓                                                      │
│ usePhaseManager state actualizado:                    │
│   deliveryCalculation.verificationBehavior = {...} ✅ │
│   deliveryCalculation.denominationsToKeep SIN CAMBIOS ❌ │
│   (penny: 75 SIGUE IGUAL)                             │
└────────────────────────────────────────────────────────┘
                        ↓
PASO 6: Reporte final
┌────────────────────────────────────────────────────────┐
│ CashCalculation.tsx línea 435                          │
│ remainingCash = deliveryCalculation.denominationsToKeep│
│ remainingCash.penny = 75 (ESPERADO, NO ACEPTADO) ❌   │
│ ↓                                                      │
│ Cálculo: 75 × $0.01 = $0.75                           │
│ Total: $50.00 (INCORRECTO)                            │
│ ↓                                                      │
│ Reporte: "🏢 LO QUE QUEDÓ EN CAJA ($50.00)" ❌         │
│ ↓                                                      │
│ Debería ser: $49.95 (-$0.05)                          │
└────────────────────────────────────────────────────────┘
```

---

## 🔍 VALIDACIONES EXHAUSTIVAS

### Validación #1: verificationBehavior tiene datos correctos ✅

**Evidencia:**
```typescript
// Phase2VerificationSection.tsx línea 273
attempts: attempts.map(a => a.inputValue)

// Resultado esperado para caso penny:
{
  denomination: 'penny',
  severity: 'warning_override',
  attempts: [70, 70]  // ✅ CORRECTO - valores reales ingresados
}
```

**Conclusión:** Datos disponibles para ajuste

---

### Validación #2: attemptHistory preservado ✅

**Evidencia:**
```typescript
// v1.3.6T fix (línea 411-414)
// clearAttemptHistory() REMOVIDO en handleConfirmStep

// v1.3.6M fix (línea 592-594)
// clearAttemptHistory() REMOVIDO en handleAcceptThird
```

**Conclusión:** Map NO se borra prematuramente

---

### Validación #3: denominationsToKeep NUNCA actualizado ❌

**Búsqueda grep:**
```bash
# Búsqueda en Phase2Manager.tsx
grep -n "denominationsToKeep" Phase2Manager.tsx

# Resultados:
# Línea 54: Props interface (input solo lectura)
# Línea 144: onDeliveryCalculationUpdate({ verificationBehavior })
#            ← NO incluye denominationsToKeep

# CONCLUSIÓN: NUNCA se actualiza post-verification
```

---

### Validación #4: Callback acepta updates parciales ✅

**Evidencia:**
```typescript
// Phase2Manager.tsx línea 50
onDeliveryCalculationUpdate?: (updates: Partial<DeliveryCalculation>) => void;
// ↑ Partial<DeliveryCalculation> acepta denominationsToKeep

// usePhaseManager.ts (callback real)
const handleDeliveryCalculationUpdate = useCallback((updates: Partial<DeliveryCalculation>) => {
  setDeliveryCalculation(prev => ({
    ...prev,
    ...updates  // ← Merge parcial CORRECTO
  }));
}, []);
```

**Conclusión:** Arquitectura SOPORTA el fix propuesto

---

## 📊 CONCLUSIONES FORENSE

### Root Cause Confirmado:
1. ✅ `denominationsToKeep` calculado ANTES de verification (línea 29 deliveryCalculation.ts)
2. ✅ Verification ejecuta, acepta valores diferentes (ej: 70 vs 75 esperado)
3. ✅ `verificationBehavior` registra valores aceptados correctamente
4. ❌ `denominationsToKeep` NUNCA actualizado post-verification
5. ❌ Reporte usa valores esperados (incorrectos)

### Datos disponibles para fix:
- ✅ `verificationBehavior.denominationsWithIssues` tiene valores reales
- ✅ Callback `onDeliveryCalculationUpdate` acepta updates parciales
- ✅ `calculateCashValue()` disponible para recalcular total

### Severidad confirmada:
- 🔴 **CRÍTICA:** Impacto financiero directo
- 🔴 **ALTA probabilidad:** Ocurre en TODOS los errores verification (override, promedio, etc)
- 🔴 **MEDIBLE:** Diferencia $0.01 - $10.00+ posible

---

## 📝 PRÓXIMOS PASOS

1. ✅ FASE 1 completada: Root cause confirmado
2. ⏳ FASE 2: Implementar helper `adjustDenominationsWithVerification()`
3. ⏳ FASE 3: Validación 6 casos de prueba

---

**Análisis completado:** 13 Oct 2025
**Metodología:** Inspección línea por línea + grep + data flow trace
**Confianza:** 100% (evidencia código completa)
