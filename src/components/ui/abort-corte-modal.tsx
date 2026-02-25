import { useMemo, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';

interface AbortCorteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (motivo: string) => Promise<void> | void;
  onCancel: () => void;
  title?: string;
  description?: string;
  warningText?: string;
  confirmText?: string;
  cancelText?: string;
  motivoLabel?: string;
  motivoPlaceholder?: string;
  minLength?: number;
}

export function AbortCorteModal({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  title = '¿Confirmar cancelación del corte?',
  description = 'Si cancelas este corte deberás iniciar un nuevo proceso desde cero.',
  warningText = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar cancelación',
  cancelText = 'Continuar aquí',
  motivoLabel = 'Motivo (obligatorio)',
  motivoPlaceholder = 'Describe por qué se debe reiniciar el corte...',
  minLength = 10,
}: AbortCorteModalProps) {
  const [motivo, setMotivo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isClosingByConfirmRef = useRef(false);

  const motivoTrimmed = useMemo(() => motivo.trim(), [motivo]);
  const motivoValido = motivoTrimmed.length >= minLength;

  const resetState = () => {
    setMotivo('');
    setIsSubmitting(false);
  };

  const handleDialogOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      if (isClosingByConfirmRef.current) {
        isClosingByConfirmRef.current = false;
      } else {
        onCancel();
      }
      resetState();
    }

    onOpenChange(nextOpen);
  };

  const handleCancelClick = () => {
    onCancel();
    resetState();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (!motivoValido || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onConfirm(motivoTrimmed);
      isClosingByConfirmRef.current = true;
      onOpenChange(false);
      resetState();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleDialogOpenChange}>
      <AlertDialogContent className="glass-morphism-panel modal-size-compact">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-destructive text-center">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-center text-muted-foreground">
            {description}
          </AlertDialogDescription>
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-center text-xs text-amber-300">
            {warningText}
          </div>
        </AlertDialogHeader>

        <div className="space-y-2">
          <label htmlFor="abort-corte-motivo" className="text-sm font-medium text-white/90">
            {motivoLabel}
          </label>
          <Textarea
            id="abort-corte-motivo"
            aria-label={motivoLabel}
            value={motivo}
            onChange={(event) => setMotivo(event.target.value)}
            placeholder={motivoPlaceholder}
            minLength={minLength}
            className="min-h-[96px] resize-none"
            disabled={isSubmitting}
          />
          <p className="text-xs text-white/50">
            Mínimo {minLength} caracteres.
          </p>
        </div>

        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <DestructiveActionButton
            type="button"
            onClick={() => void handleConfirm()}
            disabled={!motivoValido || isSubmitting}
          >
            {isSubmitting ? 'Cancelando...' : confirmText}
          </DestructiveActionButton>
          <ConstructiveActionButton
            type="button"
            onClick={handleCancelClick}
            disabled={isSubmitting}
          >
            {cancelText}
          </ConstructiveActionButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
