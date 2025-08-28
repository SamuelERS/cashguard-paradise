// 🤖 [IA] - v1.1.14 - Simplificación de tabs y eliminación de redundancias en Fase 2
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Package, ScrollText, Grid3x3, AlertCircle } from 'lucide-react';
// 🤖 [IA] - v1.2.10: Agregado AlertDialog para confirmación de salida
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// 🤖 [IA] - Eliminado imports de componentes UI para usar estilos inline v1.0.74
import { Phase2DeliverySection } from './Phase2DeliverySection';
import { Phase2VerificationSection } from './Phase2VerificationSection';
import { DeliveryCalculation } from '@/types/phases';
import { formatCurrency } from '@/utils/calculations';
import { useTimingConfig } from '@/hooks/useTimingConfig'; // 🤖 [IA] - Hook de timing unificado v1.0.22
import { Checkbox } from '@/components/ui/checkbox'; // 🤖 [IA] - v1.2.10: Checkbox para checklist

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
  const [showExitConfirmation, setShowExitConfirmation] = useState(false); // 🤖 [IA] - v1.2.10: Estado para modal de confirmación
  const [showInstructionsModal, setShowInstructionsModal] = useState(true); // 🤖 [IA] - v1.2.10: Modal de instrucciones
  const [checkedItems, setCheckedItems] = useState({
    bolsa: false,
    tirro: false,
    espacio: false,
    entendido: false
  }); // 🤖 [IA] - v1.2.10: Estado del checklist
  const [enabledItems, setEnabledItems] = useState({
    bolsa: false,
    tirro: false,
    espacio: false,
    entendido: false
  }); // 🤖 [IA] - v1.1.24: Estados individuales para activación secuencial
  
  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Usar timing unificado v1.0.22

  // 🤖 [IA] - v1.2.10: Manejar cambios en checklist
  const handleCheckChange = (item: keyof typeof checkedItems) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  // 🤖 [IA] - v1.2.10: Verificar si todos los items están marcados
  const allItemsChecked = Object.values(checkedItems).every(checked => checked);

  // 🤖 [IA] - v1.1.25: Activación inicial - solo el primer checkbox después de 2s
  useEffect(() => {
    if (showInstructionsModal) {
      const timer = setTimeout(() => {
        setEnabledItems(prev => ({...prev, bolsa: true}));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showInstructionsModal]);

  // 🤖 [IA] - v1.1.25: Activación progresiva basada en interacción del usuario
  useEffect(() => {
    // Activar tirro después de marcar bolsa
    if (checkedItems.bolsa && !enabledItems.tirro) {
      const timer = setTimeout(() => {
        setEnabledItems(prev => ({...prev, tirro: true}));
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    // Activar espacio después de marcar tirro
    if (checkedItems.tirro && checkedItems.bolsa && !enabledItems.espacio) {
      const timer = setTimeout(() => {
        setEnabledItems(prev => ({...prev, espacio: true}));
      }, 2000);
      return () => clearTimeout(timer);
    }
    
    // Activar entendido después de marcar espacio
    if (checkedItems.espacio && checkedItems.tirro && checkedItems.bolsa && !enabledItems.entendido) {
      const timer = setTimeout(() => {
        setEnabledItems(prev => ({...prev, entendido: true}));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [checkedItems, enabledItems]);

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
          Separar el efectivo que entregarás a gerencia
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
          onClick={() => setShowExitConfirmation(true)}
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
          <span>Volver al inicio</span>
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
      
      {/* 🤖 [IA] - v1.2.10: Diálogo de confirmación para prevenir pérdida accidental de datos */}
      <AlertDialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
      <AlertDialogContent style={{
        backgroundColor: 'rgba(36, 36, 36, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.8)'
      }}>
        <AlertDialogHeader>
          <AlertDialogTitle style={{ color: '#f4212e', fontSize: '1.25rem' }}>
            ⚠️ ¿Confirmar salida?
          </AlertDialogTitle>
          <AlertDialogDescription style={{ color: '#e1e8ed', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Se perderá todo el progreso del conteo actual. 
            <br />
            <span style={{ color: '#f4a52a', fontWeight: '500' }}>
              Esta acción no se puede deshacer.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              color: '#e1e8ed',
              borderRadius: '10px'
            }}
          >
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onBack}
            style={{
              background: 'linear-gradient(135deg, #f4212e 0%, #ff4444 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600'
            }}
          >
            Sí, volver al inicio
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* 🤖 [IA] - v1.2.10: Modal de instrucciones con checklist para preparación - Colores de corte nocturno */}
    <AlertDialog open={showInstructionsModal} onOpenChange={setShowInstructionsModal}>
      <AlertDialogContent style={{
        backgroundColor: 'rgba(36, 36, 36, 0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(244, 33, 46, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.8), 0 0 20px rgba(244, 33, 46, 0.2)',
        width: 'calc(100% - 2rem)',
        maxWidth: '500px',
        maxHeight: 'calc(100vh - 2rem)',
        position: 'fixed',
        left: '1rem',
        right: '1rem',
        top: '50%',
        transform: 'translateY(-50%)'
      }}>
        <AlertDialogHeader>
          <AlertDialogTitle style={{ color: '#1d9bf0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle className="w-6 h-6" />
            📋 Preparación para Entrega a Gerencia
          </AlertDialogTitle>
        </AlertDialogHeader>
        
        <div style={{ padding: '16px 0' }}>
          {/* Mensaje principal destacado */}
          <div style={{
            backgroundColor: 'rgba(10, 132, 255, 0.1)',
            border: '2px solid rgba(10, 132, 255, 0.4)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            <p style={{ 
              color: '#5e5ce6', 
              fontSize: '1.1rem', 
              fontWeight: '700',
              marginBottom: '8px'
            }}>
              ⚠️ IMPORTANTE
            </p>
            <p style={{ 
              color: '#ffffff', 
              fontSize: '1rem', 
              fontWeight: '600' 
            }}>
              Este dinero es para <span style={{ color: '#f4212e', textDecoration: 'underline' }}>ENTREGAR A GERENCIA</span>
            </p>
            <p style={{ 
              color: '#e1e8ed', 
              fontSize: '0.9rem', 
              marginTop: '8px' 
            }}>
              NO es para dejar en caja
            </p>
          </div>

          {/* Checklist de preparación */}
          <div style={{ color: '#e1e8ed' }}>
            <p style={{ marginBottom: '12px', fontSize: '0.95rem' }}>
              Antes de continuar, confirme que tiene todo listo:
            </p>
            
            {/* 🤖 [IA] - v1.1.24: Mensaje de activación secuencial */}
            <div style={{
              backgroundColor: !enabledItems.bolsa ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 186, 124, 0.1)',
              border: !enabledItems.bolsa ? '1px solid rgba(10, 132, 255, 0.3)' : '1px solid rgba(0, 186, 124, 0.3)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '16px',
              textAlign: 'center'
            }}>
              <p style={{ 
                color: !enabledItems.bolsa ? '#1d9bf0' : '#00ba7c',
                fontSize: '0.95rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                {!enabledItems.bolsa ? '⏱️ Preparando checklist...' : '📋 Lea cada item conforme se activa'}
              </p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Item 1: Bolsa */}
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: checkedItems.bolsa ? 'rgba(0, 186, 124, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: checkedItems.bolsa ? '1px solid rgba(0, 186, 124, 0.3)' : enabledItems.bolsa ? '1px solid rgba(10, 132, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  cursor: enabledItems.bolsa ? 'pointer' : 'not-allowed',
                  opacity: enabledItems.bolsa ? 1 : 0.4,
                  transition: 'all 0.3s ease',
                  animation: enabledItems.bolsa && !checkedItems.bolsa ? 'pulse 1s ease-in-out' : 'none'
                }}
              >
                <Checkbox
                  checked={checkedItems.bolsa}
                  onCheckedChange={() => enabledItems.bolsa && handleCheckChange('bolsa')}
                  disabled={!enabledItems.bolsa}
                  style={{
                    borderColor: checkedItems.bolsa ? '#00ba7c' : 'rgba(255, 255, 255, 0.3)',
                    cursor: enabledItems.bolsa ? 'pointer' : 'not-allowed'
                  }}
                />
                <Package className="w-5 h-5" style={{ color: '#0a84ff' }} />
                <span style={{ flex: 1 }}>
                  Tengo la <strong>bolsa de depósito</strong> lista
                  {!enabledItems.bolsa && <span style={{ color: '#8899a6', fontSize: '0.85rem', marginLeft: '8px' }}>(activando...)</span>}
                </span>
              </label>

              {/* Item 2: Tirro */}
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: checkedItems.tirro ? 'rgba(0, 186, 124, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: checkedItems.tirro ? '1px solid rgba(0, 186, 124, 0.3)' : enabledItems.tirro ? '1px solid rgba(10, 132, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  cursor: enabledItems.tirro ? 'pointer' : 'not-allowed',
                  opacity: enabledItems.tirro ? 1 : 0.4,
                  transition: 'all 0.3s ease',
                  animation: enabledItems.tirro && !checkedItems.tirro && enabledItems.bolsa ? 'pulse 1s ease-in-out' : 'none'
                }}
              >
                <Checkbox
                  checked={checkedItems.tirro}
                  onCheckedChange={() => enabledItems.tirro && handleCheckChange('tirro')}
                  disabled={!enabledItems.tirro}
                  style={{
                    borderColor: checkedItems.tirro ? '#00ba7c' : 'rgba(255, 255, 255, 0.3)',
                    cursor: enabledItems.tirro ? 'pointer' : 'not-allowed'
                  }}
                />
                <ScrollText className="w-5 h-5" style={{ color: '#0a84ff' }} />
                <span style={{ flex: 1 }}>
                  Tengo <strong>tirro/cinta adhesiva</strong> para rotular
                  {!enabledItems.tirro && (
                    <span style={{ color: '#8899a6', fontSize: '0.85rem', marginLeft: '8px' }}>
                      {checkedItems.bolsa ? '(activando...)' : '(marque el anterior)'}
                    </span>
                  )}
                </span>
              </label>

              {/* Item 3: Espacio */}
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: checkedItems.espacio ? 'rgba(0, 186, 124, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: checkedItems.espacio ? '1px solid rgba(0, 186, 124, 0.3)' : enabledItems.espacio ? '1px solid rgba(10, 132, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  cursor: enabledItems.espacio ? 'pointer' : 'not-allowed',
                  opacity: enabledItems.espacio ? 1 : 0.4,
                  transition: 'all 0.3s ease',
                  animation: enabledItems.espacio && !checkedItems.espacio && enabledItems.tirro ? 'pulse 1s ease-in-out' : 'none'
                }}
              >
                <Checkbox
                  checked={checkedItems.espacio}
                  onCheckedChange={() => enabledItems.espacio && handleCheckChange('espacio')}
                  disabled={!enabledItems.espacio}
                  style={{
                    borderColor: checkedItems.espacio ? '#00ba7c' : 'rgba(255, 255, 255, 0.3)',
                    cursor: enabledItems.espacio ? 'pointer' : 'not-allowed'
                  }}
                />
                <Grid3x3 className="w-5 h-5" style={{ color: '#0a84ff' }} />
                <span style={{ flex: 1 }}>
                  Tengo <strong>espacio limpio</strong> para separar denominaciones
                  {!enabledItems.espacio && (
                    <span style={{ color: '#8899a6', fontSize: '0.85rem', marginLeft: '8px' }}>
                      {checkedItems.tirro ? '(activando...)' : '(marque el anterior)'}
                    </span>
                  )}
                </span>
              </label>

              {/* Item 4: Entendido */}
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: checkedItems.entendido ? 'rgba(0, 186, 124, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: checkedItems.entendido ? '1px solid rgba(0, 186, 124, 0.3)' : enabledItems.entendido ? '1px solid rgba(10, 132, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  cursor: enabledItems.entendido ? 'pointer' : 'not-allowed',
                  opacity: enabledItems.entendido ? 1 : 0.4,
                  transition: 'all 0.3s ease',
                  animation: enabledItems.entendido && !checkedItems.entendido && enabledItems.espacio ? 'pulse 1s ease-in-out' : 'none'
                }}
              >
                <Checkbox
                  checked={checkedItems.entendido}
                  onCheckedChange={() => enabledItems.entendido && handleCheckChange('entendido')}
                  disabled={!enabledItems.entendido}
                  style={{
                    borderColor: checkedItems.entendido ? '#00ba7c' : 'rgba(255, 255, 255, 0.3)',
                    cursor: enabledItems.entendido ? 'pointer' : 'not-allowed'
                  }}
                />
                <AlertCircle className="w-5 h-5" style={{ color: '#0a84ff' }} />
                <span style={{ flex: 1 }}>
                  <strong>Entiendo</strong> que este dinero es para entregar a gerencia
                  {!enabledItems.entendido && (
                    <span style={{ color: '#8899a6', fontSize: '0.85rem', marginLeft: '8px' }}>
                      {checkedItems.espacio ? '(activando...)' : '(marque el anterior)'}
                    </span>
                  )}
                </span>
              </label>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={() => setShowInstructionsModal(false)}
            disabled={!allItemsChecked}
            style={{
              background: allItemsChecked 
                ? 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)' 
                : 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              border: allItemsChecked 
                ? 'none' 
                : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: allItemsChecked ? 'pointer' : 'not-allowed',
              opacity: allItemsChecked ? 1 : 0.5,
              transition: 'all 0.3s ease',
              padding: '12px 24px',
              boxShadow: allItemsChecked ? '0 4px 12px rgba(10, 132, 255, 0.3)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (allItemsChecked) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(10, 132, 255, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (allItemsChecked) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(10, 132, 255, 0.3)';
              }
            }}
          >
            {allItemsChecked ? '✓ Todo listo, continuar' : 'Marque todos los items para continuar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </div>
  );
}