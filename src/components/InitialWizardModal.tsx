// 🤖 [IA] - InitialWizardModal v1.3.0 - Arquitectura Guiada Basada en Datos + Performance Optimized
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, AlertTriangle, CheckCircle,
  MapPin, Users, DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWizardNavigation } from "@/hooks/useWizardNavigation";
import { useRulesFlow } from "@/hooks/useRulesFlow"; // 🤖 [IA] - Hook para flujo guiado v1.0
import { currentProtocolRules } from "@/config/flows/initialWizardFlow"; // 🤖 [IA] - Configuración de datos v1.0 + randomización v3.0
import { ProtocolRule } from "@/components/wizards/ProtocolRule"; // 🤖 [IA] - Componente reutilizable v1.0
import { STORES, getEmployeesByStore } from "@/data/paradise";
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 4 archivos CSS están ahora importados globalmente vía index.css:
// - modal-dark-scrollbar.css
// - wizard-nav-previous-button.css
// - wizard-nav-next-button.css
// - wizard-select-elements.css
import { toast } from "sonner";
import { useTimingConfig } from "@/hooks/useTimingConfig"; // 🤖 [IA] - Hook de timing unificado v1.0.22
import { useInputValidation } from "@/hooks/useInputValidation"; // 🤖 [IA] - v1.0.45: Hook para validación de decimales
import { ConfirmationModal } from "@/components/ui/confirmation-modal"; // 🤖 [IA] - v2.0.0: Modal de confirmación abstracto
import { DestructiveActionButton } from "@/components/shared/DestructiveActionButton"; // 🤖 [IA] - v1.2.26: Botón destructivo estándar
import { NeutralActionButton } from "@/components/ui/neutral-action-button"; // 🤖 [IA] - v1.2.27: Botón neutral estándar
import { ConstructiveActionButton } from "@/components/shared/ConstructiveActionButton"; // 🤖 [IA] - v1.2.29: Botón constructivo estándar
import { cn } from "@/lib/utils"; // 🤖 [IA] - v1.2.23: Utilidad para manejo seguro de clases

interface InitialWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    selectedStore: string;
    selectedCashier: string;
    selectedWitness: string;
    expectedSales: string;
  }) => void;
}

