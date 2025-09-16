// 🤖 [IA] - v1.2.23: Modal con Wizard v3 - Flujo Guiado con Revelación Progresiva
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { PrimaryActionButton } from '@/components/ui/primary-action-button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Info, Shield, ArrowRight, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useInstructionsFlow } from '@/hooks/useInstructionsFlow';
import { currentCashCutInstructions } from '@/config/flows/cashCutInstructionsFlow';
import { InstructionRule } from '@/components/wizards/InstructionRule';
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 1 archivos CSS están ahora importados globalmente vía index.css:
// - guided-start-button.css

interface GuidedInstructionsModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  isMorningCount?: boolean;
}

export function GuidedInstructionsModal({ 
  isOpen, 
  onConfirm,
  isMorningCount = false 
}: GuidedInstructionsModalProps) {
  const [understood, setUnderstood] = useState(false);
  
  // 🤖 [IA] - v1.2.23: Hook de flujo guiado para instrucciones
  const {
    state: instructionsFlowState,
    initializeFlow,
    acknowledgeInstruction,
    isFlowCompleted,
    getInstructionState,
    canInteractWithInstruction,
    resetFlow
  } = useInstructionsFlow();
  
  // 🤖 [IA] - Sistema de escala proporcional v1.2.12
  const viewportScale = useMemo(() => {
    if (typeof window !== 'undefined') {
      return Math.min(window.innerWidth / 430, 1);
    }
    return 1;
  }, []);
  
  // 🤖 [IA] - Colores dinámicos según el modo - v1.2.12 tonos mate
  const primaryColor = isMorningCount ? '#c78a2c' : '#0a84ff';
  const secondaryColor = isMorningCount ? '#daa250' : '#5e5ce6';
  const gradientBg = isMorningCount 
    ? 'linear-gradient(135deg, #c78a2c 0%, #daa250 100%)'
    : 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)';
  
  const handleConfirm = () => {
    if (isFlowCompleted()) {
      // Guardar en sessionStorage para esta sesión específica
      const sessionKey = `guided-instructions-acknowledged-${Date.now()}`;
      sessionStorage.setItem('guided-instructions-session', sessionKey);
      onConfirm();
    }
  };

  // 🤖 [IA] - v1.2.23: Handler memoizado para acknowledge de instrucciones
  const handleInstructionAcknowledge = useCallback((instructionId: string, index: number) => {
    acknowledgeInstruction(instructionId, index);
  }, [acknowledgeInstruction]);

  // 🤖 [IA] - v1.2.23: Inicialización del flujo cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setUnderstood(false);
      initializeFlow();
    }
  }, [isOpen, initializeFlow]);

  // 🤖 [IA] - v1.2.26: Sincronización eliminada - usar solo isFlowCompleted() como fuente única de verdad

  // 🤖 [IA] - v1.2.23: Las instrucciones ahora vienen de la configuración del flujo

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="w-[95vw] max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto border-0 p-0 [&>button]:hidden"
        style={{
          // 🤖 [IA] - v1.2.13: Glass Morphism consistente con proyecto (40% opacidad)
          backgroundColor: 'rgba(36, 36, 36, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          // 🤖 [IA] - v1.2.13: Sombras duales del sistema (externa + interna)
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header con gradiente - Responsive */}
        <div 
          style={{
            padding: `clamp(16px, ${20 * viewportScale}px, 24px)`,
            paddingBottom: 0,
            background: gradientBg,
            borderRadius: '16px 16px 0 0'
          }}
        >
          <DialogHeader className="text-center">
            <DialogTitle 
              className="font-bold text-white flex items-center justify-center"
              style={{
                fontSize: 'clamp(1.125rem, 4.5vw, 1.375rem)',
                gap: 'clamp(6px, 1.5vw, 8px)'
              }}
            >
              <Shield style={{ width: 'clamp(20px, 5vw, 24px)', height: 'clamp(20px, 5vw, 24px)' }} />
              Instrucciones del Corte de Caja
            </DialogTitle>
            <DialogDescription 
              className="text-white/80"
              style={{
                fontSize: 'clamp(0.813rem, 3.25vw, 0.938rem)',
                marginTop: 'clamp(6px, 1.5vw, 8px)'
              }}
            >
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Contenido - Responsive */}
        <div 
          style={{
            padding: `clamp(16px, ${20 * viewportScale}px, 24px)`,
            gap: `clamp(12px, ${16 * viewportScale}px, 16px)`,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* 🤖 [IA] - v1.2.23: Instrucciones con flujo guiado Wizard v3 */}
          <div className="flex flex-col gap-[clamp(0.75rem,3vw,1rem)]">
            {currentCashCutInstructions.map((instruction, index) => (
              <InstructionRule
                key={instruction.id}
                rule={instruction}
                state={getInstructionState(instruction.id)}
                isCurrent={index === instructionsFlowState.currentRuleIndex}
                onAcknowledge={() => handleInstructionAcknowledge(instruction.id, index)}
              />
            ))}
          </div>

          {/* 🤖 [IA] - v1.2.23: Indicador de progreso del flujo */}
          {isFlowCompleted() && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border-2 border-green-400/60 shadow-lg shadow-green-400/20 p-[clamp(0.75rem,3vw,1rem)] text-center"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
            >
              <div className="flex items-center justify-center gap-[clamp(0.5rem,2vw,0.75rem)]">
                <CheckCircle className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)] text-green-400" />
                <span className="font-semibold text-green-400 text-[clamp(0.875rem,3.5vw,1rem)]">
                  ✓ Todas las Instrucciones Revisadas
                </span>
              </div>
            </motion.div>
          )}

          {/* 🤖 [IA] - v1.2.26: Checkbox de confirmación usando solo isFlowCompleted() como fuente única */}
          <div
            className="rounded-lg flex items-center cursor-pointer"
            style={{
              marginTop: `clamp(16px, ${24 * viewportScale}px, 24px)`,
              padding: `clamp(12px, ${16 * viewportScale}px, 16px)`,
              gap: `clamp(10px, ${12 * viewportScale}px, 12px)`,
              backgroundColor: isFlowCompleted() ? `${primaryColor}11` : 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: isFlowCompleted() ? `2px solid ${primaryColor}44` : '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => isFlowCompleted() && setUnderstood(!understood)}
          >
            <Checkbox
              checked={understood && isFlowCompleted()}
              onCheckedChange={(checked) => isFlowCompleted() && setUnderstood(checked as boolean)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              disabled={!isFlowCompleted()}
              style={{
                borderColor: (understood && isFlowCompleted()) ? primaryColor : 'rgba(255, 255, 255, 0.3)',
                width: `clamp(14px, ${16 * viewportScale}px, 16px)`,
                height: `clamp(14px, ${16 * viewportScale}px, 16px)`
              }}
            />
            <label className="flex-1 cursor-pointer select-none">
              <span
                className="font-medium text-white"
                style={{
                  fontSize: 'clamp(0.813rem, 3.25vw, 0.938rem)'
                }}
              >
                {isFlowCompleted() ? 'Comprendemos y Realizamos las Reglas' : 'Revise todas las instrucciones primero'}
              </span>
              <p
                className="text-gray-400"
                style={{
                  fontSize: 'clamp(0.688rem, 2.75vw, 0.75rem)',
                  marginTop: `clamp(2px, ${4 * viewportScale}px, 4px)`
                }}
              >
                No podremos modificar valores ya confirmados
              </p>
            </label>
          </div>

          {/* 🤖 [IA] - v1.2.26: Botón requiere checkbox marcado además del flujo completado */}
          <PrimaryActionButton
            onClick={handleConfirm}
            disabled={!isFlowCompleted() || !understood}
            className="btn-guided-start"
            data-state={isFlowCompleted() && understood ? "active" : "inactive"}
            data-count-type={isMorningCount ? "morning" : "evening"}
            aria-label="Comenzar conteo guiado"
          >
            <span>
              Comenzar Conteo
              <ArrowRight />
            </span>
          </PrimaryActionButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}