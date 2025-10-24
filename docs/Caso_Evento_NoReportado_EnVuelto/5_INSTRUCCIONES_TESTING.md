# 5️⃣ Instrucciones de Testing Manual - v1.3.7AI

**Objetivo:** Validar que el fix resuelve el bug warning_override SIN causar regresiones en casos A y C.

**Fecha:** 13 Oct 2025 ~22:00 PM

---

## 🎯 Testing Obligatorio (3 Casos)

### ✅ CASO A: warning_retry (Regresión - DEBE seguir funcionando)

**Denominación:** Un centavo (1¢)  
**Cantidad Esperada:** 44 unidades

**Pasos:**
1. Iniciar app en browser (npm run dev)
2. Completar Phase 1 (Wizard inicial)
3. Completar Phase 2 Delivery hasta llegar a Phase 2 Verification
4. En denominación "Un centavo (1¢)":
   - Ingresar `40` → Click "Confirmar"
   - Modal "Verificación necesaria" aparece → Click "Volver a contar"
   - Ingresar `44` → Click "Confirmar"
   - Sistema avanza automáticamente
5. Completar las 6 denominaciones restantes con valores correctos
6. Avanzar a Phase 3 (reporte final)

**Resultado Esperado:**
```
🔍 *VERIFICACIÓN CIEGA*

✅ Perfectas: 6/7
⚠️ Corregidas: 1/7  ← DEBE aparecer

━━━━━━━━━━━━━━━━

⚠️ *ADVERTENCIAS (1)*

• Un centavo (1¢)
   Esperado: 44 unidades
   Intentos: 40 → 44
   📹 Video: [timestamp1] - [timestamp2]
   ℹ️ Corregido en 2° intento
```

**Criterio de éxito:** ✅ Advertencia aparece correctamente (SIN regresión)

---

### 🔴 CASO B: warning_override (BUG PRINCIPAL - DEBE aparecer ahora)

**Denominación:** Cinco centavos (5¢)  
**Cantidad Esperada:** 37 unidades

**Pasos:**
1. Iniciar app en browser (npm run dev)
2. Completar Phase 1 (Wizard inicial)
3. Completar Phase 2 Delivery hasta llegar a Phase 2 Verification
4. En denominación "Cinco centavos (5¢)":
   - Ingresar `30` → Click "Confirmar"
   - Modal "Verificación necesaria" aparece → Click "Volver a contar"
   - Ingresar `30` (mismo valor) → Click "Confirmar"
   - Modal "Segundo Intento Idéntico" aparece → Click "Forzar y Continuar"
   - Sistema avanza automáticamente
5. Completar las 6 denominaciones restantes con valores correctos
6. Avanzar a Phase 3 (reporte final)

**Resultado Esperado (ANTES DEL FIX - BUG):**
```
✅ Perfectas: 7/7  ❌ Incorrecto
⚠️ Corregidas: 0/7 ❌ Incorrecto

(Sin sección ADVERTENCIAS) ❌
```

**Resultado Esperado (DESPUÉS DEL FIX - CORRECTO):**
```
✅ Perfectas: 6/7  ✅ CORRECTO
⚠️ Corregidas: 1/7 ✅ CORRECTO

⚠️ *ADVERTENCIAS (1)*

• Cinco centavos (5¢)
   Esperado: 37 unidades
   Intentos: 30 → 30
   📹 Video: [timestamp1] - [timestamp2]
   ℹ️ Valor forzado (2 intentos iguales)
```

**Criterio de éxito:** ✅ Advertencia aparece con "Valor forzado (2 intentos iguales)"

---

### ✅ CASO C: critical_severe (Regresión - DEBE seguir funcionando)

**Denominación:** Moneda de un dólar ($1)  
**Cantidad Esperada:** 44 unidades

