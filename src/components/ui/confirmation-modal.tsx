// 🤖 [IA] - v2.0.0 - Abstract Confirmation Modal Component
// Componente abstracto para confirmaciones con diseño premium
// Implementa especificaciones exactas del sistema de diseño v2.0.0

import React, { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { DestructiveActionButton } from "@/components/ui/destructive-action-button";
import { ConstructiveActionButton } from "@/components/ui/constructive-action-button";

// Props tipadas para máxima flexibilidad y reutilización
interface ConfirmationModalProps {
  // Trigger element (button that opens the modal)
  trigger?: ReactNode;
  
  // Modal state for controlled usage
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  
  // Content configuration
  title: string;
  description?: string;
  warningText?: string;
  
  // Button labels
  confirmText: string;
  cancelText: string;
  
  // Action handlers
  onConfirm: () => void;
  onCancel: () => void;
  
  // Optional class names for styling variations
  className?: string;
}

/**
 * ConfirmationModal v2.0.0
 * 
 * Componente abstracto de confirmación con Glass Morphism premium
 * 
 * Especificaciones del sistema de diseño:
 * - Background: rgba(36, 36, 36, 0.4) con blur(20px)
 * - Border: rgba(255, 255, 255, 0.15)
 * - Tipografía responsive con clamp()
 * - Estructura: Botones estandarizados con doctrina SOLID
 * - Botones: DestructiveActionButton (rojo) y ConstructiveActionButton (verde)
 * - Responsive automático mobile/desktop
 * 
 * @param {ConfirmationModalProps} props - Propiedades del componente
 */
export function ConfirmationModal({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  warningText,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  className,
}: ConfirmationModalProps) {
  // Manejo de apertura/cierre del modal
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      onCancel();
    }
    onOpenChange?.(isOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {/* Render trigger only if provided */}
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      
      <AlertDialogContent
        style={{
          maxWidth: "min(calc(100vw - 2rem), 32rem)" // Responsive constraint only
        }}
        className={`glass-morphism-panel w-full ${className || ''}`}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold text-destructive text-center"
          >
            ⚠️ {title}
          </AlertDialogTitle>
          
          {description && (
            <AlertDialogDescription 
              className="text-[clamp(0.875rem,3.5vw,1rem)] text-gray-300 mt-2 text-center"
            >
              {description}
            </AlertDialogDescription>
          )}
          
          {warningText && (
            <div 
              className="mt-3 p-[clamp(0.5rem,2vw,0.75rem)] rounded-[clamp(0.375rem,1.5vw,0.5rem)] text-[clamp(0.75rem,3vw,0.875rem)] font-medium text-center"
              style={{
                background: "rgba(244, 165, 42, 0.1)",
                border: "1px solid rgba(244, 165, 42, 0.3)",
                color: "#f4a52a"
              }}
            >
              {warningText}
            </div>
          )}
        </AlertDialogHeader>
        
        <AlertDialogFooter 
          className="flex flex-col-reverse sm:flex-row sm:justify-center gap-y-4 sm:gap-y-0 sm:gap-x-4 mt-[clamp(1rem,4vw,1.5rem)]"
        >
          <AlertDialogAction asChild>
            <DestructiveActionButton 
              onClick={onConfirm}
            >
              {confirmText}
            </DestructiveActionButton>
          </AlertDialogAction>
          
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
}
