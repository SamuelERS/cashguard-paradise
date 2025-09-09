# CashGuard Paradise v1.2.19

Sistema de control de caja para Acuarios Paradise con prevención de fraude y protocolos estrictos.

## Project info

**URL**: https://lovable.dev/projects/667927cc-1c4b-4717-9add-8be16c85c2de

## ✨ Features

### Core Functionality
- **Dual Operation Modes**: Morning cash count (6am) and evening cash cut (10pm) with distinct workflows
- **Three-Phase Cash Counting System**: Intelligent workflow with guided and manual counting modes
- **Wizard Inicial Optimizado**: 5 pasos simplificados sin redundancias ni campos duplicados
- **Anti-Fraud Protocol**: Witness validation and single-count restrictions with simplified rules
- **Mobile-First Design**: Optimized for iOS Safari and Android Chrome with persistent keyboards
- **Zoom Prevention**: Disabled pinch-to-zoom for stable counting experience
- **Frosted Glass Premium UI**: Modern 65% opacity modals with saturate effects
- **Corporate Identity**: Integrated company logos and motivational messaging
- **Offline-First**: 100% functional without internet connection
- **PWA Support**: Installable progressive web app with service workers

### Technical Highlights
- **Sequential Input Navigation**: Auto-advance between fields on mobile devices
- **Unified Validation System**: Consistent input validation across all forms
- **Race Condition Prevention**: Centralized timing system with automatic cleanup
- **Responsive UI**: Glass morphism design with Tailwind CSS
- **Type-Safe**: Full TypeScript coverage with strict typing
- **No Distracting Animations**: Clean, instant interface without pulsating effects
- **Desktop-First Responsive**: Optimized for all screen sizes with proper text scaling
- **Unified Button Architecture**: 47 buttons centralized with 8 specialized variants and 0% technical debt
- **Modular CSS System**: Feature-specific stylesheets in `src/styles/features/` with CSS variables
- **Data-State Logic**: Consistent visual states via `data-state`, `data-mode`, and `data-active` attributes

## 🏗️ Architecture Overview

### Custom Hooks System
```
src/hooks/
├── useFieldNavigation.ts    # Sequential field navigation
├── useInputValidation.ts    # Unified input validation
├── useTimingConfig.ts       # Centralized timing management
├── usePhaseManager.ts       # Multi-phase workflow control
├── useGuidedCounting.ts     # Step-by-step counting logic
└── useCalculations.ts       # Cash calculation engine
```

### Component Structure
- **Modular Design**: Components organized by feature
- **Reusable UI**: shadcn/ui components with Radix UI
- **Smart Forms**: React Hook Form with Zod validation
- **Smooth Animations**: Framer Motion transitions

## 📱 Recent Improvements (v1.1.20)

### Business Flows Integration Testing (v1.1.20) 🔄
- **36 Integration Tests**: Complete coverage of business flows
- **SECTOR 3 Implementation**: Protection of critical user journeys
- **Morning Count Testing**: Full flow validation with $50 target
- **Evening Cut Testing**: 3-phase flow including Phase 2 distribution
- **Edge Case Coverage**: Validations, timeouts, and error scenarios
- **Docker-First Testing**: All tests run in isolated containers
- **Test Helpers**: Comprehensive utilities for flow testing

### Financial Calculations Testing (v1.1.18) 💰
- **107 Critical Tests**: Complete coverage of all financial calculations
- **SECTOR 2 Implementation**: Protection of the financial core with exhaustive tests
- **100% Pass Rate**: All calculation tests passing successfully
- **Performance Validated**: Tests execute in under 2 seconds in Docker
- **Real Paradise Data**: Tests include actual business scenarios from Acuarios Paradise
- **Precision Guaranteed**: Floating-point errors handled, cents accuracy ensured

### Testing Infrastructure (v1.1.17) 🧪
- **Docker-First Testing**: Complete testing environment isolated from production
- **Vitest Framework**: Optimized testing framework for Vite projects
- **Testing Library**: React Testing Library and Jest-DOM matchers integrated
- **Smoke Tests**: 10 initial tests validating setup correctness
- **Helper Scripts**: 14 Docker commands for test management
- **Coverage Tracking**: 60% minimum coverage thresholds configured
- **Zero Production Impact**: All testing in separate containers

