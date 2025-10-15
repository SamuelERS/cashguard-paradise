/**
 * 🤖 [IA] - Hook para flujo de checklist progresivo - v2.4.1
 * 🎯 [COMPLIANCE] - v1.2.41AD: Actualizado para soportar configuración dinámica desde datos externos
 * 🔧 [FIX] - Refactorizado con flat timeout pattern para prevenir race conditions
 * ✨ [v2.4.1] - Optimizado para 3 items: bolsaPreparada → efectivo → documentos
 *
 * @description
 * Hook especializado para Phase2Manager que implementa un checklist con revelación
 * progresiva. Los items se revelan secuencialmente a medida que se marcan los anteriores.
 * Incluye animaciones de activación y control de completitud.
 *
 * Compatible con phase2PreparationInstructions.ts (Doctrina D.5 Compliance)
 *
 * ⚠️ CAMBIO CRÍTICO v1.2.45:
 * - Eliminados nested timeouts (causaban freeze en mobile)
 * - Implementado flat timeout pattern con useEffect
 * - Cada progresión usa timeout independiente cancelable
 *
 * ✨ CAMBIO v2.4.1:
 * - Reducido de 4 a 3 items (eliminado 'entendido' redundante)
 * - IDs actualizados: bolsaPreparada, efectivo, documentos
 * - Flujo optimizado: Preparar bolsa → Separar efectivo → Enviar documentos
 * - Primer item habilitado inmediatamente (sin delay de 2s)
 *
 * @example
 * ```tsx
 * const {
 *   checkedItems,
 *   enabledItems,
 *   initializeChecklist,
 *   handleCheckChange,
 *   isChecklistComplete
 * } = useChecklistFlow();
 *
 * // Inicializar checklist
 * useEffect(() => {
 *   initializeChecklist();
 * }, []);
 *
 * // Manejar cambio de checkbox
 * <Checkbox
 *   checked={checkedItems.bolsaPreparada}
 *   onCheckedChange={() => handleCheckChange('bolsaPreparada')}
 * />
 * ```
 *
 * @returns Objeto con estado y funciones de control del checklist
 *
 * @property {ChecklistItems} checkedItems - Items marcados
 * @property {EnabledItems} enabledItems - Items habilitados para interacción
 * @property {HiddenItems} hiddenItems - Items ocultos (revelación progresiva)
 * @property {function} initializeChecklist - Inicializa el checklist
 * @property {function} handleCheckChange - Marca/desmarca un item
 * @property {function} isChecklistComplete - Verifica si todos los items están marcados
 * @property {function} getItemClassName - Obtiene clases CSS para animaciones
 * @property {function} isItemActivating - Verifica si un item está en animación
 */
import { useState, useCallback, useEffect } from 'react';
import { useTimingConfig } from './useTimingConfig';

// 🤖 [IA] - v2.4.1: Actualizados IDs para compatibilidad con phase2PreparationInstructions optimizadas
interface ChecklistItems {
  bolsaPreparada: boolean;
  efectivo: boolean;
  documentos: boolean;
}

interface EnabledItems {
  bolsaPreparada: boolean;
  efectivo: boolean;
  documentos: boolean;
}

interface HiddenItems {
  bolsaPreparada: boolean;
  efectivo: boolean;
  documentos: boolean;
}

const initialCheckedState: ChecklistItems = {
  bolsaPreparada: false,
  efectivo: false,
  documentos: false
};

const initialEnabledState: EnabledItems = {
  bolsaPreparada: true,   // 🤖 [IA] - v2.4.1: Habilitado desde inicio (sin delay)
  efectivo: false,
  documentos: false
};

const initialHiddenState: HiddenItems = {
  bolsaPreparada: false,    // Primera visible desde el inicio
  efectivo: true,           // Oculta inicialmente
  documentos: true          // Oculta inicialmente
};

