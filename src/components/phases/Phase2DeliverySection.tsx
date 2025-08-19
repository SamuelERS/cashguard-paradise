import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, ChevronRight, Check, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DeliveryCalculation } from '@/types/phases';
import { formatCurrency } from '@/utils/calculations';

interface Phase2DeliverySectionProps {
  deliveryCalculation: DeliveryCalculation;
  onStepComplete: (stepKey: string) => void;
  onSectionComplete: () => void;
  completedSteps: Record<string, boolean>;
}

export function Phase2DeliverySection({
  deliveryCalculation,
  onStepComplete,
  onSectionComplete,
  completedSteps
}: Phase2DeliverySectionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  
  const { deliverySteps, amountToDeliver } = deliveryCalculation;
  const currentStep = deliverySteps[currentStepIndex];
  const isLastStep = currentStepIndex === deliverySteps.length - 1;
  const allStepsCompleted = deliverySteps.every(step => completedSteps[step.key]);

  // Auto-advance to next incomplete step
  useEffect(() => {
    const nextIncompleteIndex = deliverySteps.findIndex(step => !completedSteps[step.key]);
    if (nextIncompleteIndex !== -1 && nextIncompleteIndex !== currentStepIndex) {
      setCurrentStepIndex(nextIncompleteIndex);
      setInputValue('');
    }
  }, [completedSteps, deliverySteps, currentStepIndex]);

  // Complete section when all steps are done
  useEffect(() => {
    if (allStepsCompleted && deliverySteps.length > 0) {
      const timer = setTimeout(() => {
        onSectionComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [allStepsCompleted, deliverySteps.length, onSectionComplete]);

  const handleConfirmStep = () => {
    if (!currentStep) return;
    
    const inputNum = parseInt(inputValue) || 0;
    if (inputNum === currentStep.quantity) {
      onStepComplete(currentStep.key);
      setInputValue('');
      
      // Move to next step
      if (!isLastStep) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirmStep();
    }
  };

  if (deliverySteps.length === 0) {
    return (
      <Card className="glass-card border-success/30">
        <CardContent className="text-center py-8">
          <Check className="w-16 h-16 text-success mx-auto mb-4" />
          <h3 className="text-xl font-bold text-success mb-2">
            No hay entrega necesaria
          </h3>
          <p className="text-muted-foreground">
            El total es $50 o menos, no se requiere entrega a gerencia.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="glass-card border-primary/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <UserCheck className="w-6 h-6 text-primary" />
            <CardTitle className="text-primary">👤 TOMAR PARA ENTREGAR</CardTitle>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-primary text-primary">
              Debes Entregar a Gerencia 👆
            </Badge>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Monto Total</p>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(amountToDeliver)}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Progreso de Entrega</span>
            <span className="text-sm text-muted-foreground">
              Paso {Math.min(currentStepIndex + 1, deliverySteps.length)} de {deliverySteps.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${(Object.keys(completedSteps).length / deliverySteps.length) * 100}%` 
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      {currentStep && !completedSteps[currentStep.key] && (
        <Card className="glass-card border-primary/50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-primary">
                  {currentStep.label} × {currentStep.quantity}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Valor total: {formatCurrency(currentStep.quantity * currentStep.value)}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Confirme la cantidad que está tomando:
                </label>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    min="0"
                    max={currentStep.quantity}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Ingrese ${currentStep.quantity}`}
                    className="bg-input/50 border-primary/30 focus:border-primary"
                    autoFocus
                  />
                  <Button
                    onClick={handleConfirmStep}
                    disabled={parseInt(inputValue) !== currentStep.quantity}
                    className="bg-primary hover:bg-primary/90 min-w-[100px]"
                  >
                    Confirmar
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
              
              {parseInt(inputValue) > 0 && parseInt(inputValue) !== currentStep.quantity && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  <p className="text-destructive text-sm">
                    ⚠️ Debe tomar exactamente {currentStep.quantity} {currentStep.label}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Steps Summary */}
      {Object.keys(completedSteps).length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-success text-sm">
              ✓ Denominaciones Confirmadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {deliverySteps.map((step) => (
                <div
                  key={step.key}
                  className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
                    completedSteps[step.key]
                      ? 'bg-success/10 text-success'
                      : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {completedSteps[step.key] ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />
                  )}
                  <span>{step.label} × {step.quantity}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Complete */}
      {allStepsCompleted && (
        <Card className="glass-card border-success/30">
          <CardContent className="text-center py-8">
            <Check className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-bold text-success mb-2">
              Entrega Completada
            </h3>
            <p className="text-muted-foreground mb-4">
              Has tomado {formatCurrency(amountToDeliver)} para entregar a gerencia.
            </p>
            <p className="text-sm font-medium text-primary">
              Procediendo a verificación automáticamente...
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}