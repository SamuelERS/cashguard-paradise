// 🤖 [IA] - Funciones puras compartidas entre CashCalculation.tsx y MorningVerification.tsx
// Extraídas para eliminar warnings react-hooks/exhaustive-deps y duplicación (DRY - Mandamiento #6)

import type { VerificationBehavior } from '@/types/verification';
import type { CashCount } from '@/types/cash';
import { formatCurrency } from '@/utils/calculations';

/**
 * Separador visual para reportes WhatsApp (12 caracteres, optimizado para mobile)
 */
export const WHATSAPP_SEPARATOR = '━━━━━━━━━━━━';

/**
 * Lista de denominaciones USD con labels en español y valor unitario
 */
const DENOMINATIONS = [
  { key: 'penny', label: '1¢', value: 0.01 },
  { key: 'nickel', label: '5¢', value: 0.05 },
  { key: 'dime', label: '10¢', value: 0.10 },
  { key: 'quarter', label: '25¢', value: 0.25 },
  { key: 'dollarCoin', label: '$1 moneda', value: 1.00 },
  { key: 'bill1', label: '$1', value: 1.00 },
  { key: 'bill5', label: '$5', value: 5.00 },
  { key: 'bill10', label: '$10', value: 10.00 },
  { key: 'bill20', label: '$20', value: 20.00 },
  { key: 'bill50', label: '$50', value: 50.00 },
  { key: 'bill100', label: '$100', value: 100.00 }
] as const;

/**
 * Genera desglose de denominaciones con cantidades > 0 para reporte WhatsApp
 * Formato: "1¢ × 43 = $0.43" por línea
 */
export const generateDenominationDetails = (cashCount: CashCount): string => {
  return DENOMINATIONS
    .filter(d => cashCount[d.key as keyof CashCount] > 0)
    .map(d => {
      const quantity = cashCount[d.key as keyof CashCount];
      const subtotal = quantity * d.value;
      return `${d.label} × ${quantity} = ${formatCurrency(subtotal)}`;
    })
    .join('\n');
};

/**
 * Mapeo de denomination key a nombre legible en español
 */
export const getDenominationName = (key: keyof CashCount): string => {
  const names: Record<keyof CashCount, string> = {
    penny: 'Un centavo (1¢)',
    nickel: 'Cinco centavos (5¢)',
    dime: 'Diez centavos (10¢)',
    quarter: 'Veinticinco centavos (25¢)',
    dollarCoin: 'Moneda de un dólar ($1)',
    bill1: 'Billete de un dólar ($1)',
    bill5: 'Billete de cinco dólares ($5)',
    bill10: 'Billete de diez dólares ($10)',
    bill20: 'Billete de veinte dólares ($20)',
    bill50: 'Billete de cincuenta dólares ($50)',
    bill100: 'Billete de cien dólares ($100)'
  };
  return names[key] || key;
};

/**
 * Formatea timestamp ISO 8601 a HH:MM:SS zona America/El_Salvador
 */
export const formatTimestamp = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-SV', {
      timeZone: 'America/El_Salvador',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch {
    return isoString;
  }
};

/**
 * Genera bloque de alertas críticas (critical_severe, critical_inconsistent) para reporte WhatsApp
 */
export const generateCriticalAlertsBlock = (behavior: VerificationBehavior): string => {
  const criticalDenoms = behavior.denominationsWithIssues.filter(d =>
    d.severity === 'critical_severe' || d.severity === 'critical_inconsistent'
  );

  if (criticalDenoms.length === 0) return '';

  const alerts = criticalDenoms.map(issue => {
    const denomName = getDenominationName(issue.denomination);
    const attemptsStr = issue.attempts.join(' → ');

    const attemptsForDenom = behavior.attempts.filter(a => a.stepKey === issue.denomination);
    let videoTimestamp = '';
    if (attemptsForDenom.length > 0) {
      const firstTime = formatTimestamp(attemptsForDenom[0].timestamp);
      const lastTime = formatTimestamp(attemptsForDenom[attemptsForDenom.length - 1].timestamp);
      videoTimestamp = `   📹 Video: ${firstTime} - ${lastTime}`;
    }

    const description = issue.severity === 'critical_severe' ?
      '   ⚠️ Patrón errático' :
      '   ⚠️ Inconsistencia severa';

    const expectedValue = attemptsForDenom.length > 0 ? attemptsForDenom[0].expectedValue : '?';
    const expectedUnit = expectedValue === 1 ? 'unidad' : 'unidades';

    return `• ${denomName}
   Esperado: ${expectedValue} ${expectedUnit}
   Intentos: ${attemptsStr}
${videoTimestamp}
${description}`;
  }).join('\n\n');

  return `🔴 *CRÍTICAS (${criticalDenoms.length})*

${alerts}`;
};

/**
 * Genera bloque de advertencias (warning_retry, warning_override) para reporte WhatsApp
 */
export const generateWarningAlertsBlock = (behavior: VerificationBehavior): string => {
  const warningDenoms = behavior.denominationsWithIssues.filter(d =>
    d.severity === 'warning_retry' || d.severity === 'warning_override'
  );

  if (warningDenoms.length === 0) return '';

  const alerts = warningDenoms.map(issue => {
    const denomName = getDenominationName(issue.denomination);
    const attemptsStr = issue.attempts.join(' → ');

    const attemptsForDenom = behavior.attempts.filter(a => a.stepKey === issue.denomination);
    let videoTimestamp = '';
    if (attemptsForDenom.length > 0) {
      const firstTime = formatTimestamp(attemptsForDenom[0].timestamp);
      const lastTime = formatTimestamp(attemptsForDenom[attemptsForDenom.length - 1].timestamp);
      videoTimestamp = `   📹 Video: ${firstTime} - ${lastTime}`;
    }

    const expectedValue = attemptsForDenom.length > 0 ? attemptsForDenom[0].expectedValue : '?';
    const expectedUnit = expectedValue === 1 ? 'unidad' : 'unidades';

    return `• ${denomName}
   Esperado: ${expectedValue} ${expectedUnit}
   Intentos: ${attemptsStr}
${videoTimestamp}
   ℹ️ Corregido en ${attemptsForDenom.length}° intento`;
  }).join('\n\n');

  return `⚠️ *ADVERTENCIAS (${warningDenoms.length})*

${alerts}`;
};
