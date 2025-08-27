import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, inputMode, pattern, ...props }, ref) => {
    // 🤖 [IA] - Respetar inputMode y pattern explícitos de componentes - BUG #2 Fix
    const isNumericField = type === "number";
    const actualType = isNumericField ? "text" : type;
    
    // 🤖 [IA] - Solo aplicar props automáticos si no se especifican explícitamente
    const autoNumericProps = isNumericField && !inputMode && !pattern ? {
      inputMode: "numeric" as const,  // Teclado numérico sin punto decimal
      pattern: "[0-9]*",  // Validación de solo números
      autoComplete: "off",  // 🤖 [IA] - Evitar autocompletado
      enterKeyHint: "next" as const  // 🤖 [IA] - Sugerir acción "siguiente" en iOS
    } : {};
    
    return (
      <input
        type={actualType}
        inputMode={inputMode} // 🤖 [IA] - Respetar inputMode explícito
        pattern={pattern} // 🤖 [IA] - Respetar pattern explícito
        {...autoNumericProps} // 🤖 [IA] - Aplicar props automáticos solo si no hay explícitos
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
