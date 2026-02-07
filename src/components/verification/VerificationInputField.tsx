// 🤖 [IA] - Desmonolitado desde Phase2VerificationSection.tsx - FASE 4 PASO 1
// Componente input field para verificación ciega con preservación 100% funcionalidad crítica
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { getDenominationDescription } from '@/utils/verification-helpers';

/**
 * Props para VerificationInputField component
 * @property inputValue - Valor actual del input (string numérico)
 * @property onInputChange - Callback cuando cambia el valor (debe sanitizar: replace(/[^0-9]/g, ''))
 * @property currentStep - Objeto con datos del paso actual (key, label, quantity)
 * @property inputRef - Ref del input para focus management
 * @property onKeyDown - Handler de eventos teclado (incluye modal guard en parent)
 * @property onConfirm - Handler del botón Confirmar
 * @property isValueCorrect - Flag si valor ingresado === quantity esperada
 * @property isValueIncorrect - Flag si valor ingresado !== quantity esperada
 * @property modalIsOpen - Flag si modal está abierto (usado para guards)
 * @property showRemainingAmounts - Flag modo desarrollo (true) vs producción (false)
 * @property confirmDisabled - Flag para deshabilitar botón Confirmar
 */
interface VerificationInputFieldProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  currentStep: {
    key: string;
    label: string;
    quantity: number;
  };
  inputRef: React.RefObject<HTMLInputElement>;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onConfirm: () => void;
  isValueCorrect: boolean;
  isValueIncorrect: boolean;
  modalIsOpen: boolean;
  showRemainingAmounts: boolean;
  confirmDisabled: boolean;
}

/**
 * Componente de input field para verificación ciega Phase 2
 * Preserva 100% funcionalidad crítica:
 * - Input sanitization (parent maneja replace non-numeric)
 * - Modal guard (parent maneja preventDefault en onKeyDown)
 * - Touch preventDefault (evita comportamientos móviles no deseados)
 * - Accessibility (sr-only label WCAG 2.1)
 * - AutoFocus (input recibe focus automáticamente)
 * - Border color logic (rojo cuando incorrecto en dev mode)
 * - Conditional rendering (mensajes error/success solo en dev mode)
 */
export function VerificationInputField({
  inputValue,
  onInputChange,
  currentStep,
  inputRef,
  onKeyDown,
  onConfirm,
  isValueCorrect,
  isValueIncorrect,
  modalIsOpen,
  showRemainingAmounts,
  confirmDisabled
}: VerificationInputFieldProps) {
  return (
    <div>
      <div className="flex items-center" style={{ gap: 'clamp(8px, 2vw, 16px)' }}>
        <div className="flex-1 relative">
          {/* 🤖 [IA] - v1.2.52: Accessible label for screen readers (WCAG 2.1 SC 3.3.2) */}
          <Label
            htmlFor={`verification-input-${currentStep.key}`}
            className="sr-only"
          >
            {getDenominationDescription(currentStep.key, currentStep.label)}
          </Label>

          <Input
            id={`verification-input-${currentStep.key}`}
            ref={inputRef}
            type="text"  // 🤖 [IA] - v3.1.0: Unificado a "text" para teclado decimal consistente
            inputMode="decimal"  // 🤖 [IA] - v3.1.0: Forzar teclado decimal en todos los casos
            pattern="[0-9]*[.,]?[0-9]*"  // 🤖 [IA] - v3.1.0: Acepta punto y coma para Android
            value={inputValue}
            onChange={(e) => {
              onInputChange(e.target.value);
            }}
            onKeyDown={onKeyDown}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            placeholder={`¿Cuántos ${getDenominationDescription(currentStep.key, currentStep.label).toLowerCase()}?`}
            style={{
              // 🔒 Borde condicional (conteo ciego producción)
              borderColor: showRemainingAmounts && isValueIncorrect ? 'var(--danger)' : 'var(--accent-primary)',
              fontSize: 'clamp(18px, 4vw, 24px)',
              fontWeight: 'bold',
              height: 'clamp(48px, 12vw, 56px)',
              textAlign: 'center',
              paddingLeft: 'clamp(14px, 3vw, 20px)',
              paddingRight: 'clamp(14px, 3vw, 20px)',
              transition: 'all 0.3s ease'
            }}
            className="focus:neon-glow-primary"
            autoFocus
          />
          {/* 🔒 Mensaje error condicional (conteo ciego producción) */}
          {showRemainingAmounts && isValueIncorrect && (
            <div className="absolute -bottom-6 left-0 right-0 text-center">
              <span className="text-xs text-destructive">
                Ingresa exactamente {currentStep.quantity} {getDenominationDescription(currentStep.key, currentStep.label).toLowerCase()}
              </span>
            </div>
          )}
        </div>
        <ConstructiveActionButton
          onClick={onConfirm}
          disabled={confirmDisabled}  // 🤖 [IA] - v1.3.0: MÓDULO 4 - Permitir valores incorrectos para blind verification
          onTouchStart={(e) => e.preventDefault()}
          aria-label="Confirmar cantidad"
          className="btn-guided-confirm"
          style={{
            height: 'clamp(48px, 12vw, 56px)'
          }}
        >
          Confirmar
          <ChevronRight className="w-4 h-4 ml-1" />
        </ConstructiveActionButton>
      </div>
      {/* Success indicator */}
      {/* 🔒 Mensaje success condicional (conteo ciego producción) */}
      {showRemainingAmounts && isValueCorrect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-2 flex justify-start"
        >
          <div className="flex items-center gap-1 text-xs text-success">
            <Check className="w-3 h-3" />
            <span>Cantidad correcta</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
