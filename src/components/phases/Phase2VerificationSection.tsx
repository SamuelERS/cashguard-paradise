// 🤖 [IA] - v1.2.11 - Sistema anti-fraude: indicadores visuales sin montos
// 🤖 [IA] - v1.1.14 - Simplificación visual y eliminación de redundancias
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, ChevronRight, Check, Banknote, Target, CheckCircle, Coins } from 'lucide-react';
import { Button } from '@/components/ui/button';
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 1 archivos CSS están ahora importados globalmente vía index.css:
// - phase2-confirm-button.css
// 🤖 [IA] - Eliminado imports de componentes UI para usar estilos inline v1.0.74
import { DeliveryCalculation } from '@/types/phases';
import { formatCurrency, calculateCashTotal } from '@/utils/calculations';
import { useTimingConfig } from '@/hooks/useTimingConfig'; // 🤖 [IA] - Hook de timing unificado v1.0.22

interface Phase2VerificationSectionProps {
  deliveryCalculation: DeliveryCalculation;
  onStepComplete: (stepKey: string) => void;
  onSectionComplete: () => void;
  completedSteps: Record<string, boolean>;
  // 🤖 [IA] - v1.2.24: Navigation props to match Phase 1 pattern
  onCancel: () => void;
  onPrevious: () => void;
  canGoPrevious: boolean;
}

