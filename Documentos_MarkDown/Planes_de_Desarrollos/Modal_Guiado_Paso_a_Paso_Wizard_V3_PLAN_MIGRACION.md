# Plan de Migración: GuidedInstructionsModal → Estándar Wizard V3

> **Documento de Planificación Arquitectónica** - GuidedInstructionsModal Evolution
> **Versión**: CashGuard Paradise v1.2.23
> **Fecha**: Septiembre 2025
> **Objetivo**: Migración completa del modal existente al estándar Wizard V3 manteniendo contexto funcional

---

## 🎯 Resumen Ejecutivo

El `GuidedInstructionsModal` actual presenta un **35% de compliance** con los estándares documentados en Wizard V3. Este plan establece la hoja de ruta para elevar el modal a **100% compliance** mientras preserva su funcionalidad específica de instrucciones de conteo de caja.

### 📊 Estado Actual vs Objetivo
- **Compliance actual**: 35% (Insuficiente)
- **Compliance objetivo**: 100% (Estándar oro)
- **Contexto preservado**: Instrucciones de conteo específicas
- **Arquitectura base**: Migración completa a Wizard V3
- **Tiempo estimado**: 4-6 horas de implementación

---

## 🔍 Análisis de Gap - Estado Actual

### ✅ **ELEMENTOS QUE MANTENER (35% compliance):**

#### **Funcionalidad Core Preservada:**
```typescript
// MANTENER: Contexto específico de instrucciones
const currentInstructions = [
  '✅ Confirmación Final',
  '🔢 Conteo Seguro',
  '📦 Caja Ordenada',
  '💰 Paquetes de Monedas'
];

// MANTENER: Título específico (con ajustes)
title: "Instrucciones del Corte de Caja"
```

#### **Elementos Base Funcionales:**
- ✅ Glass Morphism básico (mejorar)
- ✅ InstructionRule components (migrar)
- ✅ Revelación progresiva (estandarizar)
- ✅ Badge "Toca para revisar" (mantener)
- ✅ Overlay de bloqueo (mejorar)

### ❌ **ELEMENTOS FALTANTES CRÍTICOS (65% gap):**

1. **Sistema de Progress** - 0% implementado
2. **Arquitectura de Botones** - 25% implementado
3. **Anti-fraude System** - 0% implementado
4. **Variables CSS Fluidas** - 30% implementado
5. **Layout Containers** - 40% implementado

---

## Sección A: Arquitectura de Migración - Glass Morphism Estandarizado

### 🔮 Migración DialogContent

**Estado actual:**
```css
/* ACTUAL - Parcialmente correcto */
.current-modal {
  background-color: rgba(36, 36, 36, 0.4);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  /* Missing: Responsive clamps, canonical class */
}
```

**Estado objetivo:**
```css
/* OBJETIVO - Estándar Wizard V3 completo */
.glass-morphism-panel {
  background: rgba(36, 36, 36, 0.4);
  backdrop-filter: blur(var(--glass-blur-medium));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: clamp(12px, 2vw, 16px);
  padding: clamp(16px, 4vw, 24px);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.37),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}
```

### 🎨 Variables CSS Fluidas - IMPLEMENTAR

```css
/* AÑADIR al index.css */
:root {
  /* Glass System */
  --glass-blur-light: 10px;
  --glass-blur-medium: 15px;
  --glass-blur-full: 20px;

  /* Fluid Spacing para Instructions Modal */
  --instruction-fluid-sm: clamp(0.25rem, 1vw, 0.375rem);
  --instruction-fluid-md: clamp(0.5rem, 2vw, 0.75rem);
  --instruction-fluid-lg: clamp(0.75rem, 3vw, 1rem);
  --instruction-fluid-xl: clamp(1rem, 4vw, 1.5rem);
  --instruction-fluid-2xl: clamp(1.5rem, 6vw, 2rem);
}
```

### 📐 Responsive Layout Migration

