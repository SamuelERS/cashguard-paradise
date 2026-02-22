> ⚠️ Corregido 2026-02-19: devOptions.enabled es condicional (`process.env.VITE_ENABLE_DEV_PWA === 'true'`), no siempre `true`.

# 01 - Diagnostico PWA Actual

**Caso:** PWA Produccion
**Fecha:** 19 febrero 2026
**Estado:** Diagnostico completado
**Prioridad:** Alta - Impacto directo en operaciones diarias

---

## 1. Configuracion Actual

### 1.1 VitePWA Plugin

La PWA esta configurada mediante `vite-plugin-pwa` con las siguientes caracteristicas:

| Parametro | Valor | Observacion |
|-----------|-------|-------------|
| `registerType` | `autoUpdate` | SW se actualiza silenciosamente en background |
| `devOptions.enabled` | `process.env.VITE_ENABLE_DEV_PWA === 'true'` | **Condicional** — deshabilitado por defecto, se habilita con `VITE_ENABLE_DEV_PWA=true npm run dev` |
| `devOptions.type` | `module` | Usa ES modules para el Service Worker |
| `devOptions.suppressWarnings` | `true` | Silencia logs verbose de Workbox en dev (solo aplica cuando devOptions.enabled es true) |
| `devOptions.navigateFallback` | `'/'` | SPA routing correcto en desarrollo (solo aplica cuando devOptions.enabled es true) |

**Nota importante sobre devOptions:** El Service Worker en modo desarrollo esta **deshabilitado por defecto** para evitar servir bundles obsoletos desde cache, especialmente al cambiar de ramas o worktrees. Para probar PWA en desarrollo, se requiere ejecutar: `VITE_ENABLE_DEV_PWA=true npm run dev`. En produccion, el Service Worker siempre se registra automaticamente al cargar la aplicacion. Cuando hay una nueva version disponible, Workbox la descarga en background y la instala sin intervencion del usuario.

### 1.2 Workbox (v7.2.0)

Workbox maneja el precaching de assets estaticos generados durante el build:

**Assets que SI se cachean (precache):**
- Bundles JavaScript (con hash en nombre de archivo)
- Hojas de estilo CSS (con hash)
- `index.html` (archivo principal)
- Imagenes en `/icons/` (iconos PWA)
- Fonts incluidos en el bundle
- `manifest.webmanifest`

**Assets que NO se cachean:**
- Llamadas API a Supabase (queries, inserts, auth)
- Datos dinamicos de sesion
- Recursos externos (CDN, analytics)
- Archivos generados en runtime

No existe configuracion de runtime caching. Esto significa que la aplicacion funciona offline solo para la UI estatica, pero cualquier operacion que requiera Supabase fallara sin conexion.

### 1.3 Manifest PWA

El archivo `manifest.webmanifest` esta correctamente configurado con:

- Nombre completo y nombre corto de la aplicacion
- Iconos en multiples resoluciones (desde 72x72 hasta 512x512)
- `display: standalone` para experiencia nativa
- Colores de tema y fondo definidos
- Orientacion y scope configurados

### 1.4 Registro del Service Worker

El registro se realiza mediante la integracion automatica de VitePWA. El plugin inyecta el script de registro en el `index.html` durante el build.

**Comportamiento actual del registro:**
1. La pagina carga y registra el SW automaticamente
2. Workbox precachea los assets listados en el manifest de precache
3. Cuando hay nueva version, Workbox la descarga en background
4. El nuevo SW espera hasta que todas las pestanas de la app se cierren
5. En la proxima visita, el nuevo SW toma control

---

## 2. Hallazgo Critico: Sin Notificacion de Actualizacion

### El Problema

Actualmente no existe ningun mecanismo que informe al usuario cuando hay una nueva version de la aplicacion disponible. El flujo es completamente silencioso:

