/**
 * 🤖 [IA] - v1.4.1: Controller hook verificación matutina (ORDEN #074)
 * Extraído de MorningVerification.tsx (742 líneas → hook ~170 líneas)
 *
 * @description
 * Orquesta TODA la lógica de estado y handlers de verificación matutina.
 * La vista solo renderiza lo que este hook retorna.
 *
 * Ajuste #5 cubierto: handleWhatsAppSend usa helpers internos (<50 líneas).
 */
import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';

import type {
  MorningVerificationProps,
  MorningVerificationControllerReturn,
} from '@/types/morningVerification';

import { performVerification, generateDataHash } from '@/lib/morning-verification/mvRules';
import { generateMorningReport, downloadPrintableReport } from '@/lib/morning-verification/mvFormatters';
import { resolveVerificationActors } from '@/lib/morning-verification/mvSelectors';
import { copyToClipboard } from '@/utils/clipboard';

// ────────────────────────────────────────────────────────────────
// Internal helpers (Ajuste #5: handleWhatsAppSend <50 líneas)
// ────────────────────────────────────────────────────────────────

/** Detecta si el dispositivo es móvil */
function isMobilePlatform(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

/** Construye URL para envío WhatsApp */
function buildWhatsAppUrl(report: string): string {
  return `https://wa.me/?text=${encodeURIComponent(report)}`;
}

/**
 * Copia reporte al portapapeles con fallback textarea.
 * No lanza excepciones — errores se loguean silenciosamente.
 */
async function copyReportToClipboard(report: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(report);
  } catch {
    const textArea = document.createElement('textarea');
    textArea.value = report;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (execError) {
      console.error('Fallback copy falló:', execError);
    }
    document.body.removeChild(textArea);
  }
}

// ────────────────────────────────────────────────────────────────
// Hook controller
// ────────────────────────────────────────────────────────────────

export function useMorningVerificationController(
  props: MorningVerificationProps
): MorningVerificationControllerReturn {
  const { storeId, cashierId, witnessId, cashCount, onBack, onComplete } = props;

  // ── State ──────────────────────────────────────────────────────
  const [verificationData, setVerificationData] = useState(
    () => performVerification(cashCount)
  );
  const [reportSent, setReportSent] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [showWhatsAppInstructions, setShowWhatsAppInstructions] = useState(false);

  // ── Actors ─────────────────────────────────────────────────────
  const { store, cashierIn, cashierOut } = resolveVerificationActors(
    storeId, cashierId, witnessId
  );

  // ── Verificación al montar ─────────────────────────────────────
  useEffect(() => {
    setVerificationData(performVerification(cashCount));
  }, [cashCount]);

  // ── Derived: reporte generado ──────────────────────────────────
  const report = useMemo(() => {
    if (!verificationData) return '';
    const dataHash = generateDataHash(
      verificationData, storeId, cashierId, witnessId
    );
    return generateMorningReport({
      verificationData,
      store,
      cashierIn,
      cashierOut,
      cashCount,
      dataHash,
    });
  }, [verificationData, store, cashierIn, cashierOut, cashCount, storeId, cashierId, witnessId]);

  // ── Handlers ───────────────────────────────────────────────────

  const handleCopyToClipboard = useCallback(async () => {
    try {
      const result = await copyToClipboard(report);
      if (result.success) {
        toast.success('Reporte copiado al portapapeles');
      } else {
        toast.error(result.error || 'No se pudo copiar al portapapeles');
      }
    } catch {
      toast.error('Error al generar el reporte');
    }
  }, [report]);

  const handleWhatsAppSend = useCallback(async () => {
    try {
      if (!store || !cashierIn || !cashierOut) {
        toast.error('❌ Error', {
          description: 'Faltan datos necesarios para generar el reporte',
        });
        return;
      }

      const whatsappUrl = buildWhatsAppUrl(report);
      await copyReportToClipboard(report);

      if (isMobilePlatform()) {
        const windowRef = window.open(whatsappUrl, '_blank');

        if (!windowRef || windowRef.closed || typeof windowRef.closed === 'undefined') {
          setPopupBlocked(true);
          toast.error('⚠️ Habilite pop-ups para enviar por WhatsApp', {
            duration: 6000,
            action: { label: 'Copiar en su lugar', onClick: () => handleCopyToClipboard() },
          });
          return;
        }

        setWhatsappOpened(true);
        toast.success('📱 WhatsApp abierto', {
          description: 'El reporte está copiado en su portapapeles',
          duration: 8000,
        });
      } else {
        setWhatsappOpened(true);
        setShowWhatsAppInstructions(true);
      }
    } catch (error) {
      console.error('Error al procesar reporte WhatsApp:', error);
      toast.error('❌ Error al procesar reporte', {
        description: 'Por favor intente nuevamente',
      });
    }
  }, [store, cashierIn, cashierOut, report, handleCopyToClipboard]);

  const handleConfirmSent = useCallback(() => {
    setReportSent(true);
    setWhatsappOpened(false);
    setShowWhatsAppInstructions(false);
    toast.success('✅ Reporte confirmado como enviado');
  }, []);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Conteo de Caja Matutino', text: report });
      } catch {
        // Usuario canceló
      }
    } else {
      await handleCopyToClipboard();
    }
  }, [report, handleCopyToClipboard]);

  const handlePrintableReport = useCallback(() => {
    downloadPrintableReport(report);
    toast.success('Reporte descargado exitosamente');
  }, [report]);

  const handleBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // ── Return ─────────────────────────────────────────────────────
  return {
    verificationData,
    reportSent,
    whatsappOpened,
    popupBlocked,
    showWhatsAppInstructions,
    store,
    cashierIn,
    cashierOut,
    isLoading: !verificationData,
    report,
    handleWhatsAppSend,
    handleConfirmSent,
    handleCopyToClipboard,
    handleShare,
    handlePrintableReport,
    handleBack,
    handleComplete,
    setShowWhatsAppInstructions,
  };
}
