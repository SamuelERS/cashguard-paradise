# Operación Isla Rápida - Refactor Setup Global + Paralelismo Vitest

**Fecha Inicio:** 2026-01-27
**Prioridad:** ALTA
**Meta:** Reducir flakes y habilitar ejecución paralela estable sin romper tests existentes

---

## 📊 TAREA A - Baseline y Mapa de Contaminación

### Estado: 🔄 EN PROGRESO

### Baseline de Tiempos (Ejecutando...)

```bash
# Comando ejecutado:
./node_modules/.bin/vitest run

# Resultado: (pendiente - ejecutando en background)
```

---

## 📋 Inventario setup.ts (321 líneas totales)

### Archivo Analizado
- **Ubicación:** `/src/__tests__/setup.ts`
- **Líneas:** 321
- **Versión:** v1.1.17

### Clasificación de Bloques

#### 1️⃣ Browser APIs - ResizeObserver (líneas 3-48) - **46 líneas**
```typescript
// POLYFILL CRÍTICO FORZADO: ResizeObserver reemplazo total para JSDOM
const ResizeObserverMock = class ResizeObserver {
  constructor(callback) { /* ... */ }
  observe(target, options = {}) { /* 24 líneas de implementación compleja */ }
  unobserve(target) { /* ... */ }
  disconnect() { /* ... */ }
};

global.ResizeObserver = ResizeObserverMock;
global.window.ResizeObserver = ResizeObserverMock;
globalThis.ResizeObserver = ResizeObserverMock;
```

**Análisis:**
- ✅ **Necesario para:** Componentes UI que usan resize detection
- ⚠️ **Problema:** Implementación COMPLEJA (46 líneas) aplicada globalmente
- 🎯 **Candidato a:** Mover a `src/testing/mocks/browser-apis.ts`
- 📝 **Razón:** No todos los tests necesitan ResizeObserver

**Decisión Propuesta:** **MOVER**

---

#### 2️⃣ Testing Library Setup (líneas 50-63) - **14 líneas**
```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, beforeAll, afterAll, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
```

**Análisis:**
- ✅ **Universal:** Todos los tests React necesitan cleanup
- ✅ **Esencial:** jest-dom matchers son estándar
- ✅ **Lightweight:** Solo 14 líneas
- 🎯 **Candidato a:** **MANTENER** en setup.ts

**Decisión Propuesta:** **MANTENER**

---

#### 3️⃣ Storage Mocks (líneas 65-94) - **30 líneas**
```typescript
const localStorageMock = {
  getItem: vi.fn((key: string) => null),
  setItem: vi.fn((key: string, value: string) => undefined),
  removeItem: vi.fn((key: string) => undefined),
  clear: vi.fn(() => undefined),
  length: 0,
  key: vi.fn((index: number) => null),
};

const sessionStorageMock = { /* idéntico */ };

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });
```

**Análisis:**
- ⚠️ **Global pero útil:** Muchos componentes usan localStorage
- ⚠️ **Problema:** Mock con `vi.fn()` persiste entre tests
- 🎯 **Candidato a:** Mover a `src/testing/mocks/storage.ts` + reset en afterEach
- 📝 **Razón:** Mejor control de estado entre tests

**Decisión Propuesta:** **MOVER**

---

#### 4️⃣ Browser APIs - matchMedia (líneas 96-115) - **20 líneas**
```typescript
const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
  matches: false,
  media: query || '',
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', { value: matchMediaMock });
global.matchMedia = matchMediaMock;
```

**Análisis:**
- ✅ **Necesario para:** Tests responsive/media queries
- ⚠️ **Problema:** Mock con `vi.fn()` global contamina tests
- 🎯 **Candidato a:** Mover a `src/testing/mocks/browser-apis.ts`
- 📝 **Razón:** No todos los tests necesitan matchMedia

**Decisión Propuesta:** **MOVER**

---

#### 5️⃣ Browser APIs - IntersectionObserver (líneas 117-126) - **10 líneas**
```typescript
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: () => [],
}));
```

**Análisis:**
- ✅ **Necesario para:** Lazy loading, infinite scroll
- ⚠️ **Problema:** Mock global sin reset
- 🎯 **Candidato a:** Mover a `src/testing/mocks/browser-apis.ts`

