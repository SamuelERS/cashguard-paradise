import { GuidedDenominationSection, GuidedDenominationSectionProps } from "./GuidedDenominationSection";
import { DENOMINATION_CONFIGS } from "@/hooks/cash-counting/useGuidedDenomination";

/**
 * Props interface for GuidedBillSection
 * Inherits from base GuidedDenominationSection but excludes config props
 */
type GuidedBillSectionProps = Omit<GuidedDenominationSectionProps, 'config' | 'includeCoinsInCompleted'>;

/**
 * Specialized component for guided bill counting
 * 
 * This component is a thin wrapper around GuidedDenominationSection,
 * pre-configured for bill denominations. It maintains backward compatibility
 * with existing code while leveraging the consolidated base component.
 * 
 * Features:
 * - Green/success color scheme
 * - Dollar symbol ($) icon
 * - "Billetes" label
 * - Square icon style
 * - Tab index starting at 6 (after coins)
 * - Includes completed coins in the summary (for continuity)
 * 
 * @see GuidedDenominationSection for full documentation
 * 
 * @example
 * ```tsx
 * <GuidedBillSection
 *   cashCount={cashCount}
 *   isFieldActive={isFieldActive}
 *   isFieldCompleted={isFieldCompleted}
 *   isFieldAccessible={isFieldAccessible}
 *   onFieldConfirm={handleConfirm}
 *   onAttemptAccess={handleAttemptAccess}
 * />
 * ```
 */
export const GuidedBillSection = (props: GuidedBillSectionProps) => {
  return (
    <GuidedDenominationSection
      {...props}
      config={DENOMINATION_CONFIGS.bills}
      includeCoinsInCompleted={true}
    />
  );
};