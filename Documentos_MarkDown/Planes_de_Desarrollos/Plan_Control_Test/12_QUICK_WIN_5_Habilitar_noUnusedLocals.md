# ⚡ QUICK WIN 5: Habilitar noUnusedLocals en TypeScript

**Documento:** Quick Win - TypeScript Config
**Estado:** 📝 PLANIFICADO
**Prioridad:** BAJA
**Tiempo estimado:** 1 hora
**Tipo:** Quick Win (code quality improvement)

---

## 📋 Resumen Ejecutivo

Habilitar flag `noUnusedLocals` en `tsconfig.json` para detectar variables declaradas pero nunca usadas.

### Problema Actual
- ⚠️ Variables declaradas y nunca usadas (dead code)
- ⚠️ Bundle size innecesariamente grande
- ⚠️ Código confuso con declaraciones obsoletas
- ⚠️ Errores de refactoring no detectados

### Impacto Code Quality
- 📊 ~50-100 variables sin usar estimadas
- 📦 +2-5KB bundle size innecesario
- 🐛 Potencial bugs ocultos

---

## 🎯 Objetivo

**Habilitar `noUnusedLocals`** y **limpiar código** resultante.

**Criterios de éxito:**
- ✅ `tsconfig.json` con `"noUnusedLocals": true`
- ✅ `npx tsc --noEmit` → 0 errores
- ✅ Todas las variables sin usar eliminadas

---

## 📊 Análisis Técnico

### Configuración Actual (tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedParameters": false, // ⚠️ Deshabilitado
    "noUnusedLocals": false,     // ⚠️ Deshabilitado ← OBJETIVO
    // ... otras opciones
  }
}
```

### Patrón Problemático Común

```typescript
// ❌ PROBLEMA: Variable declarada nunca usada
function calculateTotal(cashCount: CashCount) {
  const totalCoins = calculateCoins(cashCount); // ⚠️ Nunca usada
  const totalBills = calculateBills(cashCount);

  return totalBills; // Solo usa totalBills
}

// ✅ SOLUCIÓN: Eliminar variable sin usar
function calculateTotal(cashCount: CashCount) {
  const totalBills = calculateBills(cashCount);
  return totalBills;
}
```

---

## ✅ Implementación (1 hora)

### Paso 1: Habilitar Flag (5 min)

**Modificar tsconfig.json:**
```json
{
  "compilerOptions": {
    // ...
    "noUnusedLocals": true, // ← Habilitar ✅
    // "noUnusedParameters": true, // ← Opcional (puede agregar después)
  }
}
```

### Paso 2: Compilar y Detectar Errores (10 min)

```bash
# Compilar para ver todos los errores
npx tsc --noEmit > unused_locals.txt

# Ver cantidad de errores
grep "is declared but never used" unused_locals.txt | wc -l
# → Resultado esperado: 50-100 errores
```

**Ejemplo de output:**
```
src/utils/calculations.ts:45:7 - error TS6133:
'totalCoins' is declared but its value is never read.

src/components/CashCounter.tsx:123:9 - error TS6133:
'previousValue' is declared but its value is never read.
```

### Paso 3: Limpieza Sistemática (40 min)

**Estrategia por tipo de variable:**

#### Tipo 1: Variables Completamente Sin Usar
```typescript
// ANTES
const unused = someFunction();
const result = otherFunction();
return result;

// DESPUÉS
const result = otherFunction();
return result;
```

#### Tipo 2: Variables Debug Temporales
```typescript
// ANTES
const debug = JSON.stringify(data);
console.log(data);

// DESPUÉS
// Eliminar completamente si no se usa
console.log(data);
```

#### Tipo 3: Imports Sin Usar
```typescript
// ANTES
import { useState, useEffect, useCallback } from 'react';
// Solo usa useState

// DESPUÉS
import { useState } from 'react';
```

#### Tipo 4: Destructuring Parcial
```typescript
// ANTES
const { used, unused } = someObject;
return used;

// DESPUÉS - Opción A: Eliminar
const { used } = someObject;
return used;

