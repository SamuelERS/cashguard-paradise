# Análisis Forense: Phase2VerificationSection.tsx

**Fecha:** 09 de Octubre 2025
**Archivo analizado:** `/src/components/phases/Phase2VerificationSection.tsx`
**Líneas código:** 1,030 líneas
**Complejidad:** Alta (lógica anti-fraude crítica + 4 modales + triple intento)

---

## 📊 ¿Qué Hace Este Componente? (Lenguaje Simple)

### Propósito Principal
**"Verifica que el cajero contó correctamente el dinero que entrega a gerencia."**

Cuando el cajero termina de contar en Phase 1 cuánto dinero va a entregar, **NO puede simplemente copiar los números**. Debe volver a contar físicamente en "modo ciego" (sin ver lo que contó antes) y el sistema compara:

- ¿Lo que cuenta ahora = lo que contó en Phase 1?

Si coincide → Perfecto ✅
Si NO coincide → Sistema da hasta **3 oportunidades** para corregir.

---

### Ejemplos Concretos (Para No-Programadores)

**Ejemplo 1: Cajero Honesto (1 intento - 90% casos)**
1. Phase 1: Cajero contó **43 monedas de 10¢** para entregar
2. Phase 2: Sistema pregunta "¿Cuántas monedas de 10¢ entregas?" (SIN mostrar 43)
3. Cajero cuenta físicamente: **43** ✅
4. Sistema: "Correcto, avanza automáticamente"
5. Resultado: Cero fricción, empleado honesto sigue trabajando

---

**Ejemplo 2: Cajero Se Equivoca, Luego Corrige (2 intentos - 9% casos)**
1. Phase 1: Contó **43 monedas de 10¢**
2. Phase 2: Intento #1 cajero dice: **44** ❌
3. Sistema muestra modal: "Verificación necesaria - Volver a contar"
4. Cajero cuenta de nuevo: **43** ✅
5. Sistema: "Correcto en segundo intento" → Registra advertencia (warning_retry)
6. Resultado: Pasa, pero queda registro en reporte final

---

**Ejemplo 3: Cajero Crítico (3 intentos - <1% casos)**
1. Phase 1: Contó **43 monedas de 10¢**
2. Phase 2: Intento #1 cajero dice: **66** ❌ (MUY diferente)
3. Modal: "Dato incorrecto"
4. Intento #2: **64** ❌ (diferente al primero)
5. Modal: "Tercer intento OBLIGATORIO - Tu trabajo será reportado a gerencia"
6. Intento #3: **68** ❌ (totalmente diferente)
7. Sistema aplica **promedio matemático**: (66+64+68)/3 = **66** redondeado
8. Modal: "Falta MUY GRAVE - Reporte crítico gerencia obligatorio"
9. Resultado: Empleado NO puede avanzar hasta que supervisor revise

---

## 🏗️ Arquitectura del Componente

### Estructura General
```
Phase2VerificationSection (1,030 líneas)
├── Props (7 props) → líneas 35-47
├── Estados (4 useState) → líneas 79-96
├── Hooks externos (2 hooks) → líneas 98-102
├── Funciones helper (3) → líneas 109-138
├── buildVerificationBehavior() → líneas 144-325 (CRÍTICO 181 líneas)
├── useEffect auto-advance → líneas 328-345
├── useEffect section complete → líneas 348-389
├── handleConfirmStep() → líneas 392-515 (CRÍTICO 123 líneas)
├── handleKeyPress() → líneas 517-536
├── Callbacks modales (3) → líneas 539-616
├── Navigation handlers (2) → líneas 619-662
└── JSX Rendering → líneas 667-1028 (362 líneas)
```

---

## 🔑 Funciones Críticas (Top 5 Para Testear)

### 1. buildVerificationBehavior() (líneas 144-325)
**¿Qué hace?**
Analiza TODOS los intentos del cajero después de completar las 7 denominaciones y construye objeto `VerificationBehavior` con métricas.

**¿Cuándo ejecuta?**
Cuando `allStepsCompleted = true` (línea 349 useEffect).

