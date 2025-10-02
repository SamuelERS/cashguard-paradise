# 💰 CashGuard Paradise - Progressive Web App

> Sistema profesional de conteo y gestión de efectivo desarrollado por Acuarios Paradise
> **Estado:** ✅ Fase 1 completada, Fase 2 en progreso (40%)
> **Coverage:** 34% | **Tests:** 229/229 passing | **CI:** 🟢 Verde

---

## 🎯 Características Principales

### ✨ Conteo Guiado de Efectivo
- Sistema wizard paso a paso para conteo preciso
- Validación en tiempo real de monedas y billetes
- Resumen automático con totales y confirmación
- Instrucciones obligatorias anti-fraude

### 🎨 Interfaz Profesional
- Progressive Web App (instalable en cualquier dispositivo)
- Diseño responsive (móvil, tablet, desktop)
- Animaciones fluidas con Framer Motion
- Glass Morphism UI con efectos premium

### 🔒 Validaciones Robustas
- Validación de input por tipo (integer, decimal, currency)
- Navegación inteligente con Enter key
- Focus management automático
- Sistema anti-error en confirmaciones

### ⚡ Performance
- Carga < 3 segundos
- Optimizado para CI/CD (GitHub Actions)
- 229 tests validando lógica crítica
- 0 errores ESLint, código limpio

---

## 🚀 Inicio Rápido

### Prerrequisitos
```bash
Docker Desktop >= 20.x
Docker Compose >= 2.0
```

### Instalación (Docker-First)
```bash
# Clonar repositorio
git clone https://github.com/SamuelERS/cashguard-paradise.git
cd cashguard-paradise

# Desarrollo con hot-reload (puerto 5173)
./Scripts/docker-commands.sh dev

# Abrir navegador en http://localhost:5173
```

### Scripts Disponibles
```bash
# Desarrollo
./Scripts/docker-commands.sh dev              # Dev server (5173)
./Scripts/docker-commands.sh dev:logs         # Ver logs dev

# Testing (Docker exclusivo)
./Scripts/docker-test-commands.sh test        # Todos los tests
./Scripts/docker-test-commands.sh test:unit   # Solo unit tests
./Scripts/docker-test-commands.sh coverage    # Coverage report

# Producción
./Scripts/docker-commands.sh prod:build       # Build production (8080)
./Scripts/docker-commands.sh prod:logs        # Ver logs prod

# Utilidades
./Scripts/docker-commands.sh clean            # Limpiar todo
./Scripts/docker-commands.sh status           # Ver estado
```

---

## 📊 Estado del Proyecto

### Métricas Actuales (01 Oct 2025 22:30)
```
Tests:      229/229 passing (100%)
Coverage:   34% (Lines: 34%, Branches: 61%)
Build:      ✅ Exitoso
ESLint:     ✅ 0 errors, 0 warnings
CI Status:  🟢 Verde (GitHub Actions)
```

### Cobertura de Tests

#### ✅ SECTOR 1: Framework Foundation (10 tests)
- **Smoke Tests** - 10 tests ✅
- Docker environment setup
- Testing infrastructure validation

#### ✅ SECTOR 2: Financial Calculations (107 tests)
- **calculateCashTotal** - 50 tests ✅ (100% coverage)
- **calculateChange50** - 20 tests ✅ (100% coverage)
- **calculateDeliveryDistribution** - 24 tests ✅ (100% coverage)
- **formatCurrency & Helpers** - 13 tests ✅ (100% coverage)

#### ✅ SECTOR 3: Business Flows (13 tests) 🔧
- **morning-count-simplified** - 8 tests ✅
- **select-portal-debug** - 5 tests ✅
- Edge cases & validations

**Nota:** 23 tests arquitectónicamente incompatibles eliminados (v1.2.36)

#### ✅ SECTOR 4: E2E/UI Testing (24 tests)
- **Playwright Tests** - 24 tests ✅
- Port 5175 dedicated server
- Full user journey validation

#### ✅ SECTOR 5: CI/CD Automation
- GitHub Actions workflows
- Husky pre-commit hooks
- Security scanning (TruffleHog)

#### 🔄 Hooks Integration Tests (Fase 2 - 40%)
- **useFieldNavigation** - 25 tests ✅
- **useInputValidation** - 23 tests ✅
- **GuidedInstructionsModal** - 23 tests ✅
- **useTimingConfig** - Próximo 🔄
- **usePhaseManager** - Pendiente ⏸️
- **useWizardNavigation** - Pendiente ⏸️

---

## 🏗️ Arquitectura

