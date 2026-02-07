// 🤖 [IA] - Desmonolitado desde Phase2VerificationSection.tsx
// Footer con botón Cancelar para verificación

import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';

interface VerificationFooterProps {
  /**
   * Handler del botón Cancelar
   */
  onCancel: () => void;
}

/**
 * Footer simple con botón Cancelar responsive
 * Full width en móvil, auto width en desktop
 */
export function VerificationFooter({ onCancel }: VerificationFooterProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 border-t border-white/10 p-4 bg-black/20 backdrop-blur-sm">
      <DestructiveActionButton
        onClick={onCancel}
        aria-label="Cancelar verificación y volver"
      >
        Cancelar
      </DestructiveActionButton>
    </div>
  );
}
