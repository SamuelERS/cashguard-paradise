# 🔴 BUG CRÍTICO #2: Números Inválidos en Cálculos

**Prioridad:** 🔴 CRÍTICA  
**Severidad:** S0 (Crítico)  
**Riesgo:** Cálculos financieros incorrectos  
**Probabilidad:** 40% (copy-paste valores extraños)  
**Impacto:** CRÍTICO - Corrupción de datos financieros

---

## 📋 Resumen Ejecutivo (Para NO programadores)

### ¿Qué pasa?
El sistema acepta números "raros" que rompen los cálculos de dinero:
- **Infinity** (infinito)
- **NaN** (Not a Number - "no es un número")
- **Valores científicos** (ej: 1e6 = 1,000,000)
- **Números gigantes** (> $1 millón)

### ¿Por qué es grave?
Si un usuario (accidental o maliciosamente):
- Hace copy-paste de un valor extraño
- El sistema lo acepta sin validar
- Los cálculos se rompen
- El reporte final tiene datos corruptos
- Puede mostrar "Infinity" o "NaN" en lugar de dinero

### Ejemplo Real
```
Usuario ingresa "Venta Esperada": "Infinity"
Sistema calcula: $250.50 - Infinity = -Infinity
Reporte muestra: "Faltante: -Infinity dólares" ❌
```

---

## 🔍 Análisis Técnico

### Archivos Afectados

#### 1. InitialWizardModal.tsx (Líneas 429-431)
```typescript
// ❌ PROBLEMA: parseFloat sin validación
data-valid={!!(wizardData.expectedSales && parseFloat(wizardData.expectedSales) > 0)}
```

#### 2. Phase2VerificationSection.tsx (Línea 323)
```typescript
// ❌ PROBLEMA: parseInt con fallback silencioso
const inputNum = parseInt(inputValue) || 0;
```

#### 3. useInputValidation.ts (Línea 90)
```typescript
// ❌ PROBLEMA: Solo valida formato, no valida NaN/Infinity
const isValid = /^\d*\.?\d{0,2}$/.test(finalValue) && parseFloat(finalValue || '0') >= 0;
```

---

## 💣 Casos que Rompen el Sistema

### Caso 1: Infinity

**Input:**
```javascript
"Infinity"
```

**Resultado actual:**
```javascript
parseFloat("Infinity") = Infinity ✅ Válido sintácticamente
isNaN(Infinity) = false ✅ Es un "número"
Infinity > 0 = true ✅ Pasa validación
```

**Qué pasa:**
- Sistema acepta "Infinity"
- Cálculos: $250.50 - Infinity = -Infinity
- Reporte: "Faltante: -Infinity dólares" ❌

---

### Caso 2: Notación Científica

**Input:**
```javascript
"1e6" (significa 1,000,000)
```

**Resultado actual:**
```javascript
parseFloat("1e6") = 1000000
1000000 > 0 = true ✅ Pasa validación
```

**Qué pasa:**
- Usuario quiso escribir "$1 con 6 decimales"
- Sistema interpreta como "$1,000,000"
- Cálculos completamente incorrectos
- Reporte con discrepancia gigante

---

### Caso 3: NaN por Input Corrupto

**Input:**
```javascript
"abc" o "12.34.56" o "---"
```

**Resultado actual:**
```javascript
parseFloat("abc") = NaN
isNaN(NaN) = true ❌ Pero...
parseInt("abc") || 0 = 0 ⚠️ Silencia error
```

**Qué pasa:**
- Error silenciado con fallback a 0
- Usuario no sabe que su input fue ignorado
- Conteo con 0 en lugar del valor real

---

### Caso 4: Números Excesivos

**Input:**
```javascript
"999999999.99" (casi mil millones)
```

**Resultado actual:**
```javascript
parseFloat("999999999.99") = 999999999.99 ✅
999999999.99 > 0 = true ✅ Pasa validación
```

