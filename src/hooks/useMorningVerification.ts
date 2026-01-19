// 🤖 [IA] - v1.0.0: Custom hook para lógica de verificación matutina (Auditoría Cimientos de Cristal - Fase 2C)
// Extrae estados, cálculos y handlers de MorningVerification.tsx para reducir monolito a <500 líneas

import { useState, useEffect, useCallback, useMemo } from 'react';
import { calculateCashTotal, formatCurrency } from '@/utils/calculations';
import { copyToClipboard } from '@/utils/clipboard';
import { CashCount, Store, Employee } from '@/types/cash';
import { getStoreById, getEmployeeById } from '@/data/paradise';
import { toast } from 'sonner';

// ============================================================================
// INTERFACES
// ============================================================================

export interface VerificationData {
  totalCash: number;
  expectedAmount: number;
  difference: number;
  isCorrect: boolean;
  hasShortage: boolean;
  hasExcess: boolean;
  timestamp: string;
}

export interface WhatsAppState {
  reportSent: boolean;
  whatsappOpened: boolean;
  popupBlocked: boolean;
  showInstructions: boolean;
}

export interface UseMorningVerificationOptions {
  storeId: string;
  cashierId: string;
  witnessId: string;
  cashCount: CashCount;
}

export interface UseMorningVerificationResult {
  // Data
  verificationData: VerificationData | null;
  store: Store | null;
  cashierIn: Employee | null;
  cashierOut: Employee | null;

  // WhatsApp state
  whatsappState: WhatsAppState;

  // Report generation
  generateReport: () => string;

  // Handlers
  handleWhatsAppSend: () => Promise<void>;
  handleConfirmSent: () => void;
  handleCopyToClipboard: () => Promise<void>;
  handleShare: () => Promise<void>;
  handleDownload: () => void;

  // Modal controls
  closeInstructions: () => void;

