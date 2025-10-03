// 🤖 [IA] - v1.0.92 - Wizard con Frosted Glass Premium balanceado
// 🤖 [IA] - v1.2.12 - Corrección de accesibilidad con DialogTitle y DialogDescription
// 🤖 [IA] - v1.2.38 - Integración Protocolo de Seguridad (Paso 0) + 4 pasos totales
// 🤖 [IA] - v1.2.41f - Modal de confirmación de cierre implementado
// 🤖 [IA] - v1.2.41g - Migración a Doctrina Glass Morphism v1.1 (glass-morphism-panel)
// 🤖 [IA] - v1.2.41h - Glass Morphism Enhanced: 72% móvil/62% desktop + blur responsivo
// 🤖 [IA] - v1.2.41i - Fix móvil definitivo: !important + bg-background removido
// 🤖 [IA] - v1.2.41T: Removido override amarillo-ámbar - usa verde default ConstructiveActionButton
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, CheckCircle, Sunrise, ArrowLeft, ArrowRight } from 'lucide-react';
// 🤖 [IA] - v1.2.41S: Flechas direccionales para navegación profesional
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { NeutralActionButton } from '@/components/ui/neutral-action-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmationModal } from "@/components/ui/confirmation-modal"; // 🤖 [IA] - v1.2.41f: Modal de confirmación
import { STORES, getEmployeesByStore } from '@/data/paradise';
import { useTimingConfig } from '@/hooks/useTimingConfig';
import { WizardGlassCard } from '@/components/wizards/WizardGlassCard';
import { useMorningRulesFlow } from '@/hooks/useMorningRulesFlow'; // 🤖 [IA] - v1.2.38: Hook para protocolo matutino
import { morningProtocolRules } from '@/config/flows/initialWizardFlow'; // 🤖 [IA] - v1.2.38: Configuración reglas matutino
import { ProtocolRule } from '@/components/wizards/ProtocolRule'; // 🤖 [IA] - v1.2.38: Componente UI de reglas
import { toast } from 'sonner'; // 🤖 [IA] - v1.2.38: Notificaciones
import { TOAST_DURATIONS, TOAST_MESSAGES } from '@/config/toast'; // 🤖 [IA] - v1.2.38: Mensajes toast
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 1 archivos CSS están ahora importados globalmente vía index.css:
// - morning-gradient-button.css

interface MorningCountWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    selectedStore: string;
    selectedCashier: string; // Cajero entrante (quien cuenta)
    selectedWitness: string; // Testigo (quien valida el conteo)
    expectedSales: string;
  }) => void;
}

