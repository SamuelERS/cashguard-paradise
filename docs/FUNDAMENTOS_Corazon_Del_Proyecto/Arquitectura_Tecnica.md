# 📋 Arquitectura Técnica - CashGuard Paradise PWA

## Resumen Ejecutivo: Stack Tecnológico Completo

> **Versión del Documento:** 1.0.0
> **Fecha:** 15 de Octubre 2025
> **Autor:** Paradise System Labs
> **Propósito:** Referencia técnica completa para desarrollo de proyectos PWA empresariales

---

## 🎯 Propósito del Proyecto

**CashGuard Paradise** es una **Progressive Web App (PWA)** profesional diseñada para el control de caja inteligente de Acuarios Paradise. El sistema implementa protocolos anti-fraude avanzados con verificación ciega, generación automatizada de reportes WhatsApp, y arquitectura multi-fase para conteo de efectivo y pagos electrónicos.

### Características Principales de la PWA

- **Standalone** - Modo aplicación nativa con experiencia mobile-first
- **Offline-first** - Service Worker con estrategia de caché inteligente
- **Mobile-optimized** - Responsive design, orientación portrait prioritaria
- **Installable** - Manifest completo con iconos progresivos (16×16 → 512×512)

---

## 🏗️ Arquitectura Técnica - Stack Completo

### 1. Core Framework & Runtime

| Componente | Versión | Descripción |
|------------|---------|-------------|
| **Node.js** | 20 LTS | Runtime JavaScript (Alpine Linux en Docker) |
| **React** | 18.3.1 | Framework UI con hooks modernos |
| **TypeScript** | 5.8.3 | Tipado estricto (`strictNullChecks`, `noImplicitAny`) |
| **Vite** | 5.4.19 | Build tool ultra-rápido (HMR, optimización automática) |

---

### 2. PWA Capabilities

| Componente | Versión | Configuración |
|------------|---------|---------------|
| **VitePWA Plugin** | 1.0.2 | Generación automática manifest + Service Worker |
| **Workbox** | (integrado) | Precaching + offline routing |
| **Manifest.webmanifest** | PWA Standard | 15 iconos (48px-512px), shortcuts, edge panel support |
| **Service Worker** | ES Modules | Auto-update strategy, navegación SPA |

#### Configuración Destacada

```typescript
devOptions: {
  enabled: true,          // Manifest en dev mode (testing PWA completo)
  type: 'module',         // ES modules para SW
  suppressWarnings: true  // Console limpia en desarrollo
}
```

**Patrones de Caché:**
- `globPatterns: ['**/*.{js,css,html,ico,png,svg}']` - Assets estáticos
- `maximumFileSizeToCacheInBytes: 5000000` - Límite 5MB por archivo
- `navigateFallback: '/'` - SPA routing offline

---

### 3. UI Framework & Design System

| Componente | Versión | Uso |
|------------|---------|-----|
| **shadcn/ui** | Latest | 30+ componentes Radix UI preconfigurados |
| **Radix UI** | 1.x-2.x | Primitivas accesibles (Dialog, Alert, Tooltip, etc.) |
| **Tailwind CSS** | 3.4.17 | Utility-first styling + responsive design |
| **Framer Motion** | 12.23.12 | Animaciones fluidas (modales, transiciones) |
| **Lucide React** | 0.462.0 | Iconos SVG optimizados (1000+ iconos) |
| **Sonner** | 2.0.7 | Toast notifications elegantes |

#### Utilidades CSS

- **`class-variance-authority`** - CVA para variantes de componentes
- **`tailwind-merge` + `clsx`** - Merge de clases dinámicas
- **`tailwindcss-animate`** - Animaciones Tailwind preconfiguradas
- **`@tailwindcss/typography`** - Contenido rich-text (artículos, blogs)

---

### 4. State Management & Data

| Librería | Versión | Propósito |
|----------|---------|-----------|
| **React Hooks** | Built-in | State local (`useState`, `useReducer`, `useCallback`) |
| **TanStack Query** | 5.83.0 | Server state + caching (queries optimistas) |
| **React Hook Form** | 7.61.1 | Formularios performantes con validación |
| **Zod** | 3.25.76 | Schema validation TypeScript-first |
| **LocalStorage** | Native API | Persistencia offline (auto-serialización) |

---

### 5. Routing & Navigation

| Componente | Versión | Configuración |
|------------|---------|---------------|
| **React Router DOM** | 6.30.1 | SPA routing client-side |
| **Apache .htaccess** | Integrado | Rewrite rules para servir `index.html` en todas las rutas |

#### .htaccess - Características Clave

- **HTTPS forzado** - PWA requirement (redirect 301)
- **Headers de caché optimizados** - Assets 1 year, HTML no-cache
- **Compresión GZIP automática** - HTML, CSS, JS, JSON
- **Security headers** - `X-Frame-Options`, `X-Content-Type-Options`, `X-XSS-Protection`

---

### 6. Testing Ecosystem

