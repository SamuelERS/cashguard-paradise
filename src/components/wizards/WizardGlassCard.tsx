import React from 'react';
import { cn } from '@/lib/utils';

type WizardGlassCardProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Consistent glass morphism wrapper for wizard modals.
 * Applies shared border, blur, and radius so both flows keep identical structure.
 */
export function WizardGlassCard({ className, ...props }: WizardGlassCardProps) {
  return (
    <div
      className={cn('glass-morphism-panel', className)}
      {...props}
    />
  );
}

export default WizardGlassCard;