  // Platform detection
  isMobile: boolean;
  isMac: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const EXPECTED_CHANGE_AMOUNT = 50; // Siempre $50 para cambio
const TOLERANCE_CENTS = 0.01; // Tolerancia de 1 centavo
const SHORTAGE_THRESHOLD = -1.00;
const EXCESS_THRESHOLD = 1.00;
const REPORT_SEPARATOR = '━━━━━━━━━━━━━━━━';
const REPORT_VERSION = 'v2.7';

// Configuración de denominaciones para generación de reportes
const DENOMINATION_CONFIG = [
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

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Genera timestamp formateado para El Salvador
 */
function generateTimestamp(): string {
  return new Date().toLocaleString('es-SV', {
    timeZone: 'America/El_Salvador',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Genera desglose de denominaciones para el reporte
 */
function generateDenominationDetails(cashCount: CashCount): string {
  return DENOMINATION_CONFIG
    .filter(d => cashCount[d.key as keyof CashCount] > 0)
    .map(d => {
      const quantity = cashCount[d.key as keyof CashCount];
      const subtotal = quantity * d.value;
      return `${d.label} × ${quantity} = ${formatCurrency(subtotal)}`;
    })
    .join('\n');
}

/**
 * Genera firma digital del reporte
 */
function generateDataHash(
  data: VerificationData,
  store: Store | null,
  cashierIn: Employee | null,
  cashierOut: Employee | null
): string {
  const dataString = JSON.stringify({
    total: data.totalCash,
    expected: data.expectedAmount,
    diff: data.difference,
    store: store?.id,
    cashierIn: cashierIn?.id,
    cashierOut: cashierOut?.id,
    timestamp: data.timestamp
  });

  return btoa(dataString).substring(0, 16);
}

/**
 * Copia texto al portapapeles con fallback robusto
 */
async function copyToClipboardWithFallback(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Fallback para navegadores antiguos o permisos denegados
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (execError) {
      console.error('Fallback copy también falló:', execError);
    }
    document.body.removeChild(textArea);
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useMorningVerification(
  options: UseMorningVerificationOptions
): UseMorningVerificationResult {
  const { storeId, cashierId, witnessId, cashCount } = options;

  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [reportSent, setReportSent] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // ---------------------------------------------------------------------------
  // Memoized Data
  // ---------------------------------------------------------------------------
  const store = useMemo(() => getStoreById(storeId), [storeId]);
  const cashierIn = useMemo(() => getEmployeeById(cashierId), [cashierId]);
  const cashierOut = useMemo(() => getEmployeeById(witnessId), [witnessId]);

  // Platform detection
  const isMobile = useMemo(
    () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    []
  );
  const isMac = useMemo(
    () => /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent),
    []
  );

  // WhatsApp state object for cleaner API
  const whatsappState: WhatsAppState = useMemo(() => ({
    reportSent,
    whatsappOpened,
    popupBlocked,
    showInstructions
  }), [reportSent, whatsappOpened, popupBlocked, showInstructions]);

  // ---------------------------------------------------------------------------
  // Verification Calculation
  // ---------------------------------------------------------------------------
  const performVerification = useCallback(() => {
    const totalCash = calculateCashTotal(cashCount);
    const difference = totalCash - EXPECTED_CHANGE_AMOUNT;
    const isCorrect = Math.abs(difference) < TOLERANCE_CENTS;

    const data: VerificationData = {
      totalCash,
      expectedAmount: EXPECTED_CHANGE_AMOUNT,
      difference,
      isCorrect,
      hasShortage: difference < SHORTAGE_THRESHOLD,
      hasExcess: difference > EXCESS_THRESHOLD,
      timestamp: generateTimestamp()
    };

    setVerificationData(data);
  }, [cashCount]);

  // Run verification on mount/cashCount change
  useEffect(() => {
    performVerification();
  }, [performVerification]);

  // ---------------------------------------------------------------------------
  // Report Generation
  // ---------------------------------------------------------------------------
  const generateReport = useCallback((): string => {
    if (!verificationData) return '';

    // Header dinámico según estado
    const headerSeverity = verificationData.hasShortage || verificationData.hasExcess
      ? "⚠️ *REPORTE ADVERTENCIA*"
      : "✅ *REPORTE NORMAL*";

    // Generar desglose de denominaciones
    const denominationDetails = generateDenominationDetails(cashCount);

    // Generar hash de datos
    const dataHash = generateDataHash(verificationData, store, cashierIn, cashierOut);

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

${REPORT_SEPARATOR}

📊 *RESUMEN EJECUTIVO*

💰 Total Contado: *${formatCurrency(verificationData.totalCash)}*
🎯 Cambio Esperado: *${formatCurrency(verificationData.expectedAmount)}*
📊 Diferencia: *${formatCurrency(verificationData.difference)}* (${verificationData.isCorrect ? 'CORRECTO' : verificationData.difference > 0 ? 'SOBRANTE' : 'FALTANTE'})

${REPORT_SEPARATOR}

💰 *CONTEO COMPLETO (${formatCurrency(verificationData.totalCash)})*

${denominationDetails}

${REPORT_SEPARATOR}

🔍 *VERIFICACIÓN*

${statusMessage}
${alertMessage}

${REPORT_SEPARATOR}

📅 ${verificationData.timestamp}
🔐 CashGuard Paradise ${REPORT_VERSION}
🔒 NIST SP 800-115 | PCI DSS 12.10.1

✅ Reporte automático
⚠️ Documento NO editable

Firma Digital: ${dataHash}`;
  }, [verificationData, store, cashierIn, cashierOut, cashCount]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleCopyToClipboard = useCallback(async () => {
    try {
      const report = generateReport();
      const result = await copyToClipboard(report);

      if (result.success) {
        toast.success('Reporte copiado al portapapeles');
      } else {
        toast.error(result.error || 'No se pudo copiar al portapapeles');
      }
    } catch {
      toast.error('Error al generar el reporte');
    }
  }, [generateReport]);

  const handleWhatsAppSend = useCallback(async () => {
    try {
      // Validación de datos completos
      if (!store || !cashierIn || !cashierOut) {
        toast.error("❌ Error", {
          description: "Faltan datos necesarios para generar el reporte"
        });
        return;
      }

      const report = generateReport();
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(report)}`;

      // Copia automática al portapapeles
      await copyToClipboardWithFallback(report);

      if (isMobile) {
        // MÓVIL: Abre app nativa WhatsApp
        const windowRef = window.open(whatsappUrl, '_blank');

        // Detectar bloqueo de pop-ups
        if (!windowRef || windowRef.closed || typeof windowRef.closed === 'undefined') {
          setPopupBlocked(true);
          toast.error('⚠️ Habilite pop-ups para enviar por WhatsApp', {
            duration: 6000,
            action: {
              label: 'Copiar en su lugar',
              onClick: () => handleCopyToClipboard()
            }
          });
          return;
        }

        // WhatsApp abierto exitosamente
        setWhatsappOpened(true);
        toast.success('📱 WhatsApp abierto', {
          description: 'El reporte está copiado en su portapapeles',
          duration: 8000
        });
      } else {
        // DESKTOP: Abrir modal instrucciones
        setWhatsappOpened(true);
        setShowInstructions(true);
      }
    } catch (error) {
      console.error('Error al procesar reporte WhatsApp:', error);
      toast.error('❌ Error al procesar reporte', {
        description: 'Por favor intente nuevamente'
      });
    }
  }, [store, cashierIn, cashierOut, generateReport, isMobile, handleCopyToClipboard]);

  const handleConfirmSent = useCallback(() => {
    setReportSent(true);
    setWhatsappOpened(false);
    setShowInstructions(false);
    toast.success('✅ Reporte confirmado como enviado');
  }, []);

  const handleShare = useCallback(async () => {
    const report = generateReport();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Conteo de Caja Matutino',
          text: report,
        });
      } catch {
        // Usuario canceló el share o error
        await handleCopyToClipboard();
      }
    } else {
      // Fallback a copiar al portapapeles
      await handleCopyToClipboard();
    }
  }, [generateReport, handleCopyToClipboard]);

  const handleDownload = useCallback(() => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conteo-matutino-${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reporte descargado exitosamente');
  }, [generateReport]);

  const closeInstructions = useCallback(() => {
    setShowInstructions(false);
  }, []);

  // ---------------------------------------------------------------------------
  // Return API
  // ---------------------------------------------------------------------------
  return {
    // Data
    verificationData,
    store,
    cashierIn,
    cashierOut,

    // WhatsApp state
    whatsappState,

    // Report generation
    generateReport,

    // Handlers
    handleWhatsAppSend,
    handleConfirmSent,
    handleCopyToClipboard,
    handleShare,
    handleDownload,

    // Modal controls
    closeInstructions,

    // Platform detection
    isMobile,
    isMac
  };
}
