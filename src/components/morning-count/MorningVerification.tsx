// 🤖 [IA] - v2.8.1: Refinamiento UX WhatsApp (botón siempre activo + eliminado botón redundante)
// Previous: v2.8 - Sistema WhatsApp inteligente aplicado (modal instrucciones + detección plataforma)
// Previous: v2.7 - Versión footer reporte actualizada v2.6→v2.7 (consistencia badge OperationSelector)
// Previous: v2.0 - MEJORA REPORTE - Formato profesional alineado con reporte nocturno
// Previous: v1.3.7 - ANTI-FRAUDE - Confirmación explícita envío WhatsApp ANTES de revelar resultados
// Previous: v1.1.13 - Mejora visual del detalle de denominaciones con tabla estructurada
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Sunrise, CheckCircle, AlertTriangle, Download, Share, ArrowLeft, Copy, FileText, Lock, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogContent, 
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"; // 🤖 [IA] - v2.8: Modal instrucciones WhatsApp desktop
import { calculateCashTotal, formatCurrency, generateDenominationSummary } from '@/utils/calculations';
import { copyToClipboard } from '@/utils/clipboard'; // 🤖 [IA] - v1.1.09
import { CashCount } from '@/types/cash';
import { getStoreById, getEmployeeById } from '@/data/paradise';
import { toast } from 'sonner';

interface MorningVerificationProps {
  storeId: string;
  cashierId: string; // Cajero entrante
  witnessId: string; // Cajero saliente
  cashCount: CashCount;
  onBack: () => void;
  onComplete: () => void;
}

interface VerificationData {
  totalCash: number;
  expectedAmount: number;
  difference: number;
  isCorrect: boolean;
  hasShortage: boolean;
  hasExcess: boolean;
  timestamp: string;
}