### Stack Tecnológico
```
Frontend:     React 18 + TypeScript
Styling:      Tailwind CSS + shadcn/ui
Animations:   Framer Motion
State:        React Hooks (custom)
Testing:      Vitest + Testing Library
E2E:          Playwright
Build:        Vite
Linting:      ESLint v9+ (flat config)
Container:    Docker + Docker Compose
CI/CD:        GitHub Actions + Husky
```

### Estructura del Proyecto
```
cashguard-paradise/
├── src/
│   ├── components/           # Componentes React
│   │   ├── cash-counting/    # Módulo conteo efectivo
│   │   ├── ui/               # shadcn/ui components
│   │   └── ...
│   ├── hooks/                # Custom hooks
│   │   ├── useFieldNavigation.ts
│   │   ├── useInputValidation.ts
│   │   ├── useTimingConfig.ts
│   │   └── ...
│   ├── lib/                  # Utils y helpers
│   ├── styles/               # CSS modular
│   │   └── features/         # Feature-specific styles
│   ├── __tests__/            # Tests organizados
│   │   ├── integration/      # Tests integración
│   │   │   ├── hooks/        # Hook tests
│   │   │   └── cash-counting/
│   │   ├── unit/             # Tests unitarios
│   │   │   ├── utils/
│   │   │   └── hooks/
│   │   ├── fixtures/         # Test helpers
│   │   └── setup.ts          # Test environment
│   └── App.tsx               # Root component
├── e2e/                      # Playwright E2E tests
├── Scripts/                  # Docker helper scripts
│   ├── docker-commands.sh
│   └── docker-test-commands.sh
├── public/                   # Assets estáticos
├── .github/
│   └── workflows/            # CI/CD pipelines
├── vitest.config.ts          # Vitest configuration
├── playwright.config.ts      # Playwright config
├── eslint.config.js          # ESLint flat config
└── package.json
```

### Arquitectura de Flujo Guiado: Estándar Wizard V3

El proyecto ha estandarizado los componentes de flujo guiado bajo la arquitectura **"Wizard V3"**.

**Implementación de referencia:** `src/components/cash-counting/GuidedInstructionsModal.tsx`

#### Principios Clave:

1. **UI Controlada ("Dumb Component"):** Componente puramente presentacional sin lógica de estado
2. **Lógica Centralizada (Hook "Cerebro"):** Hook dedicado con `useReducer` para estado y transiciones
3. **Configuración Externa:** Contenido y reglas en archivos de configuración separados
4. **Seguridad por Diseño:** Sistema de timing anti-fraude integrado

**Referencias:**
- UI: `src/components/cash-counting/GuidedInstructionsModal.tsx`
- Hook: `src/hooks/instructions/useInstructionFlow.ts`
- Config: `src/data/instructions/cashCountingInstructions.ts`

---

## 🧪 Testing

### Ejecutar Tests (Docker Exclusivo)

```bash
# Todos los tests (watch mode)
./Scripts/docker-test-commands.sh test

# Todos los tests (single run)
./Scripts/docker-test-commands.sh test:unit
./Scripts/docker-test-commands.sh test:integration

# Test específico
docker compose -f docker-compose.test.yml run --rm test npm test -- [archivo] --run

# Con coverage
./Scripts/docker-test-commands.sh coverage

# E2E tests (Playwright)
npx playwright test
```

### Coverage Thresholds
```javascript
// vitest.config.ts
coverage: {
  branches: 55,   // ✅ Actual: ~61%
  functions: 23,  // ✅ Actual: ~35%
  lines: 19,      // ✅ Actual: ~34%
  statements: 19  // ✅ Actual: ~34%
}
```

**Roadmap de mejora comprometida (2025):**
- Q1 (Marzo): 30% → hooks críticos
- Q2 (Junio): 35% → componentes de cálculo
- Q3 (Septiembre): 50% → flows completos
- Q4 (Diciembre): 60% → profesionalización

### Patrón de Tests
```typescript
// Ejemplo: Integration test de hook
describe('useInputValidation', () => {
  it('should validate integer input correctly', () => {
    const { result } = renderHook(() => useInputValidation());

    const validation = result.current.validateInput('123', 'integer');

    expect(validation.isValid).toBe(true);
    expect(validation.cleanValue).toBe('123');
  });

  it('should reject decimal in integer mode', () => {
    const { result } = renderHook(() => useInputValidation());

    const validation = result.current.validateInput('123.45', 'integer');

    expect(validation.isValid).toBe(false);
    expect(validation.errorMessage).toBeDefined();
  });
});
```

---

## 🔧 Configuración