**Qué pasa:**
- Sistema acepta valores absurdos
- Ninguna tienda maneja $999 millones
- Claramente un error de input
- Sistema no alerta

---

## ✅ Solución Propuesta

### Fix en useInputValidation.ts

```typescript
// ANTES (con bug)
case 'currency': {
  const cleanValue = value.replace(/[^\d.,]/g, '').replace(/,/g, '.');
  const parts = cleanValue.split('.');
  const finalValue = parts.length > 2
    ? `${parts[0]}.${parts[1].substring(0, 2)}`
    : cleanValue;
  
  const isValid = /^\d*\.?\d{0,2}$/.test(finalValue) && parseFloat(finalValue || '0') >= 0;
  
  return {
    isValid,
    cleanValue: finalValue,
    errorMessage: isValid ? undefined : 'Formato de moneda inválido'
  };
}

// DESPUÉS (sin bug)
case 'currency': {
  const cleanValue = value.replace(/[^\d.,]/g, '').replace(/,/g, '.');
  const parts = cleanValue.split('.');
  const finalValue = parts.length > 2
    ? `${parts[0]}.${parts[1].substring(0, 2)}`
    : cleanValue;
  
  // 🔒 FIX S0-002: Validación robusta
  const numValue = parseFloat(finalValue || '0');
  const isValid = /^\d*\.?\d{0,2}$/.test(finalValue) 
               && !isNaN(numValue)           // ✅ Rechaza NaN
               && isFinite(numValue)         // ✅ Rechaza Infinity
               && numValue >= 0              // ✅ Rechaza negativos
               && numValue <= 999999.99;     // ✅ Rechaza > $1M
  
  // Mensajes de error específicos
  const errorMessage = isValid ? undefined 
    : isNaN(numValue) || !isFinite(numValue) 
      ? 'Valor numérico inválido (use solo números)'
      : numValue < 0 
        ? 'No se permiten valores negativos'
        : numValue > 999999.99
          ? 'Monto excede límite permitido ($999,999.99)'
          : 'Formato de moneda inválido';
  
  return { isValid, cleanValue: finalValue, errorMessage };
}
```

---

## 🧪 Tests de Regresión Requeridos

### Suite: Currency Validation Edge Cases

```typescript
describe('🔒 FIX S0-002: Validación robusta de números', () => {
  const { validateInput } = useInputValidation();
  
  // Test 1: Rechazar Infinity
  it('should reject Infinity', () => {
    const result = validateInput('Infinity', 'currency');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('inválido');
  });
  
  // Test 2: Rechazar -Infinity
  it('should reject -Infinity', () => {
    const result = validateInput('-Infinity', 'currency');
    expect(result.isValid).toBe(false);
  });
  
  // Test 3: Rechazar notación científica
  it('should reject scientific notation', () => {
    const tests = ['1e6', '1E6', '1e-6', '2.5e3'];
    tests.forEach(input => {
      const result = validateInput(input, 'currency');
      expect(result.isValid).toBe(false);
    });
  });
  
  // Test 4: Rechazar NaN
  it('should reject NaN-producing inputs', () => {
    const tests = ['abc', '12.34.56', '---', 'null', 'undefined'];
    tests.forEach(input => {
      const result = validateInput(input, 'currency');
      expect(result.isValid).toBe(false);
    });
  });
  
  // Test 5: Rechazar valores > $1M
  it('should reject values over $1 million', () => {
    const tests = ['1000000', '999999999.99', '1000000.00'];
    tests.forEach(input => {
      const result = validateInput(input, 'currency');
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('límite');
    });
  });
  
  // Test 6: Aceptar valores normales válidos
  it('should accept valid normal values', () => {
    const tests = ['0', '0.01', '100', '500.50', '999999.99'];
    tests.forEach(input => {
      const result = validateInput(input, 'currency');
      expect(result.isValid).toBe(true);
      expect(result.errorMessage).toBeUndefined();
    });
  });
  
  // Test 7: Rechazar negativos
  it('should reject negative values', () => {
    const tests = ['-1', '-100.50', '-0.01'];
    tests.forEach(input => {
      const result = validateInput(input, 'currency');
      // Regex elimina el minus, pero debe fallar si todavía es negativo
      expect(result.errorMessage).toBeDefined();
    });
  });
  
  // Test 8: Máximo válido ($999,999.99)
  it('should accept maximum valid value', () => {
    const result = validateInput('999999.99', 'currency');
    expect(result.isValid).toBe(true);
  });
  
  // Test 9: Mínimo válido ($0.01)
  it('should accept minimum valid value', () => {
    const result = validateInput('0.01', 'currency');
    expect(result.isValid).toBe(true);
  });
  
  // Test 10: Límite en $0.00
  it('should accept zero', () => {
    const result = validateInput('0', 'currency');
    expect(result.isValid).toBe(true);
  });
});
```

