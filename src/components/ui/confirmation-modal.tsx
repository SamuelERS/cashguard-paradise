// [IA] - v3.0.1 - Abstract Confirmation Modal Component + FIX iOS Safari
// Previous: v3.0.0 - Componente abstracto para confirmaciones con diseño premium
// 🤖 [IA] - v1.3.6Z: FIX iOS Safari - touchAction override (permitir clicks en PWA standalone mode)
// Evolución a Responsividad Fluida: clamp() puro, sin breakpoints discretos

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
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';

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

  // 🤖 [IA] - v1.3.3: Opcional mostrar botón Cancel (default: true para backward compatibility)
  showCancel?: boolean;

  // Optional class names for styling variations
  className?: string;
}

/**
 * ConfirmationModal v3.0.0 - Paradise UI v3.0
 * 
 * Componente abstracto de confirmación con Glass Morphism premium
 * 
 * Especificaciones del sistema de diseño v3.0:
 * - Background: rgba(36, 36, 36, 0.4) con blur(20px)
 * - Border: rgba(255, 255, 255, 0.15)
 * - Tipografía responsive con clamp() puro
 * - Estructura: Botones estandarizados con doctrina SOLID
 * - Botones: DestructiveActionButton (rojo) y ConstructiveActionButton (verde)
 * - Responsividad Fluida: sin breakpoints discretos (sm:, md:)
 * - Dimensiones fluidas: clamp() para altura de botones
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
  showCancel,
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
        onEscapeKeyDown={(e) => {
          // 🤖 [IA] - v1.3.4: Bloquear ESC key cuando showCancel: false (anti-fraude)
          // Modales críticos de verificación ciega no deben permitir escape con ESC
          if (showCancel === false) {
            e.preventDefault();
          }
        }}
        style={{
          // 🤖 [IA] - v1.3.6Z: FIX iOS Safari - Override body touchAction + forzar interacción
          pointerEvents: 'auto',  // Forzar eventos pointer (clicks funcionales)
          touchAction: 'auto'     // Override body pan-y (permitir todos los gestos)
        }}
        className={`glass-morphism-panel modal-size-compact w-full ${className || ''}`}
      >
        <AlertDialogHeader className="pt-[clamp(1.5rem,6vw,2.5rem)] pb-[clamp(1rem,4vw,1.5rem)]">
          <AlertDialogTitle
            className="text-[clamp(1rem,4.5vw,1.25rem)] font-bold text-destructive text-center"
          >
            ⚠️ {title}
          </AlertDialogTitle>
          
          {description && (
            <AlertDialogDescription 
              className="text-[clamp(0.875rem,3.5vw,1rem)] text-gray-300 mt-[clamp(0.5rem,2vw,0.75rem)] text-center"
            >
              {description}
            </AlertDialogDescription>
          )}
          
          {warningText && (
            <div 
              className="mt-[clamp(0.5rem,2vw,0.75rem)] p-[clamp(0.5rem,2vw,0.75rem)] rounded-[clamp(0.375rem,1.5vw,0.5rem)] text-[clamp(0.75rem,3vw,0.875rem)] font-medium text-center"
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
          className="flex flex-col gap-[clamp(0.75rem,3vw,1rem)] mt-[clamp(0.5rem,2vw,0.75rem)] pb-[clamp(1rem,4vw,1.5rem)] sm:justify-center"
        >
          <AlertDialogAction asChild>
            <DestructiveActionButton
              onClick={onConfirm}
            >
              {confirmText}
            </DestructiveActionButton>
          </AlertDialogAction>

          {/* 🤖 [IA] - v1.3.3: Renderizado condicional botón Cancel (solo si showCancel !== false) */}
          {showCancel !== false && (
            <AlertDialogCancel asChild>
              <ConstructiveActionButton
                onClick={onCancel}
                className="h-[clamp(2.5rem,10vw,3rem)] px-[clamp(1rem,4vw,1.5rem)] mb-[clamp(0.5rem,2vw,0.75rem)]"
              >
                {cancelText}
              </ConstructiveActionButton>
            </AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
