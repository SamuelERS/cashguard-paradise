// Ubicación: src/components/ui/destructive-action-button.tsx

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils" // Asumiendo que la utilidad cn() existe en esta ruta.

const destructiveActionButtonVariants = cva(
  `inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold
   h-10 transition-all duration-200 ease-in-out
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
        default: "px-4 py-2",
        sm: "rounded-md px-3 py-1.5",
        lg: "rounded-md px-8 py-3",
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