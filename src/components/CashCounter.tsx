// 🤖 [IA] - v1.1.09 - Morning count visual identity with yellow/orange colors
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator, Users, MapPin, DollarSign, Sunrise, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // 🤖 [IA] - v1.2.9: Diálogo de confirmación
import CashCalculation from "@/components/CashCalculation";
import { GuidedProgressIndicator } from "@/components/ui/GuidedProgressIndicator";
import { GuidedCoinSection } from "@/components/cash-counting/GuidedCoinSection";
import { GuidedBillSection } from "@/components/cash-counting/GuidedBillSection";
import { GuidedElectronicInputSection } from "@/components/cash-counting/GuidedElectronicInputSection";
import { TotalsSummarySection } from "@/components/cash-counting/TotalsSummarySection"; // 🤖 [IA] - v1.0.28
import { GuidedInstructionsModal } from "@/components/cash-counting/GuidedInstructionsModal"; // 🤖 [IA] - v1.2.8
import { Phase2Manager } from "@/components/phases/Phase2Manager";
import { FloatingParticles } from "@/components/FloatingParticles"; // 🤖 [IA] - v1.0.64
import { MorningVerification } from "@/components/morning-count/MorningVerification"; // 🤖 [IA] - v1.0.84
import { STORES, EMPLOYEES, getEmployeesByStore } from "@/data/paradise";
import { CashCount, ElectronicPayments, DENOMINATIONS } from "@/types/cash"; // 🤖 [IA] - v1.0.28: Agregado DENOMINATIONS
import { useGuidedCounting } from "@/hooks/useGuidedCounting";
import { usePhaseManager } from "@/hooks/usePhaseManager";
import { useIsMobile } from "@/hooks/useIsMobile"; // 🤖 [IA] - v1.0.46: Hook para detectar móvil
import { toast } from "sonner";
import { useTimingConfig } from "@/hooks/useTimingConfig"; // 🤖 [IA] - Hook de timing unificado v1.0.22
import { OperationMode, OPERATION_MODES } from "@/types/operation-mode"; // 🤖 [IA] - v1.0.81
import { calculateCashTotal } from "@/utils/calculations"; // 🤖 [IA] - v1.0.84

// 🤖 [IA] - v1.0.81 - Props con modo de operación
interface CashCounterProps {
  operationMode?: OperationMode; // 🤖 [IA] - v1.0.81
  initialStore?: string;
  initialCashier?: string;
  initialWitness?: string;
  initialExpectedSales?: string;
  onBack?: () => void;
}

