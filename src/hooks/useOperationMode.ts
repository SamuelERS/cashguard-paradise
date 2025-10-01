/**
 * 🤖 [IA] - Hook para gestión del modo de operación - v1.0.81
 * 
 * @description
 * Hook que gestiona el modo de operación del corte de caja:
 * - CASH_COUNT: Conteo matutino (solo efectivo, $50 fijo)
 * - CASH_CUT: Corte nocturno (efectivo + electrónico, con división)
 * 
 * @example
 * ```tsx
 * const {
 *   currentMode,
 *   selectMode,
 *   isCashCount,
 *   getModeInfo
 * } = useOperationMode();
 * 
 * // Seleccionar modo matutino
 * selectMode(OperationMode.CASH_COUNT);
 * 
 * // Obtener información del modo
 * const info = getModeInfo(); // { title, icon, description }
 * ```
 * 
 * @returns Objeto con modo actual y funciones de control
 */
import { useState, useCallback } from 'react';
import { OperationMode, OPERATION_MODES, OperationModeInfo } from '@/types/operation-mode';

export function useOperationMode() {
  const [currentMode, setCurrentMode] = useState<OperationMode | null>(null);

  const selectMode = useCallback((mode: OperationMode) => {
    setCurrentMode(mode);
  }, []);

  const resetMode = useCallback(() => {
    setCurrentMode(null);
  }, []);

  const getModeInfo = useCallback((): OperationModeInfo | null => {
    if (!currentMode) return null;
    return OPERATION_MODES[currentMode];
  }, [currentMode]);

  const isCashCount = currentMode === OperationMode.CASH_COUNT;
  const isCashCut = currentMode === OperationMode.CASH_CUT;

  return {
    currentMode,
    selectMode,
    resetMode,
    getModeInfo,
    isCashCount,
    isCashCut,
    hasSelectedMode: currentMode !== null
  };
}