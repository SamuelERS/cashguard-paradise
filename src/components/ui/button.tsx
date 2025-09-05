import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "btn-primary",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg shadow-destructive/30",
        outline: "btn-secondary",
        secondary: "btn-secondary", 
        ghost: "glass-card hover:bg-primary/10 hover:text-primary text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "btn-success",
        confirm: "shadow-none border-2 bg-[#dcfce7] border-[#22c55e] text-[#14532d] hover:bg-[#bbf7d0] hover:border-[#16a34a] dark:bg-[#14532d] dark:border-[#15803d] dark:text-[#dcfce7] dark:hover:bg-[#166534] disabled:bg-[#374151] disabled:border-[#4b5563]/30 disabled:text-[#6b7280]",
        glass: "glass-card hover:bg-primary/10 hover:border-primary/30 text-foreground",
        ready: "border-none text-white transition-all duration-300 shadow-md",
        "wizard-nav-next": "bg-blue-500 text-white hover:bg-blue-600",
        "wizard-nav-previous": "bg-gray-200 text-gray-700 hover:bg-gray-300",
        "glass-alert-action": "bg-transparent border border-white text-white hover:bg-white hover:text-black",
        "glass-alert-cancel": "bg-red-500 text-white hover:bg-red-600"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-lg px-4 py-2 text-sm",
        lg: "h-14 rounded-xl px-8 py-4 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
