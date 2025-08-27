import { useCallback } from 'react';

/* 🤖 [IA] - Hook para timing unificado - Solución BUG #6 - v1.0.21 */
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

export const useTimingConfig = () => {
  // 🤖 [IA] - Obtener delay según tipo
  const getDelay = useCallback((type: TimingType): number => {
    return TIMING_CONFIG[type];
  }, []);

  // 🤖 [IA] - Crear timeout con cancelación automática de conflictos
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

  // 🤖 [IA] - Cancelar timeout específico
  const cancelTimeout = useCallback((key: string) => {
    if (activeTimeouts.has(key)) {
      clearTimeout(activeTimeouts.get(key)!);
      activeTimeouts.delete(key);
    }
  }, []);

  // 🤖 [IA] - Cancelar todos los timeouts activos
  const cancelAllTimeouts = useCallback(() => {
    activeTimeouts.forEach((timeout) => clearTimeout(timeout));
    activeTimeouts.clear();
  }, []);

  // 🤖 [IA] - Crear timeout con cleanup automático
  // 🤖 [IA] - v1.1.15: Soporte para delay personalizado opcional
  const createTimeoutWithCleanup = useCallback((
    callback: () => void,
    type: TimingType,
    key?: string,
    customDelay?: number  // Parámetro opcional para delay personalizado
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

  return {
    getDelay,
    createTimeout,
    cancelTimeout,
    cancelAllTimeouts,
    createTimeoutWithCleanup,
    timingConfig: TIMING_CONFIG
  };
};
