// 🤖 [IA] - v1.3.0: MÓDULO 3 - Blind Verification Modal Component
// Componente adaptador para verificación ciega con triple intento
// Traduce estados de verificación al componente ConfirmationModal del sistema

import React from 'react';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import type { ThirdAttemptResult } from '@/types/verification';

/**
 * Props del componente BlindVerificationModal
 *
 * @remarks
 * Componente adaptador que traduce estados de verificación ciega
 * al componente ConfirmationModal del sistema. Soporta 4 variantes:
 * - `incorrect`: Primer intento incorrecto
 * - `force-same`: Segundo intento idéntico (override silencioso)
 * - `require-third`: Dos intentos diferentes (tercer intento obligatorio)
 * - `third-result`: Resultado del análisis del tercer intento
 *
 * @version 1.3.0
 * @see {@link Plan_Vuelto_Ciego.md} MÓDULO 3 líneas 1710-1800
 */
interface BlindVerificationModalProps {
  /** Tipo de modal a mostrar */
  type: 'incorrect' | 'force-same' | 'require-third' | 'third-result';

  /** Estado de apertura del modal */
  isOpen: boolean;

  /** Label de la denominación actual (ej: "Monedas de 25¢") */
  stepLabel: string;

  /** Callback para reintentar conteo */
  onRetry: () => void;

  /** Callback para forzar valor (Escenario 2 - override silencioso) */
  onForce?: () => void;

  /** Callback para aceptar tercer intento (Escenario 3) */
  onAcceptThird?: () => void;

  /** Análisis del tercer intento (solo para type='third-result') */
  thirdAttemptAnalysis?: ThirdAttemptResult;
}

/**
 * Configuración de contenido del modal
 *
 * @internal
 */
interface ModalContent {
  title: string;
  description: string;
  warningText?: string;
  confirmText: string;
  cancelText: string;
  showCancel: boolean;
}

/**
 * Obtiene configuración de contenido según tipo de modal
 *
 * @param type - Tipo de modal
 * @param stepLabel - Label de denominación
 * @param thirdAttemptAnalysis - Análisis tercer intento (opcional)
 * @returns Configuración de título, descripción y textos de botones
 *
 * @remarks
 * Implementa la lógica de mensajes para cada uno de los 4 escenarios
 * de verificación ciega definidos en Plan_Vuelto_Ciego.md líneas 282-290.
 *
 * @version 1.3.0
 */
function getModalContent(
  type: BlindVerificationModalProps['type'],
  stepLabel: string,
  thirdAttemptAnalysis?: ThirdAttemptResult
): ModalContent {
  switch (type) {
    case 'incorrect':
      // 🤖 [IA] - v1.3.0: Escenario 1 - Primer intento incorrecto
      return {
        title: 'Cantidad Incorrecta',
        description: `La cantidad ingresada para ${stepLabel} no coincide con lo contado. Por favor, vuelva a contar con mayor cuidado.`,
        confirmText: 'Reintentar',
        cancelText: 'Cancelar',
        showCancel: true
      };

    case 'force-same':
      // 🤖 [IA] - v1.3.0: Escenario 2a - Dos intentos iguales incorrectos (override silencioso)
      return {
        title: 'Segundo Intento Idéntico',
        description: `Has ingresado la misma cantidad para ${stepLabel} dos veces. El sistema aceptará este valor y continuará.`,
        warningText: '⚠️ Esta acción quedará registrada en el reporte',
        confirmText: 'Forzar y Continuar',
        cancelText: 'Cancelar y Recontar',
        showCancel: true
      };

    case 'require-third':
      // 🤖 [IA] - v1.3.0: Escenario 2b - Dos intentos diferentes (tercer intento obligatorio)
      return {
        title: '🚨 ALERTA CRÍTICA - Tercer Intento Obligatorio',
        description: `Los 2 intentos para ${stepLabel} son montos DIFERENTES. Tu trabajo será reportado a gerencia. No lo estás haciendo bien. TERCER INTENTO OBLIGATORIO.`,
        confirmText: 'Hacer Tercer Intento',
        cancelText: '', // Sin botón cancelar - modal NO cancelable
        showCancel: false
      };

    case 'third-result': {
      // 🤖 [IA] - v1.3.0: Escenario 3 - Resultado análisis tercer intento
      const isSevere = thirdAttemptAnalysis?.severity === 'critical_severe';
      return {
        title: isSevere ? '🔴 FALTA MUY GRAVE' : '⚠️ FALTA GRAVE',
        description: thirdAttemptAnalysis?.reason || 'Error en análisis de intentos',
        warningText: `Valor aceptado: ${thirdAttemptAnalysis?.acceptedValue || 0} unidades`,
        confirmText: 'Aceptar y Continuar',
        cancelText: '', // Sin botón cancelar - modal NO cancelable
        showCancel: false
      };
    }

    default:
      // 🤖 [IA] - v1.3.0: Fallback (nunca debería ejecutarse con TypeScript strict)
      return {
        title: 'Error',
        description: 'Tipo de modal no reconocido',
        confirmText: 'Aceptar',
        cancelText: 'Cancelar',
        showCancel: true
      };
  }
}

