// 🤖 [IA] - v3.2.0 - FIX DEFINITIVO: onGoBack callback prop resets parent state (elimina bug estado local independiente)
// Previous: v3.1.0 - Integración DeliveryManager con tabs Dashboard/Gestión (Bug #1 + #5 resueltos)
// Previous: v3.0.0 - FIX DEFINITIVO: Reset completo de state antes de navegar (Bug #6 resuelto)
import { useState, useEffect, type KeyboardEvent } from 'react';
import { ArrowLeft, BarChart3, ClipboardList } from 'lucide-react';
import { DeliveryDashboard } from './DeliveryDashboard';
import { DeliveryManager } from './DeliveryManager';
import { PinModal } from '../ui/pin-modal';
import { NeutralActionButton } from '@/components/ui/neutral-action-button';

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
  const TAB_ORDER = ['dashboard', 'management'] as const;
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

  const handleTabKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      const nextIndex = (currentIndex + 1) % TAB_ORDER.length;
      setActiveTab(TAB_ORDER[nextIndex]);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      const prevIndex = (currentIndex - 1 + TAB_ORDER.length) % TAB_ORDER.length;
      setActiveTab(TAB_ORDER[prevIndex]);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      setActiveTab(TAB_ORDER[0]);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      setActiveTab(TAB_ORDER[TAB_ORDER.length - 1]);
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
    <div className="relative min-h-screen p-4">
      {/* Header: Botón volver + Tabs */}
      <div className="relative z-50 mx-auto mb-4 flex w-full max-w-7xl flex-col gap-3">
        <NeutralActionButton
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[DEBUG] Button clicked, calling handleGoBack');
            handleGoBack();
          }}
          className="self-start border border-[rgba(255,255,255,0.2)] bg-[rgba(36,36,36,0.55)] px-4"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Operaciones
        </NeutralActionButton>

        {/* Tab selector */}
        <div
          role="tablist"
          aria-label="Secciones de deliveries"
          onKeyDown={handleTabKeyDown}
          className="flex gap-2 rounded-lg border border-[rgba(255,255,255,0.1)] bg-[rgba(36,36,36,0.6)] p-1 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            role="tab"
            id="deliveries-tab-dashboard"
            aria-selected={activeTab === 'dashboard'}
            aria-controls="deliveries-panel-dashboard"
            tabIndex={activeTab === 'dashboard' ? 0 : -1}
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
            role="tab"
            id="deliveries-tab-management"
            aria-selected={activeTab === 'management'}
            aria-controls="deliveries-panel-management"
            tabIndex={activeTab === 'management' ? 0 : -1}
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
      <div
        id="deliveries-panel-dashboard"
        role="tabpanel"
        aria-labelledby="deliveries-tab-dashboard"
        hidden={activeTab !== 'dashboard'}
        className="mx-auto w-full max-w-7xl"
      >
        {activeTab === 'dashboard' ? (
          <DeliveryDashboard onGoToManagement={() => setActiveTab('management')} />
        ) : null}
      </div>

      <div
        id="deliveries-panel-management"
        role="tabpanel"
        aria-labelledby="deliveries-tab-management"
        hidden={activeTab !== 'management'}
        className="mx-auto w-full max-w-7xl"
      >
        {activeTab === 'management' ? <DeliveryManager /> : null}
      </div>
    </div>
  );
}