```
[Build nuevo desplegado]
        |
        v
[SW descarga nueva version en background]
        |
        v
[Nuevo SW instalado, esperando activacion]
        |
        v
[Usuario NO sabe que hay actualizacion]
        |
        v
[Usuario sigue operando con version vieja]
        |
        v
[Solo al cerrar TODAS las pestanas y reabrir se activa]
```

### Riesgo Operacional

Este es el hallazgo mas critico del diagnostico. En el contexto de CashGuard Paradise, los cajeros:

1. **Abren la app al inicio del turno** y pueden no cerrarla en todo el dia
2. **Operan con la version cargada** durante 8-12 horas continuas
3. **No tienen razon para recargar la pagina** manualmente
4. **Desconocen que existe una actualizacion** esperando

**Consecuencias concretas:**
- Un fix critico desplegado a las 10:00 AM podria no llegar al cajero hasta el dia siguiente
- Correcciones de calculos financieros no se aplican de inmediato
- Mejoras de seguridad anti-fraude quedan pendientes indefinidamente
- No hay forma de saber que version esta usando cada sucursal

### Evidencia Tecnica

No existe:
- Listener para el evento `controllerchange` del Service Worker
- Componente UI para notificar actualizaciones disponibles
- Logica para detectar cuando un nuevo SW esta en estado `waiting`
- Mecanismo de recarga controlada post-actualizacion

---

## 3. Analisis de Cache

### 3.1 Estrategia de Precache

Workbox genera automaticamente un manifest de precache durante el build. Este manifest lista todos los archivos estaticos con su hash de revision.

**Ventajas de la configuracion actual:**
- Assets con hash en el nombre (ej: `index-BGu2GbC8.js`) reciben cache de 1 anio via `.htaccess`
- `index.html` se sirve con `no-cache` para siempre obtener la version mas reciente
- El SW se sirve con `no-cache, no-store` para que el navegador siempre verifique actualizaciones

**Limitaciones identificadas:**
- Sin runtime caching, no hay cache inteligente para llamadas a Supabase
- No hay estrategia NetworkFirst ni StaleWhileRevalidate para datos dinamicos
- La experiencia offline se limita a mostrar la shell de la app sin datos

### 3.2 Patron de Invalidacion

Cuando se despliega una nueva version:
1. El nuevo build genera nuevos hashes en los nombres de archivo
2. Workbox detecta que el manifest de precache cambio
3. Descarga los archivos nuevos/modificados
4. El SW antiguo sigue sirviendo hasta que se active el nuevo

Este patron es correcto y no requiere cambios. El problema no esta en la invalidacion sino en la **activacion** del nuevo SW.

---

## 4. Deployment Pipeline

### 4.1 GitHub Actions Workflow

El archivo `.github/workflows/deploy-siteground.yml` implementa el siguiente flujo:

```
[Push a branch main]
        |
        v
[Checkout codigo]
        |
        v
[Setup Node.js 20 + npm cache]
        |
        v
[npm ci (install reproducible)]
        |
        v
[npm run build (NODE_ENV=production)]
        |
        v
[Verificar archivos PWA criticos]
  - manifest.webmanifest existe?
  - sw.js existe?
  - .htaccess existe?
  - Si falta alguno: ABORT deploy
        |
        v
[FTP Deploy a SiteGround]
  - Server: paradisesystemlabs.com
  - Dir: cashguard.paradisesystemlabs.com/public_html/
  - Puerto: 21
  - dangerous-clean-slate: false (NO borrar archivos existentes)
        |
        v
[Notificacion de exito]
```

**Tiempos tipicos:**
- Build: ~2 segundos
- Upload FTP: ~29 segundos
- Total pipeline: ~60-90 segundos

### 4.2 Configuracion del Servidor (SiteGround)

**SSL/HTTPS:**
- Certificado: Let's Encrypt Wildcard
- Cobertura: `*.paradisesystemlabs.com` + dominio raiz
- Renovacion: Automatica
- HTTPS forzado: Si (redirect 301)