/**
 * Componente BlindVerificationModal
 *
 * Modal adaptador para verificación ciega con triple intento.
 * Traduce estados de verificación al componente ConfirmationModal del sistema.
 *
 * @example
 * ```tsx
 * // Escenario 1: Primer intento incorrecto
 * <BlindVerificationModal
 *   type="incorrect"
 *   isOpen={true}
 *   stepLabel="Monedas de 25¢"
 *   onRetry={() => console.log('Retry')}
 * />
 *
 * // Escenario 2a: Override silencioso
 * <BlindVerificationModal
 *   type="force-same"
 *   isOpen={true}
 *   stepLabel="Monedas de 10¢"
 *   onRetry={() => console.log('Retry')}
 *   onForce={() => console.log('Force accept')}
 * />
 *
 * // Escenario 2b: Tercer intento obligatorio
 * <BlindVerificationModal
 *   type="require-third"
 *   isOpen={true}
 *   stepLabel="Monedas de 5¢"
 *   onRetry={() => console.log('Clear input for third attempt')}
 * />
 *
 * // Escenario 3: Resultado tercer intento
 * <BlindVerificationModal
 *   type="third-result"
 *   isOpen={true}
 *   stepLabel="Monedas de 1¢"
 *   onRetry={() => {}}
 *   onAcceptThird={() => console.log('Accept third attempt result')}
 *   thirdAttemptAnalysis={{
 *     acceptedValue: 8,
 *     severity: 'critical_inconsistent',
 *     reason: 'Intentos 1 y 3 coinciden (8). Intento 2 fue erróneo (12).',
 *     attempts: [8, 12, 8]
 *   }}
 * />
 * ```
 *
 * @remarks
 * **DECISIÓN ARQUITECTÓNICA CRÍTICA:**
 * Este componente NO modifica `ConfirmationModal` existente (REGLAS_DE_LA_CASA.md #1).
 * En su lugar, adapta props al API real de ConfirmationModal:
 * - `isOpen` → `open`
 * - `message` → `description`
 * - `confirmLabel` → `confirmText`
 *
 * **WCAG 2.1 Level AA Compliance:**
 * - role="dialog" heredado de AlertDialog (Radix UI)
 * - Labels descriptivos en todos los botones
 * - Contraste colores ≥4.5:1 heredado de ConfirmationModal
 * - Navegación teclado (Tab, Escape) heredada de AlertDialog
 *
 * @version 1.3.0
 * @see {@link ConfirmationModal} Componente base del sistema
 * @see {@link ThirdAttemptResult} Interface de análisis tercer intento
 */
export function BlindVerificationModal({
  type,
  isOpen,
  stepLabel,
  onRetry,
  onForce,
  onAcceptThird,
  thirdAttemptAnalysis
}: BlindVerificationModalProps) {
  // 🤖 [IA] - v1.3.0: Obtener contenido según tipo de modal
  const content = getModalContent(type, stepLabel, thirdAttemptAnalysis);

  // 🤖 [IA] - v1.3.0: Determinar handler de confirmación según tipo
  const handleConfirm = () => {
    switch (type) {
      case 'force-same':
        // Escenario 2a: Forzar valor idéntico
        onForce?.();
        break;
      case 'third-result':
        // Escenario 3: Aceptar resultado tercer intento
        onAcceptThird?.();
        break;
      default:
        // Escenarios 1 y 2b: Reintentar
        onRetry();
    }
  };

  // 🤖 [IA] - v1.3.0: Render con adaptación a ConfirmationModal API real
  // NOTA: ConfirmationModal llama onCancel() automáticamente en handleOpenChange
  // cuando modal se cierra, por lo que NO duplicamos llamadas aquí
  return (
    <ConfirmationModal
      open={isOpen}  // ← Adaptado de "isOpen" a API real
      onOpenChange={content.showCancel ? undefined : () => {}}  // ← Previene cierre si showCancel=false
      title={content.title}
      description={content.description}
      warningText={content.warningText}
      confirmText={content.confirmText}
      cancelText={content.cancelText || 'Cancelar'}
      onConfirm={handleConfirm}
      onCancel={onRetry}  // ← Llamado automáticamente por ConfirmationModal.handleOpenChange
    />
  );
}
