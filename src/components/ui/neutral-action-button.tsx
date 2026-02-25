// 🤖 [IA] - v1.2.41T: Paleta gris neutral profesional (Gris-Verde Pattern)
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const neutralActionButtonVariants = cva(
  `inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold
   h-[clamp(2.75rem,7.2vw,3rem)] min-h-[44px] px-[clamp(0.875rem,3vw,1.25rem)] transition-colors duration-200 ease-in-out
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
   focus-visible:ring-gray-500 focus-visible:ring-offset-slate-900
   disabled:pointer-events-none disabled:opacity-50`,
  {
    variants: {
      variant: {
        default: `
          bg-gray-600 text-gray-100 border border-gray-500
          hover:bg-gray-500
          disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700
        `,
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface NeutralActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof neutralActionButtonVariants> {
  asChild?: boolean
}

const NeutralActionButton = React.forwardRef<HTMLButtonElement, NeutralActionButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(neutralActionButtonVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
NeutralActionButton.displayName = "NeutralActionButton"

export { NeutralActionButton, neutralActionButtonVariants }
