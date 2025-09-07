// Ubicación: src/components/ui/primary-action-button.tsx

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const primaryActionButtonVariants = cva(
  `inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold
   transition-all duration-200 ease-in-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   focus-visible:ring-blue-500 focus-visible:ring-offset-slate-900
   disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        default: `
          bg-blue-700 text-blue-100 border border-blue-800
          hover:bg-blue-600
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

export interface PrimaryActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof primaryActionButtonVariants> {
  asChild?: boolean
}

const PrimaryActionButton = React.forwardRef<HTMLButtonElement, PrimaryActionButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(primaryActionButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
PrimaryActionButton.displayName = "PrimaryActionButton"

export { PrimaryActionButton, primaryActionButtonVariants }
