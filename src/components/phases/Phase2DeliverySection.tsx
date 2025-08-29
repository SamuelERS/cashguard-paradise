// 🤖 [IA] - v1.2.11 - Sistema anti-fraude: indicadores visuales sin montos
// 🤖 [IA] - v1.2.5 - Mejoras de visibilidad y espaciado en Android
// 🤖 [IA] - v1.1.14 - Reorganización de flujo vertical y eliminación de redundancias
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, ChevronRight, Check, Banknote, User, Coins } from 'lucide-react';
import { DeliveryCalculation } from '@/types/phases';
import { formatCurrency } from '@/utils/calculations';
import { useTimingConfig } from '@/hooks/useTimingConfig'; // 🤖 [IA] - Hook de timing unificado v1.0.22

interface Phase2DeliverySectionProps {
  deliveryCalculation: DeliveryCalculation;
  onStepComplete: (stepKey: string) => void;
  onSectionComplete: () => void;
  completedSteps: Record<string, boolean>;
}

export function Phase2DeliverySection({
  deliveryCalculation,
  onStepComplete,
  onSectionComplete,
  completedSteps
}: Phase2DeliverySectionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  
  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Usar timing unificado v1.0.22
  const { deliverySteps, amountToDeliver } = deliveryCalculation;
  const currentStep = deliverySteps[currentStepIndex];
  const isLastStep = currentStepIndex === deliverySteps.length - 1;
  const allStepsCompleted = deliverySteps.every(step => completedSteps[step.key]);

  // Auto-advance to next incomplete step
  useEffect(() => {
    const nextIncompleteIndex = deliverySteps.findIndex(step => !completedSteps[step.key]);
    if (nextIncompleteIndex !== -1 && nextIncompleteIndex !== currentStepIndex) {
      setCurrentStepIndex(nextIncompleteIndex);
      setInputValue('');
    }
  }, [completedSteps, deliverySteps, currentStepIndex]);

  // Complete section when all steps are done
  useEffect(() => {
    if (allStepsCompleted && deliverySteps.length > 0) {
      // 🤖 [IA] - Migrado a timing unificado para evitar race conditions v1.0.22
      const cleanup = createTimeoutWithCleanup(() => {
        onSectionComplete();
      }, 'transition', 'delivery_section_complete');
      return cleanup;
    }
  }, [allStepsCompleted, deliverySteps.length, onSectionComplete, createTimeoutWithCleanup]);

  const handleConfirmStep = () => {
    if (!currentStep) return;
    
    const inputNum = parseInt(inputValue) || 0;
    if (inputNum === currentStep.quantity) {
      onStepComplete(currentStep.key);
      setInputValue('');
      
      // 🤖 [IA] - v1.2.11: Feedback táctil al confirmar
      
      // Vibración haptica si está disponible
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      
      // Move to next step
      if (!isLastStep) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirmStep();
    }
  };

  if (deliverySteps.length === 0) {
    return (
      <div className="rounded-[clamp(0.5rem,2vw,0.75rem)] text-center" style={{
        backgroundColor: 'rgba(36, 36, 36, 0.4)',
        backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
        WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
        border: '1px solid rgba(0, 186, 124, 0.4)',
        boxShadow: '0 4px 12px rgba(0, 186, 124, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        padding: `clamp(1.5rem, 6vw, 2rem)`,
        borderRadius: `clamp(8px, 3vw, 16px)`
      }}>
        <Check className="w-[clamp(2.5rem,10vw,3rem)] h-[clamp(2.5rem,10vw,3rem)] mx-auto mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#00ba7c' }} />
        <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-2" style={{ color: '#00ba7c' }}>
          No hay entrega necesaria
        </h3>
        <p className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>
          El total es $50 o menos, no se requiere entrega a gerencia.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-[clamp(0.5rem,2vw,0.75rem)] lg:max-w-3xl lg:mx-auto"
    >
      {/* Progress - 🤖 [IA] - v1.2.11: Indicador de unidades sin montos (anti-fraude) */}
      <div className="rounded-[clamp(0.5rem,2vw,0.75rem)]" style={{
        backgroundColor: 'rgba(36, 36, 36, 0.4)',
        backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
        WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
        border: '1px solid rgba(244, 33, 46, 0.25)',
        boxShadow: '0 4px 12px rgba(244, 33, 46, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        padding: `clamp(0.75rem, 3vw, 1rem)`,
        borderRadius: `clamp(8px, 3vw, 16px)`,
        background: 'linear-gradient(135deg, rgba(244, 33, 46, 0.05) 0%, rgba(36, 36, 36, 0.4) 100%)'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)]">
            {/* Badge PARA GERENCIA */}
            <div style={{
              padding: `clamp(0.25rem,1vw,0.375rem) clamp(0.5rem,2vw,0.75rem)`,
              borderRadius: `clamp(10px,4vw,20px)`,
              background: 'linear-gradient(135deg, rgba(244, 33, 46, 0.2) 0%, rgba(244, 33, 46, 0.1) 100%)',
              border: '1px solid rgba(244, 33, 46, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: `clamp(0.25rem,1vw,0.375rem)`
            }}>
              <span style={{ fontSize: `clamp(0.7rem,2.8vw,0.75rem)` }}>🏢</span>
              <span className="text-[clamp(0.7rem,2.8vw,0.75rem)] font-bold uppercase" style={{ color: '#f4212e', letterSpacing: '0.5px' }}>
                Para Gerencia
              </span>
            </div>
            {/* Contador de unidades */}
            <div className="flex items-center gap-[clamp(0.375rem,1.5vw,0.5rem)]">
              <span className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: '#8899a6' }}>Unidades:</span>
              <span className="text-[clamp(0.875rem,3.5vw,1rem)] font-bold" style={{ color: '#ffffff' }}>
                📦 {Object.keys(completedSteps).length}/{deliverySteps.length}
              </span>
            </div>
          </div>
          <div className="flex-1 mx-[clamp(0.5rem,2vw,0.75rem)] rounded-full h-[clamp(0.5rem,2vw,0.625rem)]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div 
              className="h-[clamp(0.5rem,2vw,0.625rem)] rounded-full transition-all duration-500"
              style={{ 
                width: `${(Object.keys(completedSteps).length / deliverySteps.length) * 100}%`,
                background: `linear-gradient(90deg, 
                  ${Object.keys(completedSteps).length === 0 ? '#f4212e' : 
                    Object.keys(completedSteps).length < deliverySteps.length / 2 ? '#f4a52a' : 
                    Object.keys(completedSteps).length < deliverySteps.length ? '#ffb84d' : 
                    '#00ba7c'} 0%, 
                  ${Object.keys(completedSteps).length === deliverySteps.length ? '#06d6a0' : '#5e5ce6'} 100%)`,
                boxShadow: '0 0 8px rgba(10, 132, 255, 0.4)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Current Step - 🤖 [IA] - v1.1.14: Flujo vertical optimizado sin redundancias */}
      {currentStep && !completedSteps[currentStep.key] && (() => {
        const isCoins = ['penny', 'nickel', 'dime', 'quarter', 'dollarCoin'].includes(currentStep.key);
        
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="rounded-[clamp(0.5rem,2vw,0.75rem)]" 
            style={{
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
              WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
              border: '2px solid rgba(10, 132, 255, 0.5)',
              boxShadow: '0 4px 12px rgba(10, 132, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              padding: `clamp(1rem, 4vw, 1.25rem)`,
              borderRadius: `clamp(8px, 3vw, 16px)`
            }}
          >
            {/* Header con feedback visual mejorado - 🤖 [IA] - v1.2.11 */}
            <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)] mb-[clamp(0.5rem,2vw,0.75rem)]">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-[clamp(2rem,8vw,2.5rem)] h-[clamp(2rem,8vw,2.5rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] flex items-center justify-center"
                style={{
                  background: isCoins 
                    ? 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)' 
                    : 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)'
                }}
              >
                {isCoins ? (
                  <Coins className="w-[clamp(1.5rem,6vw,1.75rem)] h-[clamp(1.5rem,6vw,1.75rem)] text-white" />
                ) : (
                  <Banknote className="w-[clamp(1.5rem,6vw,1.75rem)] h-[clamp(1.5rem,6vw,1.75rem)] text-white" />
                )}
              </motion.div>
              
              <div className="flex-1">
                <motion.h3 
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold" 
                  style={{ 
                    color: '#ffffff',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 0 20px rgba(10, 132, 255, 0.3)'
                  }}
                >
                  {currentStep.label}
                </motion.h3>
                <div className="text-[clamp(0.75rem,3vw,0.875rem)] mt-[clamp(0.25rem,1vw,0.375rem)]" style={{ color: '#8899a6' }}>
                  Valor unitario: {formatCurrency(currentStep.value)}
                </div>
              </div>
            </div>

            {/* Cantidad destacada con jerarquía balanceada */}
            <div className="text-center mb-[clamp(0.5rem,2vw,0.75rem)]">
              <div className="inline-block px-[clamp(0.5rem,2vw,0.75rem)] py-[clamp(0.25rem,1vw,0.375rem)] rounded-[clamp(0.5rem,2vw,0.75rem)]" 
                style={{
                  backgroundColor: 'rgba(10, 132, 255, 0.08)',
                  border: '1px solid rgba(10, 132, 255, 0.25)',
                }}
              >
                <p className="text-[clamp(1.25rem,5vw,1.5rem)] font-bold" style={{ color: '#1d9bf0' }}>
                  {currentStep.quantity}
                </p>
                <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-[clamp(0.25rem,1vw,0.375rem)]" style={{ color: '#8899a6' }}>
                  {isCoins ? 'moneda' : 'billete'}{currentStep.quantity !== 1 ? 's' : ''} a tomar
                </p>
              </div>
            </div>

            {/* Input inmediatamente después de la instrucción */}
            <div className="flex gap-[clamp(0.5rem,2vw,0.75rem)]">
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                min="0"
                max={currentStep.quantity}
                value={inputValue}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setInputValue(value);
                }}
                onKeyPress={handleKeyPress}
                placeholder={`Confirme: ${currentStep.quantity}`}
                className="input-field text-center text-[clamp(1rem,4.5vw,1.25rem)] font-semibold flex-1 h-[clamp(2.5rem,10vw,3rem)]"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: parseInt(inputValue) > 0 && parseInt(inputValue) !== currentStep.quantity 
                    ? '2px solid rgba(244, 33, 46, 0.5)' 
                    : '2px solid rgba(10, 132, 255, 0.4)',
                  color: '#ffffff',
                  outline: 'none',
                  borderRadius: `clamp(8px, 3vw, 16px)`,
                  transition: 'all 0.3s',
                  WebkitAppearance: 'none',
                  MozAppearance: 'textfield'
                }}
                onFocus={(e) => {
                  if (!(parseInt(inputValue) > 0 && parseInt(inputValue) !== currentStep.quantity)) {
                    e.currentTarget.style.borderColor = 'rgba(10, 132, 255, 0.6)';
                    e.currentTarget.style.boxShadow = '0 0 10px rgba(10, 132, 255, 0.2)';
                  }
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                  setTimeout(() => {
                    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 100);
                }}
                onBlur={(e) => {
                  if (!(parseInt(inputValue) > 0 && parseInt(inputValue) !== currentStep.quantity)) {
                    e.currentTarget.style.borderColor = 'rgba(10, 132, 255, 0.4)';
                  }
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                onMouseDown={(e) => e.stopPropagation()}
                autoFocus
              />
              
              <button
                onClick={handleConfirmStep}
                disabled={parseInt(inputValue) !== currentStep.quantity}
                className="btn-primary px-[clamp(0.5rem,2vw,0.75rem)] py-[clamp(0.25rem,1vw,0.375rem)] text-[clamp(1rem,4.5vw,1.25rem)] h-[clamp(2.5rem,10vw,3rem)] min-w-[clamp(2.5rem,10vw,3rem)] font-bold flex items-center justify-center"
                style={{
                  background: parseInt(inputValue) === currentStep.quantity
                    ? 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)'
                    : 'rgba(36, 36, 36, 0.4)',
                  border: '2px solid rgba(10, 132, 255, 0.4)',
                  color: '#ffffff',
                  cursor: parseInt(inputValue) !== currentStep.quantity ? 'not-allowed' : 'pointer',
                  opacity: parseInt(inputValue) !== currentStep.quantity ? 0.5 : 1,
                  borderRadius: `clamp(8px, 3vw, 16px)`,
                  transition: 'all 0.3s',
                  boxShadow: parseInt(inputValue) === currentStep.quantity 
                    ? '0 2px 8px rgba(10, 132, 255, 0.3)' 
                    : 'none'
                }}
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
              >
                <Check className="w-[clamp(1.25rem,5vw,1.5rem)] h-[clamp(1.25rem,5vw,1.5rem)]" />
              </button>
            </div>
          </motion.div>
        );
      })()}

      {/* Section Complete - Con padding coherente v1.0.79 */}
      {allStepsCompleted && (
        <div className="rounded-[clamp(0.5rem,2vw,0.75rem)] text-center" style={{
          backgroundColor: 'rgba(36, 36, 36, 0.4)',
          backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
          WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
          border: '1px solid rgba(0, 186, 124, 0.4)',
          boxShadow: '0 4px 12px rgba(0, 186, 124, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          padding: `clamp(1.5rem, 6vw, 2rem)`,  
          borderRadius: `clamp(8px, 3vw, 16px)`
        }}>
          <Check className="w-[clamp(2.5rem,10vw,3rem)] h-[clamp(2.5rem,10vw,3rem)] mx-auto mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: '#00ba7c' }} />
          <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-2" style={{ color: '#00ba7c' }}>
            Entrega Completada
          </h3>
          <p className="text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#8899a6' }}>
            Has tomado {formatCurrency(amountToDeliver)} para entregar a gerencia.
          </p>
          <p className="text-[clamp(0.75rem,3vw,0.875rem)] font-medium" style={{ color: '#1d9bf0' }}>
            Procediendo a verificación automáticamente...
          </p>
        </div>
      )}
    </motion.div>
  );
}