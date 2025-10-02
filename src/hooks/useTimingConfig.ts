import { useCallback, useEffect } from 'react';

/**
 * 🤖 [IA] - Hook para timing unificado - Solución BUG #6 - v1.0.21
 * 
 * @description
 * Hook que centraliza toda la configuración de timing en la aplicación.
 * Previene race conditions al gestionar timeouts de forma centralizada y
 * proporciona delays consistentes para operaciones asíncronas.
 * 
 * @example
 * ```tsx
 * const { createTimeoutWithCleanup, getDelay } = useTimingConfig();
 * 
 * useEffect(() => {
 *   const cleanup = createTimeoutWithCleanup(() => {
 *     inputRef.current?.focus();
 *   }, 'focus', 'input_focus');
 *   return cleanup; // Auto-cleanup al desmontar
 * }, [isActive]);
 * ```
 * 
 * @see {@link https://github.com/Paradise-System-Labs/cashguard/wiki/Timing-System Timing System Wiki}
 */

/**
 * Tipos de timing disponibles en la aplicación
 * 
 * - `focus`: Auto-focus de inputs (100ms)
 * - `navigation`: Navegación entre campos (100ms)
 * - `confirmation`: Confirmación de acciones (150ms)
 * - `transition`: Transiciones entre secciones (1000ms)
 * - `toast`: Notificaciones toast (4000ms)
 */
export type TimingType = 'focus' | 'navigation' | 'confirmation' | 'transition' | 'toast';

export interface TimingConfig {
  focus: number;           // Auto-focus de inputs
  navigation: number;      // Navegación entre campos
  confirmation: number;    // Confirmación de acciones
  transition: number;      // Transiciones entre secciones
  toast: number;          // Notificaciones toast
}

// 🤖 [IA] - Configuración unificada de timing para evitar race conditions
const TIMING_CONFIG: TimingConfig = {
  focus: 100,        // Tiempo estándar para auto-focus
  navigation: 100,   // Tiempo para navegación entre campos
  confirmation: 150, // Tiempo para confirmaciones (evita conflictos)
  transition: 1000,  // Tiempo para transiciones de sección
  toast: 4000       // Duración de notificaciones
};

// 🤖 [IA] - Map para rastrear timeouts activos y evitar conflictos
const activeTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Hook useTimingConfig - Gestión centralizada de timeouts
 * 
 * @returns Objeto con funciones y configuración de timing
 * 
 * @property {function} getDelay - Obtiene el delay para un tipo de timing
 * @property {function} createTimeout - Crea un timeout con cancelación automática de conflictos
 * @property {function} cancelTimeout - Cancela un timeout específico por key
 * @property {function} cancelAllTimeouts - Cancela todos los timeouts activos
 * @property {function} createTimeoutWithCleanup - Crea timeout que retorna función cleanup
 * @property {TimingConfig} timingConfig - Configuración de delays
 */