**Migración DialogContent:**
```typescript
// ACTUAL
className="w-[95vw] max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] sm:max-h-[85vh]"

// OBJETIVO - Wizard V3 Standard
className="glass-morphism-panel w-[clamp(90vw,95vw,95vw)] max-w-[clamp(300px,90vw,540px)] max-h-[clamp(85vh,90vh,90vh)] overflow-y-auto overflow-x-hidden p-0 [&>button]:hidden"
```

---

## Sección B: Sistema de Progress - IMPLEMENTACIÓN COMPLETA

### 📊 Progress Bar System - NUEVO

**Implementar componente completo:**
```typescript
interface InstructionProgressProps {
  currentStep: number;
  totalSteps: number;
  phase: string;
  isComplete: boolean;
}

const InstructionProgress: React.FC<InstructionProgressProps> = ({
  currentStep,
  totalSteps,
  phase,
  isComplete
}) => {
  const percentage = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="mt-instruction-fluid-lg mb-instruction-fluid-xl">
      {/* Progress Container */}
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
      </div>

      {/* Progress Text */}
      <div className="flex justify-center mt-instruction-fluid-sm">
        <span className="text-xs">
          <span className="text-primary font-medium">{phase}</span>
          <span className="text-gray-400"> {percentage}% completado</span>
        </span>
      </div>
    </div>
  );
};
```

### 🎯 Integración en GuidedInstructionsModal

```typescript
// AÑADIR después del DialogHeader
<InstructionProgress
  currentStep={completedInstructions}
  totalSteps={instructions.length}
  phase="Preparación de Conteo"
  isComplete={allInstructionsCompleted}
/>
```

---

## Sección C: Arquitectura de Botones - MIGRACIÓN CRÍTICA

### 🎯 Migración de Botones

**Estado actual:**
```typescript
// REEMPLAZAR
<PrimaryActionButton className="btn-guided-start" disabled>
  <span>Comenzar Conteo<ArrowRight /></span>
</PrimaryActionButton>
```

**Estado objetivo:**
```typescript
// IMPLEMENTAR - Doble botón system
<div className="flex items-center justify-center mt-instruction-fluid-2xl pt-instruction-fluid-xl border-t border-slate-600 gap-instruction-fluid-lg">
  <DestructiveActionButton
    text="Cancelar"
    onClick={onCancel}
    className="h-instruction-fluid-3xl px-instruction-fluid-lg"
  />
  <ConstructiveActionButton
    text="Comenzar Conteo"
    onClick={onStartCounting}
    disabled={!allInstructionsCompleted}
    className="h-instruction-fluid-3xl px-instruction-fluid-lg"
    icon={ArrowRight}
  />
</div>
```

### 🔗 Botón States Logic

```typescript
// Hook para manejar estados de botones
const useInstructionButtons = (state: InstructionFlowState) => {
  const isStartEnabled = useMemo(() => {
    return (
      state.isFlowComplete &&
      state.reviewingInstructionId === null &&
      Object.values(state.instructionStates).every(instructionState =>
        instructionState === 'checked'
      )
    );
  }, [state.isFlowComplete, state.reviewingInstructionId, state.instructionStates]);

  const startButtonProps = useMemo(() => ({
    text: 'Comenzar Conteo',
    disabled: !isStartEnabled,
    icon: ArrowRight,
    onClick: onStartCounting
  }), [isStartEnabled, onStartCounting]);

  const cancelButtonProps = useMemo(() => ({
    text: 'Cancelar',
    onClick: onCancel
  }), [onCancel]);

  return { startButtonProps, cancelButtonProps };
};
```

---

## Sección D: Sistema Anti-fraude - IMPLEMENTACIÓN NUEVA

### 🔒 Timing System Implementation

```typescript
// NUEVO - useInstructionFlow Hook
interface InstructionFlowState {
  instructions: InstructionRule[];
  instructionStates: Record<string, 'hidden' | 'enabled' | 'reviewing' | 'checked'>;
  currentInstructionIndex: number;
  isFlowComplete: boolean;
  reviewingInstructionId: string | null;
  timingData: Record<string, {
    startTime: number | null;
    completedAt: number | null;
    hasMetMinimum: boolean;
  }>;
  sessionId: string;
  isLocked: boolean;
}

// Configuración anti-fraude específica para instrucciones
const instructionSecurityConfig = {
  minReviewTimeMs: 3000,           // 3 segundos mínimo por instrucción
  debounceTimeMs: 300,             // Anti-click múltiple
  requireAllInstructions: true,    // Todas las instrucciones obligatorias
  allowBackNavigation: false,      // Sin retroceso
  sessionTimeout: 900000           // 15 minutos timeout
};
```

