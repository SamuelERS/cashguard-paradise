# Caso: Experiencia PWA en Producción

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-19 |
| **Fecha actualización** | 2026-02-19 |
| **Estado** | 🔴 Pendiente |
| **Prioridad** | Alta |
| **Responsable** | Claude Code (Opus 4.6) + SamuelERS (testing dispositivos) |

## Resumen

La app está desplegada en `cashguard.paradisesystemlabs.com` pero falta verificar que la instalación como PWA funcione bien en dispositivos reales, que los service workers y cache funcionen correctamente, y que la actualización automática cuando se despliega una versión nueva llegue a todos los dispositivos.

## Contexto

CashGuard Paradise se despliega como PWA vía GitHub Actions → FTP a SiteGround. Usa VitePWA con Workbox para precaching y autoUpdate. El deploy funciona, pero no hay mecanismo visible para que el usuario sepa que hay una versión nueva disponible.

## Hallazgos de Investigación

### Infraestructura PWA Actual
- **VitePWA**: `registerType: 'autoUpdate'` — SW se actualiza silenciosamente
- **Workbox 7.2.0**: Precaching de assets estáticos (HTML, CSS, JS, imágenes)
- **CI/CD**: GitHub Actions → FTP Deploy a SiteGround (~30s)
- **SSL**: Wildcard Let's Encrypt (`*.paradisesystemlabs.com`)
- **`.htaccess`**: SPA routing, GZIP, cache headers, security headers

### HALLAZGO CRÍTICO: Sin Notificación de Actualización
- `registerType: 'autoUpdate'` actualiza el SW silenciosamente en background
- Pero el usuario necesita **recargar la página** para obtener la versión nueva
- **NO hay UI** que diga "Hay una versión nueva, recargar"
- **NO hay listener** `controllerchange` en el registro del SW
- **Riesgo**: Usuarios pueden operar durante días con versión obsoleta sin saberlo

### Workbox Configuration
- **Precaching**: Assets estáticos (JS, CSS, HTML, imágenes, fonts)
- **Runtime caching**: NO configurado para llamadas API
- **Offline**: Solo funciona para assets precacheados
- **Cache strategy**: Sin NetworkFirst/StaleWhileRevalidate para API

### Opciones para Notificación de Update
1. **Toast de recarga** — Banner/toast que dice "Nueva versión disponible" con botón "Actualizar"
2. **Recarga automática** — `skipWaiting()` + `clients.claim()` + auto-reload
3. **Prompt modal** — Modal informativo antes de recargar

## Documentos

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `01_Diagnostico_PWA_Actual.md` | Auditoría completa: SW, Workbox, manifest, cache | ✅ Completado |
| `02_Plan_Update_Notification.md` | Implementar sistema de notificación de updates | ✅ Completado |
| `03_Checklist_Dispositivos.md` | Lista de dispositivos reales a probar + criterios | 🔴 Pendiente (crear al iniciar testing) |

## Resultado

[Completar cuando PWA esté optimizada y probada en dispositivos reales]

## Referencias

- `vite.config.ts` — Configuración VitePWA + Workbox
- `public/.htaccess` — Configuración Apache (cache, SPA routing, security)
- `.github/workflows/deploy-siteground.yml` — Pipeline CI/CD
- URL producción: `https://cashguard.paradisesystemlabs.com`
