---

> Artefacto: Componente de UI
> 
> 
> **Versión:** 1.0
> 
> **Estado:** ✅ Oficial
> 
> **Última Actualización:** 2025-09-07
> 

---

### 🎯 **Objetivo**

Estandarizar el diseño, la implementación y el uso de botones para acciones **constructivas, de confirmación o de éxito**(ej. "Confirmar", "Guardar", "Siguiente Paso"). Este documento sirve como la única fuente de verdad (Single Source of Truth) para este componente.

---

<br>

▶️ **Resumen Ejecutivo**

- **Componente**: ConstructiveActionButton
- **Tecnología**: **React/TypeScript** y **Tailwind CSS**, integrado con shadcn/ui.
- **Estilo Principal**: Fondo verde sólido (dark mode) para comunicar progreso, éxito o confirmación. La interacción es una sutil variación de color.
- **Accesibilidad**: Cumplimiento de WCAG 2.1 con estados focus-visible y disabled claros.
- **Mandato**: Su uso es **obligatorio** para acciones de éxito o confirmación que no sean la acción primaria del flujo.

<br>

---

### 🎨 **Paleta y Design Tokens Oficiales (SOLID GREEN DOCTRINE)**

> 💡 Instrucción para Notion: Copia la siguiente tabla y selecciona Turn into database. Esto creará una base de datos de tokens fácil de consultar y mantener.
> 

| Propiedad (Property) 🏷️ | Token (Name) | Valor (Value) 💻 | Descripción (Description) 📝 |
| --- | --- | --- | --- |
| background-color | --btn-constructive-bg | theme('colors.green.900') | Fondo base del botón. |
| color | --btn-constructive-text | theme('colors.green.100') | Color del texto. |
| border-color | --btn-constructive-border | theme('colors.green.700') | Borde sutil para definición. |
| background-color | --btn-constructive-bg-hover | theme('colors.green.800') | Fondo en estado :hover. |
| background-color | --btn-constructive-bg-disabled | theme('colors.slate.800') | Fondo en estado disabled. |
| color | --btn-constructive-text-disabled | theme('colors.slate.600') | Color de texto en disabled. |
| border-color | --btn-constructive-border-disabled | theme('colors.slate.700') | Borde en estado disabled. |

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
    bg-green-900 text-green-100
    border border-green-700
    transition-colors duration-200 ease-in-out
    hover:bg-green-800
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 focus-visible:ring-offset-slate-900
    disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 disabled:opacity-50
  "
>
  Confirmar Paso
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
  Confirmar Paso
</button>
```

▶️ **⚛️ Componente React Oficial (Implementación Canónica)**

> ✅ Ruta del Archivo: src/components/ui/constructive-action-button.tsx
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

const constructiveActionButtonVariants = cva(
  `inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold
   transition-colors duration-200 ease-in-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   focus-visible:ring-green-500 focus-visible:ring-offset-slate-900
   disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        default: `
          bg-green-900 text-green-100 border border-green-700
          hover:bg-green-800
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

export interface ConstructiveActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof constructiveActionButtonVariants> {
  asChild?: boolean
}

const ConstructiveActionButton = React.forwardRef<HTMLButtonElement, ConstructiveActionButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(constructiveActionButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
ConstructiveActionButton.displayName = "ConstructiveActionButton"

export { ConstructiveActionButton, constructiveActionButtonVariants }
```

<br>

---

### 🗺️ **Guía de Uso y Reglas de Negocio**

> 💡 Directiva Maestra: El color verde indica una acción positiva, segura o de avance. Debe guiar al usuario a través de los flujos de trabajo sin ser la acción terminal más importante de una vista.
> 
- **Casos de Uso:** "Siguiente", "Confirmar", "Guardar Cambios", "Añadir al Carrito", "Enviar".
- **Jerarquía:** Es la acción positiva por defecto. Es menos prominente que la Acción Primaria (Azul) y no debe usarse para acciones con consecuencias negativas.
- **Texto Claro:** El texto debe comunicar claramente la acción positiva a realizar.

<br>

---

### ✅ **Checklists de Calidad**

▶️ **♿ Accesibilidad (A11y)**

**Elemento Semántico**: Se utiliza el elemento <button> nativo.

**Contraste de Texto**: El texto cumple con el ratio de contraste AA (green-100 sobre green-900).

**Estado de Foco Visible**: El anillo de foco es claro y no depende solo del color.

**Estado Deshabilitado**: Se usa el atributo disabled y el estilo es inequívoco.

**No Depender del Color**: El texto y el contexto son la fuente principal de información.

▶️ **🧪 QA Visual**

**Estado Base**: Se renderiza con un fondo verde sólido y borde sutil.

**Estado Hover**: El fondo se oscurece sutilmente a green-800.

**Estado Foco**: El anillo de foco aparece al navegar con teclado.

**Estado Deshabilitado**: El botón no es interactivo, el cursor-not-allowed y opacity-50 se aplican.

**Text Overflow**: El texto largo se maneja correctamente sin romper el layout.

---

### 📝 **Changelog**

- **v1.0 (2025-09-07)**: Creación del estándar oficial ConstructiveActionButton y la "SOLID GREEN DOCTRINE" para manejar acciones de éxito y confirmación.