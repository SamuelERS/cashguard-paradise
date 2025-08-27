// 🤖 [IA] - InitialWizardModal v1.1.09 - Morning count visual identity
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, AlertTriangle, CheckCircle, X, ArrowLeft, ArrowRight,
  MapPin, Users, DollarSign, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWizardNavigation } from "@/hooks/useWizardNavigation";
import { STORES, getEmployeesByStore } from "@/data/paradise";
import { toast } from "sonner";
import { useTimingConfig } from "@/hooks/useTimingConfig"; // 🤖 [IA] - Hook de timing unificado v1.0.22
import { useInputValidation } from "@/hooks/useInputValidation"; // 🤖 [IA] - v1.0.45: Hook para validación de decimales

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
    getStepDescription
  } = useWizardNavigation();

  const { createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Usar timing unificado v1.0.22
  const { validateInput, getPattern, getInputMode } = useInputValidation(); // 🤖 [IA] - v1.0.45: Validación de decimales

  // Control de animación del AlertTriangle (solo 3 segundos)
  const [shouldPulse, setShouldPulse] = useState(true);
  // 🤖 [IA] - v1.0.38 - Simplificado: ya no hay validación de firma
  const [hasVibratedForError, setHasVibratedForError] = useState(false);
  
  // 🤖 [IA] - v1.0.29 - Fix memory leak con cleanup mejorado
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    if (currentStep === 1) {
      setShouldPulse(true);
      // 🤖 [IA] - Migrado a timing unificado para animaciones consistentes v1.0.22
      cleanup = createTimeoutWithCleanup(() => setShouldPulse(false), 'toast', 'wizard_pulse_animation');
    }
    
    return () => {
      cleanup?.();
      setShouldPulse(false); // Asegurar reset al desmontar o cambiar de paso
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
      icon: <AlertTriangle className="w-5 h-5" style={{ color: '#f4212e' }} />,
      text: "Sin dispositivos electrónicos (conteo 100% manual)",
      critical: true,
    },
    {
      icon: <Shield className="w-5 h-5" style={{ color: '#f4212e' }} />,
      text: "Conteo único — sin recuentos (verifica bien antes)",
      critical: true,
    },
    {
      icon: <CheckCircle className="w-5 h-5" style={{ color: '#f4212e' }} />,
      text: "Cajero ≠ Testigo (doble verificación)",
      critical: true,
    },
    {
      icon: <AlertTriangle className="w-5 h-5" style={{ color: '#f4a52a' }} />,
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

  // Calcular progreso
  const progressValue = ((currentStep - 1) / (totalSteps - 1)) * 100;

  // Renderizar contenido según el paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Protocolo Anti-Fraude
        return (
          <div className="space-y-6" style={{ 
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '28px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            {/* Header con Icono de Escudo */}
            <div className="flex items-center justify-center mb-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative"
              >
                {/* 🤖 [IA] - v1.0.59: Gradiente premium aplicado */}
                <Shield className="w-20 h-20" style={{
                  background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }} />
              </motion.div>
            </div>

            {/* 🤖 [IA] - v1.0.59: Card transparente con glass effect */}
            <div className="rounded-lg p-4" style={{ 
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(244, 165, 42, 0.3)',
              borderLeft: '3px solid #f4a52a',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5" style={{ color: '#f4a52a' }} />
                <h3 className="font-semibold" style={{ color: '#f4a52a' }}>IMPORTANTE</h3>
              </div>
              <p className="text-sm" style={{ color: '#e1e8ed' }}>
                Este sistema protege el efectivo y tu trabajo. Todos los movimientos 
                quedan registrados para tu seguridad y la de la empresa.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg" style={{ color: '#e1e8ed' }}>
                Reglas obligatorias del protocolo:
              </h3>
              
              {protocolRules.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 sm:p-4 rounded-lg premium-rule-card"
                  style={{
                    backgroundColor: 'rgba(36, 36, 36, 0.4)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderLeft: rule.critical ? '4px solid #f4212e' : '4px solid #f4a52a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(36, 36, 36, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(36, 36, 36, 0.4)';
                  }}
                  role="listitem"
                  aria-label={`Regla ${index + 1}: ${rule.text}`}
                >
                  <div className="flex-shrink-0">{rule.icon}</div>
                  <span className="text-sm sm:text-base flex-1 leading-relaxed" style={{ color: '#e1e8ed' }}>{rule.text}</span>
                  {/* 🤖 [IA] - v1.0.30 - Badge diferenciado: CRÍTICO o ALERTA */}
                  {(rule.critical || rule.isAlert) && (
                    <span 
                      className="text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 rounded-md"
                      style={{
                        backgroundColor: rule.isAlert ? 'rgba(244, 165, 42, 0.1)' : 'rgba(244, 33, 46, 0.1)',
                        color: rule.isAlert ? '#f4a52a' : '#f4212e',
                        border: rule.isAlert ? '1px solid rgba(244, 165, 42, 0.4)' : '1px solid rgba(244, 33, 46, 0.4)',
                        boxShadow: rule.isAlert ? '0 0 10px rgba(244, 165, 42, 0.2)' : '0 0 10px rgba(244, 33, 46, 0.2)'
                      }}
                      aria-label={rule.isAlert ? "Alerta informativa" : "Regla crítica de cumplimiento obligatorio"}
                      role="status"
                    >
                      {rule.isAlert ? "ALERTA" : "CRÍTICO"}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* 🤖 [IA] - v1.0.59 - Checkbox con glass effect */}
            <div className="space-y-4 pt-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <motion.div 
                className="flex items-start space-x-3 p-3 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(36, 36, 36, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: wizardData.rulesAccepted ? '2px solid rgba(0, 186, 124, 0.6)' : '2px solid rgba(29, 155, 240, 0.6)',
                  boxShadow: wizardData.rulesAccepted ? '0 0 15px rgba(0, 186, 124, 0.2)' : '0 0 15px rgba(29, 155, 240, 0.2)',
                  transition: 'all 0.3s ease'
                }}
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
                    className="mt-0.5 border-2"
                    style={{ 
                      borderColor: wizardData.rulesAccepted ? '#00ba7c' : '#1d9bf0',
                      backgroundColor: wizardData.rulesAccepted ? '#00ba7c' : 'transparent'
                    }}
                    aria-describedby={!wizardData.rulesAccepted ? "rules-error" : undefined}
                    aria-invalid={!wizardData.rulesAccepted}
                  />
                </motion.div>
                <Label 
                  htmlFor="rules-accepted" 
                  className="text-sm sm:text-base font-medium cursor-pointer leading-relaxed"
                  id="rules-description"
                  style={{ color: '#e1e8ed' }}
                >
                  Acepto cumplir las reglas del Protocolo de Seguridad de Caja
                </Label>
              </motion.div>
            </div>
          </div>
        );

      case 2: // Selección de Sucursal
        return (
          <div className="space-y-6" style={{ 
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '28px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            {/* 🤖 [IA] - v1.0.61: Glass effect premium mejorado en Step 2 */}
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ 
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <MapPin className="w-8 h-8 flex-shrink-0" style={{ 
                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg sm:text-xl" style={{ color: '#e1e8ed' }}>Ubicación</h3>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>Seleccione la sucursal donde realizará el corte</p>
              </div>
            </div>

            <Select 
              value={wizardData.selectedStore} 
              onValueChange={(value) => updateWizardData({ selectedStore: value })}
              aria-label="Selección de sucursal para corte de caja"
              aria-required="true"
            >
              <SelectTrigger 
                className="w-full h-10 sm:h-12 text-sm sm:text-base transition-all duration-300"
                style={{ 
                  backgroundColor: 'rgba(36, 36, 36, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  color: '#e1e8ed'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(36, 36, 36, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(36, 36, 36, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(10, 132, 255, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(10, 132, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }}
              >
                <SelectValue placeholder="Seleccione una sucursal" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'rgba(36, 36, 36, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)'
              }}>
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
                className="p-3 sm:p-4 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(36, 36, 36, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 186, 124, 0.4)',
                  boxShadow: '0 0 15px rgba(0, 186, 124, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#00ba7c' }} />
                  <span className="font-medium" style={{ color: '#e1e8ed' }}>Sucursal seleccionada correctamente</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 3: // Selección de Cajero
        return (
          <div className="space-y-6" style={{ 
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '28px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            {/* 🤖 [IA] - v1.0.61: Glass effect premium en Step 3 */}
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ 
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <Users className="w-8 h-8 flex-shrink-0" style={{ 
                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg sm:text-xl" style={{ color: '#e1e8ed' }}>Cajero</h3>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>Seleccione el cajero responsable del corte</p>
              </div>
            </div>

            <Select 
              value={wizardData.selectedCashier} 
              onValueChange={(value) => updateWizardData({ selectedCashier: value })}
            >
              <SelectTrigger 
                className="w-full h-10 sm:h-12 text-sm sm:text-base transition-all duration-300"
                style={{ 
                  backgroundColor: 'rgba(36, 36, 36, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  color: '#e1e8ed'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(36, 36, 36, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(36, 36, 36, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(10, 132, 255, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(10, 132, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }}
              >
                <SelectValue placeholder="Seleccione el cajero" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'rgba(36, 36, 36, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)'
              }}>
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
                className="p-3 sm:p-4 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(36, 36, 36, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 186, 124, 0.4)',
                  boxShadow: '0 0 15px rgba(0, 186, 124, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#00ba7c' }} />
                  <span className="font-medium" style={{ color: '#e1e8ed' }}>Cajero seleccionado correctamente</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 4: // Selección de Testigo
        return (
          <div className="space-y-6" style={{ 
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '28px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            {/* 🤖 [IA] - v1.0.62: Glass effect premium en Step 4 */}
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ 
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <Shield className="w-8 h-8 flex-shrink-0" style={{ 
                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg sm:text-xl" style={{ color: '#e1e8ed' }}>Testigo</h3>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>Seleccione el testigo verificador del corte</p>
              </div>
            </div>

            <Select 
              value={wizardData.selectedWitness} 
              onValueChange={(value) => updateWizardData({ selectedWitness: value })}
            >
              <SelectTrigger 
                className="w-full h-10 sm:h-12 text-sm sm:text-base transition-all duration-300"
                style={{ 
                  backgroundColor: 'rgba(36, 36, 36, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  color: '#e1e8ed'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(36, 36, 36, 0.5)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(36, 36, 36, 0.4)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(10, 132, 255, 0.5)';
                  e.currentTarget.style.boxShadow = '0 0 15px rgba(10, 132, 255, 0.2)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
                }}
              >
                <SelectValue placeholder="Seleccione el testigo" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'rgba(36, 36, 36, 0.9)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.7)'
              }}>
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
                className="p-3 sm:p-4 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(36, 36, 36, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(244, 33, 46, 0.4)',
                  boxShadow: '0 0 15px rgba(244, 33, 46, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: '#f4212e' }} />
                  <span className="font-medium" style={{ color: '#f4212e' }}>
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
                className="p-3 sm:p-4 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(36, 36, 36, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 186, 124, 0.4)',
                  boxShadow: '0 0 15px rgba(0, 186, 124, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#00ba7c' }} />
                  <span className="font-medium" style={{ color: '#e1e8ed' }}>Testigo seleccionado correctamente</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 5: // Venta Esperada
        return (
          <div className="space-y-6" style={{ 
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: '28px',
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            {/* 🤖 [IA] - v1.0.63: Glass effect premium en Step 5 */}
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{ 
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <DollarSign className="w-8 h-8 flex-shrink-0" style={{ 
                background: 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg sm:text-xl" style={{ color: '#e1e8ed' }}>Venta Esperada</h3>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>
                  Monto esperado del sistema SICAR
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expected-sales" className="text-base font-medium" style={{ color: '#e1e8ed' }}>
                Monto ($)
              </Label>
              <div className="relative" style={{ 
                backgroundColor: 'rgba(36, 36, 36, 0.4)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '8px',
                padding: '4px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
              }}>
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg" style={{ color: '#00ba7c' }}>
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
                  className="pl-10 h-10 sm:h-12 text-base sm:text-lg font-semibold"
                  style={{ 
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#e1e8ed'
                  }}
                />
              </div>
              {wizardData.expectedSales && parseFloat(wizardData.expectedSales) <= 0 && (
                <p className="text-xs" style={{ color: '#f4212e' }}>
                  El monto debe ser mayor a $0.00
                </p>
              )}
            </div>

            {wizardData.expectedSales && parseFloat(wizardData.expectedSales) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 sm:p-4 rounded-lg"
                style={{ 
                  backgroundColor: 'rgba(36, 36, 36, 0.4)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0, 186, 124, 0.4)',
                  boxShadow: '0 0 15px rgba(0, 186, 124, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: '#00ba7c' }} />
                  <span className="font-medium" style={{ color: '#e1e8ed' }}>
                    Venta esperada: ${parseFloat(wizardData.expectedSales).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}

            <div className="p-3 sm:p-4 rounded-lg" style={{ 
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(10, 132, 255, 0.4)',
              borderLeft: '3px solid #0a84ff',
              boxShadow: '0 0 15px rgba(10, 132, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <h4 className="font-semibold mb-2" style={{ color: '#0a84ff' }}>Resumen de Información:</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="min-w-0" style={{ color: '#8899a6' }}>Sucursal:</span>
                  <span className="font-medium text-right truncate" style={{ color: '#e1e8ed' }}>
                    {STORES.find(s => s.id === wizardData.selectedStore)?.name}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="min-w-0" style={{ color: '#8899a6' }}>Cajero:</span>
                  <span className="font-medium text-right truncate" style={{ color: '#e1e8ed' }}>
                    {availableEmployees.find(e => e.id === wizardData.selectedCashier)?.name}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="min-w-0" style={{ color: '#8899a6' }}>Testigo:</span>
                  <span className="font-medium text-right truncate" style={{ color: '#e1e8ed' }}>
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
        className="w-[95vw] max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden p-0 mx-auto [&>button]:hidden"
        style={{
          backgroundColor: 'rgba(25, 25, 25, 0.65)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="p-4 sm:p-6">
          <DialogHeader>
            <div className="mb-2">
              <span className="text-sm text-muted-foreground">
                Paso {currentStep} de {totalSteps}
              </span>
            </div>
            <DialogTitle className="text-xl sm:text-2xl text-primary mb-2">
              {getStepTitle()}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {getStepDescription()}
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar */}
          <div className="mt-3 mb-4 sm:mt-4 sm:mb-6">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              />
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
              className="rounded-lg p-3 mt-4"
              style={{
                backgroundColor: '#f4a52a10',
                border: '1px solid #f4a52a30'
              }}
              id="validation-feedback"
              role="alert"
              aria-live="polite"
              aria-atomic="true"
              aria-label="Validaciones pendientes para continuar"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle 
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: '#f4a52a' }}
                  aria-label="Advertencia"
                  role="img"
                />
                <div className="text-sm">
                  <p className="font-medium mb-1" style={{ color: '#f4a52a' }}>Para continuar, complete:</p>
                  <ul className="space-y-1 text-xs list-none" role="list" style={{ color: '#f4a52a' }}>
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

          {/* Navigation Buttons - Single Row Layout */}
          <div className="flex items-center justify-between mt-6 pt-4" style={{ borderTop: '1px solid #2a3441' }}>
            {/* Cancel Button - Left Side */}
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="h-9 px-3 transition-all duration-200"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #3a4451',
                color: '#657786',
                fontSize: '14px',
                fontWeight: '400',
                borderRadius: '10px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f4212e30';
                e.currentTarget.style.color = '#f4212e';
                e.currentTarget.style.backgroundColor = '#f4212e08';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#3a4451';
                e.currentTarget.style.color = '#657786';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Cancelar proceso"
            >
              <span className="hidden sm:inline">Cancelar</span>
              <X className="w-4 h-4 sm:hidden" />
            </Button>
            
            {/* Navigation Buttons - Right Side */}
            <div className="flex items-center gap-1">
              {canGoPrevious && (
                <Button
                  onClick={goPrevious}
                  variant="outline"
                  size="sm"
                  className="h-9 px-4 transition-all duration-300"
                  style={{
                    backgroundColor: '#1a1f26',
                    border: '1px solid #2a3441',
                    color: '#8899a6',
                    fontSize: '14px',
                    fontWeight: '500',
                    borderRadius: '10px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#202530';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a1f26';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                  aria-label="Volver al paso anterior"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1.5">Anterior</span>
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={!canGoNext}
                  variant={canGoNext ? "ready" : "outline"}
                  size="sm"
                  className="h-9 px-4 transition-all duration-300 font-medium"
                  style={canGoNext ? {
                    background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 3px 12px rgba(10, 132, 255, 0.2)',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '10px'
                  } : {
                    backgroundColor: '#242424',
                    border: '1px solid #33333350',
                    color: '#4a5568',
                    cursor: 'not-allowed',
                    fontSize: '14px',
                    borderRadius: '10px'
                  }}
                  onMouseEnter={(e) => {
                    if (canGoNext) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(10, 132, 255, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (canGoNext) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 12px rgba(10, 132, 255, 0.2)';
                    }
                  }}
                  onMouseDown={(e) => {
                    if (canGoNext) {
                      e.currentTarget.style.transform = 'scale(0.98)';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (canGoNext) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  aria-label="Continuar al siguiente paso"
                  aria-describedby={!canGoNext ? "validation-feedback" : undefined}
                >
                  <span className="mr-1.5">Siguiente</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={!isCompleted}
                  variant={isCompleted ? "ready" : "outline"}
                  size="sm"
                  className="h-9 px-4 transition-all duration-300 font-medium"
                  style={isCompleted ? {
                    background: 'linear-gradient(135deg, #00ba7c 0%, #008060 100%)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 3px 12px rgba(0, 186, 124, 0.2)',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '10px'
                  } : {
                    backgroundColor: '#242424',
                    border: '1px solid #33333350',
                    color: '#4a5568',
                    cursor: 'not-allowed',
                    fontSize: '14px',
                    borderRadius: '10px'
                  }}
                  onMouseEnter={(e) => {
                    if (isCompleted) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 186, 124, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isCompleted) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 12px rgba(0, 186, 124, 0.2)';
                    }
                  }}
                  aria-label="Completar e iniciar conteo de caja"
                  aria-describedby={!isCompleted ? "validation-feedback" : undefined}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="hidden sm:inline ml-1.5">Completar</span>
                  <span className="sm:hidden">✓</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InitialWizardModal;