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
        secondary: "btn-secondary", 
        ghost: "glass-card hover:bg-primary/10 hover:text-primary text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-100 text-green-900 border border-green-500 hover:bg-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-700 dark:hover:bg-green-200",
        info: "bg-blue-100 text-blue-900 border border-blue-500 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-700 dark:hover:bg-blue-200",
        warning: "bg-yellow-100 text-yellow-900 border border-yellow-500 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100 dark:border-yellow-700 dark:hover:bg-yellow-200",
        error: "bg-red-100 text-red-900 border border-red-500 hover:bg-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-700 dark:hover:bg-red-200",
        glass: "glass-card hover:bg-primary/10 hover:border-primary/30 text-foreground",
        ready: "border-none text-white transition-all duration-300 shadow-md",
        "wizard-nav-next": "bg-blue-500 text-white hover:bg-blue-600",
        "wizard-nav-previous": "bg-gray-200 text-gray-700 hover:bg-gray-300",
        "glass-alert-action": "bg-transparent border border-white text-white hover:bg-white hover:text-black",
        "glass-alert-cancel": "bg-red-500 text-white hover:bg-red-600",
        "gradient-dynamic": "border-none text-white font-semibold transition-all duration-300",
        "morning-gradient": "border-none text-white font-semibold transition-all duration-300",
        "phase2-tab": "btn-phase2-tab",
        "phase2-back": "btn-phase2-back",
        "phase2-verify": "btn-phase2-verify",
        "phase2-confirm": "btn-phase2-confirm",
        "guided-confirm": "btn-guided-confirm",
        "guided-start": "btn-guided-start"
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-9 rounded-lg px-4 py-2 text-sm",
        lg: "h-14 rounded-xl px-8 py-4 text-lg",
        icon: "h-12 w-12",
        "icon-sm": "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 
    | "default" 
    | "destructive" 
    | "secondary" 
    | "ghost" 
    | "link" 
    | "success" 
    | "info" 
    | "warning" 
    | "error" 
    | "glass" 
    | "ready" 
    | "wizard-nav-next" 
    | "wizard-nav-previous" 
    | "glass-alert-action" 
    | "glass-alert-cancel" 
    | "gradient-dynamic" 
    | "morning-gradient" 
    | "phase2-tab" 
    | "phase2-back" 
    | "phase2-verify" 
    | "phase2-confirm" 
    | "guided-confirm"
    | "guided-start"
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm"
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
