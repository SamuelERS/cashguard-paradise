// 🤖 [IA] - v1.1.1 - FIX CRÍTICO: Botón Cancelar funcional + Modal consistente con sistema UX/UI
// Previous: v1.1.0 - Modal de validación PIN 100% consistente con sistema UX/UI (AlertDialog + responsive clamp + iOS fix)
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from './alert-dialog';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { Input } from './input';
import { Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// PIN ejemplo: "1234" → hash SHA-256
// Para generar: echo -n "1234" | shasum -a 256
// Hash verificado con openssl: echo -n "1234" | openssl dgst -sha256
const SUPERVISOR_PIN_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';

interface PinModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  onError: () => void;
  onCancel: () => void;
  isLocked: boolean;
  attempts: number;
  maxAttempts: number;
}

export function PinModal({
  isOpen,
  onSuccess,
  onError,
  onCancel,
  isLocked,
  attempts,
  maxAttempts
}: PinModalProps) {
  const [pin, setPin] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      toast.error('Acceso bloqueado temporalmente');
      return;
    }

    if (pin.length < 4) {
      toast.error('PIN debe tener al menos 4 dígitos');
      return;
    }

    setIsValidating(true);

    try {
      // Hash PIN ingresado usando Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(pin);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      if (hashHex === SUPERVISOR_PIN_HASH) {
        toast.success('✅ PIN correcto');
        setPin('');
        onSuccess();
      } else {
        toast.error(`❌ PIN incorrecto. Intento ${attempts + 1}/${maxAttempts}`);
        setPin('');
        onError();
      }
    } catch (error) {
      toast.error('Error al validar PIN');
      console.error('PIN validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      // 🤖 [IA] - v1.1.1: FIX CRÍTICO - onOpenChange handler para cerrar modal con botón Cancelar
      // Root cause: Sin este prop, AlertDialog no puede comunicar su intención de cerrarse
      // Solo cerrar si no está validando ni bloqueado (seguridad anti-fraude)
      if (!open && !isValidating && !isLocked) {
        onCancel();
      }
    }}>
      <AlertDialogContent
        className="modal-size-compact"
        style={{
          pointerEvents: 'auto',
          touchAction: 'auto'
        }}
        onEscapeKeyDown={(e) => {
          // Prevenir ESC cuando validando o bloqueado
          if (isValidating || isLocked) {
            e.preventDefault();
          } else {
            onCancel();
          }
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold flex items-center justify-center gap-[clamp(0.5rem,2vw,0.75rem)]">
            <Lock className="w-[clamp(1.25rem,5vw,1.5rem)] h-[clamp(1.25rem,5vw,1.5rem)] text-blue-500" />
            PIN Supervisor Requerido
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            Ingrese el PIN de supervisor para acceder a información financiera sensible
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLocked ? (
          <div className="text-center py-8">
            <AlertCircle className="w-[clamp(2.5rem,10vw,3rem)] h-[clamp(2.5rem,10vw,3rem)] mx-auto mb-[clamp(1rem,4vw,1.5rem)] text-red-500" />
            <p className="text-red-500 font-semibold text-[clamp(1rem,4.5vw,1.125rem)]">Acceso bloqueado</p>
            <p className="text-[clamp(0.875rem,3.5vw,1rem)] text-muted-foreground mt-[clamp(0.5rem,2vw,0.75rem)]">
              Demasiados intentos fallidos. Reintente en 5 minutos.
            </p>
            <DestructiveActionButton
              onClick={onCancel}
              className="mt-[clamp(1.5rem,6vw,2rem)] h-[clamp(2.5rem,10vw,3rem)] px-[clamp(1rem,4vw,1.5rem)]"
            >
              Volver
            </DestructiveActionButton>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-fluid-lg">
            <div>
              <label htmlFor="pin-input" className="text-[clamp(0.875rem,3.5vw,1rem)] font-medium mb-[clamp(0.5rem,2vw,0.75rem)] block">
                Ingrese PIN de supervisor
              </label>
              <Input
                id="pin-input"
                data-testid="pin-input"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Ingrese PIN (4-6 dígitos)"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                autoFocus
                disabled={isValidating}
                className="text-center text-[clamp(1rem,4vw,1.125rem)] tracking-widest h-[clamp(2.5rem,10vw,3rem)]"
              />
              {attempts > 0 && (
                <p className="text-[clamp(0.875rem,3.5vw,1rem)] text-red-500 mt-[clamp(0.5rem,2vw,0.75rem)] flex items-center gap-[clamp(0.25rem,1vw,0.5rem)]">
                  <AlertCircle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" />
                  Intentos restantes: {maxAttempts - attempts}
                </p>
              )}
            </div>

            <div className="flex gap-[clamp(0.75rem,3vw,1rem)]">
              <DestructiveActionButton
                type="button"
                data-testid="pin-cancel"
                onClick={onCancel}
                className="flex-1 h-[clamp(2.5rem,10vw,3rem)] px-[clamp(1rem,4vw,1.5rem)]"
                disabled={isValidating}
              >
                Cancelar
              </DestructiveActionButton>
              <ConstructiveActionButton
                type="submit"
                data-testid="pin-submit"
                disabled={pin.length < 4 || isValidating}
                className="flex-1 h-[clamp(2.5rem,10vw,3rem)] px-[clamp(1rem,4vw,1.5rem)]"
              >
                {isValidating ? 'Validando...' : 'Validar'}
              </ConstructiveActionButton>
            </div>

            <p className="text-[clamp(0.75rem,3vw,0.875rem)] text-muted-foreground text-center mt-[clamp(1rem,4vw,1.5rem)]">
              El PIN es requerido para acceder a información financiera sensible
            </p>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