### ⚡ Debouncing y Session Management

```typescript
// Anti-fraude handlers
const useInstructionSecurity = () => {
  const [lastActionTime, setLastActionTime] = useState(0);
  const [sessionId] = useState(() => crypto.randomUUID());

  const debouncedAcknowledge = useCallback((instructionId: string) => {
    const now = Date.now();
    if (now - lastActionTime < instructionSecurityConfig.debounceTimeMs) {
      return;
    }

    setLastActionTime(now);
    dispatch({ type: 'ACKNOWLEDGE_INSTRUCTION', payload: instructionId });
  }, [lastActionTime]);

  const validateTiming = useCallback((instructionId: string) => {
    const timing = timingData[instructionId];
    if (!timing?.startTime) return false;

    const elapsed = Date.now() - timing.startTime;
    return elapsed >= instructionSecurityConfig.minReviewTimeMs;
  }, [timingData]);

  return { debouncedAcknowledge, validateTiming, sessionId };
};
```

---

## Sección E: Migración de Componentes - InstructionRule → Wizard Standard

### 🧩 Component Evolution

**Mantener funcionalidad, estandarizar arquitectura:**

```typescript
// MIGRAR: InstructionRule.tsx
// HACIA: ProtocolRule.tsx (adaptado para instrucciones)

interface InstructionRuleProps extends ProtocolRuleProps {
  // Mantener props específicas
  instruction: InstructionRule;
  // Añadir props estándar Wizard
  timing: TimingData;
  onAcknowledge: (instructionId: string) => void;
  onReviewComplete: (instructionId: string) => void;
}

interface InstructionRule extends WizardRule {
  // Preservar contenido específico
  content: {
    description: string;
    safetyTips?: string[];
    consequences?: string[];
  };
}
```

### 🎨 Estados Visuales Estandarizados

```typescript
// MIGRAR clases CSS actuales a estándar Wizard
const instructionStateClasses = {
  enabled: 'instruction-rule-enabled-red protocol-rule-enabled-red',
  hidden: 'instruction-rule-hidden protocol-rule-hidden',
  reviewing: 'instruction-rule-reviewing protocol-rule-reviewing',
  checked: 'instruction-rule-checked protocol-rule-checked'
};

// Mantener animaciones específicas, estandarizar timing
const instructionVariants = {
  ...protocolRuleVariants, // Heredar del estándar
  // Personalizar para contexto de instrucciones
  instructionSpecific: {
    scale: [1, 1.015, 1], // Más sutil que protocol rules
    transition: { duration: 1.8 }
  }
};
```

---

## Sección F: Header y Layout - Contextualización Estandarizada

### 🏠 Header Adaptation

**Mantener contexto, aplicar estándar:**

```typescript
// ACTUAL
title: "Instrucciones del Corte de Caja"

// OBJETIVO - Hybrid approach
const headerConfig = {
  className: 'text-center space-y-instruction-fluid-md',

  title: {
    className: 'text-primary mb-instruction-fluid-md text-[clamp(1.125rem,4.5vw,1.5rem)]',
    text: 'Instrucciones del Conteo de Caja', // Mantener contexto, mejorar claridad
    icon: Shield // Mantener ícono existente
  },

  description: {
    className: 'text-white/80 text-[clamp(0.813rem,3.25vw,0.938rem)]',
    text: 'Complete cada instrucción para iniciar el conteo seguro'
  }
};
```

### 📦 Container System Estandarizado

