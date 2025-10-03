// [IA] - Arquitectura Guiada Basada en Datos v1.0 - InitialWizardFlow Configuration
// 🤖 [IA] - v1.2.38: Agregados iconos para Morning Count Protocol
// 🤖 [IA] - v1.2.41L: Coherencia iconográfica - RotateCcw y Users para Evening Cut
import {
  AlertTriangle,
  Shield,
  CheckCircle,
  MessageCircle,  // 💬 WhatsApp Web (Morning + Evening)
  Coins,          // 🪙 Verificación física (Morning)
  Calculator,     // 🧮 No calculadoras (Morning + Evening)
  BellRing,       // 🔔 Reporte anomalías (Morning)
  RotateCcw,      // 🔄 Si Fallan Repiten Corte (Evening)
  Users           // 👥 Cajero y Testigo Presentes (Evening)
} from 'lucide-react';

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

// 🤖 [IA] - EVENING CUT PROTOCOL - Protocolo para corte nocturno (InitialWizardModal)
// 🤖 [IA] - v1.2.41L: Coherencia iconográfica - iconos alineados con significado de cada regla
// 🤖 [IA] - v1.2.41M: Textos 2 líneas + reordenamiento lógico (prerequisitos → consecuencias)
const protocolRules: ProtocolRule[] = [
  {
    id: 'activeSystem',
    title: 'Cajero y Testigo Presentes',
    subtitle: 'Ambas personas deben estar durante todo el proceso',
    Icon: Users,  // 👥 Prerequisito: Personas requeridas
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
    subtitle: 'Mantener comunicación activa durante el conteo',
    Icon: MessageCircle,  // 💬 Preparación: Comunicación
    colors: {
      text: 'text-red-500',
      border: 'border-l-red-500',
      glow: 'shadow-red-500/20'
    },
    severity: 'critical'
  },
  {
    id: 'singleCount',
    title: 'No Usar Calculadoras',
    subtitle: 'Cálculos únicamente en la aplicación',
    Icon: Calculator,  // 🧮 Restricción: No herramientas externas
    colors: {
      text: 'text-red-500',
      border: 'border-l-red-500',
      glow: 'shadow-red-500/20'
    },
    severity: 'critical'
  },
  {
    id: 'noDevices',
    title: 'Si Fallan Repiten Corte',
    subtitle: 'El proceso debe reiniciarse desde cero',
    Icon: RotateCcw,  // 🔄 Consecuencia: Qué pasa si fallan
    colors: {
      text: 'text-orange-400',
      border: 'border-l-orange-400',
      glow: 'shadow-orange-400/20'
    },
    severity: 'warning'
  }
];

// 🤖 [IA] - v1.2.38: MORNING COUNT PROTOCOL - Protocolo para conteo matutino (MorningCountWizard)
// 🎨 [IA] - v1.2.39: Uniformidad total AZUL para máxima profesionalidad (estándar UX moderno)
const morningRules: ProtocolRule[] = [
  {
    id: 'whatsappReady',
    title: 'Abran WhatsApp Web',
    subtitle: 'Mantener comunicación activa durante el conteo',
    Icon: MessageCircle,
    colors: {
      text: 'text-blue-400',
      border: 'border-l-blue-400',
      glow: 'shadow-blue-400/20'
    },
    severity: 'warning'
  },
  {
    id: 'physicalVerification',
    title: 'Verifica Cada 🪙 y 💵',
    subtitle: 'Cada moneda en su casilla correspondiente',
    Icon: Coins,
    colors: {
      text: 'text-blue-400',
      border: 'border-l-blue-400',
      glow: 'shadow-blue-400/20'
    },
    severity: 'warning'
  },
  {
    id: 'noExternalTools',
    title: 'No Usar Calculadoras',
    subtitle: 'Cálculos únicamente en la aplicación',
    Icon: Calculator,
    colors: {
      text: 'text-blue-400',
      border: 'border-l-blue-400',
      glow: 'shadow-blue-400/20'
    },
    severity: 'warning'
  },
  {
    id: 'reportAnomalies',
    title: 'Reportar Anomalías',
    subtitle: 'Notificar cualquier diferencia inmediatamente',
    Icon: BellRing,
    colors: {
      text: 'text-blue-400',
      border: 'border-l-blue-400',
      glow: 'shadow-blue-400/20'
    },
    severity: 'warning'
  }
];

// [IA] - v3.0.0: Array dinámico para randomización elegante
export let currentProtocolRules: ProtocolRule[] = [...protocolRules];

// 🤖 [IA] - v1.2.38: Export para Morning Count Protocol
export let morningProtocolRules: ProtocolRule[] = [...morningRules];

// [IA] - v3.0.0: Función shuffle Fisher-Yates para aleatoriedad real
const shuffleRules = (rules: ProtocolRule[]): ProtocolRule[] => {
  const shuffled = [...rules];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// 🤖 [IA] - v3.1.0: Función desactivada - orden estático de reglas (Evening Cut)
export const shuffleProtocolRules = (): ProtocolRule[] => {
  // Mantener orden original sin aleatoriedad
  currentProtocolRules = [...protocolRules];
  return currentProtocolRules;
};

// 🤖 [IA] - v1.2.38: Función para Morning Count (sin randomización)
export const shuffleMorningRules = (): ProtocolRule[] => {
  // Mantener orden original sin aleatoriedad
  morningProtocolRules = [...morningRules];
  return morningProtocolRules;
};

// [IA] - v3.0.0: Export de reglas originales para compatibilidad
export const getOriginalProtocolRules = (): ProtocolRule[] => [...protocolRules];
export const getOriginalMorningRules = (): ProtocolRule[] => [...morningRules]; // 🤖 [IA] - v1.2.38

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

// 🤖 [IA] - v1.2.38: Estados iniciales para Morning Count Protocol
export const createInitialMorningRulesState = (): RulesFlowState => ({
  rules: morningProtocolRules.reduce((acc, rule, index) => ({
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
