# Reglas de Desarrollo v3.1

**Estándares técnicos para CashGuard Paradise - Paradise System Labs**

> **Audiencia:** Todos los desarrolladores (humanos e IAs)
> **Tipo:** Referencia técnica - Define CÓMO se escribe código
> **Última actualización:** 2026-01-23

---

## Qué es este documento

Este documento define los **estándares técnicos de código** que todos los desarrolladores deben seguir. Es la referencia autoritativa para:

- Convenciones de código
- Reglas de TypeScript
- Métricas de calidad
- Flujo de trabajo Git

**Documentos relacionados:**
- [REGLAS_DE_LA_CASA.md](./REGLAS_DE_LA_CASA.md) - Gobernanza y filosofía (para entender el POR QUÉ)
- [REGLAS_PROGRAMADOR.md](REGLAS_PROGRAMADOR.md) - Ejemplos prácticos y tutoriales (para ver el CÓMO en detalle)

---

## Stack Tecnológico Oficial

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Node.js** | >= 20.x | Runtime |
| **TypeScript** | 5.x | Lenguaje |
| **React** | 18.x | Frontend PWA |
| **Vite** | 5.x | Build tool + Dev server |
| **VitePWA** | Latest | Service Worker + Manifest |
| **shadcn/ui** | Latest | Componentes UI |
| **Tailwind CSS** | 3.x | Estilos |
| **Framer Motion** | 11.x | Animaciones |
| **Vitest** | Latest | Testing |
| **Playwright** | Latest | E2E Testing |

---

## Regla de Oro: CERO `any`

```typescript
// ❌ PROHIBIDO
const data: any = response;
function process(input: any): any { }
catch (error: any) { }

// ✅ OBLIGATORIO - Usar tipos definidos en /src/types/
import { CashCount, CalculationData, PhaseState } from '@/types';

function calculateTotal(denominations: CashCount): number {
  // Implementación tipada
}

// ✅ Para errores usar 'unknown'
catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
}
```

---

## Diccionario Oficial de Tipos

Todos los tipos **DEBEN** importarse de `/src/types/`:

| Archivo | Tipos Disponibles | Uso |
|---------|-------------------|-----|
| `cash.ts` | `CashCount`, `Denomination`, `DenominationValue` | Denominaciones USD |
| `calculations.ts` | `CalculationData`, `ElectronicPayments` | Cálculos financieros |
| `phases.ts` | `PhaseState`, `DeliveryCalculation`, `VerificationBehavior` | Flujo de fases |
| `verification.ts` | `VerificationStep`, `AttemptHistory`, `VerificationSeverity` | Verificación ciega |
| `expenses.ts` | `DailyExpense`, `ExpenseCategory` | Gastos del día |

```typescript
// ✅ Importar del diccionario
import {
  CashCount,
  CalculationData,
  PhaseState
} from '@/types';

// ✅ Extender tipos existentes
interface EnrichedCalculation extends CalculationData {
  verificationBehavior?: VerificationBehavior;
}

// ❌ NO redefinir tipos que ya existen
interface MyCashCount {  // PROHIBIDO
  penny: any;
  nickel: any;
}
```

---

## Estructura del Proyecto

```
cashguard-paradise/
├── src/                           ← CÓDIGO FUENTE
│   ├── components/                ← Componentes React
│   │   ├── cash-counting/         ← Módulo conteo (GuidedCountingFlow, etc.)
│   │   ├── phases/                ← Fases del proceso (Phase1, Phase2, Phase3)
│   │   ├── shared/                ← Componentes compartidos (Buttons, Modals)
│   │   └── ui/                    ← Componentes shadcn/ui
│   │
│   ├── hooks/                     ← Custom Hooks
│   │   ├── usePhaseManager.ts     ← Orquestación de fases
│   │   ├── useGuidedCounting.ts   ← Lógica conteo guiado
│   │   ├── useCalculations.ts     ← Cálculos financieros
│   │   └── useBlindVerification.ts ← Verificación ciega
│   │
│   ├── utils/                     ← Utilidades
│   │   ├── calculations.ts        ← Funciones de cálculo
│   │   ├── deliveryCalculation.ts ← Algoritmo entrega $50
│   │   └── formatters.ts          ← Formateo de moneda/fecha
│   │
│   ├── types/                     ← Definiciones TypeScript
│   ├── data/                      ← Datos estáticos (paradise.ts)
│   └── pages/                     ← Páginas principales
│
├── public/                        ← Assets estáticos
│   ├── icons/                     ← Iconos PWA
│   └── .htaccess                  ← Config Apache SiteGround
│
├── Scripts/                       ← Scripts de operación
├── docs/                          ← Documentación
├── Documentos_MarkDown/           ← Documentación extendida
└── Backups-RESPALDOS/             ← Respaldos obligatorios
```

