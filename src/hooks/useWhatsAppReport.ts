// 🤖 [IA] - Hook compartido para lógica WhatsApp (DRY - Mandamiento #6)
// Extraído de CashCalculation.tsx y MorningVerification.tsx

import { useState, useCallback } from 'react';
import { copyToClipboard } from '@/utils/clipboard';
import { toast } from 'sonner';

interface UseWhatsAppReportOptions {
  generateReport: () => string;
  isDataReady: boolean;
}

/**
 * Hook que encapsula la lógica compartida de envío WhatsApp:
 * - 4 estados de control (reportSent, whatsappOpened, popupBlocked, showWhatsAppInstructions)
 * - Detección plataforma móvil/desktop
 * - Copia automática portapapeles con fallback
 * - Detección pop-ups bloqueados
 * - Confirmación manual explícita (anti-fraude)
 */
export function useWhatsAppReport({ generateReport, isDataReady }: UseWhatsAppReportOptions) {
  const [reportSent, setReportSent] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [showWhatsAppInstructions, setShowWhatsAppInstructions] = useState(false);

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
      if (!isDataReady) {
        toast.error('❌ Error', {
          description: 'Faltan datos necesarios para generar el reporte'
        });
        return;
      }

      const report = generateReport();
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Copia automática al portapapeles con fallback
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
        } catch {
          // Fallback silencioso
        }
        document.body.removeChild(textArea);
      }

      if (isMobile) {
        const encodedReport = encodeURIComponent(report);
        const windowRef = window.open(`https://wa.me/?text=${encodedReport}`, '_blank');

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

        setWhatsappOpened(true);
        toast.success('📱 WhatsApp abierto', {
          description: 'El reporte está copiado en su portapapeles',
          duration: 8000
        });
      } else {
        // Desktop: modal instrucciones (NO abre WhatsApp Web)
        setWhatsappOpened(true);
        setShowWhatsAppInstructions(true);
      }
    } catch (error) {
      toast.error('❌ Error al procesar reporte', {
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  }, [isDataReady, generateReport, handleCopyToClipboard]);

  const handleConfirmSent = useCallback(() => {
    setReportSent(true);
    setWhatsappOpened(false);
    setShowWhatsAppInstructions(false);
    toast.success('✅ Reporte confirmado como enviado');
  }, []);

  return {
    reportSent,
    whatsappOpened,
    popupBlocked,
    showWhatsAppInstructions,
    setShowWhatsAppInstructions,
    handleWhatsAppSend,
    handleConfirmSent,
    handleCopyToClipboard
  };
}
