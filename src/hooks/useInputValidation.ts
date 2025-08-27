import { useCallback } from 'react';

/* 🤖 [IA] - Hook para validación unificada de entrada - v1.0.21 */
export type InputType = 'integer' | 'decimal' | 'currency';

export interface ValidationResult {
  isValid: boolean;
  cleanValue: string;
  errorMessage?: string;
}

export const useInputValidation = () => {
  // 🤖 [IA] - Validación unificada para diferentes tipos de entrada
  const validateInput = useCallback((value: string, type: InputType): ValidationResult => {
    if (!value || value.trim() === '') {
      return { isValid: true, cleanValue: '' };
    }

    switch (type) {
      case 'integer': {
        // 🤖 [IA] - Solo números enteros (denominaciones de monedas/billetes)
        const cleanValue = value.replace(/[^\d]/g, '');
        const isValid = /^\d*$/.test(cleanValue);
        return {
          isValid,
          cleanValue,
          errorMessage: isValid ? undefined : 'Solo se permiten números enteros'
        };
      }

      case 'decimal': {
        // 🤖 [IA] - Números decimales (pagos electrónicos)
        const cleanValue = value.replace(/[^\d.]/g, '');
        // Permitir solo un punto decimal
        const parts = cleanValue.split('.');
        const finalValue = parts.length > 2 
          ? `${parts[0]}.${parts.slice(1).join('')}` 
          : cleanValue;
        
        const isValid = /^\d*\.?\d{0,2}$/.test(finalValue);
        return {
          isValid,
          cleanValue: finalValue,
          errorMessage: isValid ? undefined : 'Formato decimal inválido (máximo 2 decimales)'
        };
      }

      case 'currency': {
        // 🤖 [IA] - Formato de moneda (ventas esperadas)
        const cleanValue = value.replace(/[^\d.]/g, '');
        const parts = cleanValue.split('.');
        const finalValue = parts.length > 2 
          ? `${parts[0]}.${parts[1].substring(0, 2)}` 
          : cleanValue;
        
        const isValid = /^\d*\.?\d{0,2}$/.test(finalValue) && parseFloat(finalValue || '0') >= 0;
        return {
          isValid,
          cleanValue: finalValue,
          errorMessage: isValid ? undefined : 'Formato de moneda inválido'
        };
      }

      default:
        return { isValid: false, cleanValue: value, errorMessage: 'Tipo de validación no soportado' };
    }
  }, []);

  // 🤖 [IA] - Obtener patrón HTML5 según tipo
  const getPattern = useCallback((type: InputType): string => {
    switch (type) {
      case 'integer':
        return '[0-9]*';
      case 'decimal':
      case 'currency':
        return '[0-9]*\\.?[0-9]*';
      default:
        return '[0-9]*';
    }
  }, []);

  // 🤖 [IA] - Obtener inputMode según tipo
  const getInputMode = useCallback((type: InputType): 'numeric' | 'decimal' => {
    switch (type) {
      case 'integer':
        return 'numeric';
      case 'decimal':
      case 'currency':
        return 'decimal';
      default:
        return 'numeric';
    }
  }, []);

  return {
    validateInput,
    getPattern,
    getInputMode
  };
};