**Apache (.htaccess):**
- Rewrite engine habilitado para SPA routing
- GZIP compression para HTML, CSS, JS, JSON
- Cache headers optimizados:
  - Assets con hash: `max-age=31536000` (1 anio)
  - HTML: `no-cache` (siempre verificar)
  - SW: `no-cache, no-store` (siempre fresco)
- Security headers: X-Content-Type-Options, X-Frame-Options
- Archivos sensibles bloqueados (.git, .env)

### 4.3 Estructura en Servidor

```
SiteGround FTP Root:
  cashguard.paradisesystemlabs.com/
    public_html/
      index.html
      manifest.webmanifest
      sw.js
      .htaccess
      assets/
        index-[hash].js
        index-[hash].css
      icons/
        favicon-32x32.png
        icon-192x192.png
        icon-512x512.png
        apple-touch-icon.png
```

---

## 5. Brechas de Produccion

### 5.1 Brechas Criticas (Requieren atencion inmediata)

| # | Brecha | Impacto | Esfuerzo |
|---|--------|---------|----------|
| B1 | Sin notificacion de actualizacion al usuario | Cajeros operan con versiones obsoletas durante horas o dias | 2-3 horas |
| B2 | Sin listener `controllerchange` en registro SW | No se detecta cuando nuevo SW toma control | Incluido en B1 |
| B3 | Sin mecanismo de recarga controlada | Usuario debe cerrar todas las pestanas manualmente | Incluido en B1 |

### 5.2 Brechas Importantes (Requieren planificacion)

| # | Brecha | Impacto | Esfuerzo |
|---|--------|---------|----------|
| B4 | Sin runtime caching para Supabase | App no funciona offline para datos dinamicos | 4-6 horas |
| B5 | Sin indicador de version visible en la app | No se puede verificar rapidamente que version tiene cada sucursal | 1 hora |
| B6 | Sin telemetria de versiones activas | No hay visibilidad de que version usa cada dispositivo | 3-4 horas |

### 5.3 Brechas Menores (Mejoras deseables)

| # | Brecha | Impacto | Esfuerzo |
|---|--------|---------|----------|
| B7 | Sin background sync para operaciones fallidas | Datos perdidos si hay corte de conexion durante guardado | 6-8 horas |
| B8 | Sin periodic sync para precarga de datos | Datos no se actualizan hasta que usuario abre la app | 4-5 horas |

### 5.4 Priorizacion Recomendada

**Fase 1 (Inmediata):** Resolver B1 + B2 + B3 como una sola unidad de trabajo. Esto garantiza que los cajeros siempre operen con la version mas reciente sin perder trabajo en progreso.

**Fase 2 (Siguiente iteracion):** Resolver B4 (runtime caching) para mejorar la experiencia offline y B5 (indicador de version) para facilitar soporte tecnico.

**Fase 3 (Cuando sea viable):** Resolver B6, B7 y B8 para una experiencia PWA de nivel enterprise.

---

## 6. Resumen Ejecutivo

La infraestructura PWA de CashGuard Paradise tiene una base solida:
- El build, deploy y precaching funcionan correctamente
- SSL, cache headers y SPA routing estan bien configurados
- El pipeline CI/CD es confiable y rapido

Sin embargo, la **ausencia de notificacion de actualizacion** es una brecha critica que impacta directamente las operaciones diarias. Un cajero puede estar operando con una version obsoleta durante todo su turno sin saberlo, lo que retrasa la llegada de fixes de seguridad, correcciones financieras y mejoras de UX.

La recomendacion es priorizar la implementacion del sistema de notificacion de actualizacion (B1+B2+B3) como siguiente paso inmediato.

---

**Documento siguiente:** `02_Plan_Update_Notification.md` - Plan detallado para implementar el sistema de notificacion de actualizacion.