export function Phase2VerificationSection({
  deliveryCalculation,
  onStepComplete,
  onSectionComplete,
  completedSteps,
  onCancel,
  onPrevious,
  canGoPrevious
}: Phase2VerificationSectionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  
  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Usar timing unificado v1.0.22
  const { verificationSteps, denominationsToKeep } = deliveryCalculation;
  const currentStep = verificationSteps[currentStepIndex];
  const isLastStep = currentStepIndex === verificationSteps.length - 1;
  const allStepsCompleted = verificationSteps.every(step => completedSteps[step.key]);
  const expectedTotal = calculateCashTotal(denominationsToKeep);

  // Auto-advance to next incomplete step
  useEffect(() => {
    const nextIncompleteIndex = verificationSteps.findIndex(step => !completedSteps[step.key]);
    if (nextIncompleteIndex !== -1 && nextIncompleteIndex !== currentStepIndex) {
      setCurrentStepIndex(nextIncompleteIndex);
      setInputValue('');
    }
  }, [completedSteps, verificationSteps, currentStepIndex]);

  // Complete section when all steps are done
  useEffect(() => {
    if (allStepsCompleted && verificationSteps.length > 0) {
      // 🤖 [IA] - Migrado a timing unificado para evitar race conditions v1.0.22
      const cleanup = createTimeoutWithCleanup(() => {
        onSectionComplete();
      }, 'transition', 'verification_section_complete');
      return cleanup;
    }
  }, [allStepsCompleted, verificationSteps.length, onSectionComplete, createTimeoutWithCleanup]);

  const handleConfirmStep = () => {
    if (!currentStep) return;
    
    const inputNum = parseInt(inputValue) || 0;
    if (inputNum === currentStep.quantity) {
      onStepComplete(currentStep.key);
      setInputValue('');
      
      // 🤖 [IA] - v1.2.11: Vibración haptica si está disponible
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

  if (verificationSteps.length === 0) {
    return (
      <div className="glass-panel-success text-center p-8">
        <Check className="w-16 h-16 mx-auto mb-4 text-success" />
        <h3 className="text-xl font-bold mb-2 text-success">
          Verificación Innecesaria
        </h3>
        <p className="text-muted-foreground">
          No hay efectivo que verificar en caja.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-[clamp(0.5rem,2vw,0.75rem)] max-w-md mx-auto sm:max-w-2xl lg:max-w-3xl overflow-y-auto max-h-screen"
    >
      {/* Header - 🤖 [IA] - v1.2.24: Glass morphism unificado */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="glass-panel-success p-4"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-[clamp(0.5rem,2vw,0.75rem)]">
          <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)]">
            <div className="w-[clamp(2.5rem,10vw,3rem)] h-[clamp(2.5rem,10vw,3rem)] rounded-full flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, var(--success-paradise) 0%, var(--success-paradise-light) 100%)'
            }}>
              <Building className="w-[clamp(1.25rem,5vw,1.5rem)] h-[clamp(1.25rem,5vw,1.5rem)] text-white" />
            </div>
            <div>
              <h3 className="text-[clamp(0.875rem,3.5vw,1rem)] sm:text-[clamp(1rem,4vw,1.125rem)] font-bold" style={{ color: 'var(--success-paradise)' }}>
                VERIFICACIÓN EN CAJA
              </h3>
              <p className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: 'var(--muted-foreground)' }}>
                Confirmar lo que queda
              </p>
            </div>
          </div>
          <div className="text-center sm:text-right">
            <span className="glass-target-badge inline-block px-[clamp(0.5rem,2vw,0.75rem)] py-[clamp(0.25rem,1vw,0.375rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] text-[clamp(0.75rem,3vw,0.875rem)] font-bold">
              🎯 Objetivo: Cambio completo
            </span>
          </div>
        </div>
      </motion.div>

      {/* Progress - 🤖 [IA] - v1.2.24: Glass morphism unificado */}
      <div className="glass-progress-container p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)]">
            {/* Badge QUEDA EN CAJA */}
            <div className="glass-badge-success" style={{
              padding: `clamp(0.25rem,1vw,0.375rem) clamp(0.5rem,2vw,0.75rem)`,
              borderRadius: `clamp(10px,4vw,20px)`,
              display: 'flex',
              alignItems: 'center',
              gap: `clamp(0.25rem,1vw,0.375rem)`
            }}>
              <span style={{ fontSize: `clamp(0.7rem,2.8vw,0.75rem)` }}>💼</span>
              <span className="text-[clamp(0.7rem,2.8vw,0.75rem)] font-bold uppercase" style={{ color: 'var(--success-paradise)', letterSpacing: '0.5px' }}>
                Queda en Caja
              </span>
            </div>
            {/* Contador de unidades */}
            <div className="flex items-center gap-[clamp(0.375rem,1.5vw,0.5rem)]">
              <span className="text-[clamp(0.75rem,3vw,0.875rem)] hidden sm:inline" style={{ color: 'var(--muted-paradise)' }}>Verificado:</span>
              <span className="text-[clamp(0.875rem,3.5vw,1rem)] font-bold" style={{ color: '#ffffff' }}>
                ✅ {Object.keys(completedSteps).filter(key => completedSteps[key]).length}/{verificationSteps.length}
              </span>
            </div>
          </div>
          <div className="flex-1 mx-[clamp(0.5rem,2vw,0.75rem)] rounded-full h-[clamp(0.5rem,2vw,0.625rem)]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
            <div 
              className="h-[clamp(0.5rem,2vw,0.625rem)] rounded-full transition-all duration-500"
              style={{ 
                width: `${(Object.keys(completedSteps).filter(key => completedSteps[key]).length / verificationSteps.length) * 100}%`,
                background: 'linear-gradient(90deg, var(--success-paradise) 0%, var(--success-paradise-light) 100%)',
                boxShadow: '0 0 8px rgba(0, 186, 124, 0.4)'
              }}
            />
          </div>
          {/* 🤖 [IA] - v1.2.11: Sin mostrar montos hasta el final */}
        </div>
      </div>

      {/* Current Step - Con detección dinámica y animaciones v1.0.77 */}
      {currentStep && !completedSteps[currentStep.key] && (() => {
        // 🤖 [IA] - Detección dinámica del tipo de denominación
        const isCoins = ['penny', 'nickel', 'dime', 'quarter', 'dollarCoin'].includes(currentStep.key);
        
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="glass-verification-field p-5"
          >
            {/* Header simplificado con denominación mejorada */}
            <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)] mb-[clamp(0.75rem,3vw,1rem)]">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-[clamp(2rem,8vw,2.5rem)] h-[clamp(2rem,8vw,2.5rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] flex items-center justify-center"
                style={{
                  background: isCoins 
                    ? 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)' 
                    : 'linear-gradient(135deg, var(--success-paradise) 0%, var(--success-paradise-light) 100%)'
                }}
              >
                {isCoins ? (
                  <Coins className="w-[clamp(1.25rem,5vw,1.5rem)] h-[clamp(1.25rem,5vw,1.5rem)] text-white" />
                ) : (
                  <Banknote className="w-[clamp(1.25rem,5vw,1.5rem)] h-[clamp(1.25rem,5vw,1.5rem)] text-white" />
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
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 186, 124, 0.3)'
                  }}
                >
                  {currentStep.label}
                </motion.h3>
                <div className="text-[clamp(0.75rem,3vw,0.875rem)] mt-[clamp(0.25rem,1vw,0.375rem)]" style={{ color: 'var(--muted-paradise)' }}>
                  Valor unitario: {formatCurrency(currentStep.value)}
                </div>
              </div>
            </div>

            {/* Cantidad destacada con jerarquía balanceada */}
            <div className="text-center mb-[clamp(0.75rem,3vw,1rem)]">
              <div className="glass-quantity-display inline-block px-[clamp(1rem,4vw,1.25rem)] py-[clamp(0.375rem,1.5vw,0.5rem)] rounded-[clamp(0.5rem,2vw,0.75rem)]"
              >
                <p className="text-[clamp(1.25rem,5vw,1.5rem)] sm:text-[clamp(1.5rem,6vw,1.875rem)] font-bold" style={{ color: 'var(--success-paradise)' }}>
                  {currentStep.quantity}
                </p>
                <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-[clamp(0.25rem,1vw,0.375rem)]" style={{ color: 'var(--muted-paradise)' }}>
                  {isCoins ? 'moneda' : 'billete'}{currentStep.quantity !== 1 ? 's' : ''} debe quedar
                </p>
              </div>
            </div>

            {/* Input de confirmación - Estilo coherente con Phase2DeliverySection */}
            <div className="space-y-[clamp(0.5rem,2vw,0.75rem)]">
              
              <div className="flex flex-col sm:flex-row gap-[clamp(0.375rem,1.5vw,0.5rem)] items-center justify-center">
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
                  className="input-field text-center text-[clamp(1rem,4.5vw,1.25rem)] font-semibold h-[clamp(2.5rem,10vw,3rem)] w-full max-w-[clamp(180px,80vw,260px)] sm:max-w-[clamp(200px,60vw,280px)]"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: parseInt(inputValue) > 0 && parseInt(inputValue) !== currentStep.quantity 
                      ? '2px solid rgba(244, 33, 46, 0.5)' 
                      : '2px solid rgba(0, 186, 124, 0.4)',
                    color: '#ffffff',
                    outline: 'none',
                    borderRadius: `clamp(8px, 3vw, 16px)`,
                    transition: 'all 0.3s',
                    WebkitAppearance: 'none',
                    MozAppearance: 'textfield'
                  }}
                  onFocus={(e) => {
                    if (!(parseInt(inputValue) > 0 && parseInt(inputValue) !== currentStep.quantity)) {
                      e.currentTarget.style.borderColor = 'rgba(0, 186, 124, 0.6)';
                      e.currentTarget.style.boxShadow = '0 0 10px rgba(0, 186, 124, 0.2)';
                    }
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                    setTimeout(() => {
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                  onBlur={(e) => {
                    if (!(parseInt(inputValue) > 0 && parseInt(inputValue) !== currentStep.quantity)) {
                      e.currentTarget.style.borderColor = 'rgba(0, 186, 124, 0.4)';
                    }
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  autoFocus
                />
                
                <Button
                  variant="phase2-confirm"
                  data-state={parseInt(inputValue) === currentStep.quantity ? "valid" : "invalid"}
                  data-mode="verification"
                  onClick={handleConfirmStep}
                  disabled={parseInt(inputValue) !== currentStep.quantity}
                  onMouseDown={(e) => e.preventDefault()}
                  onTouchStart={(e) => e.preventDefault()}
                  aria-label="Confirmar verificación"
                >
                  ⏎
                </Button>
              </div>
              
              {/* Mensaje de error mejorado */}
              {parseInt(inputValue) > 0 && parseInt(inputValue) !== currentStep.quantity && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[clamp(0.5rem,2vw,0.75rem)] p-[clamp(0.75rem,3vw,1rem)] text-center" 
                  style={{
                    backgroundColor: 'rgba(244, 33, 46, 0.15)',
                    border: '2px solid rgba(244, 33, 46, 0.4)',
                    borderRadius: `clamp(8px, 3vw, 16px)`
                  }}
                >
                  <p className="font-semibold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: '#f4212e' }}>
                    ⚠️ Cantidad incorrecta
                  </p>
                  <p className="text-[clamp(0.75rem,3vw,0.875rem)] mt-[clamp(0.25rem,1vw,0.375rem)]" style={{ color: '#f4212e' }}>
                    Deben quedar exactamente {currentStep.quantity} {currentStep.quantity === 1 ? 'unidad' : 'unidades'}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* Completed Steps Summary - 🤖 [IA] - v1.2.24: Glass morphism unificado */}
      {Object.keys(completedSteps).length > 0 && (
        <div className="glass-morphism-panel p-6">
          <h4 className="text-[clamp(0.75rem,3vw,0.875rem)] font-medium mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: 'var(--success-paradise)' }}>
            ✓ Denominaciones Verificadas
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[clamp(0.375rem,1.5vw,0.5rem)]">
            {verificationSteps.map((step) => (
              <div
                key={step.key}
                className="flex items-center gap-[clamp(0.375rem,1.5vw,0.5rem)] p-[clamp(0.375rem,1.5vw,0.5rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] text-[clamp(0.75rem,3vw,0.875rem)] transition-all duration-300"
                style={{
                  backgroundColor: completedSteps[step.key]
                    ? 'rgba(0, 186, 124, 0.1)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: completedSteps[step.key]
                    ? '1px solid rgba(0, 186, 124, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  color: completedSteps[step.key] ? 'var(--success-paradise)' : 'var(--muted-paradise)'
                }}
              >
                {completedSteps[step.key] ? (
                  <Check className="w-[clamp(0.875rem,3.5vw,1rem)] h-[clamp(0.875rem,3.5vw,1rem)]" />
                ) : (
                  <div className="w-[clamp(0.875rem,3.5vw,1rem)] h-[clamp(0.875rem,3.5vw,1rem)] rounded-full" style={{
                    border: '2px solid rgba(255, 255, 255, 0.3)'
                  }} />
                )}
                <span>{step.label} × {step.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final Validation - 🤖 [IA] - v1.2.24: Glass morphism unificado */}
      {allStepsCompleted && (
        <div className="glass-panel-success text-center p-8">
          <Check className="w-[clamp(3rem,12vw,4rem)] h-[clamp(3rem,12vw,4rem)] mx-auto mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: 'var(--success-paradise)' }} />
          <h3 className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold mb-[clamp(0.5rem,2vw,0.75rem)]" style={{ color: 'var(--success-paradise)' }}>
            Verificación Exitosa
          </h3>
          <p className="text-[clamp(0.875rem,3.5vw,1rem)] mb-[clamp(0.75rem,3vw,1rem)]" style={{ color: 'var(--muted-paradise)' }}>
            Has confirmado que quedan exactamente {formatCurrency(expectedTotal)} en caja.
          </p>
          <div className="rounded-[clamp(0.5rem,2vw,0.75rem)] p-[clamp(0.75rem,3vw,1rem)] mb-[clamp(0.75rem,3vw,1rem)] mx-auto max-w-md" style={{
            backgroundColor: 'rgba(0, 186, 124, 0.1)',
            border: '1px solid rgba(0, 186, 124, 0.3)',
          }}>
            <div className="flex items-center justify-center gap-[clamp(0.375rem,1.5vw,0.5rem)]">
              <Target className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" style={{ color: 'var(--success-paradise)' }} />
              <span className="font-bold text-[clamp(0.875rem,3.5vw,1rem)]" style={{ color: 'var(--success-paradise)' }}>
                OBJETIVO CUMPLIDO: {formatCurrency(50.00)} ✓
              </span>
            </div>
          </div>
          <p className="text-[clamp(0.75rem,3vw,0.875rem)] font-medium" style={{ color: '#1d9bf0' }}>
            Procediendo a generar reporte final...
          </p>
        </div>
      )}
    </motion.div>
  );
}