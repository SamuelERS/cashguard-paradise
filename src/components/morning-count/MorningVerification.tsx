// 🤖 [IA] - v2.8.3: Refactorización - lógica extraída a useMorningVerification (Auditoría Cimientos de Cristal - Fase 2C)
// Previous: v2.8.2 - Tipado estricto - eliminación de 3 tipos 'any' (Auditoría Cimientos de Cristal)
// Previous: v2.8.1 - Refinamiento UX WhatsApp (botón siempre activo + eliminado botón redundante)
// Previous: v2.8 - Sistema WhatsApp inteligente aplicado (modal instrucciones + detección plataforma)
import { motion } from 'framer-motion';
import { Sunrise, CheckCircle, AlertTriangle, Share, ArrowLeft, Copy, Lock, MessageSquare } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import { calculateCashTotal, formatCurrency } from '@/utils/calculations';
import { CashCount } from '@/types/cash';
import { useMorningVerification } from '@/hooks/useMorningVerification';

// ============================================================================
// INTERFACES
// ============================================================================

interface MorningVerificationProps {
  storeId: string;
  cashierId: string;
  witnessId: string;
  cashCount: CashCount;
  onBack: () => void;
  onComplete: () => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DENOMINATION_DISPLAY_CONFIG = [
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
] as const;

// ============================================================================
// COMPONENT
// ============================================================================

export function MorningVerification({
  storeId,
  cashierId,
  witnessId,
  cashCount,
  onBack,
  onComplete
}: MorningVerificationProps) {
  // 🤖 [IA] - v2.8.3: Toda la lógica extraída al hook useMorningVerification
  const {
    verificationData,
    store,
    cashierIn,
    cashierOut,
    whatsappState,
    handleWhatsAppSend,
    handleConfirmSent,
    handleCopyToClipboard,
    closeInstructions,
    isMac
  } = useMorningVerification({
    storeId,
    cashierId,
    witnessId,
    cashCount
  });

  const { reportSent, whatsappOpened, popupBlocked, showInstructions } = whatsappState;

  // ---------------------------------------------------------------------------
  // UI Helper: Denomination Display (returns JSX, stays in component)
  // ---------------------------------------------------------------------------
  const generateDenominationDisplay = () => {
    const items = DENOMINATION_DISPLAY_CONFIG
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

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------
  return (
    <div className="morning-verification-container min-h-screen relative overflow-y-auto" data-scrollable="true">
      <div className="relative z-10 container mx-auto px-4 py-8 lg:max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#f4a52a' }}>
              Verificación Completada
            </h2>
            <p style={{ color: '#8899a6' }}>
              Resultados del conteo matutino
            </p>
            <Badge variant="warning" className="mt-2">
              {verificationData.timestamp}
            </Badge>
          </div>

          {/* Status Alert */}
          <StatusAlert verificationData={verificationData} />

          {/* Conditional Content: Locked or Results */}
          {!reportSent ? (
            <LockedResultsCard />
          ) : (
            <ResultsContent
              verificationData={verificationData}
              store={store}
              cashierIn={cashierIn}
              cashierOut={cashierOut}
              generateDenominationDisplay={generateDenominationDisplay}
            />
          )}

          {/* Action Section */}
          <ActionSection
            reportSent={reportSent}
            whatsappOpened={whatsappOpened}
            popupBlocked={popupBlocked}
            verificationData={verificationData}
            onWhatsAppSend={handleWhatsAppSend}
            onCopyToClipboard={handleCopyToClipboard}
            onComplete={onComplete}
            onConfirmSent={handleConfirmSent}
            onBack={onBack}
          />
        </motion.div>
      </div>

      {/* WhatsApp Instructions Modal */}
      <WhatsAppInstructionsModal
        open={showInstructions}
        onOpenChange={closeInstructions}
        onConfirmSent={handleConfirmSent}
        isMac={isMac}
      />
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface StatusAlertProps {
  verificationData: NonNullable<ReturnType<typeof useMorningVerification>['verificationData']>;
}

function StatusAlert({ verificationData }: StatusAlertProps) {
  if (verificationData.isCorrect) {
    return (
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
    );
  }

  return (
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
  );
}

function LockedResultsCard() {
  return (
    <div style={{
      background: 'rgba(36, 36, 36, 0.4)',
      backdropFilter: 'blur(clamp(12px, 4vw, 20px))',
      WebkitBackdropFilter: 'blur(clamp(12px, 4vw, 20px))',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: 'clamp(8px, 3vw, 16px)',
      padding: 'clamp(3rem, 8vw, 4rem)',
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
  );
}

interface ResultsContentProps {
  verificationData: NonNullable<ReturnType<typeof useMorningVerification>['verificationData']>;
  store: ReturnType<typeof useMorningVerification>['store'];
  cashierIn: ReturnType<typeof useMorningVerification>['cashierIn'];
  cashierOut: ReturnType<typeof useMorningVerification>['cashierOut'];
  generateDenominationDisplay: () => JSX.Element;
}

function ResultsContent({ verificationData, store, cashierIn, cashierOut, generateDenominationDisplay }: ResultsContentProps) {
  return (
    <>
      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-6 lg:max-w-3xl lg:mx-auto">
        {/* Count Info Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard title="Información del Conteo">
            <div className="space-y-4">
              <InfoRow label="Sucursal" value={store?.name || 'N/A'} />
              <InfoRow label="Cajero Entrante" value={cashierIn?.name || 'N/A'} highlight />
              <InfoRow label="Cajero Saliente" value={cashierOut?.name || 'N/A'} />
            </div>
          </GlassCard>
        </motion.div>

        {/* Results Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard title="Resultados del Conteo">
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
                    style={{ color: verificationData.isCorrect ? '#00ba7c' : '#f4212e' }}
                  >
                    {verificationData.difference >= 0 ? '+' : ''}
                    {formatCurrency(verificationData.difference)}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Denomination Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 lg:max-w-3xl lg:mx-auto"
      >
        <GlassCard title="Detalle de Denominaciones">
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
        </GlassCard>
      </motion.div>
    </>
  );
}

interface GlassCardProps {
  title: string;
  children: React.ReactNode;
}

function GlassCard({ title, children }: GlassCardProps) {
  return (
    <div style={{
      background: 'rgba(36, 36, 36, 0.4)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255, 255, 255, 0.15)',
      borderRadius: '16px',
      padding: '24px'
    }}>
      <h3 className="text-xl font-bold mb-4" style={{ color: '#e1e8ed' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function InfoRow({ label, value, highlight }: InfoRowProps) {
  return (
    <div>
      <p className="text-sm" style={{ color: '#8899a6' }}>{label}</p>
      <p className="text-lg font-semibold" style={{ color: highlight ? '#ffb84d' : '#e1e8ed' }}>
        {value}
      </p>
    </div>
  );
}

interface ActionSectionProps {
  reportSent: boolean;
  whatsappOpened: boolean;
  popupBlocked: boolean;
  verificationData: NonNullable<ReturnType<typeof useMorningVerification>['verificationData']>;
  onWhatsAppSend: () => Promise<void>;
  onCopyToClipboard: () => Promise<void>;
  onComplete: () => void;
  onConfirmSent: () => void;
  onBack: () => void;
}

function ActionSection({
  reportSent,
  whatsappOpened,
  popupBlocked,
  onWhatsAppSend,
  onCopyToClipboard,
  onComplete,
  onConfirmSent,
  onBack
}: ActionSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mt-8"
    >
      <GlassCard title="">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#00ba7c' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: '#e1e8ed' }}>
            Conteo Matutino Completado
          </h3>
          <p className="mb-6" style={{ color: '#8899a6' }}>
            El cambio ha sido verificado y está listo para iniciar el turno.
            Los datos están protegidos según el protocolo de seguridad.
          </p>

          {/* Warning Banners */}
          {!reportSent && !whatsappOpened && !popupBlocked && (
            <WarningBanner
              type="warning"
              title="⚠️ DEBE ENVIAR REPORTE PARA CONTINUAR"
              message="Los resultados se revelarán después de enviar el reporte por WhatsApp."
            />
          )}

          {popupBlocked && !reportSent && (
            <WarningBanner
              type="error"
              title="🚫 Pop-ups Bloqueados"
              message='Su navegador bloqueó la apertura de WhatsApp. Use el botón "Copiar" para enviar el reporte manualmente.'
            />
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 lg:max-w-3xl mx-auto">
            <Button
              onClick={onWhatsAppSend}
              disabled={reportSent}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold hover:scale-105 transform transition-all duration-300 text-xs sm:text-sm px-2 py-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Share className="w-4 h-4 mr-2" />
              {reportSent ? 'Reporte Enviado ✅' : 'WhatsApp'}
            </Button>

            <Button
              onClick={onCopyToClipboard}
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

          {/* Confirm Sent Button */}
          {whatsappOpened && !reportSent && (
            <div className="mt-[clamp(1rem,4vw,1.5rem)] p-[clamp(1rem,4vw,1.5rem)] rounded-[clamp(0.5rem,2vw,0.75rem)]" style={{
              background: 'rgba(0, 186, 124, 0.1)',
              border: '1px solid rgba(0, 186, 124, 0.3)'
            }}>
              <p className="text-[clamp(0.875rem,3.5vw,1rem)] mb-3 text-center" style={{ color: '#8899a6' }}>
                ¿Ya envió el reporte por WhatsApp?
              </p>
              <Button
                onClick={onConfirmSent}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold hover:scale-105 transform transition-all duration-300"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Sí, ya envié el reporte
              </Button>
            </div>
          )}

          {/* Back Button */}
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
      </GlassCard>
    </motion.div>
  );
}

interface WarningBannerProps {
  type: 'warning' | 'error';
  title: string;
  message: string;
}

function WarningBanner({ type, title, message }: WarningBannerProps) {
  const colors = type === 'warning'
    ? { bg: 'rgba(255, 159, 10, 0.1)', border: 'rgba(255, 159, 10, 0.3)', text: '#ff9f0a' }
    : { bg: 'rgba(255, 69, 58, 0.1)', border: 'rgba(255, 69, 58, 0.3)', text: '#ff453a' };

  return (
    <div className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] mb-[clamp(1rem,4vw,1.5rem)] flex items-start gap-3" style={{
      background: colors.bg,
      border: `1px solid ${colors.border}`
    }}>
      <AlertTriangle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] mt-0.5" style={{ color: colors.text }} />
      <div>
        <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: colors.text }}>
          {title}
        </p>
        <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
          {message}
        </p>
      </div>
    </div>
  );
}

interface WhatsAppInstructionsModalProps {
  open: boolean;
  onOpenChange: () => void;
  onConfirmSent: () => void;
  isMac: boolean;
}

function WhatsAppInstructionsModal({ open, onOpenChange, onConfirmSent, isMac }: WhatsAppInstructionsModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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

        {/* Steps */}
        <div className="space-y-3 mb-6">
          <InstructionStep number={1} title="Abra WhatsApp Web">
            Vaya a <code className="px-1 py-0.5 rounded bg-gray-800 text-green-400">web.whatsapp.com</code> en su navegador
          </InstructionStep>
          <InstructionStep number={2} title="Seleccione el contacto">
            Busque el chat de su supervisor o grupo
          </InstructionStep>
          <InstructionStep number={3} title="Pegue el reporte">
            Presione <code className="px-1 py-0.5 rounded bg-gray-800 text-blue-400">{isMac ? 'Cmd+V' : 'Ctrl+V'}</code> en el campo de mensaje
          </InstructionStep>
          <InstructionStep number={4} title="Envíe el mensaje">
            Haga clic en el botón de enviar y regrese aquí para confirmar
          </InstructionStep>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel
            onClick={onOpenChange}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#e1e8ed',
              border: '1px solid rgba(255, 255, 255, 0.15)'
            }}
          >
            Cerrar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmSent}
            className="bg-gradient-to-r from-[#f4a52a] to-[#ffb84d] text-[#1a1a1a] font-semibold hover:opacity-90"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Ya lo envié
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface InstructionStepProps {
  number: number;
  title: string;
  children: React.ReactNode;
}

function InstructionStep({ number, title, children }: InstructionStepProps) {
  return (
    <div className="flex gap-3">
      <div
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
          color: '#1a1a1a'
        }}
      >
        {number}
      </div>
      <div className="flex-1 pt-0.5">
        <p className="text-sm text-gray-200">
          <span className="font-medium text-white">{title}</span>
          <br />
          <span className="text-gray-400 text-xs">{children}</span>
        </p>
      </div>
    </div>
  );
}
