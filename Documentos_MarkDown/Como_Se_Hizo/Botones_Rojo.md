---

> Artefacto: Componente de UI
> 
> 
> **Versión:** 2.0 (Revisión Doctrinal)
> 
> **Estado:** ✅ Oficial
> 
> **Última Actualización:** 2025-09-07
> 

---

### 🎯 **Objetivo**

Estandarizar el diseño, la implementación y el uso de botones para acciones **destructivas e irreversibles** dentro del ecosistema de **CashGuard Paradise**. Este documento sirve como la única fuente de verdad (Single Source of Truth) para este componente crítico.

---

<br>

▶️ **Resumen Ejecutivo**

- **Componente**: DestructiveActionButton
- **Tecnología**: **React/TypeScript** y **Tailwind CSS**, integrado con shadcn/ui.
- **Estilo Principal**: Fondo rojo sólido (dark mode) para comunicar peligro de forma clara e inequívoca. La interacción es una sutil variación de color para alinearse con la filosofía de "cero animaciones molestas" del proyecto.
- **Accesibilidad**: Cumplimiento de WCAG 2.1 con estados focus-visible y disabled claros.
- **Mandato**: Su uso es **obligatorio** para todas las acciones destructivas.

<br>

---

### 🎨 **Paleta y Design Tokens Oficiales (SOLID RED DOCTRINE)**

> 💡 Instrucción para Notion: Copia la siguiente tabla y selecciona Turn into database. Esto creará una base de datos de tokens fácil de consultar y mantener.
> 

| Propiedad (Property) 🏷️ | Token (Name) | Valor (Value) 💻 | Descripción (Description) 📝 |
| --- | --- | --- | --- |
| background-color | --btn-destructive-bg | theme('colors.red.900') | Fondo base del botón. |
| color | --btn-destructive-text | theme('colors.red.100') | Color del texto. |
| border-color | --btn-destructive-border | theme('colors.red.700') | Borde sutil para definición. |
| background-color | --btn-destructive-bg-hover | theme('colors.red.800') | Fondo en estado :hover. |
| background-color | --btn-destructive-bg-disabled | theme('colors.slate.800') | Fondo en estado disabled. |
| color | --btn-destructive-text-disabled | theme('colors.slate.600') | Color de texto en disabled. |
| border-color | --btn-destructive-border-disabled | theme('colors.slate.700') | Borde en estado disabled. |

<br>

---

### 🛠️ **Implementación y Snippets**

▶️ **🧱 Snippet HTML (Uso exclusivo para prototipado)**

> ⚠️ Directiva: Este código es para validación visual rápida. La implementación en producción debe usar el componente React para garantizar la consistencia y el mantenimiento.
> 

code Html

downloadcontent_copy

expand_less

```
<!-- Estado Base -->
<button
  class="
    px-4 py-2 rounded-lg font-semibold text-sm
    bg-red-900 text-red-100
    border border-red-700
    transition-colors duration-200 ease-in-out
    hover:bg-red-800
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 focus-visible:ring-offset-slate-900
    disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 disabled:opacity-50
  "
>
  Cancelar Conteo
</button>

<!-- Estado Deshabilitado -->
<button
  disabled
  class="
    px-4 py-2 rounded-lg font-semibold text-sm
    bg-slate-800 text-slate-600
    border border-slate-700
    cursor-not-allowed opacity-50
  "
>
  Cancelar Conteo
</button>
```

▶️ **⚛️ Componente React Oficial (Implementación Canónica)**

> ✅ Ruta del Archivo: src/components/ui/destructive-action-button.tsx
> 

code Tsx

downloadcontent_copy

expand_less

IGNORE_WHEN_COPYING_START

IGNORE_WHEN_COPYING_END

```
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const destructiveActionButtonVariants = cva(
  `inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold
   transition-colors duration-200 ease-in-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   focus-visible:ring-red-500 focus-visible:ring-offset-slate-900
   disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        default: `
          bg-red-900 text-red-100 border border-red-700
          hover:bg-red-800
          disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700
        `,
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface DestructiveActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof destructiveActionButtonVariants> {
  asChild?: boolean
}

const DestructiveActionButton = React.forwardRef<HTMLButtonElement, DestructiveActionButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(destructiveActionButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
DestructiveActionButton.displayName = "DestructiveActionButton"

export { DestructiveActionButton, destructiveActionButtonVariants }
```

<br>

---

### 🗺️ **Guía de Uso y Reglas de Negocio**

> 💡 Directiva Maestra: Un botón rojo llama la atención. Su uso indiscriminado devalúa su propósito y confunde al usuario. Utilícese con extrema precaución.
> 
- **Uso Exclusivo:** Reservado **únicamente** para acciones que resulten en una pérdida de datos, sean irreversibles o detengan un flujo crítico de forma definitiva.
- **Confirmación Requerida:** Para las acciones más críticas (ej. Borrar conteo final), este botón **debe** ir acompañado de un modal de confirmación (AlertDialog) que explique claramente las consecuencias.
- **Texto Claro y Directo:** El texto del botón debe ser explícito. Usar "Cancelar" o "Eliminar", no frases ambiguas.

<br>

---

### ✅ **Checklists de Calidad**

▶️ **♿ Accesibilidad (A11y)**

**Elemento Semántico**: Se utiliza el elemento <button> nativo.

**Contraste de Texto**: El texto cumple con el ratio de contraste AA (red-100 sobre red-900).

**Estado de Foco Visible**: El anillo de foco es claro y no depende solo del color.

**Estado Deshabilitado**: Se usa el atributo disabled y el estilo es inequívoco.

**No Depender del Color**: El texto y el contexto son la fuente principal de información.

▶️ **🧪 QA Visual**

**Estado Base**: Se renderiza con un fondo rojo sólido y borde sutil.

**Estado Hover**: El fondo se oscurece sutilmente a red-800.

**Estado Foco**: El anillo de foco aparece al navegar con teclado.

**Estado Deshabilitado**: El botón no es interactivo, el cursor-not-allowed y opacity-50 se aplican.

**Text Overflow**: El texto largo se maneja correctamente sin romper el layout.

---

### 📝 **Changelog**

- **v2.0 (2025-09-07)**: Revisión Doctrinal. Se abandona el estilo "glow" (RED BUTTON DOCTRINE) en favor del nuevo estándar "solid" (SOLID RED DOCTRINE) para máxima claridad y consistencia. Todo el componente ha sido refactorizado.