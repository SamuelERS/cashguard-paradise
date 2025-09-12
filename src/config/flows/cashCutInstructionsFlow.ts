// 🤖 [IA] - v1.2.23: Arquitectura Guiada Basada en Datos - CashCutInstructionsFlow Configuration
import { Info, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

export interface InstructionRule {
  id: string;
  title: string;
  subtitle: string;
  Icon: typeof AlertTriangle;
  colors: {
    text: string;
    border: string;
    glow: string;
  };
  severity: 'info' | 'warning' | 'critical';
}

export interface InstructionRuleState {
  isChecked: boolean;
  isEnabled: boolean;
  isBeingReviewed: boolean;
  isHidden?: boolean; // 🤖 [IA] - Estado para revelación progresiva elegante
}

export interface InstructionsFlowState {
  rules: Record<string, InstructionRuleState>;
  currentRuleIndex: number;
  isFlowComplete: boolean;
}

// 🤖 [IA] - v1.2.23: Configuración de datos del flujo de instrucciones del corte de caja
// Fuente única de verdad para el flujo guiado secuencial
const cashCutInstructionsRules: InstructionRule[] = [
  {
    id: 'coinPackages',
    title: '💰 Paquetes de Monedas',
    subtitle: 'Agrupe en paquetes de 10 monedas de $0.01, $0.05, $0.10, $0.25 y $1.00.',
    Icon: Info,
    colors: {
      text: 'text-blue-500',
      border: 'border-l-blue-500',
      glow: 'shadow-blue-500/20'
    },
    severity: 'info'
  },
  {
    id: 'organizedBox',
    title: '📦 Caja Ordenada',
    subtitle: 'Coloque cada moneda, paquete y billete en su depósito: $1, $5, $10, $20, $50, $100.',
    Icon: Shield,
    colors: {
      text: 'text-green-500',
      border: 'border-l-green-500',
      glow: 'shadow-green-500/20'
    },
    severity: 'info'
  },
  {
    id: 'safeCounting',
    title: '🔢 Conteo Seguro',
    subtitle: 'Cuente cada denominación uno por uno, sin tapar la cámara de seguridad.',
    Icon: AlertTriangle,
    colors: {
      text: 'text-orange-500',
      border: 'border-l-orange-500',
      glow: 'shadow-orange-500/20'
    },
    severity: 'warning'
  },
  {
    id: 'finalConfirmation',
    title: '✅ Confirmación Final',
    subtitle: 'Una vez confirmado, el valor queda registrado y no podrá modificarse.',
    Icon: AlertTriangle,
    colors: {
      text: 'text-red-500',
      border: 'border-l-red-500',
      glow: 'shadow-red-500/20'
    },
    severity: 'critical'
  }
];

// 🤖 [IA] - v1.2.23: Array dinámico para randomización elegante
export let currentCashCutInstructions: InstructionRule[] = [...cashCutInstructionsRules];

// 🤖 [IA] - v1.2.23: Función shuffle Fisher-Yates para aleatoriedad real
const shuffleInstructions = (rules: InstructionRule[]): InstructionRule[] => {
  const shuffled = [...rules];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 🤖 [IA] - v1.2.23: Función pública para shuffle + factor sorpresa máximo
export const shuffleCashCutInstructions = (): InstructionRule[] => {
  currentCashCutInstructions = shuffleInstructions(cashCutInstructionsRules);
  // 🤖 [IA] - Debug: Console log para verificar orden aleatorio
  console.log('🎲 [Instrucciones] Nuevo orden aleatorio:', currentCashCutInstructions.map(r => r.title));
  return currentCashCutInstructions;
};

// 🤖 [IA] - v1.2.23: Export de reglas originales para compatibilidad
export const getOriginalInstructionsRules = (): InstructionRule[] => [...cashCutInstructionsRules];

// 🤖 [IA] - Estados iniciales del flujo con revelación progresiva + randomización
export const createInitialInstructionsState = (): InstructionsFlowState => ({
  rules: currentCashCutInstructions.reduce((acc, rule, index) => ({
    ...acc,
    [rule.id]: {
      isChecked: false,
      isEnabled: index === 0, // Solo la primera instrucción habilitada inicialmente
      isBeingReviewed: false,
      isHidden: index > 0 // Instrucciones futuras ocultas para revelación progresiva
    }
  }), {}),
  currentRuleIndex: 0,
  isFlowComplete: false
});

// 🤖 [IA] - Configuración de timing específica para el flujo guiado de instrucciones
export const INSTRUCTIONS_FLOW_TIMING = {
  ruleReview: 3000,     // Tiempo para lectura obligatoria de cada instrucción (3s para asegurar comprensión)
  nextRuleDelay: 300,   // Delay antes de habilitar siguiente instrucción
  pulseAnimation: 2000, // Duración de la animación de pulso
  completionDelay: 500  // Delay antes de marcar flujo como completo
} as const;