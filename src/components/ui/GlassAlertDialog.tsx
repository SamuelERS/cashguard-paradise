// [IA] - v1.2.13 - Glass Morphism Alert Dialog Component
// Componente reutilizable para confirmaciones con diseño premium
// Implementa especificaciones exactas del sistema de diseño v1.2.13

// 🤖 [IA] - v2.0.0 - DEPRECATED COMPONENT
// ⚠️ ADVERTENCIA: Este componente está DEPRECADO
// Este componente ha sido reemplazado por el nuevo ConfirmationModal (@/components/ui/confirmation-modal)
// que implementa un diseño más abstracto y flexible según la doctrina v2.0.0
//
// RAZONES DE DEPRECACIÓN:
// - No implementa una abstracción suficiente
// - Contiene estilos inline y clases dispersas
// - La lógica está acoplada a la implementación
//
// PLAN DE MIGRACIÓN:
// 1. Usar ConfirmationModal en lugar de GlassAlertDialog en todos los componentes
// 2. Este archivo será eliminado en la próxima actualización mayor

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// 🤖 [IA] - v1.2.24: Importar Button component para migración al sistema centralizado
import { Button } from "@/components/ui/button";
// 🤖 [IA] - v2.0.0: Importar DestructiveActionButton para la doctrina SOLID RED
import { DestructiveActionButton } from "@/components/ui/destructive-action-button";
// 🤖 [IA] - v2.0.0: Importar ConstructiveActionButton para la doctrina SOLID GREEN
import { ConstructiveActionButton } from "@/components/ui/constructive-action-button";

// [IA] - Props tipadas para máxima flexibilidad y reutilización
interface GlassAlertDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  warning?: string;
  confirmText?: string;
  cancelText?: string;
}

/**
 * GlassAlertDialog v1.2.24
 * 
 * Componente de confirmación con Glass Morphism premium
 * 🤖 [IA] - v1.2.24: Migrado al sistema centralizado de botones
 * 
 * Especificaciones del sistema de diseño:
 * - Background: rgba(36, 36, 36, 0.4) con blur(20px)
 * - Border: rgba(255, 255, 255, 0.15)
 * - Tipografía responsive con clamp()
 * - Paleta de colores: Rojo #f4212e, Amarillo #f4a52a
 * - Botones: Sistema centralizado con variants glass-alert-*
 * - Responsive automático mobile/desktop
 * 
 * @param {GlassAlertDialogProps} props - Propiedades del componente
 */
export const GlassAlertDialog = ({
  open,
  onConfirm,
  onCancel,
  title = "¿Confirmar salida?",
  description = "Se perderá todo el progreso del conteo actual.",
  warning = "Esta acción no se puede deshacer.",
  confirmText = "Sí, volver al inicio",
  cancelText = "Cancelar",
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent
        className="glass-alert-dialog-content !border-0"
      >
        <AlertDialogHeader>
          <AlertDialogTitle 
            className="glass-alert-dialog-title"
          >
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription 
            className="glass-alert-dialog-description"
          >
            {description}
            {warning && (
              <span 
                className="glass-alert-dialog-warning"
              >
                {warning}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter 
          className="glass-alert-dialog-footer flex flex-col-reverse sm:flex-row sm:justify-center gap-y-4 sm:gap-y-0 sm:gap-x-4"
        >
          {/* 🤖 [IA] - v2.0.0: Migración a DestructiveActionButton siguiendo la SOLID RED DOCTRINE */}
          <AlertDialogAction asChild>
            <DestructiveActionButton 
              onClick={onConfirm}
            >
              {confirmText}
            </DestructiveActionButton>
          </AlertDialogAction>
          
          {/* 🤖 [IA] - v2.0.0: Migración a ConstructiveActionButton siguiendo la SOLID GREEN DOCTRINE */}
          <AlertDialogCancel asChild>
            <ConstructiveActionButton
              onClick={onCancel}
              className="mt-2 sm:mt-0"
            >
              {cancelText}
            </ConstructiveActionButton>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};