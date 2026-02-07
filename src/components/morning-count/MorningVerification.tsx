/**
 * 🤖 [IA] - v1.4.1: Thin re-export (ORDEN #074 - Desmonolitización)
 *
 * Previous: v2.8.1 (742 líneas monolito)
 * Now: Re-export desde MorningVerificationView.tsx
 *
 * Lógica extraída a:
 *   - src/hooks/morning-verification/useMorningVerificationController.ts (controller)
 *   - src/lib/morning-verification/mvRules.ts (reglas de negocio)
 *   - src/lib/morning-verification/mvFormatters.ts (formateo reportes)
 *   - src/lib/morning-verification/mvSelectors.ts (lookups datos)
 *   - src/types/morningVerification.ts (tipos)
 */
export { MorningVerificationView as MorningVerification } from './MorningVerificationView';
