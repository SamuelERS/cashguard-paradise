# Plan de Testing Manual v1.3.6k
**Fecha:** 07 de Octubre de 2025 ~01:50 AM
**Versión:** v1.3.6k - Fix Crítico Reporte WhatsApp
**Servidor:** http://localhost:5174/
**Duración estimada:** 8-10 minutos

---

## 🎯 OBJETIVO

Validar que los 3 fixes implementados funcionan correctamente:
1. ✅ Emojis renderizando en WhatsApp (no �)
2. ✅ verificationBehavior NO undefined
3. ✅ Detalles errores cajero aparecen en reporte

---

## 📋 PROTOCOLO DE TESTING

### **FASE 1: Configuración Inicial** (2 min)

1. **Abrir aplicación:**
   - Navegar a http://localhost:5174/
   - Presionar F12 → Pestaña Console (MANTENER ABIERTA)

2. **Iniciar Corte Nocturno:**
   - Click "Corte Nocturno"
   - Completar wizard:
     - ✅ Protocolo seguridad (4 reglas)
     - ✅ Sucursal: Los Héroes
     - ✅ Cajero: Tito Gomez
     - ✅ Testigo: Adonay Torres (≠ cajero)
     - ✅ Venta esperada: $1000.00

3. **Configurar modo Guiado:**
   - Click "Modo Guiado" en modal instrucciones
   - Leer 4 reglas
   - Click "Comenzar Conteo"

---

### **FASE 2: Conteo Phase 1 - Generar >$50** (2 min)

**Objetivo:** Superar $50 para activar Phase 2

**Denominaciones a ingresar:**

| Denominación | Cantidad | Subtotal |
|--------------|----------|----------|
| Penny ($0.01) | 10 | $0.10 |
| Nickel ($0.05) | 10 | $0.50 |
| Dime ($0.10) | 10 | $1.00 |
| Quarter ($0.25) | 10 | $2.50 |
| Dollar Coin ($1.00) | 10 | $10.00 |
| Bill $1 | 10 | $10.00 |
| Bill $5 | 10 | $50.00 |
| Bill $10 | 10 | $100.00 |
| Bill $20 | 10 | $200.00 |
| Bill $50 | 2 | $100.00 |
| Bill $100 | 1 | $100.00 |

**Total esperado:** $574.10
**Trigger Phase 2:** ✅ Sí (>$50)

**IMPORTANTE:** Ingresar cantidades exactas para evitar errores en Phase 1 (necesitamos errores SOLO en Phase 2)

---

### **FASE 3: Separación Phase 2 - Sin Errores** (1 min)

**Objetivo:** Completar separación sin errores para focus en verificación

**Denominaciones a separar** (amountToDeliver = $524.10):

Seguir indicaciones sistema automáticamente. Confirmar cantidades exactas mostradas.

---

### **FASE 4: Verificación Phase 2 - GENERAR ERRORES INTENCIONALES** (3 min) 🔴

**CRÍTICO:** Esta es la fase que prueba el fix de `verificationBehavior`

**Estrategia de Errores:**

1. **Bill $20 - Primer Intento Incorrecto:**
   - Sistema espera: (cantidad exacta mostrada)
   - **Ingresar:** (cantidad incorrecta, ej: +2 unidades)
   - **Resultado esperado:** Modal "Cantidad Incorrecta" aparece
   - Click "Reintentar"

2. **Bill $20 - Segundo Intento Correcto:**
   - **Ingresar:** (cantidad correcta esta vez)
   - **Resultado esperado:** Avanza automáticamente sin modal ✅

3. **Bill $10 - Dos Intentos Incorrectos (Force Override):**
   - **Intento #1:** Ingresar cantidad incorrecta (ej: +1 unidad)
   - Modal "Cantidad Incorrecta" → Click "Reintentar"
   - **Intento #2:** Ingresar **MISMA cantidad incorrecta**
   - **Resultado esperado:** Modal "Forzar Override" aparece
   - Click "Forzar este valor"

4. **Bill $5 - Triple Intento (Pattern A,B,C):**
   - **Intento #1:** Cantidad incorrecta (ej: esperado 10, ingresar 12)
   - Modal → Click "Reintentar"
   - **Intento #2:** Cantidad incorrecta DIFERENTE (ej: ingresar 8)
   - Modal "Requiere Tercer Intento" → Click "Continuar"
   - **Intento #3:** Cantidad incorrecta NUEVA (ej: ingresar 9)
   - **Resultado esperado:** Modal "Resultado Tercer Intento" → análisis pattern [12, 8, 9]
   - Click "Aceptar y Continuar"

