// 🤖 [IA] - v1.2.23: Modal con Wizard v3 - Flujo Guiado con Revelación Progresiva
import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { InstructionRule } from '@/components/wizards/InstructionRule';
import { useInstructionFlow } from '@/hooks/instructions/useInstructionFlow';
import { cashCountingInstructions } from '@/data/instructions/cashCountingInstructions';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 1 archivos CSS están ahora importados globalmente vía index.css:
// - guided-start-button.css


interface GuidedInstructionsModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function GuidedInstructionsModal({
  isOpen,
  onConfirm,
  onCancel
}: GuidedInstructionsModalProps) {

  // 🤖 [CTO] v3.1.2 - Instanciación del hook useInstructionFlow
  const { state, startFlow, acknowledgeInstruction, completeInstruction } = useInstructionFlow();

  // 🤖 [IA] - v1.2.24: Estado para modal de confirmación de cancelación (FINAL-POLISH)
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);

  // 🤖 [IA] - v1.2.24: Handler para solicitud de cancelación - abre modal de confirmación
  const handleCancelRequest = useCallback(() => {
    setShowCancelConfirmation(true);
  }, []);

  // 🤖 [IA] - v1.2.24: Handler para cerrar modal de confirmación sin cancelar
  const handleCancelClose = useCallback(() => {
    setShowCancelConfirmation(false);
  }, []);

  // 🤖 [IA] - v1.2.24: Handler para confirmación de cancelación - ejecuta onCancel real
  const handleConfirmedClose = useCallback(() => {
    setShowCancelConfirmation(false);
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // 🤖 [IA] - v1.2.26: Cálculo de progreso memoizado para performance
  const progressValue = useMemo(() => {
    if (state.instructions.length === 0) return 0;
    const completedCount = Object.values(state.instructionStates).filter(s => s === 'checked').length;
    return Math.round((completedCount / state.instructions.length) * 100);
  }, [state.instructionStates, state.instructions.length]);

  // 🤖 [IA] - v1.2.26: FASE 2 - Sistema de colores dinámicos por tipo de instrucción
  const getInstructionColor = useCallback((instruction: any) => {
    switch(instruction.id) {
      case 'confirmation':
        return { border: 'red', text: 'text-red-500' };
      case 'counting':
        return { border: 'blue', text: 'text-blue-400' };
      case 'ordering':
        return { border: 'green', text: 'text-green-400' };
      case 'packaging':
        return { border: 'orange', text: 'text-orange-400' };
      default:
        return { border: 'blue', text: 'text-blue-400' };
    }
  }, []);

  // 🤖 [CTO] v3.1.2 - Iniciar el flujo cuando el componente se monta
  useEffect(() => {
    startFlow(cashCountingInstructions);
  }, [startFlow]);

  // 🎯 FONT ELEMENT PROTECTION - MutationObserver para eliminar elementos <font> en runtime
  useEffect(() => {
    if (!isOpen) return;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // Eliminar elementos <font> directamente
            if (element.tagName === 'FONT') {
              element.remove();
            }
            // Buscar y eliminar elementos <font> anidados
            const fontElements = element.querySelectorAll('font');
            fontElements.forEach(font => font.remove());
          }
        });
      });
    });

    // Observar cambios en el modal cuando está abierto
    const modalContent = document.querySelector('[role="dialog"]');
    if (modalContent) {
      observer.observe(modalContent, {
        childList: true,
        subtree: true
      });
    }

    return () => observer.disconnect();
  }, [isOpen]);

  // 🤖 [CTO] v3.1.2 - Handler simplificado conectado al estado del hook
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="glass-morphism-panel w-[clamp(90vw,95vw,95vw)] max-w-[clamp(300px,90vw,540px)] max-h-[clamp(85vh,90vh,90vh)] overflow-y-auto overflow-x-hidden p-0 [&>button]:hidden"
      >
        <div className="p-fluid-lg space-y-fluid-lg">
          <DialogHeader className="text-center space-y-fluid-md">
            <DialogTitle className="text-primary mb-fluid-md text-[clamp(1.125rem,4.5vw,1.5rem)]">
              Instrucciones del Corte de Caja
            </DialogTitle>
            <DialogDescription className="sr-only">
              Complete las instrucciones para el corte de caja
            </DialogDescription>
          </DialogHeader>

          {/* Progress Bar Section */}
          <div className="mt-fluid-lg mb-fluid-xl">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              />
            </div>
            <div className="flex justify-center mt-fluid-sm">
              <span className="text-xs">
                <span className="text-primary font-medium">Preparación de Conteo</span>
                <span className="text-gray-400"> {progressValue}% completado</span>
              </span>
            </div>
          </div>

          {/* Step Content */}
          <div className="glass-morphism-panel space-y-fluid-lg">
            {/* 🤖 [IA] - v1.2.26: FASE 6 - Mapeo dinámico según nueva interface exacta */}
            <div className="flex flex-col gap-[clamp(0.75rem,3vw,1rem)]">
              {state.instructions.map((instruction, index) => {
                const instructionState = state.instructionStates[instruction.id];
                return (
                  <InstructionRule
                    key={instruction.id}
                    rule={{
                      id: instruction.id,
                      title: instruction.title,
                      subtitle: instruction.description,
                      Icon: Icons[instruction.icon as keyof typeof Icons] as React.ComponentType<any>,
                      colors: getInstructionColor(instruction)
                    }}
                    state={{
                      isChecked: instructionState === 'checked',
                      isBeingReviewed: instructionState === 'reviewing',
                      isEnabled: instructionState === 'enabled',
                      isHidden: instructionState === 'hidden'
                    }}
                    isCurrent={index === state.currentInstructionIndex}
                    onAcknowledge={() => {
                      // 🤖 [IA] - v1.2.26: FASE 2 - Solo trigger inicial, auto-completion automática
                      if (instructionState === 'enabled') {
                        acknowledgeInstruction(instruction.id);
                        // La transición reviewing → checked será automática tras minReviewTimeMs
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* 🤖 [IA] - Footer estándar unificado con InitialWizardModal */}
          <div className="flex items-center justify-center mt-fluid-2xl pt-fluid-xl border-t border-slate-600 gap-fluid-lg">
            <DestructiveActionButton
              onClick={handleCancelRequest}
            >
              Cancelar
            </DestructiveActionButton>
            <ConstructiveActionButton
              onClick={handleConfirm}
              disabled={!state.isFlowComplete}
            >
              Comenzar Conteo
              <ArrowRight className="h-4 w-4 ml-2" />
            </ConstructiveActionButton>
          </div>
        </div>
      </DialogContent>

      {/* 🤖 [IA] - v1.2.24: Modal de confirmación para cancelar - consistente con InitialWizardModal */}
      <ConfirmationModal
        open={showCancelConfirmation}
        onOpenChange={setShowCancelConfirmation}
        title="Cancelar Instrucciones"
        description="Se perderá el progreso de las instrucciones del conteo"
        warningText="Esta acción no se puede deshacer"
        confirmText="Sí, Cancelar"
        cancelText="Continuar"
        onConfirm={handleConfirmedClose}
        onCancel={handleCancelClose}
      />
    </Dialog>
  );
}