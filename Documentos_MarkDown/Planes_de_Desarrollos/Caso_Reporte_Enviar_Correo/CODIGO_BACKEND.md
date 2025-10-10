# Código Backend PHP - Endpoint de Envío de Correos

**Versión:** v1.0
**Fecha:** 10 Oct 2025
**Autor:** Sistema IA (Claude Code)
**Caso:** Reporte Enviar Correo Automático

---

## 📋 Contenido

Este documento contiene el código completo del backend PHP para el sistema de envío automático de correos. Incluye 4 archivos que deben copiarse exactamente como aparecen en este documento al servidor SiteGround.

**Archivos incluidos:**
1. [`send-email.php`](#1-send-emailphp) - Endpoint principal (220 líneas)
2. [`config.php`](#2-configphp) - Configuración SMTP (30 líneas)
3. [`.htaccess`](#3-htaccess) - Seguridad Apache (25 líneas)
4. [`composer.json`](#4-composerjson) - Dependencias PHPMailer (10 líneas)

**Total código backend:** ~285 líneas

---

## 🏗️ Arquitectura PHP

### Flujo de Datos

```
Frontend TypeScript
    ↓ (POST JSON)
Apache .htaccess (CORS + Security)
    ↓ (validación)
send-email.php
    ↓ (require config.php)
    ↓ (new PHPMailer)
    ↓ (retry logic 3x)
    ↓
SMTP localhost:465 (SiteGround)
    ↓
📧 Email enviado
```

### Componentes

- **Apache**: Servidor web con módulo PHP 8.x
- **PHPMailer 6.x**: Librería SMTP (instalada vía Composer o manual)
- **SMTP localhost**: Puerto 465 (SSL) integrado en SiteGround
- **Authentication**: API Key UUID v4 en payload JSON
- **Retry Logic**: 3 intentos con backoff exponencial (1s, 2s, 4s)

---

## 1. send-email.php

**Ubicación:** `/home/usuario/public_html/api/send-email.php`
**Permisos:** 644 (rw-r--r--)
**Descripción:** Endpoint principal que recibe requests del frontend y envía correos vía PHPMailer.

### Código Completo

```php
<?php
/**
 * CashGuard Paradise - Email Report Sender
 *
 * Endpoint de envío automático de reportes por correo electrónico.
 * Arquitectura: PHP + PHPMailer + SMTP SiteGround
 *
 * @version 1.0
 * @author Sistema IA (Claude Code)
 * @date 10 Oct 2025
 */

// ============================================================================
// CONFIGURACIÓN INICIAL
// ============================================================================

// Headers CORS (ya configurados en .htaccess pero reforzamos en PHP)
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://cashguard-paradise.netlify.app');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'METHOD_NOT_ALLOWED',
        'message' => 'Solo se permiten requests POST'
    ]);
    exit;
}

// Cargar configuración
require_once __DIR__ . '/../config/config.php';

// Verificar que PHPMailer esté disponible
if (!file_exists(__DIR__ . '/../vendor/autoload.php')) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'PHPMAILER_NOT_INSTALLED',
        'message' => 'PHPMailer no está instalado. Ejecuta composer install.'
    ]);
    exit;
}

require __DIR__ . '/../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ============================================================================
// VALIDACIÓN DE REQUEST
// ============================================================================

// Leer payload JSON
$rawInput = file_get_contents('php://input');
$payload = json_decode($rawInput, true);

// Validar JSON válido
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'INVALID_JSON',
        'message' => 'Payload JSON inválido: ' . json_last_error_msg()
    ]);
    exit;
}

// Validar API Key
if (!isset($payload['apiKey']) || $payload['apiKey'] !== API_KEY) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'INVALID_API_KEY',
        'message' => 'API Key inválido o faltante'
    ]);
    exit;
}

// Validar campos requeridos
$requiredFields = [
    'timestamp',
    'branchName',
    'cashierName',
    'witnessName',
    'severity',
    'reportHtml',
    'reportPlainText'
];

$missingFields = [];
foreach ($requiredFields as $field) {
    if (!isset($payload[$field]) || empty($payload[$field])) {
        $missingFields[] = $field;
    }
}

if (!empty($missingFields)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'MISSING_FIELDS',
        'message' => 'Campos faltantes: ' . implode(', ', $missingFields)
    ]);
    exit;
}

// Validar severity
$validSeverities = ['CRÍTICO', 'ADVERTENCIAS', 'NORMAL'];
if (!in_array($payload['severity'], $validSeverities)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'INVALID_SEVERITY',
        'message' => 'Severidad debe ser: CRÍTICO, ADVERTENCIAS o NORMAL'
    ]);
    exit;
}

// Sanitizar inputs (prevenir XSS en asunto/cuerpo)
$timestamp = htmlspecialchars($payload['timestamp'], ENT_QUOTES, 'UTF-8');
$branchName = htmlspecialchars($payload['branchName'], ENT_QUOTES, 'UTF-8');
$cashierName = htmlspecialchars($payload['cashierName'], ENT_QUOTES, 'UTF-8');
$witnessName = htmlspecialchars($payload['witnessName'], ENT_QUOTES, 'UTF-8');
$severity = htmlspecialchars($payload['severity'], ENT_QUOTES, 'UTF-8');
$reportHtml = $payload['reportHtml']; // HTML intencional, no sanitizar
$reportPlainText = $payload['reportPlainText']; // Texto plano, no sanitizar

// ============================================================================
// CONSTRUCCIÓN DE EMAIL
// ============================================================================

// Subject line con severidad
$severityEmoji = match($severity) {
    'CRÍTICO' => '🚨',
    'ADVERTENCIAS' => '⚠️',
    'NORMAL' => '✅',
    default => '📊'
};

$subject = "$severityEmoji Reporte CashGuard - $branchName - $timestamp";

// Body HTML con estilos inline para compatibilidad email clients
$htmlBody = "
<!DOCTYPE html>
<html lang='es'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Reporte CashGuard Paradise</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #0a84ff;
            padding-bottom: 20px;
        }
        .header h1 {
            margin: 0;
            color: #0a84ff;
            font-size: 24px;
        }
        .severity-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 10px;
        }
        .severity-critical { background-color: #ff3b30; color: white; }
        .severity-warning { background-color: #ff9500; color: white; }
        .severity-normal { background-color: #34c759; color: white; }
        .metadata {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .metadata-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .metadata-row:last-child { border-bottom: none; }
        .metadata-label {
            font-weight: bold;
            color: #666;
        }
        .report-content {
            margin-top: 30px;
            padding: 20px;
            background-color: #fafafa;
            border-radius: 6px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #e0e0e0;
            padding-top: 20px;
        }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔐 CashGuard Paradise</h1>
            <span class='severity-badge severity-" . strtolower($severity) . "'>$severityEmoji $severity</span>
        </div>

        <div class='metadata'>
            <div class='metadata-row'>
                <span class='metadata-label'>📅 Fecha/Hora:</span>
                <span>$timestamp</span>
            </div>
            <div class='metadata-row'>
                <span class='metadata-label'>🏪 Sucursal:</span>
                <span>$branchName</span>
            </div>
            <div class='metadata-row'>
                <span class='metadata-label'>👤 Cajero:</span>
                <span>$cashierName</span>
            </div>
            <div class='metadata-row'>
                <span class='metadata-label'>👁️ Testigo:</span>
                <span>$witnessName</span>
            </div>
        </div>

        <div class='report-content'>
            $reportHtml
        </div>

        <div class='footer'>
            <p>🔒 Reporte automático generado por CashGuard Paradise</p>
            <p>⚠️ Este documento es confidencial y no debe ser compartido fuera de la organización.</p>
        </div>
    </div>
</body>
</html>
";

// ============================================================================
// ENVÍO CON RETRY LOGIC
// ============================================================================

$maxAttempts = 3;
$attempt = 0;
$sent = false;
$lastError = '';

while ($attempt < $maxAttempts && !$sent) {
    $attempt++;

    try {
        // Crear instancia PHPMailer
        $mail = new PHPMailer(true);

        // Configuración SMTP
        $mail->isSMTP();
        $mail->Host = SMTP_HOST;
        $mail->SMTPAuth = true;
        $mail->Username = SMTP_USER;
        $mail->Password = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = SMTP_PORT;
        $mail->CharSet = 'UTF-8';

        // Configuración remitente
        $mail->setFrom(SMTP_USER, 'CashGuard Paradise - Reportes Automáticos');
        $mail->addReplyTo(SMTP_USER, 'CashGuard Paradise');

        // Destinatarios (puede ser múltiple)
        foreach (EMAIL_RECIPIENTS as $recipient) {
            $mail->addAddress($recipient);
        }

        // Contenido
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body = $htmlBody;
        $mail->AltBody = $reportPlainText; // Fallback texto plano

        // Enviar
        $mail->send();
        $sent = true;

    } catch (Exception $e) {
        $lastError = $mail->ErrorInfo;

        // Si no es el último intento, esperar antes de reintentar
        if ($attempt < $maxAttempts) {
            $backoffSeconds = pow(2, $attempt - 1); // 1s, 2s, 4s
            sleep($backoffSeconds);
        }
    }
}

// ============================================================================
// RESPUESTA
// ============================================================================

if ($sent) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Email enviado exitosamente',
        'attempts' => $attempt,
        'recipients' => EMAIL_RECIPIENTS
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'SEND_FAILED',
        'message' => 'Fallo después de ' . $maxAttempts . ' intentos',
        'lastError' => $lastError
    ]);
}
?>
```

### Instrucciones de Instalación

1. **Crear archivo** en cPanel File Manager:
   - Ruta: `/home/usuario/public_html/api/send-email.php`
   - Copiar código completo exactamente como aparece arriba
   - Guardar con codificación UTF-8

2. **Establecer permisos**:
   ```bash
   chmod 644 send-email.php
   ```

3. **Validar sintaxis PHP** (vía SSH o cPanel Terminal):
   ```bash
   php -l send-email.php
   ```
   Resultado esperado: `No syntax errors detected`

---

## 2. config.php

**Ubicación:** `/home/usuario/public_html/config/config.php`
**Permisos:** 600 (rw-------)
**Descripción:** Archivo de configuración con credenciales SMTP, API Key y destinatarios. **CRÍTICO: Este archivo NO debe ser accesible vía web.**

### Código Completo

```php
<?php
/**
 * CashGuard Paradise - Configuración SMTP y Seguridad
 *
 * ADVERTENCIA: Este archivo contiene credenciales sensibles.
 * Permisos: 600 (solo lectura por propietario)
 * Ubicación: FUERA de public_html si es posible
 *
 * @version 1.0
 * @author Sistema IA (Claude Code)
 * @date 10 Oct 2025
 */

// ============================================================================
// API SECURITY
// ============================================================================

/**
 * API Key para autenticación de requests
 * Generar con: https://www.uuidgenerator.net/version4
 *
 * IMPORTANTE: Cambiar este valor en producción
 * Copiar el mismo valor al frontend .env como VITE_EMAIL_API_KEY
 */
define('API_KEY', '550e8400-e29b-41d4-a716-446655440000'); // ← CAMBIAR EN PRODUCCIÓN

// ============================================================================
// SMTP CONFIGURATION
// ============================================================================

/**
 * Configuración SMTP de SiteGround
 * Host: localhost (SMTP integrado en servidor)
 * Puerto: 465 (SSL/TLS)
 *
 * Usuario/Contraseña: Configurados en cPanel → Email Accounts
 */
define('SMTP_HOST', 'localhost');
define('SMTP_PORT', 465);
define('SMTP_USER', 'reportes@cashguard-paradise.com'); // ← Email creado en cPanel
define('SMTP_PASS', 'TU_CONTRASEÑA_AQUÍ'); // ← Contraseña de cPanel Email Account

// ============================================================================
// EMAIL RECIPIENTS
// ============================================================================

/**
 * Lista de destinatarios que recibirán reportes automáticos
 * Puede ser un array con múltiples correos
 */
define('EMAIL_RECIPIENTS', [
    'gerencia@acuariosparadise.com',
    'auditoria@acuariosparadise.com'
    // Agregar más correos según necesidad
]);

// ============================================================================
// ENVIRONMENT SETTINGS
// ============================================================================

/**
 * Configuración de entorno
 * production: Logs mínimos, errores silenciados
 * development: Logs verbose para debugging
 */
define('ENVIRONMENT', 'production'); // Cambiar a 'development' para debug

// Configurar error reporting según entorno
if (ENVIRONMENT === 'production') {
    error_reporting(0);
    ini_set('display_errors', '0');
} else {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
}

?>
```

### Instrucciones de Instalación

1. **Crear archivo** en cPanel File Manager:
   - Ruta: `/home/usuario/public_html/config/config.php`
   - **MEJOR:** `/home/usuario/config/config.php` (fuera de public_html)
   - Copiar código completo

2. **MODIFICAR VALORES**:
   - `API_KEY`: Generar UUID v4 nuevo en https://www.uuidgenerator.net/version4
   - `SMTP_USER`: Email creado en cPanel (ej: `reportes@tudominio.com`)
   - `SMTP_PASS`: Contraseña del email (configurada en cPanel)
   - `EMAIL_RECIPIENTS`: Emails de gerencia/auditoría

3. **Establecer permisos restrictivos**:
   ```bash
   chmod 600 config.php
   ```
   **CRÍTICO:** Solo el propietario puede leer/escribir.

4. **Validar sintaxis**:
   ```bash
   php -l config.php
   ```

---

## 3. .htaccess

**Ubicación:** `/home/usuario/public_html/api/.htaccess`
**Permisos:** 644 (rw-r--r--)
**Descripción:** Configuración Apache para seguridad, CORS y protección del directorio `config/`.

### Código Completo

```apache
# ===========================================================================
# CashGuard Paradise - Apache Security & CORS Configuration
# ===========================================================================
# Ubicación: /public_html/api/.htaccess
# Versión: 1.0
# Fecha: 10 Oct 2025
# ===========================================================================

# ---------------------------------------------------------------------------
# CORS CONFIGURATION
# ---------------------------------------------------------------------------
# Permitir requests solo desde el dominio de producción de Netlify

<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "https://cashguard-paradise.netlify.app"
    Header set Access-Control-Allow-Methods "POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type"
    Header set Access-Control-Max-Age "86400"
</IfModule>

# ---------------------------------------------------------------------------
# SECURITY: Bloquear acceso directo a config/
# ---------------------------------------------------------------------------
# Prevenir acceso web a archivos de configuración

<FilesMatch "^(config\.php)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# Bloquear acceso a directorio config si existe en public_html
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^config/ - [F,L]
</IfModule>

# ---------------------------------------------------------------------------
# SECURITY: Proteger archivos sensibles
# ---------------------------------------------------------------------------

# Bloquear archivos .git, .env, composer
<FilesMatch "\.(git|env|json|lock)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# ---------------------------------------------------------------------------
# PHP SETTINGS
# ---------------------------------------------------------------------------

# Límites de payload (prevenir ataques DoS)
<IfModule mod_php.c>
    php_value post_max_size 2M
    php_value upload_max_filesize 2M
    php_value max_execution_time 30
    php_value max_input_time 30
</IfModule>

# ---------------------------------------------------------------------------
# ERROR PAGES
# ---------------------------------------------------------------------------

# Página 404 personalizada (opcional)
# ErrorDocument 404 /404.html

# Página 500 personalizada (opcional)
# ErrorDocument 500 /500.html
```

### Instrucciones de Instalación

1. **Crear archivo** en cPanel File Manager:
   - Ruta: `/home/usuario/public_html/api/.htaccess`
   - Copiar código completo exactamente

2. **Validar módulos Apache** (vía SSH o soporte SiteGround):
   ```bash
   apache2ctl -M | grep -E '(headers|rewrite)'
   ```
   Resultado esperado:
   ```
   headers_module (shared)
   rewrite_module (shared)
   ```

3. **Establecer permisos**:
   ```bash
   chmod 644 .htaccess
   ```

4. **Validar sintaxis Apache**:
   - Intenta acceder a `https://tudominio.com/api/config.php`
   - Resultado esperado: **403 Forbidden** (bloqueado correctamente)

---

## 4. composer.json

**Ubicación:** `/home/usuario/public_html/composer.json`
**Permisos:** 644 (rw-r--r--)
**Descripción:** Archivo de dependencias para instalar PHPMailer vía Composer.

### Código Completo

```json
{
    "name": "cashguard-paradise/email-sender",
    "description": "Backend PHP para envío automático de reportes por correo",
    "type": "project",
    "require": {
        "php": ">=8.0",
        "phpmailer/phpmailer": "^6.9"
    },
    "autoload": {
        "psr-4": {
            "CashGuard\\": "src/"
        }
    }
}
```

### Instrucciones de Instalación

1. **Crear archivo** en cPanel File Manager:
   - Ruta: `/home/usuario/public_html/composer.json`
   - Copiar código completo

2. **Instalar dependencias** (vía SSH o cPanel Terminal):
   ```bash
   cd /home/usuario/public_html
   composer install
   ```

3. **Validar instalación**:
   ```bash
   ls -la vendor/phpmailer/phpmailer
   ```
   Resultado esperado: Directorio con archivos de PHPMailer.

4. **Si Composer NO está disponible** (instalación manual PHPMailer):
   - Descargar: https://github.com/PHPMailer/PHPMailer/releases/latest
   - Extraer en `/home/usuario/public_html/vendor/phpmailer/phpmailer`
   - Crear archivo `autoload.php` manualmente (ver sección siguiente)

---

## 📦 Instalación Manual PHPMailer (Sin Composer)

Si SiteGround no tiene Composer disponible, seguir estos pasos:

### Paso 1: Descargar PHPMailer

```bash
cd /home/usuario/public_html
mkdir -p vendor/phpmailer/phpmailer
cd vendor/phpmailer/phpmailer
wget https://github.com/PHPMailer/PHPMailer/archive/refs/tags/v6.9.1.zip
unzip v6.9.1.zip
mv PHPMailer-6.9.1/* .
rm -rf PHPMailer-6.9.1 v6.9.1.zip
```

### Paso 2: Crear autoload.php Manual

**Ubicación:** `/home/usuario/public_html/vendor/autoload.php`

```php
<?php
// Autoload manual para PHPMailer

spl_autoload_register(function ($class) {
    $prefix = 'PHPMailer\\PHPMailer\\';
    $base_dir = __DIR__ . '/phpmailer/phpmailer/src/';

    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    $relative_class = substr($class, $len);
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});
?>
```

### Paso 3: Validar Instalación Manual

```bash
php -r "require 'vendor/autoload.php'; use PHPMailer\PHPMailer\PHPMailer; echo 'PHPMailer OK';"
```

Resultado esperado: `PHPMailer OK`

---

## ✅ Checklist de Validación Backend

Después de instalar los 4 archivos, validar:

- [ ] `send-email.php` existe en `/public_html/api/` con permisos 644
- [ ] `config.php` existe en `/public_html/config/` con permisos 600
- [ ] `.htaccess` existe en `/public_html/api/` con permisos 644
- [ ] `composer.json` existe en `/public_html/` y PHPMailer instalado
- [ ] `vendor/autoload.php` existe y carga PHPMailer correctamente
- [ ] Sintaxis PHP validada sin errores (php -l)
- [ ] Acceso a `config.php` vía web bloqueado (403 Forbidden)
- [ ] API Key modificado en `config.php` (no usar el de ejemplo)
- [ ] SMTP_USER y SMTP_PASS configurados en `config.php`
- [ ] EMAIL_RECIPIENTS configurados con emails de gerencia

---

## 🐛 Troubleshooting Backend

### Error: "PHPMAILER_NOT_INSTALLED"

**Síntoma:** Response 500 con mensaje "PHPMailer no está instalado"

**Solución:**
```bash
cd /home/usuario/public_html
composer install
# O seguir instalación manual arriba
```

### Error: "INVALID_API_KEY"

**Síntoma:** Response 401 con mensaje "API Key inválido o faltante"

**Causa:** API Key en frontend .env no coincide con config.php

**Solución:**
1. Verificar `config.php` línea 21: `define('API_KEY', '...')`
2. Verificar frontend `.env`: `VITE_EMAIL_API_KEY=...`
3. Ambos valores deben ser IDÉNTICOS

### Error: "SMTP connect() failed"

**Síntoma:** Response 500 con `lastError: "SMTP connect() failed"`

**Causa:** Credenciales SMTP incorrectas o puerto bloqueado

**Solución:**
1. Verificar email creado en cPanel → Email Accounts
2. Verificar contraseña correcta en `config.php`
3. Validar puerto 465 abierto (soporte SiteGround)
4. Testear SMTP vía cPanel → Email Accounts → Check Email

### Error: "Class 'PHPMailer' not found"

**Síntoma:** Fatal error PHP

**Causa:** Autoload no funciona correctamente

**Solución:**
```bash
cd /home/usuario/public_html
composer dump-autoload
# O verificar vendor/autoload.php existe
```

---

## 📞 Contacto y Soporte

**SiteGround Support:**
- Live Chat: https://my.siteground.com/support/chat
- Phone: Según región (ver cPanel)
- Tickets: https://my.siteground.com/support/tickets

**Documentación PHPMailer:**
- GitHub: https://github.com/PHPMailer/PHPMailer
- Docs: https://github.com/PHPMailer/PHPMailer/wiki

---

## 📝 Próximos Pasos

Después de instalar el backend:

1. ✅ Continuar con `CODIGO_FRONTEND.md` (TypeScript utilities)
2. ✅ Validar integración con `TESTING_GUIDE.md` (Phase 1-2)
3. ✅ Deployment a producción cuando ambos lados funcionen

---

**Fin del documento `CODIGO_BACKEND.md`**
