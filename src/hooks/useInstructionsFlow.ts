// 🤖 [IA] - v1.2.23: Hook para gestión del flujo guiado de instrucciones del corte de caja + Performance Optimized
import { useReducer, useCallback, useRef } from 'react';
import { useTimingConfig } from './useTimingConfig';
import { 
  InstructionsFlowState, 
  createInitialInstructionsState, 
  currentCashCutInstructions,
  shuffleCashCutInstructions,
  INSTRUCTIONS_FLOW_TIMING,
  InstructionRuleState
} from '@/config/flows/cashCutInstructionsFlow';

// 🤖 [IA] - Acciones del reducer para el flujo de instrucciones
type InstructionsFlowAction =
  | { type: 'INITIALIZE_INSTRUCTIONS' }
  | { type: 'ACKNOWLEDGE_INSTRUCTION'; payload: { instructionId: string; index: number } }
  | { type: 'ENABLE_NEXT_INSTRUCTION'; payload: { nextIndex: number } }
  | { type: 'SET_INSTRUCTION_REVIEWING'; payload: { instructionId: string; isReviewing: boolean } }
  | { type: 'COMPLETE_FLOW' }
  | { type: 'RESET_FLOW' };

// 🤖 [IA] - Reducer para gestión de estado del flujo de instrucciones
const instructionsFlowReducer = (state: InstructionsFlowState, action: InstructionsFlowAction): InstructionsFlowState => {
  switch (action.type) {
    case 'INITIALIZE_INSTRUCTIONS':
      return createInitialInstructionsState();

    case 'ACKNOWLEDGE_INSTRUCTION': {
      const { instructionId } = action.payload;
      return {
        ...state,
        rules: {
          ...state.rules,
          [instructionId]: {
            ...state.rules[instructionId],
            isChecked: true,
            isBeingReviewed: true
          }
        }
      };
    }

    case 'ENABLE_NEXT_INSTRUCTION': {
      const { nextIndex } = action.payload;
      const currentInstruction = currentCashCutInstructions[state.currentRuleIndex];
      
      // Si no hay siguiente instrucción, completar flujo
      if (nextIndex >= currentCashCutInstructions.length) {
        return {
          ...state,
          rules: {
            ...state.rules,
            [currentInstruction.id]: {
              ...state.rules[currentInstruction.id],
              isBeingReviewed: false
            }
          },
          isFlowComplete: true
        };
      }

      const nextInstruction = currentCashCutInstructions[nextIndex];
      return {
        ...state,
        rules: {
          ...state.rules,
          [currentInstruction.id]: {
            ...state.rules[currentInstruction.id],
            isBeingReviewed: false
          },
          [nextInstruction.id]: {
            ...state.rules[nextInstruction.id],
            isEnabled: true,
            isHidden: false // 🤖 [IA] - Revelar instrucción al habilitarse
          }
        },
        currentRuleIndex: nextIndex
      };
    }

    case 'SET_INSTRUCTION_REVIEWING': {
      const { instructionId, isReviewing } = action.payload;
      return {
        ...state,
        rules: {
          ...state.rules,
          [instructionId]: {
            ...state.rules[instructionId],
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
      return createInitialInstructionsState();

    default:
      return state;
  }
};

// 🤖 [IA] - Hook principal para el flujo guiado de instrucciones
export const useInstructionsFlow = () => {
  const [state, dispatch] = useReducer(instructionsFlowReducer, createInitialInstructionsState());
  const { createTimeoutWithCleanup } = useTimingConfig();

  // 🤖 [IA] - v1.2.23: Inicializar el flujo con randomización para factor sorpresa
  const initializeFlow = useCallback(() => {
    shuffleCashCutInstructions(); // 🎲 Nuevo orden aleatorio cada vez
    dispatch({ type: 'INITIALIZE_INSTRUCTIONS' });
  }, []);

  // 🤖 [IA] - Debouncing ref para prevenir múltiples clicks accidentales
  const debounceRef = useRef<{ [key: string]: boolean }>({});

  // 🤖 [IA] - Manejar reconocimiento de una instrucción (con debouncing optimizado)
  const acknowledgeInstruction = useCallback((instructionId: string, index: number) => {
    // Solo permitir si la instrucción está habilitada
    if (!state.rules[instructionId]?.isEnabled) return;
    
    // Debouncing: prevenir múltiples clicks en 300ms
    if (debounceRef.current[instructionId]) return;
    debounceRef.current[instructionId] = true;
    
    // Reset debouncing después de 300ms
    setTimeout(() => {
      debounceRef.current[instructionId] = false;
    }, 300);

    // Marcar instrucción como reconocida
    dispatch({ type: 'ACKNOWLEDGE_INSTRUCTION', payload: { instructionId, index } });

    // Después del tiempo de revisión, habilitar siguiente instrucción
    const cleanup = createTimeoutWithCleanup(
      () => {
        const nextIndex = index + 1;
        dispatch({ type: 'ENABLE_NEXT_INSTRUCTION', payload: { nextIndex } });
      },
      'transition',
      `instruction_transition_${instructionId}`,
      INSTRUCTIONS_FLOW_TIMING.ruleReview
    );

    return cleanup;
  }, [state.rules, createTimeoutWithCleanup]);

  // 🤖 [IA] - Verificar si el flujo está completo
  const isFlowCompleted = useCallback(() => {
    return state.isFlowComplete;
  }, [state.isFlowComplete]);

  // 🤖 [IA] - Obtener estado de una instrucción específica (memoizado para performance)
  const getInstructionState = useCallback((instructionId: string) => {
    return state.rules[instructionId];
  }, [state.rules]);

  // 🤖 [IA] - Verificar si una instrucción puede ser interactuada
  const canInteractWithInstruction = useCallback((instructionId: string) => {
    const instructionState = state.rules[instructionId];
    return instructionState?.isEnabled && !instructionState?.isChecked;
  }, [state.rules]);

  // 🤖 [IA] - Reset del flujo
  const resetFlow = useCallback(() => {
    dispatch({ type: 'RESET_FLOW' });
  }, []);

  // 🤖 [IA] - Obtener progreso del flujo (0-100%) - optimizado para evitar recálculos
  const getFlowProgress = useCallback(() => {
    const totalInstructions = currentCashCutInstructions.length;
    const checkedInstructions = (Object.values(state.rules) as InstructionRuleState[]).filter(instruction => instruction.isChecked).length;
    return Math.round((checkedInstructions / totalInstructions) * 100);
  }, [state.rules]);

  return {
    state,
    initializeFlow,
    acknowledgeInstruction,
    isFlowCompleted,
    getInstructionState,
    canInteractWithInstruction,
    resetFlow,
    getFlowProgress,
    currentInstructionIndex: state.currentRuleIndex,
    totalInstructions: currentCashCutInstructions.length
  };
};