### Reglas de Estructura

1. **NUNCA** crear archivos sueltos en la raíz del proyecto
2. **SIEMPRE** usar `/src/types/` para tipos compartidos
3. **MÁXIMO** 500 líneas por archivo (300 recomendado)
4. Scripts de operación van en `/Scripts/`

#### Excepciones Documentadas (Raíz del Proyecto)

Los siguientes archivos son **excepciones permitidas** en la raíz por ser estándar de la industria:

| Archivo | Justificación |
|---------|---------------|
| `package.json` | Manifiesto npm (obligatorio) |
| `tsconfig.json` | Configuración TypeScript |
| `vite.config.ts` | Configuración Vite + VitePWA |
| `tailwind.config.js` | Configuración Tailwind CSS |
| `vitest.config.ts` | Configuración testing |
| `eslint.config.js` | Configuración ESLint v9+ |
| `CLAUDE.md` | Estado del proyecto para IAs |
| `.gitignore` | Exclusiones Git |

---

## Convenciones de Código

### Nomenclatura

```typescript
// Variables: camelCase descriptivo
const userSessionToken = generateToken();
const activeConversations = await getActiveChats();

// Funciones: verbo + sustantivo, camelCase
async function fetchUserProfile(userId: string): Promise<UserProfile> { }
function validateEmailFormat(email: string): boolean { }

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;

// Clases: PascalCase
class MessageQueueService { }

// Archivos: kebab-case
// whatsapp-service.ts, message-handler.ts
```

### Funciones

```typescript
// ✅ BIEN: Función corta, una responsabilidad
function calculateCashTotal(denominations: CashCount): number {
  const values = getDenominationValues();
  return Object.entries(denominations).reduce((total, [denom, qty]) => {
    return total + (values[denom as Denomination] * qty);
  }, 0);
}

// ❌ MAL: Función gigante que hace todo
function processCount(data: any) {
  // 200 líneas mezclando validación, cálculo, formateo...
}
```

**Límites:**
- MÁXIMO 50 líneas por función
- Si excede, dividir en funciones más pequeñas

### Async/Await

```typescript
// ✅ BIEN: Paralelo cuando es posible (para operaciones independientes)
async function loadInitialData(): Promise<InitialData> {
  const [employees, branches, config] = await Promise.all([
    loadFromStorage('employees'),
    loadFromStorage('branches'),
    loadFromStorage('config')
  ]);
  return { employees, branches, config };
}

// ❌ MAL: Secuencial innecesario
async function loadData() {
  const employees = await loadFromStorage('employees'); // Espera
  const branches = await loadFromStorage('branches');   // Espera
  const config = await loadFromStorage('config');       // Espera
}

// ✅ BIEN: Secuencial cuando hay dependencias
async function processPhases(cashCount: CashCount) {
  const calculation = await calculateTotals(cashCount);  // Primero
  const delivery = await calculateDelivery(calculation); // Depende del anterior
  return { calculation, delivery };
}
```

### Manejo de Errores

```typescript
// ✅ BIEN: Try-catch específico con feedback usuario
function saveToLocalStorage(key: string, data: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage', { key, error });
    toast.error('Error al guardar datos localmente');
    return false;
  }
}

// ❌ MAL: Silenciar errores
try {
  await criticalOperation();
} catch (e) {
  // Nada - ERROR: el error se pierde
}

// ❌ MAL: Mostrar errores técnicos al usuario
catch (error) {
  toast.error(error.stack);  // Usuario no entiende stack traces
}
```

### Logs