| Tool | Versión | Cobertura |
|------|---------|-----------|
| **Vitest** | 1.6.0 | Test runner ultra-rápido (compatible Vite) |
| **@vitest/ui** | 1.6.0 | UI interactiva para debugging |
| **@vitest/coverage-v8** | 1.6.0 | Cobertura con V8 engine (55% branches, 34% lines) |
| **@testing-library/react** | 16.0.0 | Testing componentes React |
| **@testing-library/user-event** | 14.5.2 | Simulación interacciones usuario |
| **jsdom** | 24.1.1 | DOM simulation en Node.js |
| **fast-check** | 3.23.2 | Property-based testing (validación matemática) |
| **MSW** | 2.3.5 | Mock Service Worker (API mocking) |

#### Thresholds de Cobertura

```json
{
  "branches": 55,
  "functions": 23,
  "lines": 19,
  "statements": 19
}
```

**Métricas Actuales:**
- ✅ 641+ tests (unit + integration + E2E)
- ✅ 99.4% passing rate
- ✅ Property-based testing con 10,900 validaciones automáticas

---

### 7. Containerization - Docker

#### Multi-stage Dockerfile (3 Stages)

| Stage | Base Image | Propósito |
|-------|------------|-----------|
| **development** | `node:20-alpine` | Testing E2E + desarrollo local |
| **builder** | `node:20-alpine` | Build producción (Vite compile) |
| **production** | `nginx:alpine` | Servidor Nginx optimizado |

#### Seguridad en Producción

- **Usuario no-root** - `www-user:1001` (principio de menor privilegio)
- **Health check** - `/health` endpoint cada 30s
- **CA certificates** - Soporte HTTPS completo
- **Nginx hardened** - Configurado como usuario no-privilegiado

