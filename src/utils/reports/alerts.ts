// 🤖 [IA] - v2.8.2: Módulo de alertas para reportes WhatsApp
// Extraído de CashCalculation.tsx para reducir monolito (Auditoría "Cimientos de Cristal")
// Funciones puras sin dependencias de React state

import type { VerificationBehavior, VerificationAttempt } from '@/types/verification';
import type { CashCount } from '@/types/cash';

/**
 * Mapeo de claves de denominación a nombres en español
 * @param key - Clave de la denominación (ej: 'penny', 'bill20')
 * @returns Nombre legible en español
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
 * Formatea un timestamp ISO 8601 a formato HH:MM:SS (24h)
 * @param isoString - Timestamp en formato ISO 8601
 * @returns Hora formateada en zona horaria El Salvador
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
    return isoString; // Fallback si timestamp es inválido
  }
};

/**
 * Genera el bloque de alertas críticas para el reporte WhatsApp
 * Filtra denominaciones con severidad critical_severe o critical_inconsistent
 * @param behavior - Datos de comportamiento de verificación
 * @returns Texto formateado para WhatsApp o cadena vacía si no hay críticas
 */
export const generateCriticalAlertsBlock = (behavior: VerificationBehavior): string => {
  const criticalDenoms = behavior.denominationsWithIssues.filter(d =>
    d.severity === 'critical_severe' || d.severity === 'critical_inconsistent'
  );

  if (criticalDenoms.length === 0) return '';

  const alerts = criticalDenoms.map(issue => {
    return formatCriticalAlert(issue, behavior.attempts);
  }).join('\n\n');

  return `🔴 *CRÍTICAS (${criticalDenoms.length})*

${alerts}`;
};

/**
 * Formatea una alerta crítica individual
 * Separado para mantener funciones < 50 líneas
 */
const formatCriticalAlert = (
  issue: { denomination: keyof CashCount; severity: string; attempts: number[] },
  attempts: VerificationAttempt[]
): string => {
  const denomName = getDenominationName(issue.denomination);
  const attemptsStr = issue.attempts.join(' → ');

  // Buscar timestamps del primer y último intento
  const attemptsForDenom = attempts.filter(a => a.stepKey === issue.denomination);
  const videoTimestamp = formatVideoTimestamp(attemptsForDenom);

  // Descripción según severity
  const description = issue.severity === 'critical_severe' ?
    '   ⚠️ Patrón errático' :
    '   ⚠️ Inconsistencia severa';

  // Valor esperado
  const expectedValue = attemptsForDenom.length > 0 ? attemptsForDenom[0].expectedValue : '?';
  const expectedUnit = expectedValue === 1 ? 'unidad' : 'unidades';

  return `• ${denomName}
   Esperado: ${expectedValue} ${expectedUnit}
   Intentos: ${attemptsStr}
${videoTimestamp}
${description}`;
};

/**
 * Genera el bloque de advertencias para el reporte WhatsApp
 * Filtra denominaciones con severidad warning_retry o warning_override
 * @param behavior - Datos de comportamiento de verificación
 * @returns Texto formateado para WhatsApp o cadena vacía si no hay advertencias
 */
export const generateWarningAlertsBlock = (behavior: VerificationBehavior): string => {
  const warningDenoms = behavior.denominationsWithIssues.filter(d =>
    d.severity === 'warning_retry' || d.severity === 'warning_override'
  );

  if (warningDenoms.length === 0) return '';

  const alerts = warningDenoms.map(issue => {
    return formatWarningAlert(issue, behavior.attempts);
  }).join('\n\n');

  return `⚠️ *ADVERTENCIAS (${warningDenoms.length})*

${alerts}`;
};

/**
 * Formatea una advertencia individual
 * Separado para mantener funciones < 50 líneas
 */
const formatWarningAlert = (
  issue: { denomination: keyof CashCount; severity: string; attempts: number[] },
  attempts: VerificationAttempt[]
): string => {
  const denomName = getDenominationName(issue.denomination);
  const attemptsStr = issue.attempts.join(' → ');

  // Buscar timestamps
  const attemptsForDenom = attempts.filter(a => a.stepKey === issue.denomination);
  const videoTimestamp = formatVideoTimestamp(attemptsForDenom);

  // Valor esperado
  const expectedValue = attemptsForDenom.length > 0 ? attemptsForDenom[0].expectedValue : '?';
  const expectedUnit = expectedValue === 1 ? 'unidad' : 'unidades';

  return `• ${denomName}
   Esperado: ${expectedValue} ${expectedUnit}
   Intentos: ${attemptsStr}
${videoTimestamp}
   ℹ️ Corregido en ${attemptsForDenom.length}° intento`;
};

/**
 * Genera el timestamp de video para correlación con CCTV
 * @param attemptsForDenom - Intentos para una denominación específica
 * @returns Línea formateada con timestamps o cadena vacía
 */
const formatVideoTimestamp = (attemptsForDenom: VerificationAttempt[]): string => {
  if (attemptsForDenom.length === 0) return '';

  const firstTime = formatTimestamp(attemptsForDenom[0].timestamp);
  const lastTime = formatTimestamp(attemptsForDenom[attemptsForDenom.length - 1].timestamp);
  return `   📹 Video: ${firstTime} - ${lastTime}`;
};

/**
 * Genera detalle de anomalías para reporte extendido
 * @param behavior - Datos de comportamiento de verificación
 * @returns Texto formateado con detalles cronológicos
 */
export const generateAnomalyDetails = (behavior: VerificationBehavior): string => {
  // Filtrar solo intentos problemáticos:
  // - Todos los intentos incorrectos (isCorrect: false)
  // - Intentos correctos en 2do o 3er intento (attemptNumber > 1 y isCorrect: true)
  const problematicAttempts = behavior.attempts.filter(
    a => !a.isCorrect || a.attemptNumber > 1
  );

  if (problematicAttempts.length === 0) {
    return 'Sin anomalías detectadas - Todos los intentos correctos en primer intento ✅';
  }

  return problematicAttempts.map(attempt => {
    const denom = getDenominationName(attempt.stepKey);
    const time = formatTimestamp(attempt.timestamp);
    const status = attempt.isCorrect ? '✅ CORRECTO' : '❌ INCORRECTO';

    return `${status} | ${denom}
   Intento #${attempt.attemptNumber} | Hora: ${time}
   Ingresado: ${attempt.inputValue} unidades | Esperado: ${attempt.expectedValue} unidades`;
  }).join('\n\n');
};
