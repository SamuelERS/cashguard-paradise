# TECHNICAL SPECIFICATIONS - CashGuard Paradise

Especificaciones técnicas detalladas extraídas del CLAUDE.md principal para optimizar el rendimiento del archivo de documentación.

## 🐳 Docker Configuration Detallada

### Containerización completa

El proyecto está completamente dockerizado y NO requiere Node.js instalado localmente:

- **Desarrollo**: Contenedor Node.js con hot-reload en puerto 5173
- **Producción**: Nginx Alpine sirviendo archivos estáticos en puerto 8080
- **Multi-stage build**: Optimización de imagen final (~30MB)

### Comandos Docker principales

- **Script helper:** `./Scripts/docker-commands.sh` (dev, prod:build)
- **Docker Compose directo:** Perfiles dev/prod disponibles

### Estructura Docker

```
/
├── Dockerfile              # Multi-stage build (node:20-alpine + nginx:alpine)
├── docker-compose.yml      # Perfiles dev y prod
├── .dockerignore          # Optimización de contexto
├── .env.example           # Variables de entorno
├── infra/
│   └── nginx.conf         # Configuración optimizada para SPA
└── Scripts/
    └── docker-commands.sh # Script helper para comandos Docker
```

### Variables de entorno

Las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` se pasan tanto en build como en runtime.

### Notas de desarrollo con Docker

- Las dependencias se instalan DENTRO del contenedor
- El código fuente se monta como volumen en desarrollo
- Los cambios se reflejan automáticamente (hot-reload)
- No se necesita ejecutar `npm install` localmente

## 🏗️ Architecture Detallada

### Core Technologies
- **Build Tool**: Vite with React SWC plugin
- **Framework**: React 18 with TypeScript
- **Routing**: React Router v6
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom glass morphism theme
- **State Management**: React hooks with local storage persistence
- **Animations**: Framer Motion
- **Forms**: React Hook Form with Zod validation

### Project Structure Completa

```
src/
├── components/          # UI components organized by feature
│   ├── cash-counting/  # Bill, coin, and electronic payment sections
│   │   ├── BillInputSection.tsx
│   │   ├── CoinInputSection.tsx
│   │   ├── GuidedFieldView.tsx
│   │   ├── GuidedDenominationItem.tsx
│   │   └── TotalsSummarySection.tsx
│   ├── phases/         # Phase 2 delivery and verification components
│   │   ├── Phase2Manager.tsx
│   │   ├── Phase2DeliverySection.tsx
│   │   └── Phase2VerificationSection.tsx
│   ├── morning-count/  # Morning count specific components
│   │   ├── MorningCountWizard.tsx
│   │   └── MorningVerification.tsx
│   ├── operation-selector/ # Operation mode selection
│   │   └── OperationSelector.tsx
│   └── ui/            # shadcn/ui components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── select.tsx
│       └── ...
├── hooks/             # Custom React hooks
│   ├── usePhaseManager.ts      # Multi-phase workflow management
│   ├── useGuidedCounting.ts    # Guided counting logic
│   ├── useCalculations.ts      # Cash calculation logic
│   ├── useLocalStorage.ts      # Persistent state management
│   ├── useOperationMode.ts     # Operation mode management
│   └── useTimingConfig.ts      # Timing configurations
├── types/             # TypeScript type definitions
│   ├── operation-mode.ts       # Operation mode types
│   └── cash-types.ts          # Cash counting types
├── utils/             # Utility functions
│   ├── calculations.ts         # Core cash calculations
│   ├── deliveryCalculation.ts  # Phase 2 delivery distribution
│   ├── clipboard.ts           # Clipboard utilities
│   └── formatters.ts          # Data formatters
└── data/             # Static data (stores, employees)
    └── paradise.ts           # Store and employee data
```

## 🎨 CSS System - Glass Morphism Design

### Variables CSS centralizadas

```css
:root {
  /* Espaciados responsive */
  --spacing-xs: clamp(6px, 1.5vw, 10px);
  --spacing-sm: clamp(10px, 2.5vw, 14px);
  --spacing-md: clamp(12px, 3vw, 16px);
  --spacing-lg: clamp(16px, 4vw, 20px);
  --spacing-xl: clamp(20px, 5vw, 24px);
  --spacing-xxl: clamp(24px, 6vw, 32px);

  /* Tipografía responsive */
  --text-xs: clamp(0.75rem, 2vw, 0.875rem);
  --text-sm: clamp(0.875rem, 2.5vw, 1rem);
  --text-base: clamp(1rem, 3vw, 1.125rem);
  --text-lg: clamp(1.05rem, 3.5vw, 1.125rem);
  --text-xl: clamp(1.125rem, 4vw, 1.25rem);
  --text-2xl: clamp(1.25rem, 5vw, 1.5rem);

  /* Controles unificados */
  --input-height: clamp(36px, 8vw, 42px);
  --button-height: clamp(38px, 8vw, 44px);

  /* Iconos coherentes */
  --icon-xs: clamp(12px, 3vw, 16px);
  --icon-sm: clamp(16px, 4vw, 20px);
  --icon-md: clamp(20px, 5vw, 24px);
  --icon-lg: clamp(24px, 6vw, 32px);
  --icon-xl: clamp(32px, 8vw, 40px);

  /* Glass morphism estandarizado */
  --glass-bg-primary: rgba(36, 36, 36, 0.4);
  --glass-bg-secondary: rgba(25, 25, 25, 0.65);
  --glass-blur: blur(20px);
  --glass-border: rgba(255, 255, 255, 0.15);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  /* Radios consistentes */
  --radius-sm: clamp(4px, 1vw, 6px);
  --radius-md: clamp(6px, 1.5vw, 8px);
  --radius-lg: clamp(8px, 2vw, 12px);
}
```

### Clases CSS modulares principales

```css
/* CashCounter System */
.cash-counter-container {
  min-height: clamp(280px, 55vh, 380px);
  max-width: clamp(320px, 90vw, 44rem);
  padding: var(--spacing-md);
}

