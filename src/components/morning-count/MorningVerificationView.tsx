/**
 * 🤖 [IA] - v1.5.0: Refactor UX/UI MorningVerificationView
 * - Reduce deuda de estilos inline
 * - Consolidar cards en shell glass canónico
 * - Mantener flujo funcional y textos de negocio
 */
import { motion } from 'framer-motion';
import {
  Sunrise,
  CheckCircle,
  AlertTriangle,
  Share,
  ArrowLeft,
  Copy,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { WhatsAppInstructionsModal } from '@/components/shared/WhatsAppInstructionsModal';
import { calculateCashTotal, formatCurrency } from '@/utils/calculations';
import type { CashCount } from '@/types/cash';
import type { MorningVerificationProps } from '@/types/morningVerification';
import { useMorningVerificationController } from '@/hooks/morning-verification/useMorningVerificationController';

const DENOMINATIONS = [
  { key: 'penny', label: '1¢ centavo', value: 0.01 },
  { key: 'nickel', label: '5¢ centavos', value: 0.05 },
  { key: 'dime', label: '10¢ centavos', value: 0.1 },
  { key: 'quarter', label: '25¢ centavos', value: 0.25 },
  { key: 'dollarCoin', label: '$1 moneda', value: 1.0 },
  { key: 'bill1', label: '$1', value: 1.0 },
  { key: 'bill5', label: '$5', value: 5.0 },
  { key: 'bill10', label: '$10', value: 10.0 },
  { key: 'bill20', label: '$20', value: 20.0 },
  { key: 'bill50', label: '$50', value: 50.0 },
  { key: 'bill100', label: '$100', value: 100.0 },
] as const;

function DenominationDisplay({ cashCount }: { cashCount: CashCount }) {
  const items = DENOMINATIONS.filter(d => cashCount[d.key as keyof CashCount] > 0);
  const total = calculateCashTotal(cashCount);

  return (
    <>
      {items.map(d => {
        const quantity = cashCount[d.key as keyof CashCount] || 0;
        const subtotal = quantity * d.value;

        return (
          <div
            key={d.key}
            className="flex justify-between rounded px-3 py-1.5 text-sm bg-[rgba(244,165,42,0.05)]"
          >
            <span className="font-medium text-[#e1e8ed]">{d.label}</span>
            <span className="font-semibold text-[#ffb84d]">
              × {quantity} = {formatCurrency(subtotal)}
            </span>
          </div>
        );
      })}

      {items.length > 0 && (
        <>
          <div className="my-2 border-t border-[rgba(244,165,42,0.3)]" />
          <div className="flex justify-between px-3 text-sm font-bold">
            <span className="text-[#ffb84d]">Total contado:</span>
            <span className="text-[#f4a52a]">{formatCurrency(total)}</span>
          </div>
        </>
      )}
    </>
  );
}

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
    handleBack,
    handleComplete,
    setShowWhatsAppInstructions,
  } = useMorningVerificationController(props);

  if (isLoading || !verificationData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sunrise className="mx-auto mb-4 h-12 w-12 text-[#f4a52a]" />
          </motion.div>
          <p className="text-[#8899a6]">Verificando conteo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="morning-verification-container relative min-h-screen overflow-y-auto" data-scrollable="true">
      <div className="relative z-10 container mx-auto px-4 py-8 lg:max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-2xl font-bold text-[#f4a52a]">Verificación Completada</h2>
            <p className="text-[#8899a6]">Resultados del conteo matutino</p>
            <Badge variant="warning" className="mt-2">
              {verificationData.timestamp}
            </Badge>
          </div>

          {verificationData.isCorrect ? (
            <div className="flex items-start gap-3 rounded-lg border border-[rgba(0,186,124,0.3)] bg-[rgba(0,186,124,0.1)] p-4">
              <CheckCircle className="mt-0.5 h-5 w-5 text-[#00ba7c]" />
              <div>
                <p className="font-medium text-[#00ba7c]">Cambio Verificado Correctamente</p>
                <p className="mt-1 text-sm text-[#8899a6]">
                  El cajero entrante puede iniciar su turno
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-lg border border-[rgba(244,33,46,0.3)] bg-[rgba(244,33,46,0.1)] p-4">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-[#f4212e]" />
              <div>
                <p className="font-medium text-[#f4212e]">Diferencia Detectada</p>
                <p className="mt-1 text-sm text-[#8899a6]">
                  {verificationData.hasShortage
                    ? 'Revisar faltante con el cajero saliente'
                    : 'Verificar origen del sobrante'}
                </p>
              </div>
            </div>
          )}

          {!reportSent ? (
            <div className="glass-morphism-panel rounded-[clamp(0.75rem,3vw,1rem)] border border-[rgba(255,255,255,0.15)] px-[clamp(1.25rem,5vw,2rem)] py-[clamp(2rem,8vw,3.25rem)] text-center">
              <Lock className="mx-auto mb-[clamp(1rem,4vw,1.5rem)] h-[clamp(3rem,12vw,4rem)] w-[clamp(3rem,12vw,4rem)] text-[#f4a52a]" />
              <h3 className="mb-2 text-[clamp(1rem,4.5vw,1.25rem)] font-bold text-[#e1e8ed]">
                🔒 Resultados Bloqueados
              </h3>
              <p className="text-[clamp(0.875rem,3.5vw,1rem)] text-[#8899a6]">
                Los resultados de la verificación matutina se revelarán después de enviar el reporte por
                WhatsApp. Esto garantiza la trazabilidad completa de todas las verificaciones realizadas.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:mx-auto lg:max-w-3xl">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="glass-morphism-panel space-y-4">
                    <h3 className="text-xl font-bold text-[#e1e8ed]">Información del Conteo</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-[#8899a6]">Sucursal</p>
                        <p className="text-lg font-semibold text-[#e1e8ed]">{store?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[#8899a6]">Cajero Entrante</p>
                        <p className="text-lg font-semibold text-[#ffb84d]">
                          {cashierIn?.name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-[#8899a6]">Cajero Saliente</p>
                        <p className="text-lg font-semibold text-[#e1e8ed]">
                          {cashierOut?.name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="glass-morphism-panel">
                    <h3 className="mb-4 text-xl font-bold text-[#e1e8ed]">Resultados del Conteo</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[#8899a6]">Total Contado:</span>
                        <span className="text-2xl font-bold text-[#e1e8ed]">
                          {formatCurrency(verificationData.totalCash)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#8899a6]">Cambio Esperado:</span>
                        <span className="text-xl text-[#8899a6]">
                          {formatCurrency(verificationData.expectedAmount)}
                        </span>
                      </div>
                      <div className="border-t border-gray-700 pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[#8899a6]">Diferencia:</span>
                          <span
                            className={`text-2xl font-bold ${
                              verificationData.isCorrect ? 'text-[#00ba7c]' : 'text-[#f4212e]'
                            }`}
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 lg:mx-auto lg:max-w-3xl"
              >
                <div className="glass-morphism-panel">
                  <h3 className="mb-4 text-xl font-bold text-[#e1e8ed]">Detalle de Denominaciones</h3>
                  <div className="rounded-lg border border-[rgba(244,165,42,0.3)] bg-[rgba(244,165,42,0.1)] p-4">
                    <p className="mb-3 text-sm font-medium text-[#f4a52a]">
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <div className="glass-morphism-panel px-[clamp(1rem,4vw,1.5rem)] py-[clamp(1.25rem,5vw,2rem)]">
              <div className="text-center">
                <CheckCircle className="mx-auto mb-4 h-16 w-16 text-[#00ba7c]" />
                <h3 className="mb-2 text-xl font-bold text-[#e1e8ed]">Conteo Matutino Completado</h3>
                <p className="mb-6 text-[#8899a6]">
                  El cambio ha sido verificado y está listo para iniciar el turno. Los datos están
                  protegidos según el protocolo de seguridad.
                </p>

                {!reportSent && !whatsappOpened && !popupBlocked && (
                  <div className="mb-[clamp(1rem,4vw,1.5rem)] flex items-start gap-3 rounded-[clamp(0.5rem,2vw,0.75rem)] border border-[rgba(255,159,10,0.3)] bg-[rgba(255,159,10,0.1)] p-[clamp(0.75rem,3vw,1rem)]">
                    <AlertTriangle className="mt-0.5 h-[clamp(1rem,4vw,1.25rem)] w-[clamp(1rem,4vw,1.25rem)] text-[#ff9f0a]" />
                    <div>
                      <p className="text-[clamp(0.875rem,3.5vw,1rem)] font-medium text-[#ff9f0a]">
                        ⚠️ DEBE ENVIAR REPORTE PARA CONTINUAR
                      </p>
                      <p className="mt-1 text-[clamp(0.75rem,3vw,0.875rem)] text-[#8899a6]">
                        Los resultados se revelarán después de enviar el reporte por WhatsApp.
                      </p>
                    </div>
                  </div>
                )}

                {popupBlocked && !reportSent && (
                  <div className="mb-[clamp(1rem,4vw,1.5rem)] flex items-start gap-3 rounded-[clamp(0.5rem,2vw,0.75rem)] border border-[rgba(255,69,58,0.3)] bg-[rgba(255,69,58,0.1)] p-[clamp(0.75rem,3vw,1rem)]">
                    <AlertTriangle className="mt-0.5 h-[clamp(1rem,4vw,1.25rem)] w-[clamp(1rem,4vw,1.25rem)] text-[#ff453a]" />
                    <div>
                      <p className="text-[clamp(0.875rem,3.5vw,1rem)] font-medium text-[#ff453a]">
                        🚫 Pop-ups Bloqueados
                      </p>
                      <p className="mt-1 text-[clamp(0.75rem,3vw,0.875rem)] text-[#8899a6]">
                        Su navegador bloqueó la apertura de WhatsApp. Use el botón "Copiar" para enviar
                        el reporte manualmente.
                      </p>
                    </div>
                  </div>
                )}

                <div className="mx-auto grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-3">
                  <Button
                    onClick={handleWhatsAppSend}
                    disabled={reportSent}
                    className="h-[clamp(2.75rem,7.2vw,3rem)] min-h-[44px] transform bg-gradient-to-r from-green-600 to-green-700 px-2 py-2 text-xs font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-green-700 hover:to-green-800 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:text-sm"
                  >
                    <Share className="mr-2 h-4 w-4" />
                    {reportSent ? 'Reporte Enviado ✅' : 'WhatsApp'}
                  </Button>

                  <Button
                    onClick={handleCopyToClipboard}
                    disabled={!reportSent && !popupBlocked}
                    variant="secondary"
                    className="h-[clamp(2.75rem,7.2vw,3rem)] min-h-[44px] transform border-warning/30 px-2 py-2 text-xs transition-all duration-300 hover:scale-105 hover:bg-warning/10 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:text-sm"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>

                  <Button
                    onClick={handleComplete}
                    disabled={!reportSent}
                    className="col-span-2 h-[clamp(2.75rem,7.2vw,3rem)] min-h-[44px] transform bg-gradient-to-r from-[#f4a52a] to-[#ffb84d] px-2 py-2 text-xs font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-[#e89a1a] hover:to-[#ffa83d] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 md:col-span-1 sm:text-sm"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Finalizar
                  </Button>
                </div>

                {whatsappOpened && !reportSent && (
                  <div className="mt-[clamp(1rem,4vw,1.5rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] border border-[rgba(0,186,124,0.3)] bg-[rgba(0,186,124,0.1)] p-[clamp(1rem,4vw,1.5rem)]">
                    <p className="mb-3 text-center text-[clamp(0.875rem,3.5vw,1rem)] text-[#8899a6]">
                      ¿Ya envió el reporte por WhatsApp?
                    </p>
                    <Button
                      onClick={handleConfirmSent}
                      className="h-[clamp(2.75rem,7.2vw,3rem)] min-h-[44px] w-full transform bg-gradient-to-r from-green-600 to-green-700 font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-green-700 hover:to-green-800"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Sí, ya envié el reporte
                    </Button>
                  </div>
                )}

                <div className="mt-4 text-center">
                  <Button onClick={handleBack} variant="ghost" size="sm" className="text-xs text-[#8899a6]">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Conteo
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <WhatsAppInstructionsModal
        isOpen={showWhatsAppInstructions}
        onOpenChange={setShowWhatsAppInstructions}
        onConfirmSent={handleConfirmSent}
      />
    </div>
  );
}