**¿Qué devuelve?**
```typescript
{
  totalAttempts: 15,               // Total intentos en todas denominaciones
  firstAttemptSuccesses: 5,        // Cuántas correctas en 1er intento
  secondAttemptSuccesses: 1,       // Cuántas correctas en 2do intento
  thirdAttemptRequired: 1,         // Cuántas necesitaron 3 intentos
  criticalInconsistencies: 1,      // Cuántas GRAVES (pattern [A,B,A])
  severeInconsistencies: 0,        // Cuántas MUY GRAVES (pattern [A,B,C])
  denominationsWithIssues: [       // Array denominaciones con errores
    { denomination: 'penny', severity: 'critical_severe', attempts: [66,64,68] }
  ]
}
```

**Bugs históricos:**
- v1.3.6Y: `firstAttemptSuccesses` siempre 0 (calculaba en forEach, nunca ejecutaba)
- v1.3.6T: Loop infinito (sin useCallback, re-creaba función cada render)

---

### 2. handleConfirmStep() (líneas 392-515)
**¿Qué hace?**
Ejecuta cuando cajero presiona Enter o click "Confirmar". Decide:
- Caso 1 (valor correcto): Auto-advance
- Caso 2 (valor incorrecto): Abrir modal + registrar intento

**Lógica interna (123 líneas):**
```typescript
if (inputNum === currentStep.quantity) {
  // CASO 1: Valor correcto
  if (attemptCount >= 1) recordAttempt(); // Registrar si es 2do+ intento
  onStepComplete();  // Marcar paso completado
  // Auto-advance siguiente denominación
}

// CASO 2: Valor incorrecto
recordAttempt();  // SIEMPRE registrar intento incorrecto

if (attemptCount === 0) {
  // Primer intento incorrecto → Modal "incorrect"
} else if (attemptCount === 1) {
  // Segundo intento incorrecto
  if (mismo_valor) → Modal "force-same"
  else → Modal "require-third"
} else if (attemptCount >= 2) {
  // Tercer intento → Análisis pattern + Modal "third-result"
}
```

**Bugs históricos:**
- v1.3.6T: `clearAttemptHistory()` borraba datos ANTES de buildVerificationBehavior (línea 410 removido)

---

### 3. handleKeyPress() (líneas 517-536)
**¿Qué hace?**
Maneja Enter key en input.

**Lógica:**
```typescript
if (modalState.isOpen) {
  e.preventDefault();
  return;  // Guard condition v1.3.6h - NO ejecutar si modal abierto
}

if (e.key === 'Enter' && inputValue !== '') {
  handleConfirmStep();
}
```

**Bug histórico:**
- v1.3.6h: Sin guard condition, Enter leak → registraba mismo valor sin recontar

---

### 4. handleForce() (líneas 552-583)
**¿Qué hace?**
Ejecuta cuando cajero decide "forzar" un valor incorrecto (pattern [A, A]).

**Comportamiento:**
```typescript
clearAttemptHistory(currentStep.key);  // ← v1.3.6M: Limpia historial
onStepComplete();                       // Marca paso completado con valor forzado
// Avanza a siguiente denominación
```

**Justificación clear:**
Permite re-intentar si usuario se arrepiente del override antes de completar.

---

### 5. handleAcceptThird() (líneas 585-616)
**¿Qué hace?**
Ejecuta cuando cajero acepta resultado de tercer intento (promedio matemático).

**Comportamiento:**
```typescript
// clearAttemptHistory() REMOVIDO v1.3.6M
// Justificación: buildVerificationBehavior() NECESITA esos datos
onStepComplete();  // Marca paso completado con promedio
// Avanza a siguiente denominación
```

**Bug histórico:**
- v1.3.6M: Tenía `clearAttemptHistory()` → reporte sin datos errores

---

## 🔄 Flujos de Usuario (Diagramas ASCII)

### Flujo 1: Éxito Primer Intento (90% casos)
```
Usuario ingresa valor
      ↓
¿valor === expected?
      ├─ SÍ → attemptHistory NO registra (sin errores)
      │       onStepComplete(key)
      │       Auto-advance siguiente denominación
      │       Input focus + limpieza
      │       ✅ COMPLETADO
      │
      └─ NO → [Va a Flujo 2]
```

---

