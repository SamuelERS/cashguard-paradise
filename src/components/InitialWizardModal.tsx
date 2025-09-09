// 🤖 [IA] - InitialWizardModal v1.1.09 - Morning count visual identity
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, AlertTriangle, CheckCircle,
  MapPin, Users, DollarSign
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWizardNavigation } from "@/hooks/useWizardNavigation";
import { STORES, getEmployeesByStore } from "@/data/paradise";
import '@/styles/features/modal-dark-scrollbar.css';
// 🤖 [IA] - v1.2.25: Removed wizard-cancel-button.css import (obsoleto - migrado a variant system)
import '@/styles/features/wizard-nav-previous-button.css';
import '@/styles/features/wizard-nav-next-button.css';
import '@/styles/features/wizard-select-elements.css';
import '@/styles/features/wizard-confirm-button.css';
import { toast } from "sonner";
import { useTimingConfig } from "@/hooks/useTimingConfig"; // 🤖 [IA] - Hook de timing unificado v1.0.22
import { useInputValidation } from "@/hooks/useInputValidation"; // 🤖 [IA] - v1.0.45: Hook para validación de decimales
import { ConfirmationModal } from "@/components/ui/confirmation-modal"; // 🤖 [IA] - v2.0.0: Modal de confirmación abstracto
import { DestructiveActionButton } from "@/components/ui/destructive-action-button"; // 🤖 [IA] - v1.2.26: Botón destructivo estándar
import { NeutralActionButton } from "@/components/ui/neutral-action-button"; // 🤖 [IA] - v1.2.27: Botón neutral estándar
import { ConstructiveActionButton } from "@/components/ui/constructive-action-button"; // 🤖 [IA] - v1.2.29: Botón constructivo estándar
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
    getStepTitle
  } = useWizardNavigation();

  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Usar timing unificado v1.0.22
  const { validateInput, getPattern, getInputMode } = useInputValidation(); // 🤖 [IA] - v1.0.45: Validación de decimales

  // Control de animación del AlertTriangle (solo 3 segundos)
  // 🤖 [IA] - v1.0.38 - Simplificado: ya no hay validación de firma
  const [hasVibratedForError, setHasVibratedForError] = useState(false);
  // 🤖 [IA] - v1.2.13 - Estado para controlar el modal de confirmación al retroceder
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);
  
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

  // 🤖 [IA] - v1.0.29 - Feedback háptico optimizado (vibra solo una vez por error)
  useEffect(() => {
    if (!canGoNext && currentStep === 1 && !hasVibratedForError && 'vibrate' in navigator) {
      // Vibración suave solo cuando el estado cambia a error
      navigator.vibrate(50);
      setHasVibratedForError(true);
    } else if (canGoNext && hasVibratedForError) {
      // Reset cuando el error se corrige
      setHasVibratedForError(false);
    }
  }, [canGoNext, currentStep, hasVibratedForError]);

  // Empleados disponibles basados en la sucursal seleccionada
  const availableEmployees = wizardData.selectedStore 
    ? getEmployeesByStore(wizardData.selectedStore) 
    : [];
  

  // 🤖 [IA] - v1.0.39 - Simplificación de reglas del protocolo
  const protocolRules = [
    {
      icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
      text: "Sin dispositivos electrónicos (conteo 100% manual)",
      critical: true,
    },
    {
      icon: <Shield className="w-5 h-5 text-red-500" />,
      text: "Conteo único — sin recuentos (verifica bien antes)",
      critical: true,
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-red-500" />,
      text: "Cajero ≠ Testigo (doble verificación)",
      critical: true,
    },
    {
      icon: <AlertTriangle className="w-5 h-5 text-orange-400" />,
      text: "Sistema activo para cualquier diferencia",
      critical: false,
      isAlert: true, // 🤖 [IA] - v1.0.30 - Flag para mostrar badge ALERTA
    },
  ];

  // Manejar el siguiente paso
  const handleNext = () => {
    const success = goNext();
    if (!success) {
      toast.error("Complete todos los campos para continuar");
    }
  };

  // Manejar completar el wizard
  const handleComplete = () => {
    if (isCompleted) {
      onComplete({
        selectedStore: wizardData.selectedStore,
        selectedCashier: wizardData.selectedCashier,
        selectedWitness: wizardData.selectedWitness,
        expectedSales: wizardData.expectedSales
      });
      resetWizard();
    }
  };

  // Reset al cerrar
  const handleClose = () => {
    resetWizard();
    onClose();
  };

  // Definir tareas específicas para cada paso
  const stepTasks = {
    1: ['rulesAccepted'],                // Protocolo de Seguridad
    2: ['selectedStore'],                // Selección de Sucursal
    3: ['selectedCashier'],              // Selección de Cajero
    4: ['selectedWitness'],              // Selección de Testigo
    5: ['expectedSales']                 // Venta Esperada
  };

  // Calcular progreso basado en tareas completadas
  const totalTasks = Object.values(stepTasks).flat().length;
  const completedTasks = Object.entries(wizardData).reduce((count, [, value]) => {
    // Contar campos completados
    if (value !== '' && value !== false) {
      return count + 1;
    }
    return count;
  }, 0);

  const progressValue = Math.round((completedTasks / totalTasks) * 100);

  // Renderizar contenido según el paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Protocolo Anti-Fraude
        return (
          <div className="wizard-step-container">
            {/* Header con Icono de Escudo */}
            <div className="flex items-center justify-center mb-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative"
              >
                {/* 🤖 [IA] - v1.2.11: Gradiente premium + escala responsive */}
                <Shield className="w-12 md:w-16 h-12 md:h-16 text-primary" />
              </motion.div>
            </div>

            {/* 🤖 [IA] - v1.0.59: Card transparente con glass effect */}
            <div className="wizard-glass-element rounded-lg md:rounded-xl border border-orange-400/30 border-l-4 border-l-orange-400 p-3 md:p-4">
              <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
                <AlertTriangle className="w-4 md:w-5 h-4 md:h-5 text-orange-400" />
                <h3 className="font-semibold text-orange-400 text-sm md:text-base">IMPORTANTE</h3>
              </div>
              <p className="text-primary-foreground text-xs md:text-sm">
                Sistema de protección de efectivo. Todo queda registrado.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <h3 className="font-semibold text-primary-foreground text-base md:text-lg">
                Protocolo obligatorio:
              </h3>
              
              {protocolRules.map((rule, index) => (
                <div
                  key={index}
                  className={`flex items-start ${rule.critical ? 'border-l-4 border-l-red-500' : 'border-l-4 border-l-orange-400'} gap-4 p-4 rounded-md bg-card/50 border border-border/50`}
                  role="listitem"
                  aria-label={`Regla ${index + 1}: ${rule.text}`}
                >
                  <div className="flex-shrink-0">{rule.icon}</div>
                  <span className="flex-1 leading-relaxed text-primary-foreground text-sm md:text-base">{rule.text}</span>
                  {/* 🤖 [IA] - v1.2.20 - Badge migrado a componente shadcn/ui */}
                  {(rule.critical || rule.isAlert) && (
                    <Badge 
                      variant={rule.isAlert ? "warning" : "destructive"}
                      aria-label={rule.isAlert ? "Alerta informativa" : "Regla crítica de cumplimiento obligatorio"}
                      role="status"
                      className="shrink-0"
                    >
                      {rule.isAlert ? "ALERTA" : "CRÍTICO"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            {/* 🤖 [IA] - v1.0.59: Checkbox con glass effect */}
            {/* 🤖 [IA] - v1.2.12 - Responsividad mejorada y textos concisos */}
            <div className="border-t border-white/10 pt-4 flex flex-col gap-4">
              <motion.div 
                className={`wizard-glass-element flex items-start gap-4 p-4 rounded-lg md:rounded-xl transition-all duration-300 ${
                  wizardData.rulesAccepted 
                    ? 'border-2 border-green-400/60 shadow-lg shadow-green-400/20' 
                    : 'border-2 border-blue-400/60 shadow-lg shadow-blue-400/20'
                }`}
              >
                <motion.div
                  animate={wizardData.rulesAccepted ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <Checkbox
                    id="rules-accepted"
                    checked={wizardData.rulesAccepted}
                    onCheckedChange={(checked) => 
                      updateWizardData({ rulesAccepted: checked as boolean })
                    }
                    className={`mt-0.5 border-2 ${
                      wizardData.rulesAccepted 
                        ? 'border-green-400 bg-green-400' 
                        : 'border-blue-400 bg-transparent'
                    }`}
                    aria-describedby={!wizardData.rulesAccepted ? "rules-error" : undefined}
                    aria-invalid={!wizardData.rulesAccepted}
                  />
                </motion.div>
                <Label 
                  htmlFor="rules-accepted" 
                  className="font-medium cursor-pointer leading-relaxed text-primary-foreground text-sm md:text-base"
                  id="rules-description"
                >
                  Acepto el protocolo de seguridad
                </Label>
              </motion.div>
            </div>
          </div>
        );

      case 2: // Selección de Sucursal
        return (
          <div className="wizard-step-container">
            {/* 🤖 [IA] - v1.2.12: Header section optimizado */}
            <div className="wizard-header-section">
              <MapPin className="flex-shrink-0 w-6 md:w-8 h-6 md:h-8 bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary-foreground text-lg md:text-xl">Ubicación</h3>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">Sucursal del corte</p>
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
                className="wizard-success-feedback"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="flex-shrink-0 text-green-400 w-4 md:w-5 h-4 md:h-5" />
                  <span className="font-medium text-primary-foreground text-sm md:text-base">✓ Seleccionada</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 3: // Selección de Cajero
        return (
          <div className="wizard-step-container">
            {/* 🤖 [IA] - v1.2.12: Header section Cajero optimizado */}
            <div className="wizard-header-section">
              <Users 
                className="flex-shrink-0 w-6 md:w-8 h-6 md:h-8 bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent" 
                aria-label="Icono de cajero responsable"
                role="img"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary-foreground text-lg md:text-xl">Cajero</h3>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">¿Quién Cobró este día?</p>
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
                className="wizard-success-feedback"
              >
                <div className="flex items-center gap-2 md:gap-3">
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
          <div className="wizard-step-container">
            {/* 🤖 [IA] - v1.2.12: Header section Testigo optimizado */}
            <div className="wizard-header-section">
              <Shield className="flex-shrink-0 w-6 md:w-8 h-6 md:h-8 text-primary" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary-foreground text-lg md:text-xl">Testigo</h3>
                <p className="text-muted-foreground text-xs md:text-sm mt-1">
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
                className="wizard-error-feedback"
              >
                <div className="flex items-center gap-2 md:gap-3">
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
                className="wizard-success-feedback"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="flex-shrink-0 text-green-400 w-4 md:w-5 h-4 md:h-5" />
                  <span className="font-medium text-primary-foreground text-sm md:text-base">Testigo seleccionado correctamente</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 5: // Venta Esperada
        return (
          <div className="wizard-step-container">
            {/* 🤖 [IA] - v1.2.12: Header section Venta Esperada optimizado */}
            <div className="wizard-header-section">
              <DollarSign className="flex-shrink-0 w-5 md:w-6 h-5 md:h-6 bg-gradient-to-br from-green-400 to-emerald-400 bg-clip-text text-transparent" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-primary-foreground text-lg md:text-xl">Ingresa Total Vendido</h3>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:gap-3">
              {/* 🤖 [IA] - v1.2.9: Contenedor con grid y variables CSS compartidas para alturas iguales */}
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 md:gap-3 items-stretch">
                <div className="wizard-glass-element relative flex-1 rounded-md md:rounded-lg p-2 md:p-3">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-green-400 text-base md:text-lg">
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
                    className="font-semibold bg-transparent border-none text-primary-foreground pl-7 md:pl-9 h-9 md:h-11 text-base md:text-lg"
                  />
                </div>
                {/* Botón Confirmar al lado del input */}
                {/* 🤖 [IA] - v1.2.30: Botón migrado a ConstructiveActionButton estándar */}
                <ConstructiveActionButton
                  onClick={handleComplete}
                  disabled={!isCompleted}
                  aria-label="Confirmar venta esperada"
                  type="button"
                  className="wizard-confirm-button"
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
                className="wizard-success-feedback"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <CheckCircle className="flex-shrink-0 text-green-400 w-5 md:w-6 h-5 md:h-6" />
                  <span className="font-medium text-primary-foreground text-sm md:text-base">
                    Venta esperada: ${parseFloat(wizardData.expectedSales).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}

            <div className="wizard-glass-element border-l-4 border-l-blue-500 shadow-lg shadow-blue-500/20">
              <h4 className="font-semibold text-blue-500 text-sm md:text-base mb-2 md:mb-3">Resumen de Información:</h4>
              <div className="flex flex-col gap-1 md:gap-2 text-xs md:text-sm">
                <div className="flex justify-between gap-2 md:gap-3">
                  <span className="min-w-0 text-muted-foreground">Sucursal:</span>
                  <span className="font-medium text-right truncate text-primary-foreground">
                    {STORES.find(s => s.id === wizardData.selectedStore)?.name}
                  </span>
                </div>
                <div className="flex justify-between gap-2 md:gap-3">
                  <span className="min-w-0 text-muted-foreground">Cajero:</span>
                  <span className="font-medium text-right truncate text-primary-foreground">
                    {availableEmployees.find(e => e.id === wizardData.selectedCashier)?.name}
                  </span>
                </div>
                <div className="flex justify-between gap-2 md:gap-3">
                  <span className="min-w-0 text-muted-foreground">Testigo:</span>
                  <span className="font-medium text-right truncate text-primary-foreground">
                    {availableEmployees.find(e => e.id === wizardData.selectedWitness)?.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
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
        className="wizard-modal-content w-[95vw] max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden p-0 [&>button]:hidden"
      >
        <div className="p-[clamp(1rem,4vw,1.5rem)]">
          <DialogHeader>
            <DialogTitle className="text-primary mb-[clamp(0.5rem,2vw,0.75rem)] text-[clamp(1.125rem,4.5vw,1.5rem)]">
              {getStepTitle()}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Complete los pasos para configurar el corte de caja nocturno
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar Section */}
          <div className="mt-[clamp(0.75rem,3vw,1rem)] mb-[clamp(1rem,4vw,1.5rem)]">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              />
            </div>
            <div className="flex justify-center mt-1">
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

          {/* Validation Feedback */}
          {currentStep === 1 && !canGoNext && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg p-3 mt-4 bg-orange-400/10 border border-orange-400/30"
              id="validation-feedback"
              role="alert"
              aria-live="polite"
              aria-atomic="true"
              aria-label="Validaciones pendientes para continuar"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle 
                  className="w-4 h-4 mt-0.5 flex-shrink-0 text-orange-400"
                  aria-label="Advertencia"
                  role="img"
                />
                <div className="text-sm">
                  <p className="font-medium mb-1 text-orange-400">Para continuar, complete:</p>
                  <ul className="space-y-1 text-xs list-none text-orange-400" role="list">
                    {!wizardData.rulesAccepted && (
                      <li 
                        className="flex items-center gap-1 before:content-['•'] before:text-destructive before:mr-1"
                        id="rules-error"
                      >
                        Debe aceptar las reglas del protocolo para continuar
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}

          {/* 🤖 [IA] - v1.2.22: Footer centrado - botones agrupados centro con espaciado consistente */}
          <div className="flex items-center justify-center mt-[clamp(1.5rem,6vw,2rem)] pt-[clamp(1rem,4vw,1.5rem)] border-t border-slate-600 gap-[clamp(0.5rem,2vw,0.75rem)]">
            <DestructiveActionButton 
              onClick={handleClose}
              className="h-[clamp(2.5rem,10vw,3rem)] px-[clamp(1rem,4vw,1.5rem)]"
            >
              Cancelar
            </DestructiveActionButton>
            
            {canGoPrevious && (
              <NeutralActionButton 
                onClick={() => setShowBackConfirmation(true)}
                className="h-[clamp(2.5rem,10vw,3rem)] px-[clamp(1rem,4vw,1.5rem)]"
              >
                Anterior
              </NeutralActionButton>
            )}
            
            {currentStep < totalSteps && (
              <ConstructiveActionButton
                onClick={handleNext}
                disabled={!canGoNext}
                className="h-[clamp(2.5rem,10vw,3rem)] px-[clamp(1rem,4vw,1.5rem)]"
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
    </Dialog>
  );
};

export default InitialWizardModal;