import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building, ChevronRight, Check, Banknote, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DeliveryCalculation } from '@/types/phases';
import { formatCurrency, calculateCashTotal } from '@/utils/calculations';

interface Phase2VerificationSectionProps {
  deliveryCalculation: DeliveryCalculation;
  onStepComplete: (stepKey: string) => void;
  onSectionComplete: () => void;
  completedSteps: Record<string, boolean>;
}

export function Phase2VerificationSection({
  deliveryCalculation,
  onStepComplete,
  onSectionComplete,
  completedSteps
}: Phase2VerificationSectionProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  
  const { verificationSteps, denominationsToKeep } = deliveryCalculation;
  const currentStep = verificationSteps[currentStepIndex];
  const isLastStep = currentStepIndex === verificationSteps.length - 1;
  const allStepsCompleted = verificationSteps.every(step => completedSteps[step.key]);
  const expectedTotal = calculateCashTotal(denominationsToKeep);

  // Auto-advance to next incomplete step
  useEffect(() => {
    const nextIncompleteIndex = verificationSteps.findIndex(step => !completedSteps[step.key]);
    if (nextIncompleteIndex !== -1 && nextIncompleteIndex !== currentStepIndex) {
      setCurrentStepIndex(nextIncompleteIndex);
      setInputValue('');
    }
  }, [completedSteps, verificationSteps, currentStepIndex]);

  // Complete section when all steps are done
  useEffect(() => {
    if (allStepsCompleted && verificationSteps.length > 0) {
      const timer = setTimeout(() => {
        onSectionComplete();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [allStepsCompleted, verificationSteps.length, onSectionComplete]);

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

  if (verificationSteps.length === 0) {
    return (
      <Card className="glass-card border-success/30">
        <CardContent className="text-center py-8">
          <Check className="w-16 h-16 text-success mx-auto mb-4" />
          <h3 className="text-xl font-bold text-success mb-2">
            Verificación Innecesaria
          </h3>
          <p className="text-muted-foreground">
            No hay efectivo que verificar en caja.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="glass-card border-success/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Building className="w-6 h-6 text-success" />
            <CardTitle className="text-success">🏦 VERIFICACIÓN - Debe quedar en caja</CardTitle>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="border-success text-success">
              Debe Quedar en Caja 👆
            </Badge>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Objetivo en Caja</p>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-success" />
                <p className="text-xl font-bold text-success">
                  {formatCurrency(50.00)} ✓
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Progress */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Progreso de Verificación</span>
            <span className="text-sm text-muted-foreground">
              Paso {Math.min(currentStepIndex + 1, verificationSteps.length)} de {verificationSteps.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-success h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${(Object.keys(completedSteps).length / verificationSteps.length) * 100}%` 
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Step */}
      {currentStep && !completedSteps[currentStep.key] && (
        <Card className="glass-card border-success/50 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                <Banknote className="w-6 h-6 text-success" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-success">
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
                  Confirme la cantidad que quedó en caja:
                </label>
                <div className="flex gap-3">
                  <Input
                    type="number"
                    min="0"
                    max={currentStep.quantity}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Debe quedar ${currentStep.quantity}`}
                    className="bg-input/50 border-success/30 focus:border-success"
                    autoFocus
                  />
                  <Button
                    onClick={handleConfirmStep}
                    disabled={parseInt(inputValue) !== currentStep.quantity}
                    className="bg-success hover:bg-success/90 min-w-[100px]"
                  >
                    Confirmar
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
              
              {parseInt(inputValue) > 0 && parseInt(inputValue) !== currentStep.quantity && (
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                  <p className="text-destructive text-sm">
                    ⚠️ Deben quedar exactamente {currentStep.quantity} {currentStep.label} en caja
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
              ✓ Denominaciones Verificadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {verificationSteps.map((step) => (
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

      {/* Final Validation */}
      {allStepsCompleted && (
        <Card className="glass-card border-success/30">
          <CardContent className="text-center py-8">
            <Check className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-bold text-success mb-2">
              Verificación Exitosa
            </h3>
            <p className="text-muted-foreground mb-4">
              Has confirmado que quedan exactamente {formatCurrency(expectedTotal)} en caja.
            </p>
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center gap-2">
                <Target className="w-5 h-5 text-success" />
                <span className="text-success font-bold">
                  OBJETIVO CUMPLIDO: {formatCurrency(50.00)} ✓
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-primary">
              Procediendo a generar reporte final...
            </p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}