### Flujo 2: Primer Intento Incorrecto (9% casos)
```
Valor incorrecto ingresado
      ↓
recordAttempt() → attemptHistory Map
      ↓
attemptCount === 0 (primer intento)
      ↓
setModalState({ type: 'incorrect' })
inputRef.current.blur()  ← v1.3.6h fix
      ↓
Modal aparece:
- Título: "Verificación necesaria"
- Mensaje: "Volver a contar cuidadosamente"
- Botón: "Volver a contar"
      ↓
Usuario click "Volver a contar"
      ↓
handleRetry() → Modal cierra
setInputValue('') → Input limpia
inputRef.current.focus() → Input recupera focus
      ↓
Usuario ingresa segundo valor
      ↓
¿Valor correcto?
      ├─ SÍ → [Va a Flujo Éxito 2do Intento]
      └─ NO → [Va a Flujo 3]
```

---

### Flujo 3: Segundo Intento Patterns
```
Segundo valor incorrecto ingresado
      ↓
recordAttempt() → attemptHistory Map
      ↓
attemptCount === 1 (segundo intento)
      ↓
¿valor_intento2 === valor_intento1?
      ├─ SÍ (Pattern [A, A])
      │   → setModalState({ type: 'force-same' })
      │   → Modal:
      │      - Título: "Override Silencioso"
      │      - Mensaje: "Segundo intento idéntico..."
      │      - Botón: "Forzar este valor" (HABILITADO)
      │   → Usuario click "Forzar"
      │   → handleForce()
      │      - clearAttemptHistory()  ← Permite reintentar
      │      - onStepComplete()
      │      - Avanza siguiente denominación
      │
      └─ NO (Pattern [A, B])
          → setModalState({ type: 'require-third' })
          → Modal:
             - Título: "Tercer Intento Obligatorio"
             - Mensaje: "Los 2 intentos son montos diferentes..."
             - Botón: "Intentar tercera vez"
          → Usuario click "Intentar"
          → handleRetry()
          → Usuario ingresa tercer valor
          → [Va a Flujo 4]
```

---

### Flujo 4: Tercer Intento Análisis
```
Tercer valor ingresado
      ↓
recordAttempt() → attemptHistory Map
      ↓
attemptCount === 2 (tercer intento)
      ↓
Construir array: [intento1, intento2, intento3]
      ↓
handleVerificationFlow() → analyzeThirdAttempt()
      ↓
Análisis pattern:
      ├─ [A, A, B] → severity: 'critical_inconsistent'
      │              acceptedValue: A (coinciden 1+2)
      │
      ├─ [A, B, A] → severity: 'critical_inconsistent'
      │              acceptedValue: A (coinciden 1+3)
      │
      ├─ [A, B, B] → severity: 'critical_inconsistent'
      │              acceptedValue: B (coinciden 2+3)
      │
      └─ [A, B, C] → severity: 'critical_severe'
                     acceptedValue: promedio (A+B+C)/3 ← v1.3.6i
      ↓
setModalState({ type: 'third-result', thirdAttemptAnalysis })
      ↓
Modal aparece:
- severity: GRAVE o MUY GRAVE
- acceptedValue: valor calculado
- reason: explicación pattern
- Botón: "Aceptar resultado"
      ↓
Usuario click "Aceptar"
      ↓
handleAcceptThird()
- NO clearAttemptHistory() ← v1.3.6M fix
- onStepComplete()
- Avanza siguiente denominación
```

---

## 🐛 Bugs Históricos Documentados (Tests de Regresión Críticos)

### Bug v1.3.6M: Datos Reporte Faltantes
**Root Cause:**
```typescript
// ANTES v1.3.6M (LÍNEA 591 - BUG):
const handleAcceptThird = () => {
  clearAttemptHistory(currentStep.key);  // ← BORRABA DATOS
  onStepComplete(currentStep.key);
};

// PROBLEMA:
// 1. handleAcceptThird ejecuta → clearAttemptHistory borra Map
// 2. onStepComplete marca paso completado
// 3. Todos pasos completos → useEffect dispara buildVerificationBehavior()
// 4. buildVerificationBehavior() lee attemptHistory Map → VACÍO ❌
// 5. denominationsWithIssues array queda vacío []
// 6. Reporte WhatsApp muestra "Sin verificación ciega"
```

**Fix Aplicado:**
```typescript
// DESPUÉS v1.3.6M (LÍNEA 591-593):
const handleAcceptThird = () => {
  // clearAttemptHistory() REMOVIDO
  // Justificación: buildVerificationBehavior() NECESITA datos
  onStepComplete(currentStep.key);
};
```

