// > [CTO] v3.1.2 - Creaci�n de DestructiveActionButton. Cumple Doctrina D.1.
import React from 'react';
import { cn } from '@/lib/utils';

interface DestructiveActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export const DestructiveActionButton: React.FC<DestructiveActionButtonProps> = ({ text, className, ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        'bg-red-900 text-red-100 hover:bg-red-800 h-10 px-4 py-2',
        'shadow-md shadow-red-900/50 border border-red-700',
        'disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700',
        className
      )}
      {...props}
    >
      {text}
    </button>
  );
};