// 🤖 [IA] - v1.0.81 - Glass effect con modo dual
const CashCounter = ({ 
  operationMode = OperationMode.CASH_CUT, // 🤖 [IA] - v1.0.81
  initialStore = "",
  initialCashier = "",
  initialWitness = "",
  initialExpectedSales = "",
  onBack 
}: CashCounterProps) => {
  // 🤖 [IA] - v1.0.81 - Detectar modo de operación
  const isMorningCount = operationMode === OperationMode.CASH_COUNT;
  const modeInfo = OPERATION_MODES[operationMode];
  
  // 🤖 [IA] - v1.1.09 - Colores condicionales según modo de operación
  const primaryGradient = isMorningCount 
    ? 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)'
    : 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)';
  const primaryColor = isMorningCount ? '#f4a52a' : '#0a84ff';
  const secondaryColor = isMorningCount ? '#ffb84d' : '#5e5ce6';
  const IconComponent = isMorningCount ? Sunrise : Calculator;
  
  const [selectedStore, setSelectedStore] = useState(initialStore);
  const [selectedCashier, setSelectedCashier] = useState(initialCashier);
  const [selectedWitness, setSelectedWitness] = useState(initialWitness);
  const [expectedSales, setExpectedSales] = useState(initialExpectedSales);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false); // 🤖 [IA] - v1.2.9: Estado para diálogo de confirmación
  
  // 🤖 [IA] - v1.0.3 - Iniciar directamente si hay datos del wizard
  const hasInitialData = initialStore && initialCashier && initialWitness && initialExpectedSales;
  
  // 🤖 [IA] - v1.2.8: Estado para el modal de instrucciones
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [instructionsAcknowledged, setInstructionsAcknowledged] = useState(false);
  
  // 🤖 [IA] - v1.0.46: Detectar si es dispositivo móvil
  const isMobile = useIsMobile();
  
  // Phase management
  const {
    phaseState,
    deliveryCalculation,
    startPhase1,
    completePhase1,
    completePhase2Verification,
    resetAllPhases
  } = usePhaseManager(operationMode); // 🤖 [IA] - v1.0.82: Pass operation mode
  
  // Guided counting hook (for Phase 1)
  const {
    guidedState,
    currentField,
    progressText,
    instructionText,
    isFieldActive,
    isFieldCompleted,
    isFieldAccessible,
    confirmCurrentField,
    resetGuidedCounting,
    FIELD_ORDER
  } = useGuidedCounting(operationMode); // 🤖 [IA] - v1.0.85: Pass operation mode

  // Cash count state
  const [cashCount, setCashCount] = useState<CashCount>({
    penny: 0,
    nickel: 0,
    dime: 0,
    quarter: 0,
    dollarCoin: 0,
    bill1: 0,
    bill5: 0,
    bill10: 0,
    bill20: 0,
    bill50: 0,
    bill100: 0,
  });

  // Electronic payments state
  const [electronicPayments, setElectronicPayments] = useState<ElectronicPayments>({
    credomatic: 0,
    promerica: 0,
    bankTransfer: 0,
    paypal: 0,
  });

  const { createTimeout, createTimeoutWithCleanup } = useTimingConfig(); // 🤖 [IA] - Usar timing unificado v1.0.22
  const availableEmployees = selectedStore ? getEmployeesByStore(selectedStore) : [];

  // 🤖 [IA] - v1.2.9 - Component-specific PWA scroll prevention
  useEffect(() => {
    // 🚨 FIX: No aplicar scroll blocking en Phase 3 (reportes finales)
    const isPhase3 = phaseState.currentPhase === 3;
    
    // Solo aplicar en PWA mode Y no estar en Phase 3
    if (window.matchMedia('(display-mode: standalone)').matches && !isPhase3) {
      // Guardar estilos originales
      const originalStyles = {
        position: document.body.style.position,
        width: document.body.style.width,
        height: document.body.style.height,
        overflow: document.body.style.overflow,
        overscrollBehavior: document.body.style.overscrollBehavior,
        webkitOverflowScrolling: document.body.style.webkitOverflowScrolling,
        touchAction: document.body.style.touchAction
      };

      // Aplicar estilos para prevenir scroll
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.overscrollBehavior = 'none';
      document.body.style.webkitOverflowScrolling = 'touch';
      document.body.style.touchAction = 'none';

      // Prevenir touchmove
      const handleTouchMove = (e: TouchEvent) => {
        // Solo prevenir si el target no es un elemento scrollable dentro del modal
        const target = e.target as HTMLElement;
        const scrollableContainer = target.closest('.overflow-y-auto, [data-scrollable]');
        if (!scrollableContainer) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchmove', handleTouchMove, { passive: false });

      // Cleanup: restaurar estilos originales y remover event listener
      return () => {
        document.body.style.position = originalStyles.position;
        document.body.style.width = originalStyles.width;
        document.body.style.height = originalStyles.height;
        document.body.style.overflow = originalStyles.overflow;
        document.body.style.overscrollBehavior = originalStyles.overscrollBehavior;
        document.body.style.webkitOverflowScrolling = originalStyles.webkitOverflowScrolling;
        document.body.style.touchAction = originalStyles.touchAction;

        document.removeEventListener('touchmove', handleTouchMove);
      };
    }
  }, [phaseState.currentPhase]); // 🚨 FIX: Dependencia en currentPhase para reactivar cuando cambie

  // 🤖 [IA] - v1.0.3 - Auto-iniciar Fase 1 si viene del wizard
  // 🤖 [IA] - v1.2.8 - Mostrar modal de instrucciones antes de iniciar
  useEffect(() => {
    if (hasInitialData && !phaseState.phase1Completed) {
      // Verificar si ya se mostraron las instrucciones en esta sesión
      const sessionKey = sessionStorage.getItem('guided-instructions-session');
      const currentSession = sessionStorage.getItem('current-counting-session');
      
      if (!sessionKey || sessionKey !== currentSession) {
        // Primera vez en esta sesión, mostrar modal
        setShowInstructionsModal(true);
        sessionStorage.setItem('current-counting-session', `session-${Date.now()}`);
      } else {
        // Ya vio las instrucciones, iniciar directamente
        startPhase1();
        setInstructionsAcknowledged(true);
      }
    }
  }, [hasInitialData]);
  
  // 🤖 [IA] - v1.2.8 - Handler para cuando se confirman las instrucciones
  const handleInstructionsConfirm = () => {
    setShowInstructionsModal(false);
    setInstructionsAcknowledged(true);
    startPhase1();
    const currentSession = sessionStorage.getItem('current-counting-session');
    if (currentSession) {
      sessionStorage.setItem('guided-instructions-session', currentSession);
    }
  };

  // 🤖 [IA] - v1.2.8 - Sistema Ciego Anti-Fraude: Auto-confirmar todos los totales sin mostrar valores
  useEffect(() => {
    // Auto-confirmar totalCash y totalElectronic para mantener sistema ciego
    if ((currentField === 'totalCash' || currentField === 'totalElectronic') && 
        phaseState.currentPhase === 1) {
      // Delay mínimo solo para transición visual suave
      const timer = setTimeout(() => {
        handleGuidedFieldConfirm('0');
      }, 300); // Reducido para flujo más rápido
      return () => clearTimeout(timer);
    }
  }, [currentField, phaseState.currentPhase]);

  const handleCashCountChange = (denomination: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setCashCount(prev => ({
      ...prev,
      [denomination]: numValue
    }));
  };

  const handleGuidedFieldConfirm = (value: string) => {
    // 🤖 [IA] - v1.2.8: Sistema Ciego Anti-Fraude - No mostrar totales durante conteo
    if (currentField === 'totalCash' || currentField === 'totalElectronic') {
      // Auto-avanzar sin mostrar valores para evitar manipulación
      const success = confirmCurrentField(
        '0', // Valor dummy - el sistema calcula internamente
        handleCashCountChange,
        handleElectronicChange,
        electronicPayments,
        cashCount
      );
      
      if (success) {
        // Si es el último campo del corte nocturno, completar Fase 1
        const isLastField = (!isMorningCount && currentField === 'totalElectronic') ||
                           (isMorningCount && currentField === 'totalCash');
        
        if (isLastField) {
          setTimeout(() => {
            handleCompletePhase1();
          }, 100);
        }
      }
      return;
    }
    
    // Flujo normal para otros campos
    const success = confirmCurrentField(
      value,
      handleCashCountChange,
      handleElectronicChange,
      electronicPayments,
      cashCount
    );
    
    if (success) {
      // 🤖 [IA] - v1.0.47: Vibración háptica en móvil para confirmación
      if (isMobile && 'vibrate' in navigator) {
        navigator.vibrate(50); // Vibración suave de 50ms
      }
      
      // 🤖 [IA] - v1.2.7: Eliminados todos los toasts de confirmación individual
      // Solo mantener vibración háptica como feedback principal
    }
  };

  // 🤖 [IA] - v1.0.28: Removido auto-confirm, ahora se maneja con TotalsSummarySection
  // Los totales ahora requieren confirmación manual del usuario para mejor UX
  
  const handleInvalidAccess = () => {
    toast.error("Debe completar el campo actual antes de continuar");
  };

  const handleElectronicChange = (method: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setElectronicPayments(prev => ({
      ...prev,
      [method]: numValue
    }));
  };

  const canProceedToPhase1 = selectedStore && selectedCashier && selectedWitness && 
                            selectedCashier !== selectedWitness && expectedSales;

  const handleCompletePhase1 = () => {
    // 🤖 [IA] - v1.0.84: Calculate locally to avoid async state issues
    const totalCash = calculateCashTotal(cashCount);
    const willSkipPhase2 = isMorningCount || totalCash <= 50;
    
    // Complete Phase 1 and calculate delivery requirements
    completePhase1(cashCount);
    toast.success("✅ Fase 1 completada correctamente");
    
    // 🤖 [IA] - v1.0.84: Use local calculation for accurate messages
    // 🤖 [IA] - v1.2.7: Toast de conteo matutino eliminado
    if (isMorningCount) {
      // Transición directa sin notificación
    } else if (willSkipPhase2) {
      toast.info("💡 Total ≤ $50. Saltando a reporte final.", { duration: 3000 });
    } else {
      toast.info("💰 Procediendo a división del efectivo (Fase 2)", { duration: 3000 });
    }
  };

  const handlePhase2Complete = () => {
    completePhase2Verification();
    toast.success("✅ Fase 2 completada correctamente");
    toast.info("📊 Procediendo a generar reporte final (Fase 3)", { duration: 3000 });
  };

  const handleCompleteCalculation = () => {
    // Reset everything and go back to beginning
    setSelectedStore("");
    setSelectedCashier("");
    setSelectedWitness("");
    setExpectedSales("");
    setCashCount({
      penny: 0, nickel: 0, dime: 0, quarter: 0, dollarCoin: 0,
      bill1: 0, bill5: 0, bill10: 0, bill20: 0, bill50: 0, bill100: 0,
    });
    setElectronicPayments({
      credomatic: 0, promerica: 0, bankTransfer: 0, paypal: 0,
    });
    resetGuidedCounting();
    resetAllPhases();
    
    if (onBack) onBack();
  };

  // 🤖 [IA] - v1.2.9: Función mejorada con reset del diálogo de confirmación
  const handleBackToStart = () => {
    setShowExitConfirmation(false); // Cerrar el diálogo
    resetGuidedCounting();
    resetAllPhases();
    if (onBack) onBack();
  };

  const renderStoreSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.23, 1, 0.32, 1],
        staggerChildren: 0.1
      }}
      className="space-y-4"
    >
      {/* 🤖 [IA] - v1.0.64 - Header con glass effect premium */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <IconComponent className="w-10 h-10" style={{
            background: primaryGradient,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }} />
          <h2 className="text-2xl font-bold" style={{ color: '#e1e8ed' }}>
            Configuración Inicial
          </h2>
        </div>
        <p className="text-base" style={{ color: '#8899a6' }}>
          Seleccione la sucursal y el personal para iniciar el conteo
        </p>
      </motion.div>

      {/* 🤖 [IA] - v1.0.64 - Container principal con glass effect */}
      <div className="space-y-4" style={{ 
        backgroundColor: 'rgba(36, 36, 36, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '28px',
        borderRadius: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}>
        {/* Sucursal Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
        >
          <div className="glass-card" style={{
            backgroundColor: 'rgba(36, 36, 36, 0.3)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-8 h-8" style={{
                background: primaryGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <h3 className="text-xl font-bold" style={{ color: '#e1e8ed' }}>Sucursal</h3>
            </div>
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger className="h-12" style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: '#e1e8ed'
              }}>
                <SelectValue placeholder="Seleccione una sucursal" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'rgba(36, 36, 36, 0.95)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
                {STORES.map((store) => (
                  <SelectItem 
                    key={store.id} 
                    value={store.id}
                    className="hover:bg-white/10 focus:bg-white/15"
                  >
                    <div className="font-medium" style={{ color: '#e1e8ed' }}>{store.name}</div>
                    <div className="text-sm" style={{ color: '#8899a6' }}>{store.address}</div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Personal Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        >
          <div className="glass-card" style={{
            backgroundColor: 'rgba(36, 36, 36, 0.3)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8" style={{
                background: 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <h3 className="text-xl font-bold" style={{ color: '#e1e8ed' }}>Personal</h3>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="cashier" className="text-sm font-medium mb-3 block" style={{ color: '#8899a6' }}>
                  Cajero/a
                </Label>
                <Select value={selectedCashier} onValueChange={setSelectedCashier} disabled={!selectedStore}>
                  <SelectTrigger className="h-12" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#e1e8ed',
                    opacity: !selectedStore ? '0.5' : '1'
                  }}>
                    <SelectValue placeholder="Seleccione el cajero" />
                  </SelectTrigger>
                  <SelectContent style={{
                    backgroundColor: 'rgba(36, 36, 36, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    {availableEmployees.map((employee) => (
                      <SelectItem 
                        key={employee.id} 
                        value={employee.id}
                        className="hover:bg-white/10 focus:bg-white/15"
                      >
                        <div className="font-medium" style={{ color: '#e1e8ed' }}>{employee.name}</div>
                        <div className="text-sm" style={{ color: '#8899a6' }}>{employee.role}</div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="witness" className="text-sm font-medium mb-3 block" style={{ color: '#8899a6' }}>
                  Testigo
                </Label>
                <Select value={selectedWitness} onValueChange={setSelectedWitness} disabled={!selectedStore}>
                  <SelectTrigger className="h-12" style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#e1e8ed',
                    opacity: !selectedStore ? '0.5' : '1'
                  }}>
                    <SelectValue placeholder="Seleccione el testigo" />
                  </SelectTrigger>
                  <SelectContent style={{
                    backgroundColor: 'rgba(36, 36, 36, 0.95)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)'
                  }}>
                    {availableEmployees
                      .filter(emp => emp.id !== selectedCashier)
                      .map((employee) => (
                        <SelectItem 
                          key={employee.id} 
                          value={employee.id}
                          className="hover:bg-white/10 focus:bg-white/15"
                        >
                          <div className="font-medium" style={{ color: '#e1e8ed' }}>{employee.name}</div>
                          <div className="text-sm" style={{ color: '#8899a6' }}>{employee.role}</div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedCashier === selectedWitness && selectedCashier && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{
                    backgroundColor: 'rgba(244, 33, 46, 0.1)',
                    border: '1px solid rgba(244, 33, 46, 0.3)',
                    borderRadius: '12px',
                    padding: '16px'
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: '#f4212e' }}>
                    ⚠️ El cajero y el testigo deben ser personas diferentes (protocolo anti-fraude)
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Venta Esperada Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
        >
          <div className="glass-card" style={{
            backgroundColor: 'rgba(36, 36, 36, 0.3)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '24px'
          }}>
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="w-8 h-8" style={{
                background: 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <h3 className="text-xl font-bold" style={{ color: '#e1e8ed' }}>Venta Esperada del Sistema según SICAR</h3>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-medium z-10" style={{ color: '#00ba7c' }}>$</span>
              <Input
                type="text"
                inputMode="decimal"
                pattern="[0-9]*\.?[0-9]*"
                value={expectedSales}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
                    setExpectedSales(value);
                  }
                }}
                placeholder="0.00"
                className="pl-8 h-12"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#e1e8ed'
                }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Botones de navegación - 🤖 [IA] - v1.2.5: Texto responsivo */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex gap-4 pt-4"
      >
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 h-11 text-xs sm:text-sm px-3 sm:px-4 flex items-center justify-center whitespace-nowrap"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#e1e8ed'
          }}
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          Volver
        </Button>
        <Button
          onClick={startPhase1}
          disabled={!canProceedToPhase1}
          className="flex-1 h-11 text-xs sm:text-sm px-3 sm:px-4 flex items-center justify-center whitespace-nowrap"
          variant={canProceedToPhase1 ? "ready" : "outline"}
          style={canProceedToPhase1 ? {
            background: 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)',
            border: 'none',
            color: 'white'
          } : {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            color: '#8899a6'
          }}
        >
          <span>Iniciar</span>
          <span className="hidden sm:inline ml-1">Fase 1</span>
          <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 flex-shrink-0" />
        </Button>
      </motion.div>
    </motion.div>
  );

  const renderPhase1 = () => {
    // 🤖 [IA] - v1.0.48: Construir lista global de campos completados para resumen permanente
    const globalCompletedFields = [
      // Monedas completadas
      ...Object.entries(DENOMINATIONS.COINS)
        .filter(([key]) => isFieldCompleted(key))
        .map(([key, denomination]) => ({
          name: denomination.name,
          quantity: cashCount[key as keyof CashCount] as number,
          total: (cashCount[key as keyof CashCount] as number) * denomination.value,
          type: 'coin' as const
        })),
      // Billetes completados
      ...Object.entries(DENOMINATIONS.BILLS)
        .filter(([key]) => isFieldCompleted(key))
        .map(([key, denomination]) => ({
          name: denomination.name,
          quantity: cashCount[key as keyof CashCount] as number,
          total: (cashCount[key as keyof CashCount] as number) * denomination.value,
          type: 'bill' as const
        })),
      // Pagos electrónicos completados
      ...(['credomatic', 'promerica', 'bankTransfer', 'paypal'] as const)
        .filter(key => isFieldCompleted(key))
        .map(key => ({
          name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
          quantity: 1,
          total: electronicPayments[key],
          type: 'electronic' as const
        }))
    ];

    // 🤖 [IA] - v1.2.11 - Detección de viewport y escala proporcional
    const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;
    const viewportScale = typeof window !== 'undefined' ? Math.min(window.innerWidth / 430, 1) : 1; // 430px = iPhone 16 Pro Max base

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 max-w-md mx-auto sm:max-w-2xl lg:max-w-4xl"
      >
        {/* 🤖 [IA] - v1.2.14 - Container principal con sistema de diseño coherente */}
        <div className="cash-counter-container space-y-4">
          {/* 🤖 [IA] - v1.2.14 - Header con sistema de diseño coherente */}
          <div className="cash-counter-header">
            <div className="cash-counter-title">
              <IconComponent className="cash-counter-icon" style={{
                background: primaryGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <h2>Fase 1: Conteo Inicial</h2>
            </div>
          </div>

          {/* 🤖 [IA] - v1.2.14 - Área de contenido con sistema coherente */}
          <div className="cash-counter-content" style={{
            minHeight: isMobileDevice ? '0' : 'clamp(150px, 30vh, 200px)',
            maxHeight: isMobileDevice ? 'none' : 'calc(90vh - 120px)',
            overflowY: isMobileDevice ? 'visible' : 'auto'
          }}>
            {/* Guided Progress Indicator - 🤖 [IA] - v1.2.14: Sistema coherente */}
            <div>
              <GuidedProgressIndicator
                currentStep={guidedState.currentStep}
                totalSteps={guidedState.totalSteps}
                currentFieldLabel={currentField}
                instructionText={instructionText}
                isCompleted={guidedState.isCompleted}
                isMorningCount={isMorningCount}
              />
            </div>

            {/* 🤖 [IA] - v1.0.95: Vista guiada unificada - Solo mostrar sección activa en todas las plataformas */}
            <div className="space-y-4">
            {/* Coins Section - Solo si hay algún campo de moneda activo */}
            {FIELD_ORDER.slice(0, 5).some(field => isFieldActive(field)) && (
              <GuidedCoinSection
                cashCount={cashCount}
                isFieldActive={isFieldActive}
                isFieldCompleted={isFieldCompleted}
                isFieldAccessible={isFieldAccessible}
                onFieldConfirm={handleGuidedFieldConfirm}
                onAttemptAccess={handleInvalidAccess}
                isMorningCount={isMorningCount}
              />
            )}
            
            {/* Bills Section - Solo si hay algún campo de billete activo */}
            {FIELD_ORDER.slice(5, 11).some(field => isFieldActive(field)) && (
              <GuidedBillSection
                cashCount={cashCount}
                isFieldActive={isFieldActive}
                isFieldCompleted={isFieldCompleted}
                isFieldAccessible={isFieldAccessible}
                onFieldConfirm={handleGuidedFieldConfirm}
                onAttemptAccess={handleInvalidAccess}
                isMorningCount={isMorningCount}
              />
            )}
            
            {/* Electronic Input Section - Solo si hay algún campo electrónico activo y NO es conteo matutino */}
            {!isMorningCount && FIELD_ORDER.slice(11, 15).some(field => isFieldActive(field)) && (
              <GuidedElectronicInputSection
                electronicPayments={electronicPayments}
                cashCount={cashCount} // 🤖 [IA] - v1.0.48: Agregado para resumen completo
                isFieldActive={isFieldActive}
                isFieldCompleted={isFieldCompleted}
                isFieldAccessible={isFieldAccessible}
                onFieldConfirm={handleGuidedFieldConfirm}
                onAttemptAccess={handleInvalidAccess}
              />
            )}
            
            {/* 🤖 [IA] - v1.2.8: TotalsSummarySection ELIMINADO - Sistema Ciego Anti-Fraude
                Los totales NUNCA se muestran durante el conteo para evitar manipulación.
                El cajero no debe saber cuánto dinero va sumando hasta completar TODO el proceso.
                Esto previene ajustes mentales y manipulación de últimas denominaciones.
            */}
            </div>
          </div>

          {/* Botones de navegación - 🤖 [IA] - v1.2.14: Sistema de diseño coherente */}
          <div className="cash-counter-navigation flex justify-center lg:max-w-lg lg:mx-auto">
            <Button
              onClick={() => setShowExitConfirmation(true)}
              variant="outline"
              className="cash-counter-nav-button"
            >
              <ArrowLeft className="cash-counter-nav-icon" />
              <span>Volver</span>
              <span className="hidden sm:inline ml-1">a Inicio</span>
            </Button>
          </div>

          {/* 🤖 [IA] - v1.2.14: AlertDialog con sistema de diseño coherente */}
          <AlertDialog open={showExitConfirmation} onOpenChange={setShowExitConfirmation}>
            <AlertDialogContent className="cash-counter-alert-dialog !border-0">
              <AlertDialogHeader className="flex flex-col space-y-2 text-center sm:text-left">
                <AlertDialogTitle className="cash-counter-alert-title">
                  ⚠️ ¿Confirmar salida?
                </AlertDialogTitle>
                <AlertDialogDescription className="cash-counter-alert-description">
                  Se perderá todo el progreso del conteo actual. 
                  <br />
                  <span className="cash-counter-alert-warning">
                    Esta acción no se puede deshacer.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="cash-counter-alert-footer">
                <AlertDialogAction 
                  onClick={handleBackToStart}
                  className="cash-counter-alert-action"
                >
                  Sí, volver al inicio
                </AlertDialogAction>
                <AlertDialogCancel className="cash-counter-alert-cancel">
                  Cancelar
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

        </div>
    </motion.div>
  );
  };

  const renderPhase2 = () => (
    <Phase2Manager
      deliveryCalculation={deliveryCalculation}
      onPhase2Complete={handlePhase2Complete}
      onBack={handleBackToStart}
    />
  );

  // Phase 3: Final Report Generation
  if (phaseState.currentPhase === 3) {
    // 🤖 [IA] - v1.0.84: Use appropriate component based on operation mode
    if (isMorningCount) {
      return (
        <MorningVerification
          storeId={selectedStore}
          cashierId={selectedCashier}
          witnessId={selectedWitness}
          cashCount={cashCount}
          onBack={handleBackToStart}
          onComplete={handleCompleteCalculation}
        />
      );
    }
    
    return (
      <CashCalculation
        storeId={selectedStore}
        cashierId={selectedCashier}
        witnessId={selectedWitness}
        expectedSales={parseFloat(expectedSales)}
        cashCount={cashCount}
        electronicPayments={electronicPayments}
        deliveryCalculation={deliveryCalculation}
        phaseState={phaseState}
        onComplete={handleCompleteCalculation}
      />
    );
  }

  return (
    <>
      <div className="fixed inset-0 overflow-hidden flex items-center justify-center"
           style={{ touchAction: 'none', overscrollBehavior: 'none', WebkitOverflowScrolling: 'touch' }}>
        <FloatingParticles />
        
        <div className="relative z-10 container mx-auto px-4 py-2 max-w-4xl">
          {/* 🤖 [IA] - v1.0.3 - Saltar selección si viene del wizard */}
          {phaseState.currentPhase === 1 && !phaseState.phase1Completed && !hasInitialData && renderStoreSelection()}
          {phaseState.currentPhase === 1 && phaseState.phase1Completed && renderPhase1()}
          {phaseState.currentPhase === 2 && renderPhase2()}
        </div>
      </div>
      
      {/* 🤖 [IA] - v1.2.12 - Modal fuera del contenedor principal para evitar conflictos aria-hidden */}
      <GuidedInstructionsModal
        isOpen={showInstructionsModal}
        onConfirm={handleInstructionsConfirm}
        isMorningCount={isMorningCount}
      />
    </>
  );
};

export default CashCounter;