// 🤖 [IA] - v1.0.0 - Wrapper para DeliveryDashboard con validación PIN y navegación
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DeliveryDashboard } from './DeliveryDashboard';
import { PinModal } from '../ui/pin-modal';
import { Button } from '../ui/button';

interface DeliveryDashboardWrapperProps {
  requirePin?: boolean;
}

export function DeliveryDashboardWrapper({
  requirePin = true
}: DeliveryDashboardWrapperProps) {
  const navigate = useNavigate();
  const [isPinValidated, setIsPinValidated] = useState(!requirePin);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  const handlePinSuccess = () => {
    setIsPinValidated(true);
    setFailedAttempts(0);
  };

  const handlePinError = () => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    
    // Bloquear después de 3 intentos fallidos
    if (newAttempts >= 3) {
      setIsLocked(true);
      
      // Desbloquear automáticamente después de 5 minutos
      setTimeout(() => {
        setIsLocked(false);
        setFailedAttempts(0);
      }, 5 * 60 * 1000); // 5 minutos
    }
  };

  const handleGoBack = () => {
    navigate('/');
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
      <div className="mb-4">
        <Button 
          variant="ghost" 
          onClick={handleGoBack}
          className="flex items-center gap-2 hover:bg-white/10"
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
