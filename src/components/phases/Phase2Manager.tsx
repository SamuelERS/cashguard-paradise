// 🤖 [IA] - v1.1.14 - Simplificación de tabs y eliminación de redundancias en Fase 2
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Package, ScrollText, Grid3x3, AlertCircle, DollarSign } from 'lucide-react';
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
// 🤖 [IA] - v1.2.19: Importado ConfirmationModal estandarizado para modal de confirmación
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
// 🤖 [IA] - v1.3.0: Reemplazado botones nativos con componentes Button para estandarización
import { Button } from "@/components/ui/button";
// 🤖 [IA] - v1.2.19: Agregado PrimaryActionButton para botón principal "Todo listo, continuar"
import { PrimaryActionButton } from "@/components/ui/primary-action-button";
// 🤖 [IA] - v1.2.19: Agregados botones de acción para modal de confirmación ROJO/VERDE
import { DestructiveActionButton } from "@/components/ui/destructive-action-button";
import { ConstructiveActionButton } from "@/components/ui/constructive-action-button";
// 🤖 [IA] - v2.0.0: Agregado NeutralActionButton para botón "Volver al inicio"
import { NeutralActionButton } from "@/components/ui/neutral-action-button";
// 🤖 [IA] - v1.3.0: Importado CSS modular para botones de Phase2
import "@/styles/features/phase2-buttons.css";
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

  // Skip phase 2 entirely if no amount to deliver
  useEffect(() => {
    if (deliveryCalculation.amountToDeliver <= 0) {
      onPhase2Complete();
    }
  }, [deliveryCalculation.amountToDeliver, onPhase2Complete]);

  if (deliveryCalculation.amountToDeliver <= 0) {
    return null;
  }

  return (
    <>
      {/* 🤖 [IA] - v1.2.29: Container principal opaco para fidelidad visual 100% con Phase 1 */}
      <div className="space-y-fluid-xs max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl">
        <div className="cash-counter-container space-y-fluid-md">
          {/* Header integrado con sistema de diseño coherente */}
          <div className="cash-counter-header">
            <div className="cash-counter-title">
              <DollarSign className="cash-counter-icon" style={{
                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <h2>Fase 2: División de Efectivo</h2>
            </div>
            <p className="text-muted-foreground text-center">
              Separa lo que va a gerencia
            </p>
          </div>

          {/* Área de contenido con sistema coherente */}
          <div className="cash-counter-content">
            {/* Section Navigation - 🤖 [IA] - v1.2.29: Movido dentro del content area */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-morphism-panel p-4 mb-fluid-md"
            >
              {/* Botones de navegación */}
              <div className="flex items-center gap-2 justify-center">
                <Button
                  variant="phase2-tab"
                  data-active={currentSection === 'delivery' ? "true" : "false"}
                  data-state="delivery"
                  data-completed={deliveryCompleted ? "true" : "false"}
                  onClick={() => currentSection !== 'delivery' && !verificationCompleted && setCurrentSection('delivery')}
                  aria-pressed={currentSection === 'delivery'}
                  aria-label="Sección de entrega"
                >
                  {deliveryCompleted && (
                    <span>✓</span>
                  )}
                  Entrega
                </Button>
                <Button
                  variant="phase2-tab"
                  data-active={currentSection === 'verification' ? "true" : "false"}
                  data-state="verification"
                  data-completed={verificationCompleted ? "true" : "false"}
                  data-disabled={!deliveryCompleted ? "true" : "false"}
                  onClick={() => deliveryCompleted && currentSection !== 'verification' && setCurrentSection('verification')}
                  disabled={!deliveryCompleted}
                  aria-pressed={currentSection === 'verification'}
                  aria-label="Sección de verificación"
                >
                  {verificationCompleted && (
                    <span>✓</span>
                  )}
                  Verificar
                </Button>
              </div>
            </motion.div>

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
                    onCancel={() => setShowExitConfirmation(true)}
                    onPrevious={() => {}}
                    canGoPrevious={false}
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
                    onCancel={() => setShowExitConfirmation(true)}
                    onPrevious={() => {}}
                    canGoPrevious={false}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manual section switch - only show when delivery is complete */}
            {deliveryCompleted && currentSection === 'delivery' && !verificationCompleted && (
              <div className="flex justify-center">
                <Button
                  variant="phase2-verify"
                  onClick={() => setCurrentSection('verification')}
                  aria-label="Verificar efectivo y continuar"
                  className="px-6"
                >
                  <span>Verificar</span>
                  <span className="hidden sm:inline ml-1">Efectivo</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🤖 [IA] - v1.2.19: Modal de confirmación migrado a ConfirmationModal estandarizado */}
      <ConfirmationModal
        open={showExitConfirmation}
        onOpenChange={setShowExitConfirmation}
        title="¿Confirmar salida?"
        description="Se perderá todo el progreso del conteo actual."
        warningText="Esta acción no se puede deshacer."
        confirmText="Sí, volver al inicio"
        cancelText="Continuar aquí"
        onConfirm={onBack}
        onCancel={() => setShowExitConfirmation(false)}
      />

    {/* 🤖 [IA] - v1.2.10: Modal de instrucciones con checklist para preparación - Colores de corte nocturno */}
    <AlertDialog open={showInstructionsModal} onOpenChange={setShowInstructionsModal}>
      <AlertDialogContent style={{
        /* Removido según Doctrina D.2 - Componente debe ser opaco (Nivel 0 Base):
        backgroundColor: 'rgba(36, 36, 36, 0.95)',
        backdropFilter: `blur(clamp(12px, 4vw, 20px))`,
        WebkitBackdropFilter: `blur(clamp(12px, 4vw, 20px))`,
        */
        /* Usando color de fondo sólido según design system */
        backgroundColor: 'hsl(var(--background))',
        border: '1px solid rgba(244, 33, 46, 0.3)',
        borderRadius: `clamp(8px, 3vw, 16px)`,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.8), 0 0 20px rgba(244, 33, 46, 0.2)',
        maxWidth: `clamp(300px, 90vw, 500px)`,
        maxHeight: `clamp(400px, 85vh, 90vh)`,
        position: 'fixed',
        left: '50%',
        top: '50%',
        transform: 'translateX(-50%) translateY(-50%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <AlertDialogHeader style={{ flexShrink: 0 }}>
          <AlertDialogTitle style={{ 
            color: '#1d9bf0', 
            fontSize: `clamp(1rem, 4.5vw, 1.25rem)`, 
            display: 'flex', 
            alignItems: 'center', 
            gap: `clamp(0.375rem, 1.5vw, 0.5rem)` 
          }}>
            <AlertCircle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" />
            💵 Preparar Dinero a Entregar
          </AlertDialogTitle>
        </AlertDialogHeader>
        
        <div style={{ 
          padding: `clamp(0.75rem, 3vw, 1rem) 0`,
          overflow: 'auto',
          flex: 1,
          minHeight: 0
        }}>
          {/* Mensaje principal destacado */}
          <div style={{
            backgroundColor: 'rgba(10, 132, 255, 0.1)',
            border: '2px solid rgba(10, 132, 255, 0.4)',
            borderRadius: `clamp(6px, 2.5vw, 12px)`,
            padding: `clamp(0.75rem, 3vw, 1rem)`,
            marginBottom: `clamp(1rem, 4vw, 1.25rem)`,
            textAlign: 'center'
          }}>
            <p style={{ 
              color: '#F4212E', 
              fontSize: `clamp(0.875rem, 3.5vw, 1.1rem)`, 
              fontWeight: '700',
              marginBottom: `clamp(0.375rem, 1.5vw, 0.5rem)`
            }}>
              ⚠️ IMPORTANTE
            </p>
            <p style={{ 
              color: '#ffffff', 
              fontSize: `clamp(0.875rem, 3.5vw, 1rem)`, 
              fontWeight: '600' 
            }}>
              El sistema dirá cuántas monedas y billetes tomar para entregar, solo debes colocar lo que diga en la bolsa.
            </p>
            <p style={{ 
              color: '#e1e8ed', 
              fontSize: `clamp(0.75rem, 3vw, 0.9rem)`, 
              marginTop: `clamp(0.375rem, 1.5vw, 0.5rem)` 
            }}>
              
            </p>
          </div>

          {/* Checklist de preparación */}
          <div style={{ color: '#e1e8ed' }}>
            <p style={{ 
              marginBottom: `clamp(0.5rem, 2vw, 0.75rem)`, 
              fontSize: `clamp(0.8rem, 3.2vw, 0.95rem)` 
            }}>
              Antes de continuar, confirme lo siguiente:
            </p>
            
            {/* 🤖 [IA] - v1.1.24: Mensaje de activación secuencial */}
            <div style={{
              backgroundColor: !enabledItems.bolsa ? 'rgba(10, 132, 255, 0.1)' : 'rgba(0, 186, 124, 0.1)',
              border: !enabledItems.bolsa ? '1px solid rgba(10, 132, 255, 0.3)' : '1px solid rgba(0, 186, 124, 0.3)',
              borderRadius: `clamp(4px, 2vw, 8px)`,
              padding: `clamp(0.5rem, 2vw, 0.75rem)`,
              marginBottom: `clamp(0.75rem, 3vw, 1rem)`,
              textAlign: 'center'
            }}>
              <p style={{ 
                color: !enabledItems.bolsa ? '#1d9bf0' : '#00ba7c',
                fontSize: `clamp(0.8rem, 3.2vw, 0.95rem)`,
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: `clamp(0.375rem, 1.5vw, 0.5rem)`
              }}>
                {!enabledItems.bolsa ? '⏱️ Preparando checklist...' : '📋 Verifiquen estemos Listos'}
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: `clamp(0.5rem, 2vw, 0.75rem)` 
            }}>
              {/* Item 1: Bolsa */}
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: `clamp(0.5rem, 2vw, 0.75rem)`,
                  padding: `clamp(0.5rem, 2vw, 0.75rem)`,
                  backgroundColor: checkedItems.bolsa ? 'rgba(0, 186, 124, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: checkedItems.bolsa ? '1px solid rgba(0, 186, 124, 0.3)' : enabledItems.bolsa ? '1px solid rgba(10, 132, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: `clamp(4px, 2vw, 8px)`,
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
                <Package className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" style={{ color: '#0a84ff' }} />
                <span style={{ 
                  flex: 1,
                  fontSize: `clamp(0.8rem, 3.2vw, 0.9rem)`
                }}>
                  Tengo la bolsa lista para entregar
                  {!enabledItems.bolsa && <span style={{ color: '#8899a6', fontSize: `clamp(0.7rem, 2.8vw, 0.85rem)`, marginLeft: `clamp(0.375rem, 1.5vw, 0.5rem)` }}>(activando...)</span>}
                </span>
              </label>

              {/* Item 2: Tirro */}
              <label 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: `clamp(0.5rem, 2vw, 0.75rem)`,
                  padding: `clamp(0.5rem, 2vw, 0.75rem)`,
                  backgroundColor: checkedItems.tirro ? 'rgba(0, 186, 124, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: checkedItems.tirro ? '1px solid rgba(0, 186, 124, 0.3)' : enabledItems.tirro ? '1px solid rgba(10, 132, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: `clamp(4px, 2vw, 8px)`,
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
                <ScrollText className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" style={{ color: '#0a84ff' }} />
                <span style={{ 
                  flex: 1,
                  fontSize: `clamp(0.8rem, 3.2vw, 0.9rem)`
                }}>
                  Tengo cinta y plumon para rotular
                  {!enabledItems.tirro && (
                    <span style={{ color: '#8899a6', fontSize: `clamp(0.7rem, 2.8vw, 0.85rem)`, marginLeft: `clamp(0.375rem, 1.5vw, 0.5rem)` }}>
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
                  gap: `clamp(0.5rem, 2vw, 0.75rem)`,
                  padding: `clamp(0.5rem, 2vw, 0.75rem)`,
                  backgroundColor: checkedItems.espacio ? 'rgba(0, 186, 124, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: checkedItems.espacio ? '1px solid rgba(0, 186, 124, 0.3)' : enabledItems.espacio ? '1px solid rgba(10, 132, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: `clamp(4px, 2vw, 8px)`,
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
                <Grid3x3 className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" style={{ color: '#0a84ff' }} />
                <span style={{ 
                  flex: 1,
                  fontSize: `clamp(0.8rem, 3.2vw, 0.9rem)`
                }}>
                  Tomare cantidad que sistema diga
                  {!enabledItems.espacio && (
                    <span style={{ color: '#8899a6', fontSize: `clamp(0.7rem, 2.8vw, 0.85rem)`, marginLeft: `clamp(0.375rem, 1.5vw, 0.5rem)` }}>
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
                  gap: `clamp(0.5rem, 2vw, 0.75rem)`,
                  padding: `clamp(0.5rem, 2vw, 0.75rem)`,
                  backgroundColor: checkedItems.entendido ? 'rgba(0, 186, 124, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  border: checkedItems.entendido ? '1px solid rgba(0, 186, 124, 0.3)' : enabledItems.entendido ? '1px solid rgba(10, 132, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: `clamp(4px, 2vw, 8px)`,
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
                <AlertCircle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" style={{ color: '#0a84ff' }} />
                <span style={{ 
                  flex: 1,
                  fontSize: `clamp(0.8rem, 3.2vw, 0.9rem)`
                }}>
                  Estamos listos para continuar
                  {!enabledItems.entendido && (
                    <span style={{ color: '#8899a6', fontSize: `clamp(0.7rem, 2.8vw, 0.85rem)`, marginLeft: `clamp(0.375rem, 1.5vw, 0.5rem)` }}>
                      {checkedItems.espacio ? '(activando...)' : '(marque el anterior)'}
                    </span>
                  )}
                </span>
              </label>
            </div>
          </div>
        </div>

        <AlertDialogFooter style={{ 
          flexShrink: 0, 
          paddingTop: `clamp(0.5rem, 2vw, 0.75rem)`,
          display: 'flex',
          justifyContent: 'center', 
          width: '100%' 
        }}>
          <AlertDialogAction asChild>
            <PrimaryActionButton 
              onClick={() => setShowInstructionsModal(false)} 
              disabled={!allItemsChecked}
              className="btn-phase2-instruction"
            >
              {allItemsChecked ? '✓ Continuar' : '☑️ Marque todos los ítems para continuar'}
            </PrimaryActionButton>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}