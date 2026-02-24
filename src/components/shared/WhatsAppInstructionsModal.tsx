// 🤖 [IA] - Componente compartido para modal instrucciones WhatsApp (DRY - Mandamiento #6)
// Extraído de CashCalculation.tsx y MorningVerification.tsx

import { CheckCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';

interface WhatsAppInstructionsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmSent: () => void;
}

const INSTRUCTION_STEPS = [
  {
    title: 'Vaya a su WhatsApp Web',
    subtitle: 'Debe estar ya abierto según el protocolo'
  },
  {
    title: 'Seleccione el chat de gerencia',
    subtitle: 'O el grupo correspondiente para reportes'
  },
  {
    title: 'Pegue el reporte',
    subtitle: `Presione ${/Mac/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '') ? 'Cmd+V' : 'Ctrl+V'} en el campo de mensaje`
  },
  {
    title: 'Envíe el mensaje',
    subtitle: 'Presione Enter para enviar el reporte'
  }
] as const;

/**
 * Modal con instrucciones paso a paso para enviar reporte por WhatsApp Web.
 * Usado tanto en CashCalculation (corte nocturno) como MorningVerification (conteo matutino).
 */
export function WhatsAppInstructionsModal({
  isOpen,
  onOpenChange,
  onConfirmSent
}: WhatsAppInstructionsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-morphism-panel modal-size-compact overflow-y-auto overflow-x-hidden p-0">
        <DialogTitle className="sr-only">
          Instrucciones para enviar reporte por WhatsApp
        </DialogTitle>
        <DialogDescription className="sr-only">
          Pasos detallados para enviar el reporte copiado a WhatsApp Web
        </DialogDescription>

        <div className="p-fluid-lg space-y-fluid-lg">
          {/* Header */}
          <div className="flex items-center gap-fluid-md">
            <MessageSquare
              className="flex-shrink-0 w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)]"
              style={{ color: '#00ba7c' }}
              aria-label="Icono de WhatsApp"
            />
            <div className="flex flex-col">
              <h2 className="font-bold text-[clamp(1.125rem,5vw,1.375rem)] text-[#e1e8ed] leading-tight">
                Cómo enviar el reporte
              </h2>
              <p className="modal-subtitle mt-[clamp(0.125rem,0.5vw,0.25rem)]">
                Siga estos pasos para enviar por WhatsApp Web
              </p>
            </div>
          </div>

          {/* Pasos */}
          <div className="space-y-[clamp(0.75rem,3vw,1rem)]">
            {INSTRUCTION_STEPS.map((step, index) => (
              <div key={index} className="flex items-start gap-[clamp(0.5rem,2vw,0.75rem)]">
                <div
                  className="w-[clamp(1.75rem,7vw,2rem)] h-[clamp(1.75rem,7vw,2rem)] rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(0, 186, 124, 0.2)',
                    border: '1px solid rgba(0, 186, 124, 0.3)'
                  }}
                >
                  <span className="text-[clamp(0.875rem,3.5vw,1rem)] font-bold" style={{ color: '#00ba7c' }}>
                    {index + 1}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#e1e8ed' }}>
                    {step.title}
                  </p>
                  <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-1" style={{ color: '#8899a6' }}>
                    {step.subtitle}
                  </p>
                </div>
              </div>
            ))}

            {/* Banner de confirmación */}
            <div
              className="p-[clamp(0.75rem,3vw,1rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] flex items-center gap-[clamp(0.5rem,2vw,0.75rem)]"
              style={{
                background: 'rgba(0, 186, 124, 0.1)',
                border: '1px solid rgba(0, 186, 124, 0.3)'
              }}
            >
              <CheckCircle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] flex-shrink-0" style={{ color: '#00ba7c' }} />
              <p className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: '#00ba7c' }}>
                El reporte ya está copiado en su portapapeles
              </p>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-[clamp(0.5rem,2vw,0.75rem)] pt-fluid-md border-t border-slate-600">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-fluid-3xl"
            >
              Cerrar
            </Button>
            <ConstructiveActionButton
              onClick={() => {
                onOpenChange(false);
                onConfirmSent();
              }}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4" />
              Ya lo envié
            </ConstructiveActionButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
