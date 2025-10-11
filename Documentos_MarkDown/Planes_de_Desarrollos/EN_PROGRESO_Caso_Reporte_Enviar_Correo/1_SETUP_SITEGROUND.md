# 🛠️ Guía de Setup: SiteGround Email System

**Versión:** 1.0
**Fecha:** 10 de octubre de 2025
**Tiempo estimado:** 15-20 minutos
**Nivel:** Básico (no requiere conocimientos técnicos avanzados)

---

## 📋 Índice

1. [Pre-requisitos](#1-pre-requisitos)
2. [Paso 1: Crear Email Account en cPanel](#paso-1-crear-email-account-en-cpanel)
3. [Paso 2: Subir Archivos PHP al Servidor](#paso-2-subir-archivos-php-al-servidor)
4. [Paso 3: Instalar PHPMailer](#paso-3-instalar-phpmailer)
5. [Paso 4: Configurar Variables](#paso-4-configurar-variables)
6. [Paso 5: Configurar Frontend](#paso-5-configurar-frontend)
7. [Paso 6: Validación Final](#paso-6-validación-final)
8. [Troubleshooting](#troubleshooting)

---

## 1. Pre-requisitos

### ✅ Checklist Antes de Comenzar

- [ ] Acceso a cPanel SiteGround (usuario + password)
- [ ] Dominio activo configurado (ej: `acuariosparadise.com`)
- [ ] Archivos PHP descargados (carpeta `archivos-backend/`)
- [ ] Editor de texto (Notepad++, VS Code, o cualquiera)
- [ ] 15-20 minutos disponibles

### 📦 Archivos Requeridos

```
Caso_Reporte_Enviar_Correo/archivos-backend/
├── send-email.php          # Endpoint principal
├── config.php              # Configuración SMTP
├── .htaccess               # Seguridad
└── composer.json           # Dependencias PHPMailer
```

---

## Paso 1: Crear Email Account en cPanel

### 🎯 Objetivo
Crear una cuenta de email dedicada para envío de reportes: `reports@tudominio.com`

### 📸 Instrucciones Paso a Paso

#### **1.1 - Login cPanel**

1. Abrir navegador
2. Ir a: `https://tudominio.com/cpanel`
   (O desde SiteGround → Site Tools → Email)
3. Ingresar credenciales cPanel
4. Click "Login"

![cPanel Login](https://docs.siteground.com/images/cpanel-login.png)

---

#### **1.2 - Navegar a Email Accounts**

1. En cPanel dashboard, buscar sección **"Email"**
2. Click en **"Email Accounts"**
3. Se abrirá página de gestión de cuentas

![Email Accounts](https://docs.siteground.com/images/email-accounts-icon.png)

---

#### **1.3 - Crear Nueva Cuenta**

1. Click botón **"+ Create"** (esquina superior derecha)
2. Llenar formulario:

   **Username:**
   ```
   reports
   ```

   **Domain:** (seleccionar de dropdown)
   ```
   @tudominio.com
   ```

   **Password:** (click "Generate")
   ```
   [Copiar password generado - IMPORTANTE: Guardar en lugar seguro]
   ```

   **Mailbox Quota:**
   ```
   500 MB
   ```

3. Click **"+ Create"** (botón azul abajo)

![Create Email Account Form](https://docs.siteground.com/images/create-email-form.png)

---

#### **1.4 - Verificar Creación Exitosa**

✅ Mensaje de confirmación debe aparecer:
```
Success: Email account "reports@tudominio.com" created successfully
```

✅ Anotar estos datos (los necesitarás en Paso 4):
```
Email: reports@tudominio.com
Password: [el generado en paso 1.3]
SMTP Host: localhost
SMTP Port: 587
```

---

## Paso 2: Subir Archivos PHP al Servidor

### 🎯 Objetivo
Copiar los 4 archivos PHP a la carpeta `public_html/api/` del servidor

### 📁 Método A: File Manager cPanel (Recomendado - No requiere FTP)

#### **2.1 - Abrir File Manager**

1. Desde cPanel, buscar sección **"Files"**
2. Click en **"File Manager"**
3. Se abrirá en nueva pestaña

![File Manager Icon](https://docs.siteground.com/images/file-manager-icon.png)

---

#### **2.2 - Navegar a public_html**

1. En panel izquierdo, click carpeta **"public_html"**
2. Panel derecho mostrará contenido de public_html

![File Manager public_html](https://docs.siteground.com/images/file-manager-public-html.png)

---

#### **2.3 - Crear Carpeta api**

1. Click botón **"+ Folder"** (barra superior)
2. Nombre de carpeta:
   ```
   api
   ```
3. Click **"Create New Folder"**
4. Carpeta `api/` aparecerá en listado

![Create Folder](https://docs.siteground.com/images/create-folder-dialog.png)

---

#### **2.4 - Subir Archivos PHP**

1. **Doble click** en carpeta `api/` para entrar
2. Click botón **"Upload"** (barra superior)
3. Se abrirá ventana upload
4. Click **"Select File"** y seleccionar:
   - `send-email.php`
   - `config.php`
   - `.htaccess`
   - `composer.json`
5. O arrastrar los 4 archivos directamente a la ventana
6. Esperar barra progreso 100%
7. Click **"Close"** cuando termine

![Upload Files](https://docs.siteground.com/images/file-upload-dialog.png)

---

#### **2.5 - Verificar Archivos Subidos**

✅ Deberías ver en `public_html/api/`:
```
api/
├── .htaccess
├── composer.json
├── config.php
└── send-email.php
```

✅ **IMPORTANTE:** Verificar que `.htaccess` sea visible (puede estar oculto)
- Si no lo ves: Click "Settings" (esquina superior derecha) → Marcar "Show Hidden Files (dotfiles)"

---

### 📁 Método B: FTP con FileZilla (Alternativo)

<details>
<summary>Click para expandir instrucciones FTP</summary>

#### **2.6 - Configurar FileZilla**

1. Abrir FileZilla
2. Menú: File → Site Manager
3. Click "New Site"
4. Configurar:
   ```
   Host: ftp.tudominio.com
   Port: 21
   Protocol: FTP
   Encryption: Explicit FTP over TLS
   Logon Type: Normal
   User: [tu-usuario-ftp]
   Password: [tu-password-ftp]
   ```
5. Click "Connect"

#### **2.7 - Subir Archivos vía FTP**

1. Panel derecho (servidor): Navegar a `/public_html/`
2. Click derecho → Create directory → Nombre: `api`
3. Doble click en `api/` para entrar
4. Panel izquierdo (local): Navegar a carpeta `archivos-backend/`
5. Seleccionar los 4 archivos
6. Arrastrar de panel izquierdo a panel derecho
7. Esperar transferencia completa

</details>

---

## Paso 3: Instalar PHPMailer

### 🎯 Objetivo
Instalar librería PHPMailer necesaria para envío de emails

### 📦 Método A: Composer via SSH (Recomendado si tienes acceso SSH)

#### **3.1 - Conectar por SSH**

```bash
# Desde terminal/PowerShell
ssh usuario@tudominio.com
# Ingresar password cuando solicite
```

#### **3.2 - Navegar a carpeta api**

```bash
cd public_html/api
pwd
# Output: /home/usuario/public_html/api
```

#### **3.3 - Instalar PHPMailer con Composer**

```bash
composer require phpmailer/phpmailer

# Output esperado:
# Installing phpmailer/phpmailer (v6.9.1)
# - Downloading phpmailer/phpmailer
# - Installing phpmailer/phpmailer
# Generated autoload files
```

#### **3.4 - Verificar Instalación**

```bash
ls -la
# Deberías ver:
# vendor/
# vendor/autoload.php
# vendor/phpmailer/
```

---

### 📦 Método B: Manual Download (Si NO tienes SSH)

#### **3.5 - Descargar PHPMailer**

1. Ir a: https://github.com/PHPMailer/PHPMailer/releases
2. Descargar última versión: `PHPMailer-6.9.1.zip`
3. Extraer ZIP en tu computadora

#### **3.6 - Subir vía File Manager**

1. En File Manager, navegar a `public_html/api/`
2. Crear carpeta: `vendor/`
3. Entrar en `vendor/`
4. Crear carpeta: `phpmailer/`
5. Entrar en `phpmailer/`
6. Crear carpeta: `phpmailer/`
7. Subir todos los archivos extraídos del ZIP a `vendor/phpmailer/phpmailer/`

#### **3.7 - Crear autoload.php Manual**

1. En `public_html/api/vendor/`, crear archivo: `autoload.php`
2. Contenido:
   ```php
   <?php
   require_once __DIR__ . '/phpmailer/phpmailer/src/PHPMailer.php';
   require_once __DIR__ . '/phpmailer/phpmailer/src/SMTP.php';
   require_once __DIR__ . '/phpmailer/phpmailer/src/Exception.php';
   ?>
   ```
3. Guardar archivo

---

## Paso 4: Configurar Variables

### 🎯 Objetivo
Editar `config.php` con tus credenciales reales

### 📝 Paso 4.1 - Generar API Key (UUID)

**Opción A: Terminal Linux/Mac**
```bash
uuidgen
# Output: 550e8400-e29b-41d4-a716-446655440000
```

**Opción B: Terminal Windows PowerShell**
```powershell
[guid]::NewGuid().ToString()
# Output: 550e8400-e29b-41d4-a716-446655440000
```

**Opción C: Sitio Web**
1. Ir a: https://www.uuidgenerator.net/
2. Click "Generate UUID"
3. Copiar UUID generado

✅ **Copiar y guardar este UUID** (lo usarás 2 veces)

---

### 📝 Paso 4.2 - Editar config.php

#### **Via File Manager cPanel:**

1. En File Manager, navegar a `public_html/api/`
2. Click derecho en `config.php`
3. Seleccionar **"Edit"**
4. Click **"Edit"** en diálogo confirmación
5. Se abrirá editor de texto

#### **Editar las siguientes líneas:**

**Línea 7 - SMTP_USERNAME:**
```php
// ANTES:
define('SMTP_USERNAME', 'reports@tudominio.com');

// DESPUÉS (reemplazar con tu email):
define('SMTP_USERNAME', 'reports@acuariosparadise.com');
```

**Línea 8 - SMTP_PASSWORD:**
```php
// ANTES:
define('SMTP_PASSWORD', 'password-generado-cpanel');

// DESPUÉS (usar password del Paso 1.3):
define('SMTP_PASSWORD', 'aB3$xY9#mK2&pL7!');
```

**Línea 9 - SMTP_FROM_EMAIL:**
```php
// ANTES:
define('SMTP_FROM_EMAIL', 'reports@tudominio.com');

// DESPUÉS:
define('SMTP_FROM_EMAIL', 'reports@acuariosparadise.com');
```

**Línea 13 - EMAIL_RECIPIENTS:**
```php
// ANTES:
define('EMAIL_RECIPIENTS', 'gerencia@acuariosparadise.com,supervisor@acuariosparadise.com');

// DESPUÉS (ajustar emails reales):
define('EMAIL_RECIPIENTS', 'gerencia@acuariosparadise.com,samuel@acuariosparadise.com');
```

**Línea 16 - API_KEY:**
```php
// ANTES:
define('API_KEY', '550e8400-e29b-41d4-a716-446655440000');

// DESPUÉS (usar UUID generado en Paso 4.1):
define('API_KEY', '750f9511-f30c-52e5-b827-557766551111');
```

**Línea 19 - DEBUG_MODE:**
```php
// Dejar en false para producción
define('DEBUG_MODE', false);

// Cambiar a true SOLO para testing inicial:
define('DEBUG_MODE', true);
```

6. Click **"Save Changes"** (esquina superior derecha)
7. Click **"Close"** para salir del editor

---

### 📝 Paso 4.3 - Verificar Permisos Archivos

1. En File Manager, seleccionar `config.php`
2. Click derecho → **"Permissions"**
3. Verificar:
   ```
   Owner: Read, Write (rw-)
   Group: Read (r--)
   World: --- (ninguno)
   ```
4. Valor numérico debe ser: **640**
5. Click **"Change Permissions"**

Repetir para todos los archivos:
- `send-email.php` → 644
- `.htaccess` → 644
- `composer.json` → 644

---

## Paso 5: Configurar Frontend

### 🎯 Objetivo
Configurar archivo `.env` del proyecto CashGuard con API Key

### 📝 Paso 5.1 - Editar .env

1. Abrir proyecto CashGuard en editor (VS Code)
2. Abrir archivo: `.env` (raíz del proyecto)
3. Agregar al final:

```bash
# Email System Configuration
VITE_EMAIL_API_KEY=750f9511-f30c-52e5-b827-557766551111
VITE_EMAIL_API_URL=https://acuariosparadise.com/api/send-email.php
```

⚠️ **IMPORTANTE:** UUID debe ser **exactamente el mismo** que config.php (Paso 4.2 línea 16)

4. Guardar archivo `.env`

---

### 📝 Paso 5.2 - Verificar .env en .gitignore

1. Abrir archivo: `.gitignore`
2. Verificar que contenga:
   ```
   .env
   .env.local
   .env.production
   ```
3. Si NO está, agregarlo (previene subir API key a GitHub)

---

## Paso 6: Validación Final

### 🎯 Objetivo
Verificar que todo esté configurado correctamente antes de testing

### ✅ Checklist Final

#### **Backend SiteGround:**
- [ ] Email account `reports@tudominio.com` creado
- [ ] Carpeta `/public_html/api/` existe
- [ ] 4 archivos PHP subidos (send-email.php, config.php, .htaccess, composer.json)
- [ ] PHPMailer instalado (`vendor/` folder presente)
- [ ] config.php editado con valores reales:
  - [ ] SMTP_USERNAME (email creado)
  - [ ] SMTP_PASSWORD (password Paso 1.3)
  - [ ] EMAIL_RECIPIENTS (emails reales)
  - [ ] API_KEY (UUID generado)
- [ ] Permisos archivos correctos (644/640)

#### **Frontend CashGuard:**
- [ ] `.env` contiene `VITE_EMAIL_API_KEY`
- [ ] `.env` contiene `VITE_EMAIL_API_URL`
- [ ] API Key coincide con config.php
- [ ] `.env` en `.gitignore`

#### **Testing Básico:**
- [ ] URL accesible: `https://tudominio.com/api/send-email.php`
- [ ] NO debe mostrar código PHP (debe retornar JSON)
- [ ] config.php NO accesible: `https://tudominio.com/api/config.php` → 403 Forbidden

---

### 🧪 Test Rápido con Browser

1. Abrir navegador
2. Ir a: `https://tudominio.com/api/send-email.php`
3. **Resultado esperado:**
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

✅ Si ves este JSON → **Backend configurado correctamente**
❌ Si ves código PHP → **PHPMailer no instalado o error config**
❌ Si ves 404 → **Archivos no subidos correctamente**

---

## Troubleshooting

### ❌ Error: "SMTP Authentication Failed"

**Síntoma:**
```
[Email] ❌ Intento 1/3 falló: SMTP Authentication Failed
```

**Soluciones:**

1. **Verificar password en config.php:**
   - Debe ser EXACTAMENTE el generado en cPanel (Paso 1.3)
   - Sin espacios extras al inicio/fin
   - Mayúsculas/minúsculas importan

2. **Verificar username completo:**
   ```php
   // ✅ CORRECTO:
   define('SMTP_USERNAME', 'reports@acuariosparadise.com');

   // ❌ INCORRECTO:
   define('SMTP_USERNAME', 'reports');
   ```

3. **Resetear password email:**
   - cPanel → Email Accounts
   - Click "Manage" en cuenta reports@
   - Sección "Security" → Click "Set Password"
   - Generar nuevo password
   - Actualizar config.php con nuevo password

---

### ❌ Error: "Undefined function: PHPMailer\PHPMailer"

**Síntoma:**
```
Fatal error: Class 'PHPMailer\PHPMailer\PHPMailer' not found
```

**Soluciones:**

1. **Verificar vendor/ exists:**
   ```bash
   # Via SSH:
   ls -la /home/usuario/public_html/api/vendor/

   # Debe existir: autoload.php
   ```

2. **Re-instalar PHPMailer:**
   ```bash
   cd public_html/api
   rm -rf vendor/
   composer require phpmailer/phpmailer
   ```

3. **Verificar autoload en send-email.php:**
   ```php
   // Línea 5 debe ser:
   require_once 'vendor/autoload.php';
   ```

---

### ❌ Error: "Access Denied" al editar config.php

**Síntoma:**
```
403 Forbidden - You don't have permission to access config.php
```

**Soluciones:**

1. **.htaccess bloqueando acceso (esperado):**
   - NO puedes acceder via browser: `https://tudominio.com/api/config.php`
   - Esto es CORRECTO (seguridad)

2. **Para editar via File Manager:**
   - File Manager → Navegar a `api/`
   - Click derecho `config.php` → Edit
   - Si aún falla: Temporalmente renombrar `.htaccess` a `htaccess_temp`
   - Editar config.php
   - Restaurar nombre `.htaccess`

---

### ❌ Error: "CORS Policy Blocked"

**Síntoma:**
```
Access to fetch at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Soluciones:**

1. **Verificar .htaccess línea CORS:**
   ```apache
   # Debe contener (ajustar dominio real):
   Header set Access-Control-Allow-Origin "https://acuariosparadise.com"
   ```

2. **Si CashGuard en localhost (desarrollo):**
   ```apache
   # Temporalmente cambiar a:
   Header set Access-Control-Allow-Origin "*"

   # ⚠️ REVERTIR en producción a dominio específico
   ```

3. **Verificar mod_headers activo:**
   - cPanel → Software → Select PHP Version
   - Verificar extensión "headers" enabled

---

### ❌ Error: "Invalid JSON payload"

**Síntoma:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_JSON",
    "message": "Invalid JSON payload"
  }
}
```

**Soluciones:**

1. **Verificar Content-Type header:**
   ```typescript
   // Frontend debe enviar:
   headers: {
     'Content-Type': 'application/json'
   }
   ```

2. **Verificar JSON válido:**
   ```typescript
   // Body debe ser string JSON:
   body: JSON.stringify(payload)

   // NO enviar objeto directo:
   // body: payload ❌
   ```

3. **Test con cURL:**
   ```bash
   curl -X POST https://tudominio.com/api/send-email.php \
     -H "Content-Type: application/json" \
     -d '{"apiKey":"750f9511-...","timestamp":"2025-10-10T14:30:00Z"}'
   ```

---

### 📞 Soporte Adicional

**Si problemas persisten:**

1. **Habilitar DEBUG_MODE:**
   ```php
   // config.php línea 19:
   define('DEBUG_MODE', true);
   ```

2. **Revisar error_log:**
   - cPanel → Metrics → Errors
   - O vía SSH:
     ```bash
     tail -f /home/usuario/public_html/api/error_log
     ```

3. **Contactar soporte SiteGround:**
   - SiteGround 24/7 Chat Support
   - Mencionar: "PHP script email setup issue"
   - Proveer URL: `tudominio.com/api/send-email.php`

---

## 🎉 Setup Completado

Si llegaste hasta aquí y todos los checkboxes están ✅:

**¡FELICITACIONES! Sistema configurado exitosamente.**

**Próximo paso:** [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Ejecutar suite de tests completa

---

**🙏 Gloria a Dios por el progreso en este proyecto.**

---

**Última actualización:** 10 de octubre de 2025
**Versión:** 1.0
**Tiempo total setup:** 15-20 minutos
