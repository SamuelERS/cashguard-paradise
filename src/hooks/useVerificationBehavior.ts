// 🤖 [IA] - Desmonolitado desde Phase2VerificationSection.tsx
// Lógica de construcción de VerificationBehavior desde attemptHistory
import { useMemo } from 'react';
import type { VerificationBehavior, VerificationAttempt, VerificationSeverity } from '@/types/verification';
import type { CashCount } from '@/types/cash';
import type { DeliveryStep } from '@/types/phases';

/**
 * Hook que construye el objeto VerificationBehavior completo desde attemptHistory Map
 * @param attemptHistory - Map de intentos por denominación
 * @param verificationSteps - Array de pasos de verificación
 * @returns VerificationBehavior con métricas agregadas y detalles de intentos
 */
export function useVerificationBehavior(
  attemptHistory: Map<string, VerificationAttempt[]>,
  verificationSteps: DeliveryStep[]
): VerificationBehavior {
  return useMemo(() => {
    const allAttempts: VerificationAttempt[] = [];
    // 🤖 [IA] - v1.3.6Y: firstAttemptSuccesses se calculará por diferencia después del forEach
    let secondAttemptSuccesses = 0;
    let thirdAttemptRequired = 0;
    let forcedOverrides = 0;
    let criticalInconsistencies = 0;
    let severeInconsistencies = 0;
    const severityFlags: VerificationSeverity[] = [];
    const forcedOverridesDenoms: Array<keyof CashCount> = [];
    const criticalInconsistenciesDenoms: Array<keyof CashCount> = [];
    const severeInconsistenciesDenoms: Array<keyof CashCount> = [];
    // 🤖 [IA] - v1.3.6P: Array consolidado de denominaciones con issues (para reporte WhatsApp)
    const denominationsWithIssues: Array<{
      denomination: keyof CashCount;
      severity: VerificationSeverity;
      attempts: number[];
    }> = [];

    // Iterar sobre attemptHistory Map
    attemptHistory.forEach((attempts, stepKey) => {
      allAttempts.push(...attempts);

      // 🤖 [IA] - v1.3.6P: Determinar severity para esta denominación
      let currentSeverity: VerificationSeverity = 'success';

      // Analizar patrón de intentos por denominación
      if (attempts.length === 1) {
        if (attempts[0].isCorrect) {
          // 🤖 [IA] - v1.3.6Y: firstAttemptSuccesses++ removido (se calcula por diferencia después)
          currentSeverity = 'success'; // ← v1.3.6P: Explícito
        } else {
          // 🤖 [IA] - v1.3.6Q: FIX BUG #1 - Primer intento incorrecto
          // Root cause: Sin else block, severity quedaba como 'success' (default línea 165)
          // Solución: Setear 'warning_retry' para que aparezca en reporte advertencias
          currentSeverity = 'warning_retry';
          severityFlags.push('warning_retry');
        }
      } else if (attempts.length === 2) {
        // Verificar si segundo intento fue correcto
        if (attempts[1].isCorrect) {
          secondAttemptSuccesses++;
          currentSeverity = 'warning_retry'; // ← v1.3.6P: Capturar severity
          severityFlags.push('warning_retry');
        } else {
          // Dos intentos incorrectos
          if (attempts[0].inputValue === attempts[1].inputValue) {
            // Force override (dos intentos iguales incorrectos)
            forcedOverrides++;
            forcedOverridesDenoms.push(stepKey as keyof CashCount);
            currentSeverity = 'warning_override'; // ← v1.3.6P: Capturar severity
            severityFlags.push('warning_override');
          } else {
            // 🤖 [IA] - v1.3.6Q: FIX BUG #3 - Dos intentos diferentes (patrón [A, B])
            // Root cause: Marcaba como 'critical_inconsistent' pero tercer intento NO garantizado
            // Solución: Marcar como 'warning_retry' (advertencia), solo crítico si hay 3 intentos
            currentSeverity = 'warning_retry';
            severityFlags.push('warning_retry');
            thirdAttemptRequired++; // Mantener contador para tracking métrico
          }
        }
      } else if (attempts.length >= 3) {
        // Tercer intento ejecutado
        thirdAttemptRequired++;

        // Analizar severidad del pattern
        const [attempt1, attempt2, attempt3] = attempts;

        if (
          (attempt1.inputValue === attempt3.inputValue && attempt1.inputValue !== attempt2.inputValue) ||
          (attempt2.inputValue === attempt3.inputValue && attempt2.inputValue !== attempt1.inputValue)
        ) {
          // Pattern [A,B,A] o [A,B,B] - inconsistencia crítica
          criticalInconsistencies++;
          criticalInconsistenciesDenoms.push(stepKey as keyof CashCount);
          currentSeverity = 'critical_inconsistent'; // ← v1.3.6P: Capturar severity
          severityFlags.push('critical_inconsistent');
        } else {
          // Pattern [A,B,C] - severamente inconsistente
          severeInconsistencies++;
          severeInconsistenciesDenoms.push(stepKey as keyof CashCount);
          currentSeverity = 'critical_severe'; // ← v1.3.6P: Capturar severity
          severityFlags.push('critical_severe');
        }
      }

      // 🤖 [IA] - v1.3.6P: Agregar a denominationsWithIssues si NO es success
      if (currentSeverity !== 'success') {
        denominationsWithIssues.push({
          denomination: stepKey as keyof CashCount,
          severity: currentSeverity,
          attempts: attempts.map(a => a.inputValue)
        });
      }
    });

    // 🤖 [IA] - v1.3.6Y: FIX CÁLCULO PERFECTAS - Calcular por diferencia (Total - Errores)
    // Root cause: attemptHistory solo contiene denominaciones con intentos (errores)
    // Solución: Total denominaciones - denominaciones con issues = denominaciones perfectas
    const totalDenominations = verificationSteps.length;
    const firstAttemptSuccesses = totalDenominations - denominationsWithIssues.length;

    const finalBehavior = {
      totalAttempts: allAttempts.length,
      firstAttemptSuccesses,
      secondAttemptSuccesses,
      thirdAttemptRequired,
      forcedOverrides,
      criticalInconsistencies,
      severeInconsistencies,
      attempts: allAttempts.sort((a, b) => a.timestamp.localeCompare(b.timestamp)), // Ordenar por timestamp
      severityFlags,
      forcedOverridesDenoms,
      criticalInconsistenciesDenoms,
      severeInconsistenciesDenoms,
      denominationsWithIssues // 🤖 [IA] - v1.3.6P: Array consolidado para reporte WhatsApp
    };

    return finalBehavior;
  }, [attemptHistory, verificationSteps]);
}
