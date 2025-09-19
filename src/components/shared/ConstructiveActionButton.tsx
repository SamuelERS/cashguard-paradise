// > [CTO] v3.1.2 - Creaci�n de ConstructiveActionButton. Cumple Doctrina D.1.
import React from 'react';
import { cn } from '@/lib/utils';

interface ConstructiveActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string; // Opcional para backward compatibility
  icon?: React.ElementType; // Opcional para backward compatibility
  children?: React.ReactNode; // Nueva sintaxis preferida
}

export const ConstructiveActionButton: React.FC<ConstructiveActionButtonProps> = ({ text, icon: Icon, children, className, ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-green-500 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50',
        'bg-green-900 text-green-100 border border-green-700 hover:bg-green-800',
        'disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700',
        'h-fluid-3xl min-h-[var(--space-3xl)] px-fluid-lg py-2',
        className
      )}
      translate="no"
      data-translate="no"
      {...props}
    >
      {children || text}
      {Icon && <Icon className="h-4 w-4" />}
    </button>
  );
};