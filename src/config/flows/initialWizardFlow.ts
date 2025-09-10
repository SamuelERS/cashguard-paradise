// 🤖 [IA] - Arquitectura Guiada Basada en Datos v1.0 - InitialWizardFlow Configuration
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
  isHidden?: boolean; // 🤖 [IA] - Estado para revelación progresiva elegante
}

export interface RulesFlowState {
  rules: Record<string, RuleState>;
  currentRuleIndex: number;
  isFlowComplete: boolean;
}

// 🤖 [IA] - Configuración de datos del flujo de reglas del protocolo
// Fuente única de verdad para el flujo guiado secuencial
export const protocolRules: ProtocolRule[] = [
  {
    id: 'noDevices',
    title: '🧾 Gastos Anotados',
    subtitle: '¿Ya Revisaron todas las salidas?',
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
    title: '💳 Cierres de POS',
    subtitle: '¿Credomatic y Promerica?',
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
    title: '🔄 Transferencias Revisadas',
    subtitle: '¿Hay Transferecias por Procesar?',
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
    title: '👥 Doble Verificación',
    subtitle: '¿Cajero + Testigo estan Presentes?',
    Icon: AlertTriangle,
    colors: {
      text: 'text-orange-400',
      border: 'border-l-orange-400',
      glow: 'shadow-orange-400/20'
    },
    severity: 'warning'
  },
  {
    id: 'errorConsequence',
    title: '⚠️ Política de Errores',
    subtitle: 'Si Cometen Errores - Deberán Reiniciar Conteo de 0',
    Icon: AlertTriangle,
    colors: {
      text: 'text-yellow-500',
      border: 'border-l-yellow-500',
      glow: 'shadow-yellow-500/20'
    },
    severity: 'warning'
  }
];

// 🤖 [IA] - Estados iniciales del flujo con revelación progresiva
export const createInitialRulesState = (): RulesFlowState => ({
  rules: protocolRules.reduce((acc, rule, index) => ({
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

// 🤖 [IA] - Configuración de timing específica para el flujo guiado
export const RULES_FLOW_TIMING = {
  ruleReview: 3000,     // Tiempo para lectura obligatoria de cada regla (3s para asegurar comprensión)
  nextRuleDelay: 300,   // Delay antes de habilitar siguiente regla
  pulseAnimation: 2000, // Duración de la animación de pulso
  completionDelay: 500  // Delay antes de marcar flujo como completo
} as const;