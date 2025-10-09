# Plan: Sistema de Duplicación de ConfirmationModal

## 📊 Arquitectura Actual Analizada

### Componente Base: `ConfirmationModal`
**Ubicación:** `/src/components/ui/confirmation-modal.tsx`

**Dependencias:**
1. **Radix UI Primitives:** `@radix-ui/react-alert-dialog`
   - AlertDialog, AlertDialogContent, AlertDialogHeader, etc.
2. **Componentes UI Shadcn:** `/src/components/ui/alert-dialog.tsx`
   - Wrappers de Radix con estilos base
3. **Botones Especializados:**
   - `DestructiveActionButton` (rojo) - `/src/components/shared/DestructiveActionButton.tsx`
   - `ConstructiveActionButton` (verde) - `/src/components/shared/ConstructiveActionButton.tsx`

### Características del Sistema

**Props Interface:**
```typescript
interface ConfirmationModalProps {
  // Control de estado (modo controlado)
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  
  // Trigger opcional (modo no controlado)
  trigger?: ReactNode;
  
  // Contenido
  title: string;
  description?: string;
  warningText?: string;
  
  // Botones
  confirmText: string;
  cancelText: string;
  
  // Handlers
  onConfirm: () => void;
  onCancel: () => void;
  
  // Styling
  className?: string;
}
```

**Estructura Visual:**
1. **Overlay:** Fondo negro semi-transparente (`bg-black/80`)
2. **Content:** Glass morphism panel centrado
3. **Header:**
   - Título con emoji ⚠️ + texto rojo destructive
   - Descripción opcional (gris)
   - Warning box opcional (naranja con alpha)
4. **Footer:**
   - Botón destructivo (rojo) - Confirma acción
   - Botón constructivo (verde) - Cancela/continúa

**Estilos Clave:**
- **Glass Morphism:** `.glass-morphism-panel`
- **Responsive:** `clamp()` puro (sin breakpoints)
- **Animaciones:** Radix data-state transitions
- **Max Width:** `min(calc(100vw - 2rem), 32rem)`

## 🎯 Plan de Duplicación Genérico

### Paso 1: Importar el Componente
```typescript
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
```

### Paso 2: Agregar Estado de Control
```typescript
// En el componente padre
const [showConfirmation, setShowConfirmation] = useState(false);
```

### Paso 3: Implementar Modal
```typescript
<ConfirmationModal
  open={showConfirmation}
  onOpenChange={setShowConfirmation}
  title="Título Descriptivo"
  description="Descripción del impacto (opcional)"
  warningText="Texto de advertencia (opcional)"
  confirmText="Texto Botón Rojo"
  cancelText="Texto Botón Verde"
  onConfirm={() => {
    // Lógica de confirmación
    setShowConfirmation(false);
  }}
  onCancel={() => {
    // Lógica de cancelación
    setShowConfirmation(false);
  }}
/>
```

### Paso 4: Trigger para Abrir Modal
```typescript
// En el evento que debe mostrar confirmación
const handleAction = () => {
  setShowConfirmation(true);
};
```

## 📋 Casos de Uso Documentados

### Caso 1: Cancelar Wizard (InitialWizardModal.tsx)
```typescript
<ConfirmationModal
  open={showCancelConfirmation}
  onOpenChange={setShowCancelConfirmation}
  title="Cancelar Configuración"
  description="Se perderá todo el progreso del protocolo de seguridad"
  warningText="Esta acción no se puede deshacer"
  confirmText="Sí, Cancelar"
  cancelText="Continuar"
  onConfirm={handleConfirmedClose}
  onCancel={handleCancelClose}
/>
```

### Caso 2: Retroceder Paso (InitialWizardModal.tsx)
```typescript
<ConfirmationModal
  open={showBackConfirmation}
  onOpenChange={setShowBackConfirmation}
  title="¿Retroceder al paso anterior?"
  description="Los datos ingresados se mantendrán."
  warningText="Retrocede si quieres corregir información."
  confirmText="Sí, retroceder"
  cancelText="Continuar aquí"
  onConfirm={() => {
    goPrevious();
    setShowBackConfirmation(false);
  }}
  onCancel={() => setShowBackConfirmation(false)}
/>
```

## 🔧 Pasos para Implementar en Cualquier Componente

### Checklist de Implementación:

1. ✅ **Importar componente:**
   ```typescript
   import { ConfirmationModal } from "@/components/ui/confirmation-modal";
   ```

2. ✅ **Agregar estado:**
   ```typescript
   const [showConfirmation, setShowConfirmation] = useState(false);
   ```

3. ✅ **Implementar handlers:**
   ```typescript
   const handleConfirm = () => {
     // Tu lógica aquí
     setShowConfirmation(false);
   };
   
   const handleCancel = () => {
     setShowConfirmation(false);
   };
   ```

4. ✅ **Renderizar modal:**
   ```typescript
   <ConfirmationModal
     open={showConfirmation}
     onOpenChange={setShowConfirmation}
     title="Tu Título"
     description="Tu descripción (opcional)"
     warningText="Tu advertencia (opcional)"
     confirmText="Confirmar"
     cancelText="Cancelar"
     onConfirm={handleConfirm}
     onCancel={handleCancel}
   />
   ```

5. ✅ **Trigger de apertura:**
   ```typescript
   <Button onClick={() => setShowConfirmation(true)}>
     Acción Peligrosa
   </Button>
   ```

## 🏠 Cumplimiento Arquitectónico

- ✅ **Reutilizable:** Props interface genérica
- ✅ **Type-safe:** TypeScript strict
- ✅ **Accesible:** Role="alertdialog", aria-labels
- ✅ **Responsive:** clamp() puro (Doctrina D.3)
- ✅ **Glass Morphism:** Paradise UI v3.0 (Doctrina D.2)
- ✅ **Buttons:** ActionButton Hierarchy (Doctrina D.1)
- ✅ **DRY:** Componente abstracto único

## 📦 Archivos Necesarios (Ya Existentes)

1. `/src/components/ui/confirmation-modal.tsx` ✅
2. `/src/components/ui/alert-dialog.tsx` ✅
3. `/src/components/shared/DestructiveActionButton.tsx` ✅
4. `/src/components/shared/ConstructiveActionButton.tsx` ✅
5. `@radix-ui/react-alert-dialog` (package) ✅

**NO se requiere crear archivos nuevos** - El sistema está completo y listo para duplicar.

## 🎯 Próximo Paso

**Indicar dónde quieres implementar el modal** y te guiaré con el código específico:
- ¿Qué componente?
- ¿Qué acción debe confirmarse?
- ¿Qué textos usar (título, descripción, warning)?