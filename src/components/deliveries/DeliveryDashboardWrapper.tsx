// 🤖 [IA] - v3.2.0 - FIX DEFINITIVO: onGoBack callback prop resets parent state (elimina bug estado local independiente)
// Previous: v3.1.0 - Integración DeliveryManager con tabs Dashboard/Gestión (Bug #1 + #5 resueltos)
// Previous: v3.0.0 - FIX DEFINITIVO: Reset completo de state antes de navegar (Bug #6 resuelto)
import { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, ClipboardList } from 'lucide-react';
import { DeliveryDashboard } from './DeliveryDashboard';
import { DeliveryManager } from './DeliveryManager';
import { PinModal } from '../ui/pin-modal';
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';

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
  onGoBack?: () => void;
}

export function DeliveryDashboardWrapper({
  requirePin = true,
  onGoBack
}: DeliveryDashboardWrapperProps) {
  const [isPinValidated, setIsPinValidated] = useState(!requirePin);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'management'>('dashboard');

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
    // 🤖 [IA] - v3.2.0: FIX DEFINITIVO - Parent callback resets parent's own currentMode state
    // Root cause: useOperationMode() creates LOCAL state. Wrapper's resetMode() only resets
    // its own copy, NOT Index.tsx's currentMode. Parent's onGoBack calls parent's resetMode().
    console.log('[DEBUG] handleGoBack: cleaning local state and calling parent onGoBack');

    // Step 1: Clean local state
    setIsPinValidated(false);
    setFailedAttempts(0);
    setIsLocked(false);
    localStorage.removeItem(LOCKOUT_KEY);

    // Step 2: Notify parent to reset operation mode
    if (onGoBack) {
      onGoBack();
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
      {/* Header: Botón volver + Tabs */}
      <div className="mb-4 relative z-50 flex flex-col gap-3">
        <DestructiveActionButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[DEBUG] Button clicked, calling handleGoBack');
            handleGoBack();
          }}
          className="flex items-center gap-2 h-auto py-2 px-4 self-start"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Operaciones
        </DestructiveActionButton>

        {/* Tab selector */}
        <div className="flex gap-2 p-1 rounded-lg bg-[rgba(36,36,36,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.1)]">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'dashboard'
                ? 'bg-[rgba(10,132,255,0.2)] text-[#0a84ff] border border-[rgba(10,132,255,0.3)]'
                : 'text-[#8899a6] hover:text-[#e1e8ed] hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('management')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'management'
                ? 'bg-[rgba(10,132,255,0.2)] text-[#0a84ff] border border-[rgba(10,132,255,0.3)]'
                : 'text-[#8899a6] hover:text-[#e1e8ed] hover:bg-[rgba(255,255,255,0.05)]'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Gestión
          </button>
        </div>
      </div>

      {/* Contenido según tab activo */}
      {activeTab === 'dashboard' ? (
        <DeliveryDashboard />
      ) : (
        <DeliveryManager />
      )}
    </div>
  );
}