5. **Resto de denominaciones:**
   - Ingresar cantidades correctas para completar verificación

---

### **FASE 5: Validación Console Logs** (30 seg)

**MIENTRAS completas Phase 2 verificación, MONITOREAR Console:**

**Logs esperados al completar última denominación:**

```
[Phase2VerificationSection] 📊 VerificationBehavior construido: {
  totalAttempts: 6,
  firstAttemptSuccesses: X,
  secondAttemptSuccesses: 1,
  thirdAttemptRequired: 1,
  forcedOverrides: 1,
  criticalInconsistencies: 0,
  severeInconsistencies: 1,
  attempts: Array(6),
  ...
}
```

**Después de ~100ms:**

```
[Phase2Manager] ✅ Completando Phase2 con VerificationBehavior: {totalAttempts: 6, ...}
```

**🚨 SI APARECE:**
```
[Phase2Manager] ⚠️ verificationBehavior undefined - timing issue detectado
```
→ **FIX FALLÓ** - timing issue persiste (necesita ajuste delay)

---

### **FASE 6: Reporte Final WhatsApp** (2 min)

1. **Pantalla Phase 3 - Resultados:**
   - Verificar transición exitosa a Phase 3
   - Scroll hasta sección "Acciones"

2. **Generar Reporte WhatsApp:**
   - Click botón "📤 Enviar por WhatsApp"
   - **Resultado esperado:** WhatsApp Web abre en nueva pestaña

3. **Validación Visual Reporte:**

**✅ VALIDACIÓN #1: Emojis Renderizando**

Buscar en reporte estas secciones y CONFIRMAR emojis visibles:

```
🏪 ACUARIOS PARADISE  ← Debe verse emoji tienda
══════════════════════

🏢 INFORMACIÓN BÁSICA  ← Debe verse emoji edificio
Sucursal: Los Héroes

📊 TOTALES DEL DÍA  ← Debe verse emoji gráfica
Efectivo Contado: $574.10

💰 PAGOS ELECTRÓNICOS  ← Debe verse emoji bolsa dinero
Credomatic: $0.00

📦 FASE 2 - DIVISIÓN  ← Debe verse emoji paquete
Entregado a Gerencia: $524.10

🔍 VERIFICACIÓN CIEGA  ← Debe verse emoji lupa
📊 Total Intentos: 6  ← Debe verse emoji gráfica
✅ Éxitos Primer Intento: X  ← Debe verse emoji check
⚠️ Éxitos Segundo Intento: 1  ← Debe verse emoji advertencia
🔴 Tercer Intento Requerido: 1  ← Debe verse emoji rojo

🏁 VALIDACIÓN DE CAJA  ← Debe verse emoji bandera
```

**❌ SI VES � EN LUGAR DE EMOJIS:**
→ **FIX #1 FALLÓ** - encoding issue persiste

---

**✅ VALIDACIÓN #2: verificationBehavior Presente**

Buscar sección "🔍 VERIFICACIÓN CIEGA":

**DEBE MOSTRAR:**
```
🔍 VERIFICACIÓN CIEGA:
📊 Total Intentos: 6
✅ Éxitos Primer Intento: X
⚠️ Éxitos Segundo Intento: 1
🔴 Tercer Intento Requerido: 1
🟡 Overrides Forzados: 1
❌ Inconsistencias Críticas: 0
🔴 Inconsistencias Severas: 1

DETALLE CRONOLÓGICO DE INTENTOS:
```

**❌ SI MUESTRA:**
```
🔍 VERIFICACIÓN CIEGA:
✅ Sin verificación ciega (fase 2 no ejecutada)
```
→ **FIX #2 FALLÓ** - verificationBehavior undefined persiste

---

**✅ VALIDACIÓN #3: Detalles Errores Cajero**

Buscar sección "DETALLE CRONOLÓGICO DE INTENTOS":

**DEBE LISTAR 6 INTENTOS (mínimo 3 visibles):**