```typescript
// ✅ BIEN: Logs estructurados con contexto (para debugging)
console.log('[Phase2Manager] Delivery completed', { amountDelivered, remaining });
console.warn('[Verification] Retry attempt', { denomination, attempt: 2, maxAttempts: 3 });
console.error('[Calculation] Invalid denomination', { key, value });

// ❌ MAL: Logs inútiles
console.log('here');
console.log(data);

// ✅ BIEN: Logs con prefijo de versión para tracking
// 🤖 [IA] - v1.3.6: FIX descripción del cambio
console.log('[DEBUG v1.3.6] Estado actual:', state);
```

---

## Testing

### Métricas de Coverage

| Tipo de Código | Coverage Mínimo | Target Ideal |
|----------------|-----------------|--------------|
| **Lógica de negocio crítica** | 80% | 95% |
| **APIs/Endpoints** | 70% | 85% |
| **Servicios** | 60% | 80% |
| **Utilidades** | 50% | 70% |
| **Configuración** | 30% | 50% |

### Reglas de Testing

1. **Un test por caso de uso**
2. **Tests independientes** (no dependen de orden)
3. **Nombres descriptivos**
4. **Patrón Arrange-Act-Assert**
5. **Mock de dependencias externas**

```typescript
describe('calculateCashTotal', () => {
  it('should calculate total correctly for all denominations', () => {
    // Arrange
    const cashCount: CashCount = {
      penny: 100,   // $1.00
      nickel: 20,   // $1.00
      dime: 10,     // $1.00
      quarter: 4,   // $1.00
      bill1: 1,     // $1.00
    };

    // Act
    const result = calculateCashTotal(cashCount);

    // Assert
    expect(result).toBe(5.00);
  });

  it('should return 0 for empty denominations', () => {
    const emptyCashCount: CashCount = {};

    expect(calculateCashTotal(emptyCashCount)).toBe(0);
  });

  it('should handle $50 change fund scenario', () => {
    const changeFund: CashCount = { /* 50 denominaciones */ };

    expect(calculateCashTotal(changeFund)).toBe(50.00);
  });
});
```

---

## Seguridad

### Checklist Obligatorio (PWA Client-Side)

#### Validación de Entrada
```typescript
// ✅ BIEN: Validar TODO input de usuario
function handleDenominationInput(value: string, max: number): number {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 0 || parsed > max) {
    return 0; // Valor seguro por defecto
  }
  return parsed;
}

// ❌ MAL: Confiar en el input
function handleInput(value: string) {
  return parseInt(value); // Puede ser NaN o negativo
}
```

#### localStorage Seguro
```typescript
// ✅ BIEN: Validar datos al recuperar
function loadFromStorage<T>(key: string, validator: (data: unknown) => data is T): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return validator(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

// ❌ MAL: Confiar en datos de localStorage
const data = JSON.parse(localStorage.getItem('data')!); // Puede fallar
```

#### Type Guards
```typescript
// ✅ BIEN: Usar type guards para datos externos
function isCashCount(data: unknown): data is CashCount {
  return typeof data === 'object' && data !== null &&
    Object.values(data).every(v => typeof v === 'number' && v >= 0);
}
```

---

## Flujo de Trabajo Git

### Branches
```
main              ← Producción (protegida)
├── develop       ← Desarrollo (protegida)
    ├── feature/add-user-auth
    ├── fix/message-queue-bug
    └── refactor/database-layer
```

### Commits

**Formato:**
```
<tipo>: <descripción corta>

<descripción detallada (opcional)>
```

**Tipos:**
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `refactor`: Refactorización
- `test`: Tests
- `docs`: Documentación
- `chore`: Mantenimiento

**Ejemplos:**
```bash
# ✅ BIEN
git commit -m "feat: add blind verification triple-attempt system"
git commit -m "fix: resolve race condition in Phase2Manager useEffect"

# ❌ MAL
git commit -m "fix"
git commit -m "update"
```

### Pull Request Template

```markdown
## Descripción
[Qué hace este PR]

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Refactorización

## Checklist
- [ ] Tests agregados/actualizados
- [ ] Todos los tests pasan
- [ ] Documentación actualizada
- [ ] Sin vulnerabilidades de seguridad
```

---

## Anti-Patrones

### God Objects
```typescript
// ❌ MAL: Clase que hace de todo
class Application {
  connectDatabase() { }
  sendEmail() { }
  processPayment() { }
  generateReport() { }
  // ... 50 métodos más
}

// ✅ BIEN: Separación de responsabilidades
class DatabaseService { }
class EmailService { }
class PaymentService { }
```

