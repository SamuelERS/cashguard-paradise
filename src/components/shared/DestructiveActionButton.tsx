// 🤖 [IA] - v1.3.6g: BUG FIX #2 - Migrado a React.forwardRef + asChild support (Radix UI compatibility)
// > [CTO] v3.1.2 - Creación de DestructiveActionButton. Cumple Doctrina D.1.
import * as React from 'react';
import { Slot } from "@radix-ui/react-slot";
import { cn } from '@/lib/utils';

interface DestructiveActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string; // Opcional para backward compatibility
  icon?: React.ElementType; // Opcional para backward compatibility
  children?: React.ReactNode; // Nueva sintaxis preferida
  asChild?: boolean; // Radix UI compatibility
}

const DestructiveActionButton = React.forwardRef<HTMLButtonElement, DestructiveActionButtonProps>(
  ({ text, icon: Icon, children, className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50',
          'bg-red-900 text-red-100 border border-red-700 hover:bg-red-800',
          'disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700',
          'h-fluid-3xl min-h-[var(--space-3xl)] px-fluid-lg py-2',
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
DestructiveActionButton.displayName = "DestructiveActionButton";

export { DestructiveActionButton };
