// > [CTO] v3.1.2 - Configuraci�n final de instrucciones con sistema anti-fraude
import type { Instruction } from '@/hooks/instructions/useInstructionFlow';

export const cashCountingInstructions: Instruction[] = [
  {
    id: 'confirmation',
    icon: 'ShieldCheck',
    title: ' Confirmaci�n Final',
    description: 'El valor no podr� modificarse.',
    minReviewTimeMs: 3000
  },
  {
    id: 'counting',
    icon: 'Calculator',
    title: '=" Conteo Seguro',
    description: 'Cuente sin tapar la c�mara.',
    minReviewTimeMs: 5000
  },
  {
    id: 'ordering',
    icon: 'Box',
    title: '=� Caja Ordenada',
    description: 'Coloque cada denominaci�n en su dep�sito.',
    minReviewTimeMs: 4000
  },
  {
    id: 'packaging',
    icon: 'PackagePlus',
    title: '=� Paquetes de Monedas',
    description: 'Agrupe las monedas en paquetes est�ndar.',
    minReviewTimeMs: 4000
  },
];