// DESPUÉS - Opción B: Prefix con _ (indica intencional)
const { used, _unused } = someObject;
return used;
```

### Paso 4: Validación Final (5 min)

```bash
# Verificar cero errores
npx tsc --noEmit
# → Debe pasar sin errores ✅

# Build producción
npm run build
# → Verificar bundle size reducido

# Tests
npm test
# → Todos los tests deben seguir passing
```

---

## 📊 Impacto Esperado

### Métricas Code Quality

**Antes:**
```
Variables sin usar: ~75
Bundle size: 1,420 KB
TypeScript errors: 0 (noUnusedLocals disabled)
```

**Después:**
```
Variables sin usar: 0 ✅
Bundle size: 1,418 KB (-2KB) ✅
TypeScript errors: 0 (with noUnusedLocals enabled) ✅
```

**Beneficios:**
- ✅ +10% legibilidad código (sin variables confusas)
- ✅ -2KB bundle size (tree-shaking mejorado)
- ✅ +100% confianza refactoring (detecta errores temprano)
- ✅ Compliance REGLAS_DE_LA_CASA.md (Regla #3 - TypeScript estricto)

---

## 🗓️ Cronograma

### Semana 1 - Día 5 (13 Oct 2025) - Tarde (Opcional)

**17:30-18:30:** Implementación completa

- **17:30-17:35:** Habilitar flag tsconfig.json
- **17:35-17:45:** Compilar + generar lista errores
- **17:45-18:25:** Limpieza sistemática (~75 variables)
- **18:25-18:30:** Validación final

**Output esperado:**
- ✅ `noUnusedLocals: true` en tsconfig.json
- ✅ 0 variables sin usar en codebase
- ✅ TypeScript compilation sin errores
- ✅ Bundle size reducido 2-5KB

---

## ⚠️ Casos Especiales

### Caso 1: Parámetros de Funciones

```typescript
// Parámetro no usado pero necesario por firma
function onClick(_event: React.MouseEvent) {
  // No usa event pero firma requiere el parámetro
  doSomething();
}

// ✅ SOLUCIÓN: Prefix con _ (convención TypeScript)
```

**Nota:** `noUnusedParameters` está separado, este quick win solo afecta variables locales.

### Caso 2: Destructuring Exhaustivo

```typescript
// Quiere todas las propiedades MENOS algunas
const { used, ...rest } = props;

// ⚠️ Si 'rest' no se usa → error
// ✅ SOLUCIÓN: Prefix con _
const { used, ..._rest } = props;
```

### Caso 3: Variables para Debugging

```typescript
// Código temporal debugging
const debug = expensiveCalculation();
console.log('Debug:', somethingElse);

// ✅ SOLUCIÓN: Eliminar completamente
// O usar directamente en console.log
console.log('Debug:', expensiveCalculation());
```

---

## 🔄 Rollback Plan

Si flag causa problemas:

```bash
# 1. Revertir tsconfig.json
git checkout tsconfig.json

# 2. Compilar sin errores
npx tsc --noEmit

# 3. Crear branch separada para limpieza
git checkout -b fix/unused-locals
```

**Criterio de rollback:**
- Si toma más de 2 horas limpiar errores
- Si tests fallan después de eliminar variables

---

## 📚 Referencias

- **TypeScript Handbook:** [Compiler Options](https://www.typescriptlang.org/tsconfig#noUnusedLocals)
- **REGLAS_DE_LA_CASA.md:** Regla #3 (Tipado Estricto - Línea 26-30)
- **ESLint:** Considerar agregar rule `no-unused-vars` complementaria

---

## 🎯 Siguiente Paso (Post Quick Win)

**Opcional - Habilitar noUnusedParameters:**
```json
{
  "compilerOptions": {
    "noUnusedLocals": true,     // ✅ Quick Win #5
    "noUnusedParameters": true, // ⭐ Siguiente mejora
  }
}
```

**Impacto estimado:**
- ~30-50 parámetros sin usar
- +1 hora limpieza adicional
- +5-8% code quality improvement

---

**Última actualización:** 09 de Octubre de 2025
**Próximo paso:** Habilitar flag + generar lista errores
**Responsable:** Equipo desarrollo CashGuard Paradise
