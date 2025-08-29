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
  
  // 🤖 [IA] - v1.2.11 - Detección de viewport y escala proporcional
  const viewportScale = typeof window !== 'undefined' ? Math.min(window.innerWidth / 430, 1) : 1;
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

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
          <div style={{ 
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'clamp(0.75rem, 3vw, 1rem)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            padding: 'clamp(1.25rem, 5vw, 1.75rem)',
            gap: 'clamp(1rem, 4vw, 1.25rem)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Header con Icono de Escudo */}
            <div className="flex items-center justify-center mb-4">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative"
              >
                {/* 🤖 [IA] - v1.2.11: Gradiente premium + escala responsive */}
                <Shield style={{
                  width: `clamp(60px, 15vw, 80px)`,
                  height: `clamp(60px, 15vw, 80px)`,
                  background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }} />
              </motion.div>
            </div>

            {/* 🤖 [IA] - v1.0.59: Card transparente con glass effect */}
            {/* 🤖 [IA] - v1.2.12: Optimización de capas - sin fondo duplicado */}
            <div className="rounded-lg" style={{
              border: '1px solid rgba(244, 165, 42, 0.3)',
              borderLeft: '3px solid #f4a52a',
              boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              padding: 'clamp(0.75rem, 3vw, 1rem)',
              borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)'
            }}>
              <div className="flex items-center" style={{ gap: 'clamp(0.375rem, 1.5vw, 0.5rem)', marginBottom: 'clamp(0.375rem, 1.5vw, 0.5rem)' }}>
                <AlertTriangle style={{ 
                  width: 'clamp(1rem, 3vw, 1.25rem)',
                  height: 'clamp(1rem, 3vw, 1.25rem)',
                  color: '#f4a52a' 
                }} />
                <h3 className="font-semibold" style={{ 
                  color: '#f4a52a',
                  fontSize: 'clamp(0.875rem, 3.5vw, 1rem)'
                }}>IMPORTANTE</h3>
              </div>
              <p style={{
                color: '#e1e8ed',
                fontSize: 'clamp(0.75rem, 3vw, 0.875rem)'
              }}>
                Sistema de protección de efectivo. Todo queda registrado.
              </p>
            </div>

            <div style={{ gap: 'clamp(0.75rem, 3vw, 1rem)', display: 'flex', flexDirection: 'column' }}>
              <h3 className="font-semibold" style={{
                color: '#e1e8ed',
                fontSize: 'clamp(1rem, 4vw, 1.125rem)'
              }}>
                Protocolo obligatorio:
              </h3>
              
              {protocolRules.map((rule, index) => (
                <div
                  key={index}
                  className="flex items-start premium-rule-card"
                  style={{
                    borderLeft: rule.critical ? '4px solid #f4212e' : '4px solid #f4a52a',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                    gap: 'clamp(0.75rem, 3vw, 1rem)',
                    padding: 'clamp(0.75rem, 3vw, 1rem)',
                    borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(36, 36, 36, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  role="listitem"
                  aria-label={`Regla ${index + 1}: ${rule.text}`}
                >
                  <div className="flex-shrink-0">{rule.icon}</div>
                  <span className="flex-1 leading-relaxed" style={{
                    color: '#e1e8ed',
                    fontSize: 'clamp(0.75rem, 3vw, 0.875rem)'
                  }}>{rule.text}</span>
                  {/* 🤖 [IA] - v1.0.30 - Badge diferenciado: CRÍTICO o ALERTA */}
                  {(rule.critical || rule.isAlert) && (
                    <span 
                      className="font-semibold rounded-md"
                      style={{
                        backgroundColor: rule.isAlert ? 'rgba(244, 165, 42, 0.1)' : 'rgba(244, 33, 46, 0.1)',
                        color: rule.isAlert ? '#f4a52a' : '#f4212e',
                        border: rule.isAlert ? '1px solid rgba(244, 165, 42, 0.4)' : '1px solid rgba(244, 33, 46, 0.4)',
                        boxShadow: rule.isAlert ? '0 0 10px rgba(244, 165, 42, 0.2)' : '0 0 10px rgba(244, 33, 46, 0.2)',
                        fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                        padding: 'clamp(0.375rem, 1.5vw, 0.5rem) clamp(0.5rem, 2vw, 0.75rem)',
                        borderRadius: 'clamp(4px, 1.5vw, 6px)'
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
            {/* 🤖 [IA] - v1.2.12 - Responsividad mejorada y textos concisos */}
            <div style={{ 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: 'clamp(0.75rem, 3vw, 1rem)',
              gap: 'clamp(0.75rem, 3vw, 1rem)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <motion.div 
                className="flex items-start"
                style={{ 
                  border: wizardData.rulesAccepted ? '2px solid rgba(0, 186, 124, 0.6)' : '2px solid rgba(29, 155, 240, 0.6)',
                  boxShadow: wizardData.rulesAccepted ? '0 0 15px rgba(0, 186, 124, 0.2)' : '0 0 15px rgba(29, 155, 240, 0.2)',
                  transition: 'all 0.3s ease',
                  gap: 'clamp(0.75rem, 3vw, 1rem)',
                  padding: 'clamp(0.75rem, 3vw, 1rem)',
                  borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)'
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
                  className="font-medium cursor-pointer leading-relaxed"
                  id="rules-description"
                  style={{ 
                    color: '#e1e8ed',
                    fontSize: 'clamp(0.875rem, 3.5vw, 1rem)'
                  }}
                >
                  Acepto el protocolo de seguridad
                </Label>
              </motion.div>
            </div>
          </div>
        );

      case 2: // Selección de Sucursal
        return (
          <div style={{ 
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(clamp(12px, 4vw, 20px))',
            WebkitBackdropFilter: 'blur(clamp(12px, 4vw, 20px))',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'clamp(0.75rem, 3vw, 1rem)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            padding: 'clamp(1.25rem, 5vw, 1.75rem)',
            gap: 'clamp(1rem, 4vw, 1.5rem)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 🤖 [IA] - v1.0.61: Glass effect premium mejorado en Step 2 */}
            {/* 🤖 [IA] - v1.2.12: Responsividad completa y textos concisos */}
            <div className="flex items-center" style={{ 
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(clamp(12px, 4vw, 20px))',
              WebkitBackdropFilter: 'blur(clamp(12px, 4vw, 20px))',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              gap: 'clamp(0.5rem, 2vw, 0.75rem)',
              padding: 'clamp(0.75rem, 3vw, 1rem)',
              borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)'
            }}>
              <MapPin className="flex-shrink-0" style={{ 
                width: 'clamp(1.5rem, 4vw, 2rem)',
                height: 'clamp(1.5rem, 4vw, 2rem)',
                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold" style={{ 
                  color: '#e1e8ed',
                  fontSize: 'clamp(1.125rem, 4.5vw, 1.25rem)'
                }}>Ubicación</h3>
                <p style={{ 
                  color: '#8899a6',
                  fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                  marginTop: 'clamp(0.125rem, 0.5vw, 0.25rem)'
                }}>Sucursal del corte</p>
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
                <SelectValue placeholder="Elegir sucursal" />
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
                style={{ 
                  border: '1px solid rgba(0, 186, 124, 0.4)',
                  boxShadow: '0 0 15px rgba(0, 186, 124, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  padding: 'clamp(0.75rem, 3vw, 1rem)',
                  borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)'
                }}
              >
                <div className="flex items-center" style={{ gap: 'clamp(0.375rem, 1.5vw, 0.5rem)' }}>
                  <CheckCircle className="flex-shrink-0" style={{ 
                    color: '#00ba7c',
                    width: 'clamp(1rem, 3vw, 1.25rem)',
                    height: 'clamp(1rem, 3vw, 1.25rem)'
                  }} />
                  <span className="font-medium" style={{ 
                    color: '#e1e8ed',
                    fontSize: 'clamp(0.875rem, 3.5vw, 1rem)'
                  }}>✓ Seleccionada</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 3: // Selección de Cajero
        return (
          <div className="space-y-[clamp(1rem,4vw,1.5rem)]" style={{ 
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 'clamp(0.75rem,3vw,1rem)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            padding: 'clamp(1.25rem,5vw,1.75rem)'
          }}>
            {/* 🤖 [IA] - v1.0.61: Glass effect premium en Step 3 */}
            {/* 🤖 [IA] - v1.2.12: Responsividad mejorada y textos concisos */}
            {/* 🤖 [IA] - v1.2.12: Optimización de capas - sin fondo duplicado */}
            <div className="flex items-center" style={{
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              gap: 'clamp(0.5rem,2vw,0.75rem)',
              padding: 'clamp(0.75rem,3vw,1rem)',
              borderRadius: 'clamp(0.5rem,2vw,0.75rem)'
            }}>
              <Users 
                className="flex-shrink-0" 
                style={{ 
                  width: 'clamp(1.5rem,4vw,2rem)',
                  height: 'clamp(1.5rem,4vw,2rem)',
                  background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }} 
                aria-label="Icono de cajero responsable"
                role="img"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold" style={{ 
                  color: '#e1e8ed',
                  fontSize: 'clamp(1.125rem,4.5vw,1.25rem)'
                }}>Cajero</h3>
                <p style={{ 
                  color: '#8899a6',
                  fontSize: 'clamp(0.75rem,3vw,0.875rem)',
                  marginTop: 'clamp(0.125rem,0.5vw,0.25rem)'
                }}>Seleccione responsable de corte</p>
              </div>
            </div>

            <Select 
              value={wizardData.selectedCashier} 
              onValueChange={(value) => updateWizardData({ selectedCashier: value })}
            >
              <SelectTrigger 
                className="w-full transition-all duration-300"
                style={{ 
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  color: '#e1e8ed',
                  height: 'clamp(2.75rem,6vw,3rem)',
                  fontSize: 'clamp(0.875rem,3.5vw,1rem)',
                  borderRadius: 'clamp(0.375rem,1.5vw,0.5rem)'
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
                <SelectValue placeholder="Seleccione el cajero responsable" />
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
                className="rounded-lg"
                style={{ 
                  border: '1px solid rgba(0, 186, 124, 0.4)',
                  boxShadow: '0 0 15px rgba(0, 186, 124, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  padding: 'clamp(0.75rem,3vw,1rem)',
                  borderRadius: 'clamp(0.5rem,2vw,0.75rem)'
                }}
              >
                <div className="flex items-center" style={{ gap: 'clamp(0.375rem,1.5vw,0.5rem)' }}>
                  <CheckCircle 
                    className="flex-shrink-0" 
                    style={{ 
                      color: '#00ba7c',
                      width: 'clamp(1rem,3vw,1.25rem)',
                      height: 'clamp(1rem,3vw,1.25rem)'
                    }} 
                    aria-label="Cajero seleccionado correctamente"
                  />
                  <span className="font-medium" style={{ 
                    color: '#e1e8ed',
                    fontSize: 'clamp(0.875rem,3.5vw,1rem)'
                  }}>✓ Cajero seleccionado</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 4: // Selección de Testigo
        return (
          <div style={{ 
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(clamp(12px, 4vw, 20px))',
            WebkitBackdropFilter: 'blur(clamp(12px, 4vw, 20px))',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: 'clamp(1.25rem, 5vw, 1.75rem)',
            borderRadius: 'clamp(0.75rem, 3vw, 1rem)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            gap: 'clamp(1rem, 4vw, 1.5rem)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 🤖 [IA] - v1.0.62: Glass effect premium en Step 4 */}
            {/* 🤖 [IA] - v1.2.12: Optimización de capas - sin fondo duplicado */}
            <div className="flex items-center" style={{
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              gap: 'clamp(0.75rem, 3vw, 1rem)',
              padding: 'clamp(0.75rem, 3vw, 1rem)',
              borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)'
            }}>
              <Shield className="flex-shrink-0" style={{ 
                width: 'clamp(1.5rem, 4vw, 2rem)',
                height: 'clamp(1.5rem, 4vw, 2rem)',
                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold" style={{ 
                  color: '#e1e8ed',
                  fontSize: 'clamp(1.125rem, 4.5vw, 1.25rem)'
                }}>Testigo</h3>
                <p style={{ 
                  color: '#8899a6',
                  fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                  marginTop: 'clamp(0.125rem, 0.5vw, 0.25rem)'
                }}>Seleccione el testigo verificador del corte</p>
              </div>
            </div>

            <Select 
              value={wizardData.selectedWitness} 
              onValueChange={(value) => updateWizardData({ selectedWitness: value })}
            >
              <SelectTrigger 
                className="w-full h-10 sm:h-12 text-sm sm:text-base transition-all duration-300"
                style={{ 
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
                style={{ 
                  border: '1px solid rgba(244, 33, 46, 0.4)',
                  boxShadow: '0 0 15px rgba(244, 33, 46, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  padding: 'clamp(0.75rem, 3vw, 1rem)',
                  borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)'
                }}
              >
                <div className="flex items-center" style={{ gap: 'clamp(0.375rem, 1.5vw, 0.5rem)' }}>
                  <AlertTriangle className="flex-shrink-0" style={{ 
                    color: '#f4212e',
                    width: 'clamp(1rem, 3vw, 1.25rem)',
                    height: 'clamp(1rem, 3vw, 1.25rem)'
                  }} />
                  <span className="font-medium" style={{ 
                    color: '#f4212e',
                    fontSize: 'clamp(0.875rem, 3.5vw, 1rem)'
                  }}>
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
                  border: '1px solid rgba(0, 186, 124, 0.4)',
                  boxShadow: '0 0 15px rgba(0, 186, 124, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="flex items-center" style={{ gap: 'clamp(0.375rem, 1.5vw, 0.5rem)' }}>
                  <CheckCircle className="flex-shrink-0" style={{ 
                    color: '#00ba7c',
                    width: 'clamp(1rem, 3vw, 1.25rem)',
                    height: 'clamp(1rem, 3vw, 1.25rem)'
                  }} />
                  <span className="font-medium" style={{ 
                    color: '#e1e8ed',
                    fontSize: 'clamp(0.875rem, 3.5vw, 1rem)'
                  }}>Testigo seleccionado correctamente</span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 5: // Venta Esperada
        return (
          <div style={{ 
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(clamp(12px, 4vw, 20px))',
            WebkitBackdropFilter: 'blur(clamp(12px, 4vw, 20px))',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: 'clamp(1.25rem, 5vw, 1.75rem)',
            borderRadius: 'clamp(0.75rem, 3vw, 1rem)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            gap: 'clamp(1rem, 4vw, 1.5rem)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* 🤖 [IA] - v1.0.63: Glass effect premium en Step 5 */}
            {/* 🤖 [IA] - v1.2.12: Optimización de capas - sin fondo duplicado */}
            <div className="flex items-center" style={{
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              gap: 'clamp(0.75rem, 3vw, 1rem)',
              padding: 'clamp(0.75rem, 3vw, 1rem)',
              borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)'
            }}>
              <DollarSign className="flex-shrink-0" style={{ 
                width: 'clamp(1.5rem, 4vw, 2rem)',
                height: 'clamp(1.5rem, 4vw, 2rem)',
                background: 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold" style={{ 
                  color: '#e1e8ed',
                  fontSize: 'clamp(1.125rem, 4.5vw, 1.25rem)'
                }}>Venta Esperada</h3>
                <p style={{ 
                  color: '#8899a6',
                  fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                  marginTop: 'clamp(0.125rem, 0.5vw, 0.25rem)'
                }}>
                  Monto esperado del sistema SICAR
                </p>
              </div>
            </div>

            <div style={{ gap: 'clamp(0.375rem, 1.5vw, 0.5rem)', display: 'flex', flexDirection: 'column' }}>
              <Label htmlFor="expected-sales" className="font-medium" style={{ 
                color: '#e1e8ed',
                fontSize: 'clamp(0.875rem, 3.5vw, 1rem)'
              }}>
                Monto ($)
              </Label>
              {/* 🤖 [IA] - v1.2.9: Contenedor flex para input y botón confirmar */}
              <div className="flex flex-col sm:flex-row" style={{ gap: 'clamp(0.375rem, 1.5vw, 0.5rem)' }}>
                <div className="relative flex-1" style={{ 
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'clamp(0.375rem, 1.5vw, 0.5rem)',
                  padding: 'clamp(0.25rem, 1vw, 0.375rem)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                }}>
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold" style={{ 
                    color: '#00ba7c',
                    fontSize: 'clamp(1rem, 4vw, 1.125rem)'
                  }}>
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
                    className="font-semibold"
                    style={{ 
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#e1e8ed',
                      paddingLeft: 'clamp(2.25rem, 8vw, 2.5rem)',
                      height: 'clamp(2.5rem, 6vw, 3rem)',
                      fontSize: 'clamp(1rem, 4vw, 1.125rem)'
                    }}
                  />
                </div>
                {/* Botón Confirmar al lado del input */}
                <Button
                  onClick={handleComplete}
                  disabled={!isCompleted}
                  variant={isCompleted ? "ready" : "outline"}
                  size="sm"
                  className="transition-all duration-300 font-medium whitespace-nowrap"
                  style={isCompleted ? {
                    background: 'linear-gradient(135deg, #00ba7c 0%, #008060 100%)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 3px 12px rgba(0, 186, 124, 0.2)',
                    fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
                    fontWeight: '600',
                    borderRadius: 'clamp(0.375rem, 1.5vw, 0.5rem)',
                    height: 'clamp(2.5rem, 6vw, 3rem)',
                    padding: 'clamp(0.75rem, 3vw, 1.5rem)'
                  } : {
                    backgroundColor: '#242424',
                    border: '1px solid #33333350',
                    color: '#4a5568',
                    cursor: 'not-allowed',
                    fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
                    borderRadius: 'clamp(0.375rem, 1.5vw, 0.5rem)',
                    height: 'clamp(2.5rem, 6vw, 3rem)',
                    padding: 'clamp(0.75rem, 3vw, 1.5rem)'
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
                  onMouseDown={(e) => {
                    if (isCompleted) {
                      e.currentTarget.style.transform = 'scale(0.98)';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (isCompleted) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  aria-label="Confirmar venta esperada"
                >
                  <CheckCircle style={{ 
                    width: 'clamp(1rem, 3vw, 1.25rem)',
                    height: 'clamp(1rem, 3vw, 1.25rem)',
                    marginRight: 'clamp(0.375rem, 1.5vw, 0.5rem)'
                  }} />
                  <span>Confirmar</span>
                </Button>
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
                style={{ 
                  border: '1px solid rgba(0, 186, 124, 0.4)',
                  boxShadow: '0 0 15px rgba(0, 186, 124, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  padding: 'clamp(0.75rem, 3vw, 1rem)',
                  borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)'
                }}
              >
                <div className="flex items-center" style={{ gap: 'clamp(0.375rem, 1.5vw, 0.5rem)' }}>
                  <CheckCircle className="flex-shrink-0" style={{ 
                    color: '#00ba7c',
                    width: 'clamp(1rem, 3vw, 1.25rem)',
                    height: 'clamp(1rem, 3vw, 1.25rem)'
                  }} />
                  <span className="font-medium" style={{ 
                    color: '#e1e8ed',
                    fontSize: 'clamp(0.875rem, 3.5vw, 1rem)'
                  }}>
                    Venta esperada: ${parseFloat(wizardData.expectedSales).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}

            <div style={{ 
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(clamp(12px, 4vw, 20px))',
              WebkitBackdropFilter: 'blur(clamp(12px, 4vw, 20px))',
              border: '1px solid rgba(10, 132, 255, 0.4)',
              borderLeft: '3px solid #0a84ff',
              boxShadow: '0 0 15px rgba(10, 132, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              padding: 'clamp(0.75rem, 3vw, 1rem)',
              borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)'
            }}>
              <h4 className="font-semibold" style={{ 
                color: '#0a84ff',
                fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
                marginBottom: 'clamp(0.375rem, 1.5vw, 0.5rem)'
              }}>Resumen de Información:</h4>
              <div style={{ 
                gap: 'clamp(0.125rem, 0.5vw, 0.25rem)',
                display: 'flex',
                flexDirection: 'column',
                fontSize: 'clamp(0.75rem, 3vw, 0.875rem)'
              }}>
                <div className="flex justify-between" style={{ gap: 'clamp(0.375rem, 1.5vw, 0.5rem)' }}>
                  <span className="min-w-0" style={{ color: '#8899a6' }}>Sucursal:</span>
                  <span className="font-medium text-right truncate" style={{ color: '#e1e8ed' }}>
                    {STORES.find(s => s.id === wizardData.selectedStore)?.name}
                  </span>
                </div>
                <div className="flex justify-between" style={{ gap: 'clamp(0.375rem, 1.5vw, 0.5rem)' }}>
                  <span className="min-w-0" style={{ color: '#8899a6' }}>Cajero:</span>
                  <span className="font-medium text-right truncate" style={{ color: '#e1e8ed' }}>
                    {availableEmployees.find(e => e.id === wizardData.selectedCashier)?.name}
                  </span>
                </div>
                <div className="flex justify-between" style={{ gap: 'clamp(0.375rem, 1.5vw, 0.5rem)' }}>
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
        <div style={{ padding: `clamp(16px, ${24 * viewportScale}px, 24px)` }}>
          <DialogHeader>
            <div className="mb-2">
              <span className="text-sm text-muted-foreground">
                Paso {currentStep} de {totalSteps}
              </span>
            </div>
            <DialogTitle className="text-primary mb-2" style={{
              fontSize: `clamp(1.125rem, 5vw, 1.5rem)`
            }}>
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
              
              {/* 🤖 [IA] - v1.2.9: No mostrar botón confirmar en step 5 (ya está junto al input) */}
              {currentStep < totalSteps && (
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
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InitialWizardModal;