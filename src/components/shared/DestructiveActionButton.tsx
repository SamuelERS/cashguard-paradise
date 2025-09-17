// > [CTO] v3.1.2 - Creación de DestructiveActionButton. Cumple Doctrina D.1.
import React from 'react';
import { cn } from '@/lib/utils';

interface DestructiveActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
}

export const DestructiveActionButton: React.FC<DestructiveActionButtonProps> = ({ text, className, ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        'bg-red-600 text-red-50 hover:bg-red-700/90 h-10 px-4 py-2',
        'shadow-md shadow-red-900/50 border border-red-500',
        'disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700',
        className
      )}
      {...props}
    >
      {text}
    </button>
  );
};