# ⚡ QUICK WIN 4: Error Boundaries para Componentes Críticos

**Documento:** Quick Win - Error Handling
**Estado:** 📝 PLANIFICADO
**Prioridad:** MEDIA
**Tiempo estimado:** 2 horas
**Tipo:** Quick Win (victoria rápida + UX resiliente)

---

## 📋 Resumen Ejecutivo

Implementar **Error Boundaries de React** en componentes críticos para prevenir crash completo de la aplicación.

### Problema Actual
- ❌ Un error en cálculos crashea toda la app
- ❌ Usuario pierde sesión completa (sin recovery)
- ❌ No hay fallback UI amigable
- ❌ Empleados atrapados sin poder continuar

### Impacto UX
- 🔴 **Pérdida de datos:** Trabajo en progreso se pierde
- 🔴 **Frustración:** Empleado debe empezar desde cero
- 🔴 **Tiempo perdido:** 15-20 minutos rehacer conteo

---

## 🎯 Objetivo

**Implementar Error Boundaries** en **4 componentes críticos**.

**Criterios de éxito:**
- ✅ Crashes NO rompen aplicación completa
- ✅ Fallback UI profesional con opción recovery
- ✅ Logs de error para debugging
- ✅ Tests de error scenarios passing

---

## 📊 Análisis Técnico

### Patrón React Error Boundary

```typescript
// 🤖 [IA] - v1.3.x: Quick Win #4 - Error Boundary Base
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error para debugging
    console.error('ErrorBoundary caught error:', error, errorInfo);

    // Callback opcional
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI custom o default
      return this.props.fallback || (
        <div className="error-boundary-fallback">
          <h2>⚠️ Algo salió mal</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={this.handleReset}>Reintentar</button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## ✅ Implementación (2 horas)

### Paso 1: Crear Error Boundary Base (30 min)

**Archivo:** `src/components/ErrorBoundary.tsx`

**Features:**
- ✅ Fallback UI profesional
- ✅ Botón "Reintentar" con reset state
- ✅ Logging automático de errores
- ✅ Props opcionales para custom fallback

### Paso 2: Aplicar a Componentes Críticos (1h)

**Componente 1: CashCounter (CRÍTICO)**
```typescript
// src/components/CashCounter.tsx
import { ErrorBoundary } from './ErrorBoundary';

function CashCounter() {
  return (
    <ErrorBoundary
      fallback={
        <div className="error-fallback-cash-counter">
          <h2>⚠️ Error en Contador de Caja</h2>
          <p>No se pudo cargar el sistema de conteo.</p>
          <button onClick={() => window.location.reload()}>
            Recargar Aplicación
          </button>
        </div>
      }
    >
      {/* Contenido original */}
    </ErrorBoundary>
  );
}
```

**Componente 2: CashCalculation (CRÍTICO)**
```typescript
// src/components/CashCalculation.tsx
<ErrorBoundary
  fallback={
    <div className="error-fallback-calculations">
      <h2>⚠️ Error en Cálculos</h2>
      <p>No se pudieron generar los resultados finales.</p>
      <button onClick={() => history.back()}>
        Volver a Fase Anterior
      </button>
    </div>
  }
>
  {/* Resultados finales */}
</ErrorBoundary>
```

**Componente 3: Phase2Manager (ALTO)**
```typescript
// src/components/phases/Phase2Manager.tsx
<ErrorBoundary
  fallback={
    <div className="error-fallback-phase2">
      <h2>⚠️ Error en Fase 2</h2>
      <p>No se pudo completar la separación de efectivo.</p>
      <button onClick={handleRetryPhase2}>
        Reintentar Fase 2
      </button>
    </div>
  }
>
  {/* Phase 2 content */}
</ErrorBoundary>
```

**Componente 4: InitialWizardModal (MEDIO)**
```typescript
// src/components/InitialWizardModal.tsx
<ErrorBoundary>
  {/* Wizard content */}
