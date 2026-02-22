/**
 * 🤖 [IA] - StoreSelectionForm Component - v1.0.0
 * Extraído de CashCounter.tsx para mejor mantenibilidad
 * 
 * @description
 * Formulario de configuración inicial para selección de sucursal, personal y venta esperada.
 * Incluye validaciones anti-fraude y glass morphism design.
 */
import { motion } from "framer-motion";
import { ArrowLeft, DollarSign, MapPin, Users, Calculator, Sunrise } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OperationMode } from "@/types/operation-mode";
import type { Employee } from "@/types/cash";

interface SelectableStore {
  id: string;
  name: string;
  code?: string;
}

interface StoreSelectionFormProps {
  // State
  stores: SelectableStore[];
  selectedStore: string;
  selectedCashier: string;
  selectedWitness: string;
  expectedSales: string;
  availableEmployees: Employee[];
  loadingEmployees?: boolean;
  employeesError?: string | null;
  canProceedToPhase1: boolean;
  operationMode: OperationMode;
  
  // Handlers
  onStoreChange: (value: string) => void;
  onCashierChange: (value: string) => void;
  onWitnessChange: (value: string) => void;
  onExpectedSalesChange: (value: string) => void;
  onBack?: () => void;
  onStartPhase1: () => void;
}

export function StoreSelectionForm({
  stores,
  selectedStore,
  selectedCashier,
  selectedWitness,
  expectedSales,
  availableEmployees,
  loadingEmployees = false,
  employeesError = null,
  canProceedToPhase1,
  operationMode,
  onStoreChange,
  onCashierChange,
  onWitnessChange,
  onExpectedSalesChange,
  onBack,
  onStartPhase1,
}: StoreSelectionFormProps) {
  // Detectar modo de operación para colores
  const isMorningCount = operationMode === OperationMode.CASH_COUNT;
  const primaryGradient = isMorningCount 
    ? 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)'
    : 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)';
  const IconComponent = isMorningCount ? Sunrise : Calculator;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.23, 1, 0.32, 1],
        staggerChildren: 0.1
      }}
      className="space-y-fluid-md"
    >
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-fluid-xl"
      >
        <div className="flex items-center justify-center gap-fluid-sm mb-fluid-md">
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

      {/* Container principal */}
      <div className="space-y-fluid-md" style={{
        backgroundColor: 'rgba(36, 36, 36, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: 'clamp(1.5rem, 6vw, 2.25rem)',
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
            padding: 'clamp(1rem, 4vw, 1.5rem)'
          }}>
            <div className="flex items-center gap-fluid-sm mb-fluid-lg">
              <MapPin className="w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)]" style={{
                background: primaryGradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <h3 className="text-fluid-xl font-bold" style={{ color: '#e1e8ed' }}>Sucursal</h3>
            </div>
            <Select value={selectedStore} onValueChange={onStoreChange}>
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
                {stores.map((store) => (
                  <SelectItem 
                    key={store.id} 
                    value={store.id}
                    className="hover:bg-white/10 focus:bg-white/15"
                  >
                    <div className="font-medium" style={{ color: '#e1e8ed' }}>{store.name}</div>
                    {store.code ? (
                      <div className="text-sm" style={{ color: '#8899a6' }}>Código: {store.code}</div>
                    ) : null}
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
            padding: 'clamp(1rem, 4vw, 1.5rem)'
          }}>
            <div className="flex items-center gap-fluid-sm mb-fluid-lg">
              <Users className="w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)]" style={{
                background: 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <h3 className="text-fluid-xl font-bold" style={{ color: '#e1e8ed' }}>Personal</h3>
            </div>
            <div className="space-y-fluid-md">
              {/* Cajero */}
              <div>
                <Label htmlFor="cashier" className="text-sm font-medium mb-fluid-sm block" style={{ color: '#8899a6' }}>
                  Cajero/a
                </Label>
                <Select value={selectedCashier} onValueChange={onCashierChange} disabled={!selectedStore}>
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

              {/* Testigo */}
              <div>
                <Label htmlFor="witness" className="text-sm font-medium mb-fluid-sm block" style={{ color: '#8899a6' }}>
                  Testigo
                </Label>
                <Select value={selectedWitness} onValueChange={onWitnessChange} disabled={!selectedStore}>
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
                      .filter((emp) => emp.id !== selectedCashier)
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

              {/* Warning: Cajero = Testigo */}
              {selectedCashier === selectedWitness && selectedCashier && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{
                    backgroundColor: 'rgba(244, 33, 46, 0.1)',
                    border: '1px solid rgba(244, 33, 46, 0.3)',
                    borderRadius: '12px',
                    padding: 'clamp(0.75rem, 3vw, 1.125rem)'
                  }}
                >
                  <p className="text-sm font-medium" style={{ color: '#f4212e' }}>
                    ⚠️ El cajero y el testigo deben ser personas diferentes (protocolo de seguridad)
                  </p>
                </motion.div>
              )}

              {loadingEmployees && (
                <p className="text-xs" style={{ color: '#8899a6' }}>
                  Cargando empleados...
                </p>
              )}

              {!!employeesError && (
                <p className="text-xs" style={{ color: '#f4212e' }}>
                  {employeesError}
                </p>
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
            padding: 'clamp(1rem, 4vw, 1.5rem)'
          }}>
            <div className="flex items-center gap-fluid-sm mb-fluid-lg">
              <DollarSign className="w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)]" style={{
                background: 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <h3 className="text-fluid-xl font-bold" style={{ color: '#e1e8ed' }}>Venta Esperada del Sistema según SICAR</h3>
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
                    onExpectedSalesChange(value);
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

      {/* Botones de navegación */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex gap-fluid-md pt-fluid-md"
      >
        <Button
          onClick={onBack}
          variant="cashcounter-nav-back"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
          Volver
        </Button>
        <Button
          onClick={onStartPhase1}
          disabled={!canProceedToPhase1}
          variant="cashcounter-nav-start"
          data-state={canProceedToPhase1 ? "ready" : "disabled"}
        >
          <span>Iniciar</span>
          <span className="hidden sm:inline ml-1">Fase 1</span>
          <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 flex-shrink-0" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
