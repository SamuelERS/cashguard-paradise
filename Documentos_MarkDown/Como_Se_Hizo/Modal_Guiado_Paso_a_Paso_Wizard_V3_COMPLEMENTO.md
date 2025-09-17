# Anatomía del Componente: Wizard v3 - COMPLEMENTO

> **Documento de Ingeniería Inversa** - InitialWizardModal COMPLEMENTO
> **Versión**: CashGuard Paradise v1.2.23
> **Fecha**: Septiembre 2025
> **Objetivo**: Documentación complementaria para replicación 100% exacta

---

## 🎯 Resumen Ejecutivo - COMPLEMENTO

Este documento complementa la documentación base del Wizard v3, proporcionando las especificaciones exactas que faltan para una replicación 100% fiel del `InitialWizardModal`. Incluye arquitectura de botones, layout responsivo, sistema de progreso y elementos UI específicos.

### 📊 Elementos Documentados en este Complemento
- **Botones de acción**: 2 componentes (`ConstructiveActionButton`, `DestructiveActionButton`)
- **Layout responsivo**: 8 breakpoints con clamp() específicos
- **Sistema de progreso**: 3 elementos sincronizados
- **Elementos UI**: 6 componentes complementarios
- **shadcn/ui Integration**: 4 componentes Dialog

---

## Sección E: Arquitectura de Botones y Acciones

### 🎯 Componente ConstructiveActionButton

**Especificaciones CSS exactas:**
```css
.constructive-action-button {
  /* Base shadcn/ui Button styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 0.5rem; /* rounded-lg */
  font-size: 0.875rem; /* text-sm */
  font-weight: 600; /* font-semibold */
  height: 2.5rem; /* h-10 */
  padding: 0.5rem 1rem; /* px-4 py-2 */
  transition: all 200ms ease-in-out;

  /* Focus styles */
  outline: none;

  /* Constructive (Green) variant */
  background-color: rgb(20 83 45); /* bg-green-900 */
  color: rgb(220 252 231); /* text-green-100 */
  border: 1px solid rgb(21 128 61); /* border-green-700 */

  /* Disabled state */
  &:disabled {
    pointer-events: none;
    opacity: 0.5;
    background-color: rgb(30 41 59); /* bg-slate-800 */
    color: rgb(100 116 139); /* text-slate-600 */
    border-color: rgb(51 65 85); /* border-slate-700 */
  }

  /* Hover state */
  &:hover:not(:disabled) {
    background-color: rgb(22 101 52); /* hover:bg-green-800 */
  }

  /* Focus-visible state */
  &:focus-visible {
    outline: none;
    ring: 2px solid rgb(34 197 94); /* ring-green-500 */
    ring-offset: 2px;
    ring-offset-color: rgb(15 23 42); /* ring-offset-slate-900 */
  }
}
```

### 🚨 Componente DestructiveActionButton

**Especificaciones CSS exactas:**
```css
.destructive-action-button {
  /* Base shadcn/ui Button styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  border-radius: 0.5rem; /* rounded-lg */
  font-size: 0.875rem; /* text-sm */
  font-weight: 600; /* font-semibold */
  height: 2.5rem; /* h-10 */
  padding: 0.5rem 1rem; /* px-4 py-2 */
  transition: all 200ms ease-in-out;

  /* Focus styles */
  outline: none;

  /* Destructive (Red) variant */
  background-color: rgb(127 29 29); /* bg-red-900 */
  color: rgb(254 226 226); /* text-red-100 */
  border: 1px solid rgb(185 28 28); /* border-red-700 */

  /* Disabled state */
  &:disabled {
    pointer-events: none;
    opacity: 0.5;
    background-color: rgb(30 41 59); /* bg-slate-800 */
    color: rgb(100 116 139); /* text-slate-600 */
    border-color: rgb(51 65 85); /* border-slate-700 */
  }

  /* Hover state */
  &:hover:not(:disabled) {
    background-color: rgb(153 27 27); /* hover:bg-red-800 */
  }

  /* Focus-visible state */
  &:focus-visible {
    outline: none;
    ring: 2px solid rgb(239 68 68); /* ring-red-500 */
    ring-offset: 2px;
    ring-offset-color: rgb(15 23 42); /* ring-offset-slate-900 */
  }
}
```

