# 🚀 CashGuard Paradise - Instrucciones de Despliegue

**Build Generado:** 30 de Septiembre, 2025 - 22:39
**Versión PWA:** v1.0.3
**Tamaño Total:** 3.0 MB

---

## ✅ Estado Actual

Su aplicación está **lista para desplegar**. El build de producción se ha generado exitosamente en la carpeta `dist/`.

### Archivos Generados:
- ✅ `index.html` - Punto de entrada (4.21 KB)
- ✅ `sw.js` - Service Worker (3.7 KB)
- ✅ `manifest.webmanifest` - PWA Manifest (1.75 KB)
- ✅ `workbox-5ffe50d4.js` - Workbox runtime (15 KB)
- ✅ `assets/index-DJvQqL9S.css` - Estilos (250 KB)
- ✅ `assets/index-BFvOS14W.js` - JavaScript bundle (1.4 MB)
- ✅ 13 iconos PNG (48x48 hasta 512x512)
- ✅ 41 archivos pre-cacheados (2.7 MB total)

---

## 📋 Opciones de Despliegue

### OPCIÓN 1: SiteGround (Recomendado según su roadmap)

#### A. Usando FileZilla (Cliente FTP)

1. **Descargar e instalar FileZilla:**
   - Visitar: https://filezilla-project.org/
   - Descargar versión para Mac
   - Instalar y abrir

2. **Conectar a SiteGround:**
   ```
   Host: ftp.su-dominio.com (o IP del servidor)
   Usuario: su-usuario-ftp
   Contraseña: su-contraseña-ftp
   Puerto: 21
   ```
   *Nota: Obtener credenciales desde SiteGround Site Tools → FTP Accounts*

3. **Preparar el servidor:**
   - En FileZilla, panel derecho (servidor)
   - Navegar a: `/public_html/`
   - **IMPORTANTE:** Hacer backup de archivos existentes
   - Eliminar contenido antiguo (opcional pero recomendado)

4. **Subir archivos:**
   - En FileZilla, panel izquierdo (local)
   - Navegar a: `/Users/samuelers/Paradise System Labs/cashguard-paradise/dist/`
   - Seleccionar **TODO el contenido** dentro de `dist/` (NO la carpeta dist en sí)
   - Arrastrar y soltar al panel derecho dentro de `public_html/`
   - Esperar a que termine la transferencia (3 MB aprox.)

5. **Verificar estructura en servidor:**
   ```
   public_html/
   ├── index.html
   ├── sw.js
   ├── manifest.webmanifest
   ├── workbox-5ffe50d4.js
   ├── assets/
   │   ├── index-DJvQqL9S.css
   │   └── index-BFvOS14W.js
   └── icons/
       └── (13 archivos PNG)
   ```

#### B. Usando File Manager de SiteGround

1. **Acceder a Site Tools:**
   - Ir a: https://my.siteground.com/
   - Seleccionar su hosting
   - Clic en "Site Tools"

2. **Abrir File Manager:**
   - Site Tools → Site → File Manager
   - Navegar a: `public_html/`

3. **Subir archivos:**
   - Clic en "Upload Files"
   - Seleccionar todos los archivos de: `/Users/samuelers/Paradise System Labs/cashguard-paradise/dist/`
   - **IMPORTANTE:** Subir archivos individuales, NO la carpeta dist completa
   - Esperar a que termine la carga

4. **Alternativa - Subir ZIP:**
   - Comprimir contenido de `dist/` en un archivo ZIP
   - Subir el ZIP a `public_html/`
   - Clic derecho → "Extract"
   - Eliminar el archivo ZIP después de extraer

---

### OPCIÓN 2: Docker Production (Servidor VPS/Local)

Si tiene un servidor VPS o quiere probar localmente:

```bash
# 1. Navegar al directorio del proyecto
cd "/Users/samuelers/Paradise System Labs/cashguard-paradise"

# 2. Construir y ejecutar en modo producción
docker-compose --profile prod up -d

# 3. Verificar que esté corriendo
docker ps

# 4. Acceder en navegador
open http://localhost:8080
```

Para detener:
```bash
docker-compose --profile prod down
```

---

### OPCIÓN 3: Netlify (Despliegue Automático - Gratis)

**Ventajas:** Deployment automático, SSL gratis, CDN global, CI/CD integrado

1. **Preparar repositorio Git:**
   ```bash
   # Si no tiene Git inicializado
   git init
   git add .
   git commit -m "Initial deployment"
   
   # Subir a GitHub
   git remote add origin https://github.com/SU-USUARIO/cashguard-paradise.git
   git push -u origin main
   ```

2. **Conectar con Netlify:**
   - Ir a: https://app.netlify.com/
   - Clic en "Add new site" → "Import an existing project"
   - Seleccionar GitHub y autorizar
   - Elegir repositorio `cashguard-paradise`

3. **Configurar build:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Clic en "Deploy site"