**Dockerfile - Arquitectura Multi-stage:**
```dockerfile
# Stage 1: Development
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
RUN npm run build

# Stage 3: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
USER www-user
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

### 8. CI/CD - GitHub Actions

**Workflow:** `.github/workflows/deploy-siteground.yml`

#### Pipeline Completo (7 Pasos)

1. ✅ **Checkout código** - `actions/checkout@v4`
2. ✅ **Setup Node.js 20** - Con caché NPM (`actions/setup-node@v4`)
3. ✅ **Install dependencies** - `npm ci` (reproducible clean install)
4. ✅ **Build PWA producción** - `npm run build` (`NODE_ENV=production`)
5. ✅ **Verificar archivos críticos** - `manifest.webmanifest`, `sw.js`, `.htaccess`
6. ✅ **Deploy FTP a SiteGround** - `SamKirkland/FTP-Deploy-Action@v4.3.5`
7. ✅ **Notificación éxito** - Metadata (SHA, branch, actor)

#### Secrets Requeridos (GitHub Settings)

- `SITEGROUND_FTP_HOST`
- `SITEGROUND_FTP_USERNAME`
- `SITEGROUND_FTP_PASSWORD`
- `SITEGROUND_FTP_PORT`

---

### 9. Deployment Target - SiteGround

| Aspecto | Configuración |
|---------|---------------|
| **Host** | SiteGround shared hosting |
| **Subdomain** | `cashguard.paradisesystemlabs.com` |
| **SSL** | Let's Encrypt Wildcard (`*.paradisesystemlabs.com`) |
| **FTP Path** | `cashguard.paradisesystemlabs.com/public_html/` |
| **Server** | Apache (con `.htaccess` support) |
| **Deploy Method** | Automated FTP (GitHub Actions) |

**Características del Hosting:**
- ✅ SSL gratuito con renovación automática
- ✅ Apache 2.4+ con mod_rewrite habilitado
- ✅ PHP 8.x disponible (no usado en PWA)
- ✅ FTP/SFTP con acceso seguro
- ✅ Backups automáticos diarios

---

### 10. Additional Libraries

| Categoría | Librería | Versión | Uso |
|-----------|----------|---------|-----|
| **Date Handling** | `date-fns` | 3.6.0 | Formateo fechas, timestamps |
| **Carousel** | `embla-carousel-react` | 8.6.0 | Sliders/carousels responsive |
| **Charts** | `recharts` | 2.15.4 | Gráficos estadísticos |
| **Theme** | `next-themes` | 0.3.0 | Dark/light mode |
| **OTP Input** | `input-otp` | 1.4.2 | Inputs PIN/código |
| **Command Palette** | `cmdk` | 1.1.1 | ⌘K command menu |
| **Resizable Panels** | `react-resizable-panels` | 2.1.9 | Paneles redimensionables |
| **Drawer** | `vaul` | 0.9.9 | Drawers mobile-friendly |

---

### 11. Development Tools

| Tool | Versión | Descripción |
|------|---------|-------------|
| **ESLint** | 9.32.0 | Linter con flat config (ESLint v9+) |
| **Husky** | 8.0.3 | Git hooks (pre-commit validations) |
| **Lovable Tagger** | 1.1.9 | Component tagging para debugging |
| **Autoprefixer** | 10.4.21 | CSS vendor prefixes automáticos |
| **PostCSS** | 8.5.6 | CSS transformation pipeline |
| **typescript-eslint** | 8.38.0 | TypeScript ESLint rules |

#### ESLint Plugins

- **`eslint-plugin-react-hooks`** - 5.2.0 - Validación hooks rules
- **`eslint-plugin-react-refresh`** - 0.4.20 - HMR optimization

---

## 📦 Package.json - Scripts Principales

### Desarrollo

```bash
npm run dev              # Dev server (Vite) puerto 5173
npm run preview          # Preview build local
```

### Build

```bash
npm run build            # Build producción
npm run build:dev        # Build modo desarrollo (debugging)
```

### Testing

```bash
npm run test             # Tests con watch mode
npm run test:coverage    # Coverage report completo
npm run test:unit        # Solo unit tests
npm run test:integration # Solo integration tests
npm run test:e2e         # Playwright E2E tests
```

### Docker

```bash
npm run docker:test       # Tests en contenedor Docker
npm run docker:test:build # Build + tests Docker
```

### Code Quality

```bash
npm run lint             # ESLint check
npm run prepare          # Husky setup (auto-ejecuta post-install)
```

---

## 🎯 Características Técnicas Destacadas

### ✅ PWA Completa

- ✅ **Offline-first** - Service Worker con caché inteligente
- ✅ **Installable** - Manifest completo con shortcuts
- ✅ **Responsive** - Mobile-first, orientación portrait
- ✅ **HTTPS obligatorio** - SSL Let's Encrypt wildcard

### ✅ TypeScript Strict

- ✅ **`noImplicitAny: true`** - Zero tipos implícitos
- ✅ **`strictNullChecks: true`** - Null safety completa
- ✅ **Zero `any` types** - Codebase 100% tipado

### ✅ Testing Robusto

- ✅ **641+ tests** - Unit + integration + E2E
- ✅ **Property-based testing** - Fast-check con 10,900 validaciones
- ✅ **Coverage > 55%** - Branches, > 34% lines
- ✅ **CI/CD validation** - GitHub Actions pipeline verde

### ✅ Deployment Automatizado

- ✅ **Push a `main`** → Auto-deploy a SiteGround
- ✅ **Verificación archivos PWA** - Gate crítico pre-deploy
- ✅ **FTP optimizado** - Exclude node_modules, .git

### ✅ Security & Performance

- ✅ **Docker multi-stage** - Usuario no-root en production
- ✅ **Health checks** - Nginx cada 30s
- ✅ **`.htaccess` optimizado** - GZIP, caché, security headers
- ✅ **Bundle optimization** - Vite tree-shaking, code-splitting

---

## 📊 Bundle Size (Producción)

| Asset | Size | Gzip |
|-------|------|------|
| **JavaScript** | ~1.44 MB | ~335 KB |
| **CSS** | ~50 KB | ~12 KB |
| **Total** | ~1.49 MB | ~347 KB |

### Optimizaciones Aplicadas

- ✅ **Tree-shaking automático** - Vite elimina código no usado
- ✅ **Code-splitting por rutas** - Lazy loading de componentes
- ✅ **Assets con hashing** - Cache invalidation automática (1 year)
- ✅ **Service Worker precache selectivo** - Solo assets críticos

---

## 🔒 Requirements del Sistema

| Componente | Versión Mínima |
|------------|----------------|
| **Node.js** | 20 LTS |
| **npm** | 10+ |
| **Docker** | 20+ (opcional, para testing) |
| **Git** | 2.30+ |
| **OS** | macOS / Linux / Windows (WSL2) |

---

## 📞 Contacto Técnico

- **Proyecto:** CashGuard Paradise
- **Versión:** 2.7.0
- **Repositorio:** [GitHub](https://github.com/SamuelERS/cashguard-paradise)
- **URL Producción:** [https://cashguard.paradisesystemlabs.com](https://cashguard.paradisesystemlabs.com)
- **Documentación:** [TECHNICAL-SPECS.md](/Documentos_MarkDown/TECHNICAL-SPECS.md)

---

## ✅ Conclusión

Este stack tecnológico es **100% reutilizable** para nuevos proyectos PWA empresariales. Todos los componentes son:

- ✅ **Modernos** - Versiones LTS/Latest con soporte activo
- ✅ **Probados** - 641+ tests passing, CI/CD pipeline verde
- ✅ **Documentados** - CLAUDE.md, TECHNICAL-SPECS.md exhaustivos
- ✅ **Escalables** - Docker, GitHub Actions, hosting flexible
- ✅ **Seguros** - TypeScript strict, ESLint, usuario no-root

### Próximos Pasos para Clonar el Stack

1. **Clonar repositorio base** - Eliminar lógica de negocio específica
2. **Actualizar manifest.webmanifest** - Nombre, descripción, iconos personalizados
3. **Configurar secrets GitHub** - FTP credentials de hosting destino
4. **Adaptar `.htaccess`** - Ajustar security headers según necesidad
5. **Deploy inicial** - Validar pipeline completo funciona

**Tiempo estimado:** 2-3 horas para nuevo proyecto desde este stack.

---

**Última actualización:** 15 de Octubre 2025
**Versión del documento:** 1.0.0
**Mantenido por:** Paradise System Labs