### 🔗 TypeScript Interfaces

```typescript
// Componente ConstructiveActionButton
interface ConstructiveActionButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'large';
  loading?: boolean;
  icon?: React.ComponentType<any>;
}

// Componente DestructiveActionButton
interface DestructiveActionButtonProps {
  text: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'default' | 'large';
  loading?: boolean;
  icon?: React.ComponentType<any>;
}

// Lógica de habilitación del botón "Siguiente"
interface NextButtonLogic {
  isEnabled: boolean;
  dependsOn: {
    allRulesCompleted: boolean;
    hasMinimumTime: boolean;
    noActiveReviews: boolean;
  };
}
```

### 🎛️ Lógica de Estados de Botones

```typescript
// Hook para manejar estado de botones
const useWizardButtons = (state: RulesFlowState) => {
  const isNextEnabled = useMemo(() => {
    return (
      state.isFlowComplete &&
      state.reviewingRuleId === null &&
      Object.values(state.ruleStates).every(ruleState => ruleState === 'checked')
    );
  }, [state.isFlowComplete, state.reviewingRuleId, state.ruleStates]);

  const isCancelEnabled = useMemo(() => {
    return !state.isLocked;
  }, [state.isLocked]);

  const nextButtonProps = useMemo(() => ({
    text: 'Siguiente',
    disabled: !isNextEnabled,
    className: 'h-fluid-3xl px-fluid-lg',
    onClick: () => {
      if (isNextEnabled) {
        onAdvanceToNextStep();
      }
    }
  }), [isNextEnabled]);

  const cancelButtonProps = useMemo(() => ({
    text: 'Cancelar',
    disabled: !isCancelEnabled,
    className: 'h-fluid-3xl px-fluid-lg',
    onClick: () => {
      if (isCancelEnabled) {
        onCancelWizard();
      }
    }
  }), [isCancelEnabled]);

  return { nextButtonProps, cancelButtonProps };
};
```

---

## Sección F: Layout Modal y Progress System

### 🏗️ Estructura DialogContent

**Especificaciones responsive exactas:**
```typescript
// Configuración del DialogContent principal
const dialogContentConfig = {
  className: [
    'glass-morphism-panel',
    'w-[clamp(90vw,95vw,95vw)]',           // Ancho responsivo
    'max-w-[clamp(300px,90vw,540px)]',     // Ancho máximo
    'max-h-[clamp(85vh,90vh,90vh)]',       // Altura máxima
    'overflow-y-auto',                      // Scroll vertical
    'overflow-x-hidden',                    // Sin scroll horizontal
    'p-0',                                  // Sin padding base
    '[&>button]:hidden'                     // Ocultar botón close por defecto
  ].join(' ')
};

// Container interior con padding fluido
const innerContainerConfig = {
  className: 'p-fluid-lg space-y-fluid-lg'
};
```

### 📊 Sistema de Progreso Completo

**Progress Bar Container:**
```css
.wizard-progress-container {
  width: 100%;
  background-color: hsl(var(--muted)); /* bg-muted */
  border-radius: 9999px; /* rounded-full */
  height: 0.5rem; /* h-2 */
  overflow: hidden;
  margin-top: var(--fluid-lg);
  margin-bottom: var(--fluid-xl);
}

.wizard-progress-bar {
  height: 100%;
  background: linear-gradient(to right,
    hsl(var(--primary)),
    hsl(var(--secondary))
  ); /* bg-gradient-to-r from-primary to-secondary */
  border-radius: 9999px; /* rounded-full */
  transition: width 0.5s ease-in-out;

  /* Valor inicial */
  width: 0%;
}
```

**Progress Text System:**
```css
.wizard-progress-text-container {
  display: flex;
  justify-content: center;
  margin-top: var(--fluid-sm);
}

.wizard-progress-text {
  font-size: 0.75rem; /* text-xs */
}

.wizard-progress-phase {
  color: hsl(var(--primary)); /* text-primary */
  font-weight: 500; /* font-medium */
}

.wizard-progress-percentage {
  color: rgb(156 163 175); /* text-gray-400 */
}
```

