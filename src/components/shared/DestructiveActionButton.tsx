// > [CTO] v3.1.2 - Creaci�n de DestructiveActionButton. Cumple Doctrina D.1.
import React from 'react';
import { cn } from '@/lib/utils';

interface DestructiveActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string; // Opcional para backward compatibility
  children?: React.ReactNode; // Nueva sintaxis preferida
}

export const DestructiveActionButton: React.FC<DestructiveActionButtonProps> = ({ text, children, className, ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold h-10 transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50',
        'bg-red-900 text-red-100 border border-red-700 hover:bg-red-800',
        'disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700',
        'px-4 py-2',
        className
      )}
      translate="no"
      data-translate="no"
      {...props}
    >
      {children || text}
    </button>
  );
};