### ESLint (v9+ Flat Config)
```javascript
// eslint.config.js
export default [
  {
    ignores: [
      'dist', 'dist-ssr', 'dist-backup-*',
      'coverage', '.nyc_output',
      'playwright-report', 'test-results',
      'node_modules',
      '**/.vinxi/**', '**/dist/**', '**/build/**',
      '**/coverage/**', '**/playwright-report/**',
      'public/mockServiceWorker.js'
    ]
  },
  // ... resto de config
]
```

### Vitest
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'src/__tests__/**',
        '**/*.test.{ts,tsx}',
        'src/__mocks__/**'
      ],
      thresholds: {
        branches: 55,
        functions: 23,
        lines: 19,
        statements: 19
      }
    }
  }
});
```

---

## 🐛 Bugs Conocidos y Validados

### ✅ Bugs Validados en Tests
- **Bug #1:** Navegación Enter inconsistente - ✅ Validado en useFieldNavigation (25 tests)
- **Bug #2:** Validación input inconsistente - ✅ Validado en useInputValidation (23 tests)
- **Bug #3:** Decimal validation (no truncate) - ✅ Validado en useInputValidation (Test 2.2, 3.3)
- **Bug #4:** Focus management - ✅ Validado en useFieldNavigation (Grupo 4)
- **Bug #5:** Text selection - ✅ Validado en useFieldNavigation (Grupo 5)

### ⚠️ Bugs Parciales
- **Bug #6:** Race conditions en timeouts - ⚠️ Parcial (pendiente useTimingConfig - cierra completamente en Fase 2)

---

## 📈 Roadmap

### ✅ Fase 1: Componentes Críticos - COMPLETADA (102 tests)
- [x] GuidedFieldView (30 tests)
- [x] GuidedCoinSection (16 tests)
- [x] GuidedBillSection (16 tests)
- [x] TotalsSummarySection (17 tests)
- [x] GuidedInstructionsModal (23 tests)

### 🔄 Fase 2: Hooks Críticos - 40% COMPLETADA (48/~110 tests)
- [x] useFieldNavigation (25 tests) ✅
- [x] useInputValidation (23 tests) ✅
- [ ] useTimingConfig (15-18 tests) - 🔴 PRÓXIMO - Cierra Bug #6
- [ ] usePhaseManager (20-25 tests)
- [ ] useWizardNavigation (18-22 tests)

### ⏸️ Fase 3: Componentes Secundarios - PENDIENTE
- [ ] PaymentDetailsForm
- [ ] ResultsSummaryView
- [ ] ErrorBoundary
- [ ] LoadingStates

### ⏸️ Fase 4: E2E Completo - PENDIENTE
- [ ] Morning Count Full Flow
- [ ] Evening Cut Full Flow
- [ ] Phase Transitions
- [ ] Error Scenarios

### 🎯 Meta Final
- 400+ tests totales
- 60-70% coverage
- E2E completo (Playwright)
- Performance optimizado < 3s

---

## 🚀 Despliegue

### Build de Producción (Docker)
```bash
# Build optimizado
./Scripts/docker-commands.sh prod:build

