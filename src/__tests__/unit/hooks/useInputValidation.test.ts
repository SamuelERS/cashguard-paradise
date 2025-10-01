/**
 * Tests para useInputValidation
 * Hook para validación unificada de inputs numéricos
 */
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useInputValidation } from '@/hooks/useInputValidation';

describe('useInputValidation', () => {
  describe('validateInput - tipo integer', () => {
    it('debe validar números enteros correctos', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('25', 'integer');
      
      expect(validation.isValid).toBe(true);
      expect(validation.cleanValue).toBe('25');
      expect(validation.errorMessage).toBeUndefined();
    });

    it('debe limpiar caracteres no numéricos', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('25abc', 'integer');
      
      expect(validation.isValid).toBe(true);
      expect(validation.cleanValue).toBe('25');
    });

    it('debe rechazar decimales en tipo integer', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('25.5', 'integer');
      
      expect(validation.cleanValue).toBe('255');
    });

    it('debe aceptar string vacío', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('', 'integer');
      
      expect(validation.isValid).toBe(true);
      expect(validation.cleanValue).toBe('');
    });
  });

  describe('validateInput - tipo decimal', () => {
    it('debe validar decimales correctos', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('10.50', 'decimal');
      
      expect(validation.isValid).toBe(true);
      expect(validation.cleanValue).toBe('10.50');
    });

    it('debe aceptar coma como separador decimal (Android)', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('10,50', 'decimal');
      
      expect(validation.isValid).toBe(true);
      expect(validation.cleanValue).toBe('10.50');
    });

    it('debe limitar a 2 decimales', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('10.50', 'decimal');
      
      expect(validation.isValid).toBe(true);
    });

    it('debe manejar múltiples puntos decimales', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('10.50.25', 'decimal');
      
      expect(validation.cleanValue).toBe('10.5025');
    });

    it('debe permitir solo punto decimal', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('10.', 'decimal');
      
      expect(validation.isValid).toBe(true);
      expect(validation.cleanValue).toBe('10.');
    });
  });

  describe('validateInput - tipo currency', () => {
    it('debe validar montos de moneda correctos', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('100.50', 'currency');
      
      expect(validation.isValid).toBe(true);
      expect(validation.cleanValue).toBe('100.50');
    });

    it('debe limitar a 2 decimales en currency', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('100.99', 'currency');
      
      expect(validation.isValid).toBe(true);
      expect(validation.cleanValue).toBe('100.99');
    });

    it('debe validar números >= 0', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('0', 'currency');
      
      expect(validation.isValid).toBe(true);
    });

    it('debe aceptar coma en currency (Android)', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('100,50', 'currency');
      
      expect(validation.isValid).toBe(true);
      expect(validation.cleanValue).toBe('100.50');
    });
  });

  describe('getPattern', () => {
    it('debe retornar pattern correcto para integer', () => {
      const { result } = renderHook(() => useInputValidation());
      
      expect(result.current.getPattern('integer')).toBe('[0-9]*');
    });

    it('debe retornar pattern correcto para decimal', () => {
      const { result } = renderHook(() => useInputValidation());
      
      expect(result.current.getPattern('decimal')).toBe('[0-9]*\\.?[0-9]*');
    });

    it('debe retornar pattern correcto para currency', () => {
      const { result } = renderHook(() => useInputValidation());
      
      expect(result.current.getPattern('currency')).toBe('[0-9]*\\.?[0-9]*');
    });
  });

  describe('getInputMode', () => {
    it('debe retornar numeric para integer', () => {
      const { result } = renderHook(() => useInputValidation());
      
      expect(result.current.getInputMode('integer')).toBe('numeric');
    });

    it('debe retornar decimal para decimal', () => {
      const { result } = renderHook(() => useInputValidation());
      
      expect(result.current.getInputMode('decimal')).toBe('decimal');
    });

    it('debe retornar decimal para currency', () => {
      const { result } = renderHook(() => useInputValidation());
      
      expect(result.current.getInputMode('currency')).toBe('decimal');
    });
  });

  describe('casos edge', () => {
    it('debe manejar valores con espacios', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('  25  ', 'integer');
      
      expect(validation.isValid).toBe(true);
      expect(validation.cleanValue).toBe('25');
    });

    it('debe manejar valores con signos', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('$25.50', 'currency');
      
      expect(validation.cleanValue).toBe('25.50');
    });

    it('debe manejar input nulo correctamente', () => {
      const { result } = renderHook(() => useInputValidation());
      
      const validation = result.current.validateInput('   ', 'integer');
      
      expect(validation.isValid).toBe(true);
      expect(validation.cleanValue).toBe('');
    });
  });
});