</ErrorBoundary>
```

### Paso 3: Tests de Error Scenarios (30 min)

**Archivo:** `src/__tests__/components/ErrorBoundary.test.tsx`

```typescript
describe('ErrorBoundary', () => {
  it('should catch errors and display fallback', () => {
    const ThrowError = () => {
      throw new Error('Test error');
    };

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
  });

  it('should reset error state on retry', async () => {
    // Test botón reintentar
  });

  it('should call onError callback', () => {
    const onError = vi.fn();
    // Test callback ejecuta
  });
});
```

---

## 📊 Impacto Esperado

### Escenario Sin Error Boundary

```
Usuario completa Fase 1 (15 min) →
Error en cálculo Fase 2 →
❌ Pantalla blanca →
❌ Pierde TODO el trabajo →
❌ Debe empezar desde cero
```

### Escenario Con Error Boundary

```
Usuario completa Fase 1 (15 min) →
Error en cálculo Fase 2 →
✅ Fallback UI muestra error →
✅ Botón "Volver a Fase Anterior" →
✅ Puede reintentar Fase 2 →
✅ Trabajo de Fase 1 preservado
```

**Beneficios medibles:**
- ✅ +100% recovery rate (vs 0% antes)
- ✅ +90% satisfacción empleados (no pierde trabajo)
- ✅ -15 minutos tiempo perdido por error
- ✅ Debugging más fácil (logs estructurados)

---

## 🗓️ Cronograma

### Semana 1 - Día 5 (13 Oct 2025) - Tarde

**15:30-17:30:** Implementación completa

- **15:30-16:00:** Crear ErrorBoundary.tsx base
- **16:00-17:00:** Aplicar a 4 componentes críticos
- **17:00-17:30:** Tests + validación

**Output esperado:**
- ✅ `ErrorBoundary.tsx` creado y testeado
- ✅ 4 componentes envueltos con boundaries
- ✅ Tests error scenarios passing
- ✅ Fallback UI profesional funcionando

---

## 🎨 Diseño Fallback UI

### Template Base

```tsx
<div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
  <div className="glass-morphism-panel max-w-md w-full p-8 text-center">
    {/* Icono de error */}
    <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />

    {/* Título */}
    <h2 className="text-2xl font-bold text-[#e1e8ed] mb-3">
      ⚠️ Algo salió mal
    </h2>

    {/* Mensaje específico */}
    <p className="text-[#8899a6] mb-6">
      {errorMessage}
    </p>

    {/* Acciones */}
    <div className="flex gap-3">
      <Button variant="outline" onClick={handleGoBack}>
        ← Volver Atrás
      </Button>
      <Button variant="default" onClick={handleRetry}>
        🔄 Reintentar
      </Button>
    </div>
  </div>
</div>
```

**Coherencia Glass Morphism:**
- ✅ Usa `glass-morphism-panel` existente
- ✅ Colores consistentes con app (`#e1e8ed`, `#8899a6`)
- ✅ Iconos Lucide React coherentes

---

## ⚠️ Limitaciones Error Boundaries

**NO capturan errores en:**
- Event handlers (`onClick`, `onChange`)
- Async code (`setTimeout`, `Promise`)
- Server-side rendering
- Errors en el mismo boundary

**Solución para event handlers:**
```typescript
// Wrap manual con try-catch
const handleClick = () => {
  try {
    // Operación riesgosa
  } catch (error) {
    console.error('Error in handler:', error);
    // Mostrar toast o similar
  }
};
```

---

## 📚 Referencias

- **React Docs:** [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- **REGLAS_DE_LA_CASA.md:** Regla #2 (Funcionalidad - Resilience)
- **Glass Morphism:** `src/index.css` - Clases existentes para consistency

---

**Última actualización:** 09 de Octubre de 2025
**Próximo paso:** Crear ErrorBoundary.tsx base component
**Responsable:** Equipo desarrollo CashGuard Paradise
