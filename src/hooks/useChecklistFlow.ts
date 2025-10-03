/**
 * 🤖 [IA] - Hook para flujo de checklist progresivo - v1.2.45
 * 🎯 [COMPLIANCE] - v1.2.41AD: Actualizado para soportar configuración dinámica desde datos externos
 * 🔧 [FIX] - Refactorizado con flat timeout pattern para prevenir race conditions
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
 *   checked={checkedItems.bolsa}
 *   onCheckedChange={() => handleCheckChange('bolsa')}
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

interface ChecklistItems {
  bolsa: boolean;
  tirro: boolean;
  espacio: boolean;
  entendido: boolean;
}

interface EnabledItems {
  bolsa: boolean;
  tirro: boolean;
  espacio: boolean;
  entendido: boolean;
}

interface HiddenItems {
  bolsa: boolean;
  tirro: boolean;
  espacio: boolean;
  entendido: boolean;
}

const initialCheckedState: ChecklistItems = {
  bolsa: false,
  tirro: false,
  espacio: false,
  entendido: false
};

const initialEnabledState: EnabledItems = {
  bolsa: false,
  tirro: false,
  espacio: false,
  entendido: false
};

const initialHiddenState: HiddenItems = {
  bolsa: false,    // Primera visible desde el inicio
  tirro: true,     // Oculta inicialmente
  espacio: true,   // Oculta inicialmente
  entendido: true  // Oculta inicialmente
};

export const useChecklistFlow = () => {
  const [checkedItems, setCheckedItems] = useState<ChecklistItems>(initialCheckedState);
  const [enabledItems, setEnabledItems] = useState<EnabledItems>(initialEnabledState);
  const [hiddenItems, setHiddenItems] = useState<HiddenItems>(initialHiddenState);
  const { createTimeoutWithCleanup } = useTimingConfig();

  // 🤖 [IA] - Inicializar flujo de checklist con revelación progresiva
  const initializeChecklist = useCallback(() => {
    setCheckedItems(initialCheckedState);
    setEnabledItems(initialEnabledState);
    setHiddenItems(initialHiddenState);

    // Activar primer item después de 2s
    const cleanup = createTimeoutWithCleanup(() => {
      setEnabledItems(prev => ({ ...prev, bolsa: true }));
    }, 'transition', 'checklist_init', 2000);

    return cleanup;
  }, [createTimeoutWithCleanup]);

  // 🤖 [IA] - v1.2.45: FLAT TIMEOUT PATTERN - Progresión Bolsa → Tirro (600ms reveal)
  useEffect(() => {
    if (checkedItems.bolsa && hiddenItems.tirro) {
      const cleanup = createTimeoutWithCleanup(() => {
        setHiddenItems(prev => ({ ...prev, tirro: false }));
      }, 'transition', 'checklist_tirro_reveal', 600);
      return cleanup;
    }
  }, [checkedItems.bolsa, hiddenItems.tirro, createTimeoutWithCleanup]);

  // 🤖 [IA] - v1.2.45: FLAT TIMEOUT PATTERN - Progresión Bolsa → Tirro (2000ms enable)
  useEffect(() => {
    if (checkedItems.bolsa && !hiddenItems.tirro && !enabledItems.tirro) {
      const cleanup = createTimeoutWithCleanup(() => {
        setEnabledItems(prev => ({ ...prev, tirro: true }));
      }, 'transition', 'checklist_tirro_enable', 2000);
      return cleanup;
    }
  }, [checkedItems.bolsa, hiddenItems.tirro, enabledItems.tirro, createTimeoutWithCleanup]);

  // 🤖 [IA] - v1.2.45: FLAT TIMEOUT PATTERN - Progresión Tirro → Espacio (600ms reveal)
  useEffect(() => {
    if (checkedItems.tirro && checkedItems.bolsa && hiddenItems.espacio) {
      const cleanup = createTimeoutWithCleanup(() => {
        setHiddenItems(prev => ({ ...prev, espacio: false }));
      }, 'transition', 'checklist_espacio_reveal', 600);
      return cleanup;
    }
  }, [checkedItems.tirro, checkedItems.bolsa, hiddenItems.espacio, createTimeoutWithCleanup]);

  // 🤖 [IA] - v1.2.45: FLAT TIMEOUT PATTERN - Progresión Tirro → Espacio (2000ms enable)
  useEffect(() => {
    if (checkedItems.tirro && checkedItems.bolsa && !hiddenItems.espacio && !enabledItems.espacio) {
      const cleanup = createTimeoutWithCleanup(() => {
        setEnabledItems(prev => ({ ...prev, espacio: true }));
      }, 'transition', 'checklist_espacio_enable', 2000);
      return cleanup;
    }
  }, [checkedItems.tirro, checkedItems.bolsa, hiddenItems.espacio, enabledItems.espacio, createTimeoutWithCleanup]);

  // 🤖 [IA] - v1.2.45: FLAT TIMEOUT PATTERN - Progresión Espacio → Entendido (600ms reveal)
  useEffect(() => {
    if (checkedItems.espacio && checkedItems.tirro && checkedItems.bolsa && hiddenItems.entendido) {
      const cleanup = createTimeoutWithCleanup(() => {
        setHiddenItems(prev => ({ ...prev, entendido: false }));
      }, 'transition', 'checklist_entendido_reveal', 600);
      return cleanup;
    }
  }, [checkedItems.espacio, checkedItems.tirro, checkedItems.bolsa, hiddenItems.entendido, createTimeoutWithCleanup]);

  // 🤖 [IA] - v1.2.45: FLAT TIMEOUT PATTERN - Progresión Espacio → Entendido (2000ms enable)
  useEffect(() => {
    if (checkedItems.espacio && checkedItems.tirro && checkedItems.bolsa && !hiddenItems.entendido && !enabledItems.entendido) {
      const cleanup = createTimeoutWithCleanup(() => {
        setEnabledItems(prev => ({ ...prev, entendido: true }));
      }, 'transition', 'checklist_entendido_enable', 2000);
      return cleanup;
    }
  }, [checkedItems.espacio, checkedItems.tirro, checkedItems.bolsa, hiddenItems.entendido, enabledItems.entendido, createTimeoutWithCleanup]);

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

  // 🤖 [IA] - Verificar si un item está en proceso de activación
  const isItemActivating = useCallback((item: keyof ChecklistItems) => {
    const itemOrder = ['bolsa', 'tirro', 'espacio', 'entendido'] as const;
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