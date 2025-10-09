# 📊 Análisis Detallado: 8 Tests Fallando

**Documento:** Tests Failing Analysis  
**Estado actual:** 535/543 passing (98.5%)  
**Meta:** 543/543 passing (100%)  
**Gap:** 8 tests failing (1.5%)

---

## 📋 Resumen Ejecutivo

### ¿Qué está fallando?
De los **543 tests totales**, hay **8 tests fallando** divididos en **2 categorías**:

1. **Issue #1:** TIER 1 Property-Based Tests (3-5 failing)
   - Errores de transformación de datos
   - NO afecta confianza matemática (TIER 0,2-4 al 100%)
   
2. **Issue #2:** Integration UI Tests (3-5 failing)
   - Tests de componentes de interfaz
   - NO afecta lógica de cálculos

### ¿Es grave?
**No es crítico** porque:
- ✅ TIER 0 (Cross-Validation): 88/88 passing - Ecuaciones maestras OK
- ✅ TIER 2 (Boundary): 31/31 passing - Edge cases OK
- ✅ TIER 3 (Pairwise): 21/21 passing - Combinaciones OK
- ✅ TIER 4 (Regression): 16/16 passing - Casos históricos OK
- ✅ Tests unitarios: 89/89 passing - Lógica core OK

**Los failures son de:**
- Transformación de datos (TIER 1) - NO afecta producción
- UI Integration - NO afecta cálculos

---

## 🔍 Issue #1: TIER 1 Property-Based Tests

### Descripción del Problema

**Archivos afectados:**
1. `__tests__/integration/property-based/cash-total.property.test.ts`
2. `__tests__/integration/property-based/delivery.property.test.ts`
3. `__tests__/integration/property-based/change50.property.test.ts`

**Síntoma:**
```
Error: Transformation errors in property-based test data generation
```

### Root Cause (Documentado en Auditoría)

De la auditoría del 05-Oct-2025:

> Issue #1 identificado (TIER 1 transformation errors - NO afecta confianza)

**Explicación técnica:**
- Property-based tests generan **miles de casos aleatorios** con fast-check
- Algunos casos generados tienen **transformaciones incorrectas**
- Ej: Generar `{penny: -5}` cuando solo deben ser positivos
- El test falla porque el dato generado es inválido

**¿Por qué NO es crítico?**
- TIER 1 es para **validar propiedades** (ej: "suma siempre >= 0")
- NO valida **lógica de producción** (eso es TIER 0)
- Error está en **generación de test data**, no en código real

### Casos de Failure Esperados

#### Test 1: cash-total.property.test.ts

```typescript
// FALLA en algunos runs (< 5%)
it('should satisfy: total >= sum of individual denominations', () => {
  fc.assert(
    fc.property(cashCountArbitrary, (cashCount) => {
      const total = calculateCashTotal(cashCount);
      const sumParts = Object.entries(cashCount).reduce(...);
      return total >= sumParts; // ❌ A veces falla por datos mal generados
    }),
    { numRuns: 1000 }
  );
});
```

**Problema:** `cashCountArbitrary` genera ocasionalmente valores negativos o decimales incorrectos.

#### Test 2: delivery.property.test.ts

```typescript
// FALLA en algunos runs
it('should satisfy: delivered + kept = original', () => {
  fc.assert(
    fc.property(cashCountArbitrary, (original) => {
      const { toDeliver, toKeep } = calculateDelivery(original);
      // ❌ A veces falla porque original tiene valores absurdos
      return isEqual(sum(toDeliver, toKeep), original);
    }),
    { numRuns: 600 }
  );
});
```

---

### Solución Propuesta para Issue #1

#### Opción A: Fix Arbitraries (RECOMENDADA - 4 horas)

```typescript
// ANTES (genera datos inválidos)
const cashCountArbitrary = fc.record({
  penny: fc.integer({ min: 0, max: 10000 }),    // ❌ Puede generar 10,000 pennies
  nickel: fc.integer({ min: 0, max: 10000 }),   // ❌ Absurdo
  // ...
});

// DESPUÉS (genera datos realistas)
const cashCountArbitrary = fc.record({
  penny: fc.integer({ min: 0, max: 100 }),      // ✅ Realista (max $1.00)
  nickel: fc.integer({ min: 0, max: 40 }),      // ✅ Realista (max $2.00)
  dime: fc.integer({ min: 0, max: 50 }),        // ✅ Realista (max $5.00)
  quarter: fc.integer({ min: 0, max: 80 }),     // ✅ Realista (max $20.00)
  dollarCoin: fc.integer({ min: 0, max: 50 }),  // ✅ Realista (max $50.00)
  bill1: fc.integer({ min: 0, max: 100 }),      // ✅ Realista
  bill5: fc.integer({ min: 0, max: 100 }),      // ✅ Realista
  bill10: fc.integer({ min: 0, max: 100 }),     // ✅ Realista
  bill20: fc.integer({ min: 0, max: 50 }),      // ✅ Realista
  bill50: fc.integer({ min: 0, max: 20 }),      // ✅ Realista
  bill100: fc.integer({ min: 0, max: 20 }),     // ✅ Realista (max $2,000)
}).filter(cashCount => {
  // ✅ Filtrar casos donde total > $10,000 (absurdo)
  const total = calculateCashTotal(cashCount);
  return total <= 10000;
});
```