4. **Agregar variables de entorno:**
   - Site settings → Environment variables → "Add a variable"
   - Agregar:
     - `VITE_SUPABASE_URL`: [su URL de Supabase]
     - `VITE_SUPABASE_ANON_KEY`: [su clave anónima]

5. **Redeploy:**
   - Deploys → Trigger deploy → "Deploy site"

**URL de producción:** `https://su-sitio.netlify.app`

---

### OPCIÓN 4: Vercel (Alternativa a Netlify)

Similar a Netlify, completamente gratis para proyectos personales:

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   cd "/Users/samuelers/Paradise System Labs/cashguard-paradise"
   vercel
   ```

3. **Seguir wizard interactivo:**
   - Link to existing project? `N`
   - Project name: `cashguard-paradise`
   - Directory: `./` (presionar Enter)
   - Override settings? `N`

4. **Agregar variables de entorno:**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

5. **Redeploy con variables:**
   ```bash
   vercel --prod
   ```

---

## 🔍 Verificación Post-Despliegue

Después de desplegar, verificar que todo funcione:

### 1. Verificación Básica
- [ ] Sitio carga correctamente
- [ ] No hay errores en consola (F12 → Console)
- [ ] Todas las rutas funcionan
- [ ] Imágenes e íconos cargan correctamente

### 2. Verificación PWA
- [ ] Abrir DevTools (F12) → Application
- [ ] **Manifest:** Verificar "Paradise Cash Control" aparece
- [ ] **Service Worker:** Estado debe ser "activated and is running"
- [ ] **Storage:** Cache Storage debe mostrar archivos cacheados
- [ ] **Icons:** 13 iconos deben aparecer en manifest

### 3. Lighthouse Audit
- [ ] DevTools (F12) → Lighthouse
- [ ] Seleccionar: Progressive Web App + Performance
- [ ] Clic "Analyze page load"
- [ ] **Objetivo:** Puntuación PWA > 90/100

### 4. Prueba de Instalación
- [ ] **Desktop Chrome:** Ícono "instalar" debe aparecer en barra URL
- [ ] **Android:** "Añadir a pantalla inicio" disponible
- [ ] **iOS Safari:** Compartir → "Añadir a pantalla de inicio"

### 5. Prueba Offline
- [ ] DevTools → Network → "Offline"
- [ ] Recargar página
- [ ] App debe funcionar sin conexión
- [ ] Datos en localStorage deben persistir

---

## 🆘 Solución de Problemas

### Service Worker no se registra
```javascript
// Verificar en consola
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers registrados:', registrations);
});

// Si no hay registros, hacer hard refresh:
// Mac: Cmd + Shift + R
// Windows/Linux: Ctrl + Shift + R
```

### Errores de CORS con Supabase
Verificar que las variables de entorno estén correctamente configuradas:
- SiteGround: No necesita configuración (build-time variables)
- Netlify/Vercel: Agregar en dashboard → Settings → Environment variables

### App no se actualiza después de cambios
```bash
# 1. Generar nuevo build
npm run build

# 2. Subir archivos nuevamente al servidor

# 3. En navegador: Hard refresh
# Mac: Cmd + Shift + R
# Windows/Linux: Ctrl + Shift + R

# 4. Si persiste, limpiar Service Worker:
# DevTools → Application → Service Workers → Unregister
# Luego recargar
```

### Rutas 404 en SiteGround
Crear archivo `.htaccess` en `public_html/`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

---

## 📊 Métricas de Rendimiento Esperadas

### Lighthouse Scores (Objetivo)
- **Performance:** 90-100
- **Accessibility:** 95-100
- **Best Practices:** 90-100
- **SEO:** 90-100
- **PWA:** 90-100

### Tamaños de Carga
- **First Load:** ~1.7 MB (con cache)
- **Subsequent Loads:** < 100 KB (desde Service Worker)
- **Offline:** 0 KB (todo desde cache)

---

## 🎯 Próximos Pasos Recomendados

1. **[ ] Configurar dominio personalizado** (si aplica)
2. **[ ] Configurar SSL/HTTPS** (crítico para PWA)
3. **[ ] Configurar analytics** (Google Analytics, Plausible, etc.)
4. **[ ] Configurar monitoring** (Sentry para error tracking)
5. **[ ] Setup CI/CD** para deployments automáticos
6. **[ ] Configurar backups** automáticos del servidor

---

## 📞 Recursos Adicionales

- **SiteGround Support:** https://www.siteground.com/kb/
- **FileZilla Documentation:** https://wiki.filezilla-project.org/
- **PWA Checklist:** https://web.dev/pwa-checklist/
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **Netlify Docs:** https://docs.netlify.com/
- **Vercel Docs:** https://vercel.com/docs

---

**¿Necesita ayuda?** Contacte al desarrollador o consulte la documentación técnica en el proyecto.

**Última actualización:** 30 de Septiembre, 2025
