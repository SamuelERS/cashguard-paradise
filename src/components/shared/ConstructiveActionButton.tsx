// > [CTO] v3.1.2 - Creaci�n de ConstructiveActionButton. Cumple Doctrina D.1.
import React from 'react';
import { cn } from '@/lib/utils';

interface ConstructiveActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  icon?: React.ElementType;
}

export const ConstructiveActionButton: React.FC<ConstructiveActionButtonProps> = ({ text, icon: Icon, className, ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        'bg-green-900 text-green-100 hover:bg-green-800 h-10 px-4 py-2',
        'shadow-md shadow-green-900/50 border border-green-700',
        'disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700',
        'gap-2',
        className
      )}
      {...props}
    >
      {text}
      {Icon && <Icon className="h-4 w-4" />}
    </button>
  );
};