export const useTimingConfig = () => {
  /**
   * Obtiene el delay configurado para un tipo de timing
   * 
   * @param {TimingType} type - Tipo de timing (focus, navigation, etc.)
   * @returns {number} Delay en milisegundos
   * 
   * @example
   * ```tsx
   * const delay = getDelay('focus'); // 100
   * ```
   */
  const getDelay = useCallback((type: TimingType): number => {
    return TIMING_CONFIG[type];
  }, []);

  /**
   * Crea un timeout con cancelación automática de conflictos
   * 
   * Si ya existe un timeout con la misma key, lo cancela antes de crear uno nuevo.
   * Esto previene race conditions cuando múltiples eventos intentan crear el mismo timeout.
   * 
   * @param {function} callback - Función a ejecutar después del delay
   * @param {TimingType} type - Tipo de timing que determina el delay
   * @param {string} [key] - Identificador único opcional para el timeout
   * @returns {number} ID del timeout creado
   * 
   * @example
   * ```tsx
   * const timeoutId = createTimeout(() => {
   *   console.log('Focus!');
   * }, 'focus', 'my_input_focus');
   * ```
   */
  const createTimeout = useCallback((
    callback: () => void,
    type: TimingType,
    key?: string
  ): ReturnType<typeof setTimeout> => {
    const timeoutKey = key || `${type}_${Date.now()}`;
    
    // Cancelar timeout existente si hay conflicto
    if (activeTimeouts.has(timeoutKey)) {
      clearTimeout(activeTimeouts.get(timeoutKey)!);
      activeTimeouts.delete(timeoutKey);
    }

    const timeout = setTimeout(() => {
      callback();
      activeTimeouts.delete(timeoutKey);
    }, getDelay(type));

    activeTimeouts.set(timeoutKey, timeout);
    return timeout;
  }, [getDelay]);

  /**
   * Cancela un timeout específico por su key
   * 
   * @param {string} key - Identificador del timeout a cancelar
   * 
   * @example
   * ```tsx
   * cancelTimeout('my_input_focus');
   * ```
   */
  const cancelTimeout = useCallback((key: string) => {
    if (activeTimeouts.has(key)) {
      clearTimeout(activeTimeouts.get(key)!);
      activeTimeouts.delete(key);
    }
  }, []);

  /**
   * Cancela todos los timeouts activos
   * 
   * Útil para cleanup global cuando un componente se desmonta
   * o cuando se necesita resetear el estado de timing.
   * 
   * @example
   * ```tsx
   * useEffect(() => {
   *   return () => cancelAllTimeouts(); // Cleanup al desmontar
   * }, []);
   * ```
   */
  const cancelAllTimeouts = useCallback(() => {
    activeTimeouts.forEach((timeout) => clearTimeout(timeout));
    activeTimeouts.clear();
  }, []);

  /**
   * Crea un timeout con función de cleanup automático
   * 
   * Esta es la función recomendada para usar en useEffect ya que retorna
   * automáticamente una función de cleanup que cancela el timeout.
   * 
   * @param {function} callback - Función a ejecutar después del delay
   * @param {TimingType} type - Tipo de timing que determina el delay base
   * @param {string} [key] - Identificador único opcional para el timeout
   * @param {number} [customDelay] - Delay personalizado que sobrescribe el configurado
   * @returns {function} Función de cleanup para cancelar el timeout
   * 
   * @example
   * ```tsx
   * useEffect(() => {
   *   const cleanup = createTimeoutWithCleanup(() => {
   *     inputRef.current?.focus();
   *   }, 'focus', 'input_focus', 150); // 150ms custom delay
   *   return cleanup; // Auto-cleanup
   * }, [isActive]);
   * ```
   * 
   * @since v1.1.15 - Soporte para delay personalizado opcional
   */
  const createTimeoutWithCleanup = useCallback((
    callback: () => void,
    type: TimingType,
    key?: string,
    customDelay?: number
  ) => {
    const timeoutKey = key || `${type}_${Date.now()}`;
    const delay = customDelay !== undefined ? customDelay : getDelay(type);
    
    // Cancelar timeout existente si hay conflicto
    if (activeTimeouts.has(timeoutKey)) {
      clearTimeout(activeTimeouts.get(timeoutKey)!);
      activeTimeouts.delete(timeoutKey);
    }

    const timeout = setTimeout(() => {
      callback();
      activeTimeouts.delete(timeoutKey);
    }, delay);

    activeTimeouts.set(timeoutKey, timeout);
    
    // Retornar función de cleanup
    return () => {
      if (key) {
        cancelTimeout(key);
      } else {
        clearTimeout(timeout);
      }
    };
  }, [getDelay, cancelTimeout]);

  // 🤖 [IA] - FIX BUG #6: Cleanup automático de todos los timeouts en unmount
  useEffect(() => {
    return () => {
      cancelAllTimeouts();
    };
  }, [cancelAllTimeouts]);

  return {
    getDelay,
    createTimeout,
    cancelTimeout,
    cancelAllTimeouts,
    createTimeoutWithCleanup,
    timingConfig: TIMING_CONFIG
  };
};
