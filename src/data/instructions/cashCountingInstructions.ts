// > [CTO] v3.1.2 - Configuración final de instrucciones con sistema anti-fraude
import type { Instruction } from '@/hooks/instructions/useInstructionFlow';

export const cashCountingInstructions: Instruction[] = [
  {
    id: 'confirmation',
    icon: 'ShieldCheck',
    title: ' Confirmación Final',
    description: 'El valor no podrá modificarse.',
    minReviewTimeMs: 3000
  },
  {
    id: 'counting',
    icon: 'Calculator',
    title: '=" Conteo Seguro',
    description: 'Cuente sin tapar la cámara.',
    minReviewTimeMs: 5000
  },
  {
    id: 'ordering',
    icon: 'Box',
    title: '=æ Caja Ordenada',
    description: 'Coloque cada denominación en su depósito.',
    minReviewTimeMs: 4000
  },
  {
    id: 'packaging',
    icon: 'PackagePlus',
    title: '=° Paquetes de Monedas',
    description: 'Agrupe las monedas en paquetes estándar.',
    minReviewTimeMs: 4000
  },
];