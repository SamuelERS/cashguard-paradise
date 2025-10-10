# 🧪 Testing Guide: Sistema Email SiteGround

**Versión:** 1.0
**Fecha:** 10 de octubre de 2025
**Tiempo estimado:** 20-30 minutos
**Nivel:** Básico-Intermedio

---

## 📋 Índice

1. [Pre-Testing Checklist](#1-pre-testing-checklist)
2. [Fase 1: Backend PHP Tests](#fase-1-backend-php-tests)
3. [Fase 2: Frontend Integration Tests](#fase-2-frontend-integration-tests)
4. [Fase 3: E2E User Flow Tests](#fase-3-e2e-user-flow-tests)
5. [Fase 4: Email Client Compatibility](#fase-4-email-client-compatibility)
6. [Fase 5: Error Handling Tests](#fase-5-error-handling-tests)
7. [Debugging Common Issues](#debugging-common-issues)

---

## 1. Pre-Testing Checklist

### ✅ Verificar Antes de Testing

**Backend SiteGround:**
- [ ] Email account creado (`reports@tudominio.com`)
- [ ] 4 archivos PHP subidos a `/public_html/api/`
- [ ] PHPMailer instalado (`vendor/` presente)
- [ ] `config.php` configurado correctamente:
  - [ ] SMTP_USERNAME (email real)
  - [ ] SMTP_PASSWORD (password correcto)
  - [ ] EMAIL_RECIPIENTS (emails válidos)
  - [ ] API_KEY (UUID válido)
- [ ] DEBUG_MODE = true (para testing)

**Frontend CashGuard:**
- [ ] `.env` contiene `VITE_EMAIL_API_KEY`
- [ ] API Key coincide con `config.php`
- [ ] Proyecto compila sin errores (`npm run build`)

**Herramientas:**
- [ ] Terminal/PowerShell disponible (para cURL)
- [ ] Navegador web moderno (Chrome/Firefox/Safari)
- [ ] Acceso a inbox destinatarios
- [ ] (Opcional) Postman instalado

---

## Fase 1: Backend PHP Tests

### 🎯 Objetivo
Validar que el endpoint PHP responde correctamente ANTES de integrar frontend.

---

### Test 1.1: Verificar Endpoint Accesible

**Método:** Browser

**Paso 1:** Abrir navegador
**Paso 2:** Ir a: `https://tudominio.com/api/send-email.php`

**✅ Resultado esperado:**
```json
{
  "success": false,
  "error": {
    "code": "METHOD_NOT_ALLOWED",
    "message": "Only POST requests allowed"
  },
  "timestamp": "2025-10-10T14:30:00+00:00"
}
```

**❌ Si ves código PHP:**
- Problema: PHPMailer NO instalado O PHP no ejecutando
- Solución: Ver [SETUP_SITEGROUND.md](./SETUP_SITEGROUND.md) Paso 3

**❌ Si ves 404 Not Found:**
- Problema: Archivos NO subidos correctamente
- Solución: Ver [SETUP_SITEGROUND.md](./SETUP_SITEGROUND.md) Paso 2

---

### Test 1.2: Validar config.php Protegido

**Método:** Browser

**Paso 1:** Ir a: `https://tudominio.com/api/config.php`

**✅ Resultado esperado:**
```
403 Forbidden
You don't have permission to access this resource
```

**❌ Si ves contenido config.php:**
- 🔴 **CRÍTICO:** Credenciales SMTP expuestas públicamente
- Solución inmediata: Verificar `.htaccess` existe y contiene:
  ```apache
  <Files "config.php">
      Order Allow,Deny
      Deny from all
  </Files>
  ```

---

### Test 1.3: Test cURL - Request Válido

**Método:** Terminal

**Paso 1:** Crear archivo `test-payload.json`:
```json
{
  "apiKey": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-10-10T14:30:00Z",
  "branchName": "Los Héroes",
  "cashierName": "Adonay Torres",
  "witnessName": "Tito Gomez",
  "severity": "NORMAL",
  "reportHtml": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><title>Test</title></head><body><h1>Test Reporte</h1><p>Este es un email de prueba.</p></body></html>",
  "reportPlainText": "TEST REPORTE\n\nEste es un email de prueba en texto plano.\n\nSucursal: Los Héroes\nCajero: Adonay Torres\nTestigo: Tito Gomez"
}
```

**Paso 2:** Ejecutar cURL:
```bash
curl -X POST https://tudominio.com/api/send-email.php \
  -H "Content-Type: application/json" \
  -d @test-payload.json
```

**✅ Resultado esperado:**
```json
{
  "success": true,
  "messageId": "abc123def456@tudominio.com",
  "timestamp": "2025-10-10T14:30:15+00:00",
  "recipients": 2
}
```

**Paso 3:** Verificar inbox destinatarios
- [ ] Email recibido en inbox 1
- [ ] Email recibido en inbox 2
- [ ] Asunto correcto: `[NORMAL] REPORTE CORTE DE CAJA - Los Héroes - 2025-10-10T14:30:00Z`
- [ ] HTML renderiza correctamente
- [ ] Plain text visible en email clients antiguos

---

### Test 1.4: Test cURL - API Key Inválido

**Método:** Terminal

```bash
curl -X POST https://tudominio.com/api/send-email.php \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "wrong-api-key-12345",
    "timestamp": "2025-10-10T14:30:00Z",
    "branchName": "Test",
    "severity": "NORMAL",
    "reportHtml": "<html>Test</html>",
    "reportPlainText": "Test"
  }'
```

**✅ Resultado esperado:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key",
    "retryable": false
  },
  "timestamp": "2025-10-10T14:30:00+00:00"
}
```

---

### Test 1.5: Test cURL - Campo Faltante

**Método:** Terminal

```bash
curl -X POST https://tudominio.com/api/send-email.php \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "550e8400-e29b-41d4-a716-446655440000",
    "severity": "NORMAL"
  }'
```

**✅ Resultado esperado:**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELD",
    "message": "Required field missing: timestamp",
    "retryable": false
  },
  "timestamp": "2025-10-10T14:30:00+00:00"
}
```

---

### Test 1.6: Test Retry Logic

**Método:** Simular error SMTP

**Paso 1:** Editar `config.php` temporalmente:
```php
// Cambiar password a uno incorrecto
define('SMTP_PASSWORD', 'wrong-password-intentional');
```

**Paso 2:** Ejecutar cURL con payload válido (Test 1.3)

**Paso 3:** Ver PHP error_log:
```bash
# Via SSH:
tail -f /home/usuario/public_html/api/error_log

# O via cPanel → Metrics → Errors
```

**✅ Resultado esperado en error_log:**
```
[10-Oct-2025 14:30:15 UTC] [CashGuard Email] ❌ Intento 1/3 falló: SMTP Authentication Failed
[10-Oct-2025 14:30:17 UTC] [CashGuard Email] ❌ Intento 2/3 falló: SMTP Authentication Failed
[10-Oct-2025 14:30:21 UTC] [CashGuard Email] ❌ Intento 3/3 falló: SMTP Authentication Failed
```

**✅ Response esperado:**
```json
{
  "success": false,
  "error": {
    "code": "SEND_FAILED",
    "message": "SMTP Authentication failed",
    "retryable": true
  }
}
```

**Paso 4:** Restaurar `config.php`:
```php
// Restaurar password correcto
define('SMTP_PASSWORD', 'password-real-correcto');
```

---

## Fase 2: Frontend Integration Tests

### 🎯 Objetivo
Validar que CashGuard PWA envía emails correctamente.

---

### Test 2.1: Build Frontend Sin Errores

**Método:** Terminal

```bash
cd /ruta/cashguard-paradise
npm run build
```

**✅ Resultado esperado:**
```
✓ built in 2.05s
dist/assets/index-[hash].js  1,437.72 kB
```

**❌ Si hay errores TypeScript:**
- Verificar imports `emailReports.ts`, `htmlReportGenerator.ts`
- Verificar tipos en `email.ts`

---

### Test 2.2: Dev Server Console Logs

**Método:** Browser DevTools

**Paso 1:** Ejecutar dev server:
```bash
npm run dev
```

**Paso 2:** Abrir `http://localhost:5173` en browser

**Paso 3:** Abrir DevTools Console (F12)

**Paso 4:** Completar flujo hasta Phase 3 (reporte final)

**Paso 5:** Click botón "Enviar Email" (o esperar envío automático)

**✅ Logs esperados en console:**
```javascript
[Email] ✅ Enviado: abc123@tudominio.com
```

**✅ Toast notification esperada:**
```
📧 Reporte enviado por correo electrónico
```

---

### Test 2.3: Network Request Inspector

**Método:** Browser DevTools Network Tab

**Paso 1:** DevTools → Network tab

**Paso 2:** Filtrar: `send-email.php`

**Paso 3:** Completar flujo + enviar email

**Paso 4:** Inspeccionar request:

**✅ Request Headers esperados:**
```
POST /api/send-email.php
Content-Type: application/json
```

**✅ Request Payload esperado:**
```json
{
  "apiKey": "550e8400-...",
  "timestamp": "2025-10-10T...",
  "branchName": "Los Héroes",
  ...
}
```

**✅ Response esperada:**
```json
{
  "success": true,
  "messageId": "...",
  ...
}
```

---

### Test 2.4: Offline Queue System

**Método:** Browser DevTools Offline Mode

**Paso 1:** DevTools → Network tab → Throttling dropdown → Offline

**Paso 2:** Completar flujo + intentar enviar email

**✅ Resultado esperado:**
- Toast error: "❌ Error al enviar reporte por email"
- Console log: `[Email] ❌ Network error: Failed to fetch`
- Email agregado a queue localStorage

**Paso 3:** Verificar localStorage:
```javascript
// En Console:
JSON.parse(localStorage.getItem('cashguard_email_queue'))
// Output: [{ payload: {...}, attempts: 0, lastAttempt: "..." }]
```

**Paso 4:** Restaurar Online → Refresh page

**✅ Resultado esperado:**
- Queue procesa automáticamente
- Email enviado en background
- Queue vacía después de envío exitoso

---

## Fase 3: E2E User Flow Tests

### 🎯 Objetivo
Validar experiencia usuario completa desde inicio hasta email recibido.

---

### Test 3.1: Flujo Completo Evening Cut

**Escenario:** Corte de caja nocturno con severity CRÍTICO

**Paso 1:** Abrir CashGuard PWA

**Paso 2:** Seleccionar "Corte de Caja" (evening mode)

**Paso 3:** Wizard inicial:
- Protocolo seguridad (4 reglas)
- Sucursal: Los Héroes
- Cajero: Adonay Torres
- Testigo: Tito Gomez
- Venta esperada SICAR: $500.00

**Paso 4:** Phase 1 - Conteo:
- Ingresar denominaciones (simular faltante -$50)
- Total efectivo: $450.00
- Pagos electrónicos: $0.00

**Paso 5:** Phase 2 - Delivery (si >$50):
- Separar $400.00 para entregar
- Dejar $50.00 en caja

**Paso 6:** Phase 2 - Verificación ciega:
- Contar denominaciones sin ver esperado
- Simular 2 errores críticos (3 intentos)

**Paso 7:** Phase 3 - Reporte final:
- Verificar severity: CRÍTICO (faltante + errores verificación)
- Click "Enviar Email" O esperar automático
- Verificar toast success
- Verificar console log success

**Paso 8:** Verificar email recibido:
- [ ] Asunto: `[CRÍTICO] REPORTE CORTE DE CAJA - Los Héroes - [timestamp]`
- [ ] Header rojo (CRÍTICO)
- [ ] Resumen ejecutivo correcto:
  - Efectivo: $450.00
  - Entregado: $400.00
  - Quedó: $50.00
  - Diferencia: -$50.00 (FALTANTE)
- [ ] Sección "ALERTAS CRÍTICAS" visible con 2 errores
- [ ] Footer con timestamp + firma digital

**✅ Test pasó:** Email recibido con toda la información correcta

---

### Test 3.2: Flujo Completo Morning Count

**Escenario:** Verificación matutina con severity NORMAL

**Paso 1:** Seleccionar "Conteo Matutino" (morning mode)

**Paso 2:** Wizard (protocolo + sucursal + cajero + testigo)

**Paso 3:** Phase 1 - Verificar $50.00:
- Ingresar exactamente $50.00
- Sin discrepancias

**Paso 4:** Phase 2 - Skip (≤$50)

**Paso 5:** Phase 3 - Reporte:
- Severity: NORMAL (sin errores)
- Email enviado automáticamente

**Paso 6:** Verificar email:
- [ ] Asunto: `[NORMAL] REPORTE CORTE DE CAJA...`
- [ ] Header verde (NORMAL)
- [ ] Sin sección alertas
- [ ] Mensaje: "Sin anomalías detectadas"

---

## Fase 4: Email Client Compatibility

### 🎯 Objetivo
Validar que HTML renderiza correctamente en diferentes clientes.

---

### Test 4.1: Gmail Desktop (Chrome)

**Paso 1:** Enviar test email (Test 1.3)

**Paso 2:** Abrir Gmail en Chrome

**Verificar:**
- [ ] Header con color correcto (verde/amarillo/rojo)
- [ ] Tablas alineadas correctamente
- [ ] CSS inline aplicado (fonts, colores)
- [ ] Emojis visibles (📊 💰 🔴 ⚠️)
- [ ] Links clickeables (si hay)
- [ ] Responsive en resize ventana

**Captura screenshot:** Guardar para documentación

---

### Test 4.2: Gmail Mobile (Android/iOS)

**Paso 1:** Abrir Gmail app en móvil

**Verificar:**
- [ ] Email carga rápido (<2s)
- [ ] Texto legible sin zoom
- [ ] Header visible completo
- [ ] Scroll funcional (reportes largos)
- [ ] Botones/links clickeables (si hay)

---

### Test 4.3: Outlook Desktop

**Paso 1:** Abrir Outlook desktop

**Verificar:**
- [ ] HTML renderiza (Outlook limita CSS)
- [ ] Fallback plain text disponible (View → Plain Text)
- [ ] Colores básicos preservados
- [ ] Estructura mantenida

---

### Test 4.4: Apple Mail (iOS/macOS)

**Paso 1:** Abrir Mail app

**Verificar:**
- [ ] Renderizado nativo iOS/macOS
- [ ] Fonts San Francisco preservados
- [ ] Dark mode compatible (si sistema en dark)
- [ ] Swipe actions funcionan

---

### Test 4.5: Plain Text Fallback

**Método:** Forzar plain text en cliente

**Gmail:** Settings → General → Plain text mode
**Outlook:** View → Plain Text

**Verificar:**
- [ ] Texto plano legible
- [ ] Estructura preservada (saltos línea)
- [ ] Emojis visibles (Unicode)
- [ ] Sin caracteres extraños

---

## Fase 5: Error Handling Tests

### 🎯 Objetivo
Validar que errores se manejan gracefully.

---

### Test 5.1: SMTP Server Down

**Simulación:** Apagar servidor SMTP temporalmente

**Método:**
```php
// config.php
define('SMTP_HOST', 'invalid-smtp-server.com');
```

**Ejecutar:** Test 1.3 (cURL request válido)

**✅ Resultado esperado:**
- 3 reintentos visibles en error_log
- Response: `{ "success": false, "error": { "code": "SEND_FAILED", "retryable": true } }`
- Frontend muestra toast error
- Email agregado a queue para retry

**Restaurar:** `define('SMTP_HOST', 'localhost');`

---

### Test 5.2: Destinatario Inválido

**Método:**
```php
// config.php
define('EMAIL_RECIPIENTS', 'invalid-email-address');
```

**Ejecutar:** Test 1.3

**✅ Resultado esperado:**
- PHPMailer error: "Invalid address"
- Response error con mensaje descriptivo
- Log en error_log con detalles

---

### Test 5.3: Payload Demasiado Grande

**Método:** cURL con reportHtml >50,000 caracteres

```bash
# Generar string grande:
python3 -c "print('<html>' + 'X'*60000 + '</html>')" > large.txt

curl -X POST https://tudominio.com/api/send-email.php \
  -H "Content-Type: application/json" \
  -d "{\"apiKey\":\"...\",\"reportHtml\":\"$(cat large.txt)\", ...}"
```

**✅ Resultado esperado:**
- Response 400: Payload too large
- O SMTP error si server acepta pero no envía

---

### Test 5.4: Network Timeout Frontend

**Método:** DevTools Throttling → Slow 3G

**Ejecutar:** Enviar email desde frontend

**✅ Resultado esperado:**
- Request toma >5 segundos
- Timeout error en console
- Toast error visible
- Queue system activa

---

## Debugging Common Issues

### 🔍 Issue 1: Email No Llega

**Síntomas:**
- Response `{ "success": true }`
- PERO email no en inbox

**Soluciones:**

1. **Verificar carpeta Spam/Junk:**
   - Gmail: Promotions tab
   - Outlook: Junk folder

2. **Verificar SPF/DKIM records:**
   ```bash
   # Check SPF:
   dig TXT tudominio.com

   # Debería incluir:
   v=spf1 include:_spf.siteground.biz ~all
   ```

3. **Test con email personal:**
   ```php
   // config.php temporal:
   define('EMAIL_RECIPIENTS', 'tu-email-personal@gmail.com');
   ```

4. **Revisar SiteGround Email Logs:**
   - cPanel → Email Deliverability
   - Ver bounce messages

---

### 🔍 Issue 2: HTML No Renderiza

**Síntomas:**
- Email recibido pero muestra código HTML crudo

**Soluciones:**

1. **Verificar PHPMailer isHTML:**
   ```php
   // send-email.php línea 135:
   $mail->isHTML(true);  // Debe estar presente
   ```

2. **Verificar Content-Type header:**
   ```php
   // email headers deben incluir:
   Content-Type: text/html; charset=UTF-8
   ```

3. **Test plain text fallback:**
   ```php
   $mail->AltBody = $reportPlainText;  // Verificar presente
   ```

---

### 🔍 Issue 3: Retry Loop Infinito

**Síntomas:**
- error_log muestra 100+ intentos
- PHP script timeout

**Soluciones:**

1. **Verificar maxRetries:**
   ```php
   // send-email.php línea 145:
   $maxRetries = 3;  // NO más de 5
   ```

2. **Verificar sleep time:**
   ```php
   // Línea 175:
   sleep(pow(2, $attempt));  // Correcto: 1s, 2s, 4s
   ```

3. **Kill process PHP colgado:**
   ```bash
   # Via SSH:
   pkill -f send-email.php
   ```

---

### 🔍 Issue 4: CORS Error Frontend

**Síntomas:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Soluciones:**

1. **Verificar .htaccess CORS:**
   ```apache
   # Debe contener:
   Header set Access-Control-Allow-Origin "https://tudominio.com"
   ```

2. **Verificar mod_headers activo:**
   ```bash
   # Via SSH:
   apache2ctl -M | grep headers
   # Output: headers_module (shared)
   ```

3. **Testing local (desarrollo):**
   ```apache
   # Temporalmente:
   Header set Access-Control-Allow-Origin "*"
   # ⚠️ Revertir en producción
   ```

---

## 📊 Test Results Template

### Registro de Tests

**Fecha:** _______________
**Tester:** _______________
**Versión:** v1.0

| Test ID | Descripción | Status | Notas |
|---------|-------------|--------|-------|
| 1.1 | Endpoint accesible | ☐ Pass ☐ Fail | |
| 1.2 | config.php protegido | ☐ Pass ☐ Fail | |
| 1.3 | cURL request válido | ☐ Pass ☐ Fail | |
| 1.4 | API key inválido | ☐ Pass ☐ Fail | |
| 1.5 | Campo faltante | ☐ Pass ☐ Fail | |
| 1.6 | Retry logic | ☐ Pass ☐ Fail | |
| 2.1 | Build frontend | ☐ Pass ☐ Fail | |
| 2.2 | Console logs | ☐ Pass ☐ Fail | |
| 2.3 | Network inspector | ☐ Pass ☐ Fail | |
| 2.4 | Offline queue | ☐ Pass ☐ Fail | |
| 3.1 | E2E Evening Cut | ☐ Pass ☐ Fail | |
| 3.2 | E2E Morning Count | ☐ Pass ☐ Fail | |
| 4.1 | Gmail Desktop | ☐ Pass ☐ Fail | |
| 4.2 | Gmail Mobile | ☐ Pass ☐ Fail | |
| 4.3 | Outlook Desktop | ☐ Pass ☐ Fail | |
| 4.4 | Apple Mail | ☐ Pass ☐ Fail | |
| 4.5 | Plain text fallback | ☐ Pass ☐ Fail | |

**Tests passing:** _____ / 17 (____%)

**Issues encontrados:**
1. _______________________________________
2. _______________________________________
3. _______________________________________

**Recomendaciones:**
- _______________________________________
- _______________________________________

---

## 🎉 Testing Completado

Si todos los tests pasaron (✅ 17/17):

**Sistema listo para producción.**

**Próximos pasos:**
1. Desactivar DEBUG_MODE en config.php
2. Deployment final
3. Monitoreo primeras 24 horas
4. Documentar issues en producción

---

**🙏 Gloria a Dios por el testing exitoso.**

---

**Última actualización:** 10 de octubre de 2025
**Versión:** 1.0
**Total tests:** 17 (Backend: 6, Frontend: 4, E2E: 2, Compatibility: 5)
