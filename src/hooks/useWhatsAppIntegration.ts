// 🤖 [IA] - v2.8.3: Custom hook extraído de CashCalculation.tsx (Auditoría "Cimientos de Cristal")
// Encapsula lógica de integración WhatsApp: estados, handlers, detección de plataforma
// Reduce acoplamiento del componente principal y facilita testing unitario

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { copyToClipboard } from '@/utils/clipboard';

/**
 * Estado del flujo de envío WhatsApp
 */
export interface WhatsAppState {
  /** Indica si el reporte fue confirmado como enviado */
  reportSent: boolean;
  /** Indica si WhatsApp fue abierto (móvil) o el modal de instrucciones se mostró (desktop) */
  whatsappOpened: boolean;
  /** Indica si el navegador bloqueó el popup de WhatsApp */
  popupBlocked: boolean;
  /** Indica si el modal de instrucciones está visible */
  showWhatsAppInstructions: boolean;
}

/**
 * Opciones de configuración para el hook
 */
export interface UseWhatsAppIntegrationOptions {
  /** Función que genera el contenido del reporte */
  generateReportFn: () => string;
  /** Callback opcional cuando el reporte se marca como enviado */
  onReportSent?: () => void;
  /** Callback opcional para errores */
  onError?: (error: Error) => void;
}

/**
 * Resultado retornado por el hook
 */
export interface UseWhatsAppIntegrationResult {
  // Estados
  state: WhatsAppState;

  // Handlers principales
  /** Abre WhatsApp (móvil) o muestra instrucciones (desktop), copia reporte automáticamente */
  handleWhatsAppSend: () => Promise<void>;
  /** Marca el reporte como enviado (confirmación del usuario) */
  handleConfirmSent: () => void;
  /** Copia el reporte al portapapeles manualmente */
  handleCopyToClipboard: () => Promise<void>;

  // Control del modal
  /** Abre el modal de instrucciones */
  openInstructions: () => void;
  /** Cierra el modal de instrucciones */
  closeInstructions: () => void;

  // Utilidades
  /** Detecta si el usuario está en un dispositivo móvil */
  isMobile: boolean;
  /** Detecta si el usuario usa Mac (para mostrar Cmd vs Ctrl) */
  isMac: boolean;
  /** Resetea todos los estados a sus valores iniciales */
  reset: () => void;
}

/**
 * Hook para manejar la integración con WhatsApp Web/App
 *
 * @description
 * Encapsula toda la lógica de envío de reportes por WhatsApp:
 * - Detección automática de plataforma (móvil/desktop)
 * - Copia automática al portapapeles
 * - Modal de instrucciones para desktop
 * - Manejo de popups bloqueados
 * - Estados de flujo (enviado, abierto, bloqueado)
 *
 * @example
 * ```tsx
 * const { state, handleWhatsAppSend, handleConfirmSent } = useWhatsAppIntegration({
 *   generateReportFn: () => generateCompleteReport(),
 *   onReportSent: () => console.log('Reporte enviado exitosamente')
 * });
 *
 * // En el componente:
 * <Button onClick={handleWhatsAppSend}>
 *   {state.reportSent ? '✅ Enviado' : 'Enviar WhatsApp'}
 * </Button>
 * ```
 */
export function useWhatsAppIntegration(
  options: UseWhatsAppIntegrationOptions
): UseWhatsAppIntegrationResult {
  const { generateReportFn, onReportSent, onError } = options;

  // Estados del flujo WhatsApp
  const [reportSent, setReportSent] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);
  const [showWhatsAppInstructions, setShowWhatsAppInstructions] = useState(false);

  // Detección de plataforma (memoizado implícitamente)
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const isMac = /Mac/i.test(navigator.userAgent);

  /**
   * Copia texto al portapapeles con fallback para navegadores antiguos
   */
  const copyToClipboardWithFallback = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback si clipboard API falla
      console.warn('[useWhatsAppIntegration] Clipboard API failed, using fallback');
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch {
        return false;
      }
    }
  }, []);

  /**
   * Handler principal para enviar reporte por WhatsApp
   * - Copia automáticamente al portapapeles
   * - En móvil: abre app nativa de WhatsApp
   * - En desktop: abre modal de instrucciones
   */
  const handleWhatsAppSend = useCallback(async (): Promise<void> => {
    try {
      const report = generateReportFn();

      // Paso 1: Copiar automáticamente al portapapeles
      const copySuccess = await copyToClipboardWithFallback(report);
      if (!copySuccess) {
        console.warn('[useWhatsAppIntegration] Could not copy to clipboard');
      }

      // Paso 2: Comportamiento según plataforma
      if (isMobile) {
        // MÓVIL: Abrir app nativa de WhatsApp
        const encodedReport = encodeURIComponent(report);
        window.location.href = `whatsapp://send?text=${encodedReport}`;

        setWhatsappOpened(true);
        toast.success('📱 WhatsApp abierto con reporte copiado', {
          description: 'Si no se abrió, pegue el reporte manualmente',
          duration: 8000
        });
      } else {
        // DESKTOP: Abrir modal de instrucciones inmediatamente
        setWhatsappOpened(true);
        setShowWhatsAppInstructions(true);
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Error desconocido');

      toast.error('❌ Error al procesar reporte', {
        description: errorObj.message
      });

      onError?.(errorObj);
    }
  }, [generateReportFn, isMobile, copyToClipboardWithFallback, onError]);

  /**
   * Handler de confirmación explícita del usuario
   * Marca el reporte como enviado y oculta el modal
   */
  const handleConfirmSent = useCallback((): void => {
    setReportSent(true);
    setWhatsappOpened(false);
    setShowWhatsAppInstructions(false);
    toast.success('✅ Reporte confirmado como enviado');
    onReportSent?.();
  }, [onReportSent]);

  /**
   * Handler para copiar reporte manualmente
   * Utiliza la utilidad copyToClipboard con manejo de errores
   */
  const handleCopyToClipboard = useCallback(async (): Promise<void> => {
    try {
      const report = generateReportFn();
      const result = await copyToClipboard(report);

      if (result.success) {
        toast.success('💾 Copiado al portapapeles', {
          description: 'El reporte ha sido copiado exitosamente'
        });
      } else {
        toast.error('❌ Error al copiar', {
          description: result.error || 'No se pudo copiar al portapapeles. Intente de nuevo.'
        });
      }
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Error desconocido');

      toast.error('❌ Error al generar reporte', {
        description: errorObj.message
      });

      onError?.(errorObj);
    }
  }, [generateReportFn, onError]);

  /**
   * Abre el modal de instrucciones
   */
  const openInstructions = useCallback((): void => {
    setShowWhatsAppInstructions(true);
  }, []);

  /**
   * Cierra el modal de instrucciones
   */
  const closeInstructions = useCallback((): void => {
    setShowWhatsAppInstructions(false);
  }, []);

  /**
   * Resetea todos los estados a sus valores iniciales
   */
  const reset = useCallback((): void => {
    setReportSent(false);
    setWhatsappOpened(false);
    setPopupBlocked(false);
    setShowWhatsAppInstructions(false);
  }, []);

  return {
    state: {
      reportSent,
      whatsappOpened,
      popupBlocked,
      showWhatsAppInstructions
    },
    handleWhatsAppSend,
    handleConfirmSent,
    handleCopyToClipboard,
    openInstructions,
    closeInstructions,
    isMobile,
    isMac,
    reset
  };
}

export default useWhatsAppIntegration;