const InitialWizardModal = ({ isOpen, onClose, onComplete }: InitialWizardModalProps) => {
  const {
    currentStep,
    totalSteps,
    wizardData,
    canGoNext,
    canGoPrevious,
    isCompleted,
    goNext,
    goPrevious,
    updateWizardData,
    resetWizard,
    getStepTitle,
    getNavigationState
  } = useWizardNavigation();

  // 🤖 [IA] - v1.3.0: Hook para flujo guiado de reglas del protocolo
  const {
    state: rulesFlowState,
    initializeFlow,
    acknowledgeRule,
    isFlowCompleted,
    getRuleState,
    canInteractWithRule,
    resetFlow
  } = useRulesFlow();

  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Usar timing unificado v1.0.22
  const { validateInput, getPattern, getInputMode } = useInputValidation(); // 🤖 [IA] - v1.0.45: Validación de decimales

  // Control de animación del AlertTriangle (solo 3 segundos)
  // 🤖 [IA] - v1.0.38 - Simplificado: ya no hay validación de firma
  const [hasVibratedForError, setHasVibratedForError] = useState(false);
  // 🤖 [IA] - v1.2.13 - Estado para controlar el modal de confirmación al retroceder
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  // 🤖 [IA] - v3.0.0 - Estado para controlar el modal de confirmación al cancelar
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  
  // 🤖 [IA] - v1.3.0: Inicializar flujo de reglas cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      initializeFlow();
    }
  }, [isOpen, initializeFlow]);
  
  // 🤖 [IA] - v1.0.29 - Fix memory leak con cleanup mejorado
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (currentStep === 1) {
      // 🤖 [IA] - Migrado a timing unificado para animaciones consistentes v1.0.22
      cleanup = createTimeoutWithCleanup(() => {}, 'toast', 'wizard_pulse_animation');
    }
    
    return () => {
      cleanup?.();
    };
  }, [currentStep, createTimeoutWithCleanup]);

  // 🤖 [IA] - v1.3.0: Feedback háptico optimizado - usa estado del flujo guiado
  useEffect(() => {
    const rulesCompleted = isFlowCompleted();
    const shouldVibrate = !rulesCompleted && currentStep === 1 && !hasVibratedForError && 'vibrate' in navigator;
    
    if (shouldVibrate) {
      // Vibración suave solo cuando el estado cambia a error
      navigator.vibrate(50);
      setHasVibratedForError(true);
    } else if (rulesCompleted && hasVibratedForError) {
      // Reset cuando el error se corrige
      setHasVibratedForError(false);
    }
  }, [isFlowCompleted, currentStep, hasVibratedForError]);

  // 🤖 [IA] - v1.2.25: Sincronización eliminada - usar solo isFlowCompleted() como fuente única de verdad

  // Empleados disponibles basados en la sucursal seleccionada
  const availableEmployees = wizardData.selectedStore 
    ? getEmployeesByStore(wizardData.selectedStore) 
    : [];
  
  // 🤖 [IA] - v1.3.0: Manejar reconocimiento de una regla del protocolo (memoizado para performance)
  const handleRuleAcknowledge = useCallback((ruleId: string, index: number) => {
    acknowledgeRule(ruleId, index);
  }, [acknowledgeRule]);

  // 🤖 [IA] - v1.2.26: Manejar siguiente paso - pasar estado de reglas a navegación
  const handleNext = () => {
    if (currentStep === 1 && !isFlowCompleted()) {
      toast.error("Debe revisar todas las reglas del protocolo");
      return;
    }

    // Pasar el estado de las reglas para validación del paso 1
    const success = goNext(isFlowCompleted());
    if (!success) {
      toast.error("Complete todos los campos para continuar");
    }
  };

  // Manejar completar el wizard
  const handleComplete = () => {
    const wizardState = getNavigationState(isFlowCompleted());
    if (wizardState.isCompleted) {
      onComplete({
        selectedStore: wizardData.selectedStore,
        selectedCashier: wizardData.selectedCashier,
        selectedWitness: wizardData.selectedWitness,
        expectedSales: wizardData.expectedSales
      });
      resetWizard();
    }
  };

  // 🤖 [IA] - v3.0.0: Manejar solicitud de cancelación - abre modal de confirmación
  const handleCancelRequest = useCallback(() => {
    setShowCancelConfirmation(true);
  }, []);

  // 🤖 [IA] - v3.0.0: Manejar cierre confirmado - ejecuta reset y cierre real
  const handleConfirmedClose = useCallback(() => {
    resetWizard();
    resetFlow();
    setShowCancelConfirmation(false);
    onClose();
  }, [resetWizard, resetFlow, onClose]);

  // 🤖 [IA] - v3.0.0: Manejar cancelación de cierre - continúa en wizard
  const handleCancelClose = useCallback(() => {
    setShowCancelConfirmation(false);
  }, []);

  // 🤖 [IA] - v1.2.25: Calcular progreso basado en tareas completadas - flujo guiado como fuente única de verdad
  const totalTasks = 5; // 5 pasos del wizard
  const completedTasks = [
    isFlowCompleted(),                         // Paso 1: Protocolo completado
    wizardData.selectedStore !== '',          // Paso 2: Sucursal seleccionada
    wizardData.selectedCashier !== '',        // Paso 3: Cajero seleccionado
    wizardData.selectedWitness !== '',        // Paso 4: Testigo seleccionado
    wizardData.expectedSales !== '' && parseFloat(wizardData.expectedSales) > 0  // Paso 5: Venta esperada
  ].filter(Boolean).length;

  const progressValue = Math.round((completedTasks / totalTasks) * 100);

  // Renderizar contenido según el paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Protocolo Anti-Fraude - Flujo Guiado
        return (
          <div className="glass-morphism-panel space-y-fluid-lg">
            {/* 🤖 [IA] - v1.3.0: Card IMPORTANTE con información del flujo guiado */}
            <div className="glass-morphism-panel border border-orange-400/40 border-l-4 border-l-orange-400 text-center shadow-lg shadow-orange-400/10">
              <div className="flex items-center justify-center gap-fluid-md mb-fluid-md">
                <AlertTriangle className="w-fluid-lg h-fluid-lg text-orange-400" />
                <h3 className="font-semibold text-orange-400 text-[clamp(0.875rem,3.5vw,1rem)]">PROTOCOLO OBLIGATORIO</h3>
              </div>
              <p className="text-primary-foreground text-[clamp(0.875rem,3.5vw,1rem)] font-medium">
                Revisa cada regla individualmente
              </p>
            </div>

            {/* 🤖 [IA] - v1.3.0: Flujo guiado de reglas usando componentes ProtocolRule */}
            <div className="flex flex-col gap-fluid-lg">
              {currentProtocolRules.map((rule, index) => (
                <ProtocolRule
                  key={rule.id}
                  rule={rule}
                  state={getRuleState(rule.id)}
                  isCurrent={index === rulesFlowState.currentRuleIndex}
                  onAcknowledge={() => handleRuleAcknowledge(rule.id, index)}
                />
              ))}
            </div>

          </div>
        );

      case 2: // Selección de Sucursal
        return (
          <div className="glass-morphism-panel space-y-fluid-lg">
            {/* 🤖 [IA] - v1.2.12: Header section optimizado */}
            <div className="glass-morphism-panel header-section">
              <MapPin className="flex-shrink-0 w-6 md:w-8 h-6 md:h-8 bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary-foreground text-lg md:text-xl">Ubicación</h3>
                <p className="text-muted-foreground text-xs md:text-sm mt-fluid-xs">Sucursal del corte</p>
              </div>
            </div>

            <Select 
              value={wizardData.selectedStore} 
              onValueChange={(value) => updateWizardData({ selectedStore: value })}
              aria-label="Selección de sucursal para corte de caja"
              aria-required="true"
            >
              <SelectTrigger 
                className={cn(
                  "wizard-select-trigger w-full",
                  "shadow-none border-input transition-all duration-300 ease-in-out",
                  "focus:neon-glow-primary data-[state=open]:neon-glow-primary"
                )}
              >
                <SelectValue placeholder="Elegir sucursal" />
              </SelectTrigger>
              <SelectContent className="wizard-select-content">
                {STORES.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {wizardData.selectedStore && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-morphism-panel border border-green-400/40 shadow-lg shadow-green-400/20"
              >
                <div className="flex items-center gap-fluid-sm md:gap-fluid-md">
                  <CheckCircle className="flex-shrink-0 text-green-400 w-4 md:w-5 h-4 md:h-5" />
                  <span className="font-medium text-primary-foreground text-sm md:text-base">✓ Seleccionada</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 3: // Selección de Cajero
        return (
          <div className="glass-morphism-panel space-y-fluid-lg">
            {/* 🤖 [IA] - v1.2.12: Header section Cajero optimizado */}
            <div className="glass-morphism-panel header-section">
              <Users
                className="flex-shrink-0 w-6 md:w-8 h-6 md:h-8 bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent"
                aria-label="Icono de cajero responsable"
                role="img"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary-foreground text-lg md:text-xl">Cajero</h3>
                <p className="text-muted-foreground text-xs md:text-sm mt-fluid-xs">¿Quién Cobró este día?</p>
              </div>
            </div>

            <Select 
              value={wizardData.selectedCashier} 
              onValueChange={(value) => updateWizardData({ selectedCashier: value })}
            >
              <SelectTrigger className="wizard-select-trigger w-full">
                <SelectValue placeholder="Seleccione el cajero responsable" />
              </SelectTrigger>
              <SelectContent className="wizard-select-content">
                {availableEmployees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {wizardData.selectedCashier && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-morphism-panel border border-green-400/40 shadow-lg shadow-green-400/20"
              >
                <div className="flex items-center gap-fluid-sm md:gap-fluid-md">
                  <CheckCircle
                    className="flex-shrink-0 text-green-400 w-4 md:w-5 h-4 md:h-5"
                    aria-label="Cajero seleccionado correctamente"
                  />
                  <span className="font-medium text-primary-foreground text-sm md:text-base">✓ Cajero seleccionado</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 4: // Selección de Testigo
        return (
          <div className="glass-morphism-panel space-y-fluid-lg">
            {/* 🤖 [IA] - v1.2.12: Header section Testigo optimizado */}
            <div className="glass-morphism-panel header-section">
              <Shield className="flex-shrink-0 w-6 md:w-8 h-6 md:h-8 text-primary" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary-foreground text-lg md:text-xl">Testigo</h3>
                <p className="text-muted-foreground text-xs md:text-sm mt-fluid-xs">
                  Selecciona quien Ayudara
                </p>
              </div>
            </div>

            <Select 
              value={wizardData.selectedWitness} 
              onValueChange={(value) => updateWizardData({ selectedWitness: value })}
            >
              <SelectTrigger className="wizard-select-trigger w-full">
                <SelectValue placeholder="Seleccione el testigo" />
              </SelectTrigger>
              <SelectContent className="wizard-select-content">
                {availableEmployees
                  .filter(emp => emp.id !== wizardData.selectedCashier)
                  .map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {wizardData.selectedWitness === wizardData.selectedCashier && 
             wizardData.selectedWitness !== '' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-morphism-panel border border-red-500/40 shadow-lg shadow-red-500/20"
              >
                <div className="flex items-center gap-fluid-sm md:gap-fluid-md">
                  <AlertTriangle className="flex-shrink-0 text-red-500 w-4 md:w-5 h-4 md:h-5" />
                  <span className="font-medium text-red-500 text-sm md:text-base">
                    El cajero y el testigo deben ser personas diferentes
                  </span>
                </div>
              </motion.div>
            )}

            {wizardData.selectedWitness && 
             wizardData.selectedWitness !== wizardData.selectedCashier && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-morphism-panel border border-green-400/40 shadow-lg shadow-green-400/20"
              >
                <div className="flex items-center gap-fluid-sm md:gap-fluid-md">
                  <CheckCircle className="flex-shrink-0 text-green-400 w-4 md:w-5 h-4 md:h-5" />
                  <span className="font-medium text-primary-foreground text-sm md:text-base">Testigo seleccionado correctamente</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 5: // Venta Esperada
        return (
          <div className="glass-morphism-panel space-y-fluid-lg">
            {/* 🤖 [IA] - v1.2.12: Header section Venta Esperada optimizado */}
            <div className="glass-morphism-panel header-section">
              <DollarSign className="flex-shrink-0 w-5 md:w-6 h-5 md:h-6 bg-gradient-to-br from-green-400 to-emerald-400 bg-clip-text text-transparent" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary-foreground text-lg md:text-xl">Ingresa Total Vendido</h3>
              </div>
            </div>

            <div className="flex flex-col gap-fluid-md md:gap-fluid-lg">
              {/* 🤖 [IA] - v1.2.9: Contenedor con grid y variables CSS compartidas para alturas iguales */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-fluid-sm md:gap-fluid-md items-center">
                <div className="glass-morphism-panel relative flex-1 pl-2 flex items-center">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-green-400 text-base md:text-lg">
                    $
                  </span>
                  <Input
                    id="expected-sales"
                    type="text" // 🤖 [IA] - v1.0.45: Cambiado a text para soporte de decimales en móvil
                    inputMode={getInputMode('currency')} // 🤖 [IA] - v1.0.45: Teclado decimal en móvil
                    pattern={getPattern('currency')} // 🤖 [IA] - v1.0.45: Patrón para decimales
                    step="0.01"
                    min="0"
                    value={wizardData.expectedSales}
                    onChange={(e) => {
                      // 🤖 [IA] - v1.0.45: Validación de entrada decimal
                      const validation = validateInput(e.target.value, 'currency');
                      if (validation.isValid) {
                        updateWizardData({ expectedSales: validation.cleanValue });
                      }
                    }}
                    placeholder="0.00"
                    aria-label="Ingrese el monto de la venta esperada"
                    className={cn(
                      "font-semibold bg-transparent border-none text-primary-foreground pl-12 md:pl-14 h-9 md:h-11 text-base md:text-lg neon-glow-success",
                      wizardData.expectedSales && parseFloat(wizardData.expectedSales) > 0 && "border-green-500/50"
                    )}
                    data-valid={!!(wizardData.expectedSales && parseFloat(wizardData.expectedSales) > 0)}
                    autoComplete="off" // 🤖 [IA] - Desactiva autocompletado del navegador
                  />
                </div>
                {/* Botón Confirmar al lado del input */}
                {/* 🤖 [IA] - v1.2.30: Botón migrado a ConstructiveActionButton estándar */}
                <ConstructiveActionButton
                  onClick={handleComplete}
                  disabled={!getNavigationState(isFlowCompleted()).isCompleted}
                  aria-label="Confirmar venta esperada"
                  type="button"
                  className="h-9 md:h-11"
                >
                  <CheckCircle aria-hidden="true" className="w-5 md:w-6 h-5 md:h-6 mr-2 md:mr-3" />
                  <span>Confirmar</span>
                </ConstructiveActionButton>
              </div>
              {wizardData.expectedSales && parseFloat(wizardData.expectedSales) <= 0 && (
                <p className="text-xs text-red-500">
                  El monto debe ser mayor a $0.00
                </p>
              )}
            </div>

            {wizardData.expectedSales && parseFloat(wizardData.expectedSales) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-morphism-panel border border-green-400/40 shadow-lg shadow-green-400/20"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="flex-shrink-0 text-green-400 w-5 md:w-6 h-5 md:h-6" />
                  <span className="font-medium text-primary-foreground text-sm md:text-base">
                    Venta esperada: ${parseFloat(wizardData.expectedSales).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}

            <div className="glass-morphism-panel border-l-4 border-l-blue-500 shadow-lg shadow-blue-500/20">
              <h4 className="font-semibold text-blue-500 text-sm md:text-base mb-2 md:mb-3">Resumen de Información:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 md:gap-2 text-xs md:text-sm">
                <div className="flex flex-col gap-1 md:gap-2">
                  <span className="min-w-0 text-muted-foreground">Sucursal:</span>
                  <span className="font-medium text-left truncate text-primary-foreground">
                    {STORES.find(s => s.id === wizardData.selectedStore)?.name}
                  </span>
                </div>
                <div className="flex flex-col gap-1 md:gap-2">
                  <span className="min-w-0 text-muted-foreground">Cajero:</span>
                  <span className="font-medium text-left truncate text-primary-foreground">
                    {availableEmployees.find(e => e.id === wizardData.selectedCashier)?.name}
                  </span>
                </div>
                <div className="flex flex-col gap-1 md:gap-2">
                  <span className="min-w-0 text-muted-foreground">Testigo:</span>
                  <span className="font-medium text-left truncate text-primary-foreground">
                    {availableEmployees.find(e => e.id === wizardData.selectedWitness)?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

// ...
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Solo permitir cierre si el usuario hace clic en el botón de cerrar o cancelar
      // Ignorar los clics fuera del modal (en el overlay)
      if (!open) {
        // No hacer nada - el cierre debe ser explícito mediante botones
        return;
      }
    }}>
      <DialogContent
        className="glass-morphism-panel w-[clamp(90vw,95vw,95vw)] max-w-[clamp(300px,90vw,540px)] max-h-[clamp(85vh,90vh,90vh)] overflow-y-auto overflow-x-hidden p-0 [&>button]:hidden"
      >
        <div className="p-fluid-lg space-y-fluid-lg">
          <DialogHeader className="text-center space-y-fluid-md">
            <DialogTitle className="text-primary mb-fluid-md text-[clamp(1.125rem,4.5vw,1.5rem)]">
              {getStepTitle()}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Complete los pasos para configurar el corte de caja nocturno
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar Section */}
          <div className="mt-fluid-lg mb-fluid-xl">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              />
            </div>
            <div className="flex justify-center mt-fluid-sm">
              <span className="text-xs">
                <span className="text-primary font-medium">Preparación de Corte</span>
                <span className="text-gray-400"> {progressValue}% completado</span>
              </span>
            </div>
          </div>

          {/* Step Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>


          {/* 🤖 [IA] - v1.2.22: Footer centrado - botones agrupados centro con espaciado consistente */}
          <div className="flex items-center justify-center mt-fluid-2xl pt-fluid-xl border-t border-slate-600 gap-fluid-lg">
            <DestructiveActionButton
              onClick={handleCancelRequest}
              className="h-fluid-3xl px-fluid-lg"
            >
              Cancelar
            </DestructiveActionButton>

            {canGoPrevious && (
              <NeutralActionButton
                onClick={() => setShowBackConfirmation(true)}
                className="h-fluid-3xl px-fluid-lg"
              >
                Anterior
              </NeutralActionButton>
            )}
            
            {currentStep < totalSteps && (
              <ConstructiveActionButton
                onClick={handleNext}
                disabled={currentStep === 1 ? !isFlowCompleted() : !getNavigationState(isFlowCompleted()).canGoNext}
                className="h-fluid-3xl px-fluid-lg"
              >
                Siguiente
              </ConstructiveActionButton>
            )}
          </div>
        </div>
      </DialogContent>
      
      {/* 🤖 [IA] - v2.0.0: Modal de confirmación abstracto para prevenir retrocesos accidentales */}
      <ConfirmationModal
        open={showBackConfirmation}
        onOpenChange={setShowBackConfirmation}
        title="¿Retroceder al paso anterior?"
        description="Los datos ingresados se mantendrán."
        warningText="Retrocede si quieres corregir información."
        confirmText="Sí, retroceder"
        cancelText="Continuar aquí"
        onConfirm={() => {
          goPrevious();
          setShowBackConfirmation(false);
        }}
        onCancel={() => setShowBackConfirmation(false)}
      />

      {/* 🤖 [IA] - v3.0.0: Modal de confirmación para cancelar - Paradise UI v3.0 */}
      <ConfirmationModal
        open={showCancelConfirmation}
        onOpenChange={setShowCancelConfirmation}
        title="Cancelar Configuración"
        description="Se perderá todo el progreso del protocolo de seguridad"
        warningText="Esta acción no se puede deshacer"
        confirmText="Sí, Cancelar"
        cancelText="Continuar"
        onConfirm={handleConfirmedClose}
        onCancel={handleCancelClose}
      />
    </Dialog>
  );
};

export default InitialWizardModal;