export const useChecklistFlow = () => {
  const [checkedItems, setCheckedItems] = useState<ChecklistItems>(initialCheckedState);
  const [enabledItems, setEnabledItems] = useState<EnabledItems>(initialEnabledState);
  const [hiddenItems, setHiddenItems] = useState<HiddenItems>(initialHiddenState);
  const { createTimeoutWithCleanup } = useTimingConfig();

  // 🤖 [IA] - v2.4.1: Inicializar flujo de checklist con primer item habilitado inmediatamente
  const initializeChecklist = useCallback(() => {
    setCheckedItems(initialCheckedState);
    setEnabledItems(initialEnabledState);  // bolsaPreparada ya está en true
    setHiddenItems(initialHiddenState);
    // 🤖 [IA] - v2.4.1: Eliminado timeout de 2s - primer item habilitado desde estado inicial
  }, []);

  // 🤖 [IA] - v2.4.1: FLAT TIMEOUT PATTERN - Progresión BolsaPreparada → Efectivo (600ms reveal)
  useEffect(() => {
    if (checkedItems.bolsaPreparada && hiddenItems.efectivo) {
      const cleanup = createTimeoutWithCleanup(() => {
        setHiddenItems(prev => ({ ...prev, efectivo: false }));
      }, 'transition', 'checklist_efectivo_reveal', 600);
      return cleanup;
    }
  }, [checkedItems.bolsaPreparada, hiddenItems.efectivo, createTimeoutWithCleanup]);

  // 🤖 [IA] - v2.4.1: FLAT TIMEOUT PATTERN - Progresión BolsaPreparada → Efectivo (2000ms enable)
  useEffect(() => {
    if (checkedItems.bolsaPreparada && !hiddenItems.efectivo && !enabledItems.efectivo) {
      const cleanup = createTimeoutWithCleanup(() => {
        setEnabledItems(prev => ({ ...prev, efectivo: true }));
      }, 'transition', 'checklist_efectivo_enable', 2000);
      return cleanup;
    }
  }, [checkedItems.bolsaPreparada, hiddenItems.efectivo, enabledItems.efectivo, createTimeoutWithCleanup]);

  // 🤖 [IA] - v2.4.1: FLAT TIMEOUT PATTERN - Progresión Efectivo → Documentos (600ms reveal)
  useEffect(() => {
    if (checkedItems.efectivo && checkedItems.bolsaPreparada && hiddenItems.documentos) {
      const cleanup = createTimeoutWithCleanup(() => {
        setHiddenItems(prev => ({ ...prev, documentos: false }));
      }, 'transition', 'checklist_documentos_reveal', 600);
      return cleanup;
    }
  }, [checkedItems.efectivo, checkedItems.bolsaPreparada, hiddenItems.documentos, createTimeoutWithCleanup]);

  // 🤖 [IA] - v2.4.1: FLAT TIMEOUT PATTERN - Progresión Efectivo → Documentos (2000ms enable)
  useEffect(() => {
    if (checkedItems.efectivo && checkedItems.bolsaPreparada && !hiddenItems.documentos && !enabledItems.documentos) {
      const cleanup = createTimeoutWithCleanup(() => {
        setEnabledItems(prev => ({ ...prev, documentos: true }));
      }, 'transition', 'checklist_documentos_enable', 2000);
      return cleanup;
    }
  }, [checkedItems.efectivo, checkedItems.bolsaPreparada, hiddenItems.documentos, enabledItems.documentos, createTimeoutWithCleanup]);

  // 🤖 [IA] - v2.4.1: Eliminadas progresiones de 4to item (ahora solo 3 items)

  // 🤖 [IA] - v1.2.45: Manejar cambio de estado de checkbox (SIMPLIFICADO - sin nested timeouts)
  const handleCheckChange = useCallback((item: keyof ChecklistItems) => {
    if (!enabledItems[item]) return;

    setCheckedItems(prev => ({ ...prev, [item]: !prev[item] }));
    // ✅ Progresión automática manejada por useEffect independientes arriba
  }, [enabledItems]);

  // 🤖 [IA] - Verificar si todos los items están completos
  const isChecklistComplete = useCallback(() => {
    return Object.values(checkedItems).every(checked => checked);
  }, [checkedItems]);

  // 🤖 [IA] - Obtener estado visual de un item con revelación progresiva
  const getItemClassName = useCallback((item: keyof ChecklistItems) => {
    if (hiddenItems[item]) return 'checklist-item checklist-item-hidden';
    if (checkedItems[item]) return 'checklist-item checklist-item-checked';
    if (enabledItems[item]) return 'checklist-item checklist-item-enabled';
    return 'checklist-item';
  }, [checkedItems, enabledItems, hiddenItems]);

  // 🤖 [IA] - v2.4.1: Verificar si un item está en proceso de activación (actualizado para 3 items)
  const isItemActivating = useCallback((item: keyof ChecklistItems) => {
    const itemOrder = ['bolsaPreparada', 'efectivo', 'documentos'] as const;
    const currentIndex = itemOrder.indexOf(item);
    if (currentIndex === 0) return false;

    const previousItem = itemOrder[currentIndex - 1];
    return checkedItems[previousItem] && !enabledItems[item];
  }, [checkedItems, enabledItems]);

  return {
    checkedItems,
    enabledItems,
    hiddenItems,
    initializeChecklist,
    handleCheckChange,
    isChecklistComplete,
    getItemClassName,
    isItemActivating
  };
};