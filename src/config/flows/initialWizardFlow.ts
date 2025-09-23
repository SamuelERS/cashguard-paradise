// [IA] - Arquitectura Guiada Basada en Datos v1.0 - InitialWizardFlow Configuration
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react';

export interface ProtocolRule {
  id: string;
  title: string;
  subtitle: string;
  Icon: typeof AlertTriangle;
  colors: {
    text: string;
    border: string;
    glow: string;
  };
  severity: 'critical' | 'warning';
}

export interface RuleState {
  isChecked: boolean;
  isEnabled: boolean;
  isBeingReviewed: boolean;
  isHidden?: boolean; // [IA] - Estado para revelación progresiva elegante
}

export interface RulesFlowState {
  rules: Record<string, RuleState>;
  currentRuleIndex: number;
  isFlowComplete: boolean;
}

// [IA] - Configuración de datos del flujo de reglas del protocolo
// Fuente única de verdad para el flujo guiado secuencial
const protocolRules: ProtocolRule[] = [
  {
    id: 'noDevices',
    title: 'Si Fallan Repiten Corte',
    Icon: AlertTriangle,
    colors: {
      text: 'text-red-500',
      border: 'border-l-red-500',
      glow: 'shadow-red-500/20'
    },
    severity: 'critical'
  },
  {
    id: 'singleCount',
    title: 'No Pueden Usar Calculadoras',
    Icon: Shield,
    colors: {
      text: 'text-red-500',
      border: 'border-l-red-500',
      glow: 'shadow-red-500/20'
    },
    severity: 'critical'
  },
  {
    id: 'differentCashier',
    title: 'Abran WhatsApp Web',
    Icon: CheckCircle,
    colors: {
      text: 'text-red-500',
      border: 'border-l-red-500',
      glow: 'shadow-red-500/20'
    },
    severity: 'critical'
  },
  {
    id: 'activeSystem',
    title: 'Cajero y Testigo Presentes',
    Icon: AlertTriangle,
    colors: {
      text: 'text-orange-400',
      border: 'border-l-orange-400',
      glow: 'shadow-orange-400/20'
    },
    severity: 'warning'
  }
];

// [IA] - v3.0.0: Array dinámico para randomización elegante
export let currentProtocolRules: ProtocolRule[] = [...protocolRules];

// [IA] - v3.0.0: Función shuffle Fisher-Yates para aleatoriedad real
const shuffleRules = (rules: ProtocolRule[]): ProtocolRule[] => {
  const shuffled = [...rules];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// [IA] - v3.0.0: Función pública para shuffle + factor sorpresa máximo
export const shuffleProtocolRules = (): ProtocolRule[] => {
  currentProtocolRules = shuffleRules(protocolRules);
  // [IA] - Debug: Console log para verificar orden aleatorio
  console.log(' [Protocolo] Nuevo orden aleatorio:', currentProtocolRules.map(r => r.title));
  return currentProtocolRules;
};

// [IA] - v3.0.0: Export de reglas originales para compatibilidad
export const getOriginalProtocolRules = (): ProtocolRule[] => [...protocolRules];

// [IA] - Estados iniciales del flujo con revelación progresiva + randomización
export const createInitialRulesState = (): RulesFlowState => ({
  rules: currentProtocolRules.reduce((acc, rule, index) => ({
    ...acc,
    [rule.id]: {
      isChecked: false,
      isEnabled: index === 0, // Solo la primera regla está habilitada inicialmente
      isBeingReviewed: false,
      isHidden: index > 0 // Reglas futuras ocultas para revelación progresiva
    }
  }), {}),
  currentRuleIndex: 0,
  isFlowComplete: false
});

// [IA] - Configuración de timing específica para el flujo guiado
export const RULES_FLOW_TIMING = {
  ruleReview: 3000,     // Tiempo para lectura obligatoria de cada regla (3s para asegurar comprensión)
  nextRuleDelay: 300,   // Delay antes de habilitar siguiente regla
  pulseAnimation: 2000, // Duración de la animación de pulso
  completionDelay: 500  // Delay antes de marcar flujo como completo
} as const;
