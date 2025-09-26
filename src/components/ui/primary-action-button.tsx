// Ubicación: src/components/ui/primary-action-button.tsx

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"
import { primaryActionButtonVariants, type PrimaryActionButtonProps } from "./primary-action-button.utils"

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

export { PrimaryActionButton }
