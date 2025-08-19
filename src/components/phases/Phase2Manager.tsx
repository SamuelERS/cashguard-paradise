import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phase2DeliverySection } from './Phase2DeliverySection';
import { Phase2VerificationSection } from './Phase2VerificationSection';
import { DeliveryCalculation } from '@/types/phases';
import { formatCurrency } from '@/utils/calculations';

interface Phase2ManagerProps {
  deliveryCalculation: DeliveryCalculation;
  onPhase2Complete: () => void;
  onBack: () => void;
}

export function Phase2Manager({
  deliveryCalculation,
  onPhase2Complete,
  onBack
}: Phase2ManagerProps) {
  const [currentSection, setCurrentSection] = useState<'delivery' | 'verification'>('delivery');
  const [deliveryCompleted, setDeliveryCompleted] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [deliveryProgress, setDeliveryProgress] = useState<Record<string, boolean>>({});
  const [verificationProgress, setVerificationProgress] = useState<Record<string, boolean>>({});

  // Auto-advance to verification when delivery is complete
  useEffect(() => {
    if (deliveryCompleted && currentSection === 'delivery') {
      const timer = setTimeout(() => {
        setCurrentSection('verification');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [deliveryCompleted, currentSection]);

  // Complete phase 2 when verification is done
  useEffect(() => {
    if (verificationCompleted) {
      const timer = setTimeout(() => {
        onPhase2Complete();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [verificationCompleted, onPhase2Complete]);

  const handleDeliveryStepComplete = (stepKey: string) => {
    setDeliveryProgress(prev => ({
      ...prev,
      [stepKey]: true
    }));

    // Check if all delivery steps are complete
    const allDeliveryComplete = deliveryCalculation.deliverySteps.every(
      step => deliveryProgress[step.key] || step.key === stepKey
    );
    
    if (allDeliveryComplete) {
      setDeliveryCompleted(true);
    }
  };

  const handleDeliverySectionComplete = () => {
    setDeliveryCompleted(true);
  };

  const handleVerificationStepComplete = (stepKey: string) => {
    setVerificationProgress(prev => ({
      ...prev,
      [stepKey]: true
    }));

    // Check if all verification steps are complete
    const allVerificationComplete = deliveryCalculation.verificationSteps.every(
      step => verificationProgress[step.key] || step.key === stepKey
    );
    
    if (allVerificationComplete) {
      setVerificationCompleted(true);
    }
  };

  const handleVerificationSectionComplete = () => {
    setVerificationCompleted(true);
  };

  if (deliveryCalculation.amountToDeliver <= 0) {
    // Skip phase 2 entirely
    useEffect(() => {
      onPhase2Complete();
    }, [onPhase2Complete]);
    
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Phase 2 Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-primary mb-2">
          Fase 2: División y Verificación del Efectivo
        </h2>
        <p className="text-muted-foreground">
          Separar {formatCurrency(deliveryCalculation.amountToDeliver)} para gerencia, dejar $50.00 en caja
        </p>
      </motion.div>

      {/* Section Navigation */}
      <Card className="glass-card">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge 
                variant={currentSection === 'delivery' ? 'default' : 'outline'}
                className={currentSection === 'delivery' ? 'bg-primary' : ''}
              >
                2A. Tomar para Entregar
                {deliveryCompleted && ' ✓'}
              </Badge>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Badge 
                variant={currentSection === 'verification' ? 'default' : 'outline'}
                className={currentSection === 'verification' ? 'bg-success' : ''}
              >
                2B. Verificación
                {verificationCompleted && ' ✓'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Sección {currentSection === 'delivery' ? '2A' : '2B'} de 2
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        {currentSection === 'delivery' && (
          <motion.div
            key="delivery"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <Phase2DeliverySection
              deliveryCalculation={deliveryCalculation}
              onStepComplete={handleDeliveryStepComplete}
              onSectionComplete={handleDeliverySectionComplete}
              completedSteps={deliveryProgress}
            />
          </motion.div>
        )}

        {currentSection === 'verification' && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <Phase2VerificationSection
              deliveryCalculation={deliveryCalculation}
              onStepComplete={handleVerificationStepComplete}
              onSectionComplete={handleVerificationSectionComplete}
              completedSteps={verificationProgress}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 border-muted hover:bg-muted/50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Fase 1
        </Button>
        
        {/* Manual section switch (only when delivery is complete) */}
        {deliveryCompleted && currentSection === 'delivery' && !verificationCompleted && (
          <Button
            onClick={() => setCurrentSection('verification')}
            className="flex-1 bg-success hover:bg-success/90"
          >
            Ir a Verificación
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}