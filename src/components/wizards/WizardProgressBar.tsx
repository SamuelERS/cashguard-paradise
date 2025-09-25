import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WizardProgressBarProps {
  currentStep: number;
  totalSteps: number;
  gradient?: string;
  className?: string;
}

/**
 * Shared progress bar for wizard modals. Maintains consistent height, radius and animation.
 */
export function WizardProgressBar({
  currentStep,
  totalSteps,
  gradient = 'linear-gradient(90deg, #0a84ff, #5e5ce6)',
  className
}: WizardProgressBarProps) {
  const progress = Math.max(0, Math.min(100, (currentStep / Math.max(totalSteps, 1)) * 100));

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-full bg-slate-800/80',
        'h-[clamp(0.375rem,2vw,0.5rem)]',
        className
      )}
    >
      <motion.div
        className="absolute left-0 top-0 h-full rounded-full"
        style={{ background: gradient }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      />
    </div>
  );
}

export default WizardProgressBar;
