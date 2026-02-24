// 🤖 [IA] - v1.2.23: Modal con Wizard v3 - Flujo Guiado con Revelación Progresiva
// 🤖 [IA] - v1.2.41V: Colores Azul Unificado + Título Responsive (coherencia total con ProtocolRule)
import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { ArrowRight, X, CheckCircle, Receipt, PackagePlus } from 'lucide-react'; // 🤖 [IA] - v1.2.41U: CheckCircle verde (removido DestructiveActionButton + ShieldOff)
import { InstructionRule } from '@/components/wizards/InstructionRule';
import { useInstructionFlow } from '@/hooks/instructions/useInstructionFlow';
import { cashCountingInstructions } from '@/data/instructions/cashCountingInstructions';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';

// 🤖 [IA] - FASE 5: Mapa estático de íconos → habilita tree-shaking de lucide-react
const ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  Receipt,
  PackagePlus,
};
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

  // 🤖 [IA] - v1.2.41V: Azul unificado para coherencia total con ProtocolRule (InitialWizardModal)
  const getInstructionColor = useCallback((instruction: { id: string }) => {
    // Sistema de colores unificado: Azul (enabled) → Naranja (reviewing) → Verde (checked)
    return { border: 'blue', text: 'text-blue-400' };
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
        className="glass-morphism-panel wizard-dialog-content max-h-[clamp(85vh,90vh,90vh)] overflow-y-auto overflow-x-hidden p-0 [&>button]:hidden"
      >
        {/* 🤖 [IA] - v1.2.41V: DialogTitle/Description solo para accesibilidad */}
        <DialogTitle className="sr-only">
          Instrucciones de Conteo
        </DialogTitle>
        <DialogDescription className="sr-only">
          Complete las instrucciones antes de iniciar el conteo de caja
        </DialogDescription>

        <div className="p-fluid-lg space-y-fluid-lg">
          {/* 🤖 [IA] - v1.2.41U: Header estilo MorningCount/InitialWizard - CheckCircle verde + título + botón X */}
          {/* 🤖 [IA] - v1.2.41AB: Subtítulo agregado para coherencia con otros modales */}
          <div className="flex items-center justify-between mb-fluid-md">
            <div className="flex items-center gap-fluid-md">
              <CheckCircle
                className="flex-shrink-0 w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)]"
                style={{ color: '#10b981' }}
                aria-label="Icono de instrucciones de conteo"
              />
              <div className="flex flex-col">
                <h2 className="font-bold text-[clamp(1.25rem,5vw,1.5rem)] text-[#e1e8ed] leading-tight">
                  Instrucciones de Conteo
                </h2>
                <p className="text-[clamp(0.625rem,2.5vw,0.75rem)] text-[#8899a6] mt-[clamp(0.125rem,0.5vw,0.25rem)]">
                  Preparativos antes de contar efectivo
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={handleCancelRequest}
              className="rounded-full"
              aria-label="Cerrar modal"
            >
              <X className="w-[clamp(1rem,4vw,1.25rem)] h-[clamp(1rem,4vw,1.25rem)]" />
            </Button>
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
                      Icon: ICON_MAP[instruction.icon],
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

          {/* 🤖 [IA] - v1.2.41U: Footer con único botón centrado "Comenzar Conteo" verde (X button maneja cierre) */}
          <div className="flex items-center justify-center mt-fluid-2xl pt-fluid-xl border-t border-slate-600">
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