/**
 * 🤖 [IA] - Hook para navegación entre campos con Enter - v1.0.21
 * 
 * @description
 * Hook que proporciona navegación automática entre campos de input usando la tecla Enter.
 * Optimizado para móviles con detección de dispositivo y timing unificado para evitar
 * race conditions. Busca campos por data-field attribute para navegación precisa.
 * 
 * @param {string[]} fields - Array de nombres de campos en orden de navegación
 * 
 * @example
 * ```tsx
 * const { handleEnterNavigation } = useFieldNavigation([
 *   'penny', 'nickel', 'dime', 'quarter'
 * ]);
 * 
 * <input
 *   data-field="penny"
 *   onKeyPress={handleEnterNavigation('penny', handleConfirm)}
 * />
 * ```
 * 
 * @returns Objeto con funciones de navegación
 * 
 * @property {function} findNextActiveInput - Encuentra el siguiente input activo
 * @property {function} handleEnterNavigation - Maneja navegación con Enter key
 * 
 * @see {@link useIsMobile} Hook de detección móvil unificado (BUG #5 Fix)
 * @see {@link useTimingConfig} Hook de timing sin race conditions (BUG #6 Fix)
 */
import { useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile'; // 🤖 [IA] - BUG #5 Fix: Usar hook existente
import { useTimingConfig } from '@/hooks/useTimingConfig'; // 🤖 [IA] - BUG #6 Fix: Timing unificado

export const useFieldNavigation = (fields: string[]) => {
  const isMobile = useIsMobile(); // 🤖 [IA] - BUG #5 Fix: Usar detección unificada
  const { createTimeout } = useTimingConfig(); // 🤖 [IA] - BUG #6 Fix: Timing sin race conditions
  
  // 🤖 [IA] - Selector DOM unificado para navegación - BUG #4 Fix
  const findNextActiveInput = useCallback(() => {
    // Prioridad 1: Buscar por data-field (más específico)
    const dataFieldInputs = document.querySelectorAll('[data-field]:not([disabled]):not([readonly])') as NodeListOf<HTMLInputElement>;
    const activeDataField = Array.from(dataFieldInputs).find(input => 
      input.classList.contains('active') || input.getAttribute('data-active') === 'true'
    );
    if (activeDataField) return activeDataField;

    // Prioridad 2: Buscar por clase input-field.active
    const activeInput = document.querySelector('.input-field.active:not([disabled]):not([readonly])') as HTMLInputElement;
    if (activeInput) return activeInput;

    // Prioridad 3: Fallback a cualquier input de texto activo
    const textInputs = document.querySelectorAll('input[type="text"]:not([disabled]):not([readonly])') as NodeListOf<HTMLInputElement>;
    return Array.from(textInputs).find(input => 
      input.classList.contains('active') || input.getAttribute('data-active') === 'true'
    ) || null;
  }, []);

  const handleEnterNavigation = useCallback(
    (currentField: string, onConfirm: () => void) => {
      return (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation(); // 🤖 [IA] - Prevenir propagación para evitar conflictos
          onConfirm();
          
          // 🤖 [IA] - Auto-focus siguiente campo con timing unificado - BUG #6 Fix
          const currentIndex = fields.indexOf(currentField);
          if (currentIndex < fields.length - 1) {
            const nextField = fields[currentIndex + 1];
            
            // 🤖 [IA] - Usar timing unificado para evitar race conditions
            createTimeout(() => {
              // Buscar el siguiente input por data-field específico
              const nextInput = document.querySelector(
                `[data-field="${nextField}"]:not([disabled]):not([readonly])`
              ) as HTMLInputElement;
              
              if (nextInput) {
                nextInput.focus();
                nextInput.select(); // Seleccionar texto para fácil edición
                
                // 🤖 [IA] - Scroll suave en móvil si el campo está oculto
                if (isMobile) {
                  nextInput.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                  });
                }
              } else {
                // Fallback: usar selector unificado
                const activeInput = findNextActiveInput();
                if (activeInput) {
                  activeInput.focus();
                  activeInput.select();
                  
                  // 🤖 [IA] - Scroll para input activo en móvil
                  if (isMobile) {
                    activeInput.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'center' 
                    });
                  }
                }
              }
            }, 'navigation', `nav_${currentField}_${nextField}`); // 🤖 [IA] - Key único para evitar conflictos
          }
        }
      };
    },
    [fields, isMobile, findNextActiveInput, createTimeout]
  );

  const focusField = useCallback((fieldName: string) => {
    const input = document.querySelector(
      `[data-field="${fieldName}"]`
    ) as HTMLInputElement;
    
    if (input) {
      input.focus();
      input.select();
      
      if (isMobile) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isMobile]);

  return {
    handleEnterNavigation,
    focusField
  };
};