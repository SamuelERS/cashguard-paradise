// 🤖 [IA] - v1.0.2 - Wrapper para DeliveryDashboard con validación PIN y navegación
// Previous: v1.0.1 - Agregada persistencia lockout con localStorage
// Previous: v1.0.0 - Implementación inicial sin persistencia lockout
import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOperationMode } from '@/hooks/useOperationMode';
import { DeliveryDashboard } from './DeliveryDashboard';
import { PinModal } from '../ui/pin-modal';
import { Button } from '../ui/button';

// 🔒 [SECURITY] - Lockout persistence helpers
interface LockoutData {
  timestamp: number;
  attempts: number;
}

const LOCKOUT_KEY = 'delivery_pin_lockout';
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene datos de lockout desde localStorage
 * @returns Objeto con estado de lockout o null si no hay lockout activo
 */
const getLockoutData = (): { isLocked: boolean; attempts: number; remainingMs: number } | null => {
  const data = localStorage.getItem(LOCKOUT_KEY);
  if (!data) return null;

  try {
    const { timestamp, attempts }: LockoutData = JSON.parse(data);
    const lockoutEnd = timestamp + LOCKOUT_DURATION;
    const now = Date.now();

    if (now < lockoutEnd) {
      return {
        isLocked: true,
        attempts,
        remainingMs: lockoutEnd - now
      };
    }

    // Lockout expirado, limpiar
    localStorage.removeItem(LOCKOUT_KEY);
    return null;
  } catch (error) {
    console.error('[ERROR] Failed to parse lockout data', error);
    localStorage.removeItem(LOCKOUT_KEY);
    return null;
  }
};

/**
 * Guarda datos de lockout en localStorage
 * @param attempts - Número de intentos fallidos
 */
const setLockoutData = (attempts: number): void => {
  const data: LockoutData = {
    timestamp: Date.now(),
    attempts
  };
  localStorage.setItem(LOCKOUT_KEY, JSON.stringify(data));
  console.log('[INFO] Lockout data saved to localStorage', data);
};

interface DeliveryDashboardWrapperProps {
  requirePin?: boolean;
}

export function DeliveryDashboardWrapper({
  requirePin = true
}: DeliveryDashboardWrapperProps) {
  const navigate = useNavigate();
  const { resetMode } = useOperationMode();
  const [isPinValidated, setIsPinValidated] = useState(!requirePin);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // 🔒 [SECURITY] - Restaurar lockout desde localStorage al montar componente
  useEffect(() => {
    const lockoutData = getLockoutData();
    if (lockoutData?.isLocked) {
      setIsLocked(true);
      setFailedAttempts(lockoutData.attempts);
      console.log('[INFO] Lockout active, remaining:', Math.round(lockoutData.remainingMs / 1000), 'seconds');

      // Re-crear timeout con tiempo restante exacto
      const timeoutId = setTimeout(() => {
        setIsLocked(false);
        setFailedAttempts(0);
        localStorage.removeItem(LOCKOUT_KEY);
        console.log('[INFO] Lockout expired, reset state');
      }, lockoutData.remainingMs);

      return () => clearTimeout(timeoutId);
    }
  }, []);

  const handlePinSuccess = () => {
    setIsPinValidated(true);
    setFailedAttempts(0);
    // Limpiar lockout si existía
    localStorage.removeItem(LOCKOUT_KEY);
    console.log('[INFO] PIN validated successfully, lockout cleared');
  };

  const handlePinError = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    console.log('[WARN] PIN validation failed, attempt', newAttempts, 'of 3');
    
    // Bloquear después de 3 intentos fallidos
    if (newAttempts >= 3) {
      setIsLocked(true);
      setLockoutData(newAttempts); // 🔒 Guardar en localStorage
      console.log('[SECURITY] Lockout activated for 5 minutes');
      
      // Desbloquear automáticamente después de 5 minutos
      setTimeout(() => {
        setIsLocked(false);
        setFailedAttempts(0);
        localStorage.removeItem(LOCKOUT_KEY); // 🔒 Limpiar después de timeout
        console.log('[INFO] Lockout auto-expired after 5 minutes');
      }, LOCKOUT_DURATION);
    }
  };

  const handleGoBack = () => {
    console.log('[DEBUG] Back button clicked, resetting operation mode and navigating to home');
    
    // 🔄 CRITICAL: Reset operation mode to show OperationSelector
    resetMode();
    
    try {
      navigate('/');
    } catch (error) {
      console.error('[ERROR] Navigate failed, using window.location fallback', error);
      window.location.href = '/';
    }
  };

  // Mostrar modal PIN si no está validado
  if (!isPinValidated) {
    return (
      <PinModal
        isOpen={true}
        onSuccess={handlePinSuccess}
        onError={handlePinError}
        isLocked={isLocked}
        attempts={failedAttempts}
        maxAttempts={3}
        onCancel={handleGoBack}
      />
    );
  }

  // Mostrar dashboard una vez validado el PIN
  return (
    <div className="min-h-screen relative p-4">
      {/* Breadcrumb de navegación */}
      <div className="mb-4 relative z-50">
        <Button 
          variant="ghost" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[DEBUG] Button clicked, calling handleGoBack');
            handleGoBack();
          }}
          className="flex items-center gap-2 hover:bg-white/10 cursor-pointer"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Operaciones
        </Button>
      </div>

      {/* Dashboard de deliveries */}
      <DeliveryDashboard />
    </div>
  );
}
