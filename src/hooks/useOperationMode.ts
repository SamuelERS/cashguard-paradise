// 🤖 [IA] - v1.0.81 - Hook para manejar el modo de operación
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