export function MorningVerification({
  storeId,
  cashierId,
  witnessId,
  cashCount,
  onBack,
  onComplete
}: MorningVerificationProps) {
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);

  // 🤖 [IA] - v1.3.7: Estados confirmación explícita WhatsApp (Propuesta C Híbrida v2.1)
  const [reportSent, setReportSent] = useState(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  // 🤖 [IA] - v2.8: Estado modal instrucciones WhatsApp (desktop-only)
  const [showWhatsAppInstructions, setShowWhatsAppInstructions] = useState(false);

  const store = getStoreById(storeId);
  const cashierIn = getEmployeeById(cashierId);
  const cashierOut = getEmployeeById(witnessId);
  
  const performVerification = useCallback(() => {
    const totalCash = calculateCashTotal(cashCount);
    const expectedAmount = 50; // Siempre $50 para cambio
    const difference = totalCash - expectedAmount;
    const isCorrect = Math.abs(difference) < 0.01; // Tolerancia de 1 centavo
    
    const data = {
      totalCash,
      expectedAmount,
      difference,
      isCorrect,
      hasShortage: difference < -1.00,
      hasExcess: difference > 1.00,
      timestamp: new Date().toLocaleString('es-SV', {
        timeZone: 'America/El_Salvador',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    };
    
    setVerificationData(data);
  }, [cashCount]);

  useEffect(() => {
    performVerification();
  }, [performVerification]);

  // 🤖 [IA] - v2.0: Helper para generar desglose de denominaciones (formato profesional)
  const generateDenominationDetails = useCallback((cashCount: CashCount): string => {
    const denominations = [
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
    ];

    return denominations
      .filter(d => cashCount[d.key as keyof CashCount] > 0)
      .map(d => {
        const quantity = cashCount[d.key as keyof CashCount];
        const subtotal = quantity * d.value;
        return `${d.label} × ${quantity} = ${formatCurrency(subtotal)}`;
      })
      .join('\n');
  }, []);

  // 🤖 [IA] - v2.0: Helper para generar firma digital
  const generateDataHash = useCallback((
    data: VerificationData,
    store: { id?: string } | undefined,
    cashierIn: { id?: string } | undefined,
    cashierOut: { id?: string } | undefined
  ): string => {
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
  }, []);

  // 🤖 [IA] - v2.0: Función generateReport con formato profesional (alineado con reporte nocturno)
  const generateReport = useCallback(() => {
    if (!verificationData) return '';

    // Header dinámico según estado
    const headerSeverity = verificationData.hasShortage || verificationData.hasExcess
      ? "⚠️ *REPORTE ADVERTENCIA*"
      : "✅ *REPORTE NORMAL*";

    // Separador profesional (igual que reporte nocturno)
    const SEPARATOR = '━━━━━━━━━━━━━━━━';

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
🔐 CashGuard Paradise v2.7
🔒 NIST SP 800-115 | PCI DSS 12.10.1

✅ Reporte automático
⚠️ Documento NO editable

Firma Digital: ${dataHash}`;
  }, [verificationData, store, cashierIn, cashierOut, cashCount, generateDenominationDetails, generateDataHash]);

  // 🤖 [IA] - v1.1.09: Función mejorada con fallback robusto
  const handleCopyToClipboard = useCallback(async () => {
    try {
      const report = generateReport();
      const result = await copyToClipboard(report);

      if (result.success) {
        toast.success('Reporte copiado al portapapeles');
      } else {
        toast.error(result.error || 'No se pudo copiar al portapapeles');
      }
    } catch (error) {
      toast.error('Error al generar el reporte');
    }
  }, [generateReport]);

  // 🤖 [IA] - v2.8: Handler inteligente con detección plataforma + copia automática + validación
  const handleWhatsAppSend = useCallback(async () => {
    try {
      // ✅ VALIDACIÓN: Verificar datos completos antes de generar reporte
      if (!store || !cashierIn || !cashierOut) {
        toast.error("❌ Error", {
          description: "Faltan datos necesarios para generar el reporte"
        });
        return;
      }

      const report = generateReport();
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(report)}`;

      // ✅ PASO 1: Detección inteligente de plataforma
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // ✅ PASO 2: Copia automática al portapapeles (con fallback robusto)
      try {
        await navigator.clipboard.writeText(report);
      } catch (clipboardError) {
        // Fallback para navegadores antiguos o permisos denegados
        console.warn('Clipboard API falló, usando fallback:', clipboardError);
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
          console.error('Fallback copy también falló:', execError);
        }
        document.body.removeChild(textArea);
      }

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

        // WhatsApp abierto exitosamente → Esperar confirmación MANUAL
        setWhatsappOpened(true);
        toast.success('📱 WhatsApp abierto', {
          description: 'El reporte está copiado en su portapapeles',
          duration: 8000
        });

        // ✅ NO HAY auto-timeout - Usuario DEBE confirmar manualmente
      } else {
        // ✅ DESKTOP: Abrir modal instrucciones (NO abre WhatsApp Web, NO toast redundante)
        setWhatsappOpened(true);
        setShowWhatsAppInstructions(true);

        // ✅ NO HAY auto-timeout - Usuario DEBE confirmar manualmente con botón "Ya lo envié"
      }
    } catch (error) {
      console.error('Error al procesar reporte WhatsApp:', error);
      toast.error('❌ Error al procesar reporte', {
        description: 'Por favor intente nuevamente'
      });
    }
  }, [store, cashierIn, cashierOut, generateReport, handleCopyToClipboard]);

  // 🤖 [IA] - v2.8: Handler confirmación explícita usuario (actualizado para cerrar modal instrucciones)
  const handleConfirmSent = useCallback(() => {
    setReportSent(true);
    setWhatsappOpened(false);
    setShowWhatsAppInstructions(false); // Cierra modal instrucciones
    toast.success('✅ Reporte confirmado como enviado');
  }, []);
  
  const handleShare = async () => {
    const report = generateReport();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Conteo de Caja Matutino',
          text: report,
        });
      } catch (err) {
        // Usuario canceló el share o error
        if (process.env.NODE_ENV === 'development') {
          console.log('Share cancelado o no disponible');
        }
      }
    } else {
      // Fallback a copiar al portapapeles
      await handleCopyToClipboard();
    }
  };

  const generatePrintableReport = () => {
    const report = generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conteo-matutino-${new Date().getTime()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Reporte descargado exitosamente');
  };

  // 🤖 [IA] - v1.1.13: Función para generar display visual de denominaciones con identidad naranja
  const generateDenominationDisplay = () => {
    const denominations = [
      { key: 'penny', label: '1¢ centavo', value: 0.01 },
      { key: 'nickel', label: '5¢ centavos', value: 0.05 },
      { key: 'dime', label: '10¢ centavos', value: 0.10 },
      { key: 'quarter', label: '25¢ centavos', value: 0.25 },
      { key: 'dollarCoin', label: '$1 moneda', value: 1.00 },
      { key: 'bill1', label: '$1', value: 1.00 },
      { key: 'bill5', label: '$5', value: 5.00 },
      { key: 'bill10', label: '$10', value: 10.00 },
      { key: 'bill20', label: '$20', value: 20.00 },
      { key: 'bill50', label: '$50', value: 50.00 },
      { key: 'bill100', label: '$100', value: 100.00 }
    ];

    const items = denominations
      .filter(d => cashCount[d.key as keyof CashCount] > 0)
      .map(d => {
        const quantity = cashCount[d.key as keyof CashCount] || 0;
        const subtotal = quantity * d.value;
        return (
          <div key={d.key} className="flex justify-between text-sm rounded px-3 py-1.5" style={{
            background: 'rgba(244, 165, 42, 0.05)'
          }}>
            <span className="font-medium" style={{ color: '#e1e8ed' }}>{d.label}</span>
            <span className="font-semibold" style={{ color: '#ffb84d' }}>
              × {quantity} = {formatCurrency(subtotal)}
            </span>
          </div>
        );
      });

    const total = calculateCashTotal(cashCount);
    
    return (
      <>
        {items}
        {items.length > 0 && (
          <>
            <div className="my-2" style={{ borderTop: '1px solid rgba(244, 165, 42, 0.3)' }}></div>
            <div className="flex justify-between text-sm font-bold px-3">
              <span style={{ color: '#ffb84d' }}>Total contado:</span>
              <span style={{ color: '#f4a52a' }}>{formatCurrency(total)}</span>
            </div>
          </>
        )}
      </>
    );
  };

  if (!verificationData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sunrise className="w-12 h-12 mx-auto mb-4" style={{ color: '#f4a52a' }} />
          </motion.div>
          <p style={{ color: '#8899a6' }}>Verificando conteo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="morning-verification-container min-h-screen relative overflow-y-auto" data-scrollable="true">
      
      {/* 🤖 [IA] - v1.1.12: Eliminado gradient gris, coherente con CashCalculation */}
      <div className="relative z-10 container mx-auto px-4 py-8 lg:max-w-4xl">
        {/* Header simplificado pero con identidad naranja preservada */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#f4a52a' }}>
              Verificación Completada
            </h2>
            <p style={{ color: '#8899a6' }}>
              Resultados del conteo matutino
            </p>
            <Badge 
              variant="warning" 
              className="mt-2"
            >
              {verificationData.timestamp}
            </Badge>
          </div>
          
          {/* Alert/Estado movido como sección independiente */}
          {verificationData.isCorrect ? (
            <div className="p-4 rounded-lg flex items-start gap-3" style={{
              background: 'rgba(0, 186, 124, 0.1)',
              border: '1px solid rgba(0, 186, 124, 0.3)'
            }}>
              <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#00ba7c' }} />
              <div>
                <p className="font-medium" style={{ color: '#00ba7c' }}>
                  Cambio Verificado Correctamente
                </p>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>
                  El cajero entrante puede iniciar su turno
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg flex items-start gap-3" style={{
              background: 'rgba(244, 33, 46, 0.1)',
              border: '1px solid rgba(244, 33, 46, 0.3)'
            }}>
              <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: '#f4212e' }} />
              <div>
                <p className="font-medium" style={{ color: '#f4212e' }}>
                  Diferencia Detectada
                </p>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>
                  {verificationData.hasShortage 
                    ? 'Revisar faltante con el cajero saliente'
                    : 'Verificar origen del sobrante'}
                </p>
              </div>
            </div>
          )}

        {/* 🤖 [IA] - v1.3.7: RENDERIZADO CONDICIONAL - Resultados bloqueados hasta confirmación WhatsApp */}
        {!reportSent ? (
          // BLOQUEADO: Mostrar mensaje de bloqueo
          <div style={{
            background: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
            WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: `clamp(8px, 3vw, 16px)`,
            padding: `clamp(3rem, 8vw, 4rem)`,
            textAlign: 'center'
          }}>
            <Lock className="w-[clamp(3rem,12vw,4rem)] h-[clamp(3rem,12vw,4rem)] mx-auto mb-[clamp(1rem,4vw,1.5rem)]" style={{ color: '#f4a52a' }} />
            <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-2" style={{ color: '#e1e8ed' }}>
              🔒 Resultados Bloqueados
            </h3>
            <p className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>
              Los resultados de la verificación matutina se revelarán después de enviar el reporte por WhatsApp.
              Esto garantiza la trazabilidad completa de todas las verificaciones realizadas.
            </p>
          </div>
        ) : (
          // DESBLOQUEADO: Mostrar todos los resultados
          <>
            {/* Main Content - 🤖 [IA] - v1.1.12: Grid reorganizado para coherencia con CashCalculation */}
            <div className="grid md:grid-cols-2 gap-6 lg:max-w-3xl lg:mx-auto">
              {/* Información del conteo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div style={{
                  background: 'rgba(36, 36, 36, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#e1e8ed' }}>
                    Información del Conteo
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm" style={{ color: '#8899a6' }}>Sucursal</p>
                      <p className="text-lg font-semibold" style={{ color: '#e1e8ed' }}>
                        {store?.name || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm" style={{ color: '#8899a6' }}>Cajero Entrante</p>
                      <p className="text-lg font-semibold" style={{ color: '#ffb84d' }}>
                        {cashierIn?.name || 'N/A'}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm" style={{ color: '#8899a6' }}>Cajero Saliente</p>
                      <p className="text-lg font-semibold" style={{ color: '#e1e8ed' }}>
                        {cashierOut?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Resultados del conteo */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div style={{
                  background: 'rgba(36, 36, 36, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#e1e8ed' }}>
                    Resultados del Conteo
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span style={{ color: '#8899a6' }}>Total Contado:</span>
                      <span className="text-2xl font-bold" style={{ color: '#e1e8ed' }}>
                        {formatCurrency(verificationData.totalCash)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span style={{ color: '#8899a6' }}>Cambio Esperado:</span>
                      <span className="text-xl" style={{ color: '#8899a6' }}>
                        {formatCurrency(verificationData.expectedAmount)}
                      </span>
                    </div>

                    <div className="border-t border-gray-700 pt-3">
                      <div className="flex justify-between items-center">
                        <span style={{ color: '#8899a6' }}>Diferencia:</span>
                        <span
                          className="text-2xl font-bold"
                          style={{
                            color: verificationData.isCorrect ? '#00ba7c' : '#f4212e'
                          }}
                        >
                          {verificationData.difference >= 0 ? '+' : ''}
                          {formatCurrency(verificationData.difference)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Detalle de denominaciones - 🤖 [IA] - v1.0.98: Responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-6 lg:max-w-3xl lg:mx-auto"
            >
              <div style={{
                background: 'rgba(36, 36, 36, 0.4)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <h3 className="text-xl font-bold mb-4" style={{ color: '#e1e8ed' }}>
                  Detalle de Denominaciones
                </h3>

                <div className="p-4 rounded-lg" style={{
                  background: 'rgba(244, 165, 42, 0.1)',
                  border: '1px solid rgba(244, 165, 42, 0.3)'
                }}>
                  <p className="text-sm font-medium mb-3" style={{ color: '#f4a52a' }}>
                    Cambio verificado para inicio de turno:
                  </p>

                  <div className="space-y-1">
                    {generateDenominationDisplay()}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Success Confirmation - 🤖 [IA] - v1.1.11: Glass morphism coherente con CashCalculation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div style={{
            background: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '32px'
          }}>
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#00ba7c' }} />
              <h3 className="text-xl font-bold mb-2" style={{ color: '#e1e8ed' }}>
                Conteo Matutino Completado
              </h3>
              <p className="mb-6" style={{ color: '#8899a6' }}>
                El cambio ha sido verificado y está listo para iniciar el turno.
                Los datos están protegidos según el protocolo de seguridad.
              </p>
              
              {/* 🤖 [IA] - v1.3.7: Banner advertencia inicial si NO enviado */}
              {!reportSent && !whatsappOpened && !popupBlocked && (
                <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] mb-[clamp(1rem,4vw,1.5rem)] flex items-start gap-3" style={{
                  background: 'rgba(255, 159, 10, 0.1)',
                  border: '1px solid rgba(255, 159, 10, 0.3)'
                }}>
                  <AlertTriangle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] mt-0.5" style={{ color: '#ff9f0a' }} />
                  <div>
                    <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#ff9f0a' }}>
                      ⚠️ DEBE ENVIAR REPORTE PARA CONTINUAR
                    </p>
                    <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
                      Los resultados se revelarán después de enviar el reporte por WhatsApp.
                    </p>
                  </div>
                </div>
              )}

              {/* 🤖 [IA] - v1.3.7: Banner pop-up bloqueado */}
              {popupBlocked && !reportSent && (
                <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] mb-[clamp(1rem,4vw,1.5rem)] flex items-start gap-3" style={{
                  background: 'rgba(255, 69, 58, 0.1)',
                  border: '1px solid rgba(255, 69, 58, 0.3)'
                }}>
                  <AlertTriangle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] mt-0.5" style={{ color: '#ff453a' }} />
                  <div>
                    <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#ff453a' }}>
                      🚫 Pop-ups Bloqueados
                    </p>
                    <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
                      Su navegador bloqueó la apertura de WhatsApp. Use el botón "Copiar" para enviar el reporte manualmente.
                    </p>
                  </div>
                </div>
              )}

              {/* Botones de acción en grid - 🤖 [IA] - v1.3.7: Handlers actualizados + disabled states */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:max-w-3xl mx-auto">
                {/* 🤖 [IA] - v2.8.1: Botón siempre activo hasta confirmación final (usuario puede reenviar) */}
                <Button
                  onClick={handleWhatsAppSend}
                  disabled={reportSent}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold hover:scale-105 transform transition-all duration-300 text-xs sm:text-sm px-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Share className="w-4 h-4 mr-2" />
                  {reportSent ? 'Reporte Enviado ✅' : 'WhatsApp'}
                </Button>

                <Button
                  onClick={handleCopyToClipboard}
                  disabled={!reportSent && !popupBlocked}
                  variant="secondary"
                  className="border-warning/30 hover:bg-warning/10 hover:scale-105 transform transition-all duration-300 text-xs sm:text-sm px-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </Button>

                <Button
                  onClick={onComplete}
                  disabled={!reportSent}
                  className="bg-gradient-to-r from-[#f4a52a] to-[#ffb84d] hover:from-[#e89a1a] hover:to-[#ffa83d] text-white font-semibold hover:scale-105 transform transition-all duration-300 text-xs sm:text-sm px-2 py-2 md:col-span-1 col-span-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Finalizar
                </Button>
              </div>

              {/* 🤖 [IA] - v1.3.7: Botón de confirmación después de abrir WhatsApp */}
              {whatsappOpened && !reportSent && (
                <div className="mt-[clamp(1rem,4vw,1.5rem)] p-[clamp(1rem,4vw,1.5rem)] rounded-[clamp(0.5rem,2vw,0.75rem)]" style={{
                  background: 'rgba(0, 186, 124, 0.1)',
                  border: '1px solid rgba(0, 186, 124, 0.3)'
                }}>
                  <p className="text-[clamp(0.875rem,3.5vw,1rem)] mb-3 text-center" style={{ color: '#8899a6' }}>
                    ¿Ya envió el reporte por WhatsApp?
                  </p>
                  <Button
                    onClick={handleConfirmSent}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold hover:scale-105 transform transition-all duration-300"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sí, ya envié el reporte
                  </Button>
                </div>
              )}
              
              <div className="mt-4 text-center">
                <Button
                  onClick={onBack}
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  style={{ color: '#8899a6' }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Conteo
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      </div>

      {/* 🤖 [IA] - v2.8: Modal Instrucciones WhatsApp (desktop-only) */}
      <AlertDialog open={showWhatsAppInstructions} onOpenChange={setShowWhatsAppInstructions}>
      <AlertDialogContent
        className="max-w-md"
        style={{
          background: 'rgba(36, 36, 36, 0.6)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px'
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-white">
            <MessageSquare className="w-5 h-5 text-[#25D366]" />
            ¿Cómo enviar por WhatsApp?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-300">
            Sigue estos pasos para enviar el reporte por WhatsApp Web
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Banner "Reporte Copiado" */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 rounded-lg"
          style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}
        >
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="font-medium">Reporte copiado al portapapeles</span>
          </div>
        </motion.div>

        {/* Pasos numerados */}
        <div className="space-y-3 mb-6">
          {/* Paso 1 */}
          <div className="flex gap-3">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
                color: '#1a1a1a'
              }}
            >
              1
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-gray-200">
                <span className="font-medium text-white">Abra WhatsApp Web</span>
                <br />
                <span className="text-gray-400 text-xs">
                  Vaya a{' '}
                  <code className="px-1 py-0.5 rounded bg-gray-800 text-green-400">
                    web.whatsapp.com
                  </code>{' '}
                  en su navegador
                </span>
              </p>
            </div>
          </div>

          {/* Paso 2 */}
          <div className="flex gap-3">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
                color: '#1a1a1a'
              }}
            >
              2
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-gray-200">
                <span className="font-medium text-white">Seleccione el contacto</span>
                <br />
                <span className="text-gray-400 text-xs">
                  Busque el chat de su supervisor o grupo
                </span>
              </p>
            </div>
          </div>

          {/* Paso 3 */}
          <div className="flex gap-3">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
                color: '#1a1a1a'
              }}
            >
              3
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-gray-200">
                <span className="font-medium text-white">Pegue el reporte</span>
                <br />
                <span className="text-gray-400 text-xs">
                  Presione{' '}
                  <code className="px-1 py-0.5 rounded bg-gray-800 text-blue-400">
                    {/Mac|iPhone|iPod|iPad/i.test(navigator.userAgent) ? 'Cmd+V' : 'Ctrl+V'}
                  </code>{' '}
                  en el campo de mensaje
                </span>
              </p>
            </div>
          </div>

          {/* Paso 4 */}
          <div className="flex gap-3">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
                color: '#1a1a1a'
              }}
            >
              4
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-gray-200">
                <span className="font-medium text-white">Envíe el mensaje</span>
                <br />
                <span className="text-gray-400 text-xs">
                  Haga clic en el botón de enviar y regrese aquí para confirmar
                </span>
              </p>
            </div>
          </div>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={() => setShowWhatsAppInstructions(false)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#e1e8ed',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            Cerrar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirmSent}
            className="bg-gradient-to-r from-[#f4a52a] to-[#ffb84d] text-[#1a1a1a] font-semibold hover:opacity-90"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Ya lo envié
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}