**Decisión Propuesta:** **MOVER**

---

#### 6️⃣ Animation APIs (líneas 131-145) - **15 líneas**
```typescript
global.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
  return setTimeout(() => callback(performance.now()), 16);
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

Object.defineProperty(global.performance, 'now', {
  value: vi.fn(() => Date.now()),
  writable: true
});
```

**Análisis:**
- ✅ **Necesario para:** Animaciones/Framer Motion
- ⚠️ **Problema:** Afecta timing de TODOS los tests
- 🎯 **Candidato a:** Mover a `src/testing/mocks/browser-apis.ts`

**Decisión Propuesta:** **MOVER**

---

#### 7️⃣ Document Body Style Override (líneas 152-166) - **15 líneas**
```typescript
// CRITICAL FIX: Override document.body.style setters
Object.defineProperty(document.body.style, 'pointerEvents', {
  get: () => 'auto',
  set: () => {}, // Ignore attempts to set pointer-events
});

Object.defineProperty(document.body.style, 'overflow', {
  get: () => 'visible',
  set: () => {}, // Ignore attempts to set overflow
});
```

**Análisis:**
- 🚨 **CRÍTICO:** Previene que Index.tsx deshabilite pointer-events
- ⚠️ **Problema:** Override GLOBAL puede ocultar bugs reales
- 🤔 **Candidato a:** **REVISAR** - ¿Es necesario globalmente?
- 📝 **Razón:** Podría aplicarse solo en tests de Index.tsx

**Decisión Propuesta:** **REVISAR** (posible ELIMINAR o MOVER a test específico)

---

#### 8️⃣ getComputedStyle Mock (líneas 168-209) - **42 líneas**
```typescript
const mockGetComputedStyle = vi.fn((element: Element) => ({
  getPropertyValue: vi.fn((property: string) => {
    switch (property) {
      case 'transform': return 'none';
      case 'opacity': return '1';
      // ... 8 casos más
      default: return '';
    }
  }),
  // ... 13 propiedades más
}));

Object.defineProperty(window, 'getComputedStyle', { value: mockGetComputedStyle });
```

**Análisis:**
- ✅ **Necesario para:** CSS animations, transforms
- ⚠️ **Problema:** Mock MUY complejo (42 líneas) global
- 🎯 **Candidato a:** Mover a `src/testing/mocks/browser-apis.ts`

**Decisión Propuesta:** **MOVER**

---

#### 9️⃣ CSS.supports Mock (líneas 211-225) - **15 líneas**
```typescript
Object.defineProperty(CSS, 'supports', {
  value: vi.fn((property: string, value?: string) => {
    const supportedProperties = [
      'backdrop-filter',
      'filter',
      'transform',
      'transition',
      'animation',
      'opacity'
    ];
    return supportedProperties.some(prop => property.includes(prop));
  }),
});
```

**Análisis:**
- ✅ **Necesario para:** Feature detection CSS
- ⚠️ **Problema:** Mock global innecesario para la mayoría
- 🎯 **Candidato a:** Mover a `src/testing/mocks/browser-apis.ts`

**Decisión Propuesta:** **MOVER**

---

#### 🔟 Console Suppression (líneas 227-239) - **13 líneas**
```typescript
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
```

**Análisis:**
- ⚠️ **Peligroso:** Oculta errores REALES
- 🚨 **Anti-pattern:** Tests deben fallar si hay console.error
- 🎯 **Candidato a:** **ELIMINAR** completamente
- 📝 **Razón:** Los errores deben ser visibles, no suprimidos

**Decisión Propuesta:** **ELIMINAR**

---

#### 1️⃣1️⃣ Radix UI - Pointer Capture APIs (líneas 241-283) - **43 líneas**
```typescript
// JSDOM POLYFILLS: Compatibilidad con Radix UI Select
if (typeof Element !== 'undefined') {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = function(pointerId: number): boolean {
      return false;
    };
  }

  if (!Element.prototype.setPointerCapture) { /* ... */ }
  if (!Element.prototype.releasePointerCapture) { /* ... */ }
}
```