```typescript
// MIGRAR estructura de containers
const layoutStructure = {
  // Outer container - Wizard standard
  dialogContent: 'glass-morphism-panel w-[clamp(90vw,95vw,95vw)] max-w-[clamp(300px,90vw,540px)]',

  // Inner container - Mantener padding específico
  innerContainer: 'p-instruction-fluid-lg space-y-instruction-fluid-lg',

  // Header - Mantener gradiente específico
  header: 'p-instruction-fluid-lg bg-gradient-to-br from-blue-600 to-purple-600 rounded-t-2xl',

  // Content - Estandarizar
  content: 'p-instruction-fluid-lg gap-instruction-fluid-lg flex flex-col',

  // Footer - Aplicar estándar Wizard
  footer: 'flex items-center justify-center mt-instruction-fluid-2xl pt-instruction-fluid-xl border-t border-slate-600 gap-instruction-fluid-lg'
};
```

---

## Sección G: Data Configuration - Instrucciones Estandarizadas

### 📋 Instruction Rules Configuration

```typescript
// MIGRAR: instructionRules.ts → Wizard V3 format
export const cashCountingInstructions: InstructionRule[] = [
  {
    id: 'final-confirmation',
    title: '✅ Confirmación Final',
    subtitle: 'Una vez confirmado, el valor queda registrado y no podrá modificarse.',
    Icon: CheckCircle,
    severity: 'critical',
    colors: {
      primary: '#ef4444',
      secondary: '#dc2626',
      background: 'rgba(239, 68, 68, 0.1)',
      border: 'rgba(239, 68, 68, 0.3)'
    },
    content: {
      description: 'El sistema registrará permanentemente los valores ingresados.',
      safetyTips: [
        'Verificar dos veces antes de confirmar',
        'No habrá opción de modificación posterior',
        'Asegurar precisión total en el conteo'
      ],
      consequences: [
        'Valores permanentes en el sistema',
        'Impacto directo en reportes financieros'
      ]
    }
  },

  {
    id: 'safe-counting',
    title: '🔢 Conteo Seguro',
    subtitle: 'Cuente cada denominación uno por uno, sin tapar la cámara de seguridad.',
    Icon: Eye,
    severity: 'warning',
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      background: 'rgba(245, 158, 11, 0.1)',
      border: 'rgba(245, 158, 11, 0.3)'
    },
    content: {
      description: 'Mantener visibilidad completa durante todo el proceso.',
      safetyTips: [
        'Contar despacio y con precisión',
        'Mantener manos visibles en cámara',
        'No obstruir la vista de billetes/monedas'
      ]
    }
  },

  {
    id: 'organized-cash',
    title: '📦 Caja Ordenada',
    subtitle: 'Coloque cada moneda, paquete y billete en su depósito: $1, $5, $10, $20, $50, $100.',
    Icon: Package,
    severity: 'info',
    colors: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      background: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)'
    },
    content: {
      description: 'Organización sistemática por denominaciones.',
      safetyTips: [
        'Separar por tipo y valor',
        'Usar compartimentos designados',
        'Mantener orden durante conteo'
      ]
    }
  },

  {
    id: 'coin-packages',
    title: '💰 Paquetes de Monedas',
    subtitle: 'Agrupe en paquetes de 10 monedas de $0.01, $0.05, $0.10, $0.25 y $1.00.',
    Icon: Coins,
    severity: 'info',
    colors: {
      primary: '#10b981',
      secondary: '#059669',
      background: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)'
    },
    content: {
      description: 'Agrupación estándar para facilitar conteo.',
      safetyTips: [
        'Paquetes de exactamente 10 unidades',
        'Verificar denominación antes de agrupar',
        'Mantener paquetes separados por valor'
      ]
    }
  }
];
```

---

## Sección H: Plan de Implementación Step-by-Step

### 🚀 Fase 1: Preparación (30 min)

1. **Backup del modal actual**
   ```bash
   cp src/components/cash-counting/GuidedInstructionsModal.tsx src/components/cash-counting/GuidedInstructionsModal.backup.tsx
   ```

2. **Crear archivos nuevos**
   ```bash
   mkdir -p src/hooks/instructions
   mkdir -p src/data/instructions
   touch src/hooks/instructions/useInstructionFlow.ts
   touch src/data/instructions/cashCountingInstructions.ts
   ```

### 🚀 Fase 2: Arquitectura Base (1.5 horas)

