# 🔍 Troubleshooting: Site Muestra "Under Construction"

**Fecha:** 11 de Octubre 2025 ~14:30 PM
**Status:** Deployment exitoso PERO site no carga correctamente
**Síntoma:** `https://cashguard.paradisesystemlabs.com` muestra página "Under Construction" de SiteGround

---

## 📊 Diagnóstico Realizado

### ✅ Configuración Correcta Verificada:
- **Workflow file:** `/public_html/cashguard/` (línea 64 en deploy-siteground.yml) ✅
- **SSL Wildcard:** Instalado y activo (`*.paradisesystemlabs.com`) ✅
- **DNS:** Propagado correctamente (cashguard → 34.174.15.163) ✅
- **GitHub Secrets:** 4 secrets configurados correctamente ✅
- **Deployment:** Workflow Run #2 exitoso (39s, all green) ✅

### ❓ Posibles Causas del Problema:

**Causa #1: Carpeta `/public_html/cashguard/` no existe**
- Workflow intenta subir archivos a carpeta que no existe
- FTP-Deploy-Action podría fallar silenciosamente o crear carpeta en ubicación incorrecta
- Resultado: Archivos no llegan al destino, site muestra placeholder de SiteGround

**Causa #2: Subdomain Document Root incorrecta**
- SiteGround configuró subdomain apuntando a `/public_html/` (root)
- Pero workflow sube a `/public_html/cashguard/`
- Resultado: Site busca archivos en root, encuentra placeholder de SiteGround

**Causa #3: Permissions issue**
- Carpeta `cashguard/` existe pero sin permisos de escritura
- Deployment falla silenciosamente
- Resultado: Carpeta vacía o con archivos parciales

---

## 🛠️ Solución Paso a Paso

### Paso 1: Verificar Estructura FTP Actual

**Opción A - Via SiteGround File Manager:**
1. Login a SiteGround → Site Tools
2. File Manager
3. Navegar a `/public_html/`
4. **Verificar:** ¿Existe carpeta `cashguard/`?
   - ✅ SI existe → Abrir carpeta y verificar archivos dentro
   - ❌ NO existe → Crear carpeta manualmente (continuar Paso 2)

**Opción B - Via FTP Client (FileZilla, Cyberduck):**
1. Conectar FTP:
   - Host: `ftp.paradisesystemlabs.com` (o `34.174.15.163`)
   - Username: `samuel.rodriguez@paradisesystemlabs.com`
   - Password: `Rj23$Le23`
   - Port: 21
2. Navegar a `/public_html/`
3. Verificar carpeta `cashguard/`

---

### Paso 2: Verificar Subdomain Document Root

1. Login a SiteGround → Site Tools
2. Domain → **Subdomains**
3. Buscar: `cashguard.paradisesystemlabs.com`
4. Ver columna **"Document Root"**:
   - Si muestra `/public_html/` → **PROBLEMA IDENTIFICADO**
   - Si muestra `/public_html/cashguard/` → Correcto ✅

**Si Document Root es `/public_html/` (incorrecto):**

**Opción A - Cambiar Document Root (RECOMENDADO):**
1. En fila de subdomain, click "⚙️ Settings" o "Edit"
2. Cambiar "Document Root" de `/public_html/` a `/public_html/cashguard/`
3. Save changes
4. Esperar propagación (~5 minutos)

**Opción B - Ajustar Workflow (ALTERNATIVA):**
1. Editar `.github/workflows/deploy-siteground.yml`
2. Cambiar línea 64:
   ```yaml
   server-dir: /public_html/  # Cambiar a root si subdomain apunta ahí
   ```
3. Commit y push
4. Deployment automático se ejecutará

---

### Paso 3: Crear Carpeta Manualmente (Si No Existe)

**Via SiteGround File Manager:**
1. File Manager → `/public_html/`
2. Click "Create Folder"
3. Nombre: `cashguard`
4. Permissions: 755 (rwxr-xr-x)
5. Click "Create"

**Via FTP:**
1. Navegar a `/public_html/`
2. Right-click → Create Directory
3. Nombre: `cashguard`
4. Subir contenido de `/dist` a `/public_html/cashguard/`

---

### Paso 4: Re-ejecutar Deployment

**Método 1 - Trigger Manual (GitHub UI):**
1. Ir a GitHub repository
2. Actions tab
3. Workflow "Deploy to SiteGround"
4. Click "Run workflow" → Run workflow
5. Esperar ~40 segundos
6. Verificar logs: ✅ All green

**Método 2 - Commit Dummy:**
1. Local terminal:
   ```bash
   cd "/Users/samuelers/Paradise System Labs/cashguard-paradise"
   echo "# Test deployment" >> README.md
   git add README.md
   git commit -m "test: re-trigger deployment"
   git push origin main
   ```
2. Workflow se ejecuta automáticamente
3. Monitorear en GitHub Actions

---

### Paso 5: Verificación Final

1. **Esperar 1-2 minutos** después de deployment exitoso
2. **Visitar:** `https://cashguard.paradisesystemlabs.com`
3. **Verificar:**
   - ✅ Site carga CashGuard Paradise app (NO "Under Construction")
   - ✅ SSL activo (candado verde en browser)
   - ✅ Service Worker registrado (DevTools → Application → Service Workers)
   - ✅ Manifest cargado (DevTools → Application → Manifest)

**Si SIGUE mostrando "Under Construction":**
- Limpiar caché browser (Ctrl+Shift+R o Cmd+Shift+R)
- Probar en modo incógnito
- Verificar subdomain document root nuevamente
- Verificar logs deployment en GitHub Actions

---

## 🎯 Solución Rápida (Recomendada)

**Si quieres solución inmediata sin investigar:**

```bash
# 1. Build local
cd "/Users/samuelers/Paradise System Labs/cashguard-paradise"
npm run build

# 2. Verificar archivos generados
ls -la dist/
# Debe mostrar: index.html, manifest.webmanifest, sw.js, .htaccess, etc.

# 3. Upload manual vía FTP a /public_html/cashguard/
# (Usar FileZilla, Cyberduck, o SiteGround File Manager)

# 4. Visitar https://cashguard.paradisesystemlabs.com
# Si carga: Problema era carpeta faltante → deployment automático funcionará ahora
# Si NO carga: Problema es subdomain document root → cambiar en SiteGround
```

---

## 📋 Checklist de Resolución

- [ ] Verificar `/public_html/cashguard/` existe en FTP
- [ ] Verificar subdomain document root apunta a `/public_html/cashguard/`
- [ ] Crear carpeta manualmente si no existe
- [ ] Re-ejecutar deployment (manual o push)
- [ ] Verificar site carga correctamente
- [ ] Limpiar caché browser si sigue mostrando old page
- [ ] Test PWA installation si todo funciona

---

## 🔗 Referencias

- **Workflow:** `.github/workflows/deploy-siteground.yml`
- **Plan PWA:** `Documentos_MarkDown/Planes_de_Desarrollos/Caso_Hacerla_PWA/README.md`
- **CLAUDE.md:** Historial completo del proyecto
- **SiteGround Docs:** https://www.siteground.com/kb/

---

**🙏 ¡Éxito con el troubleshooting!**