### Magic Numbers
```typescript
// ❌ MAL
if (status === 3) { }
setTimeout(() => { }, 86400000);

// ✅ BIEN
const STATUS_COMPLETED = 3;
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

if (status === STATUS_COMPLETED) { }
setTimeout(() => { }, ONE_DAY_MS);
```

### Callback Hell
```typescript
// ❌ MAL
getData(function(a) {
  getMoreData(a, function(b) {
    getEvenMoreData(b, function(c) { });
  });
});

// ✅ BIEN
const a = await getData();
const b = await getMoreData(a);
const c = await getEvenMoreData(b);
```

---

## Checklist del Desarrollador

Antes de crear PR, verificar:

### Código
- [ ] Nombres descriptivos
- [ ] Funciones < 50 líneas
- [ ] Sin código duplicado
- [ ] Sin magic numbers
- [ ] Formateado con Prettier
- [ ] Pasa ESLint

### TypeScript
- [ ] Sin uso de `any`
- [ ] Tipos explícitos en funciones públicas
- [ ] Compila sin errores

### Seguridad
- [ ] Sin credenciales hardcodeadas
- [ ] Input validado
- [ ] Errores manejados correctamente
- [ ] npm audit sin críticos

### Testing
- [ ] Tests unitarios agregados
- [ ] Coverage cumple mínimos
- [ ] Todos los tests pasan

### Git
- [ ] Commits atómicos
- [ ] Mensajes descriptivos
- [ ] Branch actualizado con develop

---

## Dependencias

### Reglas

1. **NO agregar dependencias** sin justificación
2. **SIEMPRE** verificar licencia
3. **PREFERIR** dependencias activamente mantenidas
4. **DOCUMENTAR** por qué se agregó

```bash
# Verificar vulnerabilidades
npm audit

# Ver dependencias
npm ls
```

---

## Métricas de Calidad

| Métrica | Objetivo | Herramienta |
|---------|----------|-------------|
| Test Coverage | > 70% | Vitest --coverage |
| Complejidad Ciclomática | < 10 | ESLint complexity |
| Líneas por función | < 50 | Review manual |
| Vulnerabilidades | 0 críticas | npm audit |
| Type coverage | 100% | TypeScript strict |

### Deuda Técnica Permitida

- ESLint warnings: Máximo 20 totales
- TypeScript `@ts-ignore`: Máximo 5 en todo el proyecto
- TODO comments: Máximo 30 en todo el proyecto

---

## Referencias

| Documento | Propósito |
|-----------|-----------|
| [REGLAS_DE_LA_CASA.md](./REGLAS_DE_LA_CASA.md) | Gobernanza y filosofía |
| [REGLAS_PROGRAMADOR.md](REGLAS_PROGRAMADOR.md) | Ejemplos prácticos detallados |
| [TypeScript Handbook](https://www.typescriptlang.org/docs/) | Documentación oficial |
| [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) | Guía de referencia |

---

## Historial de Versiones

### v3.1 (2026-01-23)
- Adaptado para CashGuard Paradise (PWA anti-fraude para retail)
- Actualizado stack tecnológico: React 18 + Vite + VitePWA + shadcn/ui + Tailwind
- Actualizado diccionario de tipos: CashCount, PhaseState, VerificationBehavior
- Actualizada estructura del proyecto para arquitectura PWA
- Cambiado testing de Jest a Vitest + Playwright
- Ejemplos actualizados con patrones CashGuard (localStorage, verificación ciega)

### v3.0 (2025-12-26)
- Unificado coverage de tests (80% lógica crítica como estándar único)
- Estandarizado Node.js >= 20.x
- Clarificado propósito como referencia técnica
- Añadidas referencias cruzadas a otros documentos
- Eliminada duplicación con REGLAS_PROGRAMADOR
- Simplificada estructura del documento

### v2.0 (2025-12-21) - Operación "Cimientos de Cristal"
- Arquitectura Pythonic v2.0
- Regla CERO `any`
- Diccionario Oficial de Tipos

### v1.0 (2025-12-10)
- Versión inicial

---

**Mantenedor:** Equipo de Desarrollo - Paradise System Labs
