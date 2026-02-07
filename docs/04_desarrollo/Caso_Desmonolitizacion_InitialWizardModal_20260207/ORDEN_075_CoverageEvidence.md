# ORDEN #075 - Coverage Evidence
## Tests InitialWizardModal Decomposition

**Fecha:** 2026-02-07
**Resultado:** 68/68 tests passing (675ms)

---

## Resumen por Archivo

| Test File | Tests | Passing | Duracion |
|-----------|-------|---------|----------|
| wizardRules.test.ts | 14 | 14 | <10ms |
| wizardSelectors.test.ts | 10 | 10 | <10ms |
| useInitialWizardController.test.ts | 15 | 15 | ~50ms |
| InitialWizardModal.test.tsx | 22 | 22 | ~90ms |
| **Subtotal ORDEN #075** | **61** | **61** | - |
| Otros tests en modulo | 7 | 7 | - |
| **Total** | **68** | **68** | **675ms** |

---

## Detalle Tests por Grupo

### 1. wizardRules.test.ts (14 tests)

**calculateProgress:**
- Retorna 0 cuando nada completado
- Retorna ~17% con solo rules completadas
- Retorna ~33% con rules + store
- Retorna ~50% con rules + store + cashier
- Retorna ~67% con rules + store + cashier + witness
- Retorna ~83% con todo excepto expenses
- Retorna 100% con todo completado
- Expenses siempre cuentan como completados

**isWitnessValid:**
- Retorna true cuando testigo valido
- Retorna false cuando testigo vacio
- Retorna false cuando testigo igual a cajero

**isExpectedSalesValid:**
- Retorna true para valor positivo
- Retorna false para valor cero
- Retorna false para string vacio

### 2. wizardSelectors.test.ts (10 tests)

**getAvailableEmployees:**
- Retorna empleados para store valido
- Retorna array vacio para store invalido
- Retorna array vacio para store vacio

**getAvailableWitnesses:**
- Filtra cajero seleccionado de lista
- Retorna todos si cajero vacio
- Retorna array vacio para store invalido

**resolveStepSummary:**
- Resuelve nombres para IDs validos
- Retorna strings vacios para IDs invalidos
- Retorna strings vacios para datos vacios
- Maneja store sin ID correctamente

### 3. useInitialWizardController.test.ts (15 tests)

**Estado inicial:**
- Retorna currentStep 1
- Retorna totalSteps 6
- showBackConfirmation inicia false
- showCancelConfirmation inicia false

**Handlers:**
- handleNext con rules incompletas muestra toast error
- handlePrevious en step >1 muestra confirmacion
- handlePrevious en step 1 no muestra confirmacion
- handleComplete con wizard completado llama onComplete
- handleComplete con wizard incompleto no llama onComplete
- handleCancelRequest muestra cancel confirmation
- handleConfirmedClose llama onClose + reset
- handleCancelClose oculta confirmacion

**Delegacion hooks:**
- Expone validateInput del hook

**Progress:**
- Usa calculateProgress para valor

### 4. InitialWizardModal.test.tsx (22 tests)

**Rendering (5):**
- Renders dialog when isOpen=true
- Does NOT render dialog content when isOpen=false
- Shows header with "Corte Nocturno" title
- Shows step indicator "Paso 1 de 6"
- Shows step indicator for current step (step 3)

**Step routing (6):**
- Renders Step1 when currentStep=1
- Renders Step2 when currentStep=2
- Renders Step3 when currentStep=3
- Renders Step4 when currentStep=4
- Renders Step5 when currentStep=5
- Renders Step6 when currentStep=6

**Footer navigation (9):**
- "Anterior" button is disabled on step 1
- "Anterior" calls handlePrevious when clicked
- "Continuar" button is shown on non-last step
- "Continuar" is disabled when rules not completed on step 1
- "Continuar" is enabled when rules completed on step 1
- "Continuar" calls handleNext when clicked
- "Finalizar" button shown on last step instead of "Continuar"
- "Finalizar" is disabled when wizard not completed
- "Finalizar" calls handleComplete when enabled and clicked

**Close button (1):**
- X button calls handleCancelRequest

**Backward compatibility (1):**
- InitialWizardModal.tsx re-exports default from View

---

## Comando de Ejecucion

```bash
npx vitest run src/lib/initial-wizard src/hooks/initial-wizard src/components/initial-wizard
```

**Output:**
```
Test Files  4 passed (4)
     Tests  68 passed (68)
  Duration  675ms
```