**Análisis:**
- ✅ **ESENCIAL:** Radix UI requiere estas APIs en JSDOM
- ✅ **Universal:** Aplica a TODOS los tests con Radix UI
- ✅ **Polyfill legítimo:** No es un mock, es una implementación faltante
- 🎯 **Candidato a:** **MANTENER** en setup.ts
- 📝 **Razón:** Polyfill fundamental para JSDOM

**Decisión Propuesta:** **MANTENER**

---

#### 1️⃣2️⃣ Radix UI - Scroll APIs (líneas 285-321) - **37 líneas**
```typescript
// POLYFILL EXPANSION v2.0: ScrollIntoView y APIs de Scroll
if (typeof Element !== 'undefined') {
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = function(options?: ScrollIntoViewOptions | boolean): void {
      // No-op implementation
    };
  }

  if (!Element.prototype.scrollTo) { /* ... */ }
  if (!Element.prototype.scroll) { /* ... */ }
}
```

**Análisis:**
- ✅ **ESENCIAL:** Radix UI Select requiere scrollIntoView
- ✅ **Universal:** Aplica a TODOS los tests con Radix UI
- ✅ **Polyfill legítimo:** JSDOM no implementa estas APIs
- 🎯 **Candidato a:** **MANTENER** en setup.ts

**Decisión Propuesta:** **MANTENER**

---

## 📊 Resumen de Decisiones

| # | Bloque | Líneas | Decisión | Destino | Razón |
|---|--------|--------|----------|---------|-------|
| 1 | ResizeObserver | 46 | **MOVER** | `mocks/browser-apis.ts` | Complejo, no universal |
| 2 | Testing Library | 14 | **MANTENER** | `setup.ts` | Universal, lightweight |
| 3 | Storage Mocks | 30 | **MOVER** | `mocks/storage.ts` | Mejor control estado |
| 4 | matchMedia | 20 | **MOVER** | `mocks/browser-apis.ts` | No todos lo necesitan |
| 5 | IntersectionObserver | 10 | **MOVER** | `mocks/browser-apis.ts` | No universal |
| 6 | Animation APIs | 15 | **MOVER** | `mocks/browser-apis.ts` | Afecta timing |
| 7 | Body Style Override | 15 | **REVISAR** | TBD | Puede ocultar bugs |
| 8 | getComputedStyle | 42 | **MOVER** | `mocks/browser-apis.ts` | Muy complejo |
| 9 | CSS.supports | 15 | **MOVER** | `mocks/browser-apis.ts` | No universal |
| 10 | Console Suppression | 13 | **ELIMINAR** | N/A | Anti-pattern |
| 11 | Pointer Capture APIs | 43 | **MANTENER** | `setup.ts` | Polyfill esencial |
| 12 | Scroll APIs | 37 | **MANTENER** | `setup.ts` | Polyfill esencial |

### Totales
- **MANTENER en setup.ts:** 108 líneas (33.6%)
- **MOVER a mocks/:** 178 líneas (55.4%)
- **ELIMINAR:** 13 líneas (4.0%)
- **REVISAR:** 15 líneas (4.7%)

### Setup.ts Objetivo (≤50 líneas)
✅ **Factible:** 108 líneas actuales - 13 (eliminar) - 15 (revisar/eliminar) = **80 líneas**
⚠️ **Excede objetivo:** Necesitamos decisión sobre bloques 11-12 (Radix polyfills)

**Opciones:**
1. Mantener polyfills Radix (80 líneas setup) - **Justificado por necesidad**
2. Mover polyfills a archivo separado `polyfills.ts` (50 líneas setup exacto)

---

## 🎯 Próximos Pasos

### ⏳ Pendiente
1. **Baseline completo** - Esperando resultados de `vitest run`
2. **Decisión final** sobre setup.ts target (50 líneas estricto vs 80 líneas justificado)
3. **Inicio Tarea B** - Implementar decisiones de la tabla

### 📝 Notas
- Análisis basado en inspección manual de setup.ts completo
- Clasificación conservadora: preferencia por MOVER vs ELIMINAR
- Polyfills Radix UI documentados como "esenciales" por compatibilidad JSDOM
