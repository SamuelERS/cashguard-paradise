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
      <div className="rounded-lg text-center" style={{
        backgroundColor: 'rgba(36, 36, 36, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(0, 186, 124, 0.4)',
        boxShadow: '0 4px 12px rgba(0, 186, 124, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        padding: '32px',  // 🤖 [IA] - Padding coherente v1.0.79
        borderRadius: '16px'
      }}>
        <Check className="w-12 h-12 mx-auto mb-4" style={{ color: '#00ba7c' }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: '#00ba7c' }}>
          No hay entrega necesaria
        </h3>
        <p style={{ color: '#8899a6' }}>
          El total es $50 o menos, no se requiere entrega a gerencia.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4 lg:max-w-3xl lg:mx-auto"
    >
      {/* Progress - 🤖 [IA] - v1.2.5: Mejorada visibilidad en Android */}
      <div className="rounded-lg" style={{
        backgroundColor: 'rgba(36, 36, 36, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        padding: '16px',
        borderRadius: '16px'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-medium" style={{ color: '#e1e8ed' }}>Entrega:</span>
            <span className="text-base font-bold" style={{ color: '#1d9bf0' }}>
              {Math.min(currentStepIndex + 1, deliverySteps.length)}/{deliverySteps.length}
            </span>
          </div>
          <div className="flex-1 mx-3 rounded-full h-2.5" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div 
              className="h-2.5 rounded-full transition-all duration-500"
              style={{ 
                width: `${(Object.keys(completedSteps).length / deliverySteps.length) * 100}%`,
                background: 'linear-gradient(90deg, #0a84ff 0%, #5e5ce6 100%)',
                boxShadow: '0 0 8px rgba(10, 132, 255, 0.4)'
              }}
            />
          </div>
          <span className="text-base font-bold" style={{ 
            color: '#1d9bf0',
            textShadow: '0 0 8px rgba(29, 155, 240, 0.3)'
          }}>
            {formatCurrency(amountToDeliver)}
          </span>
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
            className="rounded-lg" 
            style={{
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '2px solid rgba(10, 132, 255, 0.5)',
              boxShadow: '0 4px 12px rgba(10, 132, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              padding: '20px',
              borderRadius: '16px'
            }}
          >
            {/* Header simplificado con denominación mejorada */}
            <div className="flex items-center gap-3 mb-3">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: isCoins 
                    ? 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)' 
                    : 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)'
                }}
              >
                {isCoins ? (
                  <Coins className="w-6 h-6 text-white" />
                ) : (
                  <Banknote className="w-6 h-6 text-white" />
                )}
              </motion.div>
              
              <div className="flex-1">
                <motion.h3 
                  initial={{ opacity: 0.8 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  className="text-2xl font-bold" 
                  style={{ 
                    color: '#ffffff',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 0 20px rgba(10, 132, 255, 0.3)'
                  }}
                >
                  {currentStep.label}
                </motion.h3>
                <div className="text-xs mt-1" style={{ color: '#8899a6' }}>
                  Valor unitario: {formatCurrency(currentStep.value)}
                </div>
              </div>
            </div>

            {/* Cantidad destacada con jerarquía balanceada */}
            <div className="text-center mb-3">
              <div className="inline-block px-5 py-2 rounded-xl" 
                style={{
                  backgroundColor: 'rgba(10, 132, 255, 0.08)',
                  border: '1px solid rgba(10, 132, 255, 0.25)',
                }}
              >
                <p className="text-3xl font-bold" style={{ color: '#1d9bf0' }}>
                  {currentStep.quantity}
                </p>
                <p className="text-xs mt-0.5" style={{ color: '#8899a6' }}>
                  {isCoins ? 'moneda' : 'billete'}{currentStep.quantity !== 1 ? 's' : ''} a tomar
                </p>
              </div>
            </div>

            {/* Input inmediatamente después de la instrucción */}
            <div className="flex gap-2">
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
                className="input-field text-center text-xl font-semibold flex-1 h-12"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: parseInt(inputValue) > 0 && parseInt(inputValue) !== currentStep.quantity 
                    ? '2px solid rgba(244, 33, 46, 0.5)' 
                    : '2px solid rgba(10, 132, 255, 0.4)',
                  color: '#ffffff',
                  outline: 'none',
                  borderRadius: '8px',
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
                className="btn-primary px-4 py-2 text-lg h-12 min-w-[56px] font-bold flex items-center justify-center"
                style={{
                  background: parseInt(inputValue) === currentStep.quantity
                    ? 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)'
                    : 'rgba(36, 36, 36, 0.4)',
                  border: '2px solid rgba(10, 132, 255, 0.4)',
                  color: '#ffffff',
                  cursor: parseInt(inputValue) !== currentStep.quantity ? 'not-allowed' : 'pointer',
                  opacity: parseInt(inputValue) !== currentStep.quantity ? 0.5 : 1,
                  borderRadius: '8px',
                  transition: 'all 0.3s',
                  boxShadow: parseInt(inputValue) === currentStep.quantity 
                    ? '0 2px 8px rgba(10, 132, 255, 0.3)' 
                    : 'none'
                }}
                onMouseDown={(e) => e.preventDefault()}
                onTouchStart={(e) => e.preventDefault()}
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        );
      })()}

      {/* Completed Steps Summary - Padding coherente v1.0.79 */}
      {Object.keys(completedSteps).length > 0 && (
        <div className="rounded-lg" style={{
          backgroundColor: 'rgba(36, 36, 36, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          padding: '20px',  // 🤖 [IA] - v1.2.5: Padding ajustado para Android
          borderRadius: '16px'
        }}>
          <h4 className="text-sm font-medium mb-4" style={{ color: '#00ba7c' }}>
            ✓ Denominaciones Confirmadas
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {deliverySteps.map((step) => (
              <div
                key={step.key}
                className="flex items-center gap-2 p-2 rounded-lg text-sm transition-all duration-300"
                style={{
                  backgroundColor: completedSteps[step.key]
                    ? 'rgba(0, 186, 124, 0.1)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: completedSteps[step.key]
                    ? '1px solid rgba(0, 186, 124, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: completedSteps[step.key] ? '#00ba7c' : '#8899a6'
                }}
              >
                {completedSteps[step.key] ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <div className="w-4 h-4 rounded-full" style={{
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }} />
                )}
                <span>{step.label} × {step.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Complete - Con padding coherente v1.0.79 */}
      {allStepsCompleted && (
        <div className="rounded-lg text-center" style={{
          backgroundColor: 'rgba(36, 36, 36, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 186, 124, 0.4)',
          boxShadow: '0 4px 12px rgba(0, 186, 124, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          padding: '32px',  // 🤖 [IA] - Padding más generoso para sección de éxito
          borderRadius: '16px'
        }}>
          <Check className="w-12 h-12 mx-auto mb-4" style={{ color: '#00ba7c' }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: '#00ba7c' }}>
            Entrega Completada
          </h3>
          <p className="mb-4" style={{ color: '#8899a6' }}>
            Has tomado {formatCurrency(amountToDeliver)} para entregar a gerencia.
          </p>
          <p className="text-sm font-medium" style={{ color: '#1d9bf0' }}>
            Procediendo a verificación automáticamente...
          </p>
        </div>
      )}
    </motion.div>
  );
}