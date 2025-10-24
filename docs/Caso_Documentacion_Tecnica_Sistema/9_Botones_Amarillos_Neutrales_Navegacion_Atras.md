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

Estandarizar el diseño, la implementación y el uso de botones para acciones **neutrales o que requieren precaución del usuario** (ej. "Copiar", "Exportar", "Ver Detalles"). Este componente ocupa un lugar intermedio en la jerarquía visual, siendo menos imponente que la acción primaria (azul) pero más notorio que una acción secundaria.

---

<br>

▶️ **Resumen Ejecutivo**

- **Componente**: NeutralActionButton
- **Tecnología**: **React/TypeScript** y **Tailwind CSS**, integrado con shadcn/ui.
- **Estilo Principal**: Fondo amarillo/naranja sólido (dark mode) para atraer la atención sin implicar peligro inmediato. La interacción es una sutil variación de color.
- **Accesibilidad**: Cumplimiento de WCAG 2.1 con estados focus-visible y disabled claros.
- **Mandato**: Su uso es **obligatorio** para acciones de advertencia o neutrales que requieran un énfasis visual moderado.

<br>

---

### 🎨 **Paleta y Design Tokens Oficiales (SOLID YELLOW DOCTRINE)**

> 💡 Instrucción para Notion: Copia la siguiente tabla y selecciona Turn into database. Esto creará una base de datos de tokens fácil de consultar y mantener.
> 

| Propiedad (Property) 🏷️ | Token (Name) | Valor (Value) 💻 | Descripción (Description) 📝 |
| --- | --- | --- | --- |
| background-color | --btn-neutral-bg | theme('colors.yellow.900') | Fondo base del botón. |
| color | --btn-neutral-text | theme('colors.yellow.100') | Color del texto. |
| border-color | --btn-neutral-border | theme('colors.yellow.700') | Borde sutil para definición. |
| background-color | --btn-neutral-bg-hover | theme('colors.yellow.800') | Fondo en estado :hover. |
| background-color | --btn-neutral-bg-disabled | theme('colors.slate.800') | Fondo en estado disabled. |
| color | --btn-neutral-text-disabled | theme('colors.slate.600') | Color de texto en disabled. |
| border-color | --btn-neutral-border-disabled | theme('colors.slate.700') | Borde en estado disabled. |

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
    bg-yellow-900 text-yellow-100
    border border-yellow-700
    transition-colors duration-200 ease-in-out
    hover:bg-yellow-800
    focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-yellow-500 focus-visible:ring-offset-slate-900
    disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 disabled:opacity-50
  "
>
  Copiar Reporte
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
  Copiar Reporte
</button>
```

▶️ **⚛️ Componente React Oficial (Implementación Canónica)**

> ✅ Ruta del Archivo: src/components/ui/neutral-action-button.tsx
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

const neutralActionButtonVariants = cva(
  `inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold
   transition-colors duration-200 ease-in-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   focus-visible:ring-yellow-500 focus-visible:ring-offset-slate-900
   disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        default: `
          bg-yellow-900 text-yellow-100 border border-yellow-700
          hover:bg-yellow-800
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

export interface NeutralActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neutralActionButtonVariants> {
  asChild?: boolean
}

const NeutralActionButton = React.forwardRef<HTMLButtonElement, NeutralActionButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(neutralActionButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
NeutralActionButton.displayName = "NeutralActionButton"

export { NeutralActionButton, neutralActionButtonVariants }
```

<br>

---

### 🗺️ **Guía de Uso y Reglas de Negocio**

> 💡 Directiva Maestra: El color amarillo/naranja indica una acción secundaria importante o una advertencia. Debe usarse para guiar al usuario hacia acciones útiles pero no terminales, o para confirmar pasos que requieren atención.
> 
- **Casos de Uso:** "Copiar al portapapeles", "Exportar datos", "Ver Logs", "Resetear Filtros".
- **Jerarquía:** Es visualmente menos prominente que la Acción Primaria (Azul) y la Acción Destructiva (Roja), pero más que la Acción Constructiva (Verde).
- **Texto Claro:** El texto debe comunicar claramente la acción a realizar.

<br>

---

### ✅ **Checklists de Calidad**

▶️ **♿ Accesibilidad (A11y)**

**Elemento Semántico**: Se utiliza el elemento <button> nativo.

**Contraste de Texto**: El texto cumple con el ratio de contraste AA (yellow-100 sobre yellow-900).

**Estado de Foco Visible**: El anillo de foco es claro y no depende solo del color.

**Estado Deshabilitado**: Se usa el atributo disabled y el estilo es inequívoco.

**No Depender del Color**: El texto y el contexto son la fuente principal de información.

▶️ **🧪 QA Visual**

**Estado Base**: Se renderiza con un fondo amarillo/naranja sólido y borde sutil.

**Estado Hover**: El fondo se oscurece sutilmente a yellow-800.

**Estado Foco**: El anillo de foco aparece al navegar con teclado.

**Estado Deshabilitado**: El botón no es interactivo, el cursor-not-allowed y opacity-50 se aplican.

**Text Overflow**: El texto largo se maneja correctamente sin romper el layout.

---

### 📝 **Changelog**

- **v1.0 (2025-09-07)**: Creación del estándar oficial NeutralActionButton y la "SOLID YELLOW DOCTRINE" para manejar acciones de advertencia y neutrales.