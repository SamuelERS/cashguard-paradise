// 🤖 [IA] - v1.0.92 - Wizard con Frosted Glass Premium balanceado
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Users, CheckCircle, Sunrise } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { STORES, getEmployeesByStore } from '@/data/paradise';
import { useTimingConfig } from '@/hooks/useTimingConfig';

interface MorningCountWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    selectedStore: string;
    selectedCashier: string; // Cajero entrante (quien cuenta)
    selectedWitness: string; // Cajero saliente (quien verifica)
    expectedSales: string;
  }) => void;
}

export function MorningCountWizard({ isOpen, onClose, onComplete }: MorningCountWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStore, setSelectedStore] = useState('');
  const [selectedCashierIn, setSelectedCashierIn] = useState(''); // Cajero entrante
  const [selectedCashierOut, setSelectedCashierOut] = useState(''); // Cajero saliente
  const [showValidation, setShowValidation] = useState(false);
  
  const { createTimeoutWithCleanup } = useTimingConfig();

  // Obtener empleados disponibles según la sucursal
  const availableEmployees = selectedStore ? getEmployeesByStore(selectedStore) : [];

  // Validar que los cajeros sean diferentes
  useEffect(() => {
    if (selectedCashierIn && selectedCashierOut) {
      setShowValidation(selectedCashierIn !== selectedCashierOut);
    }
  }, [selectedCashierIn, selectedCashierOut]);

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return selectedStore !== '';
      case 2:
        return selectedCashierIn !== '';
      case 3:
        return selectedCashierOut !== '' && selectedCashierIn !== selectedCashierOut;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
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
            {/* Header del paso */}
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <MapPin className="w-8 h-8 flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg sm:text-xl" style={{ color: '#e1e8ed' }}>
                  Seleccione la Sucursal
                </h3>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>
                  Donde se realizará el conteo matutino
                </p>
              </div>
            </div>

            {/* Selector de sucursal */}
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger 
                className="h-12 text-base focus:ring-orange-500/50 focus:ring-offset-0"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <SelectValue placeholder="Seleccione una sucursal" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'rgba(36, 36, 36, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
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
                style={{
                  background: 'rgba(36, 36, 36, 0.4)',
                  border: '1px solid rgba(0, 186, 124, 0.4)',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" style={{ color: '#00ba7c' }} />
                  <span className="text-sm" style={{ color: '#e1e8ed' }}>
                    Sucursal seleccionada correctamente
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 2:
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
            {/* Header del paso */}
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <Users className="w-8 h-8 flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg sm:text-xl" style={{ color: '#e1e8ed' }}>
                  Cajero Entrante
                </h3>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>
                  Quien realizará el conteo del cambio
                </p>
              </div>
            </div>

            {/* Selector de cajero entrante */}
            <Select value={selectedCashierIn} onValueChange={setSelectedCashierIn}>
              <SelectTrigger 
                className="h-12 text-base focus:ring-orange-500/50 focus:ring-offset-0"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <SelectValue placeholder="Seleccione el cajero que entra" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'rgba(36, 36, 36, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
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
                style={{
                  background: 'rgba(36, 36, 36, 0.4)',
                  border: '1px solid rgba(0, 186, 124, 0.4)',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" style={{ color: '#00ba7c' }} />
                  <span className="text-sm" style={{ color: '#e1e8ed' }}>
                    Cajero entrante seleccionado
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        );

      case 3:
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
            {/* Header del paso */}
            <div className="flex items-center gap-3 p-4 rounded-lg" style={{
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <Users className="w-8 h-8 flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #ffb84d 0%, #f4a52a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg sm:text-xl" style={{ color: '#e1e8ed' }}>
                  Cajero Saliente
                </h3>
                <p className="text-sm mt-1" style={{ color: '#8899a6' }}>
                  Quien verificará el cambio del turno anterior
                </p>
              </div>
            </div>

            {/* Selector de cajero saliente */}
            <Select value={selectedCashierOut} onValueChange={setSelectedCashierOut}>
              <SelectTrigger 
                className="h-12 text-base focus:ring-orange-500/50 focus:ring-offset-0"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
              >
                <SelectValue placeholder="Seleccione el cajero que sale" />
              </SelectTrigger>
              <SelectContent style={{
                backgroundColor: 'rgba(36, 36, 36, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.15)'
              }}>
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
                style={{
                  background: 'rgba(36, 36, 36, 0.4)',
                  border: showValidation 
                    ? '1px solid rgba(0, 186, 124, 0.4)' 
                    : '1px solid rgba(244, 33, 46, 0.4)',
                  borderRadius: '12px',
                  padding: '12px'
                }}
              >
                <div className="flex items-center gap-2">
                  {showValidation ? (
                    <>
                      <CheckCircle className="w-5 h-5" style={{ color: '#00ba7c' }} />
                      <span className="text-sm" style={{ color: '#e1e8ed' }}>
                        Cajeros diferentes confirmados
                      </span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5" style={{ color: '#f4212e' }} />
                      <span className="text-sm" style={{ color: '#f4212e' }}>
                        El cajero saliente debe ser diferente al entrante
                      </span>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </div>
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
          {/* Header del modal */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Badge 
                variant="outline" 
                className="px-3 py-1"
                style={{
                  background: 'rgba(244, 165, 42, 0.1)',
                  border: '1px solid rgba(244, 165, 42, 0.3)',
                  color: '#ffb84d'
                }}
              >
                Paso {currentStep} de 3
              </Badge>
              <Sunrise className="w-6 h-6" style={{ color: '#f4a52a' }} />
              <h2 className="text-xl font-bold" style={{ color: '#e1e8ed' }}>
                Conteo de Caja Matutino
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="relative h-2 bg-gray-800 rounded-full mb-6 overflow-hidden">
            <motion.div
              className="absolute left-0 top-0 h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #f4a52a, #ffb84d)' }}
              initial={{ width: '33%' }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            />
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

          {/* Botones de navegación */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="min-w-[100px]"
            >
              Anterior
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="min-w-[100px]"
                variant={canGoNext() ? 'default' : 'outline'}
                style={canGoNext() ? {
                  background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)'
                } : {}}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleComplete}
                disabled={!canGoNext()}
                className="min-w-[100px]"
                variant={canGoNext() ? 'default' : 'outline'}
                style={canGoNext() ? {
                  background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)'
                } : {}}
              >
                Completar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}