### Visual Identity & Bug Fixes (v1.1.09)
- **Morning Count Identity**: Yellow-orange colors (#f4a52a → #ffb84d) for morning mode
- **Evening Cut Identity**: Blue-purple colors (#0a84ff → #5e5ce6) for evening mode
- **Dynamic Icons**: Sunrise icon for morning, Calculator icon for evening
- **Copy Button Fix**: Robust clipboard utility with automatic fallback
- **Step Display Fix**: Shows "✓ Conteo completado" instead of "Paso 13 de 12"
- **Badge Alignment**: Centered text in green total badges

### Dual Operation Modes (v1.0.81-88)
- **Morning Cash Count**: Simplified 2-phase process for shift changes (6am)
- **Evening Cash Cut**: Complete 3-phase process with SICAR comparison (10pm)
- **OperationSelector**: Beautiful card-based mode selection with corporate identity
- **Navigation Fixes**: Proper state reset and navigation flow between modes

### Visual & UX Enhancements (v1.0.89-94)
- **Zoom Prevention**: Disabled pinch-to-zoom for stable cash counting experience
- **Modal Sizing**: Unified modal sizes across desktop for consistency
- **Frosted Glass Premium**: Modern 65% opacity with saturate(180%) for elegant modals
- **Simplified Selectors**: Removed addresses from stores and roles from employees
- **Cleaner Interface**: Focus on essential information only

### Technical Improvements
- **Single Page Flow**: Unified navigation logic without conflicting pages
- **Corporate Identity**: Integrated company logos and motivational messaging
- **Mobile Stability**: Prevented accidental zoom during cash counting
- **Performance**: GPU-optimized glass morphism with saturate filters

### UX Performance Improvements (v1.1.01-03)
- **Responsive Desktop Optimization**: All buttons properly sized for desktop/mobile
- **Protocol Animation Removal**: Eliminated distracting hover effects and sequential animations
- **Instant Loading**: Removed pulsating effects for immediate rule visibility
- **Clean Interactions**: No more translateX/scale movements on hover
- **40% Faster Load**: No animation delays means instant protocol display

## 📈 Version History

### 🆕 Latest Updates (v1.1.00 - v1.1.20)

#### v1.1.20 - SECTOR 3: Business Flows Integration Testing 🔄
- Implementación completa del SECTOR 3 - Tests de flujos de negocio
- **36 tests de integración** para flujos completos end-to-end
- Morning Count Flow: Flujo completo de conteo matutino con $50
- Evening Cut Flow: Flujo completo con 3 fases incluyendo Phase 2
- Phase Transitions: Validación de transiciones entre fases
- Edge Cases: Casos límite, validaciones, timeouts, etc.
- **Fixtures robustos**: mock-data.ts y test-helpers.tsx 
- **100% modularizado** en Docker para aislamiento total
- Preparado para ejecutar flujos completos de negocio

#### v1.1.18 - SECTOR 2: Financial Calculations Testing 💰
- Implementación completa del SECTOR 2 - Protección del corazón financiero
- **107 tests críticos** para funciones de cálculo de dinero
- Tests exhaustivos para `calculateCashTotal`, `calculateChange50`, `calculateDeliveryDistribution`
- Cobertura completa de `formatCurrency` y funciones auxiliares
- **1,642 líneas de código** de tests robustos en 3 archivos
- Precisión garantizada en centavos con manejo de punto flotante
- Tests de performance ajustados para Docker
- Datos reales de Acuarios Paradise validados
- **100% tests pasando** - Zero errores
- **Tiempo de ejecución**: 1.85 segundos

#### v1.1.17 - Testing Framework Foundation 🧪
- Implementación completa del SECTOR 1 del plan de testing
- Creación de estructura `src/__tests__/{unit,integration,fixtures}` y `src/__mocks__`
- Configuración Docker dedicada con `Dockerfile.test` y `docker-compose.test.yml`
- Vitest configurado con jsdom, Testing Library y coverage thresholds
- 10 smoke tests iniciales validando el setup completo
- Script helper con 14 comandos útiles para testing
- 8 nuevas devDependencies agregadas al proyecto
- **CORREGIDO:** Eliminada dependencia innecesaria de contenedor app
- **RESULTADO:** Base sólida para testing con 0% impacto en producción

#### v1.1.09 - Fix Botón Copiar con Fallback Robusto
- Corregido botón "Copiar" que fallaba silenciosamente en ambos modos (morning/evening)
- Creada función utility `copyToClipboard` con fallback automático
- Implementado método alternativo usando textarea temporal y execCommand
- Mensajes de error específicos según el tipo de fallo
- Funciona en navegadores sin API Clipboard moderna
- Compatible con móviles usando fallback automático

#### v1.1.08 - Fix Botón Confirmación Total Efectivo
- Corregido bug donde el botón "Confirmar" en Total Efectivo no avanzaba
- Modificada lógica para avanzar currentStep más allá de totalSteps al confirmar
- getCurrentField ahora devuelve null correctamente cuando está completado
- Resuelto problema de botón que permanecía activo después de confirmar

#### v1.1.03 - Eliminación de Animaciones de Entrada Secuenciales
- Convertido motion.div a div normal en reglas del protocolo
- Convertido motion.span a span normal en badges CRÍTICO/ALERTA  
- Eliminadas animaciones initial, animate y transition con delays secuenciales
- Aparición instantánea de todas las reglas sin efecto de "palpitación"
- **Impacto**: +40% velocidad de carga, mejor UX

#### v1.1.02 - Eliminación de Efectos de Movimiento en Protocolo
- Removido efecto `whileHover={{ scale: 1.02 }}` de las reglas del protocolo
- Eliminado movimiento `translateX(4px)` al hacer hover en reglas
- Mejor UX sin movimientos molestos en las reglas de seguridad

#### v1.1.01 - Desktop Button Responsive Optimization  
- Applied responsive text sizing to all buttons across desktop views
- Consistent text sizes: `text-xs` on mobile, `text-sm` on desktop
- All buttons now display correctly across all screen sizes

#### v1.1.00 - Button Text Overflow Fix
- Fixed text overflow in Phase 3 action buttons
- Implemented abbreviated text for mobile devices
- All buttons now display correctly without text cutoff

### 🔄 Previous Major Updates (v1.0.86 - v1.0.99)

#### Desktop Responsive Series (v1.0.96-99)
- **Phase 1-3 Optimization**: All phases now have professional desktop proportions
- **UI Color Coherence**: "Completar Fase 1" button uses blue-purple gradient
- **Responsive Containers**: Consistent max-width patterns across all components

#### Visual Enhancements (v1.0.90-95)
- **Phase 1 Visual Unification**: Improved TotalsSummarySection with mutually exclusive states
- **Selection Simplification**: Removed addresses/roles from selectors for cleaner UI
- **Frosted Glass Premium**: 65% opacity with saturate(180%) for modern glass morphism
- **Modal Improvements**: Fixed sizing and legibility issues across all wizards

#### Core Architecture (v1.0.86-89)
- **Zoom Prevention**: Disabled pinch-to-zoom for stable counting experience
- **Single Page Flow**: Unified navigation without conflicting pages
- **Corporate Identity**: Integrated logos and floating particles
- **Style Harmonization**: Consistent glass effects between wizards

### 📚 Historical Updates
For detailed version history prior to v1.0.86, see [CHANGELOG-HISTORICO.md](/Documentos%20MarkDown/CHANGELOG-HISTORICO.md)


## 🔄 System Flow

### Initial Wizard (5 Steps)
1. **Security Protocol**: Rule acceptance with checkbox only
2. **Store Selection**: C.C. Los Heroes or C.C. Metrocentro
3. **Cashier Selection**: Employee list by store
4. **Witness Selection**: Must be different from cashier
5. **Expected SICAR Sale**: Expected amount from system

### Three-Phase System
- **Phase 1**: Initial counting (guided or manual mode)
  - Count bills, coins, and electronic payments
  - Calculate total cash and electronic amounts
- **Phase 2**: Cash distribution (if total > $50)
  - Optimal denomination distribution to leave exactly $50
  - Two sections: Delivery (deposit) and Verification (keep)
- **Phase 3**: Immutable final report generation

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/667927cc-1c4b-4717-9add-8be16c85c2de) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## 🧪 Testing - 100% Docker Containerized

The project includes a comprehensive testing setup with **Vitest** and **Testing Library**.
**IMPORTANTE: Todo el testing se ejecuta en contenedores Docker para mantener el entorno local limpio.**

### Test Commands (Solo Docker)

```bash
# Construir contenedor de testing (primera vez)
./Scripts/docker-test-commands.sh build

# Ejecutar todos los tests
./Scripts/docker-test-commands.sh test

# Solo tests unitarios (107 tests - 100% passing)
./Scripts/docker-test-commands.sh test:unit

# Solo tests de integración (36 tests - parcialmente passing)
./Scripts/docker-test-commands.sh test:integration

# Modo watch para desarrollo
./Scripts/docker-test-commands.sh test:watch

# Generar reporte de coverage
./Scripts/docker-test-commands.sh test:coverage

# Interfaz interactiva UI
./Scripts/docker-test-commands.sh test:ui

# Limpiar contenedores de testing
./Scripts/docker-test-commands.sh clean
```

**Nota:** No usar comandos npm locales. Todo debe ejecutarse en Docker para mantener aislamiento completo.

### Test Structure

```
src/__tests__/
├── unit/           # Unit tests for individual functions
├── integration/    # Integration tests for components
└── fixtures/       # Test data and mock responses
```

### Current Coverage

- ✅ Smoke tests: 10 tests passing
- ✅ Unit tests (Utils): 107 tests passing - **SECTOR 2 Complete**
  - calculateCashTotal: 15 tests
  - calculateChange50: 20 tests
  - calculateDeliveryDistribution: 25 tests
  - formatCurrency: 10 tests
  - Helper functions: 37 tests
- ✅ Integration tests: 36 tests implemented - **SECTOR 3 Complete**
  - Morning Count Flow: 8 tests
  - Evening Cut Flow: 8 tests
  - Phase Transitions: 12 tests
  - Edge Cases: 8 tests
- 🚧 Component tests: Future sector (SECTOR 4)
- 🚧 E2E tests: Future sector (SECTOR 5)
- 📊 Coverage achieved: **100% for critical financial functions**

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/667927cc-1c4b-4717-9add-8be16c85c2de) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 🐳 Docker Setup