.cash-counter-header {
  margin-bottom: var(--spacing-xs);
  gap: var(--spacing-xs);
}

/* GuidedProgressIndicator System */
.guided-progress-container {
  padding: var(--spacing-sm);
  background: var(--glass-bg-primary);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.guided-progress-badge {
  width: clamp(24px, 5vw, 28px);
  height: clamp(24px, 5vw, 28px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  font-size: var(--text-xs);
}

.guided-progress-bar {
  height: 0.375rem;
  box-shadow: 0 0 10px currentColor;
  background: rgba(255,255,255,0.05);
  border-radius: var(--radius-sm);
}

/* GuidedFieldView System */
.guided-field-container {
  max-width: clamp(320px, 90vw, 44rem);
  padding: var(--spacing-md);
}

.guided-field-icon {
  width: clamp(40px, 9vw, 48px);
  height: clamp(40px, 9vw, 48px);
  border-radius: var(--radius-md);
}

.guided-field-icon.coin {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  border: 1px solid rgba(255, 215, 0, 0.3);
  box-shadow: 0 4px 16px rgba(255, 215, 0, 0.25);
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.guided-field-section-progress {
  background: rgba(10, 132, 255, 0.05);
  border-radius: var(--radius-sm);
  padding: var(--spacing-xs);
  font-size: var(--text-sm);
  font-weight: 500;
}

/* Wizard Modal System */
.wizard-modal-content {
  margin: clamp(8px, 2vw, 16px) auto;
  max-width: calc(100vw - clamp(16px, 4vw, 32px));
  max-height: calc(100vh - clamp(16px, 4vw, 32px));
  background: var(--glass-bg-secondary);
  backdrop-filter: var(--glass-blur) saturate(180%);
  border: 1px solid var(--glass-border);
  box-shadow: var(--glass-shadow);
}

.wizard-step-container {
  padding: var(--spacing-lg);
  gap: var(--spacing-md);
}

.wizard-header-section {
  background: var(--glass-bg-primary);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
}

.wizard-select-trigger {
  height: var(--input-height);
  padding: 0 var(--spacing-sm);
  font-size: var(--text-base);
  border-radius: var(--radius-md);
}

.wizard-select-content {
  z-index: 60;
  background: var(--glass-bg-secondary);
  backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
}
```

## 🔧 Key Business Logic Implementada

### Initial Wizard Flow Detallado:
- **Step 1**: Protocol acceptance (4 simplified rules, "ready" variant for enabled state)
  - Timing: 2s inicial + activación secuencial
  - Validación: Checkbox obligatorio + confirmación
  - Estados: pending → activating → active → completed
- **Step 2-4**: Improved select dropdowns with visible white borders
- **Step 2**: Store selection (Paradise locations)
- **Step 3**: Cashier selection (must be different from witness)
- **Step 4**: Witness selection (validation against cashier)
- **Step 5**: Expected sales amount from SICAR system (numeric input with validation)

### Three-Phase Cash Counting System Detallada:

#### Phase 1: Initial Cash Counting
- **Guided Mode:** 17 campos (evening) / 12 campos (morning)
- **Field Order:** Bills → Coins → Electronic (evening only)
- **Validation:** Type safety, numeric input, anti-fraud timing
- **States:** pending → active → completed → locked

#### Phase 2: Cash Delivery Process (when total > $50)
- **Algorithm:** Optimal denomination distribution
- **Target:** Exactly $50 remaining
- **Sections:** 
  - Delivery: What to deposit (calculated automatically)
  - Verification: What to keep (user confirms)
- **Logic:** Minimizes small denominations, maximizes large bills for deposit

#### Phase 3: Final Report Generation
- **Morning Report:** Compares with $50 expected
- **Evening Report:** Compares with SICAR expected sales
- **Format:** WhatsApp compatible text + clipboard copy
- **Actions:** Share, Download, Copy, Complete

## 🔒 Anti-Fraud Measures Implementadas

### Sistema Ciego Completo:
- **No preview totals:** Durante Phase 1, nunca se muestran totales parciales
- **Auto-confirmation:** Pasos 16-17 se confirman automáticamente
- **Immutable fields:** Una vez confirmado, no se puede modificar
- **Sequential validation:** Orden obligatorio de denominaciones

### Security Patterns:
- **Single count restriction:** Una sesión por conteo
- **Witness validation:** Cajero ≠ Testigo (validación obligatoria)
- **Timing controls:** Delays anti-manipulación en inputs críticos
- **Alert system:** Discrepancias > $3.00 generan alertas automáticas
- **Pattern detection:** Detección de faltantes consecutivos

## 📱 Mobile UX Optimizations Técnicas

### Keyboard Management:
```typescript
// PWA Detection
const isPWA = window.matchMedia('(display-mode: standalone)').matches;

// Input Configuration
<input
  type="tel"
  inputMode="numeric"
  autoCapitalize="off"
  autoCorrect="off"
  autoComplete="off"
/>

// Focus Management with Timing
const focusDelay = isPWA ? 300 : 100;
setTimeout(() => inputRef.current?.focus(), focusDelay);
```

### Touch Optimization:
```css
/* Prevent zoom on touch */
input[type="tel"] {
  font-size: 16px; /* Prevents iOS zoom */
  touch-action: manipulation;
}

/* Viewport configuration */
<meta name="viewport" 
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, interactive-widget=resizes-content" />
```

### Sequential Navigation:
- **Auto-progression:** Campo completado → siguiente automáticamente
- **Focus management:** useRef + useEffect para control preciso
- **Touch targets:** Mínimo 44px × 44px para todos los controles
- **Responsive scaling:** clamp() para todos los elementos táctiles

## 🧪 Testing Infrastructure

### SECTOR 1: Framework Foundation
- **Vitest:** Framework principal optimizado para Vite
- **Testing Library:** @testing-library/react + jsdom
- **Docker:** Contenedor aislado sin dependencias locales
- **Coverage:** c8 integrado con reportes HTML

### SECTOR 2: Financial Calculations (107 tests)
```typescript
// Ejemplo de test crítico
describe('calculateCashTotal', () => {
  it('should handle precision to cents', () => {
    const result = calculateCashTotal({
      bills: { 1: 3, 5: 2 },
      coins: { 0.25: 3, 0.01: 7 }
    });
    expect(result).toBeCloseTo(13.82, 2);
  });
});
```

### SECTOR 3: Integration Testing (36 tests)
- **Morning flow:** 8 tests - Flujo completo con $50
- **Evening flow:** 8 tests - 3 fases incluyendo distribución
- **Edge cases:** 8 tests - Validaciones límite
- **Phase transitions:** 12 tests - Lógica de transición

### SECTOR 4: E2E Testing (24 tests)
- **Playwright:** Browser automation en contenedor
- **Puerto:** 5175 (separado de dev 5173)
- **Scenarios:** PWA install, visual regression, performance
- **Screenshots:** Comparación visual automática

### SECTOR 5: CI/CD Pipeline
```yaml
# GitHub Actions example
name: Complete Test Suite
on: [push, pull_request]
jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Unit Tests
        run: ./Scripts/docker-test-commands.sh test
```

## 🔄 State Management Patterns

### usePhaseManager Pattern:
```typescript
interface PhaseManager {
  currentPhase: 1 | 2 | 3;
  skipPhase2: boolean;
  deliveryDistribution: DeliveryData;
  transitionToPhase: (phase: number) => void;
  resetAllPhases: () => void;
}
```

### useGuidedCounting Pattern:
```typescript
interface GuidedCounting {
  currentStep: number;
  totalSteps: number;
  fieldOrder: FieldType[];
  isFieldCompleted: (field: string) => boolean;
  handleFieldConfirm: (field: string, value: number) => void;
}
```

### useLocalStorage Pattern:
```typescript
function useLocalStorage<T>(key: string, initialValue: T) {
  // Automatic serialization/deserialization
  // Error handling for corrupt data
  // Cleanup on unmount
}
```

## 🎯 Performance Optimizations

### Bundle Size:
- **Tree shaking:** Vite automático
- **Code splitting:** Lazy loading de routes
- **Asset optimization:** Imagen compression + WebP
- **CSS purging:** Tailwind unused classes removal

### Runtime Performance:
```typescript
// Memoization patterns
const memoizedCalculation = useMemo(() => 
  calculateCashTotal(fieldValues), [fieldValues]);

const stableCallback = useCallback((value: number) => 
  updateField(currentStep, value), [currentStep]);

// Animation optimization
<AnimatePresence initial={false} mode="wait">
  {/* Content with reduced layout thrashing */}
</AnimatePresence>
```

### Memory Management:
- **Cleanup effects:** Todos los intervals/timeouts limpiados
- **Event listeners:** Removal automático en useEffect cleanup
- **Large objects:** Weak references donde es apropiado

---

## Referencias

Para documentación adicional:
- [CLAUDE.md](/CLAUDE.md) - Documentación principal optimizada
- [CHANGELOG-DETALLADO.md](/Documentos%20MarkDown/CHANGELOG-DETALLADO.md) - Historial de versiones
- Código fuente en `/src` para implementaciones específicas