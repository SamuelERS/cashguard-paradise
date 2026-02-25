// 🤖 [IA] - v1.3.6g: BUG FIX #2 - Migrado a React.forwardRef + asChild support (Radix UI compatibility)
// > [CTO] v3.1.2 - Creación de ConstructiveActionButton. Cumple Doctrina D.1.
import * as React from 'react';
import { Slot } from "@radix-ui/react-slot";
import { cn } from '@/lib/utils';

interface ConstructiveActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string; // Opcional para backward compatibility
  icon?: React.ElementType; // Opcional para backward compatibility
  children?: React.ReactNode; // Nueva sintaxis preferida
  asChild?: boolean; // Radix UI compatibility
}

const ConstructiveActionButton = React.forwardRef<HTMLButtonElement, ConstructiveActionButtonProps>(
  ({ text, icon: Icon, children, className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50',
          'bg-green-900 text-green-100 border border-green-700 hover:bg-green-800',
          'disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700',
          'h-[clamp(2.75rem,7.2vw,3rem)] min-h-[44px] px-[clamp(0.875rem,3vw,1.25rem)]',
          className
        )}
        translate="no"
        data-translate="no"
        ref={ref}
        {...props}
      >
        {children || text}
        {Icon && <Icon className="h-4 w-4" />}
      </Comp>
    );
  }
);
ConstructiveActionButton.displayName = "ConstructiveActionButton";

export { ConstructiveActionButton };
