// 🤖 [IA] - v1.2.27: Utility file for primary-action-button non-component exports
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

export const primaryActionButtonVariants = cva(
  `inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold
   h-10 transition-all duration-200 ease-in-out
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

export interface PrimaryActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof primaryActionButtonVariants> {
  asChild?: boolean
}