**Pasos:**
1. Iniciar app en browser (npm run dev)
2. Completar Phase 1 (Wizard inicial)
3. Completar Phase 2 Delivery hasta llegar a Phase 2 Verification
4. En denominación "Moneda de un dólar ($1)":
   - Ingresar `40` → Click "Confirmar"
   - Modal "Verificación necesaria" aparece → Click "Volver a contar"
   - Ingresar `42` (diferente) → Click "Confirmar"
   - Modal "ALERTA CRÍTICA - Tercer Intento Obligatorio" aparece → Click "Hacer Tercer Intento"
   - Ingresar `45` (diferente nuevamente) → Click "Confirmar"
   - Modal "FALTA MUY GRAVE" aparece → Click "Aceptar"
   - Sistema avanza automáticamente
5. Completar las 6 denominaciones restantes con valores correctos
6. Avanzar a Phase 3 (reporte final)

**Resultado Esperado:**
```
🔍 *VERIFICACIÓN CIEGA*

✅ Perfectas: 6/7
⚠️ Corregidas: 0/7
🔴 Críticas: 1/7  ← DEBE aparecer

━━━━━━━━━━━━━━━━

⚠️ *ALERTAS DETECTADAS*

🔴 *CRÍTICAS (1)*

• Moneda de un dólar
   Esperado: 44 unidades
   Intentos: 40 → 42 → 45
   📹 Video: [timestamp1] - [timestamp3]
   ⚠️ Patrón errático
```

**Criterio de éxito:** ✅ Crítica aparece correctamente (SIN regresión)

---

## 🔍 Validación Console Logs (Opcional - Debugging)

Si necesitas validar el data flow completo, abre DevTools Console y busca:

**Output esperado (Caso B - warning_override):**
```javascript
[DEBUG v1.3.6S] 📊 buildVerificationBehavior() INICIO
[DEBUG v1.3.6S] 🗺️ attemptHistory Map size: 1
[DEBUG v1.3.6S] 🗺️ attemptHistory Map keys: ["nickel"]
[DEBUG v1.3.6S] 🔍 Analizando denominación: nickel
[DEBUG v1.3.6S] 📊 Intentos para nickel: [
  { attemptNumber: 1, inputValue: 30, expectedValue: 37, isCorrect: false, ... },
  { attemptNumber: 2, inputValue: 30, expectedValue: 37, isCorrect: false, ... }
]
[DEBUG v1.3.6S] ⚖️ Severity determinada para nickel: warning_override
[DEBUG v1.3.6S] ➕ AGREGANDO a denominationsWithIssues: nickel (warning_override)
[DEBUG v1.3.6S] 📋 Estado final denominationsWithIssues: [
  { denomination: "nickel", severity: "warning_override", attempts: [30, 30] }
]
```

**Criterio de éxito:** ✅ `denominationsWithIssues` incluye nickel con severity warning_override

---

## 📊 Matriz de Validación

| Caso | Pattern | Severity | Reporte WhatsApp | Status Esperado |
|------|---------|----------|------------------|-----------------|
| **A** | 1 error → correcto | warning_retry | ✅ Aparece en ADVERTENCIAS | ✅ FUNCIONA (sin regresión) |
| **B** | 2 iguales | warning_override | ✅ Aparece en ADVERTENCIAS | ✅ **RESUELTO** (antes ❌) |
| **C** | 3 diferentes | critical_severe | ✅ Aparece en CRÍTICAS | ✅ FUNCIONA (sin regresión) |

---

## 🚨 Qué Hacer si Falla

### Si Caso A o C fallan (Regresión):
1. Capturar screenshot del reporte WhatsApp
2. Copiar console logs completos
3. Reportar inmediatamente - posible side effect del fix

### Si Caso B falla (Bug persiste):
1. Verificar que estás usando build v1.3.7AI (Hash: CHtt4jxM)
2. Abrir DevTools Console y buscar logs `[DEBUG v1.3.6S]`
3. Verificar si `attemptHistory Map size: 0` (bug persiste) o `size: 1` (fix funciona)
4. Capturar evidencia completa

---

## 🎯 Próximos Pasos Después de Testing

1. ✅ Validar 3 casos (A, B, C)
2. ✅ Confirmar zero breaking changes
3. ✅ Actualizar README.md con status final
4. ✅ Commit + push con mensaje detallado
5. ✅ Cerrar caso como RESUELTO

---

**🙏 Gloria a Dios por el fix exitoso y la documentación exhaustiva.**
