/**
 * 🤖 [IA] - v1.4.1: Vista presentacional verificación matutina (ORDEN #074)
 * Extraído de MorningVerification.tsx (742 líneas → view ~200 líneas)
 *
 * @description
 * Componente presentacional que consume useMorningVerificationController.
 * CERO lógica de estado — solo renderiza lo que el hook retorna.
 */
import { motion } from 'framer-motion';
import { Sunrise, CheckCircle, AlertTriangle, Share, ArrowLeft, Copy, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WhatsAppInstructionsModal } from '@/components/shared/WhatsAppInstructionsModal';
import { calculateCashTotal, formatCurrency } from '@/utils/calculations';
import type { CashCount } from '@/types/cash';
import type { MorningVerificationProps } from '@/types/morningVerification';
import { useMorningVerificationController } from '@/hooks/morning-verification/useMorningVerificationController';

// ────────────────────────────────────────────────────────────────
// Denomination display (local — needs cashCount + JSX)
// ────────────────────────────────────────────────────────────────

const DENOMINATIONS = [
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
  { key: 'bill100', label: '$100', value: 100.00 },
] as const;

function DenominationDisplay({ cashCount }: { cashCount: CashCount }) {
  const items = DENOMINATIONS
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
}

// ────────────────────────────────────────────────────────────────
// Glass card style (reused across sections)
// ────────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: 'rgba(36, 36, 36, 0.4)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  padding: '24px',
};

// ────────────────────────────────────────────────────────────────
// View component
// ────────────────────────────────────────────────────────────────