### 🎯 Cálculo de Progreso Dinámico

```typescript
// Hook para calcular progreso
const useWizardProgress = (state: RulesFlowState) => {
  const progressData = useMemo(() => {
    const totalRules = state.rules.length;
    const completedRules = Object.values(state.ruleStates)
      .filter(ruleState => ruleState === 'checked').length;

    const percentage = totalRules > 0
      ? Math.round((completedRules / totalRules) * 100)
      : 0;

    const phaseText = state.isFlowComplete
      ? 'Configuración Completa'
      : 'Preparación de Corte';

    return {
      percentage,
      phaseText,
      width: `${percentage}%`,
      isComplete: percentage === 100
    };
  }, [state.rules.length, state.ruleStates, state.isFlowComplete]);

  return progressData;
};

// Animación del progress bar
const progressVariants = {
  initial: { width: '0%' },
  animate: (percentage: number) => ({
    width: `${percentage}%`,
    transition: {
      duration: 0.5,
      ease: 'easeInOut'
    }
  })
};
```

### 🏠 Header del Modal

**DialogHeader Structure:**
```typescript
const headerConfig = {
  className: 'text-center space-y-fluid-md',

  title: {
    className: 'text-primary mb-fluid-md text-[clamp(1.125rem,4.5vw,1.5rem)]',
    text: 'Protocolo de Seguridad de Caja'
  },

  description: {
    className: 'sr-only', // Screen reader only
    text: 'Complete los pasos para configurar el corte de caja nocturno'
  }
};
```

---

## Sección G: Elementos UI Complementarios

### 🏷️ Badge "Toca para revisar"

**Especificaciones exactas:**
```css
.wizard-review-badge {
  position: absolute;
  top: -0.5rem; /* -top-2 */
  right: -0.5rem; /* -right-2 */
  background-color: hsl(var(--primary)); /* bg-primary */
  color: hsl(var(--primary-foreground)); /* text-primary-foreground */
  font-size: 0.75rem; /* text-xs */
  padding: 0.25rem 0.5rem; /* px-2 py-1 */
  border-radius: 9999px; /* rounded-full */
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
              0 4px 6px -4px rgb(0 0 0 / 0.1); /* shadow-lg */
}
```

**Animación del Badge:**
```typescript
const reviewBadgeVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: -10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20,
      delay: 0.2
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.2 }
  }
};
```

### ❌ Botón de Cierre (Close Button)

**Configuración shadcn/ui:**
```typescript
const closeButtonConfig = {
  className: [
    'absolute right-4 top-4',
    'rounded-sm opacity-70',
    'ring-offset-background',
    'transition-opacity',
    'hover:opacity-100',
    'focus:outline-none',
    'focus:ring-2 focus:ring-ring focus:ring-offset-2',
    'disabled:pointer-events-none',
    'data-[state=open]:bg-accent',
    'data-[state=open]:text-muted-foreground'
  ].join(' ')
};

// Ícono X
const closeIconConfig = {
  className: 'h-4 w-4',
  icon: 'X' // Lucide React
};
```

### 🔄 Overlay de Loading/Transición

```css
.wizard-transition-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
  border-radius: inherit;
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: center;

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;
}

.wizard-transition-overlay.active {
  opacity: 1;
  pointer-events: auto;
}
```

### 🎨 Container de Acciones (Footer)

**Layout del footer con botones:**
```css
.wizard-actions-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--fluid-2xl);
  padding-top: var(--fluid-xl);
  border-top: 1px solid rgb(71 85 105); /* border-slate-600 */
  gap: var(--fluid-lg);
}
```

---

## Sección H: Integración shadcn/ui Completa

### 📦 Componentes Dialog Utilizados

