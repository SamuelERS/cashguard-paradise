import { GuidedDenominationSection, GuidedDenominationSectionProps } from "./GuidedDenominationSection";
import { DENOMINATION_CONFIGS } from "@/hooks/cash-counting/useGuidedDenomination";

/**
 * Props interface for GuidedCoinSection
 * Inherits from base GuidedDenominationSection but excludes config props
 */
type GuidedCoinSectionProps = Omit<GuidedDenominationSectionProps, 'config' | 'includeCoinsInCompleted'>;

/**
 * Specialized component for guided coin counting
 * 
 * This component is a thin wrapper around GuidedDenominationSection,
 * pre-configured for coin denominations. It maintains backward compatibility
 * with existing code while leveraging the consolidated base component.
 * 
 * Features:
 * - Orange/warning color scheme
 * - Cent symbol (¢) icon
 * - "Monedas" label
 * - Rounded icon style
 * - Tab index starting at 1
 * 
 * @see GuidedDenominationSection for full documentation
 * 
 * @example
 * ```tsx
 * <GuidedCoinSection
 *   cashCount={cashCount}
 *   isFieldActive={isFieldActive}
 *   isFieldCompleted={isFieldCompleted}
 *   isFieldAccessible={isFieldAccessible}
 *   onFieldConfirm={handleConfirm}
 *   onAttemptAccess={handleAttemptAccess}
 * />
 * ```
 */
export const GuidedCoinSection = (props: GuidedCoinSectionProps) => {
  return (
    <GuidedDenominationSection
      {...props}
      config={DENOMINATION_CONFIGS.coins}
      includeCoinsInCompleted={false}
    />
  );
};