// [IA] - v1.2.13 - Glass Morphism Alert Dialog Component
// Componente reutilizable para confirmaciones con diseño premium
// Implementa especificaciones exactas del sistema de diseño v1.2.13

import React from "react";
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
export const GlassAlertDialog: React.FC<GlassAlertDialogProps> = ({
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
          {/* 🤖 [IA] - v1.2.24: Migración a Button centralizado con variant glass-alert-action */}
          <AlertDialogAction asChild>
            <Button 
              variant="glass-alert-action"
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </AlertDialogAction>
          
          {/* 🤖 [IA] - v1.2.24: Migración a Button centralizado con variant glass-alert-cancel */}
          <AlertDialogCancel asChild>
            <Button 
              variant="glass-alert-cancel"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};