# Preview local del build (puerto 8080)
# Abrir: http://localhost:8080
```

### Despliegue Manual (sin Docker)
```bash
# Requiere Node.js >= 18.x instalado
npm install
npm run build
npm run preview
```

### Variables de Entorno
```env
# .env.production
VITE_API_URL=https://api.production.com
VITE_ENV=production
```

### Plataformas Recomendadas
- **Vercel** - Deploy automático desde GitHub ✅
- **Netlify** - Alternativa con CI/CD integrado
- **GitHub Pages** - Para demos públicas
- **Docker Hub** - Container registry para producción

---

## 🤝 Contribución

### Flujo de Trabajo
1. Fork del repositorio
2. Crear branch: `git checkout -b feature/nueva-feature`
3. Hacer cambios con tests: `./Scripts/docker-test-commands.sh test`
4. Validar linting: `npm run lint` (o en Docker)
5. Commit: `git commit -m "feat: descripción"`
6. Push: `git push origin feature/nueva-feature`
7. Crear Pull Request

### Estándares de Código
- **TypeScript strict mode** habilitado
- **ESLint v9+** debe pasar (0 errors, 0 warnings)
- **Tests** deben cubrir nuevas features
- **Commits** siguiendo Conventional Commits
- **No usar `any`** - usar `as unknown as [Tipo]` si es necesario
- **Docker-First** - todo desarrollo en containers

### Pre-commit Hooks (Husky)
```bash
# Automáticamente ejecuta antes de cada commit:
- ESLint check
- TypeScript check
- 139 unit tests (en Docker)
- Formatting check
```

**Nota:** Si pre-commit falla, el commit se bloquea hasta que se corrija.

---

## 📚 Documentación

### Documentos Principales
- **README.md** - Este archivo (guía de inicio)
- **CLAUDE.md** - Historial completo de desarrollo v1.2.36+
- **CHANGELOG-DETALLADO.md** - Historial v1.0.80 - v1.1.20
- **CHANGELOG-HISTORICO.md** - Historial v1.0.2 - v1.0.79
- **DOCKER-GUIDE.md** - Guía completa de Docker

### Recursos Técnicos
- [Vitest Docs](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright](https://playwright.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Docker Docs](https://docs.docker.com/)

---

## 🔒 Seguridad

### Validaciones Implementadas
- Input sanitization en todos los campos
- Validación tipo-específica (integer/decimal/currency)
- Sistema anti-fraude en instrucciones obligatorias
- Confirmación explícita antes de submit
- Witness validation (testigo ≠ cajero)
- Single count restriction per session

### Escaneo de Seguridad (CI/CD)
- **TruffleHog** - Detección de secrets en commits
- **GitHub Actions** - Security scanning automático
- **Pre-commit hooks** - Validación local antes de push

### Reporte de Vulnerabilidades
Si encuentras una vulnerabilidad de seguridad, por favor repórtala a:
**security@acuariosparadise.com**

---

## 📄 Licencia

Este proyecto es propiedad de **Acuarios Paradise**.
Todos los derechos reservados.

**Código propietario** - No distribuir sin autorización.

---

## 🙏 Reconocimientos

### Equipo de Desarrollo
- **CODE (Claude Desktop)** - Backend, lógica y testing
- **WINDSURF** - Frontend y componentes UI
- **Mentor DevOps Paradise** - Arquitectura y dirección técnica

### Tecnologías
Gracias a los equipos de:
- React Team (Meta)
- Vite Team (Evan You)
- Vitest Team
- Tailwind Labs (Adam Wathan)
- Vercel (shadcn/ui)
- Playwright Team (Microsoft)
- Docker Inc.

### Filosofía del Proyecto
**Acuarios Paradise:** Herramientas profesionales de tope de gama con valores cristianos.

> *"Todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres."*
> — Colosenses 3:23

---

## 📞 Contacto

- **Website:** [acuariosparadise.com]
- **Email:** info@acuariosparadise.com
- **Support:** support@acuariosparadise.com
- **GitHub:** [SamuelERS/cashguard-paradise]

---

## 📊 Estado Último Update

```
Fecha:          01 Octubre 2025 ~22:30 PM
Tests:          229/229 passing (100%)
Coverage:       34% (Branches: 61%)
CI Status:      🟢 Verde
Último Commit:  1a989e9 - Complete GuidedInstructionsModal timeout hotfix
Próximo Hito:   useTimingConfig.ts (cierra Bug #6)
```

**Últimos commits:**
```
1a989e9 - fix: Complete GuidedInstructionsModal timeout hotfix (2 missing timeouts)
9de5cb8 - feat: Add useInputValidation integration tests + ESLint v9 migration
```

---

**Desarrollado con 💙 por Acuarios Paradise**
**Gloria a Dios por cada línea de código funcionando** 🙏

---

## 🔗 Enlaces Rápidos

- [Lovable Project](https://lovable.dev/projects/667927cc-1c4b-4717-9add-8be16c85c2de)
- [GitHub Repository](https://github.com/SamuelERS/cashguard-paradise)
- [Docker Hub](https://hub.docker.com/) (próximamente)
- [Documentación Completa](./Documentos%20MarkDown/)

---

## 📋 Checklist de Desarrollo

### Para nuevos desarrolladores:
- [ ] Clonar repositorio
- [ ] Instalar Docker Desktop
- [ ] Ejecutar `./Scripts/docker-commands.sh dev`
- [ ] Leer CLAUDE.md (contexto completo)
- [ ] Ejecutar `./Scripts/docker-test-commands.sh test`
- [ ] Familiarizarse con arquitectura Wizard V3

### Para contribuciones:
- [ ] Crear branch desde `main`
- [ ] Implementar feature con tests
- [ ] Ejecutar tests: `./Scripts/docker-test-commands.sh test`
- [ ] Validar ESLint: `npm run lint`
- [ ] Commit con mensaje convencional
- [ ] Push y crear PR
- [ ] Esperar aprobación CI/CD (GitHub Actions)

---

**¿Preguntas?** Abre un issue en GitHub o contacta al equipo de soporte.
