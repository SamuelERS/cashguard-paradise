// 🤖 [CTO] v3.1.2 - Configuración final de instrucciones con sistema anti-fraude
import type { Instruction } from '@/hooks/instructions/useInstructionFlow';

export const cashCountingInstructions: Instruction[] = [
  {
    id: 'confirmation',
    icon: 'ShieldCheck',
    title: 'Saca Los Cierres De Los POS',
    minReviewTimeMs: 3000
  },
  {
    id: 'counting',
    icon: 'Calculator',
    title: 'Muestra Tu Trabajo En La Cámara',
    minReviewTimeMs: 5000
  },
  {
    id: 'ordering',
    icon: 'Box',
    title: 'Ordena Cada Denominacion En Caja',
    minReviewTimeMs: 4000
  },
  {
    id: 'packaging',
    icon: 'PackagePlus',
    title: 'Monedas En Paquetes de 10 Unidades',
    minReviewTimeMs: 4000
  },
];