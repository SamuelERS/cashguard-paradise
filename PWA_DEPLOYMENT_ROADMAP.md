
# Roadmap: PWA y Despliegue en SiteGround

Este documento es una guía paso a paso para generar la versión PWA (Progressive Web App) de tu aplicación CashGuard Paradise y desplegarla correctamente en tu servidor de SiteGround.

---

## Fase 1: Verificación de la Configuración (Checklist)

Tu proyecto **YA ESTÁ CONFIGURADO** como PWA. Esta fase confirma el estado actual:

- [x] **Plugin PWA Instalado:** `vite-plugin-pwa` v1.0.2 confirmado en `package.json:72`
- [x] **Configuración Avanzada:** `vite.config.ts` contiene configuración completa PWA con:
  - Service Worker automático (`registerType: 'autoUpdate'`)
  - Manifest completo con 13 iconos (48x48 a 512x512)
  - Shortcuts de app (acceso rápido a "Iniciar Corte")
  - Screenshots para tiendas de apps
  - Soporte Microsoft Edge (`edge_side_panel`)
  - Configuración offline con Workbox
- [x] **Iconos Verificados:** 13 iconos PNG + favicon.ico + apple-touch-icon.png existentes en `public/icons/`
- [x] **Conflictos Resueltos:** Eliminado `manifest.json` manual duplicado

---

## Fase 2: Generación y Verificación de PWA

En esta fase, compilaremos la aplicación y verificaremos que la PWA se genere correctamente con todas sus características avanzadas.

1.  **[ ] Abrir una terminal:** Asegúrate de que la terminal esté en la raíz de tu proyecto (`/Users/samuelers/Paradise System Labs/cashguard-paradise`).

2.  **[ ] Limpiar build anterior (opcional):**
    ```bash
    rm -rf dist
    ```

3.  **[ ] Ejecutar el comando de construcción:**
    ```bash
    npm run build
    ```

4.  **[ ] Verificar archivos PWA generados:** Dentro de `dist` deben existir:
    *   `index.html`: Punto de entrada
    *   `sw.js`: Service Worker para funcionamiento offline
    *   `manifest.webmanifest`: Manifiesto con configuración avanzada
    *   `workbox-*.js`: Archivos del cache strategy
    *   Carpeta `assets/` con CSS/JS optimizados
    *   Carpeta `icons/` con todos los iconos PWA

5.  **[ ] Verificar contenido del manifest:** Abre `dist/manifest.webmanifest` y confirma:
    *   ✅ `name: "Paradise Cash Control - Sistema Anti-Fraude"`
    *   ✅ `shortcuts` array con "Iniciar Corte"
    *   ✅ `icons` array con 13 iconos (48x48 a 512x512)
    *   ✅ `screenshots` array para app stores

---

## Fase 3: Pre-verificación PWA Local (NUEVO)

**IMPORTANTE:** Antes de desplegar, verifica que la PWA funcione correctamente en local.

1.  **[ ] Servir build local:**
    ```bash
    npm run preview
    ```

2.  **[ ] Abrir en navegador:** Visita `http://localhost:4173`

3.  **[ ] Verificar Service Worker:**
    - Abre DevTools (`F12`) → Application tab → Service Workers
    - Confirma que `sw.js` esté registrado y activo

4.  **[ ] Probar modo offline:**
    - En DevTools → Network tab → marcar "Offline"
    - Recargar página - debe funcionar sin conexión
    - Desmarcar "Offline" para volver online

5.  **[ ] Verificar installability:**
    - Debe aparecer ícono "instalar" en la barra de direcciones
    - Botón derecho → "Instalar Paradise Cash Control"

---

## Fase 4: Despliegue en SiteGround

Ahora, subiremos los archivos generados al servidor para que tu aplicación esté en línea.

1.  **[ ] Elegir un método de subida:**
    *   **Opción A (Recomendado):** Usar un cliente FTP como [FileZilla](https://filezilla-project.org/).
    *   **Opción B:** Usar el "Administrador de Archivos" (`File Manager`) en el panel de control de SiteGround (Site Tools).

2.  **[ ] Conectar al servidor:** Usa las credenciales FTP (servidor, usuario, contraseña) que te proveyó SiteGround para conectarte.

3.  **[ ] Navegar al directorio raíz web:** En el lado del servidor (el panel derecho en FileZilla), navega hasta encontrar la carpeta `public_html`. Este es el directorio donde vive tu sitio web público.

4.  **[ ] (Opcional pero recomendado) Limpiar el directorio:** Si tienes una versión antigua de la web en `public_html`, es recomendable borrar esos archivos antes de subir los nuevos para evitar conflictos. **¡Haz una copia de seguridad antes si es necesario!**

5.  **[ ] Subir los archivos:**
    *   En el lado local (panel izquierdo en FileZilla), navega hasta la carpeta `dist` de tu proyecto.
    *   Selecciona **todo el contenido** de la carpeta `dist` (NO la carpeta `dist` en sí).
    *   Arrastra y suelta esos archivos dentro de la carpeta `public_html` en el servidor.

---

## Fase 5: Verificación PWA en Producción

Tu aplicación está en línea. Ahora verificaremos que todas las características PWA funcionen en producción.

1.  **[ ] Limpiar caché:** Hard refresh con `Ctrl + Shift + R` (o `Cmd + Shift + R` en Mac).

2.  **[ ] Auditar PWA con Lighthouse:**
    - Abre DevTools (`F12`) → pestaña "Lighthouse"
    - Selecciona "Progressive Web App" + "Performance"
    - Clic en "Analyze page load"
    - **Objetivo:** Puntuación PWA > 90/100

3.  **[ ] Verificar características específicas:**
    - **Manifest:** Devtools → Application → Manifest (debe mostrar "Paradise Cash Control")
    - **Service Worker:** Application → Service Workers (estado "activated")
    - **Storage:** Application → Storage (debe mostrar cache de Workbox)
    - **Icons:** Manifest debe mostrar 13 iconos en diferentes tamaños

4.  **[ ] Probar instalación multiplataforma:**
    - **Desktop Chrome/Edge:** Ícono "instalar" en barra direcciones
    - **Android Chrome:** Banner "Añadir a pantalla inicio" o menú → "Instalar app"
    - **iOS Safari:** Compartir → "Añadir a pantalla de inicio"

5.  **[ ] Verificar shortcuts (solo Chrome):**
    - Instalar la PWA
    - Clic derecho en el ícono de escritorio
    - Debe aparecer "Iniciar Corte" como acceso rápido

6.  **[ ] Prueba funcionalidad offline:**
    - DevTools → Network → "Offline"
    - Recargar - la app debe funcionar sin conexión
    - El cash counting debe persistir en localStorage

## ✅ Resultado Final

Tu **CashGuard Paradise PWA** está completamente funcional con:
- 🔄 **Auto-updates** automáticos
- 📱 **Instalable** en móviles y desktop
- 🚀 **Accesos rápidos** a funciones principales
- 💾 **Funciona offline** con datos persistentes
- 🛡️ **Sistema anti-fraude** protegido localmente
