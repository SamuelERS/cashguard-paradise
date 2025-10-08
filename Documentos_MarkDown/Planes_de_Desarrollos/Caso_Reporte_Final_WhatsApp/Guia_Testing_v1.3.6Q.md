# 🧪 GUÍA DE TESTING - v1.3.6Q
**Sistema Completo de Alertas de Verificación**

---

## 📋 OBJETIVO

Validar que **100% de los errores de verificación** (1, 2, o 3 intentos) ahora aparecen correctamente en el reporte WhatsApp en sus secciones correspondientes.

---

## ✅ 6 CASOS DE PRUEBA OBLIGATORIOS

### **Caso 1: Éxito primer intento** ✅
**Acción:** Ingresar cantidad correcta en primer intento
**Ejemplo:** Si sistema espera 65 centavos, ingresar `65`
**Resultado esperado en reporte:**
- ❌ NO debe aparecer en ALERTAS CRÍTICAS
- ❌ NO debe aparecer en ADVERTENCIAS
- ✅ Solo debe incrementar contador "Correcto en Primer Intento"

---

### **Caso 2: Error corregido en segundo intento** ⚠️
**Acción:**
1. Primer intento: Ingresar valor incorrecto (ej: `64`)
2. Segundo intento: Ingresar valor correcto (ej: `65`)

**Resultado esperado en reporte:**
```
⚠️ ADVERTENCIAS:
⚠️ Un centavo (1¢): 64 → 65
━━━━━━━━━━━━━━━━━━
```

**Contadores esperados:**
- ✅ Correcto en Primer Intento: 0
- ⚠️ Correcto en Segundo Intento: 1
- 🔴 Tercer Intento Requerido: 0

---

### **Caso 3: Un solo error (no hay reintento)** ⚠️
**Acción:**
1. Ingresar valor incorrecto (ej: `66`)
2. Presionar botón "Forzar y Continuar"

**Resultado esperado en reporte:**
```
⚠️ ADVERTENCIAS:
⚠️ Cinco centavos (5¢): 66
━━━━━━━━━━━━━━━━━━
```

**Contadores esperados:**
- 🚨 Valores Forzados (Override): 1

---

### **Caso 4: Dos intentos iguales incorrectos** 🚨
**Acción:**
1. Primer intento: Ingresar valor incorrecto (ej: `64`)
2. Segundo intento: Repetir **mismo** valor incorrecto (`64`)
3. Sistema fuerza override automáticamente

**Resultado esperado en reporte:**
```
⚠️ ADVERTENCIAS:
🚨 Diez centavos (10¢): 64 → 64
━━━━━━━━━━━━━━━━━━
```

**Contadores esperados:**
- 🚨 Valores Forzados (Override): 1

---

### **Caso 5: Dos intentos diferentes** ⚠️
**Acción:**
1. Primer intento: Ingresar valor incorrecto (ej: `64`)
2. Segundo intento: Ingresar **otro** valor incorrecto (ej: `68`)
3. Sistema requiere tercer intento

**Resultado esperado en reporte:**
```
⚠️ ADVERTENCIAS:
⚠️ Veinticinco centavos (25¢): 64 → 68 → [valor tercer intento]
━━━━━━━━━━━━━━━━━━
```

**Contadores esperados:**
- 🔴 Tercer Intento Requerido: 1

---

### **Caso 6: Tres intentos totalmente diferentes** 🔴
**Acción:**
1. Primer intento: Valor incorrecto (ej: `64`)
2. Segundo intento: Otro valor incorrecto diferente (ej: `68`)
3. Tercer intento: Otro valor incorrecto diferente (ej: `66`)

**Resultado esperado en reporte:**
```
🔴 ALERTAS CRÍTICAS:
🔴 Cincuenta centavos (50¢): 64 → 68 → 66 (critical_severe)
━━━━━━━━━━━━━━━━━━
```