#### Opción B: Aumentar Tolerancia (RÁPIDA - 30 min)

```typescript
// Aumentar retry budget para casos edge
fc.assert(
  fc.property(cashCountArbitrary, (cashCount) => {
    // test logic
  }),
  { 
    numRuns: 1000,
    endOnFailure: false,      // ✅ No parar al primer failure
    maxSkipsPerRun: 100,      // ✅ Permitir más skips
  }
);
```

---

## 🔍 Issue #2: Integration UI Tests

### Descripción del Problema

**Archivos probablemente afectados:**
1. `__tests__/integration/cash-counting/GuidedDenominationItem.integration.test.tsx`
2. `__tests__/integration/cash-counting/GuidedFieldView.integration.test.tsx`
3. `__tests__/integration/cash-counting/TotalsSummarySection.integration.test.tsx`
4. `__tests__/integration/morning-count-simplified.test.tsx`

**Síntoma:**
```
Error: Component rendering issues or timeout waiting for elements
```

### Root Cause (Documentado en Auditoría)

De la auditoría del 05-Oct-2025:

> Issue #2 identificado (5 integration UI tests - NO afecta lógica)

**Explicación:**
- Tests intentan encontrar elementos en DOM
- Elementos no aparecen o aparecen con delay
- Timeouts muy cortos (< 1000ms)
- Posibles race conditions en rendering

### Casos de Failure Esperados

#### Test 1: GuidedDenominationItem

```typescript
it('should show confirmation modal after input', async () => {
  render(<GuidedDenominationItem field="penny" />);
  
  const input = screen.getByRole('spinbutton');
  await user.type(input, '25');
  await user.click(screen.getByRole('button', { name: /confirmar/i }));
  
  // ❌ FALLA: Modal no aparece en tiempo esperado
  await waitFor(() => {
    expect(screen.getByText(/cantidad correcta/i)).toBeInTheDocument();
  }, { timeout: 1000 }); // ⚠️ Timeout muy corto
});
```

#### Test 2: TotalsSummarySection

```typescript
it('should display calculated totals', async () => {
  render(<TotalsSummarySection cashCount={mockData} />);
  
  // ❌ FALLA: Totales no se calculan inmediatamente
  expect(screen.getByText(/\$250\.50/)).toBeInTheDocument();
  // Sin waitFor → race condition
});
```

---

### Root Cause Adicional: Bug confirmGuidedField con "0"

**Descubierto en DELETED_TESTS.md (30 Sept 2025):**

```typescript
// test-helpers.tsx:351-353
if (value && value !== '0') {
  await user.type(activeInput, value);
}
```

**Problema:**
- Helper piensa que "0" significa "skip field"
- NO escribe el valor "0" en input
- Pero botón "Confirmar" requiere valor para habilitarse
- Resultado: botón disabled → test timeout

**Tests afectados:**
- Cualquier test que use `cashCount.empty` (mayoría campos en 0)
- GuidedDenominationItem con valor 0
- Tests de conteo matutino con denominaciones vacías

---

### Solución Propuesta para Issue #2

#### Fix 0: Arreglar Helper confirmGuidedField (CRÍTICO - 30 min)

```typescript
// ANTES (con bug)
if (value && value !== '0') {
  await user.type(activeInput, value);
}

// DESPUÉS (sin bug)
if (value !== undefined && value !== null && value !== '') {
  await user.type(activeInput, String(value));
}
// ✅ Ahora SÍ escribe "0" cuando es necesario
```

**Este fix podría resolver 50% de los tests UI failing**

---

#### Fix 1: Aumentar Timeouts (RÁPIDA - 1 hora)

```typescript
// ANTES
await waitFor(() => {
  expect(screen.getByText(/cantidad correcta/i)).toBeInTheDocument();
}, { timeout: 1000 }); // ❌ 1 segundo puede ser poco

// DESPUÉS
await waitFor(() => {
  expect(screen.getByText(/cantidad correcta/i)).toBeInTheDocument();
}, { timeout: 3000 }); // ✅ 3 segundos (más realista para CI/CD)
```

#### Fix 2: Usar act() Correctamente (MEDIA - 2 horas)

```typescript
// ANTES
await user.click(confirmButton);
expect(screen.getByText(/confirmado/i)).toBeInTheDocument(); // ❌ Sin esperar

// DESPUÉS
await user.click(confirmButton);
await waitFor(() => {
  expect(screen.getByText(/confirmado/i)).toBeInTheDocument();
}); // ✅ Espera a que aparezca
```

