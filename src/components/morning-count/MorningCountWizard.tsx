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
  
  // 🤖 [IA] - v1.2.11 - Detección de viewport y escala proporcional
  const viewportScale = typeof window !== 'undefined' ? Math.min(window.innerWidth / 430, 1) : 1;
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6" style={{
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            padding: `clamp(20px, ${28 * viewportScale}px, 28px)`,
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            {/* Header del paso */}
            <div className="flex items-center rounded-lg" style={{
              gap: `clamp(8px, ${12 * viewportScale}px, 12px)`,
              padding: `clamp(14px, ${16 * viewportScale}px, 16px)`,
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <MapPin className="flex-shrink-0" style={{
                width: `clamp(28px, 7vw, 32px)`,
                height: `clamp(28px, 7vw, 32px)`,
                background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold" style={{ 
                  fontSize: `clamp(1rem, 4vw, 1.25rem)`,
                  color: '#e1e8ed' 
                }}>
                  Seleccione la Sucursal
                </h3>
                <p className="mt-1" style={{ 
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: '#8899a6' 
                }}>
                  Donde se realizará el conteo matutino
                </p>
              </div>
            </div>

            {/* Selector de sucursal */}
            <Select value={selectedStore} onValueChange={setSelectedStore}>
              <SelectTrigger 
                className="focus:ring-orange-500/50 focus:ring-offset-0"
                style={{
                  height: `clamp(40px, 10vw, 48px)`,
                  fontSize: `clamp(0.875rem, 3.5vw, 1rem)`,
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
                  padding: `clamp(10px, ${12 * viewportScale}px, 12px)`
                }}
              >
                <div className="flex items-center" style={{ gap: `clamp(6px, ${8 * viewportScale}px, 8px)` }}>
                  <CheckCircle style={{ 
                    width: `clamp(16px, 4vw, 20px)`,
                    height: `clamp(16px, 4vw, 20px)`,
                    color: '#00ba7c' 
                  }} />
                  <span style={{ 
                    fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                    color: '#e1e8ed' 
                  }}>
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
            padding: `clamp(20px, ${28 * viewportScale}px, 28px)`,
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            {/* Header del paso */}
            <div className="flex items-center rounded-lg" style={{
              gap: `clamp(8px, ${12 * viewportScale}px, 12px)`,
              padding: `clamp(14px, ${16 * viewportScale}px, 16px)`,
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <Users className="flex-shrink-0" style={{
                width: `clamp(28px, 7vw, 32px)`,
                height: `clamp(28px, 7vw, 32px)`,
                background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold" style={{ 
                  fontSize: `clamp(1rem, 4vw, 1.25rem)`,
                  color: '#e1e8ed' 
                }}>
                  Cajero Entrante
                </h3>
                <p className="mt-1" style={{ 
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: '#8899a6' 
                }}>
                  Quien realizará el conteo del cambio
                </p>
              </div>
            </div>

            {/* Selector de cajero entrante */}
            <Select value={selectedCashierIn} onValueChange={setSelectedCashierIn}>
              <SelectTrigger 
                className="focus:ring-orange-500/50 focus:ring-offset-0"
                style={{
                  height: `clamp(40px, 10vw, 48px)`,
                  fontSize: `clamp(0.875rem, 3.5vw, 1rem)`,
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
                  padding: `clamp(10px, ${12 * viewportScale}px, 12px)`
                }}
              >
                <div className="flex items-center" style={{ gap: `clamp(6px, ${8 * viewportScale}px, 8px)` }}>
                  <CheckCircle style={{ 
                    width: `clamp(16px, 4vw, 20px)`,
                    height: `clamp(16px, 4vw, 20px)`,
                    color: '#00ba7c' 
                  }} />
                  <span style={{ 
                    fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                    color: '#e1e8ed' 
                  }}>
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
            padding: `clamp(20px, ${28 * viewportScale}px, 28px)`,
            borderRadius: '16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            {/* Header del paso */}
            <div className="flex items-center rounded-lg" style={{
              gap: `clamp(8px, ${12 * viewportScale}px, 12px)`,
              padding: `clamp(14px, ${16 * viewportScale}px, 16px)`,
              backgroundColor: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}>
              <Users className="flex-shrink-0" style={{
                width: `clamp(28px, 7vw, 32px)`,
                height: `clamp(28px, 7vw, 32px)`,
                background: 'linear-gradient(135deg, #ffb84d 0%, #f4a52a 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold" style={{ 
                  fontSize: `clamp(1rem, 4vw, 1.25rem)`,
                  color: '#e1e8ed' 
                }}>
                  Cajero Saliente
                </h3>
                <p className="mt-1" style={{ 
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: '#8899a6' 
                }}>
                  Quien verificará el cambio del turno anterior
                </p>
              </div>
            </div>

            {/* Selector de cajero saliente */}
            <Select value={selectedCashierOut} onValueChange={setSelectedCashierOut}>
              <SelectTrigger 
                className="focus:ring-orange-500/50 focus:ring-offset-0"
                style={{
                  height: `clamp(40px, 10vw, 48px)`,
                  fontSize: `clamp(0.875rem, 3.5vw, 1rem)`,
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
                  padding: `clamp(10px, ${12 * viewportScale}px, 12px)`
                }}
              >
                <div className="flex items-center" style={{ gap: `clamp(6px, ${8 * viewportScale}px, 8px)` }}>
                  {showValidation ? (
                    <>
                      <CheckCircle style={{ 
                    width: `clamp(16px, 4vw, 20px)`,
                    height: `clamp(16px, 4vw, 20px)`,
                    color: '#00ba7c' 
                  }} />
                      <span style={{ 
                    fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                    color: '#e1e8ed' 
                  }}>
                        Cajeros diferentes confirmados
                      </span>
                    </>
                  ) : (
                    <>
                      <X style={{ 
                        width: `clamp(16px, 4vw, 20px)`,
                        height: `clamp(16px, 4vw, 20px)`,
                        color: '#f4212e' 
                      }} />
                      <span style={{ 
                        fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                        color: '#f4212e' 
                      }}>
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
        className="overflow-y-auto overflow-x-hidden p-0 mx-auto [&>button]:hidden"
        style={{
          width: '95vw',
          maxWidth: isMobileDevice ? '95vw' : `clamp(448px, 60vw, 576px)`,
          maxHeight: isMobileDevice ? '90vh' : '85vh',
          backgroundColor: 'rgba(25, 25, 25, 0.65)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
        }}
      >
        <div style={{ padding: `clamp(16px, ${24 * viewportScale}px, 24px)` }}>
          {/* Header del modal */}
          <div className="flex items-center justify-between" style={{ marginBottom: `clamp(20px, ${24 * viewportScale}px, 24px)` }}>
            <div className="flex items-center" style={{ gap: `clamp(8px, ${12 * viewportScale}px, 12px)` }}>
              <Badge 
                variant="outline" 
                style={{
                  padding: `${Math.round(4 * viewportScale)}px ${Math.round(12 * viewportScale)}px`,
                  fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)`,
                  background: 'rgba(244, 165, 42, 0.1)',
                  border: '1px solid rgba(244, 165, 42, 0.3)',
                  color: '#ffb84d'
                }}
              >
                Paso {currentStep} de 3
              </Badge>
              <Sunrise style={{ 
                width: `clamp(20px, 5vw, 24px)`, 
                height: `clamp(20px, 5vw, 24px)`,
                color: '#f4a52a' 
              }} />
              <h2 className="font-bold" style={{ 
                fontSize: `clamp(1.125rem, 4.5vw, 1.25rem)`,
                color: '#e1e8ed' 
              }}>
                Conteo de Caja Matutino
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X style={{ 
                width: `clamp(18px, 4.5vw, 20px)`, 
                height: `clamp(18px, 4.5vw, 20px)` 
              }} />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="relative bg-gray-800 rounded-full overflow-hidden" style={{ 
            height: `clamp(6px, 2vw, 8px)`,
            marginBottom: `clamp(20px, ${24 * viewportScale}px, 24px)` 
          }}>
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
          <div className="flex items-center justify-between" style={{ marginTop: `clamp(28px, ${32 * viewportScale}px, 32px)` }}>
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              style={{ minWidth: `clamp(80px, ${100 * viewportScale}px, 100px)` }}
            >
              Anterior
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!canGoNext()}
                style={{ minWidth: `clamp(80px, ${100 * viewportScale}px, 100px)` }}
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
                style={{ minWidth: `clamp(80px, ${100 * viewportScale}px, 100px)` }}
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