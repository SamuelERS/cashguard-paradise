import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calculator, Users, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloatingOrbs } from "@/components/FloatingOrbs";
import CashCalculation from "@/components/CashCalculation";
import { GuidedProgressIndicator } from "@/components/ui/GuidedProgressIndicator";
import { GuidedCoinSection } from "@/components/cash-counting/GuidedCoinSection";
import { GuidedBillSection } from "@/components/cash-counting/GuidedBillSection";
import { GuidedElectronicInputSection } from "@/components/cash-counting/GuidedElectronicInputSection";
import { Phase2Manager } from "@/components/phases/Phase2Manager";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { STORES, EMPLOYEES, getEmployeesByStore } from "@/data/paradise";
import { CashCount, ElectronicPayments } from "@/types/cash";
import { useGuidedCounting } from "@/hooks/useGuidedCounting";
import { usePhaseManager } from "@/hooks/usePhaseManager";
import { toast } from "sonner";

interface CashCounterProps {
  onBack?: () => void;
}

const CashCounter = ({ onBack }: CashCounterProps) => {
  const [selectedStore, setSelectedStore] = useState("");
  const [selectedCashier, setSelectedCashier] = useState("");
  const [selectedWitness, setSelectedWitness] = useState("");
  const [expectedSales, setExpectedSales] = useState("");
  
  // Phase management
  const {
    phaseState,
    deliveryCalculation,
    startPhase1,
    completePhase1,
    completePhase2Verification,
    resetAllPhases
  } = usePhaseManager();
  
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
  } = useGuidedCounting();

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

  const availableEmployees = selectedStore ? getEmployeesByStore(selectedStore) : [];

  const handleCashCountChange = (denomination: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setCashCount(prev => ({
      ...prev,
      [denomination]: numValue
    }));
  };

  const handleGuidedFieldConfirm = (value: string) => {
    const success = confirmCurrentField(
      value,
      handleCashCountChange,
      handleElectronicChange,
      electronicPayments,
      cashCount
    );
    
    if (success) {
      // Show special message when transitioning to electronic payments
      if (currentField === 'bill100') {
        toast.success(`✓ ${currentField} confirmado: ${value}`);
        setTimeout(() => {
          toast.info('💳 Ahora ingrese MONTOS en dólares para pagos electrónicos', {
            duration: 4000,
          });
        }, 500);
      } else {
        const isElectronic = ['credomatic', 'promerica', 'bankTransfer', 'paypal'].includes(currentField);
        toast.success(`✓ ${currentField} confirmado: ${isElectronic ? '$' + value : value}`);
      }
    }
  };

  // Auto-confirm total fields when they become active
  useEffect(() => {
    if (currentField === 'totalCash' || currentField === 'totalElectronic') {
      const timer = setTimeout(() => {
        handleGuidedFieldConfirm('0'); // Value doesn't matter for auto-calculated fields
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentField]);
  
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
    // Complete Phase 1 and calculate delivery requirements
    completePhase1(cashCount);
    toast.success("✅ Fase 1 completada correctamente");
    
    if (phaseState.shouldSkipPhase2) {
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

  const renderStoreSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.23, 1, 0.32, 1],
        staggerChildren: 0.1
      }}
      className="space-y-6"
    >
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent mb-2">
          Paso 1: Información Inicial
        </h2>
        <p className="text-muted-foreground/80">Seleccione la sucursal y el personal</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
      >
        <GlassCard hover glow className="overflow-hidden">
          <div className="p-6 relative">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="p-2 rounded-full bg-primary/20 border border-primary/30"
              >
                <MapPin className="w-6 h-6 text-primary" />
              </motion.div>
              <h3 className="text-xl font-bold text-primary">Sucursal</h3>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="space-y-4"
            >
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger className={`
                  glass-input transition-all duration-300 group
                  ${selectedStore ? 'border-primary/50 bg-primary/5 shadow-glow-primary' : 'border-primary/30'}
                  hover:border-primary/60 hover:shadow-md hover:shadow-primary/20
                `}>
                  <SelectValue placeholder="Seleccione una sucursal" />
                </SelectTrigger>
                <SelectContent className="glass-dropdown">
                  {STORES.map((store, index) => (
                    <SelectItem 
                      key={store.id} 
                      value={store.id}
                      className="hover:bg-primary/10 focus:bg-primary/15 transition-colors duration-200"
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05, duration: 0.3 }}
                      >
                        <div className="font-medium">{store.name}</div>
                        <div className="text-sm text-muted-foreground/70">{store.address}</div>
                      </motion.div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
      >
        <GlassCard hover glow className="overflow-hidden">
          <div className="p-6 relative">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="p-2 rounded-full bg-secondary/20 border border-secondary/30"
              >
                <Users className="w-6 h-6 text-secondary" />
              </motion.div>
              <h3 className="text-xl font-bold text-secondary">Personal</h3>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="space-y-6"
            >
              <div>
                <Label htmlFor="cashier" className="text-sm font-medium mb-3 block text-foreground/90">
                  Cajero/a
                </Label>
                <Select value={selectedCashier} onValueChange={setSelectedCashier} disabled={!selectedStore}>
                  <SelectTrigger className={`
                    glass-input transition-all duration-300
                    ${!selectedStore ? 'opacity-50 cursor-not-allowed' : ''}
                    ${selectedCashier ? 'border-secondary/50 bg-secondary/5 shadow-glow-secondary' : 'border-secondary/30'}
                    hover:border-secondary/60 hover:shadow-md hover:shadow-secondary/20
                  `}>
                    <SelectValue placeholder="Seleccione el cajero" />
                  </SelectTrigger>
                  <SelectContent className="glass-dropdown">
                    {availableEmployees.map((employee, index) => (
                      <SelectItem 
                        key={employee.id} 
                        value={employee.id}
                        className="hover:bg-secondary/10 focus:bg-secondary/15 transition-colors duration-200"
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                          <div className="font-medium">{employee.name}</div>
                          <div className="text-sm text-muted-foreground/70">{employee.role}</div>
                        </motion.div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="witness" className="text-sm font-medium mb-3 block text-foreground/90">
                  Testigo
                </Label>
                <Select value={selectedWitness} onValueChange={setSelectedWitness} disabled={!selectedStore}>
                  <SelectTrigger className={`
                    glass-input transition-all duration-300
                    ${!selectedStore ? 'opacity-50 cursor-not-allowed' : ''}
                    ${selectedWitness ? 'border-accent/50 bg-accent/5 shadow-glow-accent' : 'border-accent/30'}
                    hover:border-accent/60 hover:shadow-md hover:shadow-accent/20
                  `}>
                    <SelectValue placeholder="Seleccione el testigo" />
                  </SelectTrigger>
                  <SelectContent className="glass-dropdown">
                    {availableEmployees
                      .filter(emp => emp.id !== selectedCashier)
                      .map((employee, index) => (
                        <SelectItem 
                          key={employee.id} 
                          value={employee.id}
                          className="hover:bg-accent/10 focus:bg-accent/15 transition-colors duration-200"
                        >
                          <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.3 }}
                          >
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-muted-foreground/70">{employee.role}</div>
                          </motion.div>
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
                  className="glass-card-warning p-4 rounded-xl border border-destructive/30 bg-destructive/5"
                >
                  <p className="text-destructive text-sm font-medium">
                    ⚠️ El cajero y el testigo deben ser personas diferentes (protocolo anti-fraude)
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }}
      >
        <GlassCard hover glow className="overflow-hidden">
          <div className="p-6 relative">
            <div className="flex items-center gap-3 mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.4 }}
                className="p-2 rounded-full bg-success/20 border border-success/30"
              >
                <DollarSign className="w-6 h-6 text-success" />
              </motion.div>
              <h3 className="text-xl font-bold text-success">Venta Esperada del Sistema</h3>
            </div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="relative"
            >
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-success/70 font-medium z-10">$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={expectedSales}
                onChange={(e) => setExpectedSales(e.target.value)}
                placeholder="0.00"
                className={`
                  pl-8 glass-input transition-all duration-300
                  ${expectedSales ? 'border-success/50 bg-success/5 shadow-glow-success' : 'border-success/30'}
                  focus:border-success/70 focus:shadow-lg focus:shadow-success/25
                `}
              />
            </motion.div>
          </div>
        </GlassCard>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex gap-4 pt-4"
      >
        <AnimatedButton
          onClick={onBack}
          variant="glass"
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </AnimatedButton>
        <AnimatedButton
          onClick={startPhase1}
          disabled={!canProceedToPhase1}
          variant="primary"
          glow
          className="flex-1"
        >
          Iniciar Fase 1: Conteo
          <DollarSign className="w-4 h-4 ml-2" />
        </AnimatedButton>
      </motion.div>
    </motion.div>
  );

  const renderPhase1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary mb-2">
          Fase 1: Conteo Inicial Obligatorio
        </h2>
        <p className="text-muted-foreground">
          Complete cada denominación en orden secuencial (13 pasos)
        </p>
      </div>

      {/* Guided Progress Indicator */}
      <GuidedProgressIndicator
        currentStep={guidedState.currentStep}
        totalSteps={guidedState.totalSteps}
        currentFieldLabel={currentField}
        instructionText={instructionText}
        isCompleted={guidedState.isCompleted}
      />

      {/* Coins Section - Always visible during guided counting */}
      <div className="space-y-6">
        <GuidedCoinSection
          cashCount={cashCount}
          isFieldActive={isFieldActive}
          isFieldCompleted={isFieldCompleted}
          isFieldAccessible={isFieldAccessible}
          onFieldConfirm={handleGuidedFieldConfirm}
          onAttemptAccess={handleInvalidAccess}
        />
        
        {/* Bills Section - Always visible during guided counting */}
        <GuidedBillSection
          cashCount={cashCount}
          isFieldActive={isFieldActive}
          isFieldCompleted={isFieldCompleted}
          isFieldAccessible={isFieldAccessible}
          onFieldConfirm={handleGuidedFieldConfirm}
          onAttemptAccess={handleInvalidAccess}
        />
        
        {/* Electronic Input Section - Shows when electronic payment fields are active or completed */}
        {FIELD_ORDER.slice(11, 15).some(field => isFieldActive(field) || isFieldCompleted(field) || isFieldAccessible(field)) && (
          <GuidedElectronicInputSection
            electronicPayments={electronicPayments}
            isFieldActive={isFieldActive}
            isFieldCompleted={isFieldCompleted}
            isFieldAccessible={isFieldAccessible}
            onFieldConfirm={handleGuidedFieldConfirm}
            onAttemptAccess={handleInvalidAccess}
          />
        )}
      </div>

      <div className="flex gap-3">
        <AnimatedButton
          onClick={() => resetAllPhases()}
          variant="glass"
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Inicio
        </AnimatedButton>
        <AnimatedButton
          onClick={handleCompletePhase1}
          variant="primary"
          glow
          className="flex-1"
          disabled={!guidedState.isCompleted}
        >
          <Calculator className="w-4 h-4 mr-2" />
          Completar Fase 1
        </AnimatedButton>
      </div>
    </motion.div>
  );

  const renderPhase2 = () => (
    <Phase2Manager
      deliveryCalculation={deliveryCalculation}
      onPhase2Complete={handlePhase2Complete}
      onBack={() => resetAllPhases()}
    />
  );

  // Phase 3: Final Report Generation
  if (phaseState.currentPhase === 3) {
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
        onBack={() => resetAllPhases()}
        onComplete={handleCompleteCalculation}
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingOrbs />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        {phaseState.currentPhase === 1 && !phaseState.phase1Completed && renderStoreSelection()}
        {phaseState.currentPhase === 1 && phaseState.phase1Completed && renderPhase1()}
        {phaseState.currentPhase === 2 && renderPhase2()}
      </div>
    </div>
  );
};

export default CashCounter;