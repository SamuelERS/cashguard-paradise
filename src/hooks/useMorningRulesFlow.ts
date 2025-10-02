// 🤖 [IA] - v1.2.38: Hook especializado para Morning Count Protocol
// Wrapper de useRulesFlow con configuración específica para conteo matutino
import { useReducer, useCallback, useRef } from 'react';
import { useTimingConfig } from './useTimingConfig';
import {
  RulesFlowState,
  RuleState,
  createInitialMorningRulesState,
  morningProtocolRules,
  shuffleMorningRules,
  RULES_FLOW_TIMING
} from '@/config/flows/initialWizardFlow';

// 🤖 [IA] - Acciones del reducer (idénticas a useRulesFlow)
type RulesFlowAction =
  | { type: 'INITIALIZE_RULES' }
  | { type: 'ACKNOWLEDGE_RULE'; payload: { ruleId: string; index: number } }
  | { type: 'ENABLE_NEXT_RULE'; payload: { nextIndex: number } }
  | { type: 'SET_RULE_REVIEWING'; payload: { ruleId: string; isReviewing: boolean } }
  | { type: 'COMPLETE_FLOW' }
  | { type: 'RESET_FLOW' };

// 🤖 [IA] - Reducer para gestión de estado (usa morningProtocolRules)
const morningRulesFlowReducer = (state: RulesFlowState, action: RulesFlowAction): RulesFlowState => {
  switch (action.type) {
    case 'INITIALIZE_RULES':
      return createInitialMorningRulesState();

    case 'ACKNOWLEDGE_RULE': {
      const { ruleId } = action.payload;
      return {
        ...state,
        rules: {
          ...state.rules,
          [ruleId]: {
            ...state.rules[ruleId],
            isChecked: true,
            isBeingReviewed: true
          }
        }
      };
    }

    case 'ENABLE_NEXT_RULE': {
      const { nextIndex } = action.payload;
      const currentRule = morningProtocolRules[state.currentRuleIndex];

      // Si no hay siguiente regla, completar flujo
      if (nextIndex >= morningProtocolRules.length) {
        return {
          ...state,
          rules: {
            ...state.rules,
            [currentRule.id]: {
              ...state.rules[currentRule.id],
              isBeingReviewed: false
            }
          },
          isFlowComplete: true
        };
      }

      const nextRule = morningProtocolRules[nextIndex];
      return {
        ...state,
        rules: {
          ...state.rules,
          [currentRule.id]: {
            ...state.rules[currentRule.id],
            isBeingReviewed: false
          },
          [nextRule.id]: {
            ...state.rules[nextRule.id],
            isEnabled: true,
            isHidden: false
          }
        },
        currentRuleIndex: nextIndex
      };
    }

    case 'SET_RULE_REVIEWING': {
      const { ruleId, isReviewing } = action.payload;
      return {
        ...state,
        rules: {
          ...state.rules,
          [ruleId]: {
            ...state.rules[ruleId],
            isBeingReviewed: isReviewing
          }
        }
      };
    }

    case 'COMPLETE_FLOW':
      return {
        ...state,
        isFlowComplete: true
      };

    case 'RESET_FLOW':
      return createInitialMorningRulesState();

    default:
      return state;
  }
};

// 🤖 [IA] - Hook principal para el flujo guiado de reglas del Morning Count
export const useMorningRulesFlow = () => {
  const [state, dispatch] = useReducer(morningRulesFlowReducer, createInitialMorningRulesState());
  const { createTimeoutWithCleanup } = useTimingConfig();

  // 🤖 [IA] - STALE CLOSURE FIX: useRef para mantener referencia actual al estado
  const stateRef = useRef(state);
  stateRef.current = state;

  // 🤖 [IA] - Inicializar el flujo
  const initializeFlow = useCallback(() => {
    shuffleMorningRules(); // Sin randomización, orden estático
    dispatch({ type: 'INITIALIZE_RULES' });
  }, []);

  // 🤖 [IA] - Debouncing ref para prevenir múltiples clicks accidentales
  const debounceRef = useRef<{ [key: string]: boolean }>({});

  // 🤖 [IA] - Manejar reconocimiento de una regla (con debouncing optimizado)
  const acknowledgeRule = useCallback((ruleId: string, index: number) => {
    // Solo permitir si la regla está habilitada
    if (!stateRef.current.rules[ruleId]?.isEnabled) return;

    // Debouncing: prevenir múltiples clicks en 300ms
    if (debounceRef.current[ruleId]) return;
    debounceRef.current[ruleId] = true;

    // Reset debouncing después de 300ms
    setTimeout(() => {
      debounceRef.current[ruleId] = false;
    }, 300);

    // Marcar regla como reconocida
    dispatch({ type: 'ACKNOWLEDGE_RULE', payload: { ruleId, index } });

    // Después del tiempo de revisión, habilitar siguiente regla
    const cleanup = createTimeoutWithCleanup(
      () => {
        const nextIndex = index + 1;
        dispatch({ type: 'ENABLE_NEXT_RULE', payload: { nextIndex } });
      },
      'transition',
      `rule_transition_${ruleId}`,
      RULES_FLOW_TIMING.ruleReview
    );

    return cleanup;
  }, [createTimeoutWithCleanup]);

  // 🤖 [IA] - Verificar si el flujo está completo
  const isFlowCompleted = useCallback(() => {
    return state.isFlowComplete;
  }, [state.isFlowComplete]);

  // 🤖 [IA] - Obtener estado de una regla específica (memoizado para performance)
  const getRuleState = useCallback((ruleId: string) => {
    return state.rules[ruleId];
  }, [state.rules]);

  // 🤖 [IA] - Verificar si una regla puede ser interactuada
  const canInteractWithRule = useCallback((ruleId: string) => {
    const ruleState = state.rules[ruleId];
    return ruleState?.isEnabled && !ruleState?.isChecked;
  }, [state.rules]);

  // 🤖 [IA] - Reset del flujo
  const resetFlow = useCallback(() => {
    dispatch({ type: 'RESET_FLOW' });
  }, []);

  // 🤖 [IA] - Obtener progreso del flujo (0-100%)
  const getFlowProgress = useCallback(() => {
    const totalRules = morningProtocolRules.length;
    const checkedRules = (Object.values(state.rules) as RuleState[]).filter(rule => rule.isChecked).length;
    return Math.round((checkedRules / totalRules) * 100);
  }, [state.rules]);

  return {
    state,
    initializeFlow,
    acknowledgeRule,
    isFlowCompleted,
    getRuleState,
    canInteractWithRule,
    resetFlow,
    getFlowProgress,
    currentRuleIndex: state.currentRuleIndex,
    totalRules: morningProtocolRules.length
  };
};
