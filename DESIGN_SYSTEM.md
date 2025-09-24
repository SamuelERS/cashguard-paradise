# CashGuard Paradise - Design System Canónico

## Action Buttons (Doctrina D.1) 2

### Destructive Action Button

**Implementación:** `/src/components/shared/DestructiveActionButton.tsx`

#### Especificaciones Técnicas:
- **Background Color:** `bg-red-900`
- **Hover Background Color:** `hover:bg-red-800`
- **Text Color:** `text-red-100`
- **Border:** `border border-red-700`
- **Focus Ring:** `focus-visible:ring-red-500`
- **Focus Ring Offset:** `focus-visible:ring-offset-slate-900`

#### Dimensionamiento Fluido:
- **Height:** `h-fluid-3xl` → `clamp(3rem, 12vw, 4.5rem)` (48px-72px responsive)
- **Padding X:** `px-fluid-lg` → `clamp(1rem, 4vw, 1.5rem)` (16px-24px responsive)
- **Padding Y:** `py-2` → `8px` (fixed)

#### Estados:
- **Disabled Background:** `disabled:bg-slate-800`
- **Disabled Text:** `disabled:text-slate-600`
- **Disabled Border:** `disabled:border-slate-700`

### Constructive Action Button

**Implementación:** `/src/components/shared/ConstructiveActionButton.tsx`

#### Especificaciones Técnicas:
- **Background Color:** `bg-green-900`
- **Hover Background Color:** `hover:bg-green-800`
- **Text Color:** `text-green-100`
- **Border:** `border border-green-700`
- **Focus Ring:** `focus-visible:ring-green-500`
- **Focus Ring Offset:** `focus-visible:ring-offset-slate-900`

#### Dimensionamiento Fluido:
- **Height:** `h-fluid-3xl` → `clamp(3rem, 12vw, 4.5rem)` (48px-72px responsive)
- **Padding X:** `px-fluid-lg` → `clamp(1rem, 4vw, 1.5rem)` (16px-24px responsive)
- **Padding Y:** `py-2` → `8px` (fixed)

#### Estados:
- **Disabled Background:** `disabled:bg-slate-800`
- **Disabled Text:** `disabled:text-slate-600`
- **Disabled Border:** `disabled:border-slate-700`

## Arquitectura Fluid Responsive

### Variables CSS Base:
```css
--space-lg: clamp(1rem, 4vw, 1.5rem);             /* 16px → 24px */
--space-3xl: clamp(3rem, 12vw, 4.5rem);           /* 48px → 72px */
```

### Principios de Diseño:

#### 1. **Single Source of Truth**
- Cada componente define sus propias dimensiones base
- No dependencia de className props para dimensionamiento
- Autocontenido y predecible

#### 2. **Fluid Responsive System**
- Uso de `clamp()` para escalado suave
- Adaptación automática a todos los viewports
- Sin breakpoints discretos

#### 3. **DRY Principle**
- Eliminación de repetición de clases
- Componentes autocontenidos
- Claridad arquitectónica

## Historial de Cambios

### v3.2.1 - Operación "ARCHITECTURAL-INTEGRITY"
- **Fecha:** 2025-09-19
- **Objetivo:** Erradicación del conflicto interno de estilos
- **Cambios:**
  - Eliminadas dimensiones fijas (`h-10`, `px-4`) de componentes base
  - Adoptado sistema fluid como estándar interno
  - Simplificado uso en modales (eliminadas clases redundantes)
  - Establecida fuente única de verdad para dimensionamiento

### Justificación Técnica:
- **Problema:** Conflicto entre estilos base hardcoded y props fluid
- **Solución:** Integración del sistema fluid en los componentes canónicos
- **Resultado:** Consistencia visual total y arquitectura limpia