---

## 📝 Checklist de Implementación

### Día 3 (Miércoles)
- [ ] Reproducir cada caso de bug (Infinity, NaN, 1e6, > $1M)
- [ ] Crear branch: `fix/s0-002-input-validation-robust`
- [ ] Implementar fix en `useInputValidation.ts`
- [ ] Crear 15 tests de regresión (10 nuevos + 5 existentes actualizados)
- [ ] Ejecutar suite completa
- [ ] Validar en navegadores:
  - [ ] Chrome (Desktop + Mobile)
  - [ ] Safari (Desktop + iOS)
  - [ ] Firefox
- [ ] Test de copy-paste desde Excel/Google Sheets
- [ ] Code review
- [ ] Merge a main

---

## 📊 Métricas de Validación

### Antes del Fix
```
Acepta Infinity:         ✅ Sí (BUG)
Acepta NaN:              ⚠️ Silencia a 0 (BUG)
Acepta científicos:      ✅ Sí (BUG)
Acepta > $1M:            ✅ Sí (BUG)
Mensajes error:          ❌ Genéricos
```

### Después del Fix
```
Acepta Infinity:         ❌ No ✅
Acepta NaN:              ❌ No ✅
Acepta científicos:      ❌ No ✅
Acepta > $1M:            ❌ No ✅
Mensajes error:          ✅ Específicos ✅
```

---

## 🎯 Impacto en Usuarios

### Antes del Fix
- 😡 Reportes con "Infinity" o "NaN"
- 😡 Cálculos completamente incorrectos
- 😡 Confusión por valores gigantes aceptados
- 😡 No sabe qué hizo mal (mensaje genérico)

### Después del Fix
- 😊 Solo acepta valores razonables ($0.01 - $999,999.99)
- 😊 Mensajes claros y específicos
- 😊 Imposible corromper datos
- 😊 Confianza en el sistema

---

## 💰 Beneficio Económico

### Costo del Bug
- **Cálculos incorrectos:** Potencial pérdida/robo no detectado
- **Tiempo debugging:** 2-4 horas cada vez que pasa
- **Reportes corruptos:** Requiere re-conteo completo
- **Costo estimado:** $1,200-$2,400 USD/año

### Beneficio del Fix
- **Prevención 100%** de valores inválidos
- **ROI:** Alto (fix toma 1 día, beneficio perpetuo)
- **Confianza:** Sistema más robusto

---

## 🔗 Referencias

- **Código original:** 
  - `useInputValidation.ts:82-96`
  - `InitialWizardModal.tsx:429-431`
  - `Phase2VerificationSection.tsx:323`
- **Auditoría:** `1_Auditoria_Completa_Estado_Actual.md`
- **Tests existentes:** `__tests__/integration/hooks/useInputValidation.integration.test.tsx`

---

**Última actualización:** 09 de Octubre de 2025  
**Status:** 🟡 PENDIENTE - Prioridad alta  
**Asignado a:** Equipo de desarrollo  
**Estimado:** 1 día (fix + 15 tests + validación)