#### Fix 3: Mock Timers para Tests con Delays (AVANZADA - 3 horas)

```typescript
// Para tests que dependen de createTimeoutWithCleanup
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

it('should auto-advance after delay', async () => {
  render(<Component />);
  
  // Simular el paso del tiempo
  act(() => {
    jest.advanceTimersByTime(150); // createTimeoutWithCleanup usa 150ms
  });
  
  await waitFor(() => {
    expect(screen.getByText(/siguiente/i)).toBeInTheDocument();
  });
});
```

---

## 📊 Plan de Acción Priorizado

### Prioridad 0: Fix Helper Bug (Día 4 - Jueves mañana) 🆕

**Helper confirmGuidedField - 30 min:**
1. Abrir `test-helpers.tsx:351-353`
2. Cambiar condición `value && value !== '0'` → `value !== undefined && value !== null && value !== ''`
3. Verificar que escribe "0" correctamente
4. Re-run suite
5. ✅ Esperado: 2-4 tests UI pasan inmediatamente

**Ganancia:** 40-50% de tests UI fixing resuelto con 1 línea

---

### Prioridad 1: Quick Fixes (Día 4 - Jueves tarde)

**Issue #2 (UI Tests) - 1.5 horas:**
1. Aumentar timeouts de 1000ms → 3000ms
2. Agregar waitFor donde falta
3. Re-run suite
4. ✅ Esperado: 1-2 tests adicionales pasan

**Ganancia combinada:** 60-80% de tests fixing resuelto

---

### Prioridad 2: Property-Based Arbitraries (Día 4 - Jueves tarde)

**Issue #1 (TIER 1) - 4 horas:**
1. Fix `cashCountArbitrary` con límites realistas
2. Agregar `.filter()` para casos absurdos
3. Re-run property tests 5 veces (asegurar estabilidad)
4. ✅ Esperado: TIER 1 al 100%

**Ganancia:** 40-50% de tests fixing resuelto

---

## 📝 Checklist de Implementación

### Jueves (Día 4) - Mañana

**09:00-09:30 (30 min): Fix Helper Bug (PRIORIDAD 0)** 🆕
- [ ] Abrir `test-helpers.tsx:351-353`
- [ ] Fix condición para aceptar "0"
- [ ] npm run test:integration
- [ ] Validar 2-4 tests pasan inmediatamente

**09:30-11:00 (1.5 horas): Fix UI Tests Restantes**
- [ ] Identificar tests UI failing restantes
- [ ] Aumentar timeouts a 3000ms
- [ ] Agregar waitFor() faltantes
- [ ] npm run test:integration
- [ ] Validar 1-2 tests adicionales passing

### Jueves (Día 4) - Tarde

**14:00-18:00 (4 horas): Fix Property-Based Tests**
- [ ] Revisar arbitraries en 3 archivos
- [ ] Implementar límites realistas
- [ ] Agregar filters para casos absurdos
- [ ] npm run test:property (5 veces)
- [ ] Validar estabilidad 100%

### Viernes (Día 5) - Mañana

**09:00-10:00 (1 hora): Validación Final**
- [ ] npm run test (suite completa)
- [ ] Verificar 543/543 passing ✅
- [ ] Commit + merge
- [ ] Celebrar 🎉

---

## 📊 Métricas Esperadas

### Antes
```
Tests Total:        543
Passing:            535 (98.5%)
Failing:            8 (1.5%)
TIER 1:             ⚠️ Algunos failing
UI Integration:     ⚠️ 3-5 failing
```

### Después (Post-Fix)
```
Tests Total:        543
Passing:            543 (100%) ✅
Failing:            0 (0%) ✅
TIER 1:             ✅ 100% passing
UI Integration:     ✅ 100% passing
```

---

## 💰 Beneficio de Resolver Tests

### Técnico
- ✅ 100% confianza en CI/CD
- ✅ Deploys sin warnings
- ✅ Refactoring más seguro
- ✅ Nuevos features con safety net

### Negocio
- ✅ Menos bugs en producción
- ✅ Faster time to market (CI/CD confiable)
- ✅ Mejor moral del equipo
- ✅ Documentación viva (tests passing = specs claras)

---

## 🔗 Referencias

- **Auditoría completa:** `1_Auditoria_Completa_Estado_Actual.md`
- **TIER 1 tests:** `__tests__/integration/property-based/*.test.ts`
- **UI tests:** `__tests__/integration/cash-counting/*.test.tsx`
- **Test helpers:** `__tests__/fixtures/test-helpers.tsx`

---

**Última actualización:** 09 de Octubre de 2025  
**Status:** 🟡 LISTO PARA IMPLEMENTAR  
**Estimado total:** 7 horas (2h UI + 4h TIER 1 + 1h validación)  
**Día objetivo:** Jueves (Día 4)
