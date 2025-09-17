// 🤖 [IA] - v1.2.23: Modal con Wizard v3 - Flujo Guiado con Revelación Progresiva
import React, { useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { Shield, ArrowRight } from 'lucide-react';
import * as Icons from 'lucide-react';
import { InstructionRule } from '@/components/wizards/InstructionRule';
import { InstructionProgress } from '@/components/wizards/InstructionProgress';
import { useInstructionFlow } from '@/hooks/instructions/useInstructionFlow';
import { cashCountingInstructions } from '@/data/instructions/cashCountingInstructions';
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

  // 🤖 [CTO] v3.1.2 - Instanciación del hook useInstructionFlow
  const { state, startFlow, acknowledgeInstruction, completeInstruction } = useInstructionFlow();

  // 🤖 [CTO] v3.1.2 - Iniciar el flujo cuando el componente se monta
  useEffect(() => {
    startFlow(cashCountingInstructions);
  }, [startFlow]);

  // 🤖 [CTO] v3.1.2 - Handler simplificado conectado al estado del hook
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="glass-morphism-panel w-[clamp(90vw,95vw,95vw)] max-w-[clamp(300px,90vw,540px)] max-h-[clamp(85vh,90vh,90vh)] overflow-y-auto overflow-x-hidden p-0 [&>button]:hidden"
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

        <InstructionProgress
          currentStep={Object.values(state.instructionStates).filter(s => s === 'checked').length}
          totalSteps={state.instructions.length}
          phase="Preparación de Conteo"
          isComplete={state.isFlowComplete}
        />

        {/* Contenido - Responsive */}
        <div 
          style={{
            padding: `clamp(16px, ${20 * viewportScale}px, 24px)`,
            gap: `clamp(12px, ${16 * viewportScale}px, 16px)`,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* 🤖 [CTO] v3.1.2 - Mapeo dinámico conectado al hook useInstructionFlow */}
          <div className="flex flex-col gap-3">
            {state.instructions.map((rule) => (
              <InstructionRule
                key={rule.id}
                state={state.instructionStates[rule.id]}
                icon={rule.icon}
                title={rule.title}
                description={rule.description}
                onClick={() => {
                  if (state.instructionStates[rule.id] === 'enabled') {
                    acknowledgeInstruction(rule.id);
                  }
                  if (state.instructionStates[rule.id] === 'reviewing') {
                    completeInstruction(rule.id);
                  }
                }}
                isDisabled={state.instructionStates[rule.id] !== 'enabled' && state.instructionStates[rule.id] !== 'reviewing'}
              />
            ))}
          </div>

          {/* 🤖 [CTO] v3.1.2 - Implementación de Arquitectura de Botones (D.1) y Footer Estándar Wizard V3 */}
          <div className="mt-[var(--instruction-fluid-2xl)] pt-[var(--instruction-fluid-xl)] border-t border-slate-700/50 flex items-center justify-center gap-[var(--instruction-fluid-lg)] px-[var(--instruction-fluid-lg)] pb-[var(--instruction-fluid-lg)]">
            <DestructiveActionButton
              text="Cancelar"
              onClick={() => {}}
              className="w-full sm:w-auto"
            />
            <ConstructiveActionButton
              text="Comenzar Conteo"
              onClick={handleConfirm}
              disabled={!state.isFlowComplete}
              icon={ArrowRight}
              className="w-full sm:w-auto"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}