**Contadores esperados:**
- 🔴 Tercer Intento Requerido: 1
- ⚠️ Inconsistencias Severas: 1

---

## 📊 TABLA COMPARATIVA RESULTADOS

| Caso | Intentos | Severity | Sección Reporte | Antes v1.3.6P | Después v1.3.6Q |
|------|----------|----------|-----------------|---------------|-----------------|
| 1 | 1 ✅ | success | Ninguna | ❌ No aparecía | ✅ No aparece |
| 2 | 2 (❌→✅) | warning_retry | ADVERTENCIAS | ❌ No aparecía | ✅ Aparece |
| 3 | 1 ❌ | warning_retry | ADVERTENCIAS | ❌ No aparecía | ✅ Aparece |
| 4 | 2 (A,A) | warning_override | ADVERTENCIAS | ❌ No aparecía | ✅ Aparece |
| 5 | 2 (A,B) | warning_retry | ADVERTENCIAS | ❌ No aparecía | ✅ Aparece |
| 6 | 3 (A,B,C) | critical_severe | ALERTAS CRÍTICAS | ✅ Aparecía | ✅ Aparece |

---

## 🎯 CRITERIOS DE ÉXITO

Para considerar v1.3.6Q exitoso, el reporte WhatsApp debe mostrar:

✅ **Casos 2-5:** TODOS deben aparecer en sección "⚠️ ADVERTENCIAS"
✅ **Caso 6:** Debe aparecer en sección "🔴 ALERTAS CRÍTICAS"
✅ **Caso 1:** NO debe aparecer en ninguna sección (comportamiento correcto)
✅ **Contadores:** Deben sumar correctamente según los casos ejecutados
✅ **Detalle cronológico:** Debe mostrar timestamps y valores de TODOS los intentos

---

## 📝 INSTRUCCIONES DE EJECUCIÓN

1. **Iniciar sesión nueva** de conteo nocturno o matutino
2. **Completar wizard** inicial (protocolo, sucursal, cajero, testigo, venta esperada)
3. **En Fase 2 (División de Efectivo):**
   - Completar separación de denominaciones
   - Pasar a **sección de verificación**
4. **Ejecutar casos de prueba:**
   - Caso 1: Al menos 1 denominación (para validar que NO aparece)
   - Casos 2-6: **IMPORTANTE** - Ejecutar TODOS para validar visibilidad completa
5. **Generar reporte WhatsApp**
6. **Verificar:**
   - Sección "🔴 ALERTAS CRÍTICAS" (solo Caso 6)
   - Sección "⚠️ ADVERTENCIAS" (Casos 2-5)
   - Contadores totales
   - Detalle cronológico de intentos

---

## 🐛 PROBLEMAS A REPORTAR

Si algún caso **NO cumple** los resultados esperados:

1. **Capturar screenshot** del reporte WhatsApp
2. **Anotar:**
   - Caso de prueba ejecutado (1-6)
   - Valores ingresados en cada intento
   - Resultado obtenido vs esperado
3. **Reportar** para corrección inmediata

---

## ✅ VALIDACIÓN COMPLETA

Una vez completados los 6 casos, confirmar:

- [ ] Caso 1: No aparece en reporte ✅
- [ ] Caso 2: Aparece en ADVERTENCIAS ✅
- [ ] Caso 3: Aparece en ADVERTENCIAS ✅
- [ ] Caso 4: Aparece en ADVERTENCIAS ✅
- [ ] Caso 5: Aparece en ADVERTENCIAS ✅
- [ ] Caso 6: Aparece en ALERTAS CRÍTICAS ✅
- [ ] Contadores suman correctamente ✅
- [ ] Detalle cronológico completo ✅

---

**🙏 Que Dios bendiga este testing y confirme la corrección exitosa.**

**Versión:** v1.3.6Q
**Fecha:** 08 Oct 2025
**Archivo:** `Guia_Testing_v1.3.6Q.md`
