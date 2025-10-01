/**
 * 🤖 [IA] - Hook para validación unificada de entrada - v1.0.21
 * 
 * @description
 * Hook que proporciona validación consistente para diferentes tipos de input numéricos.
 * Maneja validación de enteros (denominaciones), decimales (cantidades) y moneda (precios).
 * Incluye compatibilidad con punto y coma para Android.
 * 
 * @example
 * ```tsx
 * const { validateInput, getPattern, getInputMode } = useInputValidation();
 * 
 * // Validar cantidad entera
 * const result = validateInput('25', 'integer');
 * if (result.isValid) {
 *   console.log(result.cleanValue); // '25'
 * }
 * 
 * // Obtener pattern HTML5
 * <input pattern={getPattern('decimal')} inputMode={getInputMode('decimal')} />
 * ```
 * 
 * @returns Objeto con funciones de validación
 * 
 * @property {function} validateInput - Valida y limpia un valor de input
 * @property {function} getPattern - Obtiene el pattern HTML5 apropiado
 * @property {function} getInputMode - Obtiene el inputMode apropiado
 */
import { useCallback } from 'react';

/**
 * Tipos de input soportados
 * 
 * - `integer`: Solo números enteros (ej: cantidad de billetes/monedas)
 * - `decimal`: Números con hasta 2 decimales (ej: 10.50)
 * - `currency`: Valores monetarios con validación de formato
 */
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
        // 🤖 [IA] - v3.1.0: Acepta tanto punto como coma para compatibilidad Android
        const cleanValue = value.replace(/[^\d.,]/g, '').replace(/,/g, '.');
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
        // 🤖 [IA] - v3.1.0: Acepta tanto punto como coma para compatibilidad Android
        const cleanValue = value.replace(/[^\d.,]/g, '').replace(/,/g, '.');
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
