/**
 * 🤖 [IA] - v1.4.1: mvFormatters - Formateo de reportes matutinos (ORDEN #074)
 * Extraído de MorningVerification.tsx (líneas 74-82, 112-182, 307-317)
 *
 * @description
 * Funciones de formateo para reporte WhatsApp, reporte imprimible,
 * y timestamp de verificación.
 */
import type { MorningReportParams } from '@/types/morningVerification';
import { formatCurrency } from '@/utils/calculations';
import { generateDenominationDetails, WHATSAPP_SEPARATOR } from '@/utils/reportHelpers';

// ────────────────────────────────────────────────────────────────
// Timestamp (extraído de performVerification, monolito líneas 74-82)
// ────────────────────────────────────────────────────────────────

/**
 * Genera timestamp formateado en locale es-SV para verificación.
 * Formato: dd/mm/yyyy, hh:mm a. m./p. m.
 *
 * @remarks
 * Validar en tests con regex `\d{1,2}/\d{1,2}/\d{4}` (Ajuste #3 ORDEN #074)
 */
export function formatVerificationTimestamp(): string {
  return new Date().toLocaleString('es-SV', {
    timeZone: 'America/El_Salvador',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// ────────────────────────────────────────────────────────────────
// Reporte WhatsApp (monolito líneas 112-182)
// ────────────────────────────────────────────────────────────────

/**
 * Genera reporte completo de verificación matutina para WhatsApp.
 *
 * @param params - Datos resueltos para el reporte
 * @returns Texto formateado con markdown WhatsApp (*negritas*)
 */
export function generateMorningReport(params: MorningReportParams): string {
  const { verificationData, store, cashierIn, cashierOut, cashCount, dataHash } = params;

  // Header dinámico según estado
  const headerSeverity = verificationData.hasShortage || verificationData.hasExcess
    ? '⚠️ *REPORTE ADVERTENCIA*'
    : '✅ *REPORTE NORMAL*';

  const SEPARATOR = WHATSAPP_SEPARATOR;

  // Desglose de denominaciones
  const denominationDetails = generateDenominationDetails(cashCount);

  // Estado y mensaje
  const statusMessage = verificationData.isCorrect
    ? '✅ Estado: CORRECTO'
    : '⚠️ Estado: DIFERENCIA DETECTADA';

  const alertMessage = verificationData.hasShortage
    ? '⚠️ FALTANTE: Revisar con cajero saliente'
    : verificationData.hasExcess
    ? '⚠️ SOBRANTE: Verificar origen del exceso'
    : '';

  return `${headerSeverity}


📊 *CONTEO DE CAJA MATUTINO*
${verificationData.timestamp}

Sucursal: ${store?.name || 'N/A'}
Cajero Entrante: ${cashierIn?.name || 'N/A'}
Cajero Saliente: ${cashierOut?.name || 'N/A'}

${SEPARATOR}

📊 *RESUMEN EJECUTIVO*

💰 Total Contado: *${formatCurrency(verificationData.totalCash)}*
🎯 Cambio Esperado: *${formatCurrency(verificationData.expectedAmount)}*
📊 Diferencia: *${formatCurrency(verificationData.difference)}* (${verificationData.isCorrect ? 'CORRECTO' : verificationData.difference > 0 ? 'SOBRANTE' : 'FALTANTE'})

${SEPARATOR}

💰 *CONTEO COMPLETO (${formatCurrency(verificationData.totalCash)})*

${denominationDetails}

${SEPARATOR}

🔍 *VERIFICACIÓN*

${statusMessage}
${alertMessage}

${SEPARATOR}

📅 ${verificationData.timestamp}
🔐 CashGuard Paradise v3.4.1
🔒 NIST SP 800-115 | PCI DSS 12.10.1

✅ Reporte automático
⚠️ Documento NO editable

Firma Digital: ${dataHash}`;
}

// ────────────────────────────────────────────────────────────────
// Reporte imprimible (monolito líneas 307-317)
// ────────────────────────────────────────────────────────────────

/**
 * Descarga reporte como archivo .txt
 *
 * @param reportText - Texto del reporte a descargar
 */
export function downloadPrintableReport(reportText: string): void {
  const blob = new Blob([reportText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `conteo-matutino-${new Date().getTime()}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
