# 📡 API Reference: SiteGround Email Endpoint

**Versión:** 1.0
**Fecha:** 10 de octubre de 2025
**Endpoint:** `/api/send-email.php`
**Método:** POST
**Content-Type:** application/json

---

## 📋 Índice

1. [Resumen del Endpoint](#1-resumen-del-endpoint)
2. [Autenticación](#2-autenticación)
3. [Request Schema](#3-request-schema)
4. [Response Schema](#4-response-schema)
5. [Códigos de Error](#5-códigos-de-error)
6. [Ejemplos de Uso](#6-ejemplos-de-uso)
7. [Rate Limiting](#7-rate-limiting)
8. [Seguridad](#8-seguridad)

---

## 1. Resumen del Endpoint

### 🎯 Propósito
Enviar reportes de corte de caja por correo electrónico de forma automática y confiable.

### 📍 URL Base
```
https://tudominio.com/api/send-email.php
```

### 🔧 Características
- ✅ Validación API Key (UUID v4)
- ✅ Retry automático (3 intentos, exponential backoff)
- ✅ Soporte HTML + Plain text fallback
- ✅ Múltiples destinatarios
- ✅ Logging completo (error_log PHP)
- ✅ CORS configurado

### 🔐 Autenticación
API Key basado en UUID v4 enviado en payload JSON.

---

## 2. Autenticación

### Método: API Key

**Ubicación:** Body JSON
**Campo:** `apiKey`
**Formato:** UUID v4 (36 caracteres)

**Ejemplo:**
```json
{
  "apiKey": "550e8400-e29b-41d4-a716-446655440000",
  ...
}
```

### Obtener API Key

1. Configurada en `config.php` del servidor:
   ```php
   define('API_KEY', '550e8400-e29b-41d4-a716-446655440000');
   ```

2. Configurada en `.env` del frontend:
   ```bash
   VITE_EMAIL_API_KEY=550e8400-e29b-41d4-a716-446655440000
   ```

⚠️ **Importante:** Ambas deben coincidir exactamente.

### Errores de Autenticación

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key"
  },
  "timestamp": "2025-10-10T14:30:00+00:00"
}
```

---

## 3. Request Schema

### Headers Requeridos

```http
POST /api/send-email.php HTTP/1.1
Host: tudominio.com
Content-Type: application/json
```

### Body JSON

#### Campos Requeridos

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `apiKey` | string | UUID v4 autenticación | `"550e8400-e29b-..."` |
| `timestamp` | string | ISO 8601 timestamp | `"2025-10-10T14:30:00Z"` |
| `branchName` | string | Nombre sucursal | `"Los Héroes"` |
| `cashierName` | string | Nombre cajero | `"Adonay Torres"` |
| `witnessName` | string | Nombre testigo | `"Tito Gomez"` |
| `severity` | string | Nivel severidad | `"CRÍTICO"` \| `"ADVERTENCIAS"` \| `"NORMAL"` |
| `reportHtml` | string | Reporte HTML completo | `"<html>...</html>"` |
| `reportPlainText` | string | Reporte texto plano | `"REPORTE CORTE..."` |

#### Campos Opcionales

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `attachments` | array | Adjuntos futuros (no implementado) | `[]` |

### Ejemplo Request Completo

```json
{
  "apiKey": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2025-10-10T14:30:00Z",
  "branchName": "Los Héroes",
  "cashierName": "Adonay Torres",
  "witnessName": "Tito Gomez",
  "severity": "CRÍTICO",
  "reportHtml": "<!DOCTYPE html><html><head><meta charset=\"UTF-8\"><style>body{font-family:'Segoe UI',Arial;}.header-critical{background:#dc2626;color:white;padding:1rem;}</style></head><body><div class=\"header-critical\"><h1>🚨 REPORTE CRÍTICO - ACCIÓN INMEDIATA</h1></div><div style=\"padding:1rem;\"><p><strong>📊 CORTE DE CAJA</strong> - 10/10/2025, 14:30</p><p>Sucursal: Los Héroes</p><p>Cajero: Adonay Torres</p><p>Testigo: Tito Gomez</p></div></body></html>",
  "reportPlainText": "🚨 REPORTE CRÍTICO - ACCIÓN INMEDIATA\n\n📊 CORTE DE CAJA - 10/10/2025, 14:30\nSucursal: Los Héroes\nCajero: Adonay Torres\nTestigo: Tito Gomez\n\n━━━━━━━━━━━━━━━━━━━━\n\n📊 RESUMEN EJECUTIVO\n\n💰 Efectivo Contado: $377.20\n..."
}
```

### Validaciones Request

**Campo `severity`:**
- ✅ Valores permitidos: `"CRÍTICO"`, `"ADVERTENCIAS"`, `"NORMAL"`
- ❌ Otros valores → 400 Bad Request

**Campo `timestamp`:**
- ✅ Formato ISO 8601: `YYYY-MM-DDTHH:mm:ssZ`
- ❌ Formato inválido → Aceptado pero puede causar errores display

**Campo `reportHtml`:**
- Mínimo: 100 caracteres
- Máximo: 50,000 caracteres
- ❌ Fuera de rango → 400 Bad Request

**Campo `reportPlainText`:**
- Mínimo: 100 caracteres
- Máximo: 50,000 caracteres
- ❌ Fuera de rango → 400 Bad Request

---

## 4. Response Schema

### Response Exitoso (200 OK)

```json
{
  "success": true,
  "messageId": "abc123def456@tudominio.com",
  "timestamp": "2025-10-10T14:30:15+00:00",
  "recipients": 2
}
```

#### Campos Response Exitoso

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Siempre `true` |
| `messageId` | string | ID único mensaje SMTP |
| `timestamp` | string | Timestamp ISO 8601 server |
| `recipients` | number | Cantidad destinatarios exitosos |

### Response Error (4xx/5xx)

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción legible del error",
    "retryable": true
  },
  "timestamp": "2025-10-10T14:30:15+00:00"
}
```

#### Campos Response Error

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `success` | boolean | Siempre `false` |
| `error.code` | string | Código error (ver sección 5) |
| `error.message` | string | Mensaje descriptivo |
| `error.retryable` | boolean | `true` si retry recomendado |
| `timestamp` | string | Timestamp ISO 8601 server |

---

## 5. Códigos de Error

### 4xx Client Errors

#### 400 Bad Request

**INVALID_JSON**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_JSON",
    "message": "Invalid JSON payload",
    "retryable": false
  }
}
```
**Causa:** Body no es JSON válido
**Solución:** Verificar `JSON.stringify()` y sintaxis

---

**MISSING_FIELD**
```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELD",
    "message": "Required field missing: timestamp",
    "retryable": false
  }
}
```
**Causa:** Falta campo requerido
**Solución:** Verificar todos los campos requeridos presentes

---

#### 401 Unauthorized

**UNAUTHORIZED**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid API key",
    "retryable": false
  }
}
```
**Causa:** API Key inválido o faltante
**Solución:** Verificar UUID en `.env` coincide con `config.php`

---

#### 405 Method Not Allowed

**METHOD_NOT_ALLOWED**
```json
{
  "success": false,
  "error": {
    "code": "METHOD_NOT_ALLOWED",
    "message": "Only POST requests allowed",
    "retryable": false
  }
}
```
**Causa:** Método HTTP incorrecto (GET, PUT, etc.)
**Solución:** Usar `method: 'POST'`

---

### 5xx Server Errors

#### 500 Internal Server Error

**SEND_FAILED**
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
**Causa:** Error SMTP después de 3 reintentos
**Solución:** Verificar credenciales SMTP en `config.php`

---

**CRITICAL_ERROR**
```json
{
  "success": false,
  "error": {
    "code": "CRITICAL_ERROR",
    "message": "Internal server error",
    "retryable": false
  }
}
```
**Causa:** Error PHP crítico (excepción no manejada)
**Solución:** Revisar PHP error_log en cPanel

---

## 6. Ejemplos de Uso

### 📝 Ejemplo 1: cURL (Terminal)

```bash
curl -X POST https://acuariosparadise.com/api/send-email.php \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-10-10T14:30:00Z",
    "branchName": "Los Héroes",
    "cashierName": "Adonay Torres",
    "witnessName": "Tito Gomez",
    "severity": "NORMAL",
    "reportHtml": "<html><body><h1>Test</h1></body></html>",
    "reportPlainText": "Test Reporte"
  }'
```

**Response:**
```json
{
  "success": true,
  "messageId": "1a2b3c4d@acuariosparadise.com",
  "timestamp": "2025-10-10T14:30:15+00:00",
  "recipients": 2
}
```

---

### 📝 Ejemplo 2: JavaScript Fetch API

```javascript
const sendReport = async () => {
  const payload = {
    apiKey: import.meta.env.VITE_EMAIL_API_KEY,
    timestamp: new Date().toISOString(),
    branchName: "Los Héroes",
    cashierName: "Adonay Torres",
    witnessName: "Tito Gomez",
    severity: "CRÍTICO",
    reportHtml: generateHtmlReport(),
    reportPlainText: generatePlainTextReport()
  };

  try {
    const response = await fetch('https://acuariosparadise.com/api/send-email.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Email enviado:', result.messageId);
    } else {
      console.error('❌ Error:', result.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};
```

---

### 📝 Ejemplo 3: TypeScript con Tipos

```typescript
interface SendEmailRequest {
  apiKey: string;
  timestamp: string;
  branchName: string;
  cashierName: string;
  witnessName: string;
  severity: 'CRÍTICO' | 'ADVERTENCIAS' | 'NORMAL';
  reportHtml: string;
  reportPlainText: string;
}

interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
  timestamp: string;
  recipients?: number;
}

const sendEmailReport = async (
  data: Omit<SendEmailRequest, 'apiKey'>
): Promise<SendEmailResponse> => {
  const payload: SendEmailRequest = {
    ...data,
    apiKey: import.meta.env.VITE_EMAIL_API_KEY
  };

  const response = await fetch(
    'https://acuariosparadise.com/api/send-email.php',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );

  return await response.json();
};
```

---

### 📝 Ejemplo 4: Postman Collection

**Request Setup:**
```
Method: POST
URL: https://acuariosparadise.com/api/send-email.php
Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "apiKey": "{{API_KEY}}",
  "timestamp": "{{$isoTimestamp}}",
  "branchName": "Los Héroes",
  "cashierName": "Adonay Torres",
  "witnessName": "Tito Gomez",
  "severity": "NORMAL",
  "reportHtml": "<html><body>Test</body></html>",
  "reportPlainText": "Test"
}

Tests:
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has success=true", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.true;
});

pm.test("Response has messageId", function () {
  var jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property('messageId');
});
```

---

## 7. Rate Limiting

### 🚦 Límites Actuales

**Por IP:**
- ✅ Sin límite estricto implementado (confianza API Key)
- ⚠️ Recomendado: Max 10 emails/minuto por IP

**Por API Key:**
- ✅ Sin límite estricto (uso interno controlado)
- ⚠️ Recomendado: Max 50 emails/hora por key

### Implementación Futura (Opcional)

Si se requiere rate limiting estricto:

**Opción A: Apache mod_ratelimit**
```apache
# .htaccess
<IfModule mod_ratelimit.c>
    SetOutputFilter RATE_LIMIT
    SetEnv rate-limit 400
    SetEnv rate-initial-burst 10
</IfModule>
```

**Opción B: PHP + Redis (Upstash)**
```php
$redis = new Redis();
$key = "ratelimit_{$apiKey}_" . floor(time() / 3600);
$redis->incr($key);
$redis->expire($key, 3600);

if ($redis->get($key) > 50) {
    http_response_code(429);
    echo json_encode(['error' => 'Rate limit exceeded']);
    exit;
}
```

---

## 8. Seguridad

### 🔒 Medidas Implementadas

#### 1. API Key Validation
```php
// send-email.php línea 45
if (!isset($data['apiKey']) || $data['apiKey'] !== API_KEY) {
    http_response_code(401);
    sendResponse(false, ['error' => ['code' => 'UNAUTHORIZED']]);
}
```

#### 2. CORS Restrictivo
```apache
# .htaccess
Header set Access-Control-Allow-Origin "https://acuariosparadise.com"
Header set Access-Control-Allow-Methods "POST"
```

#### 3. Protección config.php
```apache
# .htaccess
<Files "config.php">
    Order Allow,Deny
    Deny from all
</Files>
```

#### 4. Input Validation
```php
// Validar campos requeridos
$required = ['timestamp', 'branchName', 'severity', 'reportHtml', 'reportPlainText'];
foreach ($required as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        sendResponse(false, ['error' => ['code' => 'MISSING_FIELD']]);
    }
}
```

#### 5. Content-Type Enforcement
```php
// Solo aceptar application/json
if ($_SERVER['CONTENT_TYPE'] !== 'application/json') {
    http_response_code(415);
    sendResponse(false, ['error' => ['code' => 'UNSUPPORTED_MEDIA_TYPE']]);
}
```

### 🛡️ Mejores Prácticas

**Para Desarrolladores:**
1. ✅ **Nunca** hardcodear API Key en código frontend
2. ✅ Usar `import.meta.env.VITE_EMAIL_API_KEY`
3. ✅ Rotar API Key cada 90 días
4. ✅ Usar HTTPS obligatorio (sin HTTP)
5. ✅ Validar response antes de procesar

**Para Administradores:**
1. ✅ Mantener `.env` fuera de Git (`.gitignore`)
2. ✅ Password SMTP nunca en frontend
3. ✅ Revisar logs periódicamente (error_log)
4. ✅ Monitorear emails enviados (volumen anormal)
5. ✅ Backup `config.php` en lugar seguro

---

## 📊 Logs y Debugging

### PHP Error Log

**Ubicación:** `/home/usuario/public_html/api/error_log`

**Acceso via cPanel:**
1. cPanel → Metrics → Errors
2. Seleccionar dominio
3. Ver últimas 300 líneas

**Acceso via SSH:**
```bash
tail -f /home/usuario/public_html/api/error_log
```

### Formato Logs

**Envío exitoso:**
```
[10-Oct-2025 14:30:15 UTC] [CashGuard Email] ✅ Email enviado exitosamente (Intento 1)
[10-Oct-2025 14:30:15 UTC] [CashGuard Email]    Recipients: gerencia@..., supervisor@...
[10-Oct-2025 14:30:15 UTC] [CashGuard Email]    Subject: [CRÍTICO] REPORTE CORTE DE CAJA...
```

**Retry logic:**
```
[10-Oct-2025 14:30:15 UTC] [CashGuard Email] ❌ Intento 1/3 falló: SMTP Authentication Failed
[10-Oct-2025 14:30:17 UTC] [CashGuard Email] ❌ Intento 2/3 falló: SMTP Authentication Failed
[10-Oct-2025 14:30:21 UTC] [CashGuard Email] ✅ Email enviado exitosamente (Intento 3)
```

### Debug Mode

**Activar en config.php:**
```php
define('DEBUG_MODE', true);
```

**Logs adicionales:**
```
[DEBUG] Request received from IP: 192.168.1.100
[DEBUG] API Key validation: OK
[DEBUG] Payload size: 15.3 KB
[DEBUG] Recipients count: 2
[DEBUG] SMTP connection: OK
[DEBUG] Email sent: Message-ID abc123@...
```

⚠️ **Desactivar en producción** (DEBUG_MODE = false)

---

## 📞 Soporte

### Reportar Issues

**Información necesaria:**
1. Request completo (cURL command O código)
2. Response recibido (JSON completo)
3. Timestamp del intento
4. Screenshot error_log (últimas 20 líneas)
5. Versión PHP del servidor

**Contacto:**
- Tech Lead: [Email]
- Repository Issues: [GitHub URL]
- Documentación: Este archivo

---

## 🔄 Changelog API

### v1.0 (10 Oct 2025)
- ✅ Versión inicial
- ✅ Autenticación API Key
- ✅ Retry logic 3 intentos
- ✅ Soporte HTML + Plain text
- ✅ Múltiples destinatarios
- ✅ Logging completo

### Próximas Versiones (Planeadas)

**v1.1:**
- [ ] Rate limiting estricto (Redis)
- [ ] Soporte attachments
- [ ] Webhook callbacks
- [ ] Métricas dashboard

**v1.2:**
- [ ] Email templates dinámicos
- [ ] Múltiples idiomas
- [ ] Queue system persistente

---

**🙏 Gloria a Dios por el progreso en este proyecto.**

---

**Última actualización:** 10 de octubre de 2025
**Versión API:** 1.0
**Mantenedor:** Claude (Anthropic) + Equipo Paradise