export function MorningCountWizard({ isOpen, onClose, onComplete }: MorningCountWizardProps) {
  const [currentStep, setCurrentStep] = useState(0); // 🤖 [IA] - v1.2.38: Paso inicial 0 (Protocolo)
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedCashierIn, setSelectedCashierIn] = useState(''); // Cajero entrante
  const [selectedCashierOut, setSelectedCashierOut] = useState(''); // Testigo
  const [showValidation, setShowValidation] = useState(false);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false); // 🤖 [IA] - v1.2.41f: Estado para modal de confirmación

  const { createTimeoutWithCleanup } = useTimingConfig();

  // 🤖 [IA] - v1.2.38: Hook para flujo guiado del Protocolo Matutino
  const {
    state: rulesFlowState,
    initializeFlow,
    acknowledgeRule,
    isFlowCompleted,
    getRuleState,
    resetFlow
  } = useMorningRulesFlow();

  // Obtener empleados disponibles según la sucursal
  const availableEmployees = selectedStore ? getEmployeesByStore(selectedStore) : [];

  // 🤖 [IA] - v1.2.38: Inicializar flujo de reglas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      initializeFlow();
    }
  }, [isOpen, initializeFlow]);

  // Validar que los cajeros sean diferentes
  useEffect(() => {
    if (selectedCashierIn && selectedCashierOut) {
      setShowValidation(selectedCashierIn !== selectedCashierOut);
    }
  }, [selectedCashierIn, selectedCashierOut]);

  // 🤖 [IA] - v1.2.38: Validación actualizada para 4 pasos (0-3)
  const canGoNext = () => {
    switch (currentStep) {
      case 0: // Protocolo de Seguridad
        return isFlowCompleted();
      case 1: // Sucursal
        return selectedStore !== '';
      case 2: // Cajero
        return selectedCashierIn !== '';
      case 3: // Testigo
        return selectedCashierOut !== '' && selectedCashierIn !== selectedCashierOut;
      default:
        return false;
    }
  };

  // 🤖 [IA] - v1.2.38: Navegación actualizada para 4 pasos + validación de protocolo
  const handleNext = () => {
    // Validar paso 0 (Protocolo) antes de continuar
    if (currentStep === 0 && !isFlowCompleted()) {
      toast.error(TOAST_MESSAGES.ERROR_REVIEW_RULES, {
        duration: TOAST_DURATIONS.EXTENDED
      });
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) { // 🤖 [IA] - v1.2.38: Permitir retroceder hasta paso 0
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    if (canGoNext()) {
      onComplete({
        selectedStore,
        selectedCashier: selectedCashierIn, // El cajero entrante es quien cuenta
        selectedWitness: selectedCashierOut, // El cajero saliente es quien verifica
        expectedSales: '50' // Siempre $50 para conteo matutino
      });
    }
  };

  // 🤖 [IA] - v1.2.38: Manejar reconocimiento de reglas del protocolo (memoizado)
  const handleRuleAcknowledge = useCallback((ruleId: string, index: number) => {
    acknowledgeRule(ruleId, index);
  }, [acknowledgeRule]);

  // 🤖 [IA] - v1.2.41f: Handlers para confirmación de cierre
  const handleCancelClick = () => {
    setShowCancelConfirmation(true);
  };

  const handleConfirmedClose = () => {
    setShowCancelConfirmation(false);
    onClose();
  };

  const handleCancelClose = () => {
    setShowCancelConfirmation(false);
  };

  // 🤖 [IA] - v1.2.11 - Detección de viewport y escala proporcional
  const viewportScale = typeof window !== 'undefined' ? Math.min(window.innerWidth / 430, 1) : 1;
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // 🤖 [IA] - v1.2.38: Paso 0 - Protocolo de Seguridad Matutino
        return (
          <WizardGlassCard className="space-y-fluid-lg">
            {/* 🤖 [IA] - v1.2.38: Flujo guiado de reglas matutinas */}
            <div className="flex flex-col gap-fluid-lg">
              {morningProtocolRules.map((rule, index) => (
                <ProtocolRule
                  key={rule.id}
                  rule={rule}
                  state={getRuleState(rule.id)}
                  isCurrent={index === rulesFlowState.currentRuleIndex}
                  onAcknowledge={() => handleRuleAcknowledge(rule.id, index)}
                />
              ))}
            </div>
          </WizardGlassCard>
        );

      case 1: // 🤖 [IA] - v1.2.38: Paso 1 - Selección de Sucursal (anteriormente caso 1)
        return (
          <WizardGlassCard className="space-y-fluid-lg">
            {/* Header del paso */}
            <WizardGlassCard
              className="flex items-center wizard-inline-gap"
              style={{ padding: `clamp(14px, ${16 * viewportScale}px, 16px)` }}
            >
              <MapPin className="wizard-step-icon flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="wizard-step-heading">
                  Seleccione la Sucursal
                </h3>
                <p className="wizard-step-subtitle">
                  Donde se realizará el conteo
                </p>
              </div>
            </WizardGlassCard>

            {/* Selector de sucursal */}
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger 
                className="wizard-select-trigger w-full focus:ring-orange-500/50 focus:ring-offset-0"
              >
                <SelectValue placeholder="Seleccione una sucursal" />
              </SelectTrigger>
              <SelectContent className="wizard-select-content">
                {STORES.map((store) => (
                  <SelectItem 
                    key={store.id} 
                    value={store.id}
                    className="focus:bg-orange-500/20 focus:text-orange-100 data-[state=checked]:bg-orange-500/20 data-[state=checked]:text-orange-100"
                  >
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Confirmación de selección */}
            {selectedStore && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <WizardGlassCard
                  className="flex items-center wizard-inline-gap"
                  style={{
                    borderColor: 'rgba(0, 186, 124, 0.4)',
                    padding: `clamp(10px, ${12 * viewportScale}px, 12px)`
                  }}
                >
                  <CheckCircle style={{ 
                    width: `clamp(16px, 4vw, 20px)`,
                    height: `clamp(16px, 4vw, 20px)`,
                    color: '#00ba7c' 
                  }} />
                  <span className="wizard-step-subtitle" style={{ marginTop: 0 }}>
                    Sucursal seleccionada correctamente
                  </span>
                </WizardGlassCard>
              </motion.div>
            )}
          </WizardGlassCard>
        );

      case 2: // 🤖 [IA] - v1.2.38: Paso 2 - Selección de Cajero (anteriormente caso 2)
        return (
          <WizardGlassCard className="space-y-fluid-lg">
            {/* Header del paso */}
            <WizardGlassCard
              className="flex items-center wizard-inline-gap"
              style={{ padding: `clamp(14px, ${16 * viewportScale}px, 16px)` }}
            >
              <Users className="wizard-step-icon flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="wizard-step-heading">
                  Cajero del Día
                </h3>
                <p className="wizard-step-subtitle">
                  Seleccione cajero del día
                </p>
              </div>
            </WizardGlassCard>

            {/* Selector de cajero entrante */}
            <Select value={selectedCashierIn} onValueChange={setSelectedCashierIn}>
              <SelectTrigger 
                className="wizard-select-trigger w-full focus:ring-orange-500/50 focus:ring-offset-0"
              >
                <SelectValue placeholder="Seleccione cajero" />
              </SelectTrigger>
              <SelectContent className="wizard-select-content">
                {availableEmployees.map((employee) => (
                  <SelectItem 
                    key={employee.id} 
                    value={employee.id}
                    className="focus:bg-orange-500/20 focus:text-orange-100 data-[state=checked]:bg-orange-500/20 data-[state=checked]:text-orange-100"
                  >
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Confirmación de selección */}
            {selectedCashierIn && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <WizardGlassCard
                  className="flex items-center wizard-inline-gap"
                  style={{
                    borderColor: 'rgba(0, 186, 124, 0.4)',
                    padding: `clamp(10px, ${12 * viewportScale}px, 12px)`
                  }}
                >
                  <CheckCircle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] text-[#00ba7c]" />
                  <span className="wizard-step-subtitle" style={{ marginTop: 0 }}>
                    Cajero seleccionado
                  </span>
                </WizardGlassCard>
              </motion.div>
            )}
          </WizardGlassCard>
        );

      case 3: // 🤖 [IA] - v1.2.38: Paso 3 - Selección de Testigo (anteriormente caso 3)
        return (
          <WizardGlassCard className="space-y-fluid-lg">
            {/* Header del paso */}
            <WizardGlassCard
              className="flex items-center wizard-inline-gap"
              style={{ padding: `clamp(14px, ${16 * viewportScale}px, 16px)` }}
            >
              <Users className="wizard-step-icon flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #ffb84d 0%, #f4a52a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="wizard-step-heading">
                  Seleccione Testigo
                </h3>
                <p className="wizard-step-subtitle">
                  ¿Quién validará el conteo?
                </p>
              </div>
            </WizardGlassCard>

            {/* Selector de testigo */}
            <Select value={selectedCashierOut} onValueChange={setSelectedCashierOut}>
              <SelectTrigger 
                className="wizard-select-trigger w-full focus:ring-orange-500/50 focus:ring-offset-0"
              >
                <SelectValue placeholder="Seleccione testigo" />
              </SelectTrigger>
              <SelectContent className="wizard-select-content">
                {availableEmployees
                  .filter(emp => emp.id !== selectedCashierIn)
                  .map((employee) => (
                    <SelectItem 
                      key={employee.id} 
                      value={employee.id}
                      className="focus:bg-orange-500/20 focus:text-orange-100 data-[state=checked]:bg-orange-500/20 data-[state=checked]:text-orange-100"
                    >
                      {employee.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Mensaje de validación */}
            {selectedCashierOut && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <WizardGlassCard
                  className="flex items-center wizard-inline-gap"
                  style={{
                    borderColor: showValidation ? 'rgba(0, 186, 124, 0.4)' : 'rgba(244, 33, 46, 0.4)',
                    padding: `clamp(10px, ${12 * viewportScale}px, 12px)`
                  }}
                >
                  {showValidation ? (
                    <CheckCircle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] text-[#00ba7c]" />
                  ) : (
                    <X className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] text-[#f4212e]" />
                  )}
                  <span
                    className="wizard-step-subtitle"
                    style={{
                      marginTop: 0,
                      color: showValidation ? '#e1e8ed' : '#f4212e'
                    }}
                  >
                    {showValidation ? 'Testigo confirmado' : 'El testigo debe ser diferente al cajero'}
                  </span>
                </WizardGlassCard>
              </motion.div>
            )}
          </WizardGlassCard>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Solo permitir cierre si el usuario hace clic en el botón de cerrar
      // Ignorar los clics fuera del modal (en el overlay)
      if (!open) {
        // No hacer nada - el cierre debe ser explícito mediante botones
        return;
      }
    }}>
      <DialogContent
        className="glass-morphism-panel wizard-dialog-content overflow-y-auto overflow-x-hidden p-0 [&>button]:hidden"
        style={{
          maxHeight: isMobileDevice ? '90vh' : '85vh'
        }}
      >
        {/* 🤖 [IA] - v1.2.12 - DialogTitle y DialogDescription para accesibilidad */}
        {/* 🤖 [IA] - v1.2.38 - Actualizado a 4 pasos (0-3) */}
        <DialogTitle className="sr-only">
          Conteo de Caja Matutino - Paso {currentStep + 1} de 4
        </DialogTitle>
        <DialogDescription className="sr-only">
          Complete los pasos para realizar el conteo matutino del cambio de caja. Paso 1: Protocolo de Seguridad, Pasos 2-4: Información del conteo. Este proceso verificará el fondo inicial de $50 para el inicio del turno.
        </DialogDescription>
        
        <div style={{ padding: `clamp(16px, ${24 * viewportScale}px, 24px)` }}>
          {/* Header del modal simplificado - 🤖 [IA] - v1.2.13 */}
          {/* 🤖 [IA] - v1.2.41Y: Subtítulo agregado para elegancia profesional */}
          <div className="flex items-center justify-between" style={{ marginBottom: `clamp(16px, ${20 * viewportScale}px, 20px)` }}>
            <div className="flex items-center wizard-inline-gap">
              <Sunrise className="wizard-step-icon" style={{ color: '#f4a52a' }} />
              <div className="flex flex-col">
                <h2 className="font-bold text-[clamp(1.25rem,5vw,1.5rem)] text-[#e1e8ed] leading-tight">
                  Conteo de Caja
                </h2>
                <p className="text-[clamp(0.625rem,2.5vw,0.75rem)] text-[#8899a6] mt-[clamp(0.125rem,0.5vw,0.25rem)]">
                  Verificación de fondo inicial
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCancelClick}
              className="rounded-full"
            >
              <X className="icon-responsive-sm" />
            </Button>
          </div>

          {/* Indicador de paso - 🤖 [IA] - v1.2.13 + v1.2.38 (4 pasos totales) */}
          <div style={{ marginBottom: `clamp(20px, ${24 * viewportScale}px, 24px)` }}>
            {/* Texto del paso */}
            <div className="flex justify-between items-center">
              <span className="wizard-progress-label" data-testid="step-indicator">
                Paso {currentStep + 1} de 4
              </span>
            </div>
          </div>

          {/* Contenido del paso actual */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          {/* Botones de navegación - 🤖 [IA] - v1.2.38: Actualizado para 4 pasos */}
          {/* 🤖 [IA] - v1.2.41S: Footer con navegación profesional + flechas direccionales (← Anterior | Continuar →) */}
          <div className="flex items-center justify-center mt-fluid-2xl pt-fluid-xl border-t border-slate-600 gap-fluid-lg wizard-dialog-footer">
            <NeutralActionButton
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </NeutralActionButton>

            {currentStep < 3 ? (
              <ConstructiveActionButton
                onClick={handleNext}
                disabled={!canGoNext()}
              >
                Continuar
                <ArrowRight className="h-4 w-4 ml-2" />
              </ConstructiveActionButton>
            ) : (
              <ConstructiveActionButton
                onClick={handleComplete}
                disabled={!canGoNext()}
              >
                Completar
              </ConstructiveActionButton>
            )}
          </div>
        </div>
      </DialogContent>

      {/* 🤖 [IA] - v1.2.41f: Modal de confirmación de cierre */}
      <ConfirmationModal
        open={showCancelConfirmation}
        onOpenChange={setShowCancelConfirmation}
        title="Cancelar Conteo Matutino"
        description="Se perderá todo el progreso del protocolo de seguridad y la información ingresada"
        warningText="Esta acción no se puede deshacer"
        confirmText="Sí, Cancelar"
        cancelText="Continuar Conteo"
        onConfirm={handleConfirmedClose}
        onCancel={handleCancelClose}
      />
    </Dialog>
  );
}
