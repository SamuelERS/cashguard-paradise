// > [CTO] v3.1.2 - Inicio de Misión M-V3-DELTA. Estructura base del hook useInstructionFlow.
import { useReducer, useCallback, useEffect } from 'react';

// Tipos de datos que el hook manejará
export type InstructionIconName =
  | 'Package'
  | 'FileText'
  | 'Banknote'
  | 'Receipt'
  | 'PackagePlus';

export interface Instruction {
  id: string;
  icon: InstructionIconName;
  title: string;
  description: string;
  minReviewTimeMs: number; // Mínimo tiempo de revisión
}

// La forma de nuestro estado
interface InstructionFlowState {
  instructions: Instruction[];
  instructionStates: Record<string, 'hidden' | 'enabled' | 'reviewing' | 'checked'>;
  currentInstructionIndex: number;
  isFlowComplete: boolean;
  timingData: Record<string, { startTime: number | null }>;
}

// Las acciones que pueden modificar nuestro estado
type Action =
  | { type: 'START_FLOW'; payload: Instruction[] }
  | { type: 'ACKNOWLEDGE_INSTRUCTION'; payload: { instructionId: string } }
  | { type: 'COMPLETE_INSTRUCTION'; payload: { instructionId: string } };

// Estado inicial del wizard
const initialState: InstructionFlowState = {
  instructions: [],
  instructionStates: {},
  currentInstructionIndex: -1,
  isFlowComplete: false,
  timingData: {},
};

// El reducer que maneja las transiciones de estado
function instructionFlowReducer(state: InstructionFlowState, action: Action): InstructionFlowState {
  switch (action.type) {
    case 'START_FLOW': {
      const initialStates = action.payload.reduce((acc, instruction, index) => {
        acc[instruction.id] = index === 0 ? 'enabled' : 'hidden';
        return acc;
      }, {} as Record<string, 'hidden' | 'enabled' | 'reviewing' | 'checked'>);

      return {
        ...initialState,
        instructions: action.payload,
        instructionStates: initialStates,
        currentInstructionIndex: 0,
      };
    }

    case 'ACKNOWLEDGE_INSTRUCTION': {
      // Marcar la instrucción actual como 'reviewing'
      const newStates = { ...state.instructionStates };
      newStates[action.payload.instructionId] = 'reviewing';

      const newTimingData = { ...state.timingData };
      newTimingData[action.payload.instructionId] = { startTime: Date.now() };

      return { ...state, instructionStates: newStates, timingData: newTimingData };
    }

    case 'COMPLETE_INSTRUCTION': {
      const timing = state.timingData[action.payload.instructionId];
      const instruction = state.instructions.find(i => i.id === action.payload.instructionId);
      const elapsed = timing?.startTime ? Date.now() - timing.startTime : 0;

      // VALIDACIÓN ANTI-FRAUDE:
      if (!instruction || elapsed < instruction.minReviewTimeMs) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`VALIDATION FAILED: Timing too short for ${instruction?.id}. Required: ${instruction?.minReviewTimeMs}ms, Actual: ${elapsed}ms`);
        }
        return state; // No se actualiza el estado si no se cumple el tiempo
      }

      // Marcar la instrucción como 'checked' y habilitar la siguiente
      const newStates = { ...state.instructionStates };
      newStates[action.payload.instructionId] = 'checked';

      const nextIndex = state.currentInstructionIndex + 1;
      const isFlowNowComplete = nextIndex >= state.instructions.length;

      if (!isFlowNowComplete) {
        const nextInstructionId = state.instructions[nextIndex].id;
        newStates[nextInstructionId] = 'enabled';
      }

      return {
        ...state,
        instructionStates: newStates,
        currentInstructionIndex: nextIndex,
        isFlowComplete: isFlowNowComplete,
      };
    }

    default:
      return state;
  }
}

// El hook que encapsula toda la lógica
export function useInstructionFlow() {
  const [state, dispatch] = useReducer(instructionFlowReducer, initialState);

  // 🤖 [IA] - v1.2.26: FASE 3 - Auto-completion tras minReviewTimeMs
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];

    // Buscar instrucciones en estado 'reviewing' para auto-completar
    Object.entries(state.instructionStates).forEach(([instructionId, instructionState]) => {
      if (instructionState === 'reviewing') {
        const instruction = state.instructions.find(i => i.id === instructionId);
        const timing = state.timingData[instructionId];

        if (instruction && timing?.startTime) {
          const elapsed = Date.now() - timing.startTime;

          // Si ya pasó el tiempo mínimo, auto-completar
          if (elapsed >= instruction.minReviewTimeMs) {
            dispatch({ type: 'COMPLETE_INSTRUCTION', payload: { instructionId } });
          } else {
            // Programar auto-completion para cuando cumpla el tiempo
            const remainingTime = instruction.minReviewTimeMs - elapsed;
            const timeout = setTimeout(() => {
              dispatch({ type: 'COMPLETE_INSTRUCTION', payload: { instructionId } });
            }, remainingTime);
            timeouts.push(timeout);
          }
        }
      }
    });

    // 🤖 [IA] - FIX: Cleanup para prevenir race conditions en CI
    // Cancelar todos los timeouts cuando el efecto se re-ejecuta o el componente se desmonta
    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [state.instructionStates, state.instructions, state.timingData]);

  return {
    state,
    startFlow: useCallback((instructions: Instruction[]) => {
      dispatch({ type: 'START_FLOW', payload: instructions });
    }, []),
    acknowledgeInstruction: useCallback((instructionId: string) => {
      dispatch({ type: 'ACKNOWLEDGE_INSTRUCTION', payload: { instructionId } });
    }, []),
    completeInstruction: useCallback((instructionId: string) => {
      dispatch({ type: 'COMPLETE_INSTRUCTION', payload: { instructionId } });
    }, []),
  };
}