1. **Migrar variables CSS fluidas**
   - Añadir variables a `src/index.css`
   - Aplicar clamp responsive system

2. **Implementar glass-morphism-panel**
   - Migrar DialogContent a clase canónica
   - Aplicar responsive containers

3. **Sistema de Progress**
   - Crear componente InstructionProgress
   - Integrar en modal principal

### 🚀 Fase 3: Componentes Core (2 horas)

1. **Migrar InstructionRule → Estándar**
   - Adaptar props interface
   - Implementar timing system
   - Estandarizar animaciones

2. **Sistema de Botones**
   - Implementar ConstructiveActionButton
   - Añadir DestructiveActionButton
   - Crear footer estandarizado

### 🚀 Fase 4: Anti-fraude y Estado (1.5 horas)

1. **Hook useInstructionFlow**
   - Implementar reducer completo
   - Sistema timing y debouncing
   - Session management

2. **Integración de seguridad**
   - Validación de tiempo mínimo
   - Anti-fraude handlers
   - Estado persistence

### 🚀 Fase 5: Testing y Refinamiento (1 hora)

1. **Verificación visual**
   - Compliance con Wizard V3
   - Responsive testing
   - Animation smoothness

2. **Testing funcional**
   - Flow completo de instrucciones
   - Timing validation
   - Button states

---

## 🎯 Criterios de Éxito

### ✅ **Compliance Checklist 100%**

| **Aspecto** | **Criterio** | **Verificación** |
|-------------|--------------|------------------|
| **Glass Morphism** | Clase canónica aplicada | ✅ `glass-morphism-panel` |
| **Sistema Progress** | Progress bar + text dinámico | ✅ Animación fluida |
| **Arquitectura Botones** | Doble botón + focus rings | ✅ Verde/Rojo estándar |
| **Anti-fraude** | Timing 3s + debouncing | ✅ Session management |
| **Variables CSS** | Fluid clamps aplicados | ✅ Responsive perfecto |
| **Layout** | Containers estandarizados | ✅ Footer + header |
| **Contexto** | Instrucciones preservadas | ✅ Funcionalidad intacta |

### 📊 **Métricas de Performance**

- **Compliance**: 35% → 100%
- **Consistencia**: Alineado con InitialWizardModal
- **Funcionalidad**: 100% preservada + mejorada
- **UX**: Estándar oro Wizard V3
- **Mantenibilidad**: Arquitectura modular

---

## ⚠️ Consideraciones Especiales

### 🔄 **Preservación de Contexto**

1. **Título específico mantenido**: "Instrucciones del Conteo de Caja"
2. **Instrucciones específicas preservadas**: Conteo, organización, confirmación
3. **Flow funcional intacto**: Revelación progresiva para conteo
4. **Button action preserved**: "Comenzar Conteo" en lugar de "Siguiente"

### 🎨 **Personalización Dentro del Estándar**

1. **Colores**: Mantener gradiente azul-púrpura del header
2. **Iconografía**: Preservar íconos específicos de conteo
3. **Copy**: Adaptar textos al contexto de instrucciones
4. **Timing**: Ajustar si necesario para contexto específico

---

## 🎯 Conclusión

Este plan de migración garantiza la **elevación completa** del GuidedInstructionsModal al estándar Wizard V3, manteniendo su **contexto funcional específico** mientras implementa **todas las mejoras arquitectónicas** documentadas. El resultado será un modal que cumple 100% con los estándares de calidad establecidos, preservando su propósito original de guiar instrucciones de conteo de caja.

**Tiempo total estimado**: 6.5 horas
**Complejidad**: Media-Alta
**Riesgo**: Bajo (preservación funcional garantizada)
**ROI**: Alto (consistencia arquitectónica + UX mejorada)

---

**Documento generado por**: Operación PLAN-MIGRATION-INSTRUCTIONS-V3
**Basado en**: Modal_Guiado_Paso_a_Paso_Wizard_V3.md + Modal_Guiado_Paso_a_Paso_Wizard_V3_COMPLEMENTO.md
**Para migrar**: GuidedInstructionsModal.tsx
**Fecha**: Septiembre 2025