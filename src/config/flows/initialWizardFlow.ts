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
    title: 'Sin dispositivos electrónicos',
    subtitle: 'Conteo 100% manual',
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
    title: 'Conteo único',
    subtitle: 'Sin recuentos - verifica antes',
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
    title: 'Cajero ≠ Testigo',
    subtitle: 'Doble verificación',
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
    title: 'Sistema activo',
    subtitle: 'Detecta diferencias',
    Icon: AlertTriangle,
    colors: {
      text: 'text-orange-400',
      border: 'border-l-orange-400',
      glow: 'shadow-orange-400/20'
    },
    severity: 'warning'
  }
];

// 🤖 [IA] - Estados iniciales del flujo
export const createInitialRulesState = (): RulesFlowState => ({
  rules: protocolRules.reduce((acc, rule, index) => ({
    ...acc,
    [rule.id]: {
      isChecked: false,
      isEnabled: index === 0, // Solo la primera regla está habilitada inicialmente
      isBeingReviewed: false
    }
  }), {}),
  currentRuleIndex: 0,
  isFlowComplete: false
});

// 🤖 [IA] - Configuración de timing específica para el flujo guiado
export const RULES_FLOW_TIMING = {
  ruleReview: 800,      // Tiempo para mostrar estado "being reviewed"
  nextRuleDelay: 300,   // Delay antes de habilitar siguiente regla
  pulseAnimation: 2000, // Duración de la animación de pulso
  completionDelay: 500  // Delay antes de marcar flujo como completo
} as const;