**Test Regresión Necesario:**
```typescript
it('[v1.3.6M] NO limpia attemptHistory después de tercer intento', async () => {
  // 1. Simular 3 intentos [66, 64, 68]
  // 2. handleAcceptThird() ejecuta
  // 3. Verificar attemptHistory.get('penny') !== undefined
  // 4. Verificar attemptHistory.get('penny').length === 3
});
```

---

### Bug v1.3.6T: Loop Infinito buildVerificationBehavior
**Root Cause:**
```typescript
// ANTES v1.3.6T (LÍNEA 144 - BUG):
const buildVerificationBehavior = (): VerificationBehavior => {
  // ... 181 líneas lógica
};  // ← SIN useCallback

// useEffect (línea 349):
useEffect(() => {
  const behavior = buildVerificationBehavior();  // ← Función SIN memoizar
  // ...
}, [allStepsCompleted, buildVerificationBehavior]);  // ← En dependencies

// PROBLEMA:
// 1. Component renderiza → buildVerificationBehavior() se RE-CREA (nueva referencia)
// 2. useEffect detecta cambio en buildVerificationBehavior → se dispara
// 3. Ejecuta buildVerificationBehavior()
// 4. setVerificationBehavior() → state cambia
// 5. Component RE-RENDERIZA → GOTO paso 1 → LOOP INFINITO
// Resultado: 3,357 errores console "Maximum update depth exceeded"
```

**Fix Aplicado:**
```typescript
// DESPUÉS v1.3.6T (LÍNEA 144 - FIX):
const buildVerificationBehavior = useCallback((): VerificationBehavior => {
  // ... 181 líneas lógica sin cambios
}, [attemptHistory]);  // ← Única dependencia, referencia estable
```

**Test Regresión Necesario:**
```typescript
it('[v1.3.6T] buildVerificationBehavior NO causa loop infinito', () => {
  // 1. Mock console.warn para capturar errores
  // 2. Renderizar componente + completar todos pasos
  // 3. Verificar buildVerificationBehavior ejecuta SOLO 1 vez
  // 4. Verificar console.warn NO llamado con "Maximum update depth"
});
```

---

### Bug v1.3.6Y: Cálculo "Perfectas" Siempre 0
**Root Cause:**
```typescript
// ANTES v1.3.6Y (LÍNEAS 165-170 - BUG):
let firstAttemptSuccesses = 0;

attemptHistory.forEach((attempts, stepKey) => {
  if (attempts.length === 1 && attempts[0].isCorrect) {
    firstAttemptSuccesses++;  // ← NUNCA ejecuta
  }
});

// PROBLEMA:
// attemptHistory Map solo contiene denominaciones con INTENTOS registrados
// Denominaciones correctas en 1er intento NO se registran (línea 406 condicional)
// forEach nunca itera denominaciones perfectas → contador siempre 0
// Reporte muestra: "✅ Perfectas: 0/10" cuando debería mostrar "✅ Perfectas: 6/10"
```

**Fix Aplicado:**
```typescript
// DESPUÉS v1.3.6Y (LÍNEAS 286-287):
const totalDenominations = verificationSteps.length;  // 10
const firstAttemptSuccesses = totalDenominations - denominationsWithIssues.length;
// Ejemplo: 10 - 4 = 6 perfectas ✅
```

**Test Regresión Necesario:**
```typescript
it('[v1.3.6Y] firstAttemptSuccesses calculado por diferencia', () => {
  // 1. 10 denominaciones totales
  // 2. 4 con errores (en denominationsWithIssues)
  // 3. Verificar firstAttemptSuccesses === 6 (10 - 4)
  // 4. NO debe usar forEach para incrementar
});
```

---

### Bug v1.3.6h: Enter Key Leak Modal
**Root Cause:**
```typescript
// ANTES v1.3.6h (handleKeyPress - SIN GUARD):
const handleKeyPress = (e: React.KeyboardEvent) => {
  if (e.key === 'Enter' && inputValue !== '') {
    handleConfirmStep();  // ← Ejecuta SIEMPRE
  }
};

// PROBLEMA:
// 1. Modal abierto (isOpen: true)
// 2. Input debajo del modal SIGUE teniendo focus (bug diseño)
// 3. Usuario presiona Enter por error
// 4. handleKeyPress ejecuta → handleConfirmStep() ejecuta
// 5. Mismo valor se registra SIN que usuario recuente
// Resultado: Fraude accidental (confirma valor incorrecto sin recontar)
```