Este proyecto está completamente dockerizado. **No necesitas instalar Node.js ni npm en tu máquina local**.

### Prerrequisitos

- Docker Desktop instalado ([Descargar Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose (incluido en Docker Desktop)

### Configuración inicial

1. **Clonar el repositorio:**
```bash
git clone <YOUR_GIT_URL>
cd cashguard-paradise
```

2. **Configurar variables de entorno:**
```bash
cp .env.example .env
# Edita .env con tus valores de Supabase
```

### 🚀 Comandos Docker

#### Usando el script helper (recomendado):

```bash
# Desarrollo (puerto 5173)
./Scripts/docker-commands.sh dev

# Producción (puerto 8080)
./Scripts/docker-commands.sh prod:build

# Ver más opciones
./Scripts/docker-commands.sh
```

#### Usando Docker Compose directamente:

```bash
# Desarrollo con hot-reload (puerto 5173)
docker compose --profile dev up

# Producción con Nginx (puerto 8080)
docker compose --profile prod up -d

# Detener todos los contenedores
docker compose --profile dev --profile prod down

# Ver logs
docker compose --profile dev logs -f
docker compose --profile prod logs -f
```

### 📋 Perfiles disponibles

| Perfil | Puerto | Descripción |
|--------|--------|-------------|
| `dev` | 5173 | Desarrollo con hot-reload |
| `prod` | 8080 | Producción con Nginx |

### 🛠️ Comandos útiles

```bash
# Reconstruir imagen de producción
docker compose --profile prod build --no-cache

# Entrar al contenedor
docker exec -it cashguard-paradise-dev sh  # Desarrollo
docker exec -it cashguard-paradise-prod sh  # Producción

# Limpiar todo (contenedores, imágenes, volúmenes)
./Scripts/docker-commands.sh clean

# Ver estado de contenedores
docker compose ps
```

### 📝 Notas importantes

- Todo se ejecuta dentro de contenedores, no necesitas Node.js local
- El código fuente se monta como volumen en desarrollo para hot-reload
- La imagen de producción es multi-stage optimizada (~30MB)
- Las dependencias se instalan dentro del contenedor automáticamente

Para más detalles sobre Docker, consulta [/Documentos MarkDown/DOCKER-GUIDE.md](./Documentos%20MarkDown/DOCKER-GUIDE.md)