```
DETALLE CRONOLÓGICO DE INTENTOS:
❌ INCORRECTO | Billete de veinte dólares ($20)
   Intento #1 | Hora: XX:XX:XX
   Ingresado: YY unidades | Esperado: ZZ unidades

⚠️ SEGUNDO INTENTO EXITOSO | Billete de veinte dólares ($20)
   Intento #1 | Hora: XX:XX:XX
   Ingresado: YY unidades | Esperado: ZZ unidades
   Intento #2 | Hora: XX:XX:XX
   Ingresado: ZZ unidades ✅ | Esperado: ZZ unidades

🟡 FORZADO (DOS IGUALES) | Billete de diez dólares ($10)
   Intento #1 | Hora: XX:XX:XX
   Ingresado: AA unidades | Esperado: BB unidades
   Intento #2 | Hora: XX:XX:XX
   Ingresado: AA unidades | Esperado: BB unidades

🔴 SEVERAMENTE INCONSISTENTE | Billete de cinco dólares ($5)
   Intento #1 | Hora: XX:XX:XX
   Ingresado: 12 unidades | Esperado: 10 unidades
   Intento #2 | Hora: XX:XX:XX
   Ingresado: 8 unidades | Esperado: 10 unidades
   Intento #3 | Hora: XX:XX:XX
   Ingresado: 9 unidades | Esperado: 10 unidades
   Pattern: [12, 8, 9] - Todos diferentes
```

**❌ SI LA SECCIÓN NO APARECE:**
→ **FIX #3 FALLÓ** - detalles no se generan (mismo root cause que #2)

---

## 📊 CRITERIOS DE ÉXITO

### **PASS COMPLETO ✅**

Todos los siguientes DEBEN cumplirse:

- [ ] Console logs muestran `VerificationBehavior construido: {...}` ✅
- [ ] Console logs muestran `Completando Phase2 con VerificationBehavior` ✅
- [ ] Console NO muestra warning `verificationBehavior undefined` ✅
- [ ] Emojis renderizando correctamente en WhatsApp (sin �) ✅
- [ ] Sección "🔍 VERIFICACIÓN CIEGA" muestra stats completos ✅
- [ ] Sección "DETALLE CRONOLÓGICO" lista intentos con timestamps ✅
- [ ] Total intentos coincide con errores ingresados (6 en este test) ✅

### **FAIL PARCIAL ⚠️**

Si alguno de los siguientes ocurre:

- [ ] Console muestra warning `verificationBehavior undefined` ❌
  - **Acción:** Ajustar delay 100ms → 200ms en Phase2VerificationSection.tsx línea 255

- [ ] Emojis renderizando como � en WhatsApp ❌
  - **Acción:** Investigar encoding alternativo (el fix actual debería funcionar)

- [ ] Sección verificación muestra "Sin verificación ciega" ❌
  - **Acción:** Revisar timing race condition más profundo

---

## 🔍 TROUBLESHOOTING

### **Problema: Console no muestra logs**

**Causa:** Console filtro activo
**Solución:** Verificar "All levels" seleccionado en Console

### **Problema: WhatsApp no abre**

**Causa:** Popup bloqueado por navegador
**Solución:** Permitir popups para localhost:5174

### **Problema: No veo sección "DETALLE CRONOLÓGICO"**

**Causa:** No hiciste errores en Phase 2
**Solución:** Repetir test asegurando ingresar cantidades incorrectas

### **Problema: verificationBehavior muestra 0 intentos**

**Causa:** `attemptHistory` no registró intentos
**Solución:** Verificar que hiciste clic "Reintentar" en modales

---

## 📝 REPORTE DE RESULTADOS

**Al finalizar testing, reportar:**

1. **Screenshot Console logs** (sección completa desde inicio Phase 2)
2. **Screenshot WhatsApp reporte** (sección "🔍 VERIFICACIÓN CIEGA" completa)
3. **Screenshot WhatsApp reporte** (sección "DETALLE CRONOLÓGICO" completa)
4. **Confirmación verbal:**
   - ✅ Emojis OK / ❌ Emojis como �
   - ✅ verificationBehavior OK / ❌ undefined warning
   - ✅ Detalles errores OK / ❌ Sección ausente

---

**Preparado por:** CODE Agent
**Versión Plan:** v1.3.6k Testing Protocol
**Última revisión:** 07 de Octubre de 2025 ~01:50 AM