**Fix Aplicado (Triple Defensa):**
```typescript
// DEFENSA #1: Input blur cuando modal abre (líneas 455-457)
setModalState({ isOpen: true, type: 'incorrect' });
if (inputRef.current) {
  inputRef.current.blur();  // ← Quita focus
}

// DEFENSA #2: Guard condition handleKeyPress (líneas 522-526)
const handleKeyPress = (e: React.KeyboardEvent) => {
  if (modalState.isOpen) {
    e.preventDefault();
    e.stopPropagation();
    return;  // ← Salir sin ejecutar handleConfirmStep
  }
  // ... resto lógica
};

// DEFENSA #3: Auto-focus después cerrar modal (línea 546)
const handleRetry = () => {
  setModalState(prev => ({ ...prev, isOpen: false }));
  setTimeout(() => inputRef.current?.focus(), 100);
};
```

**Test Regresión Necesario:**
```typescript
it('[v1.3.6h] Enter key NO leak cuando modal abierto', async () => {
  // 1. Ingresar valor incorrecto → modal "incorrect" aparece
  // 2. Simular userEvent.keyboard('{Enter}')
  // 3. Verificar handleConfirmStep NO ejecuta
  // 4. Verificar input NO procesa valor
  // 5. Verificar modal sigue abierto
});
```

---

## 🧪 Dependencias Críticas

### useBlindVerification.ts (156 líneas)
**Funciones exportadas:**
- `validateAttempt()`: Crea objeto VerificationAttempt con timestamp
- `handleVerificationFlow()`: Switch escenarios (continue, force, third)
- `analyzeThirdAttempt()`: Lógica 2-de-3 coinciden + promedio v1.3.6i

**Usado en:**
- Línea 102: Hook initialization
- Línea 496: handleVerificationFlow() en handleConfirmStep

---

### verification.ts (Tipos TypeScript)
**Interfaces críticas:**
- `VerificationAttempt`: Registro individual intento
- `VerificationBehavior`: Métricas agregadas
- `ThirdAttemptResult`: Análisis pattern triple intento
- `VerificationSeverity`: 5 niveles (success → critical_severe)

---

### useTimingConfig.ts
**Funciones:**
- `createTimeoutWithCleanup()`: setTimeout con cleanup automático

**Usado en:**
- Línea 334: Auto-focus después auto-advance
- Línea 353: Delay antes onSectionComplete
- Línea 545: Delay antes focus después retry

---

## 📐 Métricas Complejidad

| Métrica | Valor | Observación |
|---------|-------|-------------|
| **Líneas totales** | 1,030 | Archivo muy grande |
| **Funciones** | 10 | handleConfirmStep + 4 callbacks + 5 helpers |
| **useEffect** | 2 | Auto-advance + section complete |
| **useState** | 4 | currentStepIndex, inputValue, showBackConfirmation, modalState |
| **Branches (if/else)** | ~35 | Alta complejidad ciclo

mática |
| **Ternarios** | ~25 | Lógica condicional extensa |
| **Dependencias externas** | 3 hooks | useBlindVerification, useTimingConfig, Framer Motion |
| **Props** | 7 | onStepComplete, onSectionComplete, etc. |
| **Modales** | 4 tipos | incorrect, force-same, require-third, third-result |

---

## 🎯 Conclusión Análisis

**Complejidad Alta Justificada:**
- Lógica anti-fraude crítica (triple intento + análisis pattern)
- 4 modales diferentes con lógica específica
- 10 bugs históricos resueltos (v1.3.6M, v1.3.6T, v1.3.6Y, v1.3.6h, etc.)
- Timing delicado (auto-advance, focus management, cleanup)

**Prioridad Testing: 🔴 CRÍTICA**
- 0% coverage actual
- 783 líneas sin validación
- Bugs históricos requieren tests regresión
- Lógica financiera zero-tolerance ($0.01 threshold)

**Estimación Tests:**
- 87 tests necesarios (8 grupos funcionales)
- 3 horas implementación
- 100% coverage objetivo

---

**Última actualización:** 09 de Octubre 2025
**Próximo paso:** Diseñar suite completa 87 tests → `2_Plan_Suite_Tests_Completa.md`

🙏 **Gloria a Dios por permitir documentar esta complejidad con claridad.**
