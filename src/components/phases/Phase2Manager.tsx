// 🤖 [IA] - v1.1.14 - Simplificación de tabs y eliminación de redundancias en Fase 2
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
// 🤖 [IA] - Eliminado imports de componentes UI para usar estilos inline v1.0.74
import { Phase2DeliverySection } from './Phase2DeliverySection';
import { Phase2VerificationSection } from './Phase2VerificationSection';
import { DeliveryCalculation } from '@/types/phases';
import { formatCurrency } from '@/utils/calculations';
import { useTimingConfig } from '@/hooks/useTimingConfig'; // 🤖 [IA] - Hook de timing unificado v1.0.22

interface Phase2ManagerProps {
  deliveryCalculation: DeliveryCalculation;
  onPhase2Complete: () => void;
  onBack: () => void;
}

export function Phase2Manager({
  deliveryCalculation,
  onPhase2Complete,
  onBack
}: Phase2ManagerProps) {
  const [currentSection, setCurrentSection] = useState<'delivery' | 'verification'>('delivery');
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState<Record<string, boolean>>({});
  const [verificationProgress, setVerificationProgress] = useState<Record<string, boolean>>({});
  
  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Usar timing unificado v1.0.22

  // Auto-advance to verification when delivery is complete
  useEffect(() => {
    if (deliveryCompleted && currentSection === 'delivery') {
      // 🤖 [IA] - Migrado a timing unificado para evitar race conditions v1.0.22
      const cleanup = createTimeoutWithCleanup(() => {
        setCurrentSection('verification');
      }, 'transition', 'phase2_to_verification');
      return cleanup;
    }
  }, [deliveryCompleted, currentSection, createTimeoutWithCleanup]);

  // Complete phase 2 when verification is done
  useEffect(() => {
    if (verificationCompleted) {
      // 🤖 [IA] - Migrado a timing unificado para evitar race conditions v1.0.22
      const cleanup = createTimeoutWithCleanup(() => {
        onPhase2Complete();
      }, 'transition', 'phase2_complete');
      return cleanup;
    }
  }, [verificationCompleted, onPhase2Complete, createTimeoutWithCleanup]);

  const handleDeliveryStepComplete = (stepKey: string) => {
    setDeliveryProgress(prev => ({
      ...prev,
      [stepKey]: true
    }));

    // Check if all delivery steps are complete
    const allDeliveryComplete = deliveryCalculation.deliverySteps.every(
      step => deliveryProgress[step.key] || step.key === stepKey
    );
    
    if (allDeliveryComplete) {
      setDeliveryCompleted(true);
    }
  };

  const handleDeliverySectionComplete = () => {
    setDeliveryCompleted(true);
  };

  const handleVerificationStepComplete = (stepKey: string) => {
    setVerificationProgress(prev => ({
      ...prev,
      [stepKey]: true
    }));

    // Check if all verification steps are complete
    const allVerificationComplete = deliveryCalculation.verificationSteps.every(
      step => verificationProgress[step.key] || step.key === stepKey
    );
    
    if (allVerificationComplete) {
      setVerificationCompleted(true);
    }
  };

  const handleVerificationSectionComplete = () => {
    setVerificationCompleted(true);
  };

  if (deliveryCalculation.amountToDeliver <= 0) {
    // Skip phase 2 entirely
    useEffect(() => {
      onPhase2Complete();
    }, [onPhase2Complete]);
    
    return null;
  }

  return (
    // 🤖 [IA] - v1.0.97: Optimización responsive Fase 2 sin afectar móviles
    <div className="space-y-4 max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl">
      {/* Phase 2 Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#1d9bf0' }}>
          Fase 2: División y Verificación del Efectivo
        </h2>
        <p style={{ color: '#8899a6' }}>
          Separar {formatCurrency(deliveryCalculation.amountToDeliver)} para gerencia, dejar $50.00 en caja
        </p>
      </motion.div>

      {/* Section Navigation - 🤖 [IA] - v1.1.14: Simplificado sin redundancias */}
      <div className="p-3 rounded-lg" style={{
        backgroundColor: 'rgba(36, 36, 36, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        borderRadius: '16px'
      }}>
        <div className="flex items-center gap-2">
          <button
            onClick={() => currentSection !== 'delivery' && !verificationCompleted && setCurrentSection('delivery')}
            className="flex-1 px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2"
            style={{
              backgroundColor: currentSection === 'delivery' ? 'rgba(10, 132, 255, 0.2)' : 'transparent',
              color: currentSection === 'delivery' ? '#1d9bf0' : '#8899a6',
              border: currentSection === 'delivery' ? '2px solid #1d9bf0' : '2px solid rgba(255, 255, 255, 0.1)',
              cursor: currentSection === 'delivery' ? 'default' : 'pointer',
            }}
          >
            {deliveryCompleted && (
              <span style={{ color: '#00ba7c' }}>✓</span>
            )}
            Entrega
          </button>
          <button
            onClick={() => deliveryCompleted && currentSection !== 'verification' && setCurrentSection('verification')}
            className="flex-1 px-4 py-2 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2"
            style={{
              backgroundColor: currentSection === 'verification' ? 'rgba(0, 186, 124, 0.2)' : 'transparent',
              color: currentSection === 'verification' ? '#00ba7c' : deliveryCompleted ? '#8899a6' : '#657786',
              border: currentSection === 'verification' ? '2px solid #00ba7c' : '2px solid rgba(255, 255, 255, 0.1)',
              cursor: !deliveryCompleted ? 'not-allowed' : currentSection === 'verification' ? 'default' : 'pointer',
              opacity: !deliveryCompleted ? 0.5 : 1,
            }}
            disabled={!deliveryCompleted}
          >
            {verificationCompleted && (
              <span style={{ color: '#00ba7c' }}>✓</span>
            )}
            Verificar
          </button>
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        {currentSection === 'delivery' && (
          <motion.div
            key="delivery"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Phase2DeliverySection
              deliveryCalculation={deliveryCalculation}
              onStepComplete={handleDeliveryStepComplete}
              onSectionComplete={handleDeliverySectionComplete}
              completedSteps={deliveryProgress}
            />
          </motion.div>
        )}

        {currentSection === 'verification' && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Phase2VerificationSection
              deliveryCalculation={deliveryCalculation}
              onStepComplete={handleVerificationStepComplete}
              onSectionComplete={handleVerificationSectionComplete}
              completedSteps={verificationProgress}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons - 🤖 [IA] - v1.0.97: Responsive desktop */}
      {/* 🤖 [IA] - v1.2.5: Botones con texto responsivo y mejor alineación */}
      <div className="flex gap-3 lg:max-w-lg lg:mx-auto">
        <button
          onClick={onBack}
          className="flex-1 h-11 px-3 sm:px-4 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm flex items-center justify-center whitespace-nowrap"
          style={{
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#e1e8ed',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(36, 36, 36, 0.5)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(36, 36, 36, 0.4)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          <span>Volver</span>
          <span className="hidden sm:inline ml-1">a Fase 1</span>
        </button>
        
        {/* Manual section switch (only when delivery is complete) */}
        {deliveryCompleted && currentSection === 'delivery' && !verificationCompleted && (
          <button
            onClick={() => setCurrentSection('verification')}
            className="flex-1 h-11 px-3 sm:px-4 rounded-lg font-medium transition-all duration-300 text-xs sm:text-sm flex items-center justify-center whitespace-nowrap"
            style={{
              background: 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)',
              border: '1px solid rgba(0, 186, 124, 0.4)',
              color: '#ffffff',
              boxShadow: '0 3px 12px rgba(0, 186, 124, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 186, 124, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 3px 12px rgba(0, 186, 124, 0.2)';
            }}
          >
            <span>Verificar</span>
            <span className="hidden sm:inline ml-1">Efectivo</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 flex-shrink-0" />
          </button>
        )}
      </div>
    </div>
  );
}