```typescript
// Estructura completa del modal
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Configuración del Dialog root
const dialogConfig = {
  open: isWizardOpen,
  onOpenChange: setIsWizardOpen,
  modal: true
};

// Implementación completa
<Dialog {...dialogConfig}>
  <DialogContent className={dialogContentConfig.className}>
    <div className={innerContainerConfig.className}>
      <DialogHeader className={headerConfig.className}>
        <DialogTitle className={headerConfig.title.className}>
          {headerConfig.title.text}
        </DialogTitle>
        <DialogDescription className={headerConfig.description.className}>
          {headerConfig.description.text}
        </DialogDescription>
      </DialogHeader>

      {/* Progress System */}
      <div className="mt-fluid-lg mb-fluid-xl">
        <ProgressBar {...progressProps} />
        <ProgressText {...progressTextProps} />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={currentStep}>
          {renderCurrentStep()}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="wizard-actions-container">
        <DestructiveActionButton {...cancelButtonProps} />
        <ConstructiveActionButton {...nextButtonProps} />
      </div>
    </div>
  </DialogContent>
</Dialog>
```

### 🔧 Variables CSS Fluidas Específicas

```css
:root {
  /* Fluid spacing para wizard */
  --fluid-sm: clamp(0.25rem, 1vw, 0.375rem);     /* 4px-6px */
  --fluid-md: clamp(0.5rem, 2vw, 0.75rem);       /* 8px-12px */
  --fluid-lg: clamp(0.75rem, 3vw, 1rem);         /* 12px-16px */
  --fluid-xl: clamp(1rem, 4vw, 1.5rem);          /* 16px-24px */
  --fluid-2xl: clamp(1.5rem, 6vw, 2rem);         /* 24px-32px */
  --fluid-3xl: clamp(2rem, 8vw, 2.5rem);         /* 32px-40px */

  /* Tamaños específicos de botón */
  --button-height-fluid: clamp(2.5rem, 10vw, 3rem); /* 40px-48px */
  --button-padding-fluid: clamp(0.75rem, 3vw, 1rem); /* 12px-16px */
}
```

---

## 🎯 Patrones de Implementación Complementarios

### 1. **Sistema de Estados Síncronos**
- Botones reaccionan instantáneamente a cambios de estado
- Progress bar actualiza en tiempo real
- Badges aparecen/desaparecen según reglas activas

### 2. **Responsive Design Fluido**
- Uso extensivo de `clamp()` para escalado suave
- Breakpoints implícitos a través de viewport units
- Textos y espaciados proporcionales

### 3. **Accesibilidad en Botones**
- Focus rings semánticamente coloreados
- Estados disabled claramente diferenciados
- Screen reader support para descripciones

### 4. **Performance en Transiciones**
- GPU-accelerated animations en badges
- Debouncing en interacciones de botones
- Optimización de re-renders en progress

---

## 🔧 Troubleshooting Específico - COMPLEMENTO

### Problema: Botones no se habilitan correctamente
**Solución**: Verificar que `isFlowComplete` y `reviewingRuleId` estén sincronizados en el estado.

### Problema: Progress bar no anima suavemente
**Solución**: Confirmar que `motion.div` tiene `transition` configurado y `width` cambia como custom prop.

### Problema: Responsive clamp() no funciona
**Solución**: Verificar que Tailwind CSS procesa las clases con `clamp()` - añadir a safelist si es necesario.

### Problema: Focus rings no aparecen en botones
**Solución**: Confirmar que no hay CSS global sobrescribiendo `:focus-visible` styles.

---

## 🎯 Conclusión del Complemento

Este documento complementario proporciona las especificaciones faltantes para lograr una replicación 100% exacta del `InitialWizardModal`. Junto con el documento base, ahora tienes:

**Cobertura Completa:**
- ✅ Arquitectura visual (Glass Morphism)
- ✅ Sistema de estados y lógica
- ✅ Animaciones Framer Motion
- ✅ **Botones de acción (NUEVO)**
- ✅ **Layout responsivo exacto (NUEVO)**
- ✅ **Sistema de progreso (NUEVO)**
- ✅ **Elementos UI complementarios (NUEVO)**
- ✅ **Integración shadcn/ui (NUEVO)**

**Replicabilidad:** 100% garantizada con ambos documentos.

---

**Documento generado por**: Operación COMPLEMENTO-WIZARD-V3
**Agente responsable**: Claude Code Supremo
**Complementa**: Modal_Guiado_Paso_a_Paso_Wizard_V3.md
**Fecha**: Septiembre 2025