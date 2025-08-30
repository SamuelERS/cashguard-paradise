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
import '@/styles/features/glass-alert-cancel-button.css';
import '@/styles/features/glass-alert-action-button.css';

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
 * GlassAlertDialog v1.2.13
 * 
 * Componente de confirmación con Glass Morphism premium
 * Cumple con todas las especificaciones del sistema de diseño:
 * - Background: rgba(36, 36, 36, 0.4) con blur(20px)
 * - Border: rgba(255, 255, 255, 0.15)
 * - Tipografía responsive con clamp()
 * - Paleta de colores: Rojo #f4212e, Amarillo #f4a52a
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
        className="!border-0"
        style={{
          // [IA] - Glass Morphism v1.2.13 - Sistema de diseño premium
          backgroundColor: 'rgba(36, 36, 36, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)', // Safari support
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '16px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
          
          // [IA] - Dimensiones responsive con clamp()
          width: 'calc(100vw - 2rem)',
          maxWidth: 'clamp(320px, 90vw, 500px)',
          margin: '0 auto',
          padding: '24px',
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle 
            style={{ 
              // [IA] - Título con color de peligro y tamaño responsive
              color: '#f4212e',
              fontSize: 'clamp(1.125rem, 4vw, 1.25rem)',
              fontWeight: 600,
              textAlign: 'center',
            }}
          >
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription 
            style={{ 
              // [IA] - Descripción principal con color claro
              color: '#e1e8ed',
              fontSize: 'clamp(0.875rem, 3.5vw, 0.95rem)',
              textAlign: 'center',
              marginTop: '12px',
            }}
          >
            {description}
            {warning && (
              <span 
                style={{ 
                  // [IA] - Advertencia secundaria con color amarillo
                  display: 'block',
                  marginTop: '8px',
                  color: '#f4a52a',
                  fontSize: 'clamp(0.813rem, 3.25vw, 0.875rem)',
                  fontWeight: 500,
                }}
              >
                {warning}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter 
          className="flex flex-col-reverse sm:flex-row sm:justify-center gap-y-4 sm:gap-y-0 sm:gap-x-4"
          style={{ marginTop: '16px' }}
        >
          <AlertDialogAction
            onClick={onConfirm}
            className="glass-alert-action-button hover:opacity-90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 btn-primary h-12 px-6 py-3 hover:bg-white/10"
          >
            {confirmText}
          </AlertDialogAction>
          
          <AlertDialogCancel
            onClick={onCancel}
            className="glass-alert-cancel-button hover:bg-white/10 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 btn-secondary h-12 px-6 py-3 mt-2 sm:mt-0"
          >
            {cancelText}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};