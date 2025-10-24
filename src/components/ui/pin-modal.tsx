// 🤖 [IA] - v1.0.0 - Modal de validación PIN para acceso supervisor
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Lock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// PIN ejemplo: "1234" → hash SHA-256
// Para generar: echo -n "1234" | shasum -a 256
const SUPERVISOR_PIN_HASH = 'a883dafc480d466ee04e0d6da986bd78eb1fdd2178d04693723da3a8f95d42f4';

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
    <Dialog open={isOpen} onOpenChange={() => !isValidating && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-500" />
            PIN Supervisor Requerido
          </DialogTitle>
        </DialogHeader>

        {isLocked ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <p className="text-red-500 font-semibold text-lg">Acceso bloqueado</p>
            <p className="text-sm text-muted-foreground mt-2">
              Demasiados intentos fallidos. Reintente en 5 minutos.
            </p>
            <Button 
              variant="secondary" 
              onClick={onCancel}
              className="mt-6"
            >
              Volver
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pin-input" className="text-sm font-medium mb-2 block">
                Ingrese PIN de supervisor
              </label>
              <Input
                id="pin-input"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Ingrese PIN (4-6 dígitos)"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                maxLength={6}
                autoFocus
                disabled={isValidating}
                className="text-center text-lg tracking-widest"
              />
              {attempts > 0 && (
                <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Intentos restantes: {maxAttempts - attempts}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="secondary" 
                onClick={onCancel} 
                className="flex-1"
                disabled={isValidating}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={pin.length < 4 || isValidating} 
                className="flex-1"
              >
                {isValidating ? 'Validando...' : 'Validar'}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-4">
              El PIN es requerido para acceder a información financiera sensible
            </p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