export function MorningVerificationView(props: MorningVerificationProps) {
  const {
    verificationData,
    reportSent,
    whatsappOpened,
    popupBlocked,
    showWhatsAppInstructions,
    store,
    cashierIn,
    cashierOut,
    isLoading,
    handleWhatsAppSend,
    handleConfirmSent,
    handleCopyToClipboard,
    handlePrintableReport,
    handleBack,
    handleComplete,
    setShowWhatsAppInstructions,
  } = useMorningVerificationController(props);

  // ── Loading spinner ──────────────────────────────────────────
  if (isLoading || !verificationData) {
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
      <div className="relative z-10 container mx-auto px-4 py-8 lg:max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* ── Header ─────────────────────────────────────────── */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#f4a52a' }}>
              Verificación Completada
            </h2>
            <p style={{ color: '#8899a6' }}>Resultados del conteo matutino</p>
            <Badge variant="warning" className="mt-2">
              {verificationData.timestamp}
            </Badge>
          </div>

          {/* ── Status alert ───────────────────────────────────── */}
          {verificationData.isCorrect ? (
            <div className="p-4 rounded-lg flex items-start gap-3" style={{
              background: 'rgba(0, 186, 124, 0.1)',
              border: '1px solid rgba(0, 186, 124, 0.3)',
            }}>
              <CheckCircle className="w-5 h-5 mt-0.5" style={{ color: '#00ba7c' }} />
              <div>
                <p className="font-medium" style={{ color: '#00ba7c' }}>Cambio Verificado Correctamente</p>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>El cajero entrante puede iniciar su turno</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg flex items-start gap-3" style={{
              background: 'rgba(244, 33, 46, 0.1)',
              border: '1px solid rgba(244, 33, 46, 0.3)',
            }}>
              <AlertTriangle className="w-5 h-5 mt-0.5" style={{ color: '#f4212e' }} />
              <div>
                <p className="font-medium" style={{ color: '#f4212e' }}>Diferencia Detectada</p>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>
                  {verificationData.hasShortage
                    ? 'Revisar faltante con el cajero saliente'
                    : 'Verificar origen del sobrante'}
                </p>
              </div>
            </div>
          )}

          {/* ── Anti-fraud: blocked vs results ─────────────────── */}
          {!reportSent ? (
            <div style={{
              background: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
              WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: `clamp(8px, 3vw, 16px)`,
              padding: `clamp(3rem, 8vw, 4rem)`,
              textAlign: 'center',
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
            <>
              {/* Info + Results grid */}
              <div className="grid md:grid-cols-2 gap-6 lg:max-w-3xl lg:mx-auto">
                {/* Info card */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                  <div style={glassCard}>
                    <h3 className="text-xl font-bold mb-4" style={{ color: '#e1e8ed' }}>Información del Conteo</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm" style={{ color: '#8899a6' }}>Sucursal</p>
                        <p className="text-lg font-semibold" style={{ color: '#e1e8ed' }}>{store?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: '#8899a6' }}>Cajero Entrante</p>
                        <p className="text-lg font-semibold" style={{ color: '#ffb84d' }}>{cashierIn?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm" style={{ color: '#8899a6' }}>Cajero Saliente</p>
                        <p className="text-lg font-semibold" style={{ color: '#e1e8ed' }}>{cashierOut?.name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Results card */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                  <div style={glassCard}>
                    <h3 className="text-xl font-bold mb-4" style={{ color: '#e1e8ed' }}>Resultados del Conteo</h3>
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
                          <span className="text-2xl font-bold" style={{
                            color: verificationData.isCorrect ? '#00ba7c' : '#f4212e',
                          }}>
                            {verificationData.difference >= 0 ? '+' : ''}
                            {formatCurrency(verificationData.difference)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Denomination detail */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 lg:max-w-3xl lg:mx-auto">
                <div style={glassCard}>
                  <h3 className="text-xl font-bold mb-4" style={{ color: '#e1e8ed' }}>Detalle de Denominaciones</h3>
                  <div className="p-4 rounded-lg" style={{
                    background: 'rgba(244, 165, 42, 0.1)',
                    border: '1px solid rgba(244, 165, 42, 0.3)',
                  }}>
                    <p className="text-sm font-medium mb-3" style={{ color: '#f4a52a' }}>
                      Cambio verificado para inicio de turno:
                    </p>
                    <div className="space-y-1">
                      <DenominationDisplay cashCount={props.cashCount} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* ── Actions section ────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8">
            <div style={{ ...glassCard, padding: '32px' }}>
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#00ba7c' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: '#e1e8ed' }}>Conteo Matutino Completado</h3>
                <p className="mb-6" style={{ color: '#8899a6' }}>
                  El cambio ha sido verificado y está listo para iniciar el turno.
                  Los datos están protegidos según el protocolo de seguridad.
                </p>

                {/* Warning banner */}
                {!reportSent && !whatsappOpened && !popupBlocked && (
                  <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] mb-[clamp(1rem,4vw,1.5rem)] flex items-start gap-3" style={{
                    background: 'rgba(255, 159, 10, 0.1)',
                    border: '1px solid rgba(255, 159, 10, 0.3)',
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

                {/* Popup blocked banner */}
                {popupBlocked && !reportSent && (
                  <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] mb-[clamp(1rem,4vw,1.5rem)] flex items-start gap-3" style={{
                    background: 'rgba(255, 69, 58, 0.1)',
                    border: '1px solid rgba(255, 69, 58, 0.3)',
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

                {/* Action buttons grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:max-w-3xl mx-auto">
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
                    onClick={handleComplete}
                    disabled={!reportSent}
                    className="bg-gradient-to-r from-[#f4a52a] to-[#ffb84d] hover:from-[#e89a1a] hover:to-[#ffa83d] text-white font-semibold hover:scale-105 transform transition-all duration-300 text-xs sm:text-sm px-2 py-2 md:col-span-1 col-span-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Finalizar
                  </Button>
                </div>

                {/* Confirm sent button */}
                {whatsappOpened && !reportSent && (
                  <div className="mt-[clamp(1rem,4vw,1.5rem)] p-[clamp(1rem,4vw,1.5rem)] rounded-[clamp(0.5rem,2vw,0.75rem)]" style={{
                    background: 'rgba(0, 186, 124, 0.1)',
                    border: '1px solid rgba(0, 186, 124, 0.3)',
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

                {/* Back button */}
                <div className="mt-4 text-center">
                  <Button
                    onClick={handleBack}
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

      {/* WhatsApp instructions modal */}
      <WhatsAppInstructionsModal
        isOpen={showWhatsAppInstructions}
        onOpenChange={setShowWhatsAppInstructions}
        onConfirmSent={handleConfirmSent}
      />
    </div>
  );
}
