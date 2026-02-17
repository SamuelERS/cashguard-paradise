import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
// 🤖 [IA] - Puerto actualizado a 5173 para desarrollo con Docker
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // SW en desarrollo deshabilitado por defecto para evitar servir bundles obsoletos
      // desde caché (especialmente al cambiar de ramas/worktrees).
      // Si se requiere probar PWA en dev: VITE_ENABLE_DEV_PWA=true npm run dev
      // navigateFallback/suppressWarnings solo aplican cuando se habilita explícitamente.
      devOptions: {
        enabled: process.env.VITE_ENABLE_DEV_PWA === 'true',
        type: 'module',
        navigateFallback: '/',
        suppressWarnings: true
      },
      workbox: {
        // 🤖 [IA] - v1.3.7V: .htaccess explícitamente excluido de globPatterns
        // Root cause: Servidor retorna 403 Forbidden para .htaccess (seguridad Apache)
        // Solución: globPatterns solo incluye extensiones seguras (NO incluye .htaccess)
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        maximumFileSizeToCacheInBytes: 5000000,
        // 🤖 [IA] - v1.3.7V: navigateFallbackDenylist adicional para archivos de configuración
        navigateFallbackDenylist: [/\.htaccess$/, /\.env$/],
      },
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'icons/*.png',
        // 🤖 [IA] - v1.3.7V: .htaccess removido de includeAssets
        // Razón: File must exist in dist/ pero NO debe ser precached por Service Worker
      ],
      manifest: {
        name: 'Paradise Cash Control - Control de Caja Inteligente',
        short_name: 'Paradise Cash',
        description: 'Sistema de control de caja inteligente para Acuarios Paradise con protocolos profesionales',
        theme_color: '#374151',
        background_color: '#0D1117',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        lang: 'es',
        icons: [
          {
            src: '/favicon.ico',
            sizes: '16x16 32x32 48x48',
            type: 'image/x-icon'
          },
          {
            src: '/icons/icon-48x48.png',
            sizes: '48x48',
            type: 'image/png'
          },
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/icons/icon-167x167.png',
            sizes: '167x167',
            type: 'image/png'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: '/icons/icon-256x256.png',
            sizes: '256x256',
            type: 'image/png'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['business', 'finance', 'productivity'],
        screenshots: [
          {
            src: '/placeholder.svg',
            sizes: '540x720',
            type: 'image/svg+xml',
            form_factor: 'narrow'
          }
        ],
        shortcuts: [
          {
            name: 'Iniciar Corte',
            short_name: 'Corte',
            description: 'Iniciar un nuevo corte de caja',
            url: '/',
            icons: [
              {
                src: '/icons/icon-96x96.png',
                sizes: '96x96',
                type: 'image/png'
              }
            ]
          }
        ],
        edge_side_panel: {
          preferred_width: 400
        },
        